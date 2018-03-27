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
      this.allowNextLine = options.allowNextLine, this.allowForwarding = options.allowForwarding, this.pair = options.pair, this.inclusive = options.inclusive;
      if (this.inclusive == null) {
        this.inclusive = true;
      }
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
      var eventState, from, openRange, openStart, openState;
      eventState = arg.eventState, from = arg.from;
      switch (eventState.state) {
        case 'open':
          this.spliceStack(stack, eventState);
          return stack.length === 0;
        case 'close':
          openState = this.spliceStack(stack, eventState);
          if (openState == null) {
            return this.inclusive || eventState.range.start.isGreaterThan(from);
          }
          if (stack.length === 0) {
            openRange = openState.range;
            openStart = openRange.start;
            if (this.inclusive) {
              return openStart.isEqual(from) || (this.allowForwarding && openStart.row === from.row);
            } else {
              return openStart.isLessThan(from) || (this.allowForwarding && openStart.isGreaterThan(from) && openStart.row === from.row);
            }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvcGFpci1maW5kZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwyTUFBQTtJQUFBOzs7RUFBQyxRQUFTLE9BQUEsQ0FBUSxNQUFSOztFQUNWLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFLSSxPQUFBLENBQVEsU0FBUixDQUxKLEVBQ0UsMkNBREYsRUFFRSxxREFGRixFQUdFLGlEQUhGLEVBSUU7O0VBR0YsNEJBQUEsR0FBK0IsU0FBQyxNQUFELEVBQVMsS0FBVCxFQUFnQixJQUFoQjtBQUM3QixRQUFBO0lBQUEsT0FBQSxHQUFVLE1BQUEsQ0FBQSxFQUFBLEdBQUksQ0FBQyxDQUFDLENBQUMsWUFBRixDQUFlLElBQWYsQ0FBRCxDQUFKLEVBQTZCLEdBQTdCO0lBQ1YsS0FBQSxHQUFRLHVCQUFBLENBQXdCLE1BQXhCLEVBQWdDLEtBQUssQ0FBQyxHQUF0QyxFQUEyQyxPQUEzQyxDQUFtRCxDQUFDLE1BQXBELENBQTJELFNBQUMsS0FBRDthQUNqRSxDQUFJLGtCQUFBLENBQW1CLE1BQW5CLEVBQTJCLEtBQTNCO0lBRDZELENBQTNEO0lBRVIsT0FBZ0IsQ0FBQyxDQUFDLFNBQUYsQ0FBWSxLQUFaLEVBQW1CLFNBQUMsR0FBRDtBQUFhLFVBQUE7TUFBWCxRQUFEO2FBQVksS0FBSyxDQUFDLFVBQU4sQ0FBaUIsS0FBakI7SUFBYixDQUFuQixDQUFoQixFQUFDLGNBQUQsRUFBTztJQUNQLFFBQUEsR0FBVyxDQUFDLEtBQUssQ0FBQyxNQUFOLEdBQWUsQ0FBaEIsQ0FBQSxLQUFzQjtXQUNqQztNQUFDLE9BQUEsS0FBRDtNQUFRLE1BQUEsSUFBUjtNQUFjLE9BQUEsS0FBZDtNQUFxQixVQUFBLFFBQXJCOztFQU42Qjs7RUFRekI7SUFDUyxvQkFBQyxPQUFELEVB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R0FBWSxLQUFLLENBQUMsS0FBTSxDQUFBLENBQUE7YUFDeEI7UUFDRSxLQUFBLEVBQVcsU0FBQSxLQUFhLEVBQWpCLEdBQTBCLE1BQTFCLEdBQXNDLE9BRC9DO1FBRUUsSUFBQSxFQUFNLEtBQUssQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUZwQjtRQUdFLEtBQUEsRUFBTyxLQUFLLENBQUMsS0FIZjs7SUFGYTs7d0JBUWYsYUFBQSxHQUFlLFNBQUMsS0FBRCxFQUFRLEdBQVI7QUFDYixVQUFBO01BRHNCLE9BQUQ7QUFDckIsV0FBQSxxQ0FBQTs7WUFBOEIsS0FBSyxDQUFDLElBQU4sS0FBYztBQUMxQyxpQkFBTzs7QUFEVDtJQURhOzt3QkFJZixXQUFBLEdBQWEsU0FBQyxLQUFELEVBQVEsVUFBUjtBQUNYLFVBQUE7TUFBQSxJQUFHLGNBQUEsR0FBaUIsSUFBQyxDQUFBLGFBQUQsQ0FBZSxLQUFmLEVBQXNCLFVBQXRCLENBQXBCO1FBQ0UsS0FBSyxDQUFDLE1BQU4sQ0FBYSxLQUFLLENBQUMsT0FBTixDQUFjLGNBQWQsQ0FBYixFQURGOzthQUVBO0lBSFc7Ozs7S0E3QlM7O0VBa0N4QixNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUNmLGVBQUEsYUFEZTtJQUVmLGFBQUEsV0FGZTtJQUdmLFdBQUEsU0FIZTs7QUEvTmpCIiwic291cmNlc0NvbnRlbnQiOlsie1JhbmdlfSA9IHJlcXVpcmUgJ2F0b20nXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue1xuICBpc0VzY2FwZWRDaGFyUmFuZ2VcbiAgY29sbGVjdFJhbmdlSW5CdWZmZXJSb3dcbiAgc2NhbkVkaXRvckluRGlyZWN0aW9uXG4gIGdldExpbmVUZXh0VG9CdWZmZXJQb3NpdGlvblxufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmdldENoYXJhY3RlclJhbmdlSW5mb3JtYXRpb24gPSAoZWRpdG9yLCBwb2ludCwgY2hhcikgLT5cbiAgcGF0dGVybiA9IC8vLyN7Xy5lc2NhcGVSZWdFeHAoY2hhcil9Ly8vZ1xuICB0b3RhbCA9IGNvbGxlY3RSYW5nZUluQnVmZmVyUm93KGVkaXRvciwgcG9pbnQucm93LCBwYXR0ZXJuKS5maWx0ZXIgKHJhbmdlKSAtPlxuICAgIG5vdCBpc0VzY2FwZWRDaGFyUmFuZ2UoZWRpdG9yLCByYW5nZSlcbiAgW2xlZnQsIHJpZ2h0XSA9IF8ucGFydGl0aW9uKHRvdGFsLCAoe3N0YXJ0fSkgLT4gc3RhcnQuaXNMZXNzVGhhbihwb2ludCkpXG4gIGJhbGFuY2VkID0gKHRvdGFsLmxlbmd0aCAlIDIpIGlzIDBcbiAge3RvdGFsLCBsZWZ0LCByaWdodCwgYmFsYW5jZWR9XG5cbmNsYXNzIFNjb3BlU3RhdGVcbiAgY29uc3RydWN0b3I6IChAZWRpdG9yLCBwb2ludCkgLT5cbiAgICBAc3RhdGUgPSBAZ2V0U2NvcGVTdGF0ZUZvckJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4gIGdldFNjb3BlU3RhdGVGb3JCdWZmZXJQb3NpdGlvbjogKHBvaW50KSAtPlxuICAgIHNjb3BlcyA9IEBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24ocG9pbnQpLmdldFNjb3Blc0FycmF5KClcbiAgICB7XG4gICAgICBpblN0cmluZzogc2NvcGVzLnNvbWUgKHNjb3BlKSAtPiBzY29wZS5zdGFydHNXaXRoKCdzdHJpbmcuJylcbiAgICAgIGluQ29tbWVudDogc2NvcGVzLnNvbWUgKHNjb3BlKSAtPiBzY29wZS5zdGFydHNXaXRoKCdjb21tZW50LicpXG4gICAgICBpbkRvdWJsZVF1b3RlczogQGlzSW5Eb3VibGVRdW90ZXMocG9pbnQpXG4gICAgfVxuXG4gIGlzSW5Eb3VibGVRdW90ZXM6IChwb2ludCkgLT5cbiAgICB7dG90YWwsIGxlZnQsIGJhbGFuY2VkfSA9IGdldENoYXJhY3RlclJhbmdlSW5mb3JtYXRpb24oQGVkaXRvciwgcG9pbnQsICdcIicpXG4gICAgaWYgdG90YWwubGVuZ3RoIGlzIDAgb3Igbm90IGJhbGFuY2VkXG4gICAgICBmYWxzZVxuICAgIGVsc2VcbiAgICAgIGxlZnQubGVuZ3RoICUgMiBpcyAxXG5cbiAgaXNFcXVhbDogKG90aGVyKSAtPlxuICAgIF8uaXNFcXVhbChAc3RhdGUsIG90aGVyLnN0YXRlKVxuXG4gIGlzSW5Ob3JtYWxDb2RlQXJlYTogLT5cbiAgICBub3QgKEBzdGF0ZS5pblN0cmluZyBvciBAc3RhdGUuaW5Db21tZW50IG9yIEBzdGF0ZS5pbkRvdWJsZVF1b3RlcylcblxuY2xhc3MgUGFpckZpbmRlclxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3IsIG9wdGlvbnM9e30pIC0+XG4gICAge0BhbGxvd05leHRMaW5lLCBAYWxsb3dGb3J3YXJkaW5nLCBAcGFpciwgQGluY2x1c2l2ZX0gPSBvcHRpb25zXG4gICAgQGluY2x1c2l2ZSA/PSB0cnVlXG4gICAgaWYgQHBhaXI/XG4gICAgICBAc2V0UGF0dGVybkZvclBhaXIoQHBhaXIpXG5cbiAgZ2V0UGF0dGVybjogLT5cbiAgICBAcGF0dGVyblxuXG4gIGZpbHRlckV2ZW50OiAtPlxuICAgIHRydWVcblxuICBmaW5kUGFpcjogKHdoaWNoLCBkaXJlY3Rpb24sIGZyb20pIC0+XG4gICAgc3RhY2sgPSBbXVxuICAgIGZvdW5kID0gbnVsbFxuXG4gICAgIyBRdW90ZSBpcyBub3QgbmVzdGFibGUuIFNvIHdoZW4gd2UgZW5jb3VudGVyICdvcGVuJyB3aGlsZSBmaW5kaW5nICdjbG9zZScsXG4gICAgIyBpdCBpcyBmb3J3YXJkaW5nIHBhaXIsIHNvIHN0b3BwYWJsZSB1bmxlc3MgQGFsbG93Rm9yd2FyZGluZ1xuICAgIGZpbmRpbmdOb25Gb3J3YXJkaW5nQ2xvc2luZ1F1b3RlID0gKHRoaXMgaW5zdGFuY2VvZiBRdW90ZUZpbmRlcikgYW5kIHdoaWNoIGlzICdjbG9zZScgYW5kIG5vdCBAYWxsb3dGb3J3YXJkaW5nXG4gICAgc2Nhbm5lciA9IHNjYW5FZGl0b3JJbkRpcmVjdGlvbi5iaW5kKG51bGwsIEBlZGl0b3IsIGRpcmVjdGlvbiwgQGdldFBhdHRlcm4oKSwge2Zyb20sIEBhbGxvd05leHRMaW5lfSlcbiAgICBzY2FubmVyIChldmVudCkgPT5cbiAgICAgIHtyYW5nZSwgc3RvcH0gPSBldmVudFxuXG4gICAgICByZXR1cm4gaWYgaXNFc2NhcGVkQ2hhclJhbmdlKEBlZGl0b3IsIHJhbmdlKVxuICAgICAgcmV0dXJuIHVubGVzcyBAZmlsdGVyRXZlbnQoZXZlbnQpXG5cbiAgICAgIGV2ZW50U3RhdGUgPSBAZ2V0RXZlbnRTdGF0ZShldmVudClcblxuICAgICAgaWYgZmluZGluZ05vbkZvcndhcmRpbmdDbG9zaW5nUXVvdGUgYW5kIGV2ZW50U3RhdGUuc3RhdGUgaXMgJ29wZW4nIGFuZCByYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKGZyb20pXG4gICAgICAgIHN0b3AoKVxuICAgICAgICByZXR1cm5cblxuICAgICAgaWYgZXZlbnRTdGF0ZS5zdGF0ZSBpc250IHdoaWNoXG4gICAgICAgIHN0YWNrLnB1c2goZXZlbnRTdGF0ZSlcbiAgICAgIGVsc2VcbiAgICAgICAgaWYgQG9uRm91bmQoc3RhY2ssIHtldmVudFN0YXRlLCBmcm9tfSlcbiAgICAgICAgICBmb3VuZCA9IHJhbmdlXG4gICAgICAgICAgc3RvcCgpXG5cbiAgICByZXR1cm4gZm91bmRcblxuICBzcGxpY2VTdGFjazogKHN0YWNrLCBldmVudFN0YXRlKSAtPlxuICAgIHN0YWNrLnBvcCgpXG5cbiAgb25Gb3VuZDogKHN0YWNrLCB7ZXZlbnRTdGF0ZSwgZnJvbX0pIC0+XG4gICAgc3dpdGNoIGV2ZW50U3RhdGUuc3RhdGVcbiAgICAgIHdoZW4gJ29wZW4nXG4gICAgICAgIEBzcGxpY2VTdGFjayhzdGFjaywgZXZlbnRTdGF0ZSlcbiAgICAgICAgc3RhY2subGVuZ3RoIGlzIDBcbiAgICAgIHdoZW4gJ2Nsb3NlJ1xuICAgICAgICBvcGVuU3RhdGUgPSBAc3BsaWNlU3RhY2soc3RhY2ssIGV2ZW50U3RhdGUpXG4gICAgICAgIHVubGVzcyBvcGVuU3RhdGU/XG4gICAgICAgICAgcmV0dXJuIEBpbmNsdXNpdmUgb3IgZXZlbnRTdGF0ZS5yYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKGZyb20pXG5cbiAgICAgICAgaWYgc3RhY2subGVuZ3RoIGlzIDBcbiAgICAgICAgICBvcGVuUmFuZ2UgPSBvcGVuU3RhdGUucmFuZ2VcbiAgICAgICAgICBvcGVuU3RhcnQgPSBvcGVuUmFuZ2Uuc3RhcnRcbiAgICAgICAgICBpZiBAaW5jbHVzaXZlXG4gICAgICAgICAgICBvcGVuU3RhcnQuaXNFcXVhbChmcm9tKSBvciAoQGFsbG93Rm9yd2FyZGluZyBhbmQgb3BlblN0YXJ0LnJvdyBpcyBmcm9tLnJvdylcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBvcGVuU3RhcnQuaXNMZXNzVGhhbihmcm9tKSBvciAoQGFsbG93Rm9yd2FyZGluZyBhbmQgb3BlblN0YXJ0LmlzR3JlYXRlclRoYW4oZnJvbSkgYW5kIG9wZW5TdGFydC5yb3cgaXMgZnJvbS5yb3cpXG5cbiAgZmluZENsb3NlRm9yd2FyZDogKGZyb20pIC0+XG4gICAgQGZpbmRQYWlyKCdjbG9zZScsICdmb3J3YXJkJywgZnJvbSlcblxuICBmaW5kT3BlbkJhY2t3YXJkOiAoZnJvbSkgLT5cbiAgICBAZmluZFBhaXIoJ29wZW4nLCAnYmFja3dhcmQnLCBmcm9tKVxuXG4gIGZpbmQ6IChmcm9tKSAtPlxuICAgIGNsb3NlUmFuZ2UgPSBAY2xvc2VSYW5nZSA9IEBmaW5kQ2xvc2VGb3J3YXJkKGZyb20pXG4gICAgb3BlblJhbmdlID0gQGZpbmRPcGVuQmFja3dhcmQoY2xvc2VSYW5nZS5lbmQpIGlmIGNsb3NlUmFuZ2U/XG5cbiAgICBpZiBjbG9zZVJhbmdlPyBhbmQgb3BlblJhbmdlP1xuICAgICAge1xuICAgICAgICBhUmFuZ2U6IG5ldyBSYW5nZShvcGVuUmFuZ2Uuc3RhcnQsIGNsb3NlUmFuZ2UuZW5kKVxuICAgICAgICBpbm5lclJhbmdlOiBuZXcgUmFuZ2Uob3BlblJhbmdlLmVuZCwgY2xvc2VSYW5nZS5zdGFydClcbiAgICAgICAgb3BlblJhbmdlOiBvcGVuUmFuZ2VcbiAgICAgICAgY2xvc2VSYW5nZTogY2xvc2VSYW5nZVxuICAgICAgfVxuXG5jbGFzcyBCcmFja2V0RmluZGVyIGV4dGVuZHMgUGFpckZpbmRlclxuICByZXRyeTogZmFsc2VcblxuICBzZXRQYXR0ZXJuRm9yUGFpcjogKHBhaXIpIC0+XG4gICAgW29wZW4sIGNsb3NlXSA9IHBhaXJcbiAgICBAcGF0dGVybiA9IC8vLygje18uZXNjYXBlUmVnRXhwKG9wZW4pfSl8KCN7Xy5lc2NhcGVSZWdFeHAoY2xvc2UpfSkvLy9nXG5cbiAgIyBUaGlzIG1ldGhvZCBjYW4gYmUgY2FsbGVkIHJlY3Vyc2l2ZWx5XG4gIGZpbmQ6IChmcm9tKSAtPlxuICAgIEBpbml0aWFsU2NvcGUgPz0gbmV3IFNjb3BlU3RhdGUoQGVkaXRvciwgZnJvbSlcblxuICAgIHJldHVybiBmb3VuZCBpZiBmb3VuZCA9IHN1cGVyXG5cbiAgICBpZiBub3QgQHJldHJ5XG4gICAgICBAcmV0cnkgPSB0cnVlXG4gICAgICBbQGNsb3NlUmFuZ2UsIEBjbG9zZVJhbmdlU2NvcGVdID0gW11cbiAgICAgIEBmaW5kKGZyb20pXG5cbiAgZmlsdGVyRXZlbnQ6ICh7cmFuZ2V9KSAtPlxuICAgIHNjb3BlID0gbmV3IFNjb3BlU3RhdGUoQGVkaXRvciwgcmFuZ2Uuc3RhcnQpXG4gICAgaWYgbm90IEBjbG9zZVJhbmdlXG4gICAgICAjIE5vdyBmaW5kaW5nIGNsb3NlUmFuZ2VcbiAgICAgIGlmIG5vdCBAcmV0cnlcbiAgICAgICAgQGluaXRpYWxTY29wZS5pc0VxdWFsKHNjb3BlKVxuICAgICAgZWxzZVxuICAgICAgICBpZiBAaW5pdGlhbFNjb3BlLmlzSW5Ob3JtYWxDb2RlQXJlYSgpXG4gICAgICAgICAgbm90IHNjb3BlLmlzSW5Ob3JtYWxDb2RlQXJlYSgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBzY29wZS5pc0luTm9ybWFsQ29kZUFyZWEoKVxuICAgIGVsc2VcbiAgICAgICMgTm93IGZpbmRpbmcgb3BlblJhbmdlOiBzZWFyY2ggZnJvbSBzYW1lIHNjb3BlXG4gICAgICBAY2xvc2VSYW5nZVNjb3BlID89IG5ldyBTY29wZVN0YXRlKEBlZGl0b3IsIEBjbG9zZVJhbmdlLnN0YXJ0KVxuICAgICAgQGNsb3NlUmFuZ2VTY29wZS5pc0VxdWFsKHNjb3BlKVxuXG4gIGdldEV2ZW50U3RhdGU6ICh7bWF0Y2gsIHJhbmdlfSkgLT5cbiAgICBzdGF0ZSA9IHN3aXRjaFxuICAgICAgd2hlbiBtYXRjaFsxXSB0aGVuICdvcGVuJ1xuICAgICAgd2hlbiBtYXRjaFsyXSB0aGVuICdjbG9zZSdcbiAgICB7c3RhdGUsIHJhbmdlfVxuXG5jbGFzcyBRdW90ZUZpbmRlciBleHRlbmRzIFBhaXJGaW5kZXJcbiAgc2V0UGF0dGVybkZvclBhaXI6IChwYWlyKSAtPlxuICAgIEBxdW90ZUNoYXIgPSBwYWlyWzBdXG4gICAgQHBhdHRlcm4gPSAvLy8oI3tfLmVzY2FwZVJlZ0V4cChwYWlyWzBdKX0pLy8vZ1xuXG4gIGZpbmQ6IChmcm9tKSAtPlxuICAgICMgSEFDSzogQ2FudCBkZXRlcm1pbmUgb3Blbi9jbG9zZSBmcm9tIHF1b3RlIGNoYXIgaXRzZWxmXG4gICAgIyBTbyBwcmVzZXQgb3Blbi9jbG9zZSBzdGF0ZSB0byBnZXQgZGVzaWFibGUgcmVzdWx0LlxuICAgIHt0b3RhbCwgbGVmdCwgcmlnaHQsIGJhbGFuY2VkfSA9IGdldENoYXJhY3RlclJhbmdlSW5mb3JtYXRpb24oQGVkaXRvciwgZnJvbSwgQHF1b3RlQ2hhcilcbiAgICBvblF1b3RlQ2hhciA9IHJpZ2h0WzBdPy5zdGFydC5pc0VxdWFsKGZyb20pICMgZnJvbSBwb2ludCBpcyBvbiBxdW90ZSBjaGFyXG4gICAgaWYgYmFsYW5jZWQgYW5kIG9uUXVvdGVDaGFyXG4gICAgICBuZXh0UXVvdGVJc09wZW4gPSBsZWZ0Lmxlbmd0aCAlIDIgaXMgMFxuICAgIGVsc2VcbiAgICAgIG5leHRRdW90ZUlzT3BlbiA9IGxlZnQubGVuZ3RoIGlzIDBcblxuICAgIGlmIG5leHRRdW90ZUlzT3BlblxuICAgICAgQHBhaXJTdGF0ZXMgPSBbJ29wZW4nLCAnY2xvc2UnLCAnY2xvc2UnLCAnb3BlbiddXG4gICAgZWxzZVxuICAgICAgQHBhaXJTdGF0ZXMgPSBbJ2Nsb3NlJywgJ2Nsb3NlJywgJ29wZW4nXVxuXG4gICAgc3VwZXJcblxuICBnZXRFdmVudFN0YXRlOiAoe3JhbmdlfSkgLT5cbiAgICBzdGF0ZSA9IEBwYWlyU3RhdGVzLnNoaWZ0KClcbiAgICB7c3RhdGUsIHJhbmdlfVxuXG5jbGFzcyBUYWdGaW5kZXIgZXh0ZW5kcyBQYWlyRmluZGVyXG4gIHBhdHRlcm46IC88KFxcLz8pKFteXFxzPl0rKVtePl0qPi9nXG5cbiAgbGluZVRleHRUb1BvaW50Q29udGFpbnNOb25XaGl0ZVNwYWNlOiAocG9pbnQpIC0+XG4gICAgL1xcUy8udGVzdChnZXRMaW5lVGV4dFRvQnVmZmVyUG9zaXRpb24oQGVkaXRvciwgcG9pbnQpKVxuXG4gIGZpbmQ6IChmcm9tKSAtPlxuICAgIGZvdW5kID0gc3VwZXJcbiAgICBpZiBmb3VuZD8gYW5kIEBhbGxvd0ZvcndhcmRpbmdcbiAgICAgIHRhZ1N0YXJ0ID0gZm91bmQuYVJhbmdlLnN0YXJ0XG4gICAgICBpZiB0YWdTdGFydC5pc0dyZWF0ZXJUaGFuKGZyb20pIGFuZCBAbGluZVRleHRUb1BvaW50Q29udGFpbnNOb25XaGl0ZVNwYWNlKHRhZ1N0YXJ0KVxuICAgICAgICAjIFdlIGZvdW5kIHJhbmdlIGJ1dCBhbHNvIGZvdW5kIHRoYXQgd2UgYXJlIElOIGFub3RoZXIgdGFnLFxuICAgICAgICAjIHNvIHdpbGwgcmV0cnkgYnkgZXhjbHVkaW5nIGZvcndhcmRpbmcgcmFuZ2UuXG4gICAgICAgIEBhbGxvd0ZvcndhcmRpbmcgPSBmYWxzZVxuICAgICAgICByZXR1cm4gQGZpbmQoZnJvbSkgIyByZXRyeVxuICAgIGZvdW5kXG5cbiAgZ2V0RXZlbnRTdGF0ZTogKGV2ZW50KSAtPlxuICAgIGJhY2tzbGFzaCA9IGV2ZW50Lm1hdGNoWzFdXG4gICAge1xuICAgICAgc3RhdGU6IGlmIChiYWNrc2xhc2ggaXMgJycpIHRoZW4gJ29wZW4nIGVsc2UgJ2Nsb3NlJ1xuICAgICAgbmFtZTogZXZlbnQubWF0Y2hbMl1cbiAgICAgIHJhbmdlOiBldmVudC5yYW5nZVxuICAgIH1cblxuICBmaW5kUGFpclN0YXRlOiAoc3RhY2ssIHtuYW1lfSkgLT5cbiAgICBmb3Igc3RhdGUgaW4gc3RhY2sgYnkgLTEgd2hlbiBzdGF0ZS5uYW1lIGlzIG5hbWVcbiAgICAgIHJldHVybiBzdGF0ZVxuXG4gIHNwbGljZVN0YWNrOiAoc3RhY2ssIGV2ZW50U3RhdGUpIC0+XG4gICAgaWYgcGFpckV2ZW50U3RhdGUgPSBAZmluZFBhaXJTdGF0ZShzdGFjaywgZXZlbnRTdGF0ZSlcbiAgICAgIHN0YWNrLnNwbGljZShzdGFjay5pbmRleE9mKHBhaXJFdmVudFN0YXRlKSlcbiAgICBwYWlyRXZlbnRTdGF0ZVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgQnJhY2tldEZpbmRlclxuICBRdW90ZUZpbmRlclxuICBUYWdGaW5kZXJcbn1cbiJdfQ==
