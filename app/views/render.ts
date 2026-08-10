import { Layout } from './layouts/layout';
import { getRouteSeo, type SeoMeta } from './helpers/seo';

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
  const noindex = options.noindex ?? seo.noindex;
  return Layout({
    title: seo.name ?? '',
    ...(seo.description !== undefined ? { description: seo.description } : {}),
    ...(seo.path !== undefined ? { path: seo.path } : {}),
    ...(noindex !== undefined ? { noindex } : {}),
    ...(seo.image !== undefined ? { image: seo.image } : {}),
    ...(options.schemas !== undefined ? { schemas: options.schemas } : {}),
    ...(options.rightSlot !== undefined
      ? { rightSlot: options.rightSlot }
      : {}),
    children: options.children
  });
}
