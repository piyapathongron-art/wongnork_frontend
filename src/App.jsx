import { useEffect } from "react"
import { Toaster } from "sonner"
import AppRouter from "./routes/AppRouter"
import { useThemeStore } from "./stores/themeStore"
import { useGlobalSocket } from "./hooks/useGlobalSocket"

function App() {
  const initTheme = useThemeStore((state) => state.initTheme)
  const isDark = useThemeStore((state) => state.isDark)

  // Initialize global socket connection for notifications
  useGlobalSocket();

  useEffect(() => {
    initTheme()
  }, [])

  return (
    <>
      <Toaster 
        position="top-center" 
        expand={false} 
        richColors 
        theme={isDark ? 'dark' : 'light'}
        toastOptions={{
          style: {
            borderRadius: '1.5rem',
            padding: '16px',
            backdropFilter: 'blur(12px)',
            background: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          },
        }}
      />
      <AppRouter/>
    </>
  )
}

export default App