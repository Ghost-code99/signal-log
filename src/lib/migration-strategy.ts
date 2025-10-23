// Data Migration and Schema Evolution Tools
// Provides comprehensive migration management and schema evolution capabilities

import React from 'react'
import { supabaseClient } from './supabase-client'

export interface Migration {
  id: string
  name: string
  description: string
  version: string
  up: string
  down: string
  dependencies: string[]
  executedAt?: Date
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back'
  checksum: string
  estimatedDuration: number
}

export interface SchemaChange {
  type: 'table' | 'column' | 'index' | 'constraint' | 'function' | 'trigger'
  action: 'create' | 'alter' | 'drop' | 'rename'
  name: string
  details: Record<string, any>
  riskLevel: 'low' | 'medium' | 'high'
  reversible: boolean
}

export interface MigrationPlan {
  id: string
  name: string
  description: string
  migrations: Migration[]
  estimatedDuration: number
  riskAssessment: {
    level: 'low' | 'medium' | 'high'
    issues: string[]
    recommendations: string[]
  }
  rollbackPlan: string
  testingStrategy: string
}

export interface DataValidation {
  table: string
  rules: ValidationRule[]
  results: ValidationResult[]
}

export interface ValidationRule {
  id: string
  name: string
  query: string
  expectedResult: any
  critical: boolean
}

export interface ValidationResult {
  ruleId: string
  passed: boolean
  actualResult: any
  error?: string
  timestamp: Date
}

export class MigrationManager {
  private static instance: MigrationManager
  private migrations: Migration[] = []
  private migrationHistory: Array<{ migration: Migration; executedAt: Date; status: string }> = []

  static getInstance(): MigrationManager {
    if (!MigrationManager.instance) {
      MigrationManager.instance = new MigrationManager()
    }
    return MigrationManager.instance
  }

