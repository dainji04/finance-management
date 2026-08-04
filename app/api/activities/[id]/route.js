import connectMongo from '../../../lib/mongoose';
import { Activity } from '../../../lib/models';

export async function PUT(request, { params }) {
  const { id } = params;
  const body = await request.json();
  await connectMongo();
  const activity = await Activity.findByIdAndUpdate(id, body, { new: true });
  return new Response(JSON.stringify(activity), { status: 200 });
}

export async function DELETE(request, { params }) {
  const { id } = params;
  await connectMongo();
  await Activity.findByIdAndDelete(id);
  return new Response(null, { status: 204 });
}
