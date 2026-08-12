import { html, raw } from '../helpers/html';
import { PageSidebarLayout } from '../components/PageSidebarLayout';
import { PageTabs, type PageTabGroup } from '../components/PageTabs';
import { Modal } from '../components/ui';
import {
  Accessibility,
  Check,
  Clock,
  Contrast,
  Database,
  Download,
  Eye,
  Fingerprint,
  HardDrive,
  Heart,
  History,
  KeyRound,
  LayoutGrid,
  Loader2,
  LogIn,
  LogOut,
  Mail,
  Monitor,
  Moon,
  Palette,
  Pencil,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  UserPlus,
  User as UserIcon,
  X
} from '../components/icons';
import {
  SettingsBlock,
  SettingsHeading,
  SettingsInfoRow,
  SettingsSelect,
  SettingsSwitch
} from './parts/settings-parts';

const CONTACT_EMAIL = 'support@chessvision.org';

function getSettingsGroups(): PageTabGroup[] {
  return [
    {
      label: 'Profile',
      items: [
        { id: 'profile', label: 'Account', icon: UserIcon },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'board', label: 'Board Style', icon: LayoutGrid },
        { id: 'accessibility', label: 'Accessibility', icon: Accessibility }
      ]
    },
    {
      label: 'Access',
      items: [
        {
          id: 'security',
          label: 'Security',
          icon: ShieldCheck,
          authRequired: true
        },
        { id: 'data', label: 'Data Management', icon: Database }
      ]
    }
  ];
}

const VALID_TAB_IDS = new Set([
  'profile',
  'appearance',
  'board',
  'accessibility',
  'security',
  'data'
]);

// ===== Account section =====

function IdentityHeader(): string {
  return html`<section class="settings-identity card-elevated">
    <div class="settings-avatar" data-avatar-initial>?</div>
    <div class="settings-identity-info">
      <div data-identity-view>
        <p class="settings-identity-name" data-identity-name>Local user</p>
        <p class="settings-identity-email" data-identity-email hidden></p>
        <span class="settings-badge" data-identity-badge>Not synchronized</span>
      </div>
      <div class="settings-identity-edit" data-identity-edit hidden>
        <input
          id="account-display-name"
          type="text"
          maxlength="60"
          placeholder="Your name"
          class="input-field"
          data-identity-input
        />
        <div class="settings-identity-edit-actions">
          <button
            type="button"
            class="btn btn-primary btn-sm"
            data-identity-save
            disabled
          >
            <span data-identity-save-icon>${raw(Check('h-4 w-4'))}</span>
            <span data-identity-save-label>Save</span>
          </button>
          <button
            type="button"
            class="btn btn-secondary btn-sm"
            data-identity-cancel
          >
            ${raw(X('h-4 w-4'))}
          </button>
        </div>
        <p class="text-xs text-error" data-identity-error hidden></p>
      </div>
    </div>
    <button
      type="button"
      class="settings-edit-btn"
      data-identity-edit-toggle
      aria-label="Edit display name"
      title="Edit display name"
    >
      ${raw(Pencil('h-4 w-4'))}
    </button>
  </section>`;
}

function EmailCard(): string {
  return html`<section
    class="settings-email card-elevated"
    data-email-card
    hidden
  >
    <div class="settings-email-label">
      ${raw(Mail('h-4 w-4'))} Email Address
    </div>
    <div class="settings-email-row">
      <input
        id="account-email"
        type="email"
        inputmode="email"
        autocomplete="email"
        maxlength="320"
        class="input-field"
        data-email-input
        placeholder="you@example.com"
      />
      <button type="button" class="btn btn-primary" data-email-save disabled>
        <span data-email-save-label>Update Email</span>
      </button>
    </div>
    <p class="text-xs text-text-muted">
      Changing your email sends a confirmation link to the new address. The
      change takes effect only after you confirm it.
    </p>
  </section>`;
}

