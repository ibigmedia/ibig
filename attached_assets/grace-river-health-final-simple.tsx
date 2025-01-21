import React, { useState } from 'react';

function HealthBook() {
  const [activeTab, setActiveTab] = useState('medical-id');
  const [isDiabetic, setIsDiabetic] = useState(false);

  function MedicalIDTab() {
    return (
      <div className="space-y-6">
        {/* 기본 정보 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">기본 정보</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">이름</label>
                <input type="text" className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">생년월일</label>
                <input type="date" className="w-full px-3 py-2 border rounded" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="diabetesCheck"
                checked={isDiabetic}
                onChange={(e) => setIsDiabetic(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="diabetesCheck" className="text-sm font-medium">
                당뇨 여부
              </label>
            </div>
          </div>
        </div>

        {/* 질병 목록 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">질병 목록 (Past Medical History)</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="진단명"
                className="w-full px-3 py-2 border rounded"
              />
              <input
                type="date"
                className="w-full px-3 py-2 border rounded"
                placeholder="진단일"
              />
              <input
                type="text"
                placeholder="치료 현황"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">특이사항</label>
              <textarea
                className="w-full px-3 py-2 border rounded h-24"
                placeholder="질병과 관련된 특이사항을 입력하세요."
              ></textarea>
            </div>
          </div>
        </div>

        {/* 알레르기 기록 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">알레르기 기록 (Allergies)</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">약물 알레르기</h4>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="약물명"
                  className="w-full px-3 py-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="반응 증상"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">음식 알레르기</h4>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="음식명"
                  className="w-full px-3 py-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="반응 증상"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">기타 알레르기</h4>
              <textarea
                className="w-full px-3 py-2 border rounded h-20"
                placeholder="기타 알레르기 반응이나 특이사항을 입력하세요."
              ></textarea>
            </div>
            <div className="bg-yellow-50 p-4 rounded">
              <p className="text-sm text-yellow-800">
                ⚠️ 알레르기 정보는 응급 상황 시 매우 중요한 정보입니다.
                정확하게 기록하고 의료진과 반드시 공유해 주세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">은혜의 강 헬스북</h1>
        <p className="text-gray-500 mt-2">체계적인 건강 관리의 시작</p>
      </div>

      <div className="mb-6">
        <div className="flex space-x-4 border-b">
          <button
            onClick={() => setActiveTab('medical-id')}
            className={`px-4 py-2 ${activeTab === 'medical-id' ? 'border-b-2 border-blue-500' : ''}`}
          >
            의료 기록
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 ${activeTab === 'appointments' ? 'border-b-2 border-blue-500' : ''}`}
          >
            의료 예약
          </button>
          <button
            onClick={() => setActiveTab('medications')}
            className={`px-4 py-2 ${activeTab === 'medications' ? 'border-b-2 border-blue-500' : ''}`}
          >
            약물 관리
          </button>
        </div>
      </div>

      {activeTab === 'medical-id' && <MedicalIDTab />}
    </div>
  );
}

export default HealthBook;