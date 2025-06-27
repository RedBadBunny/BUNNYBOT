import { useQuery } from "@tanstack/react-query";
import { 
  CheckCircle, 
  XCircle, 
  Info, 
  AlertCircle,
  FileText,
  Calendar
} from "lucide-react";

import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { Log } from "@shared/schema";

export default function Logs() {
  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ['/api/logs'],
    refetchInterval: 30000,
  });

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
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

  const getLogBadgeVariant = (type: string): "default" | "destructive" | "secondary" => {
    switch (type) {
      case 'success':
        return "default";
      case 'error':
        return "destructive";
      default:
        return "secondary";
    }
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
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

  const successLogs = logs?.filter((log: Log) => log.type === 'success').length || 0;
  const errorLogs = logs?.filter((log: Log) => log.type === 'error').length || 0;
  const infoLogs = logs?.filter((log: Log) => log.type === 'info').length || 0;
  const totalLogs = logs?.length || 0;

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto">
        <Header 
          title="Actividad" 
          description="Monitorea la actividad del bot y el historial de mensajes" 
        />
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-slate-200 h-20 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <Header 
        title="Actividad" 
        description="Monitorea la actividad del bot y el historial de mensajes" 
      />

      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-slate-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{totalLogs}</p>
              <p className="text-sm text-slate-600">Total Eventos</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{successLogs}</p>
              <p className="text-sm text-slate-600">Exitosos</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{errorLogs}</p>
              <p className="text-sm text-slate-600">Errores</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Info className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{infoLogs}</p>
              <p className="text-sm text-slate-600">Informativos</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Registro de Actividad ({totalLogs} eventos)
            </h3>
            <p className="text-sm text-slate-500">
              Historial completo de la actividad del bot
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {!logs || logs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No hay actividad registrada
                </h3>
                <p className="text-slate-500">
                  Los eventos del bot aparecerán aquí conforme ocurran
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log: Log) => (
                  <div key={log.id} className="flex items-start space-x-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className={`w-10 h-10 ${getLogIconBg(log.type)} rounded-full flex items-center justify-center flex-shrink-0`}>
                      {getLogIcon(log.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <p className="text-sm font-medium text-slate-900">{log.message}</p>
                        <Badge variant={getLogBadgeVariant(log.type)}>
                          {log.type === 'success' ? 'Éxito' : 
                           log.type === 'error' ? 'Error' : 
                           log.type === 'info' ? 'Info' : 'Advertencia'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span>{formatDateTime(log.createdAt.toString())}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(log.createdAt.toString())}</span>
                        {log.adId && (
                          <>
                            <span>•</span>
                            <span>Anuncio #{log.adId}</span>
                          </>
                        )}
                        {log.groupId && (
                          <>
                            <span>•</span>
                            <span>Grupo #{log.groupId}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
