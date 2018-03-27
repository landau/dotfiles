Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodash = require('lodash');

var _atomJavaUtil = require('./atomJavaUtil');

var _atomJavaUtil2 = _interopRequireDefault(_atomJavaUtil);

var _javaUtil = require('./javaUtil');

var _javaUtil2 = _interopRequireDefault(_javaUtil);

'use babel';

var AtomAutocompleteProvider = (function () {
  function AtomAutocompleteProvider(classLoader) {
    _classCallCheck(this, AtomAutocompleteProvider);

    this.classLoader = classLoader;

    // settings for autocomplete-plus
    this.selector = '.source.java';
    this.disableForSelector = '.source.java .comment';
  }

  _createClass(AtomAutocompleteProvider, [{
    key: 'configure',
    value: function configure(config) {
      // settings for autocomplete-plus
      this.inclusionPriority = config.inclusionPriority;
      this.excludeLowerPriority = config.excludeLowerPriority;
      this.foldImports = config.foldImports;
    }

    // autocomplete-plus
  }, {
    key: 'getSuggestions',
    value: function getSuggestions(_ref) {
      var _this = this;

      var editor = _ref.editor;
      var bufferPosition = _ref.bufferPosition;
      var origPrefix = _ref.prefix;

      // text: 'package.Class.me', prefix: 'package.Class', suffix: 'me'
      // text: 'package.Cla', prefix: 'package', suffix: 'Cla'
      // text: 'Cla', prefix: '', suffix: 'Cla'
      // line: 'new Cla', text: 'Cla', prevWord: 'new'
      var line = _atomJavaUtil2['default'].getLine(editor, bufferPosition);
      var prevWord = _atomJavaUtil2['default'].getPrevWord(editor, bufferPosition);
      var text = _atomJavaUtil2['default'].getWord(editor, bufferPosition, true).replace('@', '');
      var prefix = text.substring(0, text.lastIndexOf('.'));
      var suffix = origPrefix.replace('.', '');
      var couldBeClass = /^[A-Z]/.test(suffix) || prefix;
      var isInstance = false;

      var results = null;
      if (couldBeClass) {
        var classes = this.classLoader.findClass(text);
        if (prevWord === 'new' && classes && classes.length) {
          // Class constructor suggestions
          results = [];
          _lodash._.each(classes, function (classDesc) {
            _lodash._.each(classDesc.constructors, function (constructor) {
              results.push(constructor);
            });
          });
        } else {
          // Class suggestions
          results = classes;
        }
      }

      if (!results || !results.length) {
        // Find member of a class
        // TODO ugly. refactor.
        var stat = _atomJavaUtil2['default'].determineClassName(editor, bufferPosition, text, prefix, suffix, this.prevReturnType);
        isInstance = stat.isInstance;
        _lodash._.every(stat.classNames, function (className) {
          // methods of this class
          results = _this.classLoader.findClassMember(className, suffix) || [];
          // methods of extending classes
          var superClass = _this.classLoader.findSuperClassName(className);
          while (superClass) {
            var r = _this.classLoader.findClassMember(superClass, suffix);
            if (r) {
              var _results;

              (_results = results).push.apply(_results, _toConsumableArray(r));
            }
            superClass = _this.classLoader.findSuperClassName(superClass);
          }
          return !results.length;
        });
      }

      // Autocomplete-plus filters all duplicates. This is a workaround for that.
      var duplicateWorkaround = {};

      // Map results to autocomplete-plus suggestions
      return _lodash._.map(results, function (desc) {
        var snippet = _this._createSnippet(desc, line, prefix, !isInstance && desc.type !== 'constructor');
        if (!duplicateWorkaround[snippet]) {
          duplicateWorkaround[snippet] = 1;
        }
        var counter = duplicateWorkaround[snippet]++;
        var typeName = couldBeClass ? desc.className : desc.simpleName;
        return {
          snippet: snippet + (counter > 1 ? ' (' + counter + ')' : ''),
          replacementPrefix: isInstance ? suffix : text,
          leftLabel: desc.member ? _this._getFormattedReturnType(desc.member) : typeName,
          type: desc.type !== 'constructor' ? desc.type : 'method',
          desc: desc
        };
      });
    }
  }, {
    key: '_getFormattedReturnType',
    value: function _getFormattedReturnType(member) {
      return member.visibility + ' ' + _javaUtil2['default'].getSimpleName(member.returnType);
    }
  }, {
    key: '_createSnippet',
    value: function _createSnippet(desc, line, prefix, addMemberClass) {
      // TODO use full class name in case of a name conflict
      // Use full class name in case of class import or method with long prefix
      var useFullClassName = desc.type === 'class' ? /^import/.test(line) : prefix.indexOf('.') !== -1;
      var text = useFullClassName ? desc.className : desc.simpleName;
      if (desc.member) {
        text = (addMemberClass ? '${1:' + text + '}.' : '') + this._createMemberSnippet(desc.member, desc.type);
      }
      return text;
    }
  }, {
    key: '_createMemberSnippet',
    value: function _createMemberSnippet(member, type) {
      var snippet = null;
      if (!member.params) {
        snippet = type === 'property' ? member.name : member.name + '()';
      } else {
        (function () {
          var index = 2;
          var params = _lodash._.map(member.params, function (param) {
            return '${' + index++ + ':' + _javaUtil2['default'].getSimpleName(param) + '}';
          });
          snippet = _lodash._.reduce(params, function (result, param) {
            return result + param + ', ';
          }, member.name + '(').replace(/, $/, ')');
          snippet = snippet + '${' + index + ':}';
        })();
      }
      return snippet;
    }

    // autocomplete-plus
  }, {
    key: 'onDidInsertSuggestion',
    value: function onDidInsertSuggestion(_ref2) {
      var editor = _ref2.editor;
      var suggestion = _ref2.suggestion;

      if (suggestion.type === 'class') {
        // Add import statement if simple class name was used as a completion text
        if (suggestion.snippet.indexOf('.') === -1) {
          _atomJavaUtil2['default'].importClass(editor, suggestion.desc.className, this.foldImports);
        }
      } else if (suggestion.desc.member) {
        // Save snippet return type for later use (type determination)
        this.prevReturnType = suggestion.desc.member.returnType;
      }
      this.classLoader.touch(suggestion.desc);
    }
  }]);

  return AtomAutocompleteProvider;
})();

