
/*
Requires http://uncrustify.sourceforge.net/
 */

(function() {
  "use strict";
  var Beautifier, Uncrustify, cfg, expandHomeDir, path, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('../beautifier');

  cfg = require("./cfg");

  path = require("path");

  expandHomeDir = require('expand-home-dir');

  _ = require('lodash');

  module.exports = Uncrustify = (function(_super) {
    __extends(Uncrustify, _super);

    function Uncrustify() {
      return Uncrustify.__super__.constructor.apply(this, arguments);
    }

    Uncrustify.prototype.name = "Uncrustify";

    Uncrustify.prototype.link = "https://github.com/uncrustify/uncrustify";

    Uncrustify.prototype.options = {
      Apex: true,
      C: true,
      "C++": true,
      "C#": true,
      "Objective-C": true,
      D: true,
      Pawn: true,
      Vala: true,
      Java: true,
      Arduino: true
    };

    Uncrustify.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var basePath, configPath, editor, expandedConfigPath, projectPath;
        configPath = options.configPath;
        if (!configPath) {
          return cfg(options, function(error, cPath) {
            if (error) {
              throw error;
            }
            return resolve(cPath);
          });
        } else {
          editor = atom.workspace.getActiveTextEditor();
          if (editor != null) {
            basePath = path.dirname(editor.getPath());
            projectPath = atom.workspace.project.getPaths()[0];
            expandedConfigPath = expandHomeDir(configPath);
            configPath = path.resolve(projectPath, expandedConfigPath);
            return resolve(configPath);
          } else {
            return reject(new Error("No Uncrustify Config Path set! Please configure Uncrustify with Atom Beautify."));
          }
        }
      }).then((function(_this) {
        return function(configPath) {
          var lang, outputFile;
          lang = "C";
          switch (language) {
            case "Apex":
              lang = "Apex";
              break;
            case "C":
              lang = "C";
              break;
            case "C++":
              lang = "CPP";
              break;
            case "C#":
              lang = "CS";
              break;
            case "Objective-C":
            case "Objective-C++":
              lang = "OC+";
              break;
            case "D":
              lang = "D";
              break;
            case "Pawn":
              lang = "PAWN";
              break;
            case "Vala":
              lang = "VALA";
              break;
            case "Java":
              lang = "JAVA";
              break;
            case "Arduino":
              lang = "CPP";
          }
          return _this.run("uncrustify", ["-c", configPath, "-f", _this.tempFile("input", text), "-o", outputFile = _this.tempFile("output", text), "-l", lang], {
            help: {
              link: "http://sourceforge.net/projects/uncrustify/"
            }
          }).then(function() {
            return _this.readFile(outputFile);
          });
        };
      })(this));
    };

    return Uncrustify;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvdW5jcnVzdGlmeS9pbmRleC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBOztHQUFBO0FBQUE7QUFBQTtBQUFBLEVBR0EsWUFIQSxDQUFBO0FBQUEsTUFBQSxtREFBQTtJQUFBO21TQUFBOztBQUFBLEVBSUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBSmIsQ0FBQTs7QUFBQSxFQUtBLEdBQUEsR0FBTSxPQUFBLENBQVEsT0FBUixDQUxOLENBQUE7O0FBQUEsRUFNQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FOUCxDQUFBOztBQUFBLEVBT0EsYUFBQSxHQUFnQixPQUFBLENBQVEsaUJBQVIsQ0FQaEIsQ0FBQTs7QUFBQSxFQVFBLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUixDQVJKLENBQUE7O0FBQUEsRUFVQSxNQUFNLENBQUMsT0FBUCxHQUF1QjtBQUNyQixpQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEseUJBQUEsSUFBQSxHQUFNLFlBQU4sQ0FBQTs7QUFBQSx5QkFDQSxJQUFBLEdBQU0sMENBRE4sQ0FBQTs7QUFBQSx5QkFFQSxPQUFBLEdBQVM7QUFBQSxNQUNQLElBQUEsRUFBTSxJQURDO0FBQUEsTUFFUCxDQUFBLEVBQUcsSUFGSTtBQUFBLE1BR1AsS0FBQSxFQUFPLElBSEE7QUFBQSxNQUlQLElBQUEsRUFBTSxJQUpDO0FBQUEsTUFLUCxhQUFBLEVBQWUsSUFMUjtBQUFBLE1BTVAsQ0FBQSxFQUFHLElBTkk7QUFBQSxNQU9QLElBQUEsRUFBTSxJQVBDO0FBQUEsTUFRUCxJQUFBLEVBQU0sSUFSQztBQUFBLE1BU1AsSUFBQSxFQUFNLElBVEM7QUFBQSxNQVVQLE9BQUEsRUFBUyxJQVZG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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-beautify/src/beautifiers/uncrustify/index.coffee
