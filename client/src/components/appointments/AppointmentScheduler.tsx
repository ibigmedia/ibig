import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckSquare, CalendarClock, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function AppointmentScheduler() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [time, setTime] = React.useState<string>("");
  const [department, setDepartment] = React.useState<string>("");

  const createAppointment = useMutation({
    mutationFn: async () => {
      if (!date || !time || !department) {
        throw new Error("모든 필드를 입력해주세요");
      }

      const appointmentDate = new Date(date);
      const [hours, minutes] = time.split(':');
      appointmentDate.setHours(parseInt(hours), parseInt(minutes));

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: appointmentDate.toISOString(),
          department,
          status: 'pending',
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
        title: "예약 완료",
        description: "진료 예약이 성공적으로 생성되었습니다.",
      });
      // Reset form
      setTime("");
      setDepartment("");
      // Refresh appointments list
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAppointment.mutate();
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
    </div>
  );
}