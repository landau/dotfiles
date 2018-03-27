(function() {
  var Disposable, Point, Range, _, addClassList, adjustRangeToRowRange, assert, assertWithException, buildWordPatternByCursor, collectRangeInBufferRow, cursorIsAtEndOfLineAtNonEmptyRow, cursorIsAtVimEndOfFile, debug, detectScopeStartPositionForScope, ensureEndsWithNewLineForBufferRow, expandRangeToWhiteSpaces, findRangeContainsPoint, findRangeInBufferRow, forEachPaneAxis, fs, getAncestors, getBeginningOfWordBufferPosition, getBufferRangeForRowRange, getBufferRows, getCodeFoldRowRanges, getCodeFoldRowRangesContainesForRow, getEndOfLineForBufferRow, getEndOfWordBufferPosition, getFirstCharacterPositionForBufferRow, getFirstVisibleScreenRow, getIndentLevelForBufferRow, getIndex, getKeyBindingForCommand, getLargestFoldRangeContainsBufferRow, getLastVisibleScreenRow, getLeftCharacterForBufferPosition, getLineTextToBufferPosition, getNonWordCharactersForCursor, getPackage, getRangeByTranslatePointAndClip, getRightCharacterForBufferPosition, getScopesForTokenizedLine, getSubwordPatternAtBufferPosition, getTextInScreenRange, getTokenizedLineForRow, getValidVimBufferRow, getValidVimScreenRow, getVimEofBufferPosition, getVimEofScreenPosition, getVimLastBufferRow, getVimLastScreenRow, getVisibleBufferRange, getVisibleEditors, getWordBufferRangeAndKindAtBufferPosition, getWordBufferRangeAtBufferPosition, getWordPatternAtBufferPosition, haveSomeNonEmptySelection, humanizeBufferRange, include, insertTextAtBufferPosition, isEmpty, isEmptyRow, isEndsWithNewLineForBufferRow, isEscapedCharRange, isFunctionScope, isIncludeFunctionScopeForRow, isLeadingWhiteSpaceRange, isLinewiseRange, isNotEmpty, isNotLeadingWhiteSpaceRange, isNotSingleLineRange, isSingleLineRange, isSingleLineText, limitNumber, matchScopes, modifyClassList, moveCursor, moveCursorDownBuffer, moveCursorDownScreen, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUpBuffer, moveCursorUpScreen, negateFunction, pointIsAtEndOfLine, pointIsAtEndOfLineAtNonEmptyRow, pointIsAtVimEndOfFile, pointIsOnWhiteSpace, ref, registerElement, removeClassList, saveEditorState, scanEditor, scanEditorInDirection, scanForScopeStart, searchByProjectFind, setBufferColumn, setBufferRow, settings, shouldPreventWrapLine, shrinkRangeEndToBeforeNewLine, smartScrollToBufferPosition, sortRanges, splitTextByNewLine, toggleCaseForCharacter, toggleClassList, translatePointAndClip, trimRange,
    slice = [].slice;

  fs = require('fs-plus');

  settings = require('./settings');

  ref = require('atom'), Disposable = ref.Disposable, Range = ref.Range, Point = ref.Point;

  _ = require('underscore-plus');

  assert = function(condition, message, fn) {
    if (fn == null) {
      fn = function(error) {
        return console.error(error.message);
      };
    }
    return atom.assert(condition, message, fn);
  };

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
    var i, keymap, keymapPath, keymaps, keystrokes, len, packageName, results, selector;
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
    for (i = 0, len = keymaps.length; i < len; i++) {
      keymap = keymaps[i];
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
      var i, len, ref1, row;
      ref1 = foldStartRows.reverse();
      for (i = 0, len = ref1.length; i < len; i++) {
        row = ref1[i];
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

  haveSomeNonEmptySelection = function(editor) {
    return editor.getSelections().some(isNotEmpty);
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
    var editor, i, len, pane, ref1, results1;
    ref1 = atom.workspace.getPanes();
    results1 = [];
    for (i = 0, len = ref1.length; i < len; i++) {
      pane = ref1[i];
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
    var direction, endRow, i, j, ref1, ref2, results1, results2, startRow;
    startRow = arg.startRow, direction = arg.direction;
    switch (direction) {
      case 'previous':
        if (startRow <= 0) {
          return [];
        } else {
          return (function() {
            results1 = [];
            for (var i = ref1 = startRow - 1; ref1 <= 0 ? i <= 0 : i >= 0; ref1 <= 0 ? i++ : i--){ results1.push(i); }
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
            for (var j = ref2 = startRow + 1; ref2 <= endRow ? j <= endRow : j >= endRow; ref2 <= endRow ? j++ : j--){ results2.push(j); }
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

  getCodeFoldRowRanges = function(editor) {
    var i, ref1, results1;
    return (function() {
      results1 = [];
      for (var i = 0, ref1 = editor.getLastBufferRow(); 0 <= ref1 ? i <= ref1 : i >= ref1; 0 <= ref1 ? i++ : i--){ results1.push(i); }
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
    var i, len, ref1, results1, tag;
    ref1 = line.tags;
    results1 = [];
    for (i = 0, len = ref1.length; i < len; i++) {
      tag = ref1[i];
      if (tag < 0 && (tag % 2 === -1)) {
        results1.push(atom.grammars.scopeForId(tag));
      }
    }
    return results1;
  };

  scanForScopeStart = function(editor, fromPoint, direction, fn) {
    var column, continueScan, i, isValidToken, j, k, len, len1, len2, position, ref1, result, results, row, scanRows, scope, stop, tag, tokenIterator, tokenizedLine;
    fromPoint = Point.fromObject(fromPoint);
    scanRows = (function() {
      var i, j, ref1, ref2, ref3, results1, results2;
      switch (direction) {
        case 'forward':
          return (function() {
            results1 = [];
            for (var i = ref1 = fromPoint.row, ref2 = editor.getLastBufferRow(); ref1 <= ref2 ? i <= ref2 : i >= ref2; ref1 <= ref2 ? i++ : i--){ results1.push(i); }
            return results1;
          }).apply(this);
        case 'backward':
          return (function() {
            results2 = [];
            for (var j = ref3 = fromPoint.row; ref3 <= 0 ? j <= 0 : j >= 0; ref3 <= 0 ? j++ : j--){ results2.push(j); }
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
    for (i = 0, len = scanRows.length; i < len; i++) {
      row = scanRows[i];
      if (!(tokenizedLine = getTokenizedLineForRow(editor, row))) {
        continue;
      }
      column = 0;
      results = [];
      tokenIterator = tokenizedLine.getTokenIterator();
      ref1 = tokenizedLine.tags;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        tag = ref1[j];
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
      for (k = 0, len2 = results.length; k < len2; k++) {
        result = results[k];
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
    var className, classNames, classes, containsCount, i, j, len, len1;
    classes = scopes.map(function(scope) {
      return scope.split('.');
    });
    for (i = 0, len = classes.length; i < len; i++) {
      classNames = classes[i];
      containsCount = 0;
      for (j = 0, len1 = classNames.length; j < len1; j++) {
        className = classNames[j];
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
    var end, endPoint, i, len, marker, markers, ref1, ref2, start, startPoint;
    markers = editor.displayLayer.foldsMarkerLayer.findMarkers({
      intersectsRow: row
    });
    startPoint = null;
    endPoint = null;
    ref1 = markers != null ? markers : [];
    for (i = 0, len = ref1.length; i < len; i++) {
      marker = ref1[i];
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
    var i, len, range;
    for (i = 0, len = ranges.length; i < len; i++) {
      range = ranges[i];
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

  forEachPaneAxis = function(fn, base) {
    var child, i, len, ref1, results1;
    if (base == null) {
      base = atom.workspace.getActivePane().getContainer().getRoot();
    }
    if (base.children != null) {
      fn(base);
      ref1 = base.children;
      results1 = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        child = ref1[i];
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
    assert: assert,
    assertWithException: assertWithException,
    getAncestors: getAncestors,
    getKeyBindingForCommand: getKeyBindingForCommand,
    include: include,
    debug: debug,
    saveEditorState: saveEditorState,
    isLinewiseRange: isLinewiseRange,
    haveSomeNonEmptySelection: haveSomeNonEmptySelection,
    sortRanges: sortRanges,
    getIndex: getIndex,
    getVisibleBufferRange: getVisibleBufferRange,
    getVisibleEditors: getVisibleEditors,
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
    getTextInScreenRange: getTextInScreenRange,
    moveCursorToNextNonWhitespace: moveCursorToNextNonWhitespace,
    isEmptyRow: isEmptyRow,
    cursorIsAtEndOfLineAtNonEmptyRow: cursorIsAtEndOfLineAtNonEmptyRow,
    getCodeFoldRowRanges: getCodeFoldRowRanges,
    getCodeFoldRowRangesContainesForRow: getCodeFoldRowRangesContainesForRow,
    getBufferRangeForRowRange: getBufferRangeForRowRange,
    trimRange: trimRange,
    getFirstCharacterPositionForBufferRow: getFirstCharacterPositionForBufferRow,
    isIncludeFunctionScopeForRow: isIncludeFunctionScopeForRow,
    detectScopeStartPositionForScope: detectScopeStartPositionForScope,
    getBufferRows: getBufferRows,
    registerElement: registerElement,
    smartScrollToBufferPosition: smartScrollToBufferPosition,
    matchScopes: matchScopes,
    moveCursorDownBuffer: moveCursorDownBuffer,
    moveCursorUpBuffer: moveCursorUpBuffer,
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
    humanizeBufferRange: humanizeBufferRange,
    expandRangeToWhiteSpaces: expandRangeToWhiteSpaces,
    scanEditorInDirection: scanEditorInDirection
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvdXRpbHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSw0MUVBQUE7SUFBQTs7RUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSOztFQUVYLE1BQTZCLE9BQUEsQ0FBUSxNQUFSLENBQTdCLEVBQUMsMkJBQUQsRUFBYSxpQkFBYixFQUFvQjs7RUFDcEIsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSixNQUFBLEdBQVMsU0FBQyxTQUFELEVBQVksT0FBWixFQUFxQixFQUFyQjtJQUNQLElBQU8sVUFBUDtNQUNFLEVBQUEsR0FBSyxTQUFDLEtBQUQ7ZUFDSCxPQUFPLENBQUMsS0FBUixDQUFjLEtBQUssQ0FBQyxPQUFwQjtNQURHLEVBRFA7O1dBR0EsSUFBSSxDQUFDLE1BQUwsQ0FBWSxTQUFaLEVBQXVCLE9BQXZCLEVBQWdDLEVBQWhDO0VBSk87O0VBTVQsbUJBQUEsR0FBc0IsU0FBQyxTQUFELEVBQVksT0FBWixFQUFxQixFQUFyQjtXQUNwQixJQUFJLENBQUMsTUFBTCxDQUFZLFNBQVosRUFBdUIsT0FBdkIsRUFBZ0MsU0FBQyxLQUFEO0FBQzlCLFlBQVUsSUFBQSxLQUFBLENBQU0sS0FBSyxDQUFDLE9BQVo7SUFEb0IsQ0FBaEM7RUFEb0I7O0VBSXRCLFlBQUEsR0FBZSxTQUFDLEdBQUQ7QUFDYixRQUFBO0lBQUEsU0FBQSxHQUFZO0lBQ1osT0FBQSxHQUFVO0FBQ1YsV0FBQSxJQUFBO01BQ0UsU0FBUyxDQUFDLElBQVYsQ0FBZSxPQUFmO01BQ0EsT0FBQSw0Q0FBMkIsQ0FBRTtNQUM3QixJQUFBLENBQWEsT0FBYjtBQUFBLGNBQUE7O0lBSEY7V0FJQTtFQVBhOztFQVNmLHVCQUFBLEdBQTBCLFNBQUMsT0FBRCxFQUFVLEdBQVY7QUFDeEIsUUFBQTtJQURtQyxjQUFEO0lBQ2xDLE9BQUEsR0FBVTtJQUNWLE9BQUEsR0FBVSxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWIsQ0FBQTtJQUNWLElBQUcsbUJBQUg7TUFDRSxVQUFBLEdBQWEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixXQUEvQixDQUEyQyxDQUFDLGNBQTVDLENBQUEsQ0FBNEQsQ0FBQyxHQUE3RCxDQUFBO01BQ2IsT0FBQSxHQUFVLE9BQU8sQ0FBQyxNQUFSLENBQWUsU0FBQyxJQUFEO0FBQWMsWUFBQTtRQUFaLFNBQUQ7ZUFBYSxNQUFBLEtBQVU7TUFBeEIsQ0FBZixFQUZaOztBQUlBLFNBQUEseUNBQUE7O1lBQTJCLE1BQU0sQ0FBQyxPQUFQLEtBQWtCOzs7TUFDMUMsOEJBQUQsRUFBYTtNQUNiLFVBQUEsR0FBYSxVQUFVLENBQUMsT0FBWCxDQUFtQixRQUFuQixFQUE2QixFQUE3QjtNQUNiLG1CQUFDLFVBQUEsVUFBVyxFQUFaLENBQWUsQ0FBQyxJQUFoQixDQUFxQjtRQUFDLFlBQUEsVUFBRDtRQUFhLFVBQUEsUUFBYjtPQUFyQjtBQUhGO1dBSUE7RUFYd0I7O0VBYzFCLE9BQUEsR0FBVSxTQUFDLEtBQUQsRUFBUSxNQUFSO0FBQ1IsUUFBQTtBQUFBO1NBQUEsYUFBQTs7b0JBQ0UsS0FBSyxDQUFBLFNBQUcsQ0FBQSxHQUFBLENBQVIsR0FBZTtBQURqQjs7RUFEUTs7RUFJVixLQUFBLEdBQVEsU0FBQTtBQUNOLFFBQUE7SUFETztJQUNQLElBQUEsQ0FBYyxRQUFRLENBQUMsR0FBVCxDQUFhLE9BQWIsQ0FBZDtBQUFBLGFBQUE7O0FBQ0EsWUFBTyxRQUFRLENBQUMsR0FBVCxDQUFhLGFBQWIsQ0FBUDtBQUFBLFdBQ08sU0FEUDtlQUVJLE9BQU8sQ0FBQyxHQUFSLGdCQUFZLFFBQVo7QUFGSixXQUdPLE1BSFA7UUFJSSxRQUFBLEdBQVcsRUFBRSxDQUFDLFNBQUgsQ0FBYSxRQUFRLENBQUMsR0FBVCxDQUFhLHFCQUFiLENBQWI7UUFDWCxJQUFHLEVBQUUsQ0FBQyxVQUFILENBQWMsUUFBZCxDQUFIO2lCQUNFLEVBQUUsQ0FBQyxjQUFILENBQWtCLFFBQWxCLEVBQTRCLFFBQUEsR0FBVyxJQUF2QyxFQURGOztBQUxKO0VBRk07O0VBV1IsZUFBQSxHQUFrQixTQUFDLE1BQUQ7QUFDaEIsUUFBQTtJQUFBLGFBQUEsR0FBZ0IsTUFBTSxDQUFDO0lBQ3ZCLFNBQUEsR0FBWSxhQUFhLENBQUMsWUFBZCxDQUFBO0lBRVosYUFBQSxHQUFnQixNQUFNLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLFdBQXJDLENBQWlELEVBQWpELENBQW9ELENBQUMsR0FBckQsQ0FBeUQsU0FBQyxDQUFEO2FBQU8sQ0FBQyxDQUFDLGdCQUFGLENBQUEsQ0FBb0IsQ0FBQztJQUE1QixDQUF6RDtXQUNoQixTQUFBO0FBQ0UsVUFBQTtBQUFBO0FBQUEsV0FBQSxzQ0FBQTs7WUFBd0MsQ0FBSSxNQUFNLENBQUMsbUJBQVAsQ0FBMkIsR0FBM0I7VUFDMUMsTUFBTSxDQUFDLGFBQVAsQ0FBcUIsR0FBckI7O0FBREY7YUFFQSxhQUFhLENBQUMsWUFBZCxDQUEyQixTQUEzQjtJQUhGO0VBTGdCOztFQVVsQixlQUFBLEdBQWtCLFNBQUMsR0FBRDtBQUNoQixRQUFBO0lBRGtCLG1CQUFPO1dBQ3pCLENBQUMsS0FBSyxDQUFDLEdBQU4sS0FBZSxHQUFHLENBQUMsR0FBcEIsQ0FBQSxJQUE2QixDQUFDLENBQUEsS0FBSyxDQUFDLE1BQU4sYUFBZ0IsR0FBRyxDQUFDLE9BQXBCLFFBQUEsS0FBOEIsQ0FBOUIsQ0FBRDtFQURiOztFQUdsQiw2QkFBQSxHQUFnQyxTQUFDLE1BQUQsRUFBUyxHQUFUO0FBQzlCLFFBQUE7SUFBQSxPQUFlLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixHQUEvQixFQUFvQztNQUFBLGNBQUEsRUFBZ0IsSUFBaEI7S0FBcEMsQ0FBZixFQUFDLGtCQUFELEVBQVE7V0FDUixLQUFLLENBQUMsR0FBTixLQUFlLEdBQUcsQ0FBQztFQUZXOztFQUloQyx5QkFBQSxHQUE0QixTQUFDLE1BQUQ7V0FDMUIsTUFBTSxDQUFDLGFBQVAsQ0FBQSxDQUFzQixDQUFDLElBQXZCLENBQTRCLFVBQTVCO0VBRDBCOztFQUc1QixVQUFBLEdBQWEsU0FBQyxVQUFEO1dBQ1gsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsU0FBQyxDQUFELEVBQUksQ0FBSjthQUFVLENBQUMsQ0FBQyxPQUFGLENBQVUsQ0FBVjtJQUFWLENBQWhCO0VBRFc7O0VBS2IsUUFBQSxHQUFXLFNBQUMsS0FBRCxFQUFRLElBQVI7QUFDVCxRQUFBO0lBQUEsTUFBQSxHQUFTLElBQUksQ0FBQztJQUNkLElBQUcsTUFBQSxLQUFVLENBQWI7YUFDRSxDQUFDLEVBREg7S0FBQSxNQUFBO01BR0UsS0FBQSxHQUFRLEtBQUEsR0FBUTtNQUNoQixJQUFHLEtBQUEsSUFBUyxDQUFaO2VBQ0UsTUFERjtPQUFBLE1BQUE7ZUFHRSxNQUFBLEdBQVMsTUFIWDtPQUpGOztFQUZTOztFQWFYLHFCQUFBLEdBQXdCLFNBQUMsTUFBRDtBQUN0QixRQUFBO0lBQUEsT0FBcUIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxrQkFBZixDQUFBLENBQXJCLEVBQUMsa0JBQUQsRUFBVztJQUNYLElBQUEsQ0FBbUIsQ0FBQyxrQkFBQSxJQUFjLGdCQUFmLENBQW5CO0FBQUEsYUFBTyxLQUFQOztJQUNBLFFBQUEsR0FBVyxNQUFNLENBQUMscUJBQVAsQ0FBNkIsUUFBN0I7SUFDWCxNQUFBLEdBQVMsTUFBTSxDQUFDLHFCQUFQLENBQTZCLE1BQTdCO1dBQ0wsSUFBQSxLQUFBLENBQU0sQ0FBQyxRQUFELEVBQVcsQ0FBWCxDQUFOLEVBQXFCLENBQUMsTUFBRCxFQUFTLEtBQVQsQ0FBckI7RUFMa0I7O0VBT3hCLGlCQUFBLEdBQW9CLFNBQUE7QUFDbEIsUUFBQTtBQUFDO0FBQUE7U0FBQSxzQ0FBQTs7VUFBa0QsTUFBQSxHQUFTLElBQUksQ0FBQyxlQUFMLENBQUE7c0JBQTNEOztBQUFBOztFQURpQjs7RUFHcEIsd0JBQUEsR0FBMkIsU0FBQyxNQUFELEVBQVMsR0FBVDtXQUN6QixNQUFNLENBQUMsdUJBQVAsQ0FBK0IsR0FBL0IsQ0FBbUMsQ0FBQztFQURYOztFQUszQixrQkFBQSxHQUFxQixTQUFDLE1BQUQsRUFBUyxLQUFUO0lBQ25CLEtBQUEsR0FBUSxLQUFLLENBQUMsVUFBTixDQUFpQixLQUFqQjtXQUNSLHdCQUFBLENBQXlCLE1BQXpCLEVBQWlDLEtBQUssQ0FBQyxHQUF2QyxDQUEyQyxDQUFDLE9BQTVDLENBQW9ELEtBQXBEO0VBRm1COztFQUlyQixtQkFBQSxHQUFzQixTQUFDLE1BQUQsRUFBUyxLQUFUO0FBQ3BCLFFBQUE7SUFBQSxJQUFBLEdBQU8sa0NBQUEsQ0FBbUMsTUFBbkMsRUFBMkMsS0FBM0M7V0FDUCxDQUFJLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBVjtFQUZnQjs7RUFJdEIsK0JBQUEsR0FBa0MsU0FBQyxNQUFELEVBQVMsS0FBVDtJQUNoQyxLQUFBLEdBQVEsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsS0FBakI7V0FDUixLQUFLLENBQUMsTUFBTixLQUFrQixDQUFsQixJQUF3QixrQkFBQSxDQUFtQixNQUFuQixFQUEyQixLQUEzQjtFQUZROztFQUlsQyxxQkFBQSxHQUF3QixTQUFDLE1BQUQsRUFBUyxLQUFUO1dBQ3RCLHVCQUFBLENBQXdCLE1BQXhCLENBQStCLENBQUMsT0FBaEMsQ0FBd0MsS0FBeEM7RUFEc0I7O0VBR3hCLFVBQUEsR0FBYSxTQUFDLE1BQUQsRUFBUyxHQUFUO1dBQ1gsTUFBTSxDQUFDLHVCQUFQLENBQStCLEdBQS9CLENBQW1DLENBQUMsT0FBcEMsQ0FBQTtFQURXOztFQUtiLGdDQUFBLEdBQW1DLFNBQUMsTUFBRDtXQUNqQywrQkFBQSxDQUFnQyxNQUFNLENBQUMsTUFBdkMsRUFBK0MsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBL0M7RUFEaUM7O0VBR25DLHNCQUFBLEdBQXlCLFNBQUMsTUFBRDtXQUN2QixxQkFBQSxDQUFzQixNQUFNLENBQUMsTUFBN0IsRUFBcUMsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBckM7RUFEdUI7O0VBSXpCLGtDQUFBLEdBQXFDLFNBQUMsTUFBRCxFQUFTLEtBQVQsRUFBZ0IsTUFBaEI7O01BQWdCLFNBQU87O1dBQzFELE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixLQUFLLENBQUMsa0JBQU4sQ0FBeUIsS0FBekIsRUFBZ0MsQ0FBaEMsRUFBbUMsTUFBbkMsQ0FBNUI7RUFEbUM7O0VBR3JDLGlDQUFBLEdBQW9DLFNBQUMsTUFBRCxFQUFTLEtBQVQsRUFBZ0IsTUFBaEI7O01BQWdCLFNBQU87O1dBQ3pELE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixLQUFLLENBQUMsa0JBQU4sQ0FBeUIsS0FBekIsRUFBZ0MsQ0FBaEMsRUFBbUMsQ0FBQyxNQUFwQyxDQUE1QjtFQURrQzs7RUFHcEMsb0JBQUEsR0FBdUIsU0FBQyxNQUFELEVBQVMsV0FBVDtBQUNyQixRQUFBO0lBQUEsV0FBQSxHQUFjLE1BQU0sQ0FBQyx5QkFBUCxDQUFpQyxXQUFqQztXQUNkLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixXQUE1QjtFQUZxQjs7RUFJdkIsNkJBQUEsR0FBZ0MsU0FBQyxNQUFEO0FBRTlCLFFBQUE7SUFBQSxJQUFHLG1DQUFIO2FBQ0UsTUFBTSxDQUFDLG9CQUFQLENBQUEsRUFERjtLQUFBLE1BQUE7TUFHRSxLQUFBLEdBQVEsTUFBTSxDQUFDLGtCQUFQLENBQUEsQ0FBMkIsQ0FBQyxjQUE1QixDQUFBO2FBQ1IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLDBCQUFoQixFQUE0QztRQUFDLE9BQUEsS0FBRDtPQUE1QyxFQUpGOztFQUY4Qjs7RUFVaEMsNkJBQUEsR0FBZ0MsU0FBQyxNQUFEO0FBQzlCLFFBQUE7SUFBQSxhQUFBLEdBQWdCLE1BQU0sQ0FBQyxpQkFBUCxDQUFBO0lBQ2hCLE1BQUEsR0FBUyxNQUFNLENBQUM7SUFDaEIsTUFBQSxHQUFTLHVCQUFBLENBQXdCLE1BQXhCO0FBRVQsV0FBTSxtQkFBQSxDQUFvQixNQUFwQixFQUE0QixLQUFBLEdBQVEsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBcEMsQ0FBQSxJQUFvRSxDQUFJLEtBQUssQ0FBQyxvQkFBTixDQUEyQixNQUEzQixDQUE5RTtNQUNFLE1BQU0sQ0FBQyxTQUFQLENBQUE7SUFERjtXQUVBLENBQUksYUFBYSxDQUFDLE9BQWQsQ0FBc0IsTUFBTSxDQUFDLGlCQUFQLENBQUEsQ0FBdEI7RUFQMEI7O0VBU2hDLGFBQUEsR0FBZ0IsU0FBQyxNQUFELEVBQVMsR0FBVDtBQUNkLFFBQUE7SUFEd0IseUJBQVU7QUFDbEMsWUFBTyxTQUFQO0FBQUEsV0FDTyxVQURQO1FBRUksSUFBRyxRQUFBLElBQVksQ0FBZjtpQkFDRSxHQURGO1NBQUEsTUFBQTtpQkFHRTs7Ozt5QkFIRjs7QUFERztBQURQLFdBTU8sTUFOUDtRQU9JLE1BQUEsR0FBUyxtQkFBQSxDQUFvQixNQUFwQjtRQUNULElBQUcsUUFBQSxJQUFZLE1BQWY7aUJBQ0UsR0FERjtTQUFBLE1BQUE7aUJBR0U7Ozs7eUJBSEY7O0FBUko7RUFEYzs7RUFvQmhCLHVCQUFBLEdBQTBCLFNBQUMsTUFBRDtBQUN4QixRQUFBO0lBQUEsR0FBQSxHQUFNLE1BQU0sQ0FBQyxvQkFBUCxDQUFBO0lBQ04sSUFBRyxDQUFDLEdBQUcsQ0FBQyxHQUFKLEtBQVcsQ0FBWixDQUFBLElBQWtCLENBQUMsR0FBRyxDQUFDLE1BQUosR0FBYSxDQUFkLENBQXJCO2FBQ0UsSUFERjtLQUFBLE1BQUE7YUFHRSx3QkFBQSxDQUF5QixNQUF6QixFQUFpQyxHQUFHLENBQUMsR0FBSixHQUFVLENBQTNDLEVBSEY7O0VBRndCOztFQU8xQix1QkFBQSxHQUEwQixTQUFDLE1BQUQ7V0FDeEIsTUFBTSxDQUFDLCtCQUFQLENBQXVDLHVCQUFBLENBQXdCLE1BQXhCLENBQXZDO0VBRHdCOztFQUcxQixtQkFBQSxHQUFzQixTQUFDLE1BQUQ7V0FBWSx1QkFBQSxDQUF3QixNQUF4QixDQUErQixDQUFDO0VBQTVDOztFQUN0QixtQkFBQSxHQUFzQixTQUFDLE1BQUQ7V0FBWSx1QkFBQSxDQUF3QixNQUF4QixDQUErQixDQUFDO0VBQTVDOztFQUN0Qix3QkFBQSxHQUEyQixTQUFDLE1BQUQ7V0FBWSxNQUFNLENBQUMsT0FBTyxDQUFDLHdCQUFmLENBQUE7RUFBWjs7RUFDM0IsdUJBQUEsR0FBMEIsU0FBQyxNQUFEO1dBQVksTUFBTSxDQUFDLE9BQU8sQ0FBQyx1QkFBZixDQUFBO0VBQVo7O0VBRTFCLHFDQUFBLEdBQXdDLFNBQUMsTUFBRCxFQUFTLEdBQVQ7QUFDdEMsUUFBQTtJQUFBLEtBQUEsR0FBUSxvQkFBQSxDQUFxQixNQUFyQixFQUE2QixJQUE3QixFQUFtQyxHQUFuQzswRUFDVyxJQUFBLEtBQUEsQ0FBTSxHQUFOLEVBQVcsQ0FBWDtFQUZtQjs7RUFJeEMsU0FBQSxHQUFZLFNBQUMsTUFBRCxFQUFTLFNBQVQ7QUFDVixRQUFBO0lBQUEsT0FBQSxHQUFVO0lBQ1YsT0FBZSxFQUFmLEVBQUMsZUFBRCxFQUFRO0lBQ1IsUUFBQSxHQUFXLFNBQUMsR0FBRDtBQUFhLFVBQUE7TUFBWCxRQUFEO2FBQWEsbUJBQUQsRUFBVTtJQUF2QjtJQUNYLE1BQUEsR0FBUyxTQUFDLEdBQUQ7QUFBYSxVQUFBO01BQVgsUUFBRDthQUFhLGVBQUQsRUFBUTtJQUFyQjtJQUNULE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixPQUF6QixFQUFrQyxTQUFsQyxFQUE2QyxRQUE3QztJQUNBLElBQWlFLGFBQWpFO01BQUEsTUFBTSxDQUFDLDBCQUFQLENBQWtDLE9BQWxDLEVBQTJDLFNBQTNDLEVBQXNELE1BQXRELEVBQUE7O0lBQ0EsSUFBRyxlQUFBLElBQVcsYUFBZDthQUNNLElBQUEsS0FBQSxDQUFNLEtBQU4sRUFBYSxHQUFiLEVBRE47S0FBQSxNQUFBO2FBR0UsVUFIRjs7RUFQVTs7RUFlWixZQUFBLEdBQWUsU0FBQyxNQUFELEVBQVMsR0FBVCxFQUFjLE9BQWQ7QUFDYixRQUFBO0lBQUEsTUFBQSwrQ0FBNkIsTUFBTSxDQUFDLGVBQVAsQ0FBQTtJQUM3QixNQUFNLENBQUMsaUJBQVAsQ0FBeUIsQ0FBQyxHQUFELEVBQU0sTUFBTixDQUF6QixFQUF3QyxPQUF4QztXQUNBLE1BQU0sQ0FBQyxVQUFQLEdBQW9CO0VBSFA7O0VBS2YsZUFBQSxHQUFrQixTQUFDLE1BQUQsRUFBUyxNQUFUO1dBQ2hCLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixDQUFDLE1BQU0sQ0FBQyxZQUFQLENBQUEsQ0FBRCxFQUF3QixNQUF4QixDQUF6QjtFQURnQjs7RUFHbEIsVUFBQSxHQUFhLFNBQUMsTUFBRCxFQUFTLEdBQVQsRUFBK0IsRUFBL0I7QUFDWCxRQUFBO0lBRHFCLHFCQUFEO0lBQ25CLGFBQWM7SUFDZixFQUFBLENBQUcsTUFBSDtJQUNBLElBQUcsa0JBQUEsSUFBdUIsb0JBQTFCO2FBQ0UsTUFBTSxDQUFDLFVBQVAsR0FBb0IsV0FEdEI7O0VBSFc7O0VBVWIscUJBQUEsR0FBd0IsU0FBQyxNQUFEO0FBQ3RCLFFBQUE7SUFBQSxPQUFnQixNQUFNLENBQUMsaUJBQVAsQ0FBQSxDQUFoQixFQUFDLGNBQUQsRUFBTTtJQUNOLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGlCQUFoQixDQUFIO01BQ0UsU0FBQSxHQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixrQkFBaEI7TUFDWixJQUFHLENBQUEsQ0FBQSxHQUFJLE1BQUosSUFBSSxNQUFKLEdBQWEsU0FBYixDQUFIO1FBQ0UsSUFBQSxHQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsb0JBQWQsQ0FBbUMsQ0FBQyxDQUFDLEdBQUQsRUFBTSxDQUFOLENBQUQsRUFBVyxDQUFDLEdBQUQsRUFBTSxTQUFOLENBQVgsQ0FBbkM7ZUFDUCxPQUFPLENBQUMsSUFBUixDQUFhLElBQWIsRUFGRjtPQUFBLE1BQUE7ZUFJRSxNQUpGO09BRkY7O0VBRnNCOztFQWF4QixjQUFBLEdBQWlCLFNBQUMsTUFBRCxFQUFTLE9BQVQ7QUFDZixRQUFBOztNQUR3QixVQUFROztJQUMvQiw2QkFBRCxFQUFZO0lBQ1osT0FBTyxPQUFPLENBQUM7SUFDZixJQUFHLGdDQUFIO01BQ0UsSUFBVSxxQkFBQSxDQUFzQixNQUF0QixDQUFWO0FBQUEsZUFBQTtPQURGOztJQUdBLElBQUcsQ0FBSSxNQUFNLENBQUMsbUJBQVAsQ0FBQSxDQUFKLElBQW9DLFNBQXZDO01BQ0UsTUFBQSxHQUFTLFNBQUMsTUFBRDtlQUFZLE1BQU0sQ0FBQyxRQUFQLENBQUE7TUFBWjthQUNULFVBQUEsQ0FBVyxNQUFYLEVBQW1CLE9BQW5CLEVBQTRCLE1BQTVCLEVBRkY7O0VBTmU7O0VBVWpCLGVBQUEsR0FBa0IsU0FBQyxNQUFELEVBQVMsT0FBVDtBQUNoQixRQUFBOztNQUR5QixVQUFROztJQUNoQyxZQUFhO0lBQ2QsT0FBTyxPQUFPLENBQUM7SUFDZixJQUFHLENBQUksTUFBTSxDQUFDLGFBQVAsQ0FBQSxDQUFKLElBQThCLFNBQWpDO01BQ0UsTUFBQSxHQUFTLFNBQUMsTUFBRDtlQUFZLE1BQU0sQ0FBQyxTQUFQLENBQUE7TUFBWjthQUNULFVBQUEsQ0FBVyxNQUFYLEVBQW1CLE9BQW5CLEVBQTRCLE1BQTVCLEVBRkY7O0VBSGdCOztFQU9sQixrQkFBQSxHQUFxQixTQUFDLE1BQUQsRUFBUyxPQUFUO0FBQ25CLFFBQUE7O01BRDRCLFVBQVE7O0lBQ3BDLElBQU8sTUFBTSxDQUFDLFlBQVAsQ0FBQSxDQUFBLEtBQXlCLENBQWhDO01BQ0UsTUFBQSxHQUFTLFNBQUMsTUFBRDtlQUFZLE1BQU0sQ0FBQyxNQUFQLENBQUE7TUFBWjthQUNULFVBQUEsQ0FBVyxNQUFYLEVBQW1CLE9BQW5CLEVBQTRCLE1BQTVCLEVBRkY7O0VBRG1COztFQUtyQixvQkFBQSxHQUF1QixTQUFDLE1BQUQsRUFBUyxPQUFUO0FBQ3JCLFFBQUE7O01BRDhCLFVBQVE7O0lBQ3RDLElBQU8sbUJBQUEsQ0FBb0IsTUFBTSxDQUFDLE1BQTNCLENBQUEsS0FBc0MsTUFBTSxDQUFDLFlBQVAsQ0FBQSxDQUE3QztNQUNFLE1BQUEsR0FBUyxTQUFDLE1BQUQ7ZUFBWSxNQUFNLENBQUMsUUFBUCxDQUFBO01BQVo7YUFDVCxVQUFBLENBQVcsTUFBWCxFQUFtQixPQUFuQixFQUE0QixNQUE1QixFQUZGOztFQURxQjs7RUFNdkIsb0JBQUEsR0FBdUIsU0FBQyxNQUFEO0FBQ3JCLFFBQUE7SUFBQSxLQUFBLEdBQVEsTUFBTSxDQUFDLGlCQUFQLENBQUE7SUFDUixJQUFPLG1CQUFBLENBQW9CLE1BQU0sQ0FBQyxNQUEzQixDQUFBLEtBQXNDLEtBQUssQ0FBQyxHQUFuRDthQUNFLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixLQUFLLENBQUMsU0FBTixDQUFnQixDQUFDLENBQUMsQ0FBRixFQUFLLENBQUwsQ0FBaEIsQ0FBekIsRUFERjs7RUFGcUI7O0VBTXZCLGtCQUFBLEdBQXFCLFNBQUMsTUFBRDtBQUNuQixRQUFBO0lBQUEsS0FBQSxHQUFRLE1BQU0sQ0FBQyxpQkFBUCxDQUFBO0lBQ1IsSUFBTyxLQUFLLENBQUMsR0FBTixLQUFhLENBQXBCO2FBQ0UsTUFBTSxDQUFDLGlCQUFQLENBQXlCLEtBQUssQ0FBQyxTQUFOLENBQWdCLENBQUMsQ0FBQyxDQUFGLEVBQUssQ0FBTCxDQUFoQixDQUF6QixFQURGOztFQUZtQjs7RUFLckIsK0JBQUEsR0FBa0MsU0FBQyxNQUFELEVBQVMsR0FBVDtJQUNoQyxNQUFNLENBQUMsaUJBQVAsQ0FBeUIsQ0FBQyxHQUFELEVBQU0sQ0FBTixDQUF6QjtXQUNBLE1BQU0sQ0FBQywwQkFBUCxDQUFBO0VBRmdDOztFQUlsQyxvQkFBQSxHQUF1QixTQUFDLE1BQUQsRUFBUyxHQUFUO1dBQWlCLFdBQUEsQ0FBWSxHQUFaLEVBQWlCO01BQUEsR0FBQSxFQUFLLENBQUw7TUFBUSxHQUFBLEVBQUssbUJBQUEsQ0FBb0IsTUFBcEIsQ0FBYjtLQUFqQjtFQUFqQjs7RUFFdkIsb0JBQUEsR0FBdUIsU0FBQyxNQUFELEVBQVMsR0FBVDtXQUFpQixXQUFBLENBQVksR0FBWixFQUFpQjtNQUFBLEdBQUEsRUFBSyxDQUFMO01BQVEsR0FBQSxFQUFLLG1CQUFBLENBQW9CLE1BQXBCLENBQWI7S0FBakI7RUFBakI7O0VBR3ZCLDJCQUFBLEdBQThCLFNBQUMsTUFBRCxFQUFTLEdBQVQsRUFBd0IsSUFBeEI7QUFDNUIsUUFBQTtJQURzQyxlQUFLO0lBQVUsNEJBQUQsT0FBWTtJQUNoRSx3QkFBRyxZQUFZLElBQWY7YUFDRSxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsR0FBNUIsQ0FBaUMsa0JBRG5DO0tBQUEsTUFBQTthQUdFLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixHQUE1QixDQUFpQyw4QkFIbkM7O0VBRDRCOztFQU05QiwwQkFBQSxHQUE2QixTQUFDLE1BQUQsRUFBUyxHQUFUO1dBQzNCLE1BQU0sQ0FBQyxrQkFBUCxDQUEwQixNQUFNLENBQUMsb0JBQVAsQ0FBNEIsR0FBNUIsQ0FBMUI7RUFEMkI7O0VBRzdCLG9CQUFBLEdBQXVCLFNBQUMsTUFBRDtBQUNyQixRQUFBO1dBQUE7Ozs7a0JBQ0UsQ0FBQyxHQURILENBQ08sU0FBQyxHQUFEO2FBQ0gsTUFBTSxDQUFDLFlBQVksQ0FBQyw4QkFBcEIsQ0FBbUQsR0FBbkQ7SUFERyxDQURQLENBR0UsQ0FBQyxNQUhILENBR1UsU0FBQyxRQUFEO2FBQ04sa0JBQUEsSUFBYyxxQkFBZCxJQUErQjtJQUR6QixDQUhWO0VBRHFCOztFQVF2QixtQ0FBQSxHQUFzQyxTQUFDLE1BQUQsRUFBUyxTQUFULEVBQW9CLEdBQXBCO0FBQ3BDLFFBQUE7SUFEeUQsaUNBQUQsTUFBa0I7O01BQzFFLGtCQUFtQjs7V0FDbkIsb0JBQUEsQ0FBcUIsTUFBckIsQ0FBNEIsQ0FBQyxNQUE3QixDQUFvQyxTQUFDLElBQUQ7QUFDbEMsVUFBQTtNQURvQyxvQkFBVTtNQUM5QyxJQUFHLGVBQUg7ZUFDRSxDQUFBLFFBQUEsSUFBWSxTQUFaLElBQVksU0FBWixJQUF5QixNQUF6QixFQURGO09BQUEsTUFBQTtlQUdFLENBQUEsUUFBQSxHQUFXLFNBQVgsSUFBVyxTQUFYLElBQXdCLE1BQXhCLEVBSEY7O0lBRGtDLENBQXBDO0VBRm9DOztFQVF0Qyx5QkFBQSxHQUE0QixTQUFDLE1BQUQsRUFBUyxRQUFUO0FBQzFCLFFBQUE7SUFBQSxPQUF5QixRQUFRLENBQUMsR0FBVCxDQUFhLFNBQUMsR0FBRDthQUNwQyxNQUFNLENBQUMsdUJBQVAsQ0FBK0IsR0FBL0IsRUFBb0M7UUFBQSxjQUFBLEVBQWdCLElBQWhCO09BQXBDO0lBRG9DLENBQWIsQ0FBekIsRUFBQyxvQkFBRCxFQUFhO1dBRWIsVUFBVSxDQUFDLEtBQVgsQ0FBaUIsUUFBakI7RUFIMEI7O0VBSzVCLHNCQUFBLEdBQXlCLFNBQUMsTUFBRCxFQUFTLEdBQVQ7V0FDdkIsTUFBTSxDQUFDLGVBQWUsQ0FBQyxtQkFBdkIsQ0FBMkMsR0FBM0M7RUFEdUI7O0VBR3pCLHlCQUFBLEdBQTRCLFNBQUMsSUFBRDtBQUMxQixRQUFBO0FBQUE7QUFBQTtTQUFBLHNDQUFBOztVQUEwQixHQUFBLEdBQU0sQ0FBTixJQUFZLENBQUMsR0FBQSxHQUFNLENBQU4sS0FBVyxDQUFDLENBQWI7c0JBQ3BDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBZCxDQUF5QixHQUF6Qjs7QUFERjs7RUFEMEI7O0VBSTVCLGlCQUFBLEdBQW9CLFNBQUMsTUFBRCxFQUFTLFNBQVQsRUFBb0IsU0FBcEIsRUFBK0IsRUFBL0I7QUFDbEIsUUFBQTtJQUFBLFNBQUEsR0FBWSxLQUFLLENBQUMsVUFBTixDQUFpQixTQUFqQjtJQUNaLFFBQUE7O0FBQVcsY0FBTyxTQUFQO0FBQUEsYUFDSixTQURJO2lCQUNXOzs7OztBQURYLGFBRUosVUFGSTtpQkFFWTs7Ozs7QUFGWjs7SUFJWCxZQUFBLEdBQWU7SUFDZixJQUFBLEdBQU8sU0FBQTthQUNMLFlBQUEsR0FBZTtJQURWO0lBR1AsWUFBQTtBQUFlLGNBQU8sU0FBUDtBQUFBLGFBQ1IsU0FEUTtpQkFDTyxTQUFDLEdBQUQ7QUFBZ0IsZ0JBQUE7WUFBZCxXQUFEO21CQUFlLFFBQVEsQ0FBQyxhQUFULENBQXVCLFNBQXZCO1VBQWhCO0FBRFAsYUFFUixVQUZRO2lCQUVRLFNBQUMsR0FBRDtBQUFnQixnQkFBQTtZQUFkLFdBQUQ7bUJBQWUsUUFBUSxDQUFDLFVBQVQsQ0FBb0IsU0FBcEI7VUFBaEI7QUFGUjs7QUFJZixTQUFBLDBDQUFBOztZQUF5QixhQUFBLEdBQWdCLHNCQUFBLENBQXVCLE1BQXZCLEVBQStCLEdBQS9COzs7TUFDdkMsTUFBQSxHQUFTO01BQ1QsT0FBQSxHQUFVO01BRVYsYUFBQSxHQUFnQixhQUFhLENBQUMsZ0JBQWQsQ0FBQTtBQUNoQjtBQUFBLFdBQUEsd0NBQUE7O1FBQ0UsYUFBYSxDQUFDLElBQWQsQ0FBQTtRQUNBLElBQUcsR0FBQSxHQUFNLENBQVQ7VUFDRSxLQUFBLEdBQVEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFkLENBQXlCLEdBQXpCO1VBQ1IsSUFBRyxDQUFDLEdBQUEsR0FBTSxDQUFQLENBQUEsS0FBYSxDQUFoQjtZQUNFLEtBREY7V0FBQSxNQUFBO1lBR0UsUUFBQSxHQUFlLElBQUEsS0FBQSxDQUFNLEdBQU4sRUFBVyxNQUFYO1lBQ2YsT0FBTyxDQUFDLElBQVIsQ0FBYTtjQUFDLE9BQUEsS0FBRDtjQUFRLFVBQUEsUUFBUjtjQUFrQixNQUFBLElBQWxCO2FBQWIsRUFKRjtXQUZGO1NBQUEsTUFBQTtVQVFFLE1BQUEsSUFBVSxJQVJaOztBQUZGO01BWUEsT0FBQSxHQUFVLE9BQU8sQ0FBQyxNQUFSLENBQWUsWUFBZjtNQUNWLElBQXFCLFNBQUEsS0FBYSxVQUFsQztRQUFBLE9BQU8sQ0FBQyxPQUFSLENBQUEsRUFBQTs7QUFDQSxXQUFBLDJDQUFBOztRQUNFLEVBQUEsQ0FBRyxNQUFIO1FBQ0EsSUFBQSxDQUFjLFlBQWQ7QUFBQSxpQkFBQTs7QUFGRjtNQUdBLElBQUEsQ0FBYyxZQUFkO0FBQUEsZUFBQTs7QUF0QkY7RUFka0I7O0VBc0NwQixnQ0FBQSxHQUFtQyxTQUFDLE1BQUQsRUFBUyxTQUFULEVBQW9CLFNBQXBCLEVBQStCLEtBQS9CO0FBQ2pDLFFBQUE7SUFBQSxLQUFBLEdBQVE7SUFDUixpQkFBQSxDQUFrQixNQUFsQixFQUEwQixTQUExQixFQUFxQyxTQUFyQyxFQUFnRCxTQUFDLElBQUQ7TUFDOUMsSUFBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQVgsQ0FBa0IsS0FBbEIsQ0FBQSxJQUE0QixDQUEvQjtRQUNFLElBQUksQ0FBQyxJQUFMLENBQUE7ZUFDQSxLQUFBLEdBQVEsSUFBSSxDQUFDLFNBRmY7O0lBRDhDLENBQWhEO1dBSUE7RUFOaUM7O0VBUW5DLDRCQUFBLEdBQStCLFNBQUMsTUFBRCxFQUFTLEdBQVQ7QUFLN0IsUUFBQTtJQUFBLElBQUcsYUFBQSxHQUFnQixzQkFBQSxDQUF1QixNQUF2QixFQUErQixHQUEvQixDQUFuQjthQUNFLHlCQUFBLENBQTBCLGFBQTFCLENBQXdDLENBQUMsSUFBekMsQ0FBOEMsU0FBQyxLQUFEO2VBQzVDLGVBQUEsQ0FBZ0IsTUFBaEIsRUFBd0IsS0FBeEI7TUFENEMsQ0FBOUMsRUFERjtLQUFBLE1BQUE7YUFJRSxNQUpGOztFQUw2Qjs7RUFZL0IsZUFBQSxHQUFrQixTQUFDLE1BQUQsRUFBUyxLQUFUO0FBQ2hCLFFBQUE7QUFBQSxZQUFPLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FBbUIsQ0FBQyxTQUEzQjtBQUFBLFdBQ08sV0FEUDtBQUFBLFdBQ29CLGVBRHBCO1FBRUksTUFBQSxHQUFTLENBQUMsc0JBQUQ7QUFETztBQURwQixXQUdPLGFBSFA7UUFJSSxNQUFBLEdBQVMsQ0FBQyxnQkFBRCxFQUFtQixhQUFuQixFQUFrQyxjQUFsQztBQUROO0FBSFA7UUFNSSxNQUFBLEdBQVMsQ0FBQyxnQkFBRCxFQUFtQixhQUFuQjtBQU5iO0lBT0EsT0FBQSxHQUFjLElBQUEsTUFBQSxDQUFPLEdBQUEsR0FBTSxNQUFNLENBQUMsR0FBUCxDQUFXLENBQUMsQ0FBQyxZQUFiLENBQTBCLENBQUMsSUFBM0IsQ0FBZ0MsR0FBaEMsQ0FBYjtXQUNkLE9BQU8sQ0FBQyxJQUFSLENBQWEsS0FBYjtFQVRnQjs7RUFhbEIsMkJBQUEsR0FBOEIsU0FBQyxNQUFELEVBQVMsS0FBVDtBQUM1QixRQUFBO0lBQUEsYUFBQSxHQUFnQixNQUFNLENBQUM7SUFDdkIsZ0JBQUEsR0FBbUIsTUFBTSxDQUFDLHFCQUFQLENBQUEsQ0FBQSxHQUFpQyxDQUFDLE1BQU0sQ0FBQyxjQUFQLENBQUEsQ0FBQSxHQUEwQixDQUEzQjtJQUNwRCxTQUFBLEdBQVksYUFBYSxDQUFDLFlBQWQsQ0FBQSxDQUFBLEdBQStCO0lBQzNDLFdBQUEsR0FBYyxhQUFhLENBQUMsZUFBZCxDQUFBLENBQUEsR0FBa0M7SUFDaEQsTUFBQSxHQUFTLGFBQWEsQ0FBQyw4QkFBZCxDQUE2QyxLQUE3QyxDQUFtRCxDQUFDO0lBRTdELE1BQUEsR0FBUyxDQUFDLFdBQUEsR0FBYyxNQUFmLENBQUEsSUFBMEIsQ0FBQyxNQUFBLEdBQVMsU0FBVjtXQUNuQyxNQUFNLENBQUMsc0JBQVAsQ0FBOEIsS0FBOUIsRUFBcUM7TUFBQyxRQUFBLE1BQUQ7S0FBckM7RUFSNEI7O0VBVTlCLFdBQUEsR0FBYyxTQUFDLGFBQUQsRUFBZ0IsTUFBaEI7QUFDWixRQUFBO0lBQUEsT0FBQSxHQUFVLE1BQU0sQ0FBQyxHQUFQLENBQVcsU0FBQyxLQUFEO2FBQVcsS0FBSyxDQUFDLEtBQU4sQ0FBWSxHQUFaO0lBQVgsQ0FBWDtBQUVWLFNBQUEseUNBQUE7O01BQ0UsYUFBQSxHQUFnQjtBQUNoQixXQUFBLDhDQUFBOztRQUNFLElBQXNCLGFBQWEsQ0FBQyxTQUFTLENBQUMsUUFBeEIsQ0FBaUMsU0FBakMsQ0FBdEI7VUFBQSxhQUFBLElBQWlCLEVBQWpCOztBQURGO01BRUEsSUFBZSxhQUFBLEtBQWlCLFVBQVUsQ0FBQyxNQUEzQztBQUFBLGVBQU8sS0FBUDs7QUFKRjtXQUtBO0VBUlk7O0VBVWQsZ0JBQUEsR0FBbUIsU0FBQyxJQUFEO1dBQ2pCLElBQUksQ0FBQyxLQUFMLENBQVcsU0FBWCxDQUFxQixDQUFDLE1BQXRCLEtBQWdDO0VBRGY7O0VBZW5CLHlDQUFBLEdBQTRDLFNBQUMsTUFBRCxFQUFTLEtBQVQsRUFBZ0IsT0FBaEI7QUFDMUMsUUFBQTs7TUFEMEQsVUFBUTs7SUFDakUsNkNBQUQsRUFBb0IsNkJBQXBCLEVBQStCLDZDQUEvQixFQUFrRDtJQUNsRCxJQUFPLG1CQUFKLElBQXNCLDJCQUF6Qjs7UUFDRSxTQUFVLE1BQU0sQ0FBQyxhQUFQLENBQUE7O01BQ1YsT0FBaUMsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxPQUFULEVBQWtCLHdCQUFBLENBQXlCLE1BQXpCLEVBQWlDLE9BQWpDLENBQWxCLENBQWpDLEVBQUMsMEJBQUQsRUFBWSwyQ0FGZDs7O01BR0Esb0JBQXFCOztJQUVyQixnQkFBQSxHQUFtQixrQ0FBQSxDQUFtQyxNQUFuQyxFQUEyQyxLQUEzQztJQUNuQixZQUFBLEdBQW1CLElBQUEsTUFBQSxDQUFPLEdBQUEsR0FBRyxDQUFDLENBQUMsQ0FBQyxZQUFGLENBQWUsaUJBQWYsQ0FBRCxDQUFILEdBQXNDLElBQTdDO0lBRW5CLElBQUcsSUFBSSxDQUFDLElBQUwsQ0FBVSxnQkFBVixDQUFIO01BQ0UsTUFBQSxHQUFTO01BQ1QsSUFBQSxHQUFPO01BQ1AsU0FBQSxHQUFnQixJQUFBLE1BQUEsQ0FBTyxNQUFQLEVBSGxCO0tBQUEsTUFJSyxJQUFHLFlBQVksQ0FBQyxJQUFiLENBQWtCLGdCQUFsQixDQUFBLElBQXdDLENBQUksU0FBUyxDQUFDLElBQVYsQ0FBZSxnQkFBZixDQUEvQztNQUNILElBQUEsR0FBTztNQUNQLElBQUcsaUJBQUg7UUFDRSxNQUFBLEdBQVMsQ0FBQyxDQUFDLFlBQUYsQ0FBZSxnQkFBZjtRQUNULFNBQUEsR0FBZ0IsSUFBQSxNQUFBLENBQU8sTUFBUCxFQUZsQjtPQUFBLE1BQUE7UUFJRSxTQUFBLEdBQVksYUFKZDtPQUZHO0tBQUEsTUFBQTtNQVFILElBQUEsR0FBTyxPQVJKOztJQVVMLEtBQUEsR0FBUSxrQ0FBQSxDQUFtQyxNQUFuQyxFQUEyQyxLQUEzQyxFQUFrRDtNQUFDLFdBQUEsU0FBRDtLQUFsRDtXQUNSO01BQUMsTUFBQSxJQUFEO01BQU8sT0FBQSxLQUFQOztFQXpCMEM7O0VBMkI1Qyw4QkFBQSxHQUFpQyxTQUFDLE1BQUQsRUFBUyxLQUFULEVBQWdCLE9BQWhCO0FBQy9CLFFBQUE7O01BRCtDLFVBQVE7O0lBQ3ZELGlCQUFBLHVEQUFnRDtJQUNoRCxPQUFPLE9BQU8sQ0FBQztJQUNmLE9BQWdCLHlDQUFBLENBQTBDLE1BQTFDLEVBQWtELEtBQWxELEVBQXlELE9BQXpELENBQWhCLEVBQUMsa0JBQUQsRUFBUTtJQUNSLElBQUEsR0FBTyxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsS0FBNUI7SUFDUCxPQUFBLEdBQVUsQ0FBQyxDQUFDLFlBQUYsQ0FBZSxJQUFmO0lBRVYsSUFBRyxJQUFBLEtBQVEsTUFBUixJQUFtQixpQkFBdEI7TUFFRSxhQUFBLEdBQW1CLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWCxDQUFILEdBQXlCLEtBQXpCLEdBQW9DO01BQ3BELFdBQUEsR0FBaUIsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYLENBQUgsR0FBeUIsS0FBekIsR0FBb0M7TUFDbEQsT0FBQSxHQUFVLGFBQUEsR0FBZ0IsT0FBaEIsR0FBMEIsWUFKdEM7O1dBS0ksSUFBQSxNQUFBLENBQU8sT0FBUCxFQUFnQixHQUFoQjtFQVoyQjs7RUFjakMsaUNBQUEsR0FBb0MsU0FBQyxNQUFELEVBQVMsS0FBVCxFQUFnQixPQUFoQjs7TUFBZ0IsVUFBUTs7SUFDMUQsT0FBQSxHQUFVO01BQUMsU0FBQSxFQUFXLE1BQU0sQ0FBQyxhQUFQLENBQUEsQ0FBc0IsQ0FBQyxhQUF2QixDQUFBLENBQVo7TUFBb0QsaUJBQUEsRUFBbUIsS0FBdkU7O1dBQ1YsOEJBQUEsQ0FBK0IsTUFBL0IsRUFBdUMsS0FBdkMsRUFBOEMsT0FBOUM7RUFGa0M7O0VBS3BDLHdCQUFBLEdBQTJCLFNBQUMsTUFBRCxFQUFTLEdBQVQ7QUFDekIsUUFBQTtJQURtQyxZQUFEO0lBQ2xDLGlCQUFBLEdBQW9CLDZCQUFBLENBQThCLE1BQTlCOztNQUNwQixZQUFpQixJQUFBLE1BQUEsQ0FBTyxnQkFBQSxHQUFnQixDQUFDLENBQUMsQ0FBQyxZQUFGLENBQWUsaUJBQWYsQ0FBRCxDQUFoQixHQUFtRCxJQUExRDs7V0FDakI7TUFBQyxXQUFBLFNBQUQ7TUFBWSxtQkFBQSxpQkFBWjs7RUFIeUI7O0VBSzNCLGdDQUFBLEdBQW1DLFNBQUMsTUFBRCxFQUFTLEtBQVQsRUFBZ0IsR0FBaEI7QUFDakMsUUFBQTtJQURrRCwyQkFBRCxNQUFZO0lBQzdELFNBQUEsR0FBWSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQVAsRUFBWSxDQUFaLENBQUQsRUFBaUIsS0FBakI7SUFFWixLQUFBLEdBQVE7SUFDUixNQUFNLENBQUMsMEJBQVAsQ0FBa0MsU0FBbEMsRUFBNkMsU0FBN0MsRUFBd0QsU0FBQyxJQUFEO0FBQ3RELFVBQUE7TUFEd0Qsb0JBQU8sNEJBQVc7TUFDMUUsSUFBVSxTQUFBLEtBQWEsRUFBYixJQUFvQixLQUFLLENBQUMsS0FBSyxDQUFDLE1BQVosS0FBd0IsQ0FBdEQ7QUFBQSxlQUFBOztNQUVBLElBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFaLENBQXVCLEtBQXZCLENBQUg7UUFDRSxJQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsb0JBQVYsQ0FBK0IsS0FBL0IsQ0FBSDtVQUNFLEtBQUEsR0FBUSxLQUFLLENBQUMsTUFEaEI7O2VBRUEsSUFBQSxDQUFBLEVBSEY7O0lBSHNELENBQXhEOzJCQVFBLFFBQVE7RUFaeUI7O0VBY25DLDBCQUFBLEdBQTZCLFNBQUMsTUFBRCxFQUFTLEtBQVQsRUFBZ0IsR0FBaEI7QUFDM0IsUUFBQTtJQUQ0QywyQkFBRCxNQUFZO0lBQ3ZELFNBQUEsR0FBWSxDQUFDLEtBQUQsRUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFQLEVBQVksS0FBWixDQUFSO0lBRVosS0FBQSxHQUFRO0lBQ1IsTUFBTSxDQUFDLGlCQUFQLENBQXlCLFNBQXpCLEVBQW9DLFNBQXBDLEVBQStDLFNBQUMsSUFBRDtBQUM3QyxVQUFBO01BRCtDLG9CQUFPLDRCQUFXO01BQ2pFLElBQVUsU0FBQSxLQUFhLEVBQWIsSUFBb0IsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFaLEtBQXdCLENBQXREO0FBQUEsZUFBQTs7TUFFQSxJQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsYUFBVixDQUF3QixLQUF4QixDQUFIO1FBQ0UsSUFBRyxLQUFLLENBQUMsS0FBSyxDQUFDLGlCQUFaLENBQThCLEtBQTlCLENBQUg7VUFDRSxLQUFBLEdBQVEsS0FBSyxDQUFDLElBRGhCOztlQUVBLElBQUEsQ0FBQSxFQUhGOztJQUg2QyxDQUEvQzsyQkFRQSxRQUFRO0VBWm1COztFQWM3QixrQ0FBQSxHQUFxQyxTQUFDLE1BQUQsRUFBUyxRQUFULEVBQW1CLE9BQW5CO0FBQ25DLFFBQUE7O01BRHNELFVBQVE7O0lBQzlELFdBQUEsR0FBYywwQkFBQSxDQUEyQixNQUEzQixFQUFtQyxRQUFuQyxFQUE2QyxPQUE3QztJQUNkLGFBQUEsR0FBZ0IsZ0NBQUEsQ0FBaUMsTUFBakMsRUFBeUMsV0FBekMsRUFBc0QsT0FBdEQ7V0FDWixJQUFBLEtBQUEsQ0FBTSxhQUFOLEVBQXFCLFdBQXJCO0VBSCtCOztFQUtyQyxxQkFBQSxHQUF3QixTQUFDLEdBQUQsRUFBZSxPQUFmO0FBR3RCLFFBQUE7SUFId0IsbUJBQU87O01BQU0sVUFBUTs7SUFHN0MsTUFBQSxHQUFTLEdBQUcsQ0FBQztJQUNiLElBQUcsR0FBRyxDQUFDLE1BQUosS0FBYyxDQUFqQjtNQUNFLE1BQUEsR0FBUyxXQUFBLENBQVksR0FBRyxDQUFDLEdBQUosR0FBVSxDQUF0QixFQUF5QjtRQUFBLEdBQUEsRUFBSyxLQUFLLENBQUMsR0FBWDtPQUF6QixFQURYOztJQUVBLDhDQUFxQixLQUFyQjthQUNNLElBQUEsS0FBQSxDQUFNLEtBQU4sRUFBYSxDQUFDLE1BQUQsRUFBUyxLQUFULENBQWIsRUFETjtLQUFBLE1BQUE7YUFHTSxJQUFBLEtBQUEsQ0FBTSxDQUFDLEtBQUssQ0FBQyxHQUFQLEVBQVksQ0FBWixDQUFOLEVBQXNCLENBQUMsTUFBRCxFQUFTLEtBQVQsQ0FBdEIsRUFITjs7RUFOc0I7O0VBYXhCLDZCQUFBLEdBQWdDLFNBQUMsS0FBRDtBQUM5QixRQUFBO0lBQUMsbUJBQUQsRUFBUTtJQUNSLElBQUcsR0FBRyxDQUFDLE1BQUosS0FBYyxDQUFqQjtNQUNFLE1BQUEsR0FBUyxXQUFBLENBQVksR0FBRyxDQUFDLEdBQUosR0FBVSxDQUF0QixFQUF5QjtRQUFBLEdBQUEsRUFBSyxLQUFLLENBQUMsR0FBWDtPQUF6QjthQUNMLElBQUEsS0FBQSxDQUFNLEtBQU4sRUFBYSxDQUFDLE1BQUQsRUFBUyxLQUFULENBQWIsRUFGTjtLQUFBLE1BQUE7YUFJRSxNQUpGOztFQUY4Qjs7RUFRaEMsVUFBQSxHQUFhLFNBQUMsTUFBRCxFQUFTLE9BQVQ7QUFDWCxRQUFBO0lBQUEsTUFBQSxHQUFTO0lBQ1QsTUFBTSxDQUFDLElBQVAsQ0FBWSxPQUFaLEVBQXFCLFNBQUMsR0FBRDtBQUNuQixVQUFBO01BRHFCLFFBQUQ7YUFDcEIsTUFBTSxDQUFDLElBQVAsQ0FBWSxLQUFaO0lBRG1CLENBQXJCO1dBRUE7RUFKVzs7RUFNYix1QkFBQSxHQUEwQixTQUFDLE1BQUQsRUFBUyxHQUFULEVBQWMsT0FBZDtBQUN4QixRQUFBO0lBQUEsTUFBQSxHQUFTO0lBQ1QsU0FBQSxHQUFZLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixHQUEvQjtJQUNaLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixPQUF6QixFQUFrQyxTQUFsQyxFQUE2QyxTQUFDLEdBQUQ7QUFDM0MsVUFBQTtNQUQ2QyxRQUFEO2FBQzVDLE1BQU0sQ0FBQyxJQUFQLENBQVksS0FBWjtJQUQyQyxDQUE3QztXQUVBO0VBTHdCOztFQU8xQixvQkFBQSxHQUF1QixTQUFDLE1BQUQsRUFBUyxPQUFULEVBQWtCLEdBQWxCLEVBQXVCLEdBQXZCO0FBQ3JCLFFBQUE7SUFENkMsMkJBQUQsTUFBWTtJQUN4RCxJQUFHLFNBQUEsS0FBYSxVQUFoQjtNQUNFLGdCQUFBLEdBQW1CLDZCQURyQjtLQUFBLE1BQUE7TUFHRSxnQkFBQSxHQUFtQixvQkFIckI7O0lBS0EsS0FBQSxHQUFRO0lBQ1IsU0FBQSxHQUFZLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixHQUEvQjtJQUNaLE1BQU8sQ0FBQSxnQkFBQSxDQUFQLENBQXlCLE9BQXpCLEVBQWtDLFNBQWxDLEVBQTZDLFNBQUMsS0FBRDthQUFXLEtBQUEsR0FBUSxLQUFLLENBQUM7SUFBekIsQ0FBN0M7V0FDQTtFQVRxQjs7RUFXdkIsb0NBQUEsR0FBdUMsU0FBQyxNQUFELEVBQVMsR0FBVDtBQUNyQyxRQUFBO0lBQUEsT0FBQSxHQUFVLE1BQU0sQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsV0FBckMsQ0FBaUQ7TUFBQSxhQUFBLEVBQWUsR0FBZjtLQUFqRDtJQUVWLFVBQUEsR0FBYTtJQUNiLFFBQUEsR0FBVztBQUVYO0FBQUEsU0FBQSxzQ0FBQTs7TUFDRSxPQUFlLE1BQU0sQ0FBQyxRQUFQLENBQUEsQ0FBZixFQUFDLGtCQUFELEVBQVE7TUFDUixJQUFBLENBQU8sVUFBUDtRQUNFLFVBQUEsR0FBYTtRQUNiLFFBQUEsR0FBVztBQUNYLGlCQUhGOztNQUtBLElBQUcsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsVUFBakIsQ0FBSDtRQUNFLFVBQUEsR0FBYTtRQUNiLFFBQUEsR0FBVyxJQUZiOztBQVBGO0lBV0EsSUFBRyxvQkFBQSxJQUFnQixrQkFBbkI7YUFDTSxJQUFBLEtBQUEsQ0FBTSxVQUFOLEVBQWtCLFFBQWxCLEVBRE47O0VBakJxQzs7RUFxQnZDLHFCQUFBLEdBQXdCLFNBQUMsTUFBRCxFQUFTLEtBQVQsRUFBZ0IsU0FBaEI7QUFDdEIsUUFBQTtJQUFBLEtBQUEsR0FBUSxLQUFLLENBQUMsVUFBTixDQUFpQixLQUFqQjtJQUVSLFFBQUEsR0FBVztBQUNYLFlBQU8sU0FBUDtBQUFBLFdBQ08sU0FEUDtRQUVJLEtBQUEsR0FBUSxLQUFLLENBQUMsU0FBTixDQUFnQixDQUFDLENBQUQsRUFBSSxDQUFDLENBQUwsQ0FBaEI7UUFDUixHQUFBLEdBQU0sTUFBTSxDQUFDLHVCQUFQLENBQStCLEtBQUssQ0FBQyxHQUFyQyxDQUF5QyxDQUFDO1FBRWhELElBQUcsS0FBSyxDQUFDLE9BQU4sQ0FBYyxHQUFkLENBQUg7VUFDRSxRQUFBLEdBQVcsS0FEYjtTQUFBLE1BRUssSUFBRyxLQUFLLENBQUMsYUFBTixDQUFvQixHQUFwQixDQUFIO1VBQ0gsUUFBQSxHQUFXO1VBQ1gsS0FBQSxHQUFZLElBQUEsS0FBQSxDQUFNLEtBQUssQ0FBQyxHQUFOLEdBQVksQ0FBbEIsRUFBcUIsQ0FBckIsRUFGVDs7UUFJTCxLQUFBLEdBQVEsS0FBSyxDQUFDLEdBQU4sQ0FBVSxLQUFWLEVBQWlCLE1BQU0sQ0FBQyxvQkFBUCxDQUFBLENBQWpCO0FBVkw7QUFEUCxXQWFPLFVBYlA7UUFjSSxLQUFBLEdBQVEsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsQ0FBQyxDQUFELEVBQUksQ0FBQyxDQUFMLENBQWhCO1FBRVIsSUFBRyxLQUFLLENBQUMsTUFBTixHQUFlLENBQWxCO1VBQ0UsUUFBQSxHQUFXO1VBQ1gsTUFBQSxHQUFTLEtBQUssQ0FBQyxHQUFOLEdBQVk7VUFDckIsR0FBQSxHQUFNLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixNQUEvQixDQUFzQyxDQUFDO1VBQzdDLEtBQUEsR0FBWSxJQUFBLEtBQUEsQ0FBTSxNQUFOLEVBQWMsR0FBRyxDQUFDLE1BQWxCLEVBSmQ7O1FBTUEsS0FBQSxHQUFRLEtBQUssQ0FBQyxHQUFOLENBQVUsS0FBVixFQUFpQixLQUFLLENBQUMsSUFBdkI7QUF0Qlo7SUF3QkEsSUFBRyxRQUFIO2FBQ0UsTUFERjtLQUFBLE1BQUE7TUFHRSxXQUFBLEdBQWMsTUFBTSxDQUFDLCtCQUFQLENBQXVDLEtBQXZDLEVBQThDO1FBQUEsYUFBQSxFQUFlLFNBQWY7T0FBOUM7YUFDZCxNQUFNLENBQUMsK0JBQVAsQ0FBdUMsV0FBdkMsRUFKRjs7RUE1QnNCOztFQWtDeEIsK0JBQUEsR0FBa0MsU0FBQyxNQUFELEVBQVMsS0FBVCxFQUFnQixLQUFoQixFQUF1QixTQUF2QjtBQUNoQyxRQUFBO0lBQUEsUUFBQSxHQUFXLHFCQUFBLENBQXNCLE1BQXRCLEVBQThCLEtBQU0sQ0FBQSxLQUFBLENBQXBDLEVBQTRDLFNBQTVDO0FBQ1gsWUFBTyxLQUFQO0FBQUEsV0FDTyxPQURQO2VBRVEsSUFBQSxLQUFBLENBQU0sUUFBTixFQUFnQixLQUFLLENBQUMsR0FBdEI7QUFGUixXQUdPLEtBSFA7ZUFJUSxJQUFBLEtBQUEsQ0FBTSxLQUFLLENBQUMsS0FBWixFQUFtQixRQUFuQjtBQUpSO0VBRmdDOztFQVNsQyxlQUFBLEdBQWtCLFNBQUMsSUFBRCxFQUFPLE9BQVA7QUFDaEIsUUFBQTtJQUFBLE9BQUEsR0FBVSxRQUFRLENBQUMsYUFBVCxDQUF1QixJQUF2QjtJQUVWLElBQUcsT0FBTyxDQUFDLFdBQVIsS0FBdUIsV0FBMUI7TUFDRSxPQUFBLEdBQVUsUUFBUSxDQUFDLGVBQVQsQ0FBeUIsSUFBekIsRUFBK0IsT0FBL0IsRUFEWjtLQUFBLE1BQUE7TUFHRSxPQUFBLEdBQVUsT0FBTyxDQUFDO01BQ2xCLElBQXlDLHlCQUF6QztRQUFBLE9BQU8sQ0FBQyxTQUFSLEdBQW9CLE9BQU8sQ0FBQyxVQUE1QjtPQUpGOztXQUtBO0VBUmdCOztFQVVsQixVQUFBLEdBQWEsU0FBQyxJQUFELEVBQU8sRUFBUDtXQUNQLElBQUEsT0FBQSxDQUFRLFNBQUMsT0FBRDtBQUNWLFVBQUE7TUFBQSxJQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixJQUE5QixDQUFIO1FBQ0UsR0FBQSxHQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWQsQ0FBK0IsSUFBL0I7ZUFDTixPQUFBLENBQVEsR0FBUixFQUZGO09BQUEsTUFBQTtlQUlFLFVBQUEsR0FBYSxJQUFJLENBQUMsUUFBUSxDQUFDLG9CQUFkLENBQW1DLFNBQUMsR0FBRDtVQUM5QyxJQUFHLEdBQUcsQ0FBQyxJQUFKLEtBQVksSUFBZjtZQUNFLFVBQVUsQ0FBQyxPQUFYLENBQUE7bUJBQ0EsT0FBQSxDQUFRLEdBQVIsRUFGRjs7UUFEOEMsQ0FBbkMsRUFKZjs7SUFEVSxDQUFSO0VBRE87O0VBV2IsbUJBQUEsR0FBc0IsU0FBQyxNQUFELEVBQVMsSUFBVDtJQUNwQixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsTUFBTSxDQUFDLE9BQTlCLEVBQXVDLG1CQUF2QztXQUNBLFVBQUEsQ0FBVyxrQkFBWCxDQUE4QixDQUFDLElBQS9CLENBQW9DLFNBQUMsR0FBRDtBQUNsQyxVQUFBO01BQUMsa0JBQW1CLEdBQUcsQ0FBQztNQUN4QixJQUFHLHVCQUFIO1FBQ0UsZUFBZSxDQUFDLFVBQVUsQ0FBQyxPQUEzQixDQUFtQyxJQUFuQztlQUNBLGVBQWUsQ0FBQyxPQUFoQixDQUFBLEVBRkY7O0lBRmtDLENBQXBDO0VBRm9COztFQVF0QixXQUFBLEdBQWMsU0FBQyxNQUFELEVBQVMsR0FBVDtBQUNaLFFBQUE7eUJBRHFCLE1BQVcsSUFBVixnQkFBSztJQUMzQixJQUFrQyxXQUFsQztNQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsR0FBTCxDQUFTLE1BQVQsRUFBaUIsR0FBakIsRUFBVDs7SUFDQSxJQUFrQyxXQUFsQztNQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsR0FBTCxDQUFTLE1BQVQsRUFBaUIsR0FBakIsRUFBVDs7V0FDQTtFQUhZOztFQUtkLHNCQUFBLEdBQXlCLFNBQUMsTUFBRCxFQUFTLEtBQVQ7QUFDdkIsUUFBQTtBQUFBLFNBQUEsd0NBQUE7O1VBQXlCLEtBQUssQ0FBQyxhQUFOLENBQW9CLEtBQXBCO0FBQ3ZCLGVBQU87O0FBRFQ7V0FFQTtFQUh1Qjs7RUFLekIsY0FBQSxHQUFpQixTQUFDLEVBQUQ7V0FDZixTQUFBO0FBQ0UsVUFBQTtNQUREO2FBQ0MsQ0FBSSxFQUFBLGFBQUcsSUFBSDtJQUROO0VBRGU7O0VBSWpCLE9BQUEsR0FBVSxTQUFDLE1BQUQ7V0FBWSxNQUFNLENBQUMsT0FBUCxDQUFBO0VBQVo7O0VBQ1YsVUFBQSxHQUFhLGNBQUEsQ0FBZSxPQUFmOztFQUViLGlCQUFBLEdBQW9CLFNBQUMsS0FBRDtXQUFXLEtBQUssQ0FBQyxZQUFOLENBQUE7RUFBWDs7RUFDcEIsb0JBQUEsR0FBdUIsY0FBQSxDQUFlLGlCQUFmOztFQUV2Qix3QkFBQSxHQUEyQixTQUFDLE1BQUQsRUFBUyxLQUFUO1dBQW1CLFVBQVUsQ0FBQyxJQUFYLENBQWdCLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixLQUE1QixDQUFoQjtFQUFuQjs7RUFDM0IsMkJBQUEsR0FBOEIsY0FBQSxDQUFlLHdCQUFmOztFQUU5QixrQkFBQSxHQUFxQixTQUFDLE1BQUQsRUFBUyxLQUFUO0FBQ25CLFFBQUE7SUFBQSxLQUFBLEdBQVEsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsS0FBakI7SUFDUixLQUFBLEdBQVEsaUNBQUEsQ0FBa0MsTUFBbEMsRUFBMEMsS0FBSyxDQUFDLEtBQWhELEVBQXVELENBQXZEO1dBQ1IsS0FBSyxDQUFDLFFBQU4sQ0FBZSxJQUFmLENBQUEsSUFBeUIsQ0FBSSxLQUFLLENBQUMsUUFBTixDQUFlLE1BQWY7RUFIVjs7RUFLckIsMEJBQUEsR0FBNkIsU0FBQyxNQUFELEVBQVMsS0FBVCxFQUFnQixJQUFoQjtXQUMzQixNQUFNLENBQUMsb0JBQVAsQ0FBNEIsQ0FBQyxLQUFELEVBQVEsS0FBUixDQUE1QixFQUE0QyxJQUE1QztFQUQyQjs7RUFHN0IsaUNBQUEsR0FBb0MsU0FBQyxNQUFELEVBQVMsR0FBVDtBQUNsQyxRQUFBO0lBQUEsSUFBQSxDQUFPLDZCQUFBLENBQThCLE1BQTlCLEVBQXNDLEdBQXRDLENBQVA7TUFDRSxHQUFBLEdBQU0sd0JBQUEsQ0FBeUIsTUFBekIsRUFBaUMsR0FBakM7YUFDTiwwQkFBQSxDQUEyQixNQUEzQixFQUFtQyxHQUFuQyxFQUF3QyxJQUF4QyxFQUZGOztFQURrQzs7RUFLcEMsZUFBQSxHQUFrQixTQUFDLEVBQUQsRUFBSyxJQUFMO0FBQ2hCLFFBQUE7O01BQUEsT0FBUSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBQSxDQUE4QixDQUFDLFlBQS9CLENBQUEsQ0FBNkMsQ0FBQyxPQUE5QyxDQUFBOztJQUNSLElBQUcscUJBQUg7TUFDRSxFQUFBLENBQUcsSUFBSDtBQUVBO0FBQUE7V0FBQSxzQ0FBQTs7c0JBQ0UsZUFBQSxDQUFnQixFQUFoQixFQUFvQixLQUFwQjtBQURGO3NCQUhGOztFQUZnQjs7RUFRbEIsZUFBQSxHQUFrQixTQUFBO0FBQ2hCLFFBQUE7SUFEaUIsdUJBQVEsd0JBQVM7V0FDbEMsUUFBQSxPQUFPLENBQUMsU0FBUixDQUFrQixDQUFBLE1BQUEsQ0FBbEIsYUFBMEIsVUFBMUI7RUFEZ0I7O0VBR2xCLFlBQUEsR0FBZSxlQUFlLENBQUMsSUFBaEIsQ0FBcUIsSUFBckIsRUFBMkIsS0FBM0I7O0VBQ2YsZUFBQSxHQUFrQixlQUFlLENBQUMsSUFBaEIsQ0FBcUIsSUFBckIsRUFBMkIsUUFBM0I7O0VBQ2xCLGVBQUEsR0FBa0IsZUFBZSxDQUFDLElBQWhCLENBQXFCLElBQXJCLEVBQTJCLFFBQTNCOztFQUVsQixzQkFBQSxHQUF5QixTQUFDLElBQUQ7QUFDdkIsUUFBQTtJQUFBLFNBQUEsR0FBWSxJQUFJLENBQUMsV0FBTCxDQUFBO0lBQ1osSUFBRyxTQUFBLEtBQWEsSUFBaEI7YUFDRSxJQUFJLENBQUMsV0FBTCxDQUFBLEVBREY7S0FBQSxNQUFBO2FBR0UsVUFIRjs7RUFGdUI7O0VBT3pCLGtCQUFBLEdBQXFCLFNBQUMsSUFBRDtJQUNuQixJQUFHLElBQUksQ0FBQyxRQUFMLENBQWMsSUFBZCxDQUFIO2FBQ0UsSUFBSSxDQUFDLFNBQUwsQ0FBQSxDQUFnQixDQUFDLEtBQWpCLENBQXVCLFFBQXZCLEVBREY7S0FBQSxNQUFBO2FBR0UsSUFBSSxDQUFDLEtBQUwsQ0FBVyxRQUFYLEVBSEY7O0VBRG1COztFQWdCckIsbUJBQUEsR0FBc0IsU0FBQyxNQUFELEVBQVMsS0FBVDtBQUNwQixRQUFBO0lBQUEsSUFBRyxpQkFBQSxDQUFrQixLQUFsQixDQUFBLElBQTRCLGVBQUEsQ0FBZ0IsS0FBaEIsQ0FBL0I7QUFDRSxhQUFPLE1BRFQ7O0lBR0MsbUJBQUQsRUFBUTtJQUNSLElBQUcsa0JBQUEsQ0FBbUIsTUFBbkIsRUFBMkIsS0FBM0IsQ0FBSDtNQUNFLFFBQUEsR0FBVyxLQUFLLENBQUMsUUFBTixDQUFlLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBZixFQURiOztJQUdBLElBQUcsa0JBQUEsQ0FBbUIsTUFBbkIsRUFBMkIsR0FBM0IsQ0FBSDtNQUNFLE1BQUEsR0FBUyxHQUFHLENBQUMsUUFBSixDQUFhLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBYixFQURYOztJQUdBLElBQUcsa0JBQUEsSUFBYSxnQkFBaEI7YUFDTSxJQUFBLEtBQUEsb0JBQU0sV0FBVyxLQUFqQixtQkFBd0IsU0FBUyxHQUFqQyxFQUROO0tBQUEsTUFBQTthQUdFLE1BSEY7O0VBWG9COztFQW9CdEIsd0JBQUEsR0FBMkIsU0FBQyxNQUFELEVBQVMsS0FBVDtBQUN6QixRQUFBO0lBQUMsbUJBQUQsRUFBUTtJQUVSLE1BQUEsR0FBUztJQUNULFNBQUEsR0FBWSxDQUFDLEdBQUQsRUFBTSx3QkFBQSxDQUF5QixNQUF6QixFQUFpQyxHQUFHLENBQUMsR0FBckMsQ0FBTjtJQUNaLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixJQUF6QixFQUErQixTQUEvQixFQUEwQyxTQUFDLEdBQUQ7QUFBYSxVQUFBO01BQVgsUUFBRDthQUFZLE1BQUEsR0FBUyxLQUFLLENBQUM7SUFBNUIsQ0FBMUM7SUFFQSxxQkFBRyxNQUFNLENBQUUsYUFBUixDQUFzQixHQUF0QixVQUFIO0FBQ0UsYUFBVyxJQUFBLEtBQUEsQ0FBTSxLQUFOLEVBQWEsTUFBYixFQURiOztJQUdBLFFBQUEsR0FBVztJQUNYLFNBQUEsR0FBWSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQVAsRUFBWSxDQUFaLENBQUQsRUFBaUIsS0FBSyxDQUFDLEtBQXZCO0lBQ1osTUFBTSxDQUFDLDBCQUFQLENBQWtDLElBQWxDLEVBQXdDLFNBQXhDLEVBQW1ELFNBQUMsR0FBRDtBQUFhLFVBQUE7TUFBWCxRQUFEO2FBQVksUUFBQSxHQUFXLEtBQUssQ0FBQztJQUE5QixDQUFuRDtJQUVBLHVCQUFHLFFBQVEsQ0FBRSxVQUFWLENBQXFCLEtBQXJCLFVBQUg7QUFDRSxhQUFXLElBQUEsS0FBQSxDQUFNLFFBQU4sRUFBZ0IsR0FBaEIsRUFEYjs7QUFHQSxXQUFPO0VBakJrQjs7RUFtQjNCLHFCQUFBLEdBQXdCLFNBQUMsTUFBRCxFQUFTLFNBQVQsRUFBb0IsT0FBcEIsRUFBNkIsT0FBN0IsRUFBeUMsRUFBekM7QUFDdEIsUUFBQTs7TUFEbUQsVUFBUTs7SUFDMUQscUNBQUQsRUFBZ0IsbUJBQWhCLEVBQXNCO0lBQ3RCLElBQU8sY0FBSixJQUFrQixtQkFBckI7QUFDRSxZQUFVLElBQUEsS0FBQSxDQUFNLGtEQUFOLEVBRFo7O0lBR0EsSUFBRyxTQUFIO01BQ0UsYUFBQSxHQUFnQixLQURsQjtLQUFBLE1BQUE7O1FBR0UsZ0JBQWlCO09BSG5COztJQUlBLElBQWlDLFlBQWpDO01BQUEsSUFBQSxHQUFPLEtBQUssQ0FBQyxVQUFOLENBQWlCLElBQWpCLEVBQVA7O0FBQ0EsWUFBTyxTQUFQO0FBQUEsV0FDTyxTQURQOztVQUVJLFlBQWlCLElBQUEsS0FBQSxDQUFNLElBQU4sRUFBWSx1QkFBQSxDQUF3QixNQUF4QixDQUFaOztRQUNqQixZQUFBLEdBQWU7QUFGWjtBQURQLFdBSU8sVUFKUDs7VUFLSSxZQUFpQixJQUFBLEtBQUEsQ0FBTSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQU4sRUFBYyxJQUFkOztRQUNqQixZQUFBLEdBQWU7QUFObkI7V0FRQSxNQUFPLENBQUEsWUFBQSxDQUFQLENBQXFCLE9BQXJCLEVBQThCLFNBQTlCLEVBQXlDLFNBQUMsS0FBRDtNQUN2QyxJQUFHLENBQUksYUFBSixJQUFzQixLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFsQixLQUEyQixJQUFJLENBQUMsR0FBekQ7UUFDRSxLQUFLLENBQUMsSUFBTixDQUFBO0FBQ0EsZUFGRjs7YUFHQSxFQUFBLENBQUcsS0FBSDtJQUp1QyxDQUF6QztFQWxCc0I7O0VBd0J4QixNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUNmLFFBQUEsTUFEZTtJQUVmLHFCQUFBLG1CQUZlO0lBR2YsY0FBQSxZQUhlO0lBSWYseUJBQUEsdUJBSmU7SUFLZixTQUFBLE9BTGU7SUFNZixPQUFBLEtBTmU7SUFPZixpQkFBQSxlQVBlO0lBUWYsaUJBQUEsZUFSZTtJQVNmLDJCQUFBLHlCQVRlO0lBVWYsWUFBQSxVQVZlO0lBV2YsVUFBQSxRQVhlO0lBWWYsdUJBQUEscUJBWmU7SUFhZixtQkFBQSxpQkFiZTtJQWNmLG9CQUFBLGtCQWRlO0lBZWYscUJBQUEsbUJBZmU7SUFnQmYsaUNBQUEsK0JBaEJlO0lBaUJmLHVCQUFBLHFCQWpCZTtJQWtCZix3QkFBQSxzQkFsQmU7SUFtQmYseUJBQUEsdUJBbkJlO0lBb0JmLHlCQUFBLHVCQXBCZTtJQXFCZixxQkFBQSxtQkFyQmU7SUFzQmYscUJBQUEsbUJBdEJlO0lBdUJmLGNBQUEsWUF2QmU7SUF3QmYsaUJBQUEsZUF4QmU7SUF5QmYsZ0JBQUEsY0F6QmU7SUEwQmYsaUJBQUEsZUExQmU7SUEyQmYsb0JBQUEsa0JBM0JlO0lBNEJmLHNCQUFBLG9CQTVCZTtJQTZCZiwwQkFBQSx3QkE3QmU7SUE4QmYsMEJBQUEsd0JBOUJlO0lBK0JmLHlCQUFBLHVCQS9CZTtJQWdDZixzQkFBQSxvQkFoQ2U7SUFpQ2Ysc0JBQUEsb0JBakNlO0lBa0NmLGlDQUFBLCtCQWxDZTtJQW1DZiw2QkFBQSwyQkFuQ2U7SUFvQ2YsNEJBQUEsMEJBcENlO0lBcUNmLHNCQUFBLG9CQXJDZTtJQXNDZiwrQkFBQSw2QkF0Q2U7SUF1Q2YsWUFBQSxVQXZDZTtJQXdDZixrQ0FBQSxnQ0F4Q2U7SUF5Q2Ysc0JBQUEsb0JBekNlO0lBMENmLHFDQUFBLG1DQTFDZTtJQTJDZiwyQkFBQSx5QkEzQ2U7SUE0Q2YsV0FBQSxTQTVDZTtJQTZDZix1Q0FBQSxxQ0E3Q2U7SUE4Q2YsOEJBQUEsNEJBOUNlO0lBK0NmLGtDQUFBLGdDQS9DZTtJQWdEZixlQUFBLGFBaERlO0lBaURmLGlCQUFBLGVBakRlO0lBa0RmLDZCQUFBLDJCQWxEZTtJQW1EZixhQUFBLFdBbkRlO0lBb0RmLHNCQUFBLG9CQXBEZTtJQXFEZixvQkFBQSxrQkFyRGU7SUFzRGYsa0JBQUEsZ0JBdERlO0lBdURmLG9DQUFBLGtDQXZEZTtJQXdEZiwyQ0FBQSx5Q0F4RGU7SUF5RGYsZ0NBQUEsOEJBekRlO0lBMERmLG1DQUFBLGlDQTFEZTtJQTJEZiwrQkFBQSw2QkEzRGU7SUE0RGYsK0JBQUEsNkJBNURlO0lBNkRmLFlBQUEsVUE3RGU7SUE4RGYseUJBQUEsdUJBOURlO0lBK0RmLHNCQUFBLG9CQS9EZTtJQWdFZixzQ0FBQSxvQ0FoRWU7SUFpRWYsdUJBQUEscUJBakVlO0lBa0VmLGlDQUFBLCtCQWxFZTtJQW1FZixZQUFBLFVBbkVlO0lBb0VmLHFCQUFBLG1CQXBFZTtJQXFFZixhQUFBLFdBckVlO0lBc0VmLHdCQUFBLHNCQXRFZTtJQXdFZixTQUFBLE9BeEVlO0lBd0VOLFlBQUEsVUF4RU07SUF5RWYsbUJBQUEsaUJBekVlO0lBeUVJLHNCQUFBLG9CQXpFSjtJQTJFZiw0QkFBQSwwQkEzRWU7SUE0RWYsbUNBQUEsaUNBNUVlO0lBNkVmLDBCQUFBLHdCQTdFZTtJQThFZiw2QkFBQSwyQkE5RWU7SUErRWYsb0JBQUEsa0JBL0VlO0lBaUZmLGlCQUFBLGVBakZlO0lBa0ZmLGNBQUEsWUFsRmU7SUFtRmYsaUJBQUEsZUFuRmU7SUFvRmYsaUJBQUEsZUFwRmU7SUFxRmYsd0JBQUEsc0JBckZlO0lBc0ZmLG9CQUFBLGtCQXRGZTtJQXVGZixxQkFBQSxtQkF2RmU7SUF3RmYsMEJBQUEsd0JBeEZlO0lBeUZmLHVCQUFBLHFCQXpGZTs7QUE5eEJqQiIsInNvdXJjZXNDb250ZW50IjpbImZzID0gcmVxdWlyZSAnZnMtcGx1cydcbnNldHRpbmdzID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxue0Rpc3Bvc2FibGUsIFJhbmdlLCBQb2ludH0gPSByZXF1aXJlICdhdG9tJ1xuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxuYXNzZXJ0ID0gKGNvbmRpdGlvbiwgbWVzc2FnZSwgZm4pIC0+XG4gIHVubGVzcyBmbj9cbiAgICBmbiA9IChlcnJvcikgLT5cbiAgICAgIGNvbnNvbGUuZXJyb3IgZXJyb3IubWVzc2FnZVxuICBhdG9tLmFzc2VydChjb25kaXRpb24sIG1lc3NhZ2UsIGZuKVxuXG5hc3NlcnRXaXRoRXhjZXB0aW9uID0gKGNvbmRpdGlvbiwgbWVzc2FnZSwgZm4pIC0+XG4gIGF0b20uYXNzZXJ0IGNvbmRpdGlvbiwgbWVzc2FnZSwgKGVycm9yKSAtPlxuICAgIHRocm93IG5ldyBFcnJvcihlcnJvci5tZXNzYWdlKVxuXG5nZXRBbmNlc3RvcnMgPSAob2JqKSAtPlxuICBhbmNlc3RvcnMgPSBbXVxuICBjdXJyZW50ID0gb2JqXG4gIGxvb3BcbiAgICBhbmNlc3RvcnMucHVzaChjdXJyZW50KVxuICAgIGN1cnJlbnQgPSBjdXJyZW50Ll9fc3VwZXJfXz8uY29uc3RydWN0b3JcbiAgICBicmVhayB1bmxlc3MgY3VycmVudFxuICBhbmNlc3RvcnNcblxuZ2V0S2V5QmluZGluZ0ZvckNvbW1hbmQgPSAoY29tbWFuZCwge3BhY2thZ2VOYW1lfSkgLT5cbiAgcmVzdWx0cyA9IG51bGxcbiAga2V5bWFwcyA9IGF0b20ua2V5bWFwcy5nZXRLZXlCaW5kaW5ncygpXG4gIGlmIHBhY2thZ2VOYW1lP1xuICAgIGtleW1hcFBhdGggPSBhdG9tLnBhY2thZ2VzLmdldEFjdGl2ZVBhY2thZ2UocGFja2FnZU5hbWUpLmdldEtleW1hcFBhdGhzKCkucG9wKClcbiAgICBrZXltYXBzID0ga2V5bWFwcy5maWx0ZXIoKHtzb3VyY2V9KSAtPiBzb3VyY2UgaXMga2V5bWFwUGF0aClcblxuICBmb3Iga2V5bWFwIGluIGtleW1hcHMgd2hlbiBrZXltYXAuY29tbWFuZCBpcyBjb21tYW5kXG4gICAge2tleXN0cm9rZXMsIHNlbGVjdG9yfSA9IGtleW1hcFxuICAgIGtleXN0cm9rZXMgPSBrZXlzdHJva2VzLnJlcGxhY2UoL3NoaWZ0LS8sICcnKVxuICAgIChyZXN1bHRzID89IFtdKS5wdXNoKHtrZXlzdHJva2VzLCBzZWxlY3Rvcn0pXG4gIHJlc3VsdHNcblxuIyBJbmNsdWRlIG1vZHVsZShvYmplY3Qgd2hpY2ggbm9ybWFseSBwcm92aWRlcyBzZXQgb2YgbWV0aG9kcykgdG8ga2xhc3NcbmluY2x1ZGUgPSAoa2xhc3MsIG1vZHVsZSkgLT5cbiAgZm9yIGtleSwgdmFsdWUgb2YgbW9kdWxlXG4gICAga2xhc3M6OltrZXldID0gdmFsdWVcblxuZGVidWcgPSAobWVzc2FnZXMuLi4pIC0+XG4gIHJldHVybiB1bmxlc3Mgc2V0dGluZ3MuZ2V0KCdkZWJ1ZycpXG4gIHN3aXRjaCBzZXR0aW5ncy5nZXQoJ2RlYnVnT3V0cHV0JylcbiAgICB3aGVuICdjb25zb2xlJ1xuICAgICAgY29uc29sZS5sb2cgbWVzc2FnZXMuLi5cbiAgICB3aGVuICdmaWxlJ1xuICAgICAgZmlsZVBhdGggPSBmcy5ub3JtYWxpemUgc2V0dGluZ3MuZ2V0KCdkZWJ1Z091dHB1dEZpbGVQYXRoJylcbiAgICAgIGlmIGZzLmV4aXN0c1N5bmMoZmlsZVBhdGgpXG4gICAgICAgIGZzLmFwcGVuZEZpbGVTeW5jIGZpbGVQYXRoLCBtZXNzYWdlcyArIFwiXFxuXCJcblxuIyBSZXR1cm4gZnVuY3Rpb24gdG8gcmVzdG9yZSBlZGl0b3IncyBzY3JvbGxUb3AgYW5kIGZvbGQgc3RhdGUuXG5zYXZlRWRpdG9yU3RhdGUgPSAoZWRpdG9yKSAtPlxuICBlZGl0b3JFbGVtZW50ID0gZWRpdG9yLmVsZW1lbnRcbiAgc2Nyb2xsVG9wID0gZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3AoKVxuXG4gIGZvbGRTdGFydFJvd3MgPSBlZGl0b3IuZGlzcGxheUxheWVyLmZvbGRzTWFya2VyTGF5ZXIuZmluZE1hcmtlcnMoe30pLm1hcCAobSkgLT4gbS5nZXRTdGFydFBvc2l0aW9uKCkucm93XG4gIC0+XG4gICAgZm9yIHJvdyBpbiBmb2xkU3RhcnRSb3dzLnJldmVyc2UoKSB3aGVuIG5vdCBlZGl0b3IuaXNGb2xkZWRBdEJ1ZmZlclJvdyhyb3cpXG4gICAgICBlZGl0b3IuZm9sZEJ1ZmZlclJvdyhyb3cpXG4gICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3Aoc2Nyb2xsVG9wKVxuXG5pc0xpbmV3aXNlUmFuZ2UgPSAoe3N0YXJ0LCBlbmR9KSAtPlxuICAoc3RhcnQucm93IGlzbnQgZW5kLnJvdykgYW5kIChzdGFydC5jb2x1bW4gaXMgZW5kLmNvbHVtbiBpcyAwKVxuXG5pc0VuZHNXaXRoTmV3TGluZUZvckJ1ZmZlclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAge3N0YXJ0LCBlbmR9ID0gZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHJvdywgaW5jbHVkZU5ld2xpbmU6IHRydWUpXG4gIHN0YXJ0LnJvdyBpc250IGVuZC5yb3dcblxuaGF2ZVNvbWVOb25FbXB0eVNlbGVjdGlvbiA9IChlZGl0b3IpIC0+XG4gIGVkaXRvci5nZXRTZWxlY3Rpb25zKCkuc29tZShpc05vdEVtcHR5KVxuXG5zb3J0UmFuZ2VzID0gKGNvbGxlY3Rpb24pIC0+XG4gIGNvbGxlY3Rpb24uc29ydCAoYSwgYikgLT4gYS5jb21wYXJlKGIpXG5cbiMgUmV0dXJuIGFkanVzdGVkIGluZGV4IGZpdCB3aGl0aW4gZ2l2ZW4gbGlzdCdzIGxlbmd0aFxuIyByZXR1cm4gLTEgaWYgbGlzdCBpcyBlbXB0eS5cbmdldEluZGV4ID0gKGluZGV4LCBsaXN0KSAtPlxuICBsZW5ndGggPSBsaXN0Lmxlbmd0aFxuICBpZiBsZW5ndGggaXMgMFxuICAgIC0xXG4gIGVsc2VcbiAgICBpbmRleCA9IGluZGV4ICUgbGVuZ3RoXG4gICAgaWYgaW5kZXggPj0gMFxuICAgICAgaW5kZXhcbiAgICBlbHNlXG4gICAgICBsZW5ndGggKyBpbmRleFxuXG4jIE5PVEU6IGVuZFJvdyBiZWNvbWUgdW5kZWZpbmVkIGlmIEBlZGl0b3JFbGVtZW50IGlzIG5vdCB5ZXQgYXR0YWNoZWQuXG4jIGUuZy4gQmVnaW5nIGNhbGxlZCBpbW1lZGlhdGVseSBhZnRlciBvcGVuIGZpbGUuXG5nZXRWaXNpYmxlQnVmZmVyUmFuZ2UgPSAoZWRpdG9yKSAtPlxuICBbc3RhcnRSb3csIGVuZFJvd10gPSBlZGl0b3IuZWxlbWVudC5nZXRWaXNpYmxlUm93UmFuZ2UoKVxuICByZXR1cm4gbnVsbCB1bmxlc3MgKHN0YXJ0Um93PyBhbmQgZW5kUm93PylcbiAgc3RhcnRSb3cgPSBlZGl0b3IuYnVmZmVyUm93Rm9yU2NyZWVuUm93KHN0YXJ0Um93KVxuICBlbmRSb3cgPSBlZGl0b3IuYnVmZmVyUm93Rm9yU2NyZWVuUm93KGVuZFJvdylcbiAgbmV3IFJhbmdlKFtzdGFydFJvdywgMF0sIFtlbmRSb3csIEluZmluaXR5XSlcblxuZ2V0VmlzaWJsZUVkaXRvcnMgPSAtPlxuICAoZWRpdG9yIGZvciBwYW5lIGluIGF0b20ud29ya3NwYWNlLmdldFBhbmVzKCkgd2hlbiBlZGl0b3IgPSBwYW5lLmdldEFjdGl2ZUVkaXRvcigpKVxuXG5nZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3cgPSAoZWRpdG9yLCByb3cpIC0+XG4gIGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhyb3cpLmVuZFxuXG4jIFBvaW50IHV0aWxcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxucG9pbnRJc0F0RW5kT2ZMaW5lID0gKGVkaXRvciwgcG9pbnQpIC0+XG4gIHBvaW50ID0gUG9pbnQuZnJvbU9iamVjdChwb2ludClcbiAgZ2V0RW5kT2ZMaW5lRm9yQnVmZmVyUm93KGVkaXRvciwgcG9pbnQucm93KS5pc0VxdWFsKHBvaW50KVxuXG5wb2ludElzT25XaGl0ZVNwYWNlID0gKGVkaXRvciwgcG9pbnQpIC0+XG4gIGNoYXIgPSBnZXRSaWdodENoYXJhY3RlckZvckJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgcG9pbnQpXG4gIG5vdCAvXFxTLy50ZXN0KGNoYXIpXG5cbnBvaW50SXNBdEVuZE9mTGluZUF0Tm9uRW1wdHlSb3cgPSAoZWRpdG9yLCBwb2ludCkgLT5cbiAgcG9pbnQgPSBQb2ludC5mcm9tT2JqZWN0KHBvaW50KVxuICBwb2ludC5jb2x1bW4gaXNudCAwIGFuZCBwb2ludElzQXRFbmRPZkxpbmUoZWRpdG9yLCBwb2ludClcblxucG9pbnRJc0F0VmltRW5kT2ZGaWxlID0gKGVkaXRvciwgcG9pbnQpIC0+XG4gIGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKGVkaXRvcikuaXNFcXVhbChwb2ludClcblxuaXNFbXB0eVJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHJvdykuaXNFbXB0eSgpXG5cbiMgQ3Vyc29yIHN0YXRlIHZhbGlkYXRlaW9uXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmN1cnNvcklzQXRFbmRPZkxpbmVBdE5vbkVtcHR5Um93ID0gKGN1cnNvcikgLT5cbiAgcG9pbnRJc0F0RW5kT2ZMaW5lQXROb25FbXB0eVJvdyhjdXJzb3IuZWRpdG9yLCBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcblxuY3Vyc29ySXNBdFZpbUVuZE9mRmlsZSA9IChjdXJzb3IpIC0+XG4gIHBvaW50SXNBdFZpbUVuZE9mRmlsZShjdXJzb3IuZWRpdG9yLCBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSlcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5nZXRSaWdodENoYXJhY3RlckZvckJ1ZmZlclBvc2l0aW9uID0gKGVkaXRvciwgcG9pbnQsIGFtb3VudD0xKSAtPlxuICBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoUmFuZ2UuZnJvbVBvaW50V2l0aERlbHRhKHBvaW50LCAwLCBhbW91bnQpKVxuXG5nZXRMZWZ0Q2hhcmFjdGVyRm9yQnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCwgYW1vdW50PTEpIC0+XG4gIGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShSYW5nZS5mcm9tUG9pbnRXaXRoRGVsdGEocG9pbnQsIDAsIC1hbW91bnQpKVxuXG5nZXRUZXh0SW5TY3JlZW5SYW5nZSA9IChlZGl0b3IsIHNjcmVlblJhbmdlKSAtPlxuICBidWZmZXJSYW5nZSA9IGVkaXRvci5idWZmZXJSYW5nZUZvclNjcmVlblJhbmdlKHNjcmVlblJhbmdlKVxuICBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoYnVmZmVyUmFuZ2UpXG5cbmdldE5vbldvcmRDaGFyYWN0ZXJzRm9yQ3Vyc29yID0gKGN1cnNvcikgLT5cbiAgIyBBdG9tIDEuMTEuMC1iZXRhNSBoYXZlIHRoaXMgZXhwZXJpbWVudGFsIG1ldGhvZC5cbiAgaWYgY3Vyc29yLmdldE5vbldvcmRDaGFyYWN0ZXJzP1xuICAgIGN1cnNvci5nZXROb25Xb3JkQ2hhcmFjdGVycygpXG4gIGVsc2VcbiAgICBzY29wZSA9IGN1cnNvci5nZXRTY29wZURlc2NyaXB0b3IoKS5nZXRTY29wZXNBcnJheSgpXG4gICAgYXRvbS5jb25maWcuZ2V0KCdlZGl0b3Iubm9uV29yZENoYXJhY3RlcnMnLCB7c2NvcGV9KVxuXG4jIEZJWE1FOiByZW1vdmUgdGhpc1xuIyByZXR1cm4gdHJ1ZSBpZiBtb3ZlZFxubW92ZUN1cnNvclRvTmV4dE5vbldoaXRlc3BhY2UgPSAoY3Vyc29yKSAtPlxuICBvcmlnaW5hbFBvaW50ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgZWRpdG9yID0gY3Vyc29yLmVkaXRvclxuICB2aW1Fb2YgPSBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbihlZGl0b3IpXG5cbiAgd2hpbGUgcG9pbnRJc09uV2hpdGVTcGFjZShlZGl0b3IsIHBvaW50ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpIGFuZCBub3QgcG9pbnQuaXNHcmVhdGVyVGhhbk9yRXF1YWwodmltRW9mKVxuICAgIGN1cnNvci5tb3ZlUmlnaHQoKVxuICBub3Qgb3JpZ2luYWxQb2ludC5pc0VxdWFsKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuXG5nZXRCdWZmZXJSb3dzID0gKGVkaXRvciwge3N0YXJ0Um93LCBkaXJlY3Rpb259KSAtPlxuICBzd2l0Y2ggZGlyZWN0aW9uXG4gICAgd2hlbiAncHJldmlvdXMnXG4gICAgICBpZiBzdGFydFJvdyA8PSAwXG4gICAgICAgIFtdXG4gICAgICBlbHNlXG4gICAgICAgIFsoc3RhcnRSb3cgLSAxKS4uMF1cbiAgICB3aGVuICduZXh0J1xuICAgICAgZW5kUm93ID0gZ2V0VmltTGFzdEJ1ZmZlclJvdyhlZGl0b3IpXG4gICAgICBpZiBzdGFydFJvdyA+PSBlbmRSb3dcbiAgICAgICAgW11cbiAgICAgIGVsc2VcbiAgICAgICAgWyhzdGFydFJvdyArIDEpLi5lbmRSb3ddXG5cbiMgUmV0dXJuIFZpbSdzIEVPRiBwb3NpdGlvbiByYXRoZXIgdGhhbiBBdG9tJ3MgRU9GIHBvc2l0aW9uLlxuIyBUaGlzIGZ1bmN0aW9uIGNoYW5nZSBtZWFuaW5nIG9mIEVPRiBmcm9tIG5hdGl2ZSBUZXh0RWRpdG9yOjpnZXRFb2ZCdWZmZXJQb3NpdGlvbigpXG4jIEF0b20gaXMgc3BlY2lhbChzdHJhbmdlKSBmb3IgY3Vyc29yIGNhbiBwYXN0IHZlcnkgbGFzdCBuZXdsaW5lIGNoYXJhY3Rlci5cbiMgQmVjYXVzZSBvZiB0aGlzLCBBdG9tJ3MgRU9GIHBvc2l0aW9uIGlzIFthY3R1YWxMYXN0Um93KzEsIDBdIHByb3ZpZGVkIGxhc3Qtbm9uLWJsYW5rLXJvd1xuIyBlbmRzIHdpdGggbmV3bGluZSBjaGFyLlxuIyBCdXQgaW4gVmltLCBjdXJvciBjYW4gTk9UIHBhc3QgbGFzdCBuZXdsaW5lLiBFT0YgaXMgbmV4dCBwb3NpdGlvbiBvZiB2ZXJ5IGxhc3QgY2hhcmFjdGVyLlxuZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yKSAtPlxuICBlb2YgPSBlZGl0b3IuZ2V0RW9mQnVmZmVyUG9zaXRpb24oKVxuICBpZiAoZW9mLnJvdyBpcyAwKSBvciAoZW9mLmNvbHVtbiA+IDApXG4gICAgZW9mXG4gIGVsc2VcbiAgICBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3coZWRpdG9yLCBlb2Yucm93IC0gMSlcblxuZ2V0VmltRW9mU2NyZWVuUG9zaXRpb24gPSAoZWRpdG9yKSAtPlxuICBlZGl0b3Iuc2NyZWVuUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbihnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbihlZGl0b3IpKVxuXG5nZXRWaW1MYXN0QnVmZmVyUm93ID0gKGVkaXRvcikgLT4gZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oZWRpdG9yKS5yb3dcbmdldFZpbUxhc3RTY3JlZW5Sb3cgPSAoZWRpdG9yKSAtPiBnZXRWaW1Fb2ZTY3JlZW5Qb3NpdGlvbihlZGl0b3IpLnJvd1xuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93ID0gKGVkaXRvcikgLT4gZWRpdG9yLmVsZW1lbnQuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbmdldExhc3RWaXNpYmxlU2NyZWVuUm93ID0gKGVkaXRvcikgLT4gZWRpdG9yLmVsZW1lbnQuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKVxuXG5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93ID0gKGVkaXRvciwgcm93KSAtPlxuICByYW5nZSA9IGZpbmRSYW5nZUluQnVmZmVyUm93KGVkaXRvciwgL1xcUy8sIHJvdylcbiAgcmFuZ2U/LnN0YXJ0ID8gbmV3IFBvaW50KHJvdywgMClcblxudHJpbVJhbmdlID0gKGVkaXRvciwgc2NhblJhbmdlKSAtPlxuICBwYXR0ZXJuID0gL1xcUy9cbiAgW3N0YXJ0LCBlbmRdID0gW11cbiAgc2V0U3RhcnQgPSAoe3JhbmdlfSkgLT4ge3N0YXJ0fSA9IHJhbmdlXG4gIHNldEVuZCA9ICh7cmFuZ2V9KSAtPiB7ZW5kfSA9IHJhbmdlXG4gIGVkaXRvci5zY2FuSW5CdWZmZXJSYW5nZShwYXR0ZXJuLCBzY2FuUmFuZ2UsIHNldFN0YXJ0KVxuICBlZGl0b3IuYmFja3dhcmRzU2NhbkluQnVmZmVyUmFuZ2UocGF0dGVybiwgc2NhblJhbmdlLCBzZXRFbmQpIGlmIHN0YXJ0P1xuICBpZiBzdGFydD8gYW5kIGVuZD9cbiAgICBuZXcgUmFuZ2Uoc3RhcnQsIGVuZClcbiAgZWxzZVxuICAgIHNjYW5SYW5nZVxuXG4jIEN1cnNvciBtb3Rpb24gd3JhcHBlclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEp1c3QgdXBkYXRlIGJ1ZmZlclJvdyB3aXRoIGtlZXBpbmcgY29sdW1uIGJ5IHJlc3BlY3RpbmcgZ29hbENvbHVtblxuc2V0QnVmZmVyUm93ID0gKGN1cnNvciwgcm93LCBvcHRpb25zKSAtPlxuICBjb2x1bW4gPSBjdXJzb3IuZ29hbENvbHVtbiA/IGN1cnNvci5nZXRCdWZmZXJDb2x1bW4oKVxuICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW3JvdywgY29sdW1uXSwgb3B0aW9ucylcbiAgY3Vyc29yLmdvYWxDb2x1bW4gPSBjb2x1bW5cblxuc2V0QnVmZmVyQ29sdW1uID0gKGN1cnNvciwgY29sdW1uKSAtPlxuICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW2N1cnNvci5nZXRCdWZmZXJSb3coKSwgY29sdW1uXSlcblxubW92ZUN1cnNvciA9IChjdXJzb3IsIHtwcmVzZXJ2ZUdvYWxDb2x1bW59LCBmbikgLT5cbiAge2dvYWxDb2x1bW59ID0gY3Vyc29yXG4gIGZuKGN1cnNvcilcbiAgaWYgcHJlc2VydmVHb2FsQ29sdW1uIGFuZCBnb2FsQ29sdW1uP1xuICAgIGN1cnNvci5nb2FsQ29sdW1uID0gZ29hbENvbHVtblxuXG4jIFdvcmthcm91bmQgaXNzdWUgZm9yIHQ5bWQvdmltLW1vZGUtcGx1cyMyMjYgYW5kIGF0b20vYXRvbSMzMTc0XG4jIEkgY2Fubm90IGRlcGVuZCBjdXJzb3IncyBjb2x1bW4gc2luY2UgaXRzIGNsYWltIDAgYW5kIGNsaXBwaW5nIGVtbXVsYXRpb24gZG9uJ3RcbiMgcmV0dXJuIHdyYXBwZWQgbGluZSwgYnV0IEl0IGFjdHVhbGx5IHdyYXAsIHNvIEkgbmVlZCB0byBkbyB2ZXJ5IGRpcnR5IHdvcmsgdG9cbiMgcHJlZGljdCB3cmFwIGh1cmlzdGljYWxseS5cbnNob3VsZFByZXZlbnRXcmFwTGluZSA9IChjdXJzb3IpIC0+XG4gIHtyb3csIGNvbHVtbn0gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5zb2Z0VGFicycpXG4gICAgdGFiTGVuZ3RoID0gYXRvbS5jb25maWcuZ2V0KCdlZGl0b3IudGFiTGVuZ3RoJylcbiAgICBpZiAwIDwgY29sdW1uIDwgdGFiTGVuZ3RoXG4gICAgICB0ZXh0ID0gY3Vyc29yLmVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShbW3JvdywgMF0sIFtyb3csIHRhYkxlbmd0aF1dKVxuICAgICAgL15cXHMrJC8udGVzdCh0ZXh0KVxuICAgIGVsc2VcbiAgICAgIGZhbHNlXG5cbiMgb3B0aW9uczpcbiMgICBhbGxvd1dyYXA6IHRvIGNvbnRyb2xsIGFsbG93IHdyYXBcbiMgICBwcmVzZXJ2ZUdvYWxDb2x1bW46IHByZXNlcnZlIG9yaWdpbmFsIGdvYWxDb2x1bW5cbm1vdmVDdXJzb3JMZWZ0ID0gKGN1cnNvciwgb3B0aW9ucz17fSkgLT5cbiAge2FsbG93V3JhcCwgbmVlZFNwZWNpYWxDYXJlVG9QcmV2ZW50V3JhcExpbmV9ID0gb3B0aW9uc1xuICBkZWxldGUgb3B0aW9ucy5hbGxvd1dyYXBcbiAgaWYgbmVlZFNwZWNpYWxDYXJlVG9QcmV2ZW50V3JhcExpbmVcbiAgICByZXR1cm4gaWYgc2hvdWxkUHJldmVudFdyYXBMaW5lKGN1cnNvcilcblxuICBpZiBub3QgY3Vyc29yLmlzQXRCZWdpbm5pbmdPZkxpbmUoKSBvciBhbGxvd1dyYXBcbiAgICBtb3Rpb24gPSAoY3Vyc29yKSAtPiBjdXJzb3IubW92ZUxlZnQoKVxuICAgIG1vdmVDdXJzb3IoY3Vyc29yLCBvcHRpb25zLCBtb3Rpb24pXG5cbm1vdmVDdXJzb3JSaWdodCA9IChjdXJzb3IsIG9wdGlvbnM9e30pIC0+XG4gIHthbGxvd1dyYXB9ID0gb3B0aW9uc1xuICBkZWxldGUgb3B0aW9ucy5hbGxvd1dyYXBcbiAgaWYgbm90IGN1cnNvci5pc0F0RW5kT2ZMaW5lKCkgb3IgYWxsb3dXcmFwXG4gICAgbW90aW9uID0gKGN1cnNvcikgLT4gY3Vyc29yLm1vdmVSaWdodCgpXG4gICAgbW92ZUN1cnNvcihjdXJzb3IsIG9wdGlvbnMsIG1vdGlvbilcblxubW92ZUN1cnNvclVwU2NyZWVuID0gKGN1cnNvciwgb3B0aW9ucz17fSkgLT5cbiAgdW5sZXNzIGN1cnNvci5nZXRTY3JlZW5Sb3coKSBpcyAwXG4gICAgbW90aW9uID0gKGN1cnNvcikgLT4gY3Vyc29yLm1vdmVVcCgpXG4gICAgbW92ZUN1cnNvcihjdXJzb3IsIG9wdGlvbnMsIG1vdGlvbilcblxubW92ZUN1cnNvckRvd25TY3JlZW4gPSAoY3Vyc29yLCBvcHRpb25zPXt9KSAtPlxuICB1bmxlc3MgZ2V0VmltTGFzdFNjcmVlblJvdyhjdXJzb3IuZWRpdG9yKSBpcyBjdXJzb3IuZ2V0U2NyZWVuUm93KClcbiAgICBtb3Rpb24gPSAoY3Vyc29yKSAtPiBjdXJzb3IubW92ZURvd24oKVxuICAgIG1vdmVDdXJzb3IoY3Vyc29yLCBvcHRpb25zLCBtb3Rpb24pXG5cbiMgRklYTUVcbm1vdmVDdXJzb3JEb3duQnVmZmVyID0gKGN1cnNvcikgLT5cbiAgcG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICB1bmxlc3MgZ2V0VmltTGFzdEJ1ZmZlclJvdyhjdXJzb3IuZWRpdG9yKSBpcyBwb2ludC5yb3dcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQudHJhbnNsYXRlKFsrMSwgMF0pKVxuXG4jIEZJWE1FXG5tb3ZlQ3Vyc29yVXBCdWZmZXIgPSAoY3Vyc29yKSAtPlxuICBwb2ludCA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gIHVubGVzcyBwb2ludC5yb3cgaXMgMFxuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludC50cmFuc2xhdGUoWy0xLCAwXSkpXG5cbm1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3cgPSAoY3Vyc29yLCByb3cpIC0+XG4gIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihbcm93LCAwXSlcbiAgY3Vyc29yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKClcblxuZ2V0VmFsaWRWaW1CdWZmZXJSb3cgPSAoZWRpdG9yLCByb3cpIC0+IGxpbWl0TnVtYmVyKHJvdywgbWluOiAwLCBtYXg6IGdldFZpbUxhc3RCdWZmZXJSb3coZWRpdG9yKSlcblxuZ2V0VmFsaWRWaW1TY3JlZW5Sb3cgPSAoZWRpdG9yLCByb3cpIC0+IGxpbWl0TnVtYmVyKHJvdywgbWluOiAwLCBtYXg6IGdldFZpbUxhc3RTY3JlZW5Sb3coZWRpdG9yKSlcblxuIyBCeSBkZWZhdWx0IG5vdCBpbmNsdWRlIGNvbHVtblxuZ2V0TGluZVRleHRUb0J1ZmZlclBvc2l0aW9uID0gKGVkaXRvciwge3JvdywgY29sdW1ufSwge2V4Y2x1c2l2ZX09e30pIC0+XG4gIGlmIGV4Y2x1c2l2ZSA/IHRydWVcbiAgICBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocm93KVswLi4uY29sdW1uXVxuICBlbHNlXG4gICAgZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJvdylbMC4uY29sdW1uXVxuXG5nZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgZWRpdG9yLmluZGVudExldmVsRm9yTGluZShlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocm93KSlcblxuZ2V0Q29kZUZvbGRSb3dSYW5nZXMgPSAoZWRpdG9yKSAtPlxuICBbMC4uZWRpdG9yLmdldExhc3RCdWZmZXJSb3coKV1cbiAgICAubWFwIChyb3cpIC0+XG4gICAgICBlZGl0b3IubGFuZ3VhZ2VNb2RlLnJvd1JhbmdlRm9yQ29kZUZvbGRBdEJ1ZmZlclJvdyhyb3cpXG4gICAgLmZpbHRlciAocm93UmFuZ2UpIC0+XG4gICAgICByb3dSYW5nZT8gYW5kIHJvd1JhbmdlWzBdPyBhbmQgcm93UmFuZ2VbMV0/XG5cbiMgVXNlZCBpbiB2bXAtamFzbWluZS1pbmNyZWFzZS1mb2N1c1xuZ2V0Q29kZUZvbGRSb3dSYW5nZXNDb250YWluZXNGb3JSb3cgPSAoZWRpdG9yLCBidWZmZXJSb3csIHtpbmNsdWRlU3RhcnRSb3d9PXt9KSAtPlxuICBpbmNsdWRlU3RhcnRSb3cgPz0gdHJ1ZVxuICBnZXRDb2RlRm9sZFJvd1JhbmdlcyhlZGl0b3IpLmZpbHRlciAoW3N0YXJ0Um93LCBlbmRSb3ddKSAtPlxuICAgIGlmIGluY2x1ZGVTdGFydFJvd1xuICAgICAgc3RhcnRSb3cgPD0gYnVmZmVyUm93IDw9IGVuZFJvd1xuICAgIGVsc2VcbiAgICAgIHN0YXJ0Um93IDwgYnVmZmVyUm93IDw9IGVuZFJvd1xuXG5nZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlID0gKGVkaXRvciwgcm93UmFuZ2UpIC0+XG4gIFtzdGFydFJhbmdlLCBlbmRSYW5nZV0gPSByb3dSYW5nZS5tYXAgKHJvdykgLT5cbiAgICBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocm93LCBpbmNsdWRlTmV3bGluZTogdHJ1ZSlcbiAgc3RhcnRSYW5nZS51bmlvbihlbmRSYW5nZSlcblxuZ2V0VG9rZW5pemVkTGluZUZvclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgZWRpdG9yLnRva2VuaXplZEJ1ZmZlci50b2tlbml6ZWRMaW5lRm9yUm93KHJvdylcblxuZ2V0U2NvcGVzRm9yVG9rZW5pemVkTGluZSA9IChsaW5lKSAtPlxuICBmb3IgdGFnIGluIGxpbmUudGFncyB3aGVuIHRhZyA8IDAgYW5kICh0YWcgJSAyIGlzIC0xKVxuICAgIGF0b20uZ3JhbW1hcnMuc2NvcGVGb3JJZCh0YWcpXG5cbnNjYW5Gb3JTY29wZVN0YXJ0ID0gKGVkaXRvciwgZnJvbVBvaW50LCBkaXJlY3Rpb24sIGZuKSAtPlxuICBmcm9tUG9pbnQgPSBQb2ludC5mcm9tT2JqZWN0KGZyb21Qb2ludClcbiAgc2NhblJvd3MgPSBzd2l0Y2ggZGlyZWN0aW9uXG4gICAgd2hlbiAnZm9yd2FyZCcgdGhlbiBbKGZyb21Qb2ludC5yb3cpLi5lZGl0b3IuZ2V0TGFzdEJ1ZmZlclJvdygpXVxuICAgIHdoZW4gJ2JhY2t3YXJkJyB0aGVuIFsoZnJvbVBvaW50LnJvdykuLjBdXG5cbiAgY29udGludWVTY2FuID0gdHJ1ZVxuICBzdG9wID0gLT5cbiAgICBjb250aW51ZVNjYW4gPSBmYWxzZVxuXG4gIGlzVmFsaWRUb2tlbiA9IHN3aXRjaCBkaXJlY3Rpb25cbiAgICB3aGVuICdmb3J3YXJkJyB0aGVuICh7cG9zaXRpb259KSAtPiBwb3NpdGlvbi5pc0dyZWF0ZXJUaGFuKGZyb21Qb2ludClcbiAgICB3aGVuICdiYWNrd2FyZCcgdGhlbiAoe3Bvc2l0aW9ufSkgLT4gcG9zaXRpb24uaXNMZXNzVGhhbihmcm9tUG9pbnQpXG5cbiAgZm9yIHJvdyBpbiBzY2FuUm93cyB3aGVuIHRva2VuaXplZExpbmUgPSBnZXRUb2tlbml6ZWRMaW5lRm9yUm93KGVkaXRvciwgcm93KVxuICAgIGNvbHVtbiA9IDBcbiAgICByZXN1bHRzID0gW11cblxuICAgIHRva2VuSXRlcmF0b3IgPSB0b2tlbml6ZWRMaW5lLmdldFRva2VuSXRlcmF0b3IoKVxuICAgIGZvciB0YWcgaW4gdG9rZW5pemVkTGluZS50YWdzXG4gICAgICB0b2tlbkl0ZXJhdG9yLm5leHQoKVxuICAgICAgaWYgdGFnIDwgMCAjIE5lZ2F0aXZlOiBzdGFydC9zdG9wIHRva2VuXG4gICAgICAgIHNjb3BlID0gYXRvbS5ncmFtbWFycy5zY29wZUZvcklkKHRhZylcbiAgICAgICAgaWYgKHRhZyAlIDIpIGlzIDAgIyBFdmVuOiBzY29wZSBzdG9wXG4gICAgICAgICAgbnVsbFxuICAgICAgICBlbHNlICMgT2RkOiBzY29wZSBzdGFydFxuICAgICAgICAgIHBvc2l0aW9uID0gbmV3IFBvaW50KHJvdywgY29sdW1uKVxuICAgICAgICAgIHJlc3VsdHMucHVzaCB7c2NvcGUsIHBvc2l0aW9uLCBzdG9wfVxuICAgICAgZWxzZVxuICAgICAgICBjb2x1bW4gKz0gdGFnXG5cbiAgICByZXN1bHRzID0gcmVzdWx0cy5maWx0ZXIoaXNWYWxpZFRva2VuKVxuICAgIHJlc3VsdHMucmV2ZXJzZSgpIGlmIGRpcmVjdGlvbiBpcyAnYmFja3dhcmQnXG4gICAgZm9yIHJlc3VsdCBpbiByZXN1bHRzXG4gICAgICBmbihyZXN1bHQpXG4gICAgICByZXR1cm4gdW5sZXNzIGNvbnRpbnVlU2NhblxuICAgIHJldHVybiB1bmxlc3MgY29udGludWVTY2FuXG5cbmRldGVjdFNjb3BlU3RhcnRQb3NpdGlvbkZvclNjb3BlID0gKGVkaXRvciwgZnJvbVBvaW50LCBkaXJlY3Rpb24sIHNjb3BlKSAtPlxuICBwb2ludCA9IG51bGxcbiAgc2NhbkZvclNjb3BlU3RhcnQgZWRpdG9yLCBmcm9tUG9pbnQsIGRpcmVjdGlvbiwgKGluZm8pIC0+XG4gICAgaWYgaW5mby5zY29wZS5zZWFyY2goc2NvcGUpID49IDBcbiAgICAgIGluZm8uc3RvcCgpXG4gICAgICBwb2ludCA9IGluZm8ucG9zaXRpb25cbiAgcG9pbnRcblxuaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgIyBbRklYTUVdIEJ1ZyBvZiB1cHN0cmVhbT9cbiAgIyBTb21ldGltZSB0b2tlbml6ZWRMaW5lcyBsZW5ndGggaXMgbGVzcyB0aGFuIGxhc3QgYnVmZmVyIHJvdy5cbiAgIyBTbyB0b2tlbml6ZWRMaW5lIGlzIG5vdCBhY2Nlc3NpYmxlIGV2ZW4gaWYgdmFsaWQgcm93LlxuICAjIEluIHRoYXQgY2FzZSBJIHNpbXBseSByZXR1cm4gZW1wdHkgQXJyYXkuXG4gIGlmIHRva2VuaXplZExpbmUgPSBnZXRUb2tlbml6ZWRMaW5lRm9yUm93KGVkaXRvciwgcm93KVxuICAgIGdldFNjb3Blc0ZvclRva2VuaXplZExpbmUodG9rZW5pemVkTGluZSkuc29tZSAoc2NvcGUpIC0+XG4gICAgICBpc0Z1bmN0aW9uU2NvcGUoZWRpdG9yLCBzY29wZSlcbiAgZWxzZVxuICAgIGZhbHNlXG5cbiMgW0ZJWE1FXSB2ZXJ5IHJvdWdoIHN0YXRlLCBuZWVkIGltcHJvdmVtZW50LlxuaXNGdW5jdGlvblNjb3BlID0gKGVkaXRvciwgc2NvcGUpIC0+XG4gIHN3aXRjaCBlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZVxuICAgIHdoZW4gJ3NvdXJjZS5nbycsICdzb3VyY2UuZWxpeGlyJ1xuICAgICAgc2NvcGVzID0gWydlbnRpdHkubmFtZS5mdW5jdGlvbiddXG4gICAgd2hlbiAnc291cmNlLnJ1YnknXG4gICAgICBzY29wZXMgPSBbJ21ldGEuZnVuY3Rpb24uJywgJ21ldGEuY2xhc3MuJywgJ21ldGEubW9kdWxlLiddXG4gICAgZWxzZVxuICAgICAgc2NvcGVzID0gWydtZXRhLmZ1bmN0aW9uLicsICdtZXRhLmNsYXNzLiddXG4gIHBhdHRlcm4gPSBuZXcgUmVnRXhwKCdeJyArIHNjb3Blcy5tYXAoXy5lc2NhcGVSZWdFeHApLmpvaW4oJ3wnKSlcbiAgcGF0dGVybi50ZXN0KHNjb3BlKVxuXG4jIFNjcm9sbCB0byBidWZmZXJQb3NpdGlvbiB3aXRoIG1pbmltdW0gYW1vdW50IHRvIGtlZXAgb3JpZ2luYWwgdmlzaWJsZSBhcmVhLlxuIyBJZiB0YXJnZXQgcG9zaXRpb24gd29uJ3QgZml0IHdpdGhpbiBvbmVQYWdlVXAgb3Igb25lUGFnZURvd24sIGl0IGNlbnRlciB0YXJnZXQgcG9pbnQuXG5zbWFydFNjcm9sbFRvQnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCkgLT5cbiAgZWRpdG9yRWxlbWVudCA9IGVkaXRvci5lbGVtZW50XG4gIGVkaXRvckFyZWFIZWlnaHQgPSBlZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKCkgKiAoZWRpdG9yLmdldFJvd3NQZXJQYWdlKCkgLSAxKVxuICBvbmVQYWdlVXAgPSBlZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcCgpIC0gZWRpdG9yQXJlYUhlaWdodCAjIE5vIG5lZWQgdG8gbGltaXQgdG8gbWluPTBcbiAgb25lUGFnZURvd24gPSBlZGl0b3JFbGVtZW50LmdldFNjcm9sbEJvdHRvbSgpICsgZWRpdG9yQXJlYUhlaWdodFxuICB0YXJnZXQgPSBlZGl0b3JFbGVtZW50LnBpeGVsUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbihwb2ludCkudG9wXG5cbiAgY2VudGVyID0gKG9uZVBhZ2VEb3duIDwgdGFyZ2V0KSBvciAodGFyZ2V0IDwgb25lUGFnZVVwKVxuICBlZGl0b3Iuc2Nyb2xsVG9CdWZmZXJQb3NpdGlvbihwb2ludCwge2NlbnRlcn0pXG5cbm1hdGNoU2NvcGVzID0gKGVkaXRvckVsZW1lbnQsIHNjb3BlcykgLT5cbiAgY2xhc3NlcyA9IHNjb3Blcy5tYXAgKHNjb3BlKSAtPiBzY29wZS5zcGxpdCgnLicpXG5cbiAgZm9yIGNsYXNzTmFtZXMgaW4gY2xhc3Nlc1xuICAgIGNvbnRhaW5zQ291bnQgPSAwXG4gICAgZm9yIGNsYXNzTmFtZSBpbiBjbGFzc05hbWVzXG4gICAgICBjb250YWluc0NvdW50ICs9IDEgaWYgZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKVxuICAgIHJldHVybiB0cnVlIGlmIGNvbnRhaW5zQ291bnQgaXMgY2xhc3NOYW1lcy5sZW5ndGhcbiAgZmFsc2VcblxuaXNTaW5nbGVMaW5lVGV4dCA9ICh0ZXh0KSAtPlxuICB0ZXh0LnNwbGl0KC9cXG58XFxyXFxuLykubGVuZ3RoIGlzIDFcblxuIyBSZXR1cm4gYnVmZmVyUmFuZ2UgYW5kIGtpbmQgWyd3aGl0ZS1zcGFjZScsICdub24td29yZCcsICd3b3JkJ11cbiNcbiMgVGhpcyBmdW5jdGlvbiBtb2RpZnkgd29yZFJlZ2V4IHNvIHRoYXQgaXQgZmVlbCBOQVRVUkFMIGluIFZpbSdzIG5vcm1hbCBtb2RlLlxuIyBJbiBub3JtYWwtbW9kZSwgY3Vyc29yIGlzIHJhY3RhbmdsZShub3QgcGlwZSh8KSBjaGFyKS5cbiMgQ3Vyc29yIGlzIGxpa2UgT04gd29yZCByYXRoZXIgdGhhbiBCRVRXRUVOIHdvcmQuXG4jIFRoZSBtb2RpZmljYXRpb24gaXMgdGFpbG9yZCBsaWtlIHRoaXNcbiMgICAtIE9OIHdoaXRlLXNwYWNlOiBJbmNsdWRzIG9ubHkgd2hpdGUtc3BhY2VzLlxuIyAgIC0gT04gbm9uLXdvcmQ6IEluY2x1ZHMgb25seSBub24gd29yZCBjaGFyKD1leGNsdWRlcyBub3JtYWwgd29yZCBjaGFyKS5cbiNcbiMgVmFsaWQgb3B0aW9uc1xuIyAgLSB3b3JkUmVnZXg6IGluc3RhbmNlIG9mIFJlZ0V4cFxuIyAgLSBub25Xb3JkQ2hhcmFjdGVyczogc3RyaW5nXG5nZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50LCBvcHRpb25zPXt9KSAtPlxuICB7c2luZ2xlTm9uV29yZENoYXIsIHdvcmRSZWdleCwgbm9uV29yZENoYXJhY3RlcnMsIGN1cnNvcn0gPSBvcHRpb25zXG4gIGlmIG5vdCB3b3JkUmVnZXg/IG9yIG5vdCBub25Xb3JkQ2hhcmFjdGVycz8gIyBDb21wbGVtZW50IGZyb20gY3Vyc29yXG4gICAgY3Vyc29yID89IGVkaXRvci5nZXRMYXN0Q3Vyc29yKClcbiAgICB7d29yZFJlZ2V4LCBub25Xb3JkQ2hhcmFjdGVyc30gPSBfLmV4dGVuZChvcHRpb25zLCBidWlsZFdvcmRQYXR0ZXJuQnlDdXJzb3IoY3Vyc29yLCBvcHRpb25zKSlcbiAgc2luZ2xlTm9uV29yZENoYXIgPz0gdHJ1ZVxuXG4gIGNoYXJhY3RlckF0UG9pbnQgPSBnZXRSaWdodENoYXJhY3RlckZvckJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgcG9pbnQpXG4gIG5vbldvcmRSZWdleCA9IG5ldyBSZWdFeHAoXCJbI3tfLmVzY2FwZVJlZ0V4cChub25Xb3JkQ2hhcmFjdGVycyl9XStcIilcblxuICBpZiAvXFxzLy50ZXN0KGNoYXJhY3RlckF0UG9pbnQpXG4gICAgc291cmNlID0gXCJbXFx0IF0rXCJcbiAgICBraW5kID0gJ3doaXRlLXNwYWNlJ1xuICAgIHdvcmRSZWdleCA9IG5ldyBSZWdFeHAoc291cmNlKVxuICBlbHNlIGlmIG5vbldvcmRSZWdleC50ZXN0KGNoYXJhY3RlckF0UG9pbnQpIGFuZCBub3Qgd29yZFJlZ2V4LnRlc3QoY2hhcmFjdGVyQXRQb2ludClcbiAgICBraW5kID0gJ25vbi13b3JkJ1xuICAgIGlmIHNpbmdsZU5vbldvcmRDaGFyXG4gICAgICBzb3VyY2UgPSBfLmVzY2FwZVJlZ0V4cChjaGFyYWN0ZXJBdFBvaW50KVxuICAgICAgd29yZFJlZ2V4ID0gbmV3IFJlZ0V4cChzb3VyY2UpXG4gICAgZWxzZVxuICAgICAgd29yZFJlZ2V4ID0gbm9uV29yZFJlZ2V4XG4gIGVsc2VcbiAgICBraW5kID0gJ3dvcmQnXG5cbiAgcmFuZ2UgPSBnZXRXb3JkQnVmZmVyUmFuZ2VBdEJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgcG9pbnQsIHt3b3JkUmVnZXh9KVxuICB7a2luZCwgcmFuZ2V9XG5cbmdldFdvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50LCBvcHRpb25zPXt9KSAtPlxuICBib3VuZGFyaXplRm9yV29yZCA9IG9wdGlvbnMuYm91bmRhcml6ZUZvcldvcmQgPyB0cnVlXG4gIGRlbGV0ZSBvcHRpb25zLmJvdW5kYXJpemVGb3JXb3JkXG4gIHtyYW5nZSwga2luZH0gPSBnZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbihlZGl0b3IsIHBvaW50LCBvcHRpb25zKVxuICB0ZXh0ID0gZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKVxuICBwYXR0ZXJuID0gXy5lc2NhcGVSZWdFeHAodGV4dClcblxuICBpZiBraW5kIGlzICd3b3JkJyBhbmQgYm91bmRhcml6ZUZvcldvcmRcbiAgICAjIFNldCB3b3JkLWJvdW5kYXJ5KCBcXGIgKSBhbmNob3Igb25seSB3aGVuIGl0J3MgZWZmZWN0aXZlICM2ODlcbiAgICBzdGFydEJvdW5kYXJ5ID0gaWYgL15cXHcvLnRlc3QodGV4dCkgdGhlbiBcIlxcXFxiXCIgZWxzZSAnJ1xuICAgIGVuZEJvdW5kYXJ5ID0gaWYgL1xcdyQvLnRlc3QodGV4dCkgdGhlbiBcIlxcXFxiXCIgZWxzZSAnJ1xuICAgIHBhdHRlcm4gPSBzdGFydEJvdW5kYXJ5ICsgcGF0dGVybiArIGVuZEJvdW5kYXJ5XG4gIG5ldyBSZWdFeHAocGF0dGVybiwgJ2cnKVxuXG5nZXRTdWJ3b3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCwgb3B0aW9ucz17fSkgLT5cbiAgb3B0aW9ucyA9IHt3b3JkUmVnZXg6IGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuc3Vid29yZFJlZ0V4cCgpLCBib3VuZGFyaXplRm9yV29yZDogZmFsc2V9XG4gIGdldFdvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvbihlZGl0b3IsIHBvaW50LCBvcHRpb25zKVxuXG4jIFJldHVybiBvcHRpb25zIHVzZWQgZm9yIGdldFdvcmRCdWZmZXJSYW5nZUF0QnVmZmVyUG9zaXRpb25cbmJ1aWxkV29yZFBhdHRlcm5CeUN1cnNvciA9IChjdXJzb3IsIHt3b3JkUmVnZXh9KSAtPlxuICBub25Xb3JkQ2hhcmFjdGVycyA9IGdldE5vbldvcmRDaGFyYWN0ZXJzRm9yQ3Vyc29yKGN1cnNvcilcbiAgd29yZFJlZ2V4ID89IG5ldyBSZWdFeHAoXCJeW1xcdCBdKiR8W15cXFxccyN7Xy5lc2NhcGVSZWdFeHAobm9uV29yZENoYXJhY3RlcnMpfV0rXCIpXG4gIHt3b3JkUmVnZXgsIG5vbldvcmRDaGFyYWN0ZXJzfVxuXG5nZXRCZWdpbm5pbmdPZldvcmRCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50LCB7d29yZFJlZ2V4fT17fSkgLT5cbiAgc2NhblJhbmdlID0gW1twb2ludC5yb3csIDBdLCBwb2ludF1cblxuICBmb3VuZCA9IG51bGxcbiAgZWRpdG9yLmJhY2t3YXJkc1NjYW5JbkJ1ZmZlclJhbmdlIHdvcmRSZWdleCwgc2NhblJhbmdlLCAoe3JhbmdlLCBtYXRjaFRleHQsIHN0b3B9KSAtPlxuICAgIHJldHVybiBpZiBtYXRjaFRleHQgaXMgJycgYW5kIHJhbmdlLnN0YXJ0LmNvbHVtbiBpc250IDBcblxuICAgIGlmIHJhbmdlLnN0YXJ0LmlzTGVzc1RoYW4ocG9pbnQpXG4gICAgICBpZiByYW5nZS5lbmQuaXNHcmVhdGVyVGhhbk9yRXF1YWwocG9pbnQpXG4gICAgICAgIGZvdW5kID0gcmFuZ2Uuc3RhcnRcbiAgICAgIHN0b3AoKVxuXG4gIGZvdW5kID8gcG9pbnRcblxuZ2V0RW5kT2ZXb3JkQnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCwge3dvcmRSZWdleH09e30pIC0+XG4gIHNjYW5SYW5nZSA9IFtwb2ludCwgW3BvaW50LnJvdywgSW5maW5pdHldXVxuXG4gIGZvdW5kID0gbnVsbFxuICBlZGl0b3Iuc2NhbkluQnVmZmVyUmFuZ2Ugd29yZFJlZ2V4LCBzY2FuUmFuZ2UsICh7cmFuZ2UsIG1hdGNoVGV4dCwgc3RvcH0pIC0+XG4gICAgcmV0dXJuIGlmIG1hdGNoVGV4dCBpcyAnJyBhbmQgcmFuZ2Uuc3RhcnQuY29sdW1uIGlzbnQgMFxuXG4gICAgaWYgcmFuZ2UuZW5kLmlzR3JlYXRlclRoYW4ocG9pbnQpXG4gICAgICBpZiByYW5nZS5zdGFydC5pc0xlc3NUaGFuT3JFcXVhbChwb2ludClcbiAgICAgICAgZm91bmQgPSByYW5nZS5lbmRcbiAgICAgIHN0b3AoKVxuXG4gIGZvdW5kID8gcG9pbnRcblxuZ2V0V29yZEJ1ZmZlclJhbmdlQXRCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvc2l0aW9uLCBvcHRpb25zPXt9KSAtPlxuICBlbmRQb3NpdGlvbiA9IGdldEVuZE9mV29yZEJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgcG9zaXRpb24sIG9wdGlvbnMpXG4gIHN0YXJ0UG9zaXRpb24gPSBnZXRCZWdpbm5pbmdPZldvcmRCdWZmZXJQb3NpdGlvbihlZGl0b3IsIGVuZFBvc2l0aW9uLCBvcHRpb25zKVxuICBuZXcgUmFuZ2Uoc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24pXG5cbmFkanVzdFJhbmdlVG9Sb3dSYW5nZSA9ICh7c3RhcnQsIGVuZH0sIG9wdGlvbnM9e30pIC0+XG4gICMgd2hlbiBsaW5ld2lzZSwgZW5kIHJvdyBpcyBhdCBjb2x1bW4gMCBvZiBORVhUIGxpbmVcbiAgIyBTbyBuZWVkIGFkanVzdCB0byBhY3R1YWxseSBzZWxlY3RlZCByb3cgaW4gc2FtZSB3YXkgYXMgU2VsZWNpdG9uOjpnZXRCdWZmZXJSb3dSYW5nZSgpXG4gIGVuZFJvdyA9IGVuZC5yb3dcbiAgaWYgZW5kLmNvbHVtbiBpcyAwXG4gICAgZW5kUm93ID0gbGltaXROdW1iZXIoZW5kLnJvdyAtIDEsIG1pbjogc3RhcnQucm93KVxuICBpZiBvcHRpb25zLmVuZE9ubHkgPyBmYWxzZVxuICAgIG5ldyBSYW5nZShzdGFydCwgW2VuZFJvdywgSW5maW5pdHldKVxuICBlbHNlXG4gICAgbmV3IFJhbmdlKFtzdGFydC5yb3csIDBdLCBbZW5kUm93LCBJbmZpbml0eV0pXG5cbiMgV2hlbiByYW5nZSBpcyBsaW5ld2lzZSByYW5nZSwgcmFuZ2UgZW5kIGhhdmUgY29sdW1uIDAgb2YgTkVYVCByb3cuXG4jIFdoaWNoIGlzIHZlcnkgdW5pbnR1aXRpdmUgYW5kIHVud2FudGVkIHJlc3VsdC5cbnNocmlua1JhbmdlRW5kVG9CZWZvcmVOZXdMaW5lID0gKHJhbmdlKSAtPlxuICB7c3RhcnQsIGVuZH0gPSByYW5nZVxuICBpZiBlbmQuY29sdW1uIGlzIDBcbiAgICBlbmRSb3cgPSBsaW1pdE51bWJlcihlbmQucm93IC0gMSwgbWluOiBzdGFydC5yb3cpXG4gICAgbmV3IFJhbmdlKHN0YXJ0LCBbZW5kUm93LCBJbmZpbml0eV0pXG4gIGVsc2VcbiAgICByYW5nZVxuXG5zY2FuRWRpdG9yID0gKGVkaXRvciwgcGF0dGVybikgLT5cbiAgcmFuZ2VzID0gW11cbiAgZWRpdG9yLnNjYW4gcGF0dGVybiwgKHtyYW5nZX0pIC0+XG4gICAgcmFuZ2VzLnB1c2gocmFuZ2UpXG4gIHJhbmdlc1xuXG5jb2xsZWN0UmFuZ2VJbkJ1ZmZlclJvdyA9IChlZGl0b3IsIHJvdywgcGF0dGVybikgLT5cbiAgcmFuZ2VzID0gW11cbiAgc2NhblJhbmdlID0gZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHJvdylcbiAgZWRpdG9yLnNjYW5JbkJ1ZmZlclJhbmdlIHBhdHRlcm4sIHNjYW5SYW5nZSwgKHtyYW5nZX0pIC0+XG4gICAgcmFuZ2VzLnB1c2gocmFuZ2UpXG4gIHJhbmdlc1xuXG5maW5kUmFuZ2VJbkJ1ZmZlclJvdyA9IChlZGl0b3IsIHBhdHRlcm4sIHJvdywge2RpcmVjdGlvbn09e30pIC0+XG4gIGlmIGRpcmVjdGlvbiBpcyAnYmFja3dhcmQnXG4gICAgc2NhbkZ1bmN0aW9uTmFtZSA9ICdiYWNrd2FyZHNTY2FuSW5CdWZmZXJSYW5nZSdcbiAgZWxzZVxuICAgIHNjYW5GdW5jdGlvbk5hbWUgPSAnc2NhbkluQnVmZmVyUmFuZ2UnXG5cbiAgcmFuZ2UgPSBudWxsXG4gIHNjYW5SYW5nZSA9IGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhyb3cpXG4gIGVkaXRvcltzY2FuRnVuY3Rpb25OYW1lXSBwYXR0ZXJuLCBzY2FuUmFuZ2UsIChldmVudCkgLT4gcmFuZ2UgPSBldmVudC5yYW5nZVxuICByYW5nZVxuXG5nZXRMYXJnZXN0Rm9sZFJhbmdlQ29udGFpbnNCdWZmZXJSb3cgPSAoZWRpdG9yLCByb3cpIC0+XG4gIG1hcmtlcnMgPSBlZGl0b3IuZGlzcGxheUxheWVyLmZvbGRzTWFya2VyTGF5ZXIuZmluZE1hcmtlcnMoaW50ZXJzZWN0c1Jvdzogcm93KVxuXG4gIHN0YXJ0UG9pbnQgPSBudWxsXG4gIGVuZFBvaW50ID0gbnVsbFxuXG4gIGZvciBtYXJrZXIgaW4gbWFya2VycyA/IFtdXG4gICAge3N0YXJ0LCBlbmR9ID0gbWFya2VyLmdldFJhbmdlKClcbiAgICB1bmxlc3Mgc3RhcnRQb2ludFxuICAgICAgc3RhcnRQb2ludCA9IHN0YXJ0XG4gICAgICBlbmRQb2ludCA9IGVuZFxuICAgICAgY29udGludWVcblxuICAgIGlmIHN0YXJ0LmlzTGVzc1RoYW4oc3RhcnRQb2ludClcbiAgICAgIHN0YXJ0UG9pbnQgPSBzdGFydFxuICAgICAgZW5kUG9pbnQgPSBlbmRcblxuICBpZiBzdGFydFBvaW50PyBhbmQgZW5kUG9pbnQ/XG4gICAgbmV3IFJhbmdlKHN0YXJ0UG9pbnQsIGVuZFBvaW50KVxuXG4jIHRha2UgYnVmZmVyUG9zaXRpb25cbnRyYW5zbGF0ZVBvaW50QW5kQ2xpcCA9IChlZGl0b3IsIHBvaW50LCBkaXJlY3Rpb24pIC0+XG4gIHBvaW50ID0gUG9pbnQuZnJvbU9iamVjdChwb2ludClcblxuICBkb250Q2xpcCA9IGZhbHNlXG4gIHN3aXRjaCBkaXJlY3Rpb25cbiAgICB3aGVuICdmb3J3YXJkJ1xuICAgICAgcG9pbnQgPSBwb2ludC50cmFuc2xhdGUoWzAsICsxXSlcbiAgICAgIGVvbCA9IGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhwb2ludC5yb3cpLmVuZFxuXG4gICAgICBpZiBwb2ludC5pc0VxdWFsKGVvbClcbiAgICAgICAgZG9udENsaXAgPSB0cnVlXG4gICAgICBlbHNlIGlmIHBvaW50LmlzR3JlYXRlclRoYW4oZW9sKVxuICAgICAgICBkb250Q2xpcCA9IHRydWVcbiAgICAgICAgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnQucm93ICsgMSwgMCkgIyBtb3ZlIHBvaW50IHRvIG5ldy1saW5lIHNlbGVjdGVkIHBvaW50XG5cbiAgICAgIHBvaW50ID0gUG9pbnQubWluKHBvaW50LCBlZGl0b3IuZ2V0RW9mQnVmZmVyUG9zaXRpb24oKSlcblxuICAgIHdoZW4gJ2JhY2t3YXJkJ1xuICAgICAgcG9pbnQgPSBwb2ludC50cmFuc2xhdGUoWzAsIC0xXSlcblxuICAgICAgaWYgcG9pbnQuY29sdW1uIDwgMFxuICAgICAgICBkb250Q2xpcCA9IHRydWVcbiAgICAgICAgbmV3Um93ID0gcG9pbnQucm93IC0gMVxuICAgICAgICBlb2wgPSBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cobmV3Um93KS5lbmRcbiAgICAgICAgcG9pbnQgPSBuZXcgUG9pbnQobmV3Um93LCBlb2wuY29sdW1uKVxuXG4gICAgICBwb2ludCA9IFBvaW50Lm1heChwb2ludCwgUG9pbnQuWkVSTylcblxuICBpZiBkb250Q2xpcFxuICAgIHBvaW50XG4gIGVsc2VcbiAgICBzY3JlZW5Qb2ludCA9IGVkaXRvci5zY3JlZW5Qb3NpdGlvbkZvckJ1ZmZlclBvc2l0aW9uKHBvaW50LCBjbGlwRGlyZWN0aW9uOiBkaXJlY3Rpb24pXG4gICAgZWRpdG9yLmJ1ZmZlclBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oc2NyZWVuUG9pbnQpXG5cbmdldFJhbmdlQnlUcmFuc2xhdGVQb2ludEFuZENsaXAgPSAoZWRpdG9yLCByYW5nZSwgd2hpY2gsIGRpcmVjdGlvbikgLT5cbiAgbmV3UG9pbnQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAoZWRpdG9yLCByYW5nZVt3aGljaF0sIGRpcmVjdGlvbilcbiAgc3dpdGNoIHdoaWNoXG4gICAgd2hlbiAnc3RhcnQnXG4gICAgICBuZXcgUmFuZ2UobmV3UG9pbnQsIHJhbmdlLmVuZClcbiAgICB3aGVuICdlbmQnXG4gICAgICBuZXcgUmFuZ2UocmFuZ2Uuc3RhcnQsIG5ld1BvaW50KVxuXG4jIFJlbG9hZGFibGUgcmVnaXN0ZXJFbGVtZW50XG5yZWdpc3RlckVsZW1lbnQgPSAobmFtZSwgb3B0aW9ucykgLT5cbiAgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobmFtZSlcbiAgIyBpZiBjb25zdHJ1Y3RvciBpcyBIVE1MRWxlbWVudCwgd2UgaGF2ZW4ndCByZWdpc3RlcmQgeWV0XG4gIGlmIGVsZW1lbnQuY29uc3RydWN0b3IgaXMgSFRNTEVsZW1lbnRcbiAgICBFbGVtZW50ID0gZG9jdW1lbnQucmVnaXN0ZXJFbGVtZW50KG5hbWUsIG9wdGlvbnMpXG4gIGVsc2VcbiAgICBFbGVtZW50ID0gZWxlbWVudC5jb25zdHJ1Y3RvclxuICAgIEVsZW1lbnQucHJvdG90eXBlID0gb3B0aW9ucy5wcm90b3R5cGUgaWYgb3B0aW9ucy5wcm90b3R5cGU/XG4gIEVsZW1lbnRcblxuZ2V0UGFja2FnZSA9IChuYW1lLCBmbikgLT5cbiAgbmV3IFByb21pc2UgKHJlc29sdmUpIC0+XG4gICAgaWYgYXRvbS5wYWNrYWdlcy5pc1BhY2thZ2VBY3RpdmUobmFtZSlcbiAgICAgIHBrZyA9IGF0b20ucGFja2FnZXMuZ2V0QWN0aXZlUGFja2FnZShuYW1lKVxuICAgICAgcmVzb2x2ZShwa2cpXG4gICAgZWxzZVxuICAgICAgZGlzcG9zYWJsZSA9IGF0b20ucGFja2FnZXMub25EaWRBY3RpdmF0ZVBhY2thZ2UgKHBrZykgLT5cbiAgICAgICAgaWYgcGtnLm5hbWUgaXMgbmFtZVxuICAgICAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG4gICAgICAgICAgcmVzb2x2ZShwa2cpXG5cbnNlYXJjaEJ5UHJvamVjdEZpbmQgPSAoZWRpdG9yLCB0ZXh0KSAtPlxuICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvci5lbGVtZW50LCAncHJvamVjdC1maW5kOnNob3cnKVxuICBnZXRQYWNrYWdlKCdmaW5kLWFuZC1yZXBsYWNlJykudGhlbiAocGtnKSAtPlxuICAgIHtwcm9qZWN0RmluZFZpZXd9ID0gcGtnLm1haW5Nb2R1bGVcbiAgICBpZiBwcm9qZWN0RmluZFZpZXc/XG4gICAgICBwcm9qZWN0RmluZFZpZXcuZmluZEVkaXRvci5zZXRUZXh0KHRleHQpXG4gICAgICBwcm9qZWN0RmluZFZpZXcuY29uZmlybSgpXG5cbmxpbWl0TnVtYmVyID0gKG51bWJlciwge21heCwgbWlufT17fSkgLT5cbiAgbnVtYmVyID0gTWF0aC5taW4obnVtYmVyLCBtYXgpIGlmIG1heD9cbiAgbnVtYmVyID0gTWF0aC5tYXgobnVtYmVyLCBtaW4pIGlmIG1pbj9cbiAgbnVtYmVyXG5cbmZpbmRSYW5nZUNvbnRhaW5zUG9pbnQgPSAocmFuZ2VzLCBwb2ludCkgLT5cbiAgZm9yIHJhbmdlIGluIHJhbmdlcyB3aGVuIHJhbmdlLmNvbnRhaW5zUG9pbnQocG9pbnQpXG4gICAgcmV0dXJuIHJhbmdlXG4gIG51bGxcblxubmVnYXRlRnVuY3Rpb24gPSAoZm4pIC0+XG4gIChhcmdzLi4uKSAtPlxuICAgIG5vdCBmbihhcmdzLi4uKVxuXG5pc0VtcHR5ID0gKHRhcmdldCkgLT4gdGFyZ2V0LmlzRW1wdHkoKVxuaXNOb3RFbXB0eSA9IG5lZ2F0ZUZ1bmN0aW9uKGlzRW1wdHkpXG5cbmlzU2luZ2xlTGluZVJhbmdlID0gKHJhbmdlKSAtPiByYW5nZS5pc1NpbmdsZUxpbmUoKVxuaXNOb3RTaW5nbGVMaW5lUmFuZ2UgPSBuZWdhdGVGdW5jdGlvbihpc1NpbmdsZUxpbmVSYW5nZSlcblxuaXNMZWFkaW5nV2hpdGVTcGFjZVJhbmdlID0gKGVkaXRvciwgcmFuZ2UpIC0+IC9eW1xcdCBdKiQvLnRlc3QoZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKSlcbmlzTm90TGVhZGluZ1doaXRlU3BhY2VSYW5nZSA9IG5lZ2F0ZUZ1bmN0aW9uKGlzTGVhZGluZ1doaXRlU3BhY2VSYW5nZSlcblxuaXNFc2NhcGVkQ2hhclJhbmdlID0gKGVkaXRvciwgcmFuZ2UpIC0+XG4gIHJhbmdlID0gUmFuZ2UuZnJvbU9iamVjdChyYW5nZSlcbiAgY2hhcnMgPSBnZXRMZWZ0Q2hhcmFjdGVyRm9yQnVmZmVyUG9zaXRpb24oZWRpdG9yLCByYW5nZS5zdGFydCwgMilcbiAgY2hhcnMuZW5kc1dpdGgoJ1xcXFwnKSBhbmQgbm90IGNoYXJzLmVuZHNXaXRoKCdcXFxcXFxcXCcpXG5cbmluc2VydFRleHRBdEJ1ZmZlclBvc2l0aW9uID0gKGVkaXRvciwgcG9pbnQsIHRleHQpIC0+XG4gIGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShbcG9pbnQsIHBvaW50XSwgdGV4dClcblxuZW5zdXJlRW5kc1dpdGhOZXdMaW5lRm9yQnVmZmVyUm93ID0gKGVkaXRvciwgcm93KSAtPlxuICB1bmxlc3MgaXNFbmRzV2l0aE5ld0xpbmVGb3JCdWZmZXJSb3coZWRpdG9yLCByb3cpXG4gICAgZW9sID0gZ2V0RW5kT2ZMaW5lRm9yQnVmZmVyUm93KGVkaXRvciwgcm93KVxuICAgIGluc2VydFRleHRBdEJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgZW9sLCBcIlxcblwiKVxuXG5mb3JFYWNoUGFuZUF4aXMgPSAoZm4sIGJhc2UpIC0+XG4gIGJhc2UgPz0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLmdldENvbnRhaW5lcigpLmdldFJvb3QoKVxuICBpZiBiYXNlLmNoaWxkcmVuP1xuICAgIGZuKGJhc2UpXG5cbiAgICBmb3IgY2hpbGQgaW4gYmFzZS5jaGlsZHJlblxuICAgICAgZm9yRWFjaFBhbmVBeGlzKGZuLCBjaGlsZClcblxubW9kaWZ5Q2xhc3NMaXN0ID0gKGFjdGlvbiwgZWxlbWVudCwgY2xhc3NOYW1lcy4uLikgLT5cbiAgZWxlbWVudC5jbGFzc0xpc3RbYWN0aW9uXShjbGFzc05hbWVzLi4uKVxuXG5hZGRDbGFzc0xpc3QgPSBtb2RpZnlDbGFzc0xpc3QuYmluZChudWxsLCAnYWRkJylcbnJlbW92ZUNsYXNzTGlzdCA9IG1vZGlmeUNsYXNzTGlzdC5iaW5kKG51bGwsICdyZW1vdmUnKVxudG9nZ2xlQ2xhc3NMaXN0ID0gbW9kaWZ5Q2xhc3NMaXN0LmJpbmQobnVsbCwgJ3RvZ2dsZScpXG5cbnRvZ2dsZUNhc2VGb3JDaGFyYWN0ZXIgPSAoY2hhcikgLT5cbiAgY2hhckxvd2VyID0gY2hhci50b0xvd2VyQ2FzZSgpXG4gIGlmIGNoYXJMb3dlciBpcyBjaGFyXG4gICAgY2hhci50b1VwcGVyQ2FzZSgpXG4gIGVsc2VcbiAgICBjaGFyTG93ZXJcblxuc3BsaXRUZXh0QnlOZXdMaW5lID0gKHRleHQpIC0+XG4gIGlmIHRleHQuZW5kc1dpdGgoXCJcXG5cIilcbiAgICB0ZXh0LnRyaW1SaWdodCgpLnNwbGl0KC9cXHI/XFxuL2cpXG4gIGVsc2VcbiAgICB0ZXh0LnNwbGl0KC9cXHI/XFxuL2cpXG5cbiMgTW9kaWZ5IHJhbmdlIHVzZWQgZm9yIHVuZG8vcmVkbyBmbGFzaCBoaWdobGlnaHQgdG8gbWFrZSBpdCBmZWVsIG5hdHVyYWxseSBmb3IgaHVtYW4uXG4jICAtIFRyaW0gc3RhcnRpbmcgbmV3IGxpbmUoXCJcXG5cIilcbiMgICAgIFwiXFxuYWJjXCIgLT4gXCJhYmNcIlxuIyAgLSBJZiByYW5nZS5lbmQgaXMgRU9MIGV4dGVuZCByYW5nZSB0byBmaXJzdCBjb2x1bW4gb2YgbmV4dCBsaW5lLlxuIyAgICAgXCJhYmNcIiAtPiBcImFiY1xcblwiXG4jIGUuZy5cbiMgLSB3aGVuICdjJyBpcyBhdEVPTDogXCJcXG5hYmNcIiAtPiBcImFiY1xcblwiXG4jIC0gd2hlbiAnYycgaXMgTk9UIGF0RU9MOiBcIlxcbmFiY1wiIC0+IFwiYWJjXCJcbiNcbiMgU28gYWx3YXlzIHRyaW0gaW5pdGlhbCBcIlxcblwiIHBhcnQgcmFuZ2UgYmVjYXVzZSBmbGFzaGluZyB0cmFpbGluZyBsaW5lIGlzIGNvdW50ZXJpbnR1aXRpdmUuXG5odW1hbml6ZUJ1ZmZlclJhbmdlID0gKGVkaXRvciwgcmFuZ2UpIC0+XG4gIGlmIGlzU2luZ2xlTGluZVJhbmdlKHJhbmdlKSBvciBpc0xpbmV3aXNlUmFuZ2UocmFuZ2UpXG4gICAgcmV0dXJuIHJhbmdlXG5cbiAge3N0YXJ0LCBlbmR9ID0gcmFuZ2VcbiAgaWYgcG9pbnRJc0F0RW5kT2ZMaW5lKGVkaXRvciwgc3RhcnQpXG4gICAgbmV3U3RhcnQgPSBzdGFydC50cmF2ZXJzZShbMSwgMF0pXG5cbiAgaWYgcG9pbnRJc0F0RW5kT2ZMaW5lKGVkaXRvciwgZW5kKVxuICAgIG5ld0VuZCA9IGVuZC50cmF2ZXJzZShbMSwgMF0pXG5cbiAgaWYgbmV3U3RhcnQ/IG9yIG5ld0VuZD9cbiAgICBuZXcgUmFuZ2UobmV3U3RhcnQgPyBzdGFydCwgbmV3RW5kID8gZW5kKVxuICBlbHNlXG4gICAgcmFuZ2VcblxuIyBFeHBhbmQgcmFuZ2UgdG8gd2hpdGUgc3BhY2VcbiMgIDEuIEV4cGFuZCB0byBmb3J3YXJkIGRpcmVjdGlvbiwgaWYgc3VjZWVkIHJldHVybiBuZXcgcmFuZ2UuXG4jICAyLiBFeHBhbmQgdG8gYmFja3dhcmQgZGlyZWN0aW9uLCBpZiBzdWNjZWVkIHJldHVybiBuZXcgcmFuZ2UuXG4jICAzLiBXaGVuIGZhaWxkIHRvIGV4cGFuZCBlaXRoZXIgZGlyZWN0aW9uLCByZXR1cm4gb3JpZ2luYWwgcmFuZ2UuXG5leHBhbmRSYW5nZVRvV2hpdGVTcGFjZXMgPSAoZWRpdG9yLCByYW5nZSkgLT5cbiAge3N0YXJ0LCBlbmR9ID0gcmFuZ2VcblxuICBuZXdFbmQgPSBudWxsXG4gIHNjYW5SYW5nZSA9IFtlbmQsIGdldEVuZE9mTGluZUZvckJ1ZmZlclJvdyhlZGl0b3IsIGVuZC5yb3cpXVxuICBlZGl0b3Iuc2NhbkluQnVmZmVyUmFuZ2UgL1xcUy8sIHNjYW5SYW5nZSwgKHtyYW5nZX0pIC0+IG5ld0VuZCA9IHJhbmdlLnN0YXJ0XG5cbiAgaWYgbmV3RW5kPy5pc0dyZWF0ZXJUaGFuKGVuZClcbiAgICByZXR1cm4gbmV3IFJhbmdlKHN0YXJ0LCBuZXdFbmQpXG5cbiAgbmV3U3RhcnQgPSBudWxsXG4gIHNjYW5SYW5nZSA9IFtbc3RhcnQucm93LCAwXSwgcmFuZ2Uuc3RhcnRdXG4gIGVkaXRvci5iYWNrd2FyZHNTY2FuSW5CdWZmZXJSYW5nZSAvXFxTLywgc2NhblJhbmdlLCAoe3JhbmdlfSkgLT4gbmV3U3RhcnQgPSByYW5nZS5lbmRcblxuICBpZiBuZXdTdGFydD8uaXNMZXNzVGhhbihzdGFydClcbiAgICByZXR1cm4gbmV3IFJhbmdlKG5ld1N0YXJ0LCBlbmQpXG5cbiAgcmV0dXJuIHJhbmdlICMgZmFsbGJhY2tcblxuc2NhbkVkaXRvckluRGlyZWN0aW9uID0gKGVkaXRvciwgZGlyZWN0aW9uLCBwYXR0ZXJuLCBvcHRpb25zPXt9LCBmbikgLT5cbiAge2FsbG93TmV4dExpbmUsIGZyb20sIHNjYW5SYW5nZX0gPSBvcHRpb25zXG4gIGlmIG5vdCBmcm9tPyBhbmQgbm90IHNjYW5SYW5nZT9cbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgbXVzdCBlaXRoZXIgb2YgJ2Zyb20nIG9yICdzY2FuUmFuZ2UnIG9wdGlvbnNcIilcblxuICBpZiBzY2FuUmFuZ2VcbiAgICBhbGxvd05leHRMaW5lID0gdHJ1ZVxuICBlbHNlXG4gICAgYWxsb3dOZXh0TGluZSA/PSB0cnVlXG4gIGZyb20gPSBQb2ludC5mcm9tT2JqZWN0KGZyb20pIGlmIGZyb20/XG4gIHN3aXRjaCBkaXJlY3Rpb25cbiAgICB3aGVuICdmb3J3YXJkJ1xuICAgICAgc2NhblJhbmdlID89IG5ldyBSYW5nZShmcm9tLCBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbihlZGl0b3IpKVxuICAgICAgc2NhbkZ1bmN0aW9uID0gJ3NjYW5JbkJ1ZmZlclJhbmdlJ1xuICAgIHdoZW4gJ2JhY2t3YXJkJ1xuICAgICAgc2NhblJhbmdlID89IG5ldyBSYW5nZShbMCwgMF0sIGZyb20pXG4gICAgICBzY2FuRnVuY3Rpb24gPSAnYmFja3dhcmRzU2NhbkluQnVmZmVyUmFuZ2UnXG5cbiAgZWRpdG9yW3NjYW5GdW5jdGlvbl0gcGF0dGVybiwgc2NhblJhbmdlLCAoZXZlbnQpIC0+XG4gICAgaWYgbm90IGFsbG93TmV4dExpbmUgYW5kIGV2ZW50LnJhbmdlLnN0YXJ0LnJvdyBpc250IGZyb20ucm93XG4gICAgICBldmVudC5zdG9wKClcbiAgICAgIHJldHVyblxuICAgIGZuKGV2ZW50KVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYXNzZXJ0XG4gIGFzc2VydFdpdGhFeGNlcHRpb25cbiAgZ2V0QW5jZXN0b3JzXG4gIGdldEtleUJpbmRpbmdGb3JDb21tYW5kXG4gIGluY2x1ZGVcbiAgZGVidWdcbiAgc2F2ZUVkaXRvclN0YXRlXG4gIGlzTGluZXdpc2VSYW5nZVxuICBoYXZlU29tZU5vbkVtcHR5U2VsZWN0aW9uXG4gIHNvcnRSYW5nZXNcbiAgZ2V0SW5kZXhcbiAgZ2V0VmlzaWJsZUJ1ZmZlclJhbmdlXG4gIGdldFZpc2libGVFZGl0b3JzXG4gIHBvaW50SXNBdEVuZE9mTGluZVxuICBwb2ludElzT25XaGl0ZVNwYWNlXG4gIHBvaW50SXNBdEVuZE9mTGluZUF0Tm9uRW1wdHlSb3dcbiAgcG9pbnRJc0F0VmltRW5kT2ZGaWxlXG4gIGN1cnNvcklzQXRWaW1FbmRPZkZpbGVcbiAgZ2V0VmltRW9mQnVmZmVyUG9zaXRpb25cbiAgZ2V0VmltRW9mU2NyZWVuUG9zaXRpb25cbiAgZ2V0VmltTGFzdEJ1ZmZlclJvd1xuICBnZXRWaW1MYXN0U2NyZWVuUm93XG4gIHNldEJ1ZmZlclJvd1xuICBzZXRCdWZmZXJDb2x1bW5cbiAgbW92ZUN1cnNvckxlZnRcbiAgbW92ZUN1cnNvclJpZ2h0XG4gIG1vdmVDdXJzb3JVcFNjcmVlblxuICBtb3ZlQ3Vyc29yRG93blNjcmVlblxuICBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3dcbiAgZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93XG4gIGdldExhc3RWaXNpYmxlU2NyZWVuUm93XG4gIGdldFZhbGlkVmltQnVmZmVyUm93XG4gIGdldFZhbGlkVmltU2NyZWVuUm93XG4gIG1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3dcbiAgZ2V0TGluZVRleHRUb0J1ZmZlclBvc2l0aW9uXG4gIGdldEluZGVudExldmVsRm9yQnVmZmVyUm93XG4gIGdldFRleHRJblNjcmVlblJhbmdlXG4gIG1vdmVDdXJzb3JUb05leHROb25XaGl0ZXNwYWNlXG4gIGlzRW1wdHlSb3dcbiAgY3Vyc29ySXNBdEVuZE9mTGluZUF0Tm9uRW1wdHlSb3dcbiAgZ2V0Q29kZUZvbGRSb3dSYW5nZXNcbiAgZ2V0Q29kZUZvbGRSb3dSYW5nZXNDb250YWluZXNGb3JSb3dcbiAgZ2V0QnVmZmVyUmFuZ2VGb3JSb3dSYW5nZVxuICB0cmltUmFuZ2VcbiAgZ2V0Rmlyc3RDaGFyYWN0ZXJQb3NpdGlvbkZvckJ1ZmZlclJvd1xuICBpc0luY2x1ZGVGdW5jdGlvblNjb3BlRm9yUm93XG4gIGRldGVjdFNjb3BlU3RhcnRQb3NpdGlvbkZvclNjb3BlXG4gIGdldEJ1ZmZlclJvd3NcbiAgcmVnaXN0ZXJFbGVtZW50XG4gIHNtYXJ0U2Nyb2xsVG9CdWZmZXJQb3NpdGlvblxuICBtYXRjaFNjb3Blc1xuICBtb3ZlQ3Vyc29yRG93bkJ1ZmZlclxuICBtb3ZlQ3Vyc29yVXBCdWZmZXJcbiAgaXNTaW5nbGVMaW5lVGV4dFxuICBnZXRXb3JkQnVmZmVyUmFuZ2VBdEJ1ZmZlclBvc2l0aW9uXG4gIGdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uXG4gIGdldFdvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvblxuICBnZXRTdWJ3b3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb25cbiAgZ2V0Tm9uV29yZENoYXJhY3RlcnNGb3JDdXJzb3JcbiAgc2hyaW5rUmFuZ2VFbmRUb0JlZm9yZU5ld0xpbmVcbiAgc2NhbkVkaXRvclxuICBjb2xsZWN0UmFuZ2VJbkJ1ZmZlclJvd1xuICBmaW5kUmFuZ2VJbkJ1ZmZlclJvd1xuICBnZXRMYXJnZXN0Rm9sZFJhbmdlQ29udGFpbnNCdWZmZXJSb3dcbiAgdHJhbnNsYXRlUG9pbnRBbmRDbGlwXG4gIGdldFJhbmdlQnlUcmFuc2xhdGVQb2ludEFuZENsaXBcbiAgZ2V0UGFja2FnZVxuICBzZWFyY2hCeVByb2plY3RGaW5kXG4gIGxpbWl0TnVtYmVyXG4gIGZpbmRSYW5nZUNvbnRhaW5zUG9pbnRcblxuICBpc0VtcHR5LCBpc05vdEVtcHR5XG4gIGlzU2luZ2xlTGluZVJhbmdlLCBpc05vdFNpbmdsZUxpbmVSYW5nZVxuXG4gIGluc2VydFRleHRBdEJ1ZmZlclBvc2l0aW9uXG4gIGVuc3VyZUVuZHNXaXRoTmV3TGluZUZvckJ1ZmZlclJvd1xuICBpc0xlYWRpbmdXaGl0ZVNwYWNlUmFuZ2VcbiAgaXNOb3RMZWFkaW5nV2hpdGVTcGFjZVJhbmdlXG4gIGlzRXNjYXBlZENoYXJSYW5nZVxuXG4gIGZvckVhY2hQYW5lQXhpc1xuICBhZGRDbGFzc0xpc3RcbiAgcmVtb3ZlQ2xhc3NMaXN0XG4gIHRvZ2dsZUNsYXNzTGlzdFxuICB0b2dnbGVDYXNlRm9yQ2hhcmFjdGVyXG4gIHNwbGl0VGV4dEJ5TmV3TGluZVxuICBodW1hbml6ZUJ1ZmZlclJhbmdlXG4gIGV4cGFuZFJhbmdlVG9XaGl0ZVNwYWNlc1xuICBzY2FuRWRpdG9ySW5EaXJlY3Rpb25cbn1cbiJdfQ==