function AccountDetails(): string {
  return html`<section class="settings-details">
    <h3 class="settings-section-label">Account Details</h3>
    <div class="settings-details-body">
      <div class="settings-info-row">
        <span class="settings-info-row-label">
          ${raw(Heart('settings-info-row-icon'))} Membership
        </span>
        <span class="settings-membership" data-membership-tier>Supporter</span>
      </div>
      <div class="settings-info-row" data-row-provider hidden>
        <span class="settings-info-row-label">
          ${raw(KeyRound('settings-info-row-icon'))} Sign-in method
        </span>
        <span class="settings-info-row-value" data-provider-value></span>
      </div>
      <div class="settings-info-row" data-row-created hidden>
        <span class="settings-info-row-label">
          ${raw(calendarIconSvg())} Member since
        </span>
        <span class="settings-info-row-value" data-created-value></span>
      </div>
      <div class="settings-info-row" data-row-last hidden>
        <span class="settings-info-row-label">
          ${raw(Clock('settings-info-row-icon'))} Last sign-in
        </span>
        <span class="settings-info-row-value" data-last-value></span>
      </div>
      ${SettingsInfoRow({
        icon: Fingerprint,
        label: 'User ID',
        value: 'Local Account',
        copyable: true,
        dataCopy: 'userId'
      })}
      ${SettingsInfoRow({
        icon: ShieldCheck,
        label: 'Support Verification ID',
        value: 'Not Applicable',
        copyable: true,
        dataCopy: 'supportId'
      })}
    </div>
  </section>`;
}

function CloudSyncCta(): string {
  return html`<section class="settings-cloud-cta" data-cloud-cta>
    <h3 class="settings-cloud-title">
      ${raw(UserPlus('h-4 w-4'))} Cloud Synchronization
    </h3>
    <p class="settings-cloud-text">
      Create a ChessViewer account to sync your boards, history, and custom
      themes across all your devices. Your current local data will be
      automatically migrated to the cloud.
    </p>
    <div class="settings-cloud-actions">
      <a href="/auth/sign-up" class="settings-cloud-primary">
        ${raw(UserPlus('h-4 w-4'))} Add Account &amp; Sync Now
      </a>
      <a href="/auth/sign-in" class="settings-cloud-secondary">
        ${raw(LogIn('h-4 w-4'))} Sign In
      </a>
    </div>
  </section>`;
}

function AccountActions(): string {
  return html`<section
    class="settings-danger-section"
    data-account-actions
    hidden
  >
    <h3 class="settings-danger-title">
      ${raw(ShieldAlert('h-4 w-4'))} Manage Account
    </h3>
    <p class="settings-danger-text">
      Permanently erase your account and all associated cloud data. This action
      is irreversible. If you prefer support-handled deletion, email us with
      your
      <strong>Support Verification ID</strong>.
    </p>
    <div class="settings-danger-actions">
      <button type="button" class="settings-danger-btn" data-delete-account>
        ${raw(Trash2('h-4 w-4'))} Delete Account
      </button>
      <a
        href="mailto:${CONTACT_EMAIL}?subject=Account%20deletion%20request"
        class="settings-secondary-btn"
      >
        ${raw(Mail('h-4 w-4'))} Contact support to delete
      </a>
    </div>
  </section>`;
}

function AccountSection(): string {
  return html`<div class="settings-page-space">
    ${SettingsHeading({
      icon: UserIcon,
      title: 'Account',
      description:
        'Manage your identity, cloud sync and account data. Changes sync across devices when signed in.'
    })}
    ${IdentityHeader()} ${EmailCard()} ${AccountDetails()} ${CloudSyncCta()}
    ${AccountActions()}
    ${Modal({
      id: 'delete-account-modal',
      type: 'danger',
      title: 'Delete Account',
      children: html`
        <div class="space-y-4">
          <p class="text-sm text-text-secondary" data-delete-intro></p>
          <div class="space-y-3">
            <div>
              <label class="form-label" for="del-password">Password</label>
              <input
                id="del-password"
                type="password"
                placeholder="Your current password"
                class="input-field"
                data-delete-password
                autocomplete="current-password"
              />
            </div>
            <div data-delete-mfa-wrap>
              <label class="form-label" for="del-mfa"
                >2FA Verification Code</label
              >
              <input
                id="del-mfa"
                type="text"
                placeholder="6-digit code"
                maxlength="6"
                class="input-field"
                data-delete-mfa
                autocomplete="one-time-code"
              />
            </div>
            <p
              class="text-xs font-semibold text-error"
              data-delete-error
              hidden
            ></p>
            <p
              class="text-center text-xs text-text-muted"
              data-delete-progress
              hidden
            >
              Erase in progress...
            </p>
          </div>
        </div>
      `
    })}
  </div>`;
}

// ===== Appearance section =====

