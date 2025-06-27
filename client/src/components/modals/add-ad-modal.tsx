import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { X, Smile } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const formSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  content: z.string().min(1, "El contenido es requerido"),
  isActive: z.boolean().default(true),
});

// Emojis Premium de Telegram
const PREMIUM_EMOJIS = [
  '🔥', '⭐', '💎', '👑', '🚀', '💯', '✨', '🎯', 
  '💰', '🎪', '🎨', '🎭', '🎬', '🎮', '🎉',
  '🌟', '💝', '🏆', '🎊', '🌈', '💫', '⚡',
  '🎈', '🎁', '🌺', '🌸', '🦄', '🔮', '💜',
  '❤️', '💚', '💙', '🧡', '💛', '🤍', '🖤'
];

interface AddAdModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAdModal({ open, onOpenChange }: AddAdModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      isActive: true,
    },
  });

  const createAdMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => api.createAd(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Anuncio creado",
        description: "El anuncio se ha creado exitosamente.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el anuncio.",
        variant: "destructive",
      });
    },
  });

  const insertEmoji = (emoji: string) => {
    const currentContent = form.getValues('content');
    const cursorPosition = document.querySelector('textarea')?.selectionStart || currentContent.length;
    const newContent = currentContent.slice(0, cursorPosition) + emoji + currentContent.slice(cursorPosition);
    form.setValue('content', newContent);
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createAdMutation.mutate(data);
  };

  const hasPremiumEmojis = (content: string) => {
    return PREMIUM_EMOJIS.some(emoji => content.includes(emoji));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Anuncio</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título del Anuncio</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingresa el título del anuncio" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    Contenido del Mensaje
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <Smile className="w-4 h-4 mr-2" />
                      Emojis Premium
                    </Button>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={6}
                      placeholder="Escribe el contenido de tu anuncio aquí... 🔥✨"
                      {...field}
                    />
                  </FormControl>
                  
                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Emojis Premium de Telegram</h4>
                      <div className="grid grid-cols-8 gap-2">
                        {PREMIUM_EMOJIS.map((emoji, index) => (
                          <button
                            key={index}
                            type="button"
                            className="p-2 text-lg hover:bg-slate-200 rounded transition-colors"
                            onClick={() => insertEmoji(emoji)}
                            title={`Insertar ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Premium Emoji Warning */}
                  {hasPremiumEmojis(form.watch('content')) && (
                    <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="w-4 h-4 bg-amber-500 rounded-full flex-shrink-0 mt-0.5"></div>
                      <div>
                        <p className="text-sm font-medium text-amber-800">Emojis Premium Detectados</p>
                        <p className="text-xs text-amber-700">
                          Asegúrate de que tu bot tenga Telegram Premium para que estos emojis se muestren correctamente.
                        </p>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-slate-500">
                    Puedes usar emojis premium, formato HTML de Telegram y texto normal
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
                      Activar inmediatamente
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      El anuncio comenzará a enviarse automáticamente
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
                disabled={createAdMutation.isPending}
              >
                {createAdMutation.isPending ? "Creando..." : "Crear Anuncio"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
