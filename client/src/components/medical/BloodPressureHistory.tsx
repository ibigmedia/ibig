import React from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Plus } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
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
import { format } from 'date-fns';

interface BloodPressureRecord {
  id?: number;
  systolic: number;
  diastolic: number;
  pulse: number;
  measuredAt?: string;
  notes?: string;
}

export function BloodPressureHistory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedRecord, setSelectedRecord] = React.useState<BloodPressureRecord | null>(null);
  const [systolic, setSystolic] = React.useState("");
  const [diastolic, setDiastolic] = React.useState("");
  const [pulse, setPulse] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const { data: bloodPressureRecords = [] } = useQuery<BloodPressureRecord[]>({
    queryKey: ['/api/blood-pressure'],
  });

  const addRecord = useMutation({
    mutationFn: async (data: Omit<BloodPressureRecord, 'id' | 'measuredAt'>) => {
      const response = await fetch('/api/blood-pressure', {
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
        title: "기록 추가 완료",
        description: "혈압 기록이 성공적으로 추가되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/blood-pressure'] });
      resetForm();
      setIsAddDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "오류",
        description: error.message,
      });
    },
  });

  const deleteRecord = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/blood-pressure/${id}`, {
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
        title: "삭제 완료",
        description: "혈압 기록이 성공적으로 삭제되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/blood-pressure'] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "오류",
        description: error.message,
      });
    },
  });

  const resetForm = () => {
    setSystolic("");
    setDiastolic("");
    setPulse("");
    setNotes("");
    setSelectedRecord(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!systolic || !diastolic || !pulse) {
      toast({
        variant: "destructive",
        title: "입력 오류",
        description: "모든 필수 항목을 입력해주세요.",
      });
      return;
    }

    const data = {
      systolic: parseInt(systolic),
      diastolic: parseInt(diastolic),
      pulse: parseInt(pulse),
      notes,
    };

    addRecord.mutate(data);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            혈압 기록
          </h2>
          <p className="text-sm text-muted-foreground">
            정기적으로 혈압을 측정하고 기록하세요
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          새 기록 추가
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">수축기</TableHead>
              <TableHead className="w-[100px]">이완기</TableHead>
              <TableHead className="w-[100px]">맥박</TableHead>
              <TableHead>측정일시</TableHead>
              <TableHead>메모</TableHead>
              <TableHead className="w-[100px]">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bloodPressureRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.systolic}</TableCell>
                <TableCell>{record.diastolic}</TableCell>
                <TableCell>{record.pulse}</TableCell>
                <TableCell>
                  {record.measuredAt ? format(new Date(record.measuredAt), 'yyyy-MM-dd HH:mm') : '-'}
                </TableCell>
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

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 혈압 기록</DialogTitle>
            <DialogDescription>
              혈압 측정값과 관련 정보를 입력하세요
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 items-center gap-4">
                <div className="space-y-2">
                  <Label htmlFor="systolic">수축기 혈압 (mmHg)</Label>
                  <Input
                    id="systolic"
                    type="number"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diastolic">이완기 혈압 (mmHg)</Label>
                  <Input
                    id="diastolic"
                    type="number"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pulse">맥박 (bpm)</Label>
                  <Input
                    id="pulse"
                    type="number"
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">메모</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="특이사항이나 증상을 기록하세요"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">저장</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>기록 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 혈압 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedRecord?.id) {
                  deleteRecord.mutate(selectedRecord.id);
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