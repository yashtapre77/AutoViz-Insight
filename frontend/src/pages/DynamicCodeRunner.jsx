import React, { useState, useEffect } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react"; // optional spinner icon
import DynamicRenderer from "../components/DynamicRenderer";

export default function DynamicDashboard({ token, requirements, file }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState("");

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
      <div className="flex items-center gap-2 text-indigo-600">
        <Loader2 className="animate-spin" /> Loading dashboard...
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
    <div className="p-4 border rounded-lg shadow-md bg-white">
      <DynamicRenderer code={analysisResult} />

    </div>
  );
}
