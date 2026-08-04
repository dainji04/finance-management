import connectMongo from '../../lib/mongoose';
import { Debt } from '../../lib/models';

export async function GET() {
  await connectMongo();
  const debts = await Debt.find().sort({ createdAt: -1 }).lean();
  return new Response(JSON.stringify(debts), { status: 200 });
}

export async function POST(request) {
  const body = await request.json();
  await connectMongo();
  const debt = await Debt.create(body);
  return new Response(JSON.stringify(debt), { status: 201 });
}
