import { Link, useLocation } from "wouter";
import { directoryStructure, Folder } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { getIconForType } from "@/components/media/DeviceFrame";
import { ChevronRight, ShieldAlert } from "lucide-react";
import React from "react";
import audiLogo from "@assets/Audi_Rings_wh-RGB_1772014848825.png";
import romanceLogo from "@assets/logo-r-white_1772015879043.png";

interface AppLayoutProps {
  children: React.ReactNode;
}

const NavItem = ({ folder, level = 0, currentPath }: { folder: Folder, level?: number, currentPath: string }) => {
  const isExpanded = currentPath.includes(folder.id);
  const isActive = currentPath === `/${folder.id}`;

  return (
    <div className="w-full flex flex-col">
      <Link href={`/${folder.id}`} className={cn(
          "flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 border-l-2",
          isActive 
            ? "bg-primary/10 border-primary text-white font-medium" 
            : "border-transparent text-muted-foreground hover:bg-white/5 hover:text-white"
        )}
        style={{ paddingLeft: `${level * 12 + 16}px` }}>
          {getIconForType('FOLDER')}
          <span className="truncate flex-1">{folder.name}</span>
          {folder.subfolders && folder.subfolders.length > 0 && (
            <ChevronRight className={cn("w-4 h-4 opacity-50 transition-transform", isExpanded && "rotate-90")} />
          )}
      </Link>
      
      {folder.subfolders && isExpanded && (
        <div className="flex flex-col">
          {folder.subfolders.map(sub => (
            <NavItem key={sub.id} folder={sub} level={level + 1} currentPath={currentPath} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans selection:bg-primary selection:text-white">
      {/* Sidebar */}
      <aside className="w-80 flex-shrink-0 border-r border-border/50 bg-card/50 backdrop-blur flex flex-col">
        {/* Logo Area */}
        <div className="p-8 pb-10 flex items-center gap-4 border-b border-border/50">
          <img src={audiLogo} alt="Audi Logo" className="h-8" />
          <div className="h-6 w-px bg-border/50"></div>
          <h1 className="font-extended font-bold text-lg leading-none tracking-widest mt-1">
            Nous<br/>Sommes<br/>Audi
          </h1>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          <nav className="flex flex-col gap-0.5">
            <Link href="/" className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 border-l-2",
                location === "/" || location === ""
                  ? "bg-primary/10 border-primary text-white font-medium" 
                  : "border-transparent text-muted-foreground hover:bg-white/5 hover:text-white"
              )}>
                <span className="font-extended">VUE D'ENSEMBLE</span>
            </Link>
            <div className="h-px bg-border/50 my-2 mx-4"></div>
            {directoryStructure.map(folder => (
              <NavItem key={folder.id} folder={folder} currentPath={location} />
            ))}
          </nav>
        </div>
        
        {/* Footer info */}
        <div className="p-6 border-t border-border/50 flex justify-center items-center opacity-70">
          <img src={romanceLogo} alt="Romance Agency Logo" className="h-6 opacity-80 hover:opacity-100 transition-opacity" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none"></div>
        
        <header className="h-20 border-b border-border/50 flex items-center px-10 relative z-10 bg-background/50 backdrop-blur-md">
           <div className="flex-1"></div>
           <div className="flex items-center gap-2 text-muted-foreground/60 border border-white/10 px-3 py-1.5 rounded-full bg-black/20">
             <ShieldAlert className="w-3 h-3 text-destructive" />
             <span className="text-[10px] font-extended uppercase tracking-widest font-bold">Plateforme Confidentielle</span>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto relative z-10 custom-scrollbar flex flex-col">
          <div className="p-10 flex-1">
            {children}
          </div>
          
          <footer className="mt-auto border-t border-border/50 p-6 text-center bg-black/20 backdrop-blur-sm">
            <p className="text-xs text-muted-foreground/60 max-w-4xl mx-auto leading-relaxed">
              <strong>CONFIDENTIEL</strong> &mdash; Le contenu de ce répertoire est strictement réservé à un usage interne Audi et Romance Agency. 
              Toute reproduction, distribution ou communication à des tiers sans autorisation préalable est formellement interdite.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
