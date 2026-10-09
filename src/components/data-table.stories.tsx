// src/components/data-table.stories.tsx
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DataTable, createDataTableColumnHelper } from "./data-table";
import { cn } from "@/lib/utils";

type Project = {
  id: string;
  name: string;
  created: string;
  budget: number;
  change: number;
  tasks: number;
};

const projectNames = [
  "Website redesign",
  "Mobile app launch",
  "Customer onboarding",
  "Data migration",
  "Marketing campaign",
  "Billing integration",
  "Support portal",
  "Analytics dashboard",
  "Security audit",
  "Design system",
  "API documentation",
  "Partner program",
];

const budgets = [41.3, 45.2, 38.7, 50.1, 36.5, 48.9, 52.3, 39.0, 44.7, 47.8, 41.2, 49.5];
const changes = [1.3, -1.0, 0.5, 1.2, -0.3, 2.7, -5.0, 4.1, 3.3, -2.4, 6.8, -1.5];

// Deterministic rows, so stories and visual tests render the same data every time.
function makeProjects(start: number, count: number): Project[] {
  return Array.from({ length: count }, (_, offset) => {
    const index = start + offset;
    const date = new Date(Date.UTC(2017, 9, 31 + index));
    return {
      id: `PRJ-${String(index + 1).padStart(3, "0")}`,
      name: projectNames[index % projectNames.length],
      created: date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }),
      budget: budgets[index % budgets.length],
      change: changes[index % changes.length],
      tasks: 120 + index,
    };
  });
}

const projects = makeProjects(0, 12);

const columnHelper = createDataTableColumnHelper<Project>();

const columns = [
  columnHelper.accessor("id", { header: "Project ID" }),
  columnHelper.accessor("name", { header: "Project" }),
  columnHelper.accessor("created", { header: "Created", enableSorting: false }),
  columnHelper.accessor("budget", {
    header: "Budget",
    cell: (info) => `$${info.getValue().toFixed(1)}k`,
  }),
  columnHelper.accessor("change", {
    header: "Change",
    cell: (info) => {
      const value = info.getValue();
      return (
        <span className={value < 0 ? "text-red-500" : "text-green-500"}>
          {value > 0 ? "+" : ""}
          {value.toFixed(1)}%
        </span>
      );
    },
  }),
  columnHelper.accessor("tasks", { header: "Tasks" }),
];

const meta = {
  title: "Components/DataTable",
  component: DataTable<Project>,
  parameters: {
    layout: "padded",
  },
  argTypes: {
    enableSorting: { control: "boolean" },
    stickyHeader: { control: "boolean" },
    isLoading: { control: "boolean" },
  },
  args: {
    columns,
    data: projects,
    enableSorting: false,
    stickyHeader: true,
    isLoading: false,
  },
} satisfies Meta<typeof DataTable<Project>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sortable: Story = {
  args: { enableSorting: true },
};

export const Loading: Story = {
  args: { isLoading: true, loadingRowCount: 6 },
};

export const Empty: Story = {
  args: { data: [], emptyState: "No projects yet." },
};

export const CustomStyling: Story = {
  args: {
    className: "rounded-lg border border-border-01",
    headerClassName: "[&_tr]:border-border-02",
    headClassName: "bg-surface-level-01 font-medium text-display-02",
    rowClassName: (row) => cn(row.index % 2 === 1 && "bg-surface-level-00"),
    cellClassName: "px-4",
  },
};

export const ColumnAlignment: Story = {
  args: {
    columns: columns.map((column) =>
      column.header === "Budget" || column.header === "Change" || column.header === "Tasks"
        ? { ...column, meta: { align: "right" as const } }
        : column,
    ),
  },
};

const PAGE_SIZE = 15;
const TOTAL_ROWS = 60;

function InfiniteScrollDemo(props: Partial<React.ComponentProps<typeof DataTable<Project>>>) {
  const [rows, setRows] = React.useState(() => makeProjects(0, PAGE_SIZE));
  const [isFetchingMore, setIsFetchingMore] = React.useState(false);

  // Simulates a network request for the next batch.
  const loadMore = () => {
    setIsFetchingMore(true);
    window.setTimeout(() => {
      setRows((current) => [
        ...current,
        ...makeProjects(current.length, Math.min(PAGE_SIZE, TOTAL_ROWS - current.length)),
      ]);
      setIsFetchingMore(false);
    }, 800);
  };

  return (
    <div className="flex flex-col gap-2">
      <DataTable
        {...props}
        columns={columns}
        data={rows}
        paginationMode="infinite"
        hasMore={rows.length < TOTAL_ROWS}
        isFetchingMore={isFetchingMore}
        onLoadMore={loadMore}
        className="h-96"
      />
      <span className="text-xs text-display-subtle-01">
        {rows.length} of {TOTAL_ROWS} rows loaded
      </span>
    </div>
  );
}

export const InfiniteScroll: Story = {
  render: (args) => <InfiniteScrollDemo enableSorting={args.enableSorting} />,
};
