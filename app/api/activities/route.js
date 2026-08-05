import connectMongo from '../../lib/mongoose';
import { Activity } from '../../lib/models';
import { getCurrentUserId } from '../../lib/auth';

export async function GET() {
  const userId = getCurrentUserId();
  if (!userId) return new Response(JSON.stringify({ message: 'Chưa đăng nhập' }), { status: 401 });
  await connectMongo();
  const activities = await Activity.find({ userId }).sort({ createdAt: -1 }).lean();
  return new Response(JSON.stringify(activities), { status: 200 });
}

export async function POST(request) {
  const userId = getCurrentUserId();
  if (!userId) return new Response(JSON.stringify({ message: 'Chưa đăng nhập' }), { status: 401 });
  const body = await request.json();
  await connectMongo();
  const activity = await Activity.create({ ...body, userId });
  return new Response(JSON.stringify(activity), { status: 201 });
}
