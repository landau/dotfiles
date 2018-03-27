(function() {
  var _, getVimState;

  _ = require('underscore-plus');

  getVimState = require('./spec-helper').getVimState;

  xdescribe("visual-mode performance", function() {
    var editor, editorElement, ensure, keystroke, ref, set, vimState;
    ref = [], set = ref[0], ensure = ref[1], keystroke = ref[2], editor = ref[3], editorElement = ref[4], vimState = ref[5];
    beforeEach(function() {
      return getVimState(function(state, _vim) {
        vimState = state;
        editor = vimState.editor, editorElement = vimState.editorElement;
        return set = _vim.set, ensure = _vim.ensure, keystroke = _vim.keystroke, _vim;
      });
    });
    afterEach(function() {
      vimState.resetNormalMode();
      return vimState.globalState.reset();
    });
    return describe("slow down editor", function() {
      var measureWithTimeEnd, moveRightAndLeftCheck;
      moveRightAndLeftCheck = function(scenario, modeSig) {
        var moveBySelect, moveByVMP, moveCount;
        console.log([scenario, modeSig, atom.getVersion(), atom.packages.getActivePackage('vim-mode-plus').metadata.version]);
        moveCount = 89;
        switch (scenario) {
          case 'vmp':
            moveByVMP = function() {
              _.times(moveCount, function() {
                return keystroke('l');
              });
              return _.times(moveCount, function() {
                return keystroke('h');
              });
            };
            return _.times(10, function() {
              return measureWithTimeEnd(moveByVMP);
            });
          case 'sel':
            moveBySelect = function() {
              _.times(moveCount, function() {
                return editor.getLastSelection().selectRight();
              });
              return _.times(moveCount, function() {
                return editor.getLastSelection().selectLeft();
              });
            };
            return _.times(15, function() {
              return measureWithTimeEnd(moveBySelect);
            });
        }
      };
      measureWithTimeEnd = function(fn) {
        console.time(fn.name);
        fn();
        return console.timeEnd(fn.name);
      };
      beforeEach(function() {
        return set({
          cursor: [0, 0],
          text: "012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789"
        });
      });
      return describe("vmp", function() {
        it("[normal] slow down editor", function() {
          return moveRightAndLeftCheck('vmp', 'moveCount');
        });
        it("[vC] slow down editor", function() {
          ensure('v', {
            mode: ['visual', 'characterwise']
          });
          moveRightAndLeftCheck('vmp', 'vC');
          ensure('escape', {
            mode: 'normal'
          });
          ensure('v', {
            mode: ['visual', 'characterwise']
          });
          moveRightAndLeftCheck('vmp', 'vC');
          return ensure('escape', {
            mode: 'normal'
          });
        });
        return it("[vC] slow down editor", function() {
          return moveRightAndLeftCheck('sel', 'vC');
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL3BlcmZvcm1hbmNlLXNwZWMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUVILGNBQWUsT0FBQSxDQUFRLGVBQVI7O0VBRWhCLFNBQUEsQ0FBVSx5QkFBVixFQUFxQyxTQUFBO0FBQ25DLFFBQUE7SUFBQSxNQUE0RCxFQUE1RCxFQUFDLFlBQUQsRUFBTSxlQUFOLEVBQWMsa0JBQWQsRUFBeUIsZUFBekIsRUFBaUMsc0JBQWpDLEVBQWdEO0lBRWhELFVBQUEsQ0FBVyxTQUFBO2FBQ1QsV0FBQSxDQUFZLFNBQUMsS0FBRCxFQUFRLElBQVI7UUFDVixRQUFBLEdBQVc7UUFDVix3QkFBRCxFQUFTO2VBQ1IsY0FBRCxFQUFNLG9CQUFOLEVBQWMsMEJBQWQsRUFBMkI7TUFIakIsQ0FBWjtJQURTLENBQVg7SUFNQSxTQUFBLENBQVUsU0FBQTtNQUNSLFFBQVEsQ0FBQyxlQUFULENBQUE7YUFDQSxRQUFRLENBQUMsV0FBVyxDQUFDLEtBQXJCLENBQUE7SUFGUSxDQUFWO1dBSUEsUUFBQSxDQUFTLGtCQUFULEVBQTZCLFNBQUE7QUFDM0IsVUFBQTtNQUFBLHFCQUFBLEdBQXdCLFNBQUMsUUFBRCxFQUFXLE9BQVg7QUFDdEIsWUFBQTtRQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBQyxRQUFELEVBQVcsT0FBWCxFQUFvQixJQUFJLENBQUMsVUFBTCxDQUFBLENBQXBCLEVBQXVDLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWQsQ0FBK0IsZUFBL0IsQ0FBK0MsQ0FBQyxRQUFRLENBQUMsT0FBaEcsQ0FBWjtRQUVBLFNBQUEsR0FBWTtBQUNaLGdCQUFPLFFBQVA7QUFBQSxlQUNPLEtBRFA7WUFFSSxTQUFBLEdBQVksU0FBQTtjQUNWLENBQUMsQ0FBQyxLQUFGLENBQVEsU0FBUixFQUFtQixTQUFBO3VCQUFHLFNBQUEsQ0FBVSxHQUFWO2NBQUgsQ0FBbkI7cUJBQ0EsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxTQUFSLEVBQW1CLFNBQUE7dUJBQUcsU0FBQSxDQUFVLEdBQVY7Y0FBSCxDQUFuQjtZQUZVO21CQUdaLENBQUMsQ0FBQyxLQUFGLENBQVEsRUFBUixFQUFZLFNBQUE7cUJBQUcsa0JBQUEsQ0FBbUIsU0FBbkI7WUFBSCxDQUFaO0FBTEosZUFNTyxLQU5QO1lBT0ksWUFBQSxHQUFlLFNBQUE7Y0FDYixDQUFDLENBQUMsS0FBRixDQUFRLFNBQVIsRUFBbUIsU0FBQTt1QkFBRyxNQUFNLENBQUMsZ0JBQVAsQ0FBQSxDQUF5QixDQUFDLFdBQTFCLENBQUE7Y0FBSCxDQUFuQjtxQkFDQSxDQUFDLENBQUMsS0FBRixDQUFRLFNBQVIsRUFBbUIsU0FBQTt1QkFBRyxNQUFNLENBQUMsZ0JBQVAsQ0FBQSxDQUF5QixDQUFDLFVBQTFCLENBQUE7Y0FBSCxDQUFuQjtZQUZhO21CQUdmLENBQUMsQ0FBQyxLQUFGLENBQVEsRUFBUixFQUFZLFNBQUE7cUJBQUcsa0JBQUEsQ0FBbUIsWUFBbkI7WUFBSCxDQUFaO0FBVko7TUFKc0I7TUFnQnhCLGtCQUFBLEdBQXFCLFNBQUMsRUFBRDtRQUNuQixPQUFPLENBQUMsSUFBUixDQUFhLEVBQUUsQ0FBQyxJQUFoQjtRQUNBLEVBQUEsQ0FBQTtlQUNBLE9BQU8sQ0FBQyxPQUFSLENBQWdCLEVBQUUsQ0FBQyxJQUFuQjtNQUhtQjtNQUtyQixVQUFBLENBQVcsU0FBQTtlQUNULEdBQUEsQ0FDRTtVQUFBLE1BQUEsRUFBUSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQVI7VUFDQSxJQUFBLEVBQU0sNEZBRE47U0FERjtNQURTLENBQVg7YUFPQSxRQUFBLENBQVMsS0FBVCxFQUFnQixTQUFBO1FBRWQsRUFBQSxDQUFHLDJCQUFILEVBQWdDLFNBQUE7aUJBQzlCLHFCQUFBLENBQXNCLEtBQXRCLEVBQTZCLFdBQTdCO1FBRDhCLENBQWhDO1FBRUEsRUFBQSxDQUFHLHVCQUFILEVBQTRCLFNBQUE7VUFDMUIsTUFBQSxDQUFPLEdBQVAsRUFBWTtZQUFBLElBQUEsRUFBTSxDQUFDLFFBQUQsRUFBVyxlQUFYLENBQU47V0FBWjtVQUNBLHFCQUFBLENBQXNCLEtBQXRCLEVBQTZCLElBQTdCO1VBQ0EsTUFBQSxDQUFPLFFBQVAsRUFBaUI7WUFBQSxJQUFBLEVBQU0sUUFBTjtXQUFqQjtVQUVBLE1BQUEsQ0FBTyxHQUFQLEVBQVk7WUFBQSxJQUFBLEVBQU0sQ0FBQyxRQUFELEVBQVcsZUFBWCxDQUFOO1dBQVo7VUFDQSxxQkFBQSxDQUFzQixLQUF0QixFQUE2QixJQUE3QjtpQkFDQSxNQUFBLENBQU8sUUFBUCxFQUFpQjtZQUFBLElBQUEsRUFBTSxRQUFOO1dBQWpCO1FBUDBCLENBQTVCO2VBU0EsRUFBQSxDQUFHLHVCQUFILEVBQTRCLFNBQUE7aUJBRTFCLHFCQUFBLENBQXNCLEtBQXRCLEVBQTZCLElBQTdCO1FBRjBCLENBQTVCO01BYmMsQ0FBaEI7SUE3QjJCLENBQTdCO0VBYm1DLENBQXJDO0FBSkEiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG57Z2V0VmltU3RhdGV9ID0gcmVxdWlyZSAnLi9zcGVjLWhlbHBlcidcblxueGRlc2NyaWJlIFwidmlzdWFsLW1vZGUgcGVyZm9ybWFuY2VcIiwgLT5cbiAgW3NldCwgZW5zdXJlLCBrZXlzdHJva2UsIGVkaXRvciwgZWRpdG9yRWxlbWVudCwgdmltU3RhdGVdID0gW11cblxuICBiZWZvcmVFYWNoIC0+XG4gICAgZ2V0VmltU3RhdGUgKHN0YXRlLCBfdmltKSAtPlxuICAgICAgdmltU3RhdGUgPSBzdGF0ZSAjIHRvIHJlZmVyIGFzIHZpbVN0YXRlIGxhdGVyLlxuICAgICAge2VkaXRvciwgZWRpdG9yRWxlbWVudH0gPSB2aW1TdGF0ZVxuICAgICAge3NldCwgZW5zdXJlLCBrZXlzdHJva2V9ID0gX3ZpbVxuXG4gIGFmdGVyRWFjaCAtPlxuICAgIHZpbVN0YXRlLnJlc2V0Tm9ybWFsTW9kZSgpXG4gICAgdmltU3RhdGUuZ2xvYmFsU3RhdGUucmVzZXQoKVxuXG4gIGRlc2NyaWJlIFwic2xvdyBkb3duIGVkaXRvclwiLCAtPlxuICAgIG1vdmVSaWdodEFuZExlZnRDaGVjayA9IChzY2VuYXJpbywgbW9kZVNpZykgLT5cbiAgICAgIGNvbnNvbGUubG9nIFtzY2VuYXJpbywgbW9kZVNpZywgYXRvbS5nZXRWZXJzaW9uKCksIGF0b20ucGFja2FnZXMuZ2V0QWN0aXZlUGFja2FnZSgndmltLW1vZGUtcGx1cycpLm1ldGFkYXRhLnZlcnNpb25dXG5cbiAgICAgIG1vdmVDb3VudCA9IDg5XG4gICAgICBzd2l0Y2ggc2NlbmFyaW9cbiAgICAgICAgd2hlbiAndm1wJ1xuICAgICAgICAgIG1vdmVCeVZNUCA9IC0+XG4gICAgICAgICAgICBfLnRpbWVzIG1vdmVDb3VudCwgLT4ga2V5c3Ryb2tlICdsJ1xuICAgICAgICAgICAgXy50aW1lcyBtb3ZlQ291bnQsIC0+IGtleXN0cm9rZSAnaCdcbiAgICAgICAgICBfLnRpbWVzIDEwLCAtPiBtZWFzdXJlV2l0aFRpbWVFbmQobW92ZUJ5Vk1QKVxuICAgICAgICB3aGVuICdzZWwnXG4gICAgICAgICAgbW92ZUJ5U2VsZWN0ID0gLT5cbiAgICAgICAgICAgIF8udGltZXMgbW92ZUNvdW50LCAtPiBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpLnNlbGVjdFJpZ2h0KClcbiAgICAgICAgICAgIF8udGltZXMgbW92ZUNvdW50LCAtPiBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpLnNlbGVjdExlZnQoKVxuICAgICAgICAgIF8udGltZXMgMTUsIC0+IG1lYXN1cmVXaXRoVGltZUVuZChtb3ZlQnlTZWxlY3QpXG5cbiAgICBtZWFzdXJlV2l0aFRpbWVFbmQgPSAoZm4pIC0+XG4gICAgICBjb25zb2xlLnRpbWUoZm4ubmFtZSlcbiAgICAgIGZuKClcbiAgICAgIGNvbnNvbGUudGltZUVuZChmbi5uYW1lKVxuXG4gICAgYmVmb3JlRWFjaCAtPlxuICAgICAgc2V0XG4gICAgICAgIGN1cnNvcjogWzAsIDBdXG4gICAgICAgIHRleHQ6IFwiXCJcIlxuICAgICAgICAgIDAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OVxuICAgICAgICAgIFwiXCJcIlxuXG4gICAgZGVzY3JpYmUgXCJ2bXBcIiwgLT5cbiAgICAgICMgYmVmb3JlRWFjaCAtPlxuICAgICAgaXQgXCJbbm9ybWFsXSBzbG93IGRvd24gZWRpdG9yXCIsIC0+XG4gICAgICAgIG1vdmVSaWdodEFuZExlZnRDaGVjaygndm1wJywgJ21vdmVDb3VudCcpXG4gICAgICBpdCBcIlt2Q10gc2xvdyBkb3duIGVkaXRvclwiLCAtPlxuICAgICAgICBlbnN1cmUgJ3YnLCBtb2RlOiBbJ3Zpc3VhbCcsICdjaGFyYWN0ZXJ3aXNlJ11cbiAgICAgICAgbW92ZVJpZ2h0QW5kTGVmdENoZWNrKCd2bXAnLCAndkMnKVxuICAgICAgICBlbnN1cmUgJ2VzY2FwZScsIG1vZGU6ICdub3JtYWwnXG5cbiAgICAgICAgZW5zdXJlICd2JywgbW9kZTogWyd2aXN1YWwnLCAnY2hhcmFjdGVyd2lzZSddXG4gICAgICAgIG1vdmVSaWdodEFuZExlZnRDaGVjaygndm1wJywgJ3ZDJylcbiAgICAgICAgZW5zdXJlICdlc2NhcGUnLCBtb2RlOiAnbm9ybWFsJ1xuXG4gICAgICBpdCBcIlt2Q10gc2xvdyBkb3duIGVkaXRvclwiLCAtPlxuICAgICAgICAjIGVuc3VyZSAndicsIG1vZGU6IFsndmlzdWFsJywgJ2NoYXJhY3Rlcndpc2UnXVxuICAgICAgICBtb3ZlUmlnaHRBbmRMZWZ0Q2hlY2soJ3NlbCcsICd2QycpXG4iXX0=
