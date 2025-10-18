import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import { Routes, Route } from 'react-router-dom';
import Analysis from './pages/Analysis';
import AutoVizDashboard from './pages/temp';
import DynamicRenderer from "./pages/DynamicCodeRunner";

function App() {

  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidHlwZSI6ImFjY2VzcyIsImlhdCI6MTc2MDcwNDc1NywiZXhwIjoxNzYwNzA2NTU3fQ.-hArVL2XfJ0j2ej-SHFz4c2-aeomv2YB36Mx6NpAErc";
  const requirements = "I want to analyze how sales performance varies across regions and products, and see if discounts affect profitability.";
  const file = new File(["dummy content"], "dummy_sales.csv");

  return (
    <Routes>
      <Route path="/" element={<AutoVizDashboard/>} />
      <Route path="/dashboard" element={<DynamicRenderer
       token={token}
              requirements={requirements}
              file={file} />} />
      {/* <Route path="/" element={<Landing />} /> */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path='/analysis' element={<Analysis />} />
    </Routes>

  )
}

export default App
