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
    key: 'getProviders',
    value: function getProviders() {
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
              detail: 'See Console for more info. (Open View -> Developer -> Toggle Developer Tools)'
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvbGludGVyLXJlZ2lzdHJ5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBRzZDLE1BQU07O3VCQUcxQixXQUFXOztJQUF4QixPQUFPOzt3QkFDTyxZQUFZOztJQUExQixRQUFROztJQUlkLGNBQWM7QUFVUCxXQVZQLGNBQWMsR0FVSjs7OzBCQVZWLGNBQWM7O0FBV2hCLFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQTtBQUM1QixRQUFJLENBQUMsT0FBTyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7QUFDeEIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTs7QUFFOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsVUFBQyxZQUFZLEVBQUs7QUFDbEYsWUFBSyxZQUFZLEdBQUcsWUFBWSxDQUFBO0tBQ2pDLENBQUMsQ0FBQyxDQUFBO0FBQ0gsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsNkJBQTZCLEVBQUUsVUFBQyxTQUFTLEVBQUs7QUFDdkYsWUFBSyxTQUFTLEdBQUcsU0FBUyxDQUFBO0tBQzNCLENBQUMsQ0FBQyxDQUFBO0FBQ0gsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEVBQUUsVUFBQyxVQUFVLEVBQUs7QUFDOUUsWUFBSyxVQUFVLEdBQUcsVUFBVSxDQUFBO0tBQzdCLENBQUMsQ0FBQyxDQUFBO0FBQ0gsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsd0JBQXdCLEVBQUUsVUFBQyxlQUFlLEVBQUs7QUFDeEYsWUFBSyxlQUFlLEdBQUcsZUFBZSxD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LE1BQU07O21DQUtiLFNBQVE7U0ErQ1g7O0FBRUQsY0FBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzNCLGVBQU8sSUFBSSxDQUFBO09BQ1o7S0FBQTs7O1dBQ2tCLDZCQUFDLFFBQWtCLEVBQWM7QUFDbEQsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUN4RDs7O1dBQ2dCLDJCQUFDLFFBQWtCLEVBQWM7QUFDaEQsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUN0RDs7O1dBQ2lCLDRCQUFDLFFBQWtCLEVBQWM7QUFDakQsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUN2RDs7O1dBQ00sbUJBQUc7QUFDUixVQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFBO0FBQ3BCLFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7S0FDN0I7OztTQWhKRyxjQUFjOzs7QUFtSnBCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsY0FBYyxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvbGludGVyLXJlZ2lzdHJ5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cbi8qIGVzbGludC1kaXNhYmxlIGltcG9ydC9uby1kdXBsaWNhdGVzICovXG5cbmltcG9ydCB7IEVtaXR0ZXIsIENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHR5cGUgeyBUZXh0RWRpdG9yLCBEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcblxuaW1wb3J0ICogYXMgSGVscGVycyBmcm9tICcuL2hlbHBlcnMnXG5pbXBvcnQgKiBhcyBWYWxpZGF0ZSBmcm9tICcuL3ZhbGlkYXRlJ1xuaW1wb3J0IHsgJHZlcnNpb24sICRhY3RpdmF0ZWQsICRyZXF1ZXN0TGF0ZXN0LCAkcmVxdWVzdExhc3RSZWNlaXZlZCB9IGZyb20gJy4vaGVscGVycydcbmltcG9ydCB0eXBlIHsgTGludGVyIH0gZnJvbSAnLi90eXBlcydcblxuY2xhc3MgTGludGVyUmVnaXN0cnkge1xuICBlbWl0dGVyOiBFbWl0dGVyO1xuICBsaW50ZXJzOiBTZXQ8TGludGVyPjtcbiAgbGludE9uQ2hhbmdlOiBib29sZWFuO1xuICBpZ25vcmVWQ1M6IGJvb2xlYW47XG4gIGlnbm9yZUdsb2I6IHN0cmluZztcbiAgbGludFByZXZpZXdUYWJzOiBib29sZWFuO1xuICBzdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBkaXNhYmxlZFByb3ZpZGVyczogQXJyYXk8c3RyaW5nPjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG4gICAgdGhpcy5saW50ZXJzID0gbmV3IFNldCgpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXIubGludE9uQ2hhbmdlJywgKGxpbnRPbkNoYW5nZSkgPT4ge1xuICAgICAgdGhpcy5saW50T25DaGFuZ2UgPSBsaW50T25DaGFuZ2VcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2NvcmUuZXhjbHVkZVZjc0lnbm9yZWRQYXRocycsIChpZ25vcmVWQ1MpID0+IHtcbiAgICAgIHRoaXMuaWdub3JlVkNTID0gaWdub3JlVkNTXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXIuaWdub3JlR2xvYicsIChpZ25vcmVHbG9iKSA9PiB7XG4gICAgICB0aGlzLmlnbm9yZUdsb2IgPSBpZ25vcmVHbG9iXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdsaW50ZXIubGludFByZXZpZXdUYWJzJywgKGxpbnRQcmV2aWV3VGFicykgPT4ge1xuICAgICAgdGhpcy5saW50UHJldmlld1RhYnMgPSBsaW50UHJldmlld1RhYnNcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci5kaXNhYmxlZFByb3ZpZGVycycsIChkaXNhYmxlZFByb3ZpZGVycykgPT4ge1xuICAgICAgdGhpcy5kaXNhYmxlZFByb3ZpZGVycyA9IGRpc2FibGVkUHJvdmlkZXJzXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmVtaXR0ZXIpXG4gIH1cbiAgaGFzTGludGVyKGxpbnRlcjogTGludGVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubGludGVycy5oYXMobGludGVyKVxuICB9XG4gIGFkZExpbnRlcihsaW50ZXI6IExpbnRlciwgbGVnYWN5OiBib29sZWFuID0gZmFsc2UpIHtcbiAgICBjb25zdCB2ZXJzaW9uID0gbGVnYWN5ID8gMSA6IDJcbiAgICBpZiAoIVZhbGlkYXRlLmxpbnRlcihsaW50ZXIsIHZlcnNpb24pKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbGludGVyWyRhY3RpdmF0ZWRdID0gdHJ1ZVxuICAgIGlmICh0eXBlb2YgbGludGVyWyRyZXF1ZXN0TGF0ZXN0XSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGxpbnRlclskcmVxdWVzdExhdGVzdF0gPSAwXG4gICAgfVxuICAgIGlmICh0eXBlb2YgbGludGVyWyRyZXF1ZXN0TGFzdFJlY2VpdmVkXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGxpbnRlclskcmVxdWVzdExhc3RSZWNlaXZlZF0gPSAwXG4gICAgfVxuICAgIGxpbnRlclskdmVyc2lvbl0gPSB2ZXJzaW9uXG4gICAgdGhpcy5saW50ZXJzLmFkZChsaW50ZXIpXG4gIH1cbiAgZ2V0UHJvdmlkZXJzKCk6IEFycmF5PExpbnRlcj4ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMubGludGVycylcbiAgfVxuICBkZWxldGVMaW50ZXIobGludGVyOiBMaW50ZXIpIHtcbiAgICBpZiAoIXRoaXMubGludGVycy5oYXMobGludGVyKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGxpbnRlclskYWN0aXZhdGVkXSA9IGZhbHNlXG4gICAgdGhpcy5saW50ZXJzLmRlbGV0ZShsaW50ZXIpXG4gIH1cbiAgYXN5bmMgbGludCh7IG9uQ2hhbmdlLCBlZGl0b3IgfSA6IHsgb25DaGFuZ2U6IGJvb2xlYW4sIGVkaXRvcjogVGV4dEVkaXRvciB9KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgZmlsZVBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpXG5cbiAgICBpZiAoXG4gICAgICAob25DaGFuZ2UgJiYgIXRoaXMubGludE9uQ2hhbmdlKSB8fCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBMaW50LW9uLWNoYW5nZSBtaXNtYXRjaFxuICAgICAgIWZpbGVQYXRoIHx8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm90IHNhdmVkIGFueXdoZXJlIHlldFxuICAgICAgSGVscGVycy5pc1BhdGhJZ25vcmVkKGVkaXRvci5nZXRQYXRoKCksIHRoaXMuaWdub3JlR2xvYiwgdGhpcy5pZ25vcmVWQ1MpIHx8ICAgICAgICAgICAgICAgLy8gSWdub3JlZCBieSBWQ1Mgb3IgR2xvYlxuICAgICAgKCF0aGlzLmxpbnRQcmV2aWV3VGFicyAmJiBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkuZ2V0UGVuZGluZ0l0ZW0oKSA9PT0gZWRpdG9yKSAgICAgLy8gSWdub3JlIFByZXZpZXcgdGFic1xuICAgICkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgY29uc3Qgc2NvcGVzID0gSGVscGVycy5nZXRFZGl0b3JDdXJzb3JTY29wZXMoZWRpdG9yKVxuXG4gICAgY29uc3QgcHJvbWlzZXMgPSBbXVxuICAgIGZvciAoY29uc3QgbGludGVyIG9mIHRoaXMubGludGVycykge1xuICAgICAgaWYgKCFIZWxwZXJzLnNob3VsZFRyaWdnZXJMaW50ZXIobGludGVyLCBvbkNoYW5nZSwgc2NvcGVzKSkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMuZGlzYWJsZWRQcm92aWRlcnMuaW5jbHVkZXMobGludGVyLm5hbWUpKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICBjb25zdCBudW1iZXIgPSArK2xpbnRlclskcmVxdWVzdExhdGVzdF1cbiAgICAgIGNvbnN0IHN0YXR1c0J1ZmZlciA9IGxpbnRlci5zY29wZSA9PT0gJ2ZpbGUnID8gZWRpdG9yLmdldEJ1ZmZlcigpIDogbnVsbFxuICAgICAgY29uc3Qgc3RhdHVzRmlsZVBhdGggPSBsaW50ZXIuc2NvcGUgPT09ICdmaWxlJyA/IGZpbGVQYXRoIDogbnVsbFxuXG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWJlZ2luLWxpbnRpbmcnLCB7IG51bWJlciwgbGludGVyLCBmaWxlUGF0aDogc3RhdHVzRmlsZVBhdGggfSlcbiAgICAgIHByb21pc2VzLnB1c2gobmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgICAgICAvLyAkRmxvd0lnbm9yZTogVHlwZSB0b28gY29tcGxleCwgZHVoXG4gICAgICAgIHJlc29sdmUobGludGVyLmxpbnQoZWRpdG9yKSlcbiAgICAgIH0pLnRoZW4oKG1lc3NhZ2VzKSA9PiB7XG4gICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtZmluaXNoLWxpbnRpbmcnLCB7IG51bWJlciwgbGludGVyLCBmaWxlUGF0aDogc3RhdHVzRmlsZVBhdGggfSlcbiAgICAgICAgaWYgKGxpbnRlclskcmVxdWVzdExhc3RSZWNlaXZlZF0gPj0gbnVtYmVyIHx8ICFsaW50ZXJbJGFjdGl2YXRlZF0gfHwgKHN0YXR1c0J1ZmZlciAmJiAhc3RhdHVzQnVmZmVyLmlzQWxpdmUoKSkpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBsaW50ZXJbJHJlcXVlc3RMYXN0UmVjZWl2ZWRdID0gbnVtYmVyXG4gICAgICAgIGlmIChzdGF0dXNCdWZmZXIgJiYgIXN0YXR1c0J1ZmZlci5pc0FsaXZlKCkpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtZXNzYWdlcyA9PT0gbnVsbCkge1xuICAgICAgICAgIC8vIE5PVEU6IERvIE5PVCB1cGRhdGUgdGhlIG1lc3NhZ2VzIHdoZW4gcHJvdmlkZXJzIHJldHVybiBudWxsXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdmFsaWRpdHkgPSB0cnVlXG4gICAgICAgIC8vIE5PVEU6IFdlIGFyZSBjYWxsaW5nIGl0IHdoZW4gcmVzdWx0cyBhcmUgbm90IGFuIGFycmF5IHRvIHNob3cgYSBuaWNlIG5vdGlmaWNhdGlvblxuICAgICAgICBpZiAoYXRvbS5pbkRldk1vZGUoKSB8fCAhQXJyYXkuaXNBcnJheShtZXNzYWdlcykpIHtcbiAgICAgICAgICB2YWxpZGl0eSA9IGxpbnRlclskdmVyc2lvbl0gPT09IDIgPyBWYWxpZGF0ZS5tZXNzYWdlcyhsaW50ZXIubmFtZSwgbWVzc2FnZXMpIDogVmFsaWRhdGUubWVzc2FnZXNMZWdhY3kobGludGVyLm5hbWUsIG1lc3NhZ2VzKVxuICAgICAgICB9XG4gICAgICAgIGlmICghdmFsaWRpdHkpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsaW50ZXJbJHZlcnNpb25dID09PSAyKSB7XG4gICAgICAgICAgSGVscGVycy5ub3JtYWxpemVNZXNzYWdlcyhsaW50ZXIubmFtZSwgbWVzc2FnZXMpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgSGVscGVycy5ub3JtYWxpemVNZXNzYWdlc0xlZ2FjeShsaW50ZXIubmFtZSwgbWVzc2FnZXMpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC11cGRhdGUtbWVzc2FnZXMnLCB7IG1lc3NhZ2VzLCBsaW50ZXIsIGJ1ZmZlcjogc3RhdHVzQnVmZmVyIH0pXG4gICAgICB9LCAoZXJyb3IpID0+IHtcbiAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1maW5pc2gtbGludGluZycsIHsgbnVtYmVyLCBsaW50ZXIsIGZpbGVQYXRoOiBzdGF0dXNGaWxlUGF0aCB9KVxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoYFtMaW50ZXJdIEVycm9yIHJ1bm5pbmcgJHtsaW50ZXIubmFtZX1gLCB7XG4gICAgICAgICAgZGV0YWlsOiAnU2VlIENvbnNvbGUgZm9yIG1vcmUgaW5mby4gKE9wZW4gVmlldyAtPiBEZXZlbG9wZXIgLT4gVG9nZ2xlIERldmVsb3BlciBUb29scyknLFxuICAgICAgICB9KVxuICAgICAgICBjb25zb2xlLmVycm9yKGBbTGludGVyXSBFcnJvciBydW5uaW5nICR7bGludGVyLm5hbWV9YCwgZXJyb3IpXG4gICAgICB9KSlcbiAgICB9XG5cbiAgICBhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcylcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG4gIG9uRGlkVXBkYXRlTWVzc2FnZXMoY2FsbGJhY2s6IEZ1bmN0aW9uKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLXVwZGF0ZS1tZXNzYWdlcycsIGNhbGxiYWNrKVxuICB9XG4gIG9uRGlkQmVnaW5MaW50aW5nKGNhbGxiYWNrOiBGdW5jdGlvbik6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1iZWdpbi1saW50aW5nJywgY2FsbGJhY2spXG4gIH1cbiAgb25EaWRGaW5pc2hMaW50aW5nKGNhbGxiYWNrOiBGdW5jdGlvbik6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1maW5pc2gtbGludGluZycsIGNhbGxiYWNrKVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5saW50ZXJzLmNsZWFyKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBMaW50ZXJSZWdpc3RyeVxuIl19