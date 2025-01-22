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
  measuredAt: string;
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

  const updateRecord = useMutation({
    mutationFn: async (record: BloodPressureRecord) => {
      const response = await fetch(`/api/blood-pressure/${record.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(record),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "수정 완료",
        description: "혈압 기록이 성공적으로 수정되었습니다.",
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

  const handleEdit = (record: BloodPressureRecord) => {
    setSelectedRecord(record);
    setSystolic(record.systolic.toString());
    setDiastolic(record.diastolic.toString());
    setPulse(record.pulse.toString());
    setNotes(record.notes || "");
    setIsAddDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      systolic: parseInt(systolic),
      diastolic: parseInt(diastolic),
      pulse: parseInt(pulse),
      notes,
    };

    if (selectedRecord) {
      updateRecord.mutate({ ...data, id: selectedRecord.id, measuredAt: selectedRecord.measuredAt });
    } else {
      addRecord.mutate(data);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <h3 className="text-lg font-bold">혈압 기록</h3>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          혈압 기록 추가
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>수축기 혈압</TableHead>
              <TableHead>이완기 혈압</TableHead>
              <TableHead>맥박</TableHead>
              <TableHead>측정일</TableHead>
              <TableHead>메모</TableHead>
              <TableHead>작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bloodPressureRecords?.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.systolic}</TableCell>
                <TableCell>{record.diastolic}</TableCell>
                <TableCell>{record.pulse}</TableCell>
                <TableCell>{format(new Date(record.measuredAt), 'yyyy-MM-dd HH:mm')}</TableCell>
                <TableCell>{record.notes}</TableCell>
                <TableCell className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(record)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedRecord(record);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedRecord ? "혈압 기록 수정" : "새 혈압 기록"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="systolic">수축기 혈압 (mmHg)</Label>
                <Input
                  id="systolic"
                  type="number"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="diastolic">이완기 혈압 (mmHg)</Label>
                <Input
                  id="diastolic"
                  type="number"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="pulse">맥박 (bpm)</Label>
                <Input
                  id="pulse"
                  type="number"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="notes">메모</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button type="submit">
                  {selectedRecord ? "수정" : "추가"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>혈압 기록 삭제</AlertDialogTitle>
              <AlertDialogDescription>
                이 기록을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.
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
      </CardContent>
    </Card>
  );
}