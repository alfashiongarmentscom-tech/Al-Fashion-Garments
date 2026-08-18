import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
  try {
    // A tiny query that hits the database to register activity.
    // We limit it to 1 row so it uses virtually zero bandwidth or compute.
    const { data, error } = await supabase.from('categories').select('id').limit(1);

    if (error) throw error;

    return NextResponse.json({ 
      status: 'active', 
      message: 'Supabase database is awake and active', 
      timestamp: new Date().toISOString() 
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message }, 
      { status: 500 }
    );
  }
}