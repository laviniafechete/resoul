export default function ComingSoon() {
  return (
    <div
      style={{
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top, #2b2340 0, #050509 55%, #000000 100%)",
        color: "#f5f5f5",
        fontFamily:
          "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "880px",
          padding: "40px 20px",
          height: "auto",
          background: "#050509",
          borderRadius: "18px",
          border: "1px solid rgba(255, 255, 255, 0.14)",
          boxShadow:
            "0 18px 45px rgba(0, 0, 0, 0.7), 0 0 40px rgba(124, 74, 155, 0.35)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "18px",
            left: "28px",
            fontSize: "3vw",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            opacity: 0.75,
          }}
        >
          RESOUL • HEALING SPACE
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            width: "100%",
            padding: "0 20px",
          }}
        >
          <div
            style={{
              fontSize: "3.2vw",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              opacity: 0.7,
              marginBottom: "18px",
            }}
          >
            CURÂND ONLINE
          </div>

          <div
            style={{
              fontSize: "6vw",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              marginBottom: "6px",
            }}
          >
            PREGĂTIM
          </div>

          <div
            style={{
              fontSize: "7.5vw",
              fontWeight: 600,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
            }}
          >
            MAGIA
          </div>

          <div
            style={{
              fontSize: "0.9rem",
              marginTop: "26px",
              maxWidth: "380px",
              marginInline: "auto",
              lineHeight: 1.5,
              opacity: 0.8,
            }}
          >
            Lucrăm cu drag la un spațiu care îți aduce liniște, vindecare și
            inspirație. Curând vei putea păși într-un univers creat special
            pentru sufletul tău.
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "18px",
            right: "28px",
            fontSize: "3vw",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            opacity: 0.6,
          }}
        >
          COMING SOON • RESOUL.RO
        </div>
      </div>
    </div>
  );
}
