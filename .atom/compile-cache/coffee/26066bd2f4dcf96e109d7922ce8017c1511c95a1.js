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
            return _this.activateMode("normal");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvdmltLW1vZGUtcGx1cy9saWIvb3BlcmF0b3ItdHJhbnNmb3JtLXN0cmluZy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLG0xQ0FBQTtJQUFBOzs7Ozs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQTJCLE9BQUEsQ0FBUSxNQUFSLENBQTNCLEVBQUMscUNBQUQsRUFBa0I7O0VBRWxCLE9BU0ksT0FBQSxDQUFRLFNBQVIsQ0FUSixFQUNFLHdDQURGLEVBRUUsc0NBRkYsRUFHRSw4QkFIRixFQUlFLG9EQUpGLEVBS0UsNENBTEYsRUFNRSxvQ0FORixFQU9FLDREQVBGLEVBUUU7O0VBRUYsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztFQUNQLFFBQUEsR0FBVyxJQUFJLENBQUMsUUFBTCxDQUFjLFVBQWQ7O0VBSUw7Ozs7Ozs7SUFDSixlQUFDLENBQUEsTUFBRCxDQUFRLEtBQVI7OzhCQUNBLFdBQUEsR0FBYTs7OEJBQ2IsY0FBQSxHQUFnQjs7OEJBQ2hCLFVBQUEsR0FBWTs7OEJBQ1osaUJBQUEsR0FBbUI7OzhCQUNuQix5QkFBQSxHQUEyQjs7SUFDM0IsZUFBQyxDQUFBLGtCQUFELEdBQXFCOztJQUVyQixlQUFDLENBQUEsb0JBQUQsR0FBdUIsU0FBQTthQUNyQixJQUFDLENBQUEsa0JBQWtCLENBQUMsSUFBcEIsQ0FBeUIsSUFBekI7SUFEcUI7OzhCQUd2QixlQUFBLEdBQWlCLFNBQUMsU0FBRDtBQUNmLFVBQUE7TUFBQSxJQUFHLElBQUEsR0FBTyxJQUFDLENBQUEsVUFBRCxDQUFZLFNBQVMsQ0FBQyxPQUFWLENBQUEsQ0FBWixFQUFpQyxTQUFqQyxDQUFWO1FBQ0UsSUFBRyxJQUFDLENBQUEseUJBQUo7VUFDRSxRQUFBLEdBQVcsU0FBUyxDQUFDLGNBQVYsQ0FBQSxDQUEw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Q0FBQSxNQUFELENBQUE7O0lBQ0EscUJBQUMsQ0FBQSxvQkFBRCxDQUFBOztJQUNBLHFCQUFDLENBQUEsV0FBRCxHQUFjOztvQ0FDZCxVQUFBLEdBQVksU0FBQyxJQUFEO2FBQ1YsSUFBSSxDQUFDLElBQUwsQ0FBVSxTQUFDLElBQUQsRUFBTyxJQUFQO2VBQ1IsSUFBSSxDQUFDLGFBQUwsQ0FBbUIsSUFBbkIsRUFBeUI7VUFBQSxXQUFBLEVBQWEsTUFBYjtTQUF6QjtNQURRLENBQVY7SUFEVTs7OztLQUpzQjs7RUFROUI7Ozs7Ozs7SUFDSixZQUFDLENBQUEsTUFBRCxDQUFBOztJQUNBLFlBQUMsQ0FBQSxvQkFBRCxDQUFBOztJQUNBLFlBQUMsQ0FBQSxXQUFELEdBQWM7OzJCQUNkLFVBQUEsR0FBWSxTQUFDLElBQUQ7YUFDVixDQUFDLENBQUMsTUFBRixDQUFTLElBQVQsRUFBZSxTQUFDLEdBQUQ7ZUFDYixNQUFNLENBQUMsUUFBUCxDQUFnQixHQUFoQixDQUFBLElBQXdCO01BRFgsQ0FBZjtJQURVOzs7O0tBSmE7QUFud0IzQiIsInNvdXJjZXNDb250ZW50IjpbIl8gPSByZXF1aXJlICd1bmRlcnNjb3JlLXBsdXMnXG57QnVmZmVyZWRQcm9jZXNzLCBSYW5nZX0gPSByZXF1aXJlICdhdG9tJ1xuXG57XG4gIGlzU2luZ2xlTGluZVRleHRcbiAgaXNMaW5ld2lzZVJhbmdlXG4gIGxpbWl0TnVtYmVyXG4gIHRvZ2dsZUNhc2VGb3JDaGFyYWN0ZXJcbiAgc3BsaXRUZXh0QnlOZXdMaW5lXG4gIHNwbGl0QXJndW1lbnRzXG4gIGdldEluZGVudExldmVsRm9yQnVmZmVyUm93XG4gIGFkanVzdEluZGVudFdpdGhLZWVwaW5nTGF5b3V0XG59ID0gcmVxdWlyZSAnLi91dGlscydcbkJhc2UgPSByZXF1aXJlICcuL2Jhc2UnXG5PcGVyYXRvciA9IEJhc2UuZ2V0Q2xhc3MoJ09wZXJhdG9yJylcblxuIyBUcmFuc2Zvcm1TdHJpbmdcbiMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIFRyYW5zZm9ybVN0cmluZyBleHRlbmRzIE9wZXJhdG9yXG4gIEBleHRlbmQoZmFsc2UpXG4gIHRyYWNrQ2hhbmdlOiB0cnVlXG4gIHN0YXlPcHRpb25OYW1lOiAnc3RheU9uVHJhbnNmb3JtU3RyaW5nJ1xuICBhdXRvSW5kZW50OiBmYWxzZVxuICBhdXRvSW5kZW50TmV3bGluZTogZmFsc2VcbiAgYXV0b0luZGVudEFmdGVySW5zZXJ0VGV4dDogZmFsc2VcbiAgQHN0cmluZ1RyYW5zZm9ybWVyczogW11cblxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3Q6IC0+XG4gICAgQHN0cmluZ1RyYW5zZm9ybWVycy5wdXNoKHRoaXMpXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIGlmIHRleHQgPSBAZ2V0TmV3VGV4dChzZWxlY3Rpb24uZ2V0VGV4dCgpLCBzZWxlY3Rpb24pXG4gICAgICBpZiBAYXV0b0luZGVudEFmdGVySW5zZXJ0VGV4dFxuICAgICAgICBzdGFydFJvdyA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpLnN0YXJ0LnJvd1xuICAgICAgICBzdGFydFJvd0luZGVudExldmVsID0gZ2V0SW5kZW50TGV2ZWxGb3JCdWZmZXJSb3coQGVkaXRvciwgc3RhcnRSb3cpXG4gICAgICByYW5nZSA9IHNlbGVjdGlvbi5pbnNlcnRUZXh0KHRleHQsIHtAYXV0b0luZGVudCwgQGF1dG9JbmRlbnROZXdsaW5lfSlcblxuICAgICAgaWYgQGF1dG9JbmRlbnRBZnRlckluc2VydFRleHRcbiAgICAgICAgIyBDdXJyZW50bHkgdXNlZCBieSBTcGxpdEFyZ3VtZW50cyBhbmQgU3Vycm91bmQoIGxpbmV3aXNlIHRhcmdldCBvbmx5IClcbiAgICAgICAgcmFuZ2UgPSByYW5nZS50cmFuc2xhdGUoWzAsIDBdLCBbLTEsIDBdKSBpZiBAdGFyZ2V0LmlzTGluZXdpc2UoKVxuICAgICAgICBAZWRpdG9yLnNldEluZGVudGF0aW9uRm9yQnVmZmVyUm93KHJhbmdlLnN0YXJ0LnJvdywgc3RhcnRSb3dJbmRlbnRMZXZlbClcbiAgICAgICAgQGVkaXRvci5zZXRJbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyYW5nZS5lbmQucm93LCBzdGFydFJvd0luZGVudExldmVsKVxuICAgICAgICAjIEFkanVzdCBpbm5lciByYW5nZSwgZW5kLnJvdyBpcyBhbHJlYWR5KCBpZiBuZWVkZWQgKSB0cmFuc2xhdGVkIHNvIG5vIG5lZWQgdG8gcmUtdHJhbnNsYXRlLlxuICAgICAgICBhZGp1c3RJbmRlbnRXaXRoS2VlcGluZ0xheW91dChAZWRpdG9yLCByYW5nZS50cmFuc2xhdGUoWzEsIDBdLCBbMCwgMF0pKVxuXG5jbGFzcyBUb2dnbGVDYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiYEhlbGxvIFdvcmxkYCAtPiBgaEVMTE8gd09STERgXCJcbiAgZGlzcGxheU5hbWU6ICdUb2dnbGUgfidcblxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICB0ZXh0LnJlcGxhY2UoLy4vZywgdG9nZ2xlQ2FzZUZvckNoYXJhY3RlcilcblxuY2xhc3MgVG9nZ2xlQ2FzZUFuZE1vdmVSaWdodCBleHRlbmRzIFRvZ2dsZUNhc2VcbiAgQGV4dGVuZCgpXG4gIGZsYXNoVGFyZ2V0OiBmYWxzZVxuICByZXN0b3JlUG9zaXRpb25zOiBmYWxzZVxuICB0YXJnZXQ6ICdNb3ZlUmlnaHQnXG5cbmNsYXNzIFVwcGVyQ2FzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcImBIZWxsbyBXb3JsZGAgLT4gYEhFTExPIFdPUkxEYFwiXG4gIGRpc3BsYXlOYW1lOiAnVXBwZXInXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIHRleHQudG9VcHBlckNhc2UoKVxuXG5jbGFzcyBMb3dlckNhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJgSGVsbG8gV29ybGRgIC0+IGBoZWxsbyB3b3JsZGBcIlxuICBkaXNwbGF5TmFtZTogJ0xvd2VyJ1xuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICB0ZXh0LnRvTG93ZXJDYXNlKClcblxuIyBSZXBsYWNlXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFJlcGxhY2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIGZsYXNoQ2hlY2twb2ludDogJ2RpZC1zZWxlY3Qtb2NjdXJyZW5jZSdcbiAgaW5wdXQ6IG51bGxcbiAgcmVxdWlyZUlucHV0OiB0cnVlXG4gIGF1dG9JbmRlbnROZXdsaW5lOiB0cnVlXG4gIHN1cHBvcnRFYXJseVNlbGVjdDogdHJ1ZVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgQG9uRGlkU2VsZWN0VGFyZ2V0ID0+XG4gICAgICBAZm9jdXNJbnB1dChoaWRlQ3Vyc29yOiB0cnVlKVxuICAgIHN1cGVyXG5cbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgaWYgQHRhcmdldC5pcygnTW92ZVJpZ2h0QnVmZmVyQ29sdW1uJykgYW5kIHRleHQubGVuZ3RoIGlzbnQgQGdldENvdW50KClcbiAgICAgIHJldHVyblxuXG4gICAgaW5wdXQgPSBAaW5wdXQgb3IgXCJcXG5cIlxuICAgIGlmIGlucHV0IGlzIFwiXFxuXCJcbiAgICAgIEByZXN0b3JlUG9zaXRpb25zID0gZmFsc2VcbiAgICB0ZXh0LnJlcGxhY2UoLy4vZywgaW5wdXQpXG5cbmNsYXNzIFJlcGxhY2VDaGFyYWN0ZXIgZXh0ZW5kcyBSZXBsYWNlXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6IFwiTW92ZVJpZ2h0QnVmZmVyQ29sdW1uXCJcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIERVUCBtZWFuaW5nIHdpdGggU3BsaXRTdHJpbmcgbmVlZCBjb25zb2xpZGF0ZS5cbmNsYXNzIFNwbGl0QnlDaGFyYWN0ZXIgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIHRleHQuc3BsaXQoJycpLmpvaW4oJyAnKVxuXG5jbGFzcyBDYW1lbENhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIGRpc3BsYXlOYW1lOiAnQ2FtZWxpemUnXG4gIEBkZXNjcmlwdGlvbjogXCJgaGVsbG8td29ybGRgIC0+IGBoZWxsb1dvcmxkYFwiXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIF8uY2FtZWxpemUodGV4dClcblxuY2xhc3MgU25ha2VDYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiYEhlbGxvV29ybGRgIC0+IGBoZWxsb193b3JsZGBcIlxuICBkaXNwbGF5TmFtZTogJ1VuZGVyc2NvcmUgXydcbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgXy51bmRlcnNjb3JlKHRleHQpXG5cbmNsYXNzIFBhc2NhbENhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJgaGVsbG9fd29ybGRgIC0+IGBIZWxsb1dvcmxkYFwiXG4gIGRpc3BsYXlOYW1lOiAnUGFzY2FsaXplJ1xuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBfLmNhcGl0YWxpemUoXy5jYW1lbGl6ZSh0ZXh0KSlcblxuY2xhc3MgRGFzaENhc2UgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIGRpc3BsYXlOYW1lOiAnRGFzaGVyaXplIC0nXG4gIEBkZXNjcmlwdGlvbjogXCJIZWxsb1dvcmxkIC0+IGhlbGxvLXdvcmxkXCJcbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgXy5kYXNoZXJpemUodGV4dClcblxuY2xhc3MgVGl0bGVDYXNlIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiYEhlbGxvV29ybGRgIC0+IGBIZWxsbyBXb3JsZGBcIlxuICBkaXNwbGF5TmFtZTogJ1RpdGxpemUnXG4gIGdldE5ld1RleHQ6ICh0ZXh0KSAtPlxuICAgIF8uaHVtYW5pemVFdmVudE5hbWUoXy5kYXNoZXJpemUodGV4dCkpXG5cbmNsYXNzIEVuY29kZVVyaUNvbXBvbmVudCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcImBIZWxsbyBXb3JsZGAgLT4gYEhlbGxvJTIwV29ybGRgXCJcbiAgZGlzcGxheU5hbWU6ICdFbmNvZGUgVVJJIENvbXBvbmVudCAlJ1xuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBlbmNvZGVVUklDb21wb25lbnQodGV4dClcblxuY2xhc3MgRGVjb2RlVXJpQ29tcG9uZW50IGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiYEhlbGxvJTIwV29ybGRgIC0+IGBIZWxsbyBXb3JsZGBcIlxuICBkaXNwbGF5TmFtZTogJ0RlY29kZSBVUkkgQ29tcG9uZW50ICUlJ1xuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBkZWNvZGVVUklDb21wb25lbnQodGV4dClcblxuY2xhc3MgVHJpbVN0cmluZyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcImAgaGVsbG8gYCAtPiBgaGVsbG9gXCJcbiAgZGlzcGxheU5hbWU6ICdUcmltIHN0cmluZydcbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgdGV4dC50cmltKClcblxuY2xhc3MgQ29tcGFjdFNwYWNlcyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcImAgIGEgICAgYiAgICBjYCAtPiBgYSBiIGNgXCJcbiAgZGlzcGxheU5hbWU6ICdDb21wYWN0IHNwYWNlJ1xuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBpZiB0ZXh0Lm1hdGNoKC9eWyBdKyQvKVxuICAgICAgJyAnXG4gICAgZWxzZVxuICAgICAgIyBEb24ndCBjb21wYWN0IGZvciBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZSBzcGFjZXMuXG4gICAgICB0ZXh0LnJlcGxhY2UgL14oXFxzKikoLio/KShcXHMqKSQvZ20sIChtLCBsZWFkaW5nLCBtaWRkbGUsIHRyYWlsaW5nKSAtPlxuICAgICAgICBsZWFkaW5nICsgbWlkZGxlLnNwbGl0KC9bIFxcdF0rLykuam9pbignICcpICsgdHJhaWxpbmdcblxuY2xhc3MgUmVtb3ZlTGVhZGluZ1doaXRlU3BhY2VzIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIEBkZXNjcmlwdGlvbjogXCJgICBhIGIgY2AgLT4gYGEgYiBjYFwiXG4gIGdldE5ld1RleHQ6ICh0ZXh0LCBzZWxlY3Rpb24pIC0+XG4gICAgdHJpbUxlZnQgPSAodGV4dCkgLT4gdGV4dC50cmltTGVmdCgpXG4gICAgc3BsaXRUZXh0QnlOZXdMaW5lKHRleHQpLm1hcCh0cmltTGVmdCkuam9pbihcIlxcblwiKSArIFwiXFxuXCJcblxuY2xhc3MgQ29udmVydFRvU29mdFRhYiBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgZGlzcGxheU5hbWU6ICdTb2Z0IFRhYidcbiAgd2lzZTogJ2xpbmV3aXNlJ1xuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICBAc2NhbkZvcndhcmQgL1xcdC9nLCB7c2NhblJhbmdlOiBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKX0sICh7cmFuZ2UsIHJlcGxhY2V9KSA9PlxuICAgICAgIyBSZXBsYWNlIFxcdCB0byBzcGFjZXMgd2hpY2ggbGVuZ3RoIGlzIHZhcnkgZGVwZW5kaW5nIG9uIHRhYlN0b3AgYW5kIHRhYkxlbmdodFxuICAgICAgIyBTbyB3ZSBkaXJlY3RseSBjb25zdWx0IGl0J3Mgc2NyZWVuIHJlcHJlc2VudGluZyBsZW5ndGguXG4gICAgICBsZW5ndGggPSBAZWRpdG9yLnNjcmVlblJhbmdlRm9yQnVmZmVyUmFuZ2UocmFuZ2UpLmdldEV4dGVudCgpLmNvbHVtblxuICAgICAgcmVwbGFjZShcIiBcIi5yZXBlYXQobGVuZ3RoKSlcblxuY2xhc3MgQ29udmVydFRvSGFyZFRhYiBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgZGlzcGxheU5hbWU6ICdIYXJkIFRhYidcblxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgdGFiTGVuZ3RoID0gQGVkaXRvci5nZXRUYWJMZW5ndGgoKVxuICAgIEBzY2FuRm9yd2FyZCAvWyBcXHRdKy9nLCB7c2NhblJhbmdlOiBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKX0sICh7cmFuZ2UsIHJlcGxhY2V9KSA9PlxuICAgICAge3N0YXJ0LCBlbmR9ID0gQGVkaXRvci5zY3JlZW5SYW5nZUZvckJ1ZmZlclJhbmdlKHJhbmdlKVxuICAgICAgc3RhcnRDb2x1bW4gPSBzdGFydC5jb2x1bW5cbiAgICAgIGVuZENvbHVtbiA9IGVuZC5jb2x1bW5cblxuICAgICAgIyBXZSBjYW4ndCBuYWl2ZWx5IHJlcGxhY2Ugc3BhY2VzIHRvIHRhYiwgd2UgaGF2ZSB0byBjb25zaWRlciB2YWxpZCB0YWJTdG9wIGNvbHVtblxuICAgICAgIyBJZiBuZXh0VGFiU3RvcCBjb2x1bW4gZXhjZWVkcyByZXBsYWNhYmxlIHJhbmdlLCB3ZSBwYWQgd2l0aCBzcGFjZXMuXG4gICAgICBuZXdUZXh0ID0gJydcbiAgICAgIGxvb3BcbiAgICAgICAgcmVtYWluZGVyID0gc3RhcnRDb2x1bW4gJSUgdGFiTGVuZ3RoXG4gICAgICAgIG5leHRUYWJTdG9wID0gc3RhcnRDb2x1bW4gKyAoaWYgcmVtYWluZGVyIGlzIDAgdGhlbiB0YWJMZW5ndGggZWxzZSByZW1haW5kZXIpXG4gICAgICAgIGlmIG5leHRUYWJTdG9wID4gZW5kQ29sdW1uXG4gICAgICAgICAgbmV3VGV4dCArPSBcIiBcIi5yZXBlYXQoZW5kQ29sdW1uIC0gc3RhcnRDb2x1bW4pXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBuZXdUZXh0ICs9IFwiXFx0XCJcbiAgICAgICAgc3RhcnRDb2x1bW4gPSBuZXh0VGFiU3RvcFxuICAgICAgICBicmVhayBpZiBzdGFydENvbHVtbiA+PSBlbmRDb2x1bW5cblxuICAgICAgcmVwbGFjZShuZXdUZXh0KVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFRyYW5zZm9ybVN0cmluZ0J5RXh0ZXJuYWxDb21tYW5kIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoZmFsc2UpXG4gIGF1dG9JbmRlbnQ6IHRydWVcbiAgY29tbWFuZDogJycgIyBlLmcuIGNvbW1hbmQ6ICdzb3J0J1xuICBhcmdzOiBbXSAjIGUuZyBhcmdzOiBbJy1ybiddXG4gIHN0ZG91dEJ5U2VsZWN0aW9uOiBudWxsXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAbm9ybWFsaXplU2VsZWN0aW9uc0lmTmVjZXNzYXJ5KClcbiAgICBpZiBAc2VsZWN0VGFyZ2V0KClcbiAgICAgIG5ldyBQcm9taXNlIChyZXNvbHZlKSA9PlxuICAgICAgICBAY29sbGVjdChyZXNvbHZlKVxuICAgICAgLnRoZW4gPT5cbiAgICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICAgIHRleHQgPSBAZ2V0TmV3VGV4dChzZWxlY3Rpb24uZ2V0VGV4dCgpLCBzZWxlY3Rpb24pXG4gICAgICAgICAgc2VsZWN0aW9uLmluc2VydFRleHQodGV4dCwge0BhdXRvSW5kZW50fSlcbiAgICAgICAgQHJlc3RvcmVDdXJzb3JQb3NpdGlvbnNJZk5lY2Vzc2FyeSgpXG4gICAgICAgIEBhY3RpdmF0ZU1vZGUoXCJub3JtYWxcIilcblxuICBjb2xsZWN0OiAocmVzb2x2ZSkgLT5cbiAgICBAc3Rkb3V0QnlTZWxlY3Rpb24gPSBuZXcgTWFwXG4gICAgcHJvY2Vzc1J1bm5pbmcgPSBwcm9jZXNzRmluaXNoZWQgPSAwXG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAge2NvbW1hbmQsIGFyZ3N9ID0gQGdldENvbW1hbmQoc2VsZWN0aW9uKSA/IHt9XG4gICAgICByZXR1cm4gdW5sZXNzIChjb21tYW5kPyBhbmQgYXJncz8pXG4gICAgICBwcm9jZXNzUnVubmluZysrXG4gICAgICBkbyAoc2VsZWN0aW9uKSA9PlxuICAgICAgICBzdGRpbiA9IEBnZXRTdGRpbihzZWxlY3Rpb24pXG4gICAgICAgIHN0ZG91dCA9IChvdXRwdXQpID0+XG4gICAgICAgICAgQHN0ZG91dEJ5U2VsZWN0aW9uLnNldChzZWxlY3Rpb24sIG91dHB1dClcbiAgICAgICAgZXhpdCA9IChjb2RlKSAtPlxuICAgICAgICAgIHByb2Nlc3NGaW5pc2hlZCsrXG4gICAgICAgICAgcmVzb2x2ZSgpIGlmIChwcm9jZXNzUnVubmluZyBpcyBwcm9jZXNzRmluaXNoZWQpXG4gICAgICAgIEBydW5FeHRlcm5hbENvbW1hbmQge2NvbW1hbmQsIGFyZ3MsIHN0ZG91dCwgZXhpdCwgc3RkaW59XG5cbiAgcnVuRXh0ZXJuYWxDb21tYW5kOiAob3B0aW9ucykgLT5cbiAgICBzdGRpbiA9IG9wdGlvbnMuc3RkaW5cbiAgICBkZWxldGUgb3B0aW9ucy5zdGRpblxuICAgIGJ1ZmZlcmVkUHJvY2VzcyA9IG5ldyBCdWZmZXJlZFByb2Nlc3Mob3B0aW9ucylcbiAgICBidWZmZXJlZFByb2Nlc3Mub25XaWxsVGhyb3dFcnJvciAoe2Vycm9yLCBoYW5kbGV9KSA9PlxuICAgICAgIyBTdXBwcmVzcyBjb21tYW5kIG5vdCBmb3VuZCBlcnJvciBpbnRlbnRpb25hbGx5LlxuICAgICAgaWYgZXJyb3IuY29kZSBpcyAnRU5PRU5UJyBhbmQgZXJyb3Iuc3lzY2FsbC5pbmRleE9mKCdzcGF3bicpIGlzIDBcbiAgICAgICAgY29tbWFuZE5hbWUgPSBAY29uc3RydWN0b3IuZ2V0Q29tbWFuZE5hbWUoKVxuICAgICAgICBjb25zb2xlLmxvZyBcIiN7Y29tbWFuZE5hbWV9OiBGYWlsZWQgdG8gc3Bhd24gY29tbWFuZCAje2Vycm9yLnBhdGh9LlwiXG4gICAgICAgIGhhbmRsZSgpXG4gICAgICBAY2FuY2VsT3BlcmF0aW9uKClcblxuICAgIGlmIHN0ZGluXG4gICAgICBidWZmZXJlZFByb2Nlc3MucHJvY2Vzcy5zdGRpbi53cml0ZShzdGRpbilcbiAgICAgIGJ1ZmZlcmVkUHJvY2Vzcy5wcm9jZXNzLnN0ZGluLmVuZCgpXG5cbiAgZ2V0TmV3VGV4dDogKHRleHQsIHNlbGVjdGlvbikgLT5cbiAgICBAZ2V0U3Rkb3V0KHNlbGVjdGlvbikgPyB0ZXh0XG5cbiAgIyBGb3IgZWFzaWx5IGV4dGVuZCBieSB2bXAgcGx1Z2luLlxuICBnZXRDb21tYW5kOiAoc2VsZWN0aW9uKSAtPiB7QGNvbW1hbmQsIEBhcmdzfVxuICBnZXRTdGRpbjogKHNlbGVjdGlvbikgLT4gc2VsZWN0aW9uLmdldFRleHQoKVxuICBnZXRTdGRvdXQ6IChzZWxlY3Rpb24pIC0+IEBzdGRvdXRCeVNlbGVjdGlvbi5nZXQoc2VsZWN0aW9uKVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFRyYW5zZm9ybVN0cmluZ0J5U2VsZWN0TGlzdCBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIkludGVyYWN0aXZlbHkgY2hvb3NlIHN0cmluZyB0cmFuc2Zvcm1hdGlvbiBvcGVyYXRvciBmcm9tIHNlbGVjdC1saXN0XCJcbiAgQHNlbGVjdExpc3RJdGVtczogbnVsbFxuICByZXF1aXJlSW5wdXQ6IHRydWVcblxuICBnZXRJdGVtczogLT5cbiAgICBAY29uc3RydWN0b3Iuc2VsZWN0TGlzdEl0ZW1zID89IEBjb25zdHJ1Y3Rvci5zdHJpbmdUcmFuc2Zvcm1lcnMubWFwIChrbGFzcykgLT5cbiAgICAgIGlmIGtsYXNzOjpoYXNPd25Qcm9wZXJ0eSgnZGlzcGxheU5hbWUnKVxuICAgICAgICBkaXNwbGF5TmFtZSA9IGtsYXNzOjpkaXNwbGF5TmFtZVxuICAgICAgZWxzZVxuICAgICAgICBkaXNwbGF5TmFtZSA9IF8uaHVtYW5pemVFdmVudE5hbWUoXy5kYXNoZXJpemUoa2xhc3MubmFtZSkpXG4gICAgICB7bmFtZToga2xhc3MsIGRpc3BsYXlOYW1lfVxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgc3VwZXJcblxuICAgIEB2aW1TdGF0ZS5vbkRpZENvbmZpcm1TZWxlY3RMaXN0IChpdGVtKSA9PlxuICAgICAgdHJhbnNmb3JtZXIgPSBpdGVtLm5hbWVcbiAgICAgIEB0YXJnZXQgPSB0cmFuc2Zvcm1lcjo6dGFyZ2V0IGlmIHRyYW5zZm9ybWVyOjp0YXJnZXQ/XG4gICAgICBAdmltU3RhdGUucmVzZXQoKVxuICAgICAgaWYgQHRhcmdldD9cbiAgICAgICAgQHZpbVN0YXRlLm9wZXJhdGlvblN0YWNrLnJ1bih0cmFuc2Zvcm1lciwge0B0YXJnZXR9KVxuICAgICAgZWxzZVxuICAgICAgICBAdmltU3RhdGUub3BlcmF0aW9uU3RhY2sucnVuKHRyYW5zZm9ybWVyKVxuXG4gICAgQGZvY3VzU2VsZWN0TGlzdChpdGVtczogQGdldEl0ZW1zKCkpXG5cbiAgZXhlY3V0ZTogLT5cbiAgICAjIE5FVkVSIGJlIGV4ZWN1dGVkIHNpbmNlIG9wZXJhdGlvblN0YWNrIGlzIHJlcGxhY2VkIHdpdGggc2VsZWN0ZWQgdHJhbnNmb3JtZXJcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCIje0BuYW1lfSBzaG91bGQgbm90IGJlIGV4ZWN1dGVkXCIpXG5cbmNsYXNzIFRyYW5zZm9ybVdvcmRCeVNlbGVjdExpc3QgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdCeVNlbGVjdExpc3RcbiAgQGV4dGVuZCgpXG4gIHRhcmdldDogXCJJbm5lcldvcmRcIlxuXG5jbGFzcyBUcmFuc2Zvcm1TbWFydFdvcmRCeVNlbGVjdExpc3QgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdCeVNlbGVjdExpc3RcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJUcmFuc2Zvcm0gSW5uZXJTbWFydFdvcmQgYnkgYHRyYW5zZm9ybS1zdHJpbmctYnktc2VsZWN0LWxpc3RgXCJcbiAgdGFyZ2V0OiBcIklubmVyU21hcnRXb3JkXCJcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBSZXBsYWNlV2l0aFJlZ2lzdGVyIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiUmVwbGFjZSB0YXJnZXQgd2l0aCBzcGVjaWZpZWQgcmVnaXN0ZXIgdmFsdWVcIlxuICBmbGFzaFR5cGU6ICdvcGVyYXRvci1sb25nJ1xuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgQHZpbVN0YXRlLnNlcXVlbnRpYWxQYXN0ZU1hbmFnZXIub25Jbml0aWFsaXplKHRoaXMpXG5cbiAgZXhlY3V0ZTogLT5cbiAgICBAc2VxdWVudGlhbFBhc3RlID0gQHZpbVN0YXRlLnNlcXVlbnRpYWxQYXN0ZU1hbmFnZXIub25FeGVjdXRlKHRoaXMpXG5cbiAgICBzdXBlclxuXG4gICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgcmFuZ2UgPSBAbXV0YXRpb25NYW5hZ2VyLmdldE11dGF0ZWRCdWZmZXJSYW5nZUZvclNlbGVjdGlvbihzZWxlY3Rpb24pXG4gICAgICBAdmltU3RhdGUuc2VxdWVudGlhbFBhc3RlTWFuYWdlci5zYXZlUGFzdGVkUmFuZ2VGb3JTZWxlY3Rpb24oc2VsZWN0aW9uLCByYW5nZSlcblxuICBnZXROZXdUZXh0OiAodGV4dCwgc2VsZWN0aW9uKSAtPlxuICAgIEB2aW1TdGF0ZS5yZWdpc3Rlci5nZXQobnVsbCwgc2VsZWN0aW9uLCBAc2VxdWVudGlhbFBhc3RlKT8udGV4dCA/IFwiXCJcblxuIyBTYXZlIHRleHQgdG8gcmVnaXN0ZXIgYmVmb3JlIHJlcGxhY2VcbmNsYXNzIFN3YXBXaXRoUmVnaXN0ZXIgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTd2FwIHJlZ2lzdGVyIHZhbHVlIHdpdGggdGFyZ2V0XCJcbiAgZ2V0TmV3VGV4dDogKHRleHQsIHNlbGVjdGlvbikgLT5cbiAgICBuZXdUZXh0ID0gQHZpbVN0YXRlLnJlZ2lzdGVyLmdldFRleHQoKVxuICAgIEBzZXRUZXh0VG9SZWdpc3Rlcih0ZXh0LCBzZWxlY3Rpb24pXG4gICAgbmV3VGV4dFxuXG4jIEluZGVudCA8IFRyYW5zZm9ybVN0cmluZ1xuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5jbGFzcyBJbmRlbnQgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIHN0YXlCeU1hcmtlcjogdHJ1ZVxuICBzZXRUb0ZpcnN0Q2hhcmFjdGVyT25MaW5ld2lzZTogdHJ1ZVxuICB3aXNlOiAnbGluZXdpc2UnXG5cbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgICMgTmVlZCBjb3VudCB0aW1lcyBpbmRlbnRhdGlvbiBpbiB2aXN1YWwtbW9kZSBhbmQgaXRzIHJlcGVhdChgLmApLlxuICAgIGlmIEB0YXJnZXQuaXMoJ0N1cnJlbnRTZWxlY3Rpb24nKVxuICAgICAgb2xkVGV4dCA9IG51bGxcbiAgICAgICAjIGxpbWl0IHRvIDEwMCB0byBhdm9pZCBmcmVlemluZyBieSBhY2NpZGVudGFsIGJpZyBudW1iZXIuXG4gICAgICBjb3VudCA9IGxpbWl0TnVtYmVyKEBnZXRDb3VudCgpLCBtYXg6IDEwMClcbiAgICAgIEBjb3VudFRpbWVzIGNvdW50LCAoe3N0b3B9KSA9PlxuICAgICAgICBvbGRUZXh0ID0gc2VsZWN0aW9uLmdldFRleHQoKVxuICAgICAgICBAaW5kZW50KHNlbGVjdGlvbilcbiAgICAgICAgc3RvcCgpIGlmIHNlbGVjdGlvbi5nZXRUZXh0KCkgaXMgb2xkVGV4dFxuICAgIGVsc2VcbiAgICAgIEBpbmRlbnQoc2VsZWN0aW9uKVxuXG4gIGluZGVudDogKHNlbGVjdGlvbikgLT5cbiAgICBzZWxlY3Rpb24uaW5kZW50U2VsZWN0ZWRSb3dzKClcblxuY2xhc3MgT3V0ZGVudCBleHRlbmRzIEluZGVudFxuICBAZXh0ZW5kKClcbiAgaW5kZW50OiAoc2VsZWN0aW9uKSAtPlxuICAgIHNlbGVjdGlvbi5vdXRkZW50U2VsZWN0ZWRSb3dzKClcblxuY2xhc3MgQXV0b0luZGVudCBleHRlbmRzIEluZGVudFxuICBAZXh0ZW5kKClcbiAgaW5kZW50OiAoc2VsZWN0aW9uKSAtPlxuICAgIHNlbGVjdGlvbi5hdXRvSW5kZW50U2VsZWN0ZWRSb3dzKClcblxuY2xhc3MgVG9nZ2xlTGluZUNvbW1lbnRzIGV4dGVuZHMgVHJhbnNmb3JtU3RyaW5nXG4gIEBleHRlbmQoKVxuICBmbGFzaFRhcmdldDogZmFsc2VcbiAgc3RheUJ5TWFya2VyOiB0cnVlXG4gIHdpc2U6ICdsaW5ld2lzZSdcblxuICBtdXRhdGVTZWxlY3Rpb246IChzZWxlY3Rpb24pIC0+XG4gICAgc2VsZWN0aW9uLnRvZ2dsZUxpbmVDb21tZW50cygpXG5cbmNsYXNzIFJlZmxvdyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgbXV0YXRlU2VsZWN0aW9uOiAoc2VsZWN0aW9uKSAtPlxuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goQGVkaXRvckVsZW1lbnQsICdhdXRvZmxvdzpyZWZsb3ctc2VsZWN0aW9uJylcblxuY2xhc3MgUmVmbG93V2l0aFN0YXkgZXh0ZW5kcyBSZWZsb3dcbiAgQGV4dGVuZCgpXG4gIHN0YXlBdFNhbWVQb3NpdGlvbjogdHJ1ZVxuXG4jIFN1cnJvdW5kIDwgVHJhbnNmb3JtU3RyaW5nXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIFN1cnJvdW5kQmFzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKGZhbHNlKVxuICBwYWlyczogW1xuICAgIFsnWycsICddJ11cbiAgICBbJygnLCAnKSddXG4gICAgWyd7JywgJ30nXVxuICAgIFsnPCcsICc+J11cbiAgXVxuICBwYWlyc0J5QWxpYXM6IHtcbiAgICBiOiBbJygnLCAnKSddXG4gICAgQjogWyd7JywgJ30nXVxuICAgIHI6IFsnWycsICddJ11cbiAgICBhOiBbJzwnLCAnPiddXG4gIH1cblxuICBwYWlyQ2hhcnNBbGxvd0ZvcndhcmRpbmc6ICdbXSgpe30nXG4gIGlucHV0OiBudWxsXG4gIHJlcXVpcmVJbnB1dDogdHJ1ZVxuICBzdXBwb3J0RWFybHlTZWxlY3Q6IHRydWUgIyBFeHBlcmltZW50YWxcblxuICBmb2N1c0lucHV0Rm9yU3Vycm91bmRDaGFyOiAtPlxuICAgIEBmb2N1c0lucHV0KGhpZGVDdXJzb3I6IHRydWUpXG5cbiAgZm9jdXNJbnB1dEZvclRhcmdldFBhaXJDaGFyOiAtPlxuICAgIEBmb2N1c0lucHV0KG9uQ29uZmlybTogKGNoYXIpID0+IEBvbkNvbmZpcm1UYXJnZXRQYWlyQ2hhcihjaGFyKSlcblxuICBnZXRQYWlyOiAoY2hhcikgLT5cbiAgICBwYWlyID0gQHBhaXJzQnlBbGlhc1tjaGFyXVxuICAgIHBhaXIgPz0gXy5kZXRlY3QoQHBhaXJzLCAocGFpcikgLT4gY2hhciBpbiBwYWlyKVxuICAgIHBhaXIgPz0gW2NoYXIsIGNoYXJdXG4gICAgcGFpclxuXG4gIHN1cnJvdW5kOiAodGV4dCwgY2hhciwgb3B0aW9ucz17fSkgLT5cbiAgICBrZWVwTGF5b3V0ID0gb3B0aW9ucy5rZWVwTGF5b3V0ID8gZmFsc2VcbiAgICBbb3BlbiwgY2xvc2VdID0gQGdldFBhaXIoY2hhcilcbiAgICBpZiAobm90IGtlZXBMYXlvdXQpIGFuZCB0ZXh0LmVuZHNXaXRoKFwiXFxuXCIpXG4gICAgICBAYXV0b0luZGVudEFmdGVySW5zZXJ0VGV4dCA9IHRydWVcbiAgICAgIG9wZW4gKz0gXCJcXG5cIlxuICAgICAgY2xvc2UgKz0gXCJcXG5cIlxuXG4gICAgaWYgY2hhciBpbiBAZ2V0Q29uZmlnKCdjaGFyYWN0ZXJzVG9BZGRTcGFjZU9uU3Vycm91bmQnKSBhbmQgaXNTaW5nbGVMaW5lVGV4dCh0ZXh0KVxuICAgICAgdGV4dCA9ICcgJyArIHRleHQgKyAnICdcblxuICAgIG9wZW4gKyB0ZXh0ICsgY2xvc2VcblxuICBkZWxldGVTdXJyb3VuZDogKHRleHQpIC0+XG4gICAgW29wZW4sIGlubmVyVGV4dC4uLiwgY2xvc2VdID0gdGV4dFxuICAgIGlubmVyVGV4dCA9IGlubmVyVGV4dC5qb2luKCcnKVxuICAgIGlmIGlzU2luZ2xlTGluZVRleHQodGV4dCkgYW5kIChvcGVuIGlzbnQgY2xvc2UpXG4gICAgICBpbm5lclRleHQudHJpbSgpXG4gICAgZWxzZVxuICAgICAgaW5uZXJUZXh0XG5cbiAgb25Db25maXJtVGFyZ2V0UGFpckNoYXI6IChjaGFyKSAtPlxuICAgIEBzZXRUYXJnZXQgQG5ldygnQVBhaXInLCBwYWlyOiBAZ2V0UGFpcihjaGFyKSlcblxuY2xhc3MgU3Vycm91bmQgZXh0ZW5kcyBTdXJyb3VuZEJhc2VcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTdXJyb3VuZCB0YXJnZXQgYnkgc3BlY2lmaWVkIGNoYXJhY3RlciBsaWtlIGAoYCwgYFtgLCBgXFxcImBcIlxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgQG9uRGlkU2VsZWN0VGFyZ2V0KEBmb2N1c0lucHV0Rm9yU3Vycm91bmRDaGFyLmJpbmQodGhpcykpXG4gICAgc3VwZXJcblxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBAc3Vycm91bmQodGV4dCwgQGlucHV0KVxuXG5jbGFzcyBTdXJyb3VuZFdvcmQgZXh0ZW5kcyBTdXJyb3VuZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlN1cnJvdW5kICoqd29yZCoqXCJcbiAgdGFyZ2V0OiAnSW5uZXJXb3JkJ1xuXG5jbGFzcyBTdXJyb3VuZFNtYXJ0V29yZCBleHRlbmRzIFN1cnJvdW5kXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiU3Vycm91bmQgKipzbWFydC13b3JkKipcIlxuICB0YXJnZXQ6ICdJbm5lclNtYXJ0V29yZCdcblxuY2xhc3MgTWFwU3Vycm91bmQgZXh0ZW5kcyBTdXJyb3VuZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIlN1cnJvdW5kIGVhY2ggd29yZChgL1xcdysvYCkgd2l0aGluIHRhcmdldFwiXG4gIG9jY3VycmVuY2U6IHRydWVcbiAgcGF0dGVybkZvck9jY3VycmVuY2U6IC9cXHcrL2dcblxuIyBEZWxldGUgU3Vycm91bmRcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xhc3MgRGVsZXRlU3Vycm91bmQgZXh0ZW5kcyBTdXJyb3VuZEJhc2VcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJEZWxldGUgc3BlY2lmaWVkIHN1cnJvdW5kIGNoYXJhY3RlciBsaWtlIGAoYCwgYFtgLCBgXFxcImBcIlxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgQGZvY3VzSW5wdXRGb3JUYXJnZXRQYWlyQ2hhcigpIHVubGVzcyBAdGFyZ2V0P1xuICAgIHN1cGVyXG5cbiAgb25Db25maXJtVGFyZ2V0UGFpckNoYXI6IChjaGFyKSAtPlxuICAgIHN1cGVyXG4gICAgQGlucHV0ID0gY2hhclxuICAgIEBwcm9jZXNzT3BlcmF0aW9uKClcblxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBAZGVsZXRlU3Vycm91bmQodGV4dClcblxuY2xhc3MgRGVsZXRlU3Vycm91bmRBbnlQYWlyIGV4dGVuZHMgRGVsZXRlU3Vycm91bmRcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJEZWxldGUgc3Vycm91bmQgY2hhcmFjdGVyIGJ5IGF1dG8tZGV0ZWN0IHBhaXJlZCBjaGFyIGZyb20gY3Vyc29yIGVuY2xvc2VkIHBhaXJcIlxuICB0YXJnZXQ6ICdBQW55UGFpcidcbiAgcmVxdWlyZUlucHV0OiBmYWxzZVxuXG5jbGFzcyBEZWxldGVTdXJyb3VuZEFueVBhaXJBbGxvd0ZvcndhcmRpbmcgZXh0ZW5kcyBEZWxldGVTdXJyb3VuZEFueVBhaXJcbiAgQGV4dGVuZCgpXG4gIEBkZXNjcmlwdGlvbjogXCJEZWxldGUgc3Vycm91bmQgY2hhcmFjdGVyIGJ5IGF1dG8tZGV0ZWN0IHBhaXJlZCBjaGFyIGZyb20gY3Vyc29yIGVuY2xvc2VkIHBhaXIgYW5kIGZvcndhcmRpbmcgcGFpciB3aXRoaW4gc2FtZSBsaW5lXCJcbiAgdGFyZ2V0OiAnQUFueVBhaXJBbGxvd0ZvcndhcmRpbmcnXG5cbiMgQ2hhbmdlIFN1cnJvdW5kXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNsYXNzIENoYW5nZVN1cnJvdW5kIGV4dGVuZHMgU3Vycm91bmRCYXNlXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiQ2hhbmdlIHN1cnJvdW5kIGNoYXJhY3Rlciwgc3BlY2lmeSBib3RoIGZyb20gYW5kIHRvIHBhaXIgY2hhclwiXG5cbiAgc2hvd0RlbGV0ZUNoYXJPbkhvdmVyOiAtPlxuICAgIGhvdmVyUG9pbnQgPSBAbXV0YXRpb25NYW5hZ2VyLmdldEluaXRpYWxQb2ludEZvclNlbGVjdGlvbihAZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKSlcbiAgICBjaGFyID0gQGVkaXRvci5nZXRTZWxlY3RlZFRleHQoKVswXVxuICAgIEB2aW1TdGF0ZS5ob3Zlci5zZXQoY2hhciwgaG92ZXJQb2ludClcblxuICBpbml0aWFsaXplOiAtPlxuICAgIGlmIEB0YXJnZXQ/XG4gICAgICBAb25EaWRGYWlsU2VsZWN0VGFyZ2V0KEBhYm9ydC5iaW5kKHRoaXMpKVxuICAgIGVsc2VcbiAgICAgIEBvbkRpZEZhaWxTZWxlY3RUYXJnZXQoQGNhbmNlbE9wZXJhdGlvbi5iaW5kKHRoaXMpKVxuICAgICAgQGZvY3VzSW5wdXRGb3JUYXJnZXRQYWlyQ2hhcigpXG4gICAgc3VwZXJcblxuICAgIEBvbkRpZFNlbGVjdFRhcmdldCA9PlxuICAgICAgQHNob3dEZWxldGVDaGFyT25Ib3ZlcigpXG4gICAgICBAZm9jdXNJbnB1dEZvclN1cnJvdW5kQ2hhcigpXG5cbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgaW5uZXJUZXh0ID0gQGRlbGV0ZVN1cnJvdW5kKHRleHQpXG4gICAgQHN1cnJvdW5kKGlubmVyVGV4dCwgQGlucHV0LCBrZWVwTGF5b3V0OiB0cnVlKVxuXG5jbGFzcyBDaGFuZ2VTdXJyb3VuZEFueVBhaXIgZXh0ZW5kcyBDaGFuZ2VTdXJyb3VuZFxuICBAZXh0ZW5kKClcbiAgQGRlc2NyaXB0aW9uOiBcIkNoYW5nZSBzdXJyb3VuZCBjaGFyYWN0ZXIsIGZyb20gY2hhciBpcyBhdXRvLWRldGVjdGVkXCJcbiAgdGFyZ2V0OiBcIkFBbnlQYWlyXCJcblxuY2xhc3MgQ2hhbmdlU3Vycm91bmRBbnlQYWlyQWxsb3dGb3J3YXJkaW5nIGV4dGVuZHMgQ2hhbmdlU3Vycm91bmRBbnlQYWlyXG4gIEBleHRlbmQoKVxuICBAZGVzY3JpcHRpb246IFwiQ2hhbmdlIHN1cnJvdW5kIGNoYXJhY3RlciwgZnJvbSBjaGFyIGlzIGF1dG8tZGV0ZWN0ZWQgZnJvbSBlbmNsb3NlZCBhbmQgZm9yd2FyZGluZyBhcmVhXCJcbiAgdGFyZ2V0OiBcIkFBbnlQYWlyQWxsb3dGb3J3YXJkaW5nXCJcblxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEZJWE1FXG4jIEN1cnJlbnRseSBuYXRpdmUgZWRpdG9yLmpvaW5MaW5lcygpIGlzIGJldHRlciBmb3IgY3Vyc29yIHBvc2l0aW9uIHNldHRpbmdcbiMgU28gSSB1c2UgbmF0aXZlIG1ldGhvZHMgZm9yIGEgbWVhbndoaWxlLlxuY2xhc3MgSm9pbiBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgdGFyZ2V0OiBcIk1vdmVUb1JlbGF0aXZlTGluZVwiXG4gIGZsYXNoVGFyZ2V0OiBmYWxzZVxuICByZXN0b3JlUG9zaXRpb25zOiBmYWxzZVxuXG4gIG11dGF0ZVNlbGVjdGlvbjogKHNlbGVjdGlvbikgLT5cbiAgICByYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG5cbiAgICAjIFdoZW4gY3Vyc29yIGlzIGF0IGxhc3QgQlVGRkVSIHJvdywgaXQgc2VsZWN0IGxhc3QtYnVmZmVyLXJvdywgdGhlblxuICAgICMgam9pbm5pbmcgcmVzdWx0IGluIFwiY2xlYXIgbGFzdC1idWZmZXItcm93IHRleHRcIi5cbiAgICAjIEkgYmVsaWV2ZSB0aGlzIGlzIEJVRyBvZiB1cHN0cmVhbSBhdG9tLWNvcmUuIGd1YXJkIHRoaXMgc2l0dWF0aW9uIGhlcmVcbiAgICB1bmxlc3MgKHJhbmdlLmlzU2luZ2xlTGluZSgpIGFuZCByYW5nZS5lbmQucm93IGlzIEBlZGl0b3IuZ2V0TGFzdEJ1ZmZlclJvdygpKVxuICAgICAgaWYgaXNMaW5ld2lzZVJhbmdlKHJhbmdlKVxuICAgICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UocmFuZ2UudHJhbnNsYXRlKFswLCAwXSwgWy0xLCBJbmZpbml0eV0pKVxuICAgICAgc2VsZWN0aW9uLmpvaW5MaW5lcygpXG4gICAgZW5kID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKCkuZW5kXG4gICAgc2VsZWN0aW9uLmN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihlbmQudHJhbnNsYXRlKFswLCAtMV0pKVxuXG5jbGFzcyBKb2luQmFzZSBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKGZhbHNlKVxuICB3aXNlOiAnbGluZXdpc2UnXG4gIHRyaW06IGZhbHNlXG4gIHRhcmdldDogXCJNb3ZlVG9SZWxhdGl2ZUxpbmVNaW5pbXVtT25lXCJcblxuICBpbml0aWFsaXplOiAtPlxuICAgIEBmb2N1c0lucHV0KGNoYXJzTWF4OiAxMCkgaWYgQHJlcXVpcmVJbnB1dFxuICAgIHN1cGVyXG5cbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgaWYgQHRyaW1cbiAgICAgIHBhdHRlcm4gPSAvXFxyP1xcblsgXFx0XSovZ1xuICAgIGVsc2VcbiAgICAgIHBhdHRlcm4gPSAvXFxyP1xcbi9nXG4gICAgdGV4dC50cmltUmlnaHQoKS5yZXBsYWNlKHBhdHRlcm4sIEBpbnB1dCkgKyBcIlxcblwiXG5cbmNsYXNzIEpvaW5XaXRoS2VlcGluZ1NwYWNlIGV4dGVuZHMgSm9pbkJhc2VcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIGlucHV0OiAnJ1xuXG5jbGFzcyBKb2luQnlJbnB1dCBleHRlbmRzIEpvaW5CYXNlXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiVHJhbnNmb3JtIG11bHRpLWxpbmUgdG8gc2luZ2xlLWxpbmUgYnkgd2l0aCBzcGVjaWZpZWQgc2VwYXJhdG9yIGNoYXJhY3RlclwiXG4gIHJlcXVpcmVJbnB1dDogdHJ1ZVxuICB0cmltOiB0cnVlXG5cbmNsYXNzIEpvaW5CeUlucHV0V2l0aEtlZXBpbmdTcGFjZSBleHRlbmRzIEpvaW5CeUlucHV0XG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBAZGVzY3JpcHRpb246IFwiSm9pbiBsaW5lcyB3aXRob3V0IHBhZGRpbmcgc3BhY2UgYmV0d2VlbiBlYWNoIGxpbmVcIlxuICB0cmltOiBmYWxzZVxuXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgU3RyaW5nIHN1ZmZpeCBpbiBuYW1lIGlzIHRvIGF2b2lkIGNvbmZ1c2lvbiB3aXRoICdzcGxpdCcgd2luZG93LlxuY2xhc3MgU3BsaXRTdHJpbmcgZXh0ZW5kcyBUcmFuc2Zvcm1TdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTcGxpdCBzaW5nbGUtbGluZSBpbnRvIG11bHRpLWxpbmUgYnkgc3BsaXR0aW5nIHNwZWNpZmllZCBzZXBhcmF0b3IgY2hhcnNcIlxuICByZXF1aXJlSW5wdXQ6IHRydWVcbiAgaW5wdXQ6IG51bGxcbiAgdGFyZ2V0OiBcIk1vdmVUb1JlbGF0aXZlTGluZVwiXG4gIGtlZXBTcGxpdHRlcjogZmFsc2VcblxuICBpbml0aWFsaXplOiAtPlxuICAgIEBvbkRpZFNldFRhcmdldCA9PlxuICAgICAgQGZvY3VzSW5wdXQoY2hhcnNNYXg6IDEwKVxuICAgIHN1cGVyXG5cbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgaW5wdXQgPSBAaW5wdXQgb3IgXCJcXFxcblwiXG4gICAgcmVnZXggPSAvLy8je18uZXNjYXBlUmVnRXhwKGlucHV0KX0vLy9nXG4gICAgaWYgQGtlZXBTcGxpdHRlclxuICAgICAgbGluZVNlcGFyYXRvciA9IEBpbnB1dCArIFwiXFxuXCJcbiAgICBlbHNlXG4gICAgICBsaW5lU2VwYXJhdG9yID0gXCJcXG5cIlxuICAgIHRleHQucmVwbGFjZShyZWdleCwgbGluZVNlcGFyYXRvcilcblxuY2xhc3MgU3BsaXRTdHJpbmdXaXRoS2VlcGluZ1NwbGl0dGVyIGV4dGVuZHMgU3BsaXRTdHJpbmdcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIGtlZXBTcGxpdHRlcjogdHJ1ZVxuXG5jbGFzcyBTcGxpdEFyZ3VtZW50cyBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAga2VlcFNlcGFyYXRvcjogdHJ1ZVxuICBhdXRvSW5kZW50QWZ0ZXJJbnNlcnRUZXh0OiB0cnVlXG5cbiAgZ2V0TmV3VGV4dDogKHRleHQpIC0+XG4gICAgYWxsVG9rZW5zID0gc3BsaXRBcmd1bWVudHModGV4dC50cmltKCkpXG4gICAgbmV3VGV4dCA9ICcnXG4gICAgd2hpbGUgYWxsVG9rZW5zLmxlbmd0aFxuICAgICAge3RleHQsIHR5cGV9ID0gYWxsVG9rZW5zLnNoaWZ0KClcbiAgICAgIGlmIHR5cGUgaXMgJ3NlcGFyYXRvcidcbiAgICAgICAgaWYgQGtlZXBTZXBhcmF0b3JcbiAgICAgICAgICB0ZXh0ID0gdGV4dC50cmltKCkgKyBcIlxcblwiXG4gICAgICAgIGVsc2VcbiAgICAgICAgICB0ZXh0ID0gXCJcXG5cIlxuICAgICAgbmV3VGV4dCArPSB0ZXh0XG4gICAgXCJcXG5cIiArIG5ld1RleHQgKyBcIlxcblwiXG5cbmNsYXNzIFNwbGl0QXJndW1lbnRzV2l0aFJlbW92ZVNlcGFyYXRvciBleHRlbmRzIFNwbGl0QXJndW1lbnRzXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBrZWVwU2VwYXJhdG9yOiBmYWxzZVxuXG5jbGFzcyBTcGxpdEFyZ3VtZW50c09mSW5uZXJBbnlQYWlyIGV4dGVuZHMgU3BsaXRBcmd1bWVudHNcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIHRhcmdldDogXCJJbm5lckFueVBhaXJcIlxuXG5jbGFzcyBDaGFuZ2VPcmRlciBleHRlbmRzIFRyYW5zZm9ybVN0cmluZ1xuICBAZXh0ZW5kKGZhbHNlKVxuICBnZXROZXdUZXh0OiAodGV4dCkgLT5cbiAgICBpZiBAdGFyZ2V0LmlzTGluZXdpc2UoKVxuICAgICAgQGdldE5ld0xpc3Qoc3BsaXRUZXh0QnlOZXdMaW5lKHRleHQpKS5qb2luKFwiXFxuXCIpICsgXCJcXG5cIlxuICAgIGVsc2VcbiAgICAgIEBzb3J0QXJndW1lbnRzSW5UZXh0QnkodGV4dCwgKGFyZ3MpID0+IEBnZXROZXdMaXN0KGFyZ3MpKVxuXG4gIHNvcnRBcmd1bWVudHNJblRleHRCeTogKHRleHQsIGZuKSAtPlxuICAgIGxlYWRpbmdTcGFjZXMgPSB0cmFpbGluZ1NwYWNlcyA9ICcnXG4gICAgc3RhcnQgPSB0ZXh0LnNlYXJjaCgvXFxTLylcbiAgICBlbmQgPSB0ZXh0LnNlYXJjaCgvXFxzKiQvKVxuICAgIGxlYWRpbmdTcGFjZXMgPSB0cmFpbGluZ1NwYWNlcyA9ICcnXG4gICAgbGVhZGluZ1NwYWNlcyA9IHRleHRbMC4uLnN0YXJ0XSBpZiBzdGFydCBpc250IC0xXG4gICAgdHJhaWxpbmdTcGFjZXMgPSB0ZXh0W2VuZC4uLl0gaWYgZW5kIGlzbnQgLTFcbiAgICB0ZXh0ID0gdGV4dFtzdGFydC4uLmVuZF1cblxuICAgIGFsbFRva2VucyA9IHNwbGl0QXJndW1lbnRzKHRleHQpXG4gICAgYXJncyA9IGFsbFRva2Vuc1xuICAgICAgLmZpbHRlciAodG9rZW4pIC0+IHRva2VuLnR5cGUgaXMgJ2FyZ3VtZW50J1xuICAgICAgLm1hcCAodG9rZW4pIC0+IHRva2VuLnRleHRcbiAgICBuZXdBcmdzID0gZm4oYXJncylcblxuICAgIG5ld1RleHQgPSAnJ1xuICAgIHdoaWxlIGFsbFRva2Vucy5sZW5ndGhcbiAgICAgIHt0ZXh0LCB0eXBlfSA9IGFsbFRva2Vucy5zaGlmdCgpXG4gICAgICBuZXdUZXh0ICs9IHN3aXRjaCB0eXBlXG4gICAgICAgIHdoZW4gJ3NlcGFyYXRvcicgdGhlbiB0ZXh0XG4gICAgICAgIHdoZW4gJ2FyZ3VtZW50JyB0aGVuIG5ld0FyZ3Muc2hpZnQoKVxuICAgIGxlYWRpbmdTcGFjZXMgKyBuZXdUZXh0ICsgdHJhaWxpbmdTcGFjZXNcblxuY2xhc3MgUmV2ZXJzZSBleHRlbmRzIENoYW5nZU9yZGVyXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBnZXROZXdMaXN0OiAocm93cykgLT5cbiAgICByb3dzLnJldmVyc2UoKVxuXG5jbGFzcyBSZXZlcnNlSW5uZXJBbnlQYWlyIGV4dGVuZHMgUmV2ZXJzZVxuICBAZXh0ZW5kKClcbiAgdGFyZ2V0OiBcIklubmVyQW55UGFpclwiXG5cbmNsYXNzIFJvdGF0ZSBleHRlbmRzIENoYW5nZU9yZGVyXG4gIEBleHRlbmQoKVxuICBAcmVnaXN0ZXJUb1NlbGVjdExpc3QoKVxuICBiYWNrd2FyZHM6IGZhbHNlXG4gIGdldE5ld0xpc3Q6IChyb3dzKSAtPlxuICAgIGlmIEBiYWNrd2FyZHNcbiAgICAgIHJvd3MucHVzaChyb3dzLnNoaWZ0KCkpXG4gICAgZWxzZVxuICAgICAgcm93cy51bnNoaWZ0KHJvd3MucG9wKCkpXG4gICAgcm93c1xuXG5jbGFzcyBSb3RhdGVCYWNrd2FyZHMgZXh0ZW5kcyBDaGFuZ2VPcmRlclxuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgYmFja3dhcmRzOiB0cnVlXG5cbmNsYXNzIFJvdGF0ZUFyZ3VtZW50c09mSW5uZXJQYWlyIGV4dGVuZHMgUm90YXRlXG4gIEBleHRlbmQoKVxuICB0YXJnZXQ6IFwiSW5uZXJBbnlQYWlyXCJcblxuY2xhc3MgUm90YXRlQXJndW1lbnRzQmFja3dhcmRzT2ZJbm5lclBhaXIgZXh0ZW5kcyBSb3RhdGVBcmd1bWVudHNPZklubmVyUGFpclxuICBAZXh0ZW5kKClcbiAgYmFja3dhcmRzOiB0cnVlXG5cbmNsYXNzIFNvcnQgZXh0ZW5kcyBDaGFuZ2VPcmRlclxuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcIlNvcnQgYWxwaGFiZXRpY2FsbHlcIlxuICBnZXROZXdMaXN0OiAocm93cykgLT5cbiAgICByb3dzLnNvcnQoKVxuXG5jbGFzcyBTb3J0Q2FzZUluc2Vuc2l0aXZlbHkgZXh0ZW5kcyBDaGFuZ2VPcmRlclxuICBAZXh0ZW5kKClcbiAgQHJlZ2lzdGVyVG9TZWxlY3RMaXN0KClcbiAgQGRlc2NyaXB0aW9uOiBcIlNvcnQgYWxwaGFiZXRpY2FsbHkgd2l0aCBjYXNlIGluc2Vuc2l0aXZlbHlcIlxuICBnZXROZXdMaXN0OiAocm93cykgLT5cbiAgICByb3dzLnNvcnQgKHJvd0EsIHJvd0IpIC0+XG4gICAgICByb3dBLmxvY2FsZUNvbXBhcmUocm93Qiwgc2Vuc2l0aXZpdHk6ICdiYXNlJylcblxuY2xhc3MgU29ydEJ5TnVtYmVyIGV4dGVuZHMgQ2hhbmdlT3JkZXJcbiAgQGV4dGVuZCgpXG4gIEByZWdpc3RlclRvU2VsZWN0TGlzdCgpXG4gIEBkZXNjcmlwdGlvbjogXCJTb3J0IG51bWVyaWNhbGx5XCJcbiAgZ2V0TmV3TGlzdDogKHJvd3MpIC0+XG4gICAgXy5zb3J0Qnkgcm93cywgKHJvdykgLT5cbiAgICAgIE51bWJlci5wYXJzZUludChyb3cpIG9yIEluZmluaXR5XG4iXX0=
