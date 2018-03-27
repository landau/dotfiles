(function() {
  var LongModeStringTable, StatusBarManager, createDiv, settings;

  settings = require('./settings');

  createDiv = function(arg) {
    var classList, div, id, ref;
    id = arg.id, classList = arg.classList;
    div = document.createElement('div');
    if (id != null) {
      div.id = id;
    }
    if (classList != null) {
      (ref = div.classList).add.apply(ref, classList);
    }
    return div;
  };

  LongModeStringTable = {
    'normal': "Normal",
    'operator-pending': "Operator Pending",
    'visual.characterwise': "Visual Characterwise",
    'visual.blockwise': "Visual Blockwise",
    'visual.linewise': "Visual Linewise",
    'insert': "Insert",
    'insert.replace': "Insert Replace"
  };

  module.exports = StatusBarManager = (function() {
    StatusBarManager.prototype.prefix = 'status-bar-vim-mode-plus';

    function StatusBarManager() {
      this.container = createDiv({
        id: this.prefix + "-container",
        classList: ['inline-block']
      });
      this.container.appendChild(this.element = createDiv({
        id: this.prefix
      }));
    }

    StatusBarManager.prototype.initialize = function(statusBar) {
      this.statusBar = statusBar;
    };

    StatusBarManager.prototype.update = function(mode, submode) {
      this.element.className = this.prefix + "-" + mode;
      return this.element.textContent = (function() {
        switch (settings.get('statusBarModeStringStyle')) {
          case 'short':
            return (mode[0] + (submode != null ? submode[0] : '')).toUpperCase();
          case 'long':
            return LongModeStringTable[mode + (submode != null ? '.' + submode : '')];
        }
      })();
    };

    StatusBarManager.prototype.attach = function() {
      return this.tile = this.statusBar.addRightTile({
        item: this.container,
        priority: 20
      });
    };

    StatusBarManager.prototype.detach = function() {
      return this.tile.destroy();
    };

    return StatusBarManager;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvc3RhdHVzLWJhci1tYW5hZ2VyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSOztFQUVYLFNBQUEsR0FBWSxTQUFDLEdBQUQ7QUFDVixRQUFBO0lBRFksYUFBSTtJQUNoQixHQUFBLEdBQU0sUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkI7SUFDTixJQUFlLFVBQWY7TUFBQSxHQUFHLENBQUMsRUFBSixHQUFTLEdBQVQ7O0lBQ0EsSUFBbUMsaUJBQW5DO01BQUEsT0FBQSxHQUFHLENBQUMsU0FBSixDQUFhLENBQUMsR0FBZCxZQUFrQixTQUFsQixFQUFBOztXQUNBO0VBSlU7O0VBTVosbUJBQUEsR0FDRTtJQUFBLFFBQUEsRUFBVSxRQUFWO0lBQ0Esa0JBQUEsRUFBb0Isa0JBRHBCO0lBRUEsc0JBQUEsRUFBd0Isc0JBRnhCO0lBR0Esa0JBQUEsRUFBb0Isa0JBSHBCO0lBSUEsaUJBQUEsRUFBbUIsaUJBSm5CO0lBS0EsUUFBQSxFQUFVLFFBTFY7SUFNQSxnQkFBQSxFQUFrQixnQkFObEI7OztFQVFGLE1BQU0sQ0FBQyxPQUFQLEdBQ007K0JBQ0osTUFBQSxHQUFROztJQUVLLDBCQUFBO01BQ1gsSUFBQyxDQUFBLFNBQUQsR0FBYSxTQUFBLENBQVU7UUFBQSxFQUFBLEVBQU8sSUFBQyxDQUFBLE1BQUYsR0FBUyxZQUFmO1FBQTRCLFNBQUEsRUFBVyxDQUFDLGNBQUQsQ0FBdkM7T0FBVjtNQUNiLElBQUMsQ0FBQSxTQUFTLENBQUMsV0FBWCxDQUF1QixJQUFDLENBQUEsT0FBRCxHQUFXLFNBQUEsQ0FBVTtRQUFBLEVBQUEsRUFBSSxJQUFDLENBQUEsTUFBTDtPQUFWLENBQWxDO0lBRlc7OytCQUliLFVBQUEsR0FBWSxTQUFDLFNBQUQ7TUFBQyxJQUFDLENBQUEsWUFBRDtJQUFEOzsrQkFFWixNQUFBLEdBQVEsU0FBQyxJQUFELEVBQU8sT0FBUDtNQUNOLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBVCxHQUF3QixJQUFDLENBQUEsTUFBRixHQUFTLEdBQVQsR0FBWTthQUNuQyxJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQ7QUFDRSxnQkFBTyxRQUFRLENBQUMsR0FBVCxDQUFhLDBCQUFiLENBQVA7QUFBQSxlQUNPLE9BRFA7bUJBRUksQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFMLEdBQVUsQ0FBSSxlQUFILEdBQWlCLE9BQVEsQ0FBQSxDQUFBLENBQXpCLEdBQWlDLEVBQWxDLENBQVgsQ0FBaUQsQ0FBQyxXQUFsRCxDQUFBO0FBRkosZUFHTyxNQUhQO21CQUlJLG1CQUFvQixDQUFBLElBQUEsR0FBTyxDQUFJLGVBQUgsR0FBaUIsR0FBQSxHQUFNLE9BQXZCLEdBQW9DLEVBQXJDLENBQVA7QUFKeEI7O0lBSEk7OytCQVNSLE1BQUEsR0FBUSxTQUFBO2FBQ04sSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFDLENBQUEsU0FBUyxDQUFDLFlBQVgsQ0FBd0I7UUFBQSxJQUFBLEVBQU0sSUFBQyxDQUFBLFNBQVA7UUFBa0IsUUFBQSxFQUFVLEVBQTVCO09BQXhCO0lBREY7OytCQUdSLE1BQUEsR0FBUSxTQUFBO2FBQ04sSUFBQyxDQUFBLElBQUksQ0FBQyxPQUFOLENBQUE7SUFETTs7Ozs7QUF2Q1YiLCJzb3VyY2VzQ29udGVudCI6WyJzZXR0aW5ncyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbmNyZWF0ZURpdiA9ICh7aWQsIGNsYXNzTGlzdH0pIC0+XG4gIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIGRpdi5pZCA9IGlkIGlmIGlkP1xuICBkaXYuY2xhc3NMaXN0LmFkZChjbGFzc0xpc3QuLi4pIGlmIGNsYXNzTGlzdD9cbiAgZGl2XG5cbkxvbmdNb2RlU3RyaW5nVGFibGUgPVxuICAnbm9ybWFsJzogXCJOb3JtYWxcIlxuICAnb3BlcmF0b3ItcGVuZGluZyc6IFwiT3BlcmF0b3IgUGVuZGluZ1wiXG4gICd2aXN1YWwuY2hhcmFjdGVyd2lzZSc6IFwiVmlzdWFsIENoYXJhY3Rlcndpc2VcIlxuICAndmlzdWFsLmJsb2Nrd2lzZSc6IFwiVmlzdWFsIEJsb2Nrd2lzZVwiXG4gICd2aXN1YWwubGluZXdpc2UnOiBcIlZpc3VhbCBMaW5ld2lzZVwiXG4gICdpbnNlcnQnOiBcIkluc2VydFwiXG4gICdpbnNlcnQucmVwbGFjZSc6IFwiSW5zZXJ0IFJlcGxhY2VcIlxuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBTdGF0dXNCYXJNYW5hZ2VyXG4gIHByZWZpeDogJ3N0YXR1cy1iYXItdmltLW1vZGUtcGx1cydcblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAY29udGFpbmVyID0gY3JlYXRlRGl2KGlkOiBcIiN7QHByZWZpeH0tY29udGFpbmVyXCIsIGNsYXNzTGlzdDogWydpbmxpbmUtYmxvY2snXSlcbiAgICBAY29udGFpbmVyLmFwcGVuZENoaWxkKEBlbGVtZW50ID0gY3JlYXRlRGl2KGlkOiBAcHJlZml4KSlcblxuICBpbml0aWFsaXplOiAoQHN0YXR1c0JhcikgLT5cblxuICB1cGRhdGU6IChtb2RlLCBzdWJtb2RlKSAtPlxuICAgIEBlbGVtZW50LmNsYXNzTmFtZSA9IFwiI3tAcHJlZml4fS0je21vZGV9XCJcbiAgICBAZWxlbWVudC50ZXh0Q29udGVudCA9XG4gICAgICBzd2l0Y2ggc2V0dGluZ3MuZ2V0KCdzdGF0dXNCYXJNb2RlU3RyaW5nU3R5bGUnKVxuICAgICAgICB3aGVuICdzaG9ydCdcbiAgICAgICAgICAobW9kZVswXSArIChpZiBzdWJtb2RlPyB0aGVuIHN1Ym1vZGVbMF0gZWxzZSAnJykpLnRvVXBwZXJDYXNlKClcbiAgICAgICAgd2hlbiAnbG9uZydcbiAgICAgICAgICBMb25nTW9kZVN0cmluZ1RhYmxlW21vZGUgKyAoaWYgc3VibW9kZT8gdGhlbiAnLicgKyBzdWJtb2RlIGVsc2UgJycpXVxuXG4gIGF0dGFjaDogLT5cbiAgICBAdGlsZSA9IEBzdGF0dXNCYXIuYWRkUmlnaHRUaWxlKGl0ZW06IEBjb250YWluZXIsIHByaW9yaXR5OiAyMClcblxuICBkZXRhY2g6IC0+XG4gICAgQHRpbGUuZGVzdHJveSgpXG4iXX0=
