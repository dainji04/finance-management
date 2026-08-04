import mongoose from 'mongoose';

const { Schema, models, model } = mongoose;

const CategorySchema = new Schema({
  name: { type: String, required: true },
  color: { type: String, default: '#2563eb' },
  budget: { type: Number, default: 0 }
}, { timestamps: true });

const ExpenseSchema = new Schema({
  date: { type: String, required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  amount: { type: Number, required: true },
  note: { type: String, default: '' }
}, { timestamps: true });

const IncomeSchema = new Schema({
  type: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  note: { type: String, default: '' }
}, { timestamps: true });

const DebtSchema = new Schema({
  type: { type: String, required: true },
  person: { type: String, required: true },
  amount: { type: Number, required: true },
  note: { type: String, default: '' },
  date: { type: String, required: true }
}, { timestamps: true });

const ProfileSchema = new Schema({
  displayName: { type: String, default: 'Bạn' },
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' }
}, { timestamps: true });

const ActivitySchema = new Schema({
  type: { type: String, required: true },
  session: { type: String, required: true },
  date: { type: String, required: true },
  note: { type: String, default: '' }
}, { timestamps: true });

const Category = models.Category || model('Category', CategorySchema);
const Expense = models.Expense || model('Expense', ExpenseSchema);
const Income = models.Income || model('Income', IncomeSchema);
const Debt = models.Debt || model('Debt', DebtSchema);
const Profile = models.Profile || model('Profile', ProfileSchema);
const Activity = models.Activity || model('Activity', ActivitySchema);

export { Category, Expense, Income, Debt, Profile, Activity };
