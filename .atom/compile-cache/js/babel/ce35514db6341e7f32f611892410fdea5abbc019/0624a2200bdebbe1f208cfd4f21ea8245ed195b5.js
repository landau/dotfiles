Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _validate = require('./validate');

var Validate = _interopRequireWildcard(_validate);

var _helpers = require('./helpers');

var IndieDelegate = (function () {
  function IndieDelegate(indie, version) {
    _classCallCheck(this, IndieDelegate);

    this.indie = indie;
    this.scope = 'project';
    this.version = version;
    this.emitter = new _atom.Emitter();
    this.messages = new Map();
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(this.emitter);
  }

  _createClass(IndieDelegate, [{
    key: 'getMessages',
    value: function getMessages() {
      return Array.from(this.messages.values()).reduce(function (toReturn, entry) {
        return toReturn.concat(entry);
      }, []);
    }
  }, {
    key: 'deleteMessages',
    value: function deleteMessages() {
      if (this.version === 1) {
        this.clearMessages();
      } else {
        throw new Error('Call to depreciated method deleteMessages(). Use clearMessages() insead');
      }
    }
  }, {
    key: 'clearMessages',
    value: function clearMessages() {
      if (!this.subscriptions.disposed) {
        this.emitter.emit('did-update', []);
        this.messages.clear();
      }
    }
  }, {
    key: 'setMessages',
    value: function setMessages(filePathOrMessages) {
      var messages = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      // Legacy support area
      if (this.version === 1) {
        if (!Array.isArray(filePathOrMessages)) {
          throw new Error('Parameter 1 to setMessages() must be Array');
        }
        this.setAllMessages(filePathOrMessages);
        return;
      }

      // v2 Support from here on
      if (typeof filePathOrMessages !== 'string' || !Array.isArray(messages)) {
        throw new Error('Invalid Parameters to setMessages()');
      }
      var filePath = filePathOrMessages;
      if (this.subscriptions.disposed || !Validate.messages(this.name, messages)) {
        return;
      }
      messages.forEach(function (message) {
        if (message.location.file !== filePath) {
          console.debug('[Linter-UI-Default] Expected File', filePath, 'Message', message);
          throw new Error('message.location.file does not match the given filePath');
        }
      });

      (0, _helpers.normalizeMessages)(this.name, messages);
      this.messages.set(filePath, messages);
      this.emitter.emit('did-update', this.getMessages());
    }
  }, {
    key: 'setAllMessages',
    value: function setAllMessages(messages) {
      if (this.subscriptions.disposed) {
        return;
      }

      if (this.version === 1) {
        if (!Validate.messagesLegacy(this.name, messages)) return;
        (0, _helpers.normalizeMessagesLegacy)(this.name, messages);
      } else {
        if (!Validate.messages(this.name, messages)) return;
        (0, _helpers.normalizeMessages)(this.name, messages);
      }

      this.messages.clear();
      for (var i = 0, _length = messages.length; i < _length; ++i) {
        var message = messages[i];
        var filePath = message.version === 1 ? message.filePath : message.location.file;
        var fileMessages = this.messages.get(filePath);
        if (!fileMessages) {
          this.messages.set(filePath, fileMessages = []);
        }
        fileMessages.push(message);
      }
      this.emitter.emit('did-update', this.getMessages());
    }
  }, {
    key: 'onDidUpdate',
    value: function onDidUpdate(callback) {
      return this.emitter.on('did-update', callback);
    }
  }, {
    key: 'onDidDestroy',
    value: function onDidDestroy(callback) {
      return this.emitter.on('did-destroy', callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.emitter.emit('did-destroy');
      this.subscriptions.dispose();
      this.messages.clear();
    }
  }, {
    key: 'name',
    get: function get() {
      return this.indie.name;
    }
  }]);

  return IndieDelegate;
})();

exports['default'] = IndieDelegate;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvaW5kaWUtZGVsZWdhdGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztvQkFFNkMsTUFBTTs7d0JBR3pCLFlBQVk7O0lBQTFCLFFBQVE7O3VCQUN1QyxXQUFXOztJQUdqRCxhQUFhO0FBUXJCLFdBUlEsYUFBYSxDQVFwQixLQUFZLEVBQUUsT0FBYyxFQUFFOzBCQVJ2QixhQUFhOztBQVM5QixRQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtBQUNsQixRQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQTtBQUN0QixRQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTtBQUN0QixRQUFJLENBQUMsT0FBTyxHQUFHLG1CQUFhLENBQUE7QUFDNUIsUUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO0FBQ3pCLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7O0FBRTlDLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtHQUNyQzs7ZUFqQmtCLGFBQWE7O1dBcUJyQix1QkFBbUM7QUFDNUMsYUFBTyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBUyxRQUFRLEVBQUUsS0FBSyxFQUFFO0FBQ3pFLGVBQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtPQUM5QixFQUFFLEVBQUUsQ0FBQyxDQUFBO0tBQ1A7OztXQUNhLDBCQUFTO0FBQ3JCLFVBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxDQUFDLEVBQUU7QUFDdEIsWUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFBO09BQ3JCLE1BQU07QUFDTCxjQUFNLElBQUksS0FBSyxDQUFDLHlFQUF5RSxDQUFDLENBQUE7T0FDM0Y7S0FD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O0FBQ2pGLFlBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzlDLFlBQUksQ0FBQyxZQUFZLEVBQUU7QUFDakIsY0FBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFlBQVksR0FBRyxFQUFFLENBQUMsQ0FBQTtTQUMvQztBQUNELG9CQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO09BQzNCO0FBQ0QsVUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFBO0tBQ3BEOzs7V0FDVSxxQkFBQyxRQUFrQixFQUFjO0FBQzFDLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQy9DOzs7V0FDVyxzQkFBQyxRQUFrQixFQUFjO0FBQzNDLGFBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQ2hEOzs7V0FDTSxtQkFBUztBQUNkLFVBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBO0FBQ2hDLFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDNUIsVUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtLQUN0Qjs7O1NBckZPLGVBQVc7QUFDakIsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQTtLQUN2Qjs7O1NBcEJrQixhQUFhOzs7cUJBQWIsYUFBYSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL2luZGllLWRlbGVnYXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgRW1pdHRlciwgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5pbXBvcnQgdHlwZSB7IERpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuXG5pbXBvcnQgKiBhcyBWYWxpZGF0ZSBmcm9tICcuL3ZhbGlkYXRlJ1xuaW1wb3J0IHsgbm9ybWFsaXplTWVzc2FnZXMsIG5vcm1hbGl6ZU1lc3NhZ2VzTGVnYWN5IH0gZnJvbSAnLi9oZWxwZXJzJ1xuaW1wb3J0IHR5cGUgeyBJbmRpZSwgTWVzc2FnZSwgTWVzc2FnZUxlZ2FjeSB9IGZyb20gJy4vdHlwZXMnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEluZGllRGVsZWdhdGUge1xuICBpbmRpZTogSW5kaWU7XG4gIHNjb3BlOiAncHJvamVjdCc7XG4gIGVtaXR0ZXI6IEVtaXR0ZXI7XG4gIHZlcnNpb246IDEgfCAyXG4gIG1lc3NhZ2VzOiBNYXA8P3N0cmluZywgQXJyYXk8TWVzc2FnZSB8IE1lc3NhZ2VMZWdhY3k+PjtcbiAgc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcihpbmRpZTogSW5kaWUsIHZlcnNpb246IDEgfCAyKSB7XG4gICAgdGhpcy5pbmRpZSA9IGluZGllXG4gICAgdGhpcy5zY29wZSA9ICdwcm9qZWN0J1xuICAgIHRoaXMudmVyc2lvbiA9IHZlcnNpb25cbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG4gICAgdGhpcy5tZXNzYWdlcyA9IG5ldyBNYXAoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5lbWl0dGVyKVxuICB9XG4gIGdldCBuYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuaW5kaWUubmFtZVxuICB9XG4gIGdldE1lc3NhZ2VzKCk6IEFycmF5PE1lc3NhZ2UgfCBNZXNzYWdlTGVnYWN5PiB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5tZXNzYWdlcy52YWx1ZXMoKSkucmVkdWNlKGZ1bmN0aW9uKHRvUmV0dXJuLCBlbnRyeSkge1xuICAgICAgcmV0dXJuIHRvUmV0dXJuLmNvbmNhdChlbnRyeSlcbiAgICB9LCBbXSlcbiAgfVxuICBkZWxldGVNZXNzYWdlcygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy52ZXJzaW9uID09PSAxKSB7XG4gICAgICB0aGlzLmNsZWFyTWVzc2FnZXMoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbGwgdG8gZGVwcmVjaWF0ZWQgbWV0aG9kIGRlbGV0ZU1lc3NhZ2VzKCkuIFVzZSBjbGVhck1lc3NhZ2VzKCkgaW5zZWFkJylcbiAgICB9XG4gIH1cbiAgY2xlYXJNZXNzYWdlcygpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlZCkge1xuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoJ2RpZC11cGRhdGUnLCBbXSlcbiAgICAgIHRoaXMubWVzc2FnZXMuY2xlYXIoKVxuICAgIH1cbiAgfVxuICBzZXRNZXNzYWdlcyhmaWxlUGF0aE9yTWVzc2FnZXM6IHN0cmluZyB8IEFycmF5PE9iamVjdD4sIG1lc3NhZ2VzOiA/QXJyYXk8T2JqZWN0PiA9IG51bGwpOiB2b2lkIHtcbiAgICAvLyBMZWdhY3kgc3VwcG9ydCBhcmVhXG4gICAgaWYgKHRoaXMudmVyc2lvbiA9PT0gMSkge1xuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGZpbGVQYXRoT3JNZXNzYWdlcykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQYXJhbWV0ZXIgMSB0byBzZXRNZXNzYWdlcygpIG11c3QgYmUgQXJyYXknKVxuICAgICAgfVxuICAgICAgdGhpcy5zZXRBbGxNZXNzYWdlcyhmaWxlUGF0aE9yTWVzc2FnZXMpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyB2MiBTdXBwb3J0IGZyb20gaGVyZSBvblxuICAgIGlmICh0eXBlb2YgZmlsZVBhdGhPck1lc3NhZ2VzICE9PSAnc3RyaW5nJyB8fCAhQXJyYXkuaXNBcnJheShtZXNzYWdlcykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBQYXJhbWV0ZXJzIHRvIHNldE1lc3NhZ2VzKCknKVxuICAgIH1cbiAgICBjb25zdCBmaWxlUGF0aCA9IGZpbGVQYXRoT3JNZXNzYWdlc1xuICAgIGlmICh0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZWQgfHwgIVZhbGlkYXRlLm1lc3NhZ2VzKHRoaXMubmFtZSwgbWVzc2FnZXMpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbWVzc2FnZXMuZm9yRWFjaChmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgICBpZiAobWVzc2FnZS5sb2NhdGlvbi5maWxlICE9PSBmaWxlUGF0aCkge1xuICAgICAgICBjb25zb2xlLmRlYnVnKCdbTGludGVyLVVJLURlZmF1bHRdIEV4cGVjdGVkIEZpbGUnLCBmaWxlUGF0aCwgJ01lc3NhZ2UnLCBtZXNzYWdlKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ21lc3NhZ2UubG9jYXRpb24uZmlsZSBkb2VzIG5vdCBtYXRjaCB0aGUgZ2l2ZW4gZmlsZVBhdGgnKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBub3JtYWxpemVNZXNzYWdlcyh0aGlzLm5hbWUsIG1lc3NhZ2VzKVxuICAgIHRoaXMubWVzc2FnZXMuc2V0KGZpbGVQYXRoLCBtZXNzYWdlcylcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLXVwZGF0ZScsIHRoaXMuZ2V0TWVzc2FnZXMoKSlcbiAgfVxuICBzZXRBbGxNZXNzYWdlcyhtZXNzYWdlczogQXJyYXk8T2JqZWN0Pik6IHZvaWQge1xuICAgIGlmICh0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZWQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmICh0aGlzLnZlcnNpb24gPT09IDEpIHtcbiAgICAgIGlmICghVmFsaWRhdGUubWVzc2FnZXNMZWdhY3kodGhpcy5uYW1lLCBtZXNzYWdlcykpIHJldHVyblxuICAgICAgbm9ybWFsaXplTWVzc2FnZXNMZWdhY3kodGhpcy5uYW1lLCBtZXNzYWdlcylcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFWYWxpZGF0ZS5tZXNzYWdlcyh0aGlzLm5hbWUsIG1lc3NhZ2VzKSkgcmV0dXJuXG4gICAgICBub3JtYWxpemVNZXNzYWdlcyh0aGlzLm5hbWUsIG1lc3NhZ2VzKVxuICAgIH1cblxuICAgIHRoaXMubWVzc2FnZXMuY2xlYXIoKVxuICAgIGZvciAobGV0IGkgPSAwLCBsZW5ndGggPSBtZXNzYWdlcy5sZW5ndGg7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgICAgY29uc3QgbWVzc2FnZTogTWVzc2FnZSB8IE1lc3NhZ2VMZWdhY3kgPSBtZXNzYWdlc1tpXVxuICAgICAgY29uc3QgZmlsZVBhdGggPSBtZXNzYWdlLnZlcnNpb24gPT09IDEgPyBtZXNzYWdlLmZpbGVQYXRoIDogbWVzc2FnZS5sb2NhdGlvbi5maWxlXG4gICAgICBsZXQgZmlsZU1lc3NhZ2VzID0gdGhpcy5tZXNzYWdlcy5nZXQoZmlsZVBhdGgpXG4gICAgICBpZiAoIWZpbGVNZXNzYWdlcykge1xuICAgICAgICB0aGlzLm1lc3NhZ2VzLnNldChmaWxlUGF0aCwgZmlsZU1lc3NhZ2VzID0gW10pXG4gICAgICB9XG4gICAgICBmaWxlTWVzc2FnZXMucHVzaChtZXNzYWdlKVxuICAgIH1cbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLXVwZGF0ZScsIHRoaXMuZ2V0TWVzc2FnZXMoKSlcbiAgfVxuICBvbkRpZFVwZGF0ZShjYWxsYmFjazogRnVuY3Rpb24pOiBEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0dGVyLm9uKCdkaWQtdXBkYXRlJywgY2FsbGJhY2spXG4gIH1cbiAgb25EaWREZXN0cm95KGNhbGxiYWNrOiBGdW5jdGlvbik6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLmVtaXR0ZXIub24oJ2RpZC1kZXN0cm95JywgY2FsbGJhY2spXG4gIH1cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmVtaXR0ZXIuZW1pdCgnZGlkLWRlc3Ryb3knKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB0aGlzLm1lc3NhZ2VzLmNsZWFyKClcbiAgfVxufVxuIl19