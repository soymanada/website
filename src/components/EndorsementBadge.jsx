import { useEffect, useState } from 'react'
import { getEndorsementsForProvider } from '../lib/endorsements'
import './EndorsementBadge.css'

function dicebearUrl(seed) {
  return `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4`
}

export default function EndorsementBadge({ providerId }) {
  const [endorsements, setEndorsements] = useState([])

  useEffect(() => {
    if (!providerId) return
    getEndorsementsForProvider(providerId)
      .then(setEndorsements)
      .catch(() => {})
  }, [providerId])

  if (!endorsements.length) return null

  const first = endorsements[0]
  const label = first.endorser_category
    ? `${first.endorser_name} (${first.endorser_category})`
    : first.endorser_name

  return (
    <div className="endorsement-badge" title={`Recomendado por ${label}`}>
      <span className="endorsement-badge__icon" aria-hidden="true">⭐</span>
      <span className="endorsement-badge__text">
        <strong>RECOMENDADO</strong> por {label}
      </span>
      {endorsements.length > 1 && (
        <span className="endorsement-badge__more">+{endorsements.length - 1}</span>
      )}
    </div>
  )
}
