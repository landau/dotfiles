Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _configSchema = require('./config-schema');

var _configSchema2 = _interopRequireDefault(_configSchema);

var _settings = require('./settings');

var _settings2 = _interopRequireDefault(_settings);

var _colorSettings = require('./color-settings');

var _colorSettings2 = _interopRequireDefault(_colorSettings);

var _tabsSettings = require('./tabs-settings');

var _tabsSettings2 = _interopRequireDefault(_tabsSettings);

var _treeViewSettings = require('./tree-view-settings');

var _treeViewSettings2 = _interopRequireDefault(_treeViewSettings);

var _tinycolor2 = require('tinycolor2');

var _tinycolor22 = _interopRequireDefault(_tinycolor2);

var _updateConfigSchema = require('./update-config-schema');

'use babel';
'use strict';

exports['default'] = {
    config: _configSchema2['default'],

    writeConfig: function writeConfig(options) {
        var accentColor = atom.config.get('atom-material-ui.colors.accentColor').toRGBAString();
        var baseColor = atom.config.get('atom-material-ui.colors.abaseColor').toRGBAString();
        var accentTextColor = '#666';
        var luminance = (0, _tinycolor22['default'])(baseColor).getLuminance();

        if (luminance <= 0.3 && luminance > 0.22) {
            accentTextColor = 'rgba(255,255,255,0.9)';
        } else if (luminance <= 0.22) {
            accentTextColor = 'rgba(255,255,255,0.8)';
        } else if (luminance > 0.3) {
            accentTextColor = 'rgba(0,0,0,0.6)';
        }

        /**
        * This is kind of against Airbnb's stylguide, but produces a much
        * better output and is readable.
        */
        var config = '@accent-color: ' + accentColor + ';\n' + ('@accent-text-color: ' + accentTextColor + ';\n') + ('@base-color: ' + baseColor + ';\n');

        _fs2['default'].writeFile(__dirname + '/../styles/custom.less', config, 'utf8', function () {
            if (!options || !options.noReload) {
                var themePack = atom.packages.getLoadedPackage('atom-material-ui');

                if (themePack) {
                    themePack.deactivate();
                    setImmediate(function () {
                        return themePack.activate();
                    });
                }
            }
            if (options && options.callback && typeof options.callback === 'function') {
                options.callback();
            }
        });
    },

    activate: function activate() {
        (0, _updateConfigSchema.apply)();
        _settings2['default'].apply();
        _colorSettings2['default'].apply();
        setImmediate(function () {
            return _tabsSettings2['default'].apply();
        });
        this.writeConfig({ noReload: true });
    },

    deactivate: function deactivate() {
        _treeViewSettings2['default'].toggleBlendTreeView(false);
    }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2F0b20tbWF0ZXJpYWwtdWkvbGliL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O2tCQUdlLElBQUk7Ozs7NEJBQ0EsaUJBQWlCOzs7O3dCQUNmLFlBQVk7Ozs7NkJBQ1Asa0JBQWtCOzs7OzRCQUNuQixpQkFBaUI7Ozs7Z0NBQ2Isc0JBQXNCOzs7OzBCQUM3QixZQUFZOzs7O2tDQUNJLHdCQUF3Qjs7QUFWOUQsV0FBVyxDQUFDO0FBQ1osWUFBWSxDQUFDOztxQkFXRTtBQUNYLFVBQU0sMkJBQUE7O0FBRU4sZUFBVyxFQUFBLHFCQUFDLE9BQU8sRUFBRTtBQUNqQixZQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQ3hGLFlBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDckYsWUFBSSxlQUFlLEdBQUcsTUFBTSxDQUFDO0FBQzdCLFlBQUksU0FBUyxHQUFHLDZCQUFVLFNBQVMsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDOztBQUVwRCxZQUFJLFNBQVMsSUFBSSxHQUFHLElBQUksU0FBUyxHQUFHLElBQUksRUFBRTtBQUN0QywyQkFBZSxHQUFHLHVCQUF1QixDQUFDO1NBQzdDLE1BQU0sSUFBSSxTQUFTLElBQUksSUFBSSxFQUFFO0FBQzFCLDJCQUFlLEdBQUcsdUJBQXVCLENBQUM7U0FDN0MsTUFBTSxJQUFJLFNBQVMsR0FBRyxHQUFHLEVBQUU7QUFDeEIsMkJBQWUsR0FBRyxpQkFBaUIsQ0FBQztTQUN2Qzs7Ozs7O0FBTUQsWUFBSSxNQUFNLEdBQUcsb0JBQWtCLFdBQVcscUNBQ04sZUFBZSxTQUFLLHNCQUMzQixTQUFTLFNBQUssQ0FBQzs7QUFFNUMsd0JBQUcsU0FBUyxDQUFJLFNBQVMsNkJBQTBCLE1BQU0sRUFBRSxNQUFNLEVBQUUsWUFBTTtBQUNyRSxnQkFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUU7QUFDL0Isb0JBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsQ0FBQzs7QUFFbkUsb0JBQUksU0FBUyxFQUFFO0FBQ1gsNkJBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUN2QixnQ0FBWSxDQUFDOytCQUFNLFNBQVMsQ0FBQyxRQUFRLEVBQUU7cUJBQUEsQ0FBQyxDQUFDO2lCQUM1QzthQUNKO0FBQ0QsZ0JBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxRQUFRLElBQUksT0FBTyxPQUFPLENBQUMsUUFBUSxLQUFLLFVBQVUsRUFBRTtBQUN2RSx1QkFBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ3RCO1NBQ0osQ0FBQyxDQUFDO0tBQ047O0FBRUQsWUFBUSxFQUFBLG9CQUFHO0FBQ1Asd0NBQWMsQ0FBQztBQUNmLDhCQUFTLEtBQUssRUFBRSxDQUFDO0FBQ2pCLG1DQUFjLEtBQUssRUFBRSxDQUFDO0FBQ3RCLG9CQUFZLENBQUM7bUJBQU0sMEJBQWEsS0FBSyxFQUFFO1NBQUEsQ0FBQyxDQUFDO0FBQ3pDLFlBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztLQUN4Qzs7QUFFRCxjQUFVLEVBQUEsc0JBQUc7QUFDVCxzQ0FBaUIsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDL0M7Q0FDSiIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9hdG9tLW1hdGVyaWFsLXVpL2xpYi9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCBmcyBmcm9tICdmcyc7XG5pbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnLXNjaGVtYSc7XG5pbXBvcnQgc2V0dGluZ3MgZnJvbSAnLi9zZXR0aW5ncyc7XG5pbXBvcnQgY29sb3JTZXR0aW5ncyBmcm9tICcuL2NvbG9yLXNldHRpbmdzJztcbmltcG9ydCB0YWJzU2V0dGluZ3MgZnJvbSAnLi90YWJzLXNldHRpbmdzJztcbmltcG9ydCB0cmVlVmlld1NldHRpbmdzIGZyb20gJy4vdHJlZS12aWV3LXNldHRpbmdzJztcbmltcG9ydCB0aW55Y29sb3IgZnJvbSAndGlueWNvbG9yMic7XG5pbXBvcnQgeyBhcHBseSBhcyB1cGRhdGVTY2hlbWEgfSBmcm9tICcuL3VwZGF0ZS1jb25maWctc2NoZW1hJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICAgIGNvbmZpZyxcblxuICAgIHdyaXRlQ29uZmlnKG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGFjY2VudENvbG9yID0gYXRvbS5jb25maWcuZ2V0KCdhdG9tLW1hdGVyaWFsLXVpLmNvbG9ycy5hY2NlbnRDb2xvcicpLnRvUkdCQVN0cmluZygpO1xuICAgICAgICB2YXIgYmFzZUNvbG9yID0gYXRvbS5jb25maWcuZ2V0KCdhdG9tLW1hdGVyaWFsLXVpLmNvbG9ycy5hYmFzZUNvbG9yJykudG9SR0JBU3RyaW5nKCk7XG4gICAgICAgIHZhciBhY2NlbnRUZXh0Q29sb3IgPSAnIzY2Nic7XG4gICAgICAgIHZhciBsdW1pbmFuY2UgPSB0aW55Y29sb3IoYmFzZUNvbG9yKS5nZXRMdW1pbmFuY2UoKTtcblxuICAgICAgICBpZiAobHVtaW5hbmNlIDw9IDAuMyAmJiBsdW1pbmFuY2UgPiAwLjIyKSB7XG4gICAgICAgICAgICBhY2NlbnRUZXh0Q29sb3IgPSAncmdiYSgyNTUsMjU1LDI1NSwwLjkpJztcbiAgICAgICAgfSBlbHNlIGlmIChsdW1pbmFuY2UgPD0gMC4yMikge1xuICAgICAgICAgICAgYWNjZW50VGV4dENvbG9yID0gJ3JnYmEoMjU1LDI1NSwyNTUsMC44KSc7XG4gICAgICAgIH0gZWxzZSBpZiAobHVtaW5hbmNlID4gMC4zKSB7XG4gICAgICAgICAgICBhY2NlbnRUZXh0Q29sb3IgPSAncmdiYSgwLDAsMCwwLjYpJztcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAqIFRoaXMgaXMga2luZCBvZiBhZ2FpbnN0IEFpcmJuYidzIHN0eWxndWlkZSwgYnV0IHByb2R1Y2VzIGEgbXVjaFxuICAgICAgICAqIGJldHRlciBvdXRwdXQgYW5kIGlzIHJlYWRhYmxlLlxuICAgICAgICAqL1xuICAgICAgICB2YXIgY29uZmlnID0gYEBhY2NlbnQtY29sb3I6ICR7YWNjZW50Q29sb3J9O1xcbmAgK1xuICAgICAgICAgICAgICAgICAgICAgYEBhY2NlbnQtdGV4dC1jb2xvcjogJHthY2NlbnRUZXh0Q29sb3J9O1xcbmAgK1xuICAgICAgICAgICAgICAgICAgICAgYEBiYXNlLWNvbG9yOiAke2Jhc2VDb2xvcn07XFxuYDtcblxuICAgICAgICBmcy53cml0ZUZpbGUoYCR7X19kaXJuYW1lfS8uLi9zdHlsZXMvY3VzdG9tLmxlc3NgLCBjb25maWcsICd1dGY4JywgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFvcHRpb25zIHx8ICFvcHRpb25zLm5vUmVsb2FkKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRoZW1lUGFjayA9IGF0b20ucGFja2FnZXMuZ2V0TG9hZGVkUGFja2FnZSgnYXRvbS1tYXRlcmlhbC11aScpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoZW1lUGFjaykge1xuICAgICAgICAgICAgICAgICAgICB0aGVtZVBhY2suZGVhY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBzZXRJbW1lZGlhdGUoKCkgPT4gdGhlbWVQYWNrLmFjdGl2YXRlKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuY2FsbGJhY2sgJiYgdHlwZW9mIG9wdGlvbnMuY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBhY3RpdmF0ZSgpIHtcbiAgICAgICAgdXBkYXRlU2NoZW1hKCk7XG4gICAgICAgIHNldHRpbmdzLmFwcGx5KCk7XG4gICAgICAgIGNvbG9yU2V0dGluZ3MuYXBwbHkoKTtcbiAgICAgICAgc2V0SW1tZWRpYXRlKCgpID0+IHRhYnNTZXR0aW5ncy5hcHBseSgpKTtcbiAgICAgICAgdGhpcy53cml0ZUNvbmZpZyh7IG5vUmVsb2FkOiB0cnVlIH0pO1xuICAgIH0sXG5cbiAgICBkZWFjdGl2YXRlKCkge1xuICAgICAgICB0cmVlVmlld1NldHRpbmdzLnRvZ2dsZUJsZW5kVHJlZVZpZXcoZmFsc2UpO1xuICAgIH1cbn07XG4iXX0=
//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-material-ui/lib/main.js
