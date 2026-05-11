// src/components/dashboard/SectionDocumentos.jsx
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import './SectionDocumentos.css'

const MAX_SIZE_MB  = 20
const MAX_MANUALS  = 20
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

function fileIcon(type) {
  if (type === 'pdf')  return '📄'
  if (type === 'docx') return '📝'
  return '📃'
}

function fmtSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fileType(file) {
  if (file.name.endsWith('.pdf'))  return 'pdf'
  if (file.name.endsWith('.docx')) return 'docx'
  return 'doc'
}

export default function SectionDocumentos({ provider }) {
  const [manuals,   setManuals]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleting,  setDeleting]  = useState(null)
  const [error,     setError]     = useState('')
  const [success,   setSuccess]   = useState('')

  // upload form
  const [file,        setFile]        = useState(null)
  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const fileRef = useRef(null)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('provider_manuals')
      .select('*')
      .eq('provider_id', provider.id)
      .order('created_at', { ascending: false })
    setManuals(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [provider.id])

  const notify = (msg, isError = false) => {
    if (isError) setError(msg)
    else setSuccess(msg)
    setTimeout(() => { setError(''); setSuccess('') }, 4000)
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    setError('')
    if (!file)  return notify('Selecciona un archivo.', true)
    if (!title.trim()) return notify('Escribe un título.', true)
    if (!ALLOWED_TYPES.includes(file.type)) return notify('Solo se aceptan PDF o Word (.docx, .doc).', true)
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return notify(`El archivo supera los ${MAX_SIZE_MB} MB.`, true)
    if (manuals.length >= MAX_MANUALS) return notify(`Máximo ${MAX_MANUALS} manuales permitidos.`, true)

    setUploading(true)
    const uniqueName = `${crypto.randomUUID()}_${file.name}`
    const filePath   = `${provider.id}/${uniqueName}`

    const { error: uploadErr } = await supabase.storage
      .from('provider-manuals')
      .upload(filePath, file, { contentType: file.type })

    if (uploadErr) {
      setUploading(false)
      return notify('Error al subir el archivo: ' + uploadErr.message, true)
    }

    const { error: insertErr } = await supabase.from('provider_manuals').insert({
      provider_id: provider.id,
      title:       title.trim(),
      description: description.trim() || null,
      file_path:   filePath,
      file_name:   file.name,
      file_type:   fileType(file),
      file_size:   file.size,
      visible:     true,
    })

    if (insertErr) {
      // rollback storage
      await supabase.storage.from('provider-manuals').remove([filePath])
      setUploading(false)
      return notify('Error al guardar: ' + insertErr.message, true)
    }

    setFile(null)
    setTitle('')
    setDescription('')
    if (fileRef.current) fileRef.current.value = ''
    setUploading(false)
    notify('✓ Manual subido correctamente.')
    load()
  }

  const handleDelete = async (manual) => {
    if (!window.confirm(`¿Eliminar "${manual.title}"? Esta acción no se puede deshacer.`)) return
    setDeleting(manual.id)
    await supabase.storage.from('provider-manuals').remove([manual.file_path])
    await supabase.from('provider_manuals').delete().eq('id', manual.id)
    setDeleting(null)
    notify('Manual eliminado.')
    load()
  }

  const toggleVisible = async (manual) => {
    await supabase.from('provider_manuals')
      .update({ visible: !manual.visible })
      .eq('id', manual.id)
    load()
  }

  const getPublicUrl = (path) =>
    supabase.storage.from('provider-manuals').getPublicUrl(path).data.publicUrl

  return (
    <div className="sdoc">
      <h2 className="pdash__section-title d-md">📚 Documentos y manuales</h2>
      <p className="sdoc__subtitle t-sm">
        Sube guías, manuales o recursos que quieras compartir con tus clientes. (PDF o Word, máx. {MAX_SIZE_MB} MB)
      </p>

      {/* Mensajes */}
      {error   && <div className="sdoc__msg sdoc__msg--error">{error}</div>}
      {success && <div className="sdoc__msg sdoc__msg--ok">{success}</div>}

      {/* Upload form */}
      <form className="sdoc__form" onSubmit={handleUpload}>
        <h3 className="sdoc__form-title">Subir nuevo documento</h3>

        <label className="sdoc__label">
          Título <span className="sdoc__req">*</span>
          <input
            className="sdoc__input"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ej: Guía de bienvenida"
            maxLength={120}
          />
        </label>

        <label className="sdoc__label">
          Descripción (opcional)
          <textarea
            className="sdoc__textarea"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Breve descripción del contenido…"
            maxLength={500}
            rows={2}
          />
        </label>

        <label className="sdoc__label">
          Archivo <span className="sdoc__req">*</span>
          <input
            ref={fileRef}
            className="sdoc__file"
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={e => setFile(e.target.files[0] ?? null)}
          />
          {file && (
            <span className="sdoc__file-hint t-xs">
              {fileIcon(fileType(file))} {file.name} — {fmtSize(file.size)}
            </span>
          )}
        </label>

        <button className="btn btn-primary sdoc__submit" disabled={uploading}>
          {uploading ? 'Subiendo…' : '↑ Subir documento'}
        </button>
      </form>

      {/* List */}
      <div className="sdoc__list">
        <div className="sdoc__list-header t-xs">
          {manuals.length} / {MAX_MANUALS} documentos
        </div>

        {loading ? (
          <p className="sdoc__empty">Cargando…</p>
        ) : manuals.length === 0 ? (
          <p className="sdoc__empty">Aún no has subido ningún documento.</p>
        ) : (
          manuals.map(m => (
            <div key={m.id} className={`sdoc__item${m.visible ? '' : ' sdoc__item--hidden'}`}>
              <span className="sdoc__item-icon">{fileIcon(m.file_type)}</span>
              <div className="sdoc__item-body">
                <strong className="sdoc__item-title">{m.title}</strong>
                {m.description && <p className="sdoc__item-desc t-xs">{m.description}</p>}
                <span className="sdoc__item-meta t-xs">
                  {m.file_name} · {fmtSize(m.file_size)}
                  {!m.visible && <span className="sdoc__badge-hidden">Oculto</span>}
                </span>
              </div>
              <div className="sdoc__item-actions">
                <a
                  href={getPublicUrl(m.file_path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sdoc__btn sdoc__btn--view"
                >
                  Ver
                </a>
                <button
                  className="sdoc__btn sdoc__btn--toggle"
                  onClick={() => toggleVisible(m)}
                  title={m.visible ? 'Ocultar del perfil público' : 'Mostrar en perfil público'}
                >
                  {m.visible ? '👁 Visible' : '🚫 Oculto'}
                </button>
                <button
                  className="sdoc__btn sdoc__btn--delete"
                  disabled={deleting === m.id}
                  onClick={() => handleDelete(m)}
                >
                  {deleting === m.id ? '…' : 'Eliminar'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
