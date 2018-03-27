Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodash = require('lodash');

var _javaUtil = require('./javaUtil');

var _javaUtil2 = _interopRequireDefault(_javaUtil);

'use babel';

var AtomJavaUtil = (function () {
  function AtomJavaUtil() {
    _classCallCheck(this, AtomJavaUtil);
  }

  _createClass(AtomJavaUtil, [{
    key: 'getCurrentPackageName',
    value: function getCurrentPackageName(editor) {
      return this._lastMatch(editor.getText(), /package ([^;]*);/);
    }
  }, {
    key: 'getCurrentClassSimpleName',
    value: function getCurrentClassSimpleName(editor) {
      return editor.getTitle().split('.')[0];
    }
  }, {
    key: 'getCurrentClassName',
    value: function getCurrentClassName(editor) {
      return this.getCurrentPackageName(editor) + '.' + this.getCurrentClassName(editor);
    }
  }, {
    key: 'getImportedClassName',
    value: function getImportedClassName(editor, classSimpleName) {
      return this._lastMatch(editor.getText(), new RegExp('import (.*' + classSimpleName + ');'));
    }
  }, {
    key: 'getPossibleClassNames',
    value: function getPossibleClassNames(editor, classSimpleName, prefix) {
      var classNames = [];
      var className = this.getImportedClassName(editor, classSimpleName);
      if (className) {
        classNames.push(className);
      } else {
        if (prefix.indexOf('.') === -1) {
          // Use package name of current file or 'java.lang'
          classNames.push(this.getCurrentPackageName(editor) + '.' + classSimpleName);
          classNames.push('java.lang.' + classSimpleName);
        } else {
          // Use the whole prefix as classname
          classNames.push(prefix);
        }
      }
      return classNames;
    }
  }, {
    key: 'getLine',
    value: function getLine(editor, bufferPosition) {
      return editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
    }
  }, {
    key: 'getWord',
    value: function getWord(editor, bufferPosition, removeParenthesis) {
      var line = this.getLine(editor, bufferPosition);
      return this.getLastWord(line, removeParenthesis);
    }
  }, {
    key: 'getLastWord',
    value: function getLastWord(line, removeParenthesis) {
      var result = this._lastMatch(line, /[^\s-]+$/);
      return removeParenthesis ? result.replace(/.*\(/, '') : result;
    }
  }, {
    key: 'getPrevWord',
    value: function getPrevWord(editor, bufferPosition) {
      var words = this.getLine(editor, bufferPosition).split(/[\s\(]+/);
      return words.length >= 2 ? words[words.length - 2] : null;
    }
  }, {
    key: 'importClass',
    value: function importClass(editor, className, foldImports) {
      // Add import statement if import does not already exist.
      // But do not import if class belongs in java.lang or current package.
      var packageName = _javaUtil2['default'].getPackageName(className);
      if (!this.getImportedClassName(editor, className) && packageName !== 'java.lang' && packageName !== this.getCurrentPackageName(editor)) {
        this.organizeImports(editor, 'import ' + className + ';', foldImports);
      }
    }
  }, {
    key: 'getImports',
    value: function getImports(editor) {
      var buffer = editor.getBuffer();
      return buffer.getText().match(/import\s.*;/g) || [];
    }
  }, {
    key: 'organizeImports',
    value: function organizeImports(editor, newImport, foldImports) {
      var _this = this;

      var buffer = editor.getBuffer();
      buffer.transact(function () {
        // Get current imports
        var imports = _this.getImports(editor);
        if (newImport) {
          imports.push(newImport);
        }
        // Remove current imports
        buffer.replace(/import\s.*;[\r\n]+/g, '');
        // Add sorted imports
        buffer.insert([1, 0], '\n');
        _lodash._.each(_lodash._.sortBy(imports), function (value, index) {
          buffer.insert([index + 2, 0], value + '\n');
        });

        if (foldImports) {
          _this.foldImports(editor);
        }
      });
    }
  }, {
    key: 'foldImports',
    value: function foldImports(editor) {
      var firstRow = 0;
      var lastRow = 0;
      var buffer = editor.getBuffer();
      buffer.scan(/import\s.*;/g, function (m) {
        lastRow = m.range.end.row;
      });

      if (lastRow) {
        var pos = editor.getCursorBufferPosition();
        editor.setSelectedBufferRange([[firstRow, 0], [lastRow, 0]]);
        editor.foldSelectedLines();
        editor.setCursorBufferPosition(pos);
      }
    }
  }, {
    key: 'determineClassName',
    value: function determineClassName(editor, bufferPosition, text, prefix, suffix, prevReturnType) {
      try {
        var classNames = null;
        var isInstance = /\)$/.test(prefix);

        var classSimpleName = null;

        // Determine class name
        if (!prefix || prefix === 'this') {
          // Use this as class name
          classSimpleName = this.getCurrentClassSimpleName(editor);
          isInstance = true;
        } else if (prefix) {
          // Get class name from prefix
          // Also support '((ClassName)var)' syntax (a quick hack)
          classSimpleName = this.getWord(editor, bufferPosition).indexOf('((') !== -1 ? prefix.match(/[^\)]*/)[0] : prefix;
        }

        if (!this._isValidClassName(classSimpleName) && !/[\.\)]/.test(prefix)) {
          // Find class name by a variable name given as prefix
          // TODO traverse brackets backwards to match correct scope (with regexp)
          // TODO handle 'this.varName' correctly
          classSimpleName = this._lastMatch(editor.getTextInRange([[bufferPosition.row - 25, 0], bufferPosition]), new RegExp('([A-Z][a-zA-Z0-9_]*)(<[A-Z][a-zA-Z0-9_<>, ]*>)?\\s' + prefix + '[,;=\\s\\)]', 'g'));
          classSimpleName = classSimpleName.replace(new RegExp('\\s+' + prefix + '[,;=\\s\\)]$'), '');
          classSimpleName = classSimpleName.replace(/\<.*\>/, '');

          isInstance = true;
        }

        if (this._isValidClassName(classSimpleName)) {
          // Convert simple name to a full class name and use that
          classNames = this.getPossibleClassNames(editor, classSimpleName, prefix);
        } else {
          // Just use return type of previous snippet (a quick hack)
          // TODO determine type using classloader
          classNames = [prevReturnType];
          isInstance = true;
        }

        return { classNames: classNames, isInstance: isInstance };
      } catch (err) {
        console.error(err);
        return {};
      }
    }
  }, {
    key: '_isValidClassName',
    value: function _isValidClassName(text) {
      return (/^[A-Z][^\.\)]*$/.test(text) || /\.[A-Z][^\.\)]*$/.test(text)
      );
    }
  }, {
    key: '_lastMatch',
    value: function _lastMatch(str, regex) {
      var array = str.match(regex) || [''];
      return array[array.length - 1];
    }
  }]);

  return AtomJavaUtil;
})();

