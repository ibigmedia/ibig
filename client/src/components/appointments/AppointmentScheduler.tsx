import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckSquare, CalendarClock, RefreshCw, Trash2, Edit2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

interface Appointment {
  id: number;
  date: string;
  department: string;
  status: string;
}

export function AppointmentScheduler() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [time, setTime] = React.useState<string>("");
  const [department, setDepartment] = React.useState<string>("");
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = React.useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false);
  const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null);

  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments'],
  });

  const createAppointment = useMutation({
    mutationFn: async () => {
      if (!date || !time || !department) {
        throw new Error("모든 필드를 입력해주세요");
      }

      const appointmentDate = new Date(date.getTime());
      const [hours, minutes] = time.split(':');
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: appointmentDate.toISOString(),
          department
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "예약 완료",
        description: "진료 예약이 성공적으로 생성되었습니다.",
      });
      setTime("");
      setDepartment("");
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "예약 실패",
        description: error.message,
      });
    },
  });

  const rescheduleAppointment = useMutation({
    mutationFn: async (appointmentId: number) => {
      if (!date || !time || !department) {
        throw new Error("모든 필드를 입력해주세요");
      }

      const appointmentDate = new Date(date.getTime());
      const [hours, minutes] = time.split(':');
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const response = await fetch(`/api/appointments/${appointmentId}/reschedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: appointmentDate.toISOString(),
          department
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "일정 변경 완료",
        description: "진료 예약이 성공적으로 변경되었습니다.",
      });
      setIsRescheduleDialogOpen(false);
      setSelectedAppointment(null);
      setTime("");
      setDepartment("");
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "일정 변경 실패",
        description: error.message,
      });
    },
  });

  const cancelAppointment = useMutation({
    mutationFn: async (appointmentId: number) => {
      const response = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: 'PUT',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "예약 취소 완료",
        description: "진료 예약이 취소되었습니다.",
      });
      setIsCancelDialogOpen(false);
      setSelectedAppointment(null);
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "예약 취소 실패",
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAppointment.mutate();
  };

  const handleReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAppointment) {
      rescheduleAppointment.mutate(selectedAppointment.id);
    }
  };

  const openRescheduleDialog = (appointment: Appointment) => {
    const appointmentDate = new Date(appointment.date);
    setDate(appointmentDate);
    setTime(`${appointmentDate.getHours().toString().padStart(2, '0')}:${appointmentDate.getMinutes().toString().padStart(2, '0')}`);
    setDepartment(appointment.department);
    setSelectedAppointment(appointment);
    setIsRescheduleDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold">사용 방법</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <Alert>
              <CalendarClock className="h-4 w-4" />
              <AlertTitle>예약 정보 작성</AlertTitle>
              <AlertDescription>
                예약 날짜와 시간, 방문할 병원 또는 의사의 이름, 방문 이유를 기입하세요.
              </AlertDescription>
            </Alert>
            <Alert>
              <CheckSquare className="h-4 w-4" />
              <AlertTitle>완료 여부 체크</AlertTitle>
              <AlertDescription>
                방문 후 완료란에 체크를 하여 기록을 마무리하세요.
              </AlertDescription>
            </Alert>
            <Alert>
              <RefreshCw className="h-4 w-4" />
              <AlertTitle>정기적인 확인</AlertTitle>
              <AlertDescription>
                추적기를 주기적으로 확인하여 중요한 예약을 놓치지 않도록 하세요.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold">나의 예약 현황</h3>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>날짜</TableHead>
                <TableHead>진료과</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="w-[100px]">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{new Date(appointment.date).toLocaleString()}</TableCell>
                  <TableCell>{appointment.department}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      appointment.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : appointment.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status === 'confirmed'
                        ? '확정'
                        : appointment.status === 'cancelled'
                        ? '취소됨'
                        : '대기중'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openRescheduleDialog(appointment)}
                        disabled={appointment.status === 'cancelled'}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setIsCancelDialogOpen(true);
                        }}
                        disabled={appointment.status === 'cancelled'}
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

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold">진료 일정</h3>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold">진료 시간 선택</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger>
                <SelectValue placeholder="시간 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="09:00">오전 9:00</SelectItem>
                <SelectItem value="10:00">오전 10:00</SelectItem>
                <SelectItem value="11:00">오전 11:00</SelectItem>
                <SelectItem value="14:00">오후 2:00</SelectItem>
                <SelectItem value="15:00">오후 3:00</SelectItem>
                <SelectItem value="16:00">오후 4:00</SelectItem>
              </SelectContent>
            </Select>

            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="진료과 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">내과</SelectItem>
                <SelectItem value="cardiology">심장내과</SelectItem>
                <SelectItem value="neurology">신경과</SelectItem>
                <SelectItem value="pediatrics">소아과</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              type="submit" 
              className="w-full"
              disabled={createAppointment.isPending || !date || !time || !department}
            >
              {createAppointment.isPending ? "예약 중..." : "진료 예약하기"}
            </Button>
          </CardContent>
        </Card>
      </form>

      {/* 일정 변경 다이얼로그 */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>예약 일정 변경</DialogTitle>
            <DialogDescription>
              새로운 예약 일정을 선택해주세요.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReschedule}>
            <div className="grid gap-4 py-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border mx-auto"
              />
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger>
                  <SelectValue placeholder="시간 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="09:00">오전 9:00</SelectItem>
                  <SelectItem value="10:00">오전 10:00</SelectItem>
                  <SelectItem value="11:00">오전 11:00</SelectItem>
                  <SelectItem value="14:00">오후 2:00</SelectItem>
                  <SelectItem value="15:00">오후 3:00</SelectItem>
                  <SelectItem value="16:00">오후 4:00</SelectItem>
                </SelectContent>
              </Select>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="진료과 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">내과</SelectItem>
                  <SelectItem value="cardiology">심장내과</SelectItem>
                  <SelectItem value="neurology">신경과</SelectItem>
                  <SelectItem value="pediatrics">소아과</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={!date || !time || !department}>
                일정 변경하기
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 예약 취소 다이얼로그 */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>예약 취소</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 예약을 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedAppointment?.id) {
                  cancelAppointment.mutate(selectedAppointment.id);
                }
              }}
            >
              예약 취소
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}