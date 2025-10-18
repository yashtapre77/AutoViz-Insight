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
 */

const DynamicCodeRunner = ({ token, requirements, file }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [RenderedComponent, setRenderedComponent] = useState(null);

  useEffect(() => {
    const fetchAndLoadComponent = async () => {
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

        let rawCode = response.data?.dashboard_code || "";

        // 🧹 Clean output just in case the LLM adds markdown or escaped text
        const cleanedCode = rawCode
          .replace(/^```[a-z]*\n?/, "")
          .replace(/```$/, "")
          .replace(/\\n/g, "\n")
          .replace(/\\"/g, '"')
          .replace(/\\r/g, "")
          .trim();

        // 🧩 Create a new JS file blob (works like a local file)
        console.log("Cleaned Code:", cleanedCode);
        const blob = new Blob([cleanedCode], { type: "text/javascript" });
        const blobUrl = URL.createObjectURL(blob);

        // 🧠 Dynamically import it as a module
        const module = await import(/* @vite-ignore */ blobUrl);

        // The backend-generated file should have a default export
        if (module && module.default) {
          setRenderedComponent(() => module.default);
        } else {
          throw new Error("Generated module has no default export.");
        }

        // Cleanup blob when unmounted
        return () => URL.revokeObjectURL(blobUrl);

      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError("Failed to load dashboard component. See console for details.");
      } finally {
        setIsLoading(false);
      }
    };

    if (file && requirements && token) {
      fetchAndLoadComponent();
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
        <p>No dashboard component found.</p>
      )}
    </div>
  );
};

export default DynamicCodeRunner;
