export const maxProductOptionGroups = 10;
export const maxProductOptionsPerGroup = 10;
export const maxProductOptionAdditionalPrice = 2_000_000_000;

export type ProductOptionValue = {
  name: string;
  additionalPrice: number;
};

export type ProductOptionGroup = {
  name: string;
  options: ProductOptionValue[];
};

export type ProductOptionSelection = {
  groupName: string;
  optionName: string;
};

function optionText(value: unknown, maximumLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maximumLength) : "";
}

export function parseProductOptionGroups(value: string): ProductOptionGroup[] {
  const parsed = JSON.parse(value) as unknown;
  if (!Array.isArray(parsed) || parsed.length > maxProductOptionGroups) throw new Error("Invalid product option groups.");

  const groupNames = new Set<string>();
  return parsed.map((group) => {
    if (!group || typeof group !== "object") throw new Error("Invalid product option group.");
    const name = optionText("name" in group ? group.name : undefined, 100);
    const rawOptions = "options" in group ? group.options : undefined;
    if (!name || groupNames.has(name) || !Array.isArray(rawOptions) || rawOptions.length < 1 || rawOptions.length > maxProductOptionsPerGroup) {
      throw new Error("Invalid product option group.");
    }
    groupNames.add(name);

    const optionNames = new Set<string>();
    const options = rawOptions.map((option) => {
      if (!option || typeof option !== "object") throw new Error("Invalid product option.");
      const optionName = optionText("name" in option ? option.name : undefined, 120);
      const additionalPrice = "additionalPrice" in option && typeof option.additionalPrice === "number"
        ? option.additionalPrice
        : Number.NaN;
      if (
        !optionName ||
        optionNames.has(optionName) ||
        !Number.isSafeInteger(additionalPrice) ||
        additionalPrice < 0 ||
        additionalPrice > maxProductOptionAdditionalPrice
      ) {
        throw new Error("Invalid product option.");
      }
      optionNames.add(optionName);
      return { name: optionName, additionalPrice };
    });
    return { name, options };
  });
}

export function parseProductOptionSelections(value: unknown): ProductOptionSelection[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > maxProductOptionGroups) throw new Error("Invalid product option selections.");
  const selectedGroups = new Set<string>();
  return value.map((selection) => {
    if (!selection || typeof selection !== "object") throw new Error("Invalid product option selection.");
    const groupName = optionText("groupName" in selection ? selection.groupName : undefined, 100);
    const optionName = optionText("optionName" in selection ? selection.optionName : undefined, 120);
    if (!groupName || !optionName || selectedGroups.has(groupName)) throw new Error("Invalid product option selection.");
    selectedGroups.add(groupName);
    return { groupName, optionName };
  });
}

export function resolveProductOptionSelections(groups: ProductOptionGroup[], value: unknown) {
  const selections = parseProductOptionSelections(value);
  if (selections.length !== groups.length) throw new Error("All product option groups must be selected.");

  let additionalPrice = 0;
  const selectedOptions = groups.map((group) => {
    const selected = selections.find((selection) => selection.groupName === group.name);
    const option = group.options.find((candidate) => candidate.name === selected?.optionName);
    if (!selected || !option) throw new Error("Invalid product option selection.");
    additionalPrice += option.additionalPrice;
    return { groupName: group.name, optionName: option.name };
  });

  return {
    selectedOptions,
    additionalPrice,
    optionName: selectedOptions.map((selection) => `${selection.groupName}: ${selection.optionName}`).join(" / "),
  };
}
