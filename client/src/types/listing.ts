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
  createdAt: string;
  category?: Category;
  organization?: {
    id: string;
    name: string;
    kybStatus: string;
    country?: string;
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
}