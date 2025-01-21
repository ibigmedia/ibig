import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function Dashboard() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold">Dashboard Overview</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-primary/10 rounded-lg">
              <h4 className="font-medium">Total Patients</h4>
              <p className="text-2xl font-bold">1,234</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <h4 className="font-medium">Today's Appointments</h4>
              <p className="text-2xl font-bold">45</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <h4 className="font-medium">Active Prescriptions</h4>
              <p className="text-2xl font-bold">89</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold">Recent Appointments</h3>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>John Doe</TableCell>
                <TableCell>2024-03-20</TableCell>
                <TableCell>Cardiology</TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Completed
                  </span>
                </TableCell>
              </TableRow>
              {/* Add more rows as needed */}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
