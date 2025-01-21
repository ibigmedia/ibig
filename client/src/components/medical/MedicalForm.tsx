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
import { Save, Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmergencyContacts } from './EmergencyContacts';

interface Props {
  isHealthRecordOnly?: boolean;
}

interface DiseaseHistoryData {
  diseaseName: string;
  diagnosisDate: string;
  treatment: string;
  notes?: string;
}

interface BloodPressureData {
  systolic: number;
  diastolic: number;
  pulse: number;
  notes?: string;
}

interface BloodSugarData {
  bloodSugar: number;
  measurementType: string;
  notes?: string;
}

interface MedicalFormData {
  name: string;
  birthDate: string;
  isDiabetic: boolean;
  notes?: string;
  drugAllergies?: string;
  foodAllergies?: string;
}

export function MedicalForm({ isHealthRecordOnly = false }: Props) {
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

  const { data: bloodSugarRecords = [] } = useQuery({
    queryKey: ['/api/blood-sugar'],
  });

  const { data: diseaseHistories = [] } = useQuery({
    queryKey: ['/api/disease-histories'],
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

  // Blood Pressure Form
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

  // Blood Sugar Form
  const {
    register: registerBS,
    handleSubmit: handleSubmitBS,
    setValue: setValueBS,
    reset: resetBS,
  } = useForm<BloodSugarData>({
    defaultValues: {
      bloodSugar: 100,
      measurementType: 'before_meal',
      notes: '',
    },
  });

  // Disease History Form
  const {
    register: registerDH,
    handleSubmit: handleSubmitDH,
    reset: resetDH,
  } = useForm<DiseaseHistoryData>({
    defaultValues: {
      diseaseName: '',
      diagnosisDate: '',
      treatment: '',
      notes: '',
    },
  });

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

  // Medical Records Mutation
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
        title: t('success'),
        description: t('medical.saveSuccess'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/medical-records'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: error.message,
      });
    },
  });

  // Blood Pressure Mutation
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
        title: t('success'),
        description: t('medical.bloodPressureSaveSuccess'),
      });
      resetBP();
      queryClient.invalidateQueries({ queryKey: ['/api/blood-pressure'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: error.message,
      });
    },
  });

  // Blood Sugar Mutation
  const bloodSugarMutation = useMutation({
    mutationFn: async (data: BloodSugarData) => {
      const response = await fetch('/api/blood-sugar', {
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
        title: t('success'),
        description: t('medical.bloodSugarSaveSuccess'),
      });
      resetBS();
      queryClient.invalidateQueries({ queryKey: ['/api/blood-sugar'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: error.message,
      });
    },
  });

  // Disease History Mutation
  const diseaseHistoryMutation = useMutation({
    mutationFn: async (data: DiseaseHistoryData) => {
      const response = await fetch('/api/disease-histories', {
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
        title: t('success'),
        description: t('medical.diseaseHistorySaveSuccess'),
      });
      resetDH();
      queryClient.invalidateQueries({ queryKey: ['/api/disease-histories'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: t('error'),
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

  const onSubmitBS = handleSubmitBS((data) => {
    bloodSugarMutation.mutate(data);
  });

  const onSubmitDH = handleSubmitDH((data) => {
    diseaseHistoryMutation.mutate(data);
  });

  const isDiabetic = watch('isDiabetic');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button onClick={onSubmit} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          저장
        </Button>
        {!isHealthRecordOnly && (
          <div className="w-48">
            <MedicalExport />
          </div>
        )}
      </div>

      {!isHealthRecordOnly && (
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">기본 정보</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>이름</Label>
                <Input {...register('name')} />
              </div>
              <div>
                <Label>생년월일</Label>
                <Input type="date" {...register('birthDate')} />
              </div>
            </div>
            <div>
              <Label>메모</Label>
              <Textarea {...register('notes')} />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">건강 정보</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="diabetesCheck"
              checked={isDiabetic}
              onCheckedChange={(checked) => setValue('isDiabetic', checked as boolean)}
            />
            <Label htmlFor="diabetesCheck">당뇨병 여부</Label>
          </div>
          <div>
            <Label>약물 알레르기</Label>
            <Textarea
              {...register('drugAllergies')}
              placeholder="약물 알레르기가 있다면 입력해주세요."
            />
          </div>
          <div>
            <Label>음식 알레르기</Label>
            <Textarea
              {...register('foodAllergies')}
              placeholder="음식 알레르기가 있다면 입력해주세요."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold">과거 병력</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={onSubmitDH} className="grid grid-cols-2 gap-4">
            <Input
              placeholder="질병명"
              {...registerDH('diseaseName', { required: true })}
            />
            <Input
              type="date"
              {...registerDH('diagnosisDate', { required: true })}
            />
            <Input
              placeholder="치료내용"
              {...registerDH('treatment', { required: true })}
            />
            <Input
              placeholder="비고"
              {...registerDH('notes')}
            />
            <Button type="submit" className="col-span-2">
              <Plus className="h-4 w-4 mr-2" />
              추가
            </Button>
          </form>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>질병명</TableHead>
                <TableHead>진단일</TableHead>
                <TableHead>치료내용</TableHead>
                <TableHead>비고</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diseaseHistories.map((history: any) => (
                <TableRow key={history.id}>
                  <TableCell>{history.diseaseName}</TableCell>
                  <TableCell>{new Date(history.diagnosisDate).toLocaleDateString()}</TableCell>
                  <TableCell>{history.treatment}</TableCell>
                  <TableCell>{history.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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

      {isDiabetic && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="text-lg font-bold">혈당 관리</h3>
            <form onSubmit={onSubmitBS} className="flex items-center gap-2">
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  placeholder="혈당"
                  className="w-24"
                  {...registerBS('bloodSugar', { required: true })}
                />
                <Select
                  onValueChange={(value) => setValueBS('measurementType', value)}
                  defaultValue="before_meal"
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="측정시기" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before_meal">식전</SelectItem>
                    <SelectItem value="after_meal">식후</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="메모"
                  {...registerBS('notes')}
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
                  <TableHead>혈당</TableHead>
                  <TableHead>측정시기</TableHead>
                  <TableHead>메모</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bloodSugarRecords.map((record: any) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {new Date(record.measuredAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{record.bloodSugar}</TableCell>
                    <TableCell>
                      {record.measurementType === 'before_meal' ? '식전' : '식후'}
                    </TableCell>
                    <TableCell>{record.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <EmergencyContacts />
    </div>
  );
}