import React from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
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

export function PersonalInfoForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: personalInfo } = useQuery({
    queryKey: ['/api/medical-records'],
    select: (records: any[]) => records[0],
  });

  const { register, handleSubmit, setValue } = useForm<PersonalInfoFormData>({
    defaultValues: {
      name: '',
      birthDate: '',
      notes: '',
    },
  });

  React.useEffect(() => {
    if (personalInfo) {
      setValue('name', personalInfo.name);
      setValue('birthDate', personalInfo.birthDate);
      setValue('notes', personalInfo.notes);
    }
  }, [personalInfo, setValue]);

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
    <form onSubmit={onSubmit} className="w-full">
      <Card>
        <CardContent className="space-y-6 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">이름</Label>
              <Input 
                {...register('name')}
                className="w-full"
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
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">메모</Label>
            <Textarea 
              {...register('notes')}
              className="min-h-[100px] w-full"
            />
          </div>
          <Button 
            type="submit"
            className="w-full sm:w-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            저장
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}