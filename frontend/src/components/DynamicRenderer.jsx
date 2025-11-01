import React from 'react';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
} from "@codesandbox/sandpack-react";
import Constants from './Constants';

function CodeEditor({ code, isReady }) {
  return (
    <div className="w-screen h-screen">
      <SandpackProvider
        template="react"
        theme="dark"
        files={{
          "/App.js": {
            code: `${code}`,
            active: true,
          },
        }}
        customSetup={{
          dependencies: {
            ...Constants.DEPENDANCY,
          },
        }}
        options={{
          externalResources: ["https://cdn.tailwindcss.com"],
        }}
      >
        <SandpackLayout
          style={{
            width: "100vw",
            height: "100vh",
            margin: 0,
            padding: 0,
            border: "none",
            overflow: "hidden",
          }}
        >
          <SandpackPreview
            showNavigator={false}
            showOpenInCodeSandbox={false}
            showRefreshButton={false}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}

export default CodeEditor;
