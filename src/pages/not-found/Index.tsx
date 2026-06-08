// @section: odin-not-found
import { Link } from 'react-router-dom'
import { Shield, AlertTriangle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="dark min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-xl border border-destructive/50 bg-destructive/10 flex items-center justify-center"
            style={{ boxShadow: '0 0 24px -6px var(--destructive)' }}>
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
        </div>
        <div>
          <p className="text-5xl font-bold font-mono text-destructive tracking-widest"
            style={{ textShadow: '0 0 20px var(--destructive)' }}>
            404
          </p>
          <p className="text-sm font-mono text-muted-foreground mt-2 tracking-widest uppercase">
            [ ACCESS DENIED — Route Not Found ]
          </p>
        </div>
        <Link to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-primary/50 bg-primary/10 text-primary text-sm font-mono hover:bg-primary/20 transition-colors">
          <Shield className="w-4 h-4" />
          ODIN 홈으로 귀환
        </Link>
      </div>
    </div>
  )
}
