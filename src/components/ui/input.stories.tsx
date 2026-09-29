// src/components/ui/input.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./input";
import { Label } from "./label";

type State = "default" | "focus" | "filled" | "disabled" | "error";

const fields = {
  email: {
    label: "Email Address",
    type: "email",
    placeholder: "Email Address",
    value: "Email Address",
    states: ["default", "focus", "filled", "disabled", "error"],
  },
  password: {
    label: "Password",
    type: "password",
    placeholder: undefined,
    value: "supersecretpass",
    states: ["default", "filled", "error"],
  },
} as const satisfies Record<string, { states: readonly State[]; [key: string]: unknown }>;
type Field = keyof typeof fields;

// Focus is forced with storybook-addon-pseudo-states via the `data-pseudo` selector.
const pseudoParams = {
  pseudo: { focusVisible: ['[data-pseudo="focus"]'] },
};

const meta = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-[35rem]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    type: { control: "inline-radio", options: ["text", "email", "password"] },
    disabled: { control: "boolean" },
    "aria-invalid": { control: "boolean" },
  },
  args: {
    type: "email",
    placeholder: "Email Address",
    disabled: false,
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Focus: Story = {
  args: { "data-pseudo": "focus" } as Story["args"],
  parameters: pseudoParams,
};

export const Filled: Story = {
  args: { defaultValue: "Email Address" },
};

export const Disabled: Story = {
  args: { defaultValue: "Email Address", disabled: true },
};

export const ErrorState: Story = {
  name: "Error",
  args: { defaultValue: "Email Address", "aria-invalid": true },
};

export const PasswordDefault: Story = {
  name: "Default: Password",
  args: { type: "password", placeholder: undefined },
};

export const PasswordFilled: Story = {
  name: "Filled: Password",
  args: {
    type: "password",
    placeholder: undefined,
    defaultValue: "supersecretpass",
  },
};

export const PasswordError: Story = {
  name: "Error: Password",
  args: {
    type: "password",
    placeholder: undefined,
    defaultValue: "supersecretpass",
    "aria-invalid": true,
  },
};

function StateField({ field, state }: { field: Field; state: State }) {
  const { label, type, placeholder, value } = fields[field];
  const id = `${field}-${state}`;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="font-normal text-display-subtle-03">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        defaultValue={state === "default" ? undefined : value}
        disabled={state === "disabled"}
        aria-invalid={state === "error" || undefined}
        data-pseudo={state === "focus" ? "focus" : undefined}
      />
    </div>
  );
}

function StateColumn({ field }: { field: Field }) {
  return (
    <div className="flex flex-col gap-6">
      {fields[field].states.map((state) => (
        <StateField key={state} field={field} state={state} />
      ))}
    </div>
  );
}

export const EmailStates: Story = {
  render: () => <StateColumn field="email" />,
  parameters: { controls: { disable: true }, ...pseudoParams },
};

export const PasswordStates: Story = {
  render: () => <StateColumn field="password" />,
  parameters: { controls: { disable: true }, ...pseudoParams },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <StateColumn field="email" />
      <StateColumn field="password" />
    </div>
  ),
  parameters: { controls: { disable: true }, ...pseudoParams },
};
