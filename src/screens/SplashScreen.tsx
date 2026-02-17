// ===============================
// src/screens/SplashScreen.tsx
// ===============================
import React, { useEffect } from "react";

export function SplashScreen(props: { onDone: () => void }) {
  const { onDone } = props;

  useEffect(() => {
    const t = window.setTimeout(onDone, 650);
    return () => window.clearTimeout(t);
  }, [onDone]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 16
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontWeight: 900, fontSize: 28, letterSpacing: "-0.5px" }}>husk’et</div>
        <div className="smallHelp" style={{ marginTop: 8 }}>
          Designed by Morning Coffee Labs
        </div>
      </div>
    </div>
  );
}
