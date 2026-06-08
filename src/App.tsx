import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Index from './pages/home/Index'
import NotFound from './pages/not-found/Index'

const queryClient = new QueryClient()

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="min-h-screen flex justify-center" style={{ background: '#020208' }}>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App
