import connectMongo from '../../../lib/mongoose';
import { Expense } from '../../../lib/models';

export async function PUT(request, { params }) {
  const { id } = params;
  const body = await request.json();
  await connectMongo();
  const expense = await Expense.findByIdAndUpdate(id, body, { new: true });
  return new Response(JSON.stringify(expense), { status: 200 });
}

export async function DELETE(request, { params }) {
  const { id } = params;
  await connectMongo();
  await Expense.findByIdAndDelete(id);
  return new Response(null, { status: 204 });
}
