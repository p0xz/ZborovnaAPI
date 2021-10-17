import fs from "fs";
import path from "path";
import { URLSearchParams } from "url";
import { log } from "../lib/log";

export interface parsedHTMLDocument {
  documentID: number;
  documentName: string;
  documentThumbnail: string;
  documentSubject: string;
  documentClassYear: string;
  documentAddition: string;
  pageCount: number;
}

class Document {
  public location: string;
  private static fileFormats: {
    [key: string]: string;
  } = {
    ".doc": "application/msword",
    ".dot": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".dotx": "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
    ".docm": "application/vnd.ms-word.document.macroEnabled.12",
    ".dotm": "application/vnd.ms-word.template.macroEnabled.12",
    ".xls": "application/vnd.ms-excel",
    ".xlt": "application/vnd.ms-excel",
    ".xla": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xltx": "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
    ".xlsm": "application/vnd.ms-excel.sheet.macroEnabled.12",
    ".xltm": "application/vnd.ms-excel.template.macroEnabled.12",
    ".xlam": "application/vnd.ms-excel.addin.macroEnabled.12",
    ".xlsb": "application/vnd.ms-excel.sheet.binary.macroEnabled.12",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pot": "application/vnd.ms-powerpoint",
    ".pps": "application/vnd.ms-powerpoint",
    ".ppa": "application/vnd.ms-powerpoint",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".potx": "application/vnd.openxmlformats-officedocument.presentationml.template",
    ".ppsx": "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
    ".ppam": "application/vnd.ms-powerpoint.addin.macroEnabled.12",
    ".pptm": "application/vnd.ms-powerpoint.presentation.macroEnabled.12",
    ".potm": "application/vnd.ms-powerpoint.template.macroEnabled.12",
    ".ppsm": "application/vnd.ms-powerpoint.slideshow.macroEnabled.12",
    ".mdb": "application/vnd.ms-access",
    ".pdf": "application/pdf",
  };

  constructor() {
    this.location = "";
  }

  public setLocation(Path: string): void {
    this.location = Path;
    Document.createFolder(Path);
  }

  public getFiles() {
    return fs.readdirSync(this.location);
  }

  public getFileByID(id: number) {
    return this.getFiles().find(file => file.startsWith(String(id)));
  }

  // UTILS
  static createFolder(Path: string): void {
    if (!fs.existsSync(Path)) fs.mkdirSync(Path);
  }

  static getFileFormat(fileName: string) {
    const format = fileName.substring(fileName.indexOf("."), fileName.length);
    return this.fileFormats[format];
  }

  // Fetch UTIL
  static getURLByID(id: number) {
    return `https://www.zborovna.sk/kniznica.php?action=show_version&id=${id}`;
  }

  static getDownloadURLByID(id: number) {
    return `https://www.zborovna.sk/kniznica.php?action=download&id=${id}&save=1`;
  }

  static searchURL({ school = "", subject = "", year = "", post = "", filter = "", search = "", page = 0 }) {
    return `https://www.zborovna.sk/naj.php?vlib_school_type_id=${school}&vlib_subject_id=${subject}&vlib_grade_id=${year}&vlib_prispevok_id=${post}&action=${filter}&search=${search}&strana=${page}`;
  }

  static parseDocumentHTML(html: string) {
    const pageNavigation = html.match(/<div class="navigbar">.*?<\/div>/gims)[0];
    const pageCount = Math.max(...(pageNavigation.match(/\d+(?=\D*$)/gm) as any));
    const DocumentRegex =
      /<table.*?cellspacing="4".*?cellpadding="0".*?border="0".*?width="95%">.*?<a.*?href="(.*?)".*?class="nove">(.*?)<\/a>.*?<img src="(.*?)".*?>.*?<strong>.*?Predmet:.*?<\/strong>(.*?)<.*?<strong>.*?<\/strong>(.*?)<.*?Pridaný:(.*?)<.*?<\/table>/gims;
    log(`§33[Document] §37Parsing HTML...`);
    const documents: parsedHTMLDocument[] = [...html.matchAll(DocumentRegex)].map(document => {
      const documentID = new URLSearchParams(document.at(1).replace(";", "&")).get("id");
      const documentThumbnail = ("https://www.zborovna.sk" + document.at(3)).split(";").join("&");

      return {
        documentID: Number(documentID),
        documentName: document.at(2),
        documentThumbnail: documentThumbnail,
        documentSubject: document.at(4),
        documentClassYear: document.at(5).trim(),
        documentAddition: document.at(6).trim(),
        pageCount,
      };
    });
    log(`§33[Document] §37HTML parsed.`);
    return documents;
  }
}

export { Document };
