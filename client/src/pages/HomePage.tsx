import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserDashboard } from '@/components/user/UserDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { MedicationTracker } from '@/components/medications/MedicationTracker';
import { useQuery } from '@tanstack/react-query';
import { AppointmentScheduler } from '@/components/appointments/AppointmentScheduler';
import { MedicalHistory } from '@/components/medical/MedicalHistory';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, AlertCircle, Heart } from 'lucide-react';
import { WelcomePage } from '@/components/common/WelcomePage';

export function HomePage() {
  const { t } = useLanguage();
  const { data: medicalRecords } = useQuery({
    queryKey: ['/api/medical-records'],
  });

  const [activeTab, setActiveTab] = React.useState('health');
  const [showWelcome, setShowWelcome] = React.useState(() => {
    return !localStorage.getItem('welcomeShown');
  });

  const handleStartApp = () => {
    localStorage.setItem('welcomeShown', 'true');
    setShowWelcome(false);
  };

  if (showWelcome) {
    return <WelcomePage onStart={handleStartApp} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <UserDashboard onTabChange={setActiveTab} />

        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" id="main-tabs">
              <TabsList className="flex w-full justify-start border-b">
                <TabsTrigger value="health" className="text-lg px-6 py-2">
                  건강기록
                </TabsTrigger>
                <TabsTrigger value="medication" className="text-lg px-6 py-2">
                  투약관리
                </TabsTrigger>
                <TabsTrigger value="appointment" className="text-lg px-6 py-2">
                  진료예약
                </TabsTrigger>
              </TabsList>

              <TabsContent value="health" className="mt-0">
                <div className="space-y-6">
                  {/* 알레르기 반응 */}
                  <Card>
                    <CardContent className="space-y-4 pt-6">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                        <h3 className="text-lg font-semibold">알레르기 반응</h3>
                      </div>
                      <div className="grid gap-4">
                        <div>
                          <Label>약물 알레르기</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="약물명" />
                            <Input placeholder="반응 증상" />
                          </div>
                        </div>
                        <div>
                          <Label>음식 알레르기</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="음식명" />
                            <Input placeholder="반응 증상" />
                          </div>
                        </div>
                        <div>
                          <Label>기타 알레르기</Label>
                          <Textarea placeholder="기타 알레르기 반응이나 특이사항을 입력하세요" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 과거 병력 */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <Plus className="h-5 w-5 text-blue-500" />
                        <h3 className="text-lg font-semibold">과거 병력</h3>
                      </div>
                      <MedicalHistory />
                    </CardContent>
                  </Card>

                  {/* 혈압 관리 */}
                  <Card>
                    <CardContent className="space-y-4 pt-6">
                      <div className="flex items-center space-x-2">
                        <Heart className="h-5 w-5 text-red-500" />
                        <h3 className="text-lg font-semibold">혈압 관리</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>수축기 혈압 (최고)</Label>
                          <Input type="number" placeholder="mmHg" />
                        </div>
                        <div>
                          <Label>이완기 혈압 (최저)</Label>
                          <Input type="number" placeholder="mmHg" />
                        </div>
                      </div>
                      <div>
                        <Label>측정 일시</Label>
                        <Input type="datetime-local" />
                      </div>
                      <div>
                        <Label>특이사항</Label>
                        <Textarea placeholder="특이사항이나 증상을 입력하세요" />
                      </div>
                      <Button className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        혈압 기록 추가
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="medication" className="mt-0">
                <MedicationTracker />
              </TabsContent>

              <TabsContent value="appointment" className="mt-0">
                <AppointmentScheduler />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}