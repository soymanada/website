// src/components/MessageModal.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { sendMessage } from '../mocks/messages'
import './MessageModal.css'

export default function MessageModal({ providerId, providerName, userId, onClose }) {
  const { t } = useTranslation()
  const [body,    setBody]    = useState('')
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [err,     setErr]     = useState(null)

  const handleSend = async () => {
    if (!body.trim()) return
    setSending(true)
    setErr(null)
    const { error } = await sendMessage({ providerId, userId, body: body.trim() })
    setSending(false)
    if (error) {
      setErr(t('messaging.send_error'))
    } else {
      setSent(true)
    }
  }

  return (
    <div className="mmask" role="dialog" aria-modal="true" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mmодal">
        <button className="mmodal__close" onClick={onClose} aria-label="Cerrar">×</button>

        {sent ? (
          <div className="mmodal__success">
            <span className="mmodal__success-icon" aria-hidden="true">✓</span>
            <h3 className="mmodal__success-title">{t('messaging.sent_title')}</h3>
            <p className="mmodal__success-body">{t('messaging.sent_body', { name: providerName })}</p>
            <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ marginTop: 16 }}>
              {t('messaging.close')}
            </button>
          </div>
        ) : (
          <>
            <h2 className="mmodal__title">{t('messaging.modal_title', { name: providerName })}</h2>
            <p className="mmodal__hint t-xs">{t('messaging.modal_hint')}</p>

            <textarea
              className="mmodal__textarea"
              rows={5}
              placeholder={t('messaging.placeholder')}
              value={body}
              onChange={e => setBody(e.target.value)}
              autoFocus
              maxLength={1000}
            />
            {err && <p className="mmodal__error t-xs">{err}</p>}
            <div className="mmodal__footer">
              <span className="mmodal__chars t-xs">{body.length}/1000</span>
              <div className="mmodal__actions">
                <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={sending}>
                  {t('messaging.cancel')}
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSend}
                  disabled={sending || !body.trim()}
                >
                  <span>{sending ? t('messaging.sending') : t('messaging.send')}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
