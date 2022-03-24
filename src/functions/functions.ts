/* global clearInterval, console, CustomFunctions, setInterval */

/**
 * Adds two numbers.
 * @customfunction
 * @param first First number
 * @param second Second number
 * @returns The sum of the two numbers.
 */
export function add(first: number, second: number): number {
  return first + second;
}

/**
 * Displays the current time once a second.
 * @customfunction
 * @param invocation Custom function handler
 */
export function clock(invocation: CustomFunctions.StreamingInvocation<string>): void {
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
export function currentTime(): string {
  return new Date().toLocaleTimeString();
}

/**
 * Increments a value once a second.
 * @customfunction
 * @param incrementBy Amount to increment
 * @param invocation Custom function handler
 */
export function increment(incrementBy: number, invocation: CustomFunctions.StreamingInvocation<number>): void {
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
export function logMessage(message: string): string {
  console.log(message);
  return message;
}

import axios, { Method } from "axios";
/**
 * Gets the star count for a given org/user and repo. Try =GETSTARCOUNT("officedev","office-js")
 * @customfunction
 * @param userName Name of org or user.
 * @param repoName Name of the repo.
 * @return Number of stars.
 */
export async function getStarCount(userName = "OfficeDev", repoName = "office-js") {
  //You can change this URL to any web request you want to work with.
  let count = 0;
  const options = {
    url: `https://api.github.com/repos/${userName}/${repoName}`,
  };
  // console.log(options);
  await axios
    .request(options)
    .then(function (response) {
      console.log(response);
      count = response.data.watchers_count;
    })
    .catch(function (error) {
      console.log(error);
    });
  return count;
}

/**
 * Gets current weather data from Rapid API open-weather-map
 * @customfunction
 * @param city city name
 * @param country country name
 * @return weather
 */
export async function getWeather(city: string, country: string) {
  let method: Method = "GET";
  let temp = 0;
  var options = {
    method,
    url: "https://community-open-weather-map.p.rapidapi.com/weather",
    params: { q: `${city},${country}`, units: "metric" },
  };
  await axios
    .request(options)
    .then(function (response) {
      let data = response.data;
      console.log(data);
      temp = data.main.temp.toFixed(2);
    })
    .catch(function (error) {
      console.error(error);
    });
  return `${temp} celsius`;
}
