import { Plane } from 'lucide-react'

function Navbar() {
  return (
    <nav className="navbar" id="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">
          <Plane size={20} color="white" strokeWidth={3} />
        </div>
        <span className="navbar-title">SmartPlan AI</span>
      </div>
      <div className="navbar-badge">Multi-Agent Intelligence</div>
    </nav>
  )
}

export default Navbar
