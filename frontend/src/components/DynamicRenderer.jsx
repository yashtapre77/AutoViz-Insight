import React, { useEffect, useRef } from "react";
import * as Recharts from "recharts";

const DynamicRenderer = ({ code }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!code) return;

    (async () => {
      try {
        // ✅ Dynamically import Babel since Vite doesn't like static imports for UMD modules
        const Babel = (await import("@babel/standalone")).default || (await import("@babel/standalone"));

        // ✅ Transform JSX code to runnable JS
        const { code: transformed } = Babel.transform(code, {
          presets: ["env", "react"],
        });

        // ✅ Scope setup (React + Recharts)
        const scope = {
          React,
          ...Recharts,
        };

        // ✅ Create a function to return the rendered element
        const func = new Function(
          "React",
          ...Object.keys(scope).filter((k) => k !== "React"),
          `
          const { ${Object.keys(scope).join(", ")} } = { React, ...arguments[0] };
          const render = () => { ${transformed} };
          return render();
        `
        );

        const element = func(React, scope);

        // ✅ Render dynamically with ReactDOM
        const ReactDOM = await import("react-dom/client");
        const root = ReactDOM.createRoot(containerRef.current);
        root.render(element);
      } catch (err) {
        console.error("Dynamic rendering error:", err);
        if (containerRef.current)
          containerRef.current.innerHTML = `<pre class="text-red-600 bg-gray-100 p-2 rounded">Error: ${err.message}</pre>`;
      }
    })();
  }, [code]);

  return (
    <div className="w-full h-auto p-4 bg-white rounded-2xl shadow-lg">
      <div ref={containerRef} className="text-gray-800" />
    </div>
  );
};

export default DynamicRenderer;
