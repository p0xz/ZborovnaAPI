import charCodes from "./charCodes";
import { log } from "./log";

function CharCodesParser(str: string, logs = true) {
  const includedChars = [];
  logs && log(`§33[CharCodeParser] Searching for an occurrences..`);
  Object.entries(charCodes).forEach(([key, val]) => {
    if (str.includes(val)) {
      let matchLength = str.match(new RegExp(val, "gmi")).length;
      while (matchLength--) includedChars.push([key, val]);
    }
  });

  if (includedChars.length === 0) {
    logs && log(`§33[CharCodeParser] No occurrences founded returning plain string.`);
    return str;
  }

  for (const codes of includedChars) {
    const [char, charCode] = codes;
    str = str.replace(charCode, char);
  }
  logs && log(`§33[CharCodeParser] String was parsed -> ${str}`);
  return str;
}

export default CharCodesParser;