function AppearanceSection(): string {
  return html`<div class="settings-page-space">
    ${SettingsHeading({
      icon: Palette,
      title: 'Appearance',
      description:
        'Personalise how ChessViewer looks, saved on this device and synced when you sign in.'
    })}
    ${SettingsBlock({
      title: 'Theme',
      description:
        'Choose between light and dark themes, or follow your system setting.',
      children: html`
        <div class="settings-theme-mode">
          <span class="settings-block-subtitle">Theme mode</span>
          <div
            class="settings-theme-options"
            role="radiogroup"
            aria-label="Theme mode"
            data-theme-mode
          >
            ${themeOption('light', 'Light', Sun)}
            ${themeOption('dark', 'Dark', Moon, true)}
            ${themeOption('system', 'System', Monitor)}
          </div>
        </div>
        <p class="settings-hint-banner" data-dark-hint hidden>
          ${raw(Sparkles('settings-hint-icon'))}
          <span>
            ChessViewer is better optimised for
            <span class="settings-hint-accent">dark mode</span> — recommended.
          </span>
        </p>
      `
    })}
    ${SettingsBlock({
      title: 'Contrast',
      description:
        'Increase the contrast of borders and text against backgrounds for better readability. Applies on top of your Light or Dark theme.',
      children: html`
        <div
          class="settings-contrast-grid"
          role="radiogroup"
          aria-label="Contrast"
          data-contrast
        >
          ${contrastOption(
            'normal',
            'Default',
            'The standard balance of colour and legibility.',
            true
          )}
          ${contrastOption(
            'high',
            'High contrast',
            'Stronger borders and text for improved readability.'
          )}
        </div>
      `
    })}
  </div>`;
}

function themeOption(
  value: string,
  label: string,
  icon: typeof Sun,
  active = false
): string {
  return html`<button
    type="button"
    role="radio"
    aria-checked="${active}"
    data-theme-option="${value}"
    class="settings-theme-option ${active
      ? 'settings-theme-option-active'
      : ''}"
  >
    ${raw(icon('settings-theme-option-icon'))} ${label}
  </button>`;
}

function contrastOption(
  value: string,
  label: string,
  description: string,
  active = false
): string {
  return html`<button
    type="button"
    role="radio"
    aria-checked="${active}"
    data-contrast-option="${value}"
    class="settings-contrast-card ${active
      ? 'settings-contrast-card-active'
      : ''}"
  >
    ${raw(
      Contrast(
        "settings-contrast-icon ${active ? 'settings-contrast-icon-active' : ''}"
      )
    )}
    <span class="settings-contrast-info">
      <span class="settings-contrast-label">
        ${label} ${active ? raw(Check('settings-contrast-check')) : ''}
      </span>
      <span class="settings-contrast-desc">${description}</span>
    </span>
  </button>`;
}

// ===== Board section =====

const PRESET_THEMES: { light: string; dark: string; name: string }[] = [
  { light: '#F0D9B5', dark: '#B58863', name: 'Classic' },
  { light: '#EEEED2', dark: '#769656', name: 'Green' },
  { light: '#DEB887', dark: '#8B4513', name: 'Wood' },
  { light: '#E8E8E8', dark: '#A0A0A0', name: 'Gray' },
  { light: '#C8C8C8', dark: '#606060', name: 'Dark' },
  { light: '#FFCF9A', dark: '#D08A4E', name: 'Warm' },
  { light: '#EED4D4', dark: '#B48282', name: 'Rosy' },
  { light: '#D9E4F5', dark: '#8FA8CC', name: 'Blue' },
  { light: '#F0F0D5', dark: '#B5B57E', name: 'Olive' },
  { light: '#F5E6D3', dark: '#C89B6C', name: 'Tan' }
];

