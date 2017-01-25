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


module.exports = function (testScript, path) {
  return new Promise(function(resolve, reject) {

    var parse = testScript.split('\n');
    var scripts = [];
    var match, namespace;
    var end = 0;
    parse.forEach((value,key) => {
      if (value.includes('@require')) {
        scripts.push(value.split('@require')[1].trim());
      } else if (value.includes('@match')) {
        match = value.split('@match')[1].trim();
      } else if (value.includes('@namespace')) {
        namespace = value.split('@namespace')[1].trim();
      } else if (value.includes('// ==/UserScript==')) {
        end = key + 1;
      }
    })
    parse = parse.slice(end, parse.length)
    parse = parse.join('\n');

    getScripts(scripts)
      .then((externalScripts) => {
        mergeScripts(parse, externalScripts)
          .then((last) => {
            console.log(last);
            fs.writeFile(path, last, function (err) {
              if (err) {
                console.log(err);
                reject(err);
              }
              var res = {
                path,
                code: last,
                scripts,
                match,
                namespace
              }
              resolve(res);
            });
          })
      })

  });
}
