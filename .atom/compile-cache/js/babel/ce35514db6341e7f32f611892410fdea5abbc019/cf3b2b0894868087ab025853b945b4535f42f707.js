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
            expect(minimapElement.drawLines.argsForCall[0][0]).toEqual(100);
            expect(minimapElement.drawLines.argsForCall[0][1]).toEqual(102);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL21pbmltYXAvc3BlYy9taW5pbWFwLWVsZW1lbnQtc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7c0JBRWUsU0FBUzs7Ozt1QkFDUCxhQUFhOzs7OzBCQUNWLGdCQUFnQjs7OztpQ0FDVCx3QkFBd0I7Ozs7Z0NBQzFCLHFCQUFxQjs7NkJBQ2lDLGtCQUFrQjs7QUFQakcsV0FBVyxDQUFBOztBQVNYLFNBQVMsYUFBYSxDQUFFLENBQUMsRUFBRTs7O0FBR3pCLFNBQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQTtDQUNuQjs7QUFFRCxTQUFTLGNBQWMsQ0FBRSxDQUFDLEVBQUU7OztBQUcxQixTQUFPLENBQUMsQ0FBQyxVQUFVLENBQUE7Q0FDcEI7O0FBRUQsU0FBUyxLQUFLLENBQUUsUUFBUSxFQUFFO0FBQ3hCLE1BQU0sQ0FBQyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUE7QUFDcEIsVUFBUSxDQUFJLFFBQVEsU0FBTSxZQUFNO0FBQUUsV0FBTyxJQUFJLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUE7R0FBRSxDQUFDLENBQUE7Q0FDdEU7O0FBRUQsU0FBUyxZQUFZLEdBQUk7QUFDdkIsTUFBTSxNQUFNLEdBQUc7QUFDYixVQUFNLEVBQUUsS0FBSztBQUNiLGtCQUFjLEVBQUMsMEJBQUc7QUFBRSxVQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQTtLQUFFO0FBQ3hDLG9CQUFnQixFQUFDLDRCQUFHO0FBQUUsVUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUE7S0FBRTtBQUMzQyxZQUFRLEVBQUMsb0JBQUc7QUFBRSxhQUFPLElBQUksQ0FBQyxNQUFNLENBQUE7S0FBRTtHQUNuQyxDQUFBO0FBQ0QsU0FBTyxNQUFNLENBQUE7Q0FDZDs7QUFFRCxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsWUFBTTthQUNxRixFQUFFO01BQWpILE1BQU07TUFBRSxPQUFPO01B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QUMsMENBQTBDLEVBQUUsWUFBTTtBQUNuRCxvQkFBTSxDQUFDLG9CQUFvQixDQUFDLGFBQWEsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUE7YUFDaEYsQ0FBQyxDQUFBO1dBQ0gsQ0FBQyxDQUFBO1NBQ0gsQ0FBQyxDQUFBO09BQ0gsQ0FBQyxDQUFBO0tBQ0gsQ0FBQyxDQUFBO0dBQ0gsQ0FBQyxDQUFBO0NBQ0gsQ0FBQyxDQUFBIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL21pbmltYXAvc3BlYy9taW5pbWFwLWVsZW1lbnQtc3BlYy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCBmcyBmcm9tICdmcy1wbHVzJ1xuaW1wb3J0IE1haW4gZnJvbSAnLi4vbGliL21haW4nXG5pbXBvcnQgTWluaW1hcCBmcm9tICcuLi9saWIvbWluaW1hcCdcbmltcG9ydCBNaW5pbWFwRWxlbWVudCBmcm9tICcuLi9saWIvbWluaW1hcC1lbGVtZW50J1xuaW1wb3J0IHtzdHlsZXNoZWV0fSBmcm9tICcuL2hlbHBlcnMvd29ya3NwYWNlJ1xuaW1wb3J0IHttb3VzZW1vdmUsIG1vdXNlZG93biwgbW91c2V1cCwgbW91c2V3aGVlbCwgdG91Y2hzdGFydCwgdG91Y2htb3ZlfSBmcm9tICcuL2hlbHBlcnMvZXZlbnRzJ1xuXG5mdW5jdGlvbiByZWFsT2Zmc2V0VG9wIChvKSB7XG4gIC8vIHRyYW5zZm9ybSA9IG5ldyBXZWJLaXRDU1NNYXRyaXggd2luZG93LmdldENvbXB1dGVkU3R5bGUobykudHJhbnNmb3JtXG4gIC8vIG8ub2Zmc2V0VG9wICsgdHJhbnNmb3JtLm00MlxuICByZXR1cm4gby5vZmZzZXRUb3Bcbn1cblxuZnVuY3Rpb24gcmVhbE9mZnNldExlZnQgKG8pIHtcbiAgLy8gdHJhbnNmb3JtID0gbmV3IFdlYktpdENTU01hdHJpeCB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShvKS50cmFuc2Zvcm1cbiAgLy8gby5vZmZzZXRMZWZ0ICsgdHJhbnNmb3JtLm00MVxuICByZXR1cm4gby5vZmZzZXRMZWZ0XG59XG5cbmZ1bmN0aW9uIHNsZWVwIChkdXJhdGlvbikge1xuICBjb25zdCB0ID0gbmV3IERhdGUoKVxuICB3YWl0c0ZvcihgJHtkdXJhdGlvbn1tc2AsICgpID0+IHsgcmV0dXJuIG5ldyBEYXRlKCkgLSB0ID4gZHVyYXRpb24gfSlcbn1cblxuZnVuY3Rpb24gY3JlYXRlUGx1Z2luICgpIHtcbiAgY29uc3QgcGx1Z2luID0ge1xuICAgIGFjdGl2ZTogZmFsc2UsXG4gICAgYWN0aXZhdGVQbHVnaW4gKCkgeyB0aGlzLmFjdGl2ZSA9IHRydWUgfSxcbiAgICBkZWFjdGl2YXRlUGx1Z2luICgpIHsgdGhpcy5hY3RpdmUgPSBmYWxzZSB9LFxuICAgIGlzQWN0aXZlICgpIHsgcmV0dXJuIHRoaXMuYWN0aXZlIH1cbiAgfVxuICByZXR1cm4gcGx1Z2luXG59XG5cbmRlc2NyaWJlKCdNaW5pbWFwRWxlbWVudCcsICgpID0+IHtcbiAgbGV0IFtlZGl0b3IsIG1pbmltYXAsIGxhcmdlU2FtcGxlLCBtZWRpdW1TYW1wbGUsIHNtYWxsU2FtcGxlLCBqYXNtaW5lQ29udGVudCwgZWRpdG9yRWxlbWVudCwgbWluaW1hcEVsZW1lbnQsIGRpcl0gPSBbXVxuXG4gIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgIC8vIENvbW1lbnQgYWZ0ZXIgYm9keSBiZWxvdyB0byBsZWF2ZSB0aGUgY3JlYXRlZCB0ZXh0IGVkaXRvciBhbmQgbWluaW1hcFxuICAgIC8vIG9uIERPTSBhZnRlciB0aGUgdGVzdCBydW4uXG4gICAgamFzbWluZUNvbnRlbnQgPSBkb2N1bWVudC5ib2R5LnF1ZXJ5U2VsZWN0b3IoJyNqYXNtaW5lLWNvbnRlbnQnKVxuXG4gICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmNoYXJIZWlnaHQnLCA0KVxuICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5jaGFyV2lkdGgnLCAyKVxuICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5pbnRlcmxpbmUnLCAxKVxuICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC50ZXh0T3BhY2l0eScsIDEpXG4gICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLnNtb290aFNjcm9sbGluZycsIHRydWUpXG4gICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLnBsdWdpbnMnLCB7fSlcblxuICAgIE1pbmltYXBFbGVtZW50LnJlZ2lzdGVyVmlld1Byb3ZpZGVyKE1pbmltYXApXG5cbiAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5idWlsZFRleHRFZGl0b3Ioe30pXG4gICAgZWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpXG4gICAgamFzbWluZUNvbnRlbnQuaW5zZXJ0QmVmb3JlKGVkaXRvckVsZW1lbnQsIGphc21pbmVDb250ZW50LmZpcnN0Q2hpbGQpXG4gICAgZWRpdG9yRWxlbWVudC5zZXRIZWlnaHQoNTApXG5cbiAgICBtaW5pbWFwID0gbmV3IE1pbmltYXAoe3RleHRFZGl0b3I6IGVkaXRvcn0pXG4gICAgZGlyID0gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKClbMF1cblxuICAgIGxhcmdlU2FtcGxlID0gZnMucmVhZEZpbGVTeW5jKGRpci5yZXNvbHZlKCdsYXJnZS1maWxlLmNvZmZlZScpKS50b1N0cmluZygpXG4gICAgbWVkaXVtU2FtcGxlID0gZnMucmVhZEZpbGVTeW5jKGRpci5yZXNvbHZlKCd0d28taHVuZHJlZC50eHQnKSkudG9TdHJpbmcoKVxuICAgIHNtYWxsU2FtcGxlID0gZnMucmVhZEZpbGVTeW5jKGRpci5yZXNvbHZlKCdzYW1wbGUuY29mZmVlJykpLnRvU3RyaW5nKClcblxuICAgIGVkaXRvci5zZXRUZXh0KGxhcmdlU2FtcGxlKVxuXG4gICAgbWluaW1hcEVsZW1lbnQgPSBhdG9tLnZpZXdzLmdldFZpZXcobWluaW1hcClcbiAgfSlcblxuICBpdCgnaGFzIGJlZW4gcmVnaXN0ZXJlZCBpbiB0aGUgdmlldyByZWdpc3RyeScsICgpID0+IHtcbiAgICBleHBlY3QobWluaW1hcEVsZW1lbnQpLnRvRXhpc3QoKVxuICB9KVxuXG4gIGl0KCdoYXMgc3RvcmVkIHRoZSBtaW5pbWFwIGFzIGl0cyBtb2RlbCcsICgpID0+IHtcbiAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZ2V0TW9kZWwoKSkudG9CZShtaW5pbWFwKVxuICB9KVxuXG4gIGl0KCdoYXMgYSBjYW52YXMgaW4gYSBzaGFkb3cgRE9NJywgKCkgPT4ge1xuICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJ2NhbnZhcycpKS50b0V4aXN0KClcbiAgfSlcblxuICBpdCgnaGFzIGEgZGl2IHJlcHJlc2VudGluZyB0aGUgdmlzaWJsZSBhcmVhJywgKCkgPT4ge1xuICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5taW5pbWFwLXZpc2libGUtYXJlYScpKS50b0V4aXN0KClcbiAgfSlcblxuICAvLyAgICAgICAjIyMgICAgIyMjIyMjIyMgIyMjIyMjIyMgICAgIyMjICAgICAjIyMjIyMgICMjICAgICAjI1xuICAvLyAgICAgICMjICMjICAgICAgIyMgICAgICAgIyMgICAgICAjIyAjIyAgICMjICAgICMjICMjICAgICAjI1xuICAvLyAgICAgIyMgICAjIyAgICAgIyMgICAgICAgIyMgICAgICMjICAgIyMgICMjICAgICAgICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgICAgIyMgICAgICAgIyMgICAgIyMgICAgICMjICMjICAgICAgICMjIyMjIyMjI1xuICAvLyAgICAjIyMjIyMjIyMgICAgIyMgICAgICAgIyMgICAgIyMjIyMjIyMjICMjICAgICAgICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgICAgIyMgICAgICAgIyMgICAgIyMgICAgICMjICMjICAgICMjICMjICAgICAjI1xuICAvLyAgICAjIyAgICAgIyMgICAgIyMgICAgICAgIyMgICAgIyMgICAgICMjICAjIyMjIyMgICMjICAgICAjI1xuXG4gIGRlc2NyaWJlKCd3aGVuIGF0dGFjaGVkIHRvIHRoZSB0ZXh0IGVkaXRvciBlbGVtZW50JywgKCkgPT4ge1xuICAgIGxldCBbbm9BbmltYXRpb25GcmFtZSwgbmV4dEFuaW1hdGlvbkZyYW1lLCByZXF1ZXN0QW5pbWF0aW9uRnJhbWVTYWZlLCBjYW52YXMsIHZpc2libGVBcmVhXSA9IFtdXG5cbiAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgIG5vQW5pbWF0aW9uRnJhbWUgPSAoKSA9PiB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3RlZCcpXG4gICAgICB9XG4gICAgICBuZXh0QW5pbWF0aW9uRnJhbWUgPSBub0FuaW1hdGlvbkZyYW1lXG5cbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZVNhZmUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lXG4gICAgICBzcHlPbih3aW5kb3csICdyZXF1ZXN0QW5pbWF0aW9uRnJhbWUnKS5hbmRDYWxsRmFrZSgoZm4pID0+IHtcbiAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lID0gKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSA9IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICBmbigpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgY2FudmFzID0gbWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdjYW52YXMnKVxuICAgICAgZWRpdG9yRWxlbWVudC5zZXRXaWR0aCgyMDApXG4gICAgICBlZGl0b3JFbGVtZW50LnNldEhlaWdodCg1MClcblxuICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoMTAwMClcbiAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsTGVmdCgyMDApXG4gICAgICBtaW5pbWFwRWxlbWVudC5hdHRhY2goKVxuICAgIH0pXG5cbiAgICBhZnRlckVhY2goKCkgPT4ge1xuICAgICAgbWluaW1hcC5kZXN0cm95KClcbiAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWVTYWZlXG4gICAgfSlcblxuICAgIGl0KCd0YWtlcyB0aGUgaGVpZ2h0IG9mIHRoZSBlZGl0b3InLCAoKSA9PiB7XG4gICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQub2Zmc2V0SGVpZ2h0KS50b0VxdWFsKGVkaXRvckVsZW1lbnQuY2xpZW50SGVpZ2h0KVxuXG4gICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQub2Zmc2V0V2lkdGgpLnRvQmVDbG9zZVRvKGVkaXRvckVsZW1lbnQuY2xpZW50V2lkdGggLyAxMCwgMClcbiAgICB9KVxuXG4gICAgaXQoJ2tub3dzIHdoZW4gYXR0YWNoZWQgdG8gYSB0ZXh0IGVkaXRvcicsICgpID0+IHtcbiAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5hdHRhY2hlZFRvVGV4dEVkaXRvcikudG9CZVRydXRoeSgpXG4gICAgfSlcblxuICAgIGl0KCdyZXNpemVzIHRoZSBjYW52YXMgdG8gZml0IHRoZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgICAgZXhwZWN0KGNhbnZhcy5vZmZzZXRIZWlnaHQgLyBkZXZpY2VQaXhlbFJhdGlvKS50b0JlQ2xvc2VUbyhtaW5pbWFwRWxlbWVudC5vZmZzZXRIZWlnaHQgKyBtaW5pbWFwLmdldExpbmVIZWlnaHQoKSwgMClcbiAgICAgIGV4cGVjdChjYW52YXMub2Zmc2V0V2lkdGggLyBkZXZpY2VQaXhlbFJhdGlvKS50b0JlQ2xvc2VUbyhtaW5pbWFwRWxlbWVudC5vZmZzZXRXaWR0aCwgMClcbiAgICB9KVxuXG4gICAgaXQoJ3JlcXVlc3RzIGFuIHVwZGF0ZScsICgpID0+IHtcbiAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZCkudG9CZVRydXRoeSgpXG4gICAgfSlcblxuICAgIC8vICAgICAjIyMjIyMgICAjIyMjIyMgICAjIyMjIyNcbiAgICAvLyAgICAjIyAgICAjIyAjIyAgICAjIyAjIyAgICAjI1xuICAgIC8vICAgICMjICAgICAgICMjICAgICAgICMjXG4gICAgLy8gICAgIyMgICAgICAgICMjIyMjIyAgICMjIyMjI1xuICAgIC8vICAgICMjICAgICAgICAgICAgICMjICAgICAgICMjXG4gICAgLy8gICAgIyMgICAgIyMgIyMgICAgIyMgIyMgICAgIyNcbiAgICAvLyAgICAgIyMjIyMjICAgIyMjIyMjICAgIyMjIyMjXG5cbiAgICBkZXNjcmliZSgnd2l0aCBjc3MgZmlsdGVycycsICgpID0+IHtcbiAgICAgIGRlc2NyaWJlKCd3aGVuIGEgaHVlLXJvdGF0ZSBmaWx0ZXIgaXMgYXBwbGllZCB0byBhIHJnYiBjb2xvcicsICgpID0+IHtcbiAgICAgICAgbGV0IFthZGRpdGlvbm5hbFN0eWxlTm9kZV0gPSBbXVxuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBtaW5pbWFwRWxlbWVudC5pbnZhbGlkYXRlRE9NU3R5bGVzQ2FjaGUoKVxuXG4gICAgICAgICAgYWRkaXRpb25uYWxTdHlsZU5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpXG4gICAgICAgICAgYWRkaXRpb25uYWxTdHlsZU5vZGUudGV4dENvbnRlbnQgPSBgXG4gICAgICAgICAgICAke3N0eWxlc2hlZXR9XG5cbiAgICAgICAgICAgIC5lZGl0b3Ige1xuICAgICAgICAgICAgICBjb2xvcjogcmVkO1xuICAgICAgICAgICAgICAtd2Via2l0LWZpbHRlcjogaHVlLXJvdGF0ZSgxODBkZWcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIGBcblxuICAgICAgICAgIGphc21pbmVDb250ZW50LmFwcGVuZENoaWxkKGFkZGl0aW9ubmFsU3R5bGVOb2RlKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdjb21wdXRlcyB0aGUgbmV3IGNvbG9yIGJ5IGFwcGx5aW5nIHRoZSBodWUgcm90YXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgd2FpdHNGb3IoJ25ldyBhbmltYXRpb24gZnJhbWUnLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgfSlcbiAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG4gICAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQucmV0cmlldmVTdHlsZUZyb21Eb20oWycuZWRpdG9yJ10sICdjb2xvcicpKS50b0VxdWFsKGByZ2IoMCwgJHsweDZkfSwgJHsweDZkfSlgKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiBhIGh1ZS1yb3RhdGUgZmlsdGVyIGlzIGFwcGxpZWQgdG8gYSByZ2JhIGNvbG9yJywgKCkgPT4ge1xuICAgICAgICBsZXQgW2FkZGl0aW9ubmFsU3R5bGVOb2RlXSA9IFtdXG5cbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgbWluaW1hcEVsZW1lbnQuaW52YWxpZGF0ZURPTVN0eWxlc0NhY2hlKClcblxuICAgICAgICAgIGFkZGl0aW9ubmFsU3R5bGVOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuICAgICAgICAgIGFkZGl0aW9ubmFsU3R5bGVOb2RlLnRleHRDb250ZW50ID0gYFxuICAgICAgICAgICAgJHtzdHlsZXNoZWV0fVxuXG4gICAgICAgICAgICAuZWRpdG9yIHtcbiAgICAgICAgICAgICAgY29sb3I6IHJnYmEoMjU1LCAwLCAwLCAwKTtcbiAgICAgICAgICAgICAgLXdlYmtpdC1maWx0ZXI6IGh1ZS1yb3RhdGUoMTgwZGVnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBgXG5cbiAgICAgICAgICBqYXNtaW5lQ29udGVudC5hcHBlbmRDaGlsZChhZGRpdGlvbm5hbFN0eWxlTm9kZSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnY29tcHV0ZXMgdGhlIG5ldyBjb2xvciBieSBhcHBseWluZyB0aGUgaHVlIHJvdGF0aW9uJywgKCkgPT4ge1xuICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcbiAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5yZXRyaWV2ZVN0eWxlRnJvbURvbShbJy5lZGl0b3InXSwgJ2NvbG9yJykpLnRvRXF1YWwoYHJnYmEoMCwgJHsweDZkfSwgJHsweDZkfSwgMClgKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICAvLyAgICAjIyAgICAgIyMgIyMjIyMjIyMgICMjIyMjIyMjICAgICAjIyMgICAgIyMjIyMjIyMgIyMjIyMjIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAgICMjICMjICAgICAgIyMgICAgIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAgIyMgICAjIyAgICAgIyMgICAgIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMjIyMjIyMgICMjICAgICAjIyAjIyAgICAgIyMgICAgIyMgICAgIyMjIyMjXG4gICAgLy8gICAgIyMgICAgICMjICMjICAgICAgICAjIyAgICAgIyMgIyMjIyMjIyMjICAgICMjICAgICMjXG4gICAgLy8gICAgIyMgICAgICMjICMjICAgICAgICAjIyAgICAgIyMgIyMgICAgICMjICAgICMjICAgICMjXG4gICAgLy8gICAgICMjIyMjIyMgICMjICAgICAgICAjIyMjIyMjIyAgIyMgICAgICMjICAgICMjICAgICMjIyMjIyMjXG5cbiAgICBkZXNjcmliZSgnd2hlbiB0aGUgdXBkYXRlIGlzIHBlcmZvcm1lZCcsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICB9KVxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuICAgICAgICAgIHZpc2libGVBcmVhID0gbWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcubWluaW1hcC12aXNpYmxlLWFyZWEnKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ3NldHMgdGhlIHZpc2libGUgYXJlYSB3aWR0aCBhbmQgaGVpZ2h0JywgKCkgPT4ge1xuICAgICAgICBleHBlY3QodmlzaWJsZUFyZWEub2Zmc2V0V2lkdGgpLnRvRXF1YWwobWluaW1hcEVsZW1lbnQuY2xpZW50V2lkdGgpXG4gICAgICAgIGV4cGVjdCh2aXNpYmxlQXJlYS5vZmZzZXRIZWlnaHQpLnRvQmVDbG9zZVRvKG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZEhlaWdodCgpLCAwKVxuICAgICAgfSlcblxuICAgICAgaXQoJ3NldHMgdGhlIHZpc2libGUgdmlzaWJsZSBhcmVhIG9mZnNldCcsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRUb3AodmlzaWJsZUFyZWEpKS50b0JlQ2xvc2VUbyhtaW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRTY3JvbGxUb3AoKSAtIG1pbmltYXAuZ2V0U2Nyb2xsVG9wKCksIDApXG4gICAgICAgIGV4cGVjdChyZWFsT2Zmc2V0TGVmdCh2aXNpYmxlQXJlYSkpLnRvQmVDbG9zZVRvKG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZFNjcm9sbExlZnQoKSwgMClcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdvZmZzZXRzIHRoZSBjYW52YXMgd2hlbiB0aGUgc2Nyb2xsIGRvZXMgbm90IG1hdGNoIGxpbmUgaGVpZ2h0JywgKCkgPT4ge1xuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgxMDA0KVxuXG4gICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICBleHBlY3QocmVhbE9mZnNldFRvcChjYW52YXMpKS50b0JlQ2xvc2VUbygtMiwgLTEpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgnZG9lcyBub3QgZmFpbCB0byB1cGRhdGUgcmVuZGVyIHRoZSBpbnZpc2libGUgY2hhciB3aGVuIG1vZGlmaWVkJywgKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5zaG93SW52aXNpYmxlcycsIHRydWUpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLmludmlzaWJsZXMnLCB7Y3I6ICcqJ30pXG5cbiAgICAgICAgZXhwZWN0KCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSkubm90LnRvVGhyb3coKVxuICAgICAgfSlcblxuICAgICAgaXQoJ3JlbmRlcnMgdGhlIGRlY29yYXRpb25zIGJhc2VkIG9uIHRoZSBvcmRlciBzZXR0aW5ncycsICgpID0+IHtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMnLCB0cnVlKVxuXG4gICAgICAgIGNvbnN0IHBsdWdpbkZvbyA9IGNyZWF0ZVBsdWdpbigpXG4gICAgICAgIGNvbnN0IHBsdWdpbkJhciA9IGNyZWF0ZVBsdWdpbigpXG5cbiAgICAgICAgTWFpbi5yZWdpc3RlclBsdWdpbignZm9vJywgcGx1Z2luRm9vKVxuICAgICAgICBNYWluLnJlZ2lzdGVyUGx1Z2luKCdiYXInLCBwbHVnaW5CYXIpXG5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLnBsdWdpbnMuZm9vRGVjb3JhdGlvbnNaSW5kZXgnLCAxKVxuXG4gICAgICAgIGNvbnN0IGNhbGxzID0gW11cbiAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdkcmF3TGluZURlY29yYXRpb24nKS5hbmRDYWxsRmFrZSgoZCkgPT4ge1xuICAgICAgICAgIGNhbGxzLnB1c2goZC5nZXRQcm9wZXJ0aWVzKCkucGx1Z2luKVxuICAgICAgICB9KVxuICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ2RyYXdIaWdobGlnaHREZWNvcmF0aW9uJykuYW5kQ2FsbEZha2UoKGQpID0+IHtcbiAgICAgICAgICBjYWxscy5wdXNoKGQuZ2V0UHJvcGVydGllcygpLnBsdWdpbilcbiAgICAgICAgfSlcblxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1sxLCAwXSwgWzEsIDEwXV0pLCB7dHlwZTogJ2xpbmUnLCBjb2xvcjogJyMwMDAwRkYnLCBwbHVnaW46ICdiYXInfSlcbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbMSwgMF0sIFsxLCAxMF1dKSwge3R5cGU6ICdoaWdobGlnaHQtdW5kZXInLCBjb2xvcjogJyMwMDAwRkYnLCBwbHVnaW46ICdmb28nfSlcblxuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgwKVxuXG4gICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICBleHBlY3QoY2FsbHMpLnRvRXF1YWwoWydiYXInLCAnZm9vJ10pXG5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAucGx1Z2lucy5mb29EZWNvcmF0aW9uc1pJbmRleCcsIC0xKVxuXG4gICAgICAgICAgY2FsbHMubGVuZ3RoID0gMFxuICAgICAgICB9KVxuXG4gICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgIH0pXG5cbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICAgIGV4cGVjdChjYWxscykudG9FcXVhbChbJ2ZvbycsICdiYXInXSlcblxuICAgICAgICAgIE1haW4udW5yZWdpc3RlclBsdWdpbignZm9vJylcbiAgICAgICAgICBNYWluLnVucmVnaXN0ZXJQbHVnaW4oJ2JhcicpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVuZGVycyB0aGUgdmlzaWJsZSBsaW5lIGRlY29yYXRpb25zJywgKCkgPT4ge1xuICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ2RyYXdMaW5lRGVjb3JhdGlvbicpLmFuZENhbGxUaHJvdWdoKClcblxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1sxLCAwXSwgWzEsIDEwXV0pLCB7dHlwZTogJ2xpbmUnLCBjb2xvcjogJyMwMDAwRkYnfSlcbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbMTAsIDBdLCBbMTAsIDEwXV0pLCB7dHlwZTogJ2xpbmUnLCBjb2xvcjogJyMwMDAwRkYnfSlcbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbMTAwLCAwXSwgWzEwMCwgMTBdXSksIHt0eXBlOiAnbGluZScsIGNvbG9yOiAnIzAwMDBGRid9KVxuXG4gICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDApXG5cbiAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgfSlcbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5kcmF3TGluZURlY29yYXRpb24pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5kcmF3TGluZURlY29yYXRpb24uY2FsbHMubGVuZ3RoKS50b0VxdWFsKDIpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVuZGVycyB0aGUgdmlzaWJsZSBndXR0ZXIgZGVjb3JhdGlvbnMnLCAoKSA9PiB7XG4gICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAnZHJhd0d1dHRlckRlY29yYXRpb24nKS5hbmRDYWxsVGhyb3VnaCgpXG5cbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbMSwgMF0sIFsxLCAxMF1dKSwge3R5cGU6ICdndXR0ZXInLCBjb2xvcjogJyMwMDAwRkYnfSlcbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbMTAsIDBdLCBbMTAsIDEwXV0pLCB7dHlwZTogJ2d1dHRlcicsIGNvbG9yOiAnIzAwMDBGRid9KVxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1sxMDAsIDBdLCBbMTAwLCAxMF1dKSwge3R5cGU6ICdndXR0ZXInLCBjb2xvcjogJyMwMDAwRkYnfSlcblxuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgwKVxuXG4gICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZHJhd0d1dHRlckRlY29yYXRpb24pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5kcmF3R3V0dGVyRGVjb3JhdGlvbi5jYWxscy5sZW5ndGgpLnRvRXF1YWwoMilcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZW5kZXJzIHRoZSB2aXNpYmxlIGhpZ2hsaWdodCBkZWNvcmF0aW9ucycsICgpID0+IHtcbiAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdkcmF3SGlnaGxpZ2h0RGVjb3JhdGlvbicpLmFuZENhbGxUaHJvdWdoKClcblxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1sxLCAwXSwgWzEsIDRdXSksIHt0eXBlOiAnaGlnaGxpZ2h0LXVuZGVyJywgY29sb3I6ICcjMDAwMEZGJ30pXG4gICAgICAgIG1pbmltYXAuZGVjb3JhdGVNYXJrZXIoZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbWzIsIDIwXSwgWzIsIDMwXV0pLCB7dHlwZTogJ2hpZ2hsaWdodC1vdmVyJywgY29sb3I6ICcjMDAwMEZGJ30pXG4gICAgICAgIG1pbmltYXAuZGVjb3JhdGVNYXJrZXIoZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbWzEwMCwgM10sIFsxMDAsIDVdXSksIHt0eXBlOiAnaGlnaGxpZ2h0LXVuZGVyJywgY29sb3I6ICcjMDAwMEZGJ30pXG5cbiAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoMClcblxuICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICB9KVxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmRyYXdIaWdobGlnaHREZWNvcmF0aW9uKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZHJhd0hpZ2hsaWdodERlY29yYXRpb24uY2FsbHMubGVuZ3RoKS50b0VxdWFsKDIpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVuZGVycyB0aGUgdmlzaWJsZSBvdXRsaW5lIGRlY29yYXRpb25zJywgKCkgPT4ge1xuICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ2RyYXdIaWdobGlnaHRPdXRsaW5lRGVjb3JhdGlvbicpLmFuZENhbGxUaHJvdWdoKClcblxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1sxLCA0XSwgWzMsIDZdXSksIHt0eXBlOiAnaGlnaGxpZ2h0LW91dGxpbmUnLCBjb2xvcjogJyMwMDAwZmYnfSlcbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbNiwgMF0sIFs2LCA3XV0pLCB7dHlwZTogJ2hpZ2hsaWdodC1vdXRsaW5lJywgY29sb3I6ICcjMDAwMGZmJ30pXG4gICAgICAgIG1pbmltYXAuZGVjb3JhdGVNYXJrZXIoZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbWzEwMCwgM10sIFsxMDAsIDVdXSksIHt0eXBlOiAnaGlnaGxpZ2h0LW91dGxpbmUnLCBjb2xvcjogJyMwMDAwZmYnfSlcblxuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgwKVxuXG4gICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZHJhd0hpZ2hsaWdodE91dGxpbmVEZWNvcmF0aW9uKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZHJhd0hpZ2hsaWdodE91dGxpbmVEZWNvcmF0aW9uLmNhbGxzLmxlbmd0aCkudG9FcXVhbCg0KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ3JlbmRlcnMgdGhlIHZpc2libGUgY3VzdG9tIGZvcmVncm91bmQgZGVjb3JhdGlvbnMnLCAoKSA9PiB7XG4gICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAnZHJhd0N1c3RvbURlY29yYXRpb24nKS5hbmRDYWxsVGhyb3VnaCgpXG5cbiAgICAgICAgY29uc3QgcmVuZGVyUm91dGluZSA9IGphc21pbmUuY3JlYXRlU3B5KCdyZW5kZXJSb3V0aW5lJylcblxuICAgICAgICBjb25zdCBwcm9wZXJ0aWVzID0ge1xuICAgICAgICAgIHR5cGU6ICdmb3JlZ3JvdW5kLWN1c3RvbScsXG4gICAgICAgICAgcmVuZGVyOiByZW5kZXJSb3V0aW5lXG4gICAgICAgIH1cblxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1sxLCA0XSwgWzMsIDZdXSksIHByb3BlcnRpZXMpXG4gICAgICAgIG1pbmltYXAuZGVjb3JhdGVNYXJrZXIoZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbWzYsIDBdLCBbNiwgN11dKSwgcHJvcGVydGllcylcbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbMTAwLCAzXSwgWzEwMCwgNV1dKSwgcHJvcGVydGllcylcblxuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgwKVxuXG4gICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZHJhd0N1c3RvbURlY29yYXRpb24pLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5kcmF3Q3VzdG9tRGVjb3JhdGlvbi5jYWxscy5sZW5ndGgpLnRvRXF1YWwoNClcblxuICAgICAgICAgIGV4cGVjdChyZW5kZXJSb3V0aW5lKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgICBleHBlY3QocmVuZGVyUm91dGluZS5jYWxscy5sZW5ndGgpLnRvRXF1YWwoNClcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZW5kZXJzIHRoZSB2aXNpYmxlIGN1c3RvbSBiYWNrZ3JvdW5kIGRlY29yYXRpb25zJywgKCkgPT4ge1xuICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ2RyYXdDdXN0b21EZWNvcmF0aW9uJykuYW5kQ2FsbFRocm91Z2goKVxuXG4gICAgICAgIGNvbnN0IHJlbmRlclJvdXRpbmUgPSBqYXNtaW5lLmNyZWF0ZVNweSgncmVuZGVyUm91dGluZScpXG5cbiAgICAgICAgY29uc3QgcHJvcGVydGllcyA9IHtcbiAgICAgICAgICB0eXBlOiAnYmFja2dyb3VuZC1jdXN0b20nLFxuICAgICAgICAgIHJlbmRlcjogcmVuZGVyUm91dGluZVxuICAgICAgICB9XG5cbiAgICAgICAgbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihlZGl0b3IubWFya0J1ZmZlclJhbmdlKFtbMSwgNF0sIFszLCA2XV0pLCBwcm9wZXJ0aWVzKVxuICAgICAgICBtaW5pbWFwLmRlY29yYXRlTWFya2VyKGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UoW1s2LCAwXSwgWzYsIDddXSksIHByb3BlcnRpZXMpXG4gICAgICAgIG1pbmltYXAuZGVjb3JhdGVNYXJrZXIoZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbWzEwMCwgM10sIFsxMDAsIDVdXSksIHByb3BlcnRpZXMpXG5cbiAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoMClcblxuICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICB9KVxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmRyYXdDdXN0b21EZWNvcmF0aW9uKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZHJhd0N1c3RvbURlY29yYXRpb24uY2FsbHMubGVuZ3RoKS50b0VxdWFsKDQpXG5cbiAgICAgICAgICBleHBlY3QocmVuZGVyUm91dGluZSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgICAgZXhwZWN0KHJlbmRlclJvdXRpbmUuY2FsbHMubGVuZ3RoKS50b0VxdWFsKDQpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiB0aGUgZWRpdG9yIGlzIHNjcm9sbGVkJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCgyMDAwKVxuICAgICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsTGVmdCg1MClcblxuICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCd1cGRhdGVzIHRoZSB2aXNpYmxlIGFyZWEnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRUb3AodmlzaWJsZUFyZWEpKS50b0JlQ2xvc2VUbyhtaW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRTY3JvbGxUb3AoKSAtIG1pbmltYXAuZ2V0U2Nyb2xsVG9wKCksIDApXG4gICAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRMZWZ0KHZpc2libGVBcmVhKSkudG9CZUNsb3NlVG8obWluaW1hcC5nZXRUZXh0RWRpdG9yU2NhbGVkU2Nyb2xsTGVmdCgpLCAwKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIGVkaXRvciBpcyByZXNpemVkIHRvIGEgZ3JlYXRlciBzaXplJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBlZGl0b3JFbGVtZW50LnN0eWxlLndpZHRoID0gJzgwMHB4J1xuICAgICAgICAgIGVkaXRvckVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gJzUwMHB4J1xuXG4gICAgICAgICAgbWluaW1hcEVsZW1lbnQubWVhc3VyZUhlaWdodEFuZFdpZHRoKClcblxuICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdkZXRlY3RzIHRoZSByZXNpemUgYW5kIGFkanVzdCBpdHNlbGYnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50Lm9mZnNldFdpZHRoKS50b0JlQ2xvc2VUbyhlZGl0b3JFbGVtZW50Lm9mZnNldFdpZHRoIC8gMTAsIDApXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50Lm9mZnNldEhlaWdodCkudG9FcXVhbChlZGl0b3JFbGVtZW50Lm9mZnNldEhlaWdodClcblxuICAgICAgICAgIGV4cGVjdChjYW52YXMub2Zmc2V0V2lkdGggLyBkZXZpY2VQaXhlbFJhdGlvKS50b0JlQ2xvc2VUbyhtaW5pbWFwRWxlbWVudC5vZmZzZXRXaWR0aCwgMClcbiAgICAgICAgICBleHBlY3QoY2FudmFzLm9mZnNldEhlaWdodCAvIGRldmljZVBpeGVsUmF0aW8pLnRvQmVDbG9zZVRvKG1pbmltYXBFbGVtZW50Lm9mZnNldEhlaWdodCArIG1pbmltYXAuZ2V0TGluZUhlaWdodCgpLCAwKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIGVkaXRvciB2aXNpYmxlIGNvbnRlbnQgaXMgY2hhbmdlZCcsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxMZWZ0KDApXG4gICAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoMTQwMClcbiAgICAgICAgICBlZGl0b3Iuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZShbWzEwMSwgMF0sIFsxMDIsIDIwXV0pXG5cbiAgICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgfSlcbiAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAnZHJhd0xpbmVzJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2ZvbycpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgncmVyZW5kZXJzIHRoZSBwYXJ0IHRoYXQgaGF2ZSBjaGFuZ2VkJywgKCkgPT4ge1xuICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmRyYXdMaW5lcykudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZHJhd0xpbmVzLmFyZ3NGb3JDYWxsWzBdWzBdKS50b0VxdWFsKDEwMClcbiAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5kcmF3TGluZXMuYXJnc0ZvckNhbGxbMF1bMV0pLnRvRXF1YWwoMTAyKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiB0aGUgZWRpdG9yIHZpc2liaWxpdHkgY2hhbmdlJywgKCkgPT4ge1xuICAgICAgICBpdCgnZG9lcyBub3QgbW9kaWZ5IHRoZSBzaXplIG9mIHRoZSBjYW52YXMnLCAoKSA9PiB7XG4gICAgICAgICAgbGV0IGNhbnZhc1dpZHRoID0gbWluaW1hcEVsZW1lbnQuZ2V0RnJvbnRDYW52YXMoKS53aWR0aFxuICAgICAgICAgIGxldCBjYW52YXNIZWlnaHQgPSBtaW5pbWFwRWxlbWVudC5nZXRGcm9udENhbnZhcygpLmhlaWdodFxuICAgICAgICAgIGVkaXRvckVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuXG4gICAgICAgICAgbWluaW1hcEVsZW1lbnQubWVhc3VyZUhlaWdodEFuZFdpZHRoKClcblxuICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmdldEZyb250Q2FudmFzKCkud2lkdGgpLnRvRXF1YWwoY2FudmFzV2lkdGgpXG4gICAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZ2V0RnJvbnRDYW52YXMoKS5oZWlnaHQpLnRvRXF1YWwoY2FudmFzSGVpZ2h0KVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ2Zyb20gaGlkZGVuIHRvIHZpc2libGUnLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBlZGl0b3JFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbiAgICAgICAgICAgIG1pbmltYXBFbGVtZW50LmNoZWNrRm9yVmlzaWJpbGl0eUNoYW5nZSgpXG4gICAgICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ3JlcXVlc3RGb3JjZWRVcGRhdGUnKVxuICAgICAgICAgICAgZWRpdG9yRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJydcbiAgICAgICAgICAgIG1pbmltYXBFbGVtZW50LnBvbGxET00oKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgncmVxdWVzdHMgYW4gdXBkYXRlIG9mIHRoZSB3aG9sZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnJlcXVlc3RGb3JjZWRVcGRhdGUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICAvLyAgICAgIyMjIyMjICAgIyMjIyMjICAjIyMjIyMjIyAgICMjIyMjIyMgICMjICAgICAgICMjXG4gICAgLy8gICAgIyMgICAgIyMgIyMgICAgIyMgIyMgICAgICMjICMjICAgICAjIyAjIyAgICAgICAjI1xuICAgIC8vICAgICMjICAgICAgICMjICAgICAgICMjICAgICAjIyAjIyAgICAgIyMgIyMgICAgICAgIyNcbiAgICAvLyAgICAgIyMjIyMjICAjIyAgICAgICAjIyMjIyMjIyAgIyMgICAgICMjICMjICAgICAgICMjXG4gICAgLy8gICAgICAgICAgIyMgIyMgICAgICAgIyMgICAjIyAgICMjICAgICAjIyAjIyAgICAgICAjI1xuICAgIC8vICAgICMjICAgICMjICMjICAgICMjICMjICAgICMjICAjIyAgICAgIyMgIyMgICAgICAgIyNcbiAgICAvLyAgICAgIyMjIyMjICAgIyMjIyMjICAjIyAgICAgIyMgICMjIyMjIyMgICMjIyMjIyMjICMjIyMjIyMjXG5cbiAgICBkZXNjcmliZSgnbW91c2Ugc2Nyb2xsIGNvbnRyb2xzJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIGVkaXRvckVsZW1lbnQuc2V0V2lkdGgoNDAwKVxuICAgICAgICBlZGl0b3JFbGVtZW50LnNldEhlaWdodCg0MDApXG4gICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDApXG4gICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsTGVmdCgwKVxuXG4gICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG5cbiAgICAgICAgbWluaW1hcEVsZW1lbnQubWVhc3VyZUhlaWdodEFuZFdpZHRoKClcblxuICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICB9KVxuICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd1c2luZyB0aGUgbW91c2Ugc2Nyb2xsd2hlZWwgb3ZlciB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgaXQoJ3JlbGF5cyB0aGUgZXZlbnRzIHRvIHRoZSBlZGl0b3IgdmlldycsICgpID0+IHtcbiAgICAgICAgICBzcHlPbihlZGl0b3JFbGVtZW50LmNvbXBvbmVudC5wcmVzZW50ZXIsICdzZXRTY3JvbGxUb3AnKS5hbmRDYWxsRmFrZSgoKSA9PiB7fSlcblxuICAgICAgICAgIG1vdXNld2hlZWwobWluaW1hcEVsZW1lbnQsIDAsIDE1KVxuXG4gICAgICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuY29tcG9uZW50LnByZXNlbnRlci5zZXRTY3JvbGxUb3ApLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBpbmRlcGVuZGVudE1pbmltYXBTY3JvbGwgc2V0dGluZyBpcyB0cnVlJywgKCkgPT4ge1xuICAgICAgICAgIGxldCBwcmV2aW91c1Njcm9sbFRvcFxuXG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuaW5kZXBlbmRlbnRNaW5pbWFwU2Nyb2xsJywgdHJ1ZSlcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5zY3JvbGxTZW5zaXRpdml0eScsIDAuNSlcblxuICAgICAgICAgICAgc3B5T24oZWRpdG9yRWxlbWVudC5jb21wb25lbnQucHJlc2VudGVyLCAnc2V0U2Nyb2xsVG9wJykuYW5kQ2FsbEZha2UoKCkgPT4ge30pXG5cbiAgICAgICAgICAgIHByZXZpb3VzU2Nyb2xsVG9wID0gbWluaW1hcC5nZXRTY3JvbGxUb3AoKVxuXG4gICAgICAgICAgICBtb3VzZXdoZWVsKG1pbmltYXBFbGVtZW50LCAwLCAtMTUpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdkb2VzIG5vdCByZWxheSB0aGUgZXZlbnRzIHRvIHRoZSBlZGl0b3InLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5jb21wb25lbnQucHJlc2VudGVyLnNldFNjcm9sbFRvcCkubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnc2Nyb2xscyB0aGUgbWluaW1hcCBpbnN0ZWFkJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KG1pbmltYXAuZ2V0U2Nyb2xsVG9wKCkpLm5vdC50b0VxdWFsKHByZXZpb3VzU2Nyb2xsVG9wKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnY2xhbXAgdGhlIG1pbmltYXAgc2Nyb2xsIGludG8gdGhlIGxlZ2l0IGJvdW5kcycsICgpID0+IHtcbiAgICAgICAgICAgIG1vdXNld2hlZWwobWluaW1hcEVsZW1lbnQsIDAsIC0xMDAwMDApXG5cbiAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwLmdldFNjcm9sbFRvcCgpKS50b0VxdWFsKG1pbmltYXAuZ2V0TWF4U2Nyb2xsVG9wKCkpXG5cbiAgICAgICAgICAgIG1vdXNld2hlZWwobWluaW1hcEVsZW1lbnQsIDAsIDEwMDAwMClcblxuICAgICAgICAgICAgZXhwZWN0KG1pbmltYXAuZ2V0U2Nyb2xsVG9wKCkpLnRvRXF1YWwoMClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ21pZGRsZSBjbGlja2luZyB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgbGV0IFtjYW52YXMsIHZpc2libGVBcmVhLCBvcmlnaW5hbExlZnQsIG1heFNjcm9sbF0gPSBbXVxuXG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGNhbnZhcyA9IG1pbmltYXBFbGVtZW50LmdldEZyb250Q2FudmFzKClcbiAgICAgICAgICB2aXNpYmxlQXJlYSA9IG1pbmltYXBFbGVtZW50LnZpc2libGVBcmVhXG4gICAgICAgICAgb3JpZ2luYWxMZWZ0ID0gdmlzaWJsZUFyZWEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdFxuICAgICAgICAgIG1heFNjcm9sbCA9IG1pbmltYXAuZ2V0VGV4dEVkaXRvck1heFNjcm9sbFRvcCgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3Njcm9sbHMgdG8gdGhlIHRvcCB1c2luZyB0aGUgbWlkZGxlIG1vdXNlIGJ1dHRvbicsICgpID0+IHtcbiAgICAgICAgICBtb3VzZWRvd24oY2FudmFzLCB7eDogb3JpZ2luYWxMZWZ0ICsgMSwgeTogMCwgYnRuOiAxfSlcbiAgICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3AoKSkudG9FcXVhbCgwKVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCdzY3JvbGxpbmcgdG8gdGhlIG1pZGRsZSB1c2luZyB0aGUgbWlkZGxlIG1vdXNlIGJ1dHRvbicsICgpID0+IHtcbiAgICAgICAgICBsZXQgY2FudmFzTWlkWVxuXG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBsZXQgZWRpdG9yTWlkWSA9IGVkaXRvckVsZW1lbnQuZ2V0SGVpZ2h0KCkgLyAyLjBcbiAgICAgICAgICAgIGxldCB7dG9wLCBoZWlnaHR9ID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgICBjYW52YXNNaWRZID0gdG9wICsgKGhlaWdodCAvIDIuMClcbiAgICAgICAgICAgIGxldCBhY3R1YWxNaWRZID0gTWF0aC5taW4oY2FudmFzTWlkWSwgZWRpdG9yTWlkWSlcbiAgICAgICAgICAgIG1vdXNlZG93bihjYW52YXMsIHt4OiBvcmlnaW5hbExlZnQgKyAxLCB5OiBhY3R1YWxNaWRZLCBidG46IDF9KVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnc2Nyb2xscyB0aGUgZWRpdG9yIHRvIHRoZSBtaWRkbGUnLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgbWlkZGxlU2Nyb2xsVG9wID0gTWF0aC5yb3VuZCgobWF4U2Nyb2xsKSAvIDIuMClcbiAgICAgICAgICAgIGV4cGVjdChlZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcCgpKS50b0VxdWFsKG1pZGRsZVNjcm9sbFRvcClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3VwZGF0ZXMgdGhlIHZpc2libGUgYXJlYSB0byBiZSBjZW50ZXJlZCcsICgpID0+IHtcbiAgICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuICAgICAgICAgICAgICBsZXQge3RvcCwgaGVpZ2h0fSA9IHZpc2libGVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG5cbiAgICAgICAgICAgICAgbGV0IHZpc2libGVDZW50ZXJZID0gdG9wICsgKGhlaWdodCAvIDIpXG4gICAgICAgICAgICAgIGV4cGVjdCh2aXNpYmxlQ2VudGVyWSkudG9CZUNsb3NlVG8oMjAwLCAwKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCdzY3JvbGxpbmcgdGhlIGVkaXRvciB0byBhbiBhcmJpdHJhcnkgbG9jYXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgbGV0IFtzY3JvbGxUbywgc2Nyb2xsUmF0aW9dID0gW11cblxuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgc2Nyb2xsVG8gPSAxMDEgLy8gcGl4ZWxzXG4gICAgICAgICAgICBzY3JvbGxSYXRpbyA9IChzY3JvbGxUbyAtIG1pbmltYXAuZ2V0VGV4dEVkaXRvclNjYWxlZEhlaWdodCgpIC8gMikgLyAobWluaW1hcC5nZXRWaXNpYmxlSGVpZ2h0KCkgLSBtaW5pbWFwLmdldFRleHRFZGl0b3JTY2FsZWRIZWlnaHQoKSlcbiAgICAgICAgICAgIHNjcm9sbFJhdGlvID0gTWF0aC5tYXgoMCwgc2Nyb2xsUmF0aW8pXG4gICAgICAgICAgICBzY3JvbGxSYXRpbyA9IE1hdGgubWluKDEsIHNjcm9sbFJhdGlvKVxuXG4gICAgICAgICAgICBtb3VzZWRvd24oY2FudmFzLCB7eDogb3JpZ2luYWxMZWZ0ICsgMSwgeTogc2Nyb2xsVG8sIGJ0bjogMX0pXG5cbiAgICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnc2Nyb2xscyB0aGUgZWRpdG9yIHRvIGFuIGFyYml0cmFyeSBsb2NhdGlvbicsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBleHBlY3RlZFNjcm9sbCA9IG1heFNjcm9sbCAqIHNjcm9sbFJhdGlvXG4gICAgICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3AoKSkudG9CZUNsb3NlVG8oZXhwZWN0ZWRTY3JvbGwsIDApXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGRlc2NyaWJlKCdkcmFnZ2luZyB0aGUgdmlzaWJsZSBhcmVhIHdpdGggbWlkZGxlIG1vdXNlIGJ1dHRvbiAnICtcbiAgICAgICAgICAnYWZ0ZXIgc2Nyb2xsaW5nIHRvIHRoZSBhcmJpdHJhcnkgbG9jYXRpb24nLCAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgW29yaWdpbmFsVG9wXSA9IFtdXG5cbiAgICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgICBvcmlnaW5hbFRvcCA9IHZpc2libGVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcFxuICAgICAgICAgICAgICBtb3VzZW1vdmUodmlzaWJsZUFyZWEsIHt4OiBvcmlnaW5hbExlZnQgKyAxLCB5OiBzY3JvbGxUbyArIDQwLCBidG46IDF9KVxuXG4gICAgICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICAgICAgICAgICAgbWluaW1hcEVsZW1lbnQuZW5kRHJhZygpXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBpdCgnc2Nyb2xscyB0aGUgZWRpdG9yIHNvIHRoYXQgdGhlIHZpc2libGUgYXJlYSB3YXMgbW92ZWQgZG93biAnICtcbiAgICAgICAgICAgICdieSA0MCBwaXhlbHMgZnJvbSB0aGUgYXJiaXRyYXJ5IGxvY2F0aW9uJywgKCkgPT4ge1xuICAgICAgICAgICAgICBsZXQge3RvcH0gPSB2aXNpYmxlQXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgICAgICBleHBlY3QodG9wKS50b0JlQ2xvc2VUbyhvcmlnaW5hbFRvcCArIDQwLCAtMSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCdwcmVzc2luZyB0aGUgbW91c2Ugb24gdGhlIG1pbmltYXAgY2FudmFzICh3aXRob3V0IHNjcm9sbCBhbmltYXRpb24pJywgKCkgPT4ge1xuICAgICAgICBsZXQgY2FudmFzXG5cbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgbGV0IHQgPSAwXG4gICAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdnZXRUaW1lJykuYW5kQ2FsbEZha2UoKCkgPT4ge1xuICAgICAgICAgICAgbGV0IG4gPSB0XG4gICAgICAgICAgICB0ICs9IDEwMFxuICAgICAgICAgICAgcmV0dXJuIG5cbiAgICAgICAgICB9KVxuICAgICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAncmVxdWVzdFVwZGF0ZScpLmFuZENhbGxGYWtlKCgpID0+IHt9KVxuXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLnNjcm9sbEFuaW1hdGlvbicsIGZhbHNlKVxuXG4gICAgICAgICAgY2FudmFzID0gbWluaW1hcEVsZW1lbnQuZ2V0RnJvbnRDYW52YXMoKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdzY3JvbGxzIHRoZSBlZGl0b3IgdG8gdGhlIGxpbmUgYmVsb3cgdGhlIG1vdXNlJywgKCkgPT4ge1xuICAgICAgICAgIG1vdXNlZG93bihjYW52YXMpXG4gICAgICAgICAgZXhwZWN0KGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKCkpLnRvQmVDbG9zZVRvKDQ4MClcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnd2hlbiBpbmRlcGVuZGVudE1pbmltYXBTY3JvbGwgc2V0dGluZyBpcyBlbmFibGVkJywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgbWluaW1hcC5zZXRTY3JvbGxUb3AoMTAwMClcbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5pbmRlcGVuZGVudE1pbmltYXBTY3JvbGwnLCB0cnVlKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnc2Nyb2xscyB0aGUgZWRpdG9yIHRvIHRoZSBsaW5lIGJlbG93IHRoZSBtb3VzZScsICgpID0+IHtcbiAgICAgICAgICAgIG1vdXNlZG93bihjYW52YXMpXG4gICAgICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3AoKSkudG9CZUNsb3NlVG8oNDgwKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgncHJlc3NpbmcgdGhlIG1vdXNlIG9uIHRoZSBtaW5pbWFwIGNhbnZhcyAod2l0aCBzY3JvbGwgYW5pbWF0aW9uKScsICgpID0+IHtcbiAgICAgICAgbGV0IGNhbnZhc1xuXG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGxldCB0ID0gMFxuICAgICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAnZ2V0VGltZScpLmFuZENhbGxGYWtlKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBuID0gdFxuICAgICAgICAgICAgdCArPSAxMDBcbiAgICAgICAgICAgIHJldHVybiBuXG4gICAgICAgICAgfSlcbiAgICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ3JlcXVlc3RVcGRhdGUnKS5hbmRDYWxsRmFrZSgoKSA9PiB7fSlcblxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5zY3JvbGxBbmltYXRpb24nLCB0cnVlKVxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5zY3JvbGxBbmltYXRpb25EdXJhdGlvbicsIDMwMClcblxuICAgICAgICAgIGNhbnZhcyA9IG1pbmltYXBFbGVtZW50LmdldEZyb250Q2FudmFzKClcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnc2Nyb2xscyB0aGUgZWRpdG9yIGdyYWR1YWxseSB0byB0aGUgbGluZSBiZWxvdyB0aGUgbW91c2UnLCAoKSA9PiB7XG4gICAgICAgICAgbW91c2Vkb3duKGNhbnZhcylcbiAgICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgfSlcbiAgICAgICAgICAvLyB3YWl0IHVudGlsIGFsbCBhbmltYXRpb25zIHJ1biBvdXRcbiAgICAgICAgICB3YWl0c0ZvcigoKSA9PiB7XG4gICAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWUgJiYgbmV4dEFuaW1hdGlvbkZyYW1lKClcbiAgICAgICAgICAgIHJldHVybiBlZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcCgpID49IDQ4MFxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3N0b3BzIHRoZSBhbmltYXRpb24gaWYgdGhlIHRleHQgZWRpdG9yIGlzIGRlc3Ryb3llZCcsICgpID0+IHtcbiAgICAgICAgICBtb3VzZWRvd24oY2FudmFzKVxuICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICBlZGl0b3IuZGVzdHJveSgpXG5cbiAgICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZSAmJiBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuXG4gICAgICAgICAgICBleHBlY3QobmV4dEFuaW1hdGlvbkZyYW1lID09PSBub0FuaW1hdGlvbkZyYW1lKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ3doZW4gaW5kZXBlbmRlbnRNaW5pbWFwU2Nyb2xsIHNldHRpbmcgaXMgZW5hYmxlZCcsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIG1pbmltYXAuc2V0U2Nyb2xsVG9wKDEwMDApXG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuaW5kZXBlbmRlbnRNaW5pbWFwU2Nyb2xsJywgdHJ1ZSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3Njcm9sbHMgdGhlIGVkaXRvciBncmFkdWFsbHkgdG8gdGhlIGxpbmUgYmVsb3cgdGhlIG1vdXNlJywgKCkgPT4ge1xuICAgICAgICAgICAgbW91c2Vkb3duKGNhbnZhcylcbiAgICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC8vIHdhaXQgdW50aWwgYWxsIGFuaW1hdGlvbnMgcnVuIG91dFxuICAgICAgICAgICAgd2FpdHNGb3IoKCkgPT4ge1xuICAgICAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWUgJiYgbmV4dEFuaW1hdGlvbkZyYW1lKClcbiAgICAgICAgICAgICAgcmV0dXJuIGVkaXRvckVsZW1lbnQuZ2V0U2Nyb2xsVG9wKCkgPj0gNDgwXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnc3RvcHMgdGhlIGFuaW1hdGlvbiBpZiB0aGUgdGV4dCBlZGl0b3IgaXMgZGVzdHJveWVkJywgKCkgPT4ge1xuICAgICAgICAgICAgbW91c2Vkb3duKGNhbnZhcylcbiAgICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICAgIGVkaXRvci5kZXN0cm95KClcblxuICAgICAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWUgJiYgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICAgICAgICBleHBlY3QobmV4dEFuaW1hdGlvbkZyYW1lID09PSBub0FuaW1hdGlvbkZyYW1lKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ2RyYWdnaW5nIHRoZSB2aXNpYmxlIGFyZWEnLCAoKSA9PiB7XG4gICAgICAgIGxldCBbdmlzaWJsZUFyZWEsIG9yaWdpbmFsVG9wXSA9IFtdXG5cbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgdmlzaWJsZUFyZWEgPSBtaW5pbWFwRWxlbWVudC52aXNpYmxlQXJlYVxuICAgICAgICAgIGxldCBvID0gdmlzaWJsZUFyZWEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICBsZXQgbGVmdCA9IG8ubGVmdFxuICAgICAgICAgIG9yaWdpbmFsVG9wID0gby50b3BcblxuICAgICAgICAgIG1vdXNlZG93bih2aXNpYmxlQXJlYSwge3g6IGxlZnQgKyAxMCwgeTogb3JpZ2luYWxUb3AgKyAxMH0pXG4gICAgICAgICAgbW91c2Vtb3ZlKHZpc2libGVBcmVhLCB7eDogbGVmdCArIDEwLCB5OiBvcmlnaW5hbFRvcCArIDUwfSlcblxuICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgICAgICAgbWluaW1hcEVsZW1lbnQuZW5kRHJhZygpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3Njcm9sbHMgdGhlIGVkaXRvciBzbyB0aGF0IHRoZSB2aXNpYmxlIGFyZWEgd2FzIG1vdmVkIGRvd24gYnkgNDAgcGl4ZWxzJywgKCkgPT4ge1xuICAgICAgICAgIGxldCB7dG9wfSA9IHZpc2libGVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgZXhwZWN0KHRvcCkudG9CZUNsb3NlVG8ob3JpZ2luYWxUb3AgKyA0MCwgLTEpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3N0b3BzIHRoZSBkcmFnIGdlc3R1cmUgd2hlbiB0aGUgbW91c2UgaXMgcmVsZWFzZWQgb3V0c2lkZSB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgICBsZXQge3RvcCwgbGVmdH0gPSB2aXNpYmxlQXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgIG1vdXNldXAoamFzbWluZUNvbnRlbnQsIHt4OiBsZWZ0IC0gMTAsIHk6IHRvcCArIDgwfSlcblxuICAgICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAnZHJhZycpXG4gICAgICAgICAgbW91c2Vtb3ZlKHZpc2libGVBcmVhLCB7eDogbGVmdCArIDEwLCB5OiB0b3AgKyA1MH0pXG5cbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZHJhZykubm90LnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ2RyYWdnaW5nIHRoZSB2aXNpYmxlIGFyZWEgdXNpbmcgdG91Y2ggZXZlbnRzJywgKCkgPT4ge1xuICAgICAgICBsZXQgW3Zpc2libGVBcmVhLCBvcmlnaW5hbFRvcF0gPSBbXVxuXG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIHZpc2libGVBcmVhID0gbWluaW1hcEVsZW1lbnQudmlzaWJsZUFyZWFcbiAgICAgICAgICBsZXQgbyA9IHZpc2libGVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgbGV0IGxlZnQgPSBvLmxlZnRcbiAgICAgICAgICBvcmlnaW5hbFRvcCA9IG8udG9wXG5cbiAgICAgICAgICB0b3VjaHN0YXJ0KHZpc2libGVBcmVhLCB7eDogbGVmdCArIDEwLCB5OiBvcmlnaW5hbFRvcCArIDEwfSlcbiAgICAgICAgICB0b3VjaG1vdmUodmlzaWJsZUFyZWEsIHt4OiBsZWZ0ICsgMTAsIHk6IG9yaWdpbmFsVG9wICsgNTB9KVxuXG4gICAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICAgIH0pXG4gICAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICAgICAgICBtaW5pbWFwRWxlbWVudC5lbmREcmFnKClcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnc2Nyb2xscyB0aGUgZWRpdG9yIHNvIHRoYXQgdGhlIHZpc2libGUgYXJlYSB3YXMgbW92ZWQgZG93biBieSA0MCBwaXhlbHMnLCAoKSA9PiB7XG4gICAgICAgICAgbGV0IHt0b3B9ID0gdmlzaWJsZUFyZWEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICBleHBlY3QodG9wKS50b0JlQ2xvc2VUbyhvcmlnaW5hbFRvcCArIDQwLCAtMSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnc3RvcHMgdGhlIGRyYWcgZ2VzdHVyZSB3aGVuIHRoZSBtb3VzZSBpcyByZWxlYXNlZCBvdXRzaWRlIHRoZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgICAgICAgIGxldCB7dG9wLCBsZWZ0fSA9IHZpc2libGVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgbW91c2V1cChqYXNtaW5lQ29udGVudCwge3g6IGxlZnQgLSAxMCwgeTogdG9wICsgODB9KVxuXG4gICAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdkcmFnJylcbiAgICAgICAgICB0b3VjaG1vdmUodmlzaWJsZUFyZWEsIHt4OiBsZWZ0ICsgMTAsIHk6IHRvcCArIDUwfSlcblxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5kcmFnKS5ub3QudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiB0aGUgbWluaW1hcCBjYW5ub3Qgc2Nyb2xsJywgKCkgPT4ge1xuICAgICAgICBsZXQgW3Zpc2libGVBcmVhLCBvcmlnaW5hbFRvcF0gPSBbXVxuXG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGxldCBzYW1wbGUgPSBmcy5yZWFkRmlsZVN5bmMoZGlyLnJlc29sdmUoJ3NldmVudHkudHh0JykpLnRvU3RyaW5nKClcbiAgICAgICAgICBlZGl0b3Iuc2V0VGV4dChzYW1wbGUpXG4gICAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3AoMClcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnZHJhZ2dpbmcgdGhlIHZpc2libGUgYXJlYScsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuXG4gICAgICAgICAgICAgIHZpc2libGVBcmVhID0gbWluaW1hcEVsZW1lbnQudmlzaWJsZUFyZWFcbiAgICAgICAgICAgICAgbGV0IHt0b3AsIGxlZnR9ID0gdmlzaWJsZUFyZWEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICAgICAgb3JpZ2luYWxUb3AgPSB0b3BcblxuICAgICAgICAgICAgICBtb3VzZWRvd24odmlzaWJsZUFyZWEsIHt4OiBsZWZ0ICsgMTAsIHk6IHRvcCArIDEwfSlcbiAgICAgICAgICAgICAgbW91c2Vtb3ZlKHZpc2libGVBcmVhLCB7eDogbGVmdCArIDEwLCB5OiB0b3AgKyA1MH0pXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgYWZ0ZXJFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIG1pbmltYXBFbGVtZW50LmVuZERyYWcoKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnc2Nyb2xscyBiYXNlZCBvbiBhIHJhdGlvIGFkanVzdGVkIHRvIHRoZSBtaW5pbWFwIGhlaWdodCcsICgpID0+IHtcbiAgICAgICAgICAgIGxldCB7dG9wfSA9IHZpc2libGVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgICBleHBlY3QodG9wKS50b0JlQ2xvc2VUbyhvcmlnaW5hbFRvcCArIDQwLCAtMSlcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gc2Nyb2xsIHBhc3QgZW5kIGlzIGVuYWJsZWQnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnNjcm9sbFBhc3RFbmQnLCB0cnVlKVxuXG4gICAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICAgIH0pXG4gICAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ2RyYWdnaW5nIHRoZSB2aXNpYmxlIGFyZWEnLCAoKSA9PiB7XG4gICAgICAgICAgbGV0IFtvcmlnaW5hbFRvcCwgdmlzaWJsZUFyZWFdID0gW11cblxuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgdmlzaWJsZUFyZWEgPSBtaW5pbWFwRWxlbWVudC52aXNpYmxlQXJlYVxuICAgICAgICAgICAgbGV0IHt0b3AsIGxlZnR9ID0gdmlzaWJsZUFyZWEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICAgIG9yaWdpbmFsVG9wID0gdG9wXG5cbiAgICAgICAgICAgIG1vdXNlZG93bih2aXNpYmxlQXJlYSwge3g6IGxlZnQgKyAxMCwgeTogdG9wICsgMTB9KVxuICAgICAgICAgICAgbW91c2Vtb3ZlKHZpc2libGVBcmVhLCB7eDogbGVmdCArIDEwLCB5OiB0b3AgKyA1MH0pXG5cbiAgICAgICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBhZnRlckVhY2goKCkgPT4ge1xuICAgICAgICAgICAgbWluaW1hcEVsZW1lbnQuZW5kRHJhZygpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdzY3JvbGxzIHRoZSBlZGl0b3Igc28gdGhhdCB0aGUgdmlzaWJsZSBhcmVhIHdhcyBtb3ZlZCBkb3duIGJ5IDQwIHBpeGVscycsICgpID0+IHtcbiAgICAgICAgICAgIGxldCB7dG9wfSA9IHZpc2libGVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgICBleHBlY3QodG9wKS50b0JlQ2xvc2VUbyhvcmlnaW5hbFRvcCArIDQwLCAtMSlcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgLy8gICAgICMjIyMjIyAgIyMjIyMjIyMgICAgIyMjICAgICMjICAgICMjICMjIyMjIyMjXG4gICAgLy8gICAgIyMgICAgIyMgICAgIyMgICAgICAjIyAjIyAgICMjIyAgICMjICMjICAgICAjI1xuICAgIC8vICAgICMjICAgICAgICAgICMjICAgICAjIyAgICMjICAjIyMjICAjIyAjIyAgICAgIyNcbiAgICAvLyAgICAgIyMjIyMjICAgICAjIyAgICAjIyAgICAgIyMgIyMgIyMgIyMgIyMgICAgICMjXG4gICAgLy8gICAgICAgICAgIyMgICAgIyMgICAgIyMjIyMjIyMjICMjICAjIyMjICMjICAgICAjI1xuICAgIC8vICAgICMjICAgICMjICAgICMjICAgICMjICAgICAjIyAjIyAgICMjIyAjIyAgICAgIyNcbiAgICAvLyAgICAgIyMjIyMjICAgICAjIyAgICAjIyAgICAgIyMgIyMgICAgIyMgIyMjIyMjIyNcbiAgICAvL1xuICAgIC8vICAgICAgICMjIyAgICAjIyAgICAgICAgIyMjIyMjIyAgIyMgICAgIyMgIyMjIyMjIyNcbiAgICAvLyAgICAgICMjICMjICAgIyMgICAgICAgIyMgICAgICMjICMjIyAgICMjICMjXG4gICAgLy8gICAgICMjICAgIyMgICMjICAgICAgICMjICAgICAjIyAjIyMjICAjIyAjI1xuICAgIC8vICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgIyMgIyMgIyMgIyMgIyMjIyMjXG4gICAgLy8gICAgIyMjIyMjIyMjICMjICAgICAgICMjICAgICAjIyAjIyAgIyMjIyAjI1xuICAgIC8vICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAgIyMgIyMgICAjIyMgIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMjIyMjIyMgICMjIyMjIyMgICMjICAgICMjICMjIyMjIyMjXG5cbiAgICBkZXNjcmliZSgnd2hlbiB0aGUgbW9kZWwgaXMgYSBzdGFuZC1hbG9uZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIG1pbmltYXAuc2V0U3RhbmRBbG9uZSh0cnVlKVxuICAgICAgfSlcblxuICAgICAgaXQoJ2hhcyBhIHN0YW5kLWFsb25lIGF0dHJpYnV0ZScsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50Lmhhc0F0dHJpYnV0ZSgnc3RhbmQtYWxvbmUnKSkudG9CZVRydXRoeSgpXG4gICAgICB9KVxuXG4gICAgICBpdCgnc2V0cyB0aGUgbWluaW1hcCBzaXplIHdoZW4gbWVhc3VyZWQnLCAoKSA9PiB7XG4gICAgICAgIG1pbmltYXBFbGVtZW50Lm1lYXN1cmVIZWlnaHRBbmRXaWR0aCgpXG5cbiAgICAgICAgZXhwZWN0KG1pbmltYXAud2lkdGgpLnRvRXF1YWwobWluaW1hcEVsZW1lbnQuY2xpZW50V2lkdGgpXG4gICAgICAgIGV4cGVjdChtaW5pbWFwLmhlaWdodCkudG9FcXVhbChtaW5pbWFwRWxlbWVudC5jbGllbnRIZWlnaHQpXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVtb3ZlcyB0aGUgY29udHJvbHMgZGl2JywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcubWluaW1hcC1jb250cm9scycpKS50b0JlTnVsbCgpXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVtb3ZlcyB0aGUgdmlzaWJsZSBhcmVhJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQudmlzaWJsZUFyZWEpLnRvQmVVbmRlZmluZWQoKVxuICAgICAgfSlcblxuICAgICAgaXQoJ3JlbW92ZXMgdGhlIHF1aWNrIHNldHRpbmdzIGJ1dHRvbicsICgpID0+IHtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmRpc3BsYXlQbHVnaW5zQ29udHJvbHMnLCB0cnVlKVxuXG4gICAgICAgIHdhaXRzRm9yKCdhIG5ldyBhbmltYXRpb24gZnJhbWUgcmVxdWVzdCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4ge1xuICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50Lm9wZW5RdWlja1NldHRpbmdzKS50b0JlVW5kZWZpbmVkKClcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZW1vdmVzIHRoZSBzY3JvbGwgaW5kaWNhdG9yJywgKCkgPT4ge1xuICAgICAgICBlZGl0b3Iuc2V0VGV4dChtZWRpdW1TYW1wbGUpXG4gICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDUwKVxuXG4gICAgICAgIHdhaXRzRm9yKCdtaW5pbWFwIGZyYW1lIHJlcXVlc3RlZCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWRcbiAgICAgICAgfSlcbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAubWluaW1hcFNjcm9sbEluZGljYXRvcicsIHRydWUpXG4gICAgICAgIH0pXG5cbiAgICAgICAgd2FpdHNGb3IoJ21pbmltYXAgZnJhbWUgcmVxdWVzdGVkJywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZFxuICAgICAgICB9KVxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5taW5pbWFwLXNjcm9sbC1pbmRpY2F0b3InKSkudG9CZU51bGwoKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3ByZXNzaW5nIHRoZSBtb3VzZSBvbiB0aGUgbWluaW1hcCBjYW52YXMnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGphc21pbmVDb250ZW50LmFwcGVuZENoaWxkKG1pbmltYXBFbGVtZW50KVxuXG4gICAgICAgICAgbGV0IHQgPSAwXG4gICAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdnZXRUaW1lJykuYW5kQ2FsbEZha2UoKCkgPT4ge1xuICAgICAgICAgICAgbGV0IG4gPSB0XG4gICAgICAgICAgICB0ICs9IDEwMFxuICAgICAgICAgICAgcmV0dXJuIG5cbiAgICAgICAgICB9KVxuICAgICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAncmVxdWVzdFVwZGF0ZScpLmFuZENhbGxGYWtlKCgpID0+IHt9KVxuXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLnNjcm9sbEFuaW1hdGlvbicsIGZhbHNlKVxuXG4gICAgICAgICAgY2FudmFzID0gbWluaW1hcEVsZW1lbnQuZ2V0RnJvbnRDYW52YXMoKVxuICAgICAgICAgIG1vdXNlZG93bihjYW52YXMpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ2RvZXMgbm90IHNjcm9sbCB0aGUgZWRpdG9yIHRvIHRoZSBsaW5lIGJlbG93IHRoZSBtb3VzZScsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QoZWRpdG9yRWxlbWVudC5nZXRTY3JvbGxUb3AoKSkudG9FcXVhbCgxMDAwKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ2FuZCBpcyBjaGFuZ2VkIHRvIGJlIGEgY2xhc3NpY2FsIG1pbmltYXAgYWdhaW4nLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5kaXNwbGF5UGx1Z2luc0NvbnRyb2xzJywgdHJ1ZSlcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAubWluaW1hcFNjcm9sbEluZGljYXRvcicsIHRydWUpXG5cbiAgICAgICAgICBtaW5pbWFwLnNldFN0YW5kQWxvbmUoZmFsc2UpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3JlY3JlYXRlcyB0aGUgZGVzdHJveWVkIGVsZW1lbnRzJywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5taW5pbWFwLWNvbnRyb2xzJykpLnRvRXhpc3QoKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5taW5pbWFwLXZpc2libGUtYXJlYScpKS50b0V4aXN0KClcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcubWluaW1hcC1zY3JvbGwtaW5kaWNhdG9yJykpLnRvRXhpc3QoKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5vcGVuLW1pbmltYXAtcXVpY2stc2V0dGluZ3MnKSkudG9FeGlzdCgpXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICAvLyAgICAjIyMjIyMjIyAgIyMjIyMjIyMgICMjIyMjIyAgIyMjIyMjIyMgIyMjIyMjIyMgICAjIyMjIyMjICAjIyAgICAjI1xuICAgIC8vICAgICMjICAgICAjIyAjIyAgICAgICAjIyAgICAjIyAgICAjIyAgICAjIyAgICAgIyMgIyMgICAgICMjICAjIyAgIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMgICAgICAgIyMgICAgICAgICAgIyMgICAgIyMgICAgICMjICMjICAgICAjIyAgICMjIyNcbiAgICAvLyAgICAjIyAgICAgIyMgIyMjIyMjICAgICMjIyMjIyAgICAgIyMgICAgIyMjIyMjIyMgICMjICAgICAjIyAgICAjI1xuICAgIC8vICAgICMjICAgICAjIyAjIyAgICAgICAgICAgICAjIyAgICAjIyAgICAjIyAgICMjICAgIyMgICAgICMjICAgICMjXG4gICAgLy8gICAgIyMgICAgICMjICMjICAgICAgICMjICAgICMjICAgICMjICAgICMjICAgICMjICAjIyAgICAgIyMgICAgIyNcbiAgICAvLyAgICAjIyMjIyMjIyAgIyMjIyMjIyMgICMjIyMjIyAgICAgIyMgICAgIyMgICAgICMjICAjIyMjIyMjICAgICAjI1xuXG4gICAgZGVzY3JpYmUoJ3doZW4gdGhlIG1vZGVsIGlzIGRlc3Ryb3llZCcsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBtaW5pbWFwLmRlc3Ryb3koKVxuICAgICAgfSlcblxuICAgICAgaXQoJ2RldGFjaGVzIGl0c2VsZiBmcm9tIGl0cyBwYXJlbnQnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5wYXJlbnROb2RlKS50b0JlTnVsbCgpXG4gICAgICB9KVxuXG4gICAgICBpdCgnc3RvcHMgdGhlIERPTSBwb2xsaW5nIGludGVydmFsJywgKCkgPT4ge1xuICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ3BvbGxET00nKVxuXG4gICAgICAgIHNsZWVwKDIwMClcblxuICAgICAgICBydW5zKCgpID0+IHsgZXhwZWN0KG1pbmltYXBFbGVtZW50LnBvbGxET00pLm5vdC50b0hhdmVCZWVuQ2FsbGVkKCkgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIC8vICAgICAjIyMjIyMgICAjIyMjIyMjICAjIyAgICAjIyAjIyMjIyMjIyAjIyMjICAjIyMjIyNcbiAgICAvLyAgICAjIyAgICAjIyAjIyAgICAgIyMgIyMjICAgIyMgIyMgICAgICAgICMjICAjIyAgICAjI1xuICAgIC8vICAgICMjICAgICAgICMjICAgICAjIyAjIyMjICAjIyAjIyAgICAgICAgIyMgICMjXG4gICAgLy8gICAgIyMgICAgICAgIyMgICAgICMjICMjICMjICMjICMjIyMjIyAgICAjIyAgIyMgICAjIyMjXG4gICAgLy8gICAgIyMgICAgICAgIyMgICAgICMjICMjICAjIyMjICMjICAgICAgICAjIyAgIyMgICAgIyNcbiAgICAvLyAgICAjIyAgICAjIyAjIyAgICAgIyMgIyMgICAjIyMgIyMgICAgICAgICMjICAjIyAgICAjI1xuICAgIC8vICAgICAjIyMjIyMgICAjIyMjIyMjICAjIyAgICAjIyAjIyAgICAgICAjIyMjICAjIyMjIyNcblxuICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBhdG9tIHN0eWxlcyBhcmUgY2hhbmdlZCcsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICB9KVxuICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuICAgICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAncmVxdWVzdEZvcmNlZFVwZGF0ZScpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ2ludmFsaWRhdGVET01TdHlsZXNDYWNoZScpLmFuZENhbGxUaHJvdWdoKClcblxuICAgICAgICAgIGxldCBzdHlsZU5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpXG4gICAgICAgICAgc3R5bGVOb2RlLnRleHRDb250ZW50ID0gJ2JvZHl7IGNvbG9yOiAjMjMzIH0nXG4gICAgICAgICAgYXRvbS5zdHlsZXMuZW1pdHRlci5lbWl0KCdkaWQtYWRkLXN0eWxlLWVsZW1lbnQnLCBzdHlsZU5vZGUpXG4gICAgICAgIH0pXG5cbiAgICAgICAgd2FpdHNGb3IoJ21pbmltYXAgZnJhbWUgcmVxdWVzdGVkJywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZFxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ2ZvcmNlcyBhIHJlZnJlc2ggd2l0aCBjYWNoZSBpbnZhbGlkYXRpb24nLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5yZXF1ZXN0Rm9yY2VkVXBkYXRlKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmludmFsaWRhdGVET01TdHlsZXNDYWNoZSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnd2hlbiBtaW5pbWFwLnRleHRPcGFjaXR5IGlzIGNoYW5nZWQnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdyZXF1ZXN0Rm9yY2VkVXBkYXRlJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAudGV4dE9wYWNpdHknLCAwLjMpXG5cbiAgICAgICAgd2FpdHNGb3IoJ21pbmltYXAgZnJhbWUgcmVxdWVzdGVkJywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZFxuICAgICAgICB9KVxuICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZXF1ZXN0cyBhIGNvbXBsZXRlIHVwZGF0ZScsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnJlcXVlc3RGb3JjZWRVcGRhdGUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gbWluaW1hcC5kaXNwbGF5Q29kZUhpZ2hsaWdodHMgaXMgY2hhbmdlZCcsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ3JlcXVlc3RGb3JjZWRVcGRhdGUnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5kaXNwbGF5Q29kZUhpZ2hsaWdodHMnLCB0cnVlKVxuXG4gICAgICAgIHdhaXRzRm9yKCdtaW5pbWFwIGZyYW1lIHJlcXVlc3RlZCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWRcbiAgICAgICAgfSlcbiAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgncmVxdWVzdHMgYSBjb21wbGV0ZSB1cGRhdGUnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5yZXF1ZXN0Rm9yY2VkVXBkYXRlKS50b0hhdmVCZWVuQ2FsbGVkKClcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCd3aGVuIG1pbmltYXAuY2hhcldpZHRoIGlzIGNoYW5nZWQnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgc3B5T24obWluaW1hcEVsZW1lbnQsICdyZXF1ZXN0Rm9yY2VkVXBkYXRlJykuYW5kQ2FsbFRocm91Z2goKVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuY2hhcldpZHRoJywgMSlcblxuICAgICAgICB3YWl0c0ZvcignbWluaW1hcCBmcmFtZSByZXF1ZXN0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG1pbmltYXBFbGVtZW50LmZyYW1lUmVxdWVzdGVkXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ3JlcXVlc3RzIGEgY29tcGxldGUgdXBkYXRlJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQucmVxdWVzdEZvcmNlZFVwZGF0ZSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnd2hlbiBtaW5pbWFwLmNoYXJIZWlnaHQgaXMgY2hhbmdlZCcsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBzcHlPbihtaW5pbWFwRWxlbWVudCwgJ3JlcXVlc3RGb3JjZWRVcGRhdGUnKS5hbmRDYWxsVGhyb3VnaCgpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5jaGFySGVpZ2h0JywgMSlcblxuICAgICAgICB3YWl0c0ZvcignbWluaW1hcCBmcmFtZSByZXF1ZXN0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG1pbmltYXBFbGVtZW50LmZyYW1lUmVxdWVzdGVkXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuICAgICAgfSlcblxuICAgICAgaXQoJ3JlcXVlc3RzIGEgY29tcGxldGUgdXBkYXRlJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQucmVxdWVzdEZvcmNlZFVwZGF0ZSkudG9IYXZlQmVlbkNhbGxlZCgpXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnd2hlbiBtaW5pbWFwLmludGVybGluZSBpcyBjaGFuZ2VkJywgKCkgPT4ge1xuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIHNweU9uKG1pbmltYXBFbGVtZW50LCAncmVxdWVzdEZvcmNlZFVwZGF0ZScpLmFuZENhbGxUaHJvdWdoKClcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmludGVybGluZScsIDIpXG5cbiAgICAgICAgd2FpdHNGb3IoJ21pbmltYXAgZnJhbWUgcmVxdWVzdGVkJywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZFxuICAgICAgICB9KVxuICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdyZXF1ZXN0cyBhIGNvbXBsZXRlIHVwZGF0ZScsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnJlcXVlc3RGb3JjZWRVcGRhdGUpLnRvSGF2ZUJlZW5DYWxsZWQoKVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoJ3doZW4gbWluaW1hcC5kaXNwbGF5TWluaW1hcE9uTGVmdCBzZXR0aW5nIGlzIHRydWUnLCAoKSA9PiB7XG4gICAgICBpdCgnbW92ZXMgdGhlIGF0dGFjaGVkIG1pbmltYXAgdG8gdGhlIGxlZnQnLCAoKSA9PiB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5kaXNwbGF5TWluaW1hcE9uTGVmdCcsIHRydWUpXG4gICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2xlZnQnKSkudG9CZVRydXRoeSgpXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiB0aGUgbWluaW1hcCBpcyBub3QgYXR0YWNoZWQgeWV0JywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5idWlsZFRleHRFZGl0b3Ioe30pXG4gICAgICAgICAgZWRpdG9yRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpXG4gICAgICAgICAgZWRpdG9yRWxlbWVudC5zZXRIZWlnaHQoNTApXG4gICAgICAgICAgZWRpdG9yLnNldExpbmVIZWlnaHRJblBpeGVscygxMClcblxuICAgICAgICAgIG1pbmltYXAgPSBuZXcgTWluaW1hcCh7dGV4dEVkaXRvcjogZWRpdG9yfSlcbiAgICAgICAgICBtaW5pbWFwRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhtaW5pbWFwKVxuXG4gICAgICAgICAgamFzbWluZUNvbnRlbnQuaW5zZXJ0QmVmb3JlKGVkaXRvckVsZW1lbnQsIGphc21pbmVDb250ZW50LmZpcnN0Q2hpbGQpXG5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuZGlzcGxheU1pbmltYXBPbkxlZnQnLCB0cnVlKVxuICAgICAgICAgIG1pbmltYXBFbGVtZW50LmF0dGFjaCgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ21vdmVzIHRoZSBhdHRhY2hlZCBtaW5pbWFwIHRvIHRoZSBsZWZ0JywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2xlZnQnKSkudG9CZVRydXRoeSgpXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnd2hlbiBtaW5pbWFwLmFkanVzdE1pbmltYXBXaWR0aFRvU29mdFdyYXAgaXMgdHJ1ZScsICgpID0+IHtcbiAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5zb2Z0V3JhcCcsIHRydWUpXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnNvZnRXcmFwQXRQcmVmZXJyZWRMaW5lTGVuZ3RoJywgdHJ1ZSlcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdlZGl0b3IucHJlZmVycmVkTGluZUxlbmd0aCcsIDIpXG5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmFkanVzdE1pbmltYXBXaWR0aFRvU29mdFdyYXAnLCB0cnVlKVxuXG4gICAgICAgIHdhaXRzRm9yKCdtaW5pbWFwIGZyYW1lIHJlcXVlc3RlZCcsICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gbWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWRcbiAgICAgICAgfSlcbiAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICB9KVxuXG4gICAgICBpdCgnYWRqdXN0cyB0aGUgd2lkdGggb2YgdGhlIG1pbmltYXAgY2FudmFzJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZ2V0RnJvbnRDYW52YXMoKS53aWR0aCAvIGRldmljZVBpeGVsUmF0aW8pLnRvRXF1YWwoNClcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdvZmZzZXRzIHRoZSBtaW5pbWFwIGJ5IHRoZSBkaWZmZXJlbmNlJywgKCkgPT4ge1xuICAgICAgICBleHBlY3QocmVhbE9mZnNldExlZnQobWluaW1hcEVsZW1lbnQpKS50b0JlQ2xvc2VUbyhlZGl0b3JFbGVtZW50LmNsaWVudFdpZHRoIC0gNCwgLTEpXG4gICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5jbGllbnRXaWR0aCkudG9FcXVhbCg0KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3RoZSBkb20gcG9sbGluZyByb3V0aW5lJywgKCkgPT4ge1xuICAgICAgICBpdCgnZG9lcyBub3QgY2hhbmdlIHRoZSB2YWx1ZScsICgpID0+IHtcbiAgICAgICAgICBhdG9tLnZpZXdzLnBlcmZvcm1Eb2N1bWVudFBvbGwoKVxuXG4gICAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICAgIH0pXG4gICAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgICBuZXh0QW5pbWF0aW9uRnJhbWUoKVxuICAgICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmdldEZyb250Q2FudmFzKCkud2lkdGggLyBkZXZpY2VQaXhlbFJhdGlvKS50b0VxdWFsKDQpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBlZGl0b3IgaXMgcmVzaXplZCcsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdlZGl0b3IucHJlZmVycmVkTGluZUxlbmd0aCcsIDYpXG4gICAgICAgICAgZWRpdG9yRWxlbWVudC5zdHlsZS53aWR0aCA9ICcxMDBweCdcbiAgICAgICAgICBlZGl0b3JFbGVtZW50LnN0eWxlLmhlaWdodCA9ICcxMDBweCdcblxuICAgICAgICAgIGF0b20udmlld3MucGVyZm9ybURvY3VtZW50UG9sbCgpXG5cbiAgICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV4dEFuaW1hdGlvbkZyYW1lICE9PSBub0FuaW1hdGlvbkZyYW1lXG4gICAgICAgICAgfSlcbiAgICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnbWFrZXMgdGhlIG1pbmltYXAgc21hbGxlciB0aGFuIHNvZnQgd3JhcCcsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQub2Zmc2V0V2lkdGgpLnRvQmVDbG9zZVRvKDEyLCAtMSlcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuc3R5bGUubWFyZ2luUmlnaHQpLnRvRXF1YWwoJycpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnYW5kIHdoZW4gbWluaW1hcC5taW5pbWFwU2Nyb2xsSW5kaWNhdG9yIHNldHRpbmcgaXMgdHJ1ZScsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgZWRpdG9yLnNldFRleHQobWVkaXVtU2FtcGxlKVxuICAgICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDUwKVxuXG4gICAgICAgICAgd2FpdHNGb3IoJ21pbmltYXAgZnJhbWUgcmVxdWVzdGVkJywgKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG1pbmltYXBFbGVtZW50LmZyYW1lUmVxdWVzdGVkXG4gICAgICAgICAgfSlcbiAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgIG5leHRBbmltYXRpb25GcmFtZSgpXG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAubWluaW1hcFNjcm9sbEluZGljYXRvcicsIHRydWUpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIHdhaXRzRm9yKCdtaW5pbWFwIGZyYW1lIHJlcXVlc3RlZCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZFxuICAgICAgICAgIH0pXG4gICAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ29mZnNldHMgdGhlIHNjcm9sbCBpbmRpY2F0b3IgYnkgdGhlIGRpZmZlcmVuY2UnLCAoKSA9PiB7XG4gICAgICAgICAgbGV0IGluZGljYXRvciA9IG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm1pbmltYXAtc2Nyb2xsLWluZGljYXRvcicpXG4gICAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRMZWZ0KGluZGljYXRvcikpLnRvQmVDbG9zZVRvKDIsIC0xKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ2FuZCB3aGVuIG1pbmltYXAuZGlzcGxheVBsdWdpbnNDb250cm9scyBzZXR0aW5nIGlzIHRydWUnLCAoKSA9PiB7XG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5kaXNwbGF5UGx1Z2luc0NvbnRyb2xzJywgdHJ1ZSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnb2Zmc2V0cyB0aGUgc2Nyb2xsIGluZGljYXRvciBieSB0aGUgZGlmZmVyZW5jZScsICgpID0+IHtcbiAgICAgICAgICBsZXQgb3BlblF1aWNrU2V0dGluZ3MgPSBtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5vcGVuLW1pbmltYXAtcXVpY2stc2V0dGluZ3MnKVxuICAgICAgICAgIGV4cGVjdChyZWFsT2Zmc2V0TGVmdChvcGVuUXVpY2tTZXR0aW5ncykpLm5vdC50b0JlQ2xvc2VUbygyLCAtMSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCdhbmQgdGhlbiBkaXNhYmxlZCcsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmFkanVzdE1pbmltYXBXaWR0aFRvU29mdFdyYXAnLCBmYWxzZSlcblxuICAgICAgICAgIHdhaXRzRm9yKCdtaW5pbWFwIGZyYW1lIHJlcXVlc3RlZCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZFxuICAgICAgICAgIH0pXG4gICAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ2FkanVzdHMgdGhlIHdpZHRoIG9mIHRoZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5vZmZzZXRXaWR0aCkudG9CZUNsb3NlVG8oZWRpdG9yRWxlbWVudC5vZmZzZXRXaWR0aCAvIDEwLCAtMSlcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuc3R5bGUud2lkdGgpLnRvRXF1YWwoJycpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnYW5kIHdoZW4gcHJlZmVycmVkTGluZUxlbmd0aCA+PSAxNjM4NCcsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdlZGl0b3IucHJlZmVycmVkTGluZUxlbmd0aCcsIDE2Mzg0KVxuXG4gICAgICAgICAgd2FpdHNGb3IoJ21pbmltYXAgZnJhbWUgcmVxdWVzdGVkJywgKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG1pbmltYXBFbGVtZW50LmZyYW1lUmVxdWVzdGVkXG4gICAgICAgICAgfSlcbiAgICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnYWRqdXN0cyB0aGUgd2lkdGggb2YgdGhlIG1pbmltYXAnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50Lm9mZnNldFdpZHRoKS50b0JlQ2xvc2VUbyhlZGl0b3JFbGVtZW50Lm9mZnNldFdpZHRoIC8gMTAsIC0xKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zdHlsZS53aWR0aCkudG9FcXVhbCgnJylcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGRlc2NyaWJlKCd3aGVuIG1pbmltYXAubWluaW1hcFNjcm9sbEluZGljYXRvciBzZXR0aW5nIGlzIHRydWUnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgZWRpdG9yLnNldFRleHQobWVkaXVtU2FtcGxlKVxuICAgICAgICBlZGl0b3JFbGVtZW50LnNldFNjcm9sbFRvcCg1MClcblxuICAgICAgICB3YWl0c0ZvcignbWluaW1hcCBmcmFtZSByZXF1ZXN0ZWQnLCAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG1pbmltYXBFbGVtZW50LmZyYW1lUmVxdWVzdGVkXG4gICAgICAgIH0pXG4gICAgICAgIHJ1bnMoKCkgPT4geyBuZXh0QW5pbWF0aW9uRnJhbWUoKSB9KVxuXG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5taW5pbWFwU2Nyb2xsSW5kaWNhdG9yJywgdHJ1ZSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdhZGRzIGEgc2Nyb2xsIGluZGljYXRvciBpbiB0aGUgZWxlbWVudCcsICgpID0+IHtcbiAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm1pbmltYXAtc2Nyb2xsLWluZGljYXRvcicpKS50b0V4aXN0KClcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCdhbmQgdGhlbiBkZWFjdGl2YXRlZCcsICgpID0+IHtcbiAgICAgICAgaXQoJ3JlbW92ZXMgdGhlIHNjcm9sbCBpbmRpY2F0b3IgZnJvbSB0aGUgZWxlbWVudCcsICgpID0+IHtcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAubWluaW1hcFNjcm9sbEluZGljYXRvcicsIGZhbHNlKVxuICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5taW5pbWFwLXNjcm9sbC1pbmRpY2F0b3InKSkubm90LnRvRXhpc3QoKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ29uIHVwZGF0ZScsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgZWRpdG9yRWxlbWVudC5zdHlsZS5oZWlnaHQgPSAnNTAwcHgnXG5cbiAgICAgICAgICBhdG9tLnZpZXdzLnBlcmZvcm1Eb2N1bWVudFBvbGwoKVxuXG4gICAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5leHRBbmltYXRpb25GcmFtZSAhPT0gbm9BbmltYXRpb25GcmFtZVxuICAgICAgICAgIH0pXG4gICAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ2FkanVzdHMgdGhlIHNpemUgYW5kIHBvc2l0aW9uIG9mIHRoZSBpbmRpY2F0b3InLCAoKSA9PiB7XG4gICAgICAgICAgbGV0IGluZGljYXRvciA9IG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm1pbmltYXAtc2Nyb2xsLWluZGljYXRvcicpXG5cbiAgICAgICAgICBsZXQgaGVpZ2h0ID0gZWRpdG9yRWxlbWVudC5nZXRIZWlnaHQoKSAqIChlZGl0b3JFbGVtZW50LmdldEhlaWdodCgpIC8gbWluaW1hcC5nZXRIZWlnaHQoKSlcbiAgICAgICAgICBsZXQgc2Nyb2xsID0gKGVkaXRvckVsZW1lbnQuZ2V0SGVpZ2h0KCkgLSBoZWlnaHQpICogbWluaW1hcC5nZXRUZXh0RWRpdG9yU2Nyb2xsUmF0aW8oKVxuXG4gICAgICAgICAgZXhwZWN0KGluZGljYXRvci5vZmZzZXRIZWlnaHQpLnRvQmVDbG9zZVRvKGhlaWdodCwgMClcbiAgICAgICAgICBleHBlY3QocmVhbE9mZnNldFRvcChpbmRpY2F0b3IpKS50b0JlQ2xvc2VUbyhzY3JvbGwsIDApXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2hlbiB0aGUgbWluaW1hcCBjYW5ub3Qgc2Nyb2xsJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBlZGl0b3Iuc2V0VGV4dChzbWFsbFNhbXBsZSlcblxuICAgICAgICAgIHdhaXRzRm9yKCdtaW5pbWFwIGZyYW1lIHJlcXVlc3RlZCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZFxuICAgICAgICAgIH0pXG4gICAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3JlbW92ZXMgdGhlIHNjcm9sbCBpbmRpY2F0b3InLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm1pbmltYXAtc2Nyb2xsLWluZGljYXRvcicpKS5ub3QudG9FeGlzdCgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ2FuZCB0aGVuIGNhbiBzY3JvbGwgYWdhaW4nLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBlZGl0b3Iuc2V0VGV4dChsYXJnZVNhbXBsZSlcblxuICAgICAgICAgICAgd2FpdHNGb3IoJ21pbmltYXAgZnJhbWUgcmVxdWVzdGVkJywgKCkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gbWluaW1hcEVsZW1lbnQuZnJhbWVSZXF1ZXN0ZWRcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBydW5zKCgpID0+IHsgbmV4dEFuaW1hdGlvbkZyYW1lKCkgfSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ2F0dGFjaGVzIHRoZSBzY3JvbGwgaW5kaWNhdG9yJywgKCkgPT4ge1xuICAgICAgICAgICAgd2FpdHNGb3IoJ21pbmltYXAgc2Nyb2xsIGluZGljYXRvcicsICgpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm1pbmltYXAtc2Nyb2xsLWluZGljYXRvcicpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnd2hlbiBtaW5pbWFwLmFic29sdXRlTW9kZSBzZXR0aW5nIGlzIHRydWUnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmFic29sdXRlTW9kZScsIHRydWUpXG4gICAgICB9KVxuXG4gICAgICBpdCgnYWRkcyBhIGFic29sdXRlIGNsYXNzIHRvIHRoZSBtaW5pbWFwIGVsZW1lbnQnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2Fic29sdXRlJykpLnRvQmVUcnV0aHkoKVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gbWluaW1hcC5kaXNwbGF5TWluaW1hcE9uTGVmdCBzZXR0aW5nIGlzIHRydWUnLCAoKSA9PiB7XG4gICAgICAgIGl0KCdhbHNvIGFkZHMgYSBsZWZ0IGNsYXNzIHRvIHRoZSBtaW5pbWFwIGVsZW1lbnQnLCAoKSA9PiB7XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmRpc3BsYXlNaW5pbWFwT25MZWZ0JywgdHJ1ZSlcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdhYnNvbHV0ZScpKS50b0JlVHJ1dGh5KClcbiAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdsZWZ0JykpLnRvQmVUcnV0aHkoKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gbWluaW1hcC5hZGp1c3RBYnNvbHV0ZU1vZGVIZWlnaHQgc2V0dGluZyBpcyB0cnVlJywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuYWRqdXN0QWJzb2x1dGVNb2RlSGVpZ2h0JywgdHJ1ZSlcbiAgICAgICAgfSlcbiAgICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIGNvbnRlbnQgb2YgdGhlIG1pbmltYXAgaXMgc21hbGxlciB0aGF0IHRoZSBlZGl0b3IgaGVpZ2h0JywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgZWRpdG9yLnNldFRleHQoc21hbGxTYW1wbGUpXG4gICAgICAgICAgICBlZGl0b3JFbGVtZW50LnNldEhlaWdodCg0MDApXG4gICAgICAgICAgICBtaW5pbWFwRWxlbWVudC5tZWFzdXJlSGVpZ2h0QW5kV2lkdGgoKVxuXG4gICAgICAgICAgICB3YWl0c0ZvcignYSBuZXcgYW5pbWF0aW9uIGZyYW1lIHJlcXVlc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIHJ1bnMoKCkgPT4gbmV4dEFuaW1hdGlvbkZyYW1lKCkpXG4gICAgICAgICAgfSlcbiAgICAgICAgICBpdCgnYWRqdXN0cyB0aGUgY2FudmFzIGhlaWdodCB0byB0aGUgbWluaW1hcCBoZWlnaHQnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCdjYW52YXMnKS5vZmZzZXRIZWlnaHQpLnRvRXF1YWwobWluaW1hcC5nZXRIZWlnaHQoKSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIGNvbnRlbnQgaXMgbW9kaWZpZWQnLCAoKSA9PiB7XG4gICAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgICAgZWRpdG9yLmluc2VydFRleHQoJ2Zvb1xcblxcbmJhclxcbicpXG5cbiAgICAgICAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICBydW5zKCgpID0+IG5leHRBbmltYXRpb25GcmFtZSgpKVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgaXQoJ2FkanVzdHMgdGhlIGNhbnZhcyBoZWlnaHQgdG8gdGhlIG5ldyBtaW5pbWFwIGhlaWdodCcsICgpID0+IHtcbiAgICAgICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignY2FudmFzJykub2Zmc2V0SGVpZ2h0KS50b0VxdWFsKG1pbmltYXAuZ2V0SGVpZ2h0KCkpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICBkZXNjcmliZSgnd2hlbiB0aGUgc21vb3RoU2Nyb2xsaW5nIHNldHRpbmcgaXMgZGlzYWJsZWQnLCAoKSA9PiB7XG4gICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLnNtb290aFNjcm9sbGluZycsIGZhbHNlKVxuICAgICAgfSlcbiAgICAgIGl0KCdkb2VzIG5vdCBvZmZzZXQgdGhlIGNhbnZhcyB3aGVuIHRoZSBzY3JvbGwgZG9lcyBub3QgbWF0Y2ggbGluZSBoZWlnaHQnLCAoKSA9PiB7XG4gICAgICAgIGVkaXRvckVsZW1lbnQuc2V0U2Nyb2xsVG9wKDEwMDQpXG5cbiAgICAgICAgd2FpdHNGb3IoJ2EgbmV3IGFuaW1hdGlvbiBmcmFtZSByZXF1ZXN0JywgKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBuZXh0QW5pbWF0aW9uRnJhbWUgIT09IG5vQW5pbWF0aW9uRnJhbWVcbiAgICAgICAgfSlcbiAgICAgICAgcnVucygoKSA9PiB7XG4gICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICAgIGV4cGVjdChyZWFsT2Zmc2V0VG9wKGNhbnZhcykpLnRvRXF1YWwoMClcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIC8vICAgICAjIyMjIyMjICAjIyAgICAgIyMgIyMjIyAgIyMjIyMjICAjIyAgICAjI1xuICAgIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgICMjICAjIyAgICAjIyAjIyAgICMjXG4gICAgLy8gICAgIyMgICAgICMjICMjICAgICAjIyAgIyMgICMjICAgICAgICMjICAjI1xuICAgIC8vICAgICMjICAgICAjIyAjIyAgICAgIyMgICMjICAjIyAgICAgICAjIyMjI1xuICAgIC8vICAgICMjICAjIyAjIyAjIyAgICAgIyMgICMjICAjIyAgICAgICAjIyAgIyNcbiAgICAvLyAgICAjIyAgICAjIyAgIyMgICAgICMjICAjIyAgIyMgICAgIyMgIyMgICAjI1xuICAgIC8vICAgICAjIyMjIyAjIyAgIyMjIyMjIyAgIyMjIyAgIyMjIyMjICAjIyAgICAjI1xuICAgIC8vXG4gICAgLy8gICAgICMjIyMjIyAgIyMjIyMjIyMgIyMjIyMjIyMgIyMjIyMjIyMgIyMjIyAjIyAgICAjIyAgIyMjIyMjICAgICMjIyMjI1xuICAgIC8vICAgICMjICAgICMjICMjICAgICAgICAgICMjICAgICAgICMjICAgICAjIyAgIyMjICAgIyMgIyMgICAgIyMgICMjICAgICMjXG4gICAgLy8gICAgIyMgICAgICAgIyMgICAgICAgICAgIyMgICAgICAgIyMgICAgICMjICAjIyMjICAjIyAjIyAgICAgICAgIyNcbiAgICAvLyAgICAgIyMjIyMjICAjIyMjIyMgICAgICAjIyAgICAgICAjIyAgICAgIyMgICMjICMjICMjICMjICAgIyMjIyAgIyMjIyMjXG4gICAgLy8gICAgICAgICAgIyMgIyMgICAgICAgICAgIyMgICAgICAgIyMgICAgICMjICAjIyAgIyMjIyAjIyAgICAjIyAgICAgICAgIyNcbiAgICAvLyAgICAjIyAgICAjIyAjIyAgICAgICAgICAjIyAgICAgICAjIyAgICAgIyMgICMjICAgIyMjICMjICAgICMjICAjIyAgICAjI1xuICAgIC8vICAgICAjIyMjIyMgICMjIyMjIyMjICAgICMjICAgICAgICMjICAgICMjIyMgIyMgICAgIyMgICMjIyMjIyAgICAjIyMjIyNcblxuICAgIGRlc2NyaWJlKCd3aGVuIG1pbmltYXAuZGlzcGxheVBsdWdpbnNDb250cm9scyBzZXR0aW5nIGlzIHRydWUnLCAoKSA9PiB7XG4gICAgICBsZXQgW29wZW5RdWlja1NldHRpbmdzLCBxdWlja1NldHRpbmdzRWxlbWVudCwgd29ya3NwYWNlRWxlbWVudF0gPSBbXVxuICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgIGF0b20uY29uZmlnLnNldCgnbWluaW1hcC5kaXNwbGF5UGx1Z2luc0NvbnRyb2xzJywgdHJ1ZSlcbiAgICAgIH0pXG5cbiAgICAgIGl0KCdoYXMgYSBkaXYgdG8gb3BlbiB0aGUgcXVpY2sgc2V0dGluZ3MnLCAoKSA9PiB7XG4gICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5vcGVuLW1pbmltYXAtcXVpY2stc2V0dGluZ3MnKSkudG9FeGlzdCgpXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnY2xpY2tpbmcgb24gdGhlIGRpdicsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcbiAgICAgICAgICBqYXNtaW5lQ29udGVudC5hcHBlbmRDaGlsZCh3b3Jrc3BhY2VFbGVtZW50KVxuXG4gICAgICAgICAgb3BlblF1aWNrU2V0dGluZ3MgPSBtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5vcGVuLW1pbmltYXAtcXVpY2stc2V0dGluZ3MnKVxuICAgICAgICAgIG1vdXNlZG93bihvcGVuUXVpY2tTZXR0aW5ncylcblxuICAgICAgICAgIHF1aWNrU2V0dGluZ3NFbGVtZW50ID0gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdtaW5pbWFwLXF1aWNrLXNldHRpbmdzJylcbiAgICAgICAgfSlcblxuICAgICAgICBhZnRlckVhY2goKCkgPT4ge1xuICAgICAgICAgIG1pbmltYXBFbGVtZW50LnF1aWNrU2V0dGluZ3NFbGVtZW50LmRlc3Ryb3koKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdvcGVucyB0aGUgcXVpY2sgc2V0dGluZ3MgdmlldycsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QocXVpY2tTZXR0aW5nc0VsZW1lbnQpLnRvRXhpc3QoKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdwb3NpdGlvbnMgdGhlIHF1aWNrIHNldHRpbmdzIHZpZXcgbmV4dCB0byB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgICBsZXQgbWluaW1hcEJvdW5kcyA9IG1pbmltYXBFbGVtZW50LmdldEZyb250Q2FudmFzKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICBsZXQgc2V0dGluZ3NCb3VuZHMgPSBxdWlja1NldHRpbmdzRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuXG4gICAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRUb3AocXVpY2tTZXR0aW5nc0VsZW1lbnQpKS50b0JlQ2xvc2VUbyhtaW5pbWFwQm91bmRzLnRvcCwgMClcbiAgICAgICAgICBleHBlY3QocmVhbE9mZnNldExlZnQocXVpY2tTZXR0aW5nc0VsZW1lbnQpKS50b0JlQ2xvc2VUbyhtaW5pbWFwQm91bmRzLmxlZnQgLSBzZXR0aW5nc0JvdW5kcy53aWR0aCwgMClcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIGRlc2NyaWJlKCd3aGVuIHRoZSBkaXNwbGF5TWluaW1hcE9uTGVmdCBzZXR0aW5nIGlzIGVuYWJsZWQnLCAoKSA9PiB7XG4gICAgICAgIGRlc2NyaWJlKCdjbGlja2luZyBvbiB0aGUgZGl2JywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmRpc3BsYXlNaW5pbWFwT25MZWZ0JywgdHJ1ZSlcblxuICAgICAgICAgICAgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcbiAgICAgICAgICAgIGphc21pbmVDb250ZW50LmFwcGVuZENoaWxkKHdvcmtzcGFjZUVsZW1lbnQpXG5cbiAgICAgICAgICAgIG9wZW5RdWlja1NldHRpbmdzID0gbWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcub3Blbi1taW5pbWFwLXF1aWNrLXNldHRpbmdzJylcbiAgICAgICAgICAgIG1vdXNlZG93bihvcGVuUXVpY2tTZXR0aW5ncylcblxuICAgICAgICAgICAgcXVpY2tTZXR0aW5nc0VsZW1lbnQgPSB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ21pbmltYXAtcXVpY2stc2V0dGluZ3MnKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBhZnRlckVhY2goKCkgPT4ge1xuICAgICAgICAgICAgbWluaW1hcEVsZW1lbnQucXVpY2tTZXR0aW5nc0VsZW1lbnQuZGVzdHJveSgpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdwb3NpdGlvbnMgdGhlIHF1aWNrIHNldHRpbmdzIHZpZXcgbmV4dCB0byB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBtaW5pbWFwQm91bmRzID0gbWluaW1hcEVsZW1lbnQuZ2V0RnJvbnRDYW52YXMoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuXG4gICAgICAgICAgICBleHBlY3QocmVhbE9mZnNldFRvcChxdWlja1NldHRpbmdzRWxlbWVudCkpLnRvQmVDbG9zZVRvKG1pbmltYXBCb3VuZHMudG9wLCAwKVxuICAgICAgICAgICAgZXhwZWN0KHJlYWxPZmZzZXRMZWZ0KHF1aWNrU2V0dGluZ3NFbGVtZW50KSkudG9CZUNsb3NlVG8obWluaW1hcEJvdW5kcy5yaWdodCwgMClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIGFkanVzdE1pbmltYXBXaWR0aFRvU29mdFdyYXAgc2V0dGluZyBpcyBlbmFibGVkJywgKCkgPT4ge1xuICAgICAgICBsZXQgW2NvbnRyb2xzXSA9IFtdXG4gICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgIGF0b20uY29uZmlnLnNldCgnZWRpdG9yLnNvZnRXcmFwJywgdHJ1ZSlcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ2VkaXRvci5zb2Z0V3JhcEF0UHJlZmVycmVkTGluZUxlbmd0aCcsIHRydWUpXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdlZGl0b3IucHJlZmVycmVkTGluZUxlbmd0aCcsIDIpXG5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuYWRqdXN0TWluaW1hcFdpZHRoVG9Tb2Z0V3JhcCcsIHRydWUpXG4gICAgICAgICAgbmV4dEFuaW1hdGlvbkZyYW1lKClcblxuICAgICAgICAgIGNvbnRyb2xzID0gbWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcubWluaW1hcC1jb250cm9scycpXG4gICAgICAgICAgb3BlblF1aWNrU2V0dGluZ3MgPSBtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5vcGVuLW1pbmltYXAtcXVpY2stc2V0dGluZ3MnKVxuXG4gICAgICAgICAgZWRpdG9yRWxlbWVudC5zdHlsZS53aWR0aCA9ICcxMDI0cHgnXG5cbiAgICAgICAgICBhdG9tLnZpZXdzLnBlcmZvcm1Eb2N1bWVudFBvbGwoKVxuICAgICAgICAgIHdhaXRzRm9yKCdtaW5pbWFwIGZyYW1lIHJlcXVlc3RlZCcsICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZFxuICAgICAgICAgIH0pXG4gICAgICAgICAgcnVucygoKSA9PiB7IG5leHRBbmltYXRpb25GcmFtZSgpIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ2FkanVzdHMgdGhlIHNpemUgb2YgdGhlIGNvbnRyb2wgZGl2IHRvIGZpdCBpbiB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QoY29udHJvbHMuY2xpZW50V2lkdGgpLnRvRXF1YWwobWluaW1hcEVsZW1lbnQuZ2V0RnJvbnRDYW52YXMoKS5jbGllbnRXaWR0aCAvIGRldmljZVBpeGVsUmF0aW8pXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ3Bvc2l0aW9ucyB0aGUgY29udHJvbHMgZGl2IG92ZXIgdGhlIGNhbnZhcycsICgpID0+IHtcbiAgICAgICAgICBsZXQgY29udHJvbHNSZWN0ID0gY29udHJvbHMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICBsZXQgY2FudmFzUmVjdCA9IG1pbmltYXBFbGVtZW50LmdldEZyb250Q2FudmFzKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICBleHBlY3QoY29udHJvbHNSZWN0LmxlZnQpLnRvRXF1YWwoY2FudmFzUmVjdC5sZWZ0KVxuICAgICAgICAgIGV4cGVjdChjb250cm9sc1JlY3QucmlnaHQpLnRvRXF1YWwoY2FudmFzUmVjdC5yaWdodClcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnd2hlbiB0aGUgZGlzcGxheU1pbmltYXBPbkxlZnQgc2V0dGluZyBpcyBlbmFibGVkJywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5jb25maWcuc2V0KCdtaW5pbWFwLmRpc3BsYXlNaW5pbWFwT25MZWZ0JywgdHJ1ZSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ2FkanVzdHMgdGhlIHNpemUgb2YgdGhlIGNvbnRyb2wgZGl2IHRvIGZpdCBpbiB0aGUgbWluaW1hcCcsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChjb250cm9scy5jbGllbnRXaWR0aCkudG9FcXVhbChtaW5pbWFwRWxlbWVudC5nZXRGcm9udENhbnZhcygpLmNsaWVudFdpZHRoIC8gZGV2aWNlUGl4ZWxSYXRpbylcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3Bvc2l0aW9ucyB0aGUgY29udHJvbHMgZGl2IG92ZXIgdGhlIGNhbnZhcycsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBjb250cm9sc1JlY3QgPSBjb250cm9scy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgICAgbGV0IGNhbnZhc1JlY3QgPSBtaW5pbWFwRWxlbWVudC5nZXRGcm9udENhbnZhcygpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgICBleHBlY3QoY29udHJvbHNSZWN0LmxlZnQpLnRvRXF1YWwoY2FudmFzUmVjdC5sZWZ0KVxuICAgICAgICAgICAgZXhwZWN0KGNvbnRyb2xzUmVjdC5yaWdodCkudG9FcXVhbChjYW52YXNSZWN0LnJpZ2h0KVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBkZXNjcmliZSgnY2xpY2tpbmcgb24gdGhlIGRpdicsICgpID0+IHtcbiAgICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgICB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuICAgICAgICAgICAgICBqYXNtaW5lQ29udGVudC5hcHBlbmRDaGlsZCh3b3Jrc3BhY2VFbGVtZW50KVxuXG4gICAgICAgICAgICAgIG9wZW5RdWlja1NldHRpbmdzID0gbWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcub3Blbi1taW5pbWFwLXF1aWNrLXNldHRpbmdzJylcbiAgICAgICAgICAgICAgbW91c2Vkb3duKG9wZW5RdWlja1NldHRpbmdzKVxuXG4gICAgICAgICAgICAgIHF1aWNrU2V0dGluZ3NFbGVtZW50ID0gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdtaW5pbWFwLXF1aWNrLXNldHRpbmdzJylcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIGFmdGVyRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICAgIG1pbmltYXBFbGVtZW50LnF1aWNrU2V0dGluZ3NFbGVtZW50LmRlc3Ryb3koKVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgaXQoJ3Bvc2l0aW9ucyB0aGUgcXVpY2sgc2V0dGluZ3MgdmlldyBuZXh0IHRvIHRoZSBtaW5pbWFwJywgKCkgPT4ge1xuICAgICAgICAgICAgICBsZXQgbWluaW1hcEJvdW5kcyA9IG1pbmltYXBFbGVtZW50LmdldEZyb250Q2FudmFzKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcblxuICAgICAgICAgICAgICBleHBlY3QocmVhbE9mZnNldFRvcChxdWlja1NldHRpbmdzRWxlbWVudCkpLnRvQmVDbG9zZVRvKG1pbmltYXBCb3VuZHMudG9wLCAwKVxuICAgICAgICAgICAgICBleHBlY3QocmVhbE9mZnNldExlZnQocXVpY2tTZXR0aW5nc0VsZW1lbnQpKS50b0JlQ2xvc2VUbyhtaW5pbWFwQm91bmRzLnJpZ2h0LCAwKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3doZW4gdGhlIHF1aWNrIHNldHRpbmdzIHZpZXcgaXMgb3BlbicsICgpID0+IHtcbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcbiAgICAgICAgICBqYXNtaW5lQ29udGVudC5hcHBlbmRDaGlsZCh3b3Jrc3BhY2VFbGVtZW50KVxuXG4gICAgICAgICAgb3BlblF1aWNrU2V0dGluZ3MgPSBtaW5pbWFwRWxlbWVudC5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3IoJy5vcGVuLW1pbmltYXAtcXVpY2stc2V0dGluZ3MnKVxuICAgICAgICAgIG1vdXNlZG93bihvcGVuUXVpY2tTZXR0aW5ncylcblxuICAgICAgICAgIHF1aWNrU2V0dGluZ3NFbGVtZW50ID0gd29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdtaW5pbWFwLXF1aWNrLXNldHRpbmdzJylcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnc2V0cyB0aGUgb24gcmlnaHQgYnV0dG9uIGFjdGl2ZScsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QocXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ0bi5zZWxlY3RlZDpsYXN0LWNoaWxkJykpLnRvRXhpc3QoKVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCdjbGlja2luZyBvbiB0aGUgY29kZSBoaWdobGlnaHQgaXRlbScsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBpdGVtID0gcXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignbGkuY29kZS1oaWdobGlnaHRzJylcbiAgICAgICAgICAgIG1vdXNlZG93bihpdGVtKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgndG9nZ2xlcyB0aGUgY29kZSBoaWdobGlnaHRzIG9uIHRoZSBtaW5pbWFwIGVsZW1lbnQnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQuZGlzcGxheUNvZGVIaWdobGlnaHRzKS50b0JlVHJ1dGh5KClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3JlcXVlc3RzIGFuIHVwZGF0ZScsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5mcmFtZVJlcXVlc3RlZCkudG9CZVRydXRoeSgpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnY2xpY2tpbmcgb24gdGhlIGFic29sdXRlIG1vZGUgaXRlbScsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBpdGVtID0gcXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignbGkuYWJzb2x1dGUtbW9kZScpXG4gICAgICAgICAgICBtb3VzZWRvd24oaXRlbSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3RvZ2dsZXMgdGhlIGFic29sdXRlLW1vZGUgc2V0dGluZycsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ21pbmltYXAuYWJzb2x1dGVNb2RlJykpLnRvQmVUcnV0aHkoKVxuICAgICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LmFic29sdXRlTW9kZSkudG9CZVRydXRoeSgpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnY2xpY2tpbmcgb24gdGhlIG9uIGxlZnQgYnV0dG9uJywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgbGV0IGl0ZW0gPSBxdWlja1NldHRpbmdzRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnRuOmZpcnN0LWNoaWxkJylcbiAgICAgICAgICAgIG1vdXNlZG93bihpdGVtKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgndG9nZ2xlcyB0aGUgZGlzcGxheU1pbmltYXBPbkxlZnQgc2V0dGluZycsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ21pbmltYXAuZGlzcGxheU1pbmltYXBPbkxlZnQnKSkudG9CZVRydXRoeSgpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdjaGFuZ2VzIHRoZSBidXR0b25zIGFjdGl2YXRpb24gc3RhdGUnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QocXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ0bi5zZWxlY3RlZDpsYXN0LWNoaWxkJykpLm5vdC50b0V4aXN0KClcbiAgICAgICAgICAgIGV4cGVjdChxdWlja1NldHRpbmdzRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuYnRuLnNlbGVjdGVkOmZpcnN0LWNoaWxkJykpLnRvRXhpc3QoKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ2NvcmU6bW92ZS1sZWZ0JywgKCkgPT4ge1xuICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS1sZWZ0JylcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3RvZ2dsZXMgdGhlIGRpc3BsYXlNaW5pbWFwT25MZWZ0IHNldHRpbmcnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QoYXRvbS5jb25maWcuZ2V0KCdtaW5pbWFwLmRpc3BsYXlNaW5pbWFwT25MZWZ0JykpLnRvQmVUcnV0aHkoKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnY2hhbmdlcyB0aGUgYnV0dG9ucyBhY3RpdmF0aW9uIHN0YXRlJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idG4uc2VsZWN0ZWQ6bGFzdC1jaGlsZCcpKS5ub3QudG9FeGlzdCgpXG4gICAgICAgICAgICBleHBlY3QocXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignLmJ0bi5zZWxlY3RlZDpmaXJzdC1jaGlsZCcpKS50b0V4aXN0KClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCdjb3JlOm1vdmUtcmlnaHQgd2hlbiB0aGUgbWluaW1hcCBpcyBvbiB0aGUgcmlnaHQnLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuZGlzcGxheU1pbmltYXBPbkxlZnQnLCB0cnVlKVxuICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS1yaWdodCcpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCd0b2dnbGVzIHRoZSBkaXNwbGF5TWluaW1hcE9uTGVmdCBzZXR0aW5nJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnbWluaW1hcC5kaXNwbGF5TWluaW1hcE9uTGVmdCcpKS50b0JlRmFsc3koKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnY2hhbmdlcyB0aGUgYnV0dG9ucyBhY3RpdmF0aW9uIHN0YXRlJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idG4uc2VsZWN0ZWQ6Zmlyc3QtY2hpbGQnKSkubm90LnRvRXhpc3QoKVxuICAgICAgICAgICAgZXhwZWN0KHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idG4uc2VsZWN0ZWQ6bGFzdC1jaGlsZCcpKS50b0V4aXN0KClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCdjbGlja2luZyBvbiB0aGUgb3BlbiBzZXR0aW5ncyBidXR0b24gYWdhaW4nLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBtb3VzZWRvd24ob3BlblF1aWNrU2V0dGluZ3MpXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGl0KCdjbG9zZXMgdGhlIHF1aWNrIHNldHRpbmdzIHZpZXcnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3Qod29ya3NwYWNlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdtaW5pbWFwLXF1aWNrLXNldHRpbmdzJykpLm5vdC50b0V4aXN0KClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3JlbW92ZXMgdGhlIHZpZXcgZnJvbSB0aGUgZWxlbWVudCcsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5xdWlja1NldHRpbmdzRWxlbWVudCkudG9CZU51bGwoKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ3doZW4gYW4gZXh0ZXJuYWwgZXZlbnQgZGVzdHJveXMgdGhlIHZpZXcnLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBtaW5pbWFwRWxlbWVudC5xdWlja1NldHRpbmdzRWxlbWVudC5kZXN0cm95KClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3JlbW92ZXMgdGhlIHZpZXcgcmVmZXJlbmNlIGZyb20gdGhlIGVsZW1lbnQnLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QobWluaW1hcEVsZW1lbnQucXVpY2tTZXR0aW5nc0VsZW1lbnQpLnRvQmVOdWxsKClcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgZGVzY3JpYmUoJ3RoZW4gZGlzYWJsaW5nIGl0JywgKCkgPT4ge1xuICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ21pbmltYXAuZGlzcGxheVBsdWdpbnNDb250cm9scycsIGZhbHNlKVxuICAgICAgICB9KVxuXG4gICAgICAgIGl0KCdyZW1vdmVzIHRoZSBkaXYnLCAoKSA9PiB7XG4gICAgICAgICAgZXhwZWN0KG1pbmltYXBFbGVtZW50LnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcignLm9wZW4tbWluaW1hcC1xdWljay1zZXR0aW5ncycpKS5ub3QudG9FeGlzdCgpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICBkZXNjcmliZSgnd2l0aCBwbHVnaW5zIHJlZ2lzdGVyZWQgaW4gdGhlIHBhY2thZ2UnLCAoKSA9PiB7XG4gICAgICAgIGxldCBbbWluaW1hcFBhY2thZ2UsIHBsdWdpbkEsIHBsdWdpbkJdID0gW11cbiAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgd2FpdHNGb3JQcm9taXNlKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhdG9tLnBhY2thZ2VzLmFjdGl2YXRlUGFja2FnZSgnbWluaW1hcCcpLnRoZW4oKHBrZykgPT4ge1xuICAgICAgICAgICAgICBtaW5pbWFwUGFja2FnZSA9IHBrZy5tYWluTW9kdWxlXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBydW5zKCgpID0+IHtcbiAgICAgICAgICAgIGNsYXNzIFBsdWdpbiB7XG4gICAgICAgICAgICAgIGFjdGl2ZSA9IGZhbHNlXG4gICAgICAgICAgICAgIGFjdGl2YXRlUGx1Z2luICgpIHsgdGhpcy5hY3RpdmUgPSB0cnVlIH1cbiAgICAgICAgICAgICAgZGVhY3RpdmF0ZVBsdWdpbiAoKSB7IHRoaXMuYWN0aXZlID0gZmFsc2UgfVxuICAgICAgICAgICAgICBpc0FjdGl2ZSAoKSB7IHJldHVybiB0aGlzLmFjdGl2ZSB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHBsdWdpbkEgPSBuZXcgUGx1Z2luKClcbiAgICAgICAgICAgIHBsdWdpbkIgPSBuZXcgUGx1Z2luKClcblxuICAgICAgICAgICAgbWluaW1hcFBhY2thZ2UucmVnaXN0ZXJQbHVnaW4oJ2R1bW15QScsIHBsdWdpbkEpXG4gICAgICAgICAgICBtaW5pbWFwUGFja2FnZS5yZWdpc3RlclBsdWdpbignZHVtbXlCJywgcGx1Z2luQilcblxuICAgICAgICAgICAgd29ya3NwYWNlRWxlbWVudCA9IGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSlcbiAgICAgICAgICAgIGphc21pbmVDb250ZW50LmFwcGVuZENoaWxkKHdvcmtzcGFjZUVsZW1lbnQpXG5cbiAgICAgICAgICAgIG9wZW5RdWlja1NldHRpbmdzID0gbWluaW1hcEVsZW1lbnQuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcub3Blbi1taW5pbWFwLXF1aWNrLXNldHRpbmdzJylcbiAgICAgICAgICAgIG1vdXNlZG93bihvcGVuUXVpY2tTZXR0aW5ncylcblxuICAgICAgICAgICAgcXVpY2tTZXR0aW5nc0VsZW1lbnQgPSB3b3Jrc3BhY2VFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ21pbmltYXAtcXVpY2stc2V0dGluZ3MnKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgaXQoJ2NyZWF0ZXMgb25lIGxpc3QgaXRlbSBmb3IgZWFjaCByZWdpc3RlcmVkIHBsdWdpbicsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QocXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnbGknKS5sZW5ndGgpLnRvRXF1YWwoNilcbiAgICAgICAgfSlcblxuICAgICAgICBpdCgnc2VsZWN0cyB0aGUgZmlyc3QgaXRlbSBvZiB0aGUgbGlzdCcsICgpID0+IHtcbiAgICAgICAgICBleHBlY3QocXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignbGkuc2VsZWN0ZWQ6Zmlyc3QtY2hpbGQnKSkudG9FeGlzdCgpXG4gICAgICAgIH0pXG5cbiAgICAgICAgZGVzY3JpYmUoJ2NvcmU6Y29uZmlybScsICgpID0+IHtcbiAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOmNvbmZpcm0nKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnZGlzYWJsZSB0aGUgcGx1Z2luIG9mIHRoZSBzZWxlY3RlZCBpdGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgZXhwZWN0KHBsdWdpbkEuaXNBY3RpdmUoKSkudG9CZUZhbHN5KClcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgZGVzY3JpYmUoJ3RyaWdnZXJlZCBhIHNlY29uZCB0aW1lJywgKCkgPT4ge1xuICAgICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOmNvbmZpcm0nKVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgaXQoJ2VuYWJsZSB0aGUgcGx1Z2luIG9mIHRoZSBzZWxlY3RlZCBpdGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgICBleHBlY3QocGx1Z2luQS5pc0FjdGl2ZSgpKS50b0JlVHJ1dGh5KClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIGRlc2NyaWJlKCdvbiB0aGUgY29kZSBoaWdobGlnaHQgaXRlbScsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBbaW5pdGlhbF0gPSBbXVxuICAgICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICAgIGluaXRpYWwgPSBtaW5pbWFwRWxlbWVudC5kaXNwbGF5Q29kZUhpZ2hsaWdodHNcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS1kb3duJylcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS1kb3duJylcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6Y29uZmlybScpXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBpdCgndG9nZ2xlcyB0aGUgY29kZSBoaWdobGlnaHRzIG9uIHRoZSBtaW5pbWFwIGVsZW1lbnQnLCAoKSA9PiB7XG4gICAgICAgICAgICAgIGV4cGVjdChtaW5pbWFwRWxlbWVudC5kaXNwbGF5Q29kZUhpZ2hsaWdodHMpLnRvRXF1YWwoIWluaXRpYWwpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBkZXNjcmliZSgnb24gdGhlIGFic29sdXRlIG1vZGUgaXRlbScsICgpID0+IHtcbiAgICAgICAgICAgIGxldCBbaW5pdGlhbF0gPSBbXVxuICAgICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICAgIGluaXRpYWwgPSBhdG9tLmNvbmZpZy5nZXQoJ21pbmltYXAuYWJzb2x1dGVNb2RlJylcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS1kb3duJylcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS1kb3duJylcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS1kb3duJylcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6Y29uZmlybScpXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBpdCgndG9nZ2xlcyB0aGUgY29kZSBoaWdobGlnaHRzIG9uIHRoZSBtaW5pbWFwIGVsZW1lbnQnLCAoKSA9PiB7XG4gICAgICAgICAgICAgIGV4cGVjdChhdG9tLmNvbmZpZy5nZXQoJ21pbmltYXAuYWJzb2x1dGVNb2RlJykpLnRvRXF1YWwoIWluaXRpYWwpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBkZXNjcmliZSgnb24gdGhlIGFkanVzdCBhYnNvbHV0ZSBtb2RlIGhlaWdodCBpdGVtJywgKCkgPT4ge1xuICAgICAgICAgICAgbGV0IFtpbml0aWFsXSA9IFtdXG4gICAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgICAgaW5pdGlhbCA9IGF0b20uY29uZmlnLmdldCgnbWluaW1hcC5hZGp1c3RBYnNvbHV0ZU1vZGVIZWlnaHQnKVxuICAgICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHF1aWNrU2V0dGluZ3NFbGVtZW50LCAnY29yZTptb3ZlLWRvd24nKVxuICAgICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHF1aWNrU2V0dGluZ3NFbGVtZW50LCAnY29yZTptb3ZlLWRvd24nKVxuICAgICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHF1aWNrU2V0dGluZ3NFbGVtZW50LCAnY29yZTptb3ZlLWRvd24nKVxuICAgICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHF1aWNrU2V0dGluZ3NFbGVtZW50LCAnY29yZTptb3ZlLWRvd24nKVxuICAgICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHF1aWNrU2V0dGluZ3NFbGVtZW50LCAnY29yZTpjb25maXJtJylcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIGl0KCd0b2dnbGVzIHRoZSBjb2RlIGhpZ2hsaWdodHMgb24gdGhlIG1pbmltYXAgZWxlbWVudCcsICgpID0+IHtcbiAgICAgICAgICAgICAgZXhwZWN0KGF0b20uY29uZmlnLmdldCgnbWluaW1hcC5hZGp1c3RBYnNvbHV0ZU1vZGVIZWlnaHQnKSkudG9FcXVhbCghaW5pdGlhbClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcblxuICAgICAgICBkZXNjcmliZSgnY29yZTptb3ZlLWRvd24nLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHF1aWNrU2V0dGluZ3NFbGVtZW50LCAnY29yZTptb3ZlLWRvd24nKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBpdCgnc2VsZWN0cyB0aGUgc2Vjb25kIGl0ZW0nLCAoKSA9PiB7XG4gICAgICAgICAgICBleHBlY3QocXVpY2tTZXR0aW5nc0VsZW1lbnQucXVlcnlTZWxlY3RvcignbGkuc2VsZWN0ZWQ6bnRoLWNoaWxkKDIpJykpLnRvRXhpc3QoKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBkZXNjcmliZSgncmVhY2hpbmcgYSBzZXBhcmF0b3InLCAoKSA9PiB7XG4gICAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS1kb3duJylcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIGl0KCdtb3ZlcyBwYXN0IHRoZSBzZXBhcmF0b3InLCAoKSA9PiB7XG4gICAgICAgICAgICAgIGV4cGVjdChxdWlja1NldHRpbmdzRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdsaS5jb2RlLWhpZ2hsaWdodHMuc2VsZWN0ZWQnKSkudG9FeGlzdCgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBkZXNjcmliZSgndGhlbiBjb3JlOm1vdmUtdXAnLCAoKSA9PiB7XG4gICAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS11cCcpXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBpdCgnc2VsZWN0cyBhZ2FpbiB0aGUgZmlyc3QgaXRlbSBvZiB0aGUgbGlzdCcsICgpID0+IHtcbiAgICAgICAgICAgICAgZXhwZWN0KHF1aWNrU2V0dGluZ3NFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpLnNlbGVjdGVkOmZpcnN0LWNoaWxkJykpLnRvRXhpc3QoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuXG4gICAgICAgIGRlc2NyaWJlKCdjb3JlOm1vdmUtdXAnLCAoKSA9PiB7XG4gICAgICAgICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHF1aWNrU2V0dGluZ3NFbGVtZW50LCAnY29yZTptb3ZlLXVwJylcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaXQoJ3NlbGVjdHMgdGhlIGxhc3QgaXRlbScsICgpID0+IHtcbiAgICAgICAgICAgIGV4cGVjdChxdWlja1NldHRpbmdzRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdsaS5zZWxlY3RlZDpsYXN0LWNoaWxkJykpLnRvRXhpc3QoKVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBkZXNjcmliZSgncmVhY2hpbmcgYSBzZXBhcmF0b3InLCAoKSA9PiB7XG4gICAgICAgICAgICBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICAgICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChxdWlja1NldHRpbmdzRWxlbWVudCwgJ2NvcmU6bW92ZS11cCcpXG4gICAgICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2gocXVpY2tTZXR0aW5nc0VsZW1lbnQsICdjb3JlOm1vdmUtdXAnKVxuICAgICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHF1aWNrU2V0dGluZ3NFbGVtZW50LCAnY29yZTptb3ZlLXVwJylcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIGl0KCdtb3ZlcyBwYXN0IHRoZSBzZXBhcmF0b3InLCAoKSA9PiB7XG4gICAgICAgICAgICAgIGV4cGVjdChxdWlja1NldHRpbmdzRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdsaS5zZWxlY3RlZDpudGgtY2hpbGQoMiknKSkudG9FeGlzdCgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBkZXNjcmliZSgndGhlbiBjb3JlOm1vdmUtZG93bicsICgpID0+IHtcbiAgICAgICAgICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKHF1aWNrU2V0dGluZ3NFbGVtZW50LCAnY29yZTptb3ZlLWRvd24nKVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgaXQoJ3NlbGVjdHMgYWdhaW4gdGhlIGZpcnN0IGl0ZW0gb2YgdGhlIGxpc3QnLCAoKSA9PiB7XG4gICAgICAgICAgICAgIGV4cGVjdChxdWlja1NldHRpbmdzRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdsaS5zZWxlY3RlZDpmaXJzdC1jaGlsZCcpKS50b0V4aXN0KClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcbn0pXG4iXX0=
//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/minimap/spec/minimap-element-spec.js
