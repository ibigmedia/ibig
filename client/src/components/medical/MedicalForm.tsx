import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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
  isDiabetic: boolean;
  drugAllergies?: string;
  foodAllergies?: string;
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

export function MedicalForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: medicalRecord } = useQuery({
    queryKey: ['/api/medical-records'],
    select: (records: any[]) => records[0],
  });

  const { data: bloodPressureRecords = [] } = useQuery({
    queryKey: ['/api/blood-pressure'],
  });

  const { data: diseaseHistories = [] } = useQuery({
    queryKey: ['/api/disease-histories'],
  });

  const { register, handleSubmit, setValue, watch } = useForm<MedicalFormData>({
    defaultValues: {
      isDiabetic: false,
      drugAllergies: '',
      foodAllergies: '',
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

  React.useEffect(() => {
    if (medicalRecord) {
      setValue('isDiabetic', medicalRecord.isDiabetic);
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
        title: '성공',
        description: '건강정보가 저장되었습니다.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/medical-records'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: '오류',
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
        title: '성공',
        description: '과거 병력이 추가되었습니다.',
      });
      resetDH();
      queryClient.invalidateQueries({ queryKey: ['/api/disease-histories'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: '오류',
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
        title: '성공',
        description: '혈압 기록이 추가되었습니다.',
      });
      resetBP();
      queryClient.invalidateQueries({ queryKey: ['/api/blood-pressure'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: '오류',
        description: error.message,
      });
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data);
  });

  const onSubmitDH = handleSubmitDH((data) => {
    diseaseHistoryMutation.mutate(data);
  });

  const onSubmitBP = handleSubmitBP((data) => {
    bloodPressureMutation.mutate(data);
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">건강 정보</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="diabetesCheck"
              checked={watch('isDiabetic')}
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
          <Button onClick={onSubmit} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            저장
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">과거 병력</h3>
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
        <CardHeader>
          <h3 className="text-xl font-semibold">혈압 관리</h3>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Button type="submit">
              <Plus className="h-4 w-4 mr-2" />
              기록추가
            </Button>
          </form>

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
    </div>
  );
}