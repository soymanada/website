// src/components/SuggestProviderModal.jsx
// Form for suggesting an existing person/service as a provider on SoyManada.
// Distinct from CategorySuggestionModal (new *categories*) and ServiceRequestModal (*needs*).
//
// Backend: submits via the notify-admin Edge Function (fire-and-forget).
// The payload is emailed to admins. There is NO separate DB table for provider
// suggestions yet — if persistence is needed, add a 'provider_suggestions' table later.
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import categories from '../data/categories.json'
import './FormModal.css'

const EMPTY = {
  suggested_name: '',
  category:       '',
  city:           '',
  description:    '',
  contact:        '',
  suggester_name: '',
  suggester_email:'',
}

export default function SuggestProviderModal({ open, onClose }) {
  const { t } = useTranslation()
  const [form,   setForm]   = useState(EMPTY)
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'success' | 'error'
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.suggested_name.trim()) return
    setStatus('sending')
    try {
      await supabase.functions.invoke('notify-admin', {
        body: {
          type: 'provider_suggestion',
          payload: {
            suggested_name:  form.suggested_name.trim(),
            category:        form.category        || null,
            city:            form.city.trim()     || null,
            description:     form.description.trim() || null,
            contact:         form.contact.trim()  || null,
            suggester_name:  form.suggester_name.trim()  || null,
            suggester_email: form.suggester_email.trim() || null,
          },
        },
      })
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  const handleClose = () => {
    setForm(EMPTY)
    setStatus('idle')
    onClose()
  }

  if (!open) return null

  return (
    <div className="fmodal__overlay" role="dialog" aria-modal="true"
      onClick={e => { if (e.target === e.currentTarget) handleClose() }}>
      <div className="fmodal" style={{ maxWidth: 520 }}>
        <button className="fmodal__close" onClick={handleClose} aria-label="Cerrar">✕</button>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
            <p style={{ fontSize: '2rem', marginBottom: 12 }}>🐾</p>
            <h2 className="fmodal__title">{t('suggest_provider.success_title')}</h2>
            <p className="fmodal__hint">{t('suggest_provider.success_body')}</p>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={handleClose}>
              {t('suggest_provider.close')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 className="fmodal__title">{t('suggest_provider.title')}</h2>
            <p className="fmodal__hint">{t('suggest_provider.subtitle')}</p>

            {/* ── About the suggested provider ── */}
            <div className="fmodal__field">
              <label className="fmodal__label">{t('suggest_provider.name_label')} *</label>
              <input
                className="fmodal__input"
                type="text"
                value={form.suggested_name}
                onChange={e => set('suggested_name', e.target.value)}
                placeholder={t('suggest_provider.name_placeholder')}
                required
              />
            </div>

            <div className="fmodal__field">
              <label className="fmodal__label">{t('suggest_provider.category_label')}</label>
              <select className="fmodal__select" value={form.category}
                onChange={e => set('category', e.target.value)}>
                <option value="">{t('suggest_provider.category_default')}</option>
                {categories.map(c => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="fmodal__field">
              <label className="fmodal__label">{t('suggest_provider.city_label')}</label>
              <input
                className="fmodal__input"
                type="text"
                value={form.city}
                onChange={e => set('city', e.target.value)}
                placeholder={t('suggest_provider.city_placeholder')}
              />
            </div>

            <div className="fmodal__field">
              <label className="fmodal__label">{t('suggest_provider.description_label')}</label>
              <textarea
                className="fmodal__textarea"
                rows={3}
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder={t('suggest_provider.description_placeholder')}
              />
            </div>

            <div className="fmodal__field">
              <label className="fmodal__label">{t('suggest_provider.contact_label')}</label>
              <input
                className="fmodal__input"
                type="text"
                value={form.contact}
                onChange={e => set('contact', e.target.value)}
                placeholder={t('suggest_provider.contact_placeholder')}
              />
            </div>

            {/* ── About the person suggesting ── */}
            <p className="fmodal__section-divider">{t('suggest_provider.your_info_label')}</p>

            <div className="fmodal__row">
              <div className="fmodal__field">
                <label className="fmodal__label">{t('suggest_provider.suggester_name_label')}</label>
                <input
                  className="fmodal__input"
                  type="text"
                  value={form.suggester_name}
                  onChange={e => set('suggester_name', e.target.value)}
                  placeholder={t('suggest_provider.suggester_name_placeholder')}
                />
              </div>
              <div className="fmodal__field">
                <label className="fmodal__label">{t('suggest_provider.email_label')}</label>
                <input
                  className="fmodal__input"
                  type="email"
                  value={form.suggester_email}
                  onChange={e => set('suggester_email', e.target.value)}
                  placeholder={t('suggest_provider.email_placeholder')}
                />
              </div>
            </div>

            {status === 'error' && (
              <p className="fmodal__error">{t('forms.submit_error')}</p>
            )}

            <button className="btn btn-primary btn-full" type="submit"
              disabled={status === 'sending'}>
              <span>{status === 'sending' ? t('forms.sending') : t('suggest_provider.submit')}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
