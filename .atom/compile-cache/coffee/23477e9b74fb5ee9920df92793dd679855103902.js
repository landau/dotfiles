(function() {
  var Disposable, Point, Range, _, addClassList, adjustRangeToRowRange, buildWordPatternByCursor, collectRangeInBufferRow, cursorIsAtEndOfLineAtNonEmptyRow, cursorIsAtVimEndOfFile, debug, destroyNonLastSelection, detectScopeStartPositionForScope, ensureEndsWithNewLineForBufferRow, expandRangeToWhiteSpaces, findIndexBy, findRangeContainsPoint, findRangeInBufferRow, forEachPaneAxis, fs, getAncestors, getBeginningOfWordBufferPosition, getBufferRangeForRowRange, getBufferRows, getCharacterForEvent, getCodeFoldRowRanges, getCodeFoldRowRangesContainesForRow, getCurrentWordBufferRangeAndKind, getEndOfLineForBufferRow, getEndOfWordBufferPosition, getFirstCharacterBufferPositionForScreenRow, getFirstCharacterPositionForBufferRow, getFirstVisibleScreenRow, getIndentLevelForBufferRow, getIndex, getKeyBindingForCommand, getKeystrokeForEvent, getLargestFoldRangeContainsBufferRow, getLastVisibleScreenRow, getLeftCharacterForBufferPosition, getLineTextToBufferPosition, getNonWordCharactersForCursor, getPackage, getParent, getRangeByTranslatePointAndClip, getRightCharacterForBufferPosition, getScopesForTokenizedLine, getSubwordPatternAtBufferPosition, getTextInScreenRange, getTokenizedLineForRow, getValidVimBufferRow, getValidVimScreenRow, getVimEofBufferPosition, getVimEofScreenPosition, getVimLastBufferRow, getVimLastScreenRow, getVisibleBufferRange, getVisibleEditors, getWordBufferRangeAndKindAtBufferPosition, getWordBufferRangeAtBufferPosition, getWordPatternAtBufferPosition, haveSomeNonEmptySelection, humanizeBufferRange, include, isAllWhiteSpaceText, isEmpty, isEmptyRow, isEndsWithNewLineForBufferRow, isEscapedCharRange, isFunctionScope, isIncludeFunctionScopeForRow, isLeadingWhiteSpaceRange, isLinewiseRange, isNotEmpty, isNotLeadingWhiteSpaceRange, isNotSingleLineRange, isRangeContainsSomePoint, isSingleLineRange, isSingleLineText, keystrokeToCharCode, limitNumber, matchScopes, mergeIntersectingRanges, modifyClassList, moveCursor, moveCursorDownBuffer, moveCursorDownScreen, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUpBuffer, moveCursorUpScreen, negateFunction, pointIsAtEndOfLine, pointIsAtEndOfLineAtNonEmptyRow, pointIsAtVimEndOfFile, pointIsOnWhiteSpace, ref, registerElement, removeClassList, saveEditorState, scanEditor, scanEditorInDirection, scanForScopeStart, scanInRanges, searchByProjectFind, setBufferColumn, setBufferRow, setTextAtBufferPosition, settings, shouldPreventWrapLine, shrinkRangeEndToBeforeNewLine, smartScrollToBufferPosition, sortComparable, sortRanges, sortRangesByEndPosition, splitTextByNewLine, toggleCaseForCharacter, toggleClassList, translatePointAndClip, trimRange, withVisibleBufferRange,
    slice = [].slice;

  fs = require('fs-plus');

  settings = require('./settings');

  ref = require('atom'), Disposable = ref.Disposable, Range = ref.Range, Point = ref.Point;

  _ = require('underscore-plus');

  getParent = function(obj) {
    var ref1;
    return (ref1 = obj.__super__) != null ? ref1.constructor : void 0;
  };

  getAncestors = function(obj) {
    var ancestors, current;
    ancestors = [];
    current = obj;
    while (true) {
      ancestors.push(current);
      current = getParent(current);
      if (!current) {
        break;
      }
    }
    return ancestors;
  };

  getKeyBindingForCommand = function(command, arg) {
    var j, keymap, keymapPath, keymaps, keystrokes, len, packageName, results, selector;
    packageName = arg.packageName;
    results = null;
    keymaps = atom.keymaps.getKeyBindings();
    if (packageName != null) {
      keymapPath = atom.packages.getActivePackage(packageName).getKeymapPaths().pop();
      keymaps = keymaps.filter(function(arg1) {
        var source;
        source = arg1.source;
        return source === keymapPath;
      });
    }
    for (j = 0, len = keymaps.length; j < len; j++) {
      keymap = keymaps[j];
      if (!(keymap.command === command)) {
        continue;
      }
      keystrokes = keymap.keystrokes, selector = keymap.selector;
      keystrokes = keystrokes.replace(/shift-/, '');
      (results != null ? results : results = []).push({
        keystrokes: keystrokes,
        selector: selector
      });
    }
    return results;
  };

  include = function(klass, module) {
    var key, results1, value;
    results1 = [];
    for (key in module) {
      value = module[key];
      results1.push(klass.prototype[key] = value);
    }
    return results1;
  };

  debug = function() {
    var filePath, messages;
    messages = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (!settings.get('debug')) {
      return;
    }
    switch (settings.get('debugOutput')) {
      case 'console':
        return console.log.apply(console, messages);
      case 'file':
        filePath = fs.normalize(settings.get('debugOutputFilePath'));
        if (fs.existsSync(filePath)) {
          return fs.appendFileSync(filePath, messages + "\n");
        }
    }
  };

  saveEditorState = function(editor) {
    var editorElement, foldStartRows, scrollTop;
    editorElement = editor.element;
    scrollTop = editorElement.getScrollTop();
    foldStartRows = editor.displayLayer.foldsMarkerLayer.findMarkers({}).map(function(m) {
      return m.getStartPosition().row;
    });
    return function() {
      var j, len, ref1, row;
      ref1 = foldStartRows.reverse();
      for (j = 0, len = ref1.length; j < len; j++) {
        row = ref1[j];
        if (!editor.isFoldedAtBufferRow(row)) {
          editor.foldBufferRow(row);
        }
      }
      return editorElement.setScrollTop(scrollTop);
    };
  };

  getKeystrokeForEvent = function(event) {
    var keyboardEvent, ref1;
    keyboardEvent = (ref1 = event.originalEvent.originalEvent) != null ? ref1 : event.originalEvent;
    return atom.keymaps.keystrokeForKeyboardEvent(keyboardEvent);
  };

  keystrokeToCharCode = {
    backspace: 8,
    tab: 9,
    enter: 13,
    escape: 27,
    space: 32,
    "delete": 127
  };

  getCharacterForEvent = function(event) {
    var charCode, keystroke;
    keystroke = getKeystrokeForEvent(event);
    if (charCode = keystrokeToCharCode[keystroke]) {
      return String.fromCharCode(charCode);
    } else {
      return keystroke;
    }
  };

  isLinewiseRange = function(arg) {
    var end, ref1, start;
    start = arg.start, end = arg.end;
    return (start.row !== end.row) && ((start.column === (ref1 = end.column) && ref1 === 0));
  };

  isEndsWithNewLineForBufferRow = function(editor, row) {
    var end, ref1, start;
    ref1 = editor.bufferRangeForBufferRow(row, {
      includeNewline: true
    }), start = ref1.start, end = ref1.end;
    return start.row !== end.row;
  };

  haveSomeNonEmptySelection = function(editor) {
    return editor.getSelections().some(isNotEmpty);
  };

  sortComparable = function(collection) {
    return collection.sort(function(a, b) {
      return a.compare(b);
    });
  };

  sortRanges = sortComparable;

  sortRangesByEndPosition = function(ranges, fn) {
    return ranges.sort(function(a, b) {
      return a.end.compare(b.end);
    });
  };

  getIndex = function(index, list) {
    var length;
    length = list.length;
    if (length === 0) {
      return -1;
    } else {
      index = index % length;
      if (index >= 0) {
        return index;
      } else {
        return length + index;
      }
    }
  };

  withVisibleBufferRange = function(editor, fn) {
    var disposable, range;
    if (range = getVisibleBufferRange(editor)) {
      return fn(range);
    } else {
      return disposable = editor.element.onDidAttach(function() {
        disposable.dispose();
        range = getVisibleBufferRange(editor);
        return fn(range);
      });
    }
  };

  getVisibleBufferRange = function(editor) {
    var endRow, ref1, startRow;
    ref1 = editor.element.getVisibleRowRange(), startRow = ref1[0], endRow = ref1[1];
    if (!((startRow != null) && (endRow != null))) {
      return null;
    }
    startRow = editor.bufferRowForScreenRow(startRow);
    endRow = editor.bufferRowForScreenRow(endRow);
    return new Range([startRow, 0], [endRow, 2e308]);
  };

  getVisibleEditors = function() {
    var editor, j, len, pane, ref1, results1;
    ref1 = atom.workspace.getPanes();
    results1 = [];
    for (j = 0, len = ref1.length; j < len; j++) {
      pane = ref1[j];
      if (editor = pane.getActiveEditor()) {
        results1.push(editor);
      }
    }
    return results1;
  };

  findIndexBy = function(list, fn) {
    var i, item, j, len;
    for (i = j = 0, len = list.length; j < len; i = ++j) {
      item = list[i];
      if (fn(item)) {
        return i;
      }
    }
    return null;
  };

  mergeIntersectingRanges = function(ranges) {
    var i, index, j, len, range, result;
    result = [];
    for (i = j = 0, len = ranges.length; j < len; i = ++j) {
      range = ranges[i];
      if (index = findIndexBy(result, function(r) {
        return r.intersectsWith(range);
      })) {
        result[index] = result[index].union(range);
      } else {
        result.push(range);
      }
    }
    return result;
  };

  getEndOfLineForBufferRow = function(editor, row) {
    return editor.bufferRangeForBufferRow(row).end;
  };

  pointIsAtEndOfLine = function(editor, point) {
    point = Point.fromObject(point);
    return getEndOfLineForBufferRow(editor, point.row).isEqual(point);
  };

  pointIsOnWhiteSpace = function(editor, point) {
    return isAllWhiteSpaceText(getRightCharacterForBufferPosition(editor, point));
  };

  pointIsAtEndOfLineAtNonEmptyRow = function(editor, point) {
    point = Point.fromObject(point);
    return point.column !== 0 && pointIsAtEndOfLine(editor, point);
  };

  pointIsAtVimEndOfFile = function(editor, point) {
    return getVimEofBufferPosition(editor).isEqual(point);
  };

  isEmptyRow = function(editor, row) {
    return editor.bufferRangeForBufferRow(row).isEmpty();
  };

  cursorIsAtEndOfLineAtNonEmptyRow = function(cursor) {
    return pointIsAtEndOfLineAtNonEmptyRow(cursor.editor, cursor.getBufferPosition());
  };

  cursorIsAtVimEndOfFile = function(cursor) {
    return pointIsAtVimEndOfFile(cursor.editor, cursor.getBufferPosition());
  };

  getRightCharacterForBufferPosition = function(editor, point, amount) {
    if (amount == null) {
      amount = 1;
    }
    return editor.getTextInBufferRange(Range.fromPointWithDelta(point, 0, amount));
  };

  getLeftCharacterForBufferPosition = function(editor, point, amount) {
    if (amount == null) {
      amount = 1;
    }
    return editor.getTextInBufferRange(Range.fromPointWithDelta(point, 0, -amount));
  };

  getTextInScreenRange = function(editor, screenRange) {
    var bufferRange;
    bufferRange = editor.bufferRangeForScreenRange(screenRange);
    return editor.getTextInBufferRange(bufferRange);
  };

  getNonWordCharactersForCursor = function(cursor) {
    var scope;
    if (cursor.getNonWordCharacters != null) {
      return cursor.getNonWordCharacters();
    } else {
      scope = cursor.getScopeDescriptor().getScopesArray();
      return atom.config.get('editor.nonWordCharacters', {
        scope: scope
      });
    }
  };

  moveCursorToNextNonWhitespace = function(cursor) {
    var editor, originalPoint, point, vimEof;
    originalPoint = cursor.getBufferPosition();
    editor = cursor.editor;
    vimEof = getVimEofBufferPosition(editor);
    while (pointIsOnWhiteSpace(editor, point = cursor.getBufferPosition()) && !point.isGreaterThanOrEqual(vimEof)) {
      cursor.moveRight();
    }
    return !originalPoint.isEqual(cursor.getBufferPosition());
  };

  getBufferRows = function(editor, arg) {
    var direction, endRow, j, k, ref1, ref2, results1, results2, startRow;
    startRow = arg.startRow, direction = arg.direction;
    switch (direction) {
      case 'previous':
        if (startRow <= 0) {
          return [];
        } else {
          return (function() {
            results1 = [];
            for (var j = ref1 = startRow - 1; ref1 <= 0 ? j <= 0 : j >= 0; ref1 <= 0 ? j++ : j--){ results1.push(j); }
            return results1;
          }).apply(this);
        }
        break;
      case 'next':
        endRow = getVimLastBufferRow(editor);
        if (startRow >= endRow) {
          return [];
        } else {
          return (function() {
            results2 = [];
            for (var k = ref2 = startRow + 1; ref2 <= endRow ? k <= endRow : k >= endRow; ref2 <= endRow ? k++ : k--){ results2.push(k); }
            return results2;
          }).apply(this);
        }
    }
  };

  getVimEofBufferPosition = function(editor) {
    var eof;
    eof = editor.getEofBufferPosition();
    if ((eof.row === 0) || (eof.column > 0)) {
      return eof;
    } else {
      return getEndOfLineForBufferRow(editor, eof.row - 1);
    }
  };

  getVimEofScreenPosition = function(editor) {
    return editor.screenPositionForBufferPosition(getVimEofBufferPosition(editor));
  };

  getVimLastBufferRow = function(editor) {
    return getVimEofBufferPosition(editor).row;
  };

  getVimLastScreenRow = function(editor) {
    return getVimEofScreenPosition(editor).row;
  };

  getFirstVisibleScreenRow = function(editor) {
    return editor.element.getFirstVisibleScreenRow();
  };

  getLastVisibleScreenRow = function(editor) {
    return editor.element.getLastVisibleScreenRow();
  };

  getFirstCharacterPositionForBufferRow = function(editor, row) {
    var range, ref1;
    range = findRangeInBufferRow(editor, /\S/, row);
    return (ref1 = range != null ? range.start : void 0) != null ? ref1 : new Point(row, 0);
  };

  getFirstCharacterBufferPositionForScreenRow = function(editor, screenRow) {
    var end, point, scanRange, start;
    start = editor.clipScreenPosition([screenRow, 0], {
      skipSoftWrapIndentation: true
    });
    end = [screenRow, 2e308];
    point = null;
    scanRange = editor.bufferRangeForScreenRange([start, end]);
    editor.scanInBufferRange(/\S/, scanRange, function(arg) {
      var range;
      range = arg.range;
      return point = range.start;
    });
    return point != null ? point : scanRange.start;
  };

  trimRange = function(editor, scanRange) {
    var end, pattern, ref1, setEnd, setStart, start;
    pattern = /\S/;
    ref1 = [], start = ref1[0], end = ref1[1];
    setStart = function(arg) {
      var range;
      range = arg.range;
      return start = range.start, range;
    };
    setEnd = function(arg) {
      var range;
      range = arg.range;
      return end = range.end, range;
    };
    editor.scanInBufferRange(pattern, scanRange, setStart);
    if (start != null) {
      editor.backwardsScanInBufferRange(pattern, scanRange, setEnd);
    }
    if ((start != null) && (end != null)) {
      return new Range(start, end);
    } else {
      return scanRange;
    }
  };

  setBufferRow = function(cursor, row, options) {
    var column, ref1;
    column = (ref1 = cursor.goalColumn) != null ? ref1 : cursor.getBufferColumn();
    cursor.setBufferPosition([row, column], options);
    return cursor.goalColumn = column;
  };

  setBufferColumn = function(cursor, column) {
    return cursor.setBufferPosition([cursor.getBufferRow(), column]);
  };

  moveCursor = function(cursor, arg, fn) {
    var goalColumn, preserveGoalColumn;
    preserveGoalColumn = arg.preserveGoalColumn;
    goalColumn = cursor.goalColumn;
    fn(cursor);
    if (preserveGoalColumn && (goalColumn != null)) {
      return cursor.goalColumn = goalColumn;
    }
  };

  shouldPreventWrapLine = function(cursor) {
    var column, ref1, row, tabLength, text;
    ref1 = cursor.getBufferPosition(), row = ref1.row, column = ref1.column;
    if (atom.config.get('editor.softTabs')) {
      tabLength = atom.config.get('editor.tabLength');
      if ((0 < column && column < tabLength)) {
        text = cursor.editor.getTextInBufferRange([[row, 0], [row, tabLength]]);
        return /^\s+$/.test(text);
      } else {
        return false;
      }
    }
  };

  moveCursorLeft = function(cursor, options) {
    var allowWrap, motion, needSpecialCareToPreventWrapLine;
    if (options == null) {
      options = {};
    }
    allowWrap = options.allowWrap, needSpecialCareToPreventWrapLine = options.needSpecialCareToPreventWrapLine;
    delete options.allowWrap;
    if (needSpecialCareToPreventWrapLine) {
      if (shouldPreventWrapLine(cursor)) {
        return;
      }
    }
    if (!cursor.isAtBeginningOfLine() || allowWrap) {
      motion = function(cursor) {
        return cursor.moveLeft();
      };
      return moveCursor(cursor, options, motion);
    }
  };

  moveCursorRight = function(cursor, options) {
    var allowWrap, motion;
    if (options == null) {
      options = {};
    }
    allowWrap = options.allowWrap;
    delete options.allowWrap;
    if (!cursor.isAtEndOfLine() || allowWrap) {
      motion = function(cursor) {
        return cursor.moveRight();
      };
      return moveCursor(cursor, options, motion);
    }
  };

  moveCursorUpScreen = function(cursor, options) {
    var motion;
    if (options == null) {
      options = {};
    }
    if (cursor.getScreenRow() !== 0) {
      motion = function(cursor) {
        return cursor.moveUp();
      };
      return moveCursor(cursor, options, motion);
    }
  };

  moveCursorDownScreen = function(cursor, options) {
    var motion;
    if (options == null) {
      options = {};
    }
    if (getVimLastScreenRow(cursor.editor) !== cursor.getScreenRow()) {
      motion = function(cursor) {
        return cursor.moveDown();
      };
      return moveCursor(cursor, options, motion);
    }
  };

  moveCursorDownBuffer = function(cursor) {
    var point;
    point = cursor.getBufferPosition();
    if (getVimLastBufferRow(cursor.editor) !== point.row) {
      return cursor.setBufferPosition(point.translate([+1, 0]));
    }
  };

  moveCursorUpBuffer = function(cursor) {
    var point;
    point = cursor.getBufferPosition();
    if (point.row !== 0) {
      return cursor.setBufferPosition(point.translate([-1, 0]));
    }
  };

  moveCursorToFirstCharacterAtRow = function(cursor, row) {
    cursor.setBufferPosition([row, 0]);
    return cursor.moveToFirstCharacterOfLine();
  };

  getValidVimBufferRow = function(editor, row) {
    return limitNumber(row, {
      min: 0,
      max: getVimLastBufferRow(editor)
    });
  };

  getValidVimScreenRow = function(editor, row) {
    return limitNumber(row, {
      min: 0,
      max: getVimLastScreenRow(editor)
    });
  };

  getLineTextToBufferPosition = function(editor, arg, arg1) {
    var column, exclusive, row;
    row = arg.row, column = arg.column;
    exclusive = (arg1 != null ? arg1 : {}).exclusive;
    if (exclusive != null ? exclusive : true) {
      return editor.lineTextForBufferRow(row).slice(0, column);
    } else {
      return editor.lineTextForBufferRow(row).slice(0, +column + 1 || 9e9);
    }
  };

  getIndentLevelForBufferRow = function(editor, row) {
    return editor.indentLevelForLine(editor.lineTextForBufferRow(row));
  };

  isAllWhiteSpaceText = function(text) {
    return !/\S/.test(text);
  };

  getCodeFoldRowRanges = function(editor) {
    var j, ref1, results1;
    return (function() {
      results1 = [];
      for (var j = 0, ref1 = editor.getLastBufferRow(); 0 <= ref1 ? j <= ref1 : j >= ref1; 0 <= ref1 ? j++ : j--){ results1.push(j); }
      return results1;
    }).apply(this).map(function(row) {
      return editor.languageMode.rowRangeForCodeFoldAtBufferRow(row);
    }).filter(function(rowRange) {
      return (rowRange != null) && (rowRange[0] != null) && (rowRange[1] != null);
    });
  };

  getCodeFoldRowRangesContainesForRow = function(editor, bufferRow, arg) {
    var includeStartRow;
    includeStartRow = (arg != null ? arg : {}).includeStartRow;
    if (includeStartRow == null) {
      includeStartRow = true;
    }
    return getCodeFoldRowRanges(editor).filter(function(arg1) {
      var endRow, startRow;
      startRow = arg1[0], endRow = arg1[1];
      if (includeStartRow) {
        return (startRow <= bufferRow && bufferRow <= endRow);
      } else {
        return (startRow < bufferRow && bufferRow <= endRow);
      }
    });
  };

  getBufferRangeForRowRange = function(editor, rowRange) {
    var endRange, ref1, startRange;
    ref1 = rowRange.map(function(row) {
      return editor.bufferRangeForBufferRow(row, {
        includeNewline: true
      });
    }), startRange = ref1[0], endRange = ref1[1];
    return startRange.union(endRange);
  };

  getTokenizedLineForRow = function(editor, row) {
    return editor.tokenizedBuffer.tokenizedLineForRow(row);
  };

  getScopesForTokenizedLine = function(line) {
    var j, len, ref1, results1, tag;
    ref1 = line.tags;
    results1 = [];
    for (j = 0, len = ref1.length; j < len; j++) {
      tag = ref1[j];
      if (tag < 0 && (tag % 2 === -1)) {
        results1.push(atom.grammars.scopeForId(tag));
      }
    }
    return results1;
  };

  scanForScopeStart = function(editor, fromPoint, direction, fn) {
    var column, continueScan, isValidToken, j, k, l, len, len1, len2, position, ref1, result, results, row, scanRows, scope, stop, tag, tokenIterator, tokenizedLine;
    fromPoint = Point.fromObject(fromPoint);
    scanRows = (function() {
      var j, k, ref1, ref2, ref3, results1, results2;
      switch (direction) {
        case 'forward':
          return (function() {
            results1 = [];
            for (var j = ref1 = fromPoint.row, ref2 = editor.getLastBufferRow(); ref1 <= ref2 ? j <= ref2 : j >= ref2; ref1 <= ref2 ? j++ : j--){ results1.push(j); }
            return results1;
          }).apply(this);
        case 'backward':
          return (function() {
            results2 = [];
            for (var k = ref3 = fromPoint.row; ref3 <= 0 ? k <= 0 : k >= 0; ref3 <= 0 ? k++ : k--){ results2.push(k); }
            return results2;
          }).apply(this);
      }
    })();
    continueScan = true;
    stop = function() {
      return continueScan = false;
    };
    isValidToken = (function() {
      switch (direction) {
        case 'forward':
          return function(arg) {
            var position;
            position = arg.position;
            return position.isGreaterThan(fromPoint);
          };
        case 'backward':
          return function(arg) {
            var position;
            position = arg.position;
            return position.isLessThan(fromPoint);
          };
      }
    })();
    for (j = 0, len = scanRows.length; j < len; j++) {
      row = scanRows[j];
      if (!(tokenizedLine = getTokenizedLineForRow(editor, row))) {
        continue;
      }
      column = 0;
      results = [];
      tokenIterator = tokenizedLine.getTokenIterator();
      ref1 = tokenizedLine.tags;
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        tag = ref1[k];
        tokenIterator.next();
        if (tag < 0) {
          scope = atom.grammars.scopeForId(tag);
          if ((tag % 2) === 0) {
            null;
          } else {
            position = new Point(row, column);
            results.push({
              scope: scope,
              position: position,
              stop: stop
            });
          }
        } else {
          column += tag;
        }
      }
      results = results.filter(isValidToken);
      if (direction === 'backward') {
        results.reverse();
      }
      for (l = 0, len2 = results.length; l < len2; l++) {
        result = results[l];
        fn(result);
        if (!continueScan) {
          return;
        }
      }
      if (!continueScan) {
        return;
      }
    }
  };

  detectScopeStartPositionForScope = function(editor, fromPoint, direction, scope) {
    var point;
    point = null;
    scanForScopeStart(editor, fromPoint, direction, function(info) {
      if (info.scope.search(scope) >= 0) {
        info.stop();
        return point = info.position;
      }
    });
    return point;
  };

  isIncludeFunctionScopeForRow = function(editor, row) {
    var tokenizedLine;
    if (tokenizedLine = getTokenizedLineForRow(editor, row)) {
      return getScopesForTokenizedLine(tokenizedLine).some(function(scope) {
        return isFunctionScope(editor, scope);
      });
    } else {
      return false;
    }
  };

  isFunctionScope = function(editor, scope) {
    var pattern, scopes;
    switch (editor.getGrammar().scopeName) {
      case 'source.go':
      case 'source.elixir':
        scopes = ['entity.name.function'];
        break;
      case 'source.ruby':
        scopes = ['meta.function.', 'meta.class.', 'meta.module.'];
        break;
      default:
        scopes = ['meta.function.', 'meta.class.'];
    }
    pattern = new RegExp('^' + scopes.map(_.escapeRegExp).join('|'));
    return pattern.test(scope);
  };

  smartScrollToBufferPosition = function(editor, point) {
    var center, editorAreaHeight, editorElement, onePageDown, onePageUp, target;
    editorElement = editor.element;
    editorAreaHeight = editor.getLineHeightInPixels() * (editor.getRowsPerPage() - 1);
    onePageUp = editorElement.getScrollTop() - editorAreaHeight;
    onePageDown = editorElement.getScrollBottom() + editorAreaHeight;
    target = editorElement.pixelPositionForBufferPosition(point).top;
    center = (onePageDown < target) || (target < onePageUp);
    return editor.scrollToBufferPosition(point, {
      center: center
    });
  };

  matchScopes = function(editorElement, scopes) {
    var className, classNames, classes, containsCount, j, k, len, len1;
    classes = scopes.map(function(scope) {
      return scope.split('.');
    });
    for (j = 0, len = classes.length; j < len; j++) {
      classNames = classes[j];
      containsCount = 0;
      for (k = 0, len1 = classNames.length; k < len1; k++) {
        className = classNames[k];
        if (editorElement.classList.contains(className)) {
          containsCount += 1;
        }
      }
      if (containsCount === classNames.length) {
        return true;
      }
    }
    return false;
  };

  isSingleLineText = function(text) {
    return text.split(/\n|\r\n/).length === 1;
  };

  getWordBufferRangeAndKindAtBufferPosition = function(editor, point, options) {
    var characterAtPoint, cursor, kind, nonWordCharacters, nonWordRegex, range, ref1, singleNonWordChar, source, wordRegex;
    if (options == null) {
      options = {};
    }
    singleNonWordChar = options.singleNonWordChar, wordRegex = options.wordRegex, nonWordCharacters = options.nonWordCharacters, cursor = options.cursor;
    if ((wordRegex == null) || (nonWordCharacters == null)) {
      if (cursor == null) {
        cursor = editor.getLastCursor();
      }
      ref1 = _.extend(options, buildWordPatternByCursor(cursor, options)), wordRegex = ref1.wordRegex, nonWordCharacters = ref1.nonWordCharacters;
    }
    if (singleNonWordChar == null) {
      singleNonWordChar = true;
    }
    characterAtPoint = getRightCharacterForBufferPosition(editor, point);
    nonWordRegex = new RegExp("[" + (_.escapeRegExp(nonWordCharacters)) + "]+");
    if (/\s/.test(characterAtPoint)) {
      source = "[\t ]+";
      kind = 'white-space';
      wordRegex = new RegExp(source);
    } else if (nonWordRegex.test(characterAtPoint) && !wordRegex.test(characterAtPoint)) {
      kind = 'non-word';
      if (singleNonWordChar) {
        source = _.escapeRegExp(characterAtPoint);
        wordRegex = new RegExp(source);
      } else {
        wordRegex = nonWordRegex;
      }
    } else {
      kind = 'word';
    }
    range = getWordBufferRangeAtBufferPosition(editor, point, {
      wordRegex: wordRegex
    });
    return {
      kind: kind,
      range: range
    };
  };

  getWordPatternAtBufferPosition = function(editor, point, options) {
    var boundarizeForWord, kind, pattern, range, ref1, ref2;
    if (options == null) {
      options = {};
    }
    boundarizeForWord = (ref1 = options.boundarizeForWord) != null ? ref1 : true;
    delete options.boundarizeForWord;
    ref2 = getWordBufferRangeAndKindAtBufferPosition(editor, point, options), range = ref2.range, kind = ref2.kind;
    pattern = _.escapeRegExp(editor.getTextInBufferRange(range));
    if (kind === 'word' && boundarizeForWord) {
      pattern = "\\b" + pattern + "\\b";
    }
    return new RegExp(pattern, 'g');
  };

  getSubwordPatternAtBufferPosition = function(editor, point, options) {
    if (options == null) {
      options = {};
    }
    options = {
      wordRegex: editor.getLastCursor().subwordRegExp(),
      boundarizeForWord: false
    };
    return getWordPatternAtBufferPosition(editor, point, options);
  };

  buildWordPatternByCursor = function(cursor, arg) {
    var nonWordCharacters, wordRegex;
    wordRegex = arg.wordRegex;
    nonWordCharacters = getNonWordCharactersForCursor(cursor);
    if (wordRegex == null) {
      wordRegex = new RegExp("^[\t ]*$|[^\\s" + (_.escapeRegExp(nonWordCharacters)) + "]+");
    }
    return {
      wordRegex: wordRegex,
      nonWordCharacters: nonWordCharacters
    };
  };

  getCurrentWordBufferRangeAndKind = function(cursor, options) {
    if (options == null) {
      options = {};
    }
    return getWordBufferRangeAndKindAtBufferPosition(cursor.editor, cursor.getBufferPosition(), options);
  };

  getBeginningOfWordBufferPosition = function(editor, point, arg) {
    var found, scanRange, wordRegex;
    wordRegex = (arg != null ? arg : {}).wordRegex;
    scanRange = [[point.row, 0], point];
    found = null;
    editor.backwardsScanInBufferRange(wordRegex, scanRange, function(arg1) {
      var matchText, range, stop;
      range = arg1.range, matchText = arg1.matchText, stop = arg1.stop;
      if (matchText === '' && range.start.column !== 0) {
        return;
      }
      if (range.start.isLessThan(point)) {
        if (range.end.isGreaterThanOrEqual(point)) {
          found = range.start;
        }
        return stop();
      }
    });
    return found != null ? found : point;
  };

  getEndOfWordBufferPosition = function(editor, point, arg) {
    var found, scanRange, wordRegex;
    wordRegex = (arg != null ? arg : {}).wordRegex;
    scanRange = [point, [point.row, 2e308]];
    found = null;
    editor.scanInBufferRange(wordRegex, scanRange, function(arg1) {
      var matchText, range, stop;
      range = arg1.range, matchText = arg1.matchText, stop = arg1.stop;
      if (matchText === '' && range.start.column !== 0) {
        return;
      }
      if (range.end.isGreaterThan(point)) {
        if (range.start.isLessThanOrEqual(point)) {
          found = range.end;
        }
        return stop();
      }
    });
    return found != null ? found : point;
  };

  getWordBufferRangeAtBufferPosition = function(editor, position, options) {
    var endPosition, startPosition;
    if (options == null) {
      options = {};
    }
    endPosition = getEndOfWordBufferPosition(editor, position, options);
    startPosition = getBeginningOfWordBufferPosition(editor, endPosition, options);
    return new Range(startPosition, endPosition);
  };

  adjustRangeToRowRange = function(arg, options) {
    var end, endRow, ref1, start;
    start = arg.start, end = arg.end;
    if (options == null) {
      options = {};
    }
    endRow = end.row;
    if (end.column === 0) {
      endRow = limitNumber(end.row - 1, {
        min: start.row
      });
    }
    if ((ref1 = options.endOnly) != null ? ref1 : false) {
      return new Range(start, [endRow, 2e308]);
    } else {
      return new Range([start.row, 0], [endRow, 2e308]);
    }
  };

  shrinkRangeEndToBeforeNewLine = function(range) {
    var end, endRow, start;
    start = range.start, end = range.end;
    if (end.column === 0) {
      endRow = limitNumber(end.row - 1, {
        min: start.row
      });
      return new Range(start, [endRow, 2e308]);
    } else {
      return range;
    }
  };

  scanInRanges = function(editor, pattern, scanRanges, arg) {
    var exclusiveIntersects, i, includeIntersects, isIntersects, j, len, originalScanRanges, ranges, ref1, scanRange;
    ref1 = arg != null ? arg : {}, includeIntersects = ref1.includeIntersects, exclusiveIntersects = ref1.exclusiveIntersects;
    if (includeIntersects) {
      originalScanRanges = scanRanges.slice();
      scanRanges = scanRanges.map(adjustRangeToRowRange);
      isIntersects = function(arg1) {
        var range, scanRange;
        range = arg1.range, scanRange = arg1.scanRange;
        return scanRange.intersectsWith(range, exclusiveIntersects);
      };
    }
    ranges = [];
    for (i = j = 0, len = scanRanges.length; j < len; i = ++j) {
      scanRange = scanRanges[i];
      editor.scanInBufferRange(pattern, scanRange, function(arg1) {
        var range;
        range = arg1.range;
        if (includeIntersects) {
          if (isIntersects({
            range: range,
            scanRange: originalScanRanges[i]
          })) {
            return ranges.push(range);
          }
        } else {
          return ranges.push(range);
        }
      });
    }
    return ranges;
  };

  scanEditor = function(editor, pattern) {
    var ranges;
    ranges = [];
    editor.scan(pattern, function(arg) {
      var range;
      range = arg.range;
      return ranges.push(range);
    });
    return ranges;
  };

  collectRangeInBufferRow = function(editor, row, pattern) {
    var ranges, scanRange;
    ranges = [];
    scanRange = editor.bufferRangeForBufferRow(row);
    editor.scanInBufferRange(pattern, scanRange, function(arg) {
      var range;
      range = arg.range;
      return ranges.push(range);
    });
    return ranges;
  };

  findRangeInBufferRow = function(editor, pattern, row, arg) {
    var direction, range, scanFunctionName, scanRange;
    direction = (arg != null ? arg : {}).direction;
    if (direction === 'backward') {
      scanFunctionName = 'backwardsScanInBufferRange';
    } else {
      scanFunctionName = 'scanInBufferRange';
    }
    range = null;
    scanRange = editor.bufferRangeForBufferRow(row);
    editor[scanFunctionName](pattern, scanRange, function(event) {
      return range = event.range;
    });
    return range;
  };

  isRangeContainsSomePoint = function(range, points, arg) {
    var exclusive;
    exclusive = (arg != null ? arg : {}).exclusive;
    if (exclusive == null) {
      exclusive = false;
    }
    return points.some(function(point) {
      return range.containsPoint(point, exclusive);
    });
  };

  destroyNonLastSelection = function(editor) {
    var j, len, ref1, results1, selection;
    ref1 = editor.getSelections();
    results1 = [];
    for (j = 0, len = ref1.length; j < len; j++) {
      selection = ref1[j];
      if (!selection.isLastSelection()) {
        results1.push(selection.destroy());
      }
    }
    return results1;
  };

  getLargestFoldRangeContainsBufferRow = function(editor, row) {
    var end, endPoint, j, len, marker, markers, ref1, ref2, start, startPoint;
    markers = editor.displayLayer.foldsMarkerLayer.findMarkers({
      intersectsRow: row
    });
    startPoint = null;
    endPoint = null;
    ref1 = markers != null ? markers : [];
    for (j = 0, len = ref1.length; j < len; j++) {
      marker = ref1[j];
      ref2 = marker.getRange(), start = ref2.start, end = ref2.end;
      if (!startPoint) {
        startPoint = start;
        endPoint = end;
        continue;
      }
      if (start.isLessThan(startPoint)) {
        startPoint = start;
        endPoint = end;
      }
    }
    if ((startPoint != null) && (endPoint != null)) {
      return new Range(startPoint, endPoint);
    }
  };

  translatePointAndClip = function(editor, point, direction, arg) {
    var dontClip, eol, newRow, screenPoint, translate;
    translate = (arg != null ? arg : {}).translate;
    if (translate == null) {
      translate = true;
    }
    point = Point.fromObject(point);
    dontClip = false;
    switch (direction) {
      case 'forward':
        if (translate) {
          point = point.translate([0, +1]);
        }
        eol = editor.bufferRangeForBufferRow(point.row).end;
        if (point.isEqual(eol)) {
          dontClip = true;
        }
        if (point.isGreaterThan(eol)) {
          point = new Point(point.row + 1, 0);
          dontClip = true;
        }
        point = Point.min(point, editor.getEofBufferPosition());
        break;
      case 'backward':
        if (translate) {
          point = point.translate([0, -1]);
        }
        if (point.column < 0) {
          newRow = point.row - 1;
          eol = editor.bufferRangeForBufferRow(newRow).end;
          point = new Point(newRow, eol.column);
        }
        point = Point.max(point, Point.ZERO);
    }
    if (dontClip) {
      return point;
    } else {
      screenPoint = editor.screenPositionForBufferPosition(point, {
        clipDirection: direction
      });
      return editor.bufferPositionForScreenPosition(screenPoint);
    }
  };

  getRangeByTranslatePointAndClip = function(editor, range, which, direction, options) {
    var newPoint;
    newPoint = translatePointAndClip(editor, range[which], direction, options);
    switch (which) {
      case 'start':
        return new Range(newPoint, range.end);
      case 'end':
        return new Range(range.start, newPoint);
    }
  };

  registerElement = function(name, options) {
    var Element, element;
    element = document.createElement(name);
    if (element.constructor === HTMLElement) {
      Element = document.registerElement(name, options);
    } else {
      Element = element.constructor;
      if (options.prototype != null) {
        Element.prototype = options.prototype;
      }
    }
    return Element;
  };

  getPackage = function(name, fn) {
    return new Promise(function(resolve) {
      var disposable, pkg;
      if (atom.packages.isPackageActive(name)) {
        pkg = atom.packages.getActivePackage(name);
        return resolve(pkg);
      } else {
        return disposable = atom.packages.onDidActivatePackage(function(pkg) {
          if (pkg.name === name) {
            disposable.dispose();
            return resolve(pkg);
          }
        });
      }
    });
  };

  searchByProjectFind = function(editor, text) {
    atom.commands.dispatch(editor.element, 'project-find:show');
    return getPackage('find-and-replace').then(function(pkg) {
      var projectFindView;
      projectFindView = pkg.mainModule.projectFindView;
      if (projectFindView != null) {
        projectFindView.findEditor.setText(text);
        return projectFindView.confirm();
      }
    });
  };

  limitNumber = function(number, arg) {
    var max, min, ref1;
    ref1 = arg != null ? arg : {}, max = ref1.max, min = ref1.min;
    if (max != null) {
      number = Math.min(number, max);
    }
    if (min != null) {
      number = Math.max(number, min);
    }
    return number;
  };

  findRangeContainsPoint = function(ranges, point) {
    var j, len, range;
    for (j = 0, len = ranges.length; j < len; j++) {
      range = ranges[j];
      if (range.containsPoint(point)) {
        return range;
      }
    }
    return null;
  };

  negateFunction = function(fn) {
    return function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return !fn.apply(null, args);
    };
  };

  isEmpty = function(target) {
    return target.isEmpty();
  };

  isNotEmpty = negateFunction(isEmpty);

  isSingleLineRange = function(range) {
    return range.isSingleLine();
  };

  isNotSingleLineRange = negateFunction(isSingleLineRange);

  isLeadingWhiteSpaceRange = function(editor, range) {
    return /^[\t ]*$/.test(editor.getTextInBufferRange(range));
  };

  isNotLeadingWhiteSpaceRange = negateFunction(isLeadingWhiteSpaceRange);

  isEscapedCharRange = function(editor, range) {
    var chars;
    range = Range.fromObject(range);
    chars = getLeftCharacterForBufferPosition(editor, range.start, 2);
    return chars.endsWith('\\') && !chars.endsWith('\\\\');
  };

  setTextAtBufferPosition = function(editor, point, text) {
    return editor.setTextInBufferRange([point, point], text);
  };

  ensureEndsWithNewLineForBufferRow = function(editor, row) {
    var eol;
    if (!isEndsWithNewLineForBufferRow(editor, row)) {
      eol = getEndOfLineForBufferRow(editor, row);
      return setTextAtBufferPosition(editor, eol, "\n");
    }
  };

  forEachPaneAxis = function(fn, base) {
    var child, j, len, ref1, results1;
    if (base == null) {
      base = atom.workspace.getActivePane().getContainer().getRoot();
    }
    if (base.children != null) {
      fn(base);
      ref1 = base.children;
      results1 = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        child = ref1[j];
        results1.push(forEachPaneAxis(fn, child));
      }
      return results1;
    }
  };

  modifyClassList = function() {
    var action, classNames, element, ref1;
    action = arguments[0], element = arguments[1], classNames = 3 <= arguments.length ? slice.call(arguments, 2) : [];
    return (ref1 = element.classList)[action].apply(ref1, classNames);
  };

  addClassList = modifyClassList.bind(null, 'add');

  removeClassList = modifyClassList.bind(null, 'remove');

  toggleClassList = modifyClassList.bind(null, 'toggle');

  toggleCaseForCharacter = function(char) {
    var charLower;
    charLower = char.toLowerCase();
    if (charLower === char) {
      return char.toUpperCase();
    } else {
      return charLower;
    }
  };

  splitTextByNewLine = function(text) {
    if (text.endsWith("\n")) {
      return text.trimRight().split(/\r?\n/g);
    } else {
      return text.split(/\r?\n/g);
    }
  };

  humanizeBufferRange = function(editor, range) {
    var end, newEnd, newStart, start;
    if (isSingleLineRange(range) || isLinewiseRange(range)) {
      return range;
    }
    start = range.start, end = range.end;
    if (pointIsAtEndOfLine(editor, start)) {
      newStart = start.traverse([1, 0]);
    }
    if (pointIsAtEndOfLine(editor, end)) {
      newEnd = end.traverse([1, 0]);
    }
    if ((newStart != null) || (newEnd != null)) {
      return new Range(newStart != null ? newStart : start, newEnd != null ? newEnd : end);
    } else {
      return range;
    }
  };

  expandRangeToWhiteSpaces = function(editor, range) {
    var end, newEnd, newStart, scanRange, start;
    start = range.start, end = range.end;
    newEnd = null;
    scanRange = [end, getEndOfLineForBufferRow(editor, end.row)];
    editor.scanInBufferRange(/\S/, scanRange, function(arg) {
      var range;
      range = arg.range;
      return newEnd = range.start;
    });
    if (newEnd != null ? newEnd.isGreaterThan(end) : void 0) {
      return new Range(start, newEnd);
    }
    newStart = null;
    scanRange = [[start.row, 0], range.start];
    editor.backwardsScanInBufferRange(/\S/, scanRange, function(arg) {
      var range;
      range = arg.range;
      return newStart = range.end;
    });
    if (newStart != null ? newStart.isLessThan(start) : void 0) {
      return new Range(newStart, end);
    }
    return range;
  };

  scanEditorInDirection = function(editor, direction, pattern, options, fn) {
    var allowNextLine, from, scanFunction, scanRange;
    if (options == null) {
      options = {};
    }
    allowNextLine = options.allowNextLine, from = options.from, scanRange = options.scanRange;
    if ((from == null) && (scanRange == null)) {
      throw new Error("You must either of 'from' or 'scanRange' options");
    }
    if (scanRange) {
      allowNextLine = true;
    } else {
      if (allowNextLine == null) {
        allowNextLine = true;
      }
    }
    if (from != null) {
      from = Point.fromObject(from);
    }
    switch (direction) {
      case 'forward':
        if (scanRange == null) {
          scanRange = new Range(from, getVimEofBufferPosition(editor));
        }
        scanFunction = 'scanInBufferRange';
        break;
      case 'backward':
        if (scanRange == null) {
          scanRange = new Range([0, 0], from);
        }
        scanFunction = 'backwardsScanInBufferRange';
    }
    return editor[scanFunction](pattern, scanRange, function(event) {
      if (!allowNextLine && event.range.start.row !== from.row) {
        event.stop();
        return;
      }
      return fn(event);
    });
  };

  module.exports = {
    getParent: getParent,
    getAncestors: getAncestors,
    getKeyBindingForCommand: getKeyBindingForCommand,
    include: include,
    debug: debug,
    saveEditorState: saveEditorState,
    getKeystrokeForEvent: getKeystrokeForEvent,
    getCharacterForEvent: getCharacterForEvent,
    isLinewiseRange: isLinewiseRange,
    isEndsWithNewLineForBufferRow: isEndsWithNewLineForBufferRow,
    haveSomeNonEmptySelection: haveSomeNonEmptySelection,
    sortRanges: sortRanges,
    sortRangesByEndPosition: sortRangesByEndPosition,
    getIndex: getIndex,
    getVisibleBufferRange: getVisibleBufferRange,
    withVisibleBufferRange: withVisibleBufferRange,
    getVisibleEditors: getVisibleEditors,
    findIndexBy: findIndexBy,
    mergeIntersectingRanges: mergeIntersectingRanges,
    pointIsAtEndOfLine: pointIsAtEndOfLine,
    pointIsOnWhiteSpace: pointIsOnWhiteSpace,
    pointIsAtEndOfLineAtNonEmptyRow: pointIsAtEndOfLineAtNonEmptyRow,
    pointIsAtVimEndOfFile: pointIsAtVimEndOfFile,
    cursorIsAtVimEndOfFile: cursorIsAtVimEndOfFile,
    getVimEofBufferPosition: getVimEofBufferPosition,
    getVimEofScreenPosition: getVimEofScreenPosition,
    getVimLastBufferRow: getVimLastBufferRow,
    getVimLastScreenRow: getVimLastScreenRow,
    setBufferRow: setBufferRow,
    setBufferColumn: setBufferColumn,
    moveCursorLeft: moveCursorLeft,
    moveCursorRight: moveCursorRight,
    moveCursorUpScreen: moveCursorUpScreen,
    moveCursorDownScreen: moveCursorDownScreen,
    getEndOfLineForBufferRow: getEndOfLineForBufferRow,
    getFirstVisibleScreenRow: getFirstVisibleScreenRow,
    getLastVisibleScreenRow: getLastVisibleScreenRow,
    getValidVimBufferRow: getValidVimBufferRow,
    getValidVimScreenRow: getValidVimScreenRow,
    moveCursorToFirstCharacterAtRow: moveCursorToFirstCharacterAtRow,
    getLineTextToBufferPosition: getLineTextToBufferPosition,
    getIndentLevelForBufferRow: getIndentLevelForBufferRow,
    isAllWhiteSpaceText: isAllWhiteSpaceText,
    getTextInScreenRange: getTextInScreenRange,
    moveCursorToNextNonWhitespace: moveCursorToNextNonWhitespace,
    isEmptyRow: isEmptyRow,
    cursorIsAtEndOfLineAtNonEmptyRow: cursorIsAtEndOfLineAtNonEmptyRow,
    getCodeFoldRowRanges: getCodeFoldRowRanges,
    getCodeFoldRowRangesContainesForRow: getCodeFoldRowRangesContainesForRow,
    getBufferRangeForRowRange: getBufferRangeForRowRange,
    trimRange: trimRange,
    getFirstCharacterPositionForBufferRow: getFirstCharacterPositionForBufferRow,
    getFirstCharacterBufferPositionForScreenRow: getFirstCharacterBufferPositionForScreenRow,
    isFunctionScope: isFunctionScope,
    isIncludeFunctionScopeForRow: isIncludeFunctionScopeForRow,
    getTokenizedLineForRow: getTokenizedLineForRow,
    getScopesForTokenizedLine: getScopesForTokenizedLine,
    scanForScopeStart: scanForScopeStart,
    detectScopeStartPositionForScope: detectScopeStartPositionForScope,
    getBufferRows: getBufferRows,
    registerElement: registerElement,
    sortComparable: sortComparable,
    smartScrollToBufferPosition: smartScrollToBufferPosition,
    matchScopes: matchScopes,
    moveCursorDownBuffer: moveCursorDownBuffer,
    moveCursorUpBuffer: moveCursorUpBuffer,
    isSingleLineText: isSingleLineText,
    getCurrentWordBufferRangeAndKind: getCurrentWordBufferRangeAndKind,
    buildWordPatternByCursor: buildWordPatternByCursor,
    getWordBufferRangeAtBufferPosition: getWordBufferRangeAtBufferPosition,
    getWordBufferRangeAndKindAtBufferPosition: getWordBufferRangeAndKindAtBufferPosition,
    getWordPatternAtBufferPosition: getWordPatternAtBufferPosition,
    getSubwordPatternAtBufferPosition: getSubwordPatternAtBufferPosition,
    getNonWordCharactersForCursor: getNonWordCharactersForCursor,
    adjustRangeToRowRange: adjustRangeToRowRange,
    shrinkRangeEndToBeforeNewLine: shrinkRangeEndToBeforeNewLine,
    scanInRanges: scanInRanges,
    scanEditor: scanEditor,
    collectRangeInBufferRow: collectRangeInBufferRow,
    findRangeInBufferRow: findRangeInBufferRow,
    isRangeContainsSomePoint: isRangeContainsSomePoint,
    destroyNonLastSelection: destroyNonLastSelection,
    getLargestFoldRangeContainsBufferRow: getLargestFoldRangeContainsBufferRow,
    translatePointAndClip: translatePointAndClip,
    getRangeByTranslatePointAndClip: getRangeByTranslatePointAndClip,
    getPackage: getPackage,
    searchByProjectFind: searchByProjectFind,
    limitNumber: limitNumber,
    findRangeContainsPoint: findRangeContainsPoint,
    isEmpty: isEmpty,
    isNotEmpty: isNotEmpty,
    isSingleLineRange: isSingleLineRange,
    isNotSingleLineRange: isNotSingleLineRange,
    setTextAtBufferPosition: setTextAtBufferPosition,
    ensureEndsWithNewLineForBufferRow: ensureEndsWithNewLineForBufferRow,
    isLeadingWhiteSpaceRange: isLeadingWhiteSpaceRange,
    isNotLeadingWhiteSpaceRange: isNotLeadingWhiteSpaceRange,
    isEscapedCharRange: isEscapedCharRange,
    forEachPaneAxis: forEachPaneAxis,
    addClassList: addClassList,
    removeClassList: removeClassList,
    toggleClassList: toggleClassList,
    toggleCaseForCharacter: toggleCaseForCharacter,
    splitTextByNewLine: splitTextByNewLine,
    humanizeBufferRange: humanizeBufferRange,
    expandRangeToWhiteSpaces: expandRangeToWhiteSpaces,
    getRightCharacterForBufferPosition: getRightCharacterForBufferPosition,
    getLeftCharacterForBufferPosition: getLeftCharacterForBufferPosition,
    scanEditorInDirection: scanEditorInDirection
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvdXRpbHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxvcEZBQUE7SUFBQTs7RUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSOztFQUVYLE1BQTZCLE9BQUEsQ0FBUSxNQUFSLENBQTdCLEVBQUMsMkJBQUQsRUFBYSxpQkFBYixFQUFvQjs7RUFDcEIsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSixTQUFBLEdBQVksU0FBQyxHQUFEO0FBQ1YsUUFBQTtnREFBYSxDQUFFO0VBREw7O0VBR1osWUFBQSxHQUFlLFNBQUMsR0FBRDtBQUNiLFFBQUE7SUFBQSxTQUFBLEdBQVk7SUFDWixPQUFBLEdBQVU7QUFDVixXQUFBLElBQUE7TUFDRSxTQUFTLENBQUMsSUFBVixDQUFlLE9BQWY7TUFDQSxPQUFBLEdBQVUsU0FBQSxDQUFVLE9BQVY7TUFDVixJQUFBLENBQWEsT0FBYjtBQUFBLGNBQUE7O0lBSEY7V0FJQTtFQVBhOztFQVNmLHVCQUFBLEdBQTBCLFNBQUMsT0FBRCxFQUFVLEdBQVY7QUFDeEIsUUFBQTtJQURtQyxjQUFEO0lBQ2xDLE9BQUEsR0FBVTtJQUNWLE9BQUEsR0FBVSxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWIsQ0FBQTtJQUNWLElBQUcsbUJBQUg7TUFDRSxVQUFBLEdBQWEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixXQUEvQixDQUEyQyxDQUFDLGNBQTVDLENBQUEsQ0FBNEQsQ0FBQyxHQUE3RCxDQUFBO01BQ2IsT0FBQSxHQUFVLE9BQU8sQ0FBQyxNQUFSLENBQWUsU0FBQyxJQUFEO0FBQWMsWUFBQTtRQUFaLFNBQUQ7ZUFBYSxNQUFBLEtBQVU7TUFBeEIsQ0FBZixFQUZaOztB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QUFBLDZCQTFFZTtJQTJFZix1QkFBQSxxQkEzRWU7SUE0RWYsK0JBQUEsNkJBNUVlO0lBNkVmLGNBQUEsWUE3RWU7SUE4RWYsWUFBQSxVQTlFZTtJQStFZix5QkFBQSx1QkEvRWU7SUFnRmYsc0JBQUEsb0JBaEZlO0lBaUZmLDBCQUFBLHdCQWpGZTtJQWtGZix5QkFBQSx1QkFsRmU7SUFtRmYsc0NBQUEsb0NBbkZlO0lBb0ZmLHVCQUFBLHFCQXBGZTtJQXFGZixpQ0FBQSwrQkFyRmU7SUFzRmYsWUFBQSxVQXRGZTtJQXVGZixxQkFBQSxtQkF2RmU7SUF3RmYsYUFBQSxXQXhGZTtJQXlGZix3QkFBQSxzQkF6RmU7SUEyRmYsU0FBQSxPQTNGZTtJQTJGTixZQUFBLFVBM0ZNO0lBNEZmLG1CQUFBLGlCQTVGZTtJQTRGSSxzQkFBQSxvQkE1Rko7SUE4RmYseUJBQUEsdUJBOUZlO0lBK0ZmLG1DQUFBLGlDQS9GZTtJQWdHZiwwQkFBQSx3QkFoR2U7SUFpR2YsNkJBQUEsMkJBakdlO0lBa0dmLG9CQUFBLGtCQWxHZTtJQW9HZixpQkFBQSxlQXBHZTtJQXFHZixjQUFBLFlBckdlO0lBc0dmLGlCQUFBLGVBdEdlO0lBdUdmLGlCQUFBLGVBdkdlO0lBd0dmLHdCQUFBLHNCQXhHZTtJQXlHZixvQkFBQSxrQkF6R2U7SUEwR2YscUJBQUEsbUJBMUdlO0lBMkdmLDBCQUFBLHdCQTNHZTtJQTRHZixvQ0FBQSxrQ0E1R2U7SUE2R2YsbUNBQUEsaUNBN0dlO0lBOEdmLHVCQUFBLHFCQTlHZTs7QUE3MkJqQiIsInNvdXJjZXNDb250ZW50IjpbImZzID0gcmVxdWlyZSAnZnMtcGx1cydcbnNldHRpbmdzID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxue0Rpc3Bvc2FibGUsIFJhbmdlLCBQb2ludH0gPSByZXF1aXJlICdhdG9tJ1xuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxuZ2V0UGFyZW50ID0gKG9iaikgLT5cbiAgb2JqLl9fc3VwZXJfXz8uY29uc3RydWN0b3JcblxuZ2V0QW5jZXN0b3JzID0gKG9iaikgLT5cbiAgYW5jZXN0b3JzID0gW11cbiAgY3VycmVudCA9IG9ialxuICBsb29wXG4gICAgYW5jZXN0b3JzLnB1c2goY3VycmVudClcbiAgICBjdXJyZW50ID0gZ2V0UGFyZW50KGN1cnJlbnQpXG4gICAgYnJlYWsgdW5sZXNzIGN1cnJlbnRcbiAgYW5jZXN0b3JzXG5cbmdldEtleUJpbmRpbmdGb3JDb21tYW5kID0gKGNvbW1hbmQsIHtwYWNrYWdlTmFtZX0pIC0+XG4gIHJlc3VsdHMgPSBudWxsXG4gIGtleW1hcHMgPSBhdG9tLmtleW1hcHMuZ2V0S2V5QmluZGluZ3MoKVxuICBpZiBwYWNrYWdlTmFtZT9cbiAgICBrZXltYXBQYXRoID0gYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKHBhY2thZ2VOYW1lKS5nZXRLZXltYXBQYXRocygpLnBvcCgpXG4gICAga2V5bWFwcyA9IGtleW1hcHMuZmlsdGVyKCh7c291cmNlfSkgLT4gc291cmNlIGlzIGtleW1hcFBhdGgpXG5cbiAgZm9yIGtleW1hcCBpbiBrZXltYXBzIHdoZW4ga2V5bWFwLmNvbW1hbmQgaXMgY29tbWFuZFxuICAgIHtrZXlzdHJva2VzLCBzZWxlY3Rvcn0gPSBrZXltYXBcbiAgICBrZXlzdHJva2VzID0ga2V5c3Ryb2tlcy5yZXBsYWNlKC9zaGlmdC0vLCAnJylcbiAgICAocmVzdWx0cyA/PSBbXSkucHVzaCh7a2V5c3Ryb2tlcywgc2VsZWN0b3J9KVxuICByZXN1bHRzXG5cbiMgSW5jbHVkZSBtb2R1bGUob2JqZWN0IHdoaWNoIG5vcm1hbHkgcHJvdmlkZXMgc2V0IG9mIG1ldGhvZHMpIHRvIGtsYXNzXG5pbmNsdWRlID0gKGtsYXNzLCBtb2R1bGUpIC0+XG4gIGZvciBrZXksIHZhbHVlIG9mIG1vZHVsZVxuICAgIGtsYXNzOjpba2V5XSA9IHZhbHVlXG5cbmRlYnVnID0gKG1lc3NhZ2VzLi4uKSAtPlxuICByZXR1cm4gdW5sZXNzIHNldHRpbmdzLmdldCgnZGVidWcnKVxuICBzd2l0Y2ggc2V0dGluZ3MuZ2V0KCdkZWJ1Z091dHB1dCcpXG4gICAgd2hlbiAnY29uc29sZSdcbiAgICAgIGNvbnNvbGUubG9nIG1lc3NhZ2VzLi4uXG4gICAgd2hlbiAnZmlsZSdcbiAgICAgIGZpbGVQYXRoID0gZnMubm9ybWFsaXplIHNldHRpbmdzLmdldCgnZGVidWdPdXRwdXRGaWxlUGF0aCcpXG4gICAgICBpZiBmcy5leGlzdHNTeW5jKGZpbGVQYXRoKVxuICAgICAgICBmcy5hcHBlbmRGaWxlU3luYyBmaWxlUGF0aCwgbWVzc2FnZXMgKyBcIlxcblwiXG5cbiMgUmV0dXJuIGZ1bmN0aW9uIHRvIHJlc3RvcmUgZWRpdG9yJ3Mgc2Nyb2xsVG9wIGFuZCBmb2xkIHN0YXRlLlxuc2F2ZUVkaXRvclN0YXRlID0gKGVkaXRvcikgLT5cbiAgZWRpdG9yRWxlbWVudCA9IGVkaXRvci5lbGVtZW50XG4gIHNjcm9sbFRvcCA9IGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKClcblxuICBmb2xkU3RhcnRSb3dzID0gZWRpdG9yLmRpc3BsYXlMYXllci5mb2xkc01hcmtlckxheWVyLmZpbmRNYXJrZXJzKHt9KS5tYXAgKG0pIC0+IG0uZ2V0U3RhcnRQb3NpdGlvbigpLnJvd1xuICAtPlxuICAgIGZvciByb3cgaW4gZm9sZFN0YXJ0Um93cy5yZXZlcnNlKCkgd2hlbiBub3QgZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3cocm93KVxuICAgICAgZWRpdG9yLmZvbGRCdWZmZXJSb3cocm93KVxuICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKHNjcm9sbFRvcClcblxuZ2V0S2V5c3Ryb2tlRm9yRXZlbnQgPSAoZXZlbnQpIC0+XG4gIGtleWJvYXJkRXZlbnQgPSBldmVudC5vcmlnaW5hbEV2ZW50Lm9yaWdpbmFsRXZlbnQgPyBldmVudC5vcmlnaW5hbEV2ZW50XG4gIGF0b20ua2V5bWFwcy5rZXlzdHJva2VGb3JLZXlib2FyZEV2ZW50KGtleWJvYXJkRXZlbnQpXG5cbmtleXN0cm9rZVRvQ2hhckNvZGUgPVxuICBiYWNrc3BhY2U6IDhcbiAgdGFiOiA5XG4gIGVudGVyOiAxM1xuICBlc2NhcGU6IDI3XG4gIHNwYWNlOiAzMlxuICBkZWxldGU6IDEyN1xuXG5nZXRDaGFyYWN0ZXJGb3JFdmVudCA9IChldmVudCkgLT5cbiAga2V5c3Ryb2tlID0gZ2V0S2V5c3Ryb2tlRm9yRXZlbnQoZXZlbnQpXG4gIGlmIGNoYXJDb2RlID0ga2V5c3Ryb2tlVG9DaGFyQ29kZVtrZXlzdHJva2VdXG4gICAgU3RyaW5nLmZyb21DaGFyQ29kZShjaGFyQ29kZSlcbiAgZWxzZVxuICAgIGtleXN0cm9rZVxuXG5pc0xpbmV3aXNlUmFuZ2UgPSAoe3N0YXJ0LCBlbmR9KSAtPlxuICAoc3RhcnQucm93IGlzbnQgZW5kLnJvdykgYW5kIChzdGFydC5jb2x1bW4gaXMgZW5kLmNvbHVtbiBpcyAwKVxuXG5pc0VuZHNXaXRoTmV3TGluZUZvckJ1ZmZlclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAge3N0YXJ0LCBlbmR9ID0gZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHJvdywgaW5jbHVkZU5ld2xpbmU6IHRydWUpXG4gIHN0YXJ0LnJvdyBpc250IGVuZC5yb3dcblxuaGF2ZVNvbWVOb25FbXB0eVNlbGVjdGlvbiA9IChlZGl0b3IpIC0+XG4gIGVkaXRvci5nZXRTZWxlY3Rpb25zKCkuc29tZShpc05vdEVtcHR5KVxuXG5zb3J0Q29tcGFyYWJsZSA9IChjb2xsZWN0aW9uKSAtPlxuICBjb2xsZWN0aW9uLnNvcnQgKGEsIGIpIC0+IGEuY29tcGFyZShiKVxuXG5zb3J0UmFuZ2VzID0gc29ydENvbXBhcmFibGVcblxuc29ydFJhbmdlc0J5RW5kUG9zaXRpb24gPSAocmFuZ2VzLCBmbikgLT5cbiAgcmFuZ2VzLnNvcnQoKGEsIGIpIC0+IGEuZW5kLmNvbXBhcmUoYi5lbmQpKVxuXG4jIFJldHVybiBhZGp1c3RlZCBpbmRleCBmaXQgd2hpdGluIGdpdmVuIGxpc3QncyBsZW5ndGhcbiMgcmV0dXJuIC0xIGlmIGxpc3QgaXMgZW1wdHkuXG5nZXRJbmRleCA9IChpbmRleCwgbGlzdCkgLT5cbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGhcbiAgaWYgbGVuZ3RoIGlzIDBcbiAgICAtMVxuICBlbHNlXG4gICAgaW5kZXggPSBpbmRleCAlIGxlbmd0aFxuICAgIGlmIGluZGV4ID49IDBcbiAgICAgIGluZGV4XG4gICAgZWxzZVxuICAgICAgbGVuZ3RoICsgaW5kZXhcblxud2l0aFZpc2libGVCdWZmZXJSYW5nZSA9IChlZGl0b3IsIGZuKSAtPlxuICBpZiByYW5nZSA9IGdldFZpc2libGVCdWZmZXJSYW5nZShlZGl0b3IpXG4gICAgZm4ocmFuZ2UpXG4gIGVsc2VcbiAgICBkaXNwb3NhYmxlID0gZWRpdG9yLmVsZW1lbnQub25EaWRBdHRhY2ggLT5cbiAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAgICByYW5nZSA9IGdldFZpc2libGVCdWZmZXJSYW5nZShlZGl0b3IpXG4gICAgICBmbihyYW5nZSlcblxuIyBOT1RFOiBlbmRSb3cgYmVjb21lIHVuZGVmaW5lZCBpZiBAZWRpdG9yRWxlbWVudCBpcyBub3QgeWV0IGF0dGFjaGVkLlxuIyBlLmcuIEJlZ2luZyBjYWxsZWQgaW1tZWRpYXRlbHkgYWZ0ZXIgb3BlbiBmaWxlLlxuZ2V0VmlzaWJsZUJ1ZmZlclJhbmdlID0gKGVkaXRvcikgLT5cbiAgW3N0YXJ0Um93LCBlbmRSb3ddID0gZWRpdG9yLmVsZW1lbnQuZ2V0VmlzaWJsZVJvd1JhbmdlKClcbiAgcmV0dXJuIG51bGwgdW5sZXNzIChzdGFydFJvdz8gYW5kIGVuZFJvdz8pXG4gIHN0YXJ0Um93ID0gZWRpdG9yLmJ1ZmZlclJvd0ZvclNjcmVlblJvdyhzdGFydFJvdylcbiAgZW5kUm93ID0gZWRpdG9yLmJ1ZmZlclJvd0ZvclNjcmVlblJvdyhlbmRSb3cpXG4gIG5ldyBSYW5nZShbc3RhcnRSb3csIDBdLCBbZW5kUm93LCBJbmZpbml0eV0pXG5cbmdldFZpc2libGVFZGl0b3JzID0gLT5cbiAgZm9yIHBhbmUgaW4gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKSB3aGVuIGVkaXRvciA9IHBhbmUuZ2V0QWN0aXZlRWRpdG9yKClcbiAgICBlZGl0b3JcblxuZmluZEluZGV4QnkgPSAobGlzdCwgZm4pIC0+XG4gIGZvciBpdGVtLCBpIGluIGxpc3Qgd2hlbiBmbihpdGVtKVxuICAgIHJldHVybiBpXG4gIG51bGxcblxubWVyZ2VJbnRlcnNlY3RpbmdSYW5nZXMgPSAocmFuZ2VzKSAtPlxuICByZXN1bHQgPSBbXVxuICBmb3IgcmFuZ2UsIGkgaW4gcmFuZ2VzXG4gICAgaWYgaW5kZXggPSBmaW5kSW5kZXhCeShyZXN1bHQsIChyKSAtPiByLmludGVyc2VjdHNXaXRoKHJhbmdlKSlcbiAgICAgIHJlc3VsdFtpbmRleF0gPSByZXN1bHRbaW5kZXhdLnVuaW9uKHJhbmdlKVxuICAgIGVsc2VcbiAgICAgIHJlc3VsdC5wdXNoKHJhbmdlKVxuICByZXN1bHRcblxuZ2V0RW5kT2ZMaW5lRm9yQnVmZmVyUm93ID0gKGVkaXRvciwgcm93KSAtPlxuICBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocm93KS5lbmRcblxuIyBQb2ludCB1dGlsXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbnBvaW50SXNBdEVuZE9mTGluZSA9IChlZGl0b3IsIHBvaW50KSAtPlxuICBwb2ludCA9IFBvaW50LmZyb21PYmplY3QocG9pbnQpXG4gIGdldEVuZE9mTGluZUZvckJ1ZmZlclJvdyhlZGl0b3IsIHBvaW50LnJvdykuaXNFcXVhbChwb2ludClcblxucG9pbnRJc09uV2hpdGVTcGFjZSA9IChlZGl0b3IsIHBvaW50KSAtPlxuICBpc0FsbFdoaXRlU3BhY2VUZXh0KGdldFJpZ2h0Q2hhcmFjdGVyRm9yQnVmZmVyUG9zaXRpb24oZWRpdG9yLCBwb2ludCkpXG5cbnBvaW50SXNBdEVuZE9mTGluZUF0Tm9uRW1wdHlSb3cgPSAoZWRpdG9yLCBwb2ludCkgLT5cbiAgcG9pbnQgPSBQb2ludC5mcm9tT2JqZWN0KHBvaW50KVxuICBwb2ludC5jb2x1bW4gaXNudCAwIGFuZCBwb2ludElzQXRFbmRPZkxpbmUoZWRpdG9yLCBwb2ludClcblxucG9pbnRJc0F0VmltRW5kT2ZGaWxlID0gKGVkaXRvciwgcG9pbnQpIC0+XG4gIGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKGVkaXRvcikuaXNFcXVhbChwb2ludClcblxuaXNFbXB0eVJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHJvdykuaXNFbXB0eSgpXG5cbiMgQ3Vyc29yIHN0YXRlIHZhbGlkYXRlaW9uXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmN1cnNvcklzQXRFbmRPZkxpbmVBdE5vbkVtcHR5Um93ID0gKGN1cnNvcikgLT5cbiAgcG9pbnRJc0F0RW5kT2ZMaW5lQXROb25FbXB0eVJvdyhjdXJzb3IuZWRpdG9yLCBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcblxuY3Vyc29ySXNBdFZpbUVuZE9mRmlsZSA9IChjdXJzb3IpIC0+XG4gIHBvaW50SXNBdFZpbUVuZE9mRmlsZShjdXJzb3IuZWRpdG9yLCBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5nZXRSaWdodENoYXJhY3RlckZvckJ1ZmZlclBvc2l0aW9uID0gKGVkaXRvciwgcG9pbnQsIGFtb3VudD0xKSAtPlxuICBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoUmFuZ2UuZnJvbVBvaW50V2l0aERlbHRhKHBvaW50LCAwLCBhbW91bnQpKVxuXG5nZXRMZWZ0Q2hhcmFjdGVyRm9yQnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCwgYW1vdW50PTEpIC0+XG4gIGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShSYW5nZS5mcm9tUG9pbnRXaXRoRGVsdGEocG9pbnQsIDAsIC1hbW91bnQpKVxuXG5nZXRUZXh0SW5TY3JlZW5SYW5nZSA9IChlZGl0b3IsIHNjcmVlblJhbmdlKSAtPlxuICBidWZmZXJSYW5nZSA9IGVkaXRvci5idWZmZXJSYW5nZUZvclNjcmVlblJhbmdlKHNjcmVlblJhbmdlKVxuICBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoYnVmZmVyUmFuZ2UpXG5cbmdldE5vbldvcmRDaGFyYWN0ZXJzRm9yQ3Vyc29yID0gKGN1cnNvcikgLT5cbiAgIyBBdG9tIDEuMTEuMC1iZXRhNSBoYXZlIHRoaXMgZXhwZXJpbWVudGFsIG1ldGhvZC5cbiAgaWYgY3Vyc29yLmdldE5vbldvcmRDaGFyYWN0ZXJzP1xuICAgIGN1cnNvci5nZXROb25Xb3JkQ2hhcmFjdGVycygpXG4gIGVsc2VcbiAgICBzY29wZSA9IGN1cnNvci5nZXRTY29wZURlc2NyaXB0b3IoKS5nZXRTY29wZXNBcnJheSgpXG4gICAgYXRvbS5jb25maWcuZ2V0KCdlZGl0b3Iubm9uV29yZENoYXJhY3RlcnMnLCB7c2NvcGV9KVxuXG4jIEZJWE1FOiByZW1vdmUgdGhpc1xuIyByZXR1cm4gdHJ1ZSBpZiBtb3ZlZFxubW92ZUN1cnNvclRvTmV4dE5vbldoaXRlc3BhY2UgPSAoY3Vyc29yKSAtPlxuICBvcmlnaW5hbFBvaW50ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgZWRpdG9yID0gY3Vyc29yLmVkaXRvclxuICB2aW1Fb2YgPSBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbihlZGl0b3IpXG5cbiAgd2hpbGUgcG9pbnRJc09uV2hpdGVTcGFjZShlZGl0b3IsIHBvaW50ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpIGFuZCBub3QgcG9pbnQuaXNHcmVhdGVyVGhhbk9yRXF1YWwodmltRW9mKVxuICAgIGN1cnNvci5tb3ZlUmlnaHQoKVxuICBub3Qgb3JpZ2luYWxQb2ludC5pc0VxdWFsKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuXG5nZXRCdWZmZXJSb3dzID0gKGVkaXRvciwge3N0YXJ0Um93LCBkaXJlY3Rpb259KSAtPlxuICBzd2l0Y2ggZGlyZWN0aW9uXG4gICAgd2hlbiAncHJldmlvdXMnXG4gICAgICBpZiBzdGFydFJvdyA8PSAwXG4gICAgICAgIFtdXG4gICAgICBlbHNlXG4gICAgICAgIFsoc3RhcnRSb3cgLSAxKS4uMF1cbiAgICB3aGVuICduZXh0J1xuICAgICAgZW5kUm93ID0gZ2V0VmltTGFzdEJ1ZmZlclJvdyhlZGl0b3IpXG4gICAgICBpZiBzdGFydFJvdyA+PSBlbmRSb3dcbiAgICAgICAgW11cbiAgICAgIGVsc2VcbiAgICAgICAgWyhzdGFydFJvdyArIDEpLi5lbmRSb3ddXG5cbiMgUmV0dXJuIFZpbSdzIEVPRiBwb3NpdGlvbiByYXRoZXIgdGhhbiBBdG9tJ3MgRU9GIHBvc2l0aW9uLlxuIyBUaGlzIGZ1bmN0aW9uIGNoYW5nZSBtZWFuaW5nIG9mIEVPRiBmcm9tIG5hdGl2ZSBUZXh0RWRpdG9yOjpnZXRFb2ZCdWZmZXJQb3NpdGlvbigpXG4jIEF0b20gaXMgc3BlY2lhbChzdHJhbmdlKSBmb3IgY3Vyc29yIGNhbiBwYXN0IHZlcnkgbGFzdCBuZXdsaW5lIGNoYXJhY3Rlci5cbiMgQmVjYXVzZSBvZiB0aGlzLCBBdG9tJ3MgRU9GIHBvc2l0aW9uIGlzIFthY3R1YWxMYXN0Um93KzEsIDBdIHByb3ZpZGVkIGxhc3Qtbm9uLWJsYW5rLXJvd1xuIyBlbmRzIHdpdGggbmV3bGluZSBjaGFyLlxuIyBCdXQgaW4gVmltLCBjdXJvciBjYW4gTk9UIHBhc3QgbGFzdCBuZXdsaW5lLiBFT0YgaXMgbmV4dCBwb3NpdGlvbiBvZiB2ZXJ5IGxhc3QgY2hhcmFjdGVyLlxuZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yKSAtPlxuICBlb2YgPSBlZGl0b3IuZ2V0RW9mQnVmZmVyUG9zaXRpb24oKVxuICBpZiAoZW9mLnJvdyBpcyAwKSBvciAoZW9mLmNvbHVtbiA+IDApXG4gICAgZW9mXG4gIGVsc2VcbiAgICBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3coZWRpdG9yLCBlb2Yucm93IC0gMSlcblxuZ2V0VmltRW9mU2NyZWVuUG9zaXRpb24gPSAoZWRpdG9yKSAtPlxuICBlZGl0b3Iuc2NyZWVuUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbihnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbihlZGl0b3IpKVxuXG5nZXRWaW1MYXN0QnVmZmVyUm93ID0gKGVkaXRvcikgLT4gZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oZWRpdG9yKS5yb3dcbmdldFZpbUxhc3RTY3JlZW5Sb3cgPSAoZWRpdG9yKSAtPiBnZXRWaW1Fb2ZTY3JlZW5Qb3NpdGlvbihlZGl0b3IpLnJvd1xuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93ID0gKGVkaXRvcikgLT4gZWRpdG9yLmVsZW1lbnQuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbmdldExhc3RWaXNpYmxlU2NyZWVuUm93ID0gKGVkaXRvcikgLT4gZWRpdG9yLmVsZW1lbnQuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKVxuXG5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93ID0gKGVkaXRvciwgcm93KSAtPlxuICByYW5nZSA9IGZpbmRSYW5nZUluQnVmZmVyUm93KGVkaXRvciwgL1xcUy8sIHJvdylcbiAgcmFuZ2U/LnN0YXJ0ID8gbmV3IFBvaW50KHJvdywgMClcblxuZ2V0Rmlyc3RDaGFyYWN0ZXJCdWZmZXJQb3NpdGlvbkZvclNjcmVlblJvdyA9IChlZGl0b3IsIHNjcmVlblJvdykgLT5cbiAgc3RhcnQgPSBlZGl0b3IuY2xpcFNjcmVlblBvc2l0aW9uKFtzY3JlZW5Sb3csIDBdLCBza2lwU29mdFdyYXBJbmRlbnRhdGlvbjogdHJ1ZSlcbiAgZW5kID0gW3NjcmVlblJvdywgSW5maW5pdHldXG5cbiAgcG9pbnQgPSBudWxsXG4gIHNjYW5SYW5nZSA9IGVkaXRvci5idWZmZXJSYW5nZUZvclNjcmVlblJhbmdlKFtzdGFydCwgZW5kXSlcbiAgZWRpdG9yLnNjYW5JbkJ1ZmZlclJhbmdlIC9cXFMvLCBzY2FuUmFuZ2UsICh7cmFuZ2V9KSAtPlxuICAgIHBvaW50ID0gcmFuZ2Uuc3RhcnRcbiAgcG9pbnQgPyBzY2FuUmFuZ2Uuc3RhcnRcblxudHJpbVJhbmdlID0gKGVkaXRvciwgc2NhblJhbmdlKSAtPlxuICBwYXR0ZXJuID0gL1xcUy9cbiAgW3N0YXJ0LCBlbmRdID0gW11cbiAgc2V0U3RhcnQgPSAoe3JhbmdlfSkgLT4ge3N0YXJ0fSA9IHJhbmdlXG4gIHNldEVuZCA9ICh7cmFuZ2V9KSAtPiB7ZW5kfSA9IHJhbmdlXG4gIGVkaXRvci5zY2FuSW5CdWZmZXJSYW5nZShwYXR0ZXJuLCBzY2FuUmFuZ2UsIHNldFN0YXJ0KVxuICBlZGl0b3IuYmFja3dhcmRzU2NhbkluQnVmZmVyUmFuZ2UocGF0dGVybiwgc2NhblJhbmdlLCBzZXRFbmQpIGlmIHN0YXJ0P1xuICBpZiBzdGFydD8gYW5kIGVuZD9cbiAgICBuZXcgUmFuZ2Uoc3RhcnQsIGVuZClcbiAgZWxzZVxuICAgIHNjYW5SYW5nZVxuXG4jIEN1cnNvciBtb3Rpb24gd3JhcHBlclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEp1c3QgdXBkYXRlIGJ1ZmZlclJvdyB3aXRoIGtlZXBpbmcgY29sdW1uIGJ5IHJlc3BlY3RpbmcgZ29hbENvbHVtblxuc2V0QnVmZmVyUm93ID0gKGN1cnNvciwgcm93LCBvcHRpb25zKSAtPlxuICBjb2x1bW4gPSBjdXJzb3IuZ29hbENvbHVtbiA/IGN1cnNvci5nZXRCdWZmZXJDb2x1bW4oKVxuICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW3JvdywgY29sdW1uXSwgb3B0aW9ucylcbiAgY3Vyc29yLmdvYWxDb2x1bW4gPSBjb2x1bW5cblxuc2V0QnVmZmVyQ29sdW1uID0gKGN1cnNvciwgY29sdW1uKSAtPlxuICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW2N1cnNvci5nZXRCdWZmZXJSb3coKSwgY29sdW1uXSlcblxubW92ZUN1cnNvciA9IChjdXJzb3IsIHtwcmVzZXJ2ZUdvYWxDb2x1bW59LCBmbikgLT5cbiAge2dvYWxDb2x1bW59ID0gY3Vyc29yXG4gIGZuKGN1cnNvcilcbiAgaWYgcHJlc2VydmVHb2FsQ29sdW1uIGFuZCBnb2FsQ29sdW1uP1xuICAgIGN1cnNvci5nb2FsQ29sdW1uID0gZ29hbENvbHVtblxuXG4jIFdvcmthcm91bmQgaXNzdWUgZm9yIHQ5bWQvdmltLW1vZGUtcGx1cyMyMjYgYW5kIGF0b20vYXRvbSMzMTc0XG4jIEkgY2Fubm90IGRlcGVuZCBjdXJzb3IncyBjb2x1bW4gc2luY2UgaXRzIGNsYWltIDAgYW5kIGNsaXBwaW5nIGVtbXVsYXRpb24gZG9uJ3RcbiMgcmV0dXJuIHdyYXBwZWQgbGluZSwgYnV0IEl0IGFjdHVhbGx5IHdyYXAsIHNvIEkgbmVlZCB0byBkbyB2ZXJ5IGRpcnR5IHdvcmsgdG9cbiMgcHJlZGljdCB3cmFwIGh1cmlzdGljYWxseS5cbnNob3VsZFByZXZlbnRXcmFwTGluZSA9IChjdXJzb3IpIC0+XG4gIHtyb3csIGNvbHVtbn0gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5zb2Z0VGFicycpXG4gICAgdGFiTGVuZ3RoID0gYXRvbS5jb25maWcuZ2V0KCdlZGl0b3IudGFiTGVuZ3RoJylcbiAgICBpZiAwIDwgY29sdW1uIDwgdGFiTGVuZ3RoXG4gICAgICB0ZXh0ID0gY3Vyc29yLmVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShbW3JvdywgMF0sIFtyb3csIHRhYkxlbmd0aF1dKVxuICAgICAgL15cXHMrJC8udGVzdCh0ZXh0KVxuICAgIGVsc2VcbiAgICAgIGZhbHNlXG5cbiMgb3B0aW9uczpcbiMgICBhbGxvd1dyYXA6IHRvIGNvbnRyb2xsIGFsbG93IHdyYXBcbiMgICBwcmVzZXJ2ZUdvYWxDb2x1bW46IHByZXNlcnZlIG9yaWdpbmFsIGdvYWxDb2x1bW5cbm1vdmVDdXJzb3JMZWZ0ID0gKGN1cnNvciwgb3B0aW9ucz17fSkgLT5cbiAge2FsbG93V3JhcCwgbmVlZFNwZWNpYWxDYXJlVG9QcmV2ZW50V3JhcExpbmV9ID0gb3B0aW9uc1xuICBkZWxldGUgb3B0aW9ucy5hbGxvd1dyYXBcbiAgaWYgbmVlZFNwZWNpYWxDYXJlVG9QcmV2ZW50V3JhcExpbmVcbiAgICByZXR1cm4gaWYgc2hvdWxkUHJldmVudFdyYXBMaW5lKGN1cnNvcilcblxuICBpZiBub3QgY3Vyc29yLmlzQXRCZWdpbm5pbmdPZkxpbmUoKSBvciBhbGxvd1dyYXBcbiAgICBtb3Rpb24gPSAoY3Vyc29yKSAtPiBjdXJzb3IubW92ZUxlZnQoKVxuICAgIG1vdmVDdXJzb3IoY3Vyc29yLCBvcHRpb25zLCBtb3Rpb24pXG5cbm1vdmVDdXJzb3JSaWdodCA9IChjdXJzb3IsIG9wdGlvbnM9e30pIC0+XG4gIHthbGxvd1dyYXB9ID0gb3B0aW9uc1xuICBkZWxldGUgb3B0aW9ucy5hbGxvd1dyYXBcbiAgaWYgbm90IGN1cnNvci5pc0F0RW5kT2ZMaW5lKCkgb3IgYWxsb3dXcmFwXG4gICAgbW90aW9uID0gKGN1cnNvcikgLT4gY3Vyc29yLm1vdmVSaWdodCgpXG4gICAgbW92ZUN1cnNvcihjdXJzb3IsIG9wdGlvbnMsIG1vdGlvbilcblxubW92ZUN1cnNvclVwU2NyZWVuID0gKGN1cnNvciwgb3B0aW9ucz17fSkgLT5cbiAgdW5sZXNzIGN1cnNvci5nZXRTY3JlZW5Sb3coKSBpcyAwXG4gICAgbW90aW9uID0gKGN1cnNvcikgLT4gY3Vyc29yLm1vdmVVcCgpXG4gICAgbW92ZUN1cnNvcihjdXJzb3IsIG9wdGlvbnMsIG1vdGlvbilcblxubW92ZUN1cnNvckRvd25TY3JlZW4gPSAoY3Vyc29yLCBvcHRpb25zPXt9KSAtPlxuICB1bmxlc3MgZ2V0VmltTGFzdFNjcmVlblJvdyhjdXJzb3IuZWRpdG9yKSBpcyBjdXJzb3IuZ2V0U2NyZWVuUm93KClcbiAgICBtb3Rpb24gPSAoY3Vyc29yKSAtPiBjdXJzb3IubW92ZURvd24oKVxuICAgIG1vdmVDdXJzb3IoY3Vyc29yLCBvcHRpb25zLCBtb3Rpb24pXG5cbiMgRklYTUVcbm1vdmVDdXJzb3JEb3duQnVmZmVyID0gKGN1cnNvcikgLT5cbiAgcG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICB1bmxlc3MgZ2V0VmltTGFzdEJ1ZmZlclJvdyhjdXJzb3IuZWRpdG9yKSBpcyBwb2ludC5yb3dcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQudHJhbnNsYXRlKFsrMSwgMF0pKVxuXG4jIEZJWE1FXG5tb3ZlQ3Vyc29yVXBCdWZmZXIgPSAoY3Vyc29yKSAtPlxuICBwb2ludCA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gIHVubGVzcyBwb2ludC5yb3cgaXMgMFxuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludC50cmFuc2xhdGUoWy0xLCAwXSkpXG5cbm1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3cgPSAoY3Vyc29yLCByb3cpIC0+XG4gIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihbcm93LCAwXSlcbiAgY3Vyc29yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKClcblxuZ2V0VmFsaWRWaW1CdWZmZXJSb3cgPSAoZWRpdG9yLCByb3cpIC0+IGxpbWl0TnVtYmVyKHJvdywgbWluOiAwLCBtYXg6IGdldFZpbUxhc3RCdWZmZXJSb3coZWRpdG9yKSlcblxuZ2V0VmFsaWRWaW1TY3JlZW5Sb3cgPSAoZWRpdG9yLCByb3cpIC0+IGxpbWl0TnVtYmVyKHJvdywgbWluOiAwLCBtYXg6IGdldFZpbUxhc3RTY3JlZW5Sb3coZWRpdG9yKSlcblxuIyBCeSBkZWZhdWx0IG5vdCBpbmNsdWRlIGNvbHVtblxuZ2V0TGluZVRleHRUb0J1ZmZlclBvc2l0aW9uID0gKGVkaXRvciwge3JvdywgY29sdW1ufSwge2V4Y2x1c2l2ZX09e30pIC0+XG4gIGlmIGV4Y2x1c2l2ZSA/IHRydWVcbiAgICBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocm93KVswLi4uY29sdW1uXVxuICBlbHNlXG4gICAgZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJvdylbMC4uY29sdW1uXVxuXG5nZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgZWRpdG9yLmluZGVudExldmVsRm9yTGluZShlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocm93KSlcblxuaXNBbGxXaGl0ZVNwYWNlVGV4dCA9ICh0ZXh0KSAtPlxuICBub3QgL1xcUy8udGVzdCh0ZXh0KVxuXG5nZXRDb2RlRm9sZFJvd1JhbmdlcyA9IChlZGl0b3IpIC0+XG4gIFswLi5lZGl0b3IuZ2V0TGFzdEJ1ZmZlclJvdygpXVxuICAgIC5tYXAgKHJvdykgLT5cbiAgICAgIGVkaXRvci5sYW5ndWFnZU1vZGUucm93UmFuZ2VGb3JDb2RlRm9sZEF0QnVmZmVyUm93KHJvdylcbiAgICAuZmlsdGVyIChyb3dSYW5nZSkgLT5cbiAgICAgIHJvd1JhbmdlPyBhbmQgcm93UmFuZ2VbMF0/IGFuZCByb3dSYW5nZVsxXT9cblxuZ2V0Q29kZUZvbGRSb3dSYW5nZXNDb250YWluZXNGb3JSb3cgPSAoZWRpdG9yLCBidWZmZXJSb3csIHtpbmNsdWRlU3RhcnRSb3d9PXt9KSAtPlxuICBpbmNsdWRlU3RhcnRSb3cgPz0gdHJ1ZVxuICBnZXRDb2RlRm9sZFJvd1JhbmdlcyhlZGl0b3IpLmZpbHRlciAoW3N0YXJ0Um93LCBlbmRSb3ddKSAtPlxuICAgIGlmIGluY2x1ZGVTdGFydFJvd1xuICAgICAgc3RhcnRSb3cgPD0gYnVmZmVyUm93IDw9IGVuZFJvd1xuICAgIGVsc2VcbiAgICAgIHN0YXJ0Um93IDwgYnVmZmVyUm93IDw9IGVuZFJvd1xuXG5nZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlID0gKGVkaXRvciwgcm93UmFuZ2UpIC0+XG4gIFtzdGFydFJhbmdlLCBlbmRSYW5nZV0gPSByb3dSYW5nZS5tYXAgKHJvdykgLT5cbiAgICBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocm93LCBpbmNsdWRlTmV3bGluZTogdHJ1ZSlcbiAgc3RhcnRSYW5nZS51bmlvbihlbmRSYW5nZSlcblxuZ2V0VG9rZW5pemVkTGluZUZvclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgZWRpdG9yLnRva2VuaXplZEJ1ZmZlci50b2tlbml6ZWRMaW5lRm9yUm93KHJvdylcblxuZ2V0U2NvcGVzRm9yVG9rZW5pemVkTGluZSA9IChsaW5lKSAtPlxuICBmb3IgdGFnIGluIGxpbmUudGFncyB3aGVuIHRhZyA8IDAgYW5kICh0YWcgJSAyIGlzIC0xKVxuICAgIGF0b20uZ3JhbW1hcnMuc2NvcGVGb3JJZCh0YWcpXG5cbnNjYW5Gb3JTY29wZVN0YXJ0ID0gKGVkaXRvciwgZnJvbVBvaW50LCBkaXJlY3Rpb24sIGZuKSAtPlxuICBmcm9tUG9pbnQgPSBQb2ludC5mcm9tT2JqZWN0KGZyb21Qb2ludClcbiAgc2NhblJvd3MgPSBzd2l0Y2ggZGlyZWN0aW9uXG4gICAgd2hlbiAnZm9yd2FyZCcgdGhlbiBbKGZyb21Qb2ludC5yb3cpLi5lZGl0b3IuZ2V0TGFzdEJ1ZmZlclJvdygpXVxuICAgIHdoZW4gJ2JhY2t3YXJkJyB0aGVuIFsoZnJvbVBvaW50LnJvdykuLjBdXG5cbiAgY29udGludWVTY2FuID0gdHJ1ZVxuICBzdG9wID0gLT5cbiAgICBjb250aW51ZVNjYW4gPSBmYWxzZVxuXG4gIGlzVmFsaWRUb2tlbiA9IHN3aXRjaCBkaXJlY3Rpb25cbiAgICB3aGVuICdmb3J3YXJkJyB0aGVuICh7cG9zaXRpb259KSAtPiBwb3NpdGlvbi5pc0dyZWF0ZXJUaGFuKGZyb21Qb2ludClcbiAgICB3aGVuICdiYWNrd2FyZCcgdGhlbiAoe3Bvc2l0aW9ufSkgLT4gcG9zaXRpb24uaXNMZXNzVGhhbihmcm9tUG9pbnQpXG5cbiAgZm9yIHJvdyBpbiBzY2FuUm93cyB3aGVuIHRva2VuaXplZExpbmUgPSBnZXRUb2tlbml6ZWRMaW5lRm9yUm93KGVkaXRvciwgcm93KVxuICAgIGNvbHVtbiA9IDBcbiAgICByZXN1bHRzID0gW11cblxuICAgIHRva2VuSXRlcmF0b3IgPSB0b2tlbml6ZWRMaW5lLmdldFRva2VuSXRlcmF0b3IoKVxuICAgIGZvciB0YWcgaW4gdG9rZW5pemVkTGluZS50YWdzXG4gICAgICB0b2tlbkl0ZXJhdG9yLm5leHQoKVxuICAgICAgaWYgdGFnIDwgMCAjIE5lZ2F0aXZlOiBzdGFydC9zdG9wIHRva2VuXG4gICAgICAgIHNjb3BlID0gYXRvbS5ncmFtbWFycy5zY29wZUZvcklkKHRhZylcbiAgICAgICAgaWYgKHRhZyAlIDIpIGlzIDAgIyBFdmVuOiBzY29wZSBzdG9wXG4gICAgICAgICAgbnVsbFxuICAgICAgICBlbHNlICMgT2RkOiBzY29wZSBzdGFydFxuICAgICAgICAgIHBvc2l0aW9uID0gbmV3IFBvaW50KHJvdywgY29sdW1uKVxuICAgICAgICAgIHJlc3VsdHMucHVzaCB7c2NvcGUsIHBvc2l0aW9uLCBzdG9wfVxuICAgICAgZWxzZVxuICAgICAgICBjb2x1bW4gKz0gdGFnXG5cbiAgICByZXN1bHRzID0gcmVzdWx0cy5maWx0ZXIoaXNWYWxpZFRva2VuKVxuICAgIHJlc3VsdHMucmV2ZXJzZSgpIGlmIGRpcmVjdGlvbiBpcyAnYmFja3dhcmQnXG4gICAgZm9yIHJlc3VsdCBpbiByZXN1bHRzXG4gICAgICBmbihyZXN1bHQpXG4gICAgICByZXR1cm4gdW5sZXNzIGNvbnRpbnVlU2NhblxuICAgIHJldHVybiB1bmxlc3MgY29udGludWVTY2FuXG5cbmRldGVjdFNjb3BlU3RhcnRQb3NpdGlvbkZvclNjb3BlID0gKGVkaXRvciwgZnJvbVBvaW50LCBkaXJlY3Rpb24sIHNjb3BlKSAtPlxuICBwb2ludCA9IG51bGxcbiAgc2NhbkZvclNjb3BlU3RhcnQgZWRpdG9yLCBmcm9tUG9pbnQsIGRpcmVjdGlvbiwgKGluZm8pIC0+XG4gICAgaWYgaW5mby5zY29wZS5zZWFyY2goc2NvcGUpID49IDBcbiAgICAgIGluZm8uc3RvcCgpXG4gICAgICBwb2ludCA9IGluZm8ucG9zaXRpb25cbiAgcG9pbnRcblxuaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgIyBbRklYTUVdIEJ1ZyBvZiB1cHN0cmVhbT9cbiAgIyBTb21ldGltZSB0b2tlbml6ZWRMaW5lcyBsZW5ndGggaXMgbGVzcyB0aGFuIGxhc3QgYnVmZmVyIHJvdy5cbiAgIyBTbyB0b2tlbml6ZWRMaW5lIGlzIG5vdCBhY2Nlc3NpYmxlIGV2ZW4gaWYgdmFsaWQgcm93LlxuICAjIEluIHRoYXQgY2FzZSBJIHNpbXBseSByZXR1cm4gZW1wdHkgQXJyYXkuXG4gIGlmIHRva2VuaXplZExpbmUgPSBnZXRUb2tlbml6ZWRMaW5lRm9yUm93KGVkaXRvciwgcm93KVxuICAgIGdldFNjb3Blc0ZvclRva2VuaXplZExpbmUodG9rZW5pemVkTGluZSkuc29tZSAoc2NvcGUpIC0+XG4gICAgICBpc0Z1bmN0aW9uU2NvcGUoZWRpdG9yLCBzY29wZSlcbiAgZWxzZVxuICAgIGZhbHNlXG5cbiMgW0ZJWE1FXSB2ZXJ5IHJvdWdoIHN0YXRlLCBuZWVkIGltcHJvdmVtZW50LlxuaXNGdW5jdGlvblNjb3BlID0gKGVkaXRvciwgc2NvcGUpIC0+XG4gIHN3aXRjaCBlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZVxuICAgIHdoZW4gJ3NvdXJjZS5nbycsICdzb3VyY2UuZWxpeGlyJ1xuICAgICAgc2NvcGVzID0gWydlbnRpdHkubmFtZS5mdW5jdGlvbiddXG4gICAgd2hlbiAnc291cmNlLnJ1YnknXG4gICAgICBzY29wZXMgPSBbJ21ldGEuZnVuY3Rpb24uJywgJ21ldGEuY2xhc3MuJywgJ21ldGEubW9kdWxlLiddXG4gICAgZWxzZVxuICAgICAgc2NvcGVzID0gWydtZXRhLmZ1bmN0aW9uLicsICdtZXRhLmNsYXNzLiddXG4gIHBhdHRlcm4gPSBuZXcgUmVnRXhwKCdeJyArIHNjb3Blcy5tYXAoXy5lc2NhcGVSZWdFeHApLmpvaW4oJ3wnKSlcbiAgcGF0dGVybi50ZXN0KHNjb3BlKVxuXG4jIFNjcm9sbCB0byBidWZmZXJQb3NpdGlvbiB3aXRoIG1pbmltdW0gYW1vdW50IHRvIGtlZXAgb3JpZ2luYWwgdmlzaWJsZSBhcmVhLlxuIyBJZiB0YXJnZXQgcG9zaXRpb24gd29uJ3QgZml0IHdpdGhpbiBvbmVQYWdlVXAgb3Igb25lUGFnZURvd24sIGl0IGNlbnRlciB0YXJnZXQgcG9pbnQuXG5zbWFydFNjcm9sbFRvQnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCkgLT5cbiAgZWRpdG9yRWxlbWVudCA9IGVkaXRvci5lbGVtZW50XG4gIGVkaXRvckFyZWFIZWlnaHQgPSBlZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKCkgKiAoZWRpdG9yLmdldFJvd3NQZXJQYWdlKCkgLSAxKVxuICBvbmVQYWdlVXAgPSBlZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcCgpIC0gZWRpdG9yQXJlYUhlaWdodCAjIE5vIG5lZWQgdG8gbGltaXQgdG8gbWluPTBcbiAgb25lUGFnZURvd24gPSBlZGl0b3JFbGVtZW50LmdldFNjcm9sbEJvdHRvbSgpICsgZWRpdG9yQXJlYUhlaWdodFxuICB0YXJnZXQgPSBlZGl0b3JFbGVtZW50LnBpeGVsUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbihwb2ludCkudG9wXG5cbiAgY2VudGVyID0gKG9uZVBhZ2VEb3duIDwgdGFyZ2V0KSBvciAodGFyZ2V0IDwgb25lUGFnZVVwKVxuICBlZGl0b3Iuc2Nyb2xsVG9CdWZmZXJQb3NpdGlvbihwb2ludCwge2NlbnRlcn0pXG5cbm1hdGNoU2NvcGVzID0gKGVkaXRvckVsZW1lbnQsIHNjb3BlcykgLT5cbiAgY2xhc3NlcyA9IHNjb3Blcy5tYXAgKHNjb3BlKSAtPiBzY29wZS5zcGxpdCgnLicpXG5cbiAgZm9yIGNsYXNzTmFtZXMgaW4gY2xhc3Nlc1xuICAgIGNvbnRhaW5zQ291bnQgPSAwXG4gICAgZm9yIGNsYXNzTmFtZSBpbiBjbGFzc05hbWVzXG4gICAgICBjb250YWluc0NvdW50ICs9IDEgaWYgZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKVxuICAgIHJldHVybiB0cnVlIGlmIGNvbnRhaW5zQ291bnQgaXMgY2xhc3NOYW1lcy5sZW5ndGhcbiAgZmFsc2VcblxuaXNTaW5nbGVMaW5lVGV4dCA9ICh0ZXh0KSAtPlxuICB0ZXh0LnNwbGl0KC9cXG58XFxyXFxuLykubGVuZ3RoIGlzIDFcblxuIyBSZXR1cm4gYnVmZmVyUmFuZ2UgYW5kIGtpbmQgWyd3aGl0ZS1zcGFjZScsICdub24td29yZCcsICd3b3JkJ11cbiNcbiMgVGhpcyBmdW5jdGlvbiBtb2RpZnkgd29yZFJlZ2V4IHNvIHRoYXQgaXQgZmVlbCBOQVRVUkFMIGluIFZpbSdzIG5vcm1hbCBtb2RlLlxuIyBJbiBub3JtYWwtbW9kZSwgY3Vyc29yIGlzIHJhY3RhbmdsZShub3QgcGlwZSh8KSBjaGFyKS5cbiMgQ3Vyc29yIGlzIGxpa2UgT04gd29yZCByYXRoZXIgdGhhbiBCRVRXRUVOIHdvcmQuXG4jIFRoZSBtb2RpZmljYXRpb24gaXMgdGFpbG9yZCBsaWtlIHRoaXNcbiMgICAtIE9OIHdoaXRlLXNwYWNlOiBJbmNsdWRzIG9ubHkgd2hpdGUtc3BhY2VzLlxuIyAgIC0gT04gbm9uLXdvcmQ6IEluY2x1ZHMgb25seSBub24gd29yZCBjaGFyKD1leGNsdWRlcyBub3JtYWwgd29yZCBjaGFyKS5cbiNcbiMgVmFsaWQgb3B0aW9uc1xuIyAgLSB3b3JkUmVnZXg6IGluc3RhbmNlIG9mIFJlZ0V4cFxuIyAgLSBub25Xb3JkQ2hhcmFjdGVyczogc3RyaW5nXG5nZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50LCBvcHRpb25zPXt9KSAtPlxuICB7c2luZ2xlTm9uV29yZENoYXIsIHdvcmRSZWdleCwgbm9uV29yZENoYXJhY3RlcnMsIGN1cnNvcn0gPSBvcHRpb25zXG4gIGlmIG5vdCB3b3JkUmVnZXg/IG9yIG5vdCBub25Xb3JkQ2hhcmFjdGVycz8gIyBDb21wbGVtZW50IGZyb20gY3Vyc29yXG4gICAgY3Vyc29yID89IGVkaXRvci5nZXRMYXN0Q3Vyc29yKClcbiAgICB7d29yZFJlZ2V4LCBub25Xb3JkQ2hhcmFjdGVyc30gPSBfLmV4dGVuZChvcHRpb25zLCBidWlsZFdvcmRQYXR0ZXJuQnlDdXJzb3IoY3Vyc29yLCBvcHRpb25zKSlcbiAgc2luZ2xlTm9uV29yZENoYXIgPz0gdHJ1ZVxuXG4gIGNoYXJhY3RlckF0UG9pbnQgPSBnZXRSaWdodENoYXJhY3RlckZvckJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgcG9pbnQpXG4gIG5vbldvcmRSZWdleCA9IG5ldyBSZWdFeHAoXCJbI3tfLmVzY2FwZVJlZ0V4cChub25Xb3JkQ2hhcmFjdGVycyl9XStcIilcblxuICBpZiAvXFxzLy50ZXN0KGNoYXJhY3RlckF0UG9pbnQpXG4gICAgc291cmNlID0gXCJbXFx0IF0rXCJcbiAgICBraW5kID0gJ3doaXRlLXNwYWNlJ1xuICAgIHdvcmRSZWdleCA9IG5ldyBSZWdFeHAoc291cmNlKVxuICBlbHNlIGlmIG5vbldvcmRSZWdleC50ZXN0KGNoYXJhY3RlckF0UG9pbnQpIGFuZCBub3Qgd29yZFJlZ2V4LnRlc3QoY2hhcmFjdGVyQXRQb2ludClcbiAgICBraW5kID0gJ25vbi13b3JkJ1xuICAgIGlmIHNpbmdsZU5vbldvcmRDaGFyXG4gICAgICBzb3VyY2UgPSBfLmVzY2FwZVJlZ0V4cChjaGFyYWN0ZXJBdFBvaW50KVxuICAgICAgd29yZFJlZ2V4ID0gbmV3IFJlZ0V4cChzb3VyY2UpXG4gICAgZWxzZVxuICAgICAgd29yZFJlZ2V4ID0gbm9uV29yZFJlZ2V4XG4gIGVsc2VcbiAgICBraW5kID0gJ3dvcmQnXG5cbiAgcmFuZ2UgPSBnZXRXb3JkQnVmZmVyUmFuZ2VBdEJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgcG9pbnQsIHt3b3JkUmVnZXh9KVxuICB7a2luZCwgcmFuZ2V9XG5cbmdldFdvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50LCBvcHRpb25zPXt9KSAtPlxuICBib3VuZGFyaXplRm9yV29yZCA9IG9wdGlvbnMuYm91bmRhcml6ZUZvcldvcmQgPyB0cnVlXG4gIGRlbGV0ZSBvcHRpb25zLmJvdW5kYXJpemVGb3JXb3JkXG4gIHtyYW5nZSwga2luZH0gPSBnZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbihlZGl0b3IsIHBvaW50LCBvcHRpb25zKVxuICBwYXR0ZXJuID0gXy5lc2NhcGVSZWdFeHAoZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKSlcbiAgaWYga2luZCBpcyAnd29yZCcgYW5kIGJvdW5kYXJpemVGb3JXb3JkXG4gICAgcGF0dGVybiA9IFwiXFxcXGJcIiArIHBhdHRlcm4gKyBcIlxcXFxiXCJcbiAgbmV3IFJlZ0V4cChwYXR0ZXJuLCAnZycpXG5cbmdldFN1YndvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50LCBvcHRpb25zPXt9KSAtPlxuICBvcHRpb25zID0ge3dvcmRSZWdleDogZWRpdG9yLmdldExhc3RDdXJzb3IoKS5zdWJ3b3JkUmVnRXhwKCksIGJvdW5kYXJpemVGb3JXb3JkOiBmYWxzZX1cbiAgZ2V0V29yZFBhdHRlcm5BdEJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgcG9pbnQsIG9wdGlvbnMpXG5cbiMgUmV0dXJuIG9wdGlvbnMgdXNlZCBmb3IgZ2V0V29yZEJ1ZmZlclJhbmdlQXRCdWZmZXJQb3NpdGlvblxuYnVpbGRXb3JkUGF0dGVybkJ5Q3Vyc29yID0gKGN1cnNvciwge3dvcmRSZWdleH0pIC0+XG4gIG5vbldvcmRDaGFyYWN0ZXJzID0gZ2V0Tm9uV29yZENoYXJhY3RlcnNGb3JDdXJzb3IoY3Vyc29yKVxuICB3b3JkUmVnZXggPz0gbmV3IFJlZ0V4cChcIl5bXFx0IF0qJHxbXlxcXFxzI3tfLmVzY2FwZVJlZ0V4cChub25Xb3JkQ2hhcmFjdGVycyl9XStcIilcbiAge3dvcmRSZWdleCwgbm9uV29yZENoYXJhY3RlcnN9XG5cbmdldEN1cnJlbnRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kID0gKGN1cnNvciwgb3B0aW9ucz17fSkgLT5cbiAgZ2V0V29yZEJ1ZmZlclJhbmdlQW5kS2luZEF0QnVmZmVyUG9zaXRpb24oY3Vyc29yLmVkaXRvciwgY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCksIG9wdGlvbnMpXG5cbmdldEJlZ2lubmluZ09mV29yZEJ1ZmZlclBvc2l0aW9uID0gKGVkaXRvciwgcG9pbnQsIHt3b3JkUmVnZXh9PXt9KSAtPlxuICBzY2FuUmFuZ2UgPSBbW3BvaW50LnJvdywgMF0sIHBvaW50XVxuXG4gIGZvdW5kID0gbnVsbFxuICBlZGl0b3IuYmFja3dhcmRzU2NhbkluQnVmZmVyUmFuZ2Ugd29yZFJlZ2V4LCBzY2FuUmFuZ2UsICh7cmFuZ2UsIG1hdGNoVGV4dCwgc3RvcH0pIC0+XG4gICAgcmV0dXJuIGlmIG1hdGNoVGV4dCBpcyAnJyBhbmQgcmFuZ2Uuc3RhcnQuY29sdW1uIGlzbnQgMFxuXG4gICAgaWYgcmFuZ2Uuc3RhcnQuaXNMZXNzVGhhbihwb2ludClcbiAgICAgIGlmIHJhbmdlLmVuZC5pc0dyZWF0ZXJUaGFuT3JFcXVhbChwb2ludClcbiAgICAgICAgZm91bmQgPSByYW5nZS5zdGFydFxuICAgICAgc3RvcCgpXG5cbiAgZm91bmQgPyBwb2ludFxuXG5nZXRFbmRPZldvcmRCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50LCB7d29yZFJlZ2V4fT17fSkgLT5cbiAgc2NhblJhbmdlID0gW3BvaW50LCBbcG9pbnQucm93LCBJbmZpbml0eV1dXG5cbiAgZm91bmQgPSBudWxsXG4gIGVkaXRvci5zY2FuSW5CdWZmZXJSYW5nZSB3b3JkUmVnZXgsIHNjYW5SYW5nZSwgKHtyYW5nZSwgbWF0Y2hUZXh0LCBzdG9wfSkgLT5cbiAgICByZXR1cm4gaWYgbWF0Y2hUZXh0IGlzICcnIGFuZCByYW5nZS5zdGFydC5jb2x1bW4gaXNudCAwXG5cbiAgICBpZiByYW5nZS5lbmQuaXNHcmVhdGVyVGhhbihwb2ludClcbiAgICAgIGlmIHJhbmdlLnN0YXJ0LmlzTGVzc1RoYW5PckVxdWFsKHBvaW50KVxuICAgICAgICBmb3VuZCA9IHJhbmdlLmVuZFxuICAgICAgc3RvcCgpXG5cbiAgZm91bmQgPyBwb2ludFxuXG5nZXRXb3JkQnVmZmVyUmFuZ2VBdEJ1ZmZlclBvc2l0aW9uID0gKGVkaXRvciwgcG9zaXRpb24sIG9wdGlvbnM9e30pIC0+XG4gIGVuZFBvc2l0aW9uID0gZ2V0RW5kT2ZXb3JkQnVmZmVyUG9zaXRpb24oZWRpdG9yLCBwb3NpdGlvbiwgb3B0aW9ucylcbiAgc3RhcnRQb3NpdGlvbiA9IGdldEJlZ2lubmluZ09mV29yZEJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgZW5kUG9zaXRpb24sIG9wdGlvbnMpXG4gIG5ldyBSYW5nZShzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbilcblxuYWRqdXN0UmFuZ2VUb1Jvd1JhbmdlID0gKHtzdGFydCwgZW5kfSwgb3B0aW9ucz17fSkgLT5cbiAgIyB3aGVuIGxpbmV3aXNlLCBlbmQgcm93IGlzIGF0IGNvbHVtbiAwIG9mIE5FWFQgbGluZVxuICAjIFNvIG5lZWQgYWRqdXN0IHRvIGFjdHVhbGx5IHNlbGVjdGVkIHJvdyBpbiBzYW1lIHdheSBhcyBTZWxlY2l0b246OmdldEJ1ZmZlclJvd1JhbmdlKClcbiAgZW5kUm93ID0gZW5kLnJvd1xuICBpZiBlbmQuY29sdW1uIGlzIDBcbiAgICBlbmRSb3cgPSBsaW1pdE51bWJlcihlbmQucm93IC0gMSwgbWluOiBzdGFydC5yb3cpXG4gIGlmIG9wdGlvbnMuZW5kT25seSA/IGZhbHNlXG4gICAgbmV3IFJhbmdlKHN0YXJ0LCBbZW5kUm93LCBJbmZpbml0eV0pXG4gIGVsc2VcbiAgICBuZXcgUmFuZ2UoW3N0YXJ0LnJvdywgMF0sIFtlbmRSb3csIEluZmluaXR5XSlcblxuIyBXaGVuIHJhbmdlIGlzIGxpbmV3aXNlIHJhbmdlLCByYW5nZSBlbmQgaGF2ZSBjb2x1bW4gMCBvZiBORVhUIHJvdy5cbiMgV2hpY2ggaXMgdmVyeSB1bmludHVpdGl2ZSBhbmQgdW53YW50ZWQgcmVzdWx0Llxuc2hyaW5rUmFuZ2VFbmRUb0JlZm9yZU5ld0xpbmUgPSAocmFuZ2UpIC0+XG4gIHtzdGFydCwgZW5kfSA9IHJhbmdlXG4gIGlmIGVuZC5jb2x1bW4gaXMgMFxuICAgIGVuZFJvdyA9IGxpbWl0TnVtYmVyKGVuZC5yb3cgLSAxLCBtaW46IHN0YXJ0LnJvdylcbiAgICBuZXcgUmFuZ2Uoc3RhcnQsIFtlbmRSb3csIEluZmluaXR5XSlcbiAgZWxzZVxuICAgIHJhbmdlXG5cbnNjYW5JblJhbmdlcyA9IChlZGl0b3IsIHBhdHRlcm4sIHNjYW5SYW5nZXMsIHtpbmNsdWRlSW50ZXJzZWN0cywgZXhjbHVzaXZlSW50ZXJzZWN0c309e30pIC0+XG4gIGlmIGluY2x1ZGVJbnRlcnNlY3RzXG4gICAgb3JpZ2luYWxTY2FuUmFuZ2VzID0gc2NhblJhbmdlcy5zbGljZSgpXG5cbiAgICAjIFdlIG5lZWQgdG8gc2NhbiBlYWNoIHdob2xlIHJvdyB0byBmaW5kIGludGVyc2VjdHMuXG4gICAgc2NhblJhbmdlcyA9IHNjYW5SYW5nZXMubWFwKGFkanVzdFJhbmdlVG9Sb3dSYW5nZSlcbiAgICBpc0ludGVyc2VjdHMgPSAoe3JhbmdlLCBzY2FuUmFuZ2V9KSAtPlxuICAgICAgIyBleGNsdXNpdmVJbnRlcnNlY3RzIHNldCB0cnVlIGluIHZpc3VhbC1tb2RlXG4gICAgICBzY2FuUmFuZ2UuaW50ZXJzZWN0c1dpdGgocmFuZ2UsIGV4Y2x1c2l2ZUludGVyc2VjdHMpXG5cbiAgcmFuZ2VzID0gW11cbiAgZm9yIHNjYW5SYW5nZSwgaSBpbiBzY2FuUmFuZ2VzXG4gICAgZWRpdG9yLnNjYW5JbkJ1ZmZlclJhbmdlIHBhdHRlcm4sIHNjYW5SYW5nZSwgKHtyYW5nZX0pIC0+XG4gICAgICBpZiBpbmNsdWRlSW50ZXJzZWN0c1xuICAgICAgICBpZiBpc0ludGVyc2VjdHMoe3JhbmdlLCBzY2FuUmFuZ2U6IG9yaWdpbmFsU2NhblJhbmdlc1tpXX0pXG4gICAgICAgICAgcmFuZ2VzLnB1c2gocmFuZ2UpXG4gICAgICBlbHNlXG4gICAgICAgIHJhbmdlcy5wdXNoKHJhbmdlKVxuICByYW5nZXNcblxuc2NhbkVkaXRvciA9IChlZGl0b3IsIHBhdHRlcm4pIC0+XG4gIHJhbmdlcyA9IFtdXG4gIGVkaXRvci5zY2FuIHBhdHRlcm4sICh7cmFuZ2V9KSAtPlxuICAgIHJhbmdlcy5wdXNoKHJhbmdlKVxuICByYW5nZXNcblxuY29sbGVjdFJhbmdlSW5CdWZmZXJSb3cgPSAoZWRpdG9yLCByb3csIHBhdHRlcm4pIC0+XG4gIHJhbmdlcyA9IFtdXG4gIHNjYW5SYW5nZSA9IGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhyb3cpXG4gIGVkaXRvci5zY2FuSW5CdWZmZXJSYW5nZSBwYXR0ZXJuLCBzY2FuUmFuZ2UsICh7cmFuZ2V9KSAtPlxuICAgIHJhbmdlcy5wdXNoKHJhbmdlKVxuICByYW5nZXNcblxuZmluZFJhbmdlSW5CdWZmZXJSb3cgPSAoZWRpdG9yLCBwYXR0ZXJuLCByb3csIHtkaXJlY3Rpb259PXt9KSAtPlxuICBpZiBkaXJlY3Rpb24gaXMgJ2JhY2t3YXJkJ1xuICAgIHNjYW5GdW5jdGlvbk5hbWUgPSAnYmFja3dhcmRzU2NhbkluQnVmZmVyUmFuZ2UnXG4gIGVsc2VcbiAgICBzY2FuRnVuY3Rpb25OYW1lID0gJ3NjYW5JbkJ1ZmZlclJhbmdlJ1xuXG4gIHJhbmdlID0gbnVsbFxuICBzY2FuUmFuZ2UgPSBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocm93KVxuICBlZGl0b3Jbc2NhbkZ1bmN0aW9uTmFtZV0gcGF0dGVybiwgc2NhblJhbmdlLCAoZXZlbnQpIC0+IHJhbmdlID0gZXZlbnQucmFuZ2VcbiAgcmFuZ2VcblxuaXNSYW5nZUNvbnRhaW5zU29tZVBvaW50ID0gKHJhbmdlLCBwb2ludHMsIHtleGNsdXNpdmV9PXt9KSAtPlxuICBleGNsdXNpdmUgPz0gZmFsc2VcbiAgcG9pbnRzLnNvbWUgKHBvaW50KSAtPlxuICAgIHJhbmdlLmNvbnRhaW5zUG9pbnQocG9pbnQsIGV4Y2x1c2l2ZSlcblxuZGVzdHJveU5vbkxhc3RTZWxlY3Rpb24gPSAoZWRpdG9yKSAtPlxuICBmb3Igc2VsZWN0aW9uIGluIGVkaXRvci5nZXRTZWxlY3Rpb25zKCkgd2hlbiBub3Qgc2VsZWN0aW9uLmlzTGFzdFNlbGVjdGlvbigpXG4gICAgc2VsZWN0aW9uLmRlc3Ryb3koKVxuXG5nZXRMYXJnZXN0Rm9sZFJhbmdlQ29udGFpbnNCdWZmZXJSb3cgPSAoZWRpdG9yLCByb3cpIC0+XG4gIG1hcmtlcnMgPSBlZGl0b3IuZGlzcGxheUxheWVyLmZvbGRzTWFya2VyTGF5ZXIuZmluZE1hcmtlcnMoaW50ZXJzZWN0c1Jvdzogcm93KVxuXG4gIHN0YXJ0UG9pbnQgPSBudWxsXG4gIGVuZFBvaW50ID0gbnVsbFxuXG4gIGZvciBtYXJrZXIgaW4gbWFya2VycyA/IFtdXG4gICAge3N0YXJ0LCBlbmR9ID0gbWFya2VyLmdldFJhbmdlKClcbiAgICB1bmxlc3Mgc3RhcnRQb2ludFxuICAgICAgc3RhcnRQb2ludCA9IHN0YXJ0XG4gICAgICBlbmRQb2ludCA9IGVuZFxuICAgICAgY29udGludWVcblxuICAgIGlmIHN0YXJ0LmlzTGVzc1RoYW4oc3RhcnRQb2ludClcbiAgICAgIHN0YXJ0UG9pbnQgPSBzdGFydFxuICAgICAgZW5kUG9pbnQgPSBlbmRcblxuICBpZiBzdGFydFBvaW50PyBhbmQgZW5kUG9pbnQ/XG4gICAgbmV3IFJhbmdlKHN0YXJ0UG9pbnQsIGVuZFBvaW50KVxuXG50cmFuc2xhdGVQb2ludEFuZENsaXAgPSAoZWRpdG9yLCBwb2ludCwgZGlyZWN0aW9uLCB7dHJhbnNsYXRlfT17fSkgLT5cbiAgdHJhbnNsYXRlID89IHRydWVcbiAgcG9pbnQgPSBQb2ludC5mcm9tT2JqZWN0KHBvaW50KVxuXG4gIGRvbnRDbGlwID0gZmFsc2VcbiAgc3dpdGNoIGRpcmVjdGlvblxuICAgIHdoZW4gJ2ZvcndhcmQnXG4gICAgICBwb2ludCA9IHBvaW50LnRyYW5zbGF0ZShbMCwgKzFdKSBpZiB0cmFuc2xhdGVcbiAgICAgIGVvbCA9IGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhwb2ludC5yb3cpLmVuZFxuXG4gICAgICBpZiBwb2ludC5pc0VxdWFsKGVvbClcbiAgICAgICAgZG9udENsaXAgPSB0cnVlXG5cbiAgICAgIGlmIHBvaW50LmlzR3JlYXRlclRoYW4oZW9sKVxuICAgICAgICBwb2ludCA9IG5ldyBQb2ludChwb2ludC5yb3cgKyAxLCAwKVxuICAgICAgICBkb250Q2xpcCA9IHRydWVcblxuICAgICAgcG9pbnQgPSBQb2ludC5taW4ocG9pbnQsIGVkaXRvci5nZXRFb2ZCdWZmZXJQb3NpdGlvbigpKVxuXG4gICAgd2hlbiAnYmFja3dhcmQnXG4gICAgICBwb2ludCA9IHBvaW50LnRyYW5zbGF0ZShbMCwgLTFdKSBpZiB0cmFuc2xhdGVcblxuICAgICAgaWYgcG9pbnQuY29sdW1uIDwgMFxuICAgICAgICBuZXdSb3cgPSBwb2ludC5yb3cgLSAxXG4gICAgICAgIGVvbCA9IGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhuZXdSb3cpLmVuZFxuICAgICAgICBwb2ludCA9IG5ldyBQb2ludChuZXdSb3csIGVvbC5jb2x1bW4pXG5cbiAgICAgIHBvaW50ID0gUG9pbnQubWF4KHBvaW50LCBQb2ludC5aRVJPKVxuXG4gIGlmIGRvbnRDbGlwXG4gICAgcG9pbnRcbiAgZWxzZVxuICAgIHNjcmVlblBvaW50ID0gZWRpdG9yLnNjcmVlblBvc2l0aW9uRm9yQnVmZmVyUG9zaXRpb24ocG9pbnQsIGNsaXBEaXJlY3Rpb246IGRpcmVjdGlvbilcbiAgICBlZGl0b3IuYnVmZmVyUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihzY3JlZW5Qb2ludClcblxuZ2V0UmFuZ2VCeVRyYW5zbGF0ZVBvaW50QW5kQ2xpcCA9IChlZGl0b3IsIHJhbmdlLCB3aGljaCwgZGlyZWN0aW9uLCBvcHRpb25zKSAtPlxuICBuZXdQb2ludCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcChlZGl0b3IsIHJhbmdlW3doaWNoXSwgZGlyZWN0aW9uLCBvcHRpb25zKVxuICBzd2l0Y2ggd2hpY2hcbiAgICB3aGVuICdzdGFydCdcbiAgICAgIG5ldyBSYW5nZShuZXdQb2ludCwgcmFuZ2UuZW5kKVxuICAgIHdoZW4gJ2VuZCdcbiAgICAgIG5ldyBSYW5nZShyYW5nZS5zdGFydCwgbmV3UG9pbnQpXG5cbiMgUmVsb2FkYWJsZSByZWdpc3RlckVsZW1lbnRcbnJlZ2lzdGVyRWxlbWVudCA9IChuYW1lLCBvcHRpb25zKSAtPlxuICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChuYW1lKVxuICAjIGlmIGNvbnN0cnVjdG9yIGlzIEhUTUxFbGVtZW50LCB3ZSBoYXZlbid0IHJlZ2lzdGVyZCB5ZXRcbiAgaWYgZWxlbWVudC5jb25zdHJ1Y3RvciBpcyBIVE1MRWxlbWVudFxuICAgIEVsZW1lbnQgPSBkb2N1bWVudC5yZWdpc3RlckVsZW1lbnQobmFtZSwgb3B0aW9ucylcbiAgZWxzZVxuICAgIEVsZW1lbnQgPSBlbGVtZW50LmNvbnN0cnVjdG9yXG4gICAgRWxlbWVudC5wcm90b3R5cGUgPSBvcHRpb25zLnByb3RvdHlwZSBpZiBvcHRpb25zLnByb3RvdHlwZT9cbiAgRWxlbWVudFxuXG5nZXRQYWNrYWdlID0gKG5hbWUsIGZuKSAtPlxuICBuZXcgUHJvbWlzZSAocmVzb2x2ZSkgLT5cbiAgICBpZiBhdG9tLnBhY2thZ2VzLmlzUGFja2FnZUFjdGl2ZShuYW1lKVxuICAgICAgcGtnID0gYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKG5hbWUpXG4gICAgICByZXNvbHZlKHBrZylcbiAgICBlbHNlXG4gICAgICBkaXNwb3NhYmxlID0gYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlUGFja2FnZSAocGtnKSAtPlxuICAgICAgICBpZiBwa2cubmFtZSBpcyBuYW1lXG4gICAgICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICAgICAgICByZXNvbHZlKHBrZylcblxuc2VhcmNoQnlQcm9qZWN0RmluZCA9IChlZGl0b3IsIHRleHQpIC0+XG4gIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yLmVsZW1lbnQsICdwcm9qZWN0LWZpbmQ6c2hvdycpXG4gIGdldFBhY2thZ2UoJ2ZpbmQtYW5kLXJlcGxhY2UnKS50aGVuIChwa2cpIC0+XG4gICAge3Byb2plY3RGaW5kVmlld30gPSBwa2cubWFpbk1vZHVsZVxuICAgIGlmIHByb2plY3RGaW5kVmlldz9cbiAgICAgIHByb2plY3RGaW5kVmlldy5maW5kRWRpdG9yLnNldFRleHQodGV4dClcbiAgICAgIHByb2plY3RGaW5kVmlldy5jb25maXJtKClcblxubGltaXROdW1iZXIgPSAobnVtYmVyLCB7bWF4LCBtaW59PXt9KSAtPlxuICBudW1iZXIgPSBNYXRoLm1pbihudW1iZXIsIG1heCkgaWYgbWF4P1xuICBudW1iZXIgPSBNYXRoLm1heChudW1iZXIsIG1pbikgaWYgbWluP1xuICBudW1iZXJcblxuZmluZFJhbmdlQ29udGFpbnNQb2ludCA9IChyYW5nZXMsIHBvaW50KSAtPlxuICBmb3IgcmFuZ2UgaW4gcmFuZ2VzIHdoZW4gcmFuZ2UuY29udGFpbnNQb2ludChwb2ludClcbiAgICByZXR1cm4gcmFuZ2VcbiAgbnVsbFxuXG5uZWdhdGVGdW5jdGlvbiA9IChmbikgLT5cbiAgKGFyZ3MuLi4pIC0+XG4gICAgbm90IGZuKGFyZ3MuLi4pXG5cbmlzRW1wdHkgPSAodGFyZ2V0KSAtPiB0YXJnZXQuaXNFbXB0eSgpXG5pc05vdEVtcHR5ID0gbmVnYXRlRnVuY3Rpb24oaXNFbXB0eSlcblxuaXNTaW5nbGVMaW5lUmFuZ2UgPSAocmFuZ2UpIC0+IHJhbmdlLmlzU2luZ2xlTGluZSgpXG5pc05vdFNpbmdsZUxpbmVSYW5nZSA9IG5lZ2F0ZUZ1bmN0aW9uKGlzU2luZ2xlTGluZVJhbmdlKVxuXG5pc0xlYWRpbmdXaGl0ZVNwYWNlUmFuZ2UgPSAoZWRpdG9yLCByYW5nZSkgLT4gL15bXFx0IF0qJC8udGVzdChlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UpKVxuaXNOb3RMZWFkaW5nV2hpdGVTcGFjZVJhbmdlID0gbmVnYXRlRnVuY3Rpb24oaXNMZWFkaW5nV2hpdGVTcGFjZVJhbmdlKVxuXG5pc0VzY2FwZWRDaGFyUmFuZ2UgPSAoZWRpdG9yLCByYW5nZSkgLT5cbiAgcmFuZ2UgPSBSYW5nZS5mcm9tT2JqZWN0KHJhbmdlKVxuICBjaGFycyA9IGdldExlZnRDaGFyYWN0ZXJGb3JCdWZmZXJQb3NpdGlvbihlZGl0b3IsIHJhbmdlLnN0YXJ0LCAyKVxuICBjaGFycy5lbmRzV2l0aCgnXFxcXCcpIGFuZCBub3QgY2hhcnMuZW5kc1dpdGgoJ1xcXFxcXFxcJylcblxuc2V0VGV4dEF0QnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCwgdGV4dCkgLT5cbiAgZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKFtwb2ludCwgcG9pbnRdLCB0ZXh0KVxuXG5lbnN1cmVFbmRzV2l0aE5ld0xpbmVGb3JCdWZmZXJSb3cgPSAoZWRpdG9yLCByb3cpIC0+XG4gIHVubGVzcyBpc0VuZHNXaXRoTmV3TGluZUZvckJ1ZmZlclJvdyhlZGl0b3IsIHJvdylcbiAgICBlb2wgPSBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3coZWRpdG9yLCByb3cpXG4gICAgc2V0VGV4dEF0QnVmZmVyUG9zaXRpb24oZWRpdG9yLCBlb2wsIFwiXFxuXCIpXG5cbmZvckVhY2hQYW5lQXhpcyA9IChmbiwgYmFzZSkgLT5cbiAgYmFzZSA/PSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkuZ2V0Q29udGFpbmVyKCkuZ2V0Um9vdCgpXG4gIGlmIGJhc2UuY2hpbGRyZW4/XG4gICAgZm4oYmFzZSlcblxuICAgIGZvciBjaGlsZCBpbiBiYXNlLmNoaWxkcmVuXG4gICAgICBmb3JFYWNoUGFuZUF4aXMoZm4sIGNoaWxkKVxuXG5tb2RpZnlDbGFzc0xpc3QgPSAoYWN0aW9uLCBlbGVtZW50LCBjbGFzc05hbWVzLi4uKSAtPlxuICBlbGVtZW50LmNsYXNzTGlzdFthY3Rpb25dKGNsYXNzTmFtZXMuLi4pXG5cbmFkZENsYXNzTGlzdCA9IG1vZGlmeUNsYXNzTGlzdC5iaW5kKG51bGwsICdhZGQnKVxucmVtb3ZlQ2xhc3NMaXN0ID0gbW9kaWZ5Q2xhc3NMaXN0LmJpbmQobnVsbCwgJ3JlbW92ZScpXG50b2dnbGVDbGFzc0xpc3QgPSBtb2RpZnlDbGFzc0xpc3QuYmluZChudWxsLCAndG9nZ2xlJylcblxudG9nZ2xlQ2FzZUZvckNoYXJhY3RlciA9IChjaGFyKSAtPlxuICBjaGFyTG93ZXIgPSBjaGFyLnRvTG93ZXJDYXNlKClcbiAgaWYgY2hhckxvd2VyIGlzIGNoYXJcbiAgICBjaGFyLnRvVXBwZXJDYXNlKClcbiAgZWxzZVxuICAgIGNoYXJMb3dlclxuXG5zcGxpdFRleHRCeU5ld0xpbmUgPSAodGV4dCkgLT5cbiAgaWYgdGV4dC5lbmRzV2l0aChcIlxcblwiKVxuICAgIHRleHQudHJpbVJpZ2h0KCkuc3BsaXQoL1xccj9cXG4vZylcbiAgZWxzZVxuICAgIHRleHQuc3BsaXQoL1xccj9cXG4vZylcblxuIyBNb2RpZnkgcmFuZ2UgdXNlZCBmb3IgdW5kby9yZWRvIGZsYXNoIGhpZ2hsaWdodCB0byBtYWtlIGl0IGZlZWwgbmF0dXJhbGx5IGZvciBodW1hbi5cbiMgIC0gVHJpbSBzdGFydGluZyBuZXcgbGluZShcIlxcblwiKVxuIyAgICAgXCJcXG5hYmNcIiAtPiBcImFiY1wiXG4jICAtIElmIHJhbmdlLmVuZCBpcyBFT0wgZXh0ZW5kIHJhbmdlIHRvIGZpcnN0IGNvbHVtbiBvZiBuZXh0IGxpbmUuXG4jICAgICBcImFiY1wiIC0+IFwiYWJjXFxuXCJcbiMgZS5nLlxuIyAtIHdoZW4gJ2MnIGlzIGF0RU9MOiBcIlxcbmFiY1wiIC0+IFwiYWJjXFxuXCJcbiMgLSB3aGVuICdjJyBpcyBOT1QgYXRFT0w6IFwiXFxuYWJjXCIgLT4gXCJhYmNcIlxuI1xuIyBTbyBhbHdheXMgdHJpbSBpbml0aWFsIFwiXFxuXCIgcGFydCByYW5nZSBiZWNhdXNlIGZsYXNoaW5nIHRyYWlsaW5nIGxpbmUgaXMgY291bnRlcmludHVpdGl2ZS5cbmh1bWFuaXplQnVmZmVyUmFuZ2UgPSAoZWRpdG9yLCByYW5nZSkgLT5cbiAgaWYgaXNTaW5nbGVMaW5lUmFuZ2UocmFuZ2UpIG9yIGlzTGluZXdpc2VSYW5nZShyYW5nZSlcbiAgICByZXR1cm4gcmFuZ2VcblxuICB7c3RhcnQsIGVuZH0gPSByYW5nZVxuICBpZiBwb2ludElzQXRFbmRPZkxpbmUoZWRpdG9yLCBzdGFydClcbiAgICBuZXdTdGFydCA9IHN0YXJ0LnRyYXZlcnNlKFsxLCAwXSlcblxuICBpZiBwb2ludElzQXRFbmRPZkxpbmUoZWRpdG9yLCBlbmQpXG4gICAgbmV3RW5kID0gZW5kLnRyYXZlcnNlKFsxLCAwXSlcblxuICBpZiBuZXdTdGFydD8gb3IgbmV3RW5kP1xuICAgIG5ldyBSYW5nZShuZXdTdGFydCA/IHN0YXJ0LCBuZXdFbmQgPyBlbmQpXG4gIGVsc2VcbiAgICByYW5nZVxuXG4jIEV4cGFuZCByYW5nZSB0byB3aGl0ZSBzcGFjZVxuIyAgMS4gRXhwYW5kIHRvIGZvcndhcmQgZGlyZWN0aW9uLCBpZiBzdWNlZWQgcmV0dXJuIG5ldyByYW5nZS5cbiMgIDIuIEV4cGFuZCB0byBiYWNrd2FyZCBkaXJlY3Rpb24sIGlmIHN1Y2NlZWQgcmV0dXJuIG5ldyByYW5nZS5cbiMgIDMuIFdoZW4gZmFpbGQgdG8gZXhwYW5kIGVpdGhlciBkaXJlY3Rpb24sIHJldHVybiBvcmlnaW5hbCByYW5nZS5cbmV4cGFuZFJhbmdlVG9XaGl0ZVNwYWNlcyA9IChlZGl0b3IsIHJhbmdlKSAtPlxuICB7c3RhcnQsIGVuZH0gPSByYW5nZVxuXG4gIG5ld0VuZCA9IG51bGxcbiAgc2NhblJhbmdlID0gW2VuZCwgZ2V0RW5kT2ZMaW5lRm9yQnVmZmVyUm93KGVkaXRvciwgZW5kLnJvdyldXG4gIGVkaXRvci5zY2FuSW5CdWZmZXJSYW5nZSAvXFxTLywgc2NhblJhbmdlLCAoe3JhbmdlfSkgLT4gbmV3RW5kID0gcmFuZ2Uuc3RhcnRcblxuICBpZiBuZXdFbmQ/LmlzR3JlYXRlclRoYW4oZW5kKVxuICAgIHJldHVybiBuZXcgUmFuZ2Uoc3RhcnQsIG5ld0VuZClcblxuICBuZXdTdGFydCA9IG51bGxcbiAgc2NhblJhbmdlID0gW1tzdGFydC5yb3csIDBdLCByYW5nZS5zdGFydF1cbiAgZWRpdG9yLmJhY2t3YXJkc1NjYW5JbkJ1ZmZlclJhbmdlIC9cXFMvLCBzY2FuUmFuZ2UsICh7cmFuZ2V9KSAtPiBuZXdTdGFydCA9IHJhbmdlLmVuZFxuXG4gIGlmIG5ld1N0YXJ0Py5pc0xlc3NUaGFuKHN0YXJ0KVxuICAgIHJldHVybiBuZXcgUmFuZ2UobmV3U3RhcnQsIGVuZClcblxuICByZXR1cm4gcmFuZ2UgIyBmYWxsYmFja1xuXG5zY2FuRWRpdG9ySW5EaXJlY3Rpb24gPSAoZWRpdG9yLCBkaXJlY3Rpb24sIHBhdHRlcm4sIG9wdGlvbnM9e30sIGZuKSAtPlxuICB7YWxsb3dOZXh0TGluZSwgZnJvbSwgc2NhblJhbmdlfSA9IG9wdGlvbnNcbiAgaWYgbm90IGZyb20/IGFuZCBub3Qgc2NhblJhbmdlP1xuICAgIHRocm93IG5ldyBFcnJvcihcIllvdSBtdXN0IGVpdGhlciBvZiAnZnJvbScgb3IgJ3NjYW5SYW5nZScgb3B0aW9uc1wiKVxuXG4gIGlmIHNjYW5SYW5nZVxuICAgIGFsbG93TmV4dExpbmUgPSB0cnVlXG4gIGVsc2VcbiAgICBhbGxvd05leHRMaW5lID89IHRydWVcbiAgZnJvbSA9IFBvaW50LmZyb21PYmplY3QoZnJvbSkgaWYgZnJvbT9cbiAgc3dpdGNoIGRpcmVjdGlvblxuICAgIHdoZW4gJ2ZvcndhcmQnXG4gICAgICBzY2FuUmFuZ2UgPz0gbmV3IFJhbmdlKGZyb20sIGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKGVkaXRvcikpXG4gICAgICBzY2FuRnVuY3Rpb24gPSAnc2NhbkluQnVmZmVyUmFuZ2UnXG4gICAgd2hlbiAnYmFja3dhcmQnXG4gICAgICBzY2FuUmFuZ2UgPz0gbmV3IFJhbmdlKFswLCAwXSwgZnJvbSlcbiAgICAgIHNjYW5GdW5jdGlvbiA9ICdiYWNrd2FyZHNTY2FuSW5CdWZmZXJSYW5nZSdcblxuICBlZGl0b3Jbc2NhbkZ1bmN0aW9uXSBwYXR0ZXJuLCBzY2FuUmFuZ2UsIChldmVudCkgLT5cbiAgICBpZiBub3QgYWxsb3dOZXh0TGluZSBhbmQgZXZlbnQucmFuZ2Uuc3RhcnQucm93IGlzbnQgZnJvbS5yb3dcbiAgICAgIGV2ZW50LnN0b3AoKVxuICAgICAgcmV0dXJuXG4gICAgZm4oZXZlbnQpXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXRQYXJlbnRcbiAgZ2V0QW5jZXN0b3JzXG4gIGdldEtleUJpbmRpbmdGb3JDb21tYW5kXG4gIGluY2x1ZGVcbiAgZGVidWdcbiAgc2F2ZUVkaXRvclN0YXRlXG4gIGdldEtleXN0cm9rZUZvckV2ZW50XG4gIGdldENoYXJhY3RlckZvckV2ZW50XG4gIGlzTGluZXdpc2VSYW5nZVxuICBpc0VuZHNXaXRoTmV3TGluZUZvckJ1ZmZlclJvd1xuICBoYXZlU29tZU5vbkVtcHR5U2VsZWN0aW9uXG4gIHNvcnRSYW5nZXNcbiAgc29ydFJhbmdlc0J5RW5kUG9zaXRpb25cbiAgZ2V0SW5kZXhcbiAgZ2V0VmlzaWJsZUJ1ZmZlclJhbmdlXG4gIHdpdGhWaXNpYmxlQnVmZmVyUmFuZ2VcbiAgZ2V0VmlzaWJsZUVkaXRvcnNcbiAgZmluZEluZGV4QnlcbiAgbWVyZ2VJbnRlcnNlY3RpbmdSYW5nZXNcbiAgcG9pbnRJc0F0RW5kT2ZMaW5lXG4gIHBvaW50SXNPbldoaXRlU3BhY2VcbiAgcG9pbnRJc0F0RW5kT2ZMaW5lQXROb25FbXB0eVJvd1xuICBwb2ludElzQXRWaW1FbmRPZkZpbGVcbiAgY3Vyc29ySXNBdFZpbUVuZE9mRmlsZVxuICBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvblxuICBnZXRWaW1Fb2ZTY3JlZW5Qb3NpdGlvblxuICBnZXRWaW1MYXN0QnVmZmVyUm93XG4gIGdldFZpbUxhc3RTY3JlZW5Sb3dcbiAgc2V0QnVmZmVyUm93XG4gIHNldEJ1ZmZlckNvbHVtblxuICBtb3ZlQ3Vyc29yTGVmdFxuICBtb3ZlQ3Vyc29yUmlnaHRcbiAgbW92ZUN1cnNvclVwU2NyZWVuXG4gIG1vdmVDdXJzb3JEb3duU2NyZWVuXG4gIGdldEVuZE9mTGluZUZvckJ1ZmZlclJvd1xuICBnZXRGaXJzdFZpc2libGVTY3JlZW5Sb3dcbiAgZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3dcbiAgZ2V0VmFsaWRWaW1CdWZmZXJSb3dcbiAgZ2V0VmFsaWRWaW1TY3JlZW5Sb3dcbiAgbW92ZUN1cnNvclRvRmlyc3RDaGFyYWN0ZXJBdFJvd1xuICBnZXRMaW5lVGV4dFRvQnVmZmVyUG9zaXRpb25cbiAgZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3dcbiAgaXNBbGxXaGl0ZVNwYWNlVGV4dFxuICBnZXRUZXh0SW5TY3JlZW5SYW5nZVxuICBtb3ZlQ3Vyc29yVG9OZXh0Tm9uV2hpdGVzcGFjZVxuICBpc0VtcHR5Um93XG4gIGN1cnNvcklzQXRFbmRPZkxpbmVBdE5vbkVtcHR5Um93XG4gIGdldENvZGVGb2xkUm93UmFuZ2VzXG4gIGdldENvZGVGb2xkUm93UmFuZ2VzQ29udGFpbmVzRm9yUm93XG4gIGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2VcbiAgdHJpbVJhbmdlXG4gIGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3dcbiAgZ2V0Rmlyc3RDaGFyYWN0ZXJCdWZmZXJQb3NpdGlvbkZvclNjcmVlblJvd1xuICBpc0Z1bmN0aW9uU2NvcGVcbiAgaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvd1xuICBnZXRUb2tlbml6ZWRMaW5lRm9yUm93XG4gIGdldFNjb3Blc0ZvclRva2VuaXplZExpbmVcbiAgc2NhbkZvclNjb3BlU3RhcnRcbiAgZGV0ZWN0U2NvcGVTdGFydFBvc2l0aW9uRm9yU2NvcGVcbiAgZ2V0QnVmZmVyUm93c1xuICByZWdpc3RlckVsZW1lbnRcbiAgc29ydENvbXBhcmFibGVcbiAgc21hcnRTY3JvbGxUb0J1ZmZlclBvc2l0aW9uXG4gIG1hdGNoU2NvcGVzXG4gIG1vdmVDdXJzb3JEb3duQnVmZmVyXG4gIG1vdmVDdXJzb3JVcEJ1ZmZlclxuICBpc1NpbmdsZUxpbmVUZXh0XG4gIGdldEN1cnJlbnRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kXG4gIGJ1aWxkV29yZFBhdHRlcm5CeUN1cnNvclxuICBnZXRXb3JkQnVmZmVyUmFuZ2VBdEJ1ZmZlclBvc2l0aW9uXG4gIGdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uXG4gIGdldFdvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvblxuICBnZXRTdWJ3b3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb25cbiAgZ2V0Tm9uV29yZENoYXJhY3RlcnNGb3JDdXJzb3JcbiAgYWRqdXN0UmFuZ2VUb1Jvd1JhbmdlXG4gIHNocmlua1JhbmdlRW5kVG9CZWZvcmVOZXdMaW5lXG4gIHNjYW5JblJhbmdlc1xuICBzY2FuRWRpdG9yXG4gIGNvbGxlY3RSYW5nZUluQnVmZmVyUm93XG4gIGZpbmRSYW5nZUluQnVmZmVyUm93XG4gIGlzUmFuZ2VDb250YWluc1NvbWVQb2ludFxuICBkZXN0cm95Tm9uTGFzdFNlbGVjdGlvblxuICBnZXRMYXJnZXN0Rm9sZFJhbmdlQ29udGFpbnNCdWZmZXJSb3dcbiAgdHJhbnNsYXRlUG9pbnRBbmRDbGlwXG4gIGdldFJhbmdlQnlUcmFuc2xhdGVQb2ludEFuZENsaXBcbiAgZ2V0UGFja2FnZVxuICBzZWFyY2hCeVByb2plY3RGaW5kXG4gIGxpbWl0TnVtYmVyXG4gIGZpbmRSYW5nZUNvbnRhaW5zUG9pbnRcblxuICBpc0VtcHR5LCBpc05vdEVtcHR5XG4gIGlzU2luZ2xlTGluZVJhbmdlLCBpc05vdFNpbmdsZUxpbmVSYW5nZVxuXG4gIHNldFRleHRBdEJ1ZmZlclBvc2l0aW9uXG4gIGVuc3VyZUVuZHNXaXRoTmV3TGluZUZvckJ1ZmZlclJvd1xuICBpc0xlYWRpbmdXaGl0ZVNwYWNlUmFuZ2VcbiAgaXNOb3RMZWFkaW5nV2hpdGVTcGFjZVJhbmdlXG4gIGlzRXNjYXBlZENoYXJSYW5nZVxuXG4gIGZvckVhY2hQYW5lQXhpc1xuICBhZGRDbGFzc0xpc3RcbiAgcmVtb3ZlQ2xhc3NMaXN0XG4gIHRvZ2dsZUNsYXNzTGlzdFxuICB0b2dnbGVDYXNlRm9yQ2hhcmFjdGVyXG4gIHNwbGl0VGV4dEJ5TmV3TGluZVxuICBodW1hbml6ZUJ1ZmZlclJhbmdlXG4gIGV4cGFuZFJhbmdlVG9XaGl0ZVNwYWNlc1xuICBnZXRSaWdodENoYXJhY3RlckZvckJ1ZmZlclBvc2l0aW9uXG4gIGdldExlZnRDaGFyYWN0ZXJGb3JCdWZmZXJQb3NpdGlvblxuICBzY2FuRWRpdG9ySW5EaXJlY3Rpb25cbn1cbiJdfQ==
