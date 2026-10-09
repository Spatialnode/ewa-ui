// src/components/ui/button.stories.tsx
import type { ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";

type ButtonProps = ComponentProps<typeof Button>;
type Variant = NonNullable<ButtonProps["variant"]>;
type Size = NonNullable<ButtonProps["size"]>;

const variants: Variant[] = [
  "default",
  "secondary",
  "tertiary",
  "text",
  "outline",
  "ghost",
  "destructive",
  "link",
];
const sizes: Size[] = ["default", "xs"];
const states = ["default", "hover", "disabled"] as const;

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: { control: "select", options: variants },
    size: { control: "inline-radio", options: sizes },
    disabled: { control: "boolean" },
  },
  args: {
    children: "Launch Spatialnode",
    variant: "default",
    size: "default",
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Hover: Story = {
  parameters: { pseudo: { hover: true } },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const xsall: Story = {
  args: { size: "xs" },
};

// Renders every state (columns) for every size (rows) of a single variant.
// Hover is forced with storybook-addon-pseudo-states via the `data-pseudo` selector.
function StateMatrix({ variant }: { variant: Variant }) {
  return (
    <div className="grid grid-cols-[auto_repeat(3,auto)] items-center gap-x-6 gap-y-4 text-xs">
      <span />
      {states.map((state) => (
        <span
          key={state}
          className="font-medium capitalize text-muted-foreground"
        >
          {state}
        </span>
      ))}
      {sizes.map((size) => (
        <div key={size} className="contents">
          <span className="font-medium text-muted-foreground">
            {size === "xs" ? "xs" : "Default"}
          </span>
          {states.map((state) => (
            <div key={state}>
              <Button
                variant={variant}
                size={size}
                disabled={state === "disabled"}
                data-pseudo={state === "hover" ? "hover" : undefined}
              >
                Button
              </Button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const matrixStory = (variant: Variant): Story => ({
  render: () => <StateMatrix variant={variant} />,
  parameters: {
    controls: { disable: true },
    pseudo: { hover: ['[data-pseudo="hover"]'] },
  },
});

export const PrimaryStates = matrixStory("default");
export const SecondaryStates = matrixStory("secondary");
export const TertiaryStates = matrixStory("tertiary");
export const TextStates = matrixStory("text");
export const OutlineStates = matrixStory("outline");
export const GhostStates = matrixStory("ghost");
export const DestructiveStates = matrixStory("destructive");
export const LinkStates = matrixStory("link");

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      {variants.map((variant) => (
        <div key={variant} className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold capitalize">
            {variant === "default" ? "Primary" : variant}
          </h3>
          <StateMatrix variant={variant} />
        </div>
      ))}
    </div>
  ),
  parameters: {
    layout: "padded",
    controls: { disable: true },
    pseudo: { hover: ['[data-pseudo="hover"]'] },
  },
};
