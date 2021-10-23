import { CookieJAR } from "./@types/CookieJar";

class Cookie {
  constructor() {}

  static parse(cookie: string) {
    return cookie.split(" ").reduce((prev, curr, index): any => {
      let [name, value] = curr.split("=");
      let closingChar = "";
      name = name.trim();

      if (index === 0) {
        if (value && value.indexOf(";") !== -1) {
          closingChar = "; ";
          value = value.slice(0, value.indexOf(";"));
        } else closingChar = "";

        prev["Cookie"] = {
          name,
          value,
          closingChar,
        };
        return prev;
      }
      if (value && value.indexOf(";") !== -1) {
        value = value.slice(0, value.indexOf(";"));
        closingChar = "; ";
      }

      prev["options"] = {
        ...prev["options"],
        [name]: {
          value,
          closingChar,
        },
      };

      return prev;
    }, {});
  }
  static toString(cookie: CookieJAR.Cookies) {
    let cookieString = "";
    const { Cookie, options } = cookie;
    cookieString += `${Cookie.name}=${Cookie.value}${Cookie.closingChar}`;
    for (const [name, attrs] of Object.entries(options)) {
      const { value, closingChar } = attrs as any;
      if (!value) {
        cookieString += `${name}${closingChar}`;
        continue;
      }
      cookieString += `${name}=${value}${closingChar}`;
    }
    return cookieString;
  }
}

class CookieJar {
  private cookies: CookieJAR.Cookies[];

  constructor() {
    this.cookies = [];
  }

  public setCookie(cookieName: string, value = undefined, options: CookieJAR.setCookieOptions = {}) {
    cookieName = cookieName.trim();
    this.cookies.push({
      Cookie: {
        name: cookieName,
        value: value,
        closingChar: "; ",
      },
      options,
    });
  }

  public setCookies(cookies: Array<string>): void {
    const Cookies = cookies.map(cookie => Cookie.parse(cookie));

    this.cookies.push(...Cookies);

    return;
  }

  public getCookies(formatted: boolean = true) {
    if (!formatted) return this.cookies;
    const formattedCookies = this.cookies.map(cookie => Cookie.toString(cookie));
    return formattedCookies;
  }

  public getCookie(name: string, formatted: boolean = true) {
    let cookie = this.cookies.find(cookie => cookie.Cookie.name === name);
    if (!cookie) return {};
    return Cookie.toString(cookie);
  }

  public clearCookies(): void {
    this.cookies = [];
  }
}

export default CookieJar;
