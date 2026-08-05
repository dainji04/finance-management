import mongoose from 'mongoose';

const { Schema, models, model } = mongoose;

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  displayName: { type: String, default: 'Bạn' },
  name: { type: String, default: '' },
  phone: { type: String, default: '' },
  balance: { type: Number, default: 0 }
}, { timestamps: true });

const CategorySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true },
  color: { type: String, default: '#2563eb' },
  budget: { type: Number, default: 0 }
}, { timestamps: true });

const ExpenseSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  amount: { type: Number, required: true },
  note: { type: String, default: '' }
}, { timestamps: true });

const IncomeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  note: { type: String, default: '' },
  person: { type: String, default: '' },
  relatedDebtId: { type: Schema.Types.ObjectId, ref: 'Debt', default: null }
}, { timestamps: true });

const DebtSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, required: true },
  person: { type: String, required: true },
  amount: { type: Number, required: true },
  note: { type: String, default: '' },
  date: { type: String, required: true }
}, { timestamps: true });

const ActivitySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, required: true },
  session: { type: String, required: true },
  date: { type: String, required: true },
  note: { type: String, default: '' }
}, { timestamps: true });

const User = models.User || model('User', UserSchema);
const Category = models.Category || model('Category', CategorySchema);
const Expense = models.Expense || model('Expense', ExpenseSchema);
const Income = models.Income || model('Income', IncomeSchema);
const Debt = models.Debt || model('Debt', DebtSchema);
const Activity = models.Activity || model('Activity', ActivitySchema);

export { User, Category, Expense, Income, Debt, Activity };
