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
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Shield, Mail } from "lucide-react";
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
    onSuccess: (data) => {
      toast({
        title: '초대 이메일 발송 완료',
        description: '서브관리자 초대 이메일이 발송되었습니다.',
      });
      setShowInviteDialog(false);
      setEmail('');
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
          <h2 className="text-lg font-bold">서브관리자 관리</h2>
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                서브관리자 초대
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>서브관리자 초대</DialogTitle>
                <DialogDescription>
                  초대할 서브관리자의 이메일 주소를 입력하세요. 초대 링크가 포함된 이메일이 발송됩니다.
                </DialogDescription>
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
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={inviteMutation.isPending}
                >
                  {inviteMutation.isPending ? (
                    <>
                      <Mail className="h-4 w-4 mr-2 animate-spin" />
                      초대 메일 발송 중...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      초대 메일 발송
                    </>
                  )}
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
                <TableHead>권한</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subadmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.id}</TableCell>
                  <TableCell>{admin.username}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-primary" />
                      서브관리자
                    </div>
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