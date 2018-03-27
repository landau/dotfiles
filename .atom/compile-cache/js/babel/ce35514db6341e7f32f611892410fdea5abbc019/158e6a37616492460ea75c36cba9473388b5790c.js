Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.$range = $range;
exports.$file = $file;
exports.copySelection = copySelection;
exports.getPathOfMessage = getPathOfMessage;
exports.getActiveTextEditor = getActiveTextEditor;
exports.getEditorsMap = getEditorsMap;
exports.filterMessages = filterMessages;
exports.filterMessagesByRangeOrPoint = filterMessagesByRangeOrPoint;
exports.openFile = openFile;
exports.visitMessage = visitMessage;
exports.openExternally = openExternally;
exports.sortMessages = sortMessages;
exports.sortSolutions = sortSolutions;
exports.applySolution = applySolution;

var _atom = require('atom');

var _electron = require('electron');

var severityScore = {
  error: 3,
  warning: 2,
  info: 1
};

exports.severityScore = severityScore;
var severityNames = {
  error: 'Error',
  warning: 'Warning',
  info: 'Info'
};
exports.severityNames = severityNames;
var WORKSPACE_URI = 'atom://linter-ui-default';

exports.WORKSPACE_URI = WORKSPACE_URI;

function $range(message) {
  return message.version === 1 ? message.range : message.location.position;
}

function $file(message) {
  return message.version === 1 ? message.filePath : message.location.file;
}

function copySelection() {
  var selection = getSelection();
  if (selection) {
    atom.clipboard.write(selection.toString());
  }
}

function getPathOfMessage(message) {
  return atom.project.relativizePath($file(message) || '')[1];
}

function getActiveTextEditor() {
  var paneItem = atom.workspace.getCenter().getActivePaneItem();
  return atom.workspace.isTextEditor(paneItem) ? paneItem : null;
}

function getEditorsMap(editors) {
  var editorsMap = {};
  var filePaths = [];
  for (var entry of editors.editors) {
    var filePath = entry.textEditor.getPath();
    if (editorsMap[filePath]) {
      editorsMap[filePath].editors.push(entry);
    } else {
      editorsMap[filePath] = {
        added: [],
        removed: [],
        editors: [entry]
      };
      filePaths.push(filePath);
    }
  }
  return { editorsMap: editorsMap, filePaths: filePaths };
}

function filterMessages(messages, filePath) {
  var severity = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

  var filtered = [];
  messages.forEach(function (message) {
    if ((filePath === null || $file(message) === filePath) && (!severity || message.severity === severity)) {
      filtered.push(message);
    }
  });
  return filtered;
}

function filterMessagesByRangeOrPoint(messages, filePath, rangeOrPoint) {
  var filtered = [];
  var expectedRange = rangeOrPoint.constructor.name === 'Point' ? new _atom.Range(rangeOrPoint, rangeOrPoint) : _atom.Range.fromObject(rangeOrPoint);
  messages.forEach(function (message) {
    var file = $file(message);
    var range = $range(message);
    if (file && range && file === filePath && range.intersectsWith(expectedRange)) {
      filtered.push(message);
    }
  });
  return filtered;
}

function openFile(file, position) {
  var options = {};
  options.searchAllPanes = true;
  if (position) {
    options.initialLine = position.row;
    options.initialColumn = position.column;
  }
  atom.workspace.open(file, options);
}

function visitMessage(message) {
  var reference = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  var messageFile = undefined;
  var messagePosition = undefined;
  if (reference) {
    if (message.version !== 2) {
      console.warn('[Linter-UI-Default] Only messages v2 are allowed in jump to reference. Ignoring');
      return;
    }
    if (!message.reference || !message.reference.file) {
      console.warn('[Linter-UI-Default] Message does not have a valid reference. Ignoring');
      return;
    }
    messageFile = message.reference.file;
    messagePosition = message.reference.position;
  } else {
    var messageRange = $range(message);
    messageFile = $file(message);
    if (messageRange) {
      messagePosition = messageRange.start;
    }
  }
  if (messageFile) {
    openFile(messageFile, messagePosition);
  }
}

function openExternally(message) {
  if (message.version === 2 && message.url) {
    _electron.shell.openExternal(message.url);
  }
}

