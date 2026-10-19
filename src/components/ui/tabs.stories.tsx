// src/components/ui/tabs.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta = {
  title: "UI/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  args: {
    defaultValue: "details",
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const panels = (
  <>
    <TabsContent value="details">Site details</TabsContent>
    <TabsContent value="comments">No comments yet</TabsContent>
    <TabsContent value="history">Review history</TabsContent>
  </>
);

export const Default: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsList>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="comments">Comments</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>
      {panels}
    </Tabs>
  ),
};

export const Line: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsList variant="line">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="comments">Comments (0)</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>
      {panels}
    </Tabs>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsList variant="line">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="comments" disabled>
          Comments
        </TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>
      {panels}
    </Tabs>
  ),
};
