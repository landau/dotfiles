(function() {
  var APair, AngleBracket, AnyPair, AnyPairAllowForwarding, AnyQuote, BackTick, Base, BracketFinder, Comment, CommentOrParagraph, CurlyBracket, CurrentLine, DoubleQuote, Empty, Entire, Fold, Function, Indentation, LatestChange, Pair, Paragraph, Parenthesis, PersistentSelection, Point, PreviousSelection, Quote, QuoteFinder, Range, SearchMatchBackward, SearchMatchForward, SingleQuote, SmartWord, SquareBracket, Subword, Tag, TagFinder, TextObject, VisibleArea, WholeWord, Word, _, expandRangeToWhiteSpaces, getBufferRows, getCodeFoldRowRangesContainesForRow, getLineTextToBufferPosition, getValidVimBufferRow, getVisibleBufferRange, isIncludeFunctionScopeForRow, pointIsAtEndOfLine, ref, ref1, ref2, sortRanges, swrap, translatePointAndClip, trimRange,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Range = ref.Range, Point = ref.Point;

  _ = require('underscore-plus');

  Base = require('./base');

  swrap = require('./selection-wrapper');

  ref1 = require('./utils'), getLineTextToBufferPosition = ref1.getLineTextToBufferPosition, getCodeFoldRowRangesContainesForRow = ref1.getCodeFoldRowRangesContainesForRow, isIncludeFunctionScopeForRow = ref1.isIncludeFunctionScopeForRow, expandRangeToWhiteSpaces = ref1.expandRangeToWhiteSpaces, getVisibleBufferRange = ref1.getVisibleBufferRange, translatePointAndClip = ref1.translatePointAndClip, getBufferRows = ref1.getBufferRows, getValidVimBufferRow = ref1.getValidVimBufferRow, trimRange = ref1.trimRange, sortRanges = ref1.sortRanges, pointIsAtEndOfLine = ref1.pointIsAtEndOfLine;

  ref2 = require('./pair-finder.coffee'), BracketFinder = ref2.BracketFinder, QuoteFinder = ref2.QuoteFinder, TagFinder = ref2.TagFinder;

  TextObject = (function(superClass) {
    extend(TextObject, superClass);

    TextObject.extend(false);

    TextObject.operationKind = 'text-object';

    TextObject.prototype.wise = 'characterwise';

    TextObject.prototype.supportCount = false;

    TextObject.prototype.selectOnce = false;

    TextObject.deriveInnerAndA = function() {
      this.generateClass("A" + this.name, false);
      return this.generateClass("Inner" + this.name, true);
    };

    TextObject.deriveInnerAndAForAllowForwarding = function() {
      this.generateClass("A" + this.name + "AllowForwarding", false, true);
      return this.generateClass("Inner" + this.name + "AllowForwarding", true, true);
    };

    TextObject.generateClass = function(klassName, inner, allowForwarding) {
      var klass;
      klass = (function(superClass1) {
        extend(_Class, superClass1);

        function _Class() {
          return _Class.__super__.constructor.apply(this, arguments);
        }

        return _Class;

      })(this);
      Object.defineProperty(klass, 'name', {
        get: function() {
          return klassName;
        }
      });
      klass.prototype.inner = inner;
      if (allowForwarding) {
        klass.prototype.allowForwarding = true;
      }
      return klass.extend();
    };

    function TextObject() {
      TextObject.__super__.constructor.apply(this, arguments);
      this.initialize();
    }

    TextObject.prototype.isInner = function() {
      return this.inner;
    };

    TextObject.prototype.isA = function() {
      return !this.inner;
    };

    TextObject.prototype.isLinewise = function() {
      return this.wise === 'linewise';
    };

    TextObject.prototype.isBlockwise = function() {
      return this.wise === 'blockwise';
    };

    TextObject.prototype.forceWise = function(wise) {
      return this.wise = wise;
    };

    TextObject.prototype.resetState = function() {
      return this.selectSucceeded = null;
    };

    TextObject.prototype.execute = function() {
      this.resetState();
      if (this.operator != null) {
        return this.select();
      } else {
        throw new Error('in TextObject: Must not happen');
      }
    };

    TextObject.prototype.select = function() {
      var $selection, i, j, k, len, len1, len2, ref3, ref4, ref5, results;
      if (this.isMode('visual', 'blockwise')) {
        swrap.normalize(this.editor);
      }
      this.countTimes(this.getCount(), (function(_this) {
        return function(arg) {
          var i, len, oldRange, ref3, results, selection, stop;
          stop = arg.stop;
          if (!_this.supportCount) {
            stop();
          }
          ref3 = _this.editor.getSelections();
          results = [];
          for (i = 0, len = ref3.length; i < len; i++) {
            selection = ref3[i];
            oldRange = selection.getBufferRange();
            if (_this.selectTextObject(selection)) {
              _this.selectSucceeded = true;
            }
            if (selection.getBufferRange().isEqual(oldRange)) {
              stop();
            }
            if (_this.selectOnce) {
              break;
            } else {
              results.push(void 0);
            }
          }
          return results;
        };
      })(this));
      this.editor.mergeIntersectingSelections();
      if (this.wise == null) {
        this.wise = swrap.detectWise(this.editor);
      }
      if (this.mode === 'visual') {
        if (this.selectSucceeded) {
          switch (this.wise) {
            case 'characterwise':
              ref3 = swrap.getSelections(this.editor);
              for (i = 0, len = ref3.length; i < len; i++) {
                $selection = ref3[i];
                $selection.saveProperties();
              }
              break;
            case 'linewise':
              ref4 = swrap.getSelections(this.editor);
              for (j = 0, len1 = ref4.length; j < len1; j++) {
                $selection = ref4[j];
                if (this.getConfig('keepColumnOnSelectTextObject')) {
                  if (!$selection.hasProperties()) {
                    $selection.saveProperties();
                  }
                } else {
                  $selection.saveProperties();
                }
                $selection.fixPropertyRowToRowRange();
              }
          }
        }
        if (this.submode === 'blockwise') {
          ref5 = swrap.getSelections(this.editor);
          results = [];
          for (k = 0, len2 = ref5.length; k < len2; k++) {
            $selection = ref5[k];
            $selection.normalize();
            results.push($selection.applyWise('blockwise'));
          }
          return results;
        }
      }
    };

    TextObject.prototype.selectTextObject = function(selection) {
      var range;
      if (range = this.getRange(selection)) {
        swrap(selection).setBufferRange(range);
        return true;
      }
    };

    TextObject.prototype.getRange = function(selection) {
      return null;
    };

    return TextObject;

  })(Base);

  Word = (function(superClass) {
    extend(Word, superClass);

    function Word() {
      return Word.__super__.constructor.apply(this, arguments);
    }

    Word.extend(false);

    Word.deriveInnerAndA();

    Word.prototype.getRange = function(selection) {
      var point, range;
      point = this.getCursorPositionForSelection(selection);
      range = this.getWordBufferRangeAndKindAtBufferPosition(point, {
        wordRegex: this.wordRegex
      }).range;
      if (this.isA()) {
        return expandRangeToWhiteSpaces(this.editor, range);
      } else {
        return range;
      }
    };

    return Word;

  })(TextObject);

  WholeWord = (function(superClass) {
    extend(WholeWord, superClass);

    function WholeWord() {
      return WholeWord.__super__.constructor.apply(this, arguments);
    }

    WholeWord.extend(false);

    WholeWord.deriveInnerAndA();

    WholeWord.prototype.wordRegex = /\S+/;

    return WholeWord;

  })(Word);

  SmartWord = (function(superClass) {
    extend(SmartWord, superClass);

    function SmartWord() {
      return SmartWord.__super__.constructor.apply(this, arguments);
    }

    SmartWord.extend(false);

    SmartWord.deriveInnerAndA();

    SmartWord.description = "A word that consists of alphanumeric chars(`/[A-Za-z0-9_]/`) and hyphen `-`";

    SmartWord.prototype.wordRegex = /[\w-]+/;

    return SmartWord;

  })(Word);

  Subword = (function(superClass) {
    extend(Subword, superClass);

    function Subword() {
      return Subword.__super__.constructor.apply(this, arguments);
    }

    Subword.extend(false);

    Subword.deriveInnerAndA();

    Subword.prototype.getRange = function(selection) {
      this.wordRegex = selection.cursor.subwordRegExp();
      return Subword.__super__.getRange.apply(this, arguments);
    };

    return Subword;

  })(Word);

  Pair = (function(superClass) {
    extend(Pair, superClass);

    function Pair() {
      return Pair.__super__.constructor.apply(this, arguments);
    }

    Pair.extend(false);

    Pair.prototype.supportCount = true;

    Pair.prototype.allowNextLine = null;

    Pair.prototype.adjustInnerRange = true;

    Pair.prototype.pair = null;

    Pair.prototype.isAllowNextLine = function() {
      var ref3;
      return (ref3 = this.allowNextLine) != null ? ref3 : (this.pair != null) && this.pair[0] !== this.pair[1];
    };

    Pair.prototype.adjustRange = function(arg) {
      var end, start;
      start = arg.start, end = arg.end;
      if (pointIsAtEndOfLine(this.editor, start)) {
        start = start.traverse([1, 0]);
      }
      if (getLineTextToBufferPosition(this.editor, end).match(/^\s*$/)) {
        if (this.mode === 'visual') {
          end = new Point(end.row - 1, 2e308);
        } else {
          end = new Point(end.row, 0);
        }
      }
      return new Range(start, end);
    };

    Pair.prototype.getFinder = function() {
      var options;
      options = {
        allowNextLine: this.isAllowNextLine(),
        allowForwarding: this.allowForwarding,
        pair: this.pair
      };
      if (this.pair[0] === this.pair[1]) {
        return new QuoteFinder(this.editor, options);
      } else {
        return new BracketFinder(this.editor, options);
      }
    };

    Pair.prototype.getPairInfo = function(from) {
      var pairInfo;
      pairInfo = this.getFinder().find(from);
      if (pairInfo == null) {
        return null;
      }
      if (this.adjustInnerRange) {
        pairInfo.innerRange = this.adjustRange(pairInfo.innerRange);
      }
      pairInfo.targetRange = this.isInner() ? pairInfo.innerRange : pairInfo.aRange;
      return pairInfo;
    };

    Pair.prototype.getRange = function(selection) {
      var originalRange, pairInfo;
      originalRange = selection.getBufferRange();
      pairInfo = this.getPairInfo(this.getCursorPositionForSelection(selection));
      if (pairInfo != null ? pairInfo.targetRange.isEqual(originalRange) : void 0) {
        pairInfo = this.getPairInfo(pairInfo.aRange.end);
      }
      return pairInfo != null ? pairInfo.targetRange : void 0;
    };

    return Pair;

  })(TextObject);

  APair = (function(superClass) {
    extend(APair, superClass);

    function APair() {
      return APair.__super__.constructor.apply(this, arguments);
    }

    APair.extend(false);

    return APair;

  })(Pair);

  AnyPair = (function(superClass) {
    extend(AnyPair, superClass);

    function AnyPair() {
      return AnyPair.__super__.constructor.apply(this, arguments);
    }

    AnyPair.extend(false);

    AnyPair.deriveInnerAndA();

    AnyPair.prototype.allowForwarding = false;

    AnyPair.prototype.member = ['DoubleQuote', 'SingleQuote', 'BackTick', 'CurlyBracket', 'AngleBracket', 'SquareBracket', 'Parenthesis'];

    AnyPair.prototype.getRanges = function(selection) {
      return this.member.map((function(_this) {
        return function(klass) {
          return _this["new"](klass, {
            inner: _this.inner,
            allowForwarding: _this.allowForwarding
          }).getRange(selection);
        };
      })(this)).filter(function(range) {
        return range != null;
      });
    };

    AnyPair.prototype.getRange = function(selection) {
      return _.last(sortRanges(this.getRanges(selection)));
    };

    return AnyPair;

  })(Pair);

  AnyPairAllowForwarding = (function(superClass) {
    extend(AnyPairAllowForwarding, superClass);

    function AnyPairAllowForwarding() {
      return AnyPairAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    AnyPairAllowForwarding.extend(false);

    AnyPairAllowForwarding.deriveInnerAndA();

    AnyPairAllowForwarding.description = "Range surrounded by auto-detected paired chars from enclosed and forwarding area";

    AnyPairAllowForwarding.prototype.allowForwarding = true;

    AnyPairAllowForwarding.prototype.getRange = function(selection) {
      var enclosingRange, enclosingRanges, forwardingRanges, from, ranges, ref3;
      ranges = this.getRanges(selection);
      from = selection.cursor.getBufferPosition();
      ref3 = _.partition(ranges, function(range) {
        return range.start.isGreaterThanOrEqual(from);
      }), forwardingRanges = ref3[0], enclosingRanges = ref3[1];
      enclosingRange = _.last(sortRanges(enclosingRanges));
      forwardingRanges = sortRanges(forwardingRanges);
      if (enclosingRange) {
        forwardingRanges = forwardingRanges.filter(function(range) {
          return enclosingRange.containsRange(range);
        });
      }
      return forwardingRanges[0] || enclosingRange;
    };

    return AnyPairAllowForwarding;

  })(AnyPair);

  AnyQuote = (function(superClass) {
    extend(AnyQuote, superClass);

    function AnyQuote() {
      return AnyQuote.__super__.constructor.apply(this, arguments);
    }

    AnyQuote.extend(false);

    AnyQuote.deriveInnerAndA();

    AnyQuote.prototype.allowForwarding = true;

    AnyQuote.prototype.member = ['DoubleQuote', 'SingleQuote', 'BackTick'];

    AnyQuote.prototype.getRange = function(selection) {
      var ranges;
      ranges = this.getRanges(selection);
      if (ranges.length) {
        return _.first(_.sortBy(ranges, function(r) {
          return r.end.column;
        }));
      }
    };

    return AnyQuote;

  })(AnyPair);

  Quote = (function(superClass) {
    extend(Quote, superClass);

    function Quote() {
      return Quote.__super__.constructor.apply(this, arguments);
    }

    Quote.extend(false);

    Quote.prototype.allowForwarding = true;

    return Quote;

  })(Pair);

  DoubleQuote = (function(superClass) {
    extend(DoubleQuote, superClass);

    function DoubleQuote() {
      return DoubleQuote.__super__.constructor.apply(this, arguments);
    }

    DoubleQuote.extend(false);

    DoubleQuote.deriveInnerAndA();

    DoubleQuote.prototype.pair = ['"', '"'];

    return DoubleQuote;

  })(Quote);

  SingleQuote = (function(superClass) {
    extend(SingleQuote, superClass);

    function SingleQuote() {
      return SingleQuote.__super__.constructor.apply(this, arguments);
    }

    SingleQuote.extend(false);

    SingleQuote.deriveInnerAndA();

    SingleQuote.prototype.pair = ["'", "'"];

    return SingleQuote;

  })(Quote);

  BackTick = (function(superClass) {
    extend(BackTick, superClass);

    function BackTick() {
      return BackTick.__super__.constructor.apply(this, arguments);
    }

    BackTick.extend(false);

    BackTick.deriveInnerAndA();

    BackTick.prototype.pair = ['`', '`'];

    return BackTick;

  })(Quote);

  CurlyBracket = (function(superClass) {
    extend(CurlyBracket, superClass);

    function CurlyBracket() {
      return CurlyBracket.__super__.constructor.apply(this, arguments);
    }

    CurlyBracket.extend(false);

    CurlyBracket.deriveInnerAndA();

    CurlyBracket.deriveInnerAndAForAllowForwarding();

    CurlyBracket.prototype.pair = ['{', '}'];

    return CurlyBracket;

  })(Pair);

  SquareBracket = (function(superClass) {
    extend(SquareBracket, superClass);

    function SquareBracket() {
      return SquareBracket.__super__.constructor.apply(this, arguments);
    }

    SquareBracket.extend(false);

    SquareBracket.deriveInnerAndA();

    SquareBracket.deriveInnerAndAForAllowForwarding();

    SquareBracket.prototype.pair = ['[', ']'];

    return SquareBracket;

  })(Pair);

  Parenthesis = (function(superClass) {
    extend(Parenthesis, superClass);

    function Parenthesis() {
      return Parenthesis.__super__.constructor.apply(this, arguments);
    }

    Parenthesis.extend(false);

    Parenthesis.deriveInnerAndA();

    Parenthesis.deriveInnerAndAForAllowForwarding();

    Parenthesis.prototype.pair = ['(', ')'];

    return Parenthesis;

  })(Pair);

  AngleBracket = (function(superClass) {
    extend(AngleBracket, superClass);

    function AngleBracket() {
      return AngleBracket.__super__.constructor.apply(this, arguments);
    }

    AngleBracket.extend(false);

    AngleBracket.deriveInnerAndA();

    AngleBracket.deriveInnerAndAForAllowForwarding();

    AngleBracket.prototype.pair = ['<', '>'];

    return AngleBracket;

  })(Pair);

  Tag = (function(superClass) {
    extend(Tag, superClass);

    function Tag() {
      return Tag.__super__.constructor.apply(this, arguments);
    }

    Tag.extend(false);

    Tag.deriveInnerAndA();

    Tag.prototype.allowNextLine = true;

    Tag.prototype.allowForwarding = true;

    Tag.prototype.adjustInnerRange = false;

    Tag.prototype.getTagStartPoint = function(from) {
      var pattern, tagRange;
      tagRange = null;
      pattern = TagFinder.prototype.pattern;
      this.scanForward(pattern, {
        from: [from.row, 0]
      }, function(arg) {
        var range, stop;
        range = arg.range, stop = arg.stop;
        if (range.containsPoint(from, true)) {
          tagRange = range;
          return stop();
        }
      });
      return tagRange != null ? tagRange.start : void 0;
    };

    Tag.prototype.getFinder = function() {
      return new TagFinder(this.editor, {
        allowNextLine: this.isAllowNextLine(),
        allowForwarding: this.allowForwarding
      });
    };

    Tag.prototype.getPairInfo = function(from) {
      var ref3;
      return Tag.__super__.getPairInfo.call(this, (ref3 = this.getTagStartPoint(from)) != null ? ref3 : from);
    };

    return Tag;

  })(Pair);

  Paragraph = (function(superClass) {
    extend(Paragraph, superClass);

    function Paragraph() {
      return Paragraph.__super__.constructor.apply(this, arguments);
    }

    Paragraph.extend(false);

    Paragraph.deriveInnerAndA();

    Paragraph.prototype.wise = 'linewise';

    Paragraph.prototype.supportCount = true;

    Paragraph.prototype.findRow = function(fromRow, direction, fn) {
      var foundRow, i, len, ref3, row;
      if (typeof fn.reset === "function") {
        fn.reset();
      }
      foundRow = fromRow;
      ref3 = getBufferRows(this.editor, {
        startRow: fromRow,
        direction: direction
      });
      for (i = 0, len = ref3.length; i < len; i++) {
        row = ref3[i];
        if (!fn(row, direction)) {
          break;
        }
        foundRow = row;
      }
      return foundRow;
    };

    Paragraph.prototype.findRowRangeBy = function(fromRow, fn) {
      var endRow, startRow;
      startRow = this.findRow(fromRow, 'previous', fn);
      endRow = this.findRow(fromRow, 'next', fn);
      return [startRow, endRow];
    };

    Paragraph.prototype.getPredictFunction = function(fromRow, selection) {
      var directionToExtend, flip, fromRowResult, predict;
      fromRowResult = this.editor.isBufferRowBlank(fromRow);
      if (this.isInner()) {
        predict = (function(_this) {
          return function(row, direction) {
            return _this.editor.isBufferRowBlank(row) === fromRowResult;
          };
        })(this);
      } else {
        if (selection.isReversed()) {
          directionToExtend = 'previous';
        } else {
          directionToExtend = 'next';
        }
        flip = false;
        predict = (function(_this) {
          return function(row, direction) {
            var result;
            result = _this.editor.isBufferRowBlank(row) === fromRowResult;
            if (flip) {
              return !result;
            } else {
              if ((!result) && (direction === directionToExtend)) {
                flip = true;
                return true;
              }
              return result;
            }
          };
        })(this);
        predict.reset = function() {
          return flip = false;
        };
      }
      return predict;
    };

    Paragraph.prototype.getRange = function(selection) {
      var fromRow, originalRange, rowRange;
      originalRange = selection.getBufferRange();
      fromRow = this.getCursorPositionForSelection(selection).row;
      if (this.isMode('visual', 'linewise')) {
        if (selection.isReversed()) {
          fromRow--;
        } else {
          fromRow++;
        }
        fromRow = getValidVimBufferRow(this.editor, fromRow);
      }
      rowRange = this.findRowRangeBy(fromRow, this.getPredictFunction(fromRow, selection));
      return selection.getBufferRange().union(this.getBufferRangeForRowRange(rowRange));
    };

    return Paragraph;

  })(TextObject);

  Indentation = (function(superClass) {
    extend(Indentation, superClass);

    function Indentation() {
      return Indentation.__super__.constructor.apply(this, arguments);
    }

    Indentation.extend(false);

    Indentation.deriveInnerAndA();

    Indentation.prototype.getRange = function(selection) {
      var baseIndentLevel, fromRow, predict, rowRange;
      fromRow = this.getCursorPositionForSelection(selection).row;
      baseIndentLevel = this.getIndentLevelForBufferRow(fromRow);
      predict = (function(_this) {
        return function(row) {
          if (_this.editor.isBufferRowBlank(row)) {
            return _this.isA();
          } else {
            return _this.getIndentLevelForBufferRow(row) >= baseIndentLevel;
          }
        };
      })(this);
      rowRange = this.findRowRangeBy(fromRow, predict);
      return this.getBufferRangeForRowRange(rowRange);
    };

    return Indentation;

  })(Paragraph);

  Comment = (function(superClass) {
    extend(Comment, superClass);

    function Comment() {
      return Comment.__super__.constructor.apply(this, arguments);
    }

    Comment.extend(false);

    Comment.deriveInnerAndA();

    Comment.prototype.wise = 'linewise';

    Comment.prototype.getRange = function(selection) {
      var row, rowRange;
      row = this.getCursorPositionForSelection(selection).row;
      rowRange = this.editor.languageMode.rowRangeForCommentAtBufferRow(row);
      if (this.editor.isBufferRowCommented(row)) {
        if (rowRange == null) {
          rowRange = [row, row];
        }
      }
      if (rowRange != null) {
        return this.getBufferRangeForRowRange(rowRange);
      }
    };

    return Comment;

  })(TextObject);

  CommentOrParagraph = (function(superClass) {
    extend(CommentOrParagraph, superClass);

    function CommentOrParagraph() {
      return CommentOrParagraph.__super__.constructor.apply(this, arguments);
    }

    CommentOrParagraph.extend(false);

    CommentOrParagraph.deriveInnerAndA();

    CommentOrParagraph.prototype.wise = 'linewise';

    CommentOrParagraph.prototype.getRange = function(selection) {
      var i, klass, len, range, ref3;
      ref3 = ['Comment', 'Paragraph'];
      for (i = 0, len = ref3.length; i < len; i++) {
        klass = ref3[i];
        if (range = this["new"](klass, {
          inner: this.inner
        }).getRange(selection)) {
          return range;
        }
      }
    };

    return CommentOrParagraph;

  })(TextObject);

  Fold = (function(superClass) {
    extend(Fold, superClass);

    function Fold() {
      return Fold.__super__.constructor.apply(this, arguments);
    }

    Fold.extend(false);

    Fold.deriveInnerAndA();

    Fold.prototype.wise = 'linewise';

    Fold.prototype.adjustRowRange = function(rowRange) {
      var endRow, startRow;
      if (this.isA()) {
        return rowRange;
      }
      startRow = rowRange[0], endRow = rowRange[1];
      if (this.getIndentLevelForBufferRow(startRow) === this.getIndentLevelForBufferRow(endRow)) {
        endRow -= 1;
      }
      startRow += 1;
      return [startRow, endRow];
    };

    Fold.prototype.getFoldRowRangesContainsForRow = function(row) {
      return getCodeFoldRowRangesContainesForRow(this.editor, row).reverse();
    };

    Fold.prototype.getRange = function(selection) {
      var i, len, range, ref3, row, rowRange, selectedRange;
      row = this.getCursorPositionForSelection(selection).row;
      selectedRange = selection.getBufferRange();
      ref3 = this.getFoldRowRangesContainsForRow(row);
      for (i = 0, len = ref3.length; i < len; i++) {
        rowRange = ref3[i];
        range = this.getBufferRangeForRowRange(this.adjustRowRange(rowRange));
        if (!selectedRange.containsRange(range)) {
          return range;
        }
      }
    };

    return Fold;

  })(TextObject);

  Function = (function(superClass) {
    extend(Function, superClass);

    function Function() {
      return Function.__super__.constructor.apply(this, arguments);
    }

    Function.extend(false);

    Function.deriveInnerAndA();

    Function.prototype.scopeNamesOmittingEndRow = ['source.go', 'source.elixir'];

    Function.prototype.getFoldRowRangesContainsForRow = function(row) {
      return (Function.__super__.getFoldRowRangesContainsForRow.apply(this, arguments)).filter((function(_this) {
        return function(rowRange) {
          return isIncludeFunctionScopeForRow(_this.editor, rowRange[0]);
        };
      })(this));
    };

    Function.prototype.adjustRowRange = function(rowRange) {
      var endRow, ref3, ref4, startRow;
      ref3 = Function.__super__.adjustRowRange.apply(this, arguments), startRow = ref3[0], endRow = ref3[1];
      if (this.isA() && (ref4 = this.editor.getGrammar().scopeName, indexOf.call(this.scopeNamesOmittingEndRow, ref4) >= 0)) {
        endRow += 1;
      }
      return [startRow, endRow];
    };

    return Function;

  })(Fold);

  CurrentLine = (function(superClass) {
    extend(CurrentLine, superClass);

    function CurrentLine() {
      return CurrentLine.__super__.constructor.apply(this, arguments);
    }

    CurrentLine.extend(false);

    CurrentLine.deriveInnerAndA();

    CurrentLine.prototype.getRange = function(selection) {
      var range, row;
      row = this.getCursorPositionForSelection(selection).row;
      range = this.editor.bufferRangeForBufferRow(row);
      if (this.isA()) {
        return range;
      } else {
        return trimRange(this.editor, range);
      }
    };

    return CurrentLine;

  })(TextObject);

  Entire = (function(superClass) {
    extend(Entire, superClass);

    function Entire() {
      return Entire.__super__.constructor.apply(this, arguments);
    }

    Entire.extend(false);

    Entire.deriveInnerAndA();

    Entire.prototype.wise = 'linewise';

    Entire.prototype.selectOnce = true;

    Entire.prototype.getRange = function(selection) {
      return this.editor.buffer.getRange();
    };

    return Entire;

  })(TextObject);

  Empty = (function(superClass) {
    extend(Empty, superClass);

    function Empty() {
      return Empty.__super__.constructor.apply(this, arguments);
    }

    Empty.extend(false);

    Empty.prototype.selectOnce = true;

    return Empty;

  })(TextObject);

  LatestChange = (function(superClass) {
    extend(LatestChange, superClass);

    function LatestChange() {
      return LatestChange.__super__.constructor.apply(this, arguments);
    }

    LatestChange.extend(false);

    LatestChange.deriveInnerAndA();

    LatestChange.prototype.wise = null;

    LatestChange.prototype.selectOnce = true;

    LatestChange.prototype.getRange = function(selection) {
      var end, start;
      start = this.vimState.mark.get('[');
      end = this.vimState.mark.get(']');
      if ((start != null) && (end != null)) {
        return new Range(start, end);
      }
    };

    return LatestChange;

  })(TextObject);

  SearchMatchForward = (function(superClass) {
    extend(SearchMatchForward, superClass);

    function SearchMatchForward() {
      return SearchMatchForward.__super__.constructor.apply(this, arguments);
    }

    SearchMatchForward.extend();

    SearchMatchForward.prototype.backward = false;

    SearchMatchForward.prototype.findMatch = function(fromPoint, pattern) {
      var found;
      if (this.mode === 'visual') {
        fromPoint = translatePointAndClip(this.editor, fromPoint, "forward");
      }
      found = null;
      this.scanForward(pattern, {
        from: [fromPoint.row, 0]
      }, function(arg) {
        var range, stop;
        range = arg.range, stop = arg.stop;
        if (range.end.isGreaterThan(fromPoint)) {
          found = range;
          return stop();
        }
      });
      return {
        range: found,
        whichIsHead: 'end'
      };
    };

    SearchMatchForward.prototype.getRange = function(selection) {
      var fromPoint, pattern, range, ref3, whichIsHead;
      pattern = this.globalState.get('lastSearchPattern');
      if (pattern == null) {
        return;
      }
      fromPoint = selection.getHeadBufferPosition();
      ref3 = this.findMatch(fromPoint, pattern), range = ref3.range, whichIsHead = ref3.whichIsHead;
      if (range != null) {
        return this.unionRangeAndDetermineReversedState(selection, range, whichIsHead);
      }
    };

    SearchMatchForward.prototype.unionRangeAndDetermineReversedState = function(selection, found, whichIsHead) {
      var head, tail;
      if (selection.isEmpty()) {
        return found;
      } else {
        head = found[whichIsHead];
        tail = selection.getTailBufferPosition();
        if (this.backward) {
          if (tail.isLessThan(head)) {
            head = translatePointAndClip(this.editor, head, 'forward');
          }
        } else {
          if (head.isLessThan(tail)) {
            head = translatePointAndClip(this.editor, head, 'backward');
          }
        }
        this.reversed = head.isLessThan(tail);
        return new Range(tail, head).union(swrap(selection).getTailBufferRange());
      }
    };

    SearchMatchForward.prototype.selectTextObject = function(selection) {
      var range, ref3;
      if (range = this.getRange(selection)) {
        swrap(selection).setBufferRange(range, {
          reversed: (ref3 = this.reversed) != null ? ref3 : this.backward
        });
        return true;
      }
    };

    return SearchMatchForward;

  })(TextObject);

  SearchMatchBackward = (function(superClass) {
    extend(SearchMatchBackward, superClass);

    function SearchMatchBackward() {
      return SearchMatchBackward.__super__.constructor.apply(this, arguments);
    }

    SearchMatchBackward.extend();

    SearchMatchBackward.prototype.backward = true;

    SearchMatchBackward.prototype.findMatch = function(fromPoint, pattern) {
      var found;
      if (this.mode === 'visual') {
        fromPoint = translatePointAndClip(this.editor, fromPoint, "backward");
      }
      found = null;
      this.scanBackward(pattern, {
        from: [fromPoint.row, 2e308]
      }, function(arg) {
        var range, stop;
        range = arg.range, stop = arg.stop;
        if (range.start.isLessThan(fromPoint)) {
          found = range;
          return stop();
        }
      });
      return {
        range: found,
        whichIsHead: 'start'
      };
    };

    return SearchMatchBackward;

  })(SearchMatchForward);

  PreviousSelection = (function(superClass) {
    extend(PreviousSelection, superClass);

    function PreviousSelection() {
      return PreviousSelection.__super__.constructor.apply(this, arguments);
    }

    PreviousSelection.extend();

    PreviousSelection.prototype.wise = null;

    PreviousSelection.prototype.selectOnce = true;

    PreviousSelection.prototype.selectTextObject = function(selection) {
      var properties, ref3, submode;
      ref3 = this.vimState.previousSelection, properties = ref3.properties, submode = ref3.submode;
      if ((properties != null) && (submode != null)) {
        this.wise = submode;
        swrap(this.editor.getLastSelection()).selectByProperties(properties);
        return true;
      }
    };

    return PreviousSelection;

  })(TextObject);

  PersistentSelection = (function(superClass) {
    extend(PersistentSelection, superClass);

    function PersistentSelection() {
      return PersistentSelection.__super__.constructor.apply(this, arguments);
    }

    PersistentSelection.extend(false);

    PersistentSelection.deriveInnerAndA();

    PersistentSelection.prototype.wise = null;

    PersistentSelection.prototype.selectOnce = true;

    PersistentSelection.prototype.selectTextObject = function(selection) {
      if (this.vimState.hasPersistentSelections()) {
        this.vimState.persistentSelection.setSelectedBufferRanges();
        return true;
      }
    };

    return PersistentSelection;

  })(TextObject);

  VisibleArea = (function(superClass) {
    extend(VisibleArea, superClass);

    function VisibleArea() {
      return VisibleArea.__super__.constructor.apply(this, arguments);
    }

    VisibleArea.extend(false);

    VisibleArea.deriveInnerAndA();

    VisibleArea.prototype.selectOnce = true;

    VisibleArea.prototype.getRange = function(selection) {
      var bufferRange;
      bufferRange = getVisibleBufferRange(this.editor);
      if (bufferRange.getRows() > this.editor.getRowsPerPage()) {
        return bufferRange.translate([+1, 0], [-3, 0]);
      } else {
        return bufferRange;
      }
    };

    return VisibleArea;

  })(TextObject);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvdGV4dC1vYmplY3QuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwwdUJBQUE7SUFBQTs7OztFQUFBLE1BQWlCLE9BQUEsQ0FBUSxNQUFSLENBQWpCLEVBQUMsaUJBQUQsRUFBUTs7RUFDUixDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUtKLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFDUCxLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSOztFQUNSLE9BWUksT0FBQSxDQUFRLFNBQVIsQ0FaSixFQUNFLDhEQURGLEVBRUUsOEVBRkYsRUFHRSxnRUFIRixFQUlFLHdEQUpGLEVBS0Usa0RBTEYsRUFNRSxrREFORixFQU9FLGtDQVBGLEVBUUUsZ0RBUkYsRUFTRSwwQkFURixFQVVFLDRCQVZGLEVBV0U7O0VBRUYsT0FBMEMsT0FBQSxDQUFRLHNCQUFSLENBQTFDLEVBQUMsa0NBQUQsRUFBZ0IsOEJBQWhCLEVBQTZCOztFQUV2Qjs7O0lBQ0osVUFBQyxDQUFBLE1BQUQsQ0FBUSxLQUFSOztJQUNBLFVBQUMsQ0FBQSxhQUFELEdBQWdCOzt5QkFDaEIsSUFBQSxHQUFNOzt5QkFDTixZQUFBLEdBQWM7O3lCQUNkLFVBQUEsR0FBWTs7SUFFWixVQUFDLENBQUEsZUFBRCxHQUFrQixTQUFBO01BQ2hCLElBQUMsQ0FBQSxhQUFELENBQWUsR0FBQSxHQUFNLElBQUMsQ0FBQSxJQUF0QixFQUE0QixLQUE1QjthQUNBLElBQUMsQ0FBQSxhQUFELENBQWUsT0FBQSxHQUFVLElBQUMsQ0FBQSxJQUExQixFQUFnQyxJQUFoQztJQUZnQjs7SUFJbEIsVUFBQyxDQUFBLGlDQUFELEdBQW9DLFNBQUE7TUFDbEMsSUFBQyxDQUFBLGFBQUQsQ0FBZSxHQUFBLEdBQU0sSUFBQyxDQUFBLElB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Q0FBQTtBQUNBLGVBQU8sS0FGVDs7SUFEZ0I7Ozs7S0FOYzs7RUFXNUI7Ozs7Ozs7SUFDSixXQUFDLENBQUEsTUFBRCxDQUFRLEtBQVI7O0lBQ0EsV0FBQyxDQUFBLGVBQUQsQ0FBQTs7MEJBQ0EsVUFBQSxHQUFZOzswQkFFWixRQUFBLEdBQVUsU0FBQyxTQUFEO0FBR1IsVUFBQTtNQUFBLFdBQUEsR0FBYyxxQkFBQSxDQUFzQixJQUFDLENBQUEsTUFBdkI7TUFDZCxJQUFHLFdBQVcsQ0FBQyxPQUFaLENBQUEsQ0FBQSxHQUF3QixJQUFDLENBQUEsTUFBTSxDQUFDLGNBQVIsQ0FBQSxDQUEzQjtlQUNFLFdBQVcsQ0FBQyxTQUFaLENBQXNCLENBQUMsQ0FBQyxDQUFGLEVBQUssQ0FBTCxDQUF0QixFQUErQixDQUFDLENBQUMsQ0FBRixFQUFLLENBQUwsQ0FBL0IsRUFERjtPQUFBLE1BQUE7ZUFHRSxZQUhGOztJQUpROzs7O0tBTGM7QUEvbEIxQiIsInNvdXJjZXNDb250ZW50IjpbIntSYW5nZSwgUG9pbnR9ID0gcmVxdWlyZSAnYXRvbSdcbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5cbiMgW1RPRE9dIE5lZWQgb3ZlcmhhdWxcbiMgIC0gWyBdIE1ha2UgZXhwYW5kYWJsZSBieSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS51bmlvbihAZ2V0UmFuZ2Uoc2VsZWN0aW9uKSlcbiMgIC0gWyBdIENvdW50IHN1cHBvcnQocHJpb3JpdHkgbG93KT9cbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG5zd3JhcCA9IHJlcXVpcmUgJy4vc2VsZWN0aW9uLXdyYXBwZXInXG57XG4gIGdldExpbmVUZXh0VG9CdWZmZXJQb3NpdGlvblxuICBnZXRDb2RlRm9sZFJvd1Jhbmdlc0NvbnRhaW5lc0ZvclJvd1xuICBpc0luY2x1ZGVGdW5jdGlvblNjb3BlRm9yUm93XG4gIGV4cGFuZFJhbmdlVG9XaGl0ZVNwYWNlc1xuICBnZXRWaXNpYmxlQnVmZmVyUmFuZ2VcbiAgdHJhbnNsYXRlUG9pbnRBbmRDbGlwXG4gIGdldEJ1ZmZlclJvd3NcbiAgZ2V0VmFsaWRWaW1CdWZmZXJSb3dcbiAgdHJpbVJhbmdlXG4gIHNvcnRSYW5nZXNcbiAgcG9pbnRJc0F0RW5kT2ZMaW5lXG59ID0gcmVxdWlyZSAnLi91dGlscydcbntCcmFja2V0RmluZGVyLCBRdW90ZUZpbmRlciwgVGFnRmluZGVyfSA9IHJlcXVpcmUgJy4vcGFpci1maW5kZXIuY29mZmVlJ1xuXG5jbGFzcyBUZXh0T2JqZWN0IGV4dGVuZHMgQmFzZVxuICBAZXh0ZW5kKGZhbHNlKVxuICBAb3BlcmF0aW9uS2luZDogJ3RleHQtb2JqZWN0J1xuICB3aXNlOiAnY2hhcmFjdGVyd2lzZSdcbiAgc3VwcG9ydENvdW50OiBmYWxzZSAjIEZJWE1FICM0NzIsICM2NlxuICBzZWxlY3RPbmNlOiBmYWxzZVxuXG4gIEBkZXJpdmVJbm5lckFuZEE6IC0+XG4gICAgQGdlbmVyYXRlQ2xhc3MoXCJBXCIgKyBAbmFtZSwgZmFsc2UpXG4gICAgQGdlbmVyYXRlQ2xhc3MoXCJJbm5lclwiICsgQG5hbWUsIHRydWUpXG5cbiAgQGRlcml2ZUlubmVyQW5kQUZvckFsbG93Rm9yd2FyZGluZzogLT5cbiAgICBAZ2VuZXJhdGVDbGFzcyhcIkFcIiArIEBuYW1lICsgXCJBbGxvd0ZvcndhcmRpbmdcIiwgZmFsc2UsIHRydWUpXG4gICAgQGdlbmVyYXRlQ2xhc3MoXCJJbm5lclwiICsgQG5hbWUgKyBcIkFsbG93Rm9yd2FyZGluZ1wiLCB0cnVlLCB0cnVlKVxuXG4gIEBnZW5lcmF0ZUNsYXNzOiAoa2xhc3NOYW1lLCBpbm5lciwgYWxsb3dGb3J3YXJkaW5nKSAtPlxuICAgIGtsYXNzID0gY2xhc3MgZXh0ZW5kcyB0aGlzXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5IGtsYXNzLCAnbmFtZScsIGdldDogLT4ga2xhc3NOYW1lXG4gICAga2xhc3M6OmlubmVyID0gaW5uZXJcbiAgICBrbGFzczo6YWxsb3dGb3J3YXJkaW5nID0gdHJ1ZSBpZiBhbGxvd0ZvcndhcmRpbmdcbiAgICBrbGFzcy5leHRlbmQoKVxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHN1cGVyXG4gICAgQGluaXRpYWxpemUoKVxuXG4gIGlzSW5uZXI6IC0+XG4gICAgQGlubmVyXG5cbiAgaXNBOiAtPlxuICAgIG5vdCBAaW5uZXJcblxuICBpc0xpbmV3aXNlOiAtPiBAd2lzZSBpcyAnbGluZXdpc2UnXG4gIGlzQmxvY2t3aXNlOiAtPiBAd2lzZSBpcyAnYmxvY2t3aXNlJ1xuXG4gIGZvcmNlV2lzZTogKHdpc2UpIC0+XG4gICAgQHdpc2UgPSB3aXNlICMgRklYTUUgY3VycmVudGx5IG5vdCB3ZWxsIHN1cHBvcnRlZFxuXG4gIHJlc2V0U3RhdGU6IC0+XG4gICAgQHNlbGVjdFN1Y2NlZWRlZCA9IG51bGxcblxuICBleGVjdXRlOiAtPlxuICAgIEByZXNldFN0YXRlKClcblxuICAgICMgV2hlbm5ldmVyIFRleHRPYmplY3QgaXMgZXhlY3V0ZWQsIGl0IGhhcyBAb3BlcmF0b3JcbiAgICAjIENhbGxlZCBmcm9tIE9wZXJhdG9yOjpzZWxlY3RUYXJnZXQoKVxuICAgICMgIC0gYHYgaSBwYCwgaXMgYFNlbGVjdGAgb3BlcmF0b3Igd2l0aCBAdGFyZ2V0ID0gYElubmVyUGFyYWdyYXBoYC5cbiAgICAjICAtIGBkIGkgcGAsIGlzIGBEZWxldGVgIG9wZXJhdG9yIHdpdGggQHRhcmdldCA9IGBJbm5lclBhcmFncmFwaGAuXG4gICAgaWYgQG9wZXJhdG9yP1xuICAgICAgQHNlbGVjdCgpXG4gICAgZWxzZVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbiBUZXh0T2JqZWN0OiBNdXN0IG5vdCBoYXBwZW4nKVxuXG4gIHNlbGVjdDogLT5cbiAgICBpZiBAaXNNb2RlKCd2aXN1YWwnLCAnYmxvY2t3aXNlJylcbiAgICAgIHN3cmFwLm5vcm1hbGl6ZShAZWRpdG9yKVxuXG4gICAgQGNvdW50VGltZXMgQGdldENvdW50KCksICh7c3RvcH0pID0+XG4gICAgICBzdG9wKCkgdW5sZXNzIEBzdXBwb3J0Q291bnQgIyBxdWljay1maXggZm9yICM1NjBcbiAgICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgb2xkUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgICBpZiBAc2VsZWN0VGV4dE9iamVjdChzZWxlY3Rpb24pXG4gICAgICAgICAgQHNlbGVjdFN1Y2NlZWRlZCA9IHRydWVcbiAgICAgICAgc3RvcCgpIGlmIHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLmlzRXF1YWwob2xkUmFuZ2UpXG4gICAgICAgIGJyZWFrIGlmIEBzZWxlY3RPbmNlXG5cbiAgICBAZWRpdG9yLm1lcmdlSW50ZXJzZWN0aW5nU2VsZWN0aW9ucygpXG4gICAgIyBTb21lIFRleHRPYmplY3QncyB3aXNlIGlzIE5PVCBkZXRlcm1pbmlzdGljLiBJdCBoYXMgdG8gYmUgZGV0ZWN0ZWQgZnJvbSBzZWxlY3RlZCByYW5nZS5cbiAgICBAd2lzZSA/PSBzd3JhcC5kZXRlY3RXaXNlKEBlZGl0b3IpXG5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgaWYgQHNlbGVjdFN1Y2NlZWRlZFxuICAgICAgICBzd2l0Y2ggQHdpc2VcbiAgICAgICAgICB3aGVuICdjaGFyYWN0ZXJ3aXNlJ1xuICAgICAgICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcygpIGZvciAkc2VsZWN0aW9uIGluIHN3cmFwLmdldFNlbGVjdGlvbnMoQGVkaXRvcilcbiAgICAgICAgICB3aGVuICdsaW5ld2lzZSdcbiAgICAgICAgICAgICMgV2hlbiB0YXJnZXQgaXMgcGVyc2lzdGVudC1zZWxlY3Rpb24sIG5ldyBzZWxlY3Rpb24gaXMgYWRkZWQgYWZ0ZXIgc2VsZWN0VGV4dE9iamVjdC5cbiAgICAgICAgICAgICMgU28gd2UgaGF2ZSB0byBhc3N1cmUgYWxsIHNlbGVjdGlvbiBoYXZlIHNlbGN0aW9uIHByb3BlcnR5LlxuICAgICAgICAgICAgIyBNYXliZSB0aGlzIGxvZ2ljIGNhbiBiZSBtb3ZlZCB0byBvcGVyYXRpb24gc3RhY2suXG4gICAgICAgICAgICBmb3IgJHNlbGVjdGlvbiBpbiBzd3JhcC5nZXRTZWxlY3Rpb25zKEBlZGl0b3IpXG4gICAgICAgICAgICAgIGlmIEBnZXRDb25maWcoJ2tlZXBDb2x1bW5PblNlbGVjdFRleHRPYmplY3QnKVxuICAgICAgICAgICAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKSB1bmxlc3MgJHNlbGVjdGlvbi5oYXNQcm9wZXJ0aWVzKClcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKVxuICAgICAgICAgICAgICAkc2VsZWN0aW9uLmZpeFByb3BlcnR5Um93VG9Sb3dSYW5nZSgpXG5cbiAgICAgIGlmIEBzdWJtb2RlIGlzICdibG9ja3dpc2UnXG4gICAgICAgIGZvciAkc2VsZWN0aW9uIGluIHN3cmFwLmdldFNlbGVjdGlvbnMoQGVkaXRvcilcbiAgICAgICAgICAkc2VsZWN0aW9uLm5vcm1hbGl6ZSgpXG4gICAgICAgICAgJHNlbGVjdGlvbi5hcHBseVdpc2UoJ2Jsb2Nrd2lzZScpXG5cbiAgIyBSZXR1cm4gdHJ1ZSBvciBmYWxzZVxuICBzZWxlY3RUZXh0T2JqZWN0OiAoc2VsZWN0aW9uKSAtPlxuICAgIGlmIHJhbmdlID0gQGdldFJhbmdlKHNlbGVjdGlvbilcbiAgICAgIHN3cmFwKHNlbGVjdGlvbikuc2V0QnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gICMgdG8gb3ZlcnJpZGVcbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgbnVsbFxuXG4jIFNlY3Rpb246IFdvcmRcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgV29yZCBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgcG9pbnQgPSBAZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIHtyYW5nZX0gPSBAZ2V0V29yZEJ1ZmZlclJhbmdlQW5kS2luZEF0QnVmZmVyUG9zaXRpb24ocG9pbnQsIHtAd29yZFJlZ2V4fSlcbiAgICBpZiBAaXNBKClcbiAgICAgIGV4cGFuZFJhbmdlVG9XaGl0ZVNwYWNlcyhAZWRpdG9yLCByYW5nZSlcbiAgICBlbHNlXG4gICAgICByYW5nZVxuXG5jbGFzcyBXaG9sZVdvcmQgZXh0ZW5kcyBXb3JkXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICB3b3JkUmVnZXg6IC9cXFMrL1xuXG4jIEp1c3QgaW5jbHVkZSBfLCAtXG5jbGFzcyBTbWFydFdvcmQgZXh0ZW5kcyBXb3JkXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICBAZGVzY3JpcHRpb246IFwiQSB3b3JkIHRoYXQgY29uc2lzdHMgb2YgYWxwaGFudW1lcmljIGNoYXJzKGAvW0EtWmEtejAtOV9dL2ApIGFuZCBoeXBoZW4gYC1gXCJcbiAgd29yZFJlZ2V4OiAvW1xcdy1dKy9cblxuIyBKdXN0IGluY2x1ZGUgXywgLVxuY2xhc3MgU3Vid29yZCBleHRlbmRzIFdvcmRcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIEB3b3JkUmVnZXggPSBzZWxlY3Rpb24uY3Vyc29yLnN1YndvcmRSZWdFeHAoKVxuICAgIHN1cGVyXG5cbiMgU2VjdGlvbjogUGFpclxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBQYWlyIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuICBzdXBwb3J0Q291bnQ6IHRydWVcbiAgYWxsb3dOZXh0TGluZTogbnVsbFxuICBhZGp1c3RJbm5lclJhbmdlOiB0cnVlXG4gIHBhaXI6IG51bGxcblxuICBpc0FsbG93TmV4dExpbmU6IC0+XG4gICAgQGFsbG93TmV4dExpbmUgPyAoQHBhaXI/IGFuZCBAcGFpclswXSBpc250IEBwYWlyWzFdKVxuXG4gIGFkanVzdFJhbmdlOiAoe3N0YXJ0LCBlbmR9KSAtPlxuICAgICMgRGlydHkgd29yayB0byBmZWVsIG5hdHVyYWwgZm9yIGh1bWFuLCB0byBiZWhhdmUgY29tcGF0aWJsZSB3aXRoIHB1cmUgVmltLlxuICAgICMgV2hlcmUgdGhpcyBhZGp1c3RtZW50IGFwcGVhciBpcyBpbiBmb2xsb3dpbmcgc2l0dWF0aW9uLlxuICAgICMgb3AtMTogYGNpe2AgcmVwbGFjZSBvbmx5IDJuZCBsaW5lXG4gICAgIyBvcC0yOiBgZGl7YCBkZWxldGUgb25seSAybmQgbGluZS5cbiAgICAjIHRleHQ6XG4gICAgIyAge1xuICAgICMgICAgYWFhXG4gICAgIyAgfVxuICAgIGlmIHBvaW50SXNBdEVuZE9mTGluZShAZWRpdG9yLCBzdGFydClcbiAgICAgIHN0YXJ0ID0gc3RhcnQudHJhdmVyc2UoWzEsIDBdKVxuXG4gICAgaWYgZ2V0TGluZVRleHRUb0J1ZmZlclBvc2l0aW9uKEBlZGl0b3IsIGVuZCkubWF0Y2goL15cXHMqJC8pXG4gICAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgICAjIFRoaXMgaXMgc2xpZ2h0bHkgaW5uY29uc2lzdGVudCB3aXRoIHJlZ3VsYXIgVmltXG4gICAgICAgICMgLSByZWd1bGFyIFZpbTogc2VsZWN0IG5ldyBsaW5lIGFmdGVyIEVPTFxuICAgICAgICAjIC0gdmltLW1vZGUtcGx1czogc2VsZWN0IHRvIEVPTChiZWZvcmUgbmV3IGxpbmUpXG4gICAgICAgICMgVGhpcyBpcyBpbnRlbnRpb25hbCBzaW5jZSB0byBtYWtlIHN1Ym1vZGUgYGNoYXJhY3Rlcndpc2VgIHdoZW4gYXV0by1kZXRlY3Qgc3VibW9kZVxuICAgICAgICAjIGlubmVyRW5kID0gbmV3IFBvaW50KGlubmVyRW5kLnJvdyAtIDEsIEluZmluaXR5KVxuICAgICAgICBlbmQgPSBuZXcgUG9pbnQoZW5kLnJvdyAtIDEsIEluZmluaXR5KVxuICAgICAgZWxzZVxuICAgICAgICBlbmQgPSBuZXcgUG9pbnQoZW5kLnJvdywgMClcblxuICAgIG5ldyBSYW5nZShzdGFydCwgZW5kKVxuXG4gIGdldEZpbmRlcjogLT5cbiAgICBvcHRpb25zID0ge2FsbG93TmV4dExpbmU6IEBpc0FsbG93TmV4dExpbmUoKSwgQGFsbG93Rm9yd2FyZGluZywgQHBhaXJ9XG4gICAgaWYgQHBhaXJbMF0gaXMgQHBhaXJbMV1cbiAgICAgIG5ldyBRdW90ZUZpbmRlcihAZWRpdG9yLCBvcHRpb25zKVxuICAgIGVsc2VcbiAgICAgIG5ldyBCcmFja2V0RmluZGVyKEBlZGl0b3IsIG9wdGlvbnMpXG5cbiAgZ2V0UGFpckluZm86IChmcm9tKSAtPlxuICAgIHBhaXJJbmZvID0gQGdldEZpbmRlcigpLmZpbmQoZnJvbSlcbiAgICB1bmxlc3MgcGFpckluZm8/XG4gICAgICByZXR1cm4gbnVsbFxuICAgIHBhaXJJbmZvLmlubmVyUmFuZ2UgPSBAYWRqdXN0UmFuZ2UocGFpckluZm8uaW5uZXJSYW5nZSkgaWYgQGFkanVzdElubmVyUmFuZ2VcbiAgICBwYWlySW5mby50YXJnZXRSYW5nZSA9IGlmIEBpc0lubmVyKCkgdGhlbiBwYWlySW5mby5pbm5lclJhbmdlIGVsc2UgcGFpckluZm8uYVJhbmdlXG4gICAgcGFpckluZm9cblxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICBvcmlnaW5hbFJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICBwYWlySW5mbyA9IEBnZXRQYWlySW5mbyhAZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKSlcbiAgICAjIFdoZW4gcmFuZ2Ugd2FzIHNhbWUsIHRyeSB0byBleHBhbmQgcmFuZ2VcbiAgICBpZiBwYWlySW5mbz8udGFyZ2V0UmFuZ2UuaXNFcXVhbChvcmlnaW5hbFJhbmdlKVxuICAgICAgcGFpckluZm8gPSBAZ2V0UGFpckluZm8ocGFpckluZm8uYVJhbmdlLmVuZClcbiAgICBwYWlySW5mbz8udGFyZ2V0UmFuZ2VcblxuIyBVc2VkIGJ5IERlbGV0ZVN1cnJvdW5kXG5jbGFzcyBBUGFpciBleHRlbmRzIFBhaXJcbiAgQGV4dGVuZChmYWxzZSlcblxuY2xhc3MgQW55UGFpciBleHRlbmRzIFBhaXJcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIGFsbG93Rm9yd2FyZGluZzogZmFsc2VcbiAgbWVtYmVyOiBbXG4gICAgJ0RvdWJsZVF1b3RlJywgJ1NpbmdsZVF1b3RlJywgJ0JhY2tUaWNrJyxcbiAgICAnQ3VybHlCcmFja2V0JywgJ0FuZ2xlQnJhY2tldCcsICdTcXVhcmVCcmFja2V0JywgJ1BhcmVudGhlc2lzJ1xuICBdXG5cbiAgZ2V0UmFuZ2VzOiAoc2VsZWN0aW9uKSAtPlxuICAgIEBtZW1iZXJcbiAgICAgIC5tYXAgKGtsYXNzKSA9PiBAbmV3KGtsYXNzLCB7QGlubmVyLCBAYWxsb3dGb3J3YXJkaW5nfSkuZ2V0UmFuZ2Uoc2VsZWN0aW9uKVxuICAgICAgLmZpbHRlciAocmFuZ2UpIC0+IHJhbmdlP1xuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIF8ubGFzdChzb3J0UmFuZ2VzKEBnZXRSYW5nZXMoc2VsZWN0aW9uKSkpXG5cbmNsYXNzIEFueVBhaXJBbGxvd0ZvcndhcmRpbmcgZXh0ZW5kcyBBbnlQYWlyXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICBAZGVzY3JpcHRpb246IFwiUmFuZ2Ugc3Vycm91bmRlZCBieSBhdXRvLWRldGVjdGVkIHBhaXJlZCBjaGFycyBmcm9tIGVuY2xvc2VkIGFuZCBmb3J3YXJkaW5nIGFyZWFcIlxuICBhbGxvd0ZvcndhcmRpbmc6IHRydWVcbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgcmFuZ2VzID0gQGdldFJhbmdlcyhzZWxlY3Rpb24pXG4gICAgZnJvbSA9IHNlbGVjdGlvbi5jdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgIFtmb3J3YXJkaW5nUmFuZ2VzLCBlbmNsb3NpbmdSYW5nZXNdID0gXy5wYXJ0aXRpb24gcmFuZ2VzLCAocmFuZ2UpIC0+XG4gICAgICByYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuT3JFcXVhbChmcm9tKVxuICAgIGVuY2xvc2luZ1JhbmdlID0gXy5sYXN0KHNvcnRSYW5nZXMoZW5jbG9zaW5nUmFuZ2VzKSlcbiAgICBmb3J3YXJkaW5nUmFuZ2VzID0gc29ydFJhbmdlcyhmb3J3YXJkaW5nUmFuZ2VzKVxuXG4gICAgIyBXaGVuIGVuY2xvc2luZ1JhbmdlIGlzIGV4aXN0cyxcbiAgICAjIFdlIGRvbid0IGdvIGFjcm9zcyBlbmNsb3NpbmdSYW5nZS5lbmQuXG4gICAgIyBTbyBjaG9vc2UgZnJvbSByYW5nZXMgY29udGFpbmVkIGluIGVuY2xvc2luZ1JhbmdlLlxuICAgIGlmIGVuY2xvc2luZ1JhbmdlXG4gICAgICBmb3J3YXJkaW5nUmFuZ2VzID0gZm9yd2FyZGluZ1Jhbmdlcy5maWx0ZXIgKHJhbmdlKSAtPlxuICAgICAgICBlbmNsb3NpbmdSYW5nZS5jb250YWluc1JhbmdlKHJhbmdlKVxuXG4gICAgZm9yd2FyZGluZ1Jhbmdlc1swXSBvciBlbmNsb3NpbmdSYW5nZVxuXG5jbGFzcyBBbnlRdW90ZSBleHRlbmRzIEFueVBhaXJcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIGFsbG93Rm9yd2FyZGluZzogdHJ1ZVxuICBtZW1iZXI6IFsnRG91YmxlUXVvdGUnLCAnU2luZ2xlUXVvdGUnLCAnQmFja1RpY2snXVxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICByYW5nZXMgPSBAZ2V0UmFuZ2VzKHNlbGVjdGlvbilcbiAgICAjIFBpY2sgcmFuZ2Ugd2hpY2ggZW5kLmNvbHVtIGlzIGxlZnRtb3N0KG1lYW4sIGNsb3NlZCBmaXJzdClcbiAgICBfLmZpcnN0KF8uc29ydEJ5KHJhbmdlcywgKHIpIC0+IHIuZW5kLmNvbHVtbikpIGlmIHJhbmdlcy5sZW5ndGhcblxuY2xhc3MgUXVvdGUgZXh0ZW5kcyBQYWlyXG4gIEBleHRlbmQoZmFsc2UpXG4gIGFsbG93Rm9yd2FyZGluZzogdHJ1ZVxuXG5jbGFzcyBEb3VibGVRdW90ZSBleHRlbmRzIFF1b3RlXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICBwYWlyOiBbJ1wiJywgJ1wiJ11cblxuY2xhc3MgU2luZ2xlUXVvdGUgZXh0ZW5kcyBRdW90ZVxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgcGFpcjogW1wiJ1wiLCBcIidcIl1cblxuY2xhc3MgQmFja1RpY2sgZXh0ZW5kcyBRdW90ZVxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgcGFpcjogWydgJywgJ2AnXVxuXG5jbGFzcyBDdXJseUJyYWNrZXQgZXh0ZW5kcyBQYWlyXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICBAZGVyaXZlSW5uZXJBbmRBRm9yQWxsb3dGb3J3YXJkaW5nKClcbiAgcGFpcjogWyd7JywgJ30nXVxuXG5jbGFzcyBTcXVhcmVCcmFja2V0IGV4dGVuZHMgUGFpclxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgQGRlcml2ZUlubmVyQW5kQUZvckFsbG93Rm9yd2FyZGluZygpXG4gIHBhaXI6IFsnWycsICddJ11cblxuY2xhc3MgUGFyZW50aGVzaXMgZXh0ZW5kcyBQYWlyXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICBAZGVyaXZlSW5uZXJBbmRBRm9yQWxsb3dGb3J3YXJkaW5nKClcbiAgcGFpcjogWycoJywgJyknXVxuXG5jbGFzcyBBbmdsZUJyYWNrZXQgZXh0ZW5kcyBQYWlyXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICBAZGVyaXZlSW5uZXJBbmRBRm9yQWxsb3dGb3J3YXJkaW5nKClcbiAgcGFpcjogWyc8JywgJz4nXVxuXG5jbGFzcyBUYWcgZXh0ZW5kcyBQYWlyXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICBhbGxvd05leHRMaW5lOiB0cnVlXG4gIGFsbG93Rm9yd2FyZGluZzogdHJ1ZVxuICBhZGp1c3RJbm5lclJhbmdlOiBmYWxzZVxuXG4gIGdldFRhZ1N0YXJ0UG9pbnQ6IChmcm9tKSAtPlxuICAgIHRhZ1JhbmdlID0gbnVsbFxuICAgIHBhdHRlcm4gPSBUYWdGaW5kZXI6OnBhdHRlcm5cbiAgICBAc2NhbkZvcndhcmQgcGF0dGVybiwge2Zyb206IFtmcm9tLnJvdywgMF19LCAoe3JhbmdlLCBzdG9wfSkgLT5cbiAgICAgIGlmIHJhbmdlLmNvbnRhaW5zUG9pbnQoZnJvbSwgdHJ1ZSlcbiAgICAgICAgdGFnUmFuZ2UgPSByYW5nZVxuICAgICAgICBzdG9wKClcbiAgICB0YWdSYW5nZT8uc3RhcnRcblxuICBnZXRGaW5kZXI6IC0+XG4gICAgbmV3IFRhZ0ZpbmRlcihAZWRpdG9yLCB7YWxsb3dOZXh0TGluZTogQGlzQWxsb3dOZXh0TGluZSgpLCBAYWxsb3dGb3J3YXJkaW5nfSlcblxuICBnZXRQYWlySW5mbzogKGZyb20pIC0+XG4gICAgc3VwZXIoQGdldFRhZ1N0YXJ0UG9pbnQoZnJvbSkgPyBmcm9tKVxuXG4jIFNlY3Rpb246IFBhcmFncmFwaFxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09XG4jIFBhcmFncmFwaCBpcyBkZWZpbmVkIGFzIGNvbnNlY3V0aXZlIChub24tKWJsYW5rLWxpbmUuXG5jbGFzcyBQYXJhZ3JhcGggZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIHN1cHBvcnRDb3VudDogdHJ1ZVxuXG4gIGZpbmRSb3c6IChmcm9tUm93LCBkaXJlY3Rpb24sIGZuKSAtPlxuICAgIGZuLnJlc2V0PygpXG4gICAgZm91bmRSb3cgPSBmcm9tUm93XG4gICAgZm9yIHJvdyBpbiBnZXRCdWZmZXJSb3dzKEBlZGl0b3IsIHtzdGFydFJvdzogZnJvbVJvdywgZGlyZWN0aW9ufSlcbiAgICAgIGJyZWFrIHVubGVzcyBmbihyb3csIGRpcmVjdGlvbilcbiAgICAgIGZvdW5kUm93ID0gcm93XG5cbiAgICBmb3VuZFJvd1xuXG4gIGZpbmRSb3dSYW5nZUJ5OiAoZnJvbVJvdywgZm4pIC0+XG4gICAgc3RhcnRSb3cgPSBAZmluZFJvdyhmcm9tUm93LCAncHJldmlvdXMnLCBmbilcbiAgICBlbmRSb3cgPSBAZmluZFJvdyhmcm9tUm93LCAnbmV4dCcsIGZuKVxuICAgIFtzdGFydFJvdywgZW5kUm93XVxuXG4gIGdldFByZWRpY3RGdW5jdGlvbjogKGZyb21Sb3csIHNlbGVjdGlvbikgLT5cbiAgICBmcm9tUm93UmVzdWx0ID0gQGVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKGZyb21Sb3cpXG5cbiAgICBpZiBAaXNJbm5lcigpXG4gICAgICBwcmVkaWN0ID0gKHJvdywgZGlyZWN0aW9uKSA9PlxuICAgICAgICBAZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsocm93KSBpcyBmcm9tUm93UmVzdWx0XG4gICAgZWxzZVxuICAgICAgaWYgc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuICAgICAgICBkaXJlY3Rpb25Ub0V4dGVuZCA9ICdwcmV2aW91cydcbiAgICAgIGVsc2VcbiAgICAgICAgZGlyZWN0aW9uVG9FeHRlbmQgPSAnbmV4dCdcblxuICAgICAgZmxpcCA9IGZhbHNlXG4gICAgICBwcmVkaWN0ID0gKHJvdywgZGlyZWN0aW9uKSA9PlxuICAgICAgICByZXN1bHQgPSBAZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsocm93KSBpcyBmcm9tUm93UmVzdWx0XG4gICAgICAgIGlmIGZsaXBcbiAgICAgICAgICBub3QgcmVzdWx0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBpZiAobm90IHJlc3VsdCkgYW5kIChkaXJlY3Rpb24gaXMgZGlyZWN0aW9uVG9FeHRlbmQpXG4gICAgICAgICAgICBmbGlwID0gdHJ1ZVxuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICByZXN1bHRcblxuICAgICAgcHJlZGljdC5yZXNldCA9IC0+XG4gICAgICAgIGZsaXAgPSBmYWxzZVxuICAgIHByZWRpY3RcblxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICBvcmlnaW5hbFJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICBmcm9tUm93ID0gQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikucm93XG4gICAgaWYgQGlzTW9kZSgndmlzdWFsJywgJ2xpbmV3aXNlJylcbiAgICAgIGlmIHNlbGVjdGlvbi5pc1JldmVyc2VkKClcbiAgICAgICAgZnJvbVJvdy0tXG4gICAgICBlbHNlXG4gICAgICAgIGZyb21Sb3crK1xuICAgICAgZnJvbVJvdyA9IGdldFZhbGlkVmltQnVmZmVyUm93KEBlZGl0b3IsIGZyb21Sb3cpXG5cbiAgICByb3dSYW5nZSA9IEBmaW5kUm93UmFuZ2VCeShmcm9tUm93LCBAZ2V0UHJlZGljdEZ1bmN0aW9uKGZyb21Sb3csIHNlbGVjdGlvbikpXG4gICAgc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkudW5pb24oQGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2Uocm93UmFuZ2UpKVxuXG5jbGFzcyBJbmRlbnRhdGlvbiBleHRlbmRzIFBhcmFncmFwaFxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcblxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICBmcm9tUm93ID0gQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikucm93XG5cbiAgICBiYXNlSW5kZW50TGV2ZWwgPSBAZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3coZnJvbVJvdylcbiAgICBwcmVkaWN0ID0gKHJvdykgPT5cbiAgICAgIGlmIEBlZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpXG4gICAgICAgIEBpc0EoKVxuICAgICAgZWxzZVxuICAgICAgICBAZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3cocm93KSA+PSBiYXNlSW5kZW50TGV2ZWxcblxuICAgIHJvd1JhbmdlID0gQGZpbmRSb3dSYW5nZUJ5KGZyb21Sb3csIHByZWRpY3QpXG4gICAgQGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2Uocm93UmFuZ2UpXG5cbiMgU2VjdGlvbjogQ29tbWVudFxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBDb21tZW50IGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIHJvdyA9IEBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pLnJvd1xuICAgIHJvd1JhbmdlID0gQGVkaXRvci5sYW5ndWFnZU1vZGUucm93UmFuZ2VGb3JDb21tZW50QXRCdWZmZXJSb3cocm93KVxuICAgIHJvd1JhbmdlID89IFtyb3csIHJvd10gaWYgQGVkaXRvci5pc0J1ZmZlclJvd0NvbW1lbnRlZChyb3cpXG4gICAgaWYgcm93UmFuZ2U/XG4gICAgICBAZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShyb3dSYW5nZSlcblxuY2xhc3MgQ29tbWVudE9yUGFyYWdyYXBoIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIGZvciBrbGFzcyBpbiBbJ0NvbW1lbnQnLCAnUGFyYWdyYXBoJ11cbiAgICAgIGlmIHJhbmdlID0gQG5ldyhrbGFzcywge0Bpbm5lcn0pLmdldFJhbmdlKHNlbGVjdGlvbilcbiAgICAgICAgcmV0dXJuIHJhbmdlXG5cbiMgU2VjdGlvbjogRm9sZFxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBGb2xkIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuXG4gIGFkanVzdFJvd1JhbmdlOiAocm93UmFuZ2UpIC0+XG4gICAgcmV0dXJuIHJvd1JhbmdlIGlmIEBpc0EoKVxuXG4gICAgW3N0YXJ0Um93LCBlbmRSb3ddID0gcm93UmFuZ2VcbiAgICBpZiBAZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3coc3RhcnRSb3cpIGlzIEBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdyhlbmRSb3cpXG4gICAgICBlbmRSb3cgLT0gMVxuICAgIHN0YXJ0Um93ICs9IDFcbiAgICBbc3RhcnRSb3csIGVuZFJvd11cblxuICBnZXRGb2xkUm93UmFuZ2VzQ29udGFpbnNGb3JSb3c6IChyb3cpIC0+XG4gICAgZ2V0Q29kZUZvbGRSb3dSYW5nZXNDb250YWluZXNGb3JSb3coQGVkaXRvciwgcm93KS5yZXZlcnNlKClcblxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICByb3cgPSBAZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKS5yb3dcbiAgICBzZWxlY3RlZFJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICBmb3Igcm93UmFuZ2UgaW4gQGdldEZvbGRSb3dSYW5nZXNDb250YWluc0ZvclJvdyhyb3cpXG4gICAgICByYW5nZSA9IEBnZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKEBhZGp1c3RSb3dSYW5nZShyb3dSYW5nZSkpXG5cbiAgICAgICMgRG9uJ3QgY2hhbmdlIHRvIGBpZiByYW5nZS5jb250YWluc1JhbmdlKHNlbGVjdGVkUmFuZ2UsIHRydWUpYFxuICAgICAgIyBUaGVyZSBpcyBiZWhhdmlvciBkaWZmIHdoZW4gY3Vyc29yIGlzIGF0IGJlZ2lubmluZyBvZiBsaW5lKCBjb2x1bW4gMCApLlxuICAgICAgdW5sZXNzIHNlbGVjdGVkUmFuZ2UuY29udGFpbnNSYW5nZShyYW5nZSlcbiAgICAgICAgcmV0dXJuIHJhbmdlXG5cbiMgTk9URTogRnVuY3Rpb24gcmFuZ2UgZGV0ZXJtaW5hdGlvbiBpcyBkZXBlbmRpbmcgb24gZm9sZC5cbmNsYXNzIEZ1bmN0aW9uIGV4dGVuZHMgRm9sZFxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgIyBTb21lIGxhbmd1YWdlIGRvbid0IGluY2x1ZGUgY2xvc2luZyBgfWAgaW50byBmb2xkLlxuICBzY29wZU5hbWVzT21pdHRpbmdFbmRSb3c6IFsnc291cmNlLmdvJywgJ3NvdXJjZS5lbGl4aXInXVxuXG4gIGdldEZvbGRSb3dSYW5nZXNDb250YWluc0ZvclJvdzogKHJvdykgLT5cbiAgICAoc3VwZXIpLmZpbHRlciAocm93UmFuZ2UpID0+XG4gICAgICBpc0luY2x1ZGVGdW5jdGlvblNjb3BlRm9yUm93KEBlZGl0b3IsIHJvd1JhbmdlWzBdKVxuXG4gIGFkanVzdFJvd1JhbmdlOiAocm93UmFuZ2UpIC0+XG4gICAgW3N0YXJ0Um93LCBlbmRSb3ddID0gc3VwZXJcbiAgICAjIE5PVEU6IFRoaXMgYWRqdXN0bWVudCBzaG91ZCBub3QgYmUgbmVjZXNzYXJ5IGlmIGxhbmd1YWdlLXN5bnRheCBpcyBwcm9wZXJseSBkZWZpbmVkLlxuICAgIGlmIEBpc0EoKSBhbmQgQGVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lIGluIEBzY29wZU5hbWVzT21pdHRpbmdFbmRSb3dcbiAgICAgIGVuZFJvdyArPSAxXG4gICAgW3N0YXJ0Um93LCBlbmRSb3ddXG5cbiMgU2VjdGlvbjogT3RoZXJcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQ3VycmVudExpbmUgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIHJvdyA9IEBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pLnJvd1xuICAgIHJhbmdlID0gQGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhyb3cpXG4gICAgaWYgQGlzQSgpXG4gICAgICByYW5nZVxuICAgIGVsc2VcbiAgICAgIHRyaW1SYW5nZShAZWRpdG9yLCByYW5nZSlcblxuY2xhc3MgRW50aXJlIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICBzZWxlY3RPbmNlOiB0cnVlXG5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgQGVkaXRvci5idWZmZXIuZ2V0UmFuZ2UoKVxuXG5jbGFzcyBFbXB0eSBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZChmYWxzZSlcbiAgc2VsZWN0T25jZTogdHJ1ZVxuXG5jbGFzcyBMYXRlc3RDaGFuZ2UgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICB3aXNlOiBudWxsXG4gIHNlbGVjdE9uY2U6IHRydWVcbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgc3RhcnQgPSBAdmltU3RhdGUubWFyay5nZXQoJ1snKVxuICAgIGVuZCA9IEB2aW1TdGF0ZS5tYXJrLmdldCgnXScpXG4gICAgaWYgc3RhcnQ/IGFuZCBlbmQ/XG4gICAgICBuZXcgUmFuZ2Uoc3RhcnQsIGVuZClcblxuY2xhc3MgU2VhcmNoTWF0Y2hGb3J3YXJkIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKClcbiAgYmFja3dhcmQ6IGZhbHNlXG5cbiAgZmluZE1hdGNoOiAoZnJvbVBvaW50LCBwYXR0ZXJuKSAtPlxuICAgIGZyb21Qb2ludCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcChAZWRpdG9yLCBmcm9tUG9pbnQsIFwiZm9yd2FyZFwiKSBpZiAoQG1vZGUgaXMgJ3Zpc3VhbCcpXG4gICAgZm91bmQgPSBudWxsXG4gICAgQHNjYW5Gb3J3YXJkIHBhdHRlcm4sIHtmcm9tOiBbZnJvbVBvaW50LnJvdywgMF19LCAoe3JhbmdlLCBzdG9wfSkgLT5cbiAgICAgIGlmIHJhbmdlLmVuZC5pc0dyZWF0ZXJUaGFuKGZyb21Qb2ludClcbiAgICAgICAgZm91bmQgPSByYW5nZVxuICAgICAgICBzdG9wKClcbiAgICB7cmFuZ2U6IGZvdW5kLCB3aGljaElzSGVhZDogJ2VuZCd9XG5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgcGF0dGVybiA9IEBnbG9iYWxTdGF0ZS5nZXQoJ2xhc3RTZWFyY2hQYXR0ZXJuJylcbiAgICByZXR1cm4gdW5sZXNzIHBhdHRlcm4/XG5cbiAgICBmcm9tUG9pbnQgPSBzZWxlY3Rpb24uZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKClcbiAgICB7cmFuZ2UsIHdoaWNoSXNIZWFkfSA9IEBmaW5kTWF0Y2goZnJvbVBvaW50LCBwYXR0ZXJuKVxuICAgIGlmIHJhbmdlP1xuICAgICAgQHVuaW9uUmFuZ2VBbmREZXRlcm1pbmVSZXZlcnNlZFN0YXRlKHNlbGVjdGlvbiwgcmFuZ2UsIHdoaWNoSXNIZWFkKVxuXG4gIHVuaW9uUmFuZ2VBbmREZXRlcm1pbmVSZXZlcnNlZFN0YXRlOiAoc2VsZWN0aW9uLCBmb3VuZCwgd2hpY2hJc0hlYWQpIC0+XG4gICAgaWYgc2VsZWN0aW9uLmlzRW1wdHkoKVxuICAgICAgZm91bmRcbiAgICBlbHNlXG4gICAgICBoZWFkID0gZm91bmRbd2hpY2hJc0hlYWRdXG4gICAgICB0YWlsID0gc2VsZWN0aW9uLmdldFRhaWxCdWZmZXJQb3NpdGlvbigpXG5cbiAgICAgIGlmIEBiYWNrd2FyZFxuICAgICAgICBoZWFkID0gdHJhbnNsYXRlUG9pbnRBbmRDbGlwKEBlZGl0b3IsIGhlYWQsICdmb3J3YXJkJykgaWYgdGFpbC5pc0xlc3NUaGFuKGhlYWQpXG4gICAgICBlbHNlXG4gICAgICAgIGhlYWQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAoQGVkaXRvciwgaGVhZCwgJ2JhY2t3YXJkJykgaWYgaGVhZC5pc0xlc3NUaGFuKHRhaWwpXG5cbiAgICAgIEByZXZlcnNlZCA9IGhlYWQuaXNMZXNzVGhhbih0YWlsKVxuICAgICAgbmV3IFJhbmdlKHRhaWwsIGhlYWQpLnVuaW9uKHN3cmFwKHNlbGVjdGlvbikuZ2V0VGFpbEJ1ZmZlclJhbmdlKCkpXG5cbiAgc2VsZWN0VGV4dE9iamVjdDogKHNlbGVjdGlvbikgLT5cbiAgICBpZiByYW5nZSA9IEBnZXRSYW5nZShzZWxlY3Rpb24pXG4gICAgICBzd3JhcChzZWxlY3Rpb24pLnNldEJ1ZmZlclJhbmdlKHJhbmdlLCB7cmV2ZXJzZWQ6IEByZXZlcnNlZCA/IEBiYWNrd2FyZH0pXG4gICAgICByZXR1cm4gdHJ1ZVxuXG5jbGFzcyBTZWFyY2hNYXRjaEJhY2t3YXJkIGV4dGVuZHMgU2VhcmNoTWF0Y2hGb3J3YXJkXG4gIEBleHRlbmQoKVxuICBiYWNrd2FyZDogdHJ1ZVxuXG4gIGZpbmRNYXRjaDogKGZyb21Qb2ludCwgcGF0dGVybikgLT5cbiAgICBmcm9tUG9pbnQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAoQGVkaXRvciwgZnJvbVBvaW50LCBcImJhY2t3YXJkXCIpIGlmIChAbW9kZSBpcyAndmlzdWFsJylcbiAgICBmb3VuZCA9IG51bGxcbiAgICBAc2NhbkJhY2t3YXJkIHBhdHRlcm4sIHtmcm9tOiBbZnJvbVBvaW50LnJvdywgSW5maW5pdHldfSwgKHtyYW5nZSwgc3RvcH0pIC0+XG4gICAgICBpZiByYW5nZS5zdGFydC5pc0xlc3NUaGFuKGZyb21Qb2ludClcbiAgICAgICAgZm91bmQgPSByYW5nZVxuICAgICAgICBzdG9wKClcbiAgICB7cmFuZ2U6IGZvdW5kLCB3aGljaElzSGVhZDogJ3N0YXJ0J31cblxuIyBbTGltaXRhdGlvbjogd29uJ3QgZml4XTogU2VsZWN0ZWQgcmFuZ2UgaXMgbm90IHN1Ym1vZGUgYXdhcmUuIGFsd2F5cyBjaGFyYWN0ZXJ3aXNlLlxuIyBTbyBldmVuIGlmIG9yaWdpbmFsIHNlbGVjdGlvbiB3YXMgdkwgb3IgdkIsIHNlbGVjdGVkIHJhbmdlIGJ5IHRoaXMgdGV4dC1vYmplY3RcbiMgaXMgYWx3YXlzIHZDIHJhbmdlLlxuY2xhc3MgUHJldmlvdXNTZWxlY3Rpb24gZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoKVxuICB3aXNlOiBudWxsXG4gIHNlbGVjdE9uY2U6IHRydWVcblxuICBzZWxlY3RUZXh0T2JqZWN0OiAoc2VsZWN0aW9uKSAtPlxuICAgIHtwcm9wZXJ0aWVzLCBzdWJtb2RlfSA9IEB2aW1TdGF0ZS5wcmV2aW91c1NlbGVjdGlvblxuICAgIGlmIHByb3BlcnRpZXM/IGFuZCBzdWJtb2RlP1xuICAgICAgQHdpc2UgPSBzdWJtb2RlXG4gICAgICBzd3JhcChAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKSkuc2VsZWN0QnlQcm9wZXJ0aWVzKHByb3BlcnRpZXMpXG4gICAgICByZXR1cm4gdHJ1ZVxuXG5jbGFzcyBQZXJzaXN0ZW50U2VsZWN0aW9uIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgd2lzZTogbnVsbFxuICBzZWxlY3RPbmNlOiB0cnVlXG5cbiAgc2VsZWN0VGV4dE9iamVjdDogKHNlbGVjdGlvbikgLT5cbiAgICBpZiBAdmltU3RhdGUuaGFzUGVyc2lzdGVudFNlbGVjdGlvbnMoKVxuICAgICAgQHZpbVN0YXRlLnBlcnNpc3RlbnRTZWxlY3Rpb24uc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXMoKVxuICAgICAgcmV0dXJuIHRydWVcblxuY2xhc3MgVmlzaWJsZUFyZWEgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICBzZWxlY3RPbmNlOiB0cnVlXG5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgIyBbQlVHP10gTmVlZCB0cmFuc2xhdGUgdG8gc2hpbG5rIHRvcCBhbmQgYm90dG9tIHRvIGZpdCBhY3R1YWwgcm93LlxuICAgICMgVGhlIHJlYXNvbiBJIG5lZWQgLTIgYXQgYm90dG9tIGlzIGJlY2F1c2Ugb2Ygc3RhdHVzIGJhcj9cbiAgICBidWZmZXJSYW5nZSA9IGdldFZpc2libGVCdWZmZXJSYW5nZShAZWRpdG9yKVxuICAgIGlmIGJ1ZmZlclJhbmdlLmdldFJvd3MoKSA+IEBlZGl0b3IuZ2V0Um93c1BlclBhZ2UoKVxuICAgICAgYnVmZmVyUmFuZ2UudHJhbnNsYXRlKFsrMSwgMF0sIFstMywgMF0pXG4gICAgZWxzZVxuICAgICAgYnVmZmVyUmFuZ2VcbiJdfQ==
