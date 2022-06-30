// Comment all codes intentionally, dynamically reigster custom functions
/* global console, Excel */
// @ts-nocheck

import Recognizers from "@microsoft/recognizers-text-suite/dist/recognizers-text-suite.es5";

/**
 * This recognizer will find any dimension presented. E.g. "My house is 20 km from my school".
 * Limitations of calling Excel JavaScript APIs through a custom function
 * =XLP.GETDIMENSION("My house is 20 km from my school")
 * =XLP.GETDIMENSION("B2")
 * @customfunction
 * @param address The address of the cell contains dimensions.
 * @returns Recognized results.
 */
export async function getDimension(address: string) {
  console.log(Recognizers);
  try {
    const context = new Excel.RequestContext();
    let range = context.workbook.worksheets.getActiveWorksheet().getRange(address);
    range.load("values");
    await context.sync();
    let value = range.values[0][0];
    console.log("Get cell value", value);
    // let value = sentence;
    if (value) {
      let results = Recognizers.recognizeDimension(value, Recognizers.Culture.English);
      console.log("Recognized result", results);
      if (results) {
        const result = results[0];
        const resolution: Excel.EntityCellValue = {
          type: Excel.CellValueType.entity,
          text: "resolution",
          properties: { value: result.resolution.value, unit: result.resolution.unit },
          basicType: Excel.RangeValueType.error,
          basicValue: "#VALUE!",
        };
        const myEntity: Excel.EntityCellValue = {
          type: Excel.CellValueType.entity,
          text: "dimension",
          properties: {
            start: result.start,
            end: result.end,
            resolution,
            text: result.text,
            typeName: result.typeName,
          },
          basicType: Excel.RangeValueType.error, // A readonly property. Used as a fallback in incompatible scenarios.
          basicValue: "#VALUE!", // A readonly property. Used as a fallback in incompatible scenarios.
        };
        range = context.workbook.getSelectedRange();
        range.valuesAsJson = [[myEntity]];
        await context.sync();
      }
    }
  } catch (error) {
    return error;
  }
}

/**
 * Take a number as the input value and return a formatted number value as the output.
 * @customfunction
 * @param {number} value
 * @param {string} format (e.g. "0.00%")
 * @returns A formatted number value.
 */
export function createFormattedNumber(value, format) {
  return {
    type: "FormattedNumber",
    basicValue: value,
    numberFormat: format,
  };
}

/**
 * Accept an entity value data type as a function input.
 * @customfunction
 * @param {any} value
 * @param {string} attribute
 * @returns {any} The text value of the entity.
 */
export function getEntityAttribute(value, attribute) {
  if (value.type == "Entity") {
    if (attribute == "text") {
      return value.text;
    } else {
      return value.properties[attribute].basicValue;
    }
  } else {
    return JSON.stringify(value);
  }
}

/**
 * Return an entity
 * @customfunction
 * @param address The address of the cell.
 * @returns {any} The entity.
 */
export async function getEntity(address: string) {
  // This is an example of the complete JSON of a formatted number value.
  // In this case, the number is formatted as a date.
  const myDate: Excel.FormattedNumberCellValue = {
    type: Excel.CellValueType.formattedNumber,
    basicValue: 43830.0,
    basicType: Excel.RangeValueType.double, // A readonly property. Used as a fallback in incompatible scenarios.
    numberFormat: "yyyy-mm-dd",
  };
  // This is an example of the complete JSON for a web image.
  const myImage: Excel.WebImageCellValue = {
    type: Excel.CellValueType.webImage,
    address: "https://th.bing.com/th/id/OIP.PyC2GZtQNUMjUSW3ExgpeAHaE8?w=257&h=180&c=7&r=0&o=5&dpr=1.1&pid=1.7",
    basicType: Excel.RangeValueType.error, // A readonly property. Used as a fallback in incompatible scenarios.
    basicValue: "#VALUE!", // A readonly property. Used as a fallback in incompatible scenarios.
  };
  // This is an example of the complete JSON for an entity value.
  // The entity contains text and properties which contain an image, a date, and another text value.
  const myEntity: Excel.EntityCellValue = {
    type: Excel.CellValueType.entity,
    text: "COVID-19",
    properties: {
      Image: myImage,
      "Start Date": myDate,
      Infomation: {
        type: Excel.CellValueType.string,
        basicValue:
          "The COVID-19 pandemic is an ongoing global pandemic caused by severe acute respiratory syndrome coronavirus 2 (SARS-CoV-2)",
      },
    },
    basicType: Excel.RangeValueType.error, // A readonly property. Used as a fallback in incompatible scenarios.
    basicValue: "#VALUE!", // A readonly property. Used as a fallback in incompatible scenarios.
  };
  try {
    const context = new Excel.RequestContext();
    const range = context.workbook.worksheets.getActiveWorksheet().getRange(address);
    range.valuesAsJson = [[myEntity]];
    await context.sync();
  } catch (error) {
    return error;
  }
}
