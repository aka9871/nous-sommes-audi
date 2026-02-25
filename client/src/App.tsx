import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AppLayout from "@/components/layout/AppLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        {/* Catch-all route for any folder path like /1 or /1.1 */}
        <Route path="/:folderId" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthGuard>
          <Router />
        </AuthGuard>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
