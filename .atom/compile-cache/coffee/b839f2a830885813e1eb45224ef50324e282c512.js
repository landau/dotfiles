
/*
Requires [puppet-link](http://puppet-lint.com/)
 */

(function() {
  "use strict";
  var Beautifier, PuppetFix,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = PuppetFix = (function(superClass) {
    extend(PuppetFix, superClass);

    function PuppetFix() {
      return PuppetFix.__super__.constructor.apply(this, arguments);
    }

    PuppetFix.prototype.name = "puppet-lint";

    PuppetFix.prototype.link = "http://puppet-lint.com/";

    PuppetFix.prototype.isPreInstalled = false;

    PuppetFix.prototype.options = {
      Puppet: true
    };

    PuppetFix.prototype.cli = function(options) {
      if (options.puppet_path == null) {
        return new Error("'puppet-lint' path is not set!" + " Please set this in the Atom Beautify package settings.");
      } else {
        return options.puppet_path;
      }
    };

    PuppetFix.prototype.beautify = function(text, language, options) {
      var tempFile;
      return this.run("puppet-lint", ['--fix', tempFile = this.tempFile("input", text)], {
        ignoreReturnCode: true,
        help: {
          link: "http://puppet-lint.com/"
        }
      }).then((function(_this) {
        return function() {
          return _this.readFile(tempFile);
        };
      })(this));
    };

    return PuppetFix;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvcHVwcGV0LWZpeC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFHQTtBQUhBLE1BQUEscUJBQUE7SUFBQTs7O0VBSUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3dCQUVyQixJQUFBLEdBQU07O3dCQUNOLElBQUEsR0FBTTs7d0JBQ04sY0FBQSxHQUFnQjs7d0JBRWhCLE9BQUEsR0FBUztNQUNQLE1BQUEsRUFBUSxJQUREOzs7d0JBSVQsR0FBQSxHQUFLLFNBQUMsT0FBRDtNQUNILElBQU8sMkJBQVA7QUFDRSxlQUFXLElBQUEsS0FBQSxDQUFNLGdDQUFBLEdBQ2YseURBRFMsRUFEYjtPQUFBLE1BQUE7QUFJRSxlQUFPLE9BQU8sQ0FBQyxZQUpqQjs7SUFERzs7d0JBT0wsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixVQUFBO2FBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxhQUFMLEVBQW9CLENBQ2xCLE9BRGtCLEVBRWxCLFFBQUEsR0FBVyxJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsQ0FGTyxDQUFwQixFQUdLO1FBQ0QsZ0JBQUEsRUFBa0IsSUFEakI7UUFFRCxJQUFBLEVBQU07VUFDSixJQUFBLEVBQU0seUJBREY7U0FGTDtPQUhMLENBU0UsQ0FBQyxJQVRILENBU1EsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtRQURJO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVRSO0lBRFE7Ozs7S0FqQjZCO0FBTnpDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBbcHVwcGV0LWxpbmtdKGh0dHA6Ly9wdXBwZXQtbGludC5jb20vKVxuIyMjXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgUHVwcGV0Rml4IGV4dGVuZHMgQmVhdXRpZmllclxuICAjIHRoaXMgaXMgd2hhdCBkaXNwbGF5cyBhcyB5b3VyIERlZmF1bHQgQmVhdXRpZmllciBpbiBMYW5ndWFnZSBDb25maWdcbiAgbmFtZTogXCJwdXBwZXQtbGludFwiXG4gIGxpbms6IFwiaHR0cDovL3B1cHBldC1saW50LmNvbS9cIlxuICBpc1ByZUluc3RhbGxlZDogZmFsc2VcblxuICBvcHRpb25zOiB7XG4gICAgUHVwcGV0OiB0cnVlXG4gIH1cblxuICBjbGk6IChvcHRpb25zKSAtPlxuICAgIGlmIG5vdCBvcHRpb25zLnB1cHBldF9wYXRoP1xuICAgICAgcmV0dXJuIG5ldyBFcnJvcihcIidwdXBwZXQtbGludCcgcGF0aCBpcyBub3Qgc2V0IVwiICtcbiAgICAgICAgXCIgUGxlYXNlIHNldCB0aGlzIGluIHRoZSBBdG9tIEJlYXV0aWZ5IHBhY2thZ2Ugc2V0dGluZ3MuXCIpXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIG9wdGlvbnMucHVwcGV0X3BhdGhcblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIEBydW4oXCJwdXBwZXQtbGludFwiLCBbXG4gICAgICAnLS1maXgnXG4gICAgICB0ZW1wRmlsZSA9IEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQpXG4gICAgICBdLCB7XG4gICAgICAgIGlnbm9yZVJldHVybkNvZGU6IHRydWVcbiAgICAgICAgaGVscDoge1xuICAgICAgICAgIGxpbms6IFwiaHR0cDovL3B1cHBldC1saW50LmNvbS9cIlxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLnRoZW4oPT5cbiAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxuICAgICAgKVxuIl19
