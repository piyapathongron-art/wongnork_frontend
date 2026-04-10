import { ToastContainer } from "react-toastify"
import AppRouter from "./routes/AppRouter"


function App() {
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