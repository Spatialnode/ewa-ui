// src/components/app-dialog.stories.tsx
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  PiArrowBendUpLeftBold,
  PiCaretDown,
  PiCheckSquareOffset,
  PiConfettiFill,
  PiMapPinPlusFill,
  PiStorefrontFill,
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

// Selectable card used by the export and site-picker stories.
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
    title: "Edit site",
    children:
      "Update the site details. Changes are saved to the store registry.",
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
    triggerText: "Approve site",
    size: "sm",
    icon: <PiStorefrontFill />,
    title: "Approve CS-021?",
    description: "Admiralty Way, Lekki Phase 1",
    headerDivider: false,
    children: (
      <div className="flex flex-col gap-4">
        <p className="text-base">
          Are you sure you want to approve CS-021? This site will be locked in
          and moved forward to the active development stage.
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
        <Button>Approve site</Button>
      </>
    ),
  },
};

export const SubmitInverseIcon: Story = {
  args: {
    ...ConfirmWithNote.args,
    triggerText: "Submit site",
    icon: <PiMapPinPlusFill />,
    iconTone: "inverse",
    title: "Submit CS-010 for approval?",
    children: (
      <div className="flex flex-col gap-4">
        <p className="text-base">
          Are you sure you want to proceed? This will put the candidate site
          under review.
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
    triggerText: "Return site",
    size: "sm",
    icon: <PiArrowBendUpLeftBold />,
    title: "Return CS-014",
    description: "Admiralty Way, Lekki Phase 1",
    headerDivider: false,
    children: (
      <p className="text-base">
        Are you sure you want to return <strong>CS-014?</strong> It goes back to
        draft so the analyst can make the changes you ask for and submit it
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
    triggerText: "Launch store",
    title: "New store added",
    bodyClassName: "flex flex-col items-center gap-3 py-6 text-center",
    children: (
      <>
        <PiConfettiFill className="size-8 text-btn-primary" />
        <p>
          Congratulations! The new SFL store -014 has been successfully launched
          on November 3, 2017 at 12 Herbert Macaulay, Yaba, Lagos.
        </p>
      </>
    ),
    footer: <CancelButton>Close</CancelButton>,
  },
};

export const EmptyState: Story = {
  args: {
    triggerText: "New store",
    title: "New store",
    bodyClassName: "flex flex-col items-center gap-4 px-10 py-8 text-center",
    children: (
      <>
        <PiStorefrontFill className="size-8 text-icon-default" />
        <p className="text-base">
          There are no active approved sites. All active sites will appear here
          to be added to the store registry.
        </p>
      </>
    ),
    footer: (
      <>
        <CancelButton>Close</CancelButton>
        <Button variant="tertiary">
          <PiCheckSquareOffset />
          Evaluate site
        </Button>
      </>
    ),
  },
};

export const SelectSite: Story = {
  render: function Render(args) {
    const [site, setSite] = React.useState("yaba");
    const sites = [
      { id: "yaba", name: "Herbert Macaulay, Yaba" },
      { id: "agege", name: "Agege, Lagos" },
    ];
    return (
      <AppDialog
        {...args}
        triggerText="New store"
        title="New store"
        footer={
          <>
            <CancelButton>Close</CancelButton>
            <Button variant="tertiary">Continue</Button>
          </>
        }
      >
        <RadioGroup value={site} onValueChange={(v) => setSite(v as string)}>
          {sites.map((s) => (
            <OptionCard key={s.id} value={s.id} selected={site === s.id}>
              <span className="text-sm font-medium text-display-01">
                {s.name}
              </span>
              <span className="text-xs text-display-subtle-01">
                ₦51.1m est. rent · 2.6 km away · Approved 2 weeks ago
              </span>
            </OptionCard>
          ))}
        </RadioGroup>
      </AppDialog>
    );
  },
};

// Long form: only the body scrolls, header and footer stay visible.
export const LaunchStoreForm: Story = {
  args: {
    triggerText: "Launch store",
    size: "sm",
    title: "Launch New Store",
    children: (
      <div className="flex flex-col gap-4">
        <p>
          Herbert Macaulay, Yaba is approved. Opening it as a store moves it to
          the registry, starting revenue and delivery coverage.
        </p>
        <div className="grid grid-cols-2 gap-2 rounded-12 bg-surface-level-00 p-2">
          {[
            ["Suitability score", "98%"],
            ["From nearest store", "56.3km / 45min"],
            ["Expected sales per day", "₦981k /day"],
            ["Est. Market Share", "56.6%"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-8 bg-surface-base p-2">
              <p className="text-xs text-display-subtle-01">{label}</p>
              <p className="font-medium text-display-01">{value}</p>
            </div>
          ))}
        </div>
        {[
          "Store Name",
          "Seats capacity",
          "Opened",
          "Asking rent / Capital",
          "Full Address",
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
        <Button variant="tertiary">Add to Registry</Button>
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
            ["Full name", "Sundry Food"],
            ["Email", "sundryfood@gmail.com"],
            ["Role", "Super Admin"],
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
