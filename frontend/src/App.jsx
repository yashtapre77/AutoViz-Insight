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

function App() {


  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path='/analysis' element={<Analysis />} />
      <Route path="/dashboard" element={<DynamicCodeRunner />} />
       {/* <Route path="/temp" element={<Temp />} /> */}
       {/* <Route path="/" element={<AutoVizDashboard/>} /> */}
    </Routes>

  )
}

export default App
