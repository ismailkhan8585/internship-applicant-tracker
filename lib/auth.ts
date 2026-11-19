import { SignJWT, jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
)

export async function createAdminToken(): Promise<string> {
  return new SignJWT({ role: 'admin', email: process.env.GMAIL_USER_EMAIL })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET)
}

export async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload
  } catch {
    return null
  }
}

export async function getAdminFromRequest(request: Request) {
  const cookieHeader = request.headers.get('cookie') || ''
  const tokenMatch = cookieHeader.match(/admin_token=([^;]+)/)
  if (!tokenMatch) return null
  return verifyAdminToken(tokenMatch[1])
}

export function setAuthCookie(response: Response, token: string) {
  response.headers.set(
    'Set-Cookie',
    `admin_token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
  )
}
