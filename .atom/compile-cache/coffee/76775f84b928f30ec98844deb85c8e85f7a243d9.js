(function() {
  var Pigments, deserializers, registry;

  registry = require('../../lib/color-expressions');

  Pigments = require('../../lib/pigments');

  deserializers = {
    Palette: 'deserializePalette',
    ColorSearch: 'deserializeColorSearch',
    ColorProject: 'deserializeColorProject',
    ColorProjectElement: 'deserializeColorProjectElement',
    VariablesCollection: 'deserializeVariablesCollection'
  };

  beforeEach(function() {
    var k, v;
    atom.views.addViewProvider(Pigments.pigmentsViewProvider);
    for (k in deserializers) {
      v = deserializers[k];
      atom.deserializers.add({
        name: k,
        deserialize: Pigments[v]
      });
    }
    return registry.removeExpression('pigments:variables');
  });

  afterEach(function() {
    return registry.removeExpression('pigments:variables');
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvc3BlYy9oZWxwZXJzL3NwZWMtaGVscGVyLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxpQ0FBQTs7QUFBQSxFQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsNkJBQVIsQ0FBWCxDQUFBOztBQUFBLEVBQ0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxvQkFBUixDQURYLENBQUE7O0FBQUEsRUFHQSxhQUFBLEdBQ0U7QUFBQSxJQUFBLE9BQUEsRUFBUyxvQkFBVDtBQUFBLElBQ0EsV0FBQSxFQUFhLHdCQURiO0FBQUEsSUFFQSxZQUFBLEVBQWMseUJBRmQ7QUFBQSxJQUdBLG1CQUFBLEVBQXFCLGdDQUhyQjtBQUFBLElBSUEsbUJBQUEsRUFBcUIsZ0NBSnJCO0dBSkYsQ0FBQTs7QUFBQSxFQVVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxRQUFBLElBQUE7QUFBQSxJQUFBLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBWCxDQUEyQixRQUFRLENBQUMsb0JBQXBDLENBQUEsQ0FBQTtBQUVBLFNBQUEsa0JBQUE7MkJBQUE7QUFDRSxNQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBbkIsQ0FBdUI7QUFBQSxRQUFBLElBQUEsRUFBTSxDQUFOO0FBQUEsUUFBUyxXQUFBLEVBQWEsUUFBUyxDQUFBLENBQUEsQ0FBL0I7T0FBdkIsQ0FBQSxDQURGO0FBQUEsS0FGQTtXQUtBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQixvQkFBMUIsRUFOUztFQUFBLENBQVgsQ0FWQSxDQUFBOztBQUFBLEVBa0JBLFNBQUEsQ0FBVSxTQUFBLEdBQUE7V0FDUixRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsb0JBQTFCLEVBRFE7RUFBQSxDQUFWLENBbEJBLENBQUE7QUFBQSIKfQ==

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/pigments/spec/helpers/spec-helper.coffee
