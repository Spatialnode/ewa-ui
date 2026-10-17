// src/components/ui/dropdown-menu.stories.tsx
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  PiCaretDown,
  PiDotsThreeVerticalBold,
  PiExportFill,
  PiGearSixFill,
  PiPencilSimpleFill,
  PiSignOutFill,
  PiTrashFill,
  PiUserFill,
} from "react-icons/pi";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu";

const meta = {
  title: "UI/DropdownMenu",
  component: DropdownMenu,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    modal: { control: "boolean" },
  },
  args: {
    modal: true,
  },
} satisfies Meta<typeof DropdownMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger render={<Button variant="secondary" />}>
        Open menu
        <PiCaretDown />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Team</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithIconsAndShortcuts: Story = {
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger render={<Button variant="secondary" />}>
        Account
        <PiCaretDown />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>My account</DropdownMenuLabel>
          <DropdownMenuItem>
            <PiUserFill />
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <PiGearSixFill />
            Settings
            <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <PiSignOutFill />
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

// Row actions menu, e.g. on a site in the data table.
export const RowActions: Story = {
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}
      >
        <PiDotsThreeVerticalBold />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem>
          <PiPencilSimpleFill />
          Edit site
        </DropdownMenuItem>
        <DropdownMenuItem>
          <PiExportFill />
          Export
        </DropdownMenuItem>
        <DropdownMenuItem disabled>Duplicate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <PiTrashFill />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

// Multi-select, as in the notification channel picker in Settings.
export const Checkboxes: Story = {
  render: function Render(args) {
    const [channels, setChannels] = React.useState({
      inApp: true,
      email: false,
    });
    const label =
      [channels.inApp && "In-app", channels.email && "Email"]
        .filter(Boolean)
        .join(", ") || "None";

    return (
      <DropdownMenu {...args}>
        <DropdownMenuTrigger render={<Button variant="secondary" />}>
          {label}
          <PiCaretDown />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuCheckboxItem
            checked={channels.inApp}
            onCheckedChange={(inApp) => setChannels((c) => ({ ...c, inApp }))}
          >
            In-app
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={channels.email}
            onCheckedChange={(email) => setChannels((c) => ({ ...c, email }))}
          >
            Email
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

// Single-select, as in the Appearance picker in Settings.
export const RadioItems: Story = {
  render: function Render(args) {
    const [theme, setTheme] = React.useState("light");
    const options = [
      { value: "light", label: "Light mode" },
      { value: "dark", label: "Dark mode" },
      { value: "system", label: "System" },
    ];

    return (
      <DropdownMenu {...args}>
        <DropdownMenuTrigger render={<Button variant="secondary" />}>
          {options.find((o) => o.value === theme)?.label}
          <PiCaretDown />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Appearance</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={theme}
              onValueChange={(value) => setTheme(value as string)}
            >
              {options.map((o) => (
                <DropdownMenuRadioItem key={o.value} value={o.value}>
                  {o.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

export const WithSubmenu: Story = {
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger render={<Button variant="secondary" />}>
        Options
        <PiCaretDown />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuItem>New site</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Export as</DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-36">
            <DropdownMenuItem>PDF</DropdownMenuItem>
            <DropdownMenuItem>Excel</DropdownMenuItem>
            <DropdownMenuItem>CSV</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem inset>Inset item</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const Positioning: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-4">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <DropdownMenu key={side} {...args}>
          <DropdownMenuTrigger render={<Button variant="secondary" />}>
            {side}
          </DropdownMenuTrigger>
          <DropdownMenuContent side={side} className="w-36">
            <DropdownMenuItem>Item one</DropdownMenuItem>
            <DropdownMenuItem>Item two</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ))}
    </div>
  ),
};
