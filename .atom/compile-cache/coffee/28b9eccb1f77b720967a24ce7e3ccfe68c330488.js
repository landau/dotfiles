(function() {
  var AutoFlow, AutoIndent, Base, BufferedProcess, CamelCase, ChangeOrder, ChangeSurround, ChangeSurroundAnyPair, ChangeSurroundAnyPairAllowForwarding, CompactSpaces, ConvertToHardTab, ConvertToSoftTab, DashCase, DecodeUriComponent, DeleteSurround, DeleteSurroundAnyPair, DeleteSurroundAnyPairAllowForwarding, EncodeUriComponent, Indent, Join, JoinBase, JoinByInput, JoinByInputWithKeepingSpace, JoinWithKeepingSpace, LowerCase, MapSurround, Operator, Outdent, PascalCase, Range, RemoveLeadingWhiteSpaces, Replace, ReplaceCharacter, ReplaceWithRegister, Reverse, ReverseInnerAnyPair, Rotate, RotateArgumentsBackwardsOfInnerPair, RotateArgumentsOfInnerPair, RotateBackwards, SnakeCase, Sort, SortByNumber, SortCaseInsensitively, SplitArguments, SplitArgumentsOfInnerAnyPair, SplitArgumentsWithRemoveSeparator, SplitByCharacter, SplitString, SplitStringWithKeepingSplitter, Surround, SurroundBase, SurroundSmartWord, SurroundWord, SwapWithRegister, TitleCase, ToggleCase, ToggleCaseAndMoveRight, ToggleLineComments, TransformSmartWordBySelectList, TransformString, TransformStringByExternalCommand, TransformStringBySelectList, TransformWordBySelectList, TrimString, UpperCase, _, adjustIndentWithKeepingLayout, getIndentLevelForBufferRow, isLinewiseRange, isSingleLineText, limitNumber, ref, ref1, splitArguments, splitTextByNewLine, toggleCaseForCharacter,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    modulo = function(a, b) { return (+a % (b = +b) + b) % b; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    slice = [].slice;

  _ = require('underscore-plus');

  ref = require('atom'), BufferedProcess = ref.BufferedProcess, Range = ref.Range;

  ref1 = require('./utils'), isSingleLineText = ref1.isSingleLineText, isLinewiseRange = ref1.isLinewiseRange, limitNumber = ref1.limitNumber, toggleCaseForCharacter = ref1.toggleCaseForCharacter, splitTextByNewLine = ref1.splitTextByNewLine, splitArguments = ref1.splitArguments, getIndentLevelForBufferRow = ref1.getIndentLevelForBufferRow, adjustIndentWithKeepingLayout = ref1.adjustIndentWithKeepingLayout;

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

    TransformString.prototype.autoIndentAfterInsertText = false;

    TransformString.stringTransformers = [];

    TransformString.registerToSelectList = function() {
      return this.stringTransformers.push(this);
    };

    TransformString.prototype.mutateSelection = function(selection) {
      var range, startRow, startRowIndentLevel, text;
      if (text = this.getNewText(selection.getText(), selection)) {
        if (this.autoIndentAfterInsertText) {
          startRow = selection.getBufferRange().start.row;
          startRowIndentLevel = getIndentLevelForBufferRow(this.editor, startRow);
        }
        range = selection.insertText(text, {
          autoIndent: this.autoIndent,
          autoIndentNewline: this.autoIndentNewline
        });
        if (this.autoIndentAfterInsertText) {
          if (this.target.isLinewise()) {
            range = range.translate([0, 0], [-1, 0]);
          }
          this.editor.setIndentationForBufferRow(range.start.row, startRowIndentLevel);
          this.editor.setIndentationForBufferRow(range.end.row, startRowIndentLevel);
          return adjustIndentWithKeepingLayout(this.editor, range.translate([1, 0], [0, 0]));
        }
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

    Replace.registerToSelectList();

    Replace.prototype.flashCheckpoint = 'did-select-occurrence';

    Replace.prototype.input = null;

    Replace.prototype.requireInput = true;

    Replace.prototype.autoIndentNewline = true;

    Replace.prototype.supportEarlySelect = true;

    Replace.prototype.initialize = function() {
      this.onDidSelectTarget((function(_this) {
        return function() {
          return _this.focusInput({
            hideCursor: true
          });
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
      var args, command, fn1, i, len, processFinished, processRunning, ref2, ref3, ref4, selection;
      this.stdoutBySelection = new Map;
      processRunning = processFinished = 0;
      ref2 = this.editor.getSelections();
      fn1 = (function(_this) {
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
        fn1(selection);
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

    SurroundBase.prototype.pairsByAlias = {
      b: ['(', ')'],
      B: ['{', '}'],
      r: ['[', ']'],
      a: ['<', '>']
    };

    SurroundBase.prototype.pairCharsAllowForwarding = '[](){}';

    SurroundBase.prototype.input = null;

    SurroundBase.prototype.requireInput = true;

    SurroundBase.prototype.supportEarlySelect = true;

    SurroundBase.prototype.focusInputForSurroundChar = function() {
      var inputUI;
      inputUI = this.newInputUI();
      inputUI.onDidConfirm(this.onConfirmSurroundChar.bind(this));
      inputUI.onDidCancel(this.cancelOperation.bind(this));
      return inputUI.focus({
        hideCursor: true
      });
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
      pair = this.pairsByAlias[char];
      if (pair == null) {
        pair = _.detect(this.pairs, function(pair) {
          return indexOf.call(pair, char) >= 0;
        });
      }
      if (pair == null) {
        pair = [char, char];
      }
      return pair;
    };

    SurroundBase.prototype.surround = function(text, char, options) {
      var close, keepLayout, open, ref2, ref3;
      if (options == null) {
        options = {};
      }
      keepLayout = (ref2 = options.keepLayout) != null ? ref2 : false;
      ref3 = this.getPair(char), open = ref3[0], close = ref3[1];
      if ((!keepLayout) && text.endsWith("\n")) {
        this.autoIndentAfterInsertText = true;
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
      range = selection.getBufferRange();
      if (!(range.isSingleLine() && range.end.row === this.editor.getLastBufferRow())) {
        if (isLinewiseRange(range)) {
          selection.setBufferRange(range.translate([0, 0], [-1, 2e308]));
        }
        selection.joinLines();
      }
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
        this.focusInput({
          charsMax: 10
        });
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
          return _this.focusInput({
            charsMax: 10
          });
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

  SplitArguments = (function(superClass) {
    extend(SplitArguments, superClass);

    function SplitArguments() {
      return SplitArguments.__super__.constructor.apply(this, arguments);
    }

    SplitArguments.extend();

    SplitArguments.registerToSelectList();

    SplitArguments.prototype.keepSeparator = true;

    SplitArguments.prototype.autoIndentAfterInsertText = true;

    SplitArguments.prototype.getNewText = function(text) {
      var allTokens, newText, ref2, type;
      allTokens = splitArguments(text.trim());
      newText = '';
      while (allTokens.length) {
        ref2 = allTokens.shift(), text = ref2.text, type = ref2.type;
        if (type === 'separator') {
          if (this.keepSeparator) {
            text = text.trim() + "\n";
          } else {
            text = "\n";
          }
        }
        newText += text;
      }
      return "\n" + newText + "\n";
    };

    return SplitArguments;

  })(TransformString);

  SplitArgumentsWithRemoveSeparator = (function(superClass) {
    extend(SplitArgumentsWithRemoveSeparator, superClass);

    function SplitArgumentsWithRemoveSeparator() {
      return SplitArgumentsWithRemoveSeparator.__super__.constructor.apply(this, arguments);
    }

    SplitArgumentsWithRemoveSeparator.extend();

    SplitArgumentsWithRemoveSeparator.registerToSelectList();

    SplitArgumentsWithRemoveSeparator.prototype.keepSeparator = false;

    return SplitArgumentsWithRemoveSeparator;

  })(SplitArguments);

  SplitArgumentsOfInnerAnyPair = (function(superClass) {
    extend(SplitArgumentsOfInnerAnyPair, superClass);

    function SplitArgumentsOfInnerAnyPair() {
      return SplitArgumentsOfInnerAnyPair.__super__.constructor.apply(this, arguments);
    }

    SplitArgumentsOfInnerAnyPair.extend();

    SplitArgumentsOfInnerAnyPair.registerToSelectList();

    SplitArgumentsOfInnerAnyPair.prototype.target = "InnerAnyPair";

    return SplitArgumentsOfInnerAnyPair;

  })(SplitArguments);

  ChangeOrder = (function(superClass) {
    extend(ChangeOrder, superClass);

    function ChangeOrder() {
      return ChangeOrder.__super__.constructor.apply(this, arguments);
    }

    ChangeOrder.extend(false);

    ChangeOrder.prototype.getNewText = function(text) {
      if (this.target.isLinewise()) {
        return this.getNewList(splitTextByNewLine(text)).join("\n") + "\n";
      } else {
        return this.sortArgumentsInTextBy(text, (function(_this) {
          return function(args) {
            return _this.getNewList(args);
          };
        })(this));
      }
    };

    ChangeOrder.prototype.sortArgumentsInTextBy = function(text, fn) {
      var allTokens, args, end, leadingSpaces, newArgs, newText, ref2, start, trailingSpaces, type;
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
      allTokens = splitArguments(text);
      args = allTokens.filter(function(token) {
        return token.type === 'argument';
      }).map(function(token) {
        return token.text;
      });
      newArgs = fn(args);
      newText = '';
      while (allTokens.length) {
        ref2 = allTokens.shift(), text = ref2.text, type = ref2.type;
        newText += (function() {
          switch (type) {
            case 'separator':
              return text;
            case 'argument':
              return newArgs.shift();
          }
        })();
      }
      return leadingSpaces + newText + trailingSpaces;
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

    Reverse.prototype.getNewList = function(rows) {
      return rows.reverse();
    };

    return Reverse;

  })(ChangeOrder);

  ReverseInnerAnyPair = (function(superClass) {
    extend(ReverseInnerAnyPair, superClass);

    function ReverseInnerAnyPair() {
      return ReverseInnerAnyPair.__super__.constructor.apply(this, arguments);
    }

    ReverseInnerAnyPair.extend();

    ReverseInnerAnyPair.prototype.target = "InnerAnyPair";

    return ReverseInnerAnyPair;

  })(Reverse);

  Rotate = (function(superClass) {
    extend(Rotate, superClass);

    function Rotate() {
      return Rotate.__super__.constructor.apply(this, arguments);
    }

    Rotate.extend();

    Rotate.registerToSelectList();

    Rotate.prototype.backwards = false;

    Rotate.prototype.getNewList = function(rows) {
      if (this.backwards) {
        rows.push(rows.shift());
      } else {
        rows.unshift(rows.pop());
      }
      return rows;
    };

    return Rotate;

  })(ChangeOrder);

  RotateBackwards = (function(superClass) {
    extend(RotateBackwards, superClass);

    function RotateBackwards() {
      return RotateBackwards.__super__.constructor.apply(this, arguments);
    }

    RotateBackwards.extend();

    RotateBackwards.registerToSelectList();

    RotateBackwards.prototype.backwards = true;

    return RotateBackwards;

  })(ChangeOrder);

  RotateArgumentsOfInnerPair = (function(superClass) {
    extend(RotateArgumentsOfInnerPair, superClass);

    function RotateArgumentsOfInnerPair() {
      return RotateArgumentsOfInnerPair.__super__.constructor.apply(this, arguments);
    }

    RotateArgumentsOfInnerPair.extend();

    RotateArgumentsOfInnerPair.prototype.target = "InnerAnyPair";

    return RotateArgumentsOfInnerPair;

  })(Rotate);

  RotateArgumentsBackwardsOfInnerPair = (function(superClass) {
    extend(RotateArgumentsBackwardsOfInnerPair, superClass);

    function RotateArgumentsBackwardsOfInnerPair() {
      return RotateArgumentsBackwardsOfInnerPair.__super__.constructor.apply(this, arguments);
    }

    RotateArgumentsBackwardsOfInnerPair.extend();

    RotateArgumentsBackwardsOfInnerPair.prototype.backwards = true;

    return RotateArgumentsBackwardsOfInnerPair;

  })(RotateArgumentsOfInnerPair);

  Sort = (function(superClass) {
    extend(Sort, superClass);

    function Sort() {
      return Sort.__super__.constructor.apply(this, arguments);
    }

    Sort.extend();

    Sort.registerToSelectList();

    Sort.description = "Sort alphabetically";

    Sort.prototype.getNewList = function(rows) {
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

    SortCaseInsensitively.description = "Sort alphabetically with case insensitively";

    SortCaseInsensitively.prototype.getNewList = function(rows) {
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

    SortByNumber.description = "Sort numerically";

    SortByNumber.prototype.getNewList = function(rows) {
      return _.sortBy(rows, function(row) {
        return Number.parseInt(row) || 2e308;
      });
    };

    return SortByNumber;

  })(ChangeOrder);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3ItdHJhbnNmb3JtLXN0cmluZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHEwQ0FBQTtJQUFBOzs7Ozs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQTJCLE9BQUEsQ0FBUSxNQUFSLENBQTNCLEVBQUMscUNBQUQsRUFBa0I7O0VBRWxCLE9BU0ksT0FBQSxDQUFRLFNBQVIsQ0FUSixFQUNFLHdDQURGLEVBRUUsc0NBRkYsRUFHRSw4QkFIRixFQUlFLG9EQUpGLEVBS0UsNENBTEYsRUFNRSxvQ0FORixFQU9FLDREQVBGLEVBUUU7O0VBRUYsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztFQUNQLFFBQUEsR0FBVyxJQUFJLENBQUMsUUFBTCxDQUFjLFVBQWQ7O0VBSUw7Ozs7Ozs7SUFDSixlQUFDLENBQUEsTUFBRCxDQUFRLEtBQVI7OzhCQUNBLFdBQUEsR0FBYTs7OEJBQ2IsY0FBQSxHQUFnQjs7OEJBQ2hCLFVBQUEsR0FBWTs7OEJBQ1osaUJBQUEsR0FBbUI7OzhCQUNuQix5QkFBQSxHQUEyQjs7SUFDM0IsZUFBQyxDQUFBLGtCQUFELEdBQXFCOztJQUVyQixlQUFDLENBQUEsb0JBQUQsR0FBdUIsU0FBQTthQUNyQixJQUFDLENBQUEsa0JBQWtCLENBQUMsSUFBcEIsQ0FBeUIsSUFBekI7SUFEcUI7OzhCQUd2QixlQUFBLEdBQWlCLFNBQUMsU0FBRDtBQUNmLFVBQUE7TUFBQSxJQUFHLElBQUEsR0FBTyxJQUFDLENBQUEsVUFBRCxDQUFZLFNBQVMsQ0FBQyxPQUFWLENBQUEsQ0FBWixFQUFpQyxTQUFqQyxDQUFWO1FBQ0UsSUFBRyxJQUFDLENBQUEseUJBQUo7VUFDRSxRQUFBLEdBQVcsU0FBUyxDQUFDLGNBQVYsQ0FBQSxDQUEwQixDQUFDLEtB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QVA7ZUFDUixJQUFJLENBQUMsYUFBTCxDQUFtQixJQUFuQixFQUF5QjtVQUFBLFdBQUEsRUFBYSxNQUFiO1NBQXpCO01BRFEsQ0FBVjtJQURVOzs7O0tBSnNCOztFQVE5Qjs7Ozs7OztJQUNKLFlBQUMsQ0FBQSxNQUFELENBQUE7O0lBQ0EsWUFBQyxDQUFBLG9CQUFELENBQUE7O0lBQ0EsWUFBQyxDQUFBLFdBQUQsR0FBYzs7MkJBQ2QsVUFBQSxHQUFZLFNBQUMsSUFBRDthQUNWLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxFQUFlLFNBQUMsR0FBRDtlQUNiLE1BQU0sQ0FBQyxRQUFQLENBQWdCLEdBQWhCLENBQUEsSUFBd0I7TUFEWCxDQUFmO0lBRFU7Ozs7S0FKYTtBQXR2QjNCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntCdWZmZXJlZFByb2Nlc3MsIFJhbmdlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbntcbiAgaXNTaW5nbGVMaW5lVGV4dFxuICBpc0xpbmV3aXNlUmFuZ2VcbiAgbGltaXROdW1iZXJcbiAgdG9nZ2xlQ2FzZUZvckNoYXJhY3RlclxuICBzcGxpdFRleHRCeU5ld0xpbmVcbiAgc3BsaXRBcmd1bWVudHNcbiAgZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3dcbiAgYWRqdXN0SW5kZW50V2l0aEtlZXBpbmdMYXlvdXRcbn0gPSByZXF1aXJlICcuL3V0aWxzJ1xuQmFzZSA9IHJlcXVpcmUgJy4vYmFzZSdcbk9wZXJhdG9yID0gQmFzZS5nZXRDbGFzcygnT3BlcmF0b3InKVxuXG4jIFRyYW5zZm9ybVN0cmluZ1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgVHJhbnNmb3JtU3RyaW5nIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZChmYWxzZSlcbiAgdHJhY2tDaGFuZ2U6IHRydWVcbiAgc3RheU9wdGlvbk5hbWU6ICdzdGF5T25UcmFuc2Zvcm1TdHJpbmcnXG4gIGF1dG9JbmRlbnQ6IGZhbHNlXG4gIGF1dG9JbmRlbnROZXdsaW5lOiBmYWxzZVxuICBhdXRvSW5kZW50QWZ0ZXJJbnNlcnRUZXh0OiBmYWxzZVxuICBAc3RyaW5nVHJhbnNmb3JtZXJzOiBbXVxuXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdDogLT5cbiAgICBAc3RyaW5nVHJhbnNmb3JtZXJzLnB1c2godGhpcylcblxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgaWYgdGV4dCA9IEBnZXROZXdUZXh0KHNlbGVjdGlvbi5nZXRUZXh0KCksIHNlbGVjdGlvbilcbiAgICAgIGlmIEBhdXRvSW5kZW50QWZ0ZXJJbnNlcnRUZXh0XG4gICAgICAgIHN0YXJ0Um93ID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnQucm93XG4gICAgICAgIHN0YXJ0Um93SW5kZW50TGV2ZWwgPSBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdyhAZWRpdG9yLCBzdGFydFJvdylcbiAgICAgIHJhbmdlID0gc2VsZWN0aW9uLmluc2VydFRleHQodGV4dCwge0BhdXRvSW5kZW50LCBAYXV0b0luZGVudE5ld2xpbmV9KVxuICAgICAgaWYgQGF1dG9JbmRlbnRBZnRlckluc2VydFRleHRcbiAgICAgICAgIyBDdXJyZW50bHkgdXNlZCBieSBTcGxpdEFyZ3VtZW50cyBhbmQgU3Vycm91bmQoIGxpbmV3aXNlIHRhcmdldCBvbmx5IClcbiAgICAgICAgcmFuZ2UgPSByYW5nZS50cmFuc2xhdGUoWzAsIDBdLCBbLTEsIDBdKSBpZiBAdGFyZ2V0LmlzTGluZXdpc2UoKVxuICAgICAgICBAZWRpdG9yLnNldEluZGVudGF0aW9uRm9yQnVmZmVyUm93KHJhbmdlLnN0YXJ0LnJvdywgc3RhcnRSb3dJbmRlbnRMZXZlbClcbiAgICAgICAgQGVkaXRvci5zZXRJbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyYW5nZS5lbmQucm93LCBzdGFydFJvd0luZGVudExldmVsKVxuICAgICAgICAjIEFkanVzdCBpbm5lciByYW5nZSwgZW5kLnJvdyBpcyBhbHJlYWR5KCBpZiBuZWVkZWQgKSB0cmFuc2xhdGVkIHNvIG5vIG5lZWQgdG8gcmUtdHJhbnNsYXRlLlxuICAgICAgICBhZGp1c3RJbmRlbnRXaXRoS2VlcGluZ0xheW91dChAZWRpdG9yLCByYW5nZS50cmFuc2xhdGUoWzEsIDBdLCBbMCwgMF0pKVxuXG5jbGFzcyBUb2dnbGVDYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiYEhlbGxvIFdvcmxkYCAtPiBgaEVMTE8gd09STERgXCJcbiAgZGlzcGxheU5hbWU6ICdUb2dnbGUgfidcblxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICB0ZXh0LnJlcGxhY2UoLy4vZywgdG9nZ2xlQ2FzZUZvckNoYXJhY3RlcilcblxuY2xhc3MgVG9nZ2xlQ2FzZUFuZE1vdmVSaWdodCBleHRlbmRzIFRvZ2dsZUNhc2VcbiAgQGV4dGVuZCgpXG4gIGZsYXNoVGFyZ2V0OiBmYWxzZVxuICByZXN0b3JlUG9zaXRpb25zOiBmYWxzZVxuICB0YXJnZXQ6ICdNb3ZlUmlnaHQnXG5cbmNsYXNzIFVwcGVyQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcImBIZWxsbyBXb3JsZGAgLT4gYEhFTExPIFdPUkxEYFwiXG4gIGRpc3BsYXlOYW1lOiAnVXBwZXInXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIHRleHQudG9VcHBlckNhc2UoKVxuXG5jbGFzcyBMb3dlckNhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJgSGVsbG8gV29ybGRgIC0+IGBoZWxsbyB3b3JsZGBcIlxuICBkaXNwbGF5TmFtZTogJ0xvd2VyJ1xuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICB0ZXh0LnRvTG93ZXJDYXNlKClcblxuIyBSZXBsYWNlXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFJlcGxhY2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIGZsYXNoQ2hlY2twb2ludDogJ2RpZC1zZWxlY3Qtb2NjdXJyZW5jZSdcbiAgaW5wdXQ6IG51bGxcbiAgcmVxdWlyZUlucHV0OiB0cnVlXG4gIGF1dG9JbmRlbnROZXdsaW5lOiB0cnVlXG4gIHN1cHBvcnRFYXJseVNlbGVjdDogdHJ1ZVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgQG9uRGlkU2VsZWN0VGFyZ2V0ID0+XG4gICAgICBAZm9jdXNJbnB1dChoaWRlQ3Vyc29yOiB0cnVlKVxuICAgIHN1cGVyXG5cbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgaWYgQHRhcmdldC5pcygnTW92ZVJpZ2h0QnVmZmVyQ29sdW1uJykgYW5kIHRleHQubGVuZ3RoIGlzbnQgQGdldENvdW50KClcbiAgICAgIHJldHVyblxuXG4gICAgaW5wdXQgPSBAaW5wdXQgb3IgXCJcXG5cIlxuICAgIGlmIGlucHV0IGlzIFwiXFxuXCJcbiAgICAgIEByZXN0b3JlUG9zaXRpb25zID0gZmFsc2VcbiAgICB0ZXh0LnJlcGxhY2UoLy4vZywgaW5wdXQpXG5cbmNsYXNzIFJlcGxhY2VDaGFyYWN0ZXIgZXh0ZW5kcyBSZXBsYWNlXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6IFwiTW92ZVJpZ2h0QnVmZmVyQ29sdW1uXCJcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIERVUCBtZWFuaW5nIHdpdGggU3BsaXRTdHJpbmcgbmVlZCBjb25zb2xpZGF0ZS5cbmNsYXNzIFNwbGl0QnlDaGFyYWN0ZXIgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIHRleHQuc3BsaXQoJycpLmpvaW4oJyAnKVxuXG5jbGFzcyBDYW1lbENhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIGRpc3BsYXlOYW1lOiAnQ2FtZWxpemUnXG4gIEBkZXNjcmlwdGlvbjogXCJgaGVsbG8td29ybGRgIC0+IGBoZWxsb1dvcmxkYFwiXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIF8uY2FtZWxpemUodGV4dClcblxuY2xhc3MgU25ha2VDYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiYEhlbGxvV29ybGRgIC0+IGBoZWxsb193b3JsZGBcIlxuICBkaXNwbGF5TmFtZTogJ1VuZGVyc2NvcmUgXydcbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgXy51bmRlcnNjb3JlKHRleHQpXG5cbmNsYXNzIFBhc2NhbENhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJgaGVsbG9fd29ybGRgIC0+IGBIZWxsb1dvcmxkYFwiXG4gIGRpc3BsYXlOYW1lOiAnUGFzY2FsaXplJ1xuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBfLmNhcGl0YWxpemUoXy5jYW1lbGl6ZSh0ZXh0KSlcblxuY2xhc3MgRGFzaENhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIGRpc3BsYXlOYW1lOiAnRGFzaGVyaXplIC0nXG4gIEBkZXNjcmlwdGlvbjogXCJIZWxsb1dvcmxkIC0+IGhlbGxvLXdvcmxkXCJcbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgXy5kYXNoZXJpemUodGV4dClcblxuY2xhc3MgVGl0bGVDYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiYEhlbGxvV29ybGRgIC0+IGBIZWxsbyBXb3JsZGBcIlxuICBkaXNwbGF5TmFtZTogJ1RpdGxpemUnXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIF8uaHVtYW5pemVFdmVudE5hbWUoXy5kYXNoZXJpemUodGV4dCkpXG5cbmNsYXNzIEVuY29kZVVyaUNvbXBvbmVudCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcImBIZWxsbyBXb3JsZGAgLT4gYEhlbGxvJTIwV29ybGRgXCJcbiAgZGlzcGxheU5hbWU6ICdFbmNvZGUgVVJJIENvbXBvbmVudCAlJ1xuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBlbmNvZGVVUklDb21wb25lbnQodGV4dClcblxuY2xhc3MgRGVjb2RlVXJpQ29tcG9uZW50IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiYEhlbGxvJTIwV29ybGRgIC0+IGBIZWxsbyBXb3JsZGBcIlxuICBkaXNwbGF5TmFtZTogJ0RlY29kZSBVUkkgQ29tcG9uZW50ICUlJ1xuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBkZWNvZGVVUklDb21wb25lbnQodGV4dClcblxuY2xhc3MgVHJpbVN0cmluZyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcImAgaGVsbG8gYCAtPiBgaGVsbG9gXCJcbiAgZGlzcGxheU5hbWU6ICdUcmltIHN0cmluZydcbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgdGV4dC50cmltKClcblxuY2xhc3MgQ29tcGFjdFNwYWNlcyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcImAgIGEgICAgYiAgICBjYCAtPiBgYSBiIGNgXCJcbiAgZGlzcGxheU5hbWU6ICdDb21wYWN0IHNwYWNlJ1xuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBpZiB0ZXh0Lm1hdGNoKC9eWyBdKyQvKVxuICAgICAgJyAnXG4gICAgZWxzZVxuICAgICAgIyBEb24ndCBjb21wYWN0IGZvciBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZSBzcGFjZXMuXG4gICAgICB0ZXh0LnJlcGxhY2UgL14oXFxzKikoLio/KShcXHMqKSQvZ20sIChtLCBsZWFkaW5nLCBtaWRkbGUsIHRyYWlsaW5nKSAtPlxuICAgICAgICBsZWFkaW5nICsgbWlkZGxlLnNwbGl0KC9bIFxcdF0rLykuam9pbignICcpICsgdHJhaWxpbmdcblxuY2xhc3MgUmVtb3ZlTGVhZGluZ1doaXRlU3BhY2VzIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIEBkZXNjcmlwdGlvbjogXCJgICBhIGIgY2AgLT4gYGEgYiBjYFwiXG4gIGdldE5ld1RleHQ6ICh0ZXh0LCBzZWxlY3Rpb24pIC0+XG4gICAgdHJpbUxlZnQgPSAodGV4dCkgLT4gdGV4dC50cmltTGVmdCgpXG4gICAgc3BsaXRUZXh0QnlOZXdMaW5lKHRleHQpLm1hcCh0cmltTGVmdCkuam9pbihcIlxcblwiKSArIFwiXFxuXCJcblxuY2xhc3MgQ29udmVydFRvU29mdFRhYiBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgZGlzcGxheU5hbWU6ICdTb2Z0IFRhYidcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBAc2NhbkZvcndhcmQgL1xcdC9nLCB7c2NhblJhbmdlOiBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKX0sICh7cmFuZ2UsIHJlcGxhY2V9KSA9PlxuICAgICAgIyBSZXBsYWNlIFxcdCB0byBzcGFjZXMgd2hpY2ggbGVuZ3RoIGlzIHZhcnkgZGVwZW5kaW5nIG9uIHRhYlN0b3AgYW5kIHRhYkxlbmdodFxuICAgICAgIyBTbyB3ZSBkaXJlY3RseSBjb25zdWx0IGl0J3Mgc2NyZWVuIHJlcHJlc2VudGluZyBsZW5ndGguXG4gICAgICBsZW5ndGggPSBAZWRpdG9yLnNjcmVlblJhbmdlRm9yQnVmZmVyUmFuZ2UocmFuZ2UpLmdldEV4dGVudCgpLmNvbHVtblxuICAgICAgcmVwbGFjZShcIiBcIi5yZXBlYXQobGVuZ3RoKSlcblxuY2xhc3MgQ29udmVydFRvSGFyZFRhYiBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgZGlzcGxheU5hbWU6ICdIYXJkIFRhYidcblxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgdGFiTGVuZ3RoID0gQGVkaXRvci5nZXRUYWJMZW5ndGgoKVxuICAgIEBzY2FuRm9yd2FyZCAvWyBcXHRdKy9nLCB7c2NhblJhbmdlOiBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKX0sICh7cmFuZ2UsIHJlcGxhY2V9KSA9PlxuICAgICAge3N0YXJ0LCBlbmR9ID0gQGVkaXRvci5zY3JlZW5SYW5nZUZvckJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgICAgc3RhcnRDb2x1bW4gPSBzdGFydC5jb2x1bW5cbiAgICAgIGVuZENvbHVtbiA9IGVuZC5jb2x1bW5cblxuICAgICAgIyBXZSBjYW4ndCBuYWl2ZWx5IHJlcGxhY2Ugc3BhY2VzIHRvIHRhYiwgd2UgaGF2ZSB0byBjb25zaWRlciB2YWxpZCB0YWJTdG9wIGNvbHVtblxuICAgICAgIyBJZiBuZXh0VGFiU3RvcCBjb2x1bW4gZXhjZWVkcyByZXBsYWNhYmxlIHJhbmdlLCB3ZSBwYWQgd2l0aCBzcGFjZXMuXG4gICAgICBuZXdUZXh0ID0gJydcbiAgICAgIGxvb3BcbiAgICAgICAgcmVtYWluZGVyID0gc3RhcnRDb2x1bW4gJSUgdGFiTGVuZ3RoXG4gICAgICAgIG5leHRUYWJTdG9wID0gc3RhcnRDb2x1bW4gKyAoaWYgcmVtYWluZGVyIGlzIDAgdGhlbiB0YWJMZW5ndGggZWxzZSByZW1haW5kZXIpXG4gICAgICAgIGlmIG5leHRUYWJTdG9wID4gZW5kQ29sdW1uXG4gICAgICAgICAgbmV3VGV4dCArPSBcIiBcIi5yZXBlYXQoZW5kQ29sdW1uIC0gc3RhcnRDb2x1bW4pXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBuZXdUZXh0ICs9IFwiXFx0XCJcbiAgICAgICAgc3RhcnRDb2x1bW4gPSBuZXh0VGFiU3RvcFxuICAgICAgICBicmVhayBpZiBzdGFydENvbHVtbiA+PSBlbmRDb2x1bW5cblxuICAgICAgcmVwbGFjZShuZXdUZXh0KVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFRyYW5zZm9ybVN0cmluZ0J5RXh0ZXJuYWxDb21tYW5kIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoZmFsc2UpXG4gIGF1dG9JbmRlbnQ6IHRydWVcbiAgY29tbWFuZDogJycgIyBlLmcuIGNvbW1hbmQ6ICdzb3J0J1xuICBhcmdzOiBbXSAjIGUuZyBhcmdzOiBbJy1ybiddXG4gIHN0ZG91dEJ5U2VsZWN0aW9uOiBudWxsXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAbm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICBpZiBAc2VsZWN0VGFyZ2V0KClcbiAgICAgIG5ldyBQcm9taXNlIChyZXNvbHZlKSA9PlxuICAgICAgICBAY29sbGVjdChyZXNvbHZlKVxuICAgICAgLnRoZW4gPT5cbiAgICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICAgIHRleHQgPSBAZ2V0TmV3VGV4dChzZWxlY3Rpb24uZ2V0VGV4dCgpLCBzZWxlY3Rpb24pXG4gICAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dCwge0BhdXRvSW5kZW50fSlcbiAgICAgICAgQHJlc3RvcmVDdXJzb3JQb3NpdGlvbnNJZk5lY2Vzc2FyeSgpXG4gICAgICAgIEBhY3RpdmF0ZU1vZGUoQGZpbmFsTW9kZSwgQGZpbmFsU3VibW9kZSlcblxuICBjb2xsZWN0OiAocmVzb2x2ZSkgLT5cbiAgICBAc3Rkb3V0QnlTZWxlY3Rpb24gPSBuZXcgTWFwXG4gICAgcHJvY2Vzc1J1bm5pbmcgPSBwcm9jZXNzRmluaXNoZWQgPSAwXG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAge2NvbW1hbmQsIGFyZ3N9ID0gQGdldENvbW1hbmQoc2VsZWN0aW9uKSA/IHt9XG4gICAgICByZXR1cm4gdW5sZXNzIChjb21tYW5kPyBhbmQgYXJncz8pXG4gICAgICBwcm9jZXNzUnVubmluZysrXG4gICAgICBkbyAoc2VsZWN0aW9uKSA9PlxuICAgICAgICBzdGRpbiA9IEBnZXRTdGRpbihzZWxlY3Rpb24pXG4gICAgICAgIHN0ZG91dCA9IChvdXRwdXQpID0+XG4gICAgICAgICAgQHN0ZG91dEJ5U2VsZWN0aW9uLnNldChzZWxlY3Rpb24sIG91dHB1dClcbiAgICAgICAgZXhpdCA9IChjb2RlKSAtPlxuICAgICAgICAgIHByb2Nlc3NGaW5pc2hlZCsrXG4gICAgICAgICAgcmVzb2x2ZSgpIGlmIChwcm9jZXNzUnVubmluZyBpcyBwcm9jZXNzRmluaXNoZWQpXG4gICAgICAgIEBydW5FeHRlcm5hbENvbW1hbmQge2NvbW1hbmQsIGFyZ3MsIHN0ZG91dCwgZXhpdCwgc3RkaW59XG5cbiAgcnVuRXh0ZXJuYWxDb21tYW5kOiAob3B0aW9ucykgLT5cbiAgICBzdGRpbiA9IG9wdGlvbnMuc3RkaW5cbiAgICBkZWxldGUgb3B0aW9ucy5zdGRpblxuICAgIGJ1ZmZlcmVkUHJvY2VzcyA9IG5ldyBCdWZmZXJlZFByb2Nlc3Mob3B0aW9ucylcbiAgICBidWZmZXJlZFByb2Nlc3Mub25XaWxsVGhyb3dFcnJvciAoe2Vycm9yLCBoYW5kbGV9KSA9PlxuICAgICAgIyBTdXBwcmVzcyBjb21tYW5kIG5vdCBmb3VuZCBlcnJvciBpbnRlbnRpb25hbGx5LlxuICAgICAgaWYgZXJyb3IuY29kZSBpcyAnRU5PRU5UJyBhbmQgZXJyb3Iuc3lzY2FsbC5pbmRleE9mKCdzcGF3bicpIGlzIDBcbiAgICAgICAgY29tbWFuZE5hbWUgPSBAY29uc3RydWN0b3IuZ2V0Q29tbWFuZE5hbWUoKVxuICAgICAgICBjb25zb2xlLmxvZyBcIiN7Y29tbWFuZE5hbWV9OiBGYWlsZWQgdG8gc3Bhd24gY29tbWFuZCAje2Vycm9yLnBhdGh9LlwiXG4gICAgICAgIGhhbmRsZSgpXG4gICAgICBAY2FuY2VsT3BlcmF0aW9uKClcblxuICAgIGlmIHN0ZGluXG4gICAgICBidWZmZXJlZFByb2Nlc3MucHJvY2Vzcy5zdGRpbi53cml0ZShzdGRpbilcbiAgICAgIGJ1ZmZlcmVkUHJvY2Vzcy5wcm9jZXNzLnN0ZGluLmVuZCgpXG5cbiAgZ2V0TmV3VGV4dDogKHRleHQsIHNlbGVjdGlvbikgLT5cbiAgICBAZ2V0U3Rkb3V0KHNlbGVjdGlvbikgPyB0ZXh0XG5cbiAgIyBGb3IgZWFzaWx5IGV4dGVuZCBieSB2bXAgcGx1Z2luLlxuICBnZXRDb21tYW5kOiAoc2VsZWN0aW9uKSAtPiB7QGNvbW1hbmQsIEBhcmdzfVxuICBnZXRTdGRpbjogKHNlbGVjdGlvbikgLT4gc2VsZWN0aW9uLmdldFRleHQoKVxuICBnZXRTdGRvdXQ6IChzZWxlY3Rpb24pIC0+IEBzdGRvdXRCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFRyYW5zZm9ybVN0cmluZ0J5U2VsZWN0TGlzdCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIkludGVyYWN0aXZlbHkgY2hvb3NlIHN0cmluZyB0cmFuc2Zvcm1hdGlvbiBvcGVyYXRvciBmcm9tIHNlbGVjdC1saXN0XCJcbiAgQHNlbGVjdExpc3RJdGVtczogbnVsbFxuICByZXF1aXJlSW5wdXQ6IHRydWVcblxuICBnZXRJdGVtczogLT5cbiAgICBAY29uc3RydWN0b3Iuc2VsZWN0TGlzdEl0ZW1zID89IEBjb25zdHJ1Y3Rvci5zdHJpbmdUcmFuc2Zvcm1lcnMubWFwIChrbGFzcykgLT5cbiAgICAgIGlmIGtsYXNzOjpoYXNPd25Qcm9wZXJ0eSgnZGlzcGxheU5hbWUnKVxuICAgICAgICBkaXNwbGF5TmFtZSA9IGtsYXNzOjpkaXNwbGF5TmFtZVxuICAgICAgZWxzZVxuICAgICAgICBkaXNwbGF5TmFtZSA9IF8uaHVtYW5pemVFdmVudE5hbWUoXy5kYXNoZXJpemUoa2xhc3MubmFtZSkpXG4gICAgICB7bmFtZToga2xhc3MsIGRpc3BsYXlOYW1lfVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgc3VwZXJcblxuICAgIEB2aW1TdGF0ZS5vbkRpZENvbmZpcm1TZWxlY3RMaXN0IChpdGVtKSA9PlxuICAgICAgdHJhbnNmb3JtZXIgPSBpdGVtLm5hbWVcbiAgICAgIEB0YXJnZXQgPSB0cmFuc2Zvcm1lcjo6dGFyZ2V0IGlmIHRyYW5zZm9ybWVyOjp0YXJnZXQ/XG4gICAgICBAdmltU3RhdGUucmVzZXQoKVxuICAgICAgaWYgQHRhcmdldD9cbiAgICAgICAgQHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bih0cmFuc2Zvcm1lciwge0B0YXJnZXR9KVxuICAgICAgZWxzZVxuICAgICAgICBAdmltU3RhdGUub3BlcmF0aW9uU3RhY2sucnVuKHRyYW5zZm9ybWVyKVxuXG4gICAgQGZvY3VzU2VsZWN0TGlzdChpdGVtczogQGdldEl0ZW1zKCkpXG5cbiAgZXhlY3V0ZTogLT5cbiAgICAjIE5FVkVSIGJlIGV4ZWN1dGVkIHNpbmNlIG9wZXJhdGlvblN0YWNrIGlzIHJlcGxhY2VkIHdpdGggc2VsZWN0ZWQgdHJhbnNmb3JtZXJcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCIje0BuYW1lfSBzaG91bGQgbm90IGJlIGV4ZWN1dGVkXCIpXG5cbmNsYXNzIFRyYW5zZm9ybVdvcmRCeVNlbGVjdExpc3QgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdCeVNlbGVjdExpc3RcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogXCJJbm5lcldvcmRcIlxuXG5jbGFzcyBUcmFuc2Zvcm1TbWFydFdvcmRCeVNlbGVjdExpc3QgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdCeVNlbGVjdExpc3RcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJUcmFuc2Zvcm0gSW5uZXJTbWFydFdvcmQgYnkgYHRyYW5zZm9ybS1zdHJpbmctYnktc2VsZWN0LWxpc3RgXCJcbiAgdGFyZ2V0OiBcIklubmVyU21hcnRXb3JkXCJcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBSZXBsYWNlV2l0aFJlZ2lzdGVyIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiUmVwbGFjZSB0YXJnZXQgd2l0aCBzcGVjaWZpZWQgcmVnaXN0ZXIgdmFsdWVcIlxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBAdmltU3RhdGUucmVnaXN0ZXIuZ2V0VGV4dCgpXG5cbiMgU2F2ZSB0ZXh0IHRvIHJlZ2lzdGVyIGJlZm9yZSByZXBsYWNlXG5jbGFzcyBTd2FwV2l0aFJlZ2lzdGVyIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiU3dhcCByZWdpc3RlciB2YWx1ZSB3aXRoIHRhcmdldFwiXG4gIGdldE5ld1RleHQ6ICh0ZXh0LCBzZWxlY3Rpb24pIC0+XG4gICAgbmV3VGV4dCA9IEB2aW1TdGF0ZS5yZWdpc3Rlci5nZXRUZXh0KClcbiAgICBAc2V0VGV4dFRvUmVnaXN0ZXIodGV4dCwgc2VsZWN0aW9uKVxuICAgIG5ld1RleHRcblxuIyBJbmRlbnQgPCBUcmFuc2Zvcm1TdHJpbmdcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgSW5kZW50IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBzdGF5QnlNYXJrZXI6IHRydWVcbiAgc2V0VG9GaXJzdENoYXJhY3Rlck9uTGluZXdpc2U6IHRydWVcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICAjIE5lZWQgY291bnQgdGltZXMgaW5kZW50YXRpb24gaW4gdmlzdWFsLW1vZGUgYW5kIGl0cyByZXBlYXQoYC5gKS5cbiAgICBpZiBAdGFyZ2V0LmlzKCdDdXJyZW50U2VsZWN0aW9uJylcbiAgICAgIG9sZFRleHQgPSBudWxsXG4gICAgICAgIyBsaW1pdCB0byAxMDAgdG8gYXZvaWQgZnJlZXppbmcgYnkgYWNjaWRlbnRhbCBiaWcgbnVtYmVyLlxuICAgICAgY291bnQgPSBsaW1pdE51bWJlcihAZ2V0Q291bnQoKSwgbWF4OiAxMDApXG4gICAgICBAY291bnRUaW1lcyBjb3VudCwgKHtzdG9wfSkgPT5cbiAgICAgICAgb2xkVGV4dCA9IHNlbGVjdGlvbi5nZXRUZXh0KClcbiAgICAgICAgQGluZGVudChzZWxlY3Rpb24pXG4gICAgICAgIHN0b3AoKSBpZiBzZWxlY3Rpb24uZ2V0VGV4dCgpIGlzIG9sZFRleHRcbiAgICBlbHNlXG4gICAgICBAaW5kZW50KHNlbGVjdGlvbilcblxuICBpbmRlbnQ6IChzZWxlY3Rpb24pIC0+XG4gICAgc2VsZWN0aW9uLmluZGVudFNlbGVjdGVkUm93cygpXG5cbmNsYXNzIE91dGRlbnQgZXh0ZW5kcyBJbmRlbnRcbiAgQGV4dGVuZCgpXG4gIGluZGVudDogKHNlbGVjdGlvbikgLT5cbiAgICBzZWxlY3Rpb24ub3V0ZGVudFNlbGVjdGVkUm93cygpXG5cbmNsYXNzIEF1dG9JbmRlbnQgZXh0ZW5kcyBJbmRlbnRcbiAgQGV4dGVuZCgpXG4gIGluZGVudDogKHNlbGVjdGlvbikgLT5cbiAgICBzZWxlY3Rpb24uYXV0b0luZGVudFNlbGVjdGVkUm93cygpXG5cbmNsYXNzIFRvZ2dsZUxpbmVDb21tZW50cyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgc3RheUJ5TWFya2VyOiB0cnVlXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIHNlbGVjdGlvbi50b2dnbGVMaW5lQ29tbWVudHMoKVxuXG5jbGFzcyBBdXRvRmxvdyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goQGVkaXRvckVsZW1lbnQsICdhdXRvZmxvdzpyZWZsb3ctc2VsZWN0aW9uJylcblxuIyBTdXJyb3VuZCA8IFRyYW5zZm9ybVN0cmluZ1xuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBTdXJyb3VuZEJhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZChmYWxzZSlcbiAgcGFpcnM6IFtcbiAgICBbJ1snLCAnXSddXG4gICAgWycoJywgJyknXVxuICAgIFsneycsICd9J11cbiAgICBbJzwnLCAnPiddXG4gIF1cbiAgcGFpcnNCeUFsaWFzOiB7XG4gICAgYjogWycoJywgJyknXVxuICAgIEI6IFsneycsICd9J11cbiAgICByOiBbJ1snLCAnXSddXG4gICAgYTogWyc8JywgJz4nXVxuICB9XG5cbiAgcGFpckNoYXJzQWxsb3dGb3J3YXJkaW5nOiAnW10oKXt9J1xuICBpbnB1dDogbnVsbFxuICByZXF1aXJlSW5wdXQ6IHRydWVcbiAgc3VwcG9ydEVhcmx5U2VsZWN0OiB0cnVlICMgRXhwZXJpbWVudGFsXG5cbiAgZm9jdXNJbnB1dEZvclN1cnJvdW5kQ2hhcjogLT5cbiAgICBpbnB1dFVJID0gQG5ld0lucHV0VUkoKVxuICAgIGlucHV0VUkub25EaWRDb25maXJtKEBvbkNvbmZpcm1TdXJyb3VuZENoYXIuYmluZCh0aGlzKSlcbiAgICBpbnB1dFVJLm9uRGlkQ2FuY2VsKEBjYW5jZWxPcGVyYXRpb24uYmluZCh0aGlzKSlcbiAgICBpbnB1dFVJLmZvY3VzKGhpZGVDdXJzb3I6IHRydWUpXG5cbiAgZm9jdXNJbnB1dEZvclRhcmdldFBhaXJDaGFyOiAtPlxuICAgIGlucHV0VUkgPSBAbmV3SW5wdXRVSSgpXG4gICAgaW5wdXRVSS5vbkRpZENvbmZpcm0oQG9uQ29uZmlybVRhcmdldFBhaXJDaGFyLmJpbmQodGhpcykpXG4gICAgaW5wdXRVSS5vbkRpZENhbmNlbChAY2FuY2VsT3BlcmF0aW9uLmJpbmQodGhpcykpXG4gICAgaW5wdXRVSS5mb2N1cygpXG5cbiAgZ2V0UGFpcjogKGNoYXIpIC0+XG4gICAgcGFpciA9IEBwYWlyc0J5QWxpYXNbY2hhcl1cbiAgICBwYWlyID89IF8uZGV0ZWN0KEBwYWlycywgKHBhaXIpIC0+IGNoYXIgaW4gcGFpcilcbiAgICBwYWlyID89IFtjaGFyLCBjaGFyXVxuICAgIHBhaXJcblxuICBzdXJyb3VuZDogKHRleHQsIGNoYXIsIG9wdGlvbnM9e30pIC0+XG4gICAga2VlcExheW91dCA9IG9wdGlvbnMua2VlcExheW91dCA/IGZhbHNlXG4gICAgW29wZW4sIGNsb3NlXSA9IEBnZXRQYWlyKGNoYXIpXG4gICAgaWYgKG5vdCBrZWVwTGF5b3V0KSBhbmQgdGV4dC5lbmRzV2l0aChcIlxcblwiKVxuICAgICAgQGF1dG9JbmRlbnRBZnRlckluc2VydFRleHQgPSB0cnVlXG4gICAgICBvcGVuICs9IFwiXFxuXCJcbiAgICAgIGNsb3NlICs9IFwiXFxuXCJcblxuICAgIGlmIGNoYXIgaW4gQGdldENvbmZpZygnY2hhcmFjdGVyc1RvQWRkU3BhY2VPblN1cnJvdW5kJykgYW5kIGlzU2luZ2xlTGluZVRleHQodGV4dClcbiAgICAgIHRleHQgPSAnICcgKyB0ZXh0ICsgJyAnXG5cbiAgICBvcGVuICsgdGV4dCArIGNsb3NlXG5cbiAgZGVsZXRlU3Vycm91bmQ6ICh0ZXh0KSAtPlxuICAgIFtvcGVuLCBpbm5lclRleHQuLi4sIGNsb3NlXSA9IHRleHRcbiAgICBpbm5lclRleHQgPSBpbm5lclRleHQuam9pbignJylcbiAgICBpZiBpc1NpbmdsZUxpbmVUZXh0KHRleHQpIGFuZCAob3BlbiBpc250IGNsb3NlKVxuICAgICAgaW5uZXJUZXh0LnRyaW0oKVxuICAgIGVsc2VcbiAgICAgIGlubmVyVGV4dFxuXG4gIG9uQ29uZmlybVN1cnJvdW5kQ2hhcjogKEBpbnB1dCkgLT5cbiAgICBAcHJvY2Vzc09wZXJhdGlvbigpXG5cbiAgb25Db25maXJtVGFyZ2V0UGFpckNoYXI6IChjaGFyKSAtPlxuICAgIEBzZXRUYXJnZXQgQG5ldygnQVBhaXInLCBwYWlyOiBAZ2V0UGFpcihjaGFyKSlcblxuY2xhc3MgU3Vycm91bmQgZXh0ZW5kcyBTdXJyb3VuZEJhc2VcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTdXJyb3VuZCB0YXJnZXQgYnkgc3BlY2lmaWVkIGNoYXJhY3RlciBsaWtlIGAoYCwgYFtgLCBgXFxcImBcIlxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgQG9uRGlkU2VsZWN0VGFyZ2V0KEBmb2N1c0lucHV0Rm9yU3Vycm91bmRDaGFyLmJpbmQodGhpcykpXG4gICAgc3VwZXJcblxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBAc3Vycm91bmQodGV4dCwgQGlucHV0KVxuXG5jbGFzcyBTdXJyb3VuZFdvcmQgZXh0ZW5kcyBTdXJyb3VuZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlN1cnJvdW5kICoqd29yZCoqXCJcbiAgdGFyZ2V0OiAnSW5uZXJXb3JkJ1xuXG5jbGFzcyBTdXJyb3VuZFNtYXJ0V29yZCBleHRlbmRzIFN1cnJvdW5kXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiU3Vycm91bmQgKipzbWFydC13b3JkKipcIlxuICB0YXJnZXQ6ICdJbm5lclNtYXJ0V29yZCdcblxuY2xhc3MgTWFwU3Vycm91bmQgZXh0ZW5kcyBTdXJyb3VuZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlN1cnJvdW5kIGVhY2ggd29yZChgL1xcdysvYCkgd2l0aGluIHRhcmdldFwiXG4gIG9jY3VycmVuY2U6IHRydWVcbiAgcGF0dGVybkZvck9jY3VycmVuY2U6IC9cXHcrL2dcblxuIyBEZWxldGUgU3Vycm91bmRcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgRGVsZXRlU3Vycm91bmQgZXh0ZW5kcyBTdXJyb3VuZEJhc2VcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJEZWxldGUgc3BlY2lmaWVkIHN1cnJvdW5kIGNoYXJhY3RlciBsaWtlIGAoYCwgYFtgLCBgXFxcImBcIlxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgQGZvY3VzSW5wdXRGb3JUYXJnZXRQYWlyQ2hhcigpIHVubGVzcyBAdGFyZ2V0P1xuICAgIHN1cGVyXG5cbiAgb25Db25maXJtVGFyZ2V0UGFpckNoYXI6IChpbnB1dCkgLT5cbiAgICBzdXBlclxuICAgIEBpbnB1dCA9IGlucHV0XG4gICAgQHByb2Nlc3NPcGVyYXRpb24oKVxuXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIEBkZWxldGVTdXJyb3VuZCh0ZXh0KVxuXG5jbGFzcyBEZWxldGVTdXJyb3VuZEFueVBhaXIgZXh0ZW5kcyBEZWxldGVTdXJyb3VuZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIkRlbGV0ZSBzdXJyb3VuZCBjaGFyYWN0ZXIgYnkgYXV0by1kZXRlY3QgcGFpcmVkIGNoYXIgZnJvbSBjdXJzb3IgZW5jbG9zZWQgcGFpclwiXG4gIHRhcmdldDogJ0FBbnlQYWlyJ1xuICByZXF1aXJlSW5wdXQ6IGZhbHNlXG5cbmNsYXNzIERlbGV0ZVN1cnJvdW5kQW55UGFpckFsbG93Rm9yd2FyZGluZyBleHRlbmRzIERlbGV0ZVN1cnJvdW5kQW55UGFpclxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIkRlbGV0ZSBzdXJyb3VuZCBjaGFyYWN0ZXIgYnkgYXV0by1kZXRlY3QgcGFpcmVkIGNoYXIgZnJvbSBjdXJzb3IgZW5jbG9zZWQgcGFpciBhbmQgZm9yd2FyZGluZyBwYWlyIHdpdGhpbiBzYW1lIGxpbmVcIlxuICB0YXJnZXQ6ICdBQW55UGFpckFsbG93Rm9yd2FyZGluZydcblxuIyBDaGFuZ2UgU3Vycm91bmRcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgQ2hhbmdlU3Vycm91bmQgZXh0ZW5kcyBTdXJyb3VuZEJhc2VcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJDaGFuZ2Ugc3Vycm91bmQgY2hhcmFjdGVyLCBzcGVjaWZ5IGJvdGggZnJvbSBhbmQgdG8gcGFpciBjaGFyXCJcblxuICBzaG93RGVsZXRlQ2hhck9uSG92ZXI6IC0+XG4gICAgY2hhciA9IEBlZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KClbMF1cbiAgICBAdmltU3RhdGUuaG92ZXIuc2V0KGNoYXIsIEB2aW1TdGF0ZS5nZXRPcmlnaW5hbEN1cnNvclBvc2l0aW9uKCkpXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBpZiBAdGFyZ2V0P1xuICAgICAgQG9uRGlkRmFpbFNlbGVjdFRhcmdldChAYWJvcnQuYmluZCh0aGlzKSlcbiAgICBlbHNlXG4gICAgICBAb25EaWRGYWlsU2VsZWN0VGFyZ2V0KEBjYW5jZWxPcGVyYXRpb24uYmluZCh0aGlzKSlcbiAgICAgIEBmb2N1c0lucHV0Rm9yVGFyZ2V0UGFpckNoYXIoKVxuICAgIHN1cGVyXG5cbiAgICBAb25EaWRTZWxlY3RUYXJnZXQgPT5cbiAgICAgIEBzaG93RGVsZXRlQ2hhck9uSG92ZXIoKVxuICAgICAgQGZvY3VzSW5wdXRGb3JTdXJyb3VuZENoYXIoKVxuXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIGlubmVyVGV4dCA9IEBkZWxldGVTdXJyb3VuZCh0ZXh0KVxuICAgIEBzdXJyb3VuZChpbm5lclRleHQsIEBpbnB1dCwga2VlcExheW91dDogdHJ1ZSlcblxuY2xhc3MgQ2hhbmdlU3Vycm91bmRBbnlQYWlyIGV4dGVuZHMgQ2hhbmdlU3Vycm91bmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJDaGFuZ2Ugc3Vycm91bmQgY2hhcmFjdGVyLCBmcm9tIGNoYXIgaXMgYXV0by1kZXRlY3RlZFwiXG4gIHRhcmdldDogXCJBQW55UGFpclwiXG5cbmNsYXNzIENoYW5nZVN1cnJvdW5kQW55UGFpckFsbG93Rm9yd2FyZGluZyBleHRlbmRzIENoYW5nZVN1cnJvdW5kQW55UGFpclxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIkNoYW5nZSBzdXJyb3VuZCBjaGFyYWN0ZXIsIGZyb20gY2hhciBpcyBhdXRvLWRldGVjdGVkIGZyb20gZW5jbG9zZWQgYW5kIGZvcndhcmRpbmcgYXJlYVwiXG4gIHRhcmdldDogXCJBQW55UGFpckFsbG93Rm9yd2FyZGluZ1wiXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBGSVhNRVxuIyBDdXJyZW50bHkgbmF0aXZlIGVkaXRvci5qb2luTGluZXMoKSBpcyBiZXR0ZXIgZm9yIGN1cnNvciBwb3NpdGlvbiBzZXR0aW5nXG4jIFNvIEkgdXNlIG5hdGl2ZSBtZXRob2RzIGZvciBhIG1lYW53aGlsZS5cbmNsYXNzIEpvaW4gZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogXCJNb3ZlVG9SZWxhdGl2ZUxpbmVcIlxuICBmbGFzaFRhcmdldDogZmFsc2VcbiAgcmVzdG9yZVBvc2l0aW9uczogZmFsc2VcblxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgcmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuXG4gICAgIyBXaGVuIGN1cnNvciBpcyBhdCBsYXN0IEJVRkZFUiByb3csIGl0IHNlbGVjdCBsYXN0LWJ1ZmZlci1yb3csIHRoZW5cbiAgICAjIGpvaW5uaW5nIHJlc3VsdCBpbiBcImNsZWFyIGxhc3QtYnVmZmVyLXJvdyB0ZXh0XCIuXG4gICAgIyBJIGJlbGlldmUgdGhpcyBpcyBCVUcgb2YgdXBzdHJlYW0gYXRvbS1jb3JlLiBndWFyZCB0aGlzIHNpdHVhdGlvbiBoZXJlXG4gICAgdW5sZXNzIChyYW5nZS5pc1NpbmdsZUxpbmUoKSBhbmQgcmFuZ2UuZW5kLnJvdyBpcyBAZWRpdG9yLmdldExhc3RCdWZmZXJSb3coKSlcbiAgICAgIGlmIGlzTGluZXdpc2VSYW5nZShyYW5nZSlcbiAgICAgICAgc2VsZWN0aW9uLnNldEJ1ZmZlclJhbmdlKHJhbmdlLnRyYW5zbGF0ZShbMCwgMF0sIFstMSwgSW5maW5pdHldKSlcbiAgICAgIHNlbGVjdGlvbi5qb2luTGluZXMoKVxuICAgIGVuZCA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLmVuZFxuICAgIHNlbGVjdGlvbi5jdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oZW5kLnRyYW5zbGF0ZShbMCwgLTFdKSlcblxuY2xhc3MgSm9pbkJhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZChmYWxzZSlcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICB0cmltOiBmYWxzZVxuICB0YXJnZXQ6IFwiTW92ZVRvUmVsYXRpdmVMaW5lTWluaW11bU9uZVwiXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBAZm9jdXNJbnB1dChjaGFyc01heDogMTApIGlmIEByZXF1aXJlSW5wdXRcbiAgICBzdXBlclxuXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIGlmIEB0cmltXG4gICAgICBwYXR0ZXJuID0gL1xccj9cXG5bIFxcdF0qL2dcbiAgICBlbHNlXG4gICAgICBwYXR0ZXJuID0gL1xccj9cXG4vZ1xuICAgIHRleHQudHJpbVJpZ2h0KCkucmVwbGFjZShwYXR0ZXJuLCBAaW5wdXQpICsgXCJcXG5cIlxuXG5jbGFzcyBKb2luV2l0aEtlZXBpbmdTcGFjZSBleHRlbmRzIEpvaW5CYXNlXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBpbnB1dDogJydcblxuY2xhc3MgSm9pbkJ5SW5wdXQgZXh0ZW5kcyBKb2luQmFzZVxuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcIlRyYW5zZm9ybSBtdWx0aS1saW5lIHRvIHNpbmdsZS1saW5lIGJ5IHdpdGggc3BlY2lmaWVkIHNlcGFyYXRvciBjaGFyYWN0ZXJcIlxuICByZXF1aXJlSW5wdXQ6IHRydWVcbiAgdHJpbTogdHJ1ZVxuXG5jbGFzcyBKb2luQnlJbnB1dFdpdGhLZWVwaW5nU3BhY2UgZXh0ZW5kcyBKb2luQnlJbnB1dFxuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcIkpvaW4gbGluZXMgd2l0aG91dCBwYWRkaW5nIHNwYWNlIGJldHdlZW4gZWFjaCBsaW5lXCJcbiAgdHJpbTogZmFsc2VcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIFN0cmluZyBzdWZmaXggaW4gbmFtZSBpcyB0byBhdm9pZCBjb25mdXNpb24gd2l0aCAnc3BsaXQnIHdpbmRvdy5cbmNsYXNzIFNwbGl0U3RyaW5nIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiU3BsaXQgc2luZ2xlLWxpbmUgaW50byBtdWx0aS1saW5lIGJ5IHNwbGl0dGluZyBzcGVjaWZpZWQgc2VwYXJhdG9yIGNoYXJzXCJcbiAgcmVxdWlyZUlucHV0OiB0cnVlXG4gIGlucHV0OiBudWxsXG4gIHRhcmdldDogXCJNb3ZlVG9SZWxhdGl2ZUxpbmVcIlxuICBrZWVwU3BsaXR0ZXI6IGZhbHNlXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBAb25EaWRTZXRUYXJnZXQgPT5cbiAgICAgIEBmb2N1c0lucHV0KGNoYXJzTWF4OiAxMClcbiAgICBzdXBlclxuXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIGlucHV0ID0gQGlucHV0IG9yIFwiXFxcXG5cIlxuICAgIHJlZ2V4ID0gLy8vI3tfLmVzY2FwZVJlZ0V4cChpbnB1dCl9Ly8vZ1xuICAgIGlmIEBrZWVwU3BsaXR0ZXJcbiAgICAgIGxpbmVTZXBhcmF0b3IgPSBAaW5wdXQgKyBcIlxcblwiXG4gICAgZWxzZVxuICAgICAgbGluZVNlcGFyYXRvciA9IFwiXFxuXCJcbiAgICB0ZXh0LnJlcGxhY2UocmVnZXgsIGxpbmVTZXBhcmF0b3IpXG5cbmNsYXNzIFNwbGl0U3RyaW5nV2l0aEtlZXBpbmdTcGxpdHRlciBleHRlbmRzIFNwbGl0U3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBrZWVwU3BsaXR0ZXI6IHRydWVcblxuY2xhc3MgU3BsaXRBcmd1bWVudHMgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIGtlZXBTZXBhcmF0b3I6IHRydWVcbiAgYXV0b0luZGVudEFmdGVySW5zZXJ0VGV4dDogdHJ1ZVxuXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIGFsbFRva2VucyA9IHNwbGl0QXJndW1lbnRzKHRleHQudHJpbSgpKVxuICAgIG5ld1RleHQgPSAnJ1xuICAgIHdoaWxlIGFsbFRva2Vucy5sZW5ndGhcbiAgICAgIHt0ZXh0LCB0eXBlfSA9IGFsbFRva2Vucy5zaGlmdCgpXG4gICAgICBpZiB0eXBlIGlzICdzZXBhcmF0b3InXG4gICAgICAgIGlmIEBrZWVwU2VwYXJhdG9yXG4gICAgICAgICAgdGV4dCA9IHRleHQudHJpbSgpICsgXCJcXG5cIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgdGV4dCA9IFwiXFxuXCJcbiAgICAgIG5ld1RleHQgKz0gdGV4dFxuICAgIFwiXFxuXCIgKyBuZXdUZXh0ICsgXCJcXG5cIlxuXG5jbGFzcyBTcGxpdEFyZ3VtZW50c1dpdGhSZW1vdmVTZXBhcmF0b3IgZXh0ZW5kcyBTcGxpdEFyZ3VtZW50c1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAga2VlcFNlcGFyYXRvcjogZmFsc2VcblxuY2xhc3MgU3BsaXRBcmd1bWVudHNPZklubmVyQW55UGFpciBleHRlbmRzIFNwbGl0QXJndW1lbnRzXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICB0YXJnZXQ6IFwiSW5uZXJBbnlQYWlyXCJcblxuY2xhc3MgQ2hhbmdlT3JkZXIgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZChmYWxzZSlcbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgaWYgQHRhcmdldC5pc0xpbmV3aXNlKClcbiAgICAgIEBnZXROZXdMaXN0KHNwbGl0VGV4dEJ5TmV3TGluZSh0ZXh0KSkuam9pbihcIlxcblwiKSArIFwiXFxuXCJcbiAgICBlbHNlXG4gICAgICBAc29ydEFyZ3VtZW50c0luVGV4dEJ5KHRleHQsIChhcmdzKSA9PiBAZ2V0TmV3TGlzdChhcmdzKSlcblxuICBzb3J0QXJndW1lbnRzSW5UZXh0Qnk6ICh0ZXh0LCBmbikgLT5cbiAgICBsZWFkaW5nU3BhY2VzID0gdHJhaWxpbmdTcGFjZXMgPSAnJ1xuICAgIHN0YXJ0ID0gdGV4dC5zZWFyY2goL1xcUy8pXG4gICAgZW5kID0gdGV4dC5zZWFyY2goL1xccyokLylcbiAgICBsZWFkaW5nU3BhY2VzID0gdHJhaWxpbmdTcGFjZXMgPSAnJ1xuICAgIGxlYWRpbmdTcGFjZXMgPSB0ZXh0WzAuLi5zdGFydF0gaWYgc3RhcnQgaXNudCAtMVxuICAgIHRyYWlsaW5nU3BhY2VzID0gdGV4dFtlbmQuLi5dIGlmIGVuZCBpc250IC0xXG4gICAgdGV4dCA9IHRleHRbc3RhcnQuLi5lbmRdXG5cbiAgICBhbGxUb2tlbnMgPSBzcGxpdEFyZ3VtZW50cyh0ZXh0KVxuICAgIGFyZ3MgPSBhbGxUb2tlbnNcbiAgICAgIC5maWx0ZXIgKHRva2VuKSAtPiB0b2tlbi50eXBlIGlzICdhcmd1bWVudCdcbiAgICAgIC5tYXAgKHRva2VuKSAtPiB0b2tlbi50ZXh0XG4gICAgbmV3QXJncyA9IGZuKGFyZ3MpXG5cbiAgICBuZXdUZXh0ID0gJydcbiAgICB3aGlsZSBhbGxUb2tlbnMubGVuZ3RoXG4gICAgICB7dGV4dCwgdHlwZX0gPSBhbGxUb2tlbnMuc2hpZnQoKVxuICAgICAgbmV3VGV4dCArPSBzd2l0Y2ggdHlwZVxuICAgICAgICB3aGVuICdzZXBhcmF0b3InIHRoZW4gdGV4dFxuICAgICAgICB3aGVuICdhcmd1bWVudCcgdGhlbiBuZXdBcmdzLnNoaWZ0KClcbiAgICBsZWFkaW5nU3BhY2VzICsgbmV3VGV4dCArIHRyYWlsaW5nU3BhY2VzXG5cbmNsYXNzIFJldmVyc2UgZXh0ZW5kcyBDaGFuZ2VPcmRlclxuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgZ2V0TmV3TGlzdDogKHJvd3MpIC0+XG4gICAgcm93cy5yZXZlcnNlKClcblxuY2xhc3MgUmV2ZXJzZUlubmVyQW55UGFpciBleHRlbmRzIFJldmVyc2VcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogXCJJbm5lckFueVBhaXJcIlxuXG5jbGFzcyBSb3RhdGUgZXh0ZW5kcyBDaGFuZ2VPcmRlclxuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgYmFja3dhcmRzOiBmYWxzZVxuICBnZXROZXdMaXN0OiAocm93cykgLT5cbiAgICBpZiBAYmFja3dhcmRzXG4gICAgICByb3dzLnB1c2gocm93cy5zaGlmdCgpKVxuICAgIGVsc2VcbiAgICAgIHJvd3MudW5zaGlmdChyb3dzLnBvcCgpKVxuICAgIHJvd3NcblxuY2xhc3MgUm90YXRlQmFja3dhcmRzIGV4dGVuZHMgQ2hhbmdlT3JkZXJcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIGJhY2t3YXJkczogdHJ1ZVxuXG5jbGFzcyBSb3RhdGVBcmd1bWVudHNPZklubmVyUGFpciBleHRlbmRzIFJvdGF0ZVxuICBAZXh0ZW5kKClcbiAgdGFyZ2V0OiBcIklubmVyQW55UGFpclwiXG5cbmNsYXNzIFJvdGF0ZUFyZ3VtZW50c0JhY2t3YXJkc09mSW5uZXJQYWlyIGV4dGVuZHMgUm90YXRlQXJndW1lbnRzT2ZJbm5lclBhaXJcbiAgQGV4dGVuZCgpXG4gIGJhY2t3YXJkczogdHJ1ZVxuXG5jbGFzcyBTb3J0IGV4dGVuZHMgQ2hhbmdlT3JkZXJcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTb3J0IGFscGhhYmV0aWNhbGx5XCJcbiAgZ2V0TmV3TGlzdDogKHJvd3MpIC0+XG4gICAgcm93cy5zb3J0KClcblxuY2xhc3MgU29ydENhc2VJbnNlbnNpdGl2ZWx5IGV4dGVuZHMgQ2hhbmdlT3JkZXJcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTb3J0IGFscGhhYmV0aWNhbGx5IHdpdGggY2FzZSBpbnNlbnNpdGl2ZWx5XCJcbiAgZ2V0TmV3TGlzdDogKHJvd3MpIC0+XG4gICAgcm93cy5zb3J0IChyb3dBLCByb3dCKSAtPlxuICAgICAgcm93QS5sb2NhbGVDb21wYXJlKHJvd0IsIHNlbnNpdGl2aXR5OiAnYmFzZScpXG5cbmNsYXNzIFNvcnRCeU51bWJlciBleHRlbmRzIENoYW5nZU9yZGVyXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiU29ydCBudW1lcmljYWxseVwiXG4gIGdldE5ld0xpc3Q6IChyb3dzKSAtPlxuICAgIF8uc29ydEJ5IHJvd3MsIChyb3cpIC0+XG4gICAgICBOdW1iZXIucGFyc2VJbnQocm93KSBvciBJbmZpbml0eVxuIl19
