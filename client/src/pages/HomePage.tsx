import React from 'react';
import { UserDashboard } from '@/components/user/UserDashboard';

export function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <UserDashboard />
    </div>
  );
}