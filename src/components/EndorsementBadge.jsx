import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getEndorsementsForProvider } from '../lib/endorsements'
import './EndorsementBadge.css'

function dicebearUrl(seed) {
  return `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4`
}

export default function EndorsementBadge({ providerId }) {
  const { t } = useTranslation()
  const [endorsements, setEndorsements] = useState([])

  useEffect(() => {
    if (!providerId) return
    getEndorsementsForProvider(providerId)
      .then(setEndorsements)
      .catch(() => {})
  }, [providerId])

  if (!endorsements.length) return null

  const first = endorsements[0]

  // Translate category slug → readable name, fallback to slug if key missing
  const categoryName = first.endorser_category
    ? t(`categories.${first.endorser_category}`, { defaultValue: first.endorser_category })
    : null

  const label = categoryName
    ? `${first.endorser_name} (${categoryName})`
    : first.endorser_name

  return (
    <div className="endorsement-badge" title={`Recomendado por ${label}`}>
      <img
        className="endorsement-badge__avatar"
        src={first.endorser_avatar || dicebearUrl(first.endorser_name)}
        alt={first.endorser_name}
        width={18}
        height={18}
        loading="lazy"
      />
      <span className="endorsement-badge__text">
        Recomendado por <strong>{label}</strong>
      </span>
      {endorsements.length > 1 && (
        <span className="endorsement-badge__more">+{endorsements.length - 1}</span>
      )}
    </div>
  )
}
