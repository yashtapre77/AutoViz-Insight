import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import { Routes, Route } from 'react-router-dom';
import Analysis from './pages/Analysis';
import AutoVizDashboard from './pages/temp';
import DynamicCodeRunner from "./pages/DynamicCodeRunner";
// import sampleFile from './assets/1_dummy_sales.csv';
import sampleFile from './assets/1_dummy_sales.csv';
import { useEffect, useState } from 'react';
import Temp from './components/DynamicRenderer'

const loadFile = async () => {
  const response = await fetch(sampleFile);
  const blob = await response.blob();
  return new File([blob], "1_dummy_sales.csv", { type: "text/csv" });
};


function App() {

  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidHlwZSI6ImFjY2VzcyIsImlhdCI6MTc2MTk2MDI0OCwiZXhwIjoxNzYxOTYyMDQ4fQ.zZvh7_u50H-hC8IfxIF2eWdLeHwJ6REaqPOiG-dV6GI";
  const requirements = "I want to analyze how sales performance varies across regions and products, and see if discounts affect profitability.";

  const [file, setFile] = useState(null);
  // then inside useEffect:
  useEffect(() => {
    loadFile().then(setFile);
  }, []);


  return (
    <Routes>
      <Route path="/" element={<AutoVizDashboard/>} />
      <Route path="/temp" element={<Temp />} />
      <Route path="/dashboard" element={<DynamicCodeRunner
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
