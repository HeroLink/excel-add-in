/* global clearInterval, console, CustomFunctions, setInterval, fetch */
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Adds two numbers.
 * @customfunction
 * @param first First number
 * @param second Second number
 * @returns The sum of the two numbers.
 */
function add(first: number, second: number): number {
  console.log("test");
  return first + second;
}

/**
 * Displays the current time once a second.
 * @customfunction
 * @param invocation Custom function handler
 */
function clock(invocation: CustomFunctions.StreamingInvocation<string>): void {
  console.log("clock time");
  const timer = setInterval(() => {
    const time = currentTime();
    invocation.setResult(time);
  }, 1000);

  invocation.onCanceled = () => {
    clearInterval(timer);
  };
}

/**
 * Returns the current time.
 * @returns String with the current time formatted for the current locale.
 */
function currentTime(): string {
  return new Date().toLocaleTimeString();
}

/**
 * Increments a value once a second.
 * @customfunction
 * @param incrementBy Amount to increment
 * @param invocation Custom function handler
 */
function increment(incrementBy: number, invocation: CustomFunctions.StreamingInvocation<number>): void {
  let result = 0;
  const timer = setInterval(() => {
    result += incrementBy;
    invocation.setResult(result);
  }, 1000);

  invocation.onCanceled = () => {
    clearInterval(timer);
  };
}

/**
 * Writes a message to console.log().
 * @customfunction LOG
 * @param message String to write.
 * @returns String to write.
 */
function logMessage(message: string): string {
  console.log(message);
  return message;
}

/**
 * Gets the star count for a given org/user and repo. Try =GETSTARCOUNT("officedev","office-js")
 * @customfunction
 * @param userName Name of org or user.
 * @param repoName Name of the repo.
 * @return Number of stars.
 */
async function getStarCount(userName = "OfficeDev", repoName = "office-js") {
  //You can change this URL to any web request you want to work with.
  try {
    const url = `https://api.github.com/repos/${userName}/${repoName}`;
    const response = await fetch(url);
    console.log(response);
    //Expect that status code is in 200-299 range
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const jsonResponse = await response.json();
    return jsonResponse.watchers_count;
  } catch (error) {
    return error;
  }
}

/**
 * Gets current weather data from Rapid API open-weather-map
 * @customfunction
 * @param city city name
 * @param country country name
 * @return weather
 */
async function getWeather(city: string, country: string) {
  // %2C means ','
  const url = `https://community-open-weather-map.p.rapidapi.com/weather?q=${city}%2C${country}&units=metric`;
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Host": "community-open-weather-map.p.rapidapi.com",
      "X-RapidAPI-Key": "c244641161msh21571594dc86e0fp1643dfjsnac8252d67444",
    },
  };
  let temp = 0;
  await fetch(url, options)
    .then((response) => response.json())
    .then((response) => {
      console.log(response);
      temp = response.main.temp.toFixed(2);
      console.log(temp);
    })
    .catch((error) => {
      console.error(error);
      return error;
    });
  return `${temp} Celsius`;
}
