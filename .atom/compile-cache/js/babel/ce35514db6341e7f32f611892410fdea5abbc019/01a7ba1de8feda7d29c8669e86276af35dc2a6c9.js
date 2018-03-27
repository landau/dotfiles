var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _fsPlus = require('fs-plus');

var _fsPlus2 = _interopRequireDefault(_fsPlus);

var _libMain = require('../lib/main');

var _libMain2 = _interopRequireDefault(_libMain);

var _libMinimap = require('../lib/minimap');

var _libMinimap2 = _interopRequireDefault(_libMinimap);

var _libMinimapElement = require('../lib/minimap-element');

var _libMinimapElement2 = _interopRequireDefault(_libMinimapElement);

var _helpersWorkspace = require('./helpers/workspace');

var _helpersEvents = require('./helpers/events');

'use babel';

function realOffsetTop(o) {
  // transform = new WebKitCSSMatrix window.getComputedStyle(o).transform
  // o.offsetTop + transform.m42
  return o.offsetTop;
}

function realOffsetLeft(o) {
  // transform = new WebKitCSSMatrix window.getComputedStyle(o).transform
  // o.offsetLeft + transform.m41
  return o.offsetLeft;
}

function sleep(duration) {
  var t = new Date();
  waitsFor(duration + 'ms', function () {
    return new Date() - t > duration;
  });
}

function createPlugin() {
  var plugin = {
    active: false,
    activatePlugin: function activatePlugin() {
      this.active = true;
    },
    deactivatePlugin: function deactivatePlugin() {
      this.active = false;
    },
    isActive: function isActive() {
      return this.active;
    }
  };
  return plugin;
}

