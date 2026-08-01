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
  isAuthenticated,
  avatarSize,
}: {
  displayName: string;
  isAuthenticated: boolean;
  avatarSize: "sm" | "md";
}) {
  const fallbackName = isAuthenticated ? "ChessViewer user" : "Local user";
  return html`<div class="profile-header">
    ${AvatarInitial({ displayName, size: avatarSize })}
    <div class="profile-info">
      <p class="profile-name">${displayName || fallbackName}</p>
      ${MembershipBadge({ tier: NONE_TIER, variant: "plain" })}
    </div>
  </div>`;
}

function NavLink({
  href,
  icon,
  label,
  iconClass,
}: {
  href: string;
  icon: (className?: string) => string;
  label: string;
  iconClass: string;
}) {
  return html`<a href="${href}" class="menu-item"
    ><span class="${iconClass}">${icon()}</span><span>${label}</span></a
  >`;
}

function AuthActions({
  isAuthenticated,
  iconClass,
}: {
  isAuthenticated: boolean;
  iconClass: string;
}) {
  if (isAuthenticated) {
    return html`<button type="button" data-signout class="menu-item-danger">
      <span class="${iconClass} menu-icon-danger">${LogOut()}</span
      ><span class="text-error">Sign Out</span>
    </button>`;
  }

  return html`${NavLink({
    href: "/auth/sign-in",
    icon: LogIn,
    label: "Sign In",
    iconClass,
  })}
  ${NavLink({
    href: "/auth/sign-up",
    icon: UserPlus,
    label: "Sign Up",
    iconClass,
  })}`;
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
            <div class="desktop-dropdown-wrap" id="desktop-dropdown-wrap">
              <button
                type="button"
                id="desktop-dropdown-toggle"
                class="dropdown-toggle"
                aria-label="Account menu"
                aria-expanded="false"
                aria-haspopup="menu"
              >
                <span class="toggle-icon" data-nav-icon="open">${UserCircle()}</span>
                <span class="toggle-icon hidden" data-nav-icon="close">${X()}</span>
              </button>

              <div class="dropdown-panel dropdown-panel-anim" data-state="closed" role="menu">
                <div class="px-2 pb-1">
                  ${ProfileHeader({ displayName, isAuthenticated, avatarSize: "md" })}
                </div>
                <div class="h-px bg-border my-3"></div>
                <div class="dropdown-links">
                  ${NavLink({
                    href: "/settings?tab=profile",
                    icon: Settings,
                    label: "Settings",
                    iconClass: "menu-icon",
                  })}
                  ${NavLink({
                    href: "/about",
                    icon: Info,
                    label: "About",
                    iconClass: "menu-icon",
                  })}
                </div>
                <div class="h-px bg-border my-3"></div>
                <div class="dropdown-links">
                  ${AuthActions({ isAuthenticated, iconClass: "menu-icon" })}
                </div>
              </div>
            </div>
          </div>

          <div class="mobile-menu-wrap">
            ${rightSlot}
            <button
              type="button"
              id="mobile-toggle"
              class="toggle-btn"
              aria-label="Account menu"
              aria-expanded="false"
              aria-haspopup="menu"
            >
              <span class="toggle-icon" data-nav-icon="open">${UserCircle()}</span>
              <span class="toggle-icon hidden" data-nav-icon="close">${X()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="mobile-backdrop" id="mobile-backdrop" data-state="closed" aria-hidden="true"></div>

    <div class="mobile-panel" id="mobile-panel" data-state="closed">
      <div class="page-container">
        <div class="mobile-content">
          <div class="menu-section">
            ${ProfileHeader({ displayName, isAuthenticated, avatarSize: "sm" })}
          </div>
          <div class="menu-divider"></div>
          <div class="menu-section">
            ${NavLink({
              href: "/settings?tab=profile",
              icon: Settings,
              label: "Settings",
              iconClass: "menu-icon menu-icon-lg",
            })}
            ${NavLink({
              href: "/about",
              icon: Info,
              label: "About",
              iconClass: "menu-icon menu-icon-lg",
            })}
          </div>
          <div class="menu-divider"></div>
          <div class="menu-section">
            ${AuthActions({
              isAuthenticated,
              iconClass: "menu-icon menu-icon-lg",
            })}
          </div>
        </div>
      </div>
    </div>
  </nav>`;
}
