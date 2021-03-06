import * as ts from "typescript";
export interface ICustomFunctionsMetadata {
  functions: IFunction[];
}
export interface IFunction {
  id: string;
  name: string;
  description?: string;
  helpUrl?: string;
  parameters: IFunctionParameter[];
  result?: IFunctionResult;
  options?: IFunctionOptions;
}
export interface IFunctionOptions {
  cancelable?: boolean;
  requiresAddress?: boolean;
  stream?: boolean;
  volatile?: boolean;
  requiresParameterAddresses?: boolean;
}
export interface IFunctionParameter {
  name: string;
  description?: string;
  type: string;
  dimensionality?: string;
  optional?: boolean;
  repeating?: boolean;
}
export interface IFunctionResult {
  type?: string;
  dimensionality?: string;
}
export interface IGenerateResult {
  metadataJson: string;
  associate: IAssociate[];
  errors: string[];
}
export interface IFunctionExtras {
  errors: string[];
  javascriptFunctionName: string;
}
export interface IParseTreeResult {
  associate: IAssociate[];
  extras: IFunctionExtras[];
  functions: IFunction[];
}
export interface IAssociate {
  functionName: string;
  id: string;
}
export interface IExperimentalOptions {
  /** @deprecated */
  allowRepeatingParameters?: boolean;
}
export interface IOptions {
  experimental?: IExperimentalOptions;
}

/**
 * Takes the sourceCode and attempts to parse the functions information
 * @param sourceCode source containing the custom functions
 * @param sourceFileName source code file name or path
 * @param parseTreeOptions options to enable or disable
 */
export declare function parseTree(sourceCode: string, sourceFileName: string): IParseTreeResult;
/**
 * Log containing all the errors found while parsing
 * @param error Error string to add to the log
 */
export declare function logError(error: string, position?: ts.LineAndCharacter | null): string;
