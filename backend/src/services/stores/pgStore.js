// PostgreSQL ombori (DATABASE_URL berilganda) — production uchun ishonchli saqlash.
// - Jadval va indekslar avtomatik yaratiladi (CREATE TABLE IF NOT EXISTS).
// - Har bir mahsulot raqamlash ketma-ketligi order_counters jadvalida, qator qulfi (FOR UPDATE) bilan:
//   bir nechta parallel so'rov yoki bir nechta server instansiyasida ham ID takrorlanmaydi.
// - Telegram "band qilish" bitta atomik UPDATE … WHERE status='pending' bilan — xabar ikki marta yuborilmaydi.
// - Birinchi ishga tushishda jadval bo'sh bo'lsa, mavjud data/orders.json dagi buyurtmalar import qilinadi
//   (JSON fayl o'chirilmaydi).
import pg from 'pg'
import { config } from '../../config/env.js'
import { formatOrderId, buildOrder, recoverSending } from './common.js'
import { readOrdersFile, normalizeState } from './jsonStore.js'

let pool = null

function sslOption(url) {
  const mode = config.databaseSsl
  if (mode === 'true') return { rejectUnauthorized: false }
  if (mode === 'false') return false
  try {
    const u = new URL(url)
    if (u.searchParams.get('sslmode') === 'disable') return false
    if (u.searchParams.get('sslmode') === 'require') return { rejectUnauthorized: false }
    // Render ichki manzili (masalan, dpg-xxxx-a) — nuqtasiz, SSL shart emas. Tashqi manzil — SSL.
    const host = u.hostname
    const local = ['localhost', '127.0.0.1', '::1'].includes(host) || !host.includes('.')
    return local ? false : { rejectUnauthorized: false }
  } catch {
    return false
  }
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS orders (
  id               text PRIMARY KEY,
  product_code     text NOT NULL,
  seq              integer,
  product          text,
  product_name     text,
  idempotency_key  text UNIQUE,
  name             text NOT NULL,
  phone            text NOT NULL,
  consent          jsonb NOT NULL DEFAULT '{}'::jsonb,
  utm              jsonb NOT NULL DEFAULT '{}'::jsonb,
  page             text,
  source           text,
  status           text NOT NULL DEFAULT 'new',
  created_at       timestamptz NOT NULL DEFAULT now(),
  telegram         jsonb NOT NULL,
  telegram_status  text NOT NULL DEFAULT 'pending'
);
CREATE UNIQUE INDEX IF NOT EXISTS orders_product_seq_uq ON orders (product_code, seq) WHERE seq IS NOT NULL;
CREATE INDEX IF NOT EXISTS orders_dedup_idx ON orders (product_code, phone, created_at DESC);
CREATE INDEX IF NOT EXISTS orders_tg_pending_idx ON orders (created_at) WHERE telegram_status <> 'sent';
CREATE TABLE IF NOT EXISTS order_counters (
  product_code text PRIMARY KEY,
  last_seq     integer NOT NULL DEFAULT 0
);
`

/** DB qatori → buyurtma obyekti (JSON ombordagi bilan bir xil shakl) */
function toOrder(r) {
  if (!r) return null
  return {
    id: r.id,
    seq: r.seq,
    product_code: r.product_code,
    product: r.product,
    product_name: r.product_name,
    idempotency_key: r.idempotency_key,
    name: r.name,
    phone: r.phone,
    consent: r.consent,
    utm: r.utm,
    page: r.page,
    source: r.source,
    status: r.status,
    created_at: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
    telegram: r.telegram,
    telegram_status: r.telegram_status
  }
}

async function insertOrder(client, o) {
  await client.query(
    `INSERT INTO orders (id, product_code, seq, product, product_name, idempotency_key, name, phone,
                         consent, utm, page, source, status, created_at, telegram, telegram_status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
     ON CONFLICT (id) DO NOTHING`,
    [
      o.id, o.product_code, o.seq, o.product, o.product_name, o.idempotency_key, o.name, o.phone,
      JSON.stringify(o.consent || {}), JSON.stringify(o.utm || {}), o.page, o.source, o.status || 'new',
      o.created_at, JSON.stringify(o.telegram), o.telegram_status || 'pending'
    ]
  )
}

/** Jadval bo'sh bo'lsa — JSON fayldagi buyurtmalarni import qiladi */
async function importFromJson(client) {
  const { rows } = await client.query('SELECT count(*)::int AS n FROM orders')
  if (rows[0].n > 0) return 0
  const parsed = await readOrdersFile(config.ordersFile)
  if (!parsed) return 0
  const { state } = normalizeState(parsed)
  if (!state.orders.length) return 0
  await client.query('BEGIN')
  try {
    for (const o of state.orders) await insertOrder(client, o)
    for (const [code, seq] of Object.entries(state.seq)) {
      await client.query(
        `INSERT INTO order_counters (product_code, last_seq) VALUES ($1, $2)
         ON CONFLICT (product_code) DO UPDATE SET last_seq = GREATEST(order_counters.last_seq, EXCLUDED.last_seq)`,
        [code, seq]
      )
    }
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  }
  return state.orders.length
}

export async function init() {
  pool = new pg.Pool({
    connectionString: config.databaseUrl,
    ssl: sslOption(config.databaseUrl),
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000
  })
  pool.on('error', (err) => console.error('[db] ulanish xatosi:', err.message))

  const client = await pool.connect()
  let imported = 0
  let recovered = 0
  try {
    await client.query(SCHEMA)
    imported = await importFromJson(client)
    // Jarayon yuborish paytida to'xtagan bo'lsa: sending → pending
    const { rows } = await client.query(`SELECT * FROM orders WHERE telegram::text LIKE '%"sending"%'`)
    for (const r of rows) {
      const o = toOrder(r)
      recovered += recoverSending(o)
      await client.query('UPDATE orders SET telegram = $2, telegram_status = $3 WHERE id = $1', [
        o.id, JSON.stringify(o.telegram), o.telegram_status
      ])
    }
  } finally {
    client.release()
  }
  if (imported) console.info(`[db] orders.json dan ${imported} ta buyurtma import qilindi (fayl o'chirilmadi)`)
  const { rows } = await pool.query('SELECT count(*)::int AS n FROM orders')
  return { total: rows[0].n, recovered, kind: 'postgres' }
}

export async function createOrder(input, { idempotencyKey, dedupWindowMs, notifyAdmin }) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const code = input.productCode

    // Mahsulot hisoblagichini qulflaymiz — shu mahsulotning parallel so'rovlari navbatga turadi
    await client.query('INSERT INTO order_counters (product_code, last_seq) VALUES ($1, 0) ON CONFLICT DO NOTHING', [code])
    const { rows: cnt } = await client.query('SELECT last_seq FROM order_counters WHERE product_code = $1 FOR UPDATE', [code])

    if (idempotencyKey) {
      const { rows } = await client.query('SELECT * FROM orders WHERE idempotency_key = $1', [idempotencyKey])
      if (rows[0]) {
        await client.query('COMMIT')
        return { order: toOrder(rows[0]), duplicate: true }
      }
    }
    if (dedupWindowMs > 0) {
      const { rows } = await client.query(
        `SELECT * FROM orders WHERE product_code = $1 AND phone = $2
           AND created_at > now() - ($3::int * interval '1 millisecond')
         ORDER BY created_at DESC LIMIT 1`,
        [code, input.phone, dedupWindowMs]
      )
      if (rows[0]) {
        await client.query('COMMIT')
        return { order: toOrder(rows[0]), duplicate: true }
      }
    }

    const seq = cnt[0].last_seq + 1
    const order = buildOrder(input, {
      id: formatOrderId(code, seq),
      seq,
      idempotencyKey,
      notifyAdmin,
      now: new Date().toISOString()
    })
    await client.query('UPDATE order_counters SET last_seq = $2 WHERE product_code = $1', [code, seq])
    await insertOrder(client, order)
    await client.query('COMMIT')
    return { order, duplicate: false }
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    // Bir xil Idempotency-Key bilan boshqa mahsulot tranzaksiyasi parallel yozgan bo'lsa
    if (err.code === '23505' && idempotencyKey) {
      const { rows } = await pool.query('SELECT * FROM orders WHERE idempotency_key = $1', [idempotencyKey])
      if (rows[0]) return { order: toOrder(rows[0]), duplicate: true }
    }
    throw err
  } finally {
    client.release()
  }
}

