/**
 * Codicon icon component wrapping the @vscode/codicons icon font.
 *
 * Browse all icons: https://microsoft.github.io/vscode-codicons/dist/codicon.html
 *
 * @example
 * <Codicon name="add" />
 * <Codicon name="settings-gear" className="text-accent" />
 * <Codicon name="loading" spin />
 */
export function Codicon({
  name,
  spin,
  className = "",
  ...props
}: {
  name: string;
  spin?: boolean;
  className?: string;
} & React.HTMLAttributes<HTMLSpanElement>) {
  const classes = [
    "codicon",
    `codicon-${name}`,
    spin ? "codicon-modifier-spin" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <span className={classes} aria-hidden="true" {...props} />;
}
