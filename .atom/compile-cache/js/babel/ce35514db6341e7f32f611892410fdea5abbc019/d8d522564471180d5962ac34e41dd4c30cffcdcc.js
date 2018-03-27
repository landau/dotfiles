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
    this.subscriptions.add(new _atom.Disposable(function () {
      tooltipSubscription.dispose();
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

module.exports = Editor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9lZGl0b3IvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OzBCQUVxQixhQUFhOzs7OytCQUNOLGtCQUFrQjs7OztvQkFDa0IsTUFBTTs7dUJBR2xELFlBQVk7Ozs7dUJBQ3FCLFlBQVk7O3dCQUNrQixXQUFXOztJQUd4RixNQUFNO0FBY0MsV0FkUCxNQUFNLENBY0UsVUFBc0IsRUFBRTs7OzBCQWRoQyxNQUFNOztBQWVSLFFBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFBO0FBQ25CLFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQTtBQUM1QixRQUFJLENBQUMsT0FBTyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7QUFDeEIsUUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO0FBQ3pCLFFBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFBO0FBQzVCLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7O0FBRTlDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUNwQyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQywrQkFBK0IsRUFBRSxVQUFDLFdBQVcsRUFBSztBQUMzRixZQUFLLFdBQVcsR0FBRyxXQUFXLENBQUE7S0FDL0IsQ0FBQyxDQUFDLENBQUE7QUFDSCxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxvQ0FBb0MsRUFBRSxVQUFDLGdCQUFnQixFQUFLO0FBQ3JHLFlBQUssZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUE7S0FDekMsQ0FBQyxDQUFDLENBQUE7QUFDSCxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcs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T0FBTyxDQUFDLFFBQVEsb0JBQWMsT0FBTyxDQUFDLElBQUksSUFBSSxlQUFlLENBQUEsQUFBRSxDQUFBO0FBQzVILGNBQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFO0FBQzVCLG1CQUFPLFlBQVk7QUFDbkIsY0FBSSxFQUFFLE9BQU87U0FDZCxDQUFDLENBQUE7T0FDSDtLQUNGOzs7V0FDVyxzQkFBQyxRQUFrQixFQUFjO0FBQzNDLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQ2hEOzs7V0FDTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBO0FBQ2hDLFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDNUIsVUFBSSxDQUFDLFlBQVksRUFBRSxDQUFBO0FBQ25CLFVBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQTtLQUNyQjs7O1NBdFFHLE1BQU07OztBQXlRWixNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9saW50ZXItdWktZGVmYXVsdC9saWIvZWRpdG9yL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IGRlYm91bmNlIGZyb20gJ3NiLWRlYm91bmNlJ1xuaW1wb3J0IGRpc3Bvc2FibGVFdmVudCBmcm9tICdkaXNwb3NhYmxlLWV2ZW50J1xuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZSwgRW1pdHRlciwgUmFuZ2UgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHR5cGUgeyBUZXh0RWRpdG9yLCBCdWZmZXJNYXJrZXIsIFRleHRFZGl0b3JHdXR0ZXIsIFBvaW50IH0gZnJvbSAnYXRvbSdcblxuaW1wb3J0IFRvb2x0aXAgZnJvbSAnLi4vdG9vbHRpcCdcbmltcG9ydCB7ICRyYW5nZSwgZmlsdGVyTWVzc2FnZXNCeVJhbmdlT3JQb2ludCB9IGZyb20gJy4uL2hlbHBlcnMnXG5pbXBvcnQgeyBoYXNQYXJlbnQsIG1vdXNlRXZlbnROZWFyUG9zaXRpb24sIGdldEJ1ZmZlclBvc2l0aW9uRnJvbU1vdXNlRXZlbnQgfSBmcm9tICcuL2hlbHBlcnMnXG5pbXBvcnQgdHlwZSB7IExpbnRlck1lc3NhZ2UgfSBmcm9tICcuLi90eXBlcydcblxuY2xhc3MgRWRpdG9yIHtcbiAgZ3V0dGVyOiA/VGV4dEVkaXRvckd1dHRlcjtcbiAgdG9vbHRpcDogP1Rvb2x0aXA7XG4gIGVtaXR0ZXI6IEVtaXR0ZXI7XG4gIG1hcmtlcnM6IE1hcDxMaW50ZXJNZXNzYWdlLCBCdWZmZXJNYXJrZXI+O1xuICBtZXNzYWdlczogU2V0PExpbnRlck1lc3NhZ2U+O1xuICB0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yO1xuICBzaG93VG9vbHRpcDogYm9vbGVhbjtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgY3Vyc29yUG9zaXRpb246ID9Qb2ludDtcbiAgZ3V0dGVyUG9zaXRpb246IGJvb2xlYW47XG4gIHNob3dEZWNvcmF0aW9uczogYm9vbGVhbjtcbiAgc2hvd1Byb3ZpZGVyTmFtZTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcih0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yKSB7XG4gICAgdGhpcy50b29sdGlwID0gbnVsbFxuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKClcbiAgICB0aGlzLm1hcmtlcnMgPSBuZXcgTWFwKClcbiAgICB0aGlzLm1lc3NhZ2VzID0gbmV3IFNldCgpXG4gICAgdGhpcy50ZXh0RWRpdG9yID0gdGV4dEVkaXRvclxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5lbWl0dGVyKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXVpLWRlZmF1bHQuc2hvd1Rvb2x0aXAnLCAoc2hvd1Rvb2x0aXApID0+IHtcbiAgICAgIHRoaXMuc2hvd1Rvb2x0aXAgPSBzaG93VG9vbHRpcFxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXVpLWRlZmF1bHQuc2hvd1Byb3ZpZGVyTmFtZScsIChzaG93UHJvdmlkZXJOYW1lKSA9PiB7XG4gICAgICB0aGlzLnNob3dQcm92aWRlck5hbWUgPSBzaG93UHJvdmlkZXJOYW1lXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXItdWktZGVmYXVsdC5zaG93RGVjb3JhdGlvbnMnLCAoc2hvd0RlY29yYXRpb25zKSA9PiB7XG4gICAgICBjb25zdCBub3RJbml0aWFsID0gdHlwZW9mIHRoaXMuc2hvd0RlY29yYXRpb25zICE9PSAndW5kZWZpbmVkJ1xuICAgICAgdGhpcy5zaG93RGVjb3JhdGlvbnMgPSBzaG93RGVjb3JhdGlvbnNcbiAgICAgIGlmIChub3RJbml0aWFsKSB7XG4gICAgICAgIHRoaXMudXBkYXRlR3V0dGVyKClcbiAgICAgIH1cbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci11aS1kZWZhdWx0Lmd1dHRlclBvc2l0aW9uJywgKGd1dHRlclBvc2l0aW9uKSA9PiB7XG4gICAgICBjb25zdCBub3RJbml0aWFsID0gdHlwZW9mIHRoaXMuZ3V0dGVyUG9zaXRpb24gIT09ICd1bmRlZmluZWQnXG4gICAgICB0aGlzLmd1dHRlclBvc2l0aW9uID0gZ3V0dGVyUG9zaXRpb25cbiAgICAgIGlmIChub3RJbml0aWFsKSB7XG4gICAgICAgIHRoaXMudXBkYXRlR3V0dGVyKClcbiAgICAgIH1cbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRleHRFZGl0b3Iub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgIHRoaXMuZGlzcG9zZSgpXG4gICAgfSkpXG5cbiAgICBsZXQgdG9vbHRpcFN1YnNjcmlwdGlvblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXVpLWRlZmF1bHQudG9vbHRpcEZvbGxvd3MnLCAodG9vbHRpcEZvbGxvd3MpID0+IHtcbiAgICAgIGlmICh0b29sdGlwU3Vic2NyaXB0aW9uKSB7XG4gICAgICAgIHRvb2x0aXBTdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgICB9XG4gICAgICB0b29sdGlwU3Vic2NyaXB0aW9uID0gdG9vbHRpcEZvbGxvd3MgPT09ICdNb3VzZScgPyB0aGlzLmxpc3RlbkZvck1vdXNlTW92ZW1lbnQoKSA6IHRoaXMubGlzdGVuRm9yS2V5Ym9hcmRNb3ZlbWVudCgpXG4gICAgICB0aGlzLnJlbW92ZVRvb2x0aXAoKVxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQobmV3IERpc3Bvc2FibGUoZnVuY3Rpb24oKSB7XG4gICAgICB0b29sdGlwU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKVxuICAgIH0pKVxuICAgIHRoaXMudXBkYXRlR3V0dGVyKClcbiAgICB0aGlzLmxpc3RlbkZvckN1cnJlbnRMaW5lKClcbiAgfVxuICBsaXN0ZW5Gb3JDdXJyZW50TGluZSgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMudGV4dEVkaXRvci5vYnNlcnZlQ3Vyc29ycygoY3Vyc29yKSA9PiB7XG4gICAgICBsZXQgbWFya2VyXG4gICAgICBsZXQgbGFzdFJhbmdlXG4gICAgICBsZXQgbGFzdEVtcHR5XG4gICAgICBjb25zdCBoYW5kbGVQb3NpdGlvbkNoYW5nZSA9ICh7IHN0YXJ0LCBlbmQgfSkgPT4ge1xuICAgICAgICBjb25zdCBndXR0ZXIgPSB0aGlzLmd1dHRlclxuICAgICAgICBpZiAoIWd1dHRlcikgcmV0dXJuXG4gICAgICAgIC8vIFdlIG5lZWQgdGhhdCBSYW5nZS5mcm9tT2JqZWN0IGhhY2sgYmVsb3cgYmVjYXVzZSB3aGVuIHdlIGZvY3VzIGluZGV4IDAgb24gbXVsdGktbGluZSBzZWxlY3Rpb25cbiAgICAgICAgLy8gZW5kLmNvbHVtbiBpcyB0aGUgY29sdW1uIG9mIHRoZSBsYXN0IGxpbmUgYnV0IG1ha2luZyBhIHJhbmdlIG91dCBvZiB0d28gYW5kIHRoZW4gYWNjZXNpbmdcbiAgICAgICAgLy8gdGhlIGVuZCBzZWVtcyB0byBmaXggaXQgKGJsYWNrIG1hZ2ljPylcbiAgICAgICAgY29uc3QgY3VycmVudFJhbmdlID0gUmFuZ2UuZnJvbU9iamVjdChbc3RhcnQsIGVuZF0pXG4gICAgICAgIGNvbnN0IGxpbmVzUmFuZ2UgPSBSYW5nZS5mcm9tT2JqZWN0KFtbc3RhcnQucm93LCAwXSwgW2VuZC5yb3csIEluZmluaXR5XV0pXG4gICAgICAgIGNvbnN0IGN1cnJlbnRFbXB0eSA9IGN1cnJlbnRSYW5nZS5pc0VtcHR5KClcblxuICAgICAgICAvLyBOT1RFOiBBdG9tIGRvZXMgbm90IHBhaW50IGd1dHRlciBpZiBtdWx0aS1saW5lIGFuZCBsYXN0IGxpbmUgaGFzIHplcm8gaW5kZXhcbiAgICAgICAgaWYgKHN0YXJ0LnJvdyAhPT0gZW5kLnJvdyAmJiBjdXJyZW50UmFuZ2UuZW5kLmNvbHVtbiA9PT0gMCkge1xuICAgICAgICAgIGxpbmVzUmFuZ2UuZW5kLnJvdy0tXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxhc3RSYW5nZSAmJiBsYXN0UmFuZ2UuaXNFcXVhbChsaW5lc1JhbmdlKSAmJiBjdXJyZW50RW1wdHkgPT09IGxhc3RFbXB0eSkgcmV0dXJuXG4gICAgICAgIGlmIChtYXJrZXIpIG1hcmtlci5kZXN0cm95KClcbiAgICAgICAgbGFzdFJhbmdlID0gbGluZXNSYW5nZVxuICAgICAgICBsYXN0RW1wdHkgPSBjdXJyZW50RW1wdHlcblxuICAgICAgICBtYXJrZXIgPSB0aGlzLnRleHRFZGl0b3IubWFya1NjcmVlblJhbmdlKGxpbmVzUmFuZ2UsIHtcbiAgICAgICAgICBpbnZhbGlkYXRlOiAnbmV2ZXInLFxuICAgICAgICB9KVxuICAgICAgICBjb25zdCBpdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgICAgIGl0ZW0uY2xhc3NOYW1lID0gYGxpbmUtbnVtYmVyIGN1cnNvci1saW5lIGxpbnRlci1jdXJzb3ItbGluZSAke2N1cnJlbnRFbXB0eSA/ICdjdXJzb3ItbGluZS1uby1zZWxlY3Rpb24nIDogJyd9YFxuICAgICAgICBndXR0ZXIuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7XG4gICAgICAgICAgaXRlbSxcbiAgICAgICAgICBjbGFzczogJ2xpbnRlci1yb3cnLFxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICBjb25zdCBjdXJzb3JNYXJrZXIgPSBjdXJzb3IuZ2V0TWFya2VyKClcbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgICBzdWJzY3JpcHRpb25zLmFkZChjdXJzb3JNYXJrZXIub25EaWRDaGFuZ2UoKHsgbmV3SGVhZFNjcmVlblBvc2l0aW9uLCBuZXdUYWlsU2NyZWVuUG9zaXRpb24gfSkgPT4ge1xuICAgICAgICBoYW5kbGVQb3NpdGlvbkNoYW5nZSh7IHN0YXJ0OiBuZXdIZWFkU2NyZWVuUG9zaXRpb24sIGVuZDogbmV3VGFpbFNjcmVlblBvc2l0aW9uIH0pXG4gICAgICB9KSlcbiAgICAgIHN1YnNjcmlwdGlvbnMuYWRkKGN1cnNvci5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbnMucmVtb3ZlKHN1YnNjcmlwdGlvbnMpXG4gICAgICAgIHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgICB9KSlcbiAgICAgIHN1YnNjcmlwdGlvbnMuYWRkKG5ldyBEaXNwb3NhYmxlKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAobWFya2VyKSBtYXJrZXIuZGVzdHJveSgpXG4gICAgICB9KSlcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoc3Vic2NyaXB0aW9ucylcbiAgICAgIGhhbmRsZVBvc2l0aW9uQ2hhbmdlKGN1cnNvck1hcmtlci5nZXRTY3JlZW5SYW5nZSgpKVxuICAgIH0pKVxuICB9XG4gIGxpc3RlbkZvck1vdXNlTW92ZW1lbnQoKSB7XG4gICAgY29uc3QgZWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLnRleHRFZGl0b3IpXG5cbiAgICByZXR1cm4gZGlzcG9zYWJsZUV2ZW50KGVkaXRvckVsZW1lbnQsICdtb3VzZW1vdmUnLCBkZWJvdW5jZSgoZXZlbnQpID0+IHtcbiAgICAgIGlmICghZWRpdG9yRWxlbWVudC5jb21wb25lbnQgfHwgIWhhc1BhcmVudChldmVudC50YXJnZXQsICdkaXYuc2Nyb2xsLXZpZXcnKSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGNvbnN0IHRvb2x0aXAgPSB0aGlzLnRvb2x0aXBcbiAgICAgIGlmICh0b29sdGlwICYmIG1vdXNlRXZlbnROZWFyUG9zaXRpb24oe1xuICAgICAgICBldmVudCxcbiAgICAgICAgZWRpdG9yOiB0aGlzLnRleHRFZGl0b3IsXG4gICAgICAgIGVkaXRvckVsZW1lbnQsXG4gICAgICAgIHRvb2x0aXBFbGVtZW50OiB0b29sdGlwLmVsZW1lbnQsXG4gICAgICAgIHNjcmVlblBvc2l0aW9uOiB0b29sdGlwLm1hcmtlci5nZXRTdGFydFNjcmVlblBvc2l0aW9uKCksXG4gICAgICB9KSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgdGhpcy5jdXJzb3JQb3NpdGlvbiA9IGdldEJ1ZmZlclBvc2l0aW9uRnJvbU1vdXNlRXZlbnQoZXZlbnQsIHRoaXMudGV4dEVkaXRvciwgZWRpdG9yRWxlbWVudClcbiAgICAgIGlmICh0aGlzLnRleHRFZGl0b3IubGFyZ2VGaWxlTW9kZSkge1xuICAgICAgICAvLyBOT1RFOiBJZ25vcmUgaWYgZmlsZSBpcyB0b28gbGFyZ2VcbiAgICAgICAgdGhpcy5jdXJzb3JQb3NpdGlvbiA9IG51bGxcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmN1cnNvclBvc2l0aW9uKSB7XG4gICAgICAgIHRoaXMudXBkYXRlVG9vbHRpcCh0aGlzLmN1cnNvclBvc2l0aW9uKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZW1vdmVUb29sdGlwKClcbiAgICAgIH1cbiAgICB9LCAzMDAsIHRydWUpKVxuICB9XG4gIGxpc3RlbkZvcktleWJvYXJkTW92ZW1lbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMudGV4dEVkaXRvci5vbkRpZENoYW5nZUN1cnNvclBvc2l0aW9uKGRlYm91bmNlKCh7IG5ld0J1ZmZlclBvc2l0aW9uIH0pID0+IHtcbiAgICAgIHRoaXMuY3Vyc29yUG9zaXRpb24gPSBuZXdCdWZmZXJQb3NpdGlvblxuICAgICAgdGhpcy51cGRhdGVUb29sdGlwKG5ld0J1ZmZlclBvc2l0aW9uKVxuICAgIH0sIDYwKSlcbiAgfVxuICB1cGRhdGVHdXR0ZXIoKSB7XG4gICAgdGhpcy5yZW1vdmVHdXR0ZXIoKVxuICAgIGlmICghdGhpcy5zaG93RGVjb3JhdGlvbnMpIHtcbiAgICAgIHRoaXMuZ3V0dGVyID0gbnVsbFxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHByaW9yaXR5ID0gdGhpcy5ndXR0ZXJQb3NpdGlvbiA9PT0gJ0xlZnQnID8gLTEwMCA6IDEwMFxuICAgIHRoaXMuZ3V0dGVyID0gdGhpcy50ZXh0RWRpdG9yLmFkZEd1dHRlcih7XG4gICAgICBuYW1lOiAnbGludGVyLXVpLWRlZmF1bHQnLFxuICAgICAgcHJpb3JpdHksXG4gICAgfSlcbiAgICB0aGlzLm1hcmtlcnMuZm9yRWFjaCgobWFya2VyLCBtZXNzYWdlKSA9PiB7XG4gICAgICB0aGlzLmRlY29yYXRlTWFya2VyKG1lc3NhZ2UsIG1hcmtlciwgJ2d1dHRlcicpXG4gICAgfSlcbiAgfVxuICByZW1vdmVHdXR0ZXIoKSB7XG4gICAgaWYgKHRoaXMuZ3V0dGVyKSB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLmd1dHRlci5kZXN0cm95KClcbiAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgLyogVGhpcyB0aHJvd3Mgd2hlbiB0aGUgdGV4dCBlZGl0b3IgaXMgZGlzcG9zZWQgKi9cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgdXBkYXRlVG9vbHRpcChwb3NpdGlvbjogP1BvaW50KSB7XG4gICAgaWYgKCFwb3NpdGlvbiB8fCAodGhpcy50b29sdGlwICYmIHRoaXMudG9vbHRpcC5pc1ZhbGlkKHBvc2l0aW9uLCB0aGlzLm1lc3NhZ2VzKSkpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLnJlbW92ZVRvb2x0aXAoKVxuICAgIGlmICghdGhpcy5zaG93VG9vbHRpcCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgbWVzc2FnZXMgPSBmaWx0ZXJNZXNzYWdlc0J5UmFuZ2VPclBvaW50KHRoaXMubWVzc2FnZXMsIHRoaXMudGV4dEVkaXRvci5nZXRQYXRoKCksIHBvc2l0aW9uKVxuICAgIGlmICghbWVzc2FnZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLnRvb2x0aXAgPSBuZXcgVG9vbHRpcChtZXNzYWdlcywgcG9zaXRpb24sIHRoaXMudGV4dEVkaXRvcilcbiAgICB0aGlzLnRvb2x0aXAub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgIHRoaXMudG9vbHRpcCA9IG51bGxcbiAgICB9KVxuICB9XG4gIHJlbW92ZVRvb2x0aXAoKSB7XG4gICAgaWYgKHRoaXMudG9vbHRpcCkge1xuICAgICAgdGhpcy50b29sdGlwLm1hcmtlci5kZXN0cm95KClcbiAgICB9XG4gIH1cbiAgYXBwbHkoYWRkZWQ6IEFycmF5PExpbnRlck1lc3NhZ2U+LCByZW1vdmVkOiBBcnJheTxMaW50ZXJNZXNzYWdlPikge1xuICAgIGNvbnN0IHRleHRCdWZmZXIgPSB0aGlzLnRleHRFZGl0b3IuZ2V0QnVmZmVyKClcblxuICAgIGZvciAobGV0IGkgPSAwLCBsZW5ndGggPSByZW1vdmVkLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gcmVtb3ZlZFtpXVxuICAgICAgY29uc3QgbWFya2VyID0gdGhpcy5tYXJrZXJzLmdldChtZXNzYWdlKVxuICAgICAgaWYgKG1hcmtlcikge1xuICAgICAgICBtYXJrZXIuZGVzdHJveSgpXG4gICAgICB9XG4gICAgICB0aGlzLm1lc3NhZ2VzLmRlbGV0ZShtZXNzYWdlKVxuICAgICAgdGhpcy5tYXJrZXJzLmRlbGV0ZShtZXNzYWdlKVxuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwLCBsZW5ndGggPSBhZGRlZC5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGFkZGVkW2ldXG4gICAgICBjb25zdCBtYXJrZXJSYW5nZSA9ICRyYW5nZShtZXNzYWdlKVxuICAgICAgaWYgKCFtYXJrZXJSYW5nZSkge1xuICAgICAgICAvLyBPbmx5IGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICBjb25zdCBtYXJrZXIgPSB0ZXh0QnVmZmVyLm1hcmtSYW5nZShtYXJrZXJSYW5nZSwge1xuICAgICAgICBpbnZhbGlkYXRlOiAnbmV2ZXInLFxuICAgICAgfSlcbiAgICAgIHRoaXMubWFya2Vycy5zZXQobWVzc2FnZSwgbWFya2VyKVxuICAgICAgdGhpcy5tZXNzYWdlcy5hZGQobWVzc2FnZSlcbiAgICAgIG1hcmtlci5vbkRpZENoYW5nZSgoeyBvbGRIZWFkUG9zaXRpb24sIG5ld0hlYWRQb3NpdGlvbiwgaXNWYWxpZCB9KSA9PiB7XG4gICAgICAgIGlmICghaXNWYWxpZCB8fCAobmV3SGVhZFBvc2l0aW9uLnJvdyA9PT0gMCAmJiBvbGRIZWFkUG9zaXRpb24ucm93ICE9PSAwKSkge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGlmIChtZXNzYWdlLnZlcnNpb24gPT09IDEpIHtcbiAgICAgICAgICBtZXNzYWdlLnJhbmdlID0gbWFya2VyLnByZXZpb3VzRXZlbnRTdGF0ZS5yYW5nZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1lc3NhZ2UubG9jYXRpb24ucG9zaXRpb24gPSBtYXJrZXIucHJldmlvdXNFdmVudFN0YXRlLnJhbmdlXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICB0aGlzLmRlY29yYXRlTWFya2VyKG1lc3NhZ2UsIG1hcmtlcilcbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0ZVRvb2x0aXAodGhpcy5jdXJzb3JQb3NpdGlvbilcbiAgfVxuICBkZWNvcmF0ZU1hcmtlcihtZXNzYWdlOiBMaW50ZXJNZXNzYWdlLCBtYXJrZXI6IE9iamVjdCwgcGFpbnQ6ICdndXR0ZXInIHwgJ2VkaXRvcicgfCAnYm90aCcgPSAnYm90aCcpIHtcbiAgICBpZiAocGFpbnQgPT09ICdib3RoJyB8fCBwYWludCA9PT0gJ2VkaXRvcicpIHtcbiAgICAgIHRoaXMudGV4dEVkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHtcbiAgICAgICAgdHlwZTogJ2hpZ2hsaWdodCcsXG4gICAgICAgIGNsYXNzOiBgbGludGVyLWhpZ2hsaWdodCBsaW50ZXItJHttZXNzYWdlLnNldmVyaXR5fWAsXG4gICAgICB9KVxuICAgIH1cblxuICAgIGNvbnN0IGd1dHRlciA9IHRoaXMuZ3V0dGVyXG4gICAgaWYgKGd1dHRlciAmJiAocGFpbnQgPT09ICdib3RoJyB8fCBwYWludCA9PT0gJ2d1dHRlcicpKSB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgICBlbGVtZW50LmNsYXNzTmFtZSA9IGBsaW50ZXItZ3V0dGVyIGxpbnRlci1oaWdobGlnaHQgbGludGVyLSR7bWVzc2FnZS5zZXZlcml0eX0gaWNvbiBpY29uLSR7bWVzc2FnZS5pY29uIHx8ICdwcmltaXRpdmUtZG90J31gXG4gICAgICBndXR0ZXIuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7XG4gICAgICAgIGNsYXNzOiAnbGludGVyLXJvdycsXG4gICAgICAgIGl0ZW06IGVsZW1lbnQsXG4gICAgICB9KVxuICAgIH1cbiAgfVxuICBvbkRpZERlc3Ryb3koY2FsbGJhY2s6IEZ1bmN0aW9uKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWRlc3Ryb3knLCBjYWxsYmFjaylcbiAgfVxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtZGVzdHJveScpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIHRoaXMucmVtb3ZlR3V0dGVyKClcbiAgICB0aGlzLnJlbW92ZVRvb2x0aXAoKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRWRpdG9yXG4iXX0=