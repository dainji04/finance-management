import connectMongo from '../../../lib/mongoose';
import { Activity } from '../../../lib/models';
import { getCurrentUserId } from '../../../lib/auth';

export async function PUT(request, { params }) {
  const userId = getCurrentUserId();
  if (!userId) return new Response(JSON.stringify({ message: 'Chưa đăng nhập' }), { status: 401 });
  const { id } = params;
  const body = await request.json();
  await connectMongo();
  const activity = await Activity.findOneAndUpdate({ _id: id, userId }, body, { new: true });
  if (!activity) return new Response(JSON.stringify({ message: 'Không tìm thấy hoạt động' }), { status: 404 });
  return new Response(JSON.stringify(activity), { status: 200 });
}

export async function DELETE(request, { params }) {
  const userId = getCurrentUserId();
  if (!userId) return new Response(JSON.stringify({ message: 'Chưa đăng nhập' }), { status: 401 });
  const { id } = params;
  await connectMongo();
  await Activity.findOneAndDelete({ _id: id, userId });
  return new Response(null, { status: 204 });
}
