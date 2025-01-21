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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Eye, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SelectMedicalRecord } from "@db/schema";

export function MedicalRecordsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRecord, setSelectedRecord] = React.useState<SelectMedicalRecord | null>(null);
  const [showDetails, setShowDetails] = React.useState(false);
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [dialogType, setDialogType] = React.useState<'bloodPressure' | 'bloodSugar' | 'disease' | null>(null);
  const [newRecord, setNewRecord] = React.useState<any>({});

  const { data: records = [] } = useQuery<SelectMedicalRecord[]>({
    queryKey: ['/api/admin/medical-records'],
  });

  const { data: bloodPressureRecords = [] } = useQuery({
    queryKey: ['/api/admin/blood-pressure'],
  });

  const { data: bloodSugarRecords = [] } = useQuery({
    queryKey: ['/api/admin/blood-sugar'],
  });

  const { data: diseaseHistories = [] } = useQuery({
    queryKey: ['/api/admin/disease-histories'],
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

  const addBloodPressureMutation = useMutation({
    mutationFn: async (data: any) => {
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
        title: '성공',
        description: '혈압 기록이 추가되었습니다.',
      });
      setShowAddDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blood-pressure'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: '오류',
        description: error.message,
      });
    },
  });

  const addBloodSugarMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/blood-sugar', {
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
        description: '혈당 기록이 추가되었습니다.',
      });
      setShowAddDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blood-sugar'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: '오류',
        description: error.message,
      });
    },
  });

  const addDiseaseHistoryMutation = useMutation({
    mutationFn: async (data: any) => {
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
      queryClient.invalidateQueries({ queryKey: ['/api/admin/disease-histories'] });
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

  const handleAdd = () => {
    if (!dialogType) return;

    switch (dialogType) {
      case 'bloodPressure':
        addBloodPressureMutation.mutate({
          ...newRecord,
        });
        break;
      case 'bloodSugar':
        addBloodSugarMutation.mutate({
          ...newRecord,
        });
        break;
      case 'disease':
        addDiseaseHistoryMutation.mutate({
          ...newRecord,
        });
        break;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold">의료 기록 관리</h2>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic">
            <TabsList>
              <TabsTrigger value="basic">기본 정보</TabsTrigger>
              <TabsTrigger value="history">과거 병력</TabsTrigger>
              <TabsTrigger value="records">건강 기록</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
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
            </TabsContent>

            <TabsContent value="history">
              <div className="flex justify-end mb-4">
                <Button
                  onClick={() => {
                    setDialogType('disease');
                    setShowAddDialog(true);
                    setNewRecord({});
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  새 질병 이력 추가
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>환자명</TableHead>
                    <TableHead>질병명</TableHead>
                    <TableHead>진단일</TableHead>
                    <TableHead>치료내용</TableHead>
                    <TableHead>비고</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {diseaseHistories.map((history: any) => (
                    <TableRow key={history.id}>
                      <TableCell>{history.user?.name || ''}</TableCell>
                      <TableCell>{history.diseaseName}</TableCell>
                      <TableCell>{new Date(history.diagnosisDate).toLocaleDateString()}</TableCell>
                      <TableCell>{history.treatment}</TableCell>
                      <TableCell>{history.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="records">
              <Tabs defaultValue="bp">
                <TabsList>
                  <TabsTrigger value="bp">혈압</TabsTrigger>
                  <TabsTrigger value="sugar">혈당</TabsTrigger>
                </TabsList>

                <TabsContent value="bp">
                  <div className="flex justify-end mb-4">
                    <Button
                      onClick={() => {
                        setDialogType('bloodPressure');
                        setShowAddDialog(true);
                        setNewRecord({});
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      새 혈압 기록 추가
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>환자명</TableHead>
                        <TableHead>측정일시</TableHead>
                        <TableHead>수축기</TableHead>
                        <TableHead>이완기</TableHead>
                        <TableHead>맥박</TableHead>
                        <TableHead>메모</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bloodPressureRecords.map((record: any) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.user?.name || ''}</TableCell>
                          <TableCell>{new Date(record.measuredAt).toLocaleString()}</TableCell>
                          <TableCell>{record.systolic}</TableCell>
                          <TableCell>{record.diastolic}</TableCell>
                          <TableCell>{record.pulse}</TableCell>
                          <TableCell>{record.notes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="sugar">
                  <div className="flex justify-end mb-4">
                    <Button
                      onClick={() => {
                        setDialogType('bloodSugar');
                        setShowAddDialog(true);
                        setNewRecord({});
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      새 혈당 기록 추가
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>환자명</TableHead>
                        <TableHead>측정일시</TableHead>
                        <TableHead>혈당</TableHead>
                        <TableHead>측정시기</TableHead>
                        <TableHead>메모</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bloodSugarRecords.map((record: any) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.user?.name || ''}</TableCell>
                          <TableCell>{new Date(record.measuredAt).toLocaleString()}</TableCell>
                          <TableCell>{record.bloodSugar}</TableCell>
                          <TableCell>
                            {record.measurementType === 'before_meal' ? '식전' : '식후'}
                          </TableCell>
                          <TableCell>{record.notes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
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
                <Label>약물 알러지</Label>
                <Textarea
                  value={selectedRecord.drugAllergies || ''}
                  onChange={(e) =>
                    setSelectedRecord({ ...selectedRecord, drugAllergies: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>음식 알러지</Label>
                <Textarea
                  value={selectedRecord.foodAllergies || ''}
                  onChange={(e) =>
                    setSelectedRecord({ ...selectedRecord, foodAllergies: e.target.value })
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

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'bloodPressure'
                ? '새 혈압 기록'
                : dialogType === 'bloodSugar'
                ? '새 혈당 기록'
                : '새 질병 이력'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {dialogType === 'bloodPressure' && (
              <>
                <div className="space-y-2">
                  <Label>수축기 혈압</Label>
                  <Input
                    type="number"
                    value={newRecord.systolic || ''}
                    onChange={(e) => setNewRecord({ ...newRecord, systolic: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>이완기 혈압</Label>
                  <Input
                    type="number"
                    value={newRecord.diastolic || ''}
                    onChange={(e) => setNewRecord({ ...newRecord, diastolic: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>맥박</Label>
                  <Input
                    type="number"
                    value={newRecord.pulse || ''}
                    onChange={(e) => setNewRecord({ ...newRecord, pulse: parseInt(e.target.value) })}
                  />
                </div>
              </>
            )}
            {dialogType === 'bloodSugar' && (
              <>
                <div className="space-y-2">
                  <Label>혈당</Label>
                  <Input
                    type="number"
                    value={newRecord.bloodSugar || ''}
                    onChange={(e) => setNewRecord({ ...newRecord, bloodSugar: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>측정시기</Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={newRecord.measurementType || 'before_meal'}
                    onChange={(e) => setNewRecord({ ...newRecord, measurementType: e.target.value })}
                  >
                    <option value="before_meal">식전</option>
                    <option value="after_meal">식후</option>
                  </select>
                </div>
              </>
            )}
            {dialogType === 'disease' && (
              <>
                <div className="space-y-2">
                  <Label>질병명</Label>
                  <Input
                    value={newRecord.diseaseName || ''}
                    onChange={(e) => setNewRecord({ ...newRecord, diseaseName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>치료내용</Label>
                  <Input
                    value={newRecord.treatment || ''}
                    onChange={(e) => setNewRecord({ ...newRecord, treatment: e.target.value })}
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>메모</Label>
              <Textarea
                value={newRecord.notes || ''}
                onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
              />
            </div>
            <Button onClick={handleAdd} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              저장하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}