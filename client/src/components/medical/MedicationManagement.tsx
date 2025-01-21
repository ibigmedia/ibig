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

interface Medication {
  id: number;
  userId: number;
  name: string;
  dosage: string;
  startDate: string;
  endDate: string | null;
  frequency: string;
  notes: string | null;
}

export function MedicationManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [newRecord, setNewRecord] = React.useState({
    name: '',
    dosage: '',
    startDate: '',
    endDate: '',
    frequency: '',
    notes: '',
  });

  const { data: medications = [], isError } = useQuery<Medication[]>({
    queryKey: ['/api/medications'],
  });

  const addMedicationMutation = useMutation({
    mutationFn: async (data: typeof newRecord) => {
      console.log('Submitting medication data:', data); // Debug log
      const response = await fetch('/api/medications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          endDate: data.endDate || null,
        }),
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
        description: '약물 정보가 추가되었습니다.',
      });
      setShowAddDialog(false);
      setNewRecord({
        name: '',
        dosage: '',
        startDate: '',
        endDate: '',
        frequency: '',
        notes: '',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
    },
    onError: (error: Error) => {
      console.error('Medication save error:', error); // Debug log
      toast({
        variant: 'destructive',
        title: '오류',
        description: error.message,
      });
    },
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Handling form submission:', newRecord); // Debug log
    if (!newRecord.name || !newRecord.dosage || !newRecord.startDate || !newRecord.frequency) {
      toast({
        variant: 'destructive',
        title: '오류',
        description: '필수 항목을 모두 입력해주세요.',
      });
      return;
    }
    addMedicationMutation.mutate(newRecord);
  };

  if (isError) {
    return (
      <div className="p-4">
        <p className="text-red-500">약물 정보를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          새 약물 추가
        </Button>
      </div>

      <div className="grid gap-4">
        {medications.map((medication) => (
          <Card key={medication.id}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{medication.name}</h3>
                    <p className="text-sm">복용량: {medication.dosage}</p>
                  </div>
                  <div className="text-sm text-muted-foreground text-right">
                    <p>시작일: {new Date(medication.startDate).toLocaleDateString()}</p>
                    {medication.endDate && (
                      <p>종료일: {new Date(medication.endDate).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
                <p className="text-sm">복용주기: {medication.frequency}</p>
                {medication.notes && (
                  <p className="text-sm text-muted-foreground">
                    메모: {medication.notes}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 약물 추가</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label>약물명</Label>
              <Input
                value={newRecord.name}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>복용량</Label>
              <Input
                value={newRecord.dosage}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, dosage: e.target.value })
                }
                required
                placeholder="예: 1정"
              />
            </div>
            <div className="space-y-2">
              <Label>시작일</Label>
              <Input
                type="date"
                value={newRecord.startDate}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, startDate: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>종료일 (선택사항)</Label>
              <Input
                type="date"
                value={newRecord.endDate}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, endDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>복용주기</Label>
              <Input
                value={newRecord.frequency}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, frequency: e.target.value })
                }
                required
                placeholder="예: 하루 3회"
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
            <Button type="submit" disabled={addMedicationMutation.isPending}>
              저장
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}