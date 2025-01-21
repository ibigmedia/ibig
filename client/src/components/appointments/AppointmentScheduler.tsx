import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckSquare, CalendarClock, RefreshCw } from 'lucide-react';

export function AppointmentScheduler() {
  const { t } = useLanguage();
  const [date, setDate] = React.useState<Date | undefined>(new Date());

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

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold">{t('appointments.title')}</h3>
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
            <h3 className="text-lg font-bold">Available Times</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="09:00">09:00</SelectItem>
                <SelectItem value="10:00">10:00</SelectItem>
                <SelectItem value="11:00">11:00</SelectItem>
                <SelectItem value="14:00">14:00</SelectItem>
                <SelectItem value="15:00">15:00</SelectItem>
                <SelectItem value="16:00">16:00</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Internal Medicine</SelectItem>
                <SelectItem value="cardiology">Cardiology</SelectItem>
                <SelectItem value="neurology">Neurology</SelectItem>
                <SelectItem value="pediatrics">Pediatrics</SelectItem>
              </SelectContent>
            </Select>

            <Button className="w-full">Book Appointment</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}