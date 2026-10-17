// src/components/ui/radio-group.stories.tsx
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "./label";
import { RadioGroup, RadioGroupItem } from "./radio-group";

const meta = {
  title: "UI/RadioGroup",
  component: RadioGroup,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    disabled: { control: "boolean" },
  },
  args: {
    defaultValue: "pdf",
    disabled: false,
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

const formats = [
  { value: "pdf", label: "PDF" },
  { value: "excel", label: "Excel" },
  { value: "csv", label: "CSV" },
];

export const Default: Story = {
  render: (args) => (
    <RadioGroup {...args} className="w-48">
      {formats.map((f) => (
        <Label key={f.value} className="flex items-center gap-3">
          <RadioGroupItem value={f.value} />
          {f.label}
        </Label>
      ))}
    </RadioGroup>
  ),
};

export const States: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
      <Label className="flex items-center gap-3">
        <RadioGroup>
          <RadioGroupItem value="a" />
        </RadioGroup>
        Unchecked
      </Label>
      <Label className="flex items-center gap-3">
        <RadioGroup defaultValue="a">
          <RadioGroupItem value="a" />
        </RadioGroup>
        Checked
      </Label>
      <Label className="flex items-center gap-3">
        <RadioGroup disabled>
          <RadioGroupItem value="a" />
        </RadioGroup>
        Disabled
      </Label>
      <Label className="flex items-center gap-3">
        <RadioGroup disabled defaultValue="a">
          <RadioGroupItem value="a" />
        </RadioGroup>
        Disabled checked
      </Label>
      <Label className="flex items-center gap-3">
        <RadioGroup>
          <RadioGroupItem value="a" aria-invalid />
        </RadioGroup>
        Invalid
      </Label>
    </div>
  ),
};

export const DisabledItem: Story = {
  render: (args) => (
    <RadioGroup {...args} className="w-48">
      {formats.map((f) => (
        <Label key={f.value} className="flex items-center gap-3">
          <RadioGroupItem value={f.value} disabled={f.value === "csv"} />
          {f.label}
        </Label>
      ))}
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  render: (args) => (
    <RadioGroup {...args} className="flex gap-6">
      {formats.map((f) => (
        <Label key={f.value} className="flex items-center gap-3">
          <RadioGroupItem value={f.value} />
          {f.label}
        </Label>
      ))}
    </RadioGroup>
  ),
};

export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = React.useState("excel");
    return (
      <div className="flex flex-col gap-4">
        <RadioGroup
          {...args}
          value={value}
          onValueChange={(v) => setValue(v as string)}
          className="w-48"
        >
          {formats.map((f) => (
            <Label key={f.value} className="flex items-center gap-3">
              <RadioGroupItem value={f.value} />
              {f.label}
            </Label>
          ))}
        </RadioGroup>
        <p className="text-sm text-display-subtle-01">Selected: {value}</p>
      </div>
    );
  },
};
