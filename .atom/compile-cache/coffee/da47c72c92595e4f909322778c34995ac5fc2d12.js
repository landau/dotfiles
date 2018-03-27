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
      this.onDidSelectTarget(this.focusInput.bind(this));
      return Replace.__super__.initialize.apply(this, arguments);
    };

    Replace.prototype.getNewText = function(text) {
      var input;
      if (this.target.is('MoveRightBufferColumn') && text.length !== this.getCount()) {
        return;
      }
      input = this.getInput() || "\n";
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
      throw new Error((this.getName()) + " should not be executed");
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

    SurroundBase.prototype.requireTarget = true;

    SurroundBase.prototype.supportEarlySelect = true;

    SurroundBase.prototype.focusInputForSurround = function() {
      var inputUI;
      inputUI = this.newInputUI();
      inputUI.onDidConfirm(this.onConfirmSurround.bind(this));
      inputUI.onDidCancel(this.cancelOperation.bind(this));
      return inputUI.focus();
    };

    SurroundBase.prototype.focusInputForDeleteSurround = function() {
      var inputUI;
      inputUI = this.newInputUI();
      inputUI.onDidConfirm(this.onConfirmDeleteSurround.bind(this));
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

    SurroundBase.prototype.onConfirmSurround = function(input1) {
      this.input = input1;
      return this.processOperation();
    };

    SurroundBase.prototype.onConfirmDeleteSurround = function(char) {
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
      this.onDidSelectTarget(this.focusInputForSurround.bind(this));
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

    DeleteSurround.prototype.requireTarget = false;

    DeleteSurround.prototype.initialize = function() {
      if (!this.hasTarget()) {
        this.focusInputForDeleteSurround();
      }
      return DeleteSurround.__super__.initialize.apply(this, arguments);
    };

    DeleteSurround.prototype.onConfirmDeleteSurround = function(input) {
      DeleteSurround.__super__.onConfirmDeleteSurround.apply(this, arguments);
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
      if (this.hasTarget()) {
        this.onDidFailSelectTarget(this.abort.bind(this));
      } else {
        this.onDidFailSelectTarget(this.cancelOperation.bind(this));
        this.focusInputForDeleteSurround();
      }
      ChangeSurround.__super__.initialize.apply(this, arguments);
      return this.onDidSelectTarget((function(_this) {
        return function() {
          _this.showDeleteCharOnHover();
          return _this.focusInputForSurround();
        };
      })(this));
    };

    ChangeSurround.prototype.onConfirmSurround = function(input1) {
      this.input = input1;
      return this.processOperation();
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
      if (this.isRequireInput()) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3ItdHJhbnNmb3JtLXN0cmluZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG1sQ0FBQTtJQUFBOzs7Ozs7RUFBQSxnQkFBQSxHQUFtQjs7RUFDbkIsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUjs7RUFDSixNQUEyQixPQUFBLENBQVEsTUFBUixDQUEzQixFQUFDLHFDQUFELEVBQWtCOztFQUVsQixPQU1JLE9BQUEsQ0FBUSxTQUFSLENBTkosRUFDRSx3Q0FERixFQUVFLHNDQUZGLEVBR0UsOEJBSEYsRUFJRSxvREFKRixFQUtFOztFQUVGLEtBQUEsR0FBUSxPQUFBLENBQVEscUJBQVI7O0VBQ1IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztFQUNQLFFBQUEsR0FBVyxJQUFJLENBQUMsUUFBTCxDQUFjLFVBQWQ7O0VBSUw7Ozs7Ozs7SUFDSixlQUFDLENBQUEsTUFBRCxDQUFRLEtBQVI7OzhCQUNBLFdBQUEsR0FBYTs7OEJBQ2IsY0FBQSxHQUFnQjs7OEJBQ2hCLFVBQUEsR0FBWTs7OEJBQ1osaUJBQUEsR0FBbUI7O0lBQ25CLGVBQUMsQ0FBQSxrQkFBRCxHQUFxQjs7SUFFckIsZUFBQyxDQUFBLG9CQUFELEdBQXVCLFNBQUE7YUFDckIsSUFBQyxDQUFBLGtCQUFrQixDQUFDLElBQXBCLENBQXlCLElBQXpCO0lBRHFCOzs4QkFHdkIsZUFBQSxHQUFpQixTQUFDLFNBQUQ7QUFDZixVQUFBO01BQUEsSUFBRyxJQUFBLEdBQU8sSUFBQyxDQUFBLFVBQUQsQ0FBWSxTQUFTLENBQUMsT0FBVixDQUFBLENBQVosRUFBaUMsU0FBakMsQ0FBVjtlQUNFLFNBQVMsQ0FBQyxVQUFWLENBQXFCLElBQXJCLEVBQTJCO1VBQUUsWUFBRCxJQUFDLENBQUEsVUFBRjtTQUEz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RXhwID0gLyg/OlxcbnxcXHJcXG4pJC9cbl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57QnVmZmVyZWRQcm9jZXNzLCBSYW5nZX0gPSByZXF1aXJlICdhdG9tJ1xuXG57XG4gIGlzU2luZ2xlTGluZVRleHRcbiAgaXNMaW5ld2lzZVJhbmdlXG4gIGxpbWl0TnVtYmVyXG4gIHRvZ2dsZUNhc2VGb3JDaGFyYWN0ZXJcbiAgc3BsaXRUZXh0QnlOZXdMaW5lXG59ID0gcmVxdWlyZSAnLi91dGlscydcbnN3cmFwID0gcmVxdWlyZSAnLi9zZWxlY3Rpb24td3JhcHBlcidcbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG5PcGVyYXRvciA9IEJhc2UuZ2V0Q2xhc3MoJ09wZXJhdG9yJylcblxuIyBUcmFuc2Zvcm1TdHJpbmdcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFRyYW5zZm9ybVN0cmluZyBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoZmFsc2UpXG4gIHRyYWNrQ2hhbmdlOiB0cnVlXG4gIHN0YXlPcHRpb25OYW1lOiAnc3RheU9uVHJhbnNmb3JtU3RyaW5nJ1xuICBhdXRvSW5kZW50OiBmYWxzZVxuICBhdXRvSW5kZW50TmV3bGluZTogZmFsc2VcbiAgQHN0cmluZ1RyYW5zZm9ybWVyczogW11cblxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3Q6IC0+XG4gICAgQHN0cmluZ1RyYW5zZm9ybWVycy5wdXNoKHRoaXMpXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIGlmIHRleHQgPSBAZ2V0TmV3VGV4dChzZWxlY3Rpb24uZ2V0VGV4dCgpLCBzZWxlY3Rpb24pXG4gICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0LCB7QGF1dG9JbmRlbnR9KVxuXG5jbGFzcyBUb2dnbGVDYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiYEhlbGxvIFdvcmxkYCAtPiBgaEVMTE8gd09STERgXCJcbiAgZGlzcGxheU5hbWU6ICdUb2dnbGUgfidcblxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICB0ZXh0LnJlcGxhY2UoLy4vZywgdG9nZ2xlQ2FzZUZvckNoYXJhY3RlcilcblxuY2xhc3MgVG9nZ2xlQ2FzZUFuZE1vdmVSaWdodCBleHRlbmRzIFRvZ2dsZUNhc2VcbiAgQGV4dGVuZCgpXG4gIGZsYXNoVGFyZ2V0OiBmYWxzZVxuICByZXN0b3JlUG9zaXRpb25zOiBmYWxzZVxuICB0YXJnZXQ6ICdNb3ZlUmlnaHQnXG5cbmNsYXNzIFVwcGVyQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcImBIZWxsbyBXb3JsZGAgLT4gYEhFTExPIFdPUkxEYFwiXG4gIGRpc3BsYXlOYW1lOiAnVXBwZXInXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIHRleHQudG9VcHBlckNhc2UoKVxuXG5jbGFzcyBMb3dlckNhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJgSGVsbG8gV29ybGRgIC0+IGBoZWxsbyB3b3JsZGBcIlxuICBkaXNwbGF5TmFtZTogJ0xvd2VyJ1xuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICB0ZXh0LnRvTG93ZXJDYXNlKClcblxuIyBSZXBsYWNlXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFJlcGxhY2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIGlucHV0OiBudWxsXG4gIGZsYXNoQ2hlY2twb2ludDogJ2RpZC1zZWxlY3Qtb2NjdXJyZW5jZSdcbiAgcmVxdWlyZUlucHV0OiB0cnVlXG4gIGF1dG9JbmRlbnROZXdsaW5lOiB0cnVlXG4gIHN1cHBvcnRFYXJseVNlbGVjdDogdHJ1ZVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgQG9uRGlkU2VsZWN0VGFyZ2V0KEBmb2N1c0lucHV0LmJpbmQodGhpcykpXG4gICAgc3VwZXJcblxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBpZiBAdGFyZ2V0LmlzKCdNb3ZlUmlnaHRCdWZmZXJDb2x1bW4nKSBhbmQgdGV4dC5sZW5ndGggaXNudCBAZ2V0Q291bnQoKVxuICAgICAgcmV0dXJuXG5cbiAgICBpbnB1dCA9IEBnZXRJbnB1dCgpIG9yIFwiXFxuXCJcbiAgICBpZiBpbnB1dCBpcyBcIlxcblwiXG4gICAgICBAcmVzdG9yZVBvc2l0aW9ucyA9IGZhbHNlXG4gICAgdGV4dC5yZXBsYWNlKC8uL2csIGlucHV0KVxuXG5jbGFzcyBSZXBsYWNlQ2hhcmFjdGVyIGV4dGVuZHMgUmVwbGFjZVxuICBAZXh0ZW5kKClcbiAgdGFyZ2V0OiBcIk1vdmVSaWdodEJ1ZmZlckNvbHVtblwiXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBEVVAgbWVhbmluZyB3aXRoIFNwbGl0U3RyaW5nIG5lZWQgY29uc29saWRhdGUuXG5jbGFzcyBTcGxpdEJ5Q2hhcmFjdGVyIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICB0ZXh0LnNwbGl0KCcnKS5qb2luKCcgJylcblxuY2xhc3MgQ2FtZWxDYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBkaXNwbGF5TmFtZTogJ0NhbWVsaXplJ1xuICBAZGVzY3JpcHRpb246IFwiYGhlbGxvLXdvcmxkYCAtPiBgaGVsbG9Xb3JsZGBcIlxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBfLmNhbWVsaXplKHRleHQpXG5cbmNsYXNzIFNuYWtlQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcImBIZWxsb1dvcmxkYCAtPiBgaGVsbG9fd29ybGRgXCJcbiAgZGlzcGxheU5hbWU6ICdVbmRlcnNjb3JlIF8nXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIF8udW5kZXJzY29yZSh0ZXh0KVxuXG5jbGFzcyBQYXNjYWxDYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiYGhlbGxvX3dvcmxkYCAtPiBgSGVsbG9Xb3JsZGBcIlxuICBkaXNwbGF5TmFtZTogJ1Bhc2NhbGl6ZSdcbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgXy5jYXBpdGFsaXplKF8uY2FtZWxpemUodGV4dCkpXG5cbmNsYXNzIERhc2hDYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBkaXNwbGF5TmFtZTogJ0Rhc2hlcml6ZSAtJ1xuICBAZGVzY3JpcHRpb246IFwiSGVsbG9Xb3JsZCAtPiBoZWxsby13b3JsZFwiXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIF8uZGFzaGVyaXplKHRleHQpXG5cbmNsYXNzIFRpdGxlQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcImBIZWxsb1dvcmxkYCAtPiBgSGVsbG8gV29ybGRgXCJcbiAgZGlzcGxheU5hbWU6ICdUaXRsaXplJ1xuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBfLmh1bWFuaXplRXZlbnROYW1lKF8uZGFzaGVyaXplKHRleHQpKVxuXG5jbGFzcyBFbmNvZGVVcmlDb21wb25lbnQgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJgSGVsbG8gV29ybGRgIC0+IGBIZWxsbyUyMFdvcmxkYFwiXG4gIGRpc3BsYXlOYW1lOiAnRW5jb2RlIFVSSSBDb21wb25lbnQgJSdcbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgZW5jb2RlVVJJQ29tcG9uZW50KHRleHQpXG5cbmNsYXNzIERlY29kZVVyaUNvbXBvbmVudCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcImBIZWxsbyUyMFdvcmxkYCAtPiBgSGVsbG8gV29ybGRgXCJcbiAgZGlzcGxheU5hbWU6ICdEZWNvZGUgVVJJIENvbXBvbmVudCAlJSdcbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgZGVjb2RlVVJJQ29tcG9uZW50KHRleHQpXG5cbmNsYXNzIFRyaW1TdHJpbmcgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJgIGhlbGxvIGAgLT4gYGhlbGxvYFwiXG4gIGRpc3BsYXlOYW1lOiAnVHJpbSBzdHJpbmcnXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIHRleHQudHJpbSgpXG5cbmNsYXNzIENvbXBhY3RTcGFjZXMgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJgICBhICAgIGIgICAgY2AgLT4gYGEgYiBjYFwiXG4gIGRpc3BsYXlOYW1lOiAnQ29tcGFjdCBzcGFjZSdcbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgaWYgdGV4dC5tYXRjaCgvXlsgXSskLylcbiAgICAgICcgJ1xuICAgIGVsc2VcbiAgICAgICMgRG9uJ3QgY29tcGFjdCBmb3IgbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGUgc3BhY2VzLlxuICAgICAgdGV4dC5yZXBsYWNlIC9eKFxccyopKC4qPykoXFxzKikkL2dtLCAobSwgbGVhZGluZywgbWlkZGxlLCB0cmFpbGluZykgLT5cbiAgICAgICAgbGVhZGluZyArIG1pZGRsZS5zcGxpdCgvWyBcXHRdKy8pLmpvaW4oJyAnKSArIHRyYWlsaW5nXG5cbmNsYXNzIFJlbW92ZUxlYWRpbmdXaGl0ZVNwYWNlcyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICBAZGVzY3JpcHRpb246IFwiYCAgYSBiIGNgIC0+IGBhIGIgY2BcIlxuICBnZXROZXdUZXh0OiAodGV4dCwgc2VsZWN0aW9uKSAtPlxuICAgIHRyaW1MZWZ0ID0gKHRleHQpIC0+IHRleHQudHJpbUxlZnQoKVxuICAgIHNwbGl0VGV4dEJ5TmV3TGluZSh0ZXh0KS5tYXAodHJpbUxlZnQpLmpvaW4oXCJcXG5cIikgKyBcIlxcblwiXG5cbmNsYXNzIENvbnZlcnRUb1NvZnRUYWIgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIGRpc3BsYXlOYW1lOiAnU29mdCBUYWInXG4gIHdpc2U6ICdsaW5ld2lzZSdcblxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgQHNjYW5Gb3J3YXJkIC9cXHQvZywge3NjYW5SYW5nZTogc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCl9LCAoe3JhbmdlLCByZXBsYWNlfSkgPT5cbiAgICAgICMgUmVwbGFjZSBcXHQgdG8gc3BhY2VzIHdoaWNoIGxlbmd0aCBpcyB2YXJ5IGRlcGVuZGluZyBvbiB0YWJTdG9wIGFuZCB0YWJMZW5naHRcbiAgICAgICMgU28gd2UgZGlyZWN0bHkgY29uc3VsdCBpdCdzIHNjcmVlbiByZXByZXNlbnRpbmcgbGVuZ3RoLlxuICAgICAgbGVuZ3RoID0gQGVkaXRvci5zY3JlZW5SYW5nZUZvckJ1ZmZlclJhbmdlKHJhbmdlKS5nZXRFeHRlbnQoKS5jb2x1bW5cbiAgICAgIHJlcGxhY2UoXCIgXCIucmVwZWF0KGxlbmd0aCkpXG5cbmNsYXNzIENvbnZlcnRUb0hhcmRUYWIgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIGRpc3BsYXlOYW1lOiAnSGFyZCBUYWInXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIHRhYkxlbmd0aCA9IEBlZGl0b3IuZ2V0VGFiTGVuZ3RoKClcbiAgICBAc2NhbkZvcndhcmQgL1sgXFx0XSsvZywge3NjYW5SYW5nZTogc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCl9LCAoe3JhbmdlLCByZXBsYWNlfSkgPT5cbiAgICAgIHtzdGFydCwgZW5kfSA9IEBlZGl0b3Iuc2NyZWVuUmFuZ2VGb3JCdWZmZXJSYW5nZShyYW5nZSlcbiAgICAgIHN0YXJ0Q29sdW1uID0gc3RhcnQuY29sdW1uXG4gICAgICBlbmRDb2x1bW4gPSBlbmQuY29sdW1uXG5cbiAgICAgICMgV2UgY2FuJ3QgbmFpdmVseSByZXBsYWNlIHNwYWNlcyB0byB0YWIsIHdlIGhhdmUgdG8gY29uc2lkZXIgdmFsaWQgdGFiU3RvcCBjb2x1bW5cbiAgICAgICMgSWYgbmV4dFRhYlN0b3AgY29sdW1uIGV4Y2VlZHMgcmVwbGFjYWJsZSByYW5nZSwgd2UgcGFkIHdpdGggc3BhY2VzLlxuICAgICAgbmV3VGV4dCA9ICcnXG4gICAgICBsb29wXG4gICAgICAgIHJlbWFpbmRlciA9IHN0YXJ0Q29sdW1uICUlIHRhYkxlbmd0aFxuICAgICAgICBuZXh0VGFiU3RvcCA9IHN0YXJ0Q29sdW1uICsgKGlmIHJlbWFpbmRlciBpcyAwIHRoZW4gdGFiTGVuZ3RoIGVsc2UgcmVtYWluZGVyKVxuICAgICAgICBpZiBuZXh0VGFiU3RvcCA+IGVuZENvbHVtblxuICAgICAgICAgIG5ld1RleHQgKz0gXCIgXCIucmVwZWF0KGVuZENvbHVtbiAtIHN0YXJ0Q29sdW1uKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgbmV3VGV4dCArPSBcIlxcdFwiXG4gICAgICAgIHN0YXJ0Q29sdW1uID0gbmV4dFRhYlN0b3BcbiAgICAgICAgYnJlYWsgaWYgc3RhcnRDb2x1bW4gPj0gZW5kQ29sdW1uXG5cbiAgICAgIHJlcGxhY2UobmV3VGV4dClcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBUcmFuc2Zvcm1TdHJpbmdCeUV4dGVybmFsQ29tbWFuZCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKGZhbHNlKVxuICBhdXRvSW5kZW50OiB0cnVlXG4gIGNvbW1hbmQ6ICcnICMgZS5nLiBjb21tYW5kOiAnc29ydCdcbiAgYXJnczogW10gIyBlLmcgYXJnczogWyctcm4nXVxuICBzdGRvdXRCeVNlbGVjdGlvbjogbnVsbFxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgQG5vcm1hbGl6ZVNlbGVjdGlvbnNJZk5lY2Vzc2FyeSgpXG4gICAgaWYgQHNlbGVjdFRhcmdldCgpXG4gICAgICBuZXcgUHJvbWlzZSAocmVzb2x2ZSkgPT5cbiAgICAgICAgQGNvbGxlY3QocmVzb2x2ZSlcbiAgICAgIC50aGVuID0+XG4gICAgICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgICB0ZXh0ID0gQGdldE5ld1RleHQoc2VsZWN0aW9uLmdldFRleHQoKSwgc2VsZWN0aW9uKVxuICAgICAgICAgIHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQsIHtAYXV0b0luZGVudH0pXG4gICAgICAgIEByZXN0b3JlQ3Vyc29yUG9zaXRpb25zSWZOZWNlc3NhcnkoKVxuICAgICAgICBAYWN0aXZhdGVNb2RlKEBmaW5hbE1vZGUsIEBmaW5hbFN1Ym1vZGUpXG5cbiAgY29sbGVjdDogKHJlc29sdmUpIC0+XG4gICAgQHN0ZG91dEJ5U2VsZWN0aW9uID0gbmV3IE1hcFxuICAgIHByb2Nlc3NSdW5uaW5nID0gcHJvY2Vzc0ZpbmlzaGVkID0gMFxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIHtjb21tYW5kLCBhcmdzfSA9IEBnZXRDb21tYW5kKHNlbGVjdGlvbikgPyB7fVxuICAgICAgcmV0dXJuIHVubGVzcyAoY29tbWFuZD8gYW5kIGFyZ3M/KVxuICAgICAgcHJvY2Vzc1J1bm5pbmcrK1xuICAgICAgZG8gKHNlbGVjdGlvbikgPT5cbiAgICAgICAgc3RkaW4gPSBAZ2V0U3RkaW4oc2VsZWN0aW9uKVxuICAgICAgICBzdGRvdXQgPSAob3V0cHV0KSA9PlxuICAgICAgICAgIEBzdGRvdXRCeVNlbGVjdGlvbi5zZXQoc2VsZWN0aW9uLCBvdXRwdXQpXG4gICAgICAgIGV4aXQgPSAoY29kZSkgLT5cbiAgICAgICAgICBwcm9jZXNzRmluaXNoZWQrK1xuICAgICAgICAgIHJlc29sdmUoKSBpZiAocHJvY2Vzc1J1bm5pbmcgaXMgcHJvY2Vzc0ZpbmlzaGVkKVxuICAgICAgICBAcnVuRXh0ZXJuYWxDb21tYW5kIHtjb21tYW5kLCBhcmdzLCBzdGRvdXQsIGV4aXQsIHN0ZGlufVxuXG4gIHJ1bkV4dGVybmFsQ29tbWFuZDogKG9wdGlvbnMpIC0+XG4gICAgc3RkaW4gPSBvcHRpb25zLnN0ZGluXG4gICAgZGVsZXRlIG9wdGlvbnMuc3RkaW5cbiAgICBidWZmZXJlZFByb2Nlc3MgPSBuZXcgQnVmZmVyZWRQcm9jZXNzKG9wdGlvbnMpXG4gICAgYnVmZmVyZWRQcm9jZXNzLm9uV2lsbFRocm93RXJyb3IgKHtlcnJvciwgaGFuZGxlfSkgPT5cbiAgICAgICMgU3VwcHJlc3MgY29tbWFuZCBub3QgZm91bmQgZXJyb3IgaW50ZW50aW9uYWxseS5cbiAgICAgIGlmIGVycm9yLmNvZGUgaXMgJ0VOT0VOVCcgYW5kIGVycm9yLnN5c2NhbGwuaW5kZXhPZignc3Bhd24nKSBpcyAwXG4gICAgICAgIGNvbW1hbmROYW1lID0gQGNvbnN0cnVjdG9yLmdldENvbW1hbmROYW1lKClcbiAgICAgICAgY29uc29sZS5sb2cgXCIje2NvbW1hbmROYW1lfTogRmFpbGVkIHRvIHNwYXduIGNvbW1hbmQgI3tlcnJvci5wYXRofS5cIlxuICAgICAgICBoYW5kbGUoKVxuICAgICAgQGNhbmNlbE9wZXJhdGlvbigpXG5cbiAgICBpZiBzdGRpblxuICAgICAgYnVmZmVyZWRQcm9jZXNzLnByb2Nlc3Muc3RkaW4ud3JpdGUoc3RkaW4pXG4gICAgICBidWZmZXJlZFByb2Nlc3MucHJvY2Vzcy5zdGRpbi5lbmQoKVxuXG4gIGdldE5ld1RleHQ6ICh0ZXh0LCBzZWxlY3Rpb24pIC0+XG4gICAgQGdldFN0ZG91dChzZWxlY3Rpb24pID8gdGV4dFxuXG4gICMgRm9yIGVhc2lseSBleHRlbmQgYnkgdm1wIHBsdWdpbi5cbiAgZ2V0Q29tbWFuZDogKHNlbGVjdGlvbikgLT4ge0Bjb21tYW5kLCBAYXJnc31cbiAgZ2V0U3RkaW46IChzZWxlY3Rpb24pIC0+IHNlbGVjdGlvbi5nZXRUZXh0KClcbiAgZ2V0U3Rkb3V0OiAoc2VsZWN0aW9uKSAtPiBAc3Rkb3V0QnlTZWxlY3Rpb24uZ2V0KHNlbGVjdGlvbilcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBUcmFuc2Zvcm1TdHJpbmdCeVNlbGVjdExpc3QgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJJbnRlcmFjdGl2ZWx5IGNob29zZSBzdHJpbmcgdHJhbnNmb3JtYXRpb24gb3BlcmF0b3IgZnJvbSBzZWxlY3QtbGlzdFwiXG4gIEBzZWxlY3RMaXN0SXRlbXM6IG51bGxcbiAgcmVxdWlyZUlucHV0OiB0cnVlXG5cbiAgZ2V0SXRlbXM6IC0+XG4gICAgQGNvbnN0cnVjdG9yLnNlbGVjdExpc3RJdGVtcyA/PSBAY29uc3RydWN0b3Iuc3RyaW5nVHJhbnNmb3JtZXJzLm1hcCAoa2xhc3MpIC0+XG4gICAgICBpZiBrbGFzczo6aGFzT3duUHJvcGVydHkoJ2Rpc3BsYXlOYW1lJylcbiAgICAgICAgZGlzcGxheU5hbWUgPSBrbGFzczo6ZGlzcGxheU5hbWVcbiAgICAgIGVsc2VcbiAgICAgICAgZGlzcGxheU5hbWUgPSBfLmh1bWFuaXplRXZlbnROYW1lKF8uZGFzaGVyaXplKGtsYXNzLm5hbWUpKVxuICAgICAge25hbWU6IGtsYXNzLCBkaXNwbGF5TmFtZX1cblxuICBpbml0aWFsaXplOiAtPlxuICAgIHN1cGVyXG5cbiAgICBAdmltU3RhdGUub25EaWRDb25maXJtU2VsZWN0TGlzdCAoaXRlbSkgPT5cbiAgICAgIHRyYW5zZm9ybWVyID0gaXRlbS5uYW1lXG4gICAgICBAdGFyZ2V0ID0gdHJhbnNmb3JtZXI6OnRhcmdldCBpZiB0cmFuc2Zvcm1lcjo6dGFyZ2V0P1xuICAgICAgQHZpbVN0YXRlLnJlc2V0KClcbiAgICAgIGlmIEB0YXJnZXQ/XG4gICAgICAgIEB2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5ydW4odHJhbnNmb3JtZXIsIHtAdGFyZ2V0fSlcbiAgICAgIGVsc2VcbiAgICAgICAgQHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bih0cmFuc2Zvcm1lcilcblxuICAgIEBmb2N1c1NlbGVjdExpc3QoaXRlbXM6IEBnZXRJdGVtcygpKVxuXG4gIGV4ZWN1dGU6IC0+XG4gICAgIyBORVZFUiBiZSBleGVjdXRlZCBzaW5jZSBvcGVyYXRpb25TdGFjayBpcyByZXBsYWNlZCB3aXRoIHNlbGVjdGVkIHRyYW5zZm9ybWVyXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiI3tAZ2V0TmFtZSgpfSBzaG91bGQgbm90IGJlIGV4ZWN1dGVkXCIpXG5cbmNsYXNzIFRyYW5zZm9ybVdvcmRCeVNlbGVjdExpc3QgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdCeVNlbGVjdExpc3RcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogXCJJbm5lcldvcmRcIlxuXG5jbGFzcyBUcmFuc2Zvcm1TbWFydFdvcmRCeVNlbGVjdExpc3QgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdCeVNlbGVjdExpc3RcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJUcmFuc2Zvcm0gSW5uZXJTbWFydFdvcmQgYnkgYHRyYW5zZm9ybS1zdHJpbmctYnktc2VsZWN0LWxpc3RgXCJcbiAgdGFyZ2V0OiBcIklubmVyU21hcnRXb3JkXCJcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBSZXBsYWNlV2l0aFJlZ2lzdGVyIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiUmVwbGFjZSB0YXJnZXQgd2l0aCBzcGVjaWZpZWQgcmVnaXN0ZXIgdmFsdWVcIlxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBAdmltU3RhdGUucmVnaXN0ZXIuZ2V0VGV4dCgpXG5cbiMgU2F2ZSB0ZXh0IHRvIHJlZ2lzdGVyIGJlZm9yZSByZXBsYWNlXG5jbGFzcyBTd2FwV2l0aFJlZ2lzdGVyIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiU3dhcCByZWdpc3RlciB2YWx1ZSB3aXRoIHRhcmdldFwiXG4gIGdldE5ld1RleHQ6ICh0ZXh0LCBzZWxlY3Rpb24pIC0+XG4gICAgbmV3VGV4dCA9IEB2aW1TdGF0ZS5yZWdpc3Rlci5nZXRUZXh0KClcbiAgICBAc2V0VGV4dFRvUmVnaXN0ZXIodGV4dCwgc2VsZWN0aW9uKVxuICAgIG5ld1RleHRcblxuIyBJbmRlbnQgPCBUcmFuc2Zvcm1TdHJpbmdcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgSW5kZW50IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBzdGF5QnlNYXJrZXI6IHRydWVcbiAgc2V0VG9GaXJzdENoYXJhY3Rlck9uTGluZXdpc2U6IHRydWVcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICAjIE5lZWQgY291bnQgdGltZXMgaW5kZW50YXRpb24gaW4gdmlzdWFsLW1vZGUgYW5kIGl0cyByZXBlYXQoYC5gKS5cbiAgICBpZiBAdGFyZ2V0LmlzKCdDdXJyZW50U2VsZWN0aW9uJylcbiAgICAgIG9sZFRleHQgPSBudWxsXG4gICAgICAgIyBsaW1pdCB0byAxMDAgdG8gYXZvaWQgZnJlZXppbmcgYnkgYWNjaWRlbnRhbCBiaWcgbnVtYmVyLlxuICAgICAgY291bnQgPSBsaW1pdE51bWJlcihAZ2V0Q291bnQoKSwgbWF4OiAxMDApXG4gICAgICBAY291bnRUaW1lcyBjb3VudCwgKHtzdG9wfSkgPT5cbiAgICAgICAgb2xkVGV4dCA9IHNlbGVjdGlvbi5nZXRUZXh0KClcbiAgICAgICAgQGluZGVudChzZWxlY3Rpb24pXG4gICAgICAgIHN0b3AoKSBpZiBzZWxlY3Rpb24uZ2V0VGV4dCgpIGlzIG9sZFRleHRcbiAgICBlbHNlXG4gICAgICBAaW5kZW50KHNlbGVjdGlvbilcblxuICBpbmRlbnQ6IChzZWxlY3Rpb24pIC0+XG4gICAgc2VsZWN0aW9uLmluZGVudFNlbGVjdGVkUm93cygpXG5cbmNsYXNzIE91dGRlbnQgZXh0ZW5kcyBJbmRlbnRcbiAgQGV4dGVuZCgpXG4gIGluZGVudDogKHNlbGVjdGlvbikgLT5cbiAgICBzZWxlY3Rpb24ub3V0ZGVudFNlbGVjdGVkUm93cygpXG5cbmNsYXNzIEF1dG9JbmRlbnQgZXh0ZW5kcyBJbmRlbnRcbiAgQGV4dGVuZCgpXG4gIGluZGVudDogKHNlbGVjdGlvbikgLT5cbiAgICBzZWxlY3Rpb24uYXV0b0luZGVudFNlbGVjdGVkUm93cygpXG5cbmNsYXNzIFRvZ2dsZUxpbmVDb21tZW50cyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgc3RheUJ5TWFya2VyOiB0cnVlXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBzZWxlY3Rpb24udG9nZ2xlTGluZUNvbW1lbnRzKClcblxuY2xhc3MgQXV0b0Zsb3cgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKEBlZGl0b3JFbGVtZW50LCAnYXV0b2Zsb3c6cmVmbG93LXNlbGVjdGlvbicpXG5cbiMgU3Vycm91bmQgPCBUcmFuc2Zvcm1TdHJpbmdcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgU3Vycm91bmRCYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoZmFsc2UpXG4gIHBhaXJzOiBbXG4gICAgWydbJywgJ10nXVxuICAgIFsnKCcsICcpJ11cbiAgICBbJ3snLCAnfSddXG4gICAgWyc8JywgJz4nXVxuICBdXG4gIHBhaXJDaGFyc0FsbG93Rm9yd2FyZGluZzogJ1tdKCl7fSdcbiAgaW5wdXQ6IG51bGxcbiAgYXV0b0luZGVudDogZmFsc2VcblxuICByZXF1aXJlSW5wdXQ6IHRydWVcbiAgcmVxdWlyZVRhcmdldDogdHJ1ZVxuICBzdXBwb3J0RWFybHlTZWxlY3Q6IHRydWUgIyBFeHBlcmltZW50YWxcblxuICBmb2N1c0lucHV0Rm9yU3Vycm91bmQ6IC0+XG4gICAgaW5wdXRVSSA9IEBuZXdJbnB1dFVJKClcbiAgICBpbnB1dFVJLm9uRGlkQ29uZmlybShAb25Db25maXJtU3Vycm91bmQuYmluZCh0aGlzKSlcbiAgICBpbnB1dFVJLm9uRGlkQ2FuY2VsKEBjYW5jZWxPcGVyYXRpb24uYmluZCh0aGlzKSlcbiAgICBpbnB1dFVJLmZvY3VzKClcblxuICBmb2N1c0lucHV0Rm9yRGVsZXRlU3Vycm91bmQ6IC0+XG4gICAgaW5wdXRVSSA9IEBuZXdJbnB1dFVJKClcbiAgICBpbnB1dFVJLm9uRGlkQ29uZmlybShAb25Db25maXJtRGVsZXRlU3Vycm91bmQuYmluZCh0aGlzKSlcbiAgICBpbnB1dFVJLm9uRGlkQ2FuY2VsKEBjYW5jZWxPcGVyYXRpb24uYmluZCh0aGlzKSlcbiAgICBpbnB1dFVJLmZvY3VzKClcblxuICBnZXRQYWlyOiAoY2hhcikgLT5cbiAgICBpZiBwYWlyID0gXy5kZXRlY3QoQHBhaXJzLCAocGFpcikgLT4gY2hhciBpbiBwYWlyKVxuICAgICAgcGFpclxuICAgIGVsc2VcbiAgICAgIFtjaGFyLCBjaGFyXVxuXG4gIHN1cnJvdW5kOiAodGV4dCwgY2hhciwgb3B0aW9ucz17fSkgLT5cbiAgICBrZWVwTGF5b3V0ID0gb3B0aW9ucy5rZWVwTGF5b3V0ID8gZmFsc2VcbiAgICBbb3BlbiwgY2xvc2VdID0gQGdldFBhaXIoY2hhcilcbiAgICBpZiAobm90IGtlZXBMYXlvdXQpIGFuZCBMaW5lRW5kaW5nUmVnRXhwLnRlc3QodGV4dClcbiAgICAgIEBhdXRvSW5kZW50ID0gdHJ1ZSAjIFtGSVhNRV1cbiAgICAgIG9wZW4gKz0gXCJcXG5cIlxuICAgICAgY2xvc2UgKz0gXCJcXG5cIlxuXG4gICAgaWYgY2hhciBpbiBAZ2V0Q29uZmlnKCdjaGFyYWN0ZXJzVG9BZGRTcGFjZU9uU3Vycm91bmQnKSBhbmQgaXNTaW5nbGVMaW5lVGV4dCh0ZXh0KVxuICAgICAgdGV4dCA9ICcgJyArIHRleHQgKyAnICdcblxuICAgIG9wZW4gKyB0ZXh0ICsgY2xvc2VcblxuICBkZWxldGVTdXJyb3VuZDogKHRleHQpIC0+XG4gICAgW29wZW4sIGlubmVyVGV4dC4uLiwgY2xvc2VdID0gdGV4dFxuICAgIGlubmVyVGV4dCA9IGlubmVyVGV4dC5qb2luKCcnKVxuICAgIGlmIGlzU2luZ2xlTGluZVRleHQodGV4dCkgYW5kIChvcGVuIGlzbnQgY2xvc2UpXG4gICAgICBpbm5lclRleHQudHJpbSgpXG4gICAgZWxzZVxuICAgICAgaW5uZXJUZXh0XG5cbiAgb25Db25maXJtU3Vycm91bmQ6IChAaW5wdXQpIC0+XG4gICAgQHByb2Nlc3NPcGVyYXRpb24oKVxuXG4gIG9uQ29uZmlybURlbGV0ZVN1cnJvdW5kOiAoY2hhcikgLT5cbiAgICBAc2V0VGFyZ2V0IEBuZXcoJ0FQYWlyJywgcGFpcjogQGdldFBhaXIoY2hhcikpXG5cbmNsYXNzIFN1cnJvdW5kIGV4dGVuZHMgU3Vycm91bmRCYXNlXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiU3Vycm91bmQgdGFyZ2V0IGJ5IHNwZWNpZmllZCBjaGFyYWN0ZXIgbGlrZSBgKGAsIGBbYCwgYFxcXCJgXCJcblxuICBpbml0aWFsaXplOiAtPlxuICAgIEBvbkRpZFNlbGVjdFRhcmdldChAZm9jdXNJbnB1dEZvclN1cnJvdW5kLmJpbmQodGhpcykpXG4gICAgc3VwZXJcblxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBAc3Vycm91bmQodGV4dCwgQGlucHV0KVxuXG5jbGFzcyBTdXJyb3VuZFdvcmQgZXh0ZW5kcyBTdXJyb3VuZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlN1cnJvdW5kICoqd29yZCoqXCJcbiAgdGFyZ2V0OiAnSW5uZXJXb3JkJ1xuXG5jbGFzcyBTdXJyb3VuZFNtYXJ0V29yZCBleHRlbmRzIFN1cnJvdW5kXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiU3Vycm91bmQgKipzbWFydC13b3JkKipcIlxuICB0YXJnZXQ6ICdJbm5lclNtYXJ0V29yZCdcblxuY2xhc3MgTWFwU3Vycm91bmQgZXh0ZW5kcyBTdXJyb3VuZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlN1cnJvdW5kIGVhY2ggd29yZChgL1xcdysvYCkgd2l0aGluIHRhcmdldFwiXG4gIG9jY3VycmVuY2U6IHRydWVcbiAgcGF0dGVybkZvck9jY3VycmVuY2U6IC9cXHcrL2dcblxuIyBEZWxldGUgU3Vycm91bmRcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgRGVsZXRlU3Vycm91bmQgZXh0ZW5kcyBTdXJyb3VuZEJhc2VcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJEZWxldGUgc3BlY2lmaWVkIHN1cnJvdW5kIGNoYXJhY3RlciBsaWtlIGAoYCwgYFtgLCBgXFxcImBcIlxuICByZXF1aXJlVGFyZ2V0OiBmYWxzZVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgQGZvY3VzSW5wdXRGb3JEZWxldGVTdXJyb3VuZCgpIHVubGVzcyBAaGFzVGFyZ2V0KClcbiAgICBzdXBlclxuXG4gIG9uQ29uZmlybURlbGV0ZVN1cnJvdW5kOiAoaW5wdXQpIC0+XG4gICAgc3VwZXJcbiAgICBAaW5wdXQgPSBpbnB1dFxuICAgIEBwcm9jZXNzT3BlcmF0aW9uKClcblxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBAZGVsZXRlU3Vycm91bmQodGV4dClcblxuY2xhc3MgRGVsZXRlU3Vycm91bmRBbnlQYWlyIGV4dGVuZHMgRGVsZXRlU3Vycm91bmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJEZWxldGUgc3Vycm91bmQgY2hhcmFjdGVyIGJ5IGF1dG8tZGV0ZWN0IHBhaXJlZCBjaGFyIGZyb20gY3Vyc29yIGVuY2xvc2VkIHBhaXJcIlxuICB0YXJnZXQ6ICdBQW55UGFpcidcbiAgcmVxdWlyZUlucHV0OiBmYWxzZVxuXG5jbGFzcyBEZWxldGVTdXJyb3VuZEFueVBhaXJBbGxvd0ZvcndhcmRpbmcgZXh0ZW5kcyBEZWxldGVTdXJyb3VuZEFueVBhaXJcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJEZWxldGUgc3Vycm91bmQgY2hhcmFjdGVyIGJ5IGF1dG8tZGV0ZWN0IHBhaXJlZCBjaGFyIGZyb20gY3Vyc29yIGVuY2xvc2VkIHBhaXIgYW5kIGZvcndhcmRpbmcgcGFpciB3aXRoaW4gc2FtZSBsaW5lXCJcbiAgdGFyZ2V0OiAnQUFueVBhaXJBbGxvd0ZvcndhcmRpbmcnXG5cbiMgQ2hhbmdlIFN1cnJvdW5kXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIENoYW5nZVN1cnJvdW5kIGV4dGVuZHMgU3Vycm91bmRCYXNlXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiQ2hhbmdlIHN1cnJvdW5kIGNoYXJhY3Rlciwgc3BlY2lmeSBib3RoIGZyb20gYW5kIHRvIHBhaXIgY2hhclwiXG5cbiAgc2hvd0RlbGV0ZUNoYXJPbkhvdmVyOiAtPlxuICAgIGNoYXIgPSBAZWRpdG9yLmdldFNlbGVjdGVkVGV4dCgpWzBdXG4gICAgQHZpbVN0YXRlLmhvdmVyLnNldChjaGFyLCBAdmltU3RhdGUuZ2V0T3JpZ2luYWxDdXJzb3JQb3NpdGlvbigpKVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgaWYgQGhhc1RhcmdldCgpXG4gICAgICBAb25EaWRGYWlsU2VsZWN0VGFyZ2V0KEBhYm9ydC5iaW5kKHRoaXMpKVxuICAgIGVsc2VcbiAgICAgIEBvbkRpZEZhaWxTZWxlY3RUYXJnZXQoQGNhbmNlbE9wZXJhdGlvbi5iaW5kKHRoaXMpKVxuICAgICAgQGZvY3VzSW5wdXRGb3JEZWxldGVTdXJyb3VuZCgpXG4gICAgc3VwZXJcblxuICAgIEBvbkRpZFNlbGVjdFRhcmdldCA9PlxuICAgICAgQHNob3dEZWxldGVDaGFyT25Ib3ZlcigpXG4gICAgICBAZm9jdXNJbnB1dEZvclN1cnJvdW5kKClcblxuICBvbkNvbmZpcm1TdXJyb3VuZDogKEBpbnB1dCkgLT5cbiAgICBAcHJvY2Vzc09wZXJhdGlvbigpXG5cbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgaW5uZXJUZXh0ID0gQGRlbGV0ZVN1cnJvdW5kKHRleHQpXG4gICAgQHN1cnJvdW5kKGlubmVyVGV4dCwgQGlucHV0LCBrZWVwTGF5b3V0OiB0cnVlKVxuXG5jbGFzcyBDaGFuZ2VTdXJyb3VuZEFueVBhaXIgZXh0ZW5kcyBDaGFuZ2VTdXJyb3VuZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIkNoYW5nZSBzdXJyb3VuZCBjaGFyYWN0ZXIsIGZyb20gY2hhciBpcyBhdXRvLWRldGVjdGVkXCJcbiAgdGFyZ2V0OiBcIkFBbnlQYWlyXCJcblxuY2xhc3MgQ2hhbmdlU3Vycm91bmRBbnlQYWlyQWxsb3dGb3J3YXJkaW5nIGV4dGVuZHMgQ2hhbmdlU3Vycm91bmRBbnlQYWlyXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiQ2hhbmdlIHN1cnJvdW5kIGNoYXJhY3RlciwgZnJvbSBjaGFyIGlzIGF1dG8tZGV0ZWN0ZWQgZnJvbSBlbmNsb3NlZCBhbmQgZm9yd2FyZGluZyBhcmVhXCJcbiAgdGFyZ2V0OiBcIkFBbnlQYWlyQWxsb3dGb3J3YXJkaW5nXCJcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEZJWE1FXG4jIEN1cnJlbnRseSBuYXRpdmUgZWRpdG9yLmpvaW5MaW5lcygpIGlzIGJldHRlciBmb3IgY3Vyc29yIHBvc2l0aW9uIHNldHRpbmdcbiMgU28gSSB1c2UgbmF0aXZlIG1ldGhvZHMgZm9yIGEgbWVhbndoaWxlLlxuY2xhc3MgSm9pbiBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgdGFyZ2V0OiBcIk1vdmVUb1JlbGF0aXZlTGluZVwiXG4gIGZsYXNoVGFyZ2V0OiBmYWxzZVxuICByZXN0b3JlUG9zaXRpb25zOiBmYWxzZVxuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBpZiBpc0xpbmV3aXNlUmFuZ2UocmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKSlcbiAgICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShyYW5nZS50cmFuc2xhdGUoWzAsIDBdLCBbLTEsIEluZmluaXR5XSkpXG4gICAgc2VsZWN0aW9uLmpvaW5MaW5lcygpXG4gICAgZW5kID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuZW5kXG4gICAgc2VsZWN0aW9uLmN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihlbmQudHJhbnNsYXRlKFswLCAtMV0pKVxuXG5jbGFzcyBKb2luQmFzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKGZhbHNlKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIHRyaW06IGZhbHNlXG4gIHRhcmdldDogXCJNb3ZlVG9SZWxhdGl2ZUxpbmVNaW5pbXVtT25lXCJcblxuICBpbml0aWFsaXplOiAtPlxuICAgIEBmb2N1c0lucHV0KDEwKSBpZiBAaXNSZXF1aXJlSW5wdXQoKVxuICAgIHN1cGVyXG5cbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgaWYgQHRyaW1cbiAgICAgIHBhdHRlcm4gPSAvXFxyP1xcblsgXFx0XSovZ1xuICAgIGVsc2VcbiAgICAgIHBhdHRlcm4gPSAvXFxyP1xcbi9nXG4gICAgdGV4dC50cmltUmlnaHQoKS5yZXBsYWNlKHBhdHRlcm4sIEBpbnB1dCkgKyBcIlxcblwiXG5cbmNsYXNzIEpvaW5XaXRoS2VlcGluZ1NwYWNlIGV4dGVuZHMgSm9pbkJhc2VcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIGlucHV0OiAnJ1xuXG5jbGFzcyBKb2luQnlJbnB1dCBleHRlbmRzIEpvaW5CYXNlXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiVHJhbnNmb3JtIG11bHRpLWxpbmUgdG8gc2luZ2xlLWxpbmUgYnkgd2l0aCBzcGVjaWZpZWQgc2VwYXJhdG9yIGNoYXJhY3RlclwiXG4gIHJlcXVpcmVJbnB1dDogdHJ1ZVxuICB0cmltOiB0cnVlXG5cbmNsYXNzIEpvaW5CeUlucHV0V2l0aEtlZXBpbmdTcGFjZSBleHRlbmRzIEpvaW5CeUlucHV0XG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiSm9pbiBsaW5lcyB3aXRob3V0IHBhZGRpbmcgc3BhY2UgYmV0d2VlbiBlYWNoIGxpbmVcIlxuICB0cmltOiBmYWxzZVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgU3RyaW5nIHN1ZmZpeCBpbiBuYW1lIGlzIHRvIGF2b2lkIGNvbmZ1c2lvbiB3aXRoICdzcGxpdCcgd2luZG93LlxuY2xhc3MgU3BsaXRTdHJpbmcgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTcGxpdCBzaW5nbGUtbGluZSBpbnRvIG11bHRpLWxpbmUgYnkgc3BsaXR0aW5nIHNwZWNpZmllZCBzZXBhcmF0b3IgY2hhcnNcIlxuICByZXF1aXJlSW5wdXQ6IHRydWVcbiAgaW5wdXQ6IG51bGxcbiAgdGFyZ2V0OiBcIk1vdmVUb1JlbGF0aXZlTGluZVwiXG4gIGtlZXBTcGxpdHRlcjogZmFsc2VcblxuICBpbml0aWFsaXplOiAtPlxuICAgIEBvbkRpZFNldFRhcmdldCA9PlxuICAgICAgQGZvY3VzSW5wdXQoMTApXG4gICAgc3VwZXJcblxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBpbnB1dCA9IEBpbnB1dCBvciBcIlxcXFxuXCJcbiAgICByZWdleCA9IC8vLyN7Xy5lc2NhcGVSZWdFeHAoaW5wdXQpfS8vL2dcbiAgICBpZiBAa2VlcFNwbGl0dGVyXG4gICAgICBsaW5lU2VwYXJhdG9yID0gQGlucHV0ICsgXCJcXG5cIlxuICAgIGVsc2VcbiAgICAgIGxpbmVTZXBhcmF0b3IgPSBcIlxcblwiXG4gICAgdGV4dC5yZXBsYWNlKHJlZ2V4LCBsaW5lU2VwYXJhdG9yKVxuXG5jbGFzcyBTcGxpdFN0cmluZ1dpdGhLZWVwaW5nU3BsaXR0ZXIgZXh0ZW5kcyBTcGxpdFN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAga2VlcFNwbGl0dGVyOiB0cnVlXG5cbmNsYXNzIENoYW5nZU9yZGVyIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoZmFsc2UpXG4gIHdpc2U6ICdsaW5ld2lzZSdcblxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBAZ2V0TmV3Um93cyhzcGxpdFRleHRCeU5ld0xpbmUodGV4dCkpLmpvaW4oXCJcXG5cIikgKyBcIlxcblwiXG5cbmNsYXNzIFJldmVyc2UgZXh0ZW5kcyBDaGFuZ2VPcmRlclxuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcIlJldmVyc2UgbGluZXMoZS5nIHJldmVyc2Ugc2VsZWN0ZWQgdGhyZWUgbGluZSlcIlxuICBnZXROZXdSb3dzOiAocm93cykgLT5cbiAgICByb3dzLnJldmVyc2UoKVxuXG5jbGFzcyBTb3J0IGV4dGVuZHMgQ2hhbmdlT3JkZXJcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTb3J0IGxpbmVzIGFscGhhYmV0aWNhbGx5XCJcbiAgZ2V0TmV3Um93czogKHJvd3MpIC0+XG4gICAgcm93cy5zb3J0KClcblxuY2xhc3MgU29ydENhc2VJbnNlbnNpdGl2ZWx5IGV4dGVuZHMgQ2hhbmdlT3JkZXJcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTb3J0IGxpbmVzIGFscGhhYmV0aWNhbGx5IChjYXNlIGluc2Vuc2l0aXZlKVwiXG4gIGdldE5ld1Jvd3M6IChyb3dzKSAtPlxuICAgIHJvd3Muc29ydCAocm93QSwgcm93QikgLT5cbiAgICAgIHJvd0EubG9jYWxlQ29tcGFyZShyb3dCLCBzZW5zaXRpdml0eTogJ2Jhc2UnKVxuXG5jbGFzcyBTb3J0QnlOdW1iZXIgZXh0ZW5kcyBDaGFuZ2VPcmRlclxuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcIlNvcnQgbGluZXMgbnVtZXJpY2FsbHlcIlxuICBnZXROZXdSb3dzOiAocm93cykgLT5cbiAgICBfLnNvcnRCeSByb3dzLCAocm93KSAtPlxuICAgICAgTnVtYmVyLnBhcnNlSW50KHJvdykgb3IgSW5maW5pdHlcbiJdfQ==
