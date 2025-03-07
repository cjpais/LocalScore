import { useState } from "react";

interface InitializeSelectionOptions<T, U> {
  allItems: T[];
  officialItems: U[];
  defaultCount: number;
  itemMatchFn: (item: T, officialItem: U) => boolean;
  mapFn: (item: T) => U;
}

export function useInitialCompareSelection<T, U>({
  allItems,
  officialItems,
  defaultCount,
  itemMatchFn,
  mapFn,
}: InitializeSelectionOptions<T, U>) {
  const getInitialItems = () => {
    if (!allItems.length) return [];

    // First, collect all official items that exist in the results
    const availableOfficialItems = officialItems.filter((officialItem) =>
      allItems.some((item) => itemMatchFn(item, officialItem))
    );

    // If we already have enough official items, use them
    if (availableOfficialItems.length >= defaultCount) {
      return availableOfficialItems;
    }

    // Otherwise, add non-official items to reach the minimum
    const nonOfficialItems = allItems
      .filter(
        (item) =>
          !availableOfficialItems.some((officialItem) =>
            itemMatchFn(item, officialItem)
          )
      )
      .slice(0, defaultCount - availableOfficialItems.length)
      .map(mapFn);

    // Combine official and additional items
    return [...availableOfficialItems, ...nonOfficialItems];
  };

  const [selectedItems, setSelectedItems] = useState<U[]>(getInitialItems());

  return { selectedItems, setSelectedItems };
}
