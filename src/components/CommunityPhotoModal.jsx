// src/components/CommunityPhotoModal.jsx
// Lets authenticated users submit a photo for community gallery review.
// Upload goes to Supabase Storage 'community-photos' bucket.
// A record is inserted into community_photos (status: 'pending').
// notify-admin is called so admin gets an email with the submission.
import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import './CommunityPhotoModal.css'

const MAX_SIZE_MB = 5
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function CommunityPhotoModal({ open, onClose, userId }) {
  const { t } = useTranslation()
  const fileRef  = useRef(null)

  const [file,    setFile]    = useState(null)
  const [preview, setPreview] = useState(null)
  const [caption, setCaption] = useState('')
  const [city,    setCity]    = useState('')
  const [name,    setName]    = useState('')
  const [status,  setStatus]  = useState('idle') // idle | uploading | success | error
  const [errMsg,  setErrMsg]  = useState('')

  const handleFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!ALLOWED_TYPES.includes(f.type)) {
      setErrMsg(t('community_photos.error_type'))
      return
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrMsg(t('community_photos.error_size'))
      return
    }
    setErrMsg('')
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file || !caption.trim()) return
    setStatus('uploading')
    setErrMsg('')

    try {
      // 1. Upload to Storage
      const ext  = file.name.split('.').pop()
      const path = `${userId ?? 'anon'}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('community-photos')
        .upload(path, file, { contentType: file.type, upsert: false })
      if (upErr) throw upErr

      const { data: urlData } = supabase.storage
        .from('community-photos')
        .getPublicUrl(path)
      const publicUrl = urlData.publicUrl

      // 2. Insert pending record
      const { error: dbErr } = await supabase
        .from('community_photos')
        .insert({
          user_id:        userId ?? null,
          storage_path:   path,
          public_url:     publicUrl,
          caption:        caption.trim(),
          city:           city.trim() || null,
          submitter_name: name.trim() || null,
        })
      if (dbErr) throw dbErr

      // 3. Notify admin (fire-and-forget)
      supabase.functions.invoke('notify-admin', {
        body: {
          type: 'community_photo',
          payload: {
            public_url:     publicUrl,
            caption:        caption.trim(),
            city:           city.trim() || null,
            submitter_name: name.trim() || null,
          },
        },
      }).catch(() => {})

      setStatus('success')
    } catch {
      setStatus('error')
      setErrMsg(t('community_photos.error_upload'))
    }
  }

  const handleClose = () => {
    setFile(null)
    setPreview(null)
    setCaption('')
    setCity('')
    setName('')
    setStatus('idle')
    setErrMsg('')
    onClose()
  }

  if (!open) return null

  return (
    <div className="cpmodal__overlay" role="dialog" aria-modal="true"
      onClick={e => { if (e.target === e.currentTarget) handleClose() }}>
      <div className="cpmodal">
        <button className="cpmodal__close" onClick={handleClose} aria-label="Cerrar">✕</button>

        {status === 'success' ? (
          <div className="cpmodal__success">
            <p className="cpmodal__success-icon" aria-hidden="true">📸</p>
            <h2 className="cpmodal__title">{t('community_photos.success_title')}</h2>
            <p className="cpmodal__hint">{t('community_photos.success_body')}</p>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={handleClose}>
              {t('community_photos.close')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 className="cpmodal__title">{t('community_photos.modal_title')}</h2>
            <p className="cpmodal__hint">{t('community_photos.subtitle')}</p>

            {/* Photo picker */}
            <div className="cpmodal__field">
              <label className="cpmodal__label">{t('community_photos.photo_label')} *</label>
              <div
                className={`cpmodal__dropzone${preview ? ' cpmodal__dropzone--has-preview' : ''}`}
                onClick={() => fileRef.current?.click()}
              >
                {preview ? (
                  <img src={preview} alt="preview" className="cpmodal__preview" />
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32" className="cpmodal__upload-icon" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span className="cpmodal__upload-text">{t('community_photos.photo_placeholder')}</span>
                  </>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleFile}
              />
            </div>

            <div className="cpmodal__field">
              <label className="cpmodal__label">{t('community_photos.caption_label')} *</label>
              <input
                className="cpmodal__input"
                type="text"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder={t('community_photos.caption_placeholder')}
                maxLength={120}
                required
              />
            </div>

            <div className="cpmodal__row">
              <div className="cpmodal__field">
                <label className="cpmodal__label">{t('community_photos.city_label')}</label>
                <input
                  className="cpmodal__input"
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder={t('community_photos.city_placeholder')}
                />
              </div>
              <div className="cpmodal__field">
                <label className="cpmodal__label">{t('community_photos.name_label')}</label>
                <input
                  className="cpmodal__input"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t('community_photos.name_placeholder')}
                />
              </div>
            </div>

            {errMsg && <p className="cpmodal__error">{errMsg}</p>}

            <button
              className="btn btn-primary btn-full"
              type="submit"
              disabled={status === 'uploading' || !file || !caption.trim()}
            >
              <span>{status === 'uploading' ? t('forms.sending') : t('community_photos.submit')}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
