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
      description: 'Specify the time format. [Here](http://momentjs.com/docs/#/displaying/format/) you can find all the available formats.',
      'default': 'H:mm',
      order: 1
    }, showTooltip: {
      type: 'boolean',
      title: 'Enable tooltip',
      description: 'Enables a customisable tooltip when you hover over the time',
      'default': false,
      order: 2
    }, tooltipDateFormat: {
      type: 'string',
      title: 'Tooltip time format',
      description: 'Specify the time format in the tooltip. [Here](http://momentjs.com/docs/#/displaying/format/) you can find all the available formats.',
      'default': 'LLLL',
      order: 3
    }, locale: {
      type: 'string',
      title: 'Locale',
      description: 'Specify the time locale. [Here](https://github.com/moment/moment/tree/master/locale) you can find all the available locales.',
      'default': 'en',
      order: 4
    }, refreshInterval: {
      type: 'integer',
      title: 'Clock interval',
      description: 'Specify the refresh interval (in seconds) for the plugin to evaluate the date.',
      'default': 60,
      minimum: 1,
      order: 5
    }, showClockIcon: {
      type: 'boolean',
      title: 'Icon clock',
      description: 'Show clock icon in the status bar?',
      'default': false,
      order: 6
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2F0b20tY2xvY2svbGliL2F0b20tY2xvY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OzZCQUUwQixtQkFBbUI7Ozs7QUFGN0MsV0FBVyxDQUFDOztxQkFJRzs7QUFFYixRQUFNLEVBQUU7QUFDTixjQUFVLEVBQUU7QUFDVixVQUFJLEVBQUUsUUFBUTtBQUNkLFdBQUssRUFBRSxhQUFhO0FBQ3BCLGlCQUFXLEVBQUUsd0hBQXdIO0FBQ3JJLGlCQUFTLE1BQU07QUFDZixXQUFLLEVBQUUsQ0FBQztLQUNULEVBQUUsV0FBVyxFQUFFO0FBQ2QsVUFBSSxFQUFFLFNBQVM7QUFDZixXQUFLLEVBQUUsZ0JBQWdCO0FBQ3ZCLGlCQUFXLEVBQUUsNkRBQTZEO0FBQzFFLGlCQUFTLEtBQUs7QUFDZCxXQUFLLEVBQUUsQ0FBQztLQUNULEVBQUUsaUJBQWlCLEVBQUU7QUFDcEIsVUFBSSxFQUFFLFFBQVE7QUFDZCxXQUFLLEVBQUUscUJBQXFCO0FBQzVCLGlCQUFXLEVBQUUsdUlBQXVJO0FBQ3BKLGlCQUFTLE1BQU07QUFDZixXQUFLLEVBQUUsQ0FBQztLQUNULEVBQUUsTUFBTSxFQUFFO0FBQ1QsVUFBSSxFQUFFLFFBQVE7QUFDZCxXQUFLLEVBQUUsUUFBUTtBQUNmLGlCQUFXLEVBQUUsOEhBQThIO0FBQzNJLGlCQUFTLElBQUk7QUFDYixXQUFLLEVBQUUsQ0FBQztLQUNULEVBQUUsZUFBZSxFQUFFO0FBQ2xCLFVBQUksRUFBRSxTQUFTO0FBQ2YsV0FBSyxFQUFFLGdCQUFnQjtBQUN2QixpQkFBVyxFQUFFLGdGQUFnRjtBQUM3RixpQkFBUyxFQUFFO0FBQ1gsYUFBTyxFQUFFLENBQUM7QUFDVixXQUFLLEVBQUUsQ0FBQztLQUNULEVBQUUsYUFBYSxFQUFFO0FBQ2hCLFVBQUksRUFBRSxTQUFTO0FBQ2YsV0FBSyxFQUFFLFlBQVk7QUFDbkIsaUJBQVcsRUFBRSxvQ0FBb0M7QUFDakQsaUJBQVMsS0FBSztBQUNkLFdBQUssRUFBRSxDQUFDO0tBQ1Q7R0FDRjs7QUFFRCxVQUFRLEVBQUEsa0JBQUMsS0FBSyxFQUFFLEVBQUU7O0FBRWxCLFlBQVUsRUFBQSxzQkFBRztBQUNYLFFBQUksSUFBSSxDQUFDLGFBQWEsRUFDcEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtHQUMvQjs7QUFFRCxrQkFBZ0IsRUFBQSwwQkFBQyxTQUFTLEVBQUU7QUFDMUIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBa0IsU0FBUyxDQUFDLENBQUE7QUFDakQsUUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtHQUMzQjs7Q0FFRiIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS8uYXRvbS9wYWNrYWdlcy9hdG9tLWNsb2NrL2xpYi9hdG9tLWNsb2NrLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBBdG9tQ2xvY2tWaWV3IGZyb20gJy4vYXRvbS1jbG9jay12aWV3J1xuXG5leHBvcnQgZGVmYXVsdCB7XG5cbiAgY29uZmlnOiB7XG4gICAgZGF0ZUZvcm1hdDoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICB0aXRsZTogJ1RpbWUgZm9ybWF0JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnU3BlY2lmeSB0aGUgdGltZSBmb3JtYXQuIFtIZXJlXShodHRwOi8vbW9tZW50anMuY29tL2RvY3MvIy9kaXNwbGF5aW5nL2Zvcm1hdC8pIHlvdSBjYW4gZmluZCBhbGwgdGhlIGF2YWlsYWJsZSBmb3JtYXRzLicsXG4gICAgICBkZWZhdWx0OiAnSDptbScsXG4gICAgICBvcmRlcjogMVxuICAgIH0sIHNob3dUb29sdGlwOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICB0aXRsZTogJ0VuYWJsZSB0b29sdGlwJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnRW5hYmxlcyBhIGN1c3RvbWlzYWJsZSB0b29sdGlwIHdoZW4geW91IGhvdmVyIG92ZXIgdGhlIHRpbWUnLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICBvcmRlcjogMlxuICAgIH0sIHRvb2x0aXBEYXRlRm9ybWF0OiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIHRpdGxlOiAnVG9vbHRpcCB0aW1lIGZvcm1hdCcsXG4gICAgICBkZXNjcmlwdGlvbjogJ1NwZWNpZnkgdGhlIHRpbWUgZm9ybWF0IGluIHRoZSB0b29sdGlwLiBbSGVyZV0oaHR0cDovL21vbWVudGpzLmNvbS9kb2NzLyMvZGlzcGxheWluZy9mb3JtYXQvKSB5b3UgY2FuIGZpbmQgYWxsIHRoZSBhdmFpbGFibGUgZm9ybWF0cy4nLFxuICAgICAgZGVmYXVsdDogJ0xMTEwnLFxuICAgICAgb3JkZXI6IDNcbiAgICB9LCBsb2NhbGU6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgdGl0bGU6ICdMb2NhbGUnLFxuICAgICAgZGVzY3JpcHRpb246ICdTcGVjaWZ5IHRoZSB0aW1lIGxvY2FsZS4gW0hlcmVdKGh0dHBzOi8vZ2l0aHViLmNvbS9tb21lbnQvbW9tZW50L3RyZWUvbWFzdGVyL2xvY2FsZSkgeW91IGNhbiBmaW5kIGFsbCB0aGUgYXZhaWxhYmxlIGxvY2FsZXMuJyxcbiAgICAgIGRlZmF1bHQ6ICdlbicsXG4gICAgICBvcmRlcjogNFxuICAgIH0sIHJlZnJlc2hJbnRlcnZhbDoge1xuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgdGl0bGU6ICdDbG9jayBpbnRlcnZhbCcsXG4gICAgICBkZXNjcmlwdGlvbjogJ1NwZWNpZnkgdGhlIHJlZnJlc2ggaW50ZXJ2YWwgKGluIHNlY29uZHMpIGZvciB0aGUgcGx1Z2luIHRvIGV2YWx1YXRlIHRoZSBkYXRlLicsXG4gICAgICBkZWZhdWx0OiA2MCxcbiAgICAgIG1pbmltdW06IDEsXG4gICAgICBvcmRlcjogNVxuICAgIH0sIHNob3dDbG9ja0ljb246IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIHRpdGxlOiAnSWNvbiBjbG9jaycsXG4gICAgICBkZXNjcmlwdGlvbjogJ1Nob3cgY2xvY2sgaWNvbiBpbiB0aGUgc3RhdHVzIGJhcj8nLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICBvcmRlcjogNlxuICAgIH1cbiAgfSxcblxuICBhY3RpdmF0ZShzdGF0ZSkge30sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICBpZiAodGhpcy5hdG9tQ2xvY2tWaWV3KVxuICAgICAgdGhpcy5hdG9tQ2xvY2tWaWV3LmRlc3Ryb3koKVxuICB9LFxuXG4gIGNvbnN1bWVTdGF0dXNCYXIoc3RhdHVzQmFyKSB7XG4gICAgdGhpcy5hdG9tQ2xvY2tWaWV3ID0gbmV3IEF0b21DbG9ja1ZpZXcoc3RhdHVzQmFyKVxuICAgIHRoaXMuYXRvbUNsb2NrVmlldy5zdGFydCgpXG4gIH1cblxufVxuIl19