/* The parsed result, as processed by Script Lab.
 * Be sure to pass "IFunction" from the "custom-functions-metadata" package as the "T" argument.
 * This is necessary for keeping the ICustomFunctionParseResult declaration ambient
 *   (or else it would require always importing this file)
 */
export interface ICustomFunctionParseResult<T> {
  /** The as-written name of the function (no namespace/sub-namespace, not capitalized. E.g., "add42") */
  javascriptFunctionName: string;

  // Sub-namespaced full name, not capitalized (e.g., "BlankSnippet1.add42") */
  nonCapitalizedFullName: string;

  status: CustomFunctionsRegistrationStatus;

  // Errors, if any
  errors?: string[];

  metadata: T;
}

type CustomFunctionsRegistrationStatus = "good" | "skipped" | "error" | "untrusted";

// export interface ICustomFunctionEngineStatus {
//   enabled: boolean;
//   nativeRuntime?: boolean;
// }
