'use babel';
/* global atom */

Object.defineProperty(exports, '__esModule', {
  value: true
});

exports['default'] = function (content) {
  if (!atom.config.get('graphql-autocomplete.disableErrors.templateString')) return content;
  return content.replace(/(?:...)?\${\w+}/g, '').replace(/\${[\w.]+}/g, ' ');
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2dyYXBocWwtYXV0b2NvbXBsZXRlL2xpYi9ncmFwaHFsL2NsZWFuUXVlcnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7O3FCQUdJLFVBQVUsT0FBTyxFQUFFO0FBQ2hDLE1BQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxtREFBbUQsQ0FBQyxFQUFFLE9BQU8sT0FBTyxDQUFBO0FBQ3pGLFNBQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0NBQzNFIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2dyYXBocWwtYXV0b2NvbXBsZXRlL2xpYi9ncmFwaHFsL2NsZWFuUXVlcnkuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuLyogZ2xvYmFsIGF0b20gKi9cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKGNvbnRlbnQpIHtcbiAgaWYgKCFhdG9tLmNvbmZpZy5nZXQoJ2dyYXBocWwtYXV0b2NvbXBsZXRlLmRpc2FibGVFcnJvcnMudGVtcGxhdGVTdHJpbmcnKSkgcmV0dXJuIGNvbnRlbnRcbiAgcmV0dXJuIGNvbnRlbnQucmVwbGFjZSgvKD86Li4uKT9cXCR7XFx3K30vZywgJycpLnJlcGxhY2UoL1xcJHtbXFx3Ll0rfS9nLCAnICcpXG59XG4iXX0=