import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Play, Pause } from "lucide-react";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddAdModal } from "@/components/modals/add-ad-modal";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { Ad } from "@shared/schema";

export default function Ads() {
  const [addAdModalOpen, setAddAdModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ads, isLoading } = useQuery({
    queryKey: ['/api/ads'],
  });

  const toggleAdMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      api.updateAd(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Anuncio actualizado",
        description: "El estado del anuncio se ha actualizado.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el anuncio.",
        variant: "destructive",
      });
    },
  });

  const deleteAdMutation = useMutation({
    mutationFn: (id: number) => api.deleteAd(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Anuncio eliminado",
        description: "El anuncio se ha eliminado exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el anuncio.",
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

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto">
        <Header 
          title="Anuncios" 
          description="Gestiona tus mensajes publicitarios" 
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
        title="Anuncios" 
        description="Gestiona tus mensajes publicitarios" 
      />

      <div className="p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Todos los Anuncios ({ads?.length || 0})
            </h3>
            <p className="text-sm text-slate-500">
              Crea y administra tus campañas publicitarias
            </p>
          </div>
          <Button onClick={() => setAddAdModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Anuncio
          </Button>
        </div>

        {/* Ads List */}
        {!ads || ads.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No hay anuncios
              </h3>
              <p className="text-slate-500 mb-6">
                Comienza creando tu primer anuncio publicitario
              </p>
              <Button onClick={() => setAddAdModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Anuncio
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {ads.map((ad: Ad) => (
              <Card key={ad.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CardTitle className="text-lg">{ad.title}</CardTitle>
                        <Badge variant={ad.isActive ? "default" : "secondary"}>
                          {ad.isActive ? "Activo" : "Pausado"}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">
                        Creado {formatRelativeTime(ad.createdAt.toString())}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAdMutation.mutate({ 
                          id: ad.id, 
                          isActive: !ad.isActive 
                        })}
                        disabled={toggleAdMutation.isPending}
                      >
                        {ad.isActive ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteAdMutation.mutate(ad.id)}
                        disabled={deleteAdMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {ad.content}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddAdModal open={addAdModalOpen} onOpenChange={setAddAdModalOpen} />
    </div>
  );
}
