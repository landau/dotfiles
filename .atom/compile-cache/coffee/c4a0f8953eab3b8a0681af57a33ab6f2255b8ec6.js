(function() {
  var AncestorsMethods, ColorResultsElement, CompositeDisposable, EventsDelegation, Range, SpacePenDSL, path, removeLeadingWhitespace, _, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = [], Range = _ref[0], CompositeDisposable = _ref[1], _ = _ref[2], path = _ref[3];

  _ref1 = require('atom-utils'), SpacePenDSL = _ref1.SpacePenDSL, EventsDelegation = _ref1.EventsDelegation, AncestorsMethods = _ref1.AncestorsMethods;

  removeLeadingWhitespace = function(string) {
    return string.replace(/^\s+/, '');
  };

  ColorResultsElement = (function(_super) {
    __extends(ColorResultsElement, _super);

    function ColorResultsElement() {
      return ColorResultsElement.__super__.constructor.apply(this, arguments);
    }

    SpacePenDSL.includeInto(ColorResultsElement);

    EventsDelegation.includeInto(ColorResultsElement);

    ColorResultsElement.content = function() {
      return this.tag('atom-panel', {
        outlet: 'pane',
        "class": 'preview-pane pane-item'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'panel-heading'
          }, function() {
            _this.span({
              outlet: 'previewCount',
              "class": 'preview-count inline-block'
            });
            return _this.div({
              outlet: 'loadingMessage',
              "class": 'inline-block'
            }, function() {
              _this.div({
                "class": 'loading loading-spinner-tiny inline-block'
              });
              return _this.div({
                outlet: 'searchedCountBlock',
                "class": 'inline-block'
              }, function() {
                _this.span({
                  outlet: 'searchedCount',
                  "class": 'searched-count'
                });
                return _this.span(' paths searched');
              });
            });
          });
          return _this.ol({
            outlet: 'resultsList',
            "class": 'search-colors-results results-view list-tree focusable-panel has-collapsable-children native-key-bindings',
            tabindex: -1
          });
        };
      })(this));
    };

    ColorResultsElement.prototype.createdCallback = function() {
      var _ref2;
      if (CompositeDisposable == null) {
        _ref2 = require('atom'), Range = _ref2.Range, CompositeDisposable = _ref2.CompositeDisposable;
      }
      this.subscriptions = new CompositeDisposable;
      this.pathMapping = {};
      this.files = 0;
      this.colors = 0;
      this.loadingMessage.style.display = 'none';
      this.subscriptions.add(this.subscribeTo(this, '.list-nested-item > .list-item', {
        click: function(e) {
          var fileItem;
          e.stopPropagation();
          fileItem = AncestorsMethods.parents(e.target, '.list-nested-item')[0];
          return fileItem.classList.toggle('collapsed');
        }
      }));
      return this.subscriptions.add(this.subscribeTo(this, '.search-result', {
        click: (function(_this) {
          return function(e) {
            var fileItem, matchItem, pathAttribute, range;
            e.stopPropagation();
            matchItem = e.target.matches('.search-result') ? e.target : AncestorsMethods.parents(e.target, '.search-result')[0];
            fileItem = AncestorsMethods.parents(matchItem, '.list-nested-item')[0];
            range = Range.fromObject([matchItem.dataset.start.split(',').map(Number), matchItem.dataset.end.split(',').map(Number)]);
            pathAttribute = fileItem.dataset.path;
            return atom.workspace.open(_this.pathMapping[pathAttribute]).then(function(editor) {
              return editor.setSelectedBufferRange(range, {
                autoscroll: true
              });
            });
          };
        })(this)
      }));
    };

    ColorResultsElement.prototype.setModel = function(colorSearch) {
      this.colorSearch = colorSearch;
      this.subscriptions.add(this.colorSearch.onDidFindMatches((function(_this) {
        return function(result) {
          return _this.addFileResult(result);
        };
      })(this)));
      this.subscriptions.add(this.colorSearch.onDidCompleteSearch((function(_this) {
        return function() {
          return _this.searchComplete();
        };
      })(this)));
      return this.colorSearch.search();
    };

    ColorResultsElement.prototype.addFileResult = function(result) {
      this.files += 1;
      this.colors += result.matches.length;
      this.resultsList.innerHTML += this.createFileResult(result);
      return this.updateMessage();
    };

    ColorResultsElement.prototype.searchComplete = function() {
      this.updateMessage();
      if (this.colors === 0) {
        this.pane.classList.add('no-results');
        return this.pane.appendChild("<ul class='centered background-message no-results-overlay'>\n  <li>No Results</li>\n</ul>");
      }
    };

    ColorResultsElement.prototype.updateMessage = function() {
      var filesString;
      filesString = this.files === 1 ? 'file' : 'files';
      return this.previewCount.innerHTML = this.colors > 0 ? "<span class='text-info'>\n  " + this.colors + " colors\n</span>\nfound in\n<span class='text-info'>\n  " + this.files + " " + filesString + "\n</span>" : "No colors found in " + this.files + " " + filesString;
    };

    ColorResultsElement.prototype.createFileResult = function(fileResult) {
      var fileBasename, filePath, matches, pathAttribute, pathName;
      if (_ == null) {
        _ = require('underscore-plus');
      }
      if (path == null) {
        path = require('path');
      }
      filePath = fileResult.filePath, matches = fileResult.matches;
      fileBasename = path.basename(filePath);
      pathAttribute = _.escapeAttribute(filePath);
      this.pathMapping[pathAttribute] = filePath;
      pathName = atom.project.relativize(filePath);
      return "<li class=\"path list-nested-item\" data-path=\"" + pathAttribute + "\">\n  <div class=\"path-details list-item\">\n    <span class=\"disclosure-arrow\"></span>\n    <span class=\"icon icon-file-text\" data-name=\"" + fileBasename + "\"></span>\n    <span class=\"path-name bright\">" + pathName + "</span>\n    <span class=\"path-match-number\">(" + matches.length + ")</span></div>\n  </div>\n  <ul class=\"matches list-tree\">\n    " + (matches.map((function(_this) {
        return function(match) {
          return _this.createMatchResult(match);
        };
      })(this)).join('')) + "\n  </ul>\n</li>";
    };

    ColorResultsElement.prototype.createMatchResult = function(match) {
      var filePath, lineNumber, matchEnd, matchStart, prefix, range, style, suffix, textColor, _ref2;
      if (CompositeDisposable == null) {
        _ref2 = require('atom'), Range = _ref2.Range, CompositeDisposable = _ref2.CompositeDisposable;
      }
      textColor = match.color.luma > 0.43 ? 'black' : 'white';
      filePath = match.filePath, range = match.range;
      range = Range.fromObject(range);
      matchStart = range.start.column - match.lineTextOffset;
      matchEnd = range.end.column - match.lineTextOffset;
      prefix = removeLeadingWhitespace(match.lineText.slice(0, matchStart));
      suffix = match.lineText.slice(matchEnd);
      lineNumber = range.start.row + 1;
      style = '';
      style += "background: " + (match.color.toCSS()) + ";";
      style += "color: " + textColor + ";";
      return "<li class=\"search-result list-item\" data-start=\"" + range.start.row + "," + range.start.column + "\" data-end=\"" + range.end.row + "," + range.end.column + "\">\n  <span class=\"line-number text-subtle\">" + lineNumber + "</span>\n  <span class=\"preview\">\n    " + prefix + "\n    <span class='match color-match' style='" + style + "'>" + match.matchText + "</span>\n    " + suffix + "\n  </span>\n</li>";
    };

    return ColorResultsElement;

  })(HTMLElement);

  module.exports = ColorResultsElement = document.registerElement('pigments-color-results', {
    prototype: ColorResultsElement.prototype
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvbGliL2NvbG9yLXJlc3VsdHMtZWxlbWVudC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsK0lBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLE9BR0ksRUFISixFQUNFLGVBREYsRUFDUyw2QkFEVCxFQUVFLFdBRkYsRUFFSyxjQUZMLENBQUE7O0FBQUEsRUFLQSxRQUFvRCxPQUFBLENBQVEsWUFBUixDQUFwRCxFQUFDLG9CQUFBLFdBQUQsRUFBYyx5QkFBQSxnQkFBZCxFQUFnQyx5QkFBQSxnQkFMaEMsQ0FBQTs7QUFBQSxFQU9BLHVCQUFBLEdBQTBCLFNBQUMsTUFBRCxHQUFBO1dBQVksTUFBTSxDQUFDLE9BQVAsQ0FBZSxNQUFmLEVBQXVCLEVBQXZCLEVBQVo7RUFBQSxDQVAxQixDQUFBOztBQUFBLEVBU007QUFDSiwwQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxXQUFXLENBQUMsV0FBWixDQUF3QixtQkFBeEIsQ0FBQSxDQUFBOztBQUFBLElBQ0EsZ0JBQWdCLENBQUMsV0FBakIsQ0FBNkIsbUJBQTdCLENBREEsQ0FBQTs7QUFBQSxJQUdBLG1CQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUssWUFBTCxFQUFtQjtBQUFBLFFBQUEsTUFBQSxFQUFRLE1BQVI7QUFBQSxRQUFnQixPQUFBLEVBQU8sd0JBQXZCO09BQW5CLEVBQW9FLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDbEUsVUFBQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sZUFBUDtXQUFMLEVBQTZCLFNBQUEsR0FBQTtBQUMzQixZQUFBLEtBQUMsQ0FBQSxJQUFE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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/lib/color-results-element.coffee
