import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = "https://hhkclunpavbswlethwry.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhoa2NsdW5wYXZic3dsZXRod3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1OTAxODQsImV4cCI6MjA1NTE2NjE4NH0.jFd_M1ZCWBPVXf2QqmDOO0NI2ztvybjxzoU_OafQeNg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("🔥 Supabase inicializado correctamente");
