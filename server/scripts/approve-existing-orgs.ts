import prisma from '../src/config/db.js';

async function approveExistingOrgs() {
  const result = await prisma.organization.updateMany({
    where: { kybStatus: 'pending' },
    data: { kybStatus: 'approved' },
  });
  console.log(`Organizaciones actualizadas a "approved": ${result.count}`);
}

approveExistingOrgs()
  .catch(console.error)
  .finally(() => process.exit(0));
