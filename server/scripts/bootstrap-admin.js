import bcrypt from 'bcryptjs';
import { env } from '../src/config/env.js';
import { connectDB, disconnectDB } from '../src/config/database.js';
import { User } from '../src/models/User.js';
import { logger } from '../src/utils/logger.js';

async function bootstrapIdentities() {
  console.log('--- FORME Identity Bootstrap CLI ---');
  await connectDB();

  // 1. Admin Account
  const adminEmail = env.ADMIN_BOOTSTRAP_EMAIL.toLowerCase().trim();
  const adminPassword = env.ADMIN_BOOTSTRAP_PASSWORD;
  const adminName = env.ADMIN_BOOTSTRAP_NAME;

  const salt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash(adminPassword, salt);

  const adminUser = await User.findOneAndUpdate(
    { email: adminEmail },
    {
      email: adminEmail,
      passwordHash: adminHash,
      name: adminName,
      role: 'admin',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`✓ Admin Identity Configured: ${adminUser.email} (Role: ${adminUser.role})`);

  // 2. Demo Customer Account
  const customerEmail = 'customer@forme-studio.com';
  const customerPassword = 'CustomerDemo2026!';
  const customerHash = await bcrypt.hash(customerPassword, salt);

  const customerUser = await User.findOneAndUpdate(
    { email: customerEmail },
    {
      email: customerEmail,
      passwordHash: customerHash,
      name: 'Aarav Patel',
      role: 'customer',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`✓ Customer Identity Configured: ${customerUser.email} (Role: ${customerUser.role})`);
  console.log('------------------------------------');

  await disconnectDB();
}

bootstrapIdentities().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
