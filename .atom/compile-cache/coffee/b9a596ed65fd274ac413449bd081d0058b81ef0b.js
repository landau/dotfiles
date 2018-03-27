(function() {
  var CompositeDisposable, Emitter, SearchModel, getIndex, getVisibleBufferRange, hoverCounterTimeoutID, ref, ref1, scanInRanges, settings, smartScrollToBufferPosition;

  ref = require('atom'), Emitter = ref.Emitter, CompositeDisposable = ref.CompositeDisposable;

  ref1 = require('./utils'), scanInRanges = ref1.scanInRanges, getVisibleBufferRange = ref1.getVisibleBufferRange, smartScrollToBufferPosition = ref1.smartScrollToBufferPosition, getIndex = ref1.getIndex;

  settings = require('./settings');

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
            if (settings.get('flashScreenOnSearchHasNoMatch')) {
              _this.vimState.flash(getVisibleBufferRange(_this.editor), {
                type: 'screen'
              });
              atom.beep();
            }
            return;
          }
          if (settings.get('showHoverSearchCounter')) {
            text = String(_this.currentMatchIndex + 1) + '/' + _this.matches.length;
            point = _this.currentMatch.start;
            classList = _this.classNamesForRange(_this.currentMatch);
            _this.resetHover();
            _this.vimState.hoverSearchCounter.set(text, point, {
              classList: classList
            });
            if (!_this.options.incrementalSearch) {
              timeout = settings.get('showHoverSearchCounterDuration');
              hoverCounterTimeoutID = setTimeout(_this.resetHover.bind(_this), timeout);
            }
          }
          _this.editor.unfoldBufferRow(_this.currentMatch.start.row);
          smartScrollToBufferPosition(_this.editor, _this.currentMatch.start);
          if (settings.get('flashOnSearch')) {
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
      var i, len, marker, ref2;
      ref2 = this.markerLayer.getMarkers();
      for (i = 0, len = ref2.length; i < len; i++) {
        marker = ref2[i];
        marker.destroy();
      }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvc2VhcmNoLW1vZGVsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQyxxQkFBRCxFQUFVOztFQUNWLE9BS0ksT0FBQSxDQUFRLFNBQVIsQ0FMSixFQUNFLGdDQURGLEVBRUUsa0RBRkYsRUFHRSw4REFIRixFQUlFOztFQUVGLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUjs7RUFFWCxxQkFBQSxHQUF3Qjs7RUFFeEIsTUFBTSxDQUFDLE9BQVAsR0FDTTswQkFDSixhQUFBLEdBQWU7OzBCQUNmLGlCQUFBLEdBQW1COzswQkFDbkIsdUJBQUEsR0FBeUIsU0FBQyxFQUFEO2FBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksMEJBQVosRUFBd0MsRUFBeEM7SUFBUjs7SUFFWixxQkFBQyxRQUFELEVBQVksT0FBWjtBQUNYLFVBQUE7TUFEWSxJQUFDLENBQUEsV0FBRDtNQUFXLElBQUMsQ0FBQSxVQUFEO01BQ3ZCLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUVmLE9BQTRCLElBQUMsQ0FBQSxRQUE3QixFQUFDLElBQUMsQ0FBQSxjQUFBLE1BQUYsRUFBVSxJQUFDLENBQUEscUJBQUE7TUFDWCxJQUFDLENBQUEsV0FBRCxHQUFlLElBQUk7TUFDbkIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUMsQ0FBQSxhQUFhLENBQUMsb0JBQWYsQ0FBb0MsSUFBQyxDQUFBLGNBQWMsQ0FBQyxJQUFoQixDQUFxQixJQUFyQixDQUFwQyxDQUFqQjtNQUNBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFDLENBQUEsYUFBYSxDQUFDLHFCQUFmLENBQXFDLElBQUMsQ0FBQSxjQUFjLENB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O1VBQW1CLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBMUI7U0FBNUIsRUFKRjs7SUFoQks7OzBCQXNCUCxnQkFBQSxHQUFrQixTQUFBO2FBQ2hCLElBQUMsQ0FBQSxpQkFBRCxHQUFxQixJQUFDLENBQUE7SUFETjs7Ozs7QUE1SnBCIiwic291cmNlc0NvbnRlbnQiOlsie0VtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbntcbiAgc2NhbkluUmFuZ2VzXG4gIGdldFZpc2libGVCdWZmZXJSYW5nZVxuICBzbWFydFNjcm9sbFRvQnVmZmVyUG9zaXRpb25cbiAgZ2V0SW5kZXhcbn0gPSByZXF1aXJlICcuL3V0aWxzJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5ob3ZlckNvdW50ZXJUaW1lb3V0SUQgPSBudWxsXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFNlYXJjaE1vZGVsXG4gIHJlbGF0aXZlSW5kZXg6IDBcbiAgbGFzdFJlbGF0aXZlSW5kZXg6IG51bGxcbiAgb25EaWRDaGFuZ2VDdXJyZW50TWF0Y2g6IChmbikgLT4gQGVtaXR0ZXIub24gJ2RpZC1jaGFuZ2UtY3VycmVudC1tYXRjaCcsIGZuXG5cbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUsIEBvcHRpb25zKSAtPlxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcblxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudH0gPSBAdmltU3RhdGVcbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBkaXNwb3NhYmxlcy5hZGQoQGVkaXRvckVsZW1lbnQub25EaWRDaGFuZ2VTY3JvbGxUb3AoQHJlZnJlc2hNYXJrZXJzLmJpbmQodGhpcykpKVxuICAgIEBkaXNwb3NhYmxlcy5hZGQoQGVkaXRvckVsZW1lbnQub25EaWRDaGFuZ2VTY3JvbGxMZWZ0KEByZWZyZXNoTWFya2Vycy5iaW5kKHRoaXMpKSlcbiAgICBAbWFya2VyTGF5ZXIgPSBAZWRpdG9yLmFkZE1hcmtlckxheWVyKClcbiAgICBAZGVjb2F0aW9uQnlSYW5nZSA9IHt9XG5cbiAgICBAb25EaWRDaGFuZ2VDdXJyZW50TWF0Y2ggPT5cbiAgICAgIEB2aW1TdGF0ZS5ob3ZlclNlYXJjaENvdW50ZXIucmVzZXQoKVxuICAgICAgdW5sZXNzIEBjdXJyZW50TWF0Y2g/XG4gICAgICAgIGlmIHNldHRpbmdzLmdldCgnZmxhc2hTY3JlZW5PblNlYXJjaEhhc05vTWF0Y2gnKVxuICAgICAgICAgIEB2aW1TdGF0ZS5mbGFzaChnZXRWaXNpYmxlQnVmZmVyUmFuZ2UoQGVkaXRvciksIHR5cGU6ICdzY3JlZW4nKVxuICAgICAgICAgIGF0b20uYmVlcCgpXG4gICAgICAgIHJldHVyblxuXG4gICAgICBpZiBzZXR0aW5ncy5nZXQoJ3Nob3dIb3ZlclNlYXJjaENvdW50ZXInKVxuICAgICAgICB0ZXh0ID0gU3RyaW5nKEBjdXJyZW50TWF0Y2hJbmRleCArIDEpICsgJy8nICsgQG1hdGNoZXMubGVuZ3RoXG4gICAgICAgIHBvaW50ID0gQGN1cnJlbnRNYXRjaC5zdGFydFxuICAgICAgICBjbGFzc0xpc3QgPSBAY2xhc3NOYW1lc0ZvclJhbmdlKEBjdXJyZW50TWF0Y2gpXG5cbiAgICAgICAgQHJlc2V0SG92ZXIoKVxuICAgICAgICBAdmltU3RhdGUuaG92ZXJTZWFyY2hDb3VudGVyLnNldCh0ZXh0LCBwb2ludCwge2NsYXNzTGlzdH0pXG5cbiAgICAgICAgdW5sZXNzIEBvcHRpb25zLmluY3JlbWVudGFsU2VhcmNoXG4gICAgICAgICAgdGltZW91dCA9IHNldHRpbmdzLmdldCgnc2hvd0hvdmVyU2VhcmNoQ291bnRlckR1cmF0aW9uJylcbiAgICAgICAgICBob3ZlckNvdW50ZXJUaW1lb3V0SUQgPSBzZXRUaW1lb3V0KEByZXNldEhvdmVyLmJpbmQodGhpcyksIHRpbWVvdXQpXG5cbiAgICAgIEBlZGl0b3IudW5mb2xkQnVmZmVyUm93KEBjdXJyZW50TWF0Y2guc3RhcnQucm93KVxuICAgICAgc21hcnRTY3JvbGxUb0J1ZmZlclBvc2l0aW9uKEBlZGl0b3IsIEBjdXJyZW50TWF0Y2guc3RhcnQpXG5cbiAgICAgIGlmIHNldHRpbmdzLmdldCgnZmxhc2hPblNlYXJjaCcpXG4gICAgICAgIEB2aW1TdGF0ZS5mbGFzaChAY3VycmVudE1hdGNoLCB0eXBlOiAnc2VhcmNoJylcblxuICByZXNldEhvdmVyOiAtPlxuICAgIGlmIGhvdmVyQ291bnRlclRpbWVvdXRJRD9cbiAgICAgIGNsZWFyVGltZW91dChob3ZlckNvdW50ZXJUaW1lb3V0SUQpXG4gICAgICBob3ZlckNvdW50ZXJUaW1lb3V0SUQgPSBudWxsXG4gICAgIyBTZWUgIzY3NFxuICAgICMgVGhpcyBtZXRob2QgY2FsbGVkIHdpdGggc2V0VGltZW91dFxuICAgICMgaG92ZXJTZWFyY2hDb3VudGVyIG1pZ2h0IG5vdCBiZSBhdmFpbGFibGUgd2hlbiBlZGl0b3IgZGVzdHJveWVkLlxuICAgIEB2aW1TdGF0ZS5ob3ZlclNlYXJjaENvdW50ZXI/LnJlc2V0KClcblxuICBkZXN0cm95OiAtPlxuICAgIEBtYXJrZXJMYXllci5kZXN0cm95KClcbiAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgQGRlY29hdGlvbkJ5UmFuZ2UgPSBudWxsXG5cbiAgY2xlYXJNYXJrZXJzOiAtPlxuICAgIGZvciBtYXJrZXIgaW4gQG1hcmtlckxheWVyLmdldE1hcmtlcnMoKVxuICAgICAgbWFya2VyLmRlc3Ryb3koKVxuICAgIEBkZWNvYXRpb25CeVJhbmdlID0ge31cblxuICBjbGFzc05hbWVzRm9yUmFuZ2U6IChyYW5nZSkgLT5cbiAgICBjbGFzc05hbWVzID0gW11cbiAgICBpZiByYW5nZSBpcyBAZmlyc3RNYXRjaFxuICAgICAgY2xhc3NOYW1lcy5wdXNoKCdmaXJzdCcpXG4gICAgZWxzZSBpZiByYW5nZSBpcyBAbGFzdE1hdGNoXG4gICAgICBjbGFzc05hbWVzLnB1c2goJ2xhc3QnKVxuXG4gICAgaWYgcmFuZ2UgaXMgQGN1cnJlbnRNYXRjaFxuICAgICAgY2xhc3NOYW1lcy5wdXNoKCdjdXJyZW50JylcblxuICAgIGNsYXNzTmFtZXNcblxuICByZWZyZXNoTWFya2VyczogLT5cbiAgICBAY2xlYXJNYXJrZXJzKClcbiAgICBmb3IgcmFuZ2UgaW4gQGdldFZpc2libGVNYXRjaFJhbmdlcygpXG4gICAgICBAZGVjb2F0aW9uQnlSYW5nZVtyYW5nZS50b1N0cmluZygpXSA9IEBkZWNvcmF0ZVJhbmdlKHJhbmdlKVxuXG4gIGdldFZpc2libGVNYXRjaFJhbmdlczogLT5cbiAgICB2aXNpYmxlUmFuZ2UgPSBnZXRWaXNpYmxlQnVmZmVyUmFuZ2UoQGVkaXRvcilcbiAgICB2aXNpYmxlTWF0Y2hSYW5nZXMgPSBAbWF0Y2hlcy5maWx0ZXIgKHJhbmdlKSAtPlxuICAgICAgcmFuZ2UuaW50ZXJzZWN0c1dpdGgodmlzaWJsZVJhbmdlKVxuXG4gIGRlY29yYXRlUmFuZ2U6IChyYW5nZSkgLT5cbiAgICBjbGFzc05hbWVzID0gQGNsYXNzTmFtZXNGb3JSYW5nZShyYW5nZSlcbiAgICBjbGFzc05hbWVzID0gWyd2aW0tbW9kZS1wbHVzLXNlYXJjaC1tYXRjaCddLmNvbmNhdChjbGFzc05hbWVzLi4uKVxuICAgIEBlZGl0b3IuZGVjb3JhdGVNYXJrZXIgQG1hcmtlckxheWVyLm1hcmtCdWZmZXJSYW5nZShyYW5nZSksXG4gICAgICB0eXBlOiAnaGlnaGxpZ2h0J1xuICAgICAgY2xhc3M6IGNsYXNzTmFtZXMuam9pbignICcpXG5cbiAgc2VhcmNoOiAoZnJvbVBvaW50LCBAcGF0dGVybiwgcmVsYXRpdmVJbmRleCkgLT5cbiAgICBAbWF0Y2hlcyA9IFtdXG4gICAgQGVkaXRvci5zY2FuIEBwYXR0ZXJuLCAoe3JhbmdlfSkgPT5cbiAgICAgIEBtYXRjaGVzLnB1c2gocmFuZ2UpXG5cbiAgICBbQGZpcnN0TWF0Y2gsIC4uLiwgQGxhc3RNYXRjaF0gPSBAbWF0Y2hlc1xuXG4gICAgY3VycmVudE1hdGNoID0gbnVsbFxuICAgIGlmIHJlbGF0aXZlSW5kZXggPj0gMFxuICAgICAgZm9yIHJhbmdlIGluIEBtYXRjaGVzIHdoZW4gcmFuZ2Uuc3RhcnQuaXNHcmVhdGVyVGhhbihmcm9tUG9pbnQpXG4gICAgICAgIGN1cnJlbnRNYXRjaCA9IHJhbmdlXG4gICAgICAgIGJyZWFrXG4gICAgICBjdXJyZW50TWF0Y2ggPz0gQGZpcnN0TWF0Y2hcbiAgICAgIHJlbGF0aXZlSW5kZXgtLVxuICAgIGVsc2VcbiAgICAgIGZvciByYW5nZSBpbiBAbWF0Y2hlcyBieSAtMSB3aGVuIHJhbmdlLnN0YXJ0LmlzTGVzc1RoYW4oZnJvbVBvaW50KVxuICAgICAgICBjdXJyZW50TWF0Y2ggPSByYW5nZVxuICAgICAgICBicmVha1xuICAgICAgY3VycmVudE1hdGNoID89IEBsYXN0TWF0Y2hcbiAgICAgIHJlbGF0aXZlSW5kZXgrK1xuXG4gICAgQGN1cnJlbnRNYXRjaEluZGV4ID0gQG1hdGNoZXMuaW5kZXhPZihjdXJyZW50TWF0Y2gpXG4gICAgQHVwZGF0ZUN1cnJlbnRNYXRjaChyZWxhdGl2ZUluZGV4KVxuICAgIGlmIEBvcHRpb25zLmluY3JlbWVudGFsU2VhcmNoXG4gICAgICBAcmVmcmVzaE1hcmtlcnMoKVxuICAgIEBpbml0aWFsQ3VycmVudE1hdGNoSW5kZXggPSBAY3VycmVudE1hdGNoSW5kZXhcbiAgICBAY3VycmVudE1hdGNoXG5cbiAgdXBkYXRlQ3VycmVudE1hdGNoOiAocmVsYXRpdmVJbmRleCkgLT5cbiAgICBAY3VycmVudE1hdGNoSW5kZXggPSBnZXRJbmRleChAY3VycmVudE1hdGNoSW5kZXggKyByZWxhdGl2ZUluZGV4LCBAbWF0Y2hlcylcbiAgICBAY3VycmVudE1hdGNoID0gQG1hdGNoZXNbQGN1cnJlbnRNYXRjaEluZGV4XVxuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtY3VycmVudC1tYXRjaCcpXG5cbiAgdmlzaXQ6IChyZWxhdGl2ZUluZGV4PW51bGwpIC0+XG4gICAgaWYgcmVsYXRpdmVJbmRleD9cbiAgICAgIEBsYXN0UmVsYXRpdmVJbmRleCA9IHJlbGF0aXZlSW5kZXhcbiAgICBlbHNlXG4gICAgICByZWxhdGl2ZUluZGV4ID0gQGxhc3RSZWxhdGl2ZUluZGV4ID8gKzFcblxuICAgIHJldHVybiB1bmxlc3MgQG1hdGNoZXMubGVuZ3RoXG4gICAgb2xkRGVjb3JhdGlvbiA9IEBkZWNvYXRpb25CeVJhbmdlW0BjdXJyZW50TWF0Y2gudG9TdHJpbmcoKV1cbiAgICBAdXBkYXRlQ3VycmVudE1hdGNoKHJlbGF0aXZlSW5kZXgpXG4gICAgbmV3RGVjb3JhdGlvbiA9IEBkZWNvYXRpb25CeVJhbmdlW0BjdXJyZW50TWF0Y2gudG9TdHJpbmcoKV1cblxuICAgIGlmIG9sZERlY29yYXRpb24/XG4gICAgICBvbGRDbGFzcyA9IG9sZERlY29yYXRpb24uZ2V0UHJvcGVydGllcygpLmNsYXNzXG4gICAgICBvbGRDbGFzcyA9IG9sZENsYXNzLnJlcGxhY2UoL1xccytjdXJyZW50KFxccyspPyQvLCAnJDEnKVxuICAgICAgb2xkRGVjb3JhdGlvbi5zZXRQcm9wZXJ0aWVzKHR5cGU6ICdoaWdobGlnaHQnLCBjbGFzczogb2xkQ2xhc3MpXG5cbiAgICBpZiBuZXdEZWNvcmF0aW9uP1xuICAgICAgbmV3Q2xhc3MgPSBuZXdEZWNvcmF0aW9uLmdldFByb3BlcnRpZXMoKS5jbGFzc1xuICAgICAgbmV3Q2xhc3MgPSBuZXdDbGFzcy5yZXBsYWNlKC9cXHMrY3VycmVudChcXHMrKT8kLywgJyQxJylcbiAgICAgIG5ld0NsYXNzICs9ICcgY3VycmVudCdcbiAgICAgIG5ld0RlY29yYXRpb24uc2V0UHJvcGVydGllcyh0eXBlOiAnaGlnaGxpZ2h0JywgY2xhc3M6IG5ld0NsYXNzKVxuXG4gIGdldFJlbGF0aXZlSW5kZXg6IC0+XG4gICAgQGN1cnJlbnRNYXRjaEluZGV4IC0gQGluaXRpYWxDdXJyZW50TWF0Y2hJbmRleFxuIl19
