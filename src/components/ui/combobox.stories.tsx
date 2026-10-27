// src/components/ui/combobox.stories.tsx
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxValue,
  useComboboxAnchor,
} from "./combobox";
import { Label } from "./label";

const categories = [
  "Category One",
  "Category Two",
  "Category Three",
  "Category Four",
  "Category Five",
  "Category Six",
  "Category Seven",
  "Category Eight",
];

const subcategories: Record<string, string[]> = {
  "Category One": ["Subcategory 1A", "Subcategory 1B", "Subcategory 1C"],
  "Category Two": ["Subcategory 2A", "Subcategory 2B"],
  "Category Three": ["Subcategory 3A", "Subcategory 3B", "Subcategory 3C"],
};

const groupedItems = [
  { value: "Group A", items: ["Item A1", "Item A2", "Item A3"] },
  { value: "Group B", items: ["Item B1", "Item B2"] },
];

const meta = {
  title: "UI/Combobox",
  component: Combobox,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-[25rem]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Combobox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Combobox items={categories}>
      <ComboboxInput placeholder="Select category" />
      <ComboboxContent>
        <ComboboxEmpty>No results found.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
};

export const WithClear: Story = {
  render: () => (
    <Combobox items={categories} defaultValue="Category Two">
      <ComboboxInput placeholder="Select category" showClear />
      <ComboboxContent>
        <ComboboxEmpty>No results found.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Combobox items={categories} disabled>
      <ComboboxInput placeholder="Select category" disabled />
      <ComboboxContent>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
};

export const ErrorState: Story = {
  name: "Error",
  render: () => (
    <Combobox items={categories}>
      <ComboboxInput placeholder="Select category" aria-invalid />
      <ComboboxContent>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
};

export const Grouped: Story = {
  render: () => (
    <Combobox items={groupedItems}>
      <ComboboxInput placeholder="Select item" />
      <ComboboxContent>
        <ComboboxEmpty>No results found.</ComboboxEmpty>
        <ComboboxList>
          {(group: (typeof groupedItems)[number], index: number) => (
            <ComboboxGroup key={group.value} items={group.items}>
              <ComboboxLabel>{group.value}</ComboboxLabel>
              <ComboboxCollection>
                {(item: string) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxCollection>
              {index < groupedItems.length - 1 && <ComboboxSeparator />}
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
};

export const Multiple: Story = {
  render: function MultipleStory() {
    const anchor = useComboboxAnchor();

    return (
      <Combobox
        items={categories}
        multiple
        defaultValue={["Category One", "Category Three"]}
      >
        <ComboboxChips ref={anchor}>
          <ComboboxValue>
            {(values: string[]) => (
              <>
                {values.map((value) => (
                  <ComboboxChip key={value}>{value}</ComboboxChip>
                ))}
                <ComboboxChipsInput placeholder="Add category" />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>No results found.</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );
  },
};

// Two dependent fields, the second filtered by the first.
export const DependentFields: Story = {
  render: function DependentFieldsStory() {
    const [category, setCategory] = React.useState<string | null>(null);
    const [subcategory, setSubcategory] = React.useState<string | null>(null);
    const options = category ? (subcategories[category] ?? []) : [];

    return (
      <div className="flex flex-col gap-4">
        <p className="text-base font-medium text-display-body">
          Choose a category
        </p>
        <div className="flex flex-col gap-2">
          <Label className="font-normal text-display-subtle-03">Category</Label>
          <Combobox
            items={categories}
            value={category}
            onValueChange={(value: string | null) => {
              setCategory(value);
              setSubcategory(null);
            }}
          >
            <ComboboxInput placeholder="Select category" />
            <ComboboxContent>
              <ComboboxEmpty>No results found.</ComboboxEmpty>
              <ComboboxList>
                {(item: string) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
        <div className="flex flex-col gap-2">
          <Label className="font-normal text-display-subtle-03">
            Subcategory
          </Label>
          <Combobox
            items={options}
            value={subcategory}
            onValueChange={(value: string | null) => setSubcategory(value)}
            disabled={!category}
          >
            <ComboboxInput
              placeholder="Select subcategory"
              disabled={!category}
            />
            <ComboboxContent>
              <ComboboxEmpty>No results found.</ComboboxEmpty>
              <ComboboxList>
                {(item: string) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      </div>
    );
  },
};
