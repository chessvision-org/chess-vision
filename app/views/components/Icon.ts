export type IconNode = [string, Record<string, string>];

export type IconFn = (className?: string, ariaHidden?: boolean) => string;

export function createIcon(iconName: string, iconNode: IconNode[]): IconFn {
  const inner = iconNode
    .map(([tag, attrs]) => {
      const attrStr = Object.entries(attrs)
        .map(([key, value]) => `${key}="${value}"`)
        .join(" ");
      return `<${tag} ${attrStr}></${tag}>`;
    })
    .join("");

  return (className?: string, ariaHidden?: boolean): string => {
    const cls = className ? `lucide lucide-${iconName} ${className}` : `lucide lucide-${iconName}`;
    const aria = ariaHidden ? ' aria-hidden="true"' : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}"${aria}>${inner}</svg>`;
  };
}
