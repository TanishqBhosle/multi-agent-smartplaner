import { Search, Globe, Calendar, Sparkles } from 'lucide-react'

const FEATURES = [
  {
    icon: <Search size={24} />,
    iconClass: '',
    title: 'Context Engine',
    description:
      'Our AI analyzes your unique travel style, budget, and constraints to establish a precise planning framework.',
  },
  {
    icon: <Globe size={24} />,
    iconClass: 'research',
    title: 'Global Research',
    description:
      'Accessing a vast database of global destinations to identify attractions and experiences tailored to your profile.',
  },
  {
    icon: <Calendar size={24} />,
    iconClass: 'itinerary',
    title: 'Logistics Planner',
    description:
      'Structuring a balanced day-by-day itinerary that optimizes transit times and ensures a seamless experience.',
  },
  {
    icon: <Sparkles size={24} />,
    iconClass: 'responder',
    title: 'Final Synthesis',
    description:
      'Consolidating research and logistics into a professional travel dossier ready for immediate use.',
  },
]

function FeatureCards() {
  return (
    <section className="features-section" id="features">
      <p className="features-label animate-fade-in-up">The Intelligence Layer</p>
      <h2 className="features-heading animate-fade-in-up">
        Coordinated Multi-Agent Orchestration
      </h2>

      <div className="features-grid stagger-children">
        {FEATURES.map((f, i) => (
          <div
            key={i}
            className="glass-card feature-card animate-fade-in-up"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            <div className={`feature-icon ${f.iconClass}`}>{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default FeatureCards
