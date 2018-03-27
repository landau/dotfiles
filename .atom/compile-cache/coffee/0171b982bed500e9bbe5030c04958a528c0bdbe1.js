
/*
Requires https://github.com/bbatsov/rubocop
 */

(function() {
  "use strict";
  var Beautifier, Rubocop,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Rubocop = (function(superClass) {
    extend(Rubocop, superClass);

    function Rubocop() {
      return Rubocop.__super__.constructor.apply(this, arguments);
    }

    Rubocop.prototype.name = "Rubocop";

    Rubocop.prototype.link = "https://github.com/bbatsov/rubocop";

    Rubocop.prototype.isPreInstalled = false;

    Rubocop.prototype.options = {
      Ruby: {
        indent_size: true,
        rubocop_path: true
      }
    };

    Rubocop.prototype.beautify = function(text, language, options) {
      return this.Promise.all([options.rubocop_path ? this.which(options.rubocop_path) : void 0, this.which('rubocop')]).then((function(_this) {
        return function(paths) {
          var _, config, configFile, fs, path, rubocopPath, tempFile, yaml;
          _this.debug('rubocop paths', paths);
          _ = require('lodash');
          path = require('path');
          rubocopPath = _.find(paths, function(p) {
            return p && path.isAbsolute(p);
          });
          _this.verbose('rubocopPath', rubocopPath);
          _this.debug('rubocopPath', rubocopPath, paths);
          configFile = path.join(atom.project.getPaths()[0], ".rubocop.yml");
          fs = require('fs');
          if (fs.existsSync(configFile)) {
            _this.debug("rubocop", config, fs.readFileSync(configFile, 'utf8'));
          } else {
            yaml = require("yaml-front-matter");
            config = {
              "Style/IndentationWidth": {
                "Width": options.indent_size
              }
            };
            configFile = _this.tempFile("rubocop-config", yaml.safeDump(config));
            _this.debug("rubocop", config, configFile);
          }
          if (rubocopPath != null) {
            return _this.run(rubocopPath, ["--auto-correct", "--config", configFile, tempFile = _this.tempFile("temp", text, '.rb')], {
              ignoreReturnCode: true
            }).then(function() {
              return _this.readFile(tempFile);
            });
          } else {
            return _this.run("rubocop", ["--auto-correct", "--config", configFile, tempFile = _this.tempFile("temp", text, '.rb')], {
              ignoreReturnCode: true
            }).then(function() {
              return _this.readFile(tempFile);
            });
          }
        };
      })(this));
    };

    return Rubocop;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvcnVib2NvcC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEsbUJBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3NCQUNyQixJQUFBLEdBQU07O3NCQUNOLElBQUEsR0FBTTs7c0JBQ04sY0FBQSxHQUFnQjs7c0JBRWhCLE9BQUEsR0FBUztNQUNQLElBQUEsRUFDRTtRQUFBLFdBQUEsRUFBYSxJQUFiO1FBQ0EsWUFBQSxFQUFjLElBRGQ7T0FGSzs7O3NCQU1ULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO2FBQ1IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxHQUFULENBQWEsQ0FDcUIsT0FBTyxDQUFDLFlBQXhDLEdBQUEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxPQUFPLENBQUMsWUFBZixDQUFBLEdBQUEsTUFEVyxFQUVYLElBQUMsQ0FBQSxLQUFELENBQU8sU0FBUCxDQUZXLENBQWIsQ0FHRSxDQUFDLElBSEgsQ0FHUSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsS0FBRDtBQUNOLGNBQUE7VUFBQSxLQUFDLENBQUEsS0FBRCxDQUFPLGVBQVAsRUFBd0IsS0FBeEI7VUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7VUFDSixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7VUFFUCxXQUFBLEdBQWMsQ0FBQyxDQUFDLElBQUYsQ0FBTyxLQUFQLEVBQWMsU0FBQyxDQUFEO21CQUFPLENBQUEsSUFBTSxJQUFJLENBQUMsVUFBTCxDQUFnQixDQUFoQjtVQUFiLENBQWQ7VUFDZCxLQUFDLENBQUEsT0FBRCxDQUFTLGFBQVQsRUFBd0IsV0FBeEI7VUFDQSxLQUFDLENBQUEsS0FBRCxDQUFPLGFBQVAsRUFBc0IsV0FBdEIsRUFBbUMsS0FBbkM7VUFFQSxVQUFBLEdBQWEsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQWIsQ0FBQSxDQUF3QixDQUFBLENBQUEsQ0FBbEMsRUFBc0MsY0FBdEM7VUFFYixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7VUFFTCxJQUFHLEVBQUUsQ0FBQyxVQUFILENBQWMsVUFBZCxDQUFIO1lBQ0UsS0FBQyxDQUFBLEtBQUQsQ0FBTyxTQUFQLEVBQWtCLE1BQWxCLEVBQTBCLEVBQUUsQ0FBQyxZQUFILENBQWdCLFVBQWhCLEVBQTRCLE1BQTVCLENBQTFCLEVBREY7V0FBQSxNQUFBO1lBR0UsSUFBQSxHQUFPLE9BQUEsQ0FBUSxtQkFBUjtZQUVQLE1BQUEsR0FBUztjQUNQLHdCQUFBLEVBQ0U7Z0JBQUEsT0FBQSxFQUFTLE9BQU8sQ0FBQyxXQUFqQjtlQUZLOztZQUtULFVBQUEsR0FBYSxLQUFDLENBQUEsUUFBRCxDQUFVLGdCQUFWLEVBQTRCLElBQUksQ0FBQyxRQUFMLENBQWMsTUFBZCxDQUE1QjtZQUNiLEtBQUMsQ0FBQSxLQUFELENBQU8sU0FBUCxFQUFrQixNQUFsQixFQUEwQixVQUExQixFQVhGOztVQWNBLElBQUcsbUJBQUg7bUJBQ0UsS0FBQyxDQUFBLEdBQUQsQ0FBSyxXQUFMLEVBQWtCLENBQ2hCLGdCQURnQixFQUVoQixVQUZnQixFQUVKLFVBRkksRUFHaEIsUUFBQSxHQUFXLEtBQUMsQ0FBQSxRQUFELENBQVUsTUFBVixFQUFrQixJQUFsQixFQUF3QixLQUF4QixDQUhLLENBQWxCLEVBSUs7Y0FBQyxnQkFBQSxFQUFrQixJQUFuQjthQUpMLENBS0UsQ0FBQyxJQUxILENBS1EsU0FBQTtxQkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7WUFESSxDQUxSLEVBREY7V0FBQSxNQUFBO21CQVVFLEtBQUMsQ0FBQSxHQUFELENBQUssU0FBTCxFQUFnQixDQUNkLGdCQURjLEVBRWQsVUFGYyxFQUVGLFVBRkUsRUFHZCxRQUFBLEdBQVcsS0FBQyxDQUFBLFFBQUQsQ0FBVSxNQUFWLEVBQWtCLElBQWxCLEVBQXdCLEtBQXhCLENBSEcsQ0FBaEIsRUFJSztjQUFDLGdCQUFBLEVBQWtCLElBQW5CO2FBSkwsQ0FLRSxDQUFDLElBTEgsQ0FLUSxTQUFBO3FCQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtZQURJLENBTFIsRUFWRjs7UUEzQk07TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSFI7SUFEUTs7OztLQVgyQjtBQVB2QyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgaHR0cHM6Ly9naXRodWIuY29tL2JiYXRzb3YvcnVib2NvcFxuIyMjXG5cblwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBSdWJvY29wIGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIlJ1Ym9jb3BcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9iYmF0c292L3J1Ym9jb3BcIlxuICBpc1ByZUluc3RhbGxlZDogZmFsc2VcblxuICBvcHRpb25zOiB7XG4gICAgUnVieTpcbiAgICAgIGluZGVudF9zaXplOiB0cnVlXG4gICAgICBydWJvY29wX3BhdGg6IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgQFByb21pc2UuYWxsKFtcbiAgICAgIEB3aGljaChvcHRpb25zLnJ1Ym9jb3BfcGF0aCkgaWYgb3B0aW9ucy5ydWJvY29wX3BhdGhcbiAgICAgIEB3aGljaCgncnVib2NvcCcpXG4gICAgXSkudGhlbigocGF0aHMpID0+XG4gICAgICBAZGVidWcoJ3J1Ym9jb3AgcGF0aHMnLCBwYXRocylcbiAgICAgIF8gPSByZXF1aXJlICdsb2Rhc2gnXG4gICAgICBwYXRoID0gcmVxdWlyZSAncGF0aCdcbiAgICAgICMgR2V0IGZpcnN0IHZhbGlkLCBhYnNvbHV0ZSBwYXRoXG4gICAgICBydWJvY29wUGF0aCA9IF8uZmluZChwYXRocywgKHApIC0+IHAgYW5kIHBhdGguaXNBYnNvbHV0ZShwKSApXG4gICAgICBAdmVyYm9zZSgncnVib2NvcFBhdGgnLCBydWJvY29wUGF0aClcbiAgICAgIEBkZWJ1ZygncnVib2NvcFBhdGgnLCBydWJvY29wUGF0aCwgcGF0aHMpXG5cbiAgICAgIGNvbmZpZ0ZpbGUgPSBwYXRoLmpvaW4oYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF0sIFwiLnJ1Ym9jb3AueW1sXCIpXG5cbiAgICAgIGZzID0gcmVxdWlyZSAnZnMnXG5cbiAgICAgIGlmIGZzLmV4aXN0c1N5bmMoY29uZmlnRmlsZSlcbiAgICAgICAgQGRlYnVnKFwicnVib2NvcFwiLCBjb25maWcsIGZzLnJlYWRGaWxlU3luYyhjb25maWdGaWxlLCAndXRmOCcpKVxuICAgICAgZWxzZVxuICAgICAgICB5YW1sID0gcmVxdWlyZShcInlhbWwtZnJvbnQtbWF0dGVyXCIpXG4gICAgICAgICMgR2VuZXJhdGUgY29uZmlnIGZpbGVcbiAgICAgICAgY29uZmlnID0ge1xuICAgICAgICAgIFwiU3R5bGUvSW5kZW50YXRpb25XaWR0aFwiOlxuICAgICAgICAgICAgXCJXaWR0aFwiOiBvcHRpb25zLmluZGVudF9zaXplXG4gICAgICAgIH1cblxuICAgICAgICBjb25maWdGaWxlID0gQHRlbXBGaWxlKFwicnVib2NvcC1jb25maWdcIiwgeWFtbC5zYWZlRHVtcChjb25maWcpKVxuICAgICAgICBAZGVidWcoXCJydWJvY29wXCIsIGNvbmZpZywgY29uZmlnRmlsZSlcblxuICAgICAgIyBDaGVjayBpZiBQSFAtQ1MtRml4ZXIgcGF0aCB3YXMgZm91bmRcbiAgICAgIGlmIHJ1Ym9jb3BQYXRoP1xuICAgICAgICBAcnVuKHJ1Ym9jb3BQYXRoLCBbXG4gICAgICAgICAgXCItLWF1dG8tY29ycmVjdFwiXG4gICAgICAgICAgXCItLWNvbmZpZ1wiLCBjb25maWdGaWxlXG4gICAgICAgICAgdGVtcEZpbGUgPSBAdGVtcEZpbGUoXCJ0ZW1wXCIsIHRleHQsICcucmInKVxuICAgICAgICAgIF0sIHtpZ25vcmVSZXR1cm5Db2RlOiB0cnVlfSlcbiAgICAgICAgICAudGhlbig9PlxuICAgICAgICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxuICAgICAgICAgIClcbiAgICAgIGVsc2VcbiAgICAgICAgQHJ1bihcInJ1Ym9jb3BcIiwgW1xuICAgICAgICAgIFwiLS1hdXRvLWNvcnJlY3RcIlxuICAgICAgICAgIFwiLS1jb25maWdcIiwgY29uZmlnRmlsZVxuICAgICAgICAgIHRlbXBGaWxlID0gQHRlbXBGaWxlKFwidGVtcFwiLCB0ZXh0LCAnLnJiJylcbiAgICAgICAgICBdLCB7aWdub3JlUmV0dXJuQ29kZTogdHJ1ZX0pXG4gICAgICAgICAgLnRoZW4oPT5cbiAgICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgICAgICApXG4pXG4iXX0=