export async function updateTelegram(orderId, target, patch) {
  const { rows } = await pool.query(
    `UPDATE orders
        SET telegram = jsonb_set(telegram, ARRAY[$2::text], COALESCE(telegram -> $2::text, '{}'::jsonb) || $3::jsonb),
            telegram_status = CASE WHEN $2::text = 'group' AND ($3::jsonb ? 'status') THEN $3::jsonb ->> 'status'
                                   ELSE telegram_status END
      WHERE id = $1 AND telegram -> $2::text IS NOT NULL AND jsonb_typeof(telegram -> $2::text) = 'object'
      RETURNING *`,
    [orderId, target, JSON.stringify(patch)]
  )
  return toOrder(rows[0])
}

/** Atomik "band qilish": faqat status='pending' bo'lsa sending ga o'tkazadi va qatorni qaytaradi */
export async function claimTelegram(orderId, target, maxAttempts) {
  const { rows } = await pool.query(
    `UPDATE orders
        SET telegram = jsonb_set(
              telegram, ARRAY[$2::text],
              (telegram -> $2::text) || jsonb_build_object(
                'status', 'sending',
                'attempts', COALESCE((telegram -> $2::text ->> 'attempts')::int, 0) + 1,
                'last_attempt_at', $4::text)),
            telegram_status = CASE WHEN $2::text = 'group' THEN 'sending' ELSE telegram_status END
      WHERE id = $1
        AND telegram -> $2::text ->> 'status' = 'pending'
        AND COALESCE((telegram -> $2::text ->> 'attempts')::int, 0) < $3
      RETURNING *`,
    [orderId, target, maxAttempts, new Date().toISOString()]
  )
  return toOrder(rows[0])
}

export async function getOrder(orderId) {
  const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId])
  return toOrder(rows[0])
}

export async function listDue(now = Date.now()) {
  const { rows } = await pool.query(
    `SELECT id, product_code, telegram FROM orders
      WHERE telegram -> 'group' ->> 'status' = 'pending' OR telegram -> 'admin' ->> 'status' = 'pending'
      ORDER BY created_at LIMIT 200`
  )
  const due = []
  for (const r of rows) {
    for (const [name, t] of Object.entries(r.telegram || {})) {
      if (t && t.status === 'pending' && (!t.next_retry_at || Date.parse(t.next_retry_at) <= now)) {
        due.push({ orderId: r.id, target: name, productCode: r.product_code })
      }
    }
  }
  return due
}

export async function flush() {}

export async function close() {
  await pool?.end()
}
