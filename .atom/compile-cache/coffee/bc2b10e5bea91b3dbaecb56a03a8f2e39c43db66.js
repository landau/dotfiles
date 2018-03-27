(function() {
  var $, $$, SelectList, SelectListView, _, fuzzaldrin, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore-plus');

  ref = require('atom-space-pen-views'), SelectListView = ref.SelectListView, $ = ref.$, $$ = ref.$$;

  fuzzaldrin = require('fuzzaldrin');

  SelectList = (function(superClass) {
    extend(SelectList, superClass);

    function SelectList() {
      return SelectList.__super__.constructor.apply(this, arguments);
    }

    SelectList.prototype.initialize = function() {
      SelectList.__super__.initialize.apply(this, arguments);
      return this.addClass('vim-mode-plus-select-list');
    };

    SelectList.prototype.getFilterKey = function() {
      return 'displayName';
    };

    SelectList.prototype.cancelled = function() {
      this.vimState.emitter.emit('did-cancel-select-list');
      return this.hide();
    };

    SelectList.prototype.show = function(vimState, options) {
      var ref1;
      this.vimState = vimState;
      if (options.maxItems != null) {
        this.setMaxItems(options.maxItems);
      }
      ref1 = this.vimState, this.editorElement = ref1.editorElement, this.editor = ref1.editor;
      this.storeFocusedElement();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.setItems(options.items);
      return this.focusFilterEditor();
    };

    SelectList.prototype.hide = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.hide() : void 0;
    };

    SelectList.prototype.viewForItem = function(arg) {
      var displayName, filterQuery, matches, name;
      name = arg.name, displayName = arg.displayName;
      filterQuery = this.getFilterQuery();
      matches = fuzzaldrin.match(displayName, filterQuery);
      return $$(function() {
        var highlighter;
        highlighter = (function(_this) {
          return function(command, matches, offsetIndex) {
            var i, lastIndex, len, matchIndex, matchedChars, unmatched;
            lastIndex = 0;
            matchedChars = [];
            for (i = 0, len = matches.length; i < len; i++) {
              matchIndex = matches[i];
              matchIndex -= offsetIndex;
              if (matchIndex < 0) {
                continue;
              }
              unmatched = command.substring(lastIndex, matchIndex);
              if (unmatched) {
                if (matchedChars.length) {
                  _this.span(matchedChars.join(''), {
                    "class": 'character-match'
                  });
                }
                matchedChars = [];
                _this.text(unmatched);
              }
              matchedChars.push(command[matchIndex]);
              lastIndex = matchIndex + 1;
            }
            if (matchedChars.length) {
              _this.span(matchedChars.join(''), {
                "class": 'character-match'
              });
            }
            return _this.text(command.substring(lastIndex));
          };
        })(this);
        return this.li({
          "class": 'event',
          'data-event-name': name
        }, (function(_this) {
          return function() {
            return _this.span({
              title: displayName
            }, function() {
              return highlighter(displayName, matches, 0);
            });
          };
        })(this));
      });
    };

    SelectList.prototype.confirmed = function(item) {
      this.vimState.emitter.emit('did-confirm-select-list', item);
      return this.cancel();
    };

    return SelectList;

  })(SelectListView);

  module.exports = new SelectList;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvc2VsZWN0LWxpc3QuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxxREFBQTtJQUFBOzs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQTBCLE9BQUEsQ0FBUSxzQkFBUixDQUExQixFQUFDLG1DQUFELEVBQWlCLFNBQWpCLEVBQW9COztFQUNwQixVQUFBLEdBQWEsT0FBQSxDQUFRLFlBQVI7O0VBRVA7Ozs7Ozs7eUJBQ0osVUFBQSxHQUFZLFNBQUE7TUFDViw0Q0FBQSxTQUFBO2FBQ0EsSUFBQyxDQUFBLFFBQUQsQ0FBVSwyQkFBVjtJQUZVOzt5QkFJWixZQUFBLEdBQWMsU0FBQTthQUNaO0lBRFk7O3lCQUdkLFNBQUEsR0FBVyxTQUFBO01BQ1QsSUFBQyxDQUFBLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBbEIsQ0FBdUIsd0JBQXZCO2FBQ0EsSUFBQyxDQUFBLElBQUQsQ0FBQTtJQUZTOzt5QkFJWCxJQUFBLEdBQU0sU0FBQyxRQUFELEVBQVksT0FBWjtBQUNKLFVBQUE7TUFESyxJQUFDLENBQUEsV0FBRDtNQUNMLElBQUcsd0JBQUg7UUFDRSxJQUFDLENBQUEsV0FBRCxDQUFhLE9BQU8sQ0FBQyxRQUFyQixFQURGOztNQUVBLE9BQTRCLElBQUMsQ0FBQSxRQUE3QixFQUFDLElBQUMsQ0FBQSxxQkFBQSxhQUFGLEVBQWlCLElBQUMsQ0FBQSxjQUFBO01BQ2xCLElBQUMsQ0FBQSxtQkFBRCxDQUFBOztRQUNBLElBQUMsQ0FBQSxRQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUE2QjtVQUFDLElBQUEsRUFBTSxJQUFQO1NBQTdCOztNQUNWLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFBO01BQ0EsSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFPLENBQUMsS0FBbEI7YUFDQSxJQUFDLENBQUEsaUJBQUQsQ0FBQTtJQVJJOzt5QkFVTixJQUFBLEdBQU0sU0FBQTtBQUNKLFVBQUE7K0NBQU0sQ0FBRSxJQUFSLENBQUE7SUFESTs7eUJBR04sV0FBQSxHQUFhLFNBQUMsR0FBRDtBQUVYLFVBQUE7TUFGYSxpQkFBTTtNQUVuQixXQUFBLEdBQWMsSUFBQyxDQUFBLGNBQUQsQ0FBQTtNQUNkLE9BQUEsR0FBVSxVQUFVLENBQUMsS0FBWCxDQUFpQixXQUFqQixFQUE4QixXQUE5QjthQUNWLEVBQUEsQ0FBRyxTQUFBO0FBQ0QsWUFBQTtRQUFBLFdBQUEsR0FBYyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFDLE9BQUQsRUFBVSxPQUFWLEVBQW1CLFdBQW5CO0FBQ1osZ0JBQUE7WUFBQSxTQUFBLEdBQVk7WUFDWixZQUFBLEdBQWU7QUFFZixpQkFBQSx5Q0FBQTs7Y0FDRSxVQUFBLElBQWM7Y0FDZCxJQUFZLFVBQUEsR0FBYSxDQUF6QjtBQUFBLHlCQUFBOztjQUNBLFNBQUEsR0FBWSxPQUFPLENBQUMsU0FBUixDQUFrQixTQUFsQixFQUE2QixVQUE3QjtjQUNaLElBQUcsU0FBSDtnQkFDRSxJQUF5RCxZQUFZLENBQUMsTUFBdEU7a0JBQUEsS0FBQyxDQUFBLElBQUQsQ0FBTSxZQUFZLENBQUMsSUFBYixDQUFrQixFQUFsQixDQUFOLEVBQTZCO29CQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8saUJBQVA7bUJBQTdCLEVBQUE7O2dCQUNBLFlBQUEsR0FBZTtnQkFDZixLQUFDLENBQUEsSUFBRCxDQUFNLFNBQU4sRUFIRjs7Y0FJQSxZQUFZLENBQUMsSUFBYixDQUFrQixPQUFRLENBQUEsVUFBQSxDQUExQjtjQUNBLFNBQUEsR0FBWSxVQUFBLEdBQWE7QUFUM0I7WUFXQSxJQUF5RCxZQUFZLENBQUMsTUFBdEU7Y0FBQSxLQUFDLENBQUEsSUFBRCxDQUFNLFlBQVksQ0FBQyxJQUFiLENBQWtCLEVBQWxCLENBQU4sRUFBNkI7Z0JBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxpQkFBUDtlQUE3QixFQUFBOzttQkFFQSxLQUFDLENBQUEsSUFBRCxDQUFNLE9BQU8sQ0FBQyxTQUFSLENBQWtCLFNBQWxCLENBQU47VUFqQlk7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO2VBbUJkLElBQUMsQ0FBQSxFQUFELENBQUk7VUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLE9BQVA7VUFBZ0IsaUJBQUEsRUFBbUIsSUFBbkM7U0FBSixFQUE2QyxDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUMzQyxLQUFDLENBQUEsSUFBRCxDQUFNO2NBQUEsS0FBQSxFQUFPLFdBQVA7YUFBTixFQUEwQixTQUFBO3FCQUFHLFdBQUEsQ0FBWSxXQUFaLEVBQXlCLE9BQXpCLEVBQWtDLENBQWxDO1lBQUgsQ0FBMUI7VUFEMkM7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdDO01BcEJDLENBQUg7SUFKVzs7eUJBMkJiLFNBQUEsR0FBVyxTQUFDLElBQUQ7TUFDVCxJQUFDLENBQUEsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFsQixDQUF1Qix5QkFBdkIsRUFBa0QsSUFBbEQ7YUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBO0lBRlM7Ozs7S0FwRFk7O0VBd0R6QixNQUFNLENBQUMsT0FBUCxHQUFpQixJQUFJO0FBNURyQiIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57U2VsZWN0TGlzdFZpZXcsICQsICQkfSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuZnV6emFsZHJpbiA9IHJlcXVpcmUgJ2Z1enphbGRyaW4nXG5cbmNsYXNzIFNlbGVjdExpc3QgZXh0ZW5kcyBTZWxlY3RMaXN0Vmlld1xuICBpbml0aWFsaXplOiAtPlxuICAgIHN1cGVyXG4gICAgQGFkZENsYXNzKCd2aW0tbW9kZS1wbHVzLXNlbGVjdC1saXN0JylcblxuICBnZXRGaWx0ZXJLZXk6IC0+XG4gICAgJ2Rpc3BsYXlOYW1lJ1xuXG4gIGNhbmNlbGxlZDogLT5cbiAgICBAdmltU3RhdGUuZW1pdHRlci5lbWl0ICdkaWQtY2FuY2VsLXNlbGVjdC1saXN0J1xuICAgIEBoaWRlKClcblxuICBzaG93OiAoQHZpbVN0YXRlLCBvcHRpb25zKSAtPlxuICAgIGlmIG9wdGlvbnMubWF4SXRlbXM/XG4gICAgICBAc2V0TWF4SXRlbXMob3B0aW9ucy5tYXhJdGVtcylcbiAgICB7QGVkaXRvckVsZW1lbnQsIEBlZGl0b3J9ID0gQHZpbVN0YXRlXG4gICAgQHN0b3JlRm9jdXNlZEVsZW1lbnQoKVxuICAgIEBwYW5lbCA/PSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKHtpdGVtOiB0aGlzfSlcbiAgICBAcGFuZWwuc2hvdygpXG4gICAgQHNldEl0ZW1zKG9wdGlvbnMuaXRlbXMpXG4gICAgQGZvY3VzRmlsdGVyRWRpdG9yKClcblxuICBoaWRlOiAtPlxuICAgIEBwYW5lbD8uaGlkZSgpXG5cbiAgdmlld0Zvckl0ZW06ICh7bmFtZSwgZGlzcGxheU5hbWV9KSAtPlxuICAgICMgU3R5bGUgbWF0Y2hlZCBjaGFyYWN0ZXJzIGluIHNlYXJjaCByZXN1bHRzXG4gICAgZmlsdGVyUXVlcnkgPSBAZ2V0RmlsdGVyUXVlcnkoKVxuICAgIG1hdGNoZXMgPSBmdXp6YWxkcmluLm1hdGNoKGRpc3BsYXlOYW1lLCBmaWx0ZXJRdWVyeSlcbiAgICAkJCAtPlxuICAgICAgaGlnaGxpZ2h0ZXIgPSAoY29tbWFuZCwgbWF0Y2hlcywgb2Zmc2V0SW5kZXgpID0+XG4gICAgICAgIGxhc3RJbmRleCA9IDBcbiAgICAgICAgbWF0Y2hlZENoYXJzID0gW10gIyBCdWlsZCB1cCBhIHNldCBvZiBtYXRjaGVkIGNoYXJzIHRvIGJlIG1vcmUgc2VtYW50aWNcblxuICAgICAgICBmb3IgbWF0Y2hJbmRleCBpbiBtYXRjaGVzXG4gICAgICAgICAgbWF0Y2hJbmRleCAtPSBvZmZzZXRJbmRleFxuICAgICAgICAgIGNvbnRpbnVlIGlmIG1hdGNoSW5kZXggPCAwICMgSWYgbWFya2luZyB1cCB0aGUgYmFzZW5hbWUsIG9taXQgY29tbWFuZCBtYXRjaGVzXG4gICAgICAgICAgdW5tYXRjaGVkID0gY29tbWFuZC5zdWJzdHJpbmcobGFzdEluZGV4LCBtYXRjaEluZGV4KVxuICAgICAgICAgIGlmIHVubWF0Y2hlZFxuICAgICAgICAgICAgQHNwYW4gbWF0Y2hlZENoYXJzLmpvaW4oJycpLCBjbGFzczogJ2NoYXJhY3Rlci1tYXRjaCcgaWYgbWF0Y2hlZENoYXJzLmxlbmd0aFxuICAgICAgICAgICAgbWF0Y2hlZENoYXJzID0gW11cbiAgICAgICAgICAgIEB0ZXh0IHVubWF0Y2hlZFxuICAgICAgICAgIG1hdGNoZWRDaGFycy5wdXNoKGNvbW1hbmRbbWF0Y2hJbmRleF0pXG4gICAgICAgICAgbGFzdEluZGV4ID0gbWF0Y2hJbmRleCArIDFcblxuICAgICAgICBAc3BhbiBtYXRjaGVkQ2hhcnMuam9pbignJyksIGNsYXNzOiAnY2hhcmFjdGVyLW1hdGNoJyBpZiBtYXRjaGVkQ2hhcnMubGVuZ3RoXG4gICAgICAgICMgUmVtYWluaW5nIGNoYXJhY3RlcnMgYXJlIHBsYWluIHRleHRcbiAgICAgICAgQHRleHQgY29tbWFuZC5zdWJzdHJpbmcobGFzdEluZGV4KVxuXG4gICAgICBAbGkgY2xhc3M6ICdldmVudCcsICdkYXRhLWV2ZW50LW5hbWUnOiBuYW1lLCA9PlxuICAgICAgICBAc3BhbiB0aXRsZTogZGlzcGxheU5hbWUsIC0+IGhpZ2hsaWdodGVyKGRpc3BsYXlOYW1lLCBtYXRjaGVzLCAwKVxuXG4gIGNvbmZpcm1lZDogKGl0ZW0pIC0+XG4gICAgQHZpbVN0YXRlLmVtaXR0ZXIuZW1pdCAnZGlkLWNvbmZpcm0tc2VsZWN0LWxpc3QnLCBpdGVtXG4gICAgQGNhbmNlbCgpXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IFNlbGVjdExpc3RcbiJdfQ==
