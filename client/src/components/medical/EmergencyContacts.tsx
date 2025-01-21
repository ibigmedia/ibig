import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Phone, Mail } from 'lucide-react';

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
  const [editingContact, setEditingContact] = React.useState<EmergencyContact | null>(null);
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
      setEditingContact(null);
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

  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/emergency-contacts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }
    },
    onSuccess: () => {
      toast({
        title: '성공',
        description: '비상연락처가 삭제되었습니다.',
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

  const setMainContactMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/emergency-contacts/${id}/main`, {
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

  const handleDelete = (id: number) => {
    if (window.confirm('정말로 이 연락처를 삭제하시겠습니까?')) {
      deleteContactMutation.mutate(id);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <h2 className="text-lg font-bold">비상연락처</h2>
        <Button
          onClick={() => setShowAddDialog(true)}
          disabled={contacts.length >= 3}
        >
          <Plus className="h-4 w-4 mr-2" />
          연락처 추가
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="p-4 border rounded-lg flex items-start justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{contact.name}</h3>
                  <span className="text-sm text-muted-foreground">
                    ({contact.relationship})
                  </span>
                  {contact.isMainContact && (
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                      주 연락처
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {contact.phoneNumber}
                  </span>
                  {contact.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {contact.email}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingContact(contact)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  수정
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(contact.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  삭제
                </Button>
                {!contact.isMainContact && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMainContactMutation.mutate(contact.id)}
                  >
                    주 연락처로 설정
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>비상연락처 추가</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addContactMutation.mutate(newContact);
              }}
              className="space-y-4"
            >
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
                <Label>이메일 (선택)</Label>
                <Input
                  type="email"
                  value={newContact.email}
                  onChange={(e) =>
                    setNewContact({ ...newContact, email: e.target.value })
                  }
                />
              </div>
              <Button type="submit" className="w-full">
                저장
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={!!editingContact}
          onOpenChange={(open) => !open && setEditingContact(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>비상연락처 수정</DialogTitle>
            </DialogHeader>
            {editingContact && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateContactMutation.mutate(editingContact);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>이름</Label>
                  <Input
                    value={editingContact.name}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>관계</Label>
                  <Input
                    value={editingContact.relationship}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        relationship: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>전화번호</Label>
                  <Input
                    value={editingContact.phoneNumber}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        phoneNumber: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>이메일 (선택)</Label>
                  <Input
                    type="email"
                    value={editingContact.email || ''}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
                <Button type="submit" className="w-full">
                  저장
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}