exports['default'] = new AtomJavaUtil();
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qYXZhL2xpYi9hdG9tSmF2YVV0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztzQkFFa0IsUUFBUTs7d0JBQ0wsWUFBWTs7OztBQUhqQyxXQUFXLENBQUM7O0lBS04sWUFBWTtXQUFaLFlBQVk7MEJBQVosWUFBWTs7O2VBQVosWUFBWTs7V0FFSywrQkFBQyxNQUFNLEVBQUU7QUFDNUIsYUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0tBQzlEOzs7V0FFd0IsbUNBQUMsTUFBTSxFQUFFO0FBQ2hDLGFBQU8sTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN4Qzs7O1dBRWtCLDZCQUFDLE1BQU0sRUFBRTtBQUMxQixhQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQzNDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUN0Qzs7O1dBRW1CLDhCQUFDLE1BQU0sRUFBRSxlQUFlLEVBQUU7QUFDNUMsYUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFDckMsSUFBSSxNQUFNLENBQUMsWUFBWSxHQUFHLGVBQWUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQ3REOzs7V0FFb0IsK0JBQUMsTUFBTSxFQUFFLGVBQWUsRUFBRSxNQUFNLEVBQUU7QUFDckQsVUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLFVBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLEVBQUUsZUFBZSxDQUFDLENBQUM7QUFDckUsVUFBSSxTQUFTLEVBQUU7QUFDYixrQkFBVSxDQUFDLElBQUksQ0FBQyxT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QUcsZUFBZSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7O0FBRXhELG9CQUFVLEdBQUcsSUFBSSxDQUFDO1NBQ25COztBQUVELFlBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxFQUFFOztBQUUzQyxvQkFBVSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLEVBQUUsZUFBZSxFQUM3RCxNQUFNLENBQUMsQ0FBQztTQUNYLE1BQU07OztBQUdMLG9CQUFVLEdBQUcsQ0FBRSxjQUFjLENBQUUsQ0FBQztBQUNoQyxvQkFBVSxHQUFHLElBQUksQ0FBQztTQUNuQjs7QUFFRCxlQUFPLEVBQUUsVUFBVSxFQUFWLFVBQVUsRUFBRSxVQUFVLEVBQVYsVUFBVSxFQUFFLENBQUM7T0FDbkMsQ0FBQyxPQUFPLEdBQUcsRUFBRTtBQUNaLGVBQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbkIsZUFBTyxFQUFFLENBQUM7T0FDWDtLQUNGOzs7V0FFZ0IsMkJBQUMsSUFBSSxFQUFFO0FBQ3RCLGFBQU8sa0JBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7UUFBQztLQUN0RTs7O1dBRVMsb0JBQUMsR0FBRyxFQUFFLEtBQUssRUFBRTtBQUNyQixVQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdkMsYUFBTyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztLQUNoQzs7O1NBN0tHLFlBQVk7OztxQkFpTEgsSUFBSSxZQUFZLEVBQUUiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLWphdmEvbGliL2F0b21KYXZhVXRpbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBfIH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCBqYXZhVXRpbCBmcm9tICcuL2phdmFVdGlsJztcblxuY2xhc3MgQXRvbUphdmFVdGlsIHtcblxuICBnZXRDdXJyZW50UGFja2FnZU5hbWUoZWRpdG9yKSB7XG4gICAgcmV0dXJuIHRoaXMuX2xhc3RNYXRjaChlZGl0b3IuZ2V0VGV4dCgpLCAvcGFja2FnZSAoW147XSopOy8pO1xuICB9XG5cbiAgZ2V0Q3VycmVudENsYXNzU2ltcGxlTmFtZShlZGl0b3IpIHtcbiAgICByZXR1cm4gZWRpdG9yLmdldFRpdGxlKCkuc3BsaXQoJy4nKVswXTtcbiAgfVxuXG4gIGdldEN1cnJlbnRDbGFzc05hbWUoZWRpdG9yKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Q3VycmVudFBhY2thZ2VOYW1lKGVkaXRvcikgKyAnLidcbiAgICAgICsgdGhpcy5nZXRDdXJyZW50Q2xhc3NOYW1lKGVkaXRvcik7XG4gIH1cblxuICBnZXRJbXBvcnRlZENsYXNzTmFtZShlZGl0b3IsIGNsYXNzU2ltcGxlTmFtZSkge1xuICAgIHJldHVybiB0aGlzLl9sYXN0TWF0Y2goZWRpdG9yLmdldFRleHQoKSxcbiAgICAgIG5ldyBSZWdFeHAoJ2ltcG9ydCAoLionICsgY2xhc3NTaW1wbGVOYW1lICsgJyk7JykpO1xuICB9XG5cbiAgZ2V0UG9zc2libGVDbGFzc05hbWVzKGVkaXRvciwgY2xhc3NTaW1wbGVOYW1lLCBwcmVmaXgpIHtcbiAgICBjb25zdCBjbGFzc05hbWVzID0gW107XG4gICAgY29uc3QgY2xhc3NOYW1lID0gdGhpcy5nZXRJbXBvcnRlZENsYXNzTmFtZShlZGl0b3IsIGNsYXNzU2ltcGxlTmFtZSk7XG4gICAgaWYgKGNsYXNzTmFtZSkge1xuICAgICAgY2xhc3NOYW1lcy5wdXNoKGNsYXNzTmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChwcmVmaXguaW5kZXhPZignLicpID09PSAtMSkge1xuICAgICAgICAvLyBVc2UgcGFja2FnZSBuYW1lIG9mIGN1cnJlbnQgZmlsZSBvciAnamF2YS5sYW5nJ1xuICAgICAgICBjbGFzc05hbWVzLnB1c2godGhpcy5nZXRDdXJyZW50UGFja2FnZU5hbWUoZWRpdG9yKSArXG4gICAgICAgICAgJy4nICsgY2xhc3NTaW1wbGVOYW1lKTtcbiAgICAgICAgY2xhc3NOYW1lcy5wdXNoKCdqYXZhLmxhbmcuJyArIGNsYXNzU2ltcGxlTmFtZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBVc2UgdGhlIHdob2xlIHByZWZpeCBhcyBjbGFzc25hbWVcbiAgICAgICAgY2xhc3NOYW1lcy5wdXNoKHByZWZpeCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjbGFzc05hbWVzO1xuICB9XG5cbiAgZ2V0TGluZShlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKSB7XG4gICAgcmV0dXJuIGVkaXRvci5nZXRUZXh0SW5SYW5nZShbW2J1ZmZlclBvc2l0aW9uLnJvdywgMF0sIGJ1ZmZlclBvc2l0aW9uXSk7XG4gIH1cblxuICBnZXRXb3JkKGVkaXRvciwgYnVmZmVyUG9zaXRpb24sIHJlbW92ZVBhcmVudGhlc2lzKSB7XG4gICAgY29uc3QgbGluZSA9IHRoaXMuZ2V0TGluZShlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKTtcbiAgICByZXR1cm4gdGhpcy5nZXRMYXN0V29yZChsaW5lLCByZW1vdmVQYXJlbnRoZXNpcyk7XG4gIH1cblxuICBnZXRMYXN0V29yZChsaW5lLCByZW1vdmVQYXJlbnRoZXNpcykge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuX2xhc3RNYXRjaChsaW5lLCAvW15cXHMtXSskLyk7XG4gICAgcmV0dXJuIHJlbW92ZVBhcmVudGhlc2lzID8gcmVzdWx0LnJlcGxhY2UoLy4qXFwoLywgJycpIDogcmVzdWx0O1xuICB9XG5cbiAgZ2V0UHJldldvcmQoZWRpdG9yLCBidWZmZXJQb3NpdGlvbikge1xuICAgIGNvbnN0IHdvcmRzID0gdGhpcy5nZXRMaW5lKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pLnNwbGl0KC9bXFxzXFwoXSsvKTtcbiAgICByZXR1cm4gd29yZHMubGVuZ3RoID49IDIgPyB3b3Jkc1t3b3Jkcy5sZW5ndGggLSAyXSA6IG51bGw7XG4gIH1cblxuICBpbXBvcnRDbGFzcyhlZGl0b3IsIGNsYXNzTmFtZSwgZm9sZEltcG9ydHMpIHtcbiAgICAvLyBBZGQgaW1wb3J0IHN0YXRlbWVudCBpZiBpbXBvcnQgZG9lcyBub3QgYWxyZWFkeSBleGlzdC5cbiAgICAvLyBCdXQgZG8gbm90IGltcG9ydCBpZiBjbGFzcyBiZWxvbmdzIGluIGphdmEubGFuZyBvciBjdXJyZW50IHBhY2thZ2UuXG4gICAgY29uc3QgcGFja2FnZU5hbWUgPSBqYXZhVXRpbC5nZXRQYWNrYWdlTmFtZShjbGFzc05hbWUpO1xuICAgIGlmICghdGhpcy5nZXRJbXBvcnRlZENsYXNzTmFtZShlZGl0b3IsIGNsYXNzTmFtZSkgJiZcbiAgICAgICAgcGFja2FnZU5hbWUgIT09ICdqYXZhLmxhbmcnICYmXG4gICAgICAgIHBhY2thZ2VOYW1lICE9PSB0aGlzLmdldEN1cnJlbnRQYWNrYWdlTmFtZShlZGl0b3IpKSB7XG4gICAgICB0aGlzLm9yZ2FuaXplSW1wb3J0cyhlZGl0b3IsICdpbXBvcnQgJyArIGNsYXNzTmFtZSArICc7JywgZm9sZEltcG9ydHMpO1xuICAgIH1cbiAgfVxuXG4gIGdldEltcG9ydHMoZWRpdG9yKSB7XG4gICAgY29uc3QgYnVmZmVyID0gZWRpdG9yLmdldEJ1ZmZlcigpO1xuICAgIHJldHVybiBidWZmZXIuZ2V0VGV4dCgpLm1hdGNoKC9pbXBvcnRcXHMuKjsvZykgfHwgW107XG4gIH1cblxuICBvcmdhbml6ZUltcG9ydHMoZWRpdG9yLCBuZXdJbXBvcnQsIGZvbGRJbXBvcnRzKSB7XG4gICAgY29uc3QgYnVmZmVyID0gZWRpdG9yLmdldEJ1ZmZlcigpO1xuICAgIGJ1ZmZlci50cmFuc2FjdCgoKSA9PiB7XG4gICAgICAvLyBHZXQgY3VycmVudCBpbXBvcnRzXG4gICAgICBjb25zdCBpbXBvcnRzID0gdGhpcy5nZXRJbXBvcnRzKGVkaXRvcik7XG4gICAgICBpZiAobmV3SW1wb3J0KSB7XG4gICAgICAgIGltcG9ydHMucHVzaChuZXdJbXBvcnQpO1xuICAgICAgfVxuICAgICAgLy8gUmVtb3ZlIGN1cnJlbnQgaW1wb3J0c1xuICAgICAgYnVmZmVyLnJlcGxhY2UoL2ltcG9ydFxccy4qO1tcXHJcXG5dKy9nLCAnJyk7XG4gICAgICAvLyBBZGQgc29ydGVkIGltcG9ydHNcbiAgICAgIGJ1ZmZlci5pbnNlcnQoWzEsIDBdLCAnXFxuJyk7XG4gICAgICBfLmVhY2goXy5zb3J0QnkoaW1wb3J0cyksICh2YWx1ZSwgaW5kZXgpID0+IHtcbiAgICAgICAgYnVmZmVyLmluc2VydChbaW5kZXggKyAyLCAwXSwgdmFsdWUgKyAnXFxuJyk7XG4gICAgICB9KTtcblxuICAgICAgaWYgKGZvbGRJbXBvcnRzKSB7XG4gICAgICAgIHRoaXMuZm9sZEltcG9ydHMoZWRpdG9yKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZvbGRJbXBvcnRzKGVkaXRvcikge1xuICAgIGNvbnN0IGZpcnN0Um93ID0gMDtcbiAgICBsZXQgbGFzdFJvdyA9IDA7XG4gICAgY29uc3QgYnVmZmVyID0gZWRpdG9yLmdldEJ1ZmZlcigpO1xuICAgIGJ1ZmZlci5zY2FuKC9pbXBvcnRcXHMuKjsvZywgKG0pID0+IHtcbiAgICAgIGxhc3RSb3cgPSBtLnJhbmdlLmVuZC5yb3c7XG4gICAgfSk7XG5cbiAgICBpZiAobGFzdFJvdykge1xuICAgICAgY29uc3QgcG9zID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCk7XG4gICAgICBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZShbW2ZpcnN0Um93LCAwXSwgW2xhc3RSb3csIDBdXSk7XG4gICAgICBlZGl0b3IuZm9sZFNlbGVjdGVkTGluZXMoKTtcbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihwb3MpO1xuICAgIH1cbiAgfVxuXG4gIGRldGVybWluZUNsYXNzTmFtZShlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCB0ZXh0LCBwcmVmaXgsIHN1ZmZpeCxcbiAgICAgIHByZXZSZXR1cm5UeXBlKSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBjbGFzc05hbWVzID0gbnVsbDtcbiAgICAgIGxldCBpc0luc3RhbmNlID0gL1xcKSQvLnRlc3QocHJlZml4KTtcblxuICAgICAgbGV0IGNsYXNzU2ltcGxlTmFtZSA9IG51bGw7XG5cbiAgICAgIC8vIERldGVybWluZSBjbGFzcyBuYW1lXG4gICAgICBpZiAoIXByZWZpeCB8fCBwcmVmaXggPT09ICd0aGlzJykge1xuICAgICAgICAvLyBVc2UgdGhpcyBhcyBjbGFzcyBuYW1lXG4gICAgICAgIGNsYXNzU2ltcGxlTmFtZSA9IHRoaXMuZ2V0Q3VycmVudENsYXNzU2ltcGxlTmFtZShlZGl0b3IpO1xuICAgICAgICBpc0luc3RhbmNlID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAocHJlZml4KSB7XG4gICAgICAgIC8vIEdldCBjbGFzcyBuYW1lIGZyb20gcHJlZml4XG4gICAgICAgIC8vIEFsc28gc3VwcG9ydCAnKChDbGFzc05hbWUpdmFyKScgc3ludGF4IChhIHF1aWNrIGhhY2spXG4gICAgICAgIGNsYXNzU2ltcGxlTmFtZSA9IHRoaXMuZ2V0V29yZChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKVxuICAgICAgICAgIC5pbmRleE9mKCcoKCcpICE9PSAtMSA/IHByZWZpeC5tYXRjaCgvW15cXCldKi8pWzBdIDogcHJlZml4O1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuX2lzVmFsaWRDbGFzc05hbWUoY2xhc3NTaW1wbGVOYW1lKSAmJlxuICAgICAgICAgICEvW1xcLlxcKV0vLnRlc3QocHJlZml4KSkge1xuICAgICAgICAvLyBGaW5kIGNsYXNzIG5hbWUgYnkgYSB2YXJpYWJsZSBuYW1lIGdpdmVuIGFzIHByZWZpeFxuICAgICAgICAvLyBUT0RPIHRyYXZlcnNlIGJyYWNrZXRzIGJhY2t3YXJkcyB0byBtYXRjaCBjb3JyZWN0IHNjb3BlICh3aXRoIHJlZ2V4cClcbiAgICAgICAgLy8gVE9ETyBoYW5kbGUgJ3RoaXMudmFyTmFtZScgY29ycmVjdGx5XG4gICAgICAgIGNsYXNzU2ltcGxlTmFtZSA9IHRoaXMuX2xhc3RNYXRjaChcbiAgICAgICAgICBlZGl0b3IuZ2V0VGV4dEluUmFuZ2UoW1tidWZmZXJQb3NpdGlvbi5yb3cgLSAyNSwgMF0sIGJ1ZmZlclBvc2l0aW9uXSksXG4gICAgICAgICAgbmV3IFJlZ0V4cCgnKFtBLVpdW2EtekEtWjAtOV9dKikoPFtBLVpdW2EtekEtWjAtOV88PiwgXSo+KT9cXFxccycgK1xuICAgICAgICAgICAgcHJlZml4ICsgJ1ssOz1cXFxcc1xcXFwpXScsICdnJykpO1xuICAgICAgICBjbGFzc1NpbXBsZU5hbWUgPSBjbGFzc1NpbXBsZU5hbWUucmVwbGFjZShcbiAgICAgICAgICBuZXcgUmVnRXhwKCdcXFxccysnICsgcHJlZml4ICsgJ1ssOz1cXFxcc1xcXFwpXSQnKSwgJycpO1xuICAgICAgICBjbGFzc1NpbXBsZU5hbWUgPSBjbGFzc1NpbXBsZU5hbWUucmVwbGFjZSgvXFw8LipcXD4vLCAnJyk7XG5cbiAgICAgICAgaXNJbnN0YW5jZSA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl9pc1ZhbGlkQ2xhc3NOYW1lKGNsYXNzU2ltcGxlTmFtZSkpIHtcbiAgICAgICAgLy8gQ29udmVydCBzaW1wbGUgbmFtZSB0byBhIGZ1bGwgY2xhc3MgbmFtZSBhbmQgdXNlIHRoYXRcbiAgICAgICAgY2xhc3NOYW1lcyA9IHRoaXMuZ2V0UG9zc2libGVDbGFzc05hbWVzKGVkaXRvciwgY2xhc3NTaW1wbGVOYW1lLFxuICAgICAgICAgIHByZWZpeCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBKdXN0IHVzZSByZXR1cm4gdHlwZSBvZiBwcmV2aW91cyBzbmlwcGV0IChhIHF1aWNrIGhhY2spXG4gICAgICAgIC8vIFRPRE8gZGV0ZXJtaW5lIHR5cGUgdXNpbmcgY2xhc3Nsb2FkZXJcbiAgICAgICAgY2xhc3NOYW1lcyA9IFsgcHJldlJldHVyblR5cGUgXTtcbiAgICAgICAgaXNJbnN0YW5jZSA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7IGNsYXNzTmFtZXMsIGlzSW5zdGFuY2UgfTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gIH1cblxuICBfaXNWYWxpZENsYXNzTmFtZSh0ZXh0KSB7XG4gICAgcmV0dXJuIC9eW0EtWl1bXlxcLlxcKV0qJC8udGVzdCh0ZXh0KSB8fCAvXFwuW0EtWl1bXlxcLlxcKV0qJC8udGVzdCh0ZXh0KTtcbiAgfVxuXG4gIF9sYXN0TWF0Y2goc3RyLCByZWdleCkge1xuICAgIGNvbnN0IGFycmF5ID0gc3RyLm1hdGNoKHJlZ2V4KSB8fCBbJyddO1xuICAgIHJldHVybiBhcnJheVthcnJheS5sZW5ndGggLSAxXTtcbiAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBBdG9tSmF2YVV0aWwoKTtcbiJdfQ==