function sortMessages(sortInfo, rows) {
  var sortColumns = {};

  sortInfo.forEach(function (entry) {
    sortColumns[entry.column] = entry.type;
  });

  return rows.slice().sort(function (a, b) {
    if (sortColumns.severity) {
      var multiplyWith = sortColumns.severity === 'asc' ? 1 : -1;
      var severityA = severityScore[a.severity];
      var severityB = severityScore[b.severity];
      if (severityA !== severityB) {
        return multiplyWith * (severityA > severityB ? 1 : -1);
      }
    }
    if (sortColumns.linterName) {
      var multiplyWith = sortColumns.linterName === 'asc' ? 1 : -1;
      var sortValue = a.severity.localeCompare(b.severity);
      if (sortValue !== 0) {
        return multiplyWith * sortValue;
      }
    }
    if (sortColumns.file) {
      var multiplyWith = sortColumns.file === 'asc' ? 1 : -1;
      var fileA = getPathOfMessage(a);
      var fileALength = fileA.length;
      var fileB = getPathOfMessage(b);
      var fileBLength = fileB.length;
      if (fileALength !== fileBLength) {
        return multiplyWith * (fileALength > fileBLength ? 1 : -1);
      } else if (fileA !== fileB) {
        return multiplyWith * fileA.localeCompare(fileB);
      }
    }
    if (sortColumns.line) {
      var multiplyWith = sortColumns.line === 'asc' ? 1 : -1;
      var rangeA = $range(a);
      var rangeB = $range(b);
      if (rangeA && !rangeB) {
        return 1;
      } else if (rangeB && !rangeA) {
        return -1;
      } else if (rangeA && rangeB) {
        if (rangeA.start.row !== rangeB.start.row) {
          return multiplyWith * (rangeA.start.row > rangeB.start.row ? 1 : -1);
        }
        if (rangeA.start.column !== rangeB.start.column) {
          return multiplyWith * (rangeA.start.column > rangeB.start.column ? 1 : -1);
        }
      }
    }

    return 0;
  });
}

function sortSolutions(solutions) {
  return solutions.slice().sort(function (a, b) {
    return b.priority - a.priority;
  });
}

