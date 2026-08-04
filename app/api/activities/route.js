import connectMongo from '../../lib/mongoose';
import { Activity } from '../../lib/models';

export async function GET() {
  await connectMongo();
  const activities = await Activity.find().sort({ createdAt: -1 }).lean();
  return new Response(JSON.stringify(activities), { status: 200 });
}

export async function POST(request) {
  const body = await request.json();
  await connectMongo();
  const activity = await Activity.create(body);
  return new Response(JSON.stringify(activity), { status: 201 });
}
