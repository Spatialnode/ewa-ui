// src/components/ui/toast.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";
import { Toaster, toast } from "./toast";

type ToastType = "default" | "success" | "info" | "warning" | "error" | "loading";

const presets = {
  default: {
    title: "Layer added",
    description: "Rainfall (24h) is now visible on the map.",
  },
  success: {
    title: "Export complete",
    description: "flood-extent.geojson has been downloaded.",
  },
  info: {
    title: "New imagery available",
    description: "Sentinel-2 tiles for this area were updated today.",
  },
  warning: {
    title: "Large selection",
    description: "Rendering more than 10,000 features may be slow.",
  },
  error: {
    title: "Upload failed",
    description: "The file could not be parsed as GeoJSON.",
  },
  loading: {
    title: "Processing",
    description: "Calculating the affected area…",
  },
} as const satisfies Record<ToastType, { title: string; description: string }>;

function showToast(type: ToastType) {
  toast.add({
    ...presets[type],
    type: type === "default" ? undefined : type,
  });
}

function TriggerButton({ type, label }: { type: ToastType; label?: string }) {
  return (
    <Button variant="outline" onClick={() => showToast(type)}>
      {label ?? `Show ${type} toast`}
    </Button>
  );
}

const meta = {
  title: "UI/Toast",
  component: Toaster,
  parameters: {
    layout: "centered",
    controls: { disable: true },
  },
  decorators: [
    (Story) => (
      <Toaster>
        <Story />
      </Toaster>
    ),
  ],
} satisfies Meta<typeof Toaster>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <TriggerButton type="default" label="Show toast" />,
};

export const Success: Story = {
  render: () => <TriggerButton type="success" />,
};

export const Info: Story = {
  render: () => <TriggerButton type="info" />,
};

export const Warning: Story = {
  render: () => <TriggerButton type="warning" />,
};

export const ErrorToast: Story = {
  name: "Error",
  render: () => <TriggerButton type="error" />,
};

export const WithAction: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => {
        const id = toast.add({
          title: "Layer removed",
          description: "Rainfall (24h) was removed from the map.",
          actionProps: {
            children: "Undo",
            onClick: () => toast.close(id),
          },
        });
      }}
    >
      Remove layer
    </Button>
  ),
};

export const PromiseToast: Story = {
  name: "Promise",
  render: () => (
    <Button
      variant="outline"
      onClick={() => {
        toast.promise(
          new Promise<string>((resolve) =>
            setTimeout(() => resolve("flood-extent.geojson"), 2000),
          ),
          {
            loading: { ...presets.loading, type: "loading" },
            success: (file) => ({
              title: "Export complete",
              description: `${file} has been downloaded.`,
              type: "success",
            }),
            error: { ...presets.error, type: "error" },
          },
        );
      }}
    >
      Export layer
    </Button>
  ),
};

export const Stacked: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => {
        (["info", "warning", "success"] as const).forEach((type, i) =>
          setTimeout(() => showToast(type), i * 300),
        );
      }}
    >
      Show three toasts
    </Button>
  ),
};

export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-wrap justify-center gap-2">
      {(Object.keys(presets) as ToastType[]).map((type) => (
        <TriggerButton key={type} type={type} label={type} />
      ))}
    </div>
  ),
};
