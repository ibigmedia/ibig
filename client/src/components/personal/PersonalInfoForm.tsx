import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

interface PersonalInfoFormData {
  name: string;
  birthDate: string;
  notes?: string;
}

interface PersonalInfoFormProps {
  initialData?: PersonalInfoFormData;
}

export function PersonalInfoForm({ initialData }: PersonalInfoFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, setValue } = useForm<PersonalInfoFormData>({
    defaultValues: {
      name: initialData?.name || '',
      birthDate: initialData?.birthDate || '',
      notes: initialData?.notes || '',
    },
  });

  React.useEffect(() => {
    if (initialData) {
      setValue('name', initialData.name);
      setValue('birthDate', initialData.birthDate);
      setValue('notes', initialData.notes || '');
    }
  }, [initialData, setValue]);

  const mutation = useMutation({
    mutationFn: async (data: PersonalInfoFormData) => {
      const response = await fetch('/api/medical-records', {
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
        description: '개인정보가 저장되었습니다.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/medical-records'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: '오류',
        description: error.message,
      });
    },
  });

  const onSubmit = handleSubmit((data) => {
    mutation.mutate(data);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4 sm:gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium">이름</Label>
          <Input 
            {...register('name')}
            className="w-full"
            placeholder="이름을 입력하세요"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">생년월일</Label>
          <Input 
            type="date"
            {...register('birthDate')}
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">메모</Label>
          <Textarea 
            {...register('notes')}
            className="min-h-[100px] resize-none"
            placeholder="추가 정보를 입력하세요"
          />
        </div>
      </div>
      <Button 
        type="submit"
        className="w-full"
      >
        <Save className="h-4 w-4 mr-2" />
        저장
      </Button>
    </form>
  );
}