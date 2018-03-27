(function() {
  var TextData, dispatch, getView, getVimState, ref, settings,
    slice = [].slice;

  ref = require('./spec-helper'), getVimState = ref.getVimState, dispatch = ref.dispatch, TextData = ref.TextData, getView = ref.getView;

  settings = require('../lib/settings');

  describe("Persistent Selection", function() {
    var editor, editorElement, ensure, keystroke, ref1, set, vimState;
    ref1 = [], set = ref1[0], ensure = ref1[1], keystroke = ref1[2], editor = ref1[3], editorElement = ref1[4], vimState = ref1[5];
    beforeEach(function() {
      getVimState(function(state, _vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = _vim.set, ensure = _vim.ensure, keystroke = _vim.keystroke, _vim;
      });
      return runs(function() {
        return jasmine.attachToDOM(editorElement);
      });
    });
    return describe("CreatePersistentSelection operator", function() {
      var ensurePersistentSelection, textForMarker;
      textForMarker = function(marker) {
        return editor.getTextInBufferRange(marker.getBufferRange());
      };
      ensurePersistentSelection = function() {
        var _keystroke, args, markers, options, text;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        switch (args.length) {
          case 1:
            options = args[0];
            break;
          case 2:
            _keystroke = args[0], options = args[1];
        }
        if (_keystroke != null) {
          keystroke(_keystroke);
        }
        markers = vimState.persistentSelection.getMarkers();
        if (options.length != null) {
          expect(markers).toHaveLength(options.length);
        }
        if (options.text != null) {
          text = markers.map(function(marker) {
            return textForMarker(marker);
          });
          expect(text).toEqual(options.text);
        }
        if (options.mode != null) {
          return ensure({
            mode: options.mode
          });
        }
      };
      beforeEach(function() {
        atom.keymaps.add("test", {
          'atom-text-editor.vim-mode-plus:not(.insert-mode)': {
            'g m': 'vim-mode-plus:create-persistent-selection'
          }
        });
        set({
          text: "ooo xxx ooo\nxxx ooo xxx\n\nooo xxx ooo\nxxx ooo xxx\n\nooo xxx ooo\nxxx ooo xxx\n",
          cursor: [0, 0]
        });
        return expect(vimState.persistentSelection.hasMarkers()).toBe(false);
      });
      describe("basic behavior", function() {
        describe("create-persistent-selection", function() {
          it("create-persistent-selection", function() {
            ensurePersistentSelection('g m i w', {
              length: 1,
              text: ['ooo']
            });
            return ensurePersistentSelection('j .', {
              length: 2,
              text: ['ooo', 'xxx']
            });
          });
          return it("create-persistent-selection forr current selection and repeatable by .", function() {
            ensurePersistentSelection('v enter', {
              length: 1,
              text: ['o']
            });
            return ensurePersistentSelection('j .', {
              length: 2,
              text: ['o', 'x']
            });
          });
        });
        return describe("[No behavior diff currently] inner-persistent-selection and a-persistent-selection", function() {
          return it("apply operator to across all persistent-selections", function() {
            ensurePersistentSelection('g m i w j . 2 j g m i p', {
              length: 3,
              text: ['ooo', 'xxx', "ooo xxx ooo\nxxx ooo xxx\n"]
            });
            return ensure('g U a r', {
              text: "OOO xxx ooo\nXXX ooo xxx\n\nOOO XXX OOO\nXXX OOO XXX\n\nooo xxx ooo\nxxx ooo xxx\n"
            });
          });
        });
      });
      describe("practical scenario", function() {
        return describe("persistent-selection is treated in same way as real selection", function() {
          beforeEach(function() {
            set({
              textC: "|0 ==========\n1 ==========\n2 ==========\n3 ==========\n4 ==========\n5 =========="
            });
            ensurePersistentSelection('V j enter', {
              text: ['0 ==========\n1 ==========\n']
            });
            return ensure('2 j V j', {
              selectedText: ['3 ==========\n4 ==========\n'],
              mode: ['visual', 'linewise']
            });
          });
          it("I in vL-mode with persistent-selection", function() {
            return ensure('I', {
              mode: 'insert',
              textC: "|0 ==========\n|1 ==========\n2 ==========\n|3 ==========\n|4 ==========\n5 =========="
            });
          });
          return it("A in vL-mode with persistent-selection", function() {
            return ensure('A', {
              mode: 'insert',
              textC: "0 ==========|\n1 ==========|\n2 ==========\n3 ==========|\n4 ==========|\n5 =========="
            });
          });
        });
      });
      describe("select-occurrence-in-a-persistent-selection", function() {
        return it("select all instance of cursor word only within marked range", function() {
          runs(function() {
            var paragraphText;
            paragraphText = "ooo xxx ooo\nxxx ooo xxx\n";
            return ensurePersistentSelection('g m i p } } j .', {
              length: 2,
              text: [paragraphText, paragraphText]
            });
          });
          return runs(function() {
            ensure('g cmd-d', {
              selectedText: ['ooo', 'ooo', 'ooo', 'ooo', 'ooo', 'ooo']
            });
            keystroke('c');
            editor.insertText('!!!');
            return ensure({
              text: "!!! xxx !!!\nxxx !!! xxx\n\nooo xxx ooo\nxxx ooo xxx\n\n!!! xxx !!!\nxxx !!! xxx\n"
            });
          });
        });
      });
      describe("clear-persistent-selections command", function() {
        return it("clear persistentSelections", function() {
          ensurePersistentSelection('g m i w', {
            length: 1,
            text: ['ooo']
          });
          dispatch(editorElement, 'vim-mode-plus:clear-persistent-selections');
          return expect(vimState.persistentSelection.hasMarkers()).toBe(false);
        });
      });
      return describe("clearPersistentSelectionOnResetNormalMode", function() {
        describe("when disabled", function() {
          return it("it won't clear persistentSelection", function() {
            settings.set('clearPersistentSelectionOnResetNormalMode', false);
            ensurePersistentSelection('g m i w', {
              length: 1,
              text: ['ooo']
            });
            ensure("escape", {
              mode: 'normal'
            });
            return ensurePersistentSelection({
              length: 1,
              text: ['ooo']
            });
          });
        });
        return describe("when enabled", function() {
          return it("it clear persistentSelection on reset-normal-mode", function() {
            settings.set('clearPersistentSelectionOnResetNormalMode', true);
            ensurePersistentSelection('g m i w', {
              length: 1,
              text: ['ooo']
            });
            ensure("escape", {
              mode: 'normal'
            });
            return expect(vimState.persistentSelection.hasMarkers()).toBe(false);
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL3BlcnNpc3RlbnQtc2VsZWN0aW9uLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx1REFBQTtJQUFBOztFQUFBLE1BQTZDLE9BQUEsQ0FBUSxlQUFSLENBQTdDLEVBQUMsNkJBQUQsRUFBYyx1QkFBZCxFQUF3Qix1QkFBeEIsRUFBa0M7O0VBQ2xDLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0VBRVgsUUFBQSxDQUFTLHNCQUFULEVBQWlDLFNBQUE7QUFDL0IsUUFBQTtJQUFBLE9BQTRELEVBQTVELEVBQUMsYUFBRCxFQUFNLGdCQUFOLEVBQWMsbUJBQWQsRUFBeUIsZ0JBQXpCLEVBQWlDLHVCQUFqQyxFQUFnRDtJQUVoRCxVQUFBLENBQVcsU0FBQTtNQUNULFdBQUEsQ0FBWSxTQUFDLEtBQUQsRUFBUSxJQUFSO1FBQ1YsUUFBQSxHQUFXO1FBQ1Ysd0JBQUQsRUFBUztlQUNSLGNBQUQsRUFBTSxvQkFBTixFQUFjLDBCQUFkLEVBQTJCO01BSGpCLENBQVo7YUFJQSxJQUFBLENBQUssU0FBQTtlQUNILE9BQU8sQ0FBQyxXQUFSLENBQW9CLGFBQXBCO01BREcsQ0FBTDtJQUxTLENBQVg7V0FRQSxRQUFBLENBQVMsb0NBQVQsRUFBK0MsU0FBQTtBQUM3QyxVQUFBO01BQUEsYUFBQSxHQUFnQixTQUFDLE1BQUQ7ZUFDZCxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsTUFBTSxDQUFDLGNBQVAsQ0FBQSxDQUE1QjtNQURjO01BR2hCLHlCQUFBLEdBQTRCLFNBQUE7QUFDMUIsWUFBQTtRQUQyQjtBQUMzQixnQkFBTyxJQUFJLENBQUMsTUFBWjtBQUFBLGVBQ08sQ0FEUDtZQUNlLFVBQVc7QUFBbkI7QUFEUCxlQUVPLENBRlA7WUFFZSxvQkFBRCxFQUFhO0FBRjNCO1FBSUEsSUFBRyxrQkFB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ZXRWaW1TdGF0ZSwgZGlzcGF0Y2gsIFRleHREYXRhLCBnZXRWaWV3fSA9IHJlcXVpcmUgJy4vc3BlYy1oZWxwZXInXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4uL2xpYi9zZXR0aW5ncydcblxuZGVzY3JpYmUgXCJQZXJzaXN0ZW50IFNlbGVjdGlvblwiLCAtPlxuICBbc2V0LCBlbnN1cmUsIGtleXN0cm9rZSwgZWRpdG9yLCBlZGl0b3JFbGVtZW50LCB2aW1TdGF0ZV0gPSBbXVxuXG4gIGJlZm9yZUVhY2ggLT5cbiAgICBnZXRWaW1TdGF0ZSAoc3RhdGUsIF92aW0pIC0+XG4gICAgICB2aW1TdGF0ZSA9IHN0YXRlXG4gICAgICB7ZWRpdG9yLCBlZGl0b3JFbGVtZW50fSA9IHZpbVN0YXRlXG4gICAgICB7c2V0LCBlbnN1cmUsIGtleXN0cm9rZX0gPSBfdmltXG4gICAgcnVucyAtPlxuICAgICAgamFzbWluZS5hdHRhY2hUb0RPTShlZGl0b3JFbGVtZW50KVxuXG4gIGRlc2NyaWJlIFwiQ3JlYXRlUGVyc2lzdGVudFNlbGVjdGlvbiBvcGVyYXRvclwiLCAtPlxuICAgIHRleHRGb3JNYXJrZXIgPSAobWFya2VyKSAtPlxuICAgICAgZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKG1hcmtlci5nZXRCdWZmZXJSYW5nZSgpKVxuXG4gICAgZW5zdXJlUGVyc2lzdGVudFNlbGVjdGlvbiA9IChhcmdzLi4uKSAtPlxuICAgICAgc3dpdGNoIGFyZ3MubGVuZ3RoXG4gICAgICAgIHdoZW4gMSB0aGVuIFtvcHRpb25zXSA9IGFyZ3NcbiAgICAgICAgd2hlbiAyIHRoZW4gW19rZXlzdHJva2UsIG9wdGlvbnNdID0gYXJnc1xuXG4gICAgICBpZiBfa2V5c3Ryb2tlP1xuICAgICAgICBrZXlzdHJva2UoX2tleXN0cm9rZSlcblxuICAgICAgbWFya2VycyA9IHZpbVN0YXRlLnBlcnNpc3RlbnRTZWxlY3Rpb24uZ2V0TWFya2VycygpXG4gICAgICBpZiBvcHRpb25zLmxlbmd0aD9cbiAgICAgICAgZXhwZWN0KG1hcmtlcnMpLnRvSGF2ZUxlbmd0aChvcHRpb25zLmxlbmd0aClcblxuICAgICAgaWYgb3B0aW9ucy50ZXh0P1xuICAgICAgICB0ZXh0ID0gbWFya2Vycy5tYXAgKG1hcmtlcikgLT4gdGV4dEZvck1hcmtlcihtYXJrZXIpXG4gICAgICAgIGV4cGVjdCh0ZXh0KS50b0VxdWFsKG9wdGlvbnMudGV4dClcblxuICAgICAgaWYgb3B0aW9ucy5tb2RlP1xuICAgICAgICBlbnN1cmUgbW9kZTogb3B0aW9ucy5tb2RlXG5cbiAgICBiZWZvcmVFYWNoIC0+XG4gICAgICBhdG9tLmtleW1hcHMuYWRkIFwidGVzdFwiLFxuICAgICAgICAnYXRvbS10ZXh0LWVkaXRvci52aW0tbW9kZS1wbHVzOm5vdCguaW5zZXJ0LW1vZGUpJzpcbiAgICAgICAgICAnZyBtJzogJ3ZpbS1tb2RlLXBsdXM6Y3JlYXRlLXBlcnNpc3RlbnQtc2VsZWN0aW9uJ1xuICAgICAgc2V0XG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICBvb28geHh4IG9vb1xuICAgICAgICB4eHggb29vIHh4eFxuXG4gICAgICAgIG9vbyB4eHggb29vXG4gICAgICAgIHh4eCBvb28geHh4XG5cbiAgICAgICAgb29vIHh4eCBvb29cbiAgICAgICAgeHh4IG9vbyB4eHhcXG5cbiAgICAgICAgXCJcIlwiXG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICBleHBlY3QodmltU3RhdGUucGVyc2lzdGVudFNlbGVjdGlvbi5oYXNNYXJrZXJzKCkpLnRvQmUoZmFsc2UpXG5cbiAgICBkZXNjcmliZSBcImJhc2ljIGJlaGF2aW9yXCIsIC0+XG4gICAgICBkZXNjcmliZSBcImNyZWF0ZS1wZXJzaXN0ZW50LXNlbGVjdGlvblwiLCAtPlxuICAgICAgICBpdCBcImNyZWF0ZS1wZXJzaXN0ZW50LXNlbGVjdGlvblwiLCAtPlxuICAgICAgICAgIGVuc3VyZVBlcnNpc3RlbnRTZWxlY3Rpb24gJ2cgbSBpIHcnLFxuICAgICAgICAgICAgbGVuZ3RoOiAxXG4gICAgICAgICAgICB0ZXh0OiBbJ29vbyddXG4gICAgICAgICAgZW5zdXJlUGVyc2lzdGVudFNlbGVjdGlvbiAnaiAuJyxcbiAgICAgICAgICAgIGxlbmd0aDogMlxuICAgICAgICAgICAgdGV4dDogWydvb28nLCAneHh4J11cbiAgICAgICAgaXQgXCJjcmVhdGUtcGVyc2lzdGVudC1zZWxlY3Rpb24gZm9yciBjdXJyZW50IHNlbGVjdGlvbiBhbmQgcmVwZWF0YWJsZSBieSAuXCIsIC0+XG4gICAgICAgICAgZW5zdXJlUGVyc2lzdGVudFNlbGVjdGlvbiAndiBlbnRlcicsXG4gICAgICAgICAgICBsZW5ndGg6IDFcbiAgICAgICAgICAgIHRleHQ6IFsnbyddXG4gICAgICAgICAgZW5zdXJlUGVyc2lzdGVudFNlbGVjdGlvbiAnaiAuJyxcbiAgICAgICAgICAgIGxlbmd0aDogMlxuICAgICAgICAgICAgdGV4dDogWydvJywgJ3gnXVxuXG4gICAgICBkZXNjcmliZSBcIltObyBiZWhhdmlvciBkaWZmIGN1cnJlbnRseV0gaW5uZXItcGVyc2lzdGVudC1zZWxlY3Rpb24gYW5kIGEtcGVyc2lzdGVudC1zZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgaXQgXCJhcHBseSBvcGVyYXRvciB0byBhY3Jvc3MgYWxsIHBlcnNpc3RlbnQtc2VsZWN0aW9uc1wiLCAtPlxuICAgICAgICAgIGVuc3VyZVBlcnNpc3RlbnRTZWxlY3Rpb24gJ2cgbSBpIHcgaiAuIDIgaiBnIG0gaSBwJywgICMgTWFyayAyIGlubmVyLXdvcmQgYW5kIDEgaW5uZXItcGFyYWdyYXBoXG4gICAgICAgICAgICBsZW5ndGg6IDNcbiAgICAgICAgICAgIHRleHQ6IFsnb29vJywgJ3h4eCcsIFwib29vIHh4eCBvb29cXG54eHggb29vIHh4eFxcblwiXVxuXG4gICAgICAgICAgZW5zdXJlICdnIFUgYSByJyxcbiAgICAgICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgICAgT09PIHh4eCBvb29cbiAgICAgICAgICAgIFhYWCBvb28geHh4XG5cbiAgICAgICAgICAgIE9PTyBYWFggT09PXG4gICAgICAgICAgICBYWFggT09PIFhYWFxuXG4gICAgICAgICAgICBvb28geHh4IG9vb1xuICAgICAgICAgICAgeHh4IG9vbyB4eHhcXG5cbiAgICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJwcmFjdGljYWwgc2NlbmFyaW9cIiwgLT5cbiAgICAgIGRlc2NyaWJlIFwicGVyc2lzdGVudC1zZWxlY3Rpb24gaXMgdHJlYXRlZCBpbiBzYW1lIHdheSBhcyByZWFsIHNlbGVjdGlvblwiLCAtPlxuICAgICAgICBiZWZvcmVFYWNoIC0+XG4gICAgICAgICAgc2V0XG4gICAgICAgICAgICB0ZXh0QzogXCJcIlwiXG4gICAgICAgICAgICB8MCA9PT09PT09PT09XG4gICAgICAgICAgICAxID09PT09PT09PT1cbiAgICAgICAgICAgIDIgPT09PT09PT09PVxuICAgICAgICAgICAgMyA9PT09PT09PT09XG4gICAgICAgICAgICA0ID09PT09PT09PT1cbiAgICAgICAgICAgIDUgPT09PT09PT09PVxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICAgICAgICBlbnN1cmVQZXJzaXN0ZW50U2VsZWN0aW9uICdWIGogZW50ZXInLFxuICAgICAgICAgICAgdGV4dDogWycwID09PT09PT09PT1cXG4xID09PT09PT09PT1cXG4nXVxuXG4gICAgICAgICAgZW5zdXJlICcyIGogViBqJyxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogWyczID09PT09PT09PT1cXG40ID09PT09PT09PT1cXG4nXVxuICAgICAgICAgICAgbW9kZTogWyd2aXN1YWwnLCAnbGluZXdpc2UnXVxuXG4gICAgICAgIGl0IFwiSSBpbiB2TC1tb2RlIHdpdGggcGVyc2lzdGVudC1zZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ0knLFxuICAgICAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIHwwID09PT09PT09PT1cbiAgICAgICAgICAgIHwxID09PT09PT09PT1cbiAgICAgICAgICAgIDIgPT09PT09PT09PVxuICAgICAgICAgICAgfDMgPT09PT09PT09PVxuICAgICAgICAgICAgfDQgPT09PT09PT09PVxuICAgICAgICAgICAgNSA9PT09PT09PT09XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICMgY3Vyc29yOiBbWzMsIDBdLCBbNCwgMF0sIFswLCAwXSwgWzEsIDBdXVxuXG4gICAgICAgIGl0IFwiQSBpbiB2TC1tb2RlIHdpdGggcGVyc2lzdGVudC1zZWxlY3Rpb25cIiwgLT5cbiAgICAgICAgICBlbnN1cmUgJ0EnLFxuICAgICAgICAgICAgbW9kZTogJ2luc2VydCdcbiAgICAgICAgICAgIHRleHRDOiBcIlwiXCJcbiAgICAgICAgICAgIDAgPT09PT09PT09PXxcbiAgICAgICAgICAgIDEgPT09PT09PT09PXxcbiAgICAgICAgICAgIDIgPT09PT09PT09PVxuICAgICAgICAgICAgMyA9PT09PT09PT09fFxuICAgICAgICAgICAgNCA9PT09PT09PT09fFxuICAgICAgICAgICAgNSA9PT09PT09PT09XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICMgY3Vyc29yOiBbWzMsIDEyXSwgWzQsIDEyXSwgWzAsIDEyXSwgWzEsIDEyXV1cblxuICAgIGRlc2NyaWJlIFwic2VsZWN0LW9jY3VycmVuY2UtaW4tYS1wZXJzaXN0ZW50LXNlbGVjdGlvblwiLCAtPlxuICAgICAgaXQgXCJzZWxlY3QgYWxsIGluc3RhbmNlIG9mIGN1cnNvciB3b3JkIG9ubHkgd2l0aGluIG1hcmtlZCByYW5nZVwiLCAtPlxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgcGFyYWdyYXBoVGV4dCA9IFwiXCJcIlxuICAgICAgICAgICAgb29vIHh4eCBvb29cbiAgICAgICAgICAgIHh4eCBvb28geHh4XFxuXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICBlbnN1cmVQZXJzaXN0ZW50U2VsZWN0aW9uICdnIG0gaSBwIH0gfSBqIC4nLCAjIE1hcmsgMiBpbm5lci13b3JkIGFuZCAxIGlubmVyLXBhcmFncmFwaFxuICAgICAgICAgICAgbGVuZ3RoOiAyXG4gICAgICAgICAgICB0ZXh0OiBbcGFyYWdyYXBoVGV4dCwgcGFyYWdyYXBoVGV4dF1cblxuICAgICAgICBydW5zIC0+XG4gICAgICAgICAgZW5zdXJlICdnIGNtZC1kJyxcbiAgICAgICAgICAgIHNlbGVjdGVkVGV4dDogWydvb28nLCAnb29vJywgJ29vbycsICdvb28nLCAnb29vJywgJ29vbycgXVxuICAgICAgICAgIGtleXN0cm9rZSAnYydcbiAgICAgICAgICBlZGl0b3IuaW5zZXJ0VGV4dCAnISEhJ1xuICAgICAgICAgIGVuc3VyZVxuICAgICAgICAgICAgdGV4dDogXCJcIlwiXG4gICAgICAgICAgICAhISEgeHh4ICEhIVxuICAgICAgICAgICAgeHh4ICEhISB4eHhcblxuICAgICAgICAgICAgb29vIHh4eCBvb29cbiAgICAgICAgICAgIHh4eCBvb28geHh4XG5cbiAgICAgICAgICAgICEhISB4eHggISEhXG4gICAgICAgICAgICB4eHggISEhIHh4eFxcblxuICAgICAgICAgICAgXCJcIlwiXG5cbiAgICBkZXNjcmliZSBcImNsZWFyLXBlcnNpc3RlbnQtc2VsZWN0aW9ucyBjb21tYW5kXCIsIC0+XG4gICAgICBpdCBcImNsZWFyIHBlcnNpc3RlbnRTZWxlY3Rpb25zXCIsIC0+XG4gICAgICAgIGVuc3VyZVBlcnNpc3RlbnRTZWxlY3Rpb24gJ2cgbSBpIHcnLFxuICAgICAgICAgIGxlbmd0aDogMVxuICAgICAgICAgIHRleHQ6IFsnb29vJ11cblxuICAgICAgICBkaXNwYXRjaChlZGl0b3JFbGVtZW50LCAndmltLW1vZGUtcGx1czpjbGVhci1wZXJzaXN0ZW50LXNlbGVjdGlvbnMnKVxuICAgICAgICBleHBlY3QodmltU3RhdGUucGVyc2lzdGVudFNlbGVjdGlvbi5oYXNNYXJrZXJzKCkpLnRvQmUoZmFsc2UpXG5cbiAgICBkZXNjcmliZSBcImNsZWFyUGVyc2lzdGVudFNlbGVjdGlvbk9uUmVzZXROb3JtYWxNb2RlXCIsIC0+XG4gICAgICBkZXNjcmliZSBcIndoZW4gZGlzYWJsZWRcIiwgLT5cbiAgICAgICAgaXQgXCJpdCB3b24ndCBjbGVhciBwZXJzaXN0ZW50U2VsZWN0aW9uXCIsIC0+XG4gICAgICAgICAgc2V0dGluZ3Muc2V0KCdjbGVhclBlcnNpc3RlbnRTZWxlY3Rpb25PblJlc2V0Tm9ybWFsTW9kZScsIGZhbHNlKVxuICAgICAgICAgIGVuc3VyZVBlcnNpc3RlbnRTZWxlY3Rpb24gJ2cgbSBpIHcnLFxuICAgICAgICAgICAgbGVuZ3RoOiAxXG4gICAgICAgICAgICB0ZXh0OiBbJ29vbyddXG5cbiAgICAgICAgICBlbnN1cmUgXCJlc2NhcGVcIiwgbW9kZTogJ25vcm1hbCdcbiAgICAgICAgICBlbnN1cmVQZXJzaXN0ZW50U2VsZWN0aW9uIGxlbmd0aDogMSwgdGV4dDogWydvb28nXVxuXG4gICAgICBkZXNjcmliZSBcIndoZW4gZW5hYmxlZFwiLCAtPlxuICAgICAgICBpdCBcIml0IGNsZWFyIHBlcnNpc3RlbnRTZWxlY3Rpb24gb24gcmVzZXQtbm9ybWFsLW1vZGVcIiwgLT5cbiAgICAgICAgICBzZXR0aW5ncy5zZXQoJ2NsZWFyUGVyc2lzdGVudFNlbGVjdGlvbk9uUmVzZXROb3JtYWxNb2RlJywgdHJ1ZSlcbiAgICAgICAgICBlbnN1cmVQZXJzaXN0ZW50U2VsZWN0aW9uICdnIG0gaSB3JyxcbiAgICAgICAgICAgIGxlbmd0aDogMVxuICAgICAgICAgICAgdGV4dDogWydvb28nXVxuICAgICAgICAgIGVuc3VyZSBcImVzY2FwZVwiLCBtb2RlOiAnbm9ybWFsJ1xuICAgICAgICAgIGV4cGVjdCh2aW1TdGF0ZS5wZXJzaXN0ZW50U2VsZWN0aW9uLmhhc01hcmtlcnMoKSkudG9CZShmYWxzZSlcbiJdfQ==
