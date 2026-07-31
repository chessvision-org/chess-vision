import { Layout } from "./layouts/layout";
import { getRouteSeo, type SeoMeta } from "./helpers/seo";

export interface RenderPageOptions {
  path: string;
  children: string;
  seo?: SeoMeta;
  noindex?: boolean;
  schemas?: Record<string, unknown>[];
  rightSlot?: string;
}

export function renderPage(options: RenderPageOptions): string {
  const seo = options.seo ?? getRouteSeo(options.path);
  return Layout({
    title: seo.name ?? "",
    description: seo.description,
    path: seo.path,
    noindex: options.noindex ?? seo.noindex,
    image: seo.image,
    schemas: options.schemas,
    rightSlot: options.rightSlot,
    children: options.children,
  });
}
