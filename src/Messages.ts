import { credentials } from "./User";
import fetch from "node-fetch";
import CookieJar from "../lib/CookieJar";
import { log } from "../lib/log";
import CharCodesParser from "../lib/ParseCharCode";

class Messages {
  public cookies: CookieJar;
  public credentials: credentials;

  constructor() {
    // this.cookies = cookies;
  }

  async getMessages(page = 0) {
    return new Promise((resolve, reject) => {
      fetch(Messages.baseURL(page), {
        headers: {
          cookie: `${this.cookies.getCookie("PHPSESSID")}; ${this.cookies.getCookie("TestCookie")}`,
        },
      })
        .then(res => res.text())
        .then(html => {
          const messagesRegEx =
            /<td class="typ"><span class=".*?">(?<senderType>.*?)<\/span><\/td>.*?<a href="(?<messageURL>.*?)" class="posta">(?<senderName>.*?)<\/a>.*?<a href=".*?" class="posta">(?<subject>.*?)<\/a>.*?src="(?<attachmentType>.*?)".*?<td style="width: 155px;">(?<Date>.*?)<\/td>/gims;
          const pageCount = Number([...html.matchAll(/<\/select>\sz\s(.*?)</gm)].map(e => e[1])[0]);
          // console.log(pageCount);

          const messages = [...html.matchAll(messagesRegEx)].map(msg => {
            let { senderType, messageURL, senderName, subject, attachmentType, Date } = msg.groups;
            messageURL = messageURL.split(";").join("&");

            return {
              name: CharCodesParser(senderName, false),
              type: senderType === "z" ? "Student" : "Teacher",
              subject: CharCodesParser(subject, false),
              hasAttachment: attachmentType.includes("cierny"),
              messageURL: "https://www.zborovna.sk/novinky/" + messageURL,
              receivedAt: Date,
            };
          });

          resolve({
            currentPage: page,
            pageCount,
            messageCount: messages.length,
            data: messages,
          });
        })
        .catch(err => reject(err));
    });
  }

  static baseURL(page = 0) {
    return `https://www.zborovna.sk/novinky/messages.php?action=listing&folder=1&strana=${page}`;
  }
}

export { Messages };
