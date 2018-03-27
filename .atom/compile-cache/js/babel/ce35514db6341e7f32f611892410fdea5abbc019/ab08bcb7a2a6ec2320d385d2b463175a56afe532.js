function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _atom = require('atom');

var _jasmineFix = require('jasmine-fix');

var _libHelpers = require('../lib/helpers');

var Helpers = _interopRequireWildcard(_libHelpers);

var _common = require('./common');

describe('Helpers', function () {
  // NOTE: Did *not* add specs for messageKey and messageKeyLegacy on purpose
  describe('shouldTriggerLinter', function () {
    function shouldTriggerLinter(a, b, c) {
      return Helpers.shouldTriggerLinter(a, b, c);
    }

    (0, _jasmineFix.it)('works does not trigger non-fly ones on fly', function () {
      expect(shouldTriggerLinter({
        lintOnFly: false,
        grammarScopes: ['source.js']
      }, true, ['source.js'])).toBe(false);
    });
    (0, _jasmineFix.it)('triggers on fly ones on fly', function () {
      expect(shouldTriggerLinter({
        lintOnFly: true,
        grammarScopes: ['source.js', 'source.coffee']
      }, true, ['source.js', 'source.js.emebdded'])).toBe(true);
    });
    (0, _jasmineFix.it)('triggers all on non-fly', function () {
      expect(shouldTriggerLinter({
        lintOnFly: false,
        grammarScopes: ['source.js']
      }, false, ['source.js'])).toBe(true);
      expect(shouldTriggerLinter({
        lintOnFly: true,
        grammarScopes: ['source.js']
      }, false, ['source.js'])).toBe(true);
    });
    (0, _jasmineFix.it)('does not trigger if grammarScopes does not match', function () {
      expect(shouldTriggerLinter({
        lintOnFly: true,
        grammarScopes: ['source.coffee']
      }, true, ['source.js'])).toBe(false);
      expect(shouldTriggerLinter({
        lintOnFly: true,
        grammarScopes: ['source.coffee', 'source.go']
      }, false, ['source.js'])).toBe(false);
      expect(shouldTriggerLinter({
        lintOnFly: false,
        grammarScopes: ['source.coffee', 'source.rust']
      }, false, ['source.js', 'source.hell'])).toBe(false);
    });
  });
  describe('isPathIgnored', function () {
    function isPathIgnored(a, b, c) {
      return Helpers.isPathIgnored(a, b || '**/*.min.{js,css}', c || false);
    }

    (0, _jasmineFix.it)('returns false if path does not match glob', function () {
      expect(isPathIgnored('a.js')).toBe(false);
      expect(isPathIgnored('a.css')).toBe(false);
      expect(isPathIgnored('/a.js')).toBe(false);
      expect(isPathIgnored('/a.css')).toBe(false);
    });
    (0, _jasmineFix.it)('returns false correctly for windows styled paths', function () {
      expect(isPathIgnored('a.js')).toBe(false);
      expect(isPathIgnored('a.css')).toBe(false);
      expect(isPathIgnored('\\a.js')).toBe(false);
      expect(isPathIgnored('\\a.css')).toBe(false);
    });
    (0, _jasmineFix.it)('returns true if path matches glob', function () {
      expect(isPathIgnored('a.min.js')).toBe(true);
      expect(isPathIgnored('a.min.css')).toBe(true);
      expect(isPathIgnored('/a.min.js')).toBe(true);
      expect(isPathIgnored('/a.min.css')).toBe(true);
    });
    (0, _jasmineFix.it)('returns true correctly for windows styled paths', function () {
      expect(isPathIgnored('a.min.js')).toBe(true);
      expect(isPathIgnored('a.min.css')).toBe(true);
      expect(isPathIgnored('\\a.min.js')).toBe(true);
      expect(isPathIgnored('\\a.min.css')).toBe(true);
    });
    (0, _jasmineFix.it)('returns true if the path is ignored by VCS', _asyncToGenerator(function* () {
      try {
        yield atom.workspace.open(__filename);
        expect(isPathIgnored((0, _common.getFixturesPath)('ignored.txt'), null, true)).toBe(true);
      } finally {
        atom.workspace.destroyActivePane();
      }
    }));
    (0, _jasmineFix.it)('returns false if the path is not ignored by VCS', _asyncToGenerator(function* () {
      try {
        yield atom.workspace.open(__filename);
        expect(isPathIgnored((0, _common.getFixturesPath)('file.txt'), null, true)).toBe(false);
      } finally {
        atom.workspace.destroyActivePane();
      }
    }));
  });
  describe('subscriptiveObserve', function () {
    (0, _jasmineFix.it)('activates synchronously', function () {
      var activated = false;
      Helpers.subscriptiveObserve({
        observe: function observe(eventName, callback) {
          activated = true;
          expect(eventName).toBe('someEvent');
          expect(typeof callback).toBe('function');
        }
      }, 'someEvent', function () {});
      expect(activated).toBe(true);
    });
    (0, _jasmineFix.it)('clears last subscription when value changes', function () {
      var disposed = 0;
      var activated = false;
      Helpers.subscriptiveObserve({
        observe: function observe(eventName, callback) {
          activated = true;
          expect(disposed).toBe(0);
          callback();
          expect(disposed).toBe(0);
          callback();
          expect(disposed).toBe(1);
          callback();
          expect(disposed).toBe(2);
        }
      }, 'someEvent', function () {
        return new _atom.Disposable(function () {
          disposed++;
        });
      });
      expect(activated).toBe(true);
    });
    (0, _jasmineFix.it)('clears both subscriptions at the end', function () {
      var disposed = 0;
      var observeDisposed = 0;
      var activated = false;
      var subscription = Helpers.subscriptiveObserve({
        observe: function observe(eventName, callback) {
          activated = true;
          expect(disposed).toBe(0);
          callback();
          expect(disposed).toBe(0);
          return new _atom.Disposable(function () {
            observeDisposed++;
          });
        }
      }, 'someEvent', function () {
        return new _atom.Disposable(function () {
          disposed++;
        });
      });
      expect(activated).toBe(true);
      subscription.dispose();
      expect(disposed).toBe(1);
      expect(observeDisposed).toBe(1);
    });
  });
  describe('normalizeMessages', function () {
    (0, _jasmineFix.it)('adds a key to the message', function () {
      var message = (0, _common.getMessage)(false);
      expect(typeof message.key).toBe('undefined');
      Helpers.normalizeMessages('Some Linter', [message]);
      expect(typeof message.key).toBe('string');
    });
    (0, _jasmineFix.it)('adds a version to the message', function () {
      var message = (0, _common.getMessage)(false);
      expect(typeof message.version).toBe('undefined');
      Helpers.normalizeMessages('Some Linter', [message]);
      expect(typeof message.version).toBe('number');
      expect(message.version).toBe(2);
    });
    (0, _jasmineFix.it)('adds a name to the message', function () {
      var message = (0, _common.getMessage)(false);
      expect(typeof message.linterName).toBe('undefined');
      Helpers.normalizeMessages('Some Linter', [message]);
      expect(typeof message.linterName).toBe('string');
      expect(message.linterName).toBe('Some Linter');
    });
    (0, _jasmineFix.it)('preserves linterName if provided', function () {
      var message = (0, _common.getMessage)(false);
      message.linterName = 'Some Linter 2';
      Helpers.normalizeMessages('Some Linter', [message]);
      expect(typeof message.linterName).toBe('string');
      expect(message.linterName).toBe('Some Linter 2');
    });
    (0, _jasmineFix.it)('converts arrays in location->position to ranges', function () {
      var message = (0, _common.getMessage)(false);
      message.location.position = [[0, 0], [0, 0]];
      expect(Array.isArray(message.location.position)).toBe(true);
      Helpers.normalizeMessages('Some Linter', [message]);
      expect(Array.isArray(message.location.position)).toBe(false);
      expect(message.location.position.constructor.name).toBe('Range');
    });
    (0, _jasmineFix.it)('converts arrays in source->position to points', function () {
      var message = (0, _common.getMessage)(false);
      message.reference = { file: __dirname, position: [0, 0] };
      expect(Array.isArray(message.reference.position)).toBe(true);
      Helpers.normalizeMessages('Some Linter', [message]);
      expect(Array.isArray(message.reference.position)).toBe(false);
      expect(message.reference.position.constructor.name).toBe('Point');
    });
    (0, _jasmineFix.it)('converts arrays in solution[index]->position to ranges', function () {
      var message = (0, _common.getMessage)(false);
      message.solutions = [{ position: [[0, 0], [0, 0]], apply: function apply() {} }];
      expect(Array.isArray(message.solutions[0].position)).toBe(true);
      Helpers.normalizeMessages('Some Linter', [message]);
      expect(Array.isArray(message.solutions[0].position)).toBe(false);
      expect(message.solutions[0].position.constructor.name).toBe('Range');
    });
  });
  describe('normalizeMessagesLegacy', function () {
    (0, _jasmineFix.it)('adds a key to the message', function () {
      var message = (0, _common.getMessageLegacy)(false);
      expect(typeof message.key).toBe('undefined');
      Helpers.normalizeMessagesLegacy('Some Linter', [message]);
      expect(typeof message.key).toBe('string');
    });
    (0, _jasmineFix.it)('adds a version to the message', function () {
      var message = (0, _common.getMessageLegacy)(false);
      expect(typeof message.version).toBe('undefined');
      Helpers.normalizeMessagesLegacy('Some Linter', [message]);
      expect(typeof message.version).toBe('number');
      expect(message.version).toBe(1);
    });
    (0, _jasmineFix.it)('adds a linterName to the message', function () {
      var message = (0, _common.getMessageLegacy)(false);
      expect(typeof message.linterName).toBe('undefined');
      Helpers.normalizeMessagesLegacy('Some Linter', [message]);
      expect(typeof message.linterName).toBe('string');
      expect(message.linterName).toBe('Some Linter');
    });
    describe('adds a severity to the message', function () {
      (0, _jasmineFix.it)('adds info correctly', function () {
        var message = (0, _common.getMessageLegacy)(false);
        message.type = 'Info';
        expect(typeof message.severity).toBe('undefined');
        Helpers.normalizeMessagesLegacy('Some Linter', [message]);
        expect(typeof message.severity).toBe('string');
        expect(message.severity).toBe('info');
      });
      (0, _jasmineFix.it)('adds info and is not case sensitive', function () {
        var message = (0, _common.getMessageLegacy)(false);
        message.type = 'info';
        expect(typeof message.severity).toBe('undefined');
        Helpers.normalizeMessagesLegacy('Some Linter', [message]);
        expect(typeof message.severity).toBe('string');
        expect(message.severity).toBe('info');
      });
      (0, _jasmineFix.it)('adds warning correctly', function () {
        var message = (0, _common.getMessageLegacy)(false);
        message.type = 'Warning';
        expect(typeof message.severity).toBe('undefined');
        Helpers.normalizeMessagesLegacy('Some Linter', [message]);
        expect(typeof message.severity).toBe('string');
        expect(message.severity).toBe('warning');
      });
      (0, _jasmineFix.it)('adds warning and is not case sensitive', function () {
        var message = (0, _common.getMessageLegacy)(false);
        message.type = 'warning';
        expect(typeof message.severity).toBe('undefined');
        Helpers.normalizeMessagesLegacy('Some Linter', [message]);
        expect(typeof message.severity).toBe('string');
        expect(message.severity).toBe('warning');
      });
      (0, _jasmineFix.it)('adds info to traces', function () {
        var message = (0, _common.getMessageLegacy)(false);
        message.type = 'Trace';
        expect(typeof message.severity).toBe('undefined');
        Helpers.normalizeMessagesLegacy('Some Linter', [message]);
        expect(typeof message.severity).toBe('string');
        expect(message.severity).toBe('info');
      });
      (0, _jasmineFix.it)('adds error for anything else', function () {
        {
          var message = (0, _common.getMessageLegacy)(false);
          message.type = 'asdasd';
          expect(typeof message.severity).toBe('undefined');
          Helpers.normalizeMessagesLegacy('Some Linter', [message]);
          expect(typeof message.severity).toBe('string');
          expect(message.severity).toBe('error');
        }
        {
          var message = (0, _common.getMessageLegacy)(false);
          message.type = 'AsdSDasdasd';
          expect(typeof message.severity).toBe('undefined');
          Helpers.normalizeMessagesLegacy('Some Linter', [message]);
          expect(typeof message.severity).toBe('string');
          expect(message.severity).toBe('error');
        }
      });
    });
    (0, _jasmineFix.it)('converts arrays in range to Range', function () {
      var message = (0, _common.getMessageLegacy)(false);
      message.range = [[0, 0], [0, 0]];
      expect(Array.isArray(message.range)).toBe(true);
      Helpers.normalizeMessagesLegacy('Some Linter', [message]);
      expect(Array.isArray(message.range)).toBe(false);
      expect(message.range.constructor.name).toBe('Range');
    });
    (0, _jasmineFix.it)('converts arrays in fix->range to Range', function () {
      var message = (0, _common.getMessageLegacy)(false);
      message.fix = { range: [[0, 0], [0, 0]], newText: 'fair' };
      expect(Array.isArray(message.fix.range)).toBe(true);
      Helpers.normalizeMessagesLegacy('Some Linter', [message]);
      expect(Array.isArray(message.fix.range)).toBe(false);
      expect(message.fix.range.constructor.name).toBe('Range');
    });
    (0, _jasmineFix.it)('processes traces on messages', function () {
      var message = (0, _common.getMessageLegacy)(false);
      message.type = 'asdasd';
      var trace = (0, _common.getMessageLegacy)(false);
      trace.type = 'Trace';
      message.trace = [trace];
      expect(typeof trace.severity).toBe('undefined');
      Helpers.normalizeMessagesLegacy('Some Linter', [message]);
      expect(typeof trace.severity).toBe('string');
      expect(trace.severity).toBe('info');
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci9zcGVjL2hlbHBlcnMtc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O29CQUUyQixNQUFNOzswQkFDZCxhQUFhOzswQkFDUCxnQkFBZ0I7O0lBQTdCLE9BQU87O3NCQUMyQyxVQUFVOztBQUV4RSxRQUFRLENBQUMsU0FBUyxFQUFFLFlBQVc7O0FBRTdCLFVBQVEsQ0FBQyxxQkFBcUIsRUFBRSxZQUFXO0FBQ3pDLGFBQVMsbUJBQW1CLENBQUMsQ0FBTSxFQUFFLENBQU0sRUFBRSxDQUFNLEVBQUU7QUFDbkQsYUFBTyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtLQUM1Qzs7QUFFRCx3QkFBRyw0Q0FBNEMsRUFBRSxZQUFXO0FBQzFELFlBQU0sQ0FBQyxtQkFBbUIsQ0FBQztBQUN6QixpQkFBUyxFQUFFLEtBQUs7QUFDaEIscUJBQWEsRUFBRSxDQUFDLFdBQVcsQ0FBQztPQUM3QixFQUFFLElBQUksRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7S0FDckMsQ0FBQyxDQUFBO0FBQ0Ysd0JBQUcsNkJBQTZCLEVBQUUsWUFBVztBQUMzQyxZQUFNLENBQUMsbUJBQW1CLENBQUM7QUFDekIsaUJBQVMsRUFBRSxJQUFJO0FBQ2YscUJBQWEsRUFBRSxDQUFDLFdBQVcsRUFBRSxlQUFlLENBQUM7T0FDOUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQzFELENBQUMsQ0FBQTtBQUNGLHdCQUFHLHlCQUF5QixFQUFFLFlBQVc7QUFDdkMsWUFBTSxDQUFDLG1CQUFtQixDQUFDO0FBQ3pCLGlCQUFTLEVBQUUsS0FBSztBQUNoQixxQkFBYSxFQUFFLENBQUMsV0FBVyxDQUFDO09BQzdCLEVBQUUsS0FBSyxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNwQyxZQUFNLENBQUMsbUJBQW1CLENBQUM7QUFDekIsaUJBQVMsRUFBRSxJQUFJO0FBQ2YscUJBQWEsRUFBRSxDQUFDLFdBQVcsQ0FBQztPQUM3QixFQUFFLEtBQUssRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7S0FDckMsQ0FBQyxDQUFBO0FBQ0Ysd0JBQUcsa0RBQWtELEVBQUUsWUFBVztBQUNoRSxZQUFNLENBQUMsbUJBQW1CLENBQUM7QUFDekIsaUJBQVMsRUFBRSxJQUFJO0FBQ2YscUJBQWEsRUFBRSxDQUFDLGVBQWUsQ0FBQztPQUNqQyxFQUFFLElBQUksRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDcEMsWUFBTSxDQUFDLG1CQUFtQixDQUFDO0FBQ3pCLGlCQUFTLEVBQUUsSUFBSTtBQUNmLHFCQUFhLEVBQUUsQ0FBQyxlQUFlLEVBQUUsV0FBVyxDQUFDO09BQzlDLEVBQUUsS0FBSyxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUNyQyxZQUFNLENBQUMsbUJBQW1CLENBQUM7QUFDekIsaUJBQVMsRUFBRSxLQUFLO0FBQ2hCLHFCQUFhLEVBQUUsQ0FBQyxlQUFlLEVBQUUsYUFBYSxDQUFDO09BQ2hELEVBQUUsS0FBSyxFQUFFLENBQUMsV0FBVyxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7S0FDckQsQ0FBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBO0FBQ0YsVUFBUSxDQUFDLGVBQWUsRUFBRSxZQUFXO0FBQ25DLGFBQVMsYUFBYSxDQUFDLENBQU0sRUFBRSxDQUFNLEVBQUUsQ0FBTSxFQUFFO0FBQzdDLGFBQU8sT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLG1CQUFtQixFQUFFLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQTtLQUN0RTs7QUFFRCx3QkFBRywyQ0FBMkMsRUFBRSxZQUFXO0FBQ3pELFlBQU0sQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDekMsWUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUMxQyxZQUFNLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQzFDLFlBQU0sQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7S0FDNUMsQ0FBQyxDQUFBO0FBQ0Ysd0JBQUcsa0RBQWtELEVBQUUsWUFBVztBQUNoRSxZQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQ3pDLFlBQU0sQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDMUMsWUFBTSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUMzQyxZQUFNLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0tBQzdDLENBQUMsQ0FBQTtBQUNGLHdCQUFHLG1DQUFtQyxFQUFFLFlBQVc7QUFDakQsWUFBTSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUM1QyxZQUFNLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQzdDLFlBQU0sQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDN0MsWUFBTSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtLQUMvQyxDQUFDLENBQUE7QUFDRix3QkFBRyxpREFBaUQsRUFBRSxZQUFXO0FBQy9ELFlBQU0sQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDNUMsWUFBTSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUM3QyxZQUFNLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQzlDLFlBQU0sQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7S0FDaEQsQ0FBQyxDQUFBO0FBQ0Ysd0JBQUcsNENBQTRDLG9CQUFFLGFBQWlCO0FBQ2hFLFVBQUk7QUFDRixjQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0FBQ3JDLGNBQU0sQ0FBQyxhQUFhLENBQUMsNkJBQWdCLGFBQWEsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtPQUM3RSxTQUFTO0FBQ1IsWUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFBO09BQ25DO0tBQ0YsRUFBQyxDQUFBO0FBQ0Ysd0JBQUcsaURBQWlELG9CQUFFLGFBQWlCO0FBQ3JFLFVBQUk7QUFDRixjQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0FBQ3JDLGNBQU0sQ0FBQyxhQUFhLENBQUMsNkJBQWdCLFVBQVUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtPQUMzRSxTQUFTO0FBQ1IsWUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFBO09BQ25DO0tBQ0YsRUFBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBO0FBQ0YsVUFBUSxDQUFDLHFCQUFxQixFQUFFLFlBQVc7QUFDekMsd0JBQUcseUJBQXlCLEVBQUUsWUFBVztBQUN2QyxVQUFJLFNBQVMsR0FBRyxLQUFLLENBQUE7QUFDckIsYUFBTyxDQUFDLG1CQUFtQixDQUFDO0FBQzFCLGVBQU8sRUFBQSxpQkFBQyxTQUFTLEVBQUUsUUFBUSxFQUFFO0FBQzNCLG1CQUFTLEdBQUcsSUFBSSxDQUFBO0FBQ2hCLGdCQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ25DLGdCQUFNLENBQUMsT0FBTyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7U0FDekM7T0FDRixFQUFFLFdBQVcsRUFBRSxZQUFXLEVBQUcsQ0FBQyxDQUFBO0FBQy9CLFlBQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7S0FDN0IsQ0FBQyxDQUFBO0FBQ0Ysd0JBQUcsNkNBQTZDLEVBQUUsWUFBVztBQUMzRCxVQUFJLFFBQVEsR0FBRyxDQUFDLENBQUE7QUFDaEIsVUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFBO0FBQ3JCLGFBQU8sQ0FBQyxtQkFBbUIsQ0FBQztBQUMxQixlQUFPLEVBQUEsaUJBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRTtBQUMzQixtQkFBUyxHQUFHLElBQUksQ0FBQTtBQUNoQixnQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN4QixrQkFBUSxFQUFFLENBQUE7QUFDVixnQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN4QixrQkFBUSxFQUFFLENBQUE7QUFDVixnQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN4QixrQkFBUSxFQUFFLENBQUE7QUFDVixnQkFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtTQUN6QjtPQUNGLEVBQUUsV0FBVyxFQUFFLFlBQVc7QUFDekIsZUFBTyxxQkFBZSxZQUFXO0FBQy9CLGtCQUFRLEVBQUUsQ0FBQTtTQUNYLENBQUMsQ0FBQTtPQUNILENBQUMsQ0FBQTtBQUNGLFlBQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7S0FDN0IsQ0FBQyxDQUFBO0FBQ0Ysd0JBQUcsc0NBQXNDLEVBQUUsWUFBVztBQUNwRCxVQUFJLFFBQVEsR0FBRyxDQUFDLENBQUE7QUFDaEIsVUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFBO0FBQ3ZCLFVBQUksU0FBUyxHQUFHLEtBQUssQ0FBQTtBQUNyQixVQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUM7QUFDL0MsZUFBTyxFQUFBLGlCQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUU7QUFDM0IsbUJBQVMsR0FBRyxJQUFJLENBQUE7QUFDaEIsZ0JBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDeEIsa0JBQVEsRUFBRSxDQUFBO0FBQ1YsZ0JBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDeEIsaUJBQU8scUJBQWUsWUFBVztBQUMvQiwyQkFBZSxFQUFFLENBQUE7V0FDbEIsQ0FBQyxDQUFBO1NBQ0g7T0FDRixFQUFFLFdBQVcsRUFBRSxZQUFXO0FBQ3pCLGVBQU8scUJBQWUsWUFBVztBQUMvQixrQkFBUSxFQUFFLENBQUE7U0FDWCxDQUFDLENBQUE7T0FDSCxDQUFDLENBQUE7QUFDRixZQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQzVCLGtCQUFZLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDdEIsWUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN4QixZQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ2hDLENBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTtBQUNGLFVBQVEsQ0FBQyxtQkFBbUIsRUFBRSxZQUFXO0FBQ3ZDLHdCQUFHLDJCQUEyQixFQUFFLFlBQVc7QUFDekMsVUFBTSxPQUFPLEdBQUcsd0JBQVcsS0FBSyxDQUFDLENBQUE7QUFDakMsWUFBTSxDQUFDLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtBQUM1QyxhQUFPLENBQUMsaUJBQWlCLENBQUMsYUFBYSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtBQUNuRCxZQUFNLENBQUMsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0tBQzFDLENBQUMsQ0FBQTtBQUNGLHdCQUFHLCtCQUErQixFQUFFLFlBQVc7QUFDN0MsVUFBTSxPQUFPLEdBQUcsd0JBQVcsS0FBSyxDQUFDLENBQUE7QUFDakMsWUFBTSxDQUFDLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtBQUNoRCxhQUFPLENBQUMsaUJBQWlCLENBQUMsYUFBYSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtBQUNuRCxZQUFNLENBQUMsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzdDLFlBQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ2hDLENBQUMsQ0FBQTtBQUNGLHdCQUFHLDRCQUE0QixFQUFFLFlBQVc7QUFDMUMsVUFBTSxPQUFPLEdBQUcsd0JBQVcsS0FBSyxDQUFDLENBQUE7QUFDakMsWUFBTSxDQUFDLE9BQU8sT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtBQUNuRCxhQUFPLENBQUMsaUJBQWlCLENBQUMsYUFBYSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtBQUNuRCxZQUFNLENBQUMsT0FBTyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQ2hELFlBQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBO0tBQy9DLENBQUMsQ0FBQTtBQUNGLHdCQUFHLGtDQUFrQyxFQUFFLFlBQVc7QUFDaEQsVUFBTSxPQUFPLEdBQUcsd0JBQVcsS0FBSyxDQUFDLENBQUE7QUFDakMsYUFBTyxDQUFDLFVBQVUsR0FBRyxlQUFlLENBQUE7QUFDcEMsYUFBTyxDQUFDLGlCQUFpQixDQUFDLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7QUFDbkQsWUFBTSxDQUFDLE9BQU8sT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUNoRCxZQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQTtLQUNqRCxDQUFDLENBQUE7QUFDRix3QkFBRyxpREFBaUQsRUFBRSxZQUFXO0FBQy9ELFVBQU0sT0FBTyxHQUFHLHdCQUFXLEtBQUssQ0FBQyxDQUFBO0FBQ2pDLGFBQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUM1QyxZQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQzNELGFBQU8sQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO0FBQ25ELFlBQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDNUQsWUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7S0FDakUsQ0FBQyxDQUFBO0FBQ0Ysd0JBQUcsK0NBQStDLEVBQUUsWUFBVztBQUM3RCxVQUFNLE9BQU8sR0FBRyx3QkFBVyxLQUFLLENBQUMsQ0FBQTtBQUNqQyxhQUFPLENBQUMsU0FBUyxHQUFHLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtBQUN6RCxZQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQzVELGFBQU8sQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO0FBQ25ELFlBQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDN0QsWUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7S0FDbEUsQ0FBQyxDQUFBO0FBQ0Ysd0JBQUcsd0RBQXdELEVBQUUsWUFBVztBQUN0RSxVQUFNLE9BQU8sR0FBRyx3QkFBVyxLQUFLLENBQUMsQ0FBQTtBQUNqQyxhQUFPLENBQUMsU0FBUyxHQUFHLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBQSxpQkFBRyxFQUFHLEVBQUUsQ0FBQyxDQUFBO0FBQ2pFLFlBQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDL0QsYUFBTyxDQUFDLGlCQUFpQixDQUFDLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7QUFDbkQsWUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUNoRSxZQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtLQUNyRSxDQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7QUFDRixVQUFRLENBQUMseUJBQXlCLEVBQUUsWUFBVztBQUM3Qyx3QkFBRywyQkFBMkIsRUFBRSxZQUFXO0FBQ3pDLFVBQU0sT0FBTyxHQUFHLDhCQUFpQixLQUFLLENBQUMsQ0FBQTtBQUN2QyxZQUFNLENBQUMsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQzVDLGFBQU8sQ0FBQyx1QkFBdUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO0FBQ3pELFlBQU0sQ0FBQyxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7S0FDMUMsQ0FBQyxDQUFBO0FBQ0Ysd0JBQUcsK0JBQStCLEVBQUUsWUFBVztBQUM3QyxVQUFNLE9BQU8sR0FBRyw4QkFBaUIsS0FBSyxDQUFDLENBQUE7QUFDdkMsWUFBTSxDQUFDLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtBQUNoRCxhQUFPLENBQUMsdUJBQXVCLENBQUMsYUFBYSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtBQUN6RCxZQUFNLENBQUMsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzdDLFlBQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ2hDLENBQUMsQ0FBQTtBQUNGLHdCQUFHLGtDQUFrQyxFQUFFLFlBQVc7QUFDaEQsVUFBTSxPQUFPLEdBQUcsOEJBQWlCLEtBQUssQ0FBQyxDQUFBO0FBQ3ZDLFlBQU0sQ0FBQyxPQUFPLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDbkQsYUFBTyxDQUFDLHVCQUF1QixDQUFDLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7QUFDekQsWUFBTSxDQUFDLE9BQU8sT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUNoRCxZQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQTtLQUMvQyxDQUFDLENBQUE7QUFDRixZQUFRLENBQUMsZ0NBQWdDLEVBQUUsWUFBVztBQUNwRCwwQkFBRyxxQkFBcUIsRUFBRSxZQUFXO0FBQ25DLFlBQU0sT0FBTyxHQUFHLDhCQUFpQixLQUFLLENBQUMsQ0FBQTtBQUN2QyxlQUFPLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQTtBQUNyQixjQUFNLENBQUMsT0FBTyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ2pELGVBQU8sQ0FBQyx1QkFBdUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO0FBQ3pELGNBQU0sQ0FBQyxPQUFPLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDOUMsY0FBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7T0FDdEMsQ0FBQyxDQUFBO0FBQ0YsMEJBQUcscUNBQXFDLEVBQUUsWUFBVztBQUNuRCxZQUFNLE9BQU8sR0FBRyw4QkFBaUIsS0FBSyxDQUFDLENBQUE7QUFDdkMsZUFBTyxDQUFDLElBQUksR0FBRyxNQUFNLENBQUE7QUFDckIsY0FBTSxDQUFDLE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtBQUNqRCxlQUFPLENBQUMsdUJBQXVCLENBQUMsYUFBYSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtBQUN6RCxjQUFNLENBQUMsT0FBTyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzlDLGNBQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO09BQ3RDLENBQUMsQ0FBQTtBQUNGLDBCQUFHLHdCQUF3QixFQUFFLFlBQVc7QUFDdEMsWUFBTSxPQUFPLEdBQUcsOEJBQWlCLEtBQUssQ0FBQyxDQUFBO0FBQ3ZDLGVBQU8sQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFBO0FBQ3hCLGNBQU0sQ0FBQyxPQUFPLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDakQsZUFBTyxDQUFDLHVCQUF1QixDQUFDLGFBQWEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUE7QUFDekQsY0FBTSxDQUFDLE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUM5QyxjQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtPQUN6QyxDQUFDLENBQUE7QUFDRiwwQkFBRyx3Q0FBd0MsRUFBRSxZQUFXO0FBQ3RELFlBQU0sT0FBTyxHQUFHLDhCQUFpQixLQUFLLENBQUMsQ0FBQTtBQUN2QyxlQUFPLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQTtBQUN4QixjQUFNLENBQUMsT0FBTyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ2pELGVBQU8sQ0FBQyx1QkFBdUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO0FBQ3pELGNBQU0sQ0FBQyxPQUFPLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDOUMsY0FBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7T0FDekMsQ0FBQyxDQUFBO0FBQ0YsMEJBQUcscUJBQXFCLEVBQUUsWUFBVztBQUNuQyxZQUFNLE9BQU8sR0FBRyw4QkFBaUIsS0FBSyxDQUFDLENBQUE7QUFDdkMsZUFBTyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUE7QUFDdEIsY0FBTSxDQUFDLE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtBQUNqRCxlQUFPLENBQUMsdUJBQXVCLENBQUMsYUFBYSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtBQUN6RCxjQUFNLENBQUMsT0FBTyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzlDLGNBQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO09BQ3RDLENBQUMsQ0FBQTtBQUNGLDBCQUFHLDhCQUE4QixFQUFFLFlBQVc7QUFDNUM7QUFDRSxjQUFNLE9BQU8sR0FBRyw4QkFBaUIsS0FBSyxDQUFDLENBQUE7QUFDdkMsaUJBQU8sQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFBO0FBQ3ZCLGdCQUFNLENBQUMsT0FBTyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ2pELGlCQUFPLENBQUMsdUJBQXVCLENBQUMsYUFBYSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtBQUN6RCxnQkFBTSxDQUFDLE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUM5QyxnQkFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7U0FDdkM7QUFDRDtBQUNFLGNBQU0sT0FBTyxHQUFHLDhCQUFpQixLQUFLLENBQUMsQ0FBQTtBQUN2QyxpQkFBTyxDQUFDLElBQUksR0FBRyxhQUFhLENBQUE7QUFDNUIsZ0JBQU0sQ0FBQyxPQUFPLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7QUFDakQsaUJBQU8sQ0FBQyx1QkFBdUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO0FBQ3pELGdCQUFNLENBQUMsT0FBTyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzlDLGdCQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtTQUN2QztPQUNGLENBQUMsQ0FBQTtLQUNILENBQUMsQ0FBQTtBQUNGLHdCQUFHLG1DQUFtQyxFQUFFLFlBQVc7QUFDakQsVUFBTSxPQUFPLEdBQUcsOEJBQWlCLEtBQUssQ0FBQyxDQUFBO0FBQ3ZDLGFBQU8sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2hDLFlBQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUMvQyxhQUFPLENBQUMsdUJBQXVCLENBQUMsYUFBYSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtBQUN6RCxZQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDaEQsWUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtLQUNyRCxDQUFDLENBQUE7QUFDRix3QkFBRyx3Q0FBd0MsRUFBRSxZQUFXO0FBQ3RELFVBQU0sT0FBTyxHQUFHLDhCQUFpQixLQUFLLENBQUMsQ0FBQTtBQUN2QyxhQUFPLENBQUMsR0FBRyxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUE7QUFDMUQsWUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNuRCxhQUFPLENBQUMsdUJBQXVCLENBQUMsYUFBYSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtBQUN6RCxZQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQ3BELFlBQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0tBQ3pELENBQUMsQ0FBQTtBQUNGLHdCQUFHLDhCQUE4QixFQUFFLFlBQVc7QUFDNUMsVUFBTSxPQUFPLEdBQUcsOEJBQWlCLEtBQUssQ0FBQyxDQUFBO0FBQ3ZDLGFBQU8sQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFBO0FBQ3ZCLFVBQU0sS0FBSyxHQUFHLDhCQUFpQixLQUFLLENBQUMsQ0FBQTtBQUNyQyxXQUFLLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQTtBQUNwQixhQUFPLENBQUMsS0FBSyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDdkIsWUFBTSxDQUFDLE9BQU8sS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtBQUMvQyxhQUFPLENBQUMsdUJBQXVCLENBQUMsYUFBYSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtBQUN6RCxZQUFNLENBQUMsT0FBTyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzVDLFlBQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0tBQ3BDLENBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTtDQUNILENBQUMsQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS8uYXRvbS9wYWNrYWdlcy9saW50ZXIvc3BlYy9oZWxwZXJzLXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB7IGl0IH0gZnJvbSAnamFzbWluZS1maXgnXG5pbXBvcnQgKiBhcyBIZWxwZXJzIGZyb20gJy4uL2xpYi9oZWxwZXJzJ1xuaW1wb3J0IHsgZ2V0Rml4dHVyZXNQYXRoLCBnZXRNZXNzYWdlLCBnZXRNZXNzYWdlTGVnYWN5IH0gZnJvbSAnLi9jb21tb24nXG5cbmRlc2NyaWJlKCdIZWxwZXJzJywgZnVuY3Rpb24oKSB7XG4gIC8vIE5PVEU6IERpZCAqbm90KiBhZGQgc3BlY3MgZm9yIG1lc3NhZ2VLZXkgYW5kIG1lc3NhZ2VLZXlMZWdhY3kgb24gcHVycG9zZVxuICBkZXNjcmliZSgnc2hvdWxkVHJpZ2dlckxpbnRlcicsIGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIHNob3VsZFRyaWdnZXJMaW50ZXIoYTogYW55LCBiOiBhbnksIGM6IGFueSkge1xuICAgICAgcmV0dXJuIEhlbHBlcnMuc2hvdWxkVHJpZ2dlckxpbnRlcihhLCBiLCBjKVxuICAgIH1cblxuICAgIGl0KCd3b3JrcyBkb2VzIG5vdCB0cmlnZ2VyIG5vbi1mbHkgb25lcyBvbiBmbHknLCBmdW5jdGlvbigpIHtcbiAgICAgIGV4cGVjdChzaG91bGRUcmlnZ2VyTGludGVyKHtcbiAgICAgICAgbGludE9uRmx5OiBmYWxzZSxcbiAgICAgICAgZ3JhbW1hclNjb3BlczogWydzb3VyY2UuanMnXSxcbiAgICAgIH0sIHRydWUsIFsnc291cmNlLmpzJ10pKS50b0JlKGZhbHNlKVxuICAgIH0pXG4gICAgaXQoJ3RyaWdnZXJzIG9uIGZseSBvbmVzIG9uIGZseScsIGZ1bmN0aW9uKCkge1xuICAgICAgZXhwZWN0KHNob3VsZFRyaWdnZXJMaW50ZXIoe1xuICAgICAgICBsaW50T25GbHk6IHRydWUsXG4gICAgICAgIGdyYW1tYXJTY29wZXM6IFsnc291cmNlLmpzJywgJ3NvdXJjZS5jb2ZmZWUnXSxcbiAgICAgIH0sIHRydWUsIFsnc291cmNlLmpzJywgJ3NvdXJjZS5qcy5lbWViZGRlZCddKSkudG9CZSh0cnVlKVxuICAgIH0pXG4gICAgaXQoJ3RyaWdnZXJzIGFsbCBvbiBub24tZmx5JywgZnVuY3Rpb24oKSB7XG4gICAgICBleHBlY3Qoc2hvdWxkVHJpZ2dlckxpbnRlcih7XG4gICAgICAgIGxpbnRPbkZseTogZmFsc2UsXG4gICAgICAgIGdyYW1tYXJTY29wZXM6IFsnc291cmNlLmpzJ10sXG4gICAgICB9LCBmYWxzZSwgWydzb3VyY2UuanMnXSkpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdChzaG91bGRUcmlnZ2VyTGludGVyKHtcbiAgICAgICAgbGludE9uRmx5OiB0cnVlLFxuICAgICAgICBncmFtbWFyU2NvcGVzOiBbJ3NvdXJjZS5qcyddLFxuICAgICAgfSwgZmFsc2UsIFsnc291cmNlLmpzJ10pKS50b0JlKHRydWUpXG4gICAgfSlcbiAgICBpdCgnZG9lcyBub3QgdHJpZ2dlciBpZiBncmFtbWFyU2NvcGVzIGRvZXMgbm90IG1hdGNoJywgZnVuY3Rpb24oKSB7XG4gICAgICBleHBlY3Qoc2hvdWxkVHJpZ2dlckxpbnRlcih7XG4gICAgICAgIGxpbnRPbkZseTogdHJ1ZSxcbiAgICAgICAgZ3JhbW1hclNjb3BlczogWydzb3VyY2UuY29mZmVlJ10sXG4gICAgICB9LCB0cnVlLCBbJ3NvdXJjZS5qcyddKSkudG9CZShmYWxzZSlcbiAgICAgIGV4cGVjdChzaG91bGRUcmlnZ2VyTGludGVyKHtcbiAgICAgICAgbGludE9uRmx5OiB0cnVlLFxuICAgICAgICBncmFtbWFyU2NvcGVzOiBbJ3NvdXJjZS5jb2ZmZWUnLCAnc291cmNlLmdvJ10sXG4gICAgICB9LCBmYWxzZSwgWydzb3VyY2UuanMnXSkpLnRvQmUoZmFsc2UpXG4gICAgICBleHBlY3Qoc2hvdWxkVHJpZ2dlckxpbnRlcih7XG4gICAgICAgIGxpbnRPbkZseTogZmFsc2UsXG4gICAgICAgIGdyYW1tYXJTY29wZXM6IFsnc291cmNlLmNvZmZlZScsICdzb3VyY2UucnVzdCddLFxuICAgICAgfSwgZmFsc2UsIFsnc291cmNlLmpzJywgJ3NvdXJjZS5oZWxsJ10pKS50b0JlKGZhbHNlKVxuICAgIH0pXG4gIH0pXG4gIGRlc2NyaWJlKCdpc1BhdGhJZ25vcmVkJywgZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gaXNQYXRoSWdub3JlZChhOiBhbnksIGI6IGFueSwgYzogYW55KSB7XG4gICAgICByZXR1cm4gSGVscGVycy5pc1BhdGhJZ25vcmVkKGEsIGIgfHwgJyoqLyoubWluLntqcyxjc3N9JywgYyB8fCBmYWxzZSlcbiAgICB9XG5cbiAgICBpdCgncmV0dXJucyBmYWxzZSBpZiBwYXRoIGRvZXMgbm90IG1hdGNoIGdsb2InLCBmdW5jdGlvbigpIHtcbiAgICAgIGV4cGVjdChpc1BhdGhJZ25vcmVkKCdhLmpzJykpLnRvQmUoZmFsc2UpXG4gICAgICBleHBlY3QoaXNQYXRoSWdub3JlZCgnYS5jc3MnKSkudG9CZShmYWxzZSlcbiAgICAgIGV4cGVjdChpc1BhdGhJZ25vcmVkKCcvYS5qcycpKS50b0JlKGZhbHNlKVxuICAgICAgZXhwZWN0KGlzUGF0aElnbm9yZWQoJy9hLmNzcycpKS50b0JlKGZhbHNlKVxuICAgIH0pXG4gICAgaXQoJ3JldHVybnMgZmFsc2UgY29ycmVjdGx5IGZvciB3aW5kb3dzIHN0eWxlZCBwYXRocycsIGZ1bmN0aW9uKCkge1xuICAgICAgZXhwZWN0KGlzUGF0aElnbm9yZWQoJ2EuanMnKSkudG9CZShmYWxzZSlcbiAgICAgIGV4cGVjdChpc1BhdGhJZ25vcmVkKCdhLmNzcycpKS50b0JlKGZhbHNlKVxuICAgICAgZXhwZWN0KGlzUGF0aElnbm9yZWQoJ1xcXFxhLmpzJykpLnRvQmUoZmFsc2UpXG4gICAgICBleHBlY3QoaXNQYXRoSWdub3JlZCgnXFxcXGEuY3NzJykpLnRvQmUoZmFsc2UpXG4gICAgfSlcbiAgICBpdCgncmV0dXJucyB0cnVlIGlmIHBhdGggbWF0Y2hlcyBnbG9iJywgZnVuY3Rpb24oKSB7XG4gICAgICBleHBlY3QoaXNQYXRoSWdub3JlZCgnYS5taW4uanMnKSkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KGlzUGF0aElnbm9yZWQoJ2EubWluLmNzcycpKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QoaXNQYXRoSWdub3JlZCgnL2EubWluLmpzJykpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdChpc1BhdGhJZ25vcmVkKCcvYS5taW4uY3NzJykpLnRvQmUodHJ1ZSlcbiAgICB9KVxuICAgIGl0KCdyZXR1cm5zIHRydWUgY29ycmVjdGx5IGZvciB3aW5kb3dzIHN0eWxlZCBwYXRocycsIGZ1bmN0aW9uKCkge1xuICAgICAgZXhwZWN0KGlzUGF0aElnbm9yZWQoJ2EubWluLmpzJykpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdChpc1BhdGhJZ25vcmVkKCdhLm1pbi5jc3MnKSkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KGlzUGF0aElnbm9yZWQoJ1xcXFxhLm1pbi5qcycpKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QoaXNQYXRoSWdub3JlZCgnXFxcXGEubWluLmNzcycpKS50b0JlKHRydWUpXG4gICAgfSlcbiAgICBpdCgncmV0dXJucyB0cnVlIGlmIHRoZSBwYXRoIGlzIGlnbm9yZWQgYnkgVkNTJywgYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKF9fZmlsZW5hbWUpXG4gICAgICAgIGV4cGVjdChpc1BhdGhJZ25vcmVkKGdldEZpeHR1cmVzUGF0aCgnaWdub3JlZC50eHQnKSwgbnVsbCwgdHJ1ZSkpLnRvQmUodHJ1ZSlcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGF0b20ud29ya3NwYWNlLmRlc3Ryb3lBY3RpdmVQYW5lKClcbiAgICAgIH1cbiAgICB9KVxuICAgIGl0KCdyZXR1cm5zIGZhbHNlIGlmIHRoZSBwYXRoIGlzIG5vdCBpZ25vcmVkIGJ5IFZDUycsIGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihfX2ZpbGVuYW1lKVxuICAgICAgICBleHBlY3QoaXNQYXRoSWdub3JlZChnZXRGaXh0dXJlc1BhdGgoJ2ZpbGUudHh0JyksIG51bGwsIHRydWUpKS50b0JlKGZhbHNlKVxuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgYXRvbS53b3Jrc3BhY2UuZGVzdHJveUFjdGl2ZVBhbmUoKVxuICAgICAgfVxuICAgIH0pXG4gIH0pXG4gIGRlc2NyaWJlKCdzdWJzY3JpcHRpdmVPYnNlcnZlJywgZnVuY3Rpb24oKSB7XG4gICAgaXQoJ2FjdGl2YXRlcyBzeW5jaHJvbm91c2x5JywgZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgYWN0aXZhdGVkID0gZmFsc2VcbiAgICAgIEhlbHBlcnMuc3Vic2NyaXB0aXZlT2JzZXJ2ZSh7XG4gICAgICAgIG9ic2VydmUoZXZlbnROYW1lLCBjYWxsYmFjaykge1xuICAgICAgICAgIGFjdGl2YXRlZCA9IHRydWVcbiAgICAgICAgICBleHBlY3QoZXZlbnROYW1lKS50b0JlKCdzb21lRXZlbnQnKVxuICAgICAgICAgIGV4cGVjdCh0eXBlb2YgY2FsbGJhY2spLnRvQmUoJ2Z1bmN0aW9uJylcbiAgICAgICAgfSxcbiAgICAgIH0sICdzb21lRXZlbnQnLCBmdW5jdGlvbigpIHsgfSlcbiAgICAgIGV4cGVjdChhY3RpdmF0ZWQpLnRvQmUodHJ1ZSlcbiAgICB9KVxuICAgIGl0KCdjbGVhcnMgbGFzdCBzdWJzY3JpcHRpb24gd2hlbiB2YWx1ZSBjaGFuZ2VzJywgZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgZGlzcG9zZWQgPSAwXG4gICAgICBsZXQgYWN0aXZhdGVkID0gZmFsc2VcbiAgICAgIEhlbHBlcnMuc3Vic2NyaXB0aXZlT2JzZXJ2ZSh7XG4gICAgICAgIG9ic2VydmUoZXZlbnROYW1lLCBjYWxsYmFjaykge1xuICAgICAgICAgIGFjdGl2YXRlZCA9IHRydWVcbiAgICAgICAgICBleHBlY3QoZGlzcG9zZWQpLnRvQmUoMClcbiAgICAgICAgICBjYWxsYmFjaygpXG4gICAgICAgICAgZXhwZWN0KGRpc3Bvc2VkKS50b0JlKDApXG4gICAgICAgICAgY2FsbGJhY2soKVxuICAgICAgICAgIGV4cGVjdChkaXNwb3NlZCkudG9CZSgxKVxuICAgICAgICAgIGNhbGxiYWNrKClcbiAgICAgICAgICBleHBlY3QoZGlzcG9zZWQpLnRvQmUoMilcbiAgICAgICAgfSxcbiAgICAgIH0sICdzb21lRXZlbnQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGRpc3Bvc2VkKytcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgICBleHBlY3QoYWN0aXZhdGVkKS50b0JlKHRydWUpXG4gICAgfSlcbiAgICBpdCgnY2xlYXJzIGJvdGggc3Vic2NyaXB0aW9ucyBhdCB0aGUgZW5kJywgZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgZGlzcG9zZWQgPSAwXG4gICAgICBsZXQgb2JzZXJ2ZURpc3Bvc2VkID0gMFxuICAgICAgbGV0IGFjdGl2YXRlZCA9IGZhbHNlXG4gICAgICBjb25zdCBzdWJzY3JpcHRpb24gPSBIZWxwZXJzLnN1YnNjcmlwdGl2ZU9ic2VydmUoe1xuICAgICAgICBvYnNlcnZlKGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcbiAgICAgICAgICBhY3RpdmF0ZWQgPSB0cnVlXG4gICAgICAgICAgZXhwZWN0KGRpc3Bvc2VkKS50b0JlKDApXG4gICAgICAgICAgY2FsbGJhY2soKVxuICAgICAgICAgIGV4cGVjdChkaXNwb3NlZCkudG9CZSgwKVxuICAgICAgICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIG9ic2VydmVEaXNwb3NlZCsrXG4gICAgICAgICAgfSlcbiAgICAgICAgfSxcbiAgICAgIH0sICdzb21lRXZlbnQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGRpc3Bvc2VkKytcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgICBleHBlY3QoYWN0aXZhdGVkKS50b0JlKHRydWUpXG4gICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgICBleHBlY3QoZGlzcG9zZWQpLnRvQmUoMSlcbiAgICAgIGV4cGVjdChvYnNlcnZlRGlzcG9zZWQpLnRvQmUoMSlcbiAgICB9KVxuICB9KVxuICBkZXNjcmliZSgnbm9ybWFsaXplTWVzc2FnZXMnLCBmdW5jdGlvbigpIHtcbiAgICBpdCgnYWRkcyBhIGtleSB0byB0aGUgbWVzc2FnZScsIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGdldE1lc3NhZ2UoZmFsc2UpXG4gICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2Uua2V5KS50b0JlKCd1bmRlZmluZWQnKVxuICAgICAgSGVscGVycy5ub3JtYWxpemVNZXNzYWdlcygnU29tZSBMaW50ZXInLCBbbWVzc2FnZV0pXG4gICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2Uua2V5KS50b0JlKCdzdHJpbmcnKVxuICAgIH0pXG4gICAgaXQoJ2FkZHMgYSB2ZXJzaW9uIHRvIHRoZSBtZXNzYWdlJywgZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZ2V0TWVzc2FnZShmYWxzZSlcbiAgICAgIGV4cGVjdCh0eXBlb2YgbWVzc2FnZS52ZXJzaW9uKS50b0JlKCd1bmRlZmluZWQnKVxuICAgICAgSGVscGVycy5ub3JtYWxpemVNZXNzYWdlcygnU29tZSBMaW50ZXInLCBbbWVzc2FnZV0pXG4gICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2UudmVyc2lvbikudG9CZSgnbnVtYmVyJylcbiAgICAgIGV4cGVjdChtZXNzYWdlLnZlcnNpb24pLnRvQmUoMilcbiAgICB9KVxuICAgIGl0KCdhZGRzIGEgbmFtZSB0byB0aGUgbWVzc2FnZScsIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGdldE1lc3NhZ2UoZmFsc2UpXG4gICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2UubGludGVyTmFtZSkudG9CZSgndW5kZWZpbmVkJylcbiAgICAgIEhlbHBlcnMubm9ybWFsaXplTWVzc2FnZXMoJ1NvbWUgTGludGVyJywgW21lc3NhZ2VdKVxuICAgICAgZXhwZWN0KHR5cGVvZiBtZXNzYWdlLmxpbnRlck5hbWUpLnRvQmUoJ3N0cmluZycpXG4gICAgICBleHBlY3QobWVzc2FnZS5saW50ZXJOYW1lKS50b0JlKCdTb21lIExpbnRlcicpXG4gICAgfSlcbiAgICBpdCgncHJlc2VydmVzIGxpbnRlck5hbWUgaWYgcHJvdmlkZWQnLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBnZXRNZXNzYWdlKGZhbHNlKVxuICAgICAgbWVzc2FnZS5saW50ZXJOYW1lID0gJ1NvbWUgTGludGVyIDInXG4gICAgICBIZWxwZXJzLm5vcm1hbGl6ZU1lc3NhZ2VzKCdTb21lIExpbnRlcicsIFttZXNzYWdlXSlcbiAgICAgIGV4cGVjdCh0eXBlb2YgbWVzc2FnZS5saW50ZXJOYW1lKS50b0JlKCdzdHJpbmcnKVxuICAgICAgZXhwZWN0KG1lc3NhZ2UubGludGVyTmFtZSkudG9CZSgnU29tZSBMaW50ZXIgMicpXG4gICAgfSlcbiAgICBpdCgnY29udmVydHMgYXJyYXlzIGluIGxvY2F0aW9uLT5wb3NpdGlvbiB0byByYW5nZXMnLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBnZXRNZXNzYWdlKGZhbHNlKVxuICAgICAgbWVzc2FnZS5sb2NhdGlvbi5wb3NpdGlvbiA9IFtbMCwgMF0sIFswLCAwXV1cbiAgICAgIGV4cGVjdChBcnJheS5pc0FycmF5KG1lc3NhZ2UubG9jYXRpb24ucG9zaXRpb24pKS50b0JlKHRydWUpXG4gICAgICBIZWxwZXJzLm5vcm1hbGl6ZU1lc3NhZ2VzKCdTb21lIExpbnRlcicsIFttZXNzYWdlXSlcbiAgICAgIGV4cGVjdChBcnJheS5pc0FycmF5KG1lc3NhZ2UubG9jYXRpb24ucG9zaXRpb24pKS50b0JlKGZhbHNlKVxuICAgICAgZXhwZWN0KG1lc3NhZ2UubG9jYXRpb24ucG9zaXRpb24uY29uc3RydWN0b3IubmFtZSkudG9CZSgnUmFuZ2UnKVxuICAgIH0pXG4gICAgaXQoJ2NvbnZlcnRzIGFycmF5cyBpbiBzb3VyY2UtPnBvc2l0aW9uIHRvIHBvaW50cycsIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGdldE1lc3NhZ2UoZmFsc2UpXG4gICAgICBtZXNzYWdlLnJlZmVyZW5jZSA9IHsgZmlsZTogX19kaXJuYW1lLCBwb3NpdGlvbjogWzAsIDBdIH1cbiAgICAgIGV4cGVjdChBcnJheS5pc0FycmF5KG1lc3NhZ2UucmVmZXJlbmNlLnBvc2l0aW9uKSkudG9CZSh0cnVlKVxuICAgICAgSGVscGVycy5ub3JtYWxpemVNZXNzYWdlcygnU29tZSBMaW50ZXInLCBbbWVzc2FnZV0pXG4gICAgICBleHBlY3QoQXJyYXkuaXNBcnJheShtZXNzYWdlLnJlZmVyZW5jZS5wb3NpdGlvbikpLnRvQmUoZmFsc2UpXG4gICAgICBleHBlY3QobWVzc2FnZS5yZWZlcmVuY2UucG9zaXRpb24uY29uc3RydWN0b3IubmFtZSkudG9CZSgnUG9pbnQnKVxuICAgIH0pXG4gICAgaXQoJ2NvbnZlcnRzIGFycmF5cyBpbiBzb2x1dGlvbltpbmRleF0tPnBvc2l0aW9uIHRvIHJhbmdlcycsIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGdldE1lc3NhZ2UoZmFsc2UpXG4gICAgICBtZXNzYWdlLnNvbHV0aW9ucyA9IFt7IHBvc2l0aW9uOiBbWzAsIDBdLCBbMCwgMF1dLCBhcHBseSgpIHsgfSB9XVxuICAgICAgZXhwZWN0KEFycmF5LmlzQXJyYXkobWVzc2FnZS5zb2x1dGlvbnNbMF0ucG9zaXRpb24pKS50b0JlKHRydWUpXG4gICAgICBIZWxwZXJzLm5vcm1hbGl6ZU1lc3NhZ2VzKCdTb21lIExpbnRlcicsIFttZXNzYWdlXSlcbiAgICAgIGV4cGVjdChBcnJheS5pc0FycmF5KG1lc3NhZ2Uuc29sdXRpb25zWzBdLnBvc2l0aW9uKSkudG9CZShmYWxzZSlcbiAgICAgIGV4cGVjdChtZXNzYWdlLnNvbHV0aW9uc1swXS5wb3NpdGlvbi5jb25zdHJ1Y3Rvci5uYW1lKS50b0JlKCdSYW5nZScpXG4gICAgfSlcbiAgfSlcbiAgZGVzY3JpYmUoJ25vcm1hbGl6ZU1lc3NhZ2VzTGVnYWN5JywgZnVuY3Rpb24oKSB7XG4gICAgaXQoJ2FkZHMgYSBrZXkgdG8gdGhlIG1lc3NhZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBnZXRNZXNzYWdlTGVnYWN5KGZhbHNlKVxuICAgICAgZXhwZWN0KHR5cGVvZiBtZXNzYWdlLmtleSkudG9CZSgndW5kZWZpbmVkJylcbiAgICAgIEhlbHBlcnMubm9ybWFsaXplTWVzc2FnZXNMZWdhY3koJ1NvbWUgTGludGVyJywgW21lc3NhZ2VdKVxuICAgICAgZXhwZWN0KHR5cGVvZiBtZXNzYWdlLmtleSkudG9CZSgnc3RyaW5nJylcbiAgICB9KVxuICAgIGl0KCdhZGRzIGEgdmVyc2lvbiB0byB0aGUgbWVzc2FnZScsIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGdldE1lc3NhZ2VMZWdhY3koZmFsc2UpXG4gICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2UudmVyc2lvbikudG9CZSgndW5kZWZpbmVkJylcbiAgICAgIEhlbHBlcnMubm9ybWFsaXplTWVzc2FnZXNMZWdhY3koJ1NvbWUgTGludGVyJywgW21lc3NhZ2VdKVxuICAgICAgZXhwZWN0KHR5cGVvZiBtZXNzYWdlLnZlcnNpb24pLnRvQmUoJ251bWJlcicpXG4gICAgICBleHBlY3QobWVzc2FnZS52ZXJzaW9uKS50b0JlKDEpXG4gICAgfSlcbiAgICBpdCgnYWRkcyBhIGxpbnRlck5hbWUgdG8gdGhlIG1lc3NhZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBnZXRNZXNzYWdlTGVnYWN5KGZhbHNlKVxuICAgICAgZXhwZWN0KHR5cGVvZiBtZXNzYWdlLmxpbnRlck5hbWUpLnRvQmUoJ3VuZGVmaW5lZCcpXG4gICAgICBIZWxwZXJzLm5vcm1hbGl6ZU1lc3NhZ2VzTGVnYWN5KCdTb21lIExpbnRlcicsIFttZXNzYWdlXSlcbiAgICAgIGV4cGVjdCh0eXBlb2YgbWVzc2FnZS5saW50ZXJOYW1lKS50b0JlKCdzdHJpbmcnKVxuICAgICAgZXhwZWN0KG1lc3NhZ2UubGludGVyTmFtZSkudG9CZSgnU29tZSBMaW50ZXInKVxuICAgIH0pXG4gICAgZGVzY3JpYmUoJ2FkZHMgYSBzZXZlcml0eSB0byB0aGUgbWVzc2FnZScsIGZ1bmN0aW9uKCkge1xuICAgICAgaXQoJ2FkZHMgaW5mbyBjb3JyZWN0bHknLCBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGdldE1lc3NhZ2VMZWdhY3koZmFsc2UpXG4gICAgICAgIG1lc3NhZ2UudHlwZSA9ICdJbmZvJ1xuICAgICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2Uuc2V2ZXJpdHkpLnRvQmUoJ3VuZGVmaW5lZCcpXG4gICAgICAgIEhlbHBlcnMubm9ybWFsaXplTWVzc2FnZXNMZWdhY3koJ1NvbWUgTGludGVyJywgW21lc3NhZ2VdKVxuICAgICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2Uuc2V2ZXJpdHkpLnRvQmUoJ3N0cmluZycpXG4gICAgICAgIGV4cGVjdChtZXNzYWdlLnNldmVyaXR5KS50b0JlKCdpbmZvJylcbiAgICAgIH0pXG4gICAgICBpdCgnYWRkcyBpbmZvIGFuZCBpcyBub3QgY2FzZSBzZW5zaXRpdmUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGdldE1lc3NhZ2VMZWdhY3koZmFsc2UpXG4gICAgICAgIG1lc3NhZ2UudHlwZSA9ICdpbmZvJ1xuICAgICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2Uuc2V2ZXJpdHkpLnRvQmUoJ3VuZGVmaW5lZCcpXG4gICAgICAgIEhlbHBlcnMubm9ybWFsaXplTWVzc2FnZXNMZWdhY3koJ1NvbWUgTGludGVyJywgW21lc3NhZ2VdKVxuICAgICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2Uuc2V2ZXJpdHkpLnRvQmUoJ3N0cmluZycpXG4gICAgICAgIGV4cGVjdChtZXNzYWdlLnNldmVyaXR5KS50b0JlKCdpbmZvJylcbiAgICAgIH0pXG4gICAgICBpdCgnYWRkcyB3YXJuaW5nIGNvcnJlY3RseScsIGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZ2V0TWVzc2FnZUxlZ2FjeShmYWxzZSlcbiAgICAgICAgbWVzc2FnZS50eXBlID0gJ1dhcm5pbmcnXG4gICAgICAgIGV4cGVjdCh0eXBlb2YgbWVzc2FnZS5zZXZlcml0eSkudG9CZSgndW5kZWZpbmVkJylcbiAgICAgICAgSGVscGVycy5ub3JtYWxpemVNZXNzYWdlc0xlZ2FjeSgnU29tZSBMaW50ZXInLCBbbWVzc2FnZV0pXG4gICAgICAgIGV4cGVjdCh0eXBlb2YgbWVzc2FnZS5zZXZlcml0eSkudG9CZSgnc3RyaW5nJylcbiAgICAgICAgZXhwZWN0KG1lc3NhZ2Uuc2V2ZXJpdHkpLnRvQmUoJ3dhcm5pbmcnKVxuICAgICAgfSlcbiAgICAgIGl0KCdhZGRzIHdhcm5pbmcgYW5kIGlzIG5vdCBjYXNlIHNlbnNpdGl2ZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZ2V0TWVzc2FnZUxlZ2FjeShmYWxzZSlcbiAgICAgICAgbWVzc2FnZS50eXBlID0gJ3dhcm5pbmcnXG4gICAgICAgIGV4cGVjdCh0eXBlb2YgbWVzc2FnZS5zZXZlcml0eSkudG9CZSgndW5kZWZpbmVkJylcbiAgICAgICAgSGVscGVycy5ub3JtYWxpemVNZXNzYWdlc0xlZ2FjeSgnU29tZSBMaW50ZXInLCBbbWVzc2FnZV0pXG4gICAgICAgIGV4cGVjdCh0eXBlb2YgbWVzc2FnZS5zZXZlcml0eSkudG9CZSgnc3RyaW5nJylcbiAgICAgICAgZXhwZWN0KG1lc3NhZ2Uuc2V2ZXJpdHkpLnRvQmUoJ3dhcm5pbmcnKVxuICAgICAgfSlcbiAgICAgIGl0KCdhZGRzIGluZm8gdG8gdHJhY2VzJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBnZXRNZXNzYWdlTGVnYWN5KGZhbHNlKVxuICAgICAgICBtZXNzYWdlLnR5cGUgPSAnVHJhY2UnXG4gICAgICAgIGV4cGVjdCh0eXBlb2YgbWVzc2FnZS5zZXZlcml0eSkudG9CZSgndW5kZWZpbmVkJylcbiAgICAgICAgSGVscGVycy5ub3JtYWxpemVNZXNzYWdlc0xlZ2FjeSgnU29tZSBMaW50ZXInLCBbbWVzc2FnZV0pXG4gICAgICAgIGV4cGVjdCh0eXBlb2YgbWVzc2FnZS5zZXZlcml0eSkudG9CZSgnc3RyaW5nJylcbiAgICAgICAgZXhwZWN0KG1lc3NhZ2Uuc2V2ZXJpdHkpLnRvQmUoJ2luZm8nKVxuICAgICAgfSlcbiAgICAgIGl0KCdhZGRzIGVycm9yIGZvciBhbnl0aGluZyBlbHNlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHtcbiAgICAgICAgICBjb25zdCBtZXNzYWdlID0gZ2V0TWVzc2FnZUxlZ2FjeShmYWxzZSlcbiAgICAgICAgICBtZXNzYWdlLnR5cGUgPSAnYXNkYXNkJ1xuICAgICAgICAgIGV4cGVjdCh0eXBlb2YgbWVzc2FnZS5zZXZlcml0eSkudG9CZSgndW5kZWZpbmVkJylcbiAgICAgICAgICBIZWxwZXJzLm5vcm1hbGl6ZU1lc3NhZ2VzTGVnYWN5KCdTb21lIExpbnRlcicsIFttZXNzYWdlXSlcbiAgICAgICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2Uuc2V2ZXJpdHkpLnRvQmUoJ3N0cmluZycpXG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2Uuc2V2ZXJpdHkpLnRvQmUoJ2Vycm9yJylcbiAgICAgICAgfVxuICAgICAgICB7XG4gICAgICAgICAgY29uc3QgbWVzc2FnZSA9IGdldE1lc3NhZ2VMZWdhY3koZmFsc2UpXG4gICAgICAgICAgbWVzc2FnZS50eXBlID0gJ0FzZFNEYXNkYXNkJ1xuICAgICAgICAgIGV4cGVjdCh0eXBlb2YgbWVzc2FnZS5zZXZlcml0eSkudG9CZSgndW5kZWZpbmVkJylcbiAgICAgICAgICBIZWxwZXJzLm5vcm1hbGl6ZU1lc3NhZ2VzTGVnYWN5KCdTb21lIExpbnRlcicsIFttZXNzYWdlXSlcbiAgICAgICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2Uuc2V2ZXJpdHkpLnRvQmUoJ3N0cmluZycpXG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2Uuc2V2ZXJpdHkpLnRvQmUoJ2Vycm9yJylcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuICAgIGl0KCdjb252ZXJ0cyBhcnJheXMgaW4gcmFuZ2UgdG8gUmFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBnZXRNZXNzYWdlTGVnYWN5KGZhbHNlKVxuICAgICAgbWVzc2FnZS5yYW5nZSA9IFtbMCwgMF0sIFswLCAwXV1cbiAgICAgIGV4cGVjdChBcnJheS5pc0FycmF5KG1lc3NhZ2UucmFuZ2UpKS50b0JlKHRydWUpXG4gICAgICBIZWxwZXJzLm5vcm1hbGl6ZU1lc3NhZ2VzTGVnYWN5KCdTb21lIExpbnRlcicsIFttZXNzYWdlXSlcbiAgICAgIGV4cGVjdChBcnJheS5pc0FycmF5KG1lc3NhZ2UucmFuZ2UpKS50b0JlKGZhbHNlKVxuICAgICAgZXhwZWN0KG1lc3NhZ2UucmFuZ2UuY29uc3RydWN0b3IubmFtZSkudG9CZSgnUmFuZ2UnKVxuICAgIH0pXG4gICAgaXQoJ2NvbnZlcnRzIGFycmF5cyBpbiBmaXgtPnJhbmdlIHRvIFJhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZ2V0TWVzc2FnZUxlZ2FjeShmYWxzZSlcbiAgICAgIG1lc3NhZ2UuZml4ID0geyByYW5nZTogW1swLCAwXSwgWzAsIDBdXSwgbmV3VGV4dDogJ2ZhaXInIH1cbiAgICAgIGV4cGVjdChBcnJheS5pc0FycmF5KG1lc3NhZ2UuZml4LnJhbmdlKSkudG9CZSh0cnVlKVxuICAgICAgSGVscGVycy5ub3JtYWxpemVNZXNzYWdlc0xlZ2FjeSgnU29tZSBMaW50ZXInLCBbbWVzc2FnZV0pXG4gICAgICBleHBlY3QoQXJyYXkuaXNBcnJheShtZXNzYWdlLmZpeC5yYW5nZSkpLnRvQmUoZmFsc2UpXG4gICAgICBleHBlY3QobWVzc2FnZS5maXgucmFuZ2UuY29uc3RydWN0b3IubmFtZSkudG9CZSgnUmFuZ2UnKVxuICAgIH0pXG4gICAgaXQoJ3Byb2Nlc3NlcyB0cmFjZXMgb24gbWVzc2FnZXMnLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBnZXRNZXNzYWdlTGVnYWN5KGZhbHNlKVxuICAgICAgbWVzc2FnZS50eXBlID0gJ2FzZGFzZCdcbiAgICAgIGNvbnN0IHRyYWNlID0gZ2V0TWVzc2FnZUxlZ2FjeShmYWxzZSlcbiAgICAgIHRyYWNlLnR5cGUgPSAnVHJhY2UnXG4gICAgICBtZXNzYWdlLnRyYWNlID0gW3RyYWNlXVxuICAgICAgZXhwZWN0KHR5cGVvZiB0cmFjZS5zZXZlcml0eSkudG9CZSgndW5kZWZpbmVkJylcbiAgICAgIEhlbHBlcnMubm9ybWFsaXplTWVzc2FnZXNMZWdhY3koJ1NvbWUgTGludGVyJywgW21lc3NhZ2VdKVxuICAgICAgZXhwZWN0KHR5cGVvZiB0cmFjZS5zZXZlcml0eSkudG9CZSgnc3RyaW5nJylcbiAgICAgIGV4cGVjdCh0cmFjZS5zZXZlcml0eSkudG9CZSgnaW5mbycpXG4gICAgfSlcbiAgfSlcbn0pXG4iXX0=