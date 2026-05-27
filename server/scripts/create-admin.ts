import prisma from '../src/config/db.js';
import bcrypt from 'bcryptjs';

export const createDefaultAdmin = async () => {
  const adminEmail = 'admin@subpro.com';
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('Admin already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash('admin123', 12);

  const org = await prisma.organization.create({
    data: {
      name: 'SubPro Admin',
      taxId: '000000000',
      country: 'Colombia',
      sector: 'Tecnología',
      kybStatus: 'approved',
    },
  });

  await prisma.user.create({
    data: {
      orgId: org.id,
      email: adminEmail,
      password: hashedPassword,
      fullName: 'Administrator',
      role: 'admin',
    },
  });

  console.log('Admin created: admin@subpro.com / admin123');
};

createDefaultAdmin()
  .catch(console.error)
  .finally(() => process.exit(0));