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
    this.subscriptions.add(textEditor.onDidChangeCursorPosition(function () {
      _this.ignoreTooltipInvocation = false;
      if (_this.tooltipFollows === 'Mouse') {
        _this.removeTooltip();
      }
    }));
    this.subscriptions.add(textEditor.getBuffer().onDidChangeText(function () {
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
        var handlePositionChange = function handlePositionChange(_ref) {
          var start = _ref.start;
          var end = _ref.end;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9lZGl0b3IvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OzBCQUVxQixhQUFhOzs7OytCQUNOLGtCQUFrQjs7OztvQkFDa0IsTUFBTTs7dUJBR2xELFlBQVk7Ozs7dUJBQ3FCLFlBQVk7O3dCQUNrQixXQUFXOztJQUd4RixNQUFNO0FBZ0JDLFdBaEJQLE1BQU0sQ0FnQkUsVUFBc0IsRUFBRTs7OzBCQWhCaEMsTUFBTTs7QUFpQlIsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUE7QUFDbkIsUUFBSSxDQUFDLE9BQU8sR0FBRyxtQkFBYSxDQUFBO0FBQzVCLFFBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQTtBQUN4QixRQUFJLENBQUMsUUFBUSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7QUFDekIsUUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUE7QUFDNUIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTtBQUM5QyxRQUFJLENBQUMsdUJBQXVCLEdBQUcsS0FBSyxDQUFBOztBQUVwQyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDcEMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsK0JBQStCLEVBQUUsVUFBQyxXQUFXLEVBQUs7QUFDM0YsWUFBSyxXQUFXLEdBQUcsV0FBVyxDQUFBO0FBQzlCLFVBQUksQ0FBQyxNQUFLLFdBQVcsSUFBSSxNQUFLLE9BQU8sRUFBRTtBQUNyQyxjQUFLLGFBQWEsRUFBRSxDQUFBO09BQ3JCO0tBQ0YsQ0FBQyxDQUFDLENBQUE7QUFDSCxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxvQ0FB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QUFjLENBQUMsTUFBTSxFQUFFO0FBQzVCLG1CQUFPLFlBQVk7QUFDbkIsY0FBSSxFQUFFLE9BQU87U0FDZCxDQUFDLENBQUE7T0FDSDtLQUNGOzs7V0FDVyxzQkFBQyxRQUFrQixFQUFjO0FBQzNDLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQ2hEOzs7V0FDTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBO0FBQ2hDLFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDNUIsVUFBSSxDQUFDLFlBQVksRUFBRSxDQUFBO0FBQ25CLFVBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQTtLQUNyQjs7O1NBblNHLE1BQU07OztBQXNTWixNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS8uYXRvbS9wYWNrYWdlcy9saW50ZXItdWktZGVmYXVsdC9saWIvZWRpdG9yL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IGRlYm91bmNlIGZyb20gJ3NiLWRlYm91bmNlJ1xuaW1wb3J0IGRpc3Bvc2FibGVFdmVudCBmcm9tICdkaXNwb3NhYmxlLWV2ZW50J1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZSwgRW1pdHRlciwgUmFuZ2UgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHR5cGUgeyBUZXh0RWRpdG9yLCBCdWZmZXJNYXJrZXIsIFRleHRFZGl0b3JHdXR0ZXIsIFBvaW50IH0gZnJvbSAnYXRvbSdcblxuaW1wb3J0IFRvb2x0aXAgZnJvbSAnLi4vdG9vbHRpcCdcbmltcG9ydCB7ICRyYW5nZSwgZmlsdGVyTWVzc2FnZXNCeVJhbmdlT3JQb2ludCB9IGZyb20gJy4uL2hlbHBlcnMnXG5pbXBvcnQgeyBoYXNQYXJlbnQsIG1vdXNlRXZlbnROZWFyUG9zaXRpb24sIGdldEJ1ZmZlclBvc2l0aW9uRnJvbU1vdXNlRXZlbnQgfSBmcm9tICcuL2hlbHBlcnMnXG5pbXBvcnQgdHlwZSB7IExpbnRlck1lc3NhZ2UgfSBmcm9tICcuLi90eXBlcydcblxuY2xhc3MgRWRpdG9yIHtcbiAgZ3V0dGVyOiA/VGV4dEVkaXRvckd1dHRlcjtcbiAgdG9vbHRpcDogP1Rvb2x0aXA7XG4gIGVtaXR0ZXI6IEVtaXR0ZXI7XG4gIG1hcmtlcnM6IE1hcDxMaW50ZXJNZXNzYWdlLCBCdWZmZXJNYXJrZXI+O1xuICBtZXNzYWdlczogU2V0PExpbnRlck1lc3NhZ2U+O1xuICB0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yO1xuICBzaG93VG9vbHRpcDogYm9vbGVhbjtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgY3Vyc29yUG9zaXRpb246ID9Qb2ludDtcbiAgZ3V0dGVyUG9zaXRpb246IGJvb2xlYW47XG4gIHRvb2x0aXBGb2xsb3dzOiBzdHJpbmc7XG4gIHNob3dEZWNvcmF0aW9uczogYm9vbGVhbjtcbiAgc2hvd1Byb3ZpZGVyTmFtZTogYm9vbGVhbjtcbiAgaWdub3JlVG9vbHRpcEludm9jYXRpb246IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IodGV4dEVkaXRvcjogVGV4dEVkaXRvcikge1xuICAgIHRoaXMudG9vbHRpcCA9IG51bGxcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG4gICAgdGhpcy5tYXJrZXJzID0gbmV3IE1hcCgpXG4gICAgdGhpcy5tZXNzYWdlcyA9IG5ldyBTZXQoKVxuICAgIHRoaXMudGV4dEVkaXRvciA9IHRleHRFZGl0b3JcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgdGhpcy5pZ25vcmVUb29sdGlwSW52b2NhdGlvbiA9IGZhbHNlXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZW1pdHRlcilcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci11aS1kZWZhdWx0LnNob3dUb29sdGlwJywgKHNob3dUb29sdGlwKSA9PiB7XG4gICAgICB0aGlzLnNob3dUb29sdGlwID0gc2hvd1Rvb2x0aXBcbiAgICAgIGlmICghdGhpcy5zaG93VG9vbHRpcCAmJiB0aGlzLnRvb2x0aXApIHtcbiAgICAgICAgdGhpcy5yZW1vdmVUb29sdGlwKClcbiAgICAgIH1cbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci11aS1kZWZhdWx0LnNob3dQcm92aWRlck5hbWUnLCAoc2hvd1Byb3ZpZGVyTmFtZSkgPT4ge1xuICAgICAgdGhpcy5zaG93UHJvdmlkZXJOYW1lID0gc2hvd1Byb3ZpZGVyTmFtZVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXVpLWRlZmF1bHQuc2hvd0RlY29yYXRpb25zJywgKHNob3dEZWNvcmF0aW9ucykgPT4ge1xuICAgICAgY29uc3Qgbm90SW5pdGlhbCA9IHR5cGVvZiB0aGlzLnNob3dEZWNvcmF0aW9ucyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgIHRoaXMuc2hvd0RlY29yYXRpb25zID0gc2hvd0RlY29yYXRpb25zXG4gICAgICBpZiAobm90SW5pdGlhbCkge1xuICAgICAgICB0aGlzLnVwZGF0ZUd1dHRlcigpXG4gICAgICB9XG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItdWktZGVmYXVsdC5ndXR0ZXJQb3NpdGlvbicsIChndXR0ZXJQb3NpdGlvbikgPT4ge1xuICAgICAgY29uc3Qgbm90SW5pdGlhbCA9IHR5cGVvZiB0aGlzLmd1dHRlclBvc2l0aW9uICE9PSAndW5kZWZpbmVkJ1xuICAgICAgdGhpcy5ndXR0ZXJQb3NpdGlvbiA9IGd1dHRlclBvc2l0aW9uXG4gICAgICBpZiAobm90SW5pdGlhbCkge1xuICAgICAgICB0aGlzLnVwZGF0ZUd1dHRlcigpXG4gICAgICB9XG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0ZXh0RWRpdG9yLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICB0aGlzLmRpc3Bvc2UoKVxuICAgIH0pKVxuXG4gICAgbGV0IHRvb2x0aXBTdWJzY3JpcHRpb25cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci11aS1kZWZhdWx0LnRvb2x0aXBGb2xsb3dzJywgKHRvb2x0aXBGb2xsb3dzKSA9PiB7XG4gICAgICB0aGlzLnRvb2x0aXBGb2xsb3dzID0gdG9vbHRpcEZvbGxvd3NcbiAgICAgIGlmICh0b29sdGlwU3Vic2NyaXB0aW9uKSB7XG4gICAgICAgIHRvb2x0aXBTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgICB9XG4gICAgICB0b29sdGlwU3Vic2NyaXB0aW9uID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgICAgaWYgKHRvb2x0aXBGb2xsb3dzID09PSAnTW91c2UnIHx8IHRvb2x0aXBGb2xsb3dzID09PSAnQm90aCcpIHtcbiAgICAgICAgdG9vbHRpcFN1YnNjcmlwdGlvbi5hZGQodGhpcy5saXN0ZW5Gb3JNb3VzZU1vdmVtZW50KCkpXG4gICAgICB9XG4gICAgICBpZiAodG9vbHRpcEZvbGxvd3MgPT09ICdLZXlib2FyZCcgfHwgdG9vbHRpcEZvbGxvd3MgPT09ICdCb3RoJykge1xuICAgICAgICB0b29sdGlwU3Vic2NyaXB0aW9uLmFkZCh0aGlzLmxpc3RlbkZvcktleWJvYXJkTW92ZW1lbnQoKSlcbiAgICAgIH1cbiAgICAgIHRoaXMucmVtb3ZlVG9vbHRpcCgpXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChuZXcgRGlzcG9zYWJsZShmdW5jdGlvbigpIHtcbiAgICAgIHRvb2x0aXBTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0ZXh0RWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24oKCkgPT4ge1xuICAgICAgdGhpcy5pZ25vcmVUb29sdGlwSW52b2NhdGlvbiA9IGZhbHNlXG4gICAgICBpZiAodGhpcy50b29sdGlwRm9sbG93cyA9PT0gJ01vdXNlJykge1xuICAgICAgICB0aGlzLnJlbW92ZVRvb2x0aXAoKVxuICAgICAgfVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGV4dEVkaXRvci5nZXRCdWZmZXIoKS5vbkRpZENoYW5nZVRleHQoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMudG9vbHRpcEZvbGxvd3MgIT09ICdNb3VzZScpIHtcbiAgICAgICAgdGhpcy5pZ25vcmVUb29sdGlwSW52b2NhdGlvbiA9IHRydWVcbiAgICAgICAgdGhpcy5yZW1vdmVUb29sdGlwKClcbiAgICAgIH1cbiAgICB9KSlcbiAgICB0aGlzLnVwZGF0ZUd1dHRlcigpXG4gICAgdGhpcy5saXN0ZW5Gb3JDdXJyZW50TGluZSgpXG4gIH1cbiAgbGlzdGVuRm9yQ3VycmVudExpbmUoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLnRleHRFZGl0b3Iub2JzZXJ2ZUN1cnNvcnMoKGN1cnNvcikgPT4ge1xuICAgICAgbGV0IG1hcmtlclxuICAgICAgbGV0IGxhc3RSYW5nZVxuICAgICAgbGV0IGxhc3RFbXB0eVxuICAgICAgY29uc3QgaGFuZGxlUG9zaXRpb25DaGFuZ2UgPSAoeyBzdGFydCwgZW5kIH0pID0+IHtcbiAgICAgICAgY29uc3QgZ3V0dGVyID0gdGhpcy5ndXR0ZXJcbiAgICAgICAgaWYgKCFndXR0ZXIgfHwgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2VkKSByZXR1cm5cbiAgICAgICAgLy8gV2UgbmVlZCB0aGF0IFJhbmdlLmZyb21PYmplY3QgaGFjayBiZWxvdyBiZWNhdXNlIHdoZW4gd2UgZm9jdXMgaW5kZXggMCBvbiBtdWx0aS1saW5lIHNlbGVjdGlvblxuICAgICAgICAvLyBlbmQuY29sdW1uIGlzIHRoZSBjb2x1bW4gb2YgdGhlIGxhc3QgbGluZSBidXQgbWFraW5nIGEgcmFuZ2Ugb3V0IG9mIHR3byBhbmQgdGhlbiBhY2Nlc2luZ1xuICAgICAgICAvLyB0aGUgZW5kIHNlZW1zIHRvIGZpeCBpdCAoYmxhY2sgbWFnaWM/KVxuICAgICAgICBjb25zdCBjdXJyZW50UmFuZ2UgPSBSYW5nZS5mcm9tT2JqZWN0KFtzdGFydCwgZW5kXSlcbiAgICAgICAgY29uc3QgbGluZXNSYW5nZSA9IFJhbmdlLmZyb21PYmplY3QoW1tzdGFydC5yb3csIDBdLCBbZW5kLnJvdywgSW5maW5pdHldXSlcbiAgICAgICAgY29uc3QgY3VycmVudEVtcHR5ID0gY3VycmVudFJhbmdlLmlzRW1wdHkoKVxuXG4gICAgICAgIC8vIE5PVEU6IEF0b20gZG9lcyBub3QgcGFpbnQgZ3V0dGVyIGlmIG11bHRpLWxpbmUgYW5kIGxhc3QgbGluZSBoYXMgemVybyBpbmRleFxuICAgICAgICBpZiAoc3RhcnQucm93ICE9PSBlbmQucm93ICYmIGN1cnJlbnRSYW5nZS5lbmQuY29sdW1uID09PSAwKSB7XG4gICAgICAgICAgbGluZXNSYW5nZS5lbmQucm93LS1cbiAgICAgICAgfVxuICAgICAgICBpZiAobGFzdFJhbmdlICYmIGxhc3RSYW5nZS5pc0VxdWFsKGxpbmVzUmFuZ2UpICYmIGN1cnJlbnRFbXB0eSA9PT0gbGFzdEVtcHR5KSByZXR1cm5cbiAgICAgICAgaWYgKG1hcmtlcikgbWFya2VyLmRlc3Ryb3koKVxuICAgICAgICBsYXN0UmFuZ2UgPSBsaW5lc1JhbmdlXG4gICAgICAgIGxhc3RFbXB0eSA9IGN1cnJlbnRFbXB0eVxuXG4gICAgICAgIG1hcmtlciA9IHRoaXMudGV4dEVkaXRvci5tYXJrU2NyZWVuUmFuZ2UobGluZXNSYW5nZSwge1xuICAgICAgICAgIGludmFsaWRhdGU6ICduZXZlcicsXG4gICAgICAgIH0pXG4gICAgICAgIGNvbnN0IGl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICAgICAgaXRlbS5jbGFzc05hbWUgPSBgbGluZS1udW1iZXIgY3Vyc29yLWxpbmUgbGludGVyLWN1cnNvci1saW5lICR7Y3VycmVudEVtcHR5ID8gJ2N1cnNvci1saW5lLW5vLXNlbGVjdGlvbicgOiAnJ31gXG4gICAgICAgIGd1dHRlci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHtcbiAgICAgICAgICBpdGVtLFxuICAgICAgICAgIGNsYXNzOiAnbGludGVyLXJvdycsXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGN1cnNvck1hcmtlciA9IGN1cnNvci5nZXRNYXJrZXIoKVxuICAgICAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICAgIHN1YnNjcmlwdGlvbnMuYWRkKGN1cnNvck1hcmtlci5vbkRpZENoYW5nZSgoeyBuZXdIZWFkU2NyZWVuUG9zaXRpb24sIG5ld1RhaWxTY3JlZW5Qb3NpdGlvbiB9KSA9PiB7XG4gICAgICAgIGhhbmRsZVBvc2l0aW9uQ2hhbmdlKHsgc3RhcnQ6IG5ld0hlYWRTY3JlZW5Qb3NpdGlvbiwgZW5kOiBuZXdUYWlsU2NyZWVuUG9zaXRpb24gfSlcbiAgICAgIH0pKVxuICAgICAgc3Vic2NyaXB0aW9ucy5hZGQoY3Vyc29yLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5yZW1vdmUoc3Vic2NyaXB0aW9ucylcbiAgICAgICAgc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICAgIH0pKVxuICAgICAgc3Vic2NyaXB0aW9ucy5hZGQobmV3IERpc3Bvc2FibGUoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChtYXJrZXIpIG1hcmtlci5kZXN0cm95KClcbiAgICAgIH0pKVxuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChzdWJzY3JpcHRpb25zKVxuICAgICAgaGFuZGxlUG9zaXRpb25DaGFuZ2UoY3Vyc29yTWFya2VyLmdldFNjcmVlblJhbmdlKCkpXG4gICAgfSkpXG4gIH1cbiAgbGlzdGVuRm9yTW91c2VNb3ZlbWVudCgpIHtcbiAgICBjb25zdCBlZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMudGV4dEVkaXRvcilcblxuICAgIHJldHVybiBkaXNwb3NhYmxlRXZlbnQoZWRpdG9yRWxlbWVudCwgJ21vdXNlbW92ZScsIGRlYm91bmNlKChldmVudCkgPT4ge1xuICAgICAgaWYgKCFlZGl0b3JFbGVtZW50LmNvbXBvbmVudCB8fCB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZWQgfHwgIWhhc1BhcmVudChldmVudC50YXJnZXQsICdkaXYuc2Nyb2xsLXZpZXcnKSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGNvbnN0IHRvb2x0aXAgPSB0aGlzLnRvb2x0aXBcbiAgICAgIGlmICh0b29sdGlwICYmIG1vdXNlRXZlbnROZWFyUG9zaXRpb24oe1xuICAgICAgICBldmVudCxcbiAgICAgICAgZWRpdG9yOiB0aGlzLnRleHRFZGl0b3IsXG4gICAgICAgIGVkaXRvckVsZW1lbnQsXG4gICAgICAgIHRvb2x0aXBFbGVtZW50OiB0b29sdGlwLmVsZW1lbnQsXG4gICAgICAgIHNjcmVlblBvc2l0aW9uOiB0b29sdGlwLm1hcmtlci5nZXRTdGFydFNjcmVlblBvc2l0aW9uKCksXG4gICAgICB9KSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgdGhpcy5jdXJzb3JQb3NpdGlvbiA9IGdldEJ1ZmZlclBvc2l0aW9uRnJvbU1vdXNlRXZlbnQoZXZlbnQsIHRoaXMudGV4dEVkaXRvciwgZWRpdG9yRWxlbWVudClcbiAgICAgIHRoaXMuaWdub3JlVG9vbHRpcEludm9jYXRpb24gPSBmYWxzZVxuICAgICAgaWYgKHRoaXMudGV4dEVkaXRvci5sYXJnZUZpbGVNb2RlKSB7XG4gICAgICAgIC8vIE5PVEU6IElnbm9yZSBpZiBmaWxlIGlzIHRvbyBsYXJnZVxuICAgICAgICB0aGlzLmN1cnNvclBvc2l0aW9uID0gbnVsbFxuICAgICAgfVxuICAgICAgaWYgKHRoaXMuY3Vyc29yUG9zaXRpb24pIHtcbiAgICAgICAgdGhpcy51cGRhdGVUb29sdGlwKHRoaXMuY3Vyc29yUG9zaXRpb24pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJlbW92ZVRvb2x0aXAoKVxuICAgICAgfVxuICAgIH0sIDMwMCwgdHJ1ZSkpXG4gIH1cbiAgbGlzdGVuRm9yS2V5Ym9hcmRNb3ZlbWVudCgpIHtcbiAgICByZXR1cm4gdGhpcy50ZXh0RWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24oZGVib3VuY2UoKHsgbmV3QnVmZmVyUG9zaXRpb24gfSkgPT4ge1xuICAgICAgdGhpcy5jdXJzb3JQb3NpdGlvbiA9IG5ld0J1ZmZlclBvc2l0aW9uXG4gICAgICB0aGlzLnVwZGF0ZVRvb2x0aXAobmV3QnVmZmVyUG9zaXRpb24pXG4gICAgfSwgMTYpKVxuICB9XG4gIHVwZGF0ZUd1dHRlcigpIHtcbiAgICB0aGlzLnJlbW92ZUd1dHRlcigpXG4gICAgaWYgKCF0aGlzLnNob3dEZWNvcmF0aW9ucykge1xuICAgICAgdGhpcy5ndXR0ZXIgPSBudWxsXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgcHJpb3JpdHkgPSB0aGlzLmd1dHRlclBvc2l0aW9uID09PSAnTGVmdCcgPyAtMTAwIDogMTAwXG4gICAgdGhpcy5ndXR0ZXIgPSB0aGlzLnRleHRFZGl0b3IuYWRkR3V0dGVyKHtcbiAgICAgIG5hbWU6ICdsaW50ZXItdWktZGVmYXVsdCcsXG4gICAgICBwcmlvcml0eSxcbiAgICB9KVxuICAgIHRoaXMubWFya2Vycy5mb3JFYWNoKChtYXJrZXIsIG1lc3NhZ2UpID0+IHtcbiAgICAgIHRoaXMuZGVjb3JhdGVNYXJrZXIobWVzc2FnZSwgbWFya2VyLCAnZ3V0dGVyJylcbiAgICB9KVxuICB9XG4gIHJlbW92ZUd1dHRlcigpIHtcbiAgICBpZiAodGhpcy5ndXR0ZXIpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuZ3V0dGVyLmRlc3Ryb3koKVxuICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAvKiBUaGlzIHRocm93cyB3aGVuIHRoZSB0ZXh0IGVkaXRvciBpcyBkaXNwb3NlZCAqL1xuICAgICAgfVxuICAgIH1cbiAgfVxuICB1cGRhdGVUb29sdGlwKHBvc2l0aW9uOiA/UG9pbnQpIHtcbiAgICBpZiAoIXBvc2l0aW9uIHx8ICh0aGlzLnRvb2x0aXAgJiYgdGhpcy50b29sdGlwLmlzVmFsaWQocG9zaXRpb24sIHRoaXMubWVzc2FnZXMpKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMucmVtb3ZlVG9vbHRpcCgpXG4gICAgaWYgKCF0aGlzLnNob3dUb29sdGlwKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKHRoaXMuaWdub3JlVG9vbHRpcEludm9jYXRpb24pIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IG1lc3NhZ2VzID0gZmlsdGVyTWVzc2FnZXNCeVJhbmdlT3JQb2ludCh0aGlzLm1lc3NhZ2VzLCB0aGlzLnRleHRFZGl0b3IuZ2V0UGF0aCgpLCBwb3NpdGlvbilcbiAgICBpZiAoIW1lc3NhZ2VzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy50b29sdGlwID0gbmV3IFRvb2x0aXAobWVzc2FnZXMsIHBvc2l0aW9uLCB0aGlzLnRleHRFZGl0b3IpXG4gICAgdGhpcy50b29sdGlwLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICB0aGlzLnRvb2x0aXAgPSBudWxsXG4gICAgfSlcbiAgfVxuICByZW1vdmVUb29sdGlwKCkge1xuICAgIGlmICh0aGlzLnRvb2x0aXApIHtcbiAgICAgIHRoaXMudG9vbHRpcC5tYXJrZXIuZGVzdHJveSgpXG4gICAgfVxuICB9XG4gIGFwcGx5KGFkZGVkOiBBcnJheTxMaW50ZXJNZXNzYWdlPiwgcmVtb3ZlZDogQXJyYXk8TGludGVyTWVzc2FnZT4pIHtcbiAgICBjb25zdCB0ZXh0QnVmZmVyID0gdGhpcy50ZXh0RWRpdG9yLmdldEJ1ZmZlcigpXG5cbiAgICBmb3IgKGxldCBpID0gMCwgbGVuZ3RoID0gcmVtb3ZlZC5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IHJlbW92ZWRbaV1cbiAgICAgIGNvbnN0IG1hcmtlciA9IHRoaXMubWFya2Vycy5nZXQobWVzc2FnZSlcbiAgICAgIGlmIChtYXJrZXIpIHtcbiAgICAgICAgbWFya2VyLmRlc3Ryb3koKVxuICAgICAgfVxuICAgICAgdGhpcy5tZXNzYWdlcy5kZWxldGUobWVzc2FnZSlcbiAgICAgIHRoaXMubWFya2Vycy5kZWxldGUobWVzc2FnZSlcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMCwgbGVuZ3RoID0gYWRkZWQubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBhZGRlZFtpXVxuICAgICAgY29uc3QgbWFya2VyUmFuZ2UgPSAkcmFuZ2UobWVzc2FnZSlcbiAgICAgIGlmICghbWFya2VyUmFuZ2UpIHtcbiAgICAgICAgLy8gT25seSBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgY29uc3QgbWFya2VyID0gdGV4dEJ1ZmZlci5tYXJrUmFuZ2UobWFya2VyUmFuZ2UsIHtcbiAgICAgICAgaW52YWxpZGF0ZTogJ25ldmVyJyxcbiAgICAgIH0pXG4gICAgICB0aGlzLm1hcmtlcnMuc2V0KG1lc3NhZ2UsIG1hcmtlcilcbiAgICAgIHRoaXMubWVzc2FnZXMuYWRkKG1lc3NhZ2UpXG4gICAgICBtYXJrZXIub25EaWRDaGFuZ2UoKHsgb2xkSGVhZFBvc2l0aW9uLCBuZXdIZWFkUG9zaXRpb24sIGlzVmFsaWQgfSkgPT4ge1xuICAgICAgICBpZiAoIWlzVmFsaWQgfHwgKG5ld0hlYWRQb3NpdGlvbi5yb3cgPT09IDAgJiYgb2xkSGVhZFBvc2l0aW9uLnJvdyAhPT0gMCkpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBpZiAobWVzc2FnZS52ZXJzaW9uID09PSAxKSB7XG4gICAgICAgICAgbWVzc2FnZS5yYW5nZSA9IG1hcmtlci5wcmV2aW91c0V2ZW50U3RhdGUucmFuZ2VcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtZXNzYWdlLmxvY2F0aW9uLnBvc2l0aW9uID0gbWFya2VyLnByZXZpb3VzRXZlbnRTdGF0ZS5yYW5nZVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgdGhpcy5kZWNvcmF0ZU1hcmtlcihtZXNzYWdlLCBtYXJrZXIpXG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVUb29sdGlwKHRoaXMuY3Vyc29yUG9zaXRpb24pXG4gIH1cbiAgZGVjb3JhdGVNYXJrZXIobWVzc2FnZTogTGludGVyTWVzc2FnZSwgbWFya2VyOiBPYmplY3QsIHBhaW50OiAnZ3V0dGVyJyB8ICdlZGl0b3InIHwgJ2JvdGgnID0gJ2JvdGgnKSB7XG4gICAgaWYgKHBhaW50ID09PSAnYm90aCcgfHwgcGFpbnQgPT09ICdlZGl0b3InKSB7XG4gICAgICB0aGlzLnRleHRFZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7XG4gICAgICAgIHR5cGU6ICdoaWdobGlnaHQnLFxuICAgICAgICBjbGFzczogYGxpbnRlci1oaWdobGlnaHQgbGludGVyLSR7bWVzc2FnZS5zZXZlcml0eX1gLFxuICAgICAgfSlcbiAgICB9XG5cbiAgICBjb25zdCBndXR0ZXIgPSB0aGlzLmd1dHRlclxuICAgIGlmIChndXR0ZXIgJiYgKHBhaW50ID09PSAnYm90aCcgfHwgcGFpbnQgPT09ICdndXR0ZXInKSkge1xuICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgICAgZWxlbWVudC5jbGFzc05hbWUgPSBgbGludGVyLWd1dHRlciBsaW50ZXItaGlnaGxpZ2h0IGxpbnRlci0ke21lc3NhZ2Uuc2V2ZXJpdHl9IGljb24gaWNvbi0ke21lc3NhZ2UuaWNvbiB8fCAncHJpbWl0aXZlLWRvdCd9YFxuICAgICAgZ3V0dGVyLmRlY29yYXRlTWFya2VyKG1hcmtlciwge1xuICAgICAgICBjbGFzczogJ2xpbnRlci1yb3cnLFxuICAgICAgICBpdGVtOiBlbGVtZW50LFxuICAgICAgfSlcbiAgICB9XG4gIH1cbiAgb25EaWREZXN0cm95KGNhbGxiYWNrOiBGdW5jdGlvbik6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1kZXN0cm95JywgY2FsbGJhY2spXG4gIH1cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWRlc3Ryb3knKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB0aGlzLnJlbW92ZUd1dHRlcigpXG4gICAgdGhpcy5yZW1vdmVUb29sdGlwKClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRvclxuIl19