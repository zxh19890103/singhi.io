const fs = require('fs')
const path = require('path')

const argv = process.argv.slice(2)

// console.log(argv)

const inputs = argv.map(a => {
  let [key, value] = a.split('=')
  key = key.substr(2)
  if (value === undefined) return { [key]: true }
  else return { [key]: value.trim().replace(/\s/g, '-') }
}).reduce((p, n) => {
  return Object.assign(p, n)
}, {})

// console.log(inputs)

const template = `
---
layout: post
title: hello
short: hello
tags:
---
`

const filepath = path.resolve(__dirname, `../_posts/${inputs.at}-${inputs.t}.md`)

fs.writeFile(filepath, template, (err) => {
  console.log('done')
})

// node create --t=we are the world --at=2018 02 04
