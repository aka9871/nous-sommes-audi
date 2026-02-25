export type AssetType = 'IMAGE' | 'PDF' | 'VIDEO' | 'VIDEO_TIKTOK' | 'VIDEO_FB' | 'VIDEO_INSTAGRAM' | 'VIDEO_TV' | 'VIDEO_IPAD';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  url: string;
  thumbnail?: string;
  description?: string;
}

export interface Folder {
  id: string;
  name: string;
  subfolders?: Folder[];
  assets?: Asset[];
}
