(function() {
  var CompositeDisposable, Emitter, SearchModel, getIndex, getVisibleBufferRange, hoverCounterTimeoutID, ref, ref1, smartScrollToBufferPosition;

  ref = require('atom'), Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable;

  ref1 = require('./utils'), getVisibleBufferRange = ref1.getVisibleBufferRange, smartScrollToBufferPosition = ref1.smartScrollToBufferPosition, getIndex = ref1.getIndex;

  hoverCounterTimeoutID = null;

  module.exports = SearchModel = (function() {
    SearchModel.prototype.relativeIndex = 0;

    SearchModel.prototype.lastRelativeIndex = null;

    SearchModel.prototype.onDidChangeCurrentMatch = function(fn) {
      return this.emitter.on('did-change-current-match', fn);
    };

    function SearchModel(vimState, options) {
      var ref2;
      this.vimState = vimState;
      this.options = options;
      this.emitter = new Emitter;
      ref2 = this.vimState, this.editor = ref2.editor, this.editorElement = ref2.editorElement;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.editorElement.onDidChangeScrollTop(this.refreshMarkers.bind(this)));
      this.disposables.add(this.editorElement.onDidChangeScrollLeft(this.refreshMarkers.bind(this)));
      this.markerLayer = this.editor.addMarkerLayer();
      this.decoationByRange = {};
      this.onDidChangeCurrentMatch((function(_this) {
        return function() {
          var classList, point, text, timeout;
          _this.vimState.hoverSearchCounter.reset();
          if (_this.currentMatch == null) {
            if (_this.vimState.getConfig('flashScreenOnSearchHasNoMatch')) {
              _this.vimState.flash(getVisibleBufferRange(_this.editor), {
                type: 'screen'
              });
              atom.beep();
            }
            return;
          }
          if (_this.vimState.getConfig('showHoverSearchCounter')) {
            text = String(_this.currentMatchIndex + 1) + '/' + _this.matches.length;
            point = _this.currentMatch.start;
            classList = _this.classNamesForRange(_this.currentMatch);
            _this.resetHover();
            _this.vimState.hoverSearchCounter.set(text, point, {
              classList: classList
            });
            if (!_this.options.incrementalSearch) {
              timeout = _this.vimState.getConfig('showHoverSearchCounterDuration');
              hoverCounterTimeoutID = setTimeout(_this.resetHover.bind(_this), timeout);
            }
          }
          _this.editor.unfoldBufferRow(_this.currentMatch.start.row);
          smartScrollToBufferPosition(_this.editor, _this.currentMatch.start);
          if (_this.vimState.getConfig('flashOnSearch')) {
            return _this.vimState.flash(_this.currentMatch, {
              type: 'search'
            });
          }
        };
      })(this));
    }

    SearchModel.prototype.resetHover = function() {
      var ref2;
      if (hoverCounterTimeoutID != null) {
        clearTimeout(hoverCounterTimeoutID);
        hoverCounterTimeoutID = null;
      }
      return (ref2 = this.vimState.hoverSearchCounter) != null ? ref2.reset() : void 0;
    };

    SearchModel.prototype.destroy = function() {
      this.markerLayer.destroy();
      this.disposables.dispose();
      return this.decoationByRange = null;
    };

    SearchModel.prototype.clearMarkers = function() {
      this.markerLayer.clear();
      return this.decoationByRange = {};
    };

    SearchModel.prototype.classNamesForRange = function(range) {
      var classNames;
      classNames = [];
      if (range === this.firstMatch) {
        classNames.push('first');
      } else if (range === this.lastMatch) {
        classNames.push('last');
      }
      if (range === this.currentMatch) {
        classNames.push('current');
      }
      return classNames;
    };

    SearchModel.prototype.refreshMarkers = function() {
      var i, len, range, ref2, results;
      this.clearMarkers();
      ref2 = this.getVisibleMatchRanges();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        range = ref2[i];
        results.push(this.decoationByRange[range.toString()] = this.decorateRange(range));
      }
      return results;
    };

    SearchModel.prototype.getVisibleMatchRanges = function() {
      var visibleMatchRanges, visibleRange;
      visibleRange = getVisibleBufferRange(this.editor);
      return visibleMatchRanges = this.matches.filter(function(range) {
        return range.intersectsWith(visibleRange);
      });
    };

    SearchModel.prototype.decorateRange = function(range) {
      var classNames, ref2;
      classNames = this.classNamesForRange(range);
      classNames = (ref2 = ['vim-mode-plus-search-match']).concat.apply(ref2, classNames);
      return this.editor.decorateMarker(this.markerLayer.markBufferRange(range), {
        type: 'highlight',
        "class": classNames.join(' ')
      });
    };

    SearchModel.prototype.search = function(fromPoint, pattern, relativeIndex) {
      var currentMatch, i, j, len, range, ref2, ref3, ref4;
      this.pattern = pattern;
      this.matches = [];
      this.editor.scan(this.pattern, (function(_this) {
        return function(arg) {
          var range;
          range = arg.range;
          return _this.matches.push(range);
        };
      })(this));
      ref2 = this.matches, this.firstMatch = ref2[0], this.lastMatch = ref2[ref2.length - 1];
      currentMatch = null;
      if (relativeIndex >= 0) {
        ref3 = this.matches;
        for (i = 0, len = ref3.length; i < len; i++) {
          range = ref3[i];
          if (!(range.start.isGreaterThan(fromPoint))) {
            continue;
          }
          currentMatch = range;
          break;
        }
        if (currentMatch == null) {
          currentMatch = this.firstMatch;
        }
        relativeIndex--;
      } else {
        ref4 = this.matches;
        for (j = ref4.length - 1; j >= 0; j += -1) {
          range = ref4[j];
          if (!(range.start.isLessThan(fromPoint))) {
            continue;
          }
          currentMatch = range;
          break;
        }
        if (currentMatch == null) {
          currentMatch = this.lastMatch;
        }
        relativeIndex++;
      }
      this.currentMatchIndex = this.matches.indexOf(currentMatch);
      this.updateCurrentMatch(relativeIndex);
      if (this.options.incrementalSearch) {
        this.refreshMarkers();
      }
      this.initialCurrentMatchIndex = this.currentMatchIndex;
      return this.currentMatch;
    };

    SearchModel.prototype.updateCurrentMatch = function(relativeIndex) {
      this.currentMatchIndex = getIndex(this.currentMatchIndex + relativeIndex, this.matches);
      this.currentMatch = this.matches[this.currentMatchIndex];
      return this.emitter.emit('did-change-current-match');
    };

    SearchModel.prototype.visit = function(relativeIndex) {
      var newClass, newDecoration, oldClass, oldDecoration, ref2;
      if (relativeIndex == null) {
        relativeIndex = null;
      }
      if (relativeIndex != null) {
        this.lastRelativeIndex = relativeIndex;
      } else {
        relativeIndex = (ref2 = this.lastRelativeIndex) != null ? ref2 : +1;
      }
      if (!this.matches.length) {
        return;
      }
      oldDecoration = this.decoationByRange[this.currentMatch.toString()];
      this.updateCurrentMatch(relativeIndex);
      newDecoration = this.decoationByRange[this.currentMatch.toString()];
      if (oldDecoration != null) {
        oldClass = oldDecoration.getProperties()["class"];
        oldClass = oldClass.replace(/\s+current(\s+)?$/, '$1');
        oldDecoration.setProperties({
          type: 'highlight',
          "class": oldClass
        });
      }
      if (newDecoration != null) {
        newClass = newDecoration.getProperties()["class"];
        newClass = newClass.replace(/\s+current(\s+)?$/, '$1');
        newClass += ' current';
        return newDecoration.setProperties({
          type: 'highlight',
          "class": newClass
        });
      }
    };

    SearchModel.prototype.getRelativeIndex = function() {
      return this.currentMatchIndex - this.initialCurrentMatchIndex;
    };

    return SearchModel;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvc2VhcmNoLW1vZGVsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQyxxQkFBRCxFQUFVOztFQUNWLE9BSUksT0FBQSxDQUFRLFNBQVIsQ0FKSixFQUNFLGtEQURGLEVBRUUsOERBRkYsRUFHRTs7RUFHRixxQkFBQSxHQUF3Qjs7RUFFeEIsTUFBTSxDQUFDLE9BQVAsR0FDTTswQkFDSixhQUFBLEdBQWU7OzBCQUNmLGlCQUFBLEdBQW1COzswQkFDbkIsdUJBQUEsR0FBeUIsU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksMEJBQVosRUFBd0MsRUFBeEM7SUFBUjs7SUFFWixxQkFBQyxRQUFELEVBQVksT0FBWjtBQUNYLFVBQUE7TUFEWSxJQUFDLENBQUEsV0FBRDtNQUFXLElBQUMsQ0FBQSxVQUFEO01BQ3ZCLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUVmLE9BQTRCLElBQUMsQ0FBQSxRQUE3QixFQUFDLElBQUMsQ0FBQSxjQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEscUJBQUE7TUFDWCxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUk7TUFDbkIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUMsQ0FBQSxhQUFhLENBQUMsb0JBQWYsQ0FBb0MsSUFBQyxDQUFBLGNBQWMsQ0FBQyxJQUFoQixDQUFxQixJQUFyQixDQUFwQyxDQUFqQjtNQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFDLENBQUEsYUFBYSxDQUFDLHFCQUFmLENBQXFDLElBQUMsQ0FBQSxjQUFjLENBQUMsSUFBaEIsQ0FBcUIsSUFBckIsQ0FBckMsQ0FBakI7TUFDQSxJQUFD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LEVBQU8sUUFBMUI7U0FBNUIsRUFKRjs7SUFoQks7OzBCQXNCUCxnQkFBQSxHQUFrQixTQUFBO2FBQ2hCLElBQUMsQ0FBQSxpQkFBRCxHQUFxQixJQUFDLENBQUE7SUFETjs7Ozs7QUF6SnBCIiwic291cmNlc0NvbnRlbnQiOlsie0VtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbntcbiAgZ2V0VmlzaWJsZUJ1ZmZlclJhbmdlXG4gIHNtYXJ0U2Nyb2xsVG9CdWZmZXJQb3NpdGlvblxuICBnZXRJbmRleFxufSA9IHJlcXVpcmUgJy4vdXRpbHMnXG5cbmhvdmVyQ291bnRlclRpbWVvdXRJRCA9IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgU2VhcmNoTW9kZWxcbiAgcmVsYXRpdmVJbmRleDogMFxuICBsYXN0UmVsYXRpdmVJbmRleDogbnVsbFxuICBvbkRpZENoYW5nZUN1cnJlbnRNYXRjaDogKGZuKSAtPiBAZW1pdHRlci5vbiAnZGlkLWNoYW5nZS1jdXJyZW50LW1hdGNoJywgZm5cblxuICBjb25zdHJ1Y3RvcjogKEB2aW1TdGF0ZSwgQG9wdGlvbnMpIC0+XG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuXG4gICAge0BlZGl0b3IsIEBlZGl0b3JFbGVtZW50fSA9IEB2aW1TdGF0ZVxuICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGRpc3Bvc2FibGVzLmFkZChAZWRpdG9yRWxlbWVudC5vbkRpZENoYW5nZVNjcm9sbFRvcChAcmVmcmVzaE1hcmtlcnMuYmluZCh0aGlzKSkpXG4gICAgQGRpc3Bvc2FibGVzLmFkZChAZWRpdG9yRWxlbWVudC5vbkRpZENoYW5nZVNjcm9sbExlZnQoQHJlZnJlc2hNYXJrZXJzLmJpbmQodGhpcykpKVxuICAgIEBtYXJrZXJMYXllciA9IEBlZGl0b3IuYWRkTWFya2VyTGF5ZXIoKVxuICAgIEBkZWNvYXRpb25CeVJhbmdlID0ge31cblxuICAgIEBvbkRpZENoYW5nZUN1cnJlbnRNYXRjaCA9PlxuICAgICAgQHZpbVN0YXRlLmhvdmVyU2VhcmNoQ291bnRlci5yZXNldCgpXG4gICAgICB1bmxlc3MgQGN1cnJlbnRNYXRjaD9cbiAgICAgICAgaWYgQHZpbVN0YXRlLmdldENvbmZpZygnZmxhc2hTY3JlZW5PblNlYXJjaEhhc05vTWF0Y2gnKVxuICAgICAgICAgIEB2aW1TdGF0ZS5mbGFzaChnZXRWaXNpYmxlQnVmZmVyUmFuZ2UoQGVkaXRvciksIHR5cGU6ICdzY3JlZW4nKVxuICAgICAgICAgIGF0b20uYmVlcCgpXG4gICAgICAgIHJldHVyblxuXG4gICAgICBpZiBAdmltU3RhdGUuZ2V0Q29uZmlnKCdzaG93SG92ZXJTZWFyY2hDb3VudGVyJylcbiAgICAgICAgdGV4dCA9IFN0cmluZyhAY3VycmVudE1hdGNoSW5kZXggKyAxKSArICcvJyArIEBtYXRjaGVzLmxlbmd0aFxuICAgICAgICBwb2ludCA9IEBjdXJyZW50TWF0Y2guc3RhcnRcbiAgICAgICAgY2xhc3NMaXN0ID0gQGNsYXNzTmFtZXNGb3JSYW5nZShAY3VycmVudE1hdGNoKVxuXG4gICAgICAgIEByZXNldEhvdmVyKClcbiAgICAgICAgQHZpbVN0YXRlLmhvdmVyU2VhcmNoQ291bnRlci5zZXQodGV4dCwgcG9pbnQsIHtjbGFzc0xpc3R9KVxuXG4gICAgICAgIHVubGVzcyBAb3B0aW9ucy5pbmNyZW1lbnRhbFNlYXJjaFxuICAgICAgICAgIHRpbWVvdXQgPSBAdmltU3RhdGUuZ2V0Q29uZmlnKCdzaG93SG92ZXJTZWFyY2hDb3VudGVyRHVyYXRpb24nKVxuICAgICAgICAgIGhvdmVyQ291bnRlclRpbWVvdXRJRCA9IHNldFRpbWVvdXQoQHJlc2V0SG92ZXIuYmluZCh0aGlzKSwgdGltZW91dClcblxuICAgICAgQGVkaXRvci51bmZvbGRCdWZmZXJSb3coQGN1cnJlbnRNYXRjaC5zdGFydC5yb3cpXG4gICAgICBzbWFydFNjcm9sbFRvQnVmZmVyUG9zaXRpb24oQGVkaXRvciwgQGN1cnJlbnRNYXRjaC5zdGFydClcblxuICAgICAgaWYgQHZpbVN0YXRlLmdldENvbmZpZygnZmxhc2hPblNlYXJjaCcpXG4gICAgICAgIEB2aW1TdGF0ZS5mbGFzaChAY3VycmVudE1hdGNoLCB0eXBlOiAnc2VhcmNoJylcblxuICByZXNldEhvdmVyOiAtPlxuICAgIGlmIGhvdmVyQ291bnRlclRpbWVvdXRJRD9cbiAgICAgIGNsZWFyVGltZW91dChob3ZlckNvdW50ZXJUaW1lb3V0SUQpXG4gICAgICBob3ZlckNvdW50ZXJUaW1lb3V0SUQgPSBudWxsXG4gICAgIyBTZWUgIzY3NFxuICAgICMgVGhpcyBtZXRob2QgY2FsbGVkIHdpdGggc2V0VGltZW91dFxuICAgICMgaG92ZXJTZWFyY2hDb3VudGVyIG1pZ2h0IG5vdCBiZSBhdmFpbGFibGUgd2hlbiBlZGl0b3IgZGVzdHJveWVkLlxuICAgIEB2aW1TdGF0ZS5ob3ZlclNlYXJjaENvdW50ZXI/LnJlc2V0KClcblxuICBkZXN0cm95OiAtPlxuICAgIEBtYXJrZXJMYXllci5kZXN0cm95KClcbiAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgQGRlY29hdGlvbkJ5UmFuZ2UgPSBudWxsXG5cbiAgY2xlYXJNYXJrZXJzOiAtPlxuICAgIEBtYXJrZXJMYXllci5jbGVhcigpXG4gICAgQGRlY29hdGlvbkJ5UmFuZ2UgPSB7fVxuXG4gIGNsYXNzTmFtZXNGb3JSYW5nZTogKHJhbmdlKSAtPlxuICAgIGNsYXNzTmFtZXMgPSBbXVxuICAgIGlmIHJhbmdlIGlzIEBmaXJzdE1hdGNoXG4gICAgICBjbGFzc05hbWVzLnB1c2goJ2ZpcnN0JylcbiAgICBlbHNlIGlmIHJhbmdlIGlzIEBsYXN0TWF0Y2hcbiAgICAgIGNsYXNzTmFtZXMucHVzaCgnbGFzdCcpXG5cbiAgICBpZiByYW5nZSBpcyBAY3VycmVudE1hdGNoXG4gICAgICBjbGFzc05hbWVzLnB1c2goJ2N1cnJlbnQnKVxuXG4gICAgY2xhc3NOYW1lc1xuXG4gIHJlZnJlc2hNYXJrZXJzOiAtPlxuICAgIEBjbGVhck1hcmtlcnMoKVxuICAgIGZvciByYW5nZSBpbiBAZ2V0VmlzaWJsZU1hdGNoUmFuZ2VzKClcbiAgICAgIEBkZWNvYXRpb25CeVJhbmdlW3JhbmdlLnRvU3RyaW5nKCldID0gQGRlY29yYXRlUmFuZ2UocmFuZ2UpXG5cbiAgZ2V0VmlzaWJsZU1hdGNoUmFuZ2VzOiAtPlxuICAgIHZpc2libGVSYW5nZSA9IGdldFZpc2libGVCdWZmZXJSYW5nZShAZWRpdG9yKVxuICAgIHZpc2libGVNYXRjaFJhbmdlcyA9IEBtYXRjaGVzLmZpbHRlciAocmFuZ2UpIC0+XG4gICAgICByYW5nZS5pbnRlcnNlY3RzV2l0aCh2aXNpYmxlUmFuZ2UpXG5cbiAgZGVjb3JhdGVSYW5nZTogKHJhbmdlKSAtPlxuICAgIGNsYXNzTmFtZXMgPSBAY2xhc3NOYW1lc0ZvclJhbmdlKHJhbmdlKVxuICAgIGNsYXNzTmFtZXMgPSBbJ3ZpbS1tb2RlLXBsdXMtc2VhcmNoLW1hdGNoJ10uY29uY2F0KGNsYXNzTmFtZXMuLi4pXG4gICAgQGVkaXRvci5kZWNvcmF0ZU1hcmtlciBAbWFya2VyTGF5ZXIubWFya0J1ZmZlclJhbmdlKHJhbmdlKSxcbiAgICAgIHR5cGU6ICdoaWdobGlnaHQnXG4gICAgICBjbGFzczogY2xhc3NOYW1lcy5qb2luKCcgJylcblxuICBzZWFyY2g6IChmcm9tUG9pbnQsIEBwYXR0ZXJuLCByZWxhdGl2ZUluZGV4KSAtPlxuICAgIEBtYXRjaGVzID0gW11cbiAgICBAZWRpdG9yLnNjYW4gQHBhdHRlcm4sICh7cmFuZ2V9KSA9PlxuICAgICAgQG1hdGNoZXMucHVzaChyYW5nZSlcblxuICAgIFtAZmlyc3RNYXRjaCwgLi4uLCBAbGFzdE1hdGNoXSA9IEBtYXRjaGVzXG5cbiAgICBjdXJyZW50TWF0Y2ggPSBudWxsXG4gICAgaWYgcmVsYXRpdmVJbmRleCA+PSAwXG4gICAgICBmb3IgcmFuZ2UgaW4gQG1hdGNoZXMgd2hlbiByYW5nZS5zdGFydC5pc0dyZWF0ZXJUaGFuKGZyb21Qb2ludClcbiAgICAgICAgY3VycmVudE1hdGNoID0gcmFuZ2VcbiAgICAgICAgYnJlYWtcbiAgICAgIGN1cnJlbnRNYXRjaCA/PSBAZmlyc3RNYXRjaFxuICAgICAgcmVsYXRpdmVJbmRleC0tXG4gICAgZWxzZVxuICAgICAgZm9yIHJhbmdlIGluIEBtYXRjaGVzIGJ5IC0xIHdoZW4gcmFuZ2Uuc3RhcnQuaXNMZXNzVGhhbihmcm9tUG9pbnQpXG4gICAgICAgIGN1cnJlbnRNYXRjaCA9IHJhbmdlXG4gICAgICAgIGJyZWFrXG4gICAgICBjdXJyZW50TWF0Y2ggPz0gQGxhc3RNYXRjaFxuICAgICAgcmVsYXRpdmVJbmRleCsrXG5cbiAgICBAY3VycmVudE1hdGNoSW5kZXggPSBAbWF0Y2hlcy5pbmRleE9mKGN1cnJlbnRNYXRjaClcbiAgICBAdXBkYXRlQ3VycmVudE1hdGNoKHJlbGF0aXZlSW5kZXgpXG4gICAgaWYgQG9wdGlvbnMuaW5jcmVtZW50YWxTZWFyY2hcbiAgICAgIEByZWZyZXNoTWFya2VycygpXG4gICAgQGluaXRpYWxDdXJyZW50TWF0Y2hJbmRleCA9IEBjdXJyZW50TWF0Y2hJbmRleFxuICAgIEBjdXJyZW50TWF0Y2hcblxuICB1cGRhdGVDdXJyZW50TWF0Y2g6IChyZWxhdGl2ZUluZGV4KSAtPlxuICAgIEBjdXJyZW50TWF0Y2hJbmRleCA9IGdldEluZGV4KEBjdXJyZW50TWF0Y2hJbmRleCArIHJlbGF0aXZlSW5kZXgsIEBtYXRjaGVzKVxuICAgIEBjdXJyZW50TWF0Y2ggPSBAbWF0Y2hlc1tAY3VycmVudE1hdGNoSW5kZXhdXG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZS1jdXJyZW50LW1hdGNoJylcblxuICB2aXNpdDogKHJlbGF0aXZlSW5kZXg9bnVsbCkgLT5cbiAgICBpZiByZWxhdGl2ZUluZGV4P1xuICAgICAgQGxhc3RSZWxhdGl2ZUluZGV4ID0gcmVsYXRpdmVJbmRleFxuICAgIGVsc2VcbiAgICAgIHJlbGF0aXZlSW5kZXggPSBAbGFzdFJlbGF0aXZlSW5kZXggPyArMVxuXG4gICAgcmV0dXJuIHVubGVzcyBAbWF0Y2hlcy5sZW5ndGhcbiAgICBvbGREZWNvcmF0aW9uID0gQGRlY29hdGlvbkJ5UmFuZ2VbQGN1cnJlbnRNYXRjaC50b1N0cmluZygpXVxuICAgIEB1cGRhdGVDdXJyZW50TWF0Y2gocmVsYXRpdmVJbmRleClcbiAgICBuZXdEZWNvcmF0aW9uID0gQGRlY29hdGlvbkJ5UmFuZ2VbQGN1cnJlbnRNYXRjaC50b1N0cmluZygpXVxuXG4gICAgaWYgb2xkRGVjb3JhdGlvbj9cbiAgICAgIG9sZENsYXNzID0gb2xkRGVjb3JhdGlvbi5nZXRQcm9wZXJ0aWVzKCkuY2xhc3NcbiAgICAgIG9sZENsYXNzID0gb2xkQ2xhc3MucmVwbGFjZSgvXFxzK2N1cnJlbnQoXFxzKyk/JC8sICckMScpXG4gICAgICBvbGREZWNvcmF0aW9uLnNldFByb3BlcnRpZXModHlwZTogJ2hpZ2hsaWdodCcsIGNsYXNzOiBvbGRDbGFzcylcblxuICAgIGlmIG5ld0RlY29yYXRpb24/XG4gICAgICBuZXdDbGFzcyA9IG5ld0RlY29yYXRpb24uZ2V0UHJvcGVydGllcygpLmNsYXNzXG4gICAgICBuZXdDbGFzcyA9IG5ld0NsYXNzLnJlcGxhY2UoL1xccytjdXJyZW50KFxccyspPyQvLCAnJDEnKVxuICAgICAgbmV3Q2xhc3MgKz0gJyBjdXJyZW50J1xuICAgICAgbmV3RGVjb3JhdGlvbi5zZXRQcm9wZXJ0aWVzKHR5cGU6ICdoaWdobGlnaHQnLCBjbGFzczogbmV3Q2xhc3MpXG5cbiAgZ2V0UmVsYXRpdmVJbmRleDogLT5cbiAgICBAY3VycmVudE1hdGNoSW5kZXggLSBAaW5pdGlhbEN1cnJlbnRNYXRjaEluZGV4XG4iXX0=
