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

  return (
    <div className="endorsement-badge" title={`Recomendado por ${first.endorser_name}`}>
      <img
        className="endorsement-badge__avatar"
        src={first.endorser_avatar || dicebearUrl(first.endorser_name)}
        alt={first.endorser_name}
        width={20}
        height={20}
        loading="lazy"
      />
      <span className="endorsement-badge__text">
        Recomendado por <strong>{first.endorser_name}</strong>
      </span>
      {endorsements.length > 1 && (
        <span className="endorsement-badge__more">+{endorsements.length - 1}</span>
      )}
    </div>
  )
}
