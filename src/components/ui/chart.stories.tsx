// src/components/ui/chart.stories.tsx
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  LabelList,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "./chart";

// The shadcn defaults on ChartContainer reference tokens (muted, border) that
// ewa-ui doesn't define, so stories map axis/grid styling onto our tokens.
const chartTokens =
  "[&_.recharts-cartesian-axis-tick_text]:fill-display-subtle-01 [&_.recharts-cartesian-grid_line]:stroke-border-00 [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-transparent";

const tooltipTokens = "border-border-02 bg-surface-base text-display-01";

const meta = {
  title: "UI/Chart",
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const monthlyData = [
  { month: "Jan", visits: 142 },
  { month: "Feb", visits: 246 },
  { month: "Mar", visits: 192 },
  { month: "Apr", visits: 58 },
  { month: "May", visits: 168 },
  { month: "Jun", visits: 172 },
];

const barConfig = {
  visits: {
    label: "Visits",
    theme: { light: "var(--grey-850)", dark: "var(--grey-50)" },
  },
  muted: {
    label: "Below target",
    theme: { light: "var(--grey-100)", dark: "var(--grey-800)" },
  },
  selected: {
    label: "Selected",
    color: "#3b82f6",
  },
} satisfies ChartConfig;

type BarArgs = { target: number; showTooltip: boolean };

function MonthlyBarChart({ target, showTooltip }: BarArgs) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(2);

  return (
    <ChartContainer config={barConfig} className={`w-144 ${chartTokens}`}>
      <BarChart data={monthlyData} barCategoryGap="10%" accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={12}
          tick={{ fontSize: 14 }}
        />
        <YAxis hide />
        {showTooltip && (
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent className={tooltipTokens} />}
          />
        )}
        <Bar
          dataKey="visits"
          radius={14}
          className="cursor-pointer"
          onClick={(_, index) =>
            setActiveIndex((current) => (current === index ? null : index))
          }
        >
          {monthlyData.map((entry, index) => (
            <Cell
              key={entry.month}
              fill={
                entry.visits >= target
                  ? "var(--color-visits)"
                  : "var(--color-muted)"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

export const BarChartStory: StoryObj<BarArgs> = {
  name: "Bar Chart",
  args: { target: 150, showTooltip: true },
  argTypes: {
    target: { control: { type: "range", min: 0, max: 260, step: 10 } },
    showTooltip: { control: "boolean" },
  },
  render: (args) => <MonthlyBarChart {...args} />,
};

const radialConfig = {
  score: {
    label: "Score",
    color: "var(--green-500)",
  },
} satisfies ChartConfig;

type RadialArgs = { value: number };

export const RadialProgress: StoryObj<RadialArgs> = {
  name: "Radial Progress",
  args: { value: 94 },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
  },
  render: ({ value }) => (
    <div className="rounded-16 bg-green-25 p-6">
      <ChartContainer
        config={radialConfig}
        className="aspect-square w-56"
        initialDimension={{ width: 224, height: 224 }}
      >
        <RadialBarChart
          data={[{ name: "score", value, fill: "var(--color-score)" }]}
          startAngle={90}
          endAngle={-270}
          innerRadius="78%"
          outerRadius="100%"
          barSize={22}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            dataKey="value"
            cornerRadius={11}
            background={{ fill: "var(--base-white)" }}
          />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !("cx" in viewBox)) return null;
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-grey-700 text-5xl font-medium tabular-nums"
                  >
                    {value}%
                  </text>
                );
              }}
            />
          </PolarRadiusAxis>
        </RadialBarChart>
      </ChartContainer>
    </div>
  ),
};

const genderData = [
  {
    gender: "women",
    label: "Woman",
    value: 40,
    fill: "var(--color-highlight-orange-75)",
  },
  {
    gender: "men",
    label: "Men",
    value: 60,
    fill: "var(--color-highlight-brown-75)",
  },
];

const genderConfig = {
  women: { label: "Woman", color: "var(---highlight-orange-75)" },
  men: {
    label: "Men",
    color: "var(--highlight-brown-75)",
  },
} satisfies ChartConfig;

const ageData = [
  { group: "Under 18", value: 18 },
  { group: "18-24", value: 22 },
  { group: "25-34", value: 25 },
  { group: "35-44", value: 15 },
  { group: "45-59", value: 12 },
  { group: "60+", value: 8 },
];