function BoardSection(): string {
  return html`<div class="settings-page-space">
    ${SettingsHeading({
      icon: LayoutGrid,
      title: 'Board Style',
      description:
        'Colours and pieces for the board and your exports. Saved on this device, and synced when signed in.'
    })}
    ${SettingsBlock({
      title: 'Square colours',
      children: html`
        <div class="settings-board-colours">
          <div class="settings-board-preview">
            <img
              class="settings-board-preview-img"
              data-board-preview
              alt="Chess board preview"
              aria-label="Board preview"
            />
          </div>
          <div class="settings-board-picker">
            <div class="settings-theme-presets" data-theme-presets>
              ${PRESET_THEMES.map(
                (t) =>
                  html`<button
                    type="button"
                    class="settings-theme-preset"
                    data-preset-light="${t.light}"
                    data-preset-dark="${t.dark}"
                    title="${t.name}"
                    aria-label="${t.name} theme"
                  >
                    <span
                      class="settings-theme-swatch"
                      style="background: linear-gradient(135deg, ${t.light} 50%, ${t.dark} 50%)"
                    ></span>
                  </button>`
              ).join('')}
            </div>
            <div class="settings-color-custom">
              <label class="settings-color-pick">
                <span>Light</span>
                <input
                  type="color"
                  data-color-input="light"
                  value="#f0d9b5"
                  aria-label="Light square color"
                />
              </label>
              <label class="settings-color-pick">
                <span>Dark</span>
                <input
                  type="color"
                  data-color-input="dark"
                  value="#b58863"
                  aria-label="Dark square color"
                />
              </label>
            </div>
          </div>
        </div>
      `
    })}
    ${SettingsBlock({
      title: 'Piece set',
      description: 'Pick the piece artwork used on the board and in exports.',
      action: html`<div style="width: 11rem">
        ${SettingsSelect({
          value: 'popular',
          options: [
            { value: 'popular', label: 'Most popular' },
            { value: 'name', label: 'Name (A–Z)' }
          ],
          dataSelect: 'pieceSort'
        })}
      </div>`,
      children: html`<div class="settings-piece-grid" data-piece-grid></div>`
    })}
  </div>`;
}

// ===== Accessibility section =====

const COLOR_VISION_OPTIONS = [
  { value: 'none', label: 'None — standard colours' },
  { value: 'deuteranopia', label: 'Deuteranopia (green-blind)' },
  { value: 'protanopia', label: 'Protanopia (red-blind)' },
  { value: 'tritanopia', label: 'Tritanopia (blue-blind)' }
];

const MOTION_OPTIONS = [
  { value: 'system', label: 'Follow system setting' },
  { value: 'reduce', label: 'Reduce motion' },
  { value: 'full', label: 'Always full motion' }
];

function AccessibilitySection(): string {
  return html`<div class="settings-page-space">
    ${SettingsHeading({
      icon: Eye,
      title: 'Accessibility',
      description:
        'Adapt ChessViewer to your visual needs. These settings are saved on this device and synced when signed in.'
    })}
    ${SettingsBlock({
      title: 'Color vision',
      description:
        'Simulate how the interface appears with common color vision deficiencies. Use this to verify that diagrams and UI remain readable for your condition.',
      children: html`
        <div class="space-y-3">
          <div style="max-width: 20rem">
            ${SettingsSelect({
              value: 'none',
              options: COLOR_VISION_OPTIONS,
              dataSelect: 'colorVision',
              label: 'Color vision mode'
            })}
          </div>
          <p class="settings-sim-banner" data-vision-banner hidden>
            <span class="settings-sim-accent">Simulation active.</span>
            <span data-vision-banner-text></span>
          </p>
        </div>
      `
    })}
    ${SettingsBlock({
      title: 'Reduced motion',
      description:
        'Replace animations and transitions with instant changes. ChessViewer follows your operating-system preference by default — choose Reduce or Always full to override it just for this app.',
      children: html`
        <div class="space-y-3">
          <div style="max-width: 20rem">
            ${SettingsSelect({
              value: 'system',
              options: MOTION_OPTIONS,
              dataSelect: 'motion',
              label: 'Motion'
            })}
          </div>
          <p class="settings-sim-banner" data-motion-banner hidden>
            <span class="settings-sim-accent">Reduced motion on.</span>
            <span
              >Animations across the app are replaced with instant transitions,
              regardless of your system setting.</span
            >
          </p>
          <div class="settings-os-panel" data-os-panel hidden>
            <p class="mb-2">
              This follows your operating system&apos;s motion setting. To
              change it, open:
            </p>
            <ul class="space-y-1">
              <li>
                <span class="settings-os-label">GNOME:</span> Settings →
                Accessibility → Seeing → Reduce Animation
              </li>
              <li>
                <span class="settings-os-label">macOS:</span> System Settings →
                Accessibility → Display → Reduce Motion
              </li>
              <li>
                <span class="settings-os-label">Windows:</span> Settings →
                Accessibility → Visual effects → Animation effects
              </li>
            </ul>
          </div>
        </div>
      `
    })}
  </div>`;
}

