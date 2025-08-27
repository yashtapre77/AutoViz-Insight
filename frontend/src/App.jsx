import { useState } from 'react'
import DashboardCube from './components/DashboardCube'

import { Canvas } from "@react-three/fiber";
import Landing from './pages/Landing';
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Landing/>
    </>
  )
}

export default App
