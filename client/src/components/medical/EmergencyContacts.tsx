import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import type { SelectEmergencyContact } from '@db/schema';
import { Phone, Mail, Star } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  email: z.string().email().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

function EmergencyContactDialog({ 
  isOpen, 
  onOpenChange,
  initialData,
}: { 
  isOpen: boolean; 
  onOpenChange: (open: boolean) => void;
  initialData?: SelectEmergencyContact;
}) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      relationship: initialData?.relationship ?? '',
      phoneNumber: initialData?.phoneNumber ?? '',
      email: initialData?.email ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: ContactFormValues) => {
      const response = await fetch(
        initialData ? `/api/emergency-contacts/${initialData.id}` : '/api/emergency-contacts',
        {
          method: initialData ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-contacts'] });
      toast({
        title: t('auth.success'),
        description: t('emergency.success'),
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: t('auth.error'),
        description: t('emergency.error'),
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? t('emergency.editContact') : t('emergency.addContact')}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('medical.name')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('emergency.relationship')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('emergency.phoneNumber')}</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('emergency.email')}</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              {initialData ? t('emergency.editContact') : t('emergency.addContact')}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function EmergencyContacts() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedContact, setSelectedContact] = React.useState<SelectEmergencyContact | undefined>();
  const queryClient = useQueryClient();

  const { data: contacts = [] } = useQuery<SelectEmergencyContact[]>({
    queryKey: ['emergency-contacts'],
  });

  const setMainContact = useMutation({
    mutationFn: async (contactId: number) => {
      const response = await fetch(`/api/emergency-contacts/${contactId}/main`, {
        method: 'PUT',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-contacts'] });
      toast({
        title: t('auth.success'),
        description: t('emergency.success'),
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: t('auth.error'),
        description: t('emergency.error'),
      });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <h3 className="text-lg font-bold">{t('emergency.contacts')}</h3>
        <Button
          onClick={() => {
            setSelectedContact(undefined);
            setIsDialogOpen(true);
          }}
        >
          {t('emergency.addContact')}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{contact.name}</h4>
                  {contact.isMainContact && (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {contact.phoneNumber}
                  </span>
                  {contact.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {contact.email}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedContact(contact);
                    setIsDialogOpen(true);
                  }}
                >
                  {t('emergency.editContact')}
                </Button>
                {!contact.isMainContact && (
                  <Button
                    variant="secondary"
                    onClick={() => setMainContact.mutate(contact.id)}
                  >
                    {t('emergency.setAsMain')}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <EmergencyContactDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={selectedContact}
      />
    </Card>
  );
}