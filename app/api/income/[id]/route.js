import connectMongo from '../../../lib/mongoose';
import { Income } from '../../../lib/models';

export async function PUT(request, { params }) {
  const { id } = params;
  const body = await request.json();
  await connectMongo();
  const income = await Income.findByIdAndUpdate(id, body, { new: true });
  return new Response(JSON.stringify(income), { status: 200 });
}

export async function DELETE(request, { params }) {
  const { id } = params;
  await connectMongo();
  await Income.findByIdAndDelete(id);
  return new Response(null, { status: 204 });
}
