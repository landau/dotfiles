(function() {
  var BracketFinder, PairFinder, QuoteFinder, Range, ScopeState, TagFinder, _, collectRangeInBufferRow, getCharacterRangeInformation, getLineTextToBufferPosition, isEscapedCharRange, ref, scanEditorInDirection,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Range = require('atom').Range;

  _ = require('underscore-plus');

  ref = require('./utils'), isEscapedCharRange = ref.isEscapedCharRange, collectRangeInBufferRow = ref.collectRangeInBufferRow, scanEditorInDirection = ref.scanEditorInDirection, getLineTextToBufferPosition = ref.getLineTextToBufferPosition;

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvcGFpci1maW5kZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwyTUFBQTtJQUFBOzs7RUFBQyxRQUFTLE9BQUEsQ0FBUSxNQUFSOztFQUNWLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFLSSxPQUFBLENBQVEsU0FBUixDQUxKLEVBQ0UsMkNBREYsRUFFRSxxREFGRixFQUdFLGlEQUhGLEVBSUU7O0VBR0YsNEJBQUEsR0FBK0IsU0FBQyxNQUFELEVBQVMsS0FBVCxFQUFnQixJQUFoQjtBQUM3QixRQUFBO0lBQUEsT0FBQSxHQUFVLE1BQUEsQ0FBQSxFQUFBLEdBQUksQ0FBQyxDQUFDLENBQUMsWUFBRixDQUFlLElBQWYsQ0FBRCxDQUFKLEVBQTZCLEdBQTdCO0lBQ1YsS0FBQSxHQUFRLHVCQUFBLENBQXdCLE1BQXhCLEVBQWdDLEtBQUssQ0FBQyxHQUF0QyxFQUEyQyxPQUEzQyxDQUFtRCxDQUFDLE1BQXBELENBQTJELFNBQUMsS0FBRDthQUNqRSxDQUFJLGtCQUFBLENBQW1CLE1BQW5CLEVBQTJCLEtBQTNCO0lBRDZELENBQTNEO0lBRVIsT0FBZ0IsQ0FBQyxDQUFDLFNBQUYsQ0FBWSxLQUFaLEVBQW1CLFNBQUMsR0FBRDtBQUFhLFVBQUE7TUFBWCxRQUFEO2FBQVksS0FBSyxDQUFDLFVBQU4sQ0FBaUIsS0FBakI7SUFBYixDQUFuQixDQUFoQixFQUFDLGNBQUQsRUFBTztJQUNQLFFBQUEsR0FBVyxDQUFDLEtBQUssQ0FBQyxNQUFOLEdBQWUsQ0FBaEIsQ0FBQSxLQUFzQjtXQUNqQztNQUFDLE9BQUEsS0FBRDtNQUFRLE1BQUEsSUFBUjtNQUFjLE9BQUEsS0FBZDtNQUFxQixVQUFBLFFBQXJCOztFQU42Qjs7RUFRekI7SUFDUyxvQkFBQyxPQUFELEVB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QUFDLEtBQUQsRUFBUSxVQUFSO0FBQ1gsVUFBQTtNQUFBLElBQUcsY0FBQSxHQUFpQixJQUFDLENBQUEsYUFBRCxDQUFlLEtBQWYsRUFBc0IsVUFBdEIsQ0FBcEI7UUFDRSxLQUFLLENBQUMsTUFBTixDQUFhLEtBQUssQ0FBQyxPQUFOLENBQWMsY0FBZCxDQUFiLEVBREY7O2FBRUE7SUFIVzs7OztLQTdCUzs7RUFrQ3hCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBQ2YsZUFBQSxhQURlO0lBRWYsYUFBQSxXQUZlO0lBR2YsV0FBQSxTQUhlOztBQTFOakIiLCJzb3VyY2VzQ29udGVudCI6WyJ7UmFuZ2V9ID0gcmVxdWlyZSAnYXRvbSdcbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57XG4gIGlzRXNjYXBlZENoYXJSYW5nZVxuICBjb2xsZWN0UmFuZ2VJbkJ1ZmZlclJvd1xuICBzY2FuRWRpdG9ySW5EaXJlY3Rpb25cbiAgZ2V0TGluZVRleHRUb0J1ZmZlclBvc2l0aW9uXG59ID0gcmVxdWlyZSAnLi91dGlscydcblxuZ2V0Q2hhcmFjdGVyUmFuZ2VJbmZvcm1hdGlvbiA9IChlZGl0b3IsIHBvaW50LCBjaGFyKSAtPlxuICBwYXR0ZXJuID0gLy8vI3tfLmVzY2FwZVJlZ0V4cChjaGFyKX0vLy9nXG4gIHRvdGFsID0gY29sbGVjdFJhbmdlSW5CdWZmZXJSb3coZWRpdG9yLCBwb2ludC5yb3csIHBhdHRlcm4pLmZpbHRlciAocmFuZ2UpIC0+XG4gICAgbm90IGlzRXNjYXBlZENoYXJSYW5nZShlZGl0b3IsIHJhbmdlKVxuICBbbGVmdCwgcmlnaHRdID0gXy5wYXJ0aXRpb24odG90YWwsICh7c3RhcnR9KSAtPiBzdGFydC5pc0xlc3NUaGFuKHBvaW50KSlcbiAgYmFsYW5jZWQgPSAodG90YWwubGVuZ3RoICUgMikgaXMgMFxuICB7dG90YWwsIGxlZnQsIHJpZ2h0LCBiYWxhbmNlZH1cblxuY2xhc3MgU2NvcGVTdGF0ZVxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3IsIHBvaW50KSAtPlxuICAgIEBzdGF0ZSA9IEBnZXRTY29wZVN0YXRlRm9yQnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiAgZ2V0U2NvcGVTdGF0ZUZvckJ1ZmZlclBvc2l0aW9uOiAocG9pbnQpIC0+XG4gICAgc2NvcGVzID0gQGVkaXRvci5zY29wZURlc2NyaXB0b3JGb3JCdWZmZXJQb3NpdGlvbihwb2ludCkuZ2V0U2NvcGVzQXJyYXkoKVxuICAgIHtcbiAgICAgIGluU3RyaW5nOiBzY29wZXMuc29tZSAoc2NvcGUpIC0+IHNjb3BlLnN0YXJ0c1dpdGgoJ3N0cmluZy4nKVxuICAgICAgaW5Db21tZW50OiBzY29wZXMuc29tZSAoc2NvcGUpIC0+IHNjb3BlLnN0YXJ0c1dpdGgoJ2NvbW1lbnQuJylcbiAgICAgIGluRG91YmxlUXVvdGVzOiBAaXNJbkRvdWJsZVF1b3Rlcyhwb2ludClcbiAgICB9XG5cbiAgaXNJbkRvdWJsZVF1b3RlczogKHBvaW50KSAtPlxuICAgIHt0b3RhbCwgbGVmdCwgYmFsYW5jZWR9ID0gZ2V0Q2hhcmFjdGVyUmFuZ2VJbmZvcm1hdGlvbihAZWRpdG9yLCBwb2ludCwgJ1wiJylcbiAgICBpZiB0b3RhbC5sZW5ndGggaXMgMCBvciBub3QgYmFsYW5jZWRcbiAgICAgIGZhbHNlXG4gICAgZWxzZVxuICAgICAgbGVmdC5sZW5ndGggJSAyIGlzIDFcblxuICBpc0VxdWFsOiAob3RoZXIpIC0+XG4gICAgXy5pc0VxdWFsKEBzdGF0ZSwgb3RoZXIuc3RhdGUpXG5cbiAgaXNJbk5vcm1hbENvZGVBcmVhOiAtPlxuICAgIG5vdCAoQHN0YXRlLmluU3RyaW5nIG9yIEBzdGF0ZS5pbkNvbW1lbnQgb3IgQHN0YXRlLmluRG91YmxlUXVvdGVzKVxuXG5jbGFzcyBQYWlyRmluZGVyXG4gIGNvbnN0cnVjdG9yOiAoQGVkaXRvciwgb3B0aW9ucz17fSkgLT5cbiAgICB7QGFsbG93TmV4dExpbmUsIEBhbGxvd0ZvcndhcmRpbmcsIEBwYWlyfSA9IG9wdGlvbnNcbiAgICBpZiBAcGFpcj9cbiAgICAgIEBzZXRQYXR0ZXJuRm9yUGFpcihAcGFpcilcblxuICBnZXRQYXR0ZXJuOiAtPlxuICAgIEBwYXR0ZXJuXG5cbiAgZmlsdGVyRXZlbnQ6IC0+XG4gICAgdHJ1ZVxuXG4gIGZpbmRQYWlyOiAod2hpY2gsIGRpcmVjdGlvbiwgZnJvbSkgLT5cbiAgICBzdGFjayA9IFtdXG4gICAgZm91bmQgPSBudWxsXG5cbiAgICAjIFF1b3RlIGlzIG5vdCBuZXN0YWJsZS4gU28gd2hlbiB3ZSBlbmNvdW50ZXIgJ29wZW4nIHdoaWxlIGZpbmRpbmcgJ2Nsb3NlJyxcbiAgICAjIGl0IGlzIGZvcndhcmRpbmcgcGFpciwgc28gc3RvcHBhYmxlIGlzIG5vdCBAYWxsb3dGb3J3YXJkaW5nXG4gICAgZmluZGluZ05vbkZvcndhcmRpbmdDbG9zaW5nUXVvdGUgPSAodGhpcyBpbnN0YW5jZW9mIFF1b3RlRmluZGVyKSBhbmQgd2hpY2ggaXMgJ2Nsb3NlJyBhbmQgbm90IEBhbGxvd0ZvcndhcmRpbmdcbiAgICBzY2FubmVyID0gc2NhbkVkaXRvckluRGlyZWN0aW9uLmJpbmQobnVsbCwgQGVkaXRvciwgZGlyZWN0aW9uLCBAZ2V0UGF0dGVybigpLCB7ZnJvbSwgQGFsbG93TmV4dExpbmV9KVxuICAgIHNjYW5uZXIgKGV2ZW50KSA9PlxuICAgICAge3JhbmdlLCBzdG9wfSA9IGV2ZW50XG5cbiAgICAgIHJldHVybiBpZiBpc0VzY2FwZWRDaGFyUmFuZ2UoQGVkaXRvciwgcmFuZ2UpXG4gICAgICByZXR1cm4gdW5sZXNzIEBmaWx0ZXJFdmVudChldmVudClcblxuICAgICAgZXZlbnRTdGF0ZSA9IEBnZXRFdmVudFN0YXRlKGV2ZW50KVxuXG4gICAgICBpZiBmaW5kaW5nTm9uRm9yd2FyZGluZ0Nsb3NpbmdRdW90ZSBhbmQgZXZlbnRTdGF0ZS5zdGF0ZSBpcyAnb3BlbicgYW5kIHJhbmdlLnN0YXJ0LmlzR3JlYXRlclRoYW4oZnJvbSlcbiAgICAgICAgc3RvcCgpXG4gICAgICAgIHJldHVyblxuXG4gICAgICBpZiBldmVudFN0YXRlLnN0YXRlIGlzbnQgd2hpY2hcbiAgICAgICAgc3RhY2sucHVzaChldmVudFN0YXRlKVxuICAgICAgZWxzZVxuICAgICAgICBpZiBAb25Gb3VuZChzdGFjaywge2V2ZW50U3RhdGUsIGZyb219KVxuICAgICAgICAgIGZvdW5kID0gcmFuZ2VcbiAgICAgICAgICBzdG9wKClcblxuICAgIHJldHVybiBmb3VuZFxuXG4gIHNwbGljZVN0YWNrOiAoc3RhY2ssIGV2ZW50U3RhdGUpIC0+XG4gICAgc3RhY2sucG9wKClcblxuICBvbkZvdW5kOiAoc3RhY2ssIHtldmVudFN0YXRlLCBmcm9tfSkgLT5cbiAgICBzd2l0Y2ggZXZlbnRTdGF0ZS5zdGF0ZVxuICAgICAgd2hlbiAnb3BlbidcbiAgICAgICAgQHNwbGljZVN0YWNrKHN0YWNrLCBldmVudFN0YXRlKVxuICAgICAgICBzdGFjay5sZW5ndGggaXMgMFxuICAgICAgd2hlbiAnY2xvc2UnXG4gICAgICAgIG9wZW5TdGF0ZSA9IEBzcGxpY2VTdGFjayhzdGFjaywgZXZlbnRTdGF0ZSlcbiAgICAgICAgdW5sZXNzIG9wZW5TdGF0ZT9cbiAgICAgICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgICAgIGlmIHN0YWNrLmxlbmd0aCBpcyAwXG4gICAgICAgICAgb3BlblJhbmdlID0gb3BlblN0YXRlLnJhbmdlXG4gICAgICAgICAgb3BlblJhbmdlLnN0YXJ0LmlzRXF1YWwoZnJvbSkgb3IgKEBhbGxvd0ZvcndhcmRpbmcgYW5kIG9wZW5SYW5nZS5zdGFydC5yb3cgaXMgZnJvbS5yb3cpXG5cbiAgZmluZENsb3NlRm9yd2FyZDogKGZyb20pIC0+XG4gICAgQGZpbmRQYWlyKCdjbG9zZScsICdmb3J3YXJkJywgZnJvbSlcblxuICBmaW5kT3BlbkJhY2t3YXJkOiAoZnJvbSkgLT5cbiAgICBAZmluZFBhaXIoJ29wZW4nLCAnYmFja3dhcmQnLCBmcm9tKVxuXG4gIGZpbmQ6IChmcm9tKSAtPlxuICAgIGNsb3NlUmFuZ2UgPSBAY2xvc2VSYW5nZSA9IEBmaW5kQ2xvc2VGb3J3YXJkKGZyb20pXG4gICAgb3BlblJhbmdlID0gQGZpbmRPcGVuQmFja3dhcmQoY2xvc2VSYW5nZS5lbmQpIGlmIGNsb3NlUmFuZ2U/XG5cbiAgICBpZiBjbG9zZVJhbmdlPyBhbmQgb3BlblJhbmdlP1xuICAgICAge1xuICAgICAgICBhUmFuZ2U6IG5ldyBSYW5nZShvcGVuUmFuZ2Uuc3RhcnQsIGNsb3NlUmFuZ2UuZW5kKVxuICAgICAgICBpbm5lclJhbmdlOiBuZXcgUmFuZ2Uob3BlblJhbmdlLmVuZCwgY2xvc2VSYW5nZS5zdGFydClcbiAgICAgICAgb3BlblJhbmdlOiBvcGVuUmFuZ2VcbiAgICAgICAgY2xvc2VSYW5nZTogY2xvc2VSYW5nZVxuICAgICAgfVxuXG5jbGFzcyBCcmFja2V0RmluZGVyIGV4dGVuZHMgUGFpckZpbmRlclxuICByZXRyeTogZmFsc2VcblxuICBzZXRQYXR0ZXJuRm9yUGFpcjogKHBhaXIpIC0+XG4gICAgW29wZW4sIGNsb3NlXSA9IHBhaXJcbiAgICBAcGF0dGVybiA9IC8vLygje18uZXNjYXBlUmVnRXhwKG9wZW4pfSl8KCN7Xy5lc2NhcGVSZWdFeHAoY2xvc2UpfSkvLy9nXG5cbiAgIyBUaGlzIG1ldGhvZCBjYW4gYmUgY2FsbGVkIHJlY3Vyc2l2ZWx5XG4gIGZpbmQ6IChmcm9tKSAtPlxuICAgIEBpbml0aWFsU2NvcGUgPz0gbmV3IFNjb3BlU3RhdGUoQGVkaXRvciwgZnJvbSlcblxuICAgIHJldHVybiBmb3VuZCBpZiBmb3VuZCA9IHN1cGVyXG5cbiAgICBpZiBub3QgQHJldHJ5XG4gICAgICBAcmV0cnkgPSB0cnVlXG4gICAgICBbQGNsb3NlUmFuZ2UsIEBjbG9zZVJhbmdlU2NvcGVdID0gW11cbiAgICAgIEBmaW5kKGZyb20pXG5cbiAgZmlsdGVyRXZlbnQ6ICh7cmFuZ2V9KSAtPlxuICAgIHNjb3BlID0gbmV3IFNjb3BlU3RhdGUoQGVkaXRvciwgcmFuZ2Uuc3RhcnQpXG4gICAgaWYgbm90IEBjbG9zZVJhbmdlXG4gICAgICAjIE5vdyBmaW5kaW5nIGNsb3NlUmFuZ2VcbiAgICAgIGlmIG5vdCBAcmV0cnlcbiAgICAgICAgQGluaXRpYWxTY29wZS5pc0VxdWFsKHNjb3BlKVxuICAgICAgZWxzZVxuICAgICAgICBpZiBAaW5pdGlhbFNjb3BlLmlzSW5Ob3JtYWxDb2RlQXJlYSgpXG4gICAgICAgICAgbm90IHNjb3BlLmlzSW5Ob3JtYWxDb2RlQXJlYSgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBzY29wZS5pc0luTm9ybWFsQ29kZUFyZWEoKVxuICAgIGVsc2VcbiAgICAgICMgTm93IGZpbmRpbmcgb3BlblJhbmdlOiBzZWFyY2ggZnJvbSBzYW1lIHNjb3BlXG4gICAgICBAY2xvc2VSYW5nZVNjb3BlID89IG5ldyBTY29wZVN0YXRlKEBlZGl0b3IsIEBjbG9zZVJhbmdlLnN0YXJ0KVxuICAgICAgQGNsb3NlUmFuZ2VTY29wZS5pc0VxdWFsKHNjb3BlKVxuXG4gIGdldEV2ZW50U3RhdGU6ICh7bWF0Y2gsIHJhbmdlfSkgLT5cbiAgICBzdGF0ZSA9IHN3aXRjaFxuICAgICAgd2hlbiBtYXRjaFsxXSB0aGVuICdvcGVuJ1xuICAgICAgd2hlbiBtYXRjaFsyXSB0aGVuICdjbG9zZSdcbiAgICB7c3RhdGUsIHJhbmdlfVxuXG5jbGFzcyBRdW90ZUZpbmRlciBleHRlbmRzIFBhaXJGaW5kZXJcbiAgc2V0UGF0dGVybkZvclBhaXI6IChwYWlyKSAtPlxuICAgIEBxdW90ZUNoYXIgPSBwYWlyWzBdXG4gICAgQHBhdHRlcm4gPSAvLy8oI3tfLmVzY2FwZVJlZ0V4cChwYWlyWzBdKX0pLy8vZ1xuXG4gIGZpbmQ6IChmcm9tKSAtPlxuICAgICMgSEFDSzogQ2FudCBkZXRlcm1pbmUgb3Blbi9jbG9zZSBmcm9tIHF1b3RlIGNoYXIgaXRzZWxmXG4gICAgIyBTbyBwcmVzZXQgb3Blbi9jbG9zZSBzdGF0ZSB0byBnZXQgZGVzaWFibGUgcmVzdWx0LlxuICAgIHt0b3RhbCwgbGVmdCwgcmlnaHQsIGJhbGFuY2VkfSA9IGdldENoYXJhY3RlclJhbmdlSW5mb3JtYXRpb24oQGVkaXRvciwgZnJvbSwgQHF1b3RlQ2hhcilcbiAgICBvblF1b3RlQ2hhciA9IHJpZ2h0WzBdPy5zdGFydC5pc0VxdWFsKGZyb20pICMgZnJvbSBwb2ludCBpcyBvbiBxdW90ZSBjaGFyXG4gICAgaWYgYmFsYW5jZWQgYW5kIG9uUXVvdGVDaGFyXG4gICAgICBuZXh0UXVvdGVJc09wZW4gPSBsZWZ0Lmxlbmd0aCAlIDIgaXMgMFxuICAgIGVsc2VcbiAgICAgIG5leHRRdW90ZUlzT3BlbiA9IGxlZnQubGVuZ3RoIGlzIDBcblxuICAgIGlmIG5leHRRdW90ZUlzT3BlblxuICAgICAgQHBhaXJTdGF0ZXMgPSBbJ29wZW4nLCAnY2xvc2UnLCAnY2xvc2UnLCAnb3BlbiddXG4gICAgZWxzZVxuICAgICAgQHBhaXJTdGF0ZXMgPSBbJ2Nsb3NlJywgJ2Nsb3NlJywgJ29wZW4nXVxuXG4gICAgc3VwZXJcblxuICBnZXRFdmVudFN0YXRlOiAoe3JhbmdlfSkgLT5cbiAgICBzdGF0ZSA9IEBwYWlyU3RhdGVzLnNoaWZ0KClcbiAgICB7c3RhdGUsIHJhbmdlfVxuXG5jbGFzcyBUYWdGaW5kZXIgZXh0ZW5kcyBQYWlyRmluZGVyXG4gIHBhdHRlcm46IC88KFxcLz8pKFteXFxzPl0rKVtePl0qPi9nXG5cbiAgbGluZVRleHRUb1BvaW50Q29udGFpbnNOb25XaGl0ZVNwYWNlOiAocG9pbnQpIC0+XG4gICAgL1xcUy8udGVzdChnZXRMaW5lVGV4dFRvQnVmZmVyUG9zaXRpb24oQGVkaXRvciwgcG9pbnQpKVxuXG4gIGZpbmQ6IChmcm9tKSAtPlxuICAgIGZvdW5kID0gc3VwZXJcbiAgICBpZiBmb3VuZD8gYW5kIEBhbGxvd0ZvcndhcmRpbmdcbiAgICAgIHRhZ1N0YXJ0ID0gZm91bmQuYVJhbmdlLnN0YXJ0XG4gICAgICBpZiB0YWdTdGFydC5pc0dyZWF0ZXJUaGFuKGZyb20pIGFuZCBAbGluZVRleHRUb1BvaW50Q29udGFpbnNOb25XaGl0ZVNwYWNlKHRhZ1N0YXJ0KVxuICAgICAgICAjIFdlIGZvdW5kIHJhbmdlIGJ1dCBhbHNvIGZvdW5kIHRoYXQgd2UgYXJlIElOIGFub3RoZXIgdGFnLFxuICAgICAgICAjIHNvIHdpbGwgcmV0cnkgYnkgZXhjbHVkaW5nIGZvcndhcmRpbmcgcmFuZ2UuXG4gICAgICAgIEBhbGxvd0ZvcndhcmRpbmcgPSBmYWxzZVxuICAgICAgICByZXR1cm4gQGZpbmQoZnJvbSkgIyByZXRyeVxuICAgIGZvdW5kXG5cbiAgZ2V0RXZlbnRTdGF0ZTogKGV2ZW50KSAtPlxuICAgIGJhY2tzbGFzaCA9IGV2ZW50Lm1hdGNoWzFdXG4gICAge1xuICAgICAgc3RhdGU6IGlmIChiYWNrc2xhc2ggaXMgJycpIHRoZW4gJ29wZW4nIGVsc2UgJ2Nsb3NlJ1xuICAgICAgbmFtZTogZXZlbnQubWF0Y2hbMl1cbiAgICAgIHJhbmdlOiBldmVudC5yYW5nZVxuICAgIH1cblxuICBmaW5kUGFpclN0YXRlOiAoc3RhY2ssIHtuYW1lfSkgLT5cbiAgICBmb3Igc3RhdGUgaW4gc3RhY2sgYnkgLTEgd2hlbiBzdGF0ZS5uYW1lIGlzIG5hbWVcbiAgICAgIHJldHVybiBzdGF0ZVxuXG4gIHNwbGljZVN0YWNrOiAoc3RhY2ssIGV2ZW50U3RhdGUpIC0+XG4gICAgaWYgcGFpckV2ZW50U3RhdGUgPSBAZmluZFBhaXJTdGF0ZShzdGFjaywgZXZlbnRTdGF0ZSlcbiAgICAgIHN0YWNrLnNwbGljZShzdGFjay5pbmRleE9mKHBhaXJFdmVudFN0YXRlKSlcbiAgICBwYWlyRXZlbnRTdGF0ZVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgQnJhY2tldEZpbmRlclxuICBRdW90ZUZpbmRlclxuICBUYWdGaW5kZXJcbn1cbiJdfQ==