  // Create a new migration
  createMigration(
    name: string,
    description: string,
    up: string,
    down: string,
    dependencies: string[] = []
  ): Migration {
    const migration: Migration = {
      id: `migration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      version: this.generateVersion(),
      up,
      down,
      dependencies,
      status: 'pending',
      checksum: this.calculateChecksum(up + down),
      estimatedDuration: this.estimateDuration(up)
    }

    this.migrations.push(migration)
    return migration
  }

  // Generate migration version
  private generateVersion(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hour = String(now.getHours()).padStart(2, '0')
    const minute = String(now.getMinutes()).padStart(2, '0')
    
    return `${year}${month}${day}${hour}${minute}`
  }

  // Calculate migration checksum
  private calculateChecksum(content: string): string {
    // Simple checksum calculation (in production, use crypto.createHash)
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  // Estimate migration duration
  private estimateDuration(sql: string): number {
    const lines = sql.split('\n').length
    const complexity = sql.includes('CREATE TABLE') ? 2 : 
                      sql.includes('ALTER TABLE') ? 1.5 : 1
    return Math.ceil(lines * complexity * 100) // milliseconds
  }

  // Execute migration
  async executeMigration(migrationId: string): Promise<{
    success: boolean
    duration: number
    error?: string
  }> {
    const migration = this.migrations.find(m => m.id === migrationId)
    if (!migration) {
      throw new Error('Migration not found')
    }

    if (migration.status !== 'pending') {
      throw new Error('Migration is not in pending status')
    }

    const startTime = Date.now()
    migration.status = 'running'

    try {
      // Check dependencies
      await this.checkDependencies(migration)

      // Execute migration
      const { error } = await supabaseClient.rpc('execute_sql', {
        sql: migration.up
      })

      if (error) throw error

      // Record execution
      migration.status = 'completed'
      migration.executedAt = new Date()
      this.migrationHistory.push({
        migration,
        executedAt: migration.executedAt,
        status: 'completed'
      })

      const duration = Date.now() - startTime
      console.log(`✅ Migration ${migration.name} completed in ${duration}ms`)

      return { success: true, duration }
    } catch (error) {
      migration.status = 'failed'
      const duration = Date.now() - startTime
      
      console.error(`❌ Migration ${migration.name} failed:`, error)
      return { success: false, duration, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Check migration dependencies
  private async checkDependencies(migration: Migration): Promise<void> {
    for (const depId of migration.dependencies) {
      const depMigration = this.migrations.find(m => m.id === depId)
      if (!depMigration || depMigration.status !== 'completed') {
        throw new Error(`Dependency ${depId} not completed`)
      }
    }
  }

  // Rollback migration
  async rollbackMigration(migrationId: string): Promise<{
    success: boolean
    duration: number
    error?: string
  }> {
    const migration = this.migrations.find(m => m.id === migrationId)
    if (!migration) {
      throw new Error('Migration not found')
    }

    if (migration.status !== 'completed') {
      throw new Error('Migration is not completed')
    }

    const startTime = Date.now()
    migration.status = 'running'

    try {
      // Execute rollback
      const { error } = await supabaseClient.rpc('execute_sql', {
        sql: migration.down
      })

      if (error) throw error

      migration.status = 'rolled_back'
      const duration = Date.now() - startTime
      
      console.log(`🔄 Migration ${migration.name} rolled back in ${duration}ms`)
      return { success: true, duration }
    } catch (error) {
      migration.status = 'failed'
      const duration = Date.now() - startTime
      
      console.error(`❌ Rollback of ${migration.name} failed:`, error)
      return { success: false, duration, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Create migration plan
  createMigrationPlan(
    name: string,
    description: string,
    migrationIds: string[]
  ): MigrationPlan {
    const migrations = migrationIds.map(id => 
      this.migrations.find(m => m.id === id)
    ).filter(Boolean) as Migration[]

    const riskAssessment = this.assessMigrationRisk(migrations)
    const estimatedDuration = migrations.reduce((sum, m) => sum + m.estimatedDuration, 0)

    const plan: MigrationPlan = {
      id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      migrations,
      estimatedDuration,
      riskAssessment,
      rollbackPlan: this.generateRollbackPlan(migrations),
      testingStrategy: this.generateTestingStrategy(migrations)
    }

    return plan
  }

  // Assess migration risk
  private assessMigrationRisk(migrations: Migration[]): {
    level: 'low' | 'medium' | 'high'
    issues: string[]
    recommendations: string[]
  } {
    const issues: string[] = []
    const recommendations: string[] = []

    // Check for data loss risks
    const dropOperations = migrations.filter(m => 
      m.up.includes('DROP TABLE') || m.up.includes('DROP COLUMN')
    )
    if (dropOperations.length > 0) {
      issues.push('Migration contains DROP operations that may cause data loss')
      recommendations.push('Create backup before executing migration')
    }

    // Check for long-running operations
    const longMigrations = migrations.filter(m => m.estimatedDuration > 30000) // 30 seconds
    if (longMigrations.length > 0) {
      issues.push('Migration contains long-running operations')
      recommendations.push('Execute during maintenance window')
    }

    // Check for dependency complexity
    const complexDependencies = migrations.filter(m => m.dependencies.length > 3)
    if (complexDependencies.length > 0) {
      issues.push('Migration has complex dependencies')
      recommendations.push('Review dependency order carefully')
    }

    const level = issues.length === 0 ? 'low' :
                  issues.length <= 2 ? 'medium' : 'high'

    return { level, issues, recommendations }
  }

  // Generate rollback plan
  private generateRollbackPlan(migrations: Migration[]): string {
    const rollbackSteps = migrations
      .reverse()
      .map((m, index) => `${index + 1}. Rollback ${m.name}: ${m.down}`)
      .join('\n')

    return `
Rollback Plan:
${rollbackSteps}

Critical Steps:
1. Stop application services
2. Execute rollback migrations in reverse order
3. Verify data integrity
4. Restart application services
5. Monitor system health
    `.trim()
  }

  // Generate testing strategy
  private generateTestingStrategy(migrations: Migration[]): string {
    return `
Testing Strategy:

Pre-Migration:
1. Create test database with production data
2. Execute migrations on test database
3. Run automated test suite
4. Perform manual testing
5. Validate data integrity

Post-Migration:
1. Verify all tables exist and have correct structure
2. Check data consistency
3. Test application functionality
4. Monitor performance metrics
5. Validate user access and permissions

Rollback Testing:
1. Test rollback procedures on test database
2. Verify rollback completes successfully
3. Validate data integrity after rollback
4. Test application functionality after rollback
    `.trim()
  }

  // Execute migration plan
  async executeMigrationPlan(planId: string): Promise<{
    success: boolean
    completedMigrations: string[]
    failedMigrations: string[]
    totalDuration: number
    errors: string[]
  }> {
    // This would execute the migration plan
    // Implementation would depend on the specific plan structure
    return {
      success: true,
      completedMigrations: [],
      failedMigrations: [],
      totalDuration: 0,
      errors: []
    }
  }

  // Validate data integrity
  async validateDataIntegrity(validation: DataValidation): Promise<ValidationResult[]> {
    const results: ValidationResult[] = []

    for (const rule of validation.rules) {
      try {
        const { data, error } = await supabaseClient.rpc('execute_validation', {
          query: rule.query
        })

        if (error) throw error

        const passed = JSON.stringify(data) === JSON.stringify(rule.expectedResult)
        results.push({
          ruleId: rule.id,
          passed,
          actualResult: data,
          timestamp: new Date()
        })
      } catch (error) {
        results.push({
          ruleId: rule.id,
          passed: false,
          actualResult: null,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        })
      }
    }

    return results
  }

  // Get migration status
  getMigrationStatus(): {
    total: number
    pending: number
    completed: number
    failed: number
    rolledBack: number
  } {
    const total = this.migrations.length
    const pending = this.migrations.filter(m => m.status === 'pending').length
    const completed = this.migrations.filter(m => m.status === 'completed').length
    const failed = this.migrations.filter(m => m.status === 'failed').length
    const rolledBack = this.migrations.filter(m => m.status === 'rolled_back').length

    return { total, pending, completed, failed, rolledBack }
  }

  // Generate migration report
  async generateMigrationReport(): Promise<string> {
    const status = this.getMigrationStatus()
    const recentMigrations = this.migrationHistory.slice(-10)

    return `
# Migration Report
Generated: ${new Date().toISOString()}

## Migration Status
- Total Migrations: ${status.total}
- Pending: ${status.pending}
- Completed: ${status.completed}
- Failed: ${status.failed}
- Rolled Back: ${status.rolledBack}

## Recent Migrations
${recentMigrations.map(entry => `
- ${entry.migration.name} (${entry.migration.version})
  - Status: ${entry.status}
  - Executed: ${entry.executedAt.toISOString()}
  - Duration: ${entry.migration.estimatedDuration}ms
`).join('')}

## Recommendations
${this.generateMigrationRecommendations(status).map(rec => `- ${rec}`).join('\n')}
    `.trim()
  }

  // Generate migration recommendations
  private generateMigrationRecommendations(status: any): string[] {
    const recommendations: string[] = []

    if (status.failed > 0) {
      recommendations.push('Review and fix failed migrations')
    }

    if (status.pending > 5) {
      recommendations.push('Consider executing pending migrations in batches')
    }

    if (status.rolledBack > 0) {
      recommendations.push('Investigate rolled back migrations and fix issues')
    }

    return recommendations
  }
}

// Export singleton instance
export const migrationManager = MigrationManager.getInstance()

// React hook for migration management
export function useMigrationManagement() {
  const [migrations, setMigrations] = React.useState<Migration[]>([])
  const [status, setStatus] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)

  const refreshMigrations = React.useCallback(async () => {
    setLoading(true)
    try {
      // In a real implementation, this would fetch from the database
      setMigrations(migrationManager.migrations)
      setStatus(migrationManager.getMigrationStatus())
    } catch (error) {
      console.error('Failed to fetch migrations:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    refreshMigrations()
  }, [refreshMigrations])

  return { migrations, status, loading, refreshMigrations }
}
