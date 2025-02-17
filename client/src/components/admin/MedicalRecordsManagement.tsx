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
import type { SelectMedicalRecord, SelectBloodPressureRecord } from "@db/schema";

interface BloodSugarRecord {
  id: number;
  userId: number;
  bloodSugar: number;
  measurementType: 'before_meal' | 'after_meal';
  measuredAt: string;
  notes?: string;
}

interface DiseaseHistory {
  id: number;
  userId: number;
  diseaseName: string;
  diagnosisDate: string;
  treatment: string;
  notes?: string;
}

interface Medication {
  id: number;
  userId: number;
  name: string;
  dosage: string;
  startDate: string;
  endDate: string | null;
  frequency: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export function MedicalRecordsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRecord, setSelectedRecord] = React.useState<SelectMedicalRecord | null>(null);
  const [showDetails, setShowDetails] = React.useState(false);
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [dialogType, setDialogType] = React.useState<'bloodPressure' | 'bloodSugar' | 'disease' | 'medication' | null>(null);
  const [newRecord, setNewRecord] = React.useState<any>({});

  const { data: records = [] } = useQuery<SelectMedicalRecord[]>({
    queryKey: ['/api/admin/medical-records'],
  });

  const { data: bloodPressureRecords = [] } = useQuery<SelectBloodPressureRecord[]>({
    queryKey: ['/api/admin/blood-pressure'],
  });

  const { data: bloodSugarRecords = [] } = useQuery<BloodSugarRecord[]>({
    queryKey: ['/api/admin/blood-sugar'],
  });

  const { data: diseaseHistories = [] } = useQuery<DiseaseHistory[]>({
    queryKey: ['/api/admin/disease-histories'],
  });

  const { data: medications = [] } = useQuery<Medication[]>({
    queryKey: ['/api/admin/medications'],
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

  const handleAdd = () => {
    if (!dialogType) return;

    switch (dialogType) {
      case 'bloodPressure':
        //addBloodPressureMutation.mutate({ ...newRecord });
        break;
      case 'bloodSugar':
        //addBloodSugarMutation.mutate({ ...newRecord });
        break;
      case 'disease':
        //addDiseaseHistoryMutation.mutate({ ...newRecord });
        break;
      case 'medication':
        if (!newRecord.name || !newRecord.dosage || !newRecord.startDate || !newRecord.frequency) {
          toast({
            variant: 'destructive',
            title: '오류',
            description: '필수 항목을 모두 입력해주세요.',
          });
          return;
        }
        //addMedicationMutation.mutate(newRecord);
        break;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold">진료 기록</h2>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="records">
            <TabsList>
              <TabsTrigger value="records">건강 기록</TabsTrigger>
              <TabsTrigger value="history">과거 병력</TabsTrigger>
              <TabsTrigger value="medications">약물 관리</TabsTrigger>
            </TabsList>

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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bloodPressureRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.user?.name || ''}</TableCell>
                          <TableCell>{new Date(record.measuredAt).toLocaleString()}</TableCell>
                          <TableCell>{record.systolic}</TableCell>
                          <TableCell>{record.diastolic}</TableCell>
                          <TableCell>{record.pulse}</TableCell>
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bloodSugarRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.user?.name || ''}</TableCell>
                          <TableCell>{new Date(record.measuredAt).toLocaleString()}</TableCell>
                          <TableCell>{record.bloodSugar}</TableCell>
                          <TableCell>
                            {record.measurementType === 'before_meal' ? '식전' : '식후'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
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
                  {diseaseHistories.map((history) => (
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

            <TabsContent value="medications">
              <div className="flex justify-end mb-4">
                <Button
                  onClick={() => {
                    setDialogType('medication');
                    setShowAddDialog(true);
                    setNewRecord({});
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                : dialogType === 'disease'
                ? '새 질병 이력'
                : '새 약물 추가'}
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
                <div className="space-y-2">
                  <Label>진단일</Label>
                  <Input
                    type="date"
                    value={newRecord.diagnosisDate || ''}
                    onChange={(e) => setNewRecord({ ...newRecord, diagnosisDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>비고</Label>
                  <Textarea
                    value={newRecord.notes || ''}
                    onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                  />
                </div>
              </>
            )}
            {dialogType === 'medication' && (
              <>
                <div className="space-y-2">
                  <Label>약물명</Label>
                  <Input
                    value={newRecord.name || ''}
                    onChange={(e) => setNewRecord({ ...newRecord, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>복용량</Label>
                  <Input
                    value={newRecord.dosage || ''}
                    onChange={(e) => setNewRecord({ ...newRecord, dosage: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>시작일</Label>
                  <Input
                    type="date"
                    value={newRecord.startDate || ''}
                    onChange={(e) => setNewRecord({ ...newRecord, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>종료일 (선택사항)</Label>
                  <Input
                    type="date"
                    value={newRecord.endDate || ''}
                    onChange={(e) => setNewRecord({ ...newRecord, endDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>복용주기</Label>
                  <Input
                    value={newRecord.frequency || ''}
                    onChange={(e) => setNewRecord({ ...newRecord, frequency: e.target.value })}
                    placeholder="예: 하루 3회"
                  />
                </div>
              </>
            )}
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