/* global Excel, Office */
import { ICustomFunctionsMetadata, IFunction } from "custom-functions-metadata";
import { ICustomFunctionParseResult } from "@/inferfaces/custom-functions";
import { parseMetadata } from "./parse";
import { wrapCustomFunctionSnippetCode } from "./helper";
import compileScript from "../common/compile";

function getJsonMetadataString(functions: Array<ICustomFunctionParseResult<IFunction>>): string {
  const registrationPayload: ICustomFunctionsMetadata = {
    functions: functions.filter((func) => func.status === "good").map((func) => func.metadata),
  };
  return JSON.stringify(registrationPayload, null, 4);
}

function getNamespace() {
  return "XLP".toUpperCase();
}

async function registerCustomFunctions(
  functions: Array<ICustomFunctionParseResult<IFunction>>,
  code: string
): Promise<void> {
  const jsonMetadataString = getJsonMetadataString(functions);
  if (Office.context.requirements.isSetSupported("CustomFunctions", "1.6")) {
    await (Excel as any).CustomFunctionManager.register(jsonMetadataString, code);
  } else {
    await Excel.run(async (context) => {
      if (Office.context.platform === Office.PlatformType.OfficeOnline) {
        const namespace = getNamespace();
        (context.workbook as any).registerCustomFunctions(
          namespace,
          jsonMetadataString,
          "" /*addinId*/,
          "en-us",
          namespace
        );
      } else {
        (Excel as any).CustomFunctionManager.newObject(context).register(jsonMetadataString, code);
      }
      await context.sync();
    });
  }
}

async function getRegistrationResult(file: File): Promise<{
  parseResults: Array<ICustomFunctionParseResult<IFunction>>;
  code: string;
}> {
  const parseResults: Array<ICustomFunctionParseResult<IFunction>> = [];
  const code: string[] = [];

  const solution = {
    name: file.name,
    options: {},
  };
  const namespace = getNamespace();
  const reader = new FileReader();
  reader.readAsText(file);
  // reader.addEventListener(
  //   "load",
  //   () => {
  //     if (file) {
  //       reader.readAsText(file);
  //     }
  //   },
  //   false
  // );
  const fileContent = reader.result.toString();
  const functions: Array<ICustomFunctionParseResult<IFunction>> = parseMetadata({
    solution,
    namespace,
    fileContent,
  });

  let hasErrors = functions.some((func) => func.status === "error");

  let snippetCode: string;
  if (!hasErrors) {
    try {
      snippetCode = compileScript(fileContent);
      code.push(
        wrapCustomFunctionSnippetCode(
          snippetCode,
          functions.map((func) => ({
            fullId: func.metadata.id,
            fullDisplayName: func.metadata.name,
            javascriptFunctionName: func.javascriptFunctionName,
          }))
        )
      );
    } catch (e) {
      functions.forEach((f) => {
        f.status = "error";
        f.errors = f.errors || [];
        f.errors.unshift("Snippet compiler error");
      });
      hasErrors = true;
    }
  }

  functions.forEach((func) => parseResults.push(func));
  return { parseResults: parseResults, code: code.join("\n\n") };
}

/**
 * dynamically reigister custom fusction
 * @param file the custom function code file
 */
export async function dynamicRegisterCF(file: File) {
  // const engineStatus = await getCustomFunctionEngineStatusSafe();
  const { parseResults, code } = await getRegistrationResult(file);
  if (parseResults.length > 0) {
    await registerCustomFunctions(parseResults, code);
  }
}
