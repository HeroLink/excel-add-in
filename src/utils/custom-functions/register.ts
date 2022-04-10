/* global Excel, Office, console, document, window, CustomFunctions, globalThis*/
// import * as fs from "fs";
import { ICustomFunctionsMetadata, IFunction } from "./generate/generate";
import {
  ICustomFunctionParseResult,
  ICustomFunctionsIframeRunnerTypeScriptMetadata,
} from "@/inferfaces/custom-functions";
import { parseMetadata } from "./parse";
import { wrapCustomFunctionSnippetCode } from "./helper";
import compileScript from "../common/compile";
import { consoleMonkeypatch } from "./console.monkeypatch";
import { strictType, tryCatch } from "../common/misc";
import generateCustomFunctionIframe from "./runner";

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

// async function getRegistrationResult(file: File): Promise<{
// async function getRegistrationResult(
//   dir: string,
//   fileName: string
// )
async function getRegistrationResult(fileContent: string): Promise<{
  parseResults: Array<ICustomFunctionParseResult<IFunction>>;
  code: string;
}> {
  const parseResults: Array<ICustomFunctionParseResult<IFunction>> = [];
  const code: string[] = [decodeURIComponent(consoleMonkeypatch.trim())];

  const solution = {
    // name: file.name,
    name: "test",
    options: {},
  };
  const namespace = getNamespace();
  // const reader = new FileReader();
  // reader.readAsText(file);
  // // reader.addEventListener(
  // //   "load",
  // //   () => {
  // //     if (file) {
  // //       reader.readAsText(file);
  // //     }
  // //   },
  // //   false
  // // );
  // const fileContent = reader.result.toString();
  // const fileContent = fs.readFileSync(`${dir}/${fileName}`).toString();
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
      console.log(snippetCode);
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

async function getMetadata(fileContent: string) {
  let ret = null;
  tryCatch(() => {
    const solution = {
      name: "test",
      options: {},
    };
    const namespace = getNamespace();
    const metadata: Array<ICustomFunctionParseResult<IFunction>> = parseMetadata({
      solution,
      namespace,
      fileContent,
    });
    if (metadata.some((item) => item.status !== "good")) {
      return ret;
    }

    console.log("解析metadata", metadata);
    ret = strictType<ICustomFunctionsIframeRunnerTypeScriptMetadata>({
      solutionId: solution.name,
      namespace: namespace,
      functions: metadata.map((item) => ({
        fullId: item.metadata.id,
        fullDisplayName: item.metadata.name,
        javascriptFunctionName: item.javascriptFunctionName,
      })),
      code: compileScript(fileContent),
    });
  });
  return ret;
}

export const METHODS_EXPOSED_ON_CF_RUNNER_OUTER_FRAME = {
  scriptRunnerOnLoad: "scriptRunnerOnLoad",
  scriptRunnerOnLoadComplete: "scriptRunnerOnLoadComplete",
};

async function addIframe(typescriptMetadata: ICustomFunctionsIframeRunnerTypeScriptMetadata) {
  tryCatch(() => {
    let successfulRegistrationsCount = 0;
    window[METHODS_EXPOSED_ON_CF_RUNNER_OUTER_FRAME.scriptRunnerOnLoad] = (contentWindow: Window & typeof globalThis) =>
      tryCatch(() => {
        contentWindow.onerror = (...args) => console.error(args);
        console.log(`Snippet for namespace "${typescriptMetadata.namespace}" beginning to load.`);
        (contentWindow as any)["CustomFunctionsDictionary"] = (window as any)["CustomFunctionsDictionary"];
      });

    window[METHODS_EXPOSED_ON_CF_RUNNER_OUTER_FRAME.scriptRunnerOnLoadComplete] = () => {
      successfulRegistrationsCount++;
      console.log(successfulRegistrationsCount);
    };
  });

  const iframe = document.createElement("iframe");
  iframe.src = "about:blank";
  document.head.insertBefore(iframe, null);
  const contentWindow = iframe.contentWindow!;
  // Write to the iframe (and note that must do the ".write" call first,
  // before setting any window properties). Setting console and onerror here
  // (for any initial logging or error handling from snippet-referenced libraries),
  // but for extra safety also setting them inside of scriptRunnerOnLoad.
  contentWindow.document.open();
  contentWindow.document.write(generateCustomFunctionIframe(typescriptMetadata));
  (contentWindow as any).console = window.console;
  contentWindow.onerror = (...args) => {
    console.error(args);
  };
  contentWindow.document.close();
}

/**
 * dynamically reigister custom fusction
 * @param file the custom function code file
 */
// export async function dynamicRegisterCF(file: File) {
// export async function dynamicRegisterCF(dir: string, fileName: string) {
export async function dynamicRegisterCF(fileContent: string) {
  // const engineStatus = await getCustomFunctionEngineStatusSafe();
  // const { parseResults, code } = await getRegistrationResult(file);
  // const { parseResults, code } = await getRegistrationResult(dir, fileName);
  const { parseResults, code } = await getRegistrationResult(fileContent);
  console.log("functions文件转化结果", parseResults);
  console.log("functions文件代码", code);
  if (parseResults.length > 0) {
    await registerCustomFunctions(parseResults, code);
    console.log("functions注册成功");
  }
  tryCatch(async () => {
    const CustomFunctionsDictionary = {};
    (window as any).CustomFunctionsDictionary = CustomFunctionsDictionary;
    const typescriptMetadata = await getMetadata(fileContent);
    console.log("得到typescriptMetadata", typescriptMetadata);
    await addIframe(typescriptMetadata);
    console.log("CustomFunctionsDictionary", CustomFunctionsDictionary);
    for (const key in CustomFunctionsDictionary) {
      CustomFunctions.associate(key, CustomFunctionsDictionary[key]);
      console.log("key", key);
      console.log("CustomFunctionsDictionary", CustomFunctionsDictionary[key]);
    }
  });
}
