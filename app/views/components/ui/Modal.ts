import { html, raw } from '../../helpers/html';
import type { IconFn } from '../Icon';
import { AlertTriangle, Info, X, XCircle } from '../icons';

export type ModalType = 'warning' | 'info' | 'danger';

interface ModalProps {
  isOpenExpr: string;
  title: string;
  message?: string;
  children?: string;
  type?: ModalType;
  onConfirmExpr: string;
  onCancelExpr: string;
}

const MODAL_TYPE_ICON: Record<ModalType, IconFn> = {
  info: Info,
  warning: AlertTriangle,
  danger: XCircle
};

const MODAL_TYPE_COLOR: Record<ModalType, string> = {
  info: 'text-info',
  warning: 'text-warning',
  danger: 'text-error'
};

const MODAL_TYPE_CONFIRM: Record<ModalType, string> = {
  info: 'btn-primary',
  warning: 'btn-warning',
  danger: 'btn-danger'
};

export function Modal({
  isOpenExpr,
  title,
  message,
  children,
  type = 'info',
  onConfirmExpr,
  onCancelExpr
}: ModalProps): string {
  const Icon = MODAL_TYPE_ICON[type];

  return html`<div
    class="modal-backdrop"
    x-show="${isOpenExpr}"
    x-cloak
    x-effect="document.body.classList.toggle('modal-open', ${isOpenExpr})"
    @click.self="${onCancelExpr}"
    @keydown.escape.window="${onCancelExpr}"
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      tabindex="-1"
      class="modal-container"
      style="max-width: 28rem"
    >
      <div class="p-6">
        <div class="flex items-start gap-4">
          <div
            class="shrink-0 p-2 rounded-xl bg-surface-elevated ${MODAL_TYPE_COLOR[
              type
            ]}"
          >
            ${raw(Icon('w-6 h-6', true))}
          </div>
          <div class="flex-1 min-w-0">
            <h3
              id="modal-title"
              class="text-lg font-bold text-text-primary mb-1"
            >
              ${title}
            </h3>
            <div
              id="modal-description"
              class="text-sm text-text-secondary leading-relaxed"
            >
              ${children ?? message}
            </div>
          </div>
          <button
            type="button"
            @click="${onCancelExpr}"
            aria-label="Close dialog"
            class="modal-close-btn"
          >
            ${raw(X('w-5 h-5'))}
          </button>
        </div>

        <div class="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="${onCancelExpr}"
            class="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="${onConfirmExpr}"
            class="btn ${MODAL_TYPE_CONFIRM[type]}"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  </div>`;
}

interface ModalShellProps {
  isOpenExpr: string;
  onCloseExpr: string;
  title: string;
  icon?: IconFn;
  iconColor?: string;
  children: string;
  maxWidth?: string;
  showCloseButton?: boolean;
  disableBackdropClick?: boolean;
  id?: string;
}

let shellUid = 0;

export function ModalShell({
  isOpenExpr,
  onCloseExpr,
  title,
  icon,
  iconColor = 'var(--color-accent)',
  children,
  maxWidth = '32rem',
  showCloseButton = true,
  disableBackdropClick = false,
  id: providedId
}: ModalShellProps): string {
  const id = providedId ?? `modal-shell-${++shellUid}`;
  const titleId = `${id}-title`;
  const backdropClick = disableBackdropClick
    ? ''
    : html`@click.self="${onCloseExpr}"`;

  return html`<div
    class="modal-backdrop"
    x-show="${isOpenExpr}"
    x-cloak
    x-effect="document.body.classList.toggle('modal-open', ${isOpenExpr})"
    ${backdropClick}
    @keydown.escape.window="${onCloseExpr}"
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="${titleId}"
      tabindex="-1"
      class="modal-container"
      style="max-width: ${maxWidth}"
    >
      <div class="modal-header">
        <div class="modal-title-container">
          ${icon
            ? html`<span class="shrink-0" style="color: ${iconColor}"
                >${raw(icon('w-5 h-5'))}</span
              >`
            : ''}
          <h3 id="${titleId}" class="modal-title">${title}</h3>
        </div>
        ${showCloseButton
          ? html`<button
              type="button"
              @click="${onCloseExpr}"
              aria-label="Close dialog"
              class="modal-close-btn"
            >
              ${raw(X('w-5 h-5'))}
            </button>`
          : ''}
      </div>
      <div class="modal-body">${children}</div>
    </div>
  </div>`;
}
