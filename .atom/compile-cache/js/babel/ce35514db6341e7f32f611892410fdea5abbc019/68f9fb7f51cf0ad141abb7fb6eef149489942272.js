'use babel';
'use strict';

var _this = this;

describe('AMU ui options', function () {
    beforeEach(function () {
        _this.workspace = atom.views.getView(atom.workspace);
        jasmine.attachToDOM(_this.workspace);

        waitsForPromise('Theme Activation', function () {
            return atom.packages.activatePackage('atom-material-ui');
        });
    });

    it('should be able to cast shadows', function () {
        atom.config.set('atom-material-ui.ui.panelShadows', false);
        expect(_this.workspace.classList.contains('panel-shadows')).toBe(false);

        atom.config.set('atom-material-ui.ui.panelShadows', true);
        expect(_this.workspace.classList.contains('panel-shadows')).toBe(true);
    });

    it('should be able to add contrast to panels', function () {
        atom.config.set('atom-material-ui.ui.panelContrast', false);
        expect(_this.workspace.classList.contains('panel-contrast')).toBe(false);

        atom.config.set('atom-material-ui.ui.panelContrast', true);
        expect(_this.workspace.classList.contains('panel-contrast')).toBe(true);
    });

    it('should be able to toggle animations', function () {
        atom.config.set('atom-material-ui.ui.animations', false);
        expect(_this.workspace.classList.contains('use-animations')).toBe(false);

        atom.config.set('atom-material-ui.ui.animations', true);
        expect(_this.workspace.classList.contains('use-animations')).toBe(true);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2F0b20tbWF0ZXJpYWwtdWkvc3BlYy9zZXR0aW5ncy11aS1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQztBQUNaLFlBQVksQ0FBQzs7OztBQUViLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxZQUFNO0FBQzdCLGNBQVUsQ0FBQyxZQUFNO0FBQ2IsY0FBSyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3BELGVBQU8sQ0FBQyxXQUFXLENBQUMsTUFBSyxTQUFTLENBQUMsQ0FBQzs7QUFFcEMsdUJBQWUsQ0FBQyxrQkFBa0IsRUFBRSxZQUFNO0FBQ3RDLG1CQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLGtCQUFrQixDQUFDLENBQUM7U0FDNUQsQ0FBQyxDQUFDO0tBQ04sQ0FBQyxDQUFDOztBQUVILE1BQUUsQ0FBQyxnQ0FBZ0MsRUFBRSxZQUFNO0FBQ3ZDLFlBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGtDQUFrQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzNELGNBQU0sQ0FBQyxNQUFLLFNBQVMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUV2RSxZQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxrQ0FBa0MsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMxRCxjQUFNLENBQUMsTUFBSyxTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUN6RSxDQUFDLENBQUM7O0FBRUgsTUFBRSxDQUFDLDBDQUEwQyxFQUFFLFlBQU07QUFDakQsWUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsbUNBQW1DLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDNUQsY0FBTSxDQUFDLE1BQUssU0FBUyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFeEUsWUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsbUNBQW1DLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDM0QsY0FBTSxDQUFDLE1BQUssU0FBUyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUMxRSxDQUFDLENBQUM7O0FBRUgsTUFBRSxDQUFDLHFDQUFxQyxFQUFFLFlBQU07QUFDNUMsWUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDekQsY0FBTSxDQUFDLE1BQUssU0FBUyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFeEUsWUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDeEQsY0FBTSxDQUFDLE1BQUssU0FBUyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUMxRSxDQUFDLENBQUM7Q0FDTixDQUFDLENBQUMiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1tYXRlcmlhbC11aS9zcGVjL3NldHRpbmdzLXVpLXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbid1c2Ugc3RyaWN0JztcblxuZGVzY3JpYmUoJ0FNVSB1aSBvcHRpb25zJywgKCkgPT4ge1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICB0aGlzLndvcmtzcGFjZSA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSk7XG4gICAgICAgIGphc21pbmUuYXR0YWNoVG9ET00odGhpcy53b3Jrc3BhY2UpO1xuXG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSgnVGhlbWUgQWN0aXZhdGlvbicsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnYXRvbS1tYXRlcmlhbC11aScpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgYmUgYWJsZSB0byBjYXN0IHNoYWRvd3MnLCAoKSA9PiB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnYXRvbS1tYXRlcmlhbC11aS51aS5wYW5lbFNoYWRvd3MnLCBmYWxzZSk7XG4gICAgICAgIGV4cGVjdCh0aGlzLndvcmtzcGFjZS5jbGFzc0xpc3QuY29udGFpbnMoJ3BhbmVsLXNoYWRvd3MnKSkudG9CZShmYWxzZSk7XG5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdhdG9tLW1hdGVyaWFsLXVpLnVpLnBhbmVsU2hhZG93cycsIHRydWUpO1xuICAgICAgICBleHBlY3QodGhpcy53b3Jrc3BhY2UuY2xhc3NMaXN0LmNvbnRhaW5zKCdwYW5lbC1zaGFkb3dzJykpLnRvQmUodHJ1ZSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGJlIGFibGUgdG8gYWRkIGNvbnRyYXN0IHRvIHBhbmVscycsICgpID0+IHtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdhdG9tLW1hdGVyaWFsLXVpLnVpLnBhbmVsQ29udHJhc3QnLCBmYWxzZSk7XG4gICAgICAgIGV4cGVjdCh0aGlzLndvcmtzcGFjZS5jbGFzc0xpc3QuY29udGFpbnMoJ3BhbmVsLWNvbnRyYXN0JykpLnRvQmUoZmFsc2UpO1xuXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnYXRvbS1tYXRlcmlhbC11aS51aS5wYW5lbENvbnRyYXN0JywgdHJ1ZSk7XG4gICAgICAgIGV4cGVjdCh0aGlzLndvcmtzcGFjZS5jbGFzc0xpc3QuY29udGFpbnMoJ3BhbmVsLWNvbnRyYXN0JykpLnRvQmUodHJ1ZSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGJlIGFibGUgdG8gdG9nZ2xlIGFuaW1hdGlvbnMnLCAoKSA9PiB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnYXRvbS1tYXRlcmlhbC11aS51aS5hbmltYXRpb25zJywgZmFsc2UpO1xuICAgICAgICBleHBlY3QodGhpcy53b3Jrc3BhY2UuY2xhc3NMaXN0LmNvbnRhaW5zKCd1c2UtYW5pbWF0aW9ucycpKS50b0JlKGZhbHNlKTtcblxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F0b20tbWF0ZXJpYWwtdWkudWkuYW5pbWF0aW9ucycsIHRydWUpO1xuICAgICAgICBleHBlY3QodGhpcy53b3Jrc3BhY2UuY2xhc3NMaXN0LmNvbnRhaW5zKCd1c2UtYW5pbWF0aW9ucycpKS50b0JlKHRydWUpO1xuICAgIH0pO1xufSk7XG4iXX0=
//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-material-ui/spec/settings-ui-spec.js
