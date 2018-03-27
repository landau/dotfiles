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
    // NOTE: The reason we are watching cursor position and not some text change event is that
    // Some programs like gofmt setText all the time, so text changes but because they set about
    // the same text as before so cursor position doesn't change, unless the cursor is in changed
    // text area in which case it changes, that's why we remove the tooltip then
    this.subscriptions.add(textEditor.onDidChangeCursorPosition(function () {
      if (_this.tooltipFollows === 'Mouse') {
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
        var handlePositionChange = function handlePositionChange(_ref) {
          var start = _ref.start;
          var end = _ref.end;

          var gutter = _this2.gutter;
          if (!gutter) return;
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
        subscriptions.add(cursorMarker.onDidChange(function (_ref2) {
          var newHeadScreenPosition = _ref2.newHeadScreenPosition;
          var newTailScreenPosition = _ref2.newTailScreenPosition;

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
        if (!editorElement.component || !(0, _helpers2.hasParent)(event.target, 'div.scroll-view')) {
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

      return this.textEditor.onDidChangeCursorPosition((0, _sbDebounce2['default'])(function (_ref3) {
        var newBufferPosition = _ref3.newBufferPosition;

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
        marker.onDidChange(function (_ref4) {
          var oldHeadPosition = _ref4.oldHeadPosition;
          var newHeadPosition = _ref4.newHeadPosition;
          var isValid = _ref4.isValid;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9lZGl0b3IvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OzBCQUVxQixhQUFhOzs7OytCQUNOLGtCQUFrQjs7OztvQkFDa0IsTUFBTTs7dUJBR2xELFlBQVk7Ozs7dUJBQ3FCLFlBQVk7O3dCQUNrQixXQUFXOztJQUd4RixNQUFNO0FBZUMsV0FmUCxNQUFNLENBZUUsVUFBc0IsRUFBRTs7OzBCQWZoQyxNQUFNOztBQWdCUixRQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQTtBQUNuQixRQUFJLENBQUMsT0FBTyxHQUFHLG1CQUFhLENBQUE7QUFDNUIsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO0FBQ3hCLFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTtBQUN6QixRQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQTtBQUM1QixRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBOztBQUU5QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDcEMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsK0JBQStCLEVBQUUsVUFBQyxXQUFXLEVBQUs7QUFDM0YsWUFBSyxXQUFXLEdBQUcsV0FBVyxDQUFBO0FBQzlCLFVBQUksQ0FBQyxNQUFLLFdBQVcsSUFBSSxNQUFLLE9BQU8sRUFBRTtBQUNyQyxjQUFLLGFBQWEsRUFBRSxDQUFBO09BQ3JCO0tBQ0YsQ0FBQyxDQUFDLENBQUE7QUFDSCxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxvQ0FBb0MsRUFBRSxVQUFDLGdCQUFnQixFQUFLO0FBQ3JHLFlBQUssZ0JBQWdC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QUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL2VkaXRvci9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCBkZWJvdW5jZSBmcm9tICdzYi1kZWJvdW5jZSdcbmltcG9ydCBkaXNwb3NhYmxlRXZlbnQgZnJvbSAnZGlzcG9zYWJsZS1ldmVudCdcbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGUsIEVtaXR0ZXIsIFJhbmdlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB0eXBlIHsgVGV4dEVkaXRvciwgQnVmZmVyTWFya2VyLCBUZXh0RWRpdG9yR3V0dGVyLCBQb2ludCB9IGZyb20gJ2F0b20nXG5cbmltcG9ydCBUb29sdGlwIGZyb20gJy4uL3Rvb2x0aXAnXG5pbXBvcnQgeyAkcmFuZ2UsIGZpbHRlck1lc3NhZ2VzQnlSYW5nZU9yUG9pbnQgfSBmcm9tICcuLi9oZWxwZXJzJ1xuaW1wb3J0IHsgaGFzUGFyZW50LCBtb3VzZUV2ZW50TmVhclBvc2l0aW9uLCBnZXRCdWZmZXJQb3NpdGlvbkZyb21Nb3VzZUV2ZW50IH0gZnJvbSAnLi9oZWxwZXJzJ1xuaW1wb3J0IHR5cGUgeyBMaW50ZXJNZXNzYWdlIH0gZnJvbSAnLi4vdHlwZXMnXG5cbmNsYXNzIEVkaXRvciB7XG4gIGd1dHRlcjogP1RleHRFZGl0b3JHdXR0ZXI7XG4gIHRvb2x0aXA6ID9Ub29sdGlwO1xuICBlbWl0dGVyOiBFbWl0dGVyO1xuICBtYXJrZXJzOiBNYXA8TGludGVyTWVzc2FnZSwgQnVmZmVyTWFya2VyPjtcbiAgbWVzc2FnZXM6IFNldDxMaW50ZXJNZXNzYWdlPjtcbiAgdGV4dEVkaXRvcjogVGV4dEVkaXRvcjtcbiAgc2hvd1Rvb2x0aXA6IGJvb2xlYW47XG4gIHN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIGN1cnNvclBvc2l0aW9uOiA/UG9pbnQ7XG4gIGd1dHRlclBvc2l0aW9uOiBib29sZWFuO1xuICB0b29sdGlwRm9sbG93czogc3RyaW5nO1xuICBzaG93RGVjb3JhdGlvbnM6IGJvb2xlYW47XG4gIHNob3dQcm92aWRlck5hbWU6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IodGV4dEVkaXRvcjogVGV4dEVkaXRvcikge1xuICAgIHRoaXMudG9vbHRpcCA9IG51bGxcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG4gICAgdGhpcy5tYXJrZXJzID0gbmV3IE1hcCgpXG4gICAgdGhpcy5tZXNzYWdlcyA9IG5ldyBTZXQoKVxuICAgIHRoaXMudGV4dEVkaXRvciA9IHRleHRFZGl0b3JcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZW1pdHRlcilcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci11aS1kZWZhdWx0LnNob3dUb29sdGlwJywgKHNob3dUb29sdGlwKSA9PiB7XG4gICAgICB0aGlzLnNob3dUb29sdGlwID0gc2hvd1Rvb2x0aXBcbiAgICAgIGlmICghdGhpcy5zaG93VG9vbHRpcCAmJiB0aGlzLnRvb2x0aXApIHtcbiAgICAgICAgdGhpcy5yZW1vdmVUb29sdGlwKClcbiAgICAgIH1cbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci11aS1kZWZhdWx0LnNob3dQcm92aWRlck5hbWUnLCAoc2hvd1Byb3ZpZGVyTmFtZSkgPT4ge1xuICAgICAgdGhpcy5zaG93UHJvdmlkZXJOYW1lID0gc2hvd1Byb3ZpZGVyTmFtZVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXVpLWRlZmF1bHQuc2hvd0RlY29yYXRpb25zJywgKHNob3dEZWNvcmF0aW9ucykgPT4ge1xuICAgICAgY29uc3Qgbm90SW5pdGlhbCA9IHR5cGVvZiB0aGlzLnNob3dEZWNvcmF0aW9ucyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgIHRoaXMuc2hvd0RlY29yYXRpb25zID0gc2hvd0RlY29yYXRpb25zXG4gICAgICBpZiAobm90SW5pdGlhbCkge1xuICAgICAgICB0aGlzLnVwZGF0ZUd1dHRlcigpXG4gICAgICB9XG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItdWktZGVmYXVsdC5ndXR0ZXJQb3NpdGlvbicsIChndXR0ZXJQb3NpdGlvbikgPT4ge1xuICAgICAgY29uc3Qgbm90SW5pdGlhbCA9IHR5cGVvZiB0aGlzLmd1dHRlclBvc2l0aW9uICE9PSAndW5kZWZpbmVkJ1xuICAgICAgdGhpcy5ndXR0ZXJQb3NpdGlvbiA9IGd1dHRlclBvc2l0aW9uXG4gICAgICBpZiAobm90SW5pdGlhbCkge1xuICAgICAgICB0aGlzLnVwZGF0ZUd1dHRlcigpXG4gICAgICB9XG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0ZXh0RWRpdG9yLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICB0aGlzLmRpc3Bvc2UoKVxuICAgIH0pKVxuXG4gICAgbGV0IHRvb2x0aXBTdWJzY3JpcHRpb25cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci11aS1kZWZhdWx0LnRvb2x0aXBGb2xsb3dzJywgKHRvb2x0aXBGb2xsb3dzKSA9PiB7XG4gICAgICB0aGlzLnRvb2x0aXBGb2xsb3dzID0gdG9vbHRpcEZvbGxvd3NcbiAgICAgIGlmICh0b29sdGlwU3Vic2NyaXB0aW9uKSB7XG4gICAgICAgIHRvb2x0aXBTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgICB9XG4gICAgICB0b29sdGlwU3Vic2NyaXB0aW9uID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgICAgaWYgKHRvb2x0aXBGb2xsb3dzID09PSAnTW91c2UnIHx8IHRvb2x0aXBGb2xsb3dzID09PSAnQm90aCcpIHtcbiAgICAgICAgdG9vbHRpcFN1YnNjcmlwdGlvbi5hZGQodGhpcy5saXN0ZW5Gb3JNb3VzZU1vdmVtZW50KCkpXG4gICAgICB9XG4gICAgICBpZiAodG9vbHRpcEZvbGxvd3MgPT09ICdLZXlib2FyZCcgfHwgdG9vbHRpcEZvbGxvd3MgPT09ICdCb3RoJykge1xuICAgICAgICB0b29sdGlwU3Vic2NyaXB0aW9uLmFkZCh0aGlzLmxpc3RlbkZvcktleWJvYXJkTW92ZW1lbnQoKSlcbiAgICAgIH1cbiAgICAgIHRoaXMucmVtb3ZlVG9vbHRpcCgpXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChuZXcgRGlzcG9zYWJsZShmdW5jdGlvbigpIHtcbiAgICAgIHRvb2x0aXBTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgfSkpXG4gICAgLy8gTk9URTogVGhlIHJlYXNvbiB3ZSBhcmUgd2F0Y2hpbmcgY3Vyc29yIHBvc2l0aW9uIGFuZCBub3Qgc29tZSB0ZXh0IGNoYW5nZSBldmVudCBpcyB0aGF0XG4gICAgLy8gU29tZSBwcm9ncmFtcyBsaWtlIGdvZm10IHNldFRleHQgYWxsIHRoZSB0aW1lLCBzbyB0ZXh0IGNoYW5nZXMgYnV0IGJlY2F1c2UgdGhleSBzZXQgYWJvdXRcbiAgICAvLyB0aGUgc2FtZSB0ZXh0IGFzIGJlZm9yZSBzbyBjdXJzb3IgcG9zaXRpb24gZG9lc24ndCBjaGFuZ2UsIHVubGVzcyB0aGUgY3Vyc29yIGlzIGluIGNoYW5nZWRcbiAgICAvLyB0ZXh0IGFyZWEgaW4gd2hpY2ggY2FzZSBpdCBjaGFuZ2VzLCB0aGF0J3Mgd2h5IHdlIHJlbW92ZSB0aGUgdG9vbHRpcCB0aGVuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0ZXh0RWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24oKCkgPT4ge1xuICAgICAgaWYgKHRoaXMudG9vbHRpcEZvbGxvd3MgPT09ICdNb3VzZScpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVUb29sdGlwKClcbiAgICAgIH1cbiAgICB9KSlcbiAgICB0aGlzLnVwZGF0ZUd1dHRlcigpXG4gICAgdGhpcy5saXN0ZW5Gb3JDdXJyZW50TGluZSgpXG4gIH1cbiAgbGlzdGVuRm9yQ3VycmVudExpbmUoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnRleHRFZGl0b3Iub2JzZXJ2ZUN1cnNvcnMoKGN1cnNvcikgPT4ge1xuICAgICAgbGV0IG1hcmtlclxuICAgICAgbGV0IGxhc3RSYW5nZVxuICAgICAgbGV0IGxhc3RFbXB0eVxuICAgICAgY29uc3QgaGFuZGxlUG9zaXRpb25DaGFuZ2UgPSAoeyBzdGFydCwgZW5kIH0pID0+IHtcbiAgICAgICAgY29uc3QgZ3V0dGVyID0gdGhpcy5ndXR0ZXJcbiAgICAgICAgaWYgKCFndXR0ZXIpIHJldHVyblxuICAgICAgICAvLyBXZSBuZWVkIHRoYXQgUmFuZ2UuZnJvbU9iamVjdCBoYWNrIGJlbG93IGJlY2F1c2Ugd2hlbiB3ZSBmb2N1cyBpbmRleCAwIG9uIG11bHRpLWxpbmUgc2VsZWN0aW9uXG4gICAgICAgIC8vIGVuZC5jb2x1bW4gaXMgdGhlIGNvbHVtbiBvZiB0aGUgbGFzdCBsaW5lIGJ1dCBtYWtpbmcgYSByYW5nZSBvdXQgb2YgdHdvIGFuZCB0aGVuIGFjY2VzaW5nXG4gICAgICAgIC8vIHRoZSBlbmQgc2VlbXMgdG8gZml4IGl0IChibGFjayBtYWdpYz8pXG4gICAgICAgIGNvbnN0IGN1cnJlbnRSYW5nZSA9IFJhbmdlLmZyb21PYmplY3QoW3N0YXJ0LCBlbmRdKVxuICAgICAgICBjb25zdCBsaW5lc1JhbmdlID0gUmFuZ2UuZnJvbU9iamVjdChbW3N0YXJ0LnJvdywgMF0sIFtlbmQucm93LCBJbmZpbml0eV1dKVxuICAgICAgICBjb25zdCBjdXJyZW50RW1wdHkgPSBjdXJyZW50UmFuZ2UuaXNFbXB0eSgpXG5cbiAgICAgICAgLy8gTk9URTogQXRvbSBkb2VzIG5vdCBwYWludCBndXR0ZXIgaWYgbXVsdGktbGluZSBhbmQgbGFzdCBsaW5lIGhhcyB6ZXJvIGluZGV4XG4gICAgICAgIGlmIChzdGFydC5yb3cgIT09IGVuZC5yb3cgJiYgY3VycmVudFJhbmdlLmVuZC5jb2x1bW4gPT09IDApIHtcbiAgICAgICAgICBsaW5lc1JhbmdlLmVuZC5yb3ctLVxuICAgICAgICB9XG4gICAgICAgIGlmIChsYXN0UmFuZ2UgJiYgbGFzdFJhbmdlLmlzRXF1YWwobGluZXNSYW5nZSkgJiYgY3VycmVudEVtcHR5ID09PSBsYXN0RW1wdHkpIHJldHVyblxuICAgICAgICBpZiAobWFya2VyKSBtYXJrZXIuZGVzdHJveSgpXG4gICAgICAgIGxhc3RSYW5nZSA9IGxpbmVzUmFuZ2VcbiAgICAgICAgbGFzdEVtcHR5ID0gY3VycmVudEVtcHR5XG5cbiAgICAgICAgbWFya2VyID0gdGhpcy50ZXh0RWRpdG9yLm1hcmtTY3JlZW5SYW5nZShsaW5lc1JhbmdlLCB7XG4gICAgICAgICAgaW52YWxpZGF0ZTogJ25ldmVyJyxcbiAgICAgICAgfSlcbiAgICAgICAgY29uc3QgaXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgICAgICBpdGVtLmNsYXNzTmFtZSA9IGBsaW5lLW51bWJlciBjdXJzb3ItbGluZSBsaW50ZXItY3Vyc29yLWxpbmUgJHtjdXJyZW50RW1wdHkgPyAnY3Vyc29yLWxpbmUtbm8tc2VsZWN0aW9uJyA6ICcnfWBcbiAgICAgICAgZ3V0dGVyLmRlY29yYXRlTWFya2VyKG1hcmtlciwge1xuICAgICAgICAgIGl0ZW0sXG4gICAgICAgICAgY2xhc3M6ICdsaW50ZXItcm93JyxcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgY29uc3QgY3Vyc29yTWFya2VyID0gY3Vyc29yLmdldE1hcmtlcigpXG4gICAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgICAgc3Vic2NyaXB0aW9ucy5hZGQoY3Vyc29yTWFya2VyLm9uRGlkQ2hhbmdlKCh7IG5ld0hlYWRTY3JlZW5Qb3NpdGlvbiwgbmV3VGFpbFNjcmVlblBvc2l0aW9uIH0pID0+IHtcbiAgICAgICAgaGFuZGxlUG9zaXRpb25DaGFuZ2UoeyBzdGFydDogbmV3SGVhZFNjcmVlblBvc2l0aW9uLCBlbmQ6IG5ld1RhaWxTY3JlZW5Qb3NpdGlvbiB9KVxuICAgICAgfSkpXG4gICAgICBzdWJzY3JpcHRpb25zLmFkZChjdXJzb3Iub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLnJlbW92ZShzdWJzY3JpcHRpb25zKVxuICAgICAgICBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgICAgfSkpXG4gICAgICBzdWJzY3JpcHRpb25zLmFkZChuZXcgRGlzcG9zYWJsZShmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKG1hcmtlcikgbWFya2VyLmRlc3Ryb3koKVxuICAgICAgfSkpXG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHN1YnNjcmlwdGlvbnMpXG4gICAgICBoYW5kbGVQb3NpdGlvbkNoYW5nZShjdXJzb3JNYXJrZXIuZ2V0U2NyZWVuUmFuZ2UoKSlcbiAgICB9KSlcbiAgfVxuICBsaXN0ZW5Gb3JNb3VzZU1vdmVtZW50KCkge1xuICAgIGNvbnN0IGVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy50ZXh0RWRpdG9yKVxuXG4gICAgcmV0dXJuIGRpc3Bvc2FibGVFdmVudChlZGl0b3JFbGVtZW50LCAnbW91c2Vtb3ZlJywgZGVib3VuY2UoKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoIWVkaXRvckVsZW1lbnQuY29tcG9uZW50IHx8ICFoYXNQYXJlbnQoZXZlbnQudGFyZ2V0LCAnZGl2LnNjcm9sbC12aWV3JykpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBjb25zdCB0b29sdGlwID0gdGhpcy50b29sdGlwXG4gICAgICBpZiAodG9vbHRpcCAmJiBtb3VzZUV2ZW50TmVhclBvc2l0aW9uKHtcbiAgICAgICAgZXZlbnQsXG4gICAgICAgIGVkaXRvcjogdGhpcy50ZXh0RWRpdG9yLFxuICAgICAgICBlZGl0b3JFbGVtZW50LFxuICAgICAgICB0b29sdGlwRWxlbWVudDogdG9vbHRpcC5lbGVtZW50LFxuICAgICAgICBzY3JlZW5Qb3NpdGlvbjogdG9vbHRpcC5tYXJrZXIuZ2V0U3RhcnRTY3JlZW5Qb3NpdGlvbigpLFxuICAgICAgfSkpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIHRoaXMuY3Vyc29yUG9zaXRpb24gPSBnZXRCdWZmZXJQb3NpdGlvbkZyb21Nb3VzZUV2ZW50KGV2ZW50LCB0aGlzLnRleHRFZGl0b3IsIGVkaXRvckVsZW1lbnQpXG4gICAgICBpZiAodGhpcy50ZXh0RWRpdG9yLmxhcmdlRmlsZU1vZGUpIHtcbiAgICAgICAgLy8gTk9URTogSWdub3JlIGlmIGZpbGUgaXMgdG9vIGxhcmdlXG4gICAgICAgIHRoaXMuY3Vyc29yUG9zaXRpb24gPSBudWxsXG4gICAgICB9XG4gICAgICBpZiAodGhpcy5jdXJzb3JQb3NpdGlvbikge1xuICAgICAgICB0aGlzLnVwZGF0ZVRvb2x0aXAodGhpcy5jdXJzb3JQb3NpdGlvbilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucmVtb3ZlVG9vbHRpcCgpXG4gICAgICB9XG4gICAgfSwgMzAwLCB0cnVlKSlcbiAgfVxuICBsaXN0ZW5Gb3JLZXlib2FyZE1vdmVtZW50KCkge1xuICAgIHJldHVybiB0aGlzLnRleHRFZGl0b3Iub25EaWRDaGFuZ2VDdXJzb3JQb3NpdGlvbihkZWJvdW5jZSgoeyBuZXdCdWZmZXJQb3NpdGlvbiB9KSA9PiB7XG4gICAgICB0aGlzLmN1cnNvclBvc2l0aW9uID0gbmV3QnVmZmVyUG9zaXRpb25cbiAgICAgIHRoaXMudXBkYXRlVG9vbHRpcChuZXdCdWZmZXJQb3NpdGlvbilcbiAgICB9LCAxNikpXG4gIH1cbiAgdXBkYXRlR3V0dGVyKCkge1xuICAgIHRoaXMucmVtb3ZlR3V0dGVyKClcbiAgICBpZiAoIXRoaXMuc2hvd0RlY29yYXRpb25zKSB7XG4gICAgICB0aGlzLmd1dHRlciA9IG51bGxcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCBwcmlvcml0eSA9IHRoaXMuZ3V0dGVyUG9zaXRpb24gPT09ICdMZWZ0JyA/IC0xMDAgOiAxMDBcbiAgICB0aGlzLmd1dHRlciA9IHRoaXMudGV4dEVkaXRvci5hZGRHdXR0ZXIoe1xuICAgICAgbmFtZTogJ2xpbnRlci11aS1kZWZhdWx0JyxcbiAgICAgIHByaW9yaXR5LFxuICAgIH0pXG4gICAgdGhpcy5tYXJrZXJzLmZvckVhY2goKG1hcmtlciwgbWVzc2FnZSkgPT4ge1xuICAgICAgdGhpcy5kZWNvcmF0ZU1hcmtlcihtZXNzYWdlLCBtYXJrZXIsICdndXR0ZXInKVxuICAgIH0pXG4gIH1cbiAgcmVtb3ZlR3V0dGVyKCkge1xuICAgIGlmICh0aGlzLmd1dHRlcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5ndXR0ZXIuZGVzdHJveSgpXG4gICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgIC8qIFRoaXMgdGhyb3dzIHdoZW4gdGhlIHRleHQgZWRpdG9yIGlzIGRpc3Bvc2VkICovXG4gICAgICB9XG4gICAgfVxuICB9XG4gIHVwZGF0ZVRvb2x0aXAocG9zaXRpb246ID9Qb2ludCkge1xuICAgIGlmICghcG9zaXRpb24gfHwgKHRoaXMudG9vbHRpcCAmJiB0aGlzLnRvb2x0aXAuaXNWYWxpZChwb3NpdGlvbiwgdGhpcy5tZXNzYWdlcykpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5yZW1vdmVUb29sdGlwKClcbiAgICBpZiAoIXRoaXMuc2hvd1Rvb2x0aXApIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IG1lc3NhZ2VzID0gZmlsdGVyTWVzc2FnZXNCeVJhbmdlT3JQb2ludCh0aGlzLm1lc3NhZ2VzLCB0aGlzLnRleHRFZGl0b3IuZ2V0UGF0aCgpLCBwb3NpdGlvbilcbiAgICBpZiAoIW1lc3NhZ2VzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy50b29sdGlwID0gbmV3IFRvb2x0aXAobWVzc2FnZXMsIHBvc2l0aW9uLCB0aGlzLnRleHRFZGl0b3IpXG4gICAgdGhpcy50b29sdGlwLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICB0aGlzLnRvb2x0aXAgPSBudWxsXG4gICAgfSlcbiAgfVxuICByZW1vdmVUb29sdGlwKCkge1xuICAgIGlmICh0aGlzLnRvb2x0aXApIHtcbiAgICAgIHRoaXMudG9vbHRpcC5tYXJrZXIuZGVzdHJveSgpXG4gICAgfVxuICB9XG4gIGFwcGx5KGFkZGVkOiBBcnJheTxMaW50ZXJNZXNzYWdlPiwgcmVtb3ZlZDogQXJyYXk8TGludGVyTWVzc2FnZT4pIHtcbiAgICBjb25zdCB0ZXh0QnVmZmVyID0gdGhpcy50ZXh0RWRpdG9yLmdldEJ1ZmZlcigpXG5cbiAgICBmb3IgKGxldCBpID0gMCwgbGVuZ3RoID0gcmVtb3ZlZC5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IHJlbW92ZWRbaV1cbiAgICAgIGNvbnN0IG1hcmtlciA9IHRoaXMubWFya2Vycy5nZXQobWVzc2FnZSlcbiAgICAgIGlmIChtYXJrZXIpIHtcbiAgICAgICAgbWFya2VyLmRlc3Ryb3koKVxuICAgICAgfVxuICAgICAgdGhpcy5tZXNzYWdlcy5kZWxldGUobWVzc2FnZSlcbiAgICAgIHRoaXMubWFya2Vycy5kZWxldGUobWVzc2FnZSlcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMCwgbGVuZ3RoID0gYWRkZWQubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBhZGRlZFtpXVxuICAgICAgY29uc3QgbWFya2VyUmFuZ2UgPSAkcmFuZ2UobWVzc2FnZSlcbiAgICAgIGlmICghbWFya2VyUmFuZ2UpIHtcbiAgICAgICAgLy8gT25seSBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgY29uc3QgbWFya2VyID0gdGV4dEJ1ZmZlci5tYXJrUmFuZ2UobWFya2VyUmFuZ2UsIHtcbiAgICAgICAgaW52YWxpZGF0ZTogJ25ldmVyJyxcbiAgICAgIH0pXG4gICAgICB0aGlzLm1hcmtlcnMuc2V0KG1lc3NhZ2UsIG1hcmtlcilcbiAgICAgIHRoaXMubWVzc2FnZXMuYWRkKG1lc3NhZ2UpXG4gICAgICBtYXJrZXIub25EaWRDaGFuZ2UoKHsgb2xkSGVhZFBvc2l0aW9uLCBuZXdIZWFkUG9zaXRpb24sIGlzVmFsaWQgfSkgPT4ge1xuICAgICAgICBpZiAoIWlzVmFsaWQgfHwgKG5ld0hlYWRQb3NpdGlvbi5yb3cgPT09IDAgJiYgb2xkSGVhZFBvc2l0aW9uLnJvdyAhPT0gMCkpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBpZiAobWVzc2FnZS52ZXJzaW9uID09PSAxKSB7XG4gICAgICAgICAgbWVzc2FnZS5yYW5nZSA9IG1hcmtlci5wcmV2aW91c0V2ZW50U3RhdGUucmFuZ2VcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtZXNzYWdlLmxvY2F0aW9uLnBvc2l0aW9uID0gbWFya2VyLnByZXZpb3VzRXZlbnRTdGF0ZS5yYW5nZVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgdGhpcy5kZWNvcmF0ZU1hcmtlcihtZXNzYWdlLCBtYXJrZXIpXG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVUb29sdGlwKHRoaXMuY3Vyc29yUG9zaXRpb24pXG4gIH1cbiAgZGVjb3JhdGVNYXJrZXIobWVzc2FnZTogTGludGVyTWVzc2FnZSwgbWFya2VyOiBPYmplY3QsIHBhaW50OiAnZ3V0dGVyJyB8ICdlZGl0b3InIHwgJ2JvdGgnID0gJ2JvdGgnKSB7XG4gICAgaWYgKHBhaW50ID09PSAnYm90aCcgfHwgcGFpbnQgPT09ICdlZGl0b3InKSB7XG4gICAgICB0aGlzLnRleHRFZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7XG4gICAgICAgIHR5cGU6ICdoaWdobGlnaHQnLFxuICAgICAgICBjbGFzczogYGxpbnRlci1oaWdobGlnaHQgbGludGVyLSR7bWVzc2FnZS5zZXZlcml0eX1gLFxuICAgICAgfSlcbiAgICB9XG5cbiAgICBjb25zdCBndXR0ZXIgPSB0aGlzLmd1dHRlclxuICAgIGlmIChndXR0ZXIgJiYgKHBhaW50ID09PSAnYm90aCcgfHwgcGFpbnQgPT09ICdndXR0ZXInKSkge1xuICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgICAgZWxlbWVudC5jbGFzc05hbWUgPSBgbGludGVyLWd1dHRlciBsaW50ZXItaGlnaGxpZ2h0IGxpbnRlci0ke21lc3NhZ2Uuc2V2ZXJpdHl9IGljb24gaWNvbi0ke21lc3NhZ2UuaWNvbiB8fCAncHJpbWl0aXZlLWRvdCd9YFxuICAgICAgZ3V0dGVyLmRlY29yYXRlTWFya2VyKG1hcmtlciwge1xuICAgICAgICBjbGFzczogJ2xpbnRlci1yb3cnLFxuICAgICAgICBpdGVtOiBlbGVtZW50LFxuICAgICAgfSlcbiAgICB9XG4gIH1cbiAgb25EaWREZXN0cm95KGNhbGxiYWNrOiBGdW5jdGlvbik6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1kZXN0cm95JywgY2FsbGJhY2spXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWRlc3Ryb3knKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB0aGlzLnJlbW92ZUd1dHRlcigpXG4gICAgdGhpcy5yZW1vdmVUb29sdGlwKClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRvclxuIl19