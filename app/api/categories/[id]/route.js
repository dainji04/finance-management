import connectMongo from '../../../lib/mongoose';
import { Category } from '../../../lib/models';

export async function PUT(request, { params }) {
  const { id } = params;
  const body = await request.json();
  await connectMongo();
  const category = await Category.findByIdAndUpdate(id, body, { new: true });
  return new Response(JSON.stringify(category), { status: 200 });
}

export async function DELETE(request, { params }) {
  const { id } = params;
  await connectMongo();
  await Category.findByIdAndDelete(id);
  return new Response(null, { status: 204 });
}