exports.AtomAutocompleteProvider = AtomAutocompleteProvider;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qYXZhL2xpYi9BdG9tQXV0b2NvbXBsZXRlUHJvdmlkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O3NCQUVrQixRQUFROzs0QkFDRCxnQkFBZ0I7Ozs7d0JBQ3BCLFlBQVk7Ozs7QUFKakMsV0FBVyxDQUFDOztJQU1DLHdCQUF3QjtBQUV4QixXQUZBLHdCQUF3QixDQUV2QixXQUFXLEVBQUU7MEJBRmQsd0JBQXdCOztBQUdqQyxRQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQzs7O0FBRy9CLFFBQUksQ0FBQyxRQUFRLEdBQUcsY0FBYyxDQUFDO0FBQy9CLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyx1QkFBdUIsQ0FBQztHQUNuRDs7ZUFSVSx3QkFBd0I7O1dBVTFCLG1CQUFDLE1BQU0sRUFBRTs7QUFFaEIsVUFBSSxDQUFDLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQztBQUNsRCxVQUFJLENBQUMsb0JBQW9CLEdBQUcsTUFBTSxDQUFDLG9CQUFvQixDQUFDO0FBQ3hELFVBQUksQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQztLQUN2Qzs7Ozs7V0FHYSx3QkFBQyxJQUE0QyxFQUFFOzs7VUFBN0MsTUFBTSxHQUFQLElBQTRDLENBQTNDLE1BQU07VUFBRSxjQUFjLEdBQXZCLElBQTRDLENBQW5DLGNBQWM7VUFBVSxVQUFVLEdBQTNDLElBQTRDLENBQW5CLE1BQU07Ozs7OztBQUs1QyxVQUFNLElBQUksR0FBRywwQkFBYSxPQUFPLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBQzFELFVBQU0sUUFBUSxHQUFHLDBCQUFhLFdBQVcsQ0FBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFDbEUsVUFBTSxJQUFJLEdBQUcsMEJBQWEsT0FBTyxDQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUUsSUFBSSxD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QUFJLEtBQUssT0FBTyxFQUFFOztBQUUvQixZQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQzFDLG9DQUFhLFdBQVcsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQ3hELElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUNyQjtPQUNGLE1BQU0sSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTs7QUFFakMsWUFBSSxDQUFDLGNBQWMsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7T0FDekQ7QUFDRCxVQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDekM7OztTQS9JVSx3QkFBd0IiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLWphdmEvbGliL0F0b21BdXRvY29tcGxldGVQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBfIH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBhdG9tSmF2YVV0aWwgZnJvbSAnLi9hdG9tSmF2YVV0aWwnO1xuaW1wb3J0IGphdmFVdGlsIGZyb20gJy4vamF2YVV0aWwnO1xuXG5leHBvcnQgY2xhc3MgQXRvbUF1dG9jb21wbGV0ZVByb3ZpZGVyIHtcblxuICBjb25zdHJ1Y3RvcihjbGFzc0xvYWRlcikge1xuICAgIHRoaXMuY2xhc3NMb2FkZXIgPSBjbGFzc0xvYWRlcjtcblxuICAgIC8vIHNldHRpbmdzIGZvciBhdXRvY29tcGxldGUtcGx1c1xuICAgIHRoaXMuc2VsZWN0b3IgPSAnLnNvdXJjZS5qYXZhJztcbiAgICB0aGlzLmRpc2FibGVGb3JTZWxlY3RvciA9ICcuc291cmNlLmphdmEgLmNvbW1lbnQnO1xuICB9XG5cbiAgY29uZmlndXJlKGNvbmZpZykge1xuICAgIC8vIHNldHRpbmdzIGZvciBhdXRvY29tcGxldGUtcGx1c1xuICAgIHRoaXMuaW5jbHVzaW9uUHJpb3JpdHkgPSBjb25maWcuaW5jbHVzaW9uUHJpb3JpdHk7XG4gICAgdGhpcy5leGNsdWRlTG93ZXJQcmlvcml0eSA9IGNvbmZpZy5leGNsdWRlTG93ZXJQcmlvcml0eTtcbiAgICB0aGlzLmZvbGRJbXBvcnRzID0gY29uZmlnLmZvbGRJbXBvcnRzO1xuICB9XG5cbiAgLy8gYXV0b2NvbXBsZXRlLXBsdXNcbiAgZ2V0U3VnZ2VzdGlvbnMoe2VkaXRvciwgYnVmZmVyUG9zaXRpb24sIHByZWZpeDogb3JpZ1ByZWZpeH0pIHtcbiAgICAvLyB0ZXh0OiAncGFja2FnZS5DbGFzcy5tZScsIHByZWZpeDogJ3BhY2thZ2UuQ2xhc3MnLCBzdWZmaXg6ICdtZSdcbiAgICAvLyB0ZXh0OiAncGFja2FnZS5DbGEnLCBwcmVmaXg6ICdwYWNrYWdlJywgc3VmZml4OiAnQ2xhJ1xuICAgIC8vIHRleHQ6ICdDbGEnLCBwcmVmaXg6ICcnLCBzdWZmaXg6ICdDbGEnXG4gICAgLy8gbGluZTogJ25ldyBDbGEnLCB0ZXh0OiAnQ2xhJywgcHJldldvcmQ6ICduZXcnXG4gICAgY29uc3QgbGluZSA9IGF0b21KYXZhVXRpbC5nZXRMaW5lKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pO1xuICAgIGNvbnN0IHByZXZXb3JkID0gYXRvbUphdmFVdGlsLmdldFByZXZXb3JkKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pO1xuICAgIGNvbnN0IHRleHQgPSBhdG9tSmF2YVV0aWwuZ2V0V29yZChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCB0cnVlKVxuICAgIC5yZXBsYWNlKCdAJywgJycpO1xuICAgIGNvbnN0IHByZWZpeCA9IHRleHQuc3Vic3RyaW5nKDAsIHRleHQubGFzdEluZGV4T2YoJy4nKSk7XG4gICAgY29uc3Qgc3VmZml4ID0gb3JpZ1ByZWZpeC5yZXBsYWNlKCcuJywgJycpO1xuICAgIGNvbnN0IGNvdWxkQmVDbGFzcyA9IC9eW0EtWl0vLnRlc3Qoc3VmZml4KSB8fCBwcmVmaXg7XG4gICAgbGV0IGlzSW5zdGFuY2UgPSBmYWxzZTtcblxuICAgIGxldCByZXN1bHRzID0gbnVsbDtcbiAgICBpZiAoY291bGRCZUNsYXNzKSB7XG4gICAgICBjb25zdCBjbGFzc2VzID0gdGhpcy5jbGFzc0xvYWRlci5maW5kQ2xhc3ModGV4dCk7XG4gICAgICBpZiAocHJldldvcmQgPT09ICduZXcnICYmIGNsYXNzZXMgJiYgY2xhc3Nlcy5sZW5ndGgpIHtcbiAgICAgICAgLy8gQ2xhc3MgY29uc3RydWN0b3Igc3VnZ2VzdGlvbnNcbiAgICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgICBfLmVhY2goY2xhc3NlcywgY2xhc3NEZXNjID0+IHtcbiAgICAgICAgICBfLmVhY2goY2xhc3NEZXNjLmNvbnN0cnVjdG9ycywgY29uc3RydWN0b3IgPT4ge1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGNvbnN0cnVjdG9yKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBDbGFzcyBzdWdnZXN0aW9uc1xuICAgICAgICByZXN1bHRzID0gY2xhc3NlcztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoKCFyZXN1bHRzIHx8ICFyZXN1bHRzLmxlbmd0aCkpIHtcbiAgICAgIC8vIEZpbmQgbWVtYmVyIG9mIGEgY2xhc3NcbiAgICAgIC8vIFRPRE8gdWdseS4gcmVmYWN0b3IuXG4gICAgICBjb25zdCBzdGF0ID0gYXRvbUphdmFVdGlsLmRldGVybWluZUNsYXNzTmFtZShlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLFxuICAgICAgICB0ZXh0LCBwcmVmaXgsIHN1ZmZpeCwgdGhpcy5wcmV2UmV0dXJuVHlwZSk7XG4gICAgICBpc0luc3RhbmNlID0gc3RhdC5pc0luc3RhbmNlO1xuICAgICAgXy5ldmVyeShzdGF0LmNsYXNzTmFtZXMsIGNsYXNzTmFtZSA9PiB7XG4gICAgICAgIC8vIG1ldGhvZHMgb2YgdGhpcyBjbGFzc1xuICAgICAgICByZXN1bHRzID0gdGhpcy5jbGFzc0xvYWRlci5maW5kQ2xhc3NNZW1iZXIoY2xhc3NOYW1lLCBzdWZmaXgpIHx8IFtdO1xuICAgICAgICAvLyBtZXRob2RzIG9mIGV4dGVuZGluZyBjbGFzc2VzXG4gICAgICAgIGxldCBzdXBlckNsYXNzID0gdGhpcy5jbGFzc0xvYWRlci5maW5kU3VwZXJDbGFzc05hbWUoY2xhc3NOYW1lKTtcbiAgICAgICAgd2hpbGUgKHN1cGVyQ2xhc3MpIHtcbiAgICAgICAgICBjb25zdCByID0gdGhpcy5jbGFzc0xvYWRlci5maW5kQ2xhc3NNZW1iZXIoc3VwZXJDbGFzcywgc3VmZml4KTtcbiAgICAgICAgICBpZiAocikge1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKC4uLnIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzdXBlckNsYXNzID0gdGhpcy5jbGFzc0xvYWRlci5maW5kU3VwZXJDbGFzc05hbWUoc3VwZXJDbGFzcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICFyZXN1bHRzLmxlbmd0aDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIEF1dG9jb21wbGV0ZS1wbHVzIGZpbHRlcnMgYWxsIGR1cGxpY2F0ZXMuIFRoaXMgaXMgYSB3b3JrYXJvdW5kIGZvciB0aGF0LlxuICAgIGNvbnN0IGR1cGxpY2F0ZVdvcmthcm91bmQgPSB7fTtcblxuICAgIC8vIE1hcCByZXN1bHRzIHRvIGF1dG9jb21wbGV0ZS1wbHVzIHN1Z2dlc3Rpb25zXG4gICAgcmV0dXJuIF8ubWFwKHJlc3VsdHMsIChkZXNjKSA9PiB7XG4gICAgICBjb25zdCBzbmlwcGV0ID0gdGhpcy5fY3JlYXRlU25pcHBldChkZXNjLCBsaW5lLCBwcmVmaXgsXG4gICAgICAgICFpc0luc3RhbmNlICYmIGRlc2MudHlwZSAhPT0gJ2NvbnN0cnVjdG9yJyk7XG4gICAgICBpZiAoIWR1cGxpY2F0ZVdvcmthcm91bmRbc25pcHBldF0pIHtcbiAgICAgICAgZHVwbGljYXRlV29ya2Fyb3VuZFtzbmlwcGV0XSA9IDE7XG4gICAgICB9XG4gICAgICBjb25zdCBjb3VudGVyID0gZHVwbGljYXRlV29ya2Fyb3VuZFtzbmlwcGV0XSsrO1xuICAgICAgY29uc3QgdHlwZU5hbWUgPSAoY291bGRCZUNsYXNzID8gZGVzYy5jbGFzc05hbWUgOiBkZXNjLnNpbXBsZU5hbWUpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc25pcHBldDogc25pcHBldCArIChjb3VudGVyID4gMSA/ICcgKCcgKyBjb3VudGVyICsgJyknIDogJycpLFxuICAgICAgICByZXBsYWNlbWVudFByZWZpeDogaXNJbnN0YW5jZSA/IHN1ZmZpeCA6IHRleHQsXG4gICAgICAgIGxlZnRMYWJlbDogZGVzYy5tZW1iZXJcbiAgICAgICAgPyB0aGlzLl9nZXRGb3JtYXR0ZWRSZXR1cm5UeXBlKGRlc2MubWVtYmVyKVxuICAgICAgICA6IHR5cGVOYW1lLFxuICAgICAgICB0eXBlOiBkZXNjLnR5cGUgIT09ICdjb25zdHJ1Y3RvcicgPyBkZXNjLnR5cGUgOiAnbWV0aG9kJyxcbiAgICAgICAgZGVzYzogZGVzYyxcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBfZ2V0Rm9ybWF0dGVkUmV0dXJuVHlwZShtZW1iZXIpIHtcbiAgICByZXR1cm4gbWVtYmVyLnZpc2liaWxpdHkgKyAnICcgKyBqYXZhVXRpbC5nZXRTaW1wbGVOYW1lKG1lbWJlci5yZXR1cm5UeXBlKTtcbiAgfVxuXG4gIF9jcmVhdGVTbmlwcGV0KGRlc2MsIGxpbmUsIHByZWZpeCwgYWRkTWVtYmVyQ2xhc3MpIHtcbiAgICAvLyBUT0RPIHVzZSBmdWxsIGNsYXNzIG5hbWUgaW4gY2FzZSBvZiBhIG5hbWUgY29uZmxpY3RcbiAgICAvLyBVc2UgZnVsbCBjbGFzcyBuYW1lIGluIGNhc2Ugb2YgY2xhc3MgaW1wb3J0IG9yIG1ldGhvZCB3aXRoIGxvbmcgcHJlZml4XG4gICAgY29uc3QgdXNlRnVsbENsYXNzTmFtZSA9XG4gICAgICBkZXNjLnR5cGUgPT09ICdjbGFzcycgPyAvXmltcG9ydC8udGVzdChsaW5lKSA6IHByZWZpeC5pbmRleE9mKCcuJykgIT09IC0xO1xuICAgIGxldCB0ZXh0ID0gdXNlRnVsbENsYXNzTmFtZSA/IGRlc2MuY2xhc3NOYW1lIDogZGVzYy5zaW1wbGVOYW1lO1xuICAgIGlmIChkZXNjLm1lbWJlcikge1xuICAgICAgdGV4dCA9IChhZGRNZW1iZXJDbGFzcyA/ICckezE6JyArIHRleHQgKyAnfS4nIDogJycpICtcbiAgICAgICAgdGhpcy5fY3JlYXRlTWVtYmVyU25pcHBldChkZXNjLm1lbWJlciwgZGVzYy50eXBlKTtcbiAgICB9XG4gICAgcmV0dXJuIHRleHQ7XG4gIH1cblxuICBfY3JlYXRlTWVtYmVyU25pcHBldChtZW1iZXIsIHR5cGUpIHtcbiAgICBsZXQgc25pcHBldCA9IG51bGw7XG4gICAgaWYgKCFtZW1iZXIucGFyYW1zKSB7XG4gICAgICBzbmlwcGV0ID0gKHR5cGUgPT09ICdwcm9wZXJ0eScpXG4gICAgICAgID8gbWVtYmVyLm5hbWUgOiBtZW1iZXIubmFtZSArICcoKSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBpbmRleCA9IDI7XG4gICAgICBjb25zdCBwYXJhbXMgPSBfLm1hcChtZW1iZXIucGFyYW1zLCAocGFyYW0pID0+IHtcbiAgICAgICAgcmV0dXJuICckeycgKyAoaW5kZXgrKykgKyAnOicgKyBqYXZhVXRpbC5nZXRTaW1wbGVOYW1lKHBhcmFtKSArICd9JztcbiAgICAgIH0pO1xuICAgICAgc25pcHBldCA9IF8ucmVkdWNlKHBhcmFtcywgKHJlc3VsdCwgcGFyYW0pID0+IHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdCArIHBhcmFtICsgJywgJztcbiAgICAgIH0sIG1lbWJlci5uYW1lICsgJygnKS5yZXBsYWNlKC8sICQvLCAnKScpO1xuICAgICAgc25pcHBldCA9IHNuaXBwZXQgKyAnJHsnICsgaW5kZXggKyAnOn0nO1xuICAgIH1cbiAgICByZXR1cm4gc25pcHBldDtcbiAgfVxuXG4gIC8vIGF1dG9jb21wbGV0ZS1wbHVzXG4gIG9uRGlkSW5zZXJ0U3VnZ2VzdGlvbih7ZWRpdG9yLCBzdWdnZXN0aW9ufSkge1xuICAgIGlmIChzdWdnZXN0aW9uLnR5cGUgPT09ICdjbGFzcycpIHtcbiAgICAgIC8vIEFkZCBpbXBvcnQgc3RhdGVtZW50IGlmIHNpbXBsZSBjbGFzcyBuYW1lIHdhcyB1c2VkIGFzIGEgY29tcGxldGlvbiB0ZXh0XG4gICAgICBpZiAoc3VnZ2VzdGlvbi5zbmlwcGV0LmluZGV4T2YoJy4nKSA9PT0gLTEpIHtcbiAgICAgICAgYXRvbUphdmFVdGlsLmltcG9ydENsYXNzKGVkaXRvciwgc3VnZ2VzdGlvbi5kZXNjLmNsYXNzTmFtZSxcbiAgICAgICAgICB0aGlzLmZvbGRJbXBvcnRzKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHN1Z2dlc3Rpb24uZGVzYy5tZW1iZXIpIHtcbiAgICAgIC8vIFNhdmUgc25pcHBldCByZXR1cm4gdHlwZSBmb3IgbGF0ZXIgdXNlICh0eXBlIGRldGVybWluYXRpb24pXG4gICAgICB0aGlzLnByZXZSZXR1cm5UeXBlID0gc3VnZ2VzdGlvbi5kZXNjLm1lbWJlci5yZXR1cm5UeXBlO1xuICAgIH1cbiAgICB0aGlzLmNsYXNzTG9hZGVyLnRvdWNoKHN1Z2dlc3Rpb24uZGVzYyk7XG4gIH1cblxufVxuIl19