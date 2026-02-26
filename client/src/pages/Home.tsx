import React, { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { type Folder, type Asset } from "@/data/mockData";
import { DeviceFrame, getIconForType } from "@/components/media/DeviceFrame";
import { Folder as FolderIcon, Maximize2, Loader2, ChevronLeft, Home as HomeIcon, LayoutGrid, List } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";

async function fetchFolders(): Promise<Folder[]> {
  const res = await fetch("/api/folders");
  if (!res.ok) throw new Error("Failed to fetch folders");
  return res.json();
}

async function fetchFolder(id: string): Promise<Folder> {
  const res = await fetch(`/api/folders/${id}`);
  if (!res.ok) throw new Error("Failed to fetch folder");
  return res.json();
}

function AssetCard({ asset }: { asset: Asset }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div data-testid={`card-asset-${asset.id}`} className="group cursor-pointer rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-all duration-500 overflow-hidden flex flex-col h-full shadow-lg hover:shadow-primary/5">
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
                <span className="font-extended font-bold tracking-widest text-xs uppercase text-white/50">PDF</span>
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <video src={asset.url} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" />
                <div className="absolute z-10 w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                </div>
              </div>
            )}

            <div className="absolute top-3 left-3 md:top-4 md:left-4 z-20 flex items-center gap-2 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
              {getIconForType(asset.type)}
              <span className="text-[10px] font-extended uppercase font-bold tracking-wider text-white">
                {asset.type.replace('VIDEO_', '')}
              </span>
            </div>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className={`${asset.description ? 'max-w-[95vw]' : 'max-w-[95vw] md:max-w-[80vw]'} w-full max-h-[95vh] h-full p-0 bg-zinc-950/95 backdrop-blur-xl border-white/10 flex flex-col md:flex-row overflow-hidden rounded-2xl`} aria-describedby={undefined}>
        <DialogTitle className="sr-only">{asset.name}</DialogTitle>
        <div className="flex-1 relative p-4 md:p-8 lg:p-12 flex items-center justify-center bg-black/50 overflow-y-auto">
          <DeviceFrame type={asset.type} url={asset.url} />
        </div>

        {asset.description && (
          <div className="flex-shrink-0 w-full md:w-[350px] lg:w-[400px] bg-zinc-900/80 p-6 md:p-8 lg:p-12 border-t md:border-t-0 md:border-l border-white/5 flex flex-col gap-6 md:gap-8 overflow-y-auto">
            <div>
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  {getIconForType(asset.type)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-extended uppercase tracking-widest text-muted-foreground">Type</span>
                  <span className="text-sm font-bold text-white">{asset.type}</span>
                </div>
              </div>

              <h2 className="text-xl md:text-3xl font-extended font-bold text-white mb-4 md:mb-6 leading-tight">
                {asset.name}
              </h2>

              <div className="prose prose-invert prose-p:text-muted-foreground prose-p:leading-relaxed">
                <p>{asset.description}</p>
              </div>
            </div>

            <div className="mt-auto pt-6 md:pt-8 border-t border-white/10">
              <a href={asset.url} download target="_blank" rel="noreferrer" data-testid={`button-download-${asset.id}`} className="w-full block text-center px-6 py-3 md:py-4 bg-primary text-white font-extended font-bold uppercase tracking-widest text-xs md:text-sm hover:bg-primary/90 transition-all rounded-sm shadow-lg shadow-primary/20">
                Télécharger l'asset
              </a>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AssetListItem({ asset }: { asset: Asset }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div data-testid={`list-asset-${asset.id}`} className="group cursor-pointer rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-all duration-300 overflow-hidden flex items-center gap-4 p-3 md:p-4">
          <div className="relative w-20 h-14 md:w-28 md:h-20 rounded-lg bg-black flex-shrink-0 overflow-hidden flex items-center justify-center">
            {asset.type === 'IMAGE' ? (
              <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
            ) : asset.type === 'PDF' ? (
              <div className="flex items-center justify-center w-full h-full">
                {getIconForType(asset.type)}
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <video src={asset.url} className="w-full h-full object-cover opacity-60" />
                <div className="absolute z-10 w-8 h-8 rounded-full bg-primary/30 border border-primary/50 flex items-center justify-center">
                  <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[7px] border-l-white border-b-[4px] border-b-transparent ml-0.5"></div>
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {getIconForType(asset.type)}
              <span className="text-[10px] font-extended uppercase font-bold tracking-wider text-muted-foreground">
                {asset.type.replace('VIDEO_', '')}
              </span>
            </div>
            {asset.description && (
              <p className="text-xs text-muted-foreground mt-1 truncate">{asset.description}</p>
            )}
          </div>
          <Maximize2 className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors flex-shrink-0" />
        </div>
      </DialogTrigger>

      <DialogContent className={`${asset.description ? 'max-w-[95vw]' : 'max-w-[95vw] md:max-w-[80vw]'} w-full max-h-[95vh] h-full p-0 bg-zinc-950/95 backdrop-blur-xl border-white/10 flex flex-col md:flex-row overflow-hidden rounded-2xl`} aria-describedby={undefined}>
        <DialogTitle className="sr-only">{asset.name}</DialogTitle>
        <div className="flex-1 relative p-4 md:p-8 lg:p-12 flex items-center justify-center bg-black/50 overflow-y-auto">
          <DeviceFrame type={asset.type} url={asset.url} />
        </div>

        {asset.description && (
          <div className="flex-shrink-0 w-full md:w-[350px] lg:w-[400px] bg-zinc-900/80 p-6 md:p-8 lg:p-12 border-t md:border-t-0 md:border-l border-white/5 flex flex-col gap-6 md:gap-8 overflow-y-auto">
            <div>
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  {getIconForType(asset.type)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-extended uppercase tracking-widest text-muted-foreground">Type</span>
                  <span className="text-sm font-bold text-white">{asset.type}</span>
                </div>
              </div>

              <h2 className="text-xl md:text-3xl font-extended font-bold text-white mb-4 md:mb-6 leading-tight">
                {asset.name}
              </h2>

              <div className="prose prose-invert prose-p:text-muted-foreground prose-p:leading-relaxed">
                <p>{asset.description}</p>
              </div>
            </div>

            <div className="mt-auto pt-6 md:pt-8 border-t border-white/10">
              <a href={asset.url} download target="_blank" rel="noreferrer" data-testid={`button-download-${asset.id}`} className="w-full block text-center px-6 py-3 md:py-4 bg-primary text-white font-extended font-bold uppercase tracking-widest text-xs md:text-sm hover:bg-primary/90 transition-all rounded-sm shadow-lg shadow-primary/20">
                Télécharger l'asset
              </a>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function Home() {
  const { folderId } = useParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const rootQuery = useQuery({
    queryKey: ["/api/folders"],
    queryFn: fetchFolders,
    enabled: !folderId,
  });

  const folderQuery = useQuery({
    queryKey: ["/api/folders", folderId],
    queryFn: () => fetchFolder(folderId!),
    enabled: !!folderId,
  });

  const isLoading = folderId ? folderQuery.isLoading : rootQuery.isLoading;
  const currentFolder = folderId ? folderQuery.data : null;
  const title = currentFolder ? currentFolder.name : "Vue d'ensemble";
  const subfolders = currentFolder ? currentFolder.subfolders : rootQuery.data;
  const assets = currentFolder ? currentFolder.assets : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 md:gap-10 pb-20">
      {currentFolder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm"
        >
          <Link href="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-white transition-colors" data-testid="link-home">
            <HomeIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Accueil</span>
          </Link>

          {currentFolder.parentId && (
            <>
              <span className="text-muted-foreground/40">/</span>
              <Link href={`/${currentFolder.parentId}`} className="text-muted-foreground hover:text-white transition-colors truncate max-w-[120px] md:max-w-none" data-testid="link-parent-folder">
                {currentFolder.parentName}
              </Link>
            </>
          )}

          <span className="text-muted-foreground/40">/</span>
          <span className="text-white font-medium truncate">{currentFolder.name}</span>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex items-start justify-between gap-4"
      >
        <div className="flex-1 min-w-0">
          <div className="inline-block px-3 py-1 mb-4 rounded-full border border-primary/30 bg-primary/10 text-primary font-extended text-xs font-bold tracking-widest uppercase">
            {currentFolder ? "Dossier" : "Accueil"}
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-extended font-bold tracking-tight text-white mb-4">
            {title}
          </h2>

          {currentFolder && (
            <div className="flex items-center gap-3 mt-2">
              {currentFolder.parentId ? (
                <Link href={`/${currentFolder.parentId}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:text-white hover:border-primary/30 transition-all text-xs font-extended" data-testid="button-back">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Retour
                </Link>
              ) : (
                <Link href="/" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:text-white hover:border-primary/30 transition-all text-xs font-extended" data-testid="button-back">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Accueil
                </Link>
              )}
            </div>
          )}
        </div>
      </motion.div>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
            {subfolders.map((folder) => (
              <Link key={folder.id} href={`/${folder.id}`} className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 md:p-6 hover:bg-white/10 hover:border-primary/50 transition-all duration-300 flex items-center gap-4 cursor-pointer">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 flex-shrink-0">
                  <FolderIcon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-extended font-bold text-white text-xs md:text-sm leading-tight group-hover:text-primary transition-colors truncate">
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

      {assets && assets.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col gap-4 mt-4 md:mt-8"
        >
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <h3 className="font-extended font-bold text-sm tracking-widest text-muted-foreground uppercase">
              Assets Disponibles
            </h3>
            <div className="flex items-center gap-1 bg-white/5 rounded-lg border border-white/10 p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-white'}`}
                data-testid="button-view-grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-white'}`}
                data-testid="button-view-list"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mt-4">
              {assets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2 mt-4">
              {assets.map((asset) => (
                <AssetListItem key={asset.id} asset={asset} />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {currentFolder && (!subfolders || subfolders.length === 0) && (!assets || assets.length === 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center p-10 md:p-20 border border-dashed border-white/10 rounded-2xl bg-white/5 mt-8"
        >
          <FolderIcon className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h3 className="font-extended text-lg text-white mb-2">Dossier Vide</h3>
          <p className="text-muted-foreground text-center">Aucun asset ou sous-dossier n'est présent ici pour le moment.</p>
        </motion.div>
      )}

      {!folderId && (!subfolders || subfolders.length === 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center p-10 md:p-20 border border-dashed border-white/10 rounded-2xl bg-white/5 mt-8"
        >
          <FolderIcon className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h3 className="font-extended text-lg text-white mb-2">Répertoire Vide</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Aucun dossier n'a été trouvé. Déposez vos dossiers de campagne dans le répertoire <code className="bg-white/10 px-2 py-0.5 rounded text-white">content/</code> sur le serveur.
          </p>
        </motion.div>
      )}
    </div>
  );
}
