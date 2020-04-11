---
layout: post
title: Configure ESLint with Prettier to support Typescript
short: I'd been frustrated by these terms for a so long time! And I think you maybe also get confused. So yesterday, I'd spend more than five hours to understand them. Now I'll write the findings for you
tags:
  - ESLint
  - Prettier
  - Typescript
---

### Get them all clear!

I'd been frustrated by these terms for a so long time! And I think you maybe also get confused of it. So yesterday, I'd spend more than five hours to understand them. Now I'll write the findings for you.

### What are they all about?

#### 1. ESLint

ESLint is a tool for identifying and reporting on patterns found in ECMAScript/JavaScript code, with the goal of making code more consistent and avoiding bugs. In many ways, it is similar to JSLint and JSHint with a few exceptions:

- ESLint uses Espree for JavaScript parsing.
- ESLint uses an AST to evaluate patterns in code.
- ESLint is completely pluggable, every single rule is a plugin and you can add more at runtime.

#### 2. Prettier

Prettier is an opinionated code formatter with support for: JavaScript including ES2017 / JSX / Angular / Vue / Flow / TypeScript / CSS, Less, and SCSS / HTML / JSON / GraphQL / Markdown, including GFM and MDX / YAML.

It removes all original styling* and ensures that all outputted code conforms to a consistent style. (See this blog post)

Prettier takes your code and reprints it from scratch by taking the line length into account.


#### 3. EditorConfig

EditorConfig helps maintain consistent coding styles for multiple developers working on the same project across various editors and IDEs. The EditorConfig project consists of a file format for defining coding styles and a collection of text editor plugins that enable editors to read the file format and adhere to defined styles. EditorConfig files are easily readable and they work nicely with version control systems.

#### 4. VSCode

Visual Studio Code is a lightweight but powerful source code editor which runs on your desktop and is available for Windows, macOS and Linux. It comes with built-in support for JavaScript, TypeScript and Node.js and has a rich ecosystem of extensions for other languages (such as C++, C#, Java, Python, PHP, Go) and runtimes (such as .NET and Unity). 

#### 5. TypeScript

A script language extending JavaScript with Types. It's made by Microsoft and has a similar syntax to C#. TypeScript code need to be compiled by `tsc` as first, then emitting JavaScript code.

### Why do they come together?

You pick the popular language TypeScript to write our works. What's the IDE you like? Atom? Sublime? WebStorm? Visual Studio? Or just NotePad on PC? Today Many people, especially front-enders, like VsCode more.

If coding with NotePad, you won't enjoy it. Because there is no any suggestion and highlight. To instantiate a class, you need check if you get the symbol right or not. While calling a method on the instance, you need to know how to spell the `name` of it very correctly. For that sake, you have to check the documents time and time again. And no explaination to it popovers!

So choosing a appropriate IDE is very important.

VsCode please! Besides of the basic functions, millions of extensions in the market, and billions are on the air, which will make VsCode be the most great IDE in the world.

Do you know that VsCode and TypeScript are both created by a world-class company, Microsoft.  Yes, VsCode supports TypeScript naturally, and TypeScript braces VsCode so tightly.

So Why not VsCode?

Both ESLint and Prettier have extensions respectly for VsCode. Just installing them quickly. ESLint extension will help you hightlight the warnings and errors that not matching the rules it gives. With eslint cli (install by yarn or npm), you could fix them all.

```shell
> eslint . --fix
```

While Prettier gives a group of rules, with a very limited number, to format your code. You could configure it in settings of VsCode, or touch a rc file `.prettierrc.js` to override the rules. Also, Prettier has cli to run formating by command-line. The extension for Prettier will help you format code in GUI.

EditorConfig's rules are prior to that being from VsCode settings. You'd better let Prettier and EditorConfig be harmonious. For instance below.

in `.editorconfig`
```yaml
[*]
end_of_line = lf
tab_width = 2
indent_style = space
```

in `.prettierrc.js`
```js
{
  useTabs: true,
  tabWidth: 4,
  endOfLine: "lf"
}
```

Where `useTabs : true` means prettier prefers tabs to space. But look at the `.editorconfig`, it has `indent_style = space`. This is NOT harmonious! Fix it.

### Prettier can fix your code according to the rules of ESLint

You've known that Prettier just has less than 20 rules for you to format or prettify your dirty code. However ESLint has a big number of rules. How does Prettier use them to fix your code? For this, you need two packages first.

```shell
yarn add --dev eslint-config-prettier eslint-plugin-prettier
```

Where `eslint-config-prettier` is a config that disables rules that conflict with Prettier. And `eslint-plugin-prettier` is a plugin that adds a rule that formats content using Prettier.

And in `.eslintrc`

```json
{
  "extends": ["plugin:prettier/recommended"],
  "plugins": ["prettier", "@typescript-eslint"],
  "rules": {
    "prettier/prettier": "error"
  }
}
```

That `"prettier/prettier"` is a rule. If your code violates what Prettier ordered, VsCode will red it by ESLint extension.

Now you could use Prettier to format your code instead of WHAT VsCode provides.

### ESLint can lint TypeScript today

This may sound incredible for you! It's TRUE! In 2019. The team of TypeScript publish a package named `typescript-eslint`. Just reference to [The future of TypeScript on ESLint](https://eslint.org/blog/2019/01/future-typescript-eslint#top)

So let's install the required packages:

```shell
yarn add --dev @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

And in `.eslintrc` (it's additional)
```json
{
  "parser": "@typescript-eslint/parser",
  // eslint-config-prettier is a config that disables rules that conflict with Prettier. Add it to your
  "extends": [
    "plugin:@typescript-eslint/recommended",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended",
  ],
}
```

### Prettier vs. Linters

Linters have two categories of rules: 

**Formatting rules**: eg: `max-len, no-mixed-spaces-and-tabs, keyword-spacing, comma-style`…

Prettier alleviates the need for this whole category of rules! Prettier is going to reprint the entire program from scratch in a consistent way, so it's not possible for the programmer to make a mistake there anymore :)

**Code-quality rules**: eg `no-unused-vars, no-extra-bind, no-implicit-globals, prefer-promise-reject-errors`…

Prettier does nothing to help with those kind of rules. They are also the most important ones provided by linters as they are likely to catch real bugs with your code!

### Thanks & Links

Here is the repository on github:

[lint everything](https://github.com/zxh19890103/lint-everything)
