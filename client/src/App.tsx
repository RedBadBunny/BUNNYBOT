import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/sidebar";

// Pages
import Dashboard from "@/pages/dashboard";
import Ads from "@/pages/ads";
import Groups from "@/pages/groups";
import SchedulePage from "@/pages/schedule";
import Logs from "@/pages/logs";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/ads" component={Ads} />
        <Route path="/groups" component={Groups} />
        <Route path="/schedule" component={SchedulePage} />
        <Route path="/logs" component={Logs} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
