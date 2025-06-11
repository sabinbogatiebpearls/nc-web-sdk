// Define the Enum for component names
export enum ComponentNameEnum {
  DOC_UTILITY = 'DOC_UTILITY',
  ON_BOARDING = 'ON_BOARDING'
};

export type ComponentNameType = keyof typeof ComponentNameEnum;