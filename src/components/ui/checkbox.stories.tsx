// src/components/ui/checkbox.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "./checkbox";
import { Label } from "./label";

const states = [
  { name: "Unchecked", props: {} },
  { name: "Checked", props: { defaultChecked: true } },
  { name: "Indeterminate", props: { indeterminate: true } },
  { name: "Focus", props: { "data-pseudo": "focus" } },
  { name: "Invalid", props: { "aria-invalid": true } },
  { name: "Invalid: Checked", props: { "aria-invalid": true, defaultChecked: true } },
  { name: "Disabled", props: { disabled: true } },
  { name: "Disabled: Checked", props: { disabled: true, defaultChecked: true } },
  { name: "Disabled: Indeterminate", props: { disabled: true, indeterminate: true } },
] as const;

// Focus is forced with storybook-addon-pseudo-states via the `data-pseudo` selector.
const pseudoParams = {
  pseudo: { focusVisible: ['[data-pseudo="focus"]'] },
};

const meta = {
  title: "UI/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    checked: { control: "boolean" },
    indeterminate: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    disabled: false,
    "aria-label": "Checkbox",
  },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const Indeterminate: Story = {
  args: { indeterminate: true },
};

export const Focus: Story = {
  args: { "data-pseudo": "focus" } as Story["args"],
  parameters: pseudoParams,
};

export const Invalid: Story = {
  args: { "aria-invalid": true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledChecked: Story = {
  name: "Disabled: Checked",
  args: { disabled: true, defaultChecked: true },
};

export const WithLabel: Story = {
  render: (args) => (
    <Label>
      <Checkbox {...args} aria-label={undefined} />
      Accept terms and conditions
    </Label>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="grid grid-cols-[auto_auto] items-center gap-x-10 gap-y-6">
      {states.map(({ name, props }) => (
        <div key={name} className="contents">
          <span className="text-sm text-display-subtle-03">{name}</span>
          <Checkbox aria-label={name} {...props} />
        </div>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true }, ...pseudoParams },
};
