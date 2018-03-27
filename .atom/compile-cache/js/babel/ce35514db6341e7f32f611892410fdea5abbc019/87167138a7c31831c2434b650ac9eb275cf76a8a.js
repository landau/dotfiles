Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _mixto = require('mixto');

var _mixto2 = _interopRequireDefault(_mixto);

'use babel';

var _ = undefined,
    path = undefined,
    Emitter = undefined,
    Decoration = undefined;

/**
 * The mixin that provides the decorations API to the minimap editor
 * view.
 *
 * This mixin is injected into the `Minimap` prototype, so every methods defined
 * in this file will be available on any `Minimap` instance.
 */

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
        if (!Emitter) {
          Emitter = require('atom').Emitter;
        }

        /**
         * The minimap emitter, lazily created if not created yet.
         * @type {Emitter}
         * @access private
         */
        this.emitter = new Emitter();
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

      if (!Decoration) {
        Decoration = require('../decoration');
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

      var decoration = new Decoration(marker, this, decorationParams);

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
      if (!_) {
        _ = require('underscore-plus');
      }
      if (!path) {
        path = require('path');
      }

      var line = new Error().stack.split('\n')[3];
      var filePath = line.split('(')[1].replace(')', '');
      var re = new RegExp(atom.packages.getPackageDirPaths().join('|') + _.escapeRegExp(path.sep));
      var plugin = filePath.replace(re, '').split(path.sep)[0].replace(/minimap-|-minimap/, '');
      return plugin.indexOf(path.sep) < 0 ? plugin : undefined;
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
      if (!this.textEditor || this.textEditor.isDestroyed()) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL21pbmltYXAvbGliL21peGlucy9kZWNvcmF0aW9uLW1hbmFnZW1lbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztxQkFFa0IsT0FBTzs7OztBQUZ6QixXQUFXLENBQUE7O0FBR1gsSUFBSSxDQUFDLFlBQUE7SUFBRSxJQUFJLFlBQUE7SUFBRSxPQUFPLFlBQUE7SUFBRSxVQUFVLFlBQUEsQ0FBQTs7Ozs7Ozs7OztJQVNYLG9CQUFvQjtZQUFwQixvQkFBb0I7O1dBQXBCLG9CQUFvQjswQkFBcEIsb0JBQW9COzsrQkFBcEIsb0JBQW9COzs7ZUFBcEIsb0JBQW9COzs7Ozs7V0FLakIsaUNBQUc7QUFDdkIsVUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksRUFBRTtBQUN4QixZQUFJLENBQUMsT0FBTyxFQUFFO0FBQUUsaUJBQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFBO1NBQUU7Ozs7Ozs7QUFPbkQsWUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFBO09BQzdCOzs7Ozs7O0FBT0QsVUFBSSxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUE7Ozs7OztBQU16QixVQUFJLENBQUMscUJBQXFCLEdBQUcsRUFBRSxDQUFBOzs7Ozs7O0FBTy9CLFVBQUksQ0FBQyxvQ0FBb0MsR0FBRyxFQUFFLENBQUE7Ozs7Ozs7QUFPOUMsVUFBSSxDQUFDLHNDQUFzQyxHQUFHLEVBQUUsQ0FBQTs7Ozs7OztBQU9oRCxVQUFJLENBQUMsOEJBQThCLEdBQUcsRUFBRSxDQUFBOzs7Ozs7O0FBT3hDLFVBQUksQ0FBQyxnQ0FBZ0MsR0FBRyxFQUFFLENBQUE7S0FDM0M7Ozs7Ozs7OztXQU9jLDBCQUFHO0FBQ2hCLFVBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUE7QUFDdEMsVUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFBOztBQUVoQixXQUFLLElBQUksRUFBRSxJQUFJLFdBQVcsRUFBRTtBQUFFLGVBQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7T0FBRTs7QUFFN0QsYUFBTyxPQUFPLENBQUE7S0FDZjs7Ozs7Ozs7Ozs7Ozs7OztXQWNrQiw0QkFBQyxRQUFRLEVBQUU7QUFDNUIsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUN2RDs7Ozs7Ozs7Ozs7Ozs7OztXQWNxQiwrQkFBQyxRQUFRLEVBQUU7QUFDL0IsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyx1QkFBdUIsRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUMxRDs7Ozs7Ozs7Ozs7Ozs7Ozs7OztXQWlCcUIsK0JBQUMsUUFBUSxFQUFFO0FBQy9CLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsdUJBQXVCLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDMUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7V0FpQjBCLG9DQUFDLFFBQVEsRUFBRTtBQUNwQyxhQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLDZCQUE2QixFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQ2hFOzs7Ozs7Ozs7Ozs7OztXQVlxQiwrQkFBQyxRQUFRLEVBQUU7QUFDL0IsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyx1QkFBdUIsRUFBRSxRQUFRLENBQUMsQ0FBQTtLQUMxRDs7Ozs7Ozs7OztXQVFlLHlCQUFDLEVBQUUsRUFBRTtBQUNuQixhQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUE7S0FDaEM7Ozs7Ozs7Ozs7OztXQVU0QixzQ0FBQyxjQUFjLEVBQUUsWUFBWSxFQUFFO0FBQzFELFVBQUkscUJBQXFCLEdBQUcsRUFBRSxDQUFBO0FBQzlCLFVBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7QUFDN0IsZ0NBQXdCLEVBQUUsQ0FBQyxjQUFjLEVBQUUsWUFBWSxDQUFDO09BQ3pELENBQUMsQ0FBQTs7QUFFRixXQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ2xELFlBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN2QixZQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBOztBQUV2RCxZQUFJLFdBQVcsSUFBSSxJQUFJLEVBQUU7QUFDdkIsK0JBQXFCLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQTtTQUMvQztPQUNGOztBQUVELGFBQU8scUJBQXFCLENBQUE7S0FDN0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7V0E2QnlCLHFDQUFHO0FBQzNCLFVBQUksSUFBSSxDQUFDLDhCQUE4QixJQUFJLElBQUksRUFBRTtBQUMvQyxlQUFPLElBQUksQ0FBQyw4QkFBOEIsQ0FBQTtPQUMzQzs7QUFFRCxVQUFJLEtBQUssR0FBRyxFQUFFLENBQUE7QUFDZCxXQUFLLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7QUFDbkMsWUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQTtBQUN6QyxZQUFJLEtBQUssR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFBO0FBQzlDLFlBQUksSUFBSSxHQUFHLFVBQVUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxJQUFJLENBQUE7O0FBRTFDLFlBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksRUFBRTtBQUFFLGVBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUE7U0FBRTs7QUFFN0MsYUFBSyxJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtBQUN0RSxjQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUU7QUFBRSxpQkFBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtXQUFFOztBQUV2RCxlQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO1NBQ2xDO09BQ0Y7Ozs7Ozs7QUFPRCxVQUFJLENBQUMsOEJBQThCLEdBQUcsS0FBSyxDQUFBO0FBQzNDLGFBQU8sS0FBSyxDQUFBO0tBQ2I7Ozs7Ozs7V0FLc0Msa0RBQUc7QUFDeEMsVUFBSSxDQUFDLDhCQUE4QixHQUFHLElBQUksQ0FBQTtLQUMzQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1dBMERjLHdCQUFDLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRTs7O0FBQ3hDLFVBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxNQUFNLElBQUksSUFBSSxFQUFFO0FBQUUsZUFBTTtPQUFFOztBQUVoRCxVQUFJLENBQUMsVUFBVSxFQUFFO0FBQUUsa0JBQVUsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7T0FBRTs7VUFFckQsRUFBRSxHQUFJLE1BQU0sQ0FBWixFQUFFOztBQUVQLFVBQUksZ0JBQWdCLENBQUMsSUFBSSxLQUFLLFdBQVcsRUFBRTtBQUN6Qyx3QkFBZ0IsQ0FBQyxJQUFJLEdBQUcsZ0JBQWdCLENBQUE7T0FDekM7O1VBRU0sSUFBSSxHQUFZLGdCQUFnQixDQUFoQyxJQUFJO1VBQUUsTUFBTSxHQUFJLGdCQUFnQixDQUExQixNQUFNOztBQUVuQixVQUFJLE1BQU0sSUFBSSxJQUFJLEVBQUU7QUFDbEIsd0JBQWdCLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFBO09BQzFEOztBQUVELFVBQUksZ0JBQWdCLENBQUMsS0FBSyxJQUFJLElBQUksSUFBSSxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLEVBQUU7QUFDdkUsWUFBSSxHQUFHLEdBQUcsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUN4RCx3QkFBZ0IsQ0FBQyxLQUFLLGtCQUFnQixHQUFHLEFBQUUsQ0FBQTtPQUM1Qzs7QUFFRCxVQUFJLElBQUksQ0FBQyxzQ0FBc0MsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLEVBQUU7QUFDM0QsWUFBSSxDQUFDLHNDQUFzQyxDQUFDLEVBQUUsQ0FBQyxHQUMvQyxNQUFNLENBQUMsWUFBWSxDQUFDLFlBQU07QUFDeEIsZ0JBQUssNkJBQTZCLENBQUMsTUFBTSxDQUFDLENBQUE7U0FDM0MsQ0FBQyxDQUFBO09BQ0g7O0FBRUQsVUFBSSxJQUFJLENBQUMsb0NBQW9DLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxFQUFFO0FBQ3pELFlBQUksQ0FBQyxvQ0FBb0MsQ0FBQyxFQUFFLENBQUMsR0FDN0MsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFDLEtBQUssRUFBSztBQUM1QixjQUFJLFdBQVcsR0FBRyxNQUFLLHFCQUFxQixDQUFDLEVBQUUsQ0FBQyxDQUFBOztBQUVoRCxnQkFBSyxzQ0FBc0MsRUFBRSxDQUFBOztBQUU3QyxjQUFJLFdBQVcsSUFBSSxJQUFJLEVBQUU7QUFDdkIsaUJBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDdEQsa0JBQUksV0FBVSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUMvQixvQkFBSyxPQUFPLENBQUMsSUFBSSxDQUFDLHVCQUF1QixFQUFFO0FBQ3pDLHNCQUFNLEVBQUUsTUFBTTtBQUNkLDBCQUFVLEVBQUUsV0FBVTtBQUN0QixxQkFBSyxFQUFFLEtBQUs7ZUFDYixDQUFDLENBQUE7YUFDSDtXQUNGO0FBQ0QsY0FBSSxRQUFRLEdBQUcsS0FBSyxDQUFDLHFCQUFxQixDQUFBO0FBQzFDLGNBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQTtBQUN4QyxjQUFJLFFBQVEsR0FBRyxLQUFLLENBQUMscUJBQXFCLENBQUE7QUFDMUMsY0FBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLHFCQUFxQixDQUFBOztBQUV4QyxjQUFJLFFBQVEsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRTt1QkFDUixDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUM7QUFBdEMsb0JBQVE7QUFBRSxrQkFBTTtXQUNsQjtBQUNELGNBQUksUUFBUSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFO3dCQUNSLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQztBQUF0QyxvQkFBUTtBQUFFLGtCQUFNO1dBQ2xCOztBQUVELGNBQUksV0FBVyxHQUFHLE1BQUssa0JBQWtCLENBQ3ZDLFFBQVEsRUFBRSxNQUFNLEVBQ2hCLFFBQVEsRUFBRSxNQUFNLENBQ2pCLENBQUE7O0FBRUQsZUFBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtnREFDbkMsV0FBVyxDQUFDLENBQUMsQ0FBQzs7Z0JBQTVCLEtBQUs7Z0JBQUUsR0FBRzs7QUFDZixrQkFBSyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUU7QUFDMUIsbUJBQUssRUFBRSxLQUFLO0FBQ1osaUJBQUcsRUFBRSxHQUFHO2FBQ1QsRUFBRSxDQUFDLENBQUMsQ0FBQTtXQUNOO1NBQ0YsQ0FBQyxDQUFBO09BQ0g7O0FBRUQsVUFBSSxVQUFVLEdBQUcsSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxDQUFBOztBQUUvRCxVQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLEVBQUU7QUFDMUMsWUFBSSxDQUFDLHFCQUFxQixDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtPQUNwQzs7QUFFRCxVQUFJLENBQUMscUJBQXFCLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0FBQy9DLFVBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQTs7QUFFaEQsVUFBSSxJQUFJLENBQUMsOEJBQThCLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksRUFBRTtBQUM5RCxZQUFJLENBQUMsOEJBQThCLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxHQUNsRCxVQUFVLENBQUMscUJBQXFCLENBQUMsVUFBQyxLQUFLLEVBQUs7QUFDMUMsZ0JBQUsscUJBQXFCLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFBO1NBQzdDLENBQUMsQ0FBQTtPQUNIOztBQUVELFVBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEdBQ3BELFVBQVUsQ0FBQyxZQUFZLENBQUMsWUFBTTtBQUM1QixjQUFLLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFBO09BQ2xDLENBQUMsQ0FBQTs7QUFFRixVQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFBO0FBQzVDLFVBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFO0FBQ3RDLGNBQU0sRUFBRSxNQUFNO0FBQ2Qsa0JBQVUsRUFBRSxVQUFVO09BQ3ZCLENBQUMsQ0FBQTs7QUFFRixhQUFPLFVBQVUsQ0FBQTtLQUNsQjs7O1dBRXdCLG9DQUFHO0FBQzFCLFVBQUksQ0FBQyxDQUFDLEVBQUU7QUFBRSxTQUFDLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUE7T0FBRTtBQUMxQyxVQUFJLENBQUMsSUFBSSxFQUFFO0FBQUUsWUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtPQUFFOztBQUVyQyxVQUFNLElBQUksR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDN0MsVUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBQ3BELFVBQU0sRUFBRSxHQUFHLElBQUksTUFBTSxDQUNuQixJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUN4RSxDQUFBO0FBQ0QsVUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxDQUFDLENBQUE7QUFDM0YsYUFBTyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxHQUFHLFNBQVMsQ0FBQTtLQUN6RDs7Ozs7Ozs7Ozs7Ozs7O1dBYWtCLDRCQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRTtBQUN0RCxVQUFJLEtBQUssR0FBRyxFQUFFLENBQUE7O0FBRWQsVUFBSSxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQ2pDLGFBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQTtPQUNqQyxNQUFNLElBQUksUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUN4QyxhQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUE7T0FDakM7O0FBRUQsVUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFO0FBQzdCLGFBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQTtPQUM3QixNQUFNLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUNwQyxhQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUE7T0FDN0I7O0FBRUQsYUFBTyxLQUFLLENBQUE7S0FDYjs7Ozs7Ozs7Ozs7O1dBVXFCLCtCQUFDLElBQUksRUFBRSxVQUFVLEVBQUU7QUFDdkMsVUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsRUFBRTtBQUFFLGVBQU07T0FBRTs7QUFFakUsVUFBSSxDQUFDLHNDQUFzQyxFQUFFLENBQUE7O0FBRTdDLFVBQUksS0FBSyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUE7QUFDOUMsVUFBSSxLQUFLLElBQUksSUFBSSxFQUFFO0FBQUUsZUFBTTtPQUFFOztBQUU3QixVQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQTtLQUN0Qzs7Ozs7Ozs7Ozs7OztXQVdnQiwwQkFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRTtBQUMxQyxVQUFJLGNBQWMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQTtBQUNwQyxVQUFJLFlBQVksR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQTtBQUNoQyxVQUFJLHFCQUFxQixHQUFHLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFBO0FBQzFELFVBQUksc0JBQXNCLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUE7O0FBRTVELFVBQUksV0FBVyxJQUFJLElBQUksRUFBRTtBQUN2QixtQkFBVyxHQUFHLEFBQUMscUJBQXFCLEdBQUcsc0JBQXNCLElBQzlDLFlBQVksR0FBRyxjQUFjLENBQUEsQUFBQyxDQUFBO09BQzlDOztBQUVELFVBQUksV0FBVyxHQUFHO0FBQ2hCLGFBQUssRUFBRSxjQUFjO0FBQ3JCLFdBQUcsRUFBRSxZQUFZO0FBQ2pCLG1CQUFXLEVBQUUsV0FBVztBQUN4QixZQUFJLEVBQUUsSUFBSTtPQUNYLENBQUE7O0FBRUQsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsNkJBQTZCLEVBQUUsV0FBVyxDQUFDLENBQUE7S0FDOUQ7Ozs7Ozs7Ozs7O1dBU2dCLDBCQUFDLFVBQVUsRUFBRTtBQUM1QixVQUFJLFVBQVUsSUFBSSxJQUFJLEVBQUU7QUFBRSxlQUFNO09BQUU7O0FBRWxDLFVBQUksTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUE7QUFDOUIsVUFBSSxZQUFZLFlBQUEsQ0FBQTs7QUFFaEIsYUFBTyxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQTs7QUFFMUMsa0JBQVksR0FBRyxJQUFJLENBQUMsOEJBQThCLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0FBQ2pFLFVBQUksWUFBWSxJQUFJLElBQUksRUFBRTtBQUFFLG9CQUFZLENBQUMsT0FBTyxFQUFFLENBQUE7T0FBRTs7QUFFcEQsa0JBQVksR0FBRyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0FBQ25FLFVBQUksWUFBWSxJQUFJLElBQUksRUFBRTtBQUFFLG9CQUFZLENBQUMsT0FBTyxFQUFFLENBQUE7T0FBRTs7QUFFcEQsYUFBTyxJQUFJLENBQUMsOEJBQThCLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0FBQ3pELGFBQU8sSUFBSSxDQUFDLGdDQUFnQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQTs7QUFFM0QsVUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQTtBQUN2RCxVQUFJLENBQUMsV0FBVyxFQUFFO0FBQUUsZUFBTTtPQUFFOztBQUU1QixVQUFJLENBQUMscUJBQXFCLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQTs7QUFFdkUsVUFBSSxLQUFLLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQTtBQUMzQyxVQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsRUFBRTtBQUNkLG1CQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQTs7QUFFNUIsWUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsdUJBQXVCLEVBQUU7QUFDekMsZ0JBQU0sRUFBRSxNQUFNO0FBQ2Qsb0JBQVUsRUFBRSxVQUFVO1NBQ3ZCLENBQUMsQ0FBQTs7QUFFRixZQUFJLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQzVCLGNBQUksQ0FBQywyQkFBMkIsQ0FBQyxNQUFNLENBQUMsQ0FBQTtTQUN6QztPQUNGO0tBQ0Y7Ozs7Ozs7Ozs7O1dBUzZCLHVDQUFDLE1BQU0sRUFBRTtBQUNyQyxVQUFJLE1BQU0sSUFBSSxJQUFJLEVBQUU7QUFBRSxlQUFNO09BQUU7O0FBRTlCLFVBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7QUFDdkQsVUFBSSxDQUFDLFdBQVcsRUFBRTtBQUFFLGVBQU07T0FBRTs7QUFFNUIsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN0RCxZQUFJLFVBQVUsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUE7O0FBRS9CLFlBQUksQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUFFLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFBO0FBQ3ZFLFlBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHVCQUF1QixFQUFFO0FBQ3pDLGdCQUFNLEVBQUUsTUFBTTtBQUNkLG9CQUFVLEVBQUUsVUFBVTtTQUN2QixDQUFDLENBQUE7T0FDSDs7QUFFRCxVQUFJLENBQUMsMkJBQTJCLENBQUMsTUFBTSxDQUFDLENBQUE7S0FDekM7Ozs7Ozs7Ozs7V0FRMkIscUNBQUMsTUFBTSxFQUFFO0FBQ25DLFVBQUksTUFBTSxJQUFJLElBQUksRUFBRTtBQUFFLGVBQU07T0FBRTs7QUFFOUIsVUFBSSxDQUFDLG9DQUFvQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtBQUM5RCxVQUFJLENBQUMsc0NBQXNDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFBOztBQUVoRSxhQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7QUFDNUMsYUFBTyxJQUFJLENBQUMsb0NBQW9DLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0FBQzNELGFBQU8sSUFBSSxDQUFDLHNDQUFzQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQTtLQUM5RDs7Ozs7OztXQUtvQixnQ0FBRztBQUN0QixXQUFLLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQyxvQ0FBb0MsRUFBRTtBQUN4RCxZQUFJLENBQUMsb0NBQW9DLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUE7T0FDeEQ7O0FBRUQsV0FBSyxJQUFJLEVBQUUsSUFBSSxJQUFJLENBQUMsc0NBQXNDLEVBQUU7QUFDMUQsWUFBSSxDQUFDLHNDQUFzQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFBO09BQzFEOztBQUVELFdBQUssSUFBSSxFQUFFLElBQUksSUFBSSxDQUFDLDhCQUE4QixFQUFFO0FBQ2xELFlBQUksQ0FBQyw4QkFBOEIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtPQUNsRDs7QUFFRCxXQUFLLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQyxnQ0FBZ0MsRUFBRTtBQUNwRCxZQUFJLENBQUMsZ0NBQWdDLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUE7T0FDcEQ7O0FBRUQsV0FBSyxJQUFJLEVBQUUsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO0FBQ25DLFlBQUksQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUE7T0FDbkM7O0FBRUQsVUFBSSxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUE7QUFDekIsVUFBSSxDQUFDLHFCQUFxQixHQUFHLEVBQUUsQ0FBQTtBQUMvQixVQUFJLENBQUMsb0NBQW9DLEdBQUcsRUFBRSxDQUFBO0FBQzlDLFVBQUksQ0FBQyxzQ0FBc0MsR0FBRyxFQUFFLENBQUE7QUFDaEQsVUFBSSxDQUFDLDhCQUE4QixHQUFHLEVBQUUsQ0FBQTtBQUN4QyxVQUFJLENBQUMsZ0NBQWdDLEdBQUcsRUFBRSxDQUFBO0tBQzNDOzs7U0EvbUJrQixvQkFBb0I7OztxQkFBcEIsb0JBQW9CIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL21pbmltYXAvbGliL21peGlucy9kZWNvcmF0aW9uLW1hbmFnZW1lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgTWl4aW4gZnJvbSAnbWl4dG8nXG5sZXQgXywgcGF0aCwgRW1pdHRlciwgRGVjb3JhdGlvblxuXG4vKipcbiAqIFRoZSBtaXhpbiB0aGF0IHByb3ZpZGVzIHRoZSBkZWNvcmF0aW9ucyBBUEkgdG8gdGhlIG1pbmltYXAgZWRpdG9yXG4gKiB2aWV3LlxuICpcbiAqIFRoaXMgbWl4aW4gaXMgaW5qZWN0ZWQgaW50byB0aGUgYE1pbmltYXBgIHByb3RvdHlwZSwgc28gZXZlcnkgbWV0aG9kcyBkZWZpbmVkXG4gKiBpbiB0aGlzIGZpbGUgd2lsbCBiZSBhdmFpbGFibGUgb24gYW55IGBNaW5pbWFwYCBpbnN0YW5jZS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGVjb3JhdGlvbk1hbmFnZW1lbnQgZXh0ZW5kcyBNaXhpbiB7XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBkZWNvcmF0aW9ucyByZWxhdGVkIHByb3BlcnRpZXMuXG4gICAqL1xuICBpbml0aWFsaXplRGVjb3JhdGlvbnMgKCkge1xuICAgIGlmICh0aGlzLmVtaXR0ZXIgPT0gbnVsbCkge1xuICAgICAgaWYgKCFFbWl0dGVyKSB7IEVtaXR0ZXIgPSByZXF1aXJlKCdhdG9tJykuRW1pdHRlciB9XG5cbiAgICAgIC8qKlxuICAgICAgICogVGhlIG1pbmltYXAgZW1pdHRlciwgbGF6aWx5IGNyZWF0ZWQgaWYgbm90IGNyZWF0ZWQgeWV0LlxuICAgICAgICogQHR5cGUge0VtaXR0ZXJ9XG4gICAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgICAqL1xuICAgICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEEgbWFwIHdpdGggdGhlIGRlY29yYXRpb24gaWQgYXMga2V5IGFuZCB0aGUgZGVjb3JhdGlvbiBhcyB2YWx1ZS5cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuZGVjb3JhdGlvbnNCeUlkID0ge31cbiAgICAvKipcbiAgICAgKiBUaGUgZGVjb3JhdGlvbnMgc3RvcmVkIGluIGFuIGFycmF5IGluZGV4ZWQgd2l0aCB0aGVpciBtYXJrZXIgaWQuXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLmRlY29yYXRpb25zQnlNYXJrZXJJZCA9IHt9XG4gICAgLyoqXG4gICAgICogVGhlIHN1YnNjcmlwdGlvbnMgdG8gdGhlIG1hcmtlcnMgYGRpZC1jaGFuZ2VgIGV2ZW50IGluZGV4ZWQgdXNpbmcgdGhlXG4gICAgICogbWFya2VyIGlkLlxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5kZWNvcmF0aW9uTWFya2VyQ2hhbmdlZFN1YnNjcmlwdGlvbnMgPSB7fVxuICAgIC8qKlxuICAgICAqIFRoZSBzdWJzY3JpcHRpb25zIHRvIHRoZSBtYXJrZXJzIGBkaWQtZGVzdHJveWAgZXZlbnQgaW5kZXhlZCB1c2luZyB0aGVcbiAgICAgKiBtYXJrZXIgaWQuXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLmRlY29yYXRpb25NYXJrZXJEZXN0cm95ZWRTdWJzY3JpcHRpb25zID0ge31cbiAgICAvKipcbiAgICAgKiBUaGUgc3Vic2NyaXB0aW9ucyB0byB0aGUgZGVjb3JhdGlvbnMgYGRpZC1jaGFuZ2UtcHJvcGVydGllc2AgZXZlbnRcbiAgICAgKiBpbmRleGVkIHVzaW5nIHRoZSBkZWNvcmF0aW9uIGlkLlxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICogQGFjY2VzcyBwcml2YXRlXG4gICAgICovXG4gICAgdGhpcy5kZWNvcmF0aW9uVXBkYXRlZFN1YnNjcmlwdGlvbnMgPSB7fVxuICAgIC8qKlxuICAgICAqIFRoZSBzdWJzY3JpcHRpb25zIHRvIHRoZSBkZWNvcmF0aW9ucyBgZGlkLWRlc3Ryb3lgIGV2ZW50IGluZGV4ZWQgdXNpbmdcbiAgICAgKiB0aGUgZGVjb3JhdGlvbiBpZC5cbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgICAqL1xuICAgIHRoaXMuZGVjb3JhdGlvbkRlc3Ryb3llZFN1YnNjcmlwdGlvbnMgPSB7fVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYWxsIHRoZSBkZWNvcmF0aW9ucyByZWdpc3RlcmVkIGluIHRoZSBjdXJyZW50IGBNaW5pbWFwYC5cbiAgICpcbiAgICogQHJldHVybiB7QXJyYXk8RGVjb3JhdGlvbj59IGFsbCB0aGUgZGVjb3JhdGlvbnMgaW4gdGhpcyBgTWluaW1hcGBcbiAgICovXG4gIGdldERlY29yYXRpb25zICgpIHtcbiAgICBsZXQgZGVjb3JhdGlvbnMgPSB0aGlzLmRlY29yYXRpb25zQnlJZFxuICAgIGxldCByZXN1bHRzID0gW11cblxuICAgIGZvciAobGV0IGlkIGluIGRlY29yYXRpb25zKSB7IHJlc3VsdHMucHVzaChkZWNvcmF0aW9uc1tpZF0pIH1cblxuICAgIHJldHVybiByZXN1bHRzXG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGFuIGV2ZW50IGxpc3RlbmVyIHRvIHRoZSBgZGlkLWFkZC1kZWNvcmF0aW9uYCBldmVudC5cbiAgICpcbiAgICogQHBhcmFtICB7ZnVuY3Rpb24oZXZlbnQ6T2JqZWN0KTp2b2lkfSBjYWxsYmFjayBhIGZ1bmN0aW9uIHRvIGNhbGwgd2hlbiB0aGVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50IGlzIHRyaWdnZXJlZC5cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBjYWxsYmFjayB3aWxsIGJlIGNhbGxlZFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2l0aCBhbiBldmVudCBvYmplY3Qgd2l0aFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICAgKiAtIG1hcmtlcjogdGhlIG1hcmtlciBvYmplY3QgdGhhdCB3YXMgZGVjb3JhdGVkXG4gICAqIC0gZGVjb3JhdGlvbjogdGhlIGRlY29yYXRpb24gb2JqZWN0IHRoYXQgd2FzIGNyZWF0ZWRcbiAgICogQHJldHVybiB7RGlzcG9zYWJsZX0gYSBkaXNwb3NhYmxlIHRvIHN0b3AgbGlzdGVuaW5nIHRvIHRoZSBldmVudFxuICAgKi9cbiAgb25EaWRBZGREZWNvcmF0aW9uIChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1hZGQtZGVjb3JhdGlvbicsIGNhbGxiYWNrKVxuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhbiBldmVudCBsaXN0ZW5lciB0byB0aGUgYGRpZC1yZW1vdmUtZGVjb3JhdGlvbmAgZXZlbnQuXG4gICAqXG4gICAqIEBwYXJhbSAge2Z1bmN0aW9uKGV2ZW50Ok9iamVjdCk6dm9pZH0gY2FsbGJhY2sgYSBmdW5jdGlvbiB0byBjYWxsIHdoZW4gdGhlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudCBpcyB0cmlnZ2VyZWQuXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWRcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpdGggYW4gZXZlbnQgb2JqZWN0IHdpdGhcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAgICogLSBtYXJrZXI6IHRoZSBtYXJrZXIgb2JqZWN0IHRoYXQgd2FzIGRlY29yYXRlZFxuICAgKiAtIGRlY29yYXRpb246IHRoZSBkZWNvcmF0aW9uIG9iamVjdCB0aGF0IHdhcyBjcmVhdGVkXG4gICAqIEByZXR1cm4ge0Rpc3Bvc2FibGV9IGEgZGlzcG9zYWJsZSB0byBzdG9wIGxpc3RlbmluZyB0byB0aGUgZXZlbnRcbiAgICovXG4gIG9uRGlkUmVtb3ZlRGVjb3JhdGlvbiAoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtcmVtb3ZlLWRlY29yYXRpb24nLCBjYWxsYmFjaylcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYW4gZXZlbnQgbGlzdGVuZXIgdG8gdGhlIGBkaWQtY2hhbmdlLWRlY29yYXRpb25gIGV2ZW50LlxuICAgKlxuICAgKiBUaGlzIGV2ZW50IGlzIHRyaWdnZXJlZCB3aGVuIHRoZSBtYXJrZXIgdGFyZ2V0ZWQgYnkgdGhlIGRlY29yYXRpb25cbiAgICogd2FzIGNoYW5nZWQuXG4gICAqXG4gICAqIEBwYXJhbSAge2Z1bmN0aW9uKGV2ZW50Ok9iamVjdCk6dm9pZH0gY2FsbGJhY2sgYSBmdW5jdGlvbiB0byBjYWxsIHdoZW4gdGhlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudCBpcyB0cmlnZ2VyZWQuXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWRcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpdGggYW4gZXZlbnQgb2JqZWN0IHdpdGhcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAgICogLSBtYXJrZXI6IHRoZSBtYXJrZXIgb2JqZWN0IHRoYXQgd2FzIGRlY29yYXRlZFxuICAgKiAtIGRlY29yYXRpb246IHRoZSBkZWNvcmF0aW9uIG9iamVjdCB0aGF0IHdhcyBjcmVhdGVkXG4gICAqIEByZXR1cm4ge0Rpc3Bvc2FibGV9IGEgZGlzcG9zYWJsZSB0byBzdG9wIGxpc3RlbmluZyB0byB0aGUgZXZlbnRcbiAgICovXG4gIG9uRGlkQ2hhbmdlRGVjb3JhdGlvbiAoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtY2hhbmdlLWRlY29yYXRpb24nLCBjYWxsYmFjaylcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgYW4gZXZlbnQgbGlzdGVuZXIgdG8gdGhlIGBkaWQtY2hhbmdlLWRlY29yYXRpb24tcmFuZ2VgIGV2ZW50LlxuICAgKlxuICAgKiBUaGlzIGV2ZW50IGlzIHRyaWdnZXJlZCB3aGVuIHRoZSBtYXJrZXIgcmFuZ2UgdGFyZ2V0ZWQgYnkgdGhlIGRlY29yYXRpb25cbiAgICogd2FzIGNoYW5nZWQuXG4gICAqXG4gICAqIEBwYXJhbSAge2Z1bmN0aW9uKGV2ZW50Ok9iamVjdCk6dm9pZH0gY2FsbGJhY2sgYSBmdW5jdGlvbiB0byBjYWxsIHdoZW4gdGhlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudCBpcyB0cmlnZ2VyZWQuXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgY2FsbGJhY2sgd2lsbCBiZSBjYWxsZWRcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpdGggYW4gZXZlbnQgb2JqZWN0IHdpdGhcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAgICogLSBtYXJrZXI6IHRoZSBtYXJrZXIgb2JqZWN0IHRoYXQgd2FzIGRlY29yYXRlZFxuICAgKiAtIGRlY29yYXRpb246IHRoZSBkZWNvcmF0aW9uIG9iamVjdCB0aGF0IHdhcyBjcmVhdGVkXG4gICAqIEByZXR1cm4ge0Rpc3Bvc2FibGV9IGEgZGlzcG9zYWJsZSB0byBzdG9wIGxpc3RlbmluZyB0byB0aGUgZXZlbnRcbiAgICovXG4gIG9uRGlkQ2hhbmdlRGVjb3JhdGlvblJhbmdlIChjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1jaGFuZ2UtZGVjb3JhdGlvbi1yYW5nZScsIGNhbGxiYWNrKVxuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhbiBldmVudCBsaXN0ZW5lciB0byB0aGUgYGRpZC11cGRhdGUtZGVjb3JhdGlvbmAgZXZlbnQuXG4gICAqXG4gICAqIFRoaXMgZXZlbnQgaXMgdHJpZ2dlcmVkIHdoZW4gdGhlIGRlY29yYXRpb24gaXRzZWxmIGlzIG1vZGlmaWVkLlxuICAgKlxuICAgKiBAcGFyYW0gIHtmdW5jdGlvbihkZWNvcmF0aW9uOkRlY29yYXRpb24pOnZvaWR9IGNhbGxiYWNrIGEgZnVuY3Rpb24gdG8gY2FsbFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gdGhlIGV2ZW50IGlzXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJpZ2dlcmVkXG4gICAqIEByZXR1cm4ge0Rpc3Bvc2FibGV9IGEgZGlzcG9zYWJsZSB0byBzdG9wIGxpc3RlbmluZyB0byB0aGUgZXZlbnRcbiAgICovXG4gIG9uRGlkVXBkYXRlRGVjb3JhdGlvbiAoY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtdXBkYXRlLWRlY29yYXRpb24nLCBjYWxsYmFjaylcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBkZWNvcmF0aW9uIHdpdGggdGhlIHBhc3NlZC1pbiBpZC5cbiAgICpcbiAgICogQHBhcmFtICB7bnVtYmVyfSBpZCB0aGUgZGVjb3JhdGlvbiBpZFxuICAgKiBAcmV0dXJuIHtEZWNvcmF0aW9ufSB0aGUgZGVjb3JhdGlvbiB3aXRoIHRoZSBnaXZlbiBpZFxuICAgKi9cbiAgZGVjb3JhdGlvbkZvcklkIChpZCkge1xuICAgIHJldHVybiB0aGlzLmRlY29yYXRpb25zQnlJZFtpZF1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFsbCB0aGUgZGVjb3JhdGlvbnMgdGhhdCBpbnRlcnNlY3QgdGhlIHBhc3NlZC1pbiByb3cgcmFuZ2UuXG4gICAqXG4gICAqIEBwYXJhbSAge251bWJlcn0gc3RhcnRTY3JlZW5Sb3cgdGhlIGZpcnN0IHJvdyBvZiB0aGUgcmFuZ2VcbiAgICogQHBhcmFtICB7bnVtYmVyfSBlbmRTY3JlZW5Sb3cgdGhlIGxhc3Qgcm93IG9mIHRoZSByYW5nZVxuICAgKiBAcmV0dXJuIHtBcnJheTxEZWNvcmF0aW9uPn0gdGhlIGRlY29yYXRpb25zIHRoYXQgaW50ZXJzZWN0IHRoZSBwYXNzZWQtaW5cbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJhbmdlXG4gICAqL1xuICBkZWNvcmF0aW9uc0ZvclNjcmVlblJvd1JhbmdlIChzdGFydFNjcmVlblJvdywgZW5kU2NyZWVuUm93KSB7XG4gICAgbGV0IGRlY29yYXRpb25zQnlNYXJrZXJJZCA9IHt9XG4gICAgbGV0IG1hcmtlcnMgPSB0aGlzLmZpbmRNYXJrZXJzKHtcbiAgICAgIGludGVyc2VjdHNTY3JlZW5Sb3dSYW5nZTogW3N0YXJ0U2NyZWVuUm93LCBlbmRTY3JlZW5Sb3ddXG4gICAgfSlcblxuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBtYXJrZXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBsZXQgbWFya2VyID0gbWFya2Vyc1tpXVxuICAgICAgbGV0IGRlY29yYXRpb25zID0gdGhpcy5kZWNvcmF0aW9uc0J5TWFya2VySWRbbWFya2VyLmlkXVxuXG4gICAgICBpZiAoZGVjb3JhdGlvbnMgIT0gbnVsbCkge1xuICAgICAgICBkZWNvcmF0aW9uc0J5TWFya2VySWRbbWFya2VyLmlkXSA9IGRlY29yYXRpb25zXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlY29yYXRpb25zQnlNYXJrZXJJZFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGRlY29yYXRpb25zIHRoYXQgaW50ZXJzZWN0cyB0aGUgcGFzc2VkLWluIHJvdyByYW5nZVxuICAgKiBpbiBhIHN0cnVjdHVyZWQgd2F5LlxuICAgKlxuICAgKiBBdCB0aGUgZmlyc3QgbGV2ZWwsIHRoZSBrZXlzIGFyZSB0aGUgYXZhaWxhYmxlIGRlY29yYXRpb24gdHlwZXMuXG4gICAqIEF0IHRoZSBzZWNvbmQgbGV2ZWwsIHRoZSBrZXlzIGFyZSB0aGUgcm93IGluZGV4IGZvciB3aGljaCB0aGVyZVxuICAgKiBhcmUgZGVjb3JhdGlvbnMgYXZhaWxhYmxlLiBUaGUgdmFsdWUgaXMgYW4gYXJyYXkgY29udGFpbmluZyB0aGVcbiAgICogZGVjb3JhdGlvbnMgdGhhdCBpbnRlcnNlY3RzIHdpdGggdGhlIGNvcnJlc3BvbmRpbmcgcm93LlxuICAgKlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IHRoZSBkZWNvcmF0aW9ucyBncm91cGVkIGJ5IHR5cGUgYW5kIHRoZW4gcm93c1xuICAgKiBAcHJvcGVydHkge09iamVjdH0gbGluZSBhbGwgdGhlIGxpbmUgZGVjb3JhdGlvbnMgYnkgcm93XG4gICAqIEBwcm9wZXJ0eSB7QXJyYXk8RGVjb3JhdGlvbj59IGxpbmVbcm93XSBhbGwgdGhlIGxpbmUgZGVjb3JhdGlvbnNcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdCBhIGdpdmVuIHJvd1xuICAgKiBAcHJvcGVydHkge09iamVjdH0gaGlnaGxpZ2h0LXVuZGVyIGFsbCB0aGUgaGlnaGxpZ2h0LXVuZGVyIGRlY29yYXRpb25zXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnkgcm93XG4gICAqIEBwcm9wZXJ0eSB7QXJyYXk8RGVjb3JhdGlvbj59IGhpZ2hsaWdodC11bmRlcltyb3ddIGFsbCB0aGUgaGlnaGxpZ2h0LXVuZGVyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVjb3JhdGlvbnMgYXQgYSBnaXZlbiByb3dcbiAgICogQHByb3BlcnR5IHtPYmplY3R9IGhpZ2hsaWdodC1vdmVyIGFsbCB0aGUgaGlnaGxpZ2h0LW92ZXIgZGVjb3JhdGlvbnNcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBieSByb3dcbiAgICogQHByb3BlcnR5IHtBcnJheTxEZWNvcmF0aW9uPn0gaGlnaGxpZ2h0LW92ZXJbcm93XSBhbGwgdGhlIGhpZ2hsaWdodC1vdmVyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVjb3JhdGlvbnMgYXQgYSBnaXZlbiByb3dcbiAgICogQHByb3BlcnR5IHtPYmplY3R9IGhpZ2hsaWdodC1vdXRpbmUgYWxsIHRoZSBoaWdobGlnaHQtb3V0aW5lIGRlY29yYXRpb25zXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnkgcm93XG4gICAqIEBwcm9wZXJ0eSB7QXJyYXk8RGVjb3JhdGlvbj59IGhpZ2hsaWdodC1vdXRpbmVbcm93XSBhbGwgdGhlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGlnaGxpZ2h0LW91dGluZSBkZWNvcmF0aW9ucyBhdCBhIGdpdmVuXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm93XG4gICAqL1xuICBkZWNvcmF0aW9uc0J5VHlwZVRoZW5Sb3dzICgpIHtcbiAgICBpZiAodGhpcy5kZWNvcmF0aW9uc0J5VHlwZVRoZW5Sb3dzQ2FjaGUgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuZGVjb3JhdGlvbnNCeVR5cGVUaGVuUm93c0NhY2hlXG4gICAgfVxuXG4gICAgbGV0IGNhY2hlID0ge31cbiAgICBmb3IgKGxldCBpZCBpbiB0aGlzLmRlY29yYXRpb25zQnlJZCkge1xuICAgICAgbGV0IGRlY29yYXRpb24gPSB0aGlzLmRlY29yYXRpb25zQnlJZFtpZF1cbiAgICAgIGxldCByYW5nZSA9IGRlY29yYXRpb24ubWFya2VyLmdldFNjcmVlblJhbmdlKClcbiAgICAgIGxldCB0eXBlID0gZGVjb3JhdGlvbi5nZXRQcm9wZXJ0aWVzKCkudHlwZVxuXG4gICAgICBpZiAoY2FjaGVbdHlwZV0gPT0gbnVsbCkgeyBjYWNoZVt0eXBlXSA9IHt9IH1cblxuICAgICAgZm9yIChsZXQgcm93ID0gcmFuZ2Uuc3RhcnQucm93LCBsZW4gPSByYW5nZS5lbmQucm93OyByb3cgPD0gbGVuOyByb3crKykge1xuICAgICAgICBpZiAoY2FjaGVbdHlwZV1bcm93XSA9PSBudWxsKSB7IGNhY2hlW3R5cGVdW3Jvd10gPSBbXSB9XG5cbiAgICAgICAgY2FjaGVbdHlwZV1bcm93XS5wdXNoKGRlY29yYXRpb24pXG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGdyb3VwZWQgZGVjb3JhdGlvbnMgY2FjaGUuXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICAgKi9cbiAgICB0aGlzLmRlY29yYXRpb25zQnlUeXBlVGhlblJvd3NDYWNoZSA9IGNhY2hlXG4gICAgcmV0dXJuIGNhY2hlXG4gIH1cblxuICAvKipcbiAgICogSW52YWxpZGF0ZXMgdGhlIGRlY29yYXRpb24gYnkgc2NyZWVuIHJvd3MgY2FjaGUuXG4gICAqL1xuICBpbnZhbGlkYXRlRGVjb3JhdGlvbkZvclNjcmVlblJvd3NDYWNoZSAoKSB7XG4gICAgdGhpcy5kZWNvcmF0aW9uc0J5VHlwZVRoZW5Sb3dzQ2FjaGUgPSBudWxsXG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIGRlY29yYXRpb24gdGhhdCB0cmFja3MgYSBgTWFya2VyYC4gV2hlbiB0aGUgbWFya2VyIG1vdmVzLFxuICAgKiBpcyBpbnZhbGlkYXRlZCwgb3IgaXMgZGVzdHJveWVkLCB0aGUgZGVjb3JhdGlvbiB3aWxsIGJlIHVwZGF0ZWQgdG8gcmVmbGVjdFxuICAgKiB0aGUgbWFya2VyJ3Mgc3RhdGUuXG4gICAqXG4gICAqIEBwYXJhbSAge01hcmtlcn0gbWFya2VyIHRoZSBtYXJrZXIgeW91IHdhbnQgdGhpcyBkZWNvcmF0aW9uIHRvIGZvbGxvd1xuICAgKiBAcGFyYW0gIHtPYmplY3R9IGRlY29yYXRpb25QYXJhbXMgdGhlIGRlY29yYXRpb24gcHJvcGVydGllc1xuICAgKiBAcGFyYW0gIHtzdHJpbmd9IGRlY29yYXRpb25QYXJhbXMudHlwZSB0aGUgZGVjb3JhdGlvbiB0eXBlIGluIHRoZSBmb2xsb3dpbmdcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGlzdDpcbiAgICogLSBfX2xpbmVfXzogRmlsbHMgdGhlIGxpbmUgYmFja2dyb3VuZCB3aXRoIHRoZSBkZWNvcmF0aW9uIGNvbG9yLlxuICAgKiAtIF9faGlnaGxpZ2h0X186IFJlbmRlcnMgYSBjb2xvcmVkIHJlY3RhbmdsZSBvbiB0aGUgbWluaW1hcC4gVGhlIGhpZ2hsaWdodFxuICAgKiAgIGlzIHJlbmRlcmVkIGFib3ZlIHRoZSBsaW5lJ3MgdGV4dC5cbiAgICogLSBfX2hpZ2hsaWdodC1vdmVyX186IFNhbWUgYXMgX19oaWdobGlnaHRfXy5cbiAgICogLSBfX2hpZ2hsaWdodC11bmRlcl9fOiBSZW5kZXJzIGEgY29sb3JlZCByZWN0YW5nbGUgb24gdGhlIG1pbmltYXAuIFRoZVxuICAgKiAgIGhpZ2hsaWdodCBpcyByZW5kZXJlZCBiZWxvdyB0aGUgbGluZSdzIHRleHQuXG4gICAqIC0gX19oaWdobGlnaHQtb3V0bGluZV9fOiBSZW5kZXJzIGEgY29sb3JlZCBvdXRsaW5lIG9uIHRoZSBtaW5pbWFwLiBUaGVcbiAgICogICBoaWdobGlnaHQgYm94IGlzIHJlbmRlcmVkIGFib3ZlIHRoZSBsaW5lJ3MgdGV4dC5cbiAgICogLSBfX2ZvcmVncm91bmQtY3VzdG9tX186IEEgZGVjb3JhdGlvbiB0eXBlIGZvciB3aGljaCB5b3UgaGF2ZSB0aGUgY29udHJvbFxuICAgKiAgIG92ZXIgdGhlIHJlbmRlciByb3V0aW5lLiBOb3RlIHRoYXQgeW91ciByb3V0aW5lIHNob3VsZCBpbXBsZW1lbnQgYSByZW5kZXJcbiAgICogICBvbiBhIHBlci1saW5lIGJhc2lzIHRvIGF2b2lkIGFueSBzaWRlLWVmZmVjdCB3aXRoIHRoZSBvZmZzZXQgYml0bWFwIGNhY2hlXG4gICAqICAgbWVjaGFuaXNtLiBUaGVzZSBkZWNvcmF0aW9ucyBhcmUgcmVuZHJlZCBvbiB0aGUgZm9yZWdyb3VuZCBkZWNvcmF0aW9uc1xuICAgKiAgIGxheWVyLlxuICAgKiAtIF9fYmFja2dyb3VuZC1jdXN0b21fXzogQSBkZWNvcmF0aW9uIHR5cGUgZm9yIHdoaWNoIHlvdSBoYXZlIHRoZSBjb250cm9sXG4gICAqICAgb3ZlciB0aGUgcmVuZGVyIHJvdXRpbmUuIE5vdGUgdGhhdCB5b3VyIHJvdXRpbmUgc2hvdWxkIGltcGxlbWVudCBhIHJlbmRlclxuICAgKiAgIG9uIGEgcGVyLWxpbmUgYmFzaXMgdG8gYXZvaWQgYW55IHNpZGUtZWZmZWN0IHdpdGggdGhlIG9mZnNldCBiaXRtYXAgY2FjaGVcbiAgICogICBtZWNoYW5pc20uIFRoZXNlIGRlY29yYXRpb25zIGFyZSByZW5kcmVkIG9uIHRoZSBiYWNrZ3JvdW5kIGRlY29yYXRpb25zXG4gICAqICAgbGF5ZXIuXG4gICAqIEBwYXJhbSAge3N0cmluZ30gW2RlY29yYXRpb25QYXJhbXMuY2xhc3NdIHRoZSBDU1MgY2xhc3MgdG8gdXNlIHRvIHJldHJpZXZlXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBiYWNrZ3JvdW5kIGNvbG9yIG9mIHRoZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWNvcmF0aW9uIGJ5IGJ1aWxkaW5nIGEgc2NvcFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3JyZXNwb25kaW5nIHRvXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAubWluaW1hcCAuZWRpdG9yIDx5b3VyLWNsYXNzPmBcbiAgICogQHBhcmFtICB7c3RyaW5nfSBbZGVjb3JhdGlvblBhcmFtcy5zY29wZV0gdGhlIHNjb3BlIHRvIHVzZSB0byByZXRyaWV2ZSB0aGVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVjb3JhdGlvbiBiYWNrZ3JvdW5kLiBOb3RlIHRoYXQgaWZcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIGBzY29wZWAgcHJvcGVydHkgaXMgc2V0LCB0aGVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYGNsYXNzYCB3b24ndCBiZSB1c2VkLlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IFtkZWNvcmF0aW9uUGFyYW1zLmNvbG9yXSB0aGUgQ1NTIGNvbG9yIHRvIHVzZSB0byByZW5kZXJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIGRlY29yYXRpb24uIFdoZW4gc2V0LCBuZWl0aGVyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBzY29wZWAgbm9yIGBjbGFzc2AgYXJlIHVzZWQuXG4gICAqIEBwYXJhbSAge3N0cmluZ30gW2RlY29yYXRpb25QYXJhbXMucGx1Z2luXSB0aGUgbmFtZSBvZiB0aGUgcGx1Z2luIHRoYXRcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZWQgdGhpcyBkZWNvcmF0aW9uLiBJdCdsbFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmUgdXNlZCB0byBvcmRlciB0aGUgZGVjb3JhdGlvbnNcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uIHRoZSBzYW1lIGxheWVyIGFuZCB0aGF0IGFyZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3ZlcmxhcHBpbmcuIElmIHRoZSBwYXJhbWV0ZXIgaXNcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9taXR0ZWQgdGhlIE1pbmltYXAgd2lsbCBhdHRlbXB0XG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0byBpbmZlciB0aGUgcGx1Z2luIG9yaWdpbiBmcm9tXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgcGF0aCBvZiB0aGUgY2FsbGVyIGZ1bmN0aW9uLlxuICAgKiBAcGFyYW0gIHtmdW5jdGlvbn0gW2RlY29yYXRpb25QYXJhbXMucmVuZGVyXSB0aGUgcmVuZGVyIHJvdXRpbmUgZm9yIGN1c3RvbVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWNvcmF0aW9ucy4gVGhlIGZ1bmN0aW9uXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY2VpdmVzIHRoZSBkZWNvcmF0aW9uIGFuZFxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgcmVuZGVyIGRhdGEgZm9yIHRoZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50IHJlbmRlciBwYXNzLlxuICAgKiBAcmV0dXJuIHtEZWNvcmF0aW9ufSB0aGUgY3JlYXRlZCBkZWNvcmF0aW9uXG4gICAqIEBlbWl0cyAge2RpZC1hZGQtZGVjb3JhdGlvbn0gd2hlbiB0aGUgZGVjb3JhdGlvbiBpcyBjcmVhdGVkIHN1Y2Nlc3NmdWxseVxuICAgKiBAZW1pdHMgIHtkaWQtY2hhbmdlfSB3aGVuIHRoZSBkZWNvcmF0aW9uIGlzIGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5XG4gICAqL1xuICBkZWNvcmF0ZU1hcmtlciAobWFya2VyLCBkZWNvcmF0aW9uUGFyYW1zKSB7XG4gICAgaWYgKHRoaXMuZGVzdHJveWVkIHx8IG1hcmtlciA9PSBudWxsKSB7IHJldHVybiB9XG5cbiAgICBpZiAoIURlY29yYXRpb24pIHsgRGVjb3JhdGlvbiA9IHJlcXVpcmUoJy4uL2RlY29yYXRpb24nKSB9XG5cbiAgICBsZXQge2lkfSA9IG1hcmtlclxuXG4gICAgaWYgKGRlY29yYXRpb25QYXJhbXMudHlwZSA9PT0gJ2hpZ2hsaWdodCcpIHtcbiAgICAgIGRlY29yYXRpb25QYXJhbXMudHlwZSA9ICdoaWdobGlnaHQtb3ZlcidcbiAgICB9XG5cbiAgICBjb25zdCB7dHlwZSwgcGx1Z2lufSA9IGRlY29yYXRpb25QYXJhbXNcblxuICAgIGlmIChwbHVnaW4gPT0gbnVsbCkge1xuICAgICAgZGVjb3JhdGlvblBhcmFtcy5wbHVnaW4gPSB0aGlzLmdldE9yaWdpbmF0b3JQYWNrYWdlTmFtZSgpXG4gICAgfVxuXG4gICAgaWYgKGRlY29yYXRpb25QYXJhbXMuc2NvcGUgPT0gbnVsbCAmJiBkZWNvcmF0aW9uUGFyYW1zWydjbGFzcyddICE9IG51bGwpIHtcbiAgICAgIGxldCBjbHMgPSBkZWNvcmF0aW9uUGFyYW1zWydjbGFzcyddLnNwbGl0KCcgJykuam9pbignLicpXG4gICAgICBkZWNvcmF0aW9uUGFyYW1zLnNjb3BlID0gYC5taW5pbWFwIC4ke2Nsc31gXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZGVjb3JhdGlvbk1hcmtlckRlc3Ryb3llZFN1YnNjcmlwdGlvbnNbaWRdID09IG51bGwpIHtcbiAgICAgIHRoaXMuZGVjb3JhdGlvbk1hcmtlckRlc3Ryb3llZFN1YnNjcmlwdGlvbnNbaWRdID1cbiAgICAgIG1hcmtlci5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgICB0aGlzLnJlbW92ZUFsbERlY29yYXRpb25zRm9yTWFya2VyKG1hcmtlcilcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZGVjb3JhdGlvbk1hcmtlckNoYW5nZWRTdWJzY3JpcHRpb25zW2lkXSA9PSBudWxsKSB7XG4gICAgICB0aGlzLmRlY29yYXRpb25NYXJrZXJDaGFuZ2VkU3Vic2NyaXB0aW9uc1tpZF0gPVxuICAgICAgbWFya2VyLm9uRGlkQ2hhbmdlKChldmVudCkgPT4ge1xuICAgICAgICBsZXQgZGVjb3JhdGlvbnMgPSB0aGlzLmRlY29yYXRpb25zQnlNYXJrZXJJZFtpZF1cblxuICAgICAgICB0aGlzLmludmFsaWRhdGVEZWNvcmF0aW9uRm9yU2NyZWVuUm93c0NhY2hlKClcblxuICAgICAgICBpZiAoZGVjb3JhdGlvbnMgIT0gbnVsbCkge1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBkZWNvcmF0aW9ucy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgbGV0IGRlY29yYXRpb24gPSBkZWNvcmF0aW9uc1tpXVxuICAgICAgICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1jaGFuZ2UtZGVjb3JhdGlvbicsIHtcbiAgICAgICAgICAgICAgbWFya2VyOiBtYXJrZXIsXG4gICAgICAgICAgICAgIGRlY29yYXRpb246IGRlY29yYXRpb24sXG4gICAgICAgICAgICAgIGV2ZW50OiBldmVudFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGV0IG9sZFN0YXJ0ID0gZXZlbnQub2xkVGFpbFNjcmVlblBvc2l0aW9uXG4gICAgICAgIGxldCBvbGRFbmQgPSBldmVudC5vbGRIZWFkU2NyZWVuUG9zaXRpb25cbiAgICAgICAgbGV0IG5ld1N0YXJ0ID0gZXZlbnQubmV3VGFpbFNjcmVlblBvc2l0aW9uXG4gICAgICAgIGxldCBuZXdFbmQgPSBldmVudC5uZXdIZWFkU2NyZWVuUG9zaXRpb25cblxuICAgICAgICBpZiAob2xkU3RhcnQucm93ID4gb2xkRW5kLnJvdykge1xuICAgICAgICAgIFtvbGRTdGFydCwgb2xkRW5kXSA9IFtvbGRFbmQsIG9sZFN0YXJ0XVxuICAgICAgICB9XG4gICAgICAgIGlmIChuZXdTdGFydC5yb3cgPiBuZXdFbmQucm93KSB7XG4gICAgICAgICAgW25ld1N0YXJ0LCBuZXdFbmRdID0gW25ld0VuZCwgbmV3U3RhcnRdXG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcmFuZ2VzRGlmZnMgPSB0aGlzLmNvbXB1dGVSYW5nZXNEaWZmcyhcbiAgICAgICAgICBvbGRTdGFydCwgb2xkRW5kLFxuICAgICAgICAgIG5ld1N0YXJ0LCBuZXdFbmRcbiAgICAgICAgKVxuXG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSByYW5nZXNEaWZmcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgIGxldCBbc3RhcnQsIGVuZF0gPSByYW5nZXNEaWZmc1tpXVxuICAgICAgICAgIHRoaXMuZW1pdFJhbmdlQ2hhbmdlcyh0eXBlLCB7XG4gICAgICAgICAgICBzdGFydDogc3RhcnQsXG4gICAgICAgICAgICBlbmQ6IGVuZFxuICAgICAgICAgIH0sIDApXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgbGV0IGRlY29yYXRpb24gPSBuZXcgRGVjb3JhdGlvbihtYXJrZXIsIHRoaXMsIGRlY29yYXRpb25QYXJhbXMpXG5cbiAgICBpZiAodGhpcy5kZWNvcmF0aW9uc0J5TWFya2VySWRbaWRdID09IG51bGwpIHtcbiAgICAgIHRoaXMuZGVjb3JhdGlvbnNCeU1hcmtlcklkW2lkXSA9IFtdXG4gICAgfVxuXG4gICAgdGhpcy5kZWNvcmF0aW9uc0J5TWFya2VySWRbaWRdLnB1c2goZGVjb3JhdGlvbilcbiAgICB0aGlzLmRlY29yYXRpb25zQnlJZFtkZWNvcmF0aW9uLmlkXSA9IGRlY29yYXRpb25cblxuICAgIGlmICh0aGlzLmRlY29yYXRpb25VcGRhdGVkU3Vic2NyaXB0aW9uc1tkZWNvcmF0aW9uLmlkXSA9PSBudWxsKSB7XG4gICAgICB0aGlzLmRlY29yYXRpb25VcGRhdGVkU3Vic2NyaXB0aW9uc1tkZWNvcmF0aW9uLmlkXSA9XG4gICAgICBkZWNvcmF0aW9uLm9uRGlkQ2hhbmdlUHJvcGVydGllcygoZXZlbnQpID0+IHtcbiAgICAgICAgdGhpcy5lbWl0RGVjb3JhdGlvbkNoYW5nZXModHlwZSwgZGVjb3JhdGlvbilcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgdGhpcy5kZWNvcmF0aW9uRGVzdHJveWVkU3Vic2NyaXB0aW9uc1tkZWNvcmF0aW9uLmlkXSA9XG4gICAgZGVjb3JhdGlvbi5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgdGhpcy5yZW1vdmVEZWNvcmF0aW9uKGRlY29yYXRpb24pXG4gICAgfSlcblxuICAgIHRoaXMuZW1pdERlY29yYXRpb25DaGFuZ2VzKHR5cGUsIGRlY29yYXRpb24pXG4gICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC1hZGQtZGVjb3JhdGlvbicsIHtcbiAgICAgIG1hcmtlcjogbWFya2VyLFxuICAgICAgZGVjb3JhdGlvbjogZGVjb3JhdGlvblxuICAgIH0pXG5cbiAgICByZXR1cm4gZGVjb3JhdGlvblxuICB9XG5cbiAgZ2V0T3JpZ2luYXRvclBhY2thZ2VOYW1lICgpIHtcbiAgICBpZiAoIV8pIHsgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUtcGx1cycpIH1cbiAgICBpZiAoIXBhdGgpIHsgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKSB9XG5cbiAgICBjb25zdCBsaW5lID0gbmV3IEVycm9yKCkuc3RhY2suc3BsaXQoJ1xcbicpWzNdXG4gICAgY29uc3QgZmlsZVBhdGggPSBsaW5lLnNwbGl0KCcoJylbMV0ucmVwbGFjZSgnKScsICcnKVxuICAgIGNvbnN0IHJlID0gbmV3IFJlZ0V4cChcbiAgICAgIGF0b20ucGFja2FnZXMuZ2V0UGFja2FnZURpclBhdGhzKCkuam9pbignfCcpICsgXy5lc2NhcGVSZWdFeHAocGF0aC5zZXApXG4gICAgKVxuICAgIGNvbnN0IHBsdWdpbiA9IGZpbGVQYXRoLnJlcGxhY2UocmUsICcnKS5zcGxpdChwYXRoLnNlcClbMF0ucmVwbGFjZSgvbWluaW1hcC18LW1pbmltYXAvLCAnJylcbiAgICByZXR1cm4gcGx1Z2luLmluZGV4T2YocGF0aC5zZXApIDwgMCA/IHBsdWdpbiA6IHVuZGVmaW5lZFxuICB9XG5cbiAgLyoqXG4gICAqIEdpdmVuIHR3byByYW5nZXMsIGl0IHJldHVybnMgYW4gYXJyYXkgb2YgcmFuZ2VzIHJlcHJlc2VudGluZyB0aGVcbiAgICogZGlmZmVyZW5jZXMgYmV0d2VlbiB0aGVtLlxuICAgKlxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IG9sZFN0YXJ0IHRoZSByb3cgaW5kZXggb2YgdGhlIGZpcnN0IHJhbmdlIHN0YXJ0XG4gICAqIEBwYXJhbSAge251bWJlcn0gb2xkRW5kIHRoZSByb3cgaW5kZXggb2YgdGhlIGZpcnN0IHJhbmdlIGVuZFxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IG5ld1N0YXJ0IHRoZSByb3cgaW5kZXggb2YgdGhlIHNlY29uZCByYW5nZSBzdGFydFxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IG5ld0VuZCB0aGUgcm93IGluZGV4IG9mIHRoZSBzZWNvbmQgcmFuZ2UgZW5kXG4gICAqIEByZXR1cm4ge0FycmF5PE9iamVjdD59IHRoZSBhcnJheSBvZiBkaWZmIHJhbmdlc1xuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGNvbXB1dGVSYW5nZXNEaWZmcyAob2xkU3RhcnQsIG9sZEVuZCwgbmV3U3RhcnQsIG5ld0VuZCkge1xuICAgIGxldCBkaWZmcyA9IFtdXG5cbiAgICBpZiAob2xkU3RhcnQuaXNMZXNzVGhhbihuZXdTdGFydCkpIHtcbiAgICAgIGRpZmZzLnB1c2goW29sZFN0YXJ0LCBuZXdTdGFydF0pXG4gICAgfSBlbHNlIGlmIChuZXdTdGFydC5pc0xlc3NUaGFuKG9sZFN0YXJ0KSkge1xuICAgICAgZGlmZnMucHVzaChbbmV3U3RhcnQsIG9sZFN0YXJ0XSlcbiAgICB9XG5cbiAgICBpZiAob2xkRW5kLmlzTGVzc1RoYW4obmV3RW5kKSkge1xuICAgICAgZGlmZnMucHVzaChbb2xkRW5kLCBuZXdFbmRdKVxuICAgIH0gZWxzZSBpZiAobmV3RW5kLmlzTGVzc1RoYW4ob2xkRW5kKSkge1xuICAgICAgZGlmZnMucHVzaChbbmV3RW5kLCBvbGRFbmRdKVxuICAgIH1cblxuICAgIHJldHVybiBkaWZmc1xuICB9XG5cbiAgLyoqXG4gICAqIEVtaXRzIGEgY2hhbmdlIGluIHRoZSBgTWluaW1hcGAgY29ycmVzcG9uZGluZyB0byB0aGVcbiAgICogcGFzc2VkLWluIGRlY29yYXRpb24uXG4gICAqXG4gICAqIEBwYXJhbSAge3N0cmluZ30gdHlwZSB0aGUgdHlwZSBvZiBkZWNvcmF0aW9uIHRoYXQgY2hhbmdlZFxuICAgKiBAcGFyYW0gIHtEZWNvcmF0aW9ufSBkZWNvcmF0aW9uIHRoZSBkZWNvcmF0aW9uIGZvciB3aGljaCBlbWl0dGluZyBhbiBldmVudFxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGVtaXREZWNvcmF0aW9uQ2hhbmdlcyAodHlwZSwgZGVjb3JhdGlvbikge1xuICAgIGlmICghdGhpcy50ZXh0RWRpdG9yIHx8IHRoaXMudGV4dEVkaXRvci5pc0Rlc3Ryb3llZCgpKSB7IHJldHVybiB9XG5cbiAgICB0aGlzLmludmFsaWRhdGVEZWNvcmF0aW9uRm9yU2NyZWVuUm93c0NhY2hlKClcblxuICAgIGxldCByYW5nZSA9IGRlY29yYXRpb24ubWFya2VyLmdldFNjcmVlblJhbmdlKClcbiAgICBpZiAocmFuZ2UgPT0gbnVsbCkgeyByZXR1cm4gfVxuXG4gICAgdGhpcy5lbWl0UmFuZ2VDaGFuZ2VzKHR5cGUsIHJhbmdlLCAwKVxuICB9XG5cbiAgLyoqXG4gICAqIEVtaXRzIGEgY2hhbmdlIGZvciB0aGUgc3BlY2lmaWVkIHJhbmdlLlxuICAgKlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IHR5cGUgdGhlIHR5cGUgb2YgZGVjb3JhdGlvbiB0aGF0IGNoYW5nZWRcbiAgICogQHBhcmFtICB7T2JqZWN0fSByYW5nZSB0aGUgcmFuZ2Ugd2hlcmUgY2hhbmdlcyBvY2N1cmVkXG4gICAqIEBwYXJhbSAge251bWJlcn0gW3NjcmVlbkRlbHRhXSBhbiBvcHRpb25hbCBzY3JlZW4gZGVsdGEgZm9yIHRoZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlIG9iamVjdFxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIGVtaXRSYW5nZUNoYW5nZXMgKHR5cGUsIHJhbmdlLCBzY3JlZW5EZWx0YSkge1xuICAgIGxldCBzdGFydFNjcmVlblJvdyA9IHJhbmdlLnN0YXJ0LnJvd1xuICAgIGxldCBlbmRTY3JlZW5Sb3cgPSByYW5nZS5lbmQucm93XG4gICAgbGV0IGxhc3RSZW5kZXJlZFNjcmVlblJvdyA9IHRoaXMuZ2V0TGFzdFZpc2libGVTY3JlZW5Sb3coKVxuICAgIGxldCBmaXJzdFJlbmRlcmVkU2NyZWVuUm93ID0gdGhpcy5nZXRGaXJzdFZpc2libGVTY3JlZW5Sb3coKVxuXG4gICAgaWYgKHNjcmVlbkRlbHRhID09IG51bGwpIHtcbiAgICAgIHNjcmVlbkRlbHRhID0gKGxhc3RSZW5kZXJlZFNjcmVlblJvdyAtIGZpcnN0UmVuZGVyZWRTY3JlZW5Sb3cpIC1cbiAgICAgICAgICAgICAgICAgICAgKGVuZFNjcmVlblJvdyAtIHN0YXJ0U2NyZWVuUm93KVxuICAgIH1cblxuICAgIGxldCBjaGFuZ2VFdmVudCA9IHtcbiAgICAgIHN0YXJ0OiBzdGFydFNjcmVlblJvdyxcbiAgICAgIGVuZDogZW5kU2NyZWVuUm93LFxuICAgICAgc2NyZWVuRGVsdGE6IHNjcmVlbkRlbHRhLFxuICAgICAgdHlwZTogdHlwZVxuICAgIH1cblxuICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtY2hhbmdlLWRlY29yYXRpb24tcmFuZ2UnLCBjaGFuZ2VFdmVudClcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEgYERlY29yYXRpb25gIGZyb20gdGhpcyBtaW5pbWFwLlxuICAgKlxuICAgKiBAcGFyYW0gIHtEZWNvcmF0aW9ufSBkZWNvcmF0aW9uIHRoZSBkZWNvcmF0aW9uIHRvIHJlbW92ZVxuICAgKiBAZW1pdHMgIHtkaWQtY2hhbmdlfSB3aGVuIHRoZSBkZWNvcmF0aW9uIGlzIHJlbW92ZWRcbiAgICogQGVtaXRzICB7ZGlkLXJlbW92ZS1kZWNvcmF0aW9ufSB3aGVuIHRoZSBkZWNvcmF0aW9uIGlzIHJlbW92ZWRcbiAgICovXG4gIHJlbW92ZURlY29yYXRpb24gKGRlY29yYXRpb24pIHtcbiAgICBpZiAoZGVjb3JhdGlvbiA9PSBudWxsKSB7IHJldHVybiB9XG5cbiAgICBsZXQgbWFya2VyID0gZGVjb3JhdGlvbi5tYXJrZXJcbiAgICBsZXQgc3Vic2NyaXB0aW9uXG5cbiAgICBkZWxldGUgdGhpcy5kZWNvcmF0aW9uc0J5SWRbZGVjb3JhdGlvbi5pZF1cblxuICAgIHN1YnNjcmlwdGlvbiA9IHRoaXMuZGVjb3JhdGlvblVwZGF0ZWRTdWJzY3JpcHRpb25zW2RlY29yYXRpb24uaWRdXG4gICAgaWYgKHN1YnNjcmlwdGlvbiAhPSBudWxsKSB7IHN1YnNjcmlwdGlvbi5kaXNwb3NlKCkgfVxuXG4gICAgc3Vic2NyaXB0aW9uID0gdGhpcy5kZWNvcmF0aW9uRGVzdHJveWVkU3Vic2NyaXB0aW9uc1tkZWNvcmF0aW9uLmlkXVxuICAgIGlmIChzdWJzY3JpcHRpb24gIT0gbnVsbCkgeyBzdWJzY3JpcHRpb24uZGlzcG9zZSgpIH1cblxuICAgIGRlbGV0ZSB0aGlzLmRlY29yYXRpb25VcGRhdGVkU3Vic2NyaXB0aW9uc1tkZWNvcmF0aW9uLmlkXVxuICAgIGRlbGV0ZSB0aGlzLmRlY29yYXRpb25EZXN0cm95ZWRTdWJzY3JpcHRpb25zW2RlY29yYXRpb24uaWRdXG5cbiAgICBsZXQgZGVjb3JhdGlvbnMgPSB0aGlzLmRlY29yYXRpb25zQnlNYXJrZXJJZFttYXJrZXIuaWRdXG4gICAgaWYgKCFkZWNvcmF0aW9ucykgeyByZXR1cm4gfVxuXG4gICAgdGhpcy5lbWl0RGVjb3JhdGlvbkNoYW5nZXMoZGVjb3JhdGlvbi5nZXRQcm9wZXJ0aWVzKCkudHlwZSwgZGVjb3JhdGlvbilcblxuICAgIGxldCBpbmRleCA9IGRlY29yYXRpb25zLmluZGV4T2YoZGVjb3JhdGlvbilcbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgZGVjb3JhdGlvbnMuc3BsaWNlKGluZGV4LCAxKVxuXG4gICAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLXJlbW92ZS1kZWNvcmF0aW9uJywge1xuICAgICAgICBtYXJrZXI6IG1hcmtlcixcbiAgICAgICAgZGVjb3JhdGlvbjogZGVjb3JhdGlvblxuICAgICAgfSlcblxuICAgICAgaWYgKGRlY29yYXRpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aGlzLnJlbW92ZWRBbGxNYXJrZXJEZWNvcmF0aW9ucyhtYXJrZXIpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYWxsIHRoZSBkZWNvcmF0aW9ucyByZWdpc3RlcmVkIGZvciB0aGUgcGFzc2VkLWluIG1hcmtlci5cbiAgICpcbiAgICogQHBhcmFtICB7TWFya2VyfSBtYXJrZXIgdGhlIG1hcmtlciBmb3Igd2hpY2ggcmVtb3ZpbmcgaXRzIGRlY29yYXRpb25zXG4gICAqIEBlbWl0cyAge2RpZC1jaGFuZ2V9IHdoZW4gYSBkZWNvcmF0aW9uIGhhdmUgYmVlbiByZW1vdmVkXG4gICAqIEBlbWl0cyAge2RpZC1yZW1vdmUtZGVjb3JhdGlvbn0gd2hlbiBhIGRlY29yYXRpb24gaGF2ZSBiZWVuIHJlbW92ZWRcbiAgICovXG4gIHJlbW92ZUFsbERlY29yYXRpb25zRm9yTWFya2VyIChtYXJrZXIpIHtcbiAgICBpZiAobWFya2VyID09IG51bGwpIHsgcmV0dXJuIH1cblxuICAgIGxldCBkZWNvcmF0aW9ucyA9IHRoaXMuZGVjb3JhdGlvbnNCeU1hcmtlcklkW21hcmtlci5pZF1cbiAgICBpZiAoIWRlY29yYXRpb25zKSB7IHJldHVybiB9XG5cbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gZGVjb3JhdGlvbnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGxldCBkZWNvcmF0aW9uID0gZGVjb3JhdGlvbnNbaV1cblxuICAgICAgdGhpcy5lbWl0RGVjb3JhdGlvbkNoYW5nZXMoZGVjb3JhdGlvbi5nZXRQcm9wZXJ0aWVzKCkudHlwZSwgZGVjb3JhdGlvbilcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtcmVtb3ZlLWRlY29yYXRpb24nLCB7XG4gICAgICAgIG1hcmtlcjogbWFya2VyLFxuICAgICAgICBkZWNvcmF0aW9uOiBkZWNvcmF0aW9uXG4gICAgICB9KVxuICAgIH1cblxuICAgIHRoaXMucmVtb3ZlZEFsbE1hcmtlckRlY29yYXRpb25zKG1hcmtlcilcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyB0aGUgcmVtb3ZhbCBvZiBhIGRlY29yYXRpb24gZm9yIGEgZ2l2ZW4gbWFya2VyLlxuICAgKlxuICAgKiBAcGFyYW0gIHtNYXJrZXJ9IG1hcmtlciB0aGUgbWFya2VyIGZvciB3aGljaCByZW1vdmluZyBkZWNvcmF0aW9uc1xuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICovXG4gIHJlbW92ZWRBbGxNYXJrZXJEZWNvcmF0aW9ucyAobWFya2VyKSB7XG4gICAgaWYgKG1hcmtlciA9PSBudWxsKSB7IHJldHVybiB9XG5cbiAgICB0aGlzLmRlY29yYXRpb25NYXJrZXJDaGFuZ2VkU3Vic2NyaXB0aW9uc1ttYXJrZXIuaWRdLmRpc3Bvc2UoKVxuICAgIHRoaXMuZGVjb3JhdGlvbk1hcmtlckRlc3Ryb3llZFN1YnNjcmlwdGlvbnNbbWFya2VyLmlkXS5kaXNwb3NlKClcblxuICAgIGRlbGV0ZSB0aGlzLmRlY29yYXRpb25zQnlNYXJrZXJJZFttYXJrZXIuaWRdXG4gICAgZGVsZXRlIHRoaXMuZGVjb3JhdGlvbk1hcmtlckNoYW5nZWRTdWJzY3JpcHRpb25zW21hcmtlci5pZF1cbiAgICBkZWxldGUgdGhpcy5kZWNvcmF0aW9uTWFya2VyRGVzdHJveWVkU3Vic2NyaXB0aW9uc1ttYXJrZXIuaWRdXG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhbGwgdGhlIGRlY29yYXRpb25zIHRoYXQgd2FzIGNyZWF0ZWQgaW4gdGhlIGN1cnJlbnQgYE1pbmltYXBgLlxuICAgKi9cbiAgcmVtb3ZlQWxsRGVjb3JhdGlvbnMgKCkge1xuICAgIGZvciAobGV0IGlkIGluIHRoaXMuZGVjb3JhdGlvbk1hcmtlckNoYW5nZWRTdWJzY3JpcHRpb25zKSB7XG4gICAgICB0aGlzLmRlY29yYXRpb25NYXJrZXJDaGFuZ2VkU3Vic2NyaXB0aW9uc1tpZF0uZGlzcG9zZSgpXG4gICAgfVxuXG4gICAgZm9yIChsZXQgaWQgaW4gdGhpcy5kZWNvcmF0aW9uTWFya2VyRGVzdHJveWVkU3Vic2NyaXB0aW9ucykge1xuICAgICAgdGhpcy5kZWNvcmF0aW9uTWFya2VyRGVzdHJveWVkU3Vic2NyaXB0aW9uc1tpZF0uZGlzcG9zZSgpXG4gICAgfVxuXG4gICAgZm9yIChsZXQgaWQgaW4gdGhpcy5kZWNvcmF0aW9uVXBkYXRlZFN1YnNjcmlwdGlvbnMpIHtcbiAgICAgIHRoaXMuZGVjb3JhdGlvblVwZGF0ZWRTdWJzY3JpcHRpb25zW2lkXS5kaXNwb3NlKClcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpZCBpbiB0aGlzLmRlY29yYXRpb25EZXN0cm95ZWRTdWJzY3JpcHRpb25zKSB7XG4gICAgICB0aGlzLmRlY29yYXRpb25EZXN0cm95ZWRTdWJzY3JpcHRpb25zW2lkXS5kaXNwb3NlKClcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpZCBpbiB0aGlzLmRlY29yYXRpb25zQnlJZCkge1xuICAgICAgdGhpcy5kZWNvcmF0aW9uc0J5SWRbaWRdLmRlc3Ryb3koKVxuICAgIH1cblxuICAgIHRoaXMuZGVjb3JhdGlvbnNCeUlkID0ge31cbiAgICB0aGlzLmRlY29yYXRpb25zQnlNYXJrZXJJZCA9IHt9XG4gICAgdGhpcy5kZWNvcmF0aW9uTWFya2VyQ2hhbmdlZFN1YnNjcmlwdGlvbnMgPSB7fVxuICAgIHRoaXMuZGVjb3JhdGlvbk1hcmtlckRlc3Ryb3llZFN1YnNjcmlwdGlvbnMgPSB7fVxuICAgIHRoaXMuZGVjb3JhdGlvblVwZGF0ZWRTdWJzY3JpcHRpb25zID0ge31cbiAgICB0aGlzLmRlY29yYXRpb25EZXN0cm95ZWRTdWJzY3JpcHRpb25zID0ge31cbiAgfVxufVxuIl19
//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/minimap/lib/mixins/decoration-management.js
