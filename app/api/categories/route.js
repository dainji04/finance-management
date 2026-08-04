import connectMongo from '../../lib/mongoose';
import { Category } from '../../lib/models';

export async function GET() {
  await connectMongo();
  const categories = await Category.find().sort({ createdAt: -1 }).lean();
  return new Response(JSON.stringify(categories), { status: 200 });
}

export async function POST(request) {
  const body = await request.json();
  await connectMongo();
  const category = await Category.create(body);
  return new Response(JSON.stringify(category), { status: 201 });
}
