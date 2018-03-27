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
    var treeViews = [document.querySelector('.tree-view-resizer:not(.nuclide-ui-panel-component)'), document.querySelector('.remote-ftp-view'), (function () {
        var nuclideTreeView = document.querySelector('.nuclide-file-tree-toolbar-container');

        if (nuclideTreeView) {
            return nuclideTreeView.closest('div[style*="display: flex;"]');
        }
    })()];

    return treeViews;
}

function removeBlendingEl(treeView) {

    if (treeView) {
        var blendingEl = treeView.querySelector('.tabBlender');

        if (blendingEl) {
            treeView.removeChild(blendingEl);
        }
    }
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
                        removeBlendingEl(treeView);
                    }
                    treeView.insertBefore(blendingEl, treeView.firstChild);
                } else if (treeView && !bool) {
                    removeBlendingEl(treeView);
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

atom.packages.onDidActivatePackage(function (pkg) {
    if (pkg.name === 'nuclide-file-tree') {
        toggleBlendTreeView(atom.config.get('atom-material-ui.treeView.blendTabs'));
    }
});

exports['default'] = { toggleBlendTreeView: toggleBlendTreeView };
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2F0b20tbWF0ZXJpYWwtdWkvbGliL3RyZWUtdmlldy1zZXR0aW5ncy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7NEJBR3lCLGlCQUFpQjs7OztBQUgxQyxXQUFXLENBQUM7QUFDWixZQUFZLENBQUM7O0FBSWIsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixDQUFDLENBQUM7QUFDL0QsSUFBSSxjQUFjLEdBQUcsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDekMsSUFBSSxRQUFRLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxVQUFDLFNBQVMsRUFBSztBQUNsRCxhQUFTLENBQUMsT0FBTyxDQUFDO2VBQU0sbUJBQW1CLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMscUNBQXFDLENBQUMsQ0FBQztLQUFBLENBQUMsQ0FBQztDQUNyRyxDQUFDLENBQUM7OztBQUdILEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsVUFBQyxLQUFLO1dBQUssUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsY0FBYyxDQUFDO0NBQUEsQ0FBQyxDQUFDOztBQUV6RixTQUFTLFlBQVksR0FBRztBQUNwQixRQUFJLFNBQVMsR0FBRyxDQUNaLFFBQVEsQ0FBQyxhQUFhLENBQUMscURBQXFELENBQUMsRUFDN0UsUUFBUSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxFQUMxQyxDQUFDLFlBQVk7QUFDVCxZQUFJLGVBQWUsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLHNDQUFzQyxDQUFDLENBQUM7O0FBRXJGLFlBQUksZUFBZSxFQUFFO0FBQ2pCLG1CQUFPLGVBQWUsQ0FBQyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQztTQUNsRTtLQUNKLENBQUEsRUFBRyxDQUNQLENBQUM7O0FBRUYsV0FBTyxTQUFTLENBQUM7Q0FDcEI7O0FBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUU7O0FBRWhDLFFBQUksUUFBUSxFQUFFO0FBQ1YsWUFBSSxVQUFVLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBQzs7QUFFdkQsWUFBSSxVQUFVLEVBQUU7QUFDWixvQkFBUSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUNwQztLQUNKO0NBRUo7O0FBRUQsU0FBUyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUU7QUFDL0IsUUFBSSxTQUFTLEdBQUcsWUFBWSxFQUFFLENBQUM7O0FBRS9CLGdCQUFZLENBQUMsWUFBTTtBQUNmLGlCQUFTLENBQUMsT0FBTyxDQUFDLFVBQUMsUUFBUSxFQUFLO0FBQzVCLGdCQUFJLFFBQVEsRUFBRTtBQUNWLG9CQUFJLFVBQVUsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQy9DLG9CQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUUzQywwQkFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDdkMsMEJBQVUsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRTlCLG9CQUFJLFFBQVEsSUFBSSxJQUFJLEVBQUU7QUFDbEIsd0JBQUksUUFBUSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsRUFBRTtBQUN2Qyx3Q0FBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztxQkFDOUI7QUFDRCw0QkFBUSxDQUFDLFlBQVksQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2lCQUMxRCxNQUFNLElBQUksUUFBUSxJQUFJLENBQUMsSUFBSSxFQUFFO0FBQzFCLG9DQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUM5QixNQUFNLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxFQUFFO0FBQzFCLHdCQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxFQUFFO0FBQzFJLCtCQUFPLFVBQVUsQ0FBQyxZQUFNO0FBQ3BCLCtDQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzFCLHdDQUFZLENBQUM7dUNBQU0sMEJBQWEsS0FBSyxFQUFFOzZCQUFBLENBQUMsQ0FBQzt5QkFDNUMsRUFBRSxJQUFJLENBQUMsQ0FBQztxQkFDWjtpQkFDSjthQUNKO1NBQ0osQ0FBQyxDQUFDO0tBQ04sQ0FBQyxDQUFDO0NBQ047O0FBRUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxVQUFDLEdBQUcsRUFBSztBQUN4QyxRQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssbUJBQW1CLEVBQUU7QUFDbEMsMkJBQW1CLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMscUNBQXFDLENBQUMsQ0FBQyxDQUFDO0tBQy9FO0NBQ0osQ0FBQyxDQUFDOztxQkFFWSxFQUFFLG1CQUFtQixFQUFuQixtQkFBbUIsRUFBRSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9hdG9tLW1hdGVyaWFsLXVpL2xpYi90cmVlLXZpZXctc2V0dGluZ3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHRhYnNTZXR0aW5ncyBmcm9tICcuL3RhYnMtc2V0dGluZ3MnO1xuXG52YXIgcGFuZWxzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnYXRvbS1wYW5lbC1jb250YWluZXInKTtcbnZhciBvYnNlcnZlckNvbmZpZyA9IHsgY2hpbGRMaXN0OiB0cnVlIH07XG52YXIgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigobXV0YXRpb25zKSA9PiB7XG5cdG11dGF0aW9ucy5mb3JFYWNoKCgpID0+IHRvZ2dsZUJsZW5kVHJlZVZpZXcoYXRvbS5jb25maWcuZ2V0KCdhdG9tLW1hdGVyaWFsLXVpLnRyZWVWaWV3LmJsZW5kVGFicycpKSk7XG59KTtcblxuLy8gT2JzZXJ2ZSBwYW5lbHMgZm9yIERPTSBtdXRhdGlvbnNcbkFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwocGFuZWxzLCAocGFuZWwpID0+IG9ic2VydmVyLm9ic2VydmUocGFuZWwsIG9ic2VydmVyQ29uZmlnKSk7XG5cbmZ1bmN0aW9uIGdldFRyZWVWaWV3cygpIHtcbiAgICB2YXIgdHJlZVZpZXdzID0gW1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudHJlZS12aWV3LXJlc2l6ZXI6bm90KC5udWNsaWRlLXVpLXBhbmVsLWNvbXBvbmVudCknKSxcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnJlbW90ZS1mdHAtdmlldycpLFxuICAgICAgICAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG51Y2xpZGVUcmVlVmlldyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5udWNsaWRlLWZpbGUtdHJlZS10b29sYmFyLWNvbnRhaW5lcicpO1xuXG4gICAgICAgICAgICBpZiAobnVjbGlkZVRyZWVWaWV3KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51Y2xpZGVUcmVlVmlldy5jbG9zZXN0KCdkaXZbc3R5bGUqPVwiZGlzcGxheTogZmxleDtcIl0nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkoKVxuICAgIF07XG5cbiAgICByZXR1cm4gdHJlZVZpZXdzO1xufVxuXG5mdW5jdGlvbiByZW1vdmVCbGVuZGluZ0VsKHRyZWVWaWV3KSB7XG5cbiAgICBpZiAodHJlZVZpZXcpIHtcbiAgICAgICAgdmFyIGJsZW5kaW5nRWwgPSB0cmVlVmlldy5xdWVyeVNlbGVjdG9yKCcudGFiQmxlbmRlcicpO1xuXG4gICAgICAgIGlmIChibGVuZGluZ0VsKSB7XG4gICAgICAgICAgICB0cmVlVmlldy5yZW1vdmVDaGlsZChibGVuZGluZ0VsKTtcbiAgICAgICAgfVxuICAgIH1cblxufVxuXG5mdW5jdGlvbiB0b2dnbGVCbGVuZFRyZWVWaWV3KGJvb2wpIHtcbiAgICB2YXIgdHJlZVZpZXdzID0gZ2V0VHJlZVZpZXdzKCk7XG5cbiAgICBzZXRJbW1lZGlhdGUoKCkgPT4ge1xuICAgICAgICB0cmVlVmlld3MuZm9yRWFjaCgodHJlZVZpZXcpID0+IHtcbiAgICAgICAgICAgIGlmICh0cmVlVmlldykge1xuICAgICAgICAgICAgICAgIHZhciBibGVuZGluZ0VsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgdmFyIHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuXG4gICAgICAgICAgICAgICAgYmxlbmRpbmdFbC5jbGFzc0xpc3QuYWRkKCd0YWJCbGVuZGVyJyk7XG4gICAgICAgICAgICAgICAgYmxlbmRpbmdFbC5hcHBlbmRDaGlsZCh0aXRsZSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodHJlZVZpZXcgJiYgYm9vbCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodHJlZVZpZXcucXVlcnlTZWxlY3RvcignLnRhYkJsZW5kZXInKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQmxlbmRpbmdFbCh0cmVlVmlldyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdHJlZVZpZXcuaW5zZXJ0QmVmb3JlKGJsZW5kaW5nRWwsIHRyZWVWaWV3LmZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHJlZVZpZXcgJiYgIWJvb2wpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQmxlbmRpbmdFbCh0cmVlVmlldyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghdHJlZVZpZXcgJiYgYm9vbCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKCd0cmVlLXZpZXcnKSB8fCBhdG9tLnBhY2thZ2VzLmdldEFjdGl2ZVBhY2thZ2UoJ1JlbW90ZS1GVFAnKSB8fCBhdG9tLnBhY2thZ2VzLmdldEFjdGl2ZVBhY2thZ2UoJ251Y2xpZGUnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvZ2dsZUJsZW5kVHJlZVZpZXcoYm9vbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0SW1tZWRpYXRlKCgpID0+IHRhYnNTZXR0aW5ncy5hcHBseSgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDIwMDApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlUGFja2FnZSgocGtnKSA9PiB7XG4gICAgaWYgKHBrZy5uYW1lID09PSAnbnVjbGlkZS1maWxlLXRyZWUnKSB7XG4gICAgICAgIHRvZ2dsZUJsZW5kVHJlZVZpZXcoYXRvbS5jb25maWcuZ2V0KCdhdG9tLW1hdGVyaWFsLXVpLnRyZWVWaWV3LmJsZW5kVGFicycpKTtcbiAgICB9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgeyB0b2dnbGVCbGVuZFRyZWVWaWV3IH07XG4iXX0=
//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-material-ui/lib/tree-view-settings.js
