import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  FileText,
  Calendar,
  DollarSign,
  MapPin,
  Heart,
  RefreshCw,
  Sparkles
} from 'lucide-react'

const TABS = [
  { id: 'full', label: 'Full Dossier', icon: <FileText size={18} /> },
  { id: 'itinerary', label: 'Day-by-Day', icon: <Calendar size={18} /> },
  { id: 'budget', label: 'Budget Analysis', icon: <DollarSign size={18} /> },
  { id: 'attractions', label: 'Highlights', icon: <MapPin size={18} /> },
]

function TravelPlan({ data, onNewPlan }) {
  const [activeTab, setActiveTab] = useState('full')

  const getContent = () => {
    switch (activeTab) {
      case 'full':
        return data.final_plan || 'No plan available.'
      case 'itinerary':
        return data.itinerary || 'No itinerary data.'
      case 'budget':
        return data.budget_breakdown || 'No budget data.'
      case 'attractions':
        return data.attractions || 'No attractions data.'
      default:
        return data.final_plan
    }
  }

  return (
    <section className="plan-section animate-slide-up" id="travel-plan">
      <div className="plan-header">
        <h1 className="hero-title-accent" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <Sparkles size={32} />
          Your Intelligent Travel Dossier
        </h1>
        <div className="plan-header-meta">
          {data.destination && (
            <div className="plan-meta-item">
              <MapPin size={18} color="#6366f1" />
              <span>{data.destination}</span>
            </div>
          )}
          {data.num_days > 0 && (
            <div className="plan-meta-item">
              <Calendar size={18} color="#6366f1" />
              <span>{data.num_days} {data.num_days === 1 ? 'Day' : 'Days'}</span>
            </div>
          )}
          {data.budget && (
            <div className="plan-meta-item">
              <DollarSign size={18} color="#6366f1" />
              <span>{data.budget} Budget</span>
            </div>
          )}
          {data.preferences && data.preferences.length > 0 && (
            <div className="plan-meta-item">
              <Heart size={18} color="#ef4444" />
              <span>Tailored Preferences</span>
            </div>
          )}
        </div>
      </div>

      <div className="plan-tabs" id="plan-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`plan-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            id={`tab-${tab.id}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="plan-content-card" id="plan-content">
        <div className="plan-markdown animate-fade-in" key={activeTab}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {getContent()}
          </ReactMarkdown>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button className="new-plan-btn" onClick={onNewPlan} id="new-plan-btn">
          <RefreshCw size={18} />
          Create Another Masterpiece
        </button>
      </div>
    </section>
  )
}

export default TravelPlan
