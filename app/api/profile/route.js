import connectMongo from '../../lib/mongoose';
import { Profile } from '../../lib/models';

export async function GET() {
  await connectMongo();
  const profile = await Profile.findOne().lean();
  return new Response(JSON.stringify(profile || {}), { status: 200 });
}

export async function POST(request) {
  const body = await request.json();
  await connectMongo();
  const profile = await Profile.findOneAndUpdate({}, body, { new: true, upsert: true });
  return new Response(JSON.stringify(profile), { status: 200 });
}
