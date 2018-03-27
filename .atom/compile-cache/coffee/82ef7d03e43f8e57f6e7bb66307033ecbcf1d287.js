(function() {
  var AutoIndent, Base, BufferedProcess, CamelCase, ChangeOrder, ChangeSurround, ChangeSurroundAnyPair, ChangeSurroundAnyPairAllowForwarding, CompactSpaces, ConvertToHardTab, ConvertToSoftTab, DashCase, DecodeUriComponent, DeleteSurround, DeleteSurroundAnyPair, DeleteSurroundAnyPairAllowForwarding, EncodeUriComponent, Indent, Join, JoinBase, JoinByInput, JoinByInputWithKeepingSpace, JoinWithKeepingSpace, LowerCase, MapSurround, Operator, Outdent, PascalCase, Range, Reflow, ReflowWithStay, RemoveLeadingWhiteSpaces, Replace, ReplaceCharacter, ReplaceWithRegister, Reverse, ReverseInnerAnyPair, Rotate, RotateArgumentsBackwardsOfInnerPair, RotateArgumentsOfInnerPair, RotateBackwards, SnakeCase, Sort, SortByNumber, SortCaseInsensitively, SplitArguments, SplitArgumentsOfInnerAnyPair, SplitArgumentsWithRemoveSeparator, SplitByCharacter, SplitString, SplitStringWithKeepingSplitter, Surround, SurroundBase, SurroundSmartWord, SurroundWord, SwapWithRegister, TitleCase, ToggleCase, ToggleCaseAndMoveRight, ToggleLineComments, TransformSmartWordBySelectList, TransformString, TransformStringByExternalCommand, TransformStringBySelectList, TransformWordBySelectList, TrimString, UpperCase, _, adjustIndentWithKeepingLayout, getIndentLevelForBufferRow, isLinewiseRange, isSingleLineText, limitNumber, ref, ref1, splitArguments, splitTextByNewLine, toggleCaseForCharacter,
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

    ReplaceWithRegister.prototype.flashType = 'operator-long';

    ReplaceWithRegister.prototype.initialize = function() {
      return this.vimState.sequentialPasteManager.onInitialize(this);
    };

    ReplaceWithRegister.prototype.execute = function() {
      var i, len, range, ref2, results, selection;
      this.sequentialPaste = this.vimState.sequentialPasteManager.onExecute(this);
      ReplaceWithRegister.__super__.execute.apply(this, arguments);
      ref2 = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        selection = ref2[i];
        range = this.mutationManager.getMutatedBufferRangeForSelection(selection);
        results.push(this.vimState.sequentialPasteManager.savePastedRangeForSelection(selection, range));
      }
      return results;
    };

    ReplaceWithRegister.prototype.getNewText = function(text, selection) {
      var ref2, ref3;
      return (ref2 = (ref3 = this.vimState.register.get(null, selection, this.sequentialPaste)) != null ? ref3.text : void 0) != null ? ref2 : "";
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

    ToggleLineComments.prototype.flashTarget = false;

    ToggleLineComments.prototype.stayByMarker = true;

    ToggleLineComments.prototype.wise = 'linewise';

    ToggleLineComments.prototype.mutateSelection = function(selection) {
      return selection.toggleLineComments();
    };

    return ToggleLineComments;

  })(TransformString);

  Reflow = (function(superClass) {
    extend(Reflow, superClass);

    function Reflow() {
      return Reflow.__super__.constructor.apply(this, arguments);
    }

    Reflow.extend();

    Reflow.prototype.mutateSelection = function(selection) {
      return atom.commands.dispatch(this.editorElement, 'autoflow:reflow-selection');
    };

    return Reflow;

  })(TransformString);

  ReflowWithStay = (function(superClass) {
    extend(ReflowWithStay, superClass);

    function ReflowWithStay() {
      return ReflowWithStay.__super__.constructor.apply(this, arguments);
    }

    ReflowWithStay.extend();

    ReflowWithStay.prototype.stayAtSamePosition = true;

    return ReflowWithStay;

  })(Reflow);

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
      return this.focusInput({
        hideCursor: true
      });
    };

    SurroundBase.prototype.focusInputForTargetPairChar = function() {
      return this.focusInput({
        onConfirm: (function(_this) {
          return function(char) {
            return _this.onConfirmTargetPairChar(char);
          };
        })(this)
      });
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

    DeleteSurround.prototype.onConfirmTargetPairChar = function(char) {
      DeleteSurround.__super__.onConfirmTargetPairChar.apply(this, arguments);
      this.input = char;
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
      var char, hoverPoint;
      hoverPoint = this.mutationManager.getInitialPointForSelection(this.editor.getLastSelection());
      char = this.editor.getSelectedText()[0];
      return this.vimState.hover.set(char, hoverPoint);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3ItdHJhbnNmb3JtLXN0cmluZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG0xQ0FBQTtJQUFBOzs7Ozs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQTJCLE9BQUEsQ0FBUSxNQUFSLENBQTNCLEVBQUMscUNBQUQsRUFBa0I7O0VBRWxCLE9BU0ksT0FBQSxDQUFRLFNBQVIsQ0FUSixFQUNFLHdDQURGLEVBRUUsc0NBRkYsRUFHRSw4QkFIRixFQUlFLG9EQUpGLEVBS0UsNENBTEYsRUFNRSxvQ0FORixFQU9FLDREQVBGLEVBUUU7O0VBRUYsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztFQUNQLFFBQUEsR0FBVyxJQUFJLENBQUMsUUFBTCxDQUFjLFVBQWQ7O0VBSUw7Ozs7Ozs7SUFDSixlQUFDLENBQUEsTUFBRCxDQUFRLEtBQVI7OzhCQUNBLFdBQUEsR0FBYTs7OEJBQ2IsY0FBQSxHQUFnQjs7OEJBQ2hCLFVBQUEsR0FBWTs7OEJBQ1osaUJBQUEsR0FBbUI7OzhCQUNuQix5QkFBQSxHQUEyQjs7SUFDM0IsZUFBQyxDQUFBLGtCQUFELEdBQXFCOztJQUVyQixlQUFDLENBQUEsb0JBQUQsR0FBdUIsU0FBQTthQUNyQixJQUFDLENBQUEsa0JBQWtCLENBQUMsSUFBcEIsQ0FBeUIsSUFBekI7SUFEcUI7OzhCQUd2QixlQUFBLEdBQWlCLFNBQUMsU0FBRDtBQUNmLFVBQUE7TUFBQSxJQUFHLElBQUEsR0FBTyxJQUFDLENBQUEsVUFBRCxDQUFZLFNBQVMsQ0FBQyxPQUFWLENBQUEsQ0FBWixFQUFpQyxTQUFqQyxDQUFWO1FBQ0UsSUFBRyxJQUFDLENBQUEseUJBQUo7VUFDRSxRQUFBLEdBQVcsU0FBUyxDQUFDLGNBQVYsQ0FBQSxDQUEwQixDQUFDLEtB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O0VBT2I7Ozs7Ozs7SUFDSixxQkFBQyxDQUFBLE1BQUQsQ0FBQTs7SUFDQSxxQkFBQyxDQUFBLG9CQUFELENBQUE7O0lBQ0EscUJBQUMsQ0FBQSxXQUFELEdBQWM7O29DQUNkLFVBQUEsR0FBWSxTQUFDLElBQUQ7YUFDVixJQUFJLENBQUMsSUFBTCxDQUFVLFNBQUMsSUFBRCxFQUFPLElBQVA7ZUFDUixJQUFJLENBQUMsYUFBTCxDQUFtQixJQUFuQixFQUF5QjtVQUFBLFdBQUEsRUFBYSxNQUFiO1NBQXpCO01BRFEsQ0FBVjtJQURVOzs7O0tBSnNCOztFQVE5Qjs7Ozs7OztJQUNKLFlBQUMsQ0FBQSxNQUFELENBQUE7O0lBQ0EsWUFBQyxDQUFBLG9CQUFELENBQUE7O0lBQ0EsWUFBQyxDQUFBLFdBQUQsR0FBYzs7MkJBQ2QsVUFBQSxHQUFZLFNBQUMsSUFBRDthQUNWLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBVCxFQUFlLFNBQUMsR0FBRDtlQUNiLE1BQU0sQ0FBQyxRQUFQLENBQWdCLEdBQWhCLENBQUEsSUFBd0I7TUFEWCxDQUFmO0lBRFU7Ozs7S0FKYTtBQW53QjNCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntCdWZmZXJlZFByb2Nlc3MsIFJhbmdlfSA9IHJlcXVpcmUgJ2F0b20nXG5cbntcbiAgaXNTaW5nbGVMaW5lVGV4dFxuICBpc0xpbmV3aXNlUmFuZ2VcbiAgbGltaXROdW1iZXJcbiAgdG9nZ2xlQ2FzZUZvckNoYXJhY3RlclxuICBzcGxpdFRleHRCeU5ld0xpbmVcbiAgc3BsaXRBcmd1bWVudHNcbiAgZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3dcbiAgYWRqdXN0SW5kZW50V2l0aEtlZXBpbmdMYXlvdXRcbn0gPSByZXF1aXJlICcuL3V0aWxzJ1xuQmFzZSA9IHJlcXVpcmUgJy4vYmFzZSdcbk9wZXJhdG9yID0gQmFzZS5nZXRDbGFzcygnT3BlcmF0b3InKVxuXG4jIFRyYW5zZm9ybVN0cmluZ1xuIyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgVHJhbnNmb3JtU3RyaW5nIGV4dGVuZHMgT3BlcmF0b3JcbiAgQGV4dGVuZChmYWxzZSlcbiAgdHJhY2tDaGFuZ2U6IHRydWVcbiAgc3RheU9wdGlvbk5hbWU6ICdzdGF5T25UcmFuc2Zvcm1TdHJpbmcnXG4gIGF1dG9JbmRlbnQ6IGZhbHNlXG4gIGF1dG9JbmRlbnROZXdsaW5lOiBmYWxzZVxuICBhdXRvSW5kZW50QWZ0ZXJJbnNlcnRUZXh0OiBmYWxzZVxuICBAc3RyaW5nVHJhbnNmb3JtZXJzOiBbXVxuXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdDogLT5cbiAgICBAc3RyaW5nVHJhbnNmb3JtZXJzLnB1c2godGhpcylcblxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgaWYgdGV4dCA9IEBnZXROZXdUZXh0KHNlbGVjdGlvbi5nZXRUZXh0KCksIHNlbGVjdGlvbilcbiAgICAgIGlmIEBhdXRvSW5kZW50QWZ0ZXJJbnNlcnRUZXh0XG4gICAgICAgIHN0YXJ0Um93ID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuc3RhcnQucm93XG4gICAgICAgIHN0YXJ0Um93SW5kZW50TGV2ZWwgPSBnZXRJbmRlbnRMZXZlbEZvckJ1ZmZlclJvdyhAZWRpdG9yLCBzdGFydFJvdylcbiAgICAgIHJhbmdlID0gc2VsZWN0aW9uLmluc2VydFRleHQodGV4dCwge0BhdXRvSW5kZW50LCBAYXV0b0luZGVudE5ld2xpbmV9KVxuXG4gICAgICBpZiBAYXV0b0luZGVudEFmdGVySW5zZXJ0VGV4dFxuICAgICAgICAjIEN1cnJlbnRseSB1c2VkIGJ5IFNwbGl0QXJndW1lbnRzIGFuZCBTdXJyb3VuZCggbGluZXdpc2UgdGFyZ2V0IG9ubHkgKVxuICAgICAgICByYW5nZSA9IHJhbmdlLnRyYW5zbGF0ZShbMCwgMF0sIFstMSwgMF0pIGlmIEB0YXJnZXQuaXNMaW5ld2lzZSgpXG4gICAgICAgIEBlZGl0b3Iuc2V0SW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocmFuZ2Uuc3RhcnQucm93LCBzdGFydFJvd0luZGVudExldmVsKVxuICAgICAgICBAZWRpdG9yLnNldEluZGVudGF0aW9uRm9yQnVmZmVyUm93KHJhbmdlLmVuZC5yb3csIHN0YXJ0Um93SW5kZW50TGV2ZWwpXG4gICAgICAgICMgQWRqdXN0IGlubmVyIHJhbmdlLCBlbmQucm93IGlzIGFscmVhZHkoIGlmIG5lZWRlZCApIHRyYW5zbGF0ZWQgc28gbm8gbmVlZCB0byByZS10cmFuc2xhdGUuXG4gICAgICAgIGFkanVzdEluZGVudFdpdGhLZWVwaW5nTGF5b3V0KEBlZGl0b3IsIHJhbmdlLnRyYW5zbGF0ZShbMSwgMF0sIFswLCAwXSkpXG5cbmNsYXNzIFRvZ2dsZUNhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJgSGVsbG8gV29ybGRgIC0+IGBoRUxMTyB3T1JMRGBcIlxuICBkaXNwbGF5TmFtZTogJ1RvZ2dsZSB+J1xuXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIHRleHQucmVwbGFjZSgvLi9nLCB0b2dnbGVDYXNlRm9yQ2hhcmFjdGVyKVxuXG5jbGFzcyBUb2dnbGVDYXNlQW5kTW92ZVJpZ2h0IGV4dGVuZHMgVG9nZ2xlQ2FzZVxuICBAZXh0ZW5kKClcbiAgZmxhc2hUYXJnZXQ6IGZhbHNlXG4gIHJlc3RvcmVQb3NpdGlvbnM6IGZhbHNlXG4gIHRhcmdldDogJ01vdmVSaWdodCdcblxuY2xhc3MgVXBwZXJDYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiYEhlbGxvIFdvcmxkYCAtPiBgSEVMTE8gV09STERgXCJcbiAgZGlzcGxheU5hbWU6ICdVcHBlcidcbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgdGV4dC50b1VwcGVyQ2FzZSgpXG5cbmNsYXNzIExvd2VyQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcImBIZWxsbyBXb3JsZGAgLT4gYGhlbGxvIHdvcmxkYFwiXG4gIGRpc3BsYXlOYW1lOiAnTG93ZXInXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIHRleHQudG9Mb3dlckNhc2UoKVxuXG4jIFJlcGxhY2VcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgUmVwbGFjZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgZmxhc2hDaGVja3BvaW50OiAnZGlkLXNlbGVjdC1vY2N1cnJlbmNlJ1xuICBpbnB1dDogbnVsbFxuICByZXF1aXJlSW5wdXQ6IHRydWVcbiAgYXV0b0luZGVudE5ld2xpbmU6IHRydWVcbiAgc3VwcG9ydEVhcmx5U2VsZWN0OiB0cnVlXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBAb25EaWRTZWxlY3RUYXJnZXQgPT5cbiAgICAgIEBmb2N1c0lucHV0KGhpZGVDdXJzb3I6IHRydWUpXG4gICAgc3VwZXJcblxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBpZiBAdGFyZ2V0LmlzKCdNb3ZlUmlnaHRCdWZmZXJDb2x1bW4nKSBhbmQgdGV4dC5sZW5ndGggaXNudCBAZ2V0Q291bnQoKVxuICAgICAgcmV0dXJuXG5cbiAgICBpbnB1dCA9IEBpbnB1dCBvciBcIlxcblwiXG4gICAgaWYgaW5wdXQgaXMgXCJcXG5cIlxuICAgICAgQHJlc3RvcmVQb3NpdGlvbnMgPSBmYWxzZVxuICAgIHRleHQucmVwbGFjZSgvLi9nLCBpbnB1dClcblxuY2xhc3MgUmVwbGFjZUNoYXJhY3RlciBleHRlbmRzIFJlcGxhY2VcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogXCJNb3ZlUmlnaHRCdWZmZXJDb2x1bW5cIlxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgRFVQIG1lYW5pbmcgd2l0aCBTcGxpdFN0cmluZyBuZWVkIGNvbnNvbGlkYXRlLlxuY2xhc3MgU3BsaXRCeUNoYXJhY3RlciBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgdGV4dC5zcGxpdCgnJykuam9pbignICcpXG5cbmNsYXNzIENhbWVsQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgZGlzcGxheU5hbWU6ICdDYW1lbGl6ZSdcbiAgQGRlc2NyaXB0aW9uOiBcImBoZWxsby13b3JsZGAgLT4gYGhlbGxvV29ybGRgXCJcbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgXy5jYW1lbGl6ZSh0ZXh0KVxuXG5jbGFzcyBTbmFrZUNhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJgSGVsbG9Xb3JsZGAgLT4gYGhlbGxvX3dvcmxkYFwiXG4gIGRpc3BsYXlOYW1lOiAnVW5kZXJzY29yZSBfJ1xuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBfLnVuZGVyc2NvcmUodGV4dClcblxuY2xhc3MgUGFzY2FsQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcImBoZWxsb193b3JsZGAgLT4gYEhlbGxvV29ybGRgXCJcbiAgZGlzcGxheU5hbWU6ICdQYXNjYWxpemUnXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIF8uY2FwaXRhbGl6ZShfLmNhbWVsaXplKHRleHQpKVxuXG5jbGFzcyBEYXNoQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgZGlzcGxheU5hbWU6ICdEYXNoZXJpemUgLSdcbiAgQGRlc2NyaXB0aW9uOiBcIkhlbGxvV29ybGQgLT4gaGVsbG8td29ybGRcIlxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBfLmRhc2hlcml6ZSh0ZXh0KVxuXG5jbGFzcyBUaXRsZUNhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJgSGVsbG9Xb3JsZGAgLT4gYEhlbGxvIFdvcmxkYFwiXG4gIGRpc3BsYXlOYW1lOiAnVGl0bGl6ZSdcbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgXy5odW1hbml6ZUV2ZW50TmFtZShfLmRhc2hlcml6ZSh0ZXh0KSlcblxuY2xhc3MgRW5jb2RlVXJpQ29tcG9uZW50IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiYEhlbGxvIFdvcmxkYCAtPiBgSGVsbG8lMjBXb3JsZGBcIlxuICBkaXNwbGF5TmFtZTogJ0VuY29kZSBVUkkgQ29tcG9uZW50ICUnXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIGVuY29kZVVSSUNvbXBvbmVudCh0ZXh0KVxuXG5jbGFzcyBEZWNvZGVVcmlDb21wb25lbnQgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJgSGVsbG8lMjBXb3JsZGAgLT4gYEhlbGxvIFdvcmxkYFwiXG4gIGRpc3BsYXlOYW1lOiAnRGVjb2RlIFVSSSBDb21wb25lbnQgJSUnXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIGRlY29kZVVSSUNvbXBvbmVudCh0ZXh0KVxuXG5jbGFzcyBUcmltU3RyaW5nIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiYCBoZWxsbyBgIC0+IGBoZWxsb2BcIlxuICBkaXNwbGF5TmFtZTogJ1RyaW0gc3RyaW5nJ1xuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICB0ZXh0LnRyaW0oKVxuXG5jbGFzcyBDb21wYWN0U3BhY2VzIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiYCAgYSAgICBiICAgIGNgIC0+IGBhIGIgY2BcIlxuICBkaXNwbGF5TmFtZTogJ0NvbXBhY3Qgc3BhY2UnXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIGlmIHRleHQubWF0Y2goL15bIF0rJC8pXG4gICAgICAnICdcbiAgICBlbHNlXG4gICAgICAjIERvbid0IGNvbXBhY3QgZm9yIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlIHNwYWNlcy5cbiAgICAgIHRleHQucmVwbGFjZSAvXihcXHMqKSguKj8pKFxccyopJC9nbSwgKG0sIGxlYWRpbmcsIG1pZGRsZSwgdHJhaWxpbmcpIC0+XG4gICAgICAgIGxlYWRpbmcgKyBtaWRkbGUuc3BsaXQoL1sgXFx0XSsvKS5qb2luKCcgJykgKyB0cmFpbGluZ1xuXG5jbGFzcyBSZW1vdmVMZWFkaW5nV2hpdGVTcGFjZXMgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgQGRlc2NyaXB0aW9uOiBcImAgIGEgYiBjYCAtPiBgYSBiIGNgXCJcbiAgZ2V0TmV3VGV4dDogKHRleHQsIHNlbGVjdGlvbikgLT5cbiAgICB0cmltTGVmdCA9ICh0ZXh0KSAtPiB0ZXh0LnRyaW1MZWZ0KClcbiAgICBzcGxpdFRleHRCeU5ld0xpbmUodGV4dCkubWFwKHRyaW1MZWZ0KS5qb2luKFwiXFxuXCIpICsgXCJcXG5cIlxuXG5jbGFzcyBDb252ZXJ0VG9Tb2Z0VGFiIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBkaXNwbGF5TmFtZTogJ1NvZnQgVGFiJ1xuICB3aXNlOiAnbGluZXdpc2UnXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIEBzY2FuRm9yd2FyZCAvXFx0L2csIHtzY2FuUmFuZ2U6IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpfSwgKHtyYW5nZSwgcmVwbGFjZX0pID0+XG4gICAgICAjIFJlcGxhY2UgXFx0IHRvIHNwYWNlcyB3aGljaCBsZW5ndGggaXMgdmFyeSBkZXBlbmRpbmcgb24gdGFiU3RvcCBhbmQgdGFiTGVuZ2h0XG4gICAgICAjIFNvIHdlIGRpcmVjdGx5IGNvbnN1bHQgaXQncyBzY3JlZW4gcmVwcmVzZW50aW5nIGxlbmd0aC5cbiAgICAgIGxlbmd0aCA9IEBlZGl0b3Iuc2NyZWVuUmFuZ2VGb3JCdWZmZXJSYW5nZShyYW5nZSkuZ2V0RXh0ZW50KCkuY29sdW1uXG4gICAgICByZXBsYWNlKFwiIFwiLnJlcGVhdChsZW5ndGgpKVxuXG5jbGFzcyBDb252ZXJ0VG9IYXJkVGFiIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBkaXNwbGF5TmFtZTogJ0hhcmQgVGFiJ1xuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICB0YWJMZW5ndGggPSBAZWRpdG9yLmdldFRhYkxlbmd0aCgpXG4gICAgQHNjYW5Gb3J3YXJkIC9bIFxcdF0rL2csIHtzY2FuUmFuZ2U6IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpfSwgKHtyYW5nZSwgcmVwbGFjZX0pID0+XG4gICAgICB7c3RhcnQsIGVuZH0gPSBAZWRpdG9yLnNjcmVlblJhbmdlRm9yQnVmZmVyUmFuZ2UocmFuZ2UpXG4gICAgICBzdGFydENvbHVtbiA9IHN0YXJ0LmNvbHVtblxuICAgICAgZW5kQ29sdW1uID0gZW5kLmNvbHVtblxuXG4gICAgICAjIFdlIGNhbid0IG5haXZlbHkgcmVwbGFjZSBzcGFjZXMgdG8gdGFiLCB3ZSBoYXZlIHRvIGNvbnNpZGVyIHZhbGlkIHRhYlN0b3AgY29sdW1uXG4gICAgICAjIElmIG5leHRUYWJTdG9wIGNvbHVtbiBleGNlZWRzIHJlcGxhY2FibGUgcmFuZ2UsIHdlIHBhZCB3aXRoIHNwYWNlcy5cbiAgICAgIG5ld1RleHQgPSAnJ1xuICAgICAgbG9vcFxuICAgICAgICByZW1haW5kZXIgPSBzdGFydENvbHVtbiAlJSB0YWJMZW5ndGhcbiAgICAgICAgbmV4dFRhYlN0b3AgPSBzdGFydENvbHVtbiArIChpZiByZW1haW5kZXIgaXMgMCB0aGVuIHRhYkxlbmd0aCBlbHNlIHJlbWFpbmRlcilcbiAgICAgICAgaWYgbmV4dFRhYlN0b3AgPiBlbmRDb2x1bW5cbiAgICAgICAgICBuZXdUZXh0ICs9IFwiIFwiLnJlcGVhdChlbmRDb2x1bW4gLSBzdGFydENvbHVtbilcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG5ld1RleHQgKz0gXCJcXHRcIlxuICAgICAgICBzdGFydENvbHVtbiA9IG5leHRUYWJTdG9wXG4gICAgICAgIGJyZWFrIGlmIHN0YXJ0Q29sdW1uID49IGVuZENvbHVtblxuXG4gICAgICByZXBsYWNlKG5ld1RleHQpXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgVHJhbnNmb3JtU3RyaW5nQnlFeHRlcm5hbENvbW1hbmQgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZChmYWxzZSlcbiAgYXV0b0luZGVudDogdHJ1ZVxuICBjb21tYW5kOiAnJyAjIGUuZy4gY29tbWFuZDogJ3NvcnQnXG4gIGFyZ3M6IFtdICMgZS5nIGFyZ3M6IFsnLXJuJ11cbiAgc3Rkb3V0QnlTZWxlY3Rpb246IG51bGxcblxuICBleGVjdXRlOiAtPlxuICAgIEBub3JtYWxpemVTZWxlY3Rpb25zSWZOZWNlc3NhcnkoKVxuICAgIGlmIEBzZWxlY3RUYXJnZXQoKVxuICAgICAgbmV3IFByb21pc2UgKHJlc29sdmUpID0+XG4gICAgICAgIEBjb2xsZWN0KHJlc29sdmUpXG4gICAgICAudGhlbiA9PlxuICAgICAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICAgICAgdGV4dCA9IEBnZXROZXdUZXh0KHNlbGVjdGlvbi5nZXRUZXh0KCksIHNlbGVjdGlvbilcbiAgICAgICAgICBzZWxlY3Rpb24uaW5zZXJ0VGV4dCh0ZXh0LCB7QGF1dG9JbmRlbnR9KVxuICAgICAgICBAcmVzdG9yZUN1cnNvclBvc2l0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICAgICAgQGFjdGl2YXRlTW9kZShAZmluYWxNb2RlLCBAZmluYWxTdWJtb2RlKVxuXG4gIGNvbGxlY3Q6IChyZXNvbHZlKSAtPlxuICAgIEBzdGRvdXRCeVNlbGVjdGlvbiA9IG5ldyBNYXBcbiAgICBwcm9jZXNzUnVubmluZyA9IHByb2Nlc3NGaW5pc2hlZCA9IDBcbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICB7Y29tbWFuZCwgYXJnc30gPSBAZ2V0Q29tbWFuZChzZWxlY3Rpb24pID8ge31cbiAgICAgIHJldHVybiB1bmxlc3MgKGNvbW1hbmQ/IGFuZCBhcmdzPylcbiAgICAgIHByb2Nlc3NSdW5uaW5nKytcbiAgICAgIGRvIChzZWxlY3Rpb24pID0+XG4gICAgICAgIHN0ZGluID0gQGdldFN0ZGluKHNlbGVjdGlvbilcbiAgICAgICAgc3Rkb3V0ID0gKG91dHB1dCkgPT5cbiAgICAgICAgICBAc3Rkb3V0QnlTZWxlY3Rpb24uc2V0KHNlbGVjdGlvbiwgb3V0cHV0KVxuICAgICAgICBleGl0ID0gKGNvZGUpIC0+XG4gICAgICAgICAgcHJvY2Vzc0ZpbmlzaGVkKytcbiAgICAgICAgICByZXNvbHZlKCkgaWYgKHByb2Nlc3NSdW5uaW5nIGlzIHByb2Nlc3NGaW5pc2hlZClcbiAgICAgICAgQHJ1bkV4dGVybmFsQ29tbWFuZCB7Y29tbWFuZCwgYXJncywgc3Rkb3V0LCBleGl0LCBzdGRpbn1cblxuICBydW5FeHRlcm5hbENvbW1hbmQ6IChvcHRpb25zKSAtPlxuICAgIHN0ZGluID0gb3B0aW9ucy5zdGRpblxuICAgIGRlbGV0ZSBvcHRpb25zLnN0ZGluXG4gICAgYnVmZmVyZWRQcm9jZXNzID0gbmV3IEJ1ZmZlcmVkUHJvY2VzcyhvcHRpb25zKVxuICAgIGJ1ZmZlcmVkUHJvY2Vzcy5vbldpbGxUaHJvd0Vycm9yICh7ZXJyb3IsIGhhbmRsZX0pID0+XG4gICAgICAjIFN1cHByZXNzIGNvbW1hbmQgbm90IGZvdW5kIGVycm9yIGludGVudGlvbmFsbHkuXG4gICAgICBpZiBlcnJvci5jb2RlIGlzICdFTk9FTlQnIGFuZCBlcnJvci5zeXNjYWxsLmluZGV4T2YoJ3NwYXduJykgaXMgMFxuICAgICAgICBjb21tYW5kTmFtZSA9IEBjb25zdHJ1Y3Rvci5nZXRDb21tYW5kTmFtZSgpXG4gICAgICAgIGNvbnNvbGUubG9nIFwiI3tjb21tYW5kTmFtZX06IEZhaWxlZCB0byBzcGF3biBjb21tYW5kICN7ZXJyb3IucGF0aH0uXCJcbiAgICAgICAgaGFuZGxlKClcbiAgICAgIEBjYW5jZWxPcGVyYXRpb24oKVxuXG4gICAgaWYgc3RkaW5cbiAgICAgIGJ1ZmZlcmVkUHJvY2Vzcy5wcm9jZXNzLnN0ZGluLndyaXRlKHN0ZGluKVxuICAgICAgYnVmZmVyZWRQcm9jZXNzLnByb2Nlc3Muc3RkaW4uZW5kKClcblxuICBnZXROZXdUZXh0OiAodGV4dCwgc2VsZWN0aW9uKSAtPlxuICAgIEBnZXRTdGRvdXQoc2VsZWN0aW9uKSA/IHRleHRcblxuICAjIEZvciBlYXNpbHkgZXh0ZW5kIGJ5IHZtcCBwbHVnaW4uXG4gIGdldENvbW1hbmQ6IChzZWxlY3Rpb24pIC0+IHtAY29tbWFuZCwgQGFyZ3N9XG4gIGdldFN0ZGluOiAoc2VsZWN0aW9uKSAtPiBzZWxlY3Rpb24uZ2V0VGV4dCgpXG4gIGdldFN0ZG91dDogKHNlbGVjdGlvbikgLT4gQHN0ZG91dEJ5U2VsZWN0aW9uLmdldChzZWxlY3Rpb24pXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgVHJhbnNmb3JtU3RyaW5nQnlTZWxlY3RMaXN0IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiSW50ZXJhY3RpdmVseSBjaG9vc2Ugc3RyaW5nIHRyYW5zZm9ybWF0aW9uIG9wZXJhdG9yIGZyb20gc2VsZWN0LWxpc3RcIlxuICBAc2VsZWN0TGlzdEl0ZW1zOiBudWxsXG4gIHJlcXVpcmVJbnB1dDogdHJ1ZVxuXG4gIGdldEl0ZW1zOiAtPlxuICAgIEBjb25zdHJ1Y3Rvci5zZWxlY3RMaXN0SXRlbXMgPz0gQGNvbnN0cnVjdG9yLnN0cmluZ1RyYW5zZm9ybWVycy5tYXAgKGtsYXNzKSAtPlxuICAgICAgaWYga2xhc3M6Omhhc093blByb3BlcnR5KCdkaXNwbGF5TmFtZScpXG4gICAgICAgIGRpc3BsYXlOYW1lID0ga2xhc3M6OmRpc3BsYXlOYW1lXG4gICAgICBlbHNlXG4gICAgICAgIGRpc3BsYXlOYW1lID0gXy5odW1hbml6ZUV2ZW50TmFtZShfLmRhc2hlcml6ZShrbGFzcy5uYW1lKSlcbiAgICAgIHtuYW1lOiBrbGFzcywgZGlzcGxheU5hbWV9XG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuXG4gICAgQHZpbVN0YXRlLm9uRGlkQ29uZmlybVNlbGVjdExpc3QgKGl0ZW0pID0+XG4gICAgICB0cmFuc2Zvcm1lciA9IGl0ZW0ubmFtZVxuICAgICAgQHRhcmdldCA9IHRyYW5zZm9ybWVyOjp0YXJnZXQgaWYgdHJhbnNmb3JtZXI6OnRhcmdldD9cbiAgICAgIEB2aW1TdGF0ZS5yZXNldCgpXG4gICAgICBpZiBAdGFyZ2V0P1xuICAgICAgICBAdmltU3RhdGUub3BlcmF0aW9uU3RhY2sucnVuKHRyYW5zZm9ybWVyLCB7QHRhcmdldH0pXG4gICAgICBlbHNlXG4gICAgICAgIEB2aW1TdGF0ZS5vcGVyYXRpb25TdGFjay5ydW4odHJhbnNmb3JtZXIpXG5cbiAgICBAZm9jdXNTZWxlY3RMaXN0KGl0ZW1zOiBAZ2V0SXRlbXMoKSlcblxuICBleGVjdXRlOiAtPlxuICAgICMgTkVWRVIgYmUgZXhlY3V0ZWQgc2luY2Ugb3BlcmF0aW9uU3RhY2sgaXMgcmVwbGFjZWQgd2l0aCBzZWxlY3RlZCB0cmFuc2Zvcm1lclxuICAgIHRocm93IG5ldyBFcnJvcihcIiN7QG5hbWV9IHNob3VsZCBub3QgYmUgZXhlY3V0ZWRcIilcblxuY2xhc3MgVHJhbnNmb3JtV29yZEJ5U2VsZWN0TGlzdCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ0J5U2VsZWN0TGlzdFxuICBAZXh0ZW5kKClcbiAgdGFyZ2V0OiBcIklubmVyV29yZFwiXG5cbmNsYXNzIFRyYW5zZm9ybVNtYXJ0V29yZEJ5U2VsZWN0TGlzdCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ0J5U2VsZWN0TGlzdFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlRyYW5zZm9ybSBJbm5lclNtYXJ0V29yZCBieSBgdHJhbnNmb3JtLXN0cmluZy1ieS1zZWxlY3QtbGlzdGBcIlxuICB0YXJnZXQ6IFwiSW5uZXJTbWFydFdvcmRcIlxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFJlcGxhY2VXaXRoUmVnaXN0ZXIgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJSZXBsYWNlIHRhcmdldCB3aXRoIHNwZWNpZmllZCByZWdpc3RlciB2YWx1ZVwiXG4gIGZsYXNoVHlwZTogJ29wZXJhdG9yLWxvbmcnXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBAdmltU3RhdGUuc2VxdWVudGlhbFBhc3RlTWFuYWdlci5vbkluaXRpYWxpemUodGhpcylcblxuICBleGVjdXRlOiAtPlxuICAgIEBzZXF1ZW50aWFsUGFzdGUgPSBAdmltU3RhdGUuc2VxdWVudGlhbFBhc3RlTWFuYWdlci5vbkV4ZWN1dGUodGhpcylcblxuICAgIHN1cGVyXG5cbiAgICBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICByYW5nZSA9IEBtdXRhdGlvbk1hbmFnZXIuZ2V0TXV0YXRlZEJ1ZmZlclJhbmdlRm9yU2VsZWN0aW9uKHNlbGVjdGlvbilcbiAgICAgIEB2aW1TdGF0ZS5zZXF1ZW50aWFsUGFzdGVNYW5hZ2VyLnNhdmVQYXN0ZWRSYW5nZUZvclNlbGVjdGlvbihzZWxlY3Rpb24sIHJhbmdlKVxuXG4gIGdldE5ld1RleHQ6ICh0ZXh0LCBzZWxlY3Rpb24pIC0+XG4gICAgQHZpbVN0YXRlLnJlZ2lzdGVyLmdldChudWxsLCBzZWxlY3Rpb24sIEBzZXF1ZW50aWFsUGFzdGUpPy50ZXh0ID8gXCJcIlxuXG4jIFNhdmUgdGV4dCB0byByZWdpc3RlciBiZWZvcmUgcmVwbGFjZVxuY2xhc3MgU3dhcFdpdGhSZWdpc3RlciBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlN3YXAgcmVnaXN0ZXIgdmFsdWUgd2l0aCB0YXJnZXRcIlxuICBnZXROZXdUZXh0OiAodGV4dCwgc2VsZWN0aW9uKSAtPlxuICAgIG5ld1RleHQgPSBAdmltU3RhdGUucmVnaXN0ZXIuZ2V0VGV4dCgpXG4gICAgQHNldFRleHRUb1JlZ2lzdGVyKHRleHQsIHNlbGVjdGlvbilcbiAgICBuZXdUZXh0XG5cbiMgSW5kZW50IDwgVHJhbnNmb3JtU3RyaW5nXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIEluZGVudCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgc3RheUJ5TWFya2VyOiB0cnVlXG4gIHNldFRvRmlyc3RDaGFyYWN0ZXJPbkxpbmV3aXNlOiB0cnVlXG4gIHdpc2U6ICdsaW5ld2lzZSdcblxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgIyBOZWVkIGNvdW50IHRpbWVzIGluZGVudGF0aW9uIGluIHZpc3VhbC1tb2RlIGFuZCBpdHMgcmVwZWF0KGAuYCkuXG4gICAgaWYgQHRhcmdldC5pcygnQ3VycmVudFNlbGVjdGlvbicpXG4gICAgICBvbGRUZXh0ID0gbnVsbFxuICAgICAgICMgbGltaXQgdG8gMTAwIHRvIGF2b2lkIGZyZWV6aW5nIGJ5IGFjY2lkZW50YWwgYmlnIG51bWJlci5cbiAgICAgIGNvdW50ID0gbGltaXROdW1iZXIoQGdldENvdW50KCksIG1heDogMTAwKVxuICAgICAgQGNvdW50VGltZXMgY291bnQsICh7c3RvcH0pID0+XG4gICAgICAgIG9sZFRleHQgPSBzZWxlY3Rpb24uZ2V0VGV4dCgpXG4gICAgICAgIEBpbmRlbnQoc2VsZWN0aW9uKVxuICAgICAgICBzdG9wKCkgaWYgc2VsZWN0aW9uLmdldFRleHQoKSBpcyBvbGRUZXh0XG4gICAgZWxzZVxuICAgICAgQGluZGVudChzZWxlY3Rpb24pXG5cbiAgaW5kZW50OiAoc2VsZWN0aW9uKSAtPlxuICAgIHNlbGVjdGlvbi5pbmRlbnRTZWxlY3RlZFJvd3MoKVxuXG5jbGFzcyBPdXRkZW50IGV4dGVuZHMgSW5kZW50XG4gIEBleHRlbmQoKVxuICBpbmRlbnQ6IChzZWxlY3Rpb24pIC0+XG4gICAgc2VsZWN0aW9uLm91dGRlbnRTZWxlY3RlZFJvd3MoKVxuXG5jbGFzcyBBdXRvSW5kZW50IGV4dGVuZHMgSW5kZW50XG4gIEBleHRlbmQoKVxuICBpbmRlbnQ6IChzZWxlY3Rpb24pIC0+XG4gICAgc2VsZWN0aW9uLmF1dG9JbmRlbnRTZWxlY3RlZFJvd3MoKVxuXG5jbGFzcyBUb2dnbGVMaW5lQ29tbWVudHMgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIGZsYXNoVGFyZ2V0OiBmYWxzZVxuICBzdGF5QnlNYXJrZXI6IHRydWVcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBzZWxlY3Rpb24udG9nZ2xlTGluZUNvbW1lbnRzKClcblxuY2xhc3MgUmVmbG93IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChAZWRpdG9yRWxlbWVudCwgJ2F1dG9mbG93OnJlZmxvdy1zZWxlY3Rpb24nKVxuXG5jbGFzcyBSZWZsb3dXaXRoU3RheSBleHRlbmRzIFJlZmxvd1xuICBAZXh0ZW5kKClcbiAgc3RheUF0U2FtZVBvc2l0aW9uOiB0cnVlXG5cbiMgU3Vycm91bmQgPCBUcmFuc2Zvcm1TdHJpbmdcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgU3Vycm91bmRCYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoZmFsc2UpXG4gIHBhaXJzOiBbXG4gICAgWydbJywgJ10nXVxuICAgIFsnKCcsICcpJ11cbiAgICBbJ3snLCAnfSddXG4gICAgWyc8JywgJz4nXVxuICBdXG4gIHBhaXJzQnlBbGlhczoge1xuICAgIGI6IFsnKCcsICcpJ11cbiAgICBCOiBbJ3snLCAnfSddXG4gICAgcjogWydbJywgJ10nXVxuICAgIGE6IFsnPCcsICc+J11cbiAgfVxuXG4gIHBhaXJDaGFyc0FsbG93Rm9yd2FyZGluZzogJ1tdKCl7fSdcbiAgaW5wdXQ6IG51bGxcbiAgcmVxdWlyZUlucHV0OiB0cnVlXG4gIHN1cHBvcnRFYXJseVNlbGVjdDogdHJ1ZSAjIEV4cGVyaW1lbnRhbFxuXG4gIGZvY3VzSW5wdXRGb3JTdXJyb3VuZENoYXI6IC0+XG4gICAgQGZvY3VzSW5wdXQoaGlkZUN1cnNvcjogdHJ1ZSlcblxuICBmb2N1c0lucHV0Rm9yVGFyZ2V0UGFpckNoYXI6IC0+XG4gICAgQGZvY3VzSW5wdXQob25Db25maXJtOiAoY2hhcikgPT4gQG9uQ29uZmlybVRhcmdldFBhaXJDaGFyKGNoYXIpKVxuXG4gIGdldFBhaXI6IChjaGFyKSAtPlxuICAgIHBhaXIgPSBAcGFpcnNCeUFsaWFzW2NoYXJdXG4gICAgcGFpciA/PSBfLmRldGVjdChAcGFpcnMsIChwYWlyKSAtPiBjaGFyIGluIHBhaXIpXG4gICAgcGFpciA/PSBbY2hhciwgY2hhcl1cbiAgICBwYWlyXG5cbiAgc3Vycm91bmQ6ICh0ZXh0LCBjaGFyLCBvcHRpb25zPXt9KSAtPlxuICAgIGtlZXBMYXlvdXQgPSBvcHRpb25zLmtlZXBMYXlvdXQgPyBmYWxzZVxuICAgIFtvcGVuLCBjbG9zZV0gPSBAZ2V0UGFpcihjaGFyKVxuICAgIGlmIChub3Qga2VlcExheW91dCkgYW5kIHRleHQuZW5kc1dpdGgoXCJcXG5cIilcbiAgICAgIEBhdXRvSW5kZW50QWZ0ZXJJbnNlcnRUZXh0ID0gdHJ1ZVxuICAgICAgb3BlbiArPSBcIlxcblwiXG4gICAgICBjbG9zZSArPSBcIlxcblwiXG5cbiAgICBpZiBjaGFyIGluIEBnZXRDb25maWcoJ2NoYXJhY3RlcnNUb0FkZFNwYWNlT25TdXJyb3VuZCcpIGFuZCBpc1NpbmdsZUxpbmVUZXh0KHRleHQpXG4gICAgICB0ZXh0ID0gJyAnICsgdGV4dCArICcgJ1xuXG4gICAgb3BlbiArIHRleHQgKyBjbG9zZVxuXG4gIGRlbGV0ZVN1cnJvdW5kOiAodGV4dCkgLT5cbiAgICBbb3BlbiwgaW5uZXJUZXh0Li4uLCBjbG9zZV0gPSB0ZXh0XG4gICAgaW5uZXJUZXh0ID0gaW5uZXJUZXh0LmpvaW4oJycpXG4gICAgaWYgaXNTaW5nbGVMaW5lVGV4dCh0ZXh0KSBhbmQgKG9wZW4gaXNudCBjbG9zZSlcbiAgICAgIGlubmVyVGV4dC50cmltKClcbiAgICBlbHNlXG4gICAgICBpbm5lclRleHRcblxuICBvbkNvbmZpcm1UYXJnZXRQYWlyQ2hhcjogKGNoYXIpIC0+XG4gICAgQHNldFRhcmdldCBAbmV3KCdBUGFpcicsIHBhaXI6IEBnZXRQYWlyKGNoYXIpKVxuXG5jbGFzcyBTdXJyb3VuZCBleHRlbmRzIFN1cnJvdW5kQmFzZVxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlN1cnJvdW5kIHRhcmdldCBieSBzcGVjaWZpZWQgY2hhcmFjdGVyIGxpa2UgYChgLCBgW2AsIGBcXFwiYFwiXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBAb25EaWRTZWxlY3RUYXJnZXQoQGZvY3VzSW5wdXRGb3JTdXJyb3VuZENoYXIuYmluZCh0aGlzKSlcbiAgICBzdXBlclxuXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIEBzdXJyb3VuZCh0ZXh0LCBAaW5wdXQpXG5cbmNsYXNzIFN1cnJvdW5kV29yZCBleHRlbmRzIFN1cnJvdW5kXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiU3Vycm91bmQgKip3b3JkKipcIlxuICB0YXJnZXQ6ICdJbm5lcldvcmQnXG5cbmNsYXNzIFN1cnJvdW5kU21hcnRXb3JkIGV4dGVuZHMgU3Vycm91bmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTdXJyb3VuZCAqKnNtYXJ0LXdvcmQqKlwiXG4gIHRhcmdldDogJ0lubmVyU21hcnRXb3JkJ1xuXG5jbGFzcyBNYXBTdXJyb3VuZCBleHRlbmRzIFN1cnJvdW5kXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiU3Vycm91bmQgZWFjaCB3b3JkKGAvXFx3Ky9gKSB3aXRoaW4gdGFyZ2V0XCJcbiAgb2NjdXJyZW5jZTogdHJ1ZVxuICBwYXR0ZXJuRm9yT2NjdXJyZW5jZTogL1xcdysvZ1xuXG4jIERlbGV0ZSBTdXJyb3VuZFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBEZWxldGVTdXJyb3VuZCBleHRlbmRzIFN1cnJvdW5kQmFzZVxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIkRlbGV0ZSBzcGVjaWZpZWQgc3Vycm91bmQgY2hhcmFjdGVyIGxpa2UgYChgLCBgW2AsIGBcXFwiYFwiXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBAZm9jdXNJbnB1dEZvclRhcmdldFBhaXJDaGFyKCkgdW5sZXNzIEB0YXJnZXQ/XG4gICAgc3VwZXJcblxuICBvbkNvbmZpcm1UYXJnZXRQYWlyQ2hhcjogKGNoYXIpIC0+XG4gICAgc3VwZXJcbiAgICBAaW5wdXQgPSBjaGFyXG4gICAgQHByb2Nlc3NPcGVyYXRpb24oKVxuXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIEBkZWxldGVTdXJyb3VuZCh0ZXh0KVxuXG5jbGFzcyBEZWxldGVTdXJyb3VuZEFueVBhaXIgZXh0ZW5kcyBEZWxldGVTdXJyb3VuZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIkRlbGV0ZSBzdXJyb3VuZCBjaGFyYWN0ZXIgYnkgYXV0by1kZXRlY3QgcGFpcmVkIGNoYXIgZnJvbSBjdXJzb3IgZW5jbG9zZWQgcGFpclwiXG4gIHRhcmdldDogJ0FBbnlQYWlyJ1xuICByZXF1aXJlSW5wdXQ6IGZhbHNlXG5cbmNsYXNzIERlbGV0ZVN1cnJvdW5kQW55UGFpckFsbG93Rm9yd2FyZGluZyBleHRlbmRzIERlbGV0ZVN1cnJvdW5kQW55UGFpclxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIkRlbGV0ZSBzdXJyb3VuZCBjaGFyYWN0ZXIgYnkgYXV0by1kZXRlY3QgcGFpcmVkIGNoYXIgZnJvbSBjdXJzb3IgZW5jbG9zZWQgcGFpciBhbmQgZm9yd2FyZGluZyBwYWlyIHdpdGhpbiBzYW1lIGxpbmVcIlxuICB0YXJnZXQ6ICdBQW55UGFpckFsbG93Rm9yd2FyZGluZydcblxuIyBDaGFuZ2UgU3Vycm91bmRcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgQ2hhbmdlU3Vycm91bmQgZXh0ZW5kcyBTdXJyb3VuZEJhc2VcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJDaGFuZ2Ugc3Vycm91bmQgY2hhcmFjdGVyLCBzcGVjaWZ5IGJvdGggZnJvbSBhbmQgdG8gcGFpciBjaGFyXCJcblxuICBzaG93RGVsZXRlQ2hhck9uSG92ZXI6IC0+XG4gICAgaG92ZXJQb2ludCA9IEBtdXRhdGlvbk1hbmFnZXIuZ2V0SW5pdGlhbFBvaW50Rm9yU2VsZWN0aW9uKEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpKVxuICAgIGNoYXIgPSBAZWRpdG9yLmdldFNlbGVjdGVkVGV4dCgpWzBdXG4gICAgQHZpbVN0YXRlLmhvdmVyLnNldChjaGFyLCBob3ZlclBvaW50KVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgaWYgQHRhcmdldD9cbiAgICAgIEBvbkRpZEZhaWxTZWxlY3RUYXJnZXQoQGFib3J0LmJpbmQodGhpcykpXG4gICAgZWxzZVxuICAgICAgQG9uRGlkRmFpbFNlbGVjdFRhcmdldChAY2FuY2VsT3BlcmF0aW9uLmJpbmQodGhpcykpXG4gICAgICBAZm9jdXNJbnB1dEZvclRhcmdldFBhaXJDaGFyKClcbiAgICBzdXBlclxuXG4gICAgQG9uRGlkU2VsZWN0VGFyZ2V0ID0+XG4gICAgICBAc2hvd0RlbGV0ZUNoYXJPbkhvdmVyKClcbiAgICAgIEBmb2N1c0lucHV0Rm9yU3Vycm91bmRDaGFyKClcblxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBpbm5lclRleHQgPSBAZGVsZXRlU3Vycm91bmQodGV4dClcbiAgICBAc3Vycm91bmQoaW5uZXJUZXh0LCBAaW5wdXQsIGtlZXBMYXlvdXQ6IHRydWUpXG5cbmNsYXNzIENoYW5nZVN1cnJvdW5kQW55UGFpciBleHRlbmRzIENoYW5nZVN1cnJvdW5kXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiQ2hhbmdlIHN1cnJvdW5kIGNoYXJhY3RlciwgZnJvbSBjaGFyIGlzIGF1dG8tZGV0ZWN0ZWRcIlxuICB0YXJnZXQ6IFwiQUFueVBhaXJcIlxuXG5jbGFzcyBDaGFuZ2VTdXJyb3VuZEFueVBhaXJBbGxvd0ZvcndhcmRpbmcgZXh0ZW5kcyBDaGFuZ2VTdXJyb3VuZEFueVBhaXJcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJDaGFuZ2Ugc3Vycm91bmQgY2hhcmFjdGVyLCBmcm9tIGNoYXIgaXMgYXV0by1kZXRlY3RlZCBmcm9tIGVuY2xvc2VkIGFuZCBmb3J3YXJkaW5nIGFyZWFcIlxuICB0YXJnZXQ6IFwiQUFueVBhaXJBbGxvd0ZvcndhcmRpbmdcIlxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgRklYTUVcbiMgQ3VycmVudGx5IG5hdGl2ZSBlZGl0b3Iuam9pbkxpbmVzKCkgaXMgYmV0dGVyIGZvciBjdXJzb3IgcG9zaXRpb24gc2V0dGluZ1xuIyBTbyBJIHVzZSBuYXRpdmUgbWV0aG9kcyBmb3IgYSBtZWFud2hpbGUuXG5jbGFzcyBKb2luIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6IFwiTW92ZVRvUmVsYXRpdmVMaW5lXCJcbiAgZmxhc2hUYXJnZXQ6IGZhbHNlXG4gIHJlc3RvcmVQb3NpdGlvbnM6IGZhbHNlXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIHJhbmdlID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcblxuICAgICMgV2hlbiBjdXJzb3IgaXMgYXQgbGFzdCBCVUZGRVIgcm93LCBpdCBzZWxlY3QgbGFzdC1idWZmZXItcm93LCB0aGVuXG4gICAgIyBqb2lubmluZyByZXN1bHQgaW4gXCJjbGVhciBsYXN0LWJ1ZmZlci1yb3cgdGV4dFwiLlxuICAgICMgSSBiZWxpZXZlIHRoaXMgaXMgQlVHIG9mIHVwc3RyZWFtIGF0b20tY29yZS4gZ3VhcmQgdGhpcyBzaXR1YXRpb24gaGVyZVxuICAgIHVubGVzcyAocmFuZ2UuaXNTaW5nbGVMaW5lKCkgYW5kIHJhbmdlLmVuZC5yb3cgaXMgQGVkaXRvci5nZXRMYXN0QnVmZmVyUm93KCkpXG4gICAgICBpZiBpc0xpbmV3aXNlUmFuZ2UocmFuZ2UpXG4gICAgICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShyYW5nZS50cmFuc2xhdGUoWzAsIDBdLCBbLTEsIEluZmluaXR5XSkpXG4gICAgICBzZWxlY3Rpb24uam9pbkxpbmVzKClcbiAgICBlbmQgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKS5lbmRcbiAgICBzZWxlY3Rpb24uY3Vyc29yLnNldEJ1ZmZlclBvc2l0aW9uKGVuZC50cmFuc2xhdGUoWzAsIC0xXSkpXG5cbmNsYXNzIEpvaW5CYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoZmFsc2UpXG4gIHdpc2U6ICdsaW5ld2lzZSdcbiAgdHJpbTogZmFsc2VcbiAgdGFyZ2V0OiBcIk1vdmVUb1JlbGF0aXZlTGluZU1pbmltdW1PbmVcIlxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgQGZvY3VzSW5wdXQoY2hhcnNNYXg6IDEwKSBpZiBAcmVxdWlyZUlucHV0XG4gICAgc3VwZXJcblxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBpZiBAdHJpbVxuICAgICAgcGF0dGVybiA9IC9cXHI/XFxuWyBcXHRdKi9nXG4gICAgZWxzZVxuICAgICAgcGF0dGVybiA9IC9cXHI/XFxuL2dcbiAgICB0ZXh0LnRyaW1SaWdodCgpLnJlcGxhY2UocGF0dGVybiwgQGlucHV0KSArIFwiXFxuXCJcblxuY2xhc3MgSm9pbldpdGhLZWVwaW5nU3BhY2UgZXh0ZW5kcyBKb2luQmFzZVxuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgaW5wdXQ6ICcnXG5cbmNsYXNzIEpvaW5CeUlucHV0IGV4dGVuZHMgSm9pbkJhc2VcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJUcmFuc2Zvcm0gbXVsdGktbGluZSB0byBzaW5nbGUtbGluZSBieSB3aXRoIHNwZWNpZmllZCBzZXBhcmF0b3IgY2hhcmFjdGVyXCJcbiAgcmVxdWlyZUlucHV0OiB0cnVlXG4gIHRyaW06IHRydWVcblxuY2xhc3MgSm9pbkJ5SW5wdXRXaXRoS2VlcGluZ1NwYWNlIGV4dGVuZHMgSm9pbkJ5SW5wdXRcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJKb2luIGxpbmVzIHdpdGhvdXQgcGFkZGluZyBzcGFjZSBiZXR3ZWVuIGVhY2ggbGluZVwiXG4gIHRyaW06IGZhbHNlXG5cbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBTdHJpbmcgc3VmZml4IGluIG5hbWUgaXMgdG8gYXZvaWQgY29uZnVzaW9uIHdpdGggJ3NwbGl0JyB3aW5kb3cuXG5jbGFzcyBTcGxpdFN0cmluZyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcIlNwbGl0IHNpbmdsZS1saW5lIGludG8gbXVsdGktbGluZSBieSBzcGxpdHRpbmcgc3BlY2lmaWVkIHNlcGFyYXRvciBjaGFyc1wiXG4gIHJlcXVpcmVJbnB1dDogdHJ1ZVxuICBpbnB1dDogbnVsbFxuICB0YXJnZXQ6IFwiTW92ZVRvUmVsYXRpdmVMaW5lXCJcbiAga2VlcFNwbGl0dGVyOiBmYWxzZVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgQG9uRGlkU2V0VGFyZ2V0ID0+XG4gICAgICBAZm9jdXNJbnB1dChjaGFyc01heDogMTApXG4gICAgc3VwZXJcblxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBpbnB1dCA9IEBpbnB1dCBvciBcIlxcXFxuXCJcbiAgICByZWdleCA9IC8vLyN7Xy5lc2NhcGVSZWdFeHAoaW5wdXQpfS8vL2dcbiAgICBpZiBAa2VlcFNwbGl0dGVyXG4gICAgICBsaW5lU2VwYXJhdG9yID0gQGlucHV0ICsgXCJcXG5cIlxuICAgIGVsc2VcbiAgICAgIGxpbmVTZXBhcmF0b3IgPSBcIlxcblwiXG4gICAgdGV4dC5yZXBsYWNlKHJlZ2V4LCBsaW5lU2VwYXJhdG9yKVxuXG5jbGFzcyBTcGxpdFN0cmluZ1dpdGhLZWVwaW5nU3BsaXR0ZXIgZXh0ZW5kcyBTcGxpdFN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAga2VlcFNwbGl0dGVyOiB0cnVlXG5cbmNsYXNzIFNwbGl0QXJndW1lbnRzIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBrZWVwU2VwYXJhdG9yOiB0cnVlXG4gIGF1dG9JbmRlbnRBZnRlckluc2VydFRleHQ6IHRydWVcblxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBhbGxUb2tlbnMgPSBzcGxpdEFyZ3VtZW50cyh0ZXh0LnRyaW0oKSlcbiAgICBuZXdUZXh0ID0gJydcbiAgICB3aGlsZSBhbGxUb2tlbnMubGVuZ3RoXG4gICAgICB7dGV4dCwgdHlwZX0gPSBhbGxUb2tlbnMuc2hpZnQoKVxuICAgICAgaWYgdHlwZSBpcyAnc2VwYXJhdG9yJ1xuICAgICAgICBpZiBAa2VlcFNlcGFyYXRvclxuICAgICAgICAgIHRleHQgPSB0ZXh0LnRyaW0oKSArIFwiXFxuXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHRleHQgPSBcIlxcblwiXG4gICAgICBuZXdUZXh0ICs9IHRleHRcbiAgICBcIlxcblwiICsgbmV3VGV4dCArIFwiXFxuXCJcblxuY2xhc3MgU3BsaXRBcmd1bWVudHNXaXRoUmVtb3ZlU2VwYXJhdG9yIGV4dGVuZHMgU3BsaXRBcmd1bWVudHNcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIGtlZXBTZXBhcmF0b3I6IGZhbHNlXG5cbmNsYXNzIFNwbGl0QXJndW1lbnRzT2ZJbm5lckFueVBhaXIgZXh0ZW5kcyBTcGxpdEFyZ3VtZW50c1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgdGFyZ2V0OiBcIklubmVyQW55UGFpclwiXG5cbmNsYXNzIENoYW5nZU9yZGVyIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoZmFsc2UpXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIGlmIEB0YXJnZXQuaXNMaW5ld2lzZSgpXG4gICAgICBAZ2V0TmV3TGlzdChzcGxpdFRleHRCeU5ld0xpbmUodGV4dCkpLmpvaW4oXCJcXG5cIikgKyBcIlxcblwiXG4gICAgZWxzZVxuICAgICAgQHNvcnRBcmd1bWVudHNJblRleHRCeSh0ZXh0LCAoYXJncykgPT4gQGdldE5ld0xpc3QoYXJncykpXG5cbiAgc29ydEFyZ3VtZW50c0luVGV4dEJ5OiAodGV4dCwgZm4pIC0+XG4gICAgbGVhZGluZ1NwYWNlcyA9IHRyYWlsaW5nU3BhY2VzID0gJydcbiAgICBzdGFydCA9IHRleHQuc2VhcmNoKC9cXFMvKVxuICAgIGVuZCA9IHRleHQuc2VhcmNoKC9cXHMqJC8pXG4gICAgbGVhZGluZ1NwYWNlcyA9IHRyYWlsaW5nU3BhY2VzID0gJydcbiAgICBsZWFkaW5nU3BhY2VzID0gdGV4dFswLi4uc3RhcnRdIGlmIHN0YXJ0IGlzbnQgLTFcbiAgICB0cmFpbGluZ1NwYWNlcyA9IHRleHRbZW5kLi4uXSBpZiBlbmQgaXNudCAtMVxuICAgIHRleHQgPSB0ZXh0W3N0YXJ0Li4uZW5kXVxuXG4gICAgYWxsVG9rZW5zID0gc3BsaXRBcmd1bWVudHModGV4dClcbiAgICBhcmdzID0gYWxsVG9rZW5zXG4gICAgICAuZmlsdGVyICh0b2tlbikgLT4gdG9rZW4udHlwZSBpcyAnYXJndW1lbnQnXG4gICAgICAubWFwICh0b2tlbikgLT4gdG9rZW4udGV4dFxuICAgIG5ld0FyZ3MgPSBmbihhcmdzKVxuXG4gICAgbmV3VGV4dCA9ICcnXG4gICAgd2hpbGUgYWxsVG9rZW5zLmxlbmd0aFxuICAgICAge3RleHQsIHR5cGV9ID0gYWxsVG9rZW5zLnNoaWZ0KClcbiAgICAgIG5ld1RleHQgKz0gc3dpdGNoIHR5cGVcbiAgICAgICAgd2hlbiAnc2VwYXJhdG9yJyB0aGVuIHRleHRcbiAgICAgICAgd2hlbiAnYXJndW1lbnQnIHRoZW4gbmV3QXJncy5zaGlmdCgpXG4gICAgbGVhZGluZ1NwYWNlcyArIG5ld1RleHQgKyB0cmFpbGluZ1NwYWNlc1xuXG5jbGFzcyBSZXZlcnNlIGV4dGVuZHMgQ2hhbmdlT3JkZXJcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIGdldE5ld0xpc3Q6IChyb3dzKSAtPlxuICAgIHJvd3MucmV2ZXJzZSgpXG5cbmNsYXNzIFJldmVyc2VJbm5lckFueVBhaXIgZXh0ZW5kcyBSZXZlcnNlXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6IFwiSW5uZXJBbnlQYWlyXCJcblxuY2xhc3MgUm90YXRlIGV4dGVuZHMgQ2hhbmdlT3JkZXJcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIGJhY2t3YXJkczogZmFsc2VcbiAgZ2V0TmV3TGlzdDogKHJvd3MpIC0+XG4gICAgaWYgQGJhY2t3YXJkc1xuICAgICAgcm93cy5wdXNoKHJvd3Muc2hpZnQoKSlcbiAgICBlbHNlXG4gICAgICByb3dzLnVuc2hpZnQocm93cy5wb3AoKSlcbiAgICByb3dzXG5cbmNsYXNzIFJvdGF0ZUJhY2t3YXJkcyBleHRlbmRzIENoYW5nZU9yZGVyXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBiYWNrd2FyZHM6IHRydWVcblxuY2xhc3MgUm90YXRlQXJndW1lbnRzT2ZJbm5lclBhaXIgZXh0ZW5kcyBSb3RhdGVcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogXCJJbm5lckFueVBhaXJcIlxuXG5jbGFzcyBSb3RhdGVBcmd1bWVudHNCYWNrd2FyZHNPZklubmVyUGFpciBleHRlbmRzIFJvdGF0ZUFyZ3VtZW50c09mSW5uZXJQYWlyXG4gIEBleHRlbmQoKVxuICBiYWNrd2FyZHM6IHRydWVcblxuY2xhc3MgU29ydCBleHRlbmRzIENoYW5nZU9yZGVyXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiU29ydCBhbHBoYWJldGljYWxseVwiXG4gIGdldE5ld0xpc3Q6IChyb3dzKSAtPlxuICAgIHJvd3Muc29ydCgpXG5cbmNsYXNzIFNvcnRDYXNlSW5zZW5zaXRpdmVseSBleHRlbmRzIENoYW5nZU9yZGVyXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiU29ydCBhbHBoYWJldGljYWxseSB3aXRoIGNhc2UgaW5zZW5zaXRpdmVseVwiXG4gIGdldE5ld0xpc3Q6IChyb3dzKSAtPlxuICAgIHJvd3Muc29ydCAocm93QSwgcm93QikgLT5cbiAgICAgIHJvd0EubG9jYWxlQ29tcGFyZShyb3dCLCBzZW5zaXRpdml0eTogJ2Jhc2UnKVxuXG5jbGFzcyBTb3J0QnlOdW1iZXIgZXh0ZW5kcyBDaGFuZ2VPcmRlclxuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcIlNvcnQgbnVtZXJpY2FsbHlcIlxuICBnZXROZXdMaXN0OiAocm93cykgLT5cbiAgICBfLnNvcnRCeSByb3dzLCAocm93KSAtPlxuICAgICAgTnVtYmVyLnBhcnNlSW50KHJvdykgb3IgSW5maW5pdHlcbiJdfQ==
