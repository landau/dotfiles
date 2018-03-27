(function() {
  var $, $$$, DEFAULT_HEADING_TEXT, ResultView, View, clickablePaths, ref,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $ = ref.$, $$$ = ref.$$$, View = ref.View;

  clickablePaths = require('./clickable-paths');

  DEFAULT_HEADING_TEXT = 'Mocha test results';

  module.exports = ResultView = (function(superClass) {
    extend(ResultView, superClass);

    function ResultView() {
      this.resizeView = bind(this.resizeView, this);
      return ResultView.__super__.constructor.apply(this, arguments);
    }

    ResultView.content = function() {
      return this.div({
        "class": 'mocha-test-runner'
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": 'panel'
          }, function() {
            _this.div({
              outlet: 'heading',
              "class": 'heading'
            }, function() {
              _this.div({
                "class": 'pull-right'
              }, function() {
                return _this.span({
                  outlet: 'closeButton',
                  "class": 'close-icon'
                });
              });
              return _this.span({
                outlet: 'headingText'
              }, DEFAULT_HEADING_TEXT);
            });
            return _this.div({
              "class": 'panel-body'
            }, function() {
              return _this.pre({
                outlet: 'results',
                "class": 'results'
              });
            });
          });
        };
      })(this));
    };

    ResultView.prototype.initialize = function(state) {
      var height;
      height = state != null ? state.height : void 0;
      this.openHeight = Math.max(140, state != null ? state.openHeight : void 0, height);
      this.height(height);
      this.heading.on('dblclick', (function(_this) {
        return function() {
          return _this.toggleCollapse();
        };
      })(this));
      this.closeButton.on('click', (function(_this) {
        return function() {
          return atom.commands.dispatch(_this, 'result-view:close');
        };
      })(this));
      this.heading.on('mousedown', (function(_this) {
        return function(e) {
          return _this.resizeStarted(e);
        };
      })(this));
      this.results.addClass('native-key-bindings');
      this.results.attr('tabindex', -1);
      return clickablePaths.attachClickHandler();
    };

    ResultView.prototype.serialize = function() {
      return {
        height: this.height(),
        openHeight: this.openHeight
      };
    };

    ResultView.prototype.destroy = function() {
      return clickablePaths.removeClickHandler();
    };

    ResultView.prototype.resizeStarted = function(arg) {
      var pageY;
      pageY = arg.pageY;
      this.resizeData = {
        pageY: pageY,
        height: this.height()
      };
      $(document.body).on('mousemove', this.resizeView);
      return $(document.body).one('mouseup', this.resizeStopped.bind(this));
    };

    ResultView.prototype.resizeStopped = function() {
      var currentHeight;
      $(document.body).off('mousemove', this.resizeView);
      currentHeight = this.height();
      if (currentHeight > this.heading.outerHeight()) {
        return this.openHeight = currentHeight;
      }
    };

    ResultView.prototype.resizeView = function(arg) {
      var headingHeight, pageY;
      pageY = arg.pageY;
      headingHeight = this.heading.outerHeight();
      this.height(Math.max(this.resizeData.height + this.resizeData.pageY - pageY, headingHeight));
      return this.updateResultPanelHeight();
    };

    ResultView.prototype.reset = function() {
      this.heading.removeClass('alert-success alert-danger');
      this.heading.addClass('alert-info');
      this.headingText.html(DEFAULT_HEADING_TEXT + "...");
      return this.results.empty();
    };

    ResultView.prototype.updateResultPanelHeight = function() {
      var panelBody;
      panelBody = this.find('.panel-body');
      return panelBody.height(this.height() - this.heading.outerHeight());
    };

    ResultView.prototype.addLine = function(line) {
      if (line !== '\n') {
        return this.results.append(line);
      }
    };

    ResultView.prototype.success = function(stats) {
      this.heading.removeClass('alert-info');
      this.heading.addClass('alert-success');
      return this.updateResultPanelHeight();
    };

    ResultView.prototype.failure = function(stats) {
      this.heading.removeClass('alert-info');
      this.heading.addClass('alert-danger');
      return this.updateResultPanelHeight();
    };

    ResultView.prototype.updateSummary = function(stats) {
      if (!(stats != null ? stats.length : void 0)) {
        return;
      }
      return this.headingText.html(DEFAULT_HEADING_TEXT + ": " + (stats.join(', ')));
    };

    ResultView.prototype.toggleCollapse = function() {
      var headingHeight, viewHeight;
      headingHeight = this.heading.outerHeight();
      viewHeight = this.height();
      if (!(headingHeight > 0)) {
        return;
      }
      if (viewHeight > headingHeight) {
        this.openHeight = viewHeight;
        return this.height(headingHeight);
      } else {
        return this.height(this.openHeight);
      }
    };

    return ResultView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvbW9jaGEtdGVzdC1ydW5uZXIvbGliL3Jlc3VsdC12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsbUVBQUE7SUFBQTs7OztFQUFBLE1BQWlCLE9BQUEsQ0FBUSxzQkFBUixDQUFqQixFQUFDLFNBQUQsRUFBSSxhQUFKLEVBQVM7O0VBQ1QsY0FBQSxHQUFpQixPQUFBLENBQVEsbUJBQVI7O0VBRWpCLG9CQUFBLEdBQXVCOztFQUV2QixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7OztJQUVKLFVBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7UUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLG1CQUFQO09BQUwsRUFBaUMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUMvQixLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxPQUFQO1dBQUwsRUFBcUIsU0FBQTtZQUNuQixLQUFDLENBQUEsR0FBRCxDQUFLO2NBQUEsTUFBQSxFQUFRLFNBQVI7Y0FBbUIsQ0FBQSxLQUFBLENBQUEsRUFBTyxTQUExQjthQUFMLEVBQTBDLFNBQUE7Y0FDeEMsS0FBQyxDQUFBLEdBQUQsQ0FBSztnQkFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFlBQVA7ZUFBTCxFQUEwQixTQUFBO3VCQUN4QixLQUFDLENBQUEsSUFBRCxDQUFNO2tCQUFBLE1BQUEsRUFBUSxhQUFSO2tCQUF1QixDQUFBLEtBQUEsQ0FBQSxFQUFPLFlBQTlCO2lCQUFOO2NBRHdCLENBQTFCO3FCQUVBLEtBQUMsQ0FBQSxJQUFELENBQU07Z0JBQUEsTUFBQSxFQUFRLGFBQVI7ZUFBTixFQUE2QixvQkFBN0I7WUFId0MsQ0FBMUM7bUJBSUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztjQUFBLENBQUEsS0FBQSxD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QyxLQUFEO01BQ2IsSUFBQSxrQkFBYyxLQUFLLENBQUUsZ0JBQXJCO0FBQUEsZUFBQTs7YUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLElBQWIsQ0FBcUIsb0JBQUQsR0FBc0IsSUFBdEIsR0FBeUIsQ0FBQyxLQUFLLENBQUMsSUFBTixDQUFXLElBQVgsQ0FBRCxDQUE3QztJQUZhOzt5QkFJZixjQUFBLEdBQWdCLFNBQUE7QUFDZCxVQUFBO01BQUEsYUFBQSxHQUFnQixJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsQ0FBQTtNQUNoQixVQUFBLEdBQWEsSUFBQyxDQUFBLE1BQUQsQ0FBQTtNQUViLElBQUEsQ0FBQSxDQUFjLGFBQUEsR0FBZ0IsQ0FBOUIsQ0FBQTtBQUFBLGVBQUE7O01BRUEsSUFBRyxVQUFBLEdBQWEsYUFBaEI7UUFDRSxJQUFDLENBQUEsVUFBRCxHQUFjO2VBQ2QsSUFBQyxDQUFBLE1BQUQsQ0FBUSxhQUFSLEVBRkY7T0FBQSxNQUFBO2VBSUUsSUFBQyxDQUFBLE1BQUQsQ0FBUSxJQUFDLENBQUEsVUFBVCxFQUpGOztJQU5jOzs7O0tBL0VPO0FBTnpCIiwic291cmNlc0NvbnRlbnQiOlsieyQsICQkJCwgVmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcbmNsaWNrYWJsZVBhdGhzID0gcmVxdWlyZSAnLi9jbGlja2FibGUtcGF0aHMnXG5cbkRFRkFVTFRfSEVBRElOR19URVhUID0gJ01vY2hhIHRlc3QgcmVzdWx0cydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgUmVzdWx0VmlldyBleHRlbmRzIFZpZXdcblxuICBAY29udGVudDogLT5cbiAgICBAZGl2IGNsYXNzOiAnbW9jaGEtdGVzdC1ydW5uZXInLCA9PlxuICAgICAgQGRpdiBjbGFzczogJ3BhbmVsJywgPT5cbiAgICAgICAgQGRpdiBvdXRsZXQ6ICdoZWFkaW5nJywgY2xhc3M6ICdoZWFkaW5nJywgPT5cbiAgICAgICAgICBAZGl2IGNsYXNzOiAncHVsbC1yaWdodCcsID0+XG4gICAgICAgICAgICBAc3BhbiBvdXRsZXQ6ICdjbG9zZUJ1dHRvbicsIGNsYXNzOiAnY2xvc2UtaWNvbidcbiAgICAgICAgICBAc3BhbiBvdXRsZXQ6ICdoZWFkaW5nVGV4dCcsIERFRkFVTFRfSEVBRElOR19URVhUXG4gICAgICAgIEBkaXYgY2xhc3M6ICdwYW5lbC1ib2R5JywgPT5cbiAgICAgICAgICBAcHJlIG91dGxldDogJ3Jlc3VsdHMnLCBjbGFzczogJ3Jlc3VsdHMnXG5cbiAgaW5pdGlhbGl6ZTogKHN0YXRlKSAtPlxuICAgIGhlaWdodCA9IHN0YXRlPy5oZWlnaHRcbiAgICBAb3BlbkhlaWdodCA9IE1hdGgubWF4KDE0MCxzdGF0ZT8ub3BlbkhlaWdodCxoZWlnaHQpXG4gICAgQGhlaWdodCBoZWlnaHRcblxuICAgIEBoZWFkaW5nLm9uICdkYmxjbGljaycsID0+IEB0b2dnbGVDb2xsYXBzZSgpXG4gICAgQGNsb3NlQnV0dG9uLm9uICdjbGljaycsID0+IGF0b20uY29tbWFuZHMuZGlzcGF0Y2ggdGhpcywgJ3Jlc3VsdC12aWV3OmNsb3NlJ1xuICAgIEBoZWFkaW5nLm9uICdtb3VzZWRvd24nLCAoZSkgPT4gQHJlc2l6ZVN0YXJ0ZWQgZVxuICAgIEByZXN1bHRzLmFkZENsYXNzICduYXRpdmUta2V5LWJpbmRpbmdzJ1xuICAgIEByZXN1bHRzLmF0dHIgJ3RhYmluZGV4JywgLTFcblxuICAgIGNsaWNrYWJsZVBhdGhzLmF0dGFjaENsaWNrSGFuZGxlcigpXG5cbiAgc2VyaWFsaXplOiAtPlxuICAgIGhlaWdodDogQGhlaWdodCgpXG4gICAgb3BlbkhlaWdodDogQG9wZW5IZWlnaHRcblxuICBkZXN0cm95OiAtPlxuICAgIGNsaWNrYWJsZVBhdGhzLnJlbW92ZUNsaWNrSGFuZGxlcigpXG5cbiAgcmVzaXplU3RhcnRlZDogKHtwYWdlWX0pIC0+XG4gICAgQHJlc2l6ZURhdGEgPVxuICAgICAgcGFnZVk6IHBhZ2VZXG4gICAgICBoZWlnaHQ6IEBoZWlnaHQoKVxuICAgICQoZG9jdW1lbnQuYm9keSkub24gJ21vdXNlbW92ZScsIEByZXNpemVWaWV3XG4gICAgJChkb2N1bWVudC5ib2R5KS5vbmUgJ21vdXNldXAnLCBAcmVzaXplU3RvcHBlZC5iaW5kKHRoaXMpXG5cbiAgcmVzaXplU3RvcHBlZDogLT5cbiAgICAkKGRvY3VtZW50LmJvZHkpLm9mZiAnbW91c2Vtb3ZlJywgQHJlc2l6ZVZpZXdcblxuICAgIGN1cnJlbnRIZWlnaHQgPSBAaGVpZ2h0KClcbiAgICBpZiBjdXJyZW50SGVpZ2h0ID4gQGhlYWRpbmcub3V0ZXJIZWlnaHQoKVxuICAgICAgQG9wZW5IZWlnaHQgPSBjdXJyZW50SGVpZ2h0XG5cbiAgcmVzaXplVmlldzogKHtwYWdlWX0pID0+XG4gICAgaGVhZGluZ0hlaWdodCA9ICBAaGVhZGluZy5vdXRlckhlaWdodCgpXG4gICAgQGhlaWdodCBNYXRoLm1heChAcmVzaXplRGF0YS5oZWlnaHQgKyBAcmVzaXplRGF0YS5wYWdlWSAtIHBhZ2VZLGhlYWRpbmdIZWlnaHQpXG4gICAgQHVwZGF0ZVJlc3VsdFBhbmVsSGVpZ2h0KClcblxuICByZXNldDogLT5cbiAgICBAaGVhZGluZy5yZW1vdmVDbGFzcyAnYWxlcnQtc3VjY2VzcyBhbGVydC1kYW5nZXInXG4gICAgQGhlYWRpbmcuYWRkQ2xhc3MgJ2FsZXJ0LWluZm8nXG4gICAgQGhlYWRpbmdUZXh0Lmh0bWwgXCIje0RFRkFVTFRfSEVBRElOR19URVhUfS4uLlwiXG4gICAgQHJlc3VsdHMuZW1wdHkoKVxuXG4gIHVwZGF0ZVJlc3VsdFBhbmVsSGVpZ2h0OiAtPlxuICAgIHBhbmVsQm9keSA9IEBmaW5kICcucGFuZWwtYm9keSdcbiAgICBwYW5lbEJvZHkuaGVpZ2h0IChAaGVpZ2h0KCkgLSBAaGVhZGluZy5vdXRlckhlaWdodCgpKVxuXG4gIGFkZExpbmU6IChsaW5lKSAtPlxuICAgIGlmIGxpbmUgaXNudCAnXFxuJ1xuICAgICAgQHJlc3VsdHMuYXBwZW5kIGxpbmVcblxuICBzdWNjZXNzOiAoc3RhdHMpIC0+XG4gICAgQGhlYWRpbmcucmVtb3ZlQ2xhc3MgJ2FsZXJ0LWluZm8nXG4gICAgQGhlYWRpbmcuYWRkQ2xhc3MgJ2FsZXJ0LXN1Y2Nlc3MnXG4gICAgQHVwZGF0ZVJlc3VsdFBhbmVsSGVpZ2h0KClcblxuICBmYWlsdXJlOiAoc3RhdHMpIC0+XG4gICAgQGhlYWRpbmcucmVtb3ZlQ2xhc3MgJ2FsZXJ0LWluZm8nXG4gICAgQGhlYWRpbmcuYWRkQ2xhc3MgJ2FsZXJ0LWRhbmdlcidcbiAgICBAdXBkYXRlUmVzdWx0UGFuZWxIZWlnaHQoKVxuXG4gIHVwZGF0ZVN1bW1hcnk6IChzdGF0cykgLT5cbiAgICByZXR1cm4gdW5sZXNzIHN0YXRzPy5sZW5ndGhcbiAgICBAaGVhZGluZ1RleHQuaHRtbCBcIiN7REVGQVVMVF9IRUFESU5HX1RFWFR9OiAje3N0YXRzLmpvaW4oJywgJyl9XCJcblxuICB0b2dnbGVDb2xsYXBzZTogLT5cbiAgICBoZWFkaW5nSGVpZ2h0ID0gQGhlYWRpbmcub3V0ZXJIZWlnaHQoKVxuICAgIHZpZXdIZWlnaHQgPSBAaGVpZ2h0KClcblxuICAgIHJldHVybiB1bmxlc3MgaGVhZGluZ0hlaWdodCA+IDBcblxuICAgIGlmIHZpZXdIZWlnaHQgPiBoZWFkaW5nSGVpZ2h0XG4gICAgICBAb3BlbkhlaWdodCA9IHZpZXdIZWlnaHRcbiAgICAgIEBoZWlnaHQoaGVhZGluZ0hlaWdodClcbiAgICBlbHNlXG4gICAgICBAaGVpZ2h0IEBvcGVuSGVpZ2h0XG4iXX0=
