// src/components/ui/input-group.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  PiArrowUpBold,
  PiCopySimpleFill,
  PiEnvelopeSimpleFill,
  PiInfoFill,
  PiMagnifyingGlassFill,
} from "react-icons/pi";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "./input-group";
import { Label } from "./label";

// Focus is forced with storybook-addon-pseudo-states via the `data-pseudo` selector.
const pseudoParams = {
  pseudo: { focusVisible: ['[data-pseudo="focus"]'] },
};

const meta = {
  title: "UI/InputGroup",
  component: InputGroup,
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
} satisfies Meta<typeof InputGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <InputGroup>
      <InputGroupInput placeholder="Email Address" />
      <InputGroupAddon>
        <PiEnvelopeSimpleFill />
      </InputGroupAddon>
    </InputGroup>
  ),
};

export const Focus: Story = {
  render: () => (
    <InputGroup>
      <InputGroupInput placeholder="Email Address" data-pseudo="focus" />
      <InputGroupAddon>
        <PiEnvelopeSimpleFill />
      </InputGroupAddon>
    </InputGroup>
  ),
  parameters: pseudoParams,
};

export const WithSearchAndResults: Story = {
  render: () => (
    <InputGroup className="rounded-full">
      <InputGroupInput placeholder="Search" />
      <InputGroupAddon>
        <PiMagnifyingGlassFill />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
    </InputGroup>
  ),
};

export const WithText: Story = {
  render: () => (
    <InputGroup>
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput placeholder="example.com" className="pl-0.5!" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>.com</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
};

export const WithButton: Story = {
  render: () => (
    <InputGroup>
      <InputGroupInput defaultValue="https://example.com/share/a1b2c3" readOnly />
      <InputGroupAddon align="inline-end">
        <InputGroupButton size="icon-xs" aria-label="Copy link">
          <PiCopySimpleFill />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
};

export const WithTooltipIcon: Story = {
  render: () => (
    <InputGroup>
      <InputGroupInput placeholder="API key" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton size="icon-xs" aria-label="More info">
          <PiInfoFill />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
};

export const Textarea: Story = {
  render: () => (
    <InputGroup>
      <InputGroupTextarea placeholder="Ask a question..." />
      <InputGroupAddon align="block-end">
        <InputGroupText>0 / 280</InputGroupText>
        <InputGroupButton
          variant="default"
          size="icon-xs"
          className="ml-auto rounded-full bg-btn-primary text-btn-primary-text hover:bg-btn-primary-hover hover:text-btn-primary-text"
          aria-label="Send"
        >
          <PiArrowUpBold />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <InputGroup>
      <InputGroupInput defaultValue="Email Address" disabled />
      <InputGroupAddon>
        <PiEnvelopeSimpleFill />
      </InputGroupAddon>
    </InputGroup>
  ),
};

export const ErrorState: Story = {
  name: "Error",
  render: () => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="input-group-error" className="font-normal text-display-subtle-03">
        Email Address
      </Label>
      <InputGroup>
        <InputGroupInput
          id="input-group-error"
          defaultValue="not-an-email"
          aria-invalid
        />
        <InputGroupAddon>
          <PiEnvelopeSimpleFill />
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};
