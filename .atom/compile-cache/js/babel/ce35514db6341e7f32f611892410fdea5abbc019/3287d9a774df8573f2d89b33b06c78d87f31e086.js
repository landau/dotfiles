var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _sbDebounce = require('sb-debounce');

var _sbDebounce2 = _interopRequireDefault(_sbDebounce);

var _helpers = require('./helpers');

var MessageRegistry = (function () {
  function MessageRegistry() {
    _classCallCheck(this, MessageRegistry);

    this.emitter = new _atom.Emitter();
    this.messages = [];
    this.messagesMap = new Set();
    this.subscriptions = new _atom.CompositeDisposable();
    this.debouncedUpdate = (0, _sbDebounce2['default'])(this.update, 100, true);

    this.subscriptions.add(this.emitter);
  }

  _createClass(MessageRegistry, [{
    key: 'set',
    value: function set(_ref) {
      var messages = _ref.messages;
      var linter = _ref.linter;
      var buffer = _ref.buffer;
      return (function () {
        var found = null;
        for (var entry of this.messagesMap) {
          if (entry.buffer === buffer && entry.linter === linter) {
            found = entry;
            break;
          }
        }

        if (found) {
          found.messages = messages;
          found.changed = true;
        } else {
          this.messagesMap.add({ messages: messages, linter: linter, buffer: buffer, oldMessages: [], changed: true, deleted: false });
        }
        this.debouncedUpdate();
      }).apply(this, arguments);
    }
  }, {
    key: 'update',
    value: function update() {
      var result = { added: [], removed: [], messages: [] };

      for (var entry of this.messagesMap) {
        if (entry.deleted) {
          result.removed = result.removed.concat(entry.oldMessages);
          this.messagesMap['delete'](entry);
          continue;
        }
        if (!entry.changed) {
          result.messages = result.messages.concat(entry.oldMessages);
          continue;
        }
        entry.changed = false;
        if (!entry.oldMessages.length) {
          // All messages are new, no need to diff
          // NOTE: No need to add .key here because normalizeMessages already does that
          result.added = result.added.concat(entry.messages);
          result.messages = result.messages.concat(entry.messages);
          entry.oldMessages = entry.messages;
          continue;
        }
        if (!entry.messages.length) {
          // All messages are old, no need to diff
          result.removed = result.removed.concat(entry.oldMessages);
          entry.oldMessages = [];
          continue;
        }

        var newKeys = new Set();
        var oldKeys = new Set();
        var _oldMessages = entry.oldMessages;
        var foundNew = false;
        entry.oldMessages = [];

        for (var i = 0, _length = _oldMessages.length; i < _length; ++i) {
          var message = _oldMessages[i];
          if (message.version === 2) {
            message.key = (0, _helpers.messageKey)(message);
          } else {
            message.key = (0, _helpers.messageKeyLegacy)(message);
          }
          oldKeys.add(message.key);
        }

        for (var i = 0, _length2 = entry.messages.length; i < _length2; ++i) {
          var message = entry.messages[i];
          if (newKeys.has(message.key)) {
            continue;
          }
          newKeys.add(message.key);
          if (!oldKeys.has(message.key)) {
            foundNew = true;
            result.added.push(message);
            result.messages.push(message);
            entry.oldMessages.push(message);
          }
        }

        if (!foundNew && entry.messages.length === _oldMessages.length) {
          // Messages are unchanged
          result.messages = result.messages.concat(_oldMessages);
          entry.oldMessages = _oldMessages;
          continue;
        }

        for (var i = 0, _length3 = _oldMessages.length; i < _length3; ++i) {
          var message = _oldMessages[i];
          if (newKeys.has(message.key)) {
            entry.oldMessages.push(message);
            result.messages.push(message);
          } else {
            result.removed.push(message);
          }
        }
      }

      if (result.added.length || result.removed.length) {
        this.messages = result.messages;
        this.emitter.emit('did-update-messages', result);
      }
    }
  }, {
    key: 'onDidUpdateMessages',
    value: function onDidUpdateMessages(callback) {
      return this.emitter.on('did-update-messages', callback);
    }
  }, {
    key: 'deleteByBuffer',
    value: function deleteByBuffer(buffer) {
      for (var entry of this.messagesMap) {
        if (entry.buffer === buffer) {
          entry.deleted = true;
        }
      }
      this.debouncedUpdate();
    }
  }, {
    key: 'deleteByLinter',
    value: function deleteByLinter(linter) {
      for (var entry of this.messagesMap) {
        if (entry.linter === linter) {
          entry.deleted = true;
        }
      }
      this.debouncedUpdate();
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.subscriptions.dispose();
    }
  }]);

  return MessageRegistry;
})();

