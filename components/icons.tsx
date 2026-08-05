/** Minimal inline icon set. All icons inherit currentColor. */

type IconProps = { className?: string };

function Svg({
  className,
  children,
  viewBox = "0 0 24 24",
}: IconProps & { children: React.ReactNode; viewBox?: string }) {
  return (
    <svg aria-hidden viewBox={viewBox} className={className} fill="currentColor">
      {children}
    </svg>
  );
}

export function ChevronDown({ className }: IconProps) {
  return (
    <Svg className={className} viewBox="0 0 16 16">
      <path
        d="M3 6l5 5 5-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </Svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3 6h18v1.6H3zM3 11.2h18v1.6H3zM3 16.4h18V18H3z" />
    </Svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.6" fill="none" />
    </Svg>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6.6 2.8c.5-.5 1.3-.4 1.7.1l1.9 2.4c.4.5.3 1.1-.1 1.6l-1 1c.9 1.9 2.4 3.4 4.3 4.3l1-1c.4-.4 1.1-.5 1.6-.1l2.4 1.9c.6.4.6 1.2.1 1.7l-1.4 1.4c-.5.5-1.2.7-1.9.5-5-1.4-8.9-5.3-10.3-10.3-.2-.7 0-1.4.5-1.9z" />
    </Svg>
  );
}

export function WhatsAppIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 1.8a8.2 8.2 0 1 1-4.2 15.2l-.5-.3-3 .8.8-2.9-.3-.5A8.2 8.2 0 0 1 12 3.8zM8.9 7.4c-.2 0-.5.1-.7.3-.6.7-1 1.7-.6 2.9.5 1.4 1.5 2.9 3.1 4.1 1.4 1 2.7 1.5 3.9 1.6 1 .1 1.9-.4 2.3-1.1.2-.4.3-.9.2-1.1-.1-.2-.3-.3-.6-.4l-1.8-.9c-.3-.1-.5-.1-.7.1l-.7.8c-.2.2-.4.2-.6.1-1.1-.5-2.2-1.5-2.9-2.7-.1-.2-.1-.4.1-.6l.7-.8c.2-.2.2-.5.1-.7l-.9-1.9c-.2-.4-.4-.6-.7-.7h-.2z" />
    </Svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm0 1.8A3.7 3.7 0 0 0 3.8 7.5v9a3.7 3.7 0 0 0 3.7 3.7h9a3.7 3.7 0 0 0 3.7-3.7v-9a3.7 3.7 0 0 0-3.7-3.7h-9zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4zm5.3-3a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z" />
    </Svg>
  );
}

export function TikTokIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M16.6 3c.4 2 1.8 3.5 3.9 3.8v2.6c-1.5 0-2.9-.5-3.9-1.3v5.7a5.9 5.9 0 1 1-5.9-5.9c.3 0 .7 0 1 .1v2.7a3.2 3.2 0 1 0 2.2 3V3h2.7z" />
    </Svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M13.5 21v-7h2.4l.4-2.8h-2.8V9.4c0-.8.3-1.4 1.5-1.4h1.4V5.5c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5v2.3H8.5V14H11v7h2.5z" />
    </Svg>
  );
}

export function YouTubeIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.3 5 12 5 12 5s-6.3 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12c0 1.6.1 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.7 19 12 19 12 19s6.3 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.3-1.6.4-3.2.4-4.8s-.1-3.2-.4-4.8zM10 15.2V8.8L15.5 12 10 15.2z" />
    </Svg>
  );
}

export function LinkedInIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4.9 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM3.2 8.5h3.4V21H3.2V8.5zm6 0h3.3v1.7c.5-.9 1.7-1.9 3.6-1.9 3.8 0 4.5 2.5 4.5 5.7V21h-3.4v-6.2c0-1.5 0-3.4-2.1-3.4s-2.5 1.6-2.5 3.3V21H9.2V8.5z" />
    </Svg>
  );
}

export const SOCIAL_ICONS = {
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  facebook: FacebookIcon,
  youtube: YouTubeIcon,
  linkedin: LinkedInIcon,
} as const;
