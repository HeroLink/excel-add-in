/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */
import { dynamicRegisterCF } from "@/utils/custom-functions/register";

/* global console, document, Excel, Office, fetch*/

Office.onReady((info) => {
  if (info.host === Office.HostType.Excel) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    document.getElementById("run").onclick = run;
  }
});

export async function run() {
  try {
    await Excel.run(async (context) => {
      /**
       * Insert your Excel code here
       */
      const range = context.workbook.getSelectedRange();
      // const range = context.workbook.worksheets.getActiveWorksheet().getRange("F2:H4");
      // Read the range address
      range.load("address");
      // range.load("values");
      // Update the fill color
      range.format.fill.color = "#00ffcc";
      await context.sync();
      console.log(`The range address was ${range.address}.`);
      /* console.log(`The range address was ${range.values}.`);
      range.values = [
        ["Hi", "Bojre", "Karlsoon"],
        ["I am", "Chen", "Lu"],
        ["You can", "call me", "Link Chen"],
      ]; */

      await fetch("https://localhost:3000/tests/custom-functions/functions.ts")
        .then((res) => {
          console.log("Fetch function.ts", res);
          return res.text();
        })
        .then((data) => {
          // console.log("Read functions.ts", data);
          dynamicRegisterCF(data);
        });
    });
  } catch (error) {
    console.error(error);
  }
}
