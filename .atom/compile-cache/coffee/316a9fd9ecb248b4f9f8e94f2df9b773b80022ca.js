(function() {
  var Disposable, Point, Range, _, addClassList, assertWithException, buildWordPatternByCursor, collectRangeInBufferRow, debug, detectScopeStartPositionForScope, ensureEndsWithNewLineForBufferRow, expandRangeToWhiteSpaces, findRangeContainsPoint, findRangeInBufferRow, forEachPaneAxis, fs, getAncestors, getBeginningOfWordBufferPosition, getBufferRangeForRowRange, getBufferRows, getCodeFoldRowRanges, getCodeFoldRowRangesContainesForRow, getEndOfLineForBufferRow, getEndOfWordBufferPosition, getFirstCharacterPositionForBufferRow, getFirstVisibleScreenRow, getIndentLevelForBufferRow, getIndex, getKeyBindingForCommand, getLargestFoldRangeContainsBufferRow, getLastVisibleScreenRow, getLeftCharacterForBufferPosition, getLineTextToBufferPosition, getNonWordCharactersForCursor, getPackage, getRangeByTranslatePointAndClip, getRightCharacterForBufferPosition, getScopesForTokenizedLine, getSubwordPatternAtBufferPosition, getTextInScreenRange, getTokenizedLineForRow, getValidVimBufferRow, getValidVimScreenRow, getVimEofBufferPosition, getVimEofScreenPosition, getVimLastBufferRow, getVimLastScreenRow, getVisibleBufferRange, getVisibleEditors, getWordBufferRangeAndKindAtBufferPosition, getWordBufferRangeAtBufferPosition, getWordPatternAtBufferPosition, haveSomeNonEmptySelection, humanizeBufferRange, include, insertTextAtBufferPosition, isEmpty, isEmptyRow, isEndsWithNewLineForBufferRow, isEscapedCharRange, isFunctionScope, isIncludeFunctionScopeForRow, isLeadingWhiteSpaceRange, isLinewiseRange, isNotEmpty, isNotLeadingWhiteSpaceRange, isNotSingleLineRange, isSingleLineRange, isSingleLineText, limitNumber, matchScopes, modifyClassList, moveCursor, moveCursorDownBuffer, moveCursorDownScreen, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUpBuffer, moveCursorUpScreen, negateFunction, pointIsAtEndOfLine, pointIsAtEndOfLineAtNonEmptyRow, pointIsAtVimEndOfFile, pointIsOnWhiteSpace, ref, removeClassList, replaceDecorationClassBy, saveEditorState, scanEditor, scanEditorInDirection, scanForScopeStart, searchByProjectFind, setBufferColumn, setBufferRow, settings, shouldPreventWrapLine, shrinkRangeEndToBeforeNewLine, smartScrollToBufferPosition, sortRanges, splitTextByNewLine, toggleCaseForCharacter, toggleClassList, translatePointAndClip, trimRange,
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
    replaceDecorationClassBy: replaceDecorationClassBy,
    humanizeBufferRange: humanizeBufferRange,
    expandRangeToWhiteSpaces: expandRangeToWhiteSpaces,
    scanEditorInDirection: scanEditorInDirection
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvdXRpbHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSw0d0VBQUE7SUFBQTs7RUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVI7O0VBQ0wsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSOztFQUVYLE1BQTZCLE9BQUEsQ0FBUSxNQUFSLENBQTdCLEVBQUMsMkJBQUQsRUFBYSxpQkFBYixFQUFvQjs7RUFDcEIsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFFSixtQkFBQSxHQUFzQixTQUFDLFNBQUQsRUFBWSxPQUFaLEVBQXFCLEVBQXJCO1dBQ3BCLElBQUksQ0FBQyxNQUFMLENBQVksU0FBWixFQUF1QixPQUF2QixFQUFnQyxTQUFDLEtBQUQ7QUFDOUIsWUFBVSxJQUFBLEtBQUEsQ0FBTSxLQUFLLENBQUMsT0FBWjtJQURvQixDQUFoQztFQURvQjs7RUFJdEIsWUFBQSxHQUFlLFNBQUMsR0FBRDtBQUNiLFFBQUE7SUFBQSxTQUFBLEdBQVk7SUFDWixPQUFBLEdBQVU7QUFDVixXQUFBLElBQUE7TUFDRSxTQUFTLENBQUMsSUFBVixDQUFlLE9BQWY7TUFDQSxPQUFBLDRDQUEyQixDQUFFO01BQzdCLElBQUEsQ0FBYSxPQUFiO0FBQUEsY0FBQTs7SUFIRjtXQUlBO0VBUGE7O0VBU2YsdUJBQUEsR0FBMEIsU0FBQyxPQUFELEVBQVUsR0FBVjtBQUN4QixRQUFBO0lBRG1DLGNBQUQ7SUFDbEMsT0FBQSxHQUFVO0lBQ1YsT0FBQSxHQUFVLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYixDQUFBO0lBQ1YsSUFBRyxtQkFBSDtNQUNFLFVBQUEsR0FBYSxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFkLENBQStCLFdBQS9CLENBQTJDLENBQUMsY0FBNUMsQ0FBQSxDQUE0RCxDQUFDLEdBQTdELENBQUE7TUFDYixPQUFBLEdBQVUsT0FBTyxDQUFDLE1BQVIsQ0FBZSxTQUFDLElBQUQ7QUFBYyxZQUFBO1FBQVosU0FBRDtlQUFhLE1BQUEsS0FBVTtNQUF4QixDQUFmLEVBRlo7O0FBSUEsU0FBQSx5Q0FBQTs7WUFBMkIsTUFBTSxDQUFDLE9BQVAsS0FBa0I7OztNQUMxQyw4QkFBRCxFQUFhO01BQ2IsVUFBQSxHQUFhLFVBQVUsQ0FBQyxPQUFYLENBQW1CLFFBQW5CLEVBQTZCLEVBQTdCO01BQ2IsbUJBQUMsVUFBQSxVQUFXLEVBQVosQ0FBZSxDQUFDLElBQWhCLENBQXFCO1FBQUMsWUFBQSxVQUFEO1FBQWEsVUFBQSxRQUFiO09BQXJCO0FBSEY7V0FJQTtFQVh3Qjs7RUFjMUIsT0FBQSxHQUFVLFNBQUMsS0FBRCxFQUFRLE1BQVI7QUFDUixRQUFBO0FBQUE7U0FBQSxhQUFBOztvQkFDRSxLQUFLLENBQUEsU0FBRyxDQUFBLEdBQUEsQ0FBUixHQUFlO0FBRGpCOztFQURROztFQUlWLEtBQUEsR0FBUSxTQUFBO0FBQ04sUUFBQTtJQURPO0lBQ1AsSUFBQSxDQUFjLFFBQVEsQ0FBQyxHQUFULENBQWEsT0FBYixDQUFkO0FBQUEsYUFBQTs7QUFDQSxZQUFPLFFBQVEsQ0FBQyxHQUFULENBQWEsYUFBYixDQUFQO0FBQUEsV0FDTyxTQURQO2VBRUksT0FBTyxDQUFDLEdBQVIsZ0JBQVksUUFBWjtBQUZKLFdBR08sTUFIUDtRQUlJLFFBQUEsR0FBVyxFQUFFLENBQUMsU0FBSCxDQUFhLFFBQVEsQ0FBQyxHQUFULENBQWEscUJBQWIsQ0FBYjtRQUNYLElBQUcsRUFBRSxDQUFDLFVBQUgsQ0FBYyxRQUFkLENBQUg7aUJBQ0UsRUFBRSxDQUFDLGNBQUgsQ0FBa0IsUUFBbEIsRUFBNEIsUUFBQSxHQUFXLElBQXZDLEVBREY7O0FBTEo7RUFGTTs7RUFXUixlQUFBLEdBQWtCLFNBQUMsTUFBRDtBQUNoQixRQUFBO0lBQUEsYUFBQSxHQUFnQixNQUFNLENBQUM7SUFDdkIsU0FBQSxHQUFZLGFBQWEsQ0FBQyxZQUFkLENBQUE7SUFFWixhQUFBLEdBQWdCLE1BQU0sQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsV0FBckMsQ0FBaUQsRUFBakQsQ0FBb0QsQ0FBQyxHQUFyRCxDQUF5RCxTQUFDLENBQUQ7YUFBTyxDQUFDLENBQUMsZ0JBQUYsQ0FBQSxDQUFvQixDQUFDO0lBQTVCLENBQXpEO1dBQ2hCLFNBQUE7QUFDRSxVQUFBO0FBQUE7QUFBQSxXQUFBLHNDQUFBOztZQUF3QyxDQUFJLE1BQU0sQ0FBQyxtQkFBUCxDQUEyQixHQUEzQjtVQUMxQyxNQUFNLENBQUMsYUFBUCxDQUFxQixHQUFyQjs7QUFERjthQUVBLGFBQWEsQ0FBQyxZQUFkLENBQTJCLFNBQTNCO0lBSEY7RUFMZ0I7O0VBVWxCLGVBQUEsR0FBa0IsU0FBQyxHQUFEO0FBQ2hCLFFBQUE7SUFEa0IsbUJBQU87V0FDekIsQ0FBQyxLQUFLLENBQUMsR0FBTixLQUFlLEdBQUcsQ0FBQyxHQUFwQixDQUFBLElBQTZCLENBQUMsQ0FBQSxLQUFLLENBQUMsTUFBTixhQUFnQixHQUFHLENBQUMsT0FBcEIsUUFBQSxLQUE4QixDQUE5QixDQUFEO0VBRGI7O0VBR2xCLDZCQUFBLEdBQWdDLFNBQUMsTUFBRCxFQUFTLEdBQVQ7QUFDOUIsUUFBQTtJQUFBLE9BQWUsTUFBTSxDQUFDLHVCQUFQLENBQStCLEdBQS9CLEVBQW9DO01BQUEsY0FBQSxFQUFnQixJQUFoQjtLQUFwQyxDQUFmLEVBQUMsa0JBQUQsRUFBUTtXQUNSLEtBQUssQ0FBQyxHQUFOLEtBQWUsR0FBRyxDQUFDO0VBRlc7O0VBSWhDLHlCQUFBLEdBQTRCLFNBQUMsTUFBRDtXQUMxQixNQUFNLENBQUMsYUFBUCxDQUFBLENBQXNCLENBQUMsSUFBdkIsQ0FBNEIsVUFBNUI7RUFEMEI7O0VBRzVCLFVBQUEsR0FBYSxTQUFDLFVBQUQ7V0FDWCxVQUFVLENBQUMsSUFBWCxDQUFnQixTQUFDLENBQUQsRUFBSSxDQUFKO2FBQVUsQ0FBQyxDQUFDLE9BQUYsQ0FBVSxDQUFWO0lBQVYsQ0FBaEI7RUFEVzs7RUFLYixRQUFBLEdBQVcsU0FBQyxLQUFELEVBQVEsSUFBUjtBQUNULFFBQUE7SUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDO0lBQ2QsSUFBRyxNQUFBLEtBQVUsQ0FBYjthQUNFLENBQUMsRUFESDtLQUFBLE1BQUE7TUFHRSxLQUFBLEdBQVEsS0FBQSxHQUFRO01BQ2hCLElBQUcsS0FBQSxJQUFTLENBQVo7ZUFDRSxNQURGO09BQUEsTUFBQTtlQUdFLE1BQUEsR0FBUyxNQUhYO09BSkY7O0VBRlM7O0VBYVgscUJBQUEsR0FBd0IsU0FBQyxNQUFEO0FBQ3RCLFFBQUE7SUFBQSxPQUFxQixNQUFNLENBQUMsT0FBTyxDQUFDLGtCQUFmLENBQUEsQ0FBckIsRUFBQyxrQkFBRCxFQUFXO0lBQ1gsSUFBQSxDQUFtQixDQUFDLGtCQUFBLElBQWMsZ0JBQWYsQ0FBbkI7QUFBQSxhQUFPLEtBQVA7O0lBQ0EsUUFBQSxHQUFXLE1BQU0sQ0FBQyxxQkFBUCxDQUE2QixRQUE3QjtJQUNYLE1BQUEsR0FBUyxNQUFNLENBQUMscUJBQVAsQ0FBNkIsTUFBN0I7V0FDTCxJQUFBLEtBQUEsQ0FBTSxDQUFDLFFBQUQsRUFBVyxDQUFYLENBQU4sRUFBcUIsQ0FBQyxNQUFELEVBQVMsS0FBVCxDQUFyQjtFQUxrQjs7RUFPeEIsaUJBQUEsR0FBb0IsU0FBQTtBQUNsQixRQUFBO0FBQUM7QUFBQTtTQUFBLHNDQUFBOztVQUFrRCxNQUFBLEdBQVMsSUFBSSxDQUFDLGVBQUwsQ0FBQTtzQkFBM0Q7O0FBQUE7O0VBRGlCOztFQUdwQix3QkFBQSxHQUEyQixTQUFDLE1BQUQsRUFBUyxHQUFUO1dBQ3pCLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixHQUEvQixDQUFtQyxDQUFDO0VBRFg7O0VBSzNCLGtCQUFBLEdBQXFCLFNBQUMsTUFBRCxFQUFTLEtBQVQ7SUFDbkIsS0FBQSxHQUFRLEtBQUssQ0FBQyxVQUFOLENBQWlCLEtBQWpCO1dBQ1Isd0JBQUEsQ0FBeUIsTUFBekIsRUFBaUMsS0FBSyxDQUFDLEdBQXZDLENBQTJDLENBQUMsT0FBNUMsQ0FBb0QsS0FBcEQ7RUFGbUI7O0VBSXJCLG1CQUFBLEdBQXNCLFNBQUMsTUFBRCxFQUFTLEtBQVQ7QUFDcEIsUUFBQTtJQUFBLElBQUEsR0FBTyxrQ0FBQSxDQUFtQyxNQUFuQyxFQUEyQyxLQUEzQztXQUNQLENBQUksSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFWO0VBRmdCOztFQUl0QiwrQkFBQSxHQUFrQyxTQUFDLE1BQUQsRUFBUyxLQUFUO0lBQ2hDLEtBQUEsR0FBUSxLQUFLLENBQUMsVUFBTixDQUFpQixLQUFqQjtXQUNSLEtBQUssQ0FBQyxNQUFOLEtBQWtCLENBQWxCLElBQXdCLGtCQUFBLENBQW1CLE1BQW5CLEVBQTJCLEtBQTNCO0VBRlE7O0VBSWxDLHFCQUFBLEdBQXdCLFNBQUMsTUFBRCxFQUFTLEtBQVQ7V0FDdEIsdUJBQUEsQ0FBd0IsTUFBeEIsQ0FBK0IsQ0FBQyxPQUFoQyxDQUF3QyxLQUF4QztFQURzQjs7RUFHeEIsVUFBQSxHQUFhLFNBQUMsTUFBRCxFQUFTLEdBQVQ7V0FDWCxNQUFNLENBQUMsdUJBQVAsQ0FBK0IsR0FBL0IsQ0FBbUMsQ0FBQyxPQUFwQyxDQUFBO0VBRFc7O0VBR2Isa0NBQUEsR0FBcUMsU0FBQyxNQUFELEVBQVMsS0FBVCxFQUFnQixNQUFoQjs7TUFBZ0IsU0FBTzs7V0FDMUQsTUFBTSxDQUFDLG9CQUFQLENBQTRCLEtBQUssQ0FBQyxrQkFBTixDQUF5QixLQUF6QixFQUFnQyxDQUFoQyxFQUFtQyxNQUFuQyxDQUE1QjtFQURtQzs7RUFHckMsaUNBQUEsR0FBb0MsU0FBQyxNQUFELEVBQVMsS0FBVCxFQUFnQixNQUFoQjs7TUFBZ0IsU0FBTzs7V0FDekQsTUFBTSxDQUFDLG9CQUFQLENBQTRCLEtBQUssQ0FBQyxrQkFBTixDQUF5QixLQUF6QixFQUFnQyxDQUFoQyxFQUFtQyxDQUFDLE1BQXBDLENBQTVCO0VBRGtDOztFQUdwQyxvQkFBQSxHQUF1QixTQUFDLE1BQUQsRUFBUyxXQUFUO0FBQ3JCLFFBQUE7SUFBQSxXQUFBLEdBQWMsTUFBTSxDQUFDLHlCQUFQLENBQWlDLFdBQWpDO1dBQ2QsTUFBTSxDQUFDLG9CQUFQLENBQTRCLFdBQTVCO0VBRnFCOztFQUl2Qiw2QkFBQSxHQUFnQyxTQUFDLE1BQUQ7QUFFOUIsUUFBQTtJQUFBLElBQUcsbUNBQUg7YUFDRSxNQUFNLENBQUMsb0JBQVAsQ0FBQSxFQURGO0tBQUEsTUFBQTtNQUdFLEtBQUEsR0FBUSxNQUFNLENBQUMsa0JBQVAsQ0FBQSxDQUEyQixDQUFDLGNBQTVCLENBQUE7YUFDUixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsMEJBQWhCLEVBQTRDO1FBQUMsT0FBQSxLQUFEO09BQTVDLEVBSkY7O0VBRjhCOztFQVVoQyw2QkFBQSxHQUFnQyxTQUFDLE1BQUQ7QUFDOUIsUUFBQTtJQUFBLGFBQUEsR0FBZ0IsTUFBTSxDQUFDLGlCQUFQLENBQUE7SUFDaEIsTUFBQSxHQUFTLE1BQU0sQ0FBQztJQUNoQixNQUFBLEdBQVMsdUJBQUEsQ0FBd0IsTUFBeEI7QUFFVCxXQUFNLG1CQUFBLENBQW9CLE1BQXBCLEVBQTRCLEtBQUEsR0FBUSxNQUFNLENBQUMsaUJBQVAsQ0FBQSxDQUFwQyxDQUFBLElBQW9FLENBQUksS0FBSyxDQUFDLG9CQUFOLENBQTJCLE1BQTNCLENBQTlFO01BQ0UsTUFBTSxDQUFDLFNBQVAsQ0FBQTtJQURGO1dBRUEsQ0FBSSxhQUFhLENBQUMsT0FBZCxDQUFzQixNQUFNLENBQUMsaUJBQVAsQ0FBQSxDQUF0QjtFQVAwQjs7RUFTaEMsYUFBQSxHQUFnQixTQUFDLE1BQUQsRUFBUyxHQUFUO0FBQ2QsUUFBQTtJQUR3Qix5QkFBVTtBQUNsQyxZQUFPLFNBQVA7QUFBQSxXQUNPLFVBRFA7UUFFSSxJQUFHLFFBQUEsSUFBWSxDQUFmO2lCQUNFLEdBREY7U0FBQSxNQUFBO2lCQUdFOzs7O3lCQUhGOztBQURHO0FBRFAsV0FNTyxNQU5QO1FBT0ksTUFBQSxHQUFTLG1CQUFBLENBQW9CLE1BQXBCO1FBQ1QsSUFBRyxRQUFBLElBQVksTUFBZjtpQkFDRSxHQURGO1NBQUEsTUFBQTtpQkFHRTs7Ozt5QkFIRjs7QUFSSjtFQURjOztFQW9CaEIsdUJBQUEsR0FBMEIsU0FBQyxNQUFEO0FBQ3hCLFFBQUE7SUFBQSxHQUFBLEdBQU0sTUFBTSxDQUFDLG9CQUFQLENBQUE7SUFDTixJQUFHLENBQUMsR0FBRyxDQUFDLEdBQUosS0FBVyxDQUFaLENBQUEsSUFBa0IsQ0FBQyxHQUFHLENBQUMsTUFBSixHQUFhLENBQWQsQ0FBckI7YUFDRSxJQURGO0tBQUEsTUFBQTthQUdFLHdCQUFBLENBQXlCLE1BQXpCLEVBQWlDLEdBQUcsQ0FBQyxHQUFKLEdBQVUsQ0FBM0MsRUFIRjs7RUFGd0I7O0VBTzFCLHVCQUFBLEdBQTBCLFNBQUMsTUFBRDtXQUN4QixNQUFNLENBQUMsK0JBQVAsQ0FBdUMsdUJBQUEsQ0FBd0IsTUFBeEIsQ0FBdkM7RUFEd0I7O0VBRzFCLG1CQUFBLEdBQXNCLFNBQUMsTUFBRDtXQUFZLHVCQUFBLENBQXdCLE1BQXhCLENBQStCLENBQUM7RUFBNUM7O0VBQ3RCLG1CQUFBLEdBQXNCLFNBQUMsTUFBRDtXQUFZLHVCQUFBLENBQXdCLE1BQXhCLENBQStCLENBQUM7RUFBNUM7O0VBQ3RCLHdCQUFBLEdBQTJCLFNBQUMsTUFBRDtXQUFZLE1BQU0sQ0FBQyxPQUFPLENBQUMsd0JBQWYsQ0FBQTtFQUFaOztFQUMzQix1QkFBQSxHQUEwQixTQUFDLE1BQUQ7V0FBWSxNQUFNLENBQUMsT0FBTyxDQUFDLHVCQUFmLENBQUE7RUFBWjs7RUFFMUIscUNBQUEsR0FBd0MsU0FBQyxNQUFELEVBQVMsR0FBVDtBQUN0QyxRQUFBO0lBQUEsS0FBQSxHQUFRLG9CQUFBLENBQXFCLE1BQXJCLEVBQTZCLElBQTdCLEVBQW1DLEdBQW5DOzBFQUNXLElBQUEsS0FBQSxDQUFNLEdBQU4sRUFBVyxDQUFYO0VBRm1COztFQUl4QyxTQUFBLEdBQVksU0FBQyxNQUFELEVBQVMsU0FBVDtBQUNWLFFBQUE7SUFBQSxPQUFBLEdBQVU7SUFDVixPQUFlLEVBQWYsRUFBQyxlQUFELEVBQVE7SUFDUixRQUFBLEdBQVcsU0FBQyxHQUFEO0FBQWEsVUFBQTtNQUFYLFFBQUQ7YUFBYSxtQkFBRCxFQUFVO0lBQXZCO0lBQ1gsTUFBQSxHQUFTLFNBQUMsR0FBRDtBQUFhLFVBQUE7TUFBWCxRQUFEO2FBQWEsZUFBRCxFQUFRO0lBQXJCO0lBQ1QsTUFBTSxDQUFDLGlCQUFQLENBQXlCLE9BQXpCLEVBQWtDLFNBQWxDLEVBQTZDLFFBQTdDO0lBQ0EsSUFBaUUsYUFBakU7TUFBQSxNQUFNLENBQUMsMEJBQVAsQ0FBa0MsT0FBbEMsRUFBMkMsU0FBM0MsRUFBc0QsTUFBdEQsRUFBQTs7SUFDQSxJQUFHLGVBQUEsSUFBVyxhQUFkO2FBQ00sSUFBQSxLQUFBLENBQU0sS0FBTixFQUFhLEdBQWIsRUFETjtLQUFBLE1BQUE7YUFHRSxVQUhGOztFQVBVOztFQWVaLFlBQUEsR0FBZSxTQUFDLE1BQUQsRUFBUyxHQUFULEVBQWMsT0FBZDtBQUNiLFFBQUE7SUFBQSxNQUFBLCtDQUE2QixNQUFNLENBQUMsZUFBUCxDQUFBO0lBQzdCLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixDQUFDLEdBQUQsRUFBTSxNQUFOLENBQXpCLEVBQXdDLE9BQXhDO1dBQ0EsTUFBTSxDQUFDLFVBQVAsR0FBb0I7RUFIUDs7RUFLZixlQUFBLEdBQWtCLFNBQUMsTUFBRCxFQUFTLE1BQVQ7V0FDaEIsTUFBTSxDQUFDLGlCQUFQLENBQXlCLENBQUMsTUFBTSxDQUFDLFlBQVAsQ0FBQSxDQUFELEVBQXdCLE1BQXhCLENBQXpCO0VBRGdCOztFQUdsQixVQUFBLEdBQWEsU0FBQyxNQUFELEVBQVMsR0FBVCxFQUErQixFQUEvQjtBQUNYLFFBQUE7SUFEcUIscUJBQUQ7SUFDbkIsYUFBYztJQUNmLEVBQUEsQ0FBRyxNQUFIO0lBQ0EsSUFBRyxrQkFBQSxJQUF1QixvQkFBMUI7YUFDRSxNQUFNLENBQUMsVUFBUCxHQUFvQixXQUR0Qjs7RUFIVzs7RUFVYixxQkFBQSxHQUF3QixTQUFDLE1BQUQ7QUFDdEIsUUFBQTtJQUFBLE9BQWdCLE1BQU0sQ0FBQyxpQkFBUCxDQUFBLENBQWhCLEVBQUMsY0FBRCxFQUFNO0lBQ04sSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaUJBQWhCLENBQUg7TUFDRSxTQUFBLEdBQVksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGtCQUFoQjtNQUNaLElBQUcsQ0FBQSxDQUFBLEdBQUksTUFBSixJQUFJLE1BQUosR0FBYSxTQUFiLENBQUg7UUFDRSxJQUFBLEdBQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxvQkFBZCxDQUFtQyxDQUFDLENBQUMsR0FBRCxFQUFNLENBQU4sQ0FBRCxFQUFXLENBQUMsR0FBRCxFQUFNLFNBQU4sQ0FBWCxDQUFuQztlQUNQLE9BQU8sQ0FBQyxJQUFSLENBQWEsSUFBYixFQUZGO09BQUEsTUFBQTtlQUlFLE1BSkY7T0FGRjs7RUFGc0I7O0VBYXhCLGNBQUEsR0FBaUIsU0FBQyxNQUFELEVBQVMsT0FBVDtBQUNmLFFBQUE7O01BRHdCLFVBQVE7O0lBQy9CLDZCQUFELEVBQVk7SUFDWixPQUFPLE9BQU8sQ0FBQztJQUNmLElBQUcsZ0NBQUg7TUFDRSxJQUFVLHFCQUFBLENBQXNCLE1BQXRCLENBQVY7QUFBQSxlQUFBO09BREY7O0lBR0EsSUFBRyxDQUFJLE1BQU0sQ0FBQyxtQkFBUCxDQUFBLENBQUosSUFBb0MsU0FBdkM7TUFDRSxNQUFBLEdBQVMsU0FBQyxNQUFEO2VBQVksTUFBTSxDQUFDLFFBQVAsQ0FBQTtNQUFaO2FBQ1QsVUFBQSxDQUFXLE1BQVgsRUFBbUIsT0FBbkIsRUFBNEIsTUFBNUIsRUFGRjs7RUFOZTs7RUFVakIsZUFBQSxHQUFrQixTQUFDLE1BQUQsRUFBUyxPQUFUO0FBQ2hCLFFBQUE7O01BRHlCLFVBQVE7O0lBQ2hDLFlBQWE7SUFDZCxPQUFPLE9BQU8sQ0FBQztJQUNmLElBQUcsQ0FBSSxNQUFNLENBQUMsYUFBUCxDQUFBLENBQUosSUFBOEIsU0FBakM7TUFDRSxNQUFBLEdBQVMsU0FBQyxNQUFEO2VBQVksTUFBTSxDQUFDLFNBQVAsQ0FBQTtNQUFaO2FBQ1QsVUFBQSxDQUFXLE1BQVgsRUFBbUIsT0FBbkIsRUFBNEIsTUFBNUIsRUFGRjs7RUFIZ0I7O0VBT2xCLGtCQUFBLEdBQXFCLFNBQUMsTUFBRCxFQUFTLE9BQVQ7QUFDbkIsUUFBQTs7TUFENEIsVUFBUTs7SUFDcEMsSUFBTyxNQUFNLENBQUMsWUFBUCxDQUFBLENBQUEsS0FBeUIsQ0FBaEM7TUFDRSxNQUFBLEdBQVMsU0FBQyxNQUFEO2VBQVksTUFBTSxDQUFDLE1BQVAsQ0FBQTtNQUFaO2FBQ1QsVUFBQSxDQUFXLE1BQVgsRUFBbUIsT0FBbkIsRUFBNEIsTUFBNUIsRUFGRjs7RUFEbUI7O0VBS3JCLG9CQUFBLEdBQXVCLFNBQUMsTUFBRCxFQUFTLE9BQVQ7QUFDckIsUUFBQTs7TUFEOEIsVUFBUTs7SUFDdEMsSUFBTyxtQkFBQSxDQUFvQixNQUFNLENBQUMsTUFBM0IsQ0FBQSxLQUFzQyxNQUFNLENBQUMsWUFBUCxDQUFBLENBQTdDO01BQ0UsTUFBQSxHQUFTLFNBQUMsTUFBRDtlQUFZLE1BQU0sQ0FBQyxRQUFQLENBQUE7TUFBWjthQUNULFVBQUEsQ0FBVyxNQUFYLEVBQW1CLE9BQW5CLEVBQTRCLE1BQTVCLEVBRkY7O0VBRHFCOztFQU12QixvQkFBQSxHQUF1QixTQUFDLE1BQUQ7QUFDckIsUUFBQTtJQUFBLEtBQUEsR0FBUSxNQUFNLENBQUMsaUJBQVAsQ0FBQTtJQUNSLElBQU8sbUJBQUEsQ0FBb0IsTUFBTSxDQUFDLE1BQTNCLENBQUEsS0FBc0MsS0FBSyxDQUFDLEdBQW5EO2FBQ0UsTUFBTSxDQUFDLGlCQUFQLENBQXlCLEtBQUssQ0FBQyxTQUFOLENBQWdCLENBQUMsQ0FBQyxDQUFGLEVBQUssQ0FBTCxDQUFoQixDQUF6QixFQURGOztFQUZxQjs7RUFNdkIsa0JBQUEsR0FBcUIsU0FBQyxNQUFEO0FBQ25CLFFBQUE7SUFBQSxLQUFBLEdBQVEsTUFBTSxDQUFDLGlCQUFQLENBQUE7SUFDUixJQUFPLEtBQUssQ0FBQyxHQUFOLEtBQWEsQ0FBcEI7YUFDRSxNQUFNLENBQUMsaUJBQVAsQ0FBeUIsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsQ0FBQyxDQUFDLENBQUYsRUFBSyxDQUFMLENBQWhCLENBQXpCLEVBREY7O0VBRm1COztFQUtyQiwrQkFBQSxHQUFrQyxTQUFDLE1BQUQsRUFBUyxHQUFUO0lBQ2hDLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixDQUFDLEdBQUQsRUFBTSxDQUFOLENBQXpCO1dBQ0EsTUFBTSxDQUFDLDBCQUFQLENBQUE7RUFGZ0M7O0VBSWxDLG9CQUFBLEdBQXVCLFNBQUMsTUFBRCxFQUFTLEdBQVQ7V0FBaUIsV0FBQSxDQUFZLEdBQVosRUFBaUI7TUFBQSxHQUFBLEVBQUssQ0FBTDtNQUFRLEdBQUEsRUFBSyxtQkFBQSxDQUFvQixNQUFwQixDQUFiO0tBQWpCO0VBQWpCOztFQUV2QixvQkFBQSxHQUF1QixTQUFDLE1BQUQsRUFBUyxHQUFUO1dBQWlCLFdBQUEsQ0FBWSxHQUFaLEVBQWlCO01BQUEsR0FBQSxFQUFLLENBQUw7TUFBUSxHQUFBLEVBQUssbUJBQUEsQ0FBb0IsTUFBcEIsQ0FBYjtLQUFqQjtFQUFqQjs7RUFHdkIsMkJBQUEsR0FBOEIsU0FBQyxNQUFELEVBQVMsR0FBVCxFQUF3QixJQUF4QjtBQUM1QixRQUFBO0lBRHNDLGVBQUs7SUFBVSw0QkFBRCxPQUFZO0lBQ2hFLHdCQUFHLFlBQVksSUFBZjthQUNFLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixHQUE1QixDQUFpQyxrQkFEbkM7S0FBQSxNQUFBO2FBR0UsTUFBTSxDQUFDLG9CQUFQLENBQTRCLEdBQTVCLENBQWlDLDhCQUhuQzs7RUFENEI7O0VBTTlCLDBCQUFBLEdBQTZCLFNBQUMsTUFBRCxFQUFTLEdBQVQ7V0FDM0IsTUFBTSxDQUFDLGtCQUFQLENBQTBCLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixHQUE1QixDQUExQjtFQUQyQjs7RUFHN0Isb0JBQUEsR0FBdUIsU0FBQyxNQUFEO0FBQ3JCLFFBQUE7V0FBQTs7OztrQkFDRSxDQUFDLEdBREgsQ0FDTyxTQUFDLEdBQUQ7YUFDSCxNQUFNLENBQUMsWUFBWSxDQUFDLDhCQUFwQixDQUFtRCxHQUFuRDtJQURHLENBRFAsQ0FHRSxDQUFDLE1BSEgsQ0FHVSxTQUFDLFFBQUQ7YUFDTixrQkFBQSxJQUFjLHFCQUFkLElBQStCO0lBRHpCLENBSFY7RUFEcUI7O0VBUXZCLG1DQUFBLEdBQXNDLFNBQUMsTUFBRCxFQUFTLFNBQVQsRUFBb0IsR0FBcEI7QUFDcEMsUUFBQTtJQUR5RCxpQ0FBRCxNQUFrQjs7TUFDMUUsa0JBQW1COztXQUNuQixvQkFBQSxDQUFxQixNQUFyQixDQUE0QixDQUFDLE1BQTdCLENBQW9DLFNBQUMsSUFBRDtBQUNsQyxVQUFBO01BRG9DLG9CQUFVO01BQzlDLElBQUcsZUFBSDtlQUNFLENBQUEsUUFBQSxJQUFZLFNBQVosSUFBWSxTQUFaLElBQXlCLE1BQXpCLEVBREY7T0FBQSxNQUFBO2VBR0UsQ0FBQSxRQUFBLEdBQVcsU0FBWCxJQUFXLFNBQVgsSUFBd0IsTUFBeEIsRUFIRjs7SUFEa0MsQ0FBcEM7RUFGb0M7O0VBUXRDLHlCQUFBLEdBQTRCLFNBQUMsTUFBRCxFQUFTLFFBQVQ7QUFDMUIsUUFBQTtJQUFBLE9BQXlCLFFBQVEsQ0FBQyxHQUFULENBQWEsU0FBQyxHQUFEO2FBQ3BDLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixHQUEvQixFQUFvQztRQUFBLGNBQUEsRUFBZ0IsSUFBaEI7T0FBcEM7SUFEb0MsQ0FBYixDQUF6QixFQUFDLG9CQUFELEVBQWE7V0FFYixVQUFVLENBQUMsS0FBWCxDQUFpQixRQUFqQjtFQUgwQjs7RUFLNUIsc0JBQUEsR0FBeUIsU0FBQyxNQUFELEVBQVMsR0FBVDtXQUN2QixNQUFNLENBQUMsZUFBZSxDQUFDLG1CQUF2QixDQUEyQyxHQUEzQztFQUR1Qjs7RUFHekIseUJBQUEsR0FBNEIsU0FBQyxJQUFEO0FBQzFCLFFBQUE7QUFBQTtBQUFBO1NBQUEsc0NBQUE7O1VBQTBCLEdBQUEsR0FBTSxDQUFOLElBQVksQ0FBQyxHQUFBLEdBQU0sQ0FBTixLQUFXLENBQUMsQ0FBYjtzQkFDcEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFkLENBQXlCLEdBQXpCOztBQURGOztFQUQwQjs7RUFJNUIsaUJBQUEsR0FBb0IsU0FBQyxNQUFELEVBQVMsU0FBVCxFQUFvQixTQUFwQixFQUErQixFQUEvQjtBQUNsQixRQUFBO0lBQUEsU0FBQSxHQUFZLEtBQUssQ0FBQyxVQUFOLENBQWlCLFNBQWpCO0lBQ1osUUFBQTs7QUFBVyxjQUFPLFNBQVA7QUFBQSxhQUNKLFNBREk7aUJBQ1c7Ozs7O0FBRFgsYUFFSixVQUZJO2lCQUVZOzs7OztBQUZaOztJQUlYLFlBQUEsR0FBZTtJQUNmLElBQUEsR0FBTyxTQUFBO2FBQ0wsWUFBQSxHQUFlO0lBRFY7SUFHUCxZQUFBO0FBQWUsY0FBTyxTQUFQO0FBQUEsYUFDUixTQURRO2lCQUNPLFNBQUMsR0FBRDtBQUFnQixnQkFBQTtZQUFkLFdBQUQ7bUJBQWUsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsU0FBdkI7VUFBaEI7QUFEUCxhQUVSLFVBRlE7aUJBRVEsU0FBQyxHQUFEO0FBQWdCLGdCQUFBO1lBQWQsV0FBRDttQkFBZSxRQUFRLENBQUMsVUFBVCxDQUFvQixTQUFwQjtVQUFoQjtBQUZSOztBQUlmLFNBQUEsMENBQUE7O1lBQXlCLGFBQUEsR0FBZ0Isc0JBQUEsQ0FBdUIsTUFBdkIsRUFBK0IsR0FBL0I7OztNQUN2QyxNQUFBLEdBQVM7TUFDVCxPQUFBLEdBQVU7TUFFVixhQUFBLEdBQWdCLGFBQWEsQ0FBQyxnQkFBZCxDQUFBO0FBQ2hCO0FBQUEsV0FBQSx3Q0FBQTs7UUFDRSxhQUFhLENBQUMsSUFBZCxDQUFBO1FBQ0EsSUFBRyxHQUFBLEdBQU0sQ0FBVDtVQUNFLEtBQUEsR0FBUSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQWQsQ0FBeUIsR0FBekI7VUFDUixJQUFHLENBQUMsR0FBQSxHQUFNLENBQVAsQ0FBQSxLQUFhLENBQWhCO1lBQ0UsS0FERjtXQUFBLE1BQUE7WUFHRSxRQUFBLEdBQWUsSUFBQSxLQUFBLENBQU0sR0FBTixFQUFXLE1BQVg7WUFDZixPQUFPLENBQUMsSUFBUixDQUFhO2NBQUMsT0FBQSxLQUFEO2NBQVEsVUFBQSxRQUFSO2NBQWtCLE1BQUEsSUFBbEI7YUFBYixFQUpGO1dBRkY7U0FBQSxNQUFBO1VBUUUsTUFBQSxJQUFVLElBUlo7O0FBRkY7TUFZQSxPQUFBLEdBQVUsT0FBTyxDQUFDLE1BQVIsQ0FBZSxZQUFmO01BQ1YsSUFBcUIsU0FBQSxLQUFhLFVBQWxDO1FBQUEsT0FBTyxDQUFDLE9BQVIsQ0FBQSxFQUFBOztBQUNBLFdBQUEsMkNBQUE7O1FBQ0UsRUFBQSxDQUFHLE1BQUg7UUFDQSxJQUFBLENBQWMsWUFBZDtBQUFBLGlCQUFBOztBQUZGO01BR0EsSUFBQSxDQUFjLFlBQWQ7QUFBQSxlQUFBOztBQXRCRjtFQWRrQjs7RUFzQ3BCLGdDQUFBLEdBQW1DLFNBQUMsTUFBRCxFQUFTLFNBQVQsRUFBb0IsU0FBcEIsRUFBK0IsS0FBL0I7QUFDakMsUUFBQTtJQUFBLEtBQUEsR0FBUTtJQUNSLGlCQUFBLENBQWtCLE1BQWxCLEVBQTBCLFNBQTFCLEVBQXFDLFNBQXJDLEVBQWdELFNBQUMsSUFBRDtNQUM5QyxJQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBWCxDQUFrQixLQUFsQixDQUFBLElBQTRCLENBQS9CO1FBQ0UsSUFBSSxDQUFDLElBQUwsQ0FBQTtlQUNBLEtBQUEsR0FBUSxJQUFJLENBQUMsU0FGZjs7SUFEOEMsQ0FBaEQ7V0FJQTtFQU5pQzs7RUFRbkMsNEJBQUEsR0FBK0IsU0FBQyxNQUFELEVBQVMsR0FBVDtBQUs3QixRQUFBO0lBQUEsSUFBRyxhQUFBLEdBQWdCLHNCQUFBLENBQXVCLE1BQXZCLEVBQStCLEdBQS9CLENBQW5CO2FBQ0UseUJBQUEsQ0FBMEIsYUFBMUIsQ0FBd0MsQ0FBQyxJQUF6QyxDQUE4QyxTQUFDLEtBQUQ7ZUFDNUMsZUFBQSxDQUFnQixNQUFoQixFQUF3QixLQUF4QjtNQUQ0QyxDQUE5QyxFQURGO0tBQUEsTUFBQTthQUlFLE1BSkY7O0VBTDZCOztFQVkvQixlQUFBLEdBQWtCLFNBQUMsTUFBRCxFQUFTLEtBQVQ7QUFDaEIsUUFBQTtBQUFBLFlBQU8sTUFBTSxDQUFDLFVBQVAsQ0FBQSxDQUFtQixDQUFDLFNBQTNCO0FBQUEsV0FDTyxXQURQO0FBQUEsV0FDb0IsZUFEcEI7UUFFSSxNQUFBLEdBQVMsQ0FBQyxzQkFBRDtBQURPO0FBRHBCLFdBR08sYUFIUDtRQUlJLE1BQUEsR0FBUyxDQUFDLGdCQUFELEVBQW1CLGFBQW5CLEVBQWtDLGNBQWxDO0FBRE47QUFIUDtRQU1JLE1BQUEsR0FBUyxDQUFDLGdCQUFELEVBQW1CLGFBQW5CO0FBTmI7SUFPQSxPQUFBLEdBQWMsSUFBQSxNQUFBLENBQU8sR0FBQSxHQUFNLE1BQU0sQ0FBQyxHQUFQLENBQVcsQ0FBQyxDQUFDLFlBQWIsQ0FBMEIsQ0FBQyxJQUEzQixDQUFnQyxHQUFoQyxDQUFiO1dBQ2QsT0FBTyxDQUFDLElBQVIsQ0FBYSxLQUFiO0VBVGdCOztFQWFsQiwyQkFBQSxHQUE4QixTQUFDLE1BQUQsRUFBUyxLQUFUO0FBQzVCLFFBQUE7SUFBQSxhQUFBLEdBQWdCLE1BQU0sQ0FBQztJQUN2QixnQkFBQSxHQUFtQixNQUFNLENBQUMscUJBQVAsQ0FBQSxDQUFBLEdBQWlDLENBQUMsTUFBTSxDQUFDLGNBQVAsQ0FBQSxDQUFBLEdBQTBCLENBQTNCO0lBQ3BELFNBQUEsR0FBWSxhQUFhLENBQUMsWUFBZCxDQUFBLENBQUEsR0FBK0I7SUFDM0MsV0FBQSxHQUFjLGFBQWEsQ0FBQyxlQUFkLENBQUEsQ0FBQSxHQUFrQztJQUNoRCxNQUFBLEdBQVMsYUFBYSxDQUFDLDhCQUFkLENBQTZDLEtBQTdDLENBQW1ELENBQUM7SUFFN0QsTUFBQSxHQUFTLENBQUMsV0FBQSxHQUFjLE1BQWYsQ0FBQSxJQUEwQixDQUFDLE1BQUEsR0FBUyxTQUFWO1dBQ25DLE1BQU0sQ0FBQyxzQkFBUCxDQUE4QixLQUE5QixFQUFxQztNQUFDLFFBQUEsTUFBRDtLQUFyQztFQVI0Qjs7RUFVOUIsV0FBQSxHQUFjLFNBQUMsYUFBRCxFQUFnQixNQUFoQjtBQUNaLFFBQUE7SUFBQSxPQUFBLEdBQVUsTUFBTSxDQUFDLEdBQVAsQ0FBVyxTQUFDLEtBQUQ7YUFBVyxLQUFLLENBQUMsS0FBTixDQUFZLEdBQVo7SUFBWCxDQUFYO0FBRVYsU0FBQSx5Q0FBQTs7TUFDRSxhQUFBLEdBQWdCO0FBQ2hCLFdBQUEsOENBQUE7O1FBQ0UsSUFBc0IsYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUF4QixDQUFpQyxTQUFqQyxDQUF0QjtVQUFBLGFBQUEsSUFBaUIsRUFBakI7O0FBREY7TUFFQSxJQUFlLGFBQUEsS0FBaUIsVUFBVSxDQUFDLE1BQTNDO0FBQUEsZUFBTyxLQUFQOztBQUpGO1dBS0E7RUFSWTs7RUFVZCxnQkFBQSxHQUFtQixTQUFDLElBQUQ7V0FDakIsSUFBSSxDQUFDLEtBQUwsQ0FBVyxTQUFYLENBQXFCLENBQUMsTUFBdEIsS0FBZ0M7RUFEZjs7RUFlbkIseUNBQUEsR0FBNEMsU0FBQyxNQUFELEVBQVMsS0FBVCxFQUFnQixPQUFoQjtBQUMxQyxRQUFBOztNQUQwRCxVQUFROztJQUNqRSw2Q0FBRCxFQUFvQiw2QkFBcEIsRUFBK0IsNkNBQS9CLEVBQWtEO0lBQ2xELElBQU8sbUJBQUosSUFBc0IsMkJBQXpCOztRQUNFLFNBQVUsTUFBTSxDQUFDLGFBQVAsQ0FBQTs7TUFDVixPQUFpQyxDQUFDLENBQUMsTUFBRixDQUFTLE9BQVQsRUFBa0Isd0JBQUEsQ0FBeUIsTUFBekIsRUFBaUMsT0FBakMsQ0FBbEIsQ0FBakMsRUFBQywwQkFBRCxFQUFZLDJDQUZkOzs7TUFHQSxvQkFBcUI7O0lBRXJCLGdCQUFBLEdBQW1CLGtDQUFBLENBQW1DLE1BQW5DLEVBQTJDLEtBQTNDO0lBQ25CLFlBQUEsR0FBbUIsSUFBQSxNQUFBLENBQU8sR0FBQSxHQUFHLENBQUMsQ0FBQyxDQUFDLFlBQUYsQ0FBZSxpQkFBZixDQUFELENBQUgsR0FBc0MsSUFBN0M7SUFFbkIsSUFBRyxJQUFJLENBQUMsSUFBTCxDQUFVLGdCQUFWLENBQUg7TUFDRSxNQUFBLEdBQVM7TUFDVCxJQUFBLEdBQU87TUFDUCxTQUFBLEdBQWdCLElBQUEsTUFBQSxDQUFPLE1BQVAsRUFIbEI7S0FBQSxNQUlLLElBQUcsWUFBWSxDQUFDLElBQWIsQ0FBa0IsZ0JBQWxCLENBQUEsSUFBd0MsQ0FBSSxTQUFTLENBQUMsSUFBVixDQUFlLGdCQUFmLENBQS9DO01BQ0gsSUFBQSxHQUFPO01BQ1AsSUFBRyxpQkFBSDtRQUNFLE1BQUEsR0FBUyxDQUFDLENBQUMsWUFBRixDQUFlLGdCQUFmO1FBQ1QsU0FBQSxHQUFnQixJQUFBLE1BQUEsQ0FBTyxNQUFQLEVBRmxCO09BQUEsTUFBQTtRQUlFLFNBQUEsR0FBWSxhQUpkO09BRkc7S0FBQSxNQUFBO01BUUgsSUFBQSxHQUFPLE9BUko7O0lBVUwsS0FBQSxHQUFRLGtDQUFBLENBQW1DLE1BQW5DLEVBQTJDLEtBQTNDLEVBQWtEO01BQUMsV0FBQSxTQUFEO0tBQWxEO1dBQ1I7TUFBQyxNQUFBLElBQUQ7TUFBTyxPQUFBLEtBQVA7O0VBekIwQzs7RUEyQjVDLDhCQUFBLEdBQWlDLFNBQUMsTUFBRCxFQUFTLEtBQVQsRUFBZ0IsT0FBaEI7QUFDL0IsUUFBQTs7TUFEK0MsVUFBUTs7SUFDdkQsaUJBQUEsdURBQWdEO0lBQ2hELE9BQU8sT0FBTyxDQUFDO0lBQ2YsT0FBZ0IseUNBQUEsQ0FBMEMsTUFBMUMsRUFBa0QsS0FBbEQsRUFBeUQsT0FBekQsQ0FBaEIsRUFBQyxrQkFBRCxFQUFRO0lBQ1IsSUFBQSxHQUFPLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixLQUE1QjtJQUNQLE9BQUEsR0FBVSxDQUFDLENBQUMsWUFBRixDQUFlLElBQWY7SUFFVixJQUFHLElBQUEsS0FBUSxNQUFSLElBQW1CLGlCQUF0QjtNQUVFLGFBQUEsR0FBbUIsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYLENBQUgsR0FBeUIsS0FBekIsR0FBb0M7TUFDcEQsV0FBQSxHQUFpQixLQUFLLENBQUMsSUFBTixDQUFXLElBQVgsQ0FBSCxHQUF5QixLQUF6QixHQUFvQztNQUNsRCxPQUFBLEdBQVUsYUFBQSxHQUFnQixPQUFoQixHQUEwQixZQUp0Qzs7V0FLSSxJQUFBLE1BQUEsQ0FBTyxPQUFQLEVBQWdCLEdBQWhCO0VBWjJCOztFQWNqQyxpQ0FBQSxHQUFvQyxTQUFDLE1BQUQsRUFBUyxLQUFULEVBQWdCLE9BQWhCOztNQUFnQixVQUFROztJQUMxRCxPQUFBLEdBQVU7TUFBQyxTQUFBLEVBQVcsTUFBTSxDQUFDLGFBQVAsQ0FBQSxDQUFzQixDQUFDLGFBQXZCLENBQUEsQ0FBWjtNQUFvRCxpQkFBQSxFQUFtQixLQUF2RTs7V0FDViw4QkFBQSxDQUErQixNQUEvQixFQUF1QyxLQUF2QyxFQUE4QyxPQUE5QztFQUZrQzs7RUFLcEMsd0JBQUEsR0FBMkIsU0FBQyxNQUFELEVBQVMsR0FBVDtBQUN6QixRQUFBO0lBRG1DLFlBQUQ7SUFDbEMsaUJBQUEsR0FBb0IsNkJBQUEsQ0FBOEIsTUFBOUI7O01BQ3BCLFlBQWlCLElBQUEsTUFBQSxDQUFPLGdCQUFBLEdBQWdCLENBQUMsQ0FBQyxDQUFDLFlBQUYsQ0FBZSxpQkFBZixDQUFELENBQWhCLEdBQW1ELElBQTFEOztXQUNqQjtNQUFDLFdBQUEsU0FBRDtNQUFZLG1CQUFBLGlCQUFaOztFQUh5Qjs7RUFLM0IsZ0NBQUEsR0FBbUMsU0FBQyxNQUFELEVBQVMsS0FBVCxFQUFnQixHQUFoQjtBQUNqQyxRQUFBO0lBRGtELDJCQUFELE1BQVk7SUFDN0QsU0FBQSxHQUFZLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBUCxFQUFZLENBQVosQ0FBRCxFQUFpQixLQUFqQjtJQUVaLEtBQUEsR0FBUTtJQUNSLE1BQU0sQ0FBQywwQkFBUCxDQUFrQyxTQUFsQyxFQUE2QyxTQUE3QyxFQUF3RCxTQUFDLElBQUQ7QUFDdEQsVUFBQTtNQUR3RCxvQkFBTyw0QkFBVztNQUMxRSxJQUFVLFNBQUEsS0FBYSxFQUFiLElBQW9CLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBWixLQUF3QixDQUF0RDtBQUFBLGVBQUE7O01BRUEsSUFBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVosQ0FBdUIsS0FBdkIsQ0FBSDtRQUNFLElBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxvQkFBVixDQUErQixLQUEvQixDQUFIO1VBQ0UsS0FBQSxHQUFRLEtBQUssQ0FBQyxNQURoQjs7ZUFFQSxJQUFBLENBQUEsRUFIRjs7SUFIc0QsQ0FBeEQ7MkJBUUEsUUFBUTtFQVp5Qjs7RUFjbkMsMEJBQUEsR0FBNkIsU0FBQyxNQUFELEVBQVMsS0FBVCxFQUFnQixHQUFoQjtBQUMzQixRQUFBO0lBRDRDLDJCQUFELE1BQVk7SUFDdkQsU0FBQSxHQUFZLENBQUMsS0FBRCxFQUFRLENBQUMsS0FBSyxDQUFDLEdBQVAsRUFBWSxLQUFaLENBQVI7SUFFWixLQUFBLEdBQVE7SUFDUixNQUFNLENBQUMsaUJBQVAsQ0FBeUIsU0FBekIsRUFBb0MsU0FBcEMsRUFBK0MsU0FBQyxJQUFEO0FBQzdDLFVBQUE7TUFEK0Msb0JBQU8sNEJBQVc7TUFDakUsSUFBVSxTQUFBLEtBQWEsRUFBYixJQUFvQixLQUFLLENBQUMsS0FBSyxDQUFDLE1BQVosS0FBd0IsQ0FBdEQ7QUFBQSxlQUFBOztNQUVBLElBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxhQUFWLENBQXdCLEtBQXhCLENBQUg7UUFDRSxJQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsaUJBQVosQ0FBOEIsS0FBOUIsQ0FBSDtVQUNFLEtBQUEsR0FBUSxLQUFLLENBQUMsSUFEaEI7O2VBRUEsSUFBQSxDQUFBLEVBSEY7O0lBSDZDLENBQS9DOzJCQVFBLFFBQVE7RUFabUI7O0VBYzdCLGtDQUFBLEdBQXFDLFNBQUMsTUFBRCxFQUFTLFFBQVQsRUFBbUIsT0FBbkI7QUFDbkMsUUFBQTs7TUFEc0QsVUFBUTs7SUFDOUQsV0FBQSxHQUFjLDBCQUFBLENBQTJCLE1BQTNCLEVBQW1DLFFBQW5DLEVBQTZDLE9BQTdDO0lBQ2QsYUFBQSxHQUFnQixnQ0FBQSxDQUFpQyxNQUFqQyxFQUF5QyxXQUF6QyxFQUFzRCxPQUF0RDtXQUNaLElBQUEsS0FBQSxDQUFNLGFBQU4sRUFBcUIsV0FBckI7RUFIK0I7O0VBT3JDLDZCQUFBLEdBQWdDLFNBQUMsS0FBRDtBQUM5QixRQUFBO0lBQUMsbUJBQUQsRUFBUTtJQUNSLElBQUcsR0FBRyxDQUFDLE1BQUosS0FBYyxDQUFqQjtNQUNFLE1BQUEsR0FBUyxXQUFBLENBQVksR0FBRyxDQUFDLEdBQUosR0FBVSxDQUF0QixFQUF5QjtRQUFBLEdBQUEsRUFBSyxLQUFLLENBQUMsR0FBWDtPQUF6QjthQUNMLElBQUEsS0FBQSxDQUFNLEtBQU4sRUFBYSxDQUFDLE1BQUQsRUFBUyxLQUFULENBQWIsRUFGTjtLQUFBLE1BQUE7YUFJRSxNQUpGOztFQUY4Qjs7RUFRaEMsVUFBQSxHQUFhLFNBQUMsTUFBRCxFQUFTLE9BQVQ7QUFDWCxRQUFBO0lBQUEsTUFBQSxHQUFTO0lBQ1QsTUFBTSxDQUFDLElBQVAsQ0FBWSxPQUFaLEVBQXFCLFNBQUMsR0FBRDtBQUNuQixVQUFBO01BRHFCLFFBQUQ7YUFDcEIsTUFBTSxDQUFDLElBQVAsQ0FBWSxLQUFaO0lBRG1CLENBQXJCO1dBRUE7RUFKVzs7RUFNYix1QkFBQSxHQUEwQixTQUFDLE1BQUQsRUFBUyxHQUFULEVBQWMsT0FBZDtBQUN4QixRQUFBO0lBQUEsTUFBQSxHQUFTO0lBQ1QsU0FBQSxHQUFZLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixHQUEvQjtJQUNaLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixPQUF6QixFQUFrQyxTQUFsQyxFQUE2QyxTQUFDLEdBQUQ7QUFDM0MsVUFBQTtNQUQ2QyxRQUFEO2FBQzVDLE1BQU0sQ0FBQyxJQUFQLENBQVksS0FBWjtJQUQyQyxDQUE3QztXQUVBO0VBTHdCOztFQU8xQixvQkFBQSxHQUF1QixTQUFDLE1BQUQsRUFBUyxPQUFULEVBQWtCLEdBQWxCLEVBQXVCLEdBQXZCO0FBQ3JCLFFBQUE7SUFENkMsMkJBQUQsTUFBWTtJQUN4RCxJQUFHLFNBQUEsS0FBYSxVQUFoQjtNQUNFLGdCQUFBLEdBQW1CLDZCQURyQjtLQUFBLE1BQUE7TUFHRSxnQkFBQSxHQUFtQixvQkFIckI7O0lBS0EsS0FBQSxHQUFRO0lBQ1IsU0FBQSxHQUFZLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixHQUEvQjtJQUNaLE1BQU8sQ0FBQSxnQkFBQSxDQUFQLENBQXlCLE9BQXpCLEVBQWtDLFNBQWxDLEVBQTZDLFNBQUMsS0FBRDthQUFXLEtBQUEsR0FBUSxLQUFLLENBQUM7SUFBekIsQ0FBN0M7V0FDQTtFQVRxQjs7RUFXdkIsb0NBQUEsR0FBdUMsU0FBQyxNQUFELEVBQVMsR0FBVDtBQUNyQyxRQUFBO0lBQUEsT0FBQSxHQUFVLE1BQU0sQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsV0FBckMsQ0FBaUQ7TUFBQSxhQUFBLEVBQWUsR0FBZjtLQUFqRDtJQUVWLFVBQUEsR0FBYTtJQUNiLFFBQUEsR0FBVztBQUVYO0FBQUEsU0FBQSxzQ0FBQTs7TUFDRSxPQUFlLE1BQU0sQ0FBQyxRQUFQLENBQUEsQ0FBZixFQUFDLGtCQUFELEVBQVE7TUFDUixJQUFBLENBQU8sVUFBUDtRQUNFLFVBQUEsR0FBYTtRQUNiLFFBQUEsR0FBVztBQUNYLGlCQUhGOztNQUtBLElBQUcsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsVUFBakIsQ0FBSDtRQUNFLFVBQUEsR0FBYTtRQUNiLFFBQUEsR0FBVyxJQUZiOztBQVBGO0lBV0EsSUFBRyxvQkFBQSxJQUFnQixrQkFBbkI7YUFDTSxJQUFBLEtBQUEsQ0FBTSxVQUFOLEVBQWtCLFFBQWxCLEVBRE47O0VBakJxQzs7RUFxQnZDLHFCQUFBLEdBQXdCLFNBQUMsTUFBRCxFQUFTLEtBQVQsRUFBZ0IsU0FBaEI7QUFDdEIsUUFBQTtJQUFBLEtBQUEsR0FBUSxLQUFLLENBQUMsVUFBTixDQUFpQixLQUFqQjtJQUVSLFFBQUEsR0FBVztBQUNYLFlBQU8sU0FBUDtBQUFBLFdBQ08sU0FEUDtRQUVJLEtBQUEsR0FBUSxLQUFLLENBQUMsU0FBTixDQUFnQixDQUFDLENBQUQsRUFBSSxDQUFDLENBQUwsQ0FBaEI7UUFDUixHQUFBLEdBQU0sTUFBTSxDQUFDLHVCQUFQLENBQStCLEtBQUssQ0FBQyxHQUFyQyxDQUF5QyxDQUFDO1FBRWhELElBQUcsS0FBSyxDQUFDLE9BQU4sQ0FBYyxHQUFkLENBQUg7VUFDRSxRQUFBLEdBQVcsS0FEYjtTQUFBLE1BRUssSUFBRyxLQUFLLENBQUMsYUFBTixDQUFvQixHQUFwQixDQUFIO1VBQ0gsUUFBQSxHQUFXO1VBQ1gsS0FBQSxHQUFZLElBQUEsS0FBQSxDQUFNLEtBQUssQ0FBQyxHQUFOLEdBQVksQ0FBbEIsRUFBcUIsQ0FBckIsRUFGVDs7UUFJTCxLQUFBLEdBQVEsS0FBSyxDQUFDLEdBQU4sQ0FBVSxLQUFWLEVBQWlCLE1BQU0sQ0FBQyxvQkFBUCxDQUFBLENBQWpCO0FBVkw7QUFEUCxXQWFPLFVBYlA7UUFjSSxLQUFBLEdBQVEsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsQ0FBQyxDQUFELEVBQUksQ0FBQyxDQUFMLENBQWhCO1FBRVIsSUFBRyxLQUFLLENBQUMsTUFBTixHQUFlLENBQWxCO1VBQ0UsUUFBQSxHQUFXO1VBQ1gsTUFBQSxHQUFTLEtBQUssQ0FBQyxHQUFOLEdBQVk7VUFDckIsR0FBQSxHQUFNLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixNQUEvQixDQUFzQyxDQUFDO1VBQzdDLEtBQUEsR0FBWSxJQUFBLEtBQUEsQ0FBTSxNQUFOLEVBQWMsR0FBRyxDQUFDLE1BQWxCLEVBSmQ7O1FBTUEsS0FBQSxHQUFRLEtBQUssQ0FBQyxHQUFOLENBQVUsS0FBVixFQUFpQixLQUFLLENBQUMsSUFBdkI7QUF0Qlo7SUF3QkEsSUFBRyxRQUFIO2FBQ0UsTUFERjtLQUFBLE1BQUE7TUFHRSxXQUFBLEdBQWMsTUFBTSxDQUFDLCtCQUFQLENBQXVDLEtBQXZDLEVBQThDO1FBQUEsYUFBQSxFQUFlLFNBQWY7T0FBOUM7YUFDZCxNQUFNLENBQUMsK0JBQVAsQ0FBdUMsV0FBdkMsRUFKRjs7RUE1QnNCOztFQWtDeEIsK0JBQUEsR0FBa0MsU0FBQyxNQUFELEVBQVMsS0FBVCxFQUFnQixLQUFoQixFQUF1QixTQUF2QjtBQUNoQyxRQUFBO0lBQUEsUUFBQSxHQUFXLHFCQUFBLENBQXNCLE1BQXRCLEVBQThCLEtBQU0sQ0FBQSxLQUFBLENBQXBDLEVBQTRDLFNBQTVDO0FBQ1gsWUFBTyxLQUFQO0FBQUEsV0FDTyxPQURQO2VBRVEsSUFBQSxLQUFBLENBQU0sUUFBTixFQUFnQixLQUFLLENBQUMsR0FBdEI7QUFGUixXQUdPLEtBSFA7ZUFJUSxJQUFBLEtBQUEsQ0FBTSxLQUFLLENBQUMsS0FBWixFQUFtQixRQUFuQjtBQUpSO0VBRmdDOztFQVFsQyxVQUFBLEdBQWEsU0FBQyxJQUFELEVBQU8sRUFBUDtXQUNQLElBQUEsT0FBQSxDQUFRLFNBQUMsT0FBRDtBQUNWLFVBQUE7TUFBQSxJQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4QixJQUE5QixDQUFIO1FBQ0UsR0FBQSxHQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWQsQ0FBK0IsSUFBL0I7ZUFDTixPQUFBLENBQVEsR0FBUixFQUZGO09BQUEsTUFBQTtlQUlFLFVBQUEsR0FBYSxJQUFJLENBQUMsUUFBUSxDQUFDLG9CQUFkLENBQW1DLFNBQUMsR0FBRDtVQUM5QyxJQUFHLEdBQUcsQ0FBQyxJQUFKLEtBQVksSUFBZjtZQUNFLFVBQVUsQ0FBQyxPQUFYLENBQUE7bUJBQ0EsT0FBQSxDQUFRLEdBQVIsRUFGRjs7UUFEOEMsQ0FBbkMsRUFKZjs7SUFEVSxDQUFSO0VBRE87O0VBV2IsbUJBQUEsR0FBc0IsU0FBQyxNQUFELEVBQVMsSUFBVDtJQUNwQixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsTUFBTSxDQUFDLE9BQTlCLEVBQXVDLG1CQUF2QztXQUNBLFVBQUEsQ0FBVyxrQkFBWCxDQUE4QixDQUFDLElBQS9CLENBQW9DLFNBQUMsR0FBRDtBQUNsQyxVQUFBO01BQUMsa0JBQW1CLEdBQUcsQ0FBQztNQUN4QixJQUFHLHVCQUFIO1FBQ0UsZUFBZSxDQUFDLFVBQVUsQ0FBQyxPQUEzQixDQUFtQyxJQUFuQztlQUNBLGVBQWUsQ0FBQyxPQUFoQixDQUFBLEVBRkY7O0lBRmtDLENBQXBDO0VBRm9COztFQVF0QixXQUFBLEdBQWMsU0FBQyxNQUFELEVBQVMsR0FBVDtBQUNaLFFBQUE7eUJBRHFCLE1BQVcsSUFBVixnQkFBSztJQUMzQixJQUFrQyxXQUFsQztNQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsR0FBTCxDQUFTLE1BQVQsRUFBaUIsR0FBakIsRUFBVDs7SUFDQSxJQUFrQyxXQUFsQztNQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsR0FBTCxDQUFTLE1BQVQsRUFBaUIsR0FBakIsRUFBVDs7V0FDQTtFQUhZOztFQUtkLHNCQUFBLEdBQXlCLFNBQUMsTUFBRCxFQUFTLEtBQVQ7QUFDdkIsUUFBQTtBQUFBLFNBQUEsd0NBQUE7O1VBQXlCLEtBQUssQ0FBQyxhQUFOLENBQW9CLEtBQXBCO0FBQ3ZCLGVBQU87O0FBRFQ7V0FFQTtFQUh1Qjs7RUFLekIsY0FBQSxHQUFpQixTQUFDLEVBQUQ7V0FDZixTQUFBO0FBQ0UsVUFBQTtNQUREO2FBQ0MsQ0FBSSxFQUFBLGFBQUcsSUFBSDtJQUROO0VBRGU7O0VBSWpCLE9BQUEsR0FBVSxTQUFDLE1BQUQ7V0FBWSxNQUFNLENBQUMsT0FBUCxDQUFBO0VBQVo7O0VBQ1YsVUFBQSxHQUFhLGNBQUEsQ0FBZSxPQUFmOztFQUViLGlCQUFBLEdBQW9CLFNBQUMsS0FBRDtXQUFXLEtBQUssQ0FBQyxZQUFOLENBQUE7RUFBWDs7RUFDcEIsb0JBQUEsR0FBdUIsY0FBQSxDQUFlLGlCQUFmOztFQUV2Qix3QkFBQSxHQUEyQixTQUFDLE1BQUQsRUFBUyxLQUFUO1dBQW1CLFVBQVUsQ0FBQyxJQUFYLENBQWdCLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixLQUE1QixDQUFoQjtFQUFuQjs7RUFDM0IsMkJBQUEsR0FBOEIsY0FBQSxDQUFlLHdCQUFmOztFQUU5QixrQkFBQSxHQUFxQixTQUFDLE1BQUQsRUFBUyxLQUFUO0FBQ25CLFFBQUE7SUFBQSxLQUFBLEdBQVEsS0FBSyxDQUFDLFVBQU4sQ0FBaUIsS0FBakI7SUFDUixLQUFBLEdBQVEsaUNBQUEsQ0FBa0MsTUFBbEMsRUFBMEMsS0FBSyxDQUFDLEtBQWhELEVBQXVELENBQXZEO1dBQ1IsS0FBSyxDQUFDLFFBQU4sQ0FBZSxJQUFmLENBQUEsSUFBeUIsQ0FBSSxLQUFLLENBQUMsUUFBTixDQUFlLE1BQWY7RUFIVjs7RUFLckIsMEJBQUEsR0FBNkIsU0FBQyxNQUFELEVBQVMsS0FBVCxFQUFnQixJQUFoQjtXQUMzQixNQUFNLENBQUMsb0JBQVAsQ0FBNEIsQ0FBQyxLQUFELEVBQVEsS0FBUixDQUE1QixFQUE0QyxJQUE1QztFQUQyQjs7RUFHN0IsaUNBQUEsR0FBb0MsU0FBQyxNQUFELEVBQVMsR0FBVDtBQUNsQyxRQUFBO0lBQUEsSUFBQSxDQUFPLDZCQUFBLENBQThCLE1BQTlCLEVBQXNDLEdBQXRDLENBQVA7TUFDRSxHQUFBLEdBQU0sd0JBQUEsQ0FBeUIsTUFBekIsRUFBaUMsR0FBakM7YUFDTiwwQkFBQSxDQUEyQixNQUEzQixFQUFtQyxHQUFuQyxFQUF3QyxJQUF4QyxFQUZGOztFQURrQzs7RUFLcEMsZUFBQSxHQUFrQixTQUFDLEVBQUQsRUFBSyxJQUFMO0FBQ2hCLFFBQUE7O01BQUEsT0FBUSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBQSxDQUE4QixDQUFDLFlBQS9CLENBQUEsQ0FBNkMsQ0FBQyxPQUE5QyxDQUFBOztJQUNSLElBQUcscUJBQUg7TUFDRSxFQUFBLENBQUcsSUFBSDtBQUVBO0FBQUE7V0FBQSxzQ0FBQTs7c0JBQ0UsZUFBQSxDQUFnQixFQUFoQixFQUFvQixLQUFwQjtBQURGO3NCQUhGOztFQUZnQjs7RUFRbEIsZUFBQSxHQUFrQixTQUFBO0FBQ2hCLFFBQUE7SUFEaUIsdUJBQVEsd0JBQVM7V0FDbEMsUUFBQSxPQUFPLENBQUMsU0FBUixDQUFrQixDQUFBLE1BQUEsQ0FBbEIsYUFBMEIsVUFBMUI7RUFEZ0I7O0VBR2xCLFlBQUEsR0FBZSxlQUFlLENBQUMsSUFBaEIsQ0FBcUIsSUFBckIsRUFBMkIsS0FBM0I7O0VBQ2YsZUFBQSxHQUFrQixlQUFlLENBQUMsSUFBaEIsQ0FBcUIsSUFBckIsRUFBMkIsUUFBM0I7O0VBQ2xCLGVBQUEsR0FBa0IsZUFBZSxDQUFDLElBQWhCLENBQXFCLElBQXJCLEVBQTJCLFFBQTNCOztFQUVsQixzQkFBQSxHQUF5QixTQUFDLElBQUQ7QUFDdkIsUUFBQTtJQUFBLFNBQUEsR0FBWSxJQUFJLENBQUMsV0FBTCxDQUFBO0lBQ1osSUFBRyxTQUFBLEtBQWEsSUFBaEI7YUFDRSxJQUFJLENBQUMsV0FBTCxDQUFBLEVBREY7S0FBQSxNQUFBO2FBR0UsVUFIRjs7RUFGdUI7O0VBT3pCLGtCQUFBLEdBQXFCLFNBQUMsSUFBRDtJQUNuQixJQUFHLElBQUksQ0FBQyxRQUFMLENBQWMsSUFBZCxDQUFIO2FBQ0UsSUFBSSxDQUFDLFNBQUwsQ0FBQSxDQUFnQixDQUFDLEtBQWpCLENBQXVCLFFBQXZCLEVBREY7S0FBQSxNQUFBO2FBR0UsSUFBSSxDQUFDLEtBQUwsQ0FBVyxRQUFYLEVBSEY7O0VBRG1COztFQU1yQix3QkFBQSxHQUEyQixTQUFDLEVBQUQsRUFBSyxVQUFMO0FBQ3pCLFFBQUE7SUFBQSxLQUFBLEdBQVEsVUFBVSxDQUFDLGFBQVgsQ0FBQTtXQUNSLFVBQVUsQ0FBQyxhQUFYLENBQXlCLENBQUMsQ0FBQyxRQUFGLENBQVc7TUFBQyxDQUFBLEtBQUEsQ0FBQSxFQUFPLEVBQUEsQ0FBRyxLQUFLLEVBQUMsS0FBRCxFQUFSLENBQVI7S0FBWCxFQUFxQyxLQUFyQyxDQUF6QjtFQUZ5Qjs7RUFjM0IsbUJBQUEsR0FBc0IsU0FBQyxNQUFELEVBQVMsS0FBVDtBQUNwQixRQUFBO0lBQUEsSUFBRyxpQkFBQSxDQUFrQixLQUFsQixDQUFBLElBQTRCLGVBQUEsQ0FBZ0IsS0FBaEIsQ0FBL0I7QUFDRSxhQUFPLE1BRFQ7O0lBR0MsbUJBQUQsRUFBUTtJQUNSLElBQUcsa0JBQUEsQ0FBbUIsTUFBbkIsRUFBMkIsS0FBM0IsQ0FBSDtNQUNFLFFBQUEsR0FBVyxLQUFLLENBQUMsUUFBTixDQUFlLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBZixFQURiOztJQUdBLElBQUcsa0JBQUEsQ0FBbUIsTUFBbkIsRUFBMkIsR0FBM0IsQ0FBSDtNQUNFLE1BQUEsR0FBUyxHQUFHLENBQUMsUUFBSixDQUFhLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBYixFQURYOztJQUdBLElBQUcsa0JBQUEsSUFBYSxnQkFBaEI7YUFDTSxJQUFBLEtBQUEsb0JBQU0sV0FBVyxLQUFqQixtQkFBd0IsU0FBUyxHQUFqQyxFQUROO0tBQUEsTUFBQTthQUdFLE1BSEY7O0VBWG9COztFQW9CdEIsd0JBQUEsR0FBMkIsU0FBQyxNQUFELEVBQVMsS0FBVDtBQUN6QixRQUFBO0lBQUMsbUJBQUQsRUFBUTtJQUVSLE1BQUEsR0FBUztJQUNULFNBQUEsR0FBWSxDQUFDLEdBQUQsRUFBTSx3QkFBQSxDQUF5QixNQUF6QixFQUFpQyxHQUFHLENBQUMsR0FBckMsQ0FBTjtJQUNaLE1BQU0sQ0FBQyxpQkFBUCxDQUF5QixJQUF6QixFQUErQixTQUEvQixFQUEwQyxTQUFDLEdBQUQ7QUFBYSxVQUFBO01BQVgsUUFBRDthQUFZLE1BQUEsR0FBUyxLQUFLLENBQUM7SUFBNUIsQ0FBMUM7SUFFQSxxQkFBRyxNQUFNLENBQUUsYUFBUixDQUFzQixHQUF0QixVQUFIO0FBQ0UsYUFBVyxJQUFBLEtBQUEsQ0FBTSxLQUFOLEVBQWEsTUFBYixFQURiOztJQUdBLFFBQUEsR0FBVztJQUNYLFNBQUEsR0FBWSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQVAsRUFBWSxDQUFaLENBQUQsRUFBaUIsS0FBSyxDQUFDLEtBQXZCO0lBQ1osTUFBTSxDQUFDLDBCQUFQLENBQWtDLElBQWxDLEVBQXdDLFNBQXhDLEVBQW1ELFNBQUMsR0FBRDtBQUFhLFVBQUE7TUFBWCxRQUFEO2FBQVksUUFBQSxHQUFXLEtBQUssQ0FBQztJQUE5QixDQUFuRDtJQUVBLHVCQUFHLFFBQVEsQ0FBRSxVQUFWLENBQXFCLEtBQXJCLFVBQUg7QUFDRSxhQUFXLElBQUEsS0FBQSxDQUFNLFFBQU4sRUFBZ0IsR0FBaEIsRUFEYjs7QUFHQSxXQUFPO0VBakJrQjs7RUFtQjNCLHFCQUFBLEdBQXdCLFNBQUMsTUFBRCxFQUFTLFNBQVQsRUFBb0IsT0FBcEIsRUFBNkIsT0FBN0IsRUFBeUMsRUFBekM7QUFDdEIsUUFBQTs7TUFEbUQsVUFBUTs7SUFDMUQscUNBQUQsRUFBZ0IsbUJBQWhCLEVBQXNCO0lBQ3RCLElBQU8sY0FBSixJQUFrQixtQkFBckI7QUFDRSxZQUFVLElBQUEsS0FBQSxDQUFNLGtEQUFOLEVBRFo7O0lBR0EsSUFBRyxTQUFIO01BQ0UsYUFBQSxHQUFnQixLQURsQjtLQUFBLE1BQUE7O1FBR0UsZ0JBQWlCO09BSG5COztJQUlBLElBQWlDLFlBQWpDO01BQUEsSUFBQSxHQUFPLEtBQUssQ0FBQyxVQUFOLENBQWlCLElBQWpCLEVBQVA7O0FBQ0EsWUFBTyxTQUFQO0FBQUEsV0FDTyxTQURQOztVQUVJLFlBQWlCLElBQUEsS0FBQSxDQUFNLElBQU4sRUFBWSx1QkFBQSxDQUF3QixNQUF4QixDQUFaOztRQUNqQixZQUFBLEdBQWU7QUFGWjtBQURQLFdBSU8sVUFKUDs7VUFLSSxZQUFpQixJQUFBLEtBQUEsQ0FBTSxDQUFDLENBQUQsRUFBSSxDQUFKLENBQU4sRUFBYyxJQUFkOztRQUNqQixZQUFBLEdBQWU7QUFObkI7V0FRQSxNQUFPLENBQUEsWUFBQSxDQUFQLENBQXFCLE9BQXJCLEVBQThCLFNBQTlCLEVBQXlDLFNBQUMsS0FBRDtNQUN2QyxJQUFHLENBQUksYUFBSixJQUFzQixLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFsQixLQUEyQixJQUFJLENBQUMsR0FBekQ7UUFDRSxLQUFLLENBQUMsSUFBTixDQUFBO0FBQ0EsZUFGRjs7YUFHQSxFQUFBLENBQUcsS0FBSDtJQUp1QyxDQUF6QztFQWxCc0I7O0VBd0J4QixNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUNmLHFCQUFBLG1CQURlO0lBRWYsY0FBQSxZQUZlO0lBR2YseUJBQUEsdUJBSGU7SUFJZixTQUFBLE9BSmU7SUFLZixPQUFBLEtBTGU7SUFNZixpQkFBQSxlQU5lO0lBT2YsaUJBQUEsZUFQZTtJQVFmLDJCQUFBLHlCQVJlO0lBU2YsWUFBQSxVQVRlO0lBVWYsVUFBQSxRQVZlO0lBV2YsdUJBQUEscUJBWGU7SUFZZixtQkFBQSxpQkFaZTtJQWFmLG9CQUFBLGtCQWJlO0lBY2YscUJBQUEsbUJBZGU7SUFlZixpQ0FBQSwrQkFmZTtJQWdCZix1QkFBQSxxQkFoQmU7SUFpQmYseUJBQUEsdUJBakJlO0lBa0JmLHlCQUFBLHVCQWxCZTtJQW1CZixxQkFBQSxtQkFuQmU7SUFvQmYscUJBQUEsbUJBcEJlO0lBcUJmLGNBQUEsWUFyQmU7SUFzQmYsaUJBQUEsZUF0QmU7SUF1QmYsZ0JBQUEsY0F2QmU7SUF3QmYsaUJBQUEsZUF4QmU7SUF5QmYsb0JBQUEsa0JBekJlO0lBMEJmLHNCQUFBLG9CQTFCZTtJQTJCZiwwQkFBQSx3QkEzQmU7SUE0QmYsMEJBQUEsd0JBNUJlO0lBNkJmLHlCQUFBLHVCQTdCZTtJQThCZixzQkFBQSxvQkE5QmU7SUErQmYsc0JBQUEsb0JBL0JlO0lBZ0NmLGlDQUFBLCtCQWhDZTtJQWlDZiw2QkFBQSwyQkFqQ2U7SUFrQ2YsNEJBQUEsMEJBbENlO0lBbUNmLHNCQUFBLG9CQW5DZTtJQW9DZiwrQkFBQSw2QkFwQ2U7SUFxQ2YsWUFBQSxVQXJDZTtJQXNDZixzQkFBQSxvQkF0Q2U7SUF1Q2YscUNBQUEsbUNBdkNlO0lBd0NmLDJCQUFBLHlCQXhDZTtJQXlDZixXQUFBLFNBekNlO0lBMENmLHVDQUFBLHFDQTFDZTtJQTJDZiw4QkFBQSw0QkEzQ2U7SUE0Q2Ysa0NBQUEsZ0NBNUNlO0lBNkNmLGVBQUEsYUE3Q2U7SUE4Q2YsNkJBQUEsMkJBOUNlO0lBK0NmLGFBQUEsV0EvQ2U7SUFnRGYsc0JBQUEsb0JBaERlO0lBaURmLG9CQUFBLGtCQWpEZTtJQWtEZixrQkFBQSxnQkFsRGU7SUFtRGYsb0NBQUEsa0NBbkRlO0lBb0RmLDJDQUFBLHlDQXBEZTtJQXFEZixnQ0FBQSw4QkFyRGU7SUFzRGYsbUNBQUEsaUNBdERlO0lBdURmLCtCQUFBLDZCQXZEZTtJQXdEZiwrQkFBQSw2QkF4RGU7SUF5RGYsWUFBQSxVQXpEZTtJQTBEZix5QkFBQSx1QkExRGU7SUEyRGYsc0JBQUEsb0JBM0RlO0lBNERmLHNDQUFBLG9DQTVEZTtJQTZEZix1QkFBQSxxQkE3RGU7SUE4RGYsaUNBQUEsK0JBOURlO0lBK0RmLFlBQUEsVUEvRGU7SUFnRWYscUJBQUEsbUJBaEVlO0lBaUVmLGFBQUEsV0FqRWU7SUFrRWYsd0JBQUEsc0JBbEVlO0lBb0VmLFNBQUEsT0FwRWU7SUFvRU4sWUFBQSxVQXBFTTtJQXFFZixtQkFBQSxpQkFyRWU7SUFxRUksc0JBQUEsb0JBckVKO0lBdUVmLDRCQUFBLDBCQXZFZTtJQXdFZixtQ0FBQSxpQ0F4RWU7SUF5RWYsMEJBQUEsd0JBekVlO0lBMEVmLDZCQUFBLDJCQTFFZTtJQTJFZixvQkFBQSxrQkEzRWU7SUE2RWYsaUJBQUEsZUE3RWU7SUE4RWYsY0FBQSxZQTlFZTtJQStFZixpQkFBQSxlQS9FZTtJQWdGZixpQkFBQSxlQWhGZTtJQWlGZix3QkFBQSxzQkFqRmU7SUFrRmYsb0JBQUEsa0JBbEZlO0lBbUZmLDBCQUFBLHdCQW5GZTtJQW9GZixxQkFBQSxtQkFwRmU7SUFxRmYsMEJBQUEsd0JBckZlO0lBc0ZmLHVCQUFBLHFCQXRGZTs7QUE3dkJqQiIsInNvdXJjZXNDb250ZW50IjpbImZzID0gcmVxdWlyZSAnZnMtcGx1cydcbnNldHRpbmdzID0gcmVxdWlyZSAnLi9zZXR0aW5ncydcblxue0Rpc3Bvc2FibGUsIFJhbmdlLCBQb2ludH0gPSByZXF1aXJlICdhdG9tJ1xuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcblxuYXNzZXJ0V2l0aEV4Y2VwdGlvbiA9IChjb25kaXRpb24sIG1lc3NhZ2UsIGZuKSAtPlxuICBhdG9tLmFzc2VydCBjb25kaXRpb24sIG1lc3NhZ2UsIChlcnJvcikgLT5cbiAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3IubWVzc2FnZSlcblxuZ2V0QW5jZXN0b3JzID0gKG9iaikgLT5cbiAgYW5jZXN0b3JzID0gW11cbiAgY3VycmVudCA9IG9ialxuICBsb29wXG4gICAgYW5jZXN0b3JzLnB1c2goY3VycmVudClcbiAgICBjdXJyZW50ID0gY3VycmVudC5fX3N1cGVyX18/LmNvbnN0cnVjdG9yXG4gICAgYnJlYWsgdW5sZXNzIGN1cnJlbnRcbiAgYW5jZXN0b3JzXG5cbmdldEtleUJpbmRpbmdGb3JDb21tYW5kID0gKGNvbW1hbmQsIHtwYWNrYWdlTmFtZX0pIC0+XG4gIHJlc3VsdHMgPSBudWxsXG4gIGtleW1hcHMgPSBhdG9tLmtleW1hcHMuZ2V0S2V5QmluZGluZ3MoKVxuICBpZiBwYWNrYWdlTmFtZT9cbiAgICBrZXltYXBQYXRoID0gYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKHBhY2thZ2VOYW1lKS5nZXRLZXltYXBQYXRocygpLnBvcCgpXG4gICAga2V5bWFwcyA9IGtleW1hcHMuZmlsdGVyKCh7c291cmNlfSkgLT4gc291cmNlIGlzIGtleW1hcFBhdGgpXG5cbiAgZm9yIGtleW1hcCBpbiBrZXltYXBzIHdoZW4ga2V5bWFwLmNvbW1hbmQgaXMgY29tbWFuZFxuICAgIHtrZXlzdHJva2VzLCBzZWxlY3Rvcn0gPSBrZXltYXBcbiAgICBrZXlzdHJva2VzID0ga2V5c3Ryb2tlcy5yZXBsYWNlKC9zaGlmdC0vLCAnJylcbiAgICAocmVzdWx0cyA/PSBbXSkucHVzaCh7a2V5c3Ryb2tlcywgc2VsZWN0b3J9KVxuICByZXN1bHRzXG5cbiMgSW5jbHVkZSBtb2R1bGUob2JqZWN0IHdoaWNoIG5vcm1hbHkgcHJvdmlkZXMgc2V0IG9mIG1ldGhvZHMpIHRvIGtsYXNzXG5pbmNsdWRlID0gKGtsYXNzLCBtb2R1bGUpIC0+XG4gIGZvciBrZXksIHZhbHVlIG9mIG1vZHVsZVxuICAgIGtsYXNzOjpba2V5XSA9IHZhbHVlXG5cbmRlYnVnID0gKG1lc3NhZ2VzLi4uKSAtPlxuICByZXR1cm4gdW5sZXNzIHNldHRpbmdzLmdldCgnZGVidWcnKVxuICBzd2l0Y2ggc2V0dGluZ3MuZ2V0KCdkZWJ1Z091dHB1dCcpXG4gICAgd2hlbiAnY29uc29sZSdcbiAgICAgIGNvbnNvbGUubG9nIG1lc3NhZ2VzLi4uXG4gICAgd2hlbiAnZmlsZSdcbiAgICAgIGZpbGVQYXRoID0gZnMubm9ybWFsaXplIHNldHRpbmdzLmdldCgnZGVidWdPdXRwdXRGaWxlUGF0aCcpXG4gICAgICBpZiBmcy5leGlzdHNTeW5jKGZpbGVQYXRoKVxuICAgICAgICBmcy5hcHBlbmRGaWxlU3luYyBmaWxlUGF0aCwgbWVzc2FnZXMgKyBcIlxcblwiXG5cbiMgUmV0dXJuIGZ1bmN0aW9uIHRvIHJlc3RvcmUgZWRpdG9yJ3Mgc2Nyb2xsVG9wIGFuZCBmb2xkIHN0YXRlLlxuc2F2ZUVkaXRvclN0YXRlID0gKGVkaXRvcikgLT5cbiAgZWRpdG9yRWxlbWVudCA9IGVkaXRvci5lbGVtZW50XG4gIHNjcm9sbFRvcCA9IGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKClcblxuICBmb2xkU3RhcnRSb3dzID0gZWRpdG9yLmRpc3BsYXlMYXllci5mb2xkc01hcmtlckxheWVyLmZpbmRNYXJrZXJzKHt9KS5tYXAgKG0pIC0+IG0uZ2V0U3RhcnRQb3NpdGlvbigpLnJvd1xuICAtPlxuICAgIGZvciByb3cgaW4gZm9sZFN0YXJ0Um93cy5yZXZlcnNlKCkgd2hlbiBub3QgZWRpdG9yLmlzRm9sZGVkQXRCdWZmZXJSb3cocm93KVxuICAgICAgZWRpdG9yLmZvbGRCdWZmZXJSb3cocm93KVxuICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKHNjcm9sbFRvcClcblxuaXNMaW5ld2lzZVJhbmdlID0gKHtzdGFydCwgZW5kfSkgLT5cbiAgKHN0YXJ0LnJvdyBpc250IGVuZC5yb3cpIGFuZCAoc3RhcnQuY29sdW1uIGlzIGVuZC5jb2x1bW4gaXMgMClcblxuaXNFbmRzV2l0aE5ld0xpbmVGb3JCdWZmZXJSb3cgPSAoZWRpdG9yLCByb3cpIC0+XG4gIHtzdGFydCwgZW5kfSA9IGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhyb3csIGluY2x1ZGVOZXdsaW5lOiB0cnVlKVxuICBzdGFydC5yb3cgaXNudCBlbmQucm93XG5cbmhhdmVTb21lTm9uRW1wdHlTZWxlY3Rpb24gPSAoZWRpdG9yKSAtPlxuICBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpLnNvbWUoaXNOb3RFbXB0eSlcblxuc29ydFJhbmdlcyA9IChjb2xsZWN0aW9uKSAtPlxuICBjb2xsZWN0aW9uLnNvcnQgKGEsIGIpIC0+IGEuY29tcGFyZShiKVxuXG4jIFJldHVybiBhZGp1c3RlZCBpbmRleCBmaXQgd2hpdGluIGdpdmVuIGxpc3QncyBsZW5ndGhcbiMgcmV0dXJuIC0xIGlmIGxpc3QgaXMgZW1wdHkuXG5nZXRJbmRleCA9IChpbmRleCwgbGlzdCkgLT5cbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGhcbiAgaWYgbGVuZ3RoIGlzIDBcbiAgICAtMVxuICBlbHNlXG4gICAgaW5kZXggPSBpbmRleCAlIGxlbmd0aFxuICAgIGlmIGluZGV4ID49IDBcbiAgICAgIGluZGV4XG4gICAgZWxzZVxuICAgICAgbGVuZ3RoICsgaW5kZXhcblxuIyBOT1RFOiBlbmRSb3cgYmVjb21lIHVuZGVmaW5lZCBpZiBAZWRpdG9yRWxlbWVudCBpcyBub3QgeWV0IGF0dGFjaGVkLlxuIyBlLmcuIEJlZ2luZyBjYWxsZWQgaW1tZWRpYXRlbHkgYWZ0ZXIgb3BlbiBmaWxlLlxuZ2V0VmlzaWJsZUJ1ZmZlclJhbmdlID0gKGVkaXRvcikgLT5cbiAgW3N0YXJ0Um93LCBlbmRSb3ddID0gZWRpdG9yLmVsZW1lbnQuZ2V0VmlzaWJsZVJvd1JhbmdlKClcbiAgcmV0dXJuIG51bGwgdW5sZXNzIChzdGFydFJvdz8gYW5kIGVuZFJvdz8pXG4gIHN0YXJ0Um93ID0gZWRpdG9yLmJ1ZmZlclJvd0ZvclNjcmVlblJvdyhzdGFydFJvdylcbiAgZW5kUm93ID0gZWRpdG9yLmJ1ZmZlclJvd0ZvclNjcmVlblJvdyhlbmRSb3cpXG4gIG5ldyBSYW5nZShbc3RhcnRSb3csIDBdLCBbZW5kUm93LCBJbmZpbml0eV0pXG5cbmdldFZpc2libGVFZGl0b3JzID0gLT5cbiAgKGVkaXRvciBmb3IgcGFuZSBpbiBhdG9tLndvcmtzcGFjZS5nZXRQYW5lcygpIHdoZW4gZWRpdG9yID0gcGFuZS5nZXRBY3RpdmVFZGl0b3IoKSlcblxuZ2V0RW5kT2ZMaW5lRm9yQnVmZmVyUm93ID0gKGVkaXRvciwgcm93KSAtPlxuICBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocm93KS5lbmRcblxuIyBQb2ludCB1dGlsXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbnBvaW50SXNBdEVuZE9mTGluZSA9IChlZGl0b3IsIHBvaW50KSAtPlxuICBwb2ludCA9IFBvaW50LmZyb21PYmplY3QocG9pbnQpXG4gIGdldEVuZE9mTGluZUZvckJ1ZmZlclJvdyhlZGl0b3IsIHBvaW50LnJvdykuaXNFcXVhbChwb2ludClcblxucG9pbnRJc09uV2hpdGVTcGFjZSA9IChlZGl0b3IsIHBvaW50KSAtPlxuICBjaGFyID0gZ2V0UmlnaHRDaGFyYWN0ZXJGb3JCdWZmZXJQb3NpdGlvbihlZGl0b3IsIHBvaW50KVxuICBub3QgL1xcUy8udGVzdChjaGFyKVxuXG5wb2ludElzQXRFbmRPZkxpbmVBdE5vbkVtcHR5Um93ID0gKGVkaXRvciwgcG9pbnQpIC0+XG4gIHBvaW50ID0gUG9pbnQuZnJvbU9iamVjdChwb2ludClcbiAgcG9pbnQuY29sdW1uIGlzbnQgMCBhbmQgcG9pbnRJc0F0RW5kT2ZMaW5lKGVkaXRvciwgcG9pbnQpXG5cbnBvaW50SXNBdFZpbUVuZE9mRmlsZSA9IChlZGl0b3IsIHBvaW50KSAtPlxuICBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbihlZGl0b3IpLmlzRXF1YWwocG9pbnQpXG5cbmlzRW1wdHlSb3cgPSAoZWRpdG9yLCByb3cpIC0+XG4gIGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhyb3cpLmlzRW1wdHkoKVxuXG5nZXRSaWdodENoYXJhY3RlckZvckJ1ZmZlclBvc2l0aW9uID0gKGVkaXRvciwgcG9pbnQsIGFtb3VudD0xKSAtPlxuICBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoUmFuZ2UuZnJvbVBvaW50V2l0aERlbHRhKHBvaW50LCAwLCBhbW91bnQpKVxuXG5nZXRMZWZ0Q2hhcmFjdGVyRm9yQnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCwgYW1vdW50PTEpIC0+XG4gIGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShSYW5nZS5mcm9tUG9pbnRXaXRoRGVsdGEocG9pbnQsIDAsIC1hbW91bnQpKVxuXG5nZXRUZXh0SW5TY3JlZW5SYW5nZSA9IChlZGl0b3IsIHNjcmVlblJhbmdlKSAtPlxuICBidWZmZXJSYW5nZSA9IGVkaXRvci5idWZmZXJSYW5nZUZvclNjcmVlblJhbmdlKHNjcmVlblJhbmdlKVxuICBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoYnVmZmVyUmFuZ2UpXG5cbmdldE5vbldvcmRDaGFyYWN0ZXJzRm9yQ3Vyc29yID0gKGN1cnNvcikgLT5cbiAgIyBBdG9tIDEuMTEuMC1iZXRhNSBoYXZlIHRoaXMgZXhwZXJpbWVudGFsIG1ldGhvZC5cbiAgaWYgY3Vyc29yLmdldE5vbldvcmRDaGFyYWN0ZXJzP1xuICAgIGN1cnNvci5nZXROb25Xb3JkQ2hhcmFjdGVycygpXG4gIGVsc2VcbiAgICBzY29wZSA9IGN1cnNvci5nZXRTY29wZURlc2NyaXB0b3IoKS5nZXRTY29wZXNBcnJheSgpXG4gICAgYXRvbS5jb25maWcuZ2V0KCdlZGl0b3Iubm9uV29yZENoYXJhY3RlcnMnLCB7c2NvcGV9KVxuXG4jIEZJWE1FOiByZW1vdmUgdGhpc1xuIyByZXR1cm4gdHJ1ZSBpZiBtb3ZlZFxubW92ZUN1cnNvclRvTmV4dE5vbldoaXRlc3BhY2UgPSAoY3Vyc29yKSAtPlxuICBvcmlnaW5hbFBvaW50ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgZWRpdG9yID0gY3Vyc29yLmVkaXRvclxuICB2aW1Fb2YgPSBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbihlZGl0b3IpXG5cbiAgd2hpbGUgcG9pbnRJc09uV2hpdGVTcGFjZShlZGl0b3IsIHBvaW50ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpIGFuZCBub3QgcG9pbnQuaXNHcmVhdGVyVGhhbk9yRXF1YWwodmltRW9mKVxuICAgIGN1cnNvci5tb3ZlUmlnaHQoKVxuICBub3Qgb3JpZ2luYWxQb2ludC5pc0VxdWFsKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuXG5nZXRCdWZmZXJSb3dzID0gKGVkaXRvciwge3N0YXJ0Um93LCBkaXJlY3Rpb259KSAtPlxuICBzd2l0Y2ggZGlyZWN0aW9uXG4gICAgd2hlbiAncHJldmlvdXMnXG4gICAgICBpZiBzdGFydFJvdyA8PSAwXG4gICAgICAgIFtdXG4gICAgICBlbHNlXG4gICAgICAgIFsoc3RhcnRSb3cgLSAxKS4uMF1cbiAgICB3aGVuICduZXh0J1xuICAgICAgZW5kUm93ID0gZ2V0VmltTGFzdEJ1ZmZlclJvdyhlZGl0b3IpXG4gICAgICBpZiBzdGFydFJvdyA+PSBlbmRSb3dcbiAgICAgICAgW11cbiAgICAgIGVsc2VcbiAgICAgICAgWyhzdGFydFJvdyArIDEpLi5lbmRSb3ddXG5cbiMgUmV0dXJuIFZpbSdzIEVPRiBwb3NpdGlvbiByYXRoZXIgdGhhbiBBdG9tJ3MgRU9GIHBvc2l0aW9uLlxuIyBUaGlzIGZ1bmN0aW9uIGNoYW5nZSBtZWFuaW5nIG9mIEVPRiBmcm9tIG5hdGl2ZSBUZXh0RWRpdG9yOjpnZXRFb2ZCdWZmZXJQb3NpdGlvbigpXG4jIEF0b20gaXMgc3BlY2lhbChzdHJhbmdlKSBmb3IgY3Vyc29yIGNhbiBwYXN0IHZlcnkgbGFzdCBuZXdsaW5lIGNoYXJhY3Rlci5cbiMgQmVjYXVzZSBvZiB0aGlzLCBBdG9tJ3MgRU9GIHBvc2l0aW9uIGlzIFthY3R1YWxMYXN0Um93KzEsIDBdIHByb3ZpZGVkIGxhc3Qtbm9uLWJsYW5rLXJvd1xuIyBlbmRzIHdpdGggbmV3bGluZSBjaGFyLlxuIyBCdXQgaW4gVmltLCBjdXJvciBjYW4gTk9UIHBhc3QgbGFzdCBuZXdsaW5lLiBFT0YgaXMgbmV4dCBwb3NpdGlvbiBvZiB2ZXJ5IGxhc3QgY2hhcmFjdGVyLlxuZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yKSAtPlxuICBlb2YgPSBlZGl0b3IuZ2V0RW9mQnVmZmVyUG9zaXRpb24oKVxuICBpZiAoZW9mLnJvdyBpcyAwKSBvciAoZW9mLmNvbHVtbiA+IDApXG4gICAgZW9mXG4gIGVsc2VcbiAgICBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3coZWRpdG9yLCBlb2Yucm93IC0gMSlcblxuZ2V0VmltRW9mU2NyZWVuUG9zaXRpb24gPSAoZWRpdG9yKSAtPlxuICBlZGl0b3Iuc2NyZWVuUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbihnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbihlZGl0b3IpKVxuXG5nZXRWaW1MYXN0QnVmZmVyUm93ID0gKGVkaXRvcikgLT4gZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oZWRpdG9yKS5yb3dcbmdldFZpbUxhc3RTY3JlZW5Sb3cgPSAoZWRpdG9yKSAtPiBnZXRWaW1Fb2ZTY3JlZW5Qb3NpdGlvbihlZGl0b3IpLnJvd1xuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93ID0gKGVkaXRvcikgLT4gZWRpdG9yLmVsZW1lbnQuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbmdldExhc3RWaXNpYmxlU2NyZWVuUm93ID0gKGVkaXRvcikgLT4gZWRpdG9yLmVsZW1lbnQuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKVxuXG5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93ID0gKGVkaXRvciwgcm93KSAtPlxuICByYW5nZSA9IGZpbmRSYW5nZUluQnVmZmVyUm93KGVkaXRvciwgL1xcUy8sIHJvdylcbiAgcmFuZ2U/LnN0YXJ0ID8gbmV3IFBvaW50KHJvdywgMClcblxudHJpbVJhbmdlID0gKGVkaXRvciwgc2NhblJhbmdlKSAtPlxuICBwYXR0ZXJuID0gL1xcUy9cbiAgW3N0YXJ0LCBlbmRdID0gW11cbiAgc2V0U3RhcnQgPSAoe3JhbmdlfSkgLT4ge3N0YXJ0fSA9IHJhbmdlXG4gIHNldEVuZCA9ICh7cmFuZ2V9KSAtPiB7ZW5kfSA9IHJhbmdlXG4gIGVkaXRvci5zY2FuSW5CdWZmZXJSYW5nZShwYXR0ZXJuLCBzY2FuUmFuZ2UsIHNldFN0YXJ0KVxuICBlZGl0b3IuYmFja3dhcmRzU2NhbkluQnVmZmVyUmFuZ2UocGF0dGVybiwgc2NhblJhbmdlLCBzZXRFbmQpIGlmIHN0YXJ0P1xuICBpZiBzdGFydD8gYW5kIGVuZD9cbiAgICBuZXcgUmFuZ2Uoc3RhcnQsIGVuZClcbiAgZWxzZVxuICAgIHNjYW5SYW5nZVxuXG4jIEN1cnNvciBtb3Rpb24gd3JhcHBlclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEp1c3QgdXBkYXRlIGJ1ZmZlclJvdyB3aXRoIGtlZXBpbmcgY29sdW1uIGJ5IHJlc3BlY3RpbmcgZ29hbENvbHVtblxuc2V0QnVmZmVyUm93ID0gKGN1cnNvciwgcm93LCBvcHRpb25zKSAtPlxuICBjb2x1bW4gPSBjdXJzb3IuZ29hbENvbHVtbiA/IGN1cnNvci5nZXRCdWZmZXJDb2x1bW4oKVxuICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW3JvdywgY29sdW1uXSwgb3B0aW9ucylcbiAgY3Vyc29yLmdvYWxDb2x1bW4gPSBjb2x1bW5cblxuc2V0QnVmZmVyQ29sdW1uID0gKGN1cnNvciwgY29sdW1uKSAtPlxuICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW2N1cnNvci5nZXRCdWZmZXJSb3coKSwgY29sdW1uXSlcblxubW92ZUN1cnNvciA9IChjdXJzb3IsIHtwcmVzZXJ2ZUdvYWxDb2x1bW59LCBmbikgLT5cbiAge2dvYWxDb2x1bW59ID0gY3Vyc29yXG4gIGZuKGN1cnNvcilcbiAgaWYgcHJlc2VydmVHb2FsQ29sdW1uIGFuZCBnb2FsQ29sdW1uP1xuICAgIGN1cnNvci5nb2FsQ29sdW1uID0gZ29hbENvbHVtblxuXG4jIFdvcmthcm91bmQgaXNzdWUgZm9yIHQ5bWQvdmltLW1vZGUtcGx1cyMyMjYgYW5kIGF0b20vYXRvbSMzMTc0XG4jIEkgY2Fubm90IGRlcGVuZCBjdXJzb3IncyBjb2x1bW4gc2luY2UgaXRzIGNsYWltIDAgYW5kIGNsaXBwaW5nIGVtbXVsYXRpb24gZG9uJ3RcbiMgcmV0dXJuIHdyYXBwZWQgbGluZSwgYnV0IEl0IGFjdHVhbGx5IHdyYXAsIHNvIEkgbmVlZCB0byBkbyB2ZXJ5IGRpcnR5IHdvcmsgdG9cbiMgcHJlZGljdCB3cmFwIGh1cmlzdGljYWxseS5cbnNob3VsZFByZXZlbnRXcmFwTGluZSA9IChjdXJzb3IpIC0+XG4gIHtyb3csIGNvbHVtbn0gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5zb2Z0VGFicycpXG4gICAgdGFiTGVuZ3RoID0gYXRvbS5jb25maWcuZ2V0KCdlZGl0b3IudGFiTGVuZ3RoJylcbiAgICBpZiAwIDwgY29sdW1uIDwgdGFiTGVuZ3RoXG4gICAgICB0ZXh0ID0gY3Vyc29yLmVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShbW3JvdywgMF0sIFtyb3csIHRhYkxlbmd0aF1dKVxuICAgICAgL15cXHMrJC8udGVzdCh0ZXh0KVxuICAgIGVsc2VcbiAgICAgIGZhbHNlXG5cbiMgb3B0aW9uczpcbiMgICBhbGxvd1dyYXA6IHRvIGNvbnRyb2xsIGFsbG93IHdyYXBcbiMgICBwcmVzZXJ2ZUdvYWxDb2x1bW46IHByZXNlcnZlIG9yaWdpbmFsIGdvYWxDb2x1bW5cbm1vdmVDdXJzb3JMZWZ0ID0gKGN1cnNvciwgb3B0aW9ucz17fSkgLT5cbiAge2FsbG93V3JhcCwgbmVlZFNwZWNpYWxDYXJlVG9QcmV2ZW50V3JhcExpbmV9ID0gb3B0aW9uc1xuICBkZWxldGUgb3B0aW9ucy5hbGxvd1dyYXBcbiAgaWYgbmVlZFNwZWNpYWxDYXJlVG9QcmV2ZW50V3JhcExpbmVcbiAgICByZXR1cm4gaWYgc2hvdWxkUHJldmVudFdyYXBMaW5lKGN1cnNvcilcblxuICBpZiBub3QgY3Vyc29yLmlzQXRCZWdpbm5pbmdPZkxpbmUoKSBvciBhbGxvd1dyYXBcbiAgICBtb3Rpb24gPSAoY3Vyc29yKSAtPiBjdXJzb3IubW92ZUxlZnQoKVxuICAgIG1vdmVDdXJzb3IoY3Vyc29yLCBvcHRpb25zLCBtb3Rpb24pXG5cbm1vdmVDdXJzb3JSaWdodCA9IChjdXJzb3IsIG9wdGlvbnM9e30pIC0+XG4gIHthbGxvd1dyYXB9ID0gb3B0aW9uc1xuICBkZWxldGUgb3B0aW9ucy5hbGxvd1dyYXBcbiAgaWYgbm90IGN1cnNvci5pc0F0RW5kT2ZMaW5lKCkgb3IgYWxsb3dXcmFwXG4gICAgbW90aW9uID0gKGN1cnNvcikgLT4gY3Vyc29yLm1vdmVSaWdodCgpXG4gICAgbW92ZUN1cnNvcihjdXJzb3IsIG9wdGlvbnMsIG1vdGlvbilcblxubW92ZUN1cnNvclVwU2NyZWVuID0gKGN1cnNvciwgb3B0aW9ucz17fSkgLT5cbiAgdW5sZXNzIGN1cnNvci5nZXRTY3JlZW5Sb3coKSBpcyAwXG4gICAgbW90aW9uID0gKGN1cnNvcikgLT4gY3Vyc29yLm1vdmVVcCgpXG4gICAgbW92ZUN1cnNvcihjdXJzb3IsIG9wdGlvbnMsIG1vdGlvbilcblxubW92ZUN1cnNvckRvd25TY3JlZW4gPSAoY3Vyc29yLCBvcHRpb25zPXt9KSAtPlxuICB1bmxlc3MgZ2V0VmltTGFzdFNjcmVlblJvdyhjdXJzb3IuZWRpdG9yKSBpcyBjdXJzb3IuZ2V0U2NyZWVuUm93KClcbiAgICBtb3Rpb24gPSAoY3Vyc29yKSAtPiBjdXJzb3IubW92ZURvd24oKVxuICAgIG1vdmVDdXJzb3IoY3Vyc29yLCBvcHRpb25zLCBtb3Rpb24pXG5cbiMgRklYTUVcbm1vdmVDdXJzb3JEb3duQnVmZmVyID0gKGN1cnNvcikgLT5cbiAgcG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICB1bmxlc3MgZ2V0VmltTGFzdEJ1ZmZlclJvdyhjdXJzb3IuZWRpdG9yKSBpcyBwb2ludC5yb3dcbiAgICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24ocG9pbnQudHJhbnNsYXRlKFsrMSwgMF0pKVxuXG4jIEZJWE1FXG5tb3ZlQ3Vyc29yVXBCdWZmZXIgPSAoY3Vyc29yKSAtPlxuICBwb2ludCA9IGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpXG4gIHVubGVzcyBwb2ludC5yb3cgaXMgMFxuICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludC50cmFuc2xhdGUoWy0xLCAwXSkpXG5cbm1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3cgPSAoY3Vyc29yLCByb3cpIC0+XG4gIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihbcm93LCAwXSlcbiAgY3Vyc29yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKClcblxuZ2V0VmFsaWRWaW1CdWZmZXJSb3cgPSAoZWRpdG9yLCByb3cpIC0+IGxpbWl0TnVtYmVyKHJvdywgbWluOiAwLCBtYXg6IGdldFZpbUxhc3RCdWZmZXJSb3coZWRpdG9yKSlcblxuZ2V0VmFsaWRWaW1TY3JlZW5Sb3cgPSAoZWRpdG9yLCByb3cpIC0+IGxpbWl0TnVtYmVyKHJvdywgbWluOiAwLCBtYXg6IGdldFZpbUxhc3RTY3JlZW5Sb3coZWRpdG9yKSlcblxuIyBCeSBkZWZhdWx0IG5vdCBpbmNsdWRlIGNvbHVtblxuZ2V0TGluZVRleHRUb0J1ZmZlclBvc2l0aW9uID0gKGVkaXRvciwge3JvdywgY29sdW1ufSwge2V4Y2x1c2l2ZX09e30pIC0+XG4gIGlmIGV4Y2x1c2l2ZSA/IHRydWVcbiAgICBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocm93KVswLi4uY29sdW1uXVxuICBlbHNlXG4gICAgZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJvdylbMC4uY29sdW1uXVxuXG5nZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgZWRpdG9yLmluZGVudExldmVsRm9yTGluZShlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocm93KSlcblxuZ2V0Q29kZUZvbGRSb3dSYW5nZXMgPSAoZWRpdG9yKSAtPlxuICBbMC4uZWRpdG9yLmdldExhc3RCdWZmZXJSb3coKV1cbiAgICAubWFwIChyb3cpIC0+XG4gICAgICBlZGl0b3IubGFuZ3VhZ2VNb2RlLnJvd1JhbmdlRm9yQ29kZUZvbGRBdEJ1ZmZlclJvdyhyb3cpXG4gICAgLmZpbHRlciAocm93UmFuZ2UpIC0+XG4gICAgICByb3dSYW5nZT8gYW5kIHJvd1JhbmdlWzBdPyBhbmQgcm93UmFuZ2VbMV0/XG5cbiMgVXNlZCBpbiB2bXAtamFzbWluZS1pbmNyZWFzZS1mb2N1c1xuZ2V0Q29kZUZvbGRSb3dSYW5nZXNDb250YWluZXNGb3JSb3cgPSAoZWRpdG9yLCBidWZmZXJSb3csIHtpbmNsdWRlU3RhcnRSb3d9PXt9KSAtPlxuICBpbmNsdWRlU3RhcnRSb3cgPz0gdHJ1ZVxuICBnZXRDb2RlRm9sZFJvd1JhbmdlcyhlZGl0b3IpLmZpbHRlciAoW3N0YXJ0Um93LCBlbmRSb3ddKSAtPlxuICAgIGlmIGluY2x1ZGVTdGFydFJvd1xuICAgICAgc3RhcnRSb3cgPD0gYnVmZmVyUm93IDw9IGVuZFJvd1xuICAgIGVsc2VcbiAgICAgIHN0YXJ0Um93IDwgYnVmZmVyUm93IDw9IGVuZFJvd1xuXG5nZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlID0gKGVkaXRvciwgcm93UmFuZ2UpIC0+XG4gIFtzdGFydFJhbmdlLCBlbmRSYW5nZV0gPSByb3dSYW5nZS5tYXAgKHJvdykgLT5cbiAgICBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocm93LCBpbmNsdWRlTmV3bGluZTogdHJ1ZSlcbiAgc3RhcnRSYW5nZS51bmlvbihlbmRSYW5nZSlcblxuZ2V0VG9rZW5pemVkTGluZUZvclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgZWRpdG9yLnRva2VuaXplZEJ1ZmZlci50b2tlbml6ZWRMaW5lRm9yUm93KHJvdylcblxuZ2V0U2NvcGVzRm9yVG9rZW5pemVkTGluZSA9IChsaW5lKSAtPlxuICBmb3IgdGFnIGluIGxpbmUudGFncyB3aGVuIHRhZyA8IDAgYW5kICh0YWcgJSAyIGlzIC0xKVxuICAgIGF0b20uZ3JhbW1hcnMuc2NvcGVGb3JJZCh0YWcpXG5cbnNjYW5Gb3JTY29wZVN0YXJ0ID0gKGVkaXRvciwgZnJvbVBvaW50LCBkaXJlY3Rpb24sIGZuKSAtPlxuICBmcm9tUG9pbnQgPSBQb2ludC5mcm9tT2JqZWN0KGZyb21Qb2ludClcbiAgc2NhblJvd3MgPSBzd2l0Y2ggZGlyZWN0aW9uXG4gICAgd2hlbiAnZm9yd2FyZCcgdGhlbiBbKGZyb21Qb2ludC5yb3cpLi5lZGl0b3IuZ2V0TGFzdEJ1ZmZlclJvdygpXVxuICAgIHdoZW4gJ2JhY2t3YXJkJyB0aGVuIFsoZnJvbVBvaW50LnJvdykuLjBdXG5cbiAgY29udGludWVTY2FuID0gdHJ1ZVxuICBzdG9wID0gLT5cbiAgICBjb250aW51ZVNjYW4gPSBmYWxzZVxuXG4gIGlzVmFsaWRUb2tlbiA9IHN3aXRjaCBkaXJlY3Rpb25cbiAgICB3aGVuICdmb3J3YXJkJyB0aGVuICh7cG9zaXRpb259KSAtPiBwb3NpdGlvbi5pc0dyZWF0ZXJUaGFuKGZyb21Qb2ludClcbiAgICB3aGVuICdiYWNrd2FyZCcgdGhlbiAoe3Bvc2l0aW9ufSkgLT4gcG9zaXRpb24uaXNMZXNzVGhhbihmcm9tUG9pbnQpXG5cbiAgZm9yIHJvdyBpbiBzY2FuUm93cyB3aGVuIHRva2VuaXplZExpbmUgPSBnZXRUb2tlbml6ZWRMaW5lRm9yUm93KGVkaXRvciwgcm93KVxuICAgIGNvbHVtbiA9IDBcbiAgICByZXN1bHRzID0gW11cblxuICAgIHRva2VuSXRlcmF0b3IgPSB0b2tlbml6ZWRMaW5lLmdldFRva2VuSXRlcmF0b3IoKVxuICAgIGZvciB0YWcgaW4gdG9rZW5pemVkTGluZS50YWdzXG4gICAgICB0b2tlbkl0ZXJhdG9yLm5leHQoKVxuICAgICAgaWYgdGFnIDwgMCAjIE5lZ2F0aXZlOiBzdGFydC9zdG9wIHRva2VuXG4gICAgICAgIHNjb3BlID0gYXRvbS5ncmFtbWFycy5zY29wZUZvcklkKHRhZylcbiAgICAgICAgaWYgKHRhZyAlIDIpIGlzIDAgIyBFdmVuOiBzY29wZSBzdG9wXG4gICAgICAgICAgbnVsbFxuICAgICAgICBlbHNlICMgT2RkOiBzY29wZSBzdGFydFxuICAgICAgICAgIHBvc2l0aW9uID0gbmV3IFBvaW50KHJvdywgY29sdW1uKVxuICAgICAgICAgIHJlc3VsdHMucHVzaCB7c2NvcGUsIHBvc2l0aW9uLCBzdG9wfVxuICAgICAgZWxzZVxuICAgICAgICBjb2x1bW4gKz0gdGFnXG5cbiAgICByZXN1bHRzID0gcmVzdWx0cy5maWx0ZXIoaXNWYWxpZFRva2VuKVxuICAgIHJlc3VsdHMucmV2ZXJzZSgpIGlmIGRpcmVjdGlvbiBpcyAnYmFja3dhcmQnXG4gICAgZm9yIHJlc3VsdCBpbiByZXN1bHRzXG4gICAgICBmbihyZXN1bHQpXG4gICAgICByZXR1cm4gdW5sZXNzIGNvbnRpbnVlU2NhblxuICAgIHJldHVybiB1bmxlc3MgY29udGludWVTY2FuXG5cbmRldGVjdFNjb3BlU3RhcnRQb3NpdGlvbkZvclNjb3BlID0gKGVkaXRvciwgZnJvbVBvaW50LCBkaXJlY3Rpb24sIHNjb3BlKSAtPlxuICBwb2ludCA9IG51bGxcbiAgc2NhbkZvclNjb3BlU3RhcnQgZWRpdG9yLCBmcm9tUG9pbnQsIGRpcmVjdGlvbiwgKGluZm8pIC0+XG4gICAgaWYgaW5mby5zY29wZS5zZWFyY2goc2NvcGUpID49IDBcbiAgICAgIGluZm8uc3RvcCgpXG4gICAgICBwb2ludCA9IGluZm8ucG9zaXRpb25cbiAgcG9pbnRcblxuaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgIyBbRklYTUVdIEJ1ZyBvZiB1cHN0cmVhbT9cbiAgIyBTb21ldGltZSB0b2tlbml6ZWRMaW5lcyBsZW5ndGggaXMgbGVzcyB0aGFuIGxhc3QgYnVmZmVyIHJvdy5cbiAgIyBTbyB0b2tlbml6ZWRMaW5lIGlzIG5vdCBhY2Nlc3NpYmxlIGV2ZW4gaWYgdmFsaWQgcm93LlxuICAjIEluIHRoYXQgY2FzZSBJIHNpbXBseSByZXR1cm4gZW1wdHkgQXJyYXkuXG4gIGlmIHRva2VuaXplZExpbmUgPSBnZXRUb2tlbml6ZWRMaW5lRm9yUm93KGVkaXRvciwgcm93KVxuICAgIGdldFNjb3Blc0ZvclRva2VuaXplZExpbmUodG9rZW5pemVkTGluZSkuc29tZSAoc2NvcGUpIC0+XG4gICAgICBpc0Z1bmN0aW9uU2NvcGUoZWRpdG9yLCBzY29wZSlcbiAgZWxzZVxuICAgIGZhbHNlXG5cbiMgW0ZJWE1FXSB2ZXJ5IHJvdWdoIHN0YXRlLCBuZWVkIGltcHJvdmVtZW50LlxuaXNGdW5jdGlvblNjb3BlID0gKGVkaXRvciwgc2NvcGUpIC0+XG4gIHN3aXRjaCBlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZVxuICAgIHdoZW4gJ3NvdXJjZS5nbycsICdzb3VyY2UuZWxpeGlyJ1xuICAgICAgc2NvcGVzID0gWydlbnRpdHkubmFtZS5mdW5jdGlvbiddXG4gICAgd2hlbiAnc291cmNlLnJ1YnknXG4gICAgICBzY29wZXMgPSBbJ21ldGEuZnVuY3Rpb24uJywgJ21ldGEuY2xhc3MuJywgJ21ldGEubW9kdWxlLiddXG4gICAgZWxzZVxuICAgICAgc2NvcGVzID0gWydtZXRhLmZ1bmN0aW9uLicsICdtZXRhLmNsYXNzLiddXG4gIHBhdHRlcm4gPSBuZXcgUmVnRXhwKCdeJyArIHNjb3Blcy5tYXAoXy5lc2NhcGVSZWdFeHApLmpvaW4oJ3wnKSlcbiAgcGF0dGVybi50ZXN0KHNjb3BlKVxuXG4jIFNjcm9sbCB0byBidWZmZXJQb3NpdGlvbiB3aXRoIG1pbmltdW0gYW1vdW50IHRvIGtlZXAgb3JpZ2luYWwgdmlzaWJsZSBhcmVhLlxuIyBJZiB0YXJnZXQgcG9zaXRpb24gd29uJ3QgZml0IHdpdGhpbiBvbmVQYWdlVXAgb3Igb25lUGFnZURvd24sIGl0IGNlbnRlciB0YXJnZXQgcG9pbnQuXG5zbWFydFNjcm9sbFRvQnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCkgLT5cbiAgZWRpdG9yRWxlbWVudCA9IGVkaXRvci5lbGVtZW50XG4gIGVkaXRvckFyZWFIZWlnaHQgPSBlZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKCkgKiAoZWRpdG9yLmdldFJvd3NQZXJQYWdlKCkgLSAxKVxuICBvbmVQYWdlVXAgPSBlZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcCgpIC0gZWRpdG9yQXJlYUhlaWdodCAjIE5vIG5lZWQgdG8gbGltaXQgdG8gbWluPTBcbiAgb25lUGFnZURvd24gPSBlZGl0b3JFbGVtZW50LmdldFNjcm9sbEJvdHRvbSgpICsgZWRpdG9yQXJlYUhlaWdodFxuICB0YXJnZXQgPSBlZGl0b3JFbGVtZW50LnBpeGVsUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbihwb2ludCkudG9wXG5cbiAgY2VudGVyID0gKG9uZVBhZ2VEb3duIDwgdGFyZ2V0KSBvciAodGFyZ2V0IDwgb25lUGFnZVVwKVxuICBlZGl0b3Iuc2Nyb2xsVG9CdWZmZXJQb3NpdGlvbihwb2ludCwge2NlbnRlcn0pXG5cbm1hdGNoU2NvcGVzID0gKGVkaXRvckVsZW1lbnQsIHNjb3BlcykgLT5cbiAgY2xhc3NlcyA9IHNjb3Blcy5tYXAgKHNjb3BlKSAtPiBzY29wZS5zcGxpdCgnLicpXG5cbiAgZm9yIGNsYXNzTmFtZXMgaW4gY2xhc3Nlc1xuICAgIGNvbnRhaW5zQ291bnQgPSAwXG4gICAgZm9yIGNsYXNzTmFtZSBpbiBjbGFzc05hbWVzXG4gICAgICBjb250YWluc0NvdW50ICs9IDEgaWYgZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKVxuICAgIHJldHVybiB0cnVlIGlmIGNvbnRhaW5zQ291bnQgaXMgY2xhc3NOYW1lcy5sZW5ndGhcbiAgZmFsc2VcblxuaXNTaW5nbGVMaW5lVGV4dCA9ICh0ZXh0KSAtPlxuICB0ZXh0LnNwbGl0KC9cXG58XFxyXFxuLykubGVuZ3RoIGlzIDFcblxuIyBSZXR1cm4gYnVmZmVyUmFuZ2UgYW5kIGtpbmQgWyd3aGl0ZS1zcGFjZScsICdub24td29yZCcsICd3b3JkJ11cbiNcbiMgVGhpcyBmdW5jdGlvbiBtb2RpZnkgd29yZFJlZ2V4IHNvIHRoYXQgaXQgZmVlbCBOQVRVUkFMIGluIFZpbSdzIG5vcm1hbCBtb2RlLlxuIyBJbiBub3JtYWwtbW9kZSwgY3Vyc29yIGlzIHJhY3RhbmdsZShub3QgcGlwZSh8KSBjaGFyKS5cbiMgQ3Vyc29yIGlzIGxpa2UgT04gd29yZCByYXRoZXIgdGhhbiBCRVRXRUVOIHdvcmQuXG4jIFRoZSBtb2RpZmljYXRpb24gaXMgdGFpbG9yZCBsaWtlIHRoaXNcbiMgICAtIE9OIHdoaXRlLXNwYWNlOiBJbmNsdWRzIG9ubHkgd2hpdGUtc3BhY2VzLlxuIyAgIC0gT04gbm9uLXdvcmQ6IEluY2x1ZHMgb25seSBub24gd29yZCBjaGFyKD1leGNsdWRlcyBub3JtYWwgd29yZCBjaGFyKS5cbiNcbiMgVmFsaWQgb3B0aW9uc1xuIyAgLSB3b3JkUmVnZXg6IGluc3RhbmNlIG9mIFJlZ0V4cFxuIyAgLSBub25Xb3JkQ2hhcmFjdGVyczogc3RyaW5nXG5nZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50LCBvcHRpb25zPXt9KSAtPlxuICB7c2luZ2xlTm9uV29yZENoYXIsIHdvcmRSZWdleCwgbm9uV29yZENoYXJhY3RlcnMsIGN1cnNvcn0gPSBvcHRpb25zXG4gIGlmIG5vdCB3b3JkUmVnZXg/IG9yIG5vdCBub25Xb3JkQ2hhcmFjdGVycz8gIyBDb21wbGVtZW50IGZyb20gY3Vyc29yXG4gICAgY3Vyc29yID89IGVkaXRvci5nZXRMYXN0Q3Vyc29yKClcbiAgICB7d29yZFJlZ2V4LCBub25Xb3JkQ2hhcmFjdGVyc30gPSBfLmV4dGVuZChvcHRpb25zLCBidWlsZFdvcmRQYXR0ZXJuQnlDdXJzb3IoY3Vyc29yLCBvcHRpb25zKSlcbiAgc2luZ2xlTm9uV29yZENoYXIgPz0gdHJ1ZVxuXG4gIGNoYXJhY3RlckF0UG9pbnQgPSBnZXRSaWdodENoYXJhY3RlckZvckJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgcG9pbnQpXG4gIG5vbldvcmRSZWdleCA9IG5ldyBSZWdFeHAoXCJbI3tfLmVzY2FwZVJlZ0V4cChub25Xb3JkQ2hhcmFjdGVycyl9XStcIilcblxuICBpZiAvXFxzLy50ZXN0KGNoYXJhY3RlckF0UG9pbnQpXG4gICAgc291cmNlID0gXCJbXFx0IF0rXCJcbiAgICBraW5kID0gJ3doaXRlLXNwYWNlJ1xuICAgIHdvcmRSZWdleCA9IG5ldyBSZWdFeHAoc291cmNlKVxuICBlbHNlIGlmIG5vbldvcmRSZWdleC50ZXN0KGNoYXJhY3RlckF0UG9pbnQpIGFuZCBub3Qgd29yZFJlZ2V4LnRlc3QoY2hhcmFjdGVyQXRQb2ludClcbiAgICBraW5kID0gJ25vbi13b3JkJ1xuICAgIGlmIHNpbmdsZU5vbldvcmRDaGFyXG4gICAgICBzb3VyY2UgPSBfLmVzY2FwZVJlZ0V4cChjaGFyYWN0ZXJBdFBvaW50KVxuICAgICAgd29yZFJlZ2V4ID0gbmV3IFJlZ0V4cChzb3VyY2UpXG4gICAgZWxzZVxuICAgICAgd29yZFJlZ2V4ID0gbm9uV29yZFJlZ2V4XG4gIGVsc2VcbiAgICBraW5kID0gJ3dvcmQnXG5cbiAgcmFuZ2UgPSBnZXRXb3JkQnVmZmVyUmFuZ2VBdEJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgcG9pbnQsIHt3b3JkUmVnZXh9KVxuICB7a2luZCwgcmFuZ2V9XG5cbmdldFdvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50LCBvcHRpb25zPXt9KSAtPlxuICBib3VuZGFyaXplRm9yV29yZCA9IG9wdGlvbnMuYm91bmRhcml6ZUZvcldvcmQgPyB0cnVlXG4gIGRlbGV0ZSBvcHRpb25zLmJvdW5kYXJpemVGb3JXb3JkXG4gIHtyYW5nZSwga2luZH0gPSBnZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbihlZGl0b3IsIHBvaW50LCBvcHRpb25zKVxuICB0ZXh0ID0gZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKVxuICBwYXR0ZXJuID0gXy5lc2NhcGVSZWdFeHAodGV4dClcblxuICBpZiBraW5kIGlzICd3b3JkJyBhbmQgYm91bmRhcml6ZUZvcldvcmRcbiAgICAjIFNldCB3b3JkLWJvdW5kYXJ5KCBcXGIgKSBhbmNob3Igb25seSB3aGVuIGl0J3MgZWZmZWN0aXZlICM2ODlcbiAgICBzdGFydEJvdW5kYXJ5ID0gaWYgL15cXHcvLnRlc3QodGV4dCkgdGhlbiBcIlxcXFxiXCIgZWxzZSAnJ1xuICAgIGVuZEJvdW5kYXJ5ID0gaWYgL1xcdyQvLnRlc3QodGV4dCkgdGhlbiBcIlxcXFxiXCIgZWxzZSAnJ1xuICAgIHBhdHRlcm4gPSBzdGFydEJvdW5kYXJ5ICsgcGF0dGVybiArIGVuZEJvdW5kYXJ5XG4gIG5ldyBSZWdFeHAocGF0dGVybiwgJ2cnKVxuXG5nZXRTdWJ3b3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCwgb3B0aW9ucz17fSkgLT5cbiAgb3B0aW9ucyA9IHt3b3JkUmVnZXg6IGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuc3Vid29yZFJlZ0V4cCgpLCBib3VuZGFyaXplRm9yV29yZDogZmFsc2V9XG4gIGdldFdvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvbihlZGl0b3IsIHBvaW50LCBvcHRpb25zKVxuXG4jIFJldHVybiBvcHRpb25zIHVzZWQgZm9yIGdldFdvcmRCdWZmZXJSYW5nZUF0QnVmZmVyUG9zaXRpb25cbmJ1aWxkV29yZFBhdHRlcm5CeUN1cnNvciA9IChjdXJzb3IsIHt3b3JkUmVnZXh9KSAtPlxuICBub25Xb3JkQ2hhcmFjdGVycyA9IGdldE5vbldvcmRDaGFyYWN0ZXJzRm9yQ3Vyc29yKGN1cnNvcilcbiAgd29yZFJlZ2V4ID89IG5ldyBSZWdFeHAoXCJeW1xcdCBdKiR8W15cXFxccyN7Xy5lc2NhcGVSZWdFeHAobm9uV29yZENoYXJhY3RlcnMpfV0rXCIpXG4gIHt3b3JkUmVnZXgsIG5vbldvcmRDaGFyYWN0ZXJzfVxuXG5nZXRCZWdpbm5pbmdPZldvcmRCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50LCB7d29yZFJlZ2V4fT17fSkgLT5cbiAgc2NhblJhbmdlID0gW1twb2ludC5yb3csIDBdLCBwb2ludF1cblxuICBmb3VuZCA9IG51bGxcbiAgZWRpdG9yLmJhY2t3YXJkc1NjYW5JbkJ1ZmZlclJhbmdlIHdvcmRSZWdleCwgc2NhblJhbmdlLCAoe3JhbmdlLCBtYXRjaFRleHQsIHN0b3B9KSAtPlxuICAgIHJldHVybiBpZiBtYXRjaFRleHQgaXMgJycgYW5kIHJhbmdlLnN0YXJ0LmNvbHVtbiBpc250IDBcblxuICAgIGlmIHJhbmdlLnN0YXJ0LmlzTGVzc1RoYW4ocG9pbnQpXG4gICAgICBpZiByYW5nZS5lbmQuaXNHcmVhdGVyVGhhbk9yRXF1YWwocG9pbnQpXG4gICAgICAgIGZvdW5kID0gcmFuZ2Uuc3RhcnRcbiAgICAgIHN0b3AoKVxuXG4gIGZvdW5kID8gcG9pbnRcblxuZ2V0RW5kT2ZXb3JkQnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCwge3dvcmRSZWdleH09e30pIC0+XG4gIHNjYW5SYW5nZSA9IFtwb2ludCwgW3BvaW50LnJvdywgSW5maW5pdHldXVxuXG4gIGZvdW5kID0gbnVsbFxuICBlZGl0b3Iuc2NhbkluQnVmZmVyUmFuZ2Ugd29yZFJlZ2V4LCBzY2FuUmFuZ2UsICh7cmFuZ2UsIG1hdGNoVGV4dCwgc3RvcH0pIC0+XG4gICAgcmV0dXJuIGlmIG1hdGNoVGV4dCBpcyAnJyBhbmQgcmFuZ2Uuc3RhcnQuY29sdW1uIGlzbnQgMFxuXG4gICAgaWYgcmFuZ2UuZW5kLmlzR3JlYXRlclRoYW4ocG9pbnQpXG4gICAgICBpZiByYW5nZS5zdGFydC5pc0xlc3NUaGFuT3JFcXVhbChwb2ludClcbiAgICAgICAgZm91bmQgPSByYW5nZS5lbmRcbiAgICAgIHN0b3AoKVxuXG4gIGZvdW5kID8gcG9pbnRcblxuZ2V0V29yZEJ1ZmZlclJhbmdlQXRCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvc2l0aW9uLCBvcHRpb25zPXt9KSAtPlxuICBlbmRQb3NpdGlvbiA9IGdldEVuZE9mV29yZEJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgcG9zaXRpb24sIG9wdGlvbnMpXG4gIHN0YXJ0UG9zaXRpb24gPSBnZXRCZWdpbm5pbmdPZldvcmRCdWZmZXJQb3NpdGlvbihlZGl0b3IsIGVuZFBvc2l0aW9uLCBvcHRpb25zKVxuICBuZXcgUmFuZ2Uoc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24pXG5cbiMgV2hlbiByYW5nZSBpcyBsaW5ld2lzZSByYW5nZSwgcmFuZ2UgZW5kIGhhdmUgY29sdW1uIDAgb2YgTkVYVCByb3cuXG4jIFdoaWNoIGlzIHZlcnkgdW5pbnR1aXRpdmUgYW5kIHVud2FudGVkIHJlc3VsdC5cbnNocmlua1JhbmdlRW5kVG9CZWZvcmVOZXdMaW5lID0gKHJhbmdlKSAtPlxuICB7c3RhcnQsIGVuZH0gPSByYW5nZVxuICBpZiBlbmQuY29sdW1uIGlzIDBcbiAgICBlbmRSb3cgPSBsaW1pdE51bWJlcihlbmQucm93IC0gMSwgbWluOiBzdGFydC5yb3cpXG4gICAgbmV3IFJhbmdlKHN0YXJ0LCBbZW5kUm93LCBJbmZpbml0eV0pXG4gIGVsc2VcbiAgICByYW5nZVxuXG5zY2FuRWRpdG9yID0gKGVkaXRvciwgcGF0dGVybikgLT5cbiAgcmFuZ2VzID0gW11cbiAgZWRpdG9yLnNjYW4gcGF0dGVybiwgKHtyYW5nZX0pIC0+XG4gICAgcmFuZ2VzLnB1c2gocmFuZ2UpXG4gIHJhbmdlc1xuXG5jb2xsZWN0UmFuZ2VJbkJ1ZmZlclJvdyA9IChlZGl0b3IsIHJvdywgcGF0dGVybikgLT5cbiAgcmFuZ2VzID0gW11cbiAgc2NhblJhbmdlID0gZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHJvdylcbiAgZWRpdG9yLnNjYW5JbkJ1ZmZlclJhbmdlIHBhdHRlcm4sIHNjYW5SYW5nZSwgKHtyYW5nZX0pIC0+XG4gICAgcmFuZ2VzLnB1c2gocmFuZ2UpXG4gIHJhbmdlc1xuXG5maW5kUmFuZ2VJbkJ1ZmZlclJvdyA9IChlZGl0b3IsIHBhdHRlcm4sIHJvdywge2RpcmVjdGlvbn09e30pIC0+XG4gIGlmIGRpcmVjdGlvbiBpcyAnYmFja3dhcmQnXG4gICAgc2NhbkZ1bmN0aW9uTmFtZSA9ICdiYWNrd2FyZHNTY2FuSW5CdWZmZXJSYW5nZSdcbiAgZWxzZVxuICAgIHNjYW5GdW5jdGlvbk5hbWUgPSAnc2NhbkluQnVmZmVyUmFuZ2UnXG5cbiAgcmFuZ2UgPSBudWxsXG4gIHNjYW5SYW5nZSA9IGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhyb3cpXG4gIGVkaXRvcltzY2FuRnVuY3Rpb25OYW1lXSBwYXR0ZXJuLCBzY2FuUmFuZ2UsIChldmVudCkgLT4gcmFuZ2UgPSBldmVudC5yYW5nZVxuICByYW5nZVxuXG5nZXRMYXJnZXN0Rm9sZFJhbmdlQ29udGFpbnNCdWZmZXJSb3cgPSAoZWRpdG9yLCByb3cpIC0+XG4gIG1hcmtlcnMgPSBlZGl0b3IuZGlzcGxheUxheWVyLmZvbGRzTWFya2VyTGF5ZXIuZmluZE1hcmtlcnMoaW50ZXJzZWN0c1Jvdzogcm93KVxuXG4gIHN0YXJ0UG9pbnQgPSBudWxsXG4gIGVuZFBvaW50ID0gbnVsbFxuXG4gIGZvciBtYXJrZXIgaW4gbWFya2VycyA/IFtdXG4gICAge3N0YXJ0LCBlbmR9ID0gbWFya2VyLmdldFJhbmdlKClcbiAgICB1bmxlc3Mgc3RhcnRQb2ludFxuICAgICAgc3RhcnRQb2ludCA9IHN0YXJ0XG4gICAgICBlbmRQb2ludCA9IGVuZFxuICAgICAgY29udGludWVcblxuICAgIGlmIHN0YXJ0LmlzTGVzc1RoYW4oc3RhcnRQb2ludClcbiAgICAgIHN0YXJ0UG9pbnQgPSBzdGFydFxuICAgICAgZW5kUG9pbnQgPSBlbmRcblxuICBpZiBzdGFydFBvaW50PyBhbmQgZW5kUG9pbnQ/XG4gICAgbmV3IFJhbmdlKHN0YXJ0UG9pbnQsIGVuZFBvaW50KVxuXG4jIHRha2UgYnVmZmVyUG9zaXRpb25cbnRyYW5zbGF0ZVBvaW50QW5kQ2xpcCA9IChlZGl0b3IsIHBvaW50LCBkaXJlY3Rpb24pIC0+XG4gIHBvaW50ID0gUG9pbnQuZnJvbU9iamVjdChwb2ludClcblxuICBkb250Q2xpcCA9IGZhbHNlXG4gIHN3aXRjaCBkaXJlY3Rpb25cbiAgICB3aGVuICdmb3J3YXJkJ1xuICAgICAgcG9pbnQgPSBwb2ludC50cmFuc2xhdGUoWzAsICsxXSlcbiAgICAgIGVvbCA9IGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhwb2ludC5yb3cpLmVuZFxuXG4gICAgICBpZiBwb2ludC5pc0VxdWFsKGVvbClcbiAgICAgICAgZG9udENsaXAgPSB0cnVlXG4gICAgICBlbHNlIGlmIHBvaW50LmlzR3JlYXRlclRoYW4oZW9sKVxuICAgICAgICBkb250Q2xpcCA9IHRydWVcbiAgICAgICAgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnQucm93ICsgMSwgMCkgIyBtb3ZlIHBvaW50IHRvIG5ldy1saW5lIHNlbGVjdGVkIHBvaW50XG5cbiAgICAgIHBvaW50ID0gUG9pbnQubWluKHBvaW50LCBlZGl0b3IuZ2V0RW9mQnVmZmVyUG9zaXRpb24oKSlcblxuICAgIHdoZW4gJ2JhY2t3YXJkJ1xuICAgICAgcG9pbnQgPSBwb2ludC50cmFuc2xhdGUoWzAsIC0xXSlcblxuICAgICAgaWYgcG9pbnQuY29sdW1uIDwgMFxuICAgICAgICBkb250Q2xpcCA9IHRydWVcbiAgICAgICAgbmV3Um93ID0gcG9pbnQucm93IC0gMVxuICAgICAgICBlb2wgPSBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cobmV3Um93KS5lbmRcbiAgICAgICAgcG9pbnQgPSBuZXcgUG9pbnQobmV3Um93LCBlb2wuY29sdW1uKVxuXG4gICAgICBwb2ludCA9IFBvaW50Lm1heChwb2ludCwgUG9pbnQuWkVSTylcblxuICBpZiBkb250Q2xpcFxuICAgIHBvaW50XG4gIGVsc2VcbiAgICBzY3JlZW5Qb2ludCA9IGVkaXRvci5zY3JlZW5Qb3NpdGlvbkZvckJ1ZmZlclBvc2l0aW9uKHBvaW50LCBjbGlwRGlyZWN0aW9uOiBkaXJlY3Rpb24pXG4gICAgZWRpdG9yLmJ1ZmZlclBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oc2NyZWVuUG9pbnQpXG5cbmdldFJhbmdlQnlUcmFuc2xhdGVQb2ludEFuZENsaXAgPSAoZWRpdG9yLCByYW5nZSwgd2hpY2gsIGRpcmVjdGlvbikgLT5cbiAgbmV3UG9pbnQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAoZWRpdG9yLCByYW5nZVt3aGljaF0sIGRpcmVjdGlvbilcbiAgc3dpdGNoIHdoaWNoXG4gICAgd2hlbiAnc3RhcnQnXG4gICAgICBuZXcgUmFuZ2UobmV3UG9pbnQsIHJhbmdlLmVuZClcbiAgICB3aGVuICdlbmQnXG4gICAgICBuZXcgUmFuZ2UocmFuZ2Uuc3RhcnQsIG5ld1BvaW50KVxuXG5nZXRQYWNrYWdlID0gKG5hbWUsIGZuKSAtPlxuICBuZXcgUHJvbWlzZSAocmVzb2x2ZSkgLT5cbiAgICBpZiBhdG9tLnBhY2thZ2VzLmlzUGFja2FnZUFjdGl2ZShuYW1lKVxuICAgICAgcGtnID0gYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKG5hbWUpXG4gICAgICByZXNvbHZlKHBrZylcbiAgICBlbHNlXG4gICAgICBkaXNwb3NhYmxlID0gYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlUGFja2FnZSAocGtnKSAtPlxuICAgICAgICBpZiBwa2cubmFtZSBpcyBuYW1lXG4gICAgICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICAgICAgICByZXNvbHZlKHBrZylcblxuc2VhcmNoQnlQcm9qZWN0RmluZCA9IChlZGl0b3IsIHRleHQpIC0+XG4gIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yLmVsZW1lbnQsICdwcm9qZWN0LWZpbmQ6c2hvdycpXG4gIGdldFBhY2thZ2UoJ2ZpbmQtYW5kLXJlcGxhY2UnKS50aGVuIChwa2cpIC0+XG4gICAge3Byb2plY3RGaW5kVmlld30gPSBwa2cubWFpbk1vZHVsZVxuICAgIGlmIHByb2plY3RGaW5kVmlldz9cbiAgICAgIHByb2plY3RGaW5kVmlldy5maW5kRWRpdG9yLnNldFRleHQodGV4dClcbiAgICAgIHByb2plY3RGaW5kVmlldy5jb25maXJtKClcblxubGltaXROdW1iZXIgPSAobnVtYmVyLCB7bWF4LCBtaW59PXt9KSAtPlxuICBudW1iZXIgPSBNYXRoLm1pbihudW1iZXIsIG1heCkgaWYgbWF4P1xuICBudW1iZXIgPSBNYXRoLm1heChudW1iZXIsIG1pbikgaWYgbWluP1xuICBudW1iZXJcblxuZmluZFJhbmdlQ29udGFpbnNQb2ludCA9IChyYW5nZXMsIHBvaW50KSAtPlxuICBmb3IgcmFuZ2UgaW4gcmFuZ2VzIHdoZW4gcmFuZ2UuY29udGFpbnNQb2ludChwb2ludClcbiAgICByZXR1cm4gcmFuZ2VcbiAgbnVsbFxuXG5uZWdhdGVGdW5jdGlvbiA9IChmbikgLT5cbiAgKGFyZ3MuLi4pIC0+XG4gICAgbm90IGZuKGFyZ3MuLi4pXG5cbmlzRW1wdHkgPSAodGFyZ2V0KSAtPiB0YXJnZXQuaXNFbXB0eSgpXG5pc05vdEVtcHR5ID0gbmVnYXRlRnVuY3Rpb24oaXNFbXB0eSlcblxuaXNTaW5nbGVMaW5lUmFuZ2UgPSAocmFuZ2UpIC0+IHJhbmdlLmlzU2luZ2xlTGluZSgpXG5pc05vdFNpbmdsZUxpbmVSYW5nZSA9IG5lZ2F0ZUZ1bmN0aW9uKGlzU2luZ2xlTGluZVJhbmdlKVxuXG5pc0xlYWRpbmdXaGl0ZVNwYWNlUmFuZ2UgPSAoZWRpdG9yLCByYW5nZSkgLT4gL15bXFx0IF0qJC8udGVzdChlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UpKVxuaXNOb3RMZWFkaW5nV2hpdGVTcGFjZVJhbmdlID0gbmVnYXRlRnVuY3Rpb24oaXNMZWFkaW5nV2hpdGVTcGFjZVJhbmdlKVxuXG5pc0VzY2FwZWRDaGFyUmFuZ2UgPSAoZWRpdG9yLCByYW5nZSkgLT5cbiAgcmFuZ2UgPSBSYW5nZS5mcm9tT2JqZWN0KHJhbmdlKVxuICBjaGFycyA9IGdldExlZnRDaGFyYWN0ZXJGb3JCdWZmZXJQb3NpdGlvbihlZGl0b3IsIHJhbmdlLnN0YXJ0LCAyKVxuICBjaGFycy5lbmRzV2l0aCgnXFxcXCcpIGFuZCBub3QgY2hhcnMuZW5kc1dpdGgoJ1xcXFxcXFxcJylcblxuaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCwgdGV4dCkgLT5cbiAgZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKFtwb2ludCwgcG9pbnRdLCB0ZXh0KVxuXG5lbnN1cmVFbmRzV2l0aE5ld0xpbmVGb3JCdWZmZXJSb3cgPSAoZWRpdG9yLCByb3cpIC0+XG4gIHVubGVzcyBpc0VuZHNXaXRoTmV3TGluZUZvckJ1ZmZlclJvdyhlZGl0b3IsIHJvdylcbiAgICBlb2wgPSBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3coZWRpdG9yLCByb3cpXG4gICAgaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb24oZWRpdG9yLCBlb2wsIFwiXFxuXCIpXG5cbmZvckVhY2hQYW5lQXhpcyA9IChmbiwgYmFzZSkgLT5cbiAgYmFzZSA/PSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkuZ2V0Q29udGFpbmVyKCkuZ2V0Um9vdCgpXG4gIGlmIGJhc2UuY2hpbGRyZW4/XG4gICAgZm4oYmFzZSlcblxuICAgIGZvciBjaGlsZCBpbiBiYXNlLmNoaWxkcmVuXG4gICAgICBmb3JFYWNoUGFuZUF4aXMoZm4sIGNoaWxkKVxuXG5tb2RpZnlDbGFzc0xpc3QgPSAoYWN0aW9uLCBlbGVtZW50LCBjbGFzc05hbWVzLi4uKSAtPlxuICBlbGVtZW50LmNsYXNzTGlzdFthY3Rpb25dKGNsYXNzTmFtZXMuLi4pXG5cbmFkZENsYXNzTGlzdCA9IG1vZGlmeUNsYXNzTGlzdC5iaW5kKG51bGwsICdhZGQnKVxucmVtb3ZlQ2xhc3NMaXN0ID0gbW9kaWZ5Q2xhc3NMaXN0LmJpbmQobnVsbCwgJ3JlbW92ZScpXG50b2dnbGVDbGFzc0xpc3QgPSBtb2RpZnlDbGFzc0xpc3QuYmluZChudWxsLCAndG9nZ2xlJylcblxudG9nZ2xlQ2FzZUZvckNoYXJhY3RlciA9IChjaGFyKSAtPlxuICBjaGFyTG93ZXIgPSBjaGFyLnRvTG93ZXJDYXNlKClcbiAgaWYgY2hhckxvd2VyIGlzIGNoYXJcbiAgICBjaGFyLnRvVXBwZXJDYXNlKClcbiAgZWxzZVxuICAgIGNoYXJMb3dlclxuXG5zcGxpdFRleHRCeU5ld0xpbmUgPSAodGV4dCkgLT5cbiAgaWYgdGV4dC5lbmRzV2l0aChcIlxcblwiKVxuICAgIHRleHQudHJpbVJpZ2h0KCkuc3BsaXQoL1xccj9cXG4vZylcbiAgZWxzZVxuICAgIHRleHQuc3BsaXQoL1xccj9cXG4vZylcblxucmVwbGFjZURlY29yYXRpb25DbGFzc0J5ID0gKGZuLCBkZWNvcmF0aW9uKSAtPlxuICBwcm9wcyA9IGRlY29yYXRpb24uZ2V0UHJvcGVydGllcygpXG4gIGRlY29yYXRpb24uc2V0UHJvcGVydGllcyhfLmRlZmF1bHRzKHtjbGFzczogZm4ocHJvcHMuY2xhc3MpfSwgcHJvcHMpKVxuXG4jIE1vZGlmeSByYW5nZSB1c2VkIGZvciB1bmRvL3JlZG8gZmxhc2ggaGlnaGxpZ2h0IHRvIG1ha2UgaXQgZmVlbCBuYXR1cmFsbHkgZm9yIGh1bWFuLlxuIyAgLSBUcmltIHN0YXJ0aW5nIG5ldyBsaW5lKFwiXFxuXCIpXG4jICAgICBcIlxcbmFiY1wiIC0+IFwiYWJjXCJcbiMgIC0gSWYgcmFuZ2UuZW5kIGlzIEVPTCBleHRlbmQgcmFuZ2UgdG8gZmlyc3QgY29sdW1uIG9mIG5leHQgbGluZS5cbiMgICAgIFwiYWJjXCIgLT4gXCJhYmNcXG5cIlxuIyBlLmcuXG4jIC0gd2hlbiAnYycgaXMgYXRFT0w6IFwiXFxuYWJjXCIgLT4gXCJhYmNcXG5cIlxuIyAtIHdoZW4gJ2MnIGlzIE5PVCBhdEVPTDogXCJcXG5hYmNcIiAtPiBcImFiY1wiXG4jXG4jIFNvIGFsd2F5cyB0cmltIGluaXRpYWwgXCJcXG5cIiBwYXJ0IHJhbmdlIGJlY2F1c2UgZmxhc2hpbmcgdHJhaWxpbmcgbGluZSBpcyBjb3VudGVyaW50dWl0aXZlLlxuaHVtYW5pemVCdWZmZXJSYW5nZSA9IChlZGl0b3IsIHJhbmdlKSAtPlxuICBpZiBpc1NpbmdsZUxpbmVSYW5nZShyYW5nZSkgb3IgaXNMaW5ld2lzZVJhbmdlKHJhbmdlKVxuICAgIHJldHVybiByYW5nZVxuXG4gIHtzdGFydCwgZW5kfSA9IHJhbmdlXG4gIGlmIHBvaW50SXNBdEVuZE9mTGluZShlZGl0b3IsIHN0YXJ0KVxuICAgIG5ld1N0YXJ0ID0gc3RhcnQudHJhdmVyc2UoWzEsIDBdKVxuXG4gIGlmIHBvaW50SXNBdEVuZE9mTGluZShlZGl0b3IsIGVuZClcbiAgICBuZXdFbmQgPSBlbmQudHJhdmVyc2UoWzEsIDBdKVxuXG4gIGlmIG5ld1N0YXJ0PyBvciBuZXdFbmQ/XG4gICAgbmV3IFJhbmdlKG5ld1N0YXJ0ID8gc3RhcnQsIG5ld0VuZCA/IGVuZClcbiAgZWxzZVxuICAgIHJhbmdlXG5cbiMgRXhwYW5kIHJhbmdlIHRvIHdoaXRlIHNwYWNlXG4jICAxLiBFeHBhbmQgdG8gZm9yd2FyZCBkaXJlY3Rpb24sIGlmIHN1Y2VlZCByZXR1cm4gbmV3IHJhbmdlLlxuIyAgMi4gRXhwYW5kIHRvIGJhY2t3YXJkIGRpcmVjdGlvbiwgaWYgc3VjY2VlZCByZXR1cm4gbmV3IHJhbmdlLlxuIyAgMy4gV2hlbiBmYWlsZCB0byBleHBhbmQgZWl0aGVyIGRpcmVjdGlvbiwgcmV0dXJuIG9yaWdpbmFsIHJhbmdlLlxuZXhwYW5kUmFuZ2VUb1doaXRlU3BhY2VzID0gKGVkaXRvciwgcmFuZ2UpIC0+XG4gIHtzdGFydCwgZW5kfSA9IHJhbmdlXG5cbiAgbmV3RW5kID0gbnVsbFxuICBzY2FuUmFuZ2UgPSBbZW5kLCBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3coZWRpdG9yLCBlbmQucm93KV1cbiAgZWRpdG9yLnNjYW5JbkJ1ZmZlclJhbmdlIC9cXFMvLCBzY2FuUmFuZ2UsICh7cmFuZ2V9KSAtPiBuZXdFbmQgPSByYW5nZS5zdGFydFxuXG4gIGlmIG5ld0VuZD8uaXNHcmVhdGVyVGhhbihlbmQpXG4gICAgcmV0dXJuIG5ldyBSYW5nZShzdGFydCwgbmV3RW5kKVxuXG4gIG5ld1N0YXJ0ID0gbnVsbFxuICBzY2FuUmFuZ2UgPSBbW3N0YXJ0LnJvdywgMF0sIHJhbmdlLnN0YXJ0XVxuICBlZGl0b3IuYmFja3dhcmRzU2NhbkluQnVmZmVyUmFuZ2UgL1xcUy8sIHNjYW5SYW5nZSwgKHtyYW5nZX0pIC0+IG5ld1N0YXJ0ID0gcmFuZ2UuZW5kXG5cbiAgaWYgbmV3U3RhcnQ/LmlzTGVzc1RoYW4oc3RhcnQpXG4gICAgcmV0dXJuIG5ldyBSYW5nZShuZXdTdGFydCwgZW5kKVxuXG4gIHJldHVybiByYW5nZSAjIGZhbGxiYWNrXG5cbnNjYW5FZGl0b3JJbkRpcmVjdGlvbiA9IChlZGl0b3IsIGRpcmVjdGlvbiwgcGF0dGVybiwgb3B0aW9ucz17fSwgZm4pIC0+XG4gIHthbGxvd05leHRMaW5lLCBmcm9tLCBzY2FuUmFuZ2V9ID0gb3B0aW9uc1xuICBpZiBub3QgZnJvbT8gYW5kIG5vdCBzY2FuUmFuZ2U/XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3QgZWl0aGVyIG9mICdmcm9tJyBvciAnc2NhblJhbmdlJyBvcHRpb25zXCIpXG5cbiAgaWYgc2NhblJhbmdlXG4gICAgYWxsb3dOZXh0TGluZSA9IHRydWVcbiAgZWxzZVxuICAgIGFsbG93TmV4dExpbmUgPz0gdHJ1ZVxuICBmcm9tID0gUG9pbnQuZnJvbU9iamVjdChmcm9tKSBpZiBmcm9tP1xuICBzd2l0Y2ggZGlyZWN0aW9uXG4gICAgd2hlbiAnZm9yd2FyZCdcbiAgICAgIHNjYW5SYW5nZSA/PSBuZXcgUmFuZ2UoZnJvbSwgZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oZWRpdG9yKSlcbiAgICAgIHNjYW5GdW5jdGlvbiA9ICdzY2FuSW5CdWZmZXJSYW5nZSdcbiAgICB3aGVuICdiYWNrd2FyZCdcbiAgICAgIHNjYW5SYW5nZSA/PSBuZXcgUmFuZ2UoWzAsIDBdLCBmcm9tKVxuICAgICAgc2NhbkZ1bmN0aW9uID0gJ2JhY2t3YXJkc1NjYW5JbkJ1ZmZlclJhbmdlJ1xuXG4gIGVkaXRvcltzY2FuRnVuY3Rpb25dIHBhdHRlcm4sIHNjYW5SYW5nZSwgKGV2ZW50KSAtPlxuICAgIGlmIG5vdCBhbGxvd05leHRMaW5lIGFuZCBldmVudC5yYW5nZS5zdGFydC5yb3cgaXNudCBmcm9tLnJvd1xuICAgICAgZXZlbnQuc3RvcCgpXG4gICAgICByZXR1cm5cbiAgICBmbihldmVudClcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFzc2VydFdpdGhFeGNlcHRpb25cbiAgZ2V0QW5jZXN0b3JzXG4gIGdldEtleUJpbmRpbmdGb3JDb21tYW5kXG4gIGluY2x1ZGVcbiAgZGVidWdcbiAgc2F2ZUVkaXRvclN0YXRlXG4gIGlzTGluZXdpc2VSYW5nZVxuICBoYXZlU29tZU5vbkVtcHR5U2VsZWN0aW9uXG4gIHNvcnRSYW5nZXNcbiAgZ2V0SW5kZXhcbiAgZ2V0VmlzaWJsZUJ1ZmZlclJhbmdlXG4gIGdldFZpc2libGVFZGl0b3JzXG4gIHBvaW50SXNBdEVuZE9mTGluZVxuICBwb2ludElzT25XaGl0ZVNwYWNlXG4gIHBvaW50SXNBdEVuZE9mTGluZUF0Tm9uRW1wdHlSb3dcbiAgcG9pbnRJc0F0VmltRW5kT2ZGaWxlXG4gIGdldFZpbUVvZkJ1ZmZlclBvc2l0aW9uXG4gIGdldFZpbUVvZlNjcmVlblBvc2l0aW9uXG4gIGdldFZpbUxhc3RCdWZmZXJSb3dcbiAgZ2V0VmltTGFzdFNjcmVlblJvd1xuICBzZXRCdWZmZXJSb3dcbiAgc2V0QnVmZmVyQ29sdW1uXG4gIG1vdmVDdXJzb3JMZWZ0XG4gIG1vdmVDdXJzb3JSaWdodFxuICBtb3ZlQ3Vyc29yVXBTY3JlZW5cbiAgbW92ZUN1cnNvckRvd25TY3JlZW5cbiAgZ2V0RW5kT2ZMaW5lRm9yQnVmZmVyUm93XG4gIGdldEZpcnN0VmlzaWJsZVNjcmVlblJvd1xuICBnZXRMYXN0VmlzaWJsZVNjcmVlblJvd1xuICBnZXRWYWxpZFZpbUJ1ZmZlclJvd1xuICBnZXRWYWxpZFZpbVNjcmVlblJvd1xuICBtb3ZlQ3Vyc29yVG9GaXJzdENoYXJhY3RlckF0Um93XG4gIGdldExpbmVUZXh0VG9CdWZmZXJQb3NpdGlvblxuICBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvd1xuICBnZXRUZXh0SW5TY3JlZW5SYW5nZVxuICBtb3ZlQ3Vyc29yVG9OZXh0Tm9uV2hpdGVzcGFjZVxuICBpc0VtcHR5Um93XG4gIGdldENvZGVGb2xkUm93UmFuZ2VzXG4gIGdldENvZGVGb2xkUm93UmFuZ2VzQ29udGFpbmVzRm9yUm93XG4gIGdldEJ1ZmZlclJhbmdlRm9yUm93UmFuZ2VcbiAgdHJpbVJhbmdlXG4gIGdldEZpcnN0Q2hhcmFjdGVyUG9zaXRpb25Gb3JCdWZmZXJSb3dcbiAgaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvd1xuICBkZXRlY3RTY29wZVN0YXJ0UG9zaXRpb25Gb3JTY29wZVxuICBnZXRCdWZmZXJSb3dzXG4gIHNtYXJ0U2Nyb2xsVG9CdWZmZXJQb3NpdGlvblxuICBtYXRjaFNjb3Blc1xuICBtb3ZlQ3Vyc29yRG93bkJ1ZmZlclxuICBtb3ZlQ3Vyc29yVXBCdWZmZXJcbiAgaXNTaW5nbGVMaW5lVGV4dFxuICBnZXRXb3JkQnVmZmVyUmFuZ2VBdEJ1ZmZlclBvc2l0aW9uXG4gIGdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uXG4gIGdldFdvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvblxuICBnZXRTdWJ3b3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb25cbiAgZ2V0Tm9uV29yZENoYXJhY3RlcnNGb3JDdXJzb3JcbiAgc2hyaW5rUmFuZ2VFbmRUb0JlZm9yZU5ld0xpbmVcbiAgc2NhbkVkaXRvclxuICBjb2xsZWN0UmFuZ2VJbkJ1ZmZlclJvd1xuICBmaW5kUmFuZ2VJbkJ1ZmZlclJvd1xuICBnZXRMYXJnZXN0Rm9sZFJhbmdlQ29udGFpbnNCdWZmZXJSb3dcbiAgdHJhbnNsYXRlUG9pbnRBbmRDbGlwXG4gIGdldFJhbmdlQnlUcmFuc2xhdGVQb2ludEFuZENsaXBcbiAgZ2V0UGFja2FnZVxuICBzZWFyY2hCeVByb2plY3RGaW5kXG4gIGxpbWl0TnVtYmVyXG4gIGZpbmRSYW5nZUNvbnRhaW5zUG9pbnRcblxuICBpc0VtcHR5LCBpc05vdEVtcHR5XG4gIGlzU2luZ2xlTGluZVJhbmdlLCBpc05vdFNpbmdsZUxpbmVSYW5nZVxuXG4gIGluc2VydFRleHRBdEJ1ZmZlclBvc2l0aW9uXG4gIGVuc3VyZUVuZHNXaXRoTmV3TGluZUZvckJ1ZmZlclJvd1xuICBpc0xlYWRpbmdXaGl0ZVNwYWNlUmFuZ2VcbiAgaXNOb3RMZWFkaW5nV2hpdGVTcGFjZVJhbmdlXG4gIGlzRXNjYXBlZENoYXJSYW5nZVxuXG4gIGZvckVhY2hQYW5lQXhpc1xuICBhZGRDbGFzc0xpc3RcbiAgcmVtb3ZlQ2xhc3NMaXN0XG4gIHRvZ2dsZUNsYXNzTGlzdFxuICB0b2dnbGVDYXNlRm9yQ2hhcmFjdGVyXG4gIHNwbGl0VGV4dEJ5TmV3TGluZVxuICByZXBsYWNlRGVjb3JhdGlvbkNsYXNzQnlcbiAgaHVtYW5pemVCdWZmZXJSYW5nZVxuICBleHBhbmRSYW5nZVRvV2hpdGVTcGFjZXNcbiAgc2NhbkVkaXRvckluRGlyZWN0aW9uXG59XG4iXX0=
