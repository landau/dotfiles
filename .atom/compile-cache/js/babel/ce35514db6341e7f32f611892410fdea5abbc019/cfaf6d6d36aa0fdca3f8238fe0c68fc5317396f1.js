var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _helpers = require('./helpers');

var Commands = (function () {
  function Commands() {
    var _this = this;

    _classCallCheck(this, Commands);

    this.messages = [];
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'linter-ui-default:next': function linterUiDefaultNext() {
        return _this.move(true, true);
      },
      'linter-ui-default:previous': function linterUiDefaultPrevious() {
        return _this.move(false, true);
      },
      'linter-ui-default:next-error': function linterUiDefaultNextError() {
        return _this.move(true, true, 'error');
      },
      'linter-ui-default:previous-error': function linterUiDefaultPreviousError() {
        return _this.move(false, true, 'error');
      },
      'linter-ui-default:next-warning': function linterUiDefaultNextWarning() {
        return _this.move(true, true, 'warning');
      },
      'linter-ui-default:previous-warning': function linterUiDefaultPreviousWarning() {
        return _this.move(false, true, 'warning');
      },
      'linter-ui-default:next-info': function linterUiDefaultNextInfo() {
        return _this.move(true, true, 'info');
      },
      'linter-ui-default:previous-info': function linterUiDefaultPreviousInfo() {
        return _this.move(false, true, 'info');
      },

      'linter-ui-default:next-in-current-file': function linterUiDefaultNextInCurrentFile() {
        return _this.move(true, false);
      },
      'linter-ui-default:previous-in-current-file': function linterUiDefaultPreviousInCurrentFile() {
        return _this.move(false, false);
      },
      'linter-ui-default:next-error-in-current-file': function linterUiDefaultNextErrorInCurrentFile() {
        return _this.move(true, false, 'error');
      },
      'linter-ui-default:previous-error-in-current-file': function linterUiDefaultPreviousErrorInCurrentFile() {
        return _this.move(false, false, 'error');
      },
      'linter-ui-default:next-warning-in-current-file': function linterUiDefaultNextWarningInCurrentFile() {
        return _this.move(true, false, 'warning');
      },
      'linter-ui-default:previous-warning-in-current-file': function linterUiDefaultPreviousWarningInCurrentFile() {
        return _this.move(false, false, 'warning');
      },
      'linter-ui-default:next-info-in-current-file': function linterUiDefaultNextInfoInCurrentFile() {
        return _this.move(true, false, 'info');
      },
      'linter-ui-default:previous-info-in-current-file': function linterUiDefaultPreviousInfoInCurrentFile() {
        return _this.move(false, false, 'info');
      },

      'linter-ui-default:toggle-panel': function linterUiDefaultTogglePanel() {
        return _this.togglePanel();
      },

      // NOTE: Add no-ops here so they are recognized by commands registry
      // Real commands are registered when tooltip is shown inside tooltip's delegate
      'linter-ui-default:expand-tooltip': function linterUiDefaultExpandTooltip() {},
      'linter-ui-default:collapse-tooltip': function linterUiDefaultCollapseTooltip() {}
    }));
    this.subscriptions.add(atom.commands.add('atom-text-editor:not([mini])', {
      'linter-ui-default:apply-all-solutions': function linterUiDefaultApplyAllSolutions() {
        return _this.applyAllSolutions();
      }
    }));
    this.subscriptions.add(atom.commands.add('#linter-panel', {
      'core:copy': function coreCopy() {
        var selection = document.getSelection();
        if (selection) {
          atom.clipboard.write(selection.toString());
        }
      }
    }));
  }

  _createClass(Commands, [{
    key: 'togglePanel',
    value: function togglePanel() {
      atom.config.set('linter-ui-default.showPanel', !atom.config.get('linter-ui-default.showPanel'));
    }

    // NOTE: Apply solutions from bottom to top, so they don't invalidate each other
  }, {
    key: 'applyAllSolutions',
    value: function applyAllSolutions() {
      var textEditor = atom.workspace.getActiveTextEditor();
      var messages = (0, _helpers.sortMessages)([{ column: 'line', type: 'desc' }], (0, _helpers.filterMessages)(this.messages, textEditor.getPath()));
      messages.forEach(function (message) {
        if (message.version === 1 && message.fix) {
          (0, _helpers.applySolution)(textEditor, 1, message.fix);
        } else if (message.version === 2 && message.solutions && message.solutions.length) {
          (0, _helpers.applySolution)(textEditor, 2, (0, _helpers.sortSolutions)(message.solutions)[0]);
        }
      });
    }
  }, {
    key: 'move',
    value: function move(forward, globally) {
      var severity = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

      var currentEditor = atom.workspace.getActiveTextEditor();
      var currentFile = currentEditor && currentEditor.getPath() || NaN;
      // NOTE: ^ Setting default to NaN so it won't match empty file paths in messages
      var messages = (0, _helpers.sortMessages)([{ column: 'file', type: 'asc' }, { column: 'line', type: 'asc' }], (0, _helpers.filterMessages)(this.messages, globally ? null : currentFile, severity));
      var expectedValue = forward ? -1 : 1;

      if (!currentEditor) {
        var message = forward ? messages[0] : messages[messages.length - 1];
        if (message) {
          (0, _helpers.visitMessage)(message);
        }
        return;
      }
      var currentPosition = currentEditor.getCursorBufferPosition();

      // NOTE: Iterate bottom to top to find the previous message
      // Because if we search top to bottom when sorted, first item will always
      // be the smallest
      if (!forward) {
        messages.reverse();
      }

      var found = undefined;
      var currentFileEncountered = false;
      for (var i = 0, _length = messages.length; i < _length; i++) {
        var message = messages[i];
        var messageFile = (0, _helpers.$file)(message);
        var messageRange = (0, _helpers.$range)(message);

        if (!currentFileEncountered && messageFile === currentFile) {
          currentFileEncountered = true;
        }
        if (messageFile && messageRange) {
          if (currentFileEncountered && messageFile !== currentFile) {
            found = message;
            break;
          } else if (messageFile === currentFile && currentPosition.compare(messageRange.start) === expectedValue) {
            found = message;
            break;
          }
        }
      }

      if (!found && messages.length) {
        // Reset back to first or last depending on direction
        found = messages[0];
      }

      if (found) {
        (0, _helpers.visitMessage)(found);
      }
    }
  }, {
    key: 'update',
    value: function update(messages) {
      this.messages = messages;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.subscriptions.dispose();
    }
  }]);

  return Commands;
})();

