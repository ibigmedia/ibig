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
import { Save, Plus, Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MedicalFormData {
  isDiabetic: boolean;
  drugAllergies?: string;
  foodAllergies?: string;
}

interface DiseaseHistoryData {
  id?: number;
  diseaseName: string;
  diagnosisDate: string;
  treatment: string;
  notes?: string;
}

interface BloodPressureData {
  id?: number;
  systolic: number;
  diastolic: number;
  pulse: number;
  notes?: string;
}

export function MedicalForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDiseaseDialog, setShowDiseaseDialog] = React.useState(false);
  const [showBloodPressureDialog, setShowBloodPressureDialog] = React.useState(false);
  const [editingDiseaseHistory, setEditingDiseaseHistory] = React.useState<DiseaseHistoryData | null>(null);
  const [editingBloodPressure, setEditingBloodPressure] = React.useState<BloodPressureData | null>(null);

  const { data: medicalRecord } = useQuery({
    queryKey: ['/api/medical-records'],
    select: (records: any[]) => records[0],
  });

  const { data: bloodPressureRecords = [] } = useQuery<BloodPressureData[]>({
    queryKey: ['/api/blood-pressure'],
  });

  const { data: diseaseHistories = [] } = useQuery<DiseaseHistoryData[]>({
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
    setValue: setValueDH,
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
    setValue: setValueBP,
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

  React.useEffect(() => {
    if (editingDiseaseHistory) {
      setValueDH('diseaseName', editingDiseaseHistory.diseaseName);
      setValueDH('diagnosisDate', editingDiseaseHistory.diagnosisDate.split('T')[0]);
      setValueDH('treatment', editingDiseaseHistory.treatment);
      setValueDH('notes', editingDiseaseHistory.notes || '');
      setShowDiseaseDialog(true);
    }
  }, [editingDiseaseHistory, setValueDH]);

  React.useEffect(() => {
    if (editingBloodPressure) {
      setValueBP('systolic', editingBloodPressure.systolic);
      setValueBP('diastolic', editingBloodPressure.diastolic);
      setValueBP('pulse', editingBloodPressure.pulse);
      setValueBP('notes', editingBloodPressure.notes || '');
      setShowBloodPressureDialog(true);
    }
  }, [editingBloodPressure, setValueBP]);

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

  // Disease History Mutations
  const diseaseHistoryMutation = useMutation({
    mutationFn: async (data: DiseaseHistoryData) => {
      const url = data.id ? `/api/disease-histories/${data.id}` : '/api/disease-histories';
      const method = data.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
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
        description: '과거 병력이 저장되었습니다.',
      });
      resetDH();
      setEditingDiseaseHistory(null);
      setShowDiseaseDialog(false);
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

  const deleteDiseaseHistory = useMutation({
    mutationFn: async (id: number) => {
      if (!window.confirm('정말로 이 병력을 삭제하시겠습니까?')) {
        return;
      }

      const response = await fetch(`/api/disease-histories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }
    },
    onSuccess: () => {
      toast({
        title: '성공',
        description: '과거 병력이 삭제되었습니다.',
      });
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

  // Blood Pressure Mutations
  const bloodPressureMutation = useMutation({
    mutationFn: async (data: BloodPressureData) => {
      const url = data.id ? `/api/blood-pressure/${data.id}` : '/api/blood-pressure';
      const method = data.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
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
        description: '혈압 기록이 저장되었습니다.',
      });
      resetBP();
      setEditingBloodPressure(null);
      setShowBloodPressureDialog(false);
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

  const deleteBloodPressure = useMutation({
    mutationFn: async (id: number) => {
      if (!window.confirm('정말로 이 혈압 기록을 삭제하시겠습니까?')) {
        return;
      }

      const response = await fetch(`/api/blood-pressure/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }
    },
    onSuccess: () => {
      toast({
        title: '성공',
        description: '혈압 기록이 삭제되었습니다.',
      });
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
    if (editingDiseaseHistory) {
      diseaseHistoryMutation.mutate({ ...data, id: editingDiseaseHistory.id });
    } else {
      diseaseHistoryMutation.mutate(data);
    }
  });

  const onSubmitBP = handleSubmitBP((data) => {
    if (editingBloodPressure) {
      bloodPressureMutation.mutate({ ...data, id: editingBloodPressure.id });
    } else {
      bloodPressureMutation.mutate(data);
    }
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
          <Button onClick={() => {
            resetDH();
            setEditingDiseaseHistory(null);
            setShowDiseaseDialog(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            새로운 기록 추가
          </Button>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>질병명</TableHead>
                <TableHead>진단일</TableHead>
                <TableHead>치료내용</TableHead>
                <TableHead>비고</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diseaseHistories.map((history) => (
                <TableRow key={history.id}>
                  <TableCell>{history.diseaseName}</TableCell>
                  <TableCell>{new Date(history.diagnosisDate).toLocaleDateString()}</TableCell>
                  <TableCell>{history.treatment}</TableCell>
                  <TableCell>{history.notes}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingDiseaseHistory(history)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => history.id && deleteDiseaseHistory.mutate(history.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
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
          <Button onClick={() => {
            resetBP();
            setEditingBloodPressure(null);
            setShowBloodPressureDialog(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            새로운 기록 추가
          </Button>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>날짜</TableHead>
                <TableHead>수축기</TableHead>
                <TableHead>이완기</TableHead>
                <TableHead>맥박</TableHead>
                <TableHead>메모</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bloodPressureRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {new Date(record.measuredAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{record.systolic}</TableCell>
                  <TableCell>{record.diastolic}</TableCell>
                  <TableCell>{record.pulse}</TableCell>
                  <TableCell>{record.notes}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingBloodPressure(record)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => record.id && deleteBloodPressure.mutate(record.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showDiseaseDialog} onOpenChange={setShowDiseaseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDiseaseHistory ? '과거 병력 수정' : '새로운 과거 병력 추가'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmitDH} className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <Button type="submit">
              {editingDiseaseHistory ? '수정' : '추가'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showBloodPressureDialog} onOpenChange={setShowBloodPressureDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBloodPressure ? '혈압 기록 수정' : '새로운 혈압 기록 추가'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmitBP} className="grid gap-4 py-4">
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
              {editingBloodPressure ? '수정' : '추가'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}