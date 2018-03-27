Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _disposableEvent = require('disposable-event');

var _disposableEvent2 = _interopRequireDefault(_disposableEvent);

var _sbEventKit = require('sb-event-kit');

var _helpers = require('./helpers');

// NOTE:
// We don't *need* to add the intentions:hide command
// But we're doing it anyway because it helps us keep the code clean
// And can also be used by any other package to fully control this package

// List of core commands we allow during the list, everything else closes it
var CORE_COMMANDS = new Set(['core:move-up', 'core:move-down', 'core:page-up', 'core:page-down', 'core:move-to-top', 'core:move-to-bottom']);

var Commands = (function () {
  function Commands() {
    _classCallCheck(this, Commands);

    this.active = null;
    this.emitter = new _sbEventKit.Emitter();
    this.subscriptions = new _sbEventKit.CompositeDisposable();

    this.subscriptions.add(this.emitter);
  }

  _createClass(Commands, [{
    key: 'activate',
    value: function activate() {
      var _this = this;

      this.subscriptions.add(atom.commands.add('atom-text-editor:not([mini])', {
        'intentions:show': function intentionsShow(e) {
          if (_this.active && _this.active.type === 'list') {
            return;
          }
          _this.processListShow();

          if (!e.originalEvent || e.originalEvent.type !== 'keydown') {
            return;
          }

          setImmediate(function () {
            var matched = true;
            var subscriptions = new _sbEventKit.CompositeDisposable();

            subscriptions.add(atom.keymaps.onDidMatchBinding(function (_ref) {
              var binding = _ref.binding;

              matched = matched && CORE_COMMANDS.has(binding.command);
            }));
            subscriptions.add((0, _disposableEvent2['default'])(document.body, 'keyup', function () {
              if (matched) {
                return;
              }
              subscriptions.dispose();
              _this.subscriptions.remove(subscriptions);
              _this.processListHide();
            }));
            _this.subscriptions.add(subscriptions);
          });
        },
        'intentions:hide': function intentionsHide() {
          _this.processListHide();
        },
        'intentions:highlight': function intentionsHighlight(e) {
          if (_this.active && _this.active.type === 'highlight') {
            return;
          }
          _this.processHighlightsShow();

          if (!e.originalEvent || e.originalEvent.type !== 'keydown') {
            return;
          }
          var keyCode = e.originalEvent.keyCode;
          var subscriptions = (0, _disposableEvent2['default'])(document.body, 'keyup', function (upE) {
            if (upE.keyCode !== keyCode) {
              return;
            }
            subscriptions.dispose();
            _this.subscriptions.remove(subscriptions);
            _this.processHighlightsHide();
          });
          _this.subscriptions.add(subscriptions);
        }
      }));
      this.subscriptions.add(atom.commands.add('atom-text-editor.intentions-list:not([mini])', {
        'intentions:confirm': (0, _helpers.stoppingEvent)(function () {
          _this.processListConfirm();
        }),
        'core:move-up': (0, _helpers.stoppingEvent)(function () {
          _this.processListMove('up');
        }),
        'core:move-down': (0, _helpers.stoppingEvent)(function () {
          _this.processListMove('down');
        }),
        'core:page-up': (0, _helpers.stoppingEvent)(function () {
          _this.processListMove('page-up');
        }),
        'core:page-down': (0, _helpers.stoppingEvent)(function () {
          _this.processListMove('page-down');
        }),
        'core:move-to-top': (0, _helpers.stoppingEvent)(function () {
          _this.processListMove('move-to-top');
        }),
        'core:move-to-bottom': (0, _helpers.stoppingEvent)(function () {
          _this.processListMove('move-to-bottom');
        })
      }));
    }
  }, {
    key: 'processListShow',
    value: _asyncToGenerator(function* () {
      var _this2 = this;

      if (this.active) {
        switch (this.active.type) {
          case 'list':
            throw new Error('Already active');
          case 'highlight':
            this.processHighlightsHide();
            break;
          default:
        }
      }
      var editor = atom.workspace.getActiveTextEditor();
      var editorElement = atom.views.getView(editor);
      var subscriptions = new _sbEventKit.CompositeDisposable();

      if (!(yield this.shouldListShow(editor))) {
        return;
      }
      this.active = { type: 'list', subscriptions: subscriptions };
      subscriptions.add(new _sbEventKit.Disposable(function () {
        if (_this2.active && _this2.active.type === 'list' && _this2.active.subscriptions === subscriptions) {
          _this2.processListHide();
          _this2.active = null;
        }
        editorElement.classList.remove('intentions-list');
      }));
      subscriptions.add((0, _disposableEvent2['default'])(document.body, 'mouseup', function () {
        subscriptions.dispose();
      }));
      editorElement.classList.add('intentions-list');
    })
  }, {
    key: 'processListHide',
    value: function processListHide() {
      if (!this.active || this.active.type !== 'list') {
        return;
      }
      var subscriptions = this.active.subscriptions;
      this.active = null;
      subscriptions.dispose();
      this.emitter.emit('list-hide');
    }
  }, {
    key: 'processListMove',
    value: function processListMove(movement) {
      if (!this.active || this.active.type !== 'list') {
        return;
      }
      this.emitter.emit('list-move', movement);
    }
  }, {
    key: 'processListConfirm',
    value: function processListConfirm() {
      if (!this.active || this.active.type !== 'list') {
        return;
      }
      this.emitter.emit('list-confirm');
    }
  }, {
    key: 'processHighlightsShow',
    value: _asyncToGenerator(function* () {
      var _this3 = this;

      if (this.active) {
        switch (this.active.type) {
          case 'highlight':
            throw new Error('Already active');
          case 'list':
            this.processListHide();
            break;
          default:
        }
      }
      var editor = atom.workspace.getActiveTextEditor();
      var editorElement = atom.views.getView(editor);
      var subscriptions = new _sbEventKit.CompositeDisposable();
      var shouldProcess = yield this.shouldHighlightsShow(editor);

      if (!shouldProcess) {
        return;
      }
      this.active = { type: 'highlight', subscriptions: subscriptions };
      subscriptions.add(new _sbEventKit.Disposable(function () {
        if (_this3.active && _this3.active.type === 'highlight' && _this3.active.subscriptions === subscriptions) {
          _this3.processHighlightsHide();
        }
        editorElement.classList.remove('intentions-highlights');
      }));
      editorElement.classList.add('intentions-highlights');
    })
  }, {
    key: 'processHighlightsHide',
    value: function processHighlightsHide() {
      if (!this.active || this.active.type !== 'highlight') {
        return;
      }
      var subscriptions = this.active.subscriptions;
      this.active = null;
      subscriptions.dispose();
      this.emitter.emit('highlights-hide');
    }
  }, {
    key: 'shouldListShow',
    value: _asyncToGenerator(function* (editor) {
      var event = { show: false, editor: editor };
      yield this.emitter.emit('list-show', event);
      return event.show;
    })
  }, {
    key: 'shouldHighlightsShow',
    value: _asyncToGenerator(function* (editor) {
      var event = { show: false, editor: editor };
      yield this.emitter.emit('highlights-show', event);
      return event.show;
    })
  }, {
    key: 'onListShow',
    value: function onListShow(callback) {
      return this.emitter.on('list-show', function (event) {
        return callback(event.editor).then(function (result) {
          event.show = !!result;
        });
      });
    }
  }, {
    key: 'onListHide',
    value: function onListHide(callback) {
      return this.emitter.on('list-hide', callback);
    }
  }, {
    key: 'onListMove',
    value: function onListMove(callback) {
      return this.emitter.on('list-move', callback);
    }
  }, {
    key: 'onListConfirm',
    value: function onListConfirm(callback) {
      return this.emitter.on('list-confirm', callback);
    }
  }, {
    key: 'onHighlightsShow',
    value: function onHighlightsShow(callback) {
      return this.emitter.on('highlights-show', function (event) {
        return callback(event.editor).then(function (result) {
          event.show = !!result;
        });
      });
    }
  }, {
    key: 'onHighlightsHide',
    value: function onHighlightsHide(callback) {
      return this.emitter.on('highlights-hide', callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.subscriptions.dispose();
      if (this.active) {
        this.active.subscriptions.dispose();
      }
    }
  }]);

  return Commands;
})();

exports['default'] = Commands;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2ludGVudGlvbnMvbGliL2NvbW1hbmRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OzsrQkFFNEIsa0JBQWtCOzs7OzBCQUNXLGNBQWM7O3VCQUd6QyxXQUFXOzs7Ozs7OztBQVN6QyxJQUFNLGFBQWEsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLGNBQWMsRUFBRSxnQkFBZ0IsRUFBRSxjQUFjLEVBQUUsZ0JBQWdCLEVBQUUsa0JBQWtCLEVBQUUscUJBQXFCLENBQUMsQ0FBQyxDQUFBOztJQUV6SCxRQUFRO0FBUWhCLFdBUlEsUUFBUSxHQVFiOzBCQVJLLFFBQVE7O0FBU3pCLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ2xCLFFBQUksQ0FBQyxPQUFPLEdBQUcseUJBQWEsQ0FBQTtBQUM1QixRQUFJLENBQUMsYUFBYSxHQUFHLHFDQUF5QixDQUFBOztBQUU5QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7R0FDckM7O2VBZGtCLFFBQVE7O1dBZW5CLG9CQUFHOzs7QUFDVCxVQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsRUFBRTtBQUN2RSx5QkFBaUIsRUFBRSx3QkFBQyxDQUFDLEVBQUs7QUFDeEIsY0FBSSxNQUFLLE1BQU0sSUFBSSxNQUFLLE1BQU0sQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFO0FBQzlDLG1CQUFNO1dBQ1A7QUFDRCxnQkFBSyxlQUFlLEVBQUUsQ0FBQTs7QUFFdEIsY0FBSSxDQUFDLENBQUMsQ0FBQyxhQUFhLElBQUksQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO0FBQzFELG1CQUFNO1dBQ1A7O0FBRUQsc0JBQVksQ0FBQyxZQUFNO0FBQ2pCLGdCQUFJLE9BQU8sR0FBRyxJ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Q0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQzlDOzs7V0FDWSx1QkFBQyxRQUFxQixFQUFFO0FBQ25DLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQ2pEOzs7V0FDZSwwQkFBQyxRQUFvRCxFQUFFO0FBQ3JFLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsVUFBUyxLQUFLLEVBQUU7QUFDeEQsZUFBTyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFTLE1BQU0sRUFBRTtBQUNsRCxlQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUE7U0FDdEIsQ0FBQyxDQUFBO09BQ0gsQ0FBQyxDQUFBO0tBQ0g7OztXQUNlLDBCQUFDLFFBQXFCLEVBQUU7QUFDdEMsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUNwRDs7O1dBQ00sbUJBQUc7QUFDUixVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQzVCLFVBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNmLFlBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO09BQ3BDO0tBQ0Y7OztTQS9Oa0IsUUFBUTs7O3FCQUFSLFFBQVEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvaW50ZW50aW9ucy9saWIvY29tbWFuZHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgZGlzcG9zYWJsZUV2ZW50IGZyb20gJ2Rpc3Bvc2FibGUtZXZlbnQnXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlLCBFbWl0dGVyIH0gZnJvbSAnc2ItZXZlbnQta2l0J1xuaW1wb3J0IHR5cGUgeyBUZXh0RWRpdG9yIH0gZnJvbSAnYXRvbSdcblxuaW1wb3J0IHsgc3RvcHBpbmdFdmVudCB9IGZyb20gJy4vaGVscGVycydcbmltcG9ydCB0eXBlIHsgTGlzdE1vdmVtZW50IH0gZnJvbSAnLi90eXBlcydcblxuLy8gTk9URTpcbi8vIFdlIGRvbid0ICpuZWVkKiB0byBhZGQgdGhlIGludGVudGlvbnM6aGlkZSBjb21tYW5kXG4vLyBCdXQgd2UncmUgZG9pbmcgaXQgYW55d2F5IGJlY2F1c2UgaXQgaGVscHMgdXMga2VlcCB0aGUgY29kZSBjbGVhblxuLy8gQW5kIGNhbiBhbHNvIGJlIHVzZWQgYnkgYW55IG90aGVyIHBhY2thZ2UgdG8gZnVsbHkgY29udHJvbCB0aGlzIHBhY2thZ2VcblxuLy8gTGlzdCBvZiBjb3JlIGNvbW1hbmRzIHdlIGFsbG93IGR1cmluZyB0aGUgbGlzdCwgZXZlcnl0aGluZyBlbHNlIGNsb3NlcyBpdFxuY29uc3QgQ09SRV9DT01NQU5EUyA9IG5ldyBTZXQoWydjb3JlOm1vdmUtdXAnLCAnY29yZTptb3ZlLWRvd24nLCAnY29yZTpwYWdlLXVwJywgJ2NvcmU6cGFnZS1kb3duJywgJ2NvcmU6bW92ZS10by10b3AnLCAnY29yZTptb3ZlLXRvLWJvdHRvbSddKVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb21tYW5kcyB7XG4gIGFjdGl2ZTogP3tcbiAgICB0eXBlOiAnbGlzdCcgfCAnaGlnaGxpZ2h0JyxcbiAgICBzdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlLFxuICB9O1xuICBlbWl0dGVyOiBFbWl0dGVyO1xuICBzdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuYWN0aXZlID0gbnVsbFxuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZW1pdHRlcilcbiAgfVxuICBhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yOm5vdChbbWluaV0pJywge1xuICAgICAgJ2ludGVudGlvbnM6c2hvdyc6IChlKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZSAmJiB0aGlzLmFjdGl2ZS50eXBlID09PSAnbGlzdCcpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnByb2Nlc3NMaXN0U2hvdygpXG5cbiAgICAgICAgaWYgKCFlLm9yaWdpbmFsRXZlbnQgfHwgZS5vcmlnaW5hbEV2ZW50LnR5cGUgIT09ICdrZXlkb3duJykge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgc2V0SW1tZWRpYXRlKCgpID0+IHtcbiAgICAgICAgICBsZXQgbWF0Y2hlZCA9IHRydWVcbiAgICAgICAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgICAgICAgc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5rZXltYXBzLm9uRGlkTWF0Y2hCaW5kaW5nKGZ1bmN0aW9uKHsgYmluZGluZyB9KSB7XG4gICAgICAgICAgICBtYXRjaGVkID0gbWF0Y2hlZCAmJiBDT1JFX0NPTU1BTkRTLmhhcyhiaW5kaW5nLmNvbW1hbmQpXG4gICAgICAgICAgfSkpXG4gICAgICAgICAgc3Vic2NyaXB0aW9ucy5hZGQoZGlzcG9zYWJsZUV2ZW50KGRvY3VtZW50LmJvZHksICdrZXl1cCcsICgpID0+IHtcbiAgICAgICAgICAgIGlmIChtYXRjaGVkKSB7XG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICAgICAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5yZW1vdmUoc3Vic2NyaXB0aW9ucylcbiAgICAgICAgICAgIHRoaXMucHJvY2Vzc0xpc3RIaWRlKClcbiAgICAgICAgICB9KSlcbiAgICAgICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHN1YnNjcmlwdGlvbnMpXG4gICAgICAgIH0pXG4gICAgICB9LFxuICAgICAgJ2ludGVudGlvbnM6aGlkZSc6ICgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9jZXNzTGlzdEhpZGUoKVxuICAgICAgfSxcbiAgICAgICdpbnRlbnRpb25zOmhpZ2hsaWdodCc6IChlKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZSAmJiB0aGlzLmFjdGl2ZS50eXBlID09PSAnaGlnaGxpZ2h0Jykge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJvY2Vzc0hpZ2hsaWdodHNTaG93KClcblxuICAgICAgICBpZiAoIWUub3JpZ2luYWxFdmVudCB8fCBlLm9yaWdpbmFsRXZlbnQudHlwZSAhPT0gJ2tleWRvd24nKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qga2V5Q29kZSA9IGUub3JpZ2luYWxFdmVudC5rZXlDb2RlXG4gICAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSBkaXNwb3NhYmxlRXZlbnQoZG9jdW1lbnQuYm9keSwgJ2tleXVwJywgdXBFID0+IHtcbiAgICAgICAgICBpZiAodXBFLmtleUNvZGUgIT09IGtleUNvZGUpIHtcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgIH1cbiAgICAgICAgICBzdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgICAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5yZW1vdmUoc3Vic2NyaXB0aW9ucylcbiAgICAgICAgICB0aGlzLnByb2Nlc3NIaWdobGlnaHRzSGlkZSgpXG4gICAgICAgIH0pXG4gICAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoc3Vic2NyaXB0aW9ucylcbiAgICAgIH0sXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvci5pbnRlbnRpb25zLWxpc3Q6bm90KFttaW5pXSknLCB7XG4gICAgICAnaW50ZW50aW9uczpjb25maXJtJzogc3RvcHBpbmdFdmVudCgoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvY2Vzc0xpc3RDb25maXJtKClcbiAgICAgIH0pLFxuICAgICAgJ2NvcmU6bW92ZS11cCc6IHN0b3BwaW5nRXZlbnQoKCkgPT4ge1xuICAgICAgICB0aGlzLnByb2Nlc3NMaXN0TW92ZSgndXAnKVxuICAgICAgfSksXG4gICAgICAnY29yZTptb3ZlLWRvd24nOiBzdG9wcGluZ0V2ZW50KCgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9jZXNzTGlzdE1vdmUoJ2Rvd24nKVxuICAgICAgfSksXG4gICAgICAnY29yZTpwYWdlLXVwJzogc3RvcHBpbmdFdmVudCgoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvY2Vzc0xpc3RNb3ZlKCdwYWdlLXVwJylcbiAgICAgIH0pLFxuICAgICAgJ2NvcmU6cGFnZS1kb3duJzogc3RvcHBpbmdFdmVudCgoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvY2Vzc0xpc3RNb3ZlKCdwYWdlLWRvd24nKVxuICAgICAgfSksXG4gICAgICAnY29yZTptb3ZlLXRvLXRvcCc6IHN0b3BwaW5nRXZlbnQoKCkgPT4ge1xuICAgICAgICB0aGlzLnByb2Nlc3NMaXN0TW92ZSgnbW92ZS10by10b3AnKVxuICAgICAgfSksXG4gICAgICAnY29yZTptb3ZlLXRvLWJvdHRvbSc6IHN0b3BwaW5nRXZlbnQoKCkgPT4ge1xuICAgICAgICB0aGlzLnByb2Nlc3NMaXN0TW92ZSgnbW92ZS10by1ib3R0b20nKVxuICAgICAgfSksXG4gICAgfSkpXG4gIH1cbiAgYXN5bmMgcHJvY2Vzc0xpc3RTaG93KCkge1xuICAgIGlmICh0aGlzLmFjdGl2ZSkge1xuICAgICAgc3dpdGNoICh0aGlzLmFjdGl2ZS50eXBlKSB7XG4gICAgICAgIGNhc2UgJ2xpc3QnOlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQWxyZWFkeSBhY3RpdmUnKVxuICAgICAgICBjYXNlICdoaWdobGlnaHQnOlxuICAgICAgICAgIHRoaXMucHJvY2Vzc0hpZ2hsaWdodHNIaWRlKClcbiAgICAgICAgICBicmVha1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBjb25zdCBlZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcilcbiAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgaWYgKCFhd2FpdCB0aGlzLnNob3VsZExpc3RTaG93KGVkaXRvcikpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLmFjdGl2ZSA9IHsgdHlwZTogJ2xpc3QnLCBzdWJzY3JpcHRpb25zIH1cbiAgICBzdWJzY3JpcHRpb25zLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBpZiAodGhpcy5hY3RpdmUgJiYgdGhpcy5hY3RpdmUudHlwZSA9PT0gJ2xpc3QnICYmIHRoaXMuYWN0aXZlLnN1YnNjcmlwdGlvbnMgPT09IHN1YnNjcmlwdGlvbnMpIHtcbiAgICAgICAgdGhpcy5wcm9jZXNzTGlzdEhpZGUoKVxuICAgICAgICB0aGlzLmFjdGl2ZSA9IG51bGxcbiAgICAgIH1cbiAgICAgIGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaW50ZW50aW9ucy1saXN0JylcbiAgICB9KSlcbiAgICBzdWJzY3JpcHRpb25zLmFkZChkaXNwb3NhYmxlRXZlbnQoZG9jdW1lbnQuYm9keSwgJ21vdXNldXAnLCBmdW5jdGlvbigpIHtcbiAgICAgIHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgfSkpXG4gICAgZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpbnRlbnRpb25zLWxpc3QnKVxuICB9XG4gIHByb2Nlc3NMaXN0SGlkZSgpIHtcbiAgICBpZiAoIXRoaXMuYWN0aXZlIHx8IHRoaXMuYWN0aXZlLnR5cGUgIT09ICdsaXN0Jykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHN1YnNjcmlwdGlvbnMgPSB0aGlzLmFjdGl2ZS5zdWJzY3JpcHRpb25zXG4gICAgdGhpcy5hY3RpdmUgPSBudWxsXG4gICAgc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnbGlzdC1oaWRlJylcbiAgfVxuICBwcm9jZXNzTGlzdE1vdmUobW92ZW1lbnQ6IExpc3RNb3ZlbWVudCkge1xuICAgIGlmICghdGhpcy5hY3RpdmUgfHwgdGhpcy5hY3RpdmUudHlwZSAhPT0gJ2xpc3QnKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2xpc3QtbW92ZScsIG1vdmVtZW50KVxuICB9XG4gIHByb2Nlc3NMaXN0Q29uZmlybSgpIHtcbiAgICBpZiAoIXRoaXMuYWN0aXZlIHx8IHRoaXMuYWN0aXZlLnR5cGUgIT09ICdsaXN0Jykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdsaXN0LWNvbmZpcm0nKVxuICB9XG4gIGFzeW5jIHByb2Nlc3NIaWdobGlnaHRzU2hvdygpIHtcbiAgICBpZiAodGhpcy5hY3RpdmUpIHtcbiAgICAgIHN3aXRjaCAodGhpcy5hY3RpdmUudHlwZSkge1xuICAgICAgICBjYXNlICdoaWdobGlnaHQnOlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQWxyZWFkeSBhY3RpdmUnKVxuICAgICAgICBjYXNlICdsaXN0JzpcbiAgICAgICAgICB0aGlzLnByb2Nlc3NMaXN0SGlkZSgpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgY29uc3QgZWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpXG4gICAgY29uc3Qgc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICBjb25zdCBzaG91bGRQcm9jZXNzID0gYXdhaXQgdGhpcy5zaG91bGRIaWdobGlnaHRzU2hvdyhlZGl0b3IpXG5cbiAgICBpZiAoIXNob3VsZFByb2Nlc3MpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLmFjdGl2ZSA9IHsgdHlwZTogJ2hpZ2hsaWdodCcsIHN1YnNjcmlwdGlvbnMgfVxuICAgIHN1YnNjcmlwdGlvbnMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLmFjdGl2ZSAmJiB0aGlzLmFjdGl2ZS50eXBlID09PSAnaGlnaGxpZ2h0JyAmJiB0aGlzLmFjdGl2ZS5zdWJzY3JpcHRpb25zID09PSBzdWJzY3JpcHRpb25zKSB7XG4gICAgICAgIHRoaXMucHJvY2Vzc0hpZ2hsaWdodHNIaWRlKClcbiAgICAgIH1cbiAgICAgIGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaW50ZW50aW9ucy1oaWdobGlnaHRzJylcbiAgICB9KSlcbiAgICBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2ludGVudGlvbnMtaGlnaGxpZ2h0cycpXG4gIH1cbiAgcHJvY2Vzc0hpZ2hsaWdodHNIaWRlKCkge1xuICAgIGlmICghdGhpcy5hY3RpdmUgfHwgdGhpcy5hY3RpdmUudHlwZSAhPT0gJ2hpZ2hsaWdodCcpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCBzdWJzY3JpcHRpb25zID0gdGhpcy5hY3RpdmUuc3Vic2NyaXB0aW9uc1xuICAgIHRoaXMuYWN0aXZlID0gbnVsbFxuICAgIHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2hpZ2hsaWdodHMtaGlkZScpXG4gIH1cbiAgYXN5bmMgc2hvdWxkTGlzdFNob3coZWRpdG9yOiBUZXh0RWRpdG9yKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgZXZlbnQgPSB7IHNob3c6IGZhbHNlLCBlZGl0b3IgfVxuICAgIGF3YWl0IHRoaXMuZW1pdHRlci5lbWl0KCdsaXN0LXNob3cnLCBldmVudClcbiAgICByZXR1cm4gZXZlbnQuc2hvd1xuICB9XG4gIGFzeW5jIHNob3VsZEhpZ2hsaWdodHNTaG93KGVkaXRvcjogVGV4dEVkaXRvcik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGV2ZW50ID0geyBzaG93OiBmYWxzZSwgZWRpdG9yIH1cbiAgICBhd2FpdCB0aGlzLmVtaXR0ZXIuZW1pdCgnaGlnaGxpZ2h0cy1zaG93JywgZXZlbnQpXG4gICAgcmV0dXJuIGV2ZW50LnNob3dcbiAgfVxuICBvbkxpc3RTaG93KGNhbGxiYWNrOiAoKGVkaXRvcjogVGV4dEVkaXRvcikgPT4gUHJvbWlzZTxib29sZWFuPikpIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdsaXN0LXNob3cnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKGV2ZW50LmVkaXRvcikudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgZXZlbnQuc2hvdyA9ICEhcmVzdWx0XG4gICAgICB9KVxuICAgIH0pXG4gIH1cbiAgb25MaXN0SGlkZShjYWxsYmFjazogKCgpID0+IGFueSkpIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdsaXN0LWhpZGUnLCBjYWxsYmFjaylcbiAgfVxuICBvbkxpc3RNb3ZlKGNhbGxiYWNrOiAoKG1vdmVtZW50OiBMaXN0TW92ZW1lbnQpID0+IGFueSkpIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdsaXN0LW1vdmUnLCBjYWxsYmFjaylcbiAgfVxuICBvbkxpc3RDb25maXJtKGNhbGxiYWNrOiAoKCkgPT4gYW55KSkge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2xpc3QtY29uZmlybScsIGNhbGxiYWNrKVxuICB9XG4gIG9uSGlnaGxpZ2h0c1Nob3coY2FsbGJhY2s6ICgoZWRpdG9yOiBUZXh0RWRpdG9yKSA9PiBQcm9taXNlPGJvb2xlYW4+KSkge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2hpZ2hsaWdodHMtc2hvdycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soZXZlbnQuZWRpdG9yKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICBldmVudC5zaG93ID0gISFyZXN1bHRcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuICBvbkhpZ2hsaWdodHNIaWRlKGNhbGxiYWNrOiAoKCkgPT4gYW55KSkge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2hpZ2hsaWdodHMtaGlkZScsIGNhbGxiYWNrKVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICAgIGlmICh0aGlzLmFjdGl2ZSkge1xuICAgICAgdGhpcy5hY3RpdmUuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB9XG4gIH1cbn1cbiJdfQ==