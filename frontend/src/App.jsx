import { useState, useCallback } from 'react'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import FeatureCards from './components/FeatureCards'
import AgentPipeline from './components/AgentPipeline'
import TravelPlan from './components/TravelPlan'

function App() {
  // "idle" | "planning" | "done"
  const [phase, setPhase] = useState('idle')
  const [agents, setAgents] = useState([])
  const [completedAgents, setCompletedAgents] = useState([])
  const [planData, setPlanData] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = useCallback((query) => {
    setPhase('planning')
    setError(null)
    setAgents([])
    setCompletedAgents([])
    setPlanData(null)



    // We need POST for EventSource, but EventSource only supports GET.
    // Instead, use fetch with ReadableStream for SSE.
    fetch('/api/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Server error')

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        function processStream() {
          return reader.read().then(({ done, value }) => {
            if (done) return

            buffer += decoder.decode(value, { stream: true })

            // Parse SSE events from buffer
            const lines = buffer.split('\n')
            buffer = ''

            let currentEvent = null
            let currentData = ''

            for (const line of lines) {
              if (line.startsWith('event:')) {
                currentEvent = line.slice(6).trim()
              } else if (line.startsWith('data:')) {
                currentData = line.slice(5).trim()

                if (currentEvent && currentData) {
                  handleSSEEvent(currentEvent, currentData)
                  currentEvent = null
                  currentData = ''
                }
              } else if (line === '' && currentEvent && currentData) {
                handleSSEEvent(currentEvent, currentData)
                currentEvent = null
                currentData = ''
              }
            }

            return processStream()
          })
        }

        return processStream()
      })
      .catch((err) => {
        setError(err.message || 'Something went wrong')
        setPhase('idle')
      })
  }, [])

  function handleSSEEvent(event, data) {
    try {
      if (event === 'ping') return

      const parsed = JSON.parse(data)

      switch (event) {
        case 'agents':
          setAgents(parsed.agents)
          break
        case 'agent_complete':
          setCompletedAgents((prev) => [...prev, parsed.agent_id])
          break
        case 'plan_complete':
          setPlanData(parsed)
          setPhase('done')
          break
        case 'error':
          setError(parsed.error)
          setPhase('idle')
          break
      }
    } catch (e) {
      // ignore parse errors for keepalive etc
    }
  }

  const handleNewPlan = useCallback(() => {
    setPhase('idle')
    setAgents([])
    setCompletedAgents([])
    setPlanData(null)
    setError(null)
  }, [])

  return (
    <div className="app">
      <div className="app-content">
        <Navbar />

        {phase === 'idle' && (
          <>
            <HeroSection onSubmit={handleSubmit} error={error} />
            <FeatureCards />
          </>
        )}

        {phase === 'planning' && (
          <AgentPipeline
            agents={agents}
            completedAgents={completedAgents}
          />
        )}

        {phase === 'done' && planData && (
          <TravelPlan data={planData} onNewPlan={handleNewPlan} />
        )}

        <footer className="footer">
          Powered by <span>SmartPlan AI</span> — Multi-Agent Intelligence
        </footer>
      </div>
    </div>
  )
}

export default App
