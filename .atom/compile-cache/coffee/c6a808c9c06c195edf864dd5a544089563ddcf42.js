(function() {
  var AutoFlow, AutoIndent, Base, BufferedProcess, CamelCase, ChangeOrder, ChangeSurround, ChangeSurroundAnyPair, ChangeSurroundAnyPairAllowForwarding, CompactSpaces, ConvertToHardTab, ConvertToSoftTab, DashCase, DecodeUriComponent, DeleteSurround, DeleteSurroundAnyPair, DeleteSurroundAnyPairAllowForwarding, EncodeUriComponent, Indent, Join, JoinBase, JoinByInput, JoinByInputWithKeepingSpace, JoinWithKeepingSpace, LineEndingRegExp, LowerCase, MapSurround, Operator, Outdent, PascalCase, Range, RemoveLeadingWhiteSpaces, Replace, ReplaceCharacter, ReplaceWithRegister, Reverse, SnakeCase, Sort, SortByNumber, SortCaseInsensitively, SplitByCharacter, SplitString, SplitStringWithKeepingSplitter, Surround, SurroundBase, SurroundSmartWord, SurroundWord, SwapWithRegister, TitleCase, ToggleCase, ToggleCaseAndMoveRight, ToggleLineComments, TransformSmartWordBySelectList, TransformString, TransformStringByExternalCommand, TransformStringBySelectList, TransformWordBySelectList, TrimString, UpperCase, _, isLinewiseRange, isSingleLineText, limitNumber, ref, ref1, splitTextByNewLine, swrap, toggleCaseForCharacter,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    modulo = function(a, b) { return (+a % (b = +b) + b) % b; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    slice = [].slice;

  LineEndingRegExp = /(?:\n|\r\n)$/;

  _ = require('underscore-plus');

  ref = require('atom'), BufferedProcess = ref.BufferedProcess, Range = ref.Range;

  ref1 = require('./utils'), isSingleLineText = ref1.isSingleLineText, isLinewiseRange = ref1.isLinewiseRange, limitNumber = ref1.limitNumber, toggleCaseForCharacter = ref1.toggleCaseForCharacter, splitTextByNewLine = ref1.splitTextByNewLine;

  swrap = require('./selection-wrapper');

  Base = require('./base');

  Operator = Base.getClass('Operator');

  TransformString = (function(superClass) {
    extend(TransformString, superClass);

    function TransformString() {
      return TransformString.__super__.constructor.apply(this, arguments);
    }

    TransformString.extend(false);

    TransformString.prototype.trackChange = true;

    TransformString.prototype.stayOptionName = 'stayOnTransformString';

    TransformString.prototype.autoIndent = false;

    TransformString.prototype.autoIndentNewline = false;

    TransformString.stringTransformers = [];

    TransformString.registerToSelectList = function() {
      return this.stringTransformers.push(this);
    };

    TransformString.prototype.mutateSelection = function(selection) {
      var text;
      if (text = this.getNewText(selection.getText(), selection)) {
        return selection.insertText(text, {
          autoIndent: this.autoIndent
        });
      }
    };

    return TransformString;

  })(Operator);

  ToggleCase = (function(superClass) {
    extend(ToggleCase, superClass);

    function ToggleCase() {
      return ToggleCase.__super__.constructor.apply(this, arguments);
    }

    ToggleCase.extend();

    ToggleCase.registerToSelectList();

    ToggleCase.description = "`Hello World` -> `hELLO wORLD`";

    ToggleCase.prototype.displayName = 'Toggle ~';

    ToggleCase.prototype.getNewText = function(text) {
      return text.replace(/./g, toggleCaseForCharacter);
    };

    return ToggleCase;

  })(TransformString);

  ToggleCaseAndMoveRight = (function(superClass) {
    extend(ToggleCaseAndMoveRight, superClass);

    function ToggleCaseAndMoveRight() {
      return ToggleCaseAndMoveRight.__super__.constructor.apply(this, arguments);
    }

    ToggleCaseAndMoveRight.extend();

    ToggleCaseAndMoveRight.prototype.flashTarget = false;

    ToggleCaseAndMoveRight.prototype.restorePositions = false;

    ToggleCaseAndMoveRight.prototype.target = 'MoveRight';

    return ToggleCaseAndMoveRight;

  })(ToggleCase);

  UpperCase = (function(superClass) {
    extend(UpperCase, superClass);

    function UpperCase() {
      return UpperCase.__super__.constructor.apply(this, arguments);
    }

    UpperCase.extend();

    UpperCase.registerToSelectList();

    UpperCase.description = "`Hello World` -> `HELLO WORLD`";

    UpperCase.prototype.displayName = 'Upper';

    UpperCase.prototype.getNewText = function(text) {
      return text.toUpperCase();
    };

    return UpperCase;

  })(TransformString);

  LowerCase = (function(superClass) {
    extend(LowerCase, superClass);

    function LowerCase() {
      return LowerCase.__super__.constructor.apply(this, arguments);
    }

    LowerCase.extend();

    LowerCase.registerToSelectList();

    LowerCase.description = "`Hello World` -> `hello world`";

    LowerCase.prototype.displayName = 'Lower';

    LowerCase.prototype.getNewText = function(text) {
      return text.toLowerCase();
    };

    return LowerCase;

  })(TransformString);

  Replace = (function(superClass) {
    extend(Replace, superClass);

    function Replace() {
      return Replace.__super__.constructor.apply(this, arguments);
    }

    Replace.extend();

    Replace.prototype.input = null;

    Replace.prototype.flashCheckpoint = 'did-select-occurrence';

    Replace.prototype.requireInput = true;

    Replace.prototype.autoIndentNewline = true;

    Replace.prototype.supportEarlySelect = true;

    Replace.prototype.initialize = function() {
      this.onDidSelectTarget((function(_this) {
        return function() {
          return _this.focusInput(1, true);
        };
      })(this));
      return Replace.__super__.initialize.apply(this, arguments);
    };

    Replace.prototype.getNewText = function(text) {
      var input;
      if (this.target.is('MoveRightBufferColumn') && text.length !== this.getCount()) {
        return;
      }
      input = this.input || "\n";
      if (input === "\n") {
        this.restorePositions = false;
      }
      return text.replace(/./g, input);
    };

    return Replace;

  })(TransformString);

  ReplaceCharacter = (function(superClass) {
    extend(ReplaceCharacter, superClass);

    function ReplaceCharacter() {
      return ReplaceCharacter.__super__.constructor.apply(this, arguments);
    }

    ReplaceCharacter.extend();

    ReplaceCharacter.prototype.target = "MoveRightBufferColumn";

    return ReplaceCharacter;

  })(Replace);

  SplitByCharacter = (function(superClass) {
    extend(SplitByCharacter, superClass);

    function SplitByCharacter() {
      return SplitByCharacter.__super__.constructor.apply(this, arguments);
    }

    SplitByCharacter.extend();

    SplitByCharacter.registerToSelectList();

    SplitByCharacter.prototype.getNewText = function(text) {
      return text.split('').join(' ');
    };

    return SplitByCharacter;

  })(TransformString);

  CamelCase = (function(superClass) {
    extend(CamelCase, superClass);

    function CamelCase() {
      return CamelCase.__super__.constructor.apply(this, arguments);
    }

    CamelCase.extend();

    CamelCase.registerToSelectList();

    CamelCase.prototype.displayName = 'Camelize';

    CamelCase.description = "`hello-world` -> `helloWorld`";

    CamelCase.prototype.getNewText = function(text) {
      return _.camelize(text);
    };

    return CamelCase;

  })(TransformString);

  SnakeCase = (function(superClass) {
    extend(SnakeCase, superClass);

    function SnakeCase() {
      return SnakeCase.__super__.constructor.apply(this, arguments);
    }

    SnakeCase.extend();

    SnakeCase.registerToSelectList();

    SnakeCase.description = "`HelloWorld` -> `hello_world`";

    SnakeCase.prototype.displayName = 'Underscore _';

    SnakeCase.prototype.getNewText = function(text) {
      return _.underscore(text);
    };

    return SnakeCase;

  })(TransformString);

  PascalCase = (function(superClass) {
    extend(PascalCase, superClass);

    function PascalCase() {
      return PascalCase.__super__.constructor.apply(this, arguments);
    }

    PascalCase.extend();

    PascalCase.registerToSelectList();

    PascalCase.description = "`hello_world` -> `HelloWorld`";

    PascalCase.prototype.displayName = 'Pascalize';

    PascalCase.prototype.getNewText = function(text) {
      return _.capitalize(_.camelize(text));
    };

    return PascalCase;

  })(TransformString);

  DashCase = (function(superClass) {
    extend(DashCase, superClass);

    function DashCase() {
      return DashCase.__super__.constructor.apply(this, arguments);
    }

    DashCase.extend();

    DashCase.registerToSelectList();

    DashCase.prototype.displayName = 'Dasherize -';

    DashCase.description = "HelloWorld -> hello-world";

    DashCase.prototype.getNewText = function(text) {
      return _.dasherize(text);
    };

    return DashCase;

  })(TransformString);

  TitleCase = (function(superClass) {
    extend(TitleCase, superClass);

    function TitleCase() {
      return TitleCase.__super__.constructor.apply(this, arguments);
    }

    TitleCase.extend();

    TitleCase.registerToSelectList();

    TitleCase.description = "`HelloWorld` -> `Hello World`";

    TitleCase.prototype.displayName = 'Titlize';

    TitleCase.prototype.getNewText = function(text) {
      return _.humanizeEventName(_.dasherize(text));
    };

    return TitleCase;

  })(TransformString);

  EncodeUriComponent = (function(superClass) {
    extend(EncodeUriComponent, superClass);

    function EncodeUriComponent() {
      return EncodeUriComponent.__super__.constructor.apply(this, arguments);
    }

    EncodeUriComponent.extend();

    EncodeUriComponent.registerToSelectList();

    EncodeUriComponent.description = "`Hello World` -> `Hello%20World`";

    EncodeUriComponent.prototype.displayName = 'Encode URI Component %';

    EncodeUriComponent.prototype.getNewText = function(text) {
      return encodeURIComponent(text);
    };

    return EncodeUriComponent;

  })(TransformString);

  DecodeUriComponent = (function(superClass) {
    extend(DecodeUriComponent, superClass);

    function DecodeUriComponent() {
      return DecodeUriComponent.__super__.constructor.apply(this, arguments);
    }

    DecodeUriComponent.extend();

    DecodeUriComponent.registerToSelectList();

    DecodeUriComponent.description = "`Hello%20World` -> `Hello World`";

    DecodeUriComponent.prototype.displayName = 'Decode URI Component %%';

    DecodeUriComponent.prototype.getNewText = function(text) {
      return decodeURIComponent(text);
    };

    return DecodeUriComponent;

  })(TransformString);

  TrimString = (function(superClass) {
    extend(TrimString, superClass);

    function TrimString() {
      return TrimString.__super__.constructor.apply(this, arguments);
    }

    TrimString.extend();

    TrimString.registerToSelectList();

    TrimString.description = "` hello ` -> `hello`";

    TrimString.prototype.displayName = 'Trim string';

    TrimString.prototype.getNewText = function(text) {
      return text.trim();
    };

    return TrimString;

  })(TransformString);

  CompactSpaces = (function(superClass) {
    extend(CompactSpaces, superClass);

    function CompactSpaces() {
      return CompactSpaces.__super__.constructor.apply(this, arguments);
    }

    CompactSpaces.extend();

    CompactSpaces.registerToSelectList();

    CompactSpaces.description = "`  a    b    c` -> `a b c`";

    CompactSpaces.prototype.displayName = 'Compact space';

    CompactSpaces.prototype.getNewText = function(text) {
      if (text.match(/^[ ]+$/)) {
        return ' ';
      } else {
        return text.replace(/^(\s*)(.*?)(\s*)$/gm, function(m, leading, middle, trailing) {
          return leading + middle.split(/[ \t]+/).join(' ') + trailing;
        });
      }
    };

    return CompactSpaces;

  })(TransformString);

  RemoveLeadingWhiteSpaces = (function(superClass) {
    extend(RemoveLeadingWhiteSpaces, superClass);

    function RemoveLeadingWhiteSpaces() {
      return RemoveLeadingWhiteSpaces.__super__.constructor.apply(this, arguments);
    }

    RemoveLeadingWhiteSpaces.extend();

    RemoveLeadingWhiteSpaces.registerToSelectList();

    RemoveLeadingWhiteSpaces.prototype.wise = 'linewise';

    RemoveLeadingWhiteSpaces.description = "`  a b c` -> `a b c`";

    RemoveLeadingWhiteSpaces.prototype.getNewText = function(text, selection) {
      var trimLeft;
      trimLeft = function(text) {
        return text.trimLeft();
      };
      return splitTextByNewLine(text).map(trimLeft).join("\n") + "\n";
    };

    return RemoveLeadingWhiteSpaces;

  })(TransformString);

  ConvertToSoftTab = (function(superClass) {
    extend(ConvertToSoftTab, superClass);

    function ConvertToSoftTab() {
      return ConvertToSoftTab.__super__.constructor.apply(this, arguments);
    }

    ConvertToSoftTab.extend();

    ConvertToSoftTab.registerToSelectList();

    ConvertToSoftTab.prototype.displayName = 'Soft Tab';

    ConvertToSoftTab.prototype.wise = 'linewise';

    ConvertToSoftTab.prototype.mutateSelection = function(selection) {
      return this.scanForward(/\t/g, {
        scanRange: selection.getBufferRange()
      }, (function(_this) {
        return function(arg) {
          var length, range, replace;
          range = arg.range, replace = arg.replace;
          length = _this.editor.screenRangeForBufferRange(range).getExtent().column;
          return replace(" ".repeat(length));
        };
      })(this));
    };

    return ConvertToSoftTab;

  })(TransformString);

  ConvertToHardTab = (function(superClass) {
    extend(ConvertToHardTab, superClass);

    function ConvertToHardTab() {
      return ConvertToHardTab.__super__.constructor.apply(this, arguments);
    }

    ConvertToHardTab.extend();

    ConvertToHardTab.registerToSelectList();

    ConvertToHardTab.prototype.displayName = 'Hard Tab';

    ConvertToHardTab.prototype.mutateSelection = function(selection) {
      var tabLength;
      tabLength = this.editor.getTabLength();
      return this.scanForward(/[ \t]+/g, {
        scanRange: selection.getBufferRange()
      }, (function(_this) {
        return function(arg) {
          var end, endColumn, newText, nextTabStop, range, ref2, remainder, replace, start, startColumn;
          range = arg.range, replace = arg.replace;
          ref2 = _this.editor.screenRangeForBufferRange(range), start = ref2.start, end = ref2.end;
          startColumn = start.column;
          endColumn = end.column;
          newText = '';
          while (true) {
            remainder = modulo(startColumn, tabLength);
            nextTabStop = startColumn + (remainder === 0 ? tabLength : remainder);
            if (nextTabStop > endColumn) {
              newText += " ".repeat(endColumn - startColumn);
            } else {
              newText += "\t";
            }
            startColumn = nextTabStop;
            if (startColumn >= endColumn) {
              break;
            }
          }
          return replace(newText);
        };
      })(this));
    };

    return ConvertToHardTab;

  })(TransformString);

  TransformStringByExternalCommand = (function(superClass) {
    extend(TransformStringByExternalCommand, superClass);

    function TransformStringByExternalCommand() {
      return TransformStringByExternalCommand.__super__.constructor.apply(this, arguments);
    }

    TransformStringByExternalCommand.extend(false);

    TransformStringByExternalCommand.prototype.autoIndent = true;

    TransformStringByExternalCommand.prototype.command = '';

    TransformStringByExternalCommand.prototype.args = [];

    TransformStringByExternalCommand.prototype.stdoutBySelection = null;

    TransformStringByExternalCommand.prototype.execute = function() {
      this.normalizeSelectionsIfNecessary();
      if (this.selectTarget()) {
        return new Promise((function(_this) {
          return function(resolve) {
            return _this.collect(resolve);
          };
        })(this)).then((function(_this) {
          return function() {
            var i, len, ref2, selection, text;
            ref2 = _this.editor.getSelections();
            for (i = 0, len = ref2.length; i < len; i++) {
              selection = ref2[i];
              text = _this.getNewText(selection.getText(), selection);
              selection.insertText(text, {
                autoIndent: _this.autoIndent
              });
            }
            _this.restoreCursorPositionsIfNecessary();
            return _this.activateMode(_this.finalMode, _this.finalSubmode);
          };
        })(this));
      }
    };

    TransformStringByExternalCommand.prototype.collect = function(resolve) {
      var args, command, fn, i, len, processFinished, processRunning, ref2, ref3, ref4, selection;
      this.stdoutBySelection = new Map;
      processRunning = processFinished = 0;
      ref2 = this.editor.getSelections();
      fn = (function(_this) {
        return function(selection) {
          var exit, stdin, stdout;
          stdin = _this.getStdin(selection);
          stdout = function(output) {
            return _this.stdoutBySelection.set(selection, output);
          };
          exit = function(code) {
            processFinished++;
            if (processRunning === processFinished) {
              return resolve();
            }
          };
          return _this.runExternalCommand({
            command: command,
            args: args,
            stdout: stdout,
            exit: exit,
            stdin: stdin
          });
        };
      })(this);
      for (i = 0, len = ref2.length; i < len; i++) {
        selection = ref2[i];
        ref4 = (ref3 = this.getCommand(selection)) != null ? ref3 : {}, command = ref4.command, args = ref4.args;
        if (!((command != null) && (args != null))) {
          return;
        }
        processRunning++;
        fn(selection);
      }
    };

    TransformStringByExternalCommand.prototype.runExternalCommand = function(options) {
      var bufferedProcess, stdin;
      stdin = options.stdin;
      delete options.stdin;
      bufferedProcess = new BufferedProcess(options);
      bufferedProcess.onWillThrowError((function(_this) {
        return function(arg) {
          var commandName, error, handle;
          error = arg.error, handle = arg.handle;
          if (error.code === 'ENOENT' && error.syscall.indexOf('spawn') === 0) {
            commandName = _this.constructor.getCommandName();
            console.log(commandName + ": Failed to spawn command " + error.path + ".");
            handle();
          }
          return _this.cancelOperation();
        };
      })(this));
      if (stdin) {
        bufferedProcess.process.stdin.write(stdin);
        return bufferedProcess.process.stdin.end();
      }
    };

    TransformStringByExternalCommand.prototype.getNewText = function(text, selection) {
      var ref2;
      return (ref2 = this.getStdout(selection)) != null ? ref2 : text;
    };

    TransformStringByExternalCommand.prototype.getCommand = function(selection) {
      return {
        command: this.command,
        args: this.args
      };
    };

    TransformStringByExternalCommand.prototype.getStdin = function(selection) {
      return selection.getText();
    };

    TransformStringByExternalCommand.prototype.getStdout = function(selection) {
      return this.stdoutBySelection.get(selection);
    };

    return TransformStringByExternalCommand;

  })(TransformString);

  TransformStringBySelectList = (function(superClass) {
    extend(TransformStringBySelectList, superClass);

    function TransformStringBySelectList() {
      return TransformStringBySelectList.__super__.constructor.apply(this, arguments);
    }

    TransformStringBySelectList.extend();

    TransformStringBySelectList.description = "Interactively choose string transformation operator from select-list";

    TransformStringBySelectList.selectListItems = null;

    TransformStringBySelectList.prototype.requireInput = true;

    TransformStringBySelectList.prototype.getItems = function() {
      var base;
      return (base = this.constructor).selectListItems != null ? base.selectListItems : base.selectListItems = this.constructor.stringTransformers.map(function(klass) {
        var displayName;
        if (klass.prototype.hasOwnProperty('displayName')) {
          displayName = klass.prototype.displayName;
        } else {
          displayName = _.humanizeEventName(_.dasherize(klass.name));
        }
        return {
          name: klass,
          displayName: displayName
        };
      });
    };

    TransformStringBySelectList.prototype.initialize = function() {
      TransformStringBySelectList.__super__.initialize.apply(this, arguments);
      this.vimState.onDidConfirmSelectList((function(_this) {
        return function(item) {
          var transformer;
          transformer = item.name;
          if (transformer.prototype.target != null) {
            _this.target = transformer.prototype.target;
          }
          _this.vimState.reset();
          if (_this.target != null) {
            return _this.vimState.operationStack.run(transformer, {
              target: _this.target
            });
          } else {
            return _this.vimState.operationStack.run(transformer);
          }
        };
      })(this));
      return this.focusSelectList({
        items: this.getItems()
      });
    };

    TransformStringBySelectList.prototype.execute = function() {
      throw new Error(this.name + " should not be executed");
    };

    return TransformStringBySelectList;

  })(TransformString);

  TransformWordBySelectList = (function(superClass) {
    extend(TransformWordBySelectList, superClass);

    function TransformWordBySelectList() {
      return TransformWordBySelectList.__super__.constructor.apply(this, arguments);
    }

    TransformWordBySelectList.extend();

    TransformWordBySelectList.prototype.target = "InnerWord";

    return TransformWordBySelectList;

  })(TransformStringBySelectList);

  TransformSmartWordBySelectList = (function(superClass) {
    extend(TransformSmartWordBySelectList, superClass);

    function TransformSmartWordBySelectList() {
      return TransformSmartWordBySelectList.__super__.constructor.apply(this, arguments);
    }

    TransformSmartWordBySelectList.extend();

    TransformSmartWordBySelectList.description = "Transform InnerSmartWord by `transform-string-by-select-list`";

    TransformSmartWordBySelectList.prototype.target = "InnerSmartWord";

    return TransformSmartWordBySelectList;

  })(TransformStringBySelectList);

  ReplaceWithRegister = (function(superClass) {
    extend(ReplaceWithRegister, superClass);

    function ReplaceWithRegister() {
      return ReplaceWithRegister.__super__.constructor.apply(this, arguments);
    }

    ReplaceWithRegister.extend();

    ReplaceWithRegister.description = "Replace target with specified register value";

    ReplaceWithRegister.prototype.getNewText = function(text) {
      return this.vimState.register.getText();
    };

    return ReplaceWithRegister;

  })(TransformString);

  SwapWithRegister = (function(superClass) {
    extend(SwapWithRegister, superClass);

    function SwapWithRegister() {
      return SwapWithRegister.__super__.constructor.apply(this, arguments);
    }

    SwapWithRegister.extend();

    SwapWithRegister.description = "Swap register value with target";

    SwapWithRegister.prototype.getNewText = function(text, selection) {
      var newText;
      newText = this.vimState.register.getText();
      this.setTextToRegister(text, selection);
      return newText;
    };

    return SwapWithRegister;

  })(TransformString);

  Indent = (function(superClass) {
    extend(Indent, superClass);

    function Indent() {
      return Indent.__super__.constructor.apply(this, arguments);
    }

    Indent.extend();

    Indent.prototype.stayByMarker = true;

    Indent.prototype.setToFirstCharacterOnLinewise = true;

    Indent.prototype.wise = 'linewise';

    Indent.prototype.mutateSelection = function(selection) {
      var count, oldText;
      if (this.target.is('CurrentSelection')) {
        oldText = null;
        count = limitNumber(this.getCount(), {
          max: 100
        });
        return this.countTimes(count, (function(_this) {
          return function(arg) {
            var stop;
            stop = arg.stop;
            oldText = selection.getText();
            _this.indent(selection);
            if (selection.getText() === oldText) {
              return stop();
            }
          };
        })(this));
      } else {
        return this.indent(selection);
      }
    };

    Indent.prototype.indent = function(selection) {
      return selection.indentSelectedRows();
    };

    return Indent;

  })(TransformString);

  Outdent = (function(superClass) {
    extend(Outdent, superClass);

    function Outdent() {
      return Outdent.__super__.constructor.apply(this, arguments);
    }

    Outdent.extend();

    Outdent.prototype.indent = function(selection) {
      return selection.outdentSelectedRows();
    };

    return Outdent;

  })(Indent);

  AutoIndent = (function(superClass) {
    extend(AutoIndent, superClass);

    function AutoIndent() {
      return AutoIndent.__super__.constructor.apply(this, arguments);
    }

    AutoIndent.extend();

    AutoIndent.prototype.indent = function(selection) {
      return selection.autoIndentSelectedRows();
    };

    return AutoIndent;

  })(Indent);

  ToggleLineComments = (function(superClass) {
    extend(ToggleLineComments, superClass);

    function ToggleLineComments() {
      return ToggleLineComments.__super__.constructor.apply(this, arguments);
    }

    ToggleLineComments.extend();

    ToggleLineComments.prototype.stayByMarker = true;

    ToggleLineComments.prototype.wise = 'linewise';

    ToggleLineComments.prototype.mutateSelection = function(selection) {
      return selection.toggleLineComments();
    };

    return ToggleLineComments;

  })(TransformString);

  AutoFlow = (function(superClass) {
    extend(AutoFlow, superClass);

    function AutoFlow() {
      return AutoFlow.__super__.constructor.apply(this, arguments);
    }

    AutoFlow.extend();

    AutoFlow.prototype.mutateSelection = function(selection) {
      return atom.commands.dispatch(this.editorElement, 'autoflow:reflow-selection');
    };

    return AutoFlow;

  })(TransformString);

  SurroundBase = (function(superClass) {
    extend(SurroundBase, superClass);

    function SurroundBase() {
      return SurroundBase.__super__.constructor.apply(this, arguments);
    }

    SurroundBase.extend(false);

    SurroundBase.prototype.pairs = [['[', ']'], ['(', ')'], ['{', '}'], ['<', '>']];

    SurroundBase.prototype.pairCharsAllowForwarding = '[](){}';

    SurroundBase.prototype.input = null;

    SurroundBase.prototype.autoIndent = false;

    SurroundBase.prototype.requireInput = true;

    SurroundBase.prototype.supportEarlySelect = true;

    SurroundBase.prototype.focusInputForSurroundChar = function() {
      var inputUI;
      inputUI = this.newInputUI();
      inputUI.onDidConfirm(this.onConfirmSurroundChar.bind(this));
      inputUI.onDidCancel(this.cancelOperation.bind(this));
      return inputUI.focus(1, true);
    };

    SurroundBase.prototype.focusInputForTargetPairChar = function() {
      var inputUI;
      inputUI = this.newInputUI();
      inputUI.onDidConfirm(this.onConfirmTargetPairChar.bind(this));
      inputUI.onDidCancel(this.cancelOperation.bind(this));
      return inputUI.focus();
    };

    SurroundBase.prototype.getPair = function(char) {
      var pair;
      if (pair = _.detect(this.pairs, function(pair) {
        return indexOf.call(pair, char) >= 0;
      })) {
        return pair;
      } else {
        return [char, char];
      }
    };

    SurroundBase.prototype.surround = function(text, char, options) {
      var close, keepLayout, open, ref2, ref3;
      if (options == null) {
        options = {};
      }
      keepLayout = (ref2 = options.keepLayout) != null ? ref2 : false;
      ref3 = this.getPair(char), open = ref3[0], close = ref3[1];
      if ((!keepLayout) && LineEndingRegExp.test(text)) {
        this.autoIndent = true;
        open += "\n";
        close += "\n";
      }
      if (indexOf.call(this.getConfig('charactersToAddSpaceOnSurround'), char) >= 0 && isSingleLineText(text)) {
        text = ' ' + text + ' ';
      }
      return open + text + close;
    };

    SurroundBase.prototype.deleteSurround = function(text) {
      var close, i, innerText, open;
      open = text[0], innerText = 3 <= text.length ? slice.call(text, 1, i = text.length - 1) : (i = 1, []), close = text[i++];
      innerText = innerText.join('');
      if (isSingleLineText(text) && (open !== close)) {
        return innerText.trim();
      } else {
        return innerText;
      }
    };

    SurroundBase.prototype.onConfirmSurroundChar = function(input1) {
      this.input = input1;
      return this.processOperation();
    };

    SurroundBase.prototype.onConfirmTargetPairChar = function(char) {
      return this.setTarget(this["new"]('APair', {
        pair: this.getPair(char)
      }));
    };

    return SurroundBase;

  })(TransformString);

  Surround = (function(superClass) {
    extend(Surround, superClass);

    function Surround() {
      return Surround.__super__.constructor.apply(this, arguments);
    }

    Surround.extend();

    Surround.description = "Surround target by specified character like `(`, `[`, `\"`";

    Surround.prototype.initialize = function() {
      this.onDidSelectTarget(this.focusInputForSurroundChar.bind(this));
      return Surround.__super__.initialize.apply(this, arguments);
    };

    Surround.prototype.getNewText = function(text) {
      return this.surround(text, this.input);
    };

    return Surround;

  })(SurroundBase);

  SurroundWord = (function(superClass) {
    extend(SurroundWord, superClass);

    function SurroundWord() {
      return SurroundWord.__super__.constructor.apply(this, arguments);
    }

    SurroundWord.extend();

    SurroundWord.description = "Surround **word**";

    SurroundWord.prototype.target = 'InnerWord';

    return SurroundWord;

  })(Surround);

  SurroundSmartWord = (function(superClass) {
    extend(SurroundSmartWord, superClass);

    function SurroundSmartWord() {
      return SurroundSmartWord.__super__.constructor.apply(this, arguments);
    }

    SurroundSmartWord.extend();

    SurroundSmartWord.description = "Surround **smart-word**";

    SurroundSmartWord.prototype.target = 'InnerSmartWord';

    return SurroundSmartWord;

  })(Surround);

  MapSurround = (function(superClass) {
    extend(MapSurround, superClass);

    function MapSurround() {
      return MapSurround.__super__.constructor.apply(this, arguments);
    }

    MapSurround.extend();

    MapSurround.description = "Surround each word(`/\w+/`) within target";

    MapSurround.prototype.occurrence = true;

    MapSurround.prototype.patternForOccurrence = /\w+/g;

    return MapSurround;

  })(Surround);

  DeleteSurround = (function(superClass) {
    extend(DeleteSurround, superClass);

    function DeleteSurround() {
      return DeleteSurround.__super__.constructor.apply(this, arguments);
    }

    DeleteSurround.extend();

    DeleteSurround.description = "Delete specified surround character like `(`, `[`, `\"`";

    DeleteSurround.prototype.initialize = function() {
      if (this.target == null) {
        this.focusInputForTargetPairChar();
      }
      return DeleteSurround.__super__.initialize.apply(this, arguments);
    };

    DeleteSurround.prototype.onConfirmTargetPairChar = function(input) {
      DeleteSurround.__super__.onConfirmTargetPairChar.apply(this, arguments);
      this.input = input;
      return this.processOperation();
    };

    DeleteSurround.prototype.getNewText = function(text) {
      return this.deleteSurround(text);
    };

    return DeleteSurround;

  })(SurroundBase);

  DeleteSurroundAnyPair = (function(superClass) {
    extend(DeleteSurroundAnyPair, superClass);

    function DeleteSurroundAnyPair() {
      return DeleteSurroundAnyPair.__super__.constructor.apply(this, arguments);
    }

    DeleteSurroundAnyPair.extend();

    DeleteSurroundAnyPair.description = "Delete surround character by auto-detect paired char from cursor enclosed pair";

    DeleteSurroundAnyPair.prototype.target = 'AAnyPair';

    DeleteSurroundAnyPair.prototype.requireInput = false;

    return DeleteSurroundAnyPair;

  })(DeleteSurround);

  DeleteSurroundAnyPairAllowForwarding = (function(superClass) {
    extend(DeleteSurroundAnyPairAllowForwarding, superClass);

    function DeleteSurroundAnyPairAllowForwarding() {
      return DeleteSurroundAnyPairAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    DeleteSurroundAnyPairAllowForwarding.extend();

    DeleteSurroundAnyPairAllowForwarding.description = "Delete surround character by auto-detect paired char from cursor enclosed pair and forwarding pair within same line";

    DeleteSurroundAnyPairAllowForwarding.prototype.target = 'AAnyPairAllowForwarding';

    return DeleteSurroundAnyPairAllowForwarding;

  })(DeleteSurroundAnyPair);

  ChangeSurround = (function(superClass) {
    extend(ChangeSurround, superClass);

    function ChangeSurround() {
      return ChangeSurround.__super__.constructor.apply(this, arguments);
    }

    ChangeSurround.extend();

    ChangeSurround.description = "Change surround character, specify both from and to pair char";

    ChangeSurround.prototype.showDeleteCharOnHover = function() {
      var char;
      char = this.editor.getSelectedText()[0];
      return this.vimState.hover.set(char, this.vimState.getOriginalCursorPosition());
    };

    ChangeSurround.prototype.initialize = function() {
      if (this.target != null) {
        this.onDidFailSelectTarget(this.abort.bind(this));
      } else {
        this.onDidFailSelectTarget(this.cancelOperation.bind(this));
        this.focusInputForTargetPairChar();
      }
      ChangeSurround.__super__.initialize.apply(this, arguments);
      return this.onDidSelectTarget((function(_this) {
        return function() {
          _this.showDeleteCharOnHover();
          return _this.focusInputForSurroundChar();
        };
      })(this));
    };

    ChangeSurround.prototype.getNewText = function(text) {
      var innerText;
      innerText = this.deleteSurround(text);
      return this.surround(innerText, this.input, {
        keepLayout: true
      });
    };

    return ChangeSurround;

  })(SurroundBase);

  ChangeSurroundAnyPair = (function(superClass) {
    extend(ChangeSurroundAnyPair, superClass);

    function ChangeSurroundAnyPair() {
      return ChangeSurroundAnyPair.__super__.constructor.apply(this, arguments);
    }

    ChangeSurroundAnyPair.extend();

    ChangeSurroundAnyPair.description = "Change surround character, from char is auto-detected";

    ChangeSurroundAnyPair.prototype.target = "AAnyPair";

    return ChangeSurroundAnyPair;

  })(ChangeSurround);

  ChangeSurroundAnyPairAllowForwarding = (function(superClass) {
    extend(ChangeSurroundAnyPairAllowForwarding, superClass);

    function ChangeSurroundAnyPairAllowForwarding() {
      return ChangeSurroundAnyPairAllowForwarding.__super__.constructor.apply(this, arguments);
    }

    ChangeSurroundAnyPairAllowForwarding.extend();

    ChangeSurroundAnyPairAllowForwarding.description = "Change surround character, from char is auto-detected from enclosed and forwarding area";

    ChangeSurroundAnyPairAllowForwarding.prototype.target = "AAnyPairAllowForwarding";

    return ChangeSurroundAnyPairAllowForwarding;

  })(ChangeSurroundAnyPair);

  Join = (function(superClass) {
    extend(Join, superClass);

    function Join() {
      return Join.__super__.constructor.apply(this, arguments);
    }

    Join.extend();

    Join.prototype.target = "MoveToRelativeLine";

    Join.prototype.flashTarget = false;

    Join.prototype.restorePositions = false;

    Join.prototype.mutateSelection = function(selection) {
      var end, range;
      if (isLinewiseRange(range = selection.getBufferRange())) {
        selection.setBufferRange(range.translate([0, 0], [-1, 2e308]));
      }
      selection.joinLines();
      end = selection.getBufferRange().end;
      return selection.cursor.setBufferPosition(end.translate([0, -1]));
    };

    return Join;

  })(TransformString);

  JoinBase = (function(superClass) {
    extend(JoinBase, superClass);

    function JoinBase() {
      return JoinBase.__super__.constructor.apply(this, arguments);
    }

    JoinBase.extend(false);

    JoinBase.prototype.wise = 'linewise';

    JoinBase.prototype.trim = false;

    JoinBase.prototype.target = "MoveToRelativeLineMinimumOne";

    JoinBase.prototype.initialize = function() {
      if (this.requireInput) {
        this.focusInput(10);
      }
      return JoinBase.__super__.initialize.apply(this, arguments);
    };

    JoinBase.prototype.getNewText = function(text) {
      var pattern;
      if (this.trim) {
        pattern = /\r?\n[ \t]*/g;
      } else {
        pattern = /\r?\n/g;
      }
      return text.trimRight().replace(pattern, this.input) + "\n";
    };

    return JoinBase;

  })(TransformString);

  JoinWithKeepingSpace = (function(superClass) {
    extend(JoinWithKeepingSpace, superClass);

    function JoinWithKeepingSpace() {
      return JoinWithKeepingSpace.__super__.constructor.apply(this, arguments);
    }

    JoinWithKeepingSpace.extend();

    JoinWithKeepingSpace.registerToSelectList();

    JoinWithKeepingSpace.prototype.input = '';

    return JoinWithKeepingSpace;

  })(JoinBase);

  JoinByInput = (function(superClass) {
    extend(JoinByInput, superClass);

    function JoinByInput() {
      return JoinByInput.__super__.constructor.apply(this, arguments);
    }

    JoinByInput.extend();

    JoinByInput.registerToSelectList();

    JoinByInput.description = "Transform multi-line to single-line by with specified separator character";

    JoinByInput.prototype.requireInput = true;

    JoinByInput.prototype.trim = true;

    return JoinByInput;

  })(JoinBase);

  JoinByInputWithKeepingSpace = (function(superClass) {
    extend(JoinByInputWithKeepingSpace, superClass);

    function JoinByInputWithKeepingSpace() {
      return JoinByInputWithKeepingSpace.__super__.constructor.apply(this, arguments);
    }

    JoinByInputWithKeepingSpace.extend();

    JoinByInputWithKeepingSpace.registerToSelectList();

    JoinByInputWithKeepingSpace.description = "Join lines without padding space between each line";

    JoinByInputWithKeepingSpace.prototype.trim = false;

    return JoinByInputWithKeepingSpace;

  })(JoinByInput);

  SplitString = (function(superClass) {
    extend(SplitString, superClass);

    function SplitString() {
      return SplitString.__super__.constructor.apply(this, arguments);
    }

    SplitString.extend();

    SplitString.registerToSelectList();

    SplitString.description = "Split single-line into multi-line by splitting specified separator chars";

    SplitString.prototype.requireInput = true;

    SplitString.prototype.input = null;

    SplitString.prototype.target = "MoveToRelativeLine";

    SplitString.prototype.keepSplitter = false;

    SplitString.prototype.initialize = function() {
      this.onDidSetTarget((function(_this) {
        return function() {
          return _this.focusInput(10);
        };
      })(this));
      return SplitString.__super__.initialize.apply(this, arguments);
    };

    SplitString.prototype.getNewText = function(text) {
      var input, lineSeparator, regex;
      input = this.input || "\\n";
      regex = RegExp("" + (_.escapeRegExp(input)), "g");
      if (this.keepSplitter) {
        lineSeparator = this.input + "\n";
      } else {
        lineSeparator = "\n";
      }
      return text.replace(regex, lineSeparator);
    };

    return SplitString;

  })(TransformString);

  SplitStringWithKeepingSplitter = (function(superClass) {
    extend(SplitStringWithKeepingSplitter, superClass);

    function SplitStringWithKeepingSplitter() {
      return SplitStringWithKeepingSplitter.__super__.constructor.apply(this, arguments);
    }

    SplitStringWithKeepingSplitter.extend();

    SplitStringWithKeepingSplitter.registerToSelectList();

    SplitStringWithKeepingSplitter.prototype.keepSplitter = true;

    return SplitStringWithKeepingSplitter;

  })(SplitString);

  ChangeOrder = (function(superClass) {
    extend(ChangeOrder, superClass);

    function ChangeOrder() {
      return ChangeOrder.__super__.constructor.apply(this, arguments);
    }

    ChangeOrder.extend(false);

    ChangeOrder.prototype.wise = 'linewise';

    ChangeOrder.prototype.getNewText = function(text) {
      return this.getNewRows(splitTextByNewLine(text)).join("\n") + "\n";
    };

    return ChangeOrder;

  })(TransformString);

  Reverse = (function(superClass) {
    extend(Reverse, superClass);

    function Reverse() {
      return Reverse.__super__.constructor.apply(this, arguments);
    }

    Reverse.extend();

    Reverse.registerToSelectList();

    Reverse.description = "Reverse lines(e.g reverse selected three line)";

    Reverse.prototype.getNewRows = function(rows) {
      return rows.reverse();
    };

    return Reverse;

  })(ChangeOrder);

  Sort = (function(superClass) {
    extend(Sort, superClass);

    function Sort() {
      return Sort.__super__.constructor.apply(this, arguments);
    }

    Sort.extend();

    Sort.registerToSelectList();

    Sort.description = "Sort lines alphabetically";

    Sort.prototype.getNewRows = function(rows) {
      return rows.sort();
    };

    return Sort;

  })(ChangeOrder);

  SortCaseInsensitively = (function(superClass) {
    extend(SortCaseInsensitively, superClass);

    function SortCaseInsensitively() {
      return SortCaseInsensitively.__super__.constructor.apply(this, arguments);
    }

    SortCaseInsensitively.extend();

    SortCaseInsensitively.registerToSelectList();

    SortCaseInsensitively.description = "Sort lines alphabetically (case insensitive)";

    SortCaseInsensitively.prototype.getNewRows = function(rows) {
      return rows.sort(function(rowA, rowB) {
        return rowA.localeCompare(rowB, {
          sensitivity: 'base'
        });
      });
    };

    return SortCaseInsensitively;

  })(ChangeOrder);

  SortByNumber = (function(superClass) {
    extend(SortByNumber, superClass);

    function SortByNumber() {
      return SortByNumber.__super__.constructor.apply(this, arguments);
    }

    SortByNumber.extend();

    SortByNumber.registerToSelectList();

    SortByNumber.description = "Sort lines numerically";

    SortByNumber.prototype.getNewRows = function(rows) {
      return _.sortBy(rows, function(row) {
        return Number.parseInt(row) || 2e308;
      });
    };

    return SortByNumber;

  })(ChangeOrder);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3ItdHJhbnNmb3JtLXN0cmluZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG1sQ0FBQTtJQUFBOzs7Ozs7RUFBQSxnQkFBQSxHQUFtQjs7RUFDbkIsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixNQUEyQixPQUFBLENBQVEsTUFBUixDQUEzQixFQUFDLHFDQUFELEVBQWtCOztFQUVsQixPQU1JLE9BQUEsQ0FBUSxTQUFSLENBTkosRUFDRSx3Q0FERixFQUVFLHNDQUZGLEVBR0UsOEJBSEYsRUFJRSxvREFKRixFQUtFOztFQUVGLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVI7O0VBQ1IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztFQUNQLFFBQUEsR0FBVyxJQUFJLENBQUMsUUFBTCxDQUFjLFVBQWQ7O0VBSUw7Ozs7Ozs7SUFDSixlQUFDLENBQUEsTUFBRCxDQUFRLEtBQVI7OzhCQUNBLFdBQUEsR0FBYTs7OEJBQ2IsY0FBQSxHQUFnQjs7OEJBQ2hCLFVBQUEsR0FBWTs7OEJBQ1osaUJBQUEsR0FBbUI7O0lBQ25CLGVBQUMsQ0FBQSxrQkFBRCxHQUFxQjs7SUFFckIsZUFBQyxDQUFBLG9CQUFELEdBQXVCLFNBQUE7YUFDckIsSUFBQyxDQUFBLGtCQUFrQixDQUFDLElBQXBCLENBQXlCLElBQXpCO0lBRHFCOzs4QkFHdkIsZUFBQSxHQUFpQixTQUFDLFNBQUQ7QUFDZixVQUFBO01BQUEsSUFBRyxJQUFBLEdBQU8sSUFBQyxDQUFBLFVBQUQsQ0FBWSxTQUFTLENBQUMsT0FBVixDQUFBLENBQVosRUFBaUMsU0FBakMsQ0FBVjtlQUNFLFNBQVMsQ0FBQyxVQUFWLENBQXFCLElBQXJCLEVBQTJCO1VBQUUsWUFBRCxJQUFDLENBQUEsVUFBRjtTQUEz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Q0EsT0FBQyxDQUFBLG9CQUFELENBQUE7O0lBQ0EsT0FBQyxDQUFBLFdBQUQsR0FBYzs7c0JBQ2QsVUFBQSxHQUFZLFNBQUMsSUFBRDthQUNWLElBQUksQ0FBQyxPQUFMLENBQUE7SUFEVTs7OztLQUpROztFQU9oQjs7Ozs7OztJQUNKLElBQUMsQ0FBQSxNQUFELENBQUE7O0lBQ0EsSUFBQyxDQUFBLG9CQUFELENBQUE7O0lBQ0EsSUFBQyxDQUFBLFdBQUQsR0FBYzs7bUJBQ2QsVUFBQSxHQUFZLFNBQUMsSUFBRDthQUNWLElBQUksQ0FBQyxJQUFMLENBQUE7SUFEVTs7OztLQUpLOztFQU9iOzs7Ozs7O0lBQ0oscUJBQUMsQ0FBQSxNQUFELENBQUE7O0lBQ0EscUJBQUMsQ0FBQSxvQkFBRCxDQUFBOztJQUNBLHFCQUFDLENBQUEsV0FBRCxHQUFjOztvQ0FDZCxVQUFBLEdBQVksU0FBQyxJQUFEO2FBQ1YsSUFBSSxDQUFDLElBQUwsQ0FBVSxTQUFDLElBQUQsRUFBTyxJQUFQO2VBQ1IsSUFBSSxDQUFDLGFBQUwsQ0FBbUIsSUFBbkIsRUFBeUI7VUFBQSxXQUFBLEVBQWEsTUFBYjtTQUF6QjtNQURRLENBQVY7SUFEVTs7OztLQUpzQjs7RUFROUI7Ozs7Ozs7SUFDSixZQUFDLENBQUEsTUFBRCxDQUFBOztJQUNBLFlBQUMsQ0FBQSxvQkFBRCxDQUFBOztJQUNBLFlBQUMsQ0FBQSxXQUFELEdBQWM7OzJCQUNkLFVBQUEsR0FBWSxTQUFDLElBQUQ7YUFDVixDQUFDLENBQUMsTUFBRixDQUFTLElBQVQsRUFBZSxTQUFDLEdBQUQ7ZUFDYixNQUFNLENBQUMsUUFBUCxDQUFnQixHQUFoQixDQUFBLElBQXdCO01BRFgsQ0FBZjtJQURVOzs7O0tBSmE7QUE5b0IzQiIsInNvdXJjZXNDb250ZW50IjpbIkxpbmVFbmRpbmdSZWdFeHAgPSAvKD86XFxufFxcclxcbikkL1xuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntCdWZmZXJlZFByb2Nlc3MsIFJhbmdlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbntcbiAgaXNTaW5nbGVMaW5lVGV4dFxuICBpc0xpbmV3aXNlUmFuZ2VcbiAgbGltaXROdW1iZXJcbiAgdG9nZ2xlQ2FzZUZvckNoYXJhY3RlclxuICBzcGxpdFRleHRCeU5ld0xpbmVcbn0gPSByZXF1aXJlICcuL3V0aWxzJ1xuc3dyYXAgPSByZXF1aXJlICcuL3NlbGVjdGlvbi13cmFwcGVyJ1xuQmFzZSA9IHJlcXVpcmUgJy4vYmFzZSdcbk9wZXJhdG9yID0gQmFzZS5nZXRDbGFzcygnT3BlcmF0b3InKVxuXG4jIFRyYW5zZm9ybVN0cmluZ1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgVHJhbnNmb3JtU3RyaW5nIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZChmYWxzZSlcbiAgdHJhY2tDaGFuZ2U6IHRydWVcbiAgc3RheU9wdGlvbk5hbWU6ICdzdGF5T25UcmFuc2Zvcm1TdHJpbmcnXG4gIGF1dG9JbmRlbnQ6IGZhbHNlXG4gIGF1dG9JbmRlbnROZXdsaW5lOiBmYWxzZVxuICBAc3RyaW5nVHJhbnNmb3JtZXJzOiBbXVxuXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdDogLT5cbiAgICBAc3RyaW5nVHJhbnNmb3JtZXJzLnB1c2godGhpcylcblxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgaWYgdGV4dCA9IEBnZXROZXdUZXh0KHNlbGVjdGlvbi5nZXRUZXh0KCksIHNlbGVjdGlvbilcbiAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQsIHtAYXV0b0luZGVudH0pXG5cbmNsYXNzIFRvZ2dsZUNhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJgSGVsbG8gV29ybGRgIC0+IGBoRUxMTyB3T1JMRGBcIlxuICBkaXNwbGF5TmFtZTogJ1RvZ2dsZSB+J1xuXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIHRleHQucmVwbGFjZSgvLi9nLCB0b2dnbGVDYXNlRm9yQ2hhcmFjdGVyKVxuXG5jbGFzcyBUb2dnbGVDYXNlQW5kTW92ZVJpZ2h0IGV4dGVuZHMgVG9nZ2xlQ2FzZVxuICBAZXh0ZW5kKClcbiAgZmxhc2hUYXJnZXQ6IGZhbHNlXG4gIHJlc3RvcmVQb3NpdGlvbnM6IGZhbHNlXG4gIHRhcmdldDogJ01vdmVSaWdodCdcblxuY2xhc3MgVXBwZXJDYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiYEhlbGxvIFdvcmxkYCAtPiBgSEVMTE8gV09STERgXCJcbiAgZGlzcGxheU5hbWU6ICdVcHBlcidcbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgdGV4dC50b1VwcGVyQ2FzZSgpXG5cbmNsYXNzIExvd2VyQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcImBIZWxsbyBXb3JsZGAgLT4gYGhlbGxvIHdvcmxkYFwiXG4gIGRpc3BsYXlOYW1lOiAnTG93ZXInXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIHRleHQudG9Mb3dlckNhc2UoKVxuXG4jIFJlcGxhY2VcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgUmVwbGFjZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgaW5wdXQ6IG51bGxcbiAgZmxhc2hDaGVja3BvaW50OiAnZGlkLXNlbGVjdC1vY2N1cnJlbmNlJ1xuICByZXF1aXJlSW5wdXQ6IHRydWVcbiAgYXV0b0luZGVudE5ld2xpbmU6IHRydWVcbiAgc3VwcG9ydEVhcmx5U2VsZWN0OiB0cnVlXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBAb25EaWRTZWxlY3RUYXJnZXQgPT5cbiAgICAgIEBmb2N1c0lucHV0KDEsIHRydWUpXG4gICAgc3VwZXJcblxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBpZiBAdGFyZ2V0LmlzKCdNb3ZlUmlnaHRCdWZmZXJDb2x1bW4nKSBhbmQgdGV4dC5sZW5ndGggaXNudCBAZ2V0Q291bnQoKVxuICAgICAgcmV0dXJuXG5cbiAgICBpbnB1dCA9IEBpbnB1dCBvciBcIlxcblwiXG4gICAgaWYgaW5wdXQgaXMgXCJcXG5cIlxuICAgICAgQHJlc3RvcmVQb3NpdGlvbnMgPSBmYWxzZVxuICAgIHRleHQucmVwbGFjZSgvLi9nLCBpbnB1dClcblxuY2xhc3MgUmVwbGFjZUNoYXJhY3RlciBleHRlbmRzIFJlcGxhY2VcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogXCJNb3ZlUmlnaHRCdWZmZXJDb2x1bW5cIlxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgRFVQIG1lYW5pbmcgd2l0aCBTcGxpdFN0cmluZyBuZWVkIGNvbnNvbGlkYXRlLlxuY2xhc3MgU3BsaXRCeUNoYXJhY3RlciBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgdGV4dC5zcGxpdCgnJykuam9pbignICcpXG5cbmNsYXNzIENhbWVsQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgZGlzcGxheU5hbWU6ICdDYW1lbGl6ZSdcbiAgQGRlc2NyaXB0aW9uOiBcImBoZWxsby13b3JsZGAgLT4gYGhlbGxvV29ybGRgXCJcbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgXy5jYW1lbGl6ZSh0ZXh0KVxuXG5jbGFzcyBTbmFrZUNhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJgSGVsbG9Xb3JsZGAgLT4gYGhlbGxvX3dvcmxkYFwiXG4gIGRpc3BsYXlOYW1lOiAnVW5kZXJzY29yZSBfJ1xuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBfLnVuZGVyc2NvcmUodGV4dClcblxuY2xhc3MgUGFzY2FsQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcImBoZWxsb193b3JsZGAgLT4gYEhlbGxvV29ybGRgXCJcbiAgZGlzcGxheU5hbWU6ICdQYXNjYWxpemUnXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIF8uY2FwaXRhbGl6ZShfLmNhbWVsaXplKHRleHQpKVxuXG5jbGFzcyBEYXNoQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgZGlzcGxheU5hbWU6ICdEYXNoZXJpemUgLSdcbiAgQGRlc2NyaXB0aW9uOiBcIkhlbGxvV29ybGQgLT4gaGVsbG8td29ybGRcIlxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBfLmRhc2hlcml6ZSh0ZXh0KVxuXG5jbGFzcyBUaXRsZUNhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJgSGVsbG9Xb3JsZGAgLT4gYEhlbGxvIFdvcmxkYFwiXG4gIGRpc3BsYXlOYW1lOiAnVGl0bGl6ZSdcbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgXy5odW1hbml6ZUV2ZW50TmFtZShfLmRhc2hlcml6ZSh0ZXh0KSlcblxuY2xhc3MgRW5jb2RlVXJpQ29tcG9uZW50IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiYEhlbGxvIFdvcmxkYCAtPiBgSGVsbG8lMjBXb3JsZGBcIlxuICBkaXNwbGF5TmFtZTogJ0VuY29kZSBVUkkgQ29tcG9uZW50ICUnXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIGVuY29kZVVSSUNvbXBvbmVudCh0ZXh0KVxuXG5jbGFzcyBEZWNvZGVVcmlDb21wb25lbnQgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJgSGVsbG8lMjBXb3JsZGAgLT4gYEhlbGxvIFdvcmxkYFwiXG4gIGRpc3BsYXlOYW1lOiAnRGVjb2RlIFVSSSBDb21wb25lbnQgJSUnXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIGRlY29kZVVSSUNvbXBvbmVudCh0ZXh0KVxuXG5jbGFzcyBUcmltU3RyaW5nIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiYCBoZWxsbyBgIC0+IGBoZWxsb2BcIlxuICBkaXNwbGF5TmFtZTogJ1RyaW0gc3RyaW5nJ1xuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICB0ZXh0LnRyaW0oKVxuXG5jbGFzcyBDb21wYWN0U3BhY2VzIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiYCAgYSAgICBiICAgIGNgIC0+IGBhIGIgY2BcIlxuICBkaXNwbGF5TmFtZTogJ0NvbXBhY3Qgc3BhY2UnXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIGlmIHRleHQubWF0Y2goL15bIF0rJC8pXG4gICAgICAnICdcbiAgICBlbHNlXG4gICAgICAjIERvbid0IGNvbXBhY3QgZm9yIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlIHNwYWNlcy5cbiAgICAgIHRleHQucmVwbGFjZSAvXihcXHMqKSguKj8pKFxccyopJC9nbSwgKG0sIGxlYWRpbmcsIG1pZGRsZSwgdHJhaWxpbmcpIC0+XG4gICAgICAgIGxlYWRpbmcgKyBtaWRkbGUuc3BsaXQoL1sgXFx0XSsvKS5qb2luKCcgJykgKyB0cmFpbGluZ1xuXG5jbGFzcyBSZW1vdmVMZWFkaW5nV2hpdGVTcGFjZXMgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgQGRlc2NyaXB0aW9uOiBcImAgIGEgYiBjYCAtPiBgYSBiIGNgXCJcbiAgZ2V0TmV3VGV4dDogKHRleHQsIHNlbGVjdGlvbikgLT5cbiAgICB0cmltTGVmdCA9ICh0ZXh0KSAtPiB0ZXh0LnRyaW1MZWZ0KClcbiAgICBzcGxpdFRleHRCeU5ld0xpbmUodGV4dCkubWFwKHRyaW1MZWZ0KS5qb2luKFwiXFxuXCIpICsgXCJcXG5cIlxuXG5jbGFzcyBDb252ZXJ0VG9Tb2Z0VGFiIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBkaXNwbGF5TmFtZTogJ1NvZnQgVGFiJ1xuICB3aXNlOiAnbGluZXdpc2UnXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIEBzY2FuRm9yd2FyZCAvXFx0L2csIHtzY2FuUmFuZ2U6IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpfSwgKHtyYW5nZSwgcmVwbGFjZX0pID0+XG4gICAgICAjIFJlcGxhY2UgXFx0IHRvIHNwYWNlcyB3aGljaCBsZW5ndGggaXMgdmFyeSBkZXBlbmRpbmcgb24gdGFiU3RvcCBhbmQgdGFiTGVuZ2h0XG4gICAgICAjIFNvIHdlIGRpcmVjdGx5IGNvbnN1bHQgaXQncyBzY3JlZW4gcmVwcmVzZW50aW5nIGxlbmd0aC5cbiAgICAgIGxlbmd0aCA9IEBlZGl0b3Iuc2NyZWVuUmFuZ2VGb3JCdWZmZXJSYW5nZShyYW5nZSkuZ2V0RXh0ZW50KCkuY29sdW1uXG4gICAgICByZXBsYWNlKFwiIFwiLnJlcGVhdChsZW5ndGgpKVxuXG5jbGFzcyBDb252ZXJ0VG9IYXJkVGFiIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBkaXNwbGF5TmFtZTogJ0hhcmQgVGFiJ1xuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICB0YWJMZW5ndGggPSBAZWRpdG9yLmdldFRhYkxlbmd0aCgpXG4gICAgQHNjYW5Gb3J3YXJkIC9bIFxcdF0rL2csIHtzY2FuUmFuZ2U6IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpfSwgKHtyYW5nZSwgcmVwbGFjZX0pID0+XG4gICAgICB7c3RhcnQsIGVuZH0gPSBAZWRpdG9yLnNjcmVlblJhbmdlRm9yQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgICBzdGFydENvbHVtbiA9IHN0YXJ0LmNvbHVtblxuICAgICAgZW5kQ29sdW1uID0gZW5kLmNvbHVtblxuXG4gICAgICAjIFdlIGNhbid0IG5haXZlbHkgcmVwbGFjZSBzcGFjZXMgdG8gdGFiLCB3ZSBoYXZlIHRvIGNvbnNpZGVyIHZhbGlkIHRhYlN0b3AgY29sdW1uXG4gICAgICAjIElmIG5leHRUYWJTdG9wIGNvbHVtbiBleGNlZWRzIHJlcGxhY2FibGUgcmFuZ2UsIHdlIHBhZCB3aXRoIHNwYWNlcy5cbiAgICAgIG5ld1RleHQgPSAnJ1xuICAgICAgbG9vcFxuICAgICAgICByZW1haW5kZXIgPSBzdGFydENvbHVtbiAlJSB0YWJMZW5ndGhcbiAgICAgICAgbmV4dFRhYlN0b3AgPSBzdGFydENvbHVtbiArIChpZiByZW1haW5kZXIgaXMgMCB0aGVuIHRhYkxlbmd0aCBlbHNlIHJlbWFpbmRlcilcbiAgICAgICAgaWYgbmV4dFRhYlN0b3AgPiBlbmRDb2x1bW5cbiAgICAgICAgICBuZXdUZXh0ICs9IFwiIFwiLnJlcGVhdChlbmRDb2x1bW4gLSBzdGFydENvbHVtbilcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG5ld1RleHQgKz0gXCJcXHRcIlxuICAgICAgICBzdGFydENvbHVtbiA9IG5leHRUYWJTdG9wXG4gICAgICAgIGJyZWFrIGlmIHN0YXJ0Q29sdW1uID49IGVuZENvbHVtblxuXG4gICAgICByZXBsYWNlKG5ld1RleHQpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgVHJhbnNmb3JtU3RyaW5nQnlFeHRlcm5hbENvbW1hbmQgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZChmYWxzZSlcbiAgYXV0b0luZGVudDogdHJ1ZVxuICBjb21tYW5kOiAnJyAjIGUuZy4gY29tbWFuZDogJ3NvcnQnXG4gIGFyZ3M6IFtdICMgZS5nIGFyZ3M6IFsnLXJuJ11cbiAgc3Rkb3V0QnlTZWxlY3Rpb246IG51bGxcblxuICBleGVjdXRlOiAtPlxuICAgIEBub3JtYWxpemVTZWxlY3Rpb25zSWZOZWNlc3NhcnkoKVxuICAgIGlmIEBzZWxlY3RUYXJnZXQoKVxuICAgICAgbmV3IFByb21pc2UgKHJlc29sdmUpID0+XG4gICAgICAgIEBjb2xsZWN0KHJlc29sdmUpXG4gICAgICAudGhlbiA9PlxuICAgICAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgICAgdGV4dCA9IEBnZXROZXdUZXh0KHNlbGVjdGlvbi5nZXRUZXh0KCksIHNlbGVjdGlvbilcbiAgICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0LCB7QGF1dG9JbmRlbnR9KVxuICAgICAgICBAcmVzdG9yZUN1cnNvclBvc2l0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICAgICAgQGFjdGl2YXRlTW9kZShAZmluYWxNb2RlLCBAZmluYWxTdWJtb2RlKVxuXG4gIGNvbGxlY3Q6IChyZXNvbHZlKSAtPlxuICAgIEBzdGRvdXRCeVNlbGVjdGlvbiA9IG5ldyBNYXBcbiAgICBwcm9jZXNzUnVubmluZyA9IHByb2Nlc3NGaW5pc2hlZCA9IDBcbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICB7Y29tbWFuZCwgYXJnc30gPSBAZ2V0Q29tbWFuZChzZWxlY3Rpb24pID8ge31cbiAgICAgIHJldHVybiB1bmxlc3MgKGNvbW1hbmQ/IGFuZCBhcmdzPylcbiAgICAgIHByb2Nlc3NSdW5uaW5nKytcbiAgICAgIGRvIChzZWxlY3Rpb24pID0+XG4gICAgICAgIHN0ZGluID0gQGdldFN0ZGluKHNlbGVjdGlvbilcbiAgICAgICAgc3Rkb3V0ID0gKG91dHB1dCkgPT5cbiAgICAgICAgICBAc3Rkb3V0QnlTZWxlY3Rpb24uc2V0KHNlbGVjdGlvbiwgb3V0cHV0KVxuICAgICAgICBleGl0ID0gKGNvZGUpIC0+XG4gICAgICAgICAgcHJvY2Vzc0ZpbmlzaGVkKytcbiAgICAgICAgICByZXNvbHZlKCkgaWYgKHByb2Nlc3NSdW5uaW5nIGlzIHByb2Nlc3NGaW5pc2hlZClcbiAgICAgICAgQHJ1bkV4dGVybmFsQ29tbWFuZCB7Y29tbWFuZCwgYXJncywgc3Rkb3V0LCBleGl0LCBzdGRpbn1cblxuICBydW5FeHRlcm5hbENvbW1hbmQ6IChvcHRpb25zKSAtPlxuICAgIHN0ZGluID0gb3B0aW9ucy5zdGRpblxuICAgIGRlbGV0ZSBvcHRpb25zLnN0ZGluXG4gICAgYnVmZmVyZWRQcm9jZXNzID0gbmV3IEJ1ZmZlcmVkUHJvY2VzcyhvcHRpb25zKVxuICAgIGJ1ZmZlcmVkUHJvY2Vzcy5vbldpbGxUaHJvd0Vycm9yICh7ZXJyb3IsIGhhbmRsZX0pID0+XG4gICAgICAjIFN1cHByZXNzIGNvbW1hbmQgbm90IGZvdW5kIGVycm9yIGludGVudGlvbmFsbHkuXG4gICAgICBpZiBlcnJvci5jb2RlIGlzICdFTk9FTlQnIGFuZCBlcnJvci5zeXNjYWxsLmluZGV4T2YoJ3NwYXduJykgaXMgMFxuICAgICAgICBjb21tYW5kTmFtZSA9IEBjb25zdHJ1Y3Rvci5nZXRDb21tYW5kTmFtZSgpXG4gICAgICAgIGNvbnNvbGUubG9nIFwiI3tjb21tYW5kTmFtZX06IEZhaWxlZCB0byBzcGF3biBjb21tYW5kICN7ZXJyb3IucGF0aH0uXCJcbiAgICAgICAgaGFuZGxlKClcbiAgICAgIEBjYW5jZWxPcGVyYXRpb24oKVxuXG4gICAgaWYgc3RkaW5cbiAgICAgIGJ1ZmZlcmVkUHJvY2Vzcy5wcm9jZXNzLnN0ZGluLndyaXRlKHN0ZGluKVxuICAgICAgYnVmZmVyZWRQcm9jZXNzLnByb2Nlc3Muc3RkaW4uZW5kKClcblxuICBnZXROZXdUZXh0OiAodGV4dCwgc2VsZWN0aW9uKSAtPlxuICAgIEBnZXRTdGRvdXQoc2VsZWN0aW9uKSA/IHRleHRcblxuICAjIEZvciBlYXNpbHkgZXh0ZW5kIGJ5IHZtcCBwbHVnaW4uXG4gIGdldENvbW1hbmQ6IChzZWxlY3Rpb24pIC0+IHtAY29tbWFuZCwgQGFyZ3N9XG4gIGdldFN0ZGluOiAoc2VsZWN0aW9uKSAtPiBzZWxlY3Rpb24uZ2V0VGV4dCgpXG4gIGdldFN0ZG91dDogKHNlbGVjdGlvbikgLT4gQHN0ZG91dEJ5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgVHJhbnNmb3JtU3RyaW5nQnlTZWxlY3RMaXN0IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiSW50ZXJhY3RpdmVseSBjaG9vc2Ugc3RyaW5nIHRyYW5zZm9ybWF0aW9uIG9wZXJhdG9yIGZyb20gc2VsZWN0LWxpc3RcIlxuICBAc2VsZWN0TGlzdEl0ZW1zOiBudWxsXG4gIHJlcXVpcmVJbnB1dDogdHJ1ZVxuXG4gIGdldEl0ZW1zOiAtPlxuICAgIEBjb25zdHJ1Y3Rvci5zZWxlY3RMaXN0SXRlbXMgPz0gQGNvbnN0cnVjdG9yLnN0cmluZ1RyYW5zZm9ybWVycy5tYXAgKGtsYXNzKSAtPlxuICAgICAgaWYga2xhc3M6Omhhc093blByb3BlcnR5KCdkaXNwbGF5TmFtZScpXG4gICAgICAgIGRpc3BsYXlOYW1lID0ga2xhc3M6OmRpc3BsYXlOYW1lXG4gICAgICBlbHNlXG4gICAgICAgIGRpc3BsYXlOYW1lID0gXy5odW1hbml6ZUV2ZW50TmFtZShfLmRhc2hlcml6ZShrbGFzcy5uYW1lKSlcbiAgICAgIHtuYW1lOiBrbGFzcywgZGlzcGxheU5hbWV9XG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuXG4gICAgQHZpbVN0YXRlLm9uRGlkQ29uZmlybVNlbGVjdExpc3QgKGl0ZW0pID0+XG4gICAgICB0cmFuc2Zvcm1lciA9IGl0ZW0ubmFtZVxuICAgICAgQHRhcmdldCA9IHRyYW5zZm9ybWVyOjp0YXJnZXQgaWYgdHJhbnNmb3JtZXI6OnRhcmdldD9cbiAgICAgIEB2aW1TdGF0ZS5yZXNldCgpXG4gICAgICBpZiBAdGFyZ2V0P1xuICAgICAgICBAdmltU3RhdGUub3BlcmF0aW9uU3RhY2sucnVuKHRyYW5zZm9ybWVyLCB7QHRhcmdldH0pXG4gICAgICBlbHNlXG4gICAgICAgIEB2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5ydW4odHJhbnNmb3JtZXIpXG5cbiAgICBAZm9jdXNTZWxlY3RMaXN0KGl0ZW1zOiBAZ2V0SXRlbXMoKSlcblxuICBleGVjdXRlOiAtPlxuICAgICMgTkVWRVIgYmUgZXhlY3V0ZWQgc2luY2Ugb3BlcmF0aW9uU3RhY2sgaXMgcmVwbGFjZWQgd2l0aCBzZWxlY3RlZCB0cmFuc2Zvcm1lclxuICAgIHRocm93IG5ldyBFcnJvcihcIiN7QG5hbWV9IHNob3VsZCBub3QgYmUgZXhlY3V0ZWRcIilcblxuY2xhc3MgVHJhbnNmb3JtV29yZEJ5U2VsZWN0TGlzdCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ0J5U2VsZWN0TGlzdFxuICBAZXh0ZW5kKClcbiAgdGFyZ2V0OiBcIklubmVyV29yZFwiXG5cbmNsYXNzIFRyYW5zZm9ybVNtYXJ0V29yZEJ5U2VsZWN0TGlzdCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ0J5U2VsZWN0TGlzdFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlRyYW5zZm9ybSBJbm5lclNtYXJ0V29yZCBieSBgdHJhbnNmb3JtLXN0cmluZy1ieS1zZWxlY3QtbGlzdGBcIlxuICB0YXJnZXQ6IFwiSW5uZXJTbWFydFdvcmRcIlxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFJlcGxhY2VXaXRoUmVnaXN0ZXIgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJSZXBsYWNlIHRhcmdldCB3aXRoIHNwZWNpZmllZCByZWdpc3RlciB2YWx1ZVwiXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIEB2aW1TdGF0ZS5yZWdpc3Rlci5nZXRUZXh0KClcblxuIyBTYXZlIHRleHQgdG8gcmVnaXN0ZXIgYmVmb3JlIHJlcGxhY2VcbmNsYXNzIFN3YXBXaXRoUmVnaXN0ZXIgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTd2FwIHJlZ2lzdGVyIHZhbHVlIHdpdGggdGFyZ2V0XCJcbiAgZ2V0TmV3VGV4dDogKHRleHQsIHNlbGVjdGlvbikgLT5cbiAgICBuZXdUZXh0ID0gQHZpbVN0YXRlLnJlZ2lzdGVyLmdldFRleHQoKVxuICAgIEBzZXRUZXh0VG9SZWdpc3Rlcih0ZXh0LCBzZWxlY3Rpb24pXG4gICAgbmV3VGV4dFxuXG4jIEluZGVudCA8IFRyYW5zZm9ybVN0cmluZ1xuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBJbmRlbnQgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIHN0YXlCeU1hcmtlcjogdHJ1ZVxuICBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZTogdHJ1ZVxuICB3aXNlOiAnbGluZXdpc2UnXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgICMgTmVlZCBjb3VudCB0aW1lcyBpbmRlbnRhdGlvbiBpbiB2aXN1YWwtbW9kZSBhbmQgaXRzIHJlcGVhdChgLmApLlxuICAgIGlmIEB0YXJnZXQuaXMoJ0N1cnJlbnRTZWxlY3Rpb24nKVxuICAgICAgb2xkVGV4dCA9IG51bGxcbiAgICAgICAjIGxpbWl0IHRvIDEwMCB0byBhdm9pZCBmcmVlemluZyBieSBhY2NpZGVudGFsIGJpZyBudW1iZXIuXG4gICAgICBjb3VudCA9IGxpbWl0TnVtYmVyKEBnZXRDb3VudCgpLCBtYXg6IDEwMClcbiAgICAgIEBjb3VudFRpbWVzIGNvdW50LCAoe3N0b3B9KSA9PlxuICAgICAgICBvbGRUZXh0ID0gc2VsZWN0aW9uLmdldFRleHQoKVxuICAgICAgICBAaW5kZW50KHNlbGVjdGlvbilcbiAgICAgICAgc3RvcCgpIGlmIHNlbGVjdGlvbi5nZXRUZXh0KCkgaXMgb2xkVGV4dFxuICAgIGVsc2VcbiAgICAgIEBpbmRlbnQoc2VsZWN0aW9uKVxuXG4gIGluZGVudDogKHNlbGVjdGlvbikgLT5cbiAgICBzZWxlY3Rpb24uaW5kZW50U2VsZWN0ZWRSb3dzKClcblxuY2xhc3MgT3V0ZGVudCBleHRlbmRzIEluZGVudFxuICBAZXh0ZW5kKClcbiAgaW5kZW50OiAoc2VsZWN0aW9uKSAtPlxuICAgIHNlbGVjdGlvbi5vdXRkZW50U2VsZWN0ZWRSb3dzKClcblxuY2xhc3MgQXV0b0luZGVudCBleHRlbmRzIEluZGVudFxuICBAZXh0ZW5kKClcbiAgaW5kZW50OiAoc2VsZWN0aW9uKSAtPlxuICAgIHNlbGVjdGlvbi5hdXRvSW5kZW50U2VsZWN0ZWRSb3dzKClcblxuY2xhc3MgVG9nZ2xlTGluZUNvbW1lbnRzIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBzdGF5QnlNYXJrZXI6IHRydWVcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgc2VsZWN0aW9uLnRvZ2dsZUxpbmVDb21tZW50cygpXG5cbmNsYXNzIEF1dG9GbG93IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChAZWRpdG9yRWxlbWVudCwgJ2F1dG9mbG93OnJlZmxvdy1zZWxlY3Rpb24nKVxuXG4jIFN1cnJvdW5kIDwgVHJhbnNmb3JtU3RyaW5nXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFN1cnJvdW5kQmFzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKGZhbHNlKVxuICBwYWlyczogW1xuICAgIFsnWycsICddJ11cbiAgICBbJygnLCAnKSddXG4gICAgWyd7JywgJ30nXVxuICAgIFsnPCcsICc+J11cbiAgXVxuICBwYWlyQ2hhcnNBbGxvd0ZvcndhcmRpbmc6ICdbXSgpe30nXG4gIGlucHV0OiBudWxsXG4gIGF1dG9JbmRlbnQ6IGZhbHNlXG5cbiAgcmVxdWlyZUlucHV0OiB0cnVlXG4gIHN1cHBvcnRFYXJseVNlbGVjdDogdHJ1ZSAjIEV4cGVyaW1lbnRhbFxuXG4gIGZvY3VzSW5wdXRGb3JTdXJyb3VuZENoYXI6IC0+XG4gICAgaW5wdXRVSSA9IEBuZXdJbnB1dFVJKClcbiAgICBpbnB1dFVJLm9uRGlkQ29uZmlybShAb25Db25maXJtU3Vycm91bmRDaGFyLmJpbmQodGhpcykpXG4gICAgaW5wdXRVSS5vbkRpZENhbmNlbChAY2FuY2VsT3BlcmF0aW9uLmJpbmQodGhpcykpXG4gICAgaW5wdXRVSS5mb2N1cygxLCB0cnVlKVxuXG4gIGZvY3VzSW5wdXRGb3JUYXJnZXRQYWlyQ2hhcjogLT5cbiAgICBpbnB1dFVJID0gQG5ld0lucHV0VUkoKVxuICAgIGlucHV0VUkub25EaWRDb25maXJtKEBvbkNvbmZpcm1UYXJnZXRQYWlyQ2hhci5iaW5kKHRoaXMpKVxuICAgIGlucHV0VUkub25EaWRDYW5jZWwoQGNhbmNlbE9wZXJhdGlvbi5iaW5kKHRoaXMpKVxuICAgIGlucHV0VUkuZm9jdXMoKVxuXG4gIGdldFBhaXI6IChjaGFyKSAtPlxuICAgIGlmIHBhaXIgPSBfLmRldGVjdChAcGFpcnMsIChwYWlyKSAtPiBjaGFyIGluIHBhaXIpXG4gICAgICBwYWlyXG4gICAgZWxzZVxuICAgICAgW2NoYXIsIGNoYXJdXG5cbiAgc3Vycm91bmQ6ICh0ZXh0LCBjaGFyLCBvcHRpb25zPXt9KSAtPlxuICAgIGtlZXBMYXlvdXQgPSBvcHRpb25zLmtlZXBMYXlvdXQgPyBmYWxzZVxuICAgIFtvcGVuLCBjbG9zZV0gPSBAZ2V0UGFpcihjaGFyKVxuICAgIGlmIChub3Qga2VlcExheW91dCkgYW5kIExpbmVFbmRpbmdSZWdFeHAudGVzdCh0ZXh0KVxuICAgICAgQGF1dG9JbmRlbnQgPSB0cnVlICMgW0ZJWE1FXVxuICAgICAgb3BlbiArPSBcIlxcblwiXG4gICAgICBjbG9zZSArPSBcIlxcblwiXG5cbiAgICBpZiBjaGFyIGluIEBnZXRDb25maWcoJ2NoYXJhY3RlcnNUb0FkZFNwYWNlT25TdXJyb3VuZCcpIGFuZCBpc1NpbmdsZUxpbmVUZXh0KHRleHQpXG4gICAgICB0ZXh0ID0gJyAnICsgdGV4dCArICcgJ1xuXG4gICAgb3BlbiArIHRleHQgKyBjbG9zZVxuXG4gIGRlbGV0ZVN1cnJvdW5kOiAodGV4dCkgLT5cbiAgICBbb3BlbiwgaW5uZXJUZXh0Li4uLCBjbG9zZV0gPSB0ZXh0XG4gICAgaW5uZXJUZXh0ID0gaW5uZXJUZXh0LmpvaW4oJycpXG4gICAgaWYgaXNTaW5nbGVMaW5lVGV4dCh0ZXh0KSBhbmQgKG9wZW4gaXNudCBjbG9zZSlcbiAgICAgIGlubmVyVGV4dC50cmltKClcbiAgICBlbHNlXG4gICAgICBpbm5lclRleHRcblxuICBvbkNvbmZpcm1TdXJyb3VuZENoYXI6IChAaW5wdXQpIC0+XG4gICAgQHByb2Nlc3NPcGVyYXRpb24oKVxuXG4gIG9uQ29uZmlybVRhcmdldFBhaXJDaGFyOiAoY2hhcikgLT5cbiAgICBAc2V0VGFyZ2V0IEBuZXcoJ0FQYWlyJywgcGFpcjogQGdldFBhaXIoY2hhcikpXG5cbmNsYXNzIFN1cnJvdW5kIGV4dGVuZHMgU3Vycm91bmRCYXNlXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiU3Vycm91bmQgdGFyZ2V0IGJ5IHNwZWNpZmllZCBjaGFyYWN0ZXIgbGlrZSBgKGAsIGBbYCwgYFxcXCJgXCJcblxuICBpbml0aWFsaXplOiAtPlxuICAgIEBvbkRpZFNlbGVjdFRhcmdldChAZm9jdXNJbnB1dEZvclN1cnJvdW5kQ2hhci5iaW5kKHRoaXMpKVxuICAgIHN1cGVyXG5cbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgQHN1cnJvdW5kKHRleHQsIEBpbnB1dClcblxuY2xhc3MgU3Vycm91bmRXb3JkIGV4dGVuZHMgU3Vycm91bmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTdXJyb3VuZCAqKndvcmQqKlwiXG4gIHRhcmdldDogJ0lubmVyV29yZCdcblxuY2xhc3MgU3Vycm91bmRTbWFydFdvcmQgZXh0ZW5kcyBTdXJyb3VuZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlN1cnJvdW5kICoqc21hcnQtd29yZCoqXCJcbiAgdGFyZ2V0OiAnSW5uZXJTbWFydFdvcmQnXG5cbmNsYXNzIE1hcFN1cnJvdW5kIGV4dGVuZHMgU3Vycm91bmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTdXJyb3VuZCBlYWNoIHdvcmQoYC9cXHcrL2ApIHdpdGhpbiB0YXJnZXRcIlxuICBvY2N1cnJlbmNlOiB0cnVlXG4gIHBhdHRlcm5Gb3JPY2N1cnJlbmNlOiAvXFx3Ky9nXG5cbiMgRGVsZXRlIFN1cnJvdW5kXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIERlbGV0ZVN1cnJvdW5kIGV4dGVuZHMgU3Vycm91bmRCYXNlXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiRGVsZXRlIHNwZWNpZmllZCBzdXJyb3VuZCBjaGFyYWN0ZXIgbGlrZSBgKGAsIGBbYCwgYFxcXCJgXCJcblxuICBpbml0aWFsaXplOiAtPlxuICAgIEBmb2N1c0lucHV0Rm9yVGFyZ2V0UGFpckNoYXIoKSB1bmxlc3MgQHRhcmdldD9cbiAgICBzdXBlclxuXG4gIG9uQ29uZmlybVRhcmdldFBhaXJDaGFyOiAoaW5wdXQpIC0+XG4gICAgc3VwZXJcbiAgICBAaW5wdXQgPSBpbnB1dFxuICAgIEBwcm9jZXNzT3BlcmF0aW9uKClcblxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBAZGVsZXRlU3Vycm91bmQodGV4dClcblxuY2xhc3MgRGVsZXRlU3Vycm91bmRBbnlQYWlyIGV4dGVuZHMgRGVsZXRlU3Vycm91bmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJEZWxldGUgc3Vycm91bmQgY2hhcmFjdGVyIGJ5IGF1dG8tZGV0ZWN0IHBhaXJlZCBjaGFyIGZyb20gY3Vyc29yIGVuY2xvc2VkIHBhaXJcIlxuICB0YXJnZXQ6ICdBQW55UGFpcidcbiAgcmVxdWlyZUlucHV0OiBmYWxzZVxuXG5jbGFzcyBEZWxldGVTdXJyb3VuZEFueVBhaXJBbGxvd0ZvcndhcmRpbmcgZXh0ZW5kcyBEZWxldGVTdXJyb3VuZEFueVBhaXJcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJEZWxldGUgc3Vycm91bmQgY2hhcmFjdGVyIGJ5IGF1dG8tZGV0ZWN0IHBhaXJlZCBjaGFyIGZyb20gY3Vyc29yIGVuY2xvc2VkIHBhaXIgYW5kIGZvcndhcmRpbmcgcGFpciB3aXRoaW4gc2FtZSBsaW5lXCJcbiAgdGFyZ2V0OiAnQUFueVBhaXJBbGxvd0ZvcndhcmRpbmcnXG5cbiMgQ2hhbmdlIFN1cnJvdW5kXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIENoYW5nZVN1cnJvdW5kIGV4dGVuZHMgU3Vycm91bmRCYXNlXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiQ2hhbmdlIHN1cnJvdW5kIGNoYXJhY3Rlciwgc3BlY2lmeSBib3RoIGZyb20gYW5kIHRvIHBhaXIgY2hhclwiXG5cbiAgc2hvd0RlbGV0ZUNoYXJPbkhvdmVyOiAtPlxuICAgIGNoYXIgPSBAZWRpdG9yLmdldFNlbGVjdGVkVGV4dCgpWzBdXG4gICAgQHZpbVN0YXRlLmhvdmVyLnNldChjaGFyLCBAdmltU3RhdGUuZ2V0T3JpZ2luYWxDdXJzb3JQb3NpdGlvbigpKVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgaWYgQHRhcmdldD9cbiAgICAgIEBvbkRpZEZhaWxTZWxlY3RUYXJnZXQoQGFib3J0LmJpbmQodGhpcykpXG4gICAgZWxzZVxuICAgICAgQG9uRGlkRmFpbFNlbGVjdFRhcmdldChAY2FuY2VsT3BlcmF0aW9uLmJpbmQodGhpcykpXG4gICAgICBAZm9jdXNJbnB1dEZvclRhcmdldFBhaXJDaGFyKClcbiAgICBzdXBlclxuXG4gICAgQG9uRGlkU2VsZWN0VGFyZ2V0ID0+XG4gICAgICBAc2hvd0RlbGV0ZUNoYXJPbkhvdmVyKClcbiAgICAgIEBmb2N1c0lucHV0Rm9yU3Vycm91bmRDaGFyKClcblxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBpbm5lclRleHQgPSBAZGVsZXRlU3Vycm91bmQodGV4dClcbiAgICBAc3Vycm91bmQoaW5uZXJUZXh0LCBAaW5wdXQsIGtlZXBMYXlvdXQ6IHRydWUpXG5cbmNsYXNzIENoYW5nZVN1cnJvdW5kQW55UGFpciBleHRlbmRzIENoYW5nZVN1cnJvdW5kXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiQ2hhbmdlIHN1cnJvdW5kIGNoYXJhY3RlciwgZnJvbSBjaGFyIGlzIGF1dG8tZGV0ZWN0ZWRcIlxuICB0YXJnZXQ6IFwiQUFueVBhaXJcIlxuXG5jbGFzcyBDaGFuZ2VTdXJyb3VuZEFueVBhaXJBbGxvd0ZvcndhcmRpbmcgZXh0ZW5kcyBDaGFuZ2VTdXJyb3VuZEFueVBhaXJcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJDaGFuZ2Ugc3Vycm91bmQgY2hhcmFjdGVyLCBmcm9tIGNoYXIgaXMgYXV0by1kZXRlY3RlZCBmcm9tIGVuY2xvc2VkIGFuZCBmb3J3YXJkaW5nIGFyZWFcIlxuICB0YXJnZXQ6IFwiQUFueVBhaXJBbGxvd0ZvcndhcmRpbmdcIlxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgRklYTUVcbiMgQ3VycmVudGx5IG5hdGl2ZSBlZGl0b3Iuam9pbkxpbmVzKCkgaXMgYmV0dGVyIGZvciBjdXJzb3IgcG9zaXRpb24gc2V0dGluZ1xuIyBTbyBJIHVzZSBuYXRpdmUgbWV0aG9kcyBmb3IgYSBtZWFud2hpbGUuXG5jbGFzcyBKb2luIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6IFwiTW92ZVRvUmVsYXRpdmVMaW5lXCJcbiAgZmxhc2hUYXJnZXQ6IGZhbHNlXG4gIHJlc3RvcmVQb3NpdGlvbnM6IGZhbHNlXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIGlmIGlzTGluZXdpc2VSYW5nZShyYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpKVxuICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKHJhbmdlLnRyYW5zbGF0ZShbMCwgMF0sIFstMSwgSW5maW5pdHldKSlcbiAgICBzZWxlY3Rpb24uam9pbkxpbmVzKClcbiAgICBlbmQgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5lbmRcbiAgICBzZWxlY3Rpb24uY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKGVuZC50cmFuc2xhdGUoWzAsIC0xXSkpXG5cbmNsYXNzIEpvaW5CYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoZmFsc2UpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgdHJpbTogZmFsc2VcbiAgdGFyZ2V0OiBcIk1vdmVUb1JlbGF0aXZlTGluZU1pbmltdW1PbmVcIlxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgQGZvY3VzSW5wdXQoMTApIGlmIEByZXF1aXJlSW5wdXRcbiAgICBzdXBlclxuXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIGlmIEB0cmltXG4gICAgICBwYXR0ZXJuID0gL1xccj9cXG5bIFxcdF0qL2dcbiAgICBlbHNlXG4gICAgICBwYXR0ZXJuID0gL1xccj9cXG4vZ1xuICAgIHRleHQudHJpbVJpZ2h0KCkucmVwbGFjZShwYXR0ZXJuLCBAaW5wdXQpICsgXCJcXG5cIlxuXG5jbGFzcyBKb2luV2l0aEtlZXBpbmdTcGFjZSBleHRlbmRzIEpvaW5CYXNlXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBpbnB1dDogJydcblxuY2xhc3MgSm9pbkJ5SW5wdXQgZXh0ZW5kcyBKb2luQmFzZVxuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcIlRyYW5zZm9ybSBtdWx0aS1saW5lIHRvIHNpbmdsZS1saW5lIGJ5IHdpdGggc3BlY2lmaWVkIHNlcGFyYXRvciBjaGFyYWN0ZXJcIlxuICByZXF1aXJlSW5wdXQ6IHRydWVcbiAgdHJpbTogdHJ1ZVxuXG5jbGFzcyBKb2luQnlJbnB1dFdpdGhLZWVwaW5nU3BhY2UgZXh0ZW5kcyBKb2luQnlJbnB1dFxuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcIkpvaW4gbGluZXMgd2l0aG91dCBwYWRkaW5nIHNwYWNlIGJldHdlZW4gZWFjaCBsaW5lXCJcbiAgdHJpbTogZmFsc2VcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIFN0cmluZyBzdWZmaXggaW4gbmFtZSBpcyB0byBhdm9pZCBjb25mdXNpb24gd2l0aCAnc3BsaXQnIHdpbmRvdy5cbmNsYXNzIFNwbGl0U3RyaW5nIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiU3BsaXQgc2luZ2xlLWxpbmUgaW50byBtdWx0aS1saW5lIGJ5IHNwbGl0dGluZyBzcGVjaWZpZWQgc2VwYXJhdG9yIGNoYXJzXCJcbiAgcmVxdWlyZUlucHV0OiB0cnVlXG4gIGlucHV0OiBudWxsXG4gIHRhcmdldDogXCJNb3ZlVG9SZWxhdGl2ZUxpbmVcIlxuICBrZWVwU3BsaXR0ZXI6IGZhbHNlXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBAb25EaWRTZXRUYXJnZXQgPT5cbiAgICAgIEBmb2N1c0lucHV0KDEwKVxuICAgIHN1cGVyXG5cbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgaW5wdXQgPSBAaW5wdXQgb3IgXCJcXFxcblwiXG4gICAgcmVnZXggPSAvLy8je18uZXNjYXBlUmVnRXhwKGlucHV0KX0vLy9nXG4gICAgaWYgQGtlZXBTcGxpdHRlclxuICAgICAgbGluZVNlcGFyYXRvciA9IEBpbnB1dCArIFwiXFxuXCJcbiAgICBlbHNlXG4gICAgICBsaW5lU2VwYXJhdG9yID0gXCJcXG5cIlxuICAgIHRleHQucmVwbGFjZShyZWdleCwgbGluZVNlcGFyYXRvcilcblxuY2xhc3MgU3BsaXRTdHJpbmdXaXRoS2VlcGluZ1NwbGl0dGVyIGV4dGVuZHMgU3BsaXRTdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIGtlZXBTcGxpdHRlcjogdHJ1ZVxuXG5jbGFzcyBDaGFuZ2VPcmRlciBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKGZhbHNlKVxuICB3aXNlOiAnbGluZXdpc2UnXG5cbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgQGdldE5ld1Jvd3Moc3BsaXRUZXh0QnlOZXdMaW5lKHRleHQpKS5qb2luKFwiXFxuXCIpICsgXCJcXG5cIlxuXG5jbGFzcyBSZXZlcnNlIGV4dGVuZHMgQ2hhbmdlT3JkZXJcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJSZXZlcnNlIGxpbmVzKGUuZyByZXZlcnNlIHNlbGVjdGVkIHRocmVlIGxpbmUpXCJcbiAgZ2V0TmV3Um93czogKHJvd3MpIC0+XG4gICAgcm93cy5yZXZlcnNlKClcblxuY2xhc3MgU29ydCBleHRlbmRzIENoYW5nZU9yZGVyXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiU29ydCBsaW5lcyBhbHBoYWJldGljYWxseVwiXG4gIGdldE5ld1Jvd3M6IChyb3dzKSAtPlxuICAgIHJvd3Muc29ydCgpXG5cbmNsYXNzIFNvcnRDYXNlSW5zZW5zaXRpdmVseSBleHRlbmRzIENoYW5nZU9yZGVyXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiU29ydCBsaW5lcyBhbHBoYWJldGljYWxseSAoY2FzZSBpbnNlbnNpdGl2ZSlcIlxuICBnZXROZXdSb3dzOiAocm93cykgLT5cbiAgICByb3dzLnNvcnQgKHJvd0EsIHJvd0IpIC0+XG4gICAgICByb3dBLmxvY2FsZUNvbXBhcmUocm93Qiwgc2Vuc2l0aXZpdHk6ICdiYXNlJylcblxuY2xhc3MgU29ydEJ5TnVtYmVyIGV4dGVuZHMgQ2hhbmdlT3JkZXJcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTb3J0IGxpbmVzIG51bWVyaWNhbGx5XCJcbiAgZ2V0TmV3Um93czogKHJvd3MpIC0+XG4gICAgXy5zb3J0Qnkgcm93cywgKHJvdykgLT5cbiAgICAgIE51bWJlci5wYXJzZUludChyb3cpIG9yIEluZmluaXR5XG4iXX0=
