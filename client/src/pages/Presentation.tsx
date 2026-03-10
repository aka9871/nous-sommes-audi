import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronRight, Play, Folder as FolderIcon, ShieldAlert, Loader2, Menu, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const audiLogo = "/fonts/audi-rings-white.png";
const romanceLogo = "/fonts/logo-romance-white.png";

interface PresentationVideo {
  title: string;
  url: string;
  description?: string;
}

interface PresentationFolder {
  name: string;
  videos?: PresentationVideo[];
  subfolders?: PresentationFolder[];
}

interface PresentationData {
  folders: PresentationFolder[];
}

function PresentationAuth({ onAuth }: { onAuth: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const res = await fetch("/api/presentation/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        sessionStorage.setItem("presentation_auth", "true");
        onAuth();
      } else {
        setError(true);
        setPin("");
      }
    } catch {
      setError(true);
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center p-4 selection:bg-primary selection:text-white relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black pointer-events-none"></div>
      <img src={audiLogo} alt="" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[1200px] opacity-[0.02] pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md flex flex-col items-center"
      >
        <img src={audiLogo} alt="Audi Logo" className="h-10 mb-10" data-testid="img-presentation-logo" />
        <div className="w-full bg-zinc-950/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-primary"></div>
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extended font-bold text-white text-center mb-2 uppercase tracking-widest" data-testid="text-presentation-auth-title">Présentation</h2>
            <p className="text-muted-foreground text-center font-light text-sm">Veuillez saisir le code d'accès pour la présentation.</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <input
                type="password"
                value={pin}
                onChange={(e) => { setPin(e.target.value); setError(false); }}
                className={`w-full bg-black/50 border ${error ? 'border-destructive focus:border-destructive' : 'border-white/10 focus:border-white/40'} rounded-lg px-4 py-4 text-center text-3xl font-extended tracking-[0.5em] text-white outline-none transition-colors shadow-inner`}
                placeholder="••••"
                maxLength={8}
                autoFocus
                disabled={loading}
                data-testid="input-presentation-pin"
              />
              {error && <span className="text-destructive text-xs text-center font-bold tracking-wide uppercase mt-1" data-testid="text-presentation-error">Code PIN incorrect</span>}
            </div>
            <button
              type="submit"
              disabled={loading || pin.length === 0}
              className="w-full bg-white hover:bg-white/90 disabled:bg-white/50 disabled:cursor-not-allowed text-black font-extended font-bold uppercase tracking-widest text-sm py-4 rounded-lg transition-colors mt-2 flex items-center justify-center gap-2"
              data-testid="button-presentation-submit"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? "Vérification..." : "Déverrouiller"}
            </button>
          </form>
        </div>
        <div className="mt-12 flex flex-col items-center gap-6">
          <p className="text-xs text-muted-foreground/60 text-center max-w-[280px] font-light leading-relaxed">
            Plateforme confidentielle strictement réservée à un usage interne. Ne pas partager.
          </p>
          <img src={romanceLogo} alt="Romance Agency" className="h-4 opacity-50" />
        </div>
      </motion.div>
    </div>
  );
}

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/video\/(\d+)/);
  return match ? match[1] : null;
}

function VideoCard({ video, onClick }: { video: PresentationVideo; onClick: () => void }) {
  const videoId = getVimeoId(video.url);
  const thumbnailUrl = videoId ? `https://vumbnail.com/${videoId}.jpg` : null;

  return (
    <div
      className="group cursor-pointer rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-all duration-500 overflow-hidden flex flex-col shadow-lg hover:shadow-primary/5"
      onClick={onClick}
      data-testid={`card-video-${video.title}`}
    >
      <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900"></div>
            <img src={audiLogo} alt="" className="absolute w-24 opacity-10" />
          </>
        )}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all duration-300"></div>
        <div className="relative z-10 w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 group-hover:bg-primary/30 transition-all duration-300">
          <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
        </div>
      </div>
    </div>
  );
}

