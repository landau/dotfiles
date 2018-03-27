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

function apply() {

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
}

exports['default'] = { apply: apply };
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2F0b20tbWF0ZXJpYWwtdWkvbGliL2NvbG9yLXNldHRpbmdzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztvQkFHZ0IsUUFBUTs7Ozt1QkFDSSxXQUFXOzswQkFDakIsWUFBWTs7Ozs4QkFDUCxtQkFBbUI7Ozs7QUFOOUMsV0FBVyxDQUFDO0FBQ1osWUFBWSxDQUFDOztBQU9iLFNBQVMsS0FBSyxHQUFHOztBQUViLFFBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLHFDQUFxQyxFQUFFO2VBQU0sa0JBQUksV0FBVyxFQUFFO0tBQUEsQ0FBQyxDQUFDOztBQUV4RixRQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxvQ0FBb0MsRUFBRSxVQUFDLEtBQUssRUFBSztBQUNyRSxZQUFJLFNBQVMsR0FBRyw2QkFBVSxLQUFLLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7O0FBRXpELFlBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsbUNBQW1DLENBQUMsRUFBRTtBQUN0RCxnQkFBSSxXQUFXLEdBQUcsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakUsbUJBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMscUNBQXFDLEVBQUUsV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7U0FDNUY7O0FBRUQsMEJBQUksV0FBVyxFQUFFLENBQUM7S0FDckIsQ0FBQyxDQUFDOztBQUVILFFBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLHlDQUF5QyxFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQzFFLFlBQUksUUFBUSxHQUFHLDBCQUFZLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFM0MsWUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLEVBQUUsNEJBQWUsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckYsWUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMscUNBQXFDLEVBQUUsNEJBQWUsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDM0YsQ0FBQyxDQUFDO0NBQ047O3FCQUVjLEVBQUUsS0FBSyxFQUFMLEtBQUssRUFBRSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9hdG9tLW1hdGVyaWFsLXVpL2xpYi9jb2xvci1zZXR0aW5ncy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgYW11IGZyb20gJy4vbWFpbic7XG5pbXBvcnQgeyB0b0NhbWVsQ2FzZSB9IGZyb20gJy4vaGVscGVycyc7XG5pbXBvcnQgdGlueWNvbG9yIGZyb20gJ3Rpbnljb2xvcjInO1xuaW1wb3J0IGNvbG9yVGVtcGxhdGVzIGZyb20gJy4vY29sb3ItdGVtcGxhdGVzJztcblxuZnVuY3Rpb24gYXBwbHkoKSB7XG5cbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnYXRvbS1tYXRlcmlhbC11aS5jb2xvcnMuYWNjZW50Q29sb3InLCAoKSA9PiBhbXUud3JpdGVDb25maWcoKSk7XG5cbiAgICBhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnYXRvbS1tYXRlcmlhbC11aS5jb2xvcnMuYWJhc2VDb2xvcicsICh2YWx1ZSkgPT4ge1xuICAgICAgICB2YXIgYmFzZUNvbG9yID0gdGlueWNvbG9yKHZhbHVlLm5ld1ZhbHVlLnRvUkdCQVN0cmluZygpKTtcblxuICAgICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdhdG9tLW1hdGVyaWFsLXVpLmNvbG9ycy5nZW5BY2NlbnQnKSkge1xuICAgICAgICAgICAgbGV0IGFjY2VudENvbG9yID0gYmFzZUNvbG9yLmNvbXBsZW1lbnQoKS5zYXR1cmF0ZSgyMCkubGlnaHRlbig1KTtcbiAgICAgICAgICAgIHJldHVybiBhdG9tLmNvbmZpZy5zZXQoJ2F0b20tbWF0ZXJpYWwtdWkuY29sb3JzLmFjY2VudENvbG9yJywgYWNjZW50Q29sb3IudG9SZ2JTdHJpbmcoKSk7XG4gICAgICAgIH1cblxuICAgICAgICBhbXUud3JpdGVDb25maWcoKTtcbiAgICB9KTtcblxuICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdhdG9tLW1hdGVyaWFsLXVpLmNvbG9ycy5wcmVkZWZpbmVkQ29sb3InLCAodmFsdWUpID0+IHtcbiAgICAgICAgdmFyIG5ld1ZhbHVlID0gdG9DYW1lbENhc2UodmFsdWUubmV3VmFsdWUpO1xuXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnYXRvbS1tYXRlcmlhbC11aS5jb2xvcnMuYWJhc2VDb2xvcicsIGNvbG9yVGVtcGxhdGVzW25ld1ZhbHVlXS5iYXNlKTtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdhdG9tLW1hdGVyaWFsLXVpLmNvbG9ycy5hY2NlbnRDb2xvcicsIGNvbG9yVGVtcGxhdGVzW25ld1ZhbHVlXS5hY2NlbnQpO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCB7IGFwcGx5IH07XG4iXX0=
//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-material-ui/lib/color-settings.js
