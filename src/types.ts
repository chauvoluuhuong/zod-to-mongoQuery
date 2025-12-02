// base operators per type
export const OPERATORS: Record<string, string[]> = {
  string: ["eq", "ne", "in", "nin", "regex", "search"],
  number: ["eq", "ne", "gt", "gte", "lt", "lte", "in", "nin"],
  boolean: ["eq", "ne"],
  date: ["eq", "ne", "gt", "gte", "lt", "lte"],
  "string[]": ["eq", "ne", "in", "nin", "regex", "search"],
  "number[]": ["eq", "ne", "gt", "gte", "lt", "lte", "in", "nin"],
  "boolean[]": ["eq", "ne", "in", "nin"],
  "date[]": ["eq", "ne", "gt", "gte", "lt", "lte", "in", "nin"],
  array: ["eq", "ne", "in", "nin"],
};

export interface QueryAbilities {
  [field: string]: {
    type: string;
    supportedOperators: string[];
  };
}

export const OPERATOR_MAP: Record<string, string> = {
  eq: "$eq",
  ne: "$ne",
  gt: "$gt",
  gte: "$gte",
  lt: "$lt",
  lte: "$lte",
  in: "$in",
  nin: "$nin",
  regex: "$regex",
  search: "$regex",
};
