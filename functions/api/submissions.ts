import { z } from 'zod'

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first<T>(): Promise<T | null>
  run(): Promise<{ success: boolean }>
}

interface D1Database {
  prepare(query: string): D1PreparedStatement
}

interface Env {
  DB: D1Database
  TURNSTILE_SECRET_KEY?: string
}

interface PagesContext {
  request: Request
  env: Env
}

const submissionSchema = z.object({
  category: z.enum(['correction', 'broken-link', 'document-request', 'website-feedback']),
  subject: z.string().trim().min(5).max(120),
  details: z.string().trim().min(20).max(3000),
  sourceUrl: z.string().trim().url().or(z.literal('')),
  email: z.string().trim().email().or(z.literal('')),
  website: z.string().max(0),
  turnstileToken: z.string().optional(),
})

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { 'cache-control': 'no-store' } })
}

async function hash(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function verifyTurnstile(secret: string, token: string, ip: string): Promise<boolean> {
  const body = new FormData()
  body.set('secret', secret)
  body.set('response', token)
  body.set('remoteip', ip)
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body })
  const result = await response.json() as { success?: boolean }
  return result.success === true
}

export async function onRequestPost({ request, env }: PagesContext): Promise<Response> {
  if (!request.headers.get('content-type')?.includes('application/json')) return json({ message: 'Expected a JSON request.' }, 415)
  if (!env.DB) return json({ message: 'The submission service is not configured yet.' }, 503)

  let input: unknown
  try { input = await request.json() } catch { return json({ message: 'The request body is not valid JSON.' }, 400) }
  const parsed = submissionSchema.safeParse(input)
  if (!parsed.success) return json({ message: 'Review the form fields and try again.', issues: parsed.error.flatten().fieldErrors }, 400)

  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown'
  if (env.TURNSTILE_SECRET_KEY) {
    if (!parsed.data.turnstileToken || !(await verifyTurnstile(env.TURNSTILE_SECRET_KEY, parsed.data.turnstileToken, ip))) {
      return json({ message: 'Human verification failed. Please retry.' }, 400)
    }
  }

  const ipHash = await hash(ip)
  const recent = await env.DB.prepare("SELECT COUNT(*) AS count FROM submissions WHERE ip_hash = ? AND created_at > datetime('now', '-1 hour')")
    .bind(ipHash).first<{ count: number }>()
  if ((recent?.count ?? 0) >= 5) return json({ message: 'Too many recent submissions. Please try again later.' }, 429)

  const id = crypto.randomUUID()
  const result = await env.DB.prepare(`
    INSERT INTO submissions (id, category, subject, details, source_url, contact_email, ip_hash, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending_verification')
  `).bind(id, parsed.data.category, parsed.data.subject, parsed.data.details, parsed.data.sourceUrl || null, parsed.data.email || null, ipHash).run()
  if (!result.success) return json({ message: 'The submission could not be saved.' }, 500)

  return json({ id, message: 'Your submission was saved for moderator review.' }, 201)
}

export function onRequest(): Response {
  return json({ message: 'Method not allowed.' }, 405)
}
