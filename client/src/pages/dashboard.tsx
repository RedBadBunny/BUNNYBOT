import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Send, 
  Users, 
  Clock, 
  BarChart3, 
  Plus, 
  Calendar,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle
} from "lucide-react";

import { Header } from "@/components/header";
import { StatsCard } from "@/components/stats-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { AddAdModal } from "@/components/modals/add-ad-modal";
import { AddGroupModal } from "@/components/modals/add-group-modal";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { Ad, Log } from "@shared/schema";

export default function Dashboard() {
  const [addAdModalOpen, setAddAdModalOpen] = useState(false);
  const [addGroupModalOpen, setAddGroupModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats'],
    refetchInterval: 30000,
  });

  const { data: ads } = useQuery({
    queryKey: ['/api/ads'],
    refetchInterval: 60000,
  });

  const { data: logs } = useQuery({
    queryKey: ['/api/logs'],
    select: (data: Log[]) => data.slice(0, 10),
    refetchInterval: 30000,
  });

  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
  });

  const restartBotMutation = useMutation({
    mutationFn: api.restartBot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Bot reiniciado",
        description: "El bot se ha reiniciado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo reiniciar el bot.",
        variant: "destructive",
      });
    },
  });

  const toggleAutoSendMutation = useMutation({
    mutationFn: (enabled: boolean) => 
      api.updateSetting({ key: 'auto_send_enabled', value: enabled.toString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Configuración actualizada",
        description: "El envío automático se ha actualizado.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la configuración.",
        variant: "destructive",
      });
    },
  });

  const autoSendEnabled = settings?.find(s => s.key === 'auto_send_enabled')?.value === 'true';

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
    }
  };

  const getLogIconBg = (type: string) => {
    switch (type) {
      case 'success':
        return "bg-green-100";
      case 'error':
        return "bg-red-100";
      case 'info':
        return "bg-blue-100";
      default:
        return "bg-amber-100";
    }
  };

  const formatTimeUntilNext = (nextScheduled: string | null) => {
    if (!nextScheduled) return "N/A";
    
    const now = new Date();
    const next = new Date(nextScheduled);
    const diffMs = next.getTime() - now.getTime();
    
    if (diffMs <= 0) return "Ahora";
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 60) return `${diffMinutes}m`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;
    return `${diffHours}h ${remainingMinutes}m`;
  };

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const target = new Date(date);
    const diffMs = now.getTime() - target.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return "Ahora";
    if (diffMinutes < 60) return `Hace ${diffMinutes}m`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays}d`;
  };

  if (statsLoading) {
    return (
      <div className="flex-1 overflow-y-auto">
        <Header 
          title="Dashboard" 
          description="Gestiona tu bot de Telegram y campañas publicitarias" 
        />
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-slate-200 h-32 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <Header 
        title="Dashboard" 
        description="Gestiona tu bot de Telegram y campañas publicitarias" 
      />

      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Mensajes Enviados"
            value={stats?.messagesSent || 0}
            subtitle="Total enviados"
            icon={Send}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
          
          <StatsCard
            title="Grupos Activos"
            value={stats?.activeGroups || 0}
            subtitle="Grupos configurados"
            icon={Users}
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
          
          <StatsCard
            title="Próximo Envío"
            value={formatTimeUntilNext(stats?.nextScheduled)}
            subtitle="Tiempo restante"
            icon={Clock}
            iconColor="text-amber-600"
            iconBgColor="bg-amber-100"
          />
          
          <StatsCard
            title="Tasa de Éxito"
            value={`${stats?.successRate || 0}%`}
            subtitle="Mensajes exitosos"
            icon={BarChart3}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Actividad Reciente</CardTitle>
                  <Button variant="ghost" size="sm">
                    Ver todo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!logs || logs.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">
                    No hay actividad reciente
                  </p>
                ) : (
                  <div className="space-y-4">
                    {logs.map((log) => (
                      <div key={log.id} className="flex items-start space-x-4">
                        <div className={`w-8 h-8 ${getLogIconBg(log.type)} rounded-full flex items-center justify-center flex-shrink-0`}>
                          {getLogIcon(log.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-900">{log.message}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {formatRelativeTime(log.createdAt.toString())}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Quick Add */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => setAddAdModalOpen(true)}
                  className="w-full justify-start space-x-3 bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
                  variant="outline"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Anuncio</span>
                </Button>
                <Button
                  onClick={() => setAddGroupModalOpen(true)}
                  className="w-full justify-start space-x-3 bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                  variant="outline"
                >
                  <Users className="w-4 h-4" />
                  <span>Agregar Grupo</span>
                </Button>
                <Button
                  className="w-full justify-start space-x-3 bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-200"
                  variant="outline"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Programar Envío</span>
                </Button>
              </CardContent>
            </Card>

            {/* Bot Control */}
            <Card>
              <CardHeader>
                <CardTitle>Control del Bot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Estado del Bot</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      stats?.botOnline ? "bg-green-500" : "bg-red-500"
                    }`} />
                    <span className={`text-sm ${
                      stats?.botOnline ? "text-green-600" : "text-red-600"
                    }`}>
                      {stats?.botOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Envío Automático</span>
                  <Switch
                    checked={autoSendEnabled}
                    onCheckedChange={(checked) => toggleAutoSendMutation.mutate(checked)}
                    disabled={toggleAutoSendMutation.isPending}
                  />
                </div>
                
                <div className="pt-2 border-t border-slate-200">
                  <Button
                    onClick={() => restartBotMutation.mutate()}
                    disabled={restartBotMutation.isPending}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
                    variant="outline"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {restartBotMutation.isPending ? "Reiniciando..." : "Reiniciar Bot"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Current Ads Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Anuncios Activos</CardTitle>
              <Button>
                Gestionar Anuncios
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!ads || ads.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                No hay anuncios configurados
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ads.slice(0, 6).map((ad: Ad) => (
                  <div
                    key={ad.id}
                    className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-slate-900 text-sm truncate">
                        {ad.title}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        ad.isActive 
                          ? "bg-green-100 text-green-700" 
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {ad.isActive ? "Activo" : "Pausado"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                      {ad.content.length > 100 
                        ? `${ad.content.substring(0, 100)}...` 
                        : ad.content
                      }
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Creado {formatRelativeTime(ad.createdAt.toString())}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AddAdModal open={addAdModalOpen} onOpenChange={setAddAdModalOpen} />
      <AddGroupModal open={addGroupModalOpen} onOpenChange={setAddGroupModalOpen} />
    </div>
  );
}
