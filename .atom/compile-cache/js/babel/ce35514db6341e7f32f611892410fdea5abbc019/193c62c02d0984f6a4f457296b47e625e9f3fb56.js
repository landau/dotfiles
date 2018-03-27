Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodash = require('lodash');

var _ioUtil = require('./ioUtil');

var _ioUtil2 = _interopRequireDefault(_ioUtil);

'use babel';

var walk = require('walk');

var JavaClassReader = (function () {
  function JavaClassReader(loadClassMembers, ignoreInnerClasses, javaHome) {
    _classCallCheck(this, JavaClassReader);

    this.loadClassMembers = loadClassMembers;
    this.ignoreInnerClasses = ignoreInnerClasses;
    this.javaHome = javaHome;
  }

  _createClass(JavaClassReader, [{
    key: 'readAllClassesFromClasspath',
    value: function readAllClassesFromClasspath(classpath, skipLibs, callback) {
      var _this = this;

      var serialPromise = Promise.resolve();
      // We split with ; on Windows
      var paths = classpath.split(classpath.indexOf(';') !== -1 ? ';' : ':');
      _lodash._.each(paths, function (path) {
        if (path) {
          // TODO
          serialPromise = serialPromise.then(function () {
            return _this.readAllClassesFromPath(path, skipLibs, callback);
          });
        }
      });
      return serialPromise;
    }
  }, {
    key: 'readAllClassesFromPath',
    value: function readAllClassesFromPath(path, skipLibs, callback) {
      var _this2 = this;

      var promise = null;
      if (skipLibs && (path.endsWith('.jar') || path.endsWith('*'))) {
        return Promise.resolve();
      } else if (path.endsWith('.jar')) {
        // Read classes from a jar file
        promise = this.readAllClassesFromJar(path, callback);
      } else if (path.endsWith('*')) {
        (function () {
          // List jar files and read classes from them
          var dir = path.replace('*', '');
          promise = _ioUtil2['default'].readDir(dir).then(function (names) {
            var serialPromise = Promise.resolve();
            _lodash._.each(names, function (name) {
              if (name.endsWith('.jar')) {
                // TODO
                serialPromise = serialPromise.then(function () {
                  return _this2.readAllClassesFromJar(dir + name, callback);
                });
              }
            });
            return serialPromise;
          });
        })();
      } else {
        var _ret2 = (function () {
          // Gather all class files from a directory and its subdirectories
          var classFilePaths = [];
          promise = new Promise(function (resolve) {
            var walker = walk.walk(path, function () {});
            walker.on('directories', function (root, dirStatsArray, next) {
              next();
            });
            walker.on('file', function (root, fileStats, next) {
              if (fileStats.name.endsWith('.class')) {
                var classFilePath = (root + '/' + fileStats.name).replace(path + '/', '').replace(path + '\\', '');
                classFilePaths.push(classFilePath);
              }
              next();
            });
            walker.on('errors', function (root, nodeStatsArray, next) {
              next();
            });
            walker.on('end', function () {
              resolve();
            });
          });
          // Read classes
          return {
            v: promise.then(function () {
              return _this2.readClassesByName(path, classFilePaths, true, callback);
            })
          };
        })();

        if (typeof _ret2 === 'object') return _ret2.v;
      }
      return promise;
    }
  }, {
    key: 'readAllClassesFromJar',
    value: function readAllClassesFromJar(jarPath, callback) {
      var _this3 = this;

      return _ioUtil2['default'].exec('"' + this.javaBinDir() + 'jar" tf "' + jarPath + '"').then(function (stdout) {
        var filePaths = stdout.match(new RegExp('[\\S]*\\.class', 'g'));
        return _this3.readClassesByName(jarPath, filePaths, false, callback);
      });
    }
  }, {
    key: 'readClassesByName',
    value: function readClassesByName(classpath, cNames, parseArgs, callback) {
      var _this4 = this;

      // Filter and format class names from cNames that can be either
      // class names or file paths
      var classNames = (0, _lodash._)(cNames).filter(function (className) {
        return className && (className.indexOf('$') === -1 || !_this4.ignoreInnerClasses);
      }).map(function (className) {
        return className.replace('.class', '').replace(/[\/\\]/g, '.').trim();
      }).value();

      var promise = null;
      if (this.loadClassMembers) {
        // Read class info with javap
        promise = this.readClassesByNameWithJavap(classpath, classNames, parseArgs, callback);
      } else {
        // Just do callback with class name only
        _lodash._.each(classNames, function (className) {
          callback(classpath, { className: className });
        });
        promise = Promise.resolve();
      }
      return promise;
    }
  }, {
    key: 'readClassesByNameWithJavap',
    value: function readClassesByNameWithJavap(classpath, classNamesArray, parseArgs, callback) {
      var _this5 = this;

      var serialPromise = Promise.resolve();

      // Group array in multiple arrays of limited max length
      _lodash._.each(_lodash._.chunk(classNamesArray, parseArgs ? 20 : 50), function (classNames) {
        // Read classes with javap
        serialPromise = serialPromise.then(function () {
          var classNamesStr = _lodash._.reduce(classNames, function (className, result) {
            return result + ' ' + className;
          }, '');
          return _ioUtil2['default'].exec('"' + _this5.javaBinDir() + 'javap" ' + (parseArgs ? '-verbose -private ' : ' ') + '-classpath "' + classpath + '" ' + classNamesStr, false, true).then(function (stdout) {
            _lodash._.each(stdout.match(/Compiled from [^\}]*\}/gm), function (javapClass) {
              try {
                var classDesc = _this5.parseJavapClass(javapClass, parseArgs);
                callback(classpath, classDesc);
              } catch (err) {
                console.warn(err);
              }
            });
          });
        });
      });

      return serialPromise;
    }

    // TODO: This is a quick and ugly hack. Replace with an separate
    // javap parser module
  }, {
    key: 'parseJavapClass',
    value: function parseJavapClass(javapClass, parseArgs) {
      var desc = null;

      if (!parseArgs) {
        var extend = javapClass.match(/extends ([^\s]+)/);
        desc = {
          className: javapClass.match(/(class|interface)\s(\S*)\s/)[2].replace(/\<.*/g, ''),
          extend: extend ? extend[1] : null,
          members: javapClass.match(/(\S.*);/g)
        };
      } else {
        (function () {
          desc = {
            className: null,
            extend: null,
            members: [],
            members2: []
          };

          var status = 'header';
          var parsingArgs = false;

          _lodash._.each(javapClass.split(/[\r\n]+/), function (l) {
            var line = l.trim();
            var lineIndent = l.match(/^\s*/)[0].length;

            if (status === 'header') {
              if (/class|interface/.test(line)) {
                // Parse class/interface name and extends
                var extend = javapClass.match(/extends ([^\s]+)/);
                desc.extend = extend ? extend[1] : null;
                desc.className = javapClass.match(/(class|interface)\s(\S*)\s/)[2].replace(/\<.*/g, '');
              }
              if (line.indexOf('{') !== -1) {
                // Start parsing class members
                status = 'members';
              }
            } else if (status === 'members') {
              if (lineIndent === 2) {
                // Add new member
                desc.members2.push({
                  prototype: line,
                  args: []
                });
                parsingArgs = false;
              } else if (lineIndent === 4) {
                parsingArgs = /MethodParameters/.test(line);
              } else if (lineIndent === 6 && parsingArgs && line.indexOf(' ') === -1) {
                desc.members2[desc.members2.length - 1].args.push(line);
              } else if (line === '}') {
                status = 'end';
              }
            }
          });

          _lodash._.each(desc.members2, function (member) {
            var tmp = member.prototype;

            // NOTE: quick hack for generics support
            for (var i = 0; i < 5; i++) {
              var t = tmp.replace(/<(.*),\s+(.*)>/, '&lt;$1|comma|$2&gt;');
              tmp = t;
            }

            _lodash._.each(member.args, function (arg) {
              if (tmp.indexOf(',') !== -1) {
                tmp = tmp.replace(',', ' ' + arg + '=');
              } else {
                tmp = tmp.replace(')', ' ' + arg + ')');
              }
            });
            tmp = tmp.replace(/=/g, ',');

            // NOTE: quick hack for generics support
            tmp = tmp.replace(/&lt;/g, '<');
            tmp = tmp.replace(/&gt;/g, '>');
            tmp = tmp.replace(/\|comma\|/g, ',');

            member.prototype = tmp;
            desc.members.push(tmp);
          });
        })();
      }

      return desc;
    }
  }, {
    key: 'javaBinDir',
    value: function javaBinDir() {
      var baseDir = this.javaHome || process.env.JAVA_HOME;
      if (baseDir) {
        return baseDir.replace(/[\/\\]$/, '') + '/bin/';
      }
      return '';
    }
  }]);

  return JavaClassReader;
})();

