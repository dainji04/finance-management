import connectMongo from '../../lib/mongoose';
import { Category, Expense, Income, Debt, Profile, Activity } from '../../lib/models';

export const dynamic = 'force-dynamic';

export async function GET() {
  await connectMongo();
  const [categories, expenses, incomes, debts, activities, profile] = await Promise.all([
    Category.find().sort({ createdAt: -1 }).lean(),
    Expense.find().sort({ createdAt: -1 }).lean(),
    Income.find().sort({ createdAt: -1 }).lean(),
    Debt.find().sort({ createdAt: -1 }).lean(),
    Activity.find().sort({ createdAt: -1 }).lean(),
    Profile.findOne().lean()
  ]);

  return new Response(JSON.stringify({ categories, expenses, incomes, debts, activities, profile: profile || { displayName: 'Bạn', name: '', email: '', phone: '' } }), { status: 200 });
}
