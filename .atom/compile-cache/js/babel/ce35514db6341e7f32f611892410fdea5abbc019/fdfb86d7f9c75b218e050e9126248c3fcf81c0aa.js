var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _sbDebounce = require('sb-debounce');

var _sbDebounce2 = _interopRequireDefault(_sbDebounce);

var _disposableEvent = require('disposable-event');

var _disposableEvent2 = _interopRequireDefault(_disposableEvent);

var _helpers = require('./helpers');

var TreeView = (function () {
  function TreeView() {
    var _this = this;

    _classCallCheck(this, TreeView);

    this.emitter = new _atom.Emitter();
    this.messages = [];
    this.decorations = {};
    this.subscriptions = new _atom.CompositeDisposable();

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
      if (!element) {
        return;
      }
      // Subscription is only added if the CompositeDisposable hasn't been disposed
      _this.subscriptions.add((0, _disposableEvent2['default'])(element, 'click', (0, _sbDebounce2['default'])(function () {
        _this.update();
      })));
    }, 100);
  }

  _createClass(TreeView, [{
    key: 'update',
    value: function update() {
      var givenMessages = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      if (Array.isArray(givenMessages)) {
        this.messages = givenMessages;
      }
      var messages = this.messages;

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

module.exports = TreeView;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi90cmVlLXZpZXcvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O29CQUU2QyxNQUFNOzswQkFDOUIsYUFBYTs7OzsrQkFDTixrQkFBa0I7Ozs7dUJBQ1QsV0FBVzs7SUFHMUMsUUFBUTtBQU9ELFdBUFAsUUFBUSxHQU9FOzs7MEJBUFYsUUFBUTs7QUFRVixRQUFJLENBQUMsT0FBTyxHQUFHLG1CQUFhLENBQUE7QUFDNUIsUUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUE7QUFDbEIsUUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUE7QUFDckIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTs7QUFFOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ3BDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLHNDQUFzQyxFQUFFLFVBQUMsa0JBQWtCLEVBQUs7QUFDekcsVUFBSSxPQUFPLE1BQUssa0JBQWtCLEtBQUssV0FBVyxFQUFFO0FBQ2xELGNBQUssa0JBQWtCLEdBQUcsa0JBQWtCLENBQUE7T0FDN0MsTUFBTSxJQUFJLGtCQUFrQixLQUFLLE1BQU0sRUFBRTtBQUN4QyxjQUFLLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQTtBQUNmLGNBQUssa0JBQWtCLEdBQUcsa0JBQWtCLENBQUE7T0FDN0MsTUFBTTtBQUNMLFlBQU0sUUFBUSxHQUFHLE1BQUssUUFBUSxDQUFBO0FBQzlCLGNBQUssa0JBQWtCLEdBQUcsa0JBQWtCLENBQUE7QUFDNUMsY0FBSyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUE7T0FDdEI7S0FDRixDQUFDLENBQUMsQ0FBQTs7QUFFSCxjQUFVLENBQUMsWUFBTTtBQUNmLFVBQU0s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QUksQ0FBQTtLQUNuRTs7O1NBdkhHLFFBQVE7OztBQTBIZCxNQUFNLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9saW50ZXItdWktZGVmYXVsdC9saWIvdHJlZS12aWV3L2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlciB9IGZyb20gJ2F0b20nXG5pbXBvcnQgZGVib3VuY2UgZnJvbSAnc2ItZGVib3VuY2UnXG5pbXBvcnQgZGlzcG9zYWJsZUV2ZW50IGZyb20gJ2Rpc3Bvc2FibGUtZXZlbnQnXG5pbXBvcnQgeyBjYWxjdWxhdGVEZWNvcmF0aW9ucyB9IGZyb20gJy4vaGVscGVycydcbmltcG9ydCB0eXBlIHsgTGludGVyTWVzc2FnZSwgVHJlZVZpZXdIaWdobGlnaHQgfSBmcm9tICcuLi90eXBlcydcblxuY2xhc3MgVHJlZVZpZXcge1xuICBlbWl0dGVyOiBFbWl0dGVyO1xuICBtZXNzYWdlczogQXJyYXk8TGludGVyTWVzc2FnZT47XG4gIGRlY29yYXRpb25zOiBPYmplY3Q7XG4gIHN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIGRlY29yYXRlT25UcmVlVmlldzogJ0ZpbGVzIGFuZCBEaXJlY3RvcmllcycgfCAnRmlsZXMnIHwgJ05vbmUnO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKClcbiAgICB0aGlzLm1lc3NhZ2VzID0gW11cbiAgICB0aGlzLmRlY29yYXRpb25zID0ge31cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZW1pdHRlcilcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoJ2xpbnRlci11aS1kZWZhdWx0LmRlY29yYXRlT25UcmVlVmlldycsIChkZWNvcmF0ZU9uVHJlZVZpZXcpID0+IHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5kZWNvcmF0ZU9uVHJlZVZpZXcgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRoaXMuZGVjb3JhdGVPblRyZWVWaWV3ID0gZGVjb3JhdGVPblRyZWVWaWV3XG4gICAgICB9IGVsc2UgaWYgKGRlY29yYXRlT25UcmVlVmlldyA9PT0gJ05vbmUnKSB7XG4gICAgICAgIHRoaXMudXBkYXRlKFtdKVxuICAgICAgICB0aGlzLmRlY29yYXRlT25UcmVlVmlldyA9IGRlY29yYXRlT25UcmVlVmlld1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZXMgPSB0aGlzLm1lc3NhZ2VzXG4gICAgICAgIHRoaXMuZGVjb3JhdGVPblRyZWVWaWV3ID0gZGVjb3JhdGVPblRyZWVWaWV3XG4gICAgICAgIHRoaXMudXBkYXRlKG1lc3NhZ2VzKVxuICAgICAgfVxuICAgIH0pKVxuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBjb25zdCBlbGVtZW50ID0gVHJlZVZpZXcuZ2V0RWxlbWVudCgpXG4gICAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICAvLyBTdWJzY3JpcHRpb24gaXMgb25seSBhZGRlZCBpZiB0aGUgQ29tcG9zaXRlRGlzcG9zYWJsZSBoYXNuJ3QgYmVlbiBkaXNwb3NlZFxuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChkaXNwb3NhYmxlRXZlbnQoZWxlbWVudCwgJ2NsaWNrJywgZGVib3VuY2UoKCkgPT4ge1xuICAgICAgICB0aGlzLnVwZGF0ZSgpXG4gICAgICB9KSkpXG4gICAgfSwgMTAwKVxuICB9XG4gIHVwZGF0ZShnaXZlbk1lc3NhZ2VzOiA/QXJyYXk8TGludGVyTWVzc2FnZT4gPSBudWxsKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoZ2l2ZW5NZXNzYWdlcykpIHtcbiAgICAgIHRoaXMubWVzc2FnZXMgPSBnaXZlbk1lc3NhZ2VzXG4gICAgfVxuICAgIGNvbnN0IG1lc3NhZ2VzID0gdGhpcy5tZXNzYWdlc1xuXG4gICAgY29uc3QgZWxlbWVudCA9IFRyZWVWaWV3LmdldEVsZW1lbnQoKVxuICAgIGNvbnN0IGRlY29yYXRlT25UcmVlVmlldyA9IHRoaXMuZGVjb3JhdGVPblRyZWVWaWV3XG4gICAgaWYgKCFlbGVtZW50IHx8IGRlY29yYXRlT25UcmVlVmlldyA9PT0gJ05vbmUnKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLmFwcGx5RGVjb3JhdGlvbnMoY2FsY3VsYXRlRGVjb3JhdGlvbnMoZGVjb3JhdGVPblRyZWVWaWV3LCBtZXNzYWdlcykpXG4gIH1cbiAgYXBwbHlEZWNvcmF0aW9ucyhkZWNvcmF0aW9uczogT2JqZWN0KSB7XG4gICAgY29uc3QgdHJlZVZpZXdFbGVtZW50ID0gVHJlZVZpZXcuZ2V0RWxlbWVudCgpXG4gICAgaWYgKCF0cmVlVmlld0VsZW1lbnQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IGVsZW1lbnRDYWNoZSA9IHt9XG4gICAgY29uc3QgYXBwbGllZERlY29yYXRpb25zID0ge31cblxuICAgIGZvciAoY29uc3QgZmlsZVBhdGggaW4gdGhpcy5kZWNvcmF0aW9ucykge1xuICAgICAgaWYgKCF7fS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMuZGVjb3JhdGlvbnMsIGZpbGVQYXRoKSkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgaWYgKCFkZWNvcmF0aW9uc1tmaWxlUGF0aF0pIHtcbiAgICAgICAgLy8gUmVtb3ZlZFxuICAgICAgICBjb25zdCBlbGVtZW50ID0gZWxlbWVudENhY2hlW2ZpbGVQYXRoXSB8fCAoZWxlbWVudENhY2hlW2ZpbGVQYXRoXSA9IFRyZWVWaWV3LmdldEVsZW1lbnRCeVBhdGgodHJlZVZpZXdFbGVtZW50LCBmaWxlUGF0aCkpXG4gICAgICAgIGlmIChlbGVtZW50KSB7XG4gICAgICAgICAgdGhpcy5yZW1vdmVEZWNvcmF0aW9uKGVsZW1lbnQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIGluIGRlY29yYXRpb25zKSB7XG4gICAgICBpZiAoIXt9Lmhhc093blByb3BlcnR5LmNhbGwoZGVjb3JhdGlvbnMsIGZpbGVQYXRoKSkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgY29uc3QgZWxlbWVudCA9IGVsZW1lbnRDYWNoZVtmaWxlUGF0aF0gfHwgKGVsZW1lbnRDYWNoZVtmaWxlUGF0aF0gPSBUcmVlVmlldy5nZXRFbGVtZW50QnlQYXRoKHRyZWVWaWV3RWxlbWVudCwgZmlsZVBhdGgpKVxuICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5oYW5kbGVEZWNvcmF0aW9uKGVsZW1lbnQsICEhdGhpcy5kZWNvcmF0aW9uc1tmaWxlUGF0aF0sIGRlY29yYXRpb25zW2ZpbGVQYXRoXSlcbiAgICAgICAgYXBwbGllZERlY29yYXRpb25zW2ZpbGVQYXRoXSA9IGRlY29yYXRpb25zW2ZpbGVQYXRoXVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmRlY29yYXRpb25zID0gYXBwbGllZERlY29yYXRpb25zXG4gIH1cbiAgaGFuZGxlRGVjb3JhdGlvbihlbGVtZW50OiBIVE1MRWxlbWVudCwgdXBkYXRlOiBib29sZWFuID0gZmFsc2UsIGhpZ2hsaWdodHM6IFRyZWVWaWV3SGlnaGxpZ2h0KSB7XG4gICAgbGV0IGRlY29yYXRpb25cbiAgICBpZiAodXBkYXRlKSB7XG4gICAgICBkZWNvcmF0aW9uID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKCdsaW50ZXItZGVjb3JhdGlvbicpXG4gICAgfVxuICAgIGlmIChkZWNvcmF0aW9uKSB7XG4gICAgICBkZWNvcmF0aW9uLmNsYXNzTmFtZSA9ICcnXG4gICAgfSBlbHNlIHtcbiAgICAgIGRlY29yYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW50ZXItZGVjb3JhdGlvbicpXG4gICAgICBlbGVtZW50LmFwcGVuZENoaWxkKGRlY29yYXRpb24pXG4gICAgfVxuICAgIGlmIChoaWdobGlnaHRzLmVycm9yKSB7XG4gICAgICBkZWNvcmF0aW9uLmNsYXNzTGlzdC5hZGQoJ2xpbnRlci1lcnJvcicpXG4gICAgfSBlbHNlIGlmIChoaWdobGlnaHRzLndhcm5pbmcpIHtcbiAgICAgIGRlY29yYXRpb24uY2xhc3NMaXN0LmFkZCgnbGludGVyLXdhcm5pbmcnKVxuICAgIH0gZWxzZSBpZiAoaGlnaGxpZ2h0cy5pbmZvKSB7XG4gICAgICBkZWNvcmF0aW9uLmNsYXNzTGlzdC5hZGQoJ2xpbnRlci1pbmZvJylcbiAgICB9XG4gIH1cbiAgcmVtb3ZlRGVjb3JhdGlvbihlbGVtZW50OiBIVE1MRWxlbWVudCkge1xuICAgIGNvbnN0IGRlY29yYXRpb24gPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbnRlci1kZWNvcmF0aW9uJylcbiAgICBpZiAoZGVjb3JhdGlvbikge1xuICAgICAgZGVjb3JhdGlvbi5yZW1vdmUoKVxuICAgIH1cbiAgfVxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgfVxuICBzdGF0aWMgZ2V0RWxlbWVudCgpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRyZWUtdmlldycpXG4gIH1cbiAgc3RhdGljIGdldEVsZW1lbnRCeVBhdGgocGFyZW50OiBIVE1MRWxlbWVudCwgZmlsZVBhdGgpOiA/SFRNTEVsZW1lbnQge1xuICAgIHJldHVybiBwYXJlbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtcGF0aD0ke0NTUy5lc2NhcGUoZmlsZVBhdGgpfV1gKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVHJlZVZpZXdcbiJdfQ==