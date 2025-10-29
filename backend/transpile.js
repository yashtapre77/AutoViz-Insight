import fs from "fs";
import { build } from "esbuild";

// Validate CLI arguments
const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath) {
  console.error("Usage: node transpile.js input.jsx output.js");
  process.exit(1);
}

try {
  await build({
    entryPoints: [inputPath],
    bundle: true,
    format: "esm", // Output as ES module
    outfile: outputPath,
    jsx: "transform",
    loader: { ".js": "jsx", ".jsx": "jsx" },
    external: ["react", "react-dom", "recharts", "react/jsx-runtime"], // ✅ exclude unresolved frontend deps
    logLevel: "silent",
  });

  console.log("✅ Transpile successful:", outputPath);
} catch (err) {
  console.error("❌ Transpile failed:", err);
  process.exit(1);
}
