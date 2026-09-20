import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const alt = "ScentSL — Luxury Fragrance, Freetown";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  let logoDataUrl = "";
  try {
    const logoPath = path.join(process.cwd(), "public", "scentsl.jpeg");
    if (fs.existsSync(logoPath)) {
      const buffer = fs.readFileSync(logoPath);
      logoDataUrl = `data:image/jpeg;base64,${buffer.toString("base64")}`;
    } else {
      const iconPath = path.join(process.cwd(), "public", "icon-512.png");
      if (fs.existsSync(iconPath)) {
        const buffer = fs.readFileSync(iconPath);
        logoDataUrl = `data:image/png;base64,${buffer.toString("base64")}`;
      }
    }
  } catch {
    // Fallback if filesystem read fails
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#11100D",
          backgroundImage:
            "radial-gradient(circle at 50% 45%, #231F19 0%, #11100D 75%)",
          color: "#F6F4EE",
          fontFamily: "serif",
          position: "relative",
          padding: "60px 80px",
          boxSizing: "border-box",
        }}
      >
        {/* Outer gold border line */}
        <div
          style={{
            position: "absolute",
            top: "24px",
            left: "24px",
            right: "24px",
            bottom: "24px",
            border: "1px solid rgba(197, 160, 89, 0.35)",
            display: "flex",
          }}
        />

        {/* Inner subtle frame line */}
        <div
          style={{
            position: "absolute",
            top: "32px",
            left: "32px",
            right: "32px",
            bottom: "32px",
            border: "1px solid rgba(246, 244, 238, 0.08)",
            display: "flex",
          }}
        />

        {/* Circular Logo Container with Gold Accent Ring */}
        {logoDataUrl ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              border: "2px solid rgba(197, 160, 89, 0.7)",
              overflow: "hidden",
              marginBottom: "28px",
              boxShadow: "0 0 45px rgba(197, 160, 89, 0.25)",
              backgroundColor: "#171511",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoDataUrl}
              alt="ScentSL Logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        ) : null}

        {/* Brand Title */}
        <div
          style={{
            fontSize: "60px",
            letterSpacing: "0.38em",
            color: "#C5A059",
            fontWeight: "300",
            textTransform: "uppercase",
            marginBottom: "8px",
            textAlign: "center",
          }}
        >
          S C E N T S L
        </div>

        {/* Gold Separator Line */}
        <div
          style={{
            width: "140px",
            height: "1px",
            backgroundColor: "rgba(197, 160, 89, 0.5)",
            marginTop: "12px",
            marginBottom: "20px",
          }}
        />

        {/* Subtitle */}
        <div
          style={{
            fontSize: "20px",
            letterSpacing: "0.45em",
            color: "rgba(246, 244, 238, 0.85)",
            textTransform: "uppercase",
            fontWeight: "400",
            marginBottom: "14px",
            textAlign: "center",
          }}
        >
          LUXURY FRAGRANCE · FREETOWN
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "18px",
            color: "rgba(246, 244, 238, 0.6)",
            fontStyle: "italic",
            letterSpacing: "0.06em",
            textAlign: "center",
          }}
        >
          An archive of scent for the discerning
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
