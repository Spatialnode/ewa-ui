// src/components/ui/textarea.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "./textarea";
import { Label } from "./label";

type State = "default" | "focus" | "filled" | "disabled" | "error";

const states = ["default", "focus", "filled", "disabled", "error"] as const satisfies readonly State[];

const sampleValue =
  "Flood extent observed along the northern riverbank after two days of heavy rainfall.";

// Focus is forced with storybook-addon-pseudo-states via the `data-pseudo` selector.
const pseudoParams = {
  pseudo: { focusVisible: ['[data-pseudo="focus"]'] },
};

const meta = {
  title: "UI/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-140">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    disabled: { control: "boolean" },
    rows: { control: { type: "number", min: 1 } },
    "aria-invalid": { control: "boolean" },
  },
  args: {
    placeholder: "Add a description",
    disabled: false,
  },
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Focus: Story = {
  args: { "data-pseudo": "focus" } as Story["args"],
  parameters: pseudoParams,
};

export const Filled: Story = {
  args: { defaultValue: sampleValue },
};

export const Disabled: Story = {
  args: { defaultValue: sampleValue, disabled: true },
};

export const ErrorState: Story = {
  name: "Error",
  args: { defaultValue: sampleValue, "aria-invalid": true },
};

// field-sizing-content grows the textarea with its content.
export const AutoGrow: Story = {
  args: {
    defaultValue: Array.from({ length: 6 }, () => sampleValue).join("\n\n"),
  },
};

function StateField({ state }: { state: State }) {
  const id = `textarea-${state}`;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="font-normal text-display-subtle-03">
        Description
      </Label>
      <Textarea
        id={id}
        placeholder="Add a description"
        defaultValue={state === "default" ? undefined : sampleValue}
        disabled={state === "disabled"}
        aria-invalid={state === "error" || undefined}
        data-pseudo={state === "focus" ? "focus" : undefined}
      />
    </div>
  );
}

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {states.map((state) => (
        <StateField key={state} state={state} />
      ))}
    </div>
  ),
  parameters: { controls: { disable: true }, ...pseudoParams },
};
