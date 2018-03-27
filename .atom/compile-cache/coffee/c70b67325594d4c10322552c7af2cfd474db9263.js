(function() {
  var dispatch, getVimState, ref, settings;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch;

  settings = require('../lib/settings');

  describe("Operator Increase", function() {
    var editor, editorElement, ensure, keystroke, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], keystroke = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5];
    beforeEach(function() {
      return getVimState(function(state, vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = vim.set, ensure = vim.ensure, keystroke = vim.keystroke, vim;
      });
    });
    describe("the ctrl-a/ctrl-x keybindings", function() {
      beforeEach(function() {
        return set({
          textC: "|123\n|ab45\n|cd-67ef\nab-|5\n!a-bcdef"
        });
      });
      describe("increasing numbers", function() {
        describe("normal-mode", function() {
          it("increases the next number", function() {
            set({
              textC: "|     1 abc"
            });
            return ensure('ctrl-a', {
              textC: '     |2 abc'
            });
          });
          it("increases the next number and repeatable", function() {
            ensure('ctrl-a', {
              textC: "12|4\nab4|6\ncd-6|6ef\nab-|4\n!a-bcdef"
            });
            return ensure('.', {
              textC: "12|5\nab4|7\ncd-6|5ef\nab-|3\n!a-bcdef"
            });
          });
          it("support count", function() {
            return ensure('5 ctrl-a', {
              textC: "12|8\nab5|0\ncd-6|2ef\nab|0\n!a-bcdef"
            });
          });
          it("can make a negative number positive, change number of digits", function() {
            return ensure('9 9 ctrl-a', {
              textC: "22|2\nab14|4\ncd3|2ef\nab9|4\n|a-bcdef"
            });
          });
          it("does nothing when cursor is after the number", function() {
            set({
              cursor: [2, 5]
            });
            return ensure('ctrl-a', {
              textC: "123\nab45\ncd-67|ef\nab-5\na-bcdef"
            });
          });
          it("does nothing on an empty line", function() {
            set({
              textC: "|\n!"
            });
            return ensure('ctrl-a', {
              textC: "|\n!"
            });
          });
          return it("honours the vim-mode-plus.numberRegex setting", function() {
            settings.set('numberRegex', '(?:\\B-)?[0-9]+');
            set({
              textC: "|123\n|ab45\n|cd -67ef\nab-|5\n!a-bcdef"
            });
            return ensure('ctrl-a', {
              textC: "12|4\nab4|6\ncd -6|6ef\nab-|6\n!a-bcdef"
            });
          });
        });
        return describe("visual-mode", function() {
          beforeEach(function() {
            return set({
              text: "1 2 3\n1 2 3\n1 2 3\n1 2 3"
            });
          });
          it("increase number in characterwise selected range", function() {
            set({
              cursor: [0, 2]
            });
            return ensure('v 2 j ctrl-a', {
              textC: "1 |3 4\n2 3 4\n2 3 3\n1 2 3"
            });
          });
          it("increase number in characterwise selected range when multiple cursors", function() {
            set({
              textC: "1 |2 3\n1 2 3\n1 !2 3\n1 2 3"
            });
            return ensure('v 1 0 ctrl-a', {
              textC: "1 |12 3\n1 2 3\n1 !12 3\n1 2 3"
            });
          });
          it("increase number in linewise selected range", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('V 2 j ctrl-a', {
              textC: "|2 3 4\n2 3 4\n2 3 4\n1 2 3"
            });
          });
          return it("increase number in blockwise selected range", function() {
            set({
              cursor: [1, 2]
            });
            set({
              textC: "1 2 3\n1 !2 3\n1 2 3\n1 2 3"
            });
            return ensure('ctrl-v 2 l 2 j ctrl-a', {
              textC: "1 2 3\n1 !3 4\n1 3 4\n1 3 4"
            });
          });
        });
      });
      return describe("decreasing numbers", function() {
        describe("normal-mode", function() {
          it("decreases the next number and repeatable", function() {
            ensure('ctrl-x', {
              textC: "12|2\nab4|4\ncd-6|8ef\nab-|6\n!a-bcdef"
            });
            return ensure('.', {
              textC: "12|1\nab4|3\ncd-6|9ef\nab-|7\n!a-bcdef"
            });
          });
          it("support count", function() {
            return ensure('5 ctrl-x', {
              textC: "11|8\nab4|0\ncd-7|2ef\nab-1|0\n!a-bcdef"
            });
          });
          it("can make a positive number negative, change number of digits", function() {
            return ensure('9 9 ctrl-x', {
              textC: "2|4\nab-5|4\ncd-16|6ef\nab-10|4\n!a-bcdef"
            });
          });
          it("does nothing when cursor is after the number", function() {
            set({
              cursor: [2, 5]
            });
            return ensure('ctrl-x', {
              textC: "123\nab45\ncd-67|ef\nab-5\na-bcdef"
            });
          });
          it("does nothing on an empty line", function() {
            set({
              textC: "|\n!"
            });
            return ensure('ctrl-x', {
              textC: "|\n!"
            });
          });
          return it("honours the vim-mode-plus.numberRegex setting", function() {
            settings.set('numberRegex', '(?:\\B-)?[0-9]+');
            set({
              textC: "|123\n|ab45\n|cd -67ef\nab-|5\n!a-bcdef"
            });
            return ensure('ctrl-x', {
              textC: "12|2\nab4|4\ncd -6|8ef\nab-|4\n!a-bcdef"
            });
          });
        });
        return describe("visual-mode", function() {
          beforeEach(function() {
            return set({
              text: "1 2 3\n1 2 3\n1 2 3\n1 2 3"
            });
          });
          it("decrease number in characterwise selected range", function() {
            set({
              cursor: [0, 2]
            });
            return ensure('v 2 j ctrl-x', {
              textC: "1 |1 2\n0 1 2\n0 1 3\n1 2 3"
            });
          });
          it("decrease number in characterwise selected range when multiple cursors", function() {
            set({
              textC: "1 |2 3\n1 2 3\n1 !2 3\n1 2 3"
            });
            return ensure('v 5 ctrl-x', {
              textC: "1 |-3 3\n1 2 3\n1 !-3 3\n1 2 3"
            });
          });
          it("decrease number in linewise selected range", function() {
            set({
              cursor: [0, 0]
            });
            return ensure('V 2 j ctrl-x', {
              textC: "|0 1 2\n0 1 2\n0 1 2\n1 2 3"
            });
          });
          return it("decrease number in blockwise selected rage", function() {
            set({
              cursor: [1, 2]
            });
            return ensure('ctrl-v 2 l 2 j ctrl-x', {
              textC: "1 2 3\n1 !1 2\n1 1 2\n1 1 2"
            });
          });
        });
      });
    });
    return describe("the 'g ctrl-a', 'g ctrl-x' increment-number, decrement-number", function() {
      describe("increment", function() {
        beforeEach(function() {
          return set({
            text: "1 10 0\n0 7 0\n0 0 3",
            cursor: [0, 0]
          });
        });
        it("use first number as base number case-1", function() {
          set({
            text: "1 1 1",
            cursor: [0, 0]
          });
          return ensure('g ctrl-a $', {
            text: "1 2 3",
            mode: 'normal',
            cursor: [0, 0]
          });
        });
        it("use first number as base number case-2", function() {
          set({
            text: "99 1 1",
            cursor: [0, 0]
          });
          return ensure('g ctrl-a $', {
            text: "99 100 101",
            mode: 'normal',
            cursor: [0, 0]
          });
        });
        it("can take count, and used as step to each increment", function() {
          set({
            text: "5 0 0",
            cursor: [0, 0]
          });
          return ensure('5 g ctrl-a $', {
            text: "5 10 15",
            mode: 'normal',
            cursor: [0, 0]
          });
        });
        it("only increment number in target range", function() {
          set({
            cursor: [1, 2]
          });
          return ensure('g ctrl-a j', {
            text: "1 10 0\n0 1 2\n3 4 5",
            mode: 'normal'
          });
        });
        it("works in characterwise visual-mode", function() {
          set({
            cursor: [1, 2]
          });
          return ensure('v j g ctrl-a', {
            text: "1 10 0\n0 7 8\n9 10 3",
            mode: 'normal'
          });
        });
        it("works in blockwise visual-mode", function() {
          set({
            cursor: [0, 2]
          });
          return ensure('ctrl-v 2 j $ g ctrl-a', {
            textC: "1 !10 11\n0 12 13\n0 14 15",
            mode: 'normal'
          });
        });
        return describe("point when finished and repeatable", function() {
          beforeEach(function() {
            set({
              text: "1 0 0 0 0",
              cursor: [0, 0]
            });
            return ensure("v $", {
              selectedText: '1 0 0 0 0'
            });
          });
          it("put cursor on start position when finished and repeatable (case: selection is not reversed)", function() {
            ensure({
              selectionIsReversed: false
            });
            ensure('g ctrl-a', {
              text: "1 2 3 4 5",
              cursor: [0, 0],
              mode: 'normal'
            });
            return ensure('.', {
              text: "6 7 8 9 10",
              cursor: [0, 0]
            });
          });
          return it("put cursor on start position when finished and repeatable (case: selection is reversed)", function() {
            ensure('o', {
              selectionIsReversed: true
            });
            ensure('g ctrl-a', {
              text: "1 2 3 4 5",
              cursor: [0, 0],
              mode: 'normal'
            });
            return ensure('.', {
              text: "6 7 8 9 10",
              cursor: [0, 0]
            });
          });
        });
      });
      return describe("decrement", function() {
        beforeEach(function() {
          return set({
            text: "14 23 13\n10 20 13\n13 13 16",
            cursor: [0, 0]
          });
        });
        it("use first number as base number case-1", function() {
          set({
            text: "10 1 1"
          });
          return ensure('g ctrl-x $', {
            text: "10 9 8",
            mode: 'normal',
            cursor: [0, 0]
          });
        });
        it("use first number as base number case-2", function() {
          set({
            text: "99 1 1"
          });
          return ensure('g ctrl-x $', {
            text: "99 98 97",
            mode: 'normal',
            cursor: [0, 0]
          });
        });
        it("can take count, and used as step to each increment", function() {
          set({
            text: "5 0 0",
            cursor: [0, 0]
          });
          return ensure('5 g ctrl-x $', {
            text: "5 0 -5",
            mode: 'normal',
            cursor: [0, 0]
          });
        });
        it("only decrement number in target range", function() {
          set({
            cursor: [1, 3]
          });
          return ensure('g ctrl-x j', {
            text: "14 23 13\n10 9 8\n7 6 5",
            mode: 'normal'
          });
        });
        it("works in characterwise visual-mode", function() {
          set({
            cursor: [1, 3]
          });
          return ensure('v j l g ctrl-x', {
            text: "14 23 13\n10 20 19\n18 17 16",
            mode: 'normal'
          });
        });
        return it("works in blockwise visual-mode", function() {
          set({
            cursor: [0, 3]
          });
          return ensure('ctrl-v 2 j l g ctrl-x', {
            text: "14 23 13\n10 22 13\n13 21 16",
            mode: 'normal'
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL29wZXJhdG9yLWluY3JlYXNlLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUEwQixPQUFBLENBQVEsZUFBUixDQUExQixFQUFDLDZCQUFELEVBQWM7O0VBQ2QsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUjs7RUFFWCxRQUFBLENBQVMsbUJBQVQsRUFBOEIsU0FBQTtBQUM1QixRQUFBO0lBQUEsT0FBNEQsRUFBNUQsRUFBQyxhQUFELEVBQU0sZ0JBQU4sRUFBYyxtQkFBZCxFQUF5QixnQkFBekIsRUFBaUMsdUJBQWpDLEVBQWdEO0lBRWhELFVBQUEsQ0FBVyxTQUFBO2FBQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLEdBQVI7UUFDVixRQUFBLEdBQVc7UUFDVix3QkFBRCxFQUFTO2VBQ1IsYUFBRCxFQUFNLG1CQUFOLEVBQWMseUJBQWQsRUFBMkI7TUFIakIsQ0FBWjtJQURTLENBQVg7SUFNQSxRQUFBLENBQVMsK0JBQVQsRUFBMEMsU0FBQTtNQUN4QyxVQUFBLENBQVcsU0FBQTtlQUNULEdBQUEsQ0FDRTtVQUFBLEtBQUEsRUFBTyx3Q0FBUDtTQURGO01BRFMsQ0FBWDtNQVVBLFFBQUEsQ0FBUyxvQkFBVCxFQUErQixTQUFBO1FBQzdCLFFBQUEsQ0FBUyxhQUFULEVBQXdCLFNBQUE7VUFDdEIsRUFBQSxDQUFHLDJCQUFILEVBQWdDLFNBQUE7WUFDOUIsR0FBQSxDQUFJO2NBQUEsS0FBQSxFQUFPLGFBQVA7YUFBSjttQkFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtjQUFBLEtBQUEsRUFBTyxhQUFQO2FBQWpCO1VBRjhCLENBQWhDO1VBSUEsRUFBQSxDQUFHLDBDQUFILEVBQStDLFNBQUE7WUFDN0MsTUFBQSxDQUFPLFFBQVAsRUFDRTtjQUFBLEtBQUEsRUFB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QUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7V0FBSjtpQkFDQSxNQUFBLENBQU8sWUFBUCxFQUNFO1lBQUEsSUFBQSxFQUFNLHlCQUFOO1lBS0EsSUFBQSxFQUFNLFFBTE47V0FERjtRQUYwQyxDQUE1QztRQVNBLEVBQUEsQ0FBRyxvQ0FBSCxFQUF5QyxTQUFBO1VBQ3ZDLEdBQUEsQ0FBSTtZQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7V0FBSjtpQkFDQSxNQUFBLENBQU8sZ0JBQVAsRUFDRTtZQUFBLElBQUEsRUFBTSw4QkFBTjtZQUtBLElBQUEsRUFBTSxRQUxOO1dBREY7UUFGdUMsQ0FBekM7ZUFTQSxFQUFBLENBQUcsZ0NBQUgsRUFBcUMsU0FBQTtVQUNuQyxHQUFBLENBQUk7WUFBQSxNQUFBLEVBQVEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFSO1dBQUo7aUJBQ0EsTUFBQSxDQUFPLHVCQUFQLEVBQ0U7WUFBQSxJQUFBLEVBQU0sOEJBQU47WUFLQSxJQUFBLEVBQU0sUUFMTjtXQURGO1FBRm1DLENBQXJDO01BcENvQixDQUF0QjtJQTFEd0UsQ0FBMUU7RUEvUzRCLENBQTlCO0FBSEEiLCJzb3VyY2VzQ29udGVudCI6WyJ7Z2V0VmltU3RhdGUsIGRpc3BhdGNofSA9IHJlcXVpcmUgJy4vc3BlYy1oZWxwZXInXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4uL2xpYi9zZXR0aW5ncydcblxuZGVzY3JpYmUgXCJPcGVyYXRvciBJbmNyZWFzZVwiLCAtPlxuICBbc2V0LCBlbnN1cmUsIGtleXN0cm9rZSwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBnZXRWaW1TdGF0ZSAoc3RhdGUsIHZpbSkgLT5cbiAgICAgIHZpbVN0YXRlID0gc3RhdGVcbiAgICAgIHtlZGl0b3IsIGVkaXRvckVsZW1lbnR9ID0gdmltU3RhdGVcbiAgICAgIHtzZXQsIGVuc3VyZSwga2V5c3Ryb2tlfSA9IHZpbVxuXG4gIGRlc2NyaWJlIFwidGhlIGN0cmwtYS9jdHJsLXgga2V5YmluZGluZ3NcIiwgLT5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBzZXRcbiAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICB8MTIzXG4gICAgICAgIHxhYjQ1XG4gICAgICAgIHxjZC02N2VmXG4gICAgICAgIGFiLXw1XG4gICAgICAgICFhLWJjZGVmXG4gICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJpbmNyZWFzaW5nIG51bWJlcnNcIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwibm9ybWFsLW1vZGVcIiwgLT5cbiAgICAgICAgaXQgXCJpbmNyZWFzZXMgdGhlIG5leHQgbnVtYmVyXCIsIC0+XG4gICAgICAgICAgc2V0IHRleHRDOiBcInwgICAgIDEgYWJjXCJcbiAgICAgICAgICBlbnN1cmUgJ2N0cmwtYScsIHRleHRDOiAnICAgICB8MiBhYmMnXG5cbiAgICAgICAgaXQgXCJpbmNyZWFzZXMgdGhlIG5leHQgbnVtYmVyIGFuZCByZXBlYXRhYmxlXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICdjdHJsLWEnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgMTJ8NFxuICAgICAgICAgICAgYWI0fDZcbiAgICAgICAgICAgIGNkLTZ8NmVmXG4gICAgICAgICAgICBhYi18NFxuICAgICAgICAgICAgIWEtYmNkZWZcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgICAgZW5zdXJlICcuJyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIDEyfDVcbiAgICAgICAgICAgIGFiNHw3XG4gICAgICAgICAgICBjZC02fDVlZlxuICAgICAgICAgICAgYWItfDNcbiAgICAgICAgICAgICFhLWJjZGVmXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBpdCBcInN1cHBvcnQgY291bnRcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJzUgY3RybC1hJyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIDEyfDhcbiAgICAgICAgICAgIGFiNXwwXG4gICAgICAgICAgICBjZC02fDJlZlxuICAgICAgICAgICAgYWJ8MFxuICAgICAgICAgICAgIWEtYmNkZWZcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGl0IFwiY2FuIG1ha2UgYSBuZWdhdGl2ZSBudW1iZXIgcG9zaXRpdmUsIGNoYW5nZSBudW1iZXIgb2YgZGlnaXRzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICc5IDkgY3RybC1hJyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIDIyfDJcbiAgICAgICAgICAgIGFiMTR8NFxuICAgICAgICAgICAgY2QzfDJlZlxuICAgICAgICAgICAgYWI5fDRcbiAgICAgICAgICAgIHxhLWJjZGVmXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBpdCBcImRvZXMgbm90aGluZyB3aGVuIGN1cnNvciBpcyBhZnRlciB0aGUgbnVtYmVyXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzIsIDVdXG4gICAgICAgICAgZW5zdXJlICdjdHJsLWEnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgMTIzXG4gICAgICAgICAgICBhYjQ1XG4gICAgICAgICAgICBjZC02N3xlZlxuICAgICAgICAgICAgYWItNVxuICAgICAgICAgICAgYS1iY2RlZlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgaXQgXCJkb2VzIG5vdGhpbmcgb24gYW4gZW1wdHkgbGluZVwiLCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgfFxuICAgICAgICAgICAgIVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlICdjdHJsLWEnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgfFxuICAgICAgICAgICAgIVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgaXQgXCJob25vdXJzIHRoZSB2aW0tbW9kZS1wbHVzLm51bWJlclJlZ2V4IHNldHRpbmdcIiwgLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQoJ251bWJlclJlZ2V4JywgJyg/OlxcXFxCLSk/WzAtOV0rJylcbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHRDOlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgfDEyM1xuICAgICAgICAgICAgICB8YWI0NVxuICAgICAgICAgICAgICB8Y2QgLTY3ZWZcbiAgICAgICAgICAgICAgYWItfDVcbiAgICAgICAgICAgICAgIWEtYmNkZWZcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlICdjdHJsLWEnLFxuICAgICAgICAgICAgdGV4dEM6XG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgICAgICAxMnw0XG4gICAgICAgICAgICAgIGFiNHw2XG4gICAgICAgICAgICAgIGNkIC02fDZlZlxuICAgICAgICAgICAgICBhYi18NlxuICAgICAgICAgICAgICAhYS1iY2RlZlxuICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgIGRlc2NyaWJlIFwidmlzdWFsLW1vZGVcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIDEgMiAzXG4gICAgICAgICAgICAgIDEgMiAzXG4gICAgICAgICAgICAgIDEgMiAzXG4gICAgICAgICAgICAgIDEgMiAzXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCBcImluY3JlYXNlIG51bWJlciBpbiBjaGFyYWN0ZXJ3aXNlIHNlbGVjdGVkIHJhbmdlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDJdXG4gICAgICAgICAgZW5zdXJlICd2IDIgaiBjdHJsLWEnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICAxIHwzIDRcbiAgICAgICAgICAgICAgMiAzIDRcbiAgICAgICAgICAgICAgMiAzIDNcbiAgICAgICAgICAgICAgMSAyIDNcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0IFwiaW5jcmVhc2UgbnVtYmVyIGluIGNoYXJhY3Rlcndpc2Ugc2VsZWN0ZWQgcmFuZ2Ugd2hlbiBtdWx0aXBsZSBjdXJzb3JzXCIsIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIDEgfDIgM1xuICAgICAgICAgICAgICAxIDIgM1xuICAgICAgICAgICAgICAxICEyIDNcbiAgICAgICAgICAgICAgMSAyIDNcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlICd2IDEgMCBjdHJsLWEnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICAxIHwxMiAzXG4gICAgICAgICAgICAgIDEgMiAzXG4gICAgICAgICAgICAgIDEgITEyIDNcbiAgICAgICAgICAgICAgMSAyIDNcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0IFwiaW5jcmVhc2UgbnVtYmVyIGluIGxpbmV3aXNlIHNlbGVjdGVkIHJhbmdlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICdWIDIgaiBjdHJsLWEnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICB8MiAzIDRcbiAgICAgICAgICAgICAgMiAzIDRcbiAgICAgICAgICAgICAgMiAzIDRcbiAgICAgICAgICAgICAgMSAyIDNcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0IFwiaW5jcmVhc2UgbnVtYmVyIGluIGJsb2Nrd2lzZSBzZWxlY3RlZCByYW5nZVwiLCAtPlxuICAgICAgICAgIHNldCBjdXJzb3I6IFsxLCAyXVxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICAxIDIgM1xuICAgICAgICAgICAgICAxICEyIDNcbiAgICAgICAgICAgICAgMSAyIDNcbiAgICAgICAgICAgICAgMSAyIDNcbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICBlbnN1cmUgJ2N0cmwtdiAyIGwgMiBqIGN0cmwtYScsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIDEgMiAzXG4gICAgICAgICAgICAgIDEgITMgNFxuICAgICAgICAgICAgICAxIDMgNFxuICAgICAgICAgICAgICAxIDMgNFxuICAgICAgICAgICAgICBcIlwiXCJcblxuICAgIGRlc2NyaWJlIFwiZGVjcmVhc2luZyBudW1iZXJzXCIsIC0+XG4gICAgICBkZXNjcmliZSBcIm5vcm1hbC1tb2RlXCIsIC0+XG4gICAgICAgIGl0IFwiZGVjcmVhc2VzIHRoZSBuZXh0IG51bWJlciBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICAgIGVuc3VyZSAnY3RybC14JyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIDEyfDJcbiAgICAgICAgICAgIGFiNHw0XG4gICAgICAgICAgICBjZC02fDhlZlxuICAgICAgICAgICAgYWItfDZcbiAgICAgICAgICAgICFhLWJjZGVmXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICAgIGVuc3VyZSAnLicsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAxMnwxXG4gICAgICAgICAgICBhYjR8M1xuICAgICAgICAgICAgY2QtNnw5ZWZcbiAgICAgICAgICAgIGFiLXw3XG4gICAgICAgICAgICAhYS1iY2RlZlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgaXQgXCJzdXBwb3J0IGNvdW50XCIsIC0+XG4gICAgICAgICAgZW5zdXJlICc1IGN0cmwteCcsXG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAxMXw4XG4gICAgICAgICAgICBhYjR8MFxuICAgICAgICAgICAgY2QtN3wyZWZcbiAgICAgICAgICAgIGFiLTF8MFxuICAgICAgICAgICAgIWEtYmNkZWZcbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGl0IFwiY2FuIG1ha2UgYSBwb3NpdGl2ZSBudW1iZXIgbmVnYXRpdmUsIGNoYW5nZSBudW1iZXIgb2YgZGlnaXRzXCIsIC0+XG4gICAgICAgICAgZW5zdXJlICc5IDkgY3RybC14JyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIDJ8NFxuICAgICAgICAgICAgYWItNXw0XG4gICAgICAgICAgICBjZC0xNnw2ZWZcbiAgICAgICAgICAgIGFiLTEwfDRcbiAgICAgICAgICAgICFhLWJjZGVmXG4gICAgICAgICAgICBcIlwiXCJcblxuICAgICAgICBpdCBcImRvZXMgbm90aGluZyB3aGVuIGN1cnNvciBpcyBhZnRlciB0aGUgbnVtYmVyXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzIsIDVdXG4gICAgICAgICAgZW5zdXJlICdjdHJsLXgnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgMTIzXG4gICAgICAgICAgICBhYjQ1XG4gICAgICAgICAgICBjZC02N3xlZlxuICAgICAgICAgICAgYWItNVxuICAgICAgICAgICAgYS1iY2RlZlxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgaXQgXCJkb2VzIG5vdGhpbmcgb24gYW4gZW1wdHkgbGluZVwiLCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgfFxuICAgICAgICAgICAgIVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlICdjdHJsLXgnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgfFxuICAgICAgICAgICAgIVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgaXQgXCJob25vdXJzIHRoZSB2aW0tbW9kZS1wbHVzLm51bWJlclJlZ2V4IHNldHRpbmdcIiwgLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQoJ251bWJlclJlZ2V4JywgJyg/OlxcXFxCLSk/WzAtOV0rJylcbiAgICAgICAgICBzZXRcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIHwxMjNcbiAgICAgICAgICAgIHxhYjQ1XG4gICAgICAgICAgICB8Y2QgLTY3ZWZcbiAgICAgICAgICAgIGFiLXw1XG4gICAgICAgICAgICAhYS1iY2RlZlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlICdjdHJsLXgnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgMTJ8MlxuICAgICAgICAgICAgYWI0fDRcbiAgICAgICAgICAgIGNkIC02fDhlZlxuICAgICAgICAgICAgYWItfDRcbiAgICAgICAgICAgICFhLWJjZGVmXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgIGRlc2NyaWJlIFwidmlzdWFsLW1vZGVcIiwgLT5cbiAgICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICAgIHNldFxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAgIDEgMiAzXG4gICAgICAgICAgICAgIDEgMiAzXG4gICAgICAgICAgICAgIDEgMiAzXG4gICAgICAgICAgICAgIDEgMiAzXG4gICAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBpdCBcImRlY3JlYXNlIG51bWJlciBpbiBjaGFyYWN0ZXJ3aXNlIHNlbGVjdGVkIHJhbmdlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDJdXG4gICAgICAgICAgZW5zdXJlICd2IDIgaiBjdHJsLXgnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICAxIHwxIDJcbiAgICAgICAgICAgICAgMCAxIDJcbiAgICAgICAgICAgICAgMCAxIDNcbiAgICAgICAgICAgICAgMSAyIDNcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0IFwiZGVjcmVhc2UgbnVtYmVyIGluIGNoYXJhY3Rlcndpc2Ugc2VsZWN0ZWQgcmFuZ2Ugd2hlbiBtdWx0aXBsZSBjdXJzb3JzXCIsIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAgIDEgfDIgM1xuICAgICAgICAgICAgICAxIDIgM1xuICAgICAgICAgICAgICAxICEyIDNcbiAgICAgICAgICAgICAgMSAyIDNcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgZW5zdXJlICd2IDUgY3RybC14JyxcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgICAgMSB8LTMgM1xuICAgICAgICAgICAgICAxIDIgM1xuICAgICAgICAgICAgICAxICEtMyAzXG4gICAgICAgICAgICAgIDEgMiAzXG4gICAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgICAgIGl0IFwiZGVjcmVhc2UgbnVtYmVyIGluIGxpbmV3aXNlIHNlbGVjdGVkIHJhbmdlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlICdWIDIgaiBjdHJsLXgnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICB8MCAxIDJcbiAgICAgICAgICAgICAgMCAxIDJcbiAgICAgICAgICAgICAgMCAxIDJcbiAgICAgICAgICAgICAgMSAyIDNcbiAgICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGl0IFwiZGVjcmVhc2UgbnVtYmVyIGluIGJsb2Nrd2lzZSBzZWxlY3RlZCByYWdlXCIsIC0+XG4gICAgICAgICAgc2V0IGN1cnNvcjogWzEsIDJdXG4gICAgICAgICAgZW5zdXJlICdjdHJsLXYgMiBsIDIgaiBjdHJsLXgnLFxuICAgICAgICAgICAgdGV4dEM6IFwiXCJcIlxuICAgICAgICAgICAgICAxIDIgM1xuICAgICAgICAgICAgICAxICExIDJcbiAgICAgICAgICAgICAgMSAxIDJcbiAgICAgICAgICAgICAgMSAxIDJcbiAgICAgICAgICAgICAgXCJcIlwiXG5cbiAgZGVzY3JpYmUgXCJ0aGUgJ2cgY3RybC1hJywgJ2cgY3RybC14JyBpbmNyZW1lbnQtbnVtYmVyLCBkZWNyZW1lbnQtbnVtYmVyXCIsIC0+XG4gICAgZGVzY3JpYmUgXCJpbmNyZW1lbnRcIiwgLT5cbiAgICAgIGJlZm9yZUVhY2ggLT5cbiAgICAgICAgc2V0XG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAxIDEwIDBcbiAgICAgICAgICAgIDAgNyAwXG4gICAgICAgICAgICAwIDAgM1xuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGl0IFwidXNlIGZpcnN0IG51bWJlciBhcyBiYXNlIG51bWJlciBjYXNlLTFcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiMSAxIDFcIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICdnIGN0cmwtYSAkJywgdGV4dDogXCIxIDIgM1wiLCBtb2RlOiAnbm9ybWFsJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGl0IFwidXNlIGZpcnN0IG51bWJlciBhcyBiYXNlIG51bWJlciBjYXNlLTJcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiOTkgMSAxXCIsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIGVuc3VyZSAnZyBjdHJsLWEgJCcsIHRleHQ6IFwiOTkgMTAwIDEwMVwiLCBtb2RlOiAnbm9ybWFsJywgY3Vyc29yOiBbMCwgMF1cbiAgICAgIGl0IFwiY2FuIHRha2UgY291bnQsIGFuZCB1c2VkIGFzIHN0ZXAgdG8gZWFjaCBpbmNyZW1lbnRcIiwgLT5cbiAgICAgICAgc2V0IHRleHQ6IFwiNSAwIDBcIiwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgZW5zdXJlICc1IGcgY3RybC1hICQnLCB0ZXh0OiBcIjUgMTAgMTVcIiwgbW9kZTogJ25vcm1hbCcsIGN1cnNvcjogWzAsIDBdXG4gICAgICBpdCBcIm9ubHkgaW5jcmVtZW50IG51bWJlciBpbiB0YXJnZXQgcmFuZ2VcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDJdXG4gICAgICAgIGVuc3VyZSAnZyBjdHJsLWEgaicsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAxIDEwIDBcbiAgICAgICAgICAgIDAgMSAyXG4gICAgICAgICAgICAzIDQgNVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgIGl0IFwid29ya3MgaW4gY2hhcmFjdGVyd2lzZSB2aXN1YWwtbW9kZVwiLCAtPlxuICAgICAgICBzZXQgY3Vyc29yOiBbMSwgMl1cbiAgICAgICAgZW5zdXJlICd2IGogZyBjdHJsLWEnLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMSAxMCAwXG4gICAgICAgICAgICAwIDcgOFxuICAgICAgICAgICAgOSAxMCAzXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuICAgICAgaXQgXCJ3b3JrcyBpbiBibG9ja3dpc2UgdmlzdWFsLW1vZGVcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzAsIDJdXG4gICAgICAgIGVuc3VyZSAnY3RybC12IDIgaiAkIGcgY3RybC1hJyxcbiAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICAxICExMCAxMVxuICAgICAgICAgICAgMCAxMiAxM1xuICAgICAgICAgICAgMCAxNCAxNVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgIGRlc2NyaWJlIFwicG9pbnQgd2hlbiBmaW5pc2hlZCBhbmQgcmVwZWF0YWJsZVwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0IHRleHQ6IFwiMSAwIDAgMCAwXCIsIGN1cnNvcjogWzAsIDBdXG4gICAgICAgICAgZW5zdXJlIFwidiAkXCIsIHNlbGVjdGVkVGV4dDogJzEgMCAwIDAgMCdcbiAgICAgICAgaXQgXCJwdXQgY3Vyc29yIG9uIHN0YXJ0IHBvc2l0aW9uIHdoZW4gZmluaXNoZWQgYW5kIHJlcGVhdGFibGUgKGNhc2U6IHNlbGVjdGlvbiBpcyBub3QgcmV2ZXJzZWQpXCIsIC0+XG4gICAgICAgICAgZW5zdXJlIHNlbGVjdGlvbklzUmV2ZXJzZWQ6IGZhbHNlXG4gICAgICAgICAgZW5zdXJlICdnIGN0cmwtYScsIHRleHQ6IFwiMSAyIDMgNCA1XCIsIGN1cnNvcjogWzAsIDBdLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIGVuc3VyZSAnLicsIHRleHQ6IFwiNiA3IDggOSAxMFwiICwgY3Vyc29yOiBbMCwgMF1cbiAgICAgICAgaXQgXCJwdXQgY3Vyc29yIG9uIHN0YXJ0IHBvc2l0aW9uIHdoZW4gZmluaXNoZWQgYW5kIHJlcGVhdGFibGUgKGNhc2U6IHNlbGVjdGlvbiBpcyByZXZlcnNlZClcIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ28nLCBzZWxlY3Rpb25Jc1JldmVyc2VkOiB0cnVlXG4gICAgICAgICAgZW5zdXJlICdnIGN0cmwtYScsIHRleHQ6IFwiMSAyIDMgNCA1XCIsIGN1cnNvcjogWzAsIDBdLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIGVuc3VyZSAnLicsIHRleHQ6IFwiNiA3IDggOSAxMFwiICwgY3Vyc29yOiBbMCwgMF1cbiAgICBkZXNjcmliZSBcImRlY3JlbWVudFwiLCAtPlxuICAgICAgYmVmb3JlRWFjaCAtPlxuICAgICAgICBzZXRcbiAgICAgICAgICB0ZXh0OiBcIlwiXCJcbiAgICAgICAgICAgIDE0IDIzIDEzXG4gICAgICAgICAgICAxMCAyMCAxM1xuICAgICAgICAgICAgMTMgMTMgMTZcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICBpdCBcInVzZSBmaXJzdCBudW1iZXIgYXMgYmFzZSBudW1iZXIgY2FzZS0xXCIsIC0+XG4gICAgICAgIHNldCB0ZXh0OiBcIjEwIDEgMVwiXG4gICAgICAgIGVuc3VyZSAnZyBjdHJsLXggJCcsIHRleHQ6IFwiMTAgOSA4XCIsIG1vZGU6ICdub3JtYWwnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCJ1c2UgZmlyc3QgbnVtYmVyIGFzIGJhc2UgbnVtYmVyIGNhc2UtMlwiLCAtPlxuICAgICAgICBzZXQgdGV4dDogXCI5OSAxIDFcIlxuICAgICAgICBlbnN1cmUgJ2cgY3RybC14ICQnLCB0ZXh0OiBcIjk5IDk4IDk3XCIsIG1vZGU6ICdub3JtYWwnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCJjYW4gdGFrZSBjb3VudCwgYW5kIHVzZWQgYXMgc3RlcCB0byBlYWNoIGluY3JlbWVudFwiLCAtPlxuICAgICAgICBzZXQgdGV4dDogXCI1IDAgMFwiLCBjdXJzb3I6IFswLCAwXVxuICAgICAgICBlbnN1cmUgJzUgZyBjdHJsLXggJCcsIHRleHQ6IFwiNSAwIC01XCIsIG1vZGU6ICdub3JtYWwnLCBjdXJzb3I6IFswLCAwXVxuICAgICAgaXQgXCJvbmx5IGRlY3JlbWVudCBudW1iZXIgaW4gdGFyZ2V0IHJhbmdlXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFsxLCAzXVxuICAgICAgICBlbnN1cmUgJ2cgY3RybC14IGonLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMTQgMjMgMTNcbiAgICAgICAgICAgIDEwIDkgOFxuICAgICAgICAgICAgNyA2IDVcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICAgIG1vZGU6ICdub3JtYWwnXG4gICAgICBpdCBcIndvcmtzIGluIGNoYXJhY3Rlcndpc2UgdmlzdWFsLW1vZGVcIiwgLT5cbiAgICAgICAgc2V0IGN1cnNvcjogWzEsIDNdXG4gICAgICAgIGVuc3VyZSAndiBqIGwgZyBjdHJsLXgnLFxuICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgMTQgMjMgMTNcbiAgICAgICAgICAgIDEwIDIwIDE5XG4gICAgICAgICAgICAxOCAxNyAxNlxuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgICAgbW9kZTogJ25vcm1hbCdcbiAgICAgIGl0IFwid29ya3MgaW4gYmxvY2t3aXNlIHZpc3VhbC1tb2RlXCIsIC0+XG4gICAgICAgIHNldCBjdXJzb3I6IFswLCAzXVxuICAgICAgICBlbnN1cmUgJ2N0cmwtdiAyIGogbCBnIGN0cmwteCcsXG4gICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAxNCAyMyAxM1xuICAgICAgICAgICAgMTAgMjIgMTNcbiAgICAgICAgICAgIDEzIDIxIDE2XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBtb2RlOiAnbm9ybWFsJ1xuIl19
