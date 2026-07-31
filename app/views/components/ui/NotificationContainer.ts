import { html, raw } from "../../helpers/html";
import { AlertCircle, CheckCircle, Info, X, XCircle } from "../icons";

const MAX_NOTIFICATION_DURATION = 5000;

export function notificationsScript(): string {
  return html`
    <script>
      document.addEventListener("alpine:init", () => {
        Alpine.store("notifications", {
          toast: null,
          _timeout: null,
          push({ type = "info", message, duration = ${MAX_NOTIFICATION_DURATION} }) {
            const ms = Math.min(
              Math.max(Number(duration) || 0, 0),
              ${MAX_NOTIFICATION_DURATION},
            );
            if (this._timeout) clearTimeout(this._timeout);
            this.toast = { type, message, ms };
            if (ms > 0) this._timeout = setTimeout(() => this.remove(), ms);
          },
          success(message, duration) {
            this.push({ type: "success", message, duration });
          },
          error(message, duration) {
            this.push({ type: "error", message, duration });
          },
          warning(message, duration) {
            this.push({ type: "warning", message, duration });
          },
          info(message, duration) {
            this.push({ type: "info", message, duration });
          },
          remove() {
            if (this._timeout) clearTimeout(this._timeout);
            this.toast = null;
          },
        });
      });
    </script>
  `;
}

const TITLE_EXPR =
  "({ success: 'Success', error: 'Error', warning: 'Warning', info: 'Information' })[$store.notifications.toast.type]";
const LABEL_EXPR =
  "({ success: 'Success notification', error: 'Error notification', warning: 'Warning notification', info: 'Information notification' })[$store.notifications.toast.type]";

export function NotificationContainer(): string {
  return html`<div class="notif-region" role="region" aria-label="Notifications" aria-live="polite">
    <template x-if="$store.notifications.toast">
      <div
        role="alert"
        :aria-label="${LABEL_EXPR}"
        tabindex="0"
        class="notif-toast animate-notif-in"
      >
        <div class="notif-icon-wrap" :class="'notif-icon-' + $store.notifications.toast.type">
          <span x-show="$store.notifications.toast.type === 'success'"
            >${raw(CheckCircle("h-5 w-5"))}</span
          >
          <span x-show="$store.notifications.toast.type === 'error'"
            >${raw(XCircle("h-5 w-5"))}</span
          >
          <span x-show="$store.notifications.toast.type === 'warning'"
            >${raw(AlertCircle("h-5 w-5"))}</span
          >
          <span x-show="$store.notifications.toast.type === 'info'">${raw(Info("h-5 w-5"))}</span>
        </div>

        <div class="notif-body">
          <p
            class="notif-title"
            :class="'notif-title-' + $store.notifications.toast.type"
            x-text="${TITLE_EXPR}"
          ></p>
          <p class="notif-message" x-text="$store.notifications.toast.message"></p>
        </div>

        <button
          type="button"
          @click="$store.notifications.remove()"
          class="notif-dismiss"
          aria-label="Dismiss notification"
        >
          ${raw(X("w-4 h-4"))}
        </button>

        <div class="notif-edge" aria-hidden="true">
          <div class="notif-corner"></div>
          <div
            class="notif-corner notif-corner-tone"
            :class="'notif-corner-' + $store.notifications.toast.type"
          ></div>
          <div
            x-show="$store.notifications.toast.ms > 0"
            class="notif-progress"
            :class="'notif-strip-' + $store.notifications.toast.type"
            :style="'animation: shrinkX ' + $store.notifications.toast.ms + 'ms linear forwards'"
          ></div>
        </div>
      </div>
    </template>
  </div>`;
}