describe('MinimapElement', function () {
  var _ref = [];
  var editor = _ref[0];
  var minimap = _ref[1];
  var largeSample = _ref[2];
  var mediumSample = _ref[3];
  var smallSample = _ref[4];
  var jasmineContent = _ref[5];
  var editorElement = _ref[6];
  var minimapElement = _ref[7];
  var dir = _ref[8];

  beforeEach(function () {
    // Comment after body below to leave the created text editor and minimap
    // on DOM after the test run.
    jasmineContent = document.body.querySelector('#jasmine-content');

    atom.config.set('minimap.charHeight', 4);
    atom.config.set('minimap.charWidth', 2);
    atom.config.set('minimap.interline', 1);
    atom.config.set('minimap.textOpacity', 1);
    atom.config.set('minimap.smoothScrolling', true);
    atom.config.set('minimap.adjustMinimapWidthOnlyIfSmaller', true);
    atom.config.set('minimap.plugins', {});

    _libMinimapElement2['default'].registerViewProvider(_libMinimap2['default']);

    editor = atom.workspace.buildTextEditor({});
    editorElement = atom.views.getView(editor);
    jasmineContent.insertBefore(editorElement, jasmineContent.firstChild);
    editorElement.setHeight(50);

    minimap = new _libMinimap2['default']({ textEditor: editor });
    dir = atom.project.getDirectories()[0];

    largeSample = _fsPlus2['default'].readFileSync(dir.resolve('large-file.coffee')).toString();
    mediumSample = _fsPlus2['default'].readFileSync(dir.resolve('two-hundred.txt')).toString();
    smallSample = _fsPlus2['default'].readFileSync(dir.resolve('sample.coffee')).toString();

    editor.setText(largeSample);

    minimapElement = atom.views.getView(minimap);
  });

  it('has been registered in the view registry', function () {
    expect(minimapElement).toExist();
  });

  it('has stored the minimap as its model', function () {
    expect(minimapElement.getModel()).toBe(minimap);
  });

  it('has a canvas in a shadow DOM', function () {
    expect(minimapElement.shadowRoot.querySelector('canvas')).toExist();
  });

  it('has a div representing the visible area', function () {
    expect(minimapElement.shadowRoot.querySelector('.minimap-visible-area')).toExist();
  });

  //       ###    ######## ########    ###     ######  ##     ##
  //      ## ##      ##       ##      ## ##   ##    ## ##     ##
  //     ##   ##     ##       ##     ##   ##  ##       ##     ##
  //    ##     ##    ##       ##    ##     ## ##       #########
  //    #########    ##       ##    ######### ##       ##     ##
  //    ##     ##    ##       ##    ##     ## ##    ## ##     ##
  //    ##     ##    ##       ##    ##     ##  ######  ##     ##

  describe('when attached to the text editor element', function () {
    var _ref2 = [];
    var noAnimationFrame = _ref2[0];
    var nextAnimationFrame = _ref2[1];
    var requestAnimationFrameSafe = _ref2[2];
    var canvas = _ref2[3];
    var visibleArea = _ref2[4];

    beforeEach(function () {
      noAnimationFrame = function () {
        throw new Error('No animation frame requested');
      };
      nextAnimationFrame = noAnimationFrame;

      requestAnimationFrameSafe = window.requestAnimationFrame;
      spyOn(window, 'requestAnimationFrame').andCallFake(function (fn) {
        nextAnimationFrame = function () {
          nextAnimationFrame = noAnimationFrame;
          fn();
        };
      });
    });

    beforeEach(function () {
      canvas = minimapElement.shadowRoot.querySelector('canvas');
      editorElement.setWidth(200);
      editorElement.setHeight(50);

      editorElement.setScrollTop(1000);
      editorElement.setScrollLeft(200);
      minimapElement.attach();
    });

    afterEach(function () {
      minimap.destroy();
      window.requestAnimationFrame = requestAnimationFrameSafe;
    });

    it('adds a with-minimap attribute on the text editor element', function () {
      expect(editorElement.hasAttribute('with-minimap')).toBeTruthy();
    });

    it('takes the height of the editor', function () {
      expect(minimapElement.offsetHeight).toEqual(editorElement.clientHeight);

      expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.clientWidth / 10, 0);
    });

    it('knows when attached to a text editor', function () {
      expect(minimapElement.attachedToTextEditor).toBeTruthy();
    });

    it('resizes the canvas to fit the minimap', function () {
      expect(canvas.offsetHeight / devicePixelRatio).toBeCloseTo(minimapElement.offsetHeight + minimap.getLineHeight(), 0);
      expect(canvas.offsetWidth / devicePixelRatio).toBeCloseTo(minimapElement.offsetWidth, 0);
    });

    it('requests an update', function () {
      expect(minimapElement.frameRequested).toBeTruthy();
    });

    describe('when detached', function () {
      it('removes the attribute from the editor', function () {
        minimapElement.detach();

        expect(editorElement.hasAttribute('with-minimap')).toBeFalsy();
      });
    });

    //     ######   ######   ######
    //    ##    ## ##    ## ##    ##
    //    ##       ##       ##
    //    ##        ######   ######
    //    ##             ##       ##
    //    ##    ## ##    ## ##    ##
    //     ######   ######   ######

    describe('with css filters', function () {
      describe('when a hue-rotate filter is applied to a rgb color', function () {
        var _ref3 = [];
        var additionnalStyleNode = _ref3[0];

        beforeEach(function () {
          minimapElement.invalidateDOMStylesCache();

          additionnalStyleNode = document.createElement('style');
          additionnalStyleNode.textContent = '\n            ' + _helpersWorkspace.stylesheet + '\n\n            .editor {\n              color: red;\n              -webkit-filter: hue-rotate(180deg);\n            }\n          ';

          jasmineContent.appendChild(additionnalStyleNode);
        });

        it('computes the new color by applying the hue rotation', function () {
          waitsFor('new animation frame', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
            expect(minimapElement.retrieveStyleFromDom(['.editor'], 'color')).toEqual('rgb(0, ' + 0x6d + ', ' + 0x6d + ')');
          });
        });
      });

      describe('when a hue-rotate filter is applied to a rgba color', function () {
        var _ref4 = [];
        var additionnalStyleNode = _ref4[0];

        beforeEach(function () {
          minimapElement.invalidateDOMStylesCache();

          additionnalStyleNode = document.createElement('style');
          additionnalStyleNode.textContent = '\n            ' + _helpersWorkspace.stylesheet + '\n\n            .editor {\n              color: rgba(255, 0, 0, 0);\n              -webkit-filter: hue-rotate(180deg);\n            }\n          ';

          jasmineContent.appendChild(additionnalStyleNode);
        });

        it('computes the new color by applying the hue rotation', function () {
          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
            expect(minimapElement.retrieveStyleFromDom(['.editor'], 'color')).toEqual('rgba(0, ' + 0x6d + ', ' + 0x6d + ', 0)');
          });
        });
      });
    });

    //    ##     ## ########  ########     ###    ######## ########
    //    ##     ## ##     ## ##     ##   ## ##      ##    ##
    //    ##     ## ##     ## ##     ##  ##   ##     ##    ##
    //    ##     ## ########  ##     ## ##     ##    ##    ######
    //    ##     ## ##        ##     ## #########    ##    ##
    //    ##     ## ##        ##     ## ##     ##    ##    ##
    //     #######  ##        ########  ##     ##    ##    ########

    describe('when the update is performed', function () {
      beforeEach(function () {
        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();
          visibleArea = minimapElement.shadowRoot.querySelector('.minimap-visible-area');
        });
      });

      it('sets the visible area width and height', function () {
        expect(visibleArea.offsetWidth).toEqual(minimapElement.clientWidth);
        expect(visibleArea.offsetHeight).toBeCloseTo(minimap.getTextEditorScaledHeight(), 0);
      });

      it('sets the visible visible area offset', function () {
        expect(realOffsetTop(visibleArea)).toBeCloseTo(minimap.getTextEditorScaledScrollTop() - minimap.getScrollTop(), 0);
        expect(realOffsetLeft(visibleArea)).toBeCloseTo(minimap.getTextEditorScaledScrollLeft(), 0);
      });

      it('offsets the canvas when the scroll does not match line height', function () {
        editorElement.setScrollTop(1004);

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(realOffsetTop(canvas)).toBeCloseTo(-2, -1);
        });
      });

      it('does not fail to update render the invisible char when modified', function () {
        atom.config.set('editor.showInvisibles', true);
        atom.config.set('editor.invisibles', { cr: '*' });

        expect(function () {
          nextAnimationFrame();
        }).not.toThrow();
      });

      it('renders the decorations based on the order settings', function () {
        atom.config.set('minimap.displayPluginsControls', true);

        var pluginFoo = createPlugin();
        var pluginBar = createPlugin();

        _libMain2['default'].registerPlugin('foo', pluginFoo);
        _libMain2['default'].registerPlugin('bar', pluginBar);

        atom.config.set('minimap.plugins.fooDecorationsZIndex', 1);

        var calls = [];
        spyOn(minimapElement, 'drawLineDecoration').andCallFake(function (d) {
          calls.push(d.getProperties().plugin);
        });
        spyOn(minimapElement, 'drawHighlightDecoration').andCallFake(function (d) {
          calls.push(d.getProperties().plugin);
        });

        minimap.decorateMarker(editor.markBufferRange([[1, 0], [1, 10]]), { type: 'line', color: '#0000FF', plugin: 'bar' });
        minimap.decorateMarker(editor.markBufferRange([[1, 0], [1, 10]]), { type: 'highlight-under', color: '#0000FF', plugin: 'foo' });

        editorElement.setScrollTop(0);

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(calls).toEqual(['bar', 'foo']);

          atom.config.set('minimap.plugins.fooDecorationsZIndex', -1);

          calls.length = 0;
        });

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });

        runs(function () {
          nextAnimationFrame();

          expect(calls).toEqual(['foo', 'bar']);

          _libMain2['default'].unregisterPlugin('foo');
          _libMain2['default'].unregisterPlugin('bar');
        });
      });

      it('renders the visible line decorations', function () {
        spyOn(minimapElement, 'drawLineDecoration').andCallThrough();

        minimap.decorateMarker(editor.markBufferRange([[1, 0], [1, 10]]), { type: 'line', color: '#0000FF' });
        minimap.decorateMarker(editor.markBufferRange([[10, 0], [10, 10]]), { type: 'line', color: '#0000FF' });
        minimap.decorateMarker(editor.markBufferRange([[100, 0], [100, 10]]), { type: 'line', color: '#0000FF' });

        editorElement.setScrollTop(0);

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(minimapElement.drawLineDecoration).toHaveBeenCalled();
          expect(minimapElement.drawLineDecoration.calls.length).toEqual(2);
        });
      });

      it('renders the visible gutter decorations', function () {
        spyOn(minimapElement, 'drawGutterDecoration').andCallThrough();

        minimap.decorateMarker(editor.markBufferRange([[1, 0], [1, 10]]), { type: 'gutter', color: '#0000FF' });
        minimap.decorateMarker(editor.markBufferRange([[10, 0], [10, 10]]), { type: 'gutter', color: '#0000FF' });
        minimap.decorateMarker(editor.markBufferRange([[100, 0], [100, 10]]), { type: 'gutter', color: '#0000FF' });

        editorElement.setScrollTop(0);

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(minimapElement.drawGutterDecoration).toHaveBeenCalled();
          expect(minimapElement.drawGutterDecoration.calls.length).toEqual(2);
        });
      });

      it('renders the visible highlight decorations', function () {
        spyOn(minimapElement, 'drawHighlightDecoration').andCallThrough();

        minimap.decorateMarker(editor.markBufferRange([[1, 0], [1, 4]]), { type: 'highlight-under', color: '#0000FF' });
        minimap.decorateMarker(editor.markBufferRange([[2, 20], [2, 30]]), { type: 'highlight-over', color: '#0000FF' });
        minimap.decorateMarker(editor.markBufferRange([[100, 3], [100, 5]]), { type: 'highlight-under', color: '#0000FF' });

        editorElement.setScrollTop(0);

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(minimapElement.drawHighlightDecoration).toHaveBeenCalled();
          expect(minimapElement.drawHighlightDecoration.calls.length).toEqual(2);
        });
      });

      it('renders the visible outline decorations', function () {
        spyOn(minimapElement, 'drawHighlightOutlineDecoration').andCallThrough();

        minimap.decorateMarker(editor.markBufferRange([[1, 4], [3, 6]]), { type: 'highlight-outline', color: '#0000ff' });
        minimap.decorateMarker(editor.markBufferRange([[6, 0], [6, 7]]), { type: 'highlight-outline', color: '#0000ff' });
        minimap.decorateMarker(editor.markBufferRange([[100, 3], [100, 5]]), { type: 'highlight-outline', color: '#0000ff' });

        editorElement.setScrollTop(0);

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(minimapElement.drawHighlightOutlineDecoration).toHaveBeenCalled();
          expect(minimapElement.drawHighlightOutlineDecoration.calls.length).toEqual(4);
        });
      });

      it('renders the visible custom foreground decorations', function () {
        spyOn(minimapElement, 'drawCustomDecoration').andCallThrough();

        var renderRoutine = jasmine.createSpy('renderRoutine');

        var properties = {
          type: 'foreground-custom',
          render: renderRoutine
        };

        minimap.decorateMarker(editor.markBufferRange([[1, 4], [3, 6]]), properties);
        minimap.decorateMarker(editor.markBufferRange([[6, 0], [6, 7]]), properties);
        minimap.decorateMarker(editor.markBufferRange([[100, 3], [100, 5]]), properties);

        editorElement.setScrollTop(0);

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(minimapElement.drawCustomDecoration).toHaveBeenCalled();
          expect(minimapElement.drawCustomDecoration.calls.length).toEqual(4);

          expect(renderRoutine).toHaveBeenCalled();
          expect(renderRoutine.calls.length).toEqual(4);
        });
      });

      it('renders the visible custom background decorations', function () {
        spyOn(minimapElement, 'drawCustomDecoration').andCallThrough();

        var renderRoutine = jasmine.createSpy('renderRoutine');

        var properties = {
          type: 'background-custom',
          render: renderRoutine
        };

        minimap.decorateMarker(editor.markBufferRange([[1, 4], [3, 6]]), properties);
        minimap.decorateMarker(editor.markBufferRange([[6, 0], [6, 7]]), properties);
        minimap.decorateMarker(editor.markBufferRange([[100, 3], [100, 5]]), properties);

        editorElement.setScrollTop(0);

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(minimapElement.drawCustomDecoration).toHaveBeenCalled();
          expect(minimapElement.drawCustomDecoration.calls.length).toEqual(4);

          expect(renderRoutine).toHaveBeenCalled();
          expect(renderRoutine.calls.length).toEqual(4);
        });
      });

      describe('when the editor is scrolled', function () {
        beforeEach(function () {
          editorElement.setScrollTop(2000);
          editorElement.setScrollLeft(50);

          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('updates the visible area', function () {
          expect(realOffsetTop(visibleArea)).toBeCloseTo(minimap.getTextEditorScaledScrollTop() - minimap.getScrollTop(), 0);
          expect(realOffsetLeft(visibleArea)).toBeCloseTo(minimap.getTextEditorScaledScrollLeft(), 0);
        });
      });

      describe('when the editor is resized to a greater size', function () {
        beforeEach(function () {
          editorElement.style.width = '800px';
          editorElement.style.height = '500px';

          minimapElement.measureHeightAndWidth();

          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('detects the resize and adjust itself', function () {
          expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.offsetWidth / 10, 0);
          expect(minimapElement.offsetHeight).toEqual(editorElement.offsetHeight);

          expect(canvas.offsetWidth / devicePixelRatio).toBeCloseTo(minimapElement.offsetWidth, 0);
          expect(canvas.offsetHeight / devicePixelRatio).toBeCloseTo(minimapElement.offsetHeight + minimap.getLineHeight(), 0);
        });
      });

      describe('when the editor visible content is changed', function () {
        beforeEach(function () {
          editorElement.setScrollLeft(0);
          editorElement.setScrollTop(1400);
          editor.setSelectedBufferRange([[101, 0], [102, 20]]);

          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();

            spyOn(minimapElement, 'drawLines').andCallThrough();
            editor.insertText('foo');
          });
        });

        it('rerenders the part that have changed', function () {
          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();

            expect(minimapElement.drawLines).toHaveBeenCalled();

            var _minimapElement$drawLines$argsForCall$0 = _slicedToArray(minimapElement.drawLines.argsForCall[0], 2);

            var firstLine = _minimapElement$drawLines$argsForCall$0[0];
            var lastLine = _minimapElement$drawLines$argsForCall$0[1];

            expect(firstLine).toEqual(100);
            expect(lastLine === 102 || lastLine === 111).toBeTruthy();
          });
        });
      });

      describe('when the editor visibility change', function () {
        it('does not modify the size of the canvas', function () {
          var canvasWidth = minimapElement.getFrontCanvas().width;
          var canvasHeight = minimapElement.getFrontCanvas().height;
          editorElement.style.display = 'none';

          minimapElement.measureHeightAndWidth();

          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();

            expect(minimapElement.getFrontCanvas().width).toEqual(canvasWidth);
            expect(minimapElement.getFrontCanvas().height).toEqual(canvasHeight);
          });
        });

        describe('from hidden to visible', function () {
          beforeEach(function () {
            editorElement.style.display = 'none';
            minimapElement.checkForVisibilityChange();
            spyOn(minimapElement, 'requestForcedUpdate');
            editorElement.style.display = '';
            minimapElement.pollDOM();
          });

          it('requests an update of the whole minimap', function () {
            expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
          });
        });
      });
    });

    //     ######   ######  ########   #######  ##       ##
    //    ##    ## ##    ## ##     ## ##     ## ##       ##
    //    ##       ##       ##     ## ##     ## ##       ##
    //     ######  ##       ########  ##     ## ##       ##
    //          ## ##       ##   ##   ##     ## ##       ##
    //    ##    ## ##    ## ##    ##  ##     ## ##       ##
    //     ######   ######  ##     ##  #######  ######## ########

    describe('mouse scroll controls', function () {
      beforeEach(function () {
        editorElement.setWidth(400);
        editorElement.setHeight(400);
        editorElement.setScrollTop(0);
        editorElement.setScrollLeft(0);

        nextAnimationFrame();

        minimapElement.measureHeightAndWidth();

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();
        });
      });

      describe('using the mouse scrollwheel over the minimap', function () {
        it('relays the events to the editor view', function () {
          spyOn(editorElement.component.presenter, 'setScrollTop').andCallFake(function () {});

          (0, _helpersEvents.mousewheel)(minimapElement, 0, 15);

          expect(editorElement.component.presenter.setScrollTop).toHaveBeenCalled();
        });

        describe('when the independentMinimapScroll setting is true', function () {
          var previousScrollTop = undefined;

          beforeEach(function () {
            atom.config.set('minimap.independentMinimapScroll', true);
            atom.config.set('minimap.scrollSensitivity', 0.5);

            spyOn(editorElement.component.presenter, 'setScrollTop').andCallFake(function () {});

            previousScrollTop = minimap.getScrollTop();

            (0, _helpersEvents.mousewheel)(minimapElement, 0, -15);
          });

          it('does not relay the events to the editor', function () {
            expect(editorElement.component.presenter.setScrollTop).not.toHaveBeenCalled();
          });

          it('scrolls the minimap instead', function () {
            expect(minimap.getScrollTop()).not.toEqual(previousScrollTop);
          });

          it('clamp the minimap scroll into the legit bounds', function () {
            (0, _helpersEvents.mousewheel)(minimapElement, 0, -100000);

            expect(minimap.getScrollTop()).toEqual(minimap.getMaxScrollTop());

            (0, _helpersEvents.mousewheel)(minimapElement, 0, 100000);

            expect(minimap.getScrollTop()).toEqual(0);
          });
        });
      });

      describe('middle clicking the minimap', function () {
        var _ref5 = [];
        var canvas = _ref5[0];
        var visibleArea = _ref5[1];
        var originalLeft = _ref5[2];
        var maxScroll = _ref5[3];

        beforeEach(function () {
          canvas = minimapElement.getFrontCanvas();
          visibleArea = minimapElement.visibleArea;
          originalLeft = visibleArea.getBoundingClientRect().left;
          maxScroll = minimap.getTextEditorMaxScrollTop();
        });

        it('scrolls to the top using the middle mouse button', function () {
          (0, _helpersEvents.mousedown)(canvas, { x: originalLeft + 1, y: 0, btn: 1 });
          expect(editorElement.getScrollTop()).toEqual(0);
        });

        describe('scrolling to the middle using the middle mouse button', function () {
          var canvasMidY = undefined;

          beforeEach(function () {
            var editorMidY = editorElement.getHeight() / 2.0;

            var _canvas$getBoundingClientRect = canvas.getBoundingClientRect();

            var top = _canvas$getBoundingClientRect.top;
            var height = _canvas$getBoundingClientRect.height;

            canvasMidY = top + height / 2.0;
            var actualMidY = Math.min(canvasMidY, editorMidY);
            (0, _helpersEvents.mousedown)(canvas, { x: originalLeft + 1, y: actualMidY, btn: 1 });
          });

          it('scrolls the editor to the middle', function () {
            var middleScrollTop = Math.round(maxScroll / 2.0);
            expect(editorElement.getScrollTop()).toEqual(middleScrollTop);
          });

          it('updates the visible area to be centered', function () {
            waitsFor('a new animation frame request', function () {
              return nextAnimationFrame !== noAnimationFrame;
            });
            runs(function () {
              nextAnimationFrame();

              var _visibleArea$getBoundingClientRect = visibleArea.getBoundingClientRect();

              var top = _visibleArea$getBoundingClientRect.top;
              var height = _visibleArea$getBoundingClientRect.height;

              var visibleCenterY = top + height / 2;
              expect(visibleCenterY).toBeCloseTo(200, 0);
            });
          });
        });

        describe('scrolling the editor to an arbitrary location', function () {
          var _ref6 = [];
          var scrollTo = _ref6[0];
          var scrollRatio = _ref6[1];

          beforeEach(function () {
            scrollTo = 101; // pixels
            scrollRatio = (scrollTo - minimap.getTextEditorScaledHeight() / 2) / (minimap.getVisibleHeight() - minimap.getTextEditorScaledHeight());
            scrollRatio = Math.max(0, scrollRatio);
            scrollRatio = Math.min(1, scrollRatio);

            (0, _helpersEvents.mousedown)(canvas, { x: originalLeft + 1, y: scrollTo, btn: 1 });

            waitsFor('a new animation frame request', function () {
              return nextAnimationFrame !== noAnimationFrame;
            });
            runs(function () {
              nextAnimationFrame();
            });
          });

          it('scrolls the editor to an arbitrary location', function () {
            var expectedScroll = maxScroll * scrollRatio;
            expect(editorElement.getScrollTop()).toBeCloseTo(expectedScroll, 0);
          });

          describe('dragging the visible area with middle mouse button ' + 'after scrolling to the arbitrary location', function () {
            var _ref7 = [];
            var originalTop = _ref7[0];

            beforeEach(function () {
              originalTop = visibleArea.getBoundingClientRect().top;
              (0, _helpersEvents.mousemove)(visibleArea, { x: originalLeft + 1, y: scrollTo + 40, btn: 1 });

              waitsFor('a new animation frame request', function () {
                return nextAnimationFrame !== noAnimationFrame;
              });
              runs(function () {
                nextAnimationFrame();
              });
            });

            afterEach(function () {
              minimapElement.endDrag();
            });

            it('scrolls the editor so that the visible area was moved down ' + 'by 40 pixels from the arbitrary location', function () {
              var _visibleArea$getBoundingClientRect2 = visibleArea.getBoundingClientRect();

              var top = _visibleArea$getBoundingClientRect2.top;

              expect(top).toBeCloseTo(originalTop + 40, -1);
            });
          });
        });
      });

      describe('pressing the mouse on the minimap canvas (without scroll animation)', function () {
        var canvas = undefined;

        beforeEach(function () {
          var t = 0;
          spyOn(minimapElement, 'getTime').andCallFake(function () {
            var n = t;
            t += 100;
            return n;
          });
          spyOn(minimapElement, 'requestUpdate').andCallFake(function () {});

          atom.config.set('minimap.scrollAnimation', false);

          canvas = minimapElement.getFrontCanvas();
        });

        it('scrolls the editor to the line below the mouse', function () {
          (0, _helpersEvents.mousedown)(canvas);
          expect(editorElement.getScrollTop()).toBeCloseTo(480);
        });

        describe('when independentMinimapScroll setting is enabled', function () {
          beforeEach(function () {
            minimap.setScrollTop(1000);
            atom.config.set('minimap.independentMinimapScroll', true);
          });

          it('scrolls the editor to the line below the mouse', function () {
            (0, _helpersEvents.mousedown)(canvas);
            expect(editorElement.getScrollTop()).toBeCloseTo(480);
          });
        });
      });

      describe('pressing the mouse on the minimap canvas (with scroll animation)', function () {
        var canvas = undefined;

        beforeEach(function () {
          var t = 0;
          spyOn(minimapElement, 'getTime').andCallFake(function () {
            var n = t;
            t += 100;
            return n;
          });
          spyOn(minimapElement, 'requestUpdate').andCallFake(function () {});

          atom.config.set('minimap.scrollAnimation', true);
          atom.config.set('minimap.scrollAnimationDuration', 300);

          canvas = minimapElement.getFrontCanvas();
        });

        it('scrolls the editor gradually to the line below the mouse', function () {
          (0, _helpersEvents.mousedown)(canvas);
          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          // wait until all animations run out
          waitsFor(function () {
            nextAnimationFrame !== noAnimationFrame && nextAnimationFrame();
            return editorElement.getScrollTop() >= 480;
          });
        });

        it('stops the animation if the text editor is destroyed', function () {
          (0, _helpersEvents.mousedown)(canvas);
          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });

          runs(function () {
            editor.destroy();

            nextAnimationFrame !== noAnimationFrame && nextAnimationFrame();

            expect(nextAnimationFrame === noAnimationFrame);
          });
        });

        describe('when independentMinimapScroll setting is enabled', function () {
          beforeEach(function () {
            minimap.setScrollTop(1000);
            atom.config.set('minimap.independentMinimapScroll', true);
          });

          it('scrolls the editor gradually to the line below the mouse', function () {
            (0, _helpersEvents.mousedown)(canvas);
            waitsFor('a new animation frame request', function () {
              return nextAnimationFrame !== noAnimationFrame;
            });
            // wait until all animations run out
            waitsFor(function () {
              nextAnimationFrame !== noAnimationFrame && nextAnimationFrame();
              return editorElement.getScrollTop() >= 480;
            });
          });

          it('stops the animation if the text editor is destroyed', function () {
            (0, _helpersEvents.mousedown)(canvas);
            waitsFor('a new animation frame request', function () {
              return nextAnimationFrame !== noAnimationFrame;
            });

            runs(function () {
              editor.destroy();

              nextAnimationFrame !== noAnimationFrame && nextAnimationFrame();

              expect(nextAnimationFrame === noAnimationFrame);
            });
          });
        });
      });

      describe('dragging the visible area', function () {
        var _ref8 = [];
        var visibleArea = _ref8[0];
        var originalTop = _ref8[1];

        beforeEach(function () {
          visibleArea = minimapElement.visibleArea;
          var o = visibleArea.getBoundingClientRect();
          var left = o.left;
          originalTop = o.top;

          (0, _helpersEvents.mousedown)(visibleArea, { x: left + 10, y: originalTop + 10 });
          (0, _helpersEvents.mousemove)(visibleArea, { x: left + 10, y: originalTop + 50 });

          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        afterEach(function () {
          minimapElement.endDrag();
        });

        it('scrolls the editor so that the visible area was moved down by 40 pixels', function () {
          var _visibleArea$getBoundingClientRect3 = visibleArea.getBoundingClientRect();

          var top = _visibleArea$getBoundingClientRect3.top;

          expect(top).toBeCloseTo(originalTop + 40, -1);
        });

        it('stops the drag gesture when the mouse is released outside the minimap', function () {
          var _visibleArea$getBoundingClientRect4 = visibleArea.getBoundingClientRect();

          var top = _visibleArea$getBoundingClientRect4.top;
          var left = _visibleArea$getBoundingClientRect4.left;

          (0, _helpersEvents.mouseup)(jasmineContent, { x: left - 10, y: top + 80 });

          spyOn(minimapElement, 'drag');
          (0, _helpersEvents.mousemove)(visibleArea, { x: left + 10, y: top + 50 });

          expect(minimapElement.drag).not.toHaveBeenCalled();
        });
      });

      describe('dragging the visible area using touch events', function () {
        var _ref9 = [];
        var visibleArea = _ref9[0];
        var originalTop = _ref9[1];

        beforeEach(function () {
          visibleArea = minimapElement.visibleArea;
          var o = visibleArea.getBoundingClientRect();
          var left = o.left;
          originalTop = o.top;

          (0, _helpersEvents.touchstart)(visibleArea, { x: left + 10, y: originalTop + 10 });
          (0, _helpersEvents.touchmove)(visibleArea, { x: left + 10, y: originalTop + 50 });

          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        afterEach(function () {
          minimapElement.endDrag();
        });

        it('scrolls the editor so that the visible area was moved down by 40 pixels', function () {
          var _visibleArea$getBoundingClientRect5 = visibleArea.getBoundingClientRect();

          var top = _visibleArea$getBoundingClientRect5.top;

          expect(top).toBeCloseTo(originalTop + 40, -1);
        });

        it('stops the drag gesture when the mouse is released outside the minimap', function () {
          var _visibleArea$getBoundingClientRect6 = visibleArea.getBoundingClientRect();

          var top = _visibleArea$getBoundingClientRect6.top;
          var left = _visibleArea$getBoundingClientRect6.left;

          (0, _helpersEvents.mouseup)(jasmineContent, { x: left - 10, y: top + 80 });

          spyOn(minimapElement, 'drag');
          (0, _helpersEvents.touchmove)(visibleArea, { x: left + 10, y: top + 50 });

          expect(minimapElement.drag).not.toHaveBeenCalled();
        });
      });

      describe('when the minimap cannot scroll', function () {
        var _ref10 = [];
        var visibleArea = _ref10[0];
        var originalTop = _ref10[1];

        beforeEach(function () {
          var sample = _fsPlus2['default'].readFileSync(dir.resolve('seventy.txt')).toString();
          editor.setText(sample);
          editorElement.setScrollTop(0);
        });

        describe('dragging the visible area', function () {
          beforeEach(function () {
            waitsFor('a new animation frame request', function () {
              return nextAnimationFrame !== noAnimationFrame;
            });
            runs(function () {
              nextAnimationFrame();

              visibleArea = minimapElement.visibleArea;

              var _visibleArea$getBoundingClientRect7 = visibleArea.getBoundingClientRect();

              var top = _visibleArea$getBoundingClientRect7.top;
              var left = _visibleArea$getBoundingClientRect7.left;

              originalTop = top;

              (0, _helpersEvents.mousedown)(visibleArea, { x: left + 10, y: top + 10 });
              (0, _helpersEvents.mousemove)(visibleArea, { x: left + 10, y: top + 50 });
            });

            waitsFor('a new animation frame request', function () {
              return nextAnimationFrame !== noAnimationFrame;
            });
            runs(function () {
              nextAnimationFrame();
            });
          });

          afterEach(function () {
            minimapElement.endDrag();
          });

          it('scrolls based on a ratio adjusted to the minimap height', function () {
            var _visibleArea$getBoundingClientRect8 = visibleArea.getBoundingClientRect();

            var top = _visibleArea$getBoundingClientRect8.top;

            expect(top).toBeCloseTo(originalTop + 40, -1);
          });
        });
      });

      describe('when scroll past end is enabled', function () {
        beforeEach(function () {
          atom.config.set('editor.scrollPastEnd', true);

          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        describe('dragging the visible area', function () {
          var _ref11 = [];
          var originalTop = _ref11[0];
          var visibleArea = _ref11[1];

          beforeEach(function () {
            visibleArea = minimapElement.visibleArea;

            var _visibleArea$getBoundingClientRect9 = visibleArea.getBoundingClientRect();

            var top = _visibleArea$getBoundingClientRect9.top;
            var left = _visibleArea$getBoundingClientRect9.left;

            originalTop = top;

            (0, _helpersEvents.mousedown)(visibleArea, { x: left + 10, y: top + 10 });
            (0, _helpersEvents.mousemove)(visibleArea, { x: left + 10, y: top + 50 });

            waitsFor('a new animation frame request', function () {
              return nextAnimationFrame !== noAnimationFrame;
            });
            runs(function () {
              nextAnimationFrame();
            });
          });

          afterEach(function () {
            minimapElement.endDrag();
          });

          it('scrolls the editor so that the visible area was moved down by 40 pixels', function () {
            var _visibleArea$getBoundingClientRect10 = visibleArea.getBoundingClientRect();

            var top = _visibleArea$getBoundingClientRect10.top;

            expect(top).toBeCloseTo(originalTop + 40, -1);
          });
        });
      });
    });

    //     ######  ########    ###    ##    ## ########
    //    ##    ##    ##      ## ##   ###   ## ##     ##
    //    ##          ##     ##   ##  ####  ## ##     ##
    //     ######     ##    ##     ## ## ## ## ##     ##
    //          ##    ##    ######### ##  #### ##     ##
    //    ##    ##    ##    ##     ## ##   ### ##     ##
    //     ######     ##    ##     ## ##    ## ########
    //
    //       ###    ##        #######  ##    ## ########
    //      ## ##   ##       ##     ## ###   ## ##
    //     ##   ##  ##       ##     ## ####  ## ##
    //    ##     ## ##       ##     ## ## ## ## ######
    //    ######### ##       ##     ## ##  #### ##
    //    ##     ## ##       ##     ## ##   ### ##
    //    ##     ## ########  #######  ##    ## ########

    describe('when the model is a stand-alone minimap', function () {
      beforeEach(function () {
        minimap.setStandAlone(true);
      });

      it('has a stand-alone attribute', function () {
        expect(minimapElement.hasAttribute('stand-alone')).toBeTruthy();
      });

      it('sets the minimap size when measured', function () {
        minimapElement.measureHeightAndWidth();

        expect(minimap.width).toEqual(minimapElement.clientWidth);
        expect(minimap.height).toEqual(minimapElement.clientHeight);
      });

      it('removes the controls div', function () {
        expect(minimapElement.shadowRoot.querySelector('.minimap-controls')).toBeNull();
      });

      it('removes the visible area', function () {
        expect(minimapElement.visibleArea).toBeUndefined();
      });

      it('removes the quick settings button', function () {
        atom.config.set('minimap.displayPluginsControls', true);

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();
          expect(minimapElement.openQuickSettings).toBeUndefined();
        });
      });

      it('removes the scroll indicator', function () {
        editor.setText(mediumSample);
        editorElement.setScrollTop(50);

        waitsFor('minimap frame requested', function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
          atom.config.set('minimap.minimapScrollIndicator', true);
        });

        waitsFor('minimap frame requested', function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
          expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).toBeNull();
        });
      });

      describe('pressing the mouse on the minimap canvas', function () {
        beforeEach(function () {
          jasmineContent.appendChild(minimapElement);

          var t = 0;
          spyOn(minimapElement, 'getTime').andCallFake(function () {
            var n = t;
            t += 100;
            return n;
          });
          spyOn(minimapElement, 'requestUpdate').andCallFake(function () {});

          atom.config.set('minimap.scrollAnimation', false);

          canvas = minimapElement.getFrontCanvas();
          (0, _helpersEvents.mousedown)(canvas);
        });

        it('does not scroll the editor to the line below the mouse', function () {
          expect(editorElement.getScrollTop()).toEqual(1000);
        });
      });

      describe('and is changed to be a classical minimap again', function () {
        beforeEach(function () {
          atom.config.set('minimap.displayPluginsControls', true);
          atom.config.set('minimap.minimapScrollIndicator', true);

          minimap.setStandAlone(false);
        });

        it('recreates the destroyed elements', function () {
          expect(minimapElement.shadowRoot.querySelector('.minimap-controls')).toExist();
          expect(minimapElement.shadowRoot.querySelector('.minimap-visible-area')).toExist();
          expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).toExist();
          expect(minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')).toExist();
        });
      });
    });

    //    ########  ########  ######  ######## ########   #######  ##    ##
    //    ##     ## ##       ##    ##    ##    ##     ## ##     ##  ##  ##
    //    ##     ## ##       ##          ##    ##     ## ##     ##   ####
    //    ##     ## ######    ######     ##    ########  ##     ##    ##
    //    ##     ## ##             ##    ##    ##   ##   ##     ##    ##
    //    ##     ## ##       ##    ##    ##    ##    ##  ##     ##    ##
    //    ########  ########  ######     ##    ##     ##  #######     ##

    describe('when the model is destroyed', function () {
      beforeEach(function () {
        minimap.destroy();
      });

      it('detaches itself from its parent', function () {
        expect(minimapElement.parentNode).toBeNull();
      });

      it('stops the DOM polling interval', function () {
        spyOn(minimapElement, 'pollDOM');

        sleep(200);

        runs(function () {
          expect(minimapElement.pollDOM).not.toHaveBeenCalled();
        });
      });
    });

    //     ######   #######  ##    ## ######## ####  ######
    //    ##    ## ##     ## ###   ## ##        ##  ##    ##
    //    ##       ##     ## ####  ## ##        ##  ##
    //    ##       ##     ## ## ## ## ######    ##  ##   ####
    //    ##       ##     ## ##  #### ##        ##  ##    ##
    //    ##    ## ##     ## ##   ### ##        ##  ##    ##
    //     ######   #######  ##    ## ##       ####  ######

    describe('when the atom styles are changed', function () {
      beforeEach(function () {
        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();
          spyOn(minimapElement, 'requestForcedUpdate').andCallThrough();
          spyOn(minimapElement, 'invalidateDOMStylesCache').andCallThrough();

          var styleNode = document.createElement('style');
          styleNode.textContent = 'body{ color: #233 }';
          atom.styles.emitter.emit('did-add-style-element', styleNode);
        });

        waitsFor('minimap frame requested', function () {
          return minimapElement.frameRequested;
        });
      });

      it('forces a refresh with cache invalidation', function () {
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
        expect(minimapElement.invalidateDOMStylesCache).toHaveBeenCalled();
      });
    });

    describe('when minimap.textOpacity is changed', function () {
      beforeEach(function () {
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough();
        atom.config.set('minimap.textOpacity', 0.3);

        waitsFor('minimap frame requested', function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
        });
      });

      it('requests a complete update', function () {
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
      });
    });

    describe('when minimap.displayCodeHighlights is changed', function () {
      beforeEach(function () {
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough();
        atom.config.set('minimap.displayCodeHighlights', true);

        waitsFor('minimap frame requested', function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
        });
      });

      it('requests a complete update', function () {
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
      });
    });

    describe('when minimap.charWidth is changed', function () {
      beforeEach(function () {
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough();
        atom.config.set('minimap.charWidth', 1);

        waitsFor('minimap frame requested', function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
        });
      });

      it('requests a complete update', function () {
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
      });
    });

    describe('when minimap.charHeight is changed', function () {
      beforeEach(function () {
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough();
        atom.config.set('minimap.charHeight', 1);

        waitsFor('minimap frame requested', function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
        });
      });

      it('requests a complete update', function () {
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
      });
    });

    describe('when minimap.interline is changed', function () {
      beforeEach(function () {
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough();
        atom.config.set('minimap.interline', 2);

        waitsFor('minimap frame requested', function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
        });
      });

      it('requests a complete update', function () {
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled();
      });
    });

    describe('when minimap.displayMinimapOnLeft setting is true', function () {
      it('moves the attached minimap to the left', function () {
        atom.config.set('minimap.displayMinimapOnLeft', true);
        expect(minimapElement.classList.contains('left')).toBeTruthy();
      });

      describe('when the minimap is not attached yet', function () {
        beforeEach(function () {
          editor = atom.workspace.buildTextEditor({});
          editorElement = atom.views.getView(editor);
          editorElement.setHeight(50);
          editor.setLineHeightInPixels(10);

          minimap = new _libMinimap2['default']({ textEditor: editor });
          minimapElement = atom.views.getView(minimap);

          jasmineContent.insertBefore(editorElement, jasmineContent.firstChild);

          atom.config.set('minimap.displayMinimapOnLeft', true);
          minimapElement.attach();
        });

        it('moves the attached minimap to the left', function () {
          expect(minimapElement.classList.contains('left')).toBeTruthy();
        });
      });
    });

    describe('when minimap.adjustMinimapWidthToSoftWrap is true', function () {
      beforeEach(function () {
        atom.config.set('editor.softWrap', true);
        atom.config.set('editor.softWrapAtPreferredLineLength', true);
        atom.config.set('editor.preferredLineLength', 2);

        atom.config.set('minimap.adjustMinimapWidthToSoftWrap', true);

        waitsFor('minimap frame requested', function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
        });
      });

      it('adjusts the width of the minimap canvas', function () {
        expect(minimapElement.getFrontCanvas().width / devicePixelRatio).toEqual(4);
      });

      it('offsets the minimap by the difference', function () {
        expect(realOffsetLeft(minimapElement)).toBeCloseTo(editorElement.clientWidth - 4, -1);
        expect(minimapElement.clientWidth).toEqual(4);
      });

      describe('the dom polling routine', function () {
        it('does not change the value', function () {
          atom.views.performDocumentPoll();

          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
            expect(minimapElement.getFrontCanvas().width / devicePixelRatio).toEqual(4);
          });
        });
      });

      describe('when the editor is resized', function () {
        beforeEach(function () {
          atom.config.set('editor.preferredLineLength', 6);
          editorElement.style.width = '100px';
          editorElement.style.height = '100px';

          atom.views.performDocumentPoll();

          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('makes the minimap smaller than soft wrap', function () {
          expect(minimapElement.offsetWidth).toBeCloseTo(12, -1);
          expect(minimapElement.style.marginRight).toEqual('');
        });
      });

      describe('and when minimap.minimapScrollIndicator setting is true', function () {
        beforeEach(function () {
          editor.setText(mediumSample);
          editorElement.setScrollTop(50);

          waitsFor('minimap frame requested', function () {
            return minimapElement.frameRequested;
          });
          runs(function () {
            nextAnimationFrame();
            atom.config.set('minimap.minimapScrollIndicator', true);
          });

          waitsFor('minimap frame requested', function () {
            return minimapElement.frameRequested;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('offsets the scroll indicator by the difference', function () {
          var indicator = minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator');
          expect(realOffsetLeft(indicator)).toBeCloseTo(2, -1);
        });
      });

      describe('and when minimap.displayPluginsControls setting is true', function () {
        beforeEach(function () {
          atom.config.set('minimap.displayPluginsControls', true);
        });

        it('offsets the scroll indicator by the difference', function () {
          var openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');
          expect(realOffsetLeft(openQuickSettings)).not.toBeCloseTo(2, -1);
        });
      });

      describe('and then disabled', function () {
        beforeEach(function () {
          atom.config.set('minimap.adjustMinimapWidthToSoftWrap', false);

          waitsFor('minimap frame requested', function () {
            return minimapElement.frameRequested;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('adjusts the width of the minimap', function () {
          expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.offsetWidth / 10, -1);
          expect(minimapElement.style.width).toEqual('');
        });
      });

      describe('and when preferredLineLength >= 16384', function () {
        beforeEach(function () {
          atom.config.set('editor.preferredLineLength', 16384);

          waitsFor('minimap frame requested', function () {
            return minimapElement.frameRequested;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('adjusts the width of the minimap', function () {
          expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.offsetWidth / 10, -1);
          expect(minimapElement.style.width).toEqual('');
        });
      });

      describe('when adjustMinimapWidthOnlyIfSmaller is disabled', function () {
        describe('and when preferredLineLength >= 16384', function () {
          beforeEach(function () {
            atom.config.set('minimap.adjustMinimapWidthOnlyIfSmaller', false);
            atom.config.set('editor.preferredLineLength', 16384);

            waitsFor('minimap frame requested', function () {
              return minimapElement.frameRequested;
            });
            runs(function () {
              nextAnimationFrame();
            });
          });

          it('adjusts the width of the minimap', function () {
            expect(minimapElement.offsetWidth).toBeCloseTo(16384 * 2);
            expect(minimapElement.style.width).toEqual(16384 * 2 + 'px');
          });
        });
      });
    });

    describe('when minimap.minimapScrollIndicator setting is true', function () {
      beforeEach(function () {
        editor.setText(mediumSample);
        editorElement.setScrollTop(50);

        waitsFor('minimap frame requested', function () {
          return minimapElement.frameRequested;
        });
        runs(function () {
          nextAnimationFrame();
        });

        atom.config.set('minimap.minimapScrollIndicator', true);
      });

      it('adds a scroll indicator in the element', function () {
        expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).toExist();
      });

      describe('and then deactivated', function () {
        it('removes the scroll indicator from the element', function () {
          atom.config.set('minimap.minimapScrollIndicator', false);
          expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).not.toExist();
        });
      });

      describe('on update', function () {
        beforeEach(function () {
          editorElement.style.height = '500px';

          atom.views.performDocumentPoll();

          waitsFor('a new animation frame request', function () {
            return nextAnimationFrame !== noAnimationFrame;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('adjusts the size and position of the indicator', function () {
          var indicator = minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator');

          var height = editorElement.getHeight() * (editorElement.getHeight() / minimap.getHeight());
          var scroll = (editorElement.getHeight() - height) * minimap.getTextEditorScrollRatio();

          expect(indicator.offsetHeight).toBeCloseTo(height, 0);
          expect(realOffsetTop(indicator)).toBeCloseTo(scroll, 0);
        });
      });

      describe('when the minimap cannot scroll', function () {
        beforeEach(function () {
          editor.setText(smallSample);

          waitsFor('minimap frame requested', function () {
            return minimapElement.frameRequested;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('removes the scroll indicator', function () {
          expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).not.toExist();
        });

        describe('and then can scroll again', function () {
          beforeEach(function () {
            editor.setText(largeSample);

            waitsFor('minimap frame requested', function () {
              return minimapElement.frameRequested;
            });
            runs(function () {
              nextAnimationFrame();
            });
          });

          it('attaches the scroll indicator', function () {
            waitsFor('minimap scroll indicator', function () {
              return minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator');
            });
          });
        });
      });
    });

    describe('when minimap.absoluteMode setting is true', function () {
      beforeEach(function () {
        atom.config.set('minimap.absoluteMode', true);
      });

      it('adds a absolute class to the minimap element', function () {
        expect(minimapElement.classList.contains('absolute')).toBeTruthy();
      });

      describe('when minimap.displayMinimapOnLeft setting is true', function () {
        it('also adds a left class to the minimap element', function () {
          atom.config.set('minimap.displayMinimapOnLeft', true);
          expect(minimapElement.classList.contains('absolute')).toBeTruthy();
          expect(minimapElement.classList.contains('left')).toBeTruthy();
        });
      });

      describe('when minimap.adjustAbsoluteModeHeight setting is true', function () {
        beforeEach(function () {
          atom.config.set('minimap.adjustAbsoluteModeHeight', true);
        });
        describe('when the content of the minimap is smaller that the editor height', function () {
          beforeEach(function () {
            editor.setText(smallSample);
            editorElement.setHeight(400);
            minimapElement.measureHeightAndWidth();

            waitsFor('a new animation frame request', function () {
              return nextAnimationFrame !== noAnimationFrame;
            });

            runs(function () {
              return nextAnimationFrame();
            });
          });
          it('adjusts the canvas height to the minimap height', function () {
            expect(minimapElement.shadowRoot.querySelector('canvas').offsetHeight).toEqual(minimap.getHeight());
          });

          describe('when the content is modified', function () {
            beforeEach(function () {
              editor.insertText('foo\n\nbar\n');

              waitsFor('a new animation frame request', function () {
                return nextAnimationFrame !== noAnimationFrame;
              });

              runs(function () {
                return nextAnimationFrame();
              });
            });

            it('adjusts the canvas height to the new minimap height', function () {
              expect(minimapElement.shadowRoot.querySelector('canvas').offsetHeight).toEqual(minimap.getHeight());
            });
          });
        });
      });
    });

    describe('when the smoothScrolling setting is disabled', function () {
      beforeEach(function () {
        atom.config.set('minimap.smoothScrolling', false);
      });
      it('does not offset the canvas when the scroll does not match line height', function () {
        editorElement.setScrollTop(1004);

        waitsFor('a new animation frame request', function () {
          return nextAnimationFrame !== noAnimationFrame;
        });
        runs(function () {
          nextAnimationFrame();

          expect(realOffsetTop(canvas)).toEqual(0);
        });
      });
    });

    //     #######  ##     ## ####  ######  ##    ##
    //    ##     ## ##     ##  ##  ##    ## ##   ##
    //    ##     ## ##     ##  ##  ##       ##  ##
    //    ##     ## ##     ##  ##  ##       #####
    //    ##  ## ## ##     ##  ##  ##       ##  ##
    //    ##    ##  ##     ##  ##  ##    ## ##   ##
    //     ##### ##  #######  ####  ######  ##    ##
    //
    //     ######  ######## ######## ######## #### ##    ##  ######    ######
    //    ##    ## ##          ##       ##     ##  ###   ## ##    ##  ##    ##
    //    ##       ##          ##       ##     ##  ####  ## ##        ##
    //     ######  ######      ##       ##     ##  ## ## ## ##   ####  ######
    //          ## ##          ##       ##     ##  ##  #### ##    ##        ##
    //    ##    ## ##          ##       ##     ##  ##   ### ##    ##  ##    ##
    //     ######  ########    ##       ##    #### ##    ##  ######    ######

    describe('when minimap.displayPluginsControls setting is true', function () {
      var _ref12 = [];
      var openQuickSettings = _ref12[0];
      var quickSettingsElement = _ref12[1];
      var workspaceElement = _ref12[2];

      beforeEach(function () {
        atom.config.set('minimap.displayPluginsControls', true);
      });

      it('has a div to open the quick settings', function () {
        expect(minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')).toExist();
      });

      describe('clicking on the div', function () {
        beforeEach(function () {
          workspaceElement = atom.views.getView(atom.workspace);
          jasmineContent.appendChild(workspaceElement);

          openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');
          (0, _helpersEvents.mousedown)(openQuickSettings);

          quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings');
        });

        afterEach(function () {
          minimapElement.quickSettingsElement.destroy();
        });

        it('opens the quick settings view', function () {
          expect(quickSettingsElement).toExist();
        });

        it('positions the quick settings view next to the minimap', function () {
          var minimapBounds = minimapElement.getFrontCanvas().getBoundingClientRect();
          var settingsBounds = quickSettingsElement.getBoundingClientRect();

          expect(realOffsetTop(quickSettingsElement)).toBeCloseTo(minimapBounds.top, 0);
          expect(realOffsetLeft(quickSettingsElement)).toBeCloseTo(minimapBounds.left - settingsBounds.width, 0);
        });
      });

      describe('when the displayMinimapOnLeft setting is enabled', function () {
        describe('clicking on the div', function () {
          beforeEach(function () {
            atom.config.set('minimap.displayMinimapOnLeft', true);

            workspaceElement = atom.views.getView(atom.workspace);
            jasmineContent.appendChild(workspaceElement);

            openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');
            (0, _helpersEvents.mousedown)(openQuickSettings);

            quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings');
          });

          afterEach(function () {
            minimapElement.quickSettingsElement.destroy();
          });

          it('positions the quick settings view next to the minimap', function () {
            var minimapBounds = minimapElement.getFrontCanvas().getBoundingClientRect();

            expect(realOffsetTop(quickSettingsElement)).toBeCloseTo(minimapBounds.top, 0);
            expect(realOffsetLeft(quickSettingsElement)).toBeCloseTo(minimapBounds.right, 0);
          });
        });
      });

      describe('when the adjustMinimapWidthToSoftWrap setting is enabled', function () {
        var _ref13 = [];
        var controls = _ref13[0];

        beforeEach(function () {
          atom.config.set('editor.softWrap', true);
          atom.config.set('editor.softWrapAtPreferredLineLength', true);
          atom.config.set('editor.preferredLineLength', 2);

          atom.config.set('minimap.adjustMinimapWidthToSoftWrap', true);
          nextAnimationFrame();

          controls = minimapElement.shadowRoot.querySelector('.minimap-controls');
          openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');

          editorElement.style.width = '1024px';

          atom.views.performDocumentPoll();
          waitsFor('minimap frame requested', function () {
            return minimapElement.frameRequested;
          });
          runs(function () {
            nextAnimationFrame();
          });
        });

        it('adjusts the size of the control div to fit in the minimap', function () {
          expect(controls.clientWidth).toEqual(minimapElement.getFrontCanvas().clientWidth / devicePixelRatio);
        });

        it('positions the controls div over the canvas', function () {
          var controlsRect = controls.getBoundingClientRect();
          var canvasRect = minimapElement.getFrontCanvas().getBoundingClientRect();
          expect(controlsRect.left).toEqual(canvasRect.left);
          expect(controlsRect.right).toEqual(canvasRect.right);
        });

        describe('when the displayMinimapOnLeft setting is enabled', function () {
          beforeEach(function () {
            atom.config.set('minimap.displayMinimapOnLeft', true);
          });

          it('adjusts the size of the control div to fit in the minimap', function () {
            expect(controls.clientWidth).toEqual(minimapElement.getFrontCanvas().clientWidth / devicePixelRatio);
          });

          it('positions the controls div over the canvas', function () {
            var controlsRect = controls.getBoundingClientRect();
            var canvasRect = minimapElement.getFrontCanvas().getBoundingClientRect();
            expect(controlsRect.left).toEqual(canvasRect.left);
            expect(controlsRect.right).toEqual(canvasRect.right);
          });

          describe('clicking on the div', function () {
            beforeEach(function () {
              workspaceElement = atom.views.getView(atom.workspace);
              jasmineContent.appendChild(workspaceElement);

              openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');
              (0, _helpersEvents.mousedown)(openQuickSettings);

              quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings');
            });

            afterEach(function () {
              minimapElement.quickSettingsElement.destroy();
            });

            it('positions the quick settings view next to the minimap', function () {
              var minimapBounds = minimapElement.getFrontCanvas().getBoundingClientRect();

              expect(realOffsetTop(quickSettingsElement)).toBeCloseTo(minimapBounds.top, 0);
              expect(realOffsetLeft(quickSettingsElement)).toBeCloseTo(minimapBounds.right, 0);
            });
          });
        });
      });

      describe('when the quick settings view is open', function () {
        beforeEach(function () {
          workspaceElement = atom.views.getView(atom.workspace);
          jasmineContent.appendChild(workspaceElement);

          openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');
          (0, _helpersEvents.mousedown)(openQuickSettings);

          quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings');
        });

        it('sets the on right button active', function () {
          expect(quickSettingsElement.querySelector('.btn.selected:last-child')).toExist();
        });

        describe('clicking on the code highlight item', function () {
          beforeEach(function () {
            var item = quickSettingsElement.querySelector('li.code-highlights');
            (0, _helpersEvents.mousedown)(item);
          });

          it('toggles the code highlights on the minimap element', function () {
            expect(minimapElement.displayCodeHighlights).toBeTruthy();
          });

          it('requests an update', function () {
            expect(minimapElement.frameRequested).toBeTruthy();
          });
        });

        describe('clicking on the absolute mode item', function () {
          beforeEach(function () {
            var item = quickSettingsElement.querySelector('li.absolute-mode');
            (0, _helpersEvents.mousedown)(item);
          });

          it('toggles the absolute-mode setting', function () {
            expect(atom.config.get('minimap.absoluteMode')).toBeTruthy();
            expect(minimapElement.absoluteMode).toBeTruthy();
          });
        });

        describe('clicking on the on left button', function () {
          beforeEach(function () {
            var item = quickSettingsElement.querySelector('.btn:first-child');
            (0, _helpersEvents.mousedown)(item);
          });

          it('toggles the displayMinimapOnLeft setting', function () {
            expect(atom.config.get('minimap.displayMinimapOnLeft')).toBeTruthy();
          });

          it('changes the buttons activation state', function () {
            expect(quickSettingsElement.querySelector('.btn.selected:last-child')).not.toExist();
            expect(quickSettingsElement.querySelector('.btn.selected:first-child')).toExist();
          });
        });

        describe('core:move-left', function () {
          beforeEach(function () {
            atom.commands.dispatch(quickSettingsElement, 'core:move-left');
          });

          it('toggles the displayMinimapOnLeft setting', function () {
            expect(atom.config.get('minimap.displayMinimapOnLeft')).toBeTruthy();
          });

          it('changes the buttons activation state', function () {
            expect(quickSettingsElement.querySelector('.btn.selected:last-child')).not.toExist();
            expect(quickSettingsElement.querySelector('.btn.selected:first-child')).toExist();
          });
        });

        describe('core:move-right when the minimap is on the right', function () {
          beforeEach(function () {
            atom.config.set('minimap.displayMinimapOnLeft', true);
            atom.commands.dispatch(quickSettingsElement, 'core:move-right');
          });

          it('toggles the displayMinimapOnLeft setting', function () {
            expect(atom.config.get('minimap.displayMinimapOnLeft')).toBeFalsy();
          });

          it('changes the buttons activation state', function () {
            expect(quickSettingsElement.querySelector('.btn.selected:first-child')).not.toExist();
            expect(quickSettingsElement.querySelector('.btn.selected:last-child')).toExist();
          });
        });

        describe('clicking on the open settings button again', function () {
          beforeEach(function () {
            (0, _helpersEvents.mousedown)(openQuickSettings);
          });

          it('closes the quick settings view', function () {
            expect(workspaceElement.querySelector('minimap-quick-settings')).not.toExist();
          });

          it('removes the view from the element', function () {
            expect(minimapElement.quickSettingsElement).toBeNull();
          });
        });

        describe('when an external event destroys the view', function () {
          beforeEach(function () {
            minimapElement.quickSettingsElement.destroy();
          });

          it('removes the view reference from the element', function () {
            expect(minimapElement.quickSettingsElement).toBeNull();
          });
        });
      });

      describe('then disabling it', function () {
        beforeEach(function () {
          atom.config.set('minimap.displayPluginsControls', false);
        });

        it('removes the div', function () {
          expect(minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')).not.toExist();
        });
      });

      describe('with plugins registered in the package', function () {
        var _ref14 = [];
        var minimapPackage = _ref14[0];
        var pluginA = _ref14[1];
        var pluginB = _ref14[2];

        beforeEach(function () {
          waitsForPromise(function () {
            return atom.packages.activatePackage('minimap').then(function (pkg) {
              minimapPackage = pkg.mainModule;
            });
          });

          runs(function () {
            var Plugin = (function () {
              function Plugin() {
                _classCallCheck(this, Plugin);

                this.active = false;
              }

              _createClass(Plugin, [{
                key: 'activatePlugin',
                value: function activatePlugin() {
                  this.active = true;
                }
              }, {
                key: 'deactivatePlugin',
                value: function deactivatePlugin() {
                  this.active = false;
                }
              }, {
                key: 'isActive',
                value: function isActive() {
                  return this.active;
                }
              }]);

              return Plugin;
            })();

            pluginA = new Plugin();
            pluginB = new Plugin();

            minimapPackage.registerPlugin('dummyA', pluginA);
            minimapPackage.registerPlugin('dummyB', pluginB);

            workspaceElement = atom.views.getView(atom.workspace);
            jasmineContent.appendChild(workspaceElement);

            openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings');
            (0, _helpersEvents.mousedown)(openQuickSettings);

            quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings');
          });
        });

        it('creates one list item for each registered plugin', function () {
          expect(quickSettingsElement.querySelectorAll('li').length).toEqual(6);
        });

        it('selects the first item of the list', function () {
          expect(quickSettingsElement.querySelector('li.selected:first-child')).toExist();
        });

        describe('core:confirm', function () {
          beforeEach(function () {
            atom.commands.dispatch(quickSettingsElement, 'core:confirm');
          });

          it('disable the plugin of the selected item', function () {
            expect(pluginA.isActive()).toBeFalsy();
          });

          describe('triggered a second time', function () {
            beforeEach(function () {
              atom.commands.dispatch(quickSettingsElement, 'core:confirm');
            });

            it('enable the plugin of the selected item', function () {
              expect(pluginA.isActive()).toBeTruthy();
            });
          });

          describe('on the code highlight item', function () {
            var _ref15 = [];
            var initial = _ref15[0];

            beforeEach(function () {
              initial = minimapElement.displayCodeHighlights;
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:confirm');
            });

            it('toggles the code highlights on the minimap element', function () {
              expect(minimapElement.displayCodeHighlights).toEqual(!initial);
            });
          });

          describe('on the absolute mode item', function () {
            var _ref16 = [];
            var initial = _ref16[0];

            beforeEach(function () {
              initial = atom.config.get('minimap.absoluteMode');
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:confirm');
            });

            it('toggles the code highlights on the minimap element', function () {
              expect(atom.config.get('minimap.absoluteMode')).toEqual(!initial);
            });
          });

          describe('on the adjust absolute mode height item', function () {
            var _ref17 = [];
            var initial = _ref17[0];

            beforeEach(function () {
              initial = atom.config.get('minimap.adjustAbsoluteModeHeight');
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
              atom.commands.dispatch(quickSettingsElement, 'core:confirm');
            });

            it('toggles the code highlights on the minimap element', function () {
              expect(atom.config.get('minimap.adjustAbsoluteModeHeight')).toEqual(!initial);
            });
          });
        });

        describe('core:move-down', function () {
          beforeEach(function () {
            atom.commands.dispatch(quickSettingsElement, 'core:move-down');
          });

          it('selects the second item', function () {
            expect(quickSettingsElement.querySelector('li.selected:nth-child(2)')).toExist();
          });

          describe('reaching a separator', function () {
            beforeEach(function () {
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
            });

            it('moves past the separator', function () {
              expect(quickSettingsElement.querySelector('li.code-highlights.selected')).toExist();
            });
          });

          describe('then core:move-up', function () {
            beforeEach(function () {
              atom.commands.dispatch(quickSettingsElement, 'core:move-up');
            });

            it('selects again the first item of the list', function () {
              expect(quickSettingsElement.querySelector('li.selected:first-child')).toExist();
            });
          });
        });

        describe('core:move-up', function () {
          beforeEach(function () {
            atom.commands.dispatch(quickSettingsElement, 'core:move-up');
          });

          it('selects the last item', function () {
            expect(quickSettingsElement.querySelector('li.selected:last-child')).toExist();
          });

          describe('reaching a separator', function () {
            beforeEach(function () {
              atom.commands.dispatch(quickSettingsElement, 'core:move-up');
              atom.commands.dispatch(quickSettingsElement, 'core:move-up');
              atom.commands.dispatch(quickSettingsElement, 'core:move-up');
            });

            it('moves past the separator', function () {
              expect(quickSettingsElement.querySelector('li.selected:nth-child(2)')).toExist();
            });
          });

          describe('then core:move-down', function () {
            beforeEach(function () {
              atom.commands.dispatch(quickSettingsElement, 'core:move-down');
            });

            it('selects again the first item of the list', function () {
              expect(quickSettingsElement.querySelector('li.selected:first-child')).toExist();
            });
          });
        });
      });
    });
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL21pbmltYXAvc3BlYy9taW5pbWFwLWVsZW1lbnQtc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztzQkFFZSxTQUFTOzs7O3VCQUNQLGFBQWE7Ozs7MEJBQ1YsZ0JBQWdCOzs7O2lDQUNULHdCQUF3Qjs7OztnQ0FDMUIscUJBQXFCOzs2QkFDaUMsa0JBQWtCOztBQVBqRyxXQUFXLENBQUE7O0FBU1gsU0FBUyxhQUFhLENBQUUsQ0FBQyxFQUFFOzs7QUFHekIsU0FBTyxDQUFDLENBQUMsU0FBUyxDQUFBO0NBQ25COztBQUVELFNBQVMsY0FBYyxDQUFFLENBQUMsRUFBRTs7O0FBRzFCLFNBQU8sQ0FBQyxDQUFDLFVBQVUsQ0FBQTtDQUNwQjs7QUFFRCxTQUFTLEtBQUssQ0FBRSxRQUFRLEVBQUU7QUFDeEIsTUFBTSxDQUFDLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQTtBQUNwQixVQUFRLENBQUksUUFBUSxTQUFNLFlBQU07QUFBRSxXQUFPLElBQUksSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQTtHQUFFLENBQUMsQ0FBQTtDQUN0RTs7QUFFRCxTQUFTLFlBQVksR0FBSTtBQUN2QixNQUFNLE1BQU0sR0FBRztBQUNiLFVBQU0sRUFBRSxLQUFLO0FBQ2Isa0JBQWMsRUFBQywwQkFBRztBQUFFLFVBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFBO0tBQUU7QUFDeEMsb0JBQWdCLEVBQUMsNEJBQUc7QUFBRSxVQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQTtLQUFFO0FBQzNDLFlBQVEsRUFBQyxvQkFBRztBQUFFLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQTtLQUFFO0dBQ25DLENBQUE7QUFDRCxTQUFPLE1BQU0sQ0FBQTtDQUNkOztBQUVELFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxZQUFNO2FBQ3FGLEVBQUU7TUFBakgsTUFBTTtNQUFFLE9BQU87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QUFDLFlBQU07QUFDZixrQkFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQTthQUMvRCxDQUFDLENBQUE7O0FBRUYsY0FBRSxDQUFDLDBDQUEwQyxFQUFFLFlBQU07QUFDbkQsb0JBQU0sQ0FBQyxvQkFBb0IsQ0FBQyxhQUFhLENBQUMseUJBQXlCLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFBO2FBQ2hGLENBQUMsQ0FBQTtXQUNILENBQUMsQ0FBQTtTQUNILENBQUMsQ0FBQTtPQUNILENBQUMsQ0FBQTtLQUNILENBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTtDQUNILENBQUMsQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL3NwZWMvbWluaW1hcC1lbGVtZW50LXNwZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMtcGx1cydcbmltcG9ydCBNYWluIGZyb20gJy4uL2xpYi9tYWluJ1xuaW1wb3J0IE1pbmltYXAgZnJvbSAnLi4vbGliL21pbmltYXAnXG5pbXBvcnQgTWluaW1hcEVsZW1lbnQgZnJvbSAnLi4vbGliL21pbmltYXAtZWxlbWVudCdcbmltcG9ydCB7c3R5bGVzaGVldH0gZnJvbSAnLi9oZWxwZXJzL3dvcmtzcGFjZSdcbmltcG9ydCB7bW91c2Vtb3ZlLCBtb3VzZWRvd24sIG1vdXNldXAsIG1vdXNld2hlZWwsIHRvdWNoc3RhcnQsIHRvdWNobW92ZX0gZnJvbSAnLi9oZWxwZXJzL2V2ZW50cydcblxuZnVuY3Rpb24gcmVhbE9mZnNldFRvcCAobykge1xuICAvLyB0cmFuc2Zvcm0gPSBuZXcgV2ViS2l0Q1NTTWF0cml4IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKG8pLnRyYW5zZm9ybVxuICAvLyBvLm9mZnNldFRvcCArIHRyYW5zZm9ybS5tNDJcbiAgcmV0dXJuIG8ub2Zmc2V0VG9wXG59XG5cbmZ1bmN0aW9uIHJlYWxPZmZzZXRMZWZ0IChvKSB7XG4gIC8vIHRyYW5zZm9ybSA9IG5ldyBXZWJLaXRDU1NNYXRyaXggd2luZG93LmdldENvbXB1dGVkU3R5bGUobykudHJhbnNmb3JtXG4gIC8vIG8ub2Zmc2V0TGVmdCArIHRyYW5zZm9ybS5tNDFcbiAgcmV0dXJuIG8ub2Zmc2V0TGVmdFxufVxuXG5mdW5jdGlvbiBzbGVlcCAoZHVyYXRpb24pIHtcbiAgY29uc3QgdCA9IG5ldyBEYXRlKClcbiAgd2FpdHNGb3IoYCR7ZHVyYXRpb259bXNgLCAoKSA9PiB7IHJldHVybiBuZXcgRGF0ZSgpIC0gdCA+IGR1cmF0aW9uIH0pXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVBsdWdpbiAoKSB7XG4gIGNvbnN0IHBsdWdpbiA9IHtcbiAgICBhY3RpdmU6IGZhbHNlLFxuICAgIGFjdGl2YXRlUGx1Z2luICgpIHsgdGhpcy5hY3RpdmUgPSB0cnVlIH0sXG4gICAgZGVhY3RpdmF0ZVBsdWdpbiAoKSB7IHRoaXMuYWN0aXZlID0gZmFsc2UgfSxcbiAgICBpc0FjdGl2ZSAoKSB7IHJldHVybiB0aGlzLmFjdGl2ZSB9XG4gIH1cbiAgcmV0dXJuIHBsdWdpblxufVxuXG5kZXNjcmliZSgnTWluaW1hcEVsZW1lbnQnLCAoKSA9PiB7XG4gIGxldCBbZWRpdG9yLCBtaW5pbWFwLCBsYXJnZVNhbXBsZSwgbWVkaXVtU2FtcGxlLCBzbWFsbFNhbXBsZSwgamFzbWluZUNvbnRlbnQsIGVkaXRvckVsZW1lbnQsIG1pbmltYXBFbGVtZW50LCBkaXJdID0gW11cblxuICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAvLyBDb21tZW50IGFmdGVyIGJvZHkgYmVsb3cgdG8gbGVhdmUgdGhlIGNyZWF0ZWQgdGV4dCBlZGl0b3IgYW5kIG1pbmltYXBcbiAgICAvLyBvbiBET00gYWZ0ZXIgdGhlIHRlc3QgcnVuLlxuICAgIGphc21pbmVDb250ZW50ID0gZG9jdW1lbnQuYm9keS5xdWVyeVNlbGVjdG9yKCcjamFzbWluZS1jb250ZW50JylcblxuICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5jaGFySGVpZ2h0JywgNClcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuY2hhcldpZHRoJywgMilcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuaW50ZXJsaW5lJywgMSlcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAudGV4dE9wYWNpdHknLCAxKVxuICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5zbW9vdGhTY3JvbGxpbmcnLCB0cnVlKVxuICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5hZGp1c3RNaW5pbWFwV2lkdGhPbmx5SWZTbWFsbGVyJywgdHJ1ZSlcbiAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAucGx1Z2lucycsIHt9KVxuXG4gICAgTWluaW1hcEVsZW1lbnQucmVnaXN0ZXJWaWV3UHJvdmlkZXIoTWluaW1hcClcblxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmJ1aWxkVGV4dEVkaXRvcih7fSlcbiAgICBlZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcilcbiAgICBqYXNtaW5lQ29udGVudC5pbnNlcnRCZWZvcmUoZWRpdG9yRWxlbWVudCwgamFzbWluZUNvbnRlbnQuZmlyc3RDaGlsZClcbiAgICBlZGl0b3JFbGVtZW50LnNldEhlaWdodCg1MClcblxuICAgIG1pbmltYXAgPSBuZXcgTWluaW1hcCh7dGV4dEVkaXRvcjogZWRpdG9yfSlcbiAgICBkaXIgPSBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVswXVxuXG4gICAgbGFyZ2VTYW1wbGUgPSBmcy5yZWFkRmlsZVN5bmMoZGlyLnJlc29sdmUoJ2xhcmdlLWZpbGUuY29mZmVlJykpLnRvU3RyaW5nKClcbiAgICBtZWRpdW1TYW1wbGUgPSBmcy5yZWFkRmlsZVN5bmMoZGlyLnJlc29sdmUoJ3R3by1odW5kcmVkLnR4dCcpKS50b1N0cmluZygpXG4gICAgc21hbGxTYW1wbGUgPSBmcy5yZWFkRmlsZVN5bmMoZGlyLnJlc29sdmUoJ3NhbXBsZS5jb2ZmZWUnKSkudG9TdHJpbmcoKVxuXG4gICAgZWRpdG9yLnNldFRleHQobGFyZ2VTYW1wbGUpXG5cbiAgICBtaW5pbWFwRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhtaW5pbWFwKVxuICB9KVxuXG4gIGl0KCdoYXMgYmVlbiByZWdpc3RlcmVkIGluIHRoZSB2aWV3IHJlZ2lzdHJ5JywgKCkgPT4ge1xuICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudCkudG9FeGlzdCgpXG4gIH0pXG5cbiAgaXQoJ2hhcyBzdG9yZWQgdGhlIG1pbmltYXAgYXMgaXRzIG1vZGVsJywgKCkgPT4ge1xuICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5nZXRNb2RlbCgpKS50b0JlKG1pbmltYXApXG4gIH0pXG5cbiAgaXQoJ2hhcyBhIGNhbnZhcyBpbiBhIHNoYWRvdyBET00nLCAoKSA9PiB7XG4gICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignY2FudmFzJykpLnRvRXhpc3QoKVxuICB9KVxuXG4gIGl0KCdoYXMgYSBkaXYgcmVwcmVzZW50aW5nIHRoZSB2aXNpYmxlIGFyZWEnLCAoKSA9PiB7XG4gICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm1pbmltYXAtdmlzaWJsZS1hcmVhJykpLnRvRXhpc3QoKVxuICB9KVxuXG4gIC8vICAgICAgICMjIyAgICAjIyMjIyMjIyAjIyMjIyMjIyAgICAjIyMgICAgICMjIyMjIyAgIyMgICAgICMjXG4gIC8vICAgICAgIyMgIyMgICAgICAjIyAgICAgICAjIyAgICAgICMjICMjICAgIyMgICAgIyMgIyMgICAgICMjXG4gIC8vICAgICAjIyAgICMjICAgICAjIyAgICAgICAjIyAgICAgIyMgICAjIyAgIyMgICAgICAgIyMgICAgICMjXG4gIC8vICAgICMjICAgICAjIyAgICAjIyAgICAgICAjIyAgICAjIyAgICAgIyMgIyMgICAgICAgIyMjIyMjIyMjXG4gIC8vICAgICMjIyMjIyMjIyAgICAjIyAgICAgICAjIyAgICAjIyMjIyMjIyMgIyMgICAgICAgIyMgICAgICMjXG4gIC8vICAgICMjICAgICAjIyAgICAjIyAgICAgICAjIyAgICAjIyAgICAgIyMgIyMgICAgIyMgIyMgICAgICMjXG4gIC8vICAgICMjICAgICAjIyAgICAjIyAgICAgICAjIyAgICAjIyAgICAgIyMgICMjIyMjIyAgIyMgICAgICMjXG5cbiAgZGVzY3JpYmUoJ3doZW4gYXR0YWNoZWQgdG8gdGhlIHRleHQgZWRpdG9yIGVsZW1lbnQnLCAoKSA9PiB7XG4gICAgbGV0IFtub0FuaW1hdGlvbkZyYW1lLCBuZXh0QW5pbWF0aW9uRnJhbWUsIHJlcXVlc3RBbmltYXRpb25GcmFtZVNhZmUsIGNhbnZhcywgdmlzaWJsZUFyZWFdID0gW11cblxuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgbm9BbmltYXRpb25GcmFtZSA9ICgpID0+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdGVkJylcbiAgICAgIH1cbiAgICAgIG5leHRBbmltYXRpb25GcmFtZSA9IG5vQW5pbWF0aW9uRnJhbWVcblxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lU2FmZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICAgIHNweU9uKHdpbmRvdywgJ3JlcXVlc3RBbmltYXRpb25GcmFtZScpLmFuZENhbGxGYWtlKChmbikgPT4ge1xuICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUgPSAoKSA9PiB7XG4gICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lID0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICAgIGZuKClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBjYW52YXMgPSBtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2NhbnZhcycpXG4gICAgICBlZGl0b3JFbGVtZW50LnNldFdpZHRoKDIwMClcbiAgICAgIGVkaXRvckVsZW1lbnQuc2V0SGVpZ2h0KDUwKVxuXG4gICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgxMDAwKVxuICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxMZWZ0KDIwMClcbiAgICAgIG1pbmltYXBFbGVtZW50LmF0dGFjaCgpXG4gICAgfSlcblxuICAgIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgICBtaW5pbWFwLmRlc3Ryb3koKVxuICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHJlcXVlc3RBbmltYXRpb25GcmFtZVNhZmVcbiAgICB9KVxuXG4gICAgaXQoJ2FkZHMgYSB3aXRoLW1pbmltYXAgYXR0cmlidXRlIG9uIHRoZSB0ZXh0IGVkaXRvciBlbGVtZW50JywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuaGFzQXR0cmlidXRlKCd3aXRoLW1pbmltYXAnKSkudG9CZVRydXRoeSgpXG4gICAgfSlcblxuICAgIGl0KCd0YWtlcyB0aGUgaGVpZ2h0IG9mIHRoZSBlZGl0b3InLCAoKSA9PiB7XG4gICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQub2Zmc2V0SGVpZ2h0KS50b0VxdWFsKGVkaXRvckVsZW1lbnQuY2xpZW50SGVpZ2h0KVxuXG4gICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQub2Zmc2V0V2lkdGgpLnRvQmVDbG9zZVRvKGVkaXRvckVsZW1lbnQuY2xpZW50V2lkdGggLyAxMCwgMClcbiAgICB9KVxuXG4gICAgaXQoJ2tub3dzIHdoZW4gYXR0YWNoZWQgdG8gYSB0ZXh0IGVkaXRvcicsICgpID0+IHtcbiAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5hdHRhY2hlZFRvVGV4dEVkaXRvcikudG9CZVRydXRoeSgpXG4gICAgfSlcblxuICAgIGl0KCdyZXNpemVzIHRoZSBjYW52YXMgdG8gZml0IHRoZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGNhbnZhcy5vZmZzZXRIZWlnaHQgLyBkZXZpY2VQaXhlbFJhdGlvKS50b0JlQ2xvc2VUbyhtaW5pbWFwRWxlbWVudC5vZmZzZXRIZWlnaHQgKyBtaW5pbWFwLmdldExpbmVIZWlnaHQoKSwgMClcbiAgICAgIGV4cGVjdChjYW52YXMub2Zmc2V0V2lkdGggLyBkZXZpY2VQaXhlbFJhdGlvKS50b0JlQ2xvc2VUbyhtaW5pbWFwRWxlbWVudC5vZmZzZXRXaWR0aCwgMClcbiAgICB9KVxuXG4gICAgaXQoJ3JlcXVlc3RzIGFuIHVwZGF0ZScsICgpID0+IHtcbiAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZCkudG9CZVRydXRoeSgpXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCd3aGVuIGRldGFjaGVkJywgKCkgPT4ge1xuICAgICAgaXQoJ3JlbW92ZXMgdGhlIGF0dHJpYnV0ZSBmcm9tIHRoZSBlZGl0b3InLCAoKSA9PiB7XG4gICAgICAgIG1pbmltYXBFbGVtZW50LmRldGFjaCgpXG5cbiAgICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuaGFzQXR0cmlidXRlKCd3aXRoLW1pbmltYXAnKSkudG9CZUZhbHN5KClcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIC8vICAgICAjIyMjIyMgICAjIyMjIyMgICAjIyMjIyNcbiAgICAvLyAgICAjIyAgICAjIyAjIyAgICAjIyAjIyAgICAjI1xuICAgIC8vICAgICMjICAgICAgICMjICAgICAgICMjXG4gICAgLy8gICAgIyMgICAgICAgICMjIyMjIyAgICMjIyMjI1xuICAgIC8vICAgICMjICAgICAgICAgICAgICMjICAgICAgICMjXG4gICAgLy8gICAgIyMgICAgIyMgIyMgICAgIyMgIyMgICAgIyNcbiAgICAvLyAgICAgIyMjIyMjICAgIyMjIyMjICAgIyMjIyMjXG5cbiAgICBkZXNjcmliZSgnd2l0aCBjc3MgZmlsdGVycycsICgpID0+IHtcbiAgICAgIGRlc2NyaWJlKCd3aGVuIGEgaHVlLXJvdGF0ZSBmaWx0ZXIgaXMgYXBwbGllZCB0byBhIHJnYiBjb2xvcicsICgpID0+IHtcbiAgICAgICAgbGV0IFthZGRpdGlvbm5hbFN0eWxlTm9kZV0gPSBbXVxuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBtaW5pbWFwRWxlbWVudC5pbnZhbGlkYXRlRE9NU3R5bGVzQ2FjaGUoKVxuXG4gICAgICAgICAgYWRkaXRpb25uYWxTdHlsZU5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpXG4gICAgICAgICAgYWRkaXRpb25uYWxTdHlsZU5vZGUudGV4dENvbnRlbnQgPSBgXG4gICAgICAgICAgICAke3N0eWxlc2hlZXR9XG5cbiAgICAgICAgICAgIC5lZGl0b3Ige1xuICAgICAgICAgICAgICBjb2xvcjogcmVkO1xuICAgICAgICAgICAgICAtd2Via2l0LWZpbHRlcjogaHVlLXJvdGF0ZSgxODBkZWcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIGBcblxuICAgICAgICAgIGphc21pbmVDb250ZW50LmFwcGVuZENoaWxkKGFkZGl0aW9ubmFsU3R5bGVOb2RlKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdjb21wdXRlcyB0aGUgbmV3IGNvbG9yIGJ5IGFwcGx5aW5nIHRoZSBodWUgcm90YXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgd2FpdHNGb3IoJ25ldyBhbmltYXRpb24gZnJhbWUnLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgfSlcbiAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG4gICAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQucmV0cmlldmVTdHlsZUZyb21Eb20oWycuZWRpdG9yJ10sICdjb2xvcicpKS50b0VxdWFsKGByZ2IoMCwgJHsweDZkfSwgJHsweDZkfSlgKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiBhIGh1ZS1yb3RhdGUgZmlsdGVyIGlzIGFwcGxpZWQgdG8gYSByZ2JhIGNvbG9yJywgKCkgPT4ge1xuICAgICAgICBsZXQgW2FkZGl0aW9ubmFsU3R5bGVOb2RlXSA9IFtdXG5cbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgbWluaW1hcEVsZW1lbnQuaW52YWxpZGF0ZURPTVN0eWxlc0NhY2hlKClcblxuICAgICAgICAgIGFkZGl0aW9ubmFsU3R5bGVOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuICAgICAgICAgIGFkZGl0aW9ubmFsU3R5bGVOb2RlLnRleHRDb250ZW50ID0gYFxuICAgICAgICAgICAgJHtzdHlsZXNoZWV0fVxuXG4gICAgICAgICAgICAuZWRpdG9yIHtcbiAgICAgICAgICAgICAgY29sb3I6IHJnYmEoMjU1LCAwLCAwLCAwKTtcbiAgICAgICAgICAgICAgLXdlYmtpdC1maWx0ZXI6IGh1ZS1yb3RhdGUoMTgwZGVnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBgXG5cbiAgICAgICAgICBqYXNtaW5lQ29udGVudC5hcHBlbmRDaGlsZChhZGRpdGlvbm5hbFN0eWxlTm9kZSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnY29tcHV0ZXMgdGhlIG5ldyBjb2xvciBieSBhcHBseWluZyB0aGUgaHVlIHJvdGF0aW9uJywgKCkgPT4ge1xuICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcbiAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5yZXRyaWV2ZVN0eWxlRnJvbURvbShbJy5lZGl0b3InXSwgJ2NvbG9yJykpLnRvRXF1YWwoYHJnYmEoMCwgJHsweDZkfSwgJHsweDZkfSwgMClgKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICAvLyAgICAjIyAgICAgIyMgIyMjIyMjIyMgICMjIyMjIyMjICAgICAjIyMgICAgIyMjIyMjIyMgIyMjIyMjIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAgICMjICMjICAgICAgIyMgICAgIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAgIyMgICAjIyAgICAgIyMgICAgIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMjIyMjIyMgICMjICAgICAjIyAjIyAgICAgIyMgICAgIyMgICAgIyMjIyMjXG4gICAgLy8gICAgIyMgICAgICMjICMjICAgICAgICAjIyAgICAgIyMgIyMjIyMjIyMjICAgICMjICAgICMjXG4gICAgLy8gICAgIyMgICAgICMjICMjICAgICAgICAjIyAgICAgIyMgIyMgICAgICMjICAgICMjICAgICMjXG4gICAgLy8gICAgICMjIyMjIyMgICMjICAgICAgICAjIyMjIyMjIyAgIyMgICAgICMjICAgICMjICAgICMjIyMjIyMjXG5cbiAgICBkZXNjcmliZSgnd2hlbiB0aGUgdXBkYXRlIGlzIHBlcmZvcm1lZCcsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICB9KVxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuICAgICAgICAgIHZpc2libGVBcmVhID0gbWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcubWluaW1hcC12aXNpYmxlLWFyZWEnKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ3NldHMgdGhlIHZpc2libGUgYXJlYSB3aWR0aCBhbmQgaGVpZ2h0JywgKCkgPT4ge1xuICAgICAgICBleHBlY3QodmlzaWJsZUFyZWEub2Zmc2V0V2lkdGgpLnRvRXF1YWwobWluaW1hcEVsZW1lbnQuY2xpZW50V2lkdGgpXG4gICAgICAgIGV4cGVjdCh2aXNpYmxlQXJlYS5vZmZzZXRIZWlnaHQpLnRvQmVDbG9zZVRvKG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZEhlaWdodCgpLCAwKVxuICAgICAgfSlcblxuICAgICAgaXQoJ3NldHMgdGhlIHZpc2libGUgdmlzaWJsZSBhcmVhIG9mZnNldCcsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRUb3AodmlzaWJsZUFyZWEpKS50b0JlQ2xvc2VUbyhtaW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRTY3JvbGxUb3AoKSAtIG1pbmltYXAuZ2V0U2Nyb2xsVG9wKCksIDApXG4gICAgICAgIGV4cGVjdChyZWFsT2Zmc2V0TGVmdCh2aXNpYmxlQXJlYSkpLnRvQmVDbG9zZVRvKG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZFNjcm9sbExlZnQoKSwgMClcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdvZmZzZXRzIHRoZSBjYW52YXMgd2hlbiB0aGUgc2Nyb2xsIGRvZXMgbm90IG1hdGNoIGxpbmUgaGVpZ2h0JywgKCkgPT4ge1xuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgxMDA0KVxuXG4gICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICBleHBlY3QocmVhbE9mZnNldFRvcChjYW52YXMpKS50b0JlQ2xvc2VUbygtMiwgLTEpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgnZG9lcyBub3QgZmFpbCB0byB1cGRhdGUgcmVuZGVyIHRoZSBpbnZpc2libGUgY2hhciB3aGVuIG1vZGlmaWVkJywgKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5zaG93SW52aXNpYmxlcycsIHRydWUpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLmludmlzaWJsZXMnLCB7Y3I6ICcqJ30pXG5cbiAgICAgICAgZXhwZWN0KCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSkubm90LnRvVGhyb3coKVxuICAgICAgfSlcblxuICAgICAgaXQoJ3JlbmRlcnMgdGhlIGRlY29yYXRpb25zIGJhc2VkIG9uIHRoZSBvcmRlciBzZXR0aW5ncycsICgpID0+IHtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMnLCB0cnVlKVxuXG4gICAgICAgIGNvbnN0IHBsdWdpbkZvbyA9IGNyZWF0ZVBsdWdpbigpXG4gICAgICAgIGNvbnN0IHBsdWdpbkJhciA9IGNyZWF0ZVBsdWdpbigpXG5cbiAgICAgICAgTWFpbi5yZWdpc3RlclBsdWdpbignZm9vJywgcGx1Z2luRm9vKVxuICAgICAgICBNYWluLnJlZ2lzdGVyUGx1Z2luKCdiYXInLCBwbHVnaW5CYXIpXG5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLnBsdWdpbnMuZm9vRGVjb3JhdGlvbnNaSW5kZXgnLCAxKVxuXG4gICAgICAgIGNvbnN0IGNhbGxzID0gW11cbiAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdkcmF3TGluZURlY29yYXRpb24nKS5hbmRDYWxsRmFrZSgoZCkgPT4ge1xuICAgICAgICAgIGNhbGxzLnB1c2goZC5nZXRQcm9wZXJ0aWVzKCkucGx1Z2luKVxuICAgICAgICB9KVxuICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ2RyYXdIaWdobGlnaHREZWNvcmF0aW9uJykuYW5kQ2FsbEZha2UoKGQpID0+IHtcbiAgICAgICAgICBjYWxscy5wdXNoKGQuZ2V0UHJvcGVydGllcygpLnBsdWdpbilcbiAgICAgICAgfSlcblxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1sxLCAwXSwgWzEsIDEwXV0pLCB7dHlwZTogJ2xpbmUnLCBjb2xvcjogJyMwMDAwRkYnLCBwbHVnaW46ICdiYXInfSlcbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbMSwgMF0sIFsxLCAxMF1dKSwge3R5cGU6ICdoaWdobGlnaHQtdW5kZXInLCBjb2xvcjogJyMwMDAwRkYnLCBwbHVnaW46ICdmb28nfSlcblxuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgwKVxuXG4gICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICBleHBlY3QoY2FsbHMpLnRvRXF1YWwoWydiYXInLCAnZm9vJ10pXG5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAucGx1Z2lucy5mb29EZWNvcmF0aW9uc1pJbmRleCcsIC0xKVxuXG4gICAgICAgICAgY2FsbHMubGVuZ3RoID0gMFxuICAgICAgICB9KVxuXG4gICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgIH0pXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICAgIGV4cGVjdChjYWxscykudG9FcXVhbChbJ2ZvbycsICdiYXInXSlcblxuICAgICAgICAgIE1haW4udW5yZWdpc3RlclBsdWdpbignZm9vJylcbiAgICAgICAgICBNYWluLnVucmVnaXN0ZXJQbHVnaW4oJ2JhcicpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVuZGVycyB0aGUgdmlzaWJsZSBsaW5lIGRlY29yYXRpb25zJywgKCkgPT4ge1xuICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ2RyYXdMaW5lRGVjb3JhdGlvbicpLmFuZENhbGxUaHJvdWdoKClcblxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1sxLCAwXSwgWzEsIDEwXV0pLCB7dHlwZTogJ2xpbmUnLCBjb2xvcjogJyMwMDAwRkYnfSlcbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbMTAsIDBdLCBbMTAsIDEwXV0pLCB7dHlwZTogJ2xpbmUnLCBjb2xvcjogJyMwMDAwRkYnfSlcbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbMTAwLCAwXSwgWzEwMCwgMTBdXSksIHt0eXBlOiAnbGluZScsIGNvbG9yOiAnIzAwMDBGRid9KVxuXG4gICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDApXG5cbiAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgfSlcbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5kcmF3TGluZURlY29yYXRpb24pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5kcmF3TGluZURlY29yYXRpb24uY2FsbHMubGVuZ3RoKS50b0VxdWFsKDIpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVuZGVycyB0aGUgdmlzaWJsZSBndXR0ZXIgZGVjb3JhdGlvbnMnLCAoKSA9PiB7XG4gICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAnZHJhd0d1dHRlckRlY29yYXRpb24nKS5hbmRDYWxsVGhyb3VnaCgpXG5cbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbMSwgMF0sIFsxLCAxMF1dKSwge3R5cGU6ICdndXR0ZXInLCBjb2xvcjogJyMwMDAwRkYnfSlcbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbMTAsIDBdLCBbMTAsIDEwXV0pLCB7dHlwZTogJ2d1dHRlcicsIGNvbG9yOiAnIzAwMDBGRid9KVxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1sxMDAsIDBdLCBbMTAwLCAxMF1dKSwge3R5cGU6ICdndXR0ZXInLCBjb2xvcjogJyMwMDAwRkYnfSlcblxuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgwKVxuXG4gICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZHJhd0d1dHRlckRlY29yYXRpb24pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5kcmF3R3V0dGVyRGVjb3JhdGlvbi5jYWxscy5sZW5ndGgpLnRvRXF1YWwoMilcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZW5kZXJzIHRoZSB2aXNpYmxlIGhpZ2hsaWdodCBkZWNvcmF0aW9ucycsICgpID0+IHtcbiAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdkcmF3SGlnaGxpZ2h0RGVjb3JhdGlvbicpLmFuZENhbGxUaHJvdWdoKClcblxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1sxLCAwXSwgWzEsIDRdXSksIHt0eXBlOiAnaGlnaGxpZ2h0LXVuZGVyJywgY29sb3I6ICcjMDAwMEZGJ30pXG4gICAgICAgIG1pbmltYXAuZGVjb3JhdGVNYXJrZXIoZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbWzIsIDIwXSwgWzIsIDMwXV0pLCB7dHlwZTogJ2hpZ2hsaWdodC1vdmVyJywgY29sb3I6ICcjMDAwMEZGJ30pXG4gICAgICAgIG1pbmltYXAuZGVjb3JhdGVNYXJrZXIoZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbWzEwMCwgM10sIFsxMDAsIDVdXSksIHt0eXBlOiAnaGlnaGxpZ2h0LXVuZGVyJywgY29sb3I6ICcjMDAwMEZGJ30pXG5cbiAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoMClcblxuICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICB9KVxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmRyYXdIaWdobGlnaHREZWNvcmF0aW9uKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZHJhd0hpZ2hsaWdodERlY29yYXRpb24uY2FsbHMubGVuZ3RoKS50b0VxdWFsKDIpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVuZGVycyB0aGUgdmlzaWJsZSBvdXRsaW5lIGRlY29yYXRpb25zJywgKCkgPT4ge1xuICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ2RyYXdIaWdobGlnaHRPdXRsaW5lRGVjb3JhdGlvbicpLmFuZENhbGxUaHJvdWdoKClcblxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1sxLCA0XSwgWzMsIDZdXSksIHt0eXBlOiAnaGlnaGxpZ2h0LW91dGxpbmUnLCBjb2xvcjogJyMwMDAwZmYnfSlcbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbNiwgMF0sIFs2LCA3XV0pLCB7dHlwZTogJ2hpZ2hsaWdodC1vdXRsaW5lJywgY29sb3I6ICcjMDAwMGZmJ30pXG4gICAgICAgIG1pbmltYXAuZGVjb3JhdGVNYXJrZXIoZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbWzEwMCwgM10sIFsxMDAsIDVdXSksIHt0eXBlOiAnaGlnaGxpZ2h0LW91dGxpbmUnLCBjb2xvcjogJyMwMDAwZmYnfSlcblxuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgwKVxuXG4gICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZHJhd0hpZ2hsaWdodE91dGxpbmVEZWNvcmF0aW9uKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZHJhd0hpZ2hsaWdodE91dGxpbmVEZWNvcmF0aW9uLmNhbGxzLmxlbmd0aCkudG9FcXVhbCg0KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ3JlbmRlcnMgdGhlIHZpc2libGUgY3VzdG9tIGZvcmVncm91bmQgZGVjb3JhdGlvbnMnLCAoKSA9PiB7XG4gICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAnZHJhd0N1c3RvbURlY29yYXRpb24nKS5hbmRDYWxsVGhyb3VnaCgpXG5cbiAgICAgICAgY29uc3QgcmVuZGVyUm91dGluZSA9IGphc21pbmUuY3JlYXRlU3B5KCdyZW5kZXJSb3V0aW5lJylcblxuICAgICAgICBjb25zdCBwcm9wZXJ0aWVzID0ge1xuICAgICAgICAgIHR5cGU6ICdmb3JlZ3JvdW5kLWN1c3RvbScsXG4gICAgICAgICAgcmVuZGVyOiByZW5kZXJSb3V0aW5lXG4gICAgICAgIH1cblxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1sxLCA0XSwgWzMsIDZdXSksIHByb3BlcnRpZXMpXG4gICAgICAgIG1pbmltYXAuZGVjb3JhdGVNYXJrZXIoZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbWzYsIDBdLCBbNiwgN11dKSwgcHJvcGVydGllcylcbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbMTAwLCAzXSwgWzEwMCwgNV1dKSwgcHJvcGVydGllcylcblxuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgwKVxuXG4gICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZHJhd0N1c3RvbURlY29yYXRpb24pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5kcmF3Q3VzdG9tRGVjb3JhdGlvbi5jYWxscy5sZW5ndGgpLnRvRXF1YWwoNClcblxuICAgICAgICAgIGV4cGVjdChyZW5kZXJSb3V0aW5lKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgICBleHBlY3QocmVuZGVyUm91dGluZS5jYWxscy5sZW5ndGgpLnRvRXF1YWwoNClcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZW5kZXJzIHRoZSB2aXNpYmxlIGN1c3RvbSBiYWNrZ3JvdW5kIGRlY29yYXRpb25zJywgKCkgPT4ge1xuICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ2RyYXdDdXN0b21EZWNvcmF0aW9uJykuYW5kQ2FsbFRocm91Z2goKVxuXG4gICAgICAgIGNvbnN0IHJlbmRlclJvdXRpbmUgPSBqYXNtaW5lLmNyZWF0ZVNweSgncmVuZGVyUm91dGluZScpXG5cbiAgICAgICAgY29uc3QgcHJvcGVydGllcyA9IHtcbiAgICAgICAgICB0eXBlOiAnYmFja2dyb3VuZC1jdXN0b20nLFxuICAgICAgICAgIHJlbmRlcjogcmVuZGVyUm91dGluZVxuICAgICAgICB9XG5cbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbMSwgNF0sIFszLCA2XV0pLCBwcm9wZXJ0aWVzKVxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1s2LCAwXSwgWzYsIDddXSksIHByb3BlcnRpZXMpXG4gICAgICAgIG1pbmltYXAuZGVjb3JhdGVNYXJrZXIoZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbWzEwMCwgM10sIFsxMDAsIDVdXSksIHByb3BlcnRpZXMpXG5cbiAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoMClcblxuICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICB9KVxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmRyYXdDdXN0b21EZWNvcmF0aW9uKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZHJhd0N1c3RvbURlY29yYXRpb24uY2FsbHMubGVuZ3RoKS50b0VxdWFsKDQpXG5cbiAgICAgICAgICBleHBlY3QocmVuZGVyUm91dGluZSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgICAgZXhwZWN0KHJlbmRlclJvdXRpbmUuY2FsbHMubGVuZ3RoKS50b0VxdWFsKDQpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiB0aGUgZWRpdG9yIGlzIHNjcm9sbGVkJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgyMDAwKVxuICAgICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsTGVmdCg1MClcblxuICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCd1cGRhdGVzIHRoZSB2aXNpYmxlIGFyZWEnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRUb3AodmlzaWJsZUFyZWEpKS50b0JlQ2xvc2VUbyhtaW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRTY3JvbGxUb3AoKSAtIG1pbmltYXAuZ2V0U2Nyb2xsVG9wKCksIDApXG4gICAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRMZWZ0KHZpc2libGVBcmVhKSkudG9CZUNsb3NlVG8obWluaW1hcC5nZXRUZXh0RWRpdG9yU2NhbGVkU2Nyb2xsTGVmdCgpLCAwKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIGVkaXRvciBpcyByZXNpemVkIHRvIGEgZ3JlYXRlciBzaXplJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBlZGl0b3JFbGVtZW50LnN0eWxlLndpZHRoID0gJzgwMHB4J1xuICAgICAgICAgIGVkaXRvckVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gJzUwMHB4J1xuXG4gICAgICAgICAgbWluaW1hcEVsZW1lbnQubWVhc3VyZUhlaWdodEFuZFdpZHRoKClcblxuICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdkZXRlY3RzIHRoZSByZXNpemUgYW5kIGFkanVzdCBpdHNlbGYnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50Lm9mZnNldFdpZHRoKS50b0JlQ2xvc2VUbyhlZGl0b3JFbGVtZW50Lm9mZnNldFdpZHRoIC8gMTAsIDApXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50Lm9mZnNldEhlaWdodCkudG9FcXVhbChlZGl0b3JFbGVtZW50Lm9mZnNldEhlaWdodClcblxuICAgICAgICAgIGV4cGVjdChjYW52YXMub2Zmc2V0V2lkdGggLyBkZXZpY2VQaXhlbFJhdGlvKS50b0JlQ2xvc2VUbyhtaW5pbWFwRWxlbWVudC5vZmZzZXRXaWR0aCwgMClcbiAgICAgICAgICBleHBlY3QoY2FudmFzLm9mZnNldEhlaWdodCAvIGRldmljZVBpeGVsUmF0aW8pLnRvQmVDbG9zZVRvKG1pbmltYXBFbGVtZW50Lm9mZnNldEhlaWdodCArIG1pbmltYXAuZ2V0TGluZUhlaWdodCgpLCAwKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIGVkaXRvciB2aXNpYmxlIGNvbnRlbnQgaXMgY2hhbmdlZCcsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxMZWZ0KDApXG4gICAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoMTQwMClcbiAgICAgICAgICBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZShbWzEwMSwgMF0sIFsxMDIsIDIwXV0pXG5cbiAgICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgfSlcbiAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAnZHJhd0xpbmVzJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2ZvbycpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgncmVyZW5kZXJzIHRoZSBwYXJ0IHRoYXQgaGF2ZSBjaGFuZ2VkJywgKCkgPT4ge1xuICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmRyYXdMaW5lcykudG9IYXZlQmVlbkNhbGxlZCgpXG5cbiAgICAgICAgICAgIGNvbnN0IFtmaXJzdExpbmUsIGxhc3RMaW5lXSA9IG1pbmltYXBFbGVtZW50LmRyYXdMaW5lcy5hcmdzRm9yQ2FsbFswXVxuICAgICAgICAgICAgZXhwZWN0KGZpcnN0TGluZSkudG9FcXVhbCgxMDApXG4gICAgICAgICAgICBleHBlY3QobGFzdExpbmUgPT09IDEwMiB8fCBsYXN0TGluZSA9PT0gMTExKS50b0JlVHJ1dGh5KClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIGVkaXRvciB2aXNpYmlsaXR5IGNoYW5nZScsICgpID0+IHtcbiAgICAgICAgaXQoJ2RvZXMgbm90IG1vZGlmeSB0aGUgc2l6ZSBvZiB0aGUgY2FudmFzJywgKCkgPT4ge1xuICAgICAgICAgIGxldCBjYW52YXNXaWR0aCA9IG1pbmltYXBFbGVtZW50LmdldEZyb250Q2FudmFzKCkud2lkdGhcbiAgICAgICAgICBsZXQgY2FudmFzSGVpZ2h0ID0gbWluaW1hcEVsZW1lbnQuZ2V0RnJvbnRDYW52YXMoKS5oZWlnaHRcbiAgICAgICAgICBlZGl0b3JFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcblxuICAgICAgICAgIG1pbmltYXBFbGVtZW50Lm1lYXN1cmVIZWlnaHRBbmRXaWR0aCgpXG5cbiAgICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgfSlcbiAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5nZXRGcm9udENhbnZhcygpLndpZHRoKS50b0VxdWFsKGNhbnZhc1dpZHRoKVxuICAgICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmdldEZyb250Q2FudmFzKCkuaGVpZ2h0KS50b0VxdWFsKGNhbnZhc0hlaWdodClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCdmcm9tIGhpZGRlbiB0byB2aXNpYmxlJywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgZWRpdG9yRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXG4gICAgICAgICAgICBtaW5pbWFwRWxlbWVudC5jaGVja0ZvclZpc2liaWxpdHlDaGFuZ2UoKVxuICAgICAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdyZXF1ZXN0Rm9yY2VkVXBkYXRlJylcbiAgICAgICAgICAgIGVkaXRvckVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICcnXG4gICAgICAgICAgICBtaW5pbWFwRWxlbWVudC5wb2xsRE9NKClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3JlcXVlc3RzIGFuIHVwZGF0ZSBvZiB0aGUgd2hvbGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5yZXF1ZXN0Rm9yY2VkVXBkYXRlKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgLy8gICAgICMjIyMjIyAgICMjIyMjIyAgIyMjIyMjIyMgICAjIyMjIyMjICAjIyAgICAgICAjI1xuICAgIC8vICAgICMjICAgICMjICMjICAgICMjICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICAgIyNcbiAgICAvLyAgICAjIyAgICAgICAjIyAgICAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAgICMjXG4gICAgLy8gICAgICMjIyMjIyAgIyMgICAgICAgIyMjIyMjIyMgICMjICAgICAjIyAjIyAgICAgICAjI1xuICAgIC8vICAgICAgICAgICMjICMjICAgICAgICMjICAgIyMgICAjIyAgICAgIyMgIyMgICAgICAgIyNcbiAgICAvLyAgICAjIyAgICAjIyAjIyAgICAjIyAjIyAgICAjIyAgIyMgICAgICMjICMjICAgICAgICMjXG4gICAgLy8gICAgICMjIyMjIyAgICMjIyMjIyAgIyMgICAgICMjICAjIyMjIyMjICAjIyMjIyMjIyAjIyMjIyMjI1xuXG4gICAgZGVzY3JpYmUoJ21vdXNlIHNjcm9sbCBjb250cm9scycsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFdpZHRoKDQwMClcbiAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRIZWlnaHQoNDAwKVxuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgwKVxuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbExlZnQoMClcblxuICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuXG4gICAgICAgIG1pbmltYXBFbGVtZW50Lm1lYXN1cmVIZWlnaHRBbmRXaWR0aCgpXG5cbiAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgfSlcbiAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgndXNpbmcgdGhlIG1vdXNlIHNjcm9sbHdoZWVsIG92ZXIgdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdyZWxheXMgdGhlIGV2ZW50cyB0byB0aGUgZWRpdG9yIHZpZXcnLCAoKSA9PiB7XG4gICAgICAgICAgc3B5T24oZWRpdG9yRWxlbWVudC5jb21wb25lbnQucHJlc2VudGVyLCAnc2V0U2Nyb2xsVG9wJykuYW5kQ2FsbEZha2UoKCkgPT4ge30pXG5cbiAgICAgICAgICBtb3VzZXdoZWVsKG1pbmltYXBFbGVtZW50LCAwLCAxNSlcblxuICAgICAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LmNvbXBvbmVudC5wcmVzZW50ZXIuc2V0U2Nyb2xsVG9wKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnd2hlbiB0aGUgaW5kZXBlbmRlbnRNaW5pbWFwU2Nyb2xsIHNldHRpbmcgaXMgdHJ1ZScsICgpID0+IHtcbiAgICAgICAgICBsZXQgcHJldmlvdXNTY3JvbGxUb3BcblxuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmluZGVwZW5kZW50TWluaW1hcFNjcm9sbCcsIHRydWUpXG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuc2Nyb2xsU2Vuc2l0aXZpdHknLCAwLjUpXG5cbiAgICAgICAgICAgIHNweU9uKGVkaXRvckVsZW1lbnQuY29tcG9uZW50LnByZXNlbnRlciwgJ3NldFNjcm9sbFRvcCcpLmFuZENhbGxGYWtlKCgpID0+IHt9KVxuXG4gICAgICAgICAgICBwcmV2aW91c1Njcm9sbFRvcCA9IG1pbmltYXAuZ2V0U2Nyb2xsVG9wKClcblxuICAgICAgICAgICAgbW91c2V3aGVlbChtaW5pbWFwRWxlbWVudCwgMCwgLTE1KVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnZG9lcyBub3QgcmVsYXkgdGhlIGV2ZW50cyB0byB0aGUgZWRpdG9yJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuY29tcG9uZW50LnByZXNlbnRlci5zZXRTY3JvbGxUb3ApLm5vdC50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3Njcm9sbHMgdGhlIG1pbmltYXAgaW5zdGVhZCcsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwLmdldFNjcm9sbFRvcCgpKS5ub3QudG9FcXVhbChwcmV2aW91c1Njcm9sbFRvcClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ2NsYW1wIHRoZSBtaW5pbWFwIHNjcm9sbCBpbnRvIHRoZSBsZWdpdCBib3VuZHMnLCAoKSA9PiB7XG4gICAgICAgICAgICBtb3VzZXdoZWVsKG1pbmltYXBFbGVtZW50LCAwLCAtMTAwMDAwKVxuXG4gICAgICAgICAgICBleHBlY3QobWluaW1hcC5nZXRTY3JvbGxUb3AoKSkudG9FcXVhbChtaW5pbWFwLmdldE1heFNjcm9sbFRvcCgpKVxuXG4gICAgICAgICAgICBtb3VzZXdoZWVsKG1pbmltYXBFbGVtZW50LCAwLCAxMDAwMDApXG5cbiAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwLmdldFNjcm9sbFRvcCgpKS50b0VxdWFsKDApXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCdtaWRkbGUgY2xpY2tpbmcgdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgICAgIGxldCBbY2FudmFzLCB2aXNpYmxlQXJlYSwgb3JpZ2luYWxMZWZ0LCBtYXhTY3JvbGxdID0gW11cblxuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBjYW52YXMgPSBtaW5pbWFwRWxlbWVudC5nZXRGcm9udENhbnZhcygpXG4gICAgICAgICAgdmlzaWJsZUFyZWEgPSBtaW5pbWFwRWxlbWVudC52aXNpYmxlQXJlYVxuICAgICAgICAgIG9yaWdpbmFsTGVmdCA9IHZpc2libGVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnRcbiAgICAgICAgICBtYXhTY3JvbGwgPSBtaW5pbWFwLmdldFRleHRFZGl0b3JNYXhTY3JvbGxUb3AoKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdzY3JvbGxzIHRvIHRoZSB0b3AgdXNpbmcgdGhlIG1pZGRsZSBtb3VzZSBidXR0b24nLCAoKSA9PiB7XG4gICAgICAgICAgbW91c2Vkb3duKGNhbnZhcywge3g6IG9yaWdpbmFsTGVmdCArIDEsIHk6IDAsIGJ0bjogMX0pXG4gICAgICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKCkpLnRvRXF1YWwoMClcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnc2Nyb2xsaW5nIHRvIHRoZSBtaWRkbGUgdXNpbmcgdGhlIG1pZGRsZSBtb3VzZSBidXR0b24nLCAoKSA9PiB7XG4gICAgICAgICAgbGV0IGNhbnZhc01pZFlcblxuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgbGV0IGVkaXRvck1pZFkgPSBlZGl0b3JFbGVtZW50LmdldEhlaWdodCgpIC8gMi4wXG4gICAgICAgICAgICBsZXQge3RvcCwgaGVpZ2h0fSA9IGNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgICAgY2FudmFzTWlkWSA9IHRvcCArIChoZWlnaHQgLyAyLjApXG4gICAgICAgICAgICBsZXQgYWN0dWFsTWlkWSA9IE1hdGgubWluKGNhbnZhc01pZFksIGVkaXRvck1pZFkpXG4gICAgICAgICAgICBtb3VzZWRvd24oY2FudmFzLCB7eDogb3JpZ2luYWxMZWZ0ICsgMSwgeTogYWN0dWFsTWlkWSwgYnRuOiAxfSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3Njcm9sbHMgdGhlIGVkaXRvciB0byB0aGUgbWlkZGxlJywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IG1pZGRsZVNjcm9sbFRvcCA9IE1hdGgucm91bmQoKG1heFNjcm9sbCkgLyAyLjApXG4gICAgICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3AoKSkudG9FcXVhbChtaWRkbGVTY3JvbGxUb3ApXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCd1cGRhdGVzIHRoZSB2aXNpYmxlIGFyZWEgdG8gYmUgY2VudGVyZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcbiAgICAgICAgICAgICAgbGV0IHt0b3AsIGhlaWdodH0gPSB2aXNpYmxlQXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuXG4gICAgICAgICAgICAgIGxldCB2aXNpYmxlQ2VudGVyWSA9IHRvcCArIChoZWlnaHQgLyAyKVxuICAgICAgICAgICAgICBleHBlY3QodmlzaWJsZUNlbnRlclkpLnRvQmVDbG9zZVRvKDIwMCwgMClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnc2Nyb2xsaW5nIHRoZSBlZGl0b3IgdG8gYW4gYXJiaXRyYXJ5IGxvY2F0aW9uJywgKCkgPT4ge1xuICAgICAgICAgIGxldCBbc2Nyb2xsVG8sIHNjcm9sbFJhdGlvXSA9IFtdXG5cbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIHNjcm9sbFRvID0gMTAxIC8vIHBpeGVsc1xuICAgICAgICAgICAgc2Nyb2xsUmF0aW8gPSAoc2Nyb2xsVG8gLSBtaW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRIZWlnaHQoKSAvIDIpIC8gKG1pbmltYXAuZ2V0VmlzaWJsZUhlaWdodCgpIC0gbWluaW1hcC5nZXRUZXh0RWRpdG9yU2NhbGVkSGVpZ2h0KCkpXG4gICAgICAgICAgICBzY3JvbGxSYXRpbyA9IE1hdGgubWF4KDAsIHNjcm9sbFJhdGlvKVxuICAgICAgICAgICAgc2Nyb2xsUmF0aW8gPSBNYXRoLm1pbigxLCBzY3JvbGxSYXRpbylcblxuICAgICAgICAgICAgbW91c2Vkb3duKGNhbnZhcywge3g6IG9yaWdpbmFsTGVmdCArIDEsIHk6IHNjcm9sbFRvLCBidG46IDF9KVxuXG4gICAgICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3Njcm9sbHMgdGhlIGVkaXRvciB0byBhbiBhcmJpdHJhcnkgbG9jYXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgZXhwZWN0ZWRTY3JvbGwgPSBtYXhTY3JvbGwgKiBzY3JvbGxSYXRpb1xuICAgICAgICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKCkpLnRvQmVDbG9zZVRvKGV4cGVjdGVkU2Nyb2xsLCAwKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBkZXNjcmliZSgnZHJhZ2dpbmcgdGhlIHZpc2libGUgYXJlYSB3aXRoIG1pZGRsZSBtb3VzZSBidXR0b24gJyArXG4gICAgICAgICAgJ2FmdGVyIHNjcm9sbGluZyB0byB0aGUgYXJiaXRyYXJ5IGxvY2F0aW9uJywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IFtvcmlnaW5hbFRvcF0gPSBbXVxuXG4gICAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgICAgb3JpZ2luYWxUb3AgPSB2aXNpYmxlQXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3BcbiAgICAgICAgICAgICAgbW91c2Vtb3ZlKHZpc2libGVBcmVhLCB7eDogb3JpZ2luYWxMZWZ0ICsgMSwgeTogc2Nyb2xsVG8gKyA0MCwgYnRuOiAxfSlcblxuICAgICAgICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICAgIG1pbmltYXBFbGVtZW50LmVuZERyYWcoKVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgaXQoJ3Njcm9sbHMgdGhlIGVkaXRvciBzbyB0aGF0IHRoZSB2aXNpYmxlIGFyZWEgd2FzIG1vdmVkIGRvd24gJyArXG4gICAgICAgICAgICAnYnkgNDAgcGl4ZWxzIGZyb20gdGhlIGFyYml0cmFyeSBsb2NhdGlvbicsICgpID0+IHtcbiAgICAgICAgICAgICAgbGV0IHt0b3B9ID0gdmlzaWJsZUFyZWEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICAgICAgZXhwZWN0KHRvcCkudG9CZUNsb3NlVG8ob3JpZ2luYWxUb3AgKyA0MCwgLTEpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgncHJlc3NpbmcgdGhlIG1vdXNlIG9uIHRoZSBtaW5pbWFwIGNhbnZhcyAod2l0aG91dCBzY3JvbGwgYW5pbWF0aW9uKScsICgpID0+IHtcbiAgICAgICAgbGV0IGNhbnZhc1xuXG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGxldCB0ID0gMFxuICAgICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAnZ2V0VGltZScpLmFuZENhbGxGYWtlKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBuID0gdFxuICAgICAgICAgICAgdCArPSAxMDBcbiAgICAgICAgICAgIHJldHVybiBuXG4gICAgICAgICAgfSlcbiAgICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ3JlcXVlc3RVcGRhdGUnKS5hbmRDYWxsRmFrZSgoKSA9PiB7fSlcblxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5zY3JvbGxBbmltYXRpb24nLCBmYWxzZSlcblxuICAgICAgICAgIGNhbnZhcyA9IG1pbmltYXBFbGVtZW50LmdldEZyb250Q2FudmFzKClcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnc2Nyb2xscyB0aGUgZWRpdG9yIHRvIHRoZSBsaW5lIGJlbG93IHRoZSBtb3VzZScsICgpID0+IHtcbiAgICAgICAgICBtb3VzZWRvd24oY2FudmFzKVxuICAgICAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcCgpKS50b0JlQ2xvc2VUbyg0ODApXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ3doZW4gaW5kZXBlbmRlbnRNaW5pbWFwU2Nyb2xsIHNldHRpbmcgaXMgZW5hYmxlZCcsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIG1pbmltYXAuc2V0U2Nyb2xsVG9wKDEwMDApXG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuaW5kZXBlbmRlbnRNaW5pbWFwU2Nyb2xsJywgdHJ1ZSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3Njcm9sbHMgdGhlIGVkaXRvciB0byB0aGUgbGluZSBiZWxvdyB0aGUgbW91c2UnLCAoKSA9PiB7XG4gICAgICAgICAgICBtb3VzZWRvd24oY2FudmFzKVxuICAgICAgICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKCkpLnRvQmVDbG9zZVRvKDQ4MClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3ByZXNzaW5nIHRoZSBtb3VzZSBvbiB0aGUgbWluaW1hcCBjYW52YXMgKHdpdGggc2Nyb2xsIGFuaW1hdGlvbiknLCAoKSA9PiB7XG4gICAgICAgIGxldCBjYW52YXNcblxuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBsZXQgdCA9IDBcbiAgICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ2dldFRpbWUnKS5hbmRDYWxsRmFrZSgoKSA9PiB7XG4gICAgICAgICAgICBsZXQgbiA9IHRcbiAgICAgICAgICAgIHQgKz0gMTAwXG4gICAgICAgICAgICByZXR1cm4gblxuICAgICAgICAgIH0pXG4gICAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdyZXF1ZXN0VXBkYXRlJykuYW5kQ2FsbEZha2UoKCkgPT4ge30pXG5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuc2Nyb2xsQW5pbWF0aW9uJywgdHJ1ZSlcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuc2Nyb2xsQW5pbWF0aW9uRHVyYXRpb24nLCAzMDApXG5cbiAgICAgICAgICBjYW52YXMgPSBtaW5pbWFwRWxlbWVudC5nZXRGcm9udENhbnZhcygpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3Njcm9sbHMgdGhlIGVkaXRvciBncmFkdWFsbHkgdG8gdGhlIGxpbmUgYmVsb3cgdGhlIG1vdXNlJywgKCkgPT4ge1xuICAgICAgICAgIG1vdXNlZG93bihjYW52YXMpXG4gICAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLy8gd2FpdCB1bnRpbCBhbGwgYW5pbWF0aW9ucyBydW4gb3V0XG4gICAgICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lICYmIG5leHRBbmltYXRpb25GcmFtZSgpXG4gICAgICAgICAgICByZXR1cm4gZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3AoKSA+PSA0ODBcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdzdG9wcyB0aGUgYW5pbWF0aW9uIGlmIHRoZSB0ZXh0IGVkaXRvciBpcyBkZXN0cm95ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgbW91c2Vkb3duKGNhbnZhcylcbiAgICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgZWRpdG9yLmRlc3Ryb3koKVxuXG4gICAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWUgJiYgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICAgICAgZXhwZWN0KG5leHRBbmltYXRpb25GcmFtZSA9PT0gbm9BbmltYXRpb25GcmFtZSlcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCd3aGVuIGluZGVwZW5kZW50TWluaW1hcFNjcm9sbCBzZXR0aW5nIGlzIGVuYWJsZWQnLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBtaW5pbWFwLnNldFNjcm9sbFRvcCgxMDAwKVxuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmluZGVwZW5kZW50TWluaW1hcFNjcm9sbCcsIHRydWUpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdzY3JvbGxzIHRoZSBlZGl0b3IgZ3JhZHVhbGx5IHRvIHRoZSBsaW5lIGJlbG93IHRoZSBtb3VzZScsICgpID0+IHtcbiAgICAgICAgICAgIG1vdXNlZG93bihjYW52YXMpXG4gICAgICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAvLyB3YWl0IHVudGlsIGFsbCBhbmltYXRpb25zIHJ1biBvdXRcbiAgICAgICAgICAgIHdhaXRzRm9yKCgpID0+IHtcbiAgICAgICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lICYmIG5leHRBbmltYXRpb25GcmFtZSgpXG4gICAgICAgICAgICAgIHJldHVybiBlZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcCgpID49IDQ4MFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3N0b3BzIHRoZSBhbmltYXRpb24gaWYgdGhlIHRleHQgZWRpdG9yIGlzIGRlc3Ryb3llZCcsICgpID0+IHtcbiAgICAgICAgICAgIG1vdXNlZG93bihjYW52YXMpXG4gICAgICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgICBlZGl0b3IuZGVzdHJveSgpXG5cbiAgICAgICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lICYmIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICAgICAgZXhwZWN0KG5leHRBbmltYXRpb25GcmFtZSA9PT0gbm9BbmltYXRpb25GcmFtZSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCdkcmFnZ2luZyB0aGUgdmlzaWJsZSBhcmVhJywgKCkgPT4ge1xuICAgICAgICBsZXQgW3Zpc2libGVBcmVhLCBvcmlnaW5hbFRvcF0gPSBbXVxuXG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIHZpc2libGVBcmVhID0gbWluaW1hcEVsZW1lbnQudmlzaWJsZUFyZWFcbiAgICAgICAgICBsZXQgbyA9IHZpc2libGVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgbGV0IGxlZnQgPSBvLmxlZnRcbiAgICAgICAgICBvcmlnaW5hbFRvcCA9IG8udG9wXG5cbiAgICAgICAgICBtb3VzZWRvd24odmlzaWJsZUFyZWEsIHt4OiBsZWZ0ICsgMTAsIHk6IG9yaWdpbmFsVG9wICsgMTB9KVxuICAgICAgICAgIG1vdXNlbW92ZSh2aXNpYmxlQXJlYSwge3g6IGxlZnQgKyAxMCwgeTogb3JpZ2luYWxUb3AgKyA1MH0pXG5cbiAgICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgfSlcbiAgICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBhZnRlckVhY2goKCkgPT4ge1xuICAgICAgICAgIG1pbmltYXBFbGVtZW50LmVuZERyYWcoKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdzY3JvbGxzIHRoZSBlZGl0b3Igc28gdGhhdCB0aGUgdmlzaWJsZSBhcmVhIHdhcyBtb3ZlZCBkb3duIGJ5IDQwIHBpeGVscycsICgpID0+IHtcbiAgICAgICAgICBsZXQge3RvcH0gPSB2aXNpYmxlQXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgIGV4cGVjdCh0b3ApLnRvQmVDbG9zZVRvKG9yaWdpbmFsVG9wICsgNDAsIC0xKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdzdG9wcyB0aGUgZHJhZyBnZXN0dXJlIHdoZW4gdGhlIG1vdXNlIGlzIHJlbGVhc2VkIG91dHNpZGUgdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgICAgICAgbGV0IHt0b3AsIGxlZnR9ID0gdmlzaWJsZUFyZWEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICBtb3VzZXVwKGphc21pbmVDb250ZW50LCB7eDogbGVmdCAtIDEwLCB5OiB0b3AgKyA4MH0pXG5cbiAgICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ2RyYWcnKVxuICAgICAgICAgIG1vdXNlbW92ZSh2aXNpYmxlQXJlYSwge3g6IGxlZnQgKyAxMCwgeTogdG9wICsgNTB9KVxuXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmRyYWcpLm5vdC50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCdkcmFnZ2luZyB0aGUgdmlzaWJsZSBhcmVhIHVzaW5nIHRvdWNoIGV2ZW50cycsICgpID0+IHtcbiAgICAgICAgbGV0IFt2aXNpYmxlQXJlYSwgb3JpZ2luYWxUb3BdID0gW11cblxuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICB2aXNpYmxlQXJlYSA9IG1pbmltYXBFbGVtZW50LnZpc2libGVBcmVhXG4gICAgICAgICAgbGV0IG8gPSB2aXNpYmxlQXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgIGxldCBsZWZ0ID0gby5sZWZ0XG4gICAgICAgICAgb3JpZ2luYWxUb3AgPSBvLnRvcFxuXG4gICAgICAgICAgdG91Y2hzdGFydCh2aXNpYmxlQXJlYSwge3g6IGxlZnQgKyAxMCwgeTogb3JpZ2luYWxUb3AgKyAxMH0pXG4gICAgICAgICAgdG91Y2htb3ZlKHZpc2libGVBcmVhLCB7eDogbGVmdCArIDEwLCB5OiBvcmlnaW5hbFRvcCArIDUwfSlcblxuICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgICAgICAgbWluaW1hcEVsZW1lbnQuZW5kRHJhZygpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3Njcm9sbHMgdGhlIGVkaXRvciBzbyB0aGF0IHRoZSB2aXNpYmxlIGFyZWEgd2FzIG1vdmVkIGRvd24gYnkgNDAgcGl4ZWxzJywgKCkgPT4ge1xuICAgICAgICAgIGxldCB7dG9wfSA9IHZpc2libGVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgZXhwZWN0KHRvcCkudG9CZUNsb3NlVG8ob3JpZ2luYWxUb3AgKyA0MCwgLTEpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3N0b3BzIHRoZSBkcmFnIGdlc3R1cmUgd2hlbiB0aGUgbW91c2UgaXMgcmVsZWFzZWQgb3V0c2lkZSB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgICBsZXQge3RvcCwgbGVmdH0gPSB2aXNpYmxlQXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgIG1vdXNldXAoamFzbWluZUNvbnRlbnQsIHt4OiBsZWZ0IC0gMTAsIHk6IHRvcCArIDgwfSlcblxuICAgICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAnZHJhZycpXG4gICAgICAgICAgdG91Y2htb3ZlKHZpc2libGVBcmVhLCB7eDogbGVmdCArIDEwLCB5OiB0b3AgKyA1MH0pXG5cbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZHJhZykubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIG1pbmltYXAgY2Fubm90IHNjcm9sbCcsICgpID0+IHtcbiAgICAgICAgbGV0IFt2aXNpYmxlQXJlYSwgb3JpZ2luYWxUb3BdID0gW11cblxuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBsZXQgc2FtcGxlID0gZnMucmVhZEZpbGVTeW5jKGRpci5yZXNvbHZlKCdzZXZlbnR5LnR4dCcpKS50b1N0cmluZygpXG4gICAgICAgICAgZWRpdG9yLnNldFRleHQoc2FtcGxlKVxuICAgICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDApXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ2RyYWdnaW5nIHRoZSB2aXNpYmxlIGFyZWEnLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICAgICAgICB2aXNpYmxlQXJlYSA9IG1pbmltYXBFbGVtZW50LnZpc2libGVBcmVhXG4gICAgICAgICAgICAgIGxldCB7dG9wLCBsZWZ0fSA9IHZpc2libGVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgICAgIG9yaWdpbmFsVG9wID0gdG9wXG5cbiAgICAgICAgICAgICAgbW91c2Vkb3duKHZpc2libGVBcmVhLCB7eDogbGVmdCArIDEwLCB5OiB0b3AgKyAxMH0pXG4gICAgICAgICAgICAgIG1vdXNlbW92ZSh2aXNpYmxlQXJlYSwge3g6IGxlZnQgKyAxMCwgeTogdG9wICsgNTB9KVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBtaW5pbWFwRWxlbWVudC5lbmREcmFnKClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3Njcm9sbHMgYmFzZWQgb24gYSByYXRpbyBhZGp1c3RlZCB0byB0aGUgbWluaW1hcCBoZWlnaHQnLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQge3RvcH0gPSB2aXNpYmxlQXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgICAgZXhwZWN0KHRvcCkudG9CZUNsb3NlVG8ob3JpZ2luYWxUb3AgKyA0MCwgLTEpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIHNjcm9sbCBwYXN0IGVuZCBpcyBlbmFibGVkJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5zY3JvbGxQYXN0RW5kJywgdHJ1ZSlcblxuICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCdkcmFnZ2luZyB0aGUgdmlzaWJsZSBhcmVhJywgKCkgPT4ge1xuICAgICAgICAgIGxldCBbb3JpZ2luYWxUb3AsIHZpc2libGVBcmVhXSA9IFtdXG5cbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIHZpc2libGVBcmVhID0gbWluaW1hcEVsZW1lbnQudmlzaWJsZUFyZWFcbiAgICAgICAgICAgIGxldCB7dG9wLCBsZWZ0fSA9IHZpc2libGVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgICBvcmlnaW5hbFRvcCA9IHRvcFxuXG4gICAgICAgICAgICBtb3VzZWRvd24odmlzaWJsZUFyZWEsIHt4OiBsZWZ0ICsgMTAsIHk6IHRvcCArIDEwfSlcbiAgICAgICAgICAgIG1vdXNlbW92ZSh2aXNpYmxlQXJlYSwge3g6IGxlZnQgKyAxMCwgeTogdG9wICsgNTB9KVxuXG4gICAgICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIG1pbmltYXBFbGVtZW50LmVuZERyYWcoKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnc2Nyb2xscyB0aGUgZWRpdG9yIHNvIHRoYXQgdGhlIHZpc2libGUgYXJlYSB3YXMgbW92ZWQgZG93biBieSA0MCBwaXhlbHMnLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQge3RvcH0gPSB2aXNpYmxlQXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgICAgZXhwZWN0KHRvcCkudG9CZUNsb3NlVG8ob3JpZ2luYWxUb3AgKyA0MCwgLTEpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIC8vICAgICAjIyMjIyMgICMjIyMjIyMjICAgICMjIyAgICAjIyAgICAjIyAjIyMjIyMjI1xuICAgIC8vICAgICMjICAgICMjICAgICMjICAgICAgIyMgIyMgICAjIyMgICAjIyAjIyAgICAgIyNcbiAgICAvLyAgICAjIyAgICAgICAgICAjIyAgICAgIyMgICAjIyAgIyMjIyAgIyMgIyMgICAgICMjXG4gICAgLy8gICAgICMjIyMjIyAgICAgIyMgICAgIyMgICAgICMjICMjICMjICMjICMjICAgICAjI1xuICAgIC8vICAgICAgICAgICMjICAgICMjICAgICMjIyMjIyMjIyAjIyAgIyMjIyAjIyAgICAgIyNcbiAgICAvLyAgICAjIyAgICAjIyAgICAjIyAgICAjIyAgICAgIyMgIyMgICAjIyMgIyMgICAgICMjXG4gICAgLy8gICAgICMjIyMjIyAgICAgIyMgICAgIyMgICAgICMjICMjICAgICMjICMjIyMjIyMjXG4gICAgLy9cbiAgICAvLyAgICAgICAjIyMgICAgIyMgICAgICAgICMjIyMjIyMgICMjICAgICMjICMjIyMjIyMjXG4gICAgLy8gICAgICAjIyAjIyAgICMjICAgICAgICMjICAgICAjIyAjIyMgICAjIyAjI1xuICAgIC8vICAgICAjIyAgICMjICAjIyAgICAgICAjIyAgICAgIyMgIyMjIyAgIyMgIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICMjICMjICMjICMjICMjIyMjI1xuICAgIC8vICAgICMjIyMjIyMjIyAjIyAgICAgICAjIyAgICAgIyMgIyMgICMjIyMgIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICMjICMjICAgIyMjICMjXG4gICAgLy8gICAgIyMgICAgICMjICMjIyMjIyMjICAjIyMjIyMjICAjIyAgICAjIyAjIyMjIyMjI1xuXG4gICAgZGVzY3JpYmUoJ3doZW4gdGhlIG1vZGVsIGlzIGEgc3RhbmQtYWxvbmUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBtaW5pbWFwLnNldFN0YW5kQWxvbmUodHJ1ZSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdoYXMgYSBzdGFuZC1hbG9uZSBhdHRyaWJ1dGUnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5oYXNBdHRyaWJ1dGUoJ3N0YW5kLWFsb25lJykpLnRvQmVUcnV0aHkoKVxuICAgICAgfSlcblxuICAgICAgaXQoJ3NldHMgdGhlIG1pbmltYXAgc2l6ZSB3aGVuIG1lYXN1cmVkJywgKCkgPT4ge1xuICAgICAgICBtaW5pbWFwRWxlbWVudC5tZWFzdXJlSGVpZ2h0QW5kV2lkdGgoKVxuXG4gICAgICAgIGV4cGVjdChtaW5pbWFwLndpZHRoKS50b0VxdWFsKG1pbmltYXBFbGVtZW50LmNsaWVudFdpZHRoKVxuICAgICAgICBleHBlY3QobWluaW1hcC5oZWlnaHQpLnRvRXF1YWwobWluaW1hcEVsZW1lbnQuY2xpZW50SGVpZ2h0KVxuICAgICAgfSlcblxuICAgICAgaXQoJ3JlbW92ZXMgdGhlIGNvbnRyb2xzIGRpdicsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm1pbmltYXAtY29udHJvbHMnKSkudG9CZU51bGwoKVxuICAgICAgfSlcblxuICAgICAgaXQoJ3JlbW92ZXMgdGhlIHZpc2libGUgYXJlYScsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnZpc2libGVBcmVhKS50b0JlVW5kZWZpbmVkKClcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZW1vdmVzIHRoZSBxdWljayBzZXR0aW5ncyBidXR0b24nLCAoKSA9PiB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5kaXNwbGF5UGx1Z2luc0NvbnRyb2xzJywgdHJ1ZSlcblxuICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICB9KVxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5vcGVuUXVpY2tTZXR0aW5ncykudG9CZVVuZGVmaW5lZCgpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVtb3ZlcyB0aGUgc2Nyb2xsIGluZGljYXRvcicsICgpID0+IHtcbiAgICAgICAgZWRpdG9yLnNldFRleHQobWVkaXVtU2FtcGxlKVxuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCg1MClcblxuICAgICAgICB3YWl0c0ZvcignbWluaW1hcCBmcmFtZSByZXF1ZXN0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG1pbmltYXBFbGVtZW50LmZyYW1lUmVxdWVzdGVkXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLm1pbmltYXBTY3JvbGxJbmRpY2F0b3InLCB0cnVlKVxuICAgICAgICB9KVxuXG4gICAgICAgIHdhaXRzRm9yKCdtaW5pbWFwIGZyYW1lIHJlcXVlc3RlZCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWRcbiAgICAgICAgfSlcbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcubWluaW1hcC1zY3JvbGwtaW5kaWNhdG9yJykpLnRvQmVOdWxsKClcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCdwcmVzc2luZyB0aGUgbW91c2Ugb24gdGhlIG1pbmltYXAgY2FudmFzJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBqYXNtaW5lQ29udGVudC5hcHBlbmRDaGlsZChtaW5pbWFwRWxlbWVudClcblxuICAgICAgICAgIGxldCB0ID0gMFxuICAgICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAnZ2V0VGltZScpLmFuZENhbGxGYWtlKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBuID0gdFxuICAgICAgICAgICAgdCArPSAxMDBcbiAgICAgICAgICAgIHJldHVybiBuXG4gICAgICAgICAgfSlcbiAgICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ3JlcXVlc3RVcGRhdGUnKS5hbmRDYWxsRmFrZSgoKSA9PiB7fSlcblxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5zY3JvbGxBbmltYXRpb24nLCBmYWxzZSlcblxuICAgICAgICAgIGNhbnZhcyA9IG1pbmltYXBFbGVtZW50LmdldEZyb250Q2FudmFzKClcbiAgICAgICAgICBtb3VzZWRvd24oY2FudmFzKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdkb2VzIG5vdCBzY3JvbGwgdGhlIGVkaXRvciB0byB0aGUgbGluZSBiZWxvdyB0aGUgbW91c2UnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKCkpLnRvRXF1YWwoMTAwMClcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCdhbmQgaXMgY2hhbmdlZCB0byBiZSBhIGNsYXNzaWNhbCBtaW5pbWFwIGFnYWluJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuZGlzcGxheVBsdWdpbnNDb250cm9scycsIHRydWUpXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLm1pbmltYXBTY3JvbGxJbmRpY2F0b3InLCB0cnVlKVxuXG4gICAgICAgICAgbWluaW1hcC5zZXRTdGFuZEFsb25lKGZhbHNlKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdyZWNyZWF0ZXMgdGhlIGRlc3Ryb3llZCBlbGVtZW50cycsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcubWluaW1hcC1jb250cm9scycpKS50b0V4aXN0KClcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcubWluaW1hcC12aXNpYmxlLWFyZWEnKSkudG9FeGlzdCgpXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm1pbmltYXAtc2Nyb2xsLWluZGljYXRvcicpKS50b0V4aXN0KClcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcub3Blbi1taW5pbWFwLXF1aWNrLXNldHRpbmdzJykpLnRvRXhpc3QoKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgLy8gICAgIyMjIyMjIyMgICMjIyMjIyMjICAjIyMjIyMgICMjIyMjIyMjICMjIyMjIyMjICAgIyMjIyMjIyAgIyMgICAgIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgIyMgICAgIyMgICAgIyMgICAgICMjICMjICAgICAjIyAgIyMgICMjXG4gICAgLy8gICAgIyMgICAgICMjICMjICAgICAgICMjICAgICAgICAgICMjICAgICMjICAgICAjIyAjIyAgICAgIyMgICAjIyMjXG4gICAgLy8gICAgIyMgICAgICMjICMjIyMjIyAgICAjIyMjIyMgICAgICMjICAgICMjIyMjIyMjICAjIyAgICAgIyMgICAgIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMgICAgICAgICAgICAgIyMgICAgIyMgICAgIyMgICAjIyAgICMjICAgICAjIyAgICAjI1xuICAgIC8vICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAjIyAgICAjIyAgICAjIyAgICAjIyAgIyMgICAgICMjICAgICMjXG4gICAgLy8gICAgIyMjIyMjIyMgICMjIyMjIyMjICAjIyMjIyMgICAgICMjICAgICMjICAgICAjIyAgIyMjIyMjIyAgICAgIyNcblxuICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBtb2RlbCBpcyBkZXN0cm95ZWQnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgbWluaW1hcC5kZXN0cm95KClcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdkZXRhY2hlcyBpdHNlbGYgZnJvbSBpdHMgcGFyZW50JywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQucGFyZW50Tm9kZSkudG9CZU51bGwoKVxuICAgICAgfSlcblxuICAgICAgaXQoJ3N0b3BzIHRoZSBET00gcG9sbGluZyBpbnRlcnZhbCcsICgpID0+IHtcbiAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdwb2xsRE9NJylcblxuICAgICAgICBzbGVlcCgyMDApXG5cbiAgICAgICAgcnVucygoKSA9PiB7IGV4cGVjdChtaW5pbWFwRWxlbWVudC5wb2xsRE9NKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICAvLyAgICAgIyMjIyMjICAgIyMjIyMjIyAgIyMgICAgIyMgIyMjIyMjIyMgIyMjIyAgIyMjIyMjXG4gICAgLy8gICAgIyMgICAgIyMgIyMgICAgICMjICMjIyAgICMjICMjICAgICAgICAjIyAgIyMgICAgIyNcbiAgICAvLyAgICAjIyAgICAgICAjIyAgICAgIyMgIyMjIyAgIyMgIyMgICAgICAgICMjICAjI1xuICAgIC8vICAgICMjICAgICAgICMjICAgICAjIyAjIyAjIyAjIyAjIyMjIyMgICAgIyMgICMjICAgIyMjI1xuICAgIC8vICAgICMjICAgICAgICMjICAgICAjIyAjIyAgIyMjIyAjIyAgICAgICAgIyMgICMjICAgICMjXG4gICAgLy8gICAgIyMgICAgIyMgIyMgICAgICMjICMjICAgIyMjICMjICAgICAgICAjIyAgIyMgICAgIyNcbiAgICAvLyAgICAgIyMjIyMjICAgIyMjIyMjIyAgIyMgICAgIyMgIyMgICAgICAgIyMjIyAgIyMjIyMjXG5cbiAgICBkZXNjcmliZSgnd2hlbiB0aGUgYXRvbSBzdHlsZXMgYXJlIGNoYW5nZWQnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgfSlcbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcbiAgICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ3JlcXVlc3RGb3JjZWRVcGRhdGUnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdpbnZhbGlkYXRlRE9NU3R5bGVzQ2FjaGUnKS5hbmRDYWxsVGhyb3VnaCgpXG5cbiAgICAgICAgICBsZXQgc3R5bGVOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuICAgICAgICAgIHN0eWxlTm9kZS50ZXh0Q29udGVudCA9ICdib2R5eyBjb2xvcjogIzIzMyB9J1xuICAgICAgICAgIGF0b20uc3R5bGVzLmVtaXR0ZXIuZW1pdCgnZGlkLWFkZC1zdHlsZS1lbGVtZW50Jywgc3R5bGVOb2RlKVxuICAgICAgICB9KVxuXG4gICAgICAgIHdhaXRzRm9yKCdtaW5pbWFwIGZyYW1lIHJlcXVlc3RlZCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWRcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdmb3JjZXMgYSByZWZyZXNoIHdpdGggY2FjaGUgaW52YWxpZGF0aW9uJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQucmVxdWVzdEZvcmNlZFVwZGF0ZSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5pbnZhbGlkYXRlRE9NU3R5bGVzQ2FjaGUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gbWluaW1hcC50ZXh0T3BhY2l0eSBpcyBjaGFuZ2VkJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAncmVxdWVzdEZvcmNlZFVwZGF0ZScpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLnRleHRPcGFjaXR5JywgMC4zKVxuXG4gICAgICAgIHdhaXRzRm9yKCdtaW5pbWFwIGZyYW1lIHJlcXVlc3RlZCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWRcbiAgICAgICAgfSlcbiAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVxdWVzdHMgYSBjb21wbGV0ZSB1cGRhdGUnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5yZXF1ZXN0Rm9yY2VkVXBkYXRlKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCd3aGVuIG1pbmltYXAuZGlzcGxheUNvZGVIaWdobGlnaHRzIGlzIGNoYW5nZWQnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdyZXF1ZXN0Rm9yY2VkVXBkYXRlJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuZGlzcGxheUNvZGVIaWdobGlnaHRzJywgdHJ1ZSlcblxuICAgICAgICB3YWl0c0ZvcignbWluaW1hcCBmcmFtZSByZXF1ZXN0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG1pbmltYXBFbGVtZW50LmZyYW1lUmVxdWVzdGVkXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ3JlcXVlc3RzIGEgY29tcGxldGUgdXBkYXRlJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQucmVxdWVzdEZvcmNlZFVwZGF0ZSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnd2hlbiBtaW5pbWFwLmNoYXJXaWR0aCBpcyBjaGFuZ2VkJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAncmVxdWVzdEZvcmNlZFVwZGF0ZScpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmNoYXJXaWR0aCcsIDEpXG5cbiAgICAgICAgd2FpdHNGb3IoJ21pbmltYXAgZnJhbWUgcmVxdWVzdGVkJywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZFxuICAgICAgICB9KVxuICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZXF1ZXN0cyBhIGNvbXBsZXRlIHVwZGF0ZScsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnJlcXVlc3RGb3JjZWRVcGRhdGUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gbWluaW1hcC5jaGFySGVpZ2h0IGlzIGNoYW5nZWQnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdyZXF1ZXN0Rm9yY2VkVXBkYXRlJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuY2hhckhlaWdodCcsIDEpXG5cbiAgICAgICAgd2FpdHNGb3IoJ21pbmltYXAgZnJhbWUgcmVxdWVzdGVkJywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZFxuICAgICAgICB9KVxuICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZXF1ZXN0cyBhIGNvbXBsZXRlIHVwZGF0ZScsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnJlcXVlc3RGb3JjZWRVcGRhdGUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gbWluaW1hcC5pbnRlcmxpbmUgaXMgY2hhbmdlZCcsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ3JlcXVlc3RGb3JjZWRVcGRhdGUnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5pbnRlcmxpbmUnLCAyKVxuXG4gICAgICAgIHdhaXRzRm9yKCdtaW5pbWFwIGZyYW1lIHJlcXVlc3RlZCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWRcbiAgICAgICAgfSlcbiAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVxdWVzdHMgYSBjb21wbGV0ZSB1cGRhdGUnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5yZXF1ZXN0Rm9yY2VkVXBkYXRlKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCd3aGVuIG1pbmltYXAuZGlzcGxheU1pbmltYXBPbkxlZnQgc2V0dGluZyBpcyB0cnVlJywgKCkgPT4ge1xuICAgICAgaXQoJ21vdmVzIHRoZSBhdHRhY2hlZCBtaW5pbWFwIHRvIHRoZSBsZWZ0JywgKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuZGlzcGxheU1pbmltYXBPbkxlZnQnLCB0cnVlKVxuICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdsZWZ0JykpLnRvQmVUcnV0aHkoKVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIG1pbmltYXAgaXMgbm90IGF0dGFjaGVkIHlldCcsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuYnVpbGRUZXh0RWRpdG9yKHt9KVxuICAgICAgICAgIGVkaXRvckVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKVxuICAgICAgICAgIGVkaXRvckVsZW1lbnQuc2V0SGVpZ2h0KDUwKVxuICAgICAgICAgIGVkaXRvci5zZXRMaW5lSGVpZ2h0SW5QaXhlbHMoMTApXG5cbiAgICAgICAgICBtaW5pbWFwID0gbmV3IE1pbmltYXAoe3RleHRFZGl0b3I6IGVkaXRvcn0pXG4gICAgICAgICAgbWluaW1hcEVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcobWluaW1hcClcblxuICAgICAgICAgIGphc21pbmVDb250ZW50Lmluc2VydEJlZm9yZShlZGl0b3JFbGVtZW50LCBqYXNtaW5lQ29udGVudC5maXJzdENoaWxkKVxuXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmRpc3BsYXlNaW5pbWFwT25MZWZ0JywgdHJ1ZSlcbiAgICAgICAgICBtaW5pbWFwRWxlbWVudC5hdHRhY2goKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdtb3ZlcyB0aGUgYXR0YWNoZWQgbWluaW1hcCB0byB0aGUgbGVmdCcsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdsZWZ0JykpLnRvQmVUcnV0aHkoKVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gbWluaW1hcC5hZGp1c3RNaW5pbWFwV2lkdGhUb1NvZnRXcmFwIGlzIHRydWUnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdlZGl0b3Iuc29mdFdyYXAnLCB0cnVlKVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5zb2Z0V3JhcEF0UHJlZmVycmVkTGluZUxlbmd0aCcsIHRydWUpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnByZWZlcnJlZExpbmVMZW5ndGgnLCAyKVxuXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5hZGp1c3RNaW5pbWFwV2lkdGhUb1NvZnRXcmFwJywgdHJ1ZSlcblxuICAgICAgICB3YWl0c0ZvcignbWluaW1hcCBmcmFtZSByZXF1ZXN0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG1pbmltYXBFbGVtZW50LmZyYW1lUmVxdWVzdGVkXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ2FkanVzdHMgdGhlIHdpZHRoIG9mIHRoZSBtaW5pbWFwIGNhbnZhcycsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmdldEZyb250Q2FudmFzKCkud2lkdGggLyBkZXZpY2VQaXhlbFJhdGlvKS50b0VxdWFsKDQpXG4gICAgICB9KVxuXG4gICAgICBpdCgnb2Zmc2V0cyB0aGUgbWluaW1hcCBieSB0aGUgZGlmZmVyZW5jZScsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRMZWZ0KG1pbmltYXBFbGVtZW50KSkudG9CZUNsb3NlVG8oZWRpdG9yRWxlbWVudC5jbGllbnRXaWR0aCAtIDQsIC0xKVxuICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuY2xpZW50V2lkdGgpLnRvRXF1YWwoNClcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd0aGUgZG9tIHBvbGxpbmcgcm91dGluZScsICgpID0+IHtcbiAgICAgICAgaXQoJ2RvZXMgbm90IGNoYW5nZSB0aGUgdmFsdWUnLCAoKSA9PiB7XG4gICAgICAgICAgYXRvbS52aWV3cy5wZXJmb3JtRG9jdW1lbnRQb2xsKClcblxuICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcbiAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5nZXRGcm9udENhbnZhcygpLndpZHRoIC8gZGV2aWNlUGl4ZWxSYXRpbykudG9FcXVhbCg0KVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiB0aGUgZWRpdG9yIGlzIHJlc2l6ZWQnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnByZWZlcnJlZExpbmVMZW5ndGgnLCA2KVxuICAgICAgICAgIGVkaXRvckVsZW1lbnQuc3R5bGUud2lkdGggPSAnMTAwcHgnXG4gICAgICAgICAgZWRpdG9yRWxlbWVudC5zdHlsZS5oZWlnaHQgPSAnMTAwcHgnXG5cbiAgICAgICAgICBhdG9tLnZpZXdzLnBlcmZvcm1Eb2N1bWVudFBvbGwoKVxuXG4gICAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICAgIH0pXG4gICAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ21ha2VzIHRoZSBtaW5pbWFwIHNtYWxsZXIgdGhhbiBzb2Z0IHdyYXAnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50Lm9mZnNldFdpZHRoKS50b0JlQ2xvc2VUbygxMiwgLTEpXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnN0eWxlLm1hcmdpblJpZ2h0KS50b0VxdWFsKCcnKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ2FuZCB3aGVuIG1pbmltYXAubWluaW1hcFNjcm9sbEluZGljYXRvciBzZXR0aW5nIGlzIHRydWUnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGVkaXRvci5zZXRUZXh0KG1lZGl1bVNhbXBsZSlcbiAgICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCg1MClcblxuICAgICAgICAgIHdhaXRzRm9yKCdtaW5pbWFwIGZyYW1lIHJlcXVlc3RlZCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZFxuICAgICAgICAgIH0pXG4gICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLm1pbmltYXBTY3JvbGxJbmRpY2F0b3InLCB0cnVlKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICB3YWl0c0ZvcignbWluaW1hcCBmcmFtZSByZXF1ZXN0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWRcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdvZmZzZXRzIHRoZSBzY3JvbGwgaW5kaWNhdG9yIGJ5IHRoZSBkaWZmZXJlbmNlJywgKCkgPT4ge1xuICAgICAgICAgIGxldCBpbmRpY2F0b3IgPSBtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5taW5pbWFwLXNjcm9sbC1pbmRpY2F0b3InKVxuICAgICAgICAgIGV4cGVjdChyZWFsT2Zmc2V0TGVmdChpbmRpY2F0b3IpKS50b0JlQ2xvc2VUbygyLCAtMSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCdhbmQgd2hlbiBtaW5pbWFwLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMgc2V0dGluZyBpcyB0cnVlJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuZGlzcGxheVBsdWdpbnNDb250cm9scycsIHRydWUpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ29mZnNldHMgdGhlIHNjcm9sbCBpbmRpY2F0b3IgYnkgdGhlIGRpZmZlcmVuY2UnLCAoKSA9PiB7XG4gICAgICAgICAgbGV0IG9wZW5RdWlja1NldHRpbmdzID0gbWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcub3Blbi1taW5pbWFwLXF1aWNrLXNldHRpbmdzJylcbiAgICAgICAgICBleHBlY3QocmVhbE9mZnNldExlZnQob3BlblF1aWNrU2V0dGluZ3MpKS5ub3QudG9CZUNsb3NlVG8oMiwgLTEpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnYW5kIHRoZW4gZGlzYWJsZWQnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5hZGp1c3RNaW5pbWFwV2lkdGhUb1NvZnRXcmFwJywgZmFsc2UpXG5cbiAgICAgICAgICB3YWl0c0ZvcignbWluaW1hcCBmcmFtZSByZXF1ZXN0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWRcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdhZGp1c3RzIHRoZSB3aWR0aCBvZiB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQub2Zmc2V0V2lkdGgpLnRvQmVDbG9zZVRvKGVkaXRvckVsZW1lbnQub2Zmc2V0V2lkdGggLyAxMCwgLTEpXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnN0eWxlLndpZHRoKS50b0VxdWFsKCcnKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ2FuZCB3aGVuIHByZWZlcnJlZExpbmVMZW5ndGggPj0gMTYzODQnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnByZWZlcnJlZExpbmVMZW5ndGgnLCAxNjM4NClcblxuICAgICAgICAgIHdhaXRzRm9yKCdtaW5pbWFwIGZyYW1lIHJlcXVlc3RlZCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZFxuICAgICAgICAgIH0pXG4gICAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ2FkanVzdHMgdGhlIHdpZHRoIG9mIHRoZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5vZmZzZXRXaWR0aCkudG9CZUNsb3NlVG8oZWRpdG9yRWxlbWVudC5vZmZzZXRXaWR0aCAvIDEwLCAtMSlcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuc3R5bGUud2lkdGgpLnRvRXF1YWwoJycpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiBhZGp1c3RNaW5pbWFwV2lkdGhPbmx5SWZTbWFsbGVyIGlzIGRpc2FibGVkJywgKCkgPT4ge1xuICAgICAgICBkZXNjcmliZSgnYW5kIHdoZW4gcHJlZmVycmVkTGluZUxlbmd0aCA+PSAxNjM4NCcsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5hZGp1c3RNaW5pbWFwV2lkdGhPbmx5SWZTbWFsbGVyJywgZmFsc2UpXG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5wcmVmZXJyZWRMaW5lTGVuZ3RoJywgMTYzODQpXG5cbiAgICAgICAgICAgIHdhaXRzRm9yKCdtaW5pbWFwIGZyYW1lIHJlcXVlc3RlZCcsICgpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIG1pbmltYXBFbGVtZW50LmZyYW1lUmVxdWVzdGVkXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdhZGp1c3RzIHRoZSB3aWR0aCBvZiB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5vZmZzZXRXaWR0aCkudG9CZUNsb3NlVG8oMTYzODQgKiAyKVxuICAgICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnN0eWxlLndpZHRoKS50b0VxdWFsKDE2Mzg0ICogMiArICdweCcpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCd3aGVuIG1pbmltYXAubWluaW1hcFNjcm9sbEluZGljYXRvciBzZXR0aW5nIGlzIHRydWUnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgZWRpdG9yLnNldFRleHQobWVkaXVtU2FtcGxlKVxuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCg1MClcblxuICAgICAgICB3YWl0c0ZvcignbWluaW1hcCBmcmFtZSByZXF1ZXN0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG1pbmltYXBFbGVtZW50LmZyYW1lUmVxdWVzdGVkXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5taW5pbWFwU2Nyb2xsSW5kaWNhdG9yJywgdHJ1ZSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdhZGRzIGEgc2Nyb2xsIGluZGljYXRvciBpbiB0aGUgZWxlbWVudCcsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm1pbmltYXAtc2Nyb2xsLWluZGljYXRvcicpKS50b0V4aXN0KClcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCdhbmQgdGhlbiBkZWFjdGl2YXRlZCcsICgpID0+IHtcbiAgICAgICAgaXQoJ3JlbW92ZXMgdGhlIHNjcm9sbCBpbmRpY2F0b3IgZnJvbSB0aGUgZWxlbWVudCcsICgpID0+IHtcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAubWluaW1hcFNjcm9sbEluZGljYXRvcicsIGZhbHNlKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5taW5pbWFwLXNjcm9sbC1pbmRpY2F0b3InKSkubm90LnRvRXhpc3QoKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ29uIHVwZGF0ZScsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgZWRpdG9yRWxlbWVudC5zdHlsZS5oZWlnaHQgPSAnNTAwcHgnXG5cbiAgICAgICAgICBhdG9tLnZpZXdzLnBlcmZvcm1Eb2N1bWVudFBvbGwoKVxuXG4gICAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICAgIH0pXG4gICAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ2FkanVzdHMgdGhlIHNpemUgYW5kIHBvc2l0aW9uIG9mIHRoZSBpbmRpY2F0b3InLCAoKSA9PiB7XG4gICAgICAgICAgbGV0IGluZGljYXRvciA9IG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm1pbmltYXAtc2Nyb2xsLWluZGljYXRvcicpXG5cbiAgICAgICAgICBsZXQgaGVpZ2h0ID0gZWRpdG9yRWxlbWVudC5nZXRIZWlnaHQoKSAqIChlZGl0b3JFbGVtZW50LmdldEhlaWdodCgpIC8gbWluaW1hcC5nZXRIZWlnaHQoKSlcbiAgICAgICAgICBsZXQgc2Nyb2xsID0gKGVkaXRvckVsZW1lbnQuZ2V0SGVpZ2h0KCkgLSBoZWlnaHQpICogbWluaW1hcC5nZXRUZXh0RWRpdG9yU2Nyb2xsUmF0aW8oKVxuXG4gICAgICAgICAgZXhwZWN0KGluZGljYXRvci5vZmZzZXRIZWlnaHQpLnRvQmVDbG9zZVRvKGhlaWdodCwgMClcbiAgICAgICAgICBleHBlY3QocmVhbE9mZnNldFRvcChpbmRpY2F0b3IpKS50b0JlQ2xvc2VUbyhzY3JvbGwsIDApXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiB0aGUgbWluaW1hcCBjYW5ub3Qgc2Nyb2xsJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBlZGl0b3Iuc2V0VGV4dChzbWFsbFNhbXBsZSlcblxuICAgICAgICAgIHdhaXRzRm9yKCdtaW5pbWFwIGZyYW1lIHJlcXVlc3RlZCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZFxuICAgICAgICAgIH0pXG4gICAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3JlbW92ZXMgdGhlIHNjcm9sbCBpbmRpY2F0b3InLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm1pbmltYXAtc2Nyb2xsLWluZGljYXRvcicpKS5ub3QudG9FeGlzdCgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ2FuZCB0aGVuIGNhbiBzY3JvbGwgYWdhaW4nLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBlZGl0b3Iuc2V0VGV4dChsYXJnZVNhbXBsZSlcblxuICAgICAgICAgICAgd2FpdHNGb3IoJ21pbmltYXAgZnJhbWUgcmVxdWVzdGVkJywgKCkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gbWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWRcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ2F0dGFjaGVzIHRoZSBzY3JvbGwgaW5kaWNhdG9yJywgKCkgPT4ge1xuICAgICAgICAgICAgd2FpdHNGb3IoJ21pbmltYXAgc2Nyb2xsIGluZGljYXRvcicsICgpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm1pbmltYXAtc2Nyb2xsLWluZGljYXRvcicpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnd2hlbiBtaW5pbWFwLmFic29sdXRlTW9kZSBzZXR0aW5nIGlzIHRydWUnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmFic29sdXRlTW9kZScsIHRydWUpXG4gICAgICB9KVxuXG4gICAgICBpdCgnYWRkcyBhIGFic29sdXRlIGNsYXNzIHRvIHRoZSBtaW5pbWFwIGVsZW1lbnQnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2Fic29sdXRlJykpLnRvQmVUcnV0aHkoKVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gbWluaW1hcC5kaXNwbGF5TWluaW1hcE9uTGVmdCBzZXR0aW5nIGlzIHRydWUnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdhbHNvIGFkZHMgYSBsZWZ0IGNsYXNzIHRvIHRoZSBtaW5pbWFwIGVsZW1lbnQnLCAoKSA9PiB7XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmRpc3BsYXlNaW5pbWFwT25MZWZ0JywgdHJ1ZSlcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdhYnNvbHV0ZScpKS50b0JlVHJ1dGh5KClcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdsZWZ0JykpLnRvQmVUcnV0aHkoKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gbWluaW1hcC5hZGp1c3RBYnNvbHV0ZU1vZGVIZWlnaHQgc2V0dGluZyBpcyB0cnVlJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuYWRqdXN0QWJzb2x1dGVNb2RlSGVpZ2h0JywgdHJ1ZSlcbiAgICAgICAgfSlcbiAgICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIGNvbnRlbnQgb2YgdGhlIG1pbmltYXAgaXMgc21hbGxlciB0aGF0IHRoZSBlZGl0b3IgaGVpZ2h0JywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgZWRpdG9yLnNldFRleHQoc21hbGxTYW1wbGUpXG4gICAgICAgICAgICBlZGl0b3JFbGVtZW50LnNldEhlaWdodCg0MDApXG4gICAgICAgICAgICBtaW5pbWFwRWxlbWVudC5tZWFzdXJlSGVpZ2h0QW5kV2lkdGgoKVxuXG4gICAgICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIHJ1bnMoKCkgPT4gbmV4dEFuaW1hdGlvbkZyYW1lKCkpXG4gICAgICAgICAgfSlcbiAgICAgICAgICBpdCgnYWRqdXN0cyB0aGUgY2FudmFzIGhlaWdodCB0byB0aGUgbWluaW1hcCBoZWlnaHQnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdjYW52YXMnKS5vZmZzZXRIZWlnaHQpLnRvRXF1YWwobWluaW1hcC5nZXRIZWlnaHQoKSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIGNvbnRlbnQgaXMgbW9kaWZpZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2Zvb1xcblxcbmJhclxcbicpXG5cbiAgICAgICAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICBydW5zKCgpID0+IG5leHRBbmltYXRpb25GcmFtZSgpKVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgaXQoJ2FkanVzdHMgdGhlIGNhbnZhcyBoZWlnaHQgdG8gdGhlIG5ldyBtaW5pbWFwIGhlaWdodCcsICgpID0+IHtcbiAgICAgICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignY2FudmFzJykub2Zmc2V0SGVpZ2h0KS50b0VxdWFsKG1pbmltYXAuZ2V0SGVpZ2h0KCkpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnd2hlbiB0aGUgc21vb3RoU2Nyb2xsaW5nIHNldHRpbmcgaXMgZGlzYWJsZWQnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLnNtb290aFNjcm9sbGluZycsIGZhbHNlKVxuICAgICAgfSlcbiAgICAgIGl0KCdkb2VzIG5vdCBvZmZzZXQgdGhlIGNhbnZhcyB3aGVuIHRoZSBzY3JvbGwgZG9lcyBub3QgbWF0Y2ggbGluZSBoZWlnaHQnLCAoKSA9PiB7XG4gICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDEwMDQpXG5cbiAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgfSlcbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICAgIGV4cGVjdChyZWFsT2Zmc2V0VG9wKGNhbnZhcykpLnRvRXF1YWwoMClcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIC8vICAgICAjIyMjIyMjICAjIyAgICAgIyMgIyMjIyAgIyMjIyMjICAjIyAgICAjI1xuICAgIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgICMjICAjIyAgICAjIyAjIyAgICMjXG4gICAgLy8gICAgIyMgICAgICMjICMjICAgICAjIyAgIyMgICMjICAgICAgICMjICAjI1xuICAgIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgICMjICAjIyAgICAgICAjIyMjI1xuICAgIC8vICAgICMjICAjIyAjIyAjIyAgICAgIyMgICMjICAjIyAgICAgICAjIyAgIyNcbiAgICAvLyAgICAjIyAgICAjIyAgIyMgICAgICMjICAjIyAgIyMgICAgIyMgIyMgICAjI1xuICAgIC8vICAgICAjIyMjIyAjIyAgIyMjIyMjIyAgIyMjIyAgIyMjIyMjICAjIyAgICAjI1xuICAgIC8vXG4gICAgLy8gICAgICMjIyMjIyAgIyMjIyMjIyMgIyMjIyMjIyMgIyMjIyMjIyMgIyMjIyAjIyAgICAjIyAgIyMjIyMjICAgICMjIyMjI1xuICAgIC8vICAgICMjICAgICMjICMjICAgICAgICAgICMjICAgICAgICMjICAgICAjIyAgIyMjICAgIyMgIyMgICAgIyMgICMjICAgICMjXG4gICAgLy8gICAgIyMgICAgICAgIyMgICAgICAgICAgIyMgICAgICAgIyMgICAgICMjICAjIyMjICAjIyAjIyAgICAgICAgIyNcbiAgICAvLyAgICAgIyMjIyMjICAjIyMjIyMgICAgICAjIyAgICAgICAjIyAgICAgIyMgICMjICMjICMjICMjICAgIyMjIyAgIyMjIyMjXG4gICAgLy8gICAgICAgICAgIyMgIyMgICAgICAgICAgIyMgICAgICAgIyMgICAgICMjICAjIyAgIyMjIyAjIyAgICAjIyAgICAgICAgIyNcbiAgICAvLyAgICAjIyAgICAjIyAjIyAgICAgICAgICAjIyAgICAgICAjIyAgICAgIyMgICMjICAgIyMjICMjICAgICMjICAjIyAgICAjI1xuICAgIC8vICAgICAjIyMjIyMgICMjIyMjIyMjICAgICMjICAgICAgICMjICAgICMjIyMgIyMgICAgIyMgICMjIyMjIyAgICAjIyMjIyNcblxuICAgIGRlc2NyaWJlKCd3aGVuIG1pbmltYXAuZGlzcGxheVBsdWdpbnNDb250cm9scyBzZXR0aW5nIGlzIHRydWUnLCAoKSA9PiB7XG4gICAgICBsZXQgW29wZW5RdWlja1NldHRpbmdzLCBxdWlja1NldHRpbmdzRWxlbWVudCwgd29ya3NwYWNlRWxlbWVudF0gPSBbXVxuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5kaXNwbGF5UGx1Z2luc0NvbnRyb2xzJywgdHJ1ZSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdoYXMgYSBkaXYgdG8gb3BlbiB0aGUgcXVpY2sgc2V0dGluZ3MnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5vcGVuLW1pbmltYXAtcXVpY2stc2V0dGluZ3MnKSkudG9FeGlzdCgpXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnY2xpY2tpbmcgb24gdGhlIGRpdicsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcbiAgICAgICAgICBqYXNtaW5lQ29udGVudC5hcHBlbmRDaGlsZCh3b3Jrc3BhY2VFbGVtZW50KVxuXG4gICAgICAgICAgb3BlblF1aWNrU2V0dGluZ3MgPSBtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5vcGVuLW1pbmltYXAtcXVpY2stc2V0dGluZ3MnKVxuICAgICAgICAgIG1vdXNlZG93bihvcGVuUXVpY2tTZXR0aW5ncylcblxuICAgICAgICAgIHF1aWNrU2V0dGluZ3NFbGVtZW50ID0gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdtaW5pbWFwLXF1aWNrLXNldHRpbmdzJylcbiAgICAgICAgfSlcblxuICAgICAgICBhZnRlckVhY2goKCkgPT4ge1xuICAgICAgICAgIG1pbmltYXBFbGVtZW50LnF1aWNrU2V0dGluZ3NFbGVtZW50LmRlc3Ryb3koKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdvcGVucyB0aGUgcXVpY2sgc2V0dGluZ3MgdmlldycsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QocXVpY2tTZXR0aW5nc0VsZW1lbnQpLnRvRXhpc3QoKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdwb3NpdGlvbnMgdGhlIHF1aWNrIHNldHRpbmdzIHZpZXcgbmV4dCB0byB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgICBsZXQgbWluaW1hcEJvdW5kcyA9IG1pbmltYXBFbGVtZW50LmdldEZyb250Q2FudmFzKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICBsZXQgc2V0dGluZ3NCb3VuZHMgPSBxdWlja1NldHRpbmdzRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuXG4gICAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRUb3AocXVpY2tTZXR0aW5nc0VsZW1lbnQpKS50b0JlQ2xvc2VUbyhtaW5pbWFwQm91bmRzLnRvcCwgMClcbiAgICAgICAgICBleHBlY3QocmVhbE9mZnNldExlZnQocXVpY2tTZXR0aW5nc0VsZW1lbnQpKS50b0JlQ2xvc2VUbyhtaW5pbWFwQm91bmRzLmxlZnQgLSBzZXR0aW5nc0JvdW5kcy53aWR0aCwgMClcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBkaXNwbGF5TWluaW1hcE9uTGVmdCBzZXR0aW5nIGlzIGVuYWJsZWQnLCAoKSA9PiB7XG4gICAgICAgIGRlc2NyaWJlKCdjbGlja2luZyBvbiB0aGUgZGl2JywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmRpc3BsYXlNaW5pbWFwT25MZWZ0JywgdHJ1ZSlcblxuICAgICAgICAgICAgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcbiAgICAgICAgICAgIGphc21pbmVDb250ZW50LmFwcGVuZENoaWxkKHdvcmtzcGFjZUVsZW1lbnQpXG5cbiAgICAgICAgICAgIG9wZW5RdWlja1NldHRpbmdzID0gbWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcub3Blbi1taW5pbWFwLXF1aWNrLXNldHRpbmdzJylcbiAgICAgICAgICAgIG1vdXNlZG93bihvcGVuUXVpY2tTZXR0aW5ncylcblxuICAgICAgICAgICAgcXVpY2tTZXR0aW5nc0VsZW1lbnQgPSB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ21pbmltYXAtcXVpY2stc2V0dGluZ3MnKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBhZnRlckVhY2goKCkgPT4ge1xuICAgICAgICAgICAgbWluaW1hcEVsZW1lbnQucXVpY2tTZXR0aW5nc0VsZW1lbnQuZGVzdHJveSgpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdwb3NpdGlvbnMgdGhlIHF1aWNrIHNldHRpbmdzIHZpZXcgbmV4dCB0byB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBtaW5pbWFwQm91bmRzID0gbWluaW1hcEVsZW1lbnQuZ2V0RnJvbnRDYW52YXMoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuXG4gICAgICAgICAgICBleHBlY3QocmVhbE9mZnNldFRvcChxdWlja1NldHRpbmdzRWxlbWVudCkpLnRvQmVDbG9zZVRvKG1pbmltYXBCb3VuZHMudG9wLCAwKVxuICAgICAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRMZWZ0KHF1aWNrU2V0dGluZ3NFbGVtZW50KSkudG9CZUNsb3NlVG8obWluaW1hcEJvdW5kcy5yaWdodCwgMClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIGFkanVzdE1pbmltYXBXaWR0aFRvU29mdFdyYXAgc2V0dGluZyBpcyBlbmFibGVkJywgKCkgPT4ge1xuICAgICAgICBsZXQgW2NvbnRyb2xzXSA9IFtdXG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnNvZnRXcmFwJywgdHJ1ZSlcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5zb2Z0V3JhcEF0UHJlZmVycmVkTGluZUxlbmd0aCcsIHRydWUpXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdlZGl0b3IucHJlZmVycmVkTGluZUxlbmd0aCcsIDIpXG5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuYWRqdXN0TWluaW1hcFdpZHRoVG9Tb2Z0V3JhcCcsIHRydWUpXG4gICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICAgIGNvbnRyb2xzID0gbWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcubWluaW1hcC1jb250cm9scycpXG4gICAgICAgICAgb3BlblF1aWNrU2V0dGluZ3MgPSBtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5vcGVuLW1pbmltYXAtcXVpY2stc2V0dGluZ3MnKVxuXG4gICAgICAgICAgZWRpdG9yRWxlbWVudC5zdHlsZS53aWR0aCA9ICcxMDI0cHgnXG5cbiAgICAgICAgICBhdG9tLnZpZXdzLnBlcmZvcm1Eb2N1bWVudFBvbGwoKVxuICAgICAgICAgIHdhaXRzRm9yKCdtaW5pbWFwIGZyYW1lIHJlcXVlc3RlZCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZFxuICAgICAgICAgIH0pXG4gICAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ2FkanVzdHMgdGhlIHNpemUgb2YgdGhlIGNvbnRyb2wgZGl2IHRvIGZpdCBpbiB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QoY29udHJvbHMuY2xpZW50V2lkdGgpLnRvRXF1YWwobWluaW1hcEVsZW1lbnQuZ2V0RnJvbnRDYW52YXMoKS5jbGllbnRXaWR0aCAvIGRldmljZVBpeGVsUmF0aW8pXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3Bvc2l0aW9ucyB0aGUgY29udHJvbHMgZGl2IG92ZXIgdGhlIGNhbnZhcycsICgpID0+IHtcbiAgICAgICAgICBsZXQgY29udHJvbHNSZWN0ID0gY29udHJvbHMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICBsZXQgY2FudmFzUmVjdCA9IG1pbmltYXBFbGVtZW50LmdldEZyb250Q2FudmFzKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICBleHBlY3QoY29udHJvbHNSZWN0LmxlZnQpLnRvRXF1YWwoY2FudmFzUmVjdC5sZWZ0KVxuICAgICAgICAgIGV4cGVjdChjb250cm9sc1JlY3QucmlnaHQpLnRvRXF1YWwoY2FudmFzUmVjdC5yaWdodClcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnd2hlbiB0aGUgZGlzcGxheU1pbmltYXBPbkxlZnQgc2V0dGluZyBpcyBlbmFibGVkJywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmRpc3BsYXlNaW5pbWFwT25MZWZ0JywgdHJ1ZSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ2FkanVzdHMgdGhlIHNpemUgb2YgdGhlIGNvbnRyb2wgZGl2IHRvIGZpdCBpbiB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChjb250cm9scy5jbGllbnRXaWR0aCkudG9FcXVhbChtaW5pbWFwRWxlbWVudC5nZXRGcm9udENhbnZhcygpLmNsaWVudFdpZHRoIC8gZGV2aWNlUGl4ZWxSYXRpbylcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3Bvc2l0aW9ucyB0aGUgY29udHJvbHMgZGl2IG92ZXIgdGhlIGNhbnZhcycsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBjb250cm9sc1JlY3QgPSBjb250cm9scy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgICAgbGV0IGNhbnZhc1JlY3QgPSBtaW5pbWFwRWxlbWVudC5nZXRGcm9udENhbnZhcygpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgICBleHBlY3QoY29udHJvbHNSZWN0LmxlZnQpLnRvRXF1YWwoY2FudmFzUmVjdC5sZWZ0KVxuICAgICAgICAgICAgZXhwZWN0KGNvbnRyb2xzUmVjdC5yaWdodCkudG9FcXVhbChjYW52YXNSZWN0LnJpZ2h0KVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBkZXNjcmliZSgnY2xpY2tpbmcgb24gdGhlIGRpdicsICgpID0+IHtcbiAgICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgICB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuICAgICAgICAgICAgICBqYXNtaW5lQ29udGVudC5hcHBlbmRDaGlsZCh3b3Jrc3BhY2VFbGVtZW50KVxuXG4gICAgICAgICAgICAgIG9wZW5RdWlja1NldHRpbmdzID0gbWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcub3Blbi1taW5pbWFwLXF1aWNrLXNldHRpbmdzJylcbiAgICAgICAgICAgICAgbW91c2Vkb3duKG9wZW5RdWlja1NldHRpbmdzKVxuXG4gICAgICAgICAgICAgIHF1aWNrU2V0dGluZ3NFbGVtZW50ID0gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdtaW5pbWFwLXF1aWNrLXNldHRpbmdzJylcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICAgIG1pbmltYXBFbGVtZW50LnF1aWNrU2V0dGluZ3NFbGVtZW50LmRlc3Ryb3koKVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgaXQoJ3Bvc2l0aW9ucyB0aGUgcXVpY2sgc2V0dGluZ3MgdmlldyBuZXh0IHRvIHRoZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgICAgICAgICAgICBsZXQgbWluaW1hcEJvdW5kcyA9IG1pbmltYXBFbGVtZW50LmdldEZyb250Q2FudmFzKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcblxuICAgICAgICAgICAgICBleHBlY3QocmVhbE9mZnNldFRvcChxdWlja1NldHRpbmdzRWxlbWVudCkpLnRvQmVDbG9zZVRvKG1pbmltYXBCb3VuZHMudG9wLCAwKVxuICAgICAgICAgICAgICBleHBlY3QocmVhbE9mZnNldExlZnQocXVpY2tTZXR0aW5nc0VsZW1lbnQpKS50b0JlQ2xvc2VUbyhtaW5pbWFwQm91bmRzLnJpZ2h0LCAwKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIHF1aWNrIHNldHRpbmdzIHZpZXcgaXMgb3BlbicsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcbiAgICAgICAgICBqYXNtaW5lQ29udGVudC5hcHBlbmRDaGlsZCh3b3Jrc3BhY2VFbGVtZW50KVxuXG4gICAgICAgICAgb3BlblF1aWNrU2V0dGluZ3MgPSBtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5vcGVuLW1pbmltYXAtcXVpY2stc2V0dGluZ3MnKVxuICAgICAgICAgIG1vdXNlZG93bihvcGVuUXVpY2tTZXR0aW5ncylcblxuICAgICAgICAgIHF1aWNrU2V0dGluZ3NFbGVtZW50ID0gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdtaW5pbWFwLXF1aWNrLXNldHRpbmdzJylcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnc2V0cyB0aGUgb24gcmlnaHQgYnV0dG9uIGFjdGl2ZScsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QocXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ0bi5zZWxlY3RlZDpsYXN0LWNoaWxkJykpLnRvRXhpc3QoKVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCdjbGlja2luZyBvbiB0aGUgY29kZSBoaWdobGlnaHQgaXRlbScsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBpdGVtID0gcXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignbGkuY29kZS1oaWdobGlnaHRzJylcbiAgICAgICAgICAgIG1vdXNlZG93bihpdGVtKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgndG9nZ2xlcyB0aGUgY29kZSBoaWdobGlnaHRzIG9uIHRoZSBtaW5pbWFwIGVsZW1lbnQnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZGlzcGxheUNvZGVIaWdobGlnaHRzKS50b0JlVHJ1dGh5KClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3JlcXVlc3RzIGFuIHVwZGF0ZScsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZCkudG9CZVRydXRoeSgpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnY2xpY2tpbmcgb24gdGhlIGFic29sdXRlIG1vZGUgaXRlbScsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBpdGVtID0gcXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignbGkuYWJzb2x1dGUtbW9kZScpXG4gICAgICAgICAgICBtb3VzZWRvd24oaXRlbSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3RvZ2dsZXMgdGhlIGFic29sdXRlLW1vZGUgc2V0dGluZycsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ21pbmltYXAuYWJzb2x1dGVNb2RlJykpLnRvQmVUcnV0aHkoKVxuICAgICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmFic29sdXRlTW9kZSkudG9CZVRydXRoeSgpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnY2xpY2tpbmcgb24gdGhlIG9uIGxlZnQgYnV0dG9uJywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgbGV0IGl0ZW0gPSBxdWlja1NldHRpbmdzRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnRuOmZpcnN0LWNoaWxkJylcbiAgICAgICAgICAgIG1vdXNlZG93bihpdGVtKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgndG9nZ2xlcyB0aGUgZGlzcGxheU1pbmltYXBPbkxlZnQgc2V0dGluZycsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ21pbmltYXAuZGlzcGxheU1pbmltYXBPbkxlZnQnKSkudG9CZVRydXRoeSgpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdjaGFuZ2VzIHRoZSBidXR0b25zIGFjdGl2YXRpb24gc3RhdGUnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QocXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ0bi5zZWxlY3RlZDpsYXN0LWNoaWxkJykpLm5vdC50b0V4aXN0KClcbiAgICAgICAgICAgIGV4cGVjdChxdWlja1NldHRpbmdzRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnRuLnNlbGVjdGVkOmZpcnN0LWNoaWxkJykpLnRvRXhpc3QoKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ2NvcmU6bW92ZS1sZWZ0JywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS1sZWZ0JylcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3RvZ2dsZXMgdGhlIGRpc3BsYXlNaW5pbWFwT25MZWZ0IHNldHRpbmcnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLmRpc3BsYXlNaW5pbWFwT25MZWZ0JykpLnRvQmVUcnV0aHkoKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnY2hhbmdlcyB0aGUgYnV0dG9ucyBhY3RpdmF0aW9uIHN0YXRlJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idG4uc2VsZWN0ZWQ6bGFzdC1jaGlsZCcpKS5ub3QudG9FeGlzdCgpXG4gICAgICAgICAgICBleHBlY3QocXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ0bi5zZWxlY3RlZDpmaXJzdC1jaGlsZCcpKS50b0V4aXN0KClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCdjb3JlOm1vdmUtcmlnaHQgd2hlbiB0aGUgbWluaW1hcCBpcyBvbiB0aGUgcmlnaHQnLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuZGlzcGxheU1pbmltYXBPbkxlZnQnLCB0cnVlKVxuICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS1yaWdodCcpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCd0b2dnbGVzIHRoZSBkaXNwbGF5TWluaW1hcE9uTGVmdCBzZXR0aW5nJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnbWluaW1hcC5kaXNwbGF5TWluaW1hcE9uTGVmdCcpKS50b0JlRmFsc3koKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnY2hhbmdlcyB0aGUgYnV0dG9ucyBhY3RpdmF0aW9uIHN0YXRlJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idG4uc2VsZWN0ZWQ6Zmlyc3QtY2hpbGQnKSkubm90LnRvRXhpc3QoKVxuICAgICAgICAgICAgZXhwZWN0KHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idG4uc2VsZWN0ZWQ6bGFzdC1jaGlsZCcpKS50b0V4aXN0KClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCdjbGlja2luZyBvbiB0aGUgb3BlbiBzZXR0aW5ncyBidXR0b24gYWdhaW4nLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBtb3VzZWRvd24ob3BlblF1aWNrU2V0dGluZ3MpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdjbG9zZXMgdGhlIHF1aWNrIHNldHRpbmdzIHZpZXcnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3Qod29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdtaW5pbWFwLXF1aWNrLXNldHRpbmdzJykpLm5vdC50b0V4aXN0KClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3JlbW92ZXMgdGhlIHZpZXcgZnJvbSB0aGUgZWxlbWVudCcsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5xdWlja1NldHRpbmdzRWxlbWVudCkudG9CZU51bGwoKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ3doZW4gYW4gZXh0ZXJuYWwgZXZlbnQgZGVzdHJveXMgdGhlIHZpZXcnLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBtaW5pbWFwRWxlbWVudC5xdWlja1NldHRpbmdzRWxlbWVudC5kZXN0cm95KClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3JlbW92ZXMgdGhlIHZpZXcgcmVmZXJlbmNlIGZyb20gdGhlIGVsZW1lbnQnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQucXVpY2tTZXR0aW5nc0VsZW1lbnQpLnRvQmVOdWxsKClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3RoZW4gZGlzYWJsaW5nIGl0JywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuZGlzcGxheVBsdWdpbnNDb250cm9scycsIGZhbHNlKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdyZW1vdmVzIHRoZSBkaXYnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm9wZW4tbWluaW1hcC1xdWljay1zZXR0aW5ncycpKS5ub3QudG9FeGlzdCgpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2l0aCBwbHVnaW5zIHJlZ2lzdGVyZWQgaW4gdGhlIHBhY2thZ2UnLCAoKSA9PiB7XG4gICAgICAgIGxldCBbbWluaW1hcFBhY2thZ2UsIHBsdWdpbkEsIHBsdWdpbkJdID0gW11cbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbWluaW1hcCcpLnRoZW4oKHBrZykgPT4ge1xuICAgICAgICAgICAgICBtaW5pbWFwUGFja2FnZSA9IHBrZy5tYWluTW9kdWxlXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgIGNsYXNzIFBsdWdpbiB7XG4gICAgICAgICAgICAgIGFjdGl2ZSA9IGZhbHNlXG4gICAgICAgICAgICAgIGFjdGl2YXRlUGx1Z2luICgpIHsgdGhpcy5hY3RpdmUgPSB0cnVlIH1cbiAgICAgICAgICAgICAgZGVhY3RpdmF0ZVBsdWdpbiAoKSB7IHRoaXMuYWN0aXZlID0gZmFsc2UgfVxuICAgICAgICAgICAgICBpc0FjdGl2ZSAoKSB7IHJldHVybiB0aGlzLmFjdGl2ZSB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHBsdWdpbkEgPSBuZXcgUGx1Z2luKClcbiAgICAgICAgICAgIHBsdWdpbkIgPSBuZXcgUGx1Z2luKClcblxuICAgICAgICAgICAgbWluaW1hcFBhY2thZ2UucmVnaXN0ZXJQbHVnaW4oJ2R1bW15QScsIHBsdWdpbkEpXG4gICAgICAgICAgICBtaW5pbWFwUGFja2FnZS5yZWdpc3RlclBsdWdpbignZHVtbXlCJywgcGx1Z2luQilcblxuICAgICAgICAgICAgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcbiAgICAgICAgICAgIGphc21pbmVDb250ZW50LmFwcGVuZENoaWxkKHdvcmtzcGFjZUVsZW1lbnQpXG5cbiAgICAgICAgICAgIG9wZW5RdWlja1NldHRpbmdzID0gbWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcub3Blbi1taW5pbWFwLXF1aWNrLXNldHRpbmdzJylcbiAgICAgICAgICAgIG1vdXNlZG93bihvcGVuUXVpY2tTZXR0aW5ncylcblxuICAgICAgICAgICAgcXVpY2tTZXR0aW5nc0VsZW1lbnQgPSB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ21pbmltYXAtcXVpY2stc2V0dGluZ3MnKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ2NyZWF0ZXMgb25lIGxpc3QgaXRlbSBmb3IgZWFjaCByZWdpc3RlcmVkIHBsdWdpbicsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QocXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnbGknKS5sZW5ndGgpLnRvRXF1YWwoNilcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnc2VsZWN0cyB0aGUgZmlyc3QgaXRlbSBvZiB0aGUgbGlzdCcsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QocXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignbGkuc2VsZWN0ZWQ6Zmlyc3QtY2hpbGQnKSkudG9FeGlzdCgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ2NvcmU6Y29uZmlybScsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOmNvbmZpcm0nKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnZGlzYWJsZSB0aGUgcGx1Z2luIG9mIHRoZSBzZWxlY3RlZCBpdGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHBsdWdpbkEuaXNBY3RpdmUoKSkudG9CZUZhbHN5KClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgZGVzY3JpYmUoJ3RyaWdnZXJlZCBhIHNlY29uZCB0aW1lJywgKCkgPT4ge1xuICAgICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOmNvbmZpcm0nKVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgaXQoJ2VuYWJsZSB0aGUgcGx1Z2luIG9mIHRoZSBzZWxlY3RlZCBpdGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgICBleHBlY3QocGx1Z2luQS5pc0FjdGl2ZSgpKS50b0JlVHJ1dGh5KClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGRlc2NyaWJlKCdvbiB0aGUgY29kZSBoaWdobGlnaHQgaXRlbScsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBbaW5pdGlhbF0gPSBbXVxuICAgICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICAgIGluaXRpYWwgPSBtaW5pbWFwRWxlbWVudC5kaXNwbGF5Q29kZUhpZ2hsaWdodHNcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS1kb3duJylcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS1kb3duJylcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6Y29uZmlybScpXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBpdCgndG9nZ2xlcyB0aGUgY29kZSBoaWdobGlnaHRzIG9uIHRoZSBtaW5pbWFwIGVsZW1lbnQnLCAoKSA9PiB7XG4gICAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5kaXNwbGF5Q29kZUhpZ2hsaWdodHMpLnRvRXF1YWwoIWluaXRpYWwpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBkZXNjcmliZSgnb24gdGhlIGFic29sdXRlIG1vZGUgaXRlbScsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBbaW5pdGlhbF0gPSBbXVxuICAgICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICAgIGluaXRpYWwgPSBhdG9tLmNvbmZpZy5nZXQoJ21pbmltYXAuYWJzb2x1dGVNb2RlJylcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS1kb3duJylcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS1kb3duJylcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS1kb3duJylcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6Y29uZmlybScpXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBpdCgndG9nZ2xlcyB0aGUgY29kZSBoaWdobGlnaHRzIG9uIHRoZSBtaW5pbWFwIGVsZW1lbnQnLCAoKSA9PiB7XG4gICAgICAgICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ21pbmltYXAuYWJzb2x1dGVNb2RlJykpLnRvRXF1YWwoIWluaXRpYWwpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBkZXNjcmliZSgnb24gdGhlIGFkanVzdCBhYnNvbHV0ZSBtb2RlIGhlaWdodCBpdGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IFtpbml0aWFsXSA9IFtdXG4gICAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgICAgaW5pdGlhbCA9IGF0b20uY29uZmlnLmdldCgnbWluaW1hcC5hZGp1c3RBYnNvbHV0ZU1vZGVIZWlnaHQnKVxuICAgICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHF1aWNrU2V0dGluZ3NFbGVtZW50LCAnY29yZTptb3ZlLWRvd24nKVxuICAgICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHF1aWNrU2V0dGluZ3NFbGVtZW50LCAnY29yZTptb3ZlLWRvd24nKVxuICAgICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHF1aWNrU2V0dGluZ3NFbGVtZW50LCAnY29yZTptb3ZlLWRvd24nKVxuICAgICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHF1aWNrU2V0dGluZ3NFbGVtZW50LCAnY29yZTptb3ZlLWRvd24nKVxuICAgICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHF1aWNrU2V0dGluZ3NFbGVtZW50LCAnY29yZTpjb25maXJtJylcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIGl0KCd0b2dnbGVzIHRoZSBjb2RlIGhpZ2hsaWdodHMgb24gdGhlIG1pbmltYXAgZWxlbWVudCcsICgpID0+IHtcbiAgICAgICAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnbWluaW1hcC5hZGp1c3RBYnNvbHV0ZU1vZGVIZWlnaHQnKSkudG9FcXVhbCghaW5pdGlhbClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnY29yZTptb3ZlLWRvd24nLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHF1aWNrU2V0dGluZ3NFbGVtZW50LCAnY29yZTptb3ZlLWRvd24nKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnc2VsZWN0cyB0aGUgc2Vjb25kIGl0ZW0nLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QocXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignbGkuc2VsZWN0ZWQ6bnRoLWNoaWxkKDIpJykpLnRvRXhpc3QoKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBkZXNjcmliZSgncmVhY2hpbmcgYSBzZXBhcmF0b3InLCAoKSA9PiB7XG4gICAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS1kb3duJylcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIGl0KCdtb3ZlcyBwYXN0IHRoZSBzZXBhcmF0b3InLCAoKSA9PiB7XG4gICAgICAgICAgICAgIGV4cGVjdChxdWlja1NldHRpbmdzRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdsaS5jb2RlLWhpZ2hsaWdodHMuc2VsZWN0ZWQnKSkudG9FeGlzdCgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBkZXNjcmliZSgndGhlbiBjb3JlOm1vdmUtdXAnLCAoKSA9PiB7XG4gICAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS11cCcpXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBpdCgnc2VsZWN0cyBhZ2FpbiB0aGUgZmlyc3QgaXRlbSBvZiB0aGUgbGlzdCcsICgpID0+IHtcbiAgICAgICAgICAgICAgZXhwZWN0KHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpLnNlbGVjdGVkOmZpcnN0LWNoaWxkJykpLnRvRXhpc3QoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCdjb3JlOm1vdmUtdXAnLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHF1aWNrU2V0dGluZ3NFbGVtZW50LCAnY29yZTptb3ZlLXVwJylcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3NlbGVjdHMgdGhlIGxhc3QgaXRlbScsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChxdWlja1NldHRpbmdzRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdsaS5zZWxlY3RlZDpsYXN0LWNoaWxkJykpLnRvRXhpc3QoKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBkZXNjcmliZSgncmVhY2hpbmcgYSBzZXBhcmF0b3InLCAoKSA9PiB7XG4gICAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS11cCcpXG4gICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOm1vdmUtdXAnKVxuICAgICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHF1aWNrU2V0dGluZ3NFbGVtZW50LCAnY29yZTptb3ZlLXVwJylcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIGl0KCdtb3ZlcyBwYXN0IHRoZSBzZXBhcmF0b3InLCAoKSA9PiB7XG4gICAgICAgICAgICAgIGV4cGVjdChxdWlja1NldHRpbmdzRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdsaS5zZWxlY3RlZDpudGgtY2hpbGQoMiknKSkudG9FeGlzdCgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBkZXNjcmliZSgndGhlbiBjb3JlOm1vdmUtZG93bicsICgpID0+IHtcbiAgICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHF1aWNrU2V0dGluZ3NFbGVtZW50LCAnY29yZTptb3ZlLWRvd24nKVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgaXQoJ3NlbGVjdHMgYWdhaW4gdGhlIGZpcnN0IGl0ZW0gb2YgdGhlIGxpc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICAgIGV4cGVjdChxdWlja1NldHRpbmdzRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdsaS5zZWxlY3RlZDpmaXJzdC1jaGlsZCcpKS50b0V4aXN0KClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcbn0pXG4iXX0=
//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/minimap/spec/minimap-element-spec.js
