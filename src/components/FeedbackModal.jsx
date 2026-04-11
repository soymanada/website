// src/components/FeedbackModal.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import './FormModal.css'

// TODO backend: create table site_feedback (
//   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   created_at timestamptz DEFAULT now(),
//   type text CHECK (type IN ('idea','bug','praise','other')),
//   message text NOT NULL,
//   email text
// );
// RLS: INSERT open to all (including anonymous), SELECT restricted to admin.

export default function FeedbackModal({ onClose }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ type: 'idea', message: '', email: '' })
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [err,     setErr]     = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.message.trim()) return
    setSending(true)
    setErr(null)
    const { error } = await supabase.from('site_feedback').insert({
      type:    form.type,
      message: form.message.trim(),
      email:   form.email.trim() || null,
    })
    setSending(false)
    if (error) {
      console.warn('[FeedbackModal]', error.message, error.code, error.details)
      setErr(t('forms.submit_error'))
    } else {
      setSent(true)
      // Notificación por email (fire-and-forget)
      supabase.functions.invoke('notify-admin', {
        body: { type: 'feedback', payload: { type: form.type, message: form.message.trim(), email: form.email.trim() || null } }
      }).catch(() => {})
    }
  }

  return (
    <div className="fmask" role="dialog" aria-modal="true"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fmodal">
        <button className="fmodal__close" onClick={onClose} aria-label="Cerrar">×</button>

        {sent ? (
          <div className="fmodal__success">
            <span className="fmodal__success-icon" aria-hidden="true">✓</span>
            <h3>{t('forms.feedback_sent_title')}</h3>
            <p className="t-sm">{t('forms.feedback_sent_body')}</p>
            <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ marginTop: 16 }}>
              {t('messaging.close')}
            </button>
          </div>
        ) : (
          <>
            <h2 className="fmodal__title">{t('forms.feedback_title')}</h2>
            <p className="fmodal__hint t-xs">{t('forms.feedback_hint')}</p>

            <div className="fmodal__form">
              <div className="fmodal__row">
                <label className="fmodal__label t-xs">{t('forms.feedback_type_label')}</label>
                <select className="fmodal__select" value={form.type}
                  onChange={e => set('type', e.target.value)}>
                  <option value="idea">{t('forms.feedback_idea')}</option>
                  <option value="bug">{t('forms.feedback_bug')}</option>
                  <option value="praise">{t('forms.feedback_praise')}</option>
                  <option value="other">{t('forms.feedback_other')}</option>
                </select>
              </div>
              <div className="fmodal__row">
                <label className="fmodal__label t-xs">{t('forms.feedback_message_label')}</label>
                <textarea className="fmodal__textarea" rows={5} value={form.message}
                  onChange={e => set('message', e.target.value)}
                  placeholder={t('forms.feedback_message_placeholder')} autoFocus />
              </div>
              <div className="fmodal__row">
                <label className="fmodal__label t-xs">{t('forms.email_optional')}</label>
                <input className="fmodal__input" type="email" value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder={t('forms.email_placeholder')} />
              </div>
            </div>

            {err && <p className="fmodal__error t-xs">{err}</p>}

            <div className="fmodal__footer">
              <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={sending}>
                {t('messaging.cancel')}
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleSubmit}
                disabled={sending || !form.message.trim()}>
                <span>{sending ? t('messaging.sending') : t('forms.submit')}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
