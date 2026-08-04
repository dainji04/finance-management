import connectMongo from '../../../lib/mongoose';
import { Debt } from '../../../lib/models';

export async function PUT(request, { params }) {
  const { id } = params;
  const body = await request.json();
  await connectMongo();
  const debt = await Debt.findByIdAndUpdate(id, body, { new: true });
  return new Response(JSON.stringify(debt), { status: 200 });
}

export async function DELETE(request, { params }) {
  const { id } = params;
  await connectMongo();
  await Debt.findByIdAndDelete(id);
  return new Response(null, { status: 204 });
}
