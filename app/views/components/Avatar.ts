import { html } from "../helpers/html";
import { UserCircle } from "./icons";

interface AvatarInitialProps {
  displayName: string;
  size?: "sm" | "md";
}

export function AvatarInitial({ displayName, size = "sm" }: AvatarInitialProps) {
  const dimensions = size === "md" ? "avatar-md h-14 w-14" : "avatar-sm h-11 w-11";

  return html`<div class="avatar-initial ${dimensions}" aria-hidden="true">
    ${displayName ? displayName.charAt(0) : UserCircle("w-8 h-8")}
  </div>`;
}
