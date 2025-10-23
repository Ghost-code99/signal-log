'use server'

import { supabaseServer } from '../supabase-server'
import { createServerClient } from '../supabase-server'

// ========================================
// USER MANAGEMENT SERVER ACTIONS
// ========================================

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  created_at: string
  updated_at: string
}

export interface CreateUserProfileData {
  id: string
  email: string
  full_name: string
}

/**
 * Create a user profile after successful authentication
 */
export async function createUserProfile(data: CreateUserProfileData) {
  try {
    const supabase = createServerClient()
    
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        id: data.id,
        email: data.email,
        full_name: data.full_name
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user profile:', error)
      throw new Error(`Failed to create user profile: ${error.message}`)
    }

    return { success: true, data: user }
  } catch (error) {
    console.error('createUserProfile error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string) {
  try {
    const supabase = createServerClient()
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'User not found' }
      }
      throw new Error(`Failed to get user profile: ${error.message}`)
    }

    return { success: true, data: user }
  } catch (error) {
    console.error('getUserProfile error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, updates: Partial<Pick<UserProfile, 'full_name'>>) {
  try {
    const supabase = createServerClient()
    
    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update user profile: ${error.message}`)
    }

    return { success: true, data: user }
  } catch (error) {
    console.error('updateUserProfile error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Delete user profile and all associated data
 */
export async function deleteUserProfile(userId: string) {
  try {
    const supabase = createServerClient()
    
    // Delete user (CASCADE will handle related data)
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) {
      throw new Error(`Failed to delete user profile: ${error.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error('deleteUserProfile error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
