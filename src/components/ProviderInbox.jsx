// src/components/ProviderInbox.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  fetchConversations,
  fetchMessages,
  replyMessage,
  markConversationRead,
  fetchNotifPrefs,
  saveNotifPrefs,
} from '../mocks/messages'
import './ProviderInbox.css'

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (d > 0)  return `hace ${d}d`
  if (h > 0)  return `hace ${h}h`
  if (m > 0)  return `hace ${m}m`
  return 'ahora'
}

// ── Conversation list ─────────────────────────────────────────────
function ConversationList({ conversations, selected, onSelect }) {
  const { t } = useTranslation()

  if (!conversations.length) {
    return (
      <div className="pinbox__empty">
        <span className="pinbox__empty-icon" aria-hidden="true">💬</span>
        <p className="pinbox__empty-title">{t('messaging.inbox_empty_title')}</p>
        <p className="pinbox__empty-body t-xs">{t('messaging.inbox_empty_body')}</p>
      </div>
    )
  }

  return (
    <ul className="pinbox__list" role="list">
      {conversations.map(conv => (
        <li key={conv.id}>
          <button
            className={`pinbox__conv${selected?.id === conv.id ? ' pinbox__conv--active' : ''}${conv.unread_count > 0 ? ' pinbox__conv--unread' : ''}`}
            onClick={() => onSelect(conv)}
          >
            <div className="pinbox__conv-avatar">{(conv.migrant_name || '?')[0]}</div>
            <div className="pinbox__conv-info">
              <div className="pinbox__conv-top">
                <span className="pinbox__conv-name">{conv.migrant_name}</span>
                <span className="pinbox__conv-time t-xs">{timeAgo(conv.last_message_at)}</span>
              </div>
              <div className="pinbox__conv-sub">
                <span className="pinbox__conv-subject t-xs">{conv.subject}</span>
                {conv.unread_count > 0 && (
                  <span className="pinbox__conv-badge">{conv.unread_count}</span>
                )}
              </div>
            </div>
          </button>
        </li>
      ))}
    </ul>
  )
}

