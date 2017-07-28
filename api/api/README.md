# Requirements

* Node.js >= 8.0.0
* NPM >= 5.0.0
* Yarn globally available (`npm install yarn -g`)

# Building

```bash
$ yarn install
$ npm run compile
$ npm run copy-static # NOTE this uses cp for copying files, might fail on some platforms - just manually copy them if you're using such platform..
```

# Running

## Development

```bash
$ yarn install
$ npm run dev
```

Open your favorite editor into the `/src` directory and edit away, the compilation process will compile all resources as changes are made.

## Production
