import bcrypt from 'bcryptjs';
import connectMongo from '../../../lib/mongoose';
import { User } from '../../../lib/models';
import { signToken, setAuthCookie } from '../../../lib/auth';

export async function POST(request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return new Response(JSON.stringify({ message: 'Vui lòng nhập email và mật khẩu' }), { status: 400 });
  }

  await connectMongo();

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return new Response(JSON.stringify({ message: 'Email hoặc mật khẩu không đúng' }), { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return new Response(JSON.stringify({ message: 'Email hoặc mật khẩu không đúng' }), { status: 401 });
  }

  const token = signToken({ userId: String(user._id) });
  setAuthCookie(token);

  return new Response(
    JSON.stringify({ id: String(user._id), email: user.email, displayName: user.displayName }),
    { status: 200 }
  );
}
