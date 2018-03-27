Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _sbEventKit = require('sb-event-kit');

var Element = (function () {
  function Element() {
    var _this = this;

    _classCallCheck(this, Element);

    this.item = document.createElement('div');
    this.itemErrors = document.createElement('span');
    this.itemWarnings = document.createElement('span');
    this.itemInfos = document.createElement('span');

    this.emitter = new _sbEventKit.Emitter();
    this.subscriptions = new _sbEventKit.CompositeDisposable();

    this.item.appendChild(this.itemErrors);
    this.item.appendChild(this.itemWarnings);
    this.item.appendChild(this.itemInfos);
    this.item.classList.add('inline-block');
    this.item.classList.add('linter-status-count');

    this.subscriptions.add(this.emitter);
    this.subscriptions.add(atom.tooltips.add(this.itemErrors, { title: 'Linter Errors' }));
    this.subscriptions.add(atom.tooltips.add(this.itemWarnings, { title: 'Linter Warnings' }));
    this.subscriptions.add(atom.tooltips.add(this.itemInfos, { title: 'Linter Infos' }));

    this.itemErrors.onclick = function () {
      return _this.emitter.emit('click', 'error');
    };
    this.itemWarnings.onclick = function () {
      return _this.emitter.emit('click', 'warning');
    };
    this.itemInfos.onclick = function () {
      return _this.emitter.emit('click', 'info');
    };

    this.update(0, 0, 0);
  }

  _createClass(Element, [{
    key: 'setVisibility',
    value: function setVisibility(visibility) {
      if (visibility) {
        this.item.classList.remove('hide');
      } else {
        this.item.classList.add('hide');
      }
    }
  }, {
    key: 'update',
    value: function update(countErrors, countWarnings, countInfos) {
      this.itemErrors.textContent = String(countErrors);
      this.itemWarnings.textContent = String(countWarnings);
      this.itemInfos.textContent = String(countInfos);

      if (countErrors) {
        this.itemErrors.classList.remove('highlight');
        this.itemErrors.classList.add('highlight-error');
      } else {
        this.itemErrors.classList.add('highlight');
        this.itemErrors.classList.remove('highlight-error');
      }

      if (countWarnings) {
        this.itemWarnings.classList.remove('highlight');
        this.itemWarnings.classList.add('highlight-warning');
      } else {
        this.itemWarnings.classList.add('highlight');
        this.itemWarnings.classList.remove('highlight-warning');
      }

      if (countInfos) {
        this.itemInfos.classList.remove('highlight');
        this.itemInfos.classList.add('highlight-info');
      } else {
        this.itemInfos.classList.add('highlight');
        this.itemInfos.classList.remove('highlight-info');
      }
    }
  }, {
    key: 'onDidClick',
    value: function onDidClick(callback) {
      return this.emitter.on('click', callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.subscriptions.dispose();
    }
  }]);

  return Element;
})();

exports['default'] = Element;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9zdGF0dXMtYmFyL2VsZW1lbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7MEJBRTZDLGNBQWM7O0lBR3RDLE9BQU87QUFTZixXQVRRLE9BQU8sR0FTWjs7OzBCQVRLLE9BQU87O0FBVXhCLFFBQUksQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUN6QyxRQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDaEQsUUFBSSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ2xELFFBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQTs7QUFFL0MsUUFBSSxDQUFDLE9BQU8sR0FBRyx5QkFBYSxDQUFBO0FBQzVCLFFBQUksQ0FBQyxhQUFhLEdBQUcscUNBQXlCLENBQUE7O0FBRTlDLFFBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUN0QyxRQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUE7QUFDeEMsUUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0FBQ3JDLFFBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQTtBQUN2QyxRQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQTs7QUFFOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQ3BDLFFBQUks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LENBQUE7QUFDNUMsWUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUE7T0FDL0MsTUFBTTtBQUNMLFlBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQTtBQUN6QyxZQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtPQUNsRDtLQUNGOzs7V0FDUyxvQkFBQyxRQUFrQyxFQUFjO0FBQ3pELGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQzFDOzs7V0FDTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7S0FDN0I7OztTQTVFa0IsT0FBTzs7O3FCQUFQLE9BQU8iLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvbGludGVyLXVpLWRlZmF1bHQvbGliL3N0YXR1cy1iYXIvZWxlbWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXIgfSBmcm9tICdzYi1ldmVudC1raXQnXG5pbXBvcnQgdHlwZSB7IERpc3Bvc2FibGUgfSBmcm9tICdzYi1ldmVudC1raXQnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVsZW1lbnQge1xuICBpdGVtOiBIVE1MRWxlbWVudDtcbiAgaXRlbUVycm9yczogSFRNTEVsZW1lbnQ7XG4gIGl0ZW1XYXJuaW5nczogSFRNTEVsZW1lbnQ7XG4gIGl0ZW1JbmZvczogSFRNTEVsZW1lbnQ7XG5cbiAgZW1pdHRlcjogRW1pdHRlcjtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLml0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHRoaXMuaXRlbUVycm9ycyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgIHRoaXMuaXRlbVdhcm5pbmdzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgdGhpcy5pdGVtSW5mb3MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcblxuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG5cbiAgICB0aGlzLml0ZW0uYXBwZW5kQ2hpbGQodGhpcy5pdGVtRXJyb3JzKVxuICAgIHRoaXMuaXRlbS5hcHBlbmRDaGlsZCh0aGlzLml0ZW1XYXJuaW5ncylcbiAgICB0aGlzLml0ZW0uYXBwZW5kQ2hpbGQodGhpcy5pdGVtSW5mb3MpXG4gICAgdGhpcy5pdGVtLmNsYXNzTGlzdC5hZGQoJ2lubGluZS1ibG9jaycpXG4gICAgdGhpcy5pdGVtLmNsYXNzTGlzdC5hZGQoJ2xpbnRlci1zdGF0dXMtY291bnQnKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmVtaXR0ZXIpXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLnRvb2x0aXBzLmFkZCh0aGlzLml0ZW1FcnJvcnMsIHsgdGl0bGU6ICdMaW50ZXIgRXJyb3JzJyB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20udG9vbHRpcHMuYWRkKHRoaXMuaXRlbVdhcm5pbmdzLCB7IHRpdGxlOiAnTGludGVyIFdhcm5pbmdzJyB9KSlcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20udG9vbHRpcHMuYWRkKHRoaXMuaXRlbUluZm9zLCB7IHRpdGxlOiAnTGludGVyIEluZm9zJyB9KSlcblxuICAgIHRoaXMuaXRlbUVycm9ycy5vbmNsaWNrID0gKCkgPT4gdGhpcy5lbWl0dGVyLmVtaXQoJ2NsaWNrJywgJ2Vycm9yJylcbiAgICB0aGlzLml0ZW1XYXJuaW5ncy5vbmNsaWNrID0gKCkgPT4gdGhpcy5lbWl0dGVyLmVtaXQoJ2NsaWNrJywgJ3dhcm5pbmcnKVxuICAgIHRoaXMuaXRlbUluZm9zLm9uY2xpY2sgPSAoKSA9PiB0aGlzLmVtaXR0ZXIuZW1pdCgnY2xpY2snLCAnaW5mbycpXG5cbiAgICB0aGlzLnVwZGF0ZSgwLCAwLCAwKVxuICB9XG4gIHNldFZpc2liaWxpdHkodmlzaWJpbGl0eTogYm9vbGVhbikge1xuICAgIGlmICh2aXNpYmlsaXR5KSB7XG4gICAgICB0aGlzLml0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZScpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaXRlbS5jbGFzc0xpc3QuYWRkKCdoaWRlJylcbiAgICB9XG4gIH1cbiAgdXBkYXRlKGNvdW50RXJyb3JzOiBudW1iZXIsIGNvdW50V2FybmluZ3M6IG51bWJlciwgY291bnRJbmZvczogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5pdGVtRXJyb3JzLnRleHRDb250ZW50ID0gU3RyaW5nKGNvdW50RXJyb3JzKVxuICAgIHRoaXMuaXRlbVdhcm5pbmdzLnRleHRDb250ZW50ID0gU3RyaW5nKGNvdW50V2FybmluZ3MpXG4gICAgdGhpcy5pdGVtSW5mb3MudGV4dENvbnRlbnQgPSBTdHJpbmcoY291bnRJbmZvcylcblxuICAgIGlmIChjb3VudEVycm9ycykge1xuICAgICAgdGhpcy5pdGVtRXJyb3JzLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZ2hsaWdodCcpXG4gICAgICB0aGlzLml0ZW1FcnJvcnMuY2xhc3NMaXN0LmFkZCgnaGlnaGxpZ2h0LWVycm9yJylcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5pdGVtRXJyb3JzLmNsYXNzTGlzdC5hZGQoJ2hpZ2hsaWdodCcpXG4gICAgICB0aGlzLml0ZW1FcnJvcnMuY2xhc3NMaXN0LnJlbW92ZSgnaGlnaGxpZ2h0LWVycm9yJylcbiAgICB9XG5cbiAgICBpZiAoY291bnRXYXJuaW5ncykge1xuICAgICAgdGhpcy5pdGVtV2FybmluZ3MuY2xhc3NMaXN0LnJlbW92ZSgnaGlnaGxpZ2h0JylcbiAgICAgIHRoaXMuaXRlbVdhcm5pbmdzLmNsYXNzTGlzdC5hZGQoJ2hpZ2hsaWdodC13YXJuaW5nJylcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5pdGVtV2FybmluZ3MuY2xhc3NMaXN0LmFkZCgnaGlnaGxpZ2h0JylcbiAgICAgIHRoaXMuaXRlbVdhcm5pbmdzLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZ2hsaWdodC13YXJuaW5nJylcbiAgICB9XG5cbiAgICBpZiAoY291bnRJbmZvcykge1xuICAgICAgdGhpcy5pdGVtSW5mb3MuY2xhc3NMaXN0LnJlbW92ZSgnaGlnaGxpZ2h0JylcbiAgICAgIHRoaXMuaXRlbUluZm9zLmNsYXNzTGlzdC5hZGQoJ2hpZ2hsaWdodC1pbmZvJylcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5pdGVtSW5mb3MuY2xhc3NMaXN0LmFkZCgnaGlnaGxpZ2h0JylcbiAgICAgIHRoaXMuaXRlbUluZm9zLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZ2hsaWdodC1pbmZvJylcbiAgICB9XG4gIH1cbiAgb25EaWRDbGljayhjYWxsYmFjazogKCh0eXBlOiBzdHJpbmcpID0+IHZvaWQpKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignY2xpY2snLCBjYWxsYmFjaylcbiAgfVxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgfVxufVxuIl19