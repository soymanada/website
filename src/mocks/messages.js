// src/mocks/messages.js
// Real Supabase data layer.
// Signatures are identical to the previous mock so no component changes needed.
import { supabase } from '../lib/supabase'

// ── Conversations ─────────────────────────────────────────────────

export async function fetchConversations(providerId) {
  const { data, error } = await supabase
    .from('conversations')
    .select('id, provider_id, migrant_id, migrant_name, subject, status, unread_count, last_message_at')
    .eq('provider_id', providerId)
    .order('last_message_at', { ascending: false })
  if (error) console.warn('[fetchConversations]', error.message)
  return { data: data ?? [], error }
}

export async function fetchMessages(conversationId) {
  const { data, error } = await supabase
    .from('messages')
    .select('id, conversation_id, sender_role, sender_name, body, read_at, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  if (error) console.warn('[fetchMessages]', error.message)
  return { data: data ?? [], error }
}

// ── Send (migrant → provider, creates or reuses conversation) ─────

export async function sendMessage({ providerId, userId, body }) {
  // Check BEFORE the RPC whether this conversation already exists.
  // We only email the provider when a brand-new thread is opened.
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('provider_id', providerId)
    .eq('migrant_id', userId)
    .maybeSingle()

  const isNewConversation = !existing

  const { data, error } = await supabase.rpc('send_or_reply_message', {
    p_provider_id: providerId,
    p_body:        body,
    p_subject:     null,
  })
  if (error) {
    console.error('[sendMessage] RPC error:', error.message, '| code:', error.code, '| hint:', error.hint)
    return { data, error }
  }

  // Notify provider on every message (new conversation OR follow-up)
  supabase.functions
    .invoke('notify-new-message', {
      body: {
        type:           'new_message',
        to_provider_id: providerId,
        body_preview:   body.slice(0, 120),
        is_new_thread:  isNewConversation,
      },
    })
    .then(({ error: fnErr }) => {
      if (fnErr) console.warn('[notify-new-message] invoke error:', fnErr.message)
    })
    .catch(err => console.warn('[notify-new-message] invoke failed:', err))

  return { data, error: null }
}

// ── Reply (provider → migrant, uses existing conversation) ────────

export async function replyMessage({ conversationId, body }) {
  // Insert message from provider
  const { data: msg, error: msgErr } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_role:     'provider',
      body,
    })
    .select('id, conversation_id, sender_role, sender_name, body, read_at, created_at')
    .single()

  if (msgErr) {
    console.warn('[replyMessage] insert', msgErr.message)
    return { data: null, error: msgErr }
  }

  // Notify migrant that the provider replied
  supabase.functions
    .invoke('notify-provider-reply', {
      body: { conversation_id: conversationId, body_preview: body.slice(0, 120) },
    })
    .then(({ error: fnErr }) => {
      if (fnErr) console.warn('[notify-provider-reply] invoke error:', fnErr.message)
    })
    .catch(err => console.warn('[notify-provider-reply] invoke failed:', err))

  // Update conversation metadata
  const { data: conv } = await supabase
    .from('conversations')
    .update({ status: 'replied', last_message_at: new Date().toISOString() })
    .eq('id', conversationId)
    .select('provider_id, migrant_id')
    .single()

  // Unlock review only after 4 total messages in the thread (migrant + provider combined).
  // This ensures enough back-and-forth before the migrant can evaluate.
  if (conv?.provider_id && conv?.migrant_id) {
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)

    if ((count ?? 0) >= 4) {
      await supabase
        .from('verified_interactions')
        .upsert(
          { provider_id: conv.provider_id, user_id: conv.migrant_id, source: 'message_reply' },
          { onConflict: 'provider_id,user_id' }
        )
    }
  }

  return { data: msg, error: null }
}

// ── Mark conversation as read ─────────────────────────────────────

export async function markConversationRead(conversationId) {
  const now = new Date().toISOString()
  await supabase
    .from('messages')
    .update({ read_at: now })
    .is('read_at', null)
    .eq('conversation_id', conversationId)
    .eq('sender_role', 'migrant')

  await supabase
    .from('conversations')
    .update({ unread_count: 0 })
    .eq('id', conversationId)

  return { error: null }
}

// ── Unread count badge ────────────────────────────────────────────

export async function fetchUnreadCount(providerId) {
  const { data, error } = await supabase
    .from('conversations')
    .select('unread_count')
    .eq('provider_id', providerId)
    .gt('unread_count', 0)
  if (error) return { data: 0, error }
  const total = (data ?? []).reduce((s, c) => s + (c.unread_count ?? 0), 0)
  return { data: total, error: null }
}

// ── Notification preferences ──────────────────────────────────────

export async function fetchNotifPrefs(providerId) {
  const { data, error } = await supabase
    .from('providers')
    .select('notif_new_message, notif_new_review')
    .eq('id', providerId)
    .single()
  if (error) console.warn('[fetchNotifPrefs]', error.message)
  return {
    data: {
      notif_new_message: data?.notif_new_message ?? true,
      notif_new_review:  data?.notif_new_review  ?? true,
    },
    error,
  }
}

export async function saveNotifPrefs(providerId, { notif_new_message, notif_new_review }) {
  const { error } = await supabase
    .from('providers')
    .update({ notif_new_message, notif_new_review })
    .eq('id', providerId)
  if (error) console.warn('[saveNotifPrefs]', error.message)
  return { error }
}
