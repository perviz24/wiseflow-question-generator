import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "TentaGen — Smartare tentafrågor för utbildningsorganisationer"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #09090b 0%, #18181b 50%, #09090b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          padding: "60px 80px",
          position: "relative",
        }}
      >
        {/* Subtle gradient accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #0d9488 0%, #14b8a6 50%, #0d9488 100%)",
            display: "flex",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "90px",
            height: "90px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #0d9488, #14b8a6)",
            marginBottom: "32px",
          }}
        >
          <span
            style={{
              fontSize: "52px",
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1,
            }}
          >
            T?
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "56px",
            fontWeight: 700,
            color: "#fafafa",
            letterSpacing: "-0.03em",
            textAlign: "center",
            lineHeight: 1.15,
            margin: 0,
            display: "flex",
          }}
        >
          TentaGen
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "26px",
            color: "#a1a1aa",
            textAlign: "center",
            lineHeight: 1.5,
            margin: "16px 0 0 0",
            maxWidth: "700px",
            display: "flex",
          }}
        >
          Smartare tentafrågor för utbildningsorganisationer
        </p>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "40px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {["AI-genererade frågor", "WISEflow-export", "Bloom-taxonomi"].map(
            (label) => (
              <div
                key={label}
                style={{
                  padding: "10px 24px",
                  borderRadius: "999px",
                  border: "1px solid #27272a",
                  color: "#d4d4d8",
                  fontSize: "18px",
                  display: "flex",
                  background: "rgba(39, 39, 42, 0.5)",
                }}
              >
                {label}
              </div>
            )
          )}
        </div>

        {/* Domain */}
        <p
          style={{
            position: "absolute",
            bottom: "32px",
            right: "60px",
            fontSize: "18px",
            color: "#52525b",
            margin: 0,
            display: "flex",
          }}
        >
          tentagen.se
        </p>
      </div>
    ),
    {
      ...size,
    }
  )
}
