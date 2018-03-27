Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _underscorePlus = require('underscore-plus');

var _underscorePlus2 = _interopRequireDefault(_underscorePlus);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mixto = require('mixto');

var _mixto2 = _interopRequireDefault(_mixto);

var _atom = require('atom');

var _decoration2 = require('../decoration');

var _decoration3 = _interopRequireDefault(_decoration2);

/**
 * The mixin that provides the decorations API to the minimap editor
 * view.
 *
 * This mixin is injected into the `Minimap` prototype, so every methods defined
 * in this file will be available on any `Minimap` instance.
 */
'use babel';

var DecorationManagement = (function (_Mixin) {
  _inherits(DecorationManagement, _Mixin);

  function DecorationManagement() {
    _classCallCheck(this, DecorationManagement);

    _get(Object.getPrototypeOf(DecorationManagement.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(DecorationManagement, [{
    key: 'initializeDecorations',

    /**
     * Initializes the decorations related properties.
     */
    value: function initializeDecorations() {
      if (this.emitter == null) {
        /**
         * The minimap emitter, lazily created if not created yet.
         * @type {Emitter}
         * @access private
         */
        this.emitter = new _atom.Emitter();
      }

      /**
       * A map with the decoration id as key and the decoration as value.
       * @type {Object}
       * @access private
       */
      this.decorationsById = {};
      /**
       * The decorations stored in an array indexed with their marker id.
       * @type {Object}
       * @access private
       */
      this.decorationsByMarkerId = {};
      /**
       * The subscriptions to the markers `did-change` event indexed using the
       * marker id.
       * @type {Object}
       * @access private
       */
      this.decorationMarkerChangedSubscriptions = {};
      /**
       * The subscriptions to the markers `did-destroy` event indexed using the
       * marker id.
       * @type {Object}
       * @access private
       */
      this.decorationMarkerDestroyedSubscriptions = {};
      /**
       * The subscriptions to the decorations `did-change-properties` event
       * indexed using the decoration id.
       * @type {Object}
       * @access private
       */
      this.decorationUpdatedSubscriptions = {};
      /**
       * The subscriptions to the decorations `did-destroy` event indexed using
       * the decoration id.
       * @type {Object}
       * @access private
       */
      this.decorationDestroyedSubscriptions = {};
    }

    /**
     * Returns all the decorations registered in the current `Minimap`.
     *
     * @return {Array<Decoration>} all the decorations in this `Minimap`
     */
  }, {
    key: 'getDecorations',
    value: function getDecorations() {
      var decorations = this.decorationsById;
      var results = [];

      for (var id in decorations) {
        results.push(decorations[id]);
      }

      return results;
    }

    /**
     * Registers an event listener to the `did-add-decoration` event.
     *
     * @param  {function(event:Object):void} callback a function to call when the
     *                                               event is triggered.
     *                                               the callback will be called
     *                                               with an event object with
     *                                               the following properties:
     * - marker: the marker object that was decorated
     * - decoration: the decoration object that was created
     * @return {Disposable} a disposable to stop listening to the event
     */
  }, {
    key: 'onDidAddDecoration',
    value: function onDidAddDecoration(callback) {
      return this.emitter.on('did-add-decoration', callback);
    }

    /**
     * Registers an event listener to the `did-remove-decoration` event.
     *
     * @param  {function(event:Object):void} callback a function to call when the
     *                                               event is triggered.
     *                                               the callback will be called
     *                                               with an event object with
     *                                               the following properties:
     * - marker: the marker object that was decorated
     * - decoration: the decoration object that was created
     * @return {Disposable} a disposable to stop listening to the event
     */
  }, {
    key: 'onDidRemoveDecoration',
    value: function onDidRemoveDecoration(callback) {
      return this.emitter.on('did-remove-decoration', callback);
    }

    /**
     * Registers an event listener to the `did-change-decoration` event.
     *
     * This event is triggered when the marker targeted by the decoration
     * was changed.
     *
     * @param  {function(event:Object):void} callback a function to call when the
     *                                               event is triggered.
     *                                               the callback will be called
     *                                               with an event object with
     *                                               the following properties:
     * - marker: the marker object that was decorated
     * - decoration: the decoration object that was created
     * @return {Disposable} a disposable to stop listening to the event
     */
  }, {
    key: 'onDidChangeDecoration',
    value: function onDidChangeDecoration(callback) {
      return this.emitter.on('did-change-decoration', callback);
    }

    /**
     * Registers an event listener to the `did-change-decoration-range` event.
     *
     * This event is triggered when the marker range targeted by the decoration
     * was changed.
     *
     * @param  {function(event:Object):void} callback a function to call when the
     *                                               event is triggered.
     *                                               the callback will be called
     *                                               with an event object with
     *                                               the following properties:
     * - marker: the marker object that was decorated
     * - decoration: the decoration object that was created
     * @return {Disposable} a disposable to stop listening to the event
     */
  }, {
    key: 'onDidChangeDecorationRange',
    value: function onDidChangeDecorationRange(callback) {
      return this.emitter.on('did-change-decoration-range', callback);
    }

    /**
     * Registers an event listener to the `did-update-decoration` event.
     *
     * This event is triggered when the decoration itself is modified.
     *
     * @param  {function(decoration:Decoration):void} callback a function to call
     *                                                         when the event is
     *                                                         triggered
     * @return {Disposable} a disposable to stop listening to the event
     */
  }, {
    key: 'onDidUpdateDecoration',
    value: function onDidUpdateDecoration(callback) {
      return this.emitter.on('did-update-decoration', callback);
    }

    /**
     * Returns the decoration with the passed-in id.
     *
     * @param  {number} id the decoration id
     * @return {Decoration} the decoration with the given id
     */
  }, {
    key: 'decorationForId',
    value: function decorationForId(id) {
      return this.decorationsById[id];
    }

    /**
     * Returns all the decorations that intersect the passed-in row range.
     *
     * @param  {number} startScreenRow the first row of the range
     * @param  {number} endScreenRow the last row of the range
     * @return {Array<Decoration>} the decorations that intersect the passed-in
     *                             range
     */
  }, {
    key: 'decorationsForScreenRowRange',
    value: function decorationsForScreenRowRange(startScreenRow, endScreenRow) {
      var decorationsByMarkerId = {};
      var markers = this.findMarkers({
        intersectsScreenRowRange: [startScreenRow, endScreenRow]
      });

      for (var i = 0, len = markers.length; i < len; i++) {
        var marker = markers[i];
        var decorations = this.decorationsByMarkerId[marker.id];

        if (decorations != null) {
          decorationsByMarkerId[marker.id] = decorations;
        }
      }

      return decorationsByMarkerId;
    }

    /**
     * Returns the decorations that intersects the passed-in row range
     * in a structured way.
     *
     * At the first level, the keys are the available decoration types.
     * At the second level, the keys are the row index for which there
     * are decorations available. The value is an array containing the
     * decorations that intersects with the corresponding row.
     *
     * @return {Object} the decorations grouped by type and then rows
     * @property {Object} line all the line decorations by row
     * @property {Array<Decoration>} line[row] all the line decorations
     *                                    at a given row
     * @property {Object} highlight-under all the highlight-under decorations
     *                                    by row
     * @property {Array<Decoration>} highlight-under[row] all the highlight-under
     *                                    decorations at a given row
     * @property {Object} highlight-over all the highlight-over decorations
     *                                    by row
     * @property {Array<Decoration>} highlight-over[row] all the highlight-over
     *                                    decorations at a given row
     * @property {Object} highlight-outine all the highlight-outine decorations
     *                                    by row
     * @property {Array<Decoration>} highlight-outine[row] all the
     *                                    highlight-outine decorations at a given
     *                                    row
     */
  }, {
    key: 'decorationsByTypeThenRows',
    value: function decorationsByTypeThenRows() {
      if (this.decorationsByTypeThenRowsCache != null) {
        return this.decorationsByTypeThenRowsCache;
      }

      var cache = {};
      for (var id in this.decorationsById) {
        var decoration = this.decorationsById[id];
        var range = decoration.marker.getScreenRange();
        var type = decoration.getProperties().type;

        if (cache[type] == null) {
          cache[type] = {};
        }

        for (var row = range.start.row, len = range.end.row; row <= len; row++) {
          if (cache[type][row] == null) {
            cache[type][row] = [];
          }

          cache[type][row].push(decoration);
        }
      }

      /**
       * The grouped decorations cache.
       * @type {Object}
       * @access private
       */
      this.decorationsByTypeThenRowsCache = cache;
      return cache;
    }

    /**
     * Invalidates the decoration by screen rows cache.
     */
  }, {
    key: 'invalidateDecorationForScreenRowsCache',
    value: function invalidateDecorationForScreenRowsCache() {
      this.decorationsByTypeThenRowsCache = null;
    }

    /**
     * Adds a decoration that tracks a `Marker`. When the marker moves,
     * is invalidated, or is destroyed, the decoration will be updated to reflect
     * the marker's state.
     *
     * @param  {Marker} marker the marker you want this decoration to follow
     * @param  {Object} decorationParams the decoration properties
     * @param  {string} decorationParams.type the decoration type in the following
     *                                        list:
     * - __line__: Fills the line background with the decoration color.
     * - __highlight__: Renders a colored rectangle on the minimap. The highlight
     *   is rendered above the line's text.
     * - __highlight-over__: Same as __highlight__.
     * - __highlight-under__: Renders a colored rectangle on the minimap. The
     *   highlight is rendered below the line's text.
     * - __highlight-outline__: Renders a colored outline on the minimap. The
     *   highlight box is rendered above the line's text.
     * - __foreground-custom__: A decoration type for which you have the control
     *   over the render routine. Note that your routine should implement a render
     *   on a per-line basis to avoid any side-effect with the offset bitmap cache
     *   mechanism. These decorations are rendred on the foreground decorations
     *   layer.
     * - __background-custom__: A decoration type for which you have the control
     *   over the render routine. Note that your routine should implement a render
     *   on a per-line basis to avoid any side-effect with the offset bitmap cache
     *   mechanism. These decorations are rendred on the background decorations
     *   layer.
     * @param  {string} [decorationParams.class] the CSS class to use to retrieve
     *                                        the background color of the
     *                                        decoration by building a scop
     *                                        corresponding to
     *                                        `.minimap .editor <your-class>`
     * @param  {string} [decorationParams.scope] the scope to use to retrieve the
     *                                        decoration background. Note that if
     *                                        the `scope` property is set, the
     *                                        `class` won't be used.
     * @param  {string} [decorationParams.color] the CSS color to use to render
     *                                           the decoration. When set, neither
     *                                           `scope` nor `class` are used.
     * @param  {string} [decorationParams.plugin] the name of the plugin that
     *                                            created this decoration. It'll
     *                                            be used to order the decorations
     *                                            on the same layer and that are
     *                                            overlapping. If the parameter is
     *                                            omitted the Minimap will attempt
     *                                            to infer the plugin origin from
     *                                            the path of the caller function.
     * @param  {function} [decorationParams.render] the render routine for custom
     *                                              decorations. The function
     *                                              receives the decoration and
     *                                              the render data for the
     *                                              current render pass.
     * @return {Decoration} the created decoration
     * @emits  {did-add-decoration} when the decoration is created successfully
     * @emits  {did-change} when the decoration is created successfully
     */
  }, {
    key: 'decorateMarker',
    value: function decorateMarker(marker, decorationParams) {
      var _this = this;

      if (this.destroyed || marker == null) {
        return;
      }

      var id = marker.id;

      if (decorationParams.type === 'highlight') {
        decorationParams.type = 'highlight-over';
      }

      var type = decorationParams.type;
      var plugin = decorationParams.plugin;

      if (plugin == null) {
        decorationParams.plugin = this.getOriginatorPackageName();
      }

      if (decorationParams.scope == null && decorationParams['class'] != null) {
        var cls = decorationParams['class'].split(' ').join('.');
        decorationParams.scope = '.minimap .' + cls;
      }

      if (this.decorationMarkerDestroyedSubscriptions[id] == null) {
        this.decorationMarkerDestroyedSubscriptions[id] = marker.onDidDestroy(function () {
          _this.removeAllDecorationsForMarker(marker);
        });
      }

      if (this.decorationMarkerChangedSubscriptions[id] == null) {
        this.decorationMarkerChangedSubscriptions[id] = marker.onDidChange(function (event) {
          var decorations = _this.decorationsByMarkerId[id];

          _this.invalidateDecorationForScreenRowsCache();

          if (decorations != null) {
            for (var i = 0, len = decorations.length; i < len; i++) {
              var _decoration = decorations[i];
              _this.emitter.emit('did-change-decoration', {
                marker: marker,
                decoration: _decoration,
                event: event
              });
            }
          }
          var oldStart = event.oldTailScreenPosition;
          var oldEnd = event.oldHeadScreenPosition;
          var newStart = event.newTailScreenPosition;
          var newEnd = event.newHeadScreenPosition;

          if (oldStart.row > oldEnd.row) {
            var _ref = [oldEnd, oldStart];
            oldStart = _ref[0];
            oldEnd = _ref[1];
          }
          if (newStart.row > newEnd.row) {
            var _ref2 = [newEnd, newStart];
            newStart = _ref2[0];
            newEnd = _ref2[1];
          }

          var rangesDiffs = _this.computeRangesDiffs(oldStart, oldEnd, newStart, newEnd);

          for (var i = 0, len = rangesDiffs.length; i < len; i++) {
            var _rangesDiffs$i = _slicedToArray(rangesDiffs[i], 2);

            var start = _rangesDiffs$i[0];
            var end = _rangesDiffs$i[1];

            _this.emitRangeChanges(type, {
              start: start,
              end: end
            }, 0);
          }
        });
      }

      var decoration = new _decoration3['default'](marker, this, decorationParams);

      if (this.decorationsByMarkerId[id] == null) {
        this.decorationsByMarkerId[id] = [];
      }

      this.decorationsByMarkerId[id].push(decoration);
      this.decorationsById[decoration.id] = decoration;

      if (this.decorationUpdatedSubscriptions[decoration.id] == null) {
        this.decorationUpdatedSubscriptions[decoration.id] = decoration.onDidChangeProperties(function (event) {
          _this.emitDecorationChanges(type, decoration);
        });
      }

      this.decorationDestroyedSubscriptions[decoration.id] = decoration.onDidDestroy(function () {
        _this.removeDecoration(decoration);
      });

      this.emitDecorationChanges(type, decoration);
      this.emitter.emit('did-add-decoration', {
        marker: marker,
        decoration: decoration
      });

      return decoration;
    }
  }, {
    key: 'getOriginatorPackageName',
    value: function getOriginatorPackageName() {
      var line = new Error().stack.split('\n')[3];
      var filePath = line.split('(')[1].replace(')', '');
      var re = new RegExp(atom.packages.getPackageDirPaths().join('|') + _underscorePlus2['default'].escapeRegExp(_path2['default'].sep));
      var plugin = filePath.replace(re, '').split(_path2['default'].sep)[0].replace(/minimap-|-minimap/, '');
      return plugin.indexOf(_path2['default'].sep) < 0 ? plugin : undefined;
    }

    /**
     * Given two ranges, it returns an array of ranges representing the
     * differences between them.
     *
     * @param  {number} oldStart the row index of the first range start
     * @param  {number} oldEnd the row index of the first range end
     * @param  {number} newStart the row index of the second range start
     * @param  {number} newEnd the row index of the second range end
     * @return {Array<Object>} the array of diff ranges
     * @access private
     */
  }, {
    key: 'computeRangesDiffs',
    value: function computeRangesDiffs(oldStart, oldEnd, newStart, newEnd) {
      var diffs = [];

      if (oldStart.isLessThan(newStart)) {
        diffs.push([oldStart, newStart]);
      } else if (newStart.isLessThan(oldStart)) {
        diffs.push([newStart, oldStart]);
      }

      if (oldEnd.isLessThan(newEnd)) {
        diffs.push([oldEnd, newEnd]);
      } else if (newEnd.isLessThan(oldEnd)) {
        diffs.push([newEnd, oldEnd]);
      }

      return diffs;
    }

    /**
     * Emits a change in the `Minimap` corresponding to the
     * passed-in decoration.
     *
     * @param  {string} type the type of decoration that changed
     * @param  {Decoration} decoration the decoration for which emitting an event
     * @access private
     */
  }, {
    key: 'emitDecorationChanges',
    value: function emitDecorationChanges(type, decoration) {
      if (this.textEditor.isDestroyed()) {
        return;
      }

      this.invalidateDecorationForScreenRowsCache();

      var range = decoration.marker.getScreenRange();
      if (range == null) {
        return;
      }

      this.emitRangeChanges(type, range, 0);
    }

    /**
     * Emits a change for the specified range.
     *
     * @param  {string} type the type of decoration that changed
     * @param  {Object} range the range where changes occured
     * @param  {number} [screenDelta] an optional screen delta for the
     *                                change object
     * @access private
     */
  }, {
    key: 'emitRangeChanges',
    value: function emitRangeChanges(type, range, screenDelta) {
      var startScreenRow = range.start.row;
      var endScreenRow = range.end.row;
      var lastRenderedScreenRow = this.getLastVisibleScreenRow();
      var firstRenderedScreenRow = this.getFirstVisibleScreenRow();

      if (screenDelta == null) {
        screenDelta = lastRenderedScreenRow - firstRenderedScreenRow - (endScreenRow - startScreenRow);
      }

      var changeEvent = {
        start: startScreenRow,
        end: endScreenRow,
        screenDelta: screenDelta,
        type: type
      };

      this.emitter.emit('did-change-decoration-range', changeEvent);
    }

    /**
     * Removes a `Decoration` from this minimap.
     *
     * @param  {Decoration} decoration the decoration to remove
     * @emits  {did-change} when the decoration is removed
     * @emits  {did-remove-decoration} when the decoration is removed
     */
  }, {
    key: 'removeDecoration',
    value: function removeDecoration(decoration) {
      if (decoration == null) {
        return;
      }

      var marker = decoration.marker;
      var subscription = undefined;

      delete this.decorationsById[decoration.id];

      subscription = this.decorationUpdatedSubscriptions[decoration.id];
      if (subscription != null) {
        subscription.dispose();
      }

      subscription = this.decorationDestroyedSubscriptions[decoration.id];
      if (subscription != null) {
        subscription.dispose();
      }

      delete this.decorationUpdatedSubscriptions[decoration.id];
      delete this.decorationDestroyedSubscriptions[decoration.id];

      var decorations = this.decorationsByMarkerId[marker.id];
      if (!decorations) {
        return;
      }

      this.emitDecorationChanges(decoration.getProperties().type, decoration);

      var index = decorations.indexOf(decoration);
      if (index > -1) {
        decorations.splice(index, 1);

        this.emitter.emit('did-remove-decoration', {
          marker: marker,
          decoration: decoration
        });

        if (decorations.length === 0) {
          this.removedAllMarkerDecorations(marker);
        }
      }
    }

    /**
     * Removes all the decorations registered for the passed-in marker.
     *
     * @param  {Marker} marker the marker for which removing its decorations
     * @emits  {did-change} when a decoration have been removed
     * @emits  {did-remove-decoration} when a decoration have been removed
     */
  }, {
    key: 'removeAllDecorationsForMarker',
    value: function removeAllDecorationsForMarker(marker) {
      if (marker == null) {
        return;
      }

      var decorations = this.decorationsByMarkerId[marker.id];
      if (!decorations) {
        return;
      }

      for (var i = 0, len = decorations.length; i < len; i++) {
        var decoration = decorations[i];

        this.emitDecorationChanges(decoration.getProperties().type, decoration);
        this.emitter.emit('did-remove-decoration', {
          marker: marker,
          decoration: decoration
        });
      }

      this.removedAllMarkerDecorations(marker);
    }

    /**
     * Performs the removal of a decoration for a given marker.
     *
     * @param  {Marker} marker the marker for which removing decorations
     * @access private
     */
  }, {
    key: 'removedAllMarkerDecorations',
    value: function removedAllMarkerDecorations(marker) {
      if (marker == null) {
        return;
      }

      this.decorationMarkerChangedSubscriptions[marker.id].dispose();
      this.decorationMarkerDestroyedSubscriptions[marker.id].dispose();

      delete this.decorationsByMarkerId[marker.id];
      delete this.decorationMarkerChangedSubscriptions[marker.id];
      delete this.decorationMarkerDestroyedSubscriptions[marker.id];
    }

    /**
     * Removes all the decorations that was created in the current `Minimap`.
     */
  }, {
    key: 'removeAllDecorations',
    value: function removeAllDecorations() {
      for (var id in this.decorationMarkerChangedSubscriptions) {
        this.decorationMarkerChangedSubscriptions[id].dispose();
      }

      for (var id in this.decorationMarkerDestroyedSubscriptions) {
        this.decorationMarkerDestroyedSubscriptions[id].dispose();
      }

      for (var id in this.decorationUpdatedSubscriptions) {
        this.decorationUpdatedSubscriptions[id].dispose();
      }

      for (var id in this.decorationDestroyedSubscriptions) {
        this.decorationDestroyedSubscriptions[id].dispose();
      }

      for (var id in this.decorationsById) {
        this.decorationsById[id].destroy();
      }

      this.decorationsById = {};
      this.decorationsByMarkerId = {};
      this.decorationMarkerChangedSubscriptions = {};
      this.decorationMarkerDestroyedSubscriptions = {};
      this.decorationUpdatedSubscriptions = {};
      this.decorationDestroyedSubscriptions = {};
    }
  }]);

  return DecorationManagement;
})(_mixto2['default']);

exports['default'] = DecorationManagement;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL21pbmltYXAvbGliL21peGlucy9kZWNvcmF0aW9uLW1hbmFnZW1lbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs4QkFFYyxpQkFBaUI7Ozs7b0JBQ2QsTUFBTTs7OztxQkFDTCxPQUFPOzs7O29CQUNILE1BQU07OzJCQUNMLGVBQWU7Ozs7Ozs7Ozs7O0FBTnRDLFdBQVcsQ0FBQTs7SUFlVSxvQkFBb0I7WUFBcEIsb0JBQW9COztXQUFwQixvQkFBb0I7MEJBQXBCLG9CQUFvQjs7K0JBQXBCLG9CQUFvQjs7O2VBQXBCLG9CQUFvQjs7Ozs7O1dBS2pCLGlDQUFHO0FBQ3ZCLFVBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLEVBQUU7Ozs7OztBQU14QixZQUFJLENBQUMsT0FBTyxHQUFHLG1CQUFhLENBQUE7T0FDN0I7Ozs7Ozs7QUFPRCxVQUFJLENBQUMsZUFBZSxHQUFHLEVBQUUsQ0FBQTs7Ozs7O0FBTXpCLFVBQUksQ0FBQyxxQkFBcUIsR0FBRyxFQUFFLENBQUE7Ozs7Ozs7QUFPL0IsVUFBSSxDQUFDLG9DQUFvQyxHQUFHLEVBQUUsQ0FBQTs7Ozs7OztBQU85QyxVQUFJLENBQUMsc0NBQXNDLEdBQUcsRUFBRSxDQUFBOzs7Ozs7O0FBT2hELFVBQUksQ0FBQyw4QkFBOEIsR0FBRyxFQUFFLENBQUE7Ozs7Ozs7QUFPeEMsVUFBSSxDQUFDLGdDQUFnQyxHQUFHLEVBQUUsQ0FBQTtLQUMzQzs7Ozs7Ozs7O1dBT2MsMEJBQUc7QUFDaEIsVUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQTtBQUN0QyxVQUFJLE9BQU8sR0FBRyxFQUFFLENBQUE7O0FBRWhCLFdBQUssSUFBSSxFQUFFLElBQUksV0FBVyxFQUFFO0FBQUUsZUFBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtPQUFFOztBQUU3RCxhQUFPLE9B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LG9DQUFvQyxHQUFHLEVBQUUsQ0FBQTtBQUM5QyxVQUFJLENBQUMsc0NBQXNDLEdBQUcsRUFBRSxDQUFBO0FBQ2hELFVBQUksQ0FBQyw4QkFBOEIsR0FBRyxFQUFFLENBQUE7QUFDeEMsVUFBSSxDQUFDLGdDQUFnQyxHQUFHLEVBQUUsQ0FBQTtLQUMzQzs7O1NBeG1Ca0Isb0JBQW9COzs7cUJBQXBCLG9CQUFvQiIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9taW5pbWFwL2xpYi9taXhpbnMvZGVjb3JhdGlvbi1tYW5hZ2VtZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZS1wbHVzJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBNaXhpbiBmcm9tICdtaXh0bydcbmltcG9ydCB7RW1pdHRlcn0gZnJvbSAnYXRvbSdcbmltcG9ydCBEZWNvcmF0aW9uIGZyb20gJy4uL2RlY29yYXRpb24nXG5cbi8qKlxuICogVGhlIG1peGluIHRoYXQgcHJvdmlkZXMgdGhlIGRlY29yYXRpb25zIEFQSSB0byB0aGUgbWluaW1hcCBlZGl0b3JcbiAqIHZpZXcuXG4gKlxuICogVGhpcyBtaXhpbiBpcyBpbmplY3RlZCBpbnRvIHRoZSBgTWluaW1hcGAgcHJvdG90eXBlLCBzbyBldmVyeSBtZXRob2RzIGRlZmluZWRcbiAqIGluIHRoaXMgZmlsZSB3aWxsIGJlIGF2YWlsYWJsZSBvbiBhbnkgYE1pbmltYXBgIGluc3RhbmNlLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEZWNvcmF0aW9uTWFuYWdlbWVudCBleHRlbmRzIE1peGluIHtcblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIGRlY29yYXRpb25zIHJlbGF0ZWQgcHJvcGVydGllcy5cbiAgICovXG4gIGluaXRpYWxpemVEZWNvcmF0aW9ucyAoKSB7XG4gICAgaWYgKHRoaXMuZW1pdHRlciA9PSBudWxsKSB7XG4gICAgICAvKipcbiAgICAgICAqIFRoZSBtaW5pbWFwIGVtaXR0ZXIsIGxhemlseSBjcmVhdGVkIGlmIG5vdCBjcmVhdGVkIHlldC5cbiAgICAgICAqIEB0eXBlIHtFbWl0dGVyfVxuICAgICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICAgKi9cbiAgICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKClcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBIG1hcCB3aXRoIHRoZSBkZWNvcmF0aW9uIGlkIGFzIGtleSBhbmQgdGhlIGRlY29yYXRpb24gYXMgdmFsdWUuXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLmRlY29yYXRpb25zQnlJZCA9IHt9XG4gICAgLyoqXG4gICAgICogVGhlIGRlY29yYXRpb25zIHN0b3JlZCBpbiBhbiBhcnJheSBpbmRleGVkIHdpdGggdGhlaXIgbWFya2VyIGlkLlxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5kZWNvcmF0aW9uc0J5TWFya2VySWQgPSB7fVxuICAgIC8qKlxuICAgICAqIFRoZSBzdWJzY3JpcHRpb25zIHRvIHRoZSBtYXJrZXJzIGBkaWQtY2hhbmdlYCBldmVudCBpbmRleGVkIHVzaW5nIHRoZVxuICAgICAqIG1hcmtlciBpZC5cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuZGVjb3JhdGlvbk1hcmtlckNoYW5nZWRTdWJzY3JpcHRpb25zID0ge31cbiAgICAvKipcbiAgICAgKiBUaGUgc3Vic2NyaXB0aW9ucyB0byB0aGUgbWFya2VycyBgZGlkLWRlc3Ryb3lgIGV2ZW50IGluZGV4ZWQgdXNpbmcgdGhlXG4gICAgICogbWFya2VyIGlkLlxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5kZWNvcmF0aW9uTWFya2VyRGVzdHJveWVkU3Vic2NyaXB0aW9ucyA9IHt9XG4gICAgLyoqXG4gICAgICogVGhlIHN1YnNjcmlwdGlvbnMgdG8gdGhlIGRlY29yYXRpb25zIGBkaWQtY2hhbmdlLXByb3BlcnRpZXNgIGV2ZW50XG4gICAgICogaW5kZXhlZCB1c2luZyB0aGUgZGVjb3JhdGlvbiBpZC5cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuZGVjb3JhdGlvblVwZGF0ZWRTdWJzY3JpcHRpb25zID0ge31cbiAgICAvKipcbiAgICAgKiBUaGUgc3Vic2NyaXB0aW9ucyB0byB0aGUgZGVjb3JhdGlvbnMgYGRpZC1kZXN0cm95YCBldmVudCBpbmRleGVkIHVzaW5nXG4gICAgICogdGhlIGRlY29yYXRpb24gaWQuXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLmRlY29yYXRpb25EZXN0cm95ZWRTdWJzY3JpcHRpb25zID0ge31cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFsbCB0aGUgZGVjb3JhdGlvbnMgcmVnaXN0ZXJlZCBpbiB0aGUgY3VycmVudCBgTWluaW1hcGAuXG4gICAqXG4gICAqIEByZXR1cm4ge0FycmF5PERlY29yYXRpb24+fSBhbGwgdGhlIGRlY29yYXRpb25zIGluIHRoaXMgYE1pbmltYXBgXG4gICAqL1xuICBnZXREZWNvcmF0aW9ucyAoKSB7XG4gICAgbGV0IGRlY29yYXRpb25zID0gdGhpcy5kZWNvcmF0aW9uc0J5SWRcbiAgICBsZXQgcmVzdWx0cyA9IFtdXG5cbiAgICBmb3IgKGxldCBpZCBpbiBkZWNvcmF0aW9ucykgeyByZXN1bHRzLnB1c2goZGVjb3JhdGlvbnNbaWRdKSB9XG5cbiAgICByZXR1cm4gcmVzdWx0c1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhbiBldmVudCBsaXN0ZW5lciB0byB0aGUgYGRpZC1hZGQtZGVjb3JhdGlvbmAgZXZlbnQuXG4gICAqXG4gICAqIEBwYXJhbSAge2Z1bmN0aW9uKGV2ZW50Ok9iamVjdCk6dm9pZH0gY2FsbGJhY2sgYSBmdW5jdGlvbiB0byBjYWxsIHdoZW4gdGhlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudCBpcyB0cmlnZ2VyZWQuXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWRcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpdGggYW4gZXZlbnQgb2JqZWN0IHdpdGhcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAgICogLSBtYXJrZXI6IHRoZSBtYXJrZXIgb2JqZWN0IHRoYXQgd2FzIGRlY29yYXRlZFxuICAgKiAtIGRlY29yYXRpb246IHRoZSBkZWNvcmF0aW9uIG9iamVjdCB0aGF0IHdhcyBjcmVhdGVkXG4gICAqIEByZXR1cm4ge0Rpc3Bvc2FibGV9IGEgZGlzcG9zYWJsZSB0byBzdG9wIGxpc3RlbmluZyB0byB0aGUgZXZlbnRcbiAgICovXG4gIG9uRGlkQWRkRGVjb3JhdGlvbiAoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtYWRkLWRlY29yYXRpb24nLCBjYWxsYmFjaylcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYW4gZXZlbnQgbGlzdGVuZXIgdG8gdGhlIGBkaWQtcmVtb3ZlLWRlY29yYXRpb25gIGV2ZW50LlxuICAgKlxuICAgKiBAcGFyYW0gIHtmdW5jdGlvbihldmVudDpPYmplY3QpOnZvaWR9IGNhbGxiYWNrIGEgZnVuY3Rpb24gdG8gY2FsbCB3aGVuIHRoZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQgaXMgdHJpZ2dlcmVkLlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aXRoIGFuIGV2ZW50IG9iamVjdCB3aXRoXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gICAqIC0gbWFya2VyOiB0aGUgbWFya2VyIG9iamVjdCB0aGF0IHdhcyBkZWNvcmF0ZWRcbiAgICogLSBkZWNvcmF0aW9uOiB0aGUgZGVjb3JhdGlvbiBvYmplY3QgdGhhdCB3YXMgY3JlYXRlZFxuICAgKiBAcmV0dXJuIHtEaXNwb3NhYmxlfSBhIGRpc3Bvc2FibGUgdG8gc3RvcCBsaXN0ZW5pbmcgdG8gdGhlIGV2ZW50XG4gICAqL1xuICBvbkRpZFJlbW92ZURlY29yYXRpb24gKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLXJlbW92ZS1kZWNvcmF0aW9uJywgY2FsbGJhY2spXG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGFuIGV2ZW50IGxpc3RlbmVyIHRvIHRoZSBgZGlkLWNoYW5nZS1kZWNvcmF0aW9uYCBldmVudC5cbiAgICpcbiAgICogVGhpcyBldmVudCBpcyB0cmlnZ2VyZWQgd2hlbiB0aGUgbWFya2VyIHRhcmdldGVkIGJ5IHRoZSBkZWNvcmF0aW9uXG4gICAqIHdhcyBjaGFuZ2VkLlxuICAgKlxuICAgKiBAcGFyYW0gIHtmdW5jdGlvbihldmVudDpPYmplY3QpOnZvaWR9IGNhbGxiYWNrIGEgZnVuY3Rpb24gdG8gY2FsbCB3aGVuIHRoZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQgaXMgdHJpZ2dlcmVkLlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aXRoIGFuIGV2ZW50IG9iamVjdCB3aXRoXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gICAqIC0gbWFya2VyOiB0aGUgbWFya2VyIG9iamVjdCB0aGF0IHdhcyBkZWNvcmF0ZWRcbiAgICogLSBkZWNvcmF0aW9uOiB0aGUgZGVjb3JhdGlvbiBvYmplY3QgdGhhdCB3YXMgY3JlYXRlZFxuICAgKiBAcmV0dXJuIHtEaXNwb3NhYmxlfSBhIGRpc3Bvc2FibGUgdG8gc3RvcCBsaXN0ZW5pbmcgdG8gdGhlIGV2ZW50XG4gICAqL1xuICBvbkRpZENoYW5nZURlY29yYXRpb24gKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLWNoYW5nZS1kZWNvcmF0aW9uJywgY2FsbGJhY2spXG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGFuIGV2ZW50IGxpc3RlbmVyIHRvIHRoZSBgZGlkLWNoYW5nZS1kZWNvcmF0aW9uLXJhbmdlYCBldmVudC5cbiAgICpcbiAgICogVGhpcyBldmVudCBpcyB0cmlnZ2VyZWQgd2hlbiB0aGUgbWFya2VyIHJhbmdlIHRhcmdldGVkIGJ5IHRoZSBkZWNvcmF0aW9uXG4gICAqIHdhcyBjaGFuZ2VkLlxuICAgKlxuICAgKiBAcGFyYW0gIHtmdW5jdGlvbihldmVudDpPYmplY3QpOnZvaWR9IGNhbGxiYWNrIGEgZnVuY3Rpb24gdG8gY2FsbCB3aGVuIHRoZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQgaXMgdHJpZ2dlcmVkLlxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aXRoIGFuIGV2ZW50IG9iamVjdCB3aXRoXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gICAqIC0gbWFya2VyOiB0aGUgbWFya2VyIG9iamVjdCB0aGF0IHdhcyBkZWNvcmF0ZWRcbiAgICogLSBkZWNvcmF0aW9uOiB0aGUgZGVjb3JhdGlvbiBvYmplY3QgdGhhdCB3YXMgY3JlYXRlZFxuICAgKiBAcmV0dXJuIHtEaXNwb3NhYmxlfSBhIGRpc3Bvc2FibGUgdG8gc3RvcCBsaXN0ZW5pbmcgdG8gdGhlIGV2ZW50XG4gICAqL1xuICBvbkRpZENoYW5nZURlY29yYXRpb25SYW5nZSAoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtY2hhbmdlLWRlY29yYXRpb24tcmFuZ2UnLCBjYWxsYmFjaylcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYW4gZXZlbnQgbGlzdGVuZXIgdG8gdGhlIGBkaWQtdXBkYXRlLWRlY29yYXRpb25gIGV2ZW50LlxuICAgKlxuICAgKiBUaGlzIGV2ZW50IGlzIHRyaWdnZXJlZCB3aGVuIHRoZSBkZWNvcmF0aW9uIGl0c2VsZiBpcyBtb2RpZmllZC5cbiAgICpcbiAgICogQHBhcmFtICB7ZnVuY3Rpb24oZGVjb3JhdGlvbjpEZWNvcmF0aW9uKTp2b2lkfSBjYWxsYmFjayBhIGZ1bmN0aW9uIHRvIGNhbGxcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGVuIHRoZSBldmVudCBpc1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyaWdnZXJlZFxuICAgKiBAcmV0dXJuIHtEaXNwb3NhYmxlfSBhIGRpc3Bvc2FibGUgdG8gc3RvcCBsaXN0ZW5pbmcgdG8gdGhlIGV2ZW50XG4gICAqL1xuICBvbkRpZFVwZGF0ZURlY29yYXRpb24gKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLXVwZGF0ZS1kZWNvcmF0aW9uJywgY2FsbGJhY2spXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgZGVjb3JhdGlvbiB3aXRoIHRoZSBwYXNzZWQtaW4gaWQuXG4gICAqXG4gICAqIEBwYXJhbSAge251bWJlcn0gaWQgdGhlIGRlY29yYXRpb24gaWRcbiAgICogQHJldHVybiB7RGVjb3JhdGlvbn0gdGhlIGRlY29yYXRpb24gd2l0aCB0aGUgZ2l2ZW4gaWRcbiAgICovXG4gIGRlY29yYXRpb25Gb3JJZCAoaWQpIHtcbiAgICByZXR1cm4gdGhpcy5kZWNvcmF0aW9uc0J5SWRbaWRdXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbGwgdGhlIGRlY29yYXRpb25zIHRoYXQgaW50ZXJzZWN0IHRoZSBwYXNzZWQtaW4gcm93IHJhbmdlLlxuICAgKlxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IHN0YXJ0U2NyZWVuUm93IHRoZSBmaXJzdCByb3cgb2YgdGhlIHJhbmdlXG4gICAqIEBwYXJhbSAge251bWJlcn0gZW5kU2NyZWVuUm93IHRoZSBsYXN0IHJvdyBvZiB0aGUgcmFuZ2VcbiAgICogQHJldHVybiB7QXJyYXk8RGVjb3JhdGlvbj59IHRoZSBkZWNvcmF0aW9ucyB0aGF0IGludGVyc2VjdCB0aGUgcGFzc2VkLWluXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICByYW5nZVxuICAgKi9cbiAgZGVjb3JhdGlvbnNGb3JTY3JlZW5Sb3dSYW5nZSAoc3RhcnRTY3JlZW5Sb3csIGVuZFNjcmVlblJvdykge1xuICAgIGxldCBkZWNvcmF0aW9uc0J5TWFya2VySWQgPSB7fVxuICAgIGxldCBtYXJrZXJzID0gdGhpcy5maW5kTWFya2Vycyh7XG4gICAgICBpbnRlcnNlY3RzU2NyZWVuUm93UmFuZ2U6IFtzdGFydFNjcmVlblJvdywgZW5kU2NyZWVuUm93XVxuICAgIH0pXG5cbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gbWFya2Vycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgbGV0IG1hcmtlciA9IG1hcmtlcnNbaV1cbiAgICAgIGxldCBkZWNvcmF0aW9ucyA9IHRoaXMuZGVjb3JhdGlvbnNCeU1hcmtlcklkW21hcmtlci5pZF1cblxuICAgICAgaWYgKGRlY29yYXRpb25zICE9IG51bGwpIHtcbiAgICAgICAgZGVjb3JhdGlvbnNCeU1hcmtlcklkW21hcmtlci5pZF0gPSBkZWNvcmF0aW9uc1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkZWNvcmF0aW9uc0J5TWFya2VySWRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBkZWNvcmF0aW9ucyB0aGF0IGludGVyc2VjdHMgdGhlIHBhc3NlZC1pbiByb3cgcmFuZ2VcbiAgICogaW4gYSBzdHJ1Y3R1cmVkIHdheS5cbiAgICpcbiAgICogQXQgdGhlIGZpcnN0IGxldmVsLCB0aGUga2V5cyBhcmUgdGhlIGF2YWlsYWJsZSBkZWNvcmF0aW9uIHR5cGVzLlxuICAgKiBBdCB0aGUgc2Vjb25kIGxldmVsLCB0aGUga2V5cyBhcmUgdGhlIHJvdyBpbmRleCBmb3Igd2hpY2ggdGhlcmVcbiAgICogYXJlIGRlY29yYXRpb25zIGF2YWlsYWJsZS4gVGhlIHZhbHVlIGlzIGFuIGFycmF5IGNvbnRhaW5pbmcgdGhlXG4gICAqIGRlY29yYXRpb25zIHRoYXQgaW50ZXJzZWN0cyB3aXRoIHRoZSBjb3JyZXNwb25kaW5nIHJvdy5cbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fSB0aGUgZGVjb3JhdGlvbnMgZ3JvdXBlZCBieSB0eXBlIGFuZCB0aGVuIHJvd3NcbiAgICogQHByb3BlcnR5IHtPYmplY3R9IGxpbmUgYWxsIHRoZSBsaW5lIGRlY29yYXRpb25zIGJ5IHJvd1xuICAgKiBAcHJvcGVydHkge0FycmF5PERlY29yYXRpb24+fSBsaW5lW3Jvd10gYWxsIHRoZSBsaW5lIGRlY29yYXRpb25zXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXQgYSBnaXZlbiByb3dcbiAgICogQHByb3BlcnR5IHtPYmplY3R9IGhpZ2hsaWdodC11bmRlciBhbGwgdGhlIGhpZ2hsaWdodC11bmRlciBkZWNvcmF0aW9uc1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ5IHJvd1xuICAgKiBAcHJvcGVydHkge0FycmF5PERlY29yYXRpb24+fSBoaWdobGlnaHQtdW5kZXJbcm93XSBhbGwgdGhlIGhpZ2hsaWdodC11bmRlclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlY29yYXRpb25zIGF0IGEgZ2l2ZW4gcm93XG4gICAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBoaWdobGlnaHQtb3ZlciBhbGwgdGhlIGhpZ2hsaWdodC1vdmVyIGRlY29yYXRpb25zXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnkgcm93XG4gICAqIEBwcm9wZXJ0eSB7QXJyYXk8RGVjb3JhdGlvbj59IGhpZ2hsaWdodC1vdmVyW3Jvd10gYWxsIHRoZSBoaWdobGlnaHQtb3ZlclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlY29yYXRpb25zIGF0IGEgZ2l2ZW4gcm93XG4gICAqIEBwcm9wZXJ0eSB7T2JqZWN0fSBoaWdobGlnaHQtb3V0aW5lIGFsbCB0aGUgaGlnaGxpZ2h0LW91dGluZSBkZWNvcmF0aW9uc1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ5IHJvd1xuICAgKiBAcHJvcGVydHkge0FycmF5PERlY29yYXRpb24+fSBoaWdobGlnaHQtb3V0aW5lW3Jvd10gYWxsIHRoZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodC1vdXRpbmUgZGVjb3JhdGlvbnMgYXQgYSBnaXZlblxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvd1xuICAgKi9cbiAgZGVjb3JhdGlvbnNCeVR5cGVUaGVuUm93cyAoKSB7XG4gICAgaWYgKHRoaXMuZGVjb3JhdGlvbnNCeVR5cGVUaGVuUm93c0NhY2hlICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLmRlY29yYXRpb25zQnlUeXBlVGhlblJvd3NDYWNoZVxuICAgIH1cblxuICAgIGxldCBjYWNoZSA9IHt9XG4gICAgZm9yIChsZXQgaWQgaW4gdGhpcy5kZWNvcmF0aW9uc0J5SWQpIHtcbiAgICAgIGxldCBkZWNvcmF0aW9uID0gdGhpcy5kZWNvcmF0aW9uc0J5SWRbaWRdXG4gICAgICBsZXQgcmFuZ2UgPSBkZWNvcmF0aW9uLm1hcmtlci5nZXRTY3JlZW5SYW5nZSgpXG4gICAgICBsZXQgdHlwZSA9IGRlY29yYXRpb24uZ2V0UHJvcGVydGllcygpLnR5cGVcblxuICAgICAgaWYgKGNhY2hlW3R5cGVdID09IG51bGwpIHsgY2FjaGVbdHlwZV0gPSB7fSB9XG5cbiAgICAgIGZvciAobGV0IHJvdyA9IHJhbmdlLnN0YXJ0LnJvdywgbGVuID0gcmFuZ2UuZW5kLnJvdzsgcm93IDw9IGxlbjsgcm93KyspIHtcbiAgICAgICAgaWYgKGNhY2hlW3R5cGVdW3Jvd10gPT0gbnVsbCkgeyBjYWNoZVt0eXBlXVtyb3ddID0gW10gfVxuXG4gICAgICAgIGNhY2hlW3R5cGVdW3Jvd10ucHVzaChkZWNvcmF0aW9uKVxuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBncm91cGVkIGRlY29yYXRpb25zIGNhY2hlLlxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5kZWNvcmF0aW9uc0J5VHlwZVRoZW5Sb3dzQ2FjaGUgPSBjYWNoZVxuICAgIHJldHVybiBjYWNoZVxuICB9XG5cbiAgLyoqXG4gICAqIEludmFsaWRhdGVzIHRoZSBkZWNvcmF0aW9uIGJ5IHNjcmVlbiByb3dzIGNhY2hlLlxuICAgKi9cbiAgaW52YWxpZGF0ZURlY29yYXRpb25Gb3JTY3JlZW5Sb3dzQ2FjaGUgKCkge1xuICAgIHRoaXMuZGVjb3JhdGlvbnNCeVR5cGVUaGVuUm93c0NhY2hlID0gbnVsbFxuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBkZWNvcmF0aW9uIHRoYXQgdHJhY2tzIGEgYE1hcmtlcmAuIFdoZW4gdGhlIG1hcmtlciBtb3ZlcyxcbiAgICogaXMgaW52YWxpZGF0ZWQsIG9yIGlzIGRlc3Ryb3llZCwgdGhlIGRlY29yYXRpb24gd2lsbCBiZSB1cGRhdGVkIHRvIHJlZmxlY3RcbiAgICogdGhlIG1hcmtlcidzIHN0YXRlLlxuICAgKlxuICAgKiBAcGFyYW0gIHtNYXJrZXJ9IG1hcmtlciB0aGUgbWFya2VyIHlvdSB3YW50IHRoaXMgZGVjb3JhdGlvbiB0byBmb2xsb3dcbiAgICogQHBhcmFtICB7T2JqZWN0fSBkZWNvcmF0aW9uUGFyYW1zIHRoZSBkZWNvcmF0aW9uIHByb3BlcnRpZXNcbiAgICogQHBhcmFtICB7c3RyaW5nfSBkZWNvcmF0aW9uUGFyYW1zLnR5cGUgdGhlIGRlY29yYXRpb24gdHlwZSBpbiB0aGUgZm9sbG93aW5nXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpc3Q6XG4gICAqIC0gX19saW5lX186IEZpbGxzIHRoZSBsaW5lIGJhY2tncm91bmQgd2l0aCB0aGUgZGVjb3JhdGlvbiBjb2xvci5cbiAgICogLSBfX2hpZ2hsaWdodF9fOiBSZW5kZXJzIGEgY29sb3JlZCByZWN0YW5nbGUgb24gdGhlIG1pbmltYXAuIFRoZSBoaWdobGlnaHRcbiAgICogICBpcyByZW5kZXJlZCBhYm92ZSB0aGUgbGluZSdzIHRleHQuXG4gICAqIC0gX19oaWdobGlnaHQtb3Zlcl9fOiBTYW1lIGFzIF9faGlnaGxpZ2h0X18uXG4gICAqIC0gX19oaWdobGlnaHQtdW5kZXJfXzogUmVuZGVycyBhIGNvbG9yZWQgcmVjdGFuZ2xlIG9uIHRoZSBtaW5pbWFwLiBUaGVcbiAgICogICBoaWdobGlnaHQgaXMgcmVuZGVyZWQgYmVsb3cgdGhlIGxpbmUncyB0ZXh0LlxuICAgKiAtIF9faGlnaGxpZ2h0LW91dGxpbmVfXzogUmVuZGVycyBhIGNvbG9yZWQgb3V0bGluZSBvbiB0aGUgbWluaW1hcC4gVGhlXG4gICAqICAgaGlnaGxpZ2h0IGJveCBpcyByZW5kZXJlZCBhYm92ZSB0aGUgbGluZSdzIHRleHQuXG4gICAqIC0gX19mb3JlZ3JvdW5kLWN1c3RvbV9fOiBBIGRlY29yYXRpb24gdHlwZSBmb3Igd2hpY2ggeW91IGhhdmUgdGhlIGNvbnRyb2xcbiAgICogICBvdmVyIHRoZSByZW5kZXIgcm91dGluZS4gTm90ZSB0aGF0IHlvdXIgcm91dGluZSBzaG91bGQgaW1wbGVtZW50IGEgcmVuZGVyXG4gICAqICAgb24gYSBwZXItbGluZSBiYXNpcyB0byBhdm9pZCBhbnkgc2lkZS1lZmZlY3Qgd2l0aCB0aGUgb2Zmc2V0IGJpdG1hcCBjYWNoZVxuICAgKiAgIG1lY2hhbmlzbS4gVGhlc2UgZGVjb3JhdGlvbnMgYXJlIHJlbmRyZWQgb24gdGhlIGZvcmVncm91bmQgZGVjb3JhdGlvbnNcbiAgICogICBsYXllci5cbiAgICogLSBfX2JhY2tncm91bmQtY3VzdG9tX186IEEgZGVjb3JhdGlvbiB0eXBlIGZvciB3aGljaCB5b3UgaGF2ZSB0aGUgY29udHJvbFxuICAgKiAgIG92ZXIgdGhlIHJlbmRlciByb3V0aW5lLiBOb3RlIHRoYXQgeW91ciByb3V0aW5lIHNob3VsZCBpbXBsZW1lbnQgYSByZW5kZXJcbiAgICogICBvbiBhIHBlci1saW5lIGJhc2lzIHRvIGF2b2lkIGFueSBzaWRlLWVmZmVjdCB3aXRoIHRoZSBvZmZzZXQgYml0bWFwIGNhY2hlXG4gICAqICAgbWVjaGFuaXNtLiBUaGVzZSBkZWNvcmF0aW9ucyBhcmUgcmVuZHJlZCBvbiB0aGUgYmFja2dyb3VuZCBkZWNvcmF0aW9uc1xuICAgKiAgIGxheWVyLlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IFtkZWNvcmF0aW9uUGFyYW1zLmNsYXNzXSB0aGUgQ1NTIGNsYXNzIHRvIHVzZSB0byByZXRyaWV2ZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgYmFja2dyb3VuZCBjb2xvciBvZiB0aGVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVjb3JhdGlvbiBieSBidWlsZGluZyBhIHNjb3BcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29ycmVzcG9uZGluZyB0b1xuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgLm1pbmltYXAgLmVkaXRvciA8eW91ci1jbGFzcz5gXG4gICAqIEBwYXJhbSAge3N0cmluZ30gW2RlY29yYXRpb25QYXJhbXMuc2NvcGVdIHRoZSBzY29wZSB0byB1c2UgdG8gcmV0cmlldmUgdGhlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlY29yYXRpb24gYmFja2dyb3VuZC4gTm90ZSB0aGF0IGlmXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBgc2NvcGVgIHByb3BlcnR5IGlzIHNldCwgdGhlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBjbGFzc2Agd29uJ3QgYmUgdXNlZC5cbiAgICogQHBhcmFtICB7c3RyaW5nfSBbZGVjb3JhdGlvblBhcmFtcy5jb2xvcl0gdGhlIENTUyBjb2xvciB0byB1c2UgdG8gcmVuZGVyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBkZWNvcmF0aW9uLiBXaGVuIHNldCwgbmVpdGhlclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgc2NvcGVgIG5vciBgY2xhc3NgIGFyZSB1c2VkLlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IFtkZWNvcmF0aW9uUGFyYW1zLnBsdWdpbl0gdGhlIG5hbWUgb2YgdGhlIHBsdWdpbiB0aGF0XG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkIHRoaXMgZGVjb3JhdGlvbi4gSXQnbGxcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJlIHVzZWQgdG8gb3JkZXIgdGhlIGRlY29yYXRpb25zXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbiB0aGUgc2FtZSBsYXllciBhbmQgdGhhdCBhcmVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG92ZXJsYXBwaW5nLiBJZiB0aGUgcGFyYW1ldGVyIGlzXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbWl0dGVkIHRoZSBNaW5pbWFwIHdpbGwgYXR0ZW1wdFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG8gaW5mZXIgdGhlIHBsdWdpbiBvcmlnaW4gZnJvbVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIHBhdGggb2YgdGhlIGNhbGxlciBmdW5jdGlvbi5cbiAgICogQHBhcmFtICB7ZnVuY3Rpb259IFtkZWNvcmF0aW9uUGFyYW1zLnJlbmRlcl0gdGhlIHJlbmRlciByb3V0aW5lIGZvciBjdXN0b21cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVjb3JhdGlvbnMuIFRoZSBmdW5jdGlvblxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNlaXZlcyB0aGUgZGVjb3JhdGlvbiBhbmRcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIHJlbmRlciBkYXRhIGZvciB0aGVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudCByZW5kZXIgcGFzcy5cbiAgICogQHJldHVybiB7RGVjb3JhdGlvbn0gdGhlIGNyZWF0ZWQgZGVjb3JhdGlvblxuICAgKiBAZW1pdHMgIHtkaWQtYWRkLWRlY29yYXRpb259IHdoZW4gdGhlIGRlY29yYXRpb24gaXMgY3JlYXRlZCBzdWNjZXNzZnVsbHlcbiAgICogQGVtaXRzICB7ZGlkLWNoYW5nZX0gd2hlbiB0aGUgZGVjb3JhdGlvbiBpcyBjcmVhdGVkIHN1Y2Nlc3NmdWxseVxuICAgKi9cbiAgZGVjb3JhdGVNYXJrZXIgKG1hcmtlciwgZGVjb3JhdGlvblBhcmFtcykge1xuICAgIGlmICh0aGlzLmRlc3Ryb3llZCB8fCBtYXJrZXIgPT0gbnVsbCkgeyByZXR1cm4gfVxuXG4gICAgbGV0IHtpZH0gPSBtYXJrZXJcblxuICAgIGlmIChkZWNvcmF0aW9uUGFyYW1zLnR5cGUgPT09ICdoaWdobGlnaHQnKSB7XG4gICAgICBkZWNvcmF0aW9uUGFyYW1zLnR5cGUgPSAnaGlnaGxpZ2h0LW92ZXInXG4gICAgfVxuXG4gICAgY29uc3Qge3R5cGUsIHBsdWdpbn0gPSBkZWNvcmF0aW9uUGFyYW1zXG5cbiAgICBpZiAocGx1Z2luID09IG51bGwpIHtcbiAgICAgIGRlY29yYXRpb25QYXJhbXMucGx1Z2luID0gdGhpcy5nZXRPcmlnaW5hdG9yUGFja2FnZU5hbWUoKVxuICAgIH1cblxuICAgIGlmIChkZWNvcmF0aW9uUGFyYW1zLnNjb3BlID09IG51bGwgJiYgZGVjb3JhdGlvblBhcmFtc1snY2xhc3MnXSAhPSBudWxsKSB7XG4gICAgICBsZXQgY2xzID0gZGVjb3JhdGlvblBhcmFtc1snY2xhc3MnXS5zcGxpdCgnICcpLmpvaW4oJy4nKVxuICAgICAgZGVjb3JhdGlvblBhcmFtcy5zY29wZSA9IGAubWluaW1hcCAuJHtjbHN9YFxuICAgIH1cblxuICAgIGlmICh0aGlzLmRlY29yYXRpb25NYXJrZXJEZXN0cm95ZWRTdWJzY3JpcHRpb25zW2lkXSA9PSBudWxsKSB7XG4gICAgICB0aGlzLmRlY29yYXRpb25NYXJrZXJEZXN0cm95ZWRTdWJzY3JpcHRpb25zW2lkXSA9XG4gICAgICBtYXJrZXIub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgICAgdGhpcy5yZW1vdmVBbGxEZWNvcmF0aW9uc0Zvck1hcmtlcihtYXJrZXIpXG4gICAgICB9KVxuICAgIH1cblxuICAgIGlmICh0aGlzLmRlY29yYXRpb25NYXJrZXJDaGFuZ2VkU3Vic2NyaXB0aW9uc1tpZF0gPT0gbnVsbCkge1xuICAgICAgdGhpcy5kZWNvcmF0aW9uTWFya2VyQ2hhbmdlZFN1YnNjcmlwdGlvbnNbaWRdID1cbiAgICAgIG1hcmtlci5vbkRpZENoYW5nZSgoZXZlbnQpID0+IHtcbiAgICAgICAgbGV0IGRlY29yYXRpb25zID0gdGhpcy5kZWNvcmF0aW9uc0J5TWFya2VySWRbaWRdXG5cbiAgICAgICAgdGhpcy5pbnZhbGlkYXRlRGVjb3JhdGlvbkZvclNjcmVlblJvd3NDYWNoZSgpXG5cbiAgICAgICAgaWYgKGRlY29yYXRpb25zICE9IG51bGwpIHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gZGVjb3JhdGlvbnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBkZWNvcmF0aW9uID0gZGVjb3JhdGlvbnNbaV1cbiAgICAgICAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLWRlY29yYXRpb24nLCB7XG4gICAgICAgICAgICAgIG1hcmtlcjogbWFya2VyLFxuICAgICAgICAgICAgICBkZWNvcmF0aW9uOiBkZWNvcmF0aW9uLFxuICAgICAgICAgICAgICBldmVudDogZXZlbnRcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxldCBvbGRTdGFydCA9IGV2ZW50Lm9sZFRhaWxTY3JlZW5Qb3NpdGlvblxuICAgICAgICBsZXQgb2xkRW5kID0gZXZlbnQub2xkSGVhZFNjcmVlblBvc2l0aW9uXG4gICAgICAgIGxldCBuZXdTdGFydCA9IGV2ZW50Lm5ld1RhaWxTY3JlZW5Qb3NpdGlvblxuICAgICAgICBsZXQgbmV3RW5kID0gZXZlbnQubmV3SGVhZFNjcmVlblBvc2l0aW9uXG5cbiAgICAgICAgaWYgKG9sZFN0YXJ0LnJvdyA+IG9sZEVuZC5yb3cpIHtcbiAgICAgICAgICBbb2xkU3RhcnQsIG9sZEVuZF0gPSBbb2xkRW5kLCBvbGRTdGFydF1cbiAgICAgICAgfVxuICAgICAgICBpZiAobmV3U3RhcnQucm93ID4gbmV3RW5kLnJvdykge1xuICAgICAgICAgIFtuZXdTdGFydCwgbmV3RW5kXSA9IFtuZXdFbmQsIG5ld1N0YXJ0XVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHJhbmdlc0RpZmZzID0gdGhpcy5jb21wdXRlUmFuZ2VzRGlmZnMoXG4gICAgICAgICAgb2xkU3RhcnQsIG9sZEVuZCxcbiAgICAgICAgICBuZXdTdGFydCwgbmV3RW5kXG4gICAgICAgIClcblxuICAgICAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gcmFuZ2VzRGlmZnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICBsZXQgW3N0YXJ0LCBlbmRdID0gcmFuZ2VzRGlmZnNbaV1cbiAgICAgICAgICB0aGlzLmVtaXRSYW5nZUNoYW5nZXModHlwZSwge1xuICAgICAgICAgICAgc3RhcnQ6IHN0YXJ0LFxuICAgICAgICAgICAgZW5kOiBlbmRcbiAgICAgICAgICB9LCAwKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cblxuICAgIGxldCBkZWNvcmF0aW9uID0gbmV3IERlY29yYXRpb24obWFya2VyLCB0aGlzLCBkZWNvcmF0aW9uUGFyYW1zKVxuXG4gICAgaWYgKHRoaXMuZGVjb3JhdGlvbnNCeU1hcmtlcklkW2lkXSA9PSBudWxsKSB7XG4gICAgICB0aGlzLmRlY29yYXRpb25zQnlNYXJrZXJJZFtpZF0gPSBbXVxuICAgIH1cblxuICAgIHRoaXMuZGVjb3JhdGlvbnNCeU1hcmtlcklkW2lkXS5wdXNoKGRlY29yYXRpb24pXG4gICAgdGhpcy5kZWNvcmF0aW9uc0J5SWRbZGVjb3JhdGlvbi5pZF0gPSBkZWNvcmF0aW9uXG5cbiAgICBpZiAodGhpcy5kZWNvcmF0aW9uVXBkYXRlZFN1YnNjcmlwdGlvbnNbZGVjb3JhdGlvbi5pZF0gPT0gbnVsbCkge1xuICAgICAgdGhpcy5kZWNvcmF0aW9uVXBkYXRlZFN1YnNjcmlwdGlvbnNbZGVjb3JhdGlvbi5pZF0gPVxuICAgICAgZGVjb3JhdGlvbi5vbkRpZENoYW5nZVByb3BlcnRpZXMoKGV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMuZW1pdERlY29yYXRpb25DaGFuZ2VzKHR5cGUsIGRlY29yYXRpb24pXG4gICAgICB9KVxuICAgIH1cblxuICAgIHRoaXMuZGVjb3JhdGlvbkRlc3Ryb3llZFN1YnNjcmlwdGlvbnNbZGVjb3JhdGlvbi5pZF0gPVxuICAgIGRlY29yYXRpb24ub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgIHRoaXMucmVtb3ZlRGVjb3JhdGlvbihkZWNvcmF0aW9uKVxuICAgIH0pXG5cbiAgICB0aGlzLmVtaXREZWNvcmF0aW9uQ2hhbmdlcyh0eXBlLCBkZWNvcmF0aW9uKVxuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtYWRkLWRlY29yYXRpb24nLCB7XG4gICAgICBtYXJrZXI6IG1hcmtlcixcbiAgICAgIGRlY29yYXRpb246IGRlY29yYXRpb25cbiAgICB9KVxuXG4gICAgcmV0dXJuIGRlY29yYXRpb25cbiAgfVxuXG4gIGdldE9yaWdpbmF0b3JQYWNrYWdlTmFtZSAoKSB7XG4gICAgY29uc3QgbGluZSA9IG5ldyBFcnJvcigpLnN0YWNrLnNwbGl0KCdcXG4nKVszXVxuICAgIGNvbnN0IGZpbGVQYXRoID0gbGluZS5zcGxpdCgnKCcpWzFdLnJlcGxhY2UoJyknLCAnJylcbiAgICBjb25zdCByZSA9IG5ldyBSZWdFeHAoXG4gICAgICBhdG9tLnBhY2thZ2VzLmdldFBhY2thZ2VEaXJQYXRocygpLmpvaW4oJ3wnKSArIF8uZXNjYXBlUmVnRXhwKHBhdGguc2VwKVxuICAgIClcbiAgICBjb25zdCBwbHVnaW4gPSBmaWxlUGF0aC5yZXBsYWNlKHJlLCAnJykuc3BsaXQocGF0aC5zZXApWzBdLnJlcGxhY2UoL21pbmltYXAtfC1taW5pbWFwLywgJycpXG4gICAgcmV0dXJuIHBsdWdpbi5pbmRleE9mKHBhdGguc2VwKSA8IDAgPyBwbHVnaW4gOiB1bmRlZmluZWRcbiAgfVxuXG4gIC8qKlxuICAgKiBHaXZlbiB0d28gcmFuZ2VzLCBpdCByZXR1cm5zIGFuIGFycmF5IG9mIHJhbmdlcyByZXByZXNlbnRpbmcgdGhlXG4gICAqIGRpZmZlcmVuY2VzIGJldHdlZW4gdGhlbS5cbiAgICpcbiAgICogQHBhcmFtICB7bnVtYmVyfSBvbGRTdGFydCB0aGUgcm93IGluZGV4IG9mIHRoZSBmaXJzdCByYW5nZSBzdGFydFxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IG9sZEVuZCB0aGUgcm93IGluZGV4IG9mIHRoZSBmaXJzdCByYW5nZSBlbmRcbiAgICogQHBhcmFtICB7bnVtYmVyfSBuZXdTdGFydCB0aGUgcm93IGluZGV4IG9mIHRoZSBzZWNvbmQgcmFuZ2Ugc3RhcnRcbiAgICogQHBhcmFtICB7bnVtYmVyfSBuZXdFbmQgdGhlIHJvdyBpbmRleCBvZiB0aGUgc2Vjb25kIHJhbmdlIGVuZFxuICAgKiBAcmV0dXJuIHtBcnJheTxPYmplY3Q+fSB0aGUgYXJyYXkgb2YgZGlmZiByYW5nZXNcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBjb21wdXRlUmFuZ2VzRGlmZnMgKG9sZFN0YXJ0LCBvbGRFbmQsIG5ld1N0YXJ0LCBuZXdFbmQpIHtcbiAgICBsZXQgZGlmZnMgPSBbXVxuXG4gICAgaWYgKG9sZFN0YXJ0LmlzTGVzc1RoYW4obmV3U3RhcnQpKSB7XG4gICAgICBkaWZmcy5wdXNoKFtvbGRTdGFydCwgbmV3U3RhcnRdKVxuICAgIH0gZWxzZSBpZiAobmV3U3RhcnQuaXNMZXNzVGhhbihvbGRTdGFydCkpIHtcbiAgICAgIGRpZmZzLnB1c2goW25ld1N0YXJ0LCBvbGRTdGFydF0pXG4gICAgfVxuXG4gICAgaWYgKG9sZEVuZC5pc0xlc3NUaGFuKG5ld0VuZCkpIHtcbiAgICAgIGRpZmZzLnB1c2goW29sZEVuZCwgbmV3RW5kXSlcbiAgICB9IGVsc2UgaWYgKG5ld0VuZC5pc0xlc3NUaGFuKG9sZEVuZCkpIHtcbiAgICAgIGRpZmZzLnB1c2goW25ld0VuZCwgb2xkRW5kXSlcbiAgICB9XG5cbiAgICByZXR1cm4gZGlmZnNcbiAgfVxuXG4gIC8qKlxuICAgKiBFbWl0cyBhIGNoYW5nZSBpbiB0aGUgYE1pbmltYXBgIGNvcnJlc3BvbmRpbmcgdG8gdGhlXG4gICAqIHBhc3NlZC1pbiBkZWNvcmF0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IHR5cGUgdGhlIHR5cGUgb2YgZGVjb3JhdGlvbiB0aGF0IGNoYW5nZWRcbiAgICogQHBhcmFtICB7RGVjb3JhdGlvbn0gZGVjb3JhdGlvbiB0aGUgZGVjb3JhdGlvbiBmb3Igd2hpY2ggZW1pdHRpbmcgYW4gZXZlbnRcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuICBlbWl0RGVjb3JhdGlvbkNoYW5nZXMgKHR5cGUsIGRlY29yYXRpb24pIHtcbiAgICBpZiAodGhpcy50ZXh0RWRpdG9yLmlzRGVzdHJveWVkKCkpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMuaW52YWxpZGF0ZURlY29yYXRpb25Gb3JTY3JlZW5Sb3dzQ2FjaGUoKVxuXG4gICAgbGV0IHJhbmdlID0gZGVjb3JhdGlvbi5tYXJrZXIuZ2V0U2NyZWVuUmFuZ2UoKVxuICAgIGlmIChyYW5nZSA9PSBudWxsKSB7IHJldHVybiB9XG5cbiAgICB0aGlzLmVtaXRSYW5nZUNoYW5nZXModHlwZSwgcmFuZ2UsIDApXG4gIH1cblxuICAvKipcbiAgICogRW1pdHMgYSBjaGFuZ2UgZm9yIHRoZSBzcGVjaWZpZWQgcmFuZ2UuXG4gICAqXG4gICAqIEBwYXJhbSAge3N0cmluZ30gdHlwZSB0aGUgdHlwZSBvZiBkZWNvcmF0aW9uIHRoYXQgY2hhbmdlZFxuICAgKiBAcGFyYW0gIHtPYmplY3R9IHJhbmdlIHRoZSByYW5nZSB3aGVyZSBjaGFuZ2VzIG9jY3VyZWRcbiAgICogQHBhcmFtICB7bnVtYmVyfSBbc2NyZWVuRGVsdGFdIGFuIG9wdGlvbmFsIHNjcmVlbiBkZWx0YSBmb3IgdGhlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFuZ2Ugb2JqZWN0XG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgZW1pdFJhbmdlQ2hhbmdlcyAodHlwZSwgcmFuZ2UsIHNjcmVlbkRlbHRhKSB7XG4gICAgbGV0IHN0YXJ0U2NyZWVuUm93ID0gcmFuZ2Uuc3RhcnQucm93XG4gICAgbGV0IGVuZFNjcmVlblJvdyA9IHJhbmdlLmVuZC5yb3dcbiAgICBsZXQgbGFzdFJlbmRlcmVkU2NyZWVuUm93ID0gdGhpcy5nZXRMYXN0VmlzaWJsZVNjcmVlblJvdygpXG4gICAgbGV0IGZpcnN0UmVuZGVyZWRTY3JlZW5Sb3cgPSB0aGlzLmdldEZpcnN0VmlzaWJsZVNjcmVlblJvdygpXG5cbiAgICBpZiAoc2NyZWVuRGVsdGEgPT0gbnVsbCkge1xuICAgICAgc2NyZWVuRGVsdGEgPSAobGFzdFJlbmRlcmVkU2NyZWVuUm93IC0gZmlyc3RSZW5kZXJlZFNjcmVlblJvdykgLVxuICAgICAgICAgICAgICAgICAgICAoZW5kU2NyZWVuUm93IC0gc3RhcnRTY3JlZW5Sb3cpXG4gICAgfVxuXG4gICAgbGV0IGNoYW5nZUV2ZW50ID0ge1xuICAgICAgc3RhcnQ6IHN0YXJ0U2NyZWVuUm93LFxuICAgICAgZW5kOiBlbmRTY3JlZW5Sb3csXG4gICAgICBzY3JlZW5EZWx0YTogc2NyZWVuRGVsdGEsXG4gICAgICB0eXBlOiB0eXBlXG4gICAgfVxuXG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtZGVjb3JhdGlvbi1yYW5nZScsIGNoYW5nZUV2ZW50KVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSBgRGVjb3JhdGlvbmAgZnJvbSB0aGlzIG1pbmltYXAuXG4gICAqXG4gICAqIEBwYXJhbSAge0RlY29yYXRpb259IGRlY29yYXRpb24gdGhlIGRlY29yYXRpb24gdG8gcmVtb3ZlXG4gICAqIEBlbWl0cyAge2RpZC1jaGFuZ2V9IHdoZW4gdGhlIGRlY29yYXRpb24gaXMgcmVtb3ZlZFxuICAgKiBAZW1pdHMgIHtkaWQtcmVtb3ZlLWRlY29yYXRpb259IHdoZW4gdGhlIGRlY29yYXRpb24gaXMgcmVtb3ZlZFxuICAgKi9cbiAgcmVtb3ZlRGVjb3JhdGlvbiAoZGVjb3JhdGlvbikge1xuICAgIGlmIChkZWNvcmF0aW9uID09IG51bGwpIHsgcmV0dXJuIH1cblxuICAgIGxldCBtYXJrZXIgPSBkZWNvcmF0aW9uLm1hcmtlclxuICAgIGxldCBzdWJzY3JpcHRpb25cblxuICAgIGRlbGV0ZSB0aGlzLmRlY29yYXRpb25zQnlJZFtkZWNvcmF0aW9uLmlkXVxuXG4gICAgc3Vic2NyaXB0aW9uID0gdGhpcy5kZWNvcmF0aW9uVXBkYXRlZFN1YnNjcmlwdGlvbnNbZGVjb3JhdGlvbi5pZF1cbiAgICBpZiAoc3Vic2NyaXB0aW9uICE9IG51bGwpIHsgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKSB9XG5cbiAgICBzdWJzY3JpcHRpb24gPSB0aGlzLmRlY29yYXRpb25EZXN0cm95ZWRTdWJzY3JpcHRpb25zW2RlY29yYXRpb24uaWRdXG4gICAgaWYgKHN1YnNjcmlwdGlvbiAhPSBudWxsKSB7IHN1YnNjcmlwdGlvbi5kaXNwb3NlKCkgfVxuXG4gICAgZGVsZXRlIHRoaXMuZGVjb3JhdGlvblVwZGF0ZWRTdWJzY3JpcHRpb25zW2RlY29yYXRpb24uaWRdXG4gICAgZGVsZXRlIHRoaXMuZGVjb3JhdGlvbkRlc3Ryb3llZFN1YnNjcmlwdGlvbnNbZGVjb3JhdGlvbi5pZF1cblxuICAgIGxldCBkZWNvcmF0aW9ucyA9IHRoaXMuZGVjb3JhdGlvbnNCeU1hcmtlcklkW21hcmtlci5pZF1cbiAgICBpZiAoIWRlY29yYXRpb25zKSB7IHJldHVybiB9XG5cbiAgICB0aGlzLmVtaXREZWNvcmF0aW9uQ2hhbmdlcyhkZWNvcmF0aW9uLmdldFByb3BlcnRpZXMoKS50eXBlLCBkZWNvcmF0aW9uKVxuXG4gICAgbGV0IGluZGV4ID0gZGVjb3JhdGlvbnMuaW5kZXhPZihkZWNvcmF0aW9uKVxuICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICBkZWNvcmF0aW9ucy5zcGxpY2UoaW5kZXgsIDEpXG5cbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtcmVtb3ZlLWRlY29yYXRpb24nLCB7XG4gICAgICAgIG1hcmtlcjogbWFya2VyLFxuICAgICAgICBkZWNvcmF0aW9uOiBkZWNvcmF0aW9uXG4gICAgICB9KVxuXG4gICAgICBpZiAoZGVjb3JhdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlZEFsbE1hcmtlckRlY29yYXRpb25zKG1hcmtlcilcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhbGwgdGhlIGRlY29yYXRpb25zIHJlZ2lzdGVyZWQgZm9yIHRoZSBwYXNzZWQtaW4gbWFya2VyLlxuICAgKlxuICAgKiBAcGFyYW0gIHtNYXJrZXJ9IG1hcmtlciB0aGUgbWFya2VyIGZvciB3aGljaCByZW1vdmluZyBpdHMgZGVjb3JhdGlvbnNcbiAgICogQGVtaXRzICB7ZGlkLWNoYW5nZX0gd2hlbiBhIGRlY29yYXRpb24gaGF2ZSBiZWVuIHJlbW92ZWRcbiAgICogQGVtaXRzICB7ZGlkLXJlbW92ZS1kZWNvcmF0aW9ufSB3aGVuIGEgZGVjb3JhdGlvbiBoYXZlIGJlZW4gcmVtb3ZlZFxuICAgKi9cbiAgcmVtb3ZlQWxsRGVjb3JhdGlvbnNGb3JNYXJrZXIgKG1hcmtlcikge1xuICAgIGlmIChtYXJrZXIgPT0gbnVsbCkgeyByZXR1cm4gfVxuXG4gICAgbGV0IGRlY29yYXRpb25zID0gdGhpcy5kZWNvcmF0aW9uc0J5TWFya2VySWRbbWFya2VyLmlkXVxuICAgIGlmICghZGVjb3JhdGlvbnMpIHsgcmV0dXJuIH1cblxuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBkZWNvcmF0aW9ucy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgbGV0IGRlY29yYXRpb24gPSBkZWNvcmF0aW9uc1tpXVxuXG4gICAgICB0aGlzLmVtaXREZWNvcmF0aW9uQ2hhbmdlcyhkZWNvcmF0aW9uLmdldFByb3BlcnRpZXMoKS50eXBlLCBkZWNvcmF0aW9uKVxuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1yZW1vdmUtZGVjb3JhdGlvbicsIHtcbiAgICAgICAgbWFya2VyOiBtYXJrZXIsXG4gICAgICAgIGRlY29yYXRpb246IGRlY29yYXRpb25cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgdGhpcy5yZW1vdmVkQWxsTWFya2VyRGVjb3JhdGlvbnMobWFya2VyKVxuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIHRoZSByZW1vdmFsIG9mIGEgZGVjb3JhdGlvbiBmb3IgYSBnaXZlbiBtYXJrZXIuXG4gICAqXG4gICAqIEBwYXJhbSAge01hcmtlcn0gbWFya2VyIHRoZSBtYXJrZXIgZm9yIHdoaWNoIHJlbW92aW5nIGRlY29yYXRpb25zXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKi9cbiAgcmVtb3ZlZEFsbE1hcmtlckRlY29yYXRpb25zIChtYXJrZXIpIHtcbiAgICBpZiAobWFya2VyID09IG51bGwpIHsgcmV0dXJuIH1cblxuICAgIHRoaXMuZGVjb3JhdGlvbk1hcmtlckNoYW5nZWRTdWJzY3JpcHRpb25zW21hcmtlci5pZF0uZGlzcG9zZSgpXG4gICAgdGhpcy5kZWNvcmF0aW9uTWFya2VyRGVzdHJveWVkU3Vic2NyaXB0aW9uc1ttYXJrZXIuaWRdLmRpc3Bvc2UoKVxuXG4gICAgZGVsZXRlIHRoaXMuZGVjb3JhdGlvbnNCeU1hcmtlcklkW21hcmtlci5pZF1cbiAgICBkZWxldGUgdGhpcy5kZWNvcmF0aW9uTWFya2VyQ2hhbmdlZFN1YnNjcmlwdGlvbnNbbWFya2VyLmlkXVxuICAgIGRlbGV0ZSB0aGlzLmRlY29yYXRpb25NYXJrZXJEZXN0cm95ZWRTdWJzY3JpcHRpb25zW21hcmtlci5pZF1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFsbCB0aGUgZGVjb3JhdGlvbnMgdGhhdCB3YXMgY3JlYXRlZCBpbiB0aGUgY3VycmVudCBgTWluaW1hcGAuXG4gICAqL1xuICByZW1vdmVBbGxEZWNvcmF0aW9ucyAoKSB7XG4gICAgZm9yIChsZXQgaWQgaW4gdGhpcy5kZWNvcmF0aW9uTWFya2VyQ2hhbmdlZFN1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuZGVjb3JhdGlvbk1hcmtlckNoYW5nZWRTdWJzY3JpcHRpb25zW2lkXS5kaXNwb3NlKClcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpZCBpbiB0aGlzLmRlY29yYXRpb25NYXJrZXJEZXN0cm95ZWRTdWJzY3JpcHRpb25zKSB7XG4gICAgICB0aGlzLmRlY29yYXRpb25NYXJrZXJEZXN0cm95ZWRTdWJzY3JpcHRpb25zW2lkXS5kaXNwb3NlKClcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpZCBpbiB0aGlzLmRlY29yYXRpb25VcGRhdGVkU3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5kZWNvcmF0aW9uVXBkYXRlZFN1YnNjcmlwdGlvbnNbaWRdLmRpc3Bvc2UoKVxuICAgIH1cblxuICAgIGZvciAobGV0IGlkIGluIHRoaXMuZGVjb3JhdGlvbkRlc3Ryb3llZFN1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuZGVjb3JhdGlvbkRlc3Ryb3llZFN1YnNjcmlwdGlvbnNbaWRdLmRpc3Bvc2UoKVxuICAgIH1cblxuICAgIGZvciAobGV0IGlkIGluIHRoaXMuZGVjb3JhdGlvbnNCeUlkKSB7XG4gICAgICB0aGlzLmRlY29yYXRpb25zQnlJZFtpZF0uZGVzdHJveSgpXG4gICAgfVxuXG4gICAgdGhpcy5kZWNvcmF0aW9uc0J5SWQgPSB7fVxuICAgIHRoaXMuZGVjb3JhdGlvbnNCeU1hcmtlcklkID0ge31cbiAgICB0aGlzLmRlY29yYXRpb25NYXJrZXJDaGFuZ2VkU3Vic2NyaXB0aW9ucyA9IHt9XG4gICAgdGhpcy5kZWNvcmF0aW9uTWFya2VyRGVzdHJveWVkU3Vic2NyaXB0aW9ucyA9IHt9XG4gICAgdGhpcy5kZWNvcmF0aW9uVXBkYXRlZFN1YnNjcmlwdGlvbnMgPSB7fVxuICAgIHRoaXMuZGVjb3JhdGlvbkRlc3Ryb3llZFN1YnNjcmlwdGlvbnMgPSB7fVxuICB9XG59XG4iXX0=
//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/minimap/lib/mixins/decoration-management.js
