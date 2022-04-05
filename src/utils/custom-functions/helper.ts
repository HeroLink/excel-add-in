import { stripSpaces } from "../common/string";

export function wrapCustomFunctionSnippetCode(
  code: string,
  functions: Array<{
    fullId: string;
    fullDisplayName: string;
    javascriptFunctionName: string;
  }>
): string {
  const newlineAndIndents = "\n        ";

  const almostReady = stripSpaces(`
      (function () {
        try {
          // TODO external code
          ${code
            .split("\n")
            .map((line) => newlineAndIndents + line)
            .join("")}
          ${generateFunctionAssignments(true /*success*/)}
        } catch (e) {
          ${generateFunctionAssignments(false /*success*/)}
        }
      })();
    `);

  return almostReady
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n");

  // Helper
  function generateFunctionAssignments(success: boolean) {
    return functions
      .map((item) => {
        return `CustomFunctions.associate("${item.fullId}", ${getRightSide()});`;

        function getRightSide() {
          return success
            ? `__generateFunctionBinding__("${item.fullDisplayName}", ${item.javascriptFunctionName})`
            : `__generateErrorFunction__("${item.fullDisplayName}", e)`;
        }
      })
      .join(newlineAndIndents);
  }
}
