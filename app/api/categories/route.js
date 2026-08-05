import connectMongo from '../../lib/mongoose';
import { Category } from '../../lib/models';
import { getCurrentUserId } from '../../lib/auth';

export async function GET() {
  const userId = getCurrentUserId();
  if (!userId) return new Response(JSON.stringify({ message: 'Chưa đăng nhập' }), { status: 401 });
  await connectMongo();
  const categories = await Category.find({ userId }).sort({ createdAt: -1 }).lean();
  return new Response(JSON.stringify(categories), { status: 200 });
}

export async function POST(request) {
  const userId = getCurrentUserId();
  if (!userId) return new Response(JSON.stringify({ message: 'Chưa đăng nhập' }), { status: 401 });
  const body = await request.json();
  await connectMongo();
  const category = await Category.create({ ...body, userId });
  return new Response(JSON.stringify(category), { status: 201 });
}