// ── Thread view ───────────────────────────────────────────────────
function ThreadView({ conversation, onBack }) {
  const { t } = useTranslation()
  const [messages, setMessages] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [reply,    setReply]    = useState('')
  const [sending,  setSending]  = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchMessages(conversation.id).then(({ data }) => {
      setMessages(data)
      setLoading(false)
    })
    markConversationRead(conversation.id)
  }, [conversation.id])

  const [replyErr, setReplyErr] = useState(null)

  const handleReply = async () => {
    if (!reply.trim()) return
    setSending(true)
    setReplyErr(null)
    const { data, error } = await replyMessage({ conversationId: conversation.id, body: reply.trim() })
    setSending(false)
    if (error) {
      setReplyErr(t('messaging.send_error'))
    } else if (data) {
      setMessages(m => [...m, data])
      setReply('')
    }
  }

  return (
    <div className="pinbox__thread">
      <div className="pinbox__thread-header">
        <button className="pinbox__back" onClick={onBack}>{t('messaging.back_to_list')}</button>
        <div className="pinbox__thread-meta">
          <span className="pinbox__thread-name">{conversation.migrant_name}</span>
          <span className="pinbox__thread-subject t-xs">{conversation.subject}</span>
        </div>
      </div>

      <div className="pinbox__messages">
        {loading ? (
          <div className="pinbox__spinner" />
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`pinbox__msg pinbox__msg--${msg.sender_role}`}>
              <div className="pinbox__msg-bubble">
                <p className="pinbox__msg-body">{msg.body}</p>
                <span className="pinbox__msg-time t-xs">{timeAgo(msg.created_at)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pinbox__reply">
        {replyErr && <p className="pinbox__reply-err t-xs">{replyErr}</p>}
        <div className="pinbox__reply-row">
          <textarea
            className="pinbox__reply-input"
            rows={3}
            placeholder={t('messaging.reply_placeholder')}
            value={reply}
            onChange={e => setReply(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleReply()
            }}
          />
          <button
            className="btn btn-primary btn-sm pinbox__reply-btn"
            onClick={handleReply}
            disabled={sending || !reply.trim()}
          >
            <span>{sending ? t('messaging.sending') : t('messaging.reply_send')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Notification settings ─────────────────────────────────────────
function NotificationPanel({ providerId }) {
  const { t } = useTranslation()
  const [notifMsg,    setNotifMsg]    = useState(true)
  const [notifReview, setNotifReview] = useState(true)
  const [saved,       setSaved]       = useState(false)
  const [saving,      setSaving]      = useState(false)

  useEffect(() => {
    if (!providerId) return
    fetchNotifPrefs(providerId)
      .then(({ data }) => {
        if (data) {
          setNotifMsg(data.notif_new_message ?? true)
          setNotifReview(data.notif_new_review ?? true)
        }
      })
      .catch(() => {})
  }, [providerId])

  const handleSave = async () => {
    setSaving(true)
    const { error } = await saveNotifPrefs(providerId, {
      notif_new_message: notifMsg,
      notif_new_review:  notifReview,
    })
    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  return (
    <div className="pinbox__notif">
      <h3 className="pinbox__notif-title t-sm">{t('messaging.notification_title')}</h3>
      {[
        { key: 'msg',    label: t('messaging.notification_messages'), val: notifMsg,    set: setNotifMsg    },
        { key: 'review', label: t('messaging.notification_reviews'),  val: notifReview, set: setNotifReview },
      ].map(({ key, label, val, set }) => (
        <label key={key} className="pinbox__notif-row">
          <span className="t-sm">{label}</span>
          <span className={`pinbox__switch${val ? ' pinbox__switch--on' : ''}`}
            role="switch" aria-checked={val} tabIndex={0}
            onClick={() => set(v => !v)}
            onKeyDown={e => e.key === 'Enter' && set(v => !v)}>
            <span className="pinbox__switch-thumb" />
          </span>
        </label>
      ))}
      <button className="btn btn-ghost btn-sm pinbox__notif-save" onClick={handleSave} disabled={saving}>
        {saved ? `✓ ${t('messaging.saved')}` : saving ? t('messaging.sending') : t('messaging.save_notif')}
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────
export default function ProviderInbox({ providerId }) {
  const { t } = useTranslation()
  const [conversations, setConversations] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [loadError,     setLoadError]     = useState(null)
  const [selected,      setSelected]      = useState(null)

  useEffect(() => {
    if (!providerId) { setLoading(false); return }
    setLoadError(null)
    fetchConversations(providerId)
      .then(({ data, error }) => {
        if (error) setLoadError(error.message)
        setConversations(data ?? [])
        setLoading(false)
      })
      .catch(err => {
        console.error('[ProviderInbox] load error:', err)
        setLoadError(err.message ?? 'Error cargando mensajes')
        setLoading(false)
      })
  }, [providerId])

  if (loading) return <div className="pinbox__spinner" />

  if (loadError) return (
    <div className="pinbox__empty" style={{ color: 'var(--text-400)', padding: '32px 24px' }}>
      <span className="pinbox__empty-icon" aria-hidden="true">⚠️</span>
      <p className="pinbox__empty-title">No se pudo cargar el buzón</p>
      <p className="pinbox__empty-body t-xs" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{loadError}</p>
    </div>
  )

  return (
    <div className="pinbox">
      <div className="pinbox__layout">
        {/* Left: list — hidden on mobile when thread is open */}
        <div className={`pinbox__sidebar${selected ? ' pinbox__sidebar--hidden' : ''}`}>
          <ConversationList
            conversations={conversations}
            selected={selected}
            onSelect={setSelected}
          />
        </div>

        {/* Right: thread — shown when conversation selected */}
        <div className={`pinbox__main${!selected ? ' pinbox__main--hidden' : ''}`}>
          {selected ? (
            <ThreadView
              conversation={selected}
              onBack={() => setSelected(null)}
            />
          ) : (
            <div className="pinbox__no-selection">
              <span aria-hidden="true">←</span>
              <p className="t-sm">{t('messaging.select_conversation')}</p>
            </div>
          )}
        </div>
      </div>

      <NotificationPanel providerId={providerId} />
    </div>
  )
}
