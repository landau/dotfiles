Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _sbDebounce = require('sb-debounce');

var _sbDebounce2 = _interopRequireDefault(_sbDebounce);

var _disposableEvent = require('disposable-event');

var _disposableEvent2 = _interopRequireDefault(_disposableEvent);

var _atom = require('atom');

var _sbEventKit = require('sb-event-kit');

var _tooltip = require('../tooltip');

var _tooltip2 = _interopRequireDefault(_tooltip);

var _helpers = require('../helpers');

var _helpers2 = require('./helpers');

var Editor = (function () {
  function Editor(textEditor) {
    var _this = this;

    _classCallCheck(this, Editor);

    this.tooltip = null;
    this.emitter = new _sbEventKit.Emitter();
    this.markers = new Map();
    this.messages = new Set();
    this.textEditor = textEditor;
    this.subscriptions = new _sbEventKit.CompositeDisposable();

    this.subscriptions.add(this.emitter);
    this.subscriptions.add(atom.config.observe('linter-ui-default.showTooltip', function (showTooltip) {
      _this.showTooltip = showTooltip;
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
      if (tooltipSubscription) {
        tooltipSubscription.dispose();
      }
      tooltipSubscription = tooltipFollows === 'Mouse' ? _this.listenForMouseMovement() : _this.listenForKeyboardMovement();
      _this.removeTooltip();
    }));
    this.subscriptions.add(function () {
      tooltipSubscription.dispose();
    });
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

          marker = _this2.textEditor.markBufferRange(linesRange, {
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
        var subscriptions = new _sbEventKit.CompositeDisposable();
        subscriptions.add(cursorMarker.onDidChange(function (_ref2) {
          var newHeadBufferPosition = _ref2.newHeadBufferPosition;
          var newTailBufferPosition = _ref2.newTailBufferPosition;

          handlePositionChange({ start: newHeadBufferPosition, end: newTailBufferPosition });
        }));
        subscriptions.add(cursor.onDidDestroy(function () {
          _this2.subscriptions['delete'](subscriptions);
          subscriptions.dispose();
        }));
        subscriptions.add(function () {
          if (marker) marker.destroy();
        });
        _this2.subscriptions.add(subscriptions);
        handlePositionChange(cursorMarker.getBufferRange());
      }));
    }
  }, {
    key: 'listenForMouseMovement',
    value: function listenForMouseMovement() {
      var _this3 = this;

      var editorElement = atom.views.getView(this.textEditor);
      return (0, _disposableEvent2['default'])(editorElement, 'mousemove', (0, _sbDebounce2['default'])(function (e) {
        if (!editorElement.component || !(0, _helpers2.hasParent)(e.target, 'div.line')) {
          return;
        }
        var tooltip = _this3.tooltip;
        if (tooltip && (0, _helpers2.mouseEventNearPosition)(e, editorElement, tooltip.marker.getStartScreenPosition(), tooltip.element.offsetWidth, tooltip.element.offsetHeight)) {
          return;
        }
        // NOTE: Ignore if file is too big
        if (_this3.textEditor.largeFileMode) {
          _this3.removeTooltip();
          return;
        }
        var cursorPosition = (0, _helpers2.getBufferPositionFromMouseEvent)(e, _this3.textEditor, editorElement);
        _this3.cursorPosition = cursorPosition;
        if (cursorPosition) {
          _this3.updateTooltip(_this3.cursorPosition);
        } else {
          _this3.removeTooltip();
        }
      }, 200, true));
    }
  }, {
    key: 'listenForKeyboardMovement',
    value: function listenForKeyboardMovement() {
      var _this4 = this;

      return this.textEditor.onDidChangeCursorPosition((0, _sbDebounce2['default'])(function (_ref3) {
        var newBufferPosition = _ref3.newBufferPosition;

        _this4.cursorPosition = newBufferPosition;
        _this4.updateTooltip(newBufferPosition);
      }, 60));
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

exports['default'] = Editor;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9lZGl0b3IvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OzswQkFFcUIsYUFBYTs7OzsrQkFDTixrQkFBa0I7Ozs7b0JBQ3hCLE1BQU07OzBCQUM2QixjQUFjOzt1QkFHbkQsWUFBWTs7Ozt1QkFDcUIsWUFBWTs7d0JBQ2tCLFdBQVc7O0lBR3pFLE1BQU07QUFjZCxXQWRRLE1BQU0sQ0FjYixVQUFzQixFQUFFOzs7MEJBZGpCLE1BQU07O0FBZXZCLFFBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFBO0FBQ25CLFFBQUksQ0FBQyxPQUFPLEdBQUcseUJBQWEsQ0FBQTtBQUM1QixRQUFJLENBQUMsT0FBTyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7QUFDeEIsUUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO0FBQ3pCLFFBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFBO0FBQzVCLFFBQUksQ0FBQyxhQUFhLEdBQUcscUNBQXlCLENBQUE7O0FBRTlDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUNwQyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQywrQkFBK0IsRUFBRSxVQUFDLFdBQVcsRUFBSztBQUMzRixZQUFLLFdBQVcsR0FBRyxXQUFXLENBQUE7S0FDL0IsQ0FBQyxDQUFDLENBQUE7QUFDSCxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxvQ0FBb0MsRUFBRSxVQUFDLGdCQUFnQixFQUFLO0FBQ3JHLFlBQUssZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUE7S0FDekMsQ0FBQyxDQUFDLENBQUE7QUFDSCxRQUFJLENB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QUFPLENBQUMsSUFBSSxJQUFJLGVBQWUsQ0FBQSxBQUFFLENBQUE7QUFDNUgsY0FBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUU7QUFDNUIsbUJBQU8sWUFBWTtBQUNuQixjQUFJLEVBQUUsT0FBTztTQUNkLENBQUMsQ0FBQTtPQUNIO0tBQ0Y7OztXQUNXLHNCQUFDLFFBQWtCLEVBQWM7QUFDM0MsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDaEQ7OztXQUNNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7QUFDaEMsVUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUM1QixVQUFJLENBQUMsWUFBWSxFQUFFLENBQUE7QUFDbkIsVUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFBO0tBQ3JCOzs7U0FoUWtCLE1BQU07OztxQkFBTixNQUFNIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9lZGl0b3IvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgZGVib3VuY2UgZnJvbSAnc2ItZGVib3VuY2UnXG5pbXBvcnQgZGlzcG9zYWJsZUV2ZW50IGZyb20gJ2Rpc3Bvc2FibGUtZXZlbnQnXG5pbXBvcnQgeyBSYW5nZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyLCBEaXNwb3NhYmxlIH0gZnJvbSAnc2ItZXZlbnQta2l0J1xuaW1wb3J0IHR5cGUgeyBUZXh0RWRpdG9yLCBCdWZmZXJNYXJrZXIsIFRleHRFZGl0b3JHdXR0ZXIsIFBvaW50IH0gZnJvbSAnYXRvbSdcblxuaW1wb3J0IFRvb2x0aXAgZnJvbSAnLi4vdG9vbHRpcCdcbmltcG9ydCB7ICRyYW5nZSwgZmlsdGVyTWVzc2FnZXNCeVJhbmdlT3JQb2ludCB9IGZyb20gJy4uL2hlbHBlcnMnXG5pbXBvcnQgeyBoYXNQYXJlbnQsIG1vdXNlRXZlbnROZWFyUG9zaXRpb24sIGdldEJ1ZmZlclBvc2l0aW9uRnJvbU1vdXNlRXZlbnQgfSBmcm9tICcuL2hlbHBlcnMnXG5pbXBvcnQgdHlwZSB7IExpbnRlck1lc3NhZ2UgfSBmcm9tICcuLi90eXBlcydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRWRpdG9yIHtcbiAgZ3V0dGVyOiA/VGV4dEVkaXRvckd1dHRlcjtcbiAgdG9vbHRpcDogP1Rvb2x0aXA7XG4gIGVtaXR0ZXI6IEVtaXR0ZXI7XG4gIG1hcmtlcnM6IE1hcDxMaW50ZXJNZXNzYWdlLCBCdWZmZXJNYXJrZXI+O1xuICBtZXNzYWdlczogU2V0PExpbnRlck1lc3NhZ2U+O1xuICB0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yO1xuICBzaG93VG9vbHRpcDogYm9vbGVhbjtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgY3Vyc29yUG9zaXRpb246ID9Qb2ludDtcbiAgZ3V0dGVyUG9zaXRpb246IGJvb2xlYW47XG4gIHNob3dEZWNvcmF0aW9uczogYm9vbGVhbjtcbiAgc2hvd1Byb3ZpZGVyTmFtZTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcih0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yKSB7XG4gICAgdGhpcy50b29sdGlwID0gbnVsbFxuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKClcbiAgICB0aGlzLm1hcmtlcnMgPSBuZXcgTWFwKClcbiAgICB0aGlzLm1lc3NhZ2VzID0gbmV3IFNldCgpXG4gICAgdGhpcy50ZXh0RWRpdG9yID0gdGV4dEVkaXRvclxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5lbWl0dGVyKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXVpLWRlZmF1bHQuc2hvd1Rvb2x0aXAnLCAoc2hvd1Rvb2x0aXApID0+IHtcbiAgICAgIHRoaXMuc2hvd1Rvb2x0aXAgPSBzaG93VG9vbHRpcFxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXVpLWRlZmF1bHQuc2hvd1Byb3ZpZGVyTmFtZScsIChzaG93UHJvdmlkZXJOYW1lKSA9PiB7XG4gICAgICB0aGlzLnNob3dQcm92aWRlck5hbWUgPSBzaG93UHJvdmlkZXJOYW1lXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItdWktZGVmYXVsdC5zaG93RGVjb3JhdGlvbnMnLCAoc2hvd0RlY29yYXRpb25zKSA9PiB7XG4gICAgICBjb25zdCBub3RJbml0aWFsID0gdHlwZW9mIHRoaXMuc2hvd0RlY29yYXRpb25zICE9PSAndW5kZWZpbmVkJ1xuICAgICAgdGhpcy5zaG93RGVjb3JhdGlvbnMgPSBzaG93RGVjb3JhdGlvbnNcbiAgICAgIGlmIChub3RJbml0aWFsKSB7XG4gICAgICAgIHRoaXMudXBkYXRlR3V0dGVyKClcbiAgICAgIH1cbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci11aS1kZWZhdWx0Lmd1dHRlclBvc2l0aW9uJywgKGd1dHRlclBvc2l0aW9uKSA9PiB7XG4gICAgICBjb25zdCBub3RJbml0aWFsID0gdHlwZW9mIHRoaXMuZ3V0dGVyUG9zaXRpb24gIT09ICd1bmRlZmluZWQnXG4gICAgICB0aGlzLmd1dHRlclBvc2l0aW9uID0gZ3V0dGVyUG9zaXRpb25cbiAgICAgIGlmIChub3RJbml0aWFsKSB7XG4gICAgICAgIHRoaXMudXBkYXRlR3V0dGVyKClcbiAgICAgIH1cbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRleHRFZGl0b3Iub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgIHRoaXMuZGlzcG9zZSgpXG4gICAgfSkpXG5cbiAgICBsZXQgdG9vbHRpcFN1YnNjcmlwdGlvblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXVpLWRlZmF1bHQudG9vbHRpcEZvbGxvd3MnLCAodG9vbHRpcEZvbGxvd3MpID0+IHtcbiAgICAgIGlmICh0b29sdGlwU3Vic2NyaXB0aW9uKSB7XG4gICAgICAgIHRvb2x0aXBTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgICB9XG4gICAgICB0b29sdGlwU3Vic2NyaXB0aW9uID0gdG9vbHRpcEZvbGxvd3MgPT09ICdNb3VzZScgPyB0aGlzLmxpc3RlbkZvck1vdXNlTW92ZW1lbnQoKSA6IHRoaXMubGlzdGVuRm9yS2V5Ym9hcmRNb3ZlbWVudCgpXG4gICAgICB0aGlzLnJlbW92ZVRvb2x0aXAoKVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICB0b29sdGlwU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgIH0pXG4gICAgdGhpcy51cGRhdGVHdXR0ZXIoKVxuICAgIHRoaXMubGlzdGVuRm9yQ3VycmVudExpbmUoKVxuICB9XG4gIGxpc3RlbkZvckN1cnJlbnRMaW5lKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy50ZXh0RWRpdG9yLm9ic2VydmVDdXJzb3JzKChjdXJzb3IpID0+IHtcbiAgICAgIGxldCBtYXJrZXJcbiAgICAgIGxldCBsYXN0UmFuZ2VcbiAgICAgIGxldCBsYXN0RW1wdHlcbiAgICAgIGNvbnN0IGhhbmRsZVBvc2l0aW9uQ2hhbmdlID0gKHsgc3RhcnQsIGVuZCB9KSA9PiB7XG4gICAgICAgIGNvbnN0IGd1dHRlciA9IHRoaXMuZ3V0dGVyXG4gICAgICAgIGlmICghZ3V0dGVyKSByZXR1cm5cbiAgICAgICAgLy8gV2UgbmVlZCB0aGF0IFJhbmdlLmZyb21PYmplY3QgaGFjayBiZWxvdyBiZWNhdXNlIHdoZW4gd2UgZm9jdXMgaW5kZXggMCBvbiBtdWx0aS1saW5lIHNlbGVjdGlvblxuICAgICAgICAvLyBlbmQuY29sdW1uIGlzIHRoZSBjb2x1bW4gb2YgdGhlIGxhc3QgbGluZSBidXQgbWFraW5nIGEgcmFuZ2Ugb3V0IG9mIHR3byBhbmQgdGhlbiBhY2Nlc2luZ1xuICAgICAgICAvLyB0aGUgZW5kIHNlZW1zIHRvIGZpeCBpdCAoYmxhY2sgbWFnaWM/KVxuICAgICAgICBjb25zdCBjdXJyZW50UmFuZ2UgPSBSYW5nZS5mcm9tT2JqZWN0KFtzdGFydCwgZW5kXSlcbiAgICAgICAgY29uc3QgbGluZXNSYW5nZSA9IFJhbmdlLmZyb21PYmplY3QoW1tzdGFydC5yb3csIDBdLCBbZW5kLnJvdywgSW5maW5pdHldXSlcbiAgICAgICAgY29uc3QgY3VycmVudEVtcHR5ID0gY3VycmVudFJhbmdlLmlzRW1wdHkoKVxuXG4gICAgICAgIC8vIE5PVEU6IEF0b20gZG9lcyBub3QgcGFpbnQgZ3V0dGVyIGlmIG11bHRpLWxpbmUgYW5kIGxhc3QgbGluZSBoYXMgemVybyBpbmRleFxuICAgICAgICBpZiAoc3RhcnQucm93ICE9PSBlbmQucm93ICYmIGN1cnJlbnRSYW5nZS5lbmQuY29sdW1uID09PSAwKSB7XG4gICAgICAgICAgbGluZXNSYW5nZS5lbmQucm93LS1cbiAgICAgICAgfVxuICAgICAgICBpZiAobGFzdFJhbmdlICYmIGxhc3RSYW5nZS5pc0VxdWFsKGxpbmVzUmFuZ2UpICYmIGN1cnJlbnRFbXB0eSA9PT0gbGFzdEVtcHR5KSByZXR1cm5cbiAgICAgICAgaWYgKG1hcmtlcikgbWFya2VyLmRlc3Ryb3koKVxuICAgICAgICBsYXN0UmFuZ2UgPSBsaW5lc1JhbmdlXG4gICAgICAgIGxhc3RFbXB0eSA9IGN1cnJlbnRFbXB0eVxuXG4gICAgICAgIG1hcmtlciA9IHRoaXMudGV4dEVkaXRvci5tYXJrQnVmZmVyUmFuZ2UobGluZXNSYW5nZSwge1xuICAgICAgICAgIGludmFsaWRhdGU6ICduZXZlcicsXG4gICAgICAgIH0pXG4gICAgICAgIGNvbnN0IGl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICAgICAgaXRlbS5jbGFzc05hbWUgPSBgbGluZS1udW1iZXIgY3Vyc29yLWxpbmUgbGludGVyLWN1cnNvci1saW5lICR7Y3VycmVudEVtcHR5ID8gJ2N1cnNvci1saW5lLW5vLXNlbGVjdGlvbicgOiAnJ31gXG4gICAgICAgIGd1dHRlci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHtcbiAgICAgICAgICBpdGVtLFxuICAgICAgICAgIGNsYXNzOiAnbGludGVyLXJvdycsXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGN1cnNvck1hcmtlciA9IGN1cnNvci5nZXRNYXJrZXIoKVxuICAgICAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICAgIHN1YnNjcmlwdGlvbnMuYWRkKGN1cnNvck1hcmtlci5vbkRpZENoYW5nZSgoeyBuZXdIZWFkQnVmZmVyUG9zaXRpb24sIG5ld1RhaWxCdWZmZXJQb3NpdGlvbiB9KSA9PiB7XG4gICAgICAgIGhhbmRsZVBvc2l0aW9uQ2hhbmdlKHsgc3RhcnQ6IG5ld0hlYWRCdWZmZXJQb3NpdGlvbiwgZW5kOiBuZXdUYWlsQnVmZmVyUG9zaXRpb24gfSlcbiAgICAgIH0pKVxuICAgICAgc3Vic2NyaXB0aW9ucy5hZGQoY3Vyc29yLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kZWxldGUoc3Vic2NyaXB0aW9ucylcbiAgICAgICAgc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICAgIH0pKVxuICAgICAgc3Vic2NyaXB0aW9ucy5hZGQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChtYXJrZXIpIG1hcmtlci5kZXN0cm95KClcbiAgICAgIH0pXG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHN1YnNjcmlwdGlvbnMpXG4gICAgICBoYW5kbGVQb3NpdGlvbkNoYW5nZShjdXJzb3JNYXJrZXIuZ2V0QnVmZmVyUmFuZ2UoKSlcbiAgICB9KSlcbiAgfVxuICBsaXN0ZW5Gb3JNb3VzZU1vdmVtZW50KCkge1xuICAgIGNvbnN0IGVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy50ZXh0RWRpdG9yKVxuICAgIHJldHVybiBkaXNwb3NhYmxlRXZlbnQoZWRpdG9yRWxlbWVudCwgJ21vdXNlbW92ZScsIGRlYm91bmNlKChlKSA9PiB7XG4gICAgICBpZiAoIWVkaXRvckVsZW1lbnQuY29tcG9uZW50IHx8ICFoYXNQYXJlbnQoZS50YXJnZXQsICdkaXYubGluZScpKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgY29uc3QgdG9vbHRpcCA9IHRoaXMudG9vbHRpcFxuICAgICAgaWYgKHRvb2x0aXAgJiYgbW91c2VFdmVudE5lYXJQb3NpdGlvbihlLCBlZGl0b3JFbGVtZW50LCB0b29sdGlwLm1hcmtlci5nZXRTdGFydFNjcmVlblBvc2l0aW9uKCksIHRvb2x0aXAuZWxlbWVudC5vZmZzZXRXaWR0aCwgdG9vbHRpcC5lbGVtZW50Lm9mZnNldEhlaWdodCkpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICAvLyBOT1RFOiBJZ25vcmUgaWYgZmlsZSBpcyB0b28gYmlnXG4gICAgICBpZiAodGhpcy50ZXh0RWRpdG9yLmxhcmdlRmlsZU1vZGUpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVUb29sdGlwKClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBjb25zdCBjdXJzb3JQb3NpdGlvbiA9IGdldEJ1ZmZlclBvc2l0aW9uRnJvbU1vdXNlRXZlbnQoZSwgdGhpcy50ZXh0RWRpdG9yLCBlZGl0b3JFbGVtZW50KVxuICAgICAgdGhpcy5jdXJzb3JQb3NpdGlvbiA9IGN1cnNvclBvc2l0aW9uXG4gICAgICBpZiAoY3Vyc29yUG9zaXRpb24pIHtcbiAgICAgICAgdGhpcy51cGRhdGVUb29sdGlwKHRoaXMuY3Vyc29yUG9zaXRpb24pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJlbW92ZVRvb2x0aXAoKVxuICAgICAgfVxuICAgIH0sIDIwMCwgdHJ1ZSkpXG4gIH1cbiAgbGlzdGVuRm9yS2V5Ym9hcmRNb3ZlbWVudCgpIHtcbiAgICByZXR1cm4gdGhpcy50ZXh0RWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24oZGVib3VuY2UoKHsgbmV3QnVmZmVyUG9zaXRpb24gfSkgPT4ge1xuICAgICAgdGhpcy5jdXJzb3JQb3NpdGlvbiA9IG5ld0J1ZmZlclBvc2l0aW9uXG4gICAgICB0aGlzLnVwZGF0ZVRvb2x0aXAobmV3QnVmZmVyUG9zaXRpb24pXG4gICAgfSwgNjApKVxuICB9XG4gIHVwZGF0ZUd1dHRlcigpIHtcbiAgICB0aGlzLnJlbW92ZUd1dHRlcigpXG4gICAgaWYgKCF0aGlzLnNob3dEZWNvcmF0aW9ucykge1xuICAgICAgdGhpcy5ndXR0ZXIgPSBudWxsXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgcHJpb3JpdHkgPSB0aGlzLmd1dHRlclBvc2l0aW9uID09PSAnTGVmdCcgPyAtMTAwIDogMTAwXG4gICAgdGhpcy5ndXR0ZXIgPSB0aGlzLnRleHRFZGl0b3IuYWRkR3V0dGVyKHtcbiAgICAgIG5hbWU6ICdsaW50ZXItdWktZGVmYXVsdCcsXG4gICAgICBwcmlvcml0eSxcbiAgICB9KVxuICAgIHRoaXMubWFya2Vycy5mb3JFYWNoKChtYXJrZXIsIG1lc3NhZ2UpID0+IHtcbiAgICAgIHRoaXMuZGVjb3JhdGVNYXJrZXIobWVzc2FnZSwgbWFya2VyLCAnZ3V0dGVyJylcbiAgICB9KVxuICB9XG4gIHJlbW92ZUd1dHRlcigpIHtcbiAgICBpZiAodGhpcy5ndXR0ZXIpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuZ3V0dGVyLmRlc3Ryb3koKVxuICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAvKiBUaGlzIHRocm93cyB3aGVuIHRoZSB0ZXh0IGVkaXRvciBpcyBkaXNwb3NlZCAqL1xuICAgICAgfVxuICAgIH1cbiAgfVxuICB1cGRhdGVUb29sdGlwKHBvc2l0aW9uOiA/UG9pbnQpIHtcbiAgICBpZiAoIXBvc2l0aW9uIHx8ICh0aGlzLnRvb2x0aXAgJiYgdGhpcy50b29sdGlwLmlzVmFsaWQocG9zaXRpb24sIHRoaXMubWVzc2FnZXMpKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMucmVtb3ZlVG9vbHRpcCgpXG4gICAgaWYgKCF0aGlzLnNob3dUb29sdGlwKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBtZXNzYWdlcyA9IGZpbHRlck1lc3NhZ2VzQnlSYW5nZU9yUG9pbnQodGhpcy5tZXNzYWdlcywgdGhpcy50ZXh0RWRpdG9yLmdldFBhdGgoKSwgcG9zaXRpb24pXG4gICAgaWYgKCFtZXNzYWdlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMudG9vbHRpcCA9IG5ldyBUb29sdGlwKG1lc3NhZ2VzLCBwb3NpdGlvbiwgdGhpcy50ZXh0RWRpdG9yKVxuICAgIHRoaXMudG9vbHRpcC5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgdGhpcy50b29sdGlwID0gbnVsbFxuICAgIH0pXG4gIH1cbiAgcmVtb3ZlVG9vbHRpcCgpIHtcbiAgICBpZiAodGhpcy50b29sdGlwKSB7XG4gICAgICB0aGlzLnRvb2x0aXAubWFya2VyLmRlc3Ryb3koKVxuICAgIH1cbiAgfVxuICBhcHBseShhZGRlZDogQXJyYXk8TGludGVyTWVzc2FnZT4sIHJlbW92ZWQ6IEFycmF5PExpbnRlck1lc3NhZ2U+KSB7XG4gICAgY29uc3QgdGV4dEJ1ZmZlciA9IHRoaXMudGV4dEVkaXRvci5nZXRCdWZmZXIoKVxuXG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbmd0aCA9IHJlbW92ZWQubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSByZW1vdmVkW2ldXG4gICAgICBjb25zdCBtYXJrZXIgPSB0aGlzLm1hcmtlcnMuZ2V0KG1lc3NhZ2UpXG4gICAgICBpZiAobWFya2VyKSB7XG4gICAgICAgIG1hcmtlci5kZXN0cm95KClcbiAgICAgIH1cbiAgICAgIHRoaXMubWVzc2FnZXMuZGVsZXRlKG1lc3NhZ2UpXG4gICAgICB0aGlzLm1hcmtlcnMuZGVsZXRlKG1lc3NhZ2UpXG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbmd0aCA9IGFkZGVkLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gYWRkZWRbaV1cbiAgICAgIGNvbnN0IG1hcmtlclJhbmdlID0gJHJhbmdlKG1lc3NhZ2UpXG4gICAgICBpZiAoIW1hcmtlclJhbmdlKSB7XG4gICAgICAgIC8vIE9ubHkgZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHlcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGNvbnN0IG1hcmtlciA9IHRleHRCdWZmZXIubWFya1JhbmdlKG1hcmtlclJhbmdlLCB7XG4gICAgICAgIGludmFsaWRhdGU6ICduZXZlcicsXG4gICAgICB9KVxuICAgICAgdGhpcy5tYXJrZXJzLnNldChtZXNzYWdlLCBtYXJrZXIpXG4gICAgICB0aGlzLm1lc3NhZ2VzLmFkZChtZXNzYWdlKVxuICAgICAgbWFya2VyLm9uRGlkQ2hhbmdlKCh7IG9sZEhlYWRQb3NpdGlvbiwgbmV3SGVhZFBvc2l0aW9uLCBpc1ZhbGlkIH0pID0+IHtcbiAgICAgICAgaWYgKCFpc1ZhbGlkIHx8IChuZXdIZWFkUG9zaXRpb24ucm93ID09PSAwICYmIG9sZEhlYWRQb3NpdGlvbi5yb3cgIT09IDApKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1lc3NhZ2UudmVyc2lvbiA9PT0gMSkge1xuICAgICAgICAgIG1lc3NhZ2UucmFuZ2UgPSBtYXJrZXIucHJldmlvdXNFdmVudFN0YXRlLnJhbmdlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWVzc2FnZS5sb2NhdGlvbi5wb3NpdGlvbiA9IG1hcmtlci5wcmV2aW91c0V2ZW50U3RhdGUucmFuZ2VcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIHRoaXMuZGVjb3JhdGVNYXJrZXIobWVzc2FnZSwgbWFya2VyKVxuICAgIH1cblxuICAgIHRoaXMudXBkYXRlVG9vbHRpcCh0aGlzLmN1cnNvclBvc2l0aW9uKVxuICB9XG4gIGRlY29yYXRlTWFya2VyKG1lc3NhZ2U6IExpbnRlck1lc3NhZ2UsIG1hcmtlcjogT2JqZWN0LCBwYWludDogJ2d1dHRlcicgfCAnZWRpdG9yJyB8ICdib3RoJyA9ICdib3RoJykge1xuICAgIGlmIChwYWludCA9PT0gJ2JvdGgnIHx8IHBhaW50ID09PSAnZWRpdG9yJykge1xuICAgICAgdGhpcy50ZXh0RWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwge1xuICAgICAgICB0eXBlOiAnaGlnaGxpZ2h0JyxcbiAgICAgICAgY2xhc3M6IGBsaW50ZXItaGlnaGxpZ2h0IGxpbnRlci0ke21lc3NhZ2Uuc2V2ZXJpdHl9YCxcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgY29uc3QgZ3V0dGVyID0gdGhpcy5ndXR0ZXJcbiAgICBpZiAoZ3V0dGVyICYmIChwYWludCA9PT0gJ2JvdGgnIHx8IHBhaW50ID09PSAnZ3V0dGVyJykpIHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gYGxpbnRlci1ndXR0ZXIgbGludGVyLWhpZ2hsaWdodCBsaW50ZXItJHttZXNzYWdlLnNldmVyaXR5fSBpY29uIGljb24tJHttZXNzYWdlLmljb24gfHwgJ3ByaW1pdGl2ZS1kb3QnfWBcbiAgICAgIGd1dHRlci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHtcbiAgICAgICAgY2xhc3M6ICdsaW50ZXItcm93JyxcbiAgICAgICAgaXRlbTogZWxlbWVudCxcbiAgICAgIH0pXG4gICAgfVxuICB9XG4gIG9uRGlkRGVzdHJveShjYWxsYmFjazogRnVuY3Rpb24pOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtZGVzdHJveScsIGNhbGxiYWNrKVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1kZXN0cm95JylcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgdGhpcy5yZW1vdmVHdXR0ZXIoKVxuICAgIHRoaXMucmVtb3ZlVG9vbHRpcCgpXG4gIH1cbn1cbiJdfQ==