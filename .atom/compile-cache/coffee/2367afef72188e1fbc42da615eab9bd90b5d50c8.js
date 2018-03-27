(function() {
  var AutoFlow, AutoIndent, Base, BufferedProcess, CamelCase, ChangeOrder, ChangeSurround, ChangeSurroundAnyPair, ChangeSurroundAnyPairAllowForwarding, CompactSpaces, ConvertToHardTab, ConvertToSoftTab, DashCase, DecodeUriComponent, DeleteSurround, DeleteSurroundAnyPair, DeleteSurroundAnyPairAllowForwarding, EncodeUriComponent, Indent, Join, JoinBase, JoinByInput, JoinByInputWithKeepingSpace, JoinWithKeepingSpace, LowerCase, MapSurround, Operator, Outdent, PascalCase, Range, RemoveLeadingWhiteSpaces, Replace, ReplaceCharacter, ReplaceWithRegister, Reverse, ReverseInnerAnyPair, Rotate, RotateBackwards, SnakeCase, Sort, SortByNumber, SortCaseInsensitively, SplitArguments, SplitArgumentsOfInnerAnyPair, SplitArgumentsWithRemoveSeparator, SplitByCharacter, SplitString, SplitStringWithKeepingSplitter, Surround, SurroundBase, SurroundSmartWord, SurroundWord, SwapWithRegister, TitleCase, ToggleCase, ToggleCaseAndMoveRight, ToggleLineComments, TransformSmartWordBySelectList, TransformString, TransformStringByExternalCommand, TransformStringBySelectList, TransformWordBySelectList, TrimString, UpperCase, _, adjustIndentWithKeepingLayout, getIndentLevelForBufferRow, isLinewiseRange, isSingleLineText, limitNumber, ref, ref1, splitArguments, splitTextByNewLine, swrap, toggleCaseForCharacter,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    modulo = function(a, b) { return (+a % (b = +b) + b) % b; },
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    slice = [].slice;

  _ = require('underscore-plus');

  ref = require('atom'), BufferedProcess = ref.BufferedProcess, Range = ref.Range;

  ref1 = require('./utils'), isSingleLineText = ref1.isSingleLineText, isLinewiseRange = ref1.isLinewiseRange, limitNumber = ref1.limitNumber, toggleCaseForCharacter = ref1.toggleCaseForCharacter, splitTextByNewLine = ref1.splitTextByNewLine, splitArguments = ref1.splitArguments, getIndentLevelForBufferRow = ref1.getIndentLevelForBufferRow, adjustIndentWithKeepingLayout = ref1.adjustIndentWithKeepingLayout;

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

    SurroundBase.prototype.pairCharsAllowForwarding = '[](){}';

    SurroundBase.prototype.input = null;

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

    Rotate.prototype.getNewList = function(rows) {
      rows.unshift(rows.pop());
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

    RotateBackwards.prototype.getNewList = function(rows) {
      rows.push(rows.shift());
      return rows;
    };

    return RotateBackwards;

  })(ChangeOrder);

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3ItdHJhbnNmb3JtLXN0cmluZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDJ3Q0FBQTtJQUFBOzs7Ozs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQTJCLE9BQUEsQ0FBUSxNQUFSLENBQTNCLEVBQUMscUNBQUQsRUFBa0I7O0VBRWxCLE9BU0ksT0FBQSxDQUFRLFNBQVIsQ0FUSixFQUNFLHdDQURGLEVBRUUsc0NBRkYsRUFHRSw4QkFIRixFQUlFLG9EQUpGLEVBS0UsNENBTEYsRUFNRSxvQ0FORixFQU9FLDREQVBGLEVBUUU7O0VBRUYsS0FBQSxHQUFRLE9BQUEsQ0FBUSxxQkFBUjs7RUFDUixJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBQ1AsUUFBQSxHQUFXLElBQUksQ0FBQyxRQUFMLENBQWMsVUFBZDs7RUFJTDs7Ozs7OztJQUNKLGVBQUMsQ0FBQSxNQUFELENBQVEsS0FBUjs7OEJBQ0EsV0FBQSxHQUFhOzs4QkFDYixjQUFBLEdBQWdCOzs4QkFDaEIsVUFBQSxHQUFZOzs4QkFDWixpQkFBQSxHQUFtQjs7OEJBQ25CLHlCQUFBLEdBQTJCOztJQUMzQixlQUFDLENBQUEsa0JBQUQsR0FBcUI7O0lBRXJCLGVBQUMsQ0FBQSxvQkFBRCxHQUF1QixTQUFBO2FBQ3JCLElBQUMsQ0FBQSxrQkFBa0IsQ0FBQyxJQUFwQixDQUF5QixJQUF6QjtJQURxQjs7OEJBR3ZCLGVBQUEsR0FBaUIsU0FBQyxTQUFEO0FBQ2YsVUFBQTtNQUFBLElBQUcsSUFBQSxHQUFPLElBQUMsQ0FBQSxVQUFELENBQVksU0FBUyxDQUFDLE9BQVYsQ0FBQSxDQUFaLEVBQWlDLFNBQWpDLENBQVY7UUFDRSxJQUFHLElBQUMsQ0FBQSx5QkFBSjtVQUNFLFFB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QUFJLENBQUMsSUFBTCxDQUFVLElBQUksQ0FBQyxLQUFMLENBQUEsQ0FBVjthQUNBO0lBRlU7Ozs7S0FIZ0I7O0VBT3hCOzs7Ozs7O0lBQ0osSUFBQyxDQUFBLE1BQUQsQ0FBQTs7SUFDQSxJQUFDLENBQUEsb0JBQUQsQ0FBQTs7SUFDQSxJQUFDLENBQUEsV0FBRCxHQUFjOzttQkFDZCxVQUFBLEdBQVksU0FBQyxJQUFEO2FBQ1YsSUFBSSxDQUFDLElBQUwsQ0FBQTtJQURVOzs7O0tBSks7O0VBT2I7Ozs7Ozs7SUFDSixxQkFBQyxDQUFBLE1BQUQsQ0FBQTs7SUFDQSxxQkFBQyxDQUFBLG9CQUFELENBQUE7O0lBQ0EscUJBQUMsQ0FBQSxXQUFELEdBQWM7O29DQUNkLFVBQUEsR0FBWSxTQUFDLElBQUQ7YUFDVixJQUFJLENBQUMsSUFBTCxDQUFVLFNBQUMsSUFBRCxFQUFPLElBQVA7ZUFDUixJQUFJLENBQUMsYUFBTCxDQUFtQixJQUFuQixFQUF5QjtVQUFBLFdBQUEsRUFBYSxNQUFiO1NBQXpCO01BRFEsQ0FBVjtJQURVOzs7O0tBSnNCOztFQVE5Qjs7Ozs7OztJQUNKLFlBQUMsQ0FBQSxNQUFELENBQUE7O0lBQ0EsWUFBQyxDQUFBLG9CQUFELENBQUE7O0lBQ0EsWUFBQyxDQUFBLFdBQUQsR0FBYzs7MkJBQ2QsVUFBQSxHQUFZLFNBQUMsSUFBRDthQUNWLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxFQUFlLFNBQUMsR0FBRDtlQUNiLE1BQU0sQ0FBQyxRQUFQLENBQWdCLEdBQWhCLENBQUEsSUFBd0I7TUFEWCxDQUFmO0lBRFU7Ozs7S0FKYTtBQWh1QjNCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntCdWZmZXJlZFByb2Nlc3MsIFJhbmdlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbntcbiAgaXNTaW5nbGVMaW5lVGV4dFxuICBpc0xpbmV3aXNlUmFuZ2VcbiAgbGltaXROdW1iZXJcbiAgdG9nZ2xlQ2FzZUZvckNoYXJhY3RlclxuICBzcGxpdFRleHRCeU5ld0xpbmVcbiAgc3BsaXRBcmd1bWVudHNcbiAgZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3dcbiAgYWRqdXN0SW5kZW50V2l0aEtlZXBpbmdMYXlvdXRcbn0gPSByZXF1aXJlICcuL3V0aWxzJ1xuc3dyYXAgPSByZXF1aXJlICcuL3NlbGVjdGlvbi13cmFwcGVyJ1xuQmFzZSA9IHJlcXVpcmUgJy4vYmFzZSdcbk9wZXJhdG9yID0gQmFzZS5nZXRDbGFzcygnT3BlcmF0b3InKVxuXG4jIFRyYW5zZm9ybVN0cmluZ1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgVHJhbnNmb3JtU3RyaW5nIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZChmYWxzZSlcbiAgdHJhY2tDaGFuZ2U6IHRydWVcbiAgc3RheU9wdGlvbk5hbWU6ICdzdGF5T25UcmFuc2Zvcm1TdHJpbmcnXG4gIGF1dG9JbmRlbnQ6IGZhbHNlXG4gIGF1dG9JbmRlbnROZXdsaW5lOiBmYWxzZVxuICBhdXRvSW5kZW50QWZ0ZXJJbnNlcnRUZXh0OiBmYWxzZVxuICBAc3RyaW5nVHJhbnNmb3JtZXJzOiBbXVxuXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdDogLT5cbiAgICBAc3RyaW5nVHJhbnNmb3JtZXJzLnB1c2godGhpcylcblxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgaWYgdGV4dCA9IEBnZXROZXdUZXh0KHNlbGVjdGlvbi5nZXRUZXh0KCksIHNlbGVjdGlvbilcbiAgICAgIGlmIEBhdXRvSW5kZW50QWZ0ZXJJbnNlcnRUZXh0XG4gICAgICAgIHN0YXJ0Um93ID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnQucm93XG4gICAgICAgIHN0YXJ0Um93SW5kZW50TGV2ZWwgPSBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdyhAZWRpdG9yLCBzdGFydFJvdylcbiAgICAgIHJhbmdlID0gc2VsZWN0aW9uLmluc2VydFRleHQodGV4dCwge0BhdXRvSW5kZW50LCBAYXV0b0luZGVudE5ld2xpbmV9KVxuICAgICAgaWYgQGF1dG9JbmRlbnRBZnRlckluc2VydFRleHRcbiAgICAgICAgIyBDdXJyZW50bHkgdXNlZCBieSBTcGxpdEFyZ3VtZW50cyBhbmQgU3Vycm91bmQoIGxpbmV3aXNlIHRhcmdldCBvbmx5IClcbiAgICAgICAgcmFuZ2UgPSByYW5nZS50cmFuc2xhdGUoWzAsIDBdLCBbLTEsIDBdKSBpZiBAdGFyZ2V0LmlzTGluZXdpc2UoKVxuICAgICAgICBAZWRpdG9yLnNldEluZGVudGF0aW9uRm9yQnVmZmVyUm93KHJhbmdlLnN0YXJ0LnJvdywgc3RhcnRSb3dJbmRlbnRMZXZlbClcbiAgICAgICAgQGVkaXRvci5zZXRJbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyYW5nZS5lbmQucm93LCBzdGFydFJvd0luZGVudExldmVsKVxuICAgICAgICAjIEFkanVzdCBpbm5lciByYW5nZSwgZW5kLnJvdyBpcyBhbHJlYWR5KCBpZiBuZWVkZWQgKSB0cmFuc2xhdGVkIHNvIG5vIG5lZWQgdG8gcmUtdHJhbnNsYXRlLlxuICAgICAgICBhZGp1c3RJbmRlbnRXaXRoS2VlcGluZ0xheW91dChAZWRpdG9yLCByYW5nZS50cmFuc2xhdGUoWzEsIDBdLCBbMCwgMF0pKVxuXG5jbGFzcyBUb2dnbGVDYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiYEhlbGxvIFdvcmxkYCAtPiBgaEVMTE8gd09STERgXCJcbiAgZGlzcGxheU5hbWU6ICdUb2dnbGUgfidcblxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICB0ZXh0LnJlcGxhY2UoLy4vZywgdG9nZ2xlQ2FzZUZvckNoYXJhY3RlcilcblxuY2xhc3MgVG9nZ2xlQ2FzZUFuZE1vdmVSaWdodCBleHRlbmRzIFRvZ2dsZUNhc2VcbiAgQGV4dGVuZCgpXG4gIGZsYXNoVGFyZ2V0OiBmYWxzZVxuICByZXN0b3JlUG9zaXRpb25zOiBmYWxzZVxuICB0YXJnZXQ6ICdNb3ZlUmlnaHQnXG5cbmNsYXNzIFVwcGVyQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcImBIZWxsbyBXb3JsZGAgLT4gYEhFTExPIFdPUkxEYFwiXG4gIGRpc3BsYXlOYW1lOiAnVXBwZXInXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIHRleHQudG9VcHBlckNhc2UoKVxuXG5jbGFzcyBMb3dlckNhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJgSGVsbG8gV29ybGRgIC0+IGBoZWxsbyB3b3JsZGBcIlxuICBkaXNwbGF5TmFtZTogJ0xvd2VyJ1xuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICB0ZXh0LnRvTG93ZXJDYXNlKClcblxuIyBSZXBsYWNlXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFJlcGxhY2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIGZsYXNoQ2hlY2twb2ludDogJ2RpZC1zZWxlY3Qtb2NjdXJyZW5jZSdcbiAgaW5wdXQ6IG51bGxcbiAgcmVxdWlyZUlucHV0OiB0cnVlXG4gIGF1dG9JbmRlbnROZXdsaW5lOiB0cnVlXG4gIHN1cHBvcnRFYXJseVNlbGVjdDogdHJ1ZVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgQG9uRGlkU2VsZWN0VGFyZ2V0ID0+XG4gICAgICBAZm9jdXNJbnB1dCgxLCB0cnVlKVxuICAgIHN1cGVyXG5cbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgaWYgQHRhcmdldC5pcygnTW92ZVJpZ2h0QnVmZmVyQ29sdW1uJykgYW5kIHRleHQubGVuZ3RoIGlzbnQgQGdldENvdW50KClcbiAgICAgIHJldHVyblxuXG4gICAgaW5wdXQgPSBAaW5wdXQgb3IgXCJcXG5cIlxuICAgIGlmIGlucHV0IGlzIFwiXFxuXCJcbiAgICAgIEByZXN0b3JlUG9zaXRpb25zID0gZmFsc2VcbiAgICB0ZXh0LnJlcGxhY2UoLy4vZywgaW5wdXQpXG5cbmNsYXNzIFJlcGxhY2VDaGFyYWN0ZXIgZXh0ZW5kcyBSZXBsYWNlXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6IFwiTW92ZVJpZ2h0QnVmZmVyQ29sdW1uXCJcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIERVUCBtZWFuaW5nIHdpdGggU3BsaXRTdHJpbmcgbmVlZCBjb25zb2xpZGF0ZS5cbmNsYXNzIFNwbGl0QnlDaGFyYWN0ZXIgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIHRleHQuc3BsaXQoJycpLmpvaW4oJyAnKVxuXG5jbGFzcyBDYW1lbENhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIGRpc3BsYXlOYW1lOiAnQ2FtZWxpemUnXG4gIEBkZXNjcmlwdGlvbjogXCJgaGVsbG8td29ybGRgIC0+IGBoZWxsb1dvcmxkYFwiXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIF8uY2FtZWxpemUodGV4dClcblxuY2xhc3MgU25ha2VDYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiYEhlbGxvV29ybGRgIC0+IGBoZWxsb193b3JsZGBcIlxuICBkaXNwbGF5TmFtZTogJ1VuZGVyc2NvcmUgXydcbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgXy51bmRlcnNjb3JlKHRleHQpXG5cbmNsYXNzIFBhc2NhbENhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJgaGVsbG9fd29ybGRgIC0+IGBIZWxsb1dvcmxkYFwiXG4gIGRpc3BsYXlOYW1lOiAnUGFzY2FsaXplJ1xuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBfLmNhcGl0YWxpemUoXy5jYW1lbGl6ZSh0ZXh0KSlcblxuY2xhc3MgRGFzaENhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIGRpc3BsYXlOYW1lOiAnRGFzaGVyaXplIC0nXG4gIEBkZXNjcmlwdGlvbjogXCJIZWxsb1dvcmxkIC0+IGhlbGxvLXdvcmxkXCJcbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgXy5kYXNoZXJpemUodGV4dClcblxuY2xhc3MgVGl0bGVDYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiYEhlbGxvV29ybGRgIC0+IGBIZWxsbyBXb3JsZGBcIlxuICBkaXNwbGF5TmFtZTogJ1RpdGxpemUnXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIF8uaHVtYW5pemVFdmVudE5hbWUoXy5kYXNoZXJpemUodGV4dCkpXG5cbmNsYXNzIEVuY29kZVVyaUNvbXBvbmVudCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcImBIZWxsbyBXb3JsZGAgLT4gYEhlbGxvJTIwV29ybGRgXCJcbiAgZGlzcGxheU5hbWU6ICdFbmNvZGUgVVJJIENvbXBvbmVudCAlJ1xuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBlbmNvZGVVUklDb21wb25lbnQodGV4dClcblxuY2xhc3MgRGVjb2RlVXJpQ29tcG9uZW50IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiYEhlbGxvJTIwV29ybGRgIC0+IGBIZWxsbyBXb3JsZGBcIlxuICBkaXNwbGF5TmFtZTogJ0RlY29kZSBVUkkgQ29tcG9uZW50ICUlJ1xuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBkZWNvZGVVUklDb21wb25lbnQodGV4dClcblxuY2xhc3MgVHJpbVN0cmluZyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcImAgaGVsbG8gYCAtPiBgaGVsbG9gXCJcbiAgZGlzcGxheU5hbWU6ICdUcmltIHN0cmluZydcbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgdGV4dC50cmltKClcblxuY2xhc3MgQ29tcGFjdFNwYWNlcyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcImAgIGEgICAgYiAgICBjYCAtPiBgYSBiIGNgXCJcbiAgZGlzcGxheU5hbWU6ICdDb21wYWN0IHNwYWNlJ1xuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBpZiB0ZXh0Lm1hdGNoKC9eWyBdKyQvKVxuICAgICAgJyAnXG4gICAgZWxzZVxuICAgICAgIyBEb24ndCBjb21wYWN0IGZvciBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZSBzcGFjZXMuXG4gICAgICB0ZXh0LnJlcGxhY2UgL14oXFxzKikoLio/KShcXHMqKSQvZ20sIChtLCBsZWFkaW5nLCBtaWRkbGUsIHRyYWlsaW5nKSAtPlxuICAgICAgICBsZWFkaW5nICsgbWlkZGxlLnNwbGl0KC9bIFxcdF0rLykuam9pbignICcpICsgdHJhaWxpbmdcblxuY2xhc3MgUmVtb3ZlTGVhZGluZ1doaXRlU3BhY2VzIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIEBkZXNjcmlwdGlvbjogXCJgICBhIGIgY2AgLT4gYGEgYiBjYFwiXG4gIGdldE5ld1RleHQ6ICh0ZXh0LCBzZWxlY3Rpb24pIC0+XG4gICAgdHJpbUxlZnQgPSAodGV4dCkgLT4gdGV4dC50cmltTGVmdCgpXG4gICAgc3BsaXRUZXh0QnlOZXdMaW5lKHRleHQpLm1hcCh0cmltTGVmdCkuam9pbihcIlxcblwiKSArIFwiXFxuXCJcblxuY2xhc3MgQ29udmVydFRvU29mdFRhYiBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgZGlzcGxheU5hbWU6ICdTb2Z0IFRhYidcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBAc2NhbkZvcndhcmQgL1xcdC9nLCB7c2NhblJhbmdlOiBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKX0sICh7cmFuZ2UsIHJlcGxhY2V9KSA9PlxuICAgICAgIyBSZXBsYWNlIFxcdCB0byBzcGFjZXMgd2hpY2ggbGVuZ3RoIGlzIHZhcnkgZGVwZW5kaW5nIG9uIHRhYlN0b3AgYW5kIHRhYkxlbmdodFxuICAgICAgIyBTbyB3ZSBkaXJlY3RseSBjb25zdWx0IGl0J3Mgc2NyZWVuIHJlcHJlc2VudGluZyBsZW5ndGguXG4gICAgICBsZW5ndGggPSBAZWRpdG9yLnNjcmVlblJhbmdlRm9yQnVmZmVyUmFuZ2UocmFuZ2UpLmdldEV4dGVudCgpLmNvbHVtblxuICAgICAgcmVwbGFjZShcIiBcIi5yZXBlYXQobGVuZ3RoKSlcblxuY2xhc3MgQ29udmVydFRvSGFyZFRhYiBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgZGlzcGxheU5hbWU6ICdIYXJkIFRhYidcblxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgdGFiTGVuZ3RoID0gQGVkaXRvci5nZXRUYWJMZW5ndGgoKVxuICAgIEBzY2FuRm9yd2FyZCAvWyBcXHRdKy9nLCB7c2NhblJhbmdlOiBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKX0sICh7cmFuZ2UsIHJlcGxhY2V9KSA9PlxuICAgICAge3N0YXJ0LCBlbmR9ID0gQGVkaXRvci5zY3JlZW5SYW5nZUZvckJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgICAgc3RhcnRDb2x1bW4gPSBzdGFydC5jb2x1bW5cbiAgICAgIGVuZENvbHVtbiA9IGVuZC5jb2x1bW5cblxuICAgICAgIyBXZSBjYW4ndCBuYWl2ZWx5IHJlcGxhY2Ugc3BhY2VzIHRvIHRhYiwgd2UgaGF2ZSB0byBjb25zaWRlciB2YWxpZCB0YWJTdG9wIGNvbHVtblxuICAgICAgIyBJZiBuZXh0VGFiU3RvcCBjb2x1bW4gZXhjZWVkcyByZXBsYWNhYmxlIHJhbmdlLCB3ZSBwYWQgd2l0aCBzcGFjZXMuXG4gICAgICBuZXdUZXh0ID0gJydcbiAgICAgIGxvb3BcbiAgICAgICAgcmVtYWluZGVyID0gc3RhcnRDb2x1bW4gJSUgdGFiTGVuZ3RoXG4gICAgICAgIG5leHRUYWJTdG9wID0gc3RhcnRDb2x1bW4gKyAoaWYgcmVtYWluZGVyIGlzIDAgdGhlbiB0YWJMZW5ndGggZWxzZSByZW1haW5kZXIpXG4gICAgICAgIGlmIG5leHRUYWJTdG9wID4gZW5kQ29sdW1uXG4gICAgICAgICAgbmV3VGV4dCArPSBcIiBcIi5yZXBlYXQoZW5kQ29sdW1uIC0gc3RhcnRDb2x1bW4pXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBuZXdUZXh0ICs9IFwiXFx0XCJcbiAgICAgICAgc3RhcnRDb2x1bW4gPSBuZXh0VGFiU3RvcFxuICAgICAgICBicmVhayBpZiBzdGFydENvbHVtbiA+PSBlbmRDb2x1bW5cblxuICAgICAgcmVwbGFjZShuZXdUZXh0KVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFRyYW5zZm9ybVN0cmluZ0J5RXh0ZXJuYWxDb21tYW5kIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoZmFsc2UpXG4gIGF1dG9JbmRlbnQ6IHRydWVcbiAgY29tbWFuZDogJycgIyBlLmcuIGNvbW1hbmQ6ICdzb3J0J1xuICBhcmdzOiBbXSAjIGUuZyBhcmdzOiBbJy1ybiddXG4gIHN0ZG91dEJ5U2VsZWN0aW9uOiBudWxsXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAbm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICBpZiBAc2VsZWN0VGFyZ2V0KClcbiAgICAgIG5ldyBQcm9taXNlIChyZXNvbHZlKSA9PlxuICAgICAgICBAY29sbGVjdChyZXNvbHZlKVxuICAgICAgLnRoZW4gPT5cbiAgICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICAgIHRleHQgPSBAZ2V0TmV3VGV4dChzZWxlY3Rpb24uZ2V0VGV4dCgpLCBzZWxlY3Rpb24pXG4gICAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dCwge0BhdXRvSW5kZW50fSlcbiAgICAgICAgQHJlc3RvcmVDdXJzb3JQb3NpdGlvbnNJZk5lY2Vzc2FyeSgpXG4gICAgICAgIEBhY3RpdmF0ZU1vZGUoQGZpbmFsTW9kZSwgQGZpbmFsU3VibW9kZSlcblxuICBjb2xsZWN0OiAocmVzb2x2ZSkgLT5cbiAgICBAc3Rkb3V0QnlTZWxlY3Rpb24gPSBuZXcgTWFwXG4gICAgcHJvY2Vzc1J1bm5pbmcgPSBwcm9jZXNzRmluaXNoZWQgPSAwXG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAge2NvbW1hbmQsIGFyZ3N9ID0gQGdldENvbW1hbmQoc2VsZWN0aW9uKSA/IHt9XG4gICAgICByZXR1cm4gdW5sZXNzIChjb21tYW5kPyBhbmQgYXJncz8pXG4gICAgICBwcm9jZXNzUnVubmluZysrXG4gICAgICBkbyAoc2VsZWN0aW9uKSA9PlxuICAgICAgICBzdGRpbiA9IEBnZXRTdGRpbihzZWxlY3Rpb24pXG4gICAgICAgIHN0ZG91dCA9IChvdXRwdXQpID0+XG4gICAgICAgICAgQHN0ZG91dEJ5U2VsZWN0aW9uLnNldChzZWxlY3Rpb24sIG91dHB1dClcbiAgICAgICAgZXhpdCA9IChjb2RlKSAtPlxuICAgICAgICAgIHByb2Nlc3NGaW5pc2hlZCsrXG4gICAgICAgICAgcmVzb2x2ZSgpIGlmIChwcm9jZXNzUnVubmluZyBpcyBwcm9jZXNzRmluaXNoZWQpXG4gICAgICAgIEBydW5FeHRlcm5hbENvbW1hbmQge2NvbW1hbmQsIGFyZ3MsIHN0ZG91dCwgZXhpdCwgc3RkaW59XG5cbiAgcnVuRXh0ZXJuYWxDb21tYW5kOiAob3B0aW9ucykgLT5cbiAgICBzdGRpbiA9IG9wdGlvbnMuc3RkaW5cbiAgICBkZWxldGUgb3B0aW9ucy5zdGRpblxuICAgIGJ1ZmZlcmVkUHJvY2VzcyA9IG5ldyBCdWZmZXJlZFByb2Nlc3Mob3B0aW9ucylcbiAgICBidWZmZXJlZFByb2Nlc3Mub25XaWxsVGhyb3dFcnJvciAoe2Vycm9yLCBoYW5kbGV9KSA9PlxuICAgICAgIyBTdXBwcmVzcyBjb21tYW5kIG5vdCBmb3VuZCBlcnJvciBpbnRlbnRpb25hbGx5LlxuICAgICAgaWYgZXJyb3IuY29kZSBpcyAnRU5PRU5UJyBhbmQgZXJyb3Iuc3lzY2FsbC5pbmRleE9mKCdzcGF3bicpIGlzIDBcbiAgICAgICAgY29tbWFuZE5hbWUgPSBAY29uc3RydWN0b3IuZ2V0Q29tbWFuZE5hbWUoKVxuICAgICAgICBjb25zb2xlLmxvZyBcIiN7Y29tbWFuZE5hbWV9OiBGYWlsZWQgdG8gc3Bhd24gY29tbWFuZCAje2Vycm9yLnBhdGh9LlwiXG4gICAgICAgIGhhbmRsZSgpXG4gICAgICBAY2FuY2VsT3BlcmF0aW9uKClcblxuICAgIGlmIHN0ZGluXG4gICAgICBidWZmZXJlZFByb2Nlc3MucHJvY2Vzcy5zdGRpbi53cml0ZShzdGRpbilcbiAgICAgIGJ1ZmZlcmVkUHJvY2Vzcy5wcm9jZXNzLnN0ZGluLmVuZCgpXG5cbiAgZ2V0TmV3VGV4dDogKHRleHQsIHNlbGVjdGlvbikgLT5cbiAgICBAZ2V0U3Rkb3V0KHNlbGVjdGlvbikgPyB0ZXh0XG5cbiAgIyBGb3IgZWFzaWx5IGV4dGVuZCBieSB2bXAgcGx1Z2luLlxuICBnZXRDb21tYW5kOiAoc2VsZWN0aW9uKSAtPiB7QGNvbW1hbmQsIEBhcmdzfVxuICBnZXRTdGRpbjogKHNlbGVjdGlvbikgLT4gc2VsZWN0aW9uLmdldFRleHQoKVxuICBnZXRTdGRvdXQ6IChzZWxlY3Rpb24pIC0+IEBzdGRvdXRCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFRyYW5zZm9ybVN0cmluZ0J5U2VsZWN0TGlzdCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIkludGVyYWN0aXZlbHkgY2hvb3NlIHN0cmluZyB0cmFuc2Zvcm1hdGlvbiBvcGVyYXRvciBmcm9tIHNlbGVjdC1saXN0XCJcbiAgQHNlbGVjdExpc3RJdGVtczogbnVsbFxuICByZXF1aXJlSW5wdXQ6IHRydWVcblxuICBnZXRJdGVtczogLT5cbiAgICBAY29uc3RydWN0b3Iuc2VsZWN0TGlzdEl0ZW1zID89IEBjb25zdHJ1Y3Rvci5zdHJpbmdUcmFuc2Zvcm1lcnMubWFwIChrbGFzcykgLT5cbiAgICAgIGlmIGtsYXNzOjpoYXNPd25Qcm9wZXJ0eSgnZGlzcGxheU5hbWUnKVxuICAgICAgICBkaXNwbGF5TmFtZSA9IGtsYXNzOjpkaXNwbGF5TmFtZVxuICAgICAgZWxzZVxuICAgICAgICBkaXNwbGF5TmFtZSA9IF8uaHVtYW5pemVFdmVudE5hbWUoXy5kYXNoZXJpemUoa2xhc3MubmFtZSkpXG4gICAgICB7bmFtZToga2xhc3MsIGRpc3BsYXlOYW1lfVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgc3VwZXJcblxuICAgIEB2aW1TdGF0ZS5vbkRpZENvbmZpcm1TZWxlY3RMaXN0IChpdGVtKSA9PlxuICAgICAgdHJhbnNmb3JtZXIgPSBpdGVtLm5hbWVcbiAgICAgIEB0YXJnZXQgPSB0cmFuc2Zvcm1lcjo6dGFyZ2V0IGlmIHRyYW5zZm9ybWVyOjp0YXJnZXQ/XG4gICAgICBAdmltU3RhdGUucmVzZXQoKVxuICAgICAgaWYgQHRhcmdldD9cbiAgICAgICAgQHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bih0cmFuc2Zvcm1lciwge0B0YXJnZXR9KVxuICAgICAgZWxzZVxuICAgICAgICBAdmltU3RhdGUub3BlcmF0aW9uU3RhY2sucnVuKHRyYW5zZm9ybWVyKVxuXG4gICAgQGZvY3VzU2VsZWN0TGlzdChpdGVtczogQGdldEl0ZW1zKCkpXG5cbiAgZXhlY3V0ZTogLT5cbiAgICAjIE5FVkVSIGJlIGV4ZWN1dGVkIHNpbmNlIG9wZXJhdGlvblN0YWNrIGlzIHJlcGxhY2VkIHdpdGggc2VsZWN0ZWQgdHJhbnNmb3JtZXJcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCIje0BuYW1lfSBzaG91bGQgbm90IGJlIGV4ZWN1dGVkXCIpXG5cbmNsYXNzIFRyYW5zZm9ybVdvcmRCeVNlbGVjdExpc3QgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdCeVNlbGVjdExpc3RcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogXCJJbm5lcldvcmRcIlxuXG5jbGFzcyBUcmFuc2Zvcm1TbWFydFdvcmRCeVNlbGVjdExpc3QgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdCeVNlbGVjdExpc3RcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJUcmFuc2Zvcm0gSW5uZXJTbWFydFdvcmQgYnkgYHRyYW5zZm9ybS1zdHJpbmctYnktc2VsZWN0LWxpc3RgXCJcbiAgdGFyZ2V0OiBcIklubmVyU21hcnRXb3JkXCJcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBSZXBsYWNlV2l0aFJlZ2lzdGVyIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiUmVwbGFjZSB0YXJnZXQgd2l0aCBzcGVjaWZpZWQgcmVnaXN0ZXIgdmFsdWVcIlxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBAdmltU3RhdGUucmVnaXN0ZXIuZ2V0VGV4dCgpXG5cbiMgU2F2ZSB0ZXh0IHRvIHJlZ2lzdGVyIGJlZm9yZSByZXBsYWNlXG5jbGFzcyBTd2FwV2l0aFJlZ2lzdGVyIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiU3dhcCByZWdpc3RlciB2YWx1ZSB3aXRoIHRhcmdldFwiXG4gIGdldE5ld1RleHQ6ICh0ZXh0LCBzZWxlY3Rpb24pIC0+XG4gICAgbmV3VGV4dCA9IEB2aW1TdGF0ZS5yZWdpc3Rlci5nZXRUZXh0KClcbiAgICBAc2V0VGV4dFRvUmVnaXN0ZXIodGV4dCwgc2VsZWN0aW9uKVxuICAgIG5ld1RleHRcblxuIyBJbmRlbnQgPCBUcmFuc2Zvcm1TdHJpbmdcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgSW5kZW50IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBzdGF5QnlNYXJrZXI6IHRydWVcbiAgc2V0VG9GaXJzdENoYXJhY3Rlck9uTGluZXdpc2U6IHRydWVcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICAjIE5lZWQgY291bnQgdGltZXMgaW5kZW50YXRpb24gaW4gdmlzdWFsLW1vZGUgYW5kIGl0cyByZXBlYXQoYC5gKS5cbiAgICBpZiBAdGFyZ2V0LmlzKCdDdXJyZW50U2VsZWN0aW9uJylcbiAgICAgIG9sZFRleHQgPSBudWxsXG4gICAgICAgIyBsaW1pdCB0byAxMDAgdG8gYXZvaWQgZnJlZXppbmcgYnkgYWNjaWRlbnRhbCBiaWcgbnVtYmVyLlxuICAgICAgY291bnQgPSBsaW1pdE51bWJlcihAZ2V0Q291bnQoKSwgbWF4OiAxMDApXG4gICAgICBAY291bnRUaW1lcyBjb3VudCwgKHtzdG9wfSkgPT5cbiAgICAgICAgb2xkVGV4dCA9IHNlbGVjdGlvbi5nZXRUZXh0KClcbiAgICAgICAgQGluZGVudChzZWxlY3Rpb24pXG4gICAgICAgIHN0b3AoKSBpZiBzZWxlY3Rpb24uZ2V0VGV4dCgpIGlzIG9sZFRleHRcbiAgICBlbHNlXG4gICAgICBAaW5kZW50KHNlbGVjdGlvbilcblxuICBpbmRlbnQ6IChzZWxlY3Rpb24pIC0+XG4gICAgc2VsZWN0aW9uLmluZGVudFNlbGVjdGVkUm93cygpXG5cbmNsYXNzIE91dGRlbnQgZXh0ZW5kcyBJbmRlbnRcbiAgQGV4dGVuZCgpXG4gIGluZGVudDogKHNlbGVjdGlvbikgLT5cbiAgICBzZWxlY3Rpb24ub3V0ZGVudFNlbGVjdGVkUm93cygpXG5cbmNsYXNzIEF1dG9JbmRlbnQgZXh0ZW5kcyBJbmRlbnRcbiAgQGV4dGVuZCgpXG4gIGluZGVudDogKHNlbGVjdGlvbikgLT5cbiAgICBzZWxlY3Rpb24uYXV0b0luZGVudFNlbGVjdGVkUm93cygpXG5cbmNsYXNzIFRvZ2dsZUxpbmVDb21tZW50cyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgc3RheUJ5TWFya2VyOiB0cnVlXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIHNlbGVjdGlvbi50b2dnbGVMaW5lQ29tbWVudHMoKVxuXG5jbGFzcyBBdXRvRmxvdyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goQGVkaXRvckVsZW1lbnQsICdhdXRvZmxvdzpyZWZsb3ctc2VsZWN0aW9uJylcblxuIyBTdXJyb3VuZCA8IFRyYW5zZm9ybVN0cmluZ1xuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBTdXJyb3VuZEJhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZChmYWxzZSlcbiAgcGFpcnM6IFtcbiAgICBbJ1snLCAnXSddXG4gICAgWycoJywgJyknXVxuICAgIFsneycsICd9J11cbiAgICBbJzwnLCAnPiddXG4gIF1cbiAgcGFpckNoYXJzQWxsb3dGb3J3YXJkaW5nOiAnW10oKXt9J1xuICBpbnB1dDogbnVsbFxuICByZXF1aXJlSW5wdXQ6IHRydWVcbiAgc3VwcG9ydEVhcmx5U2VsZWN0OiB0cnVlICMgRXhwZXJpbWVudGFsXG5cbiAgZm9jdXNJbnB1dEZvclN1cnJvdW5kQ2hhcjogLT5cbiAgICBpbnB1dFVJID0gQG5ld0lucHV0VUkoKVxuICAgIGlucHV0VUkub25EaWRDb25maXJtKEBvbkNvbmZpcm1TdXJyb3VuZENoYXIuYmluZCh0aGlzKSlcbiAgICBpbnB1dFVJLm9uRGlkQ2FuY2VsKEBjYW5jZWxPcGVyYXRpb24uYmluZCh0aGlzKSlcbiAgICBpbnB1dFVJLmZvY3VzKDEsIHRydWUpXG5cbiAgZm9jdXNJbnB1dEZvclRhcmdldFBhaXJDaGFyOiAtPlxuICAgIGlucHV0VUkgPSBAbmV3SW5wdXRVSSgpXG4gICAgaW5wdXRVSS5vbkRpZENvbmZpcm0oQG9uQ29uZmlybVRhcmdldFBhaXJDaGFyLmJpbmQodGhpcykpXG4gICAgaW5wdXRVSS5vbkRpZENhbmNlbChAY2FuY2VsT3BlcmF0aW9uLmJpbmQodGhpcykpXG4gICAgaW5wdXRVSS5mb2N1cygpXG5cbiAgZ2V0UGFpcjogKGNoYXIpIC0+XG4gICAgaWYgcGFpciA9IF8uZGV0ZWN0KEBwYWlycywgKHBhaXIpIC0+IGNoYXIgaW4gcGFpcilcbiAgICAgIHBhaXJcbiAgICBlbHNlXG4gICAgICBbY2hhciwgY2hhcl1cblxuICBzdXJyb3VuZDogKHRleHQsIGNoYXIsIG9wdGlvbnM9e30pIC0+XG4gICAga2VlcExheW91dCA9IG9wdGlvbnMua2VlcExheW91dCA/IGZhbHNlXG4gICAgW29wZW4sIGNsb3NlXSA9IEBnZXRQYWlyKGNoYXIpXG4gICAgaWYgKG5vdCBrZWVwTGF5b3V0KSBhbmQgdGV4dC5lbmRzV2l0aChcIlxcblwiKVxuICAgICAgQGF1dG9JbmRlbnRBZnRlckluc2VydFRleHQgPSB0cnVlXG4gICAgICBvcGVuICs9IFwiXFxuXCJcbiAgICAgIGNsb3NlICs9IFwiXFxuXCJcblxuICAgIGlmIGNoYXIgaW4gQGdldENvbmZpZygnY2hhcmFjdGVyc1RvQWRkU3BhY2VPblN1cnJvdW5kJykgYW5kIGlzU2luZ2xlTGluZVRleHQodGV4dClcbiAgICAgIHRleHQgPSAnICcgKyB0ZXh0ICsgJyAnXG5cbiAgICBvcGVuICsgdGV4dCArIGNsb3NlXG5cbiAgZGVsZXRlU3Vycm91bmQ6ICh0ZXh0KSAtPlxuICAgIFtvcGVuLCBpbm5lclRleHQuLi4sIGNsb3NlXSA9IHRleHRcbiAgICBpbm5lclRleHQgPSBpbm5lclRleHQuam9pbignJylcbiAgICBpZiBpc1NpbmdsZUxpbmVUZXh0KHRleHQpIGFuZCAob3BlbiBpc250IGNsb3NlKVxuICAgICAgaW5uZXJUZXh0LnRyaW0oKVxuICAgIGVsc2VcbiAgICAgIGlubmVyVGV4dFxuXG4gIG9uQ29uZmlybVN1cnJvdW5kQ2hhcjogKEBpbnB1dCkgLT5cbiAgICBAcHJvY2Vzc09wZXJhdGlvbigpXG5cbiAgb25Db25maXJtVGFyZ2V0UGFpckNoYXI6IChjaGFyKSAtPlxuICAgIEBzZXRUYXJnZXQgQG5ldygnQVBhaXInLCBwYWlyOiBAZ2V0UGFpcihjaGFyKSlcblxuY2xhc3MgU3Vycm91bmQgZXh0ZW5kcyBTdXJyb3VuZEJhc2VcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTdXJyb3VuZCB0YXJnZXQgYnkgc3BlY2lmaWVkIGNoYXJhY3RlciBsaWtlIGAoYCwgYFtgLCBgXFxcImBcIlxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgQG9uRGlkU2VsZWN0VGFyZ2V0KEBmb2N1c0lucHV0Rm9yU3Vycm91bmRDaGFyLmJpbmQodGhpcykpXG4gICAgc3VwZXJcblxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBAc3Vycm91bmQodGV4dCwgQGlucHV0KVxuXG5jbGFzcyBTdXJyb3VuZFdvcmQgZXh0ZW5kcyBTdXJyb3VuZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlN1cnJvdW5kICoqd29yZCoqXCJcbiAgdGFyZ2V0OiAnSW5uZXJXb3JkJ1xuXG5jbGFzcyBTdXJyb3VuZFNtYXJ0V29yZCBleHRlbmRzIFN1cnJvdW5kXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiU3Vycm91bmQgKipzbWFydC13b3JkKipcIlxuICB0YXJnZXQ6ICdJbm5lclNtYXJ0V29yZCdcblxuY2xhc3MgTWFwU3Vycm91bmQgZXh0ZW5kcyBTdXJyb3VuZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlN1cnJvdW5kIGVhY2ggd29yZChgL1xcdysvYCkgd2l0aGluIHRhcmdldFwiXG4gIG9jY3VycmVuY2U6IHRydWVcbiAgcGF0dGVybkZvck9jY3VycmVuY2U6IC9cXHcrL2dcblxuIyBEZWxldGUgU3Vycm91bmRcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgRGVsZXRlU3Vycm91bmQgZXh0ZW5kcyBTdXJyb3VuZEJhc2VcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJEZWxldGUgc3BlY2lmaWVkIHN1cnJvdW5kIGNoYXJhY3RlciBsaWtlIGAoYCwgYFtgLCBgXFxcImBcIlxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgQGZvY3VzSW5wdXRGb3JUYXJnZXRQYWlyQ2hhcigpIHVubGVzcyBAdGFyZ2V0P1xuICAgIHN1cGVyXG5cbiAgb25Db25maXJtVGFyZ2V0UGFpckNoYXI6IChpbnB1dCkgLT5cbiAgICBzdXBlclxuICAgIEBpbnB1dCA9IGlucHV0XG4gICAgQHByb2Nlc3NPcGVyYXRpb24oKVxuXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIEBkZWxldGVTdXJyb3VuZCh0ZXh0KVxuXG5jbGFzcyBEZWxldGVTdXJyb3VuZEFueVBhaXIgZXh0ZW5kcyBEZWxldGVTdXJyb3VuZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIkRlbGV0ZSBzdXJyb3VuZCBjaGFyYWN0ZXIgYnkgYXV0by1kZXRlY3QgcGFpcmVkIGNoYXIgZnJvbSBjdXJzb3IgZW5jbG9zZWQgcGFpclwiXG4gIHRhcmdldDogJ0FBbnlQYWlyJ1xuICByZXF1aXJlSW5wdXQ6IGZhbHNlXG5cbmNsYXNzIERlbGV0ZVN1cnJvdW5kQW55UGFpckFsbG93Rm9yd2FyZGluZyBleHRlbmRzIERlbGV0ZVN1cnJvdW5kQW55UGFpclxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIkRlbGV0ZSBzdXJyb3VuZCBjaGFyYWN0ZXIgYnkgYXV0by1kZXRlY3QgcGFpcmVkIGNoYXIgZnJvbSBjdXJzb3IgZW5jbG9zZWQgcGFpciBhbmQgZm9yd2FyZGluZyBwYWlyIHdpdGhpbiBzYW1lIGxpbmVcIlxuICB0YXJnZXQ6ICdBQW55UGFpckFsbG93Rm9yd2FyZGluZydcblxuIyBDaGFuZ2UgU3Vycm91bmRcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgQ2hhbmdlU3Vycm91bmQgZXh0ZW5kcyBTdXJyb3VuZEJhc2VcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJDaGFuZ2Ugc3Vycm91bmQgY2hhcmFjdGVyLCBzcGVjaWZ5IGJvdGggZnJvbSBhbmQgdG8gcGFpciBjaGFyXCJcblxuICBzaG93RGVsZXRlQ2hhck9uSG92ZXI6IC0+XG4gICAgY2hhciA9IEBlZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KClbMF1cbiAgICBAdmltU3RhdGUuaG92ZXIuc2V0KGNoYXIsIEB2aW1TdGF0ZS5nZXRPcmlnaW5hbEN1cnNvclBvc2l0aW9uKCkpXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBpZiBAdGFyZ2V0P1xuICAgICAgQG9uRGlkRmFpbFNlbGVjdFRhcmdldChAYWJvcnQuYmluZCh0aGlzKSlcbiAgICBlbHNlXG4gICAgICBAb25EaWRGYWlsU2VsZWN0VGFyZ2V0KEBjYW5jZWxPcGVyYXRpb24uYmluZCh0aGlzKSlcbiAgICAgIEBmb2N1c0lucHV0Rm9yVGFyZ2V0UGFpckNoYXIoKVxuICAgIHN1cGVyXG5cbiAgICBAb25EaWRTZWxlY3RUYXJnZXQgPT5cbiAgICAgIEBzaG93RGVsZXRlQ2hhck9uSG92ZXIoKVxuICAgICAgQGZvY3VzSW5wdXRGb3JTdXJyb3VuZENoYXIoKVxuXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIGlubmVyVGV4dCA9IEBkZWxldGVTdXJyb3VuZCh0ZXh0KVxuICAgIEBzdXJyb3VuZChpbm5lclRleHQsIEBpbnB1dCwga2VlcExheW91dDogdHJ1ZSlcblxuY2xhc3MgQ2hhbmdlU3Vycm91bmRBbnlQYWlyIGV4dGVuZHMgQ2hhbmdlU3Vycm91bmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJDaGFuZ2Ugc3Vycm91bmQgY2hhcmFjdGVyLCBmcm9tIGNoYXIgaXMgYXV0by1kZXRlY3RlZFwiXG4gIHRhcmdldDogXCJBQW55UGFpclwiXG5cbmNsYXNzIENoYW5nZVN1cnJvdW5kQW55UGFpckFsbG93Rm9yd2FyZGluZyBleHRlbmRzIENoYW5nZVN1cnJvdW5kQW55UGFpclxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIkNoYW5nZSBzdXJyb3VuZCBjaGFyYWN0ZXIsIGZyb20gY2hhciBpcyBhdXRvLWRldGVjdGVkIGZyb20gZW5jbG9zZWQgYW5kIGZvcndhcmRpbmcgYXJlYVwiXG4gIHRhcmdldDogXCJBQW55UGFpckFsbG93Rm9yd2FyZGluZ1wiXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBGSVhNRVxuIyBDdXJyZW50bHkgbmF0aXZlIGVkaXRvci5qb2luTGluZXMoKSBpcyBiZXR0ZXIgZm9yIGN1cnNvciBwb3NpdGlvbiBzZXR0aW5nXG4jIFNvIEkgdXNlIG5hdGl2ZSBtZXRob2RzIGZvciBhIG1lYW53aGlsZS5cbmNsYXNzIEpvaW4gZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogXCJNb3ZlVG9SZWxhdGl2ZUxpbmVcIlxuICBmbGFzaFRhcmdldDogZmFsc2VcbiAgcmVzdG9yZVBvc2l0aW9uczogZmFsc2VcblxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgaWYgaXNMaW5ld2lzZVJhbmdlKHJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkpXG4gICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UocmFuZ2UudHJhbnNsYXRlKFswLCAwXSwgWy0xLCBJbmZpbml0eV0pKVxuICAgIHNlbGVjdGlvbi5qb2luTGluZXMoKVxuICAgIGVuZCA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLmVuZFxuICAgIHNlbGVjdGlvbi5jdXJzb3Iuc2V0QnVmZmVyUG9zaXRpb24oZW5kLnRyYW5zbGF0ZShbMCwgLTFdKSlcblxuY2xhc3MgSm9pbkJhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZChmYWxzZSlcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuICB0cmltOiBmYWxzZVxuICB0YXJnZXQ6IFwiTW92ZVRvUmVsYXRpdmVMaW5lTWluaW11bU9uZVwiXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBAZm9jdXNJbnB1dCgxMCkgaWYgQHJlcXVpcmVJbnB1dFxuICAgIHN1cGVyXG5cbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgaWYgQHRyaW1cbiAgICAgIHBhdHRlcm4gPSAvXFxyP1xcblsgXFx0XSovZ1xuICAgIGVsc2VcbiAgICAgIHBhdHRlcm4gPSAvXFxyP1xcbi9nXG4gICAgdGV4dC50cmltUmlnaHQoKS5yZXBsYWNlKHBhdHRlcm4sIEBpbnB1dCkgKyBcIlxcblwiXG5cbmNsYXNzIEpvaW5XaXRoS2VlcGluZ1NwYWNlIGV4dGVuZHMgSm9pbkJhc2VcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIGlucHV0OiAnJ1xuXG5jbGFzcyBKb2luQnlJbnB1dCBleHRlbmRzIEpvaW5CYXNlXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiVHJhbnNmb3JtIG11bHRpLWxpbmUgdG8gc2luZ2xlLWxpbmUgYnkgd2l0aCBzcGVjaWZpZWQgc2VwYXJhdG9yIGNoYXJhY3RlclwiXG4gIHJlcXVpcmVJbnB1dDogdHJ1ZVxuICB0cmltOiB0cnVlXG5cbmNsYXNzIEpvaW5CeUlucHV0V2l0aEtlZXBpbmdTcGFjZSBleHRlbmRzIEpvaW5CeUlucHV0XG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiSm9pbiBsaW5lcyB3aXRob3V0IHBhZGRpbmcgc3BhY2UgYmV0d2VlbiBlYWNoIGxpbmVcIlxuICB0cmltOiBmYWxzZVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgU3RyaW5nIHN1ZmZpeCBpbiBuYW1lIGlzIHRvIGF2b2lkIGNvbmZ1c2lvbiB3aXRoICdzcGxpdCcgd2luZG93LlxuY2xhc3MgU3BsaXRTdHJpbmcgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTcGxpdCBzaW5nbGUtbGluZSBpbnRvIG11bHRpLWxpbmUgYnkgc3BsaXR0aW5nIHNwZWNpZmllZCBzZXBhcmF0b3IgY2hhcnNcIlxuICByZXF1aXJlSW5wdXQ6IHRydWVcbiAgaW5wdXQ6IG51bGxcbiAgdGFyZ2V0OiBcIk1vdmVUb1JlbGF0aXZlTGluZVwiXG4gIGtlZXBTcGxpdHRlcjogZmFsc2VcblxuICBpbml0aWFsaXplOiAtPlxuICAgIEBvbkRpZFNldFRhcmdldCA9PlxuICAgICAgQGZvY3VzSW5wdXQoMTApXG4gICAgc3VwZXJcblxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBpbnB1dCA9IEBpbnB1dCBvciBcIlxcXFxuXCJcbiAgICByZWdleCA9IC8vLyN7Xy5lc2NhcGVSZWdFeHAoaW5wdXQpfS8vL2dcbiAgICBpZiBAa2VlcFNwbGl0dGVyXG4gICAgICBsaW5lU2VwYXJhdG9yID0gQGlucHV0ICsgXCJcXG5cIlxuICAgIGVsc2VcbiAgICAgIGxpbmVTZXBhcmF0b3IgPSBcIlxcblwiXG4gICAgdGV4dC5yZXBsYWNlKHJlZ2V4LCBsaW5lU2VwYXJhdG9yKVxuXG5jbGFzcyBTcGxpdFN0cmluZ1dpdGhLZWVwaW5nU3BsaXR0ZXIgZXh0ZW5kcyBTcGxpdFN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAga2VlcFNwbGl0dGVyOiB0cnVlXG5cbmNsYXNzIFNwbGl0QXJndW1lbnRzIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBrZWVwU2VwYXJhdG9yOiB0cnVlXG4gIGF1dG9JbmRlbnRBZnRlckluc2VydFRleHQ6IHRydWVcblxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBhbGxUb2tlbnMgPSBzcGxpdEFyZ3VtZW50cyh0ZXh0LnRyaW0oKSlcbiAgICBuZXdUZXh0ID0gJydcbiAgICB3aGlsZSBhbGxUb2tlbnMubGVuZ3RoXG4gICAgICB7dGV4dCwgdHlwZX0gPSBhbGxUb2tlbnMuc2hpZnQoKVxuICAgICAgaWYgdHlwZSBpcyAnc2VwYXJhdG9yJ1xuICAgICAgICBpZiBAa2VlcFNlcGFyYXRvclxuICAgICAgICAgIHRleHQgPSB0ZXh0LnRyaW0oKSArIFwiXFxuXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHRleHQgPSBcIlxcblwiXG4gICAgICBuZXdUZXh0ICs9IHRleHRcbiAgICBcIlxcblwiICsgbmV3VGV4dCArIFwiXFxuXCJcblxuY2xhc3MgU3BsaXRBcmd1bWVudHNXaXRoUmVtb3ZlU2VwYXJhdG9yIGV4dGVuZHMgU3BsaXRBcmd1bWVudHNcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIGtlZXBTZXBhcmF0b3I6IGZhbHNlXG5cbmNsYXNzIFNwbGl0QXJndW1lbnRzT2ZJbm5lckFueVBhaXIgZXh0ZW5kcyBTcGxpdEFyZ3VtZW50c1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgdGFyZ2V0OiBcIklubmVyQW55UGFpclwiXG5cbmNsYXNzIENoYW5nZU9yZGVyIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoZmFsc2UpXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIGlmIEB0YXJnZXQuaXNMaW5ld2lzZSgpXG4gICAgICBAZ2V0TmV3TGlzdChzcGxpdFRleHRCeU5ld0xpbmUodGV4dCkpLmpvaW4oXCJcXG5cIikgKyBcIlxcblwiXG4gICAgZWxzZVxuICAgICAgQHNvcnRBcmd1bWVudHNJblRleHRCeSh0ZXh0LCAoYXJncykgPT4gQGdldE5ld0xpc3QoYXJncykpXG5cbiAgc29ydEFyZ3VtZW50c0luVGV4dEJ5OiAodGV4dCwgZm4pIC0+XG4gICAgbGVhZGluZ1NwYWNlcyA9IHRyYWlsaW5nU3BhY2VzID0gJydcbiAgICBzdGFydCA9IHRleHQuc2VhcmNoKC9cXFMvKVxuICAgIGVuZCA9IHRleHQuc2VhcmNoKC9cXHMqJC8pXG4gICAgbGVhZGluZ1NwYWNlcyA9IHRyYWlsaW5nU3BhY2VzID0gJydcbiAgICBsZWFkaW5nU3BhY2VzID0gdGV4dFswLi4uc3RhcnRdIGlmIHN0YXJ0IGlzbnQgLTFcbiAgICB0cmFpbGluZ1NwYWNlcyA9IHRleHRbZW5kLi4uXSBpZiBlbmQgaXNudCAtMVxuICAgIHRleHQgPSB0ZXh0W3N0YXJ0Li4uZW5kXVxuXG4gICAgYWxsVG9rZW5zID0gc3BsaXRBcmd1bWVudHModGV4dClcbiAgICBhcmdzID0gYWxsVG9rZW5zXG4gICAgICAuZmlsdGVyICh0b2tlbikgLT4gdG9rZW4udHlwZSBpcyAnYXJndW1lbnQnXG4gICAgICAubWFwICh0b2tlbikgLT4gdG9rZW4udGV4dFxuICAgIG5ld0FyZ3MgPSBmbihhcmdzKVxuXG4gICAgbmV3VGV4dCA9ICcnXG4gICAgd2hpbGUgYWxsVG9rZW5zLmxlbmd0aFxuICAgICAge3RleHQsIHR5cGV9ID0gYWxsVG9rZW5zLnNoaWZ0KClcbiAgICAgIG5ld1RleHQgKz0gc3dpdGNoIHR5cGVcbiAgICAgICAgd2hlbiAnc2VwYXJhdG9yJyB0aGVuIHRleHRcbiAgICAgICAgd2hlbiAnYXJndW1lbnQnIHRoZW4gbmV3QXJncy5zaGlmdCgpXG4gICAgbGVhZGluZ1NwYWNlcyArIG5ld1RleHQgKyB0cmFpbGluZ1NwYWNlc1xuXG5jbGFzcyBSZXZlcnNlIGV4dGVuZHMgQ2hhbmdlT3JkZXJcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIGdldE5ld0xpc3Q6IChyb3dzKSAtPlxuICAgIHJvd3MucmV2ZXJzZSgpXG5cbmNsYXNzIFJldmVyc2VJbm5lckFueVBhaXIgZXh0ZW5kcyBSZXZlcnNlXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6IFwiSW5uZXJBbnlQYWlyXCJcblxuY2xhc3MgUm90YXRlIGV4dGVuZHMgQ2hhbmdlT3JkZXJcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIGdldE5ld0xpc3Q6IChyb3dzKSAtPlxuICAgIHJvd3MudW5zaGlmdChyb3dzLnBvcCgpKVxuICAgIHJvd3NcblxuY2xhc3MgUm90YXRlQmFja3dhcmRzIGV4dGVuZHMgQ2hhbmdlT3JkZXJcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIGdldE5ld0xpc3Q6IChyb3dzKSAtPlxuICAgIHJvd3MucHVzaChyb3dzLnNoaWZ0KCkpXG4gICAgcm93c1xuXG5jbGFzcyBTb3J0IGV4dGVuZHMgQ2hhbmdlT3JkZXJcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTb3J0IGFscGhhYmV0aWNhbGx5XCJcbiAgZ2V0TmV3TGlzdDogKHJvd3MpIC0+XG4gICAgcm93cy5zb3J0KClcblxuY2xhc3MgU29ydENhc2VJbnNlbnNpdGl2ZWx5IGV4dGVuZHMgQ2hhbmdlT3JkZXJcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTb3J0IGFscGhhYmV0aWNhbGx5IHdpdGggY2FzZSBpbnNlbnNpdGl2ZWx5XCJcbiAgZ2V0TmV3TGlzdDogKHJvd3MpIC0+XG4gICAgcm93cy5zb3J0IChyb3dBLCByb3dCKSAtPlxuICAgICAgcm93QS5sb2NhbGVDb21wYXJlKHJvd0IsIHNlbnNpdGl2aXR5OiAnYmFzZScpXG5cbmNsYXNzIFNvcnRCeU51bWJlciBleHRlbmRzIENoYW5nZU9yZGVyXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiU29ydCBudW1lcmljYWxseVwiXG4gIGdldE5ld0xpc3Q6IChyb3dzKSAtPlxuICAgIF8uc29ydEJ5IHJvd3MsIChyb3cpIC0+XG4gICAgICBOdW1iZXIucGFyc2VJbnQocm93KSBvciBJbmZpbml0eVxuIl19
