Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodash = require('lodash');

var _Dictionary = require('./Dictionary');

var _JavaClassReader = require('./JavaClassReader');

var _ioUtil = require('./ioUtil');

var _ioUtil2 = _interopRequireDefault(_ioUtil);

var _javaUtil = require('./javaUtil');

var _javaUtil2 = _interopRequireDefault(_javaUtil);

'use babel';

var JavaClassLoader = (function () {
  function JavaClassLoader(javaHome) {
    _classCallCheck(this, JavaClassLoader);

    this.javaHome = javaHome;
    this.dict = new _Dictionary.Dictionary();
  }

  _createClass(JavaClassLoader, [{
    key: 'setJavaHome',
    value: function setJavaHome(javaHome) {
      this.javaHome = javaHome;
    }
  }, {
    key: 'findClass',
    value: function findClass(namePrefix) {
      return this.dict.find('class', namePrefix);
    }
  }, {
    key: 'findSuperClassName',
    value: function findSuperClassName(className) {
      var classes = this.findClass(className);
      var clazz = _lodash._.find(classes, function (c) {
        return c.className === className;
      });
      return clazz ? clazz.extend : null;
    }
  }, {
    key: 'findClassMember',
    value: function findClassMember(className, namePrefix) {
      return this.dict.find(className, namePrefix);
    }
  }, {
    key: 'touchClass',
    value: function touchClass(className) {
      var classDescs = this.findClass(className);
      if (classDescs.length) {
        this.touch(classDescs[0]);
      }
    }
  }, {
    key: 'touch',
    value: function touch(classDesc) {
      this.dict.touch(classDesc);
    }
  }, {
    key: 'loadClass',
    value: function loadClass(className, classpath, loadClassMembers) {
      var _this = this;

      console.log('autocomplete-java load class: ' + className);
      var classReader = new _JavaClassReader.JavaClassReader(loadClassMembers, true, this.javaHome);
      return classReader.readClassesByName(classpath, [className], true, function (cp, classDesc) {
        return _this._addClass(classDesc, Date.now());
      });
    }
  }, {
    key: 'loadClasses',
    value: function loadClasses(classpath, loadClassMembers, fullRefresh) {
      var _this2 = this;

      var promise = null;
      if (fullRefresh && this.fullRefreshOngoing) {
        // TODO reject promise on warning and notify about warning afterwards
        atom.notifications.addWarning('autocomplete-java:\n ' + 'Full refresh already in progress. Execute normal refresh or ' + 'try full refresh again later.', { dismissable: true });
        promise = Promise.resolve();
      } else {
        console.log('autocomplete-java load start, full refresh: ' + fullRefresh);
        if (fullRefresh) {
          this.fullRefreshOngoing = true;
          this.dict = new _Dictionary.Dictionary();
        }

        // First load basic class descriptions
        promise = this._loadClassesImpl(classpath, false, fullRefresh).then(function () {
          // Then, optionally, load also class members
          if (loadClassMembers) {
            return _this2._loadClassesImpl(classpath, true, fullRefresh);
          }
        }).then(function () {
          // Loading finished
          if (fullRefresh) {
            _this2.fullRefreshOngoing = false;
          }
          console.log('autocomplete-java load end, full refresh: ' + fullRefresh);
        });
      }
      return promise;
    }
  }, {
    key: '_loadClassesImpl',
    value: function _loadClassesImpl(classpath, loadClassMembers, fullRefresh) {
      var _this3 = this;

      var classReader = new _JavaClassReader.JavaClassReader(loadClassMembers, true, this.javaHome);

      // First load project classes
      console.log('autocomplete-java loading project classes. loadMembers: ' + loadClassMembers);
      return classReader.readAllClassesFromClasspath(classpath, !fullRefresh, function (cp, className, classMembers) {
        // Add class
        // 0 / 2 = class files have a priority over jars among suggestions
        return _this3._addClass(className, classMembers, cp.indexOf('.jar') !== -1 ? 0 : 2);
      }).then(function () {
        // Then load system libs
        return fullRefresh ? _this3._loadSystemLibsImpl(classReader) : Promise.resolve();
      });
    }
  }, {
    key: '_loadSystemLibsImpl',
    value: function _loadSystemLibsImpl(classReader) {
      var _this4 = this;

      // Read java system info
      return _ioUtil2['default'].exec('"' + classReader.javaBinDir() + 'java" -verbose', true).then(function (javaSystemInfo) {
        // Load system classes from rt.jar
        var promise = null;
        console.log('autocomplete-java loading system classes.');
        var rtJarPath = (javaSystemInfo.match(/Opened (.*jar)/) || [])[1];
        if (rtJarPath) {
          promise = classReader.readAllClassesFromJar(rtJarPath, function (cp, className, classMembers) {
            return _this4._addClass(className, classMembers, 1);
          });
        } else {
          // TODO reject promise on error and notify about error afterwards
          atom.notifications.addError('autocomplete-java:\njava rt.jar not found', { dismissable: true });
          promise = Promise.resolve();
        }
        return promise;
      });
    }
  }, {
    key: '_addClass',
    value: function _addClass(desc, lastUsed) {
      var _this5 = this;

      var simpleName = _javaUtil2['default'].getSimpleName(desc.className);
      var inverseName = _javaUtil2['default'].getInverseName(desc.className);
      var classDesc = {
        type: 'class',
        name: simpleName,
        simpleName: simpleName,
        className: desc.className,
        extend: desc.extend,
        packageName: _javaUtil2['default'].getPackageName(desc.className),
        lastUsed: lastUsed || 0,
        constructors: [],
        members: []
      };
      this.dict.remove('class', desc.className);
      this.dict.remove('class', inverseName);
      this.dict.add('class', desc.className, classDesc);
      this.dict.add('class', inverseName, classDesc);
      if (desc.members) {
        this.dict.removeCategory(desc.className);
        _lodash._.each(desc.members, function (prototype) {
          _this5._addClassMember(classDesc, prototype, lastUsed);
        });
      }
      return Promise.resolve();
    }
  }, {
    key: '_addClassMember',
    value: function _addClassMember(classDesc, member, lastUsed) {
      try {
        var simpleName = _javaUtil2['default'].getSimpleName(classDesc.className);
        var prototype = member.replace(/\).*/, ');').replace(/,\s/g, ',').trim();
        if (prototype.indexOf('{') !== -1) {
          // console.log('?? ' + prototype);
        } else {
            var type = null;
            if (prototype.indexOf(classDesc.className + '(') !== -1) {
              type = 'constructor';
            } else if (prototype.indexOf('(') !== -1) {
              type = 'method';
            } else {
              type = 'property';
            }

            var _name = type !== 'constructor' ? prototype.match(/\s([^\(\s]*)[\(;]/)[1] : classDesc.simpleName;
            var paramStr = type !== 'property' ? prototype.match(/\((.*)\)/)[1] : null;
            var key = _name + (type !== 'property' ? '(' + paramStr + ')' : '');

            var memberDesc = {
              type: type,
              name: _name,
              simpleName: simpleName,
              className: classDesc.className,
              packageName: classDesc.packageName,
              lastUsed: lastUsed || 0,
              classDesc: classDesc,
              member: {
                name: _name,
                returnType: type !== 'constructor' ? _lodash._.last(prototype.replace(/\(.*\)/, '').match(/([^\s]+)\s/g)).trim() : classDesc.className,
                visibility: this._determineVisibility(prototype),
                params: paramStr ? paramStr.split(',') : null,
                prototype: prototype
              }
            };
            if (type === 'constructor') {
              classDesc.constructors.push(memberDesc);
            } else {
              // const key = (prototype.match(/\s([^\s]*\(.*\));/) ||
              //   prototype.match(/\s([^\s]*);/))[1];
              this.dict.add(classDesc.className, key, memberDesc);
              classDesc.members.push(memberDesc);
            }
          }
      } catch (err) {
        // console.warn(err);
      }
    }
  }, {
    key: '_determineVisibility',
    value: function _determineVisibility(prototype) {
      var v = prototype.split(/\s/)[0];
      return (/public|private|protected/.test(v) ? v : 'package'
      );
    }
  }]);

  return JavaClassLoader;
})();

exports.JavaClassLoader = JavaClassLoader;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1qYXZhL2xpYi9KYXZhQ2xhc3NMb2FkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztzQkFFa0IsUUFBUTs7MEJBQ0MsY0FBYzs7K0JBQ1QsbUJBQW1COztzQkFDaEMsVUFBVTs7Ozt3QkFDUixZQUFZOzs7O0FBTmpDLFdBQVcsQ0FBQzs7SUFRQyxlQUFlO0FBRWYsV0FGQSxlQUFlLENBRWQsUUFBUSxFQUFFOzBCQUZYLGVBQWU7O0FBR3hCLFFBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0FBQ3pCLFFBQUksQ0FBQyxJQUFJLEdBQUcsNEJBQWdCLENBQUM7R0FDOUI7O2VBTFUsZUFBZTs7V0FPZixxQkFBQyxRQUFRLEVBQUU7QUFDcEIsVUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7S0FDMUI7OztXQUVRLG1CQUFDLFVBQVUsRUFBRTtBQUNwQixhQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztLQUM1Qzs7O1dBRWlCLDRCQUFDLFNBQVMsRUFBRTtBQUM1QixVQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzFDLFVBQU0sS0FBSyxHQUFHLFVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFBLENBQUMsRUFBSTtBQUNqQyxlQUFPLENBQUMsQ0FBQyxTQUFTLEtBQUssU0FBUyxDQUFDO09BQ2xDLENBQUMsQ0FBQztBQUNILGFBQU8sS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0tBQ3BDOzs7V0FFYyx5QkFBQyxTQUFTLEVBQUUsVUFBVSxFQUFFO0FBQ3JDLGFBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0tBQzlDOzs7V0FFUyxvQkFBQyxT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QyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsYUFBTywyQkFBMEIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVM7UUFBQztLQUMzRDs7O1NBbE5VLGVBQWUiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLWphdmEvbGliL0phdmFDbGFzc0xvYWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBfIH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IERpY3Rpb25hcnkgfSBmcm9tICcuL0RpY3Rpb25hcnknO1xuaW1wb3J0IHsgSmF2YUNsYXNzUmVhZGVyIH0gZnJvbSAnLi9KYXZhQ2xhc3NSZWFkZXInO1xuaW1wb3J0IGlvVXRpbCBmcm9tICcuL2lvVXRpbCc7XG5pbXBvcnQgamF2YVV0aWwgZnJvbSAnLi9qYXZhVXRpbCc7XG5cbmV4cG9ydCBjbGFzcyBKYXZhQ2xhc3NMb2FkZXIge1xuXG4gIGNvbnN0cnVjdG9yKGphdmFIb21lKSB7XG4gICAgdGhpcy5qYXZhSG9tZSA9IGphdmFIb21lO1xuICAgIHRoaXMuZGljdCA9IG5ldyBEaWN0aW9uYXJ5KCk7XG4gIH1cblxuICBzZXRKYXZhSG9tZShqYXZhSG9tZSkge1xuICAgIHRoaXMuamF2YUhvbWUgPSBqYXZhSG9tZTtcbiAgfVxuXG4gIGZpbmRDbGFzcyhuYW1lUHJlZml4KSB7XG4gICAgcmV0dXJuIHRoaXMuZGljdC5maW5kKCdjbGFzcycsIG5hbWVQcmVmaXgpO1xuICB9XG5cbiAgZmluZFN1cGVyQ2xhc3NOYW1lKGNsYXNzTmFtZSkge1xuICAgIGNvbnN0IGNsYXNzZXMgPSB0aGlzLmZpbmRDbGFzcyhjbGFzc05hbWUpO1xuICAgIGNvbnN0IGNsYXp6ID0gXy5maW5kKGNsYXNzZXMsIGMgPT4ge1xuICAgICAgcmV0dXJuIGMuY2xhc3NOYW1lID09PSBjbGFzc05hbWU7XG4gICAgfSk7XG4gICAgcmV0dXJuIGNsYXp6ID8gY2xhenouZXh0ZW5kIDogbnVsbDtcbiAgfVxuXG4gIGZpbmRDbGFzc01lbWJlcihjbGFzc05hbWUsIG5hbWVQcmVmaXgpIHtcbiAgICByZXR1cm4gdGhpcy5kaWN0LmZpbmQoY2xhc3NOYW1lLCBuYW1lUHJlZml4KTtcbiAgfVxuXG4gIHRvdWNoQ2xhc3MoY2xhc3NOYW1lKSB7XG4gICAgY29uc3QgY2xhc3NEZXNjcyA9IHRoaXMuZmluZENsYXNzKGNsYXNzTmFtZSk7XG4gICAgaWYgKGNsYXNzRGVzY3MubGVuZ3RoKSB7XG4gICAgICB0aGlzLnRvdWNoKGNsYXNzRGVzY3NbMF0pO1xuICAgIH1cbiAgfVxuXG4gIHRvdWNoKGNsYXNzRGVzYykge1xuICAgIHRoaXMuZGljdC50b3VjaChjbGFzc0Rlc2MpO1xuICB9XG5cbiAgbG9hZENsYXNzKGNsYXNzTmFtZSwgY2xhc3NwYXRoLCBsb2FkQ2xhc3NNZW1iZXJzKSB7XG4gICAgY29uc29sZS5sb2coJ2F1dG9jb21wbGV0ZS1qYXZhIGxvYWQgY2xhc3M6ICcgKyBjbGFzc05hbWUpO1xuICAgIGNvbnN0IGNsYXNzUmVhZGVyID0gbmV3IEphdmFDbGFzc1JlYWRlcihsb2FkQ2xhc3NNZW1iZXJzLCB0cnVlLFxuICAgICAgdGhpcy5qYXZhSG9tZSk7XG4gICAgcmV0dXJuIGNsYXNzUmVhZGVyLnJlYWRDbGFzc2VzQnlOYW1lKGNsYXNzcGF0aCwgWyBjbGFzc05hbWUgXSwgdHJ1ZSxcbiAgICAoY3AsIGNsYXNzRGVzYykgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMuX2FkZENsYXNzKGNsYXNzRGVzYywgRGF0ZS5ub3coKSk7XG4gICAgfSk7XG4gIH1cblxuICBsb2FkQ2xhc3NlcyhjbGFzc3BhdGgsIGxvYWRDbGFzc01lbWJlcnMsIGZ1bGxSZWZyZXNoKSB7XG4gICAgbGV0IHByb21pc2UgPSBudWxsO1xuICAgIGlmIChmdWxsUmVmcmVzaCAmJiB0aGlzLmZ1bGxSZWZyZXNoT25nb2luZykge1xuICAgICAgLy8gVE9ETyByZWplY3QgcHJvbWlzZSBvbiB3YXJuaW5nIGFuZCBub3RpZnkgYWJvdXQgd2FybmluZyBhZnRlcndhcmRzXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnYXV0b2NvbXBsZXRlLWphdmE6XFxuICcgK1xuICAgICAgICAnRnVsbCByZWZyZXNoIGFscmVhZHkgaW4gcHJvZ3Jlc3MuIEV4ZWN1dGUgbm9ybWFsIHJlZnJlc2ggb3IgJyArXG4gICAgICAgICd0cnkgZnVsbCByZWZyZXNoIGFnYWluIGxhdGVyLicsIHsgZGlzbWlzc2FibGU6IHRydWUgfSk7XG4gICAgICBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCdhdXRvY29tcGxldGUtamF2YSBsb2FkIHN0YXJ0LCBmdWxsIHJlZnJlc2g6ICcgKyBmdWxsUmVmcmVzaCk7XG4gICAgICBpZiAoZnVsbFJlZnJlc2gpIHtcbiAgICAgICAgdGhpcy5mdWxsUmVmcmVzaE9uZ29pbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLmRpY3QgPSBuZXcgRGljdGlvbmFyeSgpO1xuICAgICAgfVxuXG4gICAgICAvLyBGaXJzdCBsb2FkIGJhc2ljIGNsYXNzIGRlc2NyaXB0aW9uc1xuICAgICAgcHJvbWlzZSA9IHRoaXMuX2xvYWRDbGFzc2VzSW1wbChjbGFzc3BhdGgsIGZhbHNlLCBmdWxsUmVmcmVzaClcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgLy8gVGhlbiwgb3B0aW9uYWxseSwgbG9hZCBhbHNvIGNsYXNzIG1lbWJlcnNcbiAgICAgICAgaWYgKGxvYWRDbGFzc01lbWJlcnMpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fbG9hZENsYXNzZXNJbXBsKGNsYXNzcGF0aCwgdHJ1ZSwgZnVsbFJlZnJlc2gpO1xuICAgICAgICB9XG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgLy8gTG9hZGluZyBmaW5pc2hlZFxuICAgICAgICBpZiAoZnVsbFJlZnJlc2gpIHtcbiAgICAgICAgICB0aGlzLmZ1bGxSZWZyZXNoT25nb2luZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKCdhdXRvY29tcGxldGUtamF2YSBsb2FkIGVuZCwgZnVsbCByZWZyZXNoOiAnICsgZnVsbFJlZnJlc2gpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgX2xvYWRDbGFzc2VzSW1wbChjbGFzc3BhdGgsIGxvYWRDbGFzc01lbWJlcnMsIGZ1bGxSZWZyZXNoKSB7XG4gICAgY29uc3QgY2xhc3NSZWFkZXIgPSBuZXcgSmF2YUNsYXNzUmVhZGVyKGxvYWRDbGFzc01lbWJlcnMsIHRydWUsXG4gICAgICB0aGlzLmphdmFIb21lKTtcblxuICAgIC8vIEZpcnN0IGxvYWQgcHJvamVjdCBjbGFzc2VzXG4gICAgY29uc29sZS5sb2coJ2F1dG9jb21wbGV0ZS1qYXZhIGxvYWRpbmcgcHJvamVjdCBjbGFzc2VzLiBsb2FkTWVtYmVyczogJyArXG4gICAgICBsb2FkQ2xhc3NNZW1iZXJzKTtcbiAgICByZXR1cm4gY2xhc3NSZWFkZXIucmVhZEFsbENsYXNzZXNGcm9tQ2xhc3NwYXRoKGNsYXNzcGF0aCwgIWZ1bGxSZWZyZXNoLFxuICAgIChjcCwgY2xhc3NOYW1lLCBjbGFzc01lbWJlcnMpID0+IHtcbiAgICAgIC8vIEFkZCBjbGFzc1xuICAgICAgLy8gMCAvIDIgPSBjbGFzcyBmaWxlcyBoYXZlIGEgcHJpb3JpdHkgb3ZlciBqYXJzIGFtb25nIHN1Z2dlc3Rpb25zXG4gICAgICByZXR1cm4gdGhpcy5fYWRkQ2xhc3MoY2xhc3NOYW1lLCBjbGFzc01lbWJlcnMsXG4gICAgICAgIGNwLmluZGV4T2YoJy5qYXInKSAhPT0gLTEgPyAwIDogMik7XG4gICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAvLyBUaGVuIGxvYWQgc3lzdGVtIGxpYnNcbiAgICAgIHJldHVybiBmdWxsUmVmcmVzaCA/IHRoaXMuX2xvYWRTeXN0ZW1MaWJzSW1wbChjbGFzc1JlYWRlcikgOlxuICAgICAgICBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9sb2FkU3lzdGVtTGlic0ltcGwoY2xhc3NSZWFkZXIpIHtcbiAgICAvLyBSZWFkIGphdmEgc3lzdGVtIGluZm9cbiAgICByZXR1cm4gaW9VdGlsLmV4ZWMoJ1wiJyArIGNsYXNzUmVhZGVyLmphdmFCaW5EaXIoKSArICdqYXZhXCIgLXZlcmJvc2UnLCB0cnVlKVxuICAgIC50aGVuKChqYXZhU3lzdGVtSW5mbykgPT4ge1xuICAgICAgLy8gTG9hZCBzeXN0ZW0gY2xhc3NlcyBmcm9tIHJ0LmphclxuICAgICAgbGV0IHByb21pc2UgPSBudWxsO1xuICAgICAgY29uc29sZS5sb2coJ2F1dG9jb21wbGV0ZS1qYXZhIGxvYWRpbmcgc3lzdGVtIGNsYXNzZXMuJyk7XG4gICAgICBjb25zdCBydEphclBhdGggPSAoamF2YVN5c3RlbUluZm8ubWF0Y2goL09wZW5lZCAoLipqYXIpLykgfHwgW10pWzFdO1xuICAgICAgaWYgKHJ0SmFyUGF0aCkge1xuICAgICAgICBwcm9taXNlID0gY2xhc3NSZWFkZXIucmVhZEFsbENsYXNzZXNGcm9tSmFyKHJ0SmFyUGF0aCxcbiAgICAgICAgKGNwLCBjbGFzc05hbWUsIGNsYXNzTWVtYmVycykgPT4ge1xuICAgICAgICAgIHJldHVybiB0aGlzLl9hZGRDbGFzcyhjbGFzc05hbWUsIGNsYXNzTWVtYmVycywgMSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVE9ETyByZWplY3QgcHJvbWlzZSBvbiBlcnJvciBhbmQgbm90aWZ5IGFib3V0IGVycm9yIGFmdGVyd2FyZHNcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdhdXRvY29tcGxldGUtamF2YTpcXG5qYXZhIHJ0LmphciBub3QgZm91bmQnLFxuICAgICAgICAgIHsgZGlzbWlzc2FibGU6IHRydWUgfSk7XG4gICAgICAgIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH0pO1xuICB9XG5cbiAgX2FkZENsYXNzKGRlc2MsIGxhc3RVc2VkKSB7XG4gICAgY29uc3Qgc2ltcGxlTmFtZSA9IGphdmFVdGlsLmdldFNpbXBsZU5hbWUoZGVzYy5jbGFzc05hbWUpO1xuICAgIGNvbnN0IGludmVyc2VOYW1lID0gamF2YVV0aWwuZ2V0SW52ZXJzZU5hbWUoZGVzYy5jbGFzc05hbWUpO1xuICAgIGNvbnN0IGNsYXNzRGVzYyA9IHtcbiAgICAgIHR5cGU6ICdjbGFzcycsXG4gICAgICBuYW1lOiBzaW1wbGVOYW1lLFxuICAgICAgc2ltcGxlTmFtZTogc2ltcGxlTmFtZSxcbiAgICAgIGNsYXNzTmFtZTogZGVzYy5jbGFzc05hbWUsXG4gICAgICBleHRlbmQ6IGRlc2MuZXh0ZW5kLFxuICAgICAgcGFja2FnZU5hbWU6IGphdmFVdGlsLmdldFBhY2thZ2VOYW1lKGRlc2MuY2xhc3NOYW1lKSxcbiAgICAgIGxhc3RVc2VkOiBsYXN0VXNlZCB8fCAwLFxuICAgICAgY29uc3RydWN0b3JzOiBbXSxcbiAgICAgIG1lbWJlcnM6IFtdLFxuICAgIH07XG4gICAgdGhpcy5kaWN0LnJlbW92ZSgnY2xhc3MnLCBkZXNjLmNsYXNzTmFtZSk7XG4gICAgdGhpcy5kaWN0LnJlbW92ZSgnY2xhc3MnLCBpbnZlcnNlTmFtZSk7XG4gICAgdGhpcy5kaWN0LmFkZCgnY2xhc3MnLCBkZXNjLmNsYXNzTmFtZSwgY2xhc3NEZXNjKTtcbiAgICB0aGlzLmRpY3QuYWRkKCdjbGFzcycsIGludmVyc2VOYW1lLCBjbGFzc0Rlc2MpO1xuICAgIGlmIChkZXNjLm1lbWJlcnMpIHtcbiAgICAgIHRoaXMuZGljdC5yZW1vdmVDYXRlZ29yeShkZXNjLmNsYXNzTmFtZSk7XG4gICAgICBfLmVhY2goZGVzYy5tZW1iZXJzLCBwcm90b3R5cGUgPT4ge1xuICAgICAgICB0aGlzLl9hZGRDbGFzc01lbWJlcihjbGFzc0Rlc2MsIHByb3RvdHlwZSwgbGFzdFVzZWQpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuXG4gIF9hZGRDbGFzc01lbWJlcihjbGFzc0Rlc2MsIG1lbWJlciwgbGFzdFVzZWQpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc2ltcGxlTmFtZSA9IGphdmFVdGlsLmdldFNpbXBsZU5hbWUoY2xhc3NEZXNjLmNsYXNzTmFtZSk7XG4gICAgICBjb25zdCBwcm90b3R5cGUgPSBtZW1iZXIucmVwbGFjZSgvXFwpLiovLCAnKTsnKVxuICAgICAgICAucmVwbGFjZSgvLFxccy9nLCAnLCcpLnRyaW0oKTtcbiAgICAgIGlmIChwcm90b3R5cGUuaW5kZXhPZigneycpICE9PSAtMSkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnPz8gJyArIHByb3RvdHlwZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgdHlwZSA9IG51bGw7XG4gICAgICAgIGlmIChwcm90b3R5cGUuaW5kZXhPZihjbGFzc0Rlc2MuY2xhc3NOYW1lICsgJygnKSAhPT0gLTEpIHtcbiAgICAgICAgICB0eXBlID0gJ2NvbnN0cnVjdG9yJztcbiAgICAgICAgfSBlbHNlIGlmIChwcm90b3R5cGUuaW5kZXhPZignKCcpICE9PSAtMSkge1xuICAgICAgICAgIHR5cGUgPSAnbWV0aG9kJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0eXBlID0gJ3Byb3BlcnR5JztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG5hbWUgPSB0eXBlICE9PSAnY29uc3RydWN0b3InID9cbiAgICAgICAgICBwcm90b3R5cGUubWF0Y2goL1xccyhbXlxcKFxcc10qKVtcXCg7XS8pWzFdIDogY2xhc3NEZXNjLnNpbXBsZU5hbWU7XG4gICAgICAgIGNvbnN0IHBhcmFtU3RyID0gdHlwZSAhPT0gJ3Byb3BlcnR5JyA/XG4gICAgICAgICAgcHJvdG90eXBlLm1hdGNoKC9cXCgoLiopXFwpLylbMV0gOiBudWxsO1xuICAgICAgICBjb25zdCBrZXkgPSBuYW1lICsgKHR5cGUgIT09ICdwcm9wZXJ0eScgPyAnKCcgKyBwYXJhbVN0ciArICcpJyA6ICcnKTtcblxuICAgICAgICBjb25zdCBtZW1iZXJEZXNjID0ge1xuICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICBzaW1wbGVOYW1lOiBzaW1wbGVOYW1lLFxuICAgICAgICAgIGNsYXNzTmFtZTogY2xhc3NEZXNjLmNsYXNzTmFtZSxcbiAgICAgICAgICBwYWNrYWdlTmFtZTogY2xhc3NEZXNjLnBhY2thZ2VOYW1lLFxuICAgICAgICAgIGxhc3RVc2VkOiBsYXN0VXNlZCB8fCAwLFxuICAgICAgICAgIGNsYXNzRGVzYzogY2xhc3NEZXNjLFxuICAgICAgICAgIG1lbWJlcjoge1xuICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgIHJldHVyblR5cGU6IHR5cGUgIT09ICdjb25zdHJ1Y3RvcidcbiAgICAgICAgICAgICAgPyBfLmxhc3QocHJvdG90eXBlLnJlcGxhY2UoL1xcKC4qXFwpLywgJycpXG4gICAgICAgICAgICAgICAgICAubWF0Y2goLyhbXlxcc10rKVxccy9nKSkudHJpbSgpXG4gICAgICAgICAgICAgIDogY2xhc3NEZXNjLmNsYXNzTmFtZSxcbiAgICAgICAgICAgIHZpc2liaWxpdHk6IHRoaXMuX2RldGVybWluZVZpc2liaWxpdHkocHJvdG90eXBlKSxcbiAgICAgICAgICAgIHBhcmFtczogcGFyYW1TdHIgPyBwYXJhbVN0ci5zcGxpdCgnLCcpIDogbnVsbCxcbiAgICAgICAgICAgIHByb3RvdHlwZTogcHJvdG90eXBlLFxuICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0eXBlID09PSAnY29uc3RydWN0b3InKSB7XG4gICAgICAgICAgY2xhc3NEZXNjLmNvbnN0cnVjdG9ycy5wdXNoKG1lbWJlckRlc2MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGNvbnN0IGtleSA9IChwcm90b3R5cGUubWF0Y2goL1xccyhbXlxcc10qXFwoLipcXCkpOy8pIHx8XG4gICAgICAgICAgLy8gICBwcm90b3R5cGUubWF0Y2goL1xccyhbXlxcc10qKTsvKSlbMV07XG4gICAgICAgICAgdGhpcy5kaWN0LmFkZChjbGFzc0Rlc2MuY2xhc3NOYW1lLCBrZXksIG1lbWJlckRlc2MpO1xuICAgICAgICAgIGNsYXNzRGVzYy5tZW1iZXJzLnB1c2gobWVtYmVyRGVzYyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIC8vIGNvbnNvbGUud2FybihlcnIpO1xuICAgIH1cbiAgfVxuXG4gIF9kZXRlcm1pbmVWaXNpYmlsaXR5KHByb3RvdHlwZSkge1xuICAgIGNvbnN0IHYgPSBwcm90b3R5cGUuc3BsaXQoL1xccy8pWzBdO1xuICAgIHJldHVybiAvcHVibGljfHByaXZhdGV8cHJvdGVjdGVkLy50ZXN0KHYpID8gdiA6ICdwYWNrYWdlJztcbiAgfVxuXG59XG4iXX0=