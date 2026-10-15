// src/components/ui/avatar.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "./avatar";

const sizes = ["sm", "default", "lg"] as const;

const people = [
  { name: "Samuel Peters", initials: "SP" },
  { name: "Michael Chen", initials: "MC" },
  { name: "Sundry Food", initials: "SN" },
  { name: "Amaka Obi", initials: "AO" },
  { name: "Tunde Bello", initials: "TB" },
] as const;

const meta = {
  title: "UI/Avatar",
  component: Avatar,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    size: { control: "inline-radio", options: sizes },
  },
  args: {
    size: "default",
  },
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback>SN</AvatarFallback>
    </Avatar>
  ),
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithImage: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://github.com/shadcn.png" alt="User avatar" />
      <AvatarFallback>SN</AvatarFallback>
    </Avatar>
  ),
};

export const BrokenImage: Story = {
  name: "Fallback on Broken Image",
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="/does-not-exist.png" alt="Michael Chen" />
      <AvatarFallback>MC</AvatarFallback>
    </Avatar>
  ),
};

export const WithBadge: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback>SP</AvatarFallback>
      <AvatarBadge />
    </Avatar>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {sizes.map((size) => (
        <Avatar key={size} size={size}>
          <AvatarFallback>SN</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};

export const Group: Story = {
  render: (args) => (
    <AvatarGroup>
      {people.slice(0, 3).map((person) => (
        <Avatar key={person.name} {...args}>
          <AvatarFallback>{person.initials}</AvatarFallback>
        </Avatar>
      ))}
      <AvatarGroupCount>+{people.length - 3}</AvatarGroupCount>
    </AvatarGroup>
  ),
};

export const CurrentUser: Story = {
  name: "Current User",
  render: (args) => (
    <div className="flex items-center gap-3">
      <Avatar {...args}>
        <AvatarFallback>SN</AvatarFallback>
      </Avatar>
      <span className="text-base text-foreground">Samuel Peters (You)</span>
    </div>
  ),
};

export const ActivityItem: Story = {
  name: "Activity Item",
  render: (args) => (
    <div className="flex w-96 items-start gap-3">
      <Avatar {...args}>
        <AvatarFallback>MC</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-base font-medium text-foreground">
            Add new candidate site
          </span>
          <span className="size-1 rounded-full bg-muted-foreground/40" />
          <span className="text-sm text-muted-foreground">5m ago</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Michael Chen added Victoria Island for evaluation
        </p>
      </div>
    </div>
  ),
};

export const AccountCard: Story = {
  name: "Account Card",
  args: { size: "lg" },
  render: (args) => (
    <div className="flex items-center gap-3">
      <Avatar {...args}>
        <AvatarFallback>SN</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-base font-medium text-foreground">
          Sundry Food
        </span>
        <span className="text-sm text-muted-foreground">name@sundry.ng</span>
      </div>
    </div>
  ),
};
