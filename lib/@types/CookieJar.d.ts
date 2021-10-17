export namespace CookieJAR {
  interface setCookieOptions {
    domain?: string;
    path?: string;
    httpOnly?: boolean;
    SameSite?: string;
    Expires?: string | Date;
    "Max-age"?: number;
    Secure?: undefined;
  }

  interface Cookies {
    Cookie: {
      name: string;
      value: string;
      closingChar: string;
    };
    options: any;
  }
}
