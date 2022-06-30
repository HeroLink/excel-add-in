# Excel Add-in

## Deploy

1. Clone the repo `git clone git@github.com:HeroLink/excel-add-in.git`.
2. Run `npm install`.
3. For development, run a `webpack serve`, use `npm run dev-server`.
    * It may take one minute to start the dev-server.
4. For build, run `npm run build`.
5. After running `webpack serve`, type `npm run start:desktop` to start an Excel.
    * The add-in is loaded by a task pane.
    * Click `Show Taskpane` on the Ribbon, a pane will be opened.
    * Click `Run` to dynamically register custom functions.
    * Type the following in cells:
        * `=XLP.GETWEATHER("Beijing", "China")`: Get the weather of Beijing in China. The API is provided by Rapid API.
        * `=XLP.GETSTARCOUNT("officedev","office-js")`: Get the start count of  the [office-js repo](https://github.com/OfficeDev/office-js).
        * `=XLP.CLOCK()`:  Display the current time once a second.
        * `=XLP.ADD(A1, A2)`: Add two numbers.
        * `=XLP.LOG("Message")`: Write a message to console.log().
        * `=XLP.INCREMENT(value)`: Increment a value once a second.

## Dynamically Register Custom Functions

Most code is in `src/utils/*`. The code is from the [script-lab repo](https://github.com/OfficeDev/script-lab).

Key code in `src\taskpane\taskpane.ts`:

```tsx
      await fetch("https://localhost:3000/tests/custom-functions/functions.ts")
        .then((res) => {
          console.log("Fetch function.ts", res);
          return res.text();
        })
        .then((data) => {
          // console.log("Read functions.ts", data);
          dynamicRegisterCF(data);
        });
```

`dynamicRegisterCF()` in `src\utils\custom-functions\register.ts`:

```tsx
export async function dynamicRegisterCF(fileContent: string) {
  // const engineStatus = await getCustomFunctionEngineStatusSafe();
  // parse custom functions file
  const { parseResults, code } = await getRegistrationResult(fileContent);
  console.log("Parsed results", parseResults);
  // console.log("Codes in file", code);
  if (parseResults.length > 0) {
    // do registration
    await registerCustomFunctions(parseResults, code);
    console.log("Register custom functions successfully!");
  }
  // add iframe runner
  tryCatch(async () => {
    const CustomFunctionsDictionary = {};
    (window as any).CustomFunctionsDictionary = CustomFunctionsDictionary;
    const typescriptMetadata = await getMetadata(fileContent);
    console.log("Get typescriptMetadata", typescriptMetadata);
    await addIframe(typescriptMetadata);
    console.log("CustomFunctionsDictionary", CustomFunctionsDictionary);
    // associate functions' id and name
    for (const key in CustomFunctionsDictionary) {
      CustomFunctions.associate(key, CustomFunctionsDictionary[key]);
      console.log("key", key);
      console.log("CustomFunctionsDictionary", CustomFunctionsDictionary[key]);
    }
  });
}
```

# Reference

1. [JavaScript API](https://docs.microsoft.com/en-us/javascript/api/excel?view=excel-js-1.14)
2. [Custom functions](https://docs.microsoft.com/en-us/office/dev/add-ins/excel/custom-functions-overview)
3. [Data types (preview)](https://docs.microsoft.com/en-us/office/dev/add-ins/excel/excel-data-types-overview)
4. [Top 50 Rapid API](https://rapidapi.com/blog/most-popular-api/)
    * [Open Weather Map](https://rapidapi.com/community/api/open-weather-map)
5. [jest](https://jestjs.io/docs/getting-started)
6. [excel-win32-16.01.js](https://appsforoffice.microsoft.com/lib/beta/hosted/excel-win32-16.01.js)
7. [webpack](https://webpack.js.org/configuration)

