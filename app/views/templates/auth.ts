import { html, raw } from "../helpers/html";
import { PageSidebarLayout } from "../components/PageSidebarLayout";
import { PageTabs, type PageTabGroup } from "../components/PageTabs";
import {
  CheckCircle,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LogIn,
  MailCheck,
  ShieldAlert,
  UserPlus,
} from "../components/icons";

export type AuthPageName = "sign-in" | "sign-up" | "forgot-password" | "mfa";

const GROUPS: PageTabGroup[] = [
  {
    items: [
      { id: "sign-in", label: "Sign In", icon: LogIn },
      { id: "sign-up", label: "Sign Up", icon: UserPlus },
    ],
  },
];

function activeTab(pathname: string): string {
  if (
    pathname.includes("sign-in") ||
    pathname.includes("mfa") ||
    pathname.includes("forgot-password")
  ) {
    return "sign-in";
  }
  return "sign-up";
}

function AuthShell({ pathname, children }: { pathname: string; children: string }): string {
  const sidebar = PageTabs({
    groups: GROUPS,
    activeId: activeTab(pathname),
    ariaLabel: "Authentication sections",
  });

  return PageSidebarLayout({
    sidebar,
    contentLabel: "Authentication",
    children: html`<div class="auth-center">
      <div class="auth-card-wrap">${raw(children)}</div>
    </div>`,
  });
}

function FormFieldError({ id, dataField }: { id: string; dataField: string }): string {
  return html`<p id="${id}" class="auth-field-error" data-field-error="${dataField}" hidden></p>`;
}

function PasswordField({
  id,
  name,
  autoComplete,
  dataField,
  errorId,
  showBtnLabel,
}: {
  id: string;
  name: string;
  autoComplete: string;
  dataField: string;
  errorId: string;
  showBtnLabel: string;
}): string {
  return html`<div class="auth-password-wrap">
    <input
      id="${id}"
      name="${name}"
      type="password"
      autocomplete="${autoComplete}"
      class="auth-field auth-password-input"
      data-auth-field="${dataField}"
      aria-invalid="false"
      aria-describedby="${errorId}"
    />
    <button
      type="button"
      class="auth-password-toggle"
      data-password-toggle
      aria-label="${showBtnLabel}"
    >
      <span data-toggle-icon="show">${raw(Eye("auth-password-icon"))}</span>
      <span data-toggle-icon="hide" hidden>${raw(EyeOff("auth-password-icon"))}</span>
    </button>
  </div>`;
}

function SubmitButton({ dataSubmit, label }: { dataSubmit: string; label: string }): string {
  return html`<button type="submit" class="auth-submit-btn" data-submit-btn="${dataSubmit}">
    <span data-spinner hidden>${raw(Loader2("auth-submit-spinner"))}</span>
    <span data-submit-label>${label}</span>
  </button>`;
}

function AuthLink({ href, children }: { href: string; children: string }): string {
  return html`<a href="${href}" class="auth-link">${children}</a>`;
}

export function SignInPage(pathname: string): string {
  return AuthShell({
    pathname,
    children: html`
      <div class="auth-heading">
        <h1 class="auth-title">Welcome back</h1>
        <p class="auth-subtitle">Sign in to sync your boards across devices.</p>
      </div>

      <form id="signin-form" class="auth-form" data-auth-form="sign-in" novalidate>
        <div class="auth-alert" data-form-error role="alert" hidden></div>

        <div class="auth-field-group">
          <label for="signin-email" class="auth-label">Email</label>
          <input
            id="signin-email"
            name="email"
            type="email"
            autocomplete="email"
            class="auth-field"
            data-auth-field="email"
            aria-invalid="false"
            aria-describedby="signin-email-error"
          />
          ${FormFieldError({ id: "signin-email-error", dataField: "email" })}
        </div>

        <div class="auth-field-group">
          <label for="signin-password" class="auth-label">Password</label>
          ${PasswordField({
            id: "signin-password",
            name: "password",
            autoComplete: "current-password",
            dataField: "password",
            errorId: "signin-password-error",
            showBtnLabel: "Show password",
          })}
          ${FormFieldError({ id: "signin-password-error", dataField: "password" })}
        </div>

        <div class="auth-forgot-row">
          ${AuthLink({ href: "/auth/forgot-password", children: "Forgot password?" })}
        </div>

        ${SubmitButton({ dataSubmit: "sign-in", label: "Sign In" })}
      </form>

      <p class="auth-bottom-text">
        New here? ${AuthLink({ href: "/auth/sign-up", children: "Create an account" })}
      </p>
    `,
  });
}

