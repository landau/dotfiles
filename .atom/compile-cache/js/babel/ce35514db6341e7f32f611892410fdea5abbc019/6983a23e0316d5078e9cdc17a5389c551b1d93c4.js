Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helpers = require('./helpers');

var Intentions = (function () {
  function Intentions() {
    _classCallCheck(this, Intentions);

    this.messages = [];
    this.grammarScopes = ['*'];
  }

  _createClass(Intentions, [{
    key: 'getIntentions',
    value: function getIntentions(_ref) {
      var textEditor = _ref.textEditor;
      var bufferPosition = _ref.bufferPosition;

      var intentions = [];
      var messages = (0, _helpers.filterMessages)(this.messages, textEditor.getPath());

      var _loop = function (message) {
        var hasFixes = message.version === 1 ? message.fix : message.solutions && message.solutions.length;
        if (!hasFixes) {
          return 'continue';
        }
        var range = (0, _helpers.$range)(message);
        var inRange = range && range.containsPoint(bufferPosition);
        if (!inRange) {
          return 'continue';
        }

        var solutions = [];
        if (message.version === 1 && message.fix) {
          solutions.push(message.fix);
        } else if (message.version === 2 && message.solutions && message.solutions.length) {
          solutions = message.solutions;
        }
        var linterName = message.linterName || 'Linter';

        intentions = intentions.concat(solutions.map(function (solution) {
          return {
            priority: solution.priority ? solution.priority + 200 : 200,
            icon: 'tools',
            title: solution.title || 'Fix ' + linterName + ' issue',
            selected: function selected() {
              (0, _helpers.applySolution)(textEditor, message.version, solution);
            }
          };
        }));
      };

      for (var message of messages) {
        var _ret = _loop(message);

        if (_ret === 'continue') continue;
      }
      return intentions;
    }
  }, {
    key: 'update',
    value: function update(messages) {
      this.messages = messages;
    }
  }]);

  return Intentions;
})();

