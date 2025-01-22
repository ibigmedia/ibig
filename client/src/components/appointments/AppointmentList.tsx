import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
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
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Trash2 } from 'lucide-react';

interface Appointment {
  id: number;
  date: string;
  department: string;
  status: string;
}

export function AppointmentList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [appointmentToDelete, setAppointmentToDelete] = React.useState<Appointment | null>(null);

  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments'],
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
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
        title: "예약이 삭제되었습니다",
        description: "예약이 성공적으로 삭제되었습니다.",
      });
      setAppointmentToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "오류",
        description: error.message,
      });
    },
  });

  const handleDelete = (appointment: Appointment) => {
    if (appointment.status !== 'cancelled') {
      toast({
        variant: "destructive",
        title: "삭제 불가",
        description: "취소된 예약만 삭제할 수 있습니다.",
      });
      return;
    }
    setAppointmentToDelete(appointment);
  };

  const confirmDelete = () => {
    if (appointmentToDelete) {
      deleteAppointmentMutation.mutate(appointmentToDelete.id);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기중';
      case 'cancelled':
        return '취소됨';
      default:
        return '완료';
    }
  };

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <div
          key={appointment.id}
          className="flex justify-between items-center p-4 bg-white rounded-lg shadow"
        >
          <div className="flex-1">
            <h3 className="font-medium">{appointment.department}</h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              <span>
                {new Date(appointment.date).toLocaleDateString()}
              </span>
              <Clock className="h-4 w-4 ml-3 mr-1" />
              <span>
                {new Date(appointment.date).toLocaleTimeString()}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(appointment.status)}`}
            >
              {getStatusText(appointment.status)}
            </span>
            {appointment.status === 'cancelled' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(appointment)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}

      <AlertDialog 
        open={!!appointmentToDelete} 
        onOpenChange={(open) => !open && setAppointmentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>예약 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 예약을 정말 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteAppointmentMutation.isPending}
            >
              {deleteAppointmentMutation.isPending ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}