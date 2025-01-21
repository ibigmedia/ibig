import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MedicalExport } from './MedicalExport';
import { EmergencyContacts } from './EmergencyContacts';
import { Save } from 'lucide-react';

interface MedicalFormData {
  name: string;
  birthDate: string;
  isDiabetic: boolean;
  notes?: string;
}

export function MedicalForm() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: medicalRecord } = useQuery({
    queryKey: ['/api/medical-records'],
    select: (records: any[]) => records[0],
  });

  const { register, handleSubmit, setValue, watch } = useForm<MedicalFormData>({
    defaultValues: {
      name: '',
      birthDate: '',
      isDiabetic: false,
      notes: '',
    },
  });

  // Update form when data is loaded
  React.useEffect(() => {
    if (medicalRecord) {
      setValue('name', medicalRecord.name);
      setValue('birthDate', medicalRecord.birthDate);
      setValue('isDiabetic', medicalRecord.isDiabetic);
      setValue('notes', medicalRecord.notes);
    }
  }, [medicalRecord, setValue]);

  const mutation = useMutation({
    mutationFn: async (data: MedicalFormData) => {
      const response = await fetch('/api/medical-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: '저장 완료',
        description: '의료 정보가 저장되었습니다.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/medical-records'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: '저장 실패',
        description: error.message,
      });
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data);
  });

  const isDiabetic = watch('isDiabetic');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button onClick={onSubmit} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          저장
        </Button>
        <div className="w-48">
          <MedicalExport />
        </div>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold">{t('medical.basicInfo')}</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('medical.name')}</Label>
              <Input {...register('name')} />
            </div>
            <div>
              <Label>{t('medical.birthdate')}</Label>
              <Input type="date" {...register('birthDate')} />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="diabetesCheck"
              checked={isDiabetic}
              onCheckedChange={(checked) => setValue('isDiabetic', checked as boolean)}
            />
            <Label htmlFor="diabetesCheck">{t('medical.diabetic')}</Label>
          </div>
          <div>
            <Label>{t('medical.notes')}</Label>
            <Textarea {...register('notes')} />
          </div>
        </CardContent>
      </Card>

      <EmergencyContacts />
      
    </div>
  );
}