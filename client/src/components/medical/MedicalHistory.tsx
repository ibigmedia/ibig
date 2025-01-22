import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedRecord, setSelectedRecord] = React.useState<DiseaseHistory | null>(null);
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
        const errorText = await response.text();
        throw new Error(errorText || '병력 기록 저장에 실패했습니다.');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: '성공',
        description: '질병 이력이 추가되었습니다.',
      });
      setShowAddDialog(false);
      resetForm();
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
        throw new Error(errorText || '병력 기록 삭제에 실패했습니다.');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: '성공',
        description: '질병 이력이 삭제되었습니다.',
      });
      setIsDeleteDialogOpen(false);
      setSelectedRecord(null);
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

  const resetForm = () => {
    setNewRecord({
      diseaseName: '',
      diagnosisDate: '',
      treatment: '',
      notes: '',
    });
  };

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            과거 병력
          </h2>
          <p className="text-sm text-muted-foreground">
            중요한 질병과 치료 이력을 기록하세요
          </p>
        </div>
        <Button onClick={() => {
          resetForm();
          setShowAddDialog(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          새 기록 추가
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>질병명</TableHead>
              <TableHead>진단일</TableHead>
              <TableHead>치료내용</TableHead>
              <TableHead>메모</TableHead>
              <TableHead className="w-[100px]">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.diseaseName}</TableCell>
                <TableCell>{new Date(record.diagnosisDate).toLocaleDateString()}</TableCell>
                <TableCell>{record.treatment}</TableCell>
                <TableCell>{record.notes || '-'}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedRecord(record);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 질병 이력</DialogTitle>
            <DialogDescription>
              과거 병력과 관련 정보를 입력하세요
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 items-center gap-4">
                <div className="space-y-2">
                  <Label htmlFor="diseaseName">질병명</Label>
                  <Input
                    id="diseaseName"
                    value={newRecord.diseaseName}
                    onChange={(e) =>
                      setNewRecord({ ...newRecord, diseaseName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diagnosisDate">진단일</Label>
                  <Input
                    id="diagnosisDate"
                    type="date"
                    value={newRecord.diagnosisDate}
                    onChange={(e) =>
                      setNewRecord({ ...newRecord, diagnosisDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="treatment">치료내용</Label>
                <Input
                  id="treatment"
                  value={newRecord.treatment}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, treatment: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">메모</Label>
                <Textarea
                  id="notes"
                  value={newRecord.notes}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, notes: e.target.value })
                  }
                  placeholder="특이사항이나 증상을 기록하세요"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={addRecordMutation.isPending}>
                저장
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>기록 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 병력 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedRecord?.id) {
                  deleteMutation.mutate(selectedRecord.id);
                }
              }}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}