// ===== Security section =====

function SecurityOverview(): string {
  return html`<div class="settings-overview-grid">
    <div class="settings-overview-card">
      <span class="settings-overview-icon" data-mfa-status-icon>
        ${raw(ShieldX('settings-overview-icon-svg'))}
      </span>
      <div>
        <p class="settings-overview-label">Two-factor</p>
        <p class="settings-overview-value" data-mfa-status>Checking…</p>
      </div>
    </div>
    <div class="settings-overview-card">
      <span class="settings-overview-icon">
        ${raw(Clock('settings-overview-icon-svg'))}
      </span>
      <div>
        <p class="settings-overview-label">Last sign-in</p>
        <p class="settings-overview-value" data-last-signin>Unknown</p>
      </div>
    </div>
  </div>`;
}

function TwoFactorPanel(): string {
  return html`<div class="settings-mfa" data-mfa-panel>
    <div class="settings-mfa-loading" data-mfa-loading>
      ${raw(Loader2('settings-spinner'))} Checking 2FA status…
    </div>
    <div class="settings-mfa-setup" data-mfa-setup hidden>
      <button type="button" class="btn btn-primary" data-mfa-enable>
        ${raw(ShieldCheck('h-4 w-4'))} Enable Two-Factor
      </button>
      <p class="text-xs text-text-secondary">
        Use a time-based one-time passcode (TOTP) from an authenticator app as a
        second factor when you sign in.
      </p>
    </div>
    <div class="settings-mfa-enroll" data-mfa-enroll hidden>
      <p
        class="text-sm font-semibold text-text-primary"
        data-mfa-enroll-step
      ></p>
      <div class="settings-mfa-qr" data-mfa-qr hidden></div>
      <div class="settings-mfa-secret" data-mfa-secret hidden>
        <span class="settings-mfa-secret-code" data-mfa-secret-value></span>
        <button
          type="button"
          class="btn-icon-sm"
          data-mfa-secret-copy
          aria-label="Copy secret"
        >
          ${raw(copySvg())}
        </button>
      </div>
      <div class="settings-mfa-verify-row" data-mfa-verify-row hidden>
        <input
          type="text"
          inputmode="numeric"
          maxlength="6"
          placeholder="6-digit code"
          class="input-field"
          data-mfa-verify-code
          aria-label="Verification code"
        />
        <button type="button" class="btn btn-primary" data-mfa-verify>
          <span data-mfa-verify-label>Verify</span>
        </button>
      </div>
      <div class="settings-mfa-backup" data-mfa-backup hidden>
        <p class="text-xs font-semibold text-text-secondary">
          Backup codes — save them now:
        </p>
        <div class="settings-mfa-backup-codes" data-mfa-backup-codes></div>
        <div class="settings-mfa-backup-actions">
          <button
            type="button"
            class="btn btn-secondary btn-sm"
            data-mfa-copy-codes
          >
            ${raw(copySvg())} Copy codes
          </button>
          <button
            type="button"
            class="btn btn-secondary btn-sm"
            data-mfa-download-codes
          >
            ${raw(Download('h-4 w-4'))} Download
          </button>
          <button type="button" class="btn btn-primary btn-sm" data-mfa-done>
            Done
          </button>
        </div>
      </div>
      <p class="text-xs text-error" data-mfa-error hidden></p>
    </div>
    <div class="settings-mfa-enabled" data-mfa-enabled hidden>
      <div class="settings-mfa-enabled-head">
        ${raw(ShieldCheck('settings-mfa-enabled-icon'))}
        <div>
          <p class="text-sm font-semibold text-text-primary">
            Two-Factor Authentication is on
          </p>
          <p class="text-xs text-text-secondary">
            An authenticator app is required to sign in.
          </p>
        </div>
      </div>
      <button type="button" class="btn btn-danger btn-sm" data-mfa-disable>
        Disable 2FA
      </button>
    </div>
  </div>`;
}

