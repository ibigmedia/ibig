import React from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { Pencil, Trash2 } from "lucide-react";
import type { SelectEmergencyContact } from "@db/schema";

interface EmergencyContactWithUser extends SelectEmergencyContact {
  user: {
    username: string;
    email?: string | null;
  };
}

export function EmergencyContactsManagement() {
  const { t } = useLanguage();
  const { data: contacts = [] } = useQuery<EmergencyContactWithUser[]>({
    queryKey: ['/api/admin/emergency-contacts'],
  });

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
                  <TableCell>{contact.user.username}</TableCell>
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
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4 mr-2" />
                        {t('admin.emergency.edit')}
                      </Button>
                      <Button variant="ghost" size="sm">
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
    </div>
  );
}