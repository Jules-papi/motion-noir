import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ilucgtvbaconbqvclnte.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsdWNndHZiYWNvbmJxdmNsbnRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0OTE0NDUsImV4cCI6MjEwMDA2NzQ0NX0.QsGKBTIs06WEs38XLso1i220D1D_nbGgAW-wqnJcRt8";

const clientAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });

let totalPassed = 0;
let totalFailed = 0;

function assert(condition, testName, details) {
  if (condition) {
    console.log(`✅ [PASS] ${testName} -> ${details || 'OK'}`);
    totalPassed++;
  } else {
    console.error(`❌ [FAIL] ${testName} -> ${details || 'Assertion failed'}`);
    totalFailed++;
  }
}

async function runEventsVerification() {
  console.log('================================================================');
  console.log('STARTING MAJOR CLUB EVENTS + CALENDAR AUTOMATED VERIFICATION');
  console.log('================================================================\n');

  // TEST 1: Categories
  const { data: cats, error: catErr } = await clientAnon
    .from('noir_event_categories')
    .select('*')
    .order('sort_order', { ascending: true });

  assert(!catErr && cats && cats.length >= 10, '1. Event Categories', `Loaded ${cats?.length || 0} categories from Supabase`);
  const slugs = cats?.map(c => c.slug) || [];
  assert(slugs.includes('swinger') && slugs.includes('trio') && slugs.includes('sexparty'), '1.1 Category Slugs', `Verified slugs: ${slugs.slice(0, 5).join(', ')}`);

  // TEST 2: Live Events Query
  const { data: events, error: evtErr } = await clientAnon
    .from('noir_events')
    .select(`
      *,
      organizer:noir_profiles!noir_events_organizer_id_fkey(*),
      category:noir_event_categories(*)
    `)
    .eq('status', 'published')
    .order('start_at', { ascending: true });

  assert(!evtErr && events && events.length >= 5, '2. Published Events Query', `Fetched ${events?.length || 0} published events`);

  const event1 = events?.[0];
  assert(!!event1?.title && !!event1?.city && !!event1?.venue, '2.1 Event Model Integrity', `Event: "${event1?.title}" in ${event1?.city}`);
  assert(!!event1?.organizer?.name, '2.2 Organizer Join', `Organizer: "${event1?.organizer?.name}" (@${event1?.organizer?.username})`);
  assert(!!event1?.category?.name, '2.3 Category Join', `Category: "${event1?.category?.name}" (${event1?.category?.slug})`);

  // TEST 3: Trigger Count Synchronization
  const villaEvent = events?.find(e => e.id === 'e1111111-1111-1111-1111-111111111111');
  assert(villaEvent && villaEvent.attendees_count === 2, '3. Trigger attendees_count sync', `Expected 2 approved attendees, got ${villaEvent?.attendees_count}`);

  // TEST 4: Live Event Comments
  const { data: comments, error: comErr } = await clientAnon
    .from('noir_event_comments')
    .select(`
      *,
      user:noir_profiles!noir_event_comments_user_id_fkey(*)
    `)
    .eq('event_id', 'e1111111-1111-1111-1111-111111111111');

  assert(!comErr && comments && comments.length >= 2, '4. Event Comments Query', `Fetched ${comments?.length || 0} live comments with author profiles`);

  // TEST 5: Calendar Date Range Query (October 2026)
  const { data: octEvents, error: octErr } = await clientAnon
    .from('noir_events')
    .select('id, title, start_at')
    .gte('start_at', '2026-10-01T00:00:00Z')
    .lte('start_at', '2026-10-31T23:59:59Z')
    .order('start_at', { ascending: true });

  assert(!octErr && octEvents && octEvents.length >= 2, '5. Calendar Month Filtering (Oct 2026)', `Found ${octEvents?.length} events in October 2026 window`);

  // TEST 6: RLS Security Policies
  // 6.1: Anon cannot insert an event
  const { error: anonInsertErr } = await clientAnon
    .from('noir_events')
    .insert({
      title: 'Hacked Event',
      start_at: new Date().toISOString(),
      organizer_id: '55555555-5555-5555-5555-555555555555'
    });
  assert(!!anonInsertErr, '6.1 RLS: Anon event creation rejected', `Blocked: ${anonInsertErr?.message || 'Access denied'}`);

  // 6.2: Anon cannot insert registration
  const { error: anonRegErr } = await clientAnon
    .from('noir_event_attendees')
    .insert({
      event_id: 'e1111111-1111-1111-1111-111111111111',
      user_id: '55555555-5555-5555-5555-555555555555',
      status: 'approved'
    });
  assert(!!anonRegErr, '6.2 RLS: Anon attendee insert rejected', `Blocked: ${anonRegErr?.message || 'Access denied'}`);

  // 6.3: Anon cannot insert saves
  const { error: anonSaveErr } = await clientAnon
    .from('noir_event_saves')
    .insert({
      event_id: 'e1111111-1111-1111-1111-111111111111',
      user_id: '55555555-5555-5555-5555-555555555555'
    });
  assert(!!anonSaveErr, '6.3 RLS: Anon save insert rejected', `Blocked: ${anonSaveErr?.message || 'Access denied'}`);

  // 6.4: Anon cannot read saves
  const { data: anonSaves, error: anonReadSaveErr } = await clientAnon
    .from('noir_event_saves')
    .select('*');
  assert(!anonReadSaveErr && anonSaves?.length === 0, '6.4 RLS: Anon cannot read private saves', `Returned 0 rows (fully protected)`);

  console.log('\n================================================================');
  console.log(`VERIFICATION COMPLETE: ${totalPassed} PASSED, ${totalFailed} FAILED`);
  console.log('================================================================');

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runEventsVerification().catch(err => {
  console.error('Test suite exception:', err);
  process.exit(1);
});
