// src/components/ui/dialog.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { PiCheckSquareOffset, PiStorefrontFill } from "react-icons/pi";
import { Button } from "./button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

const meta = {
  title: "UI/Dialog",
  component: Dialog,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    modal: { control: "boolean" },
  },
  args: {
    modal: true,
  },
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger render={<Button variant="outline" />}>
        Open dialog
      </DialogTrigger>
      <DialogContent  showCloseButton>
        <DialogHeader className="border-none">
          <DialogTitle>Edit site</DialogTitle>
          <DialogDescription>
            Update the site details. Changes are saved to the store registry.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// Empty state shown when creating a store with no approved sites.
export const EmptyState: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger render={<Button variant="outline" />}>
        New store
      </DialogTrigger>
      <DialogContent className="sm:max-w-129.5">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">New store</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
          <PiStorefrontFill className="size-8" />
          <DialogDescription className="max-w-sm text-base text-foreground">
            There are no active approved sites. All active sites will appear
            here to be added to the store registry.
          </DialogDescription>
        </div>
        <DialogFooter>
          <Button variant="text">Close</Button>
          <Button variant="secondary">
            <PiCheckSquareOffset />
            Evaluate site
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const WithoutCloseButton: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger render={<Button variant="outline" />}>
        Open dialog
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader className="border-none">
          <DialogTitle>Confirm evaluation</DialogTitle>
          <DialogDescription>
            This site will be submitted for evaluation. You can track progress
            from the sites table.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>
            Cancel
          </DialogClose>
          <Button>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const LongContent: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger render={<Button variant="outline" />}>Terms</DialogTrigger>
      <DialogContent className="flex max-h-[80vh] flex-col">
        <DialogHeader>
          <DialogTitle>Site evaluation terms</DialogTitle>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3 text-muted-foreground">
          {Array.from({ length: 12 }, (_, i) => (
            <p key={i}>
              Evaluations use footfall, demographic and competitor data for the
              selected catchment. Results are estimates and should be reviewed
              before a site is approved.
            </p>
          ))}
        </div>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  ),
};
