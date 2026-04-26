import { useState, useRef, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'

const SUGGESTIONS = [
  { text: 'Goa for 5 days, $1000, beaches & nightlife' },
  { text: '2-day Delhi heritage tour, historical monuments' },
  { text: 'Swiss Alps for 4 days, $3000, scenic & luxury' },
  { text: 'London for 3 days, $1500, museums & architecture' },
]

function TripInput({ onSubmit }) {
  const [query, setQuery] = useState('')
  const textareaRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 160) + 'px'
    }
  }, [query])

  const handleSubmit = () => {
    if (query.trim()) {
      onSubmit(query.trim())
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSuggestion = (text) => {
    setQuery(text)
  }

  return (
    <div className="trip-input-wrapper" id="trip-input">
      <div className="trip-input-card">
        <div className="trip-input-inner">
          <textarea
            ref={textareaRef}
            className="trip-textarea"
            placeholder="Describe your destination, duration, and preferences..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            id="trip-query-input"
          />
          <button
            className="trip-submit-btn"
            onClick={handleSubmit}
            disabled={!query.trim()}
            id="trip-submit-btn"
            aria-label="Generate Plan"
          >
            <ArrowRight size={24} />
          </button>
        </div>
      </div>

      <div className="trip-suggestions stagger-children">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            className="trip-suggestion-chip animate-fade-in-up"
            onClick={() => handleSuggestion(s.text)}
            style={{ animationDelay: `${400 + i * 80}ms` }}
          >
            {s.text}
          </button>
        ))}
      </div>
    </div>
  )
}

export default TripInput
