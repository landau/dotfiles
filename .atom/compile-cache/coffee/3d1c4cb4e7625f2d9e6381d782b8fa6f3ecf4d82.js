(function() {
  var TextData, dispatch, getView, getVimState, rawKeystroke, ref, settings, withMockPlatform;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData, getView = ref.getView, withMockPlatform = ref.withMockPlatform, rawKeystroke = ref.rawKeystroke;

  settings = require('../lib/settings');

  describe("Operator modifier", function() {
    var editor, editorElement, ensure, keystroke, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], keystroke = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5];
    beforeEach(function() {
      getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
      });
      return runs(function() {
        return jasmine.attachToDOM(editorElement);
      });
    });
    return describe("operator-modifier to force wise", function() {
      beforeEach(function() {
        return set({
          text: "012345 789\nABCDEF EFG"
        });
      });
      describe("operator-modifier-characterwise", function() {
        describe("when target is linewise", function() {
          return it("operate characterwisely and exclusively", function() {
            set({
              cursor: [0, 1]
            });
            return ensure("d v j", {
              text: "0BCDEF EFG"
            });
          });
        });
        return describe("when target is characterwise", function() {
          it("operate inclusively for exclusive target", function() {
            set({
              cursor: [0, 9]
            });
            return ensure("d v b", {
              cursor: [0, 6],
              text_: "012345_\nABCDEF EFG"
            });
          });
          return it("operate exclusively for inclusive target", function() {
            set({
              cursor: [0, 0]
            });
            return ensure("d v e", {
              cursor: [0, 0],
              text: "5 789\nABCDEF EFG"
            });
          });
        });
      });
      return describe("operator-modifier-linewise", function() {
        return it("operate linewisely for characterwise target", function() {
          set({
            cursor: [0, 1]
          });
          return ensure([
            'd V /', {
              search: 'DEF'
            }
          ], {
            cursor: [0, 0],
            text: ""
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL29wZXJhdG9yLW1vZGlmaWVyLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUE2RSxPQUFBLENBQVEsZUFBUixDQUE3RSxFQUFDLDZCQUFELEVBQWMsdUJBQWQsRUFBd0IsdUJBQXhCLEVBQWtDLHFCQUFsQyxFQUEyQyx1Q0FBM0MsRUFBNkQ7O0VBQzdELFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0VBRVgsUUFBQSxDQUFTLG1CQUFULEVBQThCLFNBQUE7QUFDNUIsUUFBQTtJQUFBLE9BQTRELEVBQTVELEVBQUMsYUFBRCxFQUFNLGdCQUFOLEVBQWMsbUJBQWQsRUFBeUIsZ0JBQXpCLEVBQWlDLHVCQUFqQyxFQUFnRDtJQUVoRCxVQUFBLENBQVcsU0FBQTtNQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxHQUFSO1FBQ1YsUUFBQSxHQUFXO1FBQ1Ysd0JBQUQsRUFBUztlQUNSLGFBQUQsRUFBTSxtQkFBTixFQUFjLHlCQUFkLEVBQTJCO01BSGpCLENBQVo7YUFLQSxJQUFBLENBQUssU0FBQTtlQUNILE9BQU8sQ0FBQyxXQUFSLENBQW9CLGFBQXBCO01BREcsQ0FBTDtJQU5TLENBQVg7V0FTQSxRQUFBLENBQVMsaUNBQVQsRUFBNEMsU0FBQTtNQUMxQyxVQUFBLENBQVcsU0FBQTtlQUNULEdBQUEsQ0FDRTtVQUFBLElBQUEsRUFBTSx3QkFBTjtTQURGO01BRFMsQ0FBWDtNQU1BLFFBQUEsQ0FBUyxpQ0FBVCxFQUE0QyxTQUFBO1FBQzFDLFFBQUEsQ0FBUyx5QkFBVCxFQUFvQyxTQUFBO2lCQUNsQyxFQUFBLENBQUcseUNBQUgsRUFBOEMsU0FBQTtZQUM1QyxHQUFBLENBQUk7Y0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2FBQUo7bUJBQ0EsTUFBQSxDQUFPLE9BQVAsRUFDRTtjQUFBLElBQUEsRUFBTSxZQUFOO2FBREY7VUFGNEMsQ0FBOUM7UUFEa0MsQ0FBcEM7ZUFPQSxRQUFBLENBQVMsOEJBQVQsRUFBeUMsU0FBQTtVQUN2QyxFQUFBLENBQUcsMENBQUgsRUFBK0MsU0FBQTtZQUM3QyxHQUFBLENBQUk7Y0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2FBQUo7bUJBQ0EsTUFBQSxDQUFPLE9BQVAsRUFDRTtjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7Y0FDQSxLQUFBLEVBQU8scUJBRFA7YUFERjtVQUY2QyxDQUEvQztpQkFRQSxFQUFBLENBQUcsMENBQUgsRUFBK0MsU0FBQTtZQUM3QyxHQUFBLENBQUk7Y0FBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO2FBQUo7bUJBQ0EsTUFBQSxDQUFPLE9BQVAsRUFDRTtjQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7Y0FDQSxJQUFBLEVBQU0sbUJBRE47YUFERjtVQUY2QyxDQUEvQztRQVR1QyxDQUF6QztNQVIwQyxDQUE1QzthQXlCQSxRQUFBLENBQVMsNEJBQVQsRUFBdUMsU0FBQTtlQUNyQyxFQUFBLENBQUcsNkNBQUgsRUFBa0QsU0FBQTtVQUNoRCxHQUFBLENBQUk7WUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQUo7aUJBQ0EsTUFBQSxDQUFPO1lBQUMsT0FBRCxFQUFVO2NBQUEsTUFBQSxFQUFRLEtBQVI7YUFBVjtXQUFQLEVBQ0U7WUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1lBQ0EsSUFBQSxFQUFNLEVBRE47V0FERjtRQUZnRCxDQUFsRDtNQURxQyxDQUF2QztJQWhDMEMsQ0FBNUM7RUFaNEIsQ0FBOUI7QUFIQSIsInNvdXJjZXNDb250ZW50IjpbIntnZXRWaW1TdGF0ZSwgZGlzcGF0Y2gsIFRleHREYXRhLCBnZXRWaWV3LCB3aXRoTW9ja1BsYXRmb3JtLCByYXdLZXlzdHJva2V9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcbnNldHRpbmdzID0gcmVxdWlyZSAnLi4vbGliL3NldHRpbmdzJ1xuXG5kZXNjcmliZSBcIk9wZXJhdG9yIG1vZGlmaWVyXCIsIC0+XG4gIFtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlLCBlZGl0b3IsIGVkaXRvckVsZW1lbnQsIHZpbVN0YXRlXSA9IFtdXG5cbiAgYmVmb3JlRWFjaCAtPlxuICAgIGdldFZpbVN0YXRlIChzdGF0ZSwgdmltKSAtPlxuICAgICAgdmltU3RhdGUgPSBzdGF0ZVxuICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSB2aW1TdGF0ZVxuICAgICAge3NldCwgZW5zdXJlLCBrZXlzdHJva2V9ID0gdmltXG5cbiAgICBydW5zIC0+XG4gICAgICBqYXNtaW5lLmF0dGFjaFRvRE9NKGVkaXRvckVsZW1lbnQpXG5cbiAgZGVzY3JpYmUgXCJvcGVyYXRvci1tb2RpZmllciB0byBmb3JjZSB3aXNlXCIsIC0+XG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAwMTIzNDUgNzg5XG4gICAgICAgIEFCQ0RFRiBFRkdcbiAgICAgICAgXCJcIlwiXG4gICAgZGVzY3JpYmUgXCJvcGVyYXRvci1tb2RpZmllci1jaGFyYWN0ZXJ3aXNlXCIsIC0+XG4gICAgICBkZXNjcmliZSBcIndoZW4gdGFyZ2V0IGlzIGxpbmV3aXNlXCIsIC0+XG4gICAgICAgIGl0IFwib3BlcmF0ZSBjaGFyYWN0ZXJ3aXNlbHkgYW5kIGV4Y2x1c2l2ZWx5XCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDFdXG4gICAgICAgICAgZW5zdXJlIFwiZCB2IGpcIixcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMEJDREVGIEVGR1xuICAgICAgICAgICAgXCJcIlwiXG4gICAgICBkZXNjcmliZSBcIndoZW4gdGFyZ2V0IGlzIGNoYXJhY3Rlcndpc2VcIiwgLT5cbiAgICAgICAgaXQgXCJvcGVyYXRlIGluY2x1c2l2ZWx5IGZvciBleGNsdXNpdmUgdGFyZ2V0XCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDldXG4gICAgICAgICAgZW5zdXJlIFwiZCB2IGJcIixcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDZdXG4gICAgICAgICAgICB0ZXh0XzogXCJcIlwiXG4gICAgICAgICAgICAwMTIzNDVfXG4gICAgICAgICAgICBBQkNERUYgRUZHXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgaXQgXCJvcGVyYXRlIGV4Y2x1c2l2ZWx5IGZvciBpbmNsdXNpdmUgdGFyZ2V0XCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlIFwiZCB2IGVcIixcbiAgICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDUgNzg5XG4gICAgICAgICAgICBBQkNERUYgRUZHXG4gICAgICAgICAgICBcIlwiXCJcbiAgICBkZXNjcmliZSBcIm9wZXJhdG9yLW1vZGlmaWVyLWxpbmV3aXNlXCIsIC0+XG4gICAgICBpdCBcIm9wZXJhdGUgbGluZXdpc2VseSBmb3IgY2hhcmFjdGVyd2lzZSB0YXJnZXRcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDFdXG4gICAgICAgIGVuc3VyZSBbJ2QgViAvJywgc2VhcmNoOiAnREVGJ10sXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgICB0ZXh0OiBcIlwiXG4iXX0=
