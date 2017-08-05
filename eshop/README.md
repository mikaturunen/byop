# EShop

The shop is built on top of React, Redux and TypeScript. Notice that it's few versions behind the latest and the hottest on purpose because there are numerous issues with react + redux types with the new TS version and the aim of this project is not to work on the typings but to actually setup a proper webshop that person ABC could use for making a webshop and selling their stuff.

Tightly integrates to Checkouts payment options. Future might hold something else too.

- [React & ReactDOM](http://facebook.github.io/react/) 15.4.2
- [Redux](https://github.com/rackt/redux) 3.6.0
- [TypeScript](http://www.typescriptlang.org/) 2.2.1

## Getting Started

Requirement:

- NodeJS 8+
- NPM 5+
- Yarn globally available (`npm install -g yarn`)

Install dependencies:

```
yarn install
```

## Development

Run webpack dev server (for assets):

```bash
$ npm run build
$ npm start
```

Visit [http://localhost:3000/](http://localhost:3003/).

## Running production server

```bash
npm run start:prod
```

Visit [http://localhost:3003/](http://localhost:3003/).

This will build the assets for you on the first run. For subsequent starts, you should run:

```bash
npm run build
```

### Testing

To run tests, use:

```
npm test
```
