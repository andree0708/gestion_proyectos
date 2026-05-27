import prisma from '../config/db.js';

export interface SearchQuery {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minQuantity?: number;
  unit?: string;
  country?: string;
  department?: string;
  page?: number;
  limit?: number;
}

export const searchListings = async (query: SearchQuery) => {
  const { search, categoryId, minPrice, maxPrice, minQuantity, unit, country, department, page = 1, limit = 20 } = query;

  const where: any = { status: 'active' };
  const andFilters: any[] = [];

  if (search) {
    andFilters.push({
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  if (categoryId) where.categoryId = categoryId;
  if (minPrice !== undefined) where.priceAmount = { ...where.priceAmount, gte: minPrice };
  if (maxPrice !== undefined) where.priceAmount = { ...where.priceAmount, lte: maxPrice };
  if (minQuantity !== undefined) where.quantity = { gte: minQuantity };
  if (unit) where.unit = unit;
  if (country) where.organization = { country: { contains: country, mode: 'insensitive' } };

  if (department) {
    andFilters.push({
      OR: [
        { allowedDepartments: { has: department } },
        { AND: [{ allowedDepartments: { equals: [] } }, { originDepartment: department }] },
        { AND: [{ logisticsType: 'ambient' }, { allowedDepartments: { equals: [] } }] },
      ],
    });
  }

  if (andFilters.length > 0) {
    where.AND = andFilters;
  }

  const [total, listings] = await Promise.all([
    prisma.listing.count({ where }),
    prisma.listing.findMany({
      where,
      include: {
        category: true,
        organization: { select: { id: true, name: true, kybStatus: true, country: true, department: true, city: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    listings,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getListingsMap = async () => {
  return prisma.listing.findMany({
    where: { status: 'active' },
    select: {
      id: true,
      title: true,
      quantity: true,
      unit: true,
      priceAmount: true,
      category: { select: { name: true } },
      organization: { select: { name: true, country: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 500,
  });
};

export const getFeaturedCategories = async () => {
  const categories = await prisma.category.findMany({
    where: { level: 1 },
    include: {
      _count: { select: { listings: { where: { status: 'active' } } } },
    },
    orderBy: { name: 'asc' },
  });

  return categories.filter(c => c._count.listings > 0);
};