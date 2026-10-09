// src/components/app-sidebar.stories.tsx
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AppSidebar } from "./app-sidebar";
import { SidebarInset, SidebarProvider } from "./ui/sidebar";

const meta = {
  title: "Components/AppSidebar",
  component: AppSidebar,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    user: { name: "Jane Doe", role: "Super Admin" },
    logo: "Logo",
  },
  render: function Render(args) {
    const [activeId, setActiveId] = React.useState(args.activeId);
    return (
      <AppSidebar {...args} activeId={activeId} onNavigate={setActiveId} />
    );
  },
  decorators: [
    (Story, { parameters }) => (
      <SidebarProvider
        defaultOpen={parameters.defaultOpen ?? true}
        width={parameters.width}
      >
        <Story />
        <SidebarInset />
      </SidebarProvider>
    ),
  ],
} satisfies Meta<typeof AppSidebar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Expanded: Story = {};

export const Collapsed: Story = {
  parameters: { defaultOpen: false },
};

export const CustomWidth: Story = {
  parameters: { width: "16rem" },
};
