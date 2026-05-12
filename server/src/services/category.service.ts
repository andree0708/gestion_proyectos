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
  if (existing > 0) {
    return;
  }

  const categories = [
    { name: 'Harinas y Subproductos de Trigo', slug: 'harinas-trigo', level: 1 },
    { name: 'Residuos de Frutas y Verduras', slug: 'frutas-verduras', level: 1 },
    { name: 'Subproductos Lácteos', slug: 'subproductos-lacteos', level: 1 },
    { name: 'Grasas y Aceites Usados', slug: 'grasas-aceites', level: 1 },
    { name: 'Envases y Embalajes', slug: 'envases-embalajes', level: 1 },
    { name: 'Carnes y Subproductos Cárnicos', slug: 'carnes-subproductos', level: 1 },
    { name: 'Salvado de Trigo', slug: 'salvado-trigo', level: 2, parent: 'harinas-trigo' },
    { name: 'Harina de Maíz', slug: 'harina-maiz', level: 2, parent: 'harinas-trigo' },
    { name: 'Cascarón de Arroz', slug: 'cascaron-arroz', level: 2, parent: 'harinas-trigo' },
    { name: 'Pulpa de Fruta', slug: 'pulpa-fruta', level: 2, parent: 'frutas-verduras' },
    { name: 'Residuos de Vegetales', slug: 'residuos-vegetales', level: 2, parent: 'frutas-verduras' },
    { name: 'Suero de Leche', slug: 'suero-leche', level: 2, parent: 'subproductos-lacteos' },
    { name: 'Requesón y Ricota', slug: 'requeson-ricota', level: 2, parent: 'subproductos-lacteos' },
    { name: 'Grasa Animal', slug: 'grasa-animal', level: 2, parent: 'grasas-aceites' },
    { name: 'Aceite de Frittura', slug: 'aceite-frittura', level: 2, parent: 'grasas-aceites' },
    { name: 'Cartón para Alimentos', slug: 'carton-alimentos', level: 2, parent: 'envases-embalajes' },
    { name: 'Plástico Alimentario', slug: 'plastico-alimentario', level: 2, parent: 'envases-embalajes' },
    { name: 'Huesos y Cartílagos', slug: 'huesos-cartilagos', level: 2, parent: 'carnes-subproductos' },
    { name: 'Sangre Seca', slug: 'sangre-seca', level: 2, parent: 'carnes-subproductos' },
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