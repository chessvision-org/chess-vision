import { html, raw } from '../../helpers/html';
import type { IconFn } from '../../components/Icon';

export function SettingsHeading({
  icon: Icon,
  title,
  description
}: {
  icon: IconFn;
  title: string;
  description?: string;
}): string {
  return html`<div class="settings-heading">
    <h2 class="settings-heading-title">
      ${raw(Icon('settings-heading-icon'))} ${title}
    </h2>
    ${description
      ? html`<p class="settings-heading-desc">${description}</p>`
      : ''}
  </div>`;
}

export function SettingsBlock({
  title,
  description,
  action = '',
  children
}: {
  title: string;
  description?: string;
  action?: string;
  children: string;
}): string {
  return html`<section class="settings-block">
    <div class="settings-block-header">
      <div class="settings-block-title-wrap">
        <h3 class="settings-block-title">${title}</h3>
        ${action
          ? html`<div class="settings-block-action">${raw(action)}</div>`
          : ''}
      </div>
      ${description
        ? html`<p class="settings-block-desc">${description}</p>`
        : ''}
    </div>
    <div class="settings-block-content">${raw(children)}</div>
  </section>`;
}

export function SettingsSelect({
  value,
  options,
  dataSelect,
  label
}: {
  value: string;
  options: readonly { value: string; label: string }[];
  dataSelect: string;
  label?: string;
}): string {
  return html`<div class="settings-select-wrap">
    ${label
      ? html`<label class="settings-select-label" for="sel-${dataSelect}"
          >${label}</label
        >`
      : ''}
    <select
      id="sel-${dataSelect}"
      class="settings-select"
      data-select="${dataSelect}"
    >
      ${options
        .map(
          (o) =>
            html`<option
              value="${o.value}"
              ${o.value === value ? 'selected' : ''}
            >
              ${o.label}
            </option>`
        )
        .join('')}
    </select>
  </div>`;
}

export function SettingsSwitch({
  label,
  description,
  dataSwitch,
  checked = false
}: {
  label: string;
  description?: string;
  dataSwitch: string;
  checked?: boolean;
}): string {
  return html`<label class="settings-switch-row">
    <span class="settings-switch-info">
      <span class="settings-switch-label">${label}</span>
      ${description
        ? html`<span class="settings-switch-desc">${description}</span>`
        : ''}
    </span>
    <input
      type="checkbox"
      class="toggle"
      data-switch="${dataSwitch}"
      ${checked ? 'checked' : ''}
    />
  </label>`;
}

export function SettingsInfoRow({
  icon: Icon,
  label,
  value,
  copyable = false,
  dataCopy
}: {
  icon: IconFn;
  label: string;
  value: string;
  copyable?: boolean;
  dataCopy?: string;
}): string {
  const inner = html`<span class="settings-info-row-value">${value}</span>`;
  return html`<div class="settings-info-row">
    <span class="settings-info-row-label">
      ${raw(Icon('settings-info-row-icon'))} ${label}
    </span>
    ${copyable
      ? html`<span class="settings-info-row-copy">
          ${inner}
          <button
            type="button"
            class="btn-icon-sm"
            data-copy="${dataCopy}"
            aria-label="Copy ${label}"
            title="Copy ${label}"
          >
            ${raw(copyIcon())}
          </button>
        </span>`
      : inner}
  </div>`;
}

function copyIcon(): string {
  return html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
  </svg>`;
}
