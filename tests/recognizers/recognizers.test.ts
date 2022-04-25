/* global console */
import Recognizers from "@microsoft/recognizers-text-suite";

describe("Test Recognizers", () => {
  it("Find any number, twelve to 12", () => {
    let result = Recognizers.recognizeNumber("I have twelve apples and eleven peaches", Recognizers.Culture.English);
    // console.log(result);
    /**
      {      
        start: 7,
        end: 12,
        resolution: { value: '12' },
        text: 'twelve',
        typeName: 'number'
      }
     */
    expect(result[0].resolution.value).toEqual("12");
  });

  it("Find any ordinal number, twelfth to 12", () => {
    let result = Recognizers.recognizeOrdinal("twelfth", Recognizers.Culture.English);
    // console.log(result);
    expect(result[0].resolution.value).toEqual("12");
  });

  it("Find any number presented as percentage, twelve percents to 12%", () => {
    let result = Recognizers.recognizePercentage("twelve percents", Recognizers.Culture.English);
    // console.log(result);
    expect(result[0].resolution.value).toEqual("12%");
  });

  it("2 cm to 2 Centimeter", () => {
    let result = Recognizers.recognizeDimension("2 cm", Recognizers.Culture.English);
    console.log(result);
    // resolution: { value: '2', unit: 'Centimeter' }
    expect(result[0].resolution.value).toEqual("2");
  });
});
