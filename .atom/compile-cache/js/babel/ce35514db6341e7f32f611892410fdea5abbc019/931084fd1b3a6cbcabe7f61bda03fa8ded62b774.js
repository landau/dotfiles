'use babel';
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
function toggleClass(boolean, className) {
    var root = document.querySelector('atom-workspace');

    if (boolean) {
        root.classList.add(className);
    } else {
        root.classList.remove(className);
    }
}

function toCamelCase(str) {
    return str.replace(/\s(.)/g, function ($1) {
        return $1.toUpperCase();
    }).replace(/\s/g, '').replace(/^(.)/, function ($1) {
        return $1.toLowerCase();
    });
}

exports['default'] = {
    toggleClass: toggleClass,
    toCamelCase: toCamelCase
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2F0b20tbWF0ZXJpYWwtdWkvbGliL2hlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDO0FBQ1osWUFBWSxDQUFDOzs7OztBQUViLFNBQVMsV0FBVyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUU7QUFDckMsUUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDOztBQUVwRCxRQUFJLE9BQU8sRUFBRTtBQUNULFlBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQ2pDLE1BQU07QUFDSCxZQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUNwQztDQUNKOztBQUVELFNBQVMsV0FBVyxDQUFDLEdBQUcsRUFBRTtBQUN0QixXQUFPLEdBQUcsQ0FDTCxPQUFPLENBQUMsUUFBUSxFQUFFLFVBQVMsRUFBRSxFQUFFO0FBQUUsZUFBTyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7S0FBRSxDQUFDLENBQzVELE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQ2xCLE9BQU8sQ0FBQyxNQUFNLEVBQUUsVUFBUyxFQUFFLEVBQUU7QUFBRSxlQUFPLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztLQUFFLENBQUMsQ0FBQztDQUNuRTs7cUJBRWM7QUFDWCxlQUFXLEVBQVgsV0FBVztBQUNYLGVBQVcsRUFBWCxXQUFXO0NBQ2QiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1tYXRlcmlhbC11aS9saWIvaGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiB0b2dnbGVDbGFzcyhib29sZWFuLCBjbGFzc05hbWUpIHtcbiAgICB2YXIgcm9vdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2F0b20td29ya3NwYWNlJyk7XG5cbiAgICBpZiAoYm9vbGVhbikge1xuICAgICAgICByb290LmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHRvQ2FtZWxDYXNlKHN0cikge1xuICAgIHJldHVybiBzdHJcbiAgICAgICAgLnJlcGxhY2UoL1xccyguKS9nLCBmdW5jdGlvbigkMSkgeyByZXR1cm4gJDEudG9VcHBlckNhc2UoKTsgfSlcbiAgICAgICAgLnJlcGxhY2UoL1xccy9nLCAnJylcbiAgICAgICAgLnJlcGxhY2UoL14oLikvLCBmdW5jdGlvbigkMSkgeyByZXR1cm4gJDEudG9Mb3dlckNhc2UoKTsgfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICB0b2dnbGVDbGFzcyxcbiAgICB0b0NhbWVsQ2FzZVxufTtcbiJdfQ==
//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-material-ui/lib/helpers.js
