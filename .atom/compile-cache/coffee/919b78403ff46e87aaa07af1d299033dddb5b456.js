(function() {
  var BracketFinder, PairFinder, QuoteFinder, Range, ScopeState, TagFinder, _, collectRangeInBufferRow, getCharacterRangeInformation, getEndOfLineForBufferRow, getLineTextToBufferPosition, isEscapedCharRange, ref, scanEditorInDirection,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Range = require('atom').Range;

  _ = require('underscore-plus');

  ref = require('./utils'), isEscapedCharRange = ref.isEscapedCharRange, getEndOfLineForBufferRow = ref.getEndOfLineForBufferRow, collectRangeInBufferRow = ref.collectRangeInBufferRow, scanEditorInDirection = ref.scanEditorInDirection, getLineTextToBufferPosition = ref.getLineTextToBufferPosition;

  getCharacterRangeInformation = function(editor, point, char) {
    var balanced, left, pattern, ref1, right, total;
    pattern = RegExp("" + (_.escapeRegExp(char)), "g");
    total = collectRangeInBufferRow(editor, point.row, pattern).filter(function(range) {
      return !isEscapedCharRange(editor, range);
    });
    ref1 = _.partition(total, function(arg) {
      var start;
      start = arg.start;
      return start.isLessThan(point);
    }), left = ref1[0], right = ref1[1];
    balanced = (total.length % 2) === 0;
    return {
      total: total,
      left: left,
      right: right,
      balanced: balanced
    };
  };

  ScopeState = (function() {
    function ScopeState(editor1, point) {
      this.editor = editor1;
      this.state = this.getScopeStateForBufferPosition(point);
    }

    ScopeState.prototype.getScopeStateForBufferPosition = function(point) {
      var scopes;
      scopes = this.editor.scopeDescriptorForBufferPosition(point).getScopesArray();
      return {
        inString: scopes.some(function(scope) {
          return scope.startsWith('string.');
        }),
        inComment: scopes.some(function(scope) {
          return scope.startsWith('comment.');
        }),
        inDoubleQuotes: this.isInDoubleQuotes(point)
      };
    };

    ScopeState.prototype.isInDoubleQuotes = function(point) {
      var balanced, left, ref1, total;
      ref1 = getCharacterRangeInformation(this.editor, point, '"'), total = ref1.total, left = ref1.left, balanced = ref1.balanced;
      if (total.length === 0 || !balanced) {
        return false;
      } else {
        return left.length % 2 === 1;
      }
    };

    ScopeState.prototype.isEqual = function(other) {
      return _.isEqual(this.state, other.state);
    };

    ScopeState.prototype.isInNormalCodeArea = function() {
      return !(this.state.inString || this.state.inComment || this.state.inDoubleQuotes);
    };

    return ScopeState;

  })();

  PairFinder = (function() {
    function PairFinder(editor1, options) {
      this.editor = editor1;
      if (options == null) {
        options = {};
      }
      this.allowNextLine = options.allowNextLine, this.allowForwarding = options.allowForwarding, this.pair = options.pair;
      if (this.pair != null) {
        this.setPatternForPair(this.pair);
      }
    }

    PairFinder.prototype.getPattern = function() {
      return this.pattern;
    };

    PairFinder.prototype.filterEvent = function() {
      return true;
    };

    PairFinder.prototype.findPair = function(which, direction, from) {
      var findingNonForwardingClosingQuote, found, scanner, stack;
      stack = [];
      found = null;
      findingNonForwardingClosingQuote = (this instanceof QuoteFinder) && which === 'close' && !this.allowForwarding;
      scanner = scanEditorInDirection.bind(null, this.editor, direction, this.getPattern(), {
        from: from,
        allowNextLine: this.allowNextLine
      });
      scanner((function(_this) {
        return function(event) {
          var eventState, range, stop;
          range = event.range, stop = event.stop;
          if (isEscapedCharRange(_this.editor, range)) {
            return;
          }
          if (!_this.filterEvent(event)) {
            return;
          }
          eventState = _this.getEventState(event);
          if (findingNonForwardingClosingQuote && eventState.state === 'open' && range.start.isGreaterThan(from)) {
            stop();
            return;
          }
          if (eventState.state !== which) {
            return stack.push(eventState);
          } else {
            if (_this.onFound(stack, {
              eventState: eventState,
              from: from
            })) {
              found = range;
              return stop();
            }
          }
        };
      })(this));
      return found;
    };

    PairFinder.prototype.spliceStack = function(stack, eventState) {
      return stack.pop();
    };

    PairFinder.prototype.onFound = function(stack, arg) {
      var eventState, from, openRange, openState;
      eventState = arg.eventState, from = arg.from;
      switch (eventState.state) {
        case 'open':
          this.spliceStack(stack, eventState);
          return stack.length === 0;
        case 'close':
          openState = this.spliceStack(stack, eventState);
          if (openState == null) {
            return true;
          }
          if (stack.length === 0) {
            openRange = openState.range;
            return openRange.start.isEqual(from) || (this.allowForwarding && openRange.start.row === from.row);
          }
      }
    };

    PairFinder.prototype.findCloseForward = function(from) {
      return this.findPair('close', 'forward', from);
    };

    PairFinder.prototype.findOpenBackward = function(from) {
      return this.findPair('open', 'backward', from);
    };

    PairFinder.prototype.find = function(from) {
      var closeRange, openRange;
      closeRange = this.closeRange = this.findCloseForward(from);
      if (closeRange != null) {
        openRange = this.findOpenBackward(closeRange.end);
      }
      if ((closeRange != null) && (openRange != null)) {
        return {
          aRange: new Range(openRange.start, closeRange.end),
          innerRange: new Range(openRange.end, closeRange.start),
          openRange: openRange,
          closeRange: closeRange
        };
      }
    };

    return PairFinder;

  })();

  BracketFinder = (function(superClass) {
    extend(BracketFinder, superClass);

    function BracketFinder() {
      return BracketFinder.__super__.constructor.apply(this, arguments);
    }

    BracketFinder.prototype.retry = false;

    BracketFinder.prototype.setPatternForPair = function(pair) {
      var close, open;
      open = pair[0], close = pair[1];
      return this.pattern = RegExp("(" + (_.escapeRegExp(open)) + ")|(" + (_.escapeRegExp(close)) + ")", "g");
    };

    BracketFinder.prototype.find = function(from) {
      var found, ref1;
      if (this.initialScope == null) {
        this.initialScope = new ScopeState(this.editor, from);
      }
      if (found = BracketFinder.__super__.find.apply(this, arguments)) {
        return found;
      }
      if (!this.retry) {
        this.retry = true;
        ref1 = [], this.closeRange = ref1[0], this.closeRangeScope = ref1[1];
        return this.find(from);
      }
    };

    BracketFinder.prototype.filterEvent = function(arg) {
      var range, scope;
      range = arg.range;
      scope = new ScopeState(this.editor, range.start);
      if (!this.closeRange) {
        if (!this.retry) {
          return this.initialScope.isEqual(scope);
        } else {
          if (this.initialScope.isInNormalCodeArea()) {
            return !scope.isInNormalCodeArea();
          } else {
            return scope.isInNormalCodeArea();
          }
        }
      } else {
        if (this.closeRangeScope == null) {
          this.closeRangeScope = new ScopeState(this.editor, this.closeRange.start);
        }
        return this.closeRangeScope.isEqual(scope);
      }
    };

    BracketFinder.prototype.getEventState = function(arg) {
      var match, range, state;
      match = arg.match, range = arg.range;
      state = (function() {
        switch (false) {
          case !match[1]:
            return 'open';
          case !match[2]:
            return 'close';
        }
      })();
      return {
        state: state,
        range: range
      };
    };

    return BracketFinder;

  })(PairFinder);

  QuoteFinder = (function(superClass) {
    extend(QuoteFinder, superClass);

    function QuoteFinder() {
      return QuoteFinder.__super__.constructor.apply(this, arguments);
    }

    QuoteFinder.prototype.setPatternForPair = function(pair) {
      this.quoteChar = pair[0];
      return this.pattern = RegExp("(" + (_.escapeRegExp(pair[0])) + ")", "g");
    };

    QuoteFinder.prototype.find = function(from) {
      var balanced, left, nextQuoteIsOpen, onQuoteChar, ref1, ref2, right, total;
      ref1 = getCharacterRangeInformation(this.editor, from, this.quoteChar), total = ref1.total, left = ref1.left, right = ref1.right, balanced = ref1.balanced;
      onQuoteChar = (ref2 = right[0]) != null ? ref2.start.isEqual(from) : void 0;
      if (balanced && onQuoteChar) {
        nextQuoteIsOpen = left.length % 2 === 0;
      } else {
        nextQuoteIsOpen = left.length === 0;
      }
      if (nextQuoteIsOpen) {
        this.pairStates = ['open', 'close', 'close', 'open'];
      } else {
        this.pairStates = ['close', 'close', 'open'];
      }
      return QuoteFinder.__super__.find.apply(this, arguments);
    };

    QuoteFinder.prototype.getEventState = function(arg) {
      var range, state;
      range = arg.range;
      state = this.pairStates.shift();
      return {
        state: state,
        range: range
      };
    };

    return QuoteFinder;

  })(PairFinder);

  TagFinder = (function(superClass) {
    extend(TagFinder, superClass);

    function TagFinder() {
      return TagFinder.__super__.constructor.apply(this, arguments);
    }

    TagFinder.prototype.pattern = /<(\/?)([^\s>]+)[^>]*>/g;

    TagFinder.prototype.lineTextToPointContainsNonWhiteSpace = function(point) {
      return /\S/.test(getLineTextToBufferPosition(this.editor, point));
    };

    TagFinder.prototype.find = function(from) {
      var found, tagStart;
      found = TagFinder.__super__.find.apply(this, arguments);
      if ((found != null) && this.allowForwarding) {
        tagStart = found.aRange.start;
        if (tagStart.isGreaterThan(from) && this.lineTextToPointContainsNonWhiteSpace(tagStart)) {
          this.allowForwarding = false;
          return this.find(from);
        }
      }
      return found;
    };

    TagFinder.prototype.getEventState = function(event) {
      var backslash;
      backslash = event.match[1];
      return {
        state: backslash === '' ? 'open' : 'close',
        name: event.match[2],
        range: event.range
      };
    };

    TagFinder.prototype.findPairState = function(stack, arg) {
      var i, name, state;
      name = arg.name;
      for (i = stack.length - 1; i >= 0; i += -1) {
        state = stack[i];
        if (state.name === name) {
          return state;
        }
      }
    };

    TagFinder.prototype.spliceStack = function(stack, eventState) {
      var pairEventState;
      if (pairEventState = this.findPairState(stack, eventState)) {
        stack.splice(stack.indexOf(pairEventState));
      }
      return pairEventState;
    };

    return TagFinder;

  })(PairFinder);

  module.exports = {
    BracketFinder: BracketFinder,
    QuoteFinder: QuoteFinder,
    TagFinder: TagFinder
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvcGFpci1maW5kZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxxT0FBQTtJQUFBOzs7RUFBQyxRQUFTLE9BQUEsQ0FBUSxNQUFSOztFQUNWLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFNSSxPQUFBLENBQVEsU0FBUixDQU5KLEVBQ0UsMkNBREYsRUFFRSx1REFGRixFQUdFLHFEQUhGLEVBSUUsaURBSkYsRUFLRTs7RUFHRiw0QkFBQSxHQUErQixTQUFDLE1BQUQsRUFBUyxLQUFULEVBQWdCLElBQWhCO0FBQzdCLFFBQUE7SUFBQSxPQUFBLEdBQVUsTUFBQSxDQUFBLEVBQUEsR0FBSSxDQUFDLENBQUMsQ0FBQyxZQUFGLENBQWUsSUFBZixDQUFELENBQUosRUFBNkIsR0FBN0I7SUFDVixLQUFBLEdBQVEsdUJBQUEsQ0FBd0IsTUFBeEIsRUFBZ0MsS0FBSyxDQUFDLEdBQXRDLEVBQTJDLE9BQTNDLENBQW1ELENBQUMsTUFBcEQsQ0FBMkQsU0FBQyxLQUFEO2FBQ2pFLENBQUksa0JBQUEsQ0FBbUIsTUFBbkIsRUFBMkIsS0FBM0I7SUFENkQsQ0FBM0Q7SUFFUixPQUFnQixDQUFDLENBQUMsU0FBRixDQUFZLEtBQVosRUFBbUIsU0FBQyxHQUFEO0FBQWEsVUFBQTtNQUFYLFFBQUQ7YUFBWSxLQUFLLENBQUMsVUFBTixDQUFpQixLQUFqQjtJQUFiLENBQW5CLENBQWhCLEVBQUMsY0FBRCxFQUFPO0lBQ1AsUUFBQSxHQUFXLENBQUMsS0FBSyxDQUFDLE1BQU4sR0FBZSxDQUFoQixDQUFBLEtBQXNCO1dBQ2pDO01BQUMsT0FBQSxLQUFEO01BQVEsTUFBQSxJQUFSO01BQWMsT0FBQSxLQUFkO01BQXFCLFVBQUEsUUFBckI7O0VBTjZCOztFQVF6QjtJQUNTLG9C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V0FBQSxHQUFhLFNBQUMsS0FBRCxFQUFRLFVBQVI7QUFDWCxVQUFBO01BQUEsSUFBRyxjQUFBLEdBQWlCLElBQUMsQ0FBQSxhQUFELENBQWUsS0FBZixFQUFzQixVQUF0QixDQUFwQjtRQUNFLEtBQUssQ0FBQyxNQUFOLENBQWEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxjQUFkLENBQWIsRUFERjs7YUFFQTtJQUhXOzs7O0tBN0JTOztFQWtDeEIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFDZixlQUFBLGFBRGU7SUFFZixhQUFBLFdBRmU7SUFHZixXQUFBLFNBSGU7O0FBM05qQiIsInNvdXJjZXNDb250ZW50IjpbIntSYW5nZX0gPSByZXF1aXJlICdhdG9tJ1xuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntcbiAgaXNFc2NhcGVkQ2hhclJhbmdlXG4gIGdldEVuZE9mTGluZUZvckJ1ZmZlclJvd1xuICBjb2xsZWN0UmFuZ2VJbkJ1ZmZlclJvd1xuICBzY2FuRWRpdG9ySW5EaXJlY3Rpb25cbiAgZ2V0TGluZVRleHRUb0J1ZmZlclBvc2l0aW9uXG59ID0gcmVxdWlyZSAnLi91dGlscydcblxuZ2V0Q2hhcmFjdGVyUmFuZ2VJbmZvcm1hdGlvbiA9IChlZGl0b3IsIHBvaW50LCBjaGFyKSAtPlxuICBwYXR0ZXJuID0gLy8vI3tfLmVzY2FwZVJlZ0V4cChjaGFyKX0vLy9nXG4gIHRvdGFsID0gY29sbGVjdFJhbmdlSW5CdWZmZXJSb3coZWRpdG9yLCBwb2ludC5yb3csIHBhdHRlcm4pLmZpbHRlciAocmFuZ2UpIC0+XG4gICAgbm90IGlzRXNjYXBlZENoYXJSYW5nZShlZGl0b3IsIHJhbmdlKVxuICBbbGVmdCwgcmlnaHRdID0gXy5wYXJ0aXRpb24odG90YWwsICh7c3RhcnR9KSAtPiBzdGFydC5pc0xlc3NUaGFuKHBvaW50KSlcbiAgYmFsYW5jZWQgPSAodG90YWwubGVuZ3RoICUgMikgaXMgMFxuICB7dG90YWwsIGxlZnQsIHJpZ2h0LCBiYWxhbmNlZH1cblxuY2xhc3MgU2NvcGVTdGF0ZVxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3IsIHBvaW50KSAtPlxuICAgIEBzdGF0ZSA9IEBnZXRTY29wZVN0YXRlRm9yQnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiAgZ2V0U2NvcGVTdGF0ZUZvckJ1ZmZlclBvc2l0aW9uOiAocG9pbnQpIC0+XG4gICAgc2NvcGVzID0gQGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihwb2ludCkuZ2V0U2NvcGVzQXJyYXkoKVxuICAgIHtcbiAgICAgIGluU3RyaW5nOiBzY29wZXMuc29tZSAoc2NvcGUpIC0+IHNjb3BlLnN0YXJ0c1dpdGgoJ3N0cmluZy4nKVxuICAgICAgaW5Db21tZW50OiBzY29wZXMuc29tZSAoc2NvcGUpIC0+IHNjb3BlLnN0YXJ0c1dpdGgoJ2NvbW1lbnQuJylcbiAgICAgIGluRG91YmxlUXVvdGVzOiBAaXNJbkRvdWJsZVF1b3Rlcyhwb2ludClcbiAgICB9XG5cbiAgaXNJbkRvdWJsZVF1b3RlczogKHBvaW50KSAtPlxuICAgIHt0b3RhbCwgbGVmdCwgYmFsYW5jZWR9ID0gZ2V0Q2hhcmFjdGVyUmFuZ2VJbmZvcm1hdGlvbihAZWRpdG9yLCBwb2ludCwgJ1wiJylcbiAgICBpZiB0b3RhbC5sZW5ndGggaXMgMCBvciBub3QgYmFsYW5jZWRcbiAgICAgIGZhbHNlXG4gICAgZWxzZVxuICAgICAgbGVmdC5sZW5ndGggJSAyIGlzIDFcblxuICBpc0VxdWFsOiAob3RoZXIpIC0+XG4gICAgXy5pc0VxdWFsKEBzdGF0ZSwgb3RoZXIuc3RhdGUpXG5cbiAgaXNJbk5vcm1hbENvZGVBcmVhOiAtPlxuICAgIG5vdCAoQHN0YXRlLmluU3RyaW5nIG9yIEBzdGF0ZS5pbkNvbW1lbnQgb3IgQHN0YXRlLmluRG91YmxlUXVvdGVzKVxuXG5jbGFzcyBQYWlyRmluZGVyXG4gIGNvbnN0cnVjdG9yOiAoQGVkaXRvciwgb3B0aW9ucz17fSkgLT5cbiAgICB7QGFsbG93TmV4dExpbmUsIEBhbGxvd0ZvcndhcmRpbmcsIEBwYWlyfSA9IG9wdGlvbnNcbiAgICBpZiBAcGFpcj9cbiAgICAgIEBzZXRQYXR0ZXJuRm9yUGFpcihAcGFpcilcblxuICBnZXRQYXR0ZXJuOiAtPlxuICAgIEBwYXR0ZXJuXG5cbiAgZmlsdGVyRXZlbnQ6IC0+XG4gICAgdHJ1ZVxuXG4gIGZpbmRQYWlyOiAod2hpY2gsIGRpcmVjdGlvbiwgZnJvbSkgLT5cbiAgICBzdGFjayA9IFtdXG4gICAgZm91bmQgPSBudWxsXG5cbiAgICAjIFF1b3RlIGlzIG5vdCBuZXN0YWJsZS4gU28gd2hlbiB3ZSBlbmNvdW50ZXIgJ29wZW4nIHdoaWxlIGZpbmRpbmcgJ2Nsb3NlJyxcbiAgICAjIGl0IGlzIGZvcndhcmRpbmcgcGFpciwgc28gc3RvcHBhYmxlIGlzIG5vdCBAYWxsb3dGb3J3YXJkaW5nXG4gICAgZmluZGluZ05vbkZvcndhcmRpbmdDbG9zaW5nUXVvdGUgPSAodGhpcyBpbnN0YW5jZW9mIFF1b3RlRmluZGVyKSBhbmQgd2hpY2ggaXMgJ2Nsb3NlJyBhbmQgbm90IEBhbGxvd0ZvcndhcmRpbmdcbiAgICBzY2FubmVyID0gc2NhbkVkaXRvckluRGlyZWN0aW9uLmJpbmQobnVsbCwgQGVkaXRvciwgZGlyZWN0aW9uLCBAZ2V0UGF0dGVybigpLCB7ZnJvbSwgQGFsbG93TmV4dExpbmV9KVxuICAgIHNjYW5uZXIgKGV2ZW50KSA9PlxuICAgICAge3JhbmdlLCBzdG9wfSA9IGV2ZW50XG5cbiAgICAgIHJldHVybiBpZiBpc0VzY2FwZWRDaGFyUmFuZ2UoQGVkaXRvciwgcmFuZ2UpXG4gICAgICByZXR1cm4gdW5sZXNzIEBmaWx0ZXJFdmVudChldmVudClcblxuICAgICAgZXZlbnRTdGF0ZSA9IEBnZXRFdmVudFN0YXRlKGV2ZW50KVxuXG4gICAgICBpZiBmaW5kaW5nTm9uRm9yd2FyZGluZ0Nsb3NpbmdRdW90ZSBhbmQgZXZlbnRTdGF0ZS5zdGF0ZSBpcyAnb3BlbicgYW5kIHJhbmdlLnN0YXJ0LmlzR3JlYXRlclRoYW4oZnJvbSlcbiAgICAgICAgc3RvcCgpXG4gICAgICAgIHJldHVyblxuXG4gICAgICBpZiBldmVudFN0YXRlLnN0YXRlIGlzbnQgd2hpY2hcbiAgICAgICAgc3RhY2sucHVzaChldmVudFN0YXRlKVxuICAgICAgZWxzZVxuICAgICAgICBpZiBAb25Gb3VuZChzdGFjaywge2V2ZW50U3RhdGUsIGZyb219KVxuICAgICAgICAgIGZvdW5kID0gcmFuZ2VcbiAgICAgICAgICBzdG9wKClcblxuICAgIHJldHVybiBmb3VuZFxuXG4gIHNwbGljZVN0YWNrOiAoc3RhY2ssIGV2ZW50U3RhdGUpIC0+XG4gICAgc3RhY2sucG9wKClcblxuICBvbkZvdW5kOiAoc3RhY2ssIHtldmVudFN0YXRlLCBmcm9tfSkgLT5cbiAgICBzd2l0Y2ggZXZlbnRTdGF0ZS5zdGF0ZVxuICAgICAgd2hlbiAnb3BlbidcbiAgICAgICAgQHNwbGljZVN0YWNrKHN0YWNrLCBldmVudFN0YXRlKVxuICAgICAgICBzdGFjay5sZW5ndGggaXMgMFxuICAgICAgd2hlbiAnY2xvc2UnXG4gICAgICAgIG9wZW5TdGF0ZSA9IEBzcGxpY2VTdGFjayhzdGFjaywgZXZlbnRTdGF0ZSlcbiAgICAgICAgdW5sZXNzIG9wZW5TdGF0ZT9cbiAgICAgICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgICAgIGlmIHN0YWNrLmxlbmd0aCBpcyAwXG4gICAgICAgICAgb3BlblJhbmdlID0gb3BlblN0YXRlLnJhbmdlXG4gICAgICAgICAgb3BlblJhbmdlLnN0YXJ0LmlzRXF1YWwoZnJvbSkgb3IgKEBhbGxvd0ZvcndhcmRpbmcgYW5kIG9wZW5SYW5nZS5zdGFydC5yb3cgaXMgZnJvbS5yb3cpXG5cbiAgZmluZENsb3NlRm9yd2FyZDogKGZyb20pIC0+XG4gICAgQGZpbmRQYWlyKCdjbG9zZScsICdmb3J3YXJkJywgZnJvbSlcblxuICBmaW5kT3BlbkJhY2t3YXJkOiAoZnJvbSkgLT5cbiAgICBAZmluZFBhaXIoJ29wZW4nLCAnYmFja3dhcmQnLCBmcm9tKVxuXG4gIGZpbmQ6IChmcm9tKSAtPlxuICAgIGNsb3NlUmFuZ2UgPSBAY2xvc2VSYW5nZSA9IEBmaW5kQ2xvc2VGb3J3YXJkKGZyb20pXG4gICAgb3BlblJhbmdlID0gQGZpbmRPcGVuQmFja3dhcmQoY2xvc2VSYW5nZS5lbmQpIGlmIGNsb3NlUmFuZ2U/XG5cbiAgICBpZiBjbG9zZVJhbmdlPyBhbmQgb3BlblJhbmdlP1xuICAgICAge1xuICAgICAgICBhUmFuZ2U6IG5ldyBSYW5nZShvcGVuUmFuZ2Uuc3RhcnQsIGNsb3NlUmFuZ2UuZW5kKVxuICAgICAgICBpbm5lclJhbmdlOiBuZXcgUmFuZ2Uob3BlblJhbmdlLmVuZCwgY2xvc2VSYW5nZS5zdGFydClcbiAgICAgICAgb3BlblJhbmdlOiBvcGVuUmFuZ2VcbiAgICAgICAgY2xvc2VSYW5nZTogY2xvc2VSYW5nZVxuICAgICAgfVxuXG5jbGFzcyBCcmFja2V0RmluZGVyIGV4dGVuZHMgUGFpckZpbmRlclxuICByZXRyeTogZmFsc2VcblxuICBzZXRQYXR0ZXJuRm9yUGFpcjogKHBhaXIpIC0+XG4gICAgW29wZW4sIGNsb3NlXSA9IHBhaXJcbiAgICBAcGF0dGVybiA9IC8vLygje18uZXNjYXBlUmVnRXhwKG9wZW4pfSl8KCN7Xy5lc2NhcGVSZWdFeHAoY2xvc2UpfSkvLy9nXG5cbiAgIyBUaGlzIG1ldGhvZCBjYW4gYmUgY2FsbGVkIHJlY3Vyc2l2ZWx5XG4gIGZpbmQ6IChmcm9tKSAtPlxuICAgIEBpbml0aWFsU2NvcGUgPz0gbmV3IFNjb3BlU3RhdGUoQGVkaXRvciwgZnJvbSlcblxuICAgIHJldHVybiBmb3VuZCBpZiBmb3VuZCA9IHN1cGVyXG5cbiAgICBpZiBub3QgQHJldHJ5XG4gICAgICBAcmV0cnkgPSB0cnVlXG4gICAgICBbQGNsb3NlUmFuZ2UsIEBjbG9zZVJhbmdlU2NvcGVdID0gW11cbiAgICAgIEBmaW5kKGZyb20pXG5cbiAgZmlsdGVyRXZlbnQ6ICh7cmFuZ2V9KSAtPlxuICAgIHNjb3BlID0gbmV3IFNjb3BlU3RhdGUoQGVkaXRvciwgcmFuZ2Uuc3RhcnQpXG4gICAgaWYgbm90IEBjbG9zZVJhbmdlXG4gICAgICAjIE5vdyBmaW5kaW5nIGNsb3NlUmFuZ2VcbiAgICAgIGlmIG5vdCBAcmV0cnlcbiAgICAgICAgQGluaXRpYWxTY29wZS5pc0VxdWFsKHNjb3BlKVxuICAgICAgZWxzZVxuICAgICAgICBpZiBAaW5pdGlhbFNjb3BlLmlzSW5Ob3JtYWxDb2RlQXJlYSgpXG4gICAgICAgICAgbm90IHNjb3BlLmlzSW5Ob3JtYWxDb2RlQXJlYSgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBzY29wZS5pc0luTm9ybWFsQ29kZUFyZWEoKVxuICAgIGVsc2VcbiAgICAgICMgTm93IGZpbmRpbmcgb3BlblJhbmdlOiBzZWFyY2ggZnJvbSBzYW1lIHNjb3BlXG4gICAgICBAY2xvc2VSYW5nZVNjb3BlID89IG5ldyBTY29wZVN0YXRlKEBlZGl0b3IsIEBjbG9zZVJhbmdlLnN0YXJ0KVxuICAgICAgQGNsb3NlUmFuZ2VTY29wZS5pc0VxdWFsKHNjb3BlKVxuXG4gIGdldEV2ZW50U3RhdGU6ICh7bWF0Y2gsIHJhbmdlfSkgLT5cbiAgICBzdGF0ZSA9IHN3aXRjaFxuICAgICAgd2hlbiBtYXRjaFsxXSB0aGVuICdvcGVuJ1xuICAgICAgd2hlbiBtYXRjaFsyXSB0aGVuICdjbG9zZSdcbiAgICB7c3RhdGUsIHJhbmdlfVxuXG5jbGFzcyBRdW90ZUZpbmRlciBleHRlbmRzIFBhaXJGaW5kZXJcbiAgc2V0UGF0dGVybkZvclBhaXI6IChwYWlyKSAtPlxuICAgIEBxdW90ZUNoYXIgPSBwYWlyWzBdXG4gICAgQHBhdHRlcm4gPSAvLy8oI3tfLmVzY2FwZVJlZ0V4cChwYWlyWzBdKX0pLy8vZ1xuXG4gIGZpbmQ6IChmcm9tKSAtPlxuICAgICMgSEFDSzogQ2FudCBkZXRlcm1pbmUgb3Blbi9jbG9zZSBmcm9tIHF1b3RlIGNoYXIgaXRzZWxmXG4gICAgIyBTbyBwcmVzZXQgb3Blbi9jbG9zZSBzdGF0ZSB0byBnZXQgZGVzaWFibGUgcmVzdWx0LlxuICAgIHt0b3RhbCwgbGVmdCwgcmlnaHQsIGJhbGFuY2VkfSA9IGdldENoYXJhY3RlclJhbmdlSW5mb3JtYXRpb24oQGVkaXRvciwgZnJvbSwgQHF1b3RlQ2hhcilcbiAgICBvblF1b3RlQ2hhciA9IHJpZ2h0WzBdPy5zdGFydC5pc0VxdWFsKGZyb20pICMgZnJvbSBwb2ludCBpcyBvbiBxdW90ZSBjaGFyXG4gICAgaWYgYmFsYW5jZWQgYW5kIG9uUXVvdGVDaGFyXG4gICAgICBuZXh0UXVvdGVJc09wZW4gPSBsZWZ0Lmxlbmd0aCAlIDIgaXMgMFxuICAgIGVsc2VcbiAgICAgIG5leHRRdW90ZUlzT3BlbiA9IGxlZnQubGVuZ3RoIGlzIDBcblxuICAgIGlmIG5leHRRdW90ZUlzT3BlblxuICAgICAgQHBhaXJTdGF0ZXMgPSBbJ29wZW4nLCAnY2xvc2UnLCAnY2xvc2UnLCAnb3BlbiddXG4gICAgZWxzZVxuICAgICAgQHBhaXJTdGF0ZXMgPSBbJ2Nsb3NlJywgJ2Nsb3NlJywgJ29wZW4nXVxuXG4gICAgc3VwZXJcblxuICBnZXRFdmVudFN0YXRlOiAoe3JhbmdlfSkgLT5cbiAgICBzdGF0ZSA9IEBwYWlyU3RhdGVzLnNoaWZ0KClcbiAgICB7c3RhdGUsIHJhbmdlfVxuXG5jbGFzcyBUYWdGaW5kZXIgZXh0ZW5kcyBQYWlyRmluZGVyXG4gIHBhdHRlcm46IC88KFxcLz8pKFteXFxzPl0rKVtePl0qPi9nXG5cbiAgbGluZVRleHRUb1BvaW50Q29udGFpbnNOb25XaGl0ZVNwYWNlOiAocG9pbnQpIC0+XG4gICAgL1xcUy8udGVzdChnZXRMaW5lVGV4dFRvQnVmZmVyUG9zaXRpb24oQGVkaXRvciwgcG9pbnQpKVxuXG4gIGZpbmQ6IChmcm9tKSAtPlxuICAgIGZvdW5kID0gc3VwZXJcbiAgICBpZiBmb3VuZD8gYW5kIEBhbGxvd0ZvcndhcmRpbmdcbiAgICAgIHRhZ1N0YXJ0ID0gZm91bmQuYVJhbmdlLnN0YXJ0XG4gICAgICBpZiB0YWdTdGFydC5pc0dyZWF0ZXJUaGFuKGZyb20pIGFuZCBAbGluZVRleHRUb1BvaW50Q29udGFpbnNOb25XaGl0ZVNwYWNlKHRhZ1N0YXJ0KVxuICAgICAgICAjIFdlIGZvdW5kIHJhbmdlIGJ1dCBhbHNvIGZvdW5kIHRoYXQgd2UgYXJlIElOIGFub3RoZXIgdGFnLFxuICAgICAgICAjIHNvIHdpbGwgcmV0cnkgYnkgZXhjbHVkaW5nIGZvcndhcmRpbmcgcmFuZ2UuXG4gICAgICAgIEBhbGxvd0ZvcndhcmRpbmcgPSBmYWxzZVxuICAgICAgICByZXR1cm4gQGZpbmQoZnJvbSkgIyByZXRyeVxuICAgIGZvdW5kXG5cbiAgZ2V0RXZlbnRTdGF0ZTogKGV2ZW50KSAtPlxuICAgIGJhY2tzbGFzaCA9IGV2ZW50Lm1hdGNoWzFdXG4gICAge1xuICAgICAgc3RhdGU6IGlmIChiYWNrc2xhc2ggaXMgJycpIHRoZW4gJ29wZW4nIGVsc2UgJ2Nsb3NlJ1xuICAgICAgbmFtZTogZXZlbnQubWF0Y2hbMl1cbiAgICAgIHJhbmdlOiBldmVudC5yYW5nZVxuICAgIH1cblxuICBmaW5kUGFpclN0YXRlOiAoc3RhY2ssIHtuYW1lfSkgLT5cbiAgICBmb3Igc3RhdGUgaW4gc3RhY2sgYnkgLTEgd2hlbiBzdGF0ZS5uYW1lIGlzIG5hbWVcbiAgICAgIHJldHVybiBzdGF0ZVxuXG4gIHNwbGljZVN0YWNrOiAoc3RhY2ssIGV2ZW50U3RhdGUpIC0+XG4gICAgaWYgcGFpckV2ZW50U3RhdGUgPSBAZmluZFBhaXJTdGF0ZShzdGFjaywgZXZlbnRTdGF0ZSlcbiAgICAgIHN0YWNrLnNwbGljZShzdGFjay5pbmRleE9mKHBhaXJFdmVudFN0YXRlKSlcbiAgICBwYWlyRXZlbnRTdGF0ZVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgQnJhY2tldEZpbmRlclxuICBRdW90ZUZpbmRlclxuICBUYWdGaW5kZXJcbn1cbiJdfQ==
