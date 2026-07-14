import Link from "next/link";

export function PfnFooter() {
  return (
    <footer className="pfn-footer">
      <span>© {new Date().getFullYear()} Wildan Syukri Niam</span>
      <nav aria-label="Footer navigation">
        <Link href="/work" prefetch={false}>Work</Link>
        <Link href="/moments" prefetch={false}>Moments</Link>
        <Link href="/about" prefetch={false}>About</Link>
        <Link href="/contact" prefetch={false}>Contact</Link>
      </nav>
    </footer>
  );
}
