export default function Home() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a, #020617)",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      fontFamily: "system-ui, sans-serif"
    }}>

      {/* Title */}
      <h1 style={{
        fontSize: "48px",
        fontWeight: "700",
        marginBottom: "10px"
      }}>
        OE Platform
      </h1>

      {/* Subtitle */}
      <p style={{
        fontSize: "18px",
        color: "#94a3b8",
        maxWidth: "500px",
        marginBottom: "30px"
      }}>
        Smart Open-End Response Management with AI-powered similarity detection,
        validation, and real-time insights.
      </p>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "15px" }}>
        
        <a href="/login" style={{
          padding: "12px 24px",
          background: "#2563eb",
          borderRadius: "8px",
          textDecoration: "none",
          color: "#fff",
          fontWeight: "500"
        }}>
          Login
        </a>

        

      </div>

      {/* Footer */}
      <p style={{
        position: "absolute",
        bottom: "20px",
        fontSize: "12px",
        color: "#475569"
      }}>
        © Voicentra Research — Every Voice Counts. Every Insight Matters.
      </p>

    </div>
  );
}