module.exports = Commands;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9jb21tYW5kcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O29CQUVvQyxNQUFNOzt1QkFFOEQsV0FBVzs7SUFHN0csUUFBUTtBQUlELFdBSlAsUUFBUSxHQUlFOzs7MEJBSlYsUUFBUTs7QUFLVixRQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQTtBQUNsQixRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFBOztBQUU5QyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUN6RCw4QkFBd0IsRUFBRTtlQUFNLE1BQUssSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUM7T0FBQTtBQUNyRCxrQ0FBNEIsRUFBRTtlQUFNLE1BQUssSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUM7T0FBQTtBQUMxRCxvQ0FBOEIsRUFBRTtlQUFNLE1BQUssSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDO09BQUE7QUFDcEUsd0NBQWtDLEVBQUU7ZUFBTSxNQUFLLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQztPQUFBO0FBQ3pFLHNDQUFnQyxFQUFFO2VBQU0sTUFBSyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUM7T0FBQTtBQUN4RSwwQ0FBb0MsRUFBRTtlQUFNLE1BQUssSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDO09BQUE7QUFDN0UsbUNBQTZCLEVBQUU7ZUFBTSxNQUFLLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQztPQUFBO0FBQ2xFLHVDQUFpQyxFQUFFO2VBQU0sTUFBSyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxN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Y2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9jb21tYW5kcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuXG5pbXBvcnQgeyAkZmlsZSwgJHJhbmdlLCB2aXNpdE1lc3NhZ2UsIHNvcnRNZXNzYWdlcywgc29ydFNvbHV0aW9ucywgZmlsdGVyTWVzc2FnZXMsIGFwcGx5U29sdXRpb24gfSBmcm9tICcuL2hlbHBlcnMnXG5pbXBvcnQgdHlwZSB7IExpbnRlck1lc3NhZ2UgfSBmcm9tICcuL3R5cGVzJ1xuXG5jbGFzcyBDb21tYW5kcyB7XG4gIG1lc3NhZ2VzOiBBcnJheTxMaW50ZXJNZXNzYWdlPjtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLm1lc3NhZ2VzID0gW11cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICdsaW50ZXItdWktZGVmYXVsdDpuZXh0JzogKCkgPT4gdGhpcy5tb3ZlKHRydWUsIHRydWUpLFxuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0OnByZXZpb3VzJzogKCkgPT4gdGhpcy5tb3ZlKGZhbHNlLCB0cnVlKSxcbiAgICAgICdsaW50ZXItdWktZGVmYXVsdDpuZXh0LWVycm9yJzogKCkgPT4gdGhpcy5tb3ZlKHRydWUsIHRydWUsICdlcnJvcicpLFxuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0OnByZXZpb3VzLWVycm9yJzogKCkgPT4gdGhpcy5tb3ZlKGZhbHNlLCB0cnVlLCAnZXJyb3InKSxcbiAgICAgICdsaW50ZXItdWktZGVmYXVsdDpuZXh0LXdhcm5pbmcnOiAoKSA9PiB0aGlzLm1vdmUodHJ1ZSwgdHJ1ZSwgJ3dhcm5pbmcnKSxcbiAgICAgICdsaW50ZXItdWktZGVmYXVsdDpwcmV2aW91cy13YXJuaW5nJzogKCkgPT4gdGhpcy5tb3ZlKGZhbHNlLCB0cnVlLCAnd2FybmluZycpLFxuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0Om5leHQtaW5mbyc6ICgpID0+IHRoaXMubW92ZSh0cnVlLCB0cnVlLCAnaW5mbycpLFxuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0OnByZXZpb3VzLWluZm8nOiAoKSA9PiB0aGlzLm1vdmUoZmFsc2UsIHRydWUsICdpbmZvJyksXG5cbiAgICAgICdsaW50ZXItdWktZGVmYXVsdDpuZXh0LWluLWN1cnJlbnQtZmlsZSc6ICgpID0+IHRoaXMubW92ZSh0cnVlLCBmYWxzZSksXG4gICAgICAnbGludGVyLXVpLWRlZmF1bHQ6cHJldmlvdXMtaW4tY3VycmVudC1maWxlJzogKCkgPT4gdGhpcy5tb3ZlKGZhbHNlLCBmYWxzZSksXG4gICAgICAnbGludGVyLXVpLWRlZmF1bHQ6bmV4dC1lcnJvci1pbi1jdXJyZW50LWZpbGUnOiAoKSA9PiB0aGlzLm1vdmUodHJ1ZSwgZmFsc2UsICdlcnJvcicpLFxuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0OnByZXZpb3VzLWVycm9yLWluLWN1cnJlbnQtZmlsZSc6ICgpID0+IHRoaXMubW92ZShmYWxzZSwgZmFsc2UsICdlcnJvcicpLFxuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0Om5leHQtd2FybmluZy1pbi1jdXJyZW50LWZpbGUnOiAoKSA9PiB0aGlzLm1vdmUodHJ1ZSwgZmFsc2UsICd3YXJuaW5nJyksXG4gICAgICAnbGludGVyLXVpLWRlZmF1bHQ6cHJldmlvdXMtd2FybmluZy1pbi1jdXJyZW50LWZpbGUnOiAoKSA9PiB0aGlzLm1vdmUoZmFsc2UsIGZhbHNlLCAnd2FybmluZycpLFxuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0Om5leHQtaW5mby1pbi1jdXJyZW50LWZpbGUnOiAoKSA9PiB0aGlzLm1vdmUodHJ1ZSwgZmFsc2UsICdpbmZvJyksXG4gICAgICAnbGludGVyLXVpLWRlZmF1bHQ6cHJldmlvdXMtaW5mby1pbi1jdXJyZW50LWZpbGUnOiAoKSA9PiB0aGlzLm1vdmUoZmFsc2UsIGZhbHNlLCAnaW5mbycpLFxuXG4gICAgICAnbGludGVyLXVpLWRlZmF1bHQ6dG9nZ2xlLXBhbmVsJzogKCkgPT4gdGhpcy50b2dnbGVQYW5lbCgpLFxuXG4gICAgICAvLyBOT1RFOiBBZGQgbm8tb3BzIGhlcmUgc28gdGhleSBhcmUgcmVjb2duaXplZCBieSBjb21tYW5kcyByZWdpc3RyeVxuICAgICAgLy8gUmVhbCBjb21tYW5kcyBhcmUgcmVnaXN0ZXJlZCB3aGVuIHRvb2x0aXAgaXMgc2hvd24gaW5zaWRlIHRvb2x0aXAncyBkZWxlZ2F0ZVxuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0OmV4cGFuZC10b29sdGlwJzogZnVuY3Rpb24oKSB7IH0sXG4gICAgICAnbGludGVyLXVpLWRlZmF1bHQ6Y29sbGFwc2UtdG9vbHRpcCc6IGZ1bmN0aW9uKCkgeyB9LFxuICAgIH0pKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tdGV4dC1lZGl0b3I6bm90KFttaW5pXSknLCB7XG4gICAgICAnbGludGVyLXVpLWRlZmF1bHQ6YXBwbHktYWxsLXNvbHV0aW9ucyc6ICgpID0+IHRoaXMuYXBwbHlBbGxTb2x1dGlvbnMoKSxcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCcjbGludGVyLXBhbmVsJywge1xuICAgICAgJ2NvcmU6Y29weSc6ICgpID0+IHtcbiAgICAgICAgY29uc3Qgc2VsZWN0aW9uID0gZG9jdW1lbnQuZ2V0U2VsZWN0aW9uKClcbiAgICAgICAgaWYgKHNlbGVjdGlvbikge1xuICAgICAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHNlbGVjdGlvbi50b1N0cmluZygpKVxuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pKVxuICB9XG4gIHRvZ2dsZVBhbmVsKCk6IHZvaWQge1xuICAgIGF0b20uY29uZmlnLnNldCgnbGludGVyLXVpLWRlZmF1bHQuc2hvd1BhbmVsJywgIWF0b20uY29uZmlnLmdldCgnbGludGVyLXVpLWRlZmF1bHQuc2hvd1BhbmVsJykpXG4gIH1cbiAgLy8gTk9URTogQXBwbHkgc29sdXRpb25zIGZyb20gYm90dG9tIHRvIHRvcCwgc28gdGhleSBkb24ndCBpbnZhbGlkYXRlIGVhY2ggb3RoZXJcbiAgYXBwbHlBbGxTb2x1dGlvbnMoKTogdm9pZCB7XG4gICAgY29uc3QgdGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGNvbnN0IG1lc3NhZ2VzID0gc29ydE1lc3NhZ2VzKFt7IGNvbHVtbjogJ2xpbmUnLCB0eXBlOiAnZGVzYycgfV0sIGZpbHRlck1lc3NhZ2VzKHRoaXMubWVzc2FnZXMsIHRleHRFZGl0b3IuZ2V0UGF0aCgpKSlcbiAgICBtZXNzYWdlcy5mb3JFYWNoKGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICAgIGlmIChtZXNzYWdlLnZlcnNpb24gPT09IDEgJiYgbWVzc2FnZS5maXgpIHtcbiAgICAgICAgYXBwbHlTb2x1dGlvbih0ZXh0RWRpdG9yLCAxLCBtZXNzYWdlLmZpeClcbiAgICAgIH0gZWxzZSBpZiAobWVzc2FnZS52ZXJzaW9uID09PSAyICYmIG1lc3NhZ2Uuc29sdXRpb25zICYmIG1lc3NhZ2Uuc29sdXRpb25zLmxlbmd0aCkge1xuICAgICAgICBhcHBseVNvbHV0aW9uKHRleHRFZGl0b3IsIDIsIHNvcnRTb2x1dGlvbnMobWVzc2FnZS5zb2x1dGlvbnMpWzBdKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgbW92ZShmb3J3YXJkOiBib29sZWFuLCBnbG9iYWxseTogYm9vbGVhbiwgc2V2ZXJpdHk6ID9zdHJpbmcgPSBudWxsKTogdm9pZCB7XG4gICAgY29uc3QgY3VycmVudEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGNvbnN0IGN1cnJlbnRGaWxlOiBhbnkgPSAoY3VycmVudEVkaXRvciAmJiBjdXJyZW50RWRpdG9yLmdldFBhdGgoKSkgfHwgTmFOXG4gICAgLy8gTk9URTogXiBTZXR0aW5nIGRlZmF1bHQgdG8gTmFOIHNvIGl0IHdvbid0IG1hdGNoIGVtcHR5IGZpbGUgcGF0aHMgaW4gbWVzc2FnZXNcbiAgICBjb25zdCBtZXNzYWdlcyA9IHNvcnRNZXNzYWdlcyhbeyBjb2x1bW46ICdmaWxlJywgdHlwZTogJ2FzYycgfSwgeyBjb2x1bW46ICdsaW5lJywgdHlwZTogJ2FzYycgfV0sIGZpbHRlck1lc3NhZ2VzKHRoaXMubWVzc2FnZXMsIGdsb2JhbGx5ID8gbnVsbCA6IGN1cnJlbnRGaWxlLCBzZXZlcml0eSkpXG4gICAgY29uc3QgZXhwZWN0ZWRWYWx1ZSA9IGZvcndhcmQgPyAtMSA6IDFcblxuICAgIGlmICghY3VycmVudEVkaXRvcikge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGZvcndhcmQgPyBtZXNzYWdlc1swXSA6IG1lc3NhZ2VzW21lc3NhZ2VzLmxlbmd0aCAtIDFdXG4gICAgICBpZiAobWVzc2FnZSkge1xuICAgICAgICB2aXNpdE1lc3NhZ2UobWVzc2FnZSlcbiAgICAgIH1cbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCBjdXJyZW50UG9zaXRpb24gPSBjdXJyZW50RWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKClcblxuICAgIC8vIE5PVEU6IEl0ZXJhdGUgYm90dG9tIHRvIHRvcCB0byBmaW5kIHRoZSBwcmV2aW91cyBtZXNzYWdlXG4gICAgLy8gQmVjYXVzZSBpZiB3ZSBzZWFyY2ggdG9wIHRvIGJvdHRvbSB3aGVuIHNvcnRlZCwgZmlyc3QgaXRlbSB3aWxsIGFsd2F5c1xuICAgIC8vIGJlIHRoZSBzbWFsbGVzdFxuICAgIGlmICghZm9yd2FyZCkge1xuICAgICAgbWVzc2FnZXMucmV2ZXJzZSgpXG4gICAgfVxuXG4gICAgbGV0IGZvdW5kXG4gICAgbGV0IGN1cnJlbnRGaWxlRW5jb3VudGVyZWQgPSBmYWxzZVxuICAgIGZvciAobGV0IGkgPSAwLCBsZW5ndGggPSBtZXNzYWdlcy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IG1lc3NhZ2VzW2ldXG4gICAgICBjb25zdCBtZXNzYWdlRmlsZSA9ICRmaWxlKG1lc3NhZ2UpXG4gICAgICBjb25zdCBtZXNzYWdlUmFuZ2UgPSAkcmFuZ2UobWVzc2FnZSlcblxuICAgICAgaWYgKCFjdXJyZW50RmlsZUVuY291bnRlcmVkICYmIG1lc3NhZ2VGaWxlID09PSBjdXJyZW50RmlsZSkge1xuICAgICAgICBjdXJyZW50RmlsZUVuY291bnRlcmVkID0gdHJ1ZVxuICAgICAgfVxuICAgICAgaWYgKG1lc3NhZ2VGaWxlICYmIG1lc3NhZ2VSYW5nZSkge1xuICAgICAgICBpZiAoY3VycmVudEZpbGVFbmNvdW50ZXJlZCAmJiBtZXNzYWdlRmlsZSAhPT0gY3VycmVudEZpbGUpIHtcbiAgICAgICAgICBmb3VuZCA9IG1lc3NhZ2VcbiAgICAgICAgICBicmVha1xuICAgICAgICB9IGVsc2UgaWYgKG1lc3NhZ2VGaWxlID09PSBjdXJyZW50RmlsZSAmJiBjdXJyZW50UG9zaXRpb24uY29tcGFyZShtZXNzYWdlUmFuZ2Uuc3RhcnQpID09PSBleHBlY3RlZFZhbHVlKSB7XG4gICAgICAgICAgZm91bmQgPSBtZXNzYWdlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghZm91bmQgJiYgbWVzc2FnZXMubGVuZ3RoKSB7XG4gICAgICAvLyBSZXNldCBiYWNrIHRvIGZpcnN0IG9yIGxhc3QgZGVwZW5kaW5nIG9uIGRpcmVjdGlvblxuICAgICAgZm91bmQgPSBtZXNzYWdlc1swXVxuICAgIH1cblxuICAgIGlmIChmb3VuZCkge1xuICAgICAgdmlzaXRNZXNzYWdlKGZvdW5kKVxuICAgIH1cbiAgfVxuICB1cGRhdGUobWVzc2FnZXM6IEFycmF5PExpbnRlck1lc3NhZ2U+KSB7XG4gICAgdGhpcy5tZXNzYWdlcyA9IG1lc3NhZ2VzXG4gIH1cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDb21tYW5kc1xuIl19