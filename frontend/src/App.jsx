import { useState } from 'react'
import DashboardCube from './components/DashboardCube'

import { Canvas } from "@react-three/fiber";
import Landing from './pages/Landing';
import Login from './pages/Login';
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* <Landing/> */}
      <Login/>
    </>
  )
}

export default App
