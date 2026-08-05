import connectMongo from '../../../lib/mongoose';
import { Category } from '../../../lib/models';
import { getCurrentUserId } from '../../../lib/auth';

export async function PUT(request, { params }) {
  const userId = getCurrentUserId();
  if (!userId) return new Response(JSON.stringify({ message: 'Chưa đăng nhập' }), { status: 401 });
  const { id } = params;
  const body = await request.json();
  await connectMongo();
  const category = await Category.findOneAndUpdate({ _id: id, userId }, body, { new: true });
  if (!category) return new Response(JSON.stringify({ message: 'Không tìm thấy danh mục' }), { status: 404 });
  return new Response(JSON.stringify(category), { status: 200 });
}

export async function DELETE(request, { params }) {
  const userId = getCurrentUserId();
  if (!userId) return new Response(JSON.stringify({ message: 'Chưa đăng nhập' }), { status: 401 });
  const { id } = params;
  await connectMongo();
  await Category.findOneAndDelete({ _id: id, userId });
  return new Response(null, { status: 204 });
}
