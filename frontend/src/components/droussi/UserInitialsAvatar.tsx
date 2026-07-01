import { getInitials } from "../../lib/userDisplay";

interface UserInitialsAvatarProps {
  name: string;
  size?: number;
  className?: string;
}

export function UserInitialsAvatar({
  name,
  size = 32,
  className,
}: UserInitialsAvatarProps) {
  const initials = getInitials(name);
  const fontSize = size <= 32 ? 12 : 16;

  return (
    <div
      role="img"
      aria-label={name}
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#0069e0",
        border: size > 32 ? "2px solid #cce7ff" : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontFamily: "'Inter', sans-serif",
        fontSize,
        fontWeight: 600,
        color: "#fff",
        letterSpacing: "-0.02em",
        userSelect: "none",
      }}
    >
      {initials}
    </div>
  );
}
