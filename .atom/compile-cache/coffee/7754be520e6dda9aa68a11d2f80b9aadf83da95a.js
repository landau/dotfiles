(function() {
  var Emitter, GlobalState, getInitialState;

  Emitter = require('atom').Emitter;

  GlobalState = (function() {
    function GlobalState() {
      this.reset();
      this.emitter = new Emitter;
      this.onDidChange((function(_this) {
        return function(arg) {
          var name, newValue;
          name = arg.name, newValue = arg.newValue;
          if (name === 'lastSearchPattern') {
            return _this.set('highlightSearchPattern', newValue);
          }
        };
      })(this));
    }

    GlobalState.prototype.get = function(name) {
      return this.state[name];
    };

    GlobalState.prototype.set = function(name, newValue) {
      var oldValue;
      oldValue = this.get(name);
      this.state[name] = newValue;
      return this.emitDidChange({
        name: name,
        oldValue: oldValue,
        newValue: newValue
      });
    };

    GlobalState.prototype.onDidChange = function(fn) {
      return this.emitter.on('did-change', fn);
    };

    GlobalState.prototype.emitDidChange = function(event) {
      return this.emitter.emit('did-change', event);
    };

    GlobalState.prototype.reset = function(name) {
      var initialState;
      initialState = getInitialState();
      if (name != null) {
        return this.set(name, initialState[name]);
      } else {
        return this.state = initialState;
      }
    };

    return GlobalState;

  })();

  getInitialState = function() {
    return {
      searchHistory: [],
      currentSearch: null,
      lastSearchPattern: null,
      lastOccurrencePattern: null,
      lastOccurrenceType: null,
      highlightSearchPattern: null,
      currentFind: null,
      register: {},
      demoModeIsActive: false
    };
  };

  module.exports = new GlobalState();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvZ2xvYmFsLXN0YXRlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsVUFBVyxPQUFBLENBQVEsTUFBUjs7RUFFTjtJQUNTLHFCQUFBO01BQ1gsSUFBQyxDQUFBLEtBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUVmLElBQUMsQ0FBQSxXQUFELENBQWEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7QUFFWCxjQUFBO1VBRmEsaUJBQU07VUFFbkIsSUFBRyxJQUFBLEtBQVEsbUJBQVg7bUJBQ0UsS0FBQyxDQUFBLEdBQUQsQ0FBSyx3QkFBTCxFQUErQixRQUEvQixFQURGOztRQUZXO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFiO0lBSlc7OzBCQVNiLEdBQUEsR0FBSyxTQUFDLElBQUQ7YUFDSCxJQUFDLENBQUEsS0FBTSxDQUFBLElBQUE7SUFESjs7MEJBR0wsR0FBQSxHQUFLLFNBQUMsSUFBRCxFQUFPLFFBQVA7QUFDSCxVQUFBO01BQUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxHQUFELENBQUssSUFBTDtNQUNYLElBQUMsQ0FBQSxLQUFNLENBQUEsSUFBQSxDQUFQLEdBQWU7YUFDZixJQUFDLENBQUEsYUFBRCxDQUFlO1FBQUMsTUFBQSxJQUFEO1FBQU8sVUFBQSxRQUFQO1FBQWlCLFVBQUEsUUFBakI7T0FBZjtJQUhHOzswQkFLTCxXQUFBLEdBQWEsU0FBQyxFQUFEO2FBQ1gsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksWUFBWixFQUEwQixFQUExQjtJQURXOzswQkFHYixhQUFBLEdBQWUsU0FBQyxLQUFEO2FBQ2IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsWUFBZCxFQUE0QixLQUE1QjtJQURhOzswQkFHZixLQUFBLEdBQU8sU0FBQyxJQUFEO0FBQ0wsVUFBQTtNQUFBLFlBQUEsR0FBZSxlQUFBLENBQUE7TUFDZixJQUFHLFlBQUg7ZUFDRSxJQUFDLENBQUEsR0FBRCxDQUFLLElBQUwsRUFBVyxZQUFhLENBQUEsSUFBQSxDQUF4QixFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxLQUFELEdBQVMsYUFIWDs7SUFGSzs7Ozs7O0VBT1QsZUFBQSxHQUFrQixTQUFBO1dBQ2hCO01BQUEsYUFBQSxFQUFlLEVBQWY7TUFDQSxhQUFBLEVBQWUsSUFEZjtNQUVBLGlCQUFBLEVBQW1CLElBRm5CO01BR0EscUJBQUEsRUFBdUIsSUFIdkI7TUFJQSxrQkFBQSxFQUFvQixJQUpwQjtNQUtBLHNCQUFBLEVBQXdCLElBTHhCO01BTUEsV0FBQSxFQUFhLElBTmI7TUFPQSxRQUFBLEVBQVUsRUFQVjtNQVFBLGdCQUFBLEVBQWtCLEtBUmxCOztFQURnQjs7RUFXbEIsTUFBTSxDQUFDLE9BQVAsR0FBcUIsSUFBQSxXQUFBLENBQUE7QUE1Q3JCIiwic291cmNlc0NvbnRlbnQiOlsie0VtaXR0ZXJ9ID0gcmVxdWlyZSAnYXRvbSdcblxuY2xhc3MgR2xvYmFsU3RhdGVcbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQHJlc2V0KClcbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG5cbiAgICBAb25EaWRDaGFuZ2UgKHtuYW1lLCBuZXdWYWx1ZX0pID0+XG4gICAgICAjIGF1dG8gc3luYyB2YWx1ZSwgYnV0IGhpZ2hsaWdodFNlYXJjaFBhdHRlcm4gaXMgc29sZWx5IGNsZWFyZWQgdG8gY2xlYXIgaGxzZWFyY2guXG4gICAgICBpZiBuYW1lIGlzICdsYXN0U2VhcmNoUGF0dGVybidcbiAgICAgICAgQHNldCgnaGlnaGxpZ2h0U2VhcmNoUGF0dGVybicsIG5ld1ZhbHVlKVxuXG4gIGdldDogKG5hbWUpIC0+XG4gICAgQHN0YXRlW25hbWVdXG5cbiAgc2V0OiAobmFtZSwgbmV3VmFsdWUpIC0+XG4gICAgb2xkVmFsdWUgPSBAZ2V0KG5hbWUpXG4gICAgQHN0YXRlW25hbWVdID0gbmV3VmFsdWVcbiAgICBAZW1pdERpZENoYW5nZSh7bmFtZSwgb2xkVmFsdWUsIG5ld1ZhbHVlfSlcblxuICBvbkRpZENoYW5nZTogKGZuKSAtPlxuICAgIEBlbWl0dGVyLm9uKCdkaWQtY2hhbmdlJywgZm4pXG5cbiAgZW1pdERpZENoYW5nZTogKGV2ZW50KSAtPlxuICAgIEBlbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UnLCBldmVudClcblxuICByZXNldDogKG5hbWUpIC0+XG4gICAgaW5pdGlhbFN0YXRlID0gZ2V0SW5pdGlhbFN0YXRlKClcbiAgICBpZiBuYW1lP1xuICAgICAgQHNldChuYW1lLCBpbml0aWFsU3RhdGVbbmFtZV0pXG4gICAgZWxzZVxuICAgICAgQHN0YXRlID0gaW5pdGlhbFN0YXRlXG5cbmdldEluaXRpYWxTdGF0ZSA9IC0+XG4gIHNlYXJjaEhpc3Rvcnk6IFtdXG4gIGN1cnJlbnRTZWFyY2g6IG51bGxcbiAgbGFzdFNlYXJjaFBhdHRlcm46IG51bGxcbiAgbGFzdE9jY3VycmVuY2VQYXR0ZXJuOiBudWxsXG4gIGxhc3RPY2N1cnJlbmNlVHlwZTogbnVsbFxuICBoaWdobGlnaHRTZWFyY2hQYXR0ZXJuOiBudWxsXG4gIGN1cnJlbnRGaW5kOiBudWxsXG4gIHJlZ2lzdGVyOiB7fVxuICBkZW1vTW9kZUlzQWN0aXZlOiBmYWxzZVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBHbG9iYWxTdGF0ZSgpXG4iXX0=
