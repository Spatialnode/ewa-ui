// src/components/ui/switch.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from "./switch";

const sizes = ["sm", "default"] as const;

const states = [
  { name: "Unchecked", props: { defaultChecked: false } },
  { name: "Checked", props: { defaultChecked: true } },
  { name: "Disabled", props: { disabled: true } },
] as const;

const meta = {
  title: "UI/Switch",
  component: Switch,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    size: { control: "inline-radio", options: sizes },
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    size: "default",
    disabled: false,
  },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = {
  args: { size: "sm" },
};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const CheckedSmall: Story = {
  name: "Checked: Small",
  args: { size: "sm", defaultChecked: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledSmall: Story = {
  name: "Disabled: Small",
  args: { size: "sm", disabled: true },
};

export const AllStates: Story = {
  render: () => (
    <div className="grid grid-cols-[auto_auto_auto] items-center gap-x-10 gap-y-6">
      <span />
      {sizes.map((size) => (
        <span key={size} className="text-sm text-display-subtle-03">
          {size}
        </span>
      ))}
      {states.map(({ name, props }) => (
        <div key={name} className="contents">
          <span className="text-sm text-display-subtle-03">{name}</span>
          {sizes.map((size) => (
            <Switch key={size} size={size} aria-label={`${name} ${size}`} {...props} />
          ))}
        </div>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};
