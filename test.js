var parse = require('./index');

var test = `
// ==UserScript==
// @name         New Userscript
// @namespace    http://google.com
// @version      1.0.0
// @description  try to take over the world!
// @author       You
// @match        https://www.google.com.tr
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
     console.log(1);
    // Your code here...
})();
`;

parse(test)
  .then((output) => {
    console.log(output);
  })
