// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://gpwblkxtzmzwtjiqeste.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdwd2Jsa3h0em16d3RqaXFlc3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MDMyMzUsImV4cCI6MjA1Nzk3OTIzNX0.r222RwXVZDUVP6AGcIPQnec9L0bxtm63bpqp8C455To";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);