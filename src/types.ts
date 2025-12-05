export enum PopulateType {
  // when the value is extracted from the same generic entity object
  Basic = "basic",
  // from another generic entity object
  Reference = "reference",
}

export interface IReference {
  entityName: string;
  // if path is not defined and the type is reference, the value is the id
  path?: string;
  version?: number;
}

// export interface IEmbeddedDocument {
//   rootFieldId?: string;
//   // in case it is root field the field name should be unique -> we can do the search with field name also
//   fieldName?: string;
// }
export interface PopulateData {
  // default is basic
  type?: PopulateType;
  // it could be separated by dot from the parent field
  path: string;
  // if the populate type is reference, this field should be defined
  reference?: IReference;
  // from the reference field above we get this field
  referencePopulated?: IFieldDefinition;

  // the path of field from the root field with type like <parent path><type:fieldType><this field path>
  absolutePath?: string;

  // when a field being used with a value (as generic entity), this path will point to the value of the field
  absoluteValuePath?: string;
}

export enum CalculationTypeEnum {
  // it is for doing calculation with operator like subtraction, addition, multiplication, division...
  Simple = "basic",
}

export enum OperatorEnum {
  ADD = "+",
  SUBTRACT = "-",
  MULTIPLY = "*",
  DIVIDE = "/",
}

export interface IFieldDependency {
  // the path of fields at the same level
  // if user want to trigger computation on other field level, they just need to attach computation on higher level
  absoluteFieldPath: string;
  absoluteValuePath?: string;
  value?: any;
}

export type DefaultComputationValue = string | number | boolean | null;

// the order of relation is from entity storing relation the another one
export enum RelationTypeEnum {
  ONE_TO_ONE = "one_to_one",
  ONE_TO_MANY = "one_to_many",
  MANY_TO_ONE = "many_to_one",
  MANY_TO_MANY = "many_to_many",
}

export enum RelationsDisplayedPositionsEnum {
  LIST_GENERIC_ENTITY = "list_generic_entity",
}

export interface RelationDisplayed {
  relationType: RelationTypeEnum;
  displayed: boolean;
  relateToEntityName: string;
  relateToEntityVersion: number;
  position: RelationsDisplayedPositionsEnum;
  // absolute field path, the field that store id of the related entity
  relatedField: string;
  title?: string;
}

export interface Computation {
  computationHandler: string;
  disabled?: boolean; // if true, the computation is disabled and not executed
  // do computation when dependencies are changed
  dependencies: IFieldDependency[];
  content: string;
  defaultValue?: DefaultComputationValue;
  computedValueType?: FieldTypeEnum;
}

export interface Validation {
  disabled?: boolean; // if true, the validation is disabled and not executed
  handler: string;
  content: string;
  messageOnFailure?: string;
}

export interface EnumValues {
  [key: string]: {
    name: string;
    hexColorCode?: string;
  };
}

// for storing fields flatten from root field with the path to get it from root field
export interface IFieldsFlatten {
  // the key is the path of the field from the root field with type like fields.0.populateData.referencePopulated.fields.0>
  [fieldPath: string]: IFieldDefinition;
}

export interface IFieldDefinition {
  parentFieldDefinitionId?: string;
  //the can be mapped with generic entity so that the name and parentFieldDefinitionId have to make a unique key
  name: string;
  viewName?: string;
  // in case the field is a reference field, we need to handle the way it should displayed on AutoComplete component
  buildLabelAutocompleteHandler?: string;
  validation?: Validation;
  type: FieldTypeEnum;
  required?: boolean; // Note: This property should probably be renamed to 'required' for clarity
  populateData?: PopulateData; // Optional and can be null if it is root field or not populated
  fields?: IFieldDefinition[] | null; // Recursively defines fields
  childFieldIds?: string[] | null;
  description?: string;
  version: number;

  // a mongoDB search object
  genericSearch?: any;

  useVectorSearch?: boolean;

  enumValues?: EnumValues;
  computation?: Computation;
  systemField?: boolean;
  defaultValue?: any;
  // if a field is readOnly then it just be displayed on the form and the value of it created originally and can't be changed
  readOnly?: boolean;
  unique?: boolean;
  hidden?: boolean;

  // TODO: it is in prototype and just applied for the root fields
  // the root cause is does it break the relationship concept of mongoDB ?
  relationsDisplayed?: RelationDisplayed[];
}

export enum FieldTypeEnum {
  // ROOT_FIELD = "root_field",
  COMPUTATION = "COMPUTATION",
  ENUM = "enum",
  RICH_TEXT = "rich_text",
  STRING = "string",
  NUMBER = "number",
  REFERENCE = "reference",
  BOOLEAN = "boolean",
  DATE = "date",
  // OBJECT = "object",
  // ARRAY = "array",
  ARRAY_REFERENCE = "array_of_object",
  // the same embedded document of mongoDB
  ARRAY_EMBEDDED_DOCUMENTS = "array_of_embedded_documents",
  EMBEDDED_DOCUMENT = "embedded_document",
  // the field group can be a object and is a subfield of the root field
  FIELD_GROUP = "field_group",
}

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
