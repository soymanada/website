// src/components/Testimonials.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import './Testimonials.css'

function Stars({ rating }) {
  return (
    <span className="tst__stars" aria-label={`${rating} de 5`}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  )
}

export default function Testimonials() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('reviews')
      .select('id, rating, comment, created_at')
      .eq('status', 'published')
      .not('comment', 'is', null)
      .neq('comment', '')
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        setReviews(data ?? [])
        setLoading(false)
      })
  }, [])

  if (loading || reviews.length === 0) return null

  return (
    <section className="tst">
      <div className="container">
        <p className="tst__eyebrow">🐾 La Manada habla</p>
        <h2 className="tst__title">Lo que dice nuestra comunidad</h2>
        <div className="tst__track">
          {reviews.map(r => (
            <article key={r.id} className="tst__card">
              <p className="tst__text">"{r.comment}"</p>
              <footer className="tst__footer">
                <span className="tst__paw" aria-hidden="true">🐾</span>
                <div>
                  <Stars rating={r.rating} />
                  <span className="tst__city">
                    {new Date(r.created_at).toLocaleDateString('es-CL', { year: 'numeric', month: 'long' })}
                  </span>
                </div>
              </footer>
            </article>
          ))}
        </div>
        <div className="tst__dots" aria-hidden="true">
          {reviews.map((_, i) => <span key={i} className="tst__dot" />)}
        </div>
      </div>
    </section>
  )
}
