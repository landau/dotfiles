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
    }, locale: {
      type: 'string',
      title: 'Locale',
      description: 'Specify the time locale. [Here](https://github.com/moment/moment/tree/master/locale) you can find all the available locales.',
      'default': 'en',
      order: 2
    }, refreshInterval: {
      type: 'integer',
      title: 'Clock interval',
      description: 'Specify the refresh interval (in seconds) for the plugin to evaluate the date.',
      'default': 60,
      minimum: 1,
      order: 3
    }, showTooltip: {
      type: 'boolean',
      title: 'Enable tooltip',
      description: 'Enables a customisable tooltip when you hover over the time.',
      'default': false,
      order: 4
    }, tooltipDateFormat: {
      type: 'string',
      title: 'Tooltip time format',
      description: 'Specify the time format in the tooltip. [Here](http://momentjs.com/docs/#/displaying/format/) you can find all the available formats.',
      'default': 'LLLL',
      order: 5
    }, showUTC: {
      type: 'boolean',
      title: 'Display UTC time',
      description: 'Use UTC to display the time instead of local time.',
      'default': false,
      order: 6
    }, showClockIcon: {
      type: 'boolean',
      title: 'Icon clock',
      description: 'Show a clock icon next to the time in the status bar.',
      'default': false,
      order: 7
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2F0b20tY2xvY2svbGliL2F0b20tY2xvY2suanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OzZCQUUwQixtQkFBbUI7Ozs7QUFGN0MsV0FBVyxDQUFDOztxQkFJRzs7QUFFYixRQUFNLEVBQUU7QUFDTixjQUFVLEVBQUU7QUFDVixVQUFJLEVBQUUsUUFBUTtBQUNkLFdBQUssRUFBRSxhQUFhO0FBQ3BCLGlCQUFXLEVBQUUsd0hBQXdIO0FBQ3JJLGlCQUFTLE1BQU07QUFDZixXQUFLLEVBQUUsQ0FBQztLQUNULEVBQUUsTUFBTSxFQUFFO0FBQ1QsVUFBSSxFQUFFLFFBQVE7QUFDZCxXQUFLLEVBQUUsUUFBUTtBQUNmLGlCQUFXLEVBQUUsOEhBQThIO0FBQzNJLGlCQUFTLElBQUk7QUFDYixXQUFLLEVBQUUsQ0FBQztLQUNULEVBQUUsZUFBZSxFQUFFO0FBQ2xCLFVBQUksRUFBRSxTQUFTO0FBQ2YsV0FBSyxFQUFFLGdCQUFnQjtBQUN2QixpQkFBVyxFQUFFLGdGQUFnRjtBQUM3RixpQkFBUyxFQUFFO0FBQ1gsYUFBTyxFQUFFLENBQUM7QUFDVixXQUFLLEVBQUUsQ0FBQztLQUNULEVBQUUsV0FBVyxFQUFFO0FBQ2QsVUFBSSxFQUFFLFNBQVM7QUFDZixXQUFLLEVBQUUsZ0JBQWdCO0FBQ3ZCLGlCQUFXLEVBQUUsOERBQThEO0FBQzNFLGlCQUFTLEtBQUs7QUFDZCxXQUFLLEVBQUUsQ0FBQztLQUNULEVBQUUsaUJBQWlCLEVBQUU7QUFDcEIsVUFBSSxFQUFFLFFBQVE7QUFDZCxXQUFLLEVBQUUscUJBQXFCO0FBQzVCLGlCQUFXLEVBQUUsdUlBQXVJO0FBQ3BKLGlCQUFTLE1BQU07QUFDZixXQUFLLEVBQUUsQ0FBQztLQUNULEVBQUUsT0FBTyxFQUFFO0FBQ1YsVUFBSSxFQUFFLFNBQVM7QUFDZixXQUFLLEVBQUUsa0JBQWtCO0FBQ3pCLGlCQUFXLEVBQUUsb0RBQW9EO0FBQ2pFLGlCQUFTLEtBQUs7QUFDZCxXQUFLLEVBQUUsQ0FBQztLQUNULEVBQUUsYUFBYSxFQUFFO0FBQ2hCLFVBQUksRUFBRSxTQUFTO0FBQ2YsV0FBSyxFQUFFLFlBQVk7QUFDbkIsaUJBQVcsRUFBRSx1REFBdUQ7QUFDcEUsaUJBQVMsS0FBSztBQUNkLFdBQUssRUFBRSxDQUFDO0tBQ1Q7R0FDRjs7QUFFRCxVQUFRLEVBQUEsa0JBQUMsS0FBSyxFQUFFLEVBQUU7O0FBRWxCLFlBQVUsRUFBQSxzQkFBRztBQUNYLFFBQUksSUFBSSxDQUFDLGFBQWEsRUFDcEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtHQUMvQjs7QUFFRCxrQkFBZ0IsRUFBQSwwQkFBQyxTQUFTLEVBQUU7QUFDMUIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBa0IsU0FBUyxDQUFDLENBQUE7QUFDakQsUUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtHQUMzQjs7Q0FFRiIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS8uYXRvbS9wYWNrYWdlcy9hdG9tLWNsb2NrL2xpYi9hdG9tLWNsb2NrLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBBdG9tQ2xvY2tWaWV3IGZyb20gJy4vYXRvbS1jbG9jay12aWV3J1xuXG5leHBvcnQgZGVmYXVsdCB7XG5cbiAgY29uZmlnOiB7XG4gICAgZGF0ZUZvcm1hdDoge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICB0aXRsZTogJ1RpbWUgZm9ybWF0JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnU3BlY2lmeSB0aGUgdGltZSBmb3JtYXQuIFtIZXJlXShodHRwOi8vbW9tZW50anMuY29tL2RvY3MvIy9kaXNwbGF5aW5nL2Zvcm1hdC8pIHlvdSBjYW4gZmluZCBhbGwgdGhlIGF2YWlsYWJsZSBmb3JtYXRzLicsXG4gICAgICBkZWZhdWx0OiAnSDptbScsXG4gICAgICBvcmRlcjogMVxuICAgIH0sIGxvY2FsZToge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICB0aXRsZTogJ0xvY2FsZScsXG4gICAgICBkZXNjcmlwdGlvbjogJ1NwZWNpZnkgdGhlIHRpbWUgbG9jYWxlLiBbSGVyZV0oaHR0cHM6Ly9naXRodWIuY29tL21vbWVudC9tb21lbnQvdHJlZS9tYXN0ZXIvbG9jYWxlKSB5b3UgY2FuIGZpbmQgYWxsIHRoZSBhdmFpbGFibGUgbG9jYWxlcy4nLFxuICAgICAgZGVmYXVsdDogJ2VuJyxcbiAgICAgIG9yZGVyOiAyXG4gICAgfSwgcmVmcmVzaEludGVydmFsOiB7XG4gICAgICB0eXBlOiAnaW50ZWdlcicsXG4gICAgICB0aXRsZTogJ0Nsb2NrIGludGVydmFsJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnU3BlY2lmeSB0aGUgcmVmcmVzaCBpbnRlcnZhbCAoaW4gc2Vjb25kcykgZm9yIHRoZSBwbHVnaW4gdG8gZXZhbHVhdGUgdGhlIGRhdGUuJyxcbiAgICAgIGRlZmF1bHQ6IDYwLFxuICAgICAgbWluaW11bTogMSxcbiAgICAgIG9yZGVyOiAzXG4gICAgfSwgc2hvd1Rvb2x0aXA6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIHRpdGxlOiAnRW5hYmxlIHRvb2x0aXAnLFxuICAgICAgZGVzY3JpcHRpb246ICdFbmFibGVzIGEgY3VzdG9taXNhYmxlIHRvb2x0aXAgd2hlbiB5b3UgaG92ZXIgb3ZlciB0aGUgdGltZS4nLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICBvcmRlcjogNFxuICAgIH0sIHRvb2x0aXBEYXRlRm9ybWF0OiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIHRpdGxlOiAnVG9vbHRpcCB0aW1lIGZvcm1hdCcsXG4gICAgICBkZXNjcmlwdGlvbjogJ1NwZWNpZnkgdGhlIHRpbWUgZm9ybWF0IGluIHRoZSB0b29sdGlwLiBbSGVyZV0oaHR0cDovL21vbWVudGpzLmNvbS9kb2NzLyMvZGlzcGxheWluZy9mb3JtYXQvKSB5b3UgY2FuIGZpbmQgYWxsIHRoZSBhdmFpbGFibGUgZm9ybWF0cy4nLFxuICAgICAgZGVmYXVsdDogJ0xMTEwnLFxuICAgICAgb3JkZXI6IDVcbiAgICB9LCBzaG93VVRDOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICB0aXRsZTogJ0Rpc3BsYXkgVVRDIHRpbWUnLFxuICAgICAgZGVzY3JpcHRpb246ICdVc2UgVVRDIHRvIGRpc3BsYXkgdGhlIHRpbWUgaW5zdGVhZCBvZiBsb2NhbCB0aW1lLicsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIG9yZGVyOiA2XG4gICAgfSwgc2hvd0Nsb2NrSWNvbjoge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgdGl0bGU6ICdJY29uIGNsb2NrJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2hvdyBhIGNsb2NrIGljb24gbmV4dCB0byB0aGUgdGltZSBpbiB0aGUgc3RhdHVzIGJhci4nLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICBvcmRlcjogN1xuICAgIH1cbiAgfSxcblxuICBhY3RpdmF0ZShzdGF0ZSkge30sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICBpZiAodGhpcy5hdG9tQ2xvY2tWaWV3KVxuICAgICAgdGhpcy5hdG9tQ2xvY2tWaWV3LmRlc3Ryb3koKVxuICB9LFxuXG4gIGNvbnN1bWVTdGF0dXNCYXIoc3RhdHVzQmFyKSB7XG4gICAgdGhpcy5hdG9tQ2xvY2tWaWV3ID0gbmV3IEF0b21DbG9ja1ZpZXcoc3RhdHVzQmFyKVxuICAgIHRoaXMuYXRvbUNsb2NrVmlldy5zdGFydCgpXG4gIH1cblxufVxuIl19