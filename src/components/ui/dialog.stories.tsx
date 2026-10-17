// src/components/ui/dialog.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { PiCheckSquareOffset, PiFolderFill } from "react-icons/pi";
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
          <DialogTitle>Edit project</DialogTitle>
          <DialogDescription>
            Update the project details. Changes are saved when you confirm.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

// Empty state shown when there is nothing to list yet.
export const EmptyState: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger render={<Button variant="outline" />}>
        New project
      </DialogTrigger>
      <DialogContent className="sm:max-w-129.5">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">New project</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
          <PiFolderFill className="size-8" />
          <DialogDescription className="max-w-sm text-base text-foreground">
            There are no approved items yet. Approved items will appear here
            once they are ready.
          </DialogDescription>
        </div>
        <DialogFooter>
          <Button variant="text">Close</Button>
          <Button variant="secondary">
            <PiCheckSquareOffset />
            Start review
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
          <DialogTitle>Confirm submission</DialogTitle>
          <DialogDescription>
            This project will be submitted for review. You can track progress
            from the projects table.
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
          <DialogTitle>Terms of use</DialogTitle>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3 text-muted-foreground">
          {Array.from({ length: 12 }, (_, i) => (
            <p key={i}>
              Results are estimates based on the data provided and should be
              reviewed before any decision is made. Keep a copy of these terms
              for your records.
            </p>
          ))}
        </div>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  ),
};
