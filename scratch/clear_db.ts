import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearData() {
  console.log("--- CLEARING DATABASE ---");
  
  // Define tables in reverse order of foreign key dependencies to avoid constraint errors
  const tables = [
    'exam_cards',
    'schedules',
    'exam_settings',
    'students',
    'classes',
    'exams',
    'school_profile' // Even though it's 0, clearing it to be safe
  ];

  for (const table of tables) {
    // We use match with inequality or just simple delete all if allowed.
    // Supabase JS allows delete without eq if we use .neq('id', '00000000-0000-0000-0000-000000000000') or similar.
    // Let's first try to get all IDs and delete them to be absolutely safe with RLS and constraints.
    const { data: rows, error: selectError } = await supabase.from(table).select('id');
    
    if (selectError) {
      console.error(`Error selecting ${table}:`, selectError.message);
      continue;
    }

    if (rows && rows.length > 0) {
      const ids = rows.map(r => r.id);
      console.log(`Deleting ${ids.length} rows from ${table}...`);
      
      const { error: deleteError } = await supabase.from(table).delete().in('id', ids);
      if (deleteError) {
        console.error(`Error deleting from ${table}:`, deleteError.message);
      } else {
        console.log(`Successfully cleared ${table}`);
      }
    } else {
      console.log(`${table} is already empty.`);
    }
  }

  console.log("--- FINAL COUNTS ---");
  for (const table of tables) {
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
    console.log(`${table}: ${count} rows`);
  }
}

clearData();
