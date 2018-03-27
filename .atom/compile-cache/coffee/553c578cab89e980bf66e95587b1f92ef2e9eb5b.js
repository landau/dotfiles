(function() {
  var APair, AngleBracket, AnyPair, AnyPairAllowForwarding, AnyQuote, Arguments, BackTick, Base, Comment, CommentOrParagraph, CurlyBracket, CurrentLine, DoubleQuote, Empty, Entire, Fold, Function, Indentation, LastPastedRange, LatestChange, Pair, PairFinder, Paragraph, Parenthesis, PersistentSelection, Point, PreviousSelection, Quote, Range, SearchMatchBackward, SearchMatchForward, SingleQuote, SmartWord, SquareBracket, Subword, Tag, TextObject, VisibleArea, WholeWord, Word, _, expandRangeToWhiteSpaces, getBufferRows, getCodeFoldRowRangesContainesForRow, getLineTextToBufferPosition, getValidVimBufferRow, getVisibleBufferRange, isIncludeFunctionScopeForRow, pointIsAtEndOfLine, ref, ref1, sortRanges, splitArguments, translatePointAndClip, traverseTextFromPoint, trimRange,
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
                if (this.getConfig('stayOnSelectTextObject')) {
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

  LastPastedRange = (function(superClass) {
    extend(LastPastedRange, superClass);

    function LastPastedRange() {
      return LastPastedRange.__super__.constructor.apply(this, arguments);
    }

    LastPastedRange.extend(false);

    LastPastedRange.prototype.wise = null;

    LastPastedRange.prototype.selectOnce = true;

    LastPastedRange.prototype.selectTextObject = function(selection) {
      var i, len, range, ref2;
      ref2 = this.editor.getSelections();
      for (i = 0, len = ref2.length; i < len; i++) {
        selection = ref2[i];
        range = this.vimState.sequentialPasteManager.getPastedRangeForSelection(selection);
        selection.setBufferRange(range);
      }
      return true;
    };

    return LastPastedRange;

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvdGV4dC1vYmplY3QuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxxd0JBQUE7SUFBQTs7OztFQUFBLE1BQWlCLE9BQUEsQ0FBUSxNQUFSLENBQWpCLEVBQUMsaUJBQUQsRUFBUTs7RUFDUixDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUtKLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFDUCxPQWNJLE9BQUEsQ0FBUSxTQUFSLENBZEosRUFDRSw4REFERixFQUVFLDhFQUZGLEVBR0UsZ0VBSEYsRUFJRSx3REFKRixFQUtFLGtEQUxGLEVBTUUsa0RBTkYsRUFPRSxrQ0FQRixFQVFFLGdEQVJGLEVBU0UsMEJBVEYsRUFVRSw0QkFWRixFQVdFLDRDQVhGLEVBWUUsb0NBWkYsRUFhRTs7RUFFRixVQUFBLEdBQWE7O0VBRVA7OztJQUNKLFVBQUMsQ0FBQSxNQUFELENBQVEsS0FBUjs7SUFDQSxVQUFDLENBQUEsYUFBRCxHQUFnQjs7eUJBQ2hCLElBQUEsR0FBTTs7eUJBQ04sWUFBQSxHQUFjOzt5QkFDZCxVQUFBLEdBQVk7O0lBRVosVUFBQyxDQUFBLGVBQUQsR0FBa0IsU0FBQTtNQUNoQixJQUFDLENBQUEsYUFBRCxDQUFlLEdBQUEsR0FBTSxJQUFDLENBQUEsSUFBdEIsRUFBNEIsS0FBNUI7YUFDQSxJQUFDLENBQUEsYUFBRCxDQUFlLE9BQUEsR0FBVSxJQUFDLENBQUEsSUFBMUIsRUFBZ0MsSUFBaEM7SUFGZ0I7O0lBSWxCLFVBQUMsQ0FBQSxpQ0FBRCxHQUFvQyxTQUFBO01BQ2xDLElBQUMsQ0FBQSxhQUFELENBQWUsR0FBQSxHQUFNLElBQUMsQ0FBQSxJQUFQLEdBQWMsaUJBQTdCLEVBQWdELEtBQWhELEVBQXVELElBQXZEO2FBQ0EsSUFBQyxDQUFBLGFBQUQsQ0FBZSxPQUFB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UixVQUFBO01BQUEsV0FBQSxHQUFjLHFCQUFBLENBQXNCLElBQUMsQ0FBQSxNQUF2QjtNQUNkLElBQUcsV0FBVyxDQUFDLE9BQVosQ0FBQSxDQUFBLEdBQXdCLElBQUMsQ0FBQSxNQUFNLENBQUMsY0FBUixDQUFBLENBQTNCO2VBQ0UsV0FBVyxDQUFDLFNBQVosQ0FBc0IsQ0FBQyxDQUFDLENBQUYsRUFBSyxDQUFMLENBQXRCLEVBQStCLENBQUMsQ0FBQyxDQUFGLEVBQUssQ0FBTCxDQUEvQixFQURGO09BQUEsTUFBQTtlQUdFLFlBSEY7O0lBSlE7Ozs7S0FMYztBQTFyQjFCIiwic291cmNlc0NvbnRlbnQiOlsie1JhbmdlLCBQb2ludH0gPSByZXF1aXJlICdhdG9tJ1xuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxuIyBbVE9ET10gTmVlZCBvdmVyaGF1bFxuIyAgLSBbIF0gTWFrZSBleHBhbmRhYmxlIGJ5IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnVuaW9uKEBnZXRSYW5nZShzZWxlY3Rpb24pKVxuIyAgLSBbIF0gQ291bnQgc3VwcG9ydChwcmlvcml0eSBsb3cpP1xuQmFzZSA9IHJlcXVpcmUgJy4vYmFzZSdcbntcbiAgZ2V0TGluZVRleHRUb0J1ZmZlclBvc2l0aW9uXG4gIGdldENvZGVGb2xkUm93UmFuZ2VzQ29udGFpbmVzRm9yUm93XG4gIGlzSW5jbHVkZUZ1bmN0aW9uU2NvcGVGb3JSb3dcbiAgZXhwYW5kUmFuZ2VUb1doaXRlU3BhY2VzXG4gIGdldFZpc2libGVCdWZmZXJSYW5nZVxuICB0cmFuc2xhdGVQb2ludEFuZENsaXBcbiAgZ2V0QnVmZmVyUm93c1xuICBnZXRWYWxpZFZpbUJ1ZmZlclJvd1xuICB0cmltUmFuZ2VcbiAgc29ydFJhbmdlc1xuICBwb2ludElzQXRFbmRPZkxpbmVcbiAgc3BsaXRBcmd1bWVudHNcbiAgdHJhdmVyc2VUZXh0RnJvbVBvaW50XG59ID0gcmVxdWlyZSAnLi91dGlscydcblBhaXJGaW5kZXIgPSBudWxsXG5cbmNsYXNzIFRleHRPYmplY3QgZXh0ZW5kcyBCYXNlXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBvcGVyYXRpb25LaW5kOiAndGV4dC1vYmplY3QnXG4gIHdpc2U6ICdjaGFyYWN0ZXJ3aXNlJ1xuICBzdXBwb3J0Q291bnQ6IGZhbHNlICMgRklYTUUgIzQ3MiwgIzY2XG4gIHNlbGVjdE9uY2U6IGZhbHNlXG5cbiAgQGRlcml2ZUlubmVyQW5kQTogLT5cbiAgICBAZ2VuZXJhdGVDbGFzcyhcIkFcIiArIEBuYW1lLCBmYWxzZSlcbiAgICBAZ2VuZXJhdGVDbGFzcyhcIklubmVyXCIgKyBAbmFtZSwgdHJ1ZSlcblxuICBAZGVyaXZlSW5uZXJBbmRBRm9yQWxsb3dGb3J3YXJkaW5nOiAtPlxuICAgIEBnZW5lcmF0ZUNsYXNzKFwiQVwiICsgQG5hbWUgKyBcIkFsbG93Rm9yd2FyZGluZ1wiLCBmYWxzZSwgdHJ1ZSlcbiAgICBAZ2VuZXJhdGVDbGFzcyhcIklubmVyXCIgKyBAbmFtZSArIFwiQWxsb3dGb3J3YXJkaW5nXCIsIHRydWUsIHRydWUpXG5cbiAgQGdlbmVyYXRlQ2xhc3M6IChrbGFzc05hbWUsIGlubmVyLCBhbGxvd0ZvcndhcmRpbmcpIC0+XG4gICAga2xhc3MgPSBjbGFzcyBleHRlbmRzIHRoaXNcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkga2xhc3MsICduYW1lJywgZ2V0OiAtPiBrbGFzc05hbWVcbiAgICBrbGFzczo6aW5uZXIgPSBpbm5lclxuICAgIGtsYXNzOjphbGxvd0ZvcndhcmRpbmcgPSB0cnVlIGlmIGFsbG93Rm9yd2FyZGluZ1xuICAgIGtsYXNzLmV4dGVuZCgpXG5cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgc3VwZXJcbiAgICBAaW5pdGlhbGl6ZSgpXG5cbiAgaXNJbm5lcjogLT5cbiAgICBAaW5uZXJcblxuICBpc0E6IC0+XG4gICAgbm90IEBpbm5lclxuXG4gIGlzTGluZXdpc2U6IC0+IEB3aXNlIGlzICdsaW5ld2lzZSdcbiAgaXNCbG9ja3dpc2U6IC0+IEB3aXNlIGlzICdibG9ja3dpc2UnXG5cbiAgZm9yY2VXaXNlOiAod2lzZSkgLT5cbiAgICBAd2lzZSA9IHdpc2UgIyBGSVhNRSBjdXJyZW50bHkgbm90IHdlbGwgc3VwcG9ydGVkXG5cbiAgcmVzZXRTdGF0ZTogLT5cbiAgICBAc2VsZWN0U3VjY2VlZGVkID0gbnVsbFxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgQHJlc2V0U3RhdGUoKVxuXG4gICAgIyBXaGVubmV2ZXIgVGV4dE9iamVjdCBpcyBleGVjdXRlZCwgaXQgaGFzIEBvcGVyYXRvclxuICAgICMgQ2FsbGVkIGZyb20gT3BlcmF0b3I6OnNlbGVjdFRhcmdldCgpXG4gICAgIyAgLSBgdiBpIHBgLCBpcyBgU2VsZWN0YCBvcGVyYXRvciB3aXRoIEB0YXJnZXQgPSBgSW5uZXJQYXJhZ3JhcGhgLlxuICAgICMgIC0gYGQgaSBwYCwgaXMgYERlbGV0ZWAgb3BlcmF0b3Igd2l0aCBAdGFyZ2V0ID0gYElubmVyUGFyYWdyYXBoYC5cbiAgICBpZiBAb3BlcmF0b3I/XG4gICAgICBAc2VsZWN0KClcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2luIFRleHRPYmplY3Q6IE11c3Qgbm90IGhhcHBlbicpXG5cbiAgc2VsZWN0OiAtPlxuICAgIGlmIEBpc01vZGUoJ3Zpc3VhbCcsICdibG9ja3dpc2UnKVxuICAgICAgQHN3cmFwLm5vcm1hbGl6ZShAZWRpdG9yKVxuXG4gICAgQGNvdW50VGltZXMgQGdldENvdW50KCksICh7c3RvcH0pID0+XG4gICAgICBzdG9wKCkgdW5sZXNzIEBzdXBwb3J0Q291bnQgIyBxdWljay1maXggZm9yICM1NjBcbiAgICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgb2xkUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgICBpZiBAc2VsZWN0VGV4dE9iamVjdChzZWxlY3Rpb24pXG4gICAgICAgICAgQHNlbGVjdFN1Y2NlZWRlZCA9IHRydWVcbiAgICAgICAgc3RvcCgpIGlmIHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLmlzRXF1YWwob2xkUmFuZ2UpXG4gICAgICAgIGJyZWFrIGlmIEBzZWxlY3RPbmNlXG5cbiAgICBAZWRpdG9yLm1lcmdlSW50ZXJzZWN0aW5nU2VsZWN0aW9ucygpXG4gICAgIyBTb21lIFRleHRPYmplY3QncyB3aXNlIGlzIE5PVCBkZXRlcm1pbmlzdGljLiBJdCBoYXMgdG8gYmUgZGV0ZWN0ZWQgZnJvbSBzZWxlY3RlZCByYW5nZS5cbiAgICBAd2lzZSA/PSBAc3dyYXAuZGV0ZWN0V2lzZShAZWRpdG9yKVxuXG4gICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgIGlmIEBzZWxlY3RTdWNjZWVkZWRcbiAgICAgICAgc3dpdGNoIEB3aXNlXG4gICAgICAgICAgd2hlbiAnY2hhcmFjdGVyd2lzZSdcbiAgICAgICAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKSBmb3IgJHNlbGVjdGlvbiBpbiBAc3dyYXAuZ2V0U2VsZWN0aW9ucyhAZWRpdG9yKVxuICAgICAgICAgIHdoZW4gJ2xpbmV3aXNlJ1xuICAgICAgICAgICAgIyBXaGVuIHRhcmdldCBpcyBwZXJzaXN0ZW50LXNlbGVjdGlvbiwgbmV3IHNlbGVjdGlvbiBpcyBhZGRlZCBhZnRlciBzZWxlY3RUZXh0T2JqZWN0LlxuICAgICAgICAgICAgIyBTbyB3ZSBoYXZlIHRvIGFzc3VyZSBhbGwgc2VsZWN0aW9uIGhhdmUgc2VsY3Rpb24gcHJvcGVydHkuXG4gICAgICAgICAgICAjIE1heWJlIHRoaXMgbG9naWMgY2FuIGJlIG1vdmVkIHRvIG9wZXJhdGlvbiBzdGFjay5cbiAgICAgICAgICAgIGZvciAkc2VsZWN0aW9uIGluIEBzd3JhcC5nZXRTZWxlY3Rpb25zKEBlZGl0b3IpXG4gICAgICAgICAgICAgIGlmIEBnZXRDb25maWcoJ3N0YXlPblNlbGVjdFRleHRPYmplY3QnKVxuICAgICAgICAgICAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKSB1bmxlc3MgJHNlbGVjdGlvbi5oYXNQcm9wZXJ0aWVzKClcbiAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICRzZWxlY3Rpb24uc2F2ZVByb3BlcnRpZXMoKVxuICAgICAgICAgICAgICAkc2VsZWN0aW9uLmZpeFByb3BlcnR5Um93VG9Sb3dSYW5nZSgpXG5cbiAgICAgIGlmIEBzdWJtb2RlIGlzICdibG9ja3dpc2UnXG4gICAgICAgIGZvciAkc2VsZWN0aW9uIGluIEBzd3JhcC5nZXRTZWxlY3Rpb25zKEBlZGl0b3IpXG4gICAgICAgICAgJHNlbGVjdGlvbi5ub3JtYWxpemUoKVxuICAgICAgICAgICRzZWxlY3Rpb24uYXBwbHlXaXNlKCdibG9ja3dpc2UnKVxuXG4gICMgUmV0dXJuIHRydWUgb3IgZmFsc2VcbiAgc2VsZWN0VGV4dE9iamVjdDogKHNlbGVjdGlvbikgLT5cbiAgICBpZiByYW5nZSA9IEBnZXRSYW5nZShzZWxlY3Rpb24pXG4gICAgICBAc3dyYXAoc2VsZWN0aW9uKS5zZXRCdWZmZXJSYW5nZShyYW5nZSlcbiAgICAgIHJldHVybiB0cnVlXG5cbiAgIyB0byBvdmVycmlkZVxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICBudWxsXG5cbiMgU2VjdGlvbjogV29yZFxuIyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBXb3JkIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcblxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICBwb2ludCA9IEBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAge3JhbmdlfSA9IEBnZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbihwb2ludCwge0B3b3JkUmVnZXh9KVxuICAgIGlmIEBpc0EoKVxuICAgICAgZXhwYW5kUmFuZ2VUb1doaXRlU3BhY2VzKEBlZGl0b3IsIHJhbmdlKVxuICAgIGVsc2VcbiAgICAgIHJhbmdlXG5cbmNsYXNzIFdob2xlV29yZCBleHRlbmRzIFdvcmRcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIHdvcmRSZWdleDogL1xcUysvXG5cbiMgSnVzdCBpbmNsdWRlIF8sIC1cbmNsYXNzIFNtYXJ0V29yZCBleHRlbmRzIFdvcmRcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIEBkZXNjcmlwdGlvbjogXCJBIHdvcmQgdGhhdCBjb25zaXN0cyBvZiBhbHBoYW51bWVyaWMgY2hhcnMoYC9bQS1aYS16MC05X10vYCkgYW5kIGh5cGhlbiBgLWBcIlxuICB3b3JkUmVnZXg6IC9bXFx3LV0rL1xuXG4jIEp1c3QgaW5jbHVkZSBfLCAtXG5jbGFzcyBTdWJ3b3JkIGV4dGVuZHMgV29yZFxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgQHdvcmRSZWdleCA9IHNlbGVjdGlvbi5jdXJzb3Iuc3Vid29yZFJlZ0V4cCgpXG4gICAgc3VwZXJcblxuIyBTZWN0aW9uOiBQYWlyXG4jID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFBhaXIgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG4gIHN1cHBvcnRDb3VudDogdHJ1ZVxuICBhbGxvd05leHRMaW5lOiBudWxsXG4gIGFkanVzdElubmVyUmFuZ2U6IHRydWVcbiAgcGFpcjogbnVsbFxuICBpbmNsdXNpdmU6IHRydWVcblxuICBpbml0aWFsaXplOiAtPlxuICAgIFBhaXJGaW5kZXIgPz0gcmVxdWlyZSAnLi9wYWlyLWZpbmRlcidcbiAgICBzdXBlclxuXG5cbiAgaXNBbGxvd05leHRMaW5lOiAtPlxuICAgIEBhbGxvd05leHRMaW5lID8gKEBwYWlyPyBhbmQgQHBhaXJbMF0gaXNudCBAcGFpclsxXSlcblxuICBhZGp1c3RSYW5nZTogKHtzdGFydCwgZW5kfSkgLT5cbiAgICAjIERpcnR5IHdvcmsgdG8gZmVlbCBuYXR1cmFsIGZvciBodW1hbiwgdG8gYmVoYXZlIGNvbXBhdGlibGUgd2l0aCBwdXJlIFZpbS5cbiAgICAjIFdoZXJlIHRoaXMgYWRqdXN0bWVudCBhcHBlYXIgaXMgaW4gZm9sbG93aW5nIHNpdHVhdGlvbi5cbiAgICAjIG9wLTE6IGBjaXtgIHJlcGxhY2Ugb25seSAybmQgbGluZVxuICAgICMgb3AtMjogYGRpe2AgZGVsZXRlIG9ubHkgMm5kIGxpbmUuXG4gICAgIyB0ZXh0OlxuICAgICMgIHtcbiAgICAjICAgIGFhYVxuICAgICMgIH1cbiAgICBpZiBwb2ludElzQXRFbmRPZkxpbmUoQGVkaXRvciwgc3RhcnQpXG4gICAgICBzdGFydCA9IHN0YXJ0LnRyYXZlcnNlKFsxLCAwXSlcblxuICAgIGlmIGdldExpbmVUZXh0VG9CdWZmZXJQb3NpdGlvbihAZWRpdG9yLCBlbmQpLm1hdGNoKC9eXFxzKiQvKVxuICAgICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgICAgIyBUaGlzIGlzIHNsaWdodGx5IGlubmNvbnNpc3RlbnQgd2l0aCByZWd1bGFyIFZpbVxuICAgICAgICAjIC0gcmVndWxhciBWaW06IHNlbGVjdCBuZXcgbGluZSBhZnRlciBFT0xcbiAgICAgICAgIyAtIHZpbS1tb2RlLXBsdXM6IHNlbGVjdCB0byBFT0woYmVmb3JlIG5ldyBsaW5lKVxuICAgICAgICAjIFRoaXMgaXMgaW50ZW50aW9uYWwgc2luY2UgdG8gbWFrZSBzdWJtb2RlIGBjaGFyYWN0ZXJ3aXNlYCB3aGVuIGF1dG8tZGV0ZWN0IHN1Ym1vZGVcbiAgICAgICAgIyBpbm5lckVuZCA9IG5ldyBQb2ludChpbm5lckVuZC5yb3cgLSAxLCBJbmZpbml0eSlcbiAgICAgICAgZW5kID0gbmV3IFBvaW50KGVuZC5yb3cgLSAxLCBJbmZpbml0eSlcbiAgICAgIGVsc2VcbiAgICAgICAgZW5kID0gbmV3IFBvaW50KGVuZC5yb3csIDApXG5cbiAgICBuZXcgUmFuZ2Uoc3RhcnQsIGVuZClcblxuICBnZXRGaW5kZXI6IC0+XG4gICAgb3B0aW9ucyA9IHthbGxvd05leHRMaW5lOiBAaXNBbGxvd05leHRMaW5lKCksIEBhbGxvd0ZvcndhcmRpbmcsIEBwYWlyLCBAaW5jbHVzaXZlfVxuICAgIGlmIEBwYWlyWzBdIGlzIEBwYWlyWzFdXG4gICAgICBuZXcgUGFpckZpbmRlci5RdW90ZUZpbmRlcihAZWRpdG9yLCBvcHRpb25zKVxuICAgIGVsc2VcbiAgICAgIG5ldyBQYWlyRmluZGVyLkJyYWNrZXRGaW5kZXIoQGVkaXRvciwgb3B0aW9ucylcblxuICBnZXRQYWlySW5mbzogKGZyb20pIC0+XG4gICAgcGFpckluZm8gPSBAZ2V0RmluZGVyKCkuZmluZChmcm9tKVxuICAgIHVubGVzcyBwYWlySW5mbz9cbiAgICAgIHJldHVybiBudWxsXG4gICAgcGFpckluZm8uaW5uZXJSYW5nZSA9IEBhZGp1c3RSYW5nZShwYWlySW5mby5pbm5lclJhbmdlKSBpZiBAYWRqdXN0SW5uZXJSYW5nZVxuICAgIHBhaXJJbmZvLnRhcmdldFJhbmdlID0gaWYgQGlzSW5uZXIoKSB0aGVuIHBhaXJJbmZvLmlubmVyUmFuZ2UgZWxzZSBwYWlySW5mby5hUmFuZ2VcbiAgICBwYWlySW5mb1xuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIG9yaWdpbmFsUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgIHBhaXJJbmZvID0gQGdldFBhaXJJbmZvKEBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pKVxuICAgICMgV2hlbiByYW5nZSB3YXMgc2FtZSwgdHJ5IHRvIGV4cGFuZCByYW5nZVxuICAgIGlmIHBhaXJJbmZvPy50YXJnZXRSYW5nZS5pc0VxdWFsKG9yaWdpbmFsUmFuZ2UpXG4gICAgICBwYWlySW5mbyA9IEBnZXRQYWlySW5mbyhwYWlySW5mby5hUmFuZ2UuZW5kKVxuICAgIHBhaXJJbmZvPy50YXJnZXRSYW5nZVxuXG4jIFVzZWQgYnkgRGVsZXRlU3Vycm91bmRcbmNsYXNzIEFQYWlyIGV4dGVuZHMgUGFpclxuICBAZXh0ZW5kKGZhbHNlKVxuXG5jbGFzcyBBbnlQYWlyIGV4dGVuZHMgUGFpclxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgYWxsb3dGb3J3YXJkaW5nOiBmYWxzZVxuICBtZW1iZXI6IFtcbiAgICAnRG91YmxlUXVvdGUnLCAnU2luZ2xlUXVvdGUnLCAnQmFja1RpY2snLFxuICAgICdDdXJseUJyYWNrZXQnLCAnQW5nbGVCcmFja2V0JywgJ1NxdWFyZUJyYWNrZXQnLCAnUGFyZW50aGVzaXMnXG4gIF1cblxuICBnZXRSYW5nZXM6IChzZWxlY3Rpb24pIC0+XG4gICAgQG1lbWJlclxuICAgICAgLm1hcCAoa2xhc3MpID0+IEBuZXcoa2xhc3MsIHtAaW5uZXIsIEBhbGxvd0ZvcndhcmRpbmcsIEBpbmNsdXNpdmV9KS5nZXRSYW5nZShzZWxlY3Rpb24pXG4gICAgICAuZmlsdGVyIChyYW5nZSkgLT4gcmFuZ2U/XG5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgXy5sYXN0KHNvcnRSYW5nZXMoQGdldFJhbmdlcyhzZWxlY3Rpb24pKSlcblxuY2xhc3MgQW55UGFpckFsbG93Rm9yd2FyZGluZyBleHRlbmRzIEFueVBhaXJcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIEBkZXNjcmlwdGlvbjogXCJSYW5nZSBzdXJyb3VuZGVkIGJ5IGF1dG8tZGV0ZWN0ZWQgcGFpcmVkIGNoYXJzIGZyb20gZW5jbG9zZWQgYW5kIGZvcndhcmRpbmcgYXJlYVwiXG4gIGFsbG93Rm9yd2FyZGluZzogdHJ1ZVxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICByYW5nZXMgPSBAZ2V0UmFuZ2VzKHNlbGVjdGlvbilcbiAgICBmcm9tID0gc2VsZWN0aW9uLmN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgW2ZvcndhcmRpbmdSYW5nZXMsIGVuY2xvc2luZ1Jhbmdlc10gPSBfLnBhcnRpdGlvbiByYW5nZXMsIChyYW5nZSkgLT5cbiAgICAgIHJhbmdlLnN0YXJ0LmlzR3JlYXRlclRoYW5PckVxdWFsKGZyb20pXG4gICAgZW5jbG9zaW5nUmFuZ2UgPSBfLmxhc3Qoc29ydFJhbmdlcyhlbmNsb3NpbmdSYW5nZXMpKVxuICAgIGZvcndhcmRpbmdSYW5nZXMgPSBzb3J0UmFuZ2VzKGZvcndhcmRpbmdSYW5nZXMpXG5cbiAgICAjIFdoZW4gZW5jbG9zaW5nUmFuZ2UgaXMgZXhpc3RzLFxuICAgICMgV2UgZG9uJ3QgZ28gYWNyb3NzIGVuY2xvc2luZ1JhbmdlLmVuZC5cbiAgICAjIFNvIGNob29zZSBmcm9tIHJhbmdlcyBjb250YWluZWQgaW4gZW5jbG9zaW5nUmFuZ2UuXG4gICAgaWYgZW5jbG9zaW5nUmFuZ2VcbiAgICAgIGZvcndhcmRpbmdSYW5nZXMgPSBmb3J3YXJkaW5nUmFuZ2VzLmZpbHRlciAocmFuZ2UpIC0+XG4gICAgICAgIGVuY2xvc2luZ1JhbmdlLmNvbnRhaW5zUmFuZ2UocmFuZ2UpXG5cbiAgICBmb3J3YXJkaW5nUmFuZ2VzWzBdIG9yIGVuY2xvc2luZ1JhbmdlXG5cbmNsYXNzIEFueVF1b3RlIGV4dGVuZHMgQW55UGFpclxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgYWxsb3dGb3J3YXJkaW5nOiB0cnVlXG4gIG1lbWJlcjogWydEb3VibGVRdW90ZScsICdTaW5nbGVRdW90ZScsICdCYWNrVGljayddXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIHJhbmdlcyA9IEBnZXRSYW5nZXMoc2VsZWN0aW9uKVxuICAgICMgUGljayByYW5nZSB3aGljaCBlbmQuY29sdW0gaXMgbGVmdG1vc3QobWVhbiwgY2xvc2VkIGZpcnN0KVxuICAgIF8uZmlyc3QoXy5zb3J0QnkocmFuZ2VzLCAocikgLT4gci5lbmQuY29sdW1uKSkgaWYgcmFuZ2VzLmxlbmd0aFxuXG5jbGFzcyBRdW90ZSBleHRlbmRzIFBhaXJcbiAgQGV4dGVuZChmYWxzZSlcbiAgYWxsb3dGb3J3YXJkaW5nOiB0cnVlXG5cbmNsYXNzIERvdWJsZVF1b3RlIGV4dGVuZHMgUXVvdGVcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIHBhaXI6IFsnXCInLCAnXCInXVxuXG5jbGFzcyBTaW5nbGVRdW90ZSBleHRlbmRzIFF1b3RlXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICBwYWlyOiBbXCInXCIsIFwiJ1wiXVxuXG5jbGFzcyBCYWNrVGljayBleHRlbmRzIFF1b3RlXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICBwYWlyOiBbJ2AnLCAnYCddXG5cbmNsYXNzIEN1cmx5QnJhY2tldCBleHRlbmRzIFBhaXJcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIEBkZXJpdmVJbm5lckFuZEFGb3JBbGxvd0ZvcndhcmRpbmcoKVxuICBwYWlyOiBbJ3snLCAnfSddXG5cbmNsYXNzIFNxdWFyZUJyYWNrZXQgZXh0ZW5kcyBQYWlyXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICBAZGVyaXZlSW5uZXJBbmRBRm9yQWxsb3dGb3J3YXJkaW5nKClcbiAgcGFpcjogWydbJywgJ10nXVxuXG5jbGFzcyBQYXJlbnRoZXNpcyBleHRlbmRzIFBhaXJcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIEBkZXJpdmVJbm5lckFuZEFGb3JBbGxvd0ZvcndhcmRpbmcoKVxuICBwYWlyOiBbJygnLCAnKSddXG5cbmNsYXNzIEFuZ2xlQnJhY2tldCBleHRlbmRzIFBhaXJcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIEBkZXJpdmVJbm5lckFuZEFGb3JBbGxvd0ZvcndhcmRpbmcoKVxuICBwYWlyOiBbJzwnLCAnPiddXG5cbmNsYXNzIFRhZyBleHRlbmRzIFBhaXJcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIGFsbG93TmV4dExpbmU6IHRydWVcbiAgYWxsb3dGb3J3YXJkaW5nOiB0cnVlXG4gIGFkanVzdElubmVyUmFuZ2U6IGZhbHNlXG5cbiAgZ2V0VGFnU3RhcnRQb2ludDogKGZyb20pIC0+XG4gICAgdGFnUmFuZ2UgPSBudWxsXG4gICAgcGF0dGVybiA9IFBhaXJGaW5kZXIuVGFnRmluZGVyLnBhdHRlcm5cbiAgICBAc2NhbkZvcndhcmQgcGF0dGVybiwge2Zyb206IFtmcm9tLnJvdywgMF19LCAoe3JhbmdlLCBzdG9wfSkgLT5cbiAgICAgIGlmIHJhbmdlLmNvbnRhaW5zUG9pbnQoZnJvbSwgdHJ1ZSlcbiAgICAgICAgdGFnUmFuZ2UgPSByYW5nZVxuICAgICAgICBzdG9wKClcbiAgICB0YWdSYW5nZT8uc3RhcnRcblxuICBnZXRGaW5kZXI6IC0+XG4gICAgbmV3IFBhaXJGaW5kZXIuVGFnRmluZGVyKEBlZGl0b3IsIHthbGxvd05leHRMaW5lOiBAaXNBbGxvd05leHRMaW5lKCksIEBhbGxvd0ZvcndhcmRpbmcsIEBpbmNsdXNpdmV9KVxuXG4gIGdldFBhaXJJbmZvOiAoZnJvbSkgLT5cbiAgICBzdXBlcihAZ2V0VGFnU3RhcnRQb2ludChmcm9tKSA/IGZyb20pXG5cbiMgU2VjdGlvbjogUGFyYWdyYXBoXG4jID09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgUGFyYWdyYXBoIGlzIGRlZmluZWQgYXMgY29uc2VjdXRpdmUgKG5vbi0pYmxhbmstbGluZS5cbmNsYXNzIFBhcmFncmFwaCBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgc3VwcG9ydENvdW50OiB0cnVlXG5cbiAgZmluZFJvdzogKGZyb21Sb3csIGRpcmVjdGlvbiwgZm4pIC0+XG4gICAgZm4ucmVzZXQ/KClcbiAgICBmb3VuZFJvdyA9IGZyb21Sb3dcbiAgICBmb3Igcm93IGluIGdldEJ1ZmZlclJvd3MoQGVkaXRvciwge3N0YXJ0Um93OiBmcm9tUm93LCBkaXJlY3Rpb259KVxuICAgICAgYnJlYWsgdW5sZXNzIGZuKHJvdywgZGlyZWN0aW9uKVxuICAgICAgZm91bmRSb3cgPSByb3dcblxuICAgIGZvdW5kUm93XG5cbiAgZmluZFJvd1JhbmdlQnk6IChmcm9tUm93LCBmbikgLT5cbiAgICBzdGFydFJvdyA9IEBmaW5kUm93KGZyb21Sb3csICdwcmV2aW91cycsIGZuKVxuICAgIGVuZFJvdyA9IEBmaW5kUm93KGZyb21Sb3csICduZXh0JywgZm4pXG4gICAgW3N0YXJ0Um93LCBlbmRSb3ddXG5cbiAgZ2V0UHJlZGljdEZ1bmN0aW9uOiAoZnJvbVJvdywgc2VsZWN0aW9uKSAtPlxuICAgIGZyb21Sb3dSZXN1bHQgPSBAZWRpdG9yLmlzQnVmZmVyUm93QmxhbmsoZnJvbVJvdylcblxuICAgIGlmIEBpc0lubmVyKClcbiAgICAgIHByZWRpY3QgPSAocm93LCBkaXJlY3Rpb24pID0+XG4gICAgICAgIEBlZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpIGlzIGZyb21Sb3dSZXN1bHRcbiAgICBlbHNlXG4gICAgICBpZiBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpXG4gICAgICAgIGRpcmVjdGlvblRvRXh0ZW5kID0gJ3ByZXZpb3VzJ1xuICAgICAgZWxzZVxuICAgICAgICBkaXJlY3Rpb25Ub0V4dGVuZCA9ICduZXh0J1xuXG4gICAgICBmbGlwID0gZmFsc2VcbiAgICAgIHByZWRpY3QgPSAocm93LCBkaXJlY3Rpb24pID0+XG4gICAgICAgIHJlc3VsdCA9IEBlZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpIGlzIGZyb21Sb3dSZXN1bHRcbiAgICAgICAgaWYgZmxpcFxuICAgICAgICAgIG5vdCByZXN1bHRcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGlmIChub3QgcmVzdWx0KSBhbmQgKGRpcmVjdGlvbiBpcyBkaXJlY3Rpb25Ub0V4dGVuZClcbiAgICAgICAgICAgIGZsaXAgPSB0cnVlXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgIHJlc3VsdFxuXG4gICAgICBwcmVkaWN0LnJlc2V0ID0gLT5cbiAgICAgICAgZmxpcCA9IGZhbHNlXG4gICAgcHJlZGljdFxuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIG9yaWdpbmFsUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgIGZyb21Sb3cgPSBAZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKS5yb3dcbiAgICBpZiBAaXNNb2RlKCd2aXN1YWwnLCAnbGluZXdpc2UnKVxuICAgICAgaWYgc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuICAgICAgICBmcm9tUm93LS1cbiAgICAgIGVsc2VcbiAgICAgICAgZnJvbVJvdysrXG4gICAgICBmcm9tUm93ID0gZ2V0VmFsaWRWaW1CdWZmZXJSb3coQGVkaXRvciwgZnJvbVJvdylcblxuICAgIHJvd1JhbmdlID0gQGZpbmRSb3dSYW5nZUJ5KGZyb21Sb3csIEBnZXRQcmVkaWN0RnVuY3Rpb24oZnJvbVJvdywgc2VsZWN0aW9uKSlcbiAgICBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS51bmlvbihAZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShyb3dSYW5nZSkpXG5cbmNsYXNzIEluZGVudGF0aW9uIGV4dGVuZHMgUGFyYWdyYXBoXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIGZyb21Sb3cgPSBAZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKS5yb3dcblxuICAgIGJhc2VJbmRlbnRMZXZlbCA9IEBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdyhmcm9tUm93KVxuICAgIHByZWRpY3QgPSAocm93KSA9PlxuICAgICAgaWYgQGVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKHJvdylcbiAgICAgICAgQGlzQSgpXG4gICAgICBlbHNlXG4gICAgICAgIEBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdyhyb3cpID49IGJhc2VJbmRlbnRMZXZlbFxuXG4gICAgcm93UmFuZ2UgPSBAZmluZFJvd1JhbmdlQnkoZnJvbVJvdywgcHJlZGljdClcbiAgICBAZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShyb3dSYW5nZSlcblxuIyBTZWN0aW9uOiBDb21tZW50XG4jID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIENvbW1lbnQgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICB3aXNlOiAnbGluZXdpc2UnXG5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgcm93ID0gQGdldEN1cnNvclBvc2l0aW9uRm9yU2VsZWN0aW9uKHNlbGVjdGlvbikucm93XG4gICAgcm93UmFuZ2UgPSBAZWRpdG9yLmxhbmd1YWdlTW9kZS5yb3dSYW5nZUZvckNvbW1lbnRBdEJ1ZmZlclJvdyhyb3cpXG4gICAgcm93UmFuZ2UgPz0gW3Jvdywgcm93XSBpZiBAZWRpdG9yLmlzQnVmZmVyUm93Q29tbWVudGVkKHJvdylcbiAgICBpZiByb3dSYW5nZT9cbiAgICAgIEBnZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKHJvd1JhbmdlKVxuXG5jbGFzcyBDb21tZW50T3JQYXJhZ3JhcGggZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICB3aXNlOiAnbGluZXdpc2UnXG5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgZm9yIGtsYXNzIGluIFsnQ29tbWVudCcsICdQYXJhZ3JhcGgnXVxuICAgICAgaWYgcmFuZ2UgPSBAbmV3KGtsYXNzLCB7QGlubmVyfSkuZ2V0UmFuZ2Uoc2VsZWN0aW9uKVxuICAgICAgICByZXR1cm4gcmFuZ2VcblxuIyBTZWN0aW9uOiBGb2xkXG4jID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIEZvbGQgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICB3aXNlOiAnbGluZXdpc2UnXG5cbiAgYWRqdXN0Um93UmFuZ2U6IChyb3dSYW5nZSkgLT5cbiAgICByZXR1cm4gcm93UmFuZ2UgaWYgQGlzQSgpXG5cbiAgICBbc3RhcnRSb3csIGVuZFJvd10gPSByb3dSYW5nZVxuICAgIGlmIEBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdyhzdGFydFJvdykgaXMgQGdldEluZGVudExldmVsRm9yQnVmZmVyUm93KGVuZFJvdylcbiAgICAgIGVuZFJvdyAtPSAxXG4gICAgc3RhcnRSb3cgKz0gMVxuICAgIFtzdGFydFJvdywgZW5kUm93XVxuXG4gIGdldEZvbGRSb3dSYW5nZXNDb250YWluc0ZvclJvdzogKHJvdykgLT5cbiAgICBnZXRDb2RlRm9sZFJvd1Jhbmdlc0NvbnRhaW5lc0ZvclJvdyhAZWRpdG9yLCByb3cpLnJldmVyc2UoKVxuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIHJvdyA9IEBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pLnJvd1xuICAgIHNlbGVjdGVkUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgIGZvciByb3dSYW5nZSBpbiBAZ2V0Rm9sZFJvd1Jhbmdlc0NvbnRhaW5zRm9yUm93KHJvdylcbiAgICAgIHJhbmdlID0gQGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2UoQGFkanVzdFJvd1JhbmdlKHJvd1JhbmdlKSlcblxuICAgICAgIyBEb24ndCBjaGFuZ2UgdG8gYGlmIHJhbmdlLmNvbnRhaW5zUmFuZ2Uoc2VsZWN0ZWRSYW5nZSwgdHJ1ZSlgXG4gICAgICAjIFRoZXJlIGlzIGJlaGF2aW9yIGRpZmYgd2hlbiBjdXJzb3IgaXMgYXQgYmVnaW5uaW5nIG9mIGxpbmUoIGNvbHVtbiAwICkuXG4gICAgICB1bmxlc3Mgc2VsZWN0ZWRSYW5nZS5jb250YWluc1JhbmdlKHJhbmdlKVxuICAgICAgICByZXR1cm4gcmFuZ2VcblxuIyBOT1RFOiBGdW5jdGlvbiByYW5nZSBkZXRlcm1pbmF0aW9uIGlzIGRlcGVuZGluZyBvbiBmb2xkLlxuY2xhc3MgRnVuY3Rpb24gZXh0ZW5kcyBGb2xkXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICAjIFNvbWUgbGFuZ3VhZ2UgZG9uJ3QgaW5jbHVkZSBjbG9zaW5nIGB9YCBpbnRvIGZvbGQuXG4gIHNjb3BlTmFtZXNPbWl0dGluZ0VuZFJvdzogWydzb3VyY2UuZ28nLCAnc291cmNlLmVsaXhpciddXG5cbiAgaXNHcmFtbWFyTm90Rm9sZEVuZFJvdzogLT5cbiAgICB7c2NvcGVOYW1lLCBwYWNrYWdlTmFtZX0gPSBAZWRpdG9yLmdldEdyYW1tYXIoKVxuICAgIGlmIHNjb3BlTmFtZSBpbiBAc2NvcGVOYW1lc09taXR0aW5nRW5kUm93XG4gICAgICB0cnVlXG4gICAgZWxzZVxuICAgICAgIyBIQUNLOiBSdXN0IGhhdmUgdHdvIHBhY2thZ2UgYGxhbmd1YWdlLXJ1c3RgIGFuZCBgYXRvbS1sYW5ndWFnZS1ydXN0YFxuICAgICAgIyBsYW5ndWFnZS1ydXN0IGRvbid0IGZvbGQgZW5kaW5nIGB9YCwgYnV0IGF0b20tbGFuZ3VhZ2UtcnVzdCBkb2VzLlxuICAgICAgc2NvcGVOYW1lIGlzICdzb3VyY2UucnVzdCcgYW5kIHBhY2thZ2VOYW1lIGlzIFwibGFuZ3VhZ2UtcnVzdFwiXG5cbiAgZ2V0Rm9sZFJvd1Jhbmdlc0NvbnRhaW5zRm9yUm93OiAocm93KSAtPlxuICAgIChzdXBlcikuZmlsdGVyIChyb3dSYW5nZSkgPT5cbiAgICAgIGlzSW5jbHVkZUZ1bmN0aW9uU2NvcGVGb3JSb3coQGVkaXRvciwgcm93UmFuZ2VbMF0pXG5cbiAgYWRqdXN0Um93UmFuZ2U6IChyb3dSYW5nZSkgLT5cbiAgICBbc3RhcnRSb3csIGVuZFJvd10gPSBzdXBlclxuICAgICMgTk9URTogVGhpcyBhZGp1c3RtZW50IHNob3VkIG5vdCBiZSBuZWNlc3NhcnkgaWYgbGFuZ3VhZ2Utc3ludGF4IGlzIHByb3Blcmx5IGRlZmluZWQuXG4gICAgaWYgQGlzQSgpIGFuZCBAaXNHcmFtbWFyTm90Rm9sZEVuZFJvdygpXG4gICAgICBlbmRSb3cgKz0gMVxuICAgIFtzdGFydFJvdywgZW5kUm93XVxuXG4jIFNlY3Rpb246IE90aGVyXG4jID09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIEFyZ3VtZW50cyBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZChmYWxzZSlcbiAgQGRlcml2ZUlubmVyQW5kQSgpXG5cbiAgbmV3QXJnSW5mbzogKGFyZ1N0YXJ0LCBhcmcsIHNlcGFyYXRvcikgLT5cbiAgICBhcmdFbmQgPSB0cmF2ZXJzZVRleHRGcm9tUG9pbnQoYXJnU3RhcnQsIGFyZylcbiAgICBhcmdSYW5nZSA9IG5ldyBSYW5nZShhcmdTdGFydCwgYXJnRW5kKVxuXG4gICAgc2VwYXJhdG9yRW5kID0gdHJhdmVyc2VUZXh0RnJvbVBvaW50KGFyZ0VuZCwgc2VwYXJhdG9yID8gJycpXG4gICAgc2VwYXJhdG9yUmFuZ2UgPSBuZXcgUmFuZ2UoYXJnRW5kLCBzZXBhcmF0b3JFbmQpXG5cbiAgICBpbm5lclJhbmdlID0gYXJnUmFuZ2VcbiAgICBhUmFuZ2UgPSBhcmdSYW5nZS51bmlvbihzZXBhcmF0b3JSYW5nZSlcbiAgICB7YXJnUmFuZ2UsIHNlcGFyYXRvclJhbmdlLCBpbm5lclJhbmdlLCBhUmFuZ2V9XG5cbiAgZ2V0QXJndW1lbnRzUmFuZ2VGb3JTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgbWVtYmVyID0gW1xuICAgICAgJ0N1cmx5QnJhY2tldCdcbiAgICAgICdTcXVhcmVCcmFja2V0J1xuICAgICAgJ1BhcmVudGhlc2lzJ1xuICAgIF1cbiAgICBAbmV3KFwiSW5uZXJBbnlQYWlyXCIsIHtpbmNsdXNpdmU6IGZhbHNlLCBtZW1iZXI6IG1lbWJlcn0pLmdldFJhbmdlKHNlbGVjdGlvbilcblxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICByYW5nZSA9IEBnZXRBcmd1bWVudHNSYW5nZUZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgcGFpclJhbmdlRm91bmQgPSByYW5nZT9cbiAgICByYW5nZSA/PSBAbmV3KFwiSW5uZXJDdXJyZW50TGluZVwiKS5nZXRSYW5nZShzZWxlY3Rpb24pICMgZmFsbGJhY2tcbiAgICByZXR1cm4gdW5sZXNzIHJhbmdlXG5cbiAgICByYW5nZSA9IHRyaW1SYW5nZShAZWRpdG9yLCByYW5nZSlcblxuICAgIHRleHQgPSBAZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgIGFsbFRva2VucyA9IHNwbGl0QXJndW1lbnRzKHRleHQsIHBhaXJSYW5nZUZvdW5kKVxuXG4gICAgYXJnSW5mb3MgPSBbXVxuICAgIGFyZ1N0YXJ0ID0gcmFuZ2Uuc3RhcnRcblxuICAgICMgU2tpcCBzdGFydGluZyBzZXBhcmF0b3JcbiAgICBpZiBhbGxUb2tlbnMubGVuZ3RoIGFuZCBhbGxUb2tlbnNbMF0udHlwZSBpcyAnc2VwYXJhdG9yJ1xuICAgICAgdG9rZW4gPSBhbGxUb2tlbnMuc2hpZnQoKVxuICAgICAgYXJnU3RhcnQgPSB0cmF2ZXJzZVRleHRGcm9tUG9pbnQoYXJnU3RhcnQsIHRva2VuLnRleHQpXG5cbiAgICB3aGlsZSBhbGxUb2tlbnMubGVuZ3RoXG4gICAgICB0b2tlbiA9IGFsbFRva2Vucy5zaGlmdCgpXG4gICAgICBpZiB0b2tlbi50eXBlIGlzICdhcmd1bWVudCdcbiAgICAgICAgc2VwYXJhdG9yID0gYWxsVG9rZW5zLnNoaWZ0KCk/LnRleHRcbiAgICAgICAgYXJnSW5mbyA9IEBuZXdBcmdJbmZvKGFyZ1N0YXJ0LCB0b2tlbi50ZXh0LCBzZXBhcmF0b3IpXG5cbiAgICAgICAgaWYgKGFsbFRva2Vucy5sZW5ndGggaXMgMCkgYW5kIChsYXN0QXJnSW5mbyA9IF8ubGFzdChhcmdJbmZvcykpXG4gICAgICAgICAgYXJnSW5mby5hUmFuZ2UgPSBhcmdJbmZvLmFyZ1JhbmdlLnVuaW9uKGxhc3RBcmdJbmZvLnNlcGFyYXRvclJhbmdlKVxuXG4gICAgICAgIGFyZ1N0YXJ0ID0gYXJnSW5mby5hUmFuZ2UuZW5kXG4gICAgICAgIGFyZ0luZm9zLnB1c2goYXJnSW5mbylcbiAgICAgIGVsc2VcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdtdXN0IG5vdCBoYXBwZW4nKVxuXG4gICAgcG9pbnQgPSBAZ2V0Q3Vyc29yUG9zaXRpb25Gb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgIGZvciB7aW5uZXJSYW5nZSwgYVJhbmdlfSBpbiBhcmdJbmZvc1xuICAgICAgaWYgaW5uZXJSYW5nZS5lbmQuaXNHcmVhdGVyVGhhbk9yRXF1YWwocG9pbnQpXG4gICAgICAgIHJldHVybiBpZiBAaXNJbm5lcigpIHRoZW4gaW5uZXJSYW5nZSBlbHNlIGFSYW5nZVxuICAgIG51bGxcblxuY2xhc3MgQ3VycmVudExpbmUgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIHJvdyA9IEBnZXRDdXJzb3JQb3NpdGlvbkZvclNlbGVjdGlvbihzZWxlY3Rpb24pLnJvd1xuICAgIHJhbmdlID0gQGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhyb3cpXG4gICAgaWYgQGlzQSgpXG4gICAgICByYW5nZVxuICAgIGVsc2VcbiAgICAgIHRyaW1SYW5nZShAZWRpdG9yLCByYW5nZSlcblxuY2xhc3MgRW50aXJlIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICBzZWxlY3RPbmNlOiB0cnVlXG5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgQGVkaXRvci5idWZmZXIuZ2V0UmFuZ2UoKVxuXG5jbGFzcyBFbXB0eSBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZChmYWxzZSlcbiAgc2VsZWN0T25jZTogdHJ1ZVxuXG5jbGFzcyBMYXRlc3RDaGFuZ2UgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICB3aXNlOiBudWxsXG4gIHNlbGVjdE9uY2U6IHRydWVcbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgc3RhcnQgPSBAdmltU3RhdGUubWFyay5nZXQoJ1snKVxuICAgIGVuZCA9IEB2aW1TdGF0ZS5tYXJrLmdldCgnXScpXG4gICAgaWYgc3RhcnQ/IGFuZCBlbmQ/XG4gICAgICBuZXcgUmFuZ2Uoc3RhcnQsIGVuZClcblxuY2xhc3MgU2VhcmNoTWF0Y2hGb3J3YXJkIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKClcbiAgYmFja3dhcmQ6IGZhbHNlXG5cbiAgZmluZE1hdGNoOiAoZnJvbVBvaW50LCBwYXR0ZXJuKSAtPlxuICAgIGZyb21Qb2ludCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcChAZWRpdG9yLCBmcm9tUG9pbnQsIFwiZm9yd2FyZFwiKSBpZiAoQG1vZGUgaXMgJ3Zpc3VhbCcpXG4gICAgZm91bmQgPSBudWxsXG4gICAgQHNjYW5Gb3J3YXJkIHBhdHRlcm4sIHtmcm9tOiBbZnJvbVBvaW50LnJvdywgMF19LCAoe3JhbmdlLCBzdG9wfSkgLT5cbiAgICAgIGlmIHJhbmdlLmVuZC5pc0dyZWF0ZXJUaGFuKGZyb21Qb2ludClcbiAgICAgICAgZm91bmQgPSByYW5nZVxuICAgICAgICBzdG9wKClcbiAgICB7cmFuZ2U6IGZvdW5kLCB3aGljaElzSGVhZDogJ2VuZCd9XG5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgcGF0dGVybiA9IEBnbG9iYWxTdGF0ZS5nZXQoJ2xhc3RTZWFyY2hQYXR0ZXJuJylcbiAgICByZXR1cm4gdW5sZXNzIHBhdHRlcm4/XG5cbiAgICBmcm9tUG9pbnQgPSBzZWxlY3Rpb24uZ2V0SGVhZEJ1ZmZlclBvc2l0aW9uKClcbiAgICB7cmFuZ2UsIHdoaWNoSXNIZWFkfSA9IEBmaW5kTWF0Y2goZnJvbVBvaW50LCBwYXR0ZXJuKVxuICAgIGlmIHJhbmdlP1xuICAgICAgQHVuaW9uUmFuZ2VBbmREZXRlcm1pbmVSZXZlcnNlZFN0YXRlKHNlbGVjdGlvbiwgcmFuZ2UsIHdoaWNoSXNIZWFkKVxuXG4gIHVuaW9uUmFuZ2VBbmREZXRlcm1pbmVSZXZlcnNlZFN0YXRlOiAoc2VsZWN0aW9uLCBmb3VuZCwgd2hpY2hJc0hlYWQpIC0+XG4gICAgaWYgc2VsZWN0aW9uLmlzRW1wdHkoKVxuICAgICAgZm91bmRcbiAgICBlbHNlXG4gICAgICBoZWFkID0gZm91bmRbd2hpY2hJc0hlYWRdXG4gICAgICB0YWlsID0gc2VsZWN0aW9uLmdldFRhaWxCdWZmZXJQb3NpdGlvbigpXG5cbiAgICAgIGlmIEBiYWNrd2FyZFxuICAgICAgICBoZWFkID0gdHJhbnNsYXRlUG9pbnRBbmRDbGlwKEBlZGl0b3IsIGhlYWQsICdmb3J3YXJkJykgaWYgdGFpbC5pc0xlc3NUaGFuKGhlYWQpXG4gICAgICBlbHNlXG4gICAgICAgIGhlYWQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAoQGVkaXRvciwgaGVhZCwgJ2JhY2t3YXJkJykgaWYgaGVhZC5pc0xlc3NUaGFuKHRhaWwpXG5cbiAgICAgIEByZXZlcnNlZCA9IGhlYWQuaXNMZXNzVGhhbih0YWlsKVxuICAgICAgbmV3IFJhbmdlKHRhaWwsIGhlYWQpLnVuaW9uKEBzd3JhcChzZWxlY3Rpb24pLmdldFRhaWxCdWZmZXJSYW5nZSgpKVxuXG4gIHNlbGVjdFRleHRPYmplY3Q6IChzZWxlY3Rpb24pIC0+XG4gICAgaWYgcmFuZ2UgPSBAZ2V0UmFuZ2Uoc2VsZWN0aW9uKVxuICAgICAgQHN3cmFwKHNlbGVjdGlvbikuc2V0QnVmZmVyUmFuZ2UocmFuZ2UsIHtyZXZlcnNlZDogQHJldmVyc2VkID8gQGJhY2t3YXJkfSlcbiAgICAgIHJldHVybiB0cnVlXG5cbmNsYXNzIFNlYXJjaE1hdGNoQmFja3dhcmQgZXh0ZW5kcyBTZWFyY2hNYXRjaEZvcndhcmRcbiAgQGV4dGVuZCgpXG4gIGJhY2t3YXJkOiB0cnVlXG5cbiAgZmluZE1hdGNoOiAoZnJvbVBvaW50LCBwYXR0ZXJuKSAtPlxuICAgIGZyb21Qb2ludCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcChAZWRpdG9yLCBmcm9tUG9pbnQsIFwiYmFja3dhcmRcIikgaWYgKEBtb2RlIGlzICd2aXN1YWwnKVxuICAgIGZvdW5kID0gbnVsbFxuICAgIEBzY2FuQmFja3dhcmQgcGF0dGVybiwge2Zyb206IFtmcm9tUG9pbnQucm93LCBJbmZpbml0eV19LCAoe3JhbmdlLCBzdG9wfSkgLT5cbiAgICAgIGlmIHJhbmdlLnN0YXJ0LmlzTGVzc1RoYW4oZnJvbVBvaW50KVxuICAgICAgICBmb3VuZCA9IHJhbmdlXG4gICAgICAgIHN0b3AoKVxuICAgIHtyYW5nZTogZm91bmQsIHdoaWNoSXNIZWFkOiAnc3RhcnQnfVxuXG4jIFtMaW1pdGF0aW9uOiB3b24ndCBmaXhdOiBTZWxlY3RlZCByYW5nZSBpcyBub3Qgc3VibW9kZSBhd2FyZS4gYWx3YXlzIGNoYXJhY3Rlcndpc2UuXG4jIFNvIGV2ZW4gaWYgb3JpZ2luYWwgc2VsZWN0aW9uIHdhcyB2TCBvciB2Qiwgc2VsZWN0ZWQgcmFuZ2UgYnkgdGhpcyB0ZXh0LW9iamVjdFxuIyBpcyBhbHdheXMgdkMgcmFuZ2UuXG5jbGFzcyBQcmV2aW91c1NlbGVjdGlvbiBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZCgpXG4gIHdpc2U6IG51bGxcbiAgc2VsZWN0T25jZTogdHJ1ZVxuXG4gIHNlbGVjdFRleHRPYmplY3Q6IChzZWxlY3Rpb24pIC0+XG4gICAge3Byb3BlcnRpZXMsIHN1Ym1vZGV9ID0gQHZpbVN0YXRlLnByZXZpb3VzU2VsZWN0aW9uXG4gICAgaWYgcHJvcGVydGllcz8gYW5kIHN1Ym1vZGU/XG4gICAgICBAd2lzZSA9IHN1Ym1vZGVcbiAgICAgIEBzd3JhcChAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKSkuc2VsZWN0QnlQcm9wZXJ0aWVzKHByb3BlcnRpZXMpXG4gICAgICByZXR1cm4gdHJ1ZVxuXG5jbGFzcyBQZXJzaXN0ZW50U2VsZWN0aW9uIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVyaXZlSW5uZXJBbmRBKClcbiAgd2lzZTogbnVsbFxuICBzZWxlY3RPbmNlOiB0cnVlXG5cbiAgc2VsZWN0VGV4dE9iamVjdDogKHNlbGVjdGlvbikgLT5cbiAgICBpZiBAdmltU3RhdGUuaGFzUGVyc2lzdGVudFNlbGVjdGlvbnMoKVxuICAgICAgQHZpbVN0YXRlLnBlcnNpc3RlbnRTZWxlY3Rpb24uc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXMoKVxuICAgICAgcmV0dXJuIHRydWVcblxuIyBVc2VkIG9ubHkgYnkgUmVwbGFjZVdpdGhSZWdpc3RlciBhbmQgUHV0QmVmb3JlIGFuZCBpdHMnIGNoaWxkcmVuLlxuY2xhc3MgTGFzdFBhc3RlZFJhbmdlIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuICB3aXNlOiBudWxsXG4gIHNlbGVjdE9uY2U6IHRydWVcblxuICBzZWxlY3RUZXh0T2JqZWN0OiAoc2VsZWN0aW9uKSAtPlxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIHJhbmdlID0gQHZpbVN0YXRlLnNlcXVlbnRpYWxQYXN0ZU1hbmFnZXIuZ2V0UGFzdGVkUmFuZ2VGb3JTZWxlY3Rpb24oc2VsZWN0aW9uKVxuICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKHJhbmdlKVxuXG4gICAgcmV0dXJuIHRydWVcblxuY2xhc3MgVmlzaWJsZUFyZWEgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXJpdmVJbm5lckFuZEEoKVxuICBzZWxlY3RPbmNlOiB0cnVlXG5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgIyBbQlVHP10gTmVlZCB0cmFuc2xhdGUgdG8gc2hpbG5rIHRvcCBhbmQgYm90dG9tIHRvIGZpdCBhY3R1YWwgcm93LlxuICAgICMgVGhlIHJlYXNvbiBJIG5lZWQgLTIgYXQgYm90dG9tIGlzIGJlY2F1c2Ugb2Ygc3RhdHVzIGJhcj9cbiAgICBidWZmZXJSYW5nZSA9IGdldFZpc2libGVCdWZmZXJSYW5nZShAZWRpdG9yKVxuICAgIGlmIGJ1ZmZlclJhbmdlLmdldFJvd3MoKSA+IEBlZGl0b3IuZ2V0Um93c1BlclBhZ2UoKVxuICAgICAgYnVmZmVyUmFuZ2UudHJhbnNsYXRlKFsrMSwgMF0sIFstMywgMF0pXG4gICAgZWxzZVxuICAgICAgYnVmZmVyUmFuZ2VcbiJdfQ==
