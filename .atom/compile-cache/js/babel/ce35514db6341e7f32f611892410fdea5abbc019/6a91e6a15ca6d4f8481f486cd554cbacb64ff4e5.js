Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.spawnWorker = spawnWorker;
exports.showError = showError;
exports.ruleURI = ruleURI;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _atom = require('atom');

var _processCommunication = require('process-communication');

var _path = require('path');

'use babel';

function spawnWorker() {
  var env = Object.create(process.env);

  delete env.NODE_PATH;
  delete env.NODE_ENV;
  delete env.OS;

  var child = _child_process2['default'].fork((0, _path.join)(__dirname, 'worker.js'), [], { env: env, silent: true });
  var worker = (0, _processCommunication.createFromProcess)(child);

  child.stdout.on('data', function (chunk) {
    console.log('[Linter-ESLint] STDOUT', chunk.toString());
  });
  child.stderr.on('data', function (chunk) {
    console.log('[Linter-ESLint] STDERR', chunk.toString());
  });

  return { worker: worker, subscription: new _atom.Disposable(function () {
      worker.kill();
    }) };
}

function showError(givenMessage) {
  var givenDetail = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  var detail = undefined;
  var message = undefined;
  if (message instanceof Error) {
    detail = message.stack;
    message = message.message;
  } else {
    detail = givenDetail;
    message = givenMessage;
  }
  atom.notifications.addError('[Linter-ESLint] ' + message, {
    detail: detail,
    dismissable: true
  });
}

