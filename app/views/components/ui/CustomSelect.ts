import { html, raw } from '../../helpers/html';
import type { IconFn } from '../Icon';
import { Check, ChevronDown } from '../icons';

export interface CustomSelectOption<T extends string | number> {
  value: T;
  label: string;
  icon?: IconFn;
}

interface CustomSelectProps<T extends string | number> {
  value: T;
  xModel: string;
  options: readonly CustomSelectOption<T>[];
  placeholder?: string;
  label?: string;
  id?: string;
}

let selectUid = 0;

export function CustomSelect<T extends string | number>({
  value,
  xModel,
  options,
  placeholder = 'Select...',
  label,
  id: providedId
}: CustomSelectProps<T>): string {
  const baseId = providedId ?? `select-${++selectUid}`;
  const listboxId = `${baseId}-listbox`;
  const count = options.length;
  const selectedIndex = options.findIndex((o) => o.value === value);
  const selectedOption =
    selectedIndex >= 0 ? options[selectedIndex] : undefined;
  const valuesJson = JSON.stringify(options.map((o) => o.value));
  const labelsJson = JSON.stringify(options.map((o) => o.label));
  const placeholderJson = JSON.stringify(placeholder);
  const displayIcon = selectedOption?.icon;

  const data = html`{ isOpen: false, activeIndex: -1, selectedIndex:
  ${selectedIndex}, toggle() { this.isOpen = !this.isOpen; }, open() {
  this.isOpen = true; }, close() { this.isOpen = false; this.activeIndex = -1;
  }, select(i) { this.selectedIndex = i; ${xModel} = ${raw(valuesJson)}[i];
  this.close(); }, scrollActive() { this.$nextTick(() => { const el =
  this.$refs.list?.querySelector( '[data-option-index="' + this.activeIndex +
  '"]' ); el?.scrollIntoView({ block: 'nearest' }); }); }, keydown(e) { if
  (e.key === 'ArrowDown') { e.preventDefault(); this.open(); this.activeIndex =
  (this.activeIndex + 1) % ${count}; this.scrollActive(); } else if (e.key ===
  'ArrowUp') { e.preventDefault(); this.open(); this.activeIndex =
  (this.activeIndex - 1 + ${count}) % ${count}; this.scrollActive(); } else if
  (e.key === 'Home') { e.preventDefault(); this.open(); this.activeIndex = 0;
  this.scrollActive(); } else if (e.key === 'End') { e.preventDefault();
  this.open(); this.activeIndex = ${count} - 1; this.scrollActive(); } else if
  (e.key === 'Enter' || e.key === ' ') { if (this.isOpen && this.activeIndex >=
  0) { e.preventDefault(); this.select(this.activeIndex); } else if (e.key ===
  'Enter') { e.preventDefault(); this.open(); } } else if (e.key === 'Tab') {
  this.close(); } else if (e.key === 'Escape') { this.close(); } } }`;

  return html`<div class="relative" @click.outside="close()" x-data="${data}">
    ${label
      ? html`<label id="${baseId}-label" class="select-label">${label}</label>`
      : ''}
    <button
      type="button"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      aria-controls="${listboxId}"
      :aria-activedescendant="isOpen && activeIndex >= 0 ? '${baseId}-option-' + activeIndex : null"
      ${label ? html`aria-labelledby="${baseId}-label"` : ''}
      @click="toggle()"
      @keydown="keydown($event)"
      class="select-trigger select-trigger-closed"
      :class="isOpen ? 'select-trigger-open' : 'select-trigger-closed'"
    >
      <span class="flex items-center gap-2 min-w-0">
        ${displayIcon ? raw(displayIcon('shrink-0')) : ''}
        <span
          class="${selectedOption ? 'text-text-primary' : 'text-text-muted'}"
          :class="selectedIndex >= 0 ? 'text-text-primary' : 'text-text-muted'"
          x-text="${raw(labelsJson)}[selectedIndex] ?? ${placeholderJson}"
          >${selectedOption?.label ?? placeholder}</span
        >
      </span>
      <span
        class="select-icon"
        :class="isOpen ? 'select-icon-open' : ''"
        aria-hidden="true"
        >${raw(ChevronDown())}</span
      >
    </button>

    <div
      class="select-dropdown"
      data-state="closed"
      :data-state="isOpen ? 'open' : 'closed'"
    >
      <div
        x-ref="list"
        id="${listboxId}"
        role="listbox"
        class="select-list"
        ${label ? html`aria-labelledby="${baseId}-label"` : ''}
      >
        ${options
          .map(
            (option, index) =>
              html`<button
                type="button"
                id="${baseId}-option-${index}"
                data-option-index="${index}"
                role="option"
                :aria-selected="selectedIndex === ${index}"
                tabindex="-1"
                @click="select(${index})"
                @mouseenter="activeIndex = ${index}"
                class="select-option select-option-unselected"
                :class="{
                'select-option-selected': selectedIndex === ${index},
                'select-option-unselected': selectedIndex !== ${index},
                'select-option-active': activeIndex === ${index}
              }"
              >
                <span class="flex items-center gap-2 min-w-0">
                  ${option.icon ? raw(option.icon('shrink-0')) : ''}
                  <span class="truncate">${option.label}</span>
                </span>
                <span x-show="selectedIndex === ${index}" class="shrink-0"
                  >${raw(Check('w-4 h-4 text-accent'))}</span
                >
              </button>`
          )
          .join('')}
      </div>
    </div>
  </div>`;
}
