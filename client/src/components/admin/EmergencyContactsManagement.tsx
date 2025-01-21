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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from '@/contexts/LanguageContext';
import { Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SelectEmergencyContact } from "@db/schema";

interface EmergencyContactWithUser extends SelectEmergencyContact {
  user: {
    username: string;
    name: string;
    email?: string | null;
  };
}

export function EmergencyContactsManagement() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedContact, setSelectedContact] = React.useState<EmergencyContactWithUser | null>(null);
  const [showEditDialog, setShowEditDialog] = React.useState(false);

  const { data: contacts = [] } = useQuery<EmergencyContactWithUser[]>({
    queryKey: ['/api/admin/emergency-contacts'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/emergency-contacts/${id}`, {
        method: 'DELETE',
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
        description: '비상연락처가 삭제되었습니다.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/emergency-contacts'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: '오류',
        description: error.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (contact: EmergencyContactWithUser) => {
      const response = await fetch(`/api/admin/emergency-contacts/${contact.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(contact),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: '성공',
        description: '비상연락처가 업데이트되었습니다.',
      });
      setShowEditDialog(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/emergency-contacts'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: '오류',
        description: error.message,
      });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedContact) {
      updateMutation.mutate(selectedContact);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold">{t('admin.emergency.list')}</h2>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>환자명</TableHead>
                <TableHead>이름</TableHead>
                <TableHead>관계</TableHead>
                <TableHead>연락처</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>주 연락처</TableHead>
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>{contact.user.name || contact.user.username}</TableCell>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell>{contact.relationship}</TableCell>
                  <TableCell>{contact.phoneNumber}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>
                    {contact.isMainContact ? 
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        주 연락처
                      </span> 
                      : null
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedContact(contact);
                          setShowEditDialog(true);
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        {t('admin.emergency.edit')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(contact.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('admin.emergency.delete')}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>비상연락처 수정</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label>이름</Label>
              <Input
                value={selectedContact?.name || ''}
                onChange={(e) =>
                  setSelectedContact(prev =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label>관계</Label>
              <Input
                value={selectedContact?.relationship || ''}
                onChange={(e) =>
                  setSelectedContact(prev =>
                    prev ? { ...prev, relationship: e.target.value } : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label>연락처</Label>
              <Input
                value={selectedContact?.phoneNumber || ''}
                onChange={(e) =>
                  setSelectedContact(prev =>
                    prev ? { ...prev, phoneNumber: e.target.value } : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label>이메일</Label>
              <Input
                type="email"
                value={selectedContact?.email || ''}
                onChange={(e) =>
                  setSelectedContact(prev =>
                    prev ? { ...prev, email: e.target.value } : null
                  )
                }
              />
            </div>
            <Button type="submit" className="w-full">저장</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}