function VideoCardWithDialog({ video }: { video: PresentationVideo }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <VideoCard video={video} onClick={() => setOpen(true)} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl w-[95vw] bg-black/95 border-white/10 p-0 overflow-hidden">
          <div className="relative w-full aspect-video">
            <iframe
              src={`${video.url}${video.url.includes('?') ? '&' : '?'}autoplay=1&title=0&byline=0&portrait=0`}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
              allowFullScreen
              title={video.title}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function SidebarNavItem({ folder, level = 0, activeFolder, onSelect, onNavigate, parentPath = "" }: {
  folder: PresentationFolder;
  level?: number;
  activeFolder: string | null;
  onSelect: (path: string) => void;
  onNavigate?: () => void;
  parentPath?: string;
}) {
  const folderPath = parentPath ? `${parentPath}/${slugify(folder.name)}` : slugify(folder.name);
  const isActive = activeFolder === folderPath;
  const hasChildren = folder.subfolders && folder.subfolders.length > 0;

  const hasActiveChild = (f: PresentationFolder, basePath: string): boolean => {
    if (!f.subfolders) return false;
    return f.subfolders.some(sub => {
      const subPath = `${basePath}/${slugify(sub.name)}`;
      return activeFolder === subPath || hasActiveChild(sub, subPath);
    });
  };

  const isExpanded = isActive || hasActiveChild(folder, folderPath);

  return (
    <div className="w-full flex flex-col">
      <button
        onClick={() => { onSelect(folderPath); onNavigate?.(); }}
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 border-l-2 relative w-full text-left",
          isActive
            ? "bg-primary/15 border-primary text-white font-bold shadow-[inset_0_0_20px_rgba(187,10,33,0.1)]"
            : "border-transparent text-muted-foreground hover:bg-white/5 hover:text-white"
        )}
        style={{ paddingLeft: `${level * 12 + 16}px` }}
        data-testid={`button-nav-${folderPath}`}
      >
        {isActive ? (
          <FolderIcon className="w-5 h-5 text-primary fill-primary/20" />
        ) : (
          <FolderIcon className="w-4 h-4 text-muted-foreground" />
        )}
        <span className="truncate flex-1">{folder.name}</span>
        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
        {hasChildren && (
          <ChevronRight className={cn("w-4 h-4 opacity-50 transition-transform", isExpanded && "rotate-90")} />
        )}
      </button>

      {hasChildren && isExpanded && (
        <div className="flex flex-col">
          {folder.subfolders!.map((sub, idx) => (
            <SidebarNavItem key={idx} folder={sub} level={level + 1} activeFolder={activeFolder} onSelect={onSelect} onNavigate={onNavigate} parentPath={folderPath} />
          ))}
        </div>
      )}
    </div>
  );
}

