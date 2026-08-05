import connectMongo from '../../lib/mongoose';
import { Income } from '../../lib/models';
import { getCurrentUserId } from '../../lib/auth';

export async function GET() {
  const userId = getCurrentUserId();
  if (!userId) return new Response(JSON.stringify({ message: 'Chưa đăng nhập' }), { status: 401 });
  await connectMongo();
  const incomes = await Income.find({ userId }).sort({ createdAt: -1 }).lean();
  return new Response(JSON.stringify(incomes), { status: 200 });
}

export async function POST(request) {
  const userId = getCurrentUserId();
  if (!userId) return new Response(JSON.stringify({ message: 'Chưa đăng nhập' }), { status: 401 });
  const body = await request.json();
  await connectMongo();
  const income = await Income.create({ ...body, userId });
  return new Response(JSON.stringify(income), { status: 201 });
}
