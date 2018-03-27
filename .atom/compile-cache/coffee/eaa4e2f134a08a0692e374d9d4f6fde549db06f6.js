(function() {
  var AAngleBracket, AAngleBracketAllowForwarding, AAnyPair, AAnyPairAllowForwarding, AAnyQuote, ABackTick, AComment, ACurlyBracket, ACurlyBracketAllowForwarding, ACurrentLine, ADoubleQuote, AEdge, AEntire, AFold, AFunction, AIndentation, ALatestChange, APair, AParagraph, AParenthesis, AParenthesisAllowForwarding, APersistentSelection, ASingleQuote, ASmartWord, ASquareBracket, ASquareBracketAllowForwarding, ASubword, ATag, AVisibleArea, AWholeWord, AWord, All, AngleBracket, AnyPair, AnyPairAllowForwarding, AnyQuote, BackTick, Base, BracketFinder, Comment, CurlyBracket, CurrentLine, DoubleQuote, Edge, Empty, Entire, Fold, Function, Indentation, InnerAngleBracket, InnerAngleBracketAllowForwarding, InnerAnyPair, InnerAnyPairAllowForwarding, InnerAnyQuote, InnerBackTick, InnerComment, InnerCurlyBracket, InnerCurlyBracketAllowForwarding, InnerCurrentLine, InnerDoubleQuote, InnerEdge, InnerEntire, InnerFold, InnerFunction, InnerIndentation, InnerLatestChange, InnerParagraph, InnerParenthesis, InnerParenthesisAllowForwarding, InnerPersistentSelection, InnerSingleQuote, InnerSmartWord, InnerSquareBracket, InnerSquareBracketAllowForwarding, InnerSubword, InnerTag, InnerVisibleArea, InnerWholeWord, InnerWord, LatestChange, Pair, Paragraph, Parenthesis, PersistentSelection, Point, PreviousSelection, Quote, QuoteFinder, Range, SearchMatchBackward, SearchMatchForward, SingleQuote, SmartWord, SquareBracket, Subword, Tag, TagFinder, TextObject, VisibleArea, WholeWord, Word, _, expandRangeToWhiteSpaces, getBufferRangeForRowRange, getBufferRows, getCodeFoldRowRangesContainesForRow, getIndentLevelForBufferRow, getLineTextToBufferPosition, getValidVimBufferRow, getVisibleBufferRange, isIncludeFunctionScopeForRow, pointIsAtEndOfLine, ref, ref1, ref2, sortRanges, swrap, translatePointAndClip, trimRange,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('atom'), Range = ref.Range, Point = ref.Point;

  _ = require('underscore-plus');

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
      return this.wise === 'linewise' && this.getConfig('keepColumnOnSelectTextObject') && this.getOperator()["instanceof"]('Select');
    };

    TextObject.prototype.execute = function() {
      if (this.operator != null) {
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
          var i, len, ref3, selection, stop;
          stop = arg.stop;
          _this.stopSelection = stop;
          ref3 = _this.editor.getSelections();
          for (i = 0, len = ref3.length; i < len; i++) {
            selection = ref3[i];
            selectResults.push(_this.selectTextObject(selection));
          }
          if (!_this.isSuportCount()) {
            return stop();
          }
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
      if (selectResults.some(function(value) {
        return value;
      })) {
        return this.wise != null ? this.wise : this.wise = swrap.detectWise(this.editor);
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
      var range, ref3;
      if (!(range = this.getRange(selection))) {
        return;
      }
      swrap(selection).setBufferRange(range, {
        reversed: (ref3 = this.reversed) != null ? ref3 : this.backward
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
        swrap(selection).selectByProperties(properties, {
          keepGoalColumn: false
        });
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
        return this.wise = swrap.detectWise(this.editor);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvdGV4dC1vYmplY3QuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSw4d0RBQUE7SUFBQTs7OztFQUFBLE1BQWlCLE9BQUEsQ0FBUSxNQUFSLENBQWpCLEVBQUMsaUJBQUQsRUFBUTs7RUFDUixDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQU9KLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7RUFDUCxLQUFBLEdBQVEsT0FBQSxDQUFRLHFCQUFSOztFQUNSLE9BZUksT0FBQSxDQUFRLFNBQVIsQ0FmSixFQUNFLDhEQURGLEVBRUUsNERBRkYsRUFHRSw4RUFIRixFQUlFLDBEQUpGLEVBS0UsZ0VBTEYsRUFNRSx3REFORixFQU9FLGtEQVBGLEVBUUUsa0RBUkYsRUFTRSxrQ0FURixFQVVFLGdEQVZGLEVBV0UsMEJBWEYsRUFhRSw0QkFiRixFQWNFOztFQUVGLE9BQTBDLE9BQUEsQ0FBUSxzQkFBUixDQUExQyxFQUFDLGtDQUFELEVBQWdCLDhCQUFoQixFQUE2Qjs7RUFFdkI7OztJQUNKLFVBQUMsQ0FBQSxNQUFELENBQVEsS0FBUjs7eUJBQ0EsSUFBQSxHQUFNOzt5QkFDTixZQUFBLEdBQWM7O0lBRUQsb0JBQUE7TUFDWCxJQUFDLENBQUEsV0FBVyxDQUFBLFNBQUUsQ0FBQSxLQUFkLEdBQXNCLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBVSxDQUFDLFVBQVgsQ0FBc0IsT0FBdEI7TUFDdEIsNkNBQUEsU0FBQTtNQUNBLElBQUMsQ0FBQSxVQUFELENBQUE7SUFIVzs7eUJBS2IsT0FBQSxHQUFTLFNBQUE7YUFDUCxJQUFDLENBQUE7SUFETTs7eUJBR1QsR0FBQSxHQUFLLFNBQUE7YUFDSCxDQUFJLElBQUMsQ0FBQSxPQUFELENBQUE7SUFERDs7eUJBR0wsYUFBQSxHQUFlLFNB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QWMsQ0FBQyxnQkFBZixDQUFnQyxTQUFTLENBQUMsU0FBVixDQUFvQixDQUFDLENBQUMsQ0FBRixFQUFLLENBQUwsQ0FBcEIsQ0FBaEMsQ0FBSDtRQUNFLGNBQUEsR0FBaUIsY0FBYyxDQUFDLFFBQWYsQ0FBd0IsU0FBeEIsRUFEbkI7O01BR0EsSUFBRywwQkFBQSxJQUFzQix3QkFBekI7UUFDRSxXQUFBLEdBQWtCLElBQUEsS0FBQSxDQUFNLGdCQUFOLEVBQXdCLGNBQXhCO1FBQ2xCLEtBQUEsR0FBUSxJQUFDLENBQUEsTUFBTSxDQUFDLHlCQUFSLENBQWtDLFdBQWxDO2VBQ1IseUJBQUEsQ0FBMEIsSUFBQyxDQUFBLE1BQTNCLEVBQW1DLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFiLEVBQWtCLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBNUIsQ0FBbkMsRUFIRjs7SUFoQlE7Ozs7S0FKTzs7RUF5QmI7Ozs7Ozs7SUFDSixLQUFDLENBQUEsTUFBRCxDQUFBOzs7O0tBRGtCOztFQUVkOzs7Ozs7O0lBQ0osU0FBQyxDQUFBLE1BQUQsQ0FBQTs7OztLQURzQjtBQWh5QnhCIiwic291cmNlc0NvbnRlbnQiOlsie1JhbmdlLCBQb2ludH0gPSByZXF1aXJlICdhdG9tJ1xuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxuIyBbVE9ET10gTmVlZCBvdmVyaGF1bFxuIyAgLSBbIF0gbXVzdCBoYXZlIGdldFJhbmdlKHNlbGVjdGlvbikgLT5cbiMgIC0gWyBdIFJlbW92ZSBzZWxlY3RUZXh0T2JqZWN0P1xuIyAgLSBbIF0gTWFrZSBleHBhbmRhYmxlIGJ5IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnVuaW9uKEBnZXRSYW5nZShzZWxlY3Rpb24pKVxuIyAgLSBbIF0gQ291bnQgc3VwcG9ydChwcmlvcml0eSBsb3cpP1xuQmFzZSA9IHJlcXVpcmUgJy4vYmFzZSdcbnN3cmFwID0gcmVxdWlyZSAnLi9zZWxlY3Rpb24td3JhcHBlcidcbntcbiAgZ2V0TGluZVRleHRUb0J1ZmZlclBvc2l0aW9uXG4gIGdldEluZGVudExldmVsRm9yQnVmZmVyUm93XG4gIGdldENvZGVGb2xkUm93UmFuZ2VzQ29udGFpbmVzRm9yUm93XG4gIGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2VcbiAgaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvd1xuICBleHBhbmRSYW5nZVRvV2hpdGVTcGFjZXNcbiAgZ2V0VmlzaWJsZUJ1ZmZlclJhbmdlXG4gIHRyYW5zbGF0ZVBvaW50QW5kQ2xpcFxuICBnZXRCdWZmZXJSb3dzXG4gIGdldFZhbGlkVmltQnVmZmVyUm93XG4gIHRyaW1SYW5nZVxuXG4gIHNvcnRSYW5nZXNcbiAgcG9pbnRJc0F0RW5kT2ZMaW5lXG59ID0gcmVxdWlyZSAnLi91dGlscydcbntCcmFja2V0RmluZGVyLCBRdW90ZUZpbmRlciwgVGFnRmluZGVyfSA9IHJlcXVpcmUgJy4vcGFpci1maW5kZXIuY29mZmVlJ1xuXG5jbGFzcyBUZXh0T2JqZWN0IGV4dGVuZHMgQmFzZVxuICBAZXh0ZW5kKGZhbHNlKVxuICB3aXNlOiBudWxsXG4gIHN1cHBvcnRDb3VudDogZmFsc2UgIyBGSVhNRSAjNDcyLCAjNjZcblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAY29uc3RydWN0b3I6OmlubmVyID0gQGdldE5hbWUoKS5zdGFydHNXaXRoKCdJbm5lcicpXG4gICAgc3VwZXJcbiAgICBAaW5pdGlhbGl6ZSgpXG5cbiAgaXNJbm5lcjogLT5cbiAgICBAaW5uZXJcblxuICBpc0E6IC0+XG4gICAgbm90IEBpc0lubmVyKClcblxuICBpc1N1cG9ydENvdW50OiAtPlxuICAgIEBzdXBwb3J0Q291bnRcblxuICBnZXRXaXNlOiAtPlxuICAgIGlmIEB3aXNlPyBhbmQgQGdldE9wZXJhdG9yKCkuaXNPY2N1cnJlbmNlKClcbiAgICAgICdjaGFyYWN0ZXJ3aXNlJ1xuICAgIGVsc2VcbiAgICAgIEB3aXNlXG5cbiAgaXNDaGFyYWN0ZXJ3aXNlOiAtPlxuICAgIEBnZXRXaXNlKCkgaXMgJ2NoYXJhY3Rlcndpc2UnXG5cbiAgaXNMaW5ld2lzZTogLT5cbiAgICBAZ2V0V2lzZSgpIGlzICdsaW5ld2lzZSdcblxuICBpc0Jsb2Nrd2lzZTogLT5cbiAgICBAZ2V0V2lzZSgpIGlzICdibG9ja3dpc2UnXG5cbiAgZ2V0Tm9ybWFsaXplZEhlYWRCdWZmZXJQb3NpdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBoZWFkID0gc2VsZWN0aW9uLmdldEhlYWRCdWZmZXJQb3NpdGlvbigpXG4gICAgaWYgQGlzTW9kZSgndmlzdWFsJykgYW5kIG5vdCBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpXG4gICAgICBoZWFkID0gdHJhbnNsYXRlUG9pbnRBbmRDbGlwKEBlZGl0b3IsIGhlYWQsICdiYWNrd2FyZCcpXG4gICAgaGVhZFxuXG4gIGdldE5vcm1hbGl6ZWRIZWFkU2NyZWVuUG9zaXRpb246IChzZWxlY3Rpb24pIC0+XG4gICAgYnVmZmVyUG9zaXRpb24gPSBAZ2V0Tm9ybWFsaXplZEhlYWRCdWZmZXJQb3NpdGlvbihzZWxlY3Rpb24pXG4gICAgQGVkaXRvci5zY3JlZW5Qb3NpdGlvbkZvckJ1ZmZlclBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uKVxuXG4gIG5lZWRUb0tlZXBDb2x1bW46IC0+XG4gICAgQHdpc2UgaXMgJ2xpbmV3aXNlJyBhbmRcbiAgICAgIEBnZXRDb25maWcoJ2tlZXBDb2x1bW5PblNlbGVjdFRleHRPYmplY3QnKSBhbmRcbiAgICAgIEBnZXRPcGVyYXRvcigpLmluc3RhbmNlb2YoJ1NlbGVjdCcpXG5cbiAgZXhlY3V0ZTogLT5cbiAgICAjIFdoZW5uZXZlciBUZXh0T2JqZWN0IGlzIGV4ZWN1dGVkLCBpdCBoYXMgQG9wZXJhdG9yXG4gICAgIyBDYWxsZWQgZnJvbSBPcGVyYXRvcjo6c2VsZWN0VGFyZ2V0KClcbiAgICAjICAtIGB2IGkgcGAsIGlzIGBTZWxlY3RgIG9wZXJhdG9yIHdpdGggQHRhcmdldCA9IGBJbm5lclBhcmFncmFwaGAuXG4gICAgIyAgLSBgZCBpIHBgLCBpcyBgRGVsZXRlYCBvcGVyYXRvciB3aXRoIEB0YXJnZXQgPSBgSW5uZXJQYXJhZ3JhcGhgLlxuICAgIGlmIEBvcGVyYXRvcj9cbiAgICAgIEBzZWxlY3QoKVxuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW4gVGV4dE9iamVjdDogTXVzdCBub3QgaGFwcGVuJylcblxuICBzZWxlY3Q6IC0+XG4gICAgc2VsZWN0UmVzdWx0cyA9IFtdXG4gICAgQGNvdW50VGltZXMgQGdldENvdW50KCksICh7c3RvcH0pID0+XG4gICAgICBAc3RvcFNlbGVjdGlvbiA9IHN0b3BcblxuICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICBzZWxlY3RSZXN1bHRzLnB1c2goQHNlbGVjdFRleHRPYmplY3Qoc2VsZWN0aW9uKSlcblxuICAgICAgdW5sZXNzIEBpc1N1cG9ydENvdW50KClcbiAgICAgICAgc3RvcCgpICMgRklYTUU6IHF1aWNrLWZpeCBmb3IgIzU2MFxuXG4gICAgaWYgQG5lZWRUb0tlZXBDb2x1bW4oKVxuICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICBzd3JhcChzZWxlY3Rpb24pLmNsaXBQcm9wZXJ0aWVzVGlsbEVuZE9mTGluZSgpXG5cbiAgICBAZWRpdG9yLm1lcmdlSW50ZXJzZWN0aW5nU2VsZWN0aW9ucygpXG4gICAgaWYgc2VsZWN0UmVzdWx0cy5zb21lKCh2YWx1ZSkgLT4gdmFsdWUpXG4gICAgICBAd2lzZSA/PSBzd3JhcC5kZXRlY3RXaXNlKEBlZGl0b3IpXG4gICAgZWxzZVxuICAgICAgQHdpc2UgPSBudWxsXG5cbiAgc2VsZWN0VGV4dE9iamVjdDogKHNlbGVjdGlvbikgLT5cbiAgICBpZiByYW5nZSA9IEBnZXRSYW5nZShzZWxlY3Rpb24pXG4gICAgICBvbGRSYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG5cbiAgICAgIG5lZWRUb0tlZXBDb2x1bW4gPSBAbmVlZFRvS2VlcENvbHVtbigpXG4gICAgICBpZiBuZWVkVG9LZWVwQ29sdW1uIGFuZCBub3QgQGlzTW9kZSgndmlzdWFsJywgJ2xpbmV3aXNlJylcbiAgICAgICAgQHZpbVN0YXRlLm1vZGVNYW5hZ2VyLmFjdGl2YXRlKCd2aXN1YWwnLCAnbGluZXdpc2UnKVxuXG4gICAgICAjIFByZXZlbnQgYXV0b3Njcm9sbCB0byBjbG9zaW5nIGNoYXIgb24gYGNoYW5nZS1zdXJyb3VuZC1hbnktcGFpcmAuXG4gICAgICBvcHRpb25zID0ge1xuICAgICAgICBhdXRvc2Nyb2xsOiBzZWxlY3Rpb24uaXNMYXN0U2VsZWN0aW9uKCkgYW5kIG5vdCBAZ2V0T3BlcmF0b3IoKS5zdXBwb3J0RWFybHlTZWxlY3RcbiAgICAgICAga2VlcEdvYWxDb2x1bW46IG5lZWRUb0tlZXBDb2x1bW5cbiAgICAgIH1cbiAgICAgIHN3cmFwKHNlbGVjdGlvbikuc2V0QnVmZmVyUmFuZ2VTYWZlbHkocmFuZ2UsIG9wdGlvbnMpXG5cbiAgICAgIG5ld1JhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgIGlmIG5ld1JhbmdlLmlzRXF1YWwob2xkUmFuZ2UpXG4gICAgICAgIEBzdG9wU2VsZWN0aW9uKCkgIyBGSVhNRTogcXVpY2stZml4IGZvciAjNTYwXG5cbiAgICAgIHRydWVcbiAgICBlbHNlXG4gICAgICBAc3RvcFNlbGVjdGlvbigpICMgRklYTUU6IHF1aWNrLWZpeCBmb3IgIzU2MFxuICAgICAgZmFsc2VcblxuICBnZXRSYW5nZTogLT5cbiAgICAjIEkgd2FudCB0b1xuICAgICMgdGhyb3cgbmV3IEVycm9yKCd0ZXh0LW9iamVjdCBtdXN0IHJlc3BvbmQgdG8gcmFuZ2UgYnkgZ2V0UmFuZ2UoKSEnKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFdvcmQgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgcG9pbnQgPSBAZ2V0Tm9ybWFsaXplZEhlYWRCdWZmZXJQb3NpdGlvbihzZWxlY3Rpb24pXG4gICAge3JhbmdlfSA9IEBnZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbihwb2ludCwge0B3b3JkUmVnZXh9KVxuICAgIGlmIEBpc0EoKVxuICAgICAgZXhwYW5kUmFuZ2VUb1doaXRlU3BhY2VzKEBlZGl0b3IsIHJhbmdlKVxuICAgIGVsc2VcbiAgICAgIHJhbmdlXG5cbmNsYXNzIEFXb3JkIGV4dGVuZHMgV29yZFxuICBAZXh0ZW5kKClcbmNsYXNzIElubmVyV29yZCBleHRlbmRzIFdvcmRcbiAgQGV4dGVuZCgpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgV2hvbGVXb3JkIGV4dGVuZHMgV29yZFxuICBAZXh0ZW5kKGZhbHNlKVxuICB3b3JkUmVnZXg6IC9cXFMrL1xuXG5jbGFzcyBBV2hvbGVXb3JkIGV4dGVuZHMgV2hvbGVXb3JkXG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJXaG9sZVdvcmQgZXh0ZW5kcyBXaG9sZVdvcmRcbiAgQGV4dGVuZCgpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBKdXN0IGluY2x1ZGUgXywgLVxuY2xhc3MgU21hcnRXb3JkIGV4dGVuZHMgV29yZFxuICBAZXh0ZW5kKGZhbHNlKVxuICB3b3JkUmVnZXg6IC9bXFx3LV0rL1xuXG5jbGFzcyBBU21hcnRXb3JkIGV4dGVuZHMgU21hcnRXb3JkXG4gIEBkZXNjcmlwdGlvbjogXCJBIHdvcmQgdGhhdCBjb25zaXN0cyBvZiBhbHBoYW51bWVyaWMgY2hhcnMoYC9bQS1aYS16MC05X10vYCkgYW5kIGh5cGhlbiBgLWBcIlxuICBAZXh0ZW5kKClcbmNsYXNzIElubmVyU21hcnRXb3JkIGV4dGVuZHMgU21hcnRXb3JkXG4gIEBkZXNjcmlwdGlvbjogXCJDdXJyZW50bHkgTm8gZGlmZiBmcm9tIGBhLXNtYXJ0LXdvcmRgXCJcbiAgQGV4dGVuZCgpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBKdXN0IGluY2x1ZGUgXywgLVxuY2xhc3MgU3Vid29yZCBleHRlbmRzIFdvcmRcbiAgQGV4dGVuZChmYWxzZSlcbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgQHdvcmRSZWdleCA9IHNlbGVjdGlvbi5jdXJzb3Iuc3Vid29yZFJlZ0V4cCgpXG4gICAgc3VwZXJcblxuY2xhc3MgQVN1YndvcmQgZXh0ZW5kcyBTdWJ3b3JkXG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJTdWJ3b3JkIGV4dGVuZHMgU3Vid29yZFxuICBAZXh0ZW5kKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBQYWlyIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuICBhbGxvd05leHRMaW5lOiBudWxsXG4gIGFkanVzdElubmVyUmFuZ2U6IHRydWVcbiAgcGFpcjogbnVsbFxuICB3aXNlOiAnY2hhcmFjdGVyd2lzZSdcbiAgc3VwcG9ydENvdW50OiB0cnVlXG5cbiAgaXNBbGxvd05leHRMaW5lOiAtPlxuICAgIEBhbGxvd05leHRMaW5lID8gKEBwYWlyPyBhbmQgQHBhaXJbMF0gaXNudCBAcGFpclsxXSlcblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICAjIGF1dG8tc2V0IHByb3BlcnR5IGZyb20gY2xhc3MgbmFtZS5cbiAgICBAYWxsb3dGb3J3YXJkaW5nID89IEBnZXROYW1lKCkuZW5kc1dpdGgoJ0FsbG93Rm9yd2FyZGluZycpXG4gICAgc3VwZXJcblxuICBhZGp1c3RSYW5nZTogKHtzdGFydCwgZW5kfSkgLT5cbiAgICAjIERpcnR5IHdvcmsgdG8gZmVlbCBuYXR1cmFsIGZvciBodW1hbiwgdG8gYmVoYXZlIGNvbXBhdGlibGUgd2l0aCBwdXJlIFZpbS5cbiAgICAjIFdoZXJlIHRoaXMgYWRqdXN0bWVudCBhcHBlYXIgaXMgaW4gZm9sbG93aW5nIHNpdHVhdGlvbi5cbiAgICAjIG9wLTE6IGBjaXtgIHJlcGxhY2Ugb25seSAybmQgbGluZVxuICAgICMgb3AtMjogYGRpe2AgZGVsZXRlIG9ubHkgMm5kIGxpbmUuXG4gICAgIyB0ZXh0OlxuICAgICMgIHtcbiAgICAjICAgIGFhYVxuICAgICMgIH1cbiAgICBpZiBwb2ludElzQXRFbmRPZkxpbmUoQGVkaXRvciwgc3RhcnQpXG4gICAgICBzdGFydCA9IHN0YXJ0LnRyYXZlcnNlKFsxLCAwXSlcblxuICAgIGlmIGdldExpbmVUZXh0VG9CdWZmZXJQb3NpdGlvbihAZWRpdG9yLCBlbmQpLm1hdGNoKC9eXFxzKiQvKVxuICAgICAgaWYgQGlzTW9kZSgndmlzdWFsJylcbiAgICAgICAgIyBUaGlzIGlzIHNsaWdodGx5IGlubmNvbnNpc3RlbnQgd2l0aCByZWd1bGFyIFZpbVxuICAgICAgICAjIC0gcmVndWxhciBWaW06IHNlbGVjdCBuZXcgbGluZSBhZnRlciBFT0xcbiAgICAgICAgIyAtIHZpbS1tb2RlLXBsdXM6IHNlbGVjdCB0byBFT0woYmVmb3JlIG5ldyBsaW5lKVxuICAgICAgICAjIFRoaXMgaXMgaW50ZW50aW9uYWwgc2luY2UgdG8gbWFrZSBzdWJtb2RlIGBjaGFyYWN0ZXJ3aXNlYCB3aGVuIGF1dG8tZGV0ZWN0IHN1Ym1vZGVcbiAgICAgICAgIyBpbm5lckVuZCA9IG5ldyBQb2ludChpbm5lckVuZC5yb3cgLSAxLCBJbmZpbml0eSlcbiAgICAgICAgZW5kID0gbmV3IFBvaW50KGVuZC5yb3cgLSAxLCBJbmZpbml0eSlcbiAgICAgIGVsc2VcbiAgICAgICAgZW5kID0gbmV3IFBvaW50KGVuZC5yb3csIDApXG5cbiAgICBuZXcgUmFuZ2Uoc3RhcnQsIGVuZClcblxuICBnZXRGaW5kZXI6IC0+XG4gICAgb3B0aW9ucyA9IHthbGxvd05leHRMaW5lOiBAaXNBbGxvd05leHRMaW5lKCksIEBhbGxvd0ZvcndhcmRpbmcsIEBwYWlyfVxuICAgIGlmIEBwYWlyWzBdIGlzIEBwYWlyWzFdXG4gICAgICBuZXcgUXVvdGVGaW5kZXIoQGVkaXRvciwgb3B0aW9ucylcbiAgICBlbHNlXG4gICAgICBuZXcgQnJhY2tldEZpbmRlcihAZWRpdG9yLCBvcHRpb25zKVxuXG4gIGdldFBhaXJJbmZvOiAoZnJvbSkgLT5cbiAgICBwYWlySW5mbyA9IEBnZXRGaW5kZXIoKS5maW5kKGZyb20pXG4gICAgdW5sZXNzIHBhaXJJbmZvP1xuICAgICAgcmV0dXJuIG51bGxcbiAgICBwYWlySW5mby5pbm5lclJhbmdlID0gQGFkanVzdFJhbmdlKHBhaXJJbmZvLmlubmVyUmFuZ2UpIGlmIEBhZGp1c3RJbm5lclJhbmdlXG4gICAgcGFpckluZm8udGFyZ2V0UmFuZ2UgPSBpZiBAaXNJbm5lcigpIHRoZW4gcGFpckluZm8uaW5uZXJSYW5nZSBlbHNlIHBhaXJJbmZvLmFSYW5nZVxuICAgIHBhaXJJbmZvXG5cbiAgZ2V0UG9pbnRUb1NlYXJjaEZyb206IChzZWxlY3Rpb24sIHNlYXJjaEZyb20pIC0+XG4gICAgc3dpdGNoIHNlYXJjaEZyb21cbiAgICAgIHdoZW4gJ2hlYWQnIHRoZW4gQGdldE5vcm1hbGl6ZWRIZWFkQnVmZmVyUG9zaXRpb24oc2VsZWN0aW9uKVxuICAgICAgd2hlbiAnc3RhcnQnIHRoZW4gc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcignc3RhcnQnKVxuXG4gICMgQWxsb3cgb3ZlcnJpZGUgQGFsbG93Rm9yd2FyZGluZyBieSAybmQgYXJndW1lbnQuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uLCBvcHRpb25zPXt9KSAtPlxuICAgIHthbGxvd0ZvcndhcmRpbmcsIHNlYXJjaEZyb219ID0gb3B0aW9uc1xuICAgIHNlYXJjaEZyb20gPz0gJ2hlYWQnXG4gICAgQGFsbG93Rm9yd2FyZGluZyA9IGFsbG93Rm9yd2FyZGluZyBpZiBhbGxvd0ZvcndhcmRpbmc/XG4gICAgb3JpZ2luYWxSYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgcGFpckluZm8gPSBAZ2V0UGFpckluZm8oQGdldFBvaW50VG9TZWFyY2hGcm9tKHNlbGVjdGlvbiwgc2VhcmNoRnJvbSkpXG4gICAgIyBXaGVuIHJhbmdlIHdhcyBzYW1lLCB0cnkgdG8gZXhwYW5kIHJhbmdlXG4gICAgaWYgcGFpckluZm8/LnRhcmdldFJhbmdlLmlzRXF1YWwob3JpZ2luYWxSYW5nZSlcbiAgICAgIHBhaXJJbmZvID0gQGdldFBhaXJJbmZvKHBhaXJJbmZvLmFSYW5nZS5lbmQpXG4gICAgcGFpckluZm8/LnRhcmdldFJhbmdlXG5cbiMgVXNlZCBieSBEZWxldGVTdXJyb3VuZFxuY2xhc3MgQVBhaXIgZXh0ZW5kcyBQYWlyXG4gIEBleHRlbmQoZmFsc2UpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgQW55UGFpciBleHRlbmRzIFBhaXJcbiAgQGV4dGVuZChmYWxzZSlcbiAgYWxsb3dGb3J3YXJkaW5nOiBmYWxzZVxuICBtZW1iZXI6IFtcbiAgICAnRG91YmxlUXVvdGUnLCAnU2luZ2xlUXVvdGUnLCAnQmFja1RpY2snLFxuICAgICdDdXJseUJyYWNrZXQnLCAnQW5nbGVCcmFja2V0JywgJ1NxdWFyZUJyYWNrZXQnLCAnUGFyZW50aGVzaXMnXG4gIF1cblxuICBnZXRSYW5nZUJ5OiAoa2xhc3MsIHNlbGVjdGlvbikgLT5cbiAgICBAbmV3KGtsYXNzKS5nZXRSYW5nZShzZWxlY3Rpb24sIHtAYWxsb3dGb3J3YXJkaW5nLCBAc2VhcmNoRnJvbX0pXG5cbiAgZ2V0UmFuZ2VzOiAoc2VsZWN0aW9uKSAtPlxuICAgIHByZWZpeCA9IGlmIEBpc0lubmVyKCkgdGhlbiAnSW5uZXInIGVsc2UgJ0EnXG4gICAgcmFuZ2VzID0gW11cbiAgICBmb3Iga2xhc3MgaW4gQG1lbWJlciB3aGVuIHJhbmdlID0gQGdldFJhbmdlQnkocHJlZml4ICsga2xhc3MsIHNlbGVjdGlvbilcbiAgICAgIHJhbmdlcy5wdXNoKHJhbmdlKVxuICAgIHJhbmdlc1xuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIHJhbmdlcyA9IEBnZXRSYW5nZXMoc2VsZWN0aW9uKVxuICAgIF8ubGFzdChzb3J0UmFuZ2VzKHJhbmdlcykpIGlmIHJhbmdlcy5sZW5ndGhcblxuY2xhc3MgQUFueVBhaXIgZXh0ZW5kcyBBbnlQYWlyXG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJBbnlQYWlyIGV4dGVuZHMgQW55UGFpclxuICBAZXh0ZW5kKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBBbnlQYWlyQWxsb3dGb3J3YXJkaW5nIGV4dGVuZHMgQW55UGFpclxuICBAZXh0ZW5kKGZhbHNlKVxuICBAZGVzY3JpcHRpb246IFwiUmFuZ2Ugc3Vycm91bmRlZCBieSBhdXRvLWRldGVjdGVkIHBhaXJlZCBjaGFycyBmcm9tIGVuY2xvc2VkIGFuZCBmb3J3YXJkaW5nIGFyZWFcIlxuICBhbGxvd0ZvcndhcmRpbmc6IHRydWVcbiAgc2VhcmNoRnJvbTogJ3N0YXJ0J1xuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICByYW5nZXMgPSBAZ2V0UmFuZ2VzKHNlbGVjdGlvbilcbiAgICBmcm9tID0gc2VsZWN0aW9uLmN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgW2ZvcndhcmRpbmdSYW5nZXMsIGVuY2xvc2luZ1Jhbmdlc10gPSBfLnBhcnRpdGlvbiByYW5nZXMsIChyYW5nZSkgLT5cbiAgICAgIHJhbmdlLnN0YXJ0LmlzR3JlYXRlclRoYW5PckVxdWFsKGZyb20pXG4gICAgZW5jbG9zaW5nUmFuZ2UgPSBfLmxhc3Qoc29ydFJhbmdlcyhlbmNsb3NpbmdSYW5nZXMpKVxuICAgIGZvcndhcmRpbmdSYW5nZXMgPSBzb3J0UmFuZ2VzKGZvcndhcmRpbmdSYW5nZXMpXG5cbiAgICAjIFdoZW4gZW5jbG9zaW5nUmFuZ2UgaXMgZXhpc3RzLFxuICAgICMgV2UgZG9uJ3QgZ28gYWNyb3NzIGVuY2xvc2luZ1JhbmdlLmVuZC5cbiAgICAjIFNvIGNob29zZSBmcm9tIHJhbmdlcyBjb250YWluZWQgaW4gZW5jbG9zaW5nUmFuZ2UuXG4gICAgaWYgZW5jbG9zaW5nUmFuZ2VcbiAgICAgIGZvcndhcmRpbmdSYW5nZXMgPSBmb3J3YXJkaW5nUmFuZ2VzLmZpbHRlciAocmFuZ2UpIC0+XG4gICAgICAgIGVuY2xvc2luZ1JhbmdlLmNvbnRhaW5zUmFuZ2UocmFuZ2UpXG5cbiAgICBmb3J3YXJkaW5nUmFuZ2VzWzBdIG9yIGVuY2xvc2luZ1JhbmdlXG5cbmNsYXNzIEFBbnlQYWlyQWxsb3dGb3J3YXJkaW5nIGV4dGVuZHMgQW55UGFpckFsbG93Rm9yd2FyZGluZ1xuICBAZXh0ZW5kKClcbmNsYXNzIElubmVyQW55UGFpckFsbG93Rm9yd2FyZGluZyBleHRlbmRzIEFueVBhaXJBbGxvd0ZvcndhcmRpbmdcbiAgQGV4dGVuZCgpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgQW55UXVvdGUgZXh0ZW5kcyBBbnlQYWlyXG4gIEBleHRlbmQoZmFsc2UpXG4gIGFsbG93Rm9yd2FyZGluZzogdHJ1ZVxuICBtZW1iZXI6IFsnRG91YmxlUXVvdGUnLCAnU2luZ2xlUXVvdGUnLCAnQmFja1RpY2snXVxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICByYW5nZXMgPSBAZ2V0UmFuZ2VzKHNlbGVjdGlvbilcbiAgICAjIFBpY2sgcmFuZ2Ugd2hpY2ggZW5kLmNvbHVtIGlzIGxlZnRtb3N0KG1lYW4sIGNsb3NlZCBmaXJzdClcbiAgICBfLmZpcnN0KF8uc29ydEJ5KHJhbmdlcywgKHIpIC0+IHIuZW5kLmNvbHVtbikpIGlmIHJhbmdlcy5sZW5ndGhcblxuY2xhc3MgQUFueVF1b3RlIGV4dGVuZHMgQW55UXVvdGVcbiAgQGV4dGVuZCgpXG5jbGFzcyBJbm5lckFueVF1b3RlIGV4dGVuZHMgQW55UXVvdGVcbiAgQGV4dGVuZCgpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgUXVvdGUgZXh0ZW5kcyBQYWlyXG4gIEBleHRlbmQoZmFsc2UpXG4gIGFsbG93Rm9yd2FyZGluZzogdHJ1ZVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIERvdWJsZVF1b3RlIGV4dGVuZHMgUXVvdGVcbiAgQGV4dGVuZChmYWxzZSlcbiAgcGFpcjogWydcIicsICdcIiddXG5cbmNsYXNzIEFEb3VibGVRdW90ZSBleHRlbmRzIERvdWJsZVF1b3RlXG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJEb3VibGVRdW90ZSBleHRlbmRzIERvdWJsZVF1b3RlXG4gIEBleHRlbmQoKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFNpbmdsZVF1b3RlIGV4dGVuZHMgUXVvdGVcbiAgQGV4dGVuZChmYWxzZSlcbiAgcGFpcjogW1wiJ1wiLCBcIidcIl1cblxuY2xhc3MgQVNpbmdsZVF1b3RlIGV4dGVuZHMgU2luZ2xlUXVvdGVcbiAgQGV4dGVuZCgpXG5jbGFzcyBJbm5lclNpbmdsZVF1b3RlIGV4dGVuZHMgU2luZ2xlUXVvdGVcbiAgQGV4dGVuZCgpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgQmFja1RpY2sgZXh0ZW5kcyBRdW90ZVxuICBAZXh0ZW5kKGZhbHNlKVxuICBwYWlyOiBbJ2AnLCAnYCddXG5cbmNsYXNzIEFCYWNrVGljayBleHRlbmRzIEJhY2tUaWNrXG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJCYWNrVGljayBleHRlbmRzIEJhY2tUaWNrXG4gIEBleHRlbmQoKVxuXG4jIFBhaXIgZXhwYW5kcyBtdWx0aS1saW5lc1xuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBDdXJseUJyYWNrZXQgZXh0ZW5kcyBQYWlyXG4gIEBleHRlbmQoZmFsc2UpXG4gIHBhaXI6IFsneycsICd9J11cblxuY2xhc3MgQUN1cmx5QnJhY2tldCBleHRlbmRzIEN1cmx5QnJhY2tldFxuICBAZXh0ZW5kKClcbmNsYXNzIElubmVyQ3VybHlCcmFja2V0IGV4dGVuZHMgQ3VybHlCcmFja2V0XG4gIEBleHRlbmQoKVxuY2xhc3MgQUN1cmx5QnJhY2tldEFsbG93Rm9yd2FyZGluZyBleHRlbmRzIEN1cmx5QnJhY2tldFxuICBAZXh0ZW5kKClcbmNsYXNzIElubmVyQ3VybHlCcmFja2V0QWxsb3dGb3J3YXJkaW5nIGV4dGVuZHMgQ3VybHlCcmFja2V0XG4gIEBleHRlbmQoKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFNxdWFyZUJyYWNrZXQgZXh0ZW5kcyBQYWlyXG4gIEBleHRlbmQoZmFsc2UpXG4gIHBhaXI6IFsnWycsICddJ11cblxuY2xhc3MgQVNxdWFyZUJyYWNrZXQgZXh0ZW5kcyBTcXVhcmVCcmFja2V0XG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJTcXVhcmVCcmFja2V0IGV4dGVuZHMgU3F1YXJlQnJhY2tldFxuICBAZXh0ZW5kKClcbmNsYXNzIEFTcXVhcmVCcmFja2V0QWxsb3dGb3J3YXJkaW5nIGV4dGVuZHMgU3F1YXJlQnJhY2tldFxuICBAZXh0ZW5kKClcbmNsYXNzIElubmVyU3F1YXJlQnJhY2tldEFsbG93Rm9yd2FyZGluZyBleHRlbmRzIFNxdWFyZUJyYWNrZXRcbiAgQGV4dGVuZCgpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgUGFyZW50aGVzaXMgZXh0ZW5kcyBQYWlyXG4gIEBleHRlbmQoZmFsc2UpXG4gIHBhaXI6IFsnKCcsICcpJ11cblxuY2xhc3MgQVBhcmVudGhlc2lzIGV4dGVuZHMgUGFyZW50aGVzaXNcbiAgQGV4dGVuZCgpXG5jbGFzcyBJbm5lclBhcmVudGhlc2lzIGV4dGVuZHMgUGFyZW50aGVzaXNcbiAgQGV4dGVuZCgpXG5jbGFzcyBBUGFyZW50aGVzaXNBbGxvd0ZvcndhcmRpbmcgZXh0ZW5kcyBQYXJlbnRoZXNpc1xuICBAZXh0ZW5kKClcbmNsYXNzIElubmVyUGFyZW50aGVzaXNBbGxvd0ZvcndhcmRpbmcgZXh0ZW5kcyBQYXJlbnRoZXNpc1xuICBAZXh0ZW5kKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBBbmdsZUJyYWNrZXQgZXh0ZW5kcyBQYWlyXG4gIEBleHRlbmQoZmFsc2UpXG4gIHBhaXI6IFsnPCcsICc+J11cblxuY2xhc3MgQUFuZ2xlQnJhY2tldCBleHRlbmRzIEFuZ2xlQnJhY2tldFxuICBAZXh0ZW5kKClcbmNsYXNzIElubmVyQW5nbGVCcmFja2V0IGV4dGVuZHMgQW5nbGVCcmFja2V0XG4gIEBleHRlbmQoKVxuY2xhc3MgQUFuZ2xlQnJhY2tldEFsbG93Rm9yd2FyZGluZyBleHRlbmRzIEFuZ2xlQnJhY2tldFxuICBAZXh0ZW5kKClcbmNsYXNzIElubmVyQW5nbGVCcmFja2V0QWxsb3dGb3J3YXJkaW5nIGV4dGVuZHMgQW5nbGVCcmFja2V0XG4gIEBleHRlbmQoKVxuXG4jIFRhZ1xuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBUYWcgZXh0ZW5kcyBQYWlyXG4gIEBleHRlbmQoZmFsc2UpXG4gIGFsbG93TmV4dExpbmU6IHRydWVcbiAgYWxsb3dGb3J3YXJkaW5nOiB0cnVlXG4gIGFkanVzdElubmVyUmFuZ2U6IGZhbHNlXG5cbiAgZ2V0VGFnU3RhcnRQb2ludDogKGZyb20pIC0+XG4gICAgdGFnUmFuZ2UgPSBudWxsXG4gICAgcGF0dGVybiA9IFRhZ0ZpbmRlcjo6cGF0dGVyblxuICAgIEBzY2FuRm9yd2FyZCBwYXR0ZXJuLCB7ZnJvbTogW2Zyb20ucm93LCAwXX0sICh7cmFuZ2UsIHN0b3B9KSAtPlxuICAgICAgaWYgcmFuZ2UuY29udGFpbnNQb2ludChmcm9tLCB0cnVlKVxuICAgICAgICB0YWdSYW5nZSA9IHJhbmdlXG4gICAgICAgIHN0b3AoKVxuICAgIHRhZ1JhbmdlPy5zdGFydFxuXG4gIGdldEZpbmRlcjogLT5cbiAgICBuZXcgVGFnRmluZGVyKEBlZGl0b3IsIHthbGxvd05leHRMaW5lOiBAaXNBbGxvd05leHRMaW5lKCksIEBhbGxvd0ZvcndhcmRpbmd9KVxuXG4gIGdldFBhaXJJbmZvOiAoZnJvbSkgLT5cbiAgICBzdXBlcihAZ2V0VGFnU3RhcnRQb2ludChmcm9tKSA/IGZyb20pXG5cbmNsYXNzIEFUYWcgZXh0ZW5kcyBUYWdcbiAgQGV4dGVuZCgpXG5jbGFzcyBJbm5lclRhZyBleHRlbmRzIFRhZ1xuICBAZXh0ZW5kKClcblxuIyBQYXJhZ3JhcGhcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBQYXJhZ3JhcGggaXMgZGVmaW5lZCBhcyBjb25zZWN1dGl2ZSAobm9uLSlibGFuay1saW5lLlxuY2xhc3MgUGFyYWdyYXBoIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIHN1cHBvcnRDb3VudDogdHJ1ZVxuXG4gIGZpbmRSb3c6IChmcm9tUm93LCBkaXJlY3Rpb24sIGZuKSAtPlxuICAgIGZuLnJlc2V0PygpXG4gICAgZm91bmRSb3cgPSBmcm9tUm93XG4gICAgZm9yIHJvdyBpbiBnZXRCdWZmZXJSb3dzKEBlZGl0b3IsIHtzdGFydFJvdzogZnJvbVJvdywgZGlyZWN0aW9ufSlcbiAgICAgIGJyZWFrIHVubGVzcyBmbihyb3csIGRpcmVjdGlvbilcbiAgICAgIGZvdW5kUm93ID0gcm93XG5cbiAgICBmb3VuZFJvd1xuXG4gIGZpbmRSb3dSYW5nZUJ5OiAoZnJvbVJvdywgZm4pIC0+XG4gICAgc3RhcnRSb3cgPSBAZmluZFJvdyhmcm9tUm93LCAncHJldmlvdXMnLCBmbilcbiAgICBlbmRSb3cgPSBAZmluZFJvdyhmcm9tUm93LCAnbmV4dCcsIGZuKVxuICAgIFtzdGFydFJvdywgZW5kUm93XVxuXG4gIGdldFByZWRpY3RGdW5jdGlvbjogKGZyb21Sb3csIHNlbGVjdGlvbikgLT5cbiAgICBmcm9tUm93UmVzdWx0ID0gQGVkaXRvci5pc0J1ZmZlclJvd0JsYW5rKGZyb21Sb3cpXG5cbiAgICBpZiBAaXNJbm5lcigpXG4gICAgICBwcmVkaWN0ID0gKHJvdywgZGlyZWN0aW9uKSA9PlxuICAgICAgICBAZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsocm93KSBpcyBmcm9tUm93UmVzdWx0XG4gICAgZWxzZVxuICAgICAgaWYgc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuICAgICAgICBkaXJlY3Rpb25Ub0V4dGVuZCA9ICdwcmV2aW91cydcbiAgICAgIGVsc2VcbiAgICAgICAgZGlyZWN0aW9uVG9FeHRlbmQgPSAnbmV4dCdcblxuICAgICAgZmxpcCA9IGZhbHNlXG4gICAgICBwcmVkaWN0ID0gKHJvdywgZGlyZWN0aW9uKSA9PlxuICAgICAgICByZXN1bHQgPSBAZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsocm93KSBpcyBmcm9tUm93UmVzdWx0XG4gICAgICAgIGlmIGZsaXBcbiAgICAgICAgICBub3QgcmVzdWx0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBpZiAobm90IHJlc3VsdCkgYW5kIChkaXJlY3Rpb24gaXMgZGlyZWN0aW9uVG9FeHRlbmQpXG4gICAgICAgICAgICBmbGlwID0gdHJ1ZVxuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICByZXN1bHRcblxuICAgICAgcHJlZGljdC5yZXNldCA9IC0+XG4gICAgICAgIGZsaXAgPSBmYWxzZVxuICAgIHByZWRpY3RcblxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICBvcmlnaW5hbFJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICBmcm9tUm93ID0gQGdldE5vcm1hbGl6ZWRIZWFkQnVmZmVyUG9zaXRpb24oc2VsZWN0aW9uKS5yb3dcblxuICAgIGlmIEBpc01vZGUoJ3Zpc3VhbCcsICdsaW5ld2lzZScpXG4gICAgICBpZiBzZWxlY3Rpb24uaXNSZXZlcnNlZCgpXG4gICAgICAgIGZyb21Sb3ctLVxuICAgICAgZWxzZVxuICAgICAgICBmcm9tUm93KytcbiAgICAgIGZyb21Sb3cgPSBnZXRWYWxpZFZpbUJ1ZmZlclJvdyhAZWRpdG9yLCBmcm9tUm93KVxuXG4gICAgcm93UmFuZ2UgPSBAZmluZFJvd1JhbmdlQnkoZnJvbVJvdywgQGdldFByZWRpY3RGdW5jdGlvbihmcm9tUm93LCBzZWxlY3Rpb24pKVxuICAgIHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnVuaW9uKGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2UoQGVkaXRvciwgcm93UmFuZ2UpKVxuXG5jbGFzcyBBUGFyYWdyYXBoIGV4dGVuZHMgUGFyYWdyYXBoXG4gIEBleHRlbmQoKVxuY2xhc3MgSW5uZXJQYXJhZ3JhcGggZXh0ZW5kcyBQYXJhZ3JhcGhcbiAgQGV4dGVuZCgpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgSW5kZW50YXRpb24gZXh0ZW5kcyBQYXJhZ3JhcGhcbiAgQGV4dGVuZChmYWxzZSlcblxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICBmcm9tUm93ID0gQGdldE5vcm1hbGl6ZWRIZWFkQnVmZmVyUG9zaXRpb24oc2VsZWN0aW9uKS5yb3dcblxuICAgIGJhc2VJbmRlbnRMZXZlbCA9IGdldEluZGVudExldmVsRm9yQnVmZmVyUm93KEBlZGl0b3IsIGZyb21Sb3cpXG4gICAgcHJlZGljdCA9IChyb3cpID0+XG4gICAgICBpZiBAZWRpdG9yLmlzQnVmZmVyUm93Qmxhbmsocm93KVxuICAgICAgICBAaXNBKClcbiAgICAgIGVsc2VcbiAgICAgICAgZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3coQGVkaXRvciwgcm93KSA+PSBiYXNlSW5kZW50TGV2ZWxcblxuICAgIHJvd1JhbmdlID0gQGZpbmRSb3dSYW5nZUJ5KGZyb21Sb3csIHByZWRpY3QpXG4gICAgZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShAZWRpdG9yLCByb3dSYW5nZSlcblxuY2xhc3MgQUluZGVudGF0aW9uIGV4dGVuZHMgSW5kZW50YXRpb25cbiAgQGV4dGVuZCgpXG5jbGFzcyBJbm5lckluZGVudGF0aW9uIGV4dGVuZHMgSW5kZW50YXRpb25cbiAgQGV4dGVuZCgpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgQ29tbWVudCBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZChmYWxzZSlcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIHJvdyA9IHN3cmFwKHNlbGVjdGlvbikuZ2V0U3RhcnRSb3coKVxuICAgIHJvd1JhbmdlID0gQGVkaXRvci5sYW5ndWFnZU1vZGUucm93UmFuZ2VGb3JDb21tZW50QXRCdWZmZXJSb3cocm93KVxuICAgIHJvd1JhbmdlID89IFtyb3csIHJvd10gaWYgQGVkaXRvci5pc0J1ZmZlclJvd0NvbW1lbnRlZChyb3cpXG4gICAgaWYgcm93UmFuZ2VcbiAgICAgIGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2Uoc2VsZWN0aW9uLmVkaXRvciwgcm93UmFuZ2UpXG5cbmNsYXNzIEFDb21tZW50IGV4dGVuZHMgQ29tbWVudFxuICBAZXh0ZW5kKClcbmNsYXNzIElubmVyQ29tbWVudCBleHRlbmRzIENvbW1lbnRcbiAgQGV4dGVuZCgpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgRm9sZCBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZChmYWxzZSlcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuXG4gIGFkanVzdFJvd1JhbmdlOiAocm93UmFuZ2UpIC0+XG4gICAgcmV0dXJuIHJvd1JhbmdlIHVubGVzcyBAaXNJbm5lcigpXG5cbiAgICBbc3RhcnRSb3csIGVuZFJvd10gPSByb3dSYW5nZVxuICAgIHN0YXJ0Um93SW5kZW50TGV2ZWwgPSBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdyhAZWRpdG9yLCBzdGFydFJvdylcbiAgICBlbmRSb3dJbmRlbnRMZXZlbCA9IGdldEluZGVudExldmVsRm9yQnVmZmVyUm93KEBlZGl0b3IsIGVuZFJvdylcbiAgICBlbmRSb3cgLT0gMSBpZiAoc3RhcnRSb3dJbmRlbnRMZXZlbCBpcyBlbmRSb3dJbmRlbnRMZXZlbClcbiAgICBzdGFydFJvdyArPSAxXG4gICAgW3N0YXJ0Um93LCBlbmRSb3ddXG5cbiAgZ2V0Rm9sZFJvd1Jhbmdlc0NvbnRhaW5zRm9yUm93OiAocm93KSAtPlxuICAgIGdldENvZGVGb2xkUm93UmFuZ2VzQ29udGFpbmVzRm9yUm93KEBlZGl0b3IsIHJvdywgaW5jbHVkZVN0YXJ0Um93OiB0cnVlKS5yZXZlcnNlKClcblxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICByb3dSYW5nZXMgPSBAZ2V0Rm9sZFJvd1Jhbmdlc0NvbnRhaW5zRm9yUm93KHN3cmFwKHNlbGVjdGlvbikuZ2V0U3RhcnRSb3coKSlcbiAgICByZXR1cm4gdW5sZXNzIHJvd1Jhbmdlcy5sZW5ndGhcblxuICAgIHJhbmdlID0gZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZShAZWRpdG9yLCBAYWRqdXN0Um93UmFuZ2Uocm93UmFuZ2VzLnNoaWZ0KCkpKVxuICAgIGlmIHJvd1Jhbmdlcy5sZW5ndGggYW5kIHJhbmdlLmlzRXF1YWwoc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkpXG4gICAgICByYW5nZSA9IGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2UoQGVkaXRvciwgQGFkanVzdFJvd1JhbmdlKHJvd1Jhbmdlcy5zaGlmdCgpKSlcbiAgICByYW5nZVxuXG5jbGFzcyBBRm9sZCBleHRlbmRzIEZvbGRcbiAgQGV4dGVuZCgpXG5jbGFzcyBJbm5lckZvbGQgZXh0ZW5kcyBGb2xkXG4gIEBleHRlbmQoKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgTk9URTogRnVuY3Rpb24gcmFuZ2UgZGV0ZXJtaW5hdGlvbiBpcyBkZXBlbmRpbmcgb24gZm9sZC5cbmNsYXNzIEZ1bmN0aW9uIGV4dGVuZHMgRm9sZFxuICBAZXh0ZW5kKGZhbHNlKVxuXG4gICMgU29tZSBsYW5ndWFnZSBkb24ndCBpbmNsdWRlIGNsb3NpbmcgYH1gIGludG8gZm9sZC5cbiAgc2NvcGVOYW1lc09taXR0aW5nRW5kUm93OiBbJ3NvdXJjZS5nbycsICdzb3VyY2UuZWxpeGlyJ11cblxuICBnZXRGb2xkUm93UmFuZ2VzQ29udGFpbnNGb3JSb3c6IChyb3cpIC0+XG4gICAgcm93UmFuZ2VzID0gZ2V0Q29kZUZvbGRSb3dSYW5nZXNDb250YWluZXNGb3JSb3coQGVkaXRvciwgcm93KT8ucmV2ZXJzZSgpXG4gICAgcm93UmFuZ2VzPy5maWx0ZXIgKHJvd1JhbmdlKSA9PlxuICAgICAgaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvdyhAZWRpdG9yLCByb3dSYW5nZVswXSlcblxuICBhZGp1c3RSb3dSYW5nZTogKHJvd1JhbmdlKSAtPlxuICAgIFtzdGFydFJvdywgZW5kUm93XSA9IHN1cGVyXG4gICAgaWYgQGlzQSgpIGFuZCBAZWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUgaW4gQHNjb3BlTmFtZXNPbWl0dGluZ0VuZFJvd1xuICAgICAgZW5kUm93ICs9IDFcbiAgICBbc3RhcnRSb3csIGVuZFJvd11cblxuY2xhc3MgQUZ1bmN0aW9uIGV4dGVuZHMgRnVuY3Rpb25cbiAgQGV4dGVuZCgpXG5jbGFzcyBJbm5lckZ1bmN0aW9uIGV4dGVuZHMgRnVuY3Rpb25cbiAgQGV4dGVuZCgpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgQ3VycmVudExpbmUgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIHJvdyA9IEBnZXROb3JtYWxpemVkSGVhZEJ1ZmZlclBvc2l0aW9uKHNlbGVjdGlvbikucm93XG4gICAgcmFuZ2UgPSBAZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHJvdylcbiAgICBpZiBAaXNBKClcbiAgICAgIHJhbmdlXG4gICAgZWxzZVxuICAgICAgdHJpbVJhbmdlKEBlZGl0b3IsIHJhbmdlKVxuXG5jbGFzcyBBQ3VycmVudExpbmUgZXh0ZW5kcyBDdXJyZW50TGluZVxuICBAZXh0ZW5kKClcbmNsYXNzIElubmVyQ3VycmVudExpbmUgZXh0ZW5kcyBDdXJyZW50TGluZVxuICBAZXh0ZW5kKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBFbnRpcmUgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgQHN0b3BTZWxlY3Rpb24oKVxuICAgIEBlZGl0b3IuYnVmZmVyLmdldFJhbmdlKClcblxuY2xhc3MgQUVudGlyZSBleHRlbmRzIEVudGlyZVxuICBAZXh0ZW5kKClcbmNsYXNzIElubmVyRW50aXJlIGV4dGVuZHMgRW50aXJlXG4gIEBleHRlbmQoKVxuY2xhc3MgQWxsIGV4dGVuZHMgRW50aXJlICMgQWxpYXMgYXMgYWNjZXNzaWJsZSBuYW1lXG4gIEBleHRlbmQoZmFsc2UpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgRW1wdHkgZXh0ZW5kcyBUZXh0T2JqZWN0XG4gIEBleHRlbmQoZmFsc2UpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgTGF0ZXN0Q2hhbmdlIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuICBnZXRSYW5nZTogLT5cbiAgICBAc3RvcFNlbGVjdGlvbigpXG4gICAgQHZpbVN0YXRlLm1hcmsuZ2V0UmFuZ2UoJ1snLCAnXScpXG5cbmNsYXNzIEFMYXRlc3RDaGFuZ2UgZXh0ZW5kcyBMYXRlc3RDaGFuZ2VcbiAgQGV4dGVuZCgpXG5jbGFzcyBJbm5lckxhdGVzdENoYW5nZSBleHRlbmRzIExhdGVzdENoYW5nZSAjIE5vIGRpZmYgZnJvbSBBTGF0ZXN0Q2hhbmdlXG4gIEBleHRlbmQoKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFNlYXJjaE1hdGNoRm9yd2FyZCBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZCgpXG4gIGJhY2t3YXJkOiBmYWxzZVxuXG4gIGZpbmRNYXRjaDogKGZyb21Qb2ludCwgcGF0dGVybikgLT5cbiAgICBmcm9tUG9pbnQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAoQGVkaXRvciwgZnJvbVBvaW50LCBcImZvcndhcmRcIikgaWYgQGlzTW9kZSgndmlzdWFsJylcbiAgICBmb3VuZCA9IG51bGxcbiAgICBAc2NhbkZvcndhcmQgcGF0dGVybiwge2Zyb206IFtmcm9tUG9pbnQucm93LCAwXX0sICh7cmFuZ2UsIHN0b3B9KSAtPlxuICAgICAgaWYgcmFuZ2UuZW5kLmlzR3JlYXRlclRoYW4oZnJvbVBvaW50KVxuICAgICAgICBmb3VuZCA9IHJhbmdlXG4gICAgICAgIHN0b3AoKVxuICAgIHtyYW5nZTogZm91bmQsIHdoaWNoSXNIZWFkOiAnZW5kJ31cblxuICBnZXRSYW5nZTogKHNlbGVjdGlvbikgLT5cbiAgICBwYXR0ZXJuID0gQGdsb2JhbFN0YXRlLmdldCgnbGFzdFNlYXJjaFBhdHRlcm4nKVxuICAgIHJldHVybiB1bmxlc3MgcGF0dGVybj9cblxuICAgIGZyb21Qb2ludCA9IHNlbGVjdGlvbi5nZXRIZWFkQnVmZmVyUG9zaXRpb24oKVxuICAgIHtyYW5nZSwgd2hpY2hJc0hlYWR9ID0gQGZpbmRNYXRjaChmcm9tUG9pbnQsIHBhdHRlcm4pXG4gICAgaWYgcmFuZ2U/XG4gICAgICBAdW5pb25SYW5nZUFuZERldGVybWluZVJldmVyc2VkU3RhdGUoc2VsZWN0aW9uLCByYW5nZSwgd2hpY2hJc0hlYWQpXG5cbiAgdW5pb25SYW5nZUFuZERldGVybWluZVJldmVyc2VkU3RhdGU6IChzZWxlY3Rpb24sIGZvdW5kLCB3aGljaElzSGVhZCkgLT5cbiAgICBpZiBzZWxlY3Rpb24uaXNFbXB0eSgpXG4gICAgICBmb3VuZFxuICAgIGVsc2VcbiAgICAgIGhlYWQgPSBmb3VuZFt3aGljaElzSGVhZF1cbiAgICAgIHRhaWwgPSBzZWxlY3Rpb24uZ2V0VGFpbEJ1ZmZlclBvc2l0aW9uKClcblxuICAgICAgaWYgQGJhY2t3YXJkXG4gICAgICAgIGhlYWQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAoQGVkaXRvciwgaGVhZCwgJ2ZvcndhcmQnKSBpZiB0YWlsLmlzTGVzc1RoYW4oaGVhZClcbiAgICAgIGVsc2VcbiAgICAgICAgaGVhZCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcChAZWRpdG9yLCBoZWFkLCAnYmFja3dhcmQnKSBpZiBoZWFkLmlzTGVzc1RoYW4odGFpbClcblxuICAgICAgQHJldmVyc2VkID0gaGVhZC5pc0xlc3NUaGFuKHRhaWwpXG4gICAgICBuZXcgUmFuZ2UodGFpbCwgaGVhZCkudW5pb24oc3dyYXAoc2VsZWN0aW9uKS5nZXRUYWlsQnVmZmVyUmFuZ2UoKSlcblxuICBzZWxlY3RUZXh0T2JqZWN0OiAoc2VsZWN0aW9uKSAtPlxuICAgIHJldHVybiB1bmxlc3MgcmFuZ2UgPSBAZ2V0UmFuZ2Uoc2VsZWN0aW9uKVxuICAgIHN3cmFwKHNlbGVjdGlvbikuc2V0QnVmZmVyUmFuZ2UocmFuZ2UsIHtyZXZlcnNlZDogQHJldmVyc2VkID8gQGJhY2t3YXJkfSlcbiAgICBzZWxlY3Rpb24uY3Vyc29yLmF1dG9zY3JvbGwoKVxuICAgIHRydWVcblxuY2xhc3MgU2VhcmNoTWF0Y2hCYWNrd2FyZCBleHRlbmRzIFNlYXJjaE1hdGNoRm9yd2FyZFxuICBAZXh0ZW5kKClcbiAgYmFja3dhcmQ6IHRydWVcblxuICBmaW5kTWF0Y2g6IChmcm9tUG9pbnQsIHBhdHRlcm4pIC0+XG4gICAgZnJvbVBvaW50ID0gdHJhbnNsYXRlUG9pbnRBbmRDbGlwKEBlZGl0b3IsIGZyb21Qb2ludCwgXCJiYWNrd2FyZFwiKSBpZiBAaXNNb2RlKCd2aXN1YWwnKVxuICAgIGZvdW5kID0gbnVsbFxuICAgIEBzY2FuQmFja3dhcmQgcGF0dGVybiwge2Zyb206IFtmcm9tUG9pbnQucm93LCBJbmZpbml0eV19LCAoe3JhbmdlLCBzdG9wfSkgLT5cbiAgICAgIGlmIHJhbmdlLnN0YXJ0LmlzTGVzc1RoYW4oZnJvbVBvaW50KVxuICAgICAgICBmb3VuZCA9IHJhbmdlXG4gICAgICAgIHN0b3AoKVxuICAgIHtyYW5nZTogZm91bmQsIHdoaWNoSXNIZWFkOiAnc3RhcnQnfVxuXG4jIFtMaW1pdGF0aW9uOiB3b24ndCBmaXhdOiBTZWxlY3RlZCByYW5nZSBpcyBub3Qgc3VibW9kZSBhd2FyZS4gYWx3YXlzIGNoYXJhY3Rlcndpc2UuXG4jIFNvIGV2ZW4gaWYgb3JpZ2luYWwgc2VsZWN0aW9uIHdhcyB2TCBvciB2Qiwgc2VsZWN0ZWQgcmFuZ2UgYnkgdGhpcyB0ZXh0LW9iamVjdFxuIyBpcyBhbHdheXMgdkMgcmFuZ2UuXG5jbGFzcyBQcmV2aW91c1NlbGVjdGlvbiBleHRlbmRzIFRleHRPYmplY3RcbiAgQGV4dGVuZCgpXG5cbiAgc2VsZWN0OiAtPlxuICAgIHtwcm9wZXJ0aWVzLCBzdWJtb2RlfSA9IEB2aW1TdGF0ZS5wcmV2aW91c1NlbGVjdGlvblxuICAgIGlmIHByb3BlcnRpZXM/IGFuZCBzdWJtb2RlP1xuICAgICAgc2VsZWN0aW9uID0gQGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKClcbiAgICAgIHN3cmFwKHNlbGVjdGlvbikuc2VsZWN0QnlQcm9wZXJ0aWVzKHByb3BlcnRpZXMsIGtlZXBHb2FsQ29sdW1uOiBmYWxzZSlcbiAgICAgIEB3aXNlID0gc3VibW9kZVxuXG5jbGFzcyBQZXJzaXN0ZW50U2VsZWN0aW9uIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuXG4gIHNlbGVjdDogLT5cbiAgICB7cGVyc2lzdGVudFNlbGVjdGlvbn0gPSBAdmltU3RhdGVcbiAgICB1bmxlc3MgcGVyc2lzdGVudFNlbGVjdGlvbi5pc0VtcHR5KClcbiAgICAgIHBlcnNpc3RlbnRTZWxlY3Rpb24uc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXMoKVxuICAgICAgQHdpc2UgPSBzd3JhcC5kZXRlY3RXaXNlKEBlZGl0b3IpXG5cbmNsYXNzIEFQZXJzaXN0ZW50U2VsZWN0aW9uIGV4dGVuZHMgUGVyc2lzdGVudFNlbGVjdGlvblxuICBAZXh0ZW5kKClcbmNsYXNzIElubmVyUGVyc2lzdGVudFNlbGVjdGlvbiBleHRlbmRzIFBlcnNpc3RlbnRTZWxlY3Rpb25cbiAgQGV4dGVuZCgpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgVmlzaWJsZUFyZWEgZXh0ZW5kcyBUZXh0T2JqZWN0ICMgODIyIHRvIDg2M1xuICBAZXh0ZW5kKGZhbHNlKVxuXG4gIGdldFJhbmdlOiAoc2VsZWN0aW9uKSAtPlxuICAgIEBzdG9wU2VsZWN0aW9uKClcbiAgICAjIFtCVUc/XSBOZWVkIHRyYW5zbGF0ZSB0byBzaGlsbmsgdG9wIGFuZCBib3R0b20gdG8gZml0IGFjdHVhbCByb3cuXG4gICAgIyBUaGUgcmVhc29uIEkgbmVlZCAtMiBhdCBib3R0b20gaXMgYmVjYXVzZSBvZiBzdGF0dXMgYmFyP1xuICAgIGJ1ZmZlclJhbmdlID0gZ2V0VmlzaWJsZUJ1ZmZlclJhbmdlKEBlZGl0b3IpXG4gICAgaWYgYnVmZmVyUmFuZ2UuZ2V0Um93cygpID4gQGVkaXRvci5nZXRSb3dzUGVyUGFnZSgpXG4gICAgICBidWZmZXJSYW5nZS50cmFuc2xhdGUoWysxLCAwXSwgWy0zLCAwXSlcbiAgICBlbHNlXG4gICAgICBidWZmZXJSYW5nZVxuXG5jbGFzcyBBVmlzaWJsZUFyZWEgZXh0ZW5kcyBWaXNpYmxlQXJlYVxuICBAZXh0ZW5kKClcbmNsYXNzIElubmVyVmlzaWJsZUFyZWEgZXh0ZW5kcyBWaXNpYmxlQXJlYVxuICBAZXh0ZW5kKClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIFtGSVhNRV0gd2lzZSBtaXNtYXRjaCBzY2VlblBvc2l0aW9uIHZzIGJ1ZmZlclBvc2l0aW9uXG5jbGFzcyBFZGdlIGV4dGVuZHMgVGV4dE9iamVjdFxuICBAZXh0ZW5kKGZhbHNlKVxuICB3aXNlOiAnbGluZXdpc2UnXG5cbiAgZ2V0UmFuZ2U6IChzZWxlY3Rpb24pIC0+XG4gICAgZnJvbVBvaW50ID0gQGdldE5vcm1hbGl6ZWRIZWFkU2NyZWVuUG9zaXRpb24oc2VsZWN0aW9uKVxuXG4gICAgbW92ZVVwVG9FZGdlID0gQG5ldygnTW92ZVVwVG9FZGdlJylcbiAgICBtb3ZlRG93blRvRWRnZSA9IEBuZXcoJ01vdmVEb3duVG9FZGdlJylcbiAgICByZXR1cm4gdW5sZXNzIG1vdmVVcFRvRWRnZS5pc1N0b3BwYWJsZVBvaW50KGZyb21Qb2ludClcblxuICAgIHN0YXJ0U2NyZWVuUG9pbnQgPSBlbmRTY3JlZW5Qb2ludCA9IG51bGxcbiAgICBzdGFydFNjcmVlblBvaW50ID0gZW5kU2NyZWVuUG9pbnQgPSBmcm9tUG9pbnQgaWYgbW92ZVVwVG9FZGdlLmlzRWRnZShmcm9tUG9pbnQpXG5cbiAgICBpZiBtb3ZlVXBUb0VkZ2UuaXNTdG9wcGFibGVQb2ludChmcm9tUG9pbnQudHJhbnNsYXRlKFstMSwgMF0pKVxuICAgICAgc3RhcnRTY3JlZW5Qb2ludCA9IG1vdmVVcFRvRWRnZS5nZXRQb2ludChmcm9tUG9pbnQpXG5cbiAgICBpZiBtb3ZlRG93blRvRWRnZS5pc1N0b3BwYWJsZVBvaW50KGZyb21Qb2ludC50cmFuc2xhdGUoWysxLCAwXSkpXG4gICAgICBlbmRTY3JlZW5Qb2ludCA9IG1vdmVEb3duVG9FZGdlLmdldFBvaW50KGZyb21Qb2ludClcblxuICAgIGlmIHN0YXJ0U2NyZWVuUG9pbnQ/IGFuZCBlbmRTY3JlZW5Qb2ludD9cbiAgICAgIHNjcmVlblJhbmdlID0gbmV3IFJhbmdlKHN0YXJ0U2NyZWVuUG9pbnQsIGVuZFNjcmVlblBvaW50KVxuICAgICAgcmFuZ2UgPSBAZWRpdG9yLmJ1ZmZlclJhbmdlRm9yU2NyZWVuUmFuZ2Uoc2NyZWVuUmFuZ2UpXG4gICAgICBnZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlKEBlZGl0b3IsIFtyYW5nZS5zdGFydC5yb3csIHJhbmdlLmVuZC5yb3ddKVxuXG5jbGFzcyBBRWRnZSBleHRlbmRzIEVkZ2VcbiAgQGV4dGVuZCgpXG5jbGFzcyBJbm5lckVkZ2UgZXh0ZW5kcyBFZGdlXG4gIEBleHRlbmQoKVxuIl19
