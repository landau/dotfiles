(function() {
  var AllWhitespace, Paragraph, Range, SelectAParagraph, SelectAWholeWord, SelectAWord, SelectInsideBrackets, SelectInsideParagraph, SelectInsideQuotes, SelectInsideWholeWord, SelectInsideWord, TextObject, WholeWordRegex, mergeRanges,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Range = require('atom').Range;

  AllWhitespace = /^\s$/;

  WholeWordRegex = /\S+/;

  mergeRanges = require('./utils').mergeRanges;

  TextObject = (function() {
    function TextObject(editor, state) {
      this.editor = editor;
      this.state = state;
    }

    TextObject.prototype.isComplete = function() {
      return true;
    };

    TextObject.prototype.isRecordable = function() {
      return false;
    };

    TextObject.prototype.execute = function() {
      return this.select.apply(this, arguments);
    };

    return TextObject;

  })();

  SelectInsideWord = (function(_super) {
    __extends(SelectInsideWord, _super);

    function SelectInsideWord() {
      return SelectInsideWord.__super__.constructor.apply(this, arguments);
    }

    SelectInsideWord.prototype.select = function() {
      var selection, _i, _len, _ref;
      _ref = this.editor.getSelections();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        selection = _ref[_i];
        if (selection.isEmpty()) {
          selection.selectRight();
        }
        selection.expandOverWord();
      }
      return [true];
    };

    return SelectInsideWord;

  })(TextObject);

  SelectInsideWholeWord = (function(_super) {
    __extends(SelectInsideWholeWord, _super);

    function SelectInsideWholeWord() {
      return SelectInsideWholeWord.__super__.constructor.apply(this, arguments);
    }

    SelectInsideWholeWord.prototype.select = function() {
      var range, selection, _i, _len, _ref, _results;
      _ref = this.editor.getSelections();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        selection = _ref[_i];
        range = selection.cursor.getCurrentWordBufferRange({
          wordRegex: WholeWordRegex
        });
        selection.setBufferRange(mergeRanges(selection.getBufferRange(), range));
        _results.push(true);
      }
      return _results;
    };

    return SelectInsideWholeWord;

  })(TextObject);

  SelectInsideQuotes = (function(_super) {
    __extends(SelectInsideQuotes, _super);

    function SelectInsideQuotes(editor, char, includeQuotes) {
      this.editor = editor;
      this.char = char;
      this.includeQuotes = includeQuotes;
    }

    SelectInsideQuotes.prototype.findOpeningQuote = function(pos) {
      var line, start;
      start = pos.copy();
      pos = pos.copy();
      while (pos.row >= 0) {
        line = this.editor.lineTextForBufferRow(pos.row);
        if (pos.column === -1) {
          pos.column = line.length - 1;
        }
        while (pos.column >= 0) {
          if (line[pos.column] === this.char) {
            if (pos.column === 0 || line[pos.column - 1] !== '\\') {
              if (this.isStartQuote(pos)) {
                return pos;
              } else {
                return this.lookForwardOnLine(start);
              }
            }
          }
          --pos.column;
        }
        pos.column = -1;
        --pos.row;
      }
      return this.lookForwardOnLine(start);
    };

    SelectInsideQuotes.prototype.isStartQuote = function(end) {
      var line, numQuotes;
      line = this.editor.lineTextForBufferRow(end.row);
      numQuotes = line.substring(0, end.column + 1).replace("'" + this.char, '').split(this.char).length - 1;
      return numQuotes % 2;
    };

    SelectInsideQuotes.prototype.lookForwardOnLine = function(pos) {
      var index, line;
      line = this.editor.lineTextForBufferRow(pos.row);
      index = line.substring(pos.column).indexOf(this.char);
      if (index >= 0) {
        pos.column += index;
        return pos;
      }
      return null;
    };

    SelectInsideQuotes.prototype.findClosingQuote = function(start) {
      var end, endLine, escaping;
      end = start.copy();
      escaping = false;
      while (end.row < this.editor.getLineCount()) {
        endLine = this.editor.lineTextForBufferRow(end.row);
        while (end.column < endLine.length) {
          if (endLine[end.column] === '\\') {
            ++end.column;
          } else if (endLine[end.column] === this.char) {
            if (this.includeQuotes) {
              --start.column;
            }
            if (this.includeQuotes) {
              ++end.column;
            }
            return end;
          }
          ++end.column;
        }
        end.column = 0;
        ++end.row;
      }
    };

    SelectInsideQuotes.prototype.select = function() {
      var end, selection, start, _i, _len, _ref, _results;
      _ref = this.editor.getSelections();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        selection = _ref[_i];
        start = this.findOpeningQuote(selection.cursor.getBufferPosition());
        if (start != null) {
          ++start.column;
          end = this.findClosingQuote(start);
          if (end != null) {
            selection.setBufferRange(mergeRanges(selection.getBufferRange(), [start, end]));
          }
        }
        _results.push(!selection.isEmpty());
      }
      return _results;
    };

    return SelectInsideQuotes;

  })(TextObject);

  SelectInsideBrackets = (function(_super) {
    __extends(SelectInsideBrackets, _super);

    function SelectInsideBrackets(editor, beginChar, endChar, includeBrackets) {
      this.editor = editor;
      this.beginChar = beginChar;
      this.endChar = endChar;
      this.includeBrackets = includeBrackets;
    }

    SelectInsideBrackets.prototype.findOpeningBracket = function(pos) {
      var depth, line;
      pos = pos.copy();
      depth = 0;
      while (pos.row >= 0) {
        line = this.editor.lineTextForBufferRow(pos.row);
        if (pos.column === -1) {
          pos.column = line.length - 1;
        }
        while (pos.column >= 0) {
          switch (line[pos.column]) {
            case this.endChar:
              ++depth;
              break;
            case this.beginChar:
              if (--depth < 0) {
                return pos;
              }
          }
          --pos.column;
        }
        pos.column = -1;
        --pos.row;
      }
    };

    SelectInsideBrackets.prototype.findClosingBracket = function(start) {
      var depth, end, endLine;
      end = start.copy();
      depth = 0;
      while (end.row < this.editor.getLineCount()) {
        endLine = this.editor.lineTextForBufferRow(end.row);
        while (end.column < endLine.length) {
          switch (endLine[end.column]) {
            case this.beginChar:
              ++depth;
              break;
            case this.endChar:
              if (--depth < 0) {
                if (this.includeBrackets) {
                  --start.column;
                }
                if (this.includeBrackets) {
                  ++end.column;
                }
                return end;
              }
          }
          ++end.column;
        }
        end.column = 0;
        ++end.row;
      }
    };

    SelectInsideBrackets.prototype.select = function() {
      var end, selection, start, _i, _len, _ref, _results;
      _ref = this.editor.getSelections();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        selection = _ref[_i];
        start = this.findOpeningBracket(selection.cursor.getBufferPosition());
        if (start != null) {
          ++start.column;
          end = this.findClosingBracket(start);
          if (end != null) {
            selection.setBufferRange(mergeRanges(selection.getBufferRange(), [start, end]));
          }
        }
        _results.push(!selection.isEmpty());
      }
      return _results;
    };

    return SelectInsideBrackets;

  })(TextObject);

  SelectAWord = (function(_super) {
    __extends(SelectAWord, _super);

    function SelectAWord() {
      return SelectAWord.__super__.constructor.apply(this, arguments);
    }

    SelectAWord.prototype.select = function() {
      var char, endPoint, selection, _i, _len, _ref, _results;
      _ref = this.editor.getSelections();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        selection = _ref[_i];
        if (selection.isEmpty()) {
          selection.selectRight();
        }
        selection.expandOverWord();
        while (true) {
          endPoint = selection.getBufferRange().end;
          char = this.editor.getTextInRange(Range.fromPointWithDelta(endPoint, 0, 1));
          if (!AllWhitespace.test(char)) {
            break;
          }
          selection.selectRight();
        }
        _results.push(true);
      }
      return _results;
    };

    return SelectAWord;

  })(TextObject);

  SelectAWholeWord = (function(_super) {
    __extends(SelectAWholeWord, _super);

    function SelectAWholeWord() {
      return SelectAWholeWord.__super__.constructor.apply(this, arguments);
    }

    SelectAWholeWord.prototype.select = function() {
      var char, endPoint, range, selection, _i, _len, _ref, _results;
      _ref = this.editor.getSelections();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        selection = _ref[_i];
        range = selection.cursor.getCurrentWordBufferRange({
          wordRegex: WholeWordRegex
        });
        selection.setBufferRange(mergeRanges(selection.getBufferRange(), range));
        while (true) {
          endPoint = selection.getBufferRange().end;
          char = this.editor.getTextInRange(Range.fromPointWithDelta(endPoint, 0, 1));
          if (!AllWhitespace.test(char)) {
            break;
          }
          selection.selectRight();
        }
        _results.push(true);
      }
      return _results;
    };

    return SelectAWholeWord;

  })(TextObject);

  Paragraph = (function(_super) {
    __extends(Paragraph, _super);

    function Paragraph() {
      return Paragraph.__super__.constructor.apply(this, arguments);
    }

    Paragraph.prototype.select = function() {
      var selection, _i, _len, _ref, _results;
      _ref = this.editor.getSelections();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        selection = _ref[_i];
        _results.push(this.selectParagraph(selection));
      }
      return _results;
    };

    Paragraph.prototype.paragraphDelimitedRange = function(startPoint) {
      var inParagraph, lowerRow, upperRow;
      inParagraph = this.isParagraphLine(this.editor.lineTextForBufferRow(startPoint.row));
      upperRow = this.searchLines(startPoint.row, -1, inParagraph);
      lowerRow = this.searchLines(startPoint.row, this.editor.getLineCount(), inParagraph);
      return new Range([upperRow + 1, 0], [lowerRow, 0]);
    };

    Paragraph.prototype.searchLines = function(startRow, rowLimit, startedInParagraph) {
      var currentRow, line, _i;
      for (currentRow = _i = startRow; startRow <= rowLimit ? _i <= rowLimit : _i >= rowLimit; currentRow = startRow <= rowLimit ? ++_i : --_i) {
        line = this.editor.lineTextForBufferRow(currentRow);
        if (startedInParagraph !== this.isParagraphLine(line)) {
          return currentRow;
        }
      }
      return rowLimit;
    };

    Paragraph.prototype.isParagraphLine = function(line) {
      return /\S/.test(line);
    };

    return Paragraph;

  })(TextObject);

  SelectInsideParagraph = (function(_super) {
    __extends(SelectInsideParagraph, _super);

    function SelectInsideParagraph() {
      return SelectInsideParagraph.__super__.constructor.apply(this, arguments);
    }

    SelectInsideParagraph.prototype.selectParagraph = function(selection) {
      var newRange, oldRange, startPoint;
      oldRange = selection.getBufferRange();
      startPoint = selection.cursor.getBufferPosition();
      newRange = this.paragraphDelimitedRange(startPoint);
      selection.setBufferRange(mergeRanges(oldRange, newRange));
      return true;
    };

    return SelectInsideParagraph;

  })(Paragraph);

  SelectAParagraph = (function(_super) {
    __extends(SelectAParagraph, _super);

    function SelectAParagraph() {
      return SelectAParagraph.__super__.constructor.apply(this, arguments);
    }

    SelectAParagraph.prototype.selectParagraph = function(selection) {
      var newRange, nextRange, oldRange, startPoint;
      oldRange = selection.getBufferRange();
      startPoint = selection.cursor.getBufferPosition();
      newRange = this.paragraphDelimitedRange(startPoint);
      nextRange = this.paragraphDelimitedRange(newRange.end);
      selection.setBufferRange(mergeRanges(oldRange, [newRange.start, nextRange.end]));
      return true;
    };

    return SelectAParagraph;

  })(Paragraph);

  module.exports = {
    TextObject: TextObject,
    SelectInsideWord: SelectInsideWord,
    SelectInsideWholeWord: SelectInsideWholeWord,
    SelectInsideQuotes: SelectInsideQuotes,
    SelectInsideBrackets: SelectInsideBrackets,
    SelectAWord: SelectAWord,
    SelectAWholeWord: SelectAWholeWord,
    SelectInsideParagraph: SelectInsideParagraph,
    SelectAParagraph: SelectAParagraph
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL3RleHQtb2JqZWN0cy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsbU9BQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLFFBQVMsT0FBQSxDQUFRLE1BQVIsRUFBVCxLQUFELENBQUE7O0FBQUEsRUFDQSxhQUFBLEdBQWdCLE1BRGhCLENBQUE7O0FBQUEsRUFFQSxjQUFBLEdBQWlCLEtBRmpCLENBQUE7O0FBQUEsRUFHQyxjQUFlLE9BQUEsQ0FBUSxTQUFSLEVBQWYsV0FIRCxDQUFBOztBQUFBLEVBS007QUFDUyxJQUFBLG9CQUFFLE1BQUYsRUFBVyxLQUFYLEdBQUE7QUFBbUIsTUFBbEIsSUFBQyxDQUFBLFNBQUEsTUFBaUIsQ0FBQTtBQUFBLE1BQVQsSUFBQyxDQUFBLFFBQUEsS0FBUSxDQUFuQjtJQUFBLENBQWI7O0FBQUEseUJBRUEsVUFBQSxHQUFZLFNBQUEsR0FBQTthQUFHLEtBQUg7SUFBQSxDQUZaLENBQUE7O0FBQUEseUJBR0EsWUFBQSxHQUFjLFNBQUEsR0FBQTthQUFHLE1BQUg7SUFBQSxDQUhkLENBQUE7O0FBQUEseUJBS0EsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixDQUFjLElBQWQsRUFBb0IsU0FBcEIsRUFBSDtJQUFBLENBTFQsQ0FBQTs7c0JBQUE7O01BTkYsQ0FBQTs7QUFBQSxFQWFNO0FBQ0osdUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLCtCQUFBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDTixVQUFBLHlCQUFBO0FBQUE7QUFBQSxXQUFBLDJDQUFBOzZCQUFBO0FBQ0UsUUFBQSxJQUFHLFNBQVMsQ0FBQyxPQUFWLENBQUEsQ0FBSDtBQUNFLFVBQUEsU0FB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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/vim-mode/lib/text-objects.coffee