exports['default'] = Intentions;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9pbnRlbnRpb25zLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O3VCQUVzRCxXQUFXOztJQUc1QyxVQUFVO0FBSWxCLFdBSlEsVUFBVSxHQUlmOzBCQUpLLFVBQVU7O0FBSzNCLFFBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFBO0FBQ2xCLFFBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtHQUMzQjs7ZUFQa0IsVUFBVTs7V0FRaEIsdUJBQUMsSUFBc0MsRUFBaUI7VUFBckQsVUFBVSxHQUFaLElBQXNDLENBQXBDLFVBQVU7VUFBRSxjQUFjLEdBQTVCLElBQXNDLENBQXhCLGNBQWM7O0FBQ3hDLFVBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQTtBQUNuQixVQUFNLFFBQVEsR0FBRyw2QkFBZSxJQUFJLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFBOzs0QkFFekQsT0FBTztBQUNoQixZQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsT0FBTyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxTQUFTLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUE7QUFDcEcsWUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNiLDRCQUFRO1NBQ1Q7QUFDRCxZQUFNLEtBQUssR0FBRyxxQkFBTyxPQUFPLENBQUMsQ0FBQTtBQUM3QixZQUFNLE9BQU8sR0FBRyxLQUFLLElBQUksS0FBSyxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQTtBQUM1RCxZQUFJLENBQUMsT0FBTyxFQUFFO0FBQ1osNEJBQVE7U0FDVDs7QUFFRCxZQUFJLFNBQXdCLEdBQUcsRUFBRSxDQUFBO0FBQ2pDLFlBQUksT0FBTyxDQUFDLE9BQU8sS0FBSyxDQUFDLElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRTtBQUN4QyxtQkFBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUE7U0FDNUIsTUFBTSxJQUFJLE9BQU8sQ0FBQyxPQUFPLEtBQUssQ0FBQyxJQUFJLE9BQU8sQ0FBQyxTQUFTLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7QUFDakYsbUJBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFBO1NBQzlCO0FBQ0QsWUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsSUFBSSxRQUFRLENBQUE7O0FBRWpELGtCQUFVLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQUEsUUFBUTtpQkFBSztBQUN4RCxvQkFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLFFBQVEsR0FBRyxHQUFHLEdBQUcsR0FBRztBQUMzRCxnQkFBSSxFQUFFLE9BQU87QUFDYixpQkFBSyxFQUFFLFFBQVEsQ0FBQyxLQUFLLGFBQVcsVUFBVSxXQUFRO0FBQ2xELG9CQUFRLEVBQUEsb0JBQUc7QUFDVCwwQ0FBYyxVQUFVLEVBQUUsT0FBTyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQTthQUNyRDtXQUNGO1NBQUMsQ0FBQyxDQUFDLENBQUE7OztBQTFCTixXQUFLLElBQU0sT0FBTyxJQUFJLFFBQVEsRUFBRTt5QkFBckIsT0FBTzs7aUNBUWQsU0FBUTtPQW1CWDtBQUNELGFBQU8sVUFBVSxDQUFBO0tBQ2xCOzs7V0FDSyxnQkFBQyxRQUE4QixFQUFFO0FBQ3JDLFVBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO0tBQ3pCOzs7U0E1Q2tCLFVBQVU7OztxQkFBVixVQUFVIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9pbnRlbnRpb25zLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgJHJhbmdlLCBhcHBseVNvbHV0aW9uLCBmaWx0ZXJNZXNzYWdlcyB9IGZyb20gJy4vaGVscGVycydcbmltcG9ydCB0eXBlIHsgTGludGVyTWVzc2FnZSB9IGZyb20gJy4vdHlwZXMnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEludGVudGlvbnMge1xuICBtZXNzYWdlczogQXJyYXk8TGludGVyTWVzc2FnZT47XG4gIGdyYW1tYXJTY29wZXM6IEFycmF5PHN0cmluZz47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5tZXNzYWdlcyA9IFtdXG4gICAgdGhpcy5ncmFtbWFyU2NvcGVzID0gWycqJ11cbiAgfVxuICBnZXRJbnRlbnRpb25zKHsgdGV4dEVkaXRvciwgYnVmZmVyUG9zaXRpb24gfTogT2JqZWN0KTogQXJyYXk8T2JqZWN0PiB7XG4gICAgbGV0IGludGVudGlvbnMgPSBbXVxuICAgIGNvbnN0IG1lc3NhZ2VzID0gZmlsdGVyTWVzc2FnZXModGhpcy5tZXNzYWdlcywgdGV4dEVkaXRvci5nZXRQYXRoKCkpXG5cbiAgICBmb3IgKGNvbnN0IG1lc3NhZ2Ugb2YgbWVzc2FnZXMpIHtcbiAgICAgIGNvbnN0IGhhc0ZpeGVzID0gbWVzc2FnZS52ZXJzaW9uID09PSAxID8gbWVzc2FnZS5maXggOiBtZXNzYWdlLnNvbHV0aW9ucyAmJiBtZXNzYWdlLnNvbHV0aW9ucy5sZW5ndGhcbiAgICAgIGlmICghaGFzRml4ZXMpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGNvbnN0IHJhbmdlID0gJHJhbmdlKG1lc3NhZ2UpXG4gICAgICBjb25zdCBpblJhbmdlID0gcmFuZ2UgJiYgcmFuZ2UuY29udGFpbnNQb2ludChidWZmZXJQb3NpdGlvbilcbiAgICAgIGlmICghaW5SYW5nZSkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBsZXQgc29sdXRpb25zOiBBcnJheTxPYmplY3Q+ID0gW11cbiAgICAgIGlmIChtZXNzYWdlLnZlcnNpb24gPT09IDEgJiYgbWVzc2FnZS5maXgpIHtcbiAgICAgICAgc29sdXRpb25zLnB1c2gobWVzc2FnZS5maXgpXG4gICAgICB9IGVsc2UgaWYgKG1lc3NhZ2UudmVyc2lvbiA9PT0gMiAmJiBtZXNzYWdlLnNvbHV0aW9ucyAmJiBtZXNzYWdlLnNvbHV0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgc29sdXRpb25zID0gbWVzc2FnZS5zb2x1dGlvbnNcbiAgICAgIH1cbiAgICAgIGNvbnN0IGxpbnRlck5hbWUgPSBtZXNzYWdlLmxpbnRlck5hbWUgfHwgJ0xpbnRlcidcblxuICAgICAgaW50ZW50aW9ucyA9IGludGVudGlvbnMuY29uY2F0KHNvbHV0aW9ucy5tYXAoc29sdXRpb24gPT4gKHtcbiAgICAgICAgcHJpb3JpdHk6IHNvbHV0aW9uLnByaW9yaXR5ID8gc29sdXRpb24ucHJpb3JpdHkgKyAyMDAgOiAyMDAsXG4gICAgICAgIGljb246ICd0b29scycsXG4gICAgICAgIHRpdGxlOiBzb2x1dGlvbi50aXRsZSB8fCBgRml4ICR7bGludGVyTmFtZX0gaXNzdWVgLFxuICAgICAgICBzZWxlY3RlZCgpIHtcbiAgICAgICAgICBhcHBseVNvbHV0aW9uKHRleHRFZGl0b3IsIG1lc3NhZ2UudmVyc2lvbiwgc29sdXRpb24pXG4gICAgICAgIH0sXG4gICAgICB9KSkpXG4gICAgfVxuICAgIHJldHVybiBpbnRlbnRpb25zXG4gIH1cbiAgdXBkYXRlKG1lc3NhZ2VzOiBBcnJheTxMaW50ZXJNZXNzYWdlPikge1xuICAgIHRoaXMubWVzc2FnZXMgPSBtZXNzYWdlc1xuICB9XG59XG4iXX0=