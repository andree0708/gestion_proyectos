import prisma from '../config/db.js';

export const getAllCategories = async () => {
  return prisma.category.findMany({
    orderBy: [{ level: 'asc' }, { name: 'asc' }],
  });
};

export const getCategoryById = async (id: string) => {
  return prisma.category.findUnique({
    where: { id },
    include: { children: true, parent: true },
  });
};

export const createCategory = async (data: { name: string; parentId?: string; level: number; slug: string }) => {
  return prisma.category.create({ data });
};

export const seedCategories = async () => {
  const existing = await prisma.category.count();
  if (existing > 0) return;

  const categories = [
    { name: 'Residuos Metálicos', slug: 'residuos-metalicos', level: 1 },
    { name: 'Residuos Plásticos', slug: 'residuos-plasticos', level: 1 },
    { name: 'Residuos Orgánicos', slug: 'residuos-organicos', level: 1 },
    { name: 'Residuos Electrónicos', slug: 'residuos-electronicos', level: 1 },
    { name: 'Escombros y Materiales de Construcción', slug: 'escombros-construccion', level: 1 },
    { name: 'Lodos y Residuos Líquidos', slug: 'lodos-residuos-liquidos', level: 1 },
    { name: 'Chatarra de Hierro', slug: 'chatarra-hierro', level: 2, parent: 'residuos-metalicos' },
    { name: 'Chatarra de Cobre', slug: 'chatarra-cobre', level: 2, parent: 'residuos-metalicos' },
    { name: 'Chatarra de Aluminum', slug: 'chatarra-aluminio', level: 2, parent: 'residuos-metalicos' },
    { name: 'PET Reciclable', slug: 'pet-reciclable', level: 2, parent: 'residuos-plasticos' },
    { name: 'HDPE Reciclable', slug: 'hdpe-reciclable', level: 2, parent: 'residuos-plasticos' },
    { name: 'Polipropileno', slug: 'polipropileno', level: 2, parent: 'residuos-plasticos' },
  ];

  const parentMap = new Map<string, string>();
  const created = new Map<string, string>();

  for (const cat of categories) {
    const createdCat = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        level: cat.level,
        parentId: cat.parent ? parentMap.get(cat.parent) : null,
      },
    });
    created.set(cat.slug, createdCat.id);
    if (cat.parent) parentMap.set(cat.parent, createdCat.id);
  }
};