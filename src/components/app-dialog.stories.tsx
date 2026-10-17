// src/components/app-dialog.stories.tsx
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  PiArrowBendUpLeftBold,
  PiCaretDown,
  PiCheckSquareOffset,
  PiConfettiFill,
  PiFolderFill,
  PiPaperPlaneTiltFill,
} from "react-icons/pi";

import { cn } from "@/lib/utils";
import { AppDialog } from "./app-dialog";
import { Button } from "./ui/button";
import { DialogClose } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Textarea } from "./ui/textarea";

const meta = {
  title: "Components/AppDialog",
  component: AppDialog,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg", "xl", "full"] },
    position: {
      control: "select",
      options: ["center", "top", "bottom", "left", "right"],
    },
    iconTone: { control: "select", options: ["brand", "inverse", "neutral"] },
  },
} satisfies Meta<typeof AppDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

const CancelButton = ({ children = "Cancel" }: { children?: string }) => (
  <DialogClose render={<Button variant="secondary" />}>{children}</DialogClose>
);

// Selectable card used by the export and option-picker stories.
const OptionCard = ({
  value,
  selected,
  children,
}: {
  value: string;
  selected: boolean;
  children: React.ReactNode;
}) => (
  <label
    className={cn(
      "flex cursor-pointer items-center justify-between gap-3 rounded-12 border p-3",
      selected
        ? "border-btn-primary bg-highlight-orange-25"
        : "border-border-01",
    )}
  >
    <div className="flex flex-col gap-1">{children}</div>
    <RadioGroupItem value={value} />
  </label>
);

export const Basic: Story = {
  args: {
    triggerText: "Open dialog",
    title: "Edit project",
    children:
      "Update the project details. Changes are saved when you confirm.",
    footer: (
      <>
        <CancelButton />
        <Button variant="tertiary">Save changes</Button>
      </>
    ),
  },
};

export const ExportFormat: Story = {
  render: function Render(args) {
    const [format, setFormat] = React.useState("pdf");
    return (
      <AppDialog
        {...args}
        triggerText="Export"
        title="Export comparison"
        footer={
          <>
            <CancelButton />
            <Button variant="tertiary">Export</Button>
          </>
        }
      >
        <div className="flex flex-col gap-2">
          <Label>Format</Label>
          <RadioGroup
            value={format}
            onValueChange={(v) => setFormat(v as string)}
            className="grid-cols-2"
          >
            <OptionCard value="pdf" selected={format === "pdf"}>
              PDF
            </OptionCard>
            <OptionCard value="excel" selected={format === "excel"}>
              Excel
            </OptionCard>
          </RadioGroup>
        </div>
      </AppDialog>
    );
  },
};

export const ConfirmWithNote: Story = {
  args: {
    triggerText: "Approve project",
    size: "sm",
    icon: <PiFolderFill />,
    title: "Approve Project Alpha?",
    description: "Submitted by the design team",
    headerDivider: false,
    children: (
      <div className="flex flex-col gap-4">
        <p className="text-base">
          Are you sure you want to approve Project Alpha? It will be locked in
          and moved forward to the next stage.
        </p>
        <div className="flex flex-col gap-2">
          <Label htmlFor="approve-note">Add a note</Label>
          <Textarea id="approve-note" />
        </div>
      </div>
    ),
    footer: (
      <>
        <CancelButton />
        <Button>Approve project</Button>
      </>
    ),
  },
};

export const SubmitInverseIcon: Story = {
  args: {
    ...ConfirmWithNote.args,
    triggerText: "Submit project",
    icon: <PiPaperPlaneTiltFill />,
    iconTone: "inverse",
    title: "Submit Project Beta for approval?",
    children: (
      <div className="flex flex-col gap-4">
        <p className="text-base">
          Are you sure you want to proceed? This will put the project under
          review.
        </p>
        <div className="flex flex-col gap-2">
          <Label htmlFor="submit-note">Add a note</Label>
          <Textarea id="submit-note" />
        </div>
      </div>
    ),
    footer: (
      <>
        <CancelButton />
        <Button>Yes, submit</Button>
      </>
    ),
  },
};

export const Return: Story = {
  args: {
    triggerText: "Return project",
    size: "sm",
    icon: <PiArrowBendUpLeftBold />,
    title: "Return Project Gamma",
    description: "Submitted by the design team",
    headerDivider: false,
    children: (
      <p className="text-base">
        Are you sure you want to return <strong>Project Gamma?</strong> It goes
        back to draft so the owner can make the changes you ask for and submit it
        again.
      </p>
    ),
    footer: (
      <>
        <CancelButton />
        <Button>Yes, return</Button>
      </>
    ),
  },
};

