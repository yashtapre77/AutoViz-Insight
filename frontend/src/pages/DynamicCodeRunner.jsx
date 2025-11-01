import React, { useState, useEffect } from "react";
import axios from "axios";
import DynamicRenderer from "../components/DynamicRenderer";
import { useNavigate, useLocation } from "react-router-dom";

export default function DynamicDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { token, requirements, file } = location.state || {};

  const handleBack = () => {
    navigate("/analysis"); // ✅ replace with your desired route
  };

  const handlePrint = () => {
    window.print(); // ✅ prints the full current page
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("requirements", requirements);
        if (file) formData.append("file", file);

        const { data } = await axios.post(
          "http://127.0.0.1:8000/api/analysis/dashboard",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Backend response:", data);

        const dashboardCode = data.dashboard_code ;
        if (!dashboardCode) throw new Error("Missing dashboard code from backend");

        // ✅ Store code in state
        setAnalysisResult(dashboardCode);
        
      } catch (err) {
        console.error("Error fetching dashboard:", err.response?.data ?? err);
        // setError(err.response?.data?.detail ?? err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [file]);

  if (loading)
     return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-lg text-gray-700">Loading dashboard data...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="text-red-600 bg-red-50 p-4 rounded-md">
        Error: {error}
      </div>
    );

  // ✅ Render the dashboard dynamically
  return (
    
    <div className="">
      <DynamicRenderer code={analysisResult} isReady={true} />

    </div>
  );
}
