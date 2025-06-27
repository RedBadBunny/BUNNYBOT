import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Users as UsersIcon, CheckCircle, XCircle, Info, MessageCircle, Crown, Shield } from "lucide-react";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AddGroupModal } from "@/components/modals/add-group-modal";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { Group } from "@shared/schema";

export default function Groups() {
  const [addGroupModalOpen, setAddGroupModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('simple');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: groups, isLoading } = useQuery({
    queryKey: ['/api/groups'],
  });

  const { data: enrichedGroups, isLoading: enrichedLoading } = useQuery({
    queryKey: ['/api/groups/enriched'],
    enabled: viewMode === 'detailed',
  });

  const toggleGroupMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      api.updateGroup(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Grupo actualizado",
        description: "El estado del grupo se ha actualizado.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el grupo.",
        variant: "destructive",
      });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id: number) => api.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Grupo eliminado",
        description: "El grupo se ha eliminado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el grupo.",
        variant: "destructive",
      });
    },
  });

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

  const groupsArray = (groups as Group[]) || [];
  const activeGroups = groupsArray.filter(g => g.isActive).length;
  const totalGroups = groupsArray.length;

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto">
        <Header 
          title="Grupos" 
          description="Administra los grupos de Telegram donde se enviarán los mensajes" 
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
        title="Grupos" 
        description="Administra los grupos de Telegram donde se enviarán los mensajes" 
      />

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total de Grupos</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{totalGroups}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UsersIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Grupos Activos</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{activeGroups}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Grupos Inactivos</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{totalGroups - activeGroups}</p>
                </div>
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Todos los Grupos ({totalGroups})
            </h3>
            <p className="text-sm text-slate-500">
              Administra los grupos donde el bot enviará mensajes
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'simple' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('simple')}
              >
                Simple
              </Button>
              <Button
                variant={viewMode === 'detailed' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('detailed')}
              >
                <Info className="w-4 h-4 mr-1" />
                Detallado
              </Button>
            </div>
            <Button onClick={() => setAddGroupModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Grupo
            </Button>
          </div>
        </div>

        {/* Groups List */}
        {!groupsArray || groupsArray.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No hay grupos configurados
              </h3>
              <p className="text-slate-500 mb-6">
                Agrega grupos de Telegram para comenzar a enviar mensajes
              </p>
              <Button onClick={() => setAddGroupModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Primer Grupo
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === 'simple' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groupsArray.map((group: Group) => (
              <Card key={group.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <Badge variant={group.isActive ? "default" : "secondary"}>
                          {group.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 font-mono">
                        {group.chatId}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Agregado {formatRelativeTime(group.createdAt.toString())}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={group.isActive}
                        onCheckedChange={(checked) => toggleGroupMutation.mutate({ 
                          id: group.id, 
                          isActive: checked 
                        })}
                        disabled={toggleGroupMutation.isPending}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <span className="flex items-center space-x-1">
                        {group.isActive ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-slate-400" />
                        )}
                        <span>
                          {group.isActive ? "Recibiendo mensajes" : "Sin mensajes"}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteGroupMutation.mutate(group.id)}
                        disabled={deleteGroupMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Detailed View */
          <div className="space-y-6">
            {enrichedLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-slate-200 h-48 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : enrichedGroups && (enrichedGroups as any[]).length > 0 ? (
              (enrichedGroups as any[]).map((group: any) => (
                <Card key={group.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <CardTitle className="text-xl">{group.name}</CardTitle>
                          <Badge variant={group.isActive ? "default" : "secondary"}>
                            {group.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                          {group.telegramInfo?.canSendMessages ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <MessageCircle className="w-3 h-3 mr-1" />
                              Puede enviar
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              <XCircle className="w-3 h-3 mr-1" />
                              Sin permisos
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 font-mono mb-1">
                          {group.chatId}
                        </p>
                        {group.telegramInfo && (
                          <h3 className="text-lg font-medium text-slate-800">
                            {group.telegramInfo.title}
                          </h3>
                        )}
                      </div>
                      <Switch
                        checked={group.isActive}
                        onCheckedChange={(checked) => toggleGroupMutation.mutate({ 
                          id: group.id, 
                          isActive: checked 
                        })}
                        disabled={toggleGroupMutation.isPending}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {group.telegramInfo ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Group Info */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-slate-900 flex items-center">
                            <Info className="w-4 h-4 mr-2" />
                            Información del Grupo
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-600">Tipo</span>
                              <Badge variant="outline">
                                {group.telegramInfo.type === 'group' ? 'Grupo' : 'Supergrupo'}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-600">Miembros</span>
                              <div className="flex items-center space-x-1">
                                <UsersIcon className="w-4 h-4 text-slate-500" />
                                <span className="font-medium">{group.telegramInfo.memberCount}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-600">Estado del Bot</span>
                              <div className="flex items-center space-x-1">
                                {group.telegramInfo.isBot ? (
                                  <>
                                    <Crown className="w-4 h-4 text-green-500" />
                                    <span className="text-sm text-green-600">Conectado</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-4 h-4 text-red-500" />
                                    <span className="text-sm text-red-600">No conectado</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Permissions */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-slate-900 flex items-center">
                            <Shield className="w-4 h-4 mr-2" />
                            Permisos
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-600">Enviar mensajes</span>
                              {group.telegramInfo.canSendMessages ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-600">Bot activo</span>
                              {group.telegramInfo.isBot ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-slate-900">Acciones</h4>
                          <div className="space-y-2">
                            <Button variant="outline" size="sm" className="w-full">
                              <Edit className="w-4 h-4 mr-2" />
                              Editar Grupo
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => deleteGroupMutation.mutate(group.id)}
                              disabled={deleteGroupMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <XCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h4 className="font-medium text-slate-900 mb-2">No se puede acceder al grupo</h4>
                        <p className="text-sm text-slate-500">
                          El bot no tiene acceso a este grupo o el token no es válido
                        </p>
                      </div>
                    )}
                    
                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t border-slate-200">
                      <p className="text-xs text-slate-400">
                        Agregado {formatRelativeTime(group.createdAt.toString())}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Info className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No se pudo cargar información detallada
                  </h3>
                  <p className="text-slate-500">
                    Verifica que el token del bot sea válido y que tenga acceso a los grupos
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <AddGroupModal open={addGroupModalOpen} onOpenChange={setAddGroupModalOpen} />
    </div>
  );
}
