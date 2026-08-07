export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  ogImage?: string;
  favicon?: string;
  folderId?: string;
  userId: string;
  createdAt: string;
}

export interface Folder {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  parentId?: string;
  userId: string;
  children?: Folder[];
}

export interface ScrapedMetadata {
  title: string;
  description?: string;
  ogImage?: string;
  favicon?: string;
}
