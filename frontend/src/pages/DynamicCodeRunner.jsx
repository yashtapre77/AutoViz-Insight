import React, { useEffect, useState } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";

/**
 * DynamicCodeRunner Component
 *
 * Props:
 *  - token: string (Bearer token for auth)
 *  - requirements: string (analysis description)
 *  - file: File object (dataset to upload)
 *
 * Usage Example:
 * <Route
 *   path="/analyze"
 *   element={
 *     <DynamicCodeRunner
 *       token={bearerToken}
 *       requirements="Analyze sales data"
 *       file={uploadedFile}
 *     />
 *   }
 * />
 */

const DynamicCodeRunner = ({ token, requirements, file }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardCode, setDashboardCode] = useState("");
  const [error, setError] = useState("");
  const [RenderedComponent, setRenderedComponent] = useState(null);
  
  useEffect(() => {
    const fetchAndRunCode = async () => {
      try {
        setIsLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("requirements", requirements);
        formData.append("file", file);

        const response = await axios.post(
          "http://127.0.0.1:8000/api/analysis/analyze",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const code = response.data?.dashboard_code || "";
        setDashboardCode(code);

        // Extract pure JSX code inside ```jsx ... ```
        const cleanedCode = code
          .replace(/^```jsx/, "")
          .replace(/```$/, "")
          .replace(/\\n/g, "\n")
          .trim();

        // Dynamically compile and render
        const ComponentFunc = new Function(
          "React",
          `${cleanedCode}; return () => <Dashboard />;`
        )(React);

        setRenderedComponent(() => ComponentFunc);
      } catch (err) {
        console.error(err);
        setError("Error fetching or running code. Check console for details.");
      } finally {
        setIsLoading(false);
      }
    };

    if (file && requirements && token) {
      fetchAndRunCode();
    } else {
      setError("Missing required props: token, requirements, or file.");
      setIsLoading(false);
    }
  }, [token, requirements, file]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <ClipLoader color="#007bff" size={50} />
        <p style={{ marginTop: "10px", fontSize: "18px", color: "#555" }}>
          Analyzing your data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "20px",
          color: "red",
          fontSize: "16px",
          textAlign: "center",
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      {RenderedComponent ? (
        <RenderedComponent />
      ) : (
        <pre
          style={{
            background: "#f4f4f4",
            padding: "10px",
            borderRadius: "8px",
            overflowX: "auto",
          }}
        >
          {dashboardCode}
        </pre>
      )}
    </div>
  );
};

export default DynamicCodeRunner;
