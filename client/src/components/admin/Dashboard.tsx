import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { SmtpSettingsDialog } from './SmtpSettingsDialog';

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  activePresciptions: number;
}

interface RecentAppointment {
  id: number;
  patientName: string;
  date: string;
  department: string;
  status: string;
}

export function Dashboard() {
  const { t } = useLanguage();
  const [showSmtpSettings, setShowSmtpSettings] = React.useState(false);

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/stats'],
  });

  const { data: appointments } = useQuery<RecentAppointment[]>({
    queryKey: ['/api/admin/recent-appointments'],
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h3 className="text-lg font-bold">대시보드 개요</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSmtpSettings(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            이메일 설정
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-primary/10 rounded-lg">
              <h4 className="font-medium">전체 환자</h4>
              <p className="text-2xl font-bold">{stats?.totalPatients ?? '-'}</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <h4 className="font-medium">오늘의 예약</h4>
              <p className="text-2xl font-bold">{stats?.todayAppointments ?? '-'}</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <h4 className="font-medium">활성 처방</h4>
              <p className="text-2xl font-bold">{stats?.activePresciptions ?? '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold">최근 예약</h3>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>환자</TableHead>
                <TableHead>날짜</TableHead>
                <TableHead>진료과</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments?.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.patientName}</TableCell>
                  <TableCell>{appointment.date}</TableCell>
                  <TableCell>{appointment.department}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 ${
                      appointment.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    } rounded-full text-sm`}>
                      {appointment.status === 'completed' ? '완료' : '예약됨'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SmtpSettingsDialog
        open={showSmtpSettings}
        onOpenChange={setShowSmtpSettings}
      />
    </div>
  );
}