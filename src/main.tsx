import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import './index.css'
import Clientes from './pages/clientes.tsx'
import Servicos from './pages/servicos.tsx'
import Agenda from './pages/agenda.tsx'
import Estoque from './pages/estoque.tsx'
import Lancamentos from './pages/lancamentos.tsx'
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar.tsx'
import { AppSidebar } from './components/app-sidebar.tsx'
import { ThemeProvider } from './components/theme-provider.tsx'
import { Toaster } from 'sonner'


ReactDOM.createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <StrictMode>
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/servicos" element={<Servicos />} />
            <Route path="/" element={<Agenda />} />
            <Route path="/estoque" element={<Estoque />} />
            <Route path="/lancamentos" element={<Lancamentos />} />
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </StrictMode>
  </ThemeProvider>
)
