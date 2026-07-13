import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { User } from './models/User.js';
import bcrypt from 'bcryptjs';

const seedAdminUser = async () => {
  try {
    const adminEmail = env.seedAdminEmail;
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      console.log('Seeding default administrator account...');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(env.seedAdminPassword, salt);

      await User.create({
        name: env.seedAdminName,
        email: adminEmail,
        passwordHash,
        role: 'admin',
        isActive: true,
        emailVerified: true
      });
      console.log(`Administrator account created successfully: ${adminEmail}`);
    } else {
      console.log('Administrator account already exists. Skipping seed.');
    }
  } catch (error) {
    console.error('Failed to seed administrator account:', error.message);
  }
};

const startServer = async () => {
  // 1. Database Connection
  await connectDB();

  // 2. Seed Administrator
  await seedAdminUser();

  // 3. Listen
  const server = app.listen(env.port, () => {
    console.log(`HealthRadius Server running in ${env.nodeEnv} mode on port ${env.port}`);
  });

  // Handle unhandled rejections/exceptions
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection Error: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

startServer();
