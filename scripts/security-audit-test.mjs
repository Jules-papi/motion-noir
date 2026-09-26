import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = "https://ilucgtvbaconbqvclnte.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsdWNndHZiYWNvbmJxdmNsbnRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0OTE0NDUsImV4cCI6MjEwMDA2NzQ0NX0.QsGKBTIs06WEs38XLso1i220D1D_nbGgAW-wqnJcRt8";

const clientA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
const clientB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
const clientAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });

let testResults = [];

function recordTest(category, description, passed, detail) {
  testResults.push({ category, description, passed, detail });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`[${icon}] [${category}] ${description} -> ${detail}`);
}

async function runAudit() {
  console.log('================================================================');
  console.log('STARTING MOTION NOIR AUTOMATED SECURITY & AUTHORIZATION AUDIT');
  console.log('================================================================\n');

  // --- STEP 1: AUTHENTICATION ---
  const { data: authA, error: errAuthA } = await clientA.auth.signInWithPassword({
    email: 'info@mavikanal.com',
    password: 'MotionNoir123!'
  });
  if (errAuthA || !authA.user) {
    throw new Error(`Failed to log in as User A: ${errAuthA?.message}`);
  }
  const userA = authA.user;

  const { data: authB, error: errAuthB } = await clientB.auth.signInWithPassword({
    email: 'uuu@test.de',
    password: 'MotionNoir123!'
  });
  if (errAuthB || !authB.user) {
    throw new Error(`Failed to log in as User B: ${errAuthB?.message}`);
  }
  const userB = authB.user;

  recordTest('AUTH', 'User A authentication', !!userA.id, `User A ID: ${userA.id}`);
  recordTest('AUTH', 'User B authentication', !!userB.id, `User B ID: ${userB.id}`);

  // --- STEP 2: PROFILES & PROFILE ISOLATION ---
  // Ensure profile for A exists
  const { error: pAErr } = await clientA
    .from('noir_profiles')
    .upsert({
      id: userA.id,
      name: 'Agent Alpha',
      username: 'agent_alpha',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      bio: 'Auditor A',
      location: 'Berlin',
      is_private: false,
    });
  recordTest('PROFILE', 'User A upserts own profile', !pAErr, pAErr ? pAErr.message : 'Upsert OK');

  // Ensure profile for B exists
  const { error: pBErr } = await clientB
    .from('noir_profiles')
    .upsert({
      id: userB.id,
      name: 'Agent Beta',
      username: 'agent_beta',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      bio: 'Auditor B',
      location: 'Paris',
      is_private: true,
    });
  recordTest('PROFILE', 'User B upserts own profile', !pBErr, pBErr ? pBErr.message : 'Upsert OK');

  // Negative test: User A attempts to update User B's profile
  const { data: spoofProfUpdate, error: spoofProfErr } = await clientA
    .from('noir_profiles')
    .update({ name: 'Hacked by A' })
    .eq('id', userB.id)
    .select();
  const profileSpoofBlocked = (!spoofProfUpdate || spoofProfUpdate.length === 0) || !!spoofProfErr;
  recordTest('PROFILE_RLS', 'NEGATIVE: User A cannot update User B profile', profileSpoofBlocked, 
    spoofProfErr ? `Blocked with error: ${spoofProfErr.message}` : `0 rows affected (RLS filter)`);

  // Negative test: Anon attempts to update User A's profile
  const { data: anonProfUpdate, error: anonProfErr } = await clientAnon
    .from('noir_profiles')
    .update({ name: 'Hacked by Anon' })
    .eq('id', userA.id)
    .select();
  const anonProfBlocked = (!anonProfUpdate || anonProfUpdate.length === 0) || !!anonProfErr;
  recordTest('PROFILE_RLS', 'NEGATIVE: Anon cannot update User A profile', anonProfBlocked,
    anonProfErr ? `Blocked with error: ${anonProfErr.message}` : `0 rows affected (RLS filter)`);

  // --- STEP 2B: USERNAME UNIQUE CONSTRAINTS (DB LEVEL) ---
  // Negative test: User B attempts to change username to User A's username (agent_alpha)
  const { error: dupUsernameErr } = await clientB
    .from('noir_profiles')
    .update({ username: 'agent_alpha' })
    .eq('id', userB.id);
  const dupBlocked = !!dupUsernameErr && (dupUsernameErr.code === '23505' || dupUsernameErr.message.includes('unique'));
  recordTest('PROFILE_DB', 'NEGATIVE: Duplicate username rejected by DB unique constraint', dupBlocked,
    dupUsernameErr ? `Constraint caught: ${dupUsernameErr.message}` : 'SECURITY FAIL: Duplicate username allowed!');

  // Negative test: Case-insensitive duplicate (AGENT_ALPHA)
  const { error: dupCaseErr } = await clientB
    .from('noir_profiles')
    .update({ username: 'AGENT_ALPHA' })
    .eq('id', userB.id);
  const dupCaseBlocked = !!dupCaseErr && (dupCaseErr.code === '23505' || dupCaseErr.message.includes('unique'));
  recordTest('PROFILE_DB', 'NEGATIVE: Case-insensitive duplicate username rejected', dupCaseBlocked,
    dupCaseErr ? `Constraint caught: ${dupCaseErr.message}` : 'SECURITY FAIL: Case-insensitive duplicate allowed!');

  // --- STEP 3: POST CREATION & SPOOFING & BASE64 CONSTRAINT ---
  // Positive: User A creates a legitimate post
  const testPostId = crypto.randomUUID();
  const { data: postA, error: postAErr } = await clientA
    .from('noir_posts')
    .insert({
      id: testPostId,
      author_id: userA.id,
      content: 'Audit verified post by User A',
      media_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
      likes_count: 0,
      comments_count: 0,
      is_sensitive: false,
    })
    .select()
    .single();
  recordTest('POSTS', 'User A creates post with author_id = userA.id', !postAErr && !!postA,
    postAErr ? postAErr.message : `Post ID: ${postA?.id}`);

  // Negative: User A attempts to spoof post creation with author_id = userB.id
  const spoofPostId = crypto.randomUUID();
  const { error: spoofPostErr } = await clientA
    .from('noir_posts')
    .insert({
      id: spoofPostId,
      author_id: userB.id,
      content: 'Malicious post pretending to be User B',
    });
  recordTest('POSTS_RLS', 'NEGATIVE: User A cannot insert post with author_id = userB.id', !!spoofPostErr,
    spoofPostErr ? `Blocked: ${spoofPostErr.message}` : 'SECURITY BREACH: Insert succeeded!');

  // Negative: Anon attempts to insert a post
  const { error: anonPostErr } = await clientAnon
    .from('noir_posts')
    .insert({
      author_id: userA.id,
      content: 'Anon spam post',
    });
  recordTest('POSTS_RLS', 'NEGATIVE: Anon cannot insert post', !!anonPostErr,
    anonPostErr ? `Blocked: ${anonPostErr.message}` : 'SECURITY BREACH: Anon post succeeded!');

  // Negative: Base64 check constraint
  const { error: b64Err } = await clientA
    .from('noir_posts')
    .insert({
      author_id: userA.id,
      content: 'Base64 injection attempt',
      media_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    });
  recordTest('BASE64_CONSTRAINT', 'NEGATIVE: DB blocks data: URI in media_url', !!b64Err && b64Err.message.includes('check_no_base64_media'),
    b64Err ? `Blocked by constraint: ${b64Err.message}` : 'FAIL: Base64 allowed in database!');

  // --- STEP 4: LIKES & ATOMIC COUNTER TRIGGER ---
  // User B likes User A's post
  const { error: likeErr } = await clientB
    .from('noir_post_likes')
    .insert({
      post_id: testPostId,
      user_id: userB.id,
    });
  recordTest('LIKES', 'User B likes User A post', !likeErr, likeErr ? likeErr.message : 'Like inserted');

  // Verify atomic trigger synced likes_count to 1
  const { data: postAfterLike } = await clientA
    .from('noir_posts')
    .select('likes_count')
    .eq('id', testPostId)
    .single();
  recordTest('LIKES_TRIGGER', 'Atomic trigger synced likes_count to 1', postAfterLike?.likes_count === 1,
    `likes_count in noir_posts: ${postAfterLike?.likes_count}`);

  // Negative: User A attempts to like on behalf of User B
  const { error: spoofLikeErr } = await clientA
    .from('noir_post_likes')
    .insert({
      post_id: testPostId,
      user_id: userB.id,
    });
  recordTest('LIKES_RLS', 'NEGATIVE: User A cannot insert like as User B', !!spoofLikeErr,
    spoofLikeErr ? `Blocked: ${spoofLikeErr.message}` : 'SECURITY BREACH: Spoofed like succeeded!');

  // User B unlikes post
  const { error: unlikeErr } = await clientB
    .from('noir_post_likes')
    .delete()
    .eq('post_id', testPostId)
    .eq('user_id', userB.id);
  recordTest('LIKES', 'User B unlikes post', !unlikeErr, unlikeErr ? unlikeErr.message : 'Unlike deleted');

  // Verify atomic trigger synced likes_count back to 0
  const { data: postAfterUnlike } = await clientA
    .from('noir_posts')
    .select('likes_count')
    .eq('id', testPostId)
    .single();
  recordTest('LIKES_TRIGGER', 'Atomic trigger synced likes_count back to 0', postAfterUnlike?.likes_count === 0,
    `likes_count in noir_posts: ${postAfterUnlike?.likes_count}`);

  // --- STEP 5: COMMENTS & ATOMIC COUNTER TRIGGER ---
  const testCommentId = crypto.randomUUID();
  const { data: commentB, error: commentBErr } = await clientB
    .from('noir_post_comments')
    .insert({
      id: testCommentId,
      post_id: testPostId,
      user_id: userB.id,
      content: 'Audit comment from User B',
    })
    .select()
    .single();
  recordTest('COMMENTS', 'User B comments on User A post', !commentBErr && !!commentB,
    commentBErr ? commentBErr.message : `Comment ID: ${commentB?.id}`);

  // Verify atomic trigger synced comments_count to 1
  const { data: postAfterComment } = await clientA
    .from('noir_posts')
    .select('comments_count')
    .eq('id', testPostId)
    .single();
  recordTest('COMMENTS_TRIGGER', 'Atomic trigger synced comments_count to 1', postAfterComment?.comments_count === 1,
    `comments_count in noir_posts: ${postAfterComment?.comments_count}`);

  // Negative: User A attempts to delete User B's comment
  const { data: delSpoofComm, error: delSpoofCommErr } = await clientA
    .from('noir_post_comments')
    .delete()
    .eq('id', testCommentId)
    .select();
  const commDelBlocked = (!delSpoofComm || delSpoofComm.length === 0) || !!delSpoofCommErr;
  recordTest('COMMENTS_RLS', 'NEGATIVE: User A cannot delete User B comment', commDelBlocked,
    delSpoofCommErr ? `Blocked with error: ${delSpoofCommErr.message}` : '0 rows deleted (RLS filter)');

  // User B deletes own comment
  const { error: delOwnCommErr } = await clientB
    .from('noir_post_comments')
    .delete()
    .eq('id', testCommentId);
  recordTest('COMMENTS', 'User B deletes own comment', !delOwnCommErr, delOwnCommErr ? delOwnCommErr.message : 'Deleted OK');

  // Verify atomic trigger synced comments_count back to 0
  const { data: postAfterDelComment } = await clientA
    .from('noir_posts')
    .select('comments_count')
    .eq('id', testPostId)
    .single();
  recordTest('COMMENTS_TRIGGER', 'Atomic trigger synced comments_count back to 0', postAfterDelComment?.comments_count === 0,
    `comments_count in noir_posts: ${postAfterDelComment?.comments_count}`);

  // --- STEP 6: SAVES (BOOKMARKS) ---
  const { error: saveErr } = await clientB
    .from('noir_post_saves')
    .insert({
      post_id: testPostId,
      user_id: userB.id,
    });
  recordTest('SAVES', 'User B saves User A post', !saveErr, saveErr ? saveErr.message : 'Saved OK');

  // User B can view own saves
  const { data: bSaves } = await clientB
    .from('noir_post_saves')
    .select('*')
    .eq('user_id', userB.id);
  recordTest('SAVES', 'User B views own saved posts', (bSaves?.length || 0) > 0, `Found ${bSaves?.length} saved post(s)`);

  // Negative: User A attempts to view User B's saved posts
  const { data: aViewingBSaves } = await clientA
    .from('noir_post_saves')
    .select('*')
    .eq('user_id', userB.id);
  recordTest('SAVES_RLS', 'NEGATIVE: User A cannot view User B saved posts', (aViewingBSaves?.length || 0) === 0,
    `Returned ${aViewingBSaves?.length || 0} rows (Expected 0)`);

  // Cleanup save
  await clientB.from('noir_post_saves').delete().eq('post_id', testPostId).eq('user_id', userB.id);

  // --- STEP 7: POST DELETION & AUTHORIZATION ---
  // Negative: User B attempts to delete User A's post
  const { data: delSpoofPost, error: delSpoofPostErr } = await clientB
    .from('noir_posts')
    .delete()
    .eq('id', testPostId)
    .select();
  const postDelBlocked = (!delSpoofPost || delSpoofPost.length === 0) || !!delSpoofPostErr;
  recordTest('POSTS_RLS', 'NEGATIVE: User B cannot delete User A post', postDelBlocked,
    delSpoofPostErr ? `Blocked with error: ${delSpoofPostErr.message}` : '0 rows deleted (RLS filter)');

  // Positive: User A deletes own post
  const { error: delOwnPostErr } = await clientA
    .from('noir_posts')
    .delete()
    .eq('id', testPostId);
  recordTest('POSTS', 'User A deletes own post', !delOwnPostErr, delOwnPostErr ? delOwnPostErr.message : 'Deleted OK');

  // --- STEP 8: PRIVATE PROFILES & FOLLOWER ACCESS ---
  // User B is marked private (`is_private = true`)
  const privatePostId = crypto.randomUUID();
  const { error: privPostCreateErr } = await clientB
    .from('noir_posts')
    .insert({
      id: privatePostId,
      author_id: userB.id,
      content: 'Confidential post by private User B',
      likes_count: 0,
      comments_count: 0,
    });
  recordTest('PRIVACY', 'User B creates private post', !privPostCreateErr, privPostCreateErr ? privPostCreateErr.message : 'Created OK');

  // User A (not following) queries User B's post
  const { data: aViewsPrivateB } = await clientA
    .from('noir_posts')
    .select('*')
    .eq('id', privatePostId);
  recordTest('PRIVACY_RLS', 'NEGATIVE: Non-follower User A cannot see private User B post', (aViewsPrivateB?.length || 0) === 0,
    `Returned ${aViewsPrivateB?.length || 0} rows (Expected 0)`);

  // Anon queries User B's post
  const { data: anonViewsPrivateB } = await clientAnon
    .from('noir_posts')
    .select('*')
    .eq('id', privatePostId);
  recordTest('PRIVACY_RLS', 'NEGATIVE: Anon cannot see private User B post', (anonViewsPrivateB?.length || 0) === 0,
    `Returned ${anonViewsPrivateB?.length || 0} rows (Expected 0)`);

  // User A follows User B
  const { error: followErr } = await clientA
    .from('noir_follows')
    .insert({
      follower_id: userA.id,
      following_id: userB.id,
    });
  recordTest('FOLLOW', 'User A follows User B', !followErr, followErr ? followErr.message : 'Followed OK');

  // User A (now following) queries User B's private post
  const { data: aViewsPrivateBAfterFollow } = await clientA
    .from('noir_posts')
    .select('*')
    .eq('id', privatePostId);
  recordTest('PRIVACY_RLS', 'Follower User A CAN see private User B post', aViewsPrivateBAfterFollow?.length === 1,
    `Returned ${aViewsPrivateBAfterFollow?.length} row(s) (Expected 1)`);

  // User A unfollows User B
  await clientA.from('noir_follows').delete().eq('follower_id', userA.id).eq('following_id', userB.id);

  // User A queries again after unfollowing
  const { data: aViewsPrivateBAfterUnfollow } = await clientA
    .from('noir_posts')
    .select('*')
    .eq('id', privatePostId);
  recordTest('PRIVACY_RLS', 'NEGATIVE: User A loses access after unfollowing', (aViewsPrivateBAfterUnfollow?.length || 0) === 0,
    `Returned ${aViewsPrivateBAfterUnfollow?.length || 0} rows (Expected 0)`);

  // Cleanup private post
  await clientB.from('noir_posts').delete().eq('id', privatePostId);

  // --- STEP 9: MESSAGING & CONVERSATION ISOLATION ---
  const convId = crypto.randomUUID();
  // User A creates conversation
  const { error: convErr } = await clientA
    .from('noir_conversations')
    .insert({ id: convId, created_by: userA.id });
  recordTest('CHAT', 'User A creates conversation', !convErr, convErr ? convErr.message : 'Conv created');

  // Add participants A & B
  await clientA.from('noir_conversation_participants').insert([
    { conversation_id: convId, user_id: userA.id },
    { conversation_id: convId, user_id: userB.id }
  ]);

  // User A sends message
  const msgId = crypto.randomUUID();
  const { error: msgErr } = await clientA
    .from('noir_messages')
    .insert({
      id: msgId,
      conversation_id: convId,
      sender_id: userA.id,
      content: 'Encrypted audit dispatch'
    });
  recordTest('CHAT', 'User A sends message as sender_id = userA.id', !msgErr, msgErr ? msgErr.message : 'Message sent');

  // User B can view the message
  const { data: bMsgs } = await clientB
    .from('noir_messages')
    .select('*')
    .eq('conversation_id', convId);
  recordTest('CHAT', 'Participant User B receives message', (bMsgs?.length || 0) > 0, `Received ${bMsgs?.length} message(s)`);

  // Negative: User B attempts to spoof message as sender_id = userA.id
  const { error: spoofMsgErr } = await clientB
    .from('noir_messages')
    .insert({
      id: crypto.randomUUID(),
      conversation_id: convId,
      sender_id: userA.id,
      content: 'Spoofed message pretending to be User A'
    });
  recordTest('CHAT_RLS', 'NEGATIVE: User B cannot send message with sender_id = userA.id', !!spoofMsgErr,
    spoofMsgErr ? `Blocked: ${spoofMsgErr.message}` : 'SECURITY BREACH: Spoofed message succeeded!');

  // Negative: Anon attempts to read conversation messages
  const { data: anonMsgs } = await clientAnon
    .from('noir_messages')
    .select('*')
    .eq('conversation_id', convId);
  recordTest('CHAT_RLS', 'NEGATIVE: Anon cannot view conversation messages', (anonMsgs?.length || 0) === 0,
    `Returned ${anonMsgs?.length || 0} rows (Expected 0)`);

  // --- STEP 9B: REAL UNREAD MESSAGE SYSTEM & RLS ON noir_conversation_reads ---
  // Helper to query unread count exactly as noirApi.getConversations does
  async function computeUnread(client, targetConvId, userId) {
    const { data: readState } = await client
      .from('noir_conversation_reads')
      .select('last_read_at')
      .eq('conversation_id', targetConvId)
      .eq('user_id', userId)
      .maybeSingle();

    const lastReadTime = readState?.last_read_at ? new Date(readState.last_read_at).getTime() : 0;
    const { data: msgs } = await client
      .from('noir_messages')
      .select('sender_id, created_at')
      .eq('conversation_id', targetConvId);

    const unread = (msgs || []).filter(m => 
      m.sender_id !== userId && new Date(m.created_at).getTime() > lastReadTime
    );
    return unread.length;
  }

  // User B sends 3 new messages to User A
  const msgB1Id = crypto.randomUUID();
  const msgB2Id = crypto.randomUUID();
  const msgB3Id = crypto.randomUUID();
  await clientB.from('noir_messages').insert([
    { id: msgB1Id, conversation_id: convId, sender_id: userB.id, content: 'B to A dispatch 1' },
    { id: msgB2Id, conversation_id: convId, sender_id: userB.id, content: 'B to A dispatch 2' },
    { id: msgB3Id, conversation_id: convId, sender_id: userB.id, content: 'B to A dispatch 3' },
  ]);

  const unreadBeforeA = await computeUnread(clientA, convId, userA.id);
  recordTest('CHAT_UNREAD', 'User A sees 3 unread messages from User B', unreadBeforeA === 3,
    `Calculated unreadCount for User A: ${unreadBeforeA} (Expected 3)`);

  // User A marks conversation as read via atomic server RPC (mark_conversation_read)
  const { data: rpcTime1, error: markReadErr } = await clientA
    .rpc('mark_conversation_read', { p_conv_id: convId });
  recordTest('CHAT_UNREAD', 'User A marks conversation as read via atomic mark_conversation_read RPC', !markReadErr,
    markReadErr ? markReadErr.message : `Atomic DB read timestamp: ${rpcTime1}`);

  // Verify User A unread count is now 0
  const unreadAfterA1 = await computeUnread(clientA, convId, userA.id);
  recordTest('CHAT_UNREAD', 'User A unread count drops to 0 after mark-read', unreadAfterA1 === 0,
    `Calculated unreadCount for User A: ${unreadAfterA1} (Expected 0)`);

  // Wait 150ms so next message created_at is strictly after rpcTime1
  await new Promise(r => setTimeout(r, 150));

  // User B sends 1 more message
  const msgB4Id = crypto.randomUUID();
  await clientB.from('noir_messages').insert({
    id: msgB4Id,
    conversation_id: convId,
    sender_id: userB.id,
    content: 'B to A dispatch 4'
  });

  // Verify User A unread count is now 1
  const unreadAfterNewB = await computeUnread(clientA, convId, userA.id);
  recordTest('CHAT_UNREAD', 'User A unread count increases to 1 on incoming message', unreadAfterNewB === 1,
    `Calculated unreadCount for User A: ${unreadAfterNewB} (Expected 1)`);

  // User A sends a reply to User B: User A's unread count must NOT increment (own message excluded)
  const msgA2Id = crypto.randomUUID();
  await clientA.from('noir_messages').insert({
    id: msgA2Id,
    conversation_id: convId,
    sender_id: userA.id,
    content: 'User A reply'
  });

  const unreadAfterOwn = await computeUnread(clientA, convId, userA.id);
  recordTest('CHAT_UNREAD', 'User A sending message does NOT increment own unread count', unreadAfterOwn === 1,
    `Calculated unreadCount for User A: ${unreadAfterOwn} (Expected 1)`);

  // User A marks conversation as read again via atomic RPC
  await clientA.rpc('mark_conversation_read', { p_conv_id: convId });
  const unreadFinalA = await computeUnread(clientA, convId, userA.id);
  recordTest('CHAT_UNREAD', 'User A marks read again: unread count is 0', unreadFinalA === 0,
    `Calculated unreadCount for User A: ${unreadFinalA} (Expected 0)`);

  // NEGATIVE RLS: User B attempts to tamper with User A's read record
  const { data: spoofReadUpdate, error: spoofReadErr } = await clientB
    .from('noir_conversation_reads')
    .update({ last_read_at: new Date(0).toISOString() })
    .eq('conversation_id', convId)
    .eq('user_id', userA.id)
    .select();
  const spoofReadBlocked = (!spoofReadUpdate || spoofReadUpdate.length === 0) || !!spoofReadErr;
  recordTest('CHAT_UNREAD_RLS', 'NEGATIVE: User B cannot tamper with User A read timestamp', spoofReadBlocked,
    spoofReadErr ? `Blocked: ${spoofReadErr.message}` : '0 rows updated (RLS filter)');

  // NEGATIVE RLS: Anon attempts to read noir_conversation_reads
  const { data: anonReads } = await clientAnon
    .from('noir_conversation_reads')
    .select('*')
    .eq('conversation_id', convId);
  recordTest('CHAT_UNREAD_RLS', 'NEGATIVE: Anon cannot view conversation read states', (anonReads?.length || 0) === 0,
    `Returned ${anonReads?.length || 0} rows (Expected 0)`);

  // Cleanup conversation reads, messages, participants, conversation
  await clientA.from('noir_conversation_reads').delete().eq('conversation_id', convId);
  await clientA.from('noir_messages').delete().eq('conversation_id', convId);
  await clientA.from('noir_conversation_participants').delete().eq('conversation_id', convId);
  await clientA.from('noir_conversations').delete().eq('id', convId);

  // --- STEP 10: NOTIFICATIONS ISOLATION ---
  const notifId = crypto.randomUUID();
  // User A creates notification for User B
  const { error: notifErr } = await clientA
    .from('noir_notifications')
    .insert({
      id: notifId,
      user_id: userB.id,
      actor_id: userA.id,
      type: 'like',
      title: 'New Like',
      content: 'Agent Alpha liked your dispatch'
    });
  recordTest('NOTIFICATIONS', 'User A triggers notification for User B', !notifErr, notifErr ? notifErr.message : 'Notification queued');

  // User B reads notification
  const { data: bNotifs } = await clientB
    .from('noir_notifications')
    .select('*')
    .eq('id', notifId);
  recordTest('NOTIFICATIONS', 'User B can read own notification', bNotifs?.length === 1, `Found ${bNotifs?.length} record(s)`);

  // Negative: User A attempts to read User B's notifications
  const { data: aReadsBNotifs } = await clientA
    .from('noir_notifications')
    .select('*')
    .eq('id', notifId);
  recordTest('NOTIFICATIONS_RLS', 'NEGATIVE: User A cannot read User B notifications', (aReadsBNotifs?.length || 0) === 0,
    `Returned ${aReadsBNotifs?.length || 0} rows (Expected 0)`);

  // Negative: User A attempts to delete User B's notification
  const { data: aDelsBNotifs, error: aDelErr } = await clientA
    .from('noir_notifications')
    .delete()
    .eq('id', notifId)
    .select();
  const notifDelBlocked = (!aDelsBNotifs || aDelsBNotifs.length === 0) || !!aDelErr;
  recordTest('NOTIFICATIONS_RLS', 'NEGATIVE: User A cannot delete User B notification', notifDelBlocked,
    aDelErr ? `Blocked: ${aDelErr.message}` : '0 rows deleted (RLS filter)');

  // Cleanup notification by User B
  await clientB.from('noir_notifications').delete().eq('id', notifId);

  // --- STEP 11: STORAGE SECURITY ---
  // Positive: User A uploads file in own folder: users/{userA.id}/avatar.png
  const dummyFile = Buffer.from('test-image-data-png');
  const pathA = `users/${userA.id}/test-audit-${Date.now()}.png`;
  const { error: storAErr } = await clientA.storage
    .from('noir-media')
    .upload(pathA, dummyFile, { contentType: 'image/png' });
  recordTest('STORAGE', 'User A uploads to own folder: users/{userA.id}/*', !storAErr,
    storAErr ? storAErr.message : `Uploaded: ${pathA}`);

  // Negative: User A attempts to upload into User B folder: users/{userB.id}/*
  const pathBbyA = `users/${userB.id}/hack-${Date.now()}.png`;
  const { error: storBbyAErr } = await clientA.storage
    .from('noir-media')
    .upload(pathBbyA, dummyFile, { contentType: 'image/png' });
  recordTest('STORAGE_RLS', 'NEGATIVE: User A cannot upload into users/{userB.id}/*', !!storBbyAErr,
    storBbyAErr ? `Blocked: ${storBbyAErr.message}` : 'SECURITY BREACH: User A uploaded to User B directory!');

  // Negative: Anon attempts to upload into users/{userA.id}/*
  const pathAnon = `users/${userA.id}/anon-${Date.now()}.png`;
  const { error: storAnonErr } = await clientAnon.storage
    .from('noir-media')
    .upload(pathAnon, dummyFile, { contentType: 'image/png' });
  recordTest('STORAGE_RLS', 'NEGATIVE: Anon cannot upload to noir-media', !!storAnonErr,
    storAnonErr ? `Blocked: ${storAnonErr.message}` : 'SECURITY BREACH: Anon uploaded to storage!');

  // Negative: User B attempts to DELETE User A's uploaded file
  if (!storAErr) {
    const { data: delStorData, error: delStorErr } = await clientB.storage
      .from('noir-media')
      .remove([pathA]);
    // Supabase storage remove returns deleted objects; if RLS blocked it, it returns [] or error
    const wasDelBlocked = !!delStorErr || !delStorData || delStorData.length === 0;
    recordTest('STORAGE_RLS', 'NEGATIVE: User B cannot delete User A file', wasDelBlocked,
      delStorErr ? `Blocked: ${delStorErr.message}` : `0 files deleted (${JSON.stringify(delStorData)})`);
    
    // Clean up by User A
    await clientA.storage.from('noir-media').remove([pathA]);
  }

  // --- STEP 12: DISCOVERY FILTERING REALITY TESTS ---
  // Ensure User A and User B have set age, gender, location
  await clientA.from('noir_profiles').update({ age: 29, gender: 'male', location: 'Berlin' }).eq('id', userA.id);
  await clientB.from('noir_profiles').update({ age: 34, gender: 'female', location: 'Paris' }).eq('id', userB.id);

  // 1. All registered profiles
  const { data: allProfiles, error: discAllErr } = await clientA
    .from('noir_profiles')
    .select('id, name, username, age, gender, location')
    .order('created_at', { ascending: false });
  recordTest('DISCOVERY_REALITY', 'Live DB members queried successfully', !discAllErr && (allProfiles?.length || 0) >= 2,
    `Found ${allProfiles?.length} member profiles in DB`);

  // 2. Age Filter Reality (e.g. age between 25 and 30 should include User A and exclude User B)
  const { data: ageFiltered } = await clientA
    .from('noir_profiles')
    .select('id, age')
    .gte('age', 25)
    .lte('age', 30);
  const ageAIncluded = ageFiltered?.some(p => p.id === userA.id);
  const ageBExcluded = !ageFiltered?.some(p => p.id === userB.id);
  recordTest('DISCOVERY_REALITY', 'Age filter DB query narrows members correctly', ageAIncluded && ageBExcluded,
    `Age 25-30 filter: User A included (${ageAIncluded}), User B excluded (${ageBExcluded})`);

  // 3. Gender Filter Reality (gender = female should include User B and exclude User A)
  const { data: genderFiltered } = await clientA
    .from('noir_profiles')
    .select('id, gender')
    .eq('gender', 'female');
  const femaleBIncluded = genderFiltered?.some(p => p.id === userB.id);
  const femaleAExcluded = !genderFiltered?.some(p => p.id === userA.id);
  recordTest('DISCOVERY_REALITY', 'Gender filter DB query isolates members correctly', femaleBIncluded && femaleAExcluded,
    `Gender female filter: User B included (${femaleBIncluded}), User A excluded (${femaleAExcluded})`);

  // 4. Location Filter Reality (location ilike '%Paris%')
  const { data: locFiltered } = await clientA
    .from('noir_profiles')
    .select('id, location')
    .ilike('location', '%Paris%');
  const parisBIncluded = locFiltered?.some(p => p.id === userB.id);
  const parisAExcluded = !locFiltered?.some(p => p.id === userA.id);
  recordTest('DISCOVERY_REALITY', 'Location search DB query matches city correctly', parisBIncluded && parisAExcluded,
    `Location Paris filter: User B included (${parisBIncluded}), User A excluded (${parisAExcluded})`);

  // --- STEP 13: FEED REALITY (TEXT POST, IMAGE POST, LIKES, BOOKMARKS, COMMENTS) ---
  // 1. Text-only post creation
  const textPostId = crypto.randomUUID();
  const { data: textPost, error: textPostErr } = await clientA
    .from('noir_posts')
    .insert({
      id: textPostId,
      author_id: userA.id,
      content: 'Editorial dispatches from the salon.',
      type: 'text',
      likes_count: 0,
      comments_count: 0,
      is_sensitive: false,
    })
    .select()
    .single();
  recordTest('FEED_REALITY', 'Text-only post created and stored in DB', !textPostErr && textPost?.type === 'text',
    textPostErr ? textPostErr.message : `Text post ID: ${textPostId}`);

  // 2. Image post creation
  const imgPostId = crypto.randomUUID();
  const { data: imgPost, error: imgPostErr } = await clientA
    .from('noir_posts')
    .insert({
      id: imgPostId,
      author_id: userA.id,
      content: 'Visual exhibition archive.',
      type: 'photo',
      media_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
      likes_count: 0,
      comments_count: 0,
      is_sensitive: false,
    })
    .select()
    .single();
  recordTest('FEED_REALITY', 'Image post created with valid HTTPS URL in DB', !imgPostErr && imgPost?.type === 'photo',
    imgPostErr ? imgPostErr.message : `Image post ID: ${imgPostId}`);

  // 3. User B bookmarks and unbookmarks User A text post
  const { error: saveFeedErr } = await clientB
    .from('noir_post_saves')
    .insert({ user_id: userB.id, post_id: textPostId });
  recordTest('FEED_REALITY', 'User B bookmarks post -> saved to noir_post_saves', !saveFeedErr,
    saveFeedErr ? saveFeedErr.message : 'Save record inserted');

  const { data: bFeedSaves } = await clientB
    .from('noir_post_saves')
    .select('*')
    .eq('user_id', userB.id)
    .eq('post_id', textPostId);
  recordTest('FEED_REALITY', 'User B can query saved post', bFeedSaves?.length === 1,
    `Found ${bFeedSaves?.length} saved record(s)`);

  const { error: unsaveFeedErr } = await clientB
    .from('noir_post_saves')
    .delete()
    .eq('user_id', userB.id)
    .eq('post_id', textPostId);
  recordTest('FEED_REALITY', 'User B unbookmarks post -> removed from noir_post_saves', !unsaveFeedErr,
    unsaveFeedErr ? unsaveFeedErr.message : 'Save record deleted');

  // Clean up test posts
  await clientA.from('noir_posts').delete().eq('id', textPostId);
  await clientA.from('noir_posts').delete().eq('id', imgPostId);

  // --- SUMMARY ---
  console.log('\n================================================================');
  console.log('AUDIT SUMMARY');
  console.log('================================================================');
  const total = testResults.length;
  const passed = testResults.filter(t => t.passed).length;
  const failed = total - passed;
  console.log(`TOTAL TESTS: ${total}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log(`RESULT: ${failed === 0 ? 'ALL CRITICAL SECURITY & REALITY CHECKS PASSED' : 'SECURITY CHECKS FAILED'}`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAudit().catch(err => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
