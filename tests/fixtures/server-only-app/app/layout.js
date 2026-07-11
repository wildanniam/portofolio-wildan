import "./fixture.css";

export const metadata = {
  title: "Server-only runtime fixture",
  description: "A minimal App Router fixture used only for runtime measurement.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
