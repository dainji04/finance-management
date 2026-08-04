import connectMongo from '../../lib/mongoose';
import { Income } from '../../lib/models';

export async function GET() {
  await connectMongo();
  const incomes = await Income.find().sort({ createdAt: -1 }).lean();
  return new Response(JSON.stringify(incomes), { status: 200 });
}

export async function POST(request) {
  const body = await request.json();
  await connectMongo();
  const income = await Income.create(body);
  return new Response(JSON.stringify(income), { status: 201 });
}
