import Hero           from '../components/Hero'
import AuthBanner     from '../components/AuthBanner'
import StatsSection    from '../components/StatsSection'
import ValueProps      from '../components/ValueProps'
import CategoryGrid    from '../components/CategoryGrid'
import ManadaStories   from '../components/ManadaStories'
import HowItWorks      from '../components/HowItWorks'
import FounderSection  from '../components/FounderSection'
import TrustBadge      from '../components/TrustBadge'
import CTASection      from '../components/CTASection'
import Testimonials    from '../components/Testimonials'

export default function Home() {
  return (
    <main>
      <Hero />
      <AuthBanner />
      <StatsSection />
      <ValueProps />
      <CategoryGrid />
      <ManadaStories />
      <HowItWorks />
      <Testimonials />
      <FounderSection />
      <TrustBadge />
      <CTASection />
    </main>
  )
}
