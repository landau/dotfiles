Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _validate = require('./validate');

var _elementsHighlight = require('./elements/highlight');

var ProvidersHighlight = (function () {
  function ProvidersHighlight() {
    _classCallCheck(this, ProvidersHighlight);

    this.number = 0;
    this.providers = new Set();
  }

  _createClass(ProvidersHighlight, [{
    key: 'addProvider',
    value: function addProvider(provider) {
      if (!this.hasProvider(provider)) {
        (0, _validate.provider)(provider);
        this.providers.add(provider);
      }
    }
  }, {
    key: 'hasProvider',
    value: function hasProvider(provider) {
      return this.providers.has(provider);
    }
  }, {
    key: 'deleteProvider',
    value: function deleteProvider(provider) {
      if (this.hasProvider(provider)) {
        this.providers['delete'](provider);
      }
    }
  }, {
    key: 'trigger',
    value: _asyncToGenerator(function* (textEditor) {
      var editorPath = textEditor.getPath();
      var bufferPosition = textEditor.getCursorBufferPosition();

      if (!editorPath) {
        return [];
      }

      var scopes = textEditor.scopeDescriptorForBufferPosition(bufferPosition).getScopesArray();
      scopes.push('*');

      var visibleRange = _atom.Range.fromObject([textEditor.bufferPositionForScreenPosition([textEditor.getFirstVisibleScreenRow(), 0]), textEditor.bufferPositionForScreenPosition([textEditor.getLastVisibleScreenRow(), 0])]);
      // Setting this to infinity on purpose, cause the buffer position just marks visible column
      // according to element width
      visibleRange.end.column = Infinity;

      var promises = [];
      this.providers.forEach(function (provider) {
        if (scopes.some(function (scope) {
          return provider.grammarScopes.indexOf(scope) !== -1;
        })) {
          promises.push(new Promise(function (resolve) {
            resolve(provider.getIntentions({ textEditor: textEditor, visibleRange: visibleRange }));
          }).then(function (results) {
            if (atom.inDevMode()) {
              (0, _validate.suggestionsShow)(results);
            }
            return results;
          }));
        }
      });

      var number = ++this.number;
      var results = (yield Promise.all(promises)).reduce(function (items, item) {
        if (Array.isArray(item)) {
          return items.concat(item);
        }
        return items;
      }, []);

      if (number !== this.number || !results.length) {
        // If has been executed one more time, ignore these results
        // Or we just don't have any results
        return [];
      }

      return results;
    })
  }, {
    key: 'paint',
    value: function paint(textEditor, intentions) {
      var markers = [];

      var _loop = function (intention) {
        var matchedText = textEditor.getTextInBufferRange(intention.range);
        var marker = textEditor.markBufferRange(intention.range);
        var element = (0, _elementsHighlight.create)(intention, matchedText.length);
        intention.created({ textEditor: textEditor, element: element, marker: marker, matchedText: matchedText });
        textEditor.decorateMarker(marker, {
          type: 'overlay',
          position: 'tail',
          item: element
        });
        marker.onDidChange(function (_ref) {
          var start = _ref.newHeadBufferPosition;
          var end = _ref.oldTailBufferPosition;

          element.textContent = _elementsHighlight.PADDING_CHARACTER.repeat(textEditor.getTextInBufferRange([start, end]).length);
        });
        markers.push(marker);
      };

      for (var intention of intentions) {
        _loop(intention);
      }
      return new _atom.Disposable(function () {
        markers.forEach(function (marker) {
          try {
            marker.destroy();
          } catch (_) {/* No Op */}
        });
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.providers.clear();
    }
  }]);

  return ProvidersHighlight;
})();

exports['default'] = ProvidersHighlight;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2ludGVudGlvbnMvbGliL3Byb3ZpZGVycy1oaWdobGlnaHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFFa0MsTUFBTTs7d0JBRTZDLFlBQVk7O2lDQUN0QyxzQkFBc0I7O0lBRzVELGtCQUFrQjtBQUkxQixXQUpRLGtCQUFrQixHQUl2QjswQkFKSyxrQkFBa0I7O0FBS25DLFFBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFBO0FBQ2YsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO0dBQzNCOztlQVBrQixrQkFBa0I7O1dBUTFCLHFCQUFDLFFBQTJCLEVBQUU7QUFDdkMsVUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEVBQUU7QUFDL0IsZ0NBQWlCLFFBQVEsQ0FBQyxDQUFBO0FBQzFCLFlBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO09BQzdCO0tBQ0Y7OztXQUNVLHFCQUFDLFFBQTJCLEVBQVc7QUFDaEQsYUFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUNwQzs7O1dBQ2Esd0JBQUMsUUFBMkIsRUFBRTtBQUMxQyxVQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEVBQUU7QUFDOUIsWUFBSSxDQUFDLFNBQVMsVUFBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO09BQ2hDO0tBQ0Y7Ozs2QkFDWSxXQUFDLFVBQXNCLEVBQWlDO0FBQ25FLFVBQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUN2QyxVQUFNLGNBQWMsR0FBRyxVQUFVLENBQUMsdUJBQXVCLEVBQUUsQ0FBQTs7QUFFM0QsVUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNmLGVBQU8sRUFBRSxDQUFBO09BQ1Y7O0FBRUQsVUFBTSxNQUFNLEdBQUcs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RixjQUFNLENBQUMsV0FBVyxDQUFDLFVBQVMsSUFBNEQsRUFBRTtjQUFyQyxLQUFLLEdBQTlCLElBQTRELENBQTFELHFCQUFxQjtjQUFnQyxHQUFHLEdBQTFELElBQTRELENBQTVCLHFCQUFxQjs7QUFDL0UsaUJBQU8sQ0FBQyxXQUFXLEdBQUcscUNBQWtCLE1BQU0sQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQTtTQUNyRyxDQUFDLENBQUE7QUFDRixlQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBOzs7QUFidEIsV0FBSyxJQUFNLFNBQVMsSUFBSyxVQUFVLEVBQXlCO2NBQWpELFNBQVM7T0FjbkI7QUFDRCxhQUFPLHFCQUFlLFlBQVc7QUFDL0IsZUFBTyxDQUFDLE9BQU8sQ0FBQyxVQUFTLE1BQU0sRUFBRTtBQUMvQixjQUFJO0FBQ0Ysa0JBQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtXQUNqQixDQUFDLE9BQU8sQ0FBQyxFQUFFLGFBQWU7U0FDNUIsQ0FBQyxDQUFBO09BQ0gsQ0FBQyxDQUFBO0tBQ0g7OztXQUNNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtLQUN2Qjs7O1NBbEdrQixrQkFBa0I7OztxQkFBbEIsa0JBQWtCIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2ludGVudGlvbnMvbGliL3Byb3ZpZGVycy1oaWdobGlnaHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBSYW5nZSwgRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgdHlwZSB7IFRleHRFZGl0b3IgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IHsgcHJvdmlkZXIgYXMgdmFsaWRhdGVQcm92aWRlciwgc3VnZ2VzdGlvbnNTaG93IGFzIHZhbGlkYXRlU3VnZ2VzdGlvbnMgfSBmcm9tICcuL3ZhbGlkYXRlJ1xuaW1wb3J0IHsgY3JlYXRlIGFzIGNyZWF0ZUVsZW1lbnQsIFBBRERJTkdfQ0hBUkFDVEVSIH0gZnJvbSAnLi9lbGVtZW50cy9oaWdobGlnaHQnXG5pbXBvcnQgdHlwZSB7IEhpZ2hsaWdodFByb3ZpZGVyLCBIaWdobGlnaHRJdGVtIH0gZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJvdmlkZXJzSGlnaGxpZ2h0IHtcbiAgbnVtYmVyOiBudW1iZXI7XG4gIHByb3ZpZGVyczogU2V0PEhpZ2hsaWdodFByb3ZpZGVyPjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLm51bWJlciA9IDBcbiAgICB0aGlzLnByb3ZpZGVycyA9IG5ldyBTZXQoKVxuICB9XG4gIGFkZFByb3ZpZGVyKHByb3ZpZGVyOiBIaWdobGlnaHRQcm92aWRlcikge1xuICAgIGlmICghdGhpcy5oYXNQcm92aWRlcihwcm92aWRlcikpIHtcbiAgICAgIHZhbGlkYXRlUHJvdmlkZXIocHJvdmlkZXIpXG4gICAgICB0aGlzLnByb3ZpZGVycy5hZGQocHJvdmlkZXIpXG4gICAgfVxuICB9XG4gIGhhc1Byb3ZpZGVyKHByb3ZpZGVyOiBIaWdobGlnaHRQcm92aWRlcik6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnByb3ZpZGVycy5oYXMocHJvdmlkZXIpXG4gIH1cbiAgZGVsZXRlUHJvdmlkZXIocHJvdmlkZXI6IEhpZ2hsaWdodFByb3ZpZGVyKSB7XG4gICAgaWYgKHRoaXMuaGFzUHJvdmlkZXIocHJvdmlkZXIpKSB7XG4gICAgICB0aGlzLnByb3ZpZGVycy5kZWxldGUocHJvdmlkZXIpXG4gICAgfVxuICB9XG4gIGFzeW5jIHRyaWdnZXIodGV4dEVkaXRvcjogVGV4dEVkaXRvcik6IFByb21pc2U8QXJyYXk8SGlnaGxpZ2h0SXRlbT4+IHtcbiAgICBjb25zdCBlZGl0b3JQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKClcbiAgICBjb25zdCBidWZmZXJQb3NpdGlvbiA9IHRleHRFZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuXG4gICAgaWYgKCFlZGl0b3JQYXRoKSB7XG4gICAgICByZXR1cm4gW11cbiAgICB9XG5cbiAgICBjb25zdCBzY29wZXMgPSB0ZXh0RWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKGJ1ZmZlclBvc2l0aW9uKS5nZXRTY29wZXNBcnJheSgpXG4gICAgc2NvcGVzLnB1c2goJyonKVxuXG4gICAgY29uc3QgdmlzaWJsZVJhbmdlID0gUmFuZ2UuZnJvbU9iamVjdChbXG4gICAgICB0ZXh0RWRpdG9yLmJ1ZmZlclBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oW3RleHRFZGl0b3IuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KCksIDBdKSxcbiAgICAgIHRleHRFZGl0b3IuYnVmZmVyUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihbdGV4dEVkaXRvci5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpLCAwXSksXG4gICAgXSlcbiAgICAvLyBTZXR0aW5nIHRoaXMgdG8gaW5maW5pdHkgb24gcHVycG9zZSwgY2F1c2UgdGhlIGJ1ZmZlciBwb3NpdGlvbiBqdXN0IG1hcmtzIHZpc2libGUgY29sdW1uXG4gICAgLy8gYWNjb3JkaW5nIHRvIGVsZW1lbnQgd2lkdGhcbiAgICB2aXNpYmxlUmFuZ2UuZW5kLmNvbHVtbiA9IEluZmluaXR5XG5cbiAgICBjb25zdCBwcm9taXNlcyA9IFtdXG4gICAgdGhpcy5wcm92aWRlcnMuZm9yRWFjaChmdW5jdGlvbihwcm92aWRlcikge1xuICAgICAgaWYgKHNjb3Blcy5zb21lKHNjb3BlID0+IHByb3ZpZGVyLmdyYW1tYXJTY29wZXMuaW5kZXhPZihzY29wZSkgIT09IC0xKSkge1xuICAgICAgICBwcm9taXNlcy5wdXNoKG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgICAgICByZXNvbHZlKHByb3ZpZGVyLmdldEludGVudGlvbnMoeyB0ZXh0RWRpdG9yLCB2aXNpYmxlUmFuZ2UgfSkpXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuICAgICAgICAgIGlmIChhdG9tLmluRGV2TW9kZSgpKSB7XG4gICAgICAgICAgICB2YWxpZGF0ZVN1Z2dlc3Rpb25zKHJlc3VsdHMpXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXN1bHRzXG4gICAgICAgIH0pKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBjb25zdCBudW1iZXIgPSArK3RoaXMubnVtYmVyXG4gICAgY29uc3QgcmVzdWx0cyA9IChhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcykpLnJlZHVjZShmdW5jdGlvbihpdGVtcywgaXRlbSkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoaXRlbSkpIHtcbiAgICAgICAgcmV0dXJuIGl0ZW1zLmNvbmNhdChpdGVtKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGl0ZW1zXG4gICAgfSwgW10pXG5cbiAgICBpZiAobnVtYmVyICE9PSB0aGlzLm51bWJlciB8fCAhcmVzdWx0cy5sZW5ndGgpIHtcbiAgICAgIC8vIElmIGhhcyBiZWVuIGV4ZWN1dGVkIG9uZSBtb3JlIHRpbWUsIGlnbm9yZSB0aGVzZSByZXN1bHRzXG4gICAgICAvLyBPciB3ZSBqdXN0IGRvbid0IGhhdmUgYW55IHJlc3VsdHNcbiAgICAgIHJldHVybiBbXVxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHRzXG4gIH1cbiAgcGFpbnQodGV4dEVkaXRvcjogVGV4dEVkaXRvciwgaW50ZW50aW9uczogQXJyYXk8SGlnaGxpZ2h0SXRlbT4pOiBEaXNwb3NhYmxlIHtcbiAgICBjb25zdCBtYXJrZXJzID0gW11cbiAgICBmb3IgKGNvbnN0IGludGVudGlvbiBvZiAoaW50ZW50aW9uczogQXJyYXk8SGlnaGxpZ2h0SXRlbT4pKSB7XG4gICAgICBjb25zdCBtYXRjaGVkVGV4dCA9IHRleHRFZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoaW50ZW50aW9uLnJhbmdlKVxuICAgICAgY29uc3QgbWFya2VyID0gdGV4dEVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoaW50ZW50aW9uLnJhbmdlKVxuICAgICAgY29uc3QgZWxlbWVudCA9IGNyZWF0ZUVsZW1lbnQoaW50ZW50aW9uLCBtYXRjaGVkVGV4dC5sZW5ndGgpXG4gICAgICBpbnRlbnRpb24uY3JlYXRlZCh7IHRleHRFZGl0b3IsIGVsZW1lbnQsIG1hcmtlciwgbWF0Y2hlZFRleHQgfSlcbiAgICAgIHRleHRFZGl0b3IuZGVjb3JhdGVNYXJrZXIobWFya2VyLCB7XG4gICAgICAgIHR5cGU6ICdvdmVybGF5JyxcbiAgICAgICAgcG9zaXRpb246ICd0YWlsJyxcbiAgICAgICAgaXRlbTogZWxlbWVudCxcbiAgICAgIH0pXG4gICAgICBtYXJrZXIub25EaWRDaGFuZ2UoZnVuY3Rpb24oeyBuZXdIZWFkQnVmZmVyUG9zaXRpb246IHN0YXJ0LCBvbGRUYWlsQnVmZmVyUG9zaXRpb246IGVuZCB9KSB7XG4gICAgICAgIGVsZW1lbnQudGV4dENvbnRlbnQgPSBQQURESU5HX0NIQVJBQ1RFUi5yZXBlYXQodGV4dEVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShbc3RhcnQsIGVuZF0pLmxlbmd0aClcbiAgICAgIH0pXG4gICAgICBtYXJrZXJzLnB1c2gobWFya2VyKVxuICAgIH1cbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoZnVuY3Rpb24oKSB7XG4gICAgICBtYXJrZXJzLmZvckVhY2goZnVuY3Rpb24obWFya2VyKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbWFya2VyLmRlc3Ryb3koKVxuICAgICAgICB9IGNhdGNoIChfKSB7IC8qIE5vIE9wICovIH1cbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMucHJvdmlkZXJzLmNsZWFyKClcbiAgfVxufVxuIl19