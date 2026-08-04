import connectMongo from '../../lib/mongoose';
import { Expense } from '../../lib/models';

export async function GET() {
  await connectMongo();
  const expenses = await Expense.find().sort({ createdAt: -1 }).lean();
  return new Response(JSON.stringify(expenses), { status: 200 });
}

export async function POST(request) {
  const body = await request.json();
  await connectMongo();
  const expense = await Expense.create(body);
  return new Response(JSON.stringify(expense), { status: 201 });
}
