// Importation du client Supabase
import { createClient } from '@supabase/supabase-js';

// Vos informations de connexion Supabase
const supabaseUrl = 'https://afzaabpfkwaifehhegjs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmemFhYnBma3dhaWZlaGhlZ2pzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MTI4NzYsImV4cCI6MjA2NTI4ODg3Nn0.sjINofPrAT20OHMCemsh0en1AFlOV4Cq272Xd89yQm0';

// Création et exportation du client Supabase pour pouvoir l'utiliser dans toute l'application
export const supabase = createClient(supabaseUrl, supabaseKey);
