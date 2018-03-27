Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getElement = getElement;

// eslint-disable-next-line import/prefer-default-export

function getElement(icon) {
  var element = document.createElement('a');
  var iconElement = document.createElement('span');

  iconElement.classList.add('icon');
  iconElement.classList.add('icon-' + icon);

  element.appendChild(iconElement);
  element.appendChild(document.createTextNode(''));

  return element;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9zdGF0dXMtYmFyL2hlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUdPLFNBQVMsVUFBVSxDQUFDLElBQVksRUFBZTtBQUNwRCxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQzNDLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUE7O0FBRWxELGFBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ2pDLGFBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxXQUFTLElBQUksQ0FBRyxDQUFBOztBQUV6QyxTQUFPLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ2hDLFNBQU8sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBOztBQUVoRCxTQUFPLE9BQU8sQ0FBQTtDQUNmIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9zdGF0dXMtYmFyL2hlbHBlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L3ByZWZlci1kZWZhdWx0LWV4cG9ydFxuZXhwb3J0IGZ1bmN0aW9uIGdldEVsZW1lbnQoaWNvbjogc3RyaW5nKTogSFRNTEVsZW1lbnQge1xuICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpXG4gIGNvbnN0IGljb25FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG5cbiAgaWNvbkVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaWNvbicpXG4gIGljb25FbGVtZW50LmNsYXNzTGlzdC5hZGQoYGljb24tJHtpY29ufWApXG5cbiAgZWxlbWVudC5hcHBlbmRDaGlsZChpY29uRWxlbWVudClcbiAgZWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJykpXG5cbiAgcmV0dXJuIGVsZW1lbnRcbn1cbiJdfQ==