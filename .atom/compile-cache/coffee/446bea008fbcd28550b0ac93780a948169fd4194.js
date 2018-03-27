(function() {
  var Disposable, Point, Range, _, addClassList, assertWithException, buildWordPatternByCursor, collectRangeInBufferRow, debug, detectScopeStartPositionForScope, ensureEndsWithNewLineForBufferRow, expandRangeToWhiteSpaces, findRangeContainsPoint, findRangeInBufferRow, forEachPaneAxis, fs, getAncestors, getBeginningOfWordBufferPosition, getBufferRangeForRowRange, getBufferRows, getCodeFoldRowRanges, getCodeFoldRowRangesContainesForRow, getEndOfLineForBufferRow, getEndOfWordBufferPosition, getFirstCharacterPositionForBufferRow, getFirstVisibleScreenRow, getIndentLevelForBufferRow, getIndex, getKeyBindingForCommand, getLargestFoldRangeContainsBufferRow, getLastVisibleScreenRow, getLeftCharacterForBufferPosition, getLineTextToBufferPosition, getNonWordCharactersForCursor, getPackage, getRangeByTranslatePointAndClip, getRightCharacterForBufferPosition, getScopesForTokenizedLine, getSubwordPatternAtBufferPosition, getTextInScreenRange, getTokenizedLineForRow, getValidVimBufferRow, getValidVimScreenRow, getVimEofBufferPosition, getVimEofScreenPosition, getVimLastBufferRow, getVimLastScreenRow, getVisibleBufferRange, getVisibleEditors, getWordBufferRangeAndKindAtBufferPosition, getWordBufferRangeAtBufferPosition, getWordPatternAtBufferPosition, haveSomeNonEmptySelection, humanizeBufferRange, include, insertTextAtBufferPosition, isEmpty, isEmptyRow, isEndsWithNewLineForBufferRow, isEscapedCharRange, isFunctionScope, isIncludeFunctionScopeForRow, isLeadingWhiteSpaceRange, isLinewiseRange, isNotEmpty, isNotLeadingWhiteSpaceRange, isNotSingleLineRange, isSingleLineRange, isSingleLineText, limitNumber, matchScopes, modifyClassList, moveCursor, moveCursorDownBuffer, moveCursorDownScreen, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUpBuffer, moveCursorUpScreen, negateFunction, pointIsAtEndOfLine, pointIsAtEndOfLineAtNonEmptyRow, pointIsAtVimEndOfFile, pointIsOnWhiteSpace, ref, removeClassList, saveEditorState, scanEditor, scanEditorInDirection, scanForScopeStart, searchByProjectFind, setBufferColumn, setBufferRow, settings, shouldPreventWrapLine, shrinkRangeEndToBeforeNewLine, smartScrollToBufferPosition, sortRanges, splitTextByNewLine, toggleCaseForCharacter, toggleClassList, translatePointAndClip, trimRange,
    slice = [].slice;

  fs = require('fs-plus');

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
    getBufferRangeForRowRange: getBufferRangeForRowRange,
    trimRange: trimRange,
    getFirstCharacterPositionForBufferRow: getFirstCharacterPositionForBufferRow,
    isIncludeFunctionScopeForRow: isIncludeFunctionScopeForRow,
    detectScopeStartPositionForScope: detectScopeStartPositionForScope,
    getBufferRows: getBufferRows,
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvdXRpbHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxrdkVBQUE7SUFBQTs7RUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSOztFQUVYLE1BQTZCLE9BQUEsQ0FBUSxNQUFSLENBQTdCLEVBQUMsMkJBQUQsRUFBYSxpQkFBYixFQUFvQjs7RUFDcEIsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSixtQkFBQSxHQUFzQixTQUFDLFNBQUQsRUFBWSxPQUFaLEVBQXFCLEVBQXJCO1dBQ3BCLElBQUksQ0FBQyxNQUFMLENBQVksU0FBWixFQUF1QixPQUF2QixFQUFnQyxTQUFDLEtBQUQ7QUFDOUIsWUFBVSxJQUFBLEtBQUEsQ0FBTSxLQUFLLENBQUMsT0FBWjtJQURvQixDQUFoQztFQURvQjs7RUFJdEIsWUFBQSxHQUFlLFNBQUMsR0FBRDtBQUNiLFFBQUE7SUFBQSxTQUFBLEdBQVk7SUFDWixPQUFBLEdBQVU7QUFDVixXQUFBLElBQUE7TUFDRSxTQUFTLENBQUMsSUFBVixDQUFlLE9BQWY7TUFDQSxPQUFBLDRDQUEyQixDQUFFO01BQzdCLElBQUEsQ0FBYSxPQUFiO0FBQUEsY0FBQTs7SUFIRjtXQUlBO0VBUGE7O0VBU2YsdUJBQUEsR0FBMEIsU0FBQyxPQUFELEVBQVUsR0FBVjtBQUN4QixRQUFBO0lBRG1DLGNBQUQ7SUFDbEMsT0FBQSxHQUFVO0lBQ1YsT0FBQSxHQUFVLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYixDQUFBO0lBQ1YsSUFBRyxtQkFBSDtNQUNFLFVBQUEsR0FBYSxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFkLENBQStCLFdBQS9CLENBQTJDLENBQUMsY0FBNUMsQ0FBQSxDQUE0RCxDQUFD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QTJFZixvQkFBQSxrQkEzRWU7SUE2RWYsaUJBQUEsZUE3RWU7SUE4RWYsY0FBQSxZQTlFZTtJQStFZixpQkFBQSxlQS9FZTtJQWdGZixpQkFBQSxlQWhGZTtJQWlGZix3QkFBQSxzQkFqRmU7SUFrRmYsb0JBQUEsa0JBbEZlO0lBbUZmLHFCQUFBLG1CQW5GZTtJQW9GZiwwQkFBQSx3QkFwRmU7SUFxRmYsdUJBQUEscUJBckZlOztBQXp2QmpCIiwic291cmNlc0NvbnRlbnQiOlsiZnMgPSByZXF1aXJlICdmcy1wbHVzJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG57RGlzcG9zYWJsZSwgUmFuZ2UsIFBvaW50fSA9IHJlcXVpcmUgJ2F0b20nXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xuXG5hc3NlcnRXaXRoRXhjZXB0aW9uID0gKGNvbmRpdGlvbiwgbWVzc2FnZSwgZm4pIC0+XG4gIGF0b20uYXNzZXJ0IGNvbmRpdGlvbiwgbWVzc2FnZSwgKGVycm9yKSAtPlxuICAgIHRocm93IG5ldyBFcnJvcihlcnJvci5tZXNzYWdlKVxuXG5nZXRBbmNlc3RvcnMgPSAob2JqKSAtPlxuICBhbmNlc3RvcnMgPSBbXVxuICBjdXJyZW50ID0gb2JqXG4gIGxvb3BcbiAgICBhbmNlc3RvcnMucHVzaChjdXJyZW50KVxuICAgIGN1cnJlbnQgPSBjdXJyZW50Ll9fc3VwZXJfXz8uY29uc3RydWN0b3JcbiAgICBicmVhayB1bmxlc3MgY3VycmVudFxuICBhbmNlc3RvcnNcblxuZ2V0S2V5QmluZGluZ0ZvckNvbW1hbmQgPSAoY29tbWFuZCwge3BhY2thZ2VOYW1lfSkgLT5cbiAgcmVzdWx0cyA9IG51bGxcbiAga2V5bWFwcyA9IGF0b20ua2V5bWFwcy5nZXRLZXlCaW5kaW5ncygpXG4gIGlmIHBhY2thZ2VOYW1lP1xuICAgIGtleW1hcFBhdGggPSBhdG9tLnBhY2thZ2VzLmdldEFjdGl2ZVBhY2thZ2UocGFja2FnZU5hbWUpLmdldEtleW1hcFBhdGhzKCkucG9wKClcbiAgICBrZXltYXBzID0ga2V5bWFwcy5maWx0ZXIoKHtzb3VyY2V9KSAtPiBzb3VyY2UgaXMga2V5bWFwUGF0aClcblxuICBmb3Iga2V5bWFwIGluIGtleW1hcHMgd2hlbiBrZXltYXAuY29tbWFuZCBpcyBjb21tYW5kXG4gICAge2tleXN0cm9rZXMsIHNlbGVjdG9yfSA9IGtleW1hcFxuICAgIGtleXN0cm9rZXMgPSBrZXlzdHJva2VzLnJlcGxhY2UoL3NoaWZ0LS8sICcnKVxuICAgIChyZXN1bHRzID89IFtdKS5wdXNoKHtrZXlzdHJva2VzLCBzZWxlY3Rvcn0pXG4gIHJlc3VsdHNcblxuIyBJbmNsdWRlIG1vZHVsZShvYmplY3Qgd2hpY2ggbm9ybWFseSBwcm92aWRlcyBzZXQgb2YgbWV0aG9kcykgdG8ga2xhc3NcbmluY2x1ZGUgPSAoa2xhc3MsIG1vZHVsZSkgLT5cbiAgZm9yIGtleSwgdmFsdWUgb2YgbW9kdWxlXG4gICAga2xhc3M6OltrZXldID0gdmFsdWVcblxuZGVidWcgPSAobWVzc2FnZXMuLi4pIC0+XG4gIHJldHVybiB1bmxlc3Mgc2V0dGluZ3MuZ2V0KCdkZWJ1ZycpXG4gIHN3aXRjaCBzZXR0aW5ncy5nZXQoJ2RlYnVnT3V0cHV0JylcbiAgICB3aGVuICdjb25zb2xlJ1xuICAgICAgY29uc29sZS5sb2cgbWVzc2FnZXMuLi5cbiAgICB3aGVuICdmaWxlJ1xuICAgICAgZmlsZVBhdGggPSBmcy5ub3JtYWxpemUgc2V0dGluZ3MuZ2V0KCdkZWJ1Z091dHB1dEZpbGVQYXRoJylcbiAgICAgIGlmIGZzLmV4aXN0c1N5bmMoZmlsZVBhdGgpXG4gICAgICAgIGZzLmFwcGVuZEZpbGVTeW5jIGZpbGVQYXRoLCBtZXNzYWdlcyArIFwiXFxuXCJcblxuIyBSZXR1cm4gZnVuY3Rpb24gdG8gcmVzdG9yZSBlZGl0b3IncyBzY3JvbGxUb3AgYW5kIGZvbGQgc3RhdGUuXG5zYXZlRWRpdG9yU3RhdGUgPSAoZWRpdG9yKSAtPlxuICBlZGl0b3JFbGVtZW50ID0gZWRpdG9yLmVsZW1lbnRcbiAgc2Nyb2xsVG9wID0gZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3AoKVxuXG4gIGZvbGRTdGFydFJvd3MgPSBlZGl0b3IuZGlzcGxheUxheWVyLmZvbGRzTWFya2VyTGF5ZXIuZmluZE1hcmtlcnMoe30pLm1hcCAobSkgLT4gbS5nZXRTdGFydFBvc2l0aW9uKCkucm93XG4gIC0+XG4gICAgZm9yIHJvdyBpbiBmb2xkU3RhcnRSb3dzLnJldmVyc2UoKSB3aGVuIG5vdCBlZGl0b3IuaXNGb2xkZWRBdEJ1ZmZlclJvdyhyb3cpXG4gICAgICBlZGl0b3IuZm9sZEJ1ZmZlclJvdyhyb3cpXG4gICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3Aoc2Nyb2xsVG9wKVxuXG5pc0xpbmV3aXNlUmFuZ2UgPSAoe3N0YXJ0LCBlbmR9KSAtPlxuICAoc3RhcnQucm93IGlzbnQgZW5kLnJvdykgYW5kIChzdGFydC5jb2x1bW4gaXMgZW5kLmNvbHVtbiBpcyAwKVxuXG5pc0VuZHNXaXRoTmV3TGluZUZvckJ1ZmZlclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAge3N0YXJ0LCBlbmR9ID0gZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHJvdywgaW5jbHVkZU5ld2xpbmU6IHRydWUpXG4gIHN0YXJ0LnJvdyBpc250IGVuZC5yb3dcblxuaGF2ZVNvbWVOb25FbXB0eVNlbGVjdGlvbiA9IChlZGl0b3IpIC0+XG4gIGVkaXRvci5nZXRTZWxlY3Rpb25zKCkuc29tZShpc05vdEVtcHR5KVxuXG5zb3J0UmFuZ2VzID0gKGNvbGxlY3Rpb24pIC0+XG4gIGNvbGxlY3Rpb24uc29ydCAoYSwgYikgLT4gYS5jb21wYXJlKGIpXG5cbiMgUmV0dXJuIGFkanVzdGVkIGluZGV4IGZpdCB3aGl0aW4gZ2l2ZW4gbGlzdCdzIGxlbmd0aFxuIyByZXR1cm4gLTEgaWYgbGlzdCBpcyBlbXB0eS5cbmdldEluZGV4ID0gKGluZGV4LCBsaXN0KSAtPlxuICBsZW5ndGggPSBsaXN0Lmxlbmd0aFxuICBpZiBsZW5ndGggaXMgMFxuICAgIC0xXG4gIGVsc2VcbiAgICBpbmRleCA9IGluZGV4ICUgbGVuZ3RoXG4gICAgaWYgaW5kZXggPj0gMFxuICAgICAgaW5kZXhcbiAgICBlbHNlXG4gICAgICBsZW5ndGggKyBpbmRleFxuXG4jIE5PVEU6IGVuZFJvdyBiZWNvbWUgdW5kZWZpbmVkIGlmIEBlZGl0b3JFbGVtZW50IGlzIG5vdCB5ZXQgYXR0YWNoZWQuXG4jIGUuZy4gQmVnaW5nIGNhbGxlZCBpbW1lZGlhdGVseSBhZnRlciBvcGVuIGZpbGUuXG5nZXRWaXNpYmxlQnVmZmVyUmFuZ2UgPSAoZWRpdG9yKSAtPlxuICBbc3RhcnRSb3csIGVuZFJvd10gPSBlZGl0b3IuZWxlbWVudC5nZXRWaXNpYmxlUm93UmFuZ2UoKVxuICByZXR1cm4gbnVsbCB1bmxlc3MgKHN0YXJ0Um93PyBhbmQgZW5kUm93PylcbiAgc3RhcnRSb3cgPSBlZGl0b3IuYnVmZmVyUm93Rm9yU2NyZWVuUm93KHN0YXJ0Um93KVxuICBlbmRSb3cgPSBlZGl0b3IuYnVmZmVyUm93Rm9yU2NyZWVuUm93KGVuZFJvdylcbiAgbmV3IFJhbmdlKFtzdGFydFJvdywgMF0sIFtlbmRSb3csIEluZmluaXR5XSlcblxuZ2V0VmlzaWJsZUVkaXRvcnMgPSAtPlxuICAoZWRpdG9yIGZvciBwYW5lIGluIGF0b20ud29ya3NwYWNlLmdldFBhbmVzKCkgd2hlbiBlZGl0b3IgPSBwYW5lLmdldEFjdGl2ZUVkaXRvcigpKVxuXG5nZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3cgPSAoZWRpdG9yLCByb3cpIC0+XG4gIGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhyb3cpLmVuZFxuXG4jIFBvaW50IHV0aWxcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxucG9pbnRJc0F0RW5kT2ZMaW5lID0gKGVkaXRvciwgcG9pbnQpIC0+XG4gIHBvaW50ID0gUG9pbnQuZnJvbU9iamVjdChwb2ludClcbiAgZ2V0RW5kT2ZMaW5lRm9yQnVmZmVyUm93KGVkaXRvciwgcG9pbnQucm93KS5pc0VxdWFsKHBvaW50KVxuXG5wb2ludElzT25XaGl0ZVNwYWNlID0gKGVkaXRvciwgcG9pbnQpIC0+XG4gIGNoYXIgPSBnZXRSaWdodENoYXJhY3RlckZvckJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgcG9pbnQpXG4gIG5vdCAvXFxTLy50ZXN0KGNoYXIpXG5cbnBvaW50SXNBdEVuZE9mTGluZUF0Tm9uRW1wdHlSb3cgPSAoZWRpdG9yLCBwb2ludCkgLT5cbiAgcG9pbnQgPSBQb2ludC5mcm9tT2JqZWN0KHBvaW50KVxuICBwb2ludC5jb2x1bW4gaXNudCAwIGFuZCBwb2ludElzQXRFbmRPZkxpbmUoZWRpdG9yLCBwb2ludClcblxucG9pbnRJc0F0VmltRW5kT2ZGaWxlID0gKGVkaXRvciwgcG9pbnQpIC0+XG4gIGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKGVkaXRvcikuaXNFcXVhbChwb2ludClcblxuaXNFbXB0eVJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHJvdykuaXNFbXB0eSgpXG5cbmdldFJpZ2h0Q2hhcmFjdGVyRm9yQnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCwgYW1vdW50PTEpIC0+XG4gIGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShSYW5nZS5mcm9tUG9pbnRXaXRoRGVsdGEocG9pbnQsIDAsIGFtb3VudCkpXG5cbmdldExlZnRDaGFyYWN0ZXJGb3JCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50LCBhbW91bnQ9MSkgLT5cbiAgZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKFJhbmdlLmZyb21Qb2ludFdpdGhEZWx0YShwb2ludCwgMCwgLWFtb3VudCkpXG5cbmdldFRleHRJblNjcmVlblJhbmdlID0gKGVkaXRvciwgc2NyZWVuUmFuZ2UpIC0+XG4gIGJ1ZmZlclJhbmdlID0gZWRpdG9yLmJ1ZmZlclJhbmdlRm9yU2NyZWVuUmFuZ2Uoc2NyZWVuUmFuZ2UpXG4gIGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShidWZmZXJSYW5nZSlcblxuZ2V0Tm9uV29yZENoYXJhY3RlcnNGb3JDdXJzb3IgPSAoY3Vyc29yKSAtPlxuICAjIEF0b20gMS4xMS4wLWJldGE1IGhhdmUgdGhpcyBleHBlcmltZW50YWwgbWV0aG9kLlxuICBpZiBjdXJzb3IuZ2V0Tm9uV29yZENoYXJhY3RlcnM/XG4gICAgY3Vyc29yLmdldE5vbldvcmRDaGFyYWN0ZXJzKClcbiAgZWxzZVxuICAgIHNjb3BlID0gY3Vyc29yLmdldFNjb3BlRGVzY3JpcHRvcigpLmdldFNjb3Blc0FycmF5KClcbiAgICBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5ub25Xb3JkQ2hhcmFjdGVycycsIHtzY29wZX0pXG5cbiMgRklYTUU6IHJlbW92ZSB0aGlzXG4jIHJldHVybiB0cnVlIGlmIG1vdmVkXG5tb3ZlQ3Vyc29yVG9OZXh0Tm9uV2hpdGVzcGFjZSA9IChjdXJzb3IpIC0+XG4gIG9yaWdpbmFsUG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICBlZGl0b3IgPSBjdXJzb3IuZWRpdG9yXG4gIHZpbUVvZiA9IGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKGVkaXRvcilcblxuICB3aGlsZSBwb2ludElzT25XaGl0ZVNwYWNlKGVkaXRvciwgcG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKSkgYW5kIG5vdCBwb2ludC5pc0dyZWF0ZXJUaGFuT3JFcXVhbCh2aW1Fb2YpXG4gICAgY3Vyc29yLm1vdmVSaWdodCgpXG4gIG5vdCBvcmlnaW5hbFBvaW50LmlzRXF1YWwoY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpXG5cbmdldEJ1ZmZlclJvd3MgPSAoZWRpdG9yLCB7c3RhcnRSb3csIGRpcmVjdGlvbn0pIC0+XG4gIHN3aXRjaCBkaXJlY3Rpb25cbiAgICB3aGVuICdwcmV2aW91cydcbiAgICAgIGlmIHN0YXJ0Um93IDw9IDBcbiAgICAgICAgW11cbiAgICAgIGVsc2VcbiAgICAgICAgWyhzdGFydFJvdyAtIDEpLi4wXVxuICAgIHdoZW4gJ25leHQnXG4gICAgICBlbmRSb3cgPSBnZXRWaW1MYXN0QnVmZmVyUm93KGVkaXRvcilcbiAgICAgIGlmIHN0YXJ0Um93ID49IGVuZFJvd1xuICAgICAgICBbXVxuICAgICAgZWxzZVxuICAgICAgICBbKHN0YXJ0Um93ICsgMSkuLmVuZFJvd11cblxuIyBSZXR1cm4gVmltJ3MgRU9GIHBvc2l0aW9uIHJhdGhlciB0aGFuIEF0b20ncyBFT0YgcG9zaXRpb24uXG4jIFRoaXMgZnVuY3Rpb24gY2hhbmdlIG1lYW5pbmcgb2YgRU9GIGZyb20gbmF0aXZlIFRleHRFZGl0b3I6OmdldEVvZkJ1ZmZlclBvc2l0aW9uKClcbiMgQXRvbSBpcyBzcGVjaWFsKHN0cmFuZ2UpIGZvciBjdXJzb3IgY2FuIHBhc3QgdmVyeSBsYXN0IG5ld2xpbmUgY2hhcmFjdGVyLlxuIyBCZWNhdXNlIG9mIHRoaXMsIEF0b20ncyBFT0YgcG9zaXRpb24gaXMgW2FjdHVhbExhc3RSb3crMSwgMF0gcHJvdmlkZWQgbGFzdC1ub24tYmxhbmstcm93XG4jIGVuZHMgd2l0aCBuZXdsaW5lIGNoYXIuXG4jIEJ1dCBpbiBWaW0sIGN1cm9yIGNhbiBOT1QgcGFzdCBsYXN0IG5ld2xpbmUuIEVPRiBpcyBuZXh0IHBvc2l0aW9uIG9mIHZlcnkgbGFzdCBjaGFyYWN0ZXIuXG5nZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IpIC0+XG4gIGVvZiA9IGVkaXRvci5nZXRFb2ZCdWZmZXJQb3NpdGlvbigpXG4gIGlmIChlb2Yucm93IGlzIDApIG9yIChlb2YuY29sdW1uID4gMClcbiAgICBlb2ZcbiAgZWxzZVxuICAgIGdldEVuZE9mTGluZUZvckJ1ZmZlclJvdyhlZGl0b3IsIGVvZi5yb3cgLSAxKVxuXG5nZXRWaW1Fb2ZTY3JlZW5Qb3NpdGlvbiA9IChlZGl0b3IpIC0+XG4gIGVkaXRvci5zY3JlZW5Qb3NpdGlvbkZvckJ1ZmZlclBvc2l0aW9uKGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uKGVkaXRvcikpXG5cbmdldFZpbUxhc3RCdWZmZXJSb3cgPSAoZWRpdG9yKSAtPiBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbihlZGl0b3IpLnJvd1xuZ2V0VmltTGFzdFNjcmVlblJvdyA9IChlZGl0b3IpIC0+IGdldFZpbUVvZlNjcmVlblBvc2l0aW9uKGVkaXRvcikucm93XG5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3cgPSAoZWRpdG9yKSAtPiBlZGl0b3IuZWxlbWVudC5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3cgPSAoZWRpdG9yKSAtPiBlZGl0b3IuZWxlbWVudC5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpXG5cbmdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3cgPSAoZWRpdG9yLCByb3cpIC0+XG4gIHJhbmdlID0gZmluZFJhbmdlSW5CdWZmZXJSb3coZWRpdG9yLCAvXFxTLywgcm93KVxuICByYW5nZT8uc3RhcnQgPyBuZXcgUG9pbnQocm93LCAwKVxuXG50cmltUmFuZ2UgPSAoZWRpdG9yLCBzY2FuUmFuZ2UpIC0+XG4gIHBhdHRlcm4gPSAvXFxTL1xuICBbc3RhcnQsIGVuZF0gPSBbXVxuICBzZXRTdGFydCA9ICh7cmFuZ2V9KSAtPiB7c3RhcnR9ID0gcmFuZ2VcbiAgc2V0RW5kID0gKHtyYW5nZX0pIC0+IHtlbmR9ID0gcmFuZ2VcbiAgZWRpdG9yLnNjYW5JbkJ1ZmZlclJhbmdlKHBhdHRlcm4sIHNjYW5SYW5nZSwgc2V0U3RhcnQpXG4gIGVkaXRvci5iYWNrd2FyZHNTY2FuSW5CdWZmZXJSYW5nZShwYXR0ZXJuLCBzY2FuUmFuZ2UsIHNldEVuZCkgaWYgc3RhcnQ/XG4gIGlmIHN0YXJ0PyBhbmQgZW5kP1xuICAgIG5ldyBSYW5nZShzdGFydCwgZW5kKVxuICBlbHNlXG4gICAgc2NhblJhbmdlXG5cbiMgQ3Vyc29yIG1vdGlvbiB3cmFwcGVyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgSnVzdCB1cGRhdGUgYnVmZmVyUm93IHdpdGgga2VlcGluZyBjb2x1bW4gYnkgcmVzcGVjdGluZyBnb2FsQ29sdW1uXG5zZXRCdWZmZXJSb3cgPSAoY3Vyc29yLCByb3csIG9wdGlvbnMpIC0+XG4gIGNvbHVtbiA9IGN1cnNvci5nb2FsQ29sdW1uID8gY3Vyc29yLmdldEJ1ZmZlckNvbHVtbigpXG4gIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihbcm93LCBjb2x1bW5dLCBvcHRpb25zKVxuICBjdXJzb3IuZ29hbENvbHVtbiA9IGNvbHVtblxuXG5zZXRCdWZmZXJDb2x1bW4gPSAoY3Vyc29yLCBjb2x1bW4pIC0+XG4gIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihbY3Vyc29yLmdldEJ1ZmZlclJvdygpLCBjb2x1bW5dKVxuXG5tb3ZlQ3Vyc29yID0gKGN1cnNvciwge3ByZXNlcnZlR29hbENvbHVtbn0sIGZuKSAtPlxuICB7Z29hbENvbHVtbn0gPSBjdXJzb3JcbiAgZm4oY3Vyc29yKVxuICBpZiBwcmVzZXJ2ZUdvYWxDb2x1bW4gYW5kIGdvYWxDb2x1bW4/XG4gICAgY3Vyc29yLmdvYWxDb2x1bW4gPSBnb2FsQ29sdW1uXG5cbiMgV29ya2Fyb3VuZCBpc3N1ZSBmb3IgdDltZC92aW0tbW9kZS1wbHVzIzIyNiBhbmQgYXRvbS9hdG9tIzMxNzRcbiMgSSBjYW5ub3QgZGVwZW5kIGN1cnNvcidzIGNvbHVtbiBzaW5jZSBpdHMgY2xhaW0gMCBhbmQgY2xpcHBpbmcgZW1tdWxhdGlvbiBkb24ndFxuIyByZXR1cm4gd3JhcHBlZCBsaW5lLCBidXQgSXQgYWN0dWFsbHkgd3JhcCwgc28gSSBuZWVkIHRvIGRvIHZlcnkgZGlydHkgd29yayB0b1xuIyBwcmVkaWN0IHdyYXAgaHVyaXN0aWNhbGx5Llxuc2hvdWxkUHJldmVudFdyYXBMaW5lID0gKGN1cnNvcikgLT5cbiAge3JvdywgY29sdW1ufSA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gIGlmIGF0b20uY29uZmlnLmdldCgnZWRpdG9yLnNvZnRUYWJzJylcbiAgICB0YWJMZW5ndGggPSBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci50YWJMZW5ndGgnKVxuICAgIGlmIDAgPCBjb2x1bW4gPCB0YWJMZW5ndGhcbiAgICAgIHRleHQgPSBjdXJzb3IuZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKFtbcm93LCAwXSwgW3JvdywgdGFiTGVuZ3RoXV0pXG4gICAgICAvXlxccyskLy50ZXN0KHRleHQpXG4gICAgZWxzZVxuICAgICAgZmFsc2VcblxuIyBvcHRpb25zOlxuIyAgIGFsbG93V3JhcDogdG8gY29udHJvbGwgYWxsb3cgd3JhcFxuIyAgIHByZXNlcnZlR29hbENvbHVtbjogcHJlc2VydmUgb3JpZ2luYWwgZ29hbENvbHVtblxubW92ZUN1cnNvckxlZnQgPSAoY3Vyc29yLCBvcHRpb25zPXt9KSAtPlxuICB7YWxsb3dXcmFwLCBuZWVkU3BlY2lhbENhcmVUb1ByZXZlbnRXcmFwTGluZX0gPSBvcHRpb25zXG4gIGRlbGV0ZSBvcHRpb25zLmFsbG93V3JhcFxuICBpZiBuZWVkU3BlY2lhbENhcmVUb1ByZXZlbnRXcmFwTGluZVxuICAgIHJldHVybiBpZiBzaG91bGRQcmV2ZW50V3JhcExpbmUoY3Vyc29yKVxuXG4gIGlmIG5vdCBjdXJzb3IuaXNBdEJlZ2lubmluZ09mTGluZSgpIG9yIGFsbG93V3JhcFxuICAgIG1vdGlvbiA9IChjdXJzb3IpIC0+IGN1cnNvci5tb3ZlTGVmdCgpXG4gICAgbW92ZUN1cnNvcihjdXJzb3IsIG9wdGlvbnMsIG1vdGlvbilcblxubW92ZUN1cnNvclJpZ2h0ID0gKGN1cnNvciwgb3B0aW9ucz17fSkgLT5cbiAge2FsbG93V3JhcH0gPSBvcHRpb25zXG4gIGRlbGV0ZSBvcHRpb25zLmFsbG93V3JhcFxuICBpZiBub3QgY3Vyc29yLmlzQXRFbmRPZkxpbmUoKSBvciBhbGxvd1dyYXBcbiAgICBtb3Rpb24gPSAoY3Vyc29yKSAtPiBjdXJzb3IubW92ZVJpZ2h0KClcbiAgICBtb3ZlQ3Vyc29yKGN1cnNvciwgb3B0aW9ucywgbW90aW9uKVxuXG5tb3ZlQ3Vyc29yVXBTY3JlZW4gPSAoY3Vyc29yLCBvcHRpb25zPXt9KSAtPlxuICB1bmxlc3MgY3Vyc29yLmdldFNjcmVlblJvdygpIGlzIDBcbiAgICBtb3Rpb24gPSAoY3Vyc29yKSAtPiBjdXJzb3IubW92ZVVwKClcbiAgICBtb3ZlQ3Vyc29yKGN1cnNvciwgb3B0aW9ucywgbW90aW9uKVxuXG5tb3ZlQ3Vyc29yRG93blNjcmVlbiA9IChjdXJzb3IsIG9wdGlvbnM9e30pIC0+XG4gIHVubGVzcyBnZXRWaW1MYXN0U2NyZWVuUm93KGN1cnNvci5lZGl0b3IpIGlzIGN1cnNvci5nZXRTY3JlZW5Sb3coKVxuICAgIG1vdGlvbiA9IChjdXJzb3IpIC0+IGN1cnNvci5tb3ZlRG93bigpXG4gICAgbW92ZUN1cnNvcihjdXJzb3IsIG9wdGlvbnMsIG1vdGlvbilcblxuIyBGSVhNRVxubW92ZUN1cnNvckRvd25CdWZmZXIgPSAoY3Vyc29yKSAtPlxuICBwb2ludCA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gIHVubGVzcyBnZXRWaW1MYXN0QnVmZmVyUm93KGN1cnNvci5lZGl0b3IpIGlzIHBvaW50LnJvd1xuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludC50cmFuc2xhdGUoWysxLCAwXSkpXG5cbiMgRklYTUVcbm1vdmVDdXJzb3JVcEJ1ZmZlciA9IChjdXJzb3IpIC0+XG4gIHBvaW50ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgdW5sZXNzIHBvaW50LnJvdyBpcyAwXG4gICAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKHBvaW50LnRyYW5zbGF0ZShbLTEsIDBdKSlcblxubW92ZUN1cnNvclRvRmlyc3RDaGFyYWN0ZXJBdFJvdyA9IChjdXJzb3IsIHJvdykgLT5cbiAgY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKFtyb3csIDBdKVxuICBjdXJzb3IubW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUoKVxuXG5nZXRWYWxpZFZpbUJ1ZmZlclJvdyA9IChlZGl0b3IsIHJvdykgLT4gbGltaXROdW1iZXIocm93LCBtaW46IDAsIG1heDogZ2V0VmltTGFzdEJ1ZmZlclJvdyhlZGl0b3IpKVxuXG5nZXRWYWxpZFZpbVNjcmVlblJvdyA9IChlZGl0b3IsIHJvdykgLT4gbGltaXROdW1iZXIocm93LCBtaW46IDAsIG1heDogZ2V0VmltTGFzdFNjcmVlblJvdyhlZGl0b3IpKVxuXG4jIEJ5IGRlZmF1bHQgbm90IGluY2x1ZGUgY29sdW1uXG5nZXRMaW5lVGV4dFRvQnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCB7cm93LCBjb2x1bW59LCB7ZXhjbHVzaXZlfT17fSkgLT5cbiAgaWYgZXhjbHVzaXZlID8gdHJ1ZVxuICAgIGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhyb3cpWzAuLi5jb2x1bW5dXG4gIGVsc2VcbiAgICBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocm93KVswLi5jb2x1bW5dXG5cbmdldEluZGVudExldmVsRm9yQnVmZmVyUm93ID0gKGVkaXRvciwgcm93KSAtPlxuICBlZGl0b3IuaW5kZW50TGV2ZWxGb3JMaW5lKGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhyb3cpKVxuXG5nZXRDb2RlRm9sZFJvd1JhbmdlcyA9IChlZGl0b3IpIC0+XG4gIFswLi5lZGl0b3IuZ2V0TGFzdEJ1ZmZlclJvdygpXVxuICAgIC5tYXAgKHJvdykgLT5cbiAgICAgIGVkaXRvci5sYW5ndWFnZU1vZGUucm93UmFuZ2VGb3JDb2RlRm9sZEF0QnVmZmVyUm93KHJvdylcbiAgICAuZmlsdGVyIChyb3dSYW5nZSkgLT5cbiAgICAgIHJvd1JhbmdlPyBhbmQgcm93UmFuZ2VbMF0/IGFuZCByb3dSYW5nZVsxXT9cblxuIyBVc2VkIGluIHZtcC1qYXNtaW5lLWluY3JlYXNlLWZvY3VzXG5nZXRDb2RlRm9sZFJvd1Jhbmdlc0NvbnRhaW5lc0ZvclJvdyA9IChlZGl0b3IsIGJ1ZmZlclJvdywge2luY2x1ZGVTdGFydFJvd309e30pIC0+XG4gIGluY2x1ZGVTdGFydFJvdyA/PSB0cnVlXG4gIGdldENvZGVGb2xkUm93UmFuZ2VzKGVkaXRvcikuZmlsdGVyIChbc3RhcnRSb3csIGVuZFJvd10pIC0+XG4gICAgaWYgaW5jbHVkZVN0YXJ0Um93XG4gICAgICBzdGFydFJvdyA8PSBidWZmZXJSb3cgPD0gZW5kUm93XG4gICAgZWxzZVxuICAgICAgc3RhcnRSb3cgPCBidWZmZXJSb3cgPD0gZW5kUm93XG5cbmdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2UgPSAoZWRpdG9yLCByb3dSYW5nZSkgLT5cbiAgW3N0YXJ0UmFuZ2UsIGVuZFJhbmdlXSA9IHJvd1JhbmdlLm1hcCAocm93KSAtPlxuICAgIGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhyb3csIGluY2x1ZGVOZXdsaW5lOiB0cnVlKVxuICBzdGFydFJhbmdlLnVuaW9uKGVuZFJhbmdlKVxuXG5nZXRUb2tlbml6ZWRMaW5lRm9yUm93ID0gKGVkaXRvciwgcm93KSAtPlxuICBlZGl0b3IudG9rZW5pemVkQnVmZmVyLnRva2VuaXplZExpbmVGb3JSb3cocm93KVxuXG5nZXRTY29wZXNGb3JUb2tlbml6ZWRMaW5lID0gKGxpbmUpIC0+XG4gIGZvciB0YWcgaW4gbGluZS50YWdzIHdoZW4gdGFnIDwgMCBhbmQgKHRhZyAlIDIgaXMgLTEpXG4gICAgYXRvbS5ncmFtbWFycy5zY29wZUZvcklkKHRhZylcblxuc2NhbkZvclNjb3BlU3RhcnQgPSAoZWRpdG9yLCBmcm9tUG9pbnQsIGRpcmVjdGlvbiwgZm4pIC0+XG4gIGZyb21Qb2ludCA9IFBvaW50LmZyb21PYmplY3QoZnJvbVBvaW50KVxuICBzY2FuUm93cyA9IHN3aXRjaCBkaXJlY3Rpb25cbiAgICB3aGVuICdmb3J3YXJkJyB0aGVuIFsoZnJvbVBvaW50LnJvdykuLmVkaXRvci5nZXRMYXN0QnVmZmVyUm93KCldXG4gICAgd2hlbiAnYmFja3dhcmQnIHRoZW4gWyhmcm9tUG9pbnQucm93KS4uMF1cblxuICBjb250aW51ZVNjYW4gPSB0cnVlXG4gIHN0b3AgPSAtPlxuICAgIGNvbnRpbnVlU2NhbiA9IGZhbHNlXG5cbiAgaXNWYWxpZFRva2VuID0gc3dpdGNoIGRpcmVjdGlvblxuICAgIHdoZW4gJ2ZvcndhcmQnIHRoZW4gKHtwb3NpdGlvbn0pIC0+IHBvc2l0aW9uLmlzR3JlYXRlclRoYW4oZnJvbVBvaW50KVxuICAgIHdoZW4gJ2JhY2t3YXJkJyB0aGVuICh7cG9zaXRpb259KSAtPiBwb3NpdGlvbi5pc0xlc3NUaGFuKGZyb21Qb2ludClcblxuICBmb3Igcm93IGluIHNjYW5Sb3dzIHdoZW4gdG9rZW5pemVkTGluZSA9IGdldFRva2VuaXplZExpbmVGb3JSb3coZWRpdG9yLCByb3cpXG4gICAgY29sdW1uID0gMFxuICAgIHJlc3VsdHMgPSBbXVxuXG4gICAgdG9rZW5JdGVyYXRvciA9IHRva2VuaXplZExpbmUuZ2V0VG9rZW5JdGVyYXRvcigpXG4gICAgZm9yIHRhZyBpbiB0b2tlbml6ZWRMaW5lLnRhZ3NcbiAgICAgIHRva2VuSXRlcmF0b3IubmV4dCgpXG4gICAgICBpZiB0YWcgPCAwICMgTmVnYXRpdmU6IHN0YXJ0L3N0b3AgdG9rZW5cbiAgICAgICAgc2NvcGUgPSBhdG9tLmdyYW1tYXJzLnNjb3BlRm9ySWQodGFnKVxuICAgICAgICBpZiAodGFnICUgMikgaXMgMCAjIEV2ZW46IHNjb3BlIHN0b3BcbiAgICAgICAgICBudWxsXG4gICAgICAgIGVsc2UgIyBPZGQ6IHNjb3BlIHN0YXJ0XG4gICAgICAgICAgcG9zaXRpb24gPSBuZXcgUG9pbnQocm93LCBjb2x1bW4pXG4gICAgICAgICAgcmVzdWx0cy5wdXNoIHtzY29wZSwgcG9zaXRpb24sIHN0b3B9XG4gICAgICBlbHNlXG4gICAgICAgIGNvbHVtbiArPSB0YWdcblxuICAgIHJlc3VsdHMgPSByZXN1bHRzLmZpbHRlcihpc1ZhbGlkVG9rZW4pXG4gICAgcmVzdWx0cy5yZXZlcnNlKCkgaWYgZGlyZWN0aW9uIGlzICdiYWNrd2FyZCdcbiAgICBmb3IgcmVzdWx0IGluIHJlc3VsdHNcbiAgICAgIGZuKHJlc3VsdClcbiAgICAgIHJldHVybiB1bmxlc3MgY29udGludWVTY2FuXG4gICAgcmV0dXJuIHVubGVzcyBjb250aW51ZVNjYW5cblxuZGV0ZWN0U2NvcGVTdGFydFBvc2l0aW9uRm9yU2NvcGUgPSAoZWRpdG9yLCBmcm9tUG9pbnQsIGRpcmVjdGlvbiwgc2NvcGUpIC0+XG4gIHBvaW50ID0gbnVsbFxuICBzY2FuRm9yU2NvcGVTdGFydCBlZGl0b3IsIGZyb21Qb2ludCwgZGlyZWN0aW9uLCAoaW5mbykgLT5cbiAgICBpZiBpbmZvLnNjb3BlLnNlYXJjaChzY29wZSkgPj0gMFxuICAgICAgaW5mby5zdG9wKClcbiAgICAgIHBvaW50ID0gaW5mby5wb3NpdGlvblxuICBwb2ludFxuXG5pc0luY2x1ZGVGdW5jdGlvblNjb3BlRm9yUm93ID0gKGVkaXRvciwgcm93KSAtPlxuICAjIFtGSVhNRV0gQnVnIG9mIHVwc3RyZWFtP1xuICAjIFNvbWV0aW1lIHRva2VuaXplZExpbmVzIGxlbmd0aCBpcyBsZXNzIHRoYW4gbGFzdCBidWZmZXIgcm93LlxuICAjIFNvIHRva2VuaXplZExpbmUgaXMgbm90IGFjY2Vzc2libGUgZXZlbiBpZiB2YWxpZCByb3cuXG4gICMgSW4gdGhhdCBjYXNlIEkgc2ltcGx5IHJldHVybiBlbXB0eSBBcnJheS5cbiAgaWYgdG9rZW5pemVkTGluZSA9IGdldFRva2VuaXplZExpbmVGb3JSb3coZWRpdG9yLCByb3cpXG4gICAgZ2V0U2NvcGVzRm9yVG9rZW5pemVkTGluZSh0b2tlbml6ZWRMaW5lKS5zb21lIChzY29wZSkgLT5cbiAgICAgIGlzRnVuY3Rpb25TY29wZShlZGl0b3IsIHNjb3BlKVxuICBlbHNlXG4gICAgZmFsc2VcblxuIyBbRklYTUVdIHZlcnkgcm91Z2ggc3RhdGUsIG5lZWQgaW1wcm92ZW1lbnQuXG5pc0Z1bmN0aW9uU2NvcGUgPSAoZWRpdG9yLCBzY29wZSkgLT5cbiAgc3dpdGNoIGVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lXG4gICAgd2hlbiAnc291cmNlLmdvJywgJ3NvdXJjZS5lbGl4aXInXG4gICAgICBzY29wZXMgPSBbJ2VudGl0eS5uYW1lLmZ1bmN0aW9uJ11cbiAgICB3aGVuICdzb3VyY2UucnVieSdcbiAgICAgIHNjb3BlcyA9IFsnbWV0YS5mdW5jdGlvbi4nLCAnbWV0YS5jbGFzcy4nLCAnbWV0YS5tb2R1bGUuJ11cbiAgICBlbHNlXG4gICAgICBzY29wZXMgPSBbJ21ldGEuZnVuY3Rpb24uJywgJ21ldGEuY2xhc3MuJ11cbiAgcGF0dGVybiA9IG5ldyBSZWdFeHAoJ14nICsgc2NvcGVzLm1hcChfLmVzY2FwZVJlZ0V4cCkuam9pbignfCcpKVxuICBwYXR0ZXJuLnRlc3Qoc2NvcGUpXG5cbiMgU2Nyb2xsIHRvIGJ1ZmZlclBvc2l0aW9uIHdpdGggbWluaW11bSBhbW91bnQgdG8ga2VlcCBvcmlnaW5hbCB2aXNpYmxlIGFyZWEuXG4jIElmIHRhcmdldCBwb3NpdGlvbiB3b24ndCBmaXQgd2l0aGluIG9uZVBhZ2VVcCBvciBvbmVQYWdlRG93biwgaXQgY2VudGVyIHRhcmdldCBwb2ludC5cbnNtYXJ0U2Nyb2xsVG9CdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50KSAtPlxuICBlZGl0b3JFbGVtZW50ID0gZWRpdG9yLmVsZW1lbnRcbiAgZWRpdG9yQXJlYUhlaWdodCA9IGVkaXRvci5nZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKSAqIChlZGl0b3IuZ2V0Um93c1BlclBhZ2UoKSAtIDEpXG4gIG9uZVBhZ2VVcCA9IGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKCkgLSBlZGl0b3JBcmVhSGVpZ2h0ICMgTm8gbmVlZCB0byBsaW1pdCB0byBtaW49MFxuICBvbmVQYWdlRG93biA9IGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsQm90dG9tKCkgKyBlZGl0b3JBcmVhSGVpZ2h0XG4gIHRhcmdldCA9IGVkaXRvckVsZW1lbnQucGl4ZWxQb3NpdGlvbkZvckJ1ZmZlclBvc2l0aW9uKHBvaW50KS50b3BcblxuICBjZW50ZXIgPSAob25lUGFnZURvd24gPCB0YXJnZXQpIG9yICh0YXJnZXQgPCBvbmVQYWdlVXApXG4gIGVkaXRvci5zY3JvbGxUb0J1ZmZlclBvc2l0aW9uKHBvaW50LCB7Y2VudGVyfSlcblxubWF0Y2hTY29wZXMgPSAoZWRpdG9yRWxlbWVudCwgc2NvcGVzKSAtPlxuICBjbGFzc2VzID0gc2NvcGVzLm1hcCAoc2NvcGUpIC0+IHNjb3BlLnNwbGl0KCcuJylcblxuICBmb3IgY2xhc3NOYW1lcyBpbiBjbGFzc2VzXG4gICAgY29udGFpbnNDb3VudCA9IDBcbiAgICBmb3IgY2xhc3NOYW1lIGluIGNsYXNzTmFtZXNcbiAgICAgIGNvbnRhaW5zQ291bnQgKz0gMSBpZiBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhjbGFzc05hbWUpXG4gICAgcmV0dXJuIHRydWUgaWYgY29udGFpbnNDb3VudCBpcyBjbGFzc05hbWVzLmxlbmd0aFxuICBmYWxzZVxuXG5pc1NpbmdsZUxpbmVUZXh0ID0gKHRleHQpIC0+XG4gIHRleHQuc3BsaXQoL1xcbnxcXHJcXG4vKS5sZW5ndGggaXMgMVxuXG4jIFJldHVybiBidWZmZXJSYW5nZSBhbmQga2luZCBbJ3doaXRlLXNwYWNlJywgJ25vbi13b3JkJywgJ3dvcmQnXVxuI1xuIyBUaGlzIGZ1bmN0aW9uIG1vZGlmeSB3b3JkUmVnZXggc28gdGhhdCBpdCBmZWVsIE5BVFVSQUwgaW4gVmltJ3Mgbm9ybWFsIG1vZGUuXG4jIEluIG5vcm1hbC1tb2RlLCBjdXJzb3IgaXMgcmFjdGFuZ2xlKG5vdCBwaXBlKHwpIGNoYXIpLlxuIyBDdXJzb3IgaXMgbGlrZSBPTiB3b3JkIHJhdGhlciB0aGFuIEJFVFdFRU4gd29yZC5cbiMgVGhlIG1vZGlmaWNhdGlvbiBpcyB0YWlsb3JkIGxpa2UgdGhpc1xuIyAgIC0gT04gd2hpdGUtc3BhY2U6IEluY2x1ZHMgb25seSB3aGl0ZS1zcGFjZXMuXG4jICAgLSBPTiBub24td29yZDogSW5jbHVkcyBvbmx5IG5vbiB3b3JkIGNoYXIoPWV4Y2x1ZGVzIG5vcm1hbCB3b3JkIGNoYXIpLlxuI1xuIyBWYWxpZCBvcHRpb25zXG4jICAtIHdvcmRSZWdleDogaW5zdGFuY2Ugb2YgUmVnRXhwXG4jICAtIG5vbldvcmRDaGFyYWN0ZXJzOiBzdHJpbmdcbmdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uID0gKGVkaXRvciwgcG9pbnQsIG9wdGlvbnM9e30pIC0+XG4gIHtzaW5nbGVOb25Xb3JkQ2hhciwgd29yZFJlZ2V4LCBub25Xb3JkQ2hhcmFjdGVycywgY3Vyc29yfSA9IG9wdGlvbnNcbiAgaWYgbm90IHdvcmRSZWdleD8gb3Igbm90IG5vbldvcmRDaGFyYWN0ZXJzPyAjIENvbXBsZW1lbnQgZnJvbSBjdXJzb3JcbiAgICBjdXJzb3IgPz0gZWRpdG9yLmdldExhc3RDdXJzb3IoKVxuICAgIHt3b3JkUmVnZXgsIG5vbldvcmRDaGFyYWN0ZXJzfSA9IF8uZXh0ZW5kKG9wdGlvbnMsIGJ1aWxkV29yZFBhdHRlcm5CeUN1cnNvcihjdXJzb3IsIG9wdGlvbnMpKVxuICBzaW5nbGVOb25Xb3JkQ2hhciA/PSB0cnVlXG5cbiAgY2hhcmFjdGVyQXRQb2ludCA9IGdldFJpZ2h0Q2hhcmFjdGVyRm9yQnVmZmVyUG9zaXRpb24oZWRpdG9yLCBwb2ludClcbiAgbm9uV29yZFJlZ2V4ID0gbmV3IFJlZ0V4cChcIlsje18uZXNjYXBlUmVnRXhwKG5vbldvcmRDaGFyYWN0ZXJzKX1dK1wiKVxuXG4gIGlmIC9cXHMvLnRlc3QoY2hhcmFjdGVyQXRQb2ludClcbiAgICBzb3VyY2UgPSBcIltcXHQgXStcIlxuICAgIGtpbmQgPSAnd2hpdGUtc3BhY2UnXG4gICAgd29yZFJlZ2V4ID0gbmV3IFJlZ0V4cChzb3VyY2UpXG4gIGVsc2UgaWYgbm9uV29yZFJlZ2V4LnRlc3QoY2hhcmFjdGVyQXRQb2ludCkgYW5kIG5vdCB3b3JkUmVnZXgudGVzdChjaGFyYWN0ZXJBdFBvaW50KVxuICAgIGtpbmQgPSAnbm9uLXdvcmQnXG4gICAgaWYgc2luZ2xlTm9uV29yZENoYXJcbiAgICAgIHNvdXJjZSA9IF8uZXNjYXBlUmVnRXhwKGNoYXJhY3RlckF0UG9pbnQpXG4gICAgICB3b3JkUmVnZXggPSBuZXcgUmVnRXhwKHNvdXJjZSlcbiAgICBlbHNlXG4gICAgICB3b3JkUmVnZXggPSBub25Xb3JkUmVnZXhcbiAgZWxzZVxuICAgIGtpbmQgPSAnd29yZCdcblxuICByYW5nZSA9IGdldFdvcmRCdWZmZXJSYW5nZUF0QnVmZmVyUG9zaXRpb24oZWRpdG9yLCBwb2ludCwge3dvcmRSZWdleH0pXG4gIHtraW5kLCByYW5nZX1cblxuZ2V0V29yZFBhdHRlcm5BdEJ1ZmZlclBvc2l0aW9uID0gKGVkaXRvciwgcG9pbnQsIG9wdGlvbnM9e30pIC0+XG4gIGJvdW5kYXJpemVGb3JXb3JkID0gb3B0aW9ucy5ib3VuZGFyaXplRm9yV29yZCA/IHRydWVcbiAgZGVsZXRlIG9wdGlvbnMuYm91bmRhcml6ZUZvcldvcmRcbiAge3JhbmdlLCBraW5kfSA9IGdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgcG9pbnQsIG9wdGlvbnMpXG4gIHRleHQgPSBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UpXG4gIHBhdHRlcm4gPSBfLmVzY2FwZVJlZ0V4cCh0ZXh0KVxuXG4gIGlmIGtpbmQgaXMgJ3dvcmQnIGFuZCBib3VuZGFyaXplRm9yV29yZFxuICAgICMgU2V0IHdvcmQtYm91bmRhcnkoIFxcYiApIGFuY2hvciBvbmx5IHdoZW4gaXQncyBlZmZlY3RpdmUgIzY4OVxuICAgIHN0YXJ0Qm91bmRhcnkgPSBpZiAvXlxcdy8udGVzdCh0ZXh0KSB0aGVuIFwiXFxcXGJcIiBlbHNlICcnXG4gICAgZW5kQm91bmRhcnkgPSBpZiAvXFx3JC8udGVzdCh0ZXh0KSB0aGVuIFwiXFxcXGJcIiBlbHNlICcnXG4gICAgcGF0dGVybiA9IHN0YXJ0Qm91bmRhcnkgKyBwYXR0ZXJuICsgZW5kQm91bmRhcnlcbiAgbmV3IFJlZ0V4cChwYXR0ZXJuLCAnZycpXG5cbmdldFN1YndvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50LCBvcHRpb25zPXt9KSAtPlxuICBvcHRpb25zID0ge3dvcmRSZWdleDogZWRpdG9yLmdldExhc3RDdXJzb3IoKS5zdWJ3b3JkUmVnRXhwKCksIGJvdW5kYXJpemVGb3JXb3JkOiBmYWxzZX1cbiAgZ2V0V29yZFBhdHRlcm5BdEJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgcG9pbnQsIG9wdGlvbnMpXG5cbiMgUmV0dXJuIG9wdGlvbnMgdXNlZCBmb3IgZ2V0V29yZEJ1ZmZlclJhbmdlQXRCdWZmZXJQb3NpdGlvblxuYnVpbGRXb3JkUGF0dGVybkJ5Q3Vyc29yID0gKGN1cnNvciwge3dvcmRSZWdleH0pIC0+XG4gIG5vbldvcmRDaGFyYWN0ZXJzID0gZ2V0Tm9uV29yZENoYXJhY3RlcnNGb3JDdXJzb3IoY3Vyc29yKVxuICB3b3JkUmVnZXggPz0gbmV3IFJlZ0V4cChcIl5bXFx0IF0qJHxbXlxcXFxzI3tfLmVzY2FwZVJlZ0V4cChub25Xb3JkQ2hhcmFjdGVycyl9XStcIilcbiAge3dvcmRSZWdleCwgbm9uV29yZENoYXJhY3RlcnN9XG5cbmdldEJlZ2lubmluZ09mV29yZEJ1ZmZlclBvc2l0aW9uID0gKGVkaXRvciwgcG9pbnQsIHt3b3JkUmVnZXh9PXt9KSAtPlxuICBzY2FuUmFuZ2UgPSBbW3BvaW50LnJvdywgMF0sIHBvaW50XVxuXG4gIGZvdW5kID0gbnVsbFxuICBlZGl0b3IuYmFja3dhcmRzU2NhbkluQnVmZmVyUmFuZ2Ugd29yZFJlZ2V4LCBzY2FuUmFuZ2UsICh7cmFuZ2UsIG1hdGNoVGV4dCwgc3RvcH0pIC0+XG4gICAgcmV0dXJuIGlmIG1hdGNoVGV4dCBpcyAnJyBhbmQgcmFuZ2Uuc3RhcnQuY29sdW1uIGlzbnQgMFxuXG4gICAgaWYgcmFuZ2Uuc3RhcnQuaXNMZXNzVGhhbihwb2ludClcbiAgICAgIGlmIHJhbmdlLmVuZC5pc0dyZWF0ZXJUaGFuT3JFcXVhbChwb2ludClcbiAgICAgICAgZm91bmQgPSByYW5nZS5zdGFydFxuICAgICAgc3RvcCgpXG5cbiAgZm91bmQgPyBwb2ludFxuXG5nZXRFbmRPZldvcmRCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50LCB7d29yZFJlZ2V4fT17fSkgLT5cbiAgc2NhblJhbmdlID0gW3BvaW50LCBbcG9pbnQucm93LCBJbmZpbml0eV1dXG5cbiAgZm91bmQgPSBudWxsXG4gIGVkaXRvci5zY2FuSW5CdWZmZXJSYW5nZSB3b3JkUmVnZXgsIHNjYW5SYW5nZSwgKHtyYW5nZSwgbWF0Y2hUZXh0LCBzdG9wfSkgLT5cbiAgICByZXR1cm4gaWYgbWF0Y2hUZXh0IGlzICcnIGFuZCByYW5nZS5zdGFydC5jb2x1bW4gaXNudCAwXG5cbiAgICBpZiByYW5nZS5lbmQuaXNHcmVhdGVyVGhhbihwb2ludClcbiAgICAgIGlmIHJhbmdlLnN0YXJ0LmlzTGVzc1RoYW5PckVxdWFsKHBvaW50KVxuICAgICAgICBmb3VuZCA9IHJhbmdlLmVuZFxuICAgICAgc3RvcCgpXG5cbiAgZm91bmQgPyBwb2ludFxuXG5nZXRXb3JkQnVmZmVyUmFuZ2VBdEJ1ZmZlclBvc2l0aW9uID0gKGVkaXRvciwgcG9zaXRpb24sIG9wdGlvbnM9e30pIC0+XG4gIGVuZFBvc2l0aW9uID0gZ2V0RW5kT2ZXb3JkQnVmZmVyUG9zaXRpb24oZWRpdG9yLCBwb3NpdGlvbiwgb3B0aW9ucylcbiAgc3RhcnRQb3NpdGlvbiA9IGdldEJlZ2lubmluZ09mV29yZEJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgZW5kUG9zaXRpb24sIG9wdGlvbnMpXG4gIG5ldyBSYW5nZShzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbilcblxuIyBXaGVuIHJhbmdlIGlzIGxpbmV3aXNlIHJhbmdlLCByYW5nZSBlbmQgaGF2ZSBjb2x1bW4gMCBvZiBORVhUIHJvdy5cbiMgV2hpY2ggaXMgdmVyeSB1bmludHVpdGl2ZSBhbmQgdW53YW50ZWQgcmVzdWx0Llxuc2hyaW5rUmFuZ2VFbmRUb0JlZm9yZU5ld0xpbmUgPSAocmFuZ2UpIC0+XG4gIHtzdGFydCwgZW5kfSA9IHJhbmdlXG4gIGlmIGVuZC5jb2x1bW4gaXMgMFxuICAgIGVuZFJvdyA9IGxpbWl0TnVtYmVyKGVuZC5yb3cgLSAxLCBtaW46IHN0YXJ0LnJvdylcbiAgICBuZXcgUmFuZ2Uoc3RhcnQsIFtlbmRSb3csIEluZmluaXR5XSlcbiAgZWxzZVxuICAgIHJhbmdlXG5cbnNjYW5FZGl0b3IgPSAoZWRpdG9yLCBwYXR0ZXJuKSAtPlxuICByYW5nZXMgPSBbXVxuICBlZGl0b3Iuc2NhbiBwYXR0ZXJuLCAoe3JhbmdlfSkgLT5cbiAgICByYW5nZXMucHVzaChyYW5nZSlcbiAgcmFuZ2VzXG5cbmNvbGxlY3RSYW5nZUluQnVmZmVyUm93ID0gKGVkaXRvciwgcm93LCBwYXR0ZXJuKSAtPlxuICByYW5nZXMgPSBbXVxuICBzY2FuUmFuZ2UgPSBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocm93KVxuICBlZGl0b3Iuc2NhbkluQnVmZmVyUmFuZ2UgcGF0dGVybiwgc2NhblJhbmdlLCAoe3JhbmdlfSkgLT5cbiAgICByYW5nZXMucHVzaChyYW5nZSlcbiAgcmFuZ2VzXG5cbmZpbmRSYW5nZUluQnVmZmVyUm93ID0gKGVkaXRvciwgcGF0dGVybiwgcm93LCB7ZGlyZWN0aW9ufT17fSkgLT5cbiAgaWYgZGlyZWN0aW9uIGlzICdiYWNrd2FyZCdcbiAgICBzY2FuRnVuY3Rpb25OYW1lID0gJ2JhY2t3YXJkc1NjYW5JbkJ1ZmZlclJhbmdlJ1xuICBlbHNlXG4gICAgc2NhbkZ1bmN0aW9uTmFtZSA9ICdzY2FuSW5CdWZmZXJSYW5nZSdcblxuICByYW5nZSA9IG51bGxcbiAgc2NhblJhbmdlID0gZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHJvdylcbiAgZWRpdG9yW3NjYW5GdW5jdGlvbk5hbWVdIHBhdHRlcm4sIHNjYW5SYW5nZSwgKGV2ZW50KSAtPiByYW5nZSA9IGV2ZW50LnJhbmdlXG4gIHJhbmdlXG5cbmdldExhcmdlc3RGb2xkUmFuZ2VDb250YWluc0J1ZmZlclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgbWFya2VycyA9IGVkaXRvci5kaXNwbGF5TGF5ZXIuZm9sZHNNYXJrZXJMYXllci5maW5kTWFya2VycyhpbnRlcnNlY3RzUm93OiByb3cpXG5cbiAgc3RhcnRQb2ludCA9IG51bGxcbiAgZW5kUG9pbnQgPSBudWxsXG5cbiAgZm9yIG1hcmtlciBpbiBtYXJrZXJzID8gW11cbiAgICB7c3RhcnQsIGVuZH0gPSBtYXJrZXIuZ2V0UmFuZ2UoKVxuICAgIHVubGVzcyBzdGFydFBvaW50XG4gICAgICBzdGFydFBvaW50ID0gc3RhcnRcbiAgICAgIGVuZFBvaW50ID0gZW5kXG4gICAgICBjb250aW51ZVxuXG4gICAgaWYgc3RhcnQuaXNMZXNzVGhhbihzdGFydFBvaW50KVxuICAgICAgc3RhcnRQb2ludCA9IHN0YXJ0XG4gICAgICBlbmRQb2ludCA9IGVuZFxuXG4gIGlmIHN0YXJ0UG9pbnQ/IGFuZCBlbmRQb2ludD9cbiAgICBuZXcgUmFuZ2Uoc3RhcnRQb2ludCwgZW5kUG9pbnQpXG5cbiMgdGFrZSBidWZmZXJQb3NpdGlvblxudHJhbnNsYXRlUG9pbnRBbmRDbGlwID0gKGVkaXRvciwgcG9pbnQsIGRpcmVjdGlvbikgLT5cbiAgcG9pbnQgPSBQb2ludC5mcm9tT2JqZWN0KHBvaW50KVxuXG4gIGRvbnRDbGlwID0gZmFsc2VcbiAgc3dpdGNoIGRpcmVjdGlvblxuICAgIHdoZW4gJ2ZvcndhcmQnXG4gICAgICBwb2ludCA9IHBvaW50LnRyYW5zbGF0ZShbMCwgKzFdKVxuICAgICAgZW9sID0gZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHBvaW50LnJvdykuZW5kXG5cbiAgICAgIGlmIHBvaW50LmlzRXF1YWwoZW9sKVxuICAgICAgICBkb250Q2xpcCA9IHRydWVcbiAgICAgIGVsc2UgaWYgcG9pbnQuaXNHcmVhdGVyVGhhbihlb2wpXG4gICAgICAgIGRvbnRDbGlwID0gdHJ1ZVxuICAgICAgICBwb2ludCA9IG5ldyBQb2ludChwb2ludC5yb3cgKyAxLCAwKSAjIG1vdmUgcG9pbnQgdG8gbmV3LWxpbmUgc2VsZWN0ZWQgcG9pbnRcblxuICAgICAgcG9pbnQgPSBQb2ludC5taW4ocG9pbnQsIGVkaXRvci5nZXRFb2ZCdWZmZXJQb3NpdGlvbigpKVxuXG4gICAgd2hlbiAnYmFja3dhcmQnXG4gICAgICBwb2ludCA9IHBvaW50LnRyYW5zbGF0ZShbMCwgLTFdKVxuXG4gICAgICBpZiBwb2ludC5jb2x1bW4gPCAwXG4gICAgICAgIGRvbnRDbGlwID0gdHJ1ZVxuICAgICAgICBuZXdSb3cgPSBwb2ludC5yb3cgLSAxXG4gICAgICAgIGVvbCA9IGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhuZXdSb3cpLmVuZFxuICAgICAgICBwb2ludCA9IG5ldyBQb2ludChuZXdSb3csIGVvbC5jb2x1bW4pXG5cbiAgICAgIHBvaW50ID0gUG9pbnQubWF4KHBvaW50LCBQb2ludC5aRVJPKVxuXG4gIGlmIGRvbnRDbGlwXG4gICAgcG9pbnRcbiAgZWxzZVxuICAgIHNjcmVlblBvaW50ID0gZWRpdG9yLnNjcmVlblBvc2l0aW9uRm9yQnVmZmVyUG9zaXRpb24ocG9pbnQsIGNsaXBEaXJlY3Rpb246IGRpcmVjdGlvbilcbiAgICBlZGl0b3IuYnVmZmVyUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihzY3JlZW5Qb2ludClcblxuZ2V0UmFuZ2VCeVRyYW5zbGF0ZVBvaW50QW5kQ2xpcCA9IChlZGl0b3IsIHJhbmdlLCB3aGljaCwgZGlyZWN0aW9uKSAtPlxuICBuZXdQb2ludCA9IHRyYW5zbGF0ZVBvaW50QW5kQ2xpcChlZGl0b3IsIHJhbmdlW3doaWNoXSwgZGlyZWN0aW9uKVxuICBzd2l0Y2ggd2hpY2hcbiAgICB3aGVuICdzdGFydCdcbiAgICAgIG5ldyBSYW5nZShuZXdQb2ludCwgcmFuZ2UuZW5kKVxuICAgIHdoZW4gJ2VuZCdcbiAgICAgIG5ldyBSYW5nZShyYW5nZS5zdGFydCwgbmV3UG9pbnQpXG5cbmdldFBhY2thZ2UgPSAobmFtZSwgZm4pIC0+XG4gIG5ldyBQcm9taXNlIChyZXNvbHZlKSAtPlxuICAgIGlmIGF0b20ucGFja2FnZXMuaXNQYWNrYWdlQWN0aXZlKG5hbWUpXG4gICAgICBwa2cgPSBhdG9tLnBhY2thZ2VzLmdldEFjdGl2ZVBhY2thZ2UobmFtZSlcbiAgICAgIHJlc29sdmUocGtnKVxuICAgIGVsc2VcbiAgICAgIGRpc3Bvc2FibGUgPSBhdG9tLnBhY2thZ2VzLm9uRGlkQWN0aXZhdGVQYWNrYWdlIChwa2cpIC0+XG4gICAgICAgIGlmIHBrZy5uYW1lIGlzIG5hbWVcbiAgICAgICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxuICAgICAgICAgIHJlc29sdmUocGtnKVxuXG5zZWFyY2hCeVByb2plY3RGaW5kID0gKGVkaXRvciwgdGV4dCkgLT5cbiAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3IuZWxlbWVudCwgJ3Byb2plY3QtZmluZDpzaG93JylcbiAgZ2V0UGFja2FnZSgnZmluZC1hbmQtcmVwbGFjZScpLnRoZW4gKHBrZykgLT5cbiAgICB7cHJvamVjdEZpbmRWaWV3fSA9IHBrZy5tYWluTW9kdWxlXG4gICAgaWYgcHJvamVjdEZpbmRWaWV3P1xuICAgICAgcHJvamVjdEZpbmRWaWV3LmZpbmRFZGl0b3Iuc2V0VGV4dCh0ZXh0KVxuICAgICAgcHJvamVjdEZpbmRWaWV3LmNvbmZpcm0oKVxuXG5saW1pdE51bWJlciA9IChudW1iZXIsIHttYXgsIG1pbn09e30pIC0+XG4gIG51bWJlciA9IE1hdGgubWluKG51bWJlciwgbWF4KSBpZiBtYXg/XG4gIG51bWJlciA9IE1hdGgubWF4KG51bWJlciwgbWluKSBpZiBtaW4/XG4gIG51bWJlclxuXG5maW5kUmFuZ2VDb250YWluc1BvaW50ID0gKHJhbmdlcywgcG9pbnQpIC0+XG4gIGZvciByYW5nZSBpbiByYW5nZXMgd2hlbiByYW5nZS5jb250YWluc1BvaW50KHBvaW50KVxuICAgIHJldHVybiByYW5nZVxuICBudWxsXG5cbm5lZ2F0ZUZ1bmN0aW9uID0gKGZuKSAtPlxuICAoYXJncy4uLikgLT5cbiAgICBub3QgZm4oYXJncy4uLilcblxuaXNFbXB0eSA9ICh0YXJnZXQpIC0+IHRhcmdldC5pc0VtcHR5KClcbmlzTm90RW1wdHkgPSBuZWdhdGVGdW5jdGlvbihpc0VtcHR5KVxuXG5pc1NpbmdsZUxpbmVSYW5nZSA9IChyYW5nZSkgLT4gcmFuZ2UuaXNTaW5nbGVMaW5lKClcbmlzTm90U2luZ2xlTGluZVJhbmdlID0gbmVnYXRlRnVuY3Rpb24oaXNTaW5nbGVMaW5lUmFuZ2UpXG5cbmlzTGVhZGluZ1doaXRlU3BhY2VSYW5nZSA9IChlZGl0b3IsIHJhbmdlKSAtPiAvXltcXHQgXSokLy50ZXN0KGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSkpXG5pc05vdExlYWRpbmdXaGl0ZVNwYWNlUmFuZ2UgPSBuZWdhdGVGdW5jdGlvbihpc0xlYWRpbmdXaGl0ZVNwYWNlUmFuZ2UpXG5cbmlzRXNjYXBlZENoYXJSYW5nZSA9IChlZGl0b3IsIHJhbmdlKSAtPlxuICByYW5nZSA9IFJhbmdlLmZyb21PYmplY3QocmFuZ2UpXG4gIGNoYXJzID0gZ2V0TGVmdENoYXJhY3RlckZvckJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgcmFuZ2Uuc3RhcnQsIDIpXG4gIGNoYXJzLmVuZHNXaXRoKCdcXFxcJykgYW5kIG5vdCBjaGFycy5lbmRzV2l0aCgnXFxcXFxcXFwnKVxuXG5pbnNlcnRUZXh0QXRCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50LCB0ZXh0KSAtPlxuICBlZGl0b3Iuc2V0VGV4dEluQnVmZmVyUmFuZ2UoW3BvaW50LCBwb2ludF0sIHRleHQpXG5cbmVuc3VyZUVuZHNXaXRoTmV3TGluZUZvckJ1ZmZlclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgdW5sZXNzIGlzRW5kc1dpdGhOZXdMaW5lRm9yQnVmZmVyUm93KGVkaXRvciwgcm93KVxuICAgIGVvbCA9IGdldEVuZE9mTGluZUZvckJ1ZmZlclJvdyhlZGl0b3IsIHJvdylcbiAgICBpbnNlcnRUZXh0QXRCdWZmZXJQb3NpdGlvbihlZGl0b3IsIGVvbCwgXCJcXG5cIilcblxuZm9yRWFjaFBhbmVBeGlzID0gKGZuLCBiYXNlKSAtPlxuICBiYXNlID89IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKS5nZXRDb250YWluZXIoKS5nZXRSb290KClcbiAgaWYgYmFzZS5jaGlsZHJlbj9cbiAgICBmbihiYXNlKVxuXG4gICAgZm9yIGNoaWxkIGluIGJhc2UuY2hpbGRyZW5cbiAgICAgIGZvckVhY2hQYW5lQXhpcyhmbiwgY2hpbGQpXG5cbm1vZGlmeUNsYXNzTGlzdCA9IChhY3Rpb24sIGVsZW1lbnQsIGNsYXNzTmFtZXMuLi4pIC0+XG4gIGVsZW1lbnQuY2xhc3NMaXN0W2FjdGlvbl0oY2xhc3NOYW1lcy4uLilcblxuYWRkQ2xhc3NMaXN0ID0gbW9kaWZ5Q2xhc3NMaXN0LmJpbmQobnVsbCwgJ2FkZCcpXG5yZW1vdmVDbGFzc0xpc3QgPSBtb2RpZnlDbGFzc0xpc3QuYmluZChudWxsLCAncmVtb3ZlJylcbnRvZ2dsZUNsYXNzTGlzdCA9IG1vZGlmeUNsYXNzTGlzdC5iaW5kKG51bGwsICd0b2dnbGUnKVxuXG50b2dnbGVDYXNlRm9yQ2hhcmFjdGVyID0gKGNoYXIpIC0+XG4gIGNoYXJMb3dlciA9IGNoYXIudG9Mb3dlckNhc2UoKVxuICBpZiBjaGFyTG93ZXIgaXMgY2hhclxuICAgIGNoYXIudG9VcHBlckNhc2UoKVxuICBlbHNlXG4gICAgY2hhckxvd2VyXG5cbnNwbGl0VGV4dEJ5TmV3TGluZSA9ICh0ZXh0KSAtPlxuICBpZiB0ZXh0LmVuZHNXaXRoKFwiXFxuXCIpXG4gICAgdGV4dC50cmltUmlnaHQoKS5zcGxpdCgvXFxyP1xcbi9nKVxuICBlbHNlXG4gICAgdGV4dC5zcGxpdCgvXFxyP1xcbi9nKVxuXG4jIE1vZGlmeSByYW5nZSB1c2VkIGZvciB1bmRvL3JlZG8gZmxhc2ggaGlnaGxpZ2h0IHRvIG1ha2UgaXQgZmVlbCBuYXR1cmFsbHkgZm9yIGh1bWFuLlxuIyAgLSBUcmltIHN0YXJ0aW5nIG5ldyBsaW5lKFwiXFxuXCIpXG4jICAgICBcIlxcbmFiY1wiIC0+IFwiYWJjXCJcbiMgIC0gSWYgcmFuZ2UuZW5kIGlzIEVPTCBleHRlbmQgcmFuZ2UgdG8gZmlyc3QgY29sdW1uIG9mIG5leHQgbGluZS5cbiMgICAgIFwiYWJjXCIgLT4gXCJhYmNcXG5cIlxuIyBlLmcuXG4jIC0gd2hlbiAnYycgaXMgYXRFT0w6IFwiXFxuYWJjXCIgLT4gXCJhYmNcXG5cIlxuIyAtIHdoZW4gJ2MnIGlzIE5PVCBhdEVPTDogXCJcXG5hYmNcIiAtPiBcImFiY1wiXG4jXG4jIFNvIGFsd2F5cyB0cmltIGluaXRpYWwgXCJcXG5cIiBwYXJ0IHJhbmdlIGJlY2F1c2UgZmxhc2hpbmcgdHJhaWxpbmcgbGluZSBpcyBjb3VudGVyaW50dWl0aXZlLlxuaHVtYW5pemVCdWZmZXJSYW5nZSA9IChlZGl0b3IsIHJhbmdlKSAtPlxuICBpZiBpc1NpbmdsZUxpbmVSYW5nZShyYW5nZSkgb3IgaXNMaW5ld2lzZVJhbmdlKHJhbmdlKVxuICAgIHJldHVybiByYW5nZVxuXG4gIHtzdGFydCwgZW5kfSA9IHJhbmdlXG4gIGlmIHBvaW50SXNBdEVuZE9mTGluZShlZGl0b3IsIHN0YXJ0KVxuICAgIG5ld1N0YXJ0ID0gc3RhcnQudHJhdmVyc2UoWzEsIDBdKVxuXG4gIGlmIHBvaW50SXNBdEVuZE9mTGluZShlZGl0b3IsIGVuZClcbiAgICBuZXdFbmQgPSBlbmQudHJhdmVyc2UoWzEsIDBdKVxuXG4gIGlmIG5ld1N0YXJ0PyBvciBuZXdFbmQ/XG4gICAgbmV3IFJhbmdlKG5ld1N0YXJ0ID8gc3RhcnQsIG5ld0VuZCA/IGVuZClcbiAgZWxzZVxuICAgIHJhbmdlXG5cbiMgRXhwYW5kIHJhbmdlIHRvIHdoaXRlIHNwYWNlXG4jICAxLiBFeHBhbmQgdG8gZm9yd2FyZCBkaXJlY3Rpb24sIGlmIHN1Y2VlZCByZXR1cm4gbmV3IHJhbmdlLlxuIyAgMi4gRXhwYW5kIHRvIGJhY2t3YXJkIGRpcmVjdGlvbiwgaWYgc3VjY2VlZCByZXR1cm4gbmV3IHJhbmdlLlxuIyAgMy4gV2hlbiBmYWlsZCB0byBleHBhbmQgZWl0aGVyIGRpcmVjdGlvbiwgcmV0dXJuIG9yaWdpbmFsIHJhbmdlLlxuZXhwYW5kUmFuZ2VUb1doaXRlU3BhY2VzID0gKGVkaXRvciwgcmFuZ2UpIC0+XG4gIHtzdGFydCwgZW5kfSA9IHJhbmdlXG5cbiAgbmV3RW5kID0gbnVsbFxuICBzY2FuUmFuZ2UgPSBbZW5kLCBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3coZWRpdG9yLCBlbmQucm93KV1cbiAgZWRpdG9yLnNjYW5JbkJ1ZmZlclJhbmdlIC9cXFMvLCBzY2FuUmFuZ2UsICh7cmFuZ2V9KSAtPiBuZXdFbmQgPSByYW5nZS5zdGFydFxuXG4gIGlmIG5ld0VuZD8uaXNHcmVhdGVyVGhhbihlbmQpXG4gICAgcmV0dXJuIG5ldyBSYW5nZShzdGFydCwgbmV3RW5kKVxuXG4gIG5ld1N0YXJ0ID0gbnVsbFxuICBzY2FuUmFuZ2UgPSBbW3N0YXJ0LnJvdywgMF0sIHJhbmdlLnN0YXJ0XVxuICBlZGl0b3IuYmFja3dhcmRzU2NhbkluQnVmZmVyUmFuZ2UgL1xcUy8sIHNjYW5SYW5nZSwgKHtyYW5nZX0pIC0+IG5ld1N0YXJ0ID0gcmFuZ2UuZW5kXG5cbiAgaWYgbmV3U3RhcnQ/LmlzTGVzc1RoYW4oc3RhcnQpXG4gICAgcmV0dXJuIG5ldyBSYW5nZShuZXdTdGFydCwgZW5kKVxuXG4gIHJldHVybiByYW5nZSAjIGZhbGxiYWNrXG5cbnNjYW5FZGl0b3JJbkRpcmVjdGlvbiA9IChlZGl0b3IsIGRpcmVjdGlvbiwgcGF0dGVybiwgb3B0aW9ucz17fSwgZm4pIC0+XG4gIHthbGxvd05leHRMaW5lLCBmcm9tLCBzY2FuUmFuZ2V9ID0gb3B0aW9uc1xuICBpZiBub3QgZnJvbT8gYW5kIG5vdCBzY2FuUmFuZ2U/XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3QgZWl0aGVyIG9mICdmcm9tJyBvciAnc2NhblJhbmdlJyBvcHRpb25zXCIpXG5cbiAgaWYgc2NhblJhbmdlXG4gICAgYWxsb3dOZXh0TGluZSA9IHRydWVcbiAgZWxzZVxuICAgIGFsbG93TmV4dExpbmUgPz0gdHJ1ZVxuICBmcm9tID0gUG9pbnQuZnJvbU9iamVjdChmcm9tKSBpZiBmcm9tP1xuICBzd2l0Y2ggZGlyZWN0aW9uXG4gICAgd2hlbiAnZm9yd2FyZCdcbiAgICAgIHNjYW5SYW5nZSA/PSBuZXcgUmFuZ2UoZnJvbSwgZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oZWRpdG9yKSlcbiAgICAgIHNjYW5GdW5jdGlvbiA9ICdzY2FuSW5CdWZmZXJSYW5nZSdcbiAgICB3aGVuICdiYWNrd2FyZCdcbiAgICAgIHNjYW5SYW5nZSA/PSBuZXcgUmFuZ2UoWzAsIDBdLCBmcm9tKVxuICAgICAgc2NhbkZ1bmN0aW9uID0gJ2JhY2t3YXJkc1NjYW5JbkJ1ZmZlclJhbmdlJ1xuXG4gIGVkaXRvcltzY2FuRnVuY3Rpb25dIHBhdHRlcm4sIHNjYW5SYW5nZSwgKGV2ZW50KSAtPlxuICAgIGlmIG5vdCBhbGxvd05leHRMaW5lIGFuZCBldmVudC5yYW5nZS5zdGFydC5yb3cgaXNudCBmcm9tLnJvd1xuICAgICAgZXZlbnQuc3RvcCgpXG4gICAgICByZXR1cm5cbiAgICBmbihldmVudClcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFzc2VydFdpdGhFeGNlcHRpb25cbiAgZ2V0QW5jZXN0b3JzXG4gIGdldEtleUJpbmRpbmdGb3JDb21tYW5kXG4gIGluY2x1ZGVcbiAgZGVidWdcbiAgc2F2ZUVkaXRvclN0YXRlXG4gIGlzTGluZXdpc2VSYW5nZVxuICBoYXZlU29tZU5vbkVtcHR5U2VsZWN0aW9uXG4gIHNvcnRSYW5nZXNcbiAgZ2V0SW5kZXhcbiAgZ2V0VmlzaWJsZUJ1ZmZlclJhbmdlXG4gIGdldFZpc2libGVFZGl0b3JzXG4gIHBvaW50SXNBdEVuZE9mTGluZVxuICBwb2ludElzT25XaGl0ZVNwYWNlXG4gIHBvaW50SXNBdEVuZE9mTGluZUF0Tm9uRW1wdHlSb3dcbiAgcG9pbnRJc0F0VmltRW5kT2ZGaWxlXG4gIGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uXG4gIGdldFZpbUVvZlNjcmVlblBvc2l0aW9uXG4gIGdldFZpbUxhc3RCdWZmZXJSb3dcbiAgZ2V0VmltTGFzdFNjcmVlblJvd1xuICBzZXRCdWZmZXJSb3dcbiAgc2V0QnVmZmVyQ29sdW1uXG4gIG1vdmVDdXJzb3JMZWZ0XG4gIG1vdmVDdXJzb3JSaWdodFxuICBtb3ZlQ3Vyc29yVXBTY3JlZW5cbiAgbW92ZUN1cnNvckRvd25TY3JlZW5cbiAgZ2V0RW5kT2ZMaW5lRm9yQnVmZmVyUm93XG4gIGdldEZpcnN0VmlzaWJsZVNjcmVlblJvd1xuICBnZXRMYXN0VmlzaWJsZVNjcmVlblJvd1xuICBnZXRWYWxpZFZpbUJ1ZmZlclJvd1xuICBnZXRWYWxpZFZpbVNjcmVlblJvd1xuICBtb3ZlQ3Vyc29yVG9GaXJzdENoYXJhY3RlckF0Um93XG4gIGdldExpbmVUZXh0VG9CdWZmZXJQb3NpdGlvblxuICBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvd1xuICBnZXRUZXh0SW5TY3JlZW5SYW5nZVxuICBtb3ZlQ3Vyc29yVG9OZXh0Tm9uV2hpdGVzcGFjZVxuICBpc0VtcHR5Um93XG4gIGdldENvZGVGb2xkUm93UmFuZ2VzXG4gIGdldENvZGVGb2xkUm93UmFuZ2VzQ29udGFpbmVzRm9yUm93XG4gIGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2VcbiAgdHJpbVJhbmdlXG4gIGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3dcbiAgaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvd1xuICBkZXRlY3RTY29wZVN0YXJ0UG9zaXRpb25Gb3JTY29wZVxuICBnZXRCdWZmZXJSb3dzXG4gIHNtYXJ0U2Nyb2xsVG9CdWZmZXJQb3NpdGlvblxuICBtYXRjaFNjb3Blc1xuICBtb3ZlQ3Vyc29yRG93bkJ1ZmZlclxuICBtb3ZlQ3Vyc29yVXBCdWZmZXJcbiAgaXNTaW5nbGVMaW5lVGV4dFxuICBnZXRXb3JkQnVmZmVyUmFuZ2VBdEJ1ZmZlclBvc2l0aW9uXG4gIGdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uXG4gIGdldFdvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvblxuICBnZXRTdWJ3b3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb25cbiAgZ2V0Tm9uV29yZENoYXJhY3RlcnNGb3JDdXJzb3JcbiAgc2hyaW5rUmFuZ2VFbmRUb0JlZm9yZU5ld0xpbmVcbiAgc2NhbkVkaXRvclxuICBjb2xsZWN0UmFuZ2VJbkJ1ZmZlclJvd1xuICBmaW5kUmFuZ2VJbkJ1ZmZlclJvd1xuICBnZXRMYXJnZXN0Rm9sZFJhbmdlQ29udGFpbnNCdWZmZXJSb3dcbiAgdHJhbnNsYXRlUG9pbnRBbmRDbGlwXG4gIGdldFJhbmdlQnlUcmFuc2xhdGVQb2ludEFuZENsaXBcbiAgZ2V0UGFja2FnZVxuICBzZWFyY2hCeVByb2plY3RGaW5kXG4gIGxpbWl0TnVtYmVyXG4gIGZpbmRSYW5nZUNvbnRhaW5zUG9pbnRcblxuICBpc0VtcHR5LCBpc05vdEVtcHR5XG4gIGlzU2luZ2xlTGluZVJhbmdlLCBpc05vdFNpbmdsZUxpbmVSYW5nZVxuXG4gIGluc2VydFRleHRBdEJ1ZmZlclBvc2l0aW9uXG4gIGVuc3VyZUVuZHNXaXRoTmV3TGluZUZvckJ1ZmZlclJvd1xuICBpc0xlYWRpbmdXaGl0ZVNwYWNlUmFuZ2VcbiAgaXNOb3RMZWFkaW5nV2hpdGVTcGFjZVJhbmdlXG4gIGlzRXNjYXBlZENoYXJSYW5nZVxuXG4gIGZvckVhY2hQYW5lQXhpc1xuICBhZGRDbGFzc0xpc3RcbiAgcmVtb3ZlQ2xhc3NMaXN0XG4gIHRvZ2dsZUNsYXNzTGlzdFxuICB0b2dnbGVDYXNlRm9yQ2hhcmFjdGVyXG4gIHNwbGl0VGV4dEJ5TmV3TGluZVxuICBodW1hbml6ZUJ1ZmZlclJhbmdlXG4gIGV4cGFuZFJhbmdlVG9XaGl0ZVNwYWNlc1xuICBzY2FuRWRpdG9ySW5EaXJlY3Rpb25cbn1cbiJdfQ==
