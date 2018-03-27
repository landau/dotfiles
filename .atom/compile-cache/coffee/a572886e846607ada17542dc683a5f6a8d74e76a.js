(function() {
  var APair, AngleBracket, AnyPair, AnyPairAllowForwarding, AnyQuote, Arguments, BackTick, Base, Comment, CommentOrParagraph, CurlyBracket, CurrentLine, DoubleQuote, Empty, Entire, Fold, Function, Indentation, LatestChange, Pair, PairFinder, Paragraph, Parenthesis, PersistentSelection, Point, PreviousSelection, Quote, Range, SearchMatchBackward, SearchMatchForward, SingleQuote, SmartWord, SquareBracket, Subword, Tag, TextObject, VisibleArea, WholeWord, Word, _, expandRangeToWhiteSpaces, getBufferRows, getCodeFoldRowRangesContainesForRow, getLineTextToBufferPosition, getValidVimBufferRow, getVisibleBufferRange, isIncludeFunctionScopeForRow, pointIsAtEndOfLine, ref, ref1, sortRanges, splitArguments, translatePointAndClip, traverseTextFromPoint, trimRange,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Range = ref.Range, Point = ref.Point;

  _ = require('underscore-plus');

  Base = require('./base');

  ref1 = require('./utils'), getLineTextToBufferPosition = ref1.getLineTextToBufferPosition, getCodeFoldRowRangesContainesForRow = ref1.getCodeFoldRowRangesContainesForRow, isIncludeFunctionScopeForRow = ref1.isIncludeFunctionScopeForRow, expandRangeToWhiteSpaces = ref1.expandRangeToWhiteSpaces, getVisibleBufferRange = ref1.getVisibleBufferRange, translatePointAndClip = ref1.translatePointAndClip, getBufferRows = ref1.getBufferRows, getValidVimBufferRow = ref1.getValidVimBufferRow, trimRange = ref1.trimRange, sortRanges = ref1.sortRanges, pointIsAtEndOfLine = ref1.pointIsAtEndOfLine, splitArguments = ref1.splitArguments, traverseTextFromPoint = ref1.traverseTextFromPoint;

  PairFinder = null;

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
      var $selection, i, j, k, len, len1, len2, ref2, ref3, ref4, results;
      if (this.isMode('visual', 'blockwise')) {
        this.swrap.normalize(this.editor);
      }
      this.countTimes(this.getCount(), (function(_this) {
        return function(arg1) {
          var i, len, oldRange, ref2, results, selection, stop;
          stop = arg1.stop;
          if (!_this.supportCount) {
            stop();
          }
          ref2 = _this.editor.getSelections();
          results = [];
          for (i = 0, len = ref2.length; i < len; i++) {
            selection = ref2[i];
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
        this.wise = this.swrap.detectWise(this.editor);
      }
      if (this.mode === 'visual') {
        if (this.selectSucceeded) {
          switch (this.wise) {
            case 'characterwise':
              ref2 = this.swrap.getSelections(this.editor);
              for (i = 0, len = ref2.length; i < len; i++) {
                $selection = ref2[i];
                $selection.saveProperties();
              }
              break;
            case 'linewise':
              ref3 = this.swrap.getSelections(this.editor);
              for (j = 0, len1 = ref3.length; j < len1; j++) {
                $selection = ref3[j];
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
          ref4 = this.swrap.getSelections(this.editor);
          results = [];
          for (k = 0, len2 = ref4.length; k < len2; k++) {
            $selection = ref4[k];
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
        this.swrap(selection).setBufferRange(range);
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

    Pair.prototype.inclusive = true;

    Pair.prototype.initialize = function() {
      if (PairFinder == null) {
        PairFinder = require('./pair-finder');
      }
      return Pair.__super__.initialize.apply(this, arguments);
    };

    Pair.prototype.isAllowNextLine = function() {
      var ref2;
      return (ref2 = this.allowNextLine) != null ? ref2 : (this.pair != null) && this.pair[0] !== this.pair[1];
    };

    Pair.prototype.adjustRange = function(arg1) {
      var end, start;
      start = arg1.start, end = arg1.end;
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
        pair: this.pair,
        inclusive: this.inclusive
      };
      if (this.pair[0] === this.pair[1]) {
        return new PairFinder.QuoteFinder(this.editor, options);
      } else {
        return new PairFinder.BracketFinder(this.editor, options);
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
            allowForwarding: _this.allowForwarding,
            inclusive: _this.inclusive
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
      var enclosingRange, enclosingRanges, forwardingRanges, from, ranges, ref2;
      ranges = this.getRanges(selection);
      from = selection.cursor.getBufferPosition();
      ref2 = _.partition(ranges, function(range) {
        return range.start.isGreaterThanOrEqual(from);
      }), forwardingRanges = ref2[0], enclosingRanges = ref2[1];
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
      pattern = PairFinder.TagFinder.pattern;
      this.scanForward(pattern, {
        from: [from.row, 0]
      }, function(arg1) {
        var range, stop;
        range = arg1.range, stop = arg1.stop;
        if (range.containsPoint(from, true)) {
          tagRange = range;
          return stop();
        }
      });
      return tagRange != null ? tagRange.start : void 0;
    };

    Tag.prototype.getFinder = function() {
      return new PairFinder.TagFinder(this.editor, {
        allowNextLine: this.isAllowNextLine(),
        allowForwarding: this.allowForwarding,
        inclusive: this.inclusive
      });
    };

    Tag.prototype.getPairInfo = function(from) {
      var ref2;
      return Tag.__super__.getPairInfo.call(this, (ref2 = this.getTagStartPoint(from)) != null ? ref2 : from);
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
      var foundRow, i, len, ref2, row;
      if (typeof fn.reset === "function") {
        fn.reset();
      }
      foundRow = fromRow;
      ref2 = getBufferRows(this.editor, {
        startRow: fromRow,
        direction: direction
      });
      for (i = 0, len = ref2.length; i < len; i++) {
        row = ref2[i];
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
      var i, klass, len, range, ref2;
      ref2 = ['Comment', 'Paragraph'];
      for (i = 0, len = ref2.length; i < len; i++) {
        klass = ref2[i];
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
      var i, len, range, ref2, row, rowRange, selectedRange;
      row = this.getCursorPositionForSelection(selection).row;
      selectedRange = selection.getBufferRange();
      ref2 = this.getFoldRowRangesContainsForRow(row);
      for (i = 0, len = ref2.length; i < len; i++) {
        rowRange = ref2[i];
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

    Function.prototype.isGrammarNotFoldEndRow = function() {
      var packageName, ref2, scopeName;
      ref2 = this.editor.getGrammar(), scopeName = ref2.scopeName, packageName = ref2.packageName;
      if (indexOf.call(this.scopeNamesOmittingEndRow, scopeName) >= 0) {
        return true;
      } else {
        return scopeName === 'source.rust' && packageName === "language-rust";
      }
    };

    Function.prototype.getFoldRowRangesContainsForRow = function(row) {
      return (Function.__super__.getFoldRowRangesContainsForRow.apply(this, arguments)).filter((function(_this) {
        return function(rowRange) {
          return isIncludeFunctionScopeForRow(_this.editor, rowRange[0]);
        };
      })(this));
    };

    Function.prototype.adjustRowRange = function(rowRange) {
      var endRow, ref2, startRow;
      ref2 = Function.__super__.adjustRowRange.apply(this, arguments), startRow = ref2[0], endRow = ref2[1];
      if (this.isA() && this.isGrammarNotFoldEndRow()) {
        endRow += 1;
      }
      return [startRow, endRow];
    };

    return Function;

  })(Fold);

  Arguments = (function(superClass) {
    extend(Arguments, superClass);

    function Arguments() {
      return Arguments.__super__.constructor.apply(this, arguments);
    }

    Arguments.extend(false);

    Arguments.deriveInnerAndA();

    Arguments.prototype.newArgInfo = function(argStart, arg, separator) {
      var aRange, argEnd, argRange, innerRange, separatorEnd, separatorRange;
      argEnd = traverseTextFromPoint(argStart, arg);
      argRange = new Range(argStart, argEnd);
      separatorEnd = traverseTextFromPoint(argEnd, separator != null ? separator : '');
      separatorRange = new Range(argEnd, separatorEnd);
      innerRange = argRange;
      aRange = argRange.union(separatorRange);
      return {
        argRange: argRange,
        separatorRange: separatorRange,
        innerRange: innerRange,
        aRange: aRange
      };
    };

    Arguments.prototype.getArgumentsRangeForSelection = function(selection) {
      var member;
      member = ['CurlyBracket', 'SquareBracket', 'Parenthesis'];
      return this["new"]("InnerAnyPair", {
        inclusive: false,
        member: member
      }).getRange(selection);
    };

    Arguments.prototype.getRange = function(selection) {
      var aRange, allTokens, argInfo, argInfos, argStart, i, innerRange, lastArgInfo, len, pairRangeFound, point, range, ref2, ref3, separator, text, token;
      range = this.getArgumentsRangeForSelection(selection);
      pairRangeFound = range != null;
      if (range == null) {
        range = this["new"]("InnerCurrentLine").getRange(selection);
      }
      if (!range) {
        return;
      }
      range = trimRange(this.editor, range);
      text = this.editor.getTextInBufferRange(range);
      allTokens = splitArguments(text, pairRangeFound);
      argInfos = [];
      argStart = range.start;
      if (allTokens.length && allTokens[0].type === 'separator') {
        token = allTokens.shift();
        argStart = traverseTextFromPoint(argStart, token.text);
      }
      while (allTokens.length) {
        token = allTokens.shift();
        if (token.type === 'argument') {
          separator = (ref2 = allTokens.shift()) != null ? ref2.text : void 0;
          argInfo = this.newArgInfo(argStart, token.text, separator);
          if ((allTokens.length === 0) && (lastArgInfo = _.last(argInfos))) {
            argInfo.aRange = argInfo.argRange.union(lastArgInfo.separatorRange);
          }
          argStart = argInfo.aRange.end;
          argInfos.push(argInfo);
        } else {
          throw new Error('must not happen');
        }
      }
      point = this.getCursorPositionForSelection(selection);
      for (i = 0, len = argInfos.length; i < len; i++) {
        ref3 = argInfos[i], innerRange = ref3.innerRange, aRange = ref3.aRange;
        if (innerRange.end.isGreaterThanOrEqual(point)) {
          if (this.isInner()) {
            return innerRange;
          } else {
            return aRange;
          }
        }
      }
      return null;
    };

    return Arguments;

  })(TextObject);

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
      }, function(arg1) {
        var range, stop;
        range = arg1.range, stop = arg1.stop;
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
      var fromPoint, pattern, range, ref2, whichIsHead;
      pattern = this.globalState.get('lastSearchPattern');
      if (pattern == null) {
        return;
      }
      fromPoint = selection.getHeadBufferPosition();
      ref2 = this.findMatch(fromPoint, pattern), range = ref2.range, whichIsHead = ref2.whichIsHead;
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
        return new Range(tail, head).union(this.swrap(selection).getTailBufferRange());
      }
    };

    SearchMatchForward.prototype.selectTextObject = function(selection) {
      var range, ref2;
      if (range = this.getRange(selection)) {
        this.swrap(selection).setBufferRange(range, {
          reversed: (ref2 = this.reversed) != null ? ref2 : this.backward
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
      }, function(arg1) {
        var range, stop;
        range = arg1.range, stop = arg1.stop;
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
      var properties, ref2, submode;
      ref2 = this.vimState.previousSelection, properties = ref2.properties, submode = ref2.submode;
      if ((properties != null) && (submode != null)) {
        this.wise = submode;
        this.swrap(this.editor.getLastSelection()).selectByProperties(properties);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvdGV4dC1vYmplY3QuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxvdkJBQUE7SUFBQTs7OztFQUFBLE1BQWlCLE9BQUEsQ0FBUSxNQUFSLENBQWpCLEVBQUMsaUJBQUQsRUFBUTs7RUFDUixDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUtKLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFDUCxPQWNJLE9BQUEsQ0FBUSxTQUFSLENBZEosRUFDRSw4REFERixFQUVFLDhFQUZGLEVBR0UsZ0VBSEYsRUFJRSx3REFKRixFQUtFLGtEQUxGLEVBTUUsa0RBTkYsRUFPRSxrQ0FQRixFQVFFLGdEQVJGLEVBU0UsMEJBVEYsRUFVRSw0QkFWRixFQVdFLDRDQVhGLEVBWUUsb0NBWkYsRUFhRTs7RUFFRixVQUFBLEdBQWE7O0VBRVA7OztJQUNKLFVBQUMsQ0FBQSxNQUFELENBQVEsS0FBUjs7SUFDQSxVQUFDLENBQUEsYUFBRCxHQUFnQjs7eUJBQ2hCLElBQUEsR0FBTTs7eUJBQ04sWUFBQSxHQUFjOzt5QkFDZCxVQUFBLEdBQVk7O0lBRVosVUFBQyxDQUFBLGVBQUQsR0FBa0IsU0FBQTtNQUNoQixJQUFDLENBQUEsYUFBRCxDQUFlLEdBQUEsR0FBTSxJQUFDLENBQUEsSUFBdEIsRUFBNEIsS0FBNUI7YUFDQSxJQUFDLENBQUEsYUFBRCxDQUFlLE9BQUEsR0FBVSxJQUFDLENBQUEsSUFBMUIsRUFBZ0MsSUFBaEM7SUFGZ0I7O0lBSWxCLFVBQUMsQ0FBQSxpQ0FBRCxHQUFvQyxTQUFBO01BQ2xDLElBQUMsQ0FBQSxhQUFELENBQWUsR0FBQSxHQUFNLElBQUMsQ0FBQSxJQUFQLEdBQWMsaUJBQTdCLEVBQWdELEtBQWhELEVBQXVELElBQXZEO2FBQ0EsSUFBQyxDQUFBLGFBQUQsQ0FBZSxPQUFB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MUIiLCJzb3VyY2VzQ29udGVudCI6WyJ7UmFuZ2UsIFBvaW50fSA9IHJlcXVpcmUgJ2F0b20nXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG4jIFtUT0RPXSBOZWVkIG92ZXJoYXVsXG4jICAtIFsgXSBNYWtlIGV4cGFuZGFibGUgYnkgc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkudW5pb24oQGdldFJhbmdlKHNlbGVjdGlvbikpXG4jICAtIFsgXSBDb3VudCBzdXBwb3J0KHByaW9yaXR5IGxvdyk/XG5CYXNlID0gcmVxdWlyZSAnLi9iYXNlJ1xue1xuICBnZXRMaW5lVGV4dFRvQnVmZmVyUG9zaXRpb25cbiAgZ2V0Q29kZUZvbGRSb3dSYW5nZXNDb250YWluZXNGb3JSb3dcbiAgaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvd1xuICBleHBhbmRSYW5nZVRvV2hpdGVTcGFjZXNcbiAgZ2V0VmlzaWJsZUJ1ZmZlclJhbmdlXG4gIHRyYW5zbGF0ZVBvaW50QW5kQ2xpcFxuICBnZXRCdWZmZXJSb3dzXG4gIGdldFZhbGlkVmltQnVmZmVyUm93XG4gIHRyaW1SYW5nZVxuICBzb3J0UmFuZ2VzXG4gIHBvaW50SXNBdEVuZE9mTGluZVxuICBzcGxpdEFyZ3VtZW50c1xuICB0cmF2ZXJzZVRleHRGcm9tUG9pbnRcbn0gPSByZXF1aXJlICcuL3V0aWxzJ1xuUGFpckZpbmRlciA9IG51bGxcblxuY2xhc3MgVGV4dE9iamVjdCBleHRlbmRzIEJhc2VcbiAgQGV4dGVuZChmYWxzZSlcbiAgQG9wZXJhdGlvbktpbmQ6ICd0ZXh0LW9iamVjdCdcbiAgd2lzZTogJ2NoYXJhY3Rlcndpc2UnXG4gIHN1cHBvcnRDb3VudDogZmFsc2UgIyBGSVhNRSAjNDcyLCAjNjZcbiAgc2VsZWN0T25jZTogZmFsc2VcblxuICBAZGVyaXZlSW5uZXJBbmRBOiAtPlxuICAgIEBnZW5lcmF0ZUNsYXNzKFwiQVwiICsgQG5hbWUsIGZhbHNlKVxuICAgIEBnZW5lcmF0ZUNsYXNzKFwiSW5uZXJcIiArIEBuYW1lLCB0cnVlKVxuXG4gIEBkZXJpdmVJbm5lckFuZEFGb3JBbGxvd0ZvcndhcmRpbmc6IC0+XG4gICAgQGdlbmVyYXRlQ2xhc3MoXCJBXCIgKyBAbmFtZSArIFwiQWxsb3dGb3J3YXJkaW5nXCIsIGZhbHNlLCB0cnVlKVxuICAgIEBnZW5lcmF0ZUNsYXNzKFwiSW5uZXJcIiArIEBuYW1lICsgXCJBbGxvd0ZvcndhcmRpbmdcIiwgdHJ1ZSwgdHJ1ZSlcblxuICBAZ2VuZXJhdGVDbGFzczogKGtsYXNzTmFtZSwgaW5uZXIsIGFsbG93Rm9yd2FyZGluZykgLT5cbiAgICBrbGFzcyA9IGNsYXNzIGV4dGVuZHMgdGhpc1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBrbGFzcywgJ25hbWUnLCBnZXQ6IC0+IGtsYXNzTmFtZVxuICAgIGtsYXNzOjppbm5lciA9IGlubmVyXG4gICAga2xhc3M6OmFsbG93Rm9yd2FyZGluZyA9IHRydWUgaWYgYWxsb3dGb3J3YXJkaW5nXG4gICAga2xhc3MuZXh0ZW5kKClcblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBzdXBlclxuICAgIEBpbml0aWFsaXplKClcblxuICBpc0lubmVyOiAtPlxuICAgIEBpbm5lclxuXG4gIGlzQTogLT5cbiAgICBub3QgQGlubmVyXG5cbiAgaXNMaW5ld2lzZTogLT4gQHdpc2UgaXMgJ2xpbmV3aXNlJ1xuICBpc0Jsb2Nrd2lzZTogLT4gQHdpc2UgaXMgJ2Jsb2Nrd2lzZSdcblxuICBmb3JjZVdpc2U6ICh3aXNlKSAtPlxuICAgIEB3aXNlID0gd2lzZSAjIEZJWE1FIGN1cnJlbnRseSBub3Qgd2VsbCBzdXBwb3J0ZWRcblxuICByZXNldFN0YXRlOiAtPlxuICAgIEBzZWxlY3RTdWNjZWVkZWQgPSBudWxsXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAcmVzZXRTdGF0ZSgpXG5cbiAgICAjIFdoZW5uZXZlciBUZXh0T2JqZWN0IGlzIGV4ZWN1dGVkLCBpdCBoYXMgQG9wZXJhdG9yXG4gICAgIyBDYWxsZWQgZnJvbSBPcGVyYXRvcjo6c2VsZWN0VGFyZ2V0KClcbiAgICAjICAtIGB2IGkgcGAsIGlzIGBTZWxlY3RgIG9wZXJhdG9yIHdpdGggQHRhcmdldCA9IGBJbm5lclBhcmFncmFwaGAuXG4gICAgIyAgLSBgZCBpIHBgLCBpcyBgRGVsZXRlYCBvcGVyYXRvciB3aXRoIEB0YXJnZXQgPSBgSW5uZXJQYXJhZ3JhcGhgLlxuICAgIGlmIEBvcGVyYXRvcj9cbiAgICAgIEBzZWxlY3QoKVxuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW4gVGV4dE9iamVjdDogTXVzdCBub3QgaGFwcGVuJylcblxuICBzZWxlY3Q6IC0+XG4gICAgaWYgQGlzTW9kZSgndmlzdWFsJywgJ2Jsb2Nrd2lzZScpXG4gICAgICBAc3dyYXAubm9ybWFsaXplKEBlZGl0b3IpXG5cbiAgICBAY291bnRUaW1lcyBAZ2V0Q291bnQoKSwgKHtzdG9wfSkgPT5cbiAgICAgIHN0b3AoKSB1bmxlc3MgQHN1cHBvcnRDb3VudCAjIHF1aWNrLWZpeCBmb3IgIzU2MFxuICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICBvbGRSYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICAgIGlmIEBzZWxlY3RUZXh0T2JqZWN0KHNlbGVjdGlvbilcbiAgICAgICAgICBAc2VsZWN0U3VjY2VlZGVkID0gdHJ1ZVxuICAgICAgICBzdG9wKCkgaWYgc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuaXNFcXVhbChvbGRSYW5nZSlcbiAgICAgICAgYnJlYWsgaWYgQHNlbGVjdE9uY2VcblxuICAgIEBlZGl0b3IubWVyZ2VJbnRlcnNlY3RpbmdTZWxlY3Rpb25zKClcbiAgICAjIFNvbWUgVGV4dE9iamVjdCdzIHdpc2UgaXMgTk9UIGRldGVybWluaXN0aWMuIEl0IGhhcyB0byBiZSBkZXRlY3RlZCBmcm9tIHNlbGVjdGVkIHJhbmdlLlxuICAgIEB3aXNlID89IEBzd3JhcC5kZXRlY3RXaXNlKEBlZGl0b3IpXG5cbiAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgaWYgQHNlbGVjdFN1Y2NlZWRlZFxuICAgICAgICBzd2l0Y2ggQHdpc2VcbiAgICAgICAgICB3aGVuICdjaGFyYWN0ZXJ3aXNlJ1xuICAgICAgICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcygpIGZvciAkc2VsZWN0aW9uIGluIEBzd3JhcC5nZXRTZWxlY3Rpb25zKEBlZGl0b3IpXG4gICAgICAgICAgd2hlbiAnbGluZXdpc2UnXG4gICAgICAgICAgICAjIFdoZW4gdGFyZ2V0IGlzIHBlcnNpc3RlbnQtc2VsZWN0aW9uLCBuZXcgc2VsZWN0aW9uIGlzIGFkZGVkIGFmdGVyIHNlbGVjdFRleHRPYmplY3QuXG4gICAgICAgICAgICAjIFNvIHdlIGhhdmUgdG8gYXNzdXJlIGFsbCBzZWxlY3Rpb24gaGF2ZSBzZWxjdGlvbiBwcm9wZXJ0eS5cbiAgICAgICAgICAgICMgTWF5YmUgdGhpcyBsb2dpYyBjYW4gYmUgbW92ZWQgdG8gb3BlcmF0aW9uIHN0YWNrLlxuICAgICAgICAgICAgZm9yICRzZWxlY3Rpb24gaW4gQHN3cmFwLmdldFNlbGVjdGlvbnMoQGVkaXRvcilcbiAgICAgICAgICAgICAgaWYgQGdldENvbmZpZygna2VlcENvbHVtbk9uU2VsZWN0VGV4dE9iamVjdCcpXG4gICAgICAgICAgICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcygpIHVubGVzcyAkc2VsZWN0aW9uLmhhc1Byb3BlcnRpZXMoKVxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgJHNlbGVjdGlvbi5zYXZlUHJvcGVydGllcygpXG4gICAgICAgICAgICAgICRzZWxlY3Rpb24uZml4UHJvcGVydHlSb3dUb1Jvd1JhbmdlKClcblxuICAgICAgaWYgQHN1Ym1vZGUgaXMgJ2Jsb2Nrd2lzZSdcbiAgICAgICAgZm9yICRzZWxlY3Rpb24gaW4gQHN3cmFwLmdldFNlbGVjdGlvbnMoQGVkaXRvcilcbiAgICAgICAgICAkc2VsZWN0aW9uLm5vcm1hbGl6ZSgpXG4gICAgICAgICAgJHNlbGVjdGlvbi5hcHBseVdpc2UoJ2Jsb2Nrd2lzZScpXG5cbiAgIyBSZXR1cm4gdHJ1ZSBvciBmYWxzZVxuICBzZWxlY3RUZXh0T2JqZWN0OiAoc2VsZWN0aW9uKSAtPlxuICAgIGlmIHJhbmdlID0gQGdldFJhbmdlKHNlbGVjdGlvbilcbiAgICAgIEBzd3JhcChzZWxlY3Rpb24pLnNldEJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgICAgcmV0dXJuIHRydWVcblxuICAjIHRvIG92ZXJyaWRlXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIG51bGxcblxuIyBTZWN0aW9uOiBXb3JkXG4jID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFdvcmQgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIHBvaW50ID0gQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICB7cmFuZ2V9ID0gQGdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uKHBvaW50LCB7QHdvcmRSZWdleH0pXG4gICAgaWYgQGlzQSgpXG4gICAgICBleHBhbmRSYW5nZVRvV2hpdGVTcGFjZXMoQGVkaXRvciwgcmFuZ2UpXG4gICAgZWxzZVxuICAgICAgcmFuZ2VcblxuY2xhc3MgV2hvbGVXb3JkIGV4dGVuZHMgV29yZFxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgd29yZFJlZ2V4OiAvXFxTKy9cblxuIyBKdXN0IGluY2x1ZGUgXywgLVxuY2xhc3MgU21hcnRXb3JkIGV4dGVuZHMgV29yZFxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgQGRlc2NyaXB0aW9uOiBcIkEgd29yZCB0aGF0IGNvbnNpc3RzIG9mIGFscGhhbnVtZXJpYyBjaGFycyhgL1tBLVphLXowLTlfXS9gKSBhbmQgaHlwaGVuIGAtYFwiXG4gIHdvcmRSZWdleDogL1tcXHctXSsvXG5cbiMgSnVzdCBpbmNsdWRlIF8sIC1cbmNsYXNzIFN1YndvcmQgZXh0ZW5kcyBXb3JkXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICBAd29yZFJlZ2V4ID0gc2VsZWN0aW9uLmN1cnNvci5zdWJ3b3JkUmVnRXhwKClcbiAgICBzdXBlclxuXG4jIFNlY3Rpb246IFBhaXJcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgUGFpciBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZChmYWxzZSlcbiAgc3VwcG9ydENvdW50OiB0cnVlXG4gIGFsbG93TmV4dExpbmU6IG51bGxcbiAgYWRqdXN0SW5uZXJSYW5nZTogdHJ1ZVxuICBwYWlyOiBudWxsXG4gIGluY2x1c2l2ZTogdHJ1ZVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgUGFpckZpbmRlciA/PSByZXF1aXJlICcuL3BhaXItZmluZGVyJ1xuICAgIHN1cGVyXG5cblxuICBpc0FsbG93TmV4dExpbmU6IC0+XG4gICAgQGFsbG93TmV4dExpbmUgPyAoQHBhaXI/IGFuZCBAcGFpclswXSBpc250IEBwYWlyWzFdKVxuXG4gIGFkanVzdFJhbmdlOiAoe3N0YXJ0LCBlbmR9KSAtPlxuICAgICMgRGlydHkgd29yayB0byBmZWVsIG5hdHVyYWwgZm9yIGh1bWFuLCB0byBiZWhhdmUgY29tcGF0aWJsZSB3aXRoIHB1cmUgVmltLlxuICAgICMgV2hlcmUgdGhpcyBhZGp1c3RtZW50IGFwcGVhciBpcyBpbiBmb2xsb3dpbmcgc2l0dWF0aW9uLlxuICAgICMgb3AtMTogYGNpe2AgcmVwbGFjZSBvbmx5IDJuZCBsaW5lXG4gICAgIyBvcC0yOiBgZGl7YCBkZWxldGUgb25seSAybmQgbGluZS5cbiAgICAjIHRleHQ6XG4gICAgIyAge1xuICAgICMgICAgYWFhXG4gICAgIyAgfVxuICAgIGlmIHBvaW50SXNBdEVuZE9mTGluZShAZWRpdG9yLCBzdGFydClcbiAgICAgIHN0YXJ0ID0gc3RhcnQudHJhdmVyc2UoWzEsIDBdKVxuXG4gICAgaWYgZ2V0TGluZVRleHRUb0J1ZmZlclBvc2l0aW9uKEBlZGl0b3IsIGVuZCkubWF0Y2goL15cXHMqJC8pXG4gICAgICBpZiBAbW9kZSBpcyAndmlzdWFsJ1xuICAgICAgICAjIFRoaXMgaXMgc2xpZ2h0bHkgaW5uY29uc2lzdGVudCB3aXRoIHJlZ3VsYXIgVmltXG4gICAgICAgICMgLSByZWd1bGFyIFZpbTogc2VsZWN0IG5ldyBsaW5lIGFmdGVyIEVPTFxuICAgICAgICAjIC0gdmltLW1vZGUtcGx1czogc2VsZWN0IHRvIEVPTChiZWZvcmUgbmV3IGxpbmUpXG4gICAgICAgICMgVGhpcyBpcyBpbnRlbnRpb25hbCBzaW5jZSB0byBtYWtlIHN1Ym1vZGUgYGNoYXJhY3Rlcndpc2VgIHdoZW4gYXV0by1kZXRlY3Qgc3VibW9kZVxuICAgICAgICAjIGlubmVyRW5kID0gbmV3IFBvaW50KGlubmVyRW5kLnJvdyAtIDEsIEluZmluaXR5KVxuICAgICAgICBlbmQgPSBuZXcgUG9pbnQoZW5kLnJvdyAtIDEsIEluZmluaXR5KVxuICAgICAgZWxzZVxuICAgICAgICBlbmQgPSBuZXcgUG9pbnQoZW5kLnJvdywgMClcblxuICAgIG5ldyBSYW5nZShzdGFydCwgZW5kKVxuXG4gIGdldEZpbmRlcjogLT5cbiAgICBvcHRpb25zID0ge2FsbG93TmV4dExpbmU6IEBpc0FsbG93TmV4dExpbmUoKSwgQGFsbG93Rm9yd2FyZGluZywgQHBhaXIsIEBpbmNsdXNpdmV9XG4gICAgaWYgQHBhaXJbMF0gaXMgQHBhaXJbMV1cbiAgICAgIG5ldyBQYWlyRmluZGVyLlF1b3RlRmluZGVyKEBlZGl0b3IsIG9wdGlvbnMpXG4gICAgZWxzZVxuICAgICAgbmV3IFBhaXJGaW5kZXIuQnJhY2tldEZpbmRlcihAZWRpdG9yLCBvcHRpb25zKVxuXG4gIGdldFBhaXJJbmZvOiAoZnJvbSkgLT5cbiAgICBwYWlySW5mbyA9IEBnZXRGaW5kZXIoKS5maW5kKGZyb20pXG4gICAgdW5sZXNzIHBhaXJJbmZvP1xuICAgICAgcmV0dXJuIG51bGxcbiAgICBwYWlySW5mby5pbm5lclJhbmdlID0gQGFkanVzdFJhbmdlKHBhaXJJbmZvLmlubmVyUmFuZ2UpIGlmIEBhZGp1c3RJbm5lclJhbmdlXG4gICAgcGFpckluZm8udGFyZ2V0UmFuZ2UgPSBpZiBAaXNJbm5lcigpIHRoZW4gcGFpckluZm8uaW5uZXJSYW5nZSBlbHNlIHBhaXJJbmZvLmFSYW5nZVxuICAgIHBhaXJJbmZvXG5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgb3JpZ2luYWxSYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgcGFpckluZm8gPSBAZ2V0UGFpckluZm8oQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikpXG4gICAgIyBXaGVuIHJhbmdlIHdhcyBzYW1lLCB0cnkgdG8gZXhwYW5kIHJhbmdlXG4gICAgaWYgcGFpckluZm8/LnRhcmdldFJhbmdlLmlzRXF1YWwob3JpZ2luYWxSYW5nZSlcbiAgICAgIHBhaXJJbmZvID0gQGdldFBhaXJJbmZvKHBhaXJJbmZvLmFSYW5nZS5lbmQpXG4gICAgcGFpckluZm8/LnRhcmdldFJhbmdlXG5cbiMgVXNlZCBieSBEZWxldGVTdXJyb3VuZFxuY2xhc3MgQVBhaXIgZXh0ZW5kcyBQYWlyXG4gIEBleHRlbmQoZmFsc2UpXG5cbmNsYXNzIEFueVBhaXIgZXh0ZW5kcyBQYWlyXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICBhbGxvd0ZvcndhcmRpbmc6IGZhbHNlXG4gIG1lbWJlcjogW1xuICAgICdEb3VibGVRdW90ZScsICdTaW5nbGVRdW90ZScsICdCYWNrVGljaycsXG4gICAgJ0N1cmx5QnJhY2tldCcsICdBbmdsZUJyYWNrZXQnLCAnU3F1YXJlQnJhY2tldCcsICdQYXJlbnRoZXNpcydcbiAgXVxuXG4gIGdldFJhbmdlczogKHNlbGVjdGlvbikgLT5cbiAgICBAbWVtYmVyXG4gICAgICAubWFwIChrbGFzcykgPT4gQG5ldyhrbGFzcywge0Bpbm5lciwgQGFsbG93Rm9yd2FyZGluZywgQGluY2x1c2l2ZX0pLmdldFJhbmdlKHNlbGVjdGlvbilcbiAgICAgIC5maWx0ZXIgKHJhbmdlKSAtPiByYW5nZT9cblxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICBfLmxhc3Qoc29ydFJhbmdlcyhAZ2V0UmFuZ2VzKHNlbGVjdGlvbikpKVxuXG5jbGFzcyBBbnlQYWlyQWxsb3dGb3J3YXJkaW5nIGV4dGVuZHMgQW55UGFpclxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgQGRlc2NyaXB0aW9uOiBcIlJhbmdlIHN1cnJvdW5kZWQgYnkgYXV0by1kZXRlY3RlZCBwYWlyZWQgY2hhcnMgZnJvbSBlbmNsb3NlZCBhbmQgZm9yd2FyZGluZyBhcmVhXCJcbiAgYWxsb3dGb3J3YXJkaW5nOiB0cnVlXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIHJhbmdlcyA9IEBnZXRSYW5nZXMoc2VsZWN0aW9uKVxuICAgIGZyb20gPSBzZWxlY3Rpb24uY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICBbZm9yd2FyZGluZ1JhbmdlcywgZW5jbG9zaW5nUmFuZ2VzXSA9IF8ucGFydGl0aW9uIHJhbmdlcywgKHJhbmdlKSAtPlxuICAgICAgcmFuZ2Uuc3RhcnQuaXNHcmVhdGVyVGhhbk9yRXF1YWwoZnJvbSlcbiAgICBlbmNsb3NpbmdSYW5nZSA9IF8ubGFzdChzb3J0UmFuZ2VzKGVuY2xvc2luZ1JhbmdlcykpXG4gICAgZm9yd2FyZGluZ1JhbmdlcyA9IHNvcnRSYW5nZXMoZm9yd2FyZGluZ1JhbmdlcylcblxuICAgICMgV2hlbiBlbmNsb3NpbmdSYW5nZSBpcyBleGlzdHMsXG4gICAgIyBXZSBkb24ndCBnbyBhY3Jvc3MgZW5jbG9zaW5nUmFuZ2UuZW5kLlxuICAgICMgU28gY2hvb3NlIGZyb20gcmFuZ2VzIGNvbnRhaW5lZCBpbiBlbmNsb3NpbmdSYW5nZS5cbiAgICBpZiBlbmNsb3NpbmdSYW5nZVxuICAgICAgZm9yd2FyZGluZ1JhbmdlcyA9IGZvcndhcmRpbmdSYW5nZXMuZmlsdGVyIChyYW5nZSkgLT5cbiAgICAgICAgZW5jbG9zaW5nUmFuZ2UuY29udGFpbnNSYW5nZShyYW5nZSlcblxuICAgIGZvcndhcmRpbmdSYW5nZXNbMF0gb3IgZW5jbG9zaW5nUmFuZ2VcblxuY2xhc3MgQW55UXVvdGUgZXh0ZW5kcyBBbnlQYWlyXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICBhbGxvd0ZvcndhcmRpbmc6IHRydWVcbiAgbWVtYmVyOiBbJ0RvdWJsZVF1b3RlJywgJ1NpbmdsZVF1b3RlJywgJ0JhY2tUaWNrJ11cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgcmFuZ2VzID0gQGdldFJhbmdlcyhzZWxlY3Rpb24pXG4gICAgIyBQaWNrIHJhbmdlIHdoaWNoIGVuZC5jb2x1bSBpcyBsZWZ0bW9zdChtZWFuLCBjbG9zZWQgZmlyc3QpXG4gICAgXy5maXJzdChfLnNvcnRCeShyYW5nZXMsIChyKSAtPiByLmVuZC5jb2x1bW4pKSBpZiByYW5nZXMubGVuZ3RoXG5cbmNsYXNzIFF1b3RlIGV4dGVuZHMgUGFpclxuICBAZXh0ZW5kKGZhbHNlKVxuICBhbGxvd0ZvcndhcmRpbmc6IHRydWVcblxuY2xhc3MgRG91YmxlUXVvdGUgZXh0ZW5kcyBRdW90ZVxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgcGFpcjogWydcIicsICdcIiddXG5cbmNsYXNzIFNpbmdsZVF1b3RlIGV4dGVuZHMgUXVvdGVcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIHBhaXI6IFtcIidcIiwgXCInXCJdXG5cbmNsYXNzIEJhY2tUaWNrIGV4dGVuZHMgUXVvdGVcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIHBhaXI6IFsnYCcsICdgJ11cblxuY2xhc3MgQ3VybHlCcmFja2V0IGV4dGVuZHMgUGFpclxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgQGRlcml2ZUlubmVyQW5kQUZvckFsbG93Rm9yd2FyZGluZygpXG4gIHBhaXI6IFsneycsICd9J11cblxuY2xhc3MgU3F1YXJlQnJhY2tldCBleHRlbmRzIFBhaXJcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIEBkZXJpdmVJbm5lckFuZEFGb3JBbGxvd0ZvcndhcmRpbmcoKVxuICBwYWlyOiBbJ1snLCAnXSddXG5cbmNsYXNzIFBhcmVudGhlc2lzIGV4dGVuZHMgUGFpclxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgQGRlcml2ZUlubmVyQW5kQUZvckFsbG93Rm9yd2FyZGluZygpXG4gIHBhaXI6IFsnKCcsICcpJ11cblxuY2xhc3MgQW5nbGVCcmFja2V0IGV4dGVuZHMgUGFpclxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgQGRlcml2ZUlubmVyQW5kQUZvckFsbG93Rm9yd2FyZGluZygpXG4gIHBhaXI6IFsnPCcsICc+J11cblxuY2xhc3MgVGFnIGV4dGVuZHMgUGFpclxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgYWxsb3dOZXh0TGluZTogdHJ1ZVxuICBhbGxvd0ZvcndhcmRpbmc6IHRydWVcbiAgYWRqdXN0SW5uZXJSYW5nZTogZmFsc2VcblxuICBnZXRUYWdTdGFydFBvaW50OiAoZnJvbSkgLT5cbiAgICB0YWdSYW5nZSA9IG51bGxcbiAgICBwYXR0ZXJuID0gUGFpckZpbmRlci5UYWdGaW5kZXIucGF0dGVyblxuICAgIEBzY2FuRm9yd2FyZCBwYXR0ZXJuLCB7ZnJvbTogW2Zyb20ucm93LCAwXX0sICh7cmFuZ2UsIHN0b3B9KSAtPlxuICAgICAgaWYgcmFuZ2UuY29udGFpbnNQb2ludChmcm9tLCB0cnVlKVxuICAgICAgICB0YWdSYW5nZSA9IHJhbmdlXG4gICAgICAgIHN0b3AoKVxuICAgIHRhZ1JhbmdlPy5zdGFydFxuXG4gIGdldEZpbmRlcjogLT5cbiAgICBuZXcgUGFpckZpbmRlci5UYWdGaW5kZXIoQGVkaXRvciwge2FsbG93TmV4dExpbmU6IEBpc0FsbG93TmV4dExpbmUoKSwgQGFsbG93Rm9yd2FyZGluZywgQGluY2x1c2l2ZX0pXG5cbiAgZ2V0UGFpckluZm86IChmcm9tKSAtPlxuICAgIHN1cGVyKEBnZXRUYWdTdGFydFBvaW50KGZyb20pID8gZnJvbSlcblxuIyBTZWN0aW9uOiBQYXJhZ3JhcGhcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBQYXJhZ3JhcGggaXMgZGVmaW5lZCBhcyBjb25zZWN1dGl2ZSAobm9uLSlibGFuay1saW5lLlxuY2xhc3MgUGFyYWdyYXBoIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICBzdXBwb3J0Q291bnQ6IHRydWVcblxuICBmaW5kUm93OiAoZnJvbVJvdywgZGlyZWN0aW9uLCBmbikgLT5cbiAgICBmbi5yZXNldD8oKVxuICAgIGZvdW5kUm93ID0gZnJvbVJvd1xuICAgIGZvciByb3cgaW4gZ2V0QnVmZmVyUm93cyhAZWRpdG9yLCB7c3RhcnRSb3c6IGZyb21Sb3csIGRpcmVjdGlvbn0pXG4gICAgICBicmVhayB1bmxlc3MgZm4ocm93LCBkaXJlY3Rpb24pXG4gICAgICBmb3VuZFJvdyA9IHJvd1xuXG4gICAgZm91bmRSb3dcblxuICBmaW5kUm93UmFuZ2VCeTogKGZyb21Sb3csIGZuKSAtPlxuICAgIHN0YXJ0Um93ID0gQGZpbmRSb3coZnJvbVJvdywgJ3ByZXZpb3VzJywgZm4pXG4gICAgZW5kUm93ID0gQGZpbmRSb3coZnJvbVJvdywgJ25leHQnLCBmbilcbiAgICBbc3RhcnRSb3csIGVuZFJvd11cblxuICBnZXRQcmVkaWN0RnVuY3Rpb246IChmcm9tUm93LCBzZWxlY3Rpb24pIC0+XG4gICAgZnJvbVJvd1Jlc3VsdCA9IEBlZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhmcm9tUm93KVxuXG4gICAgaWYgQGlzSW5uZXIoKVxuICAgICAgcHJlZGljdCA9IChyb3csIGRpcmVjdGlvbikgPT5cbiAgICAgICAgQGVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHJvdykgaXMgZnJvbVJvd1Jlc3VsdFxuICAgIGVsc2VcbiAgICAgIGlmIHNlbGVjdGlvbi5pc1JldmVyc2VkKClcbiAgICAgICAgZGlyZWN0aW9uVG9FeHRlbmQgPSAncHJldmlvdXMnXG4gICAgICBlbHNlXG4gICAgICAgIGRpcmVjdGlvblRvRXh0ZW5kID0gJ25leHQnXG5cbiAgICAgIGZsaXAgPSBmYWxzZVxuICAgICAgcHJlZGljdCA9IChyb3csIGRpcmVjdGlvbikgPT5cbiAgICAgICAgcmVzdWx0ID0gQGVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHJvdykgaXMgZnJvbVJvd1Jlc3VsdFxuICAgICAgICBpZiBmbGlwXG4gICAgICAgICAgbm90IHJlc3VsdFxuICAgICAgICBlbHNlXG4gICAgICAgICAgaWYgKG5vdCByZXN1bHQpIGFuZCAoZGlyZWN0aW9uIGlzIGRpcmVjdGlvblRvRXh0ZW5kKVxuICAgICAgICAgICAgZmxpcCA9IHRydWVcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgcmVzdWx0XG5cbiAgICAgIHByZWRpY3QucmVzZXQgPSAtPlxuICAgICAgICBmbGlwID0gZmFsc2VcbiAgICBwcmVkaWN0XG5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgb3JpZ2luYWxSYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgZnJvbVJvdyA9IEBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pLnJvd1xuICAgIGlmIEBpc01vZGUoJ3Zpc3VhbCcsICdsaW5ld2lzZScpXG4gICAgICBpZiBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpXG4gICAgICAgIGZyb21Sb3ctLVxuICAgICAgZWxzZVxuICAgICAgICBmcm9tUm93KytcbiAgICAgIGZyb21Sb3cgPSBnZXRWYWxpZFZpbUJ1ZmZlclJvdyhAZWRpdG9yLCBmcm9tUm93KVxuXG4gICAgcm93UmFuZ2UgPSBAZmluZFJvd1JhbmdlQnkoZnJvbVJvdywgQGdldFByZWRpY3RGdW5jdGlvbihmcm9tUm93LCBzZWxlY3Rpb24pKVxuICAgIHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnVuaW9uKEBnZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKHJvd1JhbmdlKSlcblxuY2xhc3MgSW5kZW50YXRpb24gZXh0ZW5kcyBQYXJhZ3JhcGhcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgZnJvbVJvdyA9IEBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pLnJvd1xuXG4gICAgYmFzZUluZGVudExldmVsID0gQGdldEluZGVudExldmVsRm9yQnVmZmVyUm93KGZyb21Sb3cpXG4gICAgcHJlZGljdCA9IChyb3cpID0+XG4gICAgICBpZiBAZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsocm93KVxuICAgICAgICBAaXNBKClcbiAgICAgIGVsc2VcbiAgICAgICAgQGdldEluZGVudExldmVsRm9yQnVmZmVyUm93KHJvdykgPj0gYmFzZUluZGVudExldmVsXG5cbiAgICByb3dSYW5nZSA9IEBmaW5kUm93UmFuZ2VCeShmcm9tUm93LCBwcmVkaWN0KVxuICAgIEBnZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKHJvd1JhbmdlKVxuXG4jIFNlY3Rpb246IENvbW1lbnRcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQ29tbWVudCBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcblxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICByb3cgPSBAZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKS5yb3dcbiAgICByb3dSYW5nZSA9IEBlZGl0b3IubGFuZ3VhZ2VNb2RlLnJvd1JhbmdlRm9yQ29tbWVudEF0QnVmZmVyUm93KHJvdylcbiAgICByb3dSYW5nZSA/PSBbcm93LCByb3ddIGlmIEBlZGl0b3IuaXNCdWZmZXJSb3dDb21tZW50ZWQocm93KVxuICAgIGlmIHJvd1JhbmdlP1xuICAgICAgQGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2Uocm93UmFuZ2UpXG5cbmNsYXNzIENvbW1lbnRPclBhcmFncmFwaCBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcblxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICBmb3Iga2xhc3MgaW4gWydDb21tZW50JywgJ1BhcmFncmFwaCddXG4gICAgICBpZiByYW5nZSA9IEBuZXcoa2xhc3MsIHtAaW5uZXJ9KS5nZXRSYW5nZShzZWxlY3Rpb24pXG4gICAgICAgIHJldHVybiByYW5nZVxuXG4jIFNlY3Rpb246IEZvbGRcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgRm9sZCBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcblxuICBhZGp1c3RSb3dSYW5nZTogKHJvd1JhbmdlKSAtPlxuICAgIHJldHVybiByb3dSYW5nZSBpZiBAaXNBKClcblxuICAgIFtzdGFydFJvdywgZW5kUm93XSA9IHJvd1JhbmdlXG4gICAgaWYgQGdldEluZGVudExldmVsRm9yQnVmZmVyUm93KHN0YXJ0Um93KSBpcyBAZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3coZW5kUm93KVxuICAgICAgZW5kUm93IC09IDFcbiAgICBzdGFydFJvdyArPSAxXG4gICAgW3N0YXJ0Um93LCBlbmRSb3ddXG5cbiAgZ2V0Rm9sZFJvd1Jhbmdlc0NvbnRhaW5zRm9yUm93OiAocm93KSAtPlxuICAgIGdldENvZGVGb2xkUm93UmFuZ2VzQ29udGFpbmVzRm9yUm93KEBlZGl0b3IsIHJvdykucmV2ZXJzZSgpXG5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgcm93ID0gQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikucm93XG4gICAgc2VsZWN0ZWRSYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgZm9yIHJvd1JhbmdlIGluIEBnZXRGb2xkUm93UmFuZ2VzQ29udGFpbnNGb3JSb3cocm93KVxuICAgICAgcmFuZ2UgPSBAZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShAYWRqdXN0Um93UmFuZ2Uocm93UmFuZ2UpKVxuXG4gICAgICAjIERvbid0IGNoYW5nZSB0byBgaWYgcmFuZ2UuY29udGFpbnNSYW5nZShzZWxlY3RlZFJhbmdlLCB0cnVlKWBcbiAgICAgICMgVGhlcmUgaXMgYmVoYXZpb3IgZGlmZiB3aGVuIGN1cnNvciBpcyBhdCBiZWdpbm5pbmcgb2YgbGluZSggY29sdW1uIDAgKS5cbiAgICAgIHVubGVzcyBzZWxlY3RlZFJhbmdlLmNvbnRhaW5zUmFuZ2UocmFuZ2UpXG4gICAgICAgIHJldHVybiByYW5nZVxuXG4jIE5PVEU6IEZ1bmN0aW9uIHJhbmdlIGRldGVybWluYXRpb24gaXMgZGVwZW5kaW5nIG9uIGZvbGQuXG5jbGFzcyBGdW5jdGlvbiBleHRlbmRzIEZvbGRcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gICMgU29tZSBsYW5ndWFnZSBkb24ndCBpbmNsdWRlIGNsb3NpbmcgYH1gIGludG8gZm9sZC5cbiAgc2NvcGVOYW1lc09taXR0aW5nRW5kUm93OiBbJ3NvdXJjZS5nbycsICdzb3VyY2UuZWxpeGlyJ11cblxuICBpc0dyYW1tYXJOb3RGb2xkRW5kUm93OiAtPlxuICAgIHtzY29wZU5hbWUsIHBhY2thZ2VOYW1lfSA9IEBlZGl0b3IuZ2V0R3JhbW1hcigpXG4gICAgaWYgc2NvcGVOYW1lIGluIEBzY29wZU5hbWVzT21pdHRpbmdFbmRSb3dcbiAgICAgIHRydWVcbiAgICBlbHNlXG4gICAgICAjIEhBQ0s6IFJ1c3QgaGF2ZSB0d28gcGFja2FnZSBgbGFuZ3VhZ2UtcnVzdGAgYW5kIGBhdG9tLWxhbmd1YWdlLXJ1c3RgXG4gICAgICAjIGxhbmd1YWdlLXJ1c3QgZG9uJ3QgZm9sZCBlbmRpbmcgYH1gLCBidXQgYXRvbS1sYW5ndWFnZS1ydXN0IGRvZXMuXG4gICAgICBzY29wZU5hbWUgaXMgJ3NvdXJjZS5ydXN0JyBhbmQgcGFja2FnZU5hbWUgaXMgXCJsYW5ndWFnZS1ydXN0XCJcblxuICBnZXRGb2xkUm93UmFuZ2VzQ29udGFpbnNGb3JSb3c6IChyb3cpIC0+XG4gICAgKHN1cGVyKS5maWx0ZXIgKHJvd1JhbmdlKSA9PlxuICAgICAgaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvdyhAZWRpdG9yLCByb3dSYW5nZVswXSlcblxuICBhZGp1c3RSb3dSYW5nZTogKHJvd1JhbmdlKSAtPlxuICAgIFtzdGFydFJvdywgZW5kUm93XSA9IHN1cGVyXG4gICAgIyBOT1RFOiBUaGlzIGFkanVzdG1lbnQgc2hvdWQgbm90IGJlIG5lY2Vzc2FyeSBpZiBsYW5ndWFnZS1zeW50YXggaXMgcHJvcGVybHkgZGVmaW5lZC5cbiAgICBpZiBAaXNBKCkgYW5kIEBpc0dyYW1tYXJOb3RGb2xkRW5kUm93KClcbiAgICAgIGVuZFJvdyArPSAxXG4gICAgW3N0YXJ0Um93LCBlbmRSb3ddXG5cbiMgU2VjdGlvbjogT3RoZXJcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgQXJndW1lbnRzIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcblxuICBuZXdBcmdJbmZvOiAoYXJnU3RhcnQsIGFyZywgc2VwYXJhdG9yKSAtPlxuICAgIGFyZ0VuZCA9IHRyYXZlcnNlVGV4dEZyb21Qb2ludChhcmdTdGFydCwgYXJnKVxuICAgIGFyZ1JhbmdlID0gbmV3IFJhbmdlKGFyZ1N0YXJ0LCBhcmdFbmQpXG5cbiAgICBzZXBhcmF0b3JFbmQgPSB0cmF2ZXJzZVRleHRGcm9tUG9pbnQoYXJnRW5kLCBzZXBhcmF0b3IgPyAnJylcbiAgICBzZXBhcmF0b3JSYW5nZSA9IG5ldyBSYW5nZShhcmdFbmQsIHNlcGFyYXRvckVuZClcblxuICAgIGlubmVyUmFuZ2UgPSBhcmdSYW5nZVxuICAgIGFSYW5nZSA9IGFyZ1JhbmdlLnVuaW9uKHNlcGFyYXRvclJhbmdlKVxuICAgIHthcmdSYW5nZSwgc2VwYXJhdG9yUmFuZ2UsIGlubmVyUmFuZ2UsIGFSYW5nZX1cblxuICBnZXRBcmd1bWVudHNSYW5nZUZvclNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBtZW1iZXIgPSBbXG4gICAgICAnQ3VybHlCcmFja2V0J1xuICAgICAgJ1NxdWFyZUJyYWNrZXQnXG4gICAgICAnUGFyZW50aGVzaXMnXG4gICAgXVxuICAgIEBuZXcoXCJJbm5lckFueVBhaXJcIiwge2luY2x1c2l2ZTogZmFsc2UsIG1lbWJlcjogbWVtYmVyfSkuZ2V0UmFuZ2Uoc2VsZWN0aW9uKVxuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIHJhbmdlID0gQGdldEFyZ3VtZW50c1JhbmdlRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICBwYWlyUmFuZ2VGb3VuZCA9IHJhbmdlP1xuICAgIHJhbmdlID89IEBuZXcoXCJJbm5lckN1cnJlbnRMaW5lXCIpLmdldFJhbmdlKHNlbGVjdGlvbikgIyBmYWxsYmFja1xuICAgIHJldHVybiB1bmxlc3MgcmFuZ2VcblxuICAgIHJhbmdlID0gdHJpbVJhbmdlKEBlZGl0b3IsIHJhbmdlKVxuXG4gICAgdGV4dCA9IEBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgYWxsVG9rZW5zID0gc3BsaXRBcmd1bWVudHModGV4dCwgcGFpclJhbmdlRm91bmQpXG5cbiAgICBhcmdJbmZvcyA9IFtdXG4gICAgYXJnU3RhcnQgPSByYW5nZS5zdGFydFxuXG4gICAgIyBTa2lwIHN0YXJ0aW5nIHNlcGFyYXRvclxuICAgIGlmIGFsbFRva2Vucy5sZW5ndGggYW5kIGFsbFRva2Vuc1swXS50eXBlIGlzICdzZXBhcmF0b3InXG4gICAgICB0b2tlbiA9IGFsbFRva2Vucy5zaGlmdCgpXG4gICAgICBhcmdTdGFydCA9IHRyYXZlcnNlVGV4dEZyb21Qb2ludChhcmdTdGFydCwgdG9rZW4udGV4dClcblxuICAgIHdoaWxlIGFsbFRva2Vucy5sZW5ndGhcbiAgICAgIHRva2VuID0gYWxsVG9rZW5zLnNoaWZ0KClcbiAgICAgIGlmIHRva2VuLnR5cGUgaXMgJ2FyZ3VtZW50J1xuICAgICAgICBzZXBhcmF0b3IgPSBhbGxUb2tlbnMuc2hpZnQoKT8udGV4dFxuICAgICAgICBhcmdJbmZvID0gQG5ld0FyZ0luZm8oYXJnU3RhcnQsIHRva2VuLnRleHQsIHNlcGFyYXRvcilcblxuICAgICAgICBpZiAoYWxsVG9rZW5zLmxlbmd0aCBpcyAwKSBhbmQgKGxhc3RBcmdJbmZvID0gXy5sYXN0KGFyZ0luZm9zKSlcbiAgICAgICAgICBhcmdJbmZvLmFSYW5nZSA9IGFyZ0luZm8uYXJnUmFuZ2UudW5pb24obGFzdEFyZ0luZm8uc2VwYXJhdG9yUmFuZ2UpXG5cbiAgICAgICAgYXJnU3RhcnQgPSBhcmdJbmZvLmFSYW5nZS5lbmRcbiAgICAgICAgYXJnSW5mb3MucHVzaChhcmdJbmZvKVxuICAgICAgZWxzZVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ211c3Qgbm90IGhhcHBlbicpXG5cbiAgICBwb2ludCA9IEBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgZm9yIHtpbm5lclJhbmdlLCBhUmFuZ2V9IGluIGFyZ0luZm9zXG4gICAgICBpZiBpbm5lclJhbmdlLmVuZC5pc0dyZWF0ZXJUaGFuT3JFcXVhbChwb2ludClcbiAgICAgICAgcmV0dXJuIGlmIEBpc0lubmVyKCkgdGhlbiBpbm5lclJhbmdlIGVsc2UgYVJhbmdlXG4gICAgbnVsbFxuXG5jbGFzcyBDdXJyZW50TGluZSBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgcm93ID0gQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikucm93XG4gICAgcmFuZ2UgPSBAZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHJvdylcbiAgICBpZiBAaXNBKClcbiAgICAgIHJhbmdlXG4gICAgZWxzZVxuICAgICAgdHJpbVJhbmdlKEBlZGl0b3IsIHJhbmdlKVxuXG5jbGFzcyBFbnRpcmUgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIHNlbGVjdE9uY2U6IHRydWVcblxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICBAZWRpdG9yLmJ1ZmZlci5nZXRSYW5nZSgpXG5cbmNsYXNzIEVtcHR5IGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuICBzZWxlY3RPbmNlOiB0cnVlXG5cbmNsYXNzIExhdGVzdENoYW5nZSBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIHdpc2U6IG51bGxcbiAgc2VsZWN0T25jZTogdHJ1ZVxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICBzdGFydCA9IEB2aW1TdGF0ZS5tYXJrLmdldCgnWycpXG4gICAgZW5kID0gQHZpbVN0YXRlLm1hcmsuZ2V0KCddJylcbiAgICBpZiBzdGFydD8gYW5kIGVuZD9cbiAgICAgIG5ldyBSYW5nZShzdGFydCwgZW5kKVxuXG5jbGFzcyBTZWFyY2hNYXRjaEZvcndhcmQgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoKVxuICBiYWNrd2FyZDogZmFsc2VcblxuICBmaW5kTWF0Y2g6IChmcm9tUG9pbnQsIHBhdHRlcm4pIC0+XG4gICAgZnJvbVBvaW50ID0gdHJhbnNsYXRlUG9pbnRBbmRDbGlwKEBlZGl0b3IsIGZyb21Qb2ludCwgXCJmb3J3YXJkXCIpIGlmIChAbW9kZSBpcyAndmlzdWFsJylcbiAgICBmb3VuZCA9IG51bGxcbiAgICBAc2NhbkZvcndhcmQgcGF0dGVybiwge2Zyb206IFtmcm9tUG9pbnQucm93LCAwXX0sICh7cmFuZ2UsIHN0b3B9KSAtPlxuICAgICAgaWYgcmFuZ2UuZW5kLmlzR3JlYXRlclRoYW4oZnJvbVBvaW50KVxuICAgICAgICBmb3VuZCA9IHJhbmdlXG4gICAgICAgIHN0b3AoKVxuICAgIHtyYW5nZTogZm91bmQsIHdoaWNoSXNIZWFkOiAnZW5kJ31cblxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICBwYXR0ZXJuID0gQGdsb2JhbFN0YXRlLmdldCgnbGFzdFNlYXJjaFBhdHRlcm4nKVxuICAgIHJldHVybiB1bmxlc3MgcGF0dGVybj9cblxuICAgIGZyb21Qb2ludCA9IHNlbGVjdGlvbi5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKVxuICAgIHtyYW5nZSwgd2hpY2hJc0hlYWR9ID0gQGZpbmRNYXRjaChmcm9tUG9pbnQsIHBhdHRlcm4pXG4gICAgaWYgcmFuZ2U/XG4gICAgICBAdW5pb25SYW5nZUFuZERldGVybWluZVJldmVyc2VkU3RhdGUoc2VsZWN0aW9uLCByYW5nZSwgd2hpY2hJc0hlYWQpXG5cbiAgdW5pb25SYW5nZUFuZERldGVybWluZVJldmVyc2VkU3RhdGU6IChzZWxlY3Rpb24sIGZvdW5kLCB3aGljaElzSGVhZCkgLT5cbiAgICBpZiBzZWxlY3Rpb24uaXNFbXB0eSgpXG4gICAgICBmb3VuZFxuICAgIGVsc2VcbiAgICAgIGhlYWQgPSBmb3VuZFt3aGljaElzSGVhZF1cbiAgICAgIHRhaWwgPSBzZWxlY3Rpb24uZ2V0VGFpbEJ1ZmZlclBvc2l0aW9uKClcblxuICAgICAgaWYgQGJhY2t3YXJkXG4gICAgICAgIGhlYWQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAoQGVkaXRvciwgaGVhZCwgJ2ZvcndhcmQnKSBpZiB0YWlsLmlzTGVzc1RoYW4oaGVhZClcbiAgICAgIGVsc2VcbiAgICAgICAgaGVhZCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcChAZWRpdG9yLCBoZWFkLCAnYmFja3dhcmQnKSBpZiBoZWFkLmlzTGVzc1RoYW4odGFpbClcblxuICAgICAgQHJldmVyc2VkID0gaGVhZC5pc0xlc3NUaGFuKHRhaWwpXG4gICAgICBuZXcgUmFuZ2UodGFpbCwgaGVhZCkudW5pb24oQHN3cmFwKHNlbGVjdGlvbikuZ2V0VGFpbEJ1ZmZlclJhbmdlKCkpXG5cbiAgc2VsZWN0VGV4dE9iamVjdDogKHNlbGVjdGlvbikgLT5cbiAgICBpZiByYW5nZSA9IEBnZXRSYW5nZShzZWxlY3Rpb24pXG4gICAgICBAc3dyYXAoc2VsZWN0aW9uKS5zZXRCdWZmZXJSYW5nZShyYW5nZSwge3JldmVyc2VkOiBAcmV2ZXJzZWQgPyBAYmFja3dhcmR9KVxuICAgICAgcmV0dXJuIHRydWVcblxuY2xhc3MgU2VhcmNoTWF0Y2hCYWNrd2FyZCBleHRlbmRzIFNlYXJjaE1hdGNoRm9yd2FyZFxuICBAZXh0ZW5kKClcbiAgYmFja3dhcmQ6IHRydWVcblxuICBmaW5kTWF0Y2g6IChmcm9tUG9pbnQsIHBhdHRlcm4pIC0+XG4gICAgZnJvbVBvaW50ID0gdHJhbnNsYXRlUG9pbnRBbmRDbGlwKEBlZGl0b3IsIGZyb21Qb2ludCwgXCJiYWNrd2FyZFwiKSBpZiAoQG1vZGUgaXMgJ3Zpc3VhbCcpXG4gICAgZm91bmQgPSBudWxsXG4gICAgQHNjYW5CYWNrd2FyZCBwYXR0ZXJuLCB7ZnJvbTogW2Zyb21Qb2ludC5yb3csIEluZmluaXR5XX0sICh7cmFuZ2UsIHN0b3B9KSAtPlxuICAgICAgaWYgcmFuZ2Uuc3RhcnQuaXNMZXNzVGhhbihmcm9tUG9pbnQpXG4gICAgICAgIGZvdW5kID0gcmFuZ2VcbiAgICAgICAgc3RvcCgpXG4gICAge3JhbmdlOiBmb3VuZCwgd2hpY2hJc0hlYWQ6ICdzdGFydCd9XG5cbiMgW0xpbWl0YXRpb246IHdvbid0IGZpeF06IFNlbGVjdGVkIHJhbmdlIGlzIG5vdCBzdWJtb2RlIGF3YXJlLiBhbHdheXMgY2hhcmFjdGVyd2lzZS5cbiMgU28gZXZlbiBpZiBvcmlnaW5hbCBzZWxlY3Rpb24gd2FzIHZMIG9yIHZCLCBzZWxlY3RlZCByYW5nZSBieSB0aGlzIHRleHQtb2JqZWN0XG4jIGlzIGFsd2F5cyB2QyByYW5nZS5cbmNsYXNzIFByZXZpb3VzU2VsZWN0aW9uIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKClcbiAgd2lzZTogbnVsbFxuICBzZWxlY3RPbmNlOiB0cnVlXG5cbiAgc2VsZWN0VGV4dE9iamVjdDogKHNlbGVjdGlvbikgLT5cbiAgICB7cHJvcGVydGllcywgc3VibW9kZX0gPSBAdmltU3RhdGUucHJldmlvdXNTZWxlY3Rpb25cbiAgICBpZiBwcm9wZXJ0aWVzPyBhbmQgc3VibW9kZT9cbiAgICAgIEB3aXNlID0gc3VibW9kZVxuICAgICAgQHN3cmFwKEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKS5zZWxlY3RCeVByb3BlcnRpZXMocHJvcGVydGllcylcbiAgICAgIHJldHVybiB0cnVlXG5cbmNsYXNzIFBlcnNpc3RlbnRTZWxlY3Rpb24gZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICB3aXNlOiBudWxsXG4gIHNlbGVjdE9uY2U6IHRydWVcblxuICBzZWxlY3RUZXh0T2JqZWN0OiAoc2VsZWN0aW9uKSAtPlxuICAgIGlmIEB2aW1TdGF0ZS5oYXNQZXJzaXN0ZW50U2VsZWN0aW9ucygpXG4gICAgICBAdmltU3RhdGUucGVyc2lzdGVudFNlbGVjdGlvbi5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlcygpXG4gICAgICByZXR1cm4gdHJ1ZVxuXG5jbGFzcyBWaXNpYmxlQXJlYSBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIHNlbGVjdE9uY2U6IHRydWVcblxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICAjIFtCVUc/XSBOZWVkIHRyYW5zbGF0ZSB0byBzaGlsbmsgdG9wIGFuZCBib3R0b20gdG8gZml0IGFjdHVhbCByb3cuXG4gICAgIyBUaGUgcmVhc29uIEkgbmVlZCAtMiBhdCBib3R0b20gaXMgYmVjYXVzZSBvZiBzdGF0dXMgYmFyP1xuICAgIGJ1ZmZlclJhbmdlID0gZ2V0VmlzaWJsZUJ1ZmZlclJhbmdlKEBlZGl0b3IpXG4gICAgaWYgYnVmZmVyUmFuZ2UuZ2V0Um93cygpID4gQGVkaXRvci5nZXRSb3dzUGVyUGFnZSgpXG4gICAgICBidWZmZXJSYW5nZS50cmFuc2xhdGUoWysxLCAwXSwgWy0zLCAwXSlcbiAgICBlbHNlXG4gICAgICBidWZmZXJSYW5nZVxuIl19
