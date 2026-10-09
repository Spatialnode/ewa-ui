// Re-exports recharts so apps can build charts with ewa-ui's ChartContainer
// without adding recharts to their own dependencies:
//   import { BarChart, Bar, XAxis } from "@spatialnode/ewa-ui/recharts";
// Kept out of the main entry because recharts' Tooltip, Label and Legend
// would clash with ewa-ui's own components.
export * from "recharts";
