// src/components/ui/tooltip.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { LayersIcon } from "lucide-react";
import { Button } from "./button";
import { Kbd } from "./kbd";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

type Side = "top" | "right" | "bottom" | "left";

const sides = ["top", "right", "bottom", "left"] as const satisfies readonly Side[];

const meta = {
  title: "UI/Tooltip",
  component: TooltipContent,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="p-16">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
  argTypes: {
    side: { control: "inline-radio", options: sides },
    align: { control: "inline-radio", options: ["start", "center", "end"] },
    sideOffset: { control: { type: "number", min: 0 } },
  },
  args: {
    side: "top",
    align: "center",
    sideOffset: 4,
    children: "Toggle layers",
  },
  render: (args) => (
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline" />}>Hover me</TooltipTrigger>
      <TooltipContent {...args} />
    </Tooltip>
  ),
} satisfies Meta<typeof TooltipContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Rendered open so the popup is visible without hovering.
export const Open: Story = {
  render: (args) => (
    <Tooltip defaultOpen>
      <TooltipTrigger render={<Button variant="outline" />}>Trigger</TooltipTrigger>
      <TooltipContent {...args} />
    </Tooltip>
  ),
};

export const IconButton: Story = {
  render: (args) => (
    <Tooltip>
      <TooltipTrigger
        render={<Button variant="outline" size="icon" aria-label="Toggle layers" />}
      >
        <LayersIcon />
      </TooltipTrigger>
      <TooltipContent {...args} />
    </Tooltip>
  ),
};

export const WithKbd: Story = {
  render: (args) => (
    <Tooltip defaultOpen>
      <TooltipTrigger render={<Button variant="outline" />}>Search</TooltipTrigger>
      <TooltipContent {...args}>
        Search features <Kbd>⌘K</Kbd>
      </TooltipContent>
    </Tooltip>
  ),
};

export const LongContent: Story = {
  args: {
    children:
      "Shows the observed flood extent from the most recent satellite pass. Updated every 12 hours.",
  },
  render: (args) => (
    <Tooltip defaultOpen>
      <TooltipTrigger render={<Button variant="outline" />}>Flood extent</TooltipTrigger>
      <TooltipContent {...args} />
    </Tooltip>
  ),
};

export const AllSides: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-x-24 gap-y-16">
      {sides.map((side) => (
        <Tooltip key={side} defaultOpen>
          <TooltipTrigger render={<Button variant="outline" />}>{side}</TooltipTrigger>
          <TooltipContent side={side}>Tooltip on {side}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};
