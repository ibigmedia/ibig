import React from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { PersonalInfoForm } from '@/components/personal/PersonalInfoForm';
import { EmergencyContacts } from '@/components/user/EmergencyContacts';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { ChangePasswordDialog } from '@/components/user/ChangePasswordDialog';

export function PersonalInfoPage() {
  const { data: personalInfo } = useQuery({
    queryKey: ['/api/medical-records'],
    select: (records: any[]) => records[0],
  });

  const [showPasswordDialog, setShowPasswordDialog] = React.useState(false);

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="px-3 py-4 sm:p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  개인정보 관리
                </h2>
                <p className="text-sm text-muted-foreground">
                  개인정보와 건강정보를 관리할 수 있습니다
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordDialog(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                비밀번호 변경
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <PersonalInfoForm initialData={personalInfo} />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="px-3 py-4 sm:p-6">
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              비상연락망 관리
            </h2>
            <p className="text-sm text-muted-foreground">
              비상시 연락할 수 있는 연락처를 관리할 수 있습니다
            </p>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <EmergencyContacts />
          </CardContent>
        </Card>

        <ChangePasswordDialog 
          open={showPasswordDialog} 
          onOpenChange={setShowPasswordDialog}
        />
      </div>
    </div>
  );
}