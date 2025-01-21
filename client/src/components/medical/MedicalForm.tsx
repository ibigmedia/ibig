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
import { Save, Plus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MedicalFormData {
  name: string;
  birthDate: string;
  isDiabetic: boolean;
  notes?: string;
  drugAllergies?: string;
  foodAllergies?: string;
}

interface BloodPressureData {
  systolic: number;
  diastolic: number;
  pulse: number;
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

  const { data: bloodPressureRecords = [] } = useQuery({
    queryKey: ['/api/blood-pressure'],
  });

  const { register, handleSubmit, setValue, watch } = useForm<MedicalFormData>({
    defaultValues: {
      name: '',
      birthDate: '',
      isDiabetic: false,
      notes: '',
      drugAllergies: '',
      foodAllergies: '',
    },
  });

  const {
    register: registerBP,
    handleSubmit: handleSubmitBP,
    reset: resetBP,
  } = useForm<BloodPressureData>({
    defaultValues: {
      systolic: 120,
      diastolic: 80,
      pulse: 72,
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
      setValue('drugAllergies', medicalRecord.drugAllergies);
      setValue('foodAllergies', medicalRecord.foodAllergies);
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

  const bloodPressureMutation = useMutation({
    mutationFn: async (data: BloodPressureData) => {
      const response = await fetch('/api/blood-pressure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          measuredAt: new Date().toISOString(),
        }),
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
        description: '혈압 기록이 저장되었습니다.',
      });
      resetBP();
      queryClient.invalidateQueries({ queryKey: ['/api/blood-pressure'] });
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

  const onSubmitBP = handleSubmitBP((data) => {
    bloodPressureMutation.mutate(data);
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

      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold">{t('medical.allergies')}</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{t('medical.drugAllergy')}</Label>
            <Textarea {...register('drugAllergies')} placeholder="약물 알러지가 있다면 입력해주세요." />
          </div>
          <div>
            <Label>{t('medical.foodAllergy')}</Label>
            <Textarea {...register('foodAllergies')} placeholder="음식 알러지가 있다면 입력해주세요." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h3 className="text-lg font-bold">혈압 관리</h3>
          <form onSubmit={onSubmitBP} className="flex items-center gap-2">
            <div className="grid grid-cols-4 gap-2">
              <Input
                type="number"
                placeholder="수축기"
                className="w-20"
                {...registerBP('systolic', { required: true })}
              />
              <Input
                type="number"
                placeholder="이완기"
                className="w-20"
                {...registerBP('diastolic', { required: true })}
              />
              <Input
                type="number"
                placeholder="맥박"
                className="w-20"
                {...registerBP('pulse', { required: true })}
              />
              <Input
                placeholder="메모"
                {...registerBP('notes')}
              />
            </div>
            <Button type="submit" size="sm">
              <Plus className="h-4 w-4" />
              기록추가
            </Button>
          </form>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>날짜</TableHead>
                <TableHead>수축기</TableHead>
                <TableHead>이완기</TableHead>
                <TableHead>맥박</TableHead>
                <TableHead>메모</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bloodPressureRecords.map((record: any) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {new Date(record.measuredAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{record.systolic}</TableCell>
                  <TableCell>{record.diastolic}</TableCell>
                  <TableCell>{record.pulse}</TableCell>
                  <TableCell>{record.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EmergencyContacts />
    </div>
  );
}