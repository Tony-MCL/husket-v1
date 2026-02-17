// ===============================
// src/components/ToastHost.tsx
// ===============================
import React, { useEffect, useState } from "react";

export function ToastHost(props: { message: string | null }) {
  const { message } = props;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 1400);
    return () => window.clearTimeout(t);
  }, [message]);

  if (!message || !visible) return null;

  return (
    <div className="toastHost" aria-live="polite">
      <div className="toast">{message}</div>
    </div>
  );
}