const ageConfig = {
  value: {
    label: "Population",
    theme: { light: "var(--grey-850)", dark: "var(--grey-50)" },
  },
  track: {
    theme: { light: "var(--grey-100)", dark: "var(--grey-800)" },
  },
  label: {
    theme: { light: "var(--base-white)", dark: "var(--grey-900)" },
  },
} satisfies ChartConfig;

function WomanIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 16 32" fill="currentColor" aria-hidden {...props}>
      <circle cx="8" cy="4" r="3.5" />
      <path d="M5 9h6l3.5 12h-3.2V31H9V21H7v10H4.7V21H1.5z" />
    </svg>
  );
}

function ManIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 16 32" fill="currentColor" aria-hidden {...props}>
      <circle cx="8" cy="4" r="3.5" />
      <path d="M3.5 9h9a2 2 0 0 1 2 2v9h-2.5v11H9V21H7v10H4V20H1.5v-9a2 2 0 0 1 2-2z" />
    </svg>
  );
}

function GenderDonut() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <ChartContainer
          config={genderConfig}
          className="aspect-square w-48"
          initialDimension={{ width: 192, height: 192 }}
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="gender"
                  hideLabel
                  className={tooltipTokens}
                />
              }
            />
            <Pie
              data={genderData}
              dataKey="value"
              nameKey="gender"
              startAngle={90}
              endAngle={450}
              innerRadius="90%"
              outerRadius="100%"
              stroke="none"
            />
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-1">
          <WomanIcon className="h-8 text-highlight-orange-75" />
          <ManIcon className="h-8 text-highlight-brown-75" />
        </div>
      </div>
      <ul className="flex items-center gap-6 text-sm text-display-body">
        {genderData.map((item) => (
          <li key={item.gender} className="flex items-center gap-1.5">
            <span
              className="size-1.5 rounded-full"
              style={{
                backgroundColor:
                  item.gender === "women"
                    ? "var(--highlight-orange-75)"
                    : "var(--highlight-brown-75)",
              }}
            />
            {item.label} {item.value}%
          </li>
        ))}
      </ul>
    </div>
  );
}

type ValueLabelProps = {
  y?: number | string;
  height?: number | string;
  value?: unknown;
  parentViewBox?: { x?: number; width?: number };
};

function TrackEndLabel({ y, height, value, parentViewBox }: ValueLabelProps) {
  const right = (parentViewBox?.x ?? 0) + (parentViewBox?.width ?? 0);
  return (
    <text
      x={right - 12}
      y={Number(y) + Number(height) / 2}
      textAnchor="end"
      dominantBaseline="middle"
      className="fill-display-02 text-[0.625rem] font-medium tabular-nums"
    >
      {String(value)}%
    </text>
  );
}

function AgeBreakdown() {
  return (
    <ChartContainer
      config={ageConfig}
      className="aspect-auto h-64 w-88"
      initialDimension={{ width: 352, height: 256 }}
    >
      <BarChart
        data={ageData}
        layout="vertical"
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        barCategoryGap={8}
      >
        <XAxis type="number" domain={[0, 40]} hide />
        <YAxis type="category" dataKey="group" hide />
        <Bar
          dataKey="value"
          fill="var(--color-value)"
          radius={6}
          background={{ fill: "var(--color-track)", radius: 8 }}
          isAnimationActive={false}
        >
          <LabelList
            dataKey="group"
            position="insideLeft"
            offset={10}
            className="fill-display-alt text-[0.625rem]"
          />
          <LabelList
            dataKey="value"
            content={(props) => (
              <TrackEndLabel {...(props as ValueLabelProps)} />
            )}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

export const PopulationDistribution: Story = {
  name: "Population Distribution",
  render: () => (
    <div className="flex flex-wrap gap-12 rounded-16 border border-border-02 bg-surface-base p-8">
      <section className="flex flex-col gap-6">
        <h3 className="text-sm text-display-subtle-03">
          Population Distribution (%)
        </h3>
        <GenderDonut />
      </section>
      <section className="flex flex-col gap-3">
        <h3 className="text-sm text-display-subtle-03">
          Population Distribution (%)
        </h3>
        <AgeBreakdown />
      </section>
    </div>
  ),
};
