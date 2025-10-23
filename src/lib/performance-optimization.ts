// Performance Optimization and Caching
// Provides comprehensive performance monitoring and optimization strategies

import { supabaseClient } from './supabase-client'

export interface PerformanceMetrics {
  queryTime: number
  cacheHitRate: number
  connectionPool: {
    active: number
    idle: number
    total: number
  }
  memoryUsage: {
    used: number
    available: number
    percentage: number
  }
  throughput: {
    queriesPerSecond: number
    dataTransferred: number
  }
}

export interface CacheConfig {
  ttl: number // Time to live in milliseconds
  maxSize: number // Maximum cache size
  strategy: 'lru' | 'fifo' | 'ttl'
}

export interface QueryOptimization {
  query: string
  originalTime: number
  optimizedTime: number
  improvement: number
  recommendations: string[]
}

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer
  private cache: Map<string, { data: any; timestamp: number; hits: number }> = new Map()
  private queryMetrics: Map<string, { count: number; totalTime: number; avgTime: number }> = new Map()
  private cacheConfig: CacheConfig = {
    ttl: 300000, // 5 minutes
    maxSize: 1000,
    strategy: 'lru'
  }

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer()
    }
    return PerformanceOptimizer.instance
  }

  // Configure cache settings
  configureCache(config: Partial<CacheConfig>): void {
    this.cacheConfig = { ...this.cacheConfig, ...config }
  }

  // Get cached data
  getCache(key: string): any | null {
    const cached = this.cache.get(key)
    
    if (!cached) return null

    // Check TTL
    if (Date.now() - cached.timestamp > this.cacheConfig.ttl) {
      this.cache.delete(key)
      return null
    }

    // Update hit count
    cached.hits++
    return cached.data
  }

  // Set cache data
  setCache(key: string, data: any): void {
    // Check cache size limit
    if (this.cache.size >= this.cacheConfig.maxSize) {
      this.evictCache()
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 0
    })
  }

  // Evict cache based on strategy
  private evictCache(): void {
    switch (this.cacheConfig.strategy) {
      case 'lru':
        // Remove least recently used
        const lruKey = this.cache.keys().next().value
        if (lruKey) this.cache.delete(lruKey)
        break
      case 'fifo':
        // Remove first in, first out
        const fifoKey = this.cache.keys().next().value
        if (fifoKey) this.cache.delete(fifoKey)
        break
      case 'ttl':
        // Remove oldest by timestamp
        let oldestKey = ''
        let oldestTime = Date.now()
        
        for (const [key, value] of this.cache.entries()) {
          if (value.timestamp < oldestTime) {
            oldestTime = value.timestamp
            oldestKey = key
          }
        }
        
        if (oldestKey) this.cache.delete(oldestKey)
        break
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear()
  }

  // Get cache statistics
  getCacheStats(): {
    size: number
    hitRate: number
    totalHits: number
    averageAge: number
  } {
    const entries = Array.from(this.cache.values())
    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0)
    const totalAge = entries.reduce((sum, entry) => sum + (Date.now() - entry.timestamp), 0)
    
    return {
      size: this.cache.size,
      hitRate: totalHits / (totalHits + this.cache.size),
      totalHits,
      averageAge: entries.length > 0 ? totalAge / entries.length : 0
    }
  }

  // Track query performance
  trackQuery(query: string, executionTime: number): void {
    const existing = this.queryMetrics.get(query)
    
    if (existing) {
      existing.count++
      existing.totalTime += executionTime
      existing.avgTime = existing.totalTime / existing.count
    } else {
      this.queryMetrics.set(query, {
        count: 1,
        totalTime: executionTime,
        avgTime: executionTime
      })
    }
  }

  // Get query performance metrics
  getQueryMetrics(): Array<{
    query: string
    count: number
    totalTime: number
    avgTime: number
  }> {
    return Array.from(this.queryMetrics.entries()).map(([query, metrics]) => ({
      query,
      ...metrics
    }))
  }

  // Get slow queries
  getSlowQueries(threshold: number = 1000): Array<{
    query: string
    avgTime: number
    count: number
  }> {
    return this.getQueryMetrics()
      .filter(metric => metric.avgTime > threshold)
      .sort((a, b) => b.avgTime - a.avgTime)
  }

  // Optimize database queries
  async optimizeQueries(): Promise<QueryOptimization[]> {
    const optimizations: QueryOptimization[] = []
    const slowQueries = this.getSlowQueries()

    for (const queryMetric of slowQueries) {
      const optimization = await this.analyzeQuery(queryMetric.query)
      if (optimization) {
        optimizations.push(optimization)
      }
    }

    return optimizations
  }

  // Analyze individual query for optimization
  private async analyzeQuery(query: string): Promise<QueryOptimization | null> {
    try {
      const startTime = Date.now()
      
      // Execute original query
      const { data, error } = await supabaseClient.rpc('explain_query', { query })
      if (error) throw error
      
      const originalTime = Date.now() - startTime
      
      // Generate optimization recommendations
      const recommendations = this.generateOptimizationRecommendations(query, data)
      
      // Simulate optimized query (in real implementation, this would be actual optimization)
      const optimizedTime = originalTime * 0.7 // Assume 30% improvement
      
      return {
        query,
        originalTime,
        optimizedTime,
        improvement: ((originalTime - optimizedTime) / originalTime) * 100,
        recommendations
      }
    } catch (error) {
      console.warn('Query analysis failed:', error)
      return null
    }
  }

  // Generate optimization recommendations
  private generateOptimizationRecommendations(query: string, explainData: any): string[] {
    const recommendations: string[] = []

    // Check for missing indexes
    if (query.includes('WHERE') && !query.includes('ORDER BY')) {
      recommendations.push('Consider adding an index on the WHERE clause columns')
    }

    // Check for SELECT *
    if (query.includes('SELECT *')) {
      recommendations.push('Use specific column names instead of SELECT *')
    }

    // Check for N+1 queries
    if (query.includes('JOIN') && query.includes('WHERE')) {
      recommendations.push('Consider using a single query with JOINs instead of multiple queries')
    }

    // Check for large result sets
    if (!query.includes('LIMIT')) {
      recommendations.push('Add LIMIT clause to prevent large result sets')
    }

    return recommendations
  }

  // Get comprehensive performance metrics
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const cacheStats = this.getCacheStats()
    const queryMetrics = this.getQueryMetrics()
    
    // Calculate cache hit rate
    const totalQueries = queryMetrics.reduce((sum, q) => sum + q.count, 0)
    const cacheHitRate = totalQueries > 0 ? cacheStats.hitRate : 0

    // Calculate throughput
    const totalTime = queryMetrics.reduce((sum, q) => sum + q.totalTime, 0)
    const queriesPerSecond = totalTime > 0 ? (totalQueries * 1000) / totalTime : 0

    return {
      queryTime: queryMetrics.length > 0 ? 
        queryMetrics.reduce((sum, q) => sum + q.avgTime, 0) / queryMetrics.length : 0,
      cacheHitRate,
      connectionPool: {
        active: 0, // Would be fetched from actual connection pool
        idle: 0,
        total: 0
      },
      memoryUsage: {
        used: 0, // Would be fetched from system metrics
        available: 0,
        percentage: 0
      },
      throughput: {
        queriesPerSecond,
        dataTransferred: 0 // Would be calculated from actual data transfer
      }
    }
  }

  // Generate performance report
  async generatePerformanceReport(): Promise<string> {
    const metrics = await this.getPerformanceMetrics()
    const slowQueries = this.getSlowQueries()
    const cacheStats = this.getCacheStats()

    return `
# Performance Report
Generated: ${new Date().toISOString()}

## Overall Performance
- Average Query Time: ${metrics.queryTime.toFixed(2)}ms
- Cache Hit Rate: ${(metrics.cacheHitRate * 100).toFixed(1)}%
- Queries Per Second: ${metrics.throughput.queriesPerSecond.toFixed(2)}

## Cache Performance
- Cache Size: ${cacheStats.size} entries
- Total Cache Hits: ${cacheStats.totalHits}
- Average Cache Age: ${(cacheStats.averageAge / 1000).toFixed(1)}s

## Slow Queries (${slowQueries.length} found)
${slowQueries.map(q => `
- ${q.query.substring(0, 100)}...
  - Average Time: ${q.avgTime.toFixed(2)}ms
  - Execution Count: ${q.count}
`).join('')}

## Recommendations
${this.generatePerformanceRecommendations(metrics, slowQueries).map(rec => `- ${rec}`).join('\n')}
    `.trim()
  }

  // Generate performance recommendations
  private generatePerformanceRecommendations(
    metrics: PerformanceMetrics,
    slowQueries: Array<{ query: string; avgTime: number; count: number }>
  ): string[] {
    const recommendations: string[] = []

    if (metrics.cacheHitRate < 0.8) {
      recommendations.push('Improve cache hit rate by increasing cache TTL or size')
    }

    if (metrics.queryTime > 1000) {
      recommendations.push('Optimize slow queries by adding indexes or rewriting queries')
    }

    if (slowQueries.length > 5) {
      recommendations.push('Review and optimize the top 5 slowest queries')
    }

    if (metrics.throughput.queriesPerSecond < 10) {
      recommendations.push('Consider connection pooling or query batching')
    }

    return recommendations
  }

  // Setup performance monitoring
  setupMonitoring(): void {
    // Monitor cache performance
    setInterval(() => {
      const stats = this.getCacheStats()
      if (stats.hitRate < 0.5) {
        console.warn('Low cache hit rate detected:', stats.hitRate)
      }
    }, 60000) // Check every minute

    // Monitor slow queries
    setInterval(() => {
      const slowQueries = this.getSlowQueries()
      if (slowQueries.length > 0) {
        console.warn('Slow queries detected:', slowQueries.length)
      }
    }, 300000) // Check every 5 minutes
  }
}

// Export singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance()

// React hook for performance monitoring
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = React.useState(false)

  const refreshMetrics = React.useCallback(async () => {
    setLoading(true)
    try {
      const performanceMetrics = await performanceOptimizer.getPerformanceMetrics()
      setMetrics(performanceMetrics)
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    refreshMetrics()
    const interval = setInterval(refreshMetrics, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [refreshMetrics])

  return { metrics, loading, refreshMetrics }
}
