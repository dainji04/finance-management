import connectMongo from '../../lib/mongoose';
import { User } from '../../lib/models';
import { getCurrentUserId } from '../../lib/auth';

export async function GET() {
  const userId = getCurrentUserId();
  if (!userId) return new Response(JSON.stringify({ message: 'Chưa đăng nhập' }), { status: 401 });
  await connectMongo();
  const user = await User.findById(userId).lean();
  if (!user) return new Response(JSON.stringify({}), { status: 200 });
  return new Response(
    JSON.stringify({ displayName: user.displayName, name: user.name, email: user.email, phone: user.phone, balance: user.balance }),
    { status: 200 }
  );
}

export async function POST(request) {
  const userId = getCurrentUserId();
  if (!userId) return new Response(JSON.stringify({ message: 'Chưa đăng nhập' }), { status: 401 });
  const body = await request.json();
  await connectMongo();
  // Email is the login identifier and isn't editable through this form.
  const { displayName, name, phone, balance } = body;
  const user = await User.findByIdAndUpdate(userId, { displayName, name, phone, balance }, { new: true }).lean();
  return new Response(
    JSON.stringify({ displayName: user.displayName, name: user.name, email: user.email, phone: user.phone, balance: user.balance }),
    { status: 200 }
  );
}
