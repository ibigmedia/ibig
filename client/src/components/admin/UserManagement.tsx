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
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, Edit2 } from "lucide-react";
import type { SelectUser } from "@db/schema";

interface UserDetails {
  medicalRecords: any[];
  appointments: any[];
  medications: any[];
  emergencyContacts: any[];
}

export function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = React.useState<SelectUser | null>(null);
  const [showDetails, setShowDetails] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [editForm, setEditForm] = React.useState({
    username: '',
    email: '',
  });

  const { data: users = [] } = useQuery<SelectUser[]>({
    queryKey: ['/api/admin/users'],
  });

  const { data: userDetails } = useQuery<UserDetails>({
    queryKey: ['/api/admin/user-details', selectedUser?.id],
    enabled: !!selectedUser,
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: number; data: typeof editForm }) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: '수정 완료',
        description: '사용자 정보가 업데이트되었습니다.',
      });
      setShowEditDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: '수정 실패',
        description: error.message,
      });
    },
  });

  const handleEdit = (user: SelectUser) => {
    setEditForm({
      username: user.username,
      email: user.email || '',
    });
    setSelectedUser(user);
    setShowEditDialog(true);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    updateUserMutation.mutate({
      userId: selectedUser.id,
      data: editForm,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold">사용자 목록</h2>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>사용자명</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role === 'admin' ? '관리자' : user.role === 'subadmin' ? '서브관리자' : '일반 사용자'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDetails(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        상세보기
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        수정
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사용자 정보 수정</DialogTitle>
            <DialogDescription>사용자의 정보를 수정합니다.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="space-y-2">
              <Label>사용자명</Label>
              <Input
                value={editForm.username}
                onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>이메일</Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              수정하기
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>사용자 상세 정보</DialogTitle>
          </DialogHeader>
          {selectedUser && userDetails && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">의료 기록</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>이름</TableHead>
                      <TableHead>생년월일</TableHead>
                      <TableHead>특이사항</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userDetails.medicalRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.name}</TableCell>
                        <TableCell>{record.birthDate}</TableCell>
                        <TableCell>{record.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">예약 현황</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>날짜</TableHead>
                      <TableHead>진료과</TableHead>
                      <TableHead>상태</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userDetails.appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>{new Date(appointment.date).toLocaleDateString()}</TableCell>
                        <TableCell>{appointment.department}</TableCell>
                        <TableCell>{appointment.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">투약 정보</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>약물명</TableHead>
                      <TableHead>복용량</TableHead>
                      <TableHead>복용기간</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userDetails.medications.map((medication) => (
                      <TableRow key={medication.id}>
                        <TableCell>{medication.name}</TableCell>
                        <TableCell>{medication.dosage}</TableCell>
                        <TableCell>{`${new Date(medication.startDate).toLocaleDateString()} ~ ${medication.endDate ? new Date(medication.endDate).toLocaleDateString() : '진행중'}`}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}