Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/* eslint-disable import/no-duplicates */

var _sbConfigFile = require('sb-config-file');

var _sbConfigFile2 = _interopRequireDefault(_sbConfigFile);

var _atom = require('atom');

var _helpers = require('./helpers');

var Helpers = _interopRequireWildcard(_helpers);

var _validate = require('./validate');

var Validate = _interopRequireWildcard(_validate);

var LinterRegistry = (function () {
  function LinterRegistry() {
    var _this = this;

    _classCallCheck(this, LinterRegistry);

    this.config = null;
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
    key: 'getConfig',
    value: _asyncToGenerator(function* () {
      if (!this.config) {
        this.config = yield (0, _helpers.getConfigFile)();
      }
      return this.config;
    })
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
        var config = yield this.getConfig();
        var disabled = yield config.get('disabled');

        var promises = [];

        var _loop = function (linter) {
          if (!Helpers.shouldTriggerLinter(linter, onChange, scopes)) {
            return 'continue';
          }
          if (disabled.includes(linter.name)) {
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
              detail: 'See console for more info'
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

exports['default'] = LinterRegistry;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvbGludGVyLXJlZ2lzdHJ5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBR3VCLGdCQUFnQjs7OztvQkFDTSxNQUFNOzt1QkFHMUIsV0FBVzs7SUFBeEIsT0FBTzs7d0JBQ08sWUFBWTs7SUFBMUIsUUFBUTs7SUFJQyxjQUFjO0FBVXRCLFdBVlEsY0FBYyxHQVVuQjs7OzBCQVZLLGNBQWM7O0FBVy9CLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFBO0FBQ2xCLFFBQUksQ0FBQyxPQUFPLEdBQUcsbUJBQWEsQ0FBQTtBQUM1QixRQUFJLENBQUMsT0FBTyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7QUFDeEIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTs7QUFFOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsVUFBQyxZQUFZLEVBQUs7QUFDbEYsWUFBSyxZQUFZLEdBQUcsWUFBWSxDQUFBO0tBQ2pDLENBQUMsQ0FBQyxDQUFBO0FBQ0gsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsNkJBQTZCLEVBQUUsVUFBQyxTQUFTLEVBQUs7QUFDdkYsWUFBSyxTQUFTLEdBQUcsU0FBUyxDQUFBO0tBQzNCLENBQUMsQ0FBQyxDQUFBO0FBQ0gsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEVBQUUsVUFBQyxVQUFVLEVBQUs7QUFDOUUsWUFBSyxVQUFVLEdBQUcsVUFBVSxDQUFBO0tBQzdCLENBQUMsQ0FBQyxDQUFBO0FBQ0gsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0s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QkFBMkI7YUFDcEMsQ0FBQyxDQUFBO0FBQ0YsbUJBQU8sQ0FBQyxLQUFLLDZCQUEyQixNQUFNLENBQUMsSUFBSSxFQUFJLEtBQUssQ0FBQyxDQUFBO1dBQzlELENBQUMsQ0FBQyxDQUFBOzs7QUFuREwsYUFBSyxJQUFNLE1BQU0sSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFOzJCQUF4QixNQUFNOzttQ0FLYixTQUFRO1NBK0NYOztBQUVELGNBQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUMzQixlQUFPLElBQUksQ0FBQTtPQUNaO0tBQUE7OztXQUNrQiw2QkFBQyxRQUFrQixFQUFjO0FBQ2xELGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMscUJBQXFCLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDeEQ7OztXQUNnQiwyQkFBQyxRQUFrQixFQUFjO0FBQ2hELGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsbUJBQW1CLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDdEQ7OztXQUNpQiw0QkFBQyxRQUFrQixFQUFjO0FBQ2pELGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDdkQ7OztXQUNNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQTtBQUNwQixVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO0tBQzdCOzs7U0F0SmtCLGNBQWM7OztxQkFBZCxjQUFjIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvbGludGVyLXJlZ2lzdHJ5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cbi8qIGVzbGludC1kaXNhYmxlIGltcG9ydC9uby1kdXBsaWNhdGVzICovXG5cbmltcG9ydCBDb25maWdGaWxlIGZyb20gJ3NiLWNvbmZpZy1maWxlJ1xuaW1wb3J0IHsgRW1pdHRlciwgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgdHlwZSB7IFRleHRFZGl0b3IsIERpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuXG5pbXBvcnQgKiBhcyBIZWxwZXJzIGZyb20gJy4vaGVscGVycydcbmltcG9ydCAqIGFzIFZhbGlkYXRlIGZyb20gJy4vdmFsaWRhdGUnXG5pbXBvcnQgeyAkdmVyc2lvbiwgJGFjdGl2YXRlZCwgJHJlcXVlc3RMYXRlc3QsICRyZXF1ZXN0TGFzdFJlY2VpdmVkLCBnZXRDb25maWdGaWxlIH0gZnJvbSAnLi9oZWxwZXJzJ1xuaW1wb3J0IHR5cGUgeyBMaW50ZXIgfSBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMaW50ZXJSZWdpc3RyeSB7XG4gIGNvbmZpZzogP0NvbmZpZ0ZpbGU7XG4gIGVtaXR0ZXI6IEVtaXR0ZXI7XG4gIGxpbnRlcnM6IFNldDxMaW50ZXI+O1xuICBsaW50T25DaGFuZ2U6IGJvb2xlYW47XG4gIGlnbm9yZVZDUzogYm9vbGVhbjtcbiAgaWdub3JlR2xvYjogc3RyaW5nO1xuICBsaW50UHJldmlld1RhYnM6IGJvb2xlYW47XG4gIHN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jb25maWcgPSBudWxsXG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKVxuICAgIHRoaXMubGludGVycyA9IG5ldyBTZXQoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLmxpbnRPbkNoYW5nZScsIChsaW50T25DaGFuZ2UpID0+IHtcbiAgICAgIHRoaXMubGludE9uQ2hhbmdlID0gbGludE9uQ2hhbmdlXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vYnNlcnZlKCdjb3JlLmV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMnLCAoaWdub3JlVkNTKSA9PiB7XG4gICAgICB0aGlzLmlnbm9yZVZDUyA9IGlnbm9yZVZDU1xuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLmlnbm9yZUdsb2InLCAoaWdub3JlR2xvYikgPT4ge1xuICAgICAgdGhpcy5pZ25vcmVHbG9iID0gaWdub3JlR2xvYlxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLmxpbnRQcmV2aWV3VGFicycsIChsaW50UHJldmlld1RhYnMpID0+IHtcbiAgICAgIHRoaXMubGludFByZXZpZXdUYWJzID0gbGludFByZXZpZXdUYWJzXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmVtaXR0ZXIpXG4gIH1cbiAgaGFzTGludGVyKGxpbnRlcjogTGludGVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubGludGVycy5oYXMobGludGVyKVxuICB9XG4gIGFkZExpbnRlcihsaW50ZXI6IExpbnRlciwgbGVnYWN5OiBib29sZWFuID0gZmFsc2UpIHtcbiAgICBjb25zdCB2ZXJzaW9uID0gbGVnYWN5ID8gMSA6IDJcbiAgICBpZiAoIVZhbGlkYXRlLmxpbnRlcihsaW50ZXIsIHZlcnNpb24pKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbGludGVyWyRhY3RpdmF0ZWRdID0gdHJ1ZVxuICAgIGlmICh0eXBlb2YgbGludGVyWyRyZXF1ZXN0TGF0ZXN0XSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGxpbnRlclskcmVxdWVzdExhdGVzdF0gPSAwXG4gICAgfVxuICAgIGlmICh0eXBlb2YgbGludGVyWyRyZXF1ZXN0TGFzdFJlY2VpdmVkXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGxpbnRlclskcmVxdWVzdExhc3RSZWNlaXZlZF0gPSAwXG4gICAgfVxuICAgIGxpbnRlclskdmVyc2lvbl0gPSB2ZXJzaW9uXG4gICAgdGhpcy5saW50ZXJzLmFkZChsaW50ZXIpXG4gIH1cbiAgZ2V0TGludGVycygpOiBBcnJheTxMaW50ZXI+IHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLmxpbnRlcnMpXG4gIH1cbiAgZGVsZXRlTGludGVyKGxpbnRlcjogTGludGVyKSB7XG4gICAgaWYgKCF0aGlzLmxpbnRlcnMuaGFzKGxpbnRlcikpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsaW50ZXJbJGFjdGl2YXRlZF0gPSBmYWxzZVxuICAgIHRoaXMubGludGVycy5kZWxldGUobGludGVyKVxuICB9XG4gIGFzeW5jIGdldENvbmZpZygpOiBQcm9taXNlPENvbmZpZ0ZpbGU+IHtcbiAgICBpZiAoIXRoaXMuY29uZmlnKSB7XG4gICAgICB0aGlzLmNvbmZpZyA9IGF3YWl0IGdldENvbmZpZ0ZpbGUoKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jb25maWdcbiAgfVxuICBhc3luYyBsaW50KHsgb25DaGFuZ2UsIGVkaXRvciB9IDogeyBvbkNoYW5nZTogYm9vbGVhbiwgZWRpdG9yOiBUZXh0RWRpdG9yIH0pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBmaWxlUGF0aCA9IGVkaXRvci5nZXRQYXRoKClcblxuICAgIGlmIChcbiAgICAgIChvbkNoYW5nZSAmJiAhdGhpcy5saW50T25DaGFuZ2UpIHx8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIExpbnQtb24tY2hhbmdlIG1pc21hdGNoXG4gICAgICAhZmlsZVBhdGggfHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3Qgc2F2ZWQgYW55d2hlcmUgeWV0XG4gICAgICBIZWxwZXJzLmlzUGF0aElnbm9yZWQoZWRpdG9yLmdldFBhdGgoKSwgdGhpcy5pZ25vcmVHbG9iLCB0aGlzLmlnbm9yZVZDUykgfHwgICAgICAgICAgICAgICAvLyBJZ25vcmVkIGJ5IFZDUyBvciBHbG9iXG4gICAgICAoIXRoaXMubGludFByZXZpZXdUYWJzICYmIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKS5nZXRQZW5kaW5nSXRlbSgpID09PSBlZGl0b3IpICAgICAvLyBJZ25vcmUgUHJldmlldyB0YWJzXG4gICAgKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBjb25zdCBzY29wZXMgPSBIZWxwZXJzLmdldEVkaXRvckN1cnNvclNjb3BlcyhlZGl0b3IpXG4gICAgY29uc3QgY29uZmlnID0gYXdhaXQgdGhpcy5nZXRDb25maWcoKVxuICAgIGNvbnN0IGRpc2FibGVkID0gYXdhaXQgY29uZmlnLmdldCgnZGlzYWJsZWQnKVxuXG4gICAgY29uc3QgcHJvbWlzZXMgPSBbXVxuICAgIGZvciAoY29uc3QgbGludGVyIG9mIHRoaXMubGludGVycykge1xuICAgICAgaWYgKCFIZWxwZXJzLnNob3VsZFRyaWdnZXJMaW50ZXIobGludGVyLCBvbkNoYW5nZSwgc2NvcGVzKSkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgaWYgKGRpc2FibGVkLmluY2x1ZGVzKGxpbnRlci5uYW1lKSkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgY29uc3QgbnVtYmVyID0gKytsaW50ZXJbJHJlcXVlc3RMYXRlc3RdXG4gICAgICBjb25zdCBzdGF0dXNCdWZmZXIgPSBsaW50ZXIuc2NvcGUgPT09ICdmaWxlJyA/IGVkaXRvci5nZXRCdWZmZXIoKSA6IG51bGxcbiAgICAgIGNvbnN0IHN0YXR1c0ZpbGVQYXRoID0gbGludGVyLnNjb3BlID09PSAnZmlsZScgPyBmaWxlUGF0aCA6IG51bGxcblxuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1iZWdpbi1saW50aW5nJywgeyBudW1iZXIsIGxpbnRlciwgZmlsZVBhdGg6IHN0YXR1c0ZpbGVQYXRoIH0pXG4gICAgICBwcm9taXNlcy5wdXNoKG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgICAgLy8gJEZsb3dJZ25vcmU6IFR5cGUgdG9vIGNvbXBsZXgsIGR1aFxuICAgICAgICByZXNvbHZlKGxpbnRlci5saW50KGVkaXRvcikpXG4gICAgICB9KS50aGVuKChtZXNzYWdlcykgPT4ge1xuICAgICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWZpbmlzaC1saW50aW5nJywgeyBudW1iZXIsIGxpbnRlciwgZmlsZVBhdGg6IHN0YXR1c0ZpbGVQYXRoIH0pXG4gICAgICAgIGlmIChsaW50ZXJbJHJlcXVlc3RMYXN0UmVjZWl2ZWRdID49IG51bWJlciB8fCAhbGludGVyWyRhY3RpdmF0ZWRdIHx8IChzdGF0dXNCdWZmZXIgJiYgIXN0YXR1c0J1ZmZlci5pc0FsaXZlKCkpKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgbGludGVyWyRyZXF1ZXN0TGFzdFJlY2VpdmVkXSA9IG51bWJlclxuICAgICAgICBpZiAoc3RhdHVzQnVmZmVyICYmICFzdGF0dXNCdWZmZXIuaXNBbGl2ZSgpKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAobWVzc2FnZXMgPT09IG51bGwpIHtcbiAgICAgICAgICAvLyBOT1RFOiBEbyBOT1QgdXBkYXRlIHRoZSBtZXNzYWdlcyB3aGVuIHByb3ZpZGVycyByZXR1cm4gbnVsbFxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHZhbGlkaXR5ID0gdHJ1ZVxuICAgICAgICAvLyBOT1RFOiBXZSBhcmUgY2FsbGluZyBpdCB3aGVuIHJlc3VsdHMgYXJlIG5vdCBhbiBhcnJheSB0byBzaG93IGEgbmljZSBub3RpZmljYXRpb25cbiAgICAgICAgaWYgKGF0b20uaW5EZXZNb2RlKCkgfHwgIUFycmF5LmlzQXJyYXkobWVzc2FnZXMpKSB7XG4gICAgICAgICAgdmFsaWRpdHkgPSBsaW50ZXJbJHZlcnNpb25dID09PSAyID8gVmFsaWRhdGUubWVzc2FnZXMobGludGVyLm5hbWUsIG1lc3NhZ2VzKSA6IFZhbGlkYXRlLm1lc3NhZ2VzTGVnYWN5KGxpbnRlci5uYW1lLCBtZXNzYWdlcylcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXZhbGlkaXR5KSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGludGVyWyR2ZXJzaW9uXSA9PT0gMikge1xuICAgICAgICAgIEhlbHBlcnMubm9ybWFsaXplTWVzc2FnZXMobGludGVyLm5hbWUsIG1lc3NhZ2VzKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIEhlbHBlcnMubm9ybWFsaXplTWVzc2FnZXNMZWdhY3kobGludGVyLm5hbWUsIG1lc3NhZ2VzKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtdXBkYXRlLW1lc3NhZ2VzJywgeyBtZXNzYWdlcywgbGludGVyLCBidWZmZXI6IHN0YXR1c0J1ZmZlciB9KVxuICAgICAgfSwgKGVycm9yKSA9PiB7XG4gICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtZmluaXNoLWxpbnRpbmcnLCB7IG51bWJlciwgbGludGVyLCBmaWxlUGF0aDogc3RhdHVzRmlsZVBhdGggfSlcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGBbTGludGVyXSBFcnJvciBydW5uaW5nICR7bGludGVyLm5hbWV9YCwge1xuICAgICAgICAgIGRldGFpbDogJ1NlZSBjb25zb2xlIGZvciBtb3JlIGluZm8nLFxuICAgICAgICB9KVxuICAgICAgICBjb25zb2xlLmVycm9yKGBbTGludGVyXSBFcnJvciBydW5uaW5nICR7bGludGVyLm5hbWV9YCwgZXJyb3IpXG4gICAgICB9KSlcbiAgICB9XG5cbiAgICBhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcylcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG4gIG9uRGlkVXBkYXRlTWVzc2FnZXMoY2FsbGJhY2s6IEZ1bmN0aW9uKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLXVwZGF0ZS1tZXNzYWdlcycsIGNhbGxiYWNrKVxuICB9XG4gIG9uRGlkQmVnaW5MaW50aW5nKGNhbGxiYWNrOiBGdW5jdGlvbik6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1iZWdpbi1saW50aW5nJywgY2FsbGJhY2spXG4gIH1cbiAgb25EaWRGaW5pc2hMaW50aW5nKGNhbGxiYWNrOiBGdW5jdGlvbik6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1maW5pc2gtbGludGluZycsIGNhbGxiYWNrKVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5saW50ZXJzLmNsZWFyKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gIH1cbn1cbiJdfQ==