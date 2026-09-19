import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ilucgtvbaconbqvclnte.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsdWNndHZiYWNvbmJxdmNsbnRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0OTE0NDUsImV4cCI6MjEwMDA2NzQ0NX0.QsGKBTIs06WEs38XLso1i220D1D_nbGgAW-wqnJcRt8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
