import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST: Set up a new user after they sign up
export async function POST() {
  try {
    const supabase = await createClient();
    
    // Use getUser for better security
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const userId = userData.user.id;
    const userEmail = userData.user.email || '';
    
    // User metadata is already available from getUser call
    const userMetadata = userData.user.user_metadata;
    
    // Check if user already exists in the users table
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (!existingUserError && existingUser) {
      // User already exists, update profile data from auth provider if needed
      const { error: updateError } = await supabase
        .from('users')
        .update({
          display_name: userMetadata?.name || userMetadata?.full_name || '',
          profile_image: userMetadata?.avatar_url || '',
          last_active_at: new Date().toISOString(),
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error('Error updating existing user:', updateError);
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'User profile updated',
        isNewUser: false
      });
    }
    
    // Create new user
    // Make sure email is not undefined
    if (!userEmail) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 });
    }
    
    const { error: createError } = await supabase
      .from('users')
      .insert([{
        id: userId,
        email: userEmail,
        display_name: userMetadata?.name || userMetadata?.full_name || '',
        profile_image: userMetadata?.avatar_url || '',
        created_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
      }]);
    
    if (createError) {
      console.error('Error creating new user:', createError);
      return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'New user created',
      isNewUser: true
    });
    
  } catch (error) {
    console.error('Error in user setup:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 