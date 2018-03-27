(function() {
  var Disposable, KeymapManager, Point, Range, TextData, VimEditor, _, buildKeydownEvent, buildKeydownEventFromKeystroke, buildTextInputEvent, collectCharPositionsInText, collectIndexInText, dispatch, getView, getVimState, globalState, inspect, isPoint, isRange, normalizeKeystrokes, ref, semver, settings, supportedModeClass, toArray, toArrayOfPoint, toArrayOfRange, withMockPlatform,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    slice = [].slice,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  semver = require('semver');

  ref = require('atom'), Range = ref.Range, Point = ref.Point, Disposable = ref.Disposable;

  inspect = require('util').inspect;

  globalState = require('../lib/global-state');

  settings = require('../lib/settings');

  KeymapManager = atom.keymaps.constructor;

  normalizeKeystrokes = require(atom.config.resourcePath + "/node_modules/atom-keymap/lib/helpers").normalizeKeystrokes;

  supportedModeClass = ['normal-mode', 'visual-mode', 'insert-mode', 'replace', 'linewise', 'blockwise', 'characterwise'];

  beforeEach(function() {
    globalState.reset();
    settings.set("stayOnTransformString", false);
    settings.set("stayOnYank", false);
    settings.set("stayOnDelete", false);
    settings.set("stayOnSelectTextObject", false);
    return settings.set("stayOnVerticalMotion", true);
  });

  getView = function(model) {
    return atom.views.getView(model);
  };

  dispatch = function(target, command) {
    return atom.commands.dispatch(target, command);
  };

  withMockPlatform = function(target, platform, fn) {
    var wrapper;
    wrapper = document.createElement('div');
    wrapper.className = platform;
    wrapper.appendChild(target);
    fn();
    return target.parentNode.removeChild(target);
  };

  buildKeydownEvent = function(key, options) {
    return KeymapManager.buildKeydownEvent(key, options);
  };

  buildKeydownEventFromKeystroke = function(keystroke, target) {
    var j, key, len, modifier, options, part, parts;
    modifier = ['ctrl', 'alt', 'shift', 'cmd'];
    parts = keystroke === '-' ? ['-'] : keystroke.split('-');
    options = {
      target: target
    };
    key = null;
    for (j = 0, len = parts.length; j < len; j++) {
      part = parts[j];
      if (indexOf.call(modifier, part) >= 0) {
        options[part] = true;
      } else {
        key = part;
      }
    }
    if (semver.satisfies(atom.getVersion(), '< 1.12')) {
      if (key === 'space') {
        key = ' ';
      }
    }
    return buildKeydownEvent(key, options);
  };

  buildTextInputEvent = function(key) {
    var event, eventArgs;
    eventArgs = [true, true, window, key];
    event = document.createEvent('TextEvent');
    event.initTextEvent.apply(event, ["textInput"].concat(slice.call(eventArgs)));
    return event;
  };

  isPoint = function(obj) {
    if (obj instanceof Point) {
      return true;
    } else {
      return obj.length === 2 && _.isNumber(obj[0]) && _.isNumber(obj[1]);
    }
  };

  isRange = function(obj) {
    if (obj instanceof Range) {
      return true;
    } else {
      return _.all([_.isArray(obj), obj.length === 2, isPoint(obj[0]), isPoint(obj[1])]);
    }
  };

  toArray = function(obj, cond) {
    if (cond == null) {
      cond = null;
    }
    if (_.isArray(cond != null ? cond : obj)) {
      return obj;
    } else {
      return [obj];
    }
  };

  toArrayOfPoint = function(obj) {
    if (_.isArray(obj) && isPoint(obj[0])) {
      return obj;
    } else {
      return [obj];
    }
  };

  toArrayOfRange = function(obj) {
    if (_.isArray(obj) && _.all(obj.map(function(e) {
      return isRange(e);
    }))) {
      return obj;
    } else {
      return [obj];
    }
  };

  getVimState = function() {
    var args, callback, editor, file, ref1;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    ref1 = [], editor = ref1[0], file = ref1[1], callback = ref1[2];
    switch (args.length) {
      case 1:
        callback = args[0];
        break;
      case 2:
        file = args[0], callback = args[1];
    }
    waitsForPromise(function() {
      return atom.packages.activatePackage('vim-mode-plus');
    });
    waitsForPromise(function() {
      if (file) {
        file = atom.project.resolvePath(file);
      }
      return atom.workspace.open(file).then(function(e) {
        return editor = e;
      });
    });
    return runs(function() {
      var main, vimState;
      main = atom.packages.getActivePackage('vim-mode-plus').mainModule;
      vimState = main.getEditorState(editor);
      return callback(vimState, new VimEditor(vimState));
    });
  };

  TextData = (function() {
    function TextData(rawData) {
      this.rawData = rawData;
      this.lines = this.rawData.split("\n");
    }

    TextData.prototype.getLines = function(lines, arg) {
      var chomp, line, text;
      chomp = (arg != null ? arg : {}).chomp;
      if (chomp == null) {
        chomp = false;
      }
      text = ((function() {
        var j, len, results;
        results = [];
        for (j = 0, len = lines.length; j < len; j++) {
          line = lines[j];
          results.push(this.lines[line]);
        }
        return results;
      }).call(this)).join("\n");
      if (chomp) {
        return text;
      } else {
        return text + "\n";
      }
    };

    TextData.prototype.getLine = function(line, options) {
      return this.getLines([line], options);
    };

    TextData.prototype.getRaw = function() {
      return this.rawData;
    };

    return TextData;

  })();

  collectIndexInText = function(char, text) {
    var fromIndex, index, indexes;
    indexes = [];
    fromIndex = 0;
    while ((index = text.indexOf(char, fromIndex)) >= 0) {
      fromIndex = index + 1;
      indexes.push(index);
    }
    return indexes;
  };

  collectCharPositionsInText = function(char, text) {
    var i, index, j, k, len, len1, lineText, positions, ref1, ref2, rowNumber;
    positions = [];
    ref1 = text.split(/\n/);
    for (rowNumber = j = 0, len = ref1.length; j < len; rowNumber = ++j) {
      lineText = ref1[rowNumber];
      ref2 = collectIndexInText(char, lineText);
      for (i = k = 0, len1 = ref2.length; k < len1; i = ++k) {
        index = ref2[i];
        positions.push([rowNumber, index - i]);
      }
    }
    return positions;
  };

  VimEditor = (function() {
    var ensureExclusiveRules, ensureOptionsOrdered, setExclusiveRules, setOptionsOrdered;

    function VimEditor(vimState1) {
      var ref1;
      this.vimState = vimState1;
      this.keystroke = bind(this.keystroke, this);
      this.ensureByDispatch = bind(this.ensureByDispatch, this);
      this.bindEnsureOption = bind(this.bindEnsureOption, this);
      this.ensure = bind(this.ensure, this);
      this.set = bind(this.set, this);
      ref1 = this.vimState, this.editor = ref1.editor, this.editorElement = ref1.editorElement;
    }

    VimEditor.prototype.validateOptions = function(options, validOptions, message) {
      var invalidOptions;
      invalidOptions = _.without.apply(_, [_.keys(options)].concat(slice.call(validOptions)));
      if (invalidOptions.length) {
        throw new Error(message + ": " + (inspect(invalidOptions)));
      }
    };

    VimEditor.prototype.validateExclusiveOptions = function(options, rules) {
      var allOptions, exclusiveOptions, option, results, violatingOptions;
      allOptions = Object.keys(options);
      results = [];
      for (option in rules) {
        exclusiveOptions = rules[option];
        if (!(option in options)) {
          continue;
        }
        violatingOptions = exclusiveOptions.filter(function(exclusiveOption) {
          return indexOf.call(allOptions, exclusiveOption) >= 0;
        });
        if (violatingOptions.length) {
          throw new Error(option + " is exclusive with [" + violatingOptions + "]");
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    setOptionsOrdered = ['text', 'text_', 'textC', 'textC_', 'grammar', 'cursor', 'cursorScreen', 'addCursor', 'cursorScreen', 'register', 'selectedBufferRange'];

    setExclusiveRules = {
      textC: ['cursor', 'cursorScreen'],
      textC_: ['cursor', 'cursorScreen']
    };

    VimEditor.prototype.set = function(options) {
      var j, len, method, name, results;
      this.validateOptions(options, setOptionsOrdered, 'Invalid set options');
      this.validateExclusiveOptions(options, setExclusiveRules);
      results = [];
      for (j = 0, len = setOptionsOrdered.length; j < len; j++) {
        name = setOptionsOrdered[j];
        if (!(options[name] != null)) {
          continue;
        }
        method = 'set' + _.capitalize(_.camelize(name));
        results.push(this[method](options[name]));
      }
      return results;
    };

    VimEditor.prototype.setText = function(text) {
      return this.editor.setText(text);
    };

    VimEditor.prototype.setText_ = function(text) {
      return this.setText(text.replace(/_/g, ' '));
    };

    VimEditor.prototype.setTextC = function(text) {
      var cursors, lastCursor;
      cursors = collectCharPositionsInText('|', text.replace(/!/g, ''));
      lastCursor = collectCharPositionsInText('!', text.replace(/\|/g, ''));
      this.setText(text.replace(/[\|!]/g, ''));
      cursors = cursors.concat(lastCursor);
      if (cursors.length) {
        return this.setCursor(cursors);
      }
    };

    VimEditor.prototype.setTextC_ = function(text) {
      return this.setTextC(text.replace(/_/g, ' '));
    };

    VimEditor.prototype.setGrammar = function(scope) {
      return this.editor.setGrammar(atom.grammars.grammarForScopeName(scope));
    };

    VimEditor.prototype.setCursor = function(points) {
      var j, len, point, results;
      points = toArrayOfPoint(points);
      this.editor.setCursorBufferPosition(points.shift());
      results = [];
      for (j = 0, len = points.length; j < len; j++) {
        point = points[j];
        results.push(this.editor.addCursorAtBufferPosition(point));
      }
      return results;
    };

    VimEditor.prototype.setCursorScreen = function(points) {
      var j, len, point, results;
      points = toArrayOfPoint(points);
      this.editor.setCursorScreenPosition(points.shift());
      results = [];
      for (j = 0, len = points.length; j < len; j++) {
        point = points[j];
        results.push(this.editor.addCursorAtScreenPosition(point));
      }
      return results;
    };

    VimEditor.prototype.setAddCursor = function(points) {
      var j, len, point, ref1, results;
      ref1 = toArrayOfPoint(points);
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        point = ref1[j];
        results.push(this.editor.addCursorAtBufferPosition(point));
      }
      return results;
    };

    VimEditor.prototype.setRegister = function(register) {
      var name, results, value;
      results = [];
      for (name in register) {
        value = register[name];
        results.push(this.vimState.register.set(name, value));
      }
      return results;
    };

    VimEditor.prototype.setSelectedBufferRange = function(range) {
      return this.editor.setSelectedBufferRange(range);
    };

    ensureOptionsOrdered = ['text', 'text_', 'textC', 'textC_', 'selectedText', 'selectedText_', 'selectedTextOrdered', "selectionIsNarrowed", 'cursor', 'cursorScreen', 'numCursors', 'register', 'selectedScreenRange', 'selectedScreenRangeOrdered', 'selectedBufferRange', 'selectedBufferRangeOrdered', 'selectionIsReversed', 'persistentSelectionBufferRange', 'persistentSelectionCount', 'occurrenceCount', 'occurrenceText', 'propertyHead', 'propertyTail', 'scrollTop', 'mark', 'mode'];

    ensureExclusiveRules = {
      textC: ['cursor', 'cursorScreen'],
      textC_: ['cursor', 'cursorScreen']
    };

    VimEditor.prototype.getAndDeleteKeystrokeOptions = function(options) {
      var partialMatchTimeout;
      partialMatchTimeout = options.partialMatchTimeout;
      delete options.partialMatchTimeout;
      return {
        partialMatchTimeout: partialMatchTimeout
      };
    };

    VimEditor.prototype.ensure = function() {
      var args, j, keystroke, keystrokeOptions, len, method, name, options, results;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      switch (args.length) {
        case 1:
          options = args[0];
          break;
        case 2:
          keystroke = args[0], options = args[1];
      }
      if (typeof options !== 'object') {
        throw new Error("Invalid options for 'ensure': must be 'object' but got '" + (typeof options) + "'");
      }
      if ((keystroke != null) && !(typeof keystroke === 'string' || Array.isArray(keystroke))) {
        throw new Error("Invalid keystroke for 'ensure': must be 'string' or 'array' but got '" + (typeof keystroke) + "'");
      }
      keystrokeOptions = this.getAndDeleteKeystrokeOptions(options);
      this.validateOptions(options, ensureOptionsOrdered, 'Invalid ensure option');
      this.validateExclusiveOptions(options, ensureExclusiveRules);
      if (!_.isEmpty(keystroke)) {
        this.keystroke(keystroke, keystrokeOptions);
      }
      results = [];
      for (j = 0, len = ensureOptionsOrdered.length; j < len; j++) {
        name = ensureOptionsOrdered[j];
        if (!(options[name] != null)) {
          continue;
        }
        method = 'ensure' + _.capitalize(_.camelize(name));
        results.push(this[method](options[name]));
      }
      return results;
    };

    VimEditor.prototype.bindEnsureOption = function(optionsBase) {
      return (function(_this) {
        return function(keystroke, options) {
          var intersectingOptions;
          intersectingOptions = _.intersection(_.keys(options), _.keys(optionsBase));
          if (intersectingOptions.length) {
            throw new Error("conflict with bound options " + (inspect(intersectingOptions)));
          }
          return _this.ensure(keystroke, _.defaults(_.clone(options), optionsBase));
        };
      })(this);
    };

    VimEditor.prototype.ensureByDispatch = function(command, options) {
      var j, len, method, name, results;
      dispatch(atom.views.getView(this.editor), command);
      results = [];
      for (j = 0, len = ensureOptionsOrdered.length; j < len; j++) {
        name = ensureOptionsOrdered[j];
        if (!(options[name] != null)) {
          continue;
        }
        method = 'ensure' + _.capitalize(_.camelize(name));
        results.push(this[method](options[name]));
      }
      return results;
    };

    VimEditor.prototype.ensureText = function(text) {
      return expect(this.editor.getText()).toEqual(text);
    };

    VimEditor.prototype.ensureText_ = function(text) {
      return this.ensureText(text.replace(/_/g, ' '));
    };

    VimEditor.prototype.ensureTextC = function(text) {
      var cursors, lastCursor;
      cursors = collectCharPositionsInText('|', text.replace(/!/g, ''));
      lastCursor = collectCharPositionsInText('!', text.replace(/\|/g, ''));
      cursors = cursors.concat(lastCursor);
      cursors = cursors.map(function(point) {
        return Point.fromObject(point);
      }).sort(function(a, b) {
        return a.compare(b);
      });
      this.ensureText(text.replace(/[\|!]/g, ''));
      if (cursors.length) {
        this.ensureCursor(cursors, true);
      }
      if (lastCursor.length) {
        return expect(this.editor.getCursorBufferPosition()).toEqual(lastCursor[0]);
      }
    };

    VimEditor.prototype.ensureTextC_ = function(text) {
      return this.ensureTextC(text.replace(/_/g, ' '));
    };

    VimEditor.prototype.ensureSelectedText = function(text, ordered) {
      var actual, s, selections;
      if (ordered == null) {
        ordered = false;
      }
      selections = ordered ? this.editor.getSelectionsOrderedByBufferPosition() : this.editor.getSelections();
      actual = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = selections.length; j < len; j++) {
          s = selections[j];
          results.push(s.getText());
        }
        return results;
      })();
      return expect(actual).toEqual(toArray(text));
    };

    VimEditor.prototype.ensureSelectedText_ = function(text, ordered) {
      return this.ensureSelectedText(text.replace(/_/g, ' '), ordered);
    };

    VimEditor.prototype.ensureSelectionIsNarrowed = function(isNarrowed) {
      var actual;
      actual = this.vimState.modeManager.isNarrowed();
      return expect(actual).toEqual(isNarrowed);
    };

    VimEditor.prototype.ensureSelectedTextOrdered = function(text) {
      return this.ensureSelectedText(text, true);
    };

    VimEditor.prototype.ensureCursor = function(points, ordered) {
      var actual;
      if (ordered == null) {
        ordered = false;
      }
      actual = this.editor.getCursorBufferPositions();
      actual = actual.sort(function(a, b) {
        if (ordered) {
          return a.compare(b);
        }
      });
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensureCursorScreen = function(points) {
      var actual;
      actual = this.editor.getCursorScreenPositions();
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensureRegister = function(register) {
      var _value, ensure, name, property, reg, results, selection;
      results = [];
      for (name in register) {
        ensure = register[name];
        selection = ensure.selection;
        delete ensure.selection;
        reg = this.vimState.register.get(name, selection);
        results.push((function() {
          var results1;
          results1 = [];
          for (property in ensure) {
            _value = ensure[property];
            results1.push(expect(reg[property]).toEqual(_value));
          }
          return results1;
        })());
      }
      return results;
    };

    VimEditor.prototype.ensureNumCursors = function(number) {
      return expect(this.editor.getCursors()).toHaveLength(number);
    };

    VimEditor.prototype._ensureSelectedRangeBy = function(range, ordered, fn) {
      var actual, s, selections;
      if (ordered == null) {
        ordered = false;
      }
      selections = ordered ? this.editor.getSelectionsOrderedByBufferPosition() : this.editor.getSelections();
      actual = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = selections.length; j < len; j++) {
          s = selections[j];
          results.push(fn(s));
        }
        return results;
      })();
      return expect(actual).toEqual(toArrayOfRange(range));
    };

    VimEditor.prototype.ensureSelectedScreenRange = function(range, ordered) {
      if (ordered == null) {
        ordered = false;
      }
      return this._ensureSelectedRangeBy(range, ordered, function(s) {
        return s.getScreenRange();
      });
    };

    VimEditor.prototype.ensureSelectedScreenRangeOrdered = function(range) {
      return this.ensureSelectedScreenRange(range, true);
    };

    VimEditor.prototype.ensureSelectedBufferRange = function(range, ordered) {
      if (ordered == null) {
        ordered = false;
      }
      return this._ensureSelectedRangeBy(range, ordered, function(s) {
        return s.getBufferRange();
      });
    };

    VimEditor.prototype.ensureSelectedBufferRangeOrdered = function(range) {
      return this.ensureSelectedBufferRange(range, true);
    };

    VimEditor.prototype.ensureSelectionIsReversed = function(reversed) {
      var actual, j, len, ref1, results, selection;
      ref1 = this.editor.getSelections();
      results = [];
      for (j = 0, len = ref1.length; j < len; j++) {
        selection = ref1[j];
        actual = selection.isReversed();
        results.push(expect(actual).toBe(reversed));
      }
      return results;
    };

    VimEditor.prototype.ensurePersistentSelectionBufferRange = function(range) {
      var actual;
      actual = this.vimState.persistentSelection.getMarkerBufferRanges();
      return expect(actual).toEqual(toArrayOfRange(range));
    };

    VimEditor.prototype.ensurePersistentSelectionCount = function(number) {
      var actual;
      actual = this.vimState.persistentSelection.getMarkerCount();
      return expect(actual).toBe(number);
    };

    VimEditor.prototype.ensureOccurrenceCount = function(number) {
      var actual;
      actual = this.vimState.occurrenceManager.getMarkerCount();
      return expect(actual).toBe(number);
    };

    VimEditor.prototype.ensureOccurrenceText = function(text) {
      var actual, markers, r, ranges;
      markers = this.vimState.occurrenceManager.getMarkers();
      ranges = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = markers.length; j < len; j++) {
          r = markers[j];
          results.push(r.getBufferRange());
        }
        return results;
      })();
      actual = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = ranges.length; j < len; j++) {
          r = ranges[j];
          results.push(this.editor.getTextInBufferRange(r));
        }
        return results;
      }).call(this);
      return expect(actual).toEqual(toArray(text));
    };

    VimEditor.prototype.ensurePropertyHead = function(points) {
      var actual, getHeadProperty, s;
      getHeadProperty = (function(_this) {
        return function(selection) {
          return _this.vimState.swrap(selection).getBufferPositionFor('head', {
            from: ['property']
          });
        };
      })(this);
      actual = (function() {
        var j, len, ref1, results;
        ref1 = this.editor.getSelections();
        results = [];
        for (j = 0, len = ref1.length; j < len; j++) {
          s = ref1[j];
          results.push(getHeadProperty(s));
        }
        return results;
      }).call(this);
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensurePropertyTail = function(points) {
      var actual, getTailProperty, s;
      getTailProperty = (function(_this) {
        return function(selection) {
          return _this.vimState.swrap(selection).getBufferPositionFor('tail', {
            from: ['property']
          });
        };
      })(this);
      actual = (function() {
        var j, len, ref1, results;
        ref1 = this.editor.getSelections();
        results = [];
        for (j = 0, len = ref1.length; j < len; j++) {
          s = ref1[j];
          results.push(getTailProperty(s));
        }
        return results;
      }).call(this);
      return expect(actual).toEqual(toArrayOfPoint(points));
    };

    VimEditor.prototype.ensureScrollTop = function(scrollTop) {
      var actual;
      actual = this.editorElement.getScrollTop();
      return expect(actual).toEqual(scrollTop);
    };

    VimEditor.prototype.ensureMark = function(mark) {
      var actual, name, point, results;
      results = [];
      for (name in mark) {
        point = mark[name];
        actual = this.vimState.mark.get(name);
        results.push(expect(actual).toEqual(point));
      }
      return results;
    };

    VimEditor.prototype.ensureMode = function(mode) {
      var j, k, len, len1, m, ref1, results, shouldNotContainClasses;
      mode = toArray(mode).slice();
      expect((ref1 = this.vimState).isMode.apply(ref1, mode)).toBe(true);
      mode[0] = mode[0] + "-mode";
      mode = mode.filter(function(m) {
        return m;
      });
      expect(this.editorElement.classList.contains('vim-mode-plus')).toBe(true);
      for (j = 0, len = mode.length; j < len; j++) {
        m = mode[j];
        expect(this.editorElement.classList.contains(m)).toBe(true);
      }
      shouldNotContainClasses = _.difference(supportedModeClass, mode);
      results = [];
      for (k = 0, len1 = shouldNotContainClasses.length; k < len1; k++) {
        m = shouldNotContainClasses[k];
        results.push(expect(this.editorElement.classList.contains(m)).toBe(false));
      }
      return results;
    };

    VimEditor.prototype.keystroke = function(keys, options) {
      var event, finished, j, key, len, ref1, ref2, target;
      if (options == null) {
        options = {};
      }
      if (options.waitsForFinish) {
        finished = false;
        this.vimState.onDidFinishOperation(function() {
          return finished = true;
        });
        delete options.waitsForFinish;
        this.keystroke(keys, options);
        waitsFor(function() {
          return finished;
        });
        return;
      }
      target = this.editorElement;
      ref1 = keys.split(/\s+/);
      for (j = 0, len = ref1.length; j < len; j++) {
        key = ref1[j];
        if ((ref2 = this.vimState.__searchInput) != null ? ref2.hasFocus() : void 0) {
          target = this.vimState.searchInput.editorElement;
          switch (key) {
            case "enter":
              atom.commands.dispatch(target, 'core:confirm');
              break;
            case "escape":
              atom.commands.dispatch(target, 'core:cancel');
              break;
            default:
              this.vimState.searchInput.editor.insertText(key);
          }
        } else if (this.vimState.inputEditor != null) {
          target = this.vimState.inputEditor.element;
          switch (key) {
            case "enter":
              atom.commands.dispatch(target, 'core:confirm');
              break;
            case "escape":
              atom.commands.dispatch(target, 'core:cancel');
              break;
            default:
              this.vimState.inputEditor.insertText(key);
          }
        } else {
          event = buildKeydownEventFromKeystroke(normalizeKeystrokes(key), target);
          atom.keymaps.handleKeyboardEvent(event);
        }
      }
      if (options.partialMatchTimeout) {
        return advanceClock(atom.keymaps.getPartialMatchTimeout());
      }
    };

    return VimEditor;

  })();

  module.exports = {
    getVimState: getVimState,
    getView: getView,
    dispatch: dispatch,
    TextData: TextData,
    withMockPlatform: withMockPlatform
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL3NwZWMtaGVscGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMFhBQUE7SUFBQTs7OztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztFQUNULE1BQTZCLE9BQUEsQ0FBUSxNQUFSLENBQTdCLEVBQUMsaUJBQUQsRUFBUSxpQkFBUixFQUFlOztFQUNkLFVBQVcsT0FBQSxDQUFRLE1BQVI7O0VBQ1osV0FBQSxHQUFjLE9BQUEsQ0FBUSxxQkFBUjs7RUFDZCxRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztFQUVYLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLE9BQU8sQ0FBQzs7RUFDNUIsc0JBQXVCLE9BQUEsQ0FBUSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVosR0FBMkIsdUNBQW5DOztFQUV4QixrQkFBQSxHQUFxQixDQUNuQixhQURtQixFQUVuQixhQUZtQixFQUduQixhQUhtQixFQUluQixTQUptQixFQUtuQixVQUxtQixFQU1uQixXQU5tQixFQU9uQixlQVBtQjs7RUFZckIsVUFBQSxDQUFXLFNBQUE7SUFDVCxXQUFXLENBQUMsS0FBWixDQUFBO0lBQ0EsUUFBUSxDQUFDLEdBQVQsQ0FBYSx1QkFBYixFQUFzQyxLQUF0QztJQUNBLFFBQVEsQ0FBQyxHQUFULENBQWEsWUFBYixFQUEyQixLQUEzQjtJQUNBLFFBQVEsQ0FBQyxHQUFULENBQWEsY0FBYixFQUE2QixLQUE3QjtJQUNBLFFBQVEsQ0FBQyxHQUFULENBQWEsd0JBQWIsRUFBdUMsS0FBdkM7V0FDQSxRQUFRLENBQUMsR0FBVCxDQUFhLHNCQUFiLEVBQXFDLElBQXJDO0VBTlMsQ0FBWDs7RUFVQSxPQUFBLEdBQVUsU0FBQyxLQUFEO1dBQ1IsSUFBSSxDQUFDLEtB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b0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLE1BQXZCLEVBQStCLGNBQS9CO0FBQWI7QUFEUCxpQkFFTyxRQUZQO2NBRXFCLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBZCxDQUF1QixNQUF2QixFQUErQixhQUEvQjtBQUFkO0FBRlA7Y0FHTyxJQUFDLENBQUEsUUFBUSxDQUFDLFdBQVcsQ0FBQyxVQUF0QixDQUFpQyxHQUFqQztBQUhQLFdBRkc7U0FBQSxNQUFBO1VBUUgsS0FBQSxHQUFRLDhCQUFBLENBQStCLG1CQUFBLENBQW9CLEdBQXBCLENBQS9CLEVBQXlELE1BQXpEO1VBQ1IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBYixDQUFpQyxLQUFqQyxFQVRHOztBQVRQO01Bb0JBLElBQUcsT0FBTyxDQUFDLG1CQUFYO2VBQ0UsWUFBQSxDQUFhLElBQUksQ0FBQyxPQUFPLENBQUMsc0JBQWIsQ0FBQSxDQUFiLEVBREY7O0lBL0JTOzs7Ozs7RUFrQ2IsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFBQyxhQUFBLFdBQUQ7SUFBYyxTQUFBLE9BQWQ7SUFBdUIsVUFBQSxRQUF2QjtJQUFpQyxVQUFBLFFBQWpDO0lBQTJDLGtCQUFBLGdCQUEzQzs7QUFyZWpCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbnNlbXZlciA9IHJlcXVpcmUgJ3NlbXZlcidcbntSYW5nZSwgUG9pbnQsIERpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbntpbnNwZWN0fSA9IHJlcXVpcmUgJ3V0aWwnXG5nbG9iYWxTdGF0ZSA9IHJlcXVpcmUgJy4uL2xpYi9nbG9iYWwtc3RhdGUnXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4uL2xpYi9zZXR0aW5ncydcblxuS2V5bWFwTWFuYWdlciA9IGF0b20ua2V5bWFwcy5jb25zdHJ1Y3Rvclxue25vcm1hbGl6ZUtleXN0cm9rZXN9ID0gcmVxdWlyZShhdG9tLmNvbmZpZy5yZXNvdXJjZVBhdGggKyBcIi9ub2RlX21vZHVsZXMvYXRvbS1rZXltYXAvbGliL2hlbHBlcnNcIilcblxuc3VwcG9ydGVkTW9kZUNsYXNzID0gW1xuICAnbm9ybWFsLW1vZGUnXG4gICd2aXN1YWwtbW9kZSdcbiAgJ2luc2VydC1tb2RlJ1xuICAncmVwbGFjZSdcbiAgJ2xpbmV3aXNlJ1xuICAnYmxvY2t3aXNlJ1xuICAnY2hhcmFjdGVyd2lzZSdcbl1cblxuIyBJbml0IHNwZWMgc3RhdGVcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYmVmb3JlRWFjaCAtPlxuICBnbG9iYWxTdGF0ZS5yZXNldCgpXG4gIHNldHRpbmdzLnNldChcInN0YXlPblRyYW5zZm9ybVN0cmluZ1wiLCBmYWxzZSlcbiAgc2V0dGluZ3Muc2V0KFwic3RheU9uWWFua1wiLCBmYWxzZSlcbiAgc2V0dGluZ3Muc2V0KFwic3RheU9uRGVsZXRlXCIsIGZhbHNlKVxuICBzZXR0aW5ncy5zZXQoXCJzdGF5T25TZWxlY3RUZXh0T2JqZWN0XCIsIGZhbHNlKVxuICBzZXR0aW5ncy5zZXQoXCJzdGF5T25WZXJ0aWNhbE1vdGlvblwiLCB0cnVlKVxuXG4jIFV0aWxzXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmdldFZpZXcgPSAobW9kZWwpIC0+XG4gIGF0b20udmlld3MuZ2V0Vmlldyhtb2RlbClcblxuZGlzcGF0Y2ggPSAodGFyZ2V0LCBjb21tYW5kKSAtPlxuICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHRhcmdldCwgY29tbWFuZClcblxud2l0aE1vY2tQbGF0Zm9ybSA9ICh0YXJnZXQsIHBsYXRmb3JtLCBmbikgLT5cbiAgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIHdyYXBwZXIuY2xhc3NOYW1lID0gcGxhdGZvcm1cbiAgd3JhcHBlci5hcHBlbmRDaGlsZCh0YXJnZXQpXG4gIGZuKClcbiAgdGFyZ2V0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGFyZ2V0KVxuXG5idWlsZEtleWRvd25FdmVudCA9IChrZXksIG9wdGlvbnMpIC0+XG4gIEtleW1hcE1hbmFnZXIuYnVpbGRLZXlkb3duRXZlbnQoa2V5LCBvcHRpb25zKVxuXG5idWlsZEtleWRvd25FdmVudEZyb21LZXlzdHJva2UgPSAoa2V5c3Ryb2tlLCB0YXJnZXQpIC0+XG4gIG1vZGlmaWVyID0gWydjdHJsJywgJ2FsdCcsICdzaGlmdCcsICdjbWQnXVxuICBwYXJ0cyA9IGlmIGtleXN0cm9rZSBpcyAnLSdcbiAgICBbJy0nXVxuICBlbHNlXG4gICAga2V5c3Ryb2tlLnNwbGl0KCctJylcblxuICBvcHRpb25zID0ge3RhcmdldH1cbiAga2V5ID0gbnVsbFxuICBmb3IgcGFydCBpbiBwYXJ0c1xuICAgIGlmIHBhcnQgaW4gbW9kaWZpZXJcbiAgICAgIG9wdGlvbnNbcGFydF0gPSB0cnVlXG4gICAgZWxzZVxuICAgICAga2V5ID0gcGFydFxuXG4gIGlmIHNlbXZlci5zYXRpc2ZpZXMoYXRvbS5nZXRWZXJzaW9uKCksICc8IDEuMTInKVxuICAgIGtleSA9ICcgJyBpZiBrZXkgaXMgJ3NwYWNlJ1xuICBidWlsZEtleWRvd25FdmVudChrZXksIG9wdGlvbnMpXG5cbmJ1aWxkVGV4dElucHV0RXZlbnQgPSAoa2V5KSAtPlxuICBldmVudEFyZ3MgPSBbXG4gICAgdHJ1ZSAjIGJ1YmJsZXNcbiAgICB0cnVlICMgY2FuY2VsYWJsZVxuICAgIHdpbmRvdyAjIHZpZXdcbiAgICBrZXkgICMga2V5IGNoYXJcbiAgXVxuICBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdUZXh0RXZlbnQnKVxuICBldmVudC5pbml0VGV4dEV2ZW50KFwidGV4dElucHV0XCIsIGV2ZW50QXJncy4uLilcbiAgZXZlbnRcblxuaXNQb2ludCA9IChvYmopIC0+XG4gIGlmIG9iaiBpbnN0YW5jZW9mIFBvaW50XG4gICAgdHJ1ZVxuICBlbHNlXG4gICAgb2JqLmxlbmd0aCBpcyAyIGFuZCBfLmlzTnVtYmVyKG9ialswXSkgYW5kIF8uaXNOdW1iZXIob2JqWzFdKVxuXG5pc1JhbmdlID0gKG9iaikgLT5cbiAgaWYgb2JqIGluc3RhbmNlb2YgUmFuZ2VcbiAgICB0cnVlXG4gIGVsc2VcbiAgICBfLmFsbChbXG4gICAgICBfLmlzQXJyYXkob2JqKSxcbiAgICAgIChvYmoubGVuZ3RoIGlzIDIpLFxuICAgICAgaXNQb2ludChvYmpbMF0pLFxuICAgICAgaXNQb2ludChvYmpbMV0pXG4gICAgXSlcblxudG9BcnJheSA9IChvYmosIGNvbmQ9bnVsbCkgLT5cbiAgaWYgXy5pc0FycmF5KGNvbmQgPyBvYmopIHRoZW4gb2JqIGVsc2UgW29ial1cblxudG9BcnJheU9mUG9pbnQgPSAob2JqKSAtPlxuICBpZiBfLmlzQXJyYXkob2JqKSBhbmQgaXNQb2ludChvYmpbMF0pXG4gICAgb2JqXG4gIGVsc2VcbiAgICBbb2JqXVxuXG50b0FycmF5T2ZSYW5nZSA9IChvYmopIC0+XG4gIGlmIF8uaXNBcnJheShvYmopIGFuZCBfLmFsbChvYmoubWFwIChlKSAtPiBpc1JhbmdlKGUpKVxuICAgIG9ialxuICBlbHNlXG4gICAgW29ial1cblxuIyBNYWluXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmdldFZpbVN0YXRlID0gKGFyZ3MuLi4pIC0+XG4gIFtlZGl0b3IsIGZpbGUsIGNhbGxiYWNrXSA9IFtdXG4gIHN3aXRjaCBhcmdzLmxlbmd0aFxuICAgIHdoZW4gMSB0aGVuIFtjYWxsYmFja10gPSBhcmdzXG4gICAgd2hlbiAyIHRoZW4gW2ZpbGUsIGNhbGxiYWNrXSA9IGFyZ3NcblxuICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgndmltLW1vZGUtcGx1cycpXG5cbiAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgZmlsZSA9IGF0b20ucHJvamVjdC5yZXNvbHZlUGF0aChmaWxlKSBpZiBmaWxlXG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlKS50aGVuIChlKSAtPiBlZGl0b3IgPSBlXG5cbiAgcnVucyAtPlxuICAgIG1haW4gPSBhdG9tLnBhY2thZ2VzLmdldEFjdGl2ZVBhY2thZ2UoJ3ZpbS1tb2RlLXBsdXMnKS5tYWluTW9kdWxlXG4gICAgdmltU3RhdGUgPSBtYWluLmdldEVkaXRvclN0YXRlKGVkaXRvcilcbiAgICBjYWxsYmFjayh2aW1TdGF0ZSwgbmV3IFZpbUVkaXRvcih2aW1TdGF0ZSkpXG5cbmNsYXNzIFRleHREYXRhXG4gIGNvbnN0cnVjdG9yOiAoQHJhd0RhdGEpIC0+XG4gICAgQGxpbmVzID0gQHJhd0RhdGEuc3BsaXQoXCJcXG5cIilcblxuICBnZXRMaW5lczogKGxpbmVzLCB7Y2hvbXB9PXt9KSAtPlxuICAgIGNob21wID89IGZhbHNlXG4gICAgdGV4dCA9IChAbGluZXNbbGluZV0gZm9yIGxpbmUgaW4gbGluZXMpLmpvaW4oXCJcXG5cIilcbiAgICBpZiBjaG9tcFxuICAgICAgdGV4dFxuICAgIGVsc2VcbiAgICAgIHRleHQgKyBcIlxcblwiXG5cbiAgZ2V0TGluZTogKGxpbmUsIG9wdGlvbnMpIC0+XG4gICAgQGdldExpbmVzKFtsaW5lXSwgb3B0aW9ucylcblxuICBnZXRSYXc6IC0+XG4gICAgQHJhd0RhdGFcblxuY29sbGVjdEluZGV4SW5UZXh0ID0gKGNoYXIsIHRleHQpIC0+XG4gIGluZGV4ZXMgPSBbXVxuICBmcm9tSW5kZXggPSAwXG4gIHdoaWxlIChpbmRleCA9IHRleHQuaW5kZXhPZihjaGFyLCBmcm9tSW5kZXgpKSA+PSAwXG4gICAgZnJvbUluZGV4ID0gaW5kZXggKyAxXG4gICAgaW5kZXhlcy5wdXNoKGluZGV4KVxuICBpbmRleGVzXG5cbmNvbGxlY3RDaGFyUG9zaXRpb25zSW5UZXh0ID0gKGNoYXIsIHRleHQpIC0+XG4gIHBvc2l0aW9ucyA9IFtdXG4gIGZvciBsaW5lVGV4dCwgcm93TnVtYmVyIGluIHRleHQuc3BsaXQoL1xcbi8pXG4gICAgZm9yIGluZGV4LCBpIGluIGNvbGxlY3RJbmRleEluVGV4dChjaGFyLCBsaW5lVGV4dClcbiAgICAgIHBvc2l0aW9ucy5wdXNoKFtyb3dOdW1iZXIsIGluZGV4IC0gaV0pXG4gIHBvc2l0aW9uc1xuXG5jbGFzcyBWaW1FZGl0b3JcbiAgY29uc3RydWN0b3I6IChAdmltU3RhdGUpIC0+XG4gICAge0BlZGl0b3IsIEBlZGl0b3JFbGVtZW50fSA9IEB2aW1TdGF0ZVxuXG4gIHZhbGlkYXRlT3B0aW9uczogKG9wdGlvbnMsIHZhbGlkT3B0aW9ucywgbWVzc2FnZSkgLT5cbiAgICBpbnZhbGlkT3B0aW9ucyA9IF8ud2l0aG91dChfLmtleXMob3B0aW9ucyksIHZhbGlkT3B0aW9ucy4uLilcbiAgICBpZiBpbnZhbGlkT3B0aW9ucy5sZW5ndGhcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIiN7bWVzc2FnZX06ICN7aW5zcGVjdChpbnZhbGlkT3B0aW9ucyl9XCIpXG5cbiAgdmFsaWRhdGVFeGNsdXNpdmVPcHRpb25zOiAob3B0aW9ucywgcnVsZXMpIC0+XG4gICAgYWxsT3B0aW9ucyA9IE9iamVjdC5rZXlzKG9wdGlvbnMpXG4gICAgZm9yIG9wdGlvbiwgZXhjbHVzaXZlT3B0aW9ucyBvZiBydWxlcyB3aGVuIG9wdGlvbiBvZiBvcHRpb25zXG4gICAgICB2aW9sYXRpbmdPcHRpb25zID0gZXhjbHVzaXZlT3B0aW9ucy5maWx0ZXIgKGV4Y2x1c2l2ZU9wdGlvbikgLT4gZXhjbHVzaXZlT3B0aW9uIGluIGFsbE9wdGlvbnNcbiAgICAgIGlmIHZpb2xhdGluZ09wdGlvbnMubGVuZ3RoXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIiN7b3B0aW9ufSBpcyBleGNsdXNpdmUgd2l0aCBbI3t2aW9sYXRpbmdPcHRpb25zfV1cIilcblxuICBzZXRPcHRpb25zT3JkZXJlZCA9IFtcbiAgICAndGV4dCcsICd0ZXh0XycsXG4gICAgJ3RleHRDJywgJ3RleHRDXycsXG4gICAgJ2dyYW1tYXInLFxuICAgICdjdXJzb3InLCAnY3Vyc29yU2NyZWVuJ1xuICAgICdhZGRDdXJzb3InLCAnY3Vyc29yU2NyZWVuJ1xuICAgICdyZWdpc3RlcicsXG4gICAgJ3NlbGVjdGVkQnVmZmVyUmFuZ2UnXG4gIF1cblxuICBzZXRFeGNsdXNpdmVSdWxlcyA9XG4gICAgdGV4dEM6IFsnY3Vyc29yJywgJ2N1cnNvclNjcmVlbiddXG4gICAgdGV4dENfOiBbJ2N1cnNvcicsICdjdXJzb3JTY3JlZW4nXVxuXG4gICMgUHVibGljXG4gIHNldDogKG9wdGlvbnMpID0+XG4gICAgQHZhbGlkYXRlT3B0aW9ucyhvcHRpb25zLCBzZXRPcHRpb25zT3JkZXJlZCwgJ0ludmFsaWQgc2V0IG9wdGlvbnMnKVxuICAgIEB2YWxpZGF0ZUV4Y2x1c2l2ZU9wdGlvbnMob3B0aW9ucywgc2V0RXhjbHVzaXZlUnVsZXMpXG5cbiAgICBmb3IgbmFtZSBpbiBzZXRPcHRpb25zT3JkZXJlZCB3aGVuIG9wdGlvbnNbbmFtZV0/XG4gICAgICBtZXRob2QgPSAnc2V0JyArIF8uY2FwaXRhbGl6ZShfLmNhbWVsaXplKG5hbWUpKVxuICAgICAgdGhpc1ttZXRob2RdKG9wdGlvbnNbbmFtZV0pXG5cbiAgc2V0VGV4dDogKHRleHQpIC0+XG4gICAgQGVkaXRvci5zZXRUZXh0KHRleHQpXG5cbiAgc2V0VGV4dF86ICh0ZXh0KSAtPlxuICAgIEBzZXRUZXh0KHRleHQucmVwbGFjZSgvXy9nLCAnICcpKVxuXG4gIHNldFRleHRDOiAodGV4dCkgLT5cbiAgICBjdXJzb3JzID0gY29sbGVjdENoYXJQb3NpdGlvbnNJblRleHQoJ3wnLCB0ZXh0LnJlcGxhY2UoLyEvZywgJycpKVxuICAgIGxhc3RDdXJzb3IgPSBjb2xsZWN0Q2hhclBvc2l0aW9uc0luVGV4dCgnIScsIHRleHQucmVwbGFjZSgvXFx8L2csICcnKSlcbiAgICBAc2V0VGV4dCh0ZXh0LnJlcGxhY2UoL1tcXHwhXS9nLCAnJykpXG4gICAgY3Vyc29ycyA9IGN1cnNvcnMuY29uY2F0KGxhc3RDdXJzb3IpXG4gICAgaWYgY3Vyc29ycy5sZW5ndGhcbiAgICAgIEBzZXRDdXJzb3IoY3Vyc29ycylcblxuICBzZXRUZXh0Q186ICh0ZXh0KSAtPlxuICAgIEBzZXRUZXh0Qyh0ZXh0LnJlcGxhY2UoL18vZywgJyAnKSlcblxuICBzZXRHcmFtbWFyOiAoc2NvcGUpIC0+XG4gICAgQGVkaXRvci5zZXRHcmFtbWFyKGF0b20uZ3JhbW1hcnMuZ3JhbW1hckZvclNjb3BlTmFtZShzY29wZSkpXG5cbiAgc2V0Q3Vyc29yOiAocG9pbnRzKSAtPlxuICAgIHBvaW50cyA9IHRvQXJyYXlPZlBvaW50KHBvaW50cylcbiAgICBAZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKHBvaW50cy5zaGlmdCgpKVxuICAgIGZvciBwb2ludCBpbiBwb2ludHNcbiAgICAgIEBlZGl0b3IuYWRkQ3Vyc29yQXRCdWZmZXJQb3NpdGlvbihwb2ludClcblxuICBzZXRDdXJzb3JTY3JlZW46IChwb2ludHMpIC0+XG4gICAgcG9pbnRzID0gdG9BcnJheU9mUG9pbnQocG9pbnRzKVxuICAgIEBlZGl0b3Iuc2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24ocG9pbnRzLnNoaWZ0KCkpXG4gICAgZm9yIHBvaW50IGluIHBvaW50c1xuICAgICAgQGVkaXRvci5hZGRDdXJzb3JBdFNjcmVlblBvc2l0aW9uKHBvaW50KVxuXG4gIHNldEFkZEN1cnNvcjogKHBvaW50cykgLT5cbiAgICBmb3IgcG9pbnQgaW4gdG9BcnJheU9mUG9pbnQocG9pbnRzKVxuICAgICAgQGVkaXRvci5hZGRDdXJzb3JBdEJ1ZmZlclBvc2l0aW9uKHBvaW50KVxuXG4gIHNldFJlZ2lzdGVyOiAocmVnaXN0ZXIpIC0+XG4gICAgZm9yIG5hbWUsIHZhbHVlIG9mIHJlZ2lzdGVyXG4gICAgICBAdmltU3RhdGUucmVnaXN0ZXIuc2V0KG5hbWUsIHZhbHVlKVxuXG4gIHNldFNlbGVjdGVkQnVmZmVyUmFuZ2U6IChyYW5nZSkgLT5cbiAgICBAZWRpdG9yLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2UocmFuZ2UpXG5cbiAgZW5zdXJlT3B0aW9uc09yZGVyZWQgPSBbXG4gICAgJ3RleHQnLCAndGV4dF8nLFxuICAgICd0ZXh0QycsICd0ZXh0Q18nLFxuICAgICdzZWxlY3RlZFRleHQnLCAnc2VsZWN0ZWRUZXh0XycsICdzZWxlY3RlZFRleHRPcmRlcmVkJywgXCJzZWxlY3Rpb25Jc05hcnJvd2VkXCJcbiAgICAnY3Vyc29yJywgJ2N1cnNvclNjcmVlbidcbiAgICAnbnVtQ3Vyc29ycydcbiAgICAncmVnaXN0ZXInLFxuICAgICdzZWxlY3RlZFNjcmVlblJhbmdlJywgJ3NlbGVjdGVkU2NyZWVuUmFuZ2VPcmRlcmVkJ1xuICAgICdzZWxlY3RlZEJ1ZmZlclJhbmdlJywgJ3NlbGVjdGVkQnVmZmVyUmFuZ2VPcmRlcmVkJ1xuICAgICdzZWxlY3Rpb25Jc1JldmVyc2VkJyxcbiAgICAncGVyc2lzdGVudFNlbGVjdGlvbkJ1ZmZlclJhbmdlJywgJ3BlcnNpc3RlbnRTZWxlY3Rpb25Db3VudCdcbiAgICAnb2NjdXJyZW5jZUNvdW50JywgJ29jY3VycmVuY2VUZXh0J1xuICAgICdwcm9wZXJ0eUhlYWQnXG4gICAgJ3Byb3BlcnR5VGFpbCdcbiAgICAnc2Nyb2xsVG9wJyxcbiAgICAnbWFyaydcbiAgICAnbW9kZScsXG4gIF1cbiAgZW5zdXJlRXhjbHVzaXZlUnVsZXMgPVxuICAgIHRleHRDOiBbJ2N1cnNvcicsICdjdXJzb3JTY3JlZW4nXVxuICAgIHRleHRDXzogWydjdXJzb3InLCAnY3Vyc29yU2NyZWVuJ11cblxuICBnZXRBbmREZWxldGVLZXlzdHJva2VPcHRpb25zOiAob3B0aW9ucykgLT5cbiAgICB7cGFydGlhbE1hdGNoVGltZW91dH0gPSBvcHRpb25zXG4gICAgZGVsZXRlIG9wdGlvbnMucGFydGlhbE1hdGNoVGltZW91dFxuICAgIHtwYXJ0aWFsTWF0Y2hUaW1lb3V0fVxuXG4gICMgUHVibGljXG4gIGVuc3VyZTogKGFyZ3MuLi4pID0+XG4gICAgc3dpdGNoIGFyZ3MubGVuZ3RoXG4gICAgICB3aGVuIDEgdGhlbiBbb3B0aW9uc10gPSBhcmdzXG4gICAgICB3aGVuIDIgdGhlbiBba2V5c3Ryb2tlLCBvcHRpb25zXSA9IGFyZ3NcblxuICAgIHVubGVzcyB0eXBlb2Yob3B0aW9ucykgaXMgJ29iamVjdCdcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgb3B0aW9ucyBmb3IgJ2Vuc3VyZSc6IG11c3QgYmUgJ29iamVjdCcgYnV0IGdvdCAnI3t0eXBlb2Yob3B0aW9ucyl9J1wiKVxuICAgIGlmIGtleXN0cm9rZT8gYW5kIG5vdCAodHlwZW9mKGtleXN0cm9rZSkgaXMgJ3N0cmluZycgb3IgQXJyYXkuaXNBcnJheShrZXlzdHJva2UpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBrZXlzdHJva2UgZm9yICdlbnN1cmUnOiBtdXN0IGJlICdzdHJpbmcnIG9yICdhcnJheScgYnV0IGdvdCAnI3t0eXBlb2Yoa2V5c3Ryb2tlKX0nXCIpXG5cbiAgICBrZXlzdHJva2VPcHRpb25zID0gQGdldEFuZERlbGV0ZUtleXN0cm9rZU9wdGlvbnMob3B0aW9ucylcblxuICAgIEB2YWxpZGF0ZU9wdGlvbnMob3B0aW9ucywgZW5zdXJlT3B0aW9uc09yZGVyZWQsICdJbnZhbGlkIGVuc3VyZSBvcHRpb24nKVxuICAgIEB2YWxpZGF0ZUV4Y2x1c2l2ZU9wdGlvbnMob3B0aW9ucywgZW5zdXJlRXhjbHVzaXZlUnVsZXMpXG5cbiAgICAjIElucHV0XG4gICAgdW5sZXNzIF8uaXNFbXB0eShrZXlzdHJva2UpXG4gICAgICBAa2V5c3Ryb2tlKGtleXN0cm9rZSwga2V5c3Ryb2tlT3B0aW9ucylcblxuICAgIGZvciBuYW1lIGluIGVuc3VyZU9wdGlvbnNPcmRlcmVkIHdoZW4gb3B0aW9uc1tuYW1lXT9cbiAgICAgIG1ldGhvZCA9ICdlbnN1cmUnICsgXy5jYXBpdGFsaXplKF8uY2FtZWxpemUobmFtZSkpXG4gICAgICB0aGlzW21ldGhvZF0ob3B0aW9uc1tuYW1lXSlcblxuICBiaW5kRW5zdXJlT3B0aW9uOiAob3B0aW9uc0Jhc2UpID0+XG4gICAgKGtleXN0cm9rZSwgb3B0aW9ucykgPT5cbiAgICAgIGludGVyc2VjdGluZ09wdGlvbnMgPSBfLmludGVyc2VjdGlvbihfLmtleXMob3B0aW9ucyksIF8ua2V5cyhvcHRpb25zQmFzZSkpXG4gICAgICBpZiBpbnRlcnNlY3RpbmdPcHRpb25zLmxlbmd0aFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjb25mbGljdCB3aXRoIGJvdW5kIG9wdGlvbnMgI3tpbnNwZWN0KGludGVyc2VjdGluZ09wdGlvbnMpfVwiKVxuXG4gICAgICBAZW5zdXJlKGtleXN0cm9rZSwgXy5kZWZhdWx0cyhfLmNsb25lKG9wdGlvbnMpLCBvcHRpb25zQmFzZSkpXG5cbiAgZW5zdXJlQnlEaXNwYXRjaDogKGNvbW1hbmQsIG9wdGlvbnMpID0+XG4gICAgZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KEBlZGl0b3IpLCBjb21tYW5kKVxuICAgIGZvciBuYW1lIGluIGVuc3VyZU9wdGlvbnNPcmRlcmVkIHdoZW4gb3B0aW9uc1tuYW1lXT9cbiAgICAgIG1ldGhvZCA9ICdlbnN1cmUnICsgXy5jYXBpdGFsaXplKF8uY2FtZWxpemUobmFtZSkpXG4gICAgICB0aGlzW21ldGhvZF0ob3B0aW9uc1tuYW1lXSlcblxuICBlbnN1cmVUZXh0OiAodGV4dCkgLT5cbiAgICBleHBlY3QoQGVkaXRvci5nZXRUZXh0KCkpLnRvRXF1YWwodGV4dClcblxuICBlbnN1cmVUZXh0XzogKHRleHQpIC0+XG4gICAgQGVuc3VyZVRleHQodGV4dC5yZXBsYWNlKC9fL2csICcgJykpXG5cbiAgZW5zdXJlVGV4dEM6ICh0ZXh0KSAtPlxuICAgIGN1cnNvcnMgPSBjb2xsZWN0Q2hhclBvc2l0aW9uc0luVGV4dCgnfCcsIHRleHQucmVwbGFjZSgvIS9nLCAnJykpXG4gICAgbGFzdEN1cnNvciA9IGNvbGxlY3RDaGFyUG9zaXRpb25zSW5UZXh0KCchJywgdGV4dC5yZXBsYWNlKC9cXHwvZywgJycpKVxuICAgIGN1cnNvcnMgPSBjdXJzb3JzLmNvbmNhdChsYXN0Q3Vyc29yKVxuICAgIGN1cnNvcnMgPSBjdXJzb3JzXG4gICAgICAubWFwIChwb2ludCkgLT4gUG9pbnQuZnJvbU9iamVjdChwb2ludClcbiAgICAgIC5zb3J0IChhLCBiKSAtPiBhLmNvbXBhcmUoYilcbiAgICBAZW5zdXJlVGV4dCh0ZXh0LnJlcGxhY2UoL1tcXHwhXS9nLCAnJykpXG4gICAgaWYgY3Vyc29ycy5sZW5ndGhcbiAgICAgIEBlbnN1cmVDdXJzb3IoY3Vyc29ycywgdHJ1ZSlcblxuICAgIGlmIGxhc3RDdXJzb3IubGVuZ3RoXG4gICAgICBleHBlY3QoQGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpKS50b0VxdWFsKGxhc3RDdXJzb3JbMF0pXG5cbiAgZW5zdXJlVGV4dENfOiAodGV4dCkgLT5cbiAgICBAZW5zdXJlVGV4dEModGV4dC5yZXBsYWNlKC9fL2csICcgJykpXG5cbiAgZW5zdXJlU2VsZWN0ZWRUZXh0OiAodGV4dCwgb3JkZXJlZD1mYWxzZSkgLT5cbiAgICBzZWxlY3Rpb25zID0gaWYgb3JkZXJlZFxuICAgICAgQGVkaXRvci5nZXRTZWxlY3Rpb25zT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24oKVxuICAgIGVsc2VcbiAgICAgIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgYWN0dWFsID0gKHMuZ2V0VGV4dCgpIGZvciBzIGluIHNlbGVjdGlvbnMpXG4gICAgZXhwZWN0KGFjdHVhbCkudG9FcXVhbCh0b0FycmF5KHRleHQpKVxuXG4gIGVuc3VyZVNlbGVjdGVkVGV4dF86ICh0ZXh0LCBvcmRlcmVkKSAtPlxuICAgIEBlbnN1cmVTZWxlY3RlZFRleHQodGV4dC5yZXBsYWNlKC9fL2csICcgJyksIG9yZGVyZWQpXG5cbiAgZW5zdXJlU2VsZWN0aW9uSXNOYXJyb3dlZDogKGlzTmFycm93ZWQpIC0+XG4gICAgYWN0dWFsID0gQHZpbVN0YXRlLm1vZGVNYW5hZ2VyLmlzTmFycm93ZWQoKVxuICAgIGV4cGVjdChhY3R1YWwpLnRvRXF1YWwoaXNOYXJyb3dlZClcblxuICBlbnN1cmVTZWxlY3RlZFRleHRPcmRlcmVkOiAodGV4dCkgLT5cbiAgICBAZW5zdXJlU2VsZWN0ZWRUZXh0KHRleHQsIHRydWUpXG5cbiAgZW5zdXJlQ3Vyc29yOiAocG9pbnRzLCBvcmRlcmVkPWZhbHNlKSAtPlxuICAgIGFjdHVhbCA9IEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb25zKClcbiAgICBhY3R1YWwgPSBhY3R1YWwuc29ydCAoYSwgYikgLT4gYS5jb21wYXJlKGIpIGlmIG9yZGVyZWRcbiAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsKHRvQXJyYXlPZlBvaW50KHBvaW50cykpXG5cbiAgZW5zdXJlQ3Vyc29yU2NyZWVuOiAocG9pbnRzKSAtPlxuICAgIGFjdHVhbCA9IEBlZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb25zKClcbiAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsKHRvQXJyYXlPZlBvaW50KHBvaW50cykpXG5cbiAgZW5zdXJlUmVnaXN0ZXI6IChyZWdpc3RlcikgLT5cbiAgICBmb3IgbmFtZSwgZW5zdXJlIG9mIHJlZ2lzdGVyXG4gICAgICB7c2VsZWN0aW9ufSA9IGVuc3VyZVxuICAgICAgZGVsZXRlIGVuc3VyZS5zZWxlY3Rpb25cbiAgICAgIHJlZyA9IEB2aW1TdGF0ZS5yZWdpc3Rlci5nZXQobmFtZSwgc2VsZWN0aW9uKVxuICAgICAgZm9yIHByb3BlcnR5LCBfdmFsdWUgb2YgZW5zdXJlXG4gICAgICAgIGV4cGVjdChyZWdbcHJvcGVydHldKS50b0VxdWFsKF92YWx1ZSlcblxuICBlbnN1cmVOdW1DdXJzb3JzOiAobnVtYmVyKSAtPlxuICAgIGV4cGVjdChAZWRpdG9yLmdldEN1cnNvcnMoKSkudG9IYXZlTGVuZ3RoIG51bWJlclxuXG4gIF9lbnN1cmVTZWxlY3RlZFJhbmdlQnk6IChyYW5nZSwgb3JkZXJlZD1mYWxzZSwgZm4pIC0+XG4gICAgc2VsZWN0aW9ucyA9IGlmIG9yZGVyZWRcbiAgICAgIEBlZGl0b3IuZ2V0U2VsZWN0aW9uc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uKClcbiAgICBlbHNlXG4gICAgICBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgIGFjdHVhbCA9IChmbihzKSBmb3IgcyBpbiBzZWxlY3Rpb25zKVxuICAgIGV4cGVjdChhY3R1YWwpLnRvRXF1YWwodG9BcnJheU9mUmFuZ2UocmFuZ2UpKVxuXG4gIGVuc3VyZVNlbGVjdGVkU2NyZWVuUmFuZ2U6IChyYW5nZSwgb3JkZXJlZD1mYWxzZSkgLT5cbiAgICBAX2Vuc3VyZVNlbGVjdGVkUmFuZ2VCeSByYW5nZSwgb3JkZXJlZCwgKHMpIC0+IHMuZ2V0U2NyZWVuUmFuZ2UoKVxuXG4gIGVuc3VyZVNlbGVjdGVkU2NyZWVuUmFuZ2VPcmRlcmVkOiAocmFuZ2UpIC0+XG4gICAgQGVuc3VyZVNlbGVjdGVkU2NyZWVuUmFuZ2UocmFuZ2UsIHRydWUpXG5cbiAgZW5zdXJlU2VsZWN0ZWRCdWZmZXJSYW5nZTogKHJhbmdlLCBvcmRlcmVkPWZhbHNlKSAtPlxuICAgIEBfZW5zdXJlU2VsZWN0ZWRSYW5nZUJ5IHJhbmdlLCBvcmRlcmVkLCAocykgLT4gcy5nZXRCdWZmZXJSYW5nZSgpXG5cbiAgZW5zdXJlU2VsZWN0ZWRCdWZmZXJSYW5nZU9yZGVyZWQ6IChyYW5nZSkgLT5cbiAgICBAZW5zdXJlU2VsZWN0ZWRCdWZmZXJSYW5nZShyYW5nZSwgdHJ1ZSlcblxuICBlbnN1cmVTZWxlY3Rpb25Jc1JldmVyc2VkOiAocmV2ZXJzZWQpIC0+XG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgYWN0dWFsID0gc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKVxuICAgICAgZXhwZWN0KGFjdHVhbCkudG9CZShyZXZlcnNlZClcblxuICBlbnN1cmVQZXJzaXN0ZW50U2VsZWN0aW9uQnVmZmVyUmFuZ2U6IChyYW5nZSkgLT5cbiAgICBhY3R1YWwgPSBAdmltU3RhdGUucGVyc2lzdGVudFNlbGVjdGlvbi5nZXRNYXJrZXJCdWZmZXJSYW5nZXMoKVxuICAgIGV4cGVjdChhY3R1YWwpLnRvRXF1YWwodG9BcnJheU9mUmFuZ2UocmFuZ2UpKVxuXG4gIGVuc3VyZVBlcnNpc3RlbnRTZWxlY3Rpb25Db3VudDogKG51bWJlcikgLT5cbiAgICBhY3R1YWwgPSBAdmltU3RhdGUucGVyc2lzdGVudFNlbGVjdGlvbi5nZXRNYXJrZXJDb3VudCgpXG4gICAgZXhwZWN0KGFjdHVhbCkudG9CZSBudW1iZXJcblxuICBlbnN1cmVPY2N1cnJlbmNlQ291bnQ6IChudW1iZXIpIC0+XG4gICAgYWN0dWFsID0gQHZpbVN0YXRlLm9jY3VycmVuY2VNYW5hZ2VyLmdldE1hcmtlckNvdW50KClcbiAgICBleHBlY3QoYWN0dWFsKS50b0JlIG51bWJlclxuXG4gIGVuc3VyZU9jY3VycmVuY2VUZXh0OiAodGV4dCkgLT5cbiAgICBtYXJrZXJzID0gQHZpbVN0YXRlLm9jY3VycmVuY2VNYW5hZ2VyLmdldE1hcmtlcnMoKVxuICAgIHJhbmdlcyA9IChyLmdldEJ1ZmZlclJhbmdlKCkgZm9yIHIgaW4gbWFya2VycylcbiAgICBhY3R1YWwgPSAoQGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyKSBmb3IgciBpbiByYW5nZXMpXG4gICAgZXhwZWN0KGFjdHVhbCkudG9FcXVhbCh0b0FycmF5KHRleHQpKVxuXG4gIGVuc3VyZVByb3BlcnR5SGVhZDogKHBvaW50cykgLT5cbiAgICBnZXRIZWFkUHJvcGVydHkgPSAoc2VsZWN0aW9uKSA9PlxuICAgICAgQHZpbVN0YXRlLnN3cmFwKHNlbGVjdGlvbikuZ2V0QnVmZmVyUG9zaXRpb25Gb3IoJ2hlYWQnLCBmcm9tOiBbJ3Byb3BlcnR5J10pXG4gICAgYWN0dWFsID0gKGdldEhlYWRQcm9wZXJ0eShzKSBmb3IgcyBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKSlcbiAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsKHRvQXJyYXlPZlBvaW50KHBvaW50cykpXG5cbiAgZW5zdXJlUHJvcGVydHlUYWlsOiAocG9pbnRzKSAtPlxuICAgIGdldFRhaWxQcm9wZXJ0eSA9IChzZWxlY3Rpb24pID0+XG4gICAgICBAdmltU3RhdGUuc3dyYXAoc2VsZWN0aW9uKS5nZXRCdWZmZXJQb3NpdGlvbkZvcigndGFpbCcsIGZyb206IFsncHJvcGVydHknXSlcbiAgICBhY3R1YWwgPSAoZ2V0VGFpbFByb3BlcnR5KHMpIGZvciBzIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpKVxuICAgIGV4cGVjdChhY3R1YWwpLnRvRXF1YWwodG9BcnJheU9mUG9pbnQocG9pbnRzKSlcblxuICBlbnN1cmVTY3JvbGxUb3A6IChzY3JvbGxUb3ApIC0+XG4gICAgYWN0dWFsID0gQGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKClcbiAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsIHNjcm9sbFRvcFxuXG4gIGVuc3VyZU1hcms6IChtYXJrKSAtPlxuICAgIGZvciBuYW1lLCBwb2ludCBvZiBtYXJrXG4gICAgICBhY3R1YWwgPSBAdmltU3RhdGUubWFyay5nZXQobmFtZSlcbiAgICAgIGV4cGVjdChhY3R1YWwpLnRvRXF1YWwocG9pbnQpXG5cbiAgZW5zdXJlTW9kZTogKG1vZGUpIC0+XG4gICAgbW9kZSA9IHRvQXJyYXkobW9kZSkuc2xpY2UoKVxuICAgIGV4cGVjdChAdmltU3RhdGUuaXNNb2RlKG1vZGUuLi4pKS50b0JlKHRydWUpXG5cbiAgICBtb2RlWzBdID0gXCIje21vZGVbMF19LW1vZGVcIlxuICAgIG1vZGUgPSBtb2RlLmZpbHRlcigobSkgLT4gbSlcbiAgICBleHBlY3QoQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCd2aW0tbW9kZS1wbHVzJykpLnRvQmUodHJ1ZSlcbiAgICBmb3IgbSBpbiBtb2RlXG4gICAgICBleHBlY3QoQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKG0pKS50b0JlKHRydWUpXG4gICAgc2hvdWxkTm90Q29udGFpbkNsYXNzZXMgPSBfLmRpZmZlcmVuY2Uoc3VwcG9ydGVkTW9kZUNsYXNzLCBtb2RlKVxuICAgIGZvciBtIGluIHNob3VsZE5vdENvbnRhaW5DbGFzc2VzXG4gICAgICBleHBlY3QoQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKG0pKS50b0JlKGZhbHNlKVxuXG4gICMgUHVibGljXG4gICMgb3B0aW9uc1xuICAjIC0gd2FpdHNGb3JGaW5pc2hcbiAga2V5c3Ryb2tlOiAoa2V5cywgb3B0aW9ucz17fSkgPT5cbiAgICBpZiBvcHRpb25zLndhaXRzRm9yRmluaXNoXG4gICAgICBmaW5pc2hlZCA9IGZhbHNlXG4gICAgICBAdmltU3RhdGUub25EaWRGaW5pc2hPcGVyYXRpb24gLT4gZmluaXNoZWQgPSB0cnVlXG4gICAgICBkZWxldGUgb3B0aW9ucy53YWl0c0ZvckZpbmlzaFxuICAgICAgQGtleXN0cm9rZShrZXlzLCBvcHRpb25zKVxuICAgICAgd2FpdHNGb3IgLT4gZmluaXNoZWRcbiAgICAgIHJldHVyblxuXG4gICAgdGFyZ2V0ID0gQGVkaXRvckVsZW1lbnRcblxuICAgIGZvciBrZXkgaW4ga2V5cy5zcGxpdCgvXFxzKy8pXG4gICAgICAjIFtGSVhNRV0gV2h5IGNhbid0IEkgbGV0IGF0b20ua2V5bWFwcyBoYW5kbGUgZW50ZXIvZXNjYXBlIGJ5IGJ1aWxkRXZlbnQgYW5kIGhhbmRsZUtleWJvYXJkRXZlbnRcbiAgICAgIGlmIEB2aW1TdGF0ZS5fX3NlYXJjaElucHV0Py5oYXNGb2N1cygpICMgdG8gYXZvaWQgYXV0byBwb3B1bGF0ZVxuICAgICAgICB0YXJnZXQgPSBAdmltU3RhdGUuc2VhcmNoSW5wdXQuZWRpdG9yRWxlbWVudFxuICAgICAgICBzd2l0Y2gga2V5XG4gICAgICAgICAgd2hlbiBcImVudGVyXCIgdGhlbiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHRhcmdldCwgJ2NvcmU6Y29uZmlybScpXG4gICAgICAgICAgd2hlbiBcImVzY2FwZVwiIHRoZW4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh0YXJnZXQsICdjb3JlOmNhbmNlbCcpXG4gICAgICAgICAgZWxzZSBAdmltU3RhdGUuc2VhcmNoSW5wdXQuZWRpdG9yLmluc2VydFRleHQoa2V5KVxuXG4gICAgICBlbHNlIGlmIEB2aW1TdGF0ZS5pbnB1dEVkaXRvcj9cbiAgICAgICAgdGFyZ2V0ID0gQHZpbVN0YXRlLmlucHV0RWRpdG9yLmVsZW1lbnRcbiAgICAgICAgc3dpdGNoIGtleVxuICAgICAgICAgIHdoZW4gXCJlbnRlclwiIHRoZW4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh0YXJnZXQsICdjb3JlOmNvbmZpcm0nKVxuICAgICAgICAgIHdoZW4gXCJlc2NhcGVcIiB0aGVuIGF0b20uY29tbWFuZHMuZGlzcGF0Y2godGFyZ2V0LCAnY29yZTpjYW5jZWwnKVxuICAgICAgICAgIGVsc2UgQHZpbVN0YXRlLmlucHV0RWRpdG9yLmluc2VydFRleHQoa2V5KVxuXG4gICAgICBlbHNlXG4gICAgICAgIGV2ZW50ID0gYnVpbGRLZXlkb3duRXZlbnRGcm9tS2V5c3Ryb2tlKG5vcm1hbGl6ZUtleXN0cm9rZXMoa2V5KSwgdGFyZ2V0KVxuICAgICAgICBhdG9tLmtleW1hcHMuaGFuZGxlS2V5Ym9hcmRFdmVudChldmVudClcblxuICAgIGlmIG9wdGlvbnMucGFydGlhbE1hdGNoVGltZW91dFxuICAgICAgYWR2YW5jZUNsb2NrKGF0b20ua2V5bWFwcy5nZXRQYXJ0aWFsTWF0Y2hUaW1lb3V0KCkpXG5cbm1vZHVsZS5leHBvcnRzID0ge2dldFZpbVN0YXRlLCBnZXRWaWV3LCBkaXNwYXRjaCwgVGV4dERhdGEsIHdpdGhNb2NrUGxhdGZvcm19XG4iXX0=
