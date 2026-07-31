import { html, raw } from "../helpers/html";

interface PageSidebarLayoutProps {
  sidebar: string;
  children: string;
  contentLabel: string;
}

export function PageSidebarLayout({
  sidebar,
  children,
  contentLabel,
}: PageSidebarLayoutProps): string {
  return html` <div class="page-container page-sidebar-layout">
    <div class="page-sidebar-sidebar-col">
      <div class="page-sidebar-sticky">
        <div class="page-sidebar-nav">${raw(sidebar)}</div>
        <div aria-hidden="true" class="page-sidebar-divider"></div>
      </div>
    </div>

    <div role="region" aria-label="${contentLabel}" class="page-sidebar-content">
      ${raw(children)}
    </div>
  </div>`;
}
