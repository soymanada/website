// src/components/ServiceRequestModal.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import categories from '../data/categories.json'
import './FormModal.css'

export default function ServiceRequestModal({ onClose }) {
  const { t } = useTranslation()
  const sorted = [...categories].sort((a, b) => a.order - b.order)

  const [form,     setForm]     = useState({ description: '', category: '', city: '', email: '' })
  const [sending,  setSending]  = useState(false)
  const [sent,     setSent]     = useState(false)
  const [err,      setErr]      = useState(null)
  const [honeypot, setHoneypot] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (honeypot) return // bot trap
    if (!form.description.trim()) return
    setSending(true)
    setErr(null)

    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('service_requests').insert({
      user_id:     user?.id ?? null,
      category:    form.category || null,
      description: form.description.trim(),
      city:        form.city.trim() || null,
      email:       form.email.trim() || null,
    })

    setSending(false)
    if (error) {
      console.warn('[ServiceRequestModal]', error.message)
      setErr(t('forms.submit_error'))
    } else {
      setSent(true)
      supabase.functions.invoke('notify-admin', {
        body: { type: 'service_request', payload: { category: form.category || null, description: form.description.trim(), city: form.city.trim() || null, email: form.email.trim() || null } }
      }).catch(() => {})
    }
  }

  return (
    <div className="fmask" role="dialog" aria-modal="true"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fmodal">
        <button className="fmodal__close" onClick={onClose} aria-label={t('messaging.close')}>×</button>

        {sent ? (
          <div className="fmodal__success">
            <span className="fmodal__success-icon" aria-hidden="true">✓</span>
            <h3>{t('forms.request_sent_title')}</h3>
            <p className="t-sm">{t('forms.request_sent_body')}</p>
            <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ marginTop: 16 }}>
              {t('messaging.close')}
            </button>
          </div>
        ) : (
          <>
            <h2 className="fmodal__title">{t('forms.request_title')}</h2>
            <p className="fmodal__hint t-xs">{t('forms.request_hint')}</p>

            <div className="fmodal__form">
              <div className="fmodal__row">
                <label className="fmodal__label t-xs">{t('forms.request_service_label')}</label>
                <textarea
                  className="fmodal__textarea"
                  rows={4}
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder={t('forms.request_service_placeholder')}
                  autoFocus
                  maxLength={500}
                />
              </div>

              <div className="fmodal__row">
                <label className="fmodal__label t-xs">{t('forms.request_category_label')}</label>
                <select className="fmodal__select" value={form.category}
                  onChange={e => set('category', e.target.value)}>
                  <option value="">{t('forms.request_category_placeholder')}</option>
                  {sorted.map(cat => (
                    <option key={cat.slug} value={cat.slug}>
                      {t(`categories.${cat.slug}`, cat.name)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="fmodal__row">
                <label className="fmodal__label t-xs">{t('forms.request_city_label')}</label>
                <input className="fmodal__input" type="text" value={form.city}
                  onChange={e => set('city', e.target.value)}
                  placeholder={t('forms.request_city_placeholder')} maxLength={100} />
              </div>

              <div className="fmodal__row">
                <label className="fmodal__label t-xs">{t('forms.email_optional')}</label>
                <input className="fmodal__input" type="email" value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder={t('forms.email_placeholder')} maxLength={200} />
              </div>
              {/* Honeypot — oculto para humanos, bots lo llenan */}
              <input
                aria-hidden="true" tabIndex={-1} autoComplete="off"
                value={honeypot} onChange={e => setHoneypot(e.target.value)}
                style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
              />
            </div>

            {err && <p className="fmodal__error t-xs">{err}</p>}

            <div className="fmodal__footer">
              <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={sending}>
                {t('messaging.cancel')}
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleSubmit}
                disabled={sending || !form.description.trim()}>
                <span>{sending ? t('messaging.sending') : t('forms.submit')}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
