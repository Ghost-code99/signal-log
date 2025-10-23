// Real-time Subscriptions and Live Updates
// Provides real-time data synchronization across the application

import React from 'react'
import { supabaseClient } from './supabase-client'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface SubscriptionConfig {
  table: string
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  callback: (payload: any) => void
  filter?: string
}

export interface LiveUpdate {
  id: string
  table: string
  event: string
  timestamp: Date
  data: any
  userId?: string
}

export class RealTimeManager {
  private static instance: RealTimeManager
  private channels: Map<string, RealtimeChannel> = new Map()
  private subscriptions: Map<string, SubscriptionConfig> = new Map()
  private updateQueue: LiveUpdate[] = []
  private isConnected = false

  static getInstance(): RealTimeManager {
    if (!RealTimeManager.instance) {
      RealTimeManager.instance = new RealTimeManager()
    }
    return RealTimeManager.instance
  }

  // Initialize real-time connections
  async initialize(): Promise<void> {
    try {
      // Test connection
      const { data, error } = await supabaseClient
        .from('projects')
        .select('id')
        .limit(1)

      if (error) throw error

      this.isConnected = true
      console.log('✅ Real-time connection established')
    } catch (error) {
      console.error('❌ Real-time connection failed:', error)
      this.isConnected = false
    }
  }

  // Subscribe to table changes
  subscribe(config: SubscriptionConfig): string {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    try {
      const channelName = `${config.table}_${config.event.toLowerCase()}`
      let channel = this.channels.get(channelName)

      if (!channel) {
        channel = supabaseClient
          .channel(channelName)
          .on('postgres_changes' as any, {
            event: config.event,
            schema: 'public',
            table: config.table,
            filter: config.filter
          }, (payload) => {
            const update: LiveUpdate = {
              id: `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              table: config.table,
              event: config.event,
              timestamp: new Date(),
              data: payload,
              userId: (payload as any).new?.user_id || (payload as any).old?.user_id
            }

            this.updateQueue.push(update)
            config.callback(payload)
          })

        channel.subscribe()
        this.channels.set(channelName, channel)
      }

      this.subscriptions.set(subscriptionId, config)
      console.log(`📡 Subscribed to ${config.table} ${config.event} events`)
      
      return subscriptionId
    } catch (error) {
      console.error('Subscription failed:', error)
      throw error
    }
  }

  // Unsubscribe from changes
  unsubscribe(subscriptionId: string): boolean {
    const config = this.subscriptions.get(subscriptionId)
    if (!config) return false

    const channelName = `${config.table}_${config.event.toLowerCase()}`
    const channel = this.channels.get(channelName)

    if (channel) {
      channel.unsubscribe()
      this.channels.delete(channelName)
    }

    this.subscriptions.delete(subscriptionId)
    console.log(`📡 Unsubscribed from ${config.table} ${config.event} events`)
    
    return true
  }

  // Subscribe to project changes
  subscribeToProjects(callback: (payload: any) => void): string {
    return this.subscribe({
      table: 'projects',
      event: '*',
      callback,
      filter: 'user_id=eq.' + (typeof window !== 'undefined' ? 'current_user_id' : '')
    })
  }

  // Subscribe to idea changes
  subscribeToIdeas(callback: (payload: any) => void): string {
    return this.subscribe({
      table: 'ideas',
      event: '*',
      callback,
      filter: 'user_id=eq.' + (typeof window !== 'undefined' ? 'current_user_id' : '')
    })
  }

  // Subscribe to AI interactions
  subscribeToAIInteractions(callback: (payload: any) => void): string {
    return this.subscribe({
      table: 'ai_interactions',
      event: '*',
      callback
    })
  }

  // Subscribe to health metrics
  subscribeToHealthMetrics(callback: (payload: any) => void): string {
    return this.subscribe({
      table: 'project_health_metrics',
      event: '*',
      callback
    })
  }

  // Get pending updates
  getPendingUpdates(): LiveUpdate[] {
    return [...this.updateQueue]
  }

  // Clear update queue
  clearUpdateQueue(): void {
    this.updateQueue = []
  }

  // Get connection status
  getConnectionStatus(): {
    connected: boolean
    activeChannels: number
    activeSubscriptions: number
  } {
    return {
      connected: this.isConnected,
      activeChannels: this.channels.size,
      activeSubscriptions: this.subscriptions.size
    }
  }

  // Disconnect all subscriptions
  disconnect(): void {
    this.channels.forEach(channel => {
      channel.unsubscribe()
    })
    
    this.channels.clear()
    this.subscriptions.clear()
    this.updateQueue = []
    this.isConnected = false
    
    console.log('📡 All real-time subscriptions disconnected')
  }

  // Reconnect with exponential backoff
  async reconnect(maxRetries: number = 5): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.initialize()
        
        if (this.isConnected) {
          // Re-establish subscriptions
          const subscriptions = Array.from(this.subscriptions.entries())
          this.subscriptions.clear()
          
          for (const [id, config] of subscriptions) {
            this.subscribe(config)
          }
          
          console.log('🔄 Real-time connection restored')
          return true
        }
      } catch (error) {
        console.warn(`Reconnection attempt ${attempt} failed:`, error)
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000 // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    
    console.error('❌ Failed to reconnect after maximum retries')
    return false
  }

  // Get subscription statistics
  getStatistics(): {
    totalUpdates: number
    updatesByTable: Record<string, number>
    updatesByEvent: Record<string, number>
    averageUpdateRate: number
  } {
    const updatesByTable: Record<string, number> = {}
    const updatesByEvent: Record<string, number> = {}
    
    this.updateQueue.forEach(update => {
      updatesByTable[update.table] = (updatesByTable[update.table] || 0) + 1
      updatesByEvent[update.event] = (updatesByEvent[update.event] || 0) + 1
    })

    const totalUpdates = this.updateQueue.length
    const timeSpan = this.updateQueue.length > 0 ? 
      (Date.now() - this.updateQueue[0].timestamp.getTime()) / 1000 : 0
    const averageUpdateRate = timeSpan > 0 ? totalUpdates / timeSpan : 0

    return {
      totalUpdates,
      updatesByTable,
      updatesByEvent,
      averageUpdateRate
    }
  }
}

// Export singleton instance
export const realTimeManager = RealTimeManager.getInstance()

// React hook for real-time subscriptions
export function useRealTimeSubscription(
  table: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
  callback: (payload: any) => void,
  dependencies: any[] = []
) {
  const manager = RealTimeManager.getInstance()
  
  React.useEffect(() => {
    const subscriptionId = manager.subscribe({
      table,
      event,
      callback
    })

    return () => {
      manager.unsubscribe(subscriptionId)
    }
  }, dependencies)
}

// React hook for project updates
export function useProjectUpdates(callback: (payload: any) => void) {
  return useRealTimeSubscription('projects', '*', callback)
}

// React hook for idea updates
export function useIdeaUpdates(callback: (payload: any) => void) {
  return useRealTimeSubscription('ideas', '*', callback)
}