function ruleURI(ruleId) {
  var ruleParts = ruleId.split('/');

  if (ruleParts.length === 1) {
    return 'http://eslint.org/docs/rules/' + ruleId;
  }

  var pluginName = ruleParts[0];
  var ruleName = ruleParts[1];
  switch (pluginName) {
    case 'angular':
      return 'https://github.com/Gillespie59/eslint-plugin-angular/blob/master/docs/' + ruleName + '.md';

    case 'ava':
      return 'https://github.com/sindresorhus/eslint-plugin-ava/blob/master/docs/rules/' + ruleName + '.md';

    case 'import':
      return 'https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/' + ruleName + '.md';

    case 'import-order':
      return 'https://github.com/jfmengels/eslint-plugin-import-order/blob/master/docs/rules/' + ruleName + '.md';

    case 'jasmine':
      return 'https://github.com/tlvince/eslint-plugin-jasmine/blob/master/docs/rules/' + ruleName + '.md';

    case 'jsx-a11y':
      return 'https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/' + ruleName + '.md';

    case 'lodash':
      return 'https://github.com/wix/eslint-plugin-lodash/blob/master/docs/rules/' + ruleName + '.md';

    case 'mocha':
      return 'https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/' + ruleName + '.md';

    case 'promise':
      return 'https://github.com/xjamundx/eslint-plugin-promise#' + ruleName;

    case 'react':
      return 'https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/' + ruleName + '.md';

    default:
      return 'https://github.com/AtomLinter/linter-eslint/wiki/Linking-to-Rule-Documentation';
  }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci1lc2xpbnQvc3JjL2hlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OzZCQUV5QixlQUFlOzs7O29CQUNiLE1BQU07O29DQUNDLHVCQUF1Qjs7b0JBQ3BDLE1BQU07O0FBTDNCLFdBQVcsQ0FBQTs7QUFPSixTQUFTLFdBQVcsR0FBRztBQUM1QixNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQTs7QUFFdEMsU0FBTyxHQUFHLENBQUMsU0FBUyxDQUFBO0FBQ3BCLFNBQU8sR0FBRyxDQUFDLFFBQVEsQ0FBQTtBQUNuQixTQUFPLEdBQUcsQ0FBQyxFQUFFLENBQUE7O0FBRWIsTUFBTSxLQUFLLEdBQUcsMkJBQWEsSUFBSSxDQUFDLGdCQUFLLFNBQVMsRUFBRSxXQUFXLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUgsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO0FBQ3hGLE1BQU0sTUFBTSxHQUFHLDZDQUFrQixLQUFLLENBQUMsQ0FBQTs7QUFFdkMsT0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQ2pDLFdBQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7R0FDeEQsQ0FBQyxDQUFBO0FBQ0YsT0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQ2pDLFdBQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7R0FDeEQsQ0FBQyxDQUFBOztBQUVGLFNBQU8sRUFBRSxNQUFNLEVBQU4sTUFBTSxFQUFFLFlBQVksRUFBRSxxQkFBZSxZQUFNO0FBQ2xELFlBQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQTtLQUNkLENBQUMsRUFBRSxDQUFBO0NBQ0w7O0FBRU0sU0FBUyxTQUFTLENBQUMsWUFBWSxFQUFzQjtNQUFwQixXQUFXLHlEQUFHLElBQUk7O0FBQ3hELE1BQUksTUFBTSxZQUFBLENBQUE7QUFDVixNQUFJLE9BQU8sWUFBQSxDQUFBO0FBQ1gsTUFBSSxPQUFPLFlBQVksS0FBSyxFQUFFO0FBQzVCLFVBQU0sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFBO0FBQ3RCLFdBQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFBO0dBQzFCLE1BQU07QUFDTCxVQUFNLEdBQUcsV0FBVyxDQUFBO0FBQ3BCLFdBQU8sR0FBRyxZQUFZLENBQUE7R0FDdkI7QUFDRCxNQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsc0JBQW9CLE9BQU8sRUFBSTtBQUN4RCxVQUFNLEVBQU4sTUFBTTtBQUNOLGVBQVcsRUFBRSxJQUFJO0dBQ2xCLENBQUMsQ0FBQTtDQUNIOztBQUVNLFNBQVMsT0FBTyxDQUFDLE1BQU0sRUFBRTtBQUM5QixNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBOztBQUVuQyxNQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQzFCLDZDQUF1QyxNQUFNLENBQUU7R0FDaEQ7O0FBRUQsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQy9CLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUM3QixVQUFRLFVBQVU7QUFDaEIsU0FBSyxTQUFTO0FBQ1osd0ZBQWdGLFFBQVEsU0FBSzs7QUFBQSxBQUUvRixTQUFLLEtBQUs7QUFDUiwyRkFBbUYsUUFBUSxTQUFLOztBQUFBLEFBRWxHLFNBQUssUUFBUTtBQUNYLDJGQUFtRixRQUFRLFNBQUs7O0FBQUEsQUFFbEcsU0FBSyxjQUFjO0FBQ2pCLGlHQUF5RixRQUFRLFNBQUs7O0FBQUEsQUFFeEcsU0FBSyxTQUFTO0FBQ1osMEZBQWtGLFFBQVEsU0FBSzs7QUFBQSxBQUVqRyxTQUFLLFVBQVU7QUFDYiwyRkFBbUYsUUFBUSxTQUFLOztBQUFBLEFBRWxHLFNBQUssUUFBUTtBQUNYLHFGQUE2RSxRQUFRLFNBQUs7O0FBQUEsQUFFNUYsU0FBSyxPQUFPO0FBQ1Ysd0ZBQWdGLFFBQVEsU0FBSzs7QUFBQSxBQUUvRixTQUFLLFNBQVM7QUFDWixvRUFBNEQsUUFBUSxDQUFFOztBQUFBLEFBRXhFLFNBQUssT0FBTztBQUNWLDBGQUFrRixRQUFRLFNBQUs7O0FBQUEsQUFFakc7QUFDRSxhQUFPLGdGQUFnRixDQUFBO0FBQUEsR0FDMUY7Q0FDRiIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9saW50ZXItZXNsaW50L3NyYy9oZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IENoaWxkUHJvY2VzcyBmcm9tICdjaGlsZF9wcm9jZXNzJ1xuaW1wb3J0IHsgRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgeyBjcmVhdGVGcm9tUHJvY2VzcyB9IGZyb20gJ3Byb2Nlc3MtY29tbXVuaWNhdGlvbidcbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJ1xuXG5leHBvcnQgZnVuY3Rpb24gc3Bhd25Xb3JrZXIoKSB7XG4gIGNvbnN0IGVudiA9IE9iamVjdC5jcmVhdGUocHJvY2Vzcy5lbnYpXG5cbiAgZGVsZXRlIGVudi5OT0RFX1BBVEhcbiAgZGVsZXRlIGVudi5OT0RFX0VOVlxuICBkZWxldGUgZW52Lk9TXG5cbiAgY29uc3QgY2hpbGQgPSBDaGlsZFByb2Nlc3MuZm9yayhqb2luKF9fZGlybmFtZSwgJ3dvcmtlci5qcycpLCBbXSwgeyBlbnYsIHNpbGVudDogdHJ1ZSB9KVxuICBjb25zdCB3b3JrZXIgPSBjcmVhdGVGcm9tUHJvY2VzcyhjaGlsZClcblxuICBjaGlsZC5zdGRvdXQub24oJ2RhdGEnLCAoY2h1bmspID0+IHtcbiAgICBjb25zb2xlLmxvZygnW0xpbnRlci1FU0xpbnRdIFNURE9VVCcsIGNodW5rLnRvU3RyaW5nKCkpXG4gIH0pXG4gIGNoaWxkLnN0ZGVyci5vbignZGF0YScsIChjaHVuaykgPT4ge1xuICAgIGNvbnNvbGUubG9nKCdbTGludGVyLUVTTGludF0gU1RERVJSJywgY2h1bmsudG9TdHJpbmcoKSlcbiAgfSlcblxuICByZXR1cm4geyB3b3JrZXIsIHN1YnNjcmlwdGlvbjogbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgIHdvcmtlci5raWxsKClcbiAgfSkgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvd0Vycm9yKGdpdmVuTWVzc2FnZSwgZ2l2ZW5EZXRhaWwgPSBudWxsKSB7XG4gIGxldCBkZXRhaWxcbiAgbGV0IG1lc3NhZ2VcbiAgaWYgKG1lc3NhZ2UgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgIGRldGFpbCA9IG1lc3NhZ2Uuc3RhY2tcbiAgICBtZXNzYWdlID0gbWVzc2FnZS5tZXNzYWdlXG4gIH0gZWxzZSB7XG4gICAgZGV0YWlsID0gZ2l2ZW5EZXRhaWxcbiAgICBtZXNzYWdlID0gZ2l2ZW5NZXNzYWdlXG4gIH1cbiAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKGBbTGludGVyLUVTTGludF0gJHttZXNzYWdlfWAsIHtcbiAgICBkZXRhaWwsXG4gICAgZGlzbWlzc2FibGU6IHRydWVcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJ1bGVVUkkocnVsZUlkKSB7XG4gIGNvbnN0IHJ1bGVQYXJ0cyA9IHJ1bGVJZC5zcGxpdCgnLycpXG5cbiAgaWYgKHJ1bGVQYXJ0cy5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gYGh0dHA6Ly9lc2xpbnQub3JnL2RvY3MvcnVsZXMvJHtydWxlSWR9YFxuICB9XG5cbiAgY29uc3QgcGx1Z2luTmFtZSA9IHJ1bGVQYXJ0c1swXVxuICBjb25zdCBydWxlTmFtZSA9IHJ1bGVQYXJ0c1sxXVxuICBzd2l0Y2ggKHBsdWdpbk5hbWUpIHtcbiAgICBjYXNlICdhbmd1bGFyJzpcbiAgICAgIHJldHVybiBgaHR0cHM6Ly9naXRodWIuY29tL0dpbGxlc3BpZTU5L2VzbGludC1wbHVnaW4tYW5ndWxhci9ibG9iL21hc3Rlci9kb2NzLyR7cnVsZU5hbWV9Lm1kYFxuXG4gICAgY2FzZSAnYXZhJzpcbiAgICAgIHJldHVybiBgaHR0cHM6Ly9naXRodWIuY29tL3NpbmRyZXNvcmh1cy9lc2xpbnQtcGx1Z2luLWF2YS9ibG9iL21hc3Rlci9kb2NzL3J1bGVzLyR7cnVsZU5hbWV9Lm1kYFxuXG4gICAgY2FzZSAnaW1wb3J0JzpcbiAgICAgIHJldHVybiBgaHR0cHM6Ly9naXRodWIuY29tL2Jlbm1vc2hlci9lc2xpbnQtcGx1Z2luLWltcG9ydC9ibG9iL21hc3Rlci9kb2NzL3J1bGVzLyR7cnVsZU5hbWV9Lm1kYFxuXG4gICAgY2FzZSAnaW1wb3J0LW9yZGVyJzpcbiAgICAgIHJldHVybiBgaHR0cHM6Ly9naXRodWIuY29tL2pmbWVuZ2Vscy9lc2xpbnQtcGx1Z2luLWltcG9ydC1vcmRlci9ibG9iL21hc3Rlci9kb2NzL3J1bGVzLyR7cnVsZU5hbWV9Lm1kYFxuXG4gICAgY2FzZSAnamFzbWluZSc6XG4gICAgICByZXR1cm4gYGh0dHBzOi8vZ2l0aHViLmNvbS90bHZpbmNlL2VzbGludC1wbHVnaW4tamFzbWluZS9ibG9iL21hc3Rlci9kb2NzL3J1bGVzLyR7cnVsZU5hbWV9Lm1kYFxuXG4gICAgY2FzZSAnanN4LWExMXknOlxuICAgICAgcmV0dXJuIGBodHRwczovL2dpdGh1Yi5jb20vZXZjb2hlbi9lc2xpbnQtcGx1Z2luLWpzeC1hMTF5L2Jsb2IvbWFzdGVyL2RvY3MvcnVsZXMvJHtydWxlTmFtZX0ubWRgXG5cbiAgICBjYXNlICdsb2Rhc2gnOlxuICAgICAgcmV0dXJuIGBodHRwczovL2dpdGh1Yi5jb20vd2l4L2VzbGludC1wbHVnaW4tbG9kYXNoL2Jsb2IvbWFzdGVyL2RvY3MvcnVsZXMvJHtydWxlTmFtZX0ubWRgXG5cbiAgICBjYXNlICdtb2NoYSc6XG4gICAgICByZXR1cm4gYGh0dHBzOi8vZ2l0aHViLmNvbS9sbzF0dW1hL2VzbGludC1wbHVnaW4tbW9jaGEvYmxvYi9tYXN0ZXIvZG9jcy9ydWxlcy8ke3J1bGVOYW1lfS5tZGBcblxuICAgIGNhc2UgJ3Byb21pc2UnOlxuICAgICAgcmV0dXJuIGBodHRwczovL2dpdGh1Yi5jb20veGphbXVuZHgvZXNsaW50LXBsdWdpbi1wcm9taXNlIyR7cnVsZU5hbWV9YFxuXG4gICAgY2FzZSAncmVhY3QnOlxuICAgICAgcmV0dXJuIGBodHRwczovL2dpdGh1Yi5jb20veWFubmlja2NyL2VzbGludC1wbHVnaW4tcmVhY3QvYmxvYi9tYXN0ZXIvZG9jcy9ydWxlcy8ke3J1bGVOYW1lfS5tZGBcblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gJ2h0dHBzOi8vZ2l0aHViLmNvbS9BdG9tTGludGVyL2xpbnRlci1lc2xpbnQvd2lraS9MaW5raW5nLXRvLVJ1bGUtRG9jdW1lbnRhdGlvbidcbiAgfVxufVxuIl19
//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/linter-eslint/src/helpers.js
