import { clearAuthCookie } from '../../../lib/auth';

export async function POST() {
  clearAuthCookie();
  return new Response(null, { status: 204 });
}
