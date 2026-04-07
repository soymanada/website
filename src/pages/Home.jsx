import { useEffect } from 'react'
import Hero           from '../components/Hero'
import StatsSection    from '../components/StatsSection'
import ValueProps      from '../components/ValueProps'
import CategoryGrid    from '../components/CategoryGrid'
import HowItWorks      from '../components/HowItWorks'
import FounderSection  from '../components/FounderSection'
import TrustBadge      from '../components/TrustBadge'
import CTASection      from '../components/CTASection'
import Testimonials    from '../components/Testimonials'

const DEFAULT_TITLE = 'SoyManada – Directorio para la comunidad migrante'

export default function Home() {
  useEffect(() => {
    document.title = 'SoyManada – Directorio de servicios para migrantes en Canadá'
    return () => { document.title = DEFAULT_TITLE }
  }, [])

  return (
    <main>
      <Hero />
      <StatsSection />
      <ValueProps />
      <CategoryGrid />
      <HowItWorks />
      <Testimonials />
      <FounderSection />
      <TrustBadge />
      <CTASection />
    </main>
  )
}
