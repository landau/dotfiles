
/*
Requires https://github.com/jaspervdj/stylish-haskell
 */

(function() {
  "use strict";
  var Beautifier, Crystal,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Crystal = (function(superClass) {
    extend(Crystal, superClass);

    function Crystal() {
      return Crystal.__super__.constructor.apply(this, arguments);
    }

    Crystal.prototype.name = "Crystal";

    Crystal.prototype.link = "http://crystal-lang.org";

    Crystal.prototype.options = {
      Crystal: false
    };

    Crystal.prototype.beautify = function(text, language, options) {
      var tempFile;
      if (this.isWindows) {
        return this.Promise.reject(this.commandNotFoundError('crystal', {
          link: "http://crystal-lang.org",
          program: "crystal"
        }));
      } else {
        return this.run("crystal", ['tool', 'format', tempFile = this.tempFile("temp", text)], {
          ignoreReturnCode: true
        }).then((function(_this) {
          return function() {
            return _this.readFile(tempFile);
          };
        })(this));
      }
    };

    return Crystal;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvY3J5c3RhbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEsbUJBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3NCQUNyQixJQUFBLEdBQU07O3NCQUNOLElBQUEsR0FBTTs7c0JBRU4sT0FBQSxHQUFTO01BQ1AsT0FBQSxFQUFTLEtBREY7OztzQkFJVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUVSLFVBQUE7TUFBQSxJQUFHLElBQUMsQ0FBQSxTQUFKO2VBQ0UsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQWdCLElBQUMsQ0FBQSxvQkFBRCxDQUNkLFNBRGMsRUFFZDtVQUNBLElBQUEsRUFBTSx5QkFETjtVQUVBLE9BQUEsRUFBUyxTQUZUO1NBRmMsQ0FBaEIsRUFERjtPQUFBLE1BQUE7ZUFTRSxJQUFDLENBQUEsR0FBRCxDQUFLLFNBQUwsRUFBZ0IsQ0FDZCxNQURjLEVBRWQsUUFGYyxFQUdkLFFBQUEsR0FBVyxJQUFDLENBQUEsUUFBRCxDQUFVLE1BQVYsRUFBa0IsSUFBbEIsQ0FIRyxDQUFoQixFQUlLO1VBQUMsZ0JBQUEsRUFBa0IsSUFBbkI7U0FKTCxDQUtFLENBQUMsSUFMSCxDQUtRLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQ0osS0FBQyxDQUFBLFFBQUQsQ0FBVSxRQUFWO1VBREk7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBTFIsRUFURjs7SUFGUTs7OztLQVIyQjtBQVB2QyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgaHR0cHM6Ly9naXRodWIuY29tL2phc3BlcnZkai9zdHlsaXNoLWhhc2tlbGxcbiMjI1xuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgQ3J5c3RhbCBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJDcnlzdGFsXCJcbiAgbGluazogXCJodHRwOi8vY3J5c3RhbC1sYW5nLm9yZ1wiXG5cbiAgb3B0aW9uczoge1xuICAgIENyeXN0YWw6IGZhbHNlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgICMgU2VlbXMgdGhhdCBDcnlzdGFsIGRvc2VuJ3QgaGF2ZSBXaW5kb3dzIHN1cHBvcnQgeWV0LlxuICAgIGlmIEBpc1dpbmRvd3NcbiAgICAgIEBQcm9taXNlLnJlamVjdChAY29tbWFuZE5vdEZvdW5kRXJyb3IoXG4gICAgICAgICdjcnlzdGFsJ1xuICAgICAgICB7XG4gICAgICAgIGxpbms6IFwiaHR0cDovL2NyeXN0YWwtbGFuZy5vcmdcIlxuICAgICAgICBwcm9ncmFtOiBcImNyeXN0YWxcIlxuICAgICAgICB9KVxuICAgICAgKVxuICAgIGVsc2VcbiAgICAgIEBydW4oXCJjcnlzdGFsXCIsIFtcbiAgICAgICAgJ3Rvb2wnLFxuICAgICAgICAnZm9ybWF0JyxcbiAgICAgICAgdGVtcEZpbGUgPSBAdGVtcEZpbGUoXCJ0ZW1wXCIsIHRleHQpXG4gICAgICAgIF0sIHtpZ25vcmVSZXR1cm5Db2RlOiB0cnVlfSlcbiAgICAgICAgLnRoZW4oPT5cbiAgICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICAgIClcbiJdfQ==
