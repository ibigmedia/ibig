import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
} from '@/components/ui/dialog';
import { Plus, Edit, Star, Trash2 } from 'lucide-react';

interface EmergencyContact {
  id: number;
  name: string;
  relationship: string;
  phoneNumber: string;
  email: string | null;
  isMainContact: boolean;
}

export function EmergencyContacts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [editContact, setEditContact] = React.useState<EmergencyContact | null>(null);
  const [newContact, setNewContact] = React.useState({
    name: '',
    relationship: '',
    phoneNumber: '',
    email: '',
  });

  const { data: contacts = [] } = useQuery<EmergencyContact[]>({
    queryKey: ['/api/emergency-contacts'],
  });

  const addContactMutation = useMutation({
    mutationFn: async (data: typeof newContact) => {
      const response = await fetch('/api/emergency-contacts', {
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
        description: '비상연락처가 추가되었습니다.',
      });
      setShowAddDialog(false);
      setNewContact({
        name: '',
        relationship: '',
        phoneNumber: '',
        email: '',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/emergency-contacts'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: '오류',
        description: error.message,
      });
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: async (contact: EmergencyContact) => {
      const response = await fetch(`/api/emergency-contacts/${contact.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contact),
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
        description: '비상연락처가 수정되었습니다.',
      });
      setEditContact(null);
      queryClient.invalidateQueries({ queryKey: ['/api/emergency-contacts'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: '오류',
        description: error.message,
      });
    },
  });

  const setMainContactMutation = useMutation({
    mutationFn: async (contactId: number) => {
      const response = await fetch(`/api/emergency-contacts/${contactId}/main`, {
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
        title: '성공',
        description: '주 연락처가 변경되었습니다.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/emergency-contacts'] });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: '오류',
        description: error.message,
      });
    },
  });

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    addContactMutation.mutate(newContact);
  };

  const handleUpdateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (editContact) {
      updateContactMutation.mutate(editContact);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <h2 className="text-lg font-semibold">비상연락처 관리</h2>
        <Button
          onClick={() => setShowAddDialog(true)}
          disabled={contacts.length >= 3}
        >
          <Plus className="h-4 w-4 mr-2" />
          비상연락처 추가
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>관계</TableHead>
              <TableHead>연락처</TableHead>
              <TableHead>이메일</TableHead>
              <TableHead>주 연락처</TableHead>
              <TableHead className="text-right">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">{contact.name}</TableCell>
                <TableCell>{contact.relationship}</TableCell>
                <TableCell>{contact.phoneNumber}</TableCell>
                <TableCell>{contact.email || '-'}</TableCell>
                <TableCell>
                  {contact.isMainContact && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                      주 연락처
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditContact(contact)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={contact.isMainContact ? "default" : "ghost"}
                      size="icon"
                      onClick={() => setMainContactMutation.mutate(contact.id)}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (window.confirm('이 연락처를 삭제하시겠습니까?')) {
                          // 삭제 로직
                        }
                      }}
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

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>비상연락처 추가</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddContact} className="space-y-4">
            <div className="space-y-2">
              <Label>이름</Label>
              <Input
                value={newContact.name}
                onChange={(e) =>
                  setNewContact({ ...newContact, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>관계</Label>
              <Input
                value={newContact.relationship}
                onChange={(e) =>
                  setNewContact({ ...newContact, relationship: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>전화번호</Label>
              <Input
                value={newContact.phoneNumber}
                onChange={(e) =>
                  setNewContact({ ...newContact, phoneNumber: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>이메일 (선택사항)</Label>
              <Input
                type="email"
                value={newContact.email}
                onChange={(e) =>
                  setNewContact({ ...newContact, email: e.target.value })
                }
              />
            </div>
            <Button type="submit" disabled={addContactMutation.isPending}>
              저장
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editContact} onOpenChange={() => setEditContact(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>비상연락처 수정</DialogTitle>
          </DialogHeader>
          {editContact && (
            <form onSubmit={handleUpdateContact} className="space-y-4">
              <div className="space-y-2">
                <Label>이름</Label>
                <Input
                  value={editContact.name}
                  onChange={(e) =>
                    setEditContact({ ...editContact, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>관계</Label>
                <Input
                  value={editContact.relationship}
                  onChange={(e) =>
                    setEditContact({
                      ...editContact,
                      relationship: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>전화번호</Label>
                <Input
                  value={editContact.phoneNumber}
                  onChange={(e) =>
                    setEditContact({
                      ...editContact,
                      phoneNumber: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>이메일 (선택사항)</Label>
                <Input
                  type="email"
                  value={editContact.email || ''}
                  onChange={(e) =>
                    setEditContact({ ...editContact, email: e.target.value })
                  }
                />
              </div>
              <Button type="submit" disabled={updateContactMutation.isPending}>
                저장
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}