function applySolution(textEditor, version, solution) {
  if (solution.apply) {
    solution.apply();
    return true;
  }
  var range = version === 1 ? solution.range : solution.position;
  var currentText = version === 1 ? solution.oldText : solution.currentText;
  var replaceWith = version === 1 ? solution.newText : solution.replaceWith;
  if (currentText) {
    var textInRange = textEditor.getTextInBufferRange(range);
    if (currentText !== textInRange) {
      console.warn('[linter-ui-default] Not applying fix because text did not match the expected one', 'expected', currentText, 'but got', textInRange);
      return false;
    }
  }
  textEditor.setTextInBufferRange(range, replaceWith);
  return true;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci11aS1kZWZhdWx0L2xpYi9oZWxwZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQkFFc0IsTUFBTTs7d0JBQ04sVUFBVTs7QUFLekIsSUFBTSxhQUFhLEdBQUc7QUFDM0IsT0FBSyxFQUFFLENBQUM7QUFDUixTQUFPLEVBQUUsQ0FBQztBQUNWLE1BQUksRUFBRSxDQUFDO0NBQ1IsQ0FBQTs7O0FBRU0sSUFBTSxhQUFhLEdBQUc7QUFDM0IsT0FBSyxFQUFFLE9BQU87QUFDZCxTQUFPLEVBQUUsU0FBUztBQUNsQixNQUFJLEVBQUUsTUFBTTtDQUNiLENBQUE7O0FBQ00sSUFBTSxhQUFhLEdBQUcsMEJBQTBCLENBQUE7Ozs7QUFFaEQsU0FBUyxNQUFNLENBQUMsT0FBc0IsRUFBVztBQUN0RCxTQUFPLE9BQU8sQ0FBQyxPQUFPLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUE7Q0FDekU7O0FBQ00sU0FBUyxLQUFLLENBQUMsT0FBc0IsRUFBVztBQUNyRCxTQUFPLE9BQU8sQ0FBQyxPQUFPLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUE7Q0FDeEU7O0FBQ00sU0FBUyxhQUFhLEdBQUc7QUFDOUIsTUFBTSxTQUFTLEdBQUcsWUFBWSxFQUFFLENBQUE7QUFDaEMsTUFBSSxTQUFTLEVBQUU7QUFDYixRQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtHQUMzQztDQUNGOztBQUNNLFNBQVMsZ0JBQWdCLENBQUMsT0FBc0IsRUFBVTtBQUMvRCxTQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMs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S0FBSyxDQUFDLEdBQUcsUUFBUSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFBO0FBQzNFLE1BQUksV0FBVyxFQUFFO0FBQ2YsUUFBTSxXQUFXLEdBQUcsVUFBVSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQzFELFFBQUksV0FBVyxLQUFLLFdBQVcsRUFBRTtBQUMvQixhQUFPLENBQUMsSUFBSSxDQUFDLGtGQUFrRixFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFBO0FBQ2pKLGFBQU8sS0FBSyxDQUFBO0tBQ2I7R0FDRjtBQUNELFlBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUE7QUFDbkQsU0FBTyxJQUFJLENBQUE7Q0FDWiIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS8uYXRvbS9wYWNrYWdlcy9saW50ZXItdWktZGVmYXVsdC9saWIvaGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IFJhbmdlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB7IHNoZWxsIH0gZnJvbSAnZWxlY3Ryb24nXG5pbXBvcnQgdHlwZSB7IFBvaW50LCBUZXh0RWRpdG9yIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB0eXBlIEVkaXRvcnMgZnJvbSAnLi9lZGl0b3JzJ1xuaW1wb3J0IHR5cGUgeyBMaW50ZXJNZXNzYWdlIH0gZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGNvbnN0IHNldmVyaXR5U2NvcmUgPSB7XG4gIGVycm9yOiAzLFxuICB3YXJuaW5nOiAyLFxuICBpbmZvOiAxLFxufVxuXG5leHBvcnQgY29uc3Qgc2V2ZXJpdHlOYW1lcyA9IHtcbiAgZXJyb3I6ICdFcnJvcicsXG4gIHdhcm5pbmc6ICdXYXJuaW5nJyxcbiAgaW5mbzogJ0luZm8nLFxufVxuZXhwb3J0IGNvbnN0IFdPUktTUEFDRV9VUkkgPSAnYXRvbTovL2xpbnRlci11aS1kZWZhdWx0J1xuXG5leHBvcnQgZnVuY3Rpb24gJHJhbmdlKG1lc3NhZ2U6IExpbnRlck1lc3NhZ2UpOiA/T2JqZWN0IHtcbiAgcmV0dXJuIG1lc3NhZ2UudmVyc2lvbiA9PT0gMSA/IG1lc3NhZ2UucmFuZ2UgOiBtZXNzYWdlLmxvY2F0aW9uLnBvc2l0aW9uXG59XG5leHBvcnQgZnVuY3Rpb24gJGZpbGUobWVzc2FnZTogTGludGVyTWVzc2FnZSk6ID9zdHJpbmcge1xuICByZXR1cm4gbWVzc2FnZS52ZXJzaW9uID09PSAxID8gbWVzc2FnZS5maWxlUGF0aCA6IG1lc3NhZ2UubG9jYXRpb24uZmlsZVxufVxuZXhwb3J0IGZ1bmN0aW9uIGNvcHlTZWxlY3Rpb24oKSB7XG4gIGNvbnN0IHNlbGVjdGlvbiA9IGdldFNlbGVjdGlvbigpXG4gIGlmIChzZWxlY3Rpb24pIHtcbiAgICBhdG9tLmNsaXBib2FyZC53cml0ZShzZWxlY3Rpb24udG9TdHJpbmcoKSlcbiAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGdldFBhdGhPZk1lc3NhZ2UobWVzc2FnZTogTGludGVyTWVzc2FnZSk6IHN0cmluZyB7XG4gIHJldHVybiBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgoJGZpbGUobWVzc2FnZSkgfHwgJycpWzFdXG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0QWN0aXZlVGV4dEVkaXRvcigpOiA/VGV4dEVkaXRvciB7XG4gIGNvbnN0IHBhbmVJdGVtID0gYXRvbS53b3Jrc3BhY2UuZ2V0Q2VudGVyKCkuZ2V0QWN0aXZlUGFuZUl0ZW0oKVxuICByZXR1cm4gYXRvbS53b3Jrc3BhY2UuaXNUZXh0RWRpdG9yKHBhbmVJdGVtKSA/IHBhbmVJdGVtIDogbnVsbFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RWRpdG9yc01hcChlZGl0b3JzOiBFZGl0b3JzKTogeyBlZGl0b3JzTWFwOiBPYmplY3QsIGZpbGVQYXRoczogQXJyYXk8c3RyaW5nPiB9IHtcbiAgY29uc3QgZWRpdG9yc01hcCA9IHt9XG4gIGNvbnN0IGZpbGVQYXRocyA9IFtdXG4gIGZvciAoY29uc3QgZW50cnkgb2YgZWRpdG9ycy5lZGl0b3JzKSB7XG4gICAgY29uc3QgZmlsZVBhdGggPSBlbnRyeS50ZXh0RWRpdG9yLmdldFBhdGgoKVxuICAgIGlmIChlZGl0b3JzTWFwW2ZpbGVQYXRoXSkge1xuICAgICAgZWRpdG9yc01hcFtmaWxlUGF0aF0uZWRpdG9ycy5wdXNoKGVudHJ5KVxuICAgIH0gZWxzZSB7XG4gICAgICBlZGl0b3JzTWFwW2ZpbGVQYXRoXSA9IHtcbiAgICAgICAgYWRkZWQ6IFtdLFxuICAgICAgICByZW1vdmVkOiBbXSxcbiAgICAgICAgZWRpdG9yczogW2VudHJ5XSxcbiAgICAgIH1cbiAgICAgIGZpbGVQYXRocy5wdXNoKGZpbGVQYXRoKVxuICAgIH1cbiAgfVxuICByZXR1cm4geyBlZGl0b3JzTWFwLCBmaWxlUGF0aHMgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmlsdGVyTWVzc2FnZXMobWVzc2FnZXM6IEFycmF5PExpbnRlck1lc3NhZ2U+LCBmaWxlUGF0aDogP3N0cmluZywgc2V2ZXJpdHk6ID9zdHJpbmcgPSBudWxsKTogQXJyYXk8TGludGVyTWVzc2FnZT4ge1xuICBjb25zdCBmaWx0ZXJlZCA9IFtdXG4gIG1lc3NhZ2VzLmZvckVhY2goZnVuY3Rpb24obWVzc2FnZSkge1xuICAgIGlmICgoZmlsZVBhdGggPT09IG51bGwgfHwgJGZpbGUobWVzc2FnZSkgPT09IGZpbGVQYXRoKSAmJiAoIXNldmVyaXR5IHx8IG1lc3NhZ2Uuc2V2ZXJpdHkgPT09IHNldmVyaXR5KSkge1xuICAgICAgZmlsdGVyZWQucHVzaChtZXNzYWdlKVxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIGZpbHRlcmVkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaWx0ZXJNZXNzYWdlc0J5UmFuZ2VPclBvaW50KG1lc3NhZ2VzOiBTZXQ8TGludGVyTWVzc2FnZT4gfCBBcnJheTxMaW50ZXJNZXNzYWdlPiwgZmlsZVBhdGg6IHN0cmluZywgcmFuZ2VPclBvaW50OiBQb2ludCB8IFJhbmdlKTogQXJyYXk8TGludGVyTWVzc2FnZT4ge1xuICBjb25zdCBmaWx0ZXJlZCA9IFtdXG4gIGNvbnN0IGV4cGVjdGVkUmFuZ2UgPSByYW5nZU9yUG9pbnQuY29uc3RydWN0b3IubmFtZSA9PT0gJ1BvaW50JyA/IG5ldyBSYW5nZShyYW5nZU9yUG9pbnQsIHJhbmdlT3JQb2ludCkgOiBSYW5nZS5mcm9tT2JqZWN0KHJhbmdlT3JQb2ludClcbiAgbWVzc2FnZXMuZm9yRWFjaChmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgY29uc3QgZmlsZSA9ICRmaWxlKG1lc3NhZ2UpXG4gICAgY29uc3QgcmFuZ2UgPSAkcmFuZ2UobWVzc2FnZSlcbiAgICBpZiAoZmlsZSAmJiByYW5nZSAmJiBmaWxlID09PSBmaWxlUGF0aCAmJiByYW5nZS5pbnRlcnNlY3RzV2l0aChleHBlY3RlZFJhbmdlKSkge1xuICAgICAgZmlsdGVyZWQucHVzaChtZXNzYWdlKVxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIGZpbHRlcmVkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcGVuRmlsZShmaWxlOiBzdHJpbmcsIHBvc2l0aW9uOiA/UG9pbnQpIHtcbiAgY29uc3Qgb3B0aW9ucyA9IHt9XG4gIG9wdGlvbnMuc2VhcmNoQWxsUGFuZXMgPSB0cnVlXG4gIGlmIChwb3NpdGlvbikge1xuICAgIG9wdGlvbnMuaW5pdGlhbExpbmUgPSBwb3NpdGlvbi5yb3dcbiAgICBvcHRpb25zLmluaXRpYWxDb2x1bW4gPSBwb3NpdGlvbi5jb2x1bW5cbiAgfVxuICBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGUsIG9wdGlvbnMpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2aXNpdE1lc3NhZ2UobWVzc2FnZTogTGludGVyTWVzc2FnZSwgcmVmZXJlbmNlOiBib29sZWFuID0gZmFsc2UpIHtcbiAgbGV0IG1lc3NhZ2VGaWxlXG4gIGxldCBtZXNzYWdlUG9zaXRpb25cbiAgaWYgKHJlZmVyZW5jZSkge1xuICAgIGlmIChtZXNzYWdlLnZlcnNpb24gIT09IDIpIHtcbiAgICAgIGNvbnNvbGUud2FybignW0xpbnRlci1VSS1EZWZhdWx0XSBPbmx5IG1lc3NhZ2VzIHYyIGFyZSBhbGxvd2VkIGluIGp1bXAgdG8gcmVmZXJlbmNlLiBJZ25vcmluZycpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKCFtZXNzYWdlLnJlZmVyZW5jZSB8fCAhbWVzc2FnZS5yZWZlcmVuY2UuZmlsZSkge1xuICAgICAgY29uc29sZS53YXJuKCdbTGludGVyLVVJLURlZmF1bHRdIE1lc3NhZ2UgZG9lcyBub3QgaGF2ZSBhIHZhbGlkIHJlZmVyZW5jZS4gSWdub3JpbmcnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIG1lc3NhZ2VGaWxlID0gbWVzc2FnZS5yZWZlcmVuY2UuZmlsZVxuICAgIG1lc3NhZ2VQb3NpdGlvbiA9IG1lc3NhZ2UucmVmZXJlbmNlLnBvc2l0aW9uXG4gIH0gZWxzZSB7XG4gICAgY29uc3QgbWVzc2FnZVJhbmdlID0gJHJhbmdlKG1lc3NhZ2UpXG4gICAgbWVzc2FnZUZpbGUgPSAkZmlsZShtZXNzYWdlKVxuICAgIGlmIChtZXNzYWdlUmFuZ2UpIHtcbiAgICAgIG1lc3NhZ2VQb3NpdGlvbiA9IG1lc3NhZ2VSYW5nZS5zdGFydFxuICAgIH1cbiAgfVxuICBpZiAobWVzc2FnZUZpbGUpIHtcbiAgICBvcGVuRmlsZShtZXNzYWdlRmlsZSwgbWVzc2FnZVBvc2l0aW9uKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcGVuRXh0ZXJuYWxseShtZXNzYWdlOiBMaW50ZXJNZXNzYWdlKTogdm9pZCB7XG4gIGlmIChtZXNzYWdlLnZlcnNpb24gPT09IDIgJiYgbWVzc2FnZS51cmwpIHtcbiAgICBzaGVsbC5vcGVuRXh0ZXJuYWwobWVzc2FnZS51cmwpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNvcnRNZXNzYWdlcyhzb3J0SW5mbzogQXJyYXk8eyBjb2x1bW46IHN0cmluZywgdHlwZTogJ2FzYycgfCAnZGVzYycgfT4sIHJvd3M6IEFycmF5PExpbnRlck1lc3NhZ2U+KTogQXJyYXk8TGludGVyTWVzc2FnZT4ge1xuICBjb25zdCBzb3J0Q29sdW1ucyA6IHtcbiAgICBzZXZlcml0eT86ICdhc2MnIHwgJ2Rlc2MnLFxuICAgIGxpbnRlck5hbWU/OiAnYXNjJyB8ICdkZXNjJyxcbiAgICBmaWxlPzogJ2FzYycgfCAnZGVzYycsXG4gICAgbGluZT86ICdhc2MnIHwgJ2Rlc2MnXG4gIH0gPSB7fVxuXG4gIHNvcnRJbmZvLmZvckVhY2goZnVuY3Rpb24oZW50cnkpIHtcbiAgICBzb3J0Q29sdW1uc1tlbnRyeS5jb2x1bW5dID0gZW50cnkudHlwZVxuICB9KVxuXG4gIHJldHVybiByb3dzLnNsaWNlKCkuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgaWYgKHNvcnRDb2x1bW5zLnNldmVyaXR5KSB7XG4gICAgICBjb25zdCBtdWx0aXBseVdpdGggPSBzb3J0Q29sdW1ucy5zZXZlcml0eSA9PT0gJ2FzYycgPyAxIDogLTFcbiAgICAgIGNvbnN0IHNldmVyaXR5QSA9IHNldmVyaXR5U2NvcmVbYS5zZXZlcml0eV1cbiAgICAgIGNvbnN0IHNldmVyaXR5QiA9IHNldmVyaXR5U2NvcmVbYi5zZXZlcml0eV1cbiAgICAgIGlmIChzZXZlcml0eUEgIT09IHNldmVyaXR5Qikge1xuICAgICAgICByZXR1cm4gbXVsdGlwbHlXaXRoICogKHNldmVyaXR5QSA+IHNldmVyaXR5QiA/IDEgOiAtMSlcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHNvcnRDb2x1bW5zLmxpbnRlck5hbWUpIHtcbiAgICAgIGNvbnN0IG11bHRpcGx5V2l0aCA9IHNvcnRDb2x1bW5zLmxpbnRlck5hbWUgPT09ICdhc2MnID8gMSA6IC0xXG4gICAgICBjb25zdCBzb3J0VmFsdWUgPSBhLnNldmVyaXR5LmxvY2FsZUNvbXBhcmUoYi5zZXZlcml0eSlcbiAgICAgIGlmIChzb3J0VmFsdWUgIT09IDApIHtcbiAgICAgICAgcmV0dXJuIG11bHRpcGx5V2l0aCAqIHNvcnRWYWx1ZVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoc29ydENvbHVtbnMuZmlsZSkge1xuICAgICAgY29uc3QgbXVsdGlwbHlXaXRoID0gc29ydENvbHVtbnMuZmlsZSA9PT0gJ2FzYycgPyAxIDogLTFcbiAgICAgIGNvbnN0IGZpbGVBID0gZ2V0UGF0aE9mTWVzc2FnZShhKVxuICAgICAgY29uc3QgZmlsZUFMZW5ndGggPSBmaWxlQS5sZW5ndGhcbiAgICAgIGNvbnN0IGZpbGVCID0gZ2V0UGF0aE9mTWVzc2FnZShiKVxuICAgICAgY29uc3QgZmlsZUJMZW5ndGggPSBmaWxlQi5sZW5ndGhcbiAgICAgIGlmIChmaWxlQUxlbmd0aCAhPT0gZmlsZUJMZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIG11bHRpcGx5V2l0aCAqIChmaWxlQUxlbmd0aCA+IGZpbGVCTGVuZ3RoID8gMSA6IC0xKVxuICAgICAgfSBlbHNlIGlmIChmaWxlQSAhPT0gZmlsZUIpIHtcbiAgICAgICAgcmV0dXJuIG11bHRpcGx5V2l0aCAqIGZpbGVBLmxvY2FsZUNvbXBhcmUoZmlsZUIpXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChzb3J0Q29sdW1ucy5saW5lKSB7XG4gICAgICBjb25zdCBtdWx0aXBseVdpdGggPSBzb3J0Q29sdW1ucy5saW5lID09PSAnYXNjJyA/IDEgOiAtMVxuICAgICAgY29uc3QgcmFuZ2VBID0gJHJhbmdlKGEpXG4gICAgICBjb25zdCByYW5nZUIgPSAkcmFuZ2UoYilcbiAgICAgIGlmIChyYW5nZUEgJiYgIXJhbmdlQikge1xuICAgICAgICByZXR1cm4gMVxuICAgICAgfSBlbHNlIGlmIChyYW5nZUIgJiYgIXJhbmdlQSkge1xuICAgICAgICByZXR1cm4gLTFcbiAgICAgIH0gZWxzZSBpZiAocmFuZ2VBICYmIHJhbmdlQikge1xuICAgICAgICBpZiAocmFuZ2VBLnN0YXJ0LnJvdyAhPT0gcmFuZ2VCLnN0YXJ0LnJvdykge1xuICAgICAgICAgIHJldHVybiBtdWx0aXBseVdpdGggKiAocmFuZ2VBLnN0YXJ0LnJvdyA+IHJhbmdlQi5zdGFydC5yb3cgPyAxIDogLTEpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJhbmdlQS5zdGFydC5jb2x1bW4gIT09IHJhbmdlQi5zdGFydC5jb2x1bW4pIHtcbiAgICAgICAgICByZXR1cm4gbXVsdGlwbHlXaXRoICogKHJhbmdlQS5zdGFydC5jb2x1bW4gPiByYW5nZUIuc3RhcnQuY29sdW1uID8gMSA6IC0xKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIDBcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNvcnRTb2x1dGlvbnMoc29sdXRpb25zOiBBcnJheTxPYmplY3Q+KTogQXJyYXk8T2JqZWN0PiB7XG4gIHJldHVybiBzb2x1dGlvbnMuc2xpY2UoKS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gYi5wcmlvcml0eSAtIGEucHJpb3JpdHlcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5U29sdXRpb24odGV4dEVkaXRvcjogVGV4dEVkaXRvciwgdmVyc2lvbjogMSB8IDIsIHNvbHV0aW9uOiBPYmplY3QpOiBib29sZWFuIHtcbiAgaWYgKHNvbHV0aW9uLmFwcGx5KSB7XG4gICAgc29sdXRpb24uYXBwbHkoKVxuICAgIHJldHVybiB0cnVlXG4gIH1cbiAgY29uc3QgcmFuZ2UgPSB2ZXJzaW9uID09PSAxID8gc29sdXRpb24ucmFuZ2UgOiBzb2x1dGlvbi5wb3NpdGlvblxuICBjb25zdCBjdXJyZW50VGV4dCA9IHZlcnNpb24gPT09IDEgPyBzb2x1dGlvbi5vbGRUZXh0IDogc29sdXRpb24uY3VycmVudFRleHRcbiAgY29uc3QgcmVwbGFjZVdpdGggPSB2ZXJzaW9uID09PSAxID8gc29sdXRpb24ubmV3VGV4dCA6IHNvbHV0aW9uLnJlcGxhY2VXaXRoXG4gIGlmIChjdXJyZW50VGV4dCkge1xuICAgIGNvbnN0IHRleHRJblJhbmdlID0gdGV4dEVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSlcbiAgICBpZiAoY3VycmVudFRleHQgIT09IHRleHRJblJhbmdlKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1tsaW50ZXItdWktZGVmYXVsdF0gTm90IGFwcGx5aW5nIGZpeCBiZWNhdXNlIHRleHQgZGlkIG5vdCBtYXRjaCB0aGUgZXhwZWN0ZWQgb25lJywgJ2V4cGVjdGVkJywgY3VycmVudFRleHQsICdidXQgZ290JywgdGV4dEluUmFuZ2UpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cbiAgdGV4dEVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSwgcmVwbGFjZVdpdGgpXG4gIHJldHVybiB0cnVlXG59XG4iXX0=