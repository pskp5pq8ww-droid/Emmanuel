export type Client = {
  id: string;
  name: string;
  email: string | null;
  username: string | null;
  pinHash: string;
  createdAt: string;
};

export type Gallery = {
  id: string;
  clientId: string;
  title: string;
  slug: string;
  eventDate: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
};

export type GalleryImage = {
  id: string;
  galleryId: string;
  filename: string;
  path: string;
  size: number;
  createdAt: string;
};

export type DBShape = {
  clients: Client[];
  galleries: Gallery[];
  galleryImages: GalleryImage[];
};
