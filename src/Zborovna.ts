import { credentials } from "./User";
import fetch from "node-fetch";
import CookieJar from "../lib/CookieJar";
import { Document, User } from "../index";
import { parsedHTMLDocument } from "./Documents";
import { log } from "../lib/log";
import fs from "fs/promises";

export interface Data {
  user?: {
    cookies: CookieJar;
    credentials: credentials;
  };
}

class Zborovna {
  public document: Document;
  public data: Data;

  constructor() {
    this.document = null;
  }

  async basePage() {
    const response = await fetch("https://www.zborovna.sk/naj.php", {
      headers: {
        cookie: `${this.data.user.cookies.getCookie("PHPSESSID")}; ${this.data.user.cookies.getCookie("TestCookie")}`,
      },
    });
    return Document.parseDocumentHTML(await response.text());
  }

  async login(username: string, password: string): Promise<Zborovna> {
    const user = new User();
    this.document = new Document();
    return new Promise((resolve, reject) => {
      user
        .login(username, password)
        .then(res => {
          // @ts-ignore
          this.data = res.data;
          resolve(this);
        })
        .catch(error => reject(error));
    });
  }

  public getLocalFile(id: number) {
    const File = this.document.getFileByID(id);
    return {
      FileName: File,
      FileLocation: this.document.location + File,
      FileFormat: Document.getFileFormat(File),
    };
  }

  async getServerFile(id: number) {
    if (!!this.document.getFileByID(id)) {
      log(`§33[ZborovnaAPI] §37File with id: ${id} already exist, sending data.`);
      return {
        FileName: this.document.getFileByID(id),
        FileLocation: this.document.location + this.document.getFileByID(id),
        FileFormat: Document.getFileFormat(this.document.getFileByID(id)),
      };
    }

    const page = Document.getDownloadURLByID(id);

    const response = await fetch(page, {
      headers: {
        cookie: `${this.data.user.cookies.getCookie("PHPSESSID")}; ${this.data.user.cookies.getCookie("TestCookie")}`,
      },
    });
    log(`§33[ZborovnaAPI] §37Requesting file with id: ${id}...`);

    let FileName = decodeURIComponent(
      escape(response.headers.raw()["content-disposition"][0].substring(22, response.headers.raw()["content-disposition"][0].length - 1))
    );
    if (FileName.includes(".test")) FileName = FileName.replace(".test", ".pdf");

    const ContentType: string = await response.headers.raw()["content-type"][0];
    const buffer: Buffer = await response.buffer();

    log(`§33[ZborovnaAPI] §37Writing file...`);
    await fs
      .writeFile(this.document.location + `${id}_${FileName}`, buffer, {
        encoding: "binary",
      })
      .then(() => {
        log(`§33[ZborovnaAPI] §37File was successfully writed!`);
      })
      .catch(err => {
        log(`§33[ZborovnaAPI] §37There was an error while writing file: `, err);
      });

    return {
      FileName,
      FileLocation: this.document.location + `${id}_${FileName}`,
      FileFormat: ContentType,
    };
  }

  async getDocumentsByQuery({ school, subject, year, post, filter, search, page = 0 }): Promise<parsedHTMLDocument[]> {
    const URL = Document.searchURL({ school, subject, year, post, filter, search, page });

    return new Promise((resolve, reject) => {
      fetch(URL, {
        headers: {
          cookie: `${this.data.user.cookies.getCookie("PHPSESSID")}; ${this.data.user.cookies.getCookie("TestCookie")}`,
        },
      })
        .then((res: any) => res.text())
        .then((html: string) => resolve(Document.parseDocumentHTML(html)))
        .catch((err: any) => reject(err));
    });
  }
}

export { Zborovna };
