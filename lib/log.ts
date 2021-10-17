const color = (num = 0) => `\x1b[${num}m`;

/**
 * Colors references:
 * @example
 *  Reset = 0
    Bright = 1
    Dim = 2
    Underscore = 4
    Blink = 5
    Reverse = 7
    Hidden = 8

    FgBlack = 30
    FgRed = 31
    FgGreen = 32
    FgYellow = 33
    FgBlue = 34
    FgMagenta = 35
    FgCyan = 36
    FgWhite = 37

    BgBlack = 40
    BgRed = 41
    BgGreen = 42
    BgYellow = 43
    BgBlue = 44
    BgMagenta = 45
    BgCyan = 46
    BgWhite = 47
 */
function log(value: any | string, ...optionalParams: any) {
  if (typeof value !== "string") return console.log(value);
  if (Array.isArray(optionalParams) && optionalParams.length === 0) optionalParams = "";
  let message: string[] | string = [];
  for (const [_raw, colorCode] of value.matchAll(/§(\d{0,2})|([^\s]+.)/gim)) {
    if (colorCode) message.push(color(+colorCode));
    else message.push(_raw, color(0));
  }
  message = message.join("");

  console.log(message, optionalParams);
}

export { log };
