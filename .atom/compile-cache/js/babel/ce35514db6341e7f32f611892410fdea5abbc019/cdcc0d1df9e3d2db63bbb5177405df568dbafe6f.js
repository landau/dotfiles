Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atomClockView = require('./atom-clock-view');

var _atomClockView2 = _interopRequireDefault(_atomClockView);

'use babel';

exports['default'] = {

  config: {
    dateFormat: {
      type: 'string',
      title: 'Time format',
      description: 'Specify the time format. Please take a look at http://momentjs.com/docs/#/displaying/format/ to check all the available formats.',
      'default': 'H:mm'
    }, locale: {
      type: 'string',
      title: 'Locale',
      description: 'Specify the time locale.',
      'default': 'en'
    }, refreshInterval: {
      type: 'integer',
      title: 'Clock interval',
      description: 'Specify the refresh interval (in seconds) for the plugin to evaluate the date.',
      'default': 60,
      minimum: 1
    }, showClockIcon: {
      type: 'boolean',
      title: 'Icon clock',
      description: 'Show clock icon in the status bar?',
      'default': false
    }
  },

  activate: function activate(state) {},

  deactivate: function deactivate() {
    if (this.atomClockView) this.atomClockView.destroy();
  },

  consumeStatusBar: function consumeStatusBar(statusBar) {
    this.atomClockView = new _atomClockView2['default'](statusBar);
    this.atomClockView.start();
  }

};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2F0b20tY2xvY2svbGliL2F0b20tY2xvY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OzZCQUUwQixtQkFBbUI7Ozs7QUFGN0MsV0FBVyxDQUFDOztxQkFJRzs7QUFFYixRQUFNLEVBQUU7QUFDTixjQUFVLEVBQUU7QUFDVixVQUFJLEVBQUUsUUFBUTtBQUNkLFdBQUssRUFBRSxhQUFhO0FBQ3BCLGlCQUFXLEVBQUUsa0lBQWtJO0FBQy9JLGlCQUFTLE1BQU07S0FDaEIsRUFBRSxNQUFNLEVBQUU7QUFDVCxVQUFJLEVBQUUsUUFBUTtBQUNkLFdBQUssRUFBRSxRQUFRO0FBQ2YsaUJBQVcsRUFBRSwwQkFBMEI7QUFDdkMsaUJBQVMsSUFBSTtLQUNkLEVBQUUsZUFBZSxFQUFFO0FBQ2xCLFVBQUksRUFBRSxTQUFTO0FBQ2YsV0FBSyxFQUFFLGdCQUFnQjtBQUN2QixpQkFBVyxFQUFFLGdGQUFnRjtBQUM3RixpQkFBUyxFQUFFO0FBQ1gsYUFBTyxFQUFFLENBQUM7S0FDWCxFQUFFLGFBQWEsRUFBRTtBQUNoQixVQUFJLEVBQUUsU0FBUztBQUNmLFdBQUssRUFBRSxZQUFZO0FBQ25CLGlCQUFXLEVBQUUsb0NBQW9DO0FBQ2pELGlCQUFTLEtBQUs7S0FDZjtHQUNGOztBQUVELFVBQVEsRUFBQSxrQkFBQyxLQUFLLEVBQUUsRUFBRTs7QUFFbEIsWUFBVSxFQUFBLHNCQUFHO0FBQ1gsUUFBSSxJQUFJLENBQUMsYUFBYSxFQUNwQixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO0dBQy9COztBQUVELGtCQUFnQixFQUFBLDBCQUFDLFNBQVMsRUFBRTtBQUMxQixRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUFrQixTQUFTLENBQUMsQ0FBQTtBQUNqRCxRQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFBO0dBQzNCOztDQUVGIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2F0b20tY2xvY2svbGliL2F0b20tY2xvY2suanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IEF0b21DbG9ja1ZpZXcgZnJvbSAnLi9hdG9tLWNsb2NrLXZpZXcnXG5cbmV4cG9ydCBkZWZhdWx0IHtcblxuICBjb25maWc6IHtcbiAgICBkYXRlRm9ybWF0OiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIHRpdGxlOiAnVGltZSBmb3JtYXQnLFxuICAgICAgZGVzY3JpcHRpb246ICdTcGVjaWZ5IHRoZSB0aW1lIGZvcm1hdC4gUGxlYXNlIHRha2UgYSBsb29rIGF0IGh0dHA6Ly9tb21lbnRqcy5jb20vZG9jcy8jL2Rpc3BsYXlpbmcvZm9ybWF0LyB0byBjaGVjayBhbGwgdGhlIGF2YWlsYWJsZSBmb3JtYXRzLicsXG4gICAgICBkZWZhdWx0OiAnSDptbSdcbiAgICB9LCBsb2NhbGU6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgdGl0bGU6ICdMb2NhbGUnLFxuICAgICAgZGVzY3JpcHRpb246ICdTcGVjaWZ5IHRoZSB0aW1lIGxvY2FsZS4nLFxuICAgICAgZGVmYXVsdDogJ2VuJ1xuICAgIH0sIHJlZnJlc2hJbnRlcnZhbDoge1xuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgdGl0bGU6ICdDbG9jayBpbnRlcnZhbCcsXG4gICAgICBkZXNjcmlwdGlvbjogJ1NwZWNpZnkgdGhlIHJlZnJlc2ggaW50ZXJ2YWwgKGluIHNlY29uZHMpIGZvciB0aGUgcGx1Z2luIHRvIGV2YWx1YXRlIHRoZSBkYXRlLicsXG4gICAgICBkZWZhdWx0OiA2MCxcbiAgICAgIG1pbmltdW06IDFcbiAgICB9LCBzaG93Q2xvY2tJY29uOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICB0aXRsZTogJ0ljb24gY2xvY2snLFxuICAgICAgZGVzY3JpcHRpb246ICdTaG93IGNsb2NrIGljb24gaW4gdGhlIHN0YXR1cyBiYXI/JyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgfVxuICB9LFxuXG4gIGFjdGl2YXRlKHN0YXRlKSB7fSxcblxuICBkZWFjdGl2YXRlKCkge1xuICAgIGlmICh0aGlzLmF0b21DbG9ja1ZpZXcpXG4gICAgICB0aGlzLmF0b21DbG9ja1ZpZXcuZGVzdHJveSgpXG4gIH0sXG5cbiAgY29uc3VtZVN0YXR1c0JhcihzdGF0dXNCYXIpIHtcbiAgICB0aGlzLmF0b21DbG9ja1ZpZXcgPSBuZXcgQXRvbUNsb2NrVmlldyhzdGF0dXNCYXIpXG4gICAgdGhpcy5hdG9tQ2xvY2tWaWV3LnN0YXJ0KClcbiAgfVxuXG59XG4iXX0=