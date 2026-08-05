import connectMongo from '../../lib/mongoose';
import { Category, Expense, Income, Debt, Activity, User } from '../../lib/models';
import { getCurrentUserId } from '../../lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const userId = getCurrentUserId();
  if (!userId) {
    return new Response(JSON.stringify({ message: 'Chưa đăng nhập' }), { status: 401 });
  }

  await connectMongo();
  const [categories, expenses, incomes, debts, activities, user] = await Promise.all([
    Category.find({ userId }).sort({ createdAt: -1 }).lean(),
    Expense.find({ userId }).sort({ createdAt: -1 }).lean(),
    Income.find({ userId }).sort({ createdAt: -1 }).lean(),
    Debt.find({ userId }).sort({ createdAt: -1 }).lean(),
    Activity.find({ userId }).sort({ createdAt: -1 }).lean(),
    User.findById(userId).lean()
  ]);

  const profile = user
    ? { displayName: user.displayName, name: user.name, email: user.email, phone: user.phone, balance: user.balance }
    : { displayName: 'Bạn', name: '', email: '', phone: '', balance: 0 };

  return new Response(JSON.stringify({ categories, expenses, incomes, debts, activities, profile }), { status: 200 });
}
