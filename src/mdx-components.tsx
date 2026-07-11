import type { MDXComponents } from "mdx/types";

import { caseStudyMdxComponents } from "@/components/v1/case-study/mdx-components";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    ...caseStudyMdxComponents,
  };
}
