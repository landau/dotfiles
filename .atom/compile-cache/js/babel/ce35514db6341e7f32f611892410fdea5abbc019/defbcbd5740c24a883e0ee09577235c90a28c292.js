'use babel';
'use strict';

var _this = this;

describe('AMU tree-view options', function () {
    beforeEach(function () {
        waitsForPromise('Theme Activation', function () {
            return atom.packages.activatePackage('atom-material-ui');
        });
        waitsForPromise('tree-view activation', function () {
            return atom.packages.activatePackage('tree-view');
        });

        _this.workspace = atom.views.getView(atom.workspace);
        jasmine.attachToDOM(_this.workspace);
    });

    it('should be able to toggle compact tree view items', function () {
        atom.config.set('atom-material-ui.treeView.compactList', false);
        expect(_this.workspace.classList.contains('compact-tree-view')).toBe(false);

        atom.config.set('atom-material-ui.treeView.compactList', true);
        expect(_this.workspace.classList.contains('compact-tree-view')).toBe(true);
    });

    // FIXME: Should pass this test.
    // it('should be able to blend with tab-bar', () => {
    //     atom.config.set('atom-material-ui.treeView.blendTabs', false);
    //     expect(document.querySelector('.tabBlender')).toBe(null);
    //
    //     atom.config.set('atom-material-ui.treeView.blendTabs', true);
    //     expect(document.querySelector('.tabBlender')).not.toBe(null);
    // });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2F0b20tbWF0ZXJpYWwtdWkvc3BlYy9zZXR0aW5ncy10cmVldmlldy1zcGVjLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQztBQUNaLFlBQVksQ0FBQzs7OztBQUViLFFBQVEsQ0FBQyx1QkFBdUIsRUFBRSxZQUFNO0FBQ3BDLGNBQVUsQ0FBQyxZQUFNO0FBQ2IsdUJBQWUsQ0FBQyxrQkFBa0IsRUFBRSxZQUFNO0FBQ3RDLG1CQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLGtCQUFrQixDQUFDLENBQUM7U0FDNUQsQ0FBQyxDQUFDO0FBQ0gsdUJBQWUsQ0FBQyxzQkFBc0IsRUFBRSxZQUFNO0FBQzFDLG1CQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQ3JELENBQUMsQ0FBQzs7QUFFSCxjQUFLLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDcEQsZUFBTyxDQUFDLFdBQVcsQ0FBQyxNQUFLLFNBQVMsQ0FBQyxDQUFDO0tBQ3ZDLENBQUMsQ0FBQzs7QUFFSCxNQUFFLENBQUMsa0RBQWtELEVBQUUsWUFBTTtBQUN6RCxZQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx1Q0FBdUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNoRSxjQUFNLENBQUMsTUFBSyxTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUUzRSxZQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyx1Q0FBdUMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMvRCxjQUFNLENBQUMsTUFBSyxTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQzdFLENBQUMsQ0FBQzs7Ozs7Ozs7OztDQVVOLENBQUMsQ0FBQyIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9hdG9tLW1hdGVyaWFsLXVpL3NwZWMvc2V0dGluZ3MtdHJlZXZpZXctc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuJ3VzZSBzdHJpY3QnO1xuXG5kZXNjcmliZSgnQU1VIHRyZWUtdmlldyBvcHRpb25zJywgKCkgPT4ge1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICB3YWl0c0ZvclByb21pc2UoJ1RoZW1lIEFjdGl2YXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2F0b20tbWF0ZXJpYWwtdWknKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHdhaXRzRm9yUHJvbWlzZSgndHJlZS12aWV3IGFjdGl2YXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ3RyZWUtdmlldycpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLndvcmtzcGFjZSA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSk7XG4gICAgICAgIGphc21pbmUuYXR0YWNoVG9ET00odGhpcy53b3Jrc3BhY2UpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBiZSBhYmxlIHRvIHRvZ2dsZSBjb21wYWN0IHRyZWUgdmlldyBpdGVtcycsICgpID0+IHtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdhdG9tLW1hdGVyaWFsLXVpLnRyZWVWaWV3LmNvbXBhY3RMaXN0JywgZmFsc2UpO1xuICAgICAgICBleHBlY3QodGhpcy53b3Jrc3BhY2UuY2xhc3NMaXN0LmNvbnRhaW5zKCdjb21wYWN0LXRyZWUtdmlldycpKS50b0JlKGZhbHNlKTtcblxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2F0b20tbWF0ZXJpYWwtdWkudHJlZVZpZXcuY29tcGFjdExpc3QnLCB0cnVlKTtcbiAgICAgICAgZXhwZWN0KHRoaXMud29ya3NwYWNlLmNsYXNzTGlzdC5jb250YWlucygnY29tcGFjdC10cmVlLXZpZXcnKSkudG9CZSh0cnVlKTtcbiAgICB9KTtcblxuICAgIC8vIEZJWE1FOiBTaG91bGQgcGFzcyB0aGlzIHRlc3QuXG4gICAgLy8gaXQoJ3Nob3VsZCBiZSBhYmxlIHRvIGJsZW5kIHdpdGggdGFiLWJhcicsICgpID0+IHtcbiAgICAvLyAgICAgYXRvbS5jb25maWcuc2V0KCdhdG9tLW1hdGVyaWFsLXVpLnRyZWVWaWV3LmJsZW5kVGFicycsIGZhbHNlKTtcbiAgICAvLyAgICAgZXhwZWN0KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy50YWJCbGVuZGVyJykpLnRvQmUobnVsbCk7XG4gICAgLy9cbiAgICAvLyAgICAgYXRvbS5jb25maWcuc2V0KCdhdG9tLW1hdGVyaWFsLXVpLnRyZWVWaWV3LmJsZW5kVGFicycsIHRydWUpO1xuICAgIC8vICAgICBleHBlY3QoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRhYkJsZW5kZXInKSkubm90LnRvQmUobnVsbCk7XG4gICAgLy8gfSk7XG59KTtcbiJdfQ==
//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-material-ui/spec/settings-treeview-spec.js
