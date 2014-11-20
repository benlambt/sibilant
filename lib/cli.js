var sibilant = require("./sibilant"),
    path = require("path"),
    options = require("../lib/options"),
    fs = require("fs"),
    mod = require("module");
var runInSandbox = (function(js, inputPath) {
  if (arguments.length < 2)
    var inputPath = undefined;
  
  (function() {
    if ((typeof inputPath === 'undefined')) {
      return inputPath = ".";
    }
  })();
  (require.main)["moduleCache"] = {  };
  (require.main)["filename"] = fs.realpathSync(inputPath);
  (require.main)["paths"] = mod._nodeModulePaths(path.dirname(fs.realpathSync(inputPath)));
  return require.main._compile(js, require.main.filename);
});

var cli = {
  v: "version",
  h: "help",
  unhandled: "help",
  f: "file",
  o: "output",
  x: "execute",
  e: "eval",
  i: "input",
  w: "wrap",
  afterBreak: false,
  execute: false,
  unlabeled: "file"
};
cli.version = (function() {
  return console.log(sibilant.versionString());
});

cli.repl = (function(args) {
  return require("../lib/repl");
});

var readStdin = (function(fn) {
  var stdin = process.stdin,
      data = "";
  stdin.resume();
  stdin.setEncoding("utf8");
  stdin.on("data", (function(chunk) {
    return data = (data + chunk);
  }));
  return stdin.on("end", (function() {
    return fn(data);
  }));
});

cli.eval = (function(args, options) {
  (options)["execute"] = true;
  return cli.input(args, options);
});

cli.input = (function(args, options) {
  var process = (function(sibilantCode) {
    var jsCode = sibilant.translateAll(sibilantCode);
    return (function() {
      if (options.execute) {
        return runInSandbox(jsCode);
      } else {
        return console.log(jsCode);
      }
    })();
  });
  ;
  return (function() {
    if (((args).length === 0)) {
      return readStdin(process);
    } else {
      return process((args)[0]);
    }
  })();
});

cli.help = (function(args, options) {
  return fs.readFile((__dirname + "/../cli-help"), { encoding: "utf8" }, (function(err, data) {
    (function() {
      if (err) {
        throw new Error (err);
      }
    })();
    return console.log(data);
  }));
});

var wrap__QUERY = false;
cli.wrap = (function(args, options) {
  return wrap__QUERY = true;
});

var cliOptions = options(cli),
    args = (cliOptions.afterBreak || [  ]);
args.unshift((process.argv)[1], "FILENAME");

(process)["argv"] = args;
(process)["ARGV"] = args;
(function() {
  if (((Object.keys(cliOptions)).length === 0)) {
    return cli.repl();
  }
})()
var outputDir = (function() {
  if (cliOptions.output) {
    return (cliOptions.output)[0];
  }
})();
(cliOptions.file || [  ]).forEach((function(inputFile) {
  var inputPath = path.join(process.cwd(), inputFile),
      inputExtname = path.extname(inputPath),
      translated = (function() {
    if ((".son" === inputExtname)) {
      return sibilant.translateJson(inputPath);
    } else {
      return sibilant.translateFile(inputPath);
    }
  })();
  (function() {
    if (wrap__QUERY) {
      return translated = ("(function(){\n" + translated + "}())\n");
    }
  })();
  return (function() {
    if (outputDir) {
      var outputExtname = (function() {
        if ((".son" === inputExtname)) {
          return ".json";
        } else {
          return ".js";
        }
      })(),
          inputBasename = path.basename(inputPath, inputExtname),
          outputPath = (path.join(outputDir, inputBasename) + outputExtname);
      return fs.writeFile(outputPath, translated);
    } else {
      return (function() {
        if (cliOptions.execute) {
          return runInSandbox(translated, inputPath);
        } else {
          return console.log(translated);
        }
      })();
    }
  })();
}))
