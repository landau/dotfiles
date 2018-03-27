Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _sbEventKit = require('sb-event-kit');

var _sbDebounce = require('sb-debounce');

var _sbDebounce2 = _interopRequireDefault(_sbDebounce);

var _disposableEvent = require('disposable-event');

var _disposableEvent2 = _interopRequireDefault(_disposableEvent);

var _helpers = require('./helpers');

var TreeView = (function () {
  function TreeView() {
    var _this = this;

    _classCallCheck(this, TreeView);

    this.emitter = new _sbEventKit.Emitter();
    this.messages = [];
    this.decorations = {};
    this.subscriptions = new _sbEventKit.CompositeDisposable();

    this.subscriptions.add(this.emitter);
    this.subscriptions.add(atom.config.observe('linter-ui-default.decorateOnTreeView', function (decorateOnTreeView) {
      if (typeof _this.decorateOnTreeView === 'undefined') {
        _this.decorateOnTreeView = decorateOnTreeView;
      } else if (decorateOnTreeView === 'None') {
        _this.update([]);
        _this.decorateOnTreeView = decorateOnTreeView;
      } else {
        var messages = _this.messages;
        _this.decorateOnTreeView = decorateOnTreeView;
        _this.update(messages);
      }
    }));

    setTimeout(function () {
      var element = TreeView.getElement();
      if (_this.subscriptions.disposed || !element) {
        return;
      }
      _this.subscriptions.add((0, _disposableEvent2['default'])(element, 'click', (0, _sbDebounce2['default'])(function () {
        _this.update();
      })));
    }, 100);
  }

  _createClass(TreeView, [{
    key: 'update',
    value: function update() {
      var givenMessages = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      var messages = undefined;
      if (Array.isArray(givenMessages)) {
        messages = this.messages = givenMessages;
      } else {
        messages = this.messages;
      }

      var element = TreeView.getElement();
      var decorateOnTreeView = this.decorateOnTreeView;
      if (!element || decorateOnTreeView === 'None') {
        return;
      }

      this.applyDecorations((0, _helpers.calculateDecorations)(decorateOnTreeView, messages));
    }
  }, {
    key: 'applyDecorations',
    value: function applyDecorations(decorations) {
      var treeViewElement = TreeView.getElement();
      if (!treeViewElement) {
        return;
      }

      var elementCache = {};
      var appliedDecorations = {};

      for (var filePath in this.decorations) {
        if (!({}).hasOwnProperty.call(this.decorations, filePath)) {
          continue;
        }
        if (!decorations[filePath]) {
          // Removed
          var element = elementCache[filePath] || (elementCache[filePath] = TreeView.getElementByPath(treeViewElement, filePath));
          if (element) {
            this.removeDecoration(element);
          }
        }
      }

      for (var filePath in decorations) {
        if (!({}).hasOwnProperty.call(decorations, filePath)) {
          continue;
        }
        var element = elementCache[filePath] || (elementCache[filePath] = TreeView.getElementByPath(treeViewElement, filePath));
        if (element) {
          this.handleDecoration(element, !!this.decorations[filePath], decorations[filePath]);
          appliedDecorations[filePath] = decorations[filePath];
        }
      }
      this.decorations = appliedDecorations;
    }
  }, {
    key: 'handleDecoration',
    value: function handleDecoration(element, update, highlights) {
      if (update === undefined) update = false;

      var decoration = undefined;
      if (update) {
        decoration = element.querySelector('linter-decoration');
      }
      if (decoration) {
        decoration.className = '';
      } else {
        decoration = document.createElement('linter-decoration');
        element.appendChild(decoration);
      }
      if (highlights.error) {
        decoration.classList.add('linter-error');
      } else if (highlights.warning) {
        decoration.classList.add('linter-warning');
      } else if (highlights.info) {
        decoration.classList.add('linter-info');
      }
    }
  }, {
    key: 'removeDecoration',
    value: function removeDecoration(element) {
      var decoration = element.querySelector('linter-decoration');
      if (decoration) {
        decoration.remove();
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.subscriptions.dispose();
    }
  }], [{
    key: 'getElement',
    value: function getElement() {
      return document.querySelector('.tree-view');
    }
  }, {
    key: 'getElementByPath',
    value: function getElementByPath(parent, filePath) {
      return parent.querySelector('[data-path=' + CSS.escape(filePath) + ']');
    }
  }]);

  return TreeView;
})();

exports['default'] = TreeView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi90cmVlLXZpZXcvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OzswQkFFNkMsY0FBYzs7MEJBQ3RDLGFBQWE7Ozs7K0JBQ04sa0JBQWtCOzs7O3VCQUNULFdBQVc7O0lBRzNCLFFBQVE7QUFPaEIsV0FQUSxRQUFRLEdBT2I7OzswQkFQSyxRQUFROztBQVF6QixRQUFJLENBQUMsT0FBTyxHQUFHLHlCQUFhLENBQUE7QUFDNUIsUUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUE7QUFDbEIsUUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUE7QUFDckIsUUFBSSxDQUFDLGFBQWEsR0FBRyxxQ0FBeUIsQ0FBQTs7QUFFOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ3BDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLHNDQUFzQyxFQUFFLFVBQUMsa0JBQWtCLEVBQUs7QUFDekcsVUFBSSxPQUFPLE1BQUssa0JBQWtCLEtBQUssV0FBVyxFQUFFO0FBQ2xELGNBQUssa0JBQWtCLEdBQUcsa0JBQWtCLENBQUE7T0FDN0MsTUFBTSxJQUFJLGtCQUFrQixLQUFLLE1BQU0sRUFBRTtBQUN4QyxjQUFLLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQTtBQUNmLGNBQUssa0JBQWtCLEdBQUcsa0JBQWtCLENBQUE7T0FDN0MsTUFBTTtBQUNMLFlBQU0sUUFBUSxHQUFHLE1BQUssUUFBUSxDQUFBO0FBQzlCLGNBQUssa0JBQWtCLEdBQUcsa0JBQWtCLENBQUE7QUFDNUMsY0FBSyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUE7T0FDdEI7S0FDRixDQUFDLENBQUMsQ0FBQTs7QUFFSCxjQUFVLENBQUMsWUFBTTtBQUNm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UUFBUSxFQUFnQjtBQUNuRSxhQUFPLE1BQU0sQ0FBQyxhQUFhLGlCQUFlLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQUksQ0FBQTtLQUNuRTs7O1NBeEhrQixRQUFROzs7cUJBQVIsUUFBUSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9saW50ZXItdWktZGVmYXVsdC9saWIvdHJlZS12aWV3L2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlciB9IGZyb20gJ3NiLWV2ZW50LWtpdCdcbmltcG9ydCBkZWJvdW5jZSBmcm9tICdzYi1kZWJvdW5jZSdcbmltcG9ydCBkaXNwb3NhYmxlRXZlbnQgZnJvbSAnZGlzcG9zYWJsZS1ldmVudCdcbmltcG9ydCB7IGNhbGN1bGF0ZURlY29yYXRpb25zIH0gZnJvbSAnLi9oZWxwZXJzJ1xuaW1wb3J0IHR5cGUgeyBMaW50ZXJNZXNzYWdlLCBUcmVlVmlld0hpZ2hsaWdodCB9IGZyb20gJy4uL3R5cGVzJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUcmVlVmlldyB7XG4gIGVtaXR0ZXI6IEVtaXR0ZXI7XG4gIG1lc3NhZ2VzOiBBcnJheTxMaW50ZXJNZXNzYWdlPjtcbiAgZGVjb3JhdGlvbnM6IE9iamVjdDtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgZGVjb3JhdGVPblRyZWVWaWV3OiAnRmlsZXMgYW5kIERpcmVjdG9yaWVzJyB8ICdGaWxlcycgfCAnTm9uZSc7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKVxuICAgIHRoaXMubWVzc2FnZXMgPSBbXVxuICAgIHRoaXMuZGVjb3JhdGlvbnMgPSB7fVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5lbWl0dGVyKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgnbGludGVyLXVpLWRlZmF1bHQuZGVjb3JhdGVPblRyZWVWaWV3JywgKGRlY29yYXRlT25UcmVlVmlldykgPT4ge1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLmRlY29yYXRlT25UcmVlVmlldyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhpcy5kZWNvcmF0ZU9uVHJlZVZpZXcgPSBkZWNvcmF0ZU9uVHJlZVZpZXdcbiAgICAgIH0gZWxzZSBpZiAoZGVjb3JhdGVPblRyZWVWaWV3ID09PSAnTm9uZScpIHtcbiAgICAgICAgdGhpcy51cGRhdGUoW10pXG4gICAgICAgIHRoaXMuZGVjb3JhdGVPblRyZWVWaWV3ID0gZGVjb3JhdGVPblRyZWVWaWV3XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBtZXNzYWdlcyA9IHRoaXMubWVzc2FnZXNcbiAgICAgICAgdGhpcy5kZWNvcmF0ZU9uVHJlZVZpZXcgPSBkZWNvcmF0ZU9uVHJlZVZpZXdcbiAgICAgICAgdGhpcy51cGRhdGUobWVzc2FnZXMpXG4gICAgICB9XG4gICAgfSkpXG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGNvbnN0IGVsZW1lbnQgPSBUcmVlVmlldy5nZXRFbGVtZW50KClcbiAgICAgIGlmICh0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZWQgfHwgIWVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGRpc3Bvc2FibGVFdmVudChlbGVtZW50LCAnY2xpY2snLCBkZWJvdW5jZSgoKSA9PiB7XG4gICAgICAgIHRoaXMudXBkYXRlKClcbiAgICAgIH0pKSlcbiAgICB9LCAxMDApXG4gIH1cbiAgdXBkYXRlKGdpdmVuTWVzc2FnZXM6ID9BcnJheTxMaW50ZXJNZXNzYWdlPiA9IG51bGwpIHtcbiAgICBsZXQgbWVzc2FnZXNcbiAgICBpZiAoQXJyYXkuaXNBcnJheShnaXZlbk1lc3NhZ2VzKSkge1xuICAgICAgbWVzc2FnZXMgPSB0aGlzLm1lc3NhZ2VzID0gZ2l2ZW5NZXNzYWdlc1xuICAgIH0gZWxzZSB7XG4gICAgICBtZXNzYWdlcyA9IHRoaXMubWVzc2FnZXNcbiAgICB9XG5cbiAgICBjb25zdCBlbGVtZW50ID0gVHJlZVZpZXcuZ2V0RWxlbWVudCgpXG4gICAgY29uc3QgZGVjb3JhdGVPblRyZWVWaWV3ID0gdGhpcy5kZWNvcmF0ZU9uVHJlZVZpZXdcbiAgICBpZiAoIWVsZW1lbnQgfHwgZGVjb3JhdGVPblRyZWVWaWV3ID09PSAnTm9uZScpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMuYXBwbHlEZWNvcmF0aW9ucyhjYWxjdWxhdGVEZWNvcmF0aW9ucyhkZWNvcmF0ZU9uVHJlZVZpZXcsIG1lc3NhZ2VzKSlcbiAgfVxuICBhcHBseURlY29yYXRpb25zKGRlY29yYXRpb25zOiBPYmplY3QpIHtcbiAgICBjb25zdCB0cmVlVmlld0VsZW1lbnQgPSBUcmVlVmlldy5nZXRFbGVtZW50KClcbiAgICBpZiAoIXRyZWVWaWV3RWxlbWVudCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgZWxlbWVudENhY2hlID0ge31cbiAgICBjb25zdCBhcHBsaWVkRGVjb3JhdGlvbnMgPSB7fVxuXG4gICAgZm9yIChjb25zdCBmaWxlUGF0aCBpbiB0aGlzLmRlY29yYXRpb25zKSB7XG4gICAgICBpZiAoIXt9Lmhhc093blByb3BlcnR5LmNhbGwodGhpcy5kZWNvcmF0aW9ucywgZmlsZVBhdGgpKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICBpZiAoIWRlY29yYXRpb25zW2ZpbGVQYXRoXSkge1xuICAgICAgICAvLyBSZW1vdmVkXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBlbGVtZW50Q2FjaGVbZmlsZVBhdGhdIHx8IChlbGVtZW50Q2FjaGVbZmlsZVBhdGhdID0gVHJlZVZpZXcuZ2V0RWxlbWVudEJ5UGF0aCh0cmVlVmlld0VsZW1lbnQsIGZpbGVQYXRoKSlcbiAgICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZURlY29yYXRpb24oZWxlbWVudClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoY29uc3QgZmlsZVBhdGggaW4gZGVjb3JhdGlvbnMpIHtcbiAgICAgIGlmICghe30uaGFzT3duUHJvcGVydHkuY2FsbChkZWNvcmF0aW9ucywgZmlsZVBhdGgpKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICBjb25zdCBlbGVtZW50ID0gZWxlbWVudENhY2hlW2ZpbGVQYXRoXSB8fCAoZWxlbWVudENhY2hlW2ZpbGVQYXRoXSA9IFRyZWVWaWV3LmdldEVsZW1lbnRCeVBhdGgodHJlZVZpZXdFbGVtZW50LCBmaWxlUGF0aCkpXG4gICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICB0aGlzLmhhbmRsZURlY29yYXRpb24oZWxlbWVudCwgISF0aGlzLmRlY29yYXRpb25zW2ZpbGVQYXRoXSwgZGVjb3JhdGlvbnNbZmlsZVBhdGhdKVxuICAgICAgICBhcHBsaWVkRGVjb3JhdGlvbnNbZmlsZVBhdGhdID0gZGVjb3JhdGlvbnNbZmlsZVBhdGhdXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuZGVjb3JhdGlvbnMgPSBhcHBsaWVkRGVjb3JhdGlvbnNcbiAgfVxuICBoYW5kbGVEZWNvcmF0aW9uKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCB1cGRhdGU6IGJvb2xlYW4gPSBmYWxzZSwgaGlnaGxpZ2h0czogVHJlZVZpZXdIaWdobGlnaHQpIHtcbiAgICBsZXQgZGVjb3JhdGlvblxuICAgIGlmICh1cGRhdGUpIHtcbiAgICAgIGRlY29yYXRpb24gPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbnRlci1kZWNvcmF0aW9uJylcbiAgICB9XG4gICAgaWYgKGRlY29yYXRpb24pIHtcbiAgICAgIGRlY29yYXRpb24uY2xhc3NOYW1lID0gJydcbiAgICB9IGVsc2Uge1xuICAgICAgZGVjb3JhdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbnRlci1kZWNvcmF0aW9uJylcbiAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoZGVjb3JhdGlvbilcbiAgICB9XG4gICAgaWYgKGhpZ2hsaWdodHMuZXJyb3IpIHtcbiAgICAgIGRlY29yYXRpb24uY2xhc3NMaXN0LmFkZCgnbGludGVyLWVycm9yJylcbiAgICB9IGVsc2UgaWYgKGhpZ2hsaWdodHMud2FybmluZykge1xuICAgICAgZGVjb3JhdGlvbi5jbGFzc0xpc3QuYWRkKCdsaW50ZXItd2FybmluZycpXG4gICAgfSBlbHNlIGlmIChoaWdobGlnaHRzLmluZm8pIHtcbiAgICAgIGRlY29yYXRpb24uY2xhc3NMaXN0LmFkZCgnbGludGVyLWluZm8nKVxuICAgIH1cbiAgfVxuICByZW1vdmVEZWNvcmF0aW9uKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSB7XG4gICAgY29uc3QgZGVjb3JhdGlvbiA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcignbGludGVyLWRlY29yYXRpb24nKVxuICAgIGlmIChkZWNvcmF0aW9uKSB7XG4gICAgICBkZWNvcmF0aW9uLnJlbW92ZSgpXG4gICAgfVxuICB9XG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKVxuICB9XG4gIHN0YXRpYyBnZXRFbGVtZW50KCkge1xuICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudHJlZS12aWV3JylcbiAgfVxuICBzdGF0aWMgZ2V0RWxlbWVudEJ5UGF0aChwYXJlbnQ6IEhUTUxFbGVtZW50LCBmaWxlUGF0aCk6ID9IVE1MRWxlbWVudCB7XG4gICAgcmV0dXJuIHBhcmVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1wYXRoPSR7Q1NTLmVzY2FwZShmaWxlUGF0aCl9XWApXG4gIH1cbn1cbiJdfQ==