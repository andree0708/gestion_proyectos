export interface Listing {
  id: string;
  orgId: string;
  categoryId: string;
  title: string;
  description: string | null;
  quantity: number;
  unit: string;
  priceType: 'fixed' | 'negotiate';
  priceAmount: number | null;
  attributes: any;
  status: 'draft' | 'pending_review' | 'active' | 'rejected';
  photos: string[];
  technicalSheetUrl: string | null;
  originDepartment?: string | null;
  originCity?: string | null;
  logisticsType?: string | null;
  shelfLifeDays?: number | null;
  deliveryModes?: string[];
  allowedDepartments?: string[];
  createdAt: string;
  category?: Category;
  organization?: {
    id: string;
    name: string;
    kybStatus: string;
    country?: string;
    department?: string;
    city?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  level: number;
  slug: string;
  children?: Category[];
}

export interface CreateListingDto {
  categoryId: string;
  title: string;
  description?: string;
  quantity: number;
  unit: string;
  priceType: 'fixed' | 'negotiate';
  priceAmount?: number;
  attributes?: any;
  photos?: string[];
  technicalSheetUrl?: string;
  originDepartment?: string;
  originCity?: string;
  logisticsType?: string;
  shelfLifeDays?: number;
  deliveryModes?: string[];
  allowedDepartments?: string[];
}