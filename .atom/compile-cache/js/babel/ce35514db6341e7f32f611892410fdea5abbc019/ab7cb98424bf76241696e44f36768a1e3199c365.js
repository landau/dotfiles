var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _sbDebounce = require('sb-debounce');

var _sbDebounce2 = _interopRequireDefault(_sbDebounce);

var _disposableEvent = require('disposable-event');

var _disposableEvent2 = _interopRequireDefault(_disposableEvent);

var _atom = require('atom');

var _tooltip = require('../tooltip');

var _tooltip2 = _interopRequireDefault(_tooltip);

var _helpers = require('../helpers');

var _helpers2 = require('./helpers');

var Editor = (function () {
  function Editor(textEditor) {
    var _this = this;

    _classCallCheck(this, Editor);

    this.tooltip = null;
    this.emitter = new _atom.Emitter();
    this.markers = new Map();
    this.messages = new Set();
    this.textEditor = textEditor;
    this.subscriptions = new _atom.CompositeDisposable();
    this.ignoreTooltipInvocation = false;

    this.subscriptions.add(this.emitter);
    this.subscriptions.add(atom.config.observe('linter-ui-default.showTooltip', function (showTooltip) {
      _this.showTooltip = showTooltip;
      if (!_this.showTooltip && _this.tooltip) {
        _this.removeTooltip();
      }
    }));
    this.subscriptions.add(atom.config.observe('linter-ui-default.showProviderName', function (showProviderName) {
      _this.showProviderName = showProviderName;
    }));
    this.subscriptions.add(atom.config.observe('linter-ui-default.showDecorations', function (showDecorations) {
      var notInitial = typeof _this.showDecorations !== 'undefined';
      _this.showDecorations = showDecorations;
      if (notInitial) {
        _this.updateGutter();
      }
    }));
    this.subscriptions.add(atom.config.observe('linter-ui-default.gutterPosition', function (gutterPosition) {
      var notInitial = typeof _this.gutterPosition !== 'undefined';
      _this.gutterPosition = gutterPosition;
      if (notInitial) {
        _this.updateGutter();
      }
    }));
    this.subscriptions.add(textEditor.onDidDestroy(function () {
      _this.dispose();
    }));

    var tooltipSubscription = undefined;
    this.subscriptions.add(atom.config.observe('linter-ui-default.tooltipFollows', function (tooltipFollows) {
      _this.tooltipFollows = tooltipFollows;
      if (tooltipSubscription) {
        tooltipSubscription.dispose();
      }
      tooltipSubscription = new _atom.CompositeDisposable();
      if (tooltipFollows === 'Mouse' || tooltipFollows === 'Both') {
        tooltipSubscription.add(_this.listenForMouseMovement());
      }
      if (tooltipFollows === 'Keyboard' || tooltipFollows === 'Both') {
        tooltipSubscription.add(_this.listenForKeyboardMovement());
      }
      _this.removeTooltip();
    }));
    this.subscriptions.add(new _atom.Disposable(function () {
      tooltipSubscription.dispose();
    }));

    var lastCursorPositions = new WeakMap();
    this.subscriptions.add(textEditor.onDidChangeCursorPosition(function (_ref) {
      var cursor = _ref.cursor;
      var newBufferPosition = _ref.newBufferPosition;

      var lastBufferPosition = lastCursorPositions.get(cursor);
      if (!lastBufferPosition || !lastBufferPosition.isEqual(newBufferPosition)) {
        lastCursorPositions.set(cursor, newBufferPosition);
        _this.ignoreTooltipInvocation = false;
      }
      if (_this.tooltipFollows === 'Mouse') {
        _this.removeTooltip();
      }
    }));
    this.subscriptions.add(textEditor.getBuffer().onDidChangeText(function () {
      var cursors = textEditor.getCursors();
      cursors.forEach(function (cursor) {
        lastCursorPositions.set(cursor, cursor.getBufferPosition());
      });
      if (_this.tooltipFollows !== 'Mouse') {
        _this.ignoreTooltipInvocation = true;
        _this.removeTooltip();
      }
    }));
    this.updateGutter();
    this.listenForCurrentLine();
  }

  _createClass(Editor, [{
    key: 'listenForCurrentLine',
    value: function listenForCurrentLine() {
      var _this2 = this;

      this.subscriptions.add(this.textEditor.observeCursors(function (cursor) {
        var marker = undefined;
        var lastRange = undefined;
        var lastEmpty = undefined;
        var handlePositionChange = function handlePositionChange(_ref2) {
          var start = _ref2.start;
          var end = _ref2.end;

          var gutter = _this2.gutter;
          if (!gutter || _this2.subscriptions.disposed) return;
          // We need that Range.fromObject hack below because when we focus index 0 on multi-line selection
          // end.column is the column of the last line but making a range out of two and then accesing
          // the end seems to fix it (black magic?)
          var currentRange = _atom.Range.fromObject([start, end]);
          var linesRange = _atom.Range.fromObject([[start.row, 0], [end.row, Infinity]]);
          var currentEmpty = currentRange.isEmpty();

          // NOTE: Atom does not paint gutter if multi-line and last line has zero index
          if (start.row !== end.row && currentRange.end.column === 0) {
            linesRange.end.row--;
          }
          if (lastRange && lastRange.isEqual(linesRange) && currentEmpty === lastEmpty) return;
          if (marker) marker.destroy();
          lastRange = linesRange;
          lastEmpty = currentEmpty;

          marker = _this2.textEditor.markScreenRange(linesRange, {
            invalidate: 'never'
          });
          var item = document.createElement('span');
          item.className = 'line-number cursor-line linter-cursor-line ' + (currentEmpty ? 'cursor-line-no-selection' : '');
          gutter.decorateMarker(marker, {
            item: item,
            'class': 'linter-row'
          });
        };

        var cursorMarker = cursor.getMarker();
        var subscriptions = new _atom.CompositeDisposable();
        subscriptions.add(cursorMarker.onDidChange(function (_ref3) {
          var newHeadScreenPosition = _ref3.newHeadScreenPosition;
          var newTailScreenPosition = _ref3.newTailScreenPosition;

          handlePositionChange({ start: newHeadScreenPosition, end: newTailScreenPosition });
        }));
        subscriptions.add(cursor.onDidDestroy(function () {
          _this2.subscriptions.remove(subscriptions);
          subscriptions.dispose();
        }));
        subscriptions.add(new _atom.Disposable(function () {
          if (marker) marker.destroy();
        }));
        _this2.subscriptions.add(subscriptions);
        handlePositionChange(cursorMarker.getScreenRange());
      }));
    }
  }, {
    key: 'listenForMouseMovement',
    value: function listenForMouseMovement() {
      var _this3 = this;

      var editorElement = atom.views.getView(this.textEditor);

      return (0, _disposableEvent2['default'])(editorElement, 'mousemove', (0, _sbDebounce2['default'])(function (event) {
        if (!editorElement.component || _this3.subscriptions.disposed || !(0, _helpers2.hasParent)(event.target, 'div.scroll-view')) {
          return;
        }
        var tooltip = _this3.tooltip;
        if (tooltip && (0, _helpers2.mouseEventNearPosition)({
          event: event,
          editor: _this3.textEditor,
          editorElement: editorElement,
          tooltipElement: tooltip.element,
          screenPosition: tooltip.marker.getStartScreenPosition()
        })) {
          return;
        }

        _this3.cursorPosition = (0, _helpers2.getBufferPositionFromMouseEvent)(event, _this3.textEditor, editorElement);
        _this3.ignoreTooltipInvocation = false;
        if (_this3.textEditor.largeFileMode) {
          // NOTE: Ignore if file is too large
          _this3.cursorPosition = null;
        }
        if (_this3.cursorPosition) {
          _this3.updateTooltip(_this3.cursorPosition);
        } else {
          _this3.removeTooltip();
        }
      }, 300, true));
    }
  }, {
    key: 'listenForKeyboardMovement',
    value: function listenForKeyboardMovement() {
      var _this4 = this;

      return this.textEditor.onDidChangeCursorPosition((0, _sbDebounce2['default'])(function (_ref4) {
        var newBufferPosition = _ref4.newBufferPosition;

        _this4.cursorPosition = newBufferPosition;
        _this4.updateTooltip(newBufferPosition);
      }, 16));
    }
  }, {
    key: 'updateGutter',
    value: function updateGutter() {
      var _this5 = this;

      this.removeGutter();
      if (!this.showDecorations) {
        this.gutter = null;
        return;
      }
      var priority = this.gutterPosition === 'Left' ? -100 : 100;
      this.gutter = this.textEditor.addGutter({
        name: 'linter-ui-default',
        priority: priority
      });
      this.markers.forEach(function (marker, message) {
        _this5.decorateMarker(message, marker, 'gutter');
      });
    }
  }, {
    key: 'removeGutter',
    value: function removeGutter() {
      if (this.gutter) {
        try {
          this.gutter.destroy();
        } catch (_) {
          /* This throws when the text editor is disposed */
        }
      }
    }
  }, {
    key: 'updateTooltip',
    value: function updateTooltip(position) {
      var _this6 = this;

      if (!position || this.tooltip && this.tooltip.isValid(position, this.messages)) {
        return;
      }
      this.removeTooltip();
      if (!this.showTooltip) {
        return;
      }
      if (this.ignoreTooltipInvocation) {
        return;
      }

      var messages = (0, _helpers.filterMessagesByRangeOrPoint)(this.messages, this.textEditor.getPath(), position);
      if (!messages.length) {
        return;
      }

      this.tooltip = new _tooltip2['default'](messages, position, this.textEditor);
      this.tooltip.onDidDestroy(function () {
        _this6.tooltip = null;
      });
    }
  }, {
    key: 'removeTooltip',
    value: function removeTooltip() {
      if (this.tooltip) {
        this.tooltip.marker.destroy();
      }
    }
  }, {
    key: 'apply',
    value: function apply(added, removed) {
      var _this7 = this;

      var textBuffer = this.textEditor.getBuffer();

      for (var i = 0, _length = removed.length; i < _length; i++) {
        var message = removed[i];
        var marker = this.markers.get(message);
        if (marker) {
          marker.destroy();
        }
        this.messages['delete'](message);
        this.markers['delete'](message);
      }

      var _loop = function (i, _length2) {
        var message = added[i];
        var markerRange = (0, _helpers.$range)(message);
        if (!markerRange) {
          // Only for backward compatibility
          return 'continue';
        }
        var marker = textBuffer.markRange(markerRange, {
          invalidate: 'never'
        });
        _this7.markers.set(message, marker);
        _this7.messages.add(message);
        marker.onDidChange(function (_ref5) {
          var oldHeadPosition = _ref5.oldHeadPosition;
          var newHeadPosition = _ref5.newHeadPosition;
          var isValid = _ref5.isValid;

          if (!isValid || newHeadPosition.row === 0 && oldHeadPosition.row !== 0) {
            return;
          }
          if (message.version === 1) {
            message.range = marker.previousEventState.range;
          } else {
            message.location.position = marker.previousEventState.range;
          }
        });
        _this7.decorateMarker(message, marker);
      };

      for (var i = 0, _length2 = added.length; i < _length2; i++) {
        var _ret = _loop(i, _length2);

        if (_ret === 'continue') continue;
      }

      this.updateTooltip(this.cursorPosition);
    }
  }, {
    key: 'decorateMarker',
    value: function decorateMarker(message, marker) {
      var paint = arguments.length <= 2 || arguments[2] === undefined ? 'both' : arguments[2];

      if (paint === 'both' || paint === 'editor') {
        this.textEditor.decorateMarker(marker, {
          type: 'highlight',
          'class': 'linter-highlight linter-' + message.severity
        });
      }

      var gutter = this.gutter;
      if (gutter && (paint === 'both' || paint === 'gutter')) {
        var element = document.createElement('span');
        element.className = 'linter-gutter linter-highlight linter-' + message.severity + ' icon icon-' + (message.icon || 'primitive-dot');
        gutter.decorateMarker(marker, {
          'class': 'linter-row',
          item: element
        });
      }
    }
  }, {
    key: 'onDidDestroy',
    value: function onDidDestroy(callback) {
      return this.emitter.on('did-destroy', callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.emitter.emit('did-destroy');
      this.subscriptions.dispose();
      this.removeGutter();
      this.removeTooltip();
    }
  }]);

  return Editor;
})();

module.exports = Editor;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9lZGl0b3IvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OzBCQUVxQixhQUFhOzs7OytCQUNOLGtCQUFrQjs7OztvQkFDa0IsTUFBTTs7dUJBR2xELFlBQVk7Ozs7dUJBQ3FCLFlBQVk7O3dCQUNrQixXQUFXOztJQUd4RixNQUFNO0FBZ0JDLFdBaEJQLE1BQU0sQ0FnQkUsVUFBc0IsRUFBRTs7OzBCQWhCaEMsTUFBTTs7QUFpQlIsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUE7QUFDbkIsUUFBSSxDQUFDLE9BQU8sR0FBRyxtQkFBYSxDQUFBO0FBQzVCLFFBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTtBQUN4QixRQUFJLENBQUMsUUFBUSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7QUFDekIsUUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUE7QUFDNUIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTtBQUM5QyxRQUFJLENBQUMsdUJBQXVCLEdBQUcsS0FBSyxDQUFBOztBQUVwQyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDcEMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsK0JBQStCLEVBQUUsVUFBQyxXQUFXLEVBQUs7QUFDM0YsWUFBSyxXQUFXLEdBQUcsV0FBVyxDQUFBO0FBQzlCLFVBQUksQ0FBQyxNQUFLLFdBQVcsSUFBSSxNQUFLLE9BQU8sRUFBRTtBQUNyQyxjQUFLLGFBQWEsRUFBRSxDQUFBO09BQ3JCO0tBQ0YsQ0FBQyxDQUFDLENBQUE7QUFDSCxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxvQ0FB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L1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL2VkaXRvci9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCBkZWJvdW5jZSBmcm9tICdzYi1kZWJvdW5jZSdcbmltcG9ydCBkaXNwb3NhYmxlRXZlbnQgZnJvbSAnZGlzcG9zYWJsZS1ldmVudCdcbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGUsIEVtaXR0ZXIsIFJhbmdlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB0eXBlIHsgVGV4dEVkaXRvciwgQnVmZmVyTWFya2VyLCBUZXh0RWRpdG9yR3V0dGVyLCBQb2ludCB9IGZyb20gJ2F0b20nXG5cbmltcG9ydCBUb29sdGlwIGZyb20gJy4uL3Rvb2x0aXAnXG5pbXBvcnQgeyAkcmFuZ2UsIGZpbHRlck1lc3NhZ2VzQnlSYW5nZU9yUG9pbnQgfSBmcm9tICcuLi9oZWxwZXJzJ1xuaW1wb3J0IHsgaGFzUGFyZW50LCBtb3VzZUV2ZW50TmVhclBvc2l0aW9uLCBnZXRCdWZmZXJQb3NpdGlvbkZyb21Nb3VzZUV2ZW50IH0gZnJvbSAnLi9oZWxwZXJzJ1xuaW1wb3J0IHR5cGUgeyBMaW50ZXJNZXNzYWdlIH0gZnJvbSAnLi4vdHlwZXMnXG5cbmNsYXNzIEVkaXRvciB7XG4gIGd1dHRlcjogP1RleHRFZGl0b3JHdXR0ZXI7XG4gIHRvb2x0aXA6ID9Ub29sdGlwO1xuICBlbWl0dGVyOiBFbWl0dGVyO1xuICBtYXJrZXJzOiBNYXA8TGludGVyTWVzc2FnZSwgQnVmZmVyTWFya2VyPjtcbiAgbWVzc2FnZXM6IFNldDxMaW50ZXJNZXNzYWdlPjtcbiAgdGV4dEVkaXRvcjogVGV4dEVkaXRvcjtcbiAgc2hvd1Rvb2x0aXA6IGJvb2xlYW47XG4gIHN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIGN1cnNvclBvc2l0aW9uOiA/UG9pbnQ7XG4gIGd1dHRlclBvc2l0aW9uOiBib29sZWFuO1xuICB0b29sdGlwRm9sbG93czogc3RyaW5nO1xuICBzaG93RGVjb3JhdGlvbnM6IGJvb2xlYW47XG4gIHNob3dQcm92aWRlck5hbWU6IGJvb2xlYW47XG4gIGlnbm9yZVRvb2x0aXBJbnZvY2F0aW9uOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHRleHRFZGl0b3I6IFRleHRFZGl0b3IpIHtcbiAgICB0aGlzLnRvb2x0aXAgPSBudWxsXG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKVxuICAgIHRoaXMubWFya2VycyA9IG5ldyBNYXAoKVxuICAgIHRoaXMubWVzc2FnZXMgPSBuZXcgU2V0KClcbiAgICB0aGlzLnRleHRFZGl0b3IgPSB0ZXh0RWRpdG9yXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIHRoaXMuaWdub3JlVG9vbHRpcEludm9jYXRpb24gPSBmYWxzZVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmVtaXR0ZXIpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItdWktZGVmYXVsdC5zaG93VG9vbHRpcCcsIChzaG93VG9vbHRpcCkgPT4ge1xuICAgICAgdGhpcy5zaG93VG9vbHRpcCA9IHNob3dUb29sdGlwXG4gICAgICBpZiAoIXRoaXMuc2hvd1Rvb2x0aXAgJiYgdGhpcy50b29sdGlwKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlVG9vbHRpcCgpXG4gICAgICB9XG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItdWktZGVmYXVsdC5zaG93UHJvdmlkZXJOYW1lJywgKHNob3dQcm92aWRlck5hbWUpID0+IHtcbiAgICAgIHRoaXMuc2hvd1Byb3ZpZGVyTmFtZSA9IHNob3dQcm92aWRlck5hbWVcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci11aS1kZWZhdWx0LnNob3dEZWNvcmF0aW9ucycsIChzaG93RGVjb3JhdGlvbnMpID0+IHtcbiAgICAgIGNvbnN0IG5vdEluaXRpYWwgPSB0eXBlb2YgdGhpcy5zaG93RGVjb3JhdGlvbnMgIT09ICd1bmRlZmluZWQnXG4gICAgICB0aGlzLnNob3dEZWNvcmF0aW9ucyA9IHNob3dEZWNvcmF0aW9uc1xuICAgICAgaWYgKG5vdEluaXRpYWwpIHtcbiAgICAgICAgdGhpcy51cGRhdGVHdXR0ZXIoKVxuICAgICAgfVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXVpLWRlZmF1bHQuZ3V0dGVyUG9zaXRpb24nLCAoZ3V0dGVyUG9zaXRpb24pID0+IHtcbiAgICAgIGNvbnN0IG5vdEluaXRpYWwgPSB0eXBlb2YgdGhpcy5ndXR0ZXJQb3NpdGlvbiAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgIHRoaXMuZ3V0dGVyUG9zaXRpb24gPSBndXR0ZXJQb3NpdGlvblxuICAgICAgaWYgKG5vdEluaXRpYWwpIHtcbiAgICAgICAgdGhpcy51cGRhdGVHdXR0ZXIoKVxuICAgICAgfVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGV4dEVkaXRvci5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgdGhpcy5kaXNwb3NlKClcbiAgICB9KSlcblxuICAgIGxldCB0b29sdGlwU3Vic2NyaXB0aW9uXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItdWktZGVmYXVsdC50b29sdGlwRm9sbG93cycsICh0b29sdGlwRm9sbG93cykgPT4ge1xuICAgICAgdGhpcy50b29sdGlwRm9sbG93cyA9IHRvb2x0aXBGb2xsb3dzXG4gICAgICBpZiAodG9vbHRpcFN1YnNjcmlwdGlvbikge1xuICAgICAgICB0b29sdGlwU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgICAgfVxuICAgICAgdG9vbHRpcFN1YnNjcmlwdGlvbiA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICAgIGlmICh0b29sdGlwRm9sbG93cyA9PT0gJ01vdXNlJyB8fCB0b29sdGlwRm9sbG93cyA9PT0gJ0JvdGgnKSB7XG4gICAgICAgIHRvb2x0aXBTdWJzY3JpcHRpb24uYWRkKHRoaXMubGlzdGVuRm9yTW91c2VNb3ZlbWVudCgpKVxuICAgICAgfVxuICAgICAgaWYgKHRvb2x0aXBGb2xsb3dzID09PSAnS2V5Ym9hcmQnIHx8IHRvb2x0aXBGb2xsb3dzID09PSAnQm90aCcpIHtcbiAgICAgICAgdG9vbHRpcFN1YnNjcmlwdGlvbi5hZGQodGhpcy5saXN0ZW5Gb3JLZXlib2FyZE1vdmVtZW50KCkpXG4gICAgICB9XG4gICAgICB0aGlzLnJlbW92ZVRvb2x0aXAoKVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQobmV3IERpc3Bvc2FibGUoZnVuY3Rpb24oKSB7XG4gICAgICB0b29sdGlwU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgIH0pKVxuXG4gICAgY29uc3QgbGFzdEN1cnNvclBvc2l0aW9ucyA9IG5ldyBXZWFrTWFwKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRleHRFZGl0b3Iub25EaWRDaGFuZ2VDdXJzb3JQb3NpdGlvbigoeyBjdXJzb3IsIG5ld0J1ZmZlclBvc2l0aW9uIH0pID0+IHtcbiAgICAgIGNvbnN0IGxhc3RCdWZmZXJQb3NpdGlvbiA9IGxhc3RDdXJzb3JQb3NpdGlvbnMuZ2V0KGN1cnNvcilcbiAgICAgIGlmICghbGFzdEJ1ZmZlclBvc2l0aW9uIHx8ICFsYXN0QnVmZmVyUG9zaXRpb24uaXNFcXVhbChuZXdCdWZmZXJQb3NpdGlvbikpIHtcbiAgICAgICAgbGFzdEN1cnNvclBvc2l0aW9ucy5zZXQoY3Vyc29yLCBuZXdCdWZmZXJQb3NpdGlvbilcbiAgICAgICAgdGhpcy5pZ25vcmVUb29sdGlwSW52b2NhdGlvbiA9IGZhbHNlXG4gICAgICB9XG4gICAgICBpZiAodGhpcy50b29sdGlwRm9sbG93cyA9PT0gJ01vdXNlJykge1xuICAgICAgICB0aGlzLnJlbW92ZVRvb2x0aXAoKVxuICAgICAgfVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGV4dEVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZENoYW5nZVRleHQoKCkgPT4ge1xuICAgICAgY29uc3QgY3Vyc29ycyA9IHRleHRFZGl0b3IuZ2V0Q3Vyc29ycygpXG4gICAgICBjdXJzb3JzLmZvckVhY2goKGN1cnNvcikgPT4ge1xuICAgICAgICBsYXN0Q3Vyc29yUG9zaXRpb25zLnNldChjdXJzb3IsIGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuICAgICAgfSlcbiAgICAgIGlmICh0aGlzLnRvb2x0aXBGb2xsb3dzICE9PSAnTW91c2UnKSB7XG4gICAgICAgIHRoaXMuaWdub3JlVG9vbHRpcEludm9jYXRpb24gPSB0cnVlXG4gICAgICAgIHRoaXMucmVtb3ZlVG9vbHRpcCgpXG4gICAgICB9XG4gICAgfSkpXG4gICAgdGhpcy51cGRhdGVHdXR0ZXIoKVxuICAgIHRoaXMubGlzdGVuRm9yQ3VycmVudExpbmUoKVxuICB9XG4gIGxpc3RlbkZvckN1cnJlbnRMaW5lKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy50ZXh0RWRpdG9yLm9ic2VydmVDdXJzb3JzKChjdXJzb3IpID0+IHtcbiAgICAgIGxldCBtYXJrZXJcbiAgICAgIGxldCBsYXN0UmFuZ2VcbiAgICAgIGxldCBsYXN0RW1wdHlcbiAgICAgIGNvbnN0IGhhbmRsZVBvc2l0aW9uQ2hhbmdlID0gKHsgc3RhcnQsIGVuZCB9KSA9PiB7XG4gICAgICAgIGNvbnN0IGd1dHRlciA9IHRoaXMuZ3V0dGVyXG4gICAgICAgIGlmICghZ3V0dGVyIHx8IHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlZCkgcmV0dXJuXG4gICAgICAgIC8vIFdlIG5lZWQgdGhhdCBSYW5nZS5mcm9tT2JqZWN0IGhhY2sgYmVsb3cgYmVjYXVzZSB3aGVuIHdlIGZvY3VzIGluZGV4IDAgb24gbXVsdGktbGluZSBzZWxlY3Rpb25cbiAgICAgICAgLy8gZW5kLmNvbHVtbiBpcyB0aGUgY29sdW1uIG9mIHRoZSBsYXN0IGxpbmUgYnV0IG1ha2luZyBhIHJhbmdlIG91dCBvZiB0d28gYW5kIHRoZW4gYWNjZXNpbmdcbiAgICAgICAgLy8gdGhlIGVuZCBzZWVtcyB0byBmaXggaXQgKGJsYWNrIG1hZ2ljPylcbiAgICAgICAgY29uc3QgY3VycmVudFJhbmdlID0gUmFuZ2UuZnJvbU9iamVjdChbc3RhcnQsIGVuZF0pXG4gICAgICAgIGNvbnN0IGxpbmVzUmFuZ2UgPSBSYW5nZS5mcm9tT2JqZWN0KFtbc3RhcnQucm93LCAwXSwgW2VuZC5yb3csIEluZmluaXR5XV0pXG4gICAgICAgIGNvbnN0IGN1cnJlbnRFbXB0eSA9IGN1cnJlbnRSYW5nZS5pc0VtcHR5KClcblxuICAgICAgICAvLyBOT1RFOiBBdG9tIGRvZXMgbm90IHBhaW50IGd1dHRlciBpZiBtdWx0aS1saW5lIGFuZCBsYXN0IGxpbmUgaGFzIHplcm8gaW5kZXhcbiAgICAgICAgaWYgKHN0YXJ0LnJvdyAhPT0gZW5kLnJvdyAmJiBjdXJyZW50UmFuZ2UuZW5kLmNvbHVtbiA9PT0gMCkge1xuICAgICAgICAgIGxpbmVzUmFuZ2UuZW5kLnJvdy0tXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxhc3RSYW5nZSAmJiBsYXN0UmFuZ2UuaXNFcXVhbChsaW5lc1JhbmdlKSAmJiBjdXJyZW50RW1wdHkgPT09IGxhc3RFbXB0eSkgcmV0dXJuXG4gICAgICAgIGlmIChtYXJrZXIpIG1hcmtlci5kZXN0cm95KClcbiAgICAgICAgbGFzdFJhbmdlID0gbGluZXNSYW5nZVxuICAgICAgICBsYXN0RW1wdHkgPSBjdXJyZW50RW1wdHlcblxuICAgICAgICBtYXJrZXIgPSB0aGlzLnRleHRFZGl0b3IubWFya1NjcmVlblJhbmdlKGxpbmVzUmFuZ2UsIHtcbiAgICAgICAgICBpbnZhbGlkYXRlOiAnbmV2ZXInLFxuICAgICAgICB9KVxuICAgICAgICBjb25zdCBpdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgICAgIGl0ZW0uY2xhc3NOYW1lID0gYGxpbmUtbnVtYmVyIGN1cnNvci1saW5lIGxpbnRlci1jdXJzb3ItbGluZSAke2N1cnJlbnRFbXB0eSA/ICdjdXJzb3ItbGluZS1uby1zZWxlY3Rpb24nIDogJyd9YFxuICAgICAgICBndXR0ZXIuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7XG4gICAgICAgICAgaXRlbSxcbiAgICAgICAgICBjbGFzczogJ2xpbnRlci1yb3cnLFxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICBjb25zdCBjdXJzb3JNYXJrZXIgPSBjdXJzb3IuZ2V0TWFya2VyKClcbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgICBzdWJzY3JpcHRpb25zLmFkZChjdXJzb3JNYXJrZXIub25EaWRDaGFuZ2UoKHsgbmV3SGVhZFNjcmVlblBvc2l0aW9uLCBuZXdUYWlsU2NyZWVuUG9zaXRpb24gfSkgPT4ge1xuICAgICAgICBoYW5kbGVQb3NpdGlvbkNoYW5nZSh7IHN0YXJ0OiBuZXdIZWFkU2NyZWVuUG9zaXRpb24sIGVuZDogbmV3VGFpbFNjcmVlblBvc2l0aW9uIH0pXG4gICAgICB9KSlcbiAgICAgIHN1YnNjcmlwdGlvbnMuYWRkKGN1cnNvci5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbnMucmVtb3ZlKHN1YnNjcmlwdGlvbnMpXG4gICAgICAgIHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgICB9KSlcbiAgICAgIHN1YnNjcmlwdGlvbnMuYWRkKG5ldyBEaXNwb3NhYmxlKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAobWFya2VyKSBtYXJrZXIuZGVzdHJveSgpXG4gICAgICB9KSlcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoc3Vic2NyaXB0aW9ucylcbiAgICAgIGhhbmRsZVBvc2l0aW9uQ2hhbmdlKGN1cnNvck1hcmtlci5nZXRTY3JlZW5SYW5nZSgpKVxuICAgIH0pKVxuICB9XG4gIGxpc3RlbkZvck1vdXNlTW92ZW1lbnQoKSB7XG4gICAgY29uc3QgZWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLnRleHRFZGl0b3IpXG5cbiAgICByZXR1cm4gZGlzcG9zYWJsZUV2ZW50KGVkaXRvckVsZW1lbnQsICdtb3VzZW1vdmUnLCBkZWJvdW5jZSgoZXZlbnQpID0+IHtcbiAgICAgIGlmICghZWRpdG9yRWxlbWVudC5jb21wb25lbnQgfHwgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2VkIHx8ICFoYXNQYXJlbnQoZXZlbnQudGFyZ2V0LCAnZGl2LnNjcm9sbC12aWV3JykpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBjb25zdCB0b29sdGlwID0gdGhpcy50b29sdGlwXG4gICAgICBpZiAodG9vbHRpcCAmJiBtb3VzZUV2ZW50TmVhclBvc2l0aW9uKHtcbiAgICAgICAgZXZlbnQsXG4gICAgICAgIGVkaXRvcjogdGhpcy50ZXh0RWRpdG9yLFxuICAgICAgICBlZGl0b3JFbGVtZW50LFxuICAgICAgICB0b29sdGlwRWxlbWVudDogdG9vbHRpcC5lbGVtZW50LFxuICAgICAgICBzY3JlZW5Qb3NpdGlvbjogdG9vbHRpcC5tYXJrZXIuZ2V0U3RhcnRTY3JlZW5Qb3NpdGlvbigpLFxuICAgICAgfSkpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIHRoaXMuY3Vyc29yUG9zaXRpb24gPSBnZXRCdWZmZXJQb3NpdGlvbkZyb21Nb3VzZUV2ZW50KGV2ZW50LCB0aGlzLnRleHRFZGl0b3IsIGVkaXRvckVsZW1lbnQpXG4gICAgICB0aGlzLmlnbm9yZVRvb2x0aXBJbnZvY2F0aW9uID0gZmFsc2VcbiAgICAgIGlmICh0aGlzLnRleHRFZGl0b3IubGFyZ2VGaWxlTW9kZSkge1xuICAgICAgICAvLyBOT1RFOiBJZ25vcmUgaWYgZmlsZSBpcyB0b28gbGFyZ2VcbiAgICAgICAgdGhpcy5jdXJzb3JQb3NpdGlvbiA9IG51bGxcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmN1cnNvclBvc2l0aW9uKSB7XG4gICAgICAgIHRoaXMudXBkYXRlVG9vbHRpcCh0aGlzLmN1cnNvclBvc2l0aW9uKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZW1vdmVUb29sdGlwKClcbiAgICAgIH1cbiAgICB9LCAzMDAsIHRydWUpKVxuICB9XG4gIGxpc3RlbkZvcktleWJvYXJkTW92ZW1lbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMudGV4dEVkaXRvci5vbkRpZENoYW5nZUN1cnNvclBvc2l0aW9uKGRlYm91bmNlKCh7IG5ld0J1ZmZlclBvc2l0aW9uIH0pID0+IHtcbiAgICAgIHRoaXMuY3Vyc29yUG9zaXRpb24gPSBuZXdCdWZmZXJQb3NpdGlvblxuICAgICAgdGhpcy51cGRhdGVUb29sdGlwKG5ld0J1ZmZlclBvc2l0aW9uKVxuICAgIH0sIDE2KSlcbiAgfVxuICB1cGRhdGVHdXR0ZXIoKSB7XG4gICAgdGhpcy5yZW1vdmVHdXR0ZXIoKVxuICAgIGlmICghdGhpcy5zaG93RGVjb3JhdGlvbnMpIHtcbiAgICAgIHRoaXMuZ3V0dGVyID0gbnVsbFxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHByaW9yaXR5ID0gdGhpcy5ndXR0ZXJQb3NpdGlvbiA9PT0gJ0xlZnQnID8gLTEwMCA6IDEwMFxuICAgIHRoaXMuZ3V0dGVyID0gdGhpcy50ZXh0RWRpdG9yLmFkZEd1dHRlcih7XG4gICAgICBuYW1lOiAnbGludGVyLXVpLWRlZmF1bHQnLFxuICAgICAgcHJpb3JpdHksXG4gICAgfSlcbiAgICB0aGlzLm1hcmtlcnMuZm9yRWFjaCgobWFya2VyLCBtZXNzYWdlKSA9PiB7XG4gICAgICB0aGlzLmRlY29yYXRlTWFya2VyKG1lc3NhZ2UsIG1hcmtlciwgJ2d1dHRlcicpXG4gICAgfSlcbiAgfVxuICByZW1vdmVHdXR0ZXIoKSB7XG4gICAgaWYgKHRoaXMuZ3V0dGVyKSB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLmd1dHRlci5kZXN0cm95KClcbiAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgLyogVGhpcyB0aHJvd3Mgd2hlbiB0aGUgdGV4dCBlZGl0b3IgaXMgZGlzcG9zZWQgKi9cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgdXBkYXRlVG9vbHRpcChwb3NpdGlvbjogP1BvaW50KSB7XG4gICAgaWYgKCFwb3NpdGlvbiB8fCAodGhpcy50b29sdGlwICYmIHRoaXMudG9vbHRpcC5pc1ZhbGlkKHBvc2l0aW9uLCB0aGlzLm1lc3NhZ2VzKSkpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLnJlbW92ZVRvb2x0aXAoKVxuICAgIGlmICghdGhpcy5zaG93VG9vbHRpcCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmICh0aGlzLmlnbm9yZVRvb2x0aXBJbnZvY2F0aW9uKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBtZXNzYWdlcyA9IGZpbHRlck1lc3NhZ2VzQnlSYW5nZU9yUG9pbnQodGhpcy5tZXNzYWdlcywgdGhpcy50ZXh0RWRpdG9yLmdldFBhdGgoKSwgcG9zaXRpb24pXG4gICAgaWYgKCFtZXNzYWdlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMudG9vbHRpcCA9IG5ldyBUb29sdGlwKG1lc3NhZ2VzLCBwb3NpdGlvbiwgdGhpcy50ZXh0RWRpdG9yKVxuICAgIHRoaXMudG9vbHRpcC5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgdGhpcy50b29sdGlwID0gbnVsbFxuICAgIH0pXG4gIH1cbiAgcmVtb3ZlVG9vbHRpcCgpIHtcbiAgICBpZiAodGhpcy50b29sdGlwKSB7XG4gICAgICB0aGlzLnRvb2x0aXAubWFya2VyLmRlc3Ryb3koKVxuICAgIH1cbiAgfVxuICBhcHBseShhZGRlZDogQXJyYXk8TGludGVyTWVzc2FnZT4sIHJlbW92ZWQ6IEFycmF5PExpbnRlck1lc3NhZ2U+KSB7XG4gICAgY29uc3QgdGV4dEJ1ZmZlciA9IHRoaXMudGV4dEVkaXRvci5nZXRCdWZmZXIoKVxuXG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbmd0aCA9IHJlbW92ZWQubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSByZW1vdmVkW2ldXG4gICAgICBjb25zdCBtYXJrZXIgPSB0aGlzLm1hcmtlcnMuZ2V0KG1lc3NhZ2UpXG4gICAgICBpZiAobWFya2VyKSB7XG4gICAgICAgIG1hcmtlci5kZXN0cm95KClcbiAgICAgIH1cbiAgICAgIHRoaXMubWVzc2FnZXMuZGVsZXRlKG1lc3NhZ2UpXG4gICAgICB0aGlzLm1hcmtlcnMuZGVsZXRlKG1lc3NhZ2UpXG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbmd0aCA9IGFkZGVkLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gYWRkZWRbaV1cbiAgICAgIGNvbnN0IG1hcmtlclJhbmdlID0gJHJhbmdlKG1lc3NhZ2UpXG4gICAgICBpZiAoIW1hcmtlclJhbmdlKSB7XG4gICAgICAgIC8vIE9ubHkgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHlcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGNvbnN0IG1hcmtlciA9IHRleHRCdWZmZXIubWFya1JhbmdlKG1hcmtlclJhbmdlLCB7XG4gICAgICAgIGludmFsaWRhdGU6ICduZXZlcicsXG4gICAgICB9KVxuICAgICAgdGhpcy5tYXJrZXJzLnNldChtZXNzYWdlLCBtYXJrZXIpXG4gICAgICB0aGlzLm1lc3NhZ2VzLmFkZChtZXNzYWdlKVxuICAgICAgbWFya2VyLm9uRGlkQ2hhbmdlKCh7IG9sZEhlYWRQb3NpdGlvbiwgbmV3SGVhZFBvc2l0aW9uLCBpc1ZhbGlkIH0pID0+IHtcbiAgICAgICAgaWYgKCFpc1ZhbGlkIHx8IChuZXdIZWFkUG9zaXRpb24ucm93ID09PSAwICYmIG9sZEhlYWRQb3NpdGlvbi5yb3cgIT09IDApKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1lc3NhZ2UudmVyc2lvbiA9PT0gMSkge1xuICAgICAgICAgIG1lc3NhZ2UucmFuZ2UgPSBtYXJrZXIucHJldmlvdXNFdmVudFN0YXRlLnJhbmdlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWVzc2FnZS5sb2NhdGlvbi5wb3NpdGlvbiA9IG1hcmtlci5wcmV2aW91c0V2ZW50U3RhdGUucmFuZ2VcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIHRoaXMuZGVjb3JhdGVNYXJrZXIobWVzc2FnZSwgbWFya2VyKVxuICAgIH1cblxuICAgIHRoaXMudXBkYXRlVG9vbHRpcCh0aGlzLmN1cnNvclBvc2l0aW9uKVxuICB9XG4gIGRlY29yYXRlTWFya2VyKG1lc3NhZ2U6IExpbnRlck1lc3NhZ2UsIG1hcmtlcjogT2JqZWN0LCBwYWludDogJ2d1dHRlcicgfCAnZWRpdG9yJyB8ICdib3RoJyA9ICdib3RoJykge1xuICAgIGlmIChwYWludCA9PT0gJ2JvdGgnIHx8IHBhaW50ID09PSAnZWRpdG9yJykge1xuICAgICAgdGhpcy50ZXh0RWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwge1xuICAgICAgICB0eXBlOiAnaGlnaGxpZ2h0JyxcbiAgICAgICAgY2xhc3M6IGBsaW50ZXItaGlnaGxpZ2h0IGxpbnRlci0ke21lc3NhZ2Uuc2V2ZXJpdHl9YCxcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgY29uc3QgZ3V0dGVyID0gdGhpcy5ndXR0ZXJcbiAgICBpZiAoZ3V0dGVyICYmIChwYWludCA9PT0gJ2JvdGgnIHx8IHBhaW50ID09PSAnZ3V0dGVyJykpIHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gYGxpbnRlci1ndXR0ZXIgbGludGVyLWhpZ2hsaWdodCBsaW50ZXItJHttZXNzYWdlLnNldmVyaXR5fSBpY29uIGljb24tJHttZXNzYWdlLmljb24gfHwgJ3ByaW1pdGl2ZS1kb3QnfWBcbiAgICAgIGd1dHRlci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHtcbiAgICAgICAgY2xhc3M6ICdsaW50ZXItcm93JyxcbiAgICAgICAgaXRlbTogZWxlbWVudCxcbiAgICAgIH0pXG4gICAgfVxuICB9XG4gIG9uRGlkRGVzdHJveShjYWxsYmFjazogRnVuY3Rpb24pOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtZGVzdHJveScsIGNhbGxiYWNrKVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1kZXN0cm95JylcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgdGhpcy5yZW1vdmVHdXR0ZXIoKVxuICAgIHRoaXMucmVtb3ZlVG9vbHRpcCgpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFZGl0b3JcbiJdfQ==