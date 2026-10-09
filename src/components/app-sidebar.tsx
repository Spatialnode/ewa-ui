import * as React from "react";
import type { IconType } from "react-icons";
import {
  PiBellFill,
  PiCalendarFill,
  PiCaretDown,
  PiChartBarFill,
  PiFileTextFill,
  PiFolderFill,
  PiGearSixFill,
  PiHouseSimpleFill,
  PiPlusBold,
  PiQuestionFill,
  PiTrayFill,
  PiUsersFill,
} from "react-icons/pi";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type AppSidebarItem = {
  id: string;
  title: string;
  icon: IconType;
};

type AppSidebarUser = {
  name: string;
  role: string;
  avatar?: string;
};

const defaultMainItems: AppSidebarItem[] = [
  { id: "dashboard", title: "Dashboard", icon: PiHouseSimpleFill },
  { id: "projects", title: "Projects", icon: PiFolderFill },
  { id: "inbox", title: "Inbox", icon: PiTrayFill },
  { id: "calendar", title: "Calendar", icon: PiCalendarFill },
  { id: "analytics", title: "Analytics", icon: PiChartBarFill },
  { id: "reports", title: "Reports", icon: PiFileTextFill },
];

const defaultSecondaryItems: AppSidebarItem[] = [
  { id: "team", title: "Team", icon: PiUsersFill },
  { id: "settings", title: "Settings", icon: PiGearSixFill },
];

const defaultFooterItems: AppSidebarItem[] = [
  { id: "notifications", title: "Notifications", icon: PiBellFill },
  { id: "help", title: "Help & support", icon: PiQuestionFill },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function AppSidebarMenu({
  items,
  activeId,
  onNavigate,
}: {
  items: AppSidebarItem[];
  activeId?: string;
  onNavigate?: (id: string) => void;
}) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.id}>
          <SidebarMenuButton
            isActive={item.id === activeId}
            tooltip={item.title}
            onClick={() => onNavigate?.(item.id)}
          >
            <item.icon className="text-icon-default group-hover/menu-button:text-icon-nav group-data-active/menu-button:text-icon-nav" />
            <span>{item.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

function AppSidebar({
  logo = "Logo",
  className,
  user,
  mainItems = defaultMainItems,
  secondaryItems = defaultSecondaryItems,
  footerItems = defaultFooterItems,
  activeId = "dashboard",
  createLabel = "Create new",
  onNavigate,
  onCreate,
  onUserMenu,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  logo?: React.ReactNode;
  user: AppSidebarUser;
  mainItems?: AppSidebarItem[];
  secondaryItems?: AppSidebarItem[];
  footerItems?: AppSidebarItem[];
  activeId?: string;
  createLabel?: string;
  onNavigate?: (id: string) => void;
  onCreate?: () => void;
  onUserMenu?: () => void;
}) {
  return (
    <Sidebar
      collapsible="icon"
      className={cn("bg-surface-base", className)}
      {...props}
    >
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <div className="truncate text-sm font-semibold group-data-[collapsible=icon]:hidden">
            {logo}
          </div>
          <SidebarTrigger className="ml-auto group-data-[collapsible=icon]:size-6.5" />
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              variant="secondary"
              tooltip={createLabel}
              onClick={onCreate}
            >
              <PiPlusBold />
              <span>{createLabel}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <AppSidebarMenu
              items={mainItems}
              activeId={activeId}
              onNavigate={onNavigate}
            />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupContent>
            <AppSidebarMenu
              items={secondaryItems}
              activeId={activeId}
              onNavigate={onNavigate}
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <AppSidebarMenu
          items={footerItems}
          activeId={activeId}
          onNavigate={onNavigate}
        />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip={user.name}
              onClick={onUserMenu}
            >
              <Avatar>
                {user.avatar && (
                  <AvatarImage src={user.avatar} alt={user.name} />
                )}
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.role}</span>
              </div>
              <PiCaretDown className="ml-auto" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export { AppSidebar, type AppSidebarItem, type AppSidebarUser };
