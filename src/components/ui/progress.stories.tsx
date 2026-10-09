// src/components/ui/progress.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Progress, ProgressLabel, ProgressValue } from "./progress";

const values = [0, 25, 50, 75, 100] as const;

const meta = {
  title: "UI/Progress",
  component: Progress,
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
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    min: { control: "number" },
    max: { control: "number" },
    thumb: { control: "boolean" },
  },
  args: {
    value: 40,
    min: 0,
    max: 100,
    thumb: false,
  },
  render: (args) => (
    <Progress {...args}>
      <ProgressLabel>Uploading</ProgressLabel>
      <ProgressValue />
    </Progress>
  ),
} satisfies Meta<typeof Progress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutLabel: Story = {
  args: { "aria-label": "Progress" },
  render: (args) => <Progress {...args} />,
};

export const Indeterminate: Story = {
  args: { value: null },
};

export const Complete: Story = {
  args: { value: 100 },
};

export const WithThumb: Story = {
  args: { thumb: true },
};

export const PeopleNearby: Story = {
  name: "People Nearby",
  args: { value: 26 },
  render: (args) => (
    <Progress {...args} thumb>
      <ProgressLabel className="text-base font-normal">People nearby</ProgressLabel>
      <ProgressValue className="text-base" />
    </Progress>
  ),
};

export const AllValues: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {values.map((value) => (
        <Progress key={value} value={value}>
          <ProgressLabel>{value}%</ProgressLabel>
          <ProgressValue />
        </Progress>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};
