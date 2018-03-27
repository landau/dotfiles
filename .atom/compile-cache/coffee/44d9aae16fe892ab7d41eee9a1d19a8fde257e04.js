(function() {
  describe('autocomplete provider', function() {
    var autocompleteMain, autocompleteManager, completionDelay, editor, editorView, jasmineContent, pigments, project, ref;
    ref = [], completionDelay = ref[0], editor = ref[1], editorView = ref[2], pigments = ref[3], autocompleteMain = ref[4], autocompleteManager = ref[5], jasmineContent = ref[6], project = ref[7];
    beforeEach(function() {
      runs(function() {
        var workspaceElement;
        jasmineContent = document.body.querySelector('#jasmine-content');
        atom.config.set('pigments.autocompleteScopes', ['*']);
        atom.config.set('pigments.sourceNames', ['**/*.styl', '**/*.less']);
        atom.config.set('autocomplete-plus.enableAutoActivation', true);
        completionDelay = 100;
        atom.config.set('autocomplete-plus.autoActivationDelay', completionDelay);
        completionDelay += 100;
        workspaceElement = atom.views.getView(atom.workspace);
        return jasmineContent.appendChild(workspaceElement);
      });
      waitsForPromise('autocomplete-plus activation', function() {
        return atom.packages.activatePackage('autocomplete-plus').then(function(pkg) {
          return autocompleteMain = pkg.mainModule;
        });
      });
      waitsForPromise('pigments activation', function() {
        return atom.packages.activatePackage('pigments').then(function(pkg) {
          return pigments = pkg.mainModule;
        });
      });
      runs(function() {
        spyOn(autocompleteMain, 'consumeProvider').andCallThrough();
        return spyOn(pigments, 'provideAutocomplete').andCallThrough();
      });
      waitsForPromise('open sample file', function() {
        return atom.workspace.open('sample.styl').then(function(e) {
          editor = e;
          editor.setText('');
          return editorView = atom.views.getView(editor);
        });
      });
      waitsForPromise('pigments project initialized', function() {
        project = pigments.getProject();
        return project.initialize();
      });
      return runs(function() {
        autocompleteManager = autocompleteMain.autocompleteManager;
        spyOn(autocompleteManager, 'findSuggestions').andCallThrough();
        return spyOn(autocompleteManager, 'displaySuggestions').andCallThrough();
      });
    });
    describe('writing the name of a color', function() {
      it('returns suggestions for the matching colors', function() {
        runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('border: 1px solid ');
          editor.moveToBottom();
          editor.insertText('b');
          editor.insertText('a');
          return advanceClock(completionDelay);
        });
        waitsFor(function() {
          return autocompleteManager.displaySuggestions.calls.length === 1;
        });
        waitsFor(function() {
          return editorView.querySelector('.autocomplete-plus li') != null;
        });
        return runs(function() {
          var popup, preview;
          popup = editorView.querySelector('.autocomplete-plus');
          expect(popup).toExist();
          expect(popup.querySelector('span.word').textContent).toEqual('base-color');
          preview = popup.querySelector('.color-suggestion-preview');
          expect(preview).toExist();
          return expect(preview.style.background).toEqual('rgb(255, 255, 255)');
        });
      });
      it('replaces the prefix even when it contains a @', function() {
        runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('@');
          editor.insertText('b');
          editor.insertText('a');
          return advanceClock(completionDelay);
        });
        waitsFor(function() {
          return autocompleteManager.displaySuggestions.calls.length === 1;
        });
        waitsFor(function() {
          return editorView.querySelector('.autocomplete-plus li') != null;
        });
        return runs(function() {
          atom.commands.dispatch(editorView, 'autocomplete-plus:confirm');
          return expect(editor.getText()).not.toContain('@@');
        });
      });
      it('replaces the prefix even when it contains a $', function() {
        runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('$');
          editor.insertText('o');
          editor.insertText('t');
          return advanceClock(completionDelay);
        });
        waitsFor(function() {
          return autocompleteManager.displaySuggestions.calls.length === 1;
        });
        waitsFor(function() {
          return editorView.querySelector('.autocomplete-plus li') != null;
        });
        return runs(function() {
          atom.commands.dispatch(editorView, 'autocomplete-plus:confirm');
          expect(editor.getText()).toContain('$other-color');
          return expect(editor.getText()).not.toContain('$$');
        });
      });
      return describe('when the extendAutocompleteToColorValue setting is enabled', function() {
        beforeEach(function() {
          return atom.config.set('pigments.extendAutocompleteToColorValue', true);
        });
        describe('with an opaque color', function() {
          return it('displays the color hexadecimal code in the completion item', function() {
            runs(function() {
              expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
              editor.moveToBottom();
              editor.insertText('b');
              editor.insertText('a');
              editor.insertText('s');
              return advanceClock(completionDelay);
            });
            waitsFor(function() {
              return autocompleteManager.displaySuggestions.calls.length === 1;
            });
            waitsFor(function() {
              return editorView.querySelector('.autocomplete-plus li') != null;
            });
            return runs(function() {
              var popup;
              popup = editorView.querySelector('.autocomplete-plus');
              expect(popup).toExist();
              expect(popup.querySelector('span.word').textContent).toEqual('base-color');
              return expect(popup.querySelector('span.right-label').textContent).toContain('#ffffff');
            });
          });
        });
        describe('when the autocompleteSuggestionsFromValue setting is enabled', function() {
          beforeEach(function() {
            return atom.config.set('pigments.autocompleteSuggestionsFromValue', true);
          });
          it('suggests color variables from hexadecimal values', function() {
            runs(function() {
              expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
              editor.moveToBottom();
              editor.insertText('#');
              editor.insertText('f');
              editor.insertText('f');
              return advanceClock(completionDelay);
            });
            waitsFor(function() {
              return autocompleteManager.displaySuggestions.calls.length === 1;
            });
            waitsFor(function() {
              return editorView.querySelector('.autocomplete-plus li') != null;
            });
            return runs(function() {
              var popup;
              popup = editorView.querySelector('.autocomplete-plus');
              expect(popup).toExist();
              expect(popup.querySelector('span.word').textContent).toEqual('var1');
              return expect(popup.querySelector('span.right-label').textContent).toContain('#ffffff');
            });
          });
          it('suggests color variables from hexadecimal values when in a CSS expression', function() {
            runs(function() {
              expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
              editor.moveToBottom();
              editor.insertText('border: 1px solid ');
              editor.moveToBottom();
              editor.insertText('#');
              editor.insertText('f');
              editor.insertText('f');
              return advanceClock(completionDelay);
            });
            waitsFor(function() {
              return autocompleteManager.displaySuggestions.calls.length === 1;
            });
            waitsFor(function() {
              return editorView.querySelector('.autocomplete-plus li') != null;
            });
            return runs(function() {
              var popup;
              popup = editorView.querySelector('.autocomplete-plus');
              expect(popup).toExist();
              expect(popup.querySelector('span.word').textContent).toEqual('var1');
              return expect(popup.querySelector('span.right-label').textContent).toContain('#ffffff');
            });
          });
          it('suggests color variables from rgb values', function() {
            runs(function() {
              expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
              editor.moveToBottom();
              editor.insertText('border: 1px solid ');
              editor.moveToBottom();
              editor.insertText('r');
              editor.insertText('g');
              editor.insertText('b');
              editor.insertText('(');
              editor.insertText('2');
              editor.insertText('5');
              editor.insertText('5');
              editor.insertText(',');
              editor.insertText(' ');
              return advanceClock(completionDelay);
            });
            waitsFor(function() {
              return autocompleteManager.displaySuggestions.calls.length === 1;
            });
            waitsFor(function() {
              return editorView.querySelector('.autocomplete-plus li') != null;
            });
            return runs(function() {
              var popup;
              popup = editorView.querySelector('.autocomplete-plus');
              expect(popup).toExist();
              expect(popup.querySelector('span.word').textContent).toEqual('var1');
              return expect(popup.querySelector('span.right-label').textContent).toContain('#ffffff');
            });
          });
          return describe('and when extendAutocompleteToVariables is true', function() {
            beforeEach(function() {
              return atom.config.set('pigments.extendAutocompleteToVariables', true);
            });
            return it('returns suggestions for the matching variable value', function() {
              runs(function() {
                expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
                editor.moveToBottom();
                editor.insertText('border: ');
                editor.moveToBottom();
                editor.insertText('6');
                editor.insertText('p');
                editor.insertText('x');
                editor.insertText(' ');
                return advanceClock(completionDelay);
              });
              waitsFor(function() {
                return autocompleteManager.displaySuggestions.calls.length === 1;
              });
              waitsFor(function() {
                return editorView.querySelector('.autocomplete-plus li') != null;
              });
              return runs(function() {
                var popup;
                popup = editorView.querySelector('.autocomplete-plus');
                expect(popup).toExist();
                expect(popup.querySelector('span.word').textContent).toEqual('button-padding');
                return expect(popup.querySelector('span.right-label').textContent).toEqual('6px 8px');
              });
            });
          });
        });
        return describe('with a transparent color', function() {
          return it('displays the color hexadecimal code in the completion item', function() {
            runs(function() {
              expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
              editor.moveToBottom();
              editor.insertText('$');
              editor.insertText('o');
              editor.insertText('t');
              return advanceClock(completionDelay);
            });
            waitsFor(function() {
              return autocompleteManager.displaySuggestions.calls.length === 1;
            });
            waitsFor(function() {
              return editorView.querySelector('.autocomplete-plus li') != null;
            });
            return runs(function() {
              var popup;
              popup = editorView.querySelector('.autocomplete-plus');
              expect(popup).toExist();
              expect(popup.querySelector('span.word').textContent).toEqual('$other-color');
              return expect(popup.querySelector('span.right-label').textContent).toContain('rgba(255,0,0,0.5)');
            });
          });
        });
      });
    });
    describe('writing the name of a non-color variable', function() {
      return it('returns suggestions for the matching variable', function() {
        atom.config.set('pigments.extendAutocompleteToVariables', false);
        runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('f');
          editor.insertText('o');
          editor.insertText('o');
          return advanceClock(completionDelay);
        });
        waitsFor(function() {
          return autocompleteManager.displaySuggestions.calls.length === 1;
        });
        return runs(function() {
          return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        });
      });
    });
    return describe('when extendAutocompleteToVariables is true', function() {
      beforeEach(function() {
        return atom.config.set('pigments.extendAutocompleteToVariables', true);
      });
      return describe('writing the name of a non-color variable', function() {
        return it('returns suggestions for the matching variable', function() {
          runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            editor.moveToBottom();
            editor.insertText('b');
            editor.insertText('u');
            editor.insertText('t');
            editor.insertText('t');
            editor.insertText('o');
            editor.insertText('n');
            editor.insertText('-');
            editor.insertText('p');
            return advanceClock(completionDelay);
          });
          waitsFor(function() {
            return autocompleteManager.displaySuggestions.calls.length === 1;
          });
          waitsFor(function() {
            return editorView.querySelector('.autocomplete-plus li') != null;
          });
          return runs(function() {
            var popup;
            popup = editorView.querySelector('.autocomplete-plus');
            expect(popup).toExist();
            expect(popup.querySelector('span.word').textContent).toEqual('button-padding');
            return expect(popup.querySelector('span.right-label').textContent).toEqual('6px 8px');
          });
        });
      });
    });
  });

  describe('autocomplete provider', function() {
    var autocompleteMain, autocompleteManager, completionDelay, editor, editorView, jasmineContent, pigments, project, ref;
    ref = [], completionDelay = ref[0], editor = ref[1], editorView = ref[2], pigments = ref[3], autocompleteMain = ref[4], autocompleteManager = ref[5], jasmineContent = ref[6], project = ref[7];
    return describe('for sass files', function() {
      beforeEach(function() {
        runs(function() {
          var workspaceElement;
          jasmineContent = document.body.querySelector('#jasmine-content');
          atom.config.set('pigments.autocompleteScopes', ['*']);
          atom.config.set('pigments.sourceNames', ['**/*.sass', '**/*.scss']);
          atom.config.set('autocomplete-plus.enableAutoActivation', true);
          completionDelay = 100;
          atom.config.set('autocomplete-plus.autoActivationDelay', completionDelay);
          completionDelay += 100;
          workspaceElement = atom.views.getView(atom.workspace);
          return jasmineContent.appendChild(workspaceElement);
        });
        waitsForPromise('autocomplete-plus activation', function() {
          return atom.packages.activatePackage('autocomplete-plus').then(function(pkg) {
            return autocompleteMain = pkg.mainModule;
          });
        });
        waitsForPromise('pigments activation', function() {
          return atom.packages.activatePackage('pigments').then(function(pkg) {
            return pigments = pkg.mainModule;
          });
        });
        runs(function() {
          spyOn(autocompleteMain, 'consumeProvider').andCallThrough();
          return spyOn(pigments, 'provideAutocomplete').andCallThrough();
        });
        waitsForPromise('open sample file', function() {
          return atom.workspace.open('sample.styl').then(function(e) {
            editor = e;
            return editorView = atom.views.getView(editor);
          });
        });
        waitsForPromise('pigments project initialized', function() {
          project = pigments.getProject();
          return project.initialize();
        });
        return runs(function() {
          autocompleteManager = autocompleteMain.autocompleteManager;
          spyOn(autocompleteManager, 'findSuggestions').andCallThrough();
          return spyOn(autocompleteManager, 'displaySuggestions').andCallThrough();
        });
      });
      return it('does not display the alternate sass version', function() {
        runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('$');
          editor.insertText('b');
          editor.insertText('a');
          return advanceClock(completionDelay);
        });
        waitsFor('suggestions displayed callback', function() {
          return autocompleteManager.displaySuggestions.calls.length === 1;
        });
        waitsFor('autocomplete lis', function() {
          return editorView.querySelector('.autocomplete-plus li') != null;
        });
        return runs(function() {
          var hasAlternate, lis;
          lis = editorView.querySelectorAll('.autocomplete-plus li');
          hasAlternate = Array.prototype.some.call(lis, function(li) {
            return li.querySelector('span.word').textContent === '$base_color';
          });
          return expect(hasAlternate).toBeFalsy();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvcGlnbWVudHMvc3BlYy9waWdtZW50cy1wcm92aWRlci1zcGVjLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtFQUFBLFFBQUEsQ0FBUyx1QkFBVCxFQUFrQyxTQUFBO0FBQ2hDLFFBQUE7SUFBQSxNQUFrSCxFQUFsSCxFQUFDLHdCQUFELEVBQWtCLGVBQWxCLEVBQTBCLG1CQUExQixFQUFzQyxpQkFBdEMsRUFBZ0QseUJBQWhELEVBQWtFLDRCQUFsRSxFQUF1Rix1QkFBdkYsRUFBdUc7SUFFdkcsVUFBQSxDQUFXLFNBQUE7TUFDVCxJQUFBLENBQUssU0FBQTtBQUNILFlBQUE7UUFBQSxjQUFBLEdBQWlCLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBZCxDQUE0QixrQkFBNUI7UUFFakIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDZCQUFoQixFQUErQyxDQUFDLEdBQUQsQ0FBL0M7UUFDQSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isc0JBQWhCLEVBQXdDLENBQ3RDLFdBRHNDLEVBRXRDLFdBRnNDLENBQXhDO1FBTUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHdDQUFoQixFQUEwRCxJQUExRDtRQUVBLGVBQUEsR0FBa0I7UUFDbEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVDQUFoQixFQUF5RCxlQUF6RDtRQUNBLGVBQUEsSUFBbUI7UUFDbkIsZ0JBQUEsR0FBbUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QjtlQUVuQixjQUFjLENBQUMsV0FBZixDQUEyQixnQkFBM0I7TUFqQkcsQ0FBTDtNQW1CQSxlQUFBLENBQWdCLDhCQUFoQixFQUFnRCxTQUFBO2VBQzlDLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixtQkFBOUIsQ0FBa0QsQ0FB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O1VBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsR0FBbEI7VUFDQSxNQUFNLENBQUMsVUFBUCxDQUFrQixHQUFsQjtVQUNBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEdBQWxCO2lCQUVBLFlBQUEsQ0FBYSxlQUFiO1FBUkcsQ0FBTDtRQVVBLFFBQUEsQ0FBUyxnQ0FBVCxFQUEyQyxTQUFBO2lCQUN6QyxtQkFBbUIsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsTUFBN0MsS0FBdUQ7UUFEZCxDQUEzQztRQUdBLFFBQUEsQ0FBUyxrQkFBVCxFQUE2QixTQUFBO2lCQUMzQjtRQUQyQixDQUE3QjtlQUdBLElBQUEsQ0FBSyxTQUFBO0FBQ0gsY0FBQTtVQUFBLEdBQUEsR0FBTSxVQUFVLENBQUMsZ0JBQVgsQ0FBNEIsdUJBQTVCO1VBQ04sWUFBQSxHQUFlLEtBQUssQ0FBQSxTQUFFLENBQUEsSUFBSSxDQUFDLElBQVosQ0FBaUIsR0FBakIsRUFBc0IsU0FBQyxFQUFEO21CQUNuQyxFQUFFLENBQUMsYUFBSCxDQUFpQixXQUFqQixDQUE2QixDQUFDLFdBQTlCLEtBQTZDO1VBRFYsQ0FBdEI7aUJBR2YsTUFBQSxDQUFPLFlBQVAsQ0FBb0IsQ0FBQyxTQUFyQixDQUFBO1FBTEcsQ0FBTDtNQWpCZ0QsQ0FBbEQ7SUEvQ3lCLENBQTNCO0VBSGdDLENBQWxDO0FBclZBIiwic291cmNlc0NvbnRlbnQiOlsiXG5kZXNjcmliZSAnYXV0b2NvbXBsZXRlIHByb3ZpZGVyJywgLT5cbiAgW2NvbXBsZXRpb25EZWxheSwgZWRpdG9yLCBlZGl0b3JWaWV3LCBwaWdtZW50cywgYXV0b2NvbXBsZXRlTWFpbiwgYXV0b2NvbXBsZXRlTWFuYWdlciwgamFzbWluZUNvbnRlbnQsIHByb2plY3RdID0gW11cblxuICBiZWZvcmVFYWNoIC0+XG4gICAgcnVucyAtPlxuICAgICAgamFzbWluZUNvbnRlbnQgPSBkb2N1bWVudC5ib2R5LnF1ZXJ5U2VsZWN0b3IoJyNqYXNtaW5lLWNvbnRlbnQnKVxuXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ3BpZ21lbnRzLmF1dG9jb21wbGV0ZVNjb3BlcycsIFsnKiddKVxuICAgICAgYXRvbS5jb25maWcuc2V0KCdwaWdtZW50cy5zb3VyY2VOYW1lcycsIFtcbiAgICAgICAgJyoqLyouc3R5bCdcbiAgICAgICAgJyoqLyoubGVzcydcbiAgICAgIF0pXG5cbiAgICAgICMgU2V0IHRvIGxpdmUgY29tcGxldGlvblxuICAgICAgYXRvbS5jb25maWcuc2V0KCdhdXRvY29tcGxldGUtcGx1cy5lbmFibGVBdXRvQWN0aXZhdGlvbicsIHRydWUpXG4gICAgICAjIFNldCB0aGUgY29tcGxldGlvbiBkZWxheVxuICAgICAgY29tcGxldGlvbkRlbGF5ID0gMTAwXG4gICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLmF1dG9BY3RpdmF0aW9uRGVsYXknLCBjb21wbGV0aW9uRGVsYXkpXG4gICAgICBjb21wbGV0aW9uRGVsYXkgKz0gMTAwICMgUmVuZGVyaW5nIGRlbGF5XG4gICAgICB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuXG4gICAgICBqYXNtaW5lQ29udGVudC5hcHBlbmRDaGlsZCh3b3Jrc3BhY2VFbGVtZW50KVxuXG4gICAgd2FpdHNGb3JQcm9taXNlICdhdXRvY29tcGxldGUtcGx1cyBhY3RpdmF0aW9uJywgLT5cbiAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdhdXRvY29tcGxldGUtcGx1cycpLnRoZW4gKHBrZykgLT5cbiAgICAgICAgYXV0b2NvbXBsZXRlTWFpbiA9IHBrZy5tYWluTW9kdWxlXG5cbiAgICB3YWl0c0ZvclByb21pc2UgJ3BpZ21lbnRzIGFjdGl2YXRpb24nLCAtPlxuICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ3BpZ21lbnRzJykudGhlbiAocGtnKSAtPlxuICAgICAgICBwaWdtZW50cyA9IHBrZy5tYWluTW9kdWxlXG5cbiAgICBydW5zIC0+XG4gICAgICBzcHlPbihhdXRvY29tcGxldGVNYWluLCAnY29uc3VtZVByb3ZpZGVyJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgc3B5T24ocGlnbWVudHMsICdwcm92aWRlQXV0b2NvbXBsZXRlJykuYW5kQ2FsbFRocm91Z2goKVxuXG4gICAgd2FpdHNGb3JQcm9taXNlICdvcGVuIHNhbXBsZSBmaWxlJywgLT5cbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oJ3NhbXBsZS5zdHlsJykudGhlbiAoZSkgLT5cbiAgICAgICAgZWRpdG9yID0gZVxuICAgICAgICBlZGl0b3Iuc2V0VGV4dCAnJ1xuICAgICAgICBlZGl0b3JWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcilcblxuICAgIHdhaXRzRm9yUHJvbWlzZSAncGlnbWVudHMgcHJvamVjdCBpbml0aWFsaXplZCcsIC0+XG4gICAgICBwcm9qZWN0ID0gcGlnbWVudHMuZ2V0UHJvamVjdCgpXG4gICAgICBwcm9qZWN0LmluaXRpYWxpemUoKVxuXG4gICAgcnVucyAtPlxuICAgICAgYXV0b2NvbXBsZXRlTWFuYWdlciA9IGF1dG9jb21wbGV0ZU1haW4uYXV0b2NvbXBsZXRlTWFuYWdlclxuICAgICAgc3B5T24oYXV0b2NvbXBsZXRlTWFuYWdlciwgJ2ZpbmRTdWdnZXN0aW9ucycpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgIHNweU9uKGF1dG9jb21wbGV0ZU1hbmFnZXIsICdkaXNwbGF5U3VnZ2VzdGlvbnMnKS5hbmRDYWxsVGhyb3VnaCgpXG5cbiAgZGVzY3JpYmUgJ3dyaXRpbmcgdGhlIG5hbWUgb2YgYSBjb2xvcicsIC0+XG4gICAgaXQgJ3JldHVybnMgc3VnZ2VzdGlvbnMgZm9yIHRoZSBtYXRjaGluZyBjb2xvcnMnLCAtPlxuICAgICAgcnVucyAtPlxuICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuXG4gICAgICAgIGVkaXRvci5tb3ZlVG9Cb3R0b20oKVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYm9yZGVyOiAxcHggc29saWQgJylcbiAgICAgICAgZWRpdG9yLm1vdmVUb0JvdHRvbSgpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdiJylcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2EnKVxuXG4gICAgICAgIGFkdmFuY2VDbG9jayhjb21wbGV0aW9uRGVsYXkpXG5cbiAgICAgIHdhaXRzRm9yIC0+XG4gICAgICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuZGlzcGxheVN1Z2dlc3Rpb25zLmNhbGxzLmxlbmd0aCBpcyAxXG5cbiAgICAgIHdhaXRzRm9yIC0+IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzIGxpJyk/XG5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgcG9wdXAgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpXG4gICAgICAgIGV4cGVjdChwb3B1cCkudG9FeGlzdCgpXG4gICAgICAgIGV4cGVjdChwb3B1cC5xdWVyeVNlbGVjdG9yKCdzcGFuLndvcmQnKS50ZXh0Q29udGVudCkudG9FcXVhbCgnYmFzZS1jb2xvcicpXG5cbiAgICAgICAgcHJldmlldyA9IHBvcHVwLnF1ZXJ5U2VsZWN0b3IoJy5jb2xvci1zdWdnZXN0aW9uLXByZXZpZXcnKVxuICAgICAgICBleHBlY3QocHJldmlldykudG9FeGlzdCgpXG4gICAgICAgIGV4cGVjdChwcmV2aWV3LnN0eWxlLmJhY2tncm91bmQpLnRvRXF1YWwoJ3JnYigyNTUsIDI1NSwgMjU1KScpXG5cbiAgICBpdCAncmVwbGFjZXMgdGhlIHByZWZpeCBldmVuIHdoZW4gaXQgY29udGFpbnMgYSBAJywgLT5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcblxuICAgICAgICBlZGl0b3IubW92ZVRvQm90dG9tKClcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ0AnKVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYicpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdhJylcblxuICAgICAgICBhZHZhbmNlQ2xvY2soY29tcGxldGlvbkRlbGF5KVxuXG4gICAgICB3YWl0c0ZvciAtPlxuICAgICAgICBhdXRvY29tcGxldGVNYW5hZ2VyLmRpc3BsYXlTdWdnZXN0aW9ucy5jYWxscy5sZW5ndGggaXMgMVxuXG4gICAgICB3YWl0c0ZvciAtPiBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBsaScpP1xuXG4gICAgICBydW5zIC0+XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yVmlldywgJ2F1dG9jb21wbGV0ZS1wbHVzOmNvbmZpcm0nKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkubm90LnRvQ29udGFpbiAnQEAnXG5cbiAgICBpdCAncmVwbGFjZXMgdGhlIHByZWZpeCBldmVuIHdoZW4gaXQgY29udGFpbnMgYSAkJywgLT5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcblxuICAgICAgICBlZGl0b3IubW92ZVRvQm90dG9tKClcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJyQnKVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnbycpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCd0JylcblxuICAgICAgICBhZHZhbmNlQ2xvY2soY29tcGxldGlvbkRlbGF5KVxuXG4gICAgICB3YWl0c0ZvciAtPlxuICAgICAgICBhdXRvY29tcGxldGVNYW5hZ2VyLmRpc3BsYXlTdWdnZXN0aW9ucy5jYWxscy5sZW5ndGggaXMgMVxuXG4gICAgICB3YWl0c0ZvciAtPiBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBsaScpP1xuXG4gICAgICBydW5zIC0+XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yVmlldywgJ2F1dG9jb21wbGV0ZS1wbHVzOmNvbmZpcm0nKVxuICAgICAgICBleHBlY3QoZWRpdG9yLmdldFRleHQoKSkudG9Db250YWluICckb3RoZXItY29sb3InXG4gICAgICAgIGV4cGVjdChlZGl0b3IuZ2V0VGV4dCgpKS5ub3QudG9Db250YWluICckJCdcblxuICAgIGRlc2NyaWJlICd3aGVuIHRoZSBleHRlbmRBdXRvY29tcGxldGVUb0NvbG9yVmFsdWUgc2V0dGluZyBpcyBlbmFibGVkJywgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdwaWdtZW50cy5leHRlbmRBdXRvY29tcGxldGVUb0NvbG9yVmFsdWUnLCB0cnVlKVxuXG4gICAgICBkZXNjcmliZSAnd2l0aCBhbiBvcGFxdWUgY29sb3InLCAtPlxuICAgICAgICBpdCAnZGlzcGxheXMgdGhlIGNvbG9yIGhleGFkZWNpbWFsIGNvZGUgaW4gdGhlIGNvbXBsZXRpb24gaXRlbScsIC0+XG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcblxuICAgICAgICAgICAgZWRpdG9yLm1vdmVUb0JvdHRvbSgpXG4gICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYicpXG4gICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYScpXG4gICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgncycpXG5cbiAgICAgICAgICAgIGFkdmFuY2VDbG9jayhjb21wbGV0aW9uRGVsYXkpXG5cbiAgICAgICAgICB3YWl0c0ZvciAtPlxuICAgICAgICAgICAgYXV0b2NvbXBsZXRlTWFuYWdlci5kaXNwbGF5U3VnZ2VzdGlvbnMuY2FsbHMubGVuZ3RoIGlzIDFcblxuICAgICAgICAgIHdhaXRzRm9yIC0+XG4gICAgICAgICAgICBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBsaScpP1xuXG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgcG9wdXAgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpXG4gICAgICAgICAgICBleHBlY3QocG9wdXApLnRvRXhpc3QoKVxuICAgICAgICAgICAgZXhwZWN0KHBvcHVwLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4ud29yZCcpLnRleHRDb250ZW50KS50b0VxdWFsKCdiYXNlLWNvbG9yJylcblxuICAgICAgICAgICAgZXhwZWN0KHBvcHVwLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4ucmlnaHQtbGFiZWwnKS50ZXh0Q29udGVudCkudG9Db250YWluKCcjZmZmZmZmJylcblxuICAgICAgZGVzY3JpYmUgJ3doZW4gdGhlIGF1dG9jb21wbGV0ZVN1Z2dlc3Rpb25zRnJvbVZhbHVlIHNldHRpbmcgaXMgZW5hYmxlZCcsIC0+XG4gICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ3BpZ21lbnRzLmF1dG9jb21wbGV0ZVN1Z2dlc3Rpb25zRnJvbVZhbHVlJywgdHJ1ZSlcblxuICAgICAgICBpdCAnc3VnZ2VzdHMgY29sb3IgdmFyaWFibGVzIGZyb20gaGV4YWRlY2ltYWwgdmFsdWVzJywgLT5cbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuXG4gICAgICAgICAgICBlZGl0b3IubW92ZVRvQm90dG9tKClcbiAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCcjJylcbiAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdmJylcbiAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdmJylcblxuICAgICAgICAgICAgYWR2YW5jZUNsb2NrKGNvbXBsZXRpb25EZWxheSlcblxuICAgICAgICAgIHdhaXRzRm9yIC0+XG4gICAgICAgICAgICBhdXRvY29tcGxldGVNYW5hZ2VyLmRpc3BsYXlTdWdnZXN0aW9ucy5jYWxscy5sZW5ndGggaXMgMVxuXG4gICAgICAgICAgd2FpdHNGb3IgLT5cbiAgICAgICAgICAgIGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzIGxpJyk/XG5cbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICBwb3B1cCA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJylcbiAgICAgICAgICAgIGV4cGVjdChwb3B1cCkudG9FeGlzdCgpXG4gICAgICAgICAgICBleHBlY3QocG9wdXAucXVlcnlTZWxlY3Rvcignc3Bhbi53b3JkJykudGV4dENvbnRlbnQpLnRvRXF1YWwoJ3ZhcjEnKVxuXG4gICAgICAgICAgICBleHBlY3QocG9wdXAucXVlcnlTZWxlY3Rvcignc3Bhbi5yaWdodC1sYWJlbCcpLnRleHRDb250ZW50KS50b0NvbnRhaW4oJyNmZmZmZmYnKVxuXG4gICAgICAgIGl0ICdzdWdnZXN0cyBjb2xvciB2YXJpYWJsZXMgZnJvbSBoZXhhZGVjaW1hbCB2YWx1ZXMgd2hlbiBpbiBhIENTUyBleHByZXNzaW9uJywgLT5cbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuXG4gICAgICAgICAgICBlZGl0b3IubW92ZVRvQm90dG9tKClcbiAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdib3JkZXI6IDFweCBzb2xpZCAnKVxuICAgICAgICAgICAgZWRpdG9yLm1vdmVUb0JvdHRvbSgpXG4gICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnIycpXG4gICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnZicpXG4gICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnZicpXG5cbiAgICAgICAgICAgIGFkdmFuY2VDbG9jayhjb21wbGV0aW9uRGVsYXkpXG5cbiAgICAgICAgICB3YWl0c0ZvciAtPlxuICAgICAgICAgICAgYXV0b2NvbXBsZXRlTWFuYWdlci5kaXNwbGF5U3VnZ2VzdGlvbnMuY2FsbHMubGVuZ3RoIGlzIDFcblxuICAgICAgICAgIHdhaXRzRm9yIC0+XG4gICAgICAgICAgICBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cyBsaScpP1xuXG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgcG9wdXAgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpXG4gICAgICAgICAgICBleHBlY3QocG9wdXApLnRvRXhpc3QoKVxuICAgICAgICAgICAgZXhwZWN0KHBvcHVwLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4ud29yZCcpLnRleHRDb250ZW50KS50b0VxdWFsKCd2YXIxJylcblxuICAgICAgICAgICAgZXhwZWN0KHBvcHVwLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4ucmlnaHQtbGFiZWwnKS50ZXh0Q29udGVudCkudG9Db250YWluKCcjZmZmZmZmJylcblxuICAgICAgICBpdCAnc3VnZ2VzdHMgY29sb3IgdmFyaWFibGVzIGZyb20gcmdiIHZhbHVlcycsIC0+XG4gICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcblxuICAgICAgICAgICAgZWRpdG9yLm1vdmVUb0JvdHRvbSgpXG4gICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYm9yZGVyOiAxcHggc29saWQgJylcbiAgICAgICAgICAgIGVkaXRvci5tb3ZlVG9Cb3R0b20oKVxuICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ3InKVxuICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2cnKVxuICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2InKVxuICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJygnKVxuICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJzInKVxuICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJzUnKVxuICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJzUnKVxuICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJywnKVxuICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJyAnKVxuXG4gICAgICAgICAgICBhZHZhbmNlQ2xvY2soY29tcGxldGlvbkRlbGF5KVxuXG4gICAgICAgICAgd2FpdHNGb3IgLT5cbiAgICAgICAgICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuZGlzcGxheVN1Z2dlc3Rpb25zLmNhbGxzLmxlbmd0aCBpcyAxXG5cbiAgICAgICAgICB3YWl0c0ZvciAtPlxuICAgICAgICAgICAgZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMgbGknKT9cblxuICAgICAgICAgIHJ1bnMgLT5cbiAgICAgICAgICAgIHBvcHVwID0gZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKVxuICAgICAgICAgICAgZXhwZWN0KHBvcHVwKS50b0V4aXN0KClcbiAgICAgICAgICAgIGV4cGVjdChwb3B1cC5xdWVyeVNlbGVjdG9yKCdzcGFuLndvcmQnKS50ZXh0Q29udGVudCkudG9FcXVhbCgndmFyMScpXG5cbiAgICAgICAgICAgIGV4cGVjdChwb3B1cC5xdWVyeVNlbGVjdG9yKCdzcGFuLnJpZ2h0LWxhYmVsJykudGV4dENvbnRlbnQpLnRvQ29udGFpbignI2ZmZmZmZicpXG5cbiAgICAgICAgZGVzY3JpYmUgJ2FuZCB3aGVuIGV4dGVuZEF1dG9jb21wbGV0ZVRvVmFyaWFibGVzIGlzIHRydWUnLCAtPlxuICAgICAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgncGlnbWVudHMuZXh0ZW5kQXV0b2NvbXBsZXRlVG9WYXJpYWJsZXMnLCB0cnVlKVxuXG4gICAgICAgICAgaXQgJ3JldHVybnMgc3VnZ2VzdGlvbnMgZm9yIHRoZSBtYXRjaGluZyB2YXJpYWJsZSB2YWx1ZScsIC0+XG4gICAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG5cbiAgICAgICAgICAgICAgZWRpdG9yLm1vdmVUb0JvdHRvbSgpXG4gICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdib3JkZXI6ICcpXG4gICAgICAgICAgICAgIGVkaXRvci5tb3ZlVG9Cb3R0b20oKVxuICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnNicpXG4gICAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdwJylcbiAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ3gnKVxuICAgICAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnICcpXG5cbiAgICAgICAgICAgICAgYWR2YW5jZUNsb2NrKGNvbXBsZXRpb25EZWxheSlcblxuICAgICAgICAgICAgd2FpdHNGb3IgLT5cbiAgICAgICAgICAgICAgYXV0b2NvbXBsZXRlTWFuYWdlci5kaXNwbGF5U3VnZ2VzdGlvbnMuY2FsbHMubGVuZ3RoIGlzIDFcblxuICAgICAgICAgICAgd2FpdHNGb3IgLT4gZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMgbGknKT9cblxuICAgICAgICAgICAgcnVucyAtPlxuICAgICAgICAgICAgICBwb3B1cCA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJylcbiAgICAgICAgICAgICAgZXhwZWN0KHBvcHVwKS50b0V4aXN0KClcbiAgICAgICAgICAgICAgZXhwZWN0KHBvcHVwLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4ud29yZCcpLnRleHRDb250ZW50KS50b0VxdWFsKCdidXR0b24tcGFkZGluZycpXG5cbiAgICAgICAgICAgICAgZXhwZWN0KHBvcHVwLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4ucmlnaHQtbGFiZWwnKS50ZXh0Q29udGVudCkudG9FcXVhbCgnNnB4IDhweCcpXG5cblxuICAgICAgZGVzY3JpYmUgJ3dpdGggYSB0cmFuc3BhcmVudCBjb2xvcicsIC0+XG4gICAgICAgIGl0ICdkaXNwbGF5cyB0aGUgY29sb3IgaGV4YWRlY2ltYWwgY29kZSBpbiB0aGUgY29tcGxldGlvbiBpdGVtJywgLT5cbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICBleHBlY3QoZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMnKSkubm90LnRvRXhpc3QoKVxuXG4gICAgICAgICAgICBlZGl0b3IubW92ZVRvQm90dG9tKClcbiAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCckJylcbiAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdvJylcbiAgICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCd0JylcblxuICAgICAgICAgICAgYWR2YW5jZUNsb2NrKGNvbXBsZXRpb25EZWxheSlcblxuICAgICAgICAgIHdhaXRzRm9yIC0+XG4gICAgICAgICAgICBhdXRvY29tcGxldGVNYW5hZ2VyLmRpc3BsYXlTdWdnZXN0aW9ucy5jYWxscy5sZW5ndGggaXMgMVxuXG4gICAgICAgICAgd2FpdHNGb3IgLT5cbiAgICAgICAgICAgIGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzIGxpJyk/XG5cbiAgICAgICAgICBydW5zIC0+XG4gICAgICAgICAgICBwb3B1cCA9IGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJylcbiAgICAgICAgICAgIGV4cGVjdChwb3B1cCkudG9FeGlzdCgpXG4gICAgICAgICAgICBleHBlY3QocG9wdXAucXVlcnlTZWxlY3Rvcignc3Bhbi53b3JkJykudGV4dENvbnRlbnQpLnRvRXF1YWwoJyRvdGhlci1jb2xvcicpXG5cbiAgICAgICAgICAgIGV4cGVjdChwb3B1cC5xdWVyeVNlbGVjdG9yKCdzcGFuLnJpZ2h0LWxhYmVsJykudGV4dENvbnRlbnQpLnRvQ29udGFpbigncmdiYSgyNTUsMCwwLDAuNSknKVxuXG4gIGRlc2NyaWJlICd3cml0aW5nIHRoZSBuYW1lIG9mIGEgbm9uLWNvbG9yIHZhcmlhYmxlJywgLT5cbiAgICBpdCAncmV0dXJucyBzdWdnZXN0aW9ucyBmb3IgdGhlIG1hdGNoaW5nIHZhcmlhYmxlJywgLT5cbiAgICAgIGF0b20uY29uZmlnLnNldCgncGlnbWVudHMuZXh0ZW5kQXV0b2NvbXBsZXRlVG9WYXJpYWJsZXMnLCBmYWxzZSlcbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgZXhwZWN0KGVkaXRvclZpZXcucXVlcnlTZWxlY3RvcignLmF1dG9jb21wbGV0ZS1wbHVzJykpLm5vdC50b0V4aXN0KClcblxuICAgICAgICBlZGl0b3IubW92ZVRvQm90dG9tKClcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2YnKVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnbycpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCdvJylcblxuICAgICAgICBhZHZhbmNlQ2xvY2soY29tcGxldGlvbkRlbGF5KVxuXG4gICAgICB3YWl0c0ZvciAtPlxuICAgICAgICBhdXRvY29tcGxldGVNYW5hZ2VyLmRpc3BsYXlTdWdnZXN0aW9ucy5jYWxscy5sZW5ndGggaXMgMVxuXG4gICAgICBydW5zIC0+XG4gICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG5cbiAgZGVzY3JpYmUgJ3doZW4gZXh0ZW5kQXV0b2NvbXBsZXRlVG9WYXJpYWJsZXMgaXMgdHJ1ZScsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgYXRvbS5jb25maWcuc2V0KCdwaWdtZW50cy5leHRlbmRBdXRvY29tcGxldGVUb1ZhcmlhYmxlcycsIHRydWUpXG5cbiAgICBkZXNjcmliZSAnd3JpdGluZyB0aGUgbmFtZSBvZiBhIG5vbi1jb2xvciB2YXJpYWJsZScsIC0+XG4gICAgICBpdCAncmV0dXJucyBzdWdnZXN0aW9ucyBmb3IgdGhlIG1hdGNoaW5nIHZhcmlhYmxlJywgLT5cbiAgICAgICAgcnVucyAtPlxuICAgICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG5cbiAgICAgICAgICBlZGl0b3IubW92ZVRvQm90dG9tKClcbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYicpXG4gICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ3UnKVxuICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCd0JylcbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgndCcpXG4gICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ28nKVxuICAgICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCduJylcbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnLScpXG4gICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ3AnKVxuXG4gICAgICAgICAgYWR2YW5jZUNsb2NrKGNvbXBsZXRpb25EZWxheSlcblxuICAgICAgICB3YWl0c0ZvciAtPlxuICAgICAgICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuZGlzcGxheVN1Z2dlc3Rpb25zLmNhbGxzLmxlbmd0aCBpcyAxXG5cbiAgICAgICAgd2FpdHNGb3IgLT4gZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMgbGknKT9cblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgcG9wdXAgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpXG4gICAgICAgICAgZXhwZWN0KHBvcHVwKS50b0V4aXN0KClcbiAgICAgICAgICBleHBlY3QocG9wdXAucXVlcnlTZWxlY3Rvcignc3Bhbi53b3JkJykudGV4dENvbnRlbnQpLnRvRXF1YWwoJ2J1dHRvbi1wYWRkaW5nJylcblxuICAgICAgICAgIGV4cGVjdChwb3B1cC5xdWVyeVNlbGVjdG9yKCdzcGFuLnJpZ2h0LWxhYmVsJykudGV4dENvbnRlbnQpLnRvRXF1YWwoJzZweCA4cHgnKVxuXG5kZXNjcmliZSAnYXV0b2NvbXBsZXRlIHByb3ZpZGVyJywgLT5cbiAgW2NvbXBsZXRpb25EZWxheSwgZWRpdG9yLCBlZGl0b3JWaWV3LCBwaWdtZW50cywgYXV0b2NvbXBsZXRlTWFpbiwgYXV0b2NvbXBsZXRlTWFuYWdlciwgamFzbWluZUNvbnRlbnQsIHByb2plY3RdID0gW11cblxuICBkZXNjcmliZSAnZm9yIHNhc3MgZmlsZXMnLCAtPlxuICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgIHJ1bnMgLT5cbiAgICAgICAgamFzbWluZUNvbnRlbnQgPSBkb2N1bWVudC5ib2R5LnF1ZXJ5U2VsZWN0b3IoJyNqYXNtaW5lLWNvbnRlbnQnKVxuXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgncGlnbWVudHMuYXV0b2NvbXBsZXRlU2NvcGVzJywgWycqJ10pXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgncGlnbWVudHMuc291cmNlTmFtZXMnLCBbXG4gICAgICAgICAgJyoqLyouc2FzcydcbiAgICAgICAgICAnKiovKi5zY3NzJ1xuICAgICAgICBdKVxuXG4gICAgICAgICMgU2V0IHRvIGxpdmUgY29tcGxldGlvblxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F1dG9jb21wbGV0ZS1wbHVzLmVuYWJsZUF1dG9BY3RpdmF0aW9uJywgdHJ1ZSlcbiAgICAgICAgIyBTZXQgdGhlIGNvbXBsZXRpb24gZGVsYXlcbiAgICAgICAgY29tcGxldGlvbkRlbGF5ID0gMTAwXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnYXV0b2NvbXBsZXRlLXBsdXMuYXV0b0FjdGl2YXRpb25EZWxheScsIGNvbXBsZXRpb25EZWxheSlcbiAgICAgICAgY29tcGxldGlvbkRlbGF5ICs9IDEwMCAjIFJlbmRlcmluZyBkZWxheVxuICAgICAgICB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuXG4gICAgICAgIGphc21pbmVDb250ZW50LmFwcGVuZENoaWxkKHdvcmtzcGFjZUVsZW1lbnQpXG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAnYXV0b2NvbXBsZXRlLXBsdXMgYWN0aXZhdGlvbicsIC0+XG4gICAgICAgIGF0b20ucGFja2FnZXMuYWN0aXZhdGVQYWNrYWdlKCdhdXRvY29tcGxldGUtcGx1cycpLnRoZW4gKHBrZykgLT5cbiAgICAgICAgICBhdXRvY29tcGxldGVNYWluID0gcGtnLm1haW5Nb2R1bGVcblxuICAgICAgd2FpdHNGb3JQcm9taXNlICdwaWdtZW50cyBhY3RpdmF0aW9uJywgLT5cbiAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ3BpZ21lbnRzJykudGhlbiAocGtnKSAtPlxuICAgICAgICAgIHBpZ21lbnRzID0gcGtnLm1haW5Nb2R1bGVcblxuICAgICAgcnVucyAtPlxuICAgICAgICBzcHlPbihhdXRvY29tcGxldGVNYWluLCAnY29uc3VtZVByb3ZpZGVyJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgICBzcHlPbihwaWdtZW50cywgJ3Byb3ZpZGVBdXRvY29tcGxldGUnKS5hbmRDYWxsVGhyb3VnaCgpXG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAnb3BlbiBzYW1wbGUgZmlsZScsIC0+XG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oJ3NhbXBsZS5zdHlsJykudGhlbiAoZSkgLT5cbiAgICAgICAgICBlZGl0b3IgPSBlXG4gICAgICAgICAgZWRpdG9yVmlldyA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpXG5cbiAgICAgIHdhaXRzRm9yUHJvbWlzZSAncGlnbWVudHMgcHJvamVjdCBpbml0aWFsaXplZCcsIC0+XG4gICAgICAgIHByb2plY3QgPSBwaWdtZW50cy5nZXRQcm9qZWN0KClcbiAgICAgICAgcHJvamVjdC5pbml0aWFsaXplKClcblxuICAgICAgcnVucyAtPlxuICAgICAgICBhdXRvY29tcGxldGVNYW5hZ2VyID0gYXV0b2NvbXBsZXRlTWFpbi5hdXRvY29tcGxldGVNYW5hZ2VyXG4gICAgICAgIHNweU9uKGF1dG9jb21wbGV0ZU1hbmFnZXIsICdmaW5kU3VnZ2VzdGlvbnMnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICAgIHNweU9uKGF1dG9jb21wbGV0ZU1hbmFnZXIsICdkaXNwbGF5U3VnZ2VzdGlvbnMnKS5hbmRDYWxsVGhyb3VnaCgpXG5cbiAgICBpdCAnZG9lcyBub3QgZGlzcGxheSB0aGUgYWx0ZXJuYXRlIHNhc3MgdmVyc2lvbicsIC0+XG4gICAgICBydW5zIC0+XG4gICAgICAgIGV4cGVjdChlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3IoJy5hdXRvY29tcGxldGUtcGx1cycpKS5ub3QudG9FeGlzdCgpXG5cbiAgICAgICAgZWRpdG9yLm1vdmVUb0JvdHRvbSgpXG4gICAgICAgIGVkaXRvci5pbnNlcnRUZXh0KCckJylcbiAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2InKVxuICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCgnYScpXG5cbiAgICAgICAgYWR2YW5jZUNsb2NrKGNvbXBsZXRpb25EZWxheSlcblxuICAgICAgd2FpdHNGb3IgJ3N1Z2dlc3Rpb25zIGRpc3BsYXllZCBjYWxsYmFjaycsIC0+XG4gICAgICAgIGF1dG9jb21wbGV0ZU1hbmFnZXIuZGlzcGxheVN1Z2dlc3Rpb25zLmNhbGxzLmxlbmd0aCBpcyAxXG5cbiAgICAgIHdhaXRzRm9yICdhdXRvY29tcGxldGUgbGlzJywgLT5cbiAgICAgICAgZWRpdG9yVmlldy5xdWVyeVNlbGVjdG9yKCcuYXV0b2NvbXBsZXRlLXBsdXMgbGknKT9cblxuICAgICAgcnVucyAtPlxuICAgICAgICBsaXMgPSBlZGl0b3JWaWV3LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hdXRvY29tcGxldGUtcGx1cyBsaScpXG4gICAgICAgIGhhc0FsdGVybmF0ZSA9IEFycmF5Ojpzb21lLmNhbGwgbGlzLCAobGkpIC0+XG4gICAgICAgICAgbGkucXVlcnlTZWxlY3Rvcignc3Bhbi53b3JkJykudGV4dENvbnRlbnQgaXMgJyRiYXNlX2NvbG9yJ1xuXG4gICAgICAgIGV4cGVjdChoYXNBbHRlcm5hdGUpLnRvQmVGYWxzeSgpXG4iXX0=
