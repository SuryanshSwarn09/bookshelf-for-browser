export interface Bookmark {
  id: string;
  url: string;
  title: string;
  iconUrl: string;
  customIconUrl?: string;
  createdAt: number;
  category?: string;
}
