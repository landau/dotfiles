Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _main = require('./main');

var _main2 = _interopRequireDefault(_main);

var _helpers = require('./helpers');

var _tinycolor2 = require('tinycolor2');

var _tinycolor22 = _interopRequireDefault(_tinycolor2);

var _colorTemplates = require('./color-templates');

var _colorTemplates2 = _interopRequireDefault(_colorTemplates);

'use babel';
'use strict';

function init() {
    (0, _helpers.toggleClass)(atom.config.get('atom-material-ui.colors.paintCursor'), 'paint-cursor');
}

function apply() {

    init();

    atom.config.onDidChange('atom-material-ui.colors.accentColor', function () {
        return _main2['default'].writeConfig();
    });

    atom.config.onDidChange('atom-material-ui.colors.abaseColor', function (value) {
        var baseColor = (0, _tinycolor22['default'])(value.newValue.toRGBAString());

        if (atom.config.get('atom-material-ui.colors.genAccent')) {
            var accentColor = baseColor.complement().saturate(20).lighten(5);
            return atom.config.set('atom-material-ui.colors.accentColor', accentColor.toRgbString());
        }

        _main2['default'].writeConfig();
    });

    atom.config.onDidChange('atom-material-ui.colors.predefinedColor', function (value) {
        var newValue = (0, _helpers.toCamelCase)(value.newValue);

        atom.config.set('atom-material-ui.colors.abaseColor', _colorTemplates2['default'][newValue].base);
        atom.config.set('atom-material-ui.colors.accentColor', _colorTemplates2['default'][newValue].accent);
    });

    atom.config.onDidChange('atom-material-ui.colors.paintCursor', function (value) {
        return (0, _helpers.toggleClass)(value.newValue, 'paint-cursor');
    });
}

