function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _handlebars = require('handlebars');

var _handlebars2 = _interopRequireDefault(_handlebars);

var _xregexp = require('xregexp');

var _xregexp2 = _interopRequireDefault(_xregexp);

'use babel';

module.exports = {

  name: 'handlebars',

  grammarScopes: ['source.handlebars', 'source.hbs', 'text.html.handlebars', 'text.html.htmlbars', 'text.html.mustache', 'text.html.spacebars'],

  scope: 'file',

  lintOnFly: true,

  regex: (0, _xregexp2['default'])('Parse error on line (?<line>[0-9]+)+:\n' + '[^\n]*\n' + '[^\n]*\n' + '(?<message>.*)'),

  lint: function lint(textEditor) {
    var _this = this;

    return new Promise(function (resolve, reject) {
      var messages = [];
      var bufferText = textEditor.getText();

      try {
        _handlebars2['default'].precompile(bufferText, {});
      } catch (err) {
        _xregexp2['default'].forEach(err.message, _this.regex, function (match) {
          messages.push({
            type: 'Error',
            text: match.message,
            filePath: textEditor.getPath(),
            range: _this.lineRange(match.line - 1, textEditor)
          });
        });
      }

      resolve(messages);
    });
  },

  lineRange: function lineRange(lineIdx, textEditor) {
    var line = textEditor.getBuffer().lineForRow(lineIdx);
    var pre = String(line.match(/^\s*/));

    return [[lineIdx, pre.length], [lineIdx, line.length]];
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci1oYW5kbGViYXJzL2xpYi9saW50ZXItaGFuZGxlYmFycy1wcm92aWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzswQkFFdUIsWUFBWTs7Ozt1QkFDZixTQUFTOzs7O0FBSDdCLFdBQVcsQ0FBQTs7QUFLWCxNQUFNLENBQUMsT0FBTyxHQUFHOztBQUVmLE1BQUksRUFBRSxZQUFZOztBQUVsQixlQUFhLEVBQUUsQ0FDYixtQkFBbUIsRUFDbkIsWUFBWSxFQUNaLHNCQUFzQixFQUN0QixvQkFBb0IsRUFDcEIsb0JBQW9CLEVBQ3BCLHFCQUFxQixDQUN0Qjs7QUFFRCxPQUFLLEVBQUUsTUFBTTs7QUFFYixXQUFTLEVBQUUsSUFBSTs7QUFFZixPQUFLLEVBQUUsMEJBQ0wseUNBQXlDLEdBQ3pDLFVBQVUsR0FDVixVQUFVLEdBQ1YsZ0JBQWdCLENBQ2pCOztBQUVELE1BQUksRUFBQyxjQUFDLFVBQVUsRUFBRTs7O0FBQ2hCLFdBQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFLO0FBQ3RDLFVBQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQTtBQUNuQixVQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUE7O0FBRXZDLFVBQUk7QUFDRixnQ0FBVyxVQUFVLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFBO09BQ3RDLENBQUMsT0FBTyxHQUFHLEVBQUU7QUFDWiw2QkFBUSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxNQUFLLEtBQUssRUFBRSxVQUFDLEtBQUssRUFBSztBQUNsRCxrQkFBUSxDQUFDLElBQUksQ0FBQztBQUNaLGdCQUFJLEVBQUUsT0FBTztBQUNiLGdCQUFJLEVBQUUsS0FBSyxDQUFDLE9BQU87QUFDbkIsb0JBQVEsRUFBRSxVQUFVLENBQUMsT0FBTyxFQUFFO0FBQzlCLGlCQUFLLEVBQUUsTUFBSyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsVUFBVSxDQUFDO1dBQ2xELENBQUMsQ0FBQTtTQUNILENBQUMsQ0FBQTtPQUNIOztBQUVELGFBQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUNsQixDQUFDLENBQUE7R0FDSDs7QUFFRCxXQUFTLEVBQUMsbUJBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRTtBQUM5QixRQUFNLElBQUksR0FBRyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ3ZELFFBQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7O0FBRXRDLFdBQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7R0FDdkQ7Q0FDRixDQUFBIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci1oYW5kbGViYXJzL2xpYi9saW50ZXItaGFuZGxlYmFycy1wcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBIYW5kbGViYXJzIGZyb20gJ2hhbmRsZWJhcnMnXG5pbXBvcnQgWFJlZ0V4cCBmcm9tICd4cmVnZXhwJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBuYW1lOiAnaGFuZGxlYmFycycsXG5cbiAgZ3JhbW1hclNjb3BlczogW1xuICAgICdzb3VyY2UuaGFuZGxlYmFycycsXG4gICAgJ3NvdXJjZS5oYnMnLFxuICAgICd0ZXh0Lmh0bWwuaGFuZGxlYmFycycsXG4gICAgJ3RleHQuaHRtbC5odG1sYmFycycsXG4gICAgJ3RleHQuaHRtbC5tdXN0YWNoZScsXG4gICAgJ3RleHQuaHRtbC5zcGFjZWJhcnMnXG4gIF0sXG5cbiAgc2NvcGU6ICdmaWxlJyxcblxuICBsaW50T25GbHk6IHRydWUsXG5cbiAgcmVnZXg6IFhSZWdFeHAoXG4gICAgJ1BhcnNlIGVycm9yIG9uIGxpbmUgKD88bGluZT5bMC05XSspKzpcXG4nICtcbiAgICAnW15cXG5dKlxcbicgK1xuICAgICdbXlxcbl0qXFxuJyArXG4gICAgJyg/PG1lc3NhZ2U+LiopJ1xuICApLFxuXG4gIGxpbnQgKHRleHRFZGl0b3IpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgbWVzc2FnZXMgPSBbXVxuICAgICAgY29uc3QgYnVmZmVyVGV4dCA9IHRleHRFZGl0b3IuZ2V0VGV4dCgpXG5cbiAgICAgIHRyeSB7XG4gICAgICAgIEhhbmRsZWJhcnMucHJlY29tcGlsZShidWZmZXJUZXh0LCB7fSlcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBYUmVnRXhwLmZvckVhY2goZXJyLm1lc3NhZ2UsIHRoaXMucmVnZXgsIChtYXRjaCkgPT4ge1xuICAgICAgICAgIG1lc3NhZ2VzLnB1c2goe1xuICAgICAgICAgICAgdHlwZTogJ0Vycm9yJyxcbiAgICAgICAgICAgIHRleHQ6IG1hdGNoLm1lc3NhZ2UsXG4gICAgICAgICAgICBmaWxlUGF0aDogdGV4dEVkaXRvci5nZXRQYXRoKCksXG4gICAgICAgICAgICByYW5nZTogdGhpcy5saW5lUmFuZ2UobWF0Y2gubGluZSAtIDEsIHRleHRFZGl0b3IpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgcmVzb2x2ZShtZXNzYWdlcylcbiAgICB9KVxuICB9LFxuXG4gIGxpbmVSYW5nZSAobGluZUlkeCwgdGV4dEVkaXRvcikge1xuICAgIGNvbnN0IGxpbmUgPSB0ZXh0RWRpdG9yLmdldEJ1ZmZlcigpLmxpbmVGb3JSb3cobGluZUlkeClcbiAgICBjb25zdCBwcmUgPSBTdHJpbmcobGluZS5tYXRjaCgvXlxccyovKSlcblxuICAgIHJldHVybiBbW2xpbmVJZHgsIHByZS5sZW5ndGhdLCBbbGluZUlkeCwgbGluZS5sZW5ndGhdXVxuICB9XG59XG4iXX0=