export const Success: Story = {
  args: {
    triggerText: "Create project",
    title: "Project created",
    bodyClassName: "flex flex-col items-center gap-3 py-6 text-center",
    children: (
      <>
        <PiConfettiFill className="size-8 text-btn-primary" />
        <p>
          Congratulations! Project Delta has been created and is ready for your
          team.
        </p>
      </>
    ),
    footer: <CancelButton>Close</CancelButton>,
  },
};

export const EmptyState: Story = {
  args: {
    triggerText: "New project",
    title: "New project",
    bodyClassName: "flex flex-col items-center gap-4 px-10 py-8 text-center",
    children: (
      <>
        <PiFolderFill className="size-8 text-icon-default" />
        <p className="text-base">
          There are no approved items yet. Approved items will appear here once
          they are ready.
        </p>
      </>
    ),
    footer: (
      <>
        <CancelButton>Close</CancelButton>
        <Button variant="tertiary">
          <PiCheckSquareOffset />
          Start review
        </Button>
      </>
    ),
  },
};

export const SelectOption: Story = {
  render: function Render(args) {
    const [option, setOption] = React.useState("a");
    const options = [
      { id: "a", name: "Option A" },
      { id: "b", name: "Option B" },
    ];
    return (
      <AppDialog
        {...args}
        triggerText="Choose option"
        title="Choose an option"
        footer={
          <>
            <CancelButton>Close</CancelButton>
            <Button variant="tertiary">Continue</Button>
          </>
        }
      >
        <RadioGroup
          value={option}
          onValueChange={(v) => setOption(v as string)}
        >
          {options.map((o) => (
            <OptionCard key={o.id} value={o.id} selected={option === o.id}>
              <span className="text-sm font-medium text-display-01">
                {o.name}
              </span>
              <span className="text-xs text-display-subtle-01">
                12 items · Updated 2 weeks ago
              </span>
            </OptionCard>
          ))}
        </RadioGroup>
      </AppDialog>
    );
  },
};

// Long form: only the body scrolls, header and footer stay visible.
export const LongForm: Story = {
  args: {
    triggerText: "Create project",
    size: "sm",
    title: "New Project",
    children: (
      <div className="flex flex-col gap-4">
        <p>
          Fill in the details below. Only the body scrolls, so the header and
          footer stay visible.
        </p>
        <div className="grid grid-cols-2 gap-2 rounded-12 bg-surface-level-00 p-2">
          {[
            ["Score", "98%"],
            ["Tasks", "24"],
            ["Members", "6"],
            ["Progress", "56.6%"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-8 bg-surface-base p-2">
              <p className="text-xs text-display-subtle-01">{label}</p>
              <p className="font-medium text-display-01">{value}</p>
            </div>
          ))}
        </div>
        {[
          "Project name",
          "Owner",
          "Start date",
          "Budget",
          "Description",
        ].map((label) => (
          <div key={label} className="flex flex-col gap-2">
            <Label>{label}</Label>
            <Input />
          </div>
        ))}
      </div>
    ),
    footer: (
      <>
        <CancelButton />
        <Button variant="tertiary">Create project</Button>
      </>
    ),
  },
};

// No footer: settings-style panels save inline.
export const SettingsNoFooter: Story = {
  args: {
    triggerText: "Settings",
    size: "lg",
    title: "Settings",
    children: (
      <div className="flex flex-col gap-4">
        <div className="divide-y divide-border-01 rounded-12 bg-surface-level-00 px-3">
          {[
            ["Full name", "Jane Doe"],
            ["Email", "jane.doe@example.com"],
            ["Role", "Admin"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between py-3">
              <span className="text-display-subtle-01">{label}</span>
              <span className="text-display-01">{value}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between rounded-12 bg-surface-level-00 p-3">
          <span className="text-display-subtle-01">Appearance</span>
          <span className="flex items-center gap-1 text-display-01">
            Light mode <PiCaretDown />
          </span>
        </div>
      </div>
    ),
  },
};

export const WithoutTrigger: Story = {
  render: function Render(args) {
    const [open, setOpen] = React.useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open controlled</Button>
        <AppDialog
          {...args}
          open={open}
          onOpenChange={setOpen}
          title="Controlled dialog"
          footer={<CancelButton>Close</CancelButton>}
        >
          Opened from outside the dialog via the open prop.
        </AppDialog>
      </>
    );
  },
};
