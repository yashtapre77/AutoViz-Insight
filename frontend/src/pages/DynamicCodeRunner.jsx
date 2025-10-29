import React, { useState, useEffect } from "react";
import axios from "axios";
import * as Recharts from "recharts";
import * as Lucide from "lucide-react";
import { Loader2 } from "lucide-react";

// ✅ make React, Recharts, Lucide available globally
window.React = React;
window.Recharts = Recharts;
window.Lucide = Lucide;

export default function DynamicDashboard({ token, requirements, file }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [Component, setComponent] = useState(null);

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

      if (!data.dashboard_code) throw new Error("Missing dashboard_code");

      // convert returned JS to a blob module
      const blob = new Blob([data.dashboard_code], {
        type: "application/javascript",
      });
      const url = URL.createObjectURL(blob);

      // dynamically import as a module
      const module = await import(/* @vite-ignore */ url);
      URL.revokeObjectURL(url);

      if (!module.default) throw new Error("No default export found");
      setComponent(() => module.default);
    } catch (err) {
      console.error(err.response?.data ?? err);
      setError(err.response?.data?.detail ?? err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (file || !requirements.includes("file_required")) fetchDashboard();
  }, [file]);

  if (loading)
    return (
      <div className="flex items-center gap-2 text-indigo-600">
        <Loader2 className="animate-spin" /> Loading dashboard...
      </div>
    );

  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!Component) return <div>No component loaded.</div>;

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white">
      <Component />
    </div>
  );
}