export function SignUpPage(pathname: string): string {
  return AuthShell({
    pathname,
    children: html`
      <div class="auth-heading">
        <h1 class="auth-title">Create your account</h1>
        <p class="auth-subtitle">Save your boards to the cloud and sync everywhere.</p>
      </div>

      <div class="auth-success-card" data-signup-success hidden>
        <div class="auth-success-icon">${raw(MailCheck("auth-success-icon-svg"))}</div>
        <h1 class="auth-success-title">Check your email</h1>
        <p class="auth-success-text">
          We sent a confirmation link to finish setting up your account.
        </p>
        ${AuthLink({ href: "/auth/sign-in", children: "Back to Sign In" })}
      </div>

      <form id="signup-form" class="auth-form" data-auth-form="sign-up" novalidate>
        <div class="auth-alert" data-form-error role="alert" hidden></div>

        <div class="auth-field-group">
          <label for="signup-email" class="auth-label">Email</label>
          <input
            id="signup-email"
            name="email"
            type="email"
            autocomplete="email"
            class="auth-field"
            data-auth-field="email"
            aria-invalid="false"
            aria-describedby="signup-email-error"
          />
          ${FormFieldError({ id: "signup-email-error", dataField: "email" })}
        </div>

        <div class="auth-field-group">
          <label for="signup-password" class="auth-label">Password</label>
          ${PasswordField({
            id: "signup-password",
            name: "password",
            autoComplete: "new-password",
            dataField: "password",
            errorId: "signup-password-error",
            showBtnLabel: "Show password",
          })}
          <div
            class="auth-meter"
            data-strength-meter
            role="meter"
            aria-label="Password strength"
            aria-valuemin="0"
            aria-valuemax="4"
            aria-valuenow="0"
            hidden
          >
            ${[0, 1, 2, 3]
              .map((i) => html`<span class="auth-meter-bar" data-strength-bar="${i}"></span>`)
              .join("")}
          </div>
          <div class="auth-strength-info" data-strength-info hidden>
            <span class="auth-strength-label" data-strength-label></span>
            <span class="auth-strength-missing" data-strength-missing></span>
          </div>
          ${FormFieldError({ id: "signup-password-error", dataField: "password" })}
        </div>

        <div class="auth-field-group">
          <label for="signup-confirm" class="auth-label">Confirm Password</label>
          ${PasswordField({
            id: "signup-confirm",
            name: "confirm-password",
            autoComplete: "new-password",
            dataField: "confirm",
            errorId: "signup-confirm-error",
            showBtnLabel: "Show confirm password",
          })}
          ${FormFieldError({ id: "signup-confirm-error", dataField: "confirm" })}
        </div>

        ${SubmitButton({ dataSubmit: "sign-up", label: "Create Account" })}
      </form>

      <p class="auth-bottom-text">
        Already have an account? ${AuthLink({ href: "/auth/sign-in", children: "Sign in" })}
      </p>
    `,
  });
}

export function ForgotPasswordPage(pathname: string): string {
  return AuthShell({
    pathname,
    children: html`
      <div class="auth-heading">
        <h1 class="auth-title">Reset your password</h1>
        <p class="auth-subtitle">Enter your email and we'll send you a reset link.</p>
      </div>

      <div class="auth-success-card" data-forgot-success hidden>
        <div class="auth-success-icon">${raw(MailCheck("auth-success-icon-svg"))}</div>
        <h1 class="auth-success-title">Check your email</h1>
        <p class="auth-success-text">
          If an account exists for that address, we sent a reset link.
        </p>
        ${AuthLink({ href: "/auth/sign-in", children: "Back to Sign In" })}
      </div>

      <form id="forgot-form" class="auth-form" data-auth-form="forgot-password" novalidate>
        <div class="auth-alert" data-form-error role="alert" hidden></div>

        <div class="auth-field-group">
          <label for="forgot-email" class="auth-label">Email</label>
          <input
            id="forgot-email"
            name="email"
            type="email"
            autocomplete="email"
            class="auth-field"
            data-auth-field="email"
            aria-invalid="false"
            aria-describedby="forgot-email-error"
          />
          ${FormFieldError({ id: "forgot-email-error", dataField: "email" })}
        </div>

        ${SubmitButton({ dataSubmit: "forgot-password", label: "Send reset link" })}
      </form>

      <p class="auth-bottom-text">
        ${AuthLink({ href: "/auth/sign-in", children: "Back to Sign In" })}
      </p>
    `,
  });
}

export function MfaChallengePage(pathname: string): string {
  return AuthShell({
    pathname,
    children: html`
      <div class="auth-mfa-head">
        <div class="auth-mfa-icon">
          <span data-mfa-icon="totp">${raw(ShieldAlert("auth-mfa-icon-svg"))}</span>
          <span data-mfa-icon="backup" hidden>${raw(KeyRound("auth-mfa-icon-svg"))}</span>
        </div>
        <h1 class="auth-title" data-mfa-title>Two-Factor Authentication</h1>
        <p class="auth-subtitle" data-mfa-subtitle>
          Enter the 6-digit code from your authenticator app.
        </p>
      </div>

      <div class="auth-alert auth-alert-center" data-form-error role="alert" hidden></div>

      <form id="mfa-form" class="auth-form" data-auth-form="mfa" novalidate>
        <div class="auth-field-group">
          <label for="mfa-code" class="sr-only">Authenticator code</label>
          <input
            id="mfa-code"
            name="code"
            type="text"
            inputmode="numeric"
            placeholder="000000"
            class="auth-mfa-code"
            data-mfa-code
            maxlength="6"
            required
            autofocus
            autocomplete="one-time-code"
          />
        </div>

        ${SubmitButton({ dataSubmit: "mfa", label: "Verify & Sign In" })}
      </form>

      <div class="auth-mfa-footer">
        <button type="button" class="auth-link auth-mode-toggle" data-mfa-toggle>
          Use a backup code instead
        </button>
        ${AuthLink({ href: "/auth/sign-in", children: "Back to Sign In" })}
      </div>
    `,
  });
}

export function AuthSuccessNote(): string {
  return html`<div class="auth-note">
    <span class="auth-note-icon">${raw(CheckCircle("auth-note-icon-svg"))}</span>
    <span>Your session is active.</span>
  </div>`;
}
