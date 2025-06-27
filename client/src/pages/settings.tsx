import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Save, Bot, Clock, Settings as SettingsIcon, Zap, CheckCircle, XCircle } from "lucide-react";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { Setting } from "@shared/schema";

const settingsSchema = z.object({
  bot_token: z.string().min(1, "El token del bot es requerido"),
  bot_username: z.string().optional(),
  bot_id: z.string().optional(),
  owner_phone: z.string().optional(),
  auto_send_enabled: z.boolean(),
  interval_minutes: z.coerce.number().min(1, "El intervalo debe ser al menos 1 minuto").max(1440, "El intervalo no puede ser mayor a 24 horas"),
  interval_variation_minutes: z.coerce.number().min(0, "La variación no puede ser negativa").max(60, "La variación no puede ser mayor a 60 minutos"),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/settings'],
  });

  const testBotMutation = useMutation({
    mutationFn: () => api.testBot(),
    onSuccess: (data: any) => {
      toast({
        title: "Prueba de Bot",
        description: data.message,
        duration: 3000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error en la prueba",
        description: error.message || "No se pudo conectar al bot",
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      bot_token: "",
      bot_username: "",
      bot_id: "",
      owner_phone: "",
      auto_send_enabled: true,
      interval_minutes: 60,
      interval_variation_minutes: 10,
    },
  });

  // Update form when settings are loaded
  React.useEffect(() => {
    if (settings && Array.isArray(settings)) {
      const settingsMap = settings.reduce((acc: Record<string, string>, setting: Setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});

      form.reset({
        bot_token: settingsMap.bot_token || "",
        bot_username: settingsMap.bot_username || "",
        bot_id: settingsMap.bot_id || "",
        owner_phone: settingsMap.owner_phone || "",
        auto_send_enabled: settingsMap.auto_send_enabled === 'true',
        interval_minutes: parseInt(settingsMap.interval_minutes || '60'),
        interval_variation_minutes: parseInt(settingsMap.interval_variation_minutes || '10'),
      });
    }
  }, [settings, form]);

  const updateSettingMutation = useMutation({
    mutationFn: (setting: { key: string; value: string }) => api.updateSetting(setting),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la configuración.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: SettingsFormData) => {
    try {
      const updatePromises = [
        updateSettingMutation.mutateAsync({ key: 'bot_token', value: data.bot_token }),
        updateSettingMutation.mutateAsync({ key: 'auto_send_enabled', value: data.auto_send_enabled.toString() }),
        updateSettingMutation.mutateAsync({ key: 'interval_minutes', value: data.interval_minutes.toString() }),
        updateSettingMutation.mutateAsync({ key: 'interval_variation_minutes', value: data.interval_variation_minutes.toString() }),
      ];

      if (data.bot_username) {
        updatePromises.push(updateSettingMutation.mutateAsync({ key: 'bot_username', value: data.bot_username }));
      }
      if (data.bot_id) {
        updatePromises.push(updateSettingMutation.mutateAsync({ key: 'bot_id', value: data.bot_id }));
      }
      if (data.owner_phone) {
        updatePromises.push(updateSettingMutation.mutateAsync({ key: 'owner_phone', value: data.owner_phone }));
      }

      await Promise.all(updatePromises);

      toast({
        title: "Configuración guardada",
        description: "Todos los cambios se han guardado exitosamente.",
      });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto">
        <Header 
          title="Configuración" 
          description="Ajusta la configuración del bot y las opciones de envío" 
        />
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="bg-slate-200 h-64 rounded-xl"></div>
            <div className="bg-slate-200 h-32 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <Header 
        title="Configuración" 
        description="Ajusta la configuración del bot y las opciones de envío" 
      />

      <div className="p-6 space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Bot Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-5 h-5" />
                  <span>Configuración del Bot</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="bot_token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token del Bot de Telegram</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Obtén tu token creando un bot con @BotFather en Telegram
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="bot_username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre de Usuario del Bot</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="@mi_bot_publicitario"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Nombre de usuario único del bot (opcional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bot_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID del Bot</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="1234567890"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          ID numérico único del bot (opcional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="owner_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Teléfono del Propietario</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+1234567890"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Tu número de teléfono asociado con la cuenta de Telegram (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="auto_send_enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Envío Automático
                        </FormLabel>
                        <FormDescription>
                          Permite que el bot envíe mensajes automáticamente según la programación
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Test Bot Connection */}
                <div className="pt-6 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-900 mb-1">
                        Probar Conexión del Bot
                      </h4>
                      <p className="text-sm text-slate-500">
                        Verifica que el bot esté configurado correctamente
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => testBotMutation.mutate()}
                      disabled={testBotMutation.isPending || !form.getValues('bot_token')}
                    >
                      {testBotMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mr-2" />
                          Probando...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Probar Bot
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scheduling Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Configuración de Programación</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="interval_minutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Intervalo Base (minutos)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="1440"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Tiempo base entre envío de mensajes (1-1440 minutos)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="interval_variation_minutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Variación (±minutos)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            max="60"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Variación aleatoria para evitar detección (0-60 minutos)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Ejemplo de Programación</h4>
                  <p className="text-sm text-blue-700">
                    Con un intervalo de {form.watch('interval_minutes') || 60} minutos y variación de ±{form.watch('interval_variation_minutes') || 10} minutos,
                    los mensajes se enviarán cada {(form.watch('interval_minutes') || 60) - (form.watch('interval_variation_minutes') || 10)} a {(form.watch('interval_minutes') || 60) + (form.watch('interval_variation_minutes') || 10)} minutos aproximadamente.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <SettingsIcon className="w-5 h-5" />
                  <span>Información del Sistema</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-medium text-slate-900">Versión de la Aplicación</h4>
                    <p className="text-sm text-slate-600">TeleBot Manager v2.1.0</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-slate-900">Entorno</h4>
                    <p className="text-sm text-slate-600">Producción</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-slate-900">Base de Datos</h4>
                    <p className="text-sm text-slate-600">Memoria (MemStorage)</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-slate-900">Última Actualización</h4>
                    <p className="text-sm text-slate-600">
                      {settings && Array.isArray(settings) && settings[0]?.updatedAt ? 
                        new Date(settings[0].updatedAt).toLocaleString('es-ES') : 
                        'No disponible'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={updateSettingMutation.isPending}
                className="px-8"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateSettingMutation.isPending ? "Guardando..." : "Guardar Configuración"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
