Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _triejs = require('triejs');

'use babel';

function sortTrie() {
  this.sort(function (a, b) {
    var compare = b.lastUsed - a.lastUsed;
    if (compare === 0) {
      compare = a.name.localeCompare(b.name);
    }
    return compare;
  });
}

var Dictionary = (function () {
  function Dictionary() {
    _classCallCheck(this, Dictionary);

    this.tries = new Map();
  }

  _createClass(Dictionary, [{
    key: 'add',
    value: function add(category, name, desc) {
      this._getTrie(category, true).add(name, desc);
    }
  }, {
    key: 'remove',
    value: function remove(category, name) {
      try {
        this._getTrie(category, true).remove(name);
      } catch (err) {
        // OK
      }
    }
  }, {
    key: 'removeCategory',
    value: function removeCategory(category) {
      this.tries['delete'](category);
    }
  }, {
    key: 'find',
    value: function find(category, namePrefix) {
      var trie = this._getTrie(category);
      return trie ? trie.find(namePrefix) : [];
    }
  }, {
    key: 'touch',
    value: function touch(result) {
      result.lastUsed = Date.now();
    }
  }, {
    key: '_getTrie',
    value: function _getTrie(category, create) {
      var trie = this.tries.get(category);
      if (!trie && create) {
        trie = new _triejs.Triejs({
          returnRoot: true,
          sort: sortTrie,
          enableCache: false
        });
        this.tries.set(category, trie);
      }
      return trie;
    }
  }]);

  return Dictionary;
})();

exports.Dictionary = Dictionary;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qYXZhL2xpYi9EaWN0aW9uYXJ5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O3NCQUV1QixRQUFROztBQUYvQixXQUFXLENBQUM7O0FBSVosU0FBUyxRQUFRLEdBQUc7QUFDbEIsTUFBSSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLEVBQUs7QUFDbEIsUUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDO0FBQ3RDLFFBQUksT0FBTyxLQUFLLENBQUMsRUFBRTtBQUNqQixhQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ3hDO0FBQ0QsV0FBTyxPQUFPLENBQUM7R0FDaEIsQ0FBQyxDQUFDO0NBQ0o7O0lBRVksVUFBVTtBQUVWLFdBRkEsVUFBVSxHQUVQOzBCQUZILFVBQVU7O0FBR25CLFFBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztHQUN4Qjs7ZUFKVSxVQUFVOztXQU1sQixhQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQ3hCLFVBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDL0M7OztXQUVLLGdCQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUU7QUFDckIsVUFBSTtBQUNGLFlBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUM1QyxDQUFDLE9BQU8sR0FBRyxFQUFFOztPQUViO0tBQ0Y7OztXQUVhLHdCQUFDLFFBQVEsRUFBRTtBQUN2QixVQUFJLENBQUMsS0FBSyxVQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDN0I7OztXQUVHLGNBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRTtBQUN6QixVQUFNLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JDLGFBQU8sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDO0tBQzFDOzs7V0FFSSxlQUFDLE1BQU0sRUFBRTtBQUNaLFlBQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0tBQzlCOzs7V0FFTyxrQkFBQyxRQUFRLEVBQUUsTUFBTSxFQUFFO0FBQ3pCLFVBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3BDLFVBQUksQ0FBQyxJQUFJLElBQUksTUFBTSxFQUFFO0FBQ25CLFlBQUksR0FBRyxtQkFBVztBQUNoQixvQkFBVSxFQUFFLElBQUk7QUFDaEIsY0FBSSxFQUFFLFFBQVE7QUFDZCxxQkFBVyxFQUFFLEtBQUs7U0FDbkIsQ0FBQyxDQUFDO0FBQ0gsWUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO09BQ2hDO0FBQ0QsYUFBTyxJQUFJLENBQUM7S0FDYjs7O1NBMUNVLFVBQVUiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLWphdmEvbGliL0RpY3Rpb25hcnkuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHsgVHJpZWpzIH0gZnJvbSAndHJpZWpzJztcblxuZnVuY3Rpb24gc29ydFRyaWUoKSB7XG4gIHRoaXMuc29ydCgoYSwgYikgPT4ge1xuICAgIGxldCBjb21wYXJlID0gYi5sYXN0VXNlZCAtIGEubGFzdFVzZWQ7XG4gICAgaWYgKGNvbXBhcmUgPT09IDApIHtcbiAgICAgIGNvbXBhcmUgPSBhLm5hbWUubG9jYWxlQ29tcGFyZShiLm5hbWUpO1xuICAgIH1cbiAgICByZXR1cm4gY29tcGFyZTtcbiAgfSk7XG59XG5cbmV4cG9ydCBjbGFzcyBEaWN0aW9uYXJ5IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnRyaWVzID0gbmV3IE1hcCgpO1xuICB9XG5cbiAgYWRkKGNhdGVnb3J5LCBuYW1lLCBkZXNjKSB7XG4gICAgdGhpcy5fZ2V0VHJpZShjYXRlZ29yeSwgdHJ1ZSkuYWRkKG5hbWUsIGRlc2MpO1xuICB9XG5cbiAgcmVtb3ZlKGNhdGVnb3J5LCBuYW1lKSB7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuX2dldFRyaWUoY2F0ZWdvcnksIHRydWUpLnJlbW92ZShuYW1lKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIC8vIE9LXG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlQ2F0ZWdvcnkoY2F0ZWdvcnkpIHtcbiAgICB0aGlzLnRyaWVzLmRlbGV0ZShjYXRlZ29yeSk7XG4gIH1cblxuICBmaW5kKGNhdGVnb3J5LCBuYW1lUHJlZml4KSB7XG4gICAgY29uc3QgdHJpZSA9IHRoaXMuX2dldFRyaWUoY2F0ZWdvcnkpO1xuICAgIHJldHVybiB0cmllID8gdHJpZS5maW5kKG5hbWVQcmVmaXgpIDogW107XG4gIH1cblxuICB0b3VjaChyZXN1bHQpIHtcbiAgICByZXN1bHQubGFzdFVzZWQgPSBEYXRlLm5vdygpO1xuICB9XG5cbiAgX2dldFRyaWUoY2F0ZWdvcnksIGNyZWF0ZSkge1xuICAgIGxldCB0cmllID0gdGhpcy50cmllcy5nZXQoY2F0ZWdvcnkpO1xuICAgIGlmICghdHJpZSAmJiBjcmVhdGUpIHtcbiAgICAgIHRyaWUgPSBuZXcgVHJpZWpzKHtcbiAgICAgICAgcmV0dXJuUm9vdDogdHJ1ZSxcbiAgICAgICAgc29ydDogc29ydFRyaWUsXG4gICAgICAgIGVuYWJsZUNhY2hlOiBmYWxzZSxcbiAgICAgIH0pO1xuICAgICAgdGhpcy50cmllcy5zZXQoY2F0ZWdvcnksIHRyaWUpO1xuICAgIH1cbiAgICByZXR1cm4gdHJpZTtcbiAgfVxuXG59XG4iXX0=