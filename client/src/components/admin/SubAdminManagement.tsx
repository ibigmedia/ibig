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
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Shield, ShieldOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SelectUser } from "@db/schema";

export function SubAdminManagement() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showInviteDialog, setShowInviteDialog] = React.useState(false);
  const [email, setEmail] = React.useState('');

  const { data: subadmins = [] } = useQuery<SelectUser[]>({
    queryKey: ['/api/admin/subadmins'],
  });

  const inviteMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          role: 'subadmin'
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: '초대 성공',
        description: '서브관리자 초대 이메일이 전송되었습니다.',
      });
      setShowInviteDialog(false);
      setEmail('');
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subadmins'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: '초대 실패',
        description: error.message,
      });
    },
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    inviteMutation.mutate(email);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-bold">{t('admin.subadmins.list')}</h2>
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                {t('admin.subadmins.invite')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('admin.subadmins.invite')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleInvite} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>이메일</Label>
                  <Input
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  {t('admin.users.send-invite')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>사용자명</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subadmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.id}</TableCell>
                  <TableCell>{admin.username}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      <ShieldOff className="h-4 w-4 mr-2" />
                      {t('admin.subadmins.remove')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}