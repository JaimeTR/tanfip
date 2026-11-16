import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const alt = "TANFIP · Fisioterapia & Pilates en Mat by Tania Castro";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const svg = await readFile(path.join(process.cwd(), "public/brand/isotipo-color.svg"));
  const logo = `data:image/svg+xml;base64,${svg.toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 90px",
          background: "linear-gradient(135deg,#e6f3ef 0%,#f7fbf8 50%,#dcebc4 100%)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={300} height={300} alt="" />
        <div style={{ display: "flex", flexDirection: "column", marginLeft: 60 }}>
          <div style={{ fontSize: 120, fontWeight: 700, color: "#1B7F8E", letterSpacing: 8, fontFamily: "serif" }}>TANFIP</div>
          <div style={{ fontSize: 44, color: "#6f8f2c", marginTop: 4 }}>fisioterapia &amp; pilates</div>
          <div style={{ fontSize: 34, color: "#14606E", marginTop: 26 }}>by Tania Castro · Agenda tu cita en línea</div>
        </div>
      </div>
    ),
    size
  );
}
