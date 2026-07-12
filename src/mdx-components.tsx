import type { MDXComponents } from "mdx/types";

import { pfnMdxComponents } from "@/components/pfn/mdx-components";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    ...pfnMdxComponents,
  };
}
