export type Company = {
  id: string;
  name: string;
  slug: string;
  description: string;
  size: string;
  founder: string;
  website?: string | null;
  industry?: string | null;
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type ICompany = {
  name: string;
  slug: string;
  description: string;
  size: string;
  founder: string;
  website?: string | null;
  industry?: string | null;
};
