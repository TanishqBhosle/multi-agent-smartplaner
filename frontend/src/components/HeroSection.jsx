import TripInput from './TripInput'

function HeroSection({ onSubmit, error }) {
  return (
    <section className="hero" id="hero-section">
      <div className="hero-content">
        <div className="hero-tag animate-slide-up">
          <span className="hero-tag-dot" />
          Multi-Agent Intelligence Orchestrator
        </div>

        <h1 className="hero-title animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Smart Travel Planning
          <br />
          <span className="hero-title-accent">Perfected by AI Agents.</span>
        </h1>

        <p className="hero-subtitle animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Our neural graph of specialized agents researches, plans, 
          and budgets your perfect trip with unmatched precision.
        </p>

        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <TripInput onSubmit={onSubmit} />
        </div>

        {error && (
          <div className="error-banner animate-fade-in" id="error-banner">
            {error}
          </div>
        )}
      </div>
    </section>
  )
}

export default HeroSection
