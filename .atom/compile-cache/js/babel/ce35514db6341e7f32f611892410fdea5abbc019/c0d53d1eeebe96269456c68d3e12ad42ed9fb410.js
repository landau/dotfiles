Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _tabsSettings = require('./tabs-settings');

var _tabsSettings2 = _interopRequireDefault(_tabsSettings);

'use babel';
'use strict';

var panels = document.querySelectorAll('atom-panel-container');
var observerConfig = { childList: true };
var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function () {
        return toggleBlendTreeView(atom.config.get('atom-material-ui.treeView.blendTabs'));
    });
});

// Observe panels for DOM mutations
Array.prototype.forEach.call(panels, function (panel) {
    return observer.observe(panel, observerConfig);
});

function getTreeViews() {
    var treeViews = [document.querySelector('.tree-view-resizer'), document.querySelector('.remote-ftp-view'), (function () {
        var nuclideTreeView = document.querySelector('.nuclide-file-tree');

        if (nuclideTreeView) {
            return nuclideTreeView.closest('.nuclide-ui-panel-component');
        }
    })()];

    return treeViews;
}

function removeBlendingEl() {
    var treeViews = getTreeViews();

    treeViews.forEach(function (treeView) {
        if (treeView) {
            var blendingEl = treeView.querySelector('.tabBlender');

            if (blendingEl) {
                treeView.removeChild(blendingEl);
            }
        }
    });
}

function toggleBlendTreeView(bool) {
    var treeViews = getTreeViews();

    setImmediate(function () {
        treeViews.forEach(function (treeView) {
            if (treeView) {
                var blendingEl = document.createElement('div');
                var title = document.createElement('span');

                blendingEl.classList.add('tabBlender');
                blendingEl.appendChild(title);

                if (treeView && bool) {
                    if (treeView.querySelector('.tabBlender')) {
                        removeBlendingEl();
                    }
                    treeView.insertBefore(blendingEl, treeView.firstChild);
                } else if (treeView && !bool) {
                    removeBlendingEl();
                } else if (!treeView && bool) {
                    if (atom.packages.getActivePackage('tree-view') || atom.packages.getActivePackage('Remote-FTP') || atom.packages.getActivePackage('nuclide')) {
                        return setTimeout(function () {
                            toggleBlendTreeView(bool);
                            setImmediate(function () {
                                return _tabsSettings2['default'].apply();
                            });
                        }, 2000);
                    }
                }
            }
        });
    });
}

