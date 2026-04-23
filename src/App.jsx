import { useEffect } from "react"
import { ToastContainer } from "react-toastify"
import AppRouter from "./routes/AppRouter"
import { useThemeStore } from "./stores/themeStore"


function App() {
  const initTheme = useThemeStore((state) => state.initTheme)

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