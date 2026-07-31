import { html } from '../../helpers/html';

interface SwitchProps {
  checked?: boolean;
  label?: string;
  description?: string;
  ariaLabel?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
  xModel?: string;
}

let switchUid = 0;

export function Switch({
  checked = false,
  label,
  description,
  ariaLabel,
  className = '',
  id: providedId,
  disabled = false,
  xModel
}: SwitchProps): string {
  const id = providedId ?? `switch-${++switchUid}`;
  const labelId = label ? `${id}-label` : undefined;
  const descId = description ? `${id}-desc` : undefined;

  const buttonClass = xModel
    ? 'switch-button'
    : `switch-button ${
        checked ? 'switch-button-checked' : 'switch-button-unchecked'
      }`;
  const thumbClass = xModel
    ? 'switch-thumb'
    : `switch-thumb ${checked ? 'switch-thumb-checked' : 'switch-thumb-unchecked'}`;

  return html`<div
    class="switch-container ${disabled
      ? 'switch-container-disabled'
      : ''} ${className}"
  >
    ${label || description
      ? html`<div class="min-w-0">
          ${label
            ? html`<p id="${labelId}" class="switch-label">${label}</p>`
            : ''}
          ${description
            ? html`<p id="${descId}" class="switch-desc">${description}</p>`
            : ''}
        </div>`
      : ''}
    <button
      type="button"
      role="switch"
      id="${id}"
      ${xModel ? html`:aria-checked="${xModel}"` : `aria-checked="${checked}"`}
      ${ariaLabel ? html`aria-label="${ariaLabel}"` : ''}
      ${label ? html`aria-labelledby="${labelId}"` : ''}
      ${description ? html`aria-describedby="${descId}"` : ''}
      ${disabled ? 'disabled' : ''}
      class="${buttonClass}"
      ${xModel ? html`@click="${xModel} = !${xModel}"` : ''}
      ${xModel
        ? html`:class="${xModel} ? 'switch-button-checked' :
          'switch-button-unchecked'"`
        : ''}
    >
      <span
        aria-hidden="true"
        class="${thumbClass}"
        ${xModel
          ? html`:class="${xModel} ? 'switch-thumb-checked' :
            'switch-thumb-unchecked'"`
          : ''}
      ></span>
    </button>
  </div>`;
}
