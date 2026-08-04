import mongoose from 'mongoose';

const uri = process.env.MONGO_DB;
if (!uri) {
  throw new Error('Missing MONGO_DB environment variable. Please add it to .env');
}

const globalWithMongoose = globalThis;
const cached = globalWithMongoose._mongoose || (globalWithMongoose._mongoose = { conn: null, promise: null });

async function connectMongo() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    mongoose.set('strictQuery', false);
    cached.promise = mongoose.connect(uri).then((mongooseInstance) => mongooseInstance);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectMongo;
