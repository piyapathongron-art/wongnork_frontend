import { useEffect } from "react"
import { ToastContainer } from "react-toastify"
import AppRouter from "./routes/AppRouter"
import { useThemeStore } from "./stores/themeStore"
import { useGlobalSocket } from "./hooks/useGlobalSocket"

function App() {
  const initTheme = useThemeStore((state) => state.initTheme)

  // Initialize global socket connection for notifications
  useGlobalSocket();

  useEffect(() => {
    initTheme()
  }, [])

  return (
    <>
    <ToastContainer
    hideProgressBar
    />
    <AppRouter/>
    </>
  )
}

export default App