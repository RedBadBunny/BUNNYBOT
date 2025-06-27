import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, Zap } from "lucide-react";

import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import type { Schedule, Ad, Group } from "@shared/schema";

export default function SchedulePage() {
  const { data: schedules, isLoading: schedulesLoading } = useQuery({
    queryKey: ['/api/schedules'],
    refetchInterval: 30000,
  });

  const { data: ads } = useQuery({
    queryKey: ['/api/ads'],
  });

  const { data: groups } = useQuery({
    queryKey: ['/api/groups'],
  });

  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
  });

  const getAdTitle = (adId: number) => {
    const ad = ads?.find((a: Ad) => a.id === adId);
    return ad?.title || `Anuncio #${adId}`;
  };

  const getGroupName = (groupId: number) => {
    const group = groups?.find((g: Group) => g.id === groupId);
    return group?.name || `Grupo #${groupId}`;
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeUntil = (date: string) => {
    const now = new Date();
    const target = new Date(date);
    const diffMs = target.getTime() - now.getTime();
    
    if (diffMs <= 0) return "Vencido";
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 60) return `En ${diffMinutes}m`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;
    return `En ${diffHours}h ${remainingMinutes}m`;
  };

  const intervalMinutes = settings?.find(s => s.key === 'interval_minutes')?.value || '60';
  const variationMinutes = settings?.find(s => s.key === 'interval_variation_minutes')?.value || '10';
  const autoSendEnabled = settings?.find(s => s.key === 'auto_send_enabled')?.value === 'true';

  const pendingSchedules = schedules?.filter((s: Schedule) => !s.isCompleted) || [];
  const completedSchedules = schedules?.filter((s: Schedule) => s.isCompleted) || [];
  const upcomingSchedules = pendingSchedules.filter((s: Schedule) => new Date(s.scheduledFor) > new Date());
  const overdueSchedules = pendingSchedules.filter((s: Schedule) => new Date(s.scheduledFor) <= new Date());

  if (schedulesLoading) {
    return (
      <div className="flex-1 overflow-y-auto">
        <Header 
          title="Programación" 
          description="Visualiza y gestiona el calendario de envío de mensajes" 
        />
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-200 h-32 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <Header 
        title="Programación" 
        description="Visualiza y gestiona el calendario de envío de mensajes" 
      />

      <div className="p-6 space-y-6">
        {/* Configuration Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Configuración del Programador</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-blue-900">Intervalo Base</h3>
                <p className="text-2xl font-bold text-blue-600">{intervalMinutes}m</p>
                <p className="text-sm text-blue-600">Entre mensajes</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <Calendar className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <h3 className="font-semibold text-amber-900">Variación</h3>
                <p className="text-2xl font-bold text-amber-600">±{variationMinutes}m</p>
                <p className="text-sm text-amber-600">Aleatorización</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                  autoSendEnabled ? 'bg-green-500' : 'bg-slate-400'
                }`}>
                  <div className={`w-4 h-4 rounded-full ${
                    autoSendEnabled ? 'bg-white animate-pulse' : 'bg-slate-200'
                  }`} />
                </div>
                <h3 className="font-semibold text-green-900">Estado</h3>
                <p className={`text-2xl font-bold ${
                  autoSendEnabled ? 'text-green-600' : 'text-slate-600'
                }`}>
                  {autoSendEnabled ? 'Activo' : 'Pausado'}
                </p>
                <p className={`text-sm ${
                  autoSendEnabled ? 'text-green-600' : 'text-slate-600'
                }`}>
                  Envío automático
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{upcomingSchedules.length}</p>
              <p className="text-sm text-slate-600">Próximos</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{overdueSchedules.length}</p>
              <p className="text-sm text-slate-600">Vencidos</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{completedSchedules.length}</p>
              <p className="text-sm text-slate-600">Completados</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-slate-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{schedules?.length || 0}</p>
              <p className="text-sm text-slate-600">Total</p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Schedules */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Envíos</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSchedules.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                No hay envíos programados próximamente
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingSchedules
                  .sort((a: Schedule, b: Schedule) => 
                    new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
                  )
                  .slice(0, 10)
                  .map((schedule: Schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h4 className="font-medium text-slate-900">
                            {getAdTitle(schedule.adId)}
                          </h4>
                          <Badge variant="outline">
                            {getGroupName(schedule.groupId)}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500">
                          {formatDateTime(schedule.scheduledFor.toString())}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">
                          {formatTimeUntil(schedule.scheduledFor.toString())}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overdue Schedules */}
        {overdueSchedules.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Envíos Vencidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overdueSchedules.map((schedule: Schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="font-medium text-slate-900">
                          {getAdTitle(schedule.adId)}
                        </h4>
                        <Badge variant="outline">
                          {getGroupName(schedule.groupId)}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">
                        Programado para: {formatDateTime(schedule.scheduledFor.toString())}
                      </p>
                    </div>
                    <Badge variant="destructive">
                      Vencido
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
