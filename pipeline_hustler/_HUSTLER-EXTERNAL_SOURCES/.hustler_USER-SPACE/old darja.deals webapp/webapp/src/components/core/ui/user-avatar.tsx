"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
type StatusType = "online" | "away" | "busy" | "offline";

interface UserAvatarProps {
    src?: string;
    name?: string;
    size?: AvatarSize;
    status?: StatusType;
    showStatus?: boolean;
    className?: string;
    onClick?: () => void;
}

// ============================================================================
// SIZE CONFIGS
// ============================================================================

const sizeClasses: Record<AvatarSize, { avatar: string; status: string; text: string }> = {
    xs: { avatar: "h-6 w-6", status: "h-2 w-2", text: "text-[10px]" },
    sm: { avatar: "h-8 w-8", status: "h-2.5 w-2.5", text: "text-xs" },
    md: { avatar: "h-10 w-10", status: "h-3 w-3", text: "text-sm" },
    lg: { avatar: "h-12 w-12", status: "h-3.5 w-3.5", text: "text-base" },
    xl: { avatar: "h-16 w-16", status: "h-4 w-4", text: "text-lg" },
};

const statusColors: Record<StatusType, string> = {
    online: "bg-green-500",
    away: "bg-amber-500",
    busy: "bg-red-500",
    offline: "bg-gray-400",
};

// ============================================================================
// GET INITIALS
// ============================================================================

function getInitials(name?: string): string {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ============================================================================
// USER AVATAR
// ============================================================================

export function UserAvatar({
    src,
    name,
    size = "md",
    status,
    showStatus = true,
    className,
    onClick,
}: UserAvatarProps) {
    const sizes = sizeClasses[size];
    const initials = getInitials(name);

    return (
        <div
            className={cn("relative inline-flex", className)}
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {/* Avatar */}
            {src ? (
                // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
                <img
                    src={src}
                    alt={name || "User avatar"}
                    className={cn(
                        sizes.avatar,
                        "rounded-full object-cover",
                        "ring-2 ring-background",
                        onClick && "cursor-pointer hover:ring-primary/30 transition-all"
                    )}
                />
            ) : (
                <div
                    className={cn(
                        sizes.avatar,
                        sizes.text,
                        "rounded-full flex items-center justify-center",
                        "bg-primary/20 text-primary font-semibold",
                        "ring-2 ring-background",
                        onClick && "cursor-pointer hover:ring-primary/30 transition-all"
                    )}
                >
                    {initials}
                </div>
            )}

            {/* Status Indicator */}
            {showStatus && status && (
                <span
                    className={cn(
                        "absolute bottom-0 right-0",
                        "rounded-full ring-2 ring-background",
                        sizes.status,
                        statusColors[status]
                    )}
                />
            )}
        </div>
    );
}

// ============================================================================
// AVATAR GROUP
// ============================================================================

interface AvatarGroupProps {
    users: Array<{ src?: string; name?: string }>;
    max?: number;
    size?: AvatarSize;
    className?: string;
}

export function AvatarGroup({
    users,
    max = 4,
    size = "sm",
    className,
}: AvatarGroupProps) {
    const displayUsers = users.slice(0, max);
    const remaining = users.length - max;
    const sizes = sizeClasses[size];

    return (
        <div className={cn("flex -space-x-2", className)}>
            {displayUsers.map((user, index) => (
                <UserAvatar
                    key={index}
                    src={user.src}
                    name={user.name}
                    size={size}
                    showStatus={false}
                />
            ))}
            {remaining > 0 && (
                <div
                    className={cn(
                        sizes.avatar,
                        sizes.text,
                        "rounded-full flex items-center justify-center",
                        "bg-muted text-muted-foreground font-medium",
                        "ring-2 ring-background"
                    )}
                >
                    +{remaining}
                </div>
            )}
        </div>
    );
}

// ============================================================================
// USER PROFILE BUTTON (for header)
// ============================================================================

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/core/ui/dropdown-menu";
import { User, Settings, LogOut, Moon, Sun, Monitor, Users, CreditCard } from "lucide-react";
import { useTheme } from "@/components/core/ui/theme-provider";
import Link from "next/link";
import { Theme } from "@/components/core/ui/theme-provider";

interface UserProfileButtonProps {
    name?: string;
    email?: string;
    src?: string;
    status?: StatusType;
    className?: string;
}

export function UserProfileButton({
    name = "User",
    email,
    src,
    status = "online",
    className,
}: UserProfileButtonProps) {
    const { setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className={cn("flex items-center gap-2 p-1 rounded-full hover:bg-muted transition-colors outline-none", className)}>
                    <UserAvatar src={src} name={name} size="sm" status={status} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/admin/general" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/admin/team" className="cursor-pointer">
                        <Users className="mr-2 h-4 w-4" />
                        <span>Team & Security</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/admin/billing" className="cursor-pointer">
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Credits & Billing</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/admin/general" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span>Theme</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => setTheme("light")}>
                            <Sun className="mr-2 h-4 w-4" />
                            <span>Light</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")}>
                            <Moon className="mr-2 h-4 w-4" />
                            <span>Dark</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("system")}>
                            <Monitor className="mr-2 h-4 w-4" />
                            <span>System</span>
                        </DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={() => alert("Logout Logic")}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
