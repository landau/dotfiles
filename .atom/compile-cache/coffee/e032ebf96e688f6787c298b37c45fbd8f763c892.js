(function() {
  var CompositeDisposable, Disposable, Emitter, Grim, InsertMode, Motions, Operators, Point, Prefixes, Range, Scroll, TextObjects, Utils, VimState, settings, _, _ref, _ref1,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Grim = require('grim');

  _ = require('underscore-plus');

  _ref = require('atom'), Point = _ref.Point, Range = _ref.Range;

  _ref1 = require('event-kit'), Emitter = _ref1.Emitter, Disposable = _ref1.Disposable, CompositeDisposable = _ref1.CompositeDisposable;

  settings = require('./settings');

  Operators = require('./operators/index');

  Prefixes = require('./prefixes');

  Motions = require('./motions/index');

  InsertMode = require('./insert-mode');

  TextObjects = require('./text-objects');

  Utils = require('./utils');

  Scroll = require('./scroll');

  module.exports = VimState = (function() {
    VimState.prototype.editor = null;

    VimState.prototype.opStack = null;

    VimState.prototype.mode = null;

    VimState.prototype.submode = null;

    VimState.prototype.destroyed = false;

    VimState.prototype.replaceModeListener = null;

    function VimState(editorElement, statusBarManager, globalVimState) {
      this.editorElement = editorElement;
      this.statusBarManager = statusBarManager;
      this.globalVimState = globalVimState;
      this.ensureCursorsWithinLine = __bind(this.ensureCursorsWithinLine, this);
      this.checkSelections = __bind(this.checkSelections, this);
      this.replaceModeUndoHandler = __bind(this.replaceModeUndoHandler, this);
      this.replaceModeInsertHandler = __bind(this.replaceModeInsertHandler, this);
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.editor = this.editorElement.getModel();
      this.opStack = [];
      this.history = [];
      this.marks = {};
      this.subscriptions.add(this.editor.onDidDestroy((function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this)));
      this.editorElement.addEventListener('mouseup', this.checkSelections);
      if (atom.commands.onDidDispatch != null) {
        this.subscriptions.add(atom.commands.onDidDispatch((function(_this) {
          return function(e) {
            if (e.target === _this.editorElement) {
              return _this.checkSelections();
            }
          };
        })(this)));
      }
      this.editorElement.classList.add("vim-mode");
      this.setupNormalMode();
      if (settings.startInInsertMode()) {
        this.activateInsertMode();
      } else {
        this.activateNormalMode();
      }
    }

    VimState.prototype.destroy = function() {
      var _ref2;
      if (!this.destroyed) {
        this.destroyed = true;
        this.subscriptions.dispose();
        if (this.editor.isAlive()) {
          this.deactivateInsertMode();
          if ((_ref2 = this.editorElement.component) != null) {
            _ref2.setInputEnabled(true);
          }
          this.editorElement.classList.remove("vim-mode");
          this.editorElement.classList.remove("normal-mode");
        }
        this.editorElement.removeEventListener('mouseup', this.checkSelections);
        this.editor = null;
        this.editorElement = null;
        return this.emitter.emit('did-destroy');
      }
    };

    VimState.prototype.setupNormalMode = function() {
      this.registerCommands({
        'activate-normal-mode': (function(_this) {
          return function() {
            return _this.activateNormalMode();
          };
        })(this),
        'activate-linewise-visual-mode': (function(_this) {
          return function() {
            return _this.activateVisualMode('linewise');
          };
        })(this),
        'activate-characterwise-visual-mode': (function(_this) {
          return function() {
            return _this.activateVisualMode('characterwise');
          };
        })(this),
        'activate-blockwise-visual-mode': (function(_this) {
          return function() {
            return _this.activateVisualMode('blockwise');
          };
        })(this),
        'reset-normal-mode': (function(_this) {
          return function() {
            return _this.resetNormalMode();
          };
        })(this),
        'repeat-prefix': (function(_this) {
          return function(e) {
            return _this.repeatPrefix(e);
          };
        })(this),
        'reverse-selections': (function(_this) {
          return function(e) {
            return _this.reverseSelections(e);
          };
        })(this),
        'undo': (function(_this) {
          return function(e) {
            return _this.undo(e);
          };
        })(this),
        'replace-mode-backspace': (function(_this) {
          return function() {
            return _this.replaceModeUndo();
          };
        })(this),
        'insert-mode-put': (function(_this) {
          return function(e) {
            return _this.insertRegister(_this.registerName(e));
          };
        })(this),
        'copy-from-line-above': (function(_this) {
          return function() {
            return InsertMode.copyCharacterFromAbove(_this.editor, _this);
          };
        })(this),
        'copy-from-line-below': (function(_this) {
          return function() {
            return InsertMode.copyCharacterFromBelow(_this.editor, _this);
          };
        })(this)
      });
      return this.registerOperationCommands({
        'activate-insert-mode': (function(_this) {
          return function() {
            return new Operators.Insert(_this.editor, _this);
          };
        })(this),
        'activate-replace-mode': (function(_this) {
          return function() {
            return new Operators.ReplaceMode(_this.editor, _this);
          };
        })(this),
        'substitute': (function(_this) {
          return function() {
            return [new Operators.Change(_this.editor, _this), new Motions.MoveRight(_this.editor, _this)];
          };
        })(this),
        'substitute-line': (function(_this) {
          return function() {
            return [new Operators.Change(_this.editor, _this), new Motions.MoveToRelativeLine(_this.editor, _this)];
          };
        })(this),
        'insert-after': (function(_this) {
          return function() {
            return new Operators.InsertAfter(_this.editor, _this);
          };
        })(this),
        'insert-after-end-of-line': (function(_this) {
          return function() {
            return new Operators.InsertAfterEndOfLine(_this.editor, _this);
          };
        })(this),
        'insert-at-beginning-of-line': (function(_this) {
          return function() {
            return new Operators.InsertAtBeginningOfLine(_this.editor, _this);
          };
        })(this),
        'insert-above-with-newline': (function(_this) {
          return function() {
            return new Operators.InsertAboveWithNewline(_this.editor, _this);
          };
        })(this),
        'insert-below-with-newline': (function(_this) {
          return function() {
            return new Operators.InsertBelowWithNewline(_this.editor, _this);
          };
        })(this),
        'delete': (function(_this) {
          return function() {
            return _this.linewiseAliasedOperator(Operators.Delete);
          };
        })(this),
        'change': (function(_this) {
          return function() {
            return _this.linewiseAliasedOperator(Operators.Change);
          };
        })(this),
        'change-to-last-character-of-line': (function(_this) {
          return function() {
            return [new Operators.Change(_this.editor, _this), new Motions.MoveToLastCharacterOfLine(_this.editor, _this)];
          };
        })(this),
        'delete-right': (function(_this) {
          return function() {
            return [new Operators.Delete(_this.editor, _this), new Motions.MoveRight(_this.editor, _this)];
          };
        })(this),
        'delete-left': (function(_this) {
          return function() {
            return [new Operators.Delete(_this.editor, _this), new Motions.MoveLeft(_this.editor, _this)];
          };
        })(this),
        'delete-to-last-character-of-line': (function(_this) {
          return function() {
            return [new Operators.Delete(_this.editor, _this), new Motions.MoveToLastCharacterOfLine(_this.editor, _this)];
          };
        })(this),
        'toggle-case': (function(_this) {
          return function() {
            return new Operators.ToggleCase(_this.editor, _this);
          };
        })(this),
        'upper-case': (function(_this) {
          return function() {
            return new Operators.UpperCase(_this.editor, _this);
          };
        })(this),
        'lower-case': (function(_this) {
          return function() {
            return new Operators.LowerCase(_this.editor, _this);
          };
        })(this),
        'toggle-case-now': (function(_this) {
          return function() {
            return new Operators.ToggleCase(_this.editor, _this, {
              complete: true
            });
          };
        })(this),
        'yank': (function(_this) {
          return function() {
            return _this.linewiseAliasedOperator(Operators.Yank);
          };
        })(this),
        'yank-line': (function(_this) {
          return function() {
            return [new Operators.Yank(_this.editor, _this), new Motions.MoveToRelativeLine(_this.editor, _this)];
          };
        })(this),
        'put-before': (function(_this) {
          return function() {
            return new Operators.Put(_this.editor, _this, {
              location: 'before'
            });
          };
        })(this),
        'put-after': (function(_this) {
          return function() {
            return new Operators.Put(_this.editor, _this, {
              location: 'after'
            });
          };
        })(this),
        'join': (function(_this) {
          return function() {
            return new Operators.Join(_this.editor, _this);
          };
        })(this),
        'indent': (function(_this) {
          return function() {
            return _this.linewiseAliasedOperator(Operators.Indent);
          };
        })(this),
        'outdent': (function(_this) {
          return function() {
            return _this.linewiseAliasedOperator(Operators.Outdent);
          };
        })(this),
        'auto-indent': (function(_this) {
          return function() {
            return _this.linewiseAliasedOperator(Operators.Autoindent);
          };
        })(this),
        'increase': (function(_this) {
          return function() {
            return new Operators.Increase(_this.editor, _this);
          };
        })(this),
        'decrease': (function(_this) {
          return function() {
            return new Operators.Decrease(_this.editor, _this);
          };
        })(this),
        'move-left': (function(_this) {
          return function() {
            return new Motions.MoveLeft(_this.editor, _this);
          };
        })(this),
        'move-up': (function(_this) {
          return function() {
            return new Motions.MoveUp(_this.editor, _this);
          };
        })(this),
        'move-down': (function(_this) {
          return function() {
            return new Motions.MoveDown(_this.editor, _this);
          };
        })(this),
        'move-right': (function(_this) {
          return function() {
            return new Motions.MoveRight(_this.editor, _this);
          };
        })(this),
        'move-to-next-word': (function(_this) {
          return function() {
            return new Motions.MoveToNextWord(_this.editor, _this);
          };
        })(this),
        'move-to-next-whole-word': (function(_this) {
          return function() {
            return new Motions.MoveToNextWholeWord(_this.editor, _this);
          };
        })(this),
        'move-to-end-of-word': (function(_this) {
          return function() {
            return new Motions.MoveToEndOfWord(_this.editor, _this);
          };
        })(this),
        'move-to-end-of-whole-word': (function(_this) {
          return function() {
            return new Motions.MoveToEndOfWholeWord(_this.editor, _this);
          };
        })(this),
        'move-to-previous-word': (function(_this) {
          return function() {
            return new Motions.MoveToPreviousWord(_this.editor, _this);
          };
        })(this),
        'move-to-previous-whole-word': (function(_this) {
          return function() {
            return new Motions.MoveToPreviousWholeWord(_this.editor, _this);
          };
        })(this),
        'move-to-next-paragraph': (function(_this) {
          return function() {
            return new Motions.MoveToNextParagraph(_this.editor, _this);
          };
        })(this),
        'move-to-next-sentence': (function(_this) {
          return function() {
            return new Motions.MoveToNextSentence(_this.editor, _this);
          };
        })(this),
        'move-to-previous-sentence': (function(_this) {
          return function() {
            return new Motions.MoveToPreviousSentence(_this.editor, _this);
          };
        })(this),
        'move-to-previous-paragraph': (function(_this) {
          return function() {
            return new Motions.MoveToPreviousParagraph(_this.editor, _this);
          };
        })(this),
        'move-to-first-character-of-line': (function(_this) {
          return function() {
            return new Motions.MoveToFirstCharacterOfLine(_this.editor, _this);
          };
        })(this),
        'move-to-first-character-of-line-and-down': (function(_this) {
          return function() {
            return new Motions.MoveToFirstCharacterOfLineAndDown(_this.editor, _this);
          };
        })(this),
        'move-to-last-character-of-line': (function(_this) {
          return function() {
            return new Motions.MoveToLastCharacterOfLine(_this.editor, _this);
          };
        })(this),
        'move-to-last-nonblank-character-of-line-and-down': (function(_this) {
          return function() {
            return new Motions.MoveToLastNonblankCharacterOfLineAndDown(_this.editor, _this);
          };
        })(this),
        'move-to-beginning-of-line': (function(_this) {
          return function(e) {
            return _this.moveOrRepeat(e);
          };
        })(this),
        'move-to-first-character-of-line-up': (function(_this) {
          return function() {
            return new Motions.MoveToFirstCharacterOfLineUp(_this.editor, _this);
          };
        })(this),
        'move-to-first-character-of-line-down': (function(_this) {
          return function() {
            return new Motions.MoveToFirstCharacterOfLineDown(_this.editor, _this);
          };
        })(this),
        'move-to-start-of-file': (function(_this) {
          return function() {
            return new Motions.MoveToStartOfFile(_this.editor, _this);
          };
        })(this),
        'move-to-line': (function(_this) {
          return function() {
            return new Motions.MoveToAbsoluteLine(_this.editor, _this);
          };
        })(this),
        'move-to-top-of-screen': (function(_this) {
          return function() {
            return new Motions.MoveToTopOfScreen(_this.editorElement, _this);
          };
        })(this),
        'move-to-bottom-of-screen': (function(_this) {
          return function() {
            return new Motions.MoveToBottomOfScreen(_this.editorElement, _this);
          };
        })(this),
        'move-to-middle-of-screen': (function(_this) {
          return function() {
            return new Motions.MoveToMiddleOfScreen(_this.editorElement, _this);
          };
        })(this),
        'scroll-down': (function(_this) {
          return function() {
            return new Scroll.ScrollDown(_this.editorElement);
          };
        })(this),
        'scroll-up': (function(_this) {
          return function() {
            return new Scroll.ScrollUp(_this.editorElement);
          };
        })(this),
        'scroll-cursor-to-top': (function(_this) {
          return function() {
            return new Scroll.ScrollCursorToTop(_this.editorElement);
          };
        })(this),
        'scroll-cursor-to-top-leave': (function(_this) {
          return function() {
            return new Scroll.ScrollCursorToTop(_this.editorElement, {
              leaveCursor: true
            });
          };
        })(this),
        'scroll-cursor-to-middle': (function(_this) {
          return function() {
            return new Scroll.ScrollCursorToMiddle(_this.editorElement);
          };
        })(this),
        'scroll-cursor-to-middle-leave': (function(_this) {
          return function() {
            return new Scroll.ScrollCursorToMiddle(_this.editorElement, {
              leaveCursor: true
            });
          };
        })(this),
        'scroll-cursor-to-bottom': (function(_this) {
          return function() {
            return new Scroll.ScrollCursorToBottom(_this.editorElement);
          };
        })(this),
        'scroll-cursor-to-bottom-leave': (function(_this) {
          return function() {
            return new Scroll.ScrollCursorToBottom(_this.editorElement, {
              leaveCursor: true
            });
          };
        })(this),
        'scroll-half-screen-up': (function(_this) {
          return function() {
            return new Motions.ScrollHalfUpKeepCursor(_this.editorElement, _this);
          };
        })(this),
        'scroll-full-screen-up': (function(_this) {
          return function() {
            return new Motions.ScrollFullUpKeepCursor(_this.editorElement, _this);
          };
        })(this),
        'scroll-half-screen-down': (function(_this) {
          return function() {
            return new Motions.ScrollHalfDownKeepCursor(_this.editorElement, _this);
          };
        })(this),
        'scroll-full-screen-down': (function(_this) {
          return function() {
            return new Motions.ScrollFullDownKeepCursor(_this.editorElement, _this);
          };
        })(this),
        'scroll-cursor-to-left': (function(_this) {
          return function() {
            return new Scroll.ScrollCursorToLeft(_this.editorElement);
          };
        })(this),
        'scroll-cursor-to-right': (function(_this) {
          return function() {
            return new Scroll.ScrollCursorToRight(_this.editorElement);
          };
        })(this),
        'select-inside-word': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideWord(_this.editor);
          };
        })(this),
        'select-inside-whole-word': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideWholeWord(_this.editor);
          };
        })(this),
        'select-inside-double-quotes': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideQuotes(_this.editor, '"', false);
          };
        })(this),
        'select-inside-single-quotes': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideQuotes(_this.editor, '\'', false);
          };
        })(this),
        'select-inside-back-ticks': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideQuotes(_this.editor, '`', false);
          };
        })(this),
        'select-inside-curly-brackets': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideBrackets(_this.editor, '{', '}', false);
          };
        })(this),
        'select-inside-angle-brackets': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideBrackets(_this.editor, '<', '>', false);
          };
        })(this),
        'select-inside-tags': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideBrackets(_this.editor, '>', '<', false);
          };
        })(this),
        'select-inside-square-brackets': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideBrackets(_this.editor, '[', ']', false);
          };
        })(this),
        'select-inside-parentheses': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideBrackets(_this.editor, '(', ')', false);
          };
        })(this),
        'select-inside-paragraph': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideParagraph(_this.editor, false);
          };
        })(this),
        'select-a-word': (function(_this) {
          return function() {
            return new TextObjects.SelectAWord(_this.editor);
          };
        })(this),
        'select-a-whole-word': (function(_this) {
          return function() {
            return new TextObjects.SelectAWholeWord(_this.editor);
          };
        })(this),
        'select-around-double-quotes': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideQuotes(_this.editor, '"', true);
          };
        })(this),
        'select-around-single-quotes': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideQuotes(_this.editor, '\'', true);
          };
        })(this),
        'select-around-back-ticks': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideQuotes(_this.editor, '`', true);
          };
        })(this),
        'select-around-curly-brackets': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideBrackets(_this.editor, '{', '}', true);
          };
        })(this),
        'select-around-angle-brackets': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideBrackets(_this.editor, '<', '>', true);
          };
        })(this),
        'select-around-square-brackets': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideBrackets(_this.editor, '[', ']', true);
          };
        })(this),
        'select-around-parentheses': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideBrackets(_this.editor, '(', ')', true);
          };
        })(this),
        'select-around-paragraph': (function(_this) {
          return function() {
            return new TextObjects.SelectAParagraph(_this.editor, true);
          };
        })(this),
        'register-prefix': (function(_this) {
          return function(e) {
            return _this.registerPrefix(e);
          };
        })(this),
        'repeat': (function(_this) {
          return function(e) {
            return new Operators.Repeat(_this.editor, _this);
          };
        })(this),
        'repeat-search': (function(_this) {
          return function(e) {
            return new Motions.RepeatSearch(_this.editor, _this);
          };
        })(this),
        'repeat-search-backwards': (function(_this) {
          return function(e) {
            return new Motions.RepeatSearch(_this.editor, _this).reversed();
          };
        })(this),
        'move-to-mark': (function(_this) {
          return function(e) {
            return new Motions.MoveToMark(_this.editor, _this);
          };
        })(this),
        'move-to-mark-literal': (function(_this) {
          return function(e) {
            return new Motions.MoveToMark(_this.editor, _this, false);
          };
        })(this),
        'mark': (function(_this) {
          return function(e) {
            return new Operators.Mark(_this.editor, _this);
          };
        })(this),
        'find': (function(_this) {
          return function(e) {
            return new Motions.Find(_this.editor, _this);
          };
        })(this),
        'find-backwards': (function(_this) {
          return function(e) {
            return new Motions.Find(_this.editor, _this).reverse();
          };
        })(this),
        'till': (function(_this) {
          return function(e) {
            return new Motions.Till(_this.editor, _this);
          };
        })(this),
        'till-backwards': (function(_this) {
          return function(e) {
            return new Motions.Till(_this.editor, _this).reverse();
          };
        })(this),
        'repeat-find': (function(_this) {
          return function(e) {
            if (_this.globalVimState.currentFind) {
              return new _this.globalVimState.currentFind.constructor(_this.editor, _this, {
                repeated: true
              });
            }
          };
        })(this),
        'repeat-find-reverse': (function(_this) {
          return function(e) {
            if (_this.globalVimState.currentFind) {
              return new _this.globalVimState.currentFind.constructor(_this.editor, _this, {
                repeated: true,
                reverse: true
              });
            }
          };
        })(this),
        'replace': (function(_this) {
          return function(e) {
            return new Operators.Replace(_this.editor, _this);
          };
        })(this),
        'search': (function(_this) {
          return function(e) {
            return new Motions.Search(_this.editor, _this);
          };
        })(this),
        'reverse-search': (function(_this) {
          return function(e) {
            return (new Motions.Search(_this.editor, _this)).reversed();
          };
        })(this),
        'search-current-word': (function(_this) {
          return function(e) {
            return new Motions.SearchCurrentWord(_this.editor, _this);
          };
        })(this),
        'bracket-matching-motion': (function(_this) {
          return function(e) {
            return new Motions.BracketMatchingMotion(_this.editor, _this);
          };
        })(this),
        'reverse-search-current-word': (function(_this) {
          return function(e) {
            return (new Motions.SearchCurrentWord(_this.editor, _this)).reversed();
          };
        })(this)
      });
    };

    VimState.prototype.registerCommands = function(commands) {
      var commandName, fn, _results;
      _results = [];
      for (commandName in commands) {
        fn = commands[commandName];
        _results.push((function(_this) {
          return function(fn) {
            return _this.subscriptions.add(atom.commands.add(_this.editorElement, "vim-mode:" + commandName, fn));
          };
        })(this)(fn));
      }
      return _results;
    };

    VimState.prototype.registerOperationCommands = function(operationCommands) {
      var commandName, commands, operationFn, _fn;
      commands = {};
      _fn = (function(_this) {
        return function(operationFn) {
          return commands[commandName] = function(event) {
            return _this.pushOperations(operationFn(event));
          };
        };
      })(this);
      for (commandName in operationCommands) {
        operationFn = operationCommands[commandName];
        _fn(operationFn);
      }
      return this.registerCommands(commands);
    };

    VimState.prototype.pushOperations = function(operations) {
      var operation, topOp, _i, _len, _results;
      if (operations == null) {
        return;
      }
      if (!_.isArray(operations)) {
        operations = [operations];
      }
      _results = [];
      for (_i = 0, _len = operations.length; _i < _len; _i++) {
        operation = operations[_i];
        if (this.mode === 'visual' && (operation instanceof Motions.Motion || operation instanceof TextObjects.TextObject)) {
          operation.execute = operation.select;
        }
        if (((topOp = this.topOperation()) != null) && (topOp.canComposeWith != null) && !topOp.canComposeWith(operation)) {
          this.resetNormalMode();
          this.emitter.emit('failed-to-compose');
          break;
        }
        this.opStack.push(operation);
        if (this.mode === 'visual' && operation instanceof Operators.Operator) {
          this.opStack.push(new Motions.CurrentSelection(this.editor, this));
        }
        _results.push(this.processOpStack());
      }
      return _results;
    };

    VimState.prototype.onDidFailToCompose = function(fn) {
      return this.emitter.on('failed-to-compose', fn);
    };

    VimState.prototype.onDidDestroy = function(fn) {
      return this.emitter.on('did-destroy', fn);
    };

    VimState.prototype.clearOpStack = function() {
      return this.opStack = [];
    };

    VimState.prototype.undo = function() {
      this.editor.undo();
      return this.activateNormalMode();
    };

    VimState.prototype.processOpStack = function() {
      var e, poppedOperation;
      if (!(this.opStack.length > 0)) {
        return;
      }
      if (!this.topOperation().isComplete()) {
        if (this.mode === 'normal' && this.topOperation() instanceof Operators.Operator) {
          this.activateOperatorPendingMode();
        }
        return;
      }
      poppedOperation = this.opStack.pop();
      if (this.opStack.length) {
        try {
          this.topOperation().compose(poppedOperation);
          return this.processOpStack();
        } catch (_error) {
          e = _error;
          if ((e instanceof Operators.OperatorError) || (e instanceof Motions.MotionError)) {
            return this.resetNormalMode();
          } else {
            throw e;
          }
        }
      } else {
        if (poppedOperation.isRecordable()) {
          this.history.unshift(poppedOperation);
        }
        return poppedOperation.execute();
      }
    };

    VimState.prototype.topOperation = function() {
      return _.last(this.opStack);
    };

    VimState.prototype.getRegister = function(name) {
      var text, type;
      if (name === '"') {
        name = settings.defaultRegister();
      }
      if (name === '*' || name === '+') {
        text = atom.clipboard.read();
        type = Utils.copyType(text);
        return {
          text: text,
          type: type
        };
      } else if (name === '%') {
        text = this.editor.getURI();
        type = Utils.copyType(text);
        return {
          text: text,
          type: type
        };
      } else if (name === "_") {
        text = '';
        type = Utils.copyType(text);
        return {
          text: text,
          type: type
        };
      } else {
        return this.globalVimState.registers[name.toLowerCase()];
      }
    };

    VimState.prototype.getMark = function(name) {
      if (this.marks[name]) {
        return this.marks[name].getBufferRange().start;
      } else {
        return void 0;
      }
    };

    VimState.prototype.setRegister = function(name, value) {
      if (name === '"') {
        name = settings.defaultRegister();
      }
      if (name === '*' || name === '+') {
        return atom.clipboard.write(value.text);
      } else if (name === '_') {

      } else if (/^[A-Z]$/.test(name)) {
        return this.appendRegister(name.toLowerCase(), value);
      } else {
        return this.globalVimState.registers[name] = value;
      }
    };

    VimState.prototype.appendRegister = function(name, value) {
      var register, _base;
      register = (_base = this.globalVimState.registers)[name] != null ? _base[name] : _base[name] = {
        type: 'character',
        text: ""
      };
      if (register.type === 'linewise' && value.type !== 'linewise') {
        return register.text += value.text + '\n';
      } else if (register.type !== 'linewise' && value.type === 'linewise') {
        register.text += '\n' + value.text;
        return register.type = 'linewise';
      } else {
        return register.text += value.text;
      }
    };

    VimState.prototype.setMark = function(name, pos) {
      var charCode, marker;
      if ((charCode = name.charCodeAt(0)) >= 96 && charCode <= 122) {
        marker = this.editor.markBufferRange(new Range(pos, pos), {
          invalidate: 'never',
          persistent: false
        });
        return this.marks[name] = marker;
      }
    };

    VimState.prototype.pushSearchHistory = function(search) {
      return this.globalVimState.searchHistory.unshift(search);
    };

    VimState.prototype.getSearchHistoryItem = function(index) {
      if (index == null) {
        index = 0;
      }
      return this.globalVimState.searchHistory[index];
    };

    VimState.prototype.activateNormalMode = function() {
      var selection, _i, _len, _ref2;
      this.deactivateInsertMode();
      this.deactivateVisualMode();
      this.mode = 'normal';
      this.submode = null;
      this.changeModeClass('normal-mode');
      this.clearOpStack();
      _ref2 = this.editor.getSelections();
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        selection = _ref2[_i];
        selection.clear({
          autoscroll: false
        });
      }
      this.ensureCursorsWithinLine();
      return this.updateStatusBar();
    };

    VimState.prototype.activateCommandMode = function() {
      Grim.deprecate("Use ::activateNormalMode instead");
      return this.activateNormalMode();
    };

    VimState.prototype.activateInsertMode = function(subtype) {
      if (subtype == null) {
        subtype = null;
      }
      this.mode = 'insert';
      this.editorElement.component.setInputEnabled(true);
      this.setInsertionCheckpoint();
      this.submode = subtype;
      this.changeModeClass('insert-mode');
      return this.updateStatusBar();
    };

    VimState.prototype.activateReplaceMode = function() {
      this.activateInsertMode('replace');
      this.replaceModeCounter = 0;
      this.editorElement.classList.add('replace-mode');
      this.subscriptions.add(this.replaceModeListener = this.editor.onWillInsertText(this.replaceModeInsertHandler));
      return this.subscriptions.add(this.replaceModeUndoListener = this.editor.onDidInsertText(this.replaceModeUndoHandler));
    };

    VimState.prototype.replaceModeInsertHandler = function(event) {
      var char, chars, selection, selections, _i, _j, _len, _len1, _ref2;
      chars = ((_ref2 = event.text) != null ? _ref2.split('') : void 0) || [];
      selections = this.editor.getSelections();
      for (_i = 0, _len = chars.length; _i < _len; _i++) {
        char = chars[_i];
        if (char === '\n') {
          continue;
        }
        for (_j = 0, _len1 = selections.length; _j < _len1; _j++) {
          selection = selections[_j];
          if (!selection.cursor.isAtEndOfLine()) {
            selection["delete"]();
          }
        }
      }
    };

    VimState.prototype.replaceModeUndoHandler = function(event) {
      return this.replaceModeCounter++;
    };

    VimState.prototype.replaceModeUndo = function() {
      if (this.replaceModeCounter > 0) {
        this.editor.undo();
        this.editor.undo();
        this.editor.moveLeft();
        return this.replaceModeCounter--;
      }
    };

    VimState.prototype.setInsertionCheckpoint = function() {
      if (this.insertionCheckpoint == null) {
        return this.insertionCheckpoint = this.editor.createCheckpoint();
      }
    };

    VimState.prototype.deactivateInsertMode = function() {
      var changes, cursor, item, _i, _len, _ref2, _ref3;
      if ((_ref2 = this.mode) !== null && _ref2 !== 'insert') {
        return;
      }
      this.editorElement.component.setInputEnabled(false);
      this.editorElement.classList.remove('replace-mode');
      this.editor.groupChangesSinceCheckpoint(this.insertionCheckpoint);
      changes = this.editor.buffer.getChangesSinceCheckpoint(this.insertionCheckpoint);
      item = this.inputOperator(this.history[0]);
      this.insertionCheckpoint = null;
      if (item != null) {
        item.confirmChanges(changes);
      }
      _ref3 = this.editor.getCursors();
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        cursor = _ref3[_i];
        if (!cursor.isAtBeginningOfLine()) {
          cursor.moveLeft();
        }
      }
      if (this.replaceModeListener != null) {
        this.replaceModeListener.dispose();
        this.subscriptions.remove(this.replaceModeListener);
        this.replaceModeListener = null;
        this.replaceModeUndoListener.dispose();
        this.subscriptions.remove(this.replaceModeUndoListener);
        return this.replaceModeUndoListener = null;
      }
    };

    VimState.prototype.deactivateVisualMode = function() {
      var selection, _i, _len, _ref2, _results;
      if (this.mode !== 'visual') {
        return;
      }
      _ref2 = this.editor.getSelections();
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        selection = _ref2[_i];
        if (!(selection.isEmpty() || selection.isReversed())) {
          _results.push(selection.cursor.moveLeft());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    VimState.prototype.inputOperator = function(item) {
      var _ref2;
      if (item == null) {
        return item;
      }
      if (typeof item.inputOperator === "function" ? item.inputOperator() : void 0) {
        return item;
      }
      if ((_ref2 = item.composedObject) != null ? typeof _ref2.inputOperator === "function" ? _ref2.inputOperator() : void 0 : void 0) {
        return item.composedObject;
      }
    };

    VimState.prototype.activateVisualMode = function(type) {
      var end, endRow, originalRange, row, selection, start, startRow, _i, _j, _k, _len, _len1, _ref2, _ref3, _ref4, _ref5, _ref6;
      if (this.mode === 'visual') {
        if (this.submode === type) {
          this.activateNormalMode();
          return;
        }
        this.submode = type;
        if (this.submode === 'linewise') {
          _ref2 = this.editor.getSelections();
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            selection = _ref2[_i];
            originalRange = selection.getBufferRange();
            selection.marker.setProperties({
              originalRange: originalRange
            });
            _ref3 = selection.getBufferRowRange(), start = _ref3[0], end = _ref3[1];
            for (row = _j = start; start <= end ? _j <= end : _j >= end; row = start <= end ? ++_j : --_j) {
              selection.selectLine(row);
            }
          }
        } else if ((_ref4 = this.submode) === 'characterwise' || _ref4 === 'blockwise') {
          _ref5 = this.editor.getSelections();
          for (_k = 0, _len1 = _ref5.length; _k < _len1; _k++) {
            selection = _ref5[_k];
            originalRange = selection.marker.getProperties().originalRange;
            if (originalRange) {
              _ref6 = selection.getBufferRowRange(), startRow = _ref6[0], endRow = _ref6[1];
              originalRange.start.row = startRow;
              originalRange.end.row = endRow;
              selection.setBufferRange(originalRange);
            }
          }
        }
      } else {
        this.deactivateInsertMode();
        this.mode = 'visual';
        this.submode = type;
        this.changeModeClass('visual-mode');
        if (this.submode === 'linewise') {
          this.editor.selectLinesContainingCursors();
        } else if (this.editor.getSelectedText() === '') {
          this.editor.selectRight();
        }
      }
      return this.updateStatusBar();
    };

    VimState.prototype.resetVisualMode = function() {
      return this.activateVisualMode(this.submode);
    };

    VimState.prototype.activateOperatorPendingMode = function() {
      this.deactivateInsertMode();
      this.mode = 'operator-pending';
      this.submode = null;
      this.changeModeClass('operator-pending-mode');
      return this.updateStatusBar();
    };

    VimState.prototype.changeModeClass = function(targetMode) {
      var mode, _i, _len, _ref2, _results;
      _ref2 = ['normal-mode', 'insert-mode', 'visual-mode', 'operator-pending-mode'];
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        mode = _ref2[_i];
        if (mode === targetMode) {
          _results.push(this.editorElement.classList.add(mode));
        } else {
          _results.push(this.editorElement.classList.remove(mode));
        }
      }
      return _results;
    };

    VimState.prototype.resetNormalMode = function() {
      this.clearOpStack();
      this.editor.clearSelections();
      return this.activateNormalMode();
    };

    VimState.prototype.registerPrefix = function(e) {
      return new Prefixes.Register(this.registerName(e));
    };

    VimState.prototype.registerName = function(e) {
      var keyboardEvent, name, _ref2, _ref3;
      keyboardEvent = (_ref2 = (_ref3 = e.originalEvent) != null ? _ref3.originalEvent : void 0) != null ? _ref2 : e.originalEvent;
      name = atom.keymaps.keystrokeForKeyboardEvent(keyboardEvent);
      if (name.lastIndexOf('shift-', 0) === 0) {
        name = name.slice(6);
      }
      return name;
    };

    VimState.prototype.repeatPrefix = function(e) {
      var keyboardEvent, num, _ref2, _ref3;
      keyboardEvent = (_ref2 = (_ref3 = e.originalEvent) != null ? _ref3.originalEvent : void 0) != null ? _ref2 : e.originalEvent;
      num = parseInt(atom.keymaps.keystrokeForKeyboardEvent(keyboardEvent));
      if (this.topOperation() instanceof Prefixes.Repeat) {
        return this.topOperation().addDigit(num);
      } else {
        if (num === 0) {
          return e.abortKeyBinding();
        } else {
          return this.pushOperations(new Prefixes.Repeat(num));
        }
      }
    };

    VimState.prototype.reverseSelections = function() {
      var reversed, selection, _i, _len, _ref2, _results;
      reversed = !this.editor.getLastSelection().isReversed();
      _ref2 = this.editor.getSelections();
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        selection = _ref2[_i];
        _results.push(selection.setBufferRange(selection.getBufferRange(), {
          reversed: reversed
        }));
      }
      return _results;
    };

    VimState.prototype.moveOrRepeat = function(e) {
      if (this.topOperation() instanceof Prefixes.Repeat) {
        this.repeatPrefix(e);
        return null;
      } else {
        return new Motions.MoveToBeginningOfLine(this.editor, this);
      }
    };

    VimState.prototype.linewiseAliasedOperator = function(constructor) {
      if (this.isOperatorPending(constructor)) {
        return new Motions.MoveToRelativeLine(this.editor, this);
      } else {
        return new constructor(this.editor, this);
      }
    };

    VimState.prototype.isOperatorPending = function(constructor) {
      var op, _i, _len, _ref2;
      if (constructor != null) {
        _ref2 = this.opStack;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          op = _ref2[_i];
          if (op instanceof constructor) {
            return op;
          }
        }
        return false;
      } else {
        return this.opStack.length > 0;
      }
    };

    VimState.prototype.updateStatusBar = function() {
      return this.statusBarManager.update(this.mode, this.submode);
    };

    VimState.prototype.insertRegister = function(name) {
      var text, _ref2;
      text = (_ref2 = this.getRegister(name)) != null ? _ref2.text : void 0;
      if (text != null) {
        return this.editor.insertText(text);
      }
    };

    VimState.prototype.checkSelections = function() {
      if (this.editor == null) {
        return;
      }
      if (this.editor.getSelections().every(function(selection) {
        return selection.isEmpty();
      })) {
        if (this.mode === 'normal') {
          this.ensureCursorsWithinLine();
        }
        if (this.mode === 'visual') {
          return this.activateNormalMode();
        }
      } else {
        if (this.mode === 'normal') {
          return this.activateVisualMode('characterwise');
        }
      }
    };

    VimState.prototype.ensureCursorsWithinLine = function() {
      var cursor, goalColumn, _i, _len, _ref2;
      _ref2 = this.editor.getCursors();
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        cursor = _ref2[_i];
        goalColumn = cursor.goalColumn;
        if (cursor.isAtEndOfLine() && !cursor.isAtBeginningOfLine()) {
          cursor.moveLeft();
        }
        cursor.goalColumn = goalColumn;
      }
      return this.editor.mergeCursors();
    };

    return VimState;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUvbGliL3ZpbS1zdGF0ZS5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsc0tBQUE7SUFBQSxrRkFBQTs7QUFBQSxFQUFBLElBQUEsR0FBUSxPQUFBLENBQVEsTUFBUixDQUFSLENBQUE7O0FBQUEsRUFDQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBREosQ0FBQTs7QUFBQSxFQUVBLE9BQWlCLE9BQUEsQ0FBUSxNQUFSLENBQWpCLEVBQUMsYUFBQSxLQUFELEVBQVEsYUFBQSxLQUZSLENBQUE7O0FBQUEsRUFHQSxRQUE2QyxPQUFBLENBQVEsV0FBUixDQUE3QyxFQUFDLGdCQUFBLE9BQUQsRUFBVSxtQkFBQSxVQUFWLEVBQXNCLDRCQUFBLG1CQUh0QixDQUFBOztBQUFBLEVBSUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBSlgsQ0FBQTs7QUFBQSxFQU1BLFNBQUEsR0FBWSxPQUFBLENBQVEsbUJBQVIsQ0FOWixDQUFBOztBQUFBLEVBT0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLENBUFgsQ0FBQTs7QUFBQSxFQVFBLE9BQUEsR0FBVSxPQUFBLENBQVEsaUJBQVIsQ0FSVixDQUFBOztBQUFBLEVBU0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBVGIsQ0FBQTs7QUFBQSxFQVdBLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVIsQ0FYZCxDQUFBOztBQUFBLEVBWUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSLENBWlIsQ0FBQTs7QUFBQSxFQWFBLE1BQUEsR0FBUyxPQUFBLENBQVEsVUFBUixDQWJULENBQUE7O0FBQUEsRUFlQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osdUJBQUEsTUFBQSxHQUFRLElBQVIsQ0FB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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/vim-mode/lib/vim-state.coffee
