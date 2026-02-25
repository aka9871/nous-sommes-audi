import React from "react";
import { cn } from "@/lib/utils";
import { FolderIcon, FileText, Image as ImageIcon, Video, MonitorPlay, Smartphone, Tablet } from "lucide-react";
import { AssetType } from "@/data/mockData";

export const getIconForType = (type: AssetType | 'FOLDER') => {
  switch (type) {
    case 'FOLDER': return <FolderIcon className="w-5 h-5 text-primary" />;
    case 'IMAGE': return <ImageIcon className="w-5 h-5 text-muted-foreground" />;
    case 'PDF': return <FileText className="w-5 h-5 text-destructive" />;
    case 'VIDEO': return <Video className="w-5 h-5 text-muted-foreground" />;
    case 'VIDEO_TV': return <MonitorPlay className="w-5 h-5 text-muted-foreground" />;
    case 'VIDEO_IPAD': return <Tablet className="w-5 h-5 text-muted-foreground" />;
    case 'VIDEO_TIKTOK': 
    case 'VIDEO_FB': 
    case 'VIDEO_INSTAGRAM': 
      return <Smartphone className="w-5 h-5 text-muted-foreground" />;
    default: return <FileText className="w-5 h-5 text-muted-foreground" />;
  }
};

interface DeviceFrameProps {
  type: AssetType;
  url: string;
  thumbnail?: string;
  className?: string;
}

export function DeviceFrame({ type, url, thumbnail, className }: DeviceFrameProps) {
  const isIphone = ['VIDEO_TIKTOK', 'VIDEO_FB', 'VIDEO_INSTAGRAM'].includes(type);
  const isIpad = type === 'VIDEO_IPAD';
  const isTV = type === 'VIDEO_TV';

  if (isIphone) {
    return (
      <div className={cn("relative mx-auto w-[300px] h-[600px] rounded-[40px] border-[12px] border-zinc-900 bg-black overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10", className)}>
        {/* Notch */}
        <div className="absolute top-0 inset-x-0 h-6 bg-zinc-900 rounded-b-3xl w-1/2 mx-auto z-10"></div>
        
        {/* TikTok/FB/Insta Overlay Mock */}
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4">
           {/* Top indicators */}
           <div className="flex justify-between items-start pt-2 px-2 text-white text-xs opacity-80">
             <span>9:41</span>
             <div className="flex gap-1">
               <div className="w-3 h-3 rounded-full bg-white/20"></div>
               <div className="w-3 h-3 rounded-full bg-white/20"></div>
               <div className="w-3 h-3 rounded-full bg-white/20"></div>
             </div>
           </div>
           
           {/* Platform Specific UI Mock */}
           {type === 'VIDEO_TIKTOK' && (
             <div className="absolute right-2 bottom-20 flex flex-col gap-4">
               <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white backdrop-blur"></div>
               <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white">♥</div>
               <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white">💬</div>
             </div>
           )}
        </div>
        
        <video src={url} className="w-full h-full object-cover" poster={thumbnail} controls loop muted playsInline />
      </div>
    );
  }

  if (isIpad) {
    return (
      <div className={cn("relative mx-auto w-[600px] h-[450px] rounded-[24px] border-[16px] border-zinc-900 bg-black overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10", className)}>
        {/* Camera dot */}
        <div className="absolute top-1/2 left-[-10px] w-2 h-2 rounded-full bg-zinc-950 z-10 transform -translate-y-1/2"></div>
        <video src={url} className="w-full h-full object-cover" poster={thumbnail} controls loop muted playsInline />
      </div>
    );
  }

  if (isTV) {
    return (
      <div className={cn("relative mx-auto w-full max-w-[800px] aspect-video", className)}>
        <div className="absolute inset-0 rounded-sm border-4 border-zinc-800 bg-black overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)] ring-1 ring-white/5">
          <video src={url} className="w-full h-full object-cover" poster={thumbnail} controls loop muted playsInline />
        </div>
        {/* TV Stand */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-40 h-8 flex flex-col items-center">
          <div className="w-8 h-full bg-gradient-to-b from-zinc-800 to-zinc-950"></div>
          <div className="w-full h-2 bg-zinc-900 rounded-sm"></div>
        </div>
      </div>
    );
  }

  // IMAGE or standard VIDEO
  if (type === 'IMAGE') {
    return (
      <div className={cn("relative mx-auto w-full rounded-md overflow-hidden bg-zinc-950 border border-white/10 shadow-lg", className)}>
        <img src={url} alt="asset" className="w-full h-auto max-h-[80vh] object-contain" />
      </div>
    );
  }

  if (type === 'PDF') {
    return (
      <div className={cn("relative mx-auto w-full aspect-[1/1.4] max-w-[600px] rounded-md overflow-hidden bg-zinc-950 border border-white/10 shadow-lg flex flex-col items-center justify-center p-12", className)}>
        <FileText className="w-24 h-24 text-destructive mb-6" />
        <h3 className="text-2xl font-extended font-bold text-white mb-2">PDF Document</h3>
        <a href={url} target="_blank" rel="noreferrer" className="px-6 py-3 bg-primary text-white font-extended uppercase text-sm rounded-sm hover:bg-primary/90 transition-colors">
          Download / View
        </a>
      </div>
    );
  }

  // Standard Video
  return (
    <div className={cn("relative mx-auto w-full rounded-md overflow-hidden bg-black shadow-lg border border-white/10", className)}>
      <video src={url} className="w-full h-auto max-h-[80vh]" poster={thumbnail} controls />
    </div>
  );
}
