var parse = require('./index');

parse(test, "hello2.js")
  .then((output) => {
    console.log(output);
  })
