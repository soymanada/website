// src/mocks/messages.js
// Mock data layer — mirrors future Supabase schema exactly.
// Replace each exported function body with a real Supabase query when backend is ready.

const delay = (ms = 600) => new Promise(r => setTimeout(r, ms))

// ── Mock data ─────────────────────────────────────────────────────
const MOCK_CONVERSATIONS = [
  {
    id: 'conv_demo_1',
    migrant_id:   'user_demo_1',
    migrant_name: 'Ana García',
    subject:      'Consulta sobre traducciones certificadas',
    last_message_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    unread_count: 2,
    status:       'open',
  },
  {
    id: 'conv_demo_2',
    migrant_id:   'user_demo_2',
    migrant_name: 'Martín López',
    subject:      'Disponibilidad para esta semana',
    last_message_at: new Date(Date.now() - 26 * 3600000).toISOString(),
    unread_count: 0,
    status:       'replied',
  },
]

const MOCK_MESSAGES = {
  conv_demo_1: [
    {
      id: 'msg_1',
      conversation_id: 'conv_demo_1',
      sender_role: 'migrant',
      sender_name: 'Ana García',
      body: 'Hola, necesito traducción certificada de mi título universitario al inglés para visa de trabajo. ¿Cuánto tiempo tarda y cuál es el costo aproximado?',
      created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
      read_at: null,
    },
    {
      id: 'msg_2',
      conversation_id: 'conv_demo_1',
      sender_role: 'migrant',
      sender_name: 'Ana García',
      body: '¿También pueden certificar acta de nacimiento?',
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      read_at: null,
    },
  ],
  conv_demo_2: [
    {
      id: 'msg_3',
      conversation_id: 'conv_demo_2',
      sender_role: 'migrant',
      sender_name: 'Martín López',
      body: '¿Tienen disponibilidad esta semana? Necesito asesoría para mi proceso de residencia permanente.',
      created_at: new Date(Date.now() - 30 * 3600000).toISOString(),
      read_at: new Date(Date.now() - 29 * 3600000).toISOString(),
    },
    {
      id: 'msg_4',
      conversation_id: 'conv_demo_2',
      sender_role: 'provider',
      sender_name: 'Tú',
      body: 'Hola Martín, tenemos citas disponibles el jueves y viernes de 14:00 a 18:00. ¿Te acomoda alguno de esos horarios?',
      created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
      read_at: new Date(Date.now() - 23 * 3600000).toISOString(),
    },
  ],
}

// ── API contract — replace bodies with Supabase when ready ────────

/** Fetch conversation list for a provider */
export async function fetchConversations(providerId) {
  await delay()
  // TODO: supabase.from('conversations').select('*').eq('provider_id', providerId).order('last_message_at', { ascending: false })
  return { data: MOCK_CONVERSATIONS, error: null }
}

/** Fetch messages for a conversation */
export async function fetchMessages(conversationId) {
  await delay(300)
  // TODO: supabase.from('messages').select('*').eq('conversation_id', conversationId).order('created_at')
  return { data: MOCK_MESSAGES[conversationId] ?? [], error: null }
}

/** Send a new message from migrant to provider (creates conversation if none exists) */
export async function sendMessage({ providerId, userId, body }) {
  await delay(800)
  // TODO: supabase.rpc('send_or_reply_message', { p_provider_id, p_user_id, p_body })
  return { error: null }
}

/** Send a reply from provider to migrant */
export async function replyMessage({ conversationId, body }) {
  await delay(600)
  // TODO: supabase.from('messages').insert({ conversation_id, sender_role: 'provider', body })
  return {
    data: {
      id: `msg_${Date.now()}`,
      conversation_id: conversationId,
      sender_role: 'provider',
      sender_name: 'Tú',
      body,
      created_at: new Date().toISOString(),
      read_at: null,
    },
    error: null,
  }
}

/** Mark conversation as read */
export async function markConversationRead(conversationId) {
  await delay(200)
  // TODO: supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('conversation_id', conversationId).is('read_at', null)
  return { error: null }
}

/** Fetch total unread count for a provider (for tab badge) */
export async function fetchUnreadCount(providerId) {
  await delay(300)
  // TODO: supabase.from('conversations').select('unread_count').eq('provider_id', providerId).gt('unread_count', 0)
  const total = MOCK_CONVERSATIONS.reduce((s, c) => s + c.unread_count, 0)
  return { data: total, error: null }
}
