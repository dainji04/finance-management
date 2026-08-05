import connectMongo from '../../lib/mongoose';
import { Debt } from '../../lib/models';
import { getCurrentUserId } from '../../lib/auth';

export async function GET() {
  const userId = getCurrentUserId();
  if (!userId) return new Response(JSON.stringify({ message: 'Chưa đăng nhập' }), { status: 401 });
  await connectMongo();
  const debts = await Debt.find({ userId }).sort({ createdAt: -1 }).lean();
  return new Response(JSON.stringify(debts), { status: 200 });
}

export async function POST(request) {
  const userId = getCurrentUserId();
  if (!userId) return new Response(JSON.stringify({ message: 'Chưa đăng nhập' }), { status: 401 });
  const body = await request.json();
  await connectMongo();
  const debt = await Debt.create({ ...body, userId });
  return new Response(JSON.stringify(debt), { status: 201 });
}
