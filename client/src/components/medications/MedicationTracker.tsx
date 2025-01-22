import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
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
  DialogFooter,
} from "@/components/ui/dialog";
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
import { PlusCircle, Info, Loader2, Edit2, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Textarea } from '@/components/ui/textarea';

interface Medication {
  id: number;
  name: string;
  dosage: string;
  startDate: string;
  endDate?: string;
  frequency: string;
  notes?: string;
}

export function MedicationTracker() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [selectedMedication, setSelectedMedication] = React.useState<Medication | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    dosage: '',
    startDate: '',
    endDate: '',
    frequency: '',
    notes: '',
  });

  const { data: medications = [], isLoading } = useQuery<Medication[]>({
    queryKey: ['/api/medications'],
  });

  const addMedication = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/medications', {
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
        description: '약물이 추가되었습니다.',
      });
      setShowAddDialog(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: '오류',
        description: error.message,
      });
    },
  });

  const updateMedication = useMutation({
    mutationFn: async (data: { id: number; medication: typeof formData }) => {
      const response = await fetch(`/api/medications/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data.medication),
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
        description: '약물 정보가 수정되었습니다.',
      });
      setShowAddDialog(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: '오류',
        description: error.message,
      });
    },
  });

  const deleteMedication = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/medications/${id}`, {
        method: 'DELETE',
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
        description: '약물이 삭제되었습니다.',
      });
      setShowDeleteDialog(false);
      setSelectedMedication(null);
      queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
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
    setFormData({
      name: '',
      dosage: '',
      startDate: '',
      endDate: '',
      frequency: '',
      notes: '',
    });
    setIsEditing(false);
    setSelectedMedication(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.dosage || !formData.startDate || !formData.frequency) {
      toast({
        variant: 'destructive',
        title: '입력 오류',
        description: '필수 항목을 모두 입력해주세요.',
      });
      return;
    }

    if (isEditing && selectedMedication) {
      updateMedication.mutate({ id: selectedMedication.id, medication: formData });
    } else {
      addMedication.mutate(formData);
    }
  };

  const handleEdit = (medication: Medication) => {
    setIsEditing(true);
    setSelectedMedication(medication);
    setFormData({
      name: medication.name,
      dosage: medication.dosage,
      startDate: medication.startDate,
      endDate: medication.endDate || '',
      frequency: medication.frequency,
      notes: medication.notes || '',
    });
    setShowAddDialog(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold">약물 목록</h3>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => {
                resetForm();
                setShowAddDialog(true);
              }}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              새 약물 추가
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>약물명</TableHead>
                <TableHead>복용량</TableHead>
                <TableHead>시작일</TableHead>
                <TableHead>종료일</TableHead>
                <TableHead>복용주기</TableHead>
                <TableHead>메모</TableHead>
                <TableHead className="w-[100px]">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medications.map((medication) => (
                <TableRow key={medication.id}>
                  <TableCell>{medication.name}</TableCell>
                  <TableCell>{medication.dosage}</TableCell>
                  <TableCell>{new Date(medication.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {medication.endDate ? new Date(medication.endDate).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>{medication.frequency}</TableCell>
                  <TableCell>{medication.notes || '-'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(medication)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedMedication(medication);
                          setShowDeleteDialog(true);
                        }}
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

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? '약물 정보 수정' : '새 약물 추가'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>약물명</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>복용량</Label>
              <Input
                value={formData.dosage}
                onChange={(e) =>
                  setFormData({ ...formData, dosage: e.target.value })
                }
                required
                placeholder="예: 1정"
              />
            </div>
            <div className="space-y-2">
              <Label>시작일</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>종료일 (선택사항)</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>복용주기</Label>
              <Input
                value={formData.frequency}
                onChange={(e) =>
                  setFormData({ ...formData, frequency: e.target.value })
                }
                required
                placeholder="예: 하루 3회"
              />
            </div>
            <div className="space-y-2">
              <Label>메모 (선택사항)</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="복용 시 주의사항이나 기타 메모"
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={addMedication.isPending || updateMedication.isPending}
              >
                {addMedication.isPending || updateMedication.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isEditing ? '수정' : '저장'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>약물 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 약물을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedMedication?.id) {
                  deleteMedication.mutate(selectedMedication.id);
                }
              }}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}