import bcrypt from 'bcryptjs';
import connectMongo from '../../../lib/mongoose';
import { User, Category, Expense, Income, Debt, Activity } from '../../../lib/models';
import { signToken, setAuthCookie } from '../../../lib/auth';

export async function POST(request) {
  const { email, password, displayName } = await request.json();

  if (!email || !password) {
    return new Response(JSON.stringify({ message: 'Vui lòng nhập email và mật khẩu' }), { status: 400 });
  }
  if (password.length < 6) {
    return new Response(JSON.stringify({ message: 'Mật khẩu cần tối thiểu 6 ký tự' }), { status: 400 });
  }

  await connectMongo();

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return new Response(JSON.stringify({ message: 'Email đã được sử dụng' }), { status: 409 });
  }

  const isFirstUser = (await User.countDocuments()) === 0;
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    email: normalizedEmail,
    passwordHash,
    displayName: displayName || normalizedEmail.split('@')[0]
  });

  if (isFirstUser) {
    // Claim any legacy data created before multi-user support existed.
    await Promise.all([
      Category.updateMany({ userId: { $exists: false } }, { $set: { userId: user._id } }),
      Expense.updateMany({ userId: { $exists: false } }, { $set: { userId: user._id } }),
      Income.updateMany({ userId: { $exists: false } }, { $set: { userId: user._id } }),
      Debt.updateMany({ userId: { $exists: false } }, { $set: { userId: user._id } }),
      Activity.updateMany({ userId: { $exists: false } }, { $set: { userId: user._id } })
    ]);
  }

  const token = signToken({ userId: String(user._id) });
  setAuthCookie(token);

  return new Response(
    JSON.stringify({ id: String(user._id), email: user.email, displayName: user.displayName }),
    { status: 201 }
  );
}
