'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`)
  redirect('/dashboard')
}

export async function register(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) redirect(`/register?error=${encodeURIComponent(error.message)}`)
  if (data.user) {
    const { error: coachError } = await supabase
      .from('coaches')
      .insert({ id: data.user.id, email, full_name: fullName })
    if (coachError) redirect(`/register?error=${encodeURIComponent(coachError.message)}`)
  }
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}