export type CategoryDto = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
};
