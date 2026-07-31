import { html, raw } from '../helpers/html';
import type { IconFn } from './Icon';
import { ChevronDown, ChevronRight } from './icons';

// Types
export interface PageTab {
  id: string;
  label: string;
  icon: IconFn;
}

export interface PageTabGroup {
  id?: string;
  label?: string;
  icon?: IconFn;
  isCollapsible?: boolean;
  items: readonly PageTab[];
}

interface PageTabsProps {
  groups: readonly PageTabGroup[];
  activeId: string;
  ariaLabel?: string;
  tabParam?: string;
  query?: string;
}

export function PageTabs({
  groups,
  activeId,
  ariaLabel = 'Sections',
  tabParam = 'tab',
  query = ''
}: PageTabsProps): string {
  const tabHref = (id: string): string =>
    `${query ? `${query}&` : '?'}${tabParam}=${encodeURIComponent(id)}`;

  const renderGroup = (group: PageTabGroup, groupIndex: number): string => {
    const groupId = group.id || `group-${groupIndex}`;
    const isCollapsible = !!group.isCollapsible;
    const hasActiveItem = group.items.some((t) => t.id === activeId);
    const isExpanded = isCollapsible ? hasActiveItem : true;
    const GroupIcon = group.icon;

    const containerClass = [
      groupIndex > 0 ? 'tabs-group' : 'tabs-group tabs-group-first'
    ].join(' ');

    let heading = '';
    if (group.label && isCollapsible) {
      heading = html` <button
        type="button"
        class="group-toggle-btn ${hasActiveItem && !isExpanded
          ? 'group-toggle-active'
          : 'group-toggle-inactive'}"
        @click="expanded = !expanded"
        :aria-expanded="expanded ? 'true' : 'false'"
      >
        <span class="group-toggle-label">
          ${GroupIcon ? raw(GroupIcon('group-icon')) : ''} ${group.label}
        </span>
        <span x-show="expanded" style="display: flex"
          >${raw(ChevronDown('group-chevron'))}</span
        >
        <span x-show="!expanded" style="display: none"
          >${raw(ChevronRight('group-chevron'))}</span
        >
      </button>`;
    } else if (group.label) {
      heading = html`<span aria-hidden="true" class="group-heading"
        >${group.label}</span
      >`;
    }

    const items = group.items
      .map(({ id, label, icon: Icon }) => {
        const isActive = id === activeId;
        const indentClass = isCollapsible
          ? 'tab-btn-collapsible'
          : 'tab-btn-normal';
        const indicatorClass = isActive
          ? 'tab-indicator tab-indicator-active'
          : 'tab-indicator tab-indicator-inactive';
        return html` <a
          href="${tabHref(id)}"
          role="tab"
          aria-selected="${isActive}"
          aria-controls="panel-${id}"
          class="tab-btn ${indentClass} ${isActive
            ? 'tab-btn-active'
            : 'tab-btn-inactive'}"
        >
          <span aria-hidden="true" class="${indicatorClass}"></span>
          ${raw(Icon('tab-icon'))} ${label}
        </a>`;
      })
      .join('');

    const itemsMarkup = isCollapsible
      ? html`<div x-show="expanded" class="group-items-collapsible">
          ${raw(items)}
        </div>`
      : html`<div class="group-items">${raw(items)}</div>`;

    return html` <div
      key="${groupId}"
      class="${containerClass}"
      ${isCollapsible ? html`x-data="{ expanded: ${isExpanded} }"` : ''}
    >
      ${heading} ${itemsMarkup}
    </div>`;
  };

  return html` <nav aria-label="${ariaLabel}" class="tabs-nav">
    <div
      role="tablist"
      aria-label="${ariaLabel}"
      aria-orientation="vertical"
      class="tabs-list"
    >
      ${groups.map(renderGroup).join('')}
    </div>
  </nav>`;
}
