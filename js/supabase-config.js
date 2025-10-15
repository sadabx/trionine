// Supabase configuration
const SUPABASE_URL = 'https://jylyupfpoxakhmztmckx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5bHl1cGZwb3hha2htenRtY2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODM5NjYsImV4cCI6MjA3NjA1OTk2Nn0.j4OWfwJUltZd1H0-RAhSrhzXKwhK2fMkdMex0aaby44';

// Initialize Supabase client
let supabase;

function initializeSupabase() {
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('✅ Supabase client initialized');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error);
        return false;
    }
}

// Get Supabase instance
function getSupabase() {
    return supabase;
}

// Check if Supabase is ready
function isSupabaseReady() {
    return !!supabase;
}
