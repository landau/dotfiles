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
    return settings.set("stayOnDelete", false);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL3NwZWMtaGVscGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsMFhBQUE7SUFBQTs7OztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztFQUNULE1BQTZCLE9BQUEsQ0FBUSxNQUFSLENBQTdCLEVBQUMsaUJBQUQsRUFBUSxpQkFBUixFQUFlOztFQUNkLFVBQVcsT0FBQSxDQUFRLE1BQVI7O0VBQ1osV0FBQSxHQUFjLE9BQUEsQ0FBUSxxQkFBUjs7RUFDZCxRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztFQUVYLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLE9BQU8sQ0FBQzs7RUFDNUIsc0JBQXVCLE9BQUEsQ0FBUSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVosR0FBMkIsdUNBQW5DOztFQUV4QixrQkFBQSxHQUFxQixDQUNuQixhQURtQixFQUVuQixhQUZtQixFQUduQixhQUhtQixFQUluQixTQUptQixFQUtuQixVQUxtQixFQU1uQixXQU5tQixFQU9uQixlQVBtQjs7RUFZckIsVUFBQSxDQUFXLFNBQUE7SUFDVCxXQUFXLENBQUMsS0FBWixDQUFBO0lBQ0EsUUFBUSxDQUFDLEdBQVQsQ0FBYSx1QkFBYixFQUFzQyxLQUF0QztJQUNBLFFBQVEsQ0FBQyxHQUFULENBQWEsWUFBYixFQUEyQixLQUEzQjtXQUNBLFFBQVEsQ0FBQyxHQUFULENBQWEsY0FBYixFQUE2QixLQUE3QjtFQUpTLENBQVg7O0VBUUEsT0FBQSxHQUFVLFNBQUMsS0FBRDtXQUNSLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixLQUFuQjtFQURROztFQUdWLFFBQUEsR0FBVyxTQUFDLE1BQUQsRUFBUyxPQUFUO1dBQ1QsSUFBSSxDQUFDLFFBQVEs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QUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsTUFBdkIsRUFBK0IsYUFBL0I7QUFBZDtBQUZQO2NBR08sSUFBQyxDQUFBLFFBQVEsQ0FBQyxXQUFXLENBQUMsVUFBdEIsQ0FBaUMsR0FBakM7QUFIUCxXQUZHO1NBQUEsTUFBQTtVQVFILEtBQUEsR0FBUSw4QkFBQSxDQUErQixtQkFBQSxDQUFvQixHQUFwQixDQUEvQixFQUF5RCxNQUF6RDtVQUNSLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQWIsQ0FBaUMsS0FBakMsRUFURzs7QUFUUDtNQW9CQSxJQUFHLE9BQU8sQ0FBQyxtQkFBWDtlQUNFLFlBQUEsQ0FBYSxJQUFJLENBQUMsT0FBTyxDQUFDLHNCQUFiLENBQUEsQ0FBYixFQURGOztJQS9CUzs7Ozs7O0VBa0NiLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBQUMsYUFBQSxXQUFEO0lBQWMsU0FBQSxPQUFkO0lBQXVCLFVBQUEsUUFBdkI7SUFBaUMsVUFBQSxRQUFqQztJQUEyQyxrQkFBQSxnQkFBM0M7O0FBbmVqQiIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG5zZW12ZXIgPSByZXF1aXJlICdzZW12ZXInXG57UmFuZ2UsIFBvaW50LCBEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG57aW5zcGVjdH0gPSByZXF1aXJlICd1dGlsJ1xuZ2xvYmFsU3RhdGUgPSByZXF1aXJlICcuLi9saWIvZ2xvYmFsLXN0YXRlJ1xuc2V0dGluZ3MgPSByZXF1aXJlICcuLi9saWIvc2V0dGluZ3MnXG5cbktleW1hcE1hbmFnZXIgPSBhdG9tLmtleW1hcHMuY29uc3RydWN0b3Jcbntub3JtYWxpemVLZXlzdHJva2VzfSA9IHJlcXVpcmUoYXRvbS5jb25maWcucmVzb3VyY2VQYXRoICsgXCIvbm9kZV9tb2R1bGVzL2F0b20ta2V5bWFwL2xpYi9oZWxwZXJzXCIpXG5cbnN1cHBvcnRlZE1vZGVDbGFzcyA9IFtcbiAgJ25vcm1hbC1tb2RlJ1xuICAndmlzdWFsLW1vZGUnXG4gICdpbnNlcnQtbW9kZSdcbiAgJ3JlcGxhY2UnXG4gICdsaW5ld2lzZSdcbiAgJ2Jsb2Nrd2lzZSdcbiAgJ2NoYXJhY3Rlcndpc2UnXG5dXG5cbiMgSW5pdCBzcGVjIHN0YXRlXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmJlZm9yZUVhY2ggLT5cbiAgZ2xvYmFsU3RhdGUucmVzZXQoKVxuICBzZXR0aW5ncy5zZXQoXCJzdGF5T25UcmFuc2Zvcm1TdHJpbmdcIiwgZmFsc2UpXG4gIHNldHRpbmdzLnNldChcInN0YXlPbllhbmtcIiwgZmFsc2UpXG4gIHNldHRpbmdzLnNldChcInN0YXlPbkRlbGV0ZVwiLCBmYWxzZSlcblxuIyBVdGlsc1xuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5nZXRWaWV3ID0gKG1vZGVsKSAtPlxuICBhdG9tLnZpZXdzLmdldFZpZXcobW9kZWwpXG5cbmRpc3BhdGNoID0gKHRhcmdldCwgY29tbWFuZCkgLT5cbiAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh0YXJnZXQsIGNvbW1hbmQpXG5cbndpdGhNb2NrUGxhdGZvcm0gPSAodGFyZ2V0LCBwbGF0Zm9ybSwgZm4pIC0+XG4gIHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICB3cmFwcGVyLmNsYXNzTmFtZSA9IHBsYXRmb3JtXG4gIHdyYXBwZXIuYXBwZW5kQ2hpbGQodGFyZ2V0KVxuICBmbigpXG4gIHRhcmdldC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRhcmdldClcblxuYnVpbGRLZXlkb3duRXZlbnQgPSAoa2V5LCBvcHRpb25zKSAtPlxuICBLZXltYXBNYW5hZ2VyLmJ1aWxkS2V5ZG93bkV2ZW50KGtleSwgb3B0aW9ucylcblxuYnVpbGRLZXlkb3duRXZlbnRGcm9tS2V5c3Ryb2tlID0gKGtleXN0cm9rZSwgdGFyZ2V0KSAtPlxuICBtb2RpZmllciA9IFsnY3RybCcsICdhbHQnLCAnc2hpZnQnLCAnY21kJ11cbiAgcGFydHMgPSBpZiBrZXlzdHJva2UgaXMgJy0nXG4gICAgWyctJ11cbiAgZWxzZVxuICAgIGtleXN0cm9rZS5zcGxpdCgnLScpXG5cbiAgb3B0aW9ucyA9IHt0YXJnZXR9XG4gIGtleSA9IG51bGxcbiAgZm9yIHBhcnQgaW4gcGFydHNcbiAgICBpZiBwYXJ0IGluIG1vZGlmaWVyXG4gICAgICBvcHRpb25zW3BhcnRdID0gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGtleSA9IHBhcnRcblxuICBpZiBzZW12ZXIuc2F0aXNmaWVzKGF0b20uZ2V0VmVyc2lvbigpLCAnPCAxLjEyJylcbiAgICBrZXkgPSAnICcgaWYga2V5IGlzICdzcGFjZSdcbiAgYnVpbGRLZXlkb3duRXZlbnQoa2V5LCBvcHRpb25zKVxuXG5idWlsZFRleHRJbnB1dEV2ZW50ID0gKGtleSkgLT5cbiAgZXZlbnRBcmdzID0gW1xuICAgIHRydWUgIyBidWJibGVzXG4gICAgdHJ1ZSAjIGNhbmNlbGFibGVcbiAgICB3aW5kb3cgIyB2aWV3XG4gICAga2V5ICAjIGtleSBjaGFyXG4gIF1cbiAgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnVGV4dEV2ZW50JylcbiAgZXZlbnQuaW5pdFRleHRFdmVudChcInRleHRJbnB1dFwiLCBldmVudEFyZ3MuLi4pXG4gIGV2ZW50XG5cbmlzUG9pbnQgPSAob2JqKSAtPlxuICBpZiBvYmogaW5zdGFuY2VvZiBQb2ludFxuICAgIHRydWVcbiAgZWxzZVxuICAgIG9iai5sZW5ndGggaXMgMiBhbmQgXy5pc051bWJlcihvYmpbMF0pIGFuZCBfLmlzTnVtYmVyKG9ialsxXSlcblxuaXNSYW5nZSA9IChvYmopIC0+XG4gIGlmIG9iaiBpbnN0YW5jZW9mIFJhbmdlXG4gICAgdHJ1ZVxuICBlbHNlXG4gICAgXy5hbGwoW1xuICAgICAgXy5pc0FycmF5KG9iaiksXG4gICAgICAob2JqLmxlbmd0aCBpcyAyKSxcbiAgICAgIGlzUG9pbnQob2JqWzBdKSxcbiAgICAgIGlzUG9pbnQob2JqWzFdKVxuICAgIF0pXG5cbnRvQXJyYXkgPSAob2JqLCBjb25kPW51bGwpIC0+XG4gIGlmIF8uaXNBcnJheShjb25kID8gb2JqKSB0aGVuIG9iaiBlbHNlIFtvYmpdXG5cbnRvQXJyYXlPZlBvaW50ID0gKG9iaikgLT5cbiAgaWYgXy5pc0FycmF5KG9iaikgYW5kIGlzUG9pbnQob2JqWzBdKVxuICAgIG9ialxuICBlbHNlXG4gICAgW29ial1cblxudG9BcnJheU9mUmFuZ2UgPSAob2JqKSAtPlxuICBpZiBfLmlzQXJyYXkob2JqKSBhbmQgXy5hbGwob2JqLm1hcCAoZSkgLT4gaXNSYW5nZShlKSlcbiAgICBvYmpcbiAgZWxzZVxuICAgIFtvYmpdXG5cbiMgTWFpblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5nZXRWaW1TdGF0ZSA9IChhcmdzLi4uKSAtPlxuICBbZWRpdG9yLCBmaWxlLCBjYWxsYmFja10gPSBbXVxuICBzd2l0Y2ggYXJncy5sZW5ndGhcbiAgICB3aGVuIDEgdGhlbiBbY2FsbGJhY2tdID0gYXJnc1xuICAgIHdoZW4gMiB0aGVuIFtmaWxlLCBjYWxsYmFja10gPSBhcmdzXG5cbiAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ3ZpbS1tb2RlLXBsdXMnKVxuXG4gIHdhaXRzRm9yUHJvbWlzZSAtPlxuICAgIGZpbGUgPSBhdG9tLnByb2plY3QucmVzb2x2ZVBhdGgoZmlsZSkgaWYgZmlsZVxuICAgIGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZSkudGhlbiAoZSkgLT4gZWRpdG9yID0gZVxuXG4gIHJ1bnMgLT5cbiAgICBtYWluID0gYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKCd2aW0tbW9kZS1wbHVzJykubWFpbk1vZHVsZVxuICAgIHZpbVN0YXRlID0gbWFpbi5nZXRFZGl0b3JTdGF0ZShlZGl0b3IpXG4gICAgY2FsbGJhY2sodmltU3RhdGUsIG5ldyBWaW1FZGl0b3IodmltU3RhdGUpKVxuXG5jbGFzcyBUZXh0RGF0YVxuICBjb25zdHJ1Y3RvcjogKEByYXdEYXRhKSAtPlxuICAgIEBsaW5lcyA9IEByYXdEYXRhLnNwbGl0KFwiXFxuXCIpXG5cbiAgZ2V0TGluZXM6IChsaW5lcywge2Nob21wfT17fSkgLT5cbiAgICBjaG9tcCA/PSBmYWxzZVxuICAgIHRleHQgPSAoQGxpbmVzW2xpbmVdIGZvciBsaW5lIGluIGxpbmVzKS5qb2luKFwiXFxuXCIpXG4gICAgaWYgY2hvbXBcbiAgICAgIHRleHRcbiAgICBlbHNlXG4gICAgICB0ZXh0ICsgXCJcXG5cIlxuXG4gIGdldExpbmU6IChsaW5lLCBvcHRpb25zKSAtPlxuICAgIEBnZXRMaW5lcyhbbGluZV0sIG9wdGlvbnMpXG5cbiAgZ2V0UmF3OiAtPlxuICAgIEByYXdEYXRhXG5cbmNvbGxlY3RJbmRleEluVGV4dCA9IChjaGFyLCB0ZXh0KSAtPlxuICBpbmRleGVzID0gW11cbiAgZnJvbUluZGV4ID0gMFxuICB3aGlsZSAoaW5kZXggPSB0ZXh0LmluZGV4T2YoY2hhciwgZnJvbUluZGV4KSkgPj0gMFxuICAgIGZyb21JbmRleCA9IGluZGV4ICsgMVxuICAgIGluZGV4ZXMucHVzaChpbmRleClcbiAgaW5kZXhlc1xuXG5jb2xsZWN0Q2hhclBvc2l0aW9uc0luVGV4dCA9IChjaGFyLCB0ZXh0KSAtPlxuICBwb3NpdGlvbnMgPSBbXVxuICBmb3IgbGluZVRleHQsIHJvd051bWJlciBpbiB0ZXh0LnNwbGl0KC9cXG4vKVxuICAgIGZvciBpbmRleCwgaSBpbiBjb2xsZWN0SW5kZXhJblRleHQoY2hhciwgbGluZVRleHQpXG4gICAgICBwb3NpdGlvbnMucHVzaChbcm93TnVtYmVyLCBpbmRleCAtIGldKVxuICBwb3NpdGlvbnNcblxuY2xhc3MgVmltRWRpdG9yXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudH0gPSBAdmltU3RhdGVcblxuICB2YWxpZGF0ZU9wdGlvbnM6IChvcHRpb25zLCB2YWxpZE9wdGlvbnMsIG1lc3NhZ2UpIC0+XG4gICAgaW52YWxpZE9wdGlvbnMgPSBfLndpdGhvdXQoXy5rZXlzKG9wdGlvbnMpLCB2YWxpZE9wdGlvbnMuLi4pXG4gICAgaWYgaW52YWxpZE9wdGlvbnMubGVuZ3RoXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCIje21lc3NhZ2V9OiAje2luc3BlY3QoaW52YWxpZE9wdGlvbnMpfVwiKVxuXG4gIHZhbGlkYXRlRXhjbHVzaXZlT3B0aW9uczogKG9wdGlvbnMsIHJ1bGVzKSAtPlxuICAgIGFsbE9wdGlvbnMgPSBPYmplY3Qua2V5cyhvcHRpb25zKVxuICAgIGZvciBvcHRpb24sIGV4Y2x1c2l2ZU9wdGlvbnMgb2YgcnVsZXMgd2hlbiBvcHRpb24gb2Ygb3B0aW9uc1xuICAgICAgdmlvbGF0aW5nT3B0aW9ucyA9IGV4Y2x1c2l2ZU9wdGlvbnMuZmlsdGVyIChleGNsdXNpdmVPcHRpb24pIC0+IGV4Y2x1c2l2ZU9wdGlvbiBpbiBhbGxPcHRpb25zXG4gICAgICBpZiB2aW9sYXRpbmdPcHRpb25zLmxlbmd0aFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIje29wdGlvbn0gaXMgZXhjbHVzaXZlIHdpdGggWyN7dmlvbGF0aW5nT3B0aW9uc31dXCIpXG5cbiAgc2V0T3B0aW9uc09yZGVyZWQgPSBbXG4gICAgJ3RleHQnLCAndGV4dF8nLFxuICAgICd0ZXh0QycsICd0ZXh0Q18nLFxuICAgICdncmFtbWFyJyxcbiAgICAnY3Vyc29yJywgJ2N1cnNvclNjcmVlbidcbiAgICAnYWRkQ3Vyc29yJywgJ2N1cnNvclNjcmVlbidcbiAgICAncmVnaXN0ZXInLFxuICAgICdzZWxlY3RlZEJ1ZmZlclJhbmdlJ1xuICBdXG5cbiAgc2V0RXhjbHVzaXZlUnVsZXMgPVxuICAgIHRleHRDOiBbJ2N1cnNvcicsICdjdXJzb3JTY3JlZW4nXVxuICAgIHRleHRDXzogWydjdXJzb3InLCAnY3Vyc29yU2NyZWVuJ11cblxuICAjIFB1YmxpY1xuICBzZXQ6IChvcHRpb25zKSA9PlxuICAgIEB2YWxpZGF0ZU9wdGlvbnMob3B0aW9ucywgc2V0T3B0aW9uc09yZGVyZWQsICdJbnZhbGlkIHNldCBvcHRpb25zJylcbiAgICBAdmFsaWRhdGVFeGNsdXNpdmVPcHRpb25zKG9wdGlvbnMsIHNldEV4Y2x1c2l2ZVJ1bGVzKVxuXG4gICAgZm9yIG5hbWUgaW4gc2V0T3B0aW9uc09yZGVyZWQgd2hlbiBvcHRpb25zW25hbWVdP1xuICAgICAgbWV0aG9kID0gJ3NldCcgKyBfLmNhcGl0YWxpemUoXy5jYW1lbGl6ZShuYW1lKSlcbiAgICAgIHRoaXNbbWV0aG9kXShvcHRpb25zW25hbWVdKVxuXG4gIHNldFRleHQ6ICh0ZXh0KSAtPlxuICAgIEBlZGl0b3Iuc2V0VGV4dCh0ZXh0KVxuXG4gIHNldFRleHRfOiAodGV4dCkgLT5cbiAgICBAc2V0VGV4dCh0ZXh0LnJlcGxhY2UoL18vZywgJyAnKSlcblxuICBzZXRUZXh0QzogKHRleHQpIC0+XG4gICAgY3Vyc29ycyA9IGNvbGxlY3RDaGFyUG9zaXRpb25zSW5UZXh0KCd8JywgdGV4dC5yZXBsYWNlKC8hL2csICcnKSlcbiAgICBsYXN0Q3Vyc29yID0gY29sbGVjdENoYXJQb3NpdGlvbnNJblRleHQoJyEnLCB0ZXh0LnJlcGxhY2UoL1xcfC9nLCAnJykpXG4gICAgQHNldFRleHQodGV4dC5yZXBsYWNlKC9bXFx8IV0vZywgJycpKVxuICAgIGN1cnNvcnMgPSBjdXJzb3JzLmNvbmNhdChsYXN0Q3Vyc29yKVxuICAgIGlmIGN1cnNvcnMubGVuZ3RoXG4gICAgICBAc2V0Q3Vyc29yKGN1cnNvcnMpXG5cbiAgc2V0VGV4dENfOiAodGV4dCkgLT5cbiAgICBAc2V0VGV4dEModGV4dC5yZXBsYWNlKC9fL2csICcgJykpXG5cbiAgc2V0R3JhbW1hcjogKHNjb3BlKSAtPlxuICAgIEBlZGl0b3Iuc2V0R3JhbW1hcihhdG9tLmdyYW1tYXJzLmdyYW1tYXJGb3JTY29wZU5hbWUoc2NvcGUpKVxuXG4gIHNldEN1cnNvcjogKHBvaW50cykgLT5cbiAgICBwb2ludHMgPSB0b0FycmF5T2ZQb2ludChwb2ludHMpXG4gICAgQGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihwb2ludHMuc2hpZnQoKSlcbiAgICBmb3IgcG9pbnQgaW4gcG9pbnRzXG4gICAgICBAZWRpdG9yLmFkZEN1cnNvckF0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiAgc2V0Q3Vyc29yU2NyZWVuOiAocG9pbnRzKSAtPlxuICAgIHBvaW50cyA9IHRvQXJyYXlPZlBvaW50KHBvaW50cylcbiAgICBAZWRpdG9yLnNldEN1cnNvclNjcmVlblBvc2l0aW9uKHBvaW50cy5zaGlmdCgpKVxuICAgIGZvciBwb2ludCBpbiBwb2ludHNcbiAgICAgIEBlZGl0b3IuYWRkQ3Vyc29yQXRTY3JlZW5Qb3NpdGlvbihwb2ludClcblxuICBzZXRBZGRDdXJzb3I6IChwb2ludHMpIC0+XG4gICAgZm9yIHBvaW50IGluIHRvQXJyYXlPZlBvaW50KHBvaW50cylcbiAgICAgIEBlZGl0b3IuYWRkQ3Vyc29yQXRCdWZmZXJQb3NpdGlvbihwb2ludClcblxuICBzZXRSZWdpc3RlcjogKHJlZ2lzdGVyKSAtPlxuICAgIGZvciBuYW1lLCB2YWx1ZSBvZiByZWdpc3RlclxuICAgICAgQHZpbVN0YXRlLnJlZ2lzdGVyLnNldChuYW1lLCB2YWx1ZSlcblxuICBzZXRTZWxlY3RlZEJ1ZmZlclJhbmdlOiAocmFuZ2UpIC0+XG4gICAgQGVkaXRvci5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKHJhbmdlKVxuXG4gIGVuc3VyZU9wdGlvbnNPcmRlcmVkID0gW1xuICAgICd0ZXh0JywgJ3RleHRfJyxcbiAgICAndGV4dEMnLCAndGV4dENfJyxcbiAgICAnc2VsZWN0ZWRUZXh0JywgJ3NlbGVjdGVkVGV4dF8nLCAnc2VsZWN0ZWRUZXh0T3JkZXJlZCcsIFwic2VsZWN0aW9uSXNOYXJyb3dlZFwiXG4gICAgJ2N1cnNvcicsICdjdXJzb3JTY3JlZW4nXG4gICAgJ251bUN1cnNvcnMnXG4gICAgJ3JlZ2lzdGVyJyxcbiAgICAnc2VsZWN0ZWRTY3JlZW5SYW5nZScsICdzZWxlY3RlZFNjcmVlblJhbmdlT3JkZXJlZCdcbiAgICAnc2VsZWN0ZWRCdWZmZXJSYW5nZScsICdzZWxlY3RlZEJ1ZmZlclJhbmdlT3JkZXJlZCdcbiAgICAnc2VsZWN0aW9uSXNSZXZlcnNlZCcsXG4gICAgJ3BlcnNpc3RlbnRTZWxlY3Rpb25CdWZmZXJSYW5nZScsICdwZXJzaXN0ZW50U2VsZWN0aW9uQ291bnQnXG4gICAgJ29jY3VycmVuY2VDb3VudCcsICdvY2N1cnJlbmNlVGV4dCdcbiAgICAncHJvcGVydHlIZWFkJ1xuICAgICdwcm9wZXJ0eVRhaWwnXG4gICAgJ3Njcm9sbFRvcCcsXG4gICAgJ21hcmsnXG4gICAgJ21vZGUnLFxuICBdXG4gIGVuc3VyZUV4Y2x1c2l2ZVJ1bGVzID1cbiAgICB0ZXh0QzogWydjdXJzb3InLCAnY3Vyc29yU2NyZWVuJ11cbiAgICB0ZXh0Q186IFsnY3Vyc29yJywgJ2N1cnNvclNjcmVlbiddXG5cbiAgZ2V0QW5kRGVsZXRlS2V5c3Ryb2tlT3B0aW9uczogKG9wdGlvbnMpIC0+XG4gICAge3BhcnRpYWxNYXRjaFRpbWVvdXR9ID0gb3B0aW9uc1xuICAgIGRlbGV0ZSBvcHRpb25zLnBhcnRpYWxNYXRjaFRpbWVvdXRcbiAgICB7cGFydGlhbE1hdGNoVGltZW91dH1cblxuICAjIFB1YmxpY1xuICBlbnN1cmU6IChhcmdzLi4uKSA9PlxuICAgIHN3aXRjaCBhcmdzLmxlbmd0aFxuICAgICAgd2hlbiAxIHRoZW4gW29wdGlvbnNdID0gYXJnc1xuICAgICAgd2hlbiAyIHRoZW4gW2tleXN0cm9rZSwgb3B0aW9uc10gPSBhcmdzXG5cbiAgICB1bmxlc3MgdHlwZW9mKG9wdGlvbnMpIGlzICdvYmplY3QnXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIG9wdGlvbnMgZm9yICdlbnN1cmUnOiBtdXN0IGJlICdvYmplY3QnIGJ1dCBnb3QgJyN7dHlwZW9mKG9wdGlvbnMpfSdcIilcbiAgICBpZiBrZXlzdHJva2U/IGFuZCBub3QgKHR5cGVvZihrZXlzdHJva2UpIGlzICdzdHJpbmcnIG9yIEFycmF5LmlzQXJyYXkoa2V5c3Ryb2tlKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQga2V5c3Ryb2tlIGZvciAnZW5zdXJlJzogbXVzdCBiZSAnc3RyaW5nJyBvciAnYXJyYXknIGJ1dCBnb3QgJyN7dHlwZW9mKGtleXN0cm9rZSl9J1wiKVxuXG4gICAga2V5c3Ryb2tlT3B0aW9ucyA9IEBnZXRBbmREZWxldGVLZXlzdHJva2VPcHRpb25zKG9wdGlvbnMpXG5cbiAgICBAdmFsaWRhdGVPcHRpb25zKG9wdGlvbnMsIGVuc3VyZU9wdGlvbnNPcmRlcmVkLCAnSW52YWxpZCBlbnN1cmUgb3B0aW9uJylcbiAgICBAdmFsaWRhdGVFeGNsdXNpdmVPcHRpb25zKG9wdGlvbnMsIGVuc3VyZUV4Y2x1c2l2ZVJ1bGVzKVxuXG4gICAgIyBJbnB1dFxuICAgIHVubGVzcyBfLmlzRW1wdHkoa2V5c3Ryb2tlKVxuICAgICAgQGtleXN0cm9rZShrZXlzdHJva2UsIGtleXN0cm9rZU9wdGlvbnMpXG5cbiAgICBmb3IgbmFtZSBpbiBlbnN1cmVPcHRpb25zT3JkZXJlZCB3aGVuIG9wdGlvbnNbbmFtZV0/XG4gICAgICBtZXRob2QgPSAnZW5zdXJlJyArIF8uY2FwaXRhbGl6ZShfLmNhbWVsaXplKG5hbWUpKVxuICAgICAgdGhpc1ttZXRob2RdKG9wdGlvbnNbbmFtZV0pXG5cbiAgYmluZEVuc3VyZU9wdGlvbjogKG9wdGlvbnNCYXNlKSA9PlxuICAgIChrZXlzdHJva2UsIG9wdGlvbnMpID0+XG4gICAgICBpbnRlcnNlY3RpbmdPcHRpb25zID0gXy5pbnRlcnNlY3Rpb24oXy5rZXlzKG9wdGlvbnMpLCBfLmtleXMob3B0aW9uc0Jhc2UpKVxuICAgICAgaWYgaW50ZXJzZWN0aW5nT3B0aW9ucy5sZW5ndGhcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY29uZmxpY3Qgd2l0aCBib3VuZCBvcHRpb25zICN7aW5zcGVjdChpbnRlcnNlY3RpbmdPcHRpb25zKX1cIilcblxuICAgICAgQGVuc3VyZShrZXlzdHJva2UsIF8uZGVmYXVsdHMoXy5jbG9uZShvcHRpb25zKSwgb3B0aW9uc0Jhc2UpKVxuXG4gIGVuc3VyZUJ5RGlzcGF0Y2g6IChjb21tYW5kLCBvcHRpb25zKSA9PlxuICAgIGRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhAZWRpdG9yKSwgY29tbWFuZClcbiAgICBmb3IgbmFtZSBpbiBlbnN1cmVPcHRpb25zT3JkZXJlZCB3aGVuIG9wdGlvbnNbbmFtZV0/XG4gICAgICBtZXRob2QgPSAnZW5zdXJlJyArIF8uY2FwaXRhbGl6ZShfLmNhbWVsaXplKG5hbWUpKVxuICAgICAgdGhpc1ttZXRob2RdKG9wdGlvbnNbbmFtZV0pXG5cbiAgZW5zdXJlVGV4dDogKHRleHQpIC0+XG4gICAgZXhwZWN0KEBlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKHRleHQpXG5cbiAgZW5zdXJlVGV4dF86ICh0ZXh0KSAtPlxuICAgIEBlbnN1cmVUZXh0KHRleHQucmVwbGFjZSgvXy9nLCAnICcpKVxuXG4gIGVuc3VyZVRleHRDOiAodGV4dCkgLT5cbiAgICBjdXJzb3JzID0gY29sbGVjdENoYXJQb3NpdGlvbnNJblRleHQoJ3wnLCB0ZXh0LnJlcGxhY2UoLyEvZywgJycpKVxuICAgIGxhc3RDdXJzb3IgPSBjb2xsZWN0Q2hhclBvc2l0aW9uc0luVGV4dCgnIScsIHRleHQucmVwbGFjZSgvXFx8L2csICcnKSlcbiAgICBjdXJzb3JzID0gY3Vyc29ycy5jb25jYXQobGFzdEN1cnNvcilcbiAgICBjdXJzb3JzID0gY3Vyc29yc1xuICAgICAgLm1hcCAocG9pbnQpIC0+IFBvaW50LmZyb21PYmplY3QocG9pbnQpXG4gICAgICAuc29ydCAoYSwgYikgLT4gYS5jb21wYXJlKGIpXG4gICAgQGVuc3VyZVRleHQodGV4dC5yZXBsYWNlKC9bXFx8IV0vZywgJycpKVxuICAgIGlmIGN1cnNvcnMubGVuZ3RoXG4gICAgICBAZW5zdXJlQ3Vyc29yKGN1cnNvcnMsIHRydWUpXG5cbiAgICBpZiBsYXN0Q3Vyc29yLmxlbmd0aFxuICAgICAgZXhwZWN0KEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbChsYXN0Q3Vyc29yWzBdKVxuXG4gIGVuc3VyZVRleHRDXzogKHRleHQpIC0+XG4gICAgQGVuc3VyZVRleHRDKHRleHQucmVwbGFjZSgvXy9nLCAnICcpKVxuXG4gIGVuc3VyZVNlbGVjdGVkVGV4dDogKHRleHQsIG9yZGVyZWQ9ZmFsc2UpIC0+XG4gICAgc2VsZWN0aW9ucyA9IGlmIG9yZGVyZWRcbiAgICAgIEBlZGl0b3IuZ2V0U2VsZWN0aW9uc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uKClcbiAgICBlbHNlXG4gICAgICBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgIGFjdHVhbCA9IChzLmdldFRleHQoKSBmb3IgcyBpbiBzZWxlY3Rpb25zKVxuICAgIGV4cGVjdChhY3R1YWwpLnRvRXF1YWwodG9BcnJheSh0ZXh0KSlcblxuICBlbnN1cmVTZWxlY3RlZFRleHRfOiAodGV4dCwgb3JkZXJlZCkgLT5cbiAgICBAZW5zdXJlU2VsZWN0ZWRUZXh0KHRleHQucmVwbGFjZSgvXy9nLCAnICcpLCBvcmRlcmVkKVxuXG4gIGVuc3VyZVNlbGVjdGlvbklzTmFycm93ZWQ6IChpc05hcnJvd2VkKSAtPlxuICAgIGFjdHVhbCA9IEB2aW1TdGF0ZS5tb2RlTWFuYWdlci5pc05hcnJvd2VkKClcbiAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsKGlzTmFycm93ZWQpXG5cbiAgZW5zdXJlU2VsZWN0ZWRUZXh0T3JkZXJlZDogKHRleHQpIC0+XG4gICAgQGVuc3VyZVNlbGVjdGVkVGV4dCh0ZXh0LCB0cnVlKVxuXG4gIGVuc3VyZUN1cnNvcjogKHBvaW50cywgb3JkZXJlZD1mYWxzZSkgLT5cbiAgICBhY3R1YWwgPSBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9ucygpXG4gICAgYWN0dWFsID0gYWN0dWFsLnNvcnQgKGEsIGIpIC0+IGEuY29tcGFyZShiKSBpZiBvcmRlcmVkXG4gICAgZXhwZWN0KGFjdHVhbCkudG9FcXVhbCh0b0FycmF5T2ZQb2ludChwb2ludHMpKVxuXG4gIGVuc3VyZUN1cnNvclNjcmVlbjogKHBvaW50cykgLT5cbiAgICBhY3R1YWwgPSBAZWRpdG9yLmdldEN1cnNvclNjcmVlblBvc2l0aW9ucygpXG4gICAgZXhwZWN0KGFjdHVhbCkudG9FcXVhbCh0b0FycmF5T2ZQb2ludChwb2ludHMpKVxuXG4gIGVuc3VyZVJlZ2lzdGVyOiAocmVnaXN0ZXIpIC0+XG4gICAgZm9yIG5hbWUsIGVuc3VyZSBvZiByZWdpc3RlclxuICAgICAge3NlbGVjdGlvbn0gPSBlbnN1cmVcbiAgICAgIGRlbGV0ZSBlbnN1cmUuc2VsZWN0aW9uXG4gICAgICByZWcgPSBAdmltU3RhdGUucmVnaXN0ZXIuZ2V0KG5hbWUsIHNlbGVjdGlvbilcbiAgICAgIGZvciBwcm9wZXJ0eSwgX3ZhbHVlIG9mIGVuc3VyZVxuICAgICAgICBleHBlY3QocmVnW3Byb3BlcnR5XSkudG9FcXVhbChfdmFsdWUpXG5cbiAgZW5zdXJlTnVtQ3Vyc29yczogKG51bWJlcikgLT5cbiAgICBleHBlY3QoQGVkaXRvci5nZXRDdXJzb3JzKCkpLnRvSGF2ZUxlbmd0aCBudW1iZXJcblxuICBfZW5zdXJlU2VsZWN0ZWRSYW5nZUJ5OiAocmFuZ2UsIG9yZGVyZWQ9ZmFsc2UsIGZuKSAtPlxuICAgIHNlbGVjdGlvbnMgPSBpZiBvcmRlcmVkXG4gICAgICBAZWRpdG9yLmdldFNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbigpXG4gICAgZWxzZVxuICAgICAgQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICBhY3R1YWwgPSAoZm4ocykgZm9yIHMgaW4gc2VsZWN0aW9ucylcbiAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsKHRvQXJyYXlPZlJhbmdlKHJhbmdlKSlcblxuICBlbnN1cmVTZWxlY3RlZFNjcmVlblJhbmdlOiAocmFuZ2UsIG9yZGVyZWQ9ZmFsc2UpIC0+XG4gICAgQF9lbnN1cmVTZWxlY3RlZFJhbmdlQnkgcmFuZ2UsIG9yZGVyZWQsIChzKSAtPiBzLmdldFNjcmVlblJhbmdlKClcblxuICBlbnN1cmVTZWxlY3RlZFNjcmVlblJhbmdlT3JkZXJlZDogKHJhbmdlKSAtPlxuICAgIEBlbnN1cmVTZWxlY3RlZFNjcmVlblJhbmdlKHJhbmdlLCB0cnVlKVxuXG4gIGVuc3VyZVNlbGVjdGVkQnVmZmVyUmFuZ2U6IChyYW5nZSwgb3JkZXJlZD1mYWxzZSkgLT5cbiAgICBAX2Vuc3VyZVNlbGVjdGVkUmFuZ2VCeSByYW5nZSwgb3JkZXJlZCwgKHMpIC0+IHMuZ2V0QnVmZmVyUmFuZ2UoKVxuXG4gIGVuc3VyZVNlbGVjdGVkQnVmZmVyUmFuZ2VPcmRlcmVkOiAocmFuZ2UpIC0+XG4gICAgQGVuc3VyZVNlbGVjdGVkQnVmZmVyUmFuZ2UocmFuZ2UsIHRydWUpXG5cbiAgZW5zdXJlU2VsZWN0aW9uSXNSZXZlcnNlZDogKHJldmVyc2VkKSAtPlxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIGFjdHVhbCA9IHNlbGVjdGlvbi5pc1JldmVyc2VkKClcbiAgICAgIGV4cGVjdChhY3R1YWwpLnRvQmUocmV2ZXJzZWQpXG5cbiAgZW5zdXJlUGVyc2lzdGVudFNlbGVjdGlvbkJ1ZmZlclJhbmdlOiAocmFuZ2UpIC0+XG4gICAgYWN0dWFsID0gQHZpbVN0YXRlLnBlcnNpc3RlbnRTZWxlY3Rpb24uZ2V0TWFya2VyQnVmZmVyUmFuZ2VzKClcbiAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsKHRvQXJyYXlPZlJhbmdlKHJhbmdlKSlcblxuICBlbnN1cmVQZXJzaXN0ZW50U2VsZWN0aW9uQ291bnQ6IChudW1iZXIpIC0+XG4gICAgYWN0dWFsID0gQHZpbVN0YXRlLnBlcnNpc3RlbnRTZWxlY3Rpb24uZ2V0TWFya2VyQ291bnQoKVxuICAgIGV4cGVjdChhY3R1YWwpLnRvQmUgbnVtYmVyXG5cbiAgZW5zdXJlT2NjdXJyZW5jZUNvdW50OiAobnVtYmVyKSAtPlxuICAgIGFjdHVhbCA9IEB2aW1TdGF0ZS5vY2N1cnJlbmNlTWFuYWdlci5nZXRNYXJrZXJDb3VudCgpXG4gICAgZXhwZWN0KGFjdHVhbCkudG9CZSBudW1iZXJcblxuICBlbnN1cmVPY2N1cnJlbmNlVGV4dDogKHRleHQpIC0+XG4gICAgbWFya2VycyA9IEB2aW1TdGF0ZS5vY2N1cnJlbmNlTWFuYWdlci5nZXRNYXJrZXJzKClcbiAgICByYW5nZXMgPSAoci5nZXRCdWZmZXJSYW5nZSgpIGZvciByIGluIG1hcmtlcnMpXG4gICAgYWN0dWFsID0gKEBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocikgZm9yIHIgaW4gcmFuZ2VzKVxuICAgIGV4cGVjdChhY3R1YWwpLnRvRXF1YWwodG9BcnJheSh0ZXh0KSlcblxuICBlbnN1cmVQcm9wZXJ0eUhlYWQ6IChwb2ludHMpIC0+XG4gICAgZ2V0SGVhZFByb3BlcnR5ID0gKHNlbGVjdGlvbikgPT5cbiAgICAgIEB2aW1TdGF0ZS5zd3JhcChzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdoZWFkJywgZnJvbTogWydwcm9wZXJ0eSddKVxuICAgIGFjdHVhbCA9IChnZXRIZWFkUHJvcGVydHkocykgZm9yIHMgaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkpXG4gICAgZXhwZWN0KGFjdHVhbCkudG9FcXVhbCh0b0FycmF5T2ZQb2ludChwb2ludHMpKVxuXG4gIGVuc3VyZVByb3BlcnR5VGFpbDogKHBvaW50cykgLT5cbiAgICBnZXRUYWlsUHJvcGVydHkgPSAoc2VsZWN0aW9uKSA9PlxuICAgICAgQHZpbVN0YXRlLnN3cmFwKHNlbGVjdGlvbikuZ2V0QnVmZmVyUG9zaXRpb25Gb3IoJ3RhaWwnLCBmcm9tOiBbJ3Byb3BlcnR5J10pXG4gICAgYWN0dWFsID0gKGdldFRhaWxQcm9wZXJ0eShzKSBmb3IgcyBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKSlcbiAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsKHRvQXJyYXlPZlBvaW50KHBvaW50cykpXG5cbiAgZW5zdXJlU2Nyb2xsVG9wOiAoc2Nyb2xsVG9wKSAtPlxuICAgIGFjdHVhbCA9IEBlZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcCgpXG4gICAgZXhwZWN0KGFjdHVhbCkudG9FcXVhbCBzY3JvbGxUb3BcblxuICBlbnN1cmVNYXJrOiAobWFyaykgLT5cbiAgICBmb3IgbmFtZSwgcG9pbnQgb2YgbWFya1xuICAgICAgYWN0dWFsID0gQHZpbVN0YXRlLm1hcmsuZ2V0KG5hbWUpXG4gICAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsKHBvaW50KVxuXG4gIGVuc3VyZU1vZGU6IChtb2RlKSAtPlxuICAgIG1vZGUgPSB0b0FycmF5KG1vZGUpLnNsaWNlKClcbiAgICBleHBlY3QoQHZpbVN0YXRlLmlzTW9kZShtb2RlLi4uKSkudG9CZSh0cnVlKVxuXG4gICAgbW9kZVswXSA9IFwiI3ttb2RlWzBdfS1tb2RlXCJcbiAgICBtb2RlID0gbW9kZS5maWx0ZXIoKG0pIC0+IG0pXG4gICAgZXhwZWN0KEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygndmltLW1vZGUtcGx1cycpKS50b0JlKHRydWUpXG4gICAgZm9yIG0gaW4gbW9kZVxuICAgICAgZXhwZWN0KEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhtKSkudG9CZSh0cnVlKVxuICAgIHNob3VsZE5vdENvbnRhaW5DbGFzc2VzID0gXy5kaWZmZXJlbmNlKHN1cHBvcnRlZE1vZGVDbGFzcywgbW9kZSlcbiAgICBmb3IgbSBpbiBzaG91bGROb3RDb250YWluQ2xhc3Nlc1xuICAgICAgZXhwZWN0KEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhtKSkudG9CZShmYWxzZSlcblxuICAjIFB1YmxpY1xuICAjIG9wdGlvbnNcbiAgIyAtIHdhaXRzRm9yRmluaXNoXG4gIGtleXN0cm9rZTogKGtleXMsIG9wdGlvbnM9e30pID0+XG4gICAgaWYgb3B0aW9ucy53YWl0c0ZvckZpbmlzaFxuICAgICAgZmluaXNoZWQgPSBmYWxzZVxuICAgICAgQHZpbVN0YXRlLm9uRGlkRmluaXNoT3BlcmF0aW9uIC0+IGZpbmlzaGVkID0gdHJ1ZVxuICAgICAgZGVsZXRlIG9wdGlvbnMud2FpdHNGb3JGaW5pc2hcbiAgICAgIEBrZXlzdHJva2Uoa2V5cywgb3B0aW9ucylcbiAgICAgIHdhaXRzRm9yIC0+IGZpbmlzaGVkXG4gICAgICByZXR1cm5cblxuICAgIHRhcmdldCA9IEBlZGl0b3JFbGVtZW50XG5cbiAgICBmb3Iga2V5IGluIGtleXMuc3BsaXQoL1xccysvKVxuICAgICAgIyBbRklYTUVdIFdoeSBjYW4ndCBJIGxldCBhdG9tLmtleW1hcHMgaGFuZGxlIGVudGVyL2VzY2FwZSBieSBidWlsZEV2ZW50IGFuZCBoYW5kbGVLZXlib2FyZEV2ZW50XG4gICAgICBpZiBAdmltU3RhdGUuX19zZWFyY2hJbnB1dD8uaGFzRm9jdXMoKSAjIHRvIGF2b2lkIGF1dG8gcG9wdWxhdGVcbiAgICAgICAgdGFyZ2V0ID0gQHZpbVN0YXRlLnNlYXJjaElucHV0LmVkaXRvckVsZW1lbnRcbiAgICAgICAgc3dpdGNoIGtleVxuICAgICAgICAgIHdoZW4gXCJlbnRlclwiIHRoZW4gYXRvbS5jb21tYW5kcy5kaXNwYXRjaCh0YXJnZXQsICdjb3JlOmNvbmZpcm0nKVxuICAgICAgICAgIHdoZW4gXCJlc2NhcGVcIiB0aGVuIGF0b20uY29tbWFuZHMuZGlzcGF0Y2godGFyZ2V0LCAnY29yZTpjYW5jZWwnKVxuICAgICAgICAgIGVsc2UgQHZpbVN0YXRlLnNlYXJjaElucHV0LmVkaXRvci5pbnNlcnRUZXh0KGtleSlcblxuICAgICAgZWxzZSBpZiBAdmltU3RhdGUuaW5wdXRFZGl0b3I/XG4gICAgICAgIHRhcmdldCA9IEB2aW1TdGF0ZS5pbnB1dEVkaXRvci5lbGVtZW50XG4gICAgICAgIHN3aXRjaCBrZXlcbiAgICAgICAgICB3aGVuIFwiZW50ZXJcIiB0aGVuIGF0b20uY29tbWFuZHMuZGlzcGF0Y2godGFyZ2V0LCAnY29yZTpjb25maXJtJylcbiAgICAgICAgICB3aGVuIFwiZXNjYXBlXCIgdGhlbiBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHRhcmdldCwgJ2NvcmU6Y2FuY2VsJylcbiAgICAgICAgICBlbHNlIEB2aW1TdGF0ZS5pbnB1dEVkaXRvci5pbnNlcnRUZXh0KGtleSlcblxuICAgICAgZWxzZVxuICAgICAgICBldmVudCA9IGJ1aWxkS2V5ZG93bkV2ZW50RnJvbUtleXN0cm9rZShub3JtYWxpemVLZXlzdHJva2VzKGtleSksIHRhcmdldClcbiAgICAgICAgYXRvbS5rZXltYXBzLmhhbmRsZUtleWJvYXJkRXZlbnQoZXZlbnQpXG5cbiAgICBpZiBvcHRpb25zLnBhcnRpYWxNYXRjaFRpbWVvdXRcbiAgICAgIGFkdmFuY2VDbG9jayhhdG9tLmtleW1hcHMuZ2V0UGFydGlhbE1hdGNoVGltZW91dCgpKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtnZXRWaW1TdGF0ZSwgZ2V0VmlldywgZGlzcGF0Y2gsIFRleHREYXRhLCB3aXRoTW9ja1BsYXRmb3JtfVxuIl19
