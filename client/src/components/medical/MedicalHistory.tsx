import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

interface DiseaseHistory {
  id: number;
  userId: number;
  diseaseName: string;
  diagnosisDate: string;
  treatment: string;
  notes: string | null;
}

export function MedicalHistory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [newRecord, setNewRecord] = React.useState({
    diseaseName: '',
    diagnosisDate: '',
    treatment: '',
    notes: '',
  });

  const { data: records = [] } = useQuery<DiseaseHistory[]>({
    queryKey: ['/api/disease-histories'],
  });

  const addRecordMutation = useMutation({
    mutationFn: async (data: typeof newRecord) => {
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
        description: '질병 이력이 추가되었습니다.',
      });
      setShowAddDialog(false);
      setNewRecord({
        diseaseName: '',
        diagnosisDate: '',
        treatment: '',
        notes: '',
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

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/disease-histories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: '성공',
        description: '질병 이력이 삭제되었습니다.',
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

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.diseaseName || !newRecord.diagnosisDate || !newRecord.treatment) {
      toast({
        variant: 'destructive',
        title: '오류',
        description: '필수 항목을 모두 입력해주세요.',
      });
      return;
    }
    addRecordMutation.mutate(newRecord);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          새 질병 이력 추가
        </Button>
      </div>

      <div className="grid gap-4">
        {records.map((record) => (
          <Card key={record.id}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold">{record.diseaseName}</h3>
                  <p className="text-sm text-muted-foreground">
                    진단일: {new Date(record.diagnosisDate).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm">치료내용: {record.treatment}</p>
                {record.notes && (
                  <p className="text-sm text-muted-foreground">
                    메모: {record.notes}
                  </p>
                )}
              </div>
              <Button onClick={() => deleteMutation.mutate(record.id)} variant="destructive">삭제</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 질병 이력</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label>질병명</Label>
              <Input
                value={newRecord.diseaseName}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, diseaseName: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>진단일</Label>
              <Input
                type="date"
                value={newRecord.diagnosisDate}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, diagnosisDate: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>치료내용</Label>
              <Textarea
                value={newRecord.treatment}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, treatment: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>메모 (선택사항)</Label>
              <Textarea
                value={newRecord.notes}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, notes: e.target.value })
                }
              />
            </div>
            <Button type="submit" disabled={addRecordMutation.isPending}>
              저장
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}