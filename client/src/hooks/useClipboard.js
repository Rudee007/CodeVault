import { useState, useCallback, useEffect, useRef } from "react";

export function useClipboard({ timeout = 2000 } = {}) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);

  const copy = useCallback((text) => {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopied(true);
          timeoutRef.current = setTimeout(() => setCopied(false), timeout);
        })
        .catch((err) => {
          setError(err);
          setCopied(false);
        });
    } else {
      // Fallback for older browsers
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed"; // avoid scrolling to bottom
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (successful) {
          setCopied(true);
          timeoutRef.current = setTimeout(() => setCopied(false), timeout);
        } else {
          throw new Error("Fallback: Copy command was unsuccessful");
        }
      } catch (err) {
        setError(err);
        setCopied(false);
      }
    }
  }, [timeout]);

  const reset = useCallback(() => {
    setCopied(false);
    setError(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { copied, error, copy, reset };
}
