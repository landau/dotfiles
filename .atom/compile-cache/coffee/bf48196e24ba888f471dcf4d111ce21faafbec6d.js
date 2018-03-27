(function() {
  var AAngleBracket, AAngleBracketAllowForwarding, AAnyPair, AAnyPairAllowForwarding, AAnyQuote, ABackTick, AComment, ACurlyBracket, ACurlyBracketAllowForwarding, ACurrentLine, ADoubleQuote, AEdge, AEntire, AFold, AFunction, AIndentation, ALatestChange, APair, AParagraph, AParenthesis, AParenthesisAllowForwarding, APersistentSelection, ASingleQuote, ASmartWord, ASquareBracket, ASquareBracketAllowForwarding, ASubword, ATag, AVisibleArea, AWholeWord, AWord, All, AngleBracket, AnyPair, AnyPairAllowForwarding, AnyQuote, BackTick, Base, BracketFinder, Comment, CurlyBracket, CurrentLine, DoubleQuote, Edge, Empty, Entire, Fold, Function, Indentation, InnerAngleBracket, InnerAngleBracketAllowForwarding, InnerAnyPair, InnerAnyPairAllowForwarding, InnerAnyQuote, InnerBackTick, InnerComment, InnerCurlyBracket, InnerCurlyBracketAllowForwarding, InnerCurrentLine, InnerDoubleQuote, InnerEdge, InnerEntire, InnerFold, InnerFunction, InnerIndentation, InnerLatestChange, InnerParagraph, InnerParenthesis, InnerParenthesisAllowForwarding, InnerPersistentSelection, InnerSingleQuote, InnerSmartWord, InnerSquareBracket, InnerSquareBracketAllowForwarding, InnerSubword, InnerTag, InnerVisibleArea, InnerWholeWord, InnerWord, LatestChange, Pair, Paragraph, Parenthesis, PersistentSelection, Point, PreviousSelection, Quote, QuoteFinder, Range, SearchMatchBackward, SearchMatchForward, SingleQuote, SmartWord, SquareBracket, Subword, Tag, TagFinder, TextObject, VisibleArea, WholeWord, Word, _, expandRangeToWhiteSpaces, getBufferRangeForRowRange, getBufferRows, getCodeFoldRowRangesContainesForRow, getIndentLevelForBufferRow, getLineTextToBufferPosition, getValidVimBufferRow, getVisibleBufferRange, isIncludeFunctionScopeForRow, pointIsAtEndOfLine, ref, ref1, ref2, settings, sortRanges, swrap, translatePointAndClip, trimRange,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Range = ref.Range, Point = ref.Point;

  _ = require('underscore-plus');

  settings = require('./settings');

  Base = require('./base');

  swrap = require('./selection-wrapper');

  ref1 = require('./utils'), getLineTextToBufferPosition = ref1.getLineTextToBufferPosition, getIndentLevelForBufferRow = ref1.getIndentLevelForBufferRow, getCodeFoldRowRangesContainesForRow = ref1.getCodeFoldRowRangesContainesForRow, getBufferRangeForRowRange = ref1.getBufferRangeForRowRange, isIncludeFunctionScopeForRow = ref1.isIncludeFunctionScopeForRow, expandRangeToWhiteSpaces = ref1.expandRangeToWhiteSpaces, getVisibleBufferRange = ref1.getVisibleBufferRange, translatePointAndClip = ref1.translatePointAndClip, getBufferRows = ref1.getBufferRows, getValidVimBufferRow = ref1.getValidVimBufferRow, trimRange = ref1.trimRange, sortRanges = ref1.sortRanges, pointIsAtEndOfLine = ref1.pointIsAtEndOfLine;

  ref2 = require('./pair-finder.coffee'), BracketFinder = ref2.BracketFinder, QuoteFinder = ref2.QuoteFinder, TagFinder = ref2.TagFinder;

  TextObject = (function(superClass) {
    extend(TextObject, superClass);

    TextObject.extend(false);

    TextObject.prototype.wise = null;

    TextObject.prototype.supportCount = false;

    function TextObject() {
      this.constructor.prototype.inner = this.getName().startsWith('Inner');
      TextObject.__super__.constructor.apply(this, arguments);
      this.initialize();
    }

    TextObject.prototype.isInner = function() {
      return this.inner;
    };

    TextObject.prototype.isA = function() {
      return !this.isInner();
    };

    TextObject.prototype.isSuportCount = function() {
      return this.supportCount;
    };

    TextObject.prototype.getWise = function() {
      if ((this.wise != null) && this.getOperator().isOccurrence()) {
        return 'characterwise';
      } else {
        return this.wise;
      }
    };

    TextObject.prototype.isCharacterwise = function() {
      return this.getWise() === 'characterwise';
    };

    TextObject.prototype.isLinewise = function() {
      return this.getWise() === 'linewise';
    };

    TextObject.prototype.isBlockwise = function() {
      return this.getWise() === 'blockwise';
    };

    TextObject.prototype.getNormalizedHeadBufferPosition = function(selection) {
      var head;
      head = selection.getHeadBufferPosition();
      if (this.isMode('visual') && !selection.isReversed()) {
        head = translatePointAndClip(this.editor, head, 'backward');
      }
      return head;
    };

    TextObject.prototype.getNormalizedHeadScreenPosition = function(selection) {
      var bufferPosition;
      bufferPosition = this.getNormalizedHeadBufferPosition(selection);
      return this.editor.screenPositionForBufferPosition(bufferPosition);
    };

    TextObject.prototype.needToKeepColumn = function() {
      return this.wise === 'linewise' && settings.get('keepColumnOnSelectTextObject') && this.getOperator()["instanceof"]('Select');
    };

    TextObject.prototype.execute = function() {
      if (this.hasOperator()) {
        return this.select();
      } else {
        throw new Error('in TextObject: Must not happen');
      }
    };

    TextObject.prototype.select = function() {
      var i, len, ref3, selectResults, selection;
      selectResults = [];
      this.countTimes(this.getCount(), (function(_this) {
        return function(arg) {
          var i, len, ref3, results, selection, stop;
          stop = arg.stop;
          _this.stopSelection = stop;
          ref3 = _this.editor.getSelections();
          results = [];
          for (i = 0, len = ref3.length; i < len; i++) {
            selection = ref3[i];
            selectResults.push(_this.selectTextObject(selection));
            if (!_this.isSuportCount()) {
              results.push(_this.stopSelection());
            } else {
              results.push(void 0);
            }
          }
          return results;
        };
      })(this));
      if (this.needToKeepColumn()) {
        ref3 = this.editor.getSelections();
        for (i = 0, len = ref3.length; i < len; i++) {
          selection = ref3[i];
          swrap(selection).clipPropertiesTillEndOfLine();
        }
      }
      this.editor.mergeIntersectingSelections();
      if (this.isMode('visual') && this.wise === 'characterwise') {
        swrap.saveProperties(this.editor);
      }
      if (selectResults.some(function(value) {
        return value;
      })) {
        return this.wise != null ? this.wise : this.wise = swrap.detectVisualModeSubmode(this.editor);
      } else {
        return this.wise = null;
      }
    };

    TextObject.prototype.selectTextObject = function(selection) {
      var needToKeepColumn, newRange, oldRange, options, range;
      if (range = this.getRange(selection)) {
        oldRange = selection.getBufferRange();
        needToKeepColumn = this.needToKeepColumn();
        if (needToKeepColumn && !this.isMode('visual', 'linewise')) {
          this.vimState.modeManager.activate('visual', 'linewise');
        }
        options = {
          autoscroll: selection.isLastSelection() && !this.getOperator().supportEarlySelect,
          keepGoalColumn: needToKeepColumn
        };
        swrap(selection).setBufferRangeSafely(range, options);
        newRange = selection.getBufferRange();
        if (newRange.isEqual(oldRange)) {
          this.stopSelection();
        }
        return true;
      } else {
        this.stopSelection();
        return false;
      }
    };

    TextObject.prototype.getRange = function() {};

    return TextObject;

  })(Base);

  Word = (function(superClass) {
    extend(Word, superClass);

    function Word() {
      return Word.__super__.constructor.apply(this, arguments);
    }

    Word.extend(false);

    Word.prototype.getRange = function(selection) {
      var point, range;
      point = this.getNormalizedHeadBufferPosition(selection);
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

  AWord = (function(superClass) {
    extend(AWord, superClass);

    function AWord() {
      return AWord.__super__.constructor.apply(this, arguments);
    }

    AWord.extend();

    return AWord;

  })(Word);

  InnerWord = (function(superClass) {
    extend(InnerWord, superClass);

    function InnerWord() {
      return InnerWord.__super__.constructor.apply(this, arguments);
    }

    InnerWord.extend();

    return InnerWord;

  })(Word);

  WholeWord = (function(superClass) {
    extend(WholeWord, superClass);

    function WholeWord() {
      return WholeWord.__super__.constructor.apply(this, arguments);
    }

    WholeWord.extend(false);

    WholeWord.prototype.wordRegex = /\S+/;

    return WholeWord;

  })(Word);

  AWholeWord = (function(superClass) {
    extend(AWholeWord, superClass);

    function AWholeWord() {
      return AWholeWord.__super__.constructor.apply(this, arguments);
    }

    AWholeWord.extend();

    return AWholeWord;

  })(WholeWord);

  InnerWholeWord = (function(superClass) {
    extend(InnerWholeWord, superClass);

    function InnerWholeWord() {
      return InnerWholeWord.__super__.constructor.apply(this, arguments);
    }

    InnerWholeWord.extend();

    return InnerWholeWord;

  })(WholeWord);

  SmartWord = (function(superClass) {
    extend(SmartWord, superClass);

    function SmartWord() {
      return SmartWord.__super__.constructor.apply(this, arguments);
    }

    SmartWord.extend(false);

    SmartWord.prototype.wordRegex = /[\w-]+/;

    return SmartWord;

  })(Word);

  ASmartWord = (function(superClass) {
    extend(ASmartWord, superClass);

    function ASmartWord() {
      return ASmartWord.__super__.constructor.apply(this, arguments);
    }

    ASmartWord.description = "A word that consists of alphanumeric chars(`/[A-Za-z0-9_]/`) and hyphen `-`";

    ASmartWord.extend();

    return ASmartWord;

  })(SmartWord);

  InnerSmartWord = (function(superClass) {
    extend(InnerSmartWord, superClass);

    function InnerSmartWord() {
      return InnerSmartWord.__super__.constructor.apply(this, arguments);
    }

    InnerSmartWord.description = "Currently No diff from `a-smart-word`";

    InnerSmartWord.extend();

    return InnerSmartWord;

  })(SmartWord);

  Subword = (function(superClass) {
    extend(Subword, superClass);

    function Subword() {
      return Subword.__super__.constructor.apply(this, arguments);
    }

    Subword.extend(false);

    Subword.prototype.getRange = function(selection) {
      this.wordRegex = selection.cursor.subwordRegExp();
      return Subword.__super__.getRange.apply(this, arguments);
    };

    return Subword;

  })(Word);

  ASubword = (function(superClass) {
    extend(ASubword, superClass);

    function ASubword() {
      return ASubword.__super__.constructor.apply(this, arguments);
    }

    ASubword.extend();

    return ASubword;

  })(Subword);

  InnerSubword = (function(superClass) {
    extend(InnerSubword, superClass);

    function InnerSubword() {
      return InnerSubword.__super__.constructor.apply(this, arguments);
    }

    InnerSubword.extend();

    return InnerSubword;

  })(Subword);

  Pair = (function(superClass) {
    extend(Pair, superClass);

    Pair.extend(false);

    Pair.prototype.allowNextLine = null;

    Pair.prototype.adjustInnerRange = true;

    Pair.prototype.pair = null;

    Pair.prototype.wise = 'characterwise';

    Pair.prototype.supportCount = true;

    Pair.prototype.isAllowNextLine = function() {
      var ref3;
      return (ref3 = this.allowNextLine) != null ? ref3 : (this.pair != null) && this.pair[0] !== this.pair[1];
    };

    function Pair() {
      if (this.allowForwarding == null) {
        this.allowForwarding = this.getName().endsWith('AllowForwarding');
      }
      Pair.__super__.constructor.apply(this, arguments);
    }

    Pair.prototype.adjustRange = function(arg) {
      var end, start;
      start = arg.start, end = arg.end;
      if (pointIsAtEndOfLine(this.editor, start)) {
        start = start.traverse([1, 0]);
      }
      if (getLineTextToBufferPosition(this.editor, end).match(/^\s*$/)) {
        if (this.isMode('visual')) {
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

    Pair.prototype.getPointToSearchFrom = function(selection, searchFrom) {
      switch (searchFrom) {
        case 'head':
          return this.getNormalizedHeadBufferPosition(selection);
        case 'start':
          return swrap(selection).getBufferPositionFor('start');
      }
    };

    Pair.prototype.getRange = function(selection, options) {
      var allowForwarding, originalRange, pairInfo, searchFrom;
      if (options == null) {
        options = {};
      }
      allowForwarding = options.allowForwarding, searchFrom = options.searchFrom;
      if (searchFrom == null) {
        searchFrom = 'head';
      }
      if (allowForwarding != null) {
        this.allowForwarding = allowForwarding;
      }
      originalRange = selection.getBufferRange();
      pairInfo = this.getPairInfo(this.getPointToSearchFrom(selection, searchFrom));
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

    AnyPair.prototype.allowForwarding = false;

    AnyPair.prototype.member = ['DoubleQuote', 'SingleQuote', 'BackTick', 'CurlyBracket', 'AngleBracket', 'SquareBracket', 'Parenthesis'];

    AnyPair.prototype.getRangeBy = function(klass, selection) {
      return this["new"](klass).getRange(selection, {
        allowForwarding: this.allowForwarding,
        searchFrom: this.searchFrom
      });
    };

    AnyPair.prototype.getRanges = function(selection) {
      var i, klass, len, prefix, range, ranges, ref3;
      prefix = this.isInner() ? 'Inner' : 'A';
      ranges = [];
      ref3 = this.member;
      for (i = 0, len = ref3.length; i < len; i++) {
        klass = ref3[i];
        if (range = this.getRangeBy(prefix + klass, selection)) {
          ranges.push(range);
        }
      }
      return ranges;
    };

    AnyPair.prototype.getRange = function(selection) {
      var ranges;
      ranges = this.getRanges(selection);
      if (ranges.length) {
        return _.last(sortRanges(ranges));
      }
    };

    return AnyPair;

  })(Pair);

  AAnyPair = (function(superClass) {
    extend(AAnyPair, superClass);

    function AAnyPair() {
      return AAnyPair.__super__.constructor.apply(this, arguments);
    }

    AAnyPair.extend();

    return AAnyPair;

  })(AnyPair);

  InnerAnyPair = (function(superClass) {
    extend(InnerAnyPair, superClass);

    function InnerAnyPair() {
      return InnerAnyPair.__super__.constructor.apply(this, arguments);
    }

    InnerAnyPair.extend();

    return InnerAnyPair;

  })(AnyPair);

  AnyPairAllowForwarding = (function(superClass) {
    extend(AnyPairAllowForwarding, superClass);

    function AnyPairAllowForwarding() {
      return AnyPairAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    AnyPairAllowForwarding.extend(false);

    AnyPairAllowForwarding.description = "Range surrounded by auto-detected paired chars from enclosed and forwarding area";

    AnyPairAllowForwarding.prototype.allowForwarding = true;

    AnyPairAllowForwarding.prototype.searchFrom = 'start';

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

  AAnyPairAllowForwarding = (function(superClass) {
    extend(AAnyPairAllowForwarding, superClass);

    function AAnyPairAllowForwarding() {
      return AAnyPairAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    AAnyPairAllowForwarding.extend();

    return AAnyPairAllowForwarding;

  })(AnyPairAllowForwarding);

  InnerAnyPairAllowForwarding = (function(superClass) {
    extend(InnerAnyPairAllowForwarding, superClass);

    function InnerAnyPairAllowForwarding() {
      return InnerAnyPairAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    InnerAnyPairAllowForwarding.extend();

    return InnerAnyPairAllowForwarding;

  })(AnyPairAllowForwarding);

  AnyQuote = (function(superClass) {
    extend(AnyQuote, superClass);

    function AnyQuote() {
      return AnyQuote.__super__.constructor.apply(this, arguments);
    }

    AnyQuote.extend(false);

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

  AAnyQuote = (function(superClass) {
    extend(AAnyQuote, superClass);

    function AAnyQuote() {
      return AAnyQuote.__super__.constructor.apply(this, arguments);
    }

    AAnyQuote.extend();

    return AAnyQuote;

  })(AnyQuote);

  InnerAnyQuote = (function(superClass) {
    extend(InnerAnyQuote, superClass);

    function InnerAnyQuote() {
      return InnerAnyQuote.__super__.constructor.apply(this, arguments);
    }

    InnerAnyQuote.extend();

    return InnerAnyQuote;

  })(AnyQuote);

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

    DoubleQuote.prototype.pair = ['"', '"'];

    return DoubleQuote;

  })(Quote);

  ADoubleQuote = (function(superClass) {
    extend(ADoubleQuote, superClass);

    function ADoubleQuote() {
      return ADoubleQuote.__super__.constructor.apply(this, arguments);
    }

    ADoubleQuote.extend();

    return ADoubleQuote;

  })(DoubleQuote);

  InnerDoubleQuote = (function(superClass) {
    extend(InnerDoubleQuote, superClass);

    function InnerDoubleQuote() {
      return InnerDoubleQuote.__super__.constructor.apply(this, arguments);
    }

    InnerDoubleQuote.extend();

    return InnerDoubleQuote;

  })(DoubleQuote);

  SingleQuote = (function(superClass) {
    extend(SingleQuote, superClass);

    function SingleQuote() {
      return SingleQuote.__super__.constructor.apply(this, arguments);
    }

    SingleQuote.extend(false);

    SingleQuote.prototype.pair = ["'", "'"];

    return SingleQuote;

  })(Quote);

  ASingleQuote = (function(superClass) {
    extend(ASingleQuote, superClass);

    function ASingleQuote() {
      return ASingleQuote.__super__.constructor.apply(this, arguments);
    }

    ASingleQuote.extend();

    return ASingleQuote;

  })(SingleQuote);

  InnerSingleQuote = (function(superClass) {
    extend(InnerSingleQuote, superClass);

    function InnerSingleQuote() {
      return InnerSingleQuote.__super__.constructor.apply(this, arguments);
    }

    InnerSingleQuote.extend();

    return InnerSingleQuote;

  })(SingleQuote);

  BackTick = (function(superClass) {
    extend(BackTick, superClass);

    function BackTick() {
      return BackTick.__super__.constructor.apply(this, arguments);
    }

    BackTick.extend(false);

    BackTick.prototype.pair = ['`', '`'];

    return BackTick;

  })(Quote);

  ABackTick = (function(superClass) {
    extend(ABackTick, superClass);

    function ABackTick() {
      return ABackTick.__super__.constructor.apply(this, arguments);
    }

    ABackTick.extend();

    return ABackTick;

  })(BackTick);

  InnerBackTick = (function(superClass) {
    extend(InnerBackTick, superClass);

    function InnerBackTick() {
      return InnerBackTick.__super__.constructor.apply(this, arguments);
    }

    InnerBackTick.extend();

    return InnerBackTick;

  })(BackTick);

  CurlyBracket = (function(superClass) {
    extend(CurlyBracket, superClass);

    function CurlyBracket() {
      return CurlyBracket.__super__.constructor.apply(this, arguments);
    }

    CurlyBracket.extend(false);

    CurlyBracket.prototype.pair = ['{', '}'];

    return CurlyBracket;

  })(Pair);

  ACurlyBracket = (function(superClass) {
    extend(ACurlyBracket, superClass);

    function ACurlyBracket() {
      return ACurlyBracket.__super__.constructor.apply(this, arguments);
    }

    ACurlyBracket.extend();

    return ACurlyBracket;

  })(CurlyBracket);

  InnerCurlyBracket = (function(superClass) {
    extend(InnerCurlyBracket, superClass);

    function InnerCurlyBracket() {
      return InnerCurlyBracket.__super__.constructor.apply(this, arguments);
    }

    InnerCurlyBracket.extend();

    return InnerCurlyBracket;

  })(CurlyBracket);

  ACurlyBracketAllowForwarding = (function(superClass) {
    extend(ACurlyBracketAllowForwarding, superClass);

    function ACurlyBracketAllowForwarding() {
      return ACurlyBracketAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    ACurlyBracketAllowForwarding.extend();

    return ACurlyBracketAllowForwarding;

  })(CurlyBracket);

  InnerCurlyBracketAllowForwarding = (function(superClass) {
    extend(InnerCurlyBracketAllowForwarding, superClass);

    function InnerCurlyBracketAllowForwarding() {
      return InnerCurlyBracketAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    InnerCurlyBracketAllowForwarding.extend();

    return InnerCurlyBracketAllowForwarding;

  })(CurlyBracket);

  SquareBracket = (function(superClass) {
    extend(SquareBracket, superClass);

    function SquareBracket() {
      return SquareBracket.__super__.constructor.apply(this, arguments);
    }

    SquareBracket.extend(false);

    SquareBracket.prototype.pair = ['[', ']'];

    return SquareBracket;

  })(Pair);

  ASquareBracket = (function(superClass) {
    extend(ASquareBracket, superClass);

    function ASquareBracket() {
      return ASquareBracket.__super__.constructor.apply(this, arguments);
    }

    ASquareBracket.extend();

    return ASquareBracket;

  })(SquareBracket);

  InnerSquareBracket = (function(superClass) {
    extend(InnerSquareBracket, superClass);

    function InnerSquareBracket() {
      return InnerSquareBracket.__super__.constructor.apply(this, arguments);
    }

    InnerSquareBracket.extend();

    return InnerSquareBracket;

  })(SquareBracket);

  ASquareBracketAllowForwarding = (function(superClass) {
    extend(ASquareBracketAllowForwarding, superClass);

    function ASquareBracketAllowForwarding() {
      return ASquareBracketAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    ASquareBracketAllowForwarding.extend();

    return ASquareBracketAllowForwarding;

  })(SquareBracket);

  InnerSquareBracketAllowForwarding = (function(superClass) {
    extend(InnerSquareBracketAllowForwarding, superClass);

    function InnerSquareBracketAllowForwarding() {
      return InnerSquareBracketAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    InnerSquareBracketAllowForwarding.extend();

    return InnerSquareBracketAllowForwarding;

  })(SquareBracket);

  Parenthesis = (function(superClass) {
    extend(Parenthesis, superClass);

    function Parenthesis() {
      return Parenthesis.__super__.constructor.apply(this, arguments);
    }

    Parenthesis.extend(false);

    Parenthesis.prototype.pair = ['(', ')'];

    return Parenthesis;

  })(Pair);

  AParenthesis = (function(superClass) {
    extend(AParenthesis, superClass);

    function AParenthesis() {
      return AParenthesis.__super__.constructor.apply(this, arguments);
    }

    AParenthesis.extend();

    return AParenthesis;

  })(Parenthesis);

  InnerParenthesis = (function(superClass) {
    extend(InnerParenthesis, superClass);

    function InnerParenthesis() {
      return InnerParenthesis.__super__.constructor.apply(this, arguments);
    }

    InnerParenthesis.extend();

    return InnerParenthesis;

  })(Parenthesis);

  AParenthesisAllowForwarding = (function(superClass) {
    extend(AParenthesisAllowForwarding, superClass);

    function AParenthesisAllowForwarding() {
      return AParenthesisAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    AParenthesisAllowForwarding.extend();

    return AParenthesisAllowForwarding;

  })(Parenthesis);

  InnerParenthesisAllowForwarding = (function(superClass) {
    extend(InnerParenthesisAllowForwarding, superClass);

    function InnerParenthesisAllowForwarding() {
      return InnerParenthesisAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    InnerParenthesisAllowForwarding.extend();

    return InnerParenthesisAllowForwarding;

  })(Parenthesis);

  AngleBracket = (function(superClass) {
    extend(AngleBracket, superClass);

    function AngleBracket() {
      return AngleBracket.__super__.constructor.apply(this, arguments);
    }

    AngleBracket.extend(false);

    AngleBracket.prototype.pair = ['<', '>'];

    return AngleBracket;

  })(Pair);

  AAngleBracket = (function(superClass) {
    extend(AAngleBracket, superClass);

    function AAngleBracket() {
      return AAngleBracket.__super__.constructor.apply(this, arguments);
    }

    AAngleBracket.extend();

    return AAngleBracket;

  })(AngleBracket);

  InnerAngleBracket = (function(superClass) {
    extend(InnerAngleBracket, superClass);

    function InnerAngleBracket() {
      return InnerAngleBracket.__super__.constructor.apply(this, arguments);
    }

    InnerAngleBracket.extend();

    return InnerAngleBracket;

  })(AngleBracket);

  AAngleBracketAllowForwarding = (function(superClass) {
    extend(AAngleBracketAllowForwarding, superClass);

    function AAngleBracketAllowForwarding() {
      return AAngleBracketAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    AAngleBracketAllowForwarding.extend();

    return AAngleBracketAllowForwarding;

  })(AngleBracket);

  InnerAngleBracketAllowForwarding = (function(superClass) {
    extend(InnerAngleBracketAllowForwarding, superClass);

    function InnerAngleBracketAllowForwarding() {
      return InnerAngleBracketAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    InnerAngleBracketAllowForwarding.extend();

    return InnerAngleBracketAllowForwarding;

  })(AngleBracket);

  Tag = (function(superClass) {
    extend(Tag, superClass);

    function Tag() {
      return Tag.__super__.constructor.apply(this, arguments);
    }

    Tag.extend(false);

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

  ATag = (function(superClass) {
    extend(ATag, superClass);

    function ATag() {
      return ATag.__super__.constructor.apply(this, arguments);
    }

    ATag.extend();

    return ATag;

  })(Tag);

  InnerTag = (function(superClass) {
    extend(InnerTag, superClass);

    function InnerTag() {
      return InnerTag.__super__.constructor.apply(this, arguments);
    }

    InnerTag.extend();

    return InnerTag;

  })(Tag);

  Paragraph = (function(superClass) {
    extend(Paragraph, superClass);

    function Paragraph() {
      return Paragraph.__super__.constructor.apply(this, arguments);
    }

    Paragraph.extend(false);

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
      fromRow = this.getNormalizedHeadBufferPosition(selection).row;
      if (this.isMode('visual', 'linewise')) {
        if (selection.isReversed()) {
          fromRow--;
        } else {
          fromRow++;
        }
        fromRow = getValidVimBufferRow(this.editor, fromRow);
      }
      rowRange = this.findRowRangeBy(fromRow, this.getPredictFunction(fromRow, selection));
      return selection.getBufferRange().union(getBufferRangeForRowRange(this.editor, rowRange));
    };

    return Paragraph;

  })(TextObject);

  AParagraph = (function(superClass) {
    extend(AParagraph, superClass);

    function AParagraph() {
      return AParagraph.__super__.constructor.apply(this, arguments);
    }

    AParagraph.extend();

    return AParagraph;

  })(Paragraph);

  InnerParagraph = (function(superClass) {
    extend(InnerParagraph, superClass);

    function InnerParagraph() {
      return InnerParagraph.__super__.constructor.apply(this, arguments);
    }

    InnerParagraph.extend();

    return InnerParagraph;

  })(Paragraph);

  Indentation = (function(superClass) {
    extend(Indentation, superClass);

    function Indentation() {
      return Indentation.__super__.constructor.apply(this, arguments);
    }

    Indentation.extend(false);

    Indentation.prototype.getRange = function(selection) {
      var baseIndentLevel, fromRow, predict, rowRange;
      fromRow = this.getNormalizedHeadBufferPosition(selection).row;
      baseIndentLevel = getIndentLevelForBufferRow(this.editor, fromRow);
      predict = (function(_this) {
        return function(row) {
          if (_this.editor.isBufferRowBlank(row)) {
            return _this.isA();
          } else {
            return getIndentLevelForBufferRow(_this.editor, row) >= baseIndentLevel;
          }
        };
      })(this);
      rowRange = this.findRowRangeBy(fromRow, predict);
      return getBufferRangeForRowRange(this.editor, rowRange);
    };

    return Indentation;

  })(Paragraph);

  AIndentation = (function(superClass) {
    extend(AIndentation, superClass);

    function AIndentation() {
      return AIndentation.__super__.constructor.apply(this, arguments);
    }

    AIndentation.extend();

    return AIndentation;

  })(Indentation);

  InnerIndentation = (function(superClass) {
    extend(InnerIndentation, superClass);

    function InnerIndentation() {
      return InnerIndentation.__super__.constructor.apply(this, arguments);
    }

    InnerIndentation.extend();

    return InnerIndentation;

  })(Indentation);

  Comment = (function(superClass) {
    extend(Comment, superClass);

    function Comment() {
      return Comment.__super__.constructor.apply(this, arguments);
    }

    Comment.extend(false);

    Comment.prototype.wise = 'linewise';

    Comment.prototype.getRange = function(selection) {
      var row, rowRange;
      row = swrap(selection).getStartRow();
      rowRange = this.editor.languageMode.rowRangeForCommentAtBufferRow(row);
      if (this.editor.isBufferRowCommented(row)) {
        if (rowRange == null) {
          rowRange = [row, row];
        }
      }
      if (rowRange) {
        return getBufferRangeForRowRange(selection.editor, rowRange);
      }
    };

    return Comment;

  })(TextObject);

  AComment = (function(superClass) {
    extend(AComment, superClass);

    function AComment() {
      return AComment.__super__.constructor.apply(this, arguments);
    }

    AComment.extend();

    return AComment;

  })(Comment);

  InnerComment = (function(superClass) {
    extend(InnerComment, superClass);

    function InnerComment() {
      return InnerComment.__super__.constructor.apply(this, arguments);
    }

    InnerComment.extend();

    return InnerComment;

  })(Comment);

  Fold = (function(superClass) {
    extend(Fold, superClass);

    function Fold() {
      return Fold.__super__.constructor.apply(this, arguments);
    }

    Fold.extend(false);

    Fold.prototype.wise = 'linewise';

    Fold.prototype.adjustRowRange = function(rowRange) {
      var endRow, endRowIndentLevel, startRow, startRowIndentLevel;
      if (!this.isInner()) {
        return rowRange;
      }
      startRow = rowRange[0], endRow = rowRange[1];
      startRowIndentLevel = getIndentLevelForBufferRow(this.editor, startRow);
      endRowIndentLevel = getIndentLevelForBufferRow(this.editor, endRow);
      if (startRowIndentLevel === endRowIndentLevel) {
        endRow -= 1;
      }
      startRow += 1;
      return [startRow, endRow];
    };

    Fold.prototype.getFoldRowRangesContainsForRow = function(row) {
      return getCodeFoldRowRangesContainesForRow(this.editor, row, {
        includeStartRow: true
      }).reverse();
    };

    Fold.prototype.getRange = function(selection) {
      var range, rowRanges;
      rowRanges = this.getFoldRowRangesContainsForRow(swrap(selection).getStartRow());
      if (!rowRanges.length) {
        return;
      }
      range = getBufferRangeForRowRange(this.editor, this.adjustRowRange(rowRanges.shift()));
      if (rowRanges.length && range.isEqual(selection.getBufferRange())) {
        range = getBufferRangeForRowRange(this.editor, this.adjustRowRange(rowRanges.shift()));
      }
      return range;
    };

    return Fold;

  })(TextObject);

  AFold = (function(superClass) {
    extend(AFold, superClass);

    function AFold() {
      return AFold.__super__.constructor.apply(this, arguments);
    }

    AFold.extend();

    return AFold;

  })(Fold);

  InnerFold = (function(superClass) {
    extend(InnerFold, superClass);

    function InnerFold() {
      return InnerFold.__super__.constructor.apply(this, arguments);
    }

    InnerFold.extend();

    return InnerFold;

  })(Fold);

  Function = (function(superClass) {
    extend(Function, superClass);

    function Function() {
      return Function.__super__.constructor.apply(this, arguments);
    }

    Function.extend(false);

    Function.prototype.scopeNamesOmittingEndRow = ['source.go', 'source.elixir'];

    Function.prototype.getFoldRowRangesContainsForRow = function(row) {
      var ref3, rowRanges;
      rowRanges = (ref3 = getCodeFoldRowRangesContainesForRow(this.editor, row)) != null ? ref3.reverse() : void 0;
      return rowRanges != null ? rowRanges.filter((function(_this) {
        return function(rowRange) {
          return isIncludeFunctionScopeForRow(_this.editor, rowRange[0]);
        };
      })(this)) : void 0;
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

  AFunction = (function(superClass) {
    extend(AFunction, superClass);

    function AFunction() {
      return AFunction.__super__.constructor.apply(this, arguments);
    }

    AFunction.extend();

    return AFunction;

  })(Function);

  InnerFunction = (function(superClass) {
    extend(InnerFunction, superClass);

    function InnerFunction() {
      return InnerFunction.__super__.constructor.apply(this, arguments);
    }

    InnerFunction.extend();

    return InnerFunction;

  })(Function);

  CurrentLine = (function(superClass) {
    extend(CurrentLine, superClass);

    function CurrentLine() {
      return CurrentLine.__super__.constructor.apply(this, arguments);
    }

    CurrentLine.extend(false);

    CurrentLine.prototype.getRange = function(selection) {
      var range, row;
      row = this.getNormalizedHeadBufferPosition(selection).row;
      range = this.editor.bufferRangeForBufferRow(row);
      if (this.isA()) {
        return range;
      } else {
        return trimRange(this.editor, range);
      }
    };

    return CurrentLine;

  })(TextObject);

  ACurrentLine = (function(superClass) {
    extend(ACurrentLine, superClass);

    function ACurrentLine() {
      return ACurrentLine.__super__.constructor.apply(this, arguments);
    }

    ACurrentLine.extend();

    return ACurrentLine;

  })(CurrentLine);

  InnerCurrentLine = (function(superClass) {
    extend(InnerCurrentLine, superClass);

    function InnerCurrentLine() {
      return InnerCurrentLine.__super__.constructor.apply(this, arguments);
    }

    InnerCurrentLine.extend();

    return InnerCurrentLine;

  })(CurrentLine);

  Entire = (function(superClass) {
    extend(Entire, superClass);

    function Entire() {
      return Entire.__super__.constructor.apply(this, arguments);
    }

    Entire.extend(false);

    Entire.prototype.getRange = function(selection) {
      this.stopSelection();
      return this.editor.buffer.getRange();
    };

    return Entire;

  })(TextObject);

  AEntire = (function(superClass) {
    extend(AEntire, superClass);

    function AEntire() {
      return AEntire.__super__.constructor.apply(this, arguments);
    }

    AEntire.extend();

    return AEntire;

  })(Entire);

  InnerEntire = (function(superClass) {
    extend(InnerEntire, superClass);

    function InnerEntire() {
      return InnerEntire.__super__.constructor.apply(this, arguments);
    }

    InnerEntire.extend();

    return InnerEntire;

  })(Entire);

  All = (function(superClass) {
    extend(All, superClass);

    function All() {
      return All.__super__.constructor.apply(this, arguments);
    }

    All.extend(false);

    return All;

  })(Entire);

  Empty = (function(superClass) {
    extend(Empty, superClass);

    function Empty() {
      return Empty.__super__.constructor.apply(this, arguments);
    }

    Empty.extend(false);

    return Empty;

  })(TextObject);

  LatestChange = (function(superClass) {
    extend(LatestChange, superClass);

    function LatestChange() {
      return LatestChange.__super__.constructor.apply(this, arguments);
    }

    LatestChange.extend(false);

    LatestChange.prototype.getRange = function() {
      this.stopSelection();
      return this.vimState.mark.getRange('[', ']');
    };

    return LatestChange;

  })(TextObject);

  ALatestChange = (function(superClass) {
    extend(ALatestChange, superClass);

    function ALatestChange() {
      return ALatestChange.__super__.constructor.apply(this, arguments);
    }

    ALatestChange.extend();

    return ALatestChange;

  })(LatestChange);

  InnerLatestChange = (function(superClass) {
    extend(InnerLatestChange, superClass);

    function InnerLatestChange() {
      return InnerLatestChange.__super__.constructor.apply(this, arguments);
    }

    InnerLatestChange.extend();

    return InnerLatestChange;

  })(LatestChange);

  SearchMatchForward = (function(superClass) {
    extend(SearchMatchForward, superClass);

    function SearchMatchForward() {
      return SearchMatchForward.__super__.constructor.apply(this, arguments);
    }

    SearchMatchForward.extend();

    SearchMatchForward.prototype.backward = false;

    SearchMatchForward.prototype.findMatch = function(fromPoint, pattern) {
      var found;
      if (this.isMode('visual')) {
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
      var range, ref3, reversed;
      if (!(range = this.getRange(selection))) {
        return;
      }
      reversed = (ref3 = this.reversed) != null ? ref3 : this.backward;
      swrap(selection).setBufferRange(range, {
        reversed: reversed
      });
      selection.cursor.autoscroll();
      return true;
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
      if (this.isMode('visual')) {
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

    PreviousSelection.prototype.select = function() {
      var properties, ref3, selection, submode;
      ref3 = this.vimState.previousSelection, properties = ref3.properties, submode = ref3.submode;
      if ((properties != null) && (submode != null)) {
        selection = this.editor.getLastSelection();
        swrap(selection).selectByProperties(properties);
        return this.wise = submode;
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

    PersistentSelection.prototype.select = function() {
      var persistentSelection;
      persistentSelection = this.vimState.persistentSelection;
      if (!persistentSelection.isEmpty()) {
        persistentSelection.setSelectedBufferRanges();
        return this.wise = swrap.detectVisualModeSubmode(this.editor);
      }
    };

    return PersistentSelection;

  })(TextObject);

  APersistentSelection = (function(superClass) {
    extend(APersistentSelection, superClass);

    function APersistentSelection() {
      return APersistentSelection.__super__.constructor.apply(this, arguments);
    }

    APersistentSelection.extend();

    return APersistentSelection;

  })(PersistentSelection);

  InnerPersistentSelection = (function(superClass) {
    extend(InnerPersistentSelection, superClass);

    function InnerPersistentSelection() {
      return InnerPersistentSelection.__super__.constructor.apply(this, arguments);
    }

    InnerPersistentSelection.extend();

    return InnerPersistentSelection;

  })(PersistentSelection);

  VisibleArea = (function(superClass) {
    extend(VisibleArea, superClass);

    function VisibleArea() {
      return VisibleArea.__super__.constructor.apply(this, arguments);
    }

    VisibleArea.extend(false);

    VisibleArea.prototype.getRange = function(selection) {
      var bufferRange;
      this.stopSelection();
      bufferRange = getVisibleBufferRange(this.editor);
      if (bufferRange.getRows() > this.editor.getRowsPerPage()) {
        return bufferRange.translate([+1, 0], [-3, 0]);
      } else {
        return bufferRange;
      }
    };

    return VisibleArea;

  })(TextObject);

  AVisibleArea = (function(superClass) {
    extend(AVisibleArea, superClass);

    function AVisibleArea() {
      return AVisibleArea.__super__.constructor.apply(this, arguments);
    }

    AVisibleArea.extend();

    return AVisibleArea;

  })(VisibleArea);

  InnerVisibleArea = (function(superClass) {
    extend(InnerVisibleArea, superClass);

    function InnerVisibleArea() {
      return InnerVisibleArea.__super__.constructor.apply(this, arguments);
    }

    InnerVisibleArea.extend();

    return InnerVisibleArea;

  })(VisibleArea);

  Edge = (function(superClass) {
    extend(Edge, superClass);

    function Edge() {
      return Edge.__super__.constructor.apply(this, arguments);
    }

    Edge.extend(false);

    Edge.prototype.wise = 'linewise';

    Edge.prototype.getRange = function(selection) {
      var endScreenPoint, fromPoint, moveDownToEdge, moveUpToEdge, range, screenRange, startScreenPoint;
      fromPoint = this.getNormalizedHeadScreenPosition(selection);
      moveUpToEdge = this["new"]('MoveUpToEdge');
      moveDownToEdge = this["new"]('MoveDownToEdge');
      if (!moveUpToEdge.isStoppablePoint(fromPoint)) {
        return;
      }
      startScreenPoint = endScreenPoint = null;
      if (moveUpToEdge.isEdge(fromPoint)) {
        startScreenPoint = endScreenPoint = fromPoint;
      }
      if (moveUpToEdge.isStoppablePoint(fromPoint.translate([-1, 0]))) {
        startScreenPoint = moveUpToEdge.getPoint(fromPoint);
      }
      if (moveDownToEdge.isStoppablePoint(fromPoint.translate([+1, 0]))) {
        endScreenPoint = moveDownToEdge.getPoint(fromPoint);
      }
      if ((startScreenPoint != null) && (endScreenPoint != null)) {
        screenRange = new Range(startScreenPoint, endScreenPoint);
        range = this.editor.bufferRangeForScreenRange(screenRange);
        return getBufferRangeForRowRange(this.editor, [range.start.row, range.end.row]);
      }
    };

    return Edge;

  })(TextObject);

  AEdge = (function(superClass) {
    extend(AEdge, superClass);

    function AEdge() {
      return AEdge.__super__.constructor.apply(this, arguments);
    }

    AEdge.extend();

    return AEdge;

  })(Edge);

  InnerEdge = (function(superClass) {
    extend(InnerEdge, superClass);

    function InnerEdge() {
      return InnerEdge.__super__.constructor.apply(this, arguments);
    }

    InnerEdge.extend();

    return InnerEdge;

  })(Edge);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvdGV4dC1vYmplY3QuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx3eERBQUE7SUFBQTs7OztFQUFBLE1BQWlCLE9BQUEsQ0FBUSxNQUFSLENBQWpCLEVBQUMsaUJBQUQsRUFBUTs7RUFDUixDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUjs7RUFPWCxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBQ1AsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUjs7RUFDUixPQWVJLE9BQUEsQ0FBUSxTQUFSLENBZkosRUFDRSw4REFERixFQUVFLDREQUZGLEVBR0UsOEVBSEYsRUFJRSwwREFKRixFQUtFLGdFQUxGLEVBTUUsd0RBTkYsRUFPRSxrREFQRixFQVFFLGtEQVJGLEVBU0Usa0NBVEYsRUFVRSxnREFWRixFQVdFLDBCQVhGLEVBYUUsNEJBYkYsRUFjRTs7RUFFRixPQUEwQyxPQUFBLENBQVEsc0JBQVIsQ0FBMUMsRUFBQyxrQ0FBRCxFQUFnQiw4QkFBaEIsRUFBNkI7O0VBRXZCOzs7SUFDSixVQUFDLENBQUEsTUFBRCxDQUFRLEtBQVI7O3lCQUNBLElBQUEsR0FBTTs7eUJBQ04sWUFBQSxHQUFjOztJQUVELG9CQUFBO01BQ1gsSUFBQyxDQUFBLFdBQVcsQ0FBQSxTQUFFLENBQUEsS0FBZCxHQUFzQixJQUFDLENBQUEsT0FBRCxDQUFBLENBQVUsQ0FBQyxVQUFYLENBQXNCLE9BQXRCO01BQ3RCLDZDQUFBLFNBQUE7TUFDQSxJQUFDLENBQUEsVUFBRCxDQUFBO0lBSFc7O3lCQUtiLE9BQUEsR0FBUyxTQUFBO2FBQ1AsSUFBQyxDQUFBO0lBRE07O3lCQUdULEdBQUEsR0FBSyxTQUFBO2FBQ0gsQ0FBSSxJQUFDLENBQUEsT0FB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QUFBLEdBQWlCLFVBQXBDOztNQUVBLElBQUcsWUFBWSxDQUFDLGdCQUFiLENBQThCLFNBQVMsQ0FBQyxTQUFWLENBQW9CLENBQUMsQ0FBQyxDQUFGLEVBQUssQ0FBTCxDQUFwQixDQUE5QixDQUFIO1FBQ0UsZ0JBQUEsR0FBbUIsWUFBWSxDQUFDLFFBQWIsQ0FBc0IsU0FBdEIsRUFEckI7O01BR0EsSUFBRyxjQUFjLENBQUMsZ0JBQWYsQ0FBZ0MsU0FBUyxDQUFDLFNBQVYsQ0FBb0IsQ0FBQyxDQUFDLENBQUYsRUFBSyxDQUFMLENBQXBCLENBQWhDLENBQUg7UUFDRSxjQUFBLEdBQWlCLGNBQWMsQ0FBQyxRQUFmLENBQXdCLFNBQXhCLEVBRG5COztNQUdBLElBQUcsMEJBQUEsSUFBc0Isd0JBQXpCO1FBQ0UsV0FBQSxHQUFrQixJQUFBLEtBQUEsQ0FBTSxnQkFBTixFQUF3QixjQUF4QjtRQUNsQixLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQU0sQ0FBQyx5QkFBUixDQUFrQyxXQUFsQztlQUNSLHlCQUFBLENBQTBCLElBQUMsQ0FBQSxNQUEzQixFQUFtQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBYixFQUFrQixLQUFLLENBQUMsR0FBRyxDQUFDLEdBQTVCLENBQW5DLEVBSEY7O0lBaEJROzs7O0tBSk87O0VBeUJiOzs7Ozs7O0lBQ0osS0FBQyxDQUFBLE1BQUQsQ0FBQTs7OztLQURrQjs7RUFFZDs7Ozs7OztJQUNKLFNBQUMsQ0FBQSxNQUFELENBQUE7Ozs7S0FEc0I7QUFyeUJ4QiIsInNvdXJjZXNDb250ZW50IjpbIntSYW5nZSwgUG9pbnR9ID0gcmVxdWlyZSAnYXRvbSdcbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbiMgW1RPRE9dIE5lZWQgb3ZlcmhhdWxcbiMgIC0gWyBdIG11c3QgaGF2ZSBnZXRSYW5nZShzZWxlY3Rpb24pIC0+XG4jICAtIFsgXSBSZW1vdmUgc2VsZWN0VGV4dE9iamVjdD9cbiMgIC0gWyBdIE1ha2UgZXhwYW5kYWJsZSBieSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS51bmlvbihAZ2V0UmFuZ2Uoc2VsZWN0aW9uKSlcbiMgIC0gWyBdIENvdW50IHN1cHBvcnQocHJpb3JpdHkgbG93KT9cbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG5zd3JhcCA9IHJlcXVpcmUgJy4vc2VsZWN0aW9uLXdyYXBwZXInXG57XG4gIGdldExpbmVUZXh0VG9CdWZmZXJQb3NpdGlvblxuICBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvd1xuICBnZXRDb2RlRm9sZFJvd1Jhbmdlc0NvbnRhaW5lc0ZvclJvd1xuICBnZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlXG4gIGlzSW5jbHVkZUZ1bmN0aW9uU2NvcGVGb3JSb3dcbiAgZXhwYW5kUmFuZ2VUb1doaXRlU3BhY2VzXG4gIGdldFZpc2libGVCdWZmZXJSYW5nZVxuICB0cmFuc2xhdGVQb2ludEFuZENsaXBcbiAgZ2V0QnVmZmVyUm93c1xuICBnZXRWYWxpZFZpbUJ1ZmZlclJvd1xuICB0cmltUmFuZ2VcblxuICBzb3J0UmFuZ2VzXG4gIHBvaW50SXNBdEVuZE9mTGluZVxufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG57QnJhY2tldEZpbmRlciwgUXVvdGVGaW5kZXIsIFRhZ0ZpbmRlcn0gPSByZXF1aXJlICcuL3BhaXItZmluZGVyLmNvZmZlZSdcblxuY2xhc3MgVGV4dE9iamVjdCBleHRlbmRzIEJhc2VcbiAgQGV4dGVuZChmYWxzZSlcbiAgd2lzZTogbnVsbFxuICBzdXBwb3J0Q291bnQ6IGZhbHNlICMgRklYTUUgIzQ3MiwgIzY2XG5cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQGNvbnN0cnVjdG9yOjppbm5lciA9IEBnZXROYW1lKCkuc3RhcnRzV2l0aCgnSW5uZXInKVxuICAgIHN1cGVyXG4gICAgQGluaXRpYWxpemUoKVxuXG4gIGlzSW5uZXI6IC0+XG4gICAgQGlubmVyXG5cbiAgaXNBOiAtPlxuICAgIG5vdCBAaXNJbm5lcigpXG5cbiAgaXNTdXBvcnRDb3VudDogLT5cbiAgICBAc3VwcG9ydENvdW50XG5cbiAgZ2V0V2lzZTogLT5cbiAgICBpZiBAd2lzZT8gYW5kIEBnZXRPcGVyYXRvcigpLmlzT2NjdXJyZW5jZSgpXG4gICAgICAnY2hhcmFjdGVyd2lzZSdcbiAgICBlbHNlXG4gICAgICBAd2lzZVxuXG4gIGlzQ2hhcmFjdGVyd2lzZTogLT5cbiAgICBAZ2V0V2lzZSgpIGlzICdjaGFyYWN0ZXJ3aXNlJ1xuXG4gIGlzTGluZXdpc2U6IC0+XG4gICAgQGdldFdpc2UoKSBpcyAnbGluZXdpc2UnXG5cbiAgaXNCbG9ja3dpc2U6IC0+XG4gICAgQGdldFdpc2UoKSBpcyAnYmxvY2t3aXNlJ1xuXG4gIGdldE5vcm1hbGl6ZWRIZWFkQnVmZmVyUG9zaXRpb246IChzZWxlY3Rpb24pIC0+XG4gICAgaGVhZCA9IHNlbGVjdGlvbi5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKVxuICAgIGlmIEBpc01vZGUoJ3Zpc3VhbCcpIGFuZCBub3Qgc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuICAgICAgaGVhZCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcChAZWRpdG9yLCBoZWFkLCAnYmFja3dhcmQnKVxuICAgIGhlYWRcblxuICBnZXROb3JtYWxpemVkSGVhZFNjcmVlblBvc2l0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIGJ1ZmZlclBvc2l0aW9uID0gQGdldE5vcm1hbGl6ZWRIZWFkQnVmZmVyUG9zaXRpb24oc2VsZWN0aW9uKVxuICAgIEBlZGl0b3Iuc2NyZWVuUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbihidWZmZXJQb3NpdGlvbilcblxuICBuZWVkVG9LZWVwQ29sdW1uOiAtPlxuICAgIEB3aXNlIGlzICdsaW5ld2lzZScgYW5kXG4gICAgICBzZXR0aW5ncy5nZXQoJ2tlZXBDb2x1bW5PblNlbGVjdFRleHRPYmplY3QnKSBhbmRcbiAgICAgIEBnZXRPcGVyYXRvcigpLmluc3RhbmNlb2YoJ1NlbGVjdCcpXG5cbiAgZXhlY3V0ZTogLT5cbiAgICAjIFdoZW5uZXZlciBUZXh0T2JqZWN0IGlzIGV4ZWN1dGVkLCBpdCBoYXMgQG9wZXJhdG9yXG4gICAgIyBDYWxsZWQgZnJvbSBPcGVyYXRvcjo6c2VsZWN0VGFyZ2V0KClcbiAgICAjICAtIGB2IGkgcGAsIGlzIGBTZWxlY3RgIG9wZXJhdG9yIHdpdGggQHRhcmdldCA9IGBJbm5lclBhcmFncmFwaGAuXG4gICAgIyAgLSBgZCBpIHBgLCBpcyBgRGVsZXRlYCBvcGVyYXRvciB3aXRoIEB0YXJnZXQgPSBgSW5uZXJQYXJhZ3JhcGhgLlxuICAgIGlmIEBoYXNPcGVyYXRvcigpXG4gICAgICBAc2VsZWN0KClcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2luIFRleHRPYmplY3Q6IE11c3Qgbm90IGhhcHBlbicpXG5cbiAgc2VsZWN0OiAtPlxuICAgIHNlbGVjdFJlc3VsdHMgPSBbXVxuICAgIEBjb3VudFRpbWVzIEBnZXRDb3VudCgpLCAoe3N0b3B9KSA9PlxuICAgICAgQHN0b3BTZWxlY3Rpb24gPSBzdG9wXG5cbiAgICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgc2VsZWN0UmVzdWx0cy5wdXNoKEBzZWxlY3RUZXh0T2JqZWN0KHNlbGVjdGlvbikpXG4gICAgICAgIHVubGVzcyBAaXNTdXBvcnRDb3VudCgpXG4gICAgICAgICAgQHN0b3BTZWxlY3Rpb24oKSAjIEZJWE1FOiBxdWljay1maXggZm9yICM1NjBcblxuXG4gICAgaWYgQG5lZWRUb0tlZXBDb2x1bW4oKVxuICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICBzd3JhcChzZWxlY3Rpb24pLmNsaXBQcm9wZXJ0aWVzVGlsbEVuZE9mTGluZSgpXG5cbiAgICBAZWRpdG9yLm1lcmdlSW50ZXJzZWN0aW5nU2VsZWN0aW9ucygpXG4gICAgaWYgQGlzTW9kZSgndmlzdWFsJykgYW5kIEB3aXNlIGlzICdjaGFyYWN0ZXJ3aXNlJ1xuICAgICAgc3dyYXAuc2F2ZVByb3BlcnRpZXMoQGVkaXRvcilcblxuICAgIGlmIHNlbGVjdFJlc3VsdHMuc29tZSgodmFsdWUpIC0+IHZhbHVlKVxuICAgICAgQHdpc2UgPz0gc3dyYXAuZGV0ZWN0VmlzdWFsTW9kZVN1Ym1vZGUoQGVkaXRvcilcbiAgICBlbHNlXG4gICAgICBAd2lzZSA9IG51bGxcblxuICBzZWxlY3RUZXh0T2JqZWN0OiAoc2VsZWN0aW9uKSAtPlxuICAgIGlmIHJhbmdlID0gQGdldFJhbmdlKHNlbGVjdGlvbilcbiAgICAgIG9sZFJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcblxuICAgICAgbmVlZFRvS2VlcENvbHVtbiA9IEBuZWVkVG9LZWVwQ29sdW1uKClcbiAgICAgIGlmIG5lZWRUb0tlZXBDb2x1bW4gYW5kIG5vdCBAaXNNb2RlKCd2aXN1YWwnLCAnbGluZXdpc2UnKVxuICAgICAgICBAdmltU3RhdGUubW9kZU1hbmFnZXIuYWN0aXZhdGUoJ3Zpc3VhbCcsICdsaW5ld2lzZScpXG5cbiAgICAgICMgUHJldmVudCBhdXRvc2Nyb2xsIHRvIGNsb3NpbmcgY2hhciBvbiBgY2hhbmdlLXN1cnJvdW5kLWFueS1wYWlyYC5cbiAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgIGF1dG9zY3JvbGw6IHNlbGVjdGlvbi5pc0xhc3RTZWxlY3Rpb24oKSBhbmQgbm90IEBnZXRPcGVyYXRvcigpLnN1cHBvcnRFYXJseVNlbGVjdFxuICAgICAgICBrZWVwR29hbENvbHVtbjogbmVlZFRvS2VlcENvbHVtblxuICAgICAgfVxuICAgICAgc3dyYXAoc2VsZWN0aW9uKS5zZXRCdWZmZXJSYW5nZVNhZmVseShyYW5nZSwgb3B0aW9ucylcblxuICAgICAgbmV3UmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgaWYgbmV3UmFuZ2UuaXNFcXVhbChvbGRSYW5nZSlcbiAgICAgICAgQHN0b3BTZWxlY3Rpb24oKSAjIEZJWE1FOiBxdWljay1maXggZm9yICM1NjBcblxuICAgICAgdHJ1ZVxuICAgIGVsc2VcbiAgICAgIEBzdG9wU2VsZWN0aW9uKCkgIyBGSVhNRTogcXVpY2stZml4IGZvciAjNTYwXG4gICAgICBmYWxzZVxuXG4gIGdldFJhbmdlOiAtPlxuICAgICMgSSB3YW50IHRvXG4gICAgIyB0aHJvdyBuZXcgRXJyb3IoJ3RleHQtb2JqZWN0IG11c3QgcmVzcG9uZCB0byByYW5nZSBieSBnZXRSYW5nZSgpIScpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgV29yZCBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZChmYWxzZSlcblxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICBwb2ludCA9IEBnZXROb3JtYWxpemVkSGVhZEJ1ZmZlclBvc2l0aW9uKHNlbGVjdGlvbilcbiAgICB7cmFuZ2V9ID0gQGdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uKHBvaW50LCB7QHdvcmRSZWdleH0pXG4gICAgaWYgQGlzQSgpXG4gICAgICBleHBhbmRSYW5nZVRvV2hpdGVTcGFjZXMoQGVkaXRvciwgcmFuZ2UpXG4gICAgZWxzZVxuICAgICAgcmFuZ2VcblxuY2xhc3MgQVdvcmQgZXh0ZW5kcyBXb3JkXG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJXb3JkIGV4dGVuZHMgV29yZFxuICBAZXh0ZW5kKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBXaG9sZVdvcmQgZXh0ZW5kcyBXb3JkXG4gIEBleHRlbmQoZmFsc2UpXG4gIHdvcmRSZWdleDogL1xcUysvXG5cbmNsYXNzIEFXaG9sZVdvcmQgZXh0ZW5kcyBXaG9sZVdvcmRcbiAgQGV4dGVuZCgpXG5jbGFzcyBJbm5lcldob2xlV29yZCBleHRlbmRzIFdob2xlV29yZFxuICBAZXh0ZW5kKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEp1c3QgaW5jbHVkZSBfLCAtXG5jbGFzcyBTbWFydFdvcmQgZXh0ZW5kcyBXb3JkXG4gIEBleHRlbmQoZmFsc2UpXG4gIHdvcmRSZWdleDogL1tcXHctXSsvXG5cbmNsYXNzIEFTbWFydFdvcmQgZXh0ZW5kcyBTbWFydFdvcmRcbiAgQGRlc2NyaXB0aW9uOiBcIkEgd29yZCB0aGF0IGNvbnNpc3RzIG9mIGFscGhhbnVtZXJpYyBjaGFycyhgL1tBLVphLXowLTlfXS9gKSBhbmQgaHlwaGVuIGAtYFwiXG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJTbWFydFdvcmQgZXh0ZW5kcyBTbWFydFdvcmRcbiAgQGRlc2NyaXB0aW9uOiBcIkN1cnJlbnRseSBObyBkaWZmIGZyb20gYGEtc21hcnQtd29yZGBcIlxuICBAZXh0ZW5kKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEp1c3QgaW5jbHVkZSBfLCAtXG5jbGFzcyBTdWJ3b3JkIGV4dGVuZHMgV29yZFxuICBAZXh0ZW5kKGZhbHNlKVxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICBAd29yZFJlZ2V4ID0gc2VsZWN0aW9uLmN1cnNvci5zdWJ3b3JkUmVnRXhwKClcbiAgICBzdXBlclxuXG5jbGFzcyBBU3Vid29yZCBleHRlbmRzIFN1YndvcmRcbiAgQGV4dGVuZCgpXG5jbGFzcyBJbm5lclN1YndvcmQgZXh0ZW5kcyBTdWJ3b3JkXG4gIEBleHRlbmQoKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFBhaXIgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG4gIGFsbG93TmV4dExpbmU6IG51bGxcbiAgYWRqdXN0SW5uZXJSYW5nZTogdHJ1ZVxuICBwYWlyOiBudWxsXG4gIHdpc2U6ICdjaGFyYWN0ZXJ3aXNlJ1xuICBzdXBwb3J0Q291bnQ6IHRydWVcblxuICBpc0FsbG93TmV4dExpbmU6IC0+XG4gICAgQGFsbG93TmV4dExpbmUgPyAoQHBhaXI/IGFuZCBAcGFpclswXSBpc250IEBwYWlyWzFdKVxuXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgICMgYXV0by1zZXQgcHJvcGVydHkgZnJvbSBjbGFzcyBuYW1lLlxuICAgIEBhbGxvd0ZvcndhcmRpbmcgPz0gQGdldE5hbWUoKS5lbmRzV2l0aCgnQWxsb3dGb3J3YXJkaW5nJylcbiAgICBzdXBlclxuXG4gIGFkanVzdFJhbmdlOiAoe3N0YXJ0LCBlbmR9KSAtPlxuICAgICMgRGlydHkgd29yayB0byBmZWVsIG5hdHVyYWwgZm9yIGh1bWFuLCB0byBiZWhhdmUgY29tcGF0aWJsZSB3aXRoIHB1cmUgVmltLlxuICAgICMgV2hlcmUgdGhpcyBhZGp1c3RtZW50IGFwcGVhciBpcyBpbiBmb2xsb3dpbmcgc2l0dWF0aW9uLlxuICAgICMgb3AtMTogYGNpe2AgcmVwbGFjZSBvbmx5IDJuZCBsaW5lXG4gICAgIyBvcC0yOiBgZGl7YCBkZWxldGUgb25seSAybmQgbGluZS5cbiAgICAjIHRleHQ6XG4gICAgIyAge1xuICAgICMgICAgYWFhXG4gICAgIyAgfVxuICAgIGlmIHBvaW50SXNBdEVuZE9mTGluZShAZWRpdG9yLCBzdGFydClcbiAgICAgIHN0YXJ0ID0gc3RhcnQudHJhdmVyc2UoWzEsIDBdKVxuXG4gICAgaWYgZ2V0TGluZVRleHRUb0J1ZmZlclBvc2l0aW9uKEBlZGl0b3IsIGVuZCkubWF0Y2goL15cXHMqJC8pXG4gICAgICBpZiBAaXNNb2RlKCd2aXN1YWwnKVxuICAgICAgICAjIFRoaXMgaXMgc2xpZ2h0bHkgaW5uY29uc2lzdGVudCB3aXRoIHJlZ3VsYXIgVmltXG4gICAgICAgICMgLSByZWd1bGFyIFZpbTogc2VsZWN0IG5ldyBsaW5lIGFmdGVyIEVPTFxuICAgICAgICAjIC0gdmltLW1vZGUtcGx1czogc2VsZWN0IHRvIEVPTChiZWZvcmUgbmV3IGxpbmUpXG4gICAgICAgICMgVGhpcyBpcyBpbnRlbnRpb25hbCBzaW5jZSB0byBtYWtlIHN1Ym1vZGUgYGNoYXJhY3Rlcndpc2VgIHdoZW4gYXV0by1kZXRlY3Qgc3VibW9kZVxuICAgICAgICAjIGlubmVyRW5kID0gbmV3IFBvaW50KGlubmVyRW5kLnJvdyAtIDEsIEluZmluaXR5KVxuICAgICAgICBlbmQgPSBuZXcgUG9pbnQoZW5kLnJvdyAtIDEsIEluZmluaXR5KVxuICAgICAgZWxzZVxuICAgICAgICBlbmQgPSBuZXcgUG9pbnQoZW5kLnJvdywgMClcblxuICAgIG5ldyBSYW5nZShzdGFydCwgZW5kKVxuXG4gIGdldEZpbmRlcjogLT5cbiAgICBvcHRpb25zID0ge2FsbG93TmV4dExpbmU6IEBpc0FsbG93TmV4dExpbmUoKSwgQGFsbG93Rm9yd2FyZGluZywgQHBhaXJ9XG4gICAgaWYgQHBhaXJbMF0gaXMgQHBhaXJbMV1cbiAgICAgIG5ldyBRdW90ZUZpbmRlcihAZWRpdG9yLCBvcHRpb25zKVxuICAgIGVsc2VcbiAgICAgIG5ldyBCcmFja2V0RmluZGVyKEBlZGl0b3IsIG9wdGlvbnMpXG5cbiAgZ2V0UGFpckluZm86IChmcm9tKSAtPlxuICAgIHBhaXJJbmZvID0gQGdldEZpbmRlcigpLmZpbmQoZnJvbSlcbiAgICB1bmxlc3MgcGFpckluZm8/XG4gICAgICByZXR1cm4gbnVsbFxuICAgIHBhaXJJbmZvLmlubmVyUmFuZ2UgPSBAYWRqdXN0UmFuZ2UocGFpckluZm8uaW5uZXJSYW5nZSkgaWYgQGFkanVzdElubmVyUmFuZ2VcbiAgICBwYWlySW5mby50YXJnZXRSYW5nZSA9IGlmIEBpc0lubmVyKCkgdGhlbiBwYWlySW5mby5pbm5lclJhbmdlIGVsc2UgcGFpckluZm8uYVJhbmdlXG4gICAgcGFpckluZm9cblxuICBnZXRQb2ludFRvU2VhcmNoRnJvbTogKHNlbGVjdGlvbiwgc2VhcmNoRnJvbSkgLT5cbiAgICBzd2l0Y2ggc2VhcmNoRnJvbVxuICAgICAgd2hlbiAnaGVhZCcgdGhlbiBAZ2V0Tm9ybWFsaXplZEhlYWRCdWZmZXJQb3NpdGlvbihzZWxlY3Rpb24pXG4gICAgICB3aGVuICdzdGFydCcgdGhlbiBzd3JhcChzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdzdGFydCcpXG5cbiAgIyBBbGxvdyBvdmVycmlkZSBAYWxsb3dGb3J3YXJkaW5nIGJ5IDJuZCBhcmd1bWVudC5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24sIG9wdGlvbnM9e30pIC0+XG4gICAge2FsbG93Rm9yd2FyZGluZywgc2VhcmNoRnJvbX0gPSBvcHRpb25zXG4gICAgc2VhcmNoRnJvbSA/PSAnaGVhZCdcbiAgICBAYWxsb3dGb3J3YXJkaW5nID0gYWxsb3dGb3J3YXJkaW5nIGlmIGFsbG93Rm9yd2FyZGluZz9cbiAgICBvcmlnaW5hbFJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICBwYWlySW5mbyA9IEBnZXRQYWlySW5mbyhAZ2V0UG9pbnRUb1NlYXJjaEZyb20oc2VsZWN0aW9uLCBzZWFyY2hGcm9tKSlcbiAgICAjIFdoZW4gcmFuZ2Ugd2FzIHNhbWUsIHRyeSB0byBleHBhbmQgcmFuZ2VcbiAgICBpZiBwYWlySW5mbz8udGFyZ2V0UmFuZ2UuaXNFcXVhbChvcmlnaW5hbFJhbmdlKVxuICAgICAgcGFpckluZm8gPSBAZ2V0UGFpckluZm8ocGFpckluZm8uYVJhbmdlLmVuZClcbiAgICBwYWlySW5mbz8udGFyZ2V0UmFuZ2VcblxuIyBVc2VkIGJ5IERlbGV0ZVN1cnJvdW5kXG5jbGFzcyBBUGFpciBleHRlbmRzIFBhaXJcbiAgQGV4dGVuZChmYWxzZSlcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBBbnlQYWlyIGV4dGVuZHMgUGFpclxuICBAZXh0ZW5kKGZhbHNlKVxuICBhbGxvd0ZvcndhcmRpbmc6IGZhbHNlXG4gIG1lbWJlcjogW1xuICAgICdEb3VibGVRdW90ZScsICdTaW5nbGVRdW90ZScsICdCYWNrVGljaycsXG4gICAgJ0N1cmx5QnJhY2tldCcsICdBbmdsZUJyYWNrZXQnLCAnU3F1YXJlQnJhY2tldCcsICdQYXJlbnRoZXNpcydcbiAgXVxuXG4gIGdldFJhbmdlQnk6IChrbGFzcywgc2VsZWN0aW9uKSAtPlxuICAgIEBuZXcoa2xhc3MpLmdldFJhbmdlKHNlbGVjdGlvbiwge0BhbGxvd0ZvcndhcmRpbmcsIEBzZWFyY2hGcm9tfSlcblxuICBnZXRSYW5nZXM6IChzZWxlY3Rpb24pIC0+XG4gICAgcHJlZml4ID0gaWYgQGlzSW5uZXIoKSB0aGVuICdJbm5lcicgZWxzZSAnQSdcbiAgICByYW5nZXMgPSBbXVxuICAgIGZvciBrbGFzcyBpbiBAbWVtYmVyIHdoZW4gcmFuZ2UgPSBAZ2V0UmFuZ2VCeShwcmVmaXggKyBrbGFzcywgc2VsZWN0aW9uKVxuICAgICAgcmFuZ2VzLnB1c2gocmFuZ2UpXG4gICAgcmFuZ2VzXG5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgcmFuZ2VzID0gQGdldFJhbmdlcyhzZWxlY3Rpb24pXG4gICAgXy5sYXN0KHNvcnRSYW5nZXMocmFuZ2VzKSkgaWYgcmFuZ2VzLmxlbmd0aFxuXG5jbGFzcyBBQW55UGFpciBleHRlbmRzIEFueVBhaXJcbiAgQGV4dGVuZCgpXG5jbGFzcyBJbm5lckFueVBhaXIgZXh0ZW5kcyBBbnlQYWlyXG4gIEBleHRlbmQoKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIEFueVBhaXJBbGxvd0ZvcndhcmRpbmcgZXh0ZW5kcyBBbnlQYWlyXG4gIEBleHRlbmQoZmFsc2UpXG4gIEBkZXNjcmlwdGlvbjogXCJSYW5nZSBzdXJyb3VuZGVkIGJ5IGF1dG8tZGV0ZWN0ZWQgcGFpcmVkIGNoYXJzIGZyb20gZW5jbG9zZWQgYW5kIGZvcndhcmRpbmcgYXJlYVwiXG4gIGFsbG93Rm9yd2FyZGluZzogdHJ1ZVxuICBzZWFyY2hGcm9tOiAnc3RhcnQnXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIHJhbmdlcyA9IEBnZXRSYW5nZXMoc2VsZWN0aW9uKVxuICAgIGZyb20gPSBzZWxlY3Rpb24uY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgICBbZm9yd2FyZGluZ1JhbmdlcywgZW5jbG9zaW5nUmFuZ2VzXSA9IF8ucGFydGl0aW9uIHJhbmdlcywgKHJhbmdlKSAtPlxuICAgICAgcmFuZ2Uuc3RhcnQuaXNHcmVhdGVyVGhhbk9yRXF1YWwoZnJvbSlcbiAgICBlbmNsb3NpbmdSYW5nZSA9IF8ubGFzdChzb3J0UmFuZ2VzKGVuY2xvc2luZ1JhbmdlcykpXG4gICAgZm9yd2FyZGluZ1JhbmdlcyA9IHNvcnRSYW5nZXMoZm9yd2FyZGluZ1JhbmdlcylcblxuICAgICMgV2hlbiBlbmNsb3NpbmdSYW5nZSBpcyBleGlzdHMsXG4gICAgIyBXZSBkb24ndCBnbyBhY3Jvc3MgZW5jbG9zaW5nUmFuZ2UuZW5kLlxuICAgICMgU28gY2hvb3NlIGZyb20gcmFuZ2VzIGNvbnRhaW5lZCBpbiBlbmNsb3NpbmdSYW5nZS5cbiAgICBpZiBlbmNsb3NpbmdSYW5nZVxuICAgICAgZm9yd2FyZGluZ1JhbmdlcyA9IGZvcndhcmRpbmdSYW5nZXMuZmlsdGVyIChyYW5nZSkgLT5cbiAgICAgICAgZW5jbG9zaW5nUmFuZ2UuY29udGFpbnNSYW5nZShyYW5nZSlcblxuICAgIGZvcndhcmRpbmdSYW5nZXNbMF0gb3IgZW5jbG9zaW5nUmFuZ2VcblxuY2xhc3MgQUFueVBhaXJBbGxvd0ZvcndhcmRpbmcgZXh0ZW5kcyBBbnlQYWlyQWxsb3dGb3J3YXJkaW5nXG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJBbnlQYWlyQWxsb3dGb3J3YXJkaW5nIGV4dGVuZHMgQW55UGFpckFsbG93Rm9yd2FyZGluZ1xuICBAZXh0ZW5kKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBBbnlRdW90ZSBleHRlbmRzIEFueVBhaXJcbiAgQGV4dGVuZChmYWxzZSlcbiAgYWxsb3dGb3J3YXJkaW5nOiB0cnVlXG4gIG1lbWJlcjogWydEb3VibGVRdW90ZScsICdTaW5nbGVRdW90ZScsICdCYWNrVGljayddXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIHJhbmdlcyA9IEBnZXRSYW5nZXMoc2VsZWN0aW9uKVxuICAgICMgUGljayByYW5nZSB3aGljaCBlbmQuY29sdW0gaXMgbGVmdG1vc3QobWVhbiwgY2xvc2VkIGZpcnN0KVxuICAgIF8uZmlyc3QoXy5zb3J0QnkocmFuZ2VzLCAocikgLT4gci5lbmQuY29sdW1uKSkgaWYgcmFuZ2VzLmxlbmd0aFxuXG5jbGFzcyBBQW55UXVvdGUgZXh0ZW5kcyBBbnlRdW90ZVxuICBAZXh0ZW5kKClcbmNsYXNzIElubmVyQW55UXVvdGUgZXh0ZW5kcyBBbnlRdW90ZVxuICBAZXh0ZW5kKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBRdW90ZSBleHRlbmRzIFBhaXJcbiAgQGV4dGVuZChmYWxzZSlcbiAgYWxsb3dGb3J3YXJkaW5nOiB0cnVlXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgRG91YmxlUXVvdGUgZXh0ZW5kcyBRdW90ZVxuICBAZXh0ZW5kKGZhbHNlKVxuICBwYWlyOiBbJ1wiJywgJ1wiJ11cblxuY2xhc3MgQURvdWJsZVF1b3RlIGV4dGVuZHMgRG91YmxlUXVvdGVcbiAgQGV4dGVuZCgpXG5jbGFzcyBJbm5lckRvdWJsZVF1b3RlIGV4dGVuZHMgRG91YmxlUXVvdGVcbiAgQGV4dGVuZCgpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgU2luZ2xlUXVvdGUgZXh0ZW5kcyBRdW90ZVxuICBAZXh0ZW5kKGZhbHNlKVxuICBwYWlyOiBbXCInXCIsIFwiJ1wiXVxuXG5jbGFzcyBBU2luZ2xlUXVvdGUgZXh0ZW5kcyBTaW5nbGVRdW90ZVxuICBAZXh0ZW5kKClcbmNsYXNzIElubmVyU2luZ2xlUXVvdGUgZXh0ZW5kcyBTaW5nbGVRdW90ZVxuICBAZXh0ZW5kKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBCYWNrVGljayBleHRlbmRzIFF1b3RlXG4gIEBleHRlbmQoZmFsc2UpXG4gIHBhaXI6IFsnYCcsICdgJ11cblxuY2xhc3MgQUJhY2tUaWNrIGV4dGVuZHMgQmFja1RpY2tcbiAgQGV4dGVuZCgpXG5jbGFzcyBJbm5lckJhY2tUaWNrIGV4dGVuZHMgQmFja1RpY2tcbiAgQGV4dGVuZCgpXG5cbiMgUGFpciBleHBhbmRzIG11bHRpLWxpbmVzXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIEN1cmx5QnJhY2tldCBleHRlbmRzIFBhaXJcbiAgQGV4dGVuZChmYWxzZSlcbiAgcGFpcjogWyd7JywgJ30nXVxuXG5jbGFzcyBBQ3VybHlCcmFja2V0IGV4dGVuZHMgQ3VybHlCcmFja2V0XG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJDdXJseUJyYWNrZXQgZXh0ZW5kcyBDdXJseUJyYWNrZXRcbiAgQGV4dGVuZCgpXG5jbGFzcyBBQ3VybHlCcmFja2V0QWxsb3dGb3J3YXJkaW5nIGV4dGVuZHMgQ3VybHlCcmFja2V0XG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJDdXJseUJyYWNrZXRBbGxvd0ZvcndhcmRpbmcgZXh0ZW5kcyBDdXJseUJyYWNrZXRcbiAgQGV4dGVuZCgpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgU3F1YXJlQnJhY2tldCBleHRlbmRzIFBhaXJcbiAgQGV4dGVuZChmYWxzZSlcbiAgcGFpcjogWydbJywgJ10nXVxuXG5jbGFzcyBBU3F1YXJlQnJhY2tldCBleHRlbmRzIFNxdWFyZUJyYWNrZXRcbiAgQGV4dGVuZCgpXG5jbGFzcyBJbm5lclNxdWFyZUJyYWNrZXQgZXh0ZW5kcyBTcXVhcmVCcmFja2V0XG4gIEBleHRlbmQoKVxuY2xhc3MgQVNxdWFyZUJyYWNrZXRBbGxvd0ZvcndhcmRpbmcgZXh0ZW5kcyBTcXVhcmVCcmFja2V0XG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJTcXVhcmVCcmFja2V0QWxsb3dGb3J3YXJkaW5nIGV4dGVuZHMgU3F1YXJlQnJhY2tldFxuICBAZXh0ZW5kKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBQYXJlbnRoZXNpcyBleHRlbmRzIFBhaXJcbiAgQGV4dGVuZChmYWxzZSlcbiAgcGFpcjogWycoJywgJyknXVxuXG5jbGFzcyBBUGFyZW50aGVzaXMgZXh0ZW5kcyBQYXJlbnRoZXNpc1xuICBAZXh0ZW5kKClcbmNsYXNzIElubmVyUGFyZW50aGVzaXMgZXh0ZW5kcyBQYXJlbnRoZXNpc1xuICBAZXh0ZW5kKClcbmNsYXNzIEFQYXJlbnRoZXNpc0FsbG93Rm9yd2FyZGluZyBleHRlbmRzIFBhcmVudGhlc2lzXG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJQYXJlbnRoZXNpc0FsbG93Rm9yd2FyZGluZyBleHRlbmRzIFBhcmVudGhlc2lzXG4gIEBleHRlbmQoKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIEFuZ2xlQnJhY2tldCBleHRlbmRzIFBhaXJcbiAgQGV4dGVuZChmYWxzZSlcbiAgcGFpcjogWyc8JywgJz4nXVxuXG5jbGFzcyBBQW5nbGVCcmFja2V0IGV4dGVuZHMgQW5nbGVCcmFja2V0XG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJBbmdsZUJyYWNrZXQgZXh0ZW5kcyBBbmdsZUJyYWNrZXRcbiAgQGV4dGVuZCgpXG5jbGFzcyBBQW5nbGVCcmFja2V0QWxsb3dGb3J3YXJkaW5nIGV4dGVuZHMgQW5nbGVCcmFja2V0XG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJBbmdsZUJyYWNrZXRBbGxvd0ZvcndhcmRpbmcgZXh0ZW5kcyBBbmdsZUJyYWNrZXRcbiAgQGV4dGVuZCgpXG5cbiMgVGFnXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFRhZyBleHRlbmRzIFBhaXJcbiAgQGV4dGVuZChmYWxzZSlcbiAgYWxsb3dOZXh0TGluZTogdHJ1ZVxuICBhbGxvd0ZvcndhcmRpbmc6IHRydWVcbiAgYWRqdXN0SW5uZXJSYW5nZTogZmFsc2VcblxuICBnZXRUYWdTdGFydFBvaW50OiAoZnJvbSkgLT5cbiAgICB0YWdSYW5nZSA9IG51bGxcbiAgICBwYXR0ZXJuID0gVGFnRmluZGVyOjpwYXR0ZXJuXG4gICAgQHNjYW5Gb3J3YXJkIHBhdHRlcm4sIHtmcm9tOiBbZnJvbS5yb3csIDBdfSwgKHtyYW5nZSwgc3RvcH0pIC0+XG4gICAgICBpZiByYW5nZS5jb250YWluc1BvaW50KGZyb20sIHRydWUpXG4gICAgICAgIHRhZ1JhbmdlID0gcmFuZ2VcbiAgICAgICAgc3RvcCgpXG4gICAgdGFnUmFuZ2U/LnN0YXJ0XG5cbiAgZ2V0RmluZGVyOiAtPlxuICAgIG5ldyBUYWdGaW5kZXIoQGVkaXRvciwge2FsbG93TmV4dExpbmU6IEBpc0FsbG93TmV4dExpbmUoKSwgQGFsbG93Rm9yd2FyZGluZ30pXG5cbiAgZ2V0UGFpckluZm86IChmcm9tKSAtPlxuICAgIHN1cGVyKEBnZXRUYWdTdGFydFBvaW50KGZyb20pID8gZnJvbSlcblxuY2xhc3MgQVRhZyBleHRlbmRzIFRhZ1xuICBAZXh0ZW5kKClcbmNsYXNzIElubmVyVGFnIGV4dGVuZHMgVGFnXG4gIEBleHRlbmQoKVxuXG4jIFBhcmFncmFwaFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIFBhcmFncmFwaCBpcyBkZWZpbmVkIGFzIGNvbnNlY3V0aXZlIChub24tKWJsYW5rLWxpbmUuXG5jbGFzcyBQYXJhZ3JhcGggZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgc3VwcG9ydENvdW50OiB0cnVlXG5cbiAgZmluZFJvdzogKGZyb21Sb3csIGRpcmVjdGlvbiwgZm4pIC0+XG4gICAgZm4ucmVzZXQ/KClcbiAgICBmb3VuZFJvdyA9IGZyb21Sb3dcbiAgICBmb3Igcm93IGluIGdldEJ1ZmZlclJvd3MoQGVkaXRvciwge3N0YXJ0Um93OiBmcm9tUm93LCBkaXJlY3Rpb259KVxuICAgICAgYnJlYWsgdW5sZXNzIGZuKHJvdywgZGlyZWN0aW9uKVxuICAgICAgZm91bmRSb3cgPSByb3dcblxuICAgIGZvdW5kUm93XG5cbiAgZmluZFJvd1JhbmdlQnk6IChmcm9tUm93LCBmbikgLT5cbiAgICBzdGFydFJvdyA9IEBmaW5kUm93KGZyb21Sb3csICdwcmV2aW91cycsIGZuKVxuICAgIGVuZFJvdyA9IEBmaW5kUm93KGZyb21Sb3csICduZXh0JywgZm4pXG4gICAgW3N0YXJ0Um93LCBlbmRSb3ddXG5cbiAgZ2V0UHJlZGljdEZ1bmN0aW9uOiAoZnJvbVJvdywgc2VsZWN0aW9uKSAtPlxuICAgIGZyb21Sb3dSZXN1bHQgPSBAZWRpdG9yLmlzQnVmZmVyUm93QmxhbmsoZnJvbVJvdylcblxuICAgIGlmIEBpc0lubmVyKClcbiAgICAgIHByZWRpY3QgPSAocm93LCBkaXJlY3Rpb24pID0+XG4gICAgICAgIEBlZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpIGlzIGZyb21Sb3dSZXN1bHRcbiAgICBlbHNlXG4gICAgICBpZiBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpXG4gICAgICAgIGRpcmVjdGlvblRvRXh0ZW5kID0gJ3ByZXZpb3VzJ1xuICAgICAgZWxzZVxuICAgICAgICBkaXJlY3Rpb25Ub0V4dGVuZCA9ICduZXh0J1xuXG4gICAgICBmbGlwID0gZmFsc2VcbiAgICAgIHByZWRpY3QgPSAocm93LCBkaXJlY3Rpb24pID0+XG4gICAgICAgIHJlc3VsdCA9IEBlZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpIGlzIGZyb21Sb3dSZXN1bHRcbiAgICAgICAgaWYgZmxpcFxuICAgICAgICAgIG5vdCByZXN1bHRcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGlmIChub3QgcmVzdWx0KSBhbmQgKGRpcmVjdGlvbiBpcyBkaXJlY3Rpb25Ub0V4dGVuZClcbiAgICAgICAgICAgIGZsaXAgPSB0cnVlXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgIHJlc3VsdFxuXG4gICAgICBwcmVkaWN0LnJlc2V0ID0gLT5cbiAgICAgICAgZmxpcCA9IGZhbHNlXG4gICAgcHJlZGljdFxuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIG9yaWdpbmFsUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgIGZyb21Sb3cgPSBAZ2V0Tm9ybWFsaXplZEhlYWRCdWZmZXJQb3NpdGlvbihzZWxlY3Rpb24pLnJvd1xuXG4gICAgaWYgQGlzTW9kZSgndmlzdWFsJywgJ2xpbmV3aXNlJylcbiAgICAgIGlmIHNlbGVjdGlvbi5pc1JldmVyc2VkKClcbiAgICAgICAgZnJvbVJvdy0tXG4gICAgICBlbHNlXG4gICAgICAgIGZyb21Sb3crK1xuICAgICAgZnJvbVJvdyA9IGdldFZhbGlkVmltQnVmZmVyUm93KEBlZGl0b3IsIGZyb21Sb3cpXG5cbiAgICByb3dSYW5nZSA9IEBmaW5kUm93UmFuZ2VCeShmcm9tUm93LCBAZ2V0UHJlZGljdEZ1bmN0aW9uKGZyb21Sb3csIHNlbGVjdGlvbikpXG4gICAgc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkudW5pb24oZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShAZWRpdG9yLCByb3dSYW5nZSkpXG5cbmNsYXNzIEFQYXJhZ3JhcGggZXh0ZW5kcyBQYXJhZ3JhcGhcbiAgQGV4dGVuZCgpXG5jbGFzcyBJbm5lclBhcmFncmFwaCBleHRlbmRzIFBhcmFncmFwaFxuICBAZXh0ZW5kKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBJbmRlbnRhdGlvbiBleHRlbmRzIFBhcmFncmFwaFxuICBAZXh0ZW5kKGZhbHNlKVxuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIGZyb21Sb3cgPSBAZ2V0Tm9ybWFsaXplZEhlYWRCdWZmZXJQb3NpdGlvbihzZWxlY3Rpb24pLnJvd1xuXG4gICAgYmFzZUluZGVudExldmVsID0gZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3coQGVkaXRvciwgZnJvbVJvdylcbiAgICBwcmVkaWN0ID0gKHJvdykgPT5cbiAgICAgIGlmIEBlZGl0b3IuaXNCdWZmZXJSb3dCbGFuayhyb3cpXG4gICAgICAgIEBpc0EoKVxuICAgICAgZWxzZVxuICAgICAgICBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdyhAZWRpdG9yLCByb3cpID49IGJhc2VJbmRlbnRMZXZlbFxuXG4gICAgcm93UmFuZ2UgPSBAZmluZFJvd1JhbmdlQnkoZnJvbVJvdywgcHJlZGljdClcbiAgICBnZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKEBlZGl0b3IsIHJvd1JhbmdlKVxuXG5jbGFzcyBBSW5kZW50YXRpb24gZXh0ZW5kcyBJbmRlbnRhdGlvblxuICBAZXh0ZW5kKClcbmNsYXNzIElubmVySW5kZW50YXRpb24gZXh0ZW5kcyBJbmRlbnRhdGlvblxuICBAZXh0ZW5kKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBDb21tZW50IGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuICB3aXNlOiAnbGluZXdpc2UnXG5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgcm93ID0gc3dyYXAoc2VsZWN0aW9uKS5nZXRTdGFydFJvdygpXG4gICAgcm93UmFuZ2UgPSBAZWRpdG9yLmxhbmd1YWdlTW9kZS5yb3dSYW5nZUZvckNvbW1lbnRBdEJ1ZmZlclJvdyhyb3cpXG4gICAgcm93UmFuZ2UgPz0gW3Jvdywgcm93XSBpZiBAZWRpdG9yLmlzQnVmZmVyUm93Q29tbWVudGVkKHJvdylcbiAgICBpZiByb3dSYW5nZVxuICAgICAgZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShzZWxlY3Rpb24uZWRpdG9yLCByb3dSYW5nZSlcblxuY2xhc3MgQUNvbW1lbnQgZXh0ZW5kcyBDb21tZW50XG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJDb21tZW50IGV4dGVuZHMgQ29tbWVudFxuICBAZXh0ZW5kKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBGb2xkIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuICB3aXNlOiAnbGluZXdpc2UnXG5cbiAgYWRqdXN0Um93UmFuZ2U6IChyb3dSYW5nZSkgLT5cbiAgICByZXR1cm4gcm93UmFuZ2UgdW5sZXNzIEBpc0lubmVyKClcblxuICAgIFtzdGFydFJvdywgZW5kUm93XSA9IHJvd1JhbmdlXG4gICAgc3RhcnRSb3dJbmRlbnRMZXZlbCA9IGdldEluZGVudExldmVsRm9yQnVmZmVyUm93KEBlZGl0b3IsIHN0YXJ0Um93KVxuICAgIGVuZFJvd0luZGVudExldmVsID0gZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3coQGVkaXRvciwgZW5kUm93KVxuICAgIGVuZFJvdyAtPSAxIGlmIChzdGFydFJvd0luZGVudExldmVsIGlzIGVuZFJvd0luZGVudExldmVsKVxuICAgIHN0YXJ0Um93ICs9IDFcbiAgICBbc3RhcnRSb3csIGVuZFJvd11cblxuICBnZXRGb2xkUm93UmFuZ2VzQ29udGFpbnNGb3JSb3c6IChyb3cpIC0+XG4gICAgZ2V0Q29kZUZvbGRSb3dSYW5nZXNDb250YWluZXNGb3JSb3coQGVkaXRvciwgcm93LCBpbmNsdWRlU3RhcnRSb3c6IHRydWUpLnJldmVyc2UoKVxuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIHJvd1JhbmdlcyA9IEBnZXRGb2xkUm93UmFuZ2VzQ29udGFpbnNGb3JSb3coc3dyYXAoc2VsZWN0aW9uKS5nZXRTdGFydFJvdygpKVxuICAgIHJldHVybiB1bmxlc3Mgcm93UmFuZ2VzLmxlbmd0aFxuXG4gICAgcmFuZ2UgPSBnZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKEBlZGl0b3IsIEBhZGp1c3RSb3dSYW5nZShyb3dSYW5nZXMuc2hpZnQoKSkpXG4gICAgaWYgcm93UmFuZ2VzLmxlbmd0aCBhbmQgcmFuZ2UuaXNFcXVhbChzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKSlcbiAgICAgIHJhbmdlID0gZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShAZWRpdG9yLCBAYWRqdXN0Um93UmFuZ2Uocm93UmFuZ2VzLnNoaWZ0KCkpKVxuICAgIHJhbmdlXG5cbmNsYXNzIEFGb2xkIGV4dGVuZHMgRm9sZFxuICBAZXh0ZW5kKClcbmNsYXNzIElubmVyRm9sZCBleHRlbmRzIEZvbGRcbiAgQGV4dGVuZCgpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBOT1RFOiBGdW5jdGlvbiByYW5nZSBkZXRlcm1pbmF0aW9uIGlzIGRlcGVuZGluZyBvbiBmb2xkLlxuY2xhc3MgRnVuY3Rpb24gZXh0ZW5kcyBGb2xkXG4gIEBleHRlbmQoZmFsc2UpXG5cbiAgIyBTb21lIGxhbmd1YWdlIGRvbid0IGluY2x1ZGUgY2xvc2luZyBgfWAgaW50byBmb2xkLlxuICBzY29wZU5hbWVzT21pdHRpbmdFbmRSb3c6IFsnc291cmNlLmdvJywgJ3NvdXJjZS5lbGl4aXInXVxuXG4gIGdldEZvbGRSb3dSYW5nZXNDb250YWluc0ZvclJvdzogKHJvdykgLT5cbiAgICByb3dSYW5nZXMgPSBnZXRDb2RlRm9sZFJvd1Jhbmdlc0NvbnRhaW5lc0ZvclJvdyhAZWRpdG9yLCByb3cpPy5yZXZlcnNlKClcbiAgICByb3dSYW5nZXM/LmZpbHRlciAocm93UmFuZ2UpID0+XG4gICAgICBpc0luY2x1ZGVGdW5jdGlvblNjb3BlRm9yUm93KEBlZGl0b3IsIHJvd1JhbmdlWzBdKVxuXG4gIGFkanVzdFJvd1JhbmdlOiAocm93UmFuZ2UpIC0+XG4gICAgW3N0YXJ0Um93LCBlbmRSb3ddID0gc3VwZXJcbiAgICBpZiBAaXNBKCkgYW5kIEBlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSBpbiBAc2NvcGVOYW1lc09taXR0aW5nRW5kUm93XG4gICAgICBlbmRSb3cgKz0gMVxuICAgIFtzdGFydFJvdywgZW5kUm93XVxuXG5jbGFzcyBBRnVuY3Rpb24gZXh0ZW5kcyBGdW5jdGlvblxuICBAZXh0ZW5kKClcbmNsYXNzIElubmVyRnVuY3Rpb24gZXh0ZW5kcyBGdW5jdGlvblxuICBAZXh0ZW5kKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBDdXJyZW50TGluZSBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZChmYWxzZSlcbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgcm93ID0gQGdldE5vcm1hbGl6ZWRIZWFkQnVmZmVyUG9zaXRpb24oc2VsZWN0aW9uKS5yb3dcbiAgICByYW5nZSA9IEBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocm93KVxuICAgIGlmIEBpc0EoKVxuICAgICAgcmFuZ2VcbiAgICBlbHNlXG4gICAgICB0cmltUmFuZ2UoQGVkaXRvciwgcmFuZ2UpXG5cbmNsYXNzIEFDdXJyZW50TGluZSBleHRlbmRzIEN1cnJlbnRMaW5lXG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJDdXJyZW50TGluZSBleHRlbmRzIEN1cnJlbnRMaW5lXG4gIEBleHRlbmQoKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIEVudGlyZSBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZChmYWxzZSlcblxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICBAc3RvcFNlbGVjdGlvbigpXG4gICAgQGVkaXRvci5idWZmZXIuZ2V0UmFuZ2UoKVxuXG5jbGFzcyBBRW50aXJlIGV4dGVuZHMgRW50aXJlXG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJFbnRpcmUgZXh0ZW5kcyBFbnRpcmVcbiAgQGV4dGVuZCgpXG5jbGFzcyBBbGwgZXh0ZW5kcyBFbnRpcmUgIyBBbGlhcyBhcyBhY2Nlc3NpYmxlIG5hbWVcbiAgQGV4dGVuZChmYWxzZSlcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBFbXB0eSBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZChmYWxzZSlcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBMYXRlc3RDaGFuZ2UgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG4gIGdldFJhbmdlOiAtPlxuICAgIEBzdG9wU2VsZWN0aW9uKClcbiAgICBAdmltU3RhdGUubWFyay5nZXRSYW5nZSgnWycsICddJylcblxuY2xhc3MgQUxhdGVzdENoYW5nZSBleHRlbmRzIExhdGVzdENoYW5nZVxuICBAZXh0ZW5kKClcbmNsYXNzIElubmVyTGF0ZXN0Q2hhbmdlIGV4dGVuZHMgTGF0ZXN0Q2hhbmdlICMgTm8gZGlmZiBmcm9tIEFMYXRlc3RDaGFuZ2VcbiAgQGV4dGVuZCgpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgU2VhcmNoTWF0Y2hGb3J3YXJkIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKClcbiAgYmFja3dhcmQ6IGZhbHNlXG5cbiAgZmluZE1hdGNoOiAoZnJvbVBvaW50LCBwYXR0ZXJuKSAtPlxuICAgIGZyb21Qb2ludCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcChAZWRpdG9yLCBmcm9tUG9pbnQsIFwiZm9yd2FyZFwiKSBpZiBAaXNNb2RlKCd2aXN1YWwnKVxuICAgIGZvdW5kID0gbnVsbFxuICAgIEBzY2FuRm9yd2FyZCBwYXR0ZXJuLCB7ZnJvbTogW2Zyb21Qb2ludC5yb3csIDBdfSwgKHtyYW5nZSwgc3RvcH0pIC0+XG4gICAgICBpZiByYW5nZS5lbmQuaXNHcmVhdGVyVGhhbihmcm9tUG9pbnQpXG4gICAgICAgIGZvdW5kID0gcmFuZ2VcbiAgICAgICAgc3RvcCgpXG4gICAge3JhbmdlOiBmb3VuZCwgd2hpY2hJc0hlYWQ6ICdlbmQnfVxuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIHBhdHRlcm4gPSBAZ2xvYmFsU3RhdGUuZ2V0KCdsYXN0U2VhcmNoUGF0dGVybicpXG4gICAgcmV0dXJuIHVubGVzcyBwYXR0ZXJuP1xuXG4gICAgZnJvbVBvaW50ID0gc2VsZWN0aW9uLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXG4gICAge3JhbmdlLCB3aGljaElzSGVhZH0gPSBAZmluZE1hdGNoKGZyb21Qb2ludCwgcGF0dGVybilcbiAgICBpZiByYW5nZT9cbiAgICAgIEB1bmlvblJhbmdlQW5kRGV0ZXJtaW5lUmV2ZXJzZWRTdGF0ZShzZWxlY3Rpb24sIHJhbmdlLCB3aGljaElzSGVhZClcblxuICB1bmlvblJhbmdlQW5kRGV0ZXJtaW5lUmV2ZXJzZWRTdGF0ZTogKHNlbGVjdGlvbiwgZm91bmQsIHdoaWNoSXNIZWFkKSAtPlxuICAgIGlmIHNlbGVjdGlvbi5pc0VtcHR5KClcbiAgICAgIGZvdW5kXG4gICAgZWxzZVxuICAgICAgaGVhZCA9IGZvdW5kW3doaWNoSXNIZWFkXVxuICAgICAgdGFpbCA9IHNlbGVjdGlvbi5nZXRUYWlsQnVmZmVyUG9zaXRpb24oKVxuXG4gICAgICBpZiBAYmFja3dhcmRcbiAgICAgICAgaGVhZCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcChAZWRpdG9yLCBoZWFkLCAnZm9yd2FyZCcpIGlmIHRhaWwuaXNMZXNzVGhhbihoZWFkKVxuICAgICAgZWxzZVxuICAgICAgICBoZWFkID0gdHJhbnNsYXRlUG9pbnRBbmRDbGlwKEBlZGl0b3IsIGhlYWQsICdiYWNrd2FyZCcpIGlmIGhlYWQuaXNMZXNzVGhhbih0YWlsKVxuXG4gICAgICBAcmV2ZXJzZWQgPSBoZWFkLmlzTGVzc1RoYW4odGFpbClcbiAgICAgIG5ldyBSYW5nZSh0YWlsLCBoZWFkKS51bmlvbihzd3JhcChzZWxlY3Rpb24pLmdldFRhaWxCdWZmZXJSYW5nZSgpKVxuXG4gIHNlbGVjdFRleHRPYmplY3Q6IChzZWxlY3Rpb24pIC0+XG4gICAgcmV0dXJuIHVubGVzcyByYW5nZSA9IEBnZXRSYW5nZShzZWxlY3Rpb24pXG4gICAgcmV2ZXJzZWQgPSBAcmV2ZXJzZWQgPyBAYmFja3dhcmRcbiAgICBzd3JhcChzZWxlY3Rpb24pLnNldEJ1ZmZlclJhbmdlKHJhbmdlLCB7cmV2ZXJzZWR9KVxuICAgIHNlbGVjdGlvbi5jdXJzb3IuYXV0b3Njcm9sbCgpXG4gICAgdHJ1ZVxuXG5jbGFzcyBTZWFyY2hNYXRjaEJhY2t3YXJkIGV4dGVuZHMgU2VhcmNoTWF0Y2hGb3J3YXJkXG4gIEBleHRlbmQoKVxuICBiYWNrd2FyZDogdHJ1ZVxuXG4gIGZpbmRNYXRjaDogKGZyb21Qb2ludCwgcGF0dGVybikgLT5cbiAgICBmcm9tUG9pbnQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAoQGVkaXRvciwgZnJvbVBvaW50LCBcImJhY2t3YXJkXCIpIGlmIEBpc01vZGUoJ3Zpc3VhbCcpXG4gICAgZm91bmQgPSBudWxsXG4gICAgQHNjYW5CYWNrd2FyZCBwYXR0ZXJuLCB7ZnJvbTogW2Zyb21Qb2ludC5yb3csIEluZmluaXR5XX0sICh7cmFuZ2UsIHN0b3B9KSAtPlxuICAgICAgaWYgcmFuZ2Uuc3RhcnQuaXNMZXNzVGhhbihmcm9tUG9pbnQpXG4gICAgICAgIGZvdW5kID0gcmFuZ2VcbiAgICAgICAgc3RvcCgpXG4gICAge3JhbmdlOiBmb3VuZCwgd2hpY2hJc0hlYWQ6ICdzdGFydCd9XG5cbiMgW0xpbWl0YXRpb246IHdvbid0IGZpeF06IFNlbGVjdGVkIHJhbmdlIGlzIG5vdCBzdWJtb2RlIGF3YXJlLiBhbHdheXMgY2hhcmFjdGVyd2lzZS5cbiMgU28gZXZlbiBpZiBvcmlnaW5hbCBzZWxlY3Rpb24gd2FzIHZMIG9yIHZCLCBzZWxlY3RlZCByYW5nZSBieSB0aGlzIHRleHQtb2JqZWN0XG4jIGlzIGFsd2F5cyB2QyByYW5nZS5cbmNsYXNzIFByZXZpb3VzU2VsZWN0aW9uIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKClcblxuICBzZWxlY3Q6IC0+XG4gICAge3Byb3BlcnRpZXMsIHN1Ym1vZGV9ID0gQHZpbVN0YXRlLnByZXZpb3VzU2VsZWN0aW9uXG4gICAgaWYgcHJvcGVydGllcz8gYW5kIHN1Ym1vZGU/XG4gICAgICBzZWxlY3Rpb24gPSBAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKVxuICAgICAgc3dyYXAoc2VsZWN0aW9uKS5zZWxlY3RCeVByb3BlcnRpZXMocHJvcGVydGllcylcbiAgICAgIEB3aXNlID0gc3VibW9kZVxuXG5jbGFzcyBQZXJzaXN0ZW50U2VsZWN0aW9uIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuXG4gIHNlbGVjdDogLT5cbiAgICB7cGVyc2lzdGVudFNlbGVjdGlvbn0gPSBAdmltU3RhdGVcbiAgICB1bmxlc3MgcGVyc2lzdGVudFNlbGVjdGlvbi5pc0VtcHR5KClcbiAgICAgIHBlcnNpc3RlbnRTZWxlY3Rpb24uc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXMoKVxuICAgICAgQHdpc2UgPSBzd3JhcC5kZXRlY3RWaXN1YWxNb2RlU3VibW9kZShAZWRpdG9yKVxuXG5jbGFzcyBBUGVyc2lzdGVudFNlbGVjdGlvbiBleHRlbmRzIFBlcnNpc3RlbnRTZWxlY3Rpb25cbiAgQGV4dGVuZCgpXG5jbGFzcyBJbm5lclBlcnNpc3RlbnRTZWxlY3Rpb24gZXh0ZW5kcyBQZXJzaXN0ZW50U2VsZWN0aW9uXG4gIEBleHRlbmQoKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFZpc2libGVBcmVhIGV4dGVuZHMgVGV4dE9iamVjdCAjIDgyMiB0byA4NjNcbiAgQGV4dGVuZChmYWxzZSlcblxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICBAc3RvcFNlbGVjdGlvbigpXG4gICAgIyBbQlVHP10gTmVlZCB0cmFuc2xhdGUgdG8gc2hpbG5rIHRvcCBhbmQgYm90dG9tIHRvIGZpdCBhY3R1YWwgcm93LlxuICAgICMgVGhlIHJlYXNvbiBJIG5lZWQgLTIgYXQgYm90dG9tIGlzIGJlY2F1c2Ugb2Ygc3RhdHVzIGJhcj9cbiAgICBidWZmZXJSYW5nZSA9IGdldFZpc2libGVCdWZmZXJSYW5nZShAZWRpdG9yKVxuICAgIGlmIGJ1ZmZlclJhbmdlLmdldFJvd3MoKSA+IEBlZGl0b3IuZ2V0Um93c1BlclBhZ2UoKVxuICAgICAgYnVmZmVyUmFuZ2UudHJhbnNsYXRlKFsrMSwgMF0sIFstMywgMF0pXG4gICAgZWxzZVxuICAgICAgYnVmZmVyUmFuZ2VcblxuY2xhc3MgQVZpc2libGVBcmVhIGV4dGVuZHMgVmlzaWJsZUFyZWFcbiAgQGV4dGVuZCgpXG5jbGFzcyBJbm5lclZpc2libGVBcmVhIGV4dGVuZHMgVmlzaWJsZUFyZWFcbiAgQGV4dGVuZCgpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBbRklYTUVdIHdpc2UgbWlzbWF0Y2ggc2NlZW5Qb3NpdGlvbiB2cyBidWZmZXJQb3NpdGlvblxuY2xhc3MgRWRnZSBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZChmYWxzZSlcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIGZyb21Qb2ludCA9IEBnZXROb3JtYWxpemVkSGVhZFNjcmVlblBvc2l0aW9uKHNlbGVjdGlvbilcblxuICAgIG1vdmVVcFRvRWRnZSA9IEBuZXcoJ01vdmVVcFRvRWRnZScpXG4gICAgbW92ZURvd25Ub0VkZ2UgPSBAbmV3KCdNb3ZlRG93blRvRWRnZScpXG4gICAgcmV0dXJuIHVubGVzcyBtb3ZlVXBUb0VkZ2UuaXNTdG9wcGFibGVQb2ludChmcm9tUG9pbnQpXG5cbiAgICBzdGFydFNjcmVlblBvaW50ID0gZW5kU2NyZWVuUG9pbnQgPSBudWxsXG4gICAgc3RhcnRTY3JlZW5Qb2ludCA9IGVuZFNjcmVlblBvaW50ID0gZnJvbVBvaW50IGlmIG1vdmVVcFRvRWRnZS5pc0VkZ2UoZnJvbVBvaW50KVxuXG4gICAgaWYgbW92ZVVwVG9FZGdlLmlzU3RvcHBhYmxlUG9pbnQoZnJvbVBvaW50LnRyYW5zbGF0ZShbLTEsIDBdKSlcbiAgICAgIHN0YXJ0U2NyZWVuUG9pbnQgPSBtb3ZlVXBUb0VkZ2UuZ2V0UG9pbnQoZnJvbVBvaW50KVxuXG4gICAgaWYgbW92ZURvd25Ub0VkZ2UuaXNTdG9wcGFibGVQb2ludChmcm9tUG9pbnQudHJhbnNsYXRlKFsrMSwgMF0pKVxuICAgICAgZW5kU2NyZWVuUG9pbnQgPSBtb3ZlRG93blRvRWRnZS5nZXRQb2ludChmcm9tUG9pbnQpXG5cbiAgICBpZiBzdGFydFNjcmVlblBvaW50PyBhbmQgZW5kU2NyZWVuUG9pbnQ/XG4gICAgICBzY3JlZW5SYW5nZSA9IG5ldyBSYW5nZShzdGFydFNjcmVlblBvaW50LCBlbmRTY3JlZW5Qb2ludClcbiAgICAgIHJhbmdlID0gQGVkaXRvci5idWZmZXJSYW5nZUZvclNjcmVlblJhbmdlKHNjcmVlblJhbmdlKVxuICAgICAgZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShAZWRpdG9yLCBbcmFuZ2Uuc3RhcnQucm93LCByYW5nZS5lbmQucm93XSlcblxuY2xhc3MgQUVkZ2UgZXh0ZW5kcyBFZGdlXG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJFZGdlIGV4dGVuZHMgRWRnZVxuICBAZXh0ZW5kKClcbiJdfQ==
