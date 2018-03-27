(function() {
  var ArgumentsSplitter, Disposable, Point, Range, _, addClassList, adjustIndentWithKeepingLayout, assertWithException, buildWordPatternByCursor, collectRangeInBufferRow, debug, detectScopeStartPositionForScope, ensureEndsWithNewLineForBufferRow, expandRangeToWhiteSpaces, findRangeContainsPoint, findRangeInBufferRow, forEachPaneAxis, fs, getAncestors, getBeginningOfWordBufferPosition, getBufferRangeForRowRange, getBufferRows, getCodeFoldRowRanges, getCodeFoldRowRangesContainesForRow, getEndOfLineForBufferRow, getEndOfWordBufferPosition, getFirstCharacterPositionForBufferRow, getFirstVisibleScreenRow, getFoldInfoByKind, getFoldRangesWithIndent, getFoldRowRanges, getIndentLevelForBufferRow, getIndex, getKeyBindingForCommand, getLargestFoldRangeContainsBufferRow, getLastVisibleScreenRow, getLeftCharacterForBufferPosition, getLineTextToBufferPosition, getNonWordCharactersForCursor, getPackage, getRangeByTranslatePointAndClip, getRightCharacterForBufferPosition, getScopesForTokenizedLine, getSubwordPatternAtBufferPosition, getTextInScreenRange, getTokenizedLineForRow, getTraversalForText, getValidVimBufferRow, getValidVimScreenRow, getVimEofBufferPosition, getVimEofScreenPosition, getVimLastBufferRow, getVimLastScreenRow, getVisibleBufferRange, getVisibleEditors, getWordBufferRangeAndKindAtBufferPosition, getWordBufferRangeAtBufferPosition, getWordPatternAtBufferPosition, humanizeBufferRange, include, insertTextAtBufferPosition, isEmpty, isEmptyRow, isEndsWithNewLineForBufferRow, isEscapedCharRange, isFunctionScope, isIncludeFunctionScopeForRow, isLeadingWhiteSpaceRange, isLinewiseRange, isNotEmpty, isNotLeadingWhiteSpaceRange, isNotSingleLineRange, isSingleLineRange, isSingleLineText, limitNumber, matchScopes, modifyClassList, moveCursor, moveCursorDownScreen, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUpScreen, negateFunction, pointIsAtEndOfLine, pointIsAtEndOfLineAtNonEmptyRow, pointIsAtVimEndOfFile, pointIsOnWhiteSpace, rangeContainsPointWithEndExclusive, ref, removeClassList, replaceDecorationClassBy, saveEditorState, scanEditor, scanEditorInDirection, scanForScopeStart, searchByProjectFind, setBufferColumn, setBufferRow, settings, shouldPreventWrapLine, shrinkRangeEndToBeforeNewLine, smartScrollToBufferPosition, sortRanges, splitAndJoinBy, splitArguments, splitTextByNewLine, toggleCaseForCharacter, toggleClassList, translatePointAndClip, traverseTextFromPoint, trimRange,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fs = null;

  settings = require('./settings');

  ref = require('atom'), Disposable = ref.Disposable, Range = ref.Range, Point = ref.Point;

  _ = require('underscore-plus');

  assertWithException = function(condition, message, fn) {
    return atom.assert(condition, message, function(error) {
      throw new Error(error.message);
    });
  };

  getAncestors = function(obj) {
    var ancestors, current, ref1;
    ancestors = [];
    current = obj;
    while (true) {
      ancestors.push(current);
      current = (ref1 = current.__super__) != null ? ref1.constructor : void 0;
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
        if (fs == null) {
          fs = require('fs-plus');
        }
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

  sortRanges = function(collection) {
    return collection.sort(function(a, b) {
      return a.compare(b);
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

  getEndOfLineForBufferRow = function(editor, row) {
    return editor.bufferRangeForBufferRow(row).end;
  };

  pointIsAtEndOfLine = function(editor, point) {
    point = Point.fromObject(point);
    return getEndOfLineForBufferRow(editor, point.row).isEqual(point);
  };

  pointIsOnWhiteSpace = function(editor, point) {
    var char;
    char = getRightCharacterForBufferPosition(editor, point);
    return !/\S/.test(char);
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

  getFoldRowRanges = function(editor) {
    var j, ref1, results1, seen;
    seen = {};
    return (function() {
      results1 = [];
      for (var j = 0, ref1 = editor.getLastBufferRow(); 0 <= ref1 ? j <= ref1 : j >= ref1; 0 <= ref1 ? j++ : j--){ results1.push(j); }
      return results1;
    }).apply(this).map(function(row) {
      return editor.languageMode.rowRangeForCodeFoldAtBufferRow(row);
    }).filter(function(rowRange) {
      return (rowRange != null) && (rowRange[0] != null) && (rowRange[1] != null);
    }).filter(function(rowRange) {
      if (seen[rowRange]) {
        return false;
      } else {
        return seen[rowRange] = true;
      }
    });
  };

  getFoldRangesWithIndent = function(editor) {
    return getFoldRowRanges(editor).map(function(arg) {
      var endRow, indent, startRow;
      startRow = arg[0], endRow = arg[1];
      indent = editor.indentationForBufferRow(startRow);
      return {
        startRow: startRow,
        endRow: endRow,
        indent: indent
      };
    });
  };

  getFoldInfoByKind = function(editor) {
    var foldInfoByKind, j, len, ref1, rowRangeWithIndent, updateFoldInfo;
    foldInfoByKind = {};
    updateFoldInfo = function(kind, rowRangeWithIndent) {
      var foldInfo, indent, ref1, ref2;
      foldInfo = (foldInfoByKind[kind] != null ? foldInfoByKind[kind] : foldInfoByKind[kind] = {});
      if (foldInfo.rowRangesWithIndent == null) {
        foldInfo.rowRangesWithIndent = [];
      }
      foldInfo.rowRangesWithIndent.push(rowRangeWithIndent);
      indent = rowRangeWithIndent.indent;
      foldInfo.minIndent = Math.min((ref1 = foldInfo.minIndent) != null ? ref1 : indent, indent);
      return foldInfo.maxIndent = Math.max((ref2 = foldInfo.maxIndent) != null ? ref2 : indent, indent);
    };
    ref1 = getFoldRangesWithIndent(editor);
    for (j = 0, len = ref1.length; j < len; j++) {
      rowRangeWithIndent = ref1[j];
      updateFoldInfo('allFold', rowRangeWithIndent);
      if (editor.isFoldedAtBufferRow(rowRangeWithIndent.startRow)) {
        updateFoldInfo('folded', rowRangeWithIndent);
      } else {
        updateFoldInfo('unfolded', rowRangeWithIndent);
      }
    }
    return foldInfoByKind;
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
    var boundarizeForWord, endBoundary, kind, pattern, range, ref1, ref2, startBoundary, text;
    if (options == null) {
      options = {};
    }
    boundarizeForWord = (ref1 = options.boundarizeForWord) != null ? ref1 : true;
    delete options.boundarizeForWord;
    ref2 = getWordBufferRangeAndKindAtBufferPosition(editor, point, options), range = ref2.range, kind = ref2.kind;
    text = editor.getTextInBufferRange(range);
    pattern = _.escapeRegExp(text);
    if (kind === 'word' && boundarizeForWord) {
      startBoundary = /^\w/.test(text) ? "\\b" : '';
      endBoundary = /\w$/.test(text) ? "\\b" : '';
      pattern = startBoundary + pattern + endBoundary;
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

  translatePointAndClip = function(editor, point, direction) {
    var dontClip, eol, newRow, screenPoint;
    point = Point.fromObject(point);
    dontClip = false;
    switch (direction) {
      case 'forward':
        point = point.translate([0, +1]);
        eol = editor.bufferRangeForBufferRow(point.row).end;
        if (point.isEqual(eol)) {
          dontClip = true;
        } else if (point.isGreaterThan(eol)) {
          dontClip = true;
          point = new Point(point.row + 1, 0);
        }
        point = Point.min(point, editor.getEofBufferPosition());
        break;
      case 'backward':
        point = point.translate([0, -1]);
        if (point.column < 0) {
          dontClip = true;
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

  getRangeByTranslatePointAndClip = function(editor, range, which, direction) {
    var newPoint;
    newPoint = translatePointAndClip(editor, range[which], direction);
    switch (which) {
      case 'start':
        return new Range(newPoint, range.end);
      case 'end':
        return new Range(range.start, newPoint);
    }
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

  insertTextAtBufferPosition = function(editor, point, text) {
    return editor.setTextInBufferRange([point, point], text);
  };

  ensureEndsWithNewLineForBufferRow = function(editor, row) {
    var eol;
    if (!isEndsWithNewLineForBufferRow(editor, row)) {
      eol = getEndOfLineForBufferRow(editor, row);
      return insertTextAtBufferPosition(editor, eol, "\n");
    }
  };

  forEachPaneAxis = function(base, fn) {
    var child, j, len, ref1, results1;
    if (base.children != null) {
      fn(base);
      ref1 = base.children;
      results1 = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        child = ref1[j];
        results1.push(forEachPaneAxis(child, fn));
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

  replaceDecorationClassBy = function(fn, decoration) {
    var props;
    props = decoration.getProperties();
    return decoration.setProperties(_.defaults({
      "class": fn(props["class"])
    }, props));
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

  splitAndJoinBy = function(text, pattern, fn) {
    var end, flags, i, item, items, j, k, leadingSpaces, len, len1, ref1, ref2, ref3, regexp, result, segment, separator, separators, start, trailingSpaces;
    leadingSpaces = trailingSpaces = '';
    start = text.search(/\S/);
    end = text.search(/\s*$/);
    leadingSpaces = trailingSpaces = '';
    if (start !== -1) {
      leadingSpaces = text.slice(0, start);
    }
    if (end !== -1) {
      trailingSpaces = text.slice(end);
    }
    text = text.slice(start, end);
    flags = 'g';
    if (pattern.ignoreCase) {
      flags += 'i';
    }
    regexp = new RegExp("(" + pattern.source + ")", flags);
    items = [];
    separators = [];
    ref1 = text.split(regexp);
    for (i = j = 0, len = ref1.length; j < len; i = ++j) {
      segment = ref1[i];
      if (i % 2 === 0) {
        items.push(segment);
      } else {
        separators.push(segment);
      }
    }
    separators.push('');
    items = fn(items);
    result = '';
    ref2 = _.zip(items, separators);
    for (k = 0, len1 = ref2.length; k < len1; k++) {
      ref3 = ref2[k], item = ref3[0], separator = ref3[1];
      result += item + separator;
    }
    return leadingSpaces + result + trailingSpaces;
  };

  ArgumentsSplitter = (function() {
    function ArgumentsSplitter() {
      this.allTokens = [];
      this.currentSection = null;
    }

    ArgumentsSplitter.prototype.settlePending = function() {
      if (this.pendingToken) {
        this.allTokens.push({
          text: this.pendingToken,
          type: this.currentSection
        });
        return this.pendingToken = '';
      }
    };

    ArgumentsSplitter.prototype.changeSection = function(newSection) {
      if (this.currentSection !== newSection) {
        if (this.currentSection) {
          this.settlePending();
        }
        return this.currentSection = newSection;
      }
    };

    return ArgumentsSplitter;

  })();

  splitArguments = function(text, joinSpaceSeparatedToken) {
    var allTokens, changeSection, char, closeCharToOpenChar, closePairChars, currentSection, escapeChar, inQuote, isEscaped, j, lastArg, len, newAllTokens, openPairChars, pairStack, pendingToken, quoteChars, ref1, ref2, ref3, separatorChars, settlePending, token;
    if (joinSpaceSeparatedToken == null) {
      joinSpaceSeparatedToken = true;
    }
    separatorChars = "\t, \r\n";
    quoteChars = "\"'`";
    closeCharToOpenChar = {
      ")": "(",
      "}": "{",
      "]": "["
    };
    closePairChars = _.keys(closeCharToOpenChar).join('');
    openPairChars = _.values(closeCharToOpenChar).join('');
    escapeChar = "\\";
    pendingToken = '';
    inQuote = false;
    isEscaped = false;
    allTokens = [];
    currentSection = null;
    settlePending = function() {
      if (pendingToken) {
        allTokens.push({
          text: pendingToken,
          type: currentSection
        });
        return pendingToken = '';
      }
    };
    changeSection = function(newSection) {
      if (currentSection !== newSection) {
        if (currentSection) {
          settlePending();
        }
        return currentSection = newSection;
      }
    };
    pairStack = [];
    for (j = 0, len = text.length; j < len; j++) {
      char = text[j];
      if ((pairStack.length === 0) && (indexOf.call(separatorChars, char) >= 0)) {
        changeSection('separator');
      } else {
        changeSection('argument');
        if (isEscaped) {
          isEscaped = false;
        } else if (char === escapeChar) {
          isEscaped = true;
        } else if (inQuote) {
          if ((indexOf.call(quoteChars, char) >= 0) && _.last(pairStack) === char) {
            pairStack.pop();
            inQuote = false;
          }
        } else if (indexOf.call(quoteChars, char) >= 0) {
          inQuote = true;
          pairStack.push(char);
        } else if (indexOf.call(openPairChars, char) >= 0) {
          pairStack.push(char);
        } else if (indexOf.call(closePairChars, char) >= 0) {
          if (_.last(pairStack) === closeCharToOpenChar[char]) {
            pairStack.pop();
          }
        }
      }
      pendingToken += char;
    }
    settlePending();
    if (joinSpaceSeparatedToken && allTokens.some(function(arg) {
      var text, type;
      type = arg.type, text = arg.text;
      return type === 'separator' && indexOf.call(text, ',') >= 0;
    })) {
      newAllTokens = [];
      while (allTokens.length) {
        token = allTokens.shift();
        switch (token.type) {
          case 'argument':
            newAllTokens.push(token);
            break;
          case 'separator':
            if (indexOf.call(token.text, ',') >= 0) {
              newAllTokens.push(token);
            } else {
              lastArg = (ref1 = newAllTokens.pop()) != null ? ref1 : {
                text: '',
                'argument': 'argument'
              };
              lastArg.text += token.text + ((ref2 = (ref3 = allTokens.shift()) != null ? ref3.text : void 0) != null ? ref2 : '');
              newAllTokens.push(lastArg);
            }
        }
      }
      allTokens = newAllTokens;
    }
    return allTokens;
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

  adjustIndentWithKeepingLayout = function(editor, range) {
    var actualLevel, deltaToSuggestedLevel, j, k, len, minLevel, newLevel, ref1, ref2, ref3, results1, row, rowAndActualLevels, suggestedLevel;
    suggestedLevel = editor.suggestedIndentForBufferRow(range.start.row);
    minLevel = null;
    rowAndActualLevels = [];
    for (row = j = ref1 = range.start.row, ref2 = range.end.row; ref1 <= ref2 ? j < ref2 : j > ref2; row = ref1 <= ref2 ? ++j : --j) {
      actualLevel = getIndentLevelForBufferRow(editor, row);
      rowAndActualLevels.push([row, actualLevel]);
      if (!isEmptyRow(editor, row)) {
        minLevel = Math.min(minLevel != null ? minLevel : 2e308, actualLevel);
      }
    }
    if ((minLevel != null) && (deltaToSuggestedLevel = suggestedLevel - minLevel)) {
      results1 = [];
      for (k = 0, len = rowAndActualLevels.length; k < len; k++) {
        ref3 = rowAndActualLevels[k], row = ref3[0], actualLevel = ref3[1];
        newLevel = actualLevel + deltaToSuggestedLevel;
        results1.push(editor.setIndentationForBufferRow(row, newLevel));
      }
      return results1;
    }
  };

  rangeContainsPointWithEndExclusive = function(range, point) {
    return range.start.isLessThanOrEqual(point) && range.end.isGreaterThan(point);
  };

  traverseTextFromPoint = function(point, text) {
    return point.traverse(getTraversalForText(text));
  };

  getTraversalForText = function(text) {
    var char, column, j, len, row;
    row = 0;
    column = 0;
    for (j = 0, len = text.length; j < len; j++) {
      char = text[j];
      if (char === "\n") {
        row++;
        column = 0;
      } else {
        column++;
      }
    }
    return [row, column];
  };

  module.exports = {
    assertWithException: assertWithException,
    getAncestors: getAncestors,
    getKeyBindingForCommand: getKeyBindingForCommand,
    include: include,
    debug: debug,
    saveEditorState: saveEditorState,
    isLinewiseRange: isLinewiseRange,
    sortRanges: sortRanges,
    getIndex: getIndex,
    getVisibleBufferRange: getVisibleBufferRange,
    getVisibleEditors: getVisibleEditors,
    pointIsAtEndOfLine: pointIsAtEndOfLine,
    pointIsOnWhiteSpace: pointIsOnWhiteSpace,
    pointIsAtEndOfLineAtNonEmptyRow: pointIsAtEndOfLineAtNonEmptyRow,
    pointIsAtVimEndOfFile: pointIsAtVimEndOfFile,
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
    getTextInScreenRange: getTextInScreenRange,
    moveCursorToNextNonWhitespace: moveCursorToNextNonWhitespace,
    isEmptyRow: isEmptyRow,
    getCodeFoldRowRanges: getCodeFoldRowRanges,
    getCodeFoldRowRangesContainesForRow: getCodeFoldRowRangesContainesForRow,
    getFoldRowRanges: getFoldRowRanges,
    getFoldRangesWithIndent: getFoldRangesWithIndent,
    getFoldInfoByKind: getFoldInfoByKind,
    getBufferRangeForRowRange: getBufferRangeForRowRange,
    trimRange: trimRange,
    getFirstCharacterPositionForBufferRow: getFirstCharacterPositionForBufferRow,
    isIncludeFunctionScopeForRow: isIncludeFunctionScopeForRow,
    detectScopeStartPositionForScope: detectScopeStartPositionForScope,
    getBufferRows: getBufferRows,
    smartScrollToBufferPosition: smartScrollToBufferPosition,
    matchScopes: matchScopes,
    isSingleLineText: isSingleLineText,
    getWordBufferRangeAtBufferPosition: getWordBufferRangeAtBufferPosition,
    getWordBufferRangeAndKindAtBufferPosition: getWordBufferRangeAndKindAtBufferPosition,
    getWordPatternAtBufferPosition: getWordPatternAtBufferPosition,
    getSubwordPatternAtBufferPosition: getSubwordPatternAtBufferPosition,
    getNonWordCharactersForCursor: getNonWordCharactersForCursor,
    shrinkRangeEndToBeforeNewLine: shrinkRangeEndToBeforeNewLine,
    scanEditor: scanEditor,
    collectRangeInBufferRow: collectRangeInBufferRow,
    findRangeInBufferRow: findRangeInBufferRow,
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
    insertTextAtBufferPosition: insertTextAtBufferPosition,
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
    replaceDecorationClassBy: replaceDecorationClassBy,
    humanizeBufferRange: humanizeBufferRange,
    expandRangeToWhiteSpaces: expandRangeToWhiteSpaces,
    splitAndJoinBy: splitAndJoinBy,
    splitArguments: splitArguments,
    scanEditorInDirection: scanEditorInDirection,
    adjustIndentWithKeepingLayout: adjustIndentWithKeepingLayout,
    rangeContainsPointWithEndExclusive: rangeContainsPointWithEndExclusive,
    traverseTextFromPoint: traverseTextFromPoint
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvdXRpbHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx1NkVBQUE7SUFBQTs7O0VBQUEsRUFBQSxHQUFLOztFQUNMLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUjs7RUFFWCxNQUE2QixPQUFBLENBQVEsTUFBUixDQUE3QixFQUFDLDJCQUFELEVBQWEsaUJBQWIsRUFBb0I7O0VBQ3BCLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBRUosbUJBQUEsR0FBc0IsU0FBQyxTQUFELEVBQVksT0FBWixFQUFxQixFQUFyQjtXQUNwQixJQUFJLENBQUMsTUFBTCxDQUFZLFNBQVosRUFBdUIsT0FBdkIsRUFBZ0MsU0FBQyxLQUFEO0FBQzlCLFlBQVUsSUFBQSxLQUFBLENBQU0sS0FBSyxDQUFDLE9BQVo7SUFEb0IsQ0FBaEM7RUFEb0I7O0VBSXRCLFlBQUEsR0FBZSxTQUFDLEdBQUQ7QUFDYixRQUFBO0lBQUEsU0FBQSxHQUFZO0lBQ1osT0FBQSxHQUFVO0FBQ1YsV0FBQSxJQUFBO01BQ0UsU0FBUyxDQUFDLElBQVYsQ0FBZSxPQUFmO01BQ0EsT0FBQSw0Q0FBMkIsQ0FBRTtNQUM3QixJQUFBLENBQWEsT0FBYjtBQUFBLGNBQUE7O0lBSEY7V0FJQTtFQVBhOztFQVNmLHVCQUFBLEdBQTBCLFNBQUMsT0FBRCxFQUFVLEdBQVY7QUFDeEIsUUFBQTtJQURtQyxjQUFEO0lBQ2xDLE9BQUEsR0FBVTtJQUNWLE9BQUEsR0FBVSxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWIsQ0FBQTtJQUNWLElBQUcsbUJBQUg7TUFDRSxVQUFBLEdBQWEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixXQUEvQixDQUEyQyxDQUFDLGNBQTVDLENBQUEsQ0FBNEQsQ0FBQyxHQUE3RCxDQUFBO01BQ2IsT0FBQSxHQUFVLE9BQU8sQ0FBQyxNQUFSLENBQWUsU0FBQyxJQUFEO0FBQWMsWUFBQTtRQUFaLFNBQUQ7ZUFBYSxNQUFBLEtBQVU7TUFBeEIsQ0FBZixFQUZaOztBQUlBLFNBQUEseUNBQUE7O1lBQTJCLE1BQU0sQ0FBQyxPQUFQLEtBQWtCOzs7TUFDMUMsOEJBQUQsRUFBYTtNQUNiLFVBQUEsR0FBYSxVQUFVLENBQUMsT0FBWCxDQUFtQixRQUFuQixFQUE2QixFQUE3QjtNQUNiLG1CQUFDLFVBQUEsVUFBVyxFQUFaLENBQWUsQ0FBQyxJQUFoQixDQUFxQjtRQUFDLFlBQUEsVUFBRDtRQUFhLFVBQUEsUUFBYjtPQUFyQjtBQUhGO1dBSUE7RUFYd0I7O0VBYzFCLE9BQUEsR0FBVSxTQUFDLEtBQUQsRUFBUSxNQUFSO0FBQ1IsUUFBQTtBQUFBO1NBQUEsYUFBQTs7b0JBQ0UsS0FBSyxDQUFBLFNBQUcsQ0FBQSxHQUFBLENBQVIsR0FBZTtBQURqQjs7RUFEUTs7RUFJVixLQUFBLEdBQVEsU0FBQTtBQUNOLFFBQUE7SUFETztJQUNQLElBQUEsQ0FBYyxRQUFRLENBQUMsR0FBVCxDQUFhLE9BQWIsQ0FBZDtBQUFBLGFBQUE7O0FBQ0EsWUFBTyxRQUFRLENBQUMsR0FBVCxDQUFhLGFBQWIsQ0FBUDtBQUFBLFdBQ08sU0FEUDtlQUVJLE9BQU8sQ0FBQyxHQUFSLGdCQUFZLFFBQVo7QUFGSixXQUdPLE1BSFA7O1VBSUksS0FBTSxPQUFBLENBQVEsU0FBUjs7UUFDTixRQUFBLEdBQVcsRUFBRSxDQUFDLFNBQUgsQ0FBYSxRQUFRLENBQUMsR0FBVCxDQUFhLHFCQUFiLENBQWI7UUFDWCxJQUFHLEVBQUUsQ0FBQyxVQUFILENBQWMsUUFBZCxDQUFIO2lCQUNFLEVBQUUsQ0FBQyxjQUFILENBQWtCLFFBQWxCLEVBQTRCLFFBQUEsR0FBVyxJQUF2QyxFQURGOztBQU5KO0VBRk07O0VBWVIsZUFBQSxHQUFrQixTQUFDLE1BQUQ7QUFDaEIsUUFBQTtJQUFBLGFBQUEsR0FBZ0IsTUFBTSxDQUFDO0lBQ3ZCLFNBQUEsR0FBWSxhQUFhLENBQUMsWUFBZCxDQUFBO0lBRVosYUFBQSxHQUFnQixNQUFNLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLFdBQXJDLENBQWlELEVBQWpELENBQW9ELENBQUMsR0FBckQsQ0FBeUQsU0FBQyxDQUFEO2FBQU8sQ0FBQyxDQUFDLGdCQUFGLENBQUEsQ0FBb0IsQ0FBQztJQUE1QixDQUF6RDtXQUNoQixTQUFBO0FBQ0UsVUFBQTtBQUFBO0FBQUEsV0FBQSxzQ0FBQTs7WUFBd0MsQ0FBSSxNQUFNLENBQUMsbUJBQVAsQ0FBMkIsR0FBM0I7VUFDMUMsTUFBTSxDQUFDLGFBQVAsQ0FBcUIsR0FBckI7O0FBREY7YUFFQSxhQUFhLENBQUMsWUFBZCxDQUEyQixTQUEzQjtJQUhGO0VBTGdCOztFQVVsQixlQUFBLEdBQWtCLFNBQUMsR0FBRDtBQUNoQixRQUFBO0lBRGtCLG1CQUFPO1dBQ3pCLENBQUMsS0FBSyxDQUFDLEdBQU4sS0FBZSxHQUFHLENBQUMsR0FBcEIsQ0FBQSxJQUE2QixDQUFDLENBQUEsS0FBSyxDQUFDLE1BQU4sYUFBZ0IsR0FBRyxDQUFDLE9BQXBCLFFBQUEsS0FBOEIsQ0FBOUIsQ0FBRDtFQURiOztFQUdsQiw2QkFBQSxHQUFnQyxTQUFDLE1BQUQsRUFBUyxHQUFUO0FBQzlCLFFBQUE7SUFBQSxPQUFlLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixHQUEvQixFQUFvQztNQUFBLGNBQUEsRUFBZ0IsSUFBaEI7S0FBcEMsQ0FBZixFQUFDLGtCQUFELEVBQVE7V0FDUixLQUFLLENBQUMsR0FBTixLQUFlLEdBQUcsQ0FBQztFQUZXOztFQUloQyxVQUFBLEdBQWEsU0FBQyxVQUFEO1dBQ1gsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsU0FBQyxDQUFELEVBQUksQ0FBSjthQUFVLENBQUMsQ0FBQyxPQUFGLENBQVUsQ0FBVjtJQUFWLENBQWhCO0VBRFc7O0VBS2IsUUFBQSxHQUFXLFNBQUMsS0FBRCxFQUFRLElBQVI7QUFDVCxRQUFBO0lBQUEsTUFBQSxHQUFTLElBQUksQ0FBQztJQUNkLElBQUcsTUFBQSxLQUFVLENBQWI7YUFDRSxDQUFDLEVBREg7S0FBQSxNQUFBO01BR0UsS0FBQSxHQUFRLEtBQUEsR0FBUTtNQUNoQixJQUFHLEtBQUEsSUFBUyxDQUFaO2VBQ0UsTUFERjtPQUFBLE1BQUE7ZUFHRSxNQUFBLEdBQVMsTUFIWDtPQUpGOztFQUZTOztFQWFYLHFCQUFBLEdBQXdCLFNBQUMsTUFBRDtBQUN0QixRQUFBO0lBQUEsT0FBcUIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxrQkFBZixDQUFBLENBQXJCLEVBQUMsa0JBQUQsRUFBVztJQUNYLElBQUEsQ0FBbUIsQ0FBQyxrQkFBQSxJQUFjLGdCQUFmLENBQW5CO0FBQUEsYUFBTyxLQUFQOztJQUNBLFFBQUEsR0FBVyxNQUFNLENBQUMscUJBQVAsQ0FBNkIsUUFBN0I7SUFDWCxNQUFBLEdBQVMsTUFBTSxDQUFDLHFCQUFQLENBQTZCLE1BQTdCO1dBQ0wsSUFBQSxLQUFBLENBQU0sQ0FBQyxRQUFELEVBQVcsQ0FBWCxDQUFOLEVBQXFCLENBQUMsTUFBRCxFQUFTLEtBQVQsQ0FBckI7RUFMa0I7O0VBT3hCLGlCQUFBLEdBQW9CLFNBQUE7QUFDbEIsUUFBQTtBQUFDO0FBQUE7U0FBQSxzQ0FBQTs7VUFBa0QsTUFBQSxHQUFTLElBQUksQ0FBQyxlQUFMLENBQUE7c0JBQTNEOztBQUFBOztFQURpQjs7RUFHcEIsd0JBQUEsR0FBMkIsU0FBQyxNQUFELEVBQVMsR0FBVDtXQUN6QixNQUFNLENBQUMsdUJBQVAsQ0FBK0IsR0FBL0IsQ0FBbUMsQ0FBQztFQURYOztFQUszQixrQkFBQSxHQUFxQixTQUFDLE1BQUQsRUFBUyxLQUFUO0lBQ25CLEtBQUEsR0FBUSxLQUFLLENBQUMsVUFBTixDQUFpQixLQUFqQjtXQUNSLHdCQUFBLENBQXlCLE1BQXpCLEVBQWlDLEtBQUssQ0FBQyxHQUF2QyxDQUEyQyxDQUFDLE9BQTVDLENBQW9ELEtBQXBEO0VBRm1COztFQUlyQixtQkFBQSxHQUFzQixTQUFDLE1BQUQsRUFBUyxLQUFUO0FBQ3BCLFFBQUE7SUFBQSxJQUFBLEdBQU8sa0NBQUEsQ0FBbUMsTUFBbkMsRUFBMkMsS0FBM0M7V0FDUCxDQUFJLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBVjtFQUZnQjs7RUFJdEIsK0JBQUEsR0FBa0MsU0FBQyxNQUFELEVBQVMsS0FBVDtJQUNoQyxLQUFBLEdBQVEsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsS0FBakI7V0FDUixLQUFLLENBQUMsTUFBTixLQUFrQixDQUFsQixJQUF3QixrQkFBQSxDQUFtQixNQUFuQixFQUEyQixLQUEzQjtFQUZROztFQUlsQyxxQkFBQSxHQUF3QixTQUFDLE1BQUQsRUFBUyxLQUFUO1dBQ3RCLHVCQUFBLENBQXdCLE1BQXhCLENBQStCLENBQUMsT0FBaEMsQ0FBd0MsS0FBeEM7RUFEc0I7O0VBR3hCLFVBQUEsR0FBYSxTQUFDLE1BQUQsRUFBUyxHQUFUO1dBQ1gsTUFBTSxDQUFDLHVCQUFQLENBQStCLEdBQS9CLENBQW1DLENBQUMsT0FBcEMsQ0FBQTtFQURXOztFQUdiLGtDQUFBLEdBQXFDLFNBQUMsTUFBRCxFQUFTLEtBQVQsRUFBZ0IsTUFBaEI7O01BQWdCLFNBQU87O1dBQzFELE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixLQUFLLENBQUMsa0JBQU4sQ0FBeUIsS0FBekIsRUFBZ0MsQ0FBaEMsRUFBbUMsTUFBbkMsQ0FBNUI7RUFEbUM7O0VBR3JDLGlDQUFBLEdBQW9DLFNBQUMsTUFBRCxFQUFTLEtBQVQsRUFBZ0IsTUFBaEI7O01BQWdCLFNBQU87O1dBQ3pELE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixLQUFLLENBQUMsa0JBQU4sQ0FBeUIsS0FBekIsRUFBZ0MsQ0FBaEMsRUFBbUMsQ0FBQyxNQUFwQyxDQUE1QjtFQURrQzs7RUFHcEMsb0JBQUEsR0FBdUIsU0FBQyxNQUFELEVBQVMsV0FBVDtBQUNyQixRQUFBO0lBQUEsV0FBQSxHQUFjLE1BQU0sQ0FBQyx5QkFBUCxDQUFpQyxXQUFqQztXQUNkLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixXQUE1QjtFQUZxQjs7RUFJdkIsNkJBQUEsR0FBZ0MsU0FBQyxNQUFEO0FBRTlCLFFBQUE7SUFBQSxJQUFHLG1DQUFIO2FBQ0UsTUFBTSxDQUFDLG9CQUFQLENBQUEsRUFERjtLQUFBLE1BQUE7TUFHRSxLQUFBLEdBQVEsTUFBTSxDQUFDLGtCQUFQLENBQUEsQ0FBMkIsQ0FBQyxjQUE1QixDQUFBO2FBQ1IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDBCQUFoQixFQUE0QztRQUFDLE9BQUEsS0FBRDtPQUE1QyxFQUpGOztFQUY4Qjs7RUFVaEMsNkJBQUEsR0FBZ0MsU0FBQyxNQUFEO0FBQzlCLFFBQUE7SUFBQSxhQUFBLEdBQWdCLE1BQU0sQ0FBQyxpQkFBUCxDQUFBO0lBQ2hCLE1BQUEsR0FBUyxNQUFNLENBQUM7SUFDaEIsTUFBQSxHQUFTLHVCQUFBLENBQXdCLE1BQXhCO0FBRVQsV0FBTSxtQkFBQSxDQUFvQixNQUFwQixFQUE0QixLQUFBLEdBQVEsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBcEMsQ0FBQSxJQUFvRSxDQUFJLEtBQUssQ0FBQyxvQkFBTixDQUEyQixNQUEzQixDQUE5RTtNQUNFLE1BQU0sQ0FBQyxTQUFQLENBQUE7SUFERjtXQUVBLENBQUksYUFBYSxDQUFDLE9BQWQsQ0FBc0IsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBdEI7RUFQMEI7O0VBU2hDLGFBQUEsR0FBZ0IsU0FBQyxNQUFELEVBQVMsR0FBVDtBQUNkLFFBQUE7SUFEd0IseUJBQVU7QUFDbEMsWUFBTyxTQUFQO0FBQUEsV0FDTyxVQURQO1FBRUksSUFBRyxRQUFBLElBQVksQ0FBZjtpQkFDRSxHQURGO1NBQUEsTUFBQTtpQkFHRTs7Ozt5QkFIRjs7QUFERztBQURQLFdBTU8sTUFOUDtRQU9JLE1BQUEsR0FBUyxtQkFBQSxDQUFvQixNQUFwQjtRQUNULElBQUcsUUFBQSxJQUFZLE1BQWY7aUJBQ0UsR0FERjtTQUFBLE1BQUE7aUJBR0U7Ozs7eUJBSEY7O0FBUko7RUFEYzs7RUFvQmhCLHVCQUFBLEdBQTBCLFNBQUMsTUFBRDtBQUN4QixRQUFBO0lBQUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxvQkFBUCxDQUFBO0lBQ04sSUFBRyxDQUFDLEdBQUcsQ0FBQyxHQUFKLEtBQVcsQ0FBWixDQUFBLElBQWtCLENBQUMsR0FBRyxDQUFDLE1BQUosR0FBYSxDQUFkLENBQXJCO2FBQ0UsSUFERjtLQUFBLE1BQUE7YUFHRSx3QkFBQSxDQUF5QixNQUF6QixFQUFpQyxHQUFHLENBQUMsR0FBSixHQUFVLENBQTNDLEVBSEY7O0VBRndCOztFQU8xQix1QkFBQSxHQUEwQixTQUFDLE1BQUQ7V0FDeEIsTUFBTSxDQUFDLCtCQUFQLENBQXVDLHVCQUFBLENBQXdCLE1BQXhCLENBQXZDO0VBRHdCOztFQUcxQixtQkFBQSxHQUFzQixTQUFDLE1BQUQ7V0FBWSx1QkFBQSxDQUF3QixNQUF4QixDQUErQixDQUFDO0VBQTVDOztFQUN0QixtQkFBQSxHQUFzQixTQUFDLE1BQUQ7V0FBWSx1QkFBQSxDQUF3QixNQUF4QixDQUErQixDQUFDO0VBQTVDOztFQUN0Qix3QkFBQSxHQUEyQixTQUFDLE1BQUQ7V0FBWSxNQUFNLENBQUMsT0FBTyxDQUFDLHdCQUFmLENBQUE7RUFBWjs7RUFDM0IsdUJBQUEsR0FBMEIsU0FBQyxNQUFEO1dBQVksTUFBTSxDQUFDLE9BQU8sQ0FBQyx1QkFBZixDQUFBO0VBQVo7O0VBRTFCLHFDQUFBLEdBQXdDLFNBQUMsTUFBRCxFQUFTLEdBQVQ7QUFDdEMsUUFBQTtJQUFBLEtBQUEsR0FBUSxvQkFBQSxDQUFxQixNQUFyQixFQUE2QixJQUE3QixFQUFtQyxHQUFuQzswRUFDVyxJQUFBLEtBQUEsQ0FBTSxHQUFOLEVBQVcsQ0FBWDtFQUZtQjs7RUFJeEMsU0FBQSxHQUFZLFNBQUMsTUFBRCxFQUFTLFNBQVQ7QUFDVixRQUFBO0lBQUEsT0FBQSxHQUFVO0lBQ1YsT0FBZSxFQUFmLEVBQUMsZUFBRCxFQUFRO0lBQ1IsUUFBQSxHQUFXLFNBQUMsR0FBRDtBQUFhLFVBQUE7TUFBWCxRQUFEO2FBQWEsbUJBQUQsRUFBVTtJQUF2QjtJQUNYLE1BQUEsR0FBUyxTQUFDLEdBQUQ7QUFBYSxVQUFBO01BQVgsUUFBRDthQUFhLGVBQUQsRUFBUTtJQUFyQjtJQUNULE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixPQUF6QixFQUFrQyxTQUFsQyxFQUE2QyxRQUE3QztJQUNBLElBQWlFLGFBQWpFO01BQUEsTUFBTSxDQUFDLDBCQUFQLENBQWtDLE9BQWxDLEVBQTJDLFNBQTNDLEVBQXNELE1BQXRELEVBQUE7O0lBQ0EsSUFBRyxlQUFBLElBQVcsYUFBZDthQUNNLElBQUEsS0FBQSxDQUFNLEtBQU4sRUFBYSxHQUFiLEVBRE47S0FBQSxNQUFBO2FBR0UsVUFIRjs7RUFQVTs7RUFlWixZQUFBLEdBQWUsU0FBQyxNQUFELEVBQVMsR0FBVCxFQUFjLE9BQWQ7QUFDYixRQUFBO0lBQUEsTUFBQSwrQ0FBNkIsTUFBTSxDQUFDLGVBQVAsQ0FBQTtJQUM3QixNQUFNLENBQUMsaUJBQVAsQ0FBeUIsQ0FBQyxHQUFELEVBQU0sTUFBTixDQUF6QixFQUF3QyxPQUF4QztXQUNBLE1BQU0sQ0FBQyxVQUFQLEdBQW9CO0VBSFA7O0VBS2YsZUFBQSxHQUFrQixTQUFDLE1BQUQsRUFBUyxNQUFUO1dBQ2hCLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixDQUFDLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FBRCxFQUF3QixNQUF4QixDQUF6QjtFQURnQjs7RUFHbEIsVUFBQSxHQUFhLFNBQUMsTUFBRCxFQUFTLEdBQVQsRUFBK0IsRUFBL0I7QUFDWCxRQUFBO0lBRHFCLHFCQUFEO0lBQ25CLGFBQWM7SUFDZixFQUFBLENBQUcsTUFBSDtJQUNBLElBQUcsa0JBQUEsSUFBdUIsb0JBQTFCO2FBQ0UsTUFBTSxDQUFDLFVBQVAsR0FBb0IsV0FEdEI7O0VBSFc7O0VBVWIscUJBQUEsR0FBd0IsU0FBQyxNQUFEO0FBQ3RCLFFBQUE7SUFBQSxPQUFnQixNQUFNLENBQUMsaUJBQVAsQ0FBQSxDQUFoQixFQUFDLGNBQUQsRUFBTTtJQUNOLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGlCQUFoQixDQUFIO01BQ0UsU0FBQSxHQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixrQkFBaEI7TUFDWixJQUFHLENBQUEsQ0FBQSxHQUFJLE1BQUosSUFBSSxNQUFKLEdBQWEsU0FBYixDQUFIO1FBQ0UsSUFBQSxHQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsb0JBQWQsQ0FBbUMsQ0FBQyxDQUFDLEdBQUQsRUFBTSxDQUFOLENBQUQsRUFBVyxDQUFDLEdBQUQsRUFBTSxTQUFOLENBQVgsQ0FBbkM7ZUFDUCxPQUFPLENBQUMsSUFBUixDQUFhLElBQWIsRUFGRjtPQUFBLE1BQUE7ZUFJRSxNQUpGO09BRkY7O0VBRnNCOztFQWF4QixjQUFBLEdBQWlCLFNBQUMsTUFBRCxFQUFTLE9BQVQ7QUFDZixRQUFBOztNQUR3QixVQUFROztJQUMvQiw2QkFBRCxFQUFZO0lBQ1osT0FBTyxPQUFPLENBQUM7SUFDZixJQUFHLGdDQUFIO01BQ0UsSUFBVSxxQkFBQSxDQUFzQixNQUF0QixDQUFWO0FBQUEsZUFBQTtPQURGOztJQUdBLElBQUcsQ0FBSSxNQUFNLENBQUMsbUJBQVAsQ0FBQSxDQUFKLElBQW9DLFNBQXZDO01BQ0UsTUFBQSxHQUFTLFNBQUMsTUFBRDtlQUFZLE1BQU0sQ0FBQyxRQUFQLENBQUE7TUFBWjthQUNULFVBQUEsQ0FBVyxNQUFYLEVBQW1CLE9BQW5CLEVBQTRCLE1BQTVCLEVBRkY7O0VBTmU7O0VBVWpCLGVBQUEsR0FBa0IsU0FBQyxNQUFELEVBQVMsT0FBVDtBQUNoQixRQUFBOztNQUR5QixVQUFROztJQUNoQyxZQUFhO0lBQ2QsT0FBTyxPQUFPLENBQUM7SUFDZixJQUFHLENBQUksTUFBTSxDQUFDLGFBQVAsQ0FBQSxDQUFKLElBQThCLFNBQWpDO01BQ0UsTUFBQSxHQUFTLFNBQUMsTUFBRDtlQUFZLE1BQU0sQ0FBQyxTQUFQLENBQUE7TUFBWjthQUNULFVBQUEsQ0FBVyxNQUFYLEVBQW1CLE9BQW5CLEVBQTRCLE1BQTVCLEVBRkY7O0VBSGdCOztFQU9sQixrQkFBQSxHQUFxQixTQUFDLE1BQUQsRUFBUyxPQUFUO0FBQ25CLFFBQUE7O01BRDRCLFVBQVE7O0lBQ3BDLElBQU8sTUFBTSxDQUFDLFlBQVAsQ0FBQSxDQUFBLEtBQXlCLENBQWhDO01BQ0UsTUFBQSxHQUFTLFNBQUMsTUFBRDtlQUFZLE1BQU0sQ0FBQyxNQUFQLENBQUE7TUFBWjthQUNULFVBQUEsQ0FBVyxNQUFYLEVBQW1CLE9BQW5CLEVBQTRCLE1BQTVCLEVBRkY7O0VBRG1COztFQUtyQixvQkFBQSxHQUF1QixTQUFDLE1BQUQsRUFBUyxPQUFUO0FBQ3JCLFFBQUE7O01BRDhCLFVBQVE7O0lBQ3RDLElBQU8sbUJBQUEsQ0FBb0IsTUFBTSxDQUFDLE1BQTNCLENBQUEsS0FBc0MsTUFBTSxDQUFDLFlBQVAsQ0FBQSxDQUE3QztNQUNFLE1BQUEsR0FBUyxTQUFDLE1BQUQ7ZUFBWSxNQUFNLENBQUMsUUFBUCxDQUFBO01BQVo7YUFDVCxVQUFBLENBQVcsTUFBWCxFQUFtQixPQUFuQixFQUE0QixNQUE1QixFQUZGOztFQURxQjs7RUFLdkIsK0JBQUEsR0FBa0MsU0FBQyxNQUFELEVBQVMsR0FBVDtJQUNoQyxNQUFNLENBQUMsaUJBQVAsQ0FBeUIsQ0FBQyxHQUFELEVBQU0sQ0FBTixDQUF6QjtXQUNBLE1BQU0sQ0FBQywwQkFBUCxDQUFBO0VBRmdDOztFQUlsQyxvQkFBQSxHQUF1QixTQUFDLE1BQUQsRUFBUyxHQUFUO1dBQWlCLFdBQUEsQ0FBWSxHQUFaLEVBQWlCO01BQUEsR0FBQSxFQUFLLENBQUw7TUFBUSxHQUFBLEVBQUssbUJBQUEsQ0FBb0IsTUFBcEIsQ0FBYjtLQUFqQjtFQUFqQjs7RUFFdkIsb0JBQUEsR0FBdUIsU0FBQyxNQUFELEVBQVMsR0FBVDtXQUFpQixXQUFBLENBQVksR0FBWixFQUFpQjtNQUFBLEdBQUEsRUFBSyxDQUFMO01BQVEsR0FBQSxFQUFLLG1CQUFBLENBQW9CLE1BQXBCLENBQWI7S0FBakI7RUFBakI7O0VBR3ZCLDJCQUFBLEdBQThCLFNBQUMsTUFBRCxFQUFTLEdBQVQsRUFBd0IsSUFBeEI7QUFDNUIsUUFBQTtJQURzQyxlQUFLO0lBQVUsNEJBQUQsT0FBWTtJQUNoRSx3QkFBRyxZQUFZLElBQWY7YUFDRSxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsR0FBNUIsQ0FBaUMsa0JBRG5DO0tBQUEsTUFBQTthQUdFLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixHQUE1QixDQUFpQyw4QkFIbkM7O0VBRDRCOztFQU05QiwwQkFBQSxHQUE2QixTQUFDLE1BQUQsRUFBUyxHQUFUO1dBQzNCLE1BQU0sQ0FBQyxrQkFBUCxDQUEwQixNQUFNLENBQUMsb0JBQVAsQ0FBNEIsR0FBNUIsQ0FBMUI7RUFEMkI7O0VBRzdCLG9CQUFBLEdBQXVCLFNBQUMsTUFBRDtBQUNyQixRQUFBO1dBQUE7Ozs7a0JBQ0UsQ0FBQyxHQURILENBQ08sU0FBQyxHQUFEO2FBQ0gsTUFBTSxDQUFDLFlBQVksQ0FBQyw4QkFBcEIsQ0FBbUQsR0FBbkQ7SUFERyxDQURQLENBR0UsQ0FBQyxNQUhILENBR1UsU0FBQyxRQUFEO2FBQ04sa0JBQUEsSUFBYyxxQkFBZCxJQUErQjtJQUR6QixDQUhWO0VBRHFCOztFQVF2QixtQ0FBQSxHQUFzQyxTQUFDLE1BQUQsRUFBUyxTQUFULEVBQW9CLEdBQXBCO0FBQ3BDLFFBQUE7SUFEeUQsaUNBQUQsTUFBa0I7O01BQzFFLGtCQUFtQjs7V0FDbkIsb0JBQUEsQ0FBcUIsTUFBckIsQ0FBNEIsQ0FBQyxNQUE3QixDQUFvQyxTQUFDLElBQUQ7QUFDbEMsVUFBQTtNQURvQyxvQkFBVTtNQUM5QyxJQUFHLGVBQUg7ZUFDRSxDQUFBLFFBQUEsSUFBWSxTQUFaLElBQVksU0FBWixJQUF5QixNQUF6QixFQURGO09BQUEsTUFBQTtlQUdFLENBQUEsUUFBQSxHQUFXLFNBQVgsSUFBVyxTQUFYLElBQXdCLE1BQXhCLEVBSEY7O0lBRGtDLENBQXBDO0VBRm9DOztFQVF0QyxnQkFBQSxHQUFtQixTQUFDLE1BQUQ7QUFDakIsUUFBQTtJQUFBLElBQUEsR0FBTztXQUNQOzs7O2tCQUNFLENBQUMsR0FESCxDQUNPLFNBQUMsR0FBRDthQUNILE1BQU0sQ0FBQyxZQUFZLENBQUMsOEJBQXBCLENBQW1ELEdBQW5EO0lBREcsQ0FEUCxDQUdFLENBQUMsTUFISCxDQUdVLFNBQUMsUUFBRDthQUNOLGtCQUFBLElBQWMscUJBQWQsSUFBK0I7SUFEekIsQ0FIVixDQUtFLENBQUMsTUFMSCxDQUtVLFNBQUMsUUFBRDtNQUNOLElBQUcsSUFBSyxDQUFBLFFBQUEsQ0FBUjtlQUNFLE1BREY7T0FBQSxNQUFBO2VBR0UsSUFBSyxDQUFBLFFBQUEsQ0FBTCxHQUFpQixLQUhuQjs7SUFETSxDQUxWO0VBRmlCOztFQWFuQix1QkFBQSxHQUEwQixTQUFDLE1BQUQ7V0FDeEIsZ0JBQUEsQ0FBaUIsTUFBakIsQ0FDRSxDQUFDLEdBREgsQ0FDTyxTQUFDLEdBQUQ7QUFDSCxVQUFBO01BREssbUJBQVU7TUFDZixNQUFBLEdBQVMsTUFBTSxDQUFDLHVCQUFQLENBQStCLFFBQS9CO2FBQ1Q7UUFBQyxVQUFBLFFBQUQ7UUFBVyxRQUFBLE1BQVg7UUFBbUIsUUFBQSxNQUFuQjs7SUFGRyxDQURQO0VBRHdCOztFQU0xQixpQkFBQSxHQUFvQixTQUFDLE1BQUQ7QUFDbEIsUUFBQTtJQUFBLGNBQUEsR0FBaUI7SUFFakIsY0FBQSxHQUFpQixTQUFDLElBQUQsRUFBTyxrQkFBUDtBQUNmLFVBQUE7TUFBQSxRQUFBLEdBQVcsZ0NBQUMsY0FBZSxDQUFBLElBQUEsSUFBZixjQUFlLENBQUEsSUFBQSxJQUFTLEVBQXpCOztRQUNYLFFBQVEsQ0FBQyxzQkFBdUI7O01BQ2hDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxJQUE3QixDQUFrQyxrQkFBbEM7TUFDQSxNQUFBLEdBQVMsa0JBQWtCLENBQUM7TUFDNUIsUUFBUSxDQUFDLFNBQVQsR0FBcUIsSUFBSSxDQUFDLEdBQUwsOENBQThCLE1BQTlCLEVBQXNDLE1BQXRDO2FBQ3JCLFFBQVEsQ0FBQyxTQUFULEdBQXFCLElBQUksQ0FBQyxHQUFMLDhDQUE4QixNQUE5QixFQUFzQyxNQUF0QztJQU5OO0FBUWpCO0FBQUEsU0FBQSxzQ0FBQTs7TUFDRSxjQUFBLENBQWUsU0FBZixFQUEwQixrQkFBMUI7TUFDQSxJQUFHLE1BQU0sQ0FBQyxtQkFBUCxDQUEyQixrQkFBa0IsQ0FBQyxRQUE5QyxDQUFIO1FBQ0UsY0FBQSxDQUFlLFFBQWYsRUFBeUIsa0JBQXpCLEVBREY7T0FBQSxNQUFBO1FBR0UsY0FBQSxDQUFlLFVBQWYsRUFBMkIsa0JBQTNCLEVBSEY7O0FBRkY7V0FNQTtFQWpCa0I7O0VBbUJwQix5QkFBQSxHQUE0QixTQUFDLE1BQUQsRUFBUyxRQUFUO0FBQzFCLFFBQUE7SUFBQSxPQUF5QixRQUFRLENBQUMsR0FBVCxDQUFhLFNBQUMsR0FBRDthQUNwQyxNQUFNLENBQUMsdUJBQVAsQ0FBK0IsR0FBL0IsRUFBb0M7UUFBQSxjQUFBLEVBQWdCLElBQWhCO09BQXBDO0lBRG9DLENBQWIsQ0FBekIsRUFBQyxvQkFBRCxFQUFhO1dBRWIsVUFBVSxDQUFDLEtBQVgsQ0FBaUIsUUFBakI7RUFIMEI7O0VBSzVCLHNCQUFBLEdBQXlCLFNBQUMsTUFBRCxFQUFTLEdBQVQ7V0FDdkIsTUFBTSxDQUFDLGVBQWUsQ0FBQyxtQkFBdkIsQ0FBMkMsR0FBM0M7RUFEdUI7O0VBR3pCLHlCQUFBLEdBQTRCLFNBQUMsSUFBRDtBQUMxQixRQUFBO0FBQUE7QUFBQTtTQUFBLHNDQUFBOztVQUEwQixHQUFBLEdBQU0sQ0FBTixJQUFZLENBQUMsR0FBQSxHQUFNLENBQU4sS0FBVyxDQUFDLENBQWI7c0JBQ3BDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBZCxDQUF5QixHQUF6Qjs7QUFERjs7RUFEMEI7O0VBSTVCLGlCQUFBLEdBQW9CLFNBQUMsTUFBRCxFQUFTLFNBQVQsRUFBb0IsU0FBcEIsRUFBK0IsRUFBL0I7QUFDbEIsUUFBQTtJQUFBLFNBQUEsR0FBWSxLQUFLLENBQUMsVUFBTixDQUFpQixTQUFqQjtJQUNaLFFBQUE7O0FBQVcsY0FBTyxTQUFQO0FBQUEsYUFDSixTQURJO2lCQUNXOzs7OztBQURYLGFBRUosVUFGSTtpQkFFWTs7Ozs7QUFGWjs7SUFJWCxZQUFBLEdBQWU7SUFDZixJQUFBLEdBQU8sU0FBQTthQUNMLFlBQUEsR0FBZTtJQURWO0lBR1AsWUFBQTtBQUFlLGNBQU8sU0FBUDtBQUFBLGFBQ1IsU0FEUTtpQkFDTyxTQUFDLEdBQUQ7QUFBZ0IsZ0JBQUE7WUFBZCxXQUFEO21CQUFlLFFBQVEsQ0FBQyxhQUFULENBQXVCLFNBQXZCO1VBQWhCO0FBRFAsYUFFUixVQUZRO2lCQUVRLFNBQUMsR0FBRDtBQUFnQixnQkFBQTtZQUFkLFdBQUQ7bUJBQWUsUUFBUSxDQUFDLFVBQVQsQ0FBb0IsU0FBcEI7VUFBaEI7QUFGUjs7QUFJZixTQUFBLDBDQUFBOztZQUF5QixhQUFBLEdBQWdCLHNCQUFBLENBQXVCLE1BQXZCLEVBQStCLEdBQS9COzs7TUFDdkMsTUFBQSxHQUFTO01BQ1QsT0FBQSxHQUFVO01BRVYsYUFBQSxHQUFnQixhQUFhLENBQUMsZ0JBQWQsQ0FBQTtBQUNoQjtBQUFBLFdBQUEsd0NBQUE7O1FBQ0UsYUFBYSxDQUFDLElBQWQsQ0FBQTtRQUNBLElBQUcsR0FBQSxHQUFNLENBQVQ7VUFDRSxLQUFBLEdBQVEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFkLENBQXlCLEdBQXpCO1VBQ1IsSUFBRyxDQUFDLEdBQUEsR0FBTSxDQUFQLENBQUEsS0FBYSxDQUFoQjtZQUNFLEtBREY7V0FBQSxNQUFBO1lBR0UsUUFBQSxHQUFlLElBQUEsS0FBQSxDQUFNLEdBQU4sRUFBVyxNQUFYO1lBQ2YsT0FBTyxDQUFDLElBQVIsQ0FBYTtjQUFDLE9BQUEsS0FBRDtjQUFRLFVBQUEsUUFBUjtjQUFrQixNQUFBLElBQWxCO2FBQWIsRUFKRjtXQUZGO1NBQUEsTUFBQTtVQVFFLE1BQUEsSUFBVSxJQVJaOztBQUZGO01BWUEsT0FBQSxHQUFVLE9BQU8sQ0FBQyxNQUFSLENBQWUsWUFBZjtNQUNWLElBQXFCLFNBQUEsS0FBYSxVQUFsQztRQUFBLE9BQU8sQ0FBQyxPQUFSLENBQUEsRUFBQTs7QUFDQSxXQUFBLDJDQUFBOztRQUNFLEVBQUEsQ0FBRyxNQUFIO1FBQ0EsSUFBQSxDQUFjLFlBQWQ7QUFBQSxpQkFBQTs7QUFGRjtNQUdBLElBQUEsQ0FBYyxZQUFkO0FBQUEsZUFBQTs7QUF0QkY7RUFka0I7O0VBc0NwQixnQ0FBQSxHQUFtQyxTQUFDLE1BQUQsRUFBUyxTQUFULEVBQW9CLFNBQXBCLEVBQStCLEtBQS9CO0FBQ2pDLFFBQUE7SUFBQSxLQUFBLEdBQVE7SUFDUixpQkFBQSxDQUFrQixNQUFsQixFQUEwQixTQUExQixFQUFxQyxTQUFyQyxFQUFnRCxTQUFDLElBQUQ7TUFDOUMsSUFBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQVgsQ0FBa0IsS0FBbEIsQ0FBQSxJQUE0QixDQUEvQjtRQUNFLElBQUksQ0FBQyxJQUFMLENBQUE7ZUFDQSxLQUFBLEdBQVEsSUFBSSxDQUFDLFNBRmY7O0lBRDhDLENBQWhEO1dBSUE7RUFOaUM7O0VBUW5DLDRCQUFBLEdBQStCLFNBQUMsTUFBRCxFQUFTLEdBQVQ7QUFLN0IsUUFBQTtJQUFBLElBQUcsYUFBQSxHQUFnQixzQkFBQSxDQUF1QixNQUF2QixFQUErQixHQUEvQixDQUFuQjthQUNFLHlCQUFBLENBQTBCLGFBQTFCLENBQXdDLENBQUMsSUFBekMsQ0FBOEMsU0FBQyxLQUFEO2VBQzVDLGVBQUEsQ0FBZ0IsTUFBaEIsRUFBd0IsS0FBeEI7TUFENEMsQ0FBOUMsRUFERjtLQUFBLE1BQUE7YUFJRSxNQUpGOztFQUw2Qjs7RUFZL0IsZUFBQSxHQUFrQixTQUFDLE1BQUQsRUFBUyxLQUFUO0FBQ2hCLFFBQUE7QUFBQSxZQUFPLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FBbUIsQ0FBQyxTQUEzQjtBQUFBLFdBQ08sV0FEUDtBQUFBLFdBQ29CLGVBRHBCO1FBRUksTUFBQSxHQUFTLENBQUMsc0JBQUQ7QUFETztBQURwQixXQUdPLGFBSFA7UUFJSSxNQUFBLEdBQVMsQ0FBQyxnQkFBRCxFQUFtQixhQUFuQixFQUFrQyxjQUFsQztBQUROO0FBSFA7UUFNSSxNQUFBLEdBQVMsQ0FBQyxnQkFBRCxFQUFtQixhQUFuQjtBQU5iO0lBT0EsT0FBQSxHQUFjLElBQUEsTUFBQSxDQUFPLEdBQUEsR0FBTSxNQUFNLENBQUMsR0FBUCxDQUFXLENBQUMsQ0FBQyxZQUFiLENBQTBCLENBQUMsSUFBM0IsQ0FBZ0MsR0FBaEMsQ0FBYjtXQUNkLE9BQU8sQ0FBQyxJQUFSLENBQWEsS0FBYjtFQVRnQjs7RUFhbEIsMkJBQUEsR0FBOEIsU0FBQyxNQUFELEVBQVMsS0FBVDtBQUM1QixRQUFBO0lBQUEsYUFBQSxHQUFnQixNQUFNLENBQUM7SUFDdkIsZ0JBQUEsR0FBbUIsTUFBTSxDQUFDLHFCQUFQLENBQUEsQ0FBQSxHQUFpQyxDQUFDLE1BQU0sQ0FBQyxjQUFQLENBQUEsQ0FBQSxHQUEwQixDQUEzQjtJQUNwRCxTQUFBLEdBQVksYUFBYSxDQUFDLFlBQWQsQ0FBQSxDQUFBLEdBQStCO0lBQzNDLFdBQUEsR0FBYyxhQUFhLENBQUMsZUFBZCxDQUFBLENBQUEsR0FBa0M7SUFDaEQsTUFBQSxHQUFTLGFBQWEsQ0FBQyw4QkFBZCxDQUE2QyxLQUE3QyxDQUFtRCxDQUFDO0lBRTdELE1BQUEsR0FBUyxDQUFDLFdBQUEsR0FBYyxNQUFmLENBQUEsSUFBMEIsQ0FBQyxNQUFBLEdBQVMsU0FBVjtXQUNuQyxNQUFNLENBQUMsc0JBQVAsQ0FBOEIsS0FBOUIsRUFBcUM7TUFBQyxRQUFBLE1BQUQ7S0FBckM7RUFSNEI7O0VBVTlCLFdBQUEsR0FBYyxTQUFDLGFBQUQsRUFBZ0IsTUFBaEI7QUFDWixRQUFBO0lBQUEsT0FBQSxHQUFVLE1BQU0sQ0FBQyxHQUFQLENBQVcsU0FBQyxLQUFEO2FBQVcsS0FBSyxDQUFDLEtBQU4sQ0FBWSxHQUFaO0lBQVgsQ0FBWDtBQUVWLFNBQUEseUNBQUE7O01BQ0UsYUFBQSxHQUFnQjtBQUNoQixXQUFBLDhDQUFBOztRQUNFLElBQXNCLGFBQWEsQ0FBQyxTQUFTLENBQUMsUUFBeEIsQ0FBaUMsU0FBakMsQ0FBdEI7VUFBQSxhQUFBLElBQWlCLEVBQWpCOztBQURGO01BRUEsSUFBZSxhQUFBLEtBQWlCLFVBQVUsQ0FBQyxNQUEzQztBQUFBLGVBQU8sS0FBUDs7QUFKRjtXQUtBO0VBUlk7O0VBVWQsZ0JBQUEsR0FBbUIsU0FBQyxJQUFEO1dBQ2pCLElBQUksQ0FBQyxLQUFMLENBQVcsU0FBWCxDQUFxQixDQUFDLE1BQXRCLEtBQWdDO0VBRGY7O0VBZW5CLHlDQUFBLEdBQTRDLFNBQUMsTUFBRCxFQUFTLEtBQVQsRUFBZ0IsT0FBaEI7QUFDMUMsUUFBQTs7TUFEMEQsVUFBUTs7SUFDakUsNkNBQUQsRUFBb0IsNkJBQXBCLEVBQStCLDZDQUEvQixFQUFrRDtJQUNsRCxJQUFPLG1CQUFKLElBQXNCLDJCQUF6Qjs7UUFDRSxTQUFVLE1BQU0sQ0FBQyxhQUFQLENBQUE7O01BQ1YsT0FBaUMsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxPQUFULEVBQWtCLHdCQUFBLENBQXlCLE1BQXpCLEVBQWlDLE9BQWpDLENBQWxCLENBQWpDLEVBQUMsMEJBQUQsRUFBWSwyQ0FGZDs7O01BR0Esb0JBQXFCOztJQUVyQixnQkFBQSxHQUFtQixrQ0FBQSxDQUFtQyxNQUFuQyxFQUEyQyxLQUEzQztJQUNuQixZQUFBLEdBQW1CLElBQUEsTUFBQSxDQUFPLEdBQUEsR0FBRyxDQUFDLENBQUMsQ0FBQyxZQUFGLENBQWUsaUJBQWYsQ0FBRCxDQUFILEdBQXNDLElBQTdDO0lBRW5CLElBQUcsSUFBSSxDQUFDLElBQUwsQ0FBVSxnQkFBVixDQUFIO01BQ0UsTUFBQSxHQUFTO01BQ1QsSUFBQSxHQUFPO01BQ1AsU0FBQSxHQUFnQixJQUFBLE1BQUEsQ0FBTyxNQUFQLEVBSGxCO0tBQUEsTUFJSyxJQUFHLFlBQVksQ0FBQyxJQUFiLENBQWtCLGdCQUFsQixDQUFBLElBQXdDLENBQUksU0FBUyxDQUFDLElBQVYsQ0FBZSxnQkFBZixDQUEvQztNQUNILElBQUEsR0FBTztNQUNQLElBQUcsaUJBQUg7UUFDRSxNQUFBLEdBQVMsQ0FBQyxDQUFDLFlBQUYsQ0FBZSxnQkFBZjtRQUNULFNBQUEsR0FBZ0IsSUFBQSxNQUFBLENBQU8sTUFBUCxFQUZsQjtPQUFBLE1BQUE7UUFJRSxTQUFBLEdBQVksYUFKZDtPQUZHO0tBQUEsTUFBQTtNQVFILElBQUEsR0FBTyxPQVJKOztJQVVMLEtBQUEsR0FBUSxrQ0FBQSxDQUFtQyxNQUFuQyxFQUEyQyxLQUEzQyxFQUFrRDtNQUFDLFdBQUEsU0FBRDtLQUFsRDtXQUNSO01BQUMsTUFBQSxJQUFEO01BQU8sT0FBQSxLQUFQOztFQXpCMEM7O0VBMkI1Qyw4QkFBQSxHQUFpQyxTQUFDLE1BQUQsRUFBUyxLQUFULEVBQWdCLE9BQWhCO0FBQy9CLFFBQUE7O01BRCtDLFVBQVE7O0lBQ3ZELGlCQUFBLHVEQUFnRDtJQUNoRCxPQUFPLE9BQU8sQ0FBQztJQUNmLE9BQWdCLHlDQUFBLENBQTBDLE1BQTFDLEVBQWtELEtBQWxELEVBQXlELE9BQXpELENBQWhCLEVBQUMsa0JBQUQsRUFBUTtJQUNSLElBQUEsR0FBTyxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsS0FBNUI7SUFDUCxPQUFBLEdBQVUsQ0FBQyxDQUFDLFlBQUYsQ0FBZSxJQUFmO0lBRVYsSUFBRyxJQUFBLEtBQVEsTUFBUixJQUFtQixpQkFBdEI7TUFFRSxhQUFBLEdBQW1CLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWCxDQUFILEdBQXlCLEtBQXpCLEdBQW9DO01BQ3BELFdBQUEsR0FBaUIsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYLENBQUgsR0FBeUIsS0FBekIsR0FBb0M7TUFDbEQsT0FBQSxHQUFVLGFBQUEsR0FBZ0IsT0FBaEIsR0FBMEIsWUFKdEM7O1dBS0ksSUFBQSxNQUFBLENBQU8sT0FBUCxFQUFnQixHQUFoQjtFQVoyQjs7RUFjakMsaUNBQUEsR0FBb0MsU0FBQyxNQUFELEVBQVMsS0FBVCxFQUFnQixPQUFoQjs7TUFBZ0IsVUFBUTs7SUFDMUQsT0FBQSxHQUFVO01BQUMsU0FBQSxFQUFXLE1BQU0sQ0FBQyxhQUFQLENBQUEsQ0FBc0IsQ0FBQyxhQUF2QixDQUFBLENBQVo7TUFBb0QsaUJBQUEsRUFBbUIsS0FBdkU7O1dBQ1YsOEJBQUEsQ0FBK0IsTUFBL0IsRUFBdUMsS0FBdkMsRUFBOEMsT0FBOUM7RUFGa0M7O0VBS3BDLHdCQUFBLEdBQTJCLFNBQUMsTUFBRCxFQUFTLEdBQVQ7QUFDekIsUUFBQTtJQURtQyxZQUFEO0lBQ2xDLGlCQUFBLEdBQW9CLDZCQUFBLENBQThCLE1BQTlCOztNQUNwQixZQUFpQixJQUFBLE1BQUEsQ0FBTyxnQkFBQSxHQUFnQixDQUFDLENBQUMsQ0FBQyxZQUFGLENBQWUsaUJBQWYsQ0FBRCxDQUFoQixHQUFtRCxJQUExRDs7V0FDakI7TUFBQyxXQUFBLFNBQUQ7TUFBWSxtQkFBQSxpQkFBWjs7RUFIeUI7O0VBSzNCLGdDQUFBLEdBQW1DLFNBQUMsTUFBRCxFQUFTLEtBQVQsRUFBZ0IsR0FBaEI7QUFDakMsUUFBQTtJQURrRCwyQkFBRCxNQUFZO0lBQzdELFNBQUEsR0FBWSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQVAsRUFBWSxDQUFaLENBQUQsRUFBaUIsS0FBakI7SUFFWixLQUFBLEdBQVE7SUFDUixNQUFNLENBQUMsMEJBQVAsQ0FBa0MsU0FBbEMsRUFBNkMsU0FBN0MsRUFBd0QsU0FBQyxJQUFEO0FBQ3RELFVBQUE7TUFEd0Qsb0JBQU8sNEJBQVc7TUFDMUUsSUFBVSxTQUFBLEtBQWEsRUFBYixJQUFvQixLQUFLLENBQUMsS0FBSyxDQUFDLE1BQVosS0FBd0IsQ0FBdEQ7QUFBQSxlQUFBOztNQUVBLElBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFaLENBQXVCLEtBQXZCLENBQUg7UUFDRSxJQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsb0JBQVYsQ0FBK0IsS0FBL0IsQ0FBSDtVQUNFLEtBQUEsR0FBUSxLQUFLLENBQUMsTUFEaEI7O2VBRUEsSUFBQSxDQUFBLEVBSEY7O0lBSHNELENBQXhEOzJCQVFBLFFBQVE7RUFaeUI7O0VBY25DLDBCQUFBLEdBQTZCLFNBQUMsTUFBRCxFQUFTLEtBQVQsRUFBZ0IsR0FBaEI7QUFDM0IsUUFBQTtJQUQ0QywyQkFBRCxNQUFZO0lBQ3ZELFNBQUEsR0FBWSxDQUFDLEtBQUQsRUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFQLEVBQVksS0FBWixDQUFSO0lBRVosS0FBQSxHQUFRO0lBQ1IsTUFBTSxDQUFDLGlCQUFQLENBQXlCLFNBQXpCLEVBQW9DLFNBQXBDLEVBQStDLFNBQUMsSUFBRDtBQUM3QyxVQUFBO01BRCtDLG9CQUFPLDRCQUFXO01BQ2pFLElBQVUsU0FBQSxLQUFhLEVBQWIsSUFBb0IsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFaLEtBQXdCLENBQXREO0FBQUEsZUFBQTs7TUFFQSxJQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsYUFBVixDQUF3QixLQUF4QixDQUFIO1FBQ0UsSUFBRyxLQUFLLENBQUMsS0FBSyxDQUFDLGlCQUFaLENBQThCLEtBQTlCLENBQUg7VUFDRSxLQUFBLEdBQVEsS0FBSyxDQUFDLElBRGhCOztlQUVBLElBQUEsQ0FBQSxFQUhGOztJQUg2QyxDQUEvQzsyQkFRQSxRQUFRO0VBWm1COztFQWM3QixrQ0FBQSxHQUFxQyxTQUFDLE1BQUQsRUFBUyxRQUFULEVBQW1CLE9BQW5CO0FBQ25DLFFBQUE7O01BRHNELFVBQVE7O0lBQzlELFdBQUEsR0FBYywwQkFBQSxDQUEyQixNQUEzQixFQUFtQyxRQUFuQyxFQUE2QyxPQUE3QztJQUNkLGFBQUEsR0FBZ0IsZ0NBQUEsQ0FBaUMsTUFBakMsRUFBeUMsV0FBekMsRUFBc0QsT0FBdEQ7V0FDWixJQUFBLEtBQUEsQ0FBTSxhQUFOLEVBQXFCLFdBQXJCO0VBSCtCOztFQU9yQyw2QkFBQSxHQUFnQyxTQUFDLEtBQUQ7QUFDOUIsUUFBQTtJQUFDLG1CQUFELEVBQVE7SUFDUixJQUFHLEdBQUcsQ0FBQyxNQUFKLEtBQWMsQ0FBakI7TUFDRSxNQUFBLEdBQVMsV0FBQSxDQUFZLEdBQUcsQ0FBQyxHQUFKLEdBQVUsQ0FBdEIsRUFBeUI7UUFBQSxHQUFBLEVBQUssS0FBSyxDQUFDLEdBQVg7T0FBekI7YUFDTCxJQUFBLEtBQUEsQ0FBTSxLQUFOLEVBQWEsQ0FBQyxNQUFELEVBQVMsS0FBVCxDQUFiLEVBRk47S0FBQSxNQUFBO2FBSUUsTUFKRjs7RUFGOEI7O0VBUWhDLFVBQUEsR0FBYSxTQUFDLE1BQUQsRUFBUyxPQUFUO0FBQ1gsUUFBQTtJQUFBLE1BQUEsR0FBUztJQUNULE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBWixFQUFxQixTQUFDLEdBQUQ7QUFDbkIsVUFBQTtNQURxQixRQUFEO2FBQ3BCLE1BQU0sQ0FBQyxJQUFQLENBQVksS0FBWjtJQURtQixDQUFyQjtXQUVBO0VBSlc7O0VBTWIsdUJBQUEsR0FBMEIsU0FBQyxNQUFELEVBQVMsR0FBVCxFQUFjLE9BQWQ7QUFDeEIsUUFBQTtJQUFBLE1BQUEsR0FBUztJQUNULFNBQUEsR0FBWSxNQUFNLENBQUMsdUJBQVAsQ0FBK0IsR0FBL0I7SUFDWixNQUFNLENBQUMsaUJBQVAsQ0FBeUIsT0FBekIsRUFBa0MsU0FBbEMsRUFBNkMsU0FBQyxHQUFEO0FBQzNDLFVBQUE7TUFENkMsUUFBRDthQUM1QyxNQUFNLENBQUMsSUFBUCxDQUFZLEtBQVo7SUFEMkMsQ0FBN0M7V0FFQTtFQUx3Qjs7RUFPMUIsb0JBQUEsR0FBdUIsU0FBQyxNQUFELEVBQVMsT0FBVCxFQUFrQixHQUFsQixFQUF1QixHQUF2QjtBQUNyQixRQUFBO0lBRDZDLDJCQUFELE1BQVk7SUFDeEQsSUFBRyxTQUFBLEtBQWEsVUFBaEI7TUFDRSxnQkFBQSxHQUFtQiw2QkFEckI7S0FBQSxNQUFBO01BR0UsZ0JBQUEsR0FBbUIsb0JBSHJCOztJQUtBLEtBQUEsR0FBUTtJQUNSLFNBQUEsR0FBWSxNQUFNLENBQUMsdUJBQVAsQ0FBK0IsR0FBL0I7SUFDWixNQUFPLENBQUEsZ0JBQUEsQ0FBUCxDQUF5QixPQUF6QixFQUFrQyxTQUFsQyxFQUE2QyxTQUFDLEtBQUQ7YUFBVyxLQUFBLEdBQVEsS0FBSyxDQUFDO0lBQXpCLENBQTdDO1dBQ0E7RUFUcUI7O0VBV3ZCLG9DQUFBLEdBQXVDLFNBQUMsTUFBRCxFQUFTLEdBQVQ7QUFDckMsUUFBQTtJQUFBLE9BQUEsR0FBVSxNQUFNLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLFdBQXJDLENBQWlEO01BQUEsYUFBQSxFQUFlLEdBQWY7S0FBakQ7SUFFVixVQUFBLEdBQWE7SUFDYixRQUFBLEdBQVc7QUFFWDtBQUFBLFNBQUEsc0NBQUE7O01BQ0UsT0FBZSxNQUFNLENBQUMsUUFBUCxDQUFBLENBQWYsRUFBQyxrQkFBRCxFQUFRO01BQ1IsSUFBQSxDQUFPLFVBQVA7UUFDRSxVQUFBLEdBQWE7UUFDYixRQUFBLEdBQVc7QUFDWCxpQkFIRjs7TUFLQSxJQUFHLEtBQUssQ0FBQyxVQUFOLENBQWlCLFVBQWpCLENBQUg7UUFDRSxVQUFBLEdBQWE7UUFDYixRQUFBLEdBQVcsSUFGYjs7QUFQRjtJQVdBLElBQUcsb0JBQUEsSUFBZ0Isa0JBQW5CO2FBQ00sSUFBQSxLQUFBLENBQU0sVUFBTixFQUFrQixRQUFsQixFQUROOztFQWpCcUM7O0VBcUJ2QyxxQkFBQSxHQUF3QixTQUFDLE1BQUQsRUFBUyxLQUFULEVBQWdCLFNBQWhCO0FBQ3RCLFFBQUE7SUFBQSxLQUFBLEdBQVEsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsS0FBakI7SUFFUixRQUFBLEdBQVc7QUFDWCxZQUFPLFNBQVA7QUFBQSxXQUNPLFNBRFA7UUFFSSxLQUFBLEdBQVEsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsQ0FBQyxDQUFELEVBQUksQ0FBQyxDQUFMLENBQWhCO1FBQ1IsR0FBQSxHQUFNLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixLQUFLLENBQUMsR0FBckMsQ0FBeUMsQ0FBQztRQUVoRCxJQUFHLEtBQUssQ0FBQyxPQUFOLENBQWMsR0FBZCxDQUFIO1VBQ0UsUUFBQSxHQUFXLEtBRGI7U0FBQSxNQUVLLElBQUcsS0FBSyxDQUFDLGFBQU4sQ0FBb0IsR0FBcEIsQ0FBSDtVQUNILFFBQUEsR0FBVztVQUNYLEtBQUEsR0FBWSxJQUFBLEtBQUEsQ0FBTSxLQUFLLENBQUMsR0FBTixHQUFZLENBQWxCLEVBQXFCLENBQXJCLEVBRlQ7O1FBSUwsS0FBQSxHQUFRLEtBQUssQ0FBQyxHQUFOLENBQVUsS0FBVixFQUFpQixNQUFNLENBQUMsb0JBQVAsQ0FBQSxDQUFqQjtBQVZMO0FBRFAsV0FhTyxVQWJQO1FBY0ksS0FBQSxHQUFRLEtBQUssQ0FBQyxTQUFOLENBQWdCLENBQUMsQ0FBRCxFQUFJLENBQUMsQ0FBTCxDQUFoQjtRQUVSLElBQUcsS0FBSyxDQUFDLE1BQU4sR0FBZSxDQUFsQjtVQUNFLFFBQUEsR0FBVztVQUNYLE1BQUEsR0FBUyxLQUFLLENBQUMsR0FBTixHQUFZO1VBQ3JCLEdBQUEsR0FBTSxNQUFNLENBQUMsdUJBQVAsQ0FBK0IsTUFBL0IsQ0FBc0MsQ0FBQztVQUM3QyxLQUFBLEdBQVksSUFBQSxLQUFBLENBQU0sTUFBTixFQUFjLEdBQUcsQ0FBQyxNQUFsQixFQUpkOztRQU1BLEtBQUEsR0FBUSxLQUFLLENBQUMsR0FBTixDQUFVLEtBQVYsRUFBaUIsS0FBSyxDQUFDLElBQXZCO0FBdEJaO0lBd0JBLElBQUcsUUFBSDthQUNFLE1BREY7S0FBQSxNQUFBO01BR0UsV0FBQSxHQUFjLE1BQU0sQ0FBQywrQkFBUCxDQUF1QyxLQUF2QyxFQUE4QztRQUFBLGFBQUEsRUFBZSxTQUFmO09BQTlDO2FBQ2QsTUFBTSxDQUFDLCtCQUFQLENBQXVDLFdBQXZDLEVBSkY7O0VBNUJzQjs7RUFrQ3hCLCtCQUFBLEdBQWtDLFNBQUMsTUFBRCxFQUFTLEtBQVQsRUFBZ0IsS0FBaEIsRUFBdUIsU0FBdkI7QUFDaEMsUUFBQTtJQUFBLFFBQUEsR0FBVyxxQkFBQSxDQUFzQixNQUF0QixFQUE4QixLQUFNLENBQUEsS0FBQSxDQUFwQyxFQUE0QyxTQUE1QztBQUNYLFlBQU8sS0FBUDtBQUFBLFdBQ08sT0FEUDtlQUVRLElBQUEsS0FBQSxDQUFNLFFBQU4sRUFBZ0IsS0FBSyxDQUFDLEdBQXRCO0FBRlIsV0FHTyxLQUhQO2VBSVEsSUFBQSxLQUFBLENBQU0sS0FBSyxDQUFDLEtBQVosRUFBbUIsUUFBbkI7QUFKUjtFQUZnQzs7RUFRbEMsVUFBQSxHQUFhLFNBQUMsSUFBRCxFQUFPLEVBQVA7V0FDUCxJQUFBLE9BQUEsQ0FBUSxTQUFDLE9BQUQ7QUFDVixVQUFBO01BQUEsSUFBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsSUFBOUIsQ0FBSDtRQUNFLEdBQUEsR0FBTSxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFkLENBQStCLElBQS9CO2VBQ04sT0FBQSxDQUFRLEdBQVIsRUFGRjtPQUFBLE1BQUE7ZUFJRSxVQUFBLEdBQWEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxvQkFBZCxDQUFtQyxTQUFDLEdBQUQ7VUFDOUMsSUFBRyxHQUFHLENBQUMsSUFBSixLQUFZLElBQWY7WUFDRSxVQUFVLENBQUMsT0FBWCxDQUFBO21CQUNBLE9BQUEsQ0FBUSxHQUFSLEVBRkY7O1FBRDhDLENBQW5DLEVBSmY7O0lBRFUsQ0FBUjtFQURPOztFQVdiLG1CQUFBLEdBQXNCLFNBQUMsTUFBRCxFQUFTLElBQVQ7SUFDcEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLE1BQU0sQ0FBQyxPQUE5QixFQUF1QyxtQkFBdkM7V0FDQSxVQUFBLENBQVcsa0JBQVgsQ0FBOEIsQ0FBQyxJQUEvQixDQUFvQyxTQUFDLEdBQUQ7QUFDbEMsVUFBQTtNQUFDLGtCQUFtQixHQUFHLENBQUM7TUFDeEIsSUFBRyx1QkFBSDtRQUNFLGVBQWUsQ0FBQyxVQUFVLENBQUMsT0FBM0IsQ0FBbUMsSUFBbkM7ZUFDQSxlQUFlLENBQUMsT0FBaEIsQ0FBQSxFQUZGOztJQUZrQyxDQUFwQztFQUZvQjs7RUFRdEIsV0FBQSxHQUFjLFNBQUMsTUFBRCxFQUFTLEdBQVQ7QUFDWixRQUFBO3lCQURxQixNQUFXLElBQVYsZ0JBQUs7SUFDM0IsSUFBa0MsV0FBbEM7TUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxNQUFULEVBQWlCLEdBQWpCLEVBQVQ7O0lBQ0EsSUFBa0MsV0FBbEM7TUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxNQUFULEVBQWlCLEdBQWpCLEVBQVQ7O1dBQ0E7RUFIWTs7RUFLZCxzQkFBQSxHQUF5QixTQUFDLE1BQUQsRUFBUyxLQUFUO0FBQ3ZCLFFBQUE7QUFBQSxTQUFBLHdDQUFBOztVQUF5QixLQUFLLENBQUMsYUFBTixDQUFvQixLQUFwQjtBQUN2QixlQUFPOztBQURUO1dBRUE7RUFIdUI7O0VBS3pCLGNBQUEsR0FBaUIsU0FBQyxFQUFEO1dBQ2YsU0FBQTtBQUNFLFVBQUE7TUFERDthQUNDLENBQUksRUFBQSxhQUFHLElBQUg7SUFETjtFQURlOztFQUlqQixPQUFBLEdBQVUsU0FBQyxNQUFEO1dBQVksTUFBTSxDQUFDLE9BQVAsQ0FBQTtFQUFaOztFQUNWLFVBQUEsR0FBYSxjQUFBLENBQWUsT0FBZjs7RUFFYixpQkFBQSxHQUFvQixTQUFDLEtBQUQ7V0FBVyxLQUFLLENBQUMsWUFBTixDQUFBO0VBQVg7O0VBQ3BCLG9CQUFBLEdBQXVCLGNBQUEsQ0FBZSxpQkFBZjs7RUFFdkIsd0JBQUEsR0FBMkIsU0FBQyxNQUFELEVBQVMsS0FBVDtXQUFtQixVQUFVLENBQUMsSUFBWCxDQUFnQixNQUFNLENBQUMsb0JBQVAsQ0FBNEIsS0FBNUIsQ0FBaEI7RUFBbkI7O0VBQzNCLDJCQUFBLEdBQThCLGNBQUEsQ0FBZSx3QkFBZjs7RUFFOUIsa0JBQUEsR0FBcUIsU0FBQyxNQUFELEVBQVMsS0FBVDtBQUNuQixRQUFBO0lBQUEsS0FBQSxHQUFRLEtBQUssQ0FBQyxVQUFOLENBQWlCLEtBQWpCO0lBQ1IsS0FBQSxHQUFRLGlDQUFBLENBQWtDLE1BQWxDLEVBQTBDLEtBQUssQ0FBQyxLQUFoRCxFQUF1RCxDQUF2RDtXQUNSLEtBQUssQ0FBQyxRQUFOLENBQWUsSUFBZixDQUFBLElBQXlCLENBQUksS0FBSyxDQUFDLFFBQU4sQ0FBZSxNQUFmO0VBSFY7O0VBS3JCLDBCQUFBLEdBQTZCLFNBQUMsTUFBRCxFQUFTLEtBQVQsRUFBZ0IsSUFBaEI7V0FDM0IsTUFBTSxDQUFDLG9CQUFQLENBQTRCLENBQUMsS0FBRCxFQUFRLEtBQVIsQ0FBNUIsRUFBNEMsSUFBNUM7RUFEMkI7O0VBRzdCLGlDQUFBLEdBQW9DLFNBQUMsTUFBRCxFQUFTLEdBQVQ7QUFDbEMsUUFBQTtJQUFBLElBQUEsQ0FBTyw2QkFBQSxDQUE4QixNQUE5QixFQUFzQyxHQUF0QyxDQUFQO01BQ0UsR0FBQSxHQUFNLHdCQUFBLENBQXlCLE1BQXpCLEVBQWlDLEdBQWpDO2FBQ04sMEJBQUEsQ0FBMkIsTUFBM0IsRUFBbUMsR0FBbkMsRUFBd0MsSUFBeEMsRUFGRjs7RUFEa0M7O0VBS3BDLGVBQUEsR0FBa0IsU0FBQyxJQUFELEVBQU8sRUFBUDtBQUNoQixRQUFBO0lBQUEsSUFBRyxxQkFBSDtNQUNFLEVBQUEsQ0FBRyxJQUFIO0FBRUE7QUFBQTtXQUFBLHNDQUFBOztzQkFDRSxlQUFBLENBQWdCLEtBQWhCLEVBQXVCLEVBQXZCO0FBREY7c0JBSEY7O0VBRGdCOztFQU9sQixlQUFBLEdBQWtCLFNBQUE7QUFDaEIsUUFBQTtJQURpQix1QkFBUSx3QkFBUztXQUNsQyxRQUFBLE9BQU8sQ0FBQyxTQUFSLENBQWtCLENBQUEsTUFBQSxDQUFsQixhQUEwQixVQUExQjtFQURnQjs7RUFHbEIsWUFBQSxHQUFlLGVBQWUsQ0FBQyxJQUFoQixDQUFxQixJQUFyQixFQUEyQixLQUEzQjs7RUFDZixlQUFBLEdBQWtCLGVBQWUsQ0FBQyxJQUFoQixDQUFxQixJQUFyQixFQUEyQixRQUEzQjs7RUFDbEIsZUFBQSxHQUFrQixlQUFlLENBQUMsSUFBaEIsQ0FBcUIsSUFBckIsRUFBMkIsUUFBM0I7O0VBRWxCLHNCQUFBLEdBQXlCLFNBQUMsSUFBRDtBQUN2QixRQUFBO0lBQUEsU0FBQSxHQUFZLElBQUksQ0FBQyxXQUFMLENBQUE7SUFDWixJQUFHLFNBQUEsS0FBYSxJQUFoQjthQUNFLElBQUksQ0FBQyxXQUFMLENBQUEsRUFERjtLQUFBLE1BQUE7YUFHRSxVQUhGOztFQUZ1Qjs7RUFPekIsa0JBQUEsR0FBcUIsU0FBQyxJQUFEO0lBQ25CLElBQUcsSUFBSSxDQUFDLFFBQUwsQ0FBYyxJQUFkLENBQUg7YUFDRSxJQUFJLENBQUMsU0FBTCxDQUFBLENBQWdCLENBQUMsS0FBakIsQ0FBdUIsUUFBdkIsRUFERjtLQUFBLE1BQUE7YUFHRSxJQUFJLENBQUMsS0FBTCxDQUFXLFFBQVgsRUFIRjs7RUFEbUI7O0VBTXJCLHdCQUFBLEdBQTJCLFNBQUMsRUFBRCxFQUFLLFVBQUw7QUFDekIsUUFBQTtJQUFBLEtBQUEsR0FBUSxVQUFVLENBQUMsYUFBWCxDQUFBO1dBQ1IsVUFBVSxDQUFDLGFBQVgsQ0FBeUIsQ0FBQyxDQUFDLFFBQUYsQ0FBVztNQUFDLENBQUEsS0FBQSxDQUFBLEVBQU8sRUFBQSxDQUFHLEtBQUssRUFBQyxLQUFELEVBQVIsQ0FBUjtLQUFYLEVBQXFDLEtBQXJDLENBQXpCO0VBRnlCOztFQWMzQixtQkFBQSxHQUFzQixTQUFDLE1BQUQsRUFBUyxLQUFUO0FBQ3BCLFFBQUE7SUFBQSxJQUFHLGlCQUFBLENBQWtCLEtBQWxCLENBQUEsSUFBNEIsZUFBQSxDQUFnQixLQUFoQixDQUEvQjtBQUNFLGFBQU8sTUFEVDs7SUFHQyxtQkFBRCxFQUFRO0lBQ1IsSUFBRyxrQkFBQSxDQUFtQixNQUFuQixFQUEyQixLQUEzQixDQUFIO01BQ0UsUUFBQSxHQUFXLEtBQUssQ0FBQyxRQUFOLENBQWUsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFmLEVBRGI7O0lBR0EsSUFBRyxrQkFBQSxDQUFtQixNQUFuQixFQUEyQixHQUEzQixDQUFIO01BQ0UsTUFBQSxHQUFTLEdBQUcsQ0FBQyxRQUFKLENBQWEsQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFiLEVBRFg7O0lBR0EsSUFBRyxrQkFBQSxJQUFhLGdCQUFoQjthQUNNLElBQUEsS0FBQSxvQkFBTSxXQUFXLEtBQWpCLG1CQUF3QixTQUFTLEdBQWpDLEVBRE47S0FBQSxNQUFBO2FBR0UsTUFIRjs7RUFYb0I7O0VBb0J0Qix3QkFBQSxHQUEyQixTQUFDLE1BQUQsRUFBUyxLQUFUO0FBQ3pCLFFBQUE7SUFBQyxtQkFBRCxFQUFRO0lBRVIsTUFBQSxHQUFTO0lBQ1QsU0FBQSxHQUFZLENBQUMsR0FBRCxFQUFNLHdCQUFBLENBQXlCLE1BQXpCLEVBQWlDLEdBQUcsQ0FBQyxHQUFyQyxDQUFOO0lBQ1osTUFBTSxDQUFDLGlCQUFQLENBQXlCLElBQXpCLEVBQStCLFNBQS9CLEVBQTBDLFNBQUMsR0FBRDtBQUFhLFVBQUE7TUFBWCxRQUFEO2FBQVksTUFBQSxHQUFTLEtBQUssQ0FBQztJQUE1QixDQUExQztJQUVBLHFCQUFHLE1BQU0sQ0FBRSxhQUFSLENBQXNCLEdBQXRCLFVBQUg7QUFDRSxhQUFXLElBQUEsS0FBQSxDQUFNLEtBQU4sRUFBYSxNQUFiLEVBRGI7O0lBR0EsUUFBQSxHQUFXO0lBQ1gsU0FBQSxHQUFZLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBUCxFQUFZLENBQVosQ0FBRCxFQUFpQixLQUFLLENBQUMsS0FBdkI7SUFDWixNQUFNLENBQUMsMEJBQVAsQ0FBa0MsSUFBbEMsRUFBd0MsU0FBeEMsRUFBbUQsU0FBQyxHQUFEO0FBQWEsVUFBQTtNQUFYLFFBQUQ7YUFBWSxRQUFBLEdBQVcsS0FBSyxDQUFDO0lBQTlCLENBQW5EO0lBRUEsdUJBQUcsUUFBUSxDQUFFLFVBQVYsQ0FBcUIsS0FBckIsVUFBSDtBQUNFLGFBQVcsSUFBQSxLQUFBLENBQU0sUUFBTixFQUFnQixHQUFoQixFQURiOztBQUdBLFdBQU87RUFqQmtCOztFQTBCM0IsY0FBQSxHQUFpQixTQUFDLElBQUQsRUFBTyxPQUFQLEVBQWdCLEVBQWhCO0FBQ2YsUUFBQTtJQUFBLGFBQUEsR0FBZ0IsY0FBQSxHQUFpQjtJQUNqQyxLQUFBLEdBQVEsSUFBSSxDQUFDLE1BQUwsQ0FBWSxJQUFaO0lBQ1IsR0FBQSxHQUFNLElBQUksQ0FBQyxNQUFMLENBQVksTUFBWjtJQUNOLGFBQUEsR0FBZ0IsY0FBQSxHQUFpQjtJQUNqQyxJQUFtQyxLQUFBLEtBQVcsQ0FBQyxDQUEvQztNQUFBLGFBQUEsR0FBZ0IsSUFBSyxpQkFBckI7O0lBQ0EsSUFBaUMsR0FBQSxLQUFTLENBQUMsQ0FBM0M7TUFBQSxjQUFBLEdBQWlCLElBQUssWUFBdEI7O0lBQ0EsSUFBQSxHQUFPLElBQUs7SUFFWixLQUFBLEdBQVE7SUFDUixJQUFnQixPQUFPLENBQUMsVUFBeEI7TUFBQSxLQUFBLElBQVMsSUFBVDs7SUFDQSxNQUFBLEdBQWEsSUFBQSxNQUFBLENBQU8sR0FBQSxHQUFJLE9BQU8sQ0FBQyxNQUFaLEdBQW1CLEdBQTFCLEVBQThCLEtBQTlCO0lBTWIsS0FBQSxHQUFRO0lBQ1IsVUFBQSxHQUFhO0FBQ2I7QUFBQSxTQUFBLDhDQUFBOztNQUNFLElBQUcsQ0FBQSxHQUFJLENBQUosS0FBUyxDQUFaO1FBQ0UsS0FBSyxDQUFDLElBQU4sQ0FBVyxPQUFYLEVBREY7T0FBQSxNQUFBO1FBR0UsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsT0FBaEIsRUFIRjs7QUFERjtJQUtBLFVBQVUsQ0FBQyxJQUFYLENBQWdCLEVBQWhCO0lBQ0EsS0FBQSxHQUFRLEVBQUEsQ0FBRyxLQUFIO0lBQ1IsTUFBQSxHQUFTO0FBQ1Q7QUFBQSxTQUFBLHdDQUFBO3NCQUFLLGdCQUFNO01BQ1QsTUFBQSxJQUFVLElBQUEsR0FBTztBQURuQjtXQUVBLGFBQUEsR0FBZ0IsTUFBaEIsR0FBeUI7RUE3QlY7O0VBK0JYO0lBQ1MsMkJBQUE7TUFDWCxJQUFDLENBQUEsU0FBRCxHQUFhO01BQ2IsSUFBQyxDQUFBLGNBQUQsR0FBa0I7SUFGUDs7Z0NBSWIsYUFBQSxHQUFlLFNBQUE7TUFDYixJQUFHLElBQUMsQ0FBQSxZQUFKO1FBQ0UsSUFBQyxDQUFBLFNBQVMsQ0FBQyxJQUFYLENBQWdCO1VBQUMsSUFBQSxFQUFNLElBQUMsQ0FBQSxZQUFSO1VBQXNCLElBQUEsRUFBTSxJQUFDLENBQUEsY0FBN0I7U0FBaEI7ZUFDQSxJQUFDLENBQUEsWUFBRCxHQUFnQixHQUZsQjs7SUFEYTs7Z0NBS2YsYUFBQSxHQUFlLFNBQUMsVUFBRDtNQUNiLElBQUcsSUFBQyxDQUFBLGNBQUQsS0FBcUIsVUFBeEI7UUFDRSxJQUFvQixJQUFDLENBQUEsY0FBckI7VUFBQSxJQUFDLENBQUEsYUFBRCxDQUFBLEVBQUE7O2VBQ0EsSUFBQyxDQUFBLGNBQUQsR0FBa0IsV0FGcEI7O0lBRGE7Ozs7OztFQUtqQixjQUFBLEdBQWlCLFNBQUMsSUFBRCxFQUFPLHVCQUFQO0FBQ2YsUUFBQTs7TUFBQSwwQkFBMkI7O0lBQzNCLGNBQUEsR0FBaUI7SUFDakIsVUFBQSxHQUFhO0lBQ2IsbUJBQUEsR0FBc0I7TUFDcEIsR0FBQSxFQUFLLEdBRGU7TUFFcEIsR0FBQSxFQUFLLEdBRmU7TUFHcEIsR0FBQSxFQUFLLEdBSGU7O0lBS3RCLGNBQUEsR0FBaUIsQ0FBQyxDQUFDLElBQUYsQ0FBTyxtQkFBUCxDQUEyQixDQUFDLElBQTVCLENBQWlDLEVBQWpDO0lBQ2pCLGFBQUEsR0FBZ0IsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxtQkFBVCxDQUE2QixDQUFDLElBQTlCLENBQW1DLEVBQW5DO0lBQ2hCLFVBQUEsR0FBYTtJQUViLFlBQUEsR0FBZTtJQUNmLE9BQUEsR0FBVTtJQUNWLFNBQUEsR0FBWTtJQUlaLFNBQUEsR0FBWTtJQUNaLGNBQUEsR0FBaUI7SUFFakIsYUFBQSxHQUFnQixTQUFBO01BQ2QsSUFBRyxZQUFIO1FBQ0UsU0FBUyxDQUFDLElBQVYsQ0FBZTtVQUFDLElBQUEsRUFBTSxZQUFQO1VBQXFCLElBQUEsRUFBTSxjQUEzQjtTQUFmO2VBQ0EsWUFBQSxHQUFlLEdBRmpCOztJQURjO0lBS2hCLGFBQUEsR0FBZ0IsU0FBQyxVQUFEO01BQ2QsSUFBRyxjQUFBLEtBQW9CLFVBQXZCO1FBQ0UsSUFBbUIsY0FBbkI7VUFBQSxhQUFBLENBQUEsRUFBQTs7ZUFDQSxjQUFBLEdBQWlCLFdBRm5COztJQURjO0lBS2hCLFNBQUEsR0FBWTtBQUNaLFNBQUEsc0NBQUE7O01BQ0UsSUFBRyxDQUFDLFNBQVMsQ0FBQyxNQUFWLEtBQW9CLENBQXJCLENBQUEsSUFBNEIsQ0FBQyxhQUFRLGNBQVIsRUFBQSxJQUFBLE1BQUQsQ0FBL0I7UUFDRSxhQUFBLENBQWMsV0FBZCxFQURGO09BQUEsTUFBQTtRQUdFLGFBQUEsQ0FBYyxVQUFkO1FBQ0EsSUFBRyxTQUFIO1VBQ0UsU0FBQSxHQUFZLE1BRGQ7U0FBQSxNQUVLLElBQUcsSUFBQSxLQUFRLFVBQVg7VUFDSCxTQUFBLEdBQVksS0FEVDtTQUFBLE1BRUEsSUFBRyxPQUFIO1VBQ0gsSUFBRyxDQUFDLGFBQVEsVUFBUixFQUFBLElBQUEsTUFBRCxDQUFBLElBQXlCLENBQUMsQ0FBQyxJQUFGLENBQU8sU0FBUCxDQUFBLEtBQXFCLElBQWpEO1lBQ0UsU0FBUyxDQUFDLEdBQVYsQ0FBQTtZQUNBLE9BQUEsR0FBVSxNQUZaO1dBREc7U0FBQSxNQUlBLElBQUcsYUFBUSxVQUFSLEVBQUEsSUFBQSxNQUFIO1VBQ0gsT0FBQSxHQUFVO1VBQ1YsU0FBUyxDQUFDLElBQVYsQ0FBZSxJQUFmLEVBRkc7U0FBQSxNQUdBLElBQUcsYUFBUSxhQUFSLEVBQUEsSUFBQSxNQUFIO1VBQ0gsU0FBUyxDQUFDLElBQVYsQ0FBZSxJQUFmLEVBREc7U0FBQSxNQUVBLElBQUcsYUFBUSxjQUFSLEVBQUEsSUFBQSxNQUFIO1VBQ0gsSUFBbUIsQ0FBQyxDQUFDLElBQUYsQ0FBTyxTQUFQLENBQUEsS0FBcUIsbUJBQW9CLENBQUEsSUFBQSxDQUE1RDtZQUFBLFNBQVMsQ0FBQyxHQUFWLENBQUEsRUFBQTtXQURHO1NBakJQOztNQW9CQSxZQUFBLElBQWdCO0FBckJsQjtJQXNCQSxhQUFBLENBQUE7SUFFQSxJQUFHLHVCQUFBLElBQTRCLFNBQVMsQ0FBQyxJQUFWLENBQWUsU0FBQyxHQUFEO0FBQWtCLFVBQUE7TUFBaEIsaUJBQU07YUFBVSxJQUFBLEtBQVEsV0FBUixJQUF3QixhQUFPLElBQVAsRUFBQSxHQUFBO0lBQTFDLENBQWYsQ0FBL0I7TUFHRSxZQUFBLEdBQWU7QUFDZixhQUFNLFNBQVMsQ0FBQyxNQUFoQjtRQUNFLEtBQUEsR0FBUSxTQUFTLENBQUMsS0FBVixDQUFBO0FBQ1IsZ0JBQU8sS0FBSyxDQUFDLElBQWI7QUFBQSxlQUNPLFVBRFA7WUFFSSxZQUFZLENBQUMsSUFBYixDQUFrQixLQUFsQjtBQURHO0FBRFAsZUFHTyxXQUhQO1lBSUksSUFBRyxhQUFPLEtBQUssQ0FBQyxJQUFiLEVBQUEsR0FBQSxNQUFIO2NBQ0UsWUFBWSxDQUFDLElBQWIsQ0FBa0IsS0FBbEIsRUFERjthQUFBLE1BQUE7Y0FLRSxPQUFBLGdEQUErQjtnQkFBQyxJQUFBLEVBQU0sRUFBUDtnQkFBVyxZQUFBLFVBQVg7O2NBQy9CLE9BQU8sQ0FBQyxJQUFSLElBQWdCLEtBQUssQ0FBQyxJQUFOLEdBQWEsbUZBQTJCLEVBQTNCO2NBQzdCLFlBQVksQ0FBQyxJQUFiLENBQWtCLE9BQWxCLEVBUEY7O0FBSko7TUFGRjtNQWNBLFNBQUEsR0FBWSxhQWxCZDs7V0FtQkE7RUE1RWU7O0VBOEVqQixxQkFBQSxHQUF3QixTQUFDLE1BQUQsRUFBUyxTQUFULEVBQW9CLE9BQXBCLEVBQTZCLE9BQTdCLEVBQXlDLEVBQXpDO0FBQ3RCLFFBQUE7O01BRG1ELFVBQVE7O0lBQzFELHFDQUFELEVBQWdCLG1CQUFoQixFQUFzQjtJQUN0QixJQUFPLGNBQUosSUFBa0IsbUJBQXJCO0FBQ0UsWUFBVSxJQUFBLEtBQUEsQ0FBTSxrREFBTixFQURaOztJQUdBLElBQUcsU0FBSDtNQUNFLGFBQUEsR0FBZ0IsS0FEbEI7S0FBQSxNQUFBOztRQUdFLGdCQUFpQjtPQUhuQjs7SUFJQSxJQUFpQyxZQUFqQztNQUFBLElBQUEsR0FBTyxLQUFLLENBQUMsVUFBTixDQUFpQixJQUFqQixFQUFQOztBQUNBLFlBQU8sU0FBUDtBQUFBLFdBQ08sU0FEUDs7VUFFSSxZQUFpQixJQUFBLEtBQUEsQ0FBTSxJQUFOLEVBQVksdUJBQUEsQ0FBd0IsTUFBeEIsQ0FBWjs7UUFDakIsWUFBQSxHQUFlO0FBRlo7QUFEUCxXQUlPLFVBSlA7O1VBS0ksWUFBaUIsSUFBQSxLQUFBLENBQU0sQ0FBQyxDQUFELEVBQUksQ0FBSixDQUFOLEVBQWMsSUFBZDs7UUFDakIsWUFBQSxHQUFlO0FBTm5CO1dBUUEsTUFBTyxDQUFBLFlBQUEsQ0FBUCxDQUFxQixPQUFyQixFQUE4QixTQUE5QixFQUF5QyxTQUFDLEtBQUQ7TUFDdkMsSUFBRyxDQUFJLGFBQUosSUFBc0IsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBbEIsS0FBMkIsSUFBSSxDQUFDLEdBQXpEO1FBQ0UsS0FBSyxDQUFDLElBQU4sQ0FBQTtBQUNBLGVBRkY7O2FBR0EsRUFBQSxDQUFHLEtBQUg7SUFKdUMsQ0FBekM7RUFsQnNCOztFQXdCeEIsNkJBQUEsR0FBZ0MsU0FBQyxNQUFELEVBQVMsS0FBVDtBQWE5QixRQUFBO0lBQUEsY0FBQSxHQUFpQixNQUFNLENBQUMsMkJBQVAsQ0FBbUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUEvQztJQUNqQixRQUFBLEdBQVc7SUFDWCxrQkFBQSxHQUFxQjtBQUNyQixTQUFXLDBIQUFYO01BQ0UsV0FBQSxHQUFjLDBCQUFBLENBQTJCLE1BQTNCLEVBQW1DLEdBQW5DO01BQ2Qsa0JBQWtCLENBQUMsSUFBbkIsQ0FBd0IsQ0FBQyxHQUFELEVBQU0sV0FBTixDQUF4QjtNQUNBLElBQUEsQ0FBTyxVQUFBLENBQVcsTUFBWCxFQUFtQixHQUFuQixDQUFQO1FBQ0UsUUFBQSxHQUFXLElBQUksQ0FBQyxHQUFMLG9CQUFTLFdBQVcsS0FBcEIsRUFBOEIsV0FBOUIsRUFEYjs7QUFIRjtJQU1BLElBQUcsa0JBQUEsSUFBYyxDQUFDLHFCQUFBLEdBQXdCLGNBQUEsR0FBaUIsUUFBMUMsQ0FBakI7QUFDRTtXQUFBLG9EQUFBO3NDQUFLLGVBQUs7UUFDUixRQUFBLEdBQVcsV0FBQSxHQUFjO3NCQUN6QixNQUFNLENBQUMsMEJBQVAsQ0FBa0MsR0FBbEMsRUFBdUMsUUFBdkM7QUFGRjtzQkFERjs7RUF0QjhCOztFQTRCaEMsa0NBQUEsR0FBcUMsU0FBQyxLQUFELEVBQVEsS0FBUjtXQUNuQyxLQUFLLENBQUMsS0FBSyxDQUFDLGlCQUFaLENBQThCLEtBQTlCLENBQUEsSUFDRSxLQUFLLENBQUMsR0FBRyxDQUFDLGFBQVYsQ0FBd0IsS0FBeEI7RUFGaUM7O0VBSXJDLHFCQUFBLEdBQXdCLFNBQUMsS0FBRCxFQUFRLElBQVI7V0FDdEIsS0FBSyxDQUFDLFFBQU4sQ0FBZSxtQkFBQSxDQUFvQixJQUFwQixDQUFmO0VBRHNCOztFQUd4QixtQkFBQSxHQUFzQixTQUFDLElBQUQ7QUFDcEIsUUFBQTtJQUFBLEdBQUEsR0FBTTtJQUNOLE1BQUEsR0FBUztBQUNULFNBQUEsc0NBQUE7O01BQ0UsSUFBRyxJQUFBLEtBQVEsSUFBWDtRQUNFLEdBQUE7UUFDQSxNQUFBLEdBQVMsRUFGWDtPQUFBLE1BQUE7UUFJRSxNQUFBLEdBSkY7O0FBREY7V0FNQSxDQUFDLEdBQUQsRUFBTSxNQUFOO0VBVG9COztFQVd0QixNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUNmLHFCQUFBLG1CQURlO0lBRWYsY0FBQSxZQUZlO0lBR2YseUJBQUEsdUJBSGU7SUFJZixTQUFBLE9BSmU7SUFLZixPQUFBLEtBTGU7SUFNZixpQkFBQSxlQU5lO0lBT2YsaUJBQUEsZUFQZTtJQVFmLFlBQUEsVUFSZTtJQVNmLFVBQUEsUUFUZTtJQVVmLHVCQUFBLHFCQVZlO0lBV2YsbUJBQUEsaUJBWGU7SUFZZixvQkFBQSxrQkFaZTtJQWFmLHFCQUFBLG1CQWJlO0lBY2YsaUNBQUEsK0JBZGU7SUFlZix1QkFBQSxxQkFmZTtJQWdCZix5QkFBQSx1QkFoQmU7SUFpQmYseUJBQUEsdUJBakJlO0lBa0JmLHFCQUFBLG1CQWxCZTtJQW1CZixxQkFBQSxtQkFuQmU7SUFvQmYsY0FBQSxZQXBCZTtJQXFCZixpQkFBQSxlQXJCZTtJQXNCZixnQkFBQSxjQXRCZTtJQXVCZixpQkFBQSxlQXZCZTtJQXdCZixvQkFBQSxrQkF4QmU7SUF5QmYsc0JBQUEsb0JBekJlO0lBMEJmLDBCQUFBLHdCQTFCZTtJQTJCZiwwQkFBQSx3QkEzQmU7SUE0QmYseUJBQUEsdUJBNUJlO0lBNkJmLHNCQUFBLG9CQTdCZTtJQThCZixzQkFBQSxvQkE5QmU7SUErQmYsaUNBQUEsK0JBL0JlO0lBZ0NmLDZCQUFBLDJCQWhDZTtJQWlDZiw0QkFBQSwwQkFqQ2U7SUFrQ2Ysc0JBQUEsb0JBbENlO0lBbUNmLCtCQUFBLDZCQW5DZTtJQW9DZixZQUFBLFVBcENlO0lBcUNmLHNCQUFBLG9CQXJDZTtJQXNDZixxQ0FBQSxtQ0F0Q2U7SUF1Q2Ysa0JBQUEsZ0JBdkNlO0lBd0NmLHlCQUFBLHVCQXhDZTtJQXlDZixtQkFBQSxpQkF6Q2U7SUEwQ2YsMkJBQUEseUJBMUNlO0lBMkNmLFdBQUEsU0EzQ2U7SUE0Q2YsdUNBQUEscUNBNUNlO0lBNkNmLDhCQUFBLDRCQTdDZTtJQThDZixrQ0FBQSxnQ0E5Q2U7SUErQ2YsZUFBQSxhQS9DZTtJQWdEZiw2QkFBQSwyQkFoRGU7SUFpRGYsYUFBQSxXQWpEZTtJQWtEZixrQkFBQSxnQkFsRGU7SUFtRGYsb0NBQUEsa0NBbkRlO0lBb0RmLDJDQUFBLHlDQXBEZTtJQXFEZixnQ0FBQSw4QkFyRGU7SUFzRGYsbUNBQUEsaUNBdERlO0lBdURmLCtCQUFBLDZCQXZEZTtJQXdEZiwrQkFBQSw2QkF4RGU7SUF5RGYsWUFBQSxVQXpEZTtJQTBEZix5QkFBQSx1QkExRGU7SUEyRGYsc0JBQUEsb0JBM0RlO0lBNERmLHNDQUFBLG9DQTVEZTtJQTZEZix1QkFBQSxxQkE3RGU7SUE4RGYsaUNBQUEsK0JBOURlO0lBK0RmLFlBQUEsVUEvRGU7SUFnRWYscUJBQUEsbUJBaEVlO0lBaUVmLGFBQUEsV0FqRWU7SUFrRWYsd0JBQUEsc0JBbEVlO0lBb0VmLFNBQUEsT0FwRWU7SUFvRU4sWUFBQSxVQXBFTTtJQXFFZixtQkFBQSxpQkFyRWU7SUFxRUksc0JBQUEsb0JBckVKO0lBdUVmLDRCQUFBLDBCQXZFZTtJQXdFZixtQ0FBQSxpQ0F4RWU7SUF5RWYsMEJBQUEsd0JBekVlO0lBMEVmLDZCQUFBLDJCQTFFZTtJQTJFZixvQkFBQSxrQkEzRWU7SUE2RWYsaUJBQUEsZUE3RWU7SUE4RWYsY0FBQSxZQTlFZTtJQStFZixpQkFBQSxlQS9FZTtJQWdGZixpQkFBQSxlQWhGZTtJQWlGZix3QkFBQSxzQkFqRmU7SUFrRmYsb0JBQUEsa0JBbEZlO0lBbUZmLDBCQUFBLHdCQW5GZTtJQW9GZixxQkFBQSxtQkFwRmU7SUFxRmYsMEJBQUEsd0JBckZlO0lBc0ZmLGdCQUFBLGNBdEZlO0lBdUZmLGdCQUFBLGNBdkZlO0lBd0ZmLHVCQUFBLHFCQXhGZTtJQXlGZiwrQkFBQSw2QkF6RmU7SUEwRmYsb0NBQUEsa0NBMUZlO0lBMkZmLHVCQUFBLHFCQTNGZTs7QUFyOEJqQiIsInNvdXJjZXNDb250ZW50IjpbImZzID0gbnVsbFxuc2V0dGluZ3MgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG57RGlzcG9zYWJsZSwgUmFuZ2UsIFBvaW50fSA9IHJlcXVpcmUgJ2F0b20nXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG5hc3NlcnRXaXRoRXhjZXB0aW9uID0gKGNvbmRpdGlvbiwgbWVzc2FnZSwgZm4pIC0+XG4gIGF0b20uYXNzZXJ0IGNvbmRpdGlvbiwgbWVzc2FnZSwgKGVycm9yKSAtPlxuICAgIHRocm93IG5ldyBFcnJvcihlcnJvci5tZXNzYWdlKVxuXG5nZXRBbmNlc3RvcnMgPSAob2JqKSAtPlxuICBhbmNlc3RvcnMgPSBbXVxuICBjdXJyZW50ID0gb2JqXG4gIGxvb3BcbiAgICBhbmNlc3RvcnMucHVzaChjdXJyZW50KVxuICAgIGN1cnJlbnQgPSBjdXJyZW50Ll9fc3VwZXJfXz8uY29uc3RydWN0b3JcbiAgICBicmVhayB1bmxlc3MgY3VycmVudFxuICBhbmNlc3RvcnNcblxuZ2V0S2V5QmluZGluZ0ZvckNvbW1hbmQgPSAoY29tbWFuZCwge3BhY2thZ2VOYW1lfSkgLT5cbiAgcmVzdWx0cyA9IG51bGxcbiAga2V5bWFwcyA9IGF0b20ua2V5bWFwcy5nZXRLZXlCaW5kaW5ncygpXG4gIGlmIHBhY2thZ2VOYW1lP1xuICAgIGtleW1hcFBhdGggPSBhdG9tLnBhY2thZ2VzLmdldEFjdGl2ZVBhY2thZ2UocGFja2FnZU5hbWUpLmdldEtleW1hcFBhdGhzKCkucG9wKClcbiAgICBrZXltYXBzID0ga2V5bWFwcy5maWx0ZXIoKHtzb3VyY2V9KSAtPiBzb3VyY2UgaXMga2V5bWFwUGF0aClcblxuICBmb3Iga2V5bWFwIGluIGtleW1hcHMgd2hlbiBrZXltYXAuY29tbWFuZCBpcyBjb21tYW5kXG4gICAge2tleXN0cm9rZXMsIHNlbGVjdG9yfSA9IGtleW1hcFxuICAgIGtleXN0cm9rZXMgPSBrZXlzdHJva2VzLnJlcGxhY2UoL3NoaWZ0LS8sICcnKVxuICAgIChyZXN1bHRzID89IFtdKS5wdXNoKHtrZXlzdHJva2VzLCBzZWxlY3Rvcn0pXG4gIHJlc3VsdHNcblxuIyBJbmNsdWRlIG1vZHVsZShvYmplY3Qgd2hpY2ggbm9ybWFseSBwcm92aWRlcyBzZXQgb2YgbWV0aG9kcykgdG8ga2xhc3NcbmluY2x1ZGUgPSAoa2xhc3MsIG1vZHVsZSkgLT5cbiAgZm9yIGtleSwgdmFsdWUgb2YgbW9kdWxlXG4gICAga2xhc3M6OltrZXldID0gdmFsdWVcblxuZGVidWcgPSAobWVzc2FnZXMuLi4pIC0+XG4gIHJldHVybiB1bmxlc3Mgc2V0dGluZ3MuZ2V0KCdkZWJ1ZycpXG4gIHN3aXRjaCBzZXR0aW5ncy5nZXQoJ2RlYnVnT3V0cHV0JylcbiAgICB3aGVuICdjb25zb2xlJ1xuICAgICAgY29uc29sZS5sb2cgbWVzc2FnZXMuLi5cbiAgICB3aGVuICdmaWxlJ1xuICAgICAgZnMgPz0gcmVxdWlyZSAnZnMtcGx1cydcbiAgICAgIGZpbGVQYXRoID0gZnMubm9ybWFsaXplIHNldHRpbmdzLmdldCgnZGVidWdPdXRwdXRGaWxlUGF0aCcpXG4gICAgICBpZiBmcy5leGlzdHNTeW5jKGZpbGVQYXRoKVxuICAgICAgICBmcy5hcHBlbmRGaWxlU3luYyBmaWxlUGF0aCwgbWVzc2FnZXMgKyBcIlxcblwiXG5cbiMgUmV0dXJuIGZ1bmN0aW9uIHRvIHJlc3RvcmUgZWRpdG9yJ3Mgc2Nyb2xsVG9wIGFuZCBmb2xkIHN0YXRlLlxuc2F2ZUVkaXRvclN0YXRlID0gKGVkaXRvcikgLT5cbiAgZWRpdG9yRWxlbWVudCA9IGVkaXRvci5lbGVtZW50XG4gIHNjcm9sbFRvcCA9IGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKClcblxuICBmb2xkU3RhcnRSb3dzID0gZWRpdG9yLmRpc3BsYXlMYXllci5mb2xkc01hcmtlckxheWVyLmZpbmRNYXJrZXJzKHt9KS5tYXAgKG0pIC0+IG0uZ2V0U3RhcnRQb3NpdGlvbigpLnJvd1xuICAtPlxuICAgIGZvciByb3cgaW4gZm9sZFN0YXJ0Um93cy5yZXZlcnNlKCkgd2hlbiBub3QgZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3cocm93KVxuICAgICAgZWRpdG9yLmZvbGRCdWZmZXJSb3cocm93KVxuICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKHNjcm9sbFRvcClcblxuaXNMaW5ld2lzZVJhbmdlID0gKHtzdGFydCwgZW5kfSkgLT5cbiAgKHN0YXJ0LnJvdyBpc250IGVuZC5yb3cpIGFuZCAoc3RhcnQuY29sdW1uIGlzIGVuZC5jb2x1bW4gaXMgMClcblxuaXNFbmRzV2l0aE5ld0xpbmVGb3JCdWZmZXJSb3cgPSAoZWRpdG9yLCByb3cpIC0+XG4gIHtzdGFydCwgZW5kfSA9IGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhyb3csIGluY2x1ZGVOZXdsaW5lOiB0cnVlKVxuICBzdGFydC5yb3cgaXNudCBlbmQucm93XG5cbnNvcnRSYW5nZXMgPSAoY29sbGVjdGlvbikgLT5cbiAgY29sbGVjdGlvbi5zb3J0IChhLCBiKSAtPiBhLmNvbXBhcmUoYilcblxuIyBSZXR1cm4gYWRqdXN0ZWQgaW5kZXggZml0IHdoaXRpbiBnaXZlbiBsaXN0J3MgbGVuZ3RoXG4jIHJldHVybiAtMSBpZiBsaXN0IGlzIGVtcHR5LlxuZ2V0SW5kZXggPSAoaW5kZXgsIGxpc3QpIC0+XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoXG4gIGlmIGxlbmd0aCBpcyAwXG4gICAgLTFcbiAgZWxzZVxuICAgIGluZGV4ID0gaW5kZXggJSBsZW5ndGhcbiAgICBpZiBpbmRleCA+PSAwXG4gICAgICBpbmRleFxuICAgIGVsc2VcbiAgICAgIGxlbmd0aCArIGluZGV4XG5cbiMgTk9URTogZW5kUm93IGJlY29tZSB1bmRlZmluZWQgaWYgQGVkaXRvckVsZW1lbnQgaXMgbm90IHlldCBhdHRhY2hlZC5cbiMgZS5nLiBCZWdpbmcgY2FsbGVkIGltbWVkaWF0ZWx5IGFmdGVyIG9wZW4gZmlsZS5cbmdldFZpc2libGVCdWZmZXJSYW5nZSA9IChlZGl0b3IpIC0+XG4gIFtzdGFydFJvdywgZW5kUm93XSA9IGVkaXRvci5lbGVtZW50LmdldFZpc2libGVSb3dSYW5nZSgpXG4gIHJldHVybiBudWxsIHVubGVzcyAoc3RhcnRSb3c/IGFuZCBlbmRSb3c/KVxuICBzdGFydFJvdyA9IGVkaXRvci5idWZmZXJSb3dGb3JTY3JlZW5Sb3coc3RhcnRSb3cpXG4gIGVuZFJvdyA9IGVkaXRvci5idWZmZXJSb3dGb3JTY3JlZW5Sb3coZW5kUm93KVxuICBuZXcgUmFuZ2UoW3N0YXJ0Um93LCAwXSwgW2VuZFJvdywgSW5maW5pdHldKVxuXG5nZXRWaXNpYmxlRWRpdG9ycyA9IC0+XG4gIChlZGl0b3IgZm9yIHBhbmUgaW4gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKSB3aGVuIGVkaXRvciA9IHBhbmUuZ2V0QWN0aXZlRWRpdG9yKCkpXG5cbmdldEVuZE9mTGluZUZvckJ1ZmZlclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHJvdykuZW5kXG5cbiMgUG9pbnQgdXRpbFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5wb2ludElzQXRFbmRPZkxpbmUgPSAoZWRpdG9yLCBwb2ludCkgLT5cbiAgcG9pbnQgPSBQb2ludC5mcm9tT2JqZWN0KHBvaW50KVxuICBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3coZWRpdG9yLCBwb2ludC5yb3cpLmlzRXF1YWwocG9pbnQpXG5cbnBvaW50SXNPbldoaXRlU3BhY2UgPSAoZWRpdG9yLCBwb2ludCkgLT5cbiAgY2hhciA9IGdldFJpZ2h0Q2hhcmFjdGVyRm9yQnVmZmVyUG9zaXRpb24oZWRpdG9yLCBwb2ludClcbiAgbm90IC9cXFMvLnRlc3QoY2hhcilcblxucG9pbnRJc0F0RW5kT2ZMaW5lQXROb25FbXB0eVJvdyA9IChlZGl0b3IsIHBvaW50KSAtPlxuICBwb2ludCA9IFBvaW50LmZyb21PYmplY3QocG9pbnQpXG4gIHBvaW50LmNvbHVtbiBpc250IDAgYW5kIHBvaW50SXNBdEVuZE9mTGluZShlZGl0b3IsIHBvaW50KVxuXG5wb2ludElzQXRWaW1FbmRPZkZpbGUgPSAoZWRpdG9yLCBwb2ludCkgLT5cbiAgZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oZWRpdG9yKS5pc0VxdWFsKHBvaW50KVxuXG5pc0VtcHR5Um93ID0gKGVkaXRvciwgcm93KSAtPlxuICBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocm93KS5pc0VtcHR5KClcblxuZ2V0UmlnaHRDaGFyYWN0ZXJGb3JCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50LCBhbW91bnQ9MSkgLT5cbiAgZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKFJhbmdlLmZyb21Qb2ludFdpdGhEZWx0YShwb2ludCwgMCwgYW1vdW50KSlcblxuZ2V0TGVmdENoYXJhY3RlckZvckJ1ZmZlclBvc2l0aW9uID0gKGVkaXRvciwgcG9pbnQsIGFtb3VudD0xKSAtPlxuICBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoUmFuZ2UuZnJvbVBvaW50V2l0aERlbHRhKHBvaW50LCAwLCAtYW1vdW50KSlcblxuZ2V0VGV4dEluU2NyZWVuUmFuZ2UgPSAoZWRpdG9yLCBzY3JlZW5SYW5nZSkgLT5cbiAgYnVmZmVyUmFuZ2UgPSBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JTY3JlZW5SYW5nZShzY3JlZW5SYW5nZSlcbiAgZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKGJ1ZmZlclJhbmdlKVxuXG5nZXROb25Xb3JkQ2hhcmFjdGVyc0ZvckN1cnNvciA9IChjdXJzb3IpIC0+XG4gICMgQXRvbSAxLjExLjAtYmV0YTUgaGF2ZSB0aGlzIGV4cGVyaW1lbnRhbCBtZXRob2QuXG4gIGlmIGN1cnNvci5nZXROb25Xb3JkQ2hhcmFjdGVycz9cbiAgICBjdXJzb3IuZ2V0Tm9uV29yZENoYXJhY3RlcnMoKVxuICBlbHNlXG4gICAgc2NvcGUgPSBjdXJzb3IuZ2V0U2NvcGVEZXNjcmlwdG9yKCkuZ2V0U2NvcGVzQXJyYXkoKVxuICAgIGF0b20uY29uZmlnLmdldCgnZWRpdG9yLm5vbldvcmRDaGFyYWN0ZXJzJywge3Njb3BlfSlcblxuIyBGSVhNRTogcmVtb3ZlIHRoaXNcbiMgcmV0dXJuIHRydWUgaWYgbW92ZWRcbm1vdmVDdXJzb3JUb05leHROb25XaGl0ZXNwYWNlID0gKGN1cnNvcikgLT5cbiAgb3JpZ2luYWxQb2ludCA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gIGVkaXRvciA9IGN1cnNvci5lZGl0b3JcbiAgdmltRW9mID0gZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oZWRpdG9yKVxuXG4gIHdoaWxlIHBvaW50SXNPbldoaXRlU3BhY2UoZWRpdG9yLCBwb2ludCA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKSBhbmQgbm90IHBvaW50LmlzR3JlYXRlclRoYW5PckVxdWFsKHZpbUVvZilcbiAgICBjdXJzb3IubW92ZVJpZ2h0KClcbiAgbm90IG9yaWdpbmFsUG9pbnQuaXNFcXVhbChjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcblxuZ2V0QnVmZmVyUm93cyA9IChlZGl0b3IsIHtzdGFydFJvdywgZGlyZWN0aW9ufSkgLT5cbiAgc3dpdGNoIGRpcmVjdGlvblxuICAgIHdoZW4gJ3ByZXZpb3VzJ1xuICAgICAgaWYgc3RhcnRSb3cgPD0gMFxuICAgICAgICBbXVxuICAgICAgZWxzZVxuICAgICAgICBbKHN0YXJ0Um93IC0gMSkuLjBdXG4gICAgd2hlbiAnbmV4dCdcbiAgICAgIGVuZFJvdyA9IGdldFZpbUxhc3RCdWZmZXJSb3coZWRpdG9yKVxuICAgICAgaWYgc3RhcnRSb3cgPj0gZW5kUm93XG4gICAgICAgIFtdXG4gICAgICBlbHNlXG4gICAgICAgIFsoc3RhcnRSb3cgKyAxKS4uZW5kUm93XVxuXG4jIFJldHVybiBWaW0ncyBFT0YgcG9zaXRpb24gcmF0aGVyIHRoYW4gQXRvbSdzIEVPRiBwb3NpdGlvbi5cbiMgVGhpcyBmdW5jdGlvbiBjaGFuZ2UgbWVhbmluZyBvZiBFT0YgZnJvbSBuYXRpdmUgVGV4dEVkaXRvcjo6Z2V0RW9mQnVmZmVyUG9zaXRpb24oKVxuIyBBdG9tIGlzIHNwZWNpYWwoc3RyYW5nZSkgZm9yIGN1cnNvciBjYW4gcGFzdCB2ZXJ5IGxhc3QgbmV3bGluZSBjaGFyYWN0ZXIuXG4jIEJlY2F1c2Ugb2YgdGhpcywgQXRvbSdzIEVPRiBwb3NpdGlvbiBpcyBbYWN0dWFsTGFzdFJvdysxLCAwXSBwcm92aWRlZCBsYXN0LW5vbi1ibGFuay1yb3dcbiMgZW5kcyB3aXRoIG5ld2xpbmUgY2hhci5cbiMgQnV0IGluIFZpbSwgY3Vyb3IgY2FuIE5PVCBwYXN0IGxhc3QgbmV3bGluZS4gRU9GIGlzIG5leHQgcG9zaXRpb24gb2YgdmVyeSBsYXN0IGNoYXJhY3Rlci5cbmdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uID0gKGVkaXRvcikgLT5cbiAgZW9mID0gZWRpdG9yLmdldEVvZkJ1ZmZlclBvc2l0aW9uKClcbiAgaWYgKGVvZi5yb3cgaXMgMCkgb3IgKGVvZi5jb2x1bW4gPiAwKVxuICAgIGVvZlxuICBlbHNlXG4gICAgZ2V0RW5kT2ZMaW5lRm9yQnVmZmVyUm93KGVkaXRvciwgZW9mLnJvdyAtIDEpXG5cbmdldFZpbUVvZlNjcmVlblBvc2l0aW9uID0gKGVkaXRvcikgLT5cbiAgZWRpdG9yLnNjcmVlblBvc2l0aW9uRm9yQnVmZmVyUG9zaXRpb24oZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oZWRpdG9yKSlcblxuZ2V0VmltTGFzdEJ1ZmZlclJvdyA9IChlZGl0b3IpIC0+IGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKGVkaXRvcikucm93XG5nZXRWaW1MYXN0U2NyZWVuUm93ID0gKGVkaXRvcikgLT4gZ2V0VmltRW9mU2NyZWVuUG9zaXRpb24oZWRpdG9yKS5yb3dcbmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdyA9IChlZGl0b3IpIC0+IGVkaXRvci5lbGVtZW50LmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdyA9IChlZGl0b3IpIC0+IGVkaXRvci5lbGVtZW50LmdldExhc3RWaXNpYmxlU2NyZWVuUm93KClcblxuZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgcmFuZ2UgPSBmaW5kUmFuZ2VJbkJ1ZmZlclJvdyhlZGl0b3IsIC9cXFMvLCByb3cpXG4gIHJhbmdlPy5zdGFydCA/IG5ldyBQb2ludChyb3csIDApXG5cbnRyaW1SYW5nZSA9IChlZGl0b3IsIHNjYW5SYW5nZSkgLT5cbiAgcGF0dGVybiA9IC9cXFMvXG4gIFtzdGFydCwgZW5kXSA9IFtdXG4gIHNldFN0YXJ0ID0gKHtyYW5nZX0pIC0+IHtzdGFydH0gPSByYW5nZVxuICBzZXRFbmQgPSAoe3JhbmdlfSkgLT4ge2VuZH0gPSByYW5nZVxuICBlZGl0b3Iuc2NhbkluQnVmZmVyUmFuZ2UocGF0dGVybiwgc2NhblJhbmdlLCBzZXRTdGFydClcbiAgZWRpdG9yLmJhY2t3YXJkc1NjYW5JbkJ1ZmZlclJhbmdlKHBhdHRlcm4sIHNjYW5SYW5nZSwgc2V0RW5kKSBpZiBzdGFydD9cbiAgaWYgc3RhcnQ/IGFuZCBlbmQ/XG4gICAgbmV3IFJhbmdlKHN0YXJ0LCBlbmQpXG4gIGVsc2VcbiAgICBzY2FuUmFuZ2VcblxuIyBDdXJzb3IgbW90aW9uIHdyYXBwZXJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBKdXN0IHVwZGF0ZSBidWZmZXJSb3cgd2l0aCBrZWVwaW5nIGNvbHVtbiBieSByZXNwZWN0aW5nIGdvYWxDb2x1bW5cbnNldEJ1ZmZlclJvdyA9IChjdXJzb3IsIHJvdywgb3B0aW9ucykgLT5cbiAgY29sdW1uID0gY3Vyc29yLmdvYWxDb2x1bW4gPyBjdXJzb3IuZ2V0QnVmZmVyQ29sdW1uKClcbiAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKFtyb3csIGNvbHVtbl0sIG9wdGlvbnMpXG4gIGN1cnNvci5nb2FsQ29sdW1uID0gY29sdW1uXG5cbnNldEJ1ZmZlckNvbHVtbiA9IChjdXJzb3IsIGNvbHVtbikgLT5cbiAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKFtjdXJzb3IuZ2V0QnVmZmVyUm93KCksIGNvbHVtbl0pXG5cbm1vdmVDdXJzb3IgPSAoY3Vyc29yLCB7cHJlc2VydmVHb2FsQ29sdW1ufSwgZm4pIC0+XG4gIHtnb2FsQ29sdW1ufSA9IGN1cnNvclxuICBmbihjdXJzb3IpXG4gIGlmIHByZXNlcnZlR29hbENvbHVtbiBhbmQgZ29hbENvbHVtbj9cbiAgICBjdXJzb3IuZ29hbENvbHVtbiA9IGdvYWxDb2x1bW5cblxuIyBXb3JrYXJvdW5kIGlzc3VlIGZvciB0OW1kL3ZpbS1tb2RlLXBsdXMjMjI2IGFuZCBhdG9tL2F0b20jMzE3NFxuIyBJIGNhbm5vdCBkZXBlbmQgY3Vyc29yJ3MgY29sdW1uIHNpbmNlIGl0cyBjbGFpbSAwIGFuZCBjbGlwcGluZyBlbW11bGF0aW9uIGRvbid0XG4jIHJldHVybiB3cmFwcGVkIGxpbmUsIGJ1dCBJdCBhY3R1YWxseSB3cmFwLCBzbyBJIG5lZWQgdG8gZG8gdmVyeSBkaXJ0eSB3b3JrIHRvXG4jIHByZWRpY3Qgd3JhcCBodXJpc3RpY2FsbHkuXG5zaG91bGRQcmV2ZW50V3JhcExpbmUgPSAoY3Vyc29yKSAtPlxuICB7cm93LCBjb2x1bW59ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgaWYgYXRvbS5jb25maWcuZ2V0KCdlZGl0b3Iuc29mdFRhYnMnKVxuICAgIHRhYkxlbmd0aCA9IGF0b20uY29uZmlnLmdldCgnZWRpdG9yLnRhYkxlbmd0aCcpXG4gICAgaWYgMCA8IGNvbHVtbiA8IHRhYkxlbmd0aFxuICAgICAgdGV4dCA9IGN1cnNvci5lZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoW1tyb3csIDBdLCBbcm93LCB0YWJMZW5ndGhdXSlcbiAgICAgIC9eXFxzKyQvLnRlc3QodGV4dClcbiAgICBlbHNlXG4gICAgICBmYWxzZVxuXG4jIG9wdGlvbnM6XG4jICAgYWxsb3dXcmFwOiB0byBjb250cm9sbCBhbGxvdyB3cmFwXG4jICAgcHJlc2VydmVHb2FsQ29sdW1uOiBwcmVzZXJ2ZSBvcmlnaW5hbCBnb2FsQ29sdW1uXG5tb3ZlQ3Vyc29yTGVmdCA9IChjdXJzb3IsIG9wdGlvbnM9e30pIC0+XG4gIHthbGxvd1dyYXAsIG5lZWRTcGVjaWFsQ2FyZVRvUHJldmVudFdyYXBMaW5lfSA9IG9wdGlvbnNcbiAgZGVsZXRlIG9wdGlvbnMuYWxsb3dXcmFwXG4gIGlmIG5lZWRTcGVjaWFsQ2FyZVRvUHJldmVudFdyYXBMaW5lXG4gICAgcmV0dXJuIGlmIHNob3VsZFByZXZlbnRXcmFwTGluZShjdXJzb3IpXG5cbiAgaWYgbm90IGN1cnNvci5pc0F0QmVnaW5uaW5nT2ZMaW5lKCkgb3IgYWxsb3dXcmFwXG4gICAgbW90aW9uID0gKGN1cnNvcikgLT4gY3Vyc29yLm1vdmVMZWZ0KClcbiAgICBtb3ZlQ3Vyc29yKGN1cnNvciwgb3B0aW9ucywgbW90aW9uKVxuXG5tb3ZlQ3Vyc29yUmlnaHQgPSAoY3Vyc29yLCBvcHRpb25zPXt9KSAtPlxuICB7YWxsb3dXcmFwfSA9IG9wdGlvbnNcbiAgZGVsZXRlIG9wdGlvbnMuYWxsb3dXcmFwXG4gIGlmIG5vdCBjdXJzb3IuaXNBdEVuZE9mTGluZSgpIG9yIGFsbG93V3JhcFxuICAgIG1vdGlvbiA9IChjdXJzb3IpIC0+IGN1cnNvci5tb3ZlUmlnaHQoKVxuICAgIG1vdmVDdXJzb3IoY3Vyc29yLCBvcHRpb25zLCBtb3Rpb24pXG5cbm1vdmVDdXJzb3JVcFNjcmVlbiA9IChjdXJzb3IsIG9wdGlvbnM9e30pIC0+XG4gIHVubGVzcyBjdXJzb3IuZ2V0U2NyZWVuUm93KCkgaXMgMFxuICAgIG1vdGlvbiA9IChjdXJzb3IpIC0+IGN1cnNvci5tb3ZlVXAoKVxuICAgIG1vdmVDdXJzb3IoY3Vyc29yLCBvcHRpb25zLCBtb3Rpb24pXG5cbm1vdmVDdXJzb3JEb3duU2NyZWVuID0gKGN1cnNvciwgb3B0aW9ucz17fSkgLT5cbiAgdW5sZXNzIGdldFZpbUxhc3RTY3JlZW5Sb3coY3Vyc29yLmVkaXRvcikgaXMgY3Vyc29yLmdldFNjcmVlblJvdygpXG4gICAgbW90aW9uID0gKGN1cnNvcikgLT4gY3Vyc29yLm1vdmVEb3duKClcbiAgICBtb3ZlQ3Vyc29yKGN1cnNvciwgb3B0aW9ucywgbW90aW9uKVxuXG5tb3ZlQ3Vyc29yVG9GaXJzdENoYXJhY3RlckF0Um93ID0gKGN1cnNvciwgcm93KSAtPlxuICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW3JvdywgMF0pXG4gIGN1cnNvci5tb3ZlVG9GaXJzdENoYXJhY3Rlck9mTGluZSgpXG5cbmdldFZhbGlkVmltQnVmZmVyUm93ID0gKGVkaXRvciwgcm93KSAtPiBsaW1pdE51bWJlcihyb3csIG1pbjogMCwgbWF4OiBnZXRWaW1MYXN0QnVmZmVyUm93KGVkaXRvcikpXG5cbmdldFZhbGlkVmltU2NyZWVuUm93ID0gKGVkaXRvciwgcm93KSAtPiBsaW1pdE51bWJlcihyb3csIG1pbjogMCwgbWF4OiBnZXRWaW1MYXN0U2NyZWVuUm93KGVkaXRvcikpXG5cbiMgQnkgZGVmYXVsdCBub3QgaW5jbHVkZSBjb2x1bW5cbmdldExpbmVUZXh0VG9CdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHtyb3csIGNvbHVtbn0sIHtleGNsdXNpdmV9PXt9KSAtPlxuICBpZiBleGNsdXNpdmUgPyB0cnVlXG4gICAgZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJvdylbMC4uLmNvbHVtbl1cbiAgZWxzZVxuICAgIGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhyb3cpWzAuLmNvbHVtbl1cblxuZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3cgPSAoZWRpdG9yLCByb3cpIC0+XG4gIGVkaXRvci5pbmRlbnRMZXZlbEZvckxpbmUoZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJvdykpXG5cbmdldENvZGVGb2xkUm93UmFuZ2VzID0gKGVkaXRvcikgLT5cbiAgWzAuLmVkaXRvci5nZXRMYXN0QnVmZmVyUm93KCldXG4gICAgLm1hcCAocm93KSAtPlxuICAgICAgZWRpdG9yLmxhbmd1YWdlTW9kZS5yb3dSYW5nZUZvckNvZGVGb2xkQXRCdWZmZXJSb3cocm93KVxuICAgIC5maWx0ZXIgKHJvd1JhbmdlKSAtPlxuICAgICAgcm93UmFuZ2U/IGFuZCByb3dSYW5nZVswXT8gYW5kIHJvd1JhbmdlWzFdP1xuXG4jIFVzZWQgaW4gdm1wLWphc21pbmUtaW5jcmVhc2UtZm9jdXNcbmdldENvZGVGb2xkUm93UmFuZ2VzQ29udGFpbmVzRm9yUm93ID0gKGVkaXRvciwgYnVmZmVyUm93LCB7aW5jbHVkZVN0YXJ0Um93fT17fSkgLT5cbiAgaW5jbHVkZVN0YXJ0Um93ID89IHRydWVcbiAgZ2V0Q29kZUZvbGRSb3dSYW5nZXMoZWRpdG9yKS5maWx0ZXIgKFtzdGFydFJvdywgZW5kUm93XSkgLT5cbiAgICBpZiBpbmNsdWRlU3RhcnRSb3dcbiAgICAgIHN0YXJ0Um93IDw9IGJ1ZmZlclJvdyA8PSBlbmRSb3dcbiAgICBlbHNlXG4gICAgICBzdGFydFJvdyA8IGJ1ZmZlclJvdyA8PSBlbmRSb3dcblxuZ2V0Rm9sZFJvd1JhbmdlcyA9IChlZGl0b3IpIC0+XG4gIHNlZW4gPSB7fVxuICBbMC4uZWRpdG9yLmdldExhc3RCdWZmZXJSb3coKV1cbiAgICAubWFwIChyb3cpIC0+XG4gICAgICBlZGl0b3IubGFuZ3VhZ2VNb2RlLnJvd1JhbmdlRm9yQ29kZUZvbGRBdEJ1ZmZlclJvdyhyb3cpXG4gICAgLmZpbHRlciAocm93UmFuZ2UpIC0+XG4gICAgICByb3dSYW5nZT8gYW5kIHJvd1JhbmdlWzBdPyBhbmQgcm93UmFuZ2VbMV0/XG4gICAgLmZpbHRlciAocm93UmFuZ2UpIC0+XG4gICAgICBpZiBzZWVuW3Jvd1JhbmdlXVxuICAgICAgICBmYWxzZVxuICAgICAgZWxzZVxuICAgICAgICBzZWVuW3Jvd1JhbmdlXSA9IHRydWVcblxuZ2V0Rm9sZFJhbmdlc1dpdGhJbmRlbnQgPSAoZWRpdG9yKSAtPlxuICBnZXRGb2xkUm93UmFuZ2VzKGVkaXRvcilcbiAgICAubWFwIChbc3RhcnRSb3csIGVuZFJvd10pIC0+XG4gICAgICBpbmRlbnQgPSBlZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3coc3RhcnRSb3cpXG4gICAgICB7c3RhcnRSb3csIGVuZFJvdywgaW5kZW50fVxuXG5nZXRGb2xkSW5mb0J5S2luZCA9IChlZGl0b3IpIC0+XG4gIGZvbGRJbmZvQnlLaW5kID0ge31cblxuICB1cGRhdGVGb2xkSW5mbyA9IChraW5kLCByb3dSYW5nZVdpdGhJbmRlbnQpIC0+XG4gICAgZm9sZEluZm8gPSAoZm9sZEluZm9CeUtpbmRba2luZF0gPz0ge30pXG4gICAgZm9sZEluZm8ucm93UmFuZ2VzV2l0aEluZGVudCA/PSBbXVxuICAgIGZvbGRJbmZvLnJvd1Jhbmdlc1dpdGhJbmRlbnQucHVzaChyb3dSYW5nZVdpdGhJbmRlbnQpXG4gICAgaW5kZW50ID0gcm93UmFuZ2VXaXRoSW5kZW50LmluZGVudFxuICAgIGZvbGRJbmZvLm1pbkluZGVudCA9IE1hdGgubWluKGZvbGRJbmZvLm1pbkluZGVudCA/IGluZGVudCwgaW5kZW50KVxuICAgIGZvbGRJbmZvLm1heEluZGVudCA9IE1hdGgubWF4KGZvbGRJbmZvLm1heEluZGVudCA/IGluZGVudCwgaW5kZW50KVxuXG4gIGZvciByb3dSYW5nZVdpdGhJbmRlbnQgaW4gZ2V0Rm9sZFJhbmdlc1dpdGhJbmRlbnQoZWRpdG9yKVxuICAgIHVwZGF0ZUZvbGRJbmZvKCdhbGxGb2xkJywgcm93UmFuZ2VXaXRoSW5kZW50KVxuICAgIGlmIGVkaXRvci5pc0ZvbGRlZEF0QnVmZmVyUm93KHJvd1JhbmdlV2l0aEluZGVudC5zdGFydFJvdylcbiAgICAgIHVwZGF0ZUZvbGRJbmZvKCdmb2xkZWQnLCByb3dSYW5nZVdpdGhJbmRlbnQpXG4gICAgZWxzZVxuICAgICAgdXBkYXRlRm9sZEluZm8oJ3VuZm9sZGVkJywgcm93UmFuZ2VXaXRoSW5kZW50KVxuICBmb2xkSW5mb0J5S2luZFxuXG5nZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlID0gKGVkaXRvciwgcm93UmFuZ2UpIC0+XG4gIFtzdGFydFJhbmdlLCBlbmRSYW5nZV0gPSByb3dSYW5nZS5tYXAgKHJvdykgLT5cbiAgICBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocm93LCBpbmNsdWRlTmV3bGluZTogdHJ1ZSlcbiAgc3RhcnRSYW5nZS51bmlvbihlbmRSYW5nZSlcblxuZ2V0VG9rZW5pemVkTGluZUZvclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgZWRpdG9yLnRva2VuaXplZEJ1ZmZlci50b2tlbml6ZWRMaW5lRm9yUm93KHJvdylcblxuZ2V0U2NvcGVzRm9yVG9rZW5pemVkTGluZSA9IChsaW5lKSAtPlxuICBmb3IgdGFnIGluIGxpbmUudGFncyB3aGVuIHRhZyA8IDAgYW5kICh0YWcgJSAyIGlzIC0xKVxuICAgIGF0b20uZ3JhbW1hcnMuc2NvcGVGb3JJZCh0YWcpXG5cbnNjYW5Gb3JTY29wZVN0YXJ0ID0gKGVkaXRvciwgZnJvbVBvaW50LCBkaXJlY3Rpb24sIGZuKSAtPlxuICBmcm9tUG9pbnQgPSBQb2ludC5mcm9tT2JqZWN0KGZyb21Qb2ludClcbiAgc2NhblJvd3MgPSBzd2l0Y2ggZGlyZWN0aW9uXG4gICAgd2hlbiAnZm9yd2FyZCcgdGhlbiBbKGZyb21Qb2ludC5yb3cpLi5lZGl0b3IuZ2V0TGFzdEJ1ZmZlclJvdygpXVxuICAgIHdoZW4gJ2JhY2t3YXJkJyB0aGVuIFsoZnJvbVBvaW50LnJvdykuLjBdXG5cbiAgY29udGludWVTY2FuID0gdHJ1ZVxuICBzdG9wID0gLT5cbiAgICBjb250aW51ZVNjYW4gPSBmYWxzZVxuXG4gIGlzVmFsaWRUb2tlbiA9IHN3aXRjaCBkaXJlY3Rpb25cbiAgICB3aGVuICdmb3J3YXJkJyB0aGVuICh7cG9zaXRpb259KSAtPiBwb3NpdGlvbi5pc0dyZWF0ZXJUaGFuKGZyb21Qb2ludClcbiAgICB3aGVuICdiYWNrd2FyZCcgdGhlbiAoe3Bvc2l0aW9ufSkgLT4gcG9zaXRpb24uaXNMZXNzVGhhbihmcm9tUG9pbnQpXG5cbiAgZm9yIHJvdyBpbiBzY2FuUm93cyB3aGVuIHRva2VuaXplZExpbmUgPSBnZXRUb2tlbml6ZWRMaW5lRm9yUm93KGVkaXRvciwgcm93KVxuICAgIGNvbHVtbiA9IDBcbiAgICByZXN1bHRzID0gW11cblxuICAgIHRva2VuSXRlcmF0b3IgPSB0b2tlbml6ZWRMaW5lLmdldFRva2VuSXRlcmF0b3IoKVxuICAgIGZvciB0YWcgaW4gdG9rZW5pemVkTGluZS50YWdzXG4gICAgICB0b2tlbkl0ZXJhdG9yLm5leHQoKVxuICAgICAgaWYgdGFnIDwgMCAjIE5lZ2F0aXZlOiBzdGFydC9zdG9wIHRva2VuXG4gICAgICAgIHNjb3BlID0gYXRvbS5ncmFtbWFycy5zY29wZUZvcklkKHRhZylcbiAgICAgICAgaWYgKHRhZyAlIDIpIGlzIDAgIyBFdmVuOiBzY29wZSBzdG9wXG4gICAgICAgICAgbnVsbFxuICAgICAgICBlbHNlICMgT2RkOiBzY29wZSBzdGFydFxuICAgICAgICAgIHBvc2l0aW9uID0gbmV3IFBvaW50KHJvdywgY29sdW1uKVxuICAgICAgICAgIHJlc3VsdHMucHVzaCB7c2NvcGUsIHBvc2l0aW9uLCBzdG9wfVxuICAgICAgZWxzZVxuICAgICAgICBjb2x1bW4gKz0gdGFnXG5cbiAgICByZXN1bHRzID0gcmVzdWx0cy5maWx0ZXIoaXNWYWxpZFRva2VuKVxuICAgIHJlc3VsdHMucmV2ZXJzZSgpIGlmIGRpcmVjdGlvbiBpcyAnYmFja3dhcmQnXG4gICAgZm9yIHJlc3VsdCBpbiByZXN1bHRzXG4gICAgICBmbihyZXN1bHQpXG4gICAgICByZXR1cm4gdW5sZXNzIGNvbnRpbnVlU2NhblxuICAgIHJldHVybiB1bmxlc3MgY29udGludWVTY2FuXG5cbmRldGVjdFNjb3BlU3RhcnRQb3NpdGlvbkZvclNjb3BlID0gKGVkaXRvciwgZnJvbVBvaW50LCBkaXJlY3Rpb24sIHNjb3BlKSAtPlxuICBwb2ludCA9IG51bGxcbiAgc2NhbkZvclNjb3BlU3RhcnQgZWRpdG9yLCBmcm9tUG9pbnQsIGRpcmVjdGlvbiwgKGluZm8pIC0+XG4gICAgaWYgaW5mby5zY29wZS5zZWFyY2goc2NvcGUpID49IDBcbiAgICAgIGluZm8uc3RvcCgpXG4gICAgICBwb2ludCA9IGluZm8ucG9zaXRpb25cbiAgcG9pbnRcblxuaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgIyBbRklYTUVdIEJ1ZyBvZiB1cHN0cmVhbT9cbiAgIyBTb21ldGltZSB0b2tlbml6ZWRMaW5lcyBsZW5ndGggaXMgbGVzcyB0aGFuIGxhc3QgYnVmZmVyIHJvdy5cbiAgIyBTbyB0b2tlbml6ZWRMaW5lIGlzIG5vdCBhY2Nlc3NpYmxlIGV2ZW4gaWYgdmFsaWQgcm93LlxuICAjIEluIHRoYXQgY2FzZSBJIHNpbXBseSByZXR1cm4gZW1wdHkgQXJyYXkuXG4gIGlmIHRva2VuaXplZExpbmUgPSBnZXRUb2tlbml6ZWRMaW5lRm9yUm93KGVkaXRvciwgcm93KVxuICAgIGdldFNjb3Blc0ZvclRva2VuaXplZExpbmUodG9rZW5pemVkTGluZSkuc29tZSAoc2NvcGUpIC0+XG4gICAgICBpc0Z1bmN0aW9uU2NvcGUoZWRpdG9yLCBzY29wZSlcbiAgZWxzZVxuICAgIGZhbHNlXG5cbiMgW0ZJWE1FXSB2ZXJ5IHJvdWdoIHN0YXRlLCBuZWVkIGltcHJvdmVtZW50LlxuaXNGdW5jdGlvblNjb3BlID0gKGVkaXRvciwgc2NvcGUpIC0+XG4gIHN3aXRjaCBlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZVxuICAgIHdoZW4gJ3NvdXJjZS5nbycsICdzb3VyY2UuZWxpeGlyJ1xuICAgICAgc2NvcGVzID0gWydlbnRpdHkubmFtZS5mdW5jdGlvbiddXG4gICAgd2hlbiAnc291cmNlLnJ1YnknXG4gICAgICBzY29wZXMgPSBbJ21ldGEuZnVuY3Rpb24uJywgJ21ldGEuY2xhc3MuJywgJ21ldGEubW9kdWxlLiddXG4gICAgZWxzZVxuICAgICAgc2NvcGVzID0gWydtZXRhLmZ1bmN0aW9uLicsICdtZXRhLmNsYXNzLiddXG4gIHBhdHRlcm4gPSBuZXcgUmVnRXhwKCdeJyArIHNjb3Blcy5tYXAoXy5lc2NhcGVSZWdFeHApLmpvaW4oJ3wnKSlcbiAgcGF0dGVybi50ZXN0KHNjb3BlKVxuXG4jIFNjcm9sbCB0byBidWZmZXJQb3NpdGlvbiB3aXRoIG1pbmltdW0gYW1vdW50IHRvIGtlZXAgb3JpZ2luYWwgdmlzaWJsZSBhcmVhLlxuIyBJZiB0YXJnZXQgcG9zaXRpb24gd29uJ3QgZml0IHdpdGhpbiBvbmVQYWdlVXAgb3Igb25lUGFnZURvd24sIGl0IGNlbnRlciB0YXJnZXQgcG9pbnQuXG5zbWFydFNjcm9sbFRvQnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCkgLT5cbiAgZWRpdG9yRWxlbWVudCA9IGVkaXRvci5lbGVtZW50XG4gIGVkaXRvckFyZWFIZWlnaHQgPSBlZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKCkgKiAoZWRpdG9yLmdldFJvd3NQZXJQYWdlKCkgLSAxKVxuICBvbmVQYWdlVXAgPSBlZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcCgpIC0gZWRpdG9yQXJlYUhlaWdodCAjIE5vIG5lZWQgdG8gbGltaXQgdG8gbWluPTBcbiAgb25lUGFnZURvd24gPSBlZGl0b3JFbGVtZW50LmdldFNjcm9sbEJvdHRvbSgpICsgZWRpdG9yQXJlYUhlaWdodFxuICB0YXJnZXQgPSBlZGl0b3JFbGVtZW50LnBpeGVsUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbihwb2ludCkudG9wXG5cbiAgY2VudGVyID0gKG9uZVBhZ2VEb3duIDwgdGFyZ2V0KSBvciAodGFyZ2V0IDwgb25lUGFnZVVwKVxuICBlZGl0b3Iuc2Nyb2xsVG9CdWZmZXJQb3NpdGlvbihwb2ludCwge2NlbnRlcn0pXG5cbm1hdGNoU2NvcGVzID0gKGVkaXRvckVsZW1lbnQsIHNjb3BlcykgLT5cbiAgY2xhc3NlcyA9IHNjb3Blcy5tYXAgKHNjb3BlKSAtPiBzY29wZS5zcGxpdCgnLicpXG5cbiAgZm9yIGNsYXNzTmFtZXMgaW4gY2xhc3Nlc1xuICAgIGNvbnRhaW5zQ291bnQgPSAwXG4gICAgZm9yIGNsYXNzTmFtZSBpbiBjbGFzc05hbWVzXG4gICAgICBjb250YWluc0NvdW50ICs9IDEgaWYgZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKVxuICAgIHJldHVybiB0cnVlIGlmIGNvbnRhaW5zQ291bnQgaXMgY2xhc3NOYW1lcy5sZW5ndGhcbiAgZmFsc2VcblxuaXNTaW5nbGVMaW5lVGV4dCA9ICh0ZXh0KSAtPlxuICB0ZXh0LnNwbGl0KC9cXG58XFxyXFxuLykubGVuZ3RoIGlzIDFcblxuIyBSZXR1cm4gYnVmZmVyUmFuZ2UgYW5kIGtpbmQgWyd3aGl0ZS1zcGFjZScsICdub24td29yZCcsICd3b3JkJ11cbiNcbiMgVGhpcyBmdW5jdGlvbiBtb2RpZnkgd29yZFJlZ2V4IHNvIHRoYXQgaXQgZmVlbCBOQVRVUkFMIGluIFZpbSdzIG5vcm1hbCBtb2RlLlxuIyBJbiBub3JtYWwtbW9kZSwgY3Vyc29yIGlzIHJhY3RhbmdsZShub3QgcGlwZSh8KSBjaGFyKS5cbiMgQ3Vyc29yIGlzIGxpa2UgT04gd29yZCByYXRoZXIgdGhhbiBCRVRXRUVOIHdvcmQuXG4jIFRoZSBtb2RpZmljYXRpb24gaXMgdGFpbG9yZCBsaWtlIHRoaXNcbiMgICAtIE9OIHdoaXRlLXNwYWNlOiBJbmNsdWRzIG9ubHkgd2hpdGUtc3BhY2VzLlxuIyAgIC0gT04gbm9uLXdvcmQ6IEluY2x1ZHMgb25seSBub24gd29yZCBjaGFyKD1leGNsdWRlcyBub3JtYWwgd29yZCBjaGFyKS5cbiNcbiMgVmFsaWQgb3B0aW9uc1xuIyAgLSB3b3JkUmVnZXg6IGluc3RhbmNlIG9mIFJlZ0V4cFxuIyAgLSBub25Xb3JkQ2hhcmFjdGVyczogc3RyaW5nXG5nZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50LCBvcHRpb25zPXt9KSAtPlxuICB7c2luZ2xlTm9uV29yZENoYXIsIHdvcmRSZWdleCwgbm9uV29yZENoYXJhY3RlcnMsIGN1cnNvcn0gPSBvcHRpb25zXG4gIGlmIG5vdCB3b3JkUmVnZXg/IG9yIG5vdCBub25Xb3JkQ2hhcmFjdGVycz8gIyBDb21wbGVtZW50IGZyb20gY3Vyc29yXG4gICAgY3Vyc29yID89IGVkaXRvci5nZXRMYXN0Q3Vyc29yKClcbiAgICB7d29yZFJlZ2V4LCBub25Xb3JkQ2hhcmFjdGVyc30gPSBfLmV4dGVuZChvcHRpb25zLCBidWlsZFdvcmRQYXR0ZXJuQnlDdXJzb3IoY3Vyc29yLCBvcHRpb25zKSlcbiAgc2luZ2xlTm9uV29yZENoYXIgPz0gdHJ1ZVxuXG4gIGNoYXJhY3RlckF0UG9pbnQgPSBnZXRSaWdodENoYXJhY3RlckZvckJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgcG9pbnQpXG4gIG5vbldvcmRSZWdleCA9IG5ldyBSZWdFeHAoXCJbI3tfLmVzY2FwZVJlZ0V4cChub25Xb3JkQ2hhcmFjdGVycyl9XStcIilcblxuICBpZiAvXFxzLy50ZXN0KGNoYXJhY3RlckF0UG9pbnQpXG4gICAgc291cmNlID0gXCJbXFx0IF0rXCJcbiAgICBraW5kID0gJ3doaXRlLXNwYWNlJ1xuICAgIHdvcmRSZWdleCA9IG5ldyBSZWdFeHAoc291cmNlKVxuICBlbHNlIGlmIG5vbldvcmRSZWdleC50ZXN0KGNoYXJhY3RlckF0UG9pbnQpIGFuZCBub3Qgd29yZFJlZ2V4LnRlc3QoY2hhcmFjdGVyQXRQb2ludClcbiAgICBraW5kID0gJ25vbi13b3JkJ1xuICAgIGlmIHNpbmdsZU5vbldvcmRDaGFyXG4gICAgICBzb3VyY2UgPSBfLmVzY2FwZVJlZ0V4cChjaGFyYWN0ZXJBdFBvaW50KVxuICAgICAgd29yZFJlZ2V4ID0gbmV3IFJlZ0V4cChzb3VyY2UpXG4gICAgZWxzZVxuICAgICAgd29yZFJlZ2V4ID0gbm9uV29yZFJlZ2V4XG4gIGVsc2VcbiAgICBraW5kID0gJ3dvcmQnXG5cbiAgcmFuZ2UgPSBnZXRXb3JkQnVmZmVyUmFuZ2VBdEJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgcG9pbnQsIHt3b3JkUmVnZXh9KVxuICB7a2luZCwgcmFuZ2V9XG5cbmdldFdvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50LCBvcHRpb25zPXt9KSAtPlxuICBib3VuZGFyaXplRm9yV29yZCA9IG9wdGlvbnMuYm91bmRhcml6ZUZvcldvcmQgPyB0cnVlXG4gIGRlbGV0ZSBvcHRpb25zLmJvdW5kYXJpemVGb3JXb3JkXG4gIHtyYW5nZSwga2luZH0gPSBnZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbihlZGl0b3IsIHBvaW50LCBvcHRpb25zKVxuICB0ZXh0ID0gZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKVxuICBwYXR0ZXJuID0gXy5lc2NhcGVSZWdFeHAodGV4dClcblxuICBpZiBraW5kIGlzICd3b3JkJyBhbmQgYm91bmRhcml6ZUZvcldvcmRcbiAgICAjIFNldCB3b3JkLWJvdW5kYXJ5KCBcXGIgKSBhbmNob3Igb25seSB3aGVuIGl0J3MgZWZmZWN0aXZlICM2ODlcbiAgICBzdGFydEJvdW5kYXJ5ID0gaWYgL15cXHcvLnRlc3QodGV4dCkgdGhlbiBcIlxcXFxiXCIgZWxzZSAnJ1xuICAgIGVuZEJvdW5kYXJ5ID0gaWYgL1xcdyQvLnRlc3QodGV4dCkgdGhlbiBcIlxcXFxiXCIgZWxzZSAnJ1xuICAgIHBhdHRlcm4gPSBzdGFydEJvdW5kYXJ5ICsgcGF0dGVybiArIGVuZEJvdW5kYXJ5XG4gIG5ldyBSZWdFeHAocGF0dGVybiwgJ2cnKVxuXG5nZXRTdWJ3b3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCwgb3B0aW9ucz17fSkgLT5cbiAgb3B0aW9ucyA9IHt3b3JkUmVnZXg6IGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuc3Vid29yZFJlZ0V4cCgpLCBib3VuZGFyaXplRm9yV29yZDogZmFsc2V9XG4gIGdldFdvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvbihlZGl0b3IsIHBvaW50LCBvcHRpb25zKVxuXG4jIFJldHVybiBvcHRpb25zIHVzZWQgZm9yIGdldFdvcmRCdWZmZXJSYW5nZUF0QnVmZmVyUG9zaXRpb25cbmJ1aWxkV29yZFBhdHRlcm5CeUN1cnNvciA9IChjdXJzb3IsIHt3b3JkUmVnZXh9KSAtPlxuICBub25Xb3JkQ2hhcmFjdGVycyA9IGdldE5vbldvcmRDaGFyYWN0ZXJzRm9yQ3Vyc29yKGN1cnNvcilcbiAgd29yZFJlZ2V4ID89IG5ldyBSZWdFeHAoXCJeW1xcdCBdKiR8W15cXFxccyN7Xy5lc2NhcGVSZWdFeHAobm9uV29yZENoYXJhY3RlcnMpfV0rXCIpXG4gIHt3b3JkUmVnZXgsIG5vbldvcmRDaGFyYWN0ZXJzfVxuXG5nZXRCZWdpbm5pbmdPZldvcmRCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50LCB7d29yZFJlZ2V4fT17fSkgLT5cbiAgc2NhblJhbmdlID0gW1twb2ludC5yb3csIDBdLCBwb2ludF1cblxuICBmb3VuZCA9IG51bGxcbiAgZWRpdG9yLmJhY2t3YXJkc1NjYW5JbkJ1ZmZlclJhbmdlIHdvcmRSZWdleCwgc2NhblJhbmdlLCAoe3JhbmdlLCBtYXRjaFRleHQsIHN0b3B9KSAtPlxuICAgIHJldHVybiBpZiBtYXRjaFRleHQgaXMgJycgYW5kIHJhbmdlLnN0YXJ0LmNvbHVtbiBpc250IDBcblxuICAgIGlmIHJhbmdlLnN0YXJ0LmlzTGVzc1RoYW4ocG9pbnQpXG4gICAgICBpZiByYW5nZS5lbmQuaXNHcmVhdGVyVGhhbk9yRXF1YWwocG9pbnQpXG4gICAgICAgIGZvdW5kID0gcmFuZ2Uuc3RhcnRcbiAgICAgIHN0b3AoKVxuXG4gIGZvdW5kID8gcG9pbnRcblxuZ2V0RW5kT2ZXb3JkQnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCwge3dvcmRSZWdleH09e30pIC0+XG4gIHNjYW5SYW5nZSA9IFtwb2ludCwgW3BvaW50LnJvdywgSW5maW5pdHldXVxuXG4gIGZvdW5kID0gbnVsbFxuICBlZGl0b3Iuc2NhbkluQnVmZmVyUmFuZ2Ugd29yZFJlZ2V4LCBzY2FuUmFuZ2UsICh7cmFuZ2UsIG1hdGNoVGV4dCwgc3RvcH0pIC0+XG4gICAgcmV0dXJuIGlmIG1hdGNoVGV4dCBpcyAnJyBhbmQgcmFuZ2Uuc3RhcnQuY29sdW1uIGlzbnQgMFxuXG4gICAgaWYgcmFuZ2UuZW5kLmlzR3JlYXRlclRoYW4ocG9pbnQpXG4gICAgICBpZiByYW5nZS5zdGFydC5pc0xlc3NUaGFuT3JFcXVhbChwb2ludClcbiAgICAgICAgZm91bmQgPSByYW5nZS5lbmRcbiAgICAgIHN0b3AoKVxuXG4gIGZvdW5kID8gcG9pbnRcblxuZ2V0V29yZEJ1ZmZlclJhbmdlQXRCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvc2l0aW9uLCBvcHRpb25zPXt9KSAtPlxuICBlbmRQb3NpdGlvbiA9IGdldEVuZE9mV29yZEJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgcG9zaXRpb24sIG9wdGlvbnMpXG4gIHN0YXJ0UG9zaXRpb24gPSBnZXRCZWdpbm5pbmdPZldvcmRCdWZmZXJQb3NpdGlvbihlZGl0b3IsIGVuZFBvc2l0aW9uLCBvcHRpb25zKVxuICBuZXcgUmFuZ2Uoc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24pXG5cbiMgV2hlbiByYW5nZSBpcyBsaW5ld2lzZSByYW5nZSwgcmFuZ2UgZW5kIGhhdmUgY29sdW1uIDAgb2YgTkVYVCByb3cuXG4jIFdoaWNoIGlzIHZlcnkgdW5pbnR1aXRpdmUgYW5kIHVud2FudGVkIHJlc3VsdC5cbnNocmlua1JhbmdlRW5kVG9CZWZvcmVOZXdMaW5lID0gKHJhbmdlKSAtPlxuICB7c3RhcnQsIGVuZH0gPSByYW5nZVxuICBpZiBlbmQuY29sdW1uIGlzIDBcbiAgICBlbmRSb3cgPSBsaW1pdE51bWJlcihlbmQucm93IC0gMSwgbWluOiBzdGFydC5yb3cpXG4gICAgbmV3IFJhbmdlKHN0YXJ0LCBbZW5kUm93LCBJbmZpbml0eV0pXG4gIGVsc2VcbiAgICByYW5nZVxuXG5zY2FuRWRpdG9yID0gKGVkaXRvciwgcGF0dGVybikgLT5cbiAgcmFuZ2VzID0gW11cbiAgZWRpdG9yLnNjYW4gcGF0dGVybiwgKHtyYW5nZX0pIC0+XG4gICAgcmFuZ2VzLnB1c2gocmFuZ2UpXG4gIHJhbmdlc1xuXG5jb2xsZWN0UmFuZ2VJbkJ1ZmZlclJvdyA9IChlZGl0b3IsIHJvdywgcGF0dGVybikgLT5cbiAgcmFuZ2VzID0gW11cbiAgc2NhblJhbmdlID0gZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHJvdylcbiAgZWRpdG9yLnNjYW5JbkJ1ZmZlclJhbmdlIHBhdHRlcm4sIHNjYW5SYW5nZSwgKHtyYW5nZX0pIC0+XG4gICAgcmFuZ2VzLnB1c2gocmFuZ2UpXG4gIHJhbmdlc1xuXG5maW5kUmFuZ2VJbkJ1ZmZlclJvdyA9IChlZGl0b3IsIHBhdHRlcm4sIHJvdywge2RpcmVjdGlvbn09e30pIC0+XG4gIGlmIGRpcmVjdGlvbiBpcyAnYmFja3dhcmQnXG4gICAgc2NhbkZ1bmN0aW9uTmFtZSA9ICdiYWNrd2FyZHNTY2FuSW5CdWZmZXJSYW5nZSdcbiAgZWxzZVxuICAgIHNjYW5GdW5jdGlvbk5hbWUgPSAnc2NhbkluQnVmZmVyUmFuZ2UnXG5cbiAgcmFuZ2UgPSBudWxsXG4gIHNjYW5SYW5nZSA9IGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhyb3cpXG4gIGVkaXRvcltzY2FuRnVuY3Rpb25OYW1lXSBwYXR0ZXJuLCBzY2FuUmFuZ2UsIChldmVudCkgLT4gcmFuZ2UgPSBldmVudC5yYW5nZVxuICByYW5nZVxuXG5nZXRMYXJnZXN0Rm9sZFJhbmdlQ29udGFpbnNCdWZmZXJSb3cgPSAoZWRpdG9yLCByb3cpIC0+XG4gIG1hcmtlcnMgPSBlZGl0b3IuZGlzcGxheUxheWVyLmZvbGRzTWFya2VyTGF5ZXIuZmluZE1hcmtlcnMoaW50ZXJzZWN0c1Jvdzogcm93KVxuXG4gIHN0YXJ0UG9pbnQgPSBudWxsXG4gIGVuZFBvaW50ID0gbnVsbFxuXG4gIGZvciBtYXJrZXIgaW4gbWFya2VycyA/IFtdXG4gICAge3N0YXJ0LCBlbmR9ID0gbWFya2VyLmdldFJhbmdlKClcbiAgICB1bmxlc3Mgc3RhcnRQb2ludFxuICAgICAgc3RhcnRQb2ludCA9IHN0YXJ0XG4gICAgICBlbmRQb2ludCA9IGVuZFxuICAgICAgY29udGludWVcblxuICAgIGlmIHN0YXJ0LmlzTGVzc1RoYW4oc3RhcnRQb2ludClcbiAgICAgIHN0YXJ0UG9pbnQgPSBzdGFydFxuICAgICAgZW5kUG9pbnQgPSBlbmRcblxuICBpZiBzdGFydFBvaW50PyBhbmQgZW5kUG9pbnQ/XG4gICAgbmV3IFJhbmdlKHN0YXJ0UG9pbnQsIGVuZFBvaW50KVxuXG4jIHRha2UgYnVmZmVyUG9zaXRpb25cbnRyYW5zbGF0ZVBvaW50QW5kQ2xpcCA9IChlZGl0b3IsIHBvaW50LCBkaXJlY3Rpb24pIC0+XG4gIHBvaW50ID0gUG9pbnQuZnJvbU9iamVjdChwb2ludClcblxuICBkb250Q2xpcCA9IGZhbHNlXG4gIHN3aXRjaCBkaXJlY3Rpb25cbiAgICB3aGVuICdmb3J3YXJkJ1xuICAgICAgcG9pbnQgPSBwb2ludC50cmFuc2xhdGUoWzAsICsxXSlcbiAgICAgIGVvbCA9IGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhwb2ludC5yb3cpLmVuZFxuXG4gICAgICBpZiBwb2ludC5pc0VxdWFsKGVvbClcbiAgICAgICAgZG9udENsaXAgPSB0cnVlXG4gICAgICBlbHNlIGlmIHBvaW50LmlzR3JlYXRlclRoYW4oZW9sKVxuICAgICAgICBkb250Q2xpcCA9IHRydWVcbiAgICAgICAgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnQucm93ICsgMSwgMCkgIyBtb3ZlIHBvaW50IHRvIG5ldy1saW5lIHNlbGVjdGVkIHBvaW50XG5cbiAgICAgIHBvaW50ID0gUG9pbnQubWluKHBvaW50LCBlZGl0b3IuZ2V0RW9mQnVmZmVyUG9zaXRpb24oKSlcblxuICAgIHdoZW4gJ2JhY2t3YXJkJ1xuICAgICAgcG9pbnQgPSBwb2ludC50cmFuc2xhdGUoWzAsIC0xXSlcblxuICAgICAgaWYgcG9pbnQuY29sdW1uIDwgMFxuICAgICAgICBkb250Q2xpcCA9IHRydWVcbiAgICAgICAgbmV3Um93ID0gcG9pbnQucm93IC0gMVxuICAgICAgICBlb2wgPSBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cobmV3Um93KS5lbmRcbiAgICAgICAgcG9pbnQgPSBuZXcgUG9pbnQobmV3Um93LCBlb2wuY29sdW1uKVxuXG4gICAgICBwb2ludCA9IFBvaW50Lm1heChwb2ludCwgUG9pbnQuWkVSTylcblxuICBpZiBkb250Q2xpcFxuICAgIHBvaW50XG4gIGVsc2VcbiAgICBzY3JlZW5Qb2ludCA9IGVkaXRvci5zY3JlZW5Qb3NpdGlvbkZvckJ1ZmZlclBvc2l0aW9uKHBvaW50LCBjbGlwRGlyZWN0aW9uOiBkaXJlY3Rpb24pXG4gICAgZWRpdG9yLmJ1ZmZlclBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oc2NyZWVuUG9pbnQpXG5cbmdldFJhbmdlQnlUcmFuc2xhdGVQb2ludEFuZENsaXAgPSAoZWRpdG9yLCByYW5nZSwgd2hpY2gsIGRpcmVjdGlvbikgLT5cbiAgbmV3UG9pbnQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAoZWRpdG9yLCByYW5nZVt3aGljaF0sIGRpcmVjdGlvbilcbiAgc3dpdGNoIHdoaWNoXG4gICAgd2hlbiAnc3RhcnQnXG4gICAgICBuZXcgUmFuZ2UobmV3UG9pbnQsIHJhbmdlLmVuZClcbiAgICB3aGVuICdlbmQnXG4gICAgICBuZXcgUmFuZ2UocmFuZ2Uuc3RhcnQsIG5ld1BvaW50KVxuXG5nZXRQYWNrYWdlID0gKG5hbWUsIGZuKSAtPlxuICBuZXcgUHJvbWlzZSAocmVzb2x2ZSkgLT5cbiAgICBpZiBhdG9tLnBhY2thZ2VzLmlzUGFja2FnZUFjdGl2ZShuYW1lKVxuICAgICAgcGtnID0gYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKG5hbWUpXG4gICAgICByZXNvbHZlKHBrZylcbiAgICBlbHNlXG4gICAgICBkaXNwb3NhYmxlID0gYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlUGFja2FnZSAocGtnKSAtPlxuICAgICAgICBpZiBwa2cubmFtZSBpcyBuYW1lXG4gICAgICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICAgICAgICByZXNvbHZlKHBrZylcblxuc2VhcmNoQnlQcm9qZWN0RmluZCA9IChlZGl0b3IsIHRleHQpIC0+XG4gIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yLmVsZW1lbnQsICdwcm9qZWN0LWZpbmQ6c2hvdycpXG4gIGdldFBhY2thZ2UoJ2ZpbmQtYW5kLXJlcGxhY2UnKS50aGVuIChwa2cpIC0+XG4gICAge3Byb2plY3RGaW5kVmlld30gPSBwa2cubWFpbk1vZHVsZVxuICAgIGlmIHByb2plY3RGaW5kVmlldz9cbiAgICAgIHByb2plY3RGaW5kVmlldy5maW5kRWRpdG9yLnNldFRleHQodGV4dClcbiAgICAgIHByb2plY3RGaW5kVmlldy5jb25maXJtKClcblxubGltaXROdW1iZXIgPSAobnVtYmVyLCB7bWF4LCBtaW59PXt9KSAtPlxuICBudW1iZXIgPSBNYXRoLm1pbihudW1iZXIsIG1heCkgaWYgbWF4P1xuICBudW1iZXIgPSBNYXRoLm1heChudW1iZXIsIG1pbikgaWYgbWluP1xuICBudW1iZXJcblxuZmluZFJhbmdlQ29udGFpbnNQb2ludCA9IChyYW5nZXMsIHBvaW50KSAtPlxuICBmb3IgcmFuZ2UgaW4gcmFuZ2VzIHdoZW4gcmFuZ2UuY29udGFpbnNQb2ludChwb2ludClcbiAgICByZXR1cm4gcmFuZ2VcbiAgbnVsbFxuXG5uZWdhdGVGdW5jdGlvbiA9IChmbikgLT5cbiAgKGFyZ3MuLi4pIC0+XG4gICAgbm90IGZuKGFyZ3MuLi4pXG5cbmlzRW1wdHkgPSAodGFyZ2V0KSAtPiB0YXJnZXQuaXNFbXB0eSgpXG5pc05vdEVtcHR5ID0gbmVnYXRlRnVuY3Rpb24oaXNFbXB0eSlcblxuaXNTaW5nbGVMaW5lUmFuZ2UgPSAocmFuZ2UpIC0+IHJhbmdlLmlzU2luZ2xlTGluZSgpXG5pc05vdFNpbmdsZUxpbmVSYW5nZSA9IG5lZ2F0ZUZ1bmN0aW9uKGlzU2luZ2xlTGluZVJhbmdlKVxuXG5pc0xlYWRpbmdXaGl0ZVNwYWNlUmFuZ2UgPSAoZWRpdG9yLCByYW5nZSkgLT4gL15bXFx0IF0qJC8udGVzdChlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UpKVxuaXNOb3RMZWFkaW5nV2hpdGVTcGFjZVJhbmdlID0gbmVnYXRlRnVuY3Rpb24oaXNMZWFkaW5nV2hpdGVTcGFjZVJhbmdlKVxuXG5pc0VzY2FwZWRDaGFyUmFuZ2UgPSAoZWRpdG9yLCByYW5nZSkgLT5cbiAgcmFuZ2UgPSBSYW5nZS5mcm9tT2JqZWN0KHJhbmdlKVxuICBjaGFycyA9IGdldExlZnRDaGFyYWN0ZXJGb3JCdWZmZXJQb3NpdGlvbihlZGl0b3IsIHJhbmdlLnN0YXJ0LCAyKVxuICBjaGFycy5lbmRzV2l0aCgnXFxcXCcpIGFuZCBub3QgY2hhcnMuZW5kc1dpdGgoJ1xcXFxcXFxcJylcblxuaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCwgdGV4dCkgLT5cbiAgZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKFtwb2ludCwgcG9pbnRdLCB0ZXh0KVxuXG5lbnN1cmVFbmRzV2l0aE5ld0xpbmVGb3JCdWZmZXJSb3cgPSAoZWRpdG9yLCByb3cpIC0+XG4gIHVubGVzcyBpc0VuZHNXaXRoTmV3TGluZUZvckJ1ZmZlclJvdyhlZGl0b3IsIHJvdylcbiAgICBlb2wgPSBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3coZWRpdG9yLCByb3cpXG4gICAgaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb24oZWRpdG9yLCBlb2wsIFwiXFxuXCIpXG5cbmZvckVhY2hQYW5lQXhpcyA9IChiYXNlLCBmbikgLT5cbiAgaWYgYmFzZS5jaGlsZHJlbj9cbiAgICBmbihiYXNlKVxuXG4gICAgZm9yIGNoaWxkIGluIGJhc2UuY2hpbGRyZW5cbiAgICAgIGZvckVhY2hQYW5lQXhpcyhjaGlsZCwgZm4pXG5cbm1vZGlmeUNsYXNzTGlzdCA9IChhY3Rpb24sIGVsZW1lbnQsIGNsYXNzTmFtZXMuLi4pIC0+XG4gIGVsZW1lbnQuY2xhc3NMaXN0W2FjdGlvbl0oY2xhc3NOYW1lcy4uLilcblxuYWRkQ2xhc3NMaXN0ID0gbW9kaWZ5Q2xhc3NMaXN0LmJpbmQobnVsbCwgJ2FkZCcpXG5yZW1vdmVDbGFzc0xpc3QgPSBtb2RpZnlDbGFzc0xpc3QuYmluZChudWxsLCAncmVtb3ZlJylcbnRvZ2dsZUNsYXNzTGlzdCA9IG1vZGlmeUNsYXNzTGlzdC5iaW5kKG51bGwsICd0b2dnbGUnKVxuXG50b2dnbGVDYXNlRm9yQ2hhcmFjdGVyID0gKGNoYXIpIC0+XG4gIGNoYXJMb3dlciA9IGNoYXIudG9Mb3dlckNhc2UoKVxuICBpZiBjaGFyTG93ZXIgaXMgY2hhclxuICAgIGNoYXIudG9VcHBlckNhc2UoKVxuICBlbHNlXG4gICAgY2hhckxvd2VyXG5cbnNwbGl0VGV4dEJ5TmV3TGluZSA9ICh0ZXh0KSAtPlxuICBpZiB0ZXh0LmVuZHNXaXRoKFwiXFxuXCIpXG4gICAgdGV4dC50cmltUmlnaHQoKS5zcGxpdCgvXFxyP1xcbi9nKVxuICBlbHNlXG4gICAgdGV4dC5zcGxpdCgvXFxyP1xcbi9nKVxuXG5yZXBsYWNlRGVjb3JhdGlvbkNsYXNzQnkgPSAoZm4sIGRlY29yYXRpb24pIC0+XG4gIHByb3BzID0gZGVjb3JhdGlvbi5nZXRQcm9wZXJ0aWVzKClcbiAgZGVjb3JhdGlvbi5zZXRQcm9wZXJ0aWVzKF8uZGVmYXVsdHMoe2NsYXNzOiBmbihwcm9wcy5jbGFzcyl9LCBwcm9wcykpXG5cbiMgTW9kaWZ5IHJhbmdlIHVzZWQgZm9yIHVuZG8vcmVkbyBmbGFzaCBoaWdobGlnaHQgdG8gbWFrZSBpdCBmZWVsIG5hdHVyYWxseSBmb3IgaHVtYW4uXG4jICAtIFRyaW0gc3RhcnRpbmcgbmV3IGxpbmUoXCJcXG5cIilcbiMgICAgIFwiXFxuYWJjXCIgLT4gXCJhYmNcIlxuIyAgLSBJZiByYW5nZS5lbmQgaXMgRU9MIGV4dGVuZCByYW5nZSB0byBmaXJzdCBjb2x1bW4gb2YgbmV4dCBsaW5lLlxuIyAgICAgXCJhYmNcIiAtPiBcImFiY1xcblwiXG4jIGUuZy5cbiMgLSB3aGVuICdjJyBpcyBhdEVPTDogXCJcXG5hYmNcIiAtPiBcImFiY1xcblwiXG4jIC0gd2hlbiAnYycgaXMgTk9UIGF0RU9MOiBcIlxcbmFiY1wiIC0+IFwiYWJjXCJcbiNcbiMgU28gYWx3YXlzIHRyaW0gaW5pdGlhbCBcIlxcblwiIHBhcnQgcmFuZ2UgYmVjYXVzZSBmbGFzaGluZyB0cmFpbGluZyBsaW5lIGlzIGNvdW50ZXJpbnR1aXRpdmUuXG5odW1hbml6ZUJ1ZmZlclJhbmdlID0gKGVkaXRvciwgcmFuZ2UpIC0+XG4gIGlmIGlzU2luZ2xlTGluZVJhbmdlKHJhbmdlKSBvciBpc0xpbmV3aXNlUmFuZ2UocmFuZ2UpXG4gICAgcmV0dXJuIHJhbmdlXG5cbiAge3N0YXJ0LCBlbmR9ID0gcmFuZ2VcbiAgaWYgcG9pbnRJc0F0RW5kT2ZMaW5lKGVkaXRvciwgc3RhcnQpXG4gICAgbmV3U3RhcnQgPSBzdGFydC50cmF2ZXJzZShbMSwgMF0pXG5cbiAgaWYgcG9pbnRJc0F0RW5kT2ZMaW5lKGVkaXRvciwgZW5kKVxuICAgIG5ld0VuZCA9IGVuZC50cmF2ZXJzZShbMSwgMF0pXG5cbiAgaWYgbmV3U3RhcnQ/IG9yIG5ld0VuZD9cbiAgICBuZXcgUmFuZ2UobmV3U3RhcnQgPyBzdGFydCwgbmV3RW5kID8gZW5kKVxuICBlbHNlXG4gICAgcmFuZ2VcblxuIyBFeHBhbmQgcmFuZ2UgdG8gd2hpdGUgc3BhY2VcbiMgIDEuIEV4cGFuZCB0byBmb3J3YXJkIGRpcmVjdGlvbiwgaWYgc3VjZWVkIHJldHVybiBuZXcgcmFuZ2UuXG4jICAyLiBFeHBhbmQgdG8gYmFja3dhcmQgZGlyZWN0aW9uLCBpZiBzdWNjZWVkIHJldHVybiBuZXcgcmFuZ2UuXG4jICAzLiBXaGVuIGZhaWxkIHRvIGV4cGFuZCBlaXRoZXIgZGlyZWN0aW9uLCByZXR1cm4gb3JpZ2luYWwgcmFuZ2UuXG5leHBhbmRSYW5nZVRvV2hpdGVTcGFjZXMgPSAoZWRpdG9yLCByYW5nZSkgLT5cbiAge3N0YXJ0LCBlbmR9ID0gcmFuZ2VcblxuICBuZXdFbmQgPSBudWxsXG4gIHNjYW5SYW5nZSA9IFtlbmQsIGdldEVuZE9mTGluZUZvckJ1ZmZlclJvdyhlZGl0b3IsIGVuZC5yb3cpXVxuICBlZGl0b3Iuc2NhbkluQnVmZmVyUmFuZ2UgL1xcUy8sIHNjYW5SYW5nZSwgKHtyYW5nZX0pIC0+IG5ld0VuZCA9IHJhbmdlLnN0YXJ0XG5cbiAgaWYgbmV3RW5kPy5pc0dyZWF0ZXJUaGFuKGVuZClcbiAgICByZXR1cm4gbmV3IFJhbmdlKHN0YXJ0LCBuZXdFbmQpXG5cbiAgbmV3U3RhcnQgPSBudWxsXG4gIHNjYW5SYW5nZSA9IFtbc3RhcnQucm93LCAwXSwgcmFuZ2Uuc3RhcnRdXG4gIGVkaXRvci5iYWNrd2FyZHNTY2FuSW5CdWZmZXJSYW5nZSAvXFxTLywgc2NhblJhbmdlLCAoe3JhbmdlfSkgLT4gbmV3U3RhcnQgPSByYW5nZS5lbmRcblxuICBpZiBuZXdTdGFydD8uaXNMZXNzVGhhbihzdGFydClcbiAgICByZXR1cm4gbmV3IFJhbmdlKG5ld1N0YXJ0LCBlbmQpXG5cbiAgcmV0dXJuIHJhbmdlICMgZmFsbGJhY2tcblxuIyBTcGxpdCBhbmQgam9pbiBhZnRlciBtdXRhdGUgaXRlbSBieSBjYWxsYmFjayB3aXRoIGtlZXAgb3JpZ2luYWwgc2VwYXJhdG9yIHVuY2hhbmdlZC5cbiNcbiMgMS4gVHJpbSBsZWFkaW5nIGFuZCB0cmFpbmxpbmcgd2hpdGUgc3BhY2VzIGFuZCByZW1lbWJlclxuIyAxLiBTcGxpdCB0ZXh0IHdpdGggZ2l2ZW4gcGF0dGVybiBhbmQgcmVtZW1iZXIgb3JpZ2luYWwgc2VwYXJhdG9ycy5cbiMgMi4gQ2hhbmdlIG9yZGVyIGJ5IGNhbGxiYWNrXG4jIDMuIEpvaW4gd2l0aCBvcmlnaW5hbCBzcGVhcmF0b3IgYW5kIGNvbmNhdCB3aXRoIHJlbWVtYmVyZWQgbGVhZGluZyBhbmQgdHJhaW5saW5nIHdoaXRlIHNwYWNlcy5cbiNcbnNwbGl0QW5kSm9pbkJ5ID0gKHRleHQsIHBhdHRlcm4sIGZuKSAtPlxuICBsZWFkaW5nU3BhY2VzID0gdHJhaWxpbmdTcGFjZXMgPSAnJ1xuICBzdGFydCA9IHRleHQuc2VhcmNoKC9cXFMvKVxuICBlbmQgPSB0ZXh0LnNlYXJjaCgvXFxzKiQvKVxuICBsZWFkaW5nU3BhY2VzID0gdHJhaWxpbmdTcGFjZXMgPSAnJ1xuICBsZWFkaW5nU3BhY2VzID0gdGV4dFswLi4uc3RhcnRdIGlmIHN0YXJ0IGlzbnQgLTFcbiAgdHJhaWxpbmdTcGFjZXMgPSB0ZXh0W2VuZC4uLl0gaWYgZW5kIGlzbnQgLTFcbiAgdGV4dCA9IHRleHRbc3RhcnQuLi5lbmRdXG5cbiAgZmxhZ3MgPSAnZydcbiAgZmxhZ3MgKz0gJ2knIGlmIHBhdHRlcm4uaWdub3JlQ2FzZVxuICByZWdleHAgPSBuZXcgUmVnRXhwKFwiKCN7cGF0dGVybi5zb3VyY2V9KVwiLCBmbGFncylcbiAgIyBlLmcuXG4gICMgV2hlbiB0ZXh0ID0gXCJhLCBiLCBjXCIsIHBhdHRlcm4gPSAvLD9cXHMrL1xuICAjICAgaXRlbXMgPSBbJ2EnLCAnYicsICdjJ10sIHNwZWFyYXRvcnMgPSBbJywgJywgJywgJ11cbiAgIyBXaGVuIHRleHQgPSBcImEgYlxcbiBjXCIsIHBhdHRlcm4gPSAvLD9cXHMrL1xuICAjICAgaXRlbXMgPSBbJ2EnLCAnYicsICdjJ10sIHNwZWFyYXRvcnMgPSBbJyAnLCAnXFxuICddXG4gIGl0ZW1zID0gW11cbiAgc2VwYXJhdG9ycyA9IFtdXG4gIGZvciBzZWdtZW50LCBpIGluIHRleHQuc3BsaXQocmVnZXhwKVxuICAgIGlmIGkgJSAyIGlzIDBcbiAgICAgIGl0ZW1zLnB1c2goc2VnbWVudClcbiAgICBlbHNlXG4gICAgICBzZXBhcmF0b3JzLnB1c2goc2VnbWVudClcbiAgc2VwYXJhdG9ycy5wdXNoKCcnKVxuICBpdGVtcyA9IGZuKGl0ZW1zKVxuICByZXN1bHQgPSAnJ1xuICBmb3IgW2l0ZW0sIHNlcGFyYXRvcl0gaW4gXy56aXAoaXRlbXMsIHNlcGFyYXRvcnMpXG4gICAgcmVzdWx0ICs9IGl0ZW0gKyBzZXBhcmF0b3JcbiAgbGVhZGluZ1NwYWNlcyArIHJlc3VsdCArIHRyYWlsaW5nU3BhY2VzXG5cbmNsYXNzIEFyZ3VtZW50c1NwbGl0dGVyXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBhbGxUb2tlbnMgPSBbXVxuICAgIEBjdXJyZW50U2VjdGlvbiA9IG51bGxcblxuICBzZXR0bGVQZW5kaW5nOiAtPlxuICAgIGlmIEBwZW5kaW5nVG9rZW5cbiAgICAgIEBhbGxUb2tlbnMucHVzaCh7dGV4dDogQHBlbmRpbmdUb2tlbiwgdHlwZTogQGN1cnJlbnRTZWN0aW9ufSlcbiAgICAgIEBwZW5kaW5nVG9rZW4gPSAnJ1xuXG4gIGNoYW5nZVNlY3Rpb246IChuZXdTZWN0aW9uKSAtPlxuICAgIGlmIEBjdXJyZW50U2VjdGlvbiBpc250IG5ld1NlY3Rpb25cbiAgICAgIEBzZXR0bGVQZW5kaW5nKCkgaWYgQGN1cnJlbnRTZWN0aW9uXG4gICAgICBAY3VycmVudFNlY3Rpb24gPSBuZXdTZWN0aW9uXG5cbnNwbGl0QXJndW1lbnRzID0gKHRleHQsIGpvaW5TcGFjZVNlcGFyYXRlZFRva2VuKSAtPlxuICBqb2luU3BhY2VTZXBhcmF0ZWRUb2tlbiA/PSB0cnVlXG4gIHNlcGFyYXRvckNoYXJzID0gXCJcXHQsIFxcclxcblwiXG4gIHF1b3RlQ2hhcnMgPSBcIlxcXCInYFwiXG4gIGNsb3NlQ2hhclRvT3BlbkNoYXIgPSB7XG4gICAgXCIpXCI6IFwiKFwiXG4gICAgXCJ9XCI6IFwie1wiXG4gICAgXCJdXCI6IFwiW1wiXG4gIH1cbiAgY2xvc2VQYWlyQ2hhcnMgPSBfLmtleXMoY2xvc2VDaGFyVG9PcGVuQ2hhcikuam9pbignJylcbiAgb3BlblBhaXJDaGFycyA9IF8udmFsdWVzKGNsb3NlQ2hhclRvT3BlbkNoYXIpLmpvaW4oJycpXG4gIGVzY2FwZUNoYXIgPSBcIlxcXFxcIlxuXG4gIHBlbmRpbmdUb2tlbiA9ICcnXG4gIGluUXVvdGUgPSBmYWxzZVxuICBpc0VzY2FwZWQgPSBmYWxzZVxuICAjIFBhcnNlIHRleHQgYXMgbGlzdCBvZiB0b2tlbnMgd2hpY2ggaXMgY29tbW1hIHNlcGFyYXRlZCBvciB3aGl0ZSBzcGFjZSBzZXBhcmF0ZWQuXG4gICMgZS5nLiAnYSwgZnVuMShiLCBjKSwgZCcgPT4gWydhJywgJ2Z1bjEoYiwgYyksICdkJ11cbiAgIyBOb3QgcGVyZmVjdC4gYnV0IGZhciBiZXR0ZXIgdGhhbiBzaW1wbGUgc3RyaW5nIHNwbGl0IGJ5IHJlZ2V4IHBhdHRlcm4uXG4gIGFsbFRva2VucyA9IFtdXG4gIGN1cnJlbnRTZWN0aW9uID0gbnVsbFxuXG4gIHNldHRsZVBlbmRpbmcgPSAtPlxuICAgIGlmIHBlbmRpbmdUb2tlblxuICAgICAgYWxsVG9rZW5zLnB1c2goe3RleHQ6IHBlbmRpbmdUb2tlbiwgdHlwZTogY3VycmVudFNlY3Rpb259KVxuICAgICAgcGVuZGluZ1Rva2VuID0gJydcblxuICBjaGFuZ2VTZWN0aW9uID0gKG5ld1NlY3Rpb24pIC0+XG4gICAgaWYgY3VycmVudFNlY3Rpb24gaXNudCBuZXdTZWN0aW9uXG4gICAgICBzZXR0bGVQZW5kaW5nKCkgaWYgY3VycmVudFNlY3Rpb25cbiAgICAgIGN1cnJlbnRTZWN0aW9uID0gbmV3U2VjdGlvblxuXG4gIHBhaXJTdGFjayA9IFtdXG4gIGZvciBjaGFyIGluIHRleHRcbiAgICBpZiAocGFpclN0YWNrLmxlbmd0aCBpcyAwKSBhbmQgKGNoYXIgaW4gc2VwYXJhdG9yQ2hhcnMpXG4gICAgICBjaGFuZ2VTZWN0aW9uKCdzZXBhcmF0b3InKVxuICAgIGVsc2VcbiAgICAgIGNoYW5nZVNlY3Rpb24oJ2FyZ3VtZW50JylcbiAgICAgIGlmIGlzRXNjYXBlZFxuICAgICAgICBpc0VzY2FwZWQgPSBmYWxzZVxuICAgICAgZWxzZSBpZiBjaGFyIGlzIGVzY2FwZUNoYXJcbiAgICAgICAgaXNFc2NhcGVkID0gdHJ1ZVxuICAgICAgZWxzZSBpZiBpblF1b3RlXG4gICAgICAgIGlmIChjaGFyIGluIHF1b3RlQ2hhcnMpIGFuZCBfLmxhc3QocGFpclN0YWNrKSBpcyBjaGFyXG4gICAgICAgICAgcGFpclN0YWNrLnBvcCgpXG4gICAgICAgICAgaW5RdW90ZSA9IGZhbHNlXG4gICAgICBlbHNlIGlmIGNoYXIgaW4gcXVvdGVDaGFyc1xuICAgICAgICBpblF1b3RlID0gdHJ1ZVxuICAgICAgICBwYWlyU3RhY2sucHVzaChjaGFyKVxuICAgICAgZWxzZSBpZiBjaGFyIGluIG9wZW5QYWlyQ2hhcnNcbiAgICAgICAgcGFpclN0YWNrLnB1c2goY2hhcilcbiAgICAgIGVsc2UgaWYgY2hhciBpbiBjbG9zZVBhaXJDaGFyc1xuICAgICAgICBwYWlyU3RhY2sucG9wKCkgaWYgXy5sYXN0KHBhaXJTdGFjaykgaXMgY2xvc2VDaGFyVG9PcGVuQ2hhcltjaGFyXVxuXG4gICAgcGVuZGluZ1Rva2VuICs9IGNoYXJcbiAgc2V0dGxlUGVuZGluZygpXG5cbiAgaWYgam9pblNwYWNlU2VwYXJhdGVkVG9rZW4gYW5kIGFsbFRva2Vucy5zb21lKCh7dHlwZSwgdGV4dH0pIC0+IHR5cGUgaXMgJ3NlcGFyYXRvcicgYW5kICcsJyBpbiB0ZXh0KVxuICAgICMgV2hlbiBzb21lIHNlcGFyYXRvciBjb250YWlucyBgLGAgdHJlYXQgd2hpdGUtc3BhY2Ugc2VwYXJhdG9yIGlzIGp1c3QgcGFydCBvZiB0b2tlbi5cbiAgICAjIFNvIHdlIG1vdmUgd2hpdGUtc3BhY2Ugb25seSBzcGFyYXRvciBpbnRvIHRva2VucyBieSBqb2luaW5nIG1pcy1zZXBhcmF0b2VkIHRva2Vucy5cbiAgICBuZXdBbGxUb2tlbnMgPSBbXVxuICAgIHdoaWxlIGFsbFRva2Vucy5sZW5ndGhcbiAgICAgIHRva2VuID0gYWxsVG9rZW5zLnNoaWZ0KClcbiAgICAgIHN3aXRjaCB0b2tlbi50eXBlXG4gICAgICAgIHdoZW4gJ2FyZ3VtZW50J1xuICAgICAgICAgIG5ld0FsbFRva2Vucy5wdXNoKHRva2VuKVxuICAgICAgICB3aGVuICdzZXBhcmF0b3InXG4gICAgICAgICAgaWYgJywnIGluIHRva2VuLnRleHRcbiAgICAgICAgICAgIG5ld0FsbFRva2Vucy5wdXNoKHRva2VuKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICMgMS4gQ29uY2F0bmF0ZSB3aGl0ZS1zcGFjZS1zZXBhcmF0b3IgYW5kIG5leHQtYXJndW1lbnRcbiAgICAgICAgICAgICMgMi4gVGhlbiBqb2luIGludG8gbGF0ZXN0IGFyZ3VtZW50XG4gICAgICAgICAgICBsYXN0QXJnID0gbmV3QWxsVG9rZW5zLnBvcCgpID8ge3RleHQ6ICcnLCAnYXJndW1lbnQnfVxuICAgICAgICAgICAgbGFzdEFyZy50ZXh0ICs9IHRva2VuLnRleHQgKyAoYWxsVG9rZW5zLnNoaWZ0KCk/LnRleHQgPyAnJykgIyBjb25jYXQgd2l0aCBuZXh0LWFyZ3VtZW50XG4gICAgICAgICAgICBuZXdBbGxUb2tlbnMucHVzaChsYXN0QXJnKVxuICAgIGFsbFRva2VucyA9IG5ld0FsbFRva2Vuc1xuICBhbGxUb2tlbnNcblxuc2NhbkVkaXRvckluRGlyZWN0aW9uID0gKGVkaXRvciwgZGlyZWN0aW9uLCBwYXR0ZXJuLCBvcHRpb25zPXt9LCBmbikgLT5cbiAge2FsbG93TmV4dExpbmUsIGZyb20sIHNjYW5SYW5nZX0gPSBvcHRpb25zXG4gIGlmIG5vdCBmcm9tPyBhbmQgbm90IHNjYW5SYW5nZT9cbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBlaXRoZXIgb2YgJ2Zyb20nIG9yICdzY2FuUmFuZ2UnIG9wdGlvbnNcIilcblxuICBpZiBzY2FuUmFuZ2VcbiAgICBhbGxvd05leHRMaW5lID0gdHJ1ZVxuICBlbHNlXG4gICAgYWxsb3dOZXh0TGluZSA/PSB0cnVlXG4gIGZyb20gPSBQb2ludC5mcm9tT2JqZWN0KGZyb20pIGlmIGZyb20/XG4gIHN3aXRjaCBkaXJlY3Rpb25cbiAgICB3aGVuICdmb3J3YXJkJ1xuICAgICAgc2NhblJhbmdlID89IG5ldyBSYW5nZShmcm9tLCBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbihlZGl0b3IpKVxuICAgICAgc2NhbkZ1bmN0aW9uID0gJ3NjYW5JbkJ1ZmZlclJhbmdlJ1xuICAgIHdoZW4gJ2JhY2t3YXJkJ1xuICAgICAgc2NhblJhbmdlID89IG5ldyBSYW5nZShbMCwgMF0sIGZyb20pXG4gICAgICBzY2FuRnVuY3Rpb24gPSAnYmFja3dhcmRzU2NhbkluQnVmZmVyUmFuZ2UnXG5cbiAgZWRpdG9yW3NjYW5GdW5jdGlvbl0gcGF0dGVybiwgc2NhblJhbmdlLCAoZXZlbnQpIC0+XG4gICAgaWYgbm90IGFsbG93TmV4dExpbmUgYW5kIGV2ZW50LnJhbmdlLnN0YXJ0LnJvdyBpc250IGZyb20ucm93XG4gICAgICBldmVudC5zdG9wKClcbiAgICAgIHJldHVyblxuICAgIGZuKGV2ZW50KVxuXG5hZGp1c3RJbmRlbnRXaXRoS2VlcGluZ0xheW91dCA9IChlZGl0b3IsIHJhbmdlKSAtPlxuICAjIEFkanVzdCBpbmRlbnRMZXZlbCB3aXRoIGtlZXBpbmcgb3JpZ2luYWwgbGF5b3V0IG9mIHBhc3RpbmcgdGV4dC5cbiAgIyBTdWdnZXN0ZWQgaW5kZW50IGxldmVsIG9mIHJhbmdlLnN0YXJ0LnJvdyBpcyBjb3JyZWN0IGFzIGxvbmcgYXMgcmFuZ2Uuc3RhcnQucm93IGhhdmUgbWluaW11bSBpbmRlbnQgbGV2ZWwuXG4gICMgQnV0IHdoZW4gd2UgcGFzdGUgZm9sbG93aW5nIGFscmVhZHkgaW5kZW50ZWQgdGhyZWUgbGluZSB0ZXh0LCB3ZSBoYXZlIHRvIGFkanVzdCBpbmRlbnQgbGV2ZWxcbiAgIyAgc28gdGhhdCBgdmFyRm9ydHlUd29gIGxpbmUgaGF2ZSBzdWdnZXN0ZWRJbmRlbnRMZXZlbC5cbiAgI1xuICAjICAgICAgICB2YXJPbmU6IHZhbHVlICMgc3VnZ2VzdGVkSW5kZW50TGV2ZWwgaXMgZGV0ZXJtaW5lZCBieSB0aGlzIGxpbmVcbiAgIyAgIHZhckZvcnR5VHdvOiB2YWx1ZSAjIFdlIG5lZWQgdG8gbWFrZSBmaW5hbCBpbmRlbnQgbGV2ZWwgb2YgdGhpcyByb3cgdG8gYmUgc3VnZ2VzdGVkSW5kZW50TGV2ZWwuXG4gICMgICAgICB2YXJUaHJlZTogdmFsdWVcbiAgI1xuICAjIFNvIHdoYXQgd2UgYXJlIGRvaW5nIGhlcmUgaXMgYXBwbHkgc3VnZ2VzdGVkSW5kZW50TGV2ZWwgd2l0aCBmaXhpbmcgaXNzdWUgYWJvdmUuXG4gICMgMS4gRGV0ZXJtaW5lIG1pbmltdW0gaW5kZW50IGxldmVsIGFtb25nIHBhc3RlZCByYW5nZSg9IHJhbmdlICkgZXhjbHVkaW5nIGVtcHR5IHJvd1xuICAjIDIuIFRoZW4gdXBkYXRlIGluZGVudExldmVsIG9mIGVhY2ggcm93cyB0byBmaW5hbCBpbmRlbnRMZXZlbCBvZiBtaW5pbXVtLWluZGVudGVkIHJvdyBoYXZlIHN1Z2dlc3RlZEluZGVudExldmVsLlxuICBzdWdnZXN0ZWRMZXZlbCA9IGVkaXRvci5zdWdnZXN0ZWRJbmRlbnRGb3JCdWZmZXJSb3cocmFuZ2Uuc3RhcnQucm93KVxuICBtaW5MZXZlbCA9IG51bGxcbiAgcm93QW5kQWN0dWFsTGV2ZWxzID0gW11cbiAgZm9yIHJvdyBpbiBbcmFuZ2Uuc3RhcnQucm93Li4ucmFuZ2UuZW5kLnJvd11cbiAgICBhY3R1YWxMZXZlbCA9IGdldEluZGVudExldmVsRm9yQnVmZmVyUm93KGVkaXRvciwgcm93KVxuICAgIHJvd0FuZEFjdHVhbExldmVscy5wdXNoKFtyb3csIGFjdHVhbExldmVsXSlcbiAgICB1bmxlc3MgaXNFbXB0eVJvdyhlZGl0b3IsIHJvdylcbiAgICAgIG1pbkxldmVsID0gTWF0aC5taW4obWluTGV2ZWwgPyBJbmZpbml0eSwgYWN0dWFsTGV2ZWwpXG5cbiAgaWYgbWluTGV2ZWw/IGFuZCAoZGVsdGFUb1N1Z2dlc3RlZExldmVsID0gc3VnZ2VzdGVkTGV2ZWwgLSBtaW5MZXZlbClcbiAgICBmb3IgW3JvdywgYWN0dWFsTGV2ZWxdIGluIHJvd0FuZEFjdHVhbExldmVsc1xuICAgICAgbmV3TGV2ZWwgPSBhY3R1YWxMZXZlbCArIGRlbHRhVG9TdWdnZXN0ZWRMZXZlbFxuICAgICAgZWRpdG9yLnNldEluZGVudGF0aW9uRm9yQnVmZmVyUm93KHJvdywgbmV3TGV2ZWwpXG5cbiMgQ2hlY2sgcG9pbnQgY29udGFpbm1lbnQgd2l0aCBlbmQgcG9zaXRpb24gZXhjbHVzaXZlXG5yYW5nZUNvbnRhaW5zUG9pbnRXaXRoRW5kRXhjbHVzaXZlID0gKHJhbmdlLCBwb2ludCkgLT5cbiAgcmFuZ2Uuc3RhcnQuaXNMZXNzVGhhbk9yRXF1YWwocG9pbnQpIGFuZFxuICAgIHJhbmdlLmVuZC5pc0dyZWF0ZXJUaGFuKHBvaW50KVxuXG50cmF2ZXJzZVRleHRGcm9tUG9pbnQgPSAocG9pbnQsIHRleHQpIC0+XG4gIHBvaW50LnRyYXZlcnNlKGdldFRyYXZlcnNhbEZvclRleHQodGV4dCkpXG5cbmdldFRyYXZlcnNhbEZvclRleHQgPSAodGV4dCkgLT5cbiAgcm93ID0gMFxuICBjb2x1bW4gPSAwXG4gIGZvciBjaGFyIGluIHRleHRcbiAgICBpZiBjaGFyIGlzIFwiXFxuXCJcbiAgICAgIHJvdysrXG4gICAgICBjb2x1bW4gPSAwXG4gICAgZWxzZVxuICAgICAgY29sdW1uKytcbiAgW3JvdywgY29sdW1uXVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYXNzZXJ0V2l0aEV4Y2VwdGlvblxuICBnZXRBbmNlc3RvcnNcbiAgZ2V0S2V5QmluZGluZ0ZvckNvbW1hbmRcbiAgaW5jbHVkZVxuICBkZWJ1Z1xuICBzYXZlRWRpdG9yU3RhdGVcbiAgaXNMaW5ld2lzZVJhbmdlXG4gIHNvcnRSYW5nZXNcbiAgZ2V0SW5kZXhcbiAgZ2V0VmlzaWJsZUJ1ZmZlclJhbmdlXG4gIGdldFZpc2libGVFZGl0b3JzXG4gIHBvaW50SXNBdEVuZE9mTGluZVxuICBwb2ludElzT25XaGl0ZVNwYWNlXG4gIHBvaW50SXNBdEVuZE9mTGluZUF0Tm9uRW1wdHlSb3dcbiAgcG9pbnRJc0F0VmltRW5kT2ZGaWxlXG4gIGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uXG4gIGdldFZpbUVvZlNjcmVlblBvc2l0aW9uXG4gIGdldFZpbUxhc3RCdWZmZXJSb3dcbiAgZ2V0VmltTGFzdFNjcmVlblJvd1xuICBzZXRCdWZmZXJSb3dcbiAgc2V0QnVmZmVyQ29sdW1uXG4gIG1vdmVDdXJzb3JMZWZ0XG4gIG1vdmVDdXJzb3JSaWdodFxuICBtb3ZlQ3Vyc29yVXBTY3JlZW5cbiAgbW92ZUN1cnNvckRvd25TY3JlZW5cbiAgZ2V0RW5kT2ZMaW5lRm9yQnVmZmVyUm93XG4gIGdldEZpcnN0VmlzaWJsZVNjcmVlblJvd1xuICBnZXRMYXN0VmlzaWJsZVNjcmVlblJvd1xuICBnZXRWYWxpZFZpbUJ1ZmZlclJvd1xuICBnZXRWYWxpZFZpbVNjcmVlblJvd1xuICBtb3ZlQ3Vyc29yVG9GaXJzdENoYXJhY3RlckF0Um93XG4gIGdldExpbmVUZXh0VG9CdWZmZXJQb3NpdGlvblxuICBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvd1xuICBnZXRUZXh0SW5TY3JlZW5SYW5nZVxuICBtb3ZlQ3Vyc29yVG9OZXh0Tm9uV2hpdGVzcGFjZVxuICBpc0VtcHR5Um93XG4gIGdldENvZGVGb2xkUm93UmFuZ2VzXG4gIGdldENvZGVGb2xkUm93UmFuZ2VzQ29udGFpbmVzRm9yUm93XG4gIGdldEZvbGRSb3dSYW5nZXNcbiAgZ2V0Rm9sZFJhbmdlc1dpdGhJbmRlbnRcbiAgZ2V0Rm9sZEluZm9CeUtpbmRcbiAgZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZVxuICB0cmltUmFuZ2VcbiAgZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvd1xuICBpc0luY2x1ZGVGdW5jdGlvblNjb3BlRm9yUm93XG4gIGRldGVjdFNjb3BlU3RhcnRQb3NpdGlvbkZvclNjb3BlXG4gIGdldEJ1ZmZlclJvd3NcbiAgc21hcnRTY3JvbGxUb0J1ZmZlclBvc2l0aW9uXG4gIG1hdGNoU2NvcGVzXG4gIGlzU2luZ2xlTGluZVRleHRcbiAgZ2V0V29yZEJ1ZmZlclJhbmdlQXRCdWZmZXJQb3NpdGlvblxuICBnZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvblxuICBnZXRXb3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb25cbiAgZ2V0U3Vid29yZFBhdHRlcm5BdEJ1ZmZlclBvc2l0aW9uXG4gIGdldE5vbldvcmRDaGFyYWN0ZXJzRm9yQ3Vyc29yXG4gIHNocmlua1JhbmdlRW5kVG9CZWZvcmVOZXdMaW5lXG4gIHNjYW5FZGl0b3JcbiAgY29sbGVjdFJhbmdlSW5CdWZmZXJSb3dcbiAgZmluZFJhbmdlSW5CdWZmZXJSb3dcbiAgZ2V0TGFyZ2VzdEZvbGRSYW5nZUNvbnRhaW5zQnVmZmVyUm93XG4gIHRyYW5zbGF0ZVBvaW50QW5kQ2xpcFxuICBnZXRSYW5nZUJ5VHJhbnNsYXRlUG9pbnRBbmRDbGlwXG4gIGdldFBhY2thZ2VcbiAgc2VhcmNoQnlQcm9qZWN0RmluZFxuICBsaW1pdE51bWJlclxuICBmaW5kUmFuZ2VDb250YWluc1BvaW50XG5cbiAgaXNFbXB0eSwgaXNOb3RFbXB0eVxuICBpc1NpbmdsZUxpbmVSYW5nZSwgaXNOb3RTaW5nbGVMaW5lUmFuZ2VcblxuICBpbnNlcnRUZXh0QXRCdWZmZXJQb3NpdGlvblxuICBlbnN1cmVFbmRzV2l0aE5ld0xpbmVGb3JCdWZmZXJSb3dcbiAgaXNMZWFkaW5nV2hpdGVTcGFjZVJhbmdlXG4gIGlzTm90TGVhZGluZ1doaXRlU3BhY2VSYW5nZVxuICBpc0VzY2FwZWRDaGFyUmFuZ2VcblxuICBmb3JFYWNoUGFuZUF4aXNcbiAgYWRkQ2xhc3NMaXN0XG4gIHJlbW92ZUNsYXNzTGlzdFxuICB0b2dnbGVDbGFzc0xpc3RcbiAgdG9nZ2xlQ2FzZUZvckNoYXJhY3RlclxuICBzcGxpdFRleHRCeU5ld0xpbmVcbiAgcmVwbGFjZURlY29yYXRpb25DbGFzc0J5XG4gIGh1bWFuaXplQnVmZmVyUmFuZ2VcbiAgZXhwYW5kUmFuZ2VUb1doaXRlU3BhY2VzXG4gIHNwbGl0QW5kSm9pbkJ5XG4gIHNwbGl0QXJndW1lbnRzXG4gIHNjYW5FZGl0b3JJbkRpcmVjdGlvblxuICBhZGp1c3RJbmRlbnRXaXRoS2VlcGluZ0xheW91dFxuICByYW5nZUNvbnRhaW5zUG9pbnRXaXRoRW5kRXhjbHVzaXZlXG4gIHRyYXZlcnNlVGV4dEZyb21Qb2ludFxufVxuIl19
