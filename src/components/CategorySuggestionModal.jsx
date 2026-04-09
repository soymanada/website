// src/components/CategorySuggestionModal.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import './FormModal.css'

// TODO backend: create table category_suggestions (
//   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   created_at timestamptz DEFAULT now(),
//   role text CHECK (role IN ('migrant','provider')),
//   name text,
//   city text,
//   message text NOT NULL,
//   email text
// );
// RLS: INSERT open to authenticated users, SELECT restricted to admin.

export default function CategorySuggestionModal({ onClose }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ role: '', name: '', city: '', message: '', email: '' })
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [err,     setErr]     = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.message.trim()) return
    setSending(true)
    setErr(null)
    const { error } = await supabase.from('category_suggestions').insert({
      role:    form.role    || null,
      name:    form.name.trim()    || null,
      city:    form.city.trim()    || null,
      message: form.message.trim(),
      email:   form.email.trim()   || null,
    })
    setSending(false)
    if (error) {
      console.warn('[CategorySuggestion]', error.message)
      setErr(t('forms.submit_error'))
    } else {
      setSent(true)
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
            <h3>{t('forms.suggest_sent_title')}</h3>
            <p className="t-sm">{t('forms.suggest_sent_body')}</p>
            <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ marginTop: 16 }}>
              {t('messaging.close')}
            </button>
          </div>
        ) : (
          <>
            <h2 className="fmodal__title">{t('forms.suggest_title')}</h2>
            <p className="fmodal__hint t-xs">{t('forms.suggest_hint')}</p>

            <div className="fmodal__form">
              <div className="fmodal__row">
                <label className="fmodal__label t-xs">{t('forms.role_label')}</label>
                <select className="fmodal__select" value={form.role}
                  onChange={e => set('role', e.target.value)}>
                  <option value="">{t('forms.role_placeholder')}</option>
                  <option value="migrant">{t('forms.role_migrant')}</option>
                  <option value="provider">{t('forms.role_provider')}</option>
                </select>
              </div>
              <div className="fmodal__row">
                <label className="fmodal__label t-xs">{t('forms.name_label')}</label>
                <input className="fmodal__input" type="text" value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder={t('forms.name_placeholder')} />
              </div>
              <div className="fmodal__row">
                <label className="fmodal__label t-xs">{t('forms.city_label')}</label>
                <input className="fmodal__input" type="text" value={form.city}
                  onChange={e => set('city', e.target.value)}
                  placeholder={t('forms.city_placeholder')} />
              </div>
              <div className="fmodal__row">
                <label className="fmodal__label t-xs">{t('forms.suggest_message_label')}</label>
                <textarea className="fmodal__textarea" rows={4} value={form.message}
                  onChange={e => set('message', e.target.value)}
                  placeholder={t('forms.suggest_message_placeholder')} />
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
