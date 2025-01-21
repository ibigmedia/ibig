import React from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { useToast } from "@/hooks/use-toast";
import { Eye } from "lucide-react";
import type { SelectUser } from "@db/schema";

interface UserDetails {
  medicalRecords: any[];
  appointments: any[];
  medications: any[];
  emergencyContacts: any[];
}

export function UserManagement() {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = React.useState<SelectUser | null>(null);
  const [showDetails, setShowDetails] = React.useState(false);

  const { data: users = [] } = useQuery<SelectUser[]>({
    queryKey: ['/api/admin/users'],
  });

  const { data: userDetails } = useQuery<UserDetails>({
    queryKey: ['/api/admin/user-details', selectedUser?.id],
    enabled: !!selectedUser,
  });

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
                <TableHead>역할</TableHead>
                <TableHead>상세정보</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.role === 'admin' ? '관리자' : '일반 사용자'}</TableCell>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
