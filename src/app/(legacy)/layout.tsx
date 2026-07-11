import { LegacyShell } from "@/components/legacy/legacy-shell";

export default function LegacyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LegacyShell>{children}</LegacyShell>;
}
