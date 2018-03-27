(function() {
  var Emitter, GlobalState, getInitialState;

  Emitter = require('atom').Emitter;

  GlobalState = (function() {
    function GlobalState(state) {
      this.state = state;
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

  module.exports = new GlobalState(getInitialState());

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvZ2xvYmFsLXN0YXRlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsVUFBVyxPQUFBLENBQVEsTUFBUjs7RUFFTjtJQUNTLHFCQUFDLEtBQUQ7TUFBQyxJQUFDLENBQUEsUUFBRDtNQUNaLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFBSTtNQUVmLElBQUMsQ0FBQSxXQUFELENBQWEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLEdBQUQ7QUFFWCxjQUFBO1VBRmEsaUJBQU07VUFFbkIsSUFBRyxJQUFBLEtBQVEsbUJBQVg7bUJBQ0UsS0FBQyxDQUFBLEdBQUQsQ0FBSyx3QkFBTCxFQUErQixRQUEvQixFQURGOztRQUZXO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFiO0lBSFc7OzBCQVFiLEdBQUEsR0FBSyxTQUFDLElBQUQ7YUFDSCxJQUFDLENBQUEsS0FBTSxDQUFBLElBQUE7SUFESjs7MEJBR0wsR0FBQSxHQUFLLFNBQUMsSUFBRCxFQUFPLFFBQVA7QUFDSCxVQUFBO01BQUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxHQUFELENBQUssSUFBTDtNQUNYLElBQUMsQ0FBQSxLQUFNLENBQUEsSUFBQSxDQUFQLEdBQWU7YUFDZixJQUFDLENBQUEsYUFBRCxDQUFlO1FBQUMsTUFBQSxJQUFEO1FBQU8sVUFBQSxRQUFQO1FBQWlCLFVBQUEsUUFBakI7T0FBZjtJQUhHOzswQkFLTCxXQUFBLEdBQWEsU0FBQyxFQUFEO2FBQ1gsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksWUFBWixFQUEwQixFQUExQjtJQURXOzswQkFHYixhQUFBLEdBQWUsU0FBQyxLQUFEO2FBQ2IsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsWUFBZCxFQUE0QixLQUE1QjtJQURhOzswQkFHZixLQUFBLEdBQU8sU0FBQyxJQUFEO0FBQ0wsVUFBQTtNQUFBLFlBQUEsR0FBZSxlQUFBLENBQUE7TUFDZixJQUFHLFlBQUg7ZUFDRSxJQUFDLENBQUEsR0FBRCxDQUFLLElBQUwsRUFBVyxZQUFhLENBQUEsSUFBQSxDQUF4QixFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxLQUFELEdBQVMsYUFIWDs7SUFGSzs7Ozs7O0VBT1QsZUFBQSxHQUFrQixTQUFBO1dBQ2hCO01BQUEsYUFBQSxFQUFlLEVBQWY7TUFDQSxhQUFBLEVBQWUsSUFEZjtNQUVBLGlCQUFBLEVBQW1CLElBRm5CO01BR0EscUJBQUEsRUFBdUIsSUFIdkI7TUFJQSxrQkFBQSxFQUFvQixJQUpwQjtNQUtBLHNCQUFBLEVBQXdCLElBTHhCO01BTUEsV0FBQSxFQUFhLElBTmI7TUFPQSxRQUFBLEVBQVUsRUFQVjtNQVFBLGdCQUFBLEVBQWtCLEtBUmxCOztFQURnQjs7RUFXbEIsTUFBTSxDQUFDLE9BQVAsR0FBcUIsSUFBQSxXQUFBLENBQVksZUFBQSxDQUFBLENBQVo7QUEzQ3JCIiwic291cmNlc0NvbnRlbnQiOlsie0VtaXR0ZXJ9ID0gcmVxdWlyZSAnYXRvbSdcblxuY2xhc3MgR2xvYmFsU3RhdGVcbiAgY29uc3RydWN0b3I6IChAc3RhdGUpIC0+XG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuXG4gICAgQG9uRGlkQ2hhbmdlICh7bmFtZSwgbmV3VmFsdWV9KSA9PlxuICAgICAgIyBhdXRvIHN5bmMgdmFsdWUsIGJ1dCBoaWdobGlnaHRTZWFyY2hQYXR0ZXJuIGlzIHNvbGVseSBjbGVhcmVkIHRvIGNsZWFyIGhsc2VhcmNoLlxuICAgICAgaWYgbmFtZSBpcyAnbGFzdFNlYXJjaFBhdHRlcm4nXG4gICAgICAgIEBzZXQoJ2hpZ2hsaWdodFNlYXJjaFBhdHRlcm4nLCBuZXdWYWx1ZSlcblxuICBnZXQ6IChuYW1lKSAtPlxuICAgIEBzdGF0ZVtuYW1lXVxuXG4gIHNldDogKG5hbWUsIG5ld1ZhbHVlKSAtPlxuICAgIG9sZFZhbHVlID0gQGdldChuYW1lKVxuICAgIEBzdGF0ZVtuYW1lXSA9IG5ld1ZhbHVlXG4gICAgQGVtaXREaWRDaGFuZ2Uoe25hbWUsIG9sZFZhbHVlLCBuZXdWYWx1ZX0pXG5cbiAgb25EaWRDaGFuZ2U6IChmbikgLT5cbiAgICBAZW1pdHRlci5vbignZGlkLWNoYW5nZScsIGZuKVxuXG4gIGVtaXREaWRDaGFuZ2U6IChldmVudCkgLT5cbiAgICBAZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlJywgZXZlbnQpXG5cbiAgcmVzZXQ6IChuYW1lKSAtPlxuICAgIGluaXRpYWxTdGF0ZSA9IGdldEluaXRpYWxTdGF0ZSgpXG4gICAgaWYgbmFtZT9cbiAgICAgIEBzZXQobmFtZSwgaW5pdGlhbFN0YXRlW25hbWVdKVxuICAgIGVsc2VcbiAgICAgIEBzdGF0ZSA9IGluaXRpYWxTdGF0ZVxuXG5nZXRJbml0aWFsU3RhdGUgPSAtPlxuICBzZWFyY2hIaXN0b3J5OiBbXVxuICBjdXJyZW50U2VhcmNoOiBudWxsXG4gIGxhc3RTZWFyY2hQYXR0ZXJuOiBudWxsXG4gIGxhc3RPY2N1cnJlbmNlUGF0dGVybjogbnVsbFxuICBsYXN0T2NjdXJyZW5jZVR5cGU6IG51bGxcbiAgaGlnaGxpZ2h0U2VhcmNoUGF0dGVybjogbnVsbFxuICBjdXJyZW50RmluZDogbnVsbFxuICByZWdpc3Rlcjoge31cbiAgZGVtb01vZGVJc0FjdGl2ZTogZmFsc2VcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgR2xvYmFsU3RhdGUoZ2V0SW5pdGlhbFN0YXRlKCkpXG4iXX0=
