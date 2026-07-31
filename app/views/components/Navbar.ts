import { html } from "../helpers/html";
import { AvatarInitial } from "./Avatar";
import { Logo } from "./Logo";
import { MembershipBadge, NONE_TIER } from "./MembershipBadge";
import { Info, LogIn, LogOut, Settings, UserCircle, UserPlus, X } from "./icons";

interface NavbarProps {
  isAuthenticated?: boolean;
  rightSlot?: string;
  displayName?: string;
}

function ProfileHeader({
  displayName,
  avatarSize,
}: {
  displayName: string;
  avatarSize: "sm" | "md";
}) {
  return html`<div class="profile-header">
    ${AvatarInitial({ displayName, size: avatarSize })}
    <div class="profile-info">
      <p class="profile-name">${displayName || "Local user"}</p>
      ${MembershipBadge({ tier: NONE_TIER, variant: "plain" })}
    </div>
  </div>`;
}

function NavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: (className?: string) => string;
  label: string;
}) {
  return html`<a href="${href}" @click="closeAll()" class="menu-item"
    ><span class="menu-icon">${icon()}</span><span>${label}</span></a
  >`;
}

function AuthActions({ isAuthenticated }: { isAuthenticated: boolean }) {
  if (isAuthenticated) {
    return html`<button type="button" @click="signOut()" class="menu-item-danger">
      <span class="menu-icon menu-icon-danger">${LogOut()}</span
      ><span class="text-error">Sign Out</span>
    </button>`;
  }

  return html`${NavLink({
    href: "/auth/sign-in",
    icon: LogIn,
    label: "Sign In",
  })}
  ${NavLink({ href: "/auth/sign-up", icon: UserPlus, label: "Sign Up" })}`;
}

export function Navbar({
  isAuthenticated = false,
  rightSlot = "",
  displayName = "",
}: NavbarProps = {}) {
  return html`<nav class="nav">
    <div class="nav-inner">
      <div class="page-container">
        <div class="nav-container">
          <a href="/" class="logo-btn" aria-label="ChessViewer home">
            <span class="logo-inner">
              ${Logo()}
              <span class="logo-text-wrap"><span class="logo-text">ChessViewer</span></span>
            </span>
          </a>

          <div class="desktop-menu-wrap">
            ${rightSlot}
            <div class="desktop-dropdown-wrap" @click.outside="isDesktopDropdownOpen = false">
              <button
                type="button"
                @click="isDesktopDropdownOpen = !isDesktopDropdownOpen"
                :class="isDesktopDropdownOpen ? 'dropdown-toggle dropdown-toggle-active' : 'dropdown-toggle'"
                aria-label="Account menu"
                :aria-expanded="isDesktopDropdownOpen"
                aria-haspopup="menu"
              >
                <template x-if="isDesktopDropdownOpen"
                  ><span class="toggle-icon">${X()}</span></template
                >
                <template x-if="!isDesktopDropdownOpen"
                  ><span class="toggle-icon">${UserCircle()}</span></template
                >
              </button>

              <div
                class="dropdown-panel dropdown-panel-anim"
                :data-state="isDesktopDropdownOpen ? 'open' : 'closed'"
                role="menu"
              >
                <div class="px-2 pb-1">${ProfileHeader({ displayName, avatarSize: "md" })}</div>
                <div class="h-px bg-border my-3"></div>
                <div class="dropdown-section">
                  ${NavLink({
                    href: "/settings?tab=profile",
                    icon: Settings,
                    label: "Settings",
                  })}
                  ${NavLink({ href: "/about", icon: Info, label: "About" })}
                </div>
                <div class="h-px bg-border my-3"></div>
                <div class="dropdown-section">${AuthActions({ isAuthenticated })}</div>
              </div>
            </div>
          </div>

          <div class="mobile-menu-wrap">
            ${rightSlot}
            <button
              type="button"
              @click="isMobileMenuOpen = !isMobileMenuOpen; isDesktopDropdownOpen = false"
              :class="isMobileMenuOpen ? 'toggle-btn toggle-btn-open' : 'toggle-btn toggle-btn-closed'"
              aria-label="Account menu"
              :aria-expanded="isMobileMenuOpen"
              aria-haspopup="menu"
            >
              <template x-if="isMobileMenuOpen"><span class="toggle-icon">${X()}</span></template>
              <template x-if="!isMobileMenuOpen"
                ><span class="toggle-icon">${UserCircle()}</span></template
              >
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      class="mobile-backdrop"
      :data-state="isMobileMenuOpen ? 'open' : 'closed'"
      aria-hidden="true"
      @click="isMobileMenuOpen = false"
    ></div>

    <div class="mobile-panel" :data-state="isMobileMenuOpen ? 'open' : 'closed'">
      <div class="page-container">
        <div class="mobile-content">
          <div class="menu-section">${ProfileHeader({ displayName, avatarSize: "sm" })}</div>
          <div class="menu-divider"></div>
          <div class="menu-section">
            ${NavLink({
              href: "/settings?tab=profile",
              icon: Settings,
              label: "Settings",
            })}
            ${NavLink({ href: "/about", icon: Info, label: "About" })}
          </div>
          <div class="menu-divider"></div>
          <div class="menu-section">${AuthActions({ isAuthenticated })}</div>
        </div>
      </div>
    </div>
  </nav>`;
}
