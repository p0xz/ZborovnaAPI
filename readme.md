# Zborovna API

This is an unofficial Zborovna API.

If you find bugs, have any questions or suggestions for features, please let me know and submit an issue.

## Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [API](#API)

## Requirements

- Node.js v14.0.0+
- Zborovna Account

## installation
```bash
npm i zborovna-api
```

## Usage

```javascript
const { Zborovna } = require("zborovna-api");

const zborovna = new Zborovna();

// This wil grant you access to all basic methods
zborovna.login("username", "password").then(user => {
    // ('user') is holding all methods for Documents and User

}).catch(error => {
    // Catch errors
});
```

## Examples

**Note:** If your node.js version support top level await you don't need to use self invoking arrow function

### Get first documents from document library

```javascript
const { Zborovna } = require("zborovna-api");

const zborovna = new Zborovna();

(async () => {
  await zborovna.login("username", "password");

  // This will return parsed documents
  const documents = await zborovna.basePage();

  console.log(documents);
})();
```

### Get local file by id

This will give you local file instead of downloading from server.

```javascript
const { Zborovna } = require("zborovna-api");

const zborovna = new Zborovna();

(async () => {
  await zborovna.login("username", "password");

  // Return an object with FileName & FileLocation & FileFormat
  const file = await zborovna.getLocalFile(id);

  console.log(file);
})();
```

### Get File from server

This will download file from server, but if file already exist it will just return an object.

```javascript
const { Zborovna } = require("zborovna-api");

const zborovna = new Zborovna();

(async () => {
  await zborovna.login("username", "password");

  // This will return an object with FileName & FileLocation & FileFormat
  // And also save your file to your file location
  const file = await zborovna.getServerFile(id);

  console.log(file);
})();
```

### Get documents by query

```javascript
const { Zborovna } = require("zborovna-api");

const zborovna = new Zborovna();

(async () => {
  await zborovna.login("username", "password");

  // This params are optional so you don't need to pass everything. 
  // Note: Search is value for searching document you want.
  const queryObject = { school, subject, year, post, filter, search, page };
  const documents = await zborovna.getDocumentsByQuery(queryObject);

  console.log(documents);
})();
```

# API

### Data

This object holds basic information about user and his cookies

```typescript
interface Data {
  user?: {
    cookies: CookieJar;
    credentials: credentials;
  };
}
```

### ParsedDocument

This object holds parsed data from server

```typescript
interface parsedHTMLDocument {
  documentID: number;
  documentName: string;
  documentThumbnail: string;
  documentSubject: string;
  documentClassYear: string;
  documentAddition: string;
  pageCount: number;
}
```

## queryObject
**Note**: I didn't make these key values it's based on original zborovna choose. Each value is specific and is used for representation.

These are possible value for each queryObject key.

### School

```javascript
schools = [
    1, // Základná škola
    2, // Stredná škola
    3, // Materská škola
    4, // Umelecká škola
    5, // Iné
    6, // Špeciálna škola
]
```
#### Example

```javascript
const school = 1; // Základná škola
const queryObject = { school, ...};
const documents = await zborovna.getDocumentsByQuery(queryObject);
```

### Subject

#### General subjects
```javascript
generalSubjects = {
    'r1'= 'Matematika',
    'r2'= 'Fyzika',
    'r3'= 'Slovenský jazyk a literatúra',
    'r4'= 'Geografia',
    'r5'= 'Hudobná výchova',
    'r7'= 'Biológia',
    'r8'= 'Dejepis',
    'r9'= 'Vlastiveda',
    'r10' = 'Informatická výchova',
    'r11' = 'Prírodoveda',
    'r12' = 'Etická výchova',
    'r13' = 'Náboženská výchova',
    'r14' = 'Pracovné vyučovanie',
    'r15' = 'Výtvarná výchova',
    'r16' = 'Telesná výchova',
    'r17' = 'Informatika',
    'r18' = 'Chémia',
    'r19' = 'Občianska náuka',
    'r20' = 'Svet práce',
    'r21' = 'Technika',
    'r22' = 'Výchova umením',
    'r23' = 'Anglický jazyk',
    'r24' = 'Nemecký jazyk',
    'r25' = 'Francúzsky jazyk',
    'r26' = 'Ruský jazyk',
    'r27' = 'Španielsky jazyk',
    'r28' = 'Triednictvo',
    'r29' = 'Všeobecné',
    'r30' = 'Špeciálna pedagogika',
    'r31' = 'Školský klub detí',
    'r32' = 'Maďarský jazyk a literatúra',
    'r34' = 'Obohatenie',
    'r35' = 'Dopravná výchova',
    'r36' = 'Taliansky jazyk',
    'r37' = 'Ekológia',
    'r38' = 'Prvouka',
    'r39' = 'Finančná Gramotnosť',
    'r40' = 'Rusínsky jazyk',
}
```
#### High school subjects
```javascript
// This subjects are for high school
subjects = {
    's1' = 'Ekonomické predmety',
    's2' = 'Technické predmety',
    's3' = 'Spoločenské predmety',
    's4' = 'Predmety z oblasti služieb',
    's5' = 'Umelecké predmety',
    's6' = 'Zdravotnícke predmety',
    's7' = 'Poľnohospodárske a potravinárske predmety',
    's8' = 'Prírodné predmety',
}
```

#### Example

```javascript
const subject = 'r10'; // Informatická výchova
const queryObject = { subject, ...};
const documents = await zborovna.getDocumentsByQuery(queryObject);
```


### Posts
```javascript
posts = {
    '1' = 'Dokument',
    '2' = 'Link',
    '3' = 'Galéria',
    '4' = 'Test',
}
```

#### Example
```javascript
const post = 'r10'; // Dokument
const queryObject = { post, ...};
const documents = await zborovna.getDocumentsByQuery(queryObject);
```


### Filter
```javascript
filters = {
    'listing_kvalitne' = 'Kvalitné', // Default value
    'listing_najnovsie' = 'Všetky',
    'listing_autorske' = 'Autorské',
    'listing_najlepsie' = 'Najlepšie',
    'listing_archiv' = 'Stiahnuté',
    'listing_friends' = 'Obľúbenci',
    'listing_metodicke' = 'Metodické',
}
```

#### Example
```javascript
const filter = 'listing_autorske'; // Autorské
const queryObject = { filter, ...};
const documents = await zborovna.getDocumentsByQuery(queryObject);
```
