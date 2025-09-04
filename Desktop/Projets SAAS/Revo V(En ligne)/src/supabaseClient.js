// Importation du client Supabase
import { createClient } from '@supabase/supabase-js';

// Vos informations de connexion Supabase depuis les variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vérification que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Les variables d\'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY doivent être définies');
}

// Création et exportation du client Supabase pour pouvoir l'utiliser dans toute l'application
export const supabase = createClient(supabaseUrl, supabaseKey);
