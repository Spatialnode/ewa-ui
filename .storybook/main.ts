import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp",
    "@storybook/addon-themes"
  ],
  "framework": "@storybook/react-vite",
  async viteFinal(viteConfig) {
    viteConfig.plugins ??= [];
    viteConfig.plugins.push(tailwindcss());
    viteConfig.resolve ??= {};
    viteConfig.resolve.alias = {
      ...viteConfig.resolve.alias,
      "@": path.resolve(dirname, "../src"),
    };
    return viteConfig;
  },
};
export default config;