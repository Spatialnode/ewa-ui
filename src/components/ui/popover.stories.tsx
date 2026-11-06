// src/components/ui/popover.stories.tsx
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import { PiFunnelFill } from "react-icons/pi";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { Label } from "./label";
import {
  Popover,
  PopoverBody,
  PopoverClose,
  PopoverCloseButton,
  PopoverContent,
  PopoverDescription,
  PopoverFooter,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";
import { RadioGroup, RadioGroupItem } from "./radio-group";

const meta = {
  title: "UI/Popover",
  component: Popover,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    modal: { control: "boolean" },
  },
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger render={<Button variant="tertiary" />}>
        Open popover
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Details</PopoverTitle>
          <PopoverCloseButton />
        </PopoverHeader>
        <PopoverBody>
          <PopoverDescription>
            Popovers show supporting content next to the control that opened
            them.
          </PopoverDescription>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  ),
};

export const WithFooter: Story = {
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger render={<Button variant="tertiary" />}>
        Share item
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Share item</PopoverTitle>
          <PopoverCloseButton />
        </PopoverHeader>
        <PopoverBody>
          <PopoverDescription>
            Anyone with the link will be able to view this item.
          </PopoverDescription>
        </PopoverBody>
        <PopoverFooter className="justify-end gap-2">
          <PopoverClose render={<Button variant="tertiary" size="xs" />}>
            Cancel
          </PopoverClose>
          <PopoverClose render={<Button variant="secondary" size="xs" />}>
            Copy link
          </PopoverClose>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  ),
};

const placements = [
  { side: "top", align: "start" },
  { side: "top", align: "end" },
  { side: "bottom", align: "start" },
  { side: "bottom", align: "end" },
  { side: "left", align: "center" },
  { side: "right", align: "center" },
] as const;

export const Placement: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-4">
      {placements.map(({ side, align }) => (
        <Popover key={`${side}-${align}`} {...args}>
          <PopoverTrigger render={<Button variant="tertiary" />}>
            {side} / {align}
          </PopoverTrigger>
          <PopoverContent side={side} align={align} className="w-48">
            <PopoverBody>
              <PopoverDescription>
                Placed {side}, aligned {align}.
              </PopoverDescription>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
};

type Filters = {
  status: string;
  archived: boolean;
};

const defaultFilters: Filters = { status: "all", archived: false };

const statuses = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
];

// Edits stay in a draft until applied, so Cancel leaves the applied values untouched
function FilterPopover() {
  const [open, setOpen] = React.useState(false);
  const [applied, setApplied] = React.useState(defaultFilters);
  const [draft, setDraft] = React.useState(applied);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setDraft(applied);
    setOpen(nextOpen);
  };

  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    setApplied(draft);
    setOpen(false);
  };

  return (
    <div className="flex flex-col items-end gap-3">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          render={
            <Button variant="tertiary" size="sm" className="h-7 rounded-8" />
          }
        >
          <PiFunnelFill />
          Filter
        </PopoverTrigger>
        <PopoverContent align="end">
          <PopoverHeader>
            <PopoverTitle>Filter results</PopoverTitle>
            <PopoverCloseButton />
          </PopoverHeader>
          <form onSubmit={apply} className="flex min-h-0 flex-col">
            <PopoverBody>
              <RadioGroup
                aria-label="Status"
                value={draft.status}
                onValueChange={(status) =>
                  setDraft((prev) => ({ ...prev, status: status as string }))
                }
              >
                {statuses.map((s) => (
                  <Label key={s.value} className="flex items-center gap-3">
                    <RadioGroupItem value={s.value} />
                    {s.label}
                  </Label>
                ))}
              </RadioGroup>
              <Label className="flex items-center gap-3">
                <Checkbox
                  checked={draft.archived}
                  onCheckedChange={(archived) =>
                    setDraft((prev) => ({ ...prev, archived }))
                  }
                />
                Include archived
              </Label>
            </PopoverBody>
            <PopoverFooter>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="cursor-pointer px-3 py-3.5 hover:underline"
                onClick={() => setDraft(defaultFilters)}
              >
                Reset
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="tertiary"
                  size="sm"
                  className="cursor-pointer rounded-14 px-3 py-3.5"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  className="cursor-pointer rounded-14 px-3 py-3.5"
                >
                  Apply
                </Button>
              </div>
            </PopoverFooter>
          </form>
        </PopoverContent>
      </Popover>
      <output data-testid="applied" className="text-xs text-display-body">
        Status: {applied.status}, archived: {String(applied.archived)}
      </output>
    </div>
  );
}

export const FilterForm: Story = {
  render: () => <FilterPopover />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Filter" });
    const applied = canvas.getByTestId("applied");

    // Cancel discards the draft
    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole("radio", { name: "Open" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(applied).toHaveTextContent("Status: all, archived: false");

    // Reopening starts from the applied values, and Apply commits the draft
    await userEvent.click(trigger);
    const open = await screen.findByRole("radio", { name: "Open" });
    await expect(open).not.toBeChecked();
    await userEvent.click(open);
    await userEvent.click(screen.getByRole("button", { name: "Apply" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await expect(applied).toHaveTextContent("Status: open, archived: false");

    // Reset restores the defaults in the draft only
    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole("button", { name: "Reset" }));
    await expect(screen.getByRole("radio", { name: "All" })).toBeChecked();
    await expect(applied).toHaveTextContent("Status: open, archived: false");
  },
};
