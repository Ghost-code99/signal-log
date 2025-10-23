'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Database,
  Activity,
  Shield,
  Backup,
  Search,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Server
} from 'lucide-react';

// Import our new monitoring modules
import { databaseMonitor } from '@/lib/database-monitoring';
import { backupRecoveryManager } from '@/lib/backup-recovery';
import { realTimeManager } from '@/lib/real-time-subscriptions';
import { advancedSearchEngine } from '@/lib/advanced-search';
import { performanceOptimizer } from '@/lib/performance-optimization';
import { securityManager } from '@/lib/security-hardening';
import { migrationManager } from '@/lib/migration-strategy';

interface DashboardMetrics {
  database: any;
  performance: any;
  security: any;
  backups: any;
  realtime: any;
  search: any;
  migrations: any;
}

export default function DatabaseDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    loadAllMetrics();
    const interval = setInterval(loadAllMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAllMetrics = async () => {
    setLoading(true);
    try {
      const [
        databaseMetrics,
        performanceMetrics,
        securityMetrics,
        backupHealth,
        realtimeStatus,
        searchAnalytics,
        migrationStatus
      ] = await Promise.all([
        databaseMonitor.getMetrics(),
        performanceOptimizer.getPerformanceMetrics(),
        securityManager.getSecurityMetrics(),
        backupRecoveryManager.checkBackupHealth(),
        realTimeManager.getConnectionStatus(),
        advancedSearchEngine.getSearchAnalytics(),
        migrationManager.getMigrationStatus()
      ]);

      setMetrics({
        database: databaseMetrics,
        performance: performanceMetrics,
        security: securityMetrics,
        backups: backupHealth,
        realtime: realtimeStatus,
        search: searchAnalytics,
        migrations: migrationStatus
      });

      // Check for alerts
      checkForAlerts({
        database: databaseMetrics,
        performance: performanceMetrics,
        security: securityMetrics,
        backups: backupHealth
      });
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForAlerts = (metrics: any) => {
    const newAlerts: string[] = [];

    // Database alerts
    if (metrics.database?.connectionCount > 50) {
      newAlerts.push('High database connection count detected');
    }

    // Performance alerts
    if (metrics.performance?.queryTime > 1000) {
      newAlerts.push('Slow query performance detected');
    }

    // Security alerts
    if (metrics.security?.recentViolations > 0) {
      newAlerts.push(`${metrics.security.recentViolations} security violations detected`);
    }

    // Backup alerts
    if (metrics.backups?.status === 'critical') {
      newAlerts.push('Critical backup issues detected');
    }

    setAlerts(newAlerts);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'completed':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case 'warning':
      case 'degraded':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
      case 'critical':
      case 'failed':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Database Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive monitoring and management for your Signal-log database
          </p>
        </div>
        <Button onClick={loadAllMetrics} disabled={loading}>
          <Activity className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-950/20">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="font-semibold text-red-800 dark:text-red-400">Active Alerts</h3>
          </div>
          <ul className="space-y-1">
            {alerts.map((alert, index) => (
              <li key={index} className="text-sm text-red-700 dark:text-red-300">
                • {alert}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="migrations">Migrations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Database Status */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Database Status</p>
                  <p className="text-2xl font-bold">Healthy</p>
                </div>
                <Database className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-4">
                <Badge className={getStatusColor('healthy')}>Online</Badge>
              </div>
            </Card>

            {/* Performance */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Query Time</p>
                  <p className="text-2xl font-bold">
                    {metrics?.performance?.queryTime?.toFixed(0) || 0}ms
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <div className="mt-4">
                <Badge className={getStatusColor(
                  (metrics?.performance?.queryTime || 0) < 500 ? 'healthy' : 'warning'
                )}>
                  {(metrics?.performance?.queryTime || 0) < 500 ? 'Fast' : 'Slow'}
                </Badge>
              </div>
            </Card>

            {/* Security */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Security Events</p>
                  <p className="text-2xl font-bold">
                    {metrics?.security?.totalEvents || 0}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <div className="mt-4">
                <Badge className={getStatusColor(
                  (metrics?.security?.recentViolations || 0) === 0 ? 'healthy' : 'warning'
                )}>
                  {(metrics?.security?.recentViolations || 0) === 0 ? 'Secure' : 'Alerts'}
                </Badge>
              </div>
            </Card>

            {/* Real-time */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Real-time Connections</p>
                  <p className="text-2xl font-bold">
                    {metrics?.realtime?.activeChannels || 0}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-orange-600" />
              </div>
              <div className="mt-4">
                <Badge className={getStatusColor(
                  metrics?.realtime?.connected ? 'healthy' : 'critical'
                )}>
                  {metrics?.realtime?.connected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto p-4">
                <Backup className="w-4 h-4 mr-2" />
                Create Backup
              </Button>
              <Button variant="outline" className="h-auto p-4">
                <Search className="w-4 h-4 mr-2" />
                Run Health Check
              </Button>
              <Button variant="outline" className="h-auto p-4">
                <Shield className="w-4 h-4 mr-2" />
                Security Scan
              </Button>
              <Button variant="outline" className="h-auto p-4">
                <TrendingUp className="w-4 h-4 mr-2" />
                Performance Report
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cache Hit Rate</p>
                <p className="text-2xl font-bold">
                  {((metrics?.performance?.cacheHitRate || 0) * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Queries/Second</p>
                <p className="text-2xl font-bold">
                  {metrics?.performance?.throughput?.queriesPerSecond?.toFixed(1) || 0}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Memory Usage</p>
                <p className="text-2xl font-bold">
                  {metrics?.performance?.memoryUsage?.percentage?.toFixed(1) || 0}%
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Security Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Events by Type</h4>
                {metrics?.security?.eventsByType && Object.entries(metrics.security.eventsByType).map(([type, count]) => (
                  <div key={type} className="flex justify-between py-1">
                    <span className="text-sm">{type}</span>
                    <span className="text-sm font-medium">{count as number}</span>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-medium mb-2">Events by Severity</h4>
                {metrics?.security?.eventsBySeverity && Object.entries(metrics.security.eventsBySeverity).map(([severity, count]) => (
                  <div key={severity} className="flex justify-between py-1">
                    <span className="text-sm">{severity}</span>
                    <span className="text-sm font-medium">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Backups Tab */}
        <TabsContent value="backups" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Backup Status</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Backup Health</p>
                <Badge className={getStatusColor(metrics?.backups?.status || 'unknown')}>
                  {metrics?.backups?.status || 'Unknown'}
                </Badge>
              </div>
              <Button>
                <Backup className="w-4 h-4 mr-2" />
                Create Backup
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Real-time Tab */}
        <TabsContent value="realtime" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Real-time Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Connection Status</p>
                <Badge className={getStatusColor(
                  metrics?.realtime?.connected ? 'healthy' : 'critical'
                )}>
                  {metrics?.realtime?.connected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Channels</p>
                <p className="text-2xl font-bold">{metrics?.realtime?.activeChannels || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Subscriptions</p>
                <p className="text-2xl font-bold">{metrics?.realtime?.activeSubscriptions || 0}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Search Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Searches</p>
                <p className="text-2xl font-bold">{metrics?.search?.totalSearches || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response Time</p>
                <p className="text-2xl font-bold">
                  {metrics?.search?.searchPerformance?.averageResponseTime?.toFixed(0) || 0}ms
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold">
                  {((metrics?.search?.searchPerformance?.successRate || 0) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Migrations Tab */}
        <TabsContent value="migrations" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Migration Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold">{metrics?.migrations?.total || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold">{metrics?.migrations?.pending || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold">{metrics?.migrations?.completed || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed</p>
                <p className="text-2xl font-bold">{metrics?.migrations?.failed || 0}</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