function ChangePasswordCard(): string {
  return html`<div class="settings-password-card">
    <h3 class="settings-card-title">
      ${raw(KeyRound('h-4 w-4'))} Change Password
    </h3>
    <p class="text-xs text-text-secondary mb-3">
      Set a new password (at least 8 characters). It applies immediately on this
      device.
    </p>
    <div class="flex flex-col gap-2 settings-max-w-md">
      <input
        id="security-new-password"
        type="password"
        autocomplete="new-password"
        maxlength="128"
        placeholder="New password"
        class="input-field"
        data-new-password
      />
      <input
        id="security-confirm-password"
        type="password"
        autocomplete="new-password"
        maxlength="128"
        placeholder="Confirm new password"
        class="input-field"
        data-confirm-password
      />
      <p class="text-xs text-error" data-password-error hidden>
        Passwords do not match.
      </p>
      <div class="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          class="btn btn-primary"
          data-change-password
          disabled
        >
          <span data-change-password-label>Update Password</span>
        </button>
        <button
          type="button"
          class="btn btn-secondary"
          data-email-reset
          disabled
        >
          ${raw(RotateCcw('h-4 w-4'))}
          <span data-email-reset-label>Email a reset link</span>
        </button>
      </div>
    </div>
  </div>`;
}

function SecuritySection(): string {
  return html`<div class="settings-page-space">
    ${SettingsHeading({
      icon: ShieldCheck,
      title: 'Security',
      description:
        'Protect your account with two-factor authentication and control your sessions.'
    })}

    <div data-security-content>
      <div class="settings-signed-out-panel" data-security-signed-out>
        <p class="font-semibold text-text-primary">
          Sign in to manage security
        </p>
        <p class="mx-auto mt-2 text-sm text-text-secondary">
          Two-factor authentication and password management are available once
          you&apos;re signed in.
        </p>
      </div>

      <div class="settings-signed-in" data-security-signed-in hidden>
        ${SecurityOverview()}

        <section class="settings-card-stack">
          <div class="settings-card-stack-block">
            <h3 class="settings-card-title">Two-Factor Authentication</h3>
            <p class="text-xs text-text-secondary mb-3">
              Use a time-based one-time passcode (TOTP) from an authenticator
              app as a second factor when you sign in.
            </p>
            ${TwoFactorPanel()}
          </div>
          ${ChangePasswordCard()}
        </section>

        <section class="card-elevated">
          <h3 class="settings-card-title">
            ${raw(LogOut('h-4 w-4'))} Active Sessions
          </h3>
          <p class="text-xs text-text-secondary mb-3">
            Sign out of every device and browser at once. Use this if you
            suspect your account is signed in somewhere you don&apos;t
            recognise.
          </p>
          <button
            type="button"
            class="settings-danger-outline"
            data-signout-everywhere
          >
            <span data-signout-everywhere-label>Sign out everywhere</span>
          </button>
        </section>

        <section class="settings-activity card-elevated">
          <h3 class="settings-card-title">
            ${raw(History('h-4 w-4'))} Security Activity
          </h3>
          <div class="settings-activity-list" data-activity-list>
            <p class="text-xs text-text-muted">Loading activity…</p>
          </div>
        </section>

        <section class="card-elevated space-y-4">
          <h3 class="text-sm font-bold text-text-primary">Preferences</h3>
          ${SettingsSwitch({
            label: 'Confirm destructive actions',
            description:
              'Require a confirmation prompt before deleting data or your account.',
            dataSwitch: 'confirmDestructive',
            checked: true
          })}
          <div class="h-px bg-border/50"></div>
          ${SettingsSwitch({
            label: 'Hide sensitive details',
            description:
              'Mask your email and security identifiers on shared screens.',
            dataSwitch: 'hideSensitive'
          })}
        </section>
      </div>
    </div>
  </div>`;
}

// ===== Data management =====

