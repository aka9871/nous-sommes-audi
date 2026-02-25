import React, { useState } from "react";
import { useParams, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { directoryStructure, getFolderById, Asset } from "@/data/mockData";
import { DeviceFrame, getIconForType } from "@/components/media/DeviceFrame";
import { Folder as FolderIcon, Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function Home() {
  const { folderId } = useParams();
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const currentFolder = folderId ? getFolderById(folderId) : null;
  
  // Define what to show based on the route
  const title = currentFolder ? currentFolder.name : "Vue d'ensemble";
  const subfolders = currentFolder ? currentFolder.subfolders : directoryStructure;
  const assets = currentFolder ? currentFolder.assets : [];

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-10 pb-20">
      
      {/* Header section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="inline-block px-3 py-1 mb-4 rounded-full border border-primary/30 bg-primary/10 text-primary font-extended text-xs font-bold tracking-widest uppercase">
          {currentFolder ? "Dossier" : "Accueil"}
        </div>
        <h2 className="text-4xl md:text-5xl font-extended font-bold tracking-tight text-white mb-4">
          {title}
        </h2>
        {currentFolder && (
          <p className="text-muted-foreground text-lg max-w-2xl font-light">
            Explorez les assets de communication, activations et campagnes associés à ce territoire.
          </p>
        )}
      </motion.div>

      {/* Subfolders Grid */}
      {subfolders && subfolders.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col gap-4"
        >
          <h3 className="font-extended font-bold text-sm tracking-widest text-muted-foreground uppercase border-b border-border/50 pb-2">
            Sous-Dossiers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
            {subfolders.map((folder, index) => (
              <Link key={folder.id} href={`/${folder.id}`} className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 hover:border-primary/50 transition-all duration-300 flex items-center gap-4 cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <FolderIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-extended font-bold text-white text-sm leading-tight group-hover:text-primary transition-colors">
                      {folder.name}
                    </h4>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {(folder.subfolders?.length || 0) + (folder.assets?.length || 0)} éléments
                    </span>
                  </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Assets Grid */}
      {assets && assets.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col gap-4 mt-8"
        >
          <h3 className="font-extended font-bold text-sm tracking-widest text-muted-foreground uppercase border-b border-border/50 pb-2">
            Assets Disponibles
          </h3>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-4">
            {assets.map((asset, index) => (
              <Dialog key={asset.id}>
                <DialogTrigger asChild>
                  <div className="group cursor-pointer rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-all duration-500 overflow-hidden flex flex-col h-full shadow-lg hover:shadow-primary/5">
                    {/* Preview Area (Simplified for card) */}
                    <div className="relative aspect-[16/10] w-full bg-black flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform">
                          <Maximize2 className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      
                      {asset.type === 'IMAGE' ? (
                        <img src={asset.url} alt={asset.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-700" />
                      ) : asset.type === 'PDF' ? (
                        <div className="flex flex-col items-center gap-4 text-destructive opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
                           {getIconForType(asset.type)}
                           <span className="font-extended font-bold tracking-widest text-xs uppercase text-white/50">PDF File</span>
                        </div>
                      ) : (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <video src={asset.url} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" />
                          <div className="absolute z-10 w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                             <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                          </div>
                        </div>
                      )}
                      
                      {/* Badge Type */}
                      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                         {getIconForType(asset.type)}
                         <span className="text-[10px] font-extended uppercase font-bold tracking-wider text-white">
                           {asset.type.replace('VIDEO_', '')}
                         </span>
                      </div>
                    </div>
                    
                    {/* Meta Area */}
                    <div className="p-6 flex flex-col flex-1">
                      <h4 className="text-xl font-extended font-bold text-white group-hover:text-primary transition-colors">
                        {asset.name}
                      </h4>
                      {asset.description && (
                        <p className="text-sm text-muted-foreground mt-3 line-clamp-2 font-light leading-relaxed">
                          {asset.description}
                        </p>
                      )}
                    </div>
                  </div>
                </DialogTrigger>
                
                {/* Asset Viewer Modal */}
                <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full p-0 bg-zinc-950/95 backdrop-blur-xl border-white/10 flex flex-col md:flex-row overflow-hidden rounded-2xl">
                  {/* Left: Device Frame Viewer */}
                  <div className="flex-[2] relative p-8 md:p-12 flex items-center justify-center bg-black/50 overflow-y-auto">
                    <DeviceFrame type={asset.type} url={asset.url} />
                  </div>
                  
                  {/* Right: Info Panel */}
                  <div className="flex-1 min-w-[300px] max-w-[500px] bg-zinc-900/80 p-8 md:p-12 border-l border-white/5 flex flex-col gap-8 overflow-y-auto">
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                          {getIconForType(asset.type)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-extended uppercase tracking-widest text-muted-foreground">Type</span>
                          <span className="text-sm font-bold text-white">{asset.type}</span>
                        </div>
                      </div>
                      
                      <h2 className="text-3xl font-extended font-bold text-white mb-6 leading-tight">
                        {asset.name}
                      </h2>
                      
                      {asset.description && (
                        <div className="prose prose-invert prose-p:text-muted-foreground prose-p:leading-relaxed">
                          <p>{asset.description}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-auto pt-8 border-t border-white/10">
                      <a href={asset.url} download target="_blank" rel="noreferrer" className="w-full block text-center px-6 py-4 bg-primary text-white font-extended font-bold uppercase tracking-widest text-sm hover:bg-primary/90 transition-all rounded-sm shadow-lg shadow-primary/20">
                        Télécharger l'asset
                      </a>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {currentFolder && (!subfolders || subfolders.length === 0) && (!assets || assets.length === 0) && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center p-20 border border-dashed border-white/10 rounded-2xl bg-white/5 mt-8"
        >
          <FolderIcon className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h3 className="font-extended text-lg text-white mb-2">Dossier Vide</h3>
          <p className="text-muted-foreground">Aucun asset ou sous-dossier n'est présent ici pour le moment.</p>
        </motion.div>
      )}

    </div>
  );
}
