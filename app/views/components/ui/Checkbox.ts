import { html } from "../../helpers/html";

interface CheckboxProps {
  checked?: boolean;
  label: string;
  id?: string;
  name?: string;
  value?: string;
  disabled?: boolean;
  className?: string;
  dataOption?: string;
}

let checkboxUid = 0;

export function Checkbox({
  checked = false,
  label,
  id: providedId,
  name,
  value,
  disabled = false,
  className = "",
  dataOption,
}: CheckboxProps): string {
  const id = providedId ?? `checkbox-${++checkboxUid}`;
  const nameAttr = name !== undefined ? html`name="${name}"` : "";
  const valueAttr = value !== undefined ? html`value="${value}"` : "";

  return html`<label
    for="${id}"
    class="checkbox-label ${disabled ? "checkbox-label-disabled" : ""} ${className}"
  >
    <input
      id="${id}"
      type="checkbox"
      ${nameAttr}
      ${valueAttr}
      ${checked ? "checked" : ""}
      ${disabled ? "disabled" : ""}
      class="checkbox-input"
      ${dataOption ? html`data-option="${dataOption}"` : ""}
    />
    <span class="checkbox-text">${label}</span>
  </label>`;
}