exports['default'] = { apply: apply };
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2F0b20tbWF0ZXJpYWwtdWkvbGliL2NvbG9yLXNldHRpbmdzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztvQkFHZ0IsUUFBUTs7Ozt1QkFDaUIsV0FBVzs7MEJBQzlCLFlBQVk7Ozs7OEJBQ1AsbUJBQW1COzs7O0FBTjlDLFdBQVcsQ0FBQztBQUNaLFlBQVksQ0FBQzs7QUFPYixTQUFTLElBQUksR0FBRztBQUNaLDhCQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHFDQUFxQyxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUM7Q0FDdkY7O0FBRUQsU0FBUyxLQUFLLEdBQUc7O0FBRWIsUUFBSSxFQUFFLENBQUM7O0FBRVAsUUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMscUNBQXFDLEVBQUU7ZUFBTSxrQkFBSSxXQUFXLEVBQUU7S0FBQSxDQUFDLENBQUM7O0FBRXhGLFFBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLG9DQUFvQyxFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQ3JFLFlBQUksU0FBUyxHQUFHLDZCQUFVLEtBQUssQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQzs7QUFFekQsWUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsQ0FBQyxFQUFFO0FBQ3RELGdCQUFJLFdBQVcsR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqRSxtQkFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUMsRUFBRSxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztTQUM1Rjs7QUFFRCwwQkFBSSxXQUFXLEVBQUUsQ0FBQztLQUNyQixDQUFDLENBQUM7O0FBRUgsUUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMseUNBQXlDLEVBQUUsVUFBQyxLQUFLLEVBQUs7QUFDMUUsWUFBSSxRQUFRLEdBQUcsMEJBQVksS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUUzQyxZQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsRUFBRSw0QkFBZSxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNyRixZQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUMsRUFBRSw0QkFBZSxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUMzRixDQUFDLENBQUM7O0FBRUgsUUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMscUNBQXFDLEVBQUUsVUFBQyxLQUFLO2VBQUssMEJBQVksS0FBSyxDQUFDLFFBQVEsRUFBRSxjQUFjLENBQUM7S0FBQSxDQUFDLENBQUM7Q0FDMUg7O3FCQUVjLEVBQUUsS0FBSyxFQUFMLEtBQUssRUFBRSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9hdG9tLW1hdGVyaWFsLXVpL2xpYi9jb2xvci1zZXR0aW5ncy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgYW11IGZyb20gJy4vbWFpbic7XG5pbXBvcnQgeyB0b0NhbWVsQ2FzZSwgdG9nZ2xlQ2xhc3MgfSBmcm9tICcuL2hlbHBlcnMnO1xuaW1wb3J0IHRpbnljb2xvciBmcm9tICd0aW55Y29sb3IyJztcbmltcG9ydCBjb2xvclRlbXBsYXRlcyBmcm9tICcuL2NvbG9yLXRlbXBsYXRlcyc7XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gICAgdG9nZ2xlQ2xhc3MoYXRvbS5jb25maWcuZ2V0KCdhdG9tLW1hdGVyaWFsLXVpLmNvbG9ycy5wYWludEN1cnNvcicpLCAncGFpbnQtY3Vyc29yJyk7XG59XG5cbmZ1bmN0aW9uIGFwcGx5KCkge1xuXG4gICAgaW5pdCgpO1xuICAgIFxuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdhdG9tLW1hdGVyaWFsLXVpLmNvbG9ycy5hY2NlbnRDb2xvcicsICgpID0+IGFtdS53cml0ZUNvbmZpZygpKTtcblxuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdhdG9tLW1hdGVyaWFsLXVpLmNvbG9ycy5hYmFzZUNvbG9yJywgKHZhbHVlKSA9PiB7XG4gICAgICAgIHZhciBiYXNlQ29sb3IgPSB0aW55Y29sb3IodmFsdWUubmV3VmFsdWUudG9SR0JBU3RyaW5nKCkpO1xuXG4gICAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2F0b20tbWF0ZXJpYWwtdWkuY29sb3JzLmdlbkFjY2VudCcpKSB7XG4gICAgICAgICAgICBsZXQgYWNjZW50Q29sb3IgPSBiYXNlQ29sb3IuY29tcGxlbWVudCgpLnNhdHVyYXRlKDIwKS5saWdodGVuKDUpO1xuICAgICAgICAgICAgcmV0dXJuIGF0b20uY29uZmlnLnNldCgnYXRvbS1tYXRlcmlhbC11aS5jb2xvcnMuYWNjZW50Q29sb3InLCBhY2NlbnRDb2xvci50b1JnYlN0cmluZygpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFtdS53cml0ZUNvbmZpZygpO1xuICAgIH0pO1xuXG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2F0b20tbWF0ZXJpYWwtdWkuY29sb3JzLnByZWRlZmluZWRDb2xvcicsICh2YWx1ZSkgPT4ge1xuICAgICAgICB2YXIgbmV3VmFsdWUgPSB0b0NhbWVsQ2FzZSh2YWx1ZS5uZXdWYWx1ZSk7XG5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdhdG9tLW1hdGVyaWFsLXVpLmNvbG9ycy5hYmFzZUNvbG9yJywgY29sb3JUZW1wbGF0ZXNbbmV3VmFsdWVdLmJhc2UpO1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F0b20tbWF0ZXJpYWwtdWkuY29sb3JzLmFjY2VudENvbG9yJywgY29sb3JUZW1wbGF0ZXNbbmV3VmFsdWVdLmFjY2VudCk7XG4gICAgfSk7XG5cbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnYXRvbS1tYXRlcmlhbC11aS5jb2xvcnMucGFpbnRDdXJzb3InLCAodmFsdWUpID0+IHRvZ2dsZUNsYXNzKHZhbHVlLm5ld1ZhbHVlLCAncGFpbnQtY3Vyc29yJykpO1xufVxuXG5leHBvcnQgZGVmYXVsdCB7IGFwcGx5IH07XG4iXX0=
//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-material-ui/lib/color-settings.js
