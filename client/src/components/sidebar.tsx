import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Megaphone, 
  Users, 
  Clock, 
  FileText, 
  Settings,
  Bot
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Anuncios", href: "/ads", icon: Megaphone },
  { name: "Grupos", href: "/groups", icon: Users },
  { name: "Programación", href: "/schedule", icon: Clock },
  { name: "Actividad", href: "/logs", icon: FileText },
  { name: "Configuración", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();
  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    refetchInterval: 30000,
  });

  const { data: ads } = useQuery({
    queryKey: ['/api/ads'],
    refetchInterval: 60000,
  });

  const { data: groups } = useQuery({
    queryKey: ['/api/groups'],
    refetchInterval: 60000,
  });

  const adsCount = ads?.length || 0;
  const groupsCount = groups?.filter(g => g.isActive).length || 0;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">TeleBot Manager</h1>
            <p className="text-xs text-slate-500">v2.1.0</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start space-x-3 ${
                  isActive 
                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
                {item.name === "Anuncios" && adsCount > 0 && (
                  <span className="ml-auto bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">
                    {adsCount}
                  </span>
                )}
                {item.name === "Grupos" && groupsCount > 0 && (
                  <span className="ml-auto bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">
                    {groupsCount}
                  </span>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Bot Status */}
      <div className="p-4 border-t border-slate-200">
        <div className={`flex items-center space-x-3 p-3 rounded-lg ${
          stats?.botOnline ? "bg-green-50" : "bg-red-50"
        }`}>
          <div className={`w-3 h-3 rounded-full ${
            stats?.botOnline ? "bg-green-500 animate-pulse" : "bg-red-500"
          }`} />
          <div className="flex-1">
            <p className={`text-sm font-medium ${
              stats?.botOnline ? "text-green-900" : "text-red-900"
            }`}>
              Bot {stats?.botOnline ? "Online" : "Offline"}
            </p>
            <p className={`text-xs ${
              stats?.botOnline ? "text-green-600" : "text-red-600"
            }`}>
              {stats?.schedulerRunning ? "Programador activo" : "Programador detenido"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
