import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import audiLogo from "@assets/Audi_Rings_wh-RGB_1772014848825.png";
import romanceLogo from "@assets/logo-r-white_1772015879043.png";
import { ShieldAlert, Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem("audi_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        sessionStorage.setItem("audi_auth", "true");
        setIsAuthenticated(true);
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

  if (isAuthenticated) {
    return <>{children}</>;
  }

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
        <img src={audiLogo} alt="Audi Logo" className="h-10 mb-10" data-testid="img-audi-logo" />
        
        <div className="w-full bg-zinc-950/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-primary"></div>
          
          <div className="flex flex-col items-center mb-8">
             <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary">
                <ShieldAlert className="w-6 h-6" />
             </div>
             <h2 className="text-xl font-extended font-bold text-white text-center mb-2 uppercase tracking-widest" data-testid="text-auth-title">Accès Sécurisé</h2>
             <p className="text-muted-foreground text-center font-light text-sm">Veuillez saisir votre code PIN pour accéder au répertoire créatif.</p>
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
                data-testid="input-pin"
              />
              {error && <span className="text-destructive text-xs text-center font-bold tracking-wide uppercase mt-1" data-testid="text-error">Code PIN incorrect</span>}
            </div>
            
            <button 
              type="submit"
              disabled={loading || pin.length === 0}
              className="w-full bg-white hover:bg-white/90 disabled:bg-white/50 disabled:cursor-not-allowed text-black font-extended font-bold uppercase tracking-widest text-sm py-4 rounded-lg transition-colors mt-2 flex items-center justify-center gap-2"
              data-testid="button-submit"
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