exports.JavaClassReader = JavaClassReader;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qYXZhL2xpYi9KYXZhQ2xhc3NSZWFkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztzQkFFa0IsUUFBUTs7c0JBQ1AsVUFBVTs7OztBQUg3QixXQUFXLENBQUM7O0FBSVosSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztJQUVoQixlQUFlO0FBRWYsV0FGQSxlQUFlLENBRWQsZ0JBQWdCLEVBQUUsa0JBQWtCLEVBQUUsUUFBUSxFQUFFOzBCQUZqRCxlQUFlOztBQUd4QixRQUFJLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7QUFDekMsUUFBSSxDQUFDLGtCQUFrQixHQUFHLGtCQUFrQixDQUFDO0FBQzdDLFFBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0dBQzFCOztlQU5VLGVBQWU7O1dBUUMscUNBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUU7OztBQUN6RCxVQUFJLGFBQWEsR0FBRyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7O0FBRXRDLFVBQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDekUsZ0JBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxVQUFBLElBQUksRUFBSTtBQUNwQixZQUFJLElBQUksRUFBRTs7QUFFUix1QkFBYSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsWUFBTTtBQUN2QyxtQkFBTyxNQUFLLHNCQUFzQixDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7V0FDOUQsQ0FBQyxDQUFDO1NBQ0o7T0FDRixDQUFDLENBQUM7QUFDSCxhQUFPLGFBQWEsQ0FBQztLQUN0Qjs7O1dBRXFCLGdDQUFDLElB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LEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDaEMsZUFBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ2hDLGVBQUcsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxHQUFHLENBQUMsQ0FBQzs7QUFFckMsa0JBQU0sQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDO0FBQ3ZCLGdCQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztXQUN4QixDQUFDLENBQUM7O09BQ0o7O0FBRUQsYUFBTyxJQUFJLENBQUM7S0FDYjs7O1dBRVMsc0JBQUc7QUFDWCxVQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDO0FBQ3ZELFVBQUksT0FBTyxFQUFFO0FBQ1gsZUFBTyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUM7T0FDakQ7QUFDRCxhQUFPLEVBQUUsQ0FBQztLQUNYOzs7U0E1T1UsZUFBZSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtamF2YS9saWIvSmF2YUNsYXNzUmVhZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7IF8gfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IGlvVXRpbCBmcm9tICcuL2lvVXRpbCc7XG5jb25zdCB3YWxrID0gcmVxdWlyZSgnd2FsaycpO1xuXG5leHBvcnQgY2xhc3MgSmF2YUNsYXNzUmVhZGVyIHtcblxuICBjb25zdHJ1Y3Rvcihsb2FkQ2xhc3NNZW1iZXJzLCBpZ25vcmVJbm5lckNsYXNzZXMsIGphdmFIb21lKSB7XG4gICAgdGhpcy5sb2FkQ2xhc3NNZW1iZXJzID0gbG9hZENsYXNzTWVtYmVycztcbiAgICB0aGlzLmlnbm9yZUlubmVyQ2xhc3NlcyA9IGlnbm9yZUlubmVyQ2xhc3NlcztcbiAgICB0aGlzLmphdmFIb21lID0gamF2YUhvbWU7XG4gIH1cblxuICByZWFkQWxsQ2xhc3Nlc0Zyb21DbGFzc3BhdGgoY2xhc3NwYXRoLCBza2lwTGlicywgY2FsbGJhY2spIHtcbiAgICBsZXQgc2VyaWFsUHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIC8vIFdlIHNwbGl0IHdpdGggOyBvbiBXaW5kb3dzXG4gICAgY29uc3QgcGF0aHMgPSBjbGFzc3BhdGguc3BsaXQoY2xhc3NwYXRoLmluZGV4T2YoJzsnKSAhPT0gLTEgPyAnOycgOiAnOicpO1xuICAgIF8uZWFjaChwYXRocywgcGF0aCA9PiB7XG4gICAgICBpZiAocGF0aCkge1xuICAgICAgICAvLyBUT0RPXG4gICAgICAgIHNlcmlhbFByb21pc2UgPSBzZXJpYWxQcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLnJlYWRBbGxDbGFzc2VzRnJvbVBhdGgocGF0aCwgc2tpcExpYnMsIGNhbGxiYWNrKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHNlcmlhbFByb21pc2U7XG4gIH1cblxuICByZWFkQWxsQ2xhc3Nlc0Zyb21QYXRoKHBhdGgsIHNraXBMaWJzLCBjYWxsYmFjaykge1xuICAgIGxldCBwcm9taXNlID0gbnVsbDtcbiAgICBpZiAoc2tpcExpYnMgJiYgKHBhdGguZW5kc1dpdGgoJy5qYXInKSB8fCBwYXRoLmVuZHNXaXRoKCcqJykpKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfSBlbHNlIGlmIChwYXRoLmVuZHNXaXRoKCcuamFyJykpIHtcbiAgICAgIC8vIFJlYWQgY2xhc3NlcyBmcm9tIGEgamFyIGZpbGVcbiAgICAgIHByb21pc2UgPSB0aGlzLnJlYWRBbGxDbGFzc2VzRnJvbUphcihwYXRoLCBjYWxsYmFjayk7XG4gICAgfSBlbHNlIGlmIChwYXRoLmVuZHNXaXRoKCcqJykpIHtcbiAgICAgIC8vIExpc3QgamFyIGZpbGVzIGFuZCByZWFkIGNsYXNzZXMgZnJvbSB0aGVtXG4gICAgICBjb25zdCBkaXIgPSBwYXRoLnJlcGxhY2UoJyonLCAnJyk7XG4gICAgICBwcm9taXNlID0gaW9VdGlsLnJlYWREaXIoZGlyKS50aGVuKG5hbWVzID0+IHtcbiAgICAgICAgbGV0IHNlcmlhbFByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgXy5lYWNoKG5hbWVzLCBuYW1lID0+IHtcbiAgICAgICAgICBpZiAobmFtZS5lbmRzV2l0aCgnLmphcicpKSB7XG4gICAgICAgICAgICAvLyBUT0RPXG4gICAgICAgICAgICBzZXJpYWxQcm9taXNlID0gc2VyaWFsUHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVhZEFsbENsYXNzZXNGcm9tSmFyKGRpciArIG5hbWUsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBzZXJpYWxQcm9taXNlO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEdhdGhlciBhbGwgY2xhc3MgZmlsZXMgZnJvbSBhIGRpcmVjdG9yeSBhbmQgaXRzIHN1YmRpcmVjdG9yaWVzXG4gICAgICBjb25zdCBjbGFzc0ZpbGVQYXRocyA9IFtdO1xuICAgICAgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNvbnN0IHdhbGtlciA9IHdhbGsud2FsayhwYXRoLCAoKSA9PiB7IH0pO1xuICAgICAgICB3YWxrZXIub24oJ2RpcmVjdG9yaWVzJywgKHJvb3QsIGRpclN0YXRzQXJyYXksIG5leHQpID0+IHtcbiAgICAgICAgICBuZXh0KCk7XG4gICAgICAgIH0pO1xuICAgICAgICB3YWxrZXIub24oJ2ZpbGUnLCAocm9vdCwgZmlsZVN0YXRzLCBuZXh0KSA9PiB7XG4gICAgICAgICAgaWYgKGZpbGVTdGF0cy5uYW1lLmVuZHNXaXRoKCcuY2xhc3MnKSkge1xuICAgICAgICAgICAgY29uc3QgY2xhc3NGaWxlUGF0aCA9IChyb290ICsgJy8nICsgZmlsZVN0YXRzLm5hbWUpXG4gICAgICAgICAgICAgIC5yZXBsYWNlKHBhdGggKyAnLycsICcnKS5yZXBsYWNlKHBhdGggKyAnXFxcXCcsICcnKTtcbiAgICAgICAgICAgIGNsYXNzRmlsZVBhdGhzLnB1c2goY2xhc3NGaWxlUGF0aCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHdhbGtlci5vbignZXJyb3JzJywgKHJvb3QsIG5vZGVTdGF0c0FycmF5LCBuZXh0KSA9PiB7XG4gICAgICAgICAgbmV4dCgpO1xuICAgICAgICB9KTtcbiAgICAgICAgd2Fsa2VyLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgLy8gUmVhZCBjbGFzc2VzXG4gICAgICByZXR1cm4gcHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVhZENsYXNzZXNCeU5hbWUocGF0aCwgY2xhc3NGaWxlUGF0aHMsIHRydWUsIGNhbGxiYWNrKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIHJlYWRBbGxDbGFzc2VzRnJvbUphcihqYXJQYXRoLCBjYWxsYmFjaykge1xuICAgIHJldHVybiBpb1V0aWwuZXhlYygnXCInICsgdGhpcy5qYXZhQmluRGlyKCkgKyAnamFyXCIgdGYgXCInICsgamFyUGF0aCArICdcIicpXG4gICAgLnRoZW4oc3Rkb3V0ID0+IHtcbiAgICAgIGNvbnN0IGZpbGVQYXRocyA9IHN0ZG91dC5tYXRjaChuZXcgUmVnRXhwKCdbXFxcXFNdKlxcXFwuY2xhc3MnLCAnZycpKTtcbiAgICAgIHJldHVybiB0aGlzLnJlYWRDbGFzc2VzQnlOYW1lKGphclBhdGgsIGZpbGVQYXRocywgZmFsc2UsIGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlYWRDbGFzc2VzQnlOYW1lKGNsYXNzcGF0aCwgY05hbWVzLCBwYXJzZUFyZ3MsIGNhbGxiYWNrKSB7XG4gICAgLy8gRmlsdGVyIGFuZCBmb3JtYXQgY2xhc3MgbmFtZXMgZnJvbSBjTmFtZXMgdGhhdCBjYW4gYmUgZWl0aGVyXG4gICAgLy8gY2xhc3MgbmFtZXMgb3IgZmlsZSBwYXRoc1xuICAgIGNvbnN0IGNsYXNzTmFtZXMgPSBfKGNOYW1lcykuZmlsdGVyKChjbGFzc05hbWUpID0+IHtcbiAgICAgIHJldHVybiBjbGFzc05hbWUgJiYgKGNsYXNzTmFtZS5pbmRleE9mKCckJykgPT09IC0xIHx8XG4gICAgICAgICF0aGlzLmlnbm9yZUlubmVyQ2xhc3Nlcyk7XG4gICAgfSkubWFwKChjbGFzc05hbWUpID0+IHtcbiAgICAgIHJldHVybiBjbGFzc05hbWUucmVwbGFjZSgnLmNsYXNzJywgJycpLnJlcGxhY2UoL1tcXC9cXFxcXS9nLCAnLicpLnRyaW0oKTtcbiAgICB9KS52YWx1ZSgpO1xuXG4gICAgbGV0IHByb21pc2UgPSBudWxsO1xuICAgIGlmICh0aGlzLmxvYWRDbGFzc01lbWJlcnMpIHtcbiAgICAgIC8vIFJlYWQgY2xhc3MgaW5mbyB3aXRoIGphdmFwXG4gICAgICBwcm9taXNlID0gdGhpcy5yZWFkQ2xhc3Nlc0J5TmFtZVdpdGhKYXZhcChcbiAgICAgICAgY2xhc3NwYXRoLCBjbGFzc05hbWVzLCBwYXJzZUFyZ3MsIGNhbGxiYWNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSnVzdCBkbyBjYWxsYmFjayB3aXRoIGNsYXNzIG5hbWUgb25seVxuICAgICAgXy5lYWNoKGNsYXNzTmFtZXMsIChjbGFzc05hbWUpID0+IHtcbiAgICAgICAgY2FsbGJhY2soY2xhc3NwYXRoLCB7IGNsYXNzTmFtZTogY2xhc3NOYW1lIH0pO1xuICAgICAgfSk7XG4gICAgICBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgcmVhZENsYXNzZXNCeU5hbWVXaXRoSmF2YXAoY2xhc3NwYXRoLCBjbGFzc05hbWVzQXJyYXksIHBhcnNlQXJncywgY2FsbGJhY2spIHtcbiAgICBsZXQgc2VyaWFsUHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpO1xuXG4gICAgLy8gR3JvdXAgYXJyYXkgaW4gbXVsdGlwbGUgYXJyYXlzIG9mIGxpbWl0ZWQgbWF4IGxlbmd0aFxuICAgIF8uZWFjaChfLmNodW5rKGNsYXNzTmFtZXNBcnJheSwgcGFyc2VBcmdzID8gMjAgOiA1MCksIGNsYXNzTmFtZXMgPT4ge1xuICAgICAgLy8gUmVhZCBjbGFzc2VzIHdpdGggamF2YXBcbiAgICAgIHNlcmlhbFByb21pc2UgPSBzZXJpYWxQcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICBjb25zdCBjbGFzc05hbWVzU3RyID0gXy5yZWR1Y2UoY2xhc3NOYW1lcywgKGNsYXNzTmFtZSwgcmVzdWx0KSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdCArICcgJyArIGNsYXNzTmFtZTtcbiAgICAgICAgfSwgJycpO1xuICAgICAgICByZXR1cm4gaW9VdGlsLmV4ZWMoJ1wiJyArIHRoaXMuamF2YUJpbkRpcigpXG4gICAgICAgICAgKyAnamF2YXBcIiAnXG4gICAgICAgICAgKyAocGFyc2VBcmdzID8gJy12ZXJib3NlIC1wcml2YXRlICcgOiAnICcpXG4gICAgICAgICAgKyAnLWNsYXNzcGF0aCBcIidcbiAgICAgICAgICArIGNsYXNzcGF0aCArICdcIiAnICsgY2xhc3NOYW1lc1N0ciwgZmFsc2UsIHRydWUpXG4gICAgICAgIC50aGVuKHN0ZG91dCA9PiB7XG4gICAgICAgICAgXy5lYWNoKHN0ZG91dC5tYXRjaCgvQ29tcGlsZWQgZnJvbSBbXlxcfV0qXFx9L2dtKSwgamF2YXBDbGFzcyA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBjb25zdCBjbGFzc0Rlc2MgPSB0aGlzLnBhcnNlSmF2YXBDbGFzcyhqYXZhcENsYXNzLCBwYXJzZUFyZ3MpO1xuICAgICAgICAgICAgICBjYWxsYmFjayhjbGFzc3BhdGgsIGNsYXNzRGVzYyk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgY29uc29sZS53YXJuKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gc2VyaWFsUHJvbWlzZTtcbiAgfVxuXG4gIC8vIFRPRE86IFRoaXMgaXMgYSBxdWljayBhbmQgdWdseSBoYWNrLiBSZXBsYWNlIHdpdGggYW4gc2VwYXJhdGVcbiAgLy8gamF2YXAgcGFyc2VyIG1vZHVsZVxuICBwYXJzZUphdmFwQ2xhc3MoamF2YXBDbGFzcywgcGFyc2VBcmdzKSB7XG4gICAgbGV0IGRlc2MgPSBudWxsO1xuXG4gICAgaWYgKCFwYXJzZUFyZ3MpIHtcbiAgICAgIGNvbnN0IGV4dGVuZCA9IGphdmFwQ2xhc3MubWF0Y2goL2V4dGVuZHMgKFteXFxzXSspLyk7XG4gICAgICBkZXNjID0ge1xuICAgICAgICBjbGFzc05hbWU6IGphdmFwQ2xhc3MubWF0Y2goLyhjbGFzc3xpbnRlcmZhY2UpXFxzKFxcUyopXFxzLylbMl1cbiAgICAgICAgICAucmVwbGFjZSgvXFw8LiovZywgJycpLFxuICAgICAgICBleHRlbmQ6IGV4dGVuZCA/IGV4dGVuZFsxXSA6IG51bGwsXG4gICAgICAgIG1lbWJlcnM6IGphdmFwQ2xhc3MubWF0Y2goLyhcXFMuKik7L2cpLFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVzYyA9IHtcbiAgICAgICAgY2xhc3NOYW1lOiBudWxsLFxuICAgICAgICBleHRlbmQ6IG51bGwsXG4gICAgICAgIG1lbWJlcnM6IFtdLFxuICAgICAgICBtZW1iZXJzMjogW10sXG4gICAgICB9O1xuXG4gICAgICBsZXQgc3RhdHVzID0gJ2hlYWRlcic7XG4gICAgICBsZXQgcGFyc2luZ0FyZ3MgPSBmYWxzZTtcblxuICAgICAgXy5lYWNoKGphdmFwQ2xhc3Muc3BsaXQoL1tcXHJcXG5dKy8pLCBsID0+IHtcbiAgICAgICAgY29uc3QgbGluZSA9IGwudHJpbSgpO1xuICAgICAgICBjb25zdCBsaW5lSW5kZW50ID0gbC5tYXRjaCgvXlxccyovKVswXS5sZW5ndGg7XG5cbiAgICAgICAgaWYgKHN0YXR1cyA9PT0gJ2hlYWRlcicpIHtcbiAgICAgICAgICBpZiAoL2NsYXNzfGludGVyZmFjZS8udGVzdChsaW5lKSkge1xuICAgICAgICAgICAgLy8gUGFyc2UgY2xhc3MvaW50ZXJmYWNlIG5hbWUgYW5kIGV4dGVuZHNcbiAgICAgICAgICAgIGNvbnN0IGV4dGVuZCA9IGphdmFwQ2xhc3MubWF0Y2goL2V4dGVuZHMgKFteXFxzXSspLyk7XG4gICAgICAgICAgICBkZXNjLmV4dGVuZCA9IGV4dGVuZCA/IGV4dGVuZFsxXSA6IG51bGw7XG4gICAgICAgICAgICBkZXNjLmNsYXNzTmFtZSA9IGphdmFwQ2xhc3MubWF0Y2goLyhjbGFzc3xpbnRlcmZhY2UpXFxzKFxcUyopXFxzLylbMl1cbiAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcPC4qL2csICcnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGxpbmUuaW5kZXhPZigneycpICE9PSAtMSkge1xuICAgICAgICAgICAgLy8gU3RhcnQgcGFyc2luZyBjbGFzcyBtZW1iZXJzXG4gICAgICAgICAgICBzdGF0dXMgPSAnbWVtYmVycyc7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHN0YXR1cyA9PT0gJ21lbWJlcnMnKSB7XG4gICAgICAgICAgaWYgKGxpbmVJbmRlbnQgPT09IDIpIHtcbiAgICAgICAgICAgIC8vIEFkZCBuZXcgbWVtYmVyXG4gICAgICAgICAgICBkZXNjLm1lbWJlcnMyLnB1c2goe1xuICAgICAgICAgICAgICBwcm90b3R5cGU6IGxpbmUsXG4gICAgICAgICAgICAgIGFyZ3M6IFtdLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwYXJzaW5nQXJncyA9IGZhbHNlO1xuICAgICAgICAgIH0gZWxzZSBpZiAobGluZUluZGVudCA9PT0gNCkge1xuICAgICAgICAgICAgcGFyc2luZ0FyZ3MgPSAvTWV0aG9kUGFyYW1ldGVycy8udGVzdChsaW5lKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGxpbmVJbmRlbnQgPT09IDYgJiYgcGFyc2luZ0FyZ3MgJiZcbiAgICAgICAgICAgICAgbGluZS5pbmRleE9mKCcgJykgPT09IC0xKSB7XG4gICAgICAgICAgICBkZXNjLm1lbWJlcnMyW2Rlc2MubWVtYmVyczIubGVuZ3RoIC0gMV0uYXJncy5wdXNoKGxpbmUpO1xuICAgICAgICAgIH0gZWxzZSBpZiAobGluZSA9PT0gJ30nKSB7XG4gICAgICAgICAgICBzdGF0dXMgPSAnZW5kJztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBfLmVhY2goZGVzYy5tZW1iZXJzMiwgbWVtYmVyID0+IHtcbiAgICAgICAgbGV0IHRtcCA9IG1lbWJlci5wcm90b3R5cGU7XG5cbiAgICAgICAgLy8gTk9URTogcXVpY2sgaGFjayBmb3IgZ2VuZXJpY3Mgc3VwcG9ydFxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDU7IGkrKykge1xuICAgICAgICAgIGNvbnN0IHQgPSB0bXAucmVwbGFjZSgvPCguKiksXFxzKyguKik+LywgJyZsdDskMXxjb21tYXwkMiZndDsnKTtcbiAgICAgICAgICB0bXAgPSB0O1xuICAgICAgICB9XG5cbiAgICAgICAgXy5lYWNoKG1lbWJlci5hcmdzLCBhcmcgPT4ge1xuICAgICAgICAgIGlmICh0bXAuaW5kZXhPZignLCcpICE9PSAtMSkge1xuICAgICAgICAgICAgdG1wID0gdG1wLnJlcGxhY2UoJywnLCAnICcgKyBhcmcgKyAnPScpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0bXAgPSB0bXAucmVwbGFjZSgnKScsICcgJyArIGFyZyArICcpJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdG1wID0gdG1wLnJlcGxhY2UoLz0vZywgJywnKTtcblxuICAgICAgICAvLyBOT1RFOiBxdWljayBoYWNrIGZvciBnZW5lcmljcyBzdXBwb3J0XG4gICAgICAgIHRtcCA9IHRtcC5yZXBsYWNlKC8mbHQ7L2csICc8Jyk7XG4gICAgICAgIHRtcCA9IHRtcC5yZXBsYWNlKC8mZ3Q7L2csICc+Jyk7XG4gICAgICAgIHRtcCA9IHRtcC5yZXBsYWNlKC9cXHxjb21tYVxcfC9nLCAnLCcpO1xuXG4gICAgICAgIG1lbWJlci5wcm90b3R5cGUgPSB0bXA7XG4gICAgICAgIGRlc2MubWVtYmVycy5wdXNoKHRtcCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGVzYztcbiAgfVxuXG4gIGphdmFCaW5EaXIoKSB7XG4gICAgY29uc3QgYmFzZURpciA9IHRoaXMuamF2YUhvbWUgfHwgcHJvY2Vzcy5lbnYuSkFWQV9IT01FO1xuICAgIGlmIChiYXNlRGlyKSB7XG4gICAgICByZXR1cm4gYmFzZURpci5yZXBsYWNlKC9bXFwvXFxcXF0kLywgJycpICsgJy9iaW4vJztcbiAgICB9XG4gICAgcmV0dXJuICcnO1xuICB9XG5cbn1cbiJdfQ==