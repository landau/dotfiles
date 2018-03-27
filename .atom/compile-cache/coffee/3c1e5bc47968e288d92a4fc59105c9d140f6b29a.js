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
      highlightSearchPattern: null,
      currentFind: null,
      register: {}
    };
  };

  module.exports = new GlobalState();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvZ2xvYmFsLXN0YXRlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsVUFBVyxPQUFBLENBQVEsTUFBUjs7RUFFTjtJQUNTLHFCQUFBO01BQ1gsSUFBQyxDQUFBLEtBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUVmLElBQUMsQ0FBQSxXQUFELENBQWEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7QUFFWCxjQUFBO1VBRmEsaUJBQU07VUFFbkIsSUFBRyxJQUFBLEtBQVEsbUJBQVg7bUJBQ0UsS0FBQyxDQUFBLEdBQUQsQ0FBSyx3QkFBTCxFQUErQixRQUEvQixFQURGOztRQUZXO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFiO0lBSlc7OzBCQVNiLEdBQUEsR0FBSyxTQUFDLElBQUQ7YUFDSCxJQUFDLENBQUEsS0FBTSxDQUFBLElBQUE7SUFESjs7MEJBR0wsR0FBQSxHQUFLLFNBQUMsSUFBRCxFQUFPLFFBQVA7QUFDSCxVQUFBO01BQUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxHQUFELENBQUssSUFBTDtNQUNYLElBQUMsQ0FBQSxLQUFNLENBQUEsSUFBQSxDQUFQLEdBQWU7YUFDZixJQUFDLENBQUEsYUFBRCxDQUFlO1FBQUMsTUFBQSxJQUFEO1FBQU8sVUFBQSxRQUFQO1FBQWlCLFVBQUEsUUFBakI7T0FBZjtJQUhHOzswQkFLTCxXQUFBLEdBQWEsU0FBQyxFQUFEO2FBQ1gsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksWUFBWixFQUEwQixFQUExQjtJQURXOzswQkFHYixhQUFBLEdBQWUsU0FBQyxLQUFEO2FBQ2IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsWUFBZCxFQUE0QixLQUE1QjtJQURhOzswQkFHZixLQUFBLEdBQU8sU0FBQyxJQUFEO0FBQ0wsVUFBQTtNQUFBLFlBQUEsR0FBZSxlQUFBLENBQUE7TUFDZixJQUFHLFlBQUg7ZUFDRSxJQUFDLENBQUEsR0FBRCxDQUFLLElBQUwsRUFBVyxZQUFhLENBQUEsSUFBQSxDQUF4QixFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxLQUFELEdBQVMsYUFIWDs7SUFGSzs7Ozs7O0VBT1QsZUFBQSxHQUFrQixTQUFBO1dBQ2hCO01BQUEsYUFBQSxFQUFlLEVBQWY7TUFDQSxhQUFBLEVBQWUsSUFEZjtNQUVBLGlCQUFBLEVBQW1CLElBRm5CO01BR0EscUJBQUEsRUFBdUIsSUFIdkI7TUFJQSxzQkFBQSxFQUF3QixJQUp4QjtNQUtBLFdBQUEsRUFBYSxJQUxiO01BTUEsUUFBQSxFQUFVLEVBTlY7O0VBRGdCOztFQVNsQixNQUFNLENBQUMsT0FBUCxHQUFxQixJQUFBLFdBQUEsQ0FBQTtBQTFDckIiLCJzb3VyY2VzQ29udGVudCI6WyJ7RW1pdHRlcn0gPSByZXF1aXJlICdhdG9tJ1xuXG5jbGFzcyBHbG9iYWxTdGF0ZVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAcmVzZXQoKVxuICAgIEBlbWl0dGVyID0gbmV3IEVtaXR0ZXJcblxuICAgIEBvbkRpZENoYW5nZSAoe25hbWUsIG5ld1ZhbHVlfSkgPT5cbiAgICAgICMgYXV0byBzeW5jIHZhbHVlLCBidXQgaGlnaGxpZ2h0U2VhcmNoUGF0dGVybiBpcyBzb2xlbHkgY2xlYXJlZCB0byBjbGVhciBobHNlYXJjaC5cbiAgICAgIGlmIG5hbWUgaXMgJ2xhc3RTZWFyY2hQYXR0ZXJuJ1xuICAgICAgICBAc2V0KCdoaWdobGlnaHRTZWFyY2hQYXR0ZXJuJywgbmV3VmFsdWUpXG5cbiAgZ2V0OiAobmFtZSkgLT5cbiAgICBAc3RhdGVbbmFtZV1cblxuICBzZXQ6IChuYW1lLCBuZXdWYWx1ZSkgLT5cbiAgICBvbGRWYWx1ZSA9IEBnZXQobmFtZSlcbiAgICBAc3RhdGVbbmFtZV0gPSBuZXdWYWx1ZVxuICAgIEBlbWl0RGlkQ2hhbmdlKHtuYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWV9KVxuXG4gIG9uRGlkQ2hhbmdlOiAoZm4pIC0+XG4gICAgQGVtaXR0ZXIub24oJ2RpZC1jaGFuZ2UnLCBmbilcblxuICBlbWl0RGlkQ2hhbmdlOiAoZXZlbnQpIC0+XG4gICAgQGVtaXR0ZXIuZW1pdCgnZGlkLWNoYW5nZScsIGV2ZW50KVxuXG4gIHJlc2V0OiAobmFtZSkgLT5cbiAgICBpbml0aWFsU3RhdGUgPSBnZXRJbml0aWFsU3RhdGUoKVxuICAgIGlmIG5hbWU/XG4gICAgICBAc2V0KG5hbWUsIGluaXRpYWxTdGF0ZVtuYW1lXSlcbiAgICBlbHNlXG4gICAgICBAc3RhdGUgPSBpbml0aWFsU3RhdGVcblxuZ2V0SW5pdGlhbFN0YXRlID0gLT5cbiAgc2VhcmNoSGlzdG9yeTogW11cbiAgY3VycmVudFNlYXJjaDogbnVsbFxuICBsYXN0U2VhcmNoUGF0dGVybjogbnVsbFxuICBsYXN0T2NjdXJyZW5jZVBhdHRlcm46IG51bGxcbiAgaGlnaGxpZ2h0U2VhcmNoUGF0dGVybjogbnVsbFxuICBjdXJyZW50RmluZDogbnVsbFxuICByZWdpc3Rlcjoge31cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgR2xvYmFsU3RhdGUoKVxuIl19
