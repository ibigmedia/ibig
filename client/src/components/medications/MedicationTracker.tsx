import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
import { PlusCircle, Info } from 'lucide-react';

export function MedicationTracker() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold">약물 관리 사용 안내</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm leading-relaxed">
              "김 씨는 혈압 약과 당뇨 약을 복용 중이지만, 정확히 언제 시작했는지 기억이 잘 나지 않았습니다. 
              진료 중에 의사가 약물 부작용에 대해 물었지만, 김 씨는 대답할 수 없었습니다. 
              결국 의사는 약 복용을 중단하고 새로운 약을 처방해야 했습니다. 
              하지만 약물 관리를 사용했다면, 의사에게 명확한 정보를 제공해 약 효과를 최적화할 수 있었을 것입니다."
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">예시: 아래와 같이 기록하면 의료진과 상담 시 유용하게 활용할 수 있습니다.</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted">
                    <th className="border p-2 text-left">약물 이름</th>
                    <th className="border p-2 text-left">복용량/복용 방법</th>
                    <th className="border p-2 text-left">복용 시작일</th>
                    <th className="border p-2 text-left">복용 중단일</th>
                    <th className="border p-2 text-left">비고</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2">리시노프릴</td>
                    <td className="border p-2">하루 10mg, 아침 식후</td>
                    <td className="border p-2">1/1/24</td>
                    <td className="border p-2"></td>
                    <td className="border p-2">혈압 조절용</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="border p-2">메트포르민 ✚</td>
                    <td className="border p-2">하루 2회 500mg</td>
                    <td className="border p-2">2/15/24</td>
                    <td className="border p-2"></td>
                    <td className="border p-2">당뇨병 치료용</td>
                  </tr>
                  <tr className="bg-red-50">
                    <td className="border p-2">암로디핀 ✖</td>
                    <td className="border p-2">하루 1회 5mg</td>
                    <td className="border p-2">8/1/23</td>
                    <td className="border p-2">2/15/24</td>
                    <td className="border p-2">리시노프릴로 대체됨</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">기록 방법:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>복용 중인 약물의 이름, 복용량, 시작일, 중단일 등을 상세히 기록하세요.</li>
              <li>새로 추가된 약물은 ✚ 표시와 함께 파란색 배경으로 강조하세요.</li>
              <li>중단된 약물은 ✖ 표시와 함께 빨간색 배경으로 표시하세요.</li>
              <li>비고란에는 약물의 용도나 특이사항을 기록하세요.</li>
              <li>약물 변경 시 이전 약물과의 관계를 비고란에 명시하세요.</li>
            </ul>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>주의사항</AlertTitle>
            <AlertDescription>
              ⚠️ 모든 약물 변경은 반드시 의사와 상담 후 결정하세요.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold">{t('medications.title')}</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>약물명</Label>
              <Input type="text" />
            </div>
            <div>
              <Label>복용량</Label>
              <Input type="text" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>복용 주기</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="복용 주기 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">하루 1회</SelectItem>
                  <SelectItem value="twice">하루 2회</SelectItem>
                  <SelectItem value="three">하루 3회</SelectItem>
                  <SelectItem value="weekly">주 1회</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>복용 기간</Label>
              <Input type="number" placeholder="일 수" />
            </div>
          </div>

          <Button className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            약물 추가
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}