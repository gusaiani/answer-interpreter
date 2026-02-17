import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  const isDev = process.env.NODE_ENV === "development";

  const bg = isDev ? "#e85d04" : "#101010";
  const fg = isDev ? "#ffffff" : "#f7f5f0";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: bg,
        }}
      >
        <span
          style={{
            color: fg,
            fontSize: 22,
            fontWeight: 600,
            fontFamily: "sans-serif",
            marginTop: -1,
          }}
        >
          P
        </span>
      </div>
    ),
    { ...size }
  );
}
