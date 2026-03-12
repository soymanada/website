import './ValueProps.css'

const items = [
  { icon: '🤝', title: 'De la comunidad, para la comunidad', body: 'Cada proveedor fue recomendado o validado por miembros reales de la Manada. No listamos a desconocidos.' },
  { icon: '⚡', title: 'Contacto directo. Sin fricción.', body: 'Un clic en WhatsApp y hablas directamente con quien puede ayudarte. Sin formularios, sin esperas.' },
  { icon: '🔍', title: 'Organizado por fin', body: 'Categorías claras, tarjetas limpias. Sin ruido de grupo de WhatsApp. Encuéntrate en segundos.' },
]

export default function ValueProps() {
  return (
    <section className="vp section">
      <div className="container">
        <div className="vp__header">
          <p className="eyebrow">¿Por qué SoyManada?</p>
          <h2 className="d-xl vp__title">
            La información que buscas,<br />
            <em>ordenada por fin.</em>
          </h2>
          <p className="t-lg vp__lead">
            Los grupos de WhatsApp son un caos. Aquí todo está verificado y listo para cuando lo necesitas.
          </p>
        </div>

        <div className="vp__grid">
          {items.map((item, i) => (
            <div key={i} className="vp-card">
              <div className="vp-card__icon" aria-hidden="true">{item.icon}</div>
              <h3 className="d-md vp-card__title">{item.title}</h3>
              <p className="t-md vp-card__body">{item.body}</p>
              <div className="vp-card__line" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