function PresentationContent({ data }: { data: PresentationData }) {
  const folders = data.folders || [];
  const [activeFolder, setActiveFolder] = useState<string | null>(folders.length > 0 ? slugify(folders[0].name) : null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const findFolder = (folders: PresentationFolder[], targetPath: string, parentPath: string = ""): PresentationFolder | null => {
    for (const f of folders) {
      const currentPath = parentPath ? `${parentPath}/${slugify(f.name)}` : slugify(f.name);
      if (currentPath === targetPath) return f;
      if (f.subfolders) {
        const found = findFolder(f.subfolders, targetPath, currentPath);
        if (found) return found;
      }
    }
    return null;
  };

  const currentFolder = activeFolder ? findFolder(folders, activeFolder) : null;
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans selection:bg-primary selection:text-white">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={closeSidebar} />
      )}

      <aside className={cn(
        "fixed md:relative z-50 md:z-auto h-full w-72 md:w-80 flex-shrink-0 border-r border-border/50 bg-card/95 md:bg-card/50 backdrop-blur flex flex-col transition-transform duration-300 md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 md:p-8 pb-8 md:pb-10 flex items-center gap-4 border-b border-border/50">
          <img src={audiLogo} alt="Audi Logo" className="h-7 md:h-8" />
          <div className="h-6 w-px bg-border/50"></div>
          <h1 className="font-extended font-bold text-base md:text-lg leading-none tracking-widest mt-1">
            Nous<br/>Sommes<br/>Audi
          </h1>
          <button onClick={closeSidebar} className="ml-auto md:hidden p-2 text-muted-foreground hover:text-white" data-testid="button-close-presentation-sidebar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          <nav className="flex flex-col gap-0.5">
            <div className="px-4 py-2">
              <span className="font-extended text-[10px] uppercase tracking-widest text-muted-foreground/60 font-bold">Présentation</span>
            </div>
            <div className="h-px bg-border/50 my-2 mx-4"></div>
            {folders.map((folder, idx) => (
              <SidebarNavItem key={idx} folder={folder} activeFolder={activeFolder} onSelect={setActiveFolder} onNavigate={closeSidebar} />
            ))}
          </nav>
        </div>

        <div className="p-6 border-t border-border/50 flex justify-center items-center opacity-70">
          <img src={romanceLogo} alt="Romance Agency Logo" className="h-6 opacity-80 hover:opacity-100 transition-opacity" />
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none"></div>

        <header className="h-14 md:h-20 border-b border-border/50 flex items-center px-4 md:px-10 relative z-10 bg-background/50 backdrop-blur-md gap-3">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-white" data-testid="button-open-presentation-sidebar">
            <Menu className="w-5 h-5" />
          </button>
          <img src={audiLogo} alt="Audi" className="h-5 md:hidden" />
          <div className="flex-1"></div>
          <div className="flex items-center gap-2 text-muted-foreground/60 border border-white/10 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full bg-black/20">
            <ShieldAlert className="w-3 h-3 text-destructive" />
            <span className="text-[9px] md:text-[10px] font-extended uppercase tracking-widest font-bold">Confidentiel</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto relative z-10 custom-scrollbar flex flex-col">
          <div className="p-4 md:p-10 flex-1">
            {currentFolder ? (
              <div className="flex flex-col gap-6">
                <motion.div
                  key={activeFolder}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="inline-block px-3 py-1 mb-4 rounded-full border border-primary/30 bg-primary/10 text-primary font-extended text-xs font-bold tracking-widest uppercase">
                    Dossier
                  </div>
                  <h2 className="text-2xl md:text-4xl lg:text-5xl font-extended font-bold tracking-tight text-white mb-4" data-testid="text-presentation-folder-title">
                    {currentFolder.name}
                  </h2>
                </motion.div>

                {currentFolder.videos && currentFolder.videos.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <h3 className="font-extended font-bold text-sm tracking-widest text-muted-foreground uppercase border-b border-border/50 pb-2 mb-4">
                      Vidéos
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                      {currentFolder.videos.map((video, idx) => (
                        <VideoCardWithDialog key={idx} video={video} />
                      ))}
                    </div>
                  </motion.div>
                )}

                {currentFolder.subfolders && currentFolder.subfolders.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <h3 className="font-extended font-bold text-sm tracking-widest text-muted-foreground uppercase border-b border-border/50 pb-2 mb-4">
                      Sous-Dossiers
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentFolder.subfolders.map((sub, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveFolder(`${activeFolder}/${slugify(sub.name)}`)}
                          className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 md:p-6 hover:bg-white/10 hover:border-primary/50 transition-all duration-300 flex items-center gap-4 cursor-pointer text-left"
                          data-testid={`button-subfolder-${slugify(sub.name)}`}
                        >
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 flex-shrink-0">
                            <FolderIcon className="w-5 h-5 md:w-6 md:h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-extended font-bold text-white text-xs md:text-sm leading-tight group-hover:text-primary transition-colors truncate">
                              {sub.name}
                            </h4>
                            <span className="text-xs text-muted-foreground mt-1 block">
                              {(sub.videos?.length || 0)} vidéos
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-10 md:p-20 border border-dashed border-white/10 rounded-2xl bg-white/5 mt-8">
                <Play className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <h3 className="font-extended text-lg text-white mb-2">Sélectionnez un dossier</h3>
                <p className="text-muted-foreground text-center">Choisissez un dossier dans la barre latérale pour voir les vidéos.</p>
              </div>
            )}
          </div>

          <footer className="mt-auto border-t border-border/50 p-4 md:p-6 text-center bg-black/20 backdrop-blur-sm">
            <p className="text-[10px] md:text-xs text-muted-foreground/60 max-w-4xl mx-auto leading-relaxed">
              <strong>CONFIDENTIEL</strong> &mdash; Le contenu de ce répertoire est strictement réservé à un usage interne Audi et Romance Agency.
              Toute reproduction, distribution ou communication à des tiers sans autorisation préalable est formellement interdite.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default function Presentation() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem("presentation_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const { data, isLoading } = useQuery<PresentationData>({
    queryKey: ["/api/presentation"],
    queryFn: async () => {
      const res = await fetch("/api/presentation");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return <PresentationAuth onAuth={() => setIsAuthenticated(true)} />;
  }

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <PresentationContent data={data} />;
}
