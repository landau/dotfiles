
/*
Requires https://github.com/hhatto/autopep8
 */

(function() {
  "use strict";
  var Beautifier, ErlTidy,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  module.exports = ErlTidy = (function(_super) {
    __extends(ErlTidy, _super);

    function ErlTidy() {
      return ErlTidy.__super__.constructor.apply(this, arguments);
    }

    ErlTidy.prototype.name = "erl_tidy";

    ErlTidy.prototype.link = "http://erlang.org/doc/man/erl_tidy.html";

    ErlTidy.prototype.options = {
      Erlang: true
    };

    ErlTidy.prototype.beautify = function(text, language, options) {
      var tempFile;
      tempFile = void 0;
      return this.tempFile("input", text).then((function(_this) {
        return function(path) {
          tempFile = path;
          return _this.run("erl", [["-eval", 'erl_tidy:file("' + tempFile + '")'], ["-noshell", "-s", "init", "stop"]], {
            help: {
              link: "http://erlang.org/doc/man/erl_tidy.html"
            }
          });
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.readFile(tempFile);
        };
      })(this));
    };

    return ErlTidy;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvZXJsX3RpZHkuY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7R0FBQTtBQUFBO0FBQUE7QUFBQSxFQUlBLFlBSkEsQ0FBQTtBQUFBLE1BQUEsbUJBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUixDQUxiLENBQUE7O0FBQUEsRUFPQSxNQUFNLENBQUMsT0FBUCxHQUF1QjtBQUVyQiw4QkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsc0JBQUEsSUFBQSxHQUFNLFVBQU4sQ0FBQTs7QUFBQSxzQkFDQSxJQUFBLEdBQU0seUNBRE4sQ0FBQTs7QUFBQSxzQkFHQSxPQUFBLEdBQVM7QUFBQSxNQUNQLE1BQUEsRUFBUSxJQUREO0tBSFQsQ0FBQTs7QUFBQSxzQkFPQSxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQixHQUFBO0FBQ1IsVUFBQSxRQUFBO0FBQUEsTUFBQSxRQUFBLEdBQVcsTUFBWCxDQUFBO2FBQ0EsSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLENBQXdCLENBQUMsSUFBekIsQ0FBOEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsSUFBRCxHQUFBO0FBQzVCLFVBQUEsUUFBQSxHQUFXLElBQVgsQ0FBQTtpQkFDQSxLQUFDLENBQUEsR0FBRCxDQUFLLEtBQUwsRUFBWSxDQUNWLENBQUMsT0FBRCxFQUFVLGlCQUFBLEdBQW9CLFFBQXBCLEdBQStCLElBQXpDLENBRFUsRUFFVixDQUFDLFVBQUQsRUFBYSxJQUFiLEVBQW1CLE1BQW5CLEVBQTJCLE1BQTNCLENBRlUsQ0FBWixFQUlFO0FBQUEsWUFBRSxJQUFBLEVBQU07QUFBQSxjQUFFLElBQUEsRUFBTSx5Q0FBUjthQUFSO1dBSkYsRUFGNEI7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5QixDQVFDLENBQUMsSUFSRixDQVFPLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQ0wsS0FBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWLEVBREs7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVJQLEVBRlE7SUFBQSxDQVBWLENBQUE7O21CQUFBOztLQUZxQyxXQVB2QyxDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-beautify/src/beautifiers/erl_tidy.coffee
