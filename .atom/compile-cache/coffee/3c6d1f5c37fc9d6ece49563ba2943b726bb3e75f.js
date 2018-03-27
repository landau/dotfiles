(function() {
  var Disposable, KeymapManager, Point, Range, TextData, VimEditor, _, buildKeydownEvent, buildKeydownEventFromKeystroke, buildTextInputEvent, collectCharPositionsInText, collectIndexInText, dispatch, getView, getVimState, globalState, inspect, isPoint, isRange, normalizeKeystrokes, rawKeystroke, ref, semver, supportedModeClass, toArray, toArrayOfPoint, toArrayOfRange, withMockPlatform,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    slice = [].slice,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  semver = require('semver');

  ref = require('atom'), Range = ref.Range, Point = ref.Point, Disposable = ref.Disposable;

  inspect = require('util').inspect;

  globalState = require('../lib/global-state');

  KeymapManager = atom.keymaps.constructor;

  normalizeKeystrokes = require(atom.config.resourcePath + "/node_modules/atom-keymap/lib/helpers").normalizeKeystrokes;

  supportedModeClass = ['normal-mode', 'visual-mode', 'insert-mode', 'replace', 'linewise', 'blockwise', 'characterwise'];

  beforeEach(function() {
    return globalState.reset();
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

  rawKeystroke = function(keystrokes, target) {
    var event, j, key, len, ref1, results;
    ref1 = normalizeKeystrokes(keystrokes).split(/\s+/);
    results = [];
    for (j = 0, len = ref1.length; j < len; j++) {
      key = ref1[j];
      event = buildKeydownEventFromKeystroke(key, target);
      results.push(atom.keymaps.handleKeyboardEvent(event));
    }
    return results;
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
    var i, index, j, l, len, len1, lineText, positions, ref1, ref2, rowNumber;
    positions = [];
    ref1 = text.split(/\n/);
    for (rowNumber = j = 0, len = ref1.length; j < len; rowNumber = ++j) {
      lineText = ref1[rowNumber];
      ref2 = collectIndexInText(char, lineText);
      for (i = l = 0, len1 = ref2.length; l < len1; i = ++l) {
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
      var j, l, len, len1, m, ref1, results, shouldNotContainClasses;
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
      for (l = 0, len1 = shouldNotContainClasses.length; l < len1; l++) {
        m = shouldNotContainClasses[l];
        results.push(expect(this.editorElement.classList.contains(m)).toBe(false));
      }
      return results;
    };

    VimEditor.prototype.keystroke = function(keys, options) {
      var _key, finished, j, k, l, len, len1, ref1, ref2, target;
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
      ref1 = toArray(keys);
      for (j = 0, len = ref1.length; j < len; j++) {
        k = ref1[j];
        if (_.isString(k)) {
          rawKeystroke(k, target);
        } else {
          switch (false) {
            case k.input == null:
              ref2 = k.input.split('');
              for (l = 0, len1 = ref2.length; l < len1; l++) {
                _key = ref2[l];
                rawKeystroke(_key, target);
              }
              break;
            case k.search == null:
              if (k.search) {
                this.vimState.searchInput.editor.insertText(k.search);
              }
              atom.commands.dispatch(this.vimState.searchInput.editorElement, 'core:confirm');
              break;
            default:
              rawKeystroke(k, target);
          }
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
    withMockPlatform: withMockPlatform,
    rawKeystroke: rawKeystroke
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9zcGVjL3NwZWMtaGVscGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsOFhBQUE7SUFBQTs7OztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSOztFQUNULE1BQTZCLE9BQUEsQ0FBUSxNQUFSLENBQTdCLEVBQUMsaUJBQUQsRUFBUSxpQkFBUixFQUFlOztFQUNkLFVBQVcsT0FBQSxDQUFRLE1BQVI7O0VBQ1osV0FBQSxHQUFjLE9BQUEsQ0FBUSxxQkFBUjs7RUFFZCxhQUFBLEdBQWdCLElBQUksQ0FBQyxPQUFPLENBQUM7O0VBQzVCLHNCQUF1QixPQUFBLENBQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFaLEdBQTJCLHVDQUFuQzs7RUFFeEIsa0JBQUEsR0FBcUIsQ0FDbkIsYUFEbUIsRUFFbkIsYUFGbUIsRUFHbkIsYUFIbUIsRUFJbkIsU0FKbUIsRUFLbkIsVUFMbUIsRUFNbkIsV0FObUIsRUFPbkIsZUFQbUI7O0VBWXJCLFVBQUEsQ0FBVyxTQUFBO1dBQ1QsV0FBVyxDQUFDLEtBQVosQ0FBQTtFQURTLENBQVg7O0VBS0EsT0FBQSxHQUFVLFNBQUMsS0FBRDtXQUNSLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixLQUFuQjtFQURROztFQUdWLFFBQUEsR0FBVyxTQUFDLE1BQUQsRUFBUyxPQUFUO1dBQ1QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFkLENBQXVCLE1BQXZCLEVBQStCLE9BQS9CO0VBRFM7O0VBR1gsZ0JBQUEsR0FBbUIsU0FBQyxNQUFELEVBQVMsUUFBVCxFQUFtQixFQUFuQjtBQUNqQixRQUFBO0lBQUEsT0FBQSxHQUFVLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCO0lBQ1YsT0FBTyxDQUFDLFNB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QUFkO0lBQXVCLFVBQUEsUUFBdkI7SUFBaUMsVUFBQSxRQUFqQztJQUEyQyxrQkFBQSxnQkFBM0M7SUFBNkQsY0FBQSxZQUE3RDs7QUE3ZGpCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbnNlbXZlciA9IHJlcXVpcmUgJ3NlbXZlcidcbntSYW5nZSwgUG9pbnQsIERpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbntpbnNwZWN0fSA9IHJlcXVpcmUgJ3V0aWwnXG5nbG9iYWxTdGF0ZSA9IHJlcXVpcmUgJy4uL2xpYi9nbG9iYWwtc3RhdGUnXG5cbktleW1hcE1hbmFnZXIgPSBhdG9tLmtleW1hcHMuY29uc3RydWN0b3Jcbntub3JtYWxpemVLZXlzdHJva2VzfSA9IHJlcXVpcmUoYXRvbS5jb25maWcucmVzb3VyY2VQYXRoICsgXCIvbm9kZV9tb2R1bGVzL2F0b20ta2V5bWFwL2xpYi9oZWxwZXJzXCIpXG5cbnN1cHBvcnRlZE1vZGVDbGFzcyA9IFtcbiAgJ25vcm1hbC1tb2RlJ1xuICAndmlzdWFsLW1vZGUnXG4gICdpbnNlcnQtbW9kZSdcbiAgJ3JlcGxhY2UnXG4gICdsaW5ld2lzZSdcbiAgJ2Jsb2Nrd2lzZSdcbiAgJ2NoYXJhY3Rlcndpc2UnXG5dXG5cbiMgSW5pdCBzcGVjIHN0YXRlXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmJlZm9yZUVhY2ggLT5cbiAgZ2xvYmFsU3RhdGUucmVzZXQoKVxuXG4jIFV0aWxzXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmdldFZpZXcgPSAobW9kZWwpIC0+XG4gIGF0b20udmlld3MuZ2V0Vmlldyhtb2RlbClcblxuZGlzcGF0Y2ggPSAodGFyZ2V0LCBjb21tYW5kKSAtPlxuICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHRhcmdldCwgY29tbWFuZClcblxud2l0aE1vY2tQbGF0Zm9ybSA9ICh0YXJnZXQsIHBsYXRmb3JtLCBmbikgLT5cbiAgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIHdyYXBwZXIuY2xhc3NOYW1lID0gcGxhdGZvcm1cbiAgd3JhcHBlci5hcHBlbmRDaGlsZCh0YXJnZXQpXG4gIGZuKClcbiAgdGFyZ2V0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGFyZ2V0KVxuXG5idWlsZEtleWRvd25FdmVudCA9IChrZXksIG9wdGlvbnMpIC0+XG4gIEtleW1hcE1hbmFnZXIuYnVpbGRLZXlkb3duRXZlbnQoa2V5LCBvcHRpb25zKVxuXG5idWlsZEtleWRvd25FdmVudEZyb21LZXlzdHJva2UgPSAoa2V5c3Ryb2tlLCB0YXJnZXQpIC0+XG4gIG1vZGlmaWVyID0gWydjdHJsJywgJ2FsdCcsICdzaGlmdCcsICdjbWQnXVxuICBwYXJ0cyA9IGlmIGtleXN0cm9rZSBpcyAnLSdcbiAgICBbJy0nXVxuICBlbHNlXG4gICAga2V5c3Ryb2tlLnNwbGl0KCctJylcblxuICBvcHRpb25zID0ge3RhcmdldH1cbiAga2V5ID0gbnVsbFxuICBmb3IgcGFydCBpbiBwYXJ0c1xuICAgIGlmIHBhcnQgaW4gbW9kaWZpZXJcbiAgICAgIG9wdGlvbnNbcGFydF0gPSB0cnVlXG4gICAgZWxzZVxuICAgICAga2V5ID0gcGFydFxuXG4gIGlmIHNlbXZlci5zYXRpc2ZpZXMoYXRvbS5nZXRWZXJzaW9uKCksICc8IDEuMTInKVxuICAgIGtleSA9ICcgJyBpZiBrZXkgaXMgJ3NwYWNlJ1xuICBidWlsZEtleWRvd25FdmVudChrZXksIG9wdGlvbnMpXG5cbmJ1aWxkVGV4dElucHV0RXZlbnQgPSAoa2V5KSAtPlxuICBldmVudEFyZ3MgPSBbXG4gICAgdHJ1ZSAjIGJ1YmJsZXNcbiAgICB0cnVlICMgY2FuY2VsYWJsZVxuICAgIHdpbmRvdyAjIHZpZXdcbiAgICBrZXkgICMga2V5IGNoYXJcbiAgXVxuICBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdUZXh0RXZlbnQnKVxuICBldmVudC5pbml0VGV4dEV2ZW50KFwidGV4dElucHV0XCIsIGV2ZW50QXJncy4uLilcbiAgZXZlbnRcblxucmF3S2V5c3Ryb2tlID0gKGtleXN0cm9rZXMsIHRhcmdldCkgLT5cbiAgZm9yIGtleSBpbiBub3JtYWxpemVLZXlzdHJva2VzKGtleXN0cm9rZXMpLnNwbGl0KC9cXHMrLylcbiAgICBldmVudCA9IGJ1aWxkS2V5ZG93bkV2ZW50RnJvbUtleXN0cm9rZShrZXksIHRhcmdldClcbiAgICBhdG9tLmtleW1hcHMuaGFuZGxlS2V5Ym9hcmRFdmVudChldmVudClcblxuaXNQb2ludCA9IChvYmopIC0+XG4gIGlmIG9iaiBpbnN0YW5jZW9mIFBvaW50XG4gICAgdHJ1ZVxuICBlbHNlXG4gICAgb2JqLmxlbmd0aCBpcyAyIGFuZCBfLmlzTnVtYmVyKG9ialswXSkgYW5kIF8uaXNOdW1iZXIob2JqWzFdKVxuXG5pc1JhbmdlID0gKG9iaikgLT5cbiAgaWYgb2JqIGluc3RhbmNlb2YgUmFuZ2VcbiAgICB0cnVlXG4gIGVsc2VcbiAgICBfLmFsbChbXG4gICAgICBfLmlzQXJyYXkob2JqKSxcbiAgICAgIChvYmoubGVuZ3RoIGlzIDIpLFxuICAgICAgaXNQb2ludChvYmpbMF0pLFxuICAgICAgaXNQb2ludChvYmpbMV0pXG4gICAgXSlcblxudG9BcnJheSA9IChvYmosIGNvbmQ9bnVsbCkgLT5cbiAgaWYgXy5pc0FycmF5KGNvbmQgPyBvYmopIHRoZW4gb2JqIGVsc2UgW29ial1cblxudG9BcnJheU9mUG9pbnQgPSAob2JqKSAtPlxuICBpZiBfLmlzQXJyYXkob2JqKSBhbmQgaXNQb2ludChvYmpbMF0pXG4gICAgb2JqXG4gIGVsc2VcbiAgICBbb2JqXVxuXG50b0FycmF5T2ZSYW5nZSA9IChvYmopIC0+XG4gIGlmIF8uaXNBcnJheShvYmopIGFuZCBfLmFsbChvYmoubWFwIChlKSAtPiBpc1JhbmdlKGUpKVxuICAgIG9ialxuICBlbHNlXG4gICAgW29ial1cblxuIyBNYWluXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmdldFZpbVN0YXRlID0gKGFyZ3MuLi4pIC0+XG4gIFtlZGl0b3IsIGZpbGUsIGNhbGxiYWNrXSA9IFtdXG4gIHN3aXRjaCBhcmdzLmxlbmd0aFxuICAgIHdoZW4gMSB0aGVuIFtjYWxsYmFja10gPSBhcmdzXG4gICAgd2hlbiAyIHRoZW4gW2ZpbGUsIGNhbGxiYWNrXSA9IGFyZ3NcblxuICB3YWl0c0ZvclByb21pc2UgLT5cbiAgICBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgndmltLW1vZGUtcGx1cycpXG5cbiAgd2FpdHNGb3JQcm9taXNlIC0+XG4gICAgZmlsZSA9IGF0b20ucHJvamVjdC5yZXNvbHZlUGF0aChmaWxlKSBpZiBmaWxlXG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlKS50aGVuIChlKSAtPiBlZGl0b3IgPSBlXG5cbiAgcnVucyAtPlxuICAgIG1haW4gPSBhdG9tLnBhY2thZ2VzLmdldEFjdGl2ZVBhY2thZ2UoJ3ZpbS1tb2RlLXBsdXMnKS5tYWluTW9kdWxlXG4gICAgdmltU3RhdGUgPSBtYWluLmdldEVkaXRvclN0YXRlKGVkaXRvcilcbiAgICBjYWxsYmFjayh2aW1TdGF0ZSwgbmV3IFZpbUVkaXRvcih2aW1TdGF0ZSkpXG5cbmNsYXNzIFRleHREYXRhXG4gIGNvbnN0cnVjdG9yOiAoQHJhd0RhdGEpIC0+XG4gICAgQGxpbmVzID0gQHJhd0RhdGEuc3BsaXQoXCJcXG5cIilcblxuICBnZXRMaW5lczogKGxpbmVzLCB7Y2hvbXB9PXt9KSAtPlxuICAgIGNob21wID89IGZhbHNlXG4gICAgdGV4dCA9IChAbGluZXNbbGluZV0gZm9yIGxpbmUgaW4gbGluZXMpLmpvaW4oXCJcXG5cIilcbiAgICBpZiBjaG9tcFxuICAgICAgdGV4dFxuICAgIGVsc2VcbiAgICAgIHRleHQgKyBcIlxcblwiXG5cbiAgZ2V0UmF3OiAtPlxuICAgIEByYXdEYXRhXG5cbmNvbGxlY3RJbmRleEluVGV4dCA9IChjaGFyLCB0ZXh0KSAtPlxuICBpbmRleGVzID0gW11cbiAgZnJvbUluZGV4ID0gMFxuICB3aGlsZSAoaW5kZXggPSB0ZXh0LmluZGV4T2YoY2hhciwgZnJvbUluZGV4KSkgPj0gMFxuICAgIGZyb21JbmRleCA9IGluZGV4ICsgMVxuICAgIGluZGV4ZXMucHVzaChpbmRleClcbiAgaW5kZXhlc1xuXG5jb2xsZWN0Q2hhclBvc2l0aW9uc0luVGV4dCA9IChjaGFyLCB0ZXh0KSAtPlxuICBwb3NpdGlvbnMgPSBbXVxuICBmb3IgbGluZVRleHQsIHJvd051bWJlciBpbiB0ZXh0LnNwbGl0KC9cXG4vKVxuICAgIGZvciBpbmRleCwgaSBpbiBjb2xsZWN0SW5kZXhJblRleHQoY2hhciwgbGluZVRleHQpXG4gICAgICBwb3NpdGlvbnMucHVzaChbcm93TnVtYmVyLCBpbmRleCAtIGldKVxuICBwb3NpdGlvbnNcblxuY2xhc3MgVmltRWRpdG9yXG4gIGNvbnN0cnVjdG9yOiAoQHZpbVN0YXRlKSAtPlxuICAgIHtAZWRpdG9yLCBAZWRpdG9yRWxlbWVudH0gPSBAdmltU3RhdGVcblxuICB2YWxpZGF0ZU9wdGlvbnM6IChvcHRpb25zLCB2YWxpZE9wdGlvbnMsIG1lc3NhZ2UpIC0+XG4gICAgaW52YWxpZE9wdGlvbnMgPSBfLndpdGhvdXQoXy5rZXlzKG9wdGlvbnMpLCB2YWxpZE9wdGlvbnMuLi4pXG4gICAgaWYgaW52YWxpZE9wdGlvbnMubGVuZ3RoXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCIje21lc3NhZ2V9OiAje2luc3BlY3QoaW52YWxpZE9wdGlvbnMpfVwiKVxuXG4gIHZhbGlkYXRlRXhjbHVzaXZlT3B0aW9uczogKG9wdGlvbnMsIHJ1bGVzKSAtPlxuICAgIGFsbE9wdGlvbnMgPSBPYmplY3Qua2V5cyhvcHRpb25zKVxuICAgIGZvciBvcHRpb24sIGV4Y2x1c2l2ZU9wdGlvbnMgb2YgcnVsZXMgd2hlbiBvcHRpb24gb2Ygb3B0aW9uc1xuICAgICAgdmlvbGF0aW5nT3B0aW9ucyA9IGV4Y2x1c2l2ZU9wdGlvbnMuZmlsdGVyIChleGNsdXNpdmVPcHRpb24pIC0+IGV4Y2x1c2l2ZU9wdGlvbiBpbiBhbGxPcHRpb25zXG4gICAgICBpZiB2aW9sYXRpbmdPcHRpb25zLmxlbmd0aFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIje29wdGlvbn0gaXMgZXhjbHVzaXZlIHdpdGggWyN7dmlvbGF0aW5nT3B0aW9uc31dXCIpXG5cbiAgc2V0T3B0aW9uc09yZGVyZWQgPSBbXG4gICAgJ3RleHQnLCAndGV4dF8nLFxuICAgICd0ZXh0QycsICd0ZXh0Q18nLFxuICAgICdncmFtbWFyJyxcbiAgICAnY3Vyc29yJywgJ2N1cnNvclNjcmVlbidcbiAgICAnYWRkQ3Vyc29yJywgJ2N1cnNvclNjcmVlbidcbiAgICAncmVnaXN0ZXInLFxuICAgICdzZWxlY3RlZEJ1ZmZlclJhbmdlJ1xuICBdXG5cbiAgc2V0RXhjbHVzaXZlUnVsZXMgPVxuICAgIHRleHRDOiBbJ2N1cnNvcicsICdjdXJzb3JTY3JlZW4nXVxuICAgIHRleHRDXzogWydjdXJzb3InLCAnY3Vyc29yU2NyZWVuJ11cblxuICAjIFB1YmxpY1xuICBzZXQ6IChvcHRpb25zKSA9PlxuICAgIEB2YWxpZGF0ZU9wdGlvbnMob3B0aW9ucywgc2V0T3B0aW9uc09yZGVyZWQsICdJbnZhbGlkIHNldCBvcHRpb25zJylcbiAgICBAdmFsaWRhdGVFeGNsdXNpdmVPcHRpb25zKG9wdGlvbnMsIHNldEV4Y2x1c2l2ZVJ1bGVzKVxuXG4gICAgZm9yIG5hbWUgaW4gc2V0T3B0aW9uc09yZGVyZWQgd2hlbiBvcHRpb25zW25hbWVdP1xuICAgICAgbWV0aG9kID0gJ3NldCcgKyBfLmNhcGl0YWxpemUoXy5jYW1lbGl6ZShuYW1lKSlcbiAgICAgIHRoaXNbbWV0aG9kXShvcHRpb25zW25hbWVdKVxuXG4gIHNldFRleHQ6ICh0ZXh0KSAtPlxuICAgIEBlZGl0b3Iuc2V0VGV4dCh0ZXh0KVxuXG4gIHNldFRleHRfOiAodGV4dCkgLT5cbiAgICBAc2V0VGV4dCh0ZXh0LnJlcGxhY2UoL18vZywgJyAnKSlcblxuICBzZXRUZXh0QzogKHRleHQpIC0+XG4gICAgY3Vyc29ycyA9IGNvbGxlY3RDaGFyUG9zaXRpb25zSW5UZXh0KCd8JywgdGV4dC5yZXBsYWNlKC8hL2csICcnKSlcbiAgICBsYXN0Q3Vyc29yID0gY29sbGVjdENoYXJQb3NpdGlvbnNJblRleHQoJyEnLCB0ZXh0LnJlcGxhY2UoL1xcfC9nLCAnJykpXG4gICAgQHNldFRleHQodGV4dC5yZXBsYWNlKC9bXFx8IV0vZywgJycpKVxuICAgIGN1cnNvcnMgPSBjdXJzb3JzLmNvbmNhdChsYXN0Q3Vyc29yKVxuICAgIGlmIGN1cnNvcnMubGVuZ3RoXG4gICAgICBAc2V0Q3Vyc29yKGN1cnNvcnMpXG5cbiAgc2V0VGV4dENfOiAodGV4dCkgLT5cbiAgICBAc2V0VGV4dEModGV4dC5yZXBsYWNlKC9fL2csICcgJykpXG5cbiAgc2V0R3JhbW1hcjogKHNjb3BlKSAtPlxuICAgIEBlZGl0b3Iuc2V0R3JhbW1hcihhdG9tLmdyYW1tYXJzLmdyYW1tYXJGb3JTY29wZU5hbWUoc2NvcGUpKVxuXG4gIHNldEN1cnNvcjogKHBvaW50cykgLT5cbiAgICBwb2ludHMgPSB0b0FycmF5T2ZQb2ludChwb2ludHMpXG4gICAgQGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihwb2ludHMuc2hpZnQoKSlcbiAgICBmb3IgcG9pbnQgaW4gcG9pbnRzXG4gICAgICBAZWRpdG9yLmFkZEN1cnNvckF0QnVmZmVyUG9zaXRpb24ocG9pbnQpXG5cbiAgc2V0Q3Vyc29yU2NyZWVuOiAocG9pbnRzKSAtPlxuICAgIHBvaW50cyA9IHRvQXJyYXlPZlBvaW50KHBvaW50cylcbiAgICBAZWRpdG9yLnNldEN1cnNvclNjcmVlblBvc2l0aW9uKHBvaW50cy5zaGlmdCgpKVxuICAgIGZvciBwb2ludCBpbiBwb2ludHNcbiAgICAgIEBlZGl0b3IuYWRkQ3Vyc29yQXRTY3JlZW5Qb3NpdGlvbihwb2ludClcblxuICBzZXRBZGRDdXJzb3I6IChwb2ludHMpIC0+XG4gICAgZm9yIHBvaW50IGluIHRvQXJyYXlPZlBvaW50KHBvaW50cylcbiAgICAgIEBlZGl0b3IuYWRkQ3Vyc29yQXRCdWZmZXJQb3NpdGlvbihwb2ludClcblxuICBzZXRSZWdpc3RlcjogKHJlZ2lzdGVyKSAtPlxuICAgIGZvciBuYW1lLCB2YWx1ZSBvZiByZWdpc3RlclxuICAgICAgQHZpbVN0YXRlLnJlZ2lzdGVyLnNldChuYW1lLCB2YWx1ZSlcblxuICBzZXRTZWxlY3RlZEJ1ZmZlclJhbmdlOiAocmFuZ2UpIC0+XG4gICAgQGVkaXRvci5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKHJhbmdlKVxuXG4gIGVuc3VyZU9wdGlvbnNPcmRlcmVkID0gW1xuICAgICd0ZXh0JywgJ3RleHRfJyxcbiAgICAndGV4dEMnLCAndGV4dENfJyxcbiAgICAnc2VsZWN0ZWRUZXh0JywgJ3NlbGVjdGVkVGV4dF8nLCAnc2VsZWN0ZWRUZXh0T3JkZXJlZCcsIFwic2VsZWN0aW9uSXNOYXJyb3dlZFwiXG4gICAgJ2N1cnNvcicsICdjdXJzb3JTY3JlZW4nXG4gICAgJ251bUN1cnNvcnMnXG4gICAgJ3JlZ2lzdGVyJyxcbiAgICAnc2VsZWN0ZWRTY3JlZW5SYW5nZScsICdzZWxlY3RlZFNjcmVlblJhbmdlT3JkZXJlZCdcbiAgICAnc2VsZWN0ZWRCdWZmZXJSYW5nZScsICdzZWxlY3RlZEJ1ZmZlclJhbmdlT3JkZXJlZCdcbiAgICAnc2VsZWN0aW9uSXNSZXZlcnNlZCcsXG4gICAgJ3BlcnNpc3RlbnRTZWxlY3Rpb25CdWZmZXJSYW5nZScsICdwZXJzaXN0ZW50U2VsZWN0aW9uQ291bnQnXG4gICAgJ29jY3VycmVuY2VDb3VudCcsICdvY2N1cnJlbmNlVGV4dCdcbiAgICAncHJvcGVydHlIZWFkJ1xuICAgICdwcm9wZXJ0eVRhaWwnXG4gICAgJ3Njcm9sbFRvcCcsXG4gICAgJ21hcmsnXG4gICAgJ21vZGUnLFxuICBdXG4gIGVuc3VyZUV4Y2x1c2l2ZVJ1bGVzID1cbiAgICB0ZXh0QzogWydjdXJzb3InLCAnY3Vyc29yU2NyZWVuJ11cbiAgICB0ZXh0Q186IFsnY3Vyc29yJywgJ2N1cnNvclNjcmVlbiddXG5cbiAgZ2V0QW5kRGVsZXRlS2V5c3Ryb2tlT3B0aW9uczogKG9wdGlvbnMpIC0+XG4gICAge3BhcnRpYWxNYXRjaFRpbWVvdXR9ID0gb3B0aW9uc1xuICAgIGRlbGV0ZSBvcHRpb25zLnBhcnRpYWxNYXRjaFRpbWVvdXRcbiAgICB7cGFydGlhbE1hdGNoVGltZW91dH1cblxuICAjIFB1YmxpY1xuICBlbnN1cmU6IChhcmdzLi4uKSA9PlxuICAgIHN3aXRjaCBhcmdzLmxlbmd0aFxuICAgICAgd2hlbiAxIHRoZW4gW29wdGlvbnNdID0gYXJnc1xuICAgICAgd2hlbiAyIHRoZW4gW2tleXN0cm9rZSwgb3B0aW9uc10gPSBhcmdzXG5cbiAgICB1bmxlc3MgdHlwZW9mKG9wdGlvbnMpIGlzICdvYmplY3QnXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIG9wdGlvbnMgZm9yICdlbnN1cmUnOiBtdXN0IGJlICdvYmplY3QnIGJ1dCBnb3QgJyN7dHlwZW9mKG9wdGlvbnMpfSdcIilcbiAgICBpZiBrZXlzdHJva2U/IGFuZCBub3QgKHR5cGVvZihrZXlzdHJva2UpIGlzICdzdHJpbmcnIG9yIEFycmF5LmlzQXJyYXkoa2V5c3Ryb2tlKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQga2V5c3Ryb2tlIGZvciAnZW5zdXJlJzogbXVzdCBiZSAnc3RyaW5nJyBvciAnYXJyYXknIGJ1dCBnb3QgJyN7dHlwZW9mKGtleXN0cm9rZSl9J1wiKVxuXG4gICAga2V5c3Ryb2tlT3B0aW9ucyA9IEBnZXRBbmREZWxldGVLZXlzdHJva2VPcHRpb25zKG9wdGlvbnMpXG5cbiAgICBAdmFsaWRhdGVPcHRpb25zKG9wdGlvbnMsIGVuc3VyZU9wdGlvbnNPcmRlcmVkLCAnSW52YWxpZCBlbnN1cmUgb3B0aW9uJylcbiAgICBAdmFsaWRhdGVFeGNsdXNpdmVPcHRpb25zKG9wdGlvbnMsIGVuc3VyZUV4Y2x1c2l2ZVJ1bGVzKVxuXG4gICAgIyBJbnB1dFxuICAgIHVubGVzcyBfLmlzRW1wdHkoa2V5c3Ryb2tlKVxuICAgICAgQGtleXN0cm9rZShrZXlzdHJva2UsIGtleXN0cm9rZU9wdGlvbnMpXG5cbiAgICBmb3IgbmFtZSBpbiBlbnN1cmVPcHRpb25zT3JkZXJlZCB3aGVuIG9wdGlvbnNbbmFtZV0/XG4gICAgICBtZXRob2QgPSAnZW5zdXJlJyArIF8uY2FwaXRhbGl6ZShfLmNhbWVsaXplKG5hbWUpKVxuICAgICAgdGhpc1ttZXRob2RdKG9wdGlvbnNbbmFtZV0pXG5cbiAgYmluZEVuc3VyZU9wdGlvbjogKG9wdGlvbnNCYXNlKSA9PlxuICAgIChrZXlzdHJva2UsIG9wdGlvbnMpID0+XG4gICAgICBpbnRlcnNlY3RpbmdPcHRpb25zID0gXy5pbnRlcnNlY3Rpb24oXy5rZXlzKG9wdGlvbnMpLCBfLmtleXMob3B0aW9uc0Jhc2UpKVxuICAgICAgaWYgaW50ZXJzZWN0aW5nT3B0aW9ucy5sZW5ndGhcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY29uZmxpY3Qgd2l0aCBib3VuZCBvcHRpb25zICN7aW5zcGVjdChpbnRlcnNlY3RpbmdPcHRpb25zKX1cIilcblxuICAgICAgQGVuc3VyZShrZXlzdHJva2UsIF8uZGVmYXVsdHMoXy5jbG9uZShvcHRpb25zKSwgb3B0aW9uc0Jhc2UpKVxuXG4gIGVuc3VyZUJ5RGlzcGF0Y2g6IChjb21tYW5kLCBvcHRpb25zKSA9PlxuICAgIGRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhAZWRpdG9yKSwgY29tbWFuZClcbiAgICBmb3IgbmFtZSBpbiBlbnN1cmVPcHRpb25zT3JkZXJlZCB3aGVuIG9wdGlvbnNbbmFtZV0/XG4gICAgICBtZXRob2QgPSAnZW5zdXJlJyArIF8uY2FwaXRhbGl6ZShfLmNhbWVsaXplKG5hbWUpKVxuICAgICAgdGhpc1ttZXRob2RdKG9wdGlvbnNbbmFtZV0pXG5cbiAgZW5zdXJlVGV4dDogKHRleHQpIC0+XG4gICAgZXhwZWN0KEBlZGl0b3IuZ2V0VGV4dCgpKS50b0VxdWFsKHRleHQpXG5cbiAgZW5zdXJlVGV4dF86ICh0ZXh0KSAtPlxuICAgIEBlbnN1cmVUZXh0KHRleHQucmVwbGFjZSgvXy9nLCAnICcpKVxuXG4gIGVuc3VyZVRleHRDOiAodGV4dCkgLT5cbiAgICBjdXJzb3JzID0gY29sbGVjdENoYXJQb3NpdGlvbnNJblRleHQoJ3wnLCB0ZXh0LnJlcGxhY2UoLyEvZywgJycpKVxuICAgIGxhc3RDdXJzb3IgPSBjb2xsZWN0Q2hhclBvc2l0aW9uc0luVGV4dCgnIScsIHRleHQucmVwbGFjZSgvXFx8L2csICcnKSlcbiAgICBjdXJzb3JzID0gY3Vyc29ycy5jb25jYXQobGFzdEN1cnNvcilcbiAgICBjdXJzb3JzID0gY3Vyc29yc1xuICAgICAgLm1hcCAocG9pbnQpIC0+IFBvaW50LmZyb21PYmplY3QocG9pbnQpXG4gICAgICAuc29ydCAoYSwgYikgLT4gYS5jb21wYXJlKGIpXG4gICAgQGVuc3VyZVRleHQodGV4dC5yZXBsYWNlKC9bXFx8IV0vZywgJycpKVxuICAgIGlmIGN1cnNvcnMubGVuZ3RoXG4gICAgICBAZW5zdXJlQ3Vyc29yKGN1cnNvcnMsIHRydWUpXG5cbiAgICBpZiBsYXN0Q3Vyc29yLmxlbmd0aFxuICAgICAgZXhwZWN0KEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSkudG9FcXVhbChsYXN0Q3Vyc29yWzBdKVxuXG4gIGVuc3VyZVRleHRDXzogKHRleHQpIC0+XG4gICAgQGVuc3VyZVRleHRDKHRleHQucmVwbGFjZSgvXy9nLCAnICcpKVxuXG4gIGVuc3VyZVNlbGVjdGVkVGV4dDogKHRleHQsIG9yZGVyZWQ9ZmFsc2UpIC0+XG4gICAgc2VsZWN0aW9ucyA9IGlmIG9yZGVyZWRcbiAgICAgIEBlZGl0b3IuZ2V0U2VsZWN0aW9uc09yZGVyZWRCeUJ1ZmZlclBvc2l0aW9uKClcbiAgICBlbHNlXG4gICAgICBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgIGFjdHVhbCA9IChzLmdldFRleHQoKSBmb3IgcyBpbiBzZWxlY3Rpb25zKVxuICAgIGV4cGVjdChhY3R1YWwpLnRvRXF1YWwodG9BcnJheSh0ZXh0KSlcblxuICBlbnN1cmVTZWxlY3RlZFRleHRfOiAodGV4dCwgb3JkZXJlZCkgLT5cbiAgICBAZW5zdXJlU2VsZWN0ZWRUZXh0KHRleHQucmVwbGFjZSgvXy9nLCAnICcpLCBvcmRlcmVkKVxuXG4gIGVuc3VyZVNlbGVjdGlvbklzTmFycm93ZWQ6IChpc05hcnJvd2VkKSAtPlxuICAgIGFjdHVhbCA9IEB2aW1TdGF0ZS5tb2RlTWFuYWdlci5pc05hcnJvd2VkKClcbiAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsKGlzTmFycm93ZWQpXG5cbiAgZW5zdXJlU2VsZWN0ZWRUZXh0T3JkZXJlZDogKHRleHQpIC0+XG4gICAgQGVuc3VyZVNlbGVjdGVkVGV4dCh0ZXh0LCB0cnVlKVxuXG4gIGVuc3VyZUN1cnNvcjogKHBvaW50cywgb3JkZXJlZD1mYWxzZSkgLT5cbiAgICBhY3R1YWwgPSBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9ucygpXG4gICAgYWN0dWFsID0gYWN0dWFsLnNvcnQgKGEsIGIpIC0+IGEuY29tcGFyZShiKSBpZiBvcmRlcmVkXG4gICAgZXhwZWN0KGFjdHVhbCkudG9FcXVhbCh0b0FycmF5T2ZQb2ludChwb2ludHMpKVxuXG4gIGVuc3VyZUN1cnNvclNjcmVlbjogKHBvaW50cykgLT5cbiAgICBhY3R1YWwgPSBAZWRpdG9yLmdldEN1cnNvclNjcmVlblBvc2l0aW9ucygpXG4gICAgZXhwZWN0KGFjdHVhbCkudG9FcXVhbCh0b0FycmF5T2ZQb2ludChwb2ludHMpKVxuXG4gIGVuc3VyZVJlZ2lzdGVyOiAocmVnaXN0ZXIpIC0+XG4gICAgZm9yIG5hbWUsIGVuc3VyZSBvZiByZWdpc3RlclxuICAgICAge3NlbGVjdGlvbn0gPSBlbnN1cmVcbiAgICAgIGRlbGV0ZSBlbnN1cmUuc2VsZWN0aW9uXG4gICAgICByZWcgPSBAdmltU3RhdGUucmVnaXN0ZXIuZ2V0KG5hbWUsIHNlbGVjdGlvbilcbiAgICAgIGZvciBwcm9wZXJ0eSwgX3ZhbHVlIG9mIGVuc3VyZVxuICAgICAgICBleHBlY3QocmVnW3Byb3BlcnR5XSkudG9FcXVhbChfdmFsdWUpXG5cbiAgZW5zdXJlTnVtQ3Vyc29yczogKG51bWJlcikgLT5cbiAgICBleHBlY3QoQGVkaXRvci5nZXRDdXJzb3JzKCkpLnRvSGF2ZUxlbmd0aCBudW1iZXJcblxuICBfZW5zdXJlU2VsZWN0ZWRSYW5nZUJ5OiAocmFuZ2UsIG9yZGVyZWQ9ZmFsc2UsIGZuKSAtPlxuICAgIHNlbGVjdGlvbnMgPSBpZiBvcmRlcmVkXG4gICAgICBAZWRpdG9yLmdldFNlbGVjdGlvbnNPcmRlcmVkQnlCdWZmZXJQb3NpdGlvbigpXG4gICAgZWxzZVxuICAgICAgQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICBhY3R1YWwgPSAoZm4ocykgZm9yIHMgaW4gc2VsZWN0aW9ucylcbiAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsKHRvQXJyYXlPZlJhbmdlKHJhbmdlKSlcblxuICBlbnN1cmVTZWxlY3RlZFNjcmVlblJhbmdlOiAocmFuZ2UsIG9yZGVyZWQ9ZmFsc2UpIC0+XG4gICAgQF9lbnN1cmVTZWxlY3RlZFJhbmdlQnkgcmFuZ2UsIG9yZGVyZWQsIChzKSAtPiBzLmdldFNjcmVlblJhbmdlKClcblxuICBlbnN1cmVTZWxlY3RlZFNjcmVlblJhbmdlT3JkZXJlZDogKHJhbmdlKSAtPlxuICAgIEBlbnN1cmVTZWxlY3RlZFNjcmVlblJhbmdlKHJhbmdlLCB0cnVlKVxuXG4gIGVuc3VyZVNlbGVjdGVkQnVmZmVyUmFuZ2U6IChyYW5nZSwgb3JkZXJlZD1mYWxzZSkgLT5cbiAgICBAX2Vuc3VyZVNlbGVjdGVkUmFuZ2VCeSByYW5nZSwgb3JkZXJlZCwgKHMpIC0+IHMuZ2V0QnVmZmVyUmFuZ2UoKVxuXG4gIGVuc3VyZVNlbGVjdGVkQnVmZmVyUmFuZ2VPcmRlcmVkOiAocmFuZ2UpIC0+XG4gICAgQGVuc3VyZVNlbGVjdGVkQnVmZmVyUmFuZ2UocmFuZ2UsIHRydWUpXG5cbiAgZW5zdXJlU2VsZWN0aW9uSXNSZXZlcnNlZDogKHJldmVyc2VkKSAtPlxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIGFjdHVhbCA9IHNlbGVjdGlvbi5pc1JldmVyc2VkKClcbiAgICAgIGV4cGVjdChhY3R1YWwpLnRvQmUocmV2ZXJzZWQpXG5cbiAgZW5zdXJlUGVyc2lzdGVudFNlbGVjdGlvbkJ1ZmZlclJhbmdlOiAocmFuZ2UpIC0+XG4gICAgYWN0dWFsID0gQHZpbVN0YXRlLnBlcnNpc3RlbnRTZWxlY3Rpb24uZ2V0TWFya2VyQnVmZmVyUmFuZ2VzKClcbiAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsKHRvQXJyYXlPZlJhbmdlKHJhbmdlKSlcblxuICBlbnN1cmVQZXJzaXN0ZW50U2VsZWN0aW9uQ291bnQ6IChudW1iZXIpIC0+XG4gICAgYWN0dWFsID0gQHZpbVN0YXRlLnBlcnNpc3RlbnRTZWxlY3Rpb24uZ2V0TWFya2VyQ291bnQoKVxuICAgIGV4cGVjdChhY3R1YWwpLnRvQmUgbnVtYmVyXG5cbiAgZW5zdXJlT2NjdXJyZW5jZUNvdW50OiAobnVtYmVyKSAtPlxuICAgIGFjdHVhbCA9IEB2aW1TdGF0ZS5vY2N1cnJlbmNlTWFuYWdlci5nZXRNYXJrZXJDb3VudCgpXG4gICAgZXhwZWN0KGFjdHVhbCkudG9CZSBudW1iZXJcblxuICBlbnN1cmVPY2N1cnJlbmNlVGV4dDogKHRleHQpIC0+XG4gICAgbWFya2VycyA9IEB2aW1TdGF0ZS5vY2N1cnJlbmNlTWFuYWdlci5nZXRNYXJrZXJzKClcbiAgICByYW5nZXMgPSAoci5nZXRCdWZmZXJSYW5nZSgpIGZvciByIGluIG1hcmtlcnMpXG4gICAgYWN0dWFsID0gKEBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UocikgZm9yIHIgaW4gcmFuZ2VzKVxuICAgIGV4cGVjdChhY3R1YWwpLnRvRXF1YWwodG9BcnJheSh0ZXh0KSlcblxuICBlbnN1cmVQcm9wZXJ0eUhlYWQ6IChwb2ludHMpIC0+XG4gICAgZ2V0SGVhZFByb3BlcnR5ID0gKHNlbGVjdGlvbikgPT5cbiAgICAgIEB2aW1TdGF0ZS5zd3JhcChzZWxlY3Rpb24pLmdldEJ1ZmZlclBvc2l0aW9uRm9yKCdoZWFkJywgZnJvbTogWydwcm9wZXJ0eSddKVxuICAgIGFjdHVhbCA9IChnZXRIZWFkUHJvcGVydHkocykgZm9yIHMgaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkpXG4gICAgZXhwZWN0KGFjdHVhbCkudG9FcXVhbCh0b0FycmF5T2ZQb2ludChwb2ludHMpKVxuXG4gIGVuc3VyZVByb3BlcnR5VGFpbDogKHBvaW50cykgLT5cbiAgICBnZXRUYWlsUHJvcGVydHkgPSAoc2VsZWN0aW9uKSA9PlxuICAgICAgQHZpbVN0YXRlLnN3cmFwKHNlbGVjdGlvbikuZ2V0QnVmZmVyUG9zaXRpb25Gb3IoJ3RhaWwnLCBmcm9tOiBbJ3Byb3BlcnR5J10pXG4gICAgYWN0dWFsID0gKGdldFRhaWxQcm9wZXJ0eShzKSBmb3IgcyBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKSlcbiAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsKHRvQXJyYXlPZlBvaW50KHBvaW50cykpXG5cbiAgZW5zdXJlU2Nyb2xsVG9wOiAoc2Nyb2xsVG9wKSAtPlxuICAgIGFjdHVhbCA9IEBlZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcCgpXG4gICAgZXhwZWN0KGFjdHVhbCkudG9FcXVhbCBzY3JvbGxUb3BcblxuICBlbnN1cmVNYXJrOiAobWFyaykgLT5cbiAgICBmb3IgbmFtZSwgcG9pbnQgb2YgbWFya1xuICAgICAgYWN0dWFsID0gQHZpbVN0YXRlLm1hcmsuZ2V0KG5hbWUpXG4gICAgICBleHBlY3QoYWN0dWFsKS50b0VxdWFsKHBvaW50KVxuXG4gIGVuc3VyZU1vZGU6IChtb2RlKSAtPlxuICAgIG1vZGUgPSB0b0FycmF5KG1vZGUpLnNsaWNlKClcbiAgICBleHBlY3QoQHZpbVN0YXRlLmlzTW9kZShtb2RlLi4uKSkudG9CZSh0cnVlKVxuXG4gICAgbW9kZVswXSA9IFwiI3ttb2RlWzBdfS1tb2RlXCJcbiAgICBtb2RlID0gbW9kZS5maWx0ZXIoKG0pIC0+IG0pXG4gICAgZXhwZWN0KEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygndmltLW1vZGUtcGx1cycpKS50b0JlKHRydWUpXG4gICAgZm9yIG0gaW4gbW9kZVxuICAgICAgZXhwZWN0KEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhtKSkudG9CZSh0cnVlKVxuICAgIHNob3VsZE5vdENvbnRhaW5DbGFzc2VzID0gXy5kaWZmZXJlbmNlKHN1cHBvcnRlZE1vZGVDbGFzcywgbW9kZSlcbiAgICBmb3IgbSBpbiBzaG91bGROb3RDb250YWluQ2xhc3Nlc1xuICAgICAgZXhwZWN0KEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhtKSkudG9CZShmYWxzZSlcblxuICAjIFB1YmxpY1xuICAjIG9wdGlvbnNcbiAgIyAtIHdhaXRzRm9yRmluaXNoXG4gIGtleXN0cm9rZTogKGtleXMsIG9wdGlvbnM9e30pID0+XG4gICAgaWYgb3B0aW9ucy53YWl0c0ZvckZpbmlzaFxuICAgICAgZmluaXNoZWQgPSBmYWxzZVxuICAgICAgQHZpbVN0YXRlLm9uRGlkRmluaXNoT3BlcmF0aW9uIC0+IGZpbmlzaGVkID0gdHJ1ZVxuICAgICAgZGVsZXRlIG9wdGlvbnMud2FpdHNGb3JGaW5pc2hcbiAgICAgIEBrZXlzdHJva2Uoa2V5cywgb3B0aW9ucylcbiAgICAgIHdhaXRzRm9yIC0+IGZpbmlzaGVkXG4gICAgICByZXR1cm5cblxuICAgICMga2V5cyBtdXN0IGJlIFN0cmluZyBvciBBcnJheVxuICAgICMgTm90IHN1cHBvcnQgT2JqZWN0IGZvciBrZXlzIHRvIGF2b2lkIGFtYmlndWl0eS5cbiAgICB0YXJnZXQgPSBAZWRpdG9yRWxlbWVudFxuXG4gICAgZm9yIGsgaW4gdG9BcnJheShrZXlzKVxuICAgICAgaWYgXy5pc1N0cmluZyhrKVxuICAgICAgICByYXdLZXlzdHJva2UoaywgdGFyZ2V0KVxuICAgICAgZWxzZVxuICAgICAgICBzd2l0Y2hcbiAgICAgICAgICB3aGVuIGsuaW5wdXQ/XG4gICAgICAgICAgICAjIFRPRE8gbm8gbG9uZ2VyIG5lZWQgdG8gdXNlIFtpbnB1dDogJ2NoYXInXSBzdHlsZS5cbiAgICAgICAgICAgIHJhd0tleXN0cm9rZShfa2V5LCB0YXJnZXQpIGZvciBfa2V5IGluIGsuaW5wdXQuc3BsaXQoJycpXG4gICAgICAgICAgd2hlbiBrLnNlYXJjaD9cbiAgICAgICAgICAgIEB2aW1TdGF0ZS5zZWFyY2hJbnB1dC5lZGl0b3IuaW5zZXJ0VGV4dChrLnNlYXJjaCkgaWYgay5zZWFyY2hcbiAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goQHZpbVN0YXRlLnNlYXJjaElucHV0LmVkaXRvckVsZW1lbnQsICdjb3JlOmNvbmZpcm0nKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJhd0tleXN0cm9rZShrLCB0YXJnZXQpXG5cbiAgICBpZiBvcHRpb25zLnBhcnRpYWxNYXRjaFRpbWVvdXRcbiAgICAgIGFkdmFuY2VDbG9jayhhdG9tLmtleW1hcHMuZ2V0UGFydGlhbE1hdGNoVGltZW91dCgpKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtnZXRWaW1TdGF0ZSwgZ2V0VmlldywgZGlzcGF0Y2gsIFRleHREYXRhLCB3aXRoTW9ja1BsYXRmb3JtLCByYXdLZXlzdHJva2V9XG4iXX0=
