import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import { Routes, Route } from 'react-router-dom';
import Analysis from './pages/Analysis';
import AutoVizDashboard from './pages/temp';

function App() {

  return (
    <Routes>
      <Route path="/" element={<AutoVizDashboard/>} />
      {/* <Route path="/" element={<Landing />} /> */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path='/analysis' element={<Analysis />} />
    </Routes>

  )
}

export default App
