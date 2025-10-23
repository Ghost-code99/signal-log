'use client';

import React from 'react';
import DatabaseDashboard from '@/components/admin/database-dashboard';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <DatabaseDashboard />
      </div>
    </div>
  );
}
