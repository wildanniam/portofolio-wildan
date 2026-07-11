type SkipLinkProps = {
  href?: string;
};

export function SkipLink({ href = "#main-content" }: SkipLinkProps) {
  return (
    <a className="opg-skip-link" href={href}>
      Skip to content
    </a>
  );
}
