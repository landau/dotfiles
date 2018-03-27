Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Snippets = require('./Snippets');

var _Snippets2 = _interopRequireDefault(_Snippets);

var _Linter = require('./Linter');

var _Linter2 = _interopRequireDefault(_Linter);

'use babel';
exports['default'] = {

  orionsoftView: null,
  modalPanel: null,
  subscriptions: null,

  config: {
    disableErrors: {
      type: 'object',
      properties: {
        fragmentIsNeverUsed: {
          title: 'Disable fragment is never used',
          type: 'boolean',
          'default': true
        },
        unknownFragment: {
          title: 'Disable unkown fragment',
          type: 'boolean',
          'default': true
        },
        templateString: {
          title: 'Template string in JS',
          type: 'boolean',
          'default': true
        }
      }
    }
  },

  activate: function activate(state) {
    this.completionProvider = new _Snippets2['default']();
    this.linter = new _Linter2['default']();
  },

  deactivate: function deactivate() {
    delete this.linter;
    this.linter = null;
    delete this.completionProvider;
    this.completionProvider = null;
  },

  serialize: function serialize() {
    return {};
  },

  provideLinter: function provideLinter() {
    return this.linter;
  },

  getCompletionProvider: function getCompletionProvider() {
    return this.completionProvider;
  }

};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2dyYXBocWwtYXV0b2NvbXBsZXRlL2xpYi9ncmFwaHFsLWF1dG9jb21wbGV0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7d0JBQ3FCLFlBQVk7Ozs7c0JBQ2QsVUFBVTs7OztBQUY3QixXQUFXLENBQUE7cUJBSUk7O0FBRWIsZUFBYSxFQUFFLElBQUk7QUFDbkIsWUFBVSxFQUFFLElBQUk7QUFDaEIsZUFBYSxFQUFFLElBQUk7O0FBRW5CLFFBQU0sRUFBRTtBQUNOLGlCQUFhLEVBQUU7QUFDYixVQUFJLEVBQUUsUUFBUTtBQUNkLGdCQUFVLEVBQUU7QUFDViwyQkFBbUIsRUFBRTtBQUNuQixlQUFLLEVBQUUsZ0NBQWdDO0FBQ3ZDLGNBQUksRUFBRSxTQUFTO0FBQ2YscUJBQVMsSUFBSTtTQUNkO0FBQ0QsdUJBQWUsRUFBRTtBQUNmLGVBQUssRUFBRSx5QkFBeUI7QUFDaEMsY0FBSSxFQUFFLFNBQVM7QUFDZixxQkFBUyxJQUFJO1NBQ2Q7QUFDRCxzQkFBYyxFQUFFO0FBQ2QsZUFBSyxFQUFFLHVCQUF1QjtBQUM5QixjQUFJLEVBQUUsU0FBUztBQUNmLHFCQUFTLElBQUk7U0FDZDtPQUNGO0tBQ0Y7R0FDRjs7QUFFRCxVQUFRLEVBQUMsa0JBQUMsS0FBSyxFQUFFO0FBQ2YsUUFBSSxDQUFDLGtCQUFrQixHQUFHLDJCQUFjLENBQUE7QUFDeEMsUUFBSSxDQUFDLE1BQU0sR0FBRyx5QkFBWSxDQUFBO0dBQzNCOztBQUVELFlBQVUsRUFBQyxzQkFBRztBQUNaLFdBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQTtBQUNsQixRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQTtBQUNsQixXQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQTtBQUM5QixRQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFBO0dBQy9COztBQUVELFdBQVMsRUFBQyxxQkFBRztBQUNYLFdBQU8sRUFBRSxDQUFBO0dBQ1Y7O0FBRUQsZUFBYSxFQUFDLHlCQUFHO0FBQ2YsV0FBTyxJQUFJLENBQUMsTUFBTSxDQUFBO0dBQ25COztBQUVELHVCQUFxQixFQUFDLGlDQUFHO0FBQ3ZCLFdBQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFBO0dBQy9COztDQUVGIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2dyYXBocWwtYXV0b2NvbXBsZXRlL2xpYi9ncmFwaHFsLWF1dG9jb21wbGV0ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5pbXBvcnQgU25pcHBldHMgZnJvbSAnLi9TbmlwcGV0cydcbmltcG9ydCBMaW50ZXIgZnJvbSAnLi9MaW50ZXInXG5cbmV4cG9ydCBkZWZhdWx0IHtcblxuICBvcmlvbnNvZnRWaWV3OiBudWxsLFxuICBtb2RhbFBhbmVsOiBudWxsLFxuICBzdWJzY3JpcHRpb25zOiBudWxsLFxuXG4gIGNvbmZpZzoge1xuICAgIGRpc2FibGVFcnJvcnM6IHtcbiAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgcHJvcGVydGllczoge1xuICAgICAgICBmcmFnbWVudElzTmV2ZXJVc2VkOiB7XG4gICAgICAgICAgdGl0bGU6ICdEaXNhYmxlIGZyYWdtZW50IGlzIG5ldmVyIHVzZWQnLFxuICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHVua25vd25GcmFnbWVudDoge1xuICAgICAgICAgIHRpdGxlOiAnRGlzYWJsZSB1bmtvd24gZnJhZ21lbnQnLFxuICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHRlbXBsYXRlU3RyaW5nOiB7XG4gICAgICAgICAgdGl0bGU6ICdUZW1wbGF0ZSBzdHJpbmcgaW4gSlMnLFxuICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgYWN0aXZhdGUgKHN0YXRlKSB7XG4gICAgdGhpcy5jb21wbGV0aW9uUHJvdmlkZXIgPSBuZXcgU25pcHBldHMoKVxuICAgIHRoaXMubGludGVyID0gbmV3IExpbnRlcigpXG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSAoKSB7XG4gICAgZGVsZXRlIHRoaXMubGludGVyXG4gICAgdGhpcy5saW50ZXIgPSBudWxsXG4gICAgZGVsZXRlIHRoaXMuY29tcGxldGlvblByb3ZpZGVyXG4gICAgdGhpcy5jb21wbGV0aW9uUHJvdmlkZXIgPSBudWxsXG4gIH0sXG5cbiAgc2VyaWFsaXplICgpIHtcbiAgICByZXR1cm4ge31cbiAgfSxcblxuICBwcm92aWRlTGludGVyICgpIHtcbiAgICByZXR1cm4gdGhpcy5saW50ZXJcbiAgfSxcblxuICBnZXRDb21wbGV0aW9uUHJvdmlkZXIgKCkge1xuICAgIHJldHVybiB0aGlzLmNvbXBsZXRpb25Qcm92aWRlclxuICB9XG5cbn1cbiJdfQ==