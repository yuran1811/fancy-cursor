<h1 align="center">fancy-cursor</h1>
<p align="center">  
  <img src="https://raw.githubusercontent.com/catppuccin/catppuccin/main/assets/palette/macchiato.png" width="400" />
</p>

<p align="center">
  <img alt="Stars" src="https://badgen.net/github/stars/yuran1811/fancy-cursor">
  <img alt="Forks" src="https://badgen.net/github/forks/yuran1811/fancy-cursor">
  <img alt="Issues" src="https://badgen.net/github/issues/yuran1811/fancy-cursor">
  <img alt="Commits" src="https://badgen.net/github/commits/yuran1811/fancy-cursor">
</p>
<p align="center">
  <img alt="npm" src="https://img.shields.io/npm/v/fancy-cursor">
  <img alt="Code Size" src="https://img.shields.io/github/languages/code-size/yuran1811/fancy-cursor">
</p>

<div align="center"><a href="https://yuran1811.github.io/fancy-cursor/" target="_blank">Live Demo</a></div>

## Introduction

- A remake version of [legendary cursor](https://github.com/Domenicobrz/legendary-cursor) using `typescript` and lastest version of `three`.

## Tech Stack

<img src="https://skill-icons-livid.vercel.app/icons?i=threejs,ts,vite&gap=60" height="36" />

## Screenshots

<div style="display:flex;gap:12px;justify-content:center">
	<img src="./public/screenshots/normal.png" style="width:45%;max-width:380px">
	<img src="./public/screenshots/hold.png" style="width:45%;max-width:380px">
</div>

## Installation

### Using package manager

- Install the package

```bash
npm i fancy-cursor
# or
yarn add fancy-cursor
# or
pnpm add fancy-cursor
```

- Play with it

```js
import FancyCursor from 'fancy-cursor';

addEventListener('load', () => {
  console.log(
    new FancyCursor({
      opacityDecrement: 0.85,
      sparklesCount: 128,
    })
  );
});
```

### Using CDN

- Put the code below inside the `<head></head>` tag, after the styles and replace `<version>` with an actual version (like `0.1.6`)

```html
<script type="importmap">
  {
    "imports": {
      "fancy-cursor": "https://cdn.jsdelivr.net/npm/fancy-cursor@<version>/bundle/esm/index.js"
    }
  }
</script>
```

- Then we can play with it

```html
<script type="module">
  import FancyCursor from 'fancy-cursor';

  addEventListener('load', () => {
    console.log(
      new FancyCursor({
        opacityDecrement: 0.85,
        sparklesCount: 128,
      })
    );
  });
</script>
```

- Full example

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fancy Cursor</title>
    <script type="importmap">
      {
        "imports": {
          "fancy-cursor": "https://cdn.jsdelivr.net/npm/fancy-cursor@0.1.6/bundle/esm/index.js"
        }
      }
    </script>
  </head>
  <body>
    <script type="module">
      import FancyCursor from 'fancy-cursor';

      addEventListener('load', () => {
        console.log(
          new FancyCursor({
            opacityDecrement: 0.85,
            sparklesCount: 128,
          })
        );
      });
    </script>
  </body>
</html>
```

## Developing

Follow these steps to set up the project locally on your machine.

**Prerequisites**

Make sure you have the following installed or downloaded on your machine:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en)

**Cloning the Repository**

```bash
git clone https://github.com/yuran1811/fancy-cursor.git
cd fancy-cursor
```

**Installation**

- Enable `pnpm` to build and run the project

```bash
corepack enable pnpm
```

Install the project dependencies:

```bash
pnpm install
```

**Running the Project**

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the project.

## References

- [legendary cursor](https://github.com/Domenicobrz/legendary-cursor)
