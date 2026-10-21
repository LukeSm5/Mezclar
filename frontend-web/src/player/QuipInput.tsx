
import { useState } from "react";

const MAX_QUIP_LENGTH = 200;

export default function QuipInput() {
  const [quip, setQuip] = useState("");

  const isValid = quip.trim().length > 0;

  function handleChange(value: string) {
    setQuip(value.slice(0, MAX_QUIP_LENGTH));
  }

  return (
    <section>
      <label htmlFor="quip-input">Your quip</label>

      <textarea
        id="quip-input"
        value={quip}
        onChange={(event) => handleChange(event.target.value)}
        maxLength={MAX_QUIP_LENGTH}
        rows={5}
        placeholder="Type your funniest answer..."
        aria-describedby="quip-counter quip-validation"
        style={{
          display: "block",
          boxSizing: "border-box",
          width: "100%",
          marginTop: 8,
          padding: 12,
          border: "1px solid var(--border)",
          borderRadius: 8,
          font: "inherit",
          resize: "vertical",
        }}
      />

      <p id="quip-counter" style={{ textAlign: "right" }}>
        {quip.length}/{MAX_QUIP_LENGTH}
      </p>

      <p id="quip-validation" aria-live="polite">
        {!isValid
            ? "Enter a quip before submitting."
            : ""}
      </p>
    </section>
  );
}
