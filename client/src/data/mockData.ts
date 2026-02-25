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

export const directoryStructure: Folder[] = [
  {
    id: "1",
    name: "Communication territory - Nous Sommes Audi",
    subfolders: [
      { id: "1.1", name: "360 territory", assets: [
        { id: "a1", name: "Hero Visual", type: "IMAGE", url: "https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?q=80&w=2074&auto=format&fit=crop", description: "Le visuel clé de la campagne 360 pour Nous Sommes Audi." },
        { id: "a2", name: "Spot TV 30s", type: "VIDEO_TV", url: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4", description: "Le spot TV principal de 30 secondes." }
      ] },
      { id: "1.2", name: "Focus Digital tone of voice", assets: [
        { id: "a3", name: "TikTok Trend", type: "VIDEO_TIKTOK", url: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4", description: "Activation TikTok avec créateurs de contenu." },
        { id: "a4", name: "Guidelines Digital", type: "PDF", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" }
      ] }
    ]
  },
  { id: "2", name: "F1 creative activations", assets: [] },
  { id: "3", name: "Audi Q3 creative campaign", assets: [] },
  { id: "4", name: "RS5 creative activations", assets: [] },
  { id: "5", name: "Paris Motor Show creative activations", assets: [] },
  { id: "6", name: "Audi Business Activations", assets: [] },
  { id: "7", name: "myAudi creative activations", subfolders: [
    { id: "7.1", name: "myAudi main activations", assets: [] },
    { id: "7.2", name: "Driving experience activations", assets: [] }
  ] },
  { id: "8", name: "New Q4 e-tron case study", subfolders: [
    { id: "8.1", name: "Q4 e-tron Teasing campaign", assets: [] },
    { id: "8.2", name: "Q4 e-tron Reveal/EOS campaign", assets: [] },
    { id: "8.3", name: "Q4 e-tron Launch campaign", assets: [] }
  ] },
  { id: "9", name: "Focus Social Media", assets: [
    { id: "a5", name: "Instagram Reel Q4", type: "VIDEO_INSTAGRAM", url: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4", description: "Reel pour Instagram présentant le nouveau design." },
    { id: "a6", name: "Facebook Ad", type: "VIDEO_FB", url: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4", description: "Publicité Facebook ciblée." },
    { id: "a7", name: "iPad Interactive Demo", type: "VIDEO_IPAD", url: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4", description: "Démo interactive pour concessions sur iPad." }
  ] }
];

export function getFolderById(id: string, folders: Folder[] = directoryStructure): Folder | null {
  for (const folder of folders) {
    if (folder.id === id) return folder;
    if (folder.subfolders) {
      const found = getFolderById(id, folder.subfolders);
      if (found) return found;
    }
  }
  return null;
}
