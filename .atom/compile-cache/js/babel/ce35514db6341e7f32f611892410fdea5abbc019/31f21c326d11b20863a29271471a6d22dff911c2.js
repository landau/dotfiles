var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

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
      var textEditor = (0, _helpers.getActiveTextEditor)();
      (0, _assert2['default'])(textEditor, 'textEditor was null on a command supposed to run on text-editors only');
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

      var currentEditor = (0, _helpers.getActiveTextEditor)();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9jb21tYW5kcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7c0JBRXNCLFFBQVE7Ozs7b0JBQ00sTUFBTTs7dUJBRW1GLFdBQVc7O0lBR2xJLFFBQVE7QUFJRCxXQUpQLFFBQVEsR0FJRTs7OzBCQUpWLFFBQVE7O0FBS1YsUUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUE7QUFDbEIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTs7QUFFOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUU7QUFDekQsOEJBQXdCLEVBQUU7ZUFBTSxNQUFLLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDO09BQUE7QUFDckQsa0NBQTRCLEVBQUU7ZUFBTSxNQUFLLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDO09BQUE7QUFDMUQsb0NBQThCLEVBQUU7ZUFBTSxNQUFLLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQztPQUFBO0FBQ3BFLHdDQUFrQyxFQUFFO2VBQU0sTUFBSyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUM7T0FBQTtBQUN6RSxzQ0FBZ0MsRUFBRTtlQUFNLE1BQUssSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDO09BQUE7QUFDeEUsMENBQW9DLEVBQUU7ZUFBTSxNQUFLLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQztPQUFBO0FBQzdFLG1DQUE2QixFQUFFO2VBQU0sTUFBSyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUM7T0FBQTtBQUNsRSx1Q0FBaUMsRUFBRTtlQUFNLE1BQUssSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJ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LXVpLWRlZmF1bHQvbGliL2NvbW1hbmRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcblxuaW1wb3J0IHsgJGZpbGUsICRyYW5nZSwgZ2V0QWN0aXZlVGV4dEVkaXRvciwgdmlzaXRNZXNzYWdlLCBzb3J0TWVzc2FnZXMsIHNvcnRTb2x1dGlvbnMsIGZpbHRlck1lc3NhZ2VzLCBhcHBseVNvbHV0aW9uIH0gZnJvbSAnLi9oZWxwZXJzJ1xuaW1wb3J0IHR5cGUgeyBMaW50ZXJNZXNzYWdlIH0gZnJvbSAnLi90eXBlcydcblxuY2xhc3MgQ29tbWFuZHMge1xuICBtZXNzYWdlczogQXJyYXk8TGludGVyTWVzc2FnZT47XG4gIHN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5tZXNzYWdlcyA9IFtdXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAnbGludGVyLXVpLWRlZmF1bHQ6bmV4dCc6ICgpID0+IHRoaXMubW92ZSh0cnVlLCB0cnVlKSxcbiAgICAgICdsaW50ZXItdWktZGVmYXVsdDpwcmV2aW91cyc6ICgpID0+IHRoaXMubW92ZShmYWxzZSwgdHJ1ZSksXG4gICAgICAnbGludGVyLXVpLWRlZmF1bHQ6bmV4dC1lcnJvcic6ICgpID0+IHRoaXMubW92ZSh0cnVlLCB0cnVlLCAnZXJyb3InKSxcbiAgICAgICdsaW50ZXItdWktZGVmYXVsdDpwcmV2aW91cy1lcnJvcic6ICgpID0+IHRoaXMubW92ZShmYWxzZSwgdHJ1ZSwgJ2Vycm9yJyksXG4gICAgICAnbGludGVyLXVpLWRlZmF1bHQ6bmV4dC13YXJuaW5nJzogKCkgPT4gdGhpcy5tb3ZlKHRydWUsIHRydWUsICd3YXJuaW5nJyksXG4gICAgICAnbGludGVyLXVpLWRlZmF1bHQ6cHJldmlvdXMtd2FybmluZyc6ICgpID0+IHRoaXMubW92ZShmYWxzZSwgdHJ1ZSwgJ3dhcm5pbmcnKSxcbiAgICAgICdsaW50ZXItdWktZGVmYXVsdDpuZXh0LWluZm8nOiAoKSA9PiB0aGlzLm1vdmUodHJ1ZSwgdHJ1ZSwgJ2luZm8nKSxcbiAgICAgICdsaW50ZXItdWktZGVmYXVsdDpwcmV2aW91cy1pbmZvJzogKCkgPT4gdGhpcy5tb3ZlKGZhbHNlLCB0cnVlLCAnaW5mbycpLFxuXG4gICAgICAnbGludGVyLXVpLWRlZmF1bHQ6bmV4dC1pbi1jdXJyZW50LWZpbGUnOiAoKSA9PiB0aGlzLm1vdmUodHJ1ZSwgZmFsc2UpLFxuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0OnByZXZpb3VzLWluLWN1cnJlbnQtZmlsZSc6ICgpID0+IHRoaXMubW92ZShmYWxzZSwgZmFsc2UpLFxuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0Om5leHQtZXJyb3ItaW4tY3VycmVudC1maWxlJzogKCkgPT4gdGhpcy5tb3ZlKHRydWUsIGZhbHNlLCAnZXJyb3InKSxcbiAgICAgICdsaW50ZXItdWktZGVmYXVsdDpwcmV2aW91cy1lcnJvci1pbi1jdXJyZW50LWZpbGUnOiAoKSA9PiB0aGlzLm1vdmUoZmFsc2UsIGZhbHNlLCAnZXJyb3InKSxcbiAgICAgICdsaW50ZXItdWktZGVmYXVsdDpuZXh0LXdhcm5pbmctaW4tY3VycmVudC1maWxlJzogKCkgPT4gdGhpcy5tb3ZlKHRydWUsIGZhbHNlLCAnd2FybmluZycpLFxuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0OnByZXZpb3VzLXdhcm5pbmctaW4tY3VycmVudC1maWxlJzogKCkgPT4gdGhpcy5tb3ZlKGZhbHNlLCBmYWxzZSwgJ3dhcm5pbmcnKSxcbiAgICAgICdsaW50ZXItdWktZGVmYXVsdDpuZXh0LWluZm8taW4tY3VycmVudC1maWxlJzogKCkgPT4gdGhpcy5tb3ZlKHRydWUsIGZhbHNlLCAnaW5mbycpLFxuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0OnByZXZpb3VzLWluZm8taW4tY3VycmVudC1maWxlJzogKCkgPT4gdGhpcy5tb3ZlKGZhbHNlLCBmYWxzZSwgJ2luZm8nKSxcblxuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0OnRvZ2dsZS1wYW5lbCc6ICgpID0+IHRoaXMudG9nZ2xlUGFuZWwoKSxcblxuICAgICAgLy8gTk9URTogQWRkIG5vLW9wcyBoZXJlIHNvIHRoZXkgYXJlIHJlY29nbml6ZWQgYnkgY29tbWFuZHMgcmVnaXN0cnlcbiAgICAgIC8vIFJlYWwgY29tbWFuZHMgYXJlIHJlZ2lzdGVyZWQgd2hlbiB0b29sdGlwIGlzIHNob3duIGluc2lkZSB0b29sdGlwJ3MgZGVsZWdhdGVcbiAgICAgICdsaW50ZXItdWktZGVmYXVsdDpleHBhbmQtdG9vbHRpcCc6IGZ1bmN0aW9uKCkgeyB9LFxuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0OmNvbGxhcHNlLXRvb2x0aXAnOiBmdW5jdGlvbigpIHsgfSxcbiAgICB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXRleHQtZWRpdG9yOm5vdChbbWluaV0pJywge1xuICAgICAgJ2xpbnRlci11aS1kZWZhdWx0OmFwcGx5LWFsbC1zb2x1dGlvbnMnOiAoKSA9PiB0aGlzLmFwcGx5QWxsU29sdXRpb25zKCksXG4gICAgfSkpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnI2xpbnRlci1wYW5lbCcsIHtcbiAgICAgICdjb3JlOmNvcHknOiAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHNlbGVjdGlvbiA9IGRvY3VtZW50LmdldFNlbGVjdGlvbigpXG4gICAgICAgIGlmIChzZWxlY3Rpb24pIHtcbiAgICAgICAgICBhdG9tLmNsaXBib2FyZC53cml0ZShzZWxlY3Rpb24udG9TdHJpbmcoKSlcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9KSlcbiAgfVxuICB0b2dnbGVQYW5lbCgpOiB2b2lkIHtcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ2xpbnRlci11aS1kZWZhdWx0LnNob3dQYW5lbCcsICFhdG9tLmNvbmZpZy5nZXQoJ2xpbnRlci11aS1kZWZhdWx0LnNob3dQYW5lbCcpKVxuICB9XG4gIC8vIE5PVEU6IEFwcGx5IHNvbHV0aW9ucyBmcm9tIGJvdHRvbSB0byB0b3AsIHNvIHRoZXkgZG9uJ3QgaW52YWxpZGF0ZSBlYWNoIG90aGVyXG4gIGFwcGx5QWxsU29sdXRpb25zKCk6IHZvaWQge1xuICAgIGNvbnN0IHRleHRFZGl0b3IgPSBnZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBpbnZhcmlhbnQodGV4dEVkaXRvciwgJ3RleHRFZGl0b3Igd2FzIG51bGwgb24gYSBjb21tYW5kIHN1cHBvc2VkIHRvIHJ1biBvbiB0ZXh0LWVkaXRvcnMgb25seScpXG4gICAgY29uc3QgbWVzc2FnZXMgPSBzb3J0TWVzc2FnZXMoW3sgY29sdW1uOiAnbGluZScsIHR5cGU6ICdkZXNjJyB9XSwgZmlsdGVyTWVzc2FnZXModGhpcy5tZXNzYWdlcywgdGV4dEVkaXRvci5nZXRQYXRoKCkpKVxuICAgIG1lc3NhZ2VzLmZvckVhY2goZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICAgaWYgKG1lc3NhZ2UudmVyc2lvbiA9PT0gMSAmJiBtZXNzYWdlLmZpeCkge1xuICAgICAgICBhcHBseVNvbHV0aW9uKHRleHRFZGl0b3IsIDEsIG1lc3NhZ2UuZml4KVxuICAgICAgfSBlbHNlIGlmIChtZXNzYWdlLnZlcnNpb24gPT09IDIgJiYgbWVzc2FnZS5zb2x1dGlvbnMgJiYgbWVzc2FnZS5zb2x1dGlvbnMubGVuZ3RoKSB7XG4gICAgICAgIGFwcGx5U29sdXRpb24odGV4dEVkaXRvciwgMiwgc29ydFNvbHV0aW9ucyhtZXNzYWdlLnNvbHV0aW9ucylbMF0pXG4gICAgICB9XG4gICAgfSlcbiAgfVxuICBtb3ZlKGZvcndhcmQ6IGJvb2xlYW4sIGdsb2JhbGx5OiBib29sZWFuLCBzZXZlcml0eTogP3N0cmluZyA9IG51bGwpOiB2b2lkIHtcbiAgICBjb25zdCBjdXJyZW50RWRpdG9yID0gZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgY29uc3QgY3VycmVudEZpbGU6IGFueSA9IChjdXJyZW50RWRpdG9yICYmIGN1cnJlbnRFZGl0b3IuZ2V0UGF0aCgpKSB8fCBOYU5cbiAgICAvLyBOT1RFOiBeIFNldHRpbmcgZGVmYXVsdCB0byBOYU4gc28gaXQgd29uJ3QgbWF0Y2ggZW1wdHkgZmlsZSBwYXRocyBpbiBtZXNzYWdlc1xuICAgIGNvbnN0IG1lc3NhZ2VzID0gc29ydE1lc3NhZ2VzKFt7IGNvbHVtbjogJ2ZpbGUnLCB0eXBlOiAnYXNjJyB9LCB7IGNvbHVtbjogJ2xpbmUnLCB0eXBlOiAnYXNjJyB9XSwgZmlsdGVyTWVzc2FnZXModGhpcy5tZXNzYWdlcywgZ2xvYmFsbHkgPyBudWxsIDogY3VycmVudEZpbGUsIHNldmVyaXR5KSlcbiAgICBjb25zdCBleHBlY3RlZFZhbHVlID0gZm9yd2FyZCA/IC0xIDogMVxuXG4gICAgaWYgKCFjdXJyZW50RWRpdG9yKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZm9yd2FyZCA/IG1lc3NhZ2VzWzBdIDogbWVzc2FnZXNbbWVzc2FnZXMubGVuZ3RoIC0gMV1cbiAgICAgIGlmIChtZXNzYWdlKSB7XG4gICAgICAgIHZpc2l0TWVzc2FnZShtZXNzYWdlKVxuICAgICAgfVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IGN1cnJlbnRQb3NpdGlvbiA9IGN1cnJlbnRFZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuXG4gICAgLy8gTk9URTogSXRlcmF0ZSBib3R0b20gdG8gdG9wIHRvIGZpbmQgdGhlIHByZXZpb3VzIG1lc3NhZ2VcbiAgICAvLyBCZWNhdXNlIGlmIHdlIHNlYXJjaCB0b3AgdG8gYm90dG9tIHdoZW4gc29ydGVkLCBmaXJzdCBpdGVtIHdpbGwgYWx3YXlzXG4gICAgLy8gYmUgdGhlIHNtYWxsZXN0XG4gICAgaWYgKCFmb3J3YXJkKSB7XG4gICAgICBtZXNzYWdlcy5yZXZlcnNlKClcbiAgICB9XG5cbiAgICBsZXQgZm91bmRcbiAgICBsZXQgY3VycmVudEZpbGVFbmNvdW50ZXJlZCA9IGZhbHNlXG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbmd0aCA9IG1lc3NhZ2VzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gbWVzc2FnZXNbaV1cbiAgICAgIGNvbnN0IG1lc3NhZ2VGaWxlID0gJGZpbGUobWVzc2FnZSlcbiAgICAgIGNvbnN0IG1lc3NhZ2VSYW5nZSA9ICRyYW5nZShtZXNzYWdlKVxuXG4gICAgICBpZiAoIWN1cnJlbnRGaWxlRW5jb3VudGVyZWQgJiYgbWVzc2FnZUZpbGUgPT09IGN1cnJlbnRGaWxlKSB7XG4gICAgICAgIGN1cnJlbnRGaWxlRW5jb3VudGVyZWQgPSB0cnVlXG4gICAgICB9XG4gICAgICBpZiAobWVzc2FnZUZpbGUgJiYgbWVzc2FnZVJhbmdlKSB7XG4gICAgICAgIGlmIChjdXJyZW50RmlsZUVuY291bnRlcmVkICYmIG1lc3NhZ2VGaWxlICE9PSBjdXJyZW50RmlsZSkge1xuICAgICAgICAgIGZvdW5kID0gbWVzc2FnZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH0gZWxzZSBpZiAobWVzc2FnZUZpbGUgPT09IGN1cnJlbnRGaWxlICYmIGN1cnJlbnRQb3NpdGlvbi5jb21wYXJlKG1lc3NhZ2VSYW5nZS5zdGFydCkgPT09IGV4cGVjdGVkVmFsdWUpIHtcbiAgICAgICAgICBmb3VuZCA9IG1lc3NhZ2VcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFmb3VuZCAmJiBtZXNzYWdlcy5sZW5ndGgpIHtcbiAgICAgIC8vIFJlc2V0IGJhY2sgdG8gZmlyc3Qgb3IgbGFzdCBkZXBlbmRpbmcgb24gZGlyZWN0aW9uXG4gICAgICBmb3VuZCA9IG1lc3NhZ2VzWzBdXG4gICAgfVxuXG4gICAgaWYgKGZvdW5kKSB7XG4gICAgICB2aXNpdE1lc3NhZ2UoZm91bmQpXG4gICAgfVxuICB9XG4gIHVwZGF0ZShtZXNzYWdlczogQXJyYXk8TGludGVyTWVzc2FnZT4pIHtcbiAgICB0aGlzLm1lc3NhZ2VzID0gbWVzc2FnZXNcbiAgfVxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbW1hbmRzXG4iXX0=