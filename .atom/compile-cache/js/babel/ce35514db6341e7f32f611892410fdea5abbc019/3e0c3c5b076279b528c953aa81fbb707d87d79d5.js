Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fontsSetFontSize = require('./fonts/set-font-size');

var _fontsSetFontSize2 = _interopRequireDefault(_fontsSetFontSize);

var _helperToggleClassName = require('./helper/toggle-class-name');

var _helperToggleClassName2 = _interopRequireDefault(_helperToggleClassName);

require('./colors');

require('./fonts');

require('./tab-bar');

require('./user-interface');

'use babel';

var classNames = {
    // Fonts
    'amu-paint-cursor': atom.config.get('atom-material-ui.colors.paintCursor'),

    // Tabs settings
    'amu-compact-tab-bar': atom.config.get('atom-material-ui.tabs.compactTabs'),
    'amu-no-tab-min-width': atom.config.get('atom-material-ui.tabs.noTabMinWidth'),
    'amu-tinted-tab-bar': atom.config.get('atom-material-ui.tabs.tintedTabBar'),

    // General UI settings
    'amu-use-animations': atom.config.get('atom-material-ui.ui.useAnimations'),
    'amu-panel-contrast': atom.config.get('atom-material-ui.ui.panelContrast'),
    'amu-panel-shadows': atom.config.get('atom-material-ui.ui.panelShadows')
};

exports['default'] = {
    activate: function activate() {
        Object.keys(classNames).forEach(function (className) {
            return (0, _helperToggleClassName2['default'])(className, classNames[className]);
        });

        (0, _fontsSetFontSize2['default'])(atom.config.get('atom-material-ui.fonts.fontSize'));
    },

    deactivate: function deactivate() {
        // Reset all the things!
        Object.keys(classNames).forEach(function (className) {
            return (0, _helperToggleClassName2['default'])(className, false);
        });
        (0, _fontsSetFontSize2['default'])(null);
    }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2F0b20tbWF0ZXJpYWwtdWkvbGliL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O2dDQUV3Qix1QkFBdUI7Ozs7cUNBQ25CLDRCQUE0Qjs7OztRQUNqRCxVQUFVOztRQUNWLFNBQVM7O1FBQ1QsV0FBVzs7UUFDWCxrQkFBa0I7O0FBUHpCLFdBQVcsQ0FBQzs7QUFTWixJQUFNLFVBQVUsR0FBRzs7QUFFZixzQkFBa0IsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUMsQ0FBQzs7O0FBRzFFLHlCQUFxQixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxDQUFDO0FBQzNFLDBCQUFzQixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHFDQUFxQyxDQUFDO0FBQzlFLHdCQUFvQixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxDQUFDOzs7QUFHM0Usd0JBQW9CLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsbUNBQW1DLENBQUM7QUFDMUUsd0JBQW9CLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsbUNBQW1DLENBQUM7QUFDMUUsdUJBQW1CLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLENBQUM7Q0FDM0UsQ0FBQzs7cUJBRWE7QUFDWCxZQUFRLEVBQUEsb0JBQUc7QUFDUCxjQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLFNBQVM7bUJBQ3JDLHdDQUFnQixTQUFTLEVBQUUsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQUMsQ0FDckQsQ0FBQzs7QUFFRiwyQ0FBWSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDLENBQUM7S0FDbkU7O0FBRUQsY0FBVSxFQUFBLHNCQUFHOztBQUVULGNBQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsU0FBUzttQkFBSSx3Q0FBZ0IsU0FBUyxFQUFFLEtBQUssQ0FBQztTQUFBLENBQUMsQ0FBQztBQUNoRiwyQ0FBWSxJQUFJLENBQUMsQ0FBQztLQUNyQjtDQUNKIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2F0b20tbWF0ZXJpYWwtdWkvbGliL21haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHNldEZvbnRTaXplIGZyb20gJy4vZm9udHMvc2V0LWZvbnQtc2l6ZSc7XG5pbXBvcnQgdG9nZ2xlQ2xhc3NOYW1lIGZyb20gJy4vaGVscGVyL3RvZ2dsZS1jbGFzcy1uYW1lJztcbmltcG9ydCAnLi9jb2xvcnMnO1xuaW1wb3J0ICcuL2ZvbnRzJztcbmltcG9ydCAnLi90YWItYmFyJztcbmltcG9ydCAnLi91c2VyLWludGVyZmFjZSc7XG5cbmNvbnN0IGNsYXNzTmFtZXMgPSB7XG4gICAgLy8gRm9udHNcbiAgICAnYW11LXBhaW50LWN1cnNvcic6IGF0b20uY29uZmlnLmdldCgnYXRvbS1tYXRlcmlhbC11aS5jb2xvcnMucGFpbnRDdXJzb3InKSxcblxuICAgIC8vIFRhYnMgc2V0dGluZ3NcbiAgICAnYW11LWNvbXBhY3QtdGFiLWJhcic6IGF0b20uY29uZmlnLmdldCgnYXRvbS1tYXRlcmlhbC11aS50YWJzLmNvbXBhY3RUYWJzJyksXG4gICAgJ2FtdS1uby10YWItbWluLXdpZHRoJzogYXRvbS5jb25maWcuZ2V0KCdhdG9tLW1hdGVyaWFsLXVpLnRhYnMubm9UYWJNaW5XaWR0aCcpLFxuICAgICdhbXUtdGludGVkLXRhYi1iYXInOiBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tbWF0ZXJpYWwtdWkudGFicy50aW50ZWRUYWJCYXInKSxcblxuICAgIC8vIEdlbmVyYWwgVUkgc2V0dGluZ3NcbiAgICAnYW11LXVzZS1hbmltYXRpb25zJzogYXRvbS5jb25maWcuZ2V0KCdhdG9tLW1hdGVyaWFsLXVpLnVpLnVzZUFuaW1hdGlvbnMnKSxcbiAgICAnYW11LXBhbmVsLWNvbnRyYXN0JzogYXRvbS5jb25maWcuZ2V0KCdhdG9tLW1hdGVyaWFsLXVpLnVpLnBhbmVsQ29udHJhc3QnKSxcbiAgICAnYW11LXBhbmVsLXNoYWRvd3MnOiBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tbWF0ZXJpYWwtdWkudWkucGFuZWxTaGFkb3dzJyksXG59O1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgYWN0aXZhdGUoKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKGNsYXNzTmFtZXMpLmZvckVhY2goY2xhc3NOYW1lID0+IChcbiAgICAgICAgICAgIHRvZ2dsZUNsYXNzTmFtZShjbGFzc05hbWUsIGNsYXNzTmFtZXNbY2xhc3NOYW1lXSkpLFxuICAgICAgICApO1xuXG4gICAgICAgIHNldEZvbnRTaXplKGF0b20uY29uZmlnLmdldCgnYXRvbS1tYXRlcmlhbC11aS5mb250cy5mb250U2l6ZScpKTtcbiAgICB9LFxuXG4gICAgZGVhY3RpdmF0ZSgpIHtcbiAgICAgICAgLy8gUmVzZXQgYWxsIHRoZSB0aGluZ3MhXG4gICAgICAgIE9iamVjdC5rZXlzKGNsYXNzTmFtZXMpLmZvckVhY2goY2xhc3NOYW1lID0+IHRvZ2dsZUNsYXNzTmFtZShjbGFzc05hbWUsIGZhbHNlKSk7XG4gICAgICAgIHNldEZvbnRTaXplKG51bGwpO1xuICAgIH0sXG59O1xuIl19