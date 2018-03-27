Object.defineProperty(exports, '__esModule', {
  value: true
});

var _isType = require('./isType');

'use babel';

exports['default'] = function (content, editor) {
  if ((0, _isType.isJS)(content, editor)) {
    var queries = [];
    var regex = /(?:gql|Relay\.QL)`((?:.|\n)+?)`/g;
    var match = undefined;
    while ((match = regex.exec(content)) !== null) {
      if (match.index === regex.lastIndex) regex.lastIndex++;
      var query = match[1];
      queries.push(query);
    }
    return queries;
  } else if ((0, _isType.isGQL)(content, editor)) {
    return [content];
  } else {
    return [];
  }
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2dyYXBocWwtYXV0b2NvbXBsZXRlL2xpYi9ncmFwaHFsL2dldFF1ZXJpZXNJbkZpbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztzQkFFMEIsVUFBVTs7QUFGcEMsV0FBVyxDQUFBOztxQkFJSSxVQUFVLE9BQU8sRUFBRSxNQUFNLEVBQUU7QUFDeEMsTUFBSSxrQkFBSyxPQUFPLEVBQUUsTUFBTSxDQUFDLEVBQUU7QUFDekIsUUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFBO0FBQ2xCLFFBQU0sS0FBSyxHQUFHLGtDQUFrQyxDQUFBO0FBQ2hELFFBQUksS0FBSyxZQUFBLENBQUE7QUFDVCxXQUFPLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUEsS0FBTSxJQUFJLEVBQUU7QUFDN0MsVUFBSSxLQUFLLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFBO0FBQ3RELFVBQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN0QixhQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0tBQ3BCO0FBQ0QsV0FBTyxPQUFPLENBQUE7R0FDZixNQUFNLElBQUksbUJBQU0sT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUFFO0FBQ2pDLFdBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQTtHQUNqQixNQUFNO0FBQ0wsV0FBTyxFQUFFLENBQUE7R0FDVjtDQUNGIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2dyYXBocWwtYXV0b2NvbXBsZXRlL2xpYi9ncmFwaHFsL2dldFF1ZXJpZXNJbkZpbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQge2lzSlMsIGlzR1FMfSBmcm9tICcuL2lzVHlwZSdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKGNvbnRlbnQsIGVkaXRvcikge1xuICBpZiAoaXNKUyhjb250ZW50LCBlZGl0b3IpKSB7XG4gICAgY29uc3QgcXVlcmllcyA9IFtdXG4gICAgY29uc3QgcmVnZXggPSAvKD86Z3FsfFJlbGF5XFwuUUwpYCgoPzoufFxcbikrPylgL2dcbiAgICBsZXQgbWF0Y2hcbiAgICB3aGlsZSAoKG1hdGNoID0gcmVnZXguZXhlYyhjb250ZW50KSkgIT09IG51bGwpIHtcbiAgICAgIGlmIChtYXRjaC5pbmRleCA9PT0gcmVnZXgubGFzdEluZGV4KSByZWdleC5sYXN0SW5kZXgrK1xuICAgICAgY29uc3QgcXVlcnkgPSBtYXRjaFsxXVxuICAgICAgcXVlcmllcy5wdXNoKHF1ZXJ5KVxuICAgIH1cbiAgICByZXR1cm4gcXVlcmllc1xuICB9IGVsc2UgaWYgKGlzR1FMKGNvbnRlbnQsIGVkaXRvcikpIHtcbiAgICByZXR1cm4gW2NvbnRlbnRdXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIFtdXG4gIH1cbn1cbiJdfQ==