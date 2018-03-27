function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _helperToggleClassName = require('../helper/toggle-class-name');

var _helperToggleClassName2 = _interopRequireDefault(_helperToggleClassName);

'use babel';

atom.config.observe('atom-material-ui.ui.panelShadows', function (value) {
    (0, _helperToggleClassName2['default'])('amu-panel-shadows', value);
});

atom.config.observe('atom-material-ui.ui.panelContrast', function (value) {
    (0, _helperToggleClassName2['default'])('amu-panel-contrast', value);
});

atom.config.observe('atom-material-ui.ui.useAnimations', function (value) {
    (0, _helperToggleClassName2['default'])('amu-use-animations', value);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2F0b20tbWF0ZXJpYWwtdWkvbGliL3VzZXItaW50ZXJmYWNlL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O3FDQUU0Qiw2QkFBNkI7Ozs7QUFGekQsV0FBVyxDQUFDOztBQUlaLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGtDQUFrQyxFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQy9ELDRDQUFnQixtQkFBbUIsRUFBRSxLQUFLLENBQUMsQ0FBQztDQUMvQyxDQUFDLENBQUM7O0FBRUgsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsbUNBQW1DLEVBQUUsVUFBQyxLQUFLLEVBQUs7QUFDaEUsNENBQWdCLG9CQUFvQixFQUFFLEtBQUssQ0FBQyxDQUFDO0NBQ2hELENBQUMsQ0FBQzs7QUFFSCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxtQ0FBbUMsRUFBRSxVQUFDLEtBQUssRUFBSztBQUNoRSw0Q0FBZ0Isb0JBQW9CLEVBQUUsS0FBSyxDQUFDLENBQUM7Q0FDaEQsQ0FBQyxDQUFDIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2F0b20tbWF0ZXJpYWwtdWkvbGliL3VzZXItaW50ZXJmYWNlL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB0b2dnbGVDbGFzc05hbWUgZnJvbSAnLi4vaGVscGVyL3RvZ2dsZS1jbGFzcy1uYW1lJztcblxuYXRvbS5jb25maWcub2JzZXJ2ZSgnYXRvbS1tYXRlcmlhbC11aS51aS5wYW5lbFNoYWRvd3MnLCAodmFsdWUpID0+IHtcbiAgICB0b2dnbGVDbGFzc05hbWUoJ2FtdS1wYW5lbC1zaGFkb3dzJywgdmFsdWUpO1xufSk7XG5cbmF0b20uY29uZmlnLm9ic2VydmUoJ2F0b20tbWF0ZXJpYWwtdWkudWkucGFuZWxDb250cmFzdCcsICh2YWx1ZSkgPT4ge1xuICAgIHRvZ2dsZUNsYXNzTmFtZSgnYW11LXBhbmVsLWNvbnRyYXN0JywgdmFsdWUpO1xufSk7XG5cbmF0b20uY29uZmlnLm9ic2VydmUoJ2F0b20tbWF0ZXJpYWwtdWkudWkudXNlQW5pbWF0aW9ucycsICh2YWx1ZSkgPT4ge1xuICAgIHRvZ2dsZUNsYXNzTmFtZSgnYW11LXVzZS1hbmltYXRpb25zJywgdmFsdWUpO1xufSk7XG4iXX0=