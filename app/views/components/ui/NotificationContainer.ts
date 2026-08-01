import { html } from "../../helpers/html";

export function NotificationContainer(): string {
  return html`<div
    id="notif-region"
    class="notif-region"
    role="region"
    aria-label="Notifications"
    aria-live="polite"
  ></div>`;
}
