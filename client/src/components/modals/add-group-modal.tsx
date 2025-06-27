import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  chatId: z.string().min(1, "El Chat ID es requerido"),
  isActive: z.boolean().default(true),
});

interface AddGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddGroupModal({ open, onOpenChange }: AddGroupModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      chatId: "",
      isActive: true,
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => api.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Grupo agregado",
        description: "El grupo se ha agregado exitosamente.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo agregar el grupo.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createGroupMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Grupo</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Grupo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Marketing Digital" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="chatId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chat ID del Grupo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: -1001234567890" {...field} />
                  </FormControl>
                  <p className="text-xs text-slate-500">
                    El Chat ID del grupo de Telegram (debe comenzar con -)
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Activar grupo
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      El bot enviará mensajes a este grupo
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createGroupMutation.isPending}
              >
                {createGroupMutation.isPending ? "Agregando..." : "Agregar Grupo"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
