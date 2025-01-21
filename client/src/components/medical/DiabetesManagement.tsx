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
import { Plus } from 'lucide-react';

interface BloodSugar {
  id: number;
  userId: number;
  bloodSugar: number;
  measurementType: 'before_meal' | 'after_meal';
  measuredAt: string;
  notes: string | null;
}

export function DiabetesManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [newRecord, setNewRecord] = React.useState({
    bloodSugar: '',
    measurementType: 'before_meal',
    notes: '',
  });

  const { data: records = [] } = useQuery<BloodSugar[]>({
    queryKey: ['/api/blood-sugar'],
  });

  const addRecordMutation = useMutation({
    mutationFn: async (data: typeof newRecord) => {
      const response = await fetch('/api/blood-sugar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          bloodSugar: parseInt(data.bloodSugar),
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
        description: '혈당 기록이 추가되었습니다.',
      });
      setShowAddDialog(false);
      setNewRecord({
        bloodSugar: '',
        measurementType: 'before_meal',
        notes: '',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/blood-sugar'] });
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
    if (!newRecord.bloodSugar) {
      toast({
        variant: 'destructive',
        title: '오류',
        description: '혈당 수치를 입력해주세요.',
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
          혈당 기록 추가
        </Button>
      </div>

      <div className="grid gap-4">
        {records.map((record) => (
          <Card key={record.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">혈당: {record.bloodSugar} mg/dL</p>
                  <p className="text-sm text-muted-foreground">
                    {record.measurementType === 'before_meal' ? '식전' : '식후'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    측정시간: {new Date(record.measuredAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {record.notes && (
                <p className="mt-2 text-sm text-muted-foreground">
                  메모: {record.notes}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 혈당 기록</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label>혈당 (mg/dL)</Label>
              <Input
                type="number"
                value={newRecord.bloodSugar}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, bloodSugar: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>측정시기</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={newRecord.measurementType}
                onChange={(e) =>
                  setNewRecord({
                    ...newRecord,
                    measurementType: e.target.value as 'before_meal' | 'after_meal',
                  })
                }
              >
                <option value="before_meal">식전</option>
                <option value="after_meal">식후</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>메모 (선택사항)</Label>
              <Input
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
