// Database Monitoring and Analytics
// Provides comprehensive monitoring for your Supabase database

import { supabaseClient } from './supabase-client'

export interface DatabaseMetrics {
  connectionCount: number
  queryPerformance: QueryPerformance[]
  tableSizes: TableSize[]
  indexUsage: IndexUsage[]
  rlsEffectiveness: RLSEffectiveness[]
}

export interface QueryPerformance {
  query: string
  avgDuration: number
  callCount: number
  lastExecuted: Date
}

export interface TableSize {
  tableName: string
  rowCount: number
  sizeBytes: number
  lastAnalyzed: Date
}

export interface IndexUsage {
  indexName: string
  tableName: string
  usageCount: number
  effectiveness: number
}

export interface RLSEffectiveness {
  tableName: string
  policyName: string
  blockCount: number
  allowCount: number
  effectiveness: number
}

export class DatabaseMonitor {
  private static instance: DatabaseMonitor
  private metrics: DatabaseMetrics | null = null
  private lastUpdate: Date | null = null

  static getInstance(): DatabaseMonitor {
    if (!DatabaseMonitor.instance) {
      DatabaseMonitor.instance = new DatabaseMonitor()
    }
    return DatabaseMonitor.instance
  }

  // Get comprehensive database metrics
  async getMetrics(): Promise<DatabaseMetrics> {
    if (this.metrics && this.lastUpdate && 
        Date.now() - this.lastUpdate.getTime() < 300000) { // 5 minute cache
      return this.metrics
    }

    const [queryPerformance, tableSizes, indexUsage, rlsEffectiveness] = await Promise.all([
      this.getQueryPerformance(),
      this.getTableSizes(),
      this.getIndexUsage(),
      this.getRLSEffectiveness()
    ])

    this.metrics = {
      connectionCount: await this.getConnectionCount(),
      queryPerformance,
      tableSizes,
      indexUsage,
      rlsEffectiveness
    }

    this.lastUpdate = new Date()
    return this.metrics
  }

  // Monitor query performance
  private async getQueryPerformance(): Promise<QueryPerformance[]> {
    try {
      const { data, error } = await supabaseClient.rpc('get_query_performance')
      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Query performance monitoring not available:', error)
      return []
    }
  }

  // Monitor table sizes and growth
  private async getTableSizes(): Promise<TableSize[]> {
    try {
      const { data, error } = await supabaseClient.rpc('get_table_sizes')
      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Table size monitoring not available:', error)
      return []
    }
  }

  // Monitor index usage and effectiveness
  private async getIndexUsage(): Promise<IndexUsage[]> {
    try {
      const { data, error } = await supabaseClient.rpc('get_index_usage')
      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Index usage monitoring not available:', error)
      return []
    }
  }

  // Monitor RLS policy effectiveness
  private async getRLSEffectiveness(): Promise<RLSEffectiveness[]> {
    try {
      const { data, error } = await supabaseClient.rpc('get_rls_effectiveness')
      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('RLS effectiveness monitoring not available:', error)
      return []
    }
  }

  // Get current connection count
  private async getConnectionCount(): Promise<number> {
    try {
      const { data, error } = await supabaseClient.rpc('get_connection_count')
      if (error) throw error
      return data || 0
    } catch (error) {
      console.warn('Connection monitoring not available:', error)
      return 0
    }
  }

  // Health check for database
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    issues: string[]
    recommendations: string[]
  }> {
    const metrics = await this.getMetrics()
    const issues: string[] = []
    const recommendations: string[] = []

    // Check query performance
    const slowQueries = metrics.queryPerformance.filter(q => q.avgDuration > 1000)
    if (slowQueries.length > 0) {
      issues.push(`${slowQueries.length} slow queries detected`)
      recommendations.push('Consider adding indexes or optimizing queries')
    }

    // Check table sizes
    const largeTables = metrics.tableSizes.filter(t => t.sizeBytes > 100000000) // 100MB
    if (largeTables.length > 0) {
      issues.push(`${largeTables.length} large tables detected`)
      recommendations.push('Consider archiving old data or partitioning')
    }

    // Check index effectiveness
    const unusedIndexes = metrics.indexUsage.filter(i => i.usageCount === 0)
    if (unusedIndexes.length > 0) {
      issues.push(`${unusedIndexes.length} unused indexes detected`)
      recommendations.push('Consider removing unused indexes to improve write performance')
    }

    // Check RLS effectiveness
    const ineffectiveRLS = metrics.rlsEffectiveness.filter(r => r.effectiveness < 0.8)
    if (ineffectiveRLS.length > 0) {
      issues.push(`${ineffectiveRLS.length} ineffective RLS policies detected`)
      recommendations.push('Review and optimize RLS policies')
    }

    const status = issues.length === 0 ? 'healthy' : 
                   issues.length <= 2 ? 'degraded' : 'unhealthy'

    return { status, issues, recommendations }
  }

  // Generate performance report
  async generateReport(): Promise<string> {
    const metrics = await this.getMetrics()
    const health = await this.healthCheck()

    return `
# Database Performance Report
Generated: ${new Date().toISOString()}

## Health Status: ${health.status.toUpperCase()}

### Connection Metrics
- Active Connections: ${metrics.connectionCount}

### Query Performance
${metrics.queryPerformance.map(q => `
- ${q.query}: ${q.avgDuration}ms avg (${q.callCount} calls)
`).join('')}

### Table Sizes
${metrics.tableSizes.map(t => `
- ${t.tableName}: ${t.rowCount} rows, ${(t.sizeBytes / 1024 / 1024).toFixed(2)}MB
`).join('')}

### Index Usage
${metrics.indexUsage.map(i => `
- ${i.indexName} (${i.tableName}): ${i.usageCount} uses, ${(i.effectiveness * 100).toFixed(1)}% effective
`).join('')}

### RLS Effectiveness
${metrics.rlsEffectiveness.map(r => `
- ${r.policyName} (${r.tableName}): ${r.allowCount} allows, ${r.blockCount} blocks
`).join('')}

### Issues
${health.issues.length > 0 ? health.issues.map(issue => `- ${issue}`).join('\n') : '- No issues detected'}

### Recommendations
${health.recommendations.map(rec => `- ${rec}`).join('\n')}
    `.trim()
  }
}

// Export singleton instance
export const databaseMonitor = DatabaseMonitor.getInstance()