function DataManagementSection(): string {
  const storageCategories = [
    { id: 'board', label: 'Board & display' },
    { id: 'history', label: 'History & favorites' },
    { id: 'themes', label: 'Custom themes' }
  ];

  return html`<div class="settings-page-space">
    <h2 class="settings-page-heading">
      ${raw(Database('settings-page-heading-icon'))} Data Management
    </h2>

    <section class="card-elevated">
      <div class="mb-4 flex items-center justify-between gap-3">
        <h4 class="settings-card-title">
          ${raw(HardDrive('h-4 w-4'))} Storage used on this browser
        </h4>
        <span class="settings-total-bytes" data-total-bytes>0 B</span>
      </div>
      <ul class="settings-storage-list">
        ${storageCategories
          .map(
            (cat) =>
              html`<li class="settings-storage-row">
                <span class="text-sm text-text-primary">${cat.label}</span>
                <span class="settings-storage-right">
                  <span
                    class="text-xs font-medium text-text-secondary"
                    data-storage-bytes="${cat.id}"
                    >0 B</span
                  >
                  <button
                    type="button"
                    class="settings-clear-btn"
                    data-clear-category="${cat.id}"
                    data-clear-label="${cat.label}"
                    disabled
                  >
                    Clear
                  </button>
                </span>
              </li>`
          )
          .join('')}
      </ul>
    </section>

    <div class="settings-data-rows">
      ${dataRow(
        'Export Data',
        'Download a JSON backup of your boards, history, and preferences from this browser.',
        'Export',
        'export',
        'primary',
        Download
      )}
      ${dataRow(
        'Import Data',
        'Restore from a previously exported backup file. Existing keys are overwritten.',
        'Choose File',
        'import',
        'neutral',
        Upload
      )}
      ${dataRow(
        'Clear FEN History',
        'Delete all saved FEN positions, favorites, and archive from this browser. Cannot be undone.',
        'Clear History',
        'clear-history',
        'danger',
        Clock
      )}
      ${dataRow(
        'Reset All Data',
        'Clear all ChessViewer data stored in this browser. This cannot be undone.',
        'Reset',
        'reset',
        'danger',
        RotateCcw
      )}
    </div>

    <input
      type="file"
      accept="application/json,.json"
      class="hidden"
      data-import-file
    />

    <div class="settings-message" data-settings-message hidden>
      <span class="settings-message-icon"
        >${raw(Check('settings-message-icon-svg'))}</span
      >
      <span data-settings-message-text></span>
    </div>

    ${Modal({
      id: 'data-confirm-modal',
      type: 'danger',
      title: 'Confirm',
      children: html`<p data-data-confirm-message></p>`
    })}
  </div>`;
}

function dataRow(
  title: string,
  description: string,
  actionLabel: string,
  dataAction: string,
  variant: 'primary' | 'neutral' | 'danger',
  icon: typeof Download
): string {
  return html`<div class="settings-data-row">
    <div class="settings-data-icon settings-data-icon-${variant}">
      ${raw(icon('settings-data-icon-svg'))}
    </div>
    <div class="settings-data-info">
      <p class="settings-data-title">${title}</p>
      <p class="settings-data-desc">${description}</p>
    </div>
    <button
      type="button"
      class="settings-data-action settings-data-action-${variant}"
      data-data-action="${dataAction}"
    >
      ${actionLabel}
    </button>
  </div>`;
}

// ===== Page =====

function calendarIconSvg(): string {
  return html`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M8 2v4"></path>
    <path d="M16 2v4"></path>
    <rect width="18" height="18" x="3" y="4" rx="2"></rect>
    <path d="M3 10h18"></path>
  </svg>`;
}

function copySvg(): string {
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

export interface SettingsPageOptions {
  tab?: string | null;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

export function SettingsPage(options: SettingsPageOptions = {}): string {
  const groups = getSettingsGroups();
  const requestedTab = options.tab;
  const activeTab =
    requestedTab && VALID_TAB_IDS.has(requestedTab) ? requestedTab : 'profile';

  const sidebar = PageTabs({
    groups,
    activeId: activeTab,
    ariaLabel: 'Settings sections'
  });

  const content = [
    ['profile', AccountSection],
    ['appearance', AppearanceSection],
    ['board', BoardSection],
    ['accessibility', AccessibilitySection],
    ['security', SecuritySection],
    ['data', DataManagementSection]
  ] as const;

  const panels = content
    .map(
      ([id, render]: readonly [string, () => string]) =>
        html`<div
          id="panel-${id}"
          role="tabpanel"
          data-settings-panel="${id}"
          ${id === activeTab ? '' : 'hidden'}
        >
          ${render()}
        </div>`
    )
    .join('');

  return html`
    <div
      class="settings-root"
      data-settings-root
      data-supabase-url="${options.supabaseUrl ?? ''}"
      data-supabase-anon-key="${options.supabaseAnonKey ?? ''}"
    >
      <h1 class="sr-only">Settings</h1>
      <div class="settings-page">
        ${PageSidebarLayout({
          sidebar,
          contentLabel: 'Settings',
          children: panels
        })}
      </div>
    </div>

    <script src="/settings-page.js"></script>
  `;
}