exports['default'] = { toggleBlendTreeView: toggleBlendTreeView };
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2F0b20tbWF0ZXJpYWwtdWkvbGliL3RyZWUtdmlldy1zZXR0aW5ncy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7NEJBR3lCLGlCQUFpQjs7OztBQUgxQyxXQUFXLENBQUM7QUFDWixZQUFZLENBQUM7O0FBSWIsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDL0QsSUFBSSxjQUFjLEdBQUcsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDekMsSUFBSSxRQUFRLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxVQUFDLFNBQVMsRUFBSztBQUNsRCxhQUFTLENBQUMsT0FBTyxDQUFDO2VBQU0sbUJBQW1CLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMscUNBQXFDLENBQUMsQ0FBQztLQUFBLENBQUMsQ0FBQztDQUNyRyxDQUFDLENBQUM7OztBQUdILEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBQyxLQUFLO1dBQUssUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsY0FBYyxDQUFDO0NBQUEsQ0FBQyxDQUFDOztBQUV6RixTQUFTLFlBQVksR0FBRztBQUNwQixRQUFJLFNBQVMsR0FBRyxDQUNaLFFBQVEsQ0FBQyxhQUFhLENBQUMsb0JBQW9CLENBQUMsRUFDNUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxFQUMxQyxDQUFDLFlBQVk7QUFDVCxZQUFJLGVBQWUsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUFDLENBQUM7O0FBRW5FLFlBQUksZUFBZSxFQUFFO0FBQ2pCLG1CQUFPLGVBQWUsQ0FBQyxPQUFPLENBQUMsNkJBQTZCLENBQUMsQ0FBQztTQUNqRTtLQUNKLENBQUEsRUFBRyxDQUNQLENBQUM7O0FBRUYsV0FBTyxTQUFTLENBQUM7Q0FDcEI7O0FBRUQsU0FBUyxnQkFBZ0IsR0FBRztBQUN4QixRQUFJLFNBQVMsR0FBRyxZQUFZLEVBQUUsQ0FBQzs7QUFFL0IsYUFBUyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFFBQVEsRUFBSztBQUM1QixZQUFJLFFBQVEsRUFBRTtBQUNWLGdCQUFJLFVBQVUsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDOztBQUV2RCxnQkFBSSxVQUFVLEVBQUU7QUFDWix3QkFBUSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUNwQztTQUNKO0tBQ0osQ0FBQyxDQUFDO0NBQ047O0FBRUQsU0FBUyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUU7QUFDL0IsUUFBSSxTQUFTLEdBQUcsWUFBWSxFQUFFLENBQUM7O0FBRS9CLGdCQUFZLENBQUMsWUFBTTtBQUNmLGlCQUFTLENBQUMsT0FBTyxDQUFDLFVBQUMsUUFBUSxFQUFLO0FBQzVCLGdCQUFJLFFBQVEsRUFBRTtBQUNWLG9CQUFJLFVBQVUsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQy9DLG9CQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUUzQywwQkFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDdkMsMEJBQVUsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRTlCLG9CQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUU7QUFDbEIsd0JBQUksUUFBUSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsRUFBRTtBQUN2Qyx3Q0FBZ0IsRUFBRSxDQUFDO3FCQUN0QjtBQUNELDRCQUFRLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7aUJBQzFELE1BQU0sSUFBSSxRQUFRLElBQUksQ0FBQyxJQUFJLEVBQUU7QUFDMUIsb0NBQWdCLEVBQUUsQ0FBQztpQkFDdEIsTUFBTSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksRUFBRTtBQUMxQix3QkFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsRUFBRTtBQUMxSSwrQkFBTyxVQUFVLENBQUMsWUFBTTtBQUNwQiwrQ0FBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMxQix3Q0FBWSxDQUFDO3VDQUFNLDBCQUFhLEtBQUssRUFBRTs2QkFBQSxDQUFDLENBQUM7eUJBQzVDLEVBQUUsSUFBSSxDQUFDLENBQUM7cUJBQ1o7aUJBQ0o7YUFDSjtTQUNKLENBQUMsQ0FBQztLQUNOLENBQUMsQ0FBQztDQUNOOztxQkFFYyxFQUFFLG1CQUFtQixFQUFuQixtQkFBbUIsRUFBRSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9hdG9tLW1hdGVyaWFsLXVpL2xpYi90cmVlLXZpZXctc2V0dGluZ3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHRhYnNTZXR0aW5ncyBmcm9tICcuL3RhYnMtc2V0dGluZ3MnO1xuXG52YXIgcGFuZWxzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnYXRvbS1wYW5lbC1jb250YWluZXInKTtcbnZhciBvYnNlcnZlckNvbmZpZyA9IHsgY2hpbGRMaXN0OiB0cnVlIH07XG52YXIgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigobXV0YXRpb25zKSA9PiB7XG5cdG11dGF0aW9ucy5mb3JFYWNoKCgpID0+IHRvZ2dsZUJsZW5kVHJlZVZpZXcoYXRvbS5jb25maWcuZ2V0KCdhdG9tLW1hdGVyaWFsLXVpLnRyZWVWaWV3LmJsZW5kVGFicycpKSk7XG59KTtcblxuLy8gT2JzZXJ2ZSBwYW5lbHMgZm9yIERPTSBtdXRhdGlvbnNcbkFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwocGFuZWxzLCAocGFuZWwpID0+IG9ic2VydmVyLm9ic2VydmUocGFuZWwsIG9ic2VydmVyQ29uZmlnKSk7XG5cbmZ1bmN0aW9uIGdldFRyZWVWaWV3cygpIHtcbiAgICB2YXIgdHJlZVZpZXdzID0gW1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudHJlZS12aWV3LXJlc2l6ZXInKSxcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnJlbW90ZS1mdHAtdmlldycpLFxuICAgICAgICAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG51Y2xpZGVUcmVlVmlldyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5udWNsaWRlLWZpbGUtdHJlZScpO1xuXG4gICAgICAgICAgICBpZiAobnVjbGlkZVRyZWVWaWV3KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51Y2xpZGVUcmVlVmlldy5jbG9zZXN0KCcubnVjbGlkZS11aS1wYW5lbC1jb21wb25lbnQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkoKVxuICAgIF07XG5cbiAgICByZXR1cm4gdHJlZVZpZXdzO1xufVxuXG5mdW5jdGlvbiByZW1vdmVCbGVuZGluZ0VsKCkge1xuICAgIHZhciB0cmVlVmlld3MgPSBnZXRUcmVlVmlld3MoKTtcblxuICAgIHRyZWVWaWV3cy5mb3JFYWNoKCh0cmVlVmlldykgPT4ge1xuICAgICAgICBpZiAodHJlZVZpZXcpIHtcbiAgICAgICAgICAgIHZhciBibGVuZGluZ0VsID0gdHJlZVZpZXcucXVlcnlTZWxlY3RvcignLnRhYkJsZW5kZXInKTtcblxuICAgICAgICAgICAgaWYgKGJsZW5kaW5nRWwpIHtcbiAgICAgICAgICAgICAgICB0cmVlVmlldy5yZW1vdmVDaGlsZChibGVuZGluZ0VsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiB0b2dnbGVCbGVuZFRyZWVWaWV3KGJvb2wpIHtcbiAgICB2YXIgdHJlZVZpZXdzID0gZ2V0VHJlZVZpZXdzKCk7XG5cbiAgICBzZXRJbW1lZGlhdGUoKCkgPT4ge1xuICAgICAgICB0cmVlVmlld3MuZm9yRWFjaCgodHJlZVZpZXcpID0+IHtcbiAgICAgICAgICAgIGlmICh0cmVlVmlldykge1xuICAgICAgICAgICAgICAgIHZhciBibGVuZGluZ0VsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgdmFyIHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuXG4gICAgICAgICAgICAgICAgYmxlbmRpbmdFbC5jbGFzc0xpc3QuYWRkKCd0YWJCbGVuZGVyJyk7XG4gICAgICAgICAgICAgICAgYmxlbmRpbmdFbC5hcHBlbmRDaGlsZCh0aXRsZSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodHJlZVZpZXcgJiYgYm9vbCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodHJlZVZpZXcucXVlcnlTZWxlY3RvcignLnRhYkJsZW5kZXInKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQmxlbmRpbmdFbCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRyZWVWaWV3Lmluc2VydEJlZm9yZShibGVuZGluZ0VsLCB0cmVlVmlldy5maXJzdENoaWxkKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRyZWVWaWV3ICYmICFib29sKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZUJsZW5kaW5nRWwoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCF0cmVlVmlldyAmJiBib29sKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdG9tLnBhY2thZ2VzLmdldEFjdGl2ZVBhY2thZ2UoJ3RyZWUtdmlldycpIHx8IGF0b20ucGFja2FnZXMuZ2V0QWN0aXZlUGFja2FnZSgnUmVtb3RlLUZUUCcpIHx8IGF0b20ucGFja2FnZXMuZ2V0QWN0aXZlUGFja2FnZSgnbnVjbGlkZScpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9nZ2xlQmxlbmRUcmVlVmlldyhib29sKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRJbW1lZGlhdGUoKCkgPT4gdGFic1NldHRpbmdzLmFwcGx5KCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMjAwMCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCB7IHRvZ2dsZUJsZW5kVHJlZVZpZXcgfTtcbiJdfQ==
//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-material-ui/lib/tree-view-settings.js
