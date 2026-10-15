// src/components/ui/toast.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";
import { Toaster, toast } from "./toast";

type ToastType =
  | "default"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "loading";

const presets = {
  default: { title: "Layer added" },
  success: { title: "A thing happened" },
  info: { title: "New imagery available" },
  warning: { title: "Large selection" },
  error: { title: "Upload failed" },
  loading: { title: "Processing" },
} as const satisfies Record<ToastType, { title: string }>;

function showToast(type: ToastType, toasterId: string) {
  const show = type === "default" ? toast : toast[type];
  show(presets[type].title, { toasterId });
}

function TriggerButton({
  type,
  toasterId,
  label,
}: {
  type: ToastType;
  toasterId: string;
  label?: string;
}) {
  return (
    <Button variant="outline" onClick={() => showToast(type, toasterId)}>
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
    (Story, { id }) => (
      <>
        <Story />
        <Toaster id={id} />
      </>
    ),
  ],
} satisfies Meta<typeof Toaster>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (_, { id }) => (
    <TriggerButton toasterId={id} type="default" label="Show toast" />
  ),
};

export const Success: Story = {
  render: (_, { id }) => <TriggerButton toasterId={id} type="success" />,
};

export const Info: Story = {
  render: (_, { id }) => <TriggerButton toasterId={id} type="info" />,
};

export const Warning: Story = {
  render: (_, { id }) => <TriggerButton toasterId={id} type="warning" />,
};

export const ErrorToast: Story = {
  name: "Error",
  render: (_, { id }) => <TriggerButton toasterId={id} type="error" />,
};

export const WithoutIcon: Story = {
  render: (_, { id }) => (
    <Button
      variant="outline"
      onClick={() =>
        toast.success(presets.success.title, { icon: null, toasterId: id })
      }
    >
      Show toast without icon
    </Button>
  ),
};

export const WithCloseButton: Story = {
  render: (_, { id }) => (
    <Button
      variant="outline"
      onClick={() =>
        toast.success(presets.success.title, {
          closeButton: true,
          toasterId: id,
        })
      }
    >
      Show toast with close button
    </Button>
  ),
};

export const WithAction: Story = {
  render: (_, { id }) => (
    <Button
      variant="outline"
      onClick={() => {
        toast("Layer removed", {
          toasterId: id,
          action: {
            label: "Undo",
            onClick: () => toast.success("Layer restored", { toasterId: id }),
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
  render: (_, { id }) => (
    <Button
      variant="outline"
      onClick={() => {
        toast.promise(
          new Promise<string>((resolve) =>
            setTimeout(() => resolve("flood-extent.geojson"), 2000),
          ),
          {
            loading: presets.loading.title,
            success: (file) => `${file} exported`,
            error: presets.error.title,
            toasterId: id,
          },
        );
      }}
    >
      Export layer
    </Button>
  ),
};

export const Stacked: Story = {
  render: (_, { id }) => (
    <Button
      variant="outline"
      onClick={() => {
        (["info", "warning", "success"] as const).forEach((type, i) =>
          setTimeout(() => showToast(type, id), i * 300),
        );
      }}
    >
      Show three toasts
    </Button>
  ),
};

export const AllTypes: Story = {
  render: (_, { id }) => (
    <div className="flex flex-wrap justify-center gap-2">
      {(Object.keys(presets) as ToastType[]).map((type) => (
        <TriggerButton key={type} toasterId={id} type={type} label={type} />
      ))}
    </div>
  ),
};