module.exports = MessageRegistry;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL2xpbnRlci9saWIvbWVzc2FnZS1yZWdpc3RyeS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7b0JBRTZDLE1BQU07OzBCQUM5QixhQUFhOzs7O3VCQUVXLFdBQVc7O0lBWWxELGVBQWU7QUFPUixXQVBQLGVBQWUsR0FPTDswQkFQVixlQUFlOztBQVFqQixRQUFJLENBQUMsT0FBTyxHQUFHLG1CQUFhLENBQUE7QUFDNUIsUUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUE7QUFDbEIsUUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFBO0FBQzVCLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7QUFDOUMsUUFBSSxDQUFDLGVBQWUsR0FBRyw2QkFBUyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQTs7QUFFdkQsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQ3JDOztlQWZHLGVBQWU7O1dBZ0JoQixhQUFDLElBQThHO1VBQTVHLFFBQVEsR0FBVixJQUE4RyxDQUE1RyxRQUFRO1VBQUUsTUFBTSxHQUFsQixJQUE4RyxDQUFsRyxNQUFNO1VBQUUsTUFBTSxHQUExQixJQUE4RyxDQUExRixNQUFNOzBCQUFzRjtBQUNsSCxZQUFJLEtBQUssR0FBRyxJQUFJLENBQUE7QUFDaEIsYUFBSyxJQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO0FBQ3BDLGNBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxNQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxNQUFNLEVBQUU7QUFDdEQsaUJBQUssR0FBRyxLQUFLLENBQUE7QUFDYixrQkFBSztXQUNOO1NBQ0Y7O0FBRUQsWUFBSSxLQUFLLEVBQUU7QUFDVCxlQUFLLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtB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YUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFBO0tBQzdCOzs7U0F4SUcsZUFBZTs7O0FBMklyQixNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQSIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS9kb3RmaWxlcy8uYXRvbS9wYWNrYWdlcy9saW50ZXIvbGliL21lc3NhZ2UtcmVnaXN0cnkuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlLCBFbWl0dGVyIH0gZnJvbSAnYXRvbSdcbmltcG9ydCBkZWJvdW5jZSBmcm9tICdzYi1kZWJvdW5jZSdcbmltcG9ydCB0eXBlIHsgRGlzcG9zYWJsZSwgVGV4dEJ1ZmZlciB9IGZyb20gJ2F0b20nXG5pbXBvcnQgeyBtZXNzYWdlS2V5LCBtZXNzYWdlS2V5TGVnYWN5IH0gZnJvbSAnLi9oZWxwZXJzJ1xuaW1wb3J0IHR5cGUgeyBNZXNzYWdlc1BhdGNoLCBNZXNzYWdlLCBNZXNzYWdlTGVnYWN5LCBMaW50ZXIgfSBmcm9tICcuL3R5cGVzJ1xuXG50eXBlIExpbnRlciRNZXNzYWdlJE1hcCA9IHtcbiAgYnVmZmVyOiA/VGV4dEJ1ZmZlcixcbiAgbGludGVyOiBMaW50ZXIsXG4gIGNoYW5nZWQ6IGJvb2xlYW4sXG4gIGRlbGV0ZWQ6IGJvb2xlYW4sXG4gIG1lc3NhZ2VzOiBBcnJheTxNZXNzYWdlIHwgTWVzc2FnZUxlZ2FjeT4sXG4gIG9sZE1lc3NhZ2VzOiBBcnJheTxNZXNzYWdlIHwgTWVzc2FnZUxlZ2FjeT5cbn1cblxuY2xhc3MgTWVzc2FnZVJlZ2lzdHJ5IHtcbiAgZW1pdHRlcjogRW1pdHRlcjtcbiAgbWVzc2FnZXM6IEFycmF5PE1lc3NhZ2UgfCBNZXNzYWdlTGVnYWN5PjtcbiAgbWVzc2FnZXNNYXA6IFNldDxMaW50ZXIkTWVzc2FnZSRNYXA+O1xuICBzdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBkZWJvdW5jZWRVcGRhdGU6ICgoKSA9PiB2b2lkKTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG4gICAgdGhpcy5tZXNzYWdlcyA9IFtdXG4gICAgdGhpcy5tZXNzYWdlc01hcCA9IG5ldyBTZXQoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICB0aGlzLmRlYm91bmNlZFVwZGF0ZSA9IGRlYm91bmNlKHRoaXMudXBkYXRlLCAxMDAsIHRydWUpXG5cbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKHRoaXMuZW1pdHRlcilcbiAgfVxuICBzZXQoeyBtZXNzYWdlcywgbGludGVyLCBidWZmZXIgfTogeyBtZXNzYWdlczogQXJyYXk8TWVzc2FnZSB8IE1lc3NhZ2VMZWdhY3k+LCBsaW50ZXI6IExpbnRlciwgYnVmZmVyOiBUZXh0QnVmZmVyIH0pIHtcbiAgICBsZXQgZm91bmQgPSBudWxsXG4gICAgZm9yIChjb25zdCBlbnRyeSBvZiB0aGlzLm1lc3NhZ2VzTWFwKSB7XG4gICAgICBpZiAoZW50cnkuYnVmZmVyID09PSBidWZmZXIgJiYgZW50cnkubGludGVyID09PSBsaW50ZXIpIHtcbiAgICAgICAgZm91bmQgPSBlbnRyeVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChmb3VuZCkge1xuICAgICAgZm91bmQubWVzc2FnZXMgPSBtZXNzYWdlc1xuICAgICAgZm91bmQuY2hhbmdlZCA9IHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5tZXNzYWdlc01hcC5hZGQoeyBtZXNzYWdlcywgbGludGVyLCBidWZmZXIsIG9sZE1lc3NhZ2VzOiBbXSwgY2hhbmdlZDogdHJ1ZSwgZGVsZXRlZDogZmFsc2UgfSlcbiAgICB9XG4gICAgdGhpcy5kZWJvdW5jZWRVcGRhdGUoKVxuICB9XG4gIHVwZGF0ZSgpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7IGFkZGVkOiBbXSwgcmVtb3ZlZDogW10sIG1lc3NhZ2VzOiBbXSB9XG5cbiAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIHRoaXMubWVzc2FnZXNNYXApIHtcbiAgICAgIGlmIChlbnRyeS5kZWxldGVkKSB7XG4gICAgICAgIHJlc3VsdC5yZW1vdmVkID0gcmVzdWx0LnJlbW92ZWQuY29uY2F0KGVudHJ5Lm9sZE1lc3NhZ2VzKVxuICAgICAgICB0aGlzLm1lc3NhZ2VzTWFwLmRlbGV0ZShlbnRyeSlcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGlmICghZW50cnkuY2hhbmdlZCkge1xuICAgICAgICByZXN1bHQubWVzc2FnZXMgPSByZXN1bHQubWVzc2FnZXMuY29uY2F0KGVudHJ5Lm9sZE1lc3NhZ2VzKVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgZW50cnkuY2hhbmdlZCA9IGZhbHNlXG4gICAgICBpZiAoIWVudHJ5Lm9sZE1lc3NhZ2VzLmxlbmd0aCkge1xuICAgICAgICAvLyBBbGwgbWVzc2FnZXMgYXJlIG5ldywgbm8gbmVlZCB0byBkaWZmXG4gICAgICAgIC8vIE5PVEU6IE5vIG5lZWQgdG8gYWRkIC5rZXkgaGVyZSBiZWNhdXNlIG5vcm1hbGl6ZU1lc3NhZ2VzIGFscmVhZHkgZG9lcyB0aGF0XG4gICAgICAgIHJlc3VsdC5hZGRlZCA9IHJlc3VsdC5hZGRlZC5jb25jYXQoZW50cnkubWVzc2FnZXMpXG4gICAgICAgIHJlc3VsdC5tZXNzYWdlcyA9IHJlc3VsdC5tZXNzYWdlcy5jb25jYXQoZW50cnkubWVzc2FnZXMpXG4gICAgICAgIGVudHJ5Lm9sZE1lc3NhZ2VzID0gZW50cnkubWVzc2FnZXNcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGlmICghZW50cnkubWVzc2FnZXMubGVuZ3RoKSB7XG4gICAgICAgIC8vIEFsbCBtZXNzYWdlcyBhcmUgb2xkLCBubyBuZWVkIHRvIGRpZmZcbiAgICAgICAgcmVzdWx0LnJlbW92ZWQgPSByZXN1bHQucmVtb3ZlZC5jb25jYXQoZW50cnkub2xkTWVzc2FnZXMpXG4gICAgICAgIGVudHJ5Lm9sZE1lc3NhZ2VzID0gW11cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgY29uc3QgbmV3S2V5cyA9IG5ldyBTZXQoKVxuICAgICAgY29uc3Qgb2xkS2V5cyA9IG5ldyBTZXQoKVxuICAgICAgY29uc3Qgb2xkTWVzc2FnZXMgPSBlbnRyeS5vbGRNZXNzYWdlc1xuICAgICAgbGV0IGZvdW5kTmV3ID0gZmFsc2VcbiAgICAgIGVudHJ5Lm9sZE1lc3NhZ2VzID0gW11cblxuICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbmd0aCA9IG9sZE1lc3NhZ2VzLmxlbmd0aDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBvbGRNZXNzYWdlc1tpXVxuICAgICAgICBpZiAobWVzc2FnZS52ZXJzaW9uID09PSAyKSB7XG4gICAgICAgICAgbWVzc2FnZS5rZXkgPSBtZXNzYWdlS2V5KG1lc3NhZ2UpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWVzc2FnZS5rZXkgPSBtZXNzYWdlS2V5TGVnYWN5KG1lc3NhZ2UpXG4gICAgICAgIH1cbiAgICAgICAgb2xkS2V5cy5hZGQobWVzc2FnZS5rZXkpXG4gICAgICB9XG5cbiAgICAgIGZvciAobGV0IGkgPSAwLCBsZW5ndGggPSBlbnRyeS5tZXNzYWdlcy5sZW5ndGg7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZW50cnkubWVzc2FnZXNbaV1cbiAgICAgICAgaWYgKG5ld0tleXMuaGFzKG1lc3NhZ2Uua2V5KSkge1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cbiAgICAgICAgbmV3S2V5cy5hZGQobWVzc2FnZS5rZXkpXG4gICAgICAgIGlmICghb2xkS2V5cy5oYXMobWVzc2FnZS5rZXkpKSB7XG4gICAgICAgICAgZm91bmROZXcgPSB0cnVlXG4gICAgICAgICAgcmVzdWx0LmFkZGVkLnB1c2gobWVzc2FnZSlcbiAgICAgICAgICByZXN1bHQubWVzc2FnZXMucHVzaChtZXNzYWdlKVxuICAgICAgICAgIGVudHJ5Lm9sZE1lc3NhZ2VzLnB1c2gobWVzc2FnZSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIWZvdW5kTmV3ICYmIGVudHJ5Lm1lc3NhZ2VzLmxlbmd0aCA9PT0gb2xkTWVzc2FnZXMubGVuZ3RoKSB7XG4gICAgICAgIC8vIE1lc3NhZ2VzIGFyZSB1bmNoYW5nZWRcbiAgICAgICAgcmVzdWx0Lm1lc3NhZ2VzID0gcmVzdWx0Lm1lc3NhZ2VzLmNvbmNhdChvbGRNZXNzYWdlcylcbiAgICAgICAgZW50cnkub2xkTWVzc2FnZXMgPSBvbGRNZXNzYWdlc1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBmb3IgKGxldCBpID0gMCwgbGVuZ3RoID0gb2xkTWVzc2FnZXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IG9sZE1lc3NhZ2VzW2ldXG4gICAgICAgIGlmIChuZXdLZXlzLmhhcyhtZXNzYWdlLmtleSkpIHtcbiAgICAgICAgICBlbnRyeS5vbGRNZXNzYWdlcy5wdXNoKG1lc3NhZ2UpXG4gICAgICAgICAgcmVzdWx0Lm1lc3NhZ2VzLnB1c2gobWVzc2FnZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHQucmVtb3ZlZC5wdXNoKG1lc3NhZ2UpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocmVzdWx0LmFkZGVkLmxlbmd0aCB8fCByZXN1bHQucmVtb3ZlZC5sZW5ndGgpIHtcbiAgICAgIHRoaXMubWVzc2FnZXMgPSByZXN1bHQubWVzc2FnZXNcbiAgICAgIHRoaXMuZW1pdHRlci5lbWl0KCdkaWQtdXBkYXRlLW1lc3NhZ2VzJywgcmVzdWx0KVxuICAgIH1cbiAgfVxuICBvbkRpZFVwZGF0ZU1lc3NhZ2VzKGNhbGxiYWNrOiAoKGRpZmZlcmVuY2U6IE1lc3NhZ2VzUGF0Y2gpID0+IHZvaWQpKTogRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZW1pdHRlci5vbignZGlkLXVwZGF0ZS1tZXNzYWdlcycsIGNhbGxiYWNrKVxuICB9XG4gIGRlbGV0ZUJ5QnVmZmVyKGJ1ZmZlcjogVGV4dEJ1ZmZlcikge1xuICAgIGZvciAoY29uc3QgZW50cnkgb2YgdGhpcy5tZXNzYWdlc01hcCkge1xuICAgICAgaWYgKGVudHJ5LmJ1ZmZlciA9PT0gYnVmZmVyKSB7XG4gICAgICAgIGVudHJ5LmRlbGV0ZWQgPSB0cnVlXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuZGVib3VuY2VkVXBkYXRlKClcbiAgfVxuICBkZWxldGVCeUxpbnRlcihsaW50ZXI6IExpbnRlcikge1xuICAgIGZvciAoY29uc3QgZW50cnkgb2YgdGhpcy5tZXNzYWdlc01hcCkge1xuICAgICAgaWYgKGVudHJ5LmxpbnRlciA9PT0gbGludGVyKSB7XG4gICAgICAgIGVudHJ5LmRlbGV0ZWQgPSB0cnVlXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuZGVib3VuY2VkVXBkYXRlKClcbiAgfVxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1lc3NhZ2VSZWdpc3RyeVxuIl19