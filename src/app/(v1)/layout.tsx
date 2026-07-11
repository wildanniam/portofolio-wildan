import "@/styles/v1-foundations.css";

export default function PortfolioV1Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div data-portfolio-v1 data-site-shell="v1">
      {children}
    </div>
  );
}
