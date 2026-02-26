import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { type Folder } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { getIconForType } from "@/components/media/DeviceFrame";
import { ChevronRight, ShieldAlert, Menu, X, Folder as FolderIcon } from "lucide-react";
import React, { useState, useEffect } from "react";
import audiLogo from "@assets/Audi_Rings_wh-RGB_1772014848825.png";
import romanceLogo from "@assets/logo-r-white_1772015879043.png";

interface AppLayoutProps {
  children: React.ReactNode;
}

function hasActiveDescendant(folder: Folder, currentPath: string): boolean {
  if (currentPath === `/${folder.id}`) return true;
  if (folder.subfolders) {
    return folder.subfolders.some(sub => hasActiveDescendant(sub, currentPath));
  }
  return false;
}

const NavItem = ({ folder, level = 0, currentPath, onNavigate }: { folder: Folder, level?: number, currentPath: string, onNavigate?: () => void }) => {
  const isActive = currentPath === `/${folder.id}`;
  const isExpanded = isActive || hasActiveDescendant(folder, currentPath);

  return (
    <div className="w-full flex flex-col">
      <Link href={`/${folder.id}`} onClick={onNavigate} className={cn(
          "flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 border-l-2 relative",
          isActive
            ? "bg-primary/15 border-primary text-white font-bold shadow-[inset_0_0_20px_rgba(187,10,33,0.1)]"
            : "border-transparent text-muted-foreground hover:bg-white/5 hover:text-white"
        )}
        style={{ paddingLeft: `${level * 12 + 16}px` }}>
          {isActive ? (
            <FolderIcon className="w-5 h-5 text-primary fill-primary/20" />
          ) : (
            getIconForType('FOLDER')
          )}
          <span className="truncate flex-1">{folder.name}</span>
          {isActive && (
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          )}
          {folder.subfolders && folder.subfolders.length > 0 && (
            <ChevronRight className={cn("w-4 h-4 opacity-50 transition-transform", isExpanded && "rotate-90")} />
          )}
      </Link>

      {folder.subfolders && isExpanded && (
        <div className="flex flex-col">
          {folder.subfolders.map(sub => (
            <NavItem key={sub.id} folder={sub} level={level + 1} currentPath={currentPath} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  const { data: folders = [] } = useQuery<Folder[]>({
    queryKey: ["/api/folders"],
    queryFn: async () => {
      const res = await fetch("/api/folders");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

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
          <button onClick={closeSidebar} className="ml-auto md:hidden p-2 text-muted-foreground hover:text-white" data-testid="button-close-sidebar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          <nav className="flex flex-col gap-0.5">
            <Link href="/" onClick={closeSidebar} className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 border-l-2",
                location === "/" || location === ""
                  ? "bg-primary/10 border-primary text-white font-medium"
                  : "border-transparent text-muted-foreground hover:bg-white/5 hover:text-white"
              )}>
                <span className="font-extended">VUE D'ENSEMBLE</span>
            </Link>
            <div className="h-px bg-border/50 my-2 mx-4"></div>
            {folders.map(folder => (
              <NavItem key={folder.id} folder={folder} currentPath={location} onNavigate={closeSidebar} />
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
           <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-white" data-testid="button-open-sidebar">
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
            {children}
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
