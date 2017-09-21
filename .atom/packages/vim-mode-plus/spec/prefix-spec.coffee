{getVimState} = require './spec-helper'
settings = require '../lib/settings'

describe "Prefixes", ->
  [set, ensure, keystroke, editor, editorElement, vimState] = []

  beforeEach ->
    getVimState (state, vim) ->
      vimState = state
      {editor, editorElement} = vimState
      {set, ensure, keystroke} = vim

  describe "Repeat", ->
    describe "with operations", ->
      beforeEach ->
        set text: "123456789abc", cursor: [0, 0]

      it "repeats N times", ->
        ensure '3 x', text: '456789abc'

      it "repeats NN times", ->
        ensure '1 0 x', text: 'bc'

    describe "with motions", ->
      beforeEach ->
        set text: 'one two three', cursor: [0, 0]

      it "repeats N times", ->
        ensure 'd 2 w', text: 'three'

    describe "in visual mode", ->
      beforeEach ->
        set text: 'one two three', cursor: [0, 0]

      it "repeats movements in visual mode", ->
        ensure 'v 2 w', cursor: [0, 9]

  describe "Register", ->
    beforeEach ->
      vimState.globalState.reset('register')

    describe "the a register", ->
      it "saves a value for future reading", ->
        set    register: a: text: 'new content'
        ensure register: a: text: 'new content'

      it "overwrites a value previously in the register", ->
        set    register: a: text: 'content'
        set    register: a: text: 'new content'
        ensure register: a: text: 'new content'

    describe "with yank command", ->
      beforeEach ->
        set
          cursor: [0, 0]
          text: """
          aaa bbb ccc
          """
      it "save to pre specified register", ->
        ensure '" a y i w', register: a: text: 'aaa'
        ensure 'w " b y i w', register: b: text: 'bbb'
        ensure 'w " c y i w', register: c: text: 'ccc'

      it "work with motion which also require input such as 't'", ->
        ensure '" a y t c', register: a: text: 'aaa bbb '

    describe "With p command", ->
      beforeEach ->
        vimState.globalState.reset('register')
        set register: a: text: 'new content'
        set
          text: """
          abc
          def
          """
          cursor: [0, 0]

      describe "when specified register have no text", ->
        it "can paste from a register", ->
          ensure mode: "normal"
          ensure '" a p',
            textC: """
            anew conten|tbc
            def
            """

        it "but do nothing for z register", ->
          ensure '" z p',
            textC: """
            |abc
            def
            """

      describe "blockwise-mode paste just use register have no text", ->
        it "paste from a register to each selction", ->
          ensure 'ctrl-v j " a p',
            textC: """
            |new contentbc
            new contentef
            """

    describe "the B register", ->
      it "saves a value for future reading", ->
        set    register: B: text: 'new content'
        ensure register: b: text: 'new content'
        ensure register: B: text: 'new content'

      it "appends to a value previously in the register", ->
        set    register: b: text: 'content'
        set    register: B: text: 'new content'
        ensure register: b: text: 'contentnew content'

      it "appends linewise to a linewise value previously in the register", ->
        set    register: b: text: 'content\n', type: 'linewise'
        set    register: B: text: 'new content'
        ensure register: b: text: 'content\nnew content\n'

      it "appends linewise to a character value previously in the register", ->
        set    register: b: text: 'content'
        set    register: B: text: 'new content\n', type: 'linewise'
        ensure register: b: text: 'content\nnew content\n'

    describe "the * register", ->
      describe "reading", ->
        it "is the same the system clipboard", ->
          ensure register: '*': text: 'initial clipboard content', type: 'characterwise'

      describe "writing", ->
        beforeEach ->
          set register: '*': text: 'new content'

        it "overwrites the contents of the system clipboard", ->
          expect(atom.clipboard.read()).toEqual 'new content'

    # FIXME: once linux support comes out, this needs to read from
    # the correct clipboard. For now it behaves just like the * register
    # See :help x11-cut-buffer and :help registers for more details on how these
    # registers work on an X11 based system.
    describe "the + register", ->
      describe "reading", ->
        it "is the same the system clipboard", ->
          ensure register:
            '*': text: 'initial clipboard content', type: 'characterwise'

      describe "writing", ->
        beforeEach ->
          set register: '*': text: 'new content'

        it "overwrites the contents of the system clipboard", ->
          expect(atom.clipboard.read()).toEqual 'new content'

    describe "the _ register", ->
      describe "reading", ->
        it "is always the empty string", ->
          ensure register: '_': text: ''

      describe "writing", ->
        it "throws away anything written to it", ->
          set register:    '_': text: 'new content'
          ensure register: '_': text: ''

    describe "the % register", ->
      beforeEach ->
        spyOn(editor, 'getURI').andReturn '/Users/atom/known_value.txt'

      describe "reading", ->
        it "returns the filename of the current editor", ->
          ensure register: '%': text: '/Users/atom/known_value.txt'

      describe "writing", ->
        it "throws away anything written to it", ->
          set    register: '%': text: 'new content'
          ensure register: '%': text: '/Users/atom/known_value.txt'

    describe "the numbered 0-9 register", ->
      describe "0", ->
        it "keep most recent yank-ed text", ->
          ensure register: '"': {text: 'initial clipboard content'}, '0': {text: undefined}
          set textC: "|000"
          ensure "y w", register: '"': {text: "000"}, '0': {text: "000"}
          ensure "y l", register: '"': {text: "0"}, '0': {text: "0"}

      describe "1-9 and small-delete(-) register", ->
        beforeEach ->
          set textC: "|0\n1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n"

        it "keep deleted text", ->
          ensure "d d",
            textC:  "|1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n"
            register:
              '"': {text: '0\n'},     '-': {text: undefined},
              '1': {text: '0\n'},     '2': {text: undefined}, '3': {text: undefined},
              '4': {text: undefined}, '5': {text: undefined}, '6': {text: undefined},
              '7': {text: undefined}, '8': {text: undefined}, '9': {text: undefined},
          ensure ".",
            textC:  "|2\n3\n4\n5\n6\n7\n8\n9\n10\n"
            register:
              '"': {text: '1\n'},     '-': {text: undefined},
              '1': {text: '1\n'},     '2': {text: '0\n'}, '3': {text: undefined},
              '4': {text: undefined}, '5': {text: undefined}, '6': {text: undefined},
              '7': {text: undefined}, '8': {text: undefined}, '9': {text: undefined},
          ensure ".",
            textC:  "|3\n4\n5\n6\n7\n8\n9\n10\n"
            register:
              '"': {text: '2\n'}, '-': {text: undefined},
              '1': {text: '2\n'}, '2': {text: '1\n'}, '3': {text: '0\n'},
              '4': {text: undefined}, '5': {text: undefined}, '6': {text: undefined},
              '7': {text: undefined}, '8': {text: undefined}, '9': {text: undefined},
          ensure ".",
            textC:  "|4\n5\n6\n7\n8\n9\n10\n"
            register:
              '"': {text: '3\n'}, '-': {text: undefined},
              '1': {text: '3\n'}, '2': {text: '2\n'}, '3': {text: '1\n'},
              '4': {text: '0\n'}, '5': {text: undefined}, '6': {text: undefined},
              '7': {text: undefined}, '8': {text: undefined}, '9': {text: undefined},
          ensure ".",
            textC:  "|5\n6\n7\n8\n9\n10\n"
            register:
              '"': {text: '4\n'}, '-': {text: undefined},
              '1': {text: '4\n'},     '2': {text: '3\n'},     '3': {text: '2\n'},
              '4': {text: '1\n'},     '5': {text: '0\n'},     '6': {text: undefined},
              '7': {text: undefined}, '8': {text: undefined}, '9': {text: undefined},
          ensure ".",
            textC:  "|6\n7\n8\n9\n10\n"
            register:
              '"': {text: '5\n'}, '-': {text: undefined},
              '1': {text: '5\n'},     '2': {text: '4\n'},     '3': {text: '3\n'},
              '4': {text: '2\n'},     '5': {text: '1\n'},     '6': {text: '0\n'},
              '7': {text: undefined}, '8': {text: undefined}, '9': {text: undefined},
          ensure ".",
            textC:  "|7\n8\n9\n10\n"
            register:
              '"': {text: '6\n'}, '-': {text: undefined},
              '1': {text: '6\n'}, '2': {text: '5\n'},     '3': {text: '4\n'},
              '4': {text: '3\n'}, '5': {text: '2\n'},     '6': {text: '1\n'},
              '7': {text: '0\n'}, '8': {text: undefined}, '9': {text: undefined},
          ensure ".",
            textC:  "|8\n9\n10\n"
            register:
              '"': {text: '7\n'}, '-': {text: undefined},
              '1': {text: '7\n'}, '2': {text: '6\n'}, '3': {text: '5\n'},
              '4': {text: '4\n'}, '5': {text: '3\n'}, '6': {text: '2\n'},
              '7': {text: '1\n'}, '8': {text: '0\n'}, '9': {text: undefined},
          ensure ".",
            textC:  "|9\n10\n"
            register:
              '"': {text: '8\n'}, '-': {text: undefined},
              '1': {text: '8\n'}, '2': {text: '7\n'}, '3': {text: '6\n'},
              '4': {text: '5\n'}, '5': {text: '4\n'}, '6': {text: '3\n'},
              '7': {text: '2\n'}, '8': {text: '1\n'}, '9': {text: '0\n'},
          ensure ".",
            textC:  "|10\n"
            register:
              '"': {text: '9\n'}, '-': {text: undefined},
              '1': {text: '9\n'}, '2': {text: '8\n'}, '3': {text: '7\n'},
              '4': {text: '6\n'}, '5': {text: '5\n'}, '6': {text: '4\n'},
              '7': {text: '3\n'}, '8': {text: '2\n'}, '9': {text: '1\n'}
        it "also keeps changed text", ->
          ensure "c j",
            textC:  "|\n2\n3\n4\n5\n6\n7\n8\n9\n10\n"
            register:
              '"': {text: '0\n1\n'}, '-': {text: undefined},
              '1': {text: '0\n1\n'}, '2': {text: undefined}, '3': {text: undefined},
              '4': {text: undefined}, '5': {text: undefined}, '6': {text: undefined},
              '7': {text: undefined}, '8': {text: undefined}, '9': {text: undefined},

        describe "which goes to numbered and which goes to small-delete register", ->
          beforeEach ->
            set textC: "|{abc}\n"

          it "small-change goes to - register", ->
            ensure "c $",
              textC: "|\n"
              register:
                '"': {text: '{abc}'}, '-': {text: '{abc}'},
                '1': {text: undefined}, '2': {text: undefined}, '3': {text: undefined},
                '4': {text: undefined}, '5': {text: undefined}, '6': {text: undefined},
                '7': {text: undefined}, '8': {text: undefined}, '9': {text: undefined},
          it "small-delete goes to - register", ->
            ensure "d $",
              textC: "|\n"
              register:
                '"': {text: '{abc}'}, '-': {text: '{abc}'},
                '1': {text: undefined}, '2': {text: undefined}, '3': {text: undefined},
                '4': {text: undefined}, '5': {text: undefined}, '6': {text: undefined},
                '7': {text: undefined}, '8': {text: undefined}, '9': {text: undefined},
          it "[exception] % motion always save to numbered", ->
            set textC: "|{abc}\n"
            ensure "d %", textC: "|\n", register: {'"': {text: '{abc}'}, '-': {text: undefined}, '1': {text: '{abc}'}, '2': {text: undefined}}
          it "[exception] / motion always save to numbered", ->
            jasmine.attachToDOM(atom.workspace.getElement())
            set textC: "|{abc}\n"
            ensure "d / } enter",
              textC: "|}\n",
              register: {'"': {text: '{abc'}, '-': {text: undefined}, '1': {text: '{abc'}, '2': {text: undefined}}

          it "/, n motion always save to numbered", ->
            jasmine.attachToDOM(atom.workspace.getElement())
            set textC: "|abc axx abc\n"
            ensure "d / a enter",
              textC: "|axx abc\n",
              register: {'"': {text: 'abc '}, '-': {text: undefined}, '1': {text: 'abc '}, '2': {text: undefined}}
            ensure "d n",
              textC: "|abc\n",
              register: {'"': {text: 'axx '}, '-': {text: undefined}, '1': {text: 'axx '}, '2': {text: 'abc '}}
          it "?, N motion always save to numbered", ->
            jasmine.attachToDOM(atom.workspace.getElement())
            set textC: "abc axx |abc\n"
            ensure "d ? a enter",
              textC: "abc |abc\n",
              register: {'"': {text: 'axx '}, '-': {text: undefined}, '1': {text: 'axx '}, '2': {text: undefined}}
            ensure "0",
              textC: "|abc abc\n",
            ensure "c N",
              textC: "|abc\n",
              register: {'"': {text: 'abc '}, '-': {text: undefined}, '1': {text: 'abc '}, '2': {text: "axx "}}

    describe "the ctrl-r command in insert mode", ->
      beforeEach ->
        set register: '"': text: '345'
        set register: 'a': text: 'abc'
        set register: '*': text: 'abc'
        atom.clipboard.write "clip"
        set text: "012\n", cursor: [0, 2]
        ensure 'i', mode: 'insert'

      describe "useClipboardAsDefaultRegister = true", ->
        beforeEach ->
          settings.set 'useClipboardAsDefaultRegister', true
          set register: '"': text: '345'
          atom.clipboard.write "clip"

        it "inserts contents from clipboard with \"", ->
          ensure 'ctrl-r "', text: '01clip2\n'

      describe "useClipboardAsDefaultRegister = false", ->
        beforeEach ->
          settings.set 'useClipboardAsDefaultRegister', false
          set register: '"': text: '345'
          atom.clipboard.write "clip"

        it "inserts contents from \" with \"", ->
          ensure 'ctrl-r "', text: '013452\n'

      it "inserts contents of the 'a' register", ->
        ensure 'ctrl-r a', text: '01abc2\n'

      it "is cancelled with the escape key", ->
        ensure 'ctrl-r escape',
          text: '012\n'
          mode: 'insert'
          cursor: [0, 2]

    describe "per selection clipboard", ->
      ensurePerSelectionRegister = (texts...) ->
        for selection, i in editor.getSelections()
          ensure register: '*': {text: texts[i], selection: selection}

      beforeEach ->
        settings.set 'useClipboardAsDefaultRegister', true
        set
          text: """
            012:
            abc:
            def:\n
            """
          cursor: [[0, 1], [1, 1], [2, 1]]

      describe "on selection destroye", ->
        it "remove corresponding subscriptin and clipboard entry", ->
          {clipboardBySelection, subscriptionBySelection} = vimState.register
          expect(clipboardBySelection.size).toBe(0)
          expect(subscriptionBySelection.size).toBe(0)

          keystroke "y i w"
          ensurePerSelectionRegister('012', 'abc', 'def')

          expect(clipboardBySelection.size).toBe(3)
          expect(subscriptionBySelection.size).toBe(3)
          selection.destroy() for selection in editor.getSelections()
          expect(clipboardBySelection.size).toBe(0)
          expect(subscriptionBySelection.size).toBe(0)

      describe "Yank", ->
        it "save text to per selection register", ->
          keystroke "y i w"
          ensurePerSelectionRegister('012', 'abc', 'def')

      describe "Delete family", ->
        it "d", ->
          ensure "d i w", text: ":\n:\n:\n"
          ensurePerSelectionRegister('012', 'abc', 'def')
        it "x", ->
          ensure "x", text: "02:\nac:\ndf:\n"
          ensurePerSelectionRegister('1', 'b', 'e')
        it "X", ->
          ensure "X", text: "12:\nbc:\nef:\n"
          ensurePerSelectionRegister('0', 'a', 'd')
        it "D", ->
          ensure "D", text: "0\na\nd\n"
          ensurePerSelectionRegister('12:', 'bc:', 'ef:')

      describe "Put family", ->
        it "p paste text from per selection register", ->
          ensure "y i w $ p",
            text: """
              012:012
              abc:abc
              def:def\n
              """
        it "P paste text from per selection register", ->
          ensure "y i w $ P",
            text: """
              012012:
              abcabc:
              defdef:\n
              """
      describe "ctrl-r in insert mode", ->
        it "insert from per selection registe", ->
          ensure "d i w", text: ":\n:\n:\n"
          ensure 'a', mode: 'insert'
          ensure 'ctrl-r "',
            text: """
              :012
              :abc
              :def\n
              """

  describe "Count modifier", ->
    beforeEach ->
      set
        text: "000 111 222 333 444 555 666 777 888 999"
        cursor: [0, 0]

    it "repeat operator", ->
      ensure '3 d w', text: "333 444 555 666 777 888 999"
    it "repeat motion", ->
      ensure 'd 2 w', text: "222 333 444 555 666 777 888 999"
    it "repeat operator and motion respectively", ->
      ensure '3 d 2 w', text: "666 777 888 999"
