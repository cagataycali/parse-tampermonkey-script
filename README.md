# Usage

var parse = require('parse-tampermonkey-script');

var test = `
Your awesome js code.
`

parse(test, "hello2.js")
  .then((output) => {
    console.log(output);
  })
