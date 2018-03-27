Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodash = require('lodash');

'use babel';

var JavaUtil = (function () {
  function JavaUtil() {
    _classCallCheck(this, JavaUtil);
  }

  _createClass(JavaUtil, [{
    key: 'getSimpleName',
    value: function getSimpleName(className) {
      return className.replace(/[a-z]*\./g, '');
    }
  }, {
    key: 'getPackageName',
    value: function getPackageName(className) {
      return className.replace('.' + this.getSimpleName(className), '');
    }
  }, {
    key: 'getInverseName',
    value: function getInverseName(className) {
      return _lodash._.reduceRight(className.split('.'), function (result, next) {
        return result + next;
      }, '');
    }
  }]);

  return JavaUtil;
})();

exports['default'] = new JavaUtil();
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qYXZhL2xpYi9qYXZhVXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztzQkFFa0IsUUFBUTs7QUFGMUIsV0FBVyxDQUFDOztJQUlOLFFBQVE7V0FBUixRQUFROzBCQUFSLFFBQVE7OztlQUFSLFFBQVE7O1dBRUMsdUJBQUMsU0FBUyxFQUFFO0FBQ3ZCLGFBQU8sU0FBUyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDM0M7OztXQUVhLHdCQUFDLFNBQVMsRUFBRTtBQUN4QixhQUFPLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDbkU7OztXQUVhLHdCQUFDLFNBQVMsRUFBRTtBQUN4QixhQUFPLFVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsVUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFLO0FBQzNELGVBQU8sTUFBTSxHQUFHLElBQUksQ0FBQztPQUN0QixFQUFFLEVBQUUsQ0FBQyxDQUFDO0tBQ1I7OztTQWRHLFFBQVE7OztxQkFrQkMsSUFBSSxRQUFRLEVBQUUiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLWphdmEvbGliL2phdmFVdGlsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7IF8gfSBmcm9tICdsb2Rhc2gnO1xuXG5jbGFzcyBKYXZhVXRpbCB7XG5cbiAgZ2V0U2ltcGxlTmFtZShjbGFzc05hbWUpIHtcbiAgICByZXR1cm4gY2xhc3NOYW1lLnJlcGxhY2UoL1thLXpdKlxcLi9nLCAnJyk7XG4gIH1cblxuICBnZXRQYWNrYWdlTmFtZShjbGFzc05hbWUpIHtcbiAgICByZXR1cm4gY2xhc3NOYW1lLnJlcGxhY2UoJy4nICsgdGhpcy5nZXRTaW1wbGVOYW1lKGNsYXNzTmFtZSksICcnKTtcbiAgfVxuXG4gIGdldEludmVyc2VOYW1lKGNsYXNzTmFtZSkge1xuICAgIHJldHVybiBfLnJlZHVjZVJpZ2h0KGNsYXNzTmFtZS5zcGxpdCgnLicpLCAocmVzdWx0LCBuZXh0KSA9PiB7XG4gICAgICByZXR1cm4gcmVzdWx0ICsgbmV4dDtcbiAgICB9LCAnJyk7XG4gIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBuZXcgSmF2YVV0aWwoKTtcbiJdfQ==