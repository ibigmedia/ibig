import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Eye, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SelectMedicalRecord } from "@db/schema";

export function MedicalRecordsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRecord, setSelectedRecord] = React.useState<SelectMedicalRecord | null>(null);
  const [showDetails, setShowDetails] = React.useState(false);

  const { data: records = [] } = useQuery<SelectMedicalRecord[]>({
    queryKey: ['/api/admin/medical-records'],
  });

  const updateMutation = useMutation({
    mutationFn: async (record: SelectMedicalRecord) => {
      const response = await fetch(`/api/admin/medical-records/${record.id}`, {
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
        title: '성공',
        description: '의료 기록이 업데이트되었습니다.',
      });
      setShowDetails(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/medical-records'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: '오류',
        description: error.message,
      });
    },
  });

  const handleSave = () => {
    if (selectedRecord) {
      updateMutation.mutate(selectedRecord);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold">의료 기록 관리</h2>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>생년월일</TableHead>
                <TableHead>당뇨여부</TableHead>
                <TableHead>특이사항</TableHead>
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.name}</TableCell>
                  <TableCell>{record.birthDate}</TableCell>
                  <TableCell>{record.isDiabetic ? '예' : '아니오'}</TableCell>
                  <TableCell>{record.notes}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedRecord(record);
                        setShowDetails(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      상세보기
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>의료 기록 상세 정보</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>이름</Label>
                <Input
                  value={selectedRecord.name}
                  onChange={(e) =>
                    setSelectedRecord({ ...selectedRecord, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>생년월일</Label>
                <Input
                  value={selectedRecord.birthDate}
                  onChange={(e) =>
                    setSelectedRecord({ ...selectedRecord, birthDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>특이사항</Label>
                <Textarea
                  value={selectedRecord.notes || ''}
                  onChange={(e) =>
                    setSelectedRecord({ ...selectedRecord, notes: e.target.value })
                  }
                />
              </div>
              <Button onClick={handleSave} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                저장하기
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}