import { URLSearchParams } from "url";
import { credentials } from "./User";
import { AuthError } from "./Errors";
import fetch from "node-fetch";
import CookieJar from "../lib/CookieJar";
import { log } from "../lib/log";
import CharCodesParser from "../lib/ParseCharCode";

interface requestedMessages {
  currentPage: number;
  pageCount: number;
  messageCount: number;
  data: Array<parsedMessage>;
}

interface parsedMessage {
  name: string;
  type: string;
  subject: string;
  hasAttachment: boolean;
  messageURL: string;
  receivedAt: string;
}

interface messageCtx {
  from: string;
  userBlockURL: string;
  blockSender: () => void;
  unblockSender: () => void;
  uid: string;
  id: number;
  subject: string;
  date: string;
  messages: string | Array<iMessages>;
}

interface iMessages {
  profileImageURL: string;
  message: Array<string>;
  _raw: string;
}

interface blockedUsers {
  userName: string;
  blockID: number;
  unblockUser: () => void;
}

class Messages {
  public cookies: CookieJar;
  public credentials: credentials;
  public blockedUsers: blockedUsers[] | [];

  constructor() {
    this.cookies = null;
    this.credentials = null;
    this.blockedUsers = [];
  }

  async getMessages(page = 0): Promise<requestedMessages> {
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

  async getContextOfMessage(message: parsedMessage): Promise<messageCtx> {
    const { messageURL } = message;
    const contextRegEx =
      /<div class="flex">.*?<div class="obrazok">.*?<img.*?src="(?<profileImage>.*?)".*?>.*?<\/div>.*?<div class="old_message_row">.*?<strong>.*?<\/strong>.*?<br \/>(?<message>.*?)<\/div>/gms;
    const response = await fetch(messageURL, {
      headers: {
        cookie: `${this.cookies.getCookie("PHPSESSID")}; ${this.cookies.getCookie("TestCookie")}`,
      },
    });
    const html = await response.text();
    // basic matches
    const [_, from, blockURL] = /<strong>Od:<\/strong><\/td><td>(.*?)<a href='(.*?)'/gm.exec(html);
    const date = /<td><strong>Dátum:<\/strong><\/td><td>(.*?)<\/td>/gm.exec(html)[1];
    const Subject = /<td><strong>Predmet:<\/strong><\/td><td>(.*?)<\/td>/gm.exec(html)[1];
    const singleMessage = /<\/table>(.*?)</gms.exec(html)[1];
    const uid = new URLSearchParams("https://www.zborovna.sk/novinky/" + blockURL).get("uid");
    const id = Number(new URLSearchParams(messageURL).get("id"));
    const messages = [...html.matchAll(contextRegEx)].map(ctx => {
      const profileImageURL = ctx.groups.profileImage.split(";").join("&");
      let message: string | any = ctx.groups.message;
      let _raw = message;
      for (const tag of message.match(/<.*?>/gm)) {
        message = message.replace(tag, "");
      }
      (message as string[]) = message
        .split("\n")
        .map(ms => (ms = ms.replace(/(\r\n|\n|\r|\t)/gm, "").trim()))
        .filter(ms => ms !== "");

      return {
        profileImageURL: "https://www.zborovna.sk" + profileImageURL,
        message: message,
        _raw,
      };
    });
    // console.log(from.substring(0, from.lastIndexOf(",")));

    return {
      from: from.substring(0, from.lastIndexOf(",")),
      userBlockURL: "https://www.zborovna.sk/novinky/" + blockURL,
      uid,
      id,
      blockSender: () => {
        fetch("https://www.zborovna.sk/novinky/" + blockURL, {
          headers: {
            cookie: `${this.cookies.getCookie("PHPSESSID")}; ${this.cookies.getCookie("TestCookie")}`,
          },
          method: "GET",
        }).then(async res => {
          const url = res.url;
          if (url.includes("login_form.php")) throw new AuthError("Invalid credentials or cookies!");
          log(`§33[ZborovnaAPI] §37User: ${from.substring(0, from.indexOf(","))} with uid: ${uid} was successfully blocked.`);
          await this.getBlockedUsers();
        });
      },
      unblockSender: () => {
        const user = this.blockedUsers.find((user: blockedUsers) => user?.userName === from.substring(0, from.indexOf(",")));
        if (!user) return log(`§33[ZborovnaAPI] §37User: ${from.substring(0, from.indexOf(","))} isn't blocked.`);

        fetch("https://www.zborovna.sk/novinky/messages.php", {
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            cookie: `${this.cookies.getCookie("PHPSESSID")}; ${this.cookies.getCookie("TestCookie")}`,
          },
          body: `id=${user.blockID}&action=delete_nastavenie&folder=5&filter=&sub_id=&sub_user_id=&strana=0`,
          method: "POST",
        }).then(res => {
          log(`§33[ZborovnaAPI] §37User: ${user.userName} was successfully unblocked!`);
        });
      },
      subject: Subject,
      date,
      messages: singleMessage?.trim() || messages,
    };
  }

  async getBlockedUsers(): Promise<void> {
    const response = await fetch("https://www.zborovna.sk/novinky/messages.php?folder=5", {
      headers: {
        cookie: `${this.cookies.getCookie("PHPSESSID")}; ${this.cookies.getCookie("TestCookie")}`,
      },
    });
    const html = await response.text();
    if (/V nastaveniach sa nenachádzajú žiadni blokovaní používatelia\./gm.test(html)) return;
    const blockedUsers = [...html.matchAll(/<td style="padding:4px" title="(.*?)"><strong>.*?<\/strong><\/td>.*?sprava(\d+)/gms)].map(
      user => {
        const [_, userName, id] = user;
        return {
          userName,
          blockID: Number(id),
          unblockUser: () => {
            fetch("https://www.zborovna.sk/novinky/messages.php", {
              headers: {
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                cookie: `${this.cookies.getCookie("PHPSESSID")}; ${this.cookies.getCookie("TestCookie")}`,
              },
              body: `id=${Number(id)}&action=delete_nastavenie&folder=5&filter=&sub_id=&sub_user_id=&strana=0`,
              method: "POST",
            }).then(res => {
              log(`§33[ZborovnaAPI] §37User: ${userName} was successfully unblocked!`);
            });
          },
        };
      }
    );

    this.blockedUsers = blockedUsers;
  }

  static baseURL(page = 0) {
    return `https://www.zborovna.sk/novinky/messages.php?action=listing&folder=1&strana=${page}`;
  }
}

export { Messages };
