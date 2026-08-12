import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'sehatbridge';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: MONGODB_DB_NAME,
    };

    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  // Register all models to prevent MissingSchemaError in Next.js hot reload
  require('@/models/Patient');
  require('@/models/Case');
  require('@/models/User');
  require('@/models/Document');
  require('@/models/DoctorDecision');
  require('@/models/Clinic');
  require('@/models/FollowUp');
  require('@/models/Referral');

  return cached.conn;
}

export default connectToDatabase;
