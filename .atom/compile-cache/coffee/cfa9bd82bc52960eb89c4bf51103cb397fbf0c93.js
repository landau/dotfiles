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
    var jasmineContent, k, v;
    atom.config.set('pigments.markerType', 'native-background');
    atom.views.addViewProvider(Pigments.pigmentsViewProvider);
    for (k in deserializers) {
      v = deserializers[k];
      atom.deserializers.add({
        name: k,
        deserialize: Pigments[v]
      });
    }
    registry.removeExpression('pigments:variables');
    jasmineContent = document.body.querySelector('#jasmine-content');
    jasmineContent.style.width = '100%';
    return jasmineContent.style.height = '100%';
  });

  afterEach(function() {
    return registry.removeExpression('pigments:variables');
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvc3BlYy9oZWxwZXJzL3NwZWMtaGVscGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSw2QkFBUjs7RUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLG9CQUFSOztFQUVYLGFBQUEsR0FDRTtJQUFBLE9BQUEsRUFBUyxvQkFBVDtJQUNBLFdBQUEsRUFBYSx3QkFEYjtJQUVBLFlBQUEsRUFBYyx5QkFGZDtJQUdBLG1CQUFBLEVBQXFCLGdDQUhyQjtJQUlBLG1CQUFBLEVBQXFCLGdDQUpyQjs7O0VBTUYsVUFBQSxDQUFXLFNBQUE7QUFDVCxRQUFBO0lBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHFCQUFoQixFQUF1QyxtQkFBdkM7SUFDQSxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQVgsQ0FBMkIsUUFBUSxDQUFDLG9CQUFwQztBQUVBLFNBQUEsa0JBQUE7O01BQ0UsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFuQixDQUF1QjtRQUFBLElBQUEsRUFBTSxDQUFOO1FBQVMsV0FBQSxFQUFhLFFBQVMsQ0FBQSxDQUFBLENBQS9CO09BQXZCO0FBREY7SUFHQSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsb0JBQTFCO0lBRUEsY0FBQSxHQUFpQixRQUFRLENBQUMsSUFBSSxDQUFDLGFBQWQsQ0FBNEIsa0JBQTVCO0lBQ2pCLGNBQWMsQ0FBQyxLQUFLLENBQUMsS0FBckIsR0FBNkI7V0FDN0IsY0FBYyxDQUFDLEtBQUssQ0FBQyxNQUFyQixHQUE4QjtFQVhyQixDQUFYOztFQWFBLFNBQUEsQ0FBVSxTQUFBO1dBQ1IsUUFBUSxDQUFDLGdCQUFULENBQTBCLG9CQUExQjtFQURRLENBQVY7QUF2QkEiLCJzb3VyY2VzQ29udGVudCI6WyJyZWdpc3RyeSA9IHJlcXVpcmUgJy4uLy4uL2xpYi9jb2xvci1leHByZXNzaW9ucydcblBpZ21lbnRzID0gcmVxdWlyZSAnLi4vLi4vbGliL3BpZ21lbnRzJ1xuXG5kZXNlcmlhbGl6ZXJzID1cbiAgUGFsZXR0ZTogJ2Rlc2VyaWFsaXplUGFsZXR0ZSdcbiAgQ29sb3JTZWFyY2g6ICdkZXNlcmlhbGl6ZUNvbG9yU2VhcmNoJ1xuICBDb2xvclByb2plY3Q6ICdkZXNlcmlhbGl6ZUNvbG9yUHJvamVjdCdcbiAgQ29sb3JQcm9qZWN0RWxlbWVudDogJ2Rlc2VyaWFsaXplQ29sb3JQcm9qZWN0RWxlbWVudCdcbiAgVmFyaWFibGVzQ29sbGVjdGlvbjogJ2Rlc2VyaWFsaXplVmFyaWFibGVzQ29sbGVjdGlvbidcblxuYmVmb3JlRWFjaCAtPlxuICBhdG9tLmNvbmZpZy5zZXQoJ3BpZ21lbnRzLm1hcmtlclR5cGUnLCAnbmF0aXZlLWJhY2tncm91bmQnKVxuICBhdG9tLnZpZXdzLmFkZFZpZXdQcm92aWRlcihQaWdtZW50cy5waWdtZW50c1ZpZXdQcm92aWRlcilcblxuICBmb3Igayx2IG9mIGRlc2VyaWFsaXplcnNcbiAgICBhdG9tLmRlc2VyaWFsaXplcnMuYWRkIG5hbWU6IGssIGRlc2VyaWFsaXplOiBQaWdtZW50c1t2XVxuXG4gIHJlZ2lzdHJ5LnJlbW92ZUV4cHJlc3Npb24oJ3BpZ21lbnRzOnZhcmlhYmxlcycpXG5cbiAgamFzbWluZUNvbnRlbnQgPSBkb2N1bWVudC5ib2R5LnF1ZXJ5U2VsZWN0b3IoJyNqYXNtaW5lLWNvbnRlbnQnKVxuICBqYXNtaW5lQ29udGVudC5zdHlsZS53aWR0aCA9ICcxMDAlJ1xuICBqYXNtaW5lQ29udGVudC5zdHlsZS5oZWlnaHQgPSAnMTAwJSdcblxuYWZ0ZXJFYWNoIC0+XG4gIHJlZ2lzdHJ5LnJlbW92ZUV4cHJlc3Npb24oJ3BpZ21lbnRzOnZhcmlhYmxlcycpXG4iXX0=
