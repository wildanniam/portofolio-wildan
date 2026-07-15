import type { MDXComponents } from "mdx/types";

import { portfolioMdxComponents } from "@/components/portfolio/project/mdx-components";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    ...portfolioMdxComponents,
  };
}
