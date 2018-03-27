(function() {
  var ArgumentsSplitter, Disposable, Point, Range, _, addClassList, adjustIndentWithKeepingLayout, assertWithException, buildWordPatternByCursor, collectRangeInBufferRow, debug, detectScopeStartPositionForScope, ensureEndsWithNewLineForBufferRow, expandRangeToWhiteSpaces, findRangeContainsPoint, findRangeInBufferRow, forEachPaneAxis, fs, getAncestors, getBeginningOfWordBufferPosition, getBufferRangeForRowRange, getBufferRows, getCodeFoldRowRanges, getCodeFoldRowRangesContainesForRow, getEndOfLineForBufferRow, getEndOfWordBufferPosition, getFirstCharacterPositionForBufferRow, getFirstVisibleScreenRow, getIndentLevelForBufferRow, getIndex, getKeyBindingForCommand, getLargestFoldRangeContainsBufferRow, getLastVisibleScreenRow, getLeftCharacterForBufferPosition, getLineTextToBufferPosition, getNonWordCharactersForCursor, getPackage, getRangeByTranslatePointAndClip, getRightCharacterForBufferPosition, getScopesForTokenizedLine, getSubwordPatternAtBufferPosition, getTextInScreenRange, getTokenizedLineForRow, getTraversalForText, getValidVimBufferRow, getValidVimScreenRow, getVimEofBufferPosition, getVimEofScreenPosition, getVimLastBufferRow, getVimLastScreenRow, getVisibleBufferRange, getVisibleEditors, getWordBufferRangeAndKindAtBufferPosition, getWordBufferRangeAtBufferPosition, getWordPatternAtBufferPosition, humanizeBufferRange, include, insertTextAtBufferPosition, isEmpty, isEmptyRow, isEndsWithNewLineForBufferRow, isEscapedCharRange, isFunctionScope, isIncludeFunctionScopeForRow, isLeadingWhiteSpaceRange, isLinewiseRange, isNotEmpty, isNotLeadingWhiteSpaceRange, isNotSingleLineRange, isSingleLineRange, isSingleLineText, limitNumber, matchScopes, modifyClassList, moveCursor, moveCursorDownScreen, moveCursorLeft, moveCursorRight, moveCursorToFirstCharacterAtRow, moveCursorToNextNonWhitespace, moveCursorUpScreen, negateFunction, pointIsAtEndOfLine, pointIsAtEndOfLineAtNonEmptyRow, pointIsAtVimEndOfFile, pointIsOnWhiteSpace, rangeContainsPointWithEndExclusive, ref, removeClassList, replaceDecorationClassBy, saveEditorState, scanEditor, scanEditorInDirection, scanForScopeStart, searchByProjectFind, setBufferColumn, setBufferRow, settings, shouldPreventWrapLine, shrinkRangeEndToBeforeNewLine, smartScrollToBufferPosition, sortRanges, splitAndJoinBy, splitArguments, splitTextByNewLine, toggleCaseForCharacter, toggleClassList, translatePointAndClip, traverseTextFromPoint, trimRange,
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvdXRpbHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx5MkVBQUE7SUFBQTs7O0VBQUEsRUFBQSxHQUFLOztFQUNMLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUjs7RUFFWCxNQUE2QixPQUFBLENBQVEsTUFBUixDQUE3QixFQUFDLDJCQUFELEVBQWEsaUJBQWIsRUFBb0I7O0VBQ3BCLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBRUosbUJBQUEsR0FBc0IsU0FBQyxTQUFELEVBQVksT0FBWixFQUFxQixFQUFyQjtXQUNwQixJQUFJLENBQUMsTUFBTCxDQUFZLFNBQVosRUFBdUIsT0FBdkIsRUFBZ0MsU0FBQyxLQUFEO0FBQzlCLFlBQVUsSUFBQSxLQUFBLENBQU0sS0FBSyxDQUFDLE9BQVo7SUFEb0IsQ0FBaEM7RUFEb0I7O0VBSXRCLFlBQUEsR0FBZSxTQUFDLEdBQUQ7QUFDYixRQUFBO0lBQUEsU0FBQSxHQUFZO0lBQ1osT0FBQSxHQUFVO0FBQ1YsV0FBQSxJQUFBO01BQ0UsU0FBUyxDQUFDLElBQVYsQ0FBZSxPQUFmO01BQ0EsT0FBQSw0Q0FBMkIsQ0FBRTtNQUM3QixJQUFBLENBQWEsT0FBYjtBQUFBLGNBQUE7O0lBSEY7V0FJQTtFQVBhOztFQVNmLHVCQUFBLEdBQTBCLFNBQUMsT0FBRCxFQUFVLEdBQVY7QUFDeEIsUUFBQTtJQURtQyxjQUFEO0lBQ2xDLE9BQUEsR0FBVTtJQUNWLE9BQUEsR0FBVSxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWIsQ0FBQTtJQUNWLElBQUcsbUJBQUg7TUFDRSxVQUFBLEdBQWEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixXQUEvQixDQUEyQyxDQUFDLGNBQTVDLENBQUEsQ0FBNEQsQ0FBQyxHQUE3RCxDQUFBO01B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QXJEZTtJQXNEZixZQUFBLFVBdERlO0lBdURmLHlCQUFBLHVCQXZEZTtJQXdEZixzQkFBQSxvQkF4RGU7SUF5RGYsc0NBQUEsb0NBekRlO0lBMERmLHVCQUFBLHFCQTFEZTtJQTJEZixpQ0FBQSwrQkEzRGU7SUE0RGYsWUFBQSxVQTVEZTtJQTZEZixxQkFBQSxtQkE3RGU7SUE4RGYsYUFBQSxXQTlEZTtJQStEZix3QkFBQSxzQkEvRGU7SUFpRWYsU0FBQSxPQWpFZTtJQWlFTixZQUFBLFVBakVNO0lBa0VmLG1CQUFBLGlCQWxFZTtJQWtFSSxzQkFBQSxvQkFsRUo7SUFvRWYsNEJBQUEsMEJBcEVlO0lBcUVmLG1DQUFBLGlDQXJFZTtJQXNFZiwwQkFBQSx3QkF0RWU7SUF1RWYsNkJBQUEsMkJBdkVlO0lBd0VmLG9CQUFBLGtCQXhFZTtJQTBFZixpQkFBQSxlQTFFZTtJQTJFZixjQUFBLFlBM0VlO0lBNEVmLGlCQUFBLGVBNUVlO0lBNkVmLGlCQUFBLGVBN0VlO0lBOEVmLHdCQUFBLHNCQTlFZTtJQStFZixvQkFBQSxrQkEvRWU7SUFnRmYsMEJBQUEsd0JBaEZlO0lBaUZmLHFCQUFBLG1CQWpGZTtJQWtGZiwwQkFBQSx3QkFsRmU7SUFtRmYsZ0JBQUEsY0FuRmU7SUFvRmYsZ0JBQUEsY0FwRmU7SUFxRmYsdUJBQUEscUJBckZlO0lBc0ZmLCtCQUFBLDZCQXRGZTtJQXVGZixvQ0FBQSxrQ0F2RmU7SUF3RmYsdUJBQUEscUJBeEZlOztBQWg2QmpCIiwic291cmNlc0NvbnRlbnQiOlsiZnMgPSBudWxsXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4vc2V0dGluZ3MnXG5cbntEaXNwb3NhYmxlLCBSYW5nZSwgUG9pbnR9ID0gcmVxdWlyZSAnYXRvbSdcbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5cbmFzc2VydFdpdGhFeGNlcHRpb24gPSAoY29uZGl0aW9uLCBtZXNzYWdlLCBmbikgLT5cbiAgYXRvbS5hc3NlcnQgY29uZGl0aW9uLCBtZXNzYWdlLCAoZXJyb3IpIC0+XG4gICAgdGhyb3cgbmV3IEVycm9yKGVycm9yLm1lc3NhZ2UpXG5cbmdldEFuY2VzdG9ycyA9IChvYmopIC0+XG4gIGFuY2VzdG9ycyA9IFtdXG4gIGN1cnJlbnQgPSBvYmpcbiAgbG9vcFxuICAgIGFuY2VzdG9ycy5wdXNoKGN1cnJlbnQpXG4gICAgY3VycmVudCA9IGN1cnJlbnQuX19zdXBlcl9fPy5jb25zdHJ1Y3RvclxuICAgIGJyZWFrIHVubGVzcyBjdXJyZW50XG4gIGFuY2VzdG9yc1xuXG5nZXRLZXlCaW5kaW5nRm9yQ29tbWFuZCA9IChjb21tYW5kLCB7cGFja2FnZU5hbWV9KSAtPlxuICByZXN1bHRzID0gbnVsbFxuICBrZXltYXBzID0gYXRvbS5rZXltYXBzLmdldEtleUJpbmRpbmdzKClcbiAgaWYgcGFja2FnZU5hbWU/XG4gICAga2V5bWFwUGF0aCA9IGF0b20ucGFja2FnZXMuZ2V0QWN0aXZlUGFja2FnZShwYWNrYWdlTmFtZSkuZ2V0S2V5bWFwUGF0aHMoKS5wb3AoKVxuICAgIGtleW1hcHMgPSBrZXltYXBzLmZpbHRlcigoe3NvdXJjZX0pIC0+IHNvdXJjZSBpcyBrZXltYXBQYXRoKVxuXG4gIGZvciBrZXltYXAgaW4ga2V5bWFwcyB3aGVuIGtleW1hcC5jb21tYW5kIGlzIGNvbW1hbmRcbiAgICB7a2V5c3Ryb2tlcywgc2VsZWN0b3J9ID0ga2V5bWFwXG4gICAga2V5c3Ryb2tlcyA9IGtleXN0cm9rZXMucmVwbGFjZSgvc2hpZnQtLywgJycpXG4gICAgKHJlc3VsdHMgPz0gW10pLnB1c2goe2tleXN0cm9rZXMsIHNlbGVjdG9yfSlcbiAgcmVzdWx0c1xuXG4jIEluY2x1ZGUgbW9kdWxlKG9iamVjdCB3aGljaCBub3JtYWx5IHByb3ZpZGVzIHNldCBvZiBtZXRob2RzKSB0byBrbGFzc1xuaW5jbHVkZSA9IChrbGFzcywgbW9kdWxlKSAtPlxuICBmb3Iga2V5LCB2YWx1ZSBvZiBtb2R1bGVcbiAgICBrbGFzczo6W2tleV0gPSB2YWx1ZVxuXG5kZWJ1ZyA9IChtZXNzYWdlcy4uLikgLT5cbiAgcmV0dXJuIHVubGVzcyBzZXR0aW5ncy5nZXQoJ2RlYnVnJylcbiAgc3dpdGNoIHNldHRpbmdzLmdldCgnZGVidWdPdXRwdXQnKVxuICAgIHdoZW4gJ2NvbnNvbGUnXG4gICAgICBjb25zb2xlLmxvZyBtZXNzYWdlcy4uLlxuICAgIHdoZW4gJ2ZpbGUnXG4gICAgICBmcyA/PSByZXF1aXJlICdmcy1wbHVzJ1xuICAgICAgZmlsZVBhdGggPSBmcy5ub3JtYWxpemUgc2V0dGluZ3MuZ2V0KCdkZWJ1Z091dHB1dEZpbGVQYXRoJylcbiAgICAgIGlmIGZzLmV4aXN0c1N5bmMoZmlsZVBhdGgpXG4gICAgICAgIGZzLmFwcGVuZEZpbGVTeW5jIGZpbGVQYXRoLCBtZXNzYWdlcyArIFwiXFxuXCJcblxuIyBSZXR1cm4gZnVuY3Rpb24gdG8gcmVzdG9yZSBlZGl0b3IncyBzY3JvbGxUb3AgYW5kIGZvbGQgc3RhdGUuXG5zYXZlRWRpdG9yU3RhdGUgPSAoZWRpdG9yKSAtPlxuICBlZGl0b3JFbGVtZW50ID0gZWRpdG9yLmVsZW1lbnRcbiAgc2Nyb2xsVG9wID0gZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3AoKVxuXG4gIGZvbGRTdGFydFJvd3MgPSBlZGl0b3IuZGlzcGxheUxheWVyLmZvbGRzTWFya2VyTGF5ZXIuZmluZE1hcmtlcnMoe30pLm1hcCAobSkgLT4gbS5nZXRTdGFydFBvc2l0aW9uKCkucm93XG4gIC0+XG4gICAgZm9yIHJvdyBpbiBmb2xkU3RhcnRSb3dzLnJldmVyc2UoKSB3aGVuIG5vdCBlZGl0b3IuaXNGb2xkZWRBdEJ1ZmZlclJvdyhyb3cpXG4gICAgICBlZGl0b3IuZm9sZEJ1ZmZlclJvdyhyb3cpXG4gICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3Aoc2Nyb2xsVG9wKVxuXG5pc0xpbmV3aXNlUmFuZ2UgPSAoe3N0YXJ0LCBlbmR9KSAtPlxuICAoc3RhcnQucm93IGlzbnQgZW5kLnJvdykgYW5kIChzdGFydC5jb2x1bW4gaXMgZW5kLmNvbHVtbiBpcyAwKVxuXG5pc0VuZHNXaXRoTmV3TGluZUZvckJ1ZmZlclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAge3N0YXJ0LCBlbmR9ID0gZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHJvdywgaW5jbHVkZU5ld2xpbmU6IHRydWUpXG4gIHN0YXJ0LnJvdyBpc250IGVuZC5yb3dcblxuc29ydFJhbmdlcyA9IChjb2xsZWN0aW9uKSAtPlxuICBjb2xsZWN0aW9uLnNvcnQgKGEsIGIpIC0+IGEuY29tcGFyZShiKVxuXG4jIFJldHVybiBhZGp1c3RlZCBpbmRleCBmaXQgd2hpdGluIGdpdmVuIGxpc3QncyBsZW5ndGhcbiMgcmV0dXJuIC0xIGlmIGxpc3QgaXMgZW1wdHkuXG5nZXRJbmRleCA9IChpbmRleCwgbGlzdCkgLT5cbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGhcbiAgaWYgbGVuZ3RoIGlzIDBcbiAgICAtMVxuICBlbHNlXG4gICAgaW5kZXggPSBpbmRleCAlIGxlbmd0aFxuICAgIGlmIGluZGV4ID49IDBcbiAgICAgIGluZGV4XG4gICAgZWxzZVxuICAgICAgbGVuZ3RoICsgaW5kZXhcblxuIyBOT1RFOiBlbmRSb3cgYmVjb21lIHVuZGVmaW5lZCBpZiBAZWRpdG9yRWxlbWVudCBpcyBub3QgeWV0IGF0dGFjaGVkLlxuIyBlLmcuIEJlZ2luZyBjYWxsZWQgaW1tZWRpYXRlbHkgYWZ0ZXIgb3BlbiBmaWxlLlxuZ2V0VmlzaWJsZUJ1ZmZlclJhbmdlID0gKGVkaXRvcikgLT5cbiAgW3N0YXJ0Um93LCBlbmRSb3ddID0gZWRpdG9yLmVsZW1lbnQuZ2V0VmlzaWJsZVJvd1JhbmdlKClcbiAgcmV0dXJuIG51bGwgdW5sZXNzIChzdGFydFJvdz8gYW5kIGVuZFJvdz8pXG4gIHN0YXJ0Um93ID0gZWRpdG9yLmJ1ZmZlclJvd0ZvclNjcmVlblJvdyhzdGFydFJvdylcbiAgZW5kUm93ID0gZWRpdG9yLmJ1ZmZlclJvd0ZvclNjcmVlblJvdyhlbmRSb3cpXG4gIG5ldyBSYW5nZShbc3RhcnRSb3csIDBdLCBbZW5kUm93LCBJbmZpbml0eV0pXG5cbmdldFZpc2libGVFZGl0b3JzID0gLT5cbiAgKGVkaXRvciBmb3IgcGFuZSBpbiBhdG9tLndvcmtzcGFjZS5nZXRQYW5lcygpIHdoZW4gZWRpdG9yID0gcGFuZS5nZXRBY3RpdmVFZGl0b3IoKSlcblxuZ2V0RW5kT2ZMaW5lRm9yQnVmZmVyUm93ID0gKGVkaXRvciwgcm93KSAtPlxuICBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocm93KS5lbmRcblxuIyBQb2ludCB1dGlsXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbnBvaW50SXNBdEVuZE9mTGluZSA9IChlZGl0b3IsIHBvaW50KSAtPlxuICBwb2ludCA9IFBvaW50LmZyb21PYmplY3QocG9pbnQpXG4gIGdldEVuZE9mTGluZUZvckJ1ZmZlclJvdyhlZGl0b3IsIHBvaW50LnJvdykuaXNFcXVhbChwb2ludClcblxucG9pbnRJc09uV2hpdGVTcGFjZSA9IChlZGl0b3IsIHBvaW50KSAtPlxuICBjaGFyID0gZ2V0UmlnaHRDaGFyYWN0ZXJGb3JCdWZmZXJQb3NpdGlvbihlZGl0b3IsIHBvaW50KVxuICBub3QgL1xcUy8udGVzdChjaGFyKVxuXG5wb2ludElzQXRFbmRPZkxpbmVBdE5vbkVtcHR5Um93ID0gKGVkaXRvciwgcG9pbnQpIC0+XG4gIHBvaW50ID0gUG9pbnQuZnJvbU9iamVjdChwb2ludClcbiAgcG9pbnQuY29sdW1uIGlzbnQgMCBhbmQgcG9pbnRJc0F0RW5kT2ZMaW5lKGVkaXRvciwgcG9pbnQpXG5cbnBvaW50SXNBdFZpbUVuZE9mRmlsZSA9IChlZGl0b3IsIHBvaW50KSAtPlxuICBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbihlZGl0b3IpLmlzRXF1YWwocG9pbnQpXG5cbmlzRW1wdHlSb3cgPSAoZWRpdG9yLCByb3cpIC0+XG4gIGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhyb3cpLmlzRW1wdHkoKVxuXG5nZXRSaWdodENoYXJhY3RlckZvckJ1ZmZlclBvc2l0aW9uID0gKGVkaXRvciwgcG9pbnQsIGFtb3VudD0xKSAtPlxuICBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoUmFuZ2UuZnJvbVBvaW50V2l0aERlbHRhKHBvaW50LCAwLCBhbW91bnQpKVxuXG5nZXRMZWZ0Q2hhcmFjdGVyRm9yQnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCwgYW1vdW50PTEpIC0+XG4gIGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShSYW5nZS5mcm9tUG9pbnRXaXRoRGVsdGEocG9pbnQsIDAsIC1hbW91bnQpKVxuXG5nZXRUZXh0SW5TY3JlZW5SYW5nZSA9IChlZGl0b3IsIHNjcmVlblJhbmdlKSAtPlxuICBidWZmZXJSYW5nZSA9IGVkaXRvci5idWZmZXJSYW5nZUZvclNjcmVlblJhbmdlKHNjcmVlblJhbmdlKVxuICBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoYnVmZmVyUmFuZ2UpXG5cbmdldE5vbldvcmRDaGFyYWN0ZXJzRm9yQ3Vyc29yID0gKGN1cnNvcikgLT5cbiAgIyBBdG9tIDEuMTEuMC1iZXRhNSBoYXZlIHRoaXMgZXhwZXJpbWVudGFsIG1ldGhvZC5cbiAgaWYgY3Vyc29yLmdldE5vbldvcmRDaGFyYWN0ZXJzP1xuICAgIGN1cnNvci5nZXROb25Xb3JkQ2hhcmFjdGVycygpXG4gIGVsc2VcbiAgICBzY29wZSA9IGN1cnNvci5nZXRTY29wZURlc2NyaXB0b3IoKS5nZXRTY29wZXNBcnJheSgpXG4gICAgYXRvbS5jb25maWcuZ2V0KCdlZGl0b3Iubm9uV29yZENoYXJhY3RlcnMnLCB7c2NvcGV9KVxuXG4jIEZJWE1FOiByZW1vdmUgdGhpc1xuIyByZXR1cm4gdHJ1ZSBpZiBtb3ZlZFxubW92ZUN1cnNvclRvTmV4dE5vbldoaXRlc3BhY2UgPSAoY3Vyc29yKSAtPlxuICBvcmlnaW5hbFBvaW50ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKClcbiAgZWRpdG9yID0gY3Vyc29yLmVkaXRvclxuICB2aW1Fb2YgPSBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbihlZGl0b3IpXG5cbiAgd2hpbGUgcG9pbnRJc09uV2hpdGVTcGFjZShlZGl0b3IsIHBvaW50ID0gY3Vyc29yLmdldEJ1ZmZlclBvc2l0aW9uKCkpIGFuZCBub3QgcG9pbnQuaXNHcmVhdGVyVGhhbk9yRXF1YWwodmltRW9mKVxuICAgIGN1cnNvci5tb3ZlUmlnaHQoKVxuICBub3Qgb3JpZ2luYWxQb2ludC5pc0VxdWFsKGN1cnNvci5nZXRCdWZmZXJQb3NpdGlvbigpKVxuXG5nZXRCdWZmZXJSb3dzID0gKGVkaXRvciwge3N0YXJ0Um93LCBkaXJlY3Rpb259KSAtPlxuICBzd2l0Y2ggZGlyZWN0aW9uXG4gICAgd2hlbiAncHJldmlvdXMnXG4gICAgICBpZiBzdGFydFJvdyA8PSAwXG4gICAgICAgIFtdXG4gICAgICBlbHNlXG4gICAgICAgIFsoc3RhcnRSb3cgLSAxKS4uMF1cbiAgICB3aGVuICduZXh0J1xuICAgICAgZW5kUm93ID0gZ2V0VmltTGFzdEJ1ZmZlclJvdyhlZGl0b3IpXG4gICAgICBpZiBzdGFydFJvdyA+PSBlbmRSb3dcbiAgICAgICAgW11cbiAgICAgIGVsc2VcbiAgICAgICAgWyhzdGFydFJvdyArIDEpLi5lbmRSb3ddXG5cbiMgUmV0dXJuIFZpbSdzIEVPRiBwb3NpdGlvbiByYXRoZXIgdGhhbiBBdG9tJ3MgRU9GIHBvc2l0aW9uLlxuIyBUaGlzIGZ1bmN0aW9uIGNoYW5nZSBtZWFuaW5nIG9mIEVPRiBmcm9tIG5hdGl2ZSBUZXh0RWRpdG9yOjpnZXRFb2ZCdWZmZXJQb3NpdGlvbigpXG4jIEF0b20gaXMgc3BlY2lhbChzdHJhbmdlKSBmb3IgY3Vyc29yIGNhbiBwYXN0IHZlcnkgbGFzdCBuZXdsaW5lIGNoYXJhY3Rlci5cbiMgQmVjYXVzZSBvZiB0aGlzLCBBdG9tJ3MgRU9GIHBvc2l0aW9uIGlzIFthY3R1YWxMYXN0Um93KzEsIDBdIHByb3ZpZGVkIGxhc3Qtbm9uLWJsYW5rLXJvd1xuIyBlbmRzIHdpdGggbmV3bGluZSBjaGFyLlxuIyBCdXQgaW4gVmltLCBjdXJvciBjYW4gTk9UIHBhc3QgbGFzdCBuZXdsaW5lLiBFT0YgaXMgbmV4dCBwb3NpdGlvbiBvZiB2ZXJ5IGxhc3QgY2hhcmFjdGVyLlxuZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yKSAtPlxuICBlb2YgPSBlZGl0b3IuZ2V0RW9mQnVmZmVyUG9zaXRpb24oKVxuICBpZiAoZW9mLnJvdyBpcyAwKSBvciAoZW9mLmNvbHVtbiA+IDApXG4gICAgZW9mXG4gIGVsc2VcbiAgICBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3coZWRpdG9yLCBlb2Yucm93IC0gMSlcblxuZ2V0VmltRW9mU2NyZWVuUG9zaXRpb24gPSAoZWRpdG9yKSAtPlxuICBlZGl0b3Iuc2NyZWVuUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbihnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvbihlZGl0b3IpKVxuXG5nZXRWaW1MYXN0QnVmZmVyUm93ID0gKGVkaXRvcikgLT4gZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oZWRpdG9yKS5yb3dcbmdldFZpbUxhc3RTY3JlZW5Sb3cgPSAoZWRpdG9yKSAtPiBnZXRWaW1Fb2ZTY3JlZW5Qb3NpdGlvbihlZGl0b3IpLnJvd1xuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93ID0gKGVkaXRvcikgLT4gZWRpdG9yLmVsZW1lbnQuZ2V0Rmlyc3RWaXNpYmxlU2NyZWVuUm93KClcbmdldExhc3RWaXNpYmxlU2NyZWVuUm93ID0gKGVkaXRvcikgLT4gZWRpdG9yLmVsZW1lbnQuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKVxuXG5nZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93ID0gKGVkaXRvciwgcm93KSAtPlxuICByYW5nZSA9IGZpbmRSYW5nZUluQnVmZmVyUm93KGVkaXRvciwgL1xcUy8sIHJvdylcbiAgcmFuZ2U/LnN0YXJ0ID8gbmV3IFBvaW50KHJvdywgMClcblxudHJpbVJhbmdlID0gKGVkaXRvciwgc2NhblJhbmdlKSAtPlxuICBwYXR0ZXJuID0gL1xcUy9cbiAgW3N0YXJ0LCBlbmRdID0gW11cbiAgc2V0U3RhcnQgPSAoe3JhbmdlfSkgLT4ge3N0YXJ0fSA9IHJhbmdlXG4gIHNldEVuZCA9ICh7cmFuZ2V9KSAtPiB7ZW5kfSA9IHJhbmdlXG4gIGVkaXRvci5zY2FuSW5CdWZmZXJSYW5nZShwYXR0ZXJuLCBzY2FuUmFuZ2UsIHNldFN0YXJ0KVxuICBlZGl0b3IuYmFja3dhcmRzU2NhbkluQnVmZmVyUmFuZ2UocGF0dGVybiwgc2NhblJhbmdlLCBzZXRFbmQpIGlmIHN0YXJ0P1xuICBpZiBzdGFydD8gYW5kIGVuZD9cbiAgICBuZXcgUmFuZ2Uoc3RhcnQsIGVuZClcbiAgZWxzZVxuICAgIHNjYW5SYW5nZVxuXG4jIEN1cnNvciBtb3Rpb24gd3JhcHBlclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEp1c3QgdXBkYXRlIGJ1ZmZlclJvdyB3aXRoIGtlZXBpbmcgY29sdW1uIGJ5IHJlc3BlY3RpbmcgZ29hbENvbHVtblxuc2V0QnVmZmVyUm93ID0gKGN1cnNvciwgcm93LCBvcHRpb25zKSAtPlxuICBjb2x1bW4gPSBjdXJzb3IuZ29hbENvbHVtbiA/IGN1cnNvci5nZXRCdWZmZXJDb2x1bW4oKVxuICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW3JvdywgY29sdW1uXSwgb3B0aW9ucylcbiAgY3Vyc29yLmdvYWxDb2x1bW4gPSBjb2x1bW5cblxuc2V0QnVmZmVyQ29sdW1uID0gKGN1cnNvciwgY29sdW1uKSAtPlxuICBjdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oW2N1cnNvci5nZXRCdWZmZXJSb3coKSwgY29sdW1uXSlcblxubW92ZUN1cnNvciA9IChjdXJzb3IsIHtwcmVzZXJ2ZUdvYWxDb2x1bW59LCBmbikgLT5cbiAge2dvYWxDb2x1bW59ID0gY3Vyc29yXG4gIGZuKGN1cnNvcilcbiAgaWYgcHJlc2VydmVHb2FsQ29sdW1uIGFuZCBnb2FsQ29sdW1uP1xuICAgIGN1cnNvci5nb2FsQ29sdW1uID0gZ29hbENvbHVtblxuXG4jIFdvcmthcm91bmQgaXNzdWUgZm9yIHQ5bWQvdmltLW1vZGUtcGx1cyMyMjYgYW5kIGF0b20vYXRvbSMzMTc0XG4jIEkgY2Fubm90IGRlcGVuZCBjdXJzb3IncyBjb2x1bW4gc2luY2UgaXRzIGNsYWltIDAgYW5kIGNsaXBwaW5nIGVtbXVsYXRpb24gZG9uJ3RcbiMgcmV0dXJuIHdyYXBwZWQgbGluZSwgYnV0IEl0IGFjdHVhbGx5IHdyYXAsIHNvIEkgbmVlZCB0byBkbyB2ZXJ5IGRpcnR5IHdvcmsgdG9cbiMgcHJlZGljdCB3cmFwIGh1cmlzdGljYWxseS5cbnNob3VsZFByZXZlbnRXcmFwTGluZSA9IChjdXJzb3IpIC0+XG4gIHtyb3csIGNvbHVtbn0gPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5zb2Z0VGFicycpXG4gICAgdGFiTGVuZ3RoID0gYXRvbS5jb25maWcuZ2V0KCdlZGl0b3IudGFiTGVuZ3RoJylcbiAgICBpZiAwIDwgY29sdW1uIDwgdGFiTGVuZ3RoXG4gICAgICB0ZXh0ID0gY3Vyc29yLmVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShbW3JvdywgMF0sIFtyb3csIHRhYkxlbmd0aF1dKVxuICAgICAgL15cXHMrJC8udGVzdCh0ZXh0KVxuICAgIGVsc2VcbiAgICAgIGZhbHNlXG5cbiMgb3B0aW9uczpcbiMgICBhbGxvd1dyYXA6IHRvIGNvbnRyb2xsIGFsbG93IHdyYXBcbiMgICBwcmVzZXJ2ZUdvYWxDb2x1bW46IHByZXNlcnZlIG9yaWdpbmFsIGdvYWxDb2x1bW5cbm1vdmVDdXJzb3JMZWZ0ID0gKGN1cnNvciwgb3B0aW9ucz17fSkgLT5cbiAge2FsbG93V3JhcCwgbmVlZFNwZWNpYWxDYXJlVG9QcmV2ZW50V3JhcExpbmV9ID0gb3B0aW9uc1xuICBkZWxldGUgb3B0aW9ucy5hbGxvd1dyYXBcbiAgaWYgbmVlZFNwZWNpYWxDYXJlVG9QcmV2ZW50V3JhcExpbmVcbiAgICByZXR1cm4gaWYgc2hvdWxkUHJldmVudFdyYXBMaW5lKGN1cnNvcilcblxuICBpZiBub3QgY3Vyc29yLmlzQXRCZWdpbm5pbmdPZkxpbmUoKSBvciBhbGxvd1dyYXBcbiAgICBtb3Rpb24gPSAoY3Vyc29yKSAtPiBjdXJzb3IubW92ZUxlZnQoKVxuICAgIG1vdmVDdXJzb3IoY3Vyc29yLCBvcHRpb25zLCBtb3Rpb24pXG5cbm1vdmVDdXJzb3JSaWdodCA9IChjdXJzb3IsIG9wdGlvbnM9e30pIC0+XG4gIHthbGxvd1dyYXB9ID0gb3B0aW9uc1xuICBkZWxldGUgb3B0aW9ucy5hbGxvd1dyYXBcbiAgaWYgbm90IGN1cnNvci5pc0F0RW5kT2ZMaW5lKCkgb3IgYWxsb3dXcmFwXG4gICAgbW90aW9uID0gKGN1cnNvcikgLT4gY3Vyc29yLm1vdmVSaWdodCgpXG4gICAgbW92ZUN1cnNvcihjdXJzb3IsIG9wdGlvbnMsIG1vdGlvbilcblxubW92ZUN1cnNvclVwU2NyZWVuID0gKGN1cnNvciwgb3B0aW9ucz17fSkgLT5cbiAgdW5sZXNzIGN1cnNvci5nZXRTY3JlZW5Sb3coKSBpcyAwXG4gICAgbW90aW9uID0gKGN1cnNvcikgLT4gY3Vyc29yLm1vdmVVcCgpXG4gICAgbW92ZUN1cnNvcihjdXJzb3IsIG9wdGlvbnMsIG1vdGlvbilcblxubW92ZUN1cnNvckRvd25TY3JlZW4gPSAoY3Vyc29yLCBvcHRpb25zPXt9KSAtPlxuICB1bmxlc3MgZ2V0VmltTGFzdFNjcmVlblJvdyhjdXJzb3IuZWRpdG9yKSBpcyBjdXJzb3IuZ2V0U2NyZWVuUm93KClcbiAgICBtb3Rpb24gPSAoY3Vyc29yKSAtPiBjdXJzb3IubW92ZURvd24oKVxuICAgIG1vdmVDdXJzb3IoY3Vyc29yLCBvcHRpb25zLCBtb3Rpb24pXG5cbm1vdmVDdXJzb3JUb0ZpcnN0Q2hhcmFjdGVyQXRSb3cgPSAoY3Vyc29yLCByb3cpIC0+XG4gIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihbcm93LCAwXSlcbiAgY3Vyc29yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKClcblxuZ2V0VmFsaWRWaW1CdWZmZXJSb3cgPSAoZWRpdG9yLCByb3cpIC0+IGxpbWl0TnVtYmVyKHJvdywgbWluOiAwLCBtYXg6IGdldFZpbUxhc3RCdWZmZXJSb3coZWRpdG9yKSlcblxuZ2V0VmFsaWRWaW1TY3JlZW5Sb3cgPSAoZWRpdG9yLCByb3cpIC0+IGxpbWl0TnVtYmVyKHJvdywgbWluOiAwLCBtYXg6IGdldFZpbUxhc3RTY3JlZW5Sb3coZWRpdG9yKSlcblxuIyBCeSBkZWZhdWx0IG5vdCBpbmNsdWRlIGNvbHVtblxuZ2V0TGluZVRleHRUb0J1ZmZlclBvc2l0aW9uID0gKGVkaXRvciwge3JvdywgY29sdW1ufSwge2V4Y2x1c2l2ZX09e30pIC0+XG4gIGlmIGV4Y2x1c2l2ZSA/IHRydWVcbiAgICBlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocm93KVswLi4uY29sdW1uXVxuICBlbHNlXG4gICAgZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHJvdylbMC4uY29sdW1uXVxuXG5nZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgZWRpdG9yLmluZGVudExldmVsRm9yTGluZShlZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocm93KSlcblxuZ2V0Q29kZUZvbGRSb3dSYW5nZXMgPSAoZWRpdG9yKSAtPlxuICBbMC4uZWRpdG9yLmdldExhc3RCdWZmZXJSb3coKV1cbiAgICAubWFwIChyb3cpIC0+XG4gICAgICBlZGl0b3IubGFuZ3VhZ2VNb2RlLnJvd1JhbmdlRm9yQ29kZUZvbGRBdEJ1ZmZlclJvdyhyb3cpXG4gICAgLmZpbHRlciAocm93UmFuZ2UpIC0+XG4gICAgICByb3dSYW5nZT8gYW5kIHJvd1JhbmdlWzBdPyBhbmQgcm93UmFuZ2VbMV0/XG5cbiMgVXNlZCBpbiB2bXAtamFzbWluZS1pbmNyZWFzZS1mb2N1c1xuZ2V0Q29kZUZvbGRSb3dSYW5nZXNDb250YWluZXNGb3JSb3cgPSAoZWRpdG9yLCBidWZmZXJSb3csIHtpbmNsdWRlU3RhcnRSb3d9PXt9KSAtPlxuICBpbmNsdWRlU3RhcnRSb3cgPz0gdHJ1ZVxuICBnZXRDb2RlRm9sZFJvd1JhbmdlcyhlZGl0b3IpLmZpbHRlciAoW3N0YXJ0Um93LCBlbmRSb3ddKSAtPlxuICAgIGlmIGluY2x1ZGVTdGFydFJvd1xuICAgICAgc3RhcnRSb3cgPD0gYnVmZmVyUm93IDw9IGVuZFJvd1xuICAgIGVsc2VcbiAgICAgIHN0YXJ0Um93IDwgYnVmZmVyUm93IDw9IGVuZFJvd1xuXG5nZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlID0gKGVkaXRvciwgcm93UmFuZ2UpIC0+XG4gIFtzdGFydFJhbmdlLCBlbmRSYW5nZV0gPSByb3dSYW5nZS5tYXAgKHJvdykgLT5cbiAgICBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cocm93LCBpbmNsdWRlTmV3bGluZTogdHJ1ZSlcbiAgc3RhcnRSYW5nZS51bmlvbihlbmRSYW5nZSlcblxuZ2V0VG9rZW5pemVkTGluZUZvclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgZWRpdG9yLnRva2VuaXplZEJ1ZmZlci50b2tlbml6ZWRMaW5lRm9yUm93KHJvdylcblxuZ2V0U2NvcGVzRm9yVG9rZW5pemVkTGluZSA9IChsaW5lKSAtPlxuICBmb3IgdGFnIGluIGxpbmUudGFncyB3aGVuIHRhZyA8IDAgYW5kICh0YWcgJSAyIGlzIC0xKVxuICAgIGF0b20uZ3JhbW1hcnMuc2NvcGVGb3JJZCh0YWcpXG5cbnNjYW5Gb3JTY29wZVN0YXJ0ID0gKGVkaXRvciwgZnJvbVBvaW50LCBkaXJlY3Rpb24sIGZuKSAtPlxuICBmcm9tUG9pbnQgPSBQb2ludC5mcm9tT2JqZWN0KGZyb21Qb2ludClcbiAgc2NhblJvd3MgPSBzd2l0Y2ggZGlyZWN0aW9uXG4gICAgd2hlbiAnZm9yd2FyZCcgdGhlbiBbKGZyb21Qb2ludC5yb3cpLi5lZGl0b3IuZ2V0TGFzdEJ1ZmZlclJvdygpXVxuICAgIHdoZW4gJ2JhY2t3YXJkJyB0aGVuIFsoZnJvbVBvaW50LnJvdykuLjBdXG5cbiAgY29udGludWVTY2FuID0gdHJ1ZVxuICBzdG9wID0gLT5cbiAgICBjb250aW51ZVNjYW4gPSBmYWxzZVxuXG4gIGlzVmFsaWRUb2tlbiA9IHN3aXRjaCBkaXJlY3Rpb25cbiAgICB3aGVuICdmb3J3YXJkJyB0aGVuICh7cG9zaXRpb259KSAtPiBwb3NpdGlvbi5pc0dyZWF0ZXJUaGFuKGZyb21Qb2ludClcbiAgICB3aGVuICdiYWNrd2FyZCcgdGhlbiAoe3Bvc2l0aW9ufSkgLT4gcG9zaXRpb24uaXNMZXNzVGhhbihmcm9tUG9pbnQpXG5cbiAgZm9yIHJvdyBpbiBzY2FuUm93cyB3aGVuIHRva2VuaXplZExpbmUgPSBnZXRUb2tlbml6ZWRMaW5lRm9yUm93KGVkaXRvciwgcm93KVxuICAgIGNvbHVtbiA9IDBcbiAgICByZXN1bHRzID0gW11cblxuICAgIHRva2VuSXRlcmF0b3IgPSB0b2tlbml6ZWRMaW5lLmdldFRva2VuSXRlcmF0b3IoKVxuICAgIGZvciB0YWcgaW4gdG9rZW5pemVkTGluZS50YWdzXG4gICAgICB0b2tlbkl0ZXJhdG9yLm5leHQoKVxuICAgICAgaWYgdGFnIDwgMCAjIE5lZ2F0aXZlOiBzdGFydC9zdG9wIHRva2VuXG4gICAgICAgIHNjb3BlID0gYXRvbS5ncmFtbWFycy5zY29wZUZvcklkKHRhZylcbiAgICAgICAgaWYgKHRhZyAlIDIpIGlzIDAgIyBFdmVuOiBzY29wZSBzdG9wXG4gICAgICAgICAgbnVsbFxuICAgICAgICBlbHNlICMgT2RkOiBzY29wZSBzdGFydFxuICAgICAgICAgIHBvc2l0aW9uID0gbmV3IFBvaW50KHJvdywgY29sdW1uKVxuICAgICAgICAgIHJlc3VsdHMucHVzaCB7c2NvcGUsIHBvc2l0aW9uLCBzdG9wfVxuICAgICAgZWxzZVxuICAgICAgICBjb2x1bW4gKz0gdGFnXG5cbiAgICByZXN1bHRzID0gcmVzdWx0cy5maWx0ZXIoaXNWYWxpZFRva2VuKVxuICAgIHJlc3VsdHMucmV2ZXJzZSgpIGlmIGRpcmVjdGlvbiBpcyAnYmFja3dhcmQnXG4gICAgZm9yIHJlc3VsdCBpbiByZXN1bHRzXG4gICAgICBmbihyZXN1bHQpXG4gICAgICByZXR1cm4gdW5sZXNzIGNvbnRpbnVlU2NhblxuICAgIHJldHVybiB1bmxlc3MgY29udGludWVTY2FuXG5cbmRldGVjdFNjb3BlU3RhcnRQb3NpdGlvbkZvclNjb3BlID0gKGVkaXRvciwgZnJvbVBvaW50LCBkaXJlY3Rpb24sIHNjb3BlKSAtPlxuICBwb2ludCA9IG51bGxcbiAgc2NhbkZvclNjb3BlU3RhcnQgZWRpdG9yLCBmcm9tUG9pbnQsIGRpcmVjdGlvbiwgKGluZm8pIC0+XG4gICAgaWYgaW5mby5zY29wZS5zZWFyY2goc2NvcGUpID49IDBcbiAgICAgIGluZm8uc3RvcCgpXG4gICAgICBwb2ludCA9IGluZm8ucG9zaXRpb25cbiAgcG9pbnRcblxuaXNJbmNsdWRlRnVuY3Rpb25TY29wZUZvclJvdyA9IChlZGl0b3IsIHJvdykgLT5cbiAgIyBbRklYTUVdIEJ1ZyBvZiB1cHN0cmVhbT9cbiAgIyBTb21ldGltZSB0b2tlbml6ZWRMaW5lcyBsZW5ndGggaXMgbGVzcyB0aGFuIGxhc3QgYnVmZmVyIHJvdy5cbiAgIyBTbyB0b2tlbml6ZWRMaW5lIGlzIG5vdCBhY2Nlc3NpYmxlIGV2ZW4gaWYgdmFsaWQgcm93LlxuICAjIEluIHRoYXQgY2FzZSBJIHNpbXBseSByZXR1cm4gZW1wdHkgQXJyYXkuXG4gIGlmIHRva2VuaXplZExpbmUgPSBnZXRUb2tlbml6ZWRMaW5lRm9yUm93KGVkaXRvciwgcm93KVxuICAgIGdldFNjb3Blc0ZvclRva2VuaXplZExpbmUodG9rZW5pemVkTGluZSkuc29tZSAoc2NvcGUpIC0+XG4gICAgICBpc0Z1bmN0aW9uU2NvcGUoZWRpdG9yLCBzY29wZSlcbiAgZWxzZVxuICAgIGZhbHNlXG5cbiMgW0ZJWE1FXSB2ZXJ5IHJvdWdoIHN0YXRlLCBuZWVkIGltcHJvdmVtZW50LlxuaXNGdW5jdGlvblNjb3BlID0gKGVkaXRvciwgc2NvcGUpIC0+XG4gIHN3aXRjaCBlZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZVxuICAgIHdoZW4gJ3NvdXJjZS5nbycsICdzb3VyY2UuZWxpeGlyJ1xuICAgICAgc2NvcGVzID0gWydlbnRpdHkubmFtZS5mdW5jdGlvbiddXG4gICAgd2hlbiAnc291cmNlLnJ1YnknXG4gICAgICBzY29wZXMgPSBbJ21ldGEuZnVuY3Rpb24uJywgJ21ldGEuY2xhc3MuJywgJ21ldGEubW9kdWxlLiddXG4gICAgZWxzZVxuICAgICAgc2NvcGVzID0gWydtZXRhLmZ1bmN0aW9uLicsICdtZXRhLmNsYXNzLiddXG4gIHBhdHRlcm4gPSBuZXcgUmVnRXhwKCdeJyArIHNjb3Blcy5tYXAoXy5lc2NhcGVSZWdFeHApLmpvaW4oJ3wnKSlcbiAgcGF0dGVybi50ZXN0KHNjb3BlKVxuXG4jIFNjcm9sbCB0byBidWZmZXJQb3NpdGlvbiB3aXRoIG1pbmltdW0gYW1vdW50IHRvIGtlZXAgb3JpZ2luYWwgdmlzaWJsZSBhcmVhLlxuIyBJZiB0YXJnZXQgcG9zaXRpb24gd29uJ3QgZml0IHdpdGhpbiBvbmVQYWdlVXAgb3Igb25lUGFnZURvd24sIGl0IGNlbnRlciB0YXJnZXQgcG9pbnQuXG5zbWFydFNjcm9sbFRvQnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCkgLT5cbiAgZWRpdG9yRWxlbWVudCA9IGVkaXRvci5lbGVtZW50XG4gIGVkaXRvckFyZWFIZWlnaHQgPSBlZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKCkgKiAoZWRpdG9yLmdldFJvd3NQZXJQYWdlKCkgLSAxKVxuICBvbmVQYWdlVXAgPSBlZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcCgpIC0gZWRpdG9yQXJlYUhlaWdodCAjIE5vIG5lZWQgdG8gbGltaXQgdG8gbWluPTBcbiAgb25lUGFnZURvd24gPSBlZGl0b3JFbGVtZW50LmdldFNjcm9sbEJvdHRvbSgpICsgZWRpdG9yQXJlYUhlaWdodFxuICB0YXJnZXQgPSBlZGl0b3JFbGVtZW50LnBpeGVsUG9zaXRpb25Gb3JCdWZmZXJQb3NpdGlvbihwb2ludCkudG9wXG5cbiAgY2VudGVyID0gKG9uZVBhZ2VEb3duIDwgdGFyZ2V0KSBvciAodGFyZ2V0IDwgb25lUGFnZVVwKVxuICBlZGl0b3Iuc2Nyb2xsVG9CdWZmZXJQb3NpdGlvbihwb2ludCwge2NlbnRlcn0pXG5cbm1hdGNoU2NvcGVzID0gKGVkaXRvckVsZW1lbnQsIHNjb3BlcykgLT5cbiAgY2xhc3NlcyA9IHNjb3Blcy5tYXAgKHNjb3BlKSAtPiBzY29wZS5zcGxpdCgnLicpXG5cbiAgZm9yIGNsYXNzTmFtZXMgaW4gY2xhc3Nlc1xuICAgIGNvbnRhaW5zQ291bnQgPSAwXG4gICAgZm9yIGNsYXNzTmFtZSBpbiBjbGFzc05hbWVzXG4gICAgICBjb250YWluc0NvdW50ICs9IDEgaWYgZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKVxuICAgIHJldHVybiB0cnVlIGlmIGNvbnRhaW5zQ291bnQgaXMgY2xhc3NOYW1lcy5sZW5ndGhcbiAgZmFsc2VcblxuaXNTaW5nbGVMaW5lVGV4dCA9ICh0ZXh0KSAtPlxuICB0ZXh0LnNwbGl0KC9cXG58XFxyXFxuLykubGVuZ3RoIGlzIDFcblxuIyBSZXR1cm4gYnVmZmVyUmFuZ2UgYW5kIGtpbmQgWyd3aGl0ZS1zcGFjZScsICdub24td29yZCcsICd3b3JkJ11cbiNcbiMgVGhpcyBmdW5jdGlvbiBtb2RpZnkgd29yZFJlZ2V4IHNvIHRoYXQgaXQgZmVlbCBOQVRVUkFMIGluIFZpbSdzIG5vcm1hbCBtb2RlLlxuIyBJbiBub3JtYWwtbW9kZSwgY3Vyc29yIGlzIHJhY3RhbmdsZShub3QgcGlwZSh8KSBjaGFyKS5cbiMgQ3Vyc29yIGlzIGxpa2UgT04gd29yZCByYXRoZXIgdGhhbiBCRVRXRUVOIHdvcmQuXG4jIFRoZSBtb2RpZmljYXRpb24gaXMgdGFpbG9yZCBsaWtlIHRoaXNcbiMgICAtIE9OIHdoaXRlLXNwYWNlOiBJbmNsdWRzIG9ubHkgd2hpdGUtc3BhY2VzLlxuIyAgIC0gT04gbm9uLXdvcmQ6IEluY2x1ZHMgb25seSBub24gd29yZCBjaGFyKD1leGNsdWRlcyBub3JtYWwgd29yZCBjaGFyKS5cbiNcbiMgVmFsaWQgb3B0aW9uc1xuIyAgLSB3b3JkUmVnZXg6IGluc3RhbmNlIG9mIFJlZ0V4cFxuIyAgLSBub25Xb3JkQ2hhcmFjdGVyczogc3RyaW5nXG5nZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50LCBvcHRpb25zPXt9KSAtPlxuICB7c2luZ2xlTm9uV29yZENoYXIsIHdvcmRSZWdleCwgbm9uV29yZENoYXJhY3RlcnMsIGN1cnNvcn0gPSBvcHRpb25zXG4gIGlmIG5vdCB3b3JkUmVnZXg/IG9yIG5vdCBub25Xb3JkQ2hhcmFjdGVycz8gIyBDb21wbGVtZW50IGZyb20gY3Vyc29yXG4gICAgY3Vyc29yID89IGVkaXRvci5nZXRMYXN0Q3Vyc29yKClcbiAgICB7d29yZFJlZ2V4LCBub25Xb3JkQ2hhcmFjdGVyc30gPSBfLmV4dGVuZChvcHRpb25zLCBidWlsZFdvcmRQYXR0ZXJuQnlDdXJzb3IoY3Vyc29yLCBvcHRpb25zKSlcbiAgc2luZ2xlTm9uV29yZENoYXIgPz0gdHJ1ZVxuXG4gIGNoYXJhY3RlckF0UG9pbnQgPSBnZXRSaWdodENoYXJhY3RlckZvckJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgcG9pbnQpXG4gIG5vbldvcmRSZWdleCA9IG5ldyBSZWdFeHAoXCJbI3tfLmVzY2FwZVJlZ0V4cChub25Xb3JkQ2hhcmFjdGVycyl9XStcIilcblxuICBpZiAvXFxzLy50ZXN0KGNoYXJhY3RlckF0UG9pbnQpXG4gICAgc291cmNlID0gXCJbXFx0IF0rXCJcbiAgICBraW5kID0gJ3doaXRlLXNwYWNlJ1xuICAgIHdvcmRSZWdleCA9IG5ldyBSZWdFeHAoc291cmNlKVxuICBlbHNlIGlmIG5vbldvcmRSZWdleC50ZXN0KGNoYXJhY3RlckF0UG9pbnQpIGFuZCBub3Qgd29yZFJlZ2V4LnRlc3QoY2hhcmFjdGVyQXRQb2ludClcbiAgICBraW5kID0gJ25vbi13b3JkJ1xuICAgIGlmIHNpbmdsZU5vbldvcmRDaGFyXG4gICAgICBzb3VyY2UgPSBfLmVzY2FwZVJlZ0V4cChjaGFyYWN0ZXJBdFBvaW50KVxuICAgICAgd29yZFJlZ2V4ID0gbmV3IFJlZ0V4cChzb3VyY2UpXG4gICAgZWxzZVxuICAgICAgd29yZFJlZ2V4ID0gbm9uV29yZFJlZ2V4XG4gIGVsc2VcbiAgICBraW5kID0gJ3dvcmQnXG5cbiAgcmFuZ2UgPSBnZXRXb3JkQnVmZmVyUmFuZ2VBdEJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgcG9pbnQsIHt3b3JkUmVnZXh9KVxuICB7a2luZCwgcmFuZ2V9XG5cbmdldFdvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50LCBvcHRpb25zPXt9KSAtPlxuICBib3VuZGFyaXplRm9yV29yZCA9IG9wdGlvbnMuYm91bmRhcml6ZUZvcldvcmQgPyB0cnVlXG4gIGRlbGV0ZSBvcHRpb25zLmJvdW5kYXJpemVGb3JXb3JkXG4gIHtyYW5nZSwga2luZH0gPSBnZXRXb3JkQnVmZmVyUmFuZ2VBbmRLaW5kQXRCdWZmZXJQb3NpdGlvbihlZGl0b3IsIHBvaW50LCBvcHRpb25zKVxuICB0ZXh0ID0gZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlKVxuICBwYXR0ZXJuID0gXy5lc2NhcGVSZWdFeHAodGV4dClcblxuICBpZiBraW5kIGlzICd3b3JkJyBhbmQgYm91bmRhcml6ZUZvcldvcmRcbiAgICAjIFNldCB3b3JkLWJvdW5kYXJ5KCBcXGIgKSBhbmNob3Igb25seSB3aGVuIGl0J3MgZWZmZWN0aXZlICM2ODlcbiAgICBzdGFydEJvdW5kYXJ5ID0gaWYgL15cXHcvLnRlc3QodGV4dCkgdGhlbiBcIlxcXFxiXCIgZWxzZSAnJ1xuICAgIGVuZEJvdW5kYXJ5ID0gaWYgL1xcdyQvLnRlc3QodGV4dCkgdGhlbiBcIlxcXFxiXCIgZWxzZSAnJ1xuICAgIHBhdHRlcm4gPSBzdGFydEJvdW5kYXJ5ICsgcGF0dGVybiArIGVuZEJvdW5kYXJ5XG4gIG5ldyBSZWdFeHAocGF0dGVybiwgJ2cnKVxuXG5nZXRTdWJ3b3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCwgb3B0aW9ucz17fSkgLT5cbiAgb3B0aW9ucyA9IHt3b3JkUmVnZXg6IGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuc3Vid29yZFJlZ0V4cCgpLCBib3VuZGFyaXplRm9yV29yZDogZmFsc2V9XG4gIGdldFdvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvbihlZGl0b3IsIHBvaW50LCBvcHRpb25zKVxuXG4jIFJldHVybiBvcHRpb25zIHVzZWQgZm9yIGdldFdvcmRCdWZmZXJSYW5nZUF0QnVmZmVyUG9zaXRpb25cbmJ1aWxkV29yZFBhdHRlcm5CeUN1cnNvciA9IChjdXJzb3IsIHt3b3JkUmVnZXh9KSAtPlxuICBub25Xb3JkQ2hhcmFjdGVycyA9IGdldE5vbldvcmRDaGFyYWN0ZXJzRm9yQ3Vyc29yKGN1cnNvcilcbiAgd29yZFJlZ2V4ID89IG5ldyBSZWdFeHAoXCJeW1xcdCBdKiR8W15cXFxccyN7Xy5lc2NhcGVSZWdFeHAobm9uV29yZENoYXJhY3RlcnMpfV0rXCIpXG4gIHt3b3JkUmVnZXgsIG5vbldvcmRDaGFyYWN0ZXJzfVxuXG5nZXRCZWdpbm5pbmdPZldvcmRCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvaW50LCB7d29yZFJlZ2V4fT17fSkgLT5cbiAgc2NhblJhbmdlID0gW1twb2ludC5yb3csIDBdLCBwb2ludF1cblxuICBmb3VuZCA9IG51bGxcbiAgZWRpdG9yLmJhY2t3YXJkc1NjYW5JbkJ1ZmZlclJhbmdlIHdvcmRSZWdleCwgc2NhblJhbmdlLCAoe3JhbmdlLCBtYXRjaFRleHQsIHN0b3B9KSAtPlxuICAgIHJldHVybiBpZiBtYXRjaFRleHQgaXMgJycgYW5kIHJhbmdlLnN0YXJ0LmNvbHVtbiBpc250IDBcblxuICAgIGlmIHJhbmdlLnN0YXJ0LmlzTGVzc1RoYW4ocG9pbnQpXG4gICAgICBpZiByYW5nZS5lbmQuaXNHcmVhdGVyVGhhbk9yRXF1YWwocG9pbnQpXG4gICAgICAgIGZvdW5kID0gcmFuZ2Uuc3RhcnRcbiAgICAgIHN0b3AoKVxuXG4gIGZvdW5kID8gcG9pbnRcblxuZ2V0RW5kT2ZXb3JkQnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCwge3dvcmRSZWdleH09e30pIC0+XG4gIHNjYW5SYW5nZSA9IFtwb2ludCwgW3BvaW50LnJvdywgSW5maW5pdHldXVxuXG4gIGZvdW5kID0gbnVsbFxuICBlZGl0b3Iuc2NhbkluQnVmZmVyUmFuZ2Ugd29yZFJlZ2V4LCBzY2FuUmFuZ2UsICh7cmFuZ2UsIG1hdGNoVGV4dCwgc3RvcH0pIC0+XG4gICAgcmV0dXJuIGlmIG1hdGNoVGV4dCBpcyAnJyBhbmQgcmFuZ2Uuc3RhcnQuY29sdW1uIGlzbnQgMFxuXG4gICAgaWYgcmFuZ2UuZW5kLmlzR3JlYXRlclRoYW4ocG9pbnQpXG4gICAgICBpZiByYW5nZS5zdGFydC5pc0xlc3NUaGFuT3JFcXVhbChwb2ludClcbiAgICAgICAgZm91bmQgPSByYW5nZS5lbmRcbiAgICAgIHN0b3AoKVxuXG4gIGZvdW5kID8gcG9pbnRcblxuZ2V0V29yZEJ1ZmZlclJhbmdlQXRCdWZmZXJQb3NpdGlvbiA9IChlZGl0b3IsIHBvc2l0aW9uLCBvcHRpb25zPXt9KSAtPlxuICBlbmRQb3NpdGlvbiA9IGdldEVuZE9mV29yZEJ1ZmZlclBvc2l0aW9uKGVkaXRvciwgcG9zaXRpb24sIG9wdGlvbnMpXG4gIHN0YXJ0UG9zaXRpb24gPSBnZXRCZWdpbm5pbmdPZldvcmRCdWZmZXJQb3NpdGlvbihlZGl0b3IsIGVuZFBvc2l0aW9uLCBvcHRpb25zKVxuICBuZXcgUmFuZ2Uoc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24pXG5cbiMgV2hlbiByYW5nZSBpcyBsaW5ld2lzZSByYW5nZSwgcmFuZ2UgZW5kIGhhdmUgY29sdW1uIDAgb2YgTkVYVCByb3cuXG4jIFdoaWNoIGlzIHZlcnkgdW5pbnR1aXRpdmUgYW5kIHVud2FudGVkIHJlc3VsdC5cbnNocmlua1JhbmdlRW5kVG9CZWZvcmVOZXdMaW5lID0gKHJhbmdlKSAtPlxuICB7c3RhcnQsIGVuZH0gPSByYW5nZVxuICBpZiBlbmQuY29sdW1uIGlzIDBcbiAgICBlbmRSb3cgPSBsaW1pdE51bWJlcihlbmQucm93IC0gMSwgbWluOiBzdGFydC5yb3cpXG4gICAgbmV3IFJhbmdlKHN0YXJ0LCBbZW5kUm93LCBJbmZpbml0eV0pXG4gIGVsc2VcbiAgICByYW5nZVxuXG5zY2FuRWRpdG9yID0gKGVkaXRvciwgcGF0dGVybikgLT5cbiAgcmFuZ2VzID0gW11cbiAgZWRpdG9yLnNjYW4gcGF0dGVybiwgKHtyYW5nZX0pIC0+XG4gICAgcmFuZ2VzLnB1c2gocmFuZ2UpXG4gIHJhbmdlc1xuXG5jb2xsZWN0UmFuZ2VJbkJ1ZmZlclJvdyA9IChlZGl0b3IsIHJvdywgcGF0dGVybikgLT5cbiAgcmFuZ2VzID0gW11cbiAgc2NhblJhbmdlID0gZWRpdG9yLmJ1ZmZlclJhbmdlRm9yQnVmZmVyUm93KHJvdylcbiAgZWRpdG9yLnNjYW5JbkJ1ZmZlclJhbmdlIHBhdHRlcm4sIHNjYW5SYW5nZSwgKHtyYW5nZX0pIC0+XG4gICAgcmFuZ2VzLnB1c2gocmFuZ2UpXG4gIHJhbmdlc1xuXG5maW5kUmFuZ2VJbkJ1ZmZlclJvdyA9IChlZGl0b3IsIHBhdHRlcm4sIHJvdywge2RpcmVjdGlvbn09e30pIC0+XG4gIGlmIGRpcmVjdGlvbiBpcyAnYmFja3dhcmQnXG4gICAgc2NhbkZ1bmN0aW9uTmFtZSA9ICdiYWNrd2FyZHNTY2FuSW5CdWZmZXJSYW5nZSdcbiAgZWxzZVxuICAgIHNjYW5GdW5jdGlvbk5hbWUgPSAnc2NhbkluQnVmZmVyUmFuZ2UnXG5cbiAgcmFuZ2UgPSBudWxsXG4gIHNjYW5SYW5nZSA9IGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhyb3cpXG4gIGVkaXRvcltzY2FuRnVuY3Rpb25OYW1lXSBwYXR0ZXJuLCBzY2FuUmFuZ2UsIChldmVudCkgLT4gcmFuZ2UgPSBldmVudC5yYW5nZVxuICByYW5nZVxuXG5nZXRMYXJnZXN0Rm9sZFJhbmdlQ29udGFpbnNCdWZmZXJSb3cgPSAoZWRpdG9yLCByb3cpIC0+XG4gIG1hcmtlcnMgPSBlZGl0b3IuZGlzcGxheUxheWVyLmZvbGRzTWFya2VyTGF5ZXIuZmluZE1hcmtlcnMoaW50ZXJzZWN0c1Jvdzogcm93KVxuXG4gIHN0YXJ0UG9pbnQgPSBudWxsXG4gIGVuZFBvaW50ID0gbnVsbFxuXG4gIGZvciBtYXJrZXIgaW4gbWFya2VycyA/IFtdXG4gICAge3N0YXJ0LCBlbmR9ID0gbWFya2VyLmdldFJhbmdlKClcbiAgICB1bmxlc3Mgc3RhcnRQb2ludFxuICAgICAgc3RhcnRQb2ludCA9IHN0YXJ0XG4gICAgICBlbmRQb2ludCA9IGVuZFxuICAgICAgY29udGludWVcblxuICAgIGlmIHN0YXJ0LmlzTGVzc1RoYW4oc3RhcnRQb2ludClcbiAgICAgIHN0YXJ0UG9pbnQgPSBzdGFydFxuICAgICAgZW5kUG9pbnQgPSBlbmRcblxuICBpZiBzdGFydFBvaW50PyBhbmQgZW5kUG9pbnQ/XG4gICAgbmV3IFJhbmdlKHN0YXJ0UG9pbnQsIGVuZFBvaW50KVxuXG4jIHRha2UgYnVmZmVyUG9zaXRpb25cbnRyYW5zbGF0ZVBvaW50QW5kQ2xpcCA9IChlZGl0b3IsIHBvaW50LCBkaXJlY3Rpb24pIC0+XG4gIHBvaW50ID0gUG9pbnQuZnJvbU9iamVjdChwb2ludClcblxuICBkb250Q2xpcCA9IGZhbHNlXG4gIHN3aXRjaCBkaXJlY3Rpb25cbiAgICB3aGVuICdmb3J3YXJkJ1xuICAgICAgcG9pbnQgPSBwb2ludC50cmFuc2xhdGUoWzAsICsxXSlcbiAgICAgIGVvbCA9IGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhwb2ludC5yb3cpLmVuZFxuXG4gICAgICBpZiBwb2ludC5pc0VxdWFsKGVvbClcbiAgICAgICAgZG9udENsaXAgPSB0cnVlXG4gICAgICBlbHNlIGlmIHBvaW50LmlzR3JlYXRlclRoYW4oZW9sKVxuICAgICAgICBkb250Q2xpcCA9IHRydWVcbiAgICAgICAgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnQucm93ICsgMSwgMCkgIyBtb3ZlIHBvaW50IHRvIG5ldy1saW5lIHNlbGVjdGVkIHBvaW50XG5cbiAgICAgIHBvaW50ID0gUG9pbnQubWluKHBvaW50LCBlZGl0b3IuZ2V0RW9mQnVmZmVyUG9zaXRpb24oKSlcblxuICAgIHdoZW4gJ2JhY2t3YXJkJ1xuICAgICAgcG9pbnQgPSBwb2ludC50cmFuc2xhdGUoWzAsIC0xXSlcblxuICAgICAgaWYgcG9pbnQuY29sdW1uIDwgMFxuICAgICAgICBkb250Q2xpcCA9IHRydWVcbiAgICAgICAgbmV3Um93ID0gcG9pbnQucm93IC0gMVxuICAgICAgICBlb2wgPSBlZGl0b3IuYnVmZmVyUmFuZ2VGb3JCdWZmZXJSb3cobmV3Um93KS5lbmRcbiAgICAgICAgcG9pbnQgPSBuZXcgUG9pbnQobmV3Um93LCBlb2wuY29sdW1uKVxuXG4gICAgICBwb2ludCA9IFBvaW50Lm1heChwb2ludCwgUG9pbnQuWkVSTylcblxuICBpZiBkb250Q2xpcFxuICAgIHBvaW50XG4gIGVsc2VcbiAgICBzY3JlZW5Qb2ludCA9IGVkaXRvci5zY3JlZW5Qb3NpdGlvbkZvckJ1ZmZlclBvc2l0aW9uKHBvaW50LCBjbGlwRGlyZWN0aW9uOiBkaXJlY3Rpb24pXG4gICAgZWRpdG9yLmJ1ZmZlclBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oc2NyZWVuUG9pbnQpXG5cbmdldFJhbmdlQnlUcmFuc2xhdGVQb2ludEFuZENsaXAgPSAoZWRpdG9yLCByYW5nZSwgd2hpY2gsIGRpcmVjdGlvbikgLT5cbiAgbmV3UG9pbnQgPSB0cmFuc2xhdGVQb2ludEFuZENsaXAoZWRpdG9yLCByYW5nZVt3aGljaF0sIGRpcmVjdGlvbilcbiAgc3dpdGNoIHdoaWNoXG4gICAgd2hlbiAnc3RhcnQnXG4gICAgICBuZXcgUmFuZ2UobmV3UG9pbnQsIHJhbmdlLmVuZClcbiAgICB3aGVuICdlbmQnXG4gICAgICBuZXcgUmFuZ2UocmFuZ2Uuc3RhcnQsIG5ld1BvaW50KVxuXG5nZXRQYWNrYWdlID0gKG5hbWUsIGZuKSAtPlxuICBuZXcgUHJvbWlzZSAocmVzb2x2ZSkgLT5cbiAgICBpZiBhdG9tLnBhY2thZ2VzLmlzUGFja2FnZUFjdGl2ZShuYW1lKVxuICAgICAgcGtnID0gYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKG5hbWUpXG4gICAgICByZXNvbHZlKHBrZylcbiAgICBlbHNlXG4gICAgICBkaXNwb3NhYmxlID0gYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlUGFja2FnZSAocGtnKSAtPlxuICAgICAgICBpZiBwa2cubmFtZSBpcyBuYW1lXG4gICAgICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKClcbiAgICAgICAgICByZXNvbHZlKHBrZylcblxuc2VhcmNoQnlQcm9qZWN0RmluZCA9IChlZGl0b3IsIHRleHQpIC0+XG4gIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goZWRpdG9yLmVsZW1lbnQsICdwcm9qZWN0LWZpbmQ6c2hvdycpXG4gIGdldFBhY2thZ2UoJ2ZpbmQtYW5kLXJlcGxhY2UnKS50aGVuIChwa2cpIC0+XG4gICAge3Byb2plY3RGaW5kVmlld30gPSBwa2cubWFpbk1vZHVsZVxuICAgIGlmIHByb2plY3RGaW5kVmlldz9cbiAgICAgIHByb2plY3RGaW5kVmlldy5maW5kRWRpdG9yLnNldFRleHQodGV4dClcbiAgICAgIHByb2plY3RGaW5kVmlldy5jb25maXJtKClcblxubGltaXROdW1iZXIgPSAobnVtYmVyLCB7bWF4LCBtaW59PXt9KSAtPlxuICBudW1iZXIgPSBNYXRoLm1pbihudW1iZXIsIG1heCkgaWYgbWF4P1xuICBudW1iZXIgPSBNYXRoLm1heChudW1iZXIsIG1pbikgaWYgbWluP1xuICBudW1iZXJcblxuZmluZFJhbmdlQ29udGFpbnNQb2ludCA9IChyYW5nZXMsIHBvaW50KSAtPlxuICBmb3IgcmFuZ2UgaW4gcmFuZ2VzIHdoZW4gcmFuZ2UuY29udGFpbnNQb2ludChwb2ludClcbiAgICByZXR1cm4gcmFuZ2VcbiAgbnVsbFxuXG5uZWdhdGVGdW5jdGlvbiA9IChmbikgLT5cbiAgKGFyZ3MuLi4pIC0+XG4gICAgbm90IGZuKGFyZ3MuLi4pXG5cbmlzRW1wdHkgPSAodGFyZ2V0KSAtPiB0YXJnZXQuaXNFbXB0eSgpXG5pc05vdEVtcHR5ID0gbmVnYXRlRnVuY3Rpb24oaXNFbXB0eSlcblxuaXNTaW5nbGVMaW5lUmFuZ2UgPSAocmFuZ2UpIC0+IHJhbmdlLmlzU2luZ2xlTGluZSgpXG5pc05vdFNpbmdsZUxpbmVSYW5nZSA9IG5lZ2F0ZUZ1bmN0aW9uKGlzU2luZ2xlTGluZVJhbmdlKVxuXG5pc0xlYWRpbmdXaGl0ZVNwYWNlUmFuZ2UgPSAoZWRpdG9yLCByYW5nZSkgLT4gL15bXFx0IF0qJC8udGVzdChlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocmFuZ2UpKVxuaXNOb3RMZWFkaW5nV2hpdGVTcGFjZVJhbmdlID0gbmVnYXRlRnVuY3Rpb24oaXNMZWFkaW5nV2hpdGVTcGFjZVJhbmdlKVxuXG5pc0VzY2FwZWRDaGFyUmFuZ2UgPSAoZWRpdG9yLCByYW5nZSkgLT5cbiAgcmFuZ2UgPSBSYW5nZS5mcm9tT2JqZWN0KHJhbmdlKVxuICBjaGFycyA9IGdldExlZnRDaGFyYWN0ZXJGb3JCdWZmZXJQb3NpdGlvbihlZGl0b3IsIHJhbmdlLnN0YXJ0LCAyKVxuICBjaGFycy5lbmRzV2l0aCgnXFxcXCcpIGFuZCBub3QgY2hhcnMuZW5kc1dpdGgoJ1xcXFxcXFxcJylcblxuaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb24gPSAoZWRpdG9yLCBwb2ludCwgdGV4dCkgLT5cbiAgZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKFtwb2ludCwgcG9pbnRdLCB0ZXh0KVxuXG5lbnN1cmVFbmRzV2l0aE5ld0xpbmVGb3JCdWZmZXJSb3cgPSAoZWRpdG9yLCByb3cpIC0+XG4gIHVubGVzcyBpc0VuZHNXaXRoTmV3TGluZUZvckJ1ZmZlclJvdyhlZGl0b3IsIHJvdylcbiAgICBlb2wgPSBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3coZWRpdG9yLCByb3cpXG4gICAgaW5zZXJ0VGV4dEF0QnVmZmVyUG9zaXRpb24oZWRpdG9yLCBlb2wsIFwiXFxuXCIpXG5cbmZvckVhY2hQYW5lQXhpcyA9IChmbiwgYmFzZSkgLT5cbiAgYmFzZSA/PSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkuZ2V0Q29udGFpbmVyKCkuZ2V0Um9vdCgpXG4gIGlmIGJhc2UuY2hpbGRyZW4/XG4gICAgZm4oYmFzZSlcblxuICAgIGZvciBjaGlsZCBpbiBiYXNlLmNoaWxkcmVuXG4gICAgICBmb3JFYWNoUGFuZUF4aXMoZm4sIGNoaWxkKVxuXG5tb2RpZnlDbGFzc0xpc3QgPSAoYWN0aW9uLCBlbGVtZW50LCBjbGFzc05hbWVzLi4uKSAtPlxuICBlbGVtZW50LmNsYXNzTGlzdFthY3Rpb25dKGNsYXNzTmFtZXMuLi4pXG5cbmFkZENsYXNzTGlzdCA9IG1vZGlmeUNsYXNzTGlzdC5iaW5kKG51bGwsICdhZGQnKVxucmVtb3ZlQ2xhc3NMaXN0ID0gbW9kaWZ5Q2xhc3NMaXN0LmJpbmQobnVsbCwgJ3JlbW92ZScpXG50b2dnbGVDbGFzc0xpc3QgPSBtb2RpZnlDbGFzc0xpc3QuYmluZChudWxsLCAndG9nZ2xlJylcblxudG9nZ2xlQ2FzZUZvckNoYXJhY3RlciA9IChjaGFyKSAtPlxuICBjaGFyTG93ZXIgPSBjaGFyLnRvTG93ZXJDYXNlKClcbiAgaWYgY2hhckxvd2VyIGlzIGNoYXJcbiAgICBjaGFyLnRvVXBwZXJDYXNlKClcbiAgZWxzZVxuICAgIGNoYXJMb3dlclxuXG5zcGxpdFRleHRCeU5ld0xpbmUgPSAodGV4dCkgLT5cbiAgaWYgdGV4dC5lbmRzV2l0aChcIlxcblwiKVxuICAgIHRleHQudHJpbVJpZ2h0KCkuc3BsaXQoL1xccj9cXG4vZylcbiAgZWxzZVxuICAgIHRleHQuc3BsaXQoL1xccj9cXG4vZylcblxucmVwbGFjZURlY29yYXRpb25DbGFzc0J5ID0gKGZuLCBkZWNvcmF0aW9uKSAtPlxuICBwcm9wcyA9IGRlY29yYXRpb24uZ2V0UHJvcGVydGllcygpXG4gIGRlY29yYXRpb24uc2V0UHJvcGVydGllcyhfLmRlZmF1bHRzKHtjbGFzczogZm4ocHJvcHMuY2xhc3MpfSwgcHJvcHMpKVxuXG4jIE1vZGlmeSByYW5nZSB1c2VkIGZvciB1bmRvL3JlZG8gZmxhc2ggaGlnaGxpZ2h0IHRvIG1ha2UgaXQgZmVlbCBuYXR1cmFsbHkgZm9yIGh1bWFuLlxuIyAgLSBUcmltIHN0YXJ0aW5nIG5ldyBsaW5lKFwiXFxuXCIpXG4jICAgICBcIlxcbmFiY1wiIC0+IFwiYWJjXCJcbiMgIC0gSWYgcmFuZ2UuZW5kIGlzIEVPTCBleHRlbmQgcmFuZ2UgdG8gZmlyc3QgY29sdW1uIG9mIG5leHQgbGluZS5cbiMgICAgIFwiYWJjXCIgLT4gXCJhYmNcXG5cIlxuIyBlLmcuXG4jIC0gd2hlbiAnYycgaXMgYXRFT0w6IFwiXFxuYWJjXCIgLT4gXCJhYmNcXG5cIlxuIyAtIHdoZW4gJ2MnIGlzIE5PVCBhdEVPTDogXCJcXG5hYmNcIiAtPiBcImFiY1wiXG4jXG4jIFNvIGFsd2F5cyB0cmltIGluaXRpYWwgXCJcXG5cIiBwYXJ0IHJhbmdlIGJlY2F1c2UgZmxhc2hpbmcgdHJhaWxpbmcgbGluZSBpcyBjb3VudGVyaW50dWl0aXZlLlxuaHVtYW5pemVCdWZmZXJSYW5nZSA9IChlZGl0b3IsIHJhbmdlKSAtPlxuICBpZiBpc1NpbmdsZUxpbmVSYW5nZShyYW5nZSkgb3IgaXNMaW5ld2lzZVJhbmdlKHJhbmdlKVxuICAgIHJldHVybiByYW5nZVxuXG4gIHtzdGFydCwgZW5kfSA9IHJhbmdlXG4gIGlmIHBvaW50SXNBdEVuZE9mTGluZShlZGl0b3IsIHN0YXJ0KVxuICAgIG5ld1N0YXJ0ID0gc3RhcnQudHJhdmVyc2UoWzEsIDBdKVxuXG4gIGlmIHBvaW50SXNBdEVuZE9mTGluZShlZGl0b3IsIGVuZClcbiAgICBuZXdFbmQgPSBlbmQudHJhdmVyc2UoWzEsIDBdKVxuXG4gIGlmIG5ld1N0YXJ0PyBvciBuZXdFbmQ/XG4gICAgbmV3IFJhbmdlKG5ld1N0YXJ0ID8gc3RhcnQsIG5ld0VuZCA/IGVuZClcbiAgZWxzZVxuICAgIHJhbmdlXG5cbiMgRXhwYW5kIHJhbmdlIHRvIHdoaXRlIHNwYWNlXG4jICAxLiBFeHBhbmQgdG8gZm9yd2FyZCBkaXJlY3Rpb24sIGlmIHN1Y2VlZCByZXR1cm4gbmV3IHJhbmdlLlxuIyAgMi4gRXhwYW5kIHRvIGJhY2t3YXJkIGRpcmVjdGlvbiwgaWYgc3VjY2VlZCByZXR1cm4gbmV3IHJhbmdlLlxuIyAgMy4gV2hlbiBmYWlsZCB0byBleHBhbmQgZWl0aGVyIGRpcmVjdGlvbiwgcmV0dXJuIG9yaWdpbmFsIHJhbmdlLlxuZXhwYW5kUmFuZ2VUb1doaXRlU3BhY2VzID0gKGVkaXRvciwgcmFuZ2UpIC0+XG4gIHtzdGFydCwgZW5kfSA9IHJhbmdlXG5cbiAgbmV3RW5kID0gbnVsbFxuICBzY2FuUmFuZ2UgPSBbZW5kLCBnZXRFbmRPZkxpbmVGb3JCdWZmZXJSb3coZWRpdG9yLCBlbmQucm93KV1cbiAgZWRpdG9yLnNjYW5JbkJ1ZmZlclJhbmdlIC9cXFMvLCBzY2FuUmFuZ2UsICh7cmFuZ2V9KSAtPiBuZXdFbmQgPSByYW5nZS5zdGFydFxuXG4gIGlmIG5ld0VuZD8uaXNHcmVhdGVyVGhhbihlbmQpXG4gICAgcmV0dXJuIG5ldyBSYW5nZShzdGFydCwgbmV3RW5kKVxuXG4gIG5ld1N0YXJ0ID0gbnVsbFxuICBzY2FuUmFuZ2UgPSBbW3N0YXJ0LnJvdywgMF0sIHJhbmdlLnN0YXJ0XVxuICBlZGl0b3IuYmFja3dhcmRzU2NhbkluQnVmZmVyUmFuZ2UgL1xcUy8sIHNjYW5SYW5nZSwgKHtyYW5nZX0pIC0+IG5ld1N0YXJ0ID0gcmFuZ2UuZW5kXG5cbiAgaWYgbmV3U3RhcnQ/LmlzTGVzc1RoYW4oc3RhcnQpXG4gICAgcmV0dXJuIG5ldyBSYW5nZShuZXdTdGFydCwgZW5kKVxuXG4gIHJldHVybiByYW5nZSAjIGZhbGxiYWNrXG5cbiMgU3BsaXQgYW5kIGpvaW4gYWZ0ZXIgbXV0YXRlIGl0ZW0gYnkgY2FsbGJhY2sgd2l0aCBrZWVwIG9yaWdpbmFsIHNlcGFyYXRvciB1bmNoYW5nZWQuXG4jXG4jIDEuIFRyaW0gbGVhZGluZyBhbmQgdHJhaW5saW5nIHdoaXRlIHNwYWNlcyBhbmQgcmVtZW1iZXJcbiMgMS4gU3BsaXQgdGV4dCB3aXRoIGdpdmVuIHBhdHRlcm4gYW5kIHJlbWVtYmVyIG9yaWdpbmFsIHNlcGFyYXRvcnMuXG4jIDIuIENoYW5nZSBvcmRlciBieSBjYWxsYmFja1xuIyAzLiBKb2luIHdpdGggb3JpZ2luYWwgc3BlYXJhdG9yIGFuZCBjb25jYXQgd2l0aCByZW1lbWJlcmVkIGxlYWRpbmcgYW5kIHRyYWlubGluZyB3aGl0ZSBzcGFjZXMuXG4jXG5zcGxpdEFuZEpvaW5CeSA9ICh0ZXh0LCBwYXR0ZXJuLCBmbikgLT5cbiAgbGVhZGluZ1NwYWNlcyA9IHRyYWlsaW5nU3BhY2VzID0gJydcbiAgc3RhcnQgPSB0ZXh0LnNlYXJjaCgvXFxTLylcbiAgZW5kID0gdGV4dC5zZWFyY2goL1xccyokLylcbiAgbGVhZGluZ1NwYWNlcyA9IHRyYWlsaW5nU3BhY2VzID0gJydcbiAgbGVhZGluZ1NwYWNlcyA9IHRleHRbMC4uLnN0YXJ0XSBpZiBzdGFydCBpc250IC0xXG4gIHRyYWlsaW5nU3BhY2VzID0gdGV4dFtlbmQuLi5dIGlmIGVuZCBpc250IC0xXG4gIHRleHQgPSB0ZXh0W3N0YXJ0Li4uZW5kXVxuXG4gIGZsYWdzID0gJ2cnXG4gIGZsYWdzICs9ICdpJyBpZiBwYXR0ZXJuLmlnbm9yZUNhc2VcbiAgcmVnZXhwID0gbmV3IFJlZ0V4cChcIigje3BhdHRlcm4uc291cmNlfSlcIiwgZmxhZ3MpXG4gICMgZS5nLlxuICAjIFdoZW4gdGV4dCA9IFwiYSwgYiwgY1wiLCBwYXR0ZXJuID0gLyw/XFxzKy9cbiAgIyAgIGl0ZW1zID0gWydhJywgJ2InLCAnYyddLCBzcGVhcmF0b3JzID0gWycsICcsICcsICddXG4gICMgV2hlbiB0ZXh0ID0gXCJhIGJcXG4gY1wiLCBwYXR0ZXJuID0gLyw/XFxzKy9cbiAgIyAgIGl0ZW1zID0gWydhJywgJ2InLCAnYyddLCBzcGVhcmF0b3JzID0gWycgJywgJ1xcbiAnXVxuICBpdGVtcyA9IFtdXG4gIHNlcGFyYXRvcnMgPSBbXVxuICBmb3Igc2VnbWVudCwgaSBpbiB0ZXh0LnNwbGl0KHJlZ2V4cClcbiAgICBpZiBpICUgMiBpcyAwXG4gICAgICBpdGVtcy5wdXNoKHNlZ21lbnQpXG4gICAgZWxzZVxuICAgICAgc2VwYXJhdG9ycy5wdXNoKHNlZ21lbnQpXG4gIHNlcGFyYXRvcnMucHVzaCgnJylcbiAgaXRlbXMgPSBmbihpdGVtcylcbiAgcmVzdWx0ID0gJydcbiAgZm9yIFtpdGVtLCBzZXBhcmF0b3JdIGluIF8uemlwKGl0ZW1zLCBzZXBhcmF0b3JzKVxuICAgIHJlc3VsdCArPSBpdGVtICsgc2VwYXJhdG9yXG4gIGxlYWRpbmdTcGFjZXMgKyByZXN1bHQgKyB0cmFpbGluZ1NwYWNlc1xuXG5jbGFzcyBBcmd1bWVudHNTcGxpdHRlclxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAYWxsVG9rZW5zID0gW11cbiAgICBAY3VycmVudFNlY3Rpb24gPSBudWxsXG5cbiAgc2V0dGxlUGVuZGluZzogLT5cbiAgICBpZiBAcGVuZGluZ1Rva2VuXG4gICAgICBAYWxsVG9rZW5zLnB1c2goe3RleHQ6IEBwZW5kaW5nVG9rZW4sIHR5cGU6IEBjdXJyZW50U2VjdGlvbn0pXG4gICAgICBAcGVuZGluZ1Rva2VuID0gJydcblxuICBjaGFuZ2VTZWN0aW9uOiAobmV3U2VjdGlvbikgLT5cbiAgICBpZiBAY3VycmVudFNlY3Rpb24gaXNudCBuZXdTZWN0aW9uXG4gICAgICBAc2V0dGxlUGVuZGluZygpIGlmIEBjdXJyZW50U2VjdGlvblxuICAgICAgQGN1cnJlbnRTZWN0aW9uID0gbmV3U2VjdGlvblxuXG5zcGxpdEFyZ3VtZW50cyA9ICh0ZXh0LCBqb2luU3BhY2VTZXBhcmF0ZWRUb2tlbikgLT5cbiAgam9pblNwYWNlU2VwYXJhdGVkVG9rZW4gPz0gdHJ1ZVxuICBzZXBhcmF0b3JDaGFycyA9IFwiXFx0LCBcXHJcXG5cIlxuICBxdW90ZUNoYXJzID0gXCJcXFwiJ2BcIlxuICBjbG9zZUNoYXJUb09wZW5DaGFyID0ge1xuICAgIFwiKVwiOiBcIihcIlxuICAgIFwifVwiOiBcIntcIlxuICAgIFwiXVwiOiBcIltcIlxuICB9XG4gIGNsb3NlUGFpckNoYXJzID0gXy5rZXlzKGNsb3NlQ2hhclRvT3BlbkNoYXIpLmpvaW4oJycpXG4gIG9wZW5QYWlyQ2hhcnMgPSBfLnZhbHVlcyhjbG9zZUNoYXJUb09wZW5DaGFyKS5qb2luKCcnKVxuICBlc2NhcGVDaGFyID0gXCJcXFxcXCJcblxuICBwZW5kaW5nVG9rZW4gPSAnJ1xuICBpblF1b3RlID0gZmFsc2VcbiAgaXNFc2NhcGVkID0gZmFsc2VcbiAgIyBQYXJzZSB0ZXh0IGFzIGxpc3Qgb2YgdG9rZW5zIHdoaWNoIGlzIGNvbW1tYSBzZXBhcmF0ZWQgb3Igd2hpdGUgc3BhY2Ugc2VwYXJhdGVkLlxuICAjIGUuZy4gJ2EsIGZ1bjEoYiwgYyksIGQnID0+IFsnYScsICdmdW4xKGIsIGMpLCAnZCddXG4gICMgTm90IHBlcmZlY3QuIGJ1dCBmYXIgYmV0dGVyIHRoYW4gc2ltcGxlIHN0cmluZyBzcGxpdCBieSByZWdleCBwYXR0ZXJuLlxuICBhbGxUb2tlbnMgPSBbXVxuICBjdXJyZW50U2VjdGlvbiA9IG51bGxcblxuICBzZXR0bGVQZW5kaW5nID0gLT5cbiAgICBpZiBwZW5kaW5nVG9rZW5cbiAgICAgIGFsbFRva2Vucy5wdXNoKHt0ZXh0OiBwZW5kaW5nVG9rZW4sIHR5cGU6IGN1cnJlbnRTZWN0aW9ufSlcbiAgICAgIHBlbmRpbmdUb2tlbiA9ICcnXG5cbiAgY2hhbmdlU2VjdGlvbiA9IChuZXdTZWN0aW9uKSAtPlxuICAgIGlmIGN1cnJlbnRTZWN0aW9uIGlzbnQgbmV3U2VjdGlvblxuICAgICAgc2V0dGxlUGVuZGluZygpIGlmIGN1cnJlbnRTZWN0aW9uXG4gICAgICBjdXJyZW50U2VjdGlvbiA9IG5ld1NlY3Rpb25cblxuICBwYWlyU3RhY2sgPSBbXVxuICBmb3IgY2hhciBpbiB0ZXh0XG4gICAgaWYgKHBhaXJTdGFjay5sZW5ndGggaXMgMCkgYW5kIChjaGFyIGluIHNlcGFyYXRvckNoYXJzKVxuICAgICAgY2hhbmdlU2VjdGlvbignc2VwYXJhdG9yJylcbiAgICBlbHNlXG4gICAgICBjaGFuZ2VTZWN0aW9uKCdhcmd1bWVudCcpXG4gICAgICBpZiBpc0VzY2FwZWRcbiAgICAgICAgaXNFc2NhcGVkID0gZmFsc2VcbiAgICAgIGVsc2UgaWYgY2hhciBpcyBlc2NhcGVDaGFyXG4gICAgICAgIGlzRXNjYXBlZCA9IHRydWVcbiAgICAgIGVsc2UgaWYgaW5RdW90ZVxuICAgICAgICBpZiAoY2hhciBpbiBxdW90ZUNoYXJzKSBhbmQgXy5sYXN0KHBhaXJTdGFjaykgaXMgY2hhclxuICAgICAgICAgIHBhaXJTdGFjay5wb3AoKVxuICAgICAgICAgIGluUXVvdGUgPSBmYWxzZVxuICAgICAgZWxzZSBpZiBjaGFyIGluIHF1b3RlQ2hhcnNcbiAgICAgICAgaW5RdW90ZSA9IHRydWVcbiAgICAgICAgcGFpclN0YWNrLnB1c2goY2hhcilcbiAgICAgIGVsc2UgaWYgY2hhciBpbiBvcGVuUGFpckNoYXJzXG4gICAgICAgIHBhaXJTdGFjay5wdXNoKGNoYXIpXG4gICAgICBlbHNlIGlmIGNoYXIgaW4gY2xvc2VQYWlyQ2hhcnNcbiAgICAgICAgcGFpclN0YWNrLnBvcCgpIGlmIF8ubGFzdChwYWlyU3RhY2spIGlzIGNsb3NlQ2hhclRvT3BlbkNoYXJbY2hhcl1cblxuICAgIHBlbmRpbmdUb2tlbiArPSBjaGFyXG4gIHNldHRsZVBlbmRpbmcoKVxuXG4gIGlmIGpvaW5TcGFjZVNlcGFyYXRlZFRva2VuIGFuZCBhbGxUb2tlbnMuc29tZSgoe3R5cGUsIHRleHR9KSAtPiB0eXBlIGlzICdzZXBhcmF0b3InIGFuZCAnLCcgaW4gdGV4dClcbiAgICAjIFdoZW4gc29tZSBzZXBhcmF0b3IgY29udGFpbnMgYCxgIHRyZWF0IHdoaXRlLXNwYWNlIHNlcGFyYXRvciBpcyBqdXN0IHBhcnQgb2YgdG9rZW4uXG4gICAgIyBTbyB3ZSBtb3ZlIHdoaXRlLXNwYWNlIG9ubHkgc3BhcmF0b3IgaW50byB0b2tlbnMgYnkgam9pbmluZyBtaXMtc2VwYXJhdG9lZCB0b2tlbnMuXG4gICAgbmV3QWxsVG9rZW5zID0gW11cbiAgICB3aGlsZSBhbGxUb2tlbnMubGVuZ3RoXG4gICAgICB0b2tlbiA9IGFsbFRva2Vucy5zaGlmdCgpXG4gICAgICBzd2l0Y2ggdG9rZW4udHlwZVxuICAgICAgICB3aGVuICdhcmd1bWVudCdcbiAgICAgICAgICBuZXdBbGxUb2tlbnMucHVzaCh0b2tlbilcbiAgICAgICAgd2hlbiAnc2VwYXJhdG9yJ1xuICAgICAgICAgIGlmICcsJyBpbiB0b2tlbi50ZXh0XG4gICAgICAgICAgICBuZXdBbGxUb2tlbnMucHVzaCh0b2tlbilcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAjIDEuIENvbmNhdG5hdGUgd2hpdGUtc3BhY2Utc2VwYXJhdG9yIGFuZCBuZXh0LWFyZ3VtZW50XG4gICAgICAgICAgICAjIDIuIFRoZW4gam9pbiBpbnRvIGxhdGVzdCBhcmd1bWVudFxuICAgICAgICAgICAgbGFzdEFyZyA9IG5ld0FsbFRva2Vucy5wb3AoKSA/IHt0ZXh0OiAnJywgJ2FyZ3VtZW50J31cbiAgICAgICAgICAgIGxhc3RBcmcudGV4dCArPSB0b2tlbi50ZXh0ICsgKGFsbFRva2Vucy5zaGlmdCgpPy50ZXh0ID8gJycpICMgY29uY2F0IHdpdGggbmV4dC1hcmd1bWVudFxuICAgICAgICAgICAgbmV3QWxsVG9rZW5zLnB1c2gobGFzdEFyZylcbiAgICBhbGxUb2tlbnMgPSBuZXdBbGxUb2tlbnNcbiAgYWxsVG9rZW5zXG5cbnNjYW5FZGl0b3JJbkRpcmVjdGlvbiA9IChlZGl0b3IsIGRpcmVjdGlvbiwgcGF0dGVybiwgb3B0aW9ucz17fSwgZm4pIC0+XG4gIHthbGxvd05leHRMaW5lLCBmcm9tLCBzY2FuUmFuZ2V9ID0gb3B0aW9uc1xuICBpZiBub3QgZnJvbT8gYW5kIG5vdCBzY2FuUmFuZ2U/XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiWW91IG11c3QgZWl0aGVyIG9mICdmcm9tJyBvciAnc2NhblJhbmdlJyBvcHRpb25zXCIpXG5cbiAgaWYgc2NhblJhbmdlXG4gICAgYWxsb3dOZXh0TGluZSA9IHRydWVcbiAgZWxzZVxuICAgIGFsbG93TmV4dExpbmUgPz0gdHJ1ZVxuICBmcm9tID0gUG9pbnQuZnJvbU9iamVjdChmcm9tKSBpZiBmcm9tP1xuICBzd2l0Y2ggZGlyZWN0aW9uXG4gICAgd2hlbiAnZm9yd2FyZCdcbiAgICAgIHNjYW5SYW5nZSA/PSBuZXcgUmFuZ2UoZnJvbSwgZ2V0VmltRW9mQnVmZmVyUG9zaXRpb24oZWRpdG9yKSlcbiAgICAgIHNjYW5GdW5jdGlvbiA9ICdzY2FuSW5CdWZmZXJSYW5nZSdcbiAgICB3aGVuICdiYWNrd2FyZCdcbiAgICAgIHNjYW5SYW5nZSA/PSBuZXcgUmFuZ2UoWzAsIDBdLCBmcm9tKVxuICAgICAgc2NhbkZ1bmN0aW9uID0gJ2JhY2t3YXJkc1NjYW5JbkJ1ZmZlclJhbmdlJ1xuXG4gIGVkaXRvcltzY2FuRnVuY3Rpb25dIHBhdHRlcm4sIHNjYW5SYW5nZSwgKGV2ZW50KSAtPlxuICAgIGlmIG5vdCBhbGxvd05leHRMaW5lIGFuZCBldmVudC5yYW5nZS5zdGFydC5yb3cgaXNudCBmcm9tLnJvd1xuICAgICAgZXZlbnQuc3RvcCgpXG4gICAgICByZXR1cm5cbiAgICBmbihldmVudClcblxuYWRqdXN0SW5kZW50V2l0aEtlZXBpbmdMYXlvdXQgPSAoZWRpdG9yLCByYW5nZSkgLT5cbiAgIyBBZGp1c3QgaW5kZW50TGV2ZWwgd2l0aCBrZWVwaW5nIG9yaWdpbmFsIGxheW91dCBvZiBwYXN0aW5nIHRleHQuXG4gICMgU3VnZ2VzdGVkIGluZGVudCBsZXZlbCBvZiByYW5nZS5zdGFydC5yb3cgaXMgY29ycmVjdCBhcyBsb25nIGFzIHJhbmdlLnN0YXJ0LnJvdyBoYXZlIG1pbmltdW0gaW5kZW50IGxldmVsLlxuICAjIEJ1dCB3aGVuIHdlIHBhc3RlIGZvbGxvd2luZyBhbHJlYWR5IGluZGVudGVkIHRocmVlIGxpbmUgdGV4dCwgd2UgaGF2ZSB0byBhZGp1c3QgaW5kZW50IGxldmVsXG4gICMgIHNvIHRoYXQgYHZhckZvcnR5VHdvYCBsaW5lIGhhdmUgc3VnZ2VzdGVkSW5kZW50TGV2ZWwuXG4gICNcbiAgIyAgICAgICAgdmFyT25lOiB2YWx1ZSAjIHN1Z2dlc3RlZEluZGVudExldmVsIGlzIGRldGVybWluZWQgYnkgdGhpcyBsaW5lXG4gICMgICB2YXJGb3J0eVR3bzogdmFsdWUgIyBXZSBuZWVkIHRvIG1ha2UgZmluYWwgaW5kZW50IGxldmVsIG9mIHRoaXMgcm93IHRvIGJlIHN1Z2dlc3RlZEluZGVudExldmVsLlxuICAjICAgICAgdmFyVGhyZWU6IHZhbHVlXG4gICNcbiAgIyBTbyB3aGF0IHdlIGFyZSBkb2luZyBoZXJlIGlzIGFwcGx5IHN1Z2dlc3RlZEluZGVudExldmVsIHdpdGggZml4aW5nIGlzc3VlIGFib3ZlLlxuICAjIDEuIERldGVybWluZSBtaW5pbXVtIGluZGVudCBsZXZlbCBhbW9uZyBwYXN0ZWQgcmFuZ2UoPSByYW5nZSApIGV4Y2x1ZGluZyBlbXB0eSByb3dcbiAgIyAyLiBUaGVuIHVwZGF0ZSBpbmRlbnRMZXZlbCBvZiBlYWNoIHJvd3MgdG8gZmluYWwgaW5kZW50TGV2ZWwgb2YgbWluaW11bS1pbmRlbnRlZCByb3cgaGF2ZSBzdWdnZXN0ZWRJbmRlbnRMZXZlbC5cbiAgc3VnZ2VzdGVkTGV2ZWwgPSBlZGl0b3Iuc3VnZ2VzdGVkSW5kZW50Rm9yQnVmZmVyUm93KHJhbmdlLnN0YXJ0LnJvdylcbiAgbWluTGV2ZWwgPSBudWxsXG4gIHJvd0FuZEFjdHVhbExldmVscyA9IFtdXG4gIGZvciByb3cgaW4gW3JhbmdlLnN0YXJ0LnJvdy4uLnJhbmdlLmVuZC5yb3ddXG4gICAgYWN0dWFsTGV2ZWwgPSBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdyhlZGl0b3IsIHJvdylcbiAgICByb3dBbmRBY3R1YWxMZXZlbHMucHVzaChbcm93LCBhY3R1YWxMZXZlbF0pXG4gICAgdW5sZXNzIGlzRW1wdHlSb3coZWRpdG9yLCByb3cpXG4gICAgICBtaW5MZXZlbCA9IE1hdGgubWluKG1pbkxldmVsID8gSW5maW5pdHksIGFjdHVhbExldmVsKVxuXG4gIGlmIG1pbkxldmVsPyBhbmQgKGRlbHRhVG9TdWdnZXN0ZWRMZXZlbCA9IHN1Z2dlc3RlZExldmVsIC0gbWluTGV2ZWwpXG4gICAgZm9yIFtyb3csIGFjdHVhbExldmVsXSBpbiByb3dBbmRBY3R1YWxMZXZlbHNcbiAgICAgIG5ld0xldmVsID0gYWN0dWFsTGV2ZWwgKyBkZWx0YVRvU3VnZ2VzdGVkTGV2ZWxcbiAgICAgIGVkaXRvci5zZXRJbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3csIG5ld0xldmVsKVxuXG4jIENoZWNrIHBvaW50IGNvbnRhaW5tZW50IHdpdGggZW5kIHBvc2l0aW9uIGV4Y2x1c2l2ZVxucmFuZ2VDb250YWluc1BvaW50V2l0aEVuZEV4Y2x1c2l2ZSA9IChyYW5nZSwgcG9pbnQpIC0+XG4gIHJhbmdlLnN0YXJ0LmlzTGVzc1RoYW5PckVxdWFsKHBvaW50KSBhbmRcbiAgICByYW5nZS5lbmQuaXNHcmVhdGVyVGhhbihwb2ludClcblxudHJhdmVyc2VUZXh0RnJvbVBvaW50ID0gKHBvaW50LCB0ZXh0KSAtPlxuICBwb2ludC50cmF2ZXJzZShnZXRUcmF2ZXJzYWxGb3JUZXh0KHRleHQpKVxuXG5nZXRUcmF2ZXJzYWxGb3JUZXh0ID0gKHRleHQpIC0+XG4gIHJvdyA9IDBcbiAgY29sdW1uID0gMFxuICBmb3IgY2hhciBpbiB0ZXh0XG4gICAgaWYgY2hhciBpcyBcIlxcblwiXG4gICAgICByb3crK1xuICAgICAgY29sdW1uID0gMFxuICAgIGVsc2VcbiAgICAgIGNvbHVtbisrXG4gIFtyb3csIGNvbHVtbl1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFzc2VydFdpdGhFeGNlcHRpb25cbiAgZ2V0QW5jZXN0b3JzXG4gIGdldEtleUJpbmRpbmdGb3JDb21tYW5kXG4gIGluY2x1ZGVcbiAgZGVidWdcbiAgc2F2ZUVkaXRvclN0YXRlXG4gIGlzTGluZXdpc2VSYW5nZVxuICBzb3J0UmFuZ2VzXG4gIGdldEluZGV4XG4gIGdldFZpc2libGVCdWZmZXJSYW5nZVxuICBnZXRWaXNpYmxlRWRpdG9yc1xuICBwb2ludElzQXRFbmRPZkxpbmVcbiAgcG9pbnRJc09uV2hpdGVTcGFjZVxuICBwb2ludElzQXRFbmRPZkxpbmVBdE5vbkVtcHR5Um93XG4gIHBvaW50SXNBdFZpbUVuZE9mRmlsZVxuICBnZXRWaW1Fb2ZCdWZmZXJQb3NpdGlvblxuICBnZXRWaW1Fb2ZTY3JlZW5Qb3NpdGlvblxuICBnZXRWaW1MYXN0QnVmZmVyUm93XG4gIGdldFZpbUxhc3RTY3JlZW5Sb3dcbiAgc2V0QnVmZmVyUm93XG4gIHNldEJ1ZmZlckNvbHVtblxuICBtb3ZlQ3Vyc29yTGVmdFxuICBtb3ZlQ3Vyc29yUmlnaHRcbiAgbW92ZUN1cnNvclVwU2NyZWVuXG4gIG1vdmVDdXJzb3JEb3duU2NyZWVuXG4gIGdldEVuZE9mTGluZUZvckJ1ZmZlclJvd1xuICBnZXRGaXJzdFZpc2libGVTY3JlZW5Sb3dcbiAgZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3dcbiAgZ2V0VmFsaWRWaW1CdWZmZXJSb3dcbiAgZ2V0VmFsaWRWaW1TY3JlZW5Sb3dcbiAgbW92ZUN1cnNvclRvRmlyc3RDaGFyYWN0ZXJBdFJvd1xuICBnZXRMaW5lVGV4dFRvQnVmZmVyUG9zaXRpb25cbiAgZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3dcbiAgZ2V0VGV4dEluU2NyZWVuUmFuZ2VcbiAgbW92ZUN1cnNvclRvTmV4dE5vbldoaXRlc3BhY2VcbiAgaXNFbXB0eVJvd1xuICBnZXRDb2RlRm9sZFJvd1Jhbmdlc1xuICBnZXRDb2RlRm9sZFJvd1Jhbmdlc0NvbnRhaW5lc0ZvclJvd1xuICBnZXRCdWZmZXJSYW5nZUZvclJvd1JhbmdlXG4gIHRyaW1SYW5nZVxuICBnZXRGaXJzdENoYXJhY3RlclBvc2l0aW9uRm9yQnVmZmVyUm93XG4gIGlzSW5jbHVkZUZ1bmN0aW9uU2NvcGVGb3JSb3dcbiAgZGV0ZWN0U2NvcGVTdGFydFBvc2l0aW9uRm9yU2NvcGVcbiAgZ2V0QnVmZmVyUm93c1xuICBzbWFydFNjcm9sbFRvQnVmZmVyUG9zaXRpb25cbiAgbWF0Y2hTY29wZXNcbiAgaXNTaW5nbGVMaW5lVGV4dFxuICBnZXRXb3JkQnVmZmVyUmFuZ2VBdEJ1ZmZlclBvc2l0aW9uXG4gIGdldFdvcmRCdWZmZXJSYW5nZUFuZEtpbmRBdEJ1ZmZlclBvc2l0aW9uXG4gIGdldFdvcmRQYXR0ZXJuQXRCdWZmZXJQb3NpdGlvblxuICBnZXRTdWJ3b3JkUGF0dGVybkF0QnVmZmVyUG9zaXRpb25cbiAgZ2V0Tm9uV29yZENoYXJhY3RlcnNGb3JDdXJzb3JcbiAgc2hyaW5rUmFuZ2VFbmRUb0JlZm9yZU5ld0xpbmVcbiAgc2NhbkVkaXRvclxuICBjb2xsZWN0UmFuZ2VJbkJ1ZmZlclJvd1xuICBmaW5kUmFuZ2VJbkJ1ZmZlclJvd1xuICBnZXRMYXJnZXN0Rm9sZFJhbmdlQ29udGFpbnNCdWZmZXJSb3dcbiAgdHJhbnNsYXRlUG9pbnRBbmRDbGlwXG4gIGdldFJhbmdlQnlUcmFuc2xhdGVQb2ludEFuZENsaXBcbiAgZ2V0UGFja2FnZVxuICBzZWFyY2hCeVByb2plY3RGaW5kXG4gIGxpbWl0TnVtYmVyXG4gIGZpbmRSYW5nZUNvbnRhaW5zUG9pbnRcblxuICBpc0VtcHR5LCBpc05vdEVtcHR5XG4gIGlzU2luZ2xlTGluZVJhbmdlLCBpc05vdFNpbmdsZUxpbmVSYW5nZVxuXG4gIGluc2VydFRleHRBdEJ1ZmZlclBvc2l0aW9uXG4gIGVuc3VyZUVuZHNXaXRoTmV3TGluZUZvckJ1ZmZlclJvd1xuICBpc0xlYWRpbmdXaGl0ZVNwYWNlUmFuZ2VcbiAgaXNOb3RMZWFkaW5nV2hpdGVTcGFjZVJhbmdlXG4gIGlzRXNjYXBlZENoYXJSYW5nZVxuXG4gIGZvckVhY2hQYW5lQXhpc1xuICBhZGRDbGFzc0xpc3RcbiAgcmVtb3ZlQ2xhc3NMaXN0XG4gIHRvZ2dsZUNsYXNzTGlzdFxuICB0b2dnbGVDYXNlRm9yQ2hhcmFjdGVyXG4gIHNwbGl0VGV4dEJ5TmV3TGluZVxuICByZXBsYWNlRGVjb3JhdGlvbkNsYXNzQnlcbiAgaHVtYW5pemVCdWZmZXJSYW5nZVxuICBleHBhbmRSYW5nZVRvV2hpdGVTcGFjZXNcbiAgc3BsaXRBbmRKb2luQnlcbiAgc3BsaXRBcmd1bWVudHNcbiAgc2NhbkVkaXRvckluRGlyZWN0aW9uXG4gIGFkanVzdEluZGVudFdpdGhLZWVwaW5nTGF5b3V0XG4gIHJhbmdlQ29udGFpbnNQb2ludFdpdGhFbmRFeGNsdXNpdmVcbiAgdHJhdmVyc2VUZXh0RnJvbVBvaW50XG59XG4iXX0=
