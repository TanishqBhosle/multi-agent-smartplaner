import { useMemo } from 'react'
import { Search, Globe, ClipboardList, CheckCircle, Loader2, Sparkles, DollarSign } from 'lucide-react'

const DEFAULT_AGENTS = [
  { id: 'preference_analyzer', name: 'Context Engine', description: 'Analyzing parameters...', icon: <Search size={18} /> },
  { id: 'researcher', name: 'Global Research', description: 'Sourcing attractions...', icon: <Globe size={18} /> },
  { id: 'itinerary_planner', name: 'Logistics Planner', description: 'Structuring days...', icon: <ClipboardList size={18} /> },
  { id: 'budget_advisor', name: 'Budget Consultant', description: 'Calculating costs...', icon: <DollarSign size={18} /> },
  { id: 'final_responder', name: 'Final Synthesis', description: 'Generating dossier...', icon: <Sparkles size={18} /> },
]

function AgentPipeline({ agents, completedAgents }) {
  const agentList = agents.length > 0 ? agents : DEFAULT_AGENTS

  const activeIndex = useMemo(() => {
    if (completedAgents.length === agentList.length) return -1
    return completedAgents.length
  }, [completedAgents, agentList])

  return (
    <div className="pipeline-overlay animate-fade-in" id="pipeline-overlay">
      <div className="pipeline-container">
        <div className="pipeline-card animate-scale-in">
          <div className="pipeline-header">
            <h2 className="hero-title-accent">Neural Graph Active</h2>
            <p>Orchestrating specialized agents for your request</p>
          </div>

          <div className="pipeline-steps">
            {agentList.map((agent, index) => {
              const isCompleted = completedAgents.includes(agent.id)
              const isActive = index === activeIndex
              const isPending = !isCompleted && !isActive

              let stepClass = 'pipeline-step'
              if (isCompleted) stepClass += ' completed'
              else if (isActive) stepClass += ' active'
              else stepClass += ' pending'

              return (
                <div key={agent.id} className={`${stepClass} animate-slide-up`} style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="pipeline-step-icon">
                    {isCompleted ? <CheckCircle size={20} color="#10b981" /> : agent.icon}
                  </div>
                  <div className="pipeline-step-content">
                    <div className="pipeline-step-name">{agent.name}</div>
                    <div className="pipeline-step-desc">{agent.description}</div>
                  </div>
                  <div className="pipeline-step-status">
                    {isCompleted && <span style={{ color: '#10b981' }}>Done</span>}
                    {isActive && (
                      <span className="status-working" style={{ color: '#6366f1', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Loader2 size={14} className="animate-spin" />
                        Active
                      </span>
                    )}
                    {isPending && <span style={{ opacity: 0.5 }}>Queued</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AgentPipeline
