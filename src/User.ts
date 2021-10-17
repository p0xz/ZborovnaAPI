import { Data } from "./Zborovna";
import fetch from "node-fetch";
import CookieJar from "../lib/CookieJar";
import { log } from "../lib/log";
import { AuthError } from "./Errors";

export interface credentials {
  username?: string;
  password?: string;
}

class User {
  private credentials: credentials;
  private cookies: CookieJar;
  public data: Data;
  // PAGES
  private initPage = "https://www.zborovna.sk/novinky/index.php";
  private loginPage = "https://www.zborovna.sk/login.php";

  constructor(data = {}) {
    this.credentials = {};
    this.cookies = new CookieJar();
  }

  async initCookies() {
    log(`§33[ZborovnaAPI] §37Fetching index cookies.`);
    const response = await fetch(this.initPage, {
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "cache-control": "no-cache",
      },
      method: "GET",
    });
    log(`§33[ZborovnaAPI] §37Saving cookies.`);
    this.cookies.setCookies(response.headers.raw()["set-cookie"]);
  }

  async login(username: string, password: string): Promise<User | {}> {
    if (!username || !password) throw new AuthError("Invalid credentials!");
    await this.initCookies();

    log(`§33[ZborovnaAPI] §37Attempting to login...`);
    const response = await fetch(this.loginPage, {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Cookie: `${this.cookies.getCookie("PHPSESSID")}; ${this.cookies.getCookie("TestCookie")}`,
      },
      method: "POST",
      body: `login=${username}&password=${password}&redir=bm92aW5reS9pbmRleC5waHA%3D&jjs=1`,
    });

    const error = (errorName: string) => (response.url as string).match(errorName);

    if (error("error") || error("login_form")) {
      log(`§33[ZborovnaAPI] §37There was an error while attempting to login.`);
      const errorType = error("error")?.input.match(/\?.*/gim)[0] || "";

      if (errorType.match("cook")) throw new AuthError("Invalid Cookies or badly formatted!");
      if (errorType.match("js")) throw new AuthError("Javascript is blocked, please check your request body!");
      if (error("login_form")) throw new AuthError("username or password is invalid!");

      return {};
    }
    log(`§33[ZborovnaAPI] §37Login was successful!`);
    this.credentials = { username, password };

    this.data = {
      ...this.data,
      user: {
        cookies: this.cookies,
        credentials: this.credentials,
      },
    };

    return this;
  }

  /**
   * TODO: add support for sending message, receiving message
   */
}

export { User };
