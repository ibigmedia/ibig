import React, { useState } from 'react';
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
import { Edit, Trash2, Plus } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { format } from 'date-fns';

interface AllergyRecord {
  id: number;
  allergen: string;
  reaction: string;
  severity: string;
  notes: string;
  recordedAt: string;
}

export function AllergyHistory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AllergyRecord | null>(null);
  const [allergen, setAllergen] = useState("");
  const [reaction, setReaction] = useState("");
  const [severity, setSeverity] = useState("");
  const [notes, setNotes] = useState("");

  const { data: allergyRecords } = useQuery<AllergyRecord[]>({
    queryKey: ['/api/allergy-records'],
  });

  const addRecord = useMutation({
    mutationFn: async (data: Omit<AllergyRecord, 'id' | 'recordedAt'>) => {
      const response = await fetch('/api/allergy-records', {
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
        description: "알러지 기록이 성공적으로 추가되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/allergy-records'] });
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
    mutationFn: async (record: AllergyRecord) => {
      const response = await fetch(`/api/allergy-records/${record.id}`, {
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
        description: "알러지 기록이 성공적으로 수정되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/allergy-records'] });
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
      const response = await fetch(`/api/allergy-records/${id}`, {
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
        description: "알러지 기록이 성공적으로 삭제되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/allergy-records'] });
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
    setAllergen("");
    setReaction("");
    setSeverity("");
    setNotes("");
    setSelectedRecord(null);
  };

  const handleEdit = (record: AllergyRecord) => {
    setSelectedRecord(record);
    setAllergen(record.allergen);
    setReaction(record.reaction);
    setSeverity(record.severity);
    setNotes(record.notes);
    setIsAddDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      allergen,
      reaction,
      severity,
      notes,
    };

    if (selectedRecord) {
      updateRecord.mutate({ ...data, id: selectedRecord.id, recordedAt: selectedRecord.recordedAt });
    } else {
      addRecord.mutate(data);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <h3 className="text-lg font-bold">알러지 기록</h3>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          알러지 기록 추가
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>알러지 원인</TableHead>
              <TableHead>반응</TableHead>
              <TableHead>심각도</TableHead>
              <TableHead>기록일</TableHead>
              <TableHead>작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allergyRecords?.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.allergen}</TableCell>
                <TableCell>{record.reaction}</TableCell>
                <TableCell>{record.severity}</TableCell>
                <TableCell>{format(new Date(record.recordedAt), 'yyyy-MM-dd')}</TableCell>
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
                {selectedRecord ? "알러지 기록 수정" : "새 알러지 기록"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="allergen">알러지 원인</Label>
                <Input
                  id="allergen"
                  value={allergen}
                  onChange={(e) => setAllergen(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="reaction">반응</Label>
                <Input
                  id="reaction"
                  value={reaction}
                  onChange={(e) => setReaction(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="severity">심각도</Label>
                <Input
                  id="severity"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="notes">비고</Label>
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
              <AlertDialogTitle>알러지 기록 삭제</AlertDialogTitle>
              <AlertDialogDescription>
                이 기록을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (selectedRecord) {
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
