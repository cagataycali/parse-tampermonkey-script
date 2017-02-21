var request = require('request');
var async = require('async');
var fs = require('fs');

function getScripts(urls) {
  return new Promise(function(resolve, reject) {
    var scripts = [];
     async.every(urls, function(url, callback) { // array
         request(url, function (err, response, body) {
           if (!err && response.statusCode == 200) {
             scripts.push(body);
             callback(null, !err)
           } else {
             callback(null, err)
           }
         })
     }, function(err, result) {
         if (err) {
           console.log(err);
           reject(err);
         } else {
           resolve(scripts);
         }
     });
  });
}

function mergeScripts(code, externalScripts) {
  return new Promise(function(resolve, reject) {
    var tmp = "// Merged scripts.";
    externalScripts.forEach((value, key) => {
      tmp += '\n'
      tmp += value;
    })
    tmp += code;
    resolve(tmp);
  });
}

module.exports = function (testScript) {
  return new Promise(function(resolve, reject) {

    var parse = testScript.split('\n');
    var scripts = [];
    var match, namespace, name;
    var end = 0;
    var result = {};
    parse.forEach((value,key) => {
      if (value.includes('@')) {
        value = value.split('// @').join('');
        var parsed = [];
        value.split(' ').forEach((pair, key) => {
          if (pair.length !== 0) {
            parsed.push(pair);
          }
        })
        // console.log(parsed);
        var name = parsed[0];
        if (name == 'require') {
          scripts.push(parsed[1]);
        }
        parsed = parsed.slice(1, parsed.length).join(' ')
        eval(`
          result.${name} = "${parsed}"
          `)
      } else {
        if (value.includes('// ==/UserScript==')) {
          end = key + 1;
        }
      }
    })
    parse = parse.slice(end, parse.length)
    parse = parse.join('\n');

    getScripts(scripts)
      .then((externalScripts) => {
        mergeScripts(parse, externalScripts)
          .then((last) => {
            result.code = last;
            result.require = scripts
            var res = result;
            resolve(res);
          })
          .catch((err) => {reject(err)})
      }).catch((err) => {reject(err)})
  })
}
