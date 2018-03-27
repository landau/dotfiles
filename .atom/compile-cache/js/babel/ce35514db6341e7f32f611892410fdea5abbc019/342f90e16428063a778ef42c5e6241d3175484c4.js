var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/* eslint-disable import/no-duplicates */

var _atom = require('atom');

var _helpers = require('./helpers');

var Helpers = _interopRequireWildcard(_helpers);

var _validate = require('./validate');

var Validate = _interopRequireWildcard(_validate);

var LinterRegistry = (function () {
  function LinterRegistry() {
    var _this = this;

    _classCallCheck(this, LinterRegistry);

    this.emitter = new _atom.Emitter();
    this.linters = new Set();
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(atom.config.observe('linter.lintOnChange', function (lintOnChange) {
      _this.lintOnChange = lintOnChange;
    }));
    this.subscriptions.add(atom.config.observe('core.excludeVcsIgnoredPaths', function (ignoreVCS) {
      _this.ignoreVCS = ignoreVCS;
    }));
    this.subscriptions.add(atom.config.observe('linter.ignoreGlob', function (ignoreGlob) {
      _this.ignoreGlob = ignoreGlob;
    }));
    this.subscriptions.add(atom.config.observe('linter.lintPreviewTabs', function (lintPreviewTabs) {
      _this.lintPreviewTabs = lintPreviewTabs;
    }));
    this.subscriptions.add(atom.config.observe('linter.disabledProviders', function (disabledProviders) {
      _this.disabledProviders = disabledProviders;
    }));
    this.subscriptions.add(this.emitter);
  }

  _createClass(LinterRegistry, [{
    key: 'hasLinter',
    value: function hasLinter(linter) {
      return this.linters.has(linter);
    }
  }, {
    key: 'addLinter',
    value: function addLinter(linter) {
      var legacy = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      var version = legacy ? 1 : 2;
      if (!Validate.linter(linter, version)) {
        return;
      }
      linter[_helpers.$activated] = true;
      if (typeof linter[_helpers.$requestLatest] === 'undefined') {
        linter[_helpers.$requestLatest] = 0;
      }
      if (typeof linter[_helpers.$requestLastReceived] === 'undefined') {
        linter[_helpers.$requestLastReceived] = 0;
      }
      linter[_helpers.$version] = version;
      this.linters.add(linter);
    }
  }, {
    key: 'getLinters',
    value: function getLinters() {
      return Array.from(this.linters);
    }
  }, {
    key: 'deleteLinter',
    value: function deleteLinter(linter) {
      if (!this.linters.has(linter)) {
        return;
      }
      linter[_helpers.$activated] = false;
      this.linters['delete'](linter);
    }
  }, {
    key: 'lint',
    value: _asyncToGenerator(function* (_ref) {
      var onChange = _ref.onChange;
      var editor = _ref.editor;
      return yield* (function* () {
        var _this2 = this;

        var filePath = editor.getPath();

        if (onChange && !this.lintOnChange || // Lint-on-change mismatch
        !filePath || // Not saved anywhere yet
        Helpers.isPathIgnored(editor.getPath(), this.ignoreGlob, this.ignoreVCS) || // Ignored by VCS or Glob
        !this.lintPreviewTabs && atom.workspace.getActivePane().getPendingItem() === editor // Ignore Preview tabs
        ) {
            return false;
          }

        var scopes = Helpers.getEditorCursorScopes(editor);

        var promises = [];

        var _loop = function (linter) {
          if (!Helpers.shouldTriggerLinter(linter, onChange, scopes)) {
            return 'continue';
          }
          if (_this2.disabledProviders.includes(linter.name)) {
            return 'continue';
          }
          var number = ++linter[_helpers.$requestLatest];
          var statusBuffer = linter.scope === 'file' ? editor.getBuffer() : null;
          var statusFilePath = linter.scope === 'file' ? filePath : null;

          _this2.emitter.emit('did-begin-linting', { number: number, linter: linter, filePath: statusFilePath });
          promises.push(new Promise(function (resolve) {
            // $FlowIgnore: Type too complex, duh
            resolve(linter.lint(editor));
          }).then(function (messages) {
            _this2.emitter.emit('did-finish-linting', { number: number, linter: linter, filePath: statusFilePath });
            if (linter[_helpers.$requestLastReceived] >= number || !linter[_helpers.$activated] || statusBuffer && !statusBuffer.isAlive()) {
              return;
            }
            linter[_helpers.$requestLastReceived] = number;
            if (statusBuffer && !statusBuffer.isAlive()) {
              return;
            }

            if (messages === null) {
              // NOTE: Do NOT update the messages when providers return null
              return;
            }

            var validity = true;
            // NOTE: We are calling it when results are not an array to show a nice notification
            if (atom.inDevMode() || !Array.isArray(messages)) {
              validity = linter[_helpers.$version] === 2 ? Validate.messages(linter.name, messages) : Validate.messagesLegacy(linter.name, messages);
            }
            if (!validity) {
              return;
            }

            if (linter[_helpers.$version] === 2) {
              Helpers.normalizeMessages(linter.name, messages);
            } else {
              Helpers.normalizeMessagesLegacy(linter.name, messages);
            }
            _this2.emitter.emit('did-update-messages', { messages: messages, linter: linter, buffer: statusBuffer });
          }, function (error) {
            _this2.emitter.emit('did-finish-linting', { number: number, linter: linter, filePath: statusFilePath });
            atom.notifications.addError('[Linter] Error running ' + linter.name, {
              detail: 'See Console for more info. (Open View -> Developer -> Toogle Developer Tools)'
            });
            console.error('[Linter] Error running ' + linter.name, error);
          }));
        };

        for (var linter of this.linters) {
          var _ret = _loop(linter);

          if (_ret === 'continue') continue;
        }

        yield Promise.all(promises);
        return true;
      }).apply(this, arguments);
    })
  }, {
    key: 'onDidUpdateMessages',
    value: function onDidUpdateMessages(callback) {
      return this.emitter.on('did-update-messages', callback);
    }
  }, {
    key: 'onDidBeginLinting',
    value: function onDidBeginLinting(callback) {
      return this.emitter.on('did-begin-linting', callback);
    }
  }, {
    key: 'onDidFinishLinting',
    value: function onDidFinishLinting(callback) {
      return this.emitter.on('did-finish-linting', callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.linters.clear();
      this.subscriptions.dispose();
    }
  }]);

  return LinterRegistry;
})();

module.exports = LinterRegistry;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvbGludGVyLXJlZ2lzdHJ5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBRzZDLE1BQU07O3VCQUcxQixXQUFXOztJQUF4QixPQUFPOzt3QkFDTyxZQUFZOztJQUExQixRQUFROztJQUlkLGNBQWM7QUFVUCxXQVZQLGNBQWMsR0FVSjs7OzBCQVZWLGNBQWM7O0FBV2hCLFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQTtBQUM1QixRQUFJLENBQUMsT0FBTyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7QUFDeEIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTs7QUFFOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsVUFBQyxZQUFZLEVBQUs7QUFDbEYsWUFBSyxZQUFZLEdBQUcsWUFBWSxDQUFBO0tBQ2pDLENBQUMsQ0FBQyxDQUFBO0FBQ0gsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsNkJBQTZCLEVBQUUsVUFBQyxTQUFTLEVBQUs7QUFDdkYsWUFBSyxTQUFTLEdBQUcsU0FBUyxDQUFBO0tBQzNCLENBQUMsQ0FBQyxDQUFBO0FBQ0gsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEVBQUUsVUFBQyxVQUFVLEVBQUs7QUFDOUUsWUFBSyxVQUFVLEdBQUcsVUFBVSxDQUFBO0tBQzdCLENBQUMsQ0FBQyxDQUFBO0FBQ0gsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsd0JBQXdCLEVBQUUsVUFBQyxlQUFlLEVBQUs7QUFDeEYsWUFBSyxlQUFlLEdB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QUU7MkJBQXhCLE1BQU07O21DQUtiLFNBQVE7U0ErQ1g7O0FBRUQsY0FBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzNCLGVBQU8sSUFBSSxDQUFBO09BQ1o7S0FBQTs7O1dBQ2tCLDZCQUFDLFFBQWtCLEVBQWM7QUFDbEQsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUN4RDs7O1dBQ2dCLDJCQUFDLFFBQWtCLEVBQWM7QUFDaEQsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUN0RDs7O1dBQ2lCLDRCQUFDLFFBQWtCLEVBQWM7QUFDakQsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUN2RDs7O1dBQ00sbUJBQUc7QUFDUixVQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFBO0FBQ3BCLFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7S0FDN0I7OztTQWhKRyxjQUFjOzs7QUFtSnBCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsY0FBYyxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvbGludGVyLXJlZ2lzdHJ5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cbi8qIGVzbGludC1kaXNhYmxlIGltcG9ydC9uby1kdXBsaWNhdGVzICovXG5cbmltcG9ydCB7IEVtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHR5cGUgeyBUZXh0RWRpdG9yLCBEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcblxuaW1wb3J0ICogYXMgSGVscGVycyBmcm9tICcuL2hlbHBlcnMnXG5pbXBvcnQgKiBhcyBWYWxpZGF0ZSBmcm9tICcuL3ZhbGlkYXRlJ1xuaW1wb3J0IHsgJHZlcnNpb24sICRhY3RpdmF0ZWQsICRyZXF1ZXN0TGF0ZXN0LCAkcmVxdWVzdExhc3RSZWNlaXZlZCB9IGZyb20gJy4vaGVscGVycydcbmltcG9ydCB0eXBlIHsgTGludGVyIH0gZnJvbSAnLi90eXBlcydcblxuY2xhc3MgTGludGVyUmVnaXN0cnkge1xuICBlbWl0dGVyOiBFbWl0dGVyO1xuICBsaW50ZXJzOiBTZXQ8TGludGVyPjtcbiAgbGludE9uQ2hhbmdlOiBib29sZWFuO1xuICBpZ25vcmVWQ1M6IGJvb2xlYW47XG4gIGlnbm9yZUdsb2I6IHN0cmluZztcbiAgbGludFByZXZpZXdUYWJzOiBib29sZWFuO1xuICBzdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBkaXNhYmxlZFByb3ZpZGVyczogQXJyYXk8c3RyaW5nPjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG4gICAgdGhpcy5saW50ZXJzID0gbmV3IFNldCgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXIubGludE9uQ2hhbmdlJywgKGxpbnRPbkNoYW5nZSkgPT4ge1xuICAgICAgdGhpcy5saW50T25DaGFuZ2UgPSBsaW50T25DaGFuZ2VcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2NvcmUuZXhjbHVkZVZjc0lnbm9yZWRQYXRocycsIChpZ25vcmVWQ1MpID0+IHtcbiAgICAgIHRoaXMuaWdub3JlVkNTID0gaWdub3JlVkNTXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXIuaWdub3JlR2xvYicsIChpZ25vcmVHbG9iKSA9PiB7XG4gICAgICB0aGlzLmlnbm9yZUdsb2IgPSBpZ25vcmVHbG9iXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXIubGludFByZXZpZXdUYWJzJywgKGxpbnRQcmV2aWV3VGFicykgPT4ge1xuICAgICAgdGhpcy5saW50UHJldmlld1RhYnMgPSBsaW50UHJldmlld1RhYnNcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci5kaXNhYmxlZFByb3ZpZGVycycsIChkaXNhYmxlZFByb3ZpZGVycykgPT4ge1xuICAgICAgdGhpcy5kaXNhYmxlZFByb3ZpZGVycyA9IGRpc2FibGVkUHJvdmlkZXJzXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmVtaXR0ZXIpXG4gIH1cbiAgaGFzTGludGVyKGxpbnRlcjogTGludGVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubGludGVycy5oYXMobGludGVyKVxuICB9XG4gIGFkZExpbnRlcihsaW50ZXI6IExpbnRlciwgbGVnYWN5OiBib29sZWFuID0gZmFsc2UpIHtcbiAgICBjb25zdCB2ZXJzaW9uID0gbGVnYWN5ID8gMSA6IDJcbiAgICBpZiAoIVZhbGlkYXRlLmxpbnRlcihsaW50ZXIsIHZlcnNpb24pKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbGludGVyWyRhY3RpdmF0ZWRdID0gdHJ1ZVxuICAgIGlmICh0eXBlb2YgbGludGVyWyRyZXF1ZXN0TGF0ZXN0XSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGxpbnRlclskcmVxdWVzdExhdGVzdF0gPSAwXG4gICAgfVxuICAgIGlmICh0eXBlb2YgbGludGVyWyRyZXF1ZXN0TGFzdFJlY2VpdmVkXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGxpbnRlclskcmVxdWVzdExhc3RSZWNlaXZlZF0gPSAwXG4gICAgfVxuICAgIGxpbnRlclskdmVyc2lvbl0gPSB2ZXJzaW9uXG4gICAgdGhpcy5saW50ZXJzLmFkZChsaW50ZXIpXG4gIH1cbiAgZ2V0TGludGVycygpOiBBcnJheTxMaW50ZXI+IHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLmxpbnRlcnMpXG4gIH1cbiAgZGVsZXRlTGludGVyKGxpbnRlcjogTGludGVyKSB7XG4gICAgaWYgKCF0aGlzLmxpbnRlcnMuaGFzKGxpbnRlcikpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsaW50ZXJbJGFjdGl2YXRlZF0gPSBmYWxzZVxuICAgIHRoaXMubGludGVycy5kZWxldGUobGludGVyKVxuICB9XG4gIGFzeW5jIGxpbnQoeyBvbkNoYW5nZSwgZWRpdG9yIH0gOiB7IG9uQ2hhbmdlOiBib29sZWFuLCBlZGl0b3I6IFRleHRFZGl0b3IgfSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKVxuXG4gICAgaWYgKFxuICAgICAgKG9uQ2hhbmdlICYmICF0aGlzLmxpbnRPbkNoYW5nZSkgfHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTGludC1vbi1jaGFuZ2UgbWlzbWF0Y2hcbiAgICAgICFmaWxlUGF0aCB8fCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdCBzYXZlZCBhbnl3aGVyZSB5ZXRcbiAgICAgIEhlbHBlcnMuaXNQYXRoSWdub3JlZChlZGl0b3IuZ2V0UGF0aCgpLCB0aGlzLmlnbm9yZUdsb2IsIHRoaXMuaWdub3JlVkNTKSB8fCAgICAgICAgICAgICAgIC8vIElnbm9yZWQgYnkgVkNTIG9yIEdsb2JcbiAgICAgICghdGhpcy5saW50UHJldmlld1RhYnMgJiYgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLmdldFBlbmRpbmdJdGVtKCkgPT09IGVkaXRvcikgICAgIC8vIElnbm9yZSBQcmV2aWV3IHRhYnNcbiAgICApIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGNvbnN0IHNjb3BlcyA9IEhlbHBlcnMuZ2V0RWRpdG9yQ3Vyc29yU2NvcGVzKGVkaXRvcilcblxuICAgIGNvbnN0IHByb21pc2VzID0gW11cbiAgICBmb3IgKGNvbnN0IGxpbnRlciBvZiB0aGlzLmxpbnRlcnMpIHtcbiAgICAgIGlmICghSGVscGVycy5zaG91bGRUcmlnZ2VyTGludGVyKGxpbnRlciwgb25DaGFuZ2UsIHNjb3BlcykpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmRpc2FibGVkUHJvdmlkZXJzLmluY2x1ZGVzKGxpbnRlci5uYW1lKSkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgY29uc3QgbnVtYmVyID0gKytsaW50ZXJbJHJlcXVlc3RMYXRlc3RdXG4gICAgICBjb25zdCBzdGF0dXNCdWZmZXIgPSBsaW50ZXIuc2NvcGUgPT09ICdmaWxlJyA/IGVkaXRvci5nZXRCdWZmZXIoKSA6IG51bGxcbiAgICAgIGNvbnN0IHN0YXR1c0ZpbGVQYXRoID0gbGludGVyLnNjb3BlID09PSAnZmlsZScgPyBmaWxlUGF0aCA6IG51bGxcblxuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1iZWdpbi1saW50aW5nJywgeyBudW1iZXIsIGxpbnRlciwgZmlsZVBhdGg6IHN0YXR1c0ZpbGVQYXRoIH0pXG4gICAgICBwcm9taXNlcy5wdXNoKG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgICAgLy8gJEZsb3dJZ25vcmU6IFR5cGUgdG9vIGNvbXBsZXgsIGR1aFxuICAgICAgICByZXNvbHZlKGxpbnRlci5saW50KGVkaXRvcikpXG4gICAgICB9KS50aGVuKChtZXNzYWdlcykgPT4ge1xuICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWZpbmlzaC1saW50aW5nJywgeyBudW1iZXIsIGxpbnRlciwgZmlsZVBhdGg6IHN0YXR1c0ZpbGVQYXRoIH0pXG4gICAgICAgIGlmIChsaW50ZXJbJHJlcXVlc3RMYXN0UmVjZWl2ZWRdID49IG51bWJlciB8fCAhbGludGVyWyRhY3RpdmF0ZWRdIHx8IChzdGF0dXNCdWZmZXIgJiYgIXN0YXR1c0J1ZmZlci5pc0FsaXZlKCkpKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgbGludGVyWyRyZXF1ZXN0TGFzdFJlY2VpdmVkXSA9IG51bWJlclxuICAgICAgICBpZiAoc3RhdHVzQnVmZmVyICYmICFzdGF0dXNCdWZmZXIuaXNBbGl2ZSgpKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAobWVzc2FnZXMgPT09IG51bGwpIHtcbiAgICAgICAgICAvLyBOT1RFOiBEbyBOT1QgdXBkYXRlIHRoZSBtZXNzYWdlcyB3aGVuIHByb3ZpZGVycyByZXR1cm4gbnVsbFxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHZhbGlkaXR5ID0gdHJ1ZVxuICAgICAgICAvLyBOT1RFOiBXZSBhcmUgY2FsbGluZyBpdCB3aGVuIHJlc3VsdHMgYXJlIG5vdCBhbiBhcnJheSB0byBzaG93IGEgbmljZSBub3RpZmljYXRpb25cbiAgICAgICAgaWYgKGF0b20uaW5EZXZNb2RlKCkgfHwgIUFycmF5LmlzQXJyYXkobWVzc2FnZXMpKSB7XG4gICAgICAgICAgdmFsaWRpdHkgPSBsaW50ZXJbJHZlcnNpb25dID09PSAyID8gVmFsaWRhdGUubWVzc2FnZXMobGludGVyLm5hbWUsIG1lc3NhZ2VzKSA6IFZhbGlkYXRlLm1lc3NhZ2VzTGVnYWN5KGxpbnRlci5uYW1lLCBtZXNzYWdlcylcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZhbGlkaXR5KSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGludGVyWyR2ZXJzaW9uXSA9PT0gMikge1xuICAgICAgICAgIEhlbHBlcnMubm9ybWFsaXplTWVzc2FnZXMobGludGVyLm5hbWUsIG1lc3NhZ2VzKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIEhlbHBlcnMubm9ybWFsaXplTWVzc2FnZXNMZWdhY3kobGludGVyLm5hbWUsIG1lc3NhZ2VzKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtdXBkYXRlLW1lc3NhZ2VzJywgeyBtZXNzYWdlcywgbGludGVyLCBidWZmZXI6IHN0YXR1c0J1ZmZlciB9KVxuICAgICAgfSwgKGVycm9yKSA9PiB7XG4gICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtZmluaXNoLWxpbnRpbmcnLCB7IG51bWJlciwgbGludGVyLCBmaWxlUGF0aDogc3RhdHVzRmlsZVBhdGggfSlcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGBbTGludGVyXSBFcnJvciBydW5uaW5nICR7bGludGVyLm5hbWV9YCwge1xuICAgICAgICAgIGRldGFpbDogJ1NlZSBDb25zb2xlIGZvciBtb3JlIGluZm8uIChPcGVuIFZpZXcgLT4gRGV2ZWxvcGVyIC0+IFRvb2dsZSBEZXZlbG9wZXIgVG9vbHMpJyxcbiAgICAgICAgfSlcbiAgICAgICAgY29uc29sZS5lcnJvcihgW0xpbnRlcl0gRXJyb3IgcnVubmluZyAke2xpbnRlci5uYW1lfWAsIGVycm9yKVxuICAgICAgfSkpXG4gICAgfVxuXG4gICAgYXdhaXQgUHJvbWlzZS5hbGwocHJvbWlzZXMpXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuICBvbkRpZFVwZGF0ZU1lc3NhZ2VzKGNhbGxiYWNrOiBGdW5jdGlvbik6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC11cGRhdGUtbWVzc2FnZXMnLCBjYWxsYmFjaylcbiAgfVxuICBvbkRpZEJlZ2luTGludGluZyhjYWxsYmFjazogRnVuY3Rpb24pOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtYmVnaW4tbGludGluZycsIGNhbGxiYWNrKVxuICB9XG4gIG9uRGlkRmluaXNoTGludGluZyhjYWxsYmFjazogRnVuY3Rpb24pOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtZmluaXNoLWxpbnRpbmcnLCBjYWxsYmFjaylcbiAgfVxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMubGludGVycy5jbGVhcigpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTGludGVyUmVnaXN0cnlcbiJdfQ==