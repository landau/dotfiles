function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _libMessageRegistry = require('../lib/message-registry');

var _libMessageRegistry2 = _interopRequireDefault(_libMessageRegistry);

var _common = require('./common');

describe('Message Registry', function () {
  var messageRegistry = undefined;
  beforeEach(function () {
    messageRegistry = new _libMessageRegistry2['default']();
    messageRegistry.debouncedUpdate = jasmine.createSpy('debouncedUpdate');
  });
  afterEach(function () {
    messageRegistry.dispose();
  });

  describe('::set', function () {
    it('stores results using both buffer and linter', function () {
      var messageFirst = (0, _common.getMessageLegacy)();
      var messageSecond = (0, _common.getMessageLegacy)();
      var messageThird = (0, _common.getMessageLegacy)();
      var linter = { name: 'any' };
      var buffer = {};
      var info = undefined;

      messageRegistry.set({ linter: linter, buffer: null, messages: [messageFirst] });
      expect(messageRegistry.debouncedUpdate.calls.length).toBe(1);
      expect(messageRegistry.messagesMap.size).toBe(1);
      info = Array.from(messageRegistry.messagesMap)[0];

      expect(info.changed).toBe(true);
      expect(info.linter).toBe(linter);
      expect(info.buffer).toBe(null);
      expect(info.oldMessages.length).toBe(0);
      expect(info.messages.length).toBe(1);
      expect(info.messages[0]).toBe(messageFirst);

      messageRegistry.set({ linter: linter, buffer: null, messages: [messageFirst] });
      expect(messageRegistry.debouncedUpdate.calls.length).toBe(2);
      expect(messageRegistry.messagesMap.size).toBe(1);
      info = Array.from(messageRegistry.messagesMap)[0];

      expect(info.changed).toBe(true);
      expect(info.linter).toBe(linter);
      expect(info.buffer).toBe(null);
      expect(info.messages.length).toBe(1);
      expect(info.messages[0]).toBe(messageFirst);

      messageRegistry.set({ linter: linter, buffer: buffer, messages: [messageThird] });
      expect(messageRegistry.debouncedUpdate.calls.length).toBe(3);
      expect(messageRegistry.messagesMap.size).toBe(2);
      info = Array.from(messageRegistry.messagesMap)[0];

      expect(info.changed).toBe(true);
      expect(info.linter).toBe(linter);
      expect(info.buffer).toBe(null);
      expect(info.messages.length).toBe(1);
      expect(info.messages[0]).toBe(messageFirst);

      info = Array.from(messageRegistry.messagesMap)[1];

      expect(info.changed).toBe(true);
      expect(info.linter).toBe(linter);
      expect(info.buffer).toBe(buffer);
      expect(info.messages.length).toBe(1);
      expect(info.messages[0]).toBe(messageThird);

      messageRegistry.set({ linter: linter, buffer: null, messages: [messageFirst, messageSecond] });
      expect(messageRegistry.debouncedUpdate.calls.length).toBe(4);
      expect(messageRegistry.messagesMap.size).toBe(2);
      info = Array.from(messageRegistry.messagesMap)[0];

      expect(info.changed).toBe(true);
      expect(info.linter).toBe(linter);
      expect(info.buffer).toBe(null);
      expect(info.messages.length).toBe(2);
      expect(info.messages[0]).toBe(messageFirst);
      expect(info.messages[1]).toBe(messageSecond);

      info = Array.from(messageRegistry.messagesMap)[1];

      expect(info.changed).toBe(true);
      expect(info.linter).toBe(linter);
      expect(info.buffer).toBe(buffer);
      expect(info.messages.length).toBe(1);
      expect(info.messages[0]).toBe(messageThird);
    });
  });

  describe('updates (::update & ::onDidUpdateMessages)', function () {
    it('notifies on changes', function () {
      var called = 0;
      var linter = { name: 'any' };
      var message = (0, _common.getMessageLegacy)();
      messageRegistry.onDidUpdateMessages(function (_ref) {
        var added = _ref.added;
        var removed = _ref.removed;
        var messages = _ref.messages;

        called++;
        expect(added.length).toBe(1);
        expect(removed.length).toBe(0);
        expect(messages.length).toBe(1);
        expect(added).toEqual(messages);
        expect(added[0]).toBe(message);
      });
      messageRegistry.set({ linter: linter, buffer: null, messages: [message] });
      messageRegistry.update();
      expect(called).toBe(1);
    });
    it('notifies properly for as many linters as you want', function () {
      var buffer = {};
      var linterFirst = { name: 'any' };
      var linterSecond = {};
      var messageFirst = (0, _common.getMessageLegacy)();
      var messageSecond = (0, _common.getMessageLegacy)();
      var messageThird = (0, _common.getMessageLegacy)();
      var called = 0;

      messageRegistry.onDidUpdateMessages(function (_ref2) {
        var added = _ref2.added;
        var removed = _ref2.removed;
        var messages = _ref2.messages;

        called++;

        if (called === 1) {
          expect(added.length).toBe(1);
          expect(removed.length).toBe(0);
          expect(added).toEqual(messages);
          expect(added[0]).toEqual(messageFirst);
        } else if (called === 2) {
          expect(added.length).toBe(2);
          expect(removed.length).toBe(0);
          expect(messages.length).toBe(3);
          expect(messages[0]).toBe(messageFirst);
          expect(messages[1]).toBe(messageSecond);
          expect(messages[2]).toBe(messageThird);
        } else if (called === 3) {
          expect(added.length).toBe(0);
          expect(removed.length).toBe(1);
          expect(removed[0]).toBe(messageFirst);
          expect(messages.length).toBe(2);
          expect(messages[0]).toBe(messageSecond);
          expect(messages[1]).toBe(messageThird);
        } else if (called === 4) {
          expect(added.length).toBe(0);
          expect(removed.length).toBe(2);
          expect(messages.length).toBe(0);
          expect(removed[0]).toBe(messageSecond);
          expect(removed[1]).toBe(messageThird);
        } else {
          throw new Error('Unnecessary update call');
        }
      });

      messageRegistry.set({ buffer: buffer, linter: linterFirst, messages: [messageFirst] });
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      expect(called).toBe(1);
      messageRegistry.set({ buffer: buffer, linter: linterSecond, messages: [messageSecond, messageThird] });
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      expect(called).toBe(2);
      messageRegistry.set({ buffer: buffer, linter: linterFirst, messages: [] });
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      expect(called).toBe(3);
      messageRegistry.set({ buffer: buffer, linter: linterSecond, messages: [] });
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      expect(called).toBe(4);
    });

    it('sets key, severity on messages', function () {
      var linter = { name: 'any' };
      var buffer = {};
      var messageFirst = (0, _common.getMessageLegacy)();
      var messageSecond = (0, _common.getMessageLegacy)();
      var messageThird = (0, _common.getMessageLegacy)();

      var called = 0;

      messageRegistry.onDidUpdateMessages(function (_ref3) {
        var added = _ref3.added;
        var removed = _ref3.removed;
        var messages = _ref3.messages;

        called++;
        if (called === 1) {
          // All messages are new
          expect(added.length).toBe(2);
          expect(removed.length).toBe(0);
          expect(messages.length).toBe(2);
          expect(added).toEqual(messages);
          expect(typeof messages[0].key).toBe('string');
          expect(typeof messages[1].key).toBe('string');
          expect(typeof messages[0].severity).toBe('string');
          expect(typeof messages[1].severity).toBe('string');
        } else {
          // One removed, one added
          expect(added.length).toBe(1);
          expect(removed.length).toBe(1);
          expect(messages.length).toBe(2);
          expect(messages.indexOf(added[0])).not.toBe(-1);
          expect(typeof messages[0].key).toBe('string');
          expect(typeof messages[1].key).toBe('string');
          expect(typeof messages[0].severity).toBe('string');
          expect(typeof messages[1].severity).toBe('string');
        }
      });

      messageRegistry.set({ buffer: buffer, linter: linter, messages: [messageFirst, messageSecond] });
      messageRegistry.update();
      messageRegistry.set({ buffer: buffer, linter: linter, messages: [messageFirst, messageThird] });
      messageRegistry.update();
      expect(called).toBe(2);
    });

    it('checks if an old message has updated, if so invalidates it properly', function () {
      var called = 0;
      var messageFirst = (0, _common.getMessageLegacy)();
      var messageSecond = Object.assign({}, messageFirst);
      var linter = { name: 'any' };
      var buffer = {};

      messageRegistry.onDidUpdateMessages(function (_ref4) {
        var added = _ref4.added;
        var removed = _ref4.removed;
        var messages = _ref4.messages;

        called++;
        if (called === 1) {
          expect(messages.length).toBe(1);
          expect(removed.length).toBe(0);
          expect(added.length).toBe(1);
          expect(added[0]).toBe(messageFirst);
        } else {
          expect(messages.length).toBe(1);
          expect(removed.length).toBe(1);
          expect(added.length).toBe(1);
          expect(added[0]).toBe(messageSecond);
          expect(removed[0]).toBe(messageFirst);
        }
      });

      expect(called).toBe(0);
      messageRegistry.set({ buffer: buffer, linter: linter, messages: [messageFirst] });
      messageRegistry.update();
      messageRegistry.set({ buffer: buffer, linter: linter, messages: [messageSecond] });
      messageRegistry.update();
      expect(called).toBe(1);
      messageFirst.text = 'Hellow';
      messageRegistry.set({ buffer: buffer, linter: linter, messages: [messageSecond] });
      messageRegistry.update();
      expect(called).toBe(2);
    });

    it('sends the same object each time even in complicated scenarios', function () {
      var called = 0;
      var knownMessages = new Set();
      messageRegistry.onDidUpdateMessages(function (_ref5) {
        var added = _ref5.added;
        var removed = _ref5.removed;
        var messages = _ref5.messages;

        called++;
        for (var entry of added) {
          if (knownMessages.has(entry)) {
            throw new Error('Message already exists');
          } else knownMessages.add(entry);
        }
        for (var entry of removed) {
          if (knownMessages.has(entry)) {
            knownMessages['delete'](entry);
          } else throw new Error('Message does not exist');
        }
        if (messages.length !== knownMessages.size) {
          throw new Error('Size mismatch, registry is having hiccups');
        }
      });

      var linter = { name: 'any' };
      var buffer = {};
      var messageRealFirst = (0, _common.getMessageLegacy)();
      var messageDupeFirst = Object.assign({}, messageRealFirst);
      var messageRealSecond = (0, _common.getMessageLegacy)();
      var messageDupeSecond = Object.assign({}, messageRealSecond);

      expect(called).toBe(0);
      messageRegistry.set({ buffer: buffer, linter: linter, messages: [messageRealFirst, messageRealSecond] });
      messageRegistry.update();
      expect(called).toBe(1);
      expect(knownMessages.size).toBe(2);
      messageRegistry.update();
      expect(called).toBe(1);
      expect(knownMessages.size).toBe(2);
      messageRegistry.set({ buffer: buffer, linter: linter, messages: [messageRealFirst, messageRealSecond] });
      messageRegistry.update();
      expect(called).toBe(1);
      expect(knownMessages.size).toBe(2);
      messageRegistry.set({ buffer: buffer, linter: linter, messages: [messageDupeFirst, messageDupeSecond] });
      messageRegistry.update();
      expect(called).toBe(1);
      expect(knownMessages.size).toBe(2);
      messageRegistry.deleteByLinter(linter);
      messageRegistry.update();
      expect(called).toBe(2);
      expect(knownMessages.size).toBe(0);
    });
    it('notices changes on last messages instead of relying on their keys and invaildates them', function () {
      var called = 0;

      var linter = { name: 'any' };
      var buffer = {};
      var messageA = (0, _common.getMessageLegacy)();
      var messageB = Object.assign({}, messageA);
      var messageC = Object.assign({}, messageA);

      messageRegistry.onDidUpdateMessages(function (_ref6) {
        var added = _ref6.added;
        var removed = _ref6.removed;
        var messages = _ref6.messages;

        called++;
        if (called === 1) {
          expect(added.length).toBe(1);
          expect(removed.length).toBe(0);
          expect(messages.length).toBe(1);
          expect(added).toEqual(messages);
          expect(added[0]).toBe(messageA);
        } else if (called === 2) {
          expect(added.length).toBe(1);
          expect(removed.length).toBe(1);
          expect(messages.length).toBe(1);
          expect(added).toEqual(messages);
          expect(added[0]).toBe(messageB);
          expect(removed[0]).toBe(messageA);
        } else {
          throw new Error('Should not have been triggered');
        }
      });
      messageRegistry.set({ buffer: buffer, linter: linter, messages: [messageA] });
      messageRegistry.update();
      messageA.text = 'MURICAAA';
      messageRegistry.set({ buffer: buffer, linter: linter, messages: [messageB] });
      messageRegistry.update();
      messageRegistry.set({ buffer: buffer, linter: linter, messages: [messageC] });
      messageRegistry.update();
      expect(called).toBe(2);
    });
  });

  describe('::deleteByBuffer', function () {
    it('deletes the messages and sends them in an event', function () {
      var linter = { name: 'any' };
      var buffer = {};
      var messageFirst = (0, _common.getMessageLegacy)();
      var messageSecond = (0, _common.getMessageLegacy)();

      var called = 0;

      messageRegistry.onDidUpdateMessages(function (_ref7) {
        var added = _ref7.added;
        var removed = _ref7.removed;
        var messages = _ref7.messages;

        called++;
        if (called === 1) {
          expect(added.length).toBe(2);
          expect(removed.length).toBe(0);
          expect(messages.length).toBe(2);
          expect(added).toEqual(messages);
          expect(added[0]).toBe(messageFirst);
          expect(added[1]).toBe(messageSecond);
        } else if (called === 2) {
          expect(added.length).toBe(0);
          expect(removed.length).toBe(2);
          expect(messages.length).toBe(0);
          expect(removed[0]).toBe(messageFirst);
          expect(removed[1]).toBe(messageSecond);
        } else {
          throw new Error('Unnecessary update call');
        }
      });
      messageRegistry.set({ buffer: buffer, linter: linter, messages: [messageFirst, messageSecond] });
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      expect(called).toBe(1);
      messageRegistry.deleteByBuffer(buffer);
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      expect(called).toBe(2);
    });
  });

  describe('::deleteByLinter', function () {
    it('deletes the messages and sends them in an event', function () {
      var linter = { name: 'any' };
      var buffer = {};
      var messageFirst = (0, _common.getMessageLegacy)();
      var messageSecond = (0, _common.getMessageLegacy)();

      var called = 0;

      messageRegistry.onDidUpdateMessages(function (_ref8) {
        var added = _ref8.added;
        var removed = _ref8.removed;
        var messages = _ref8.messages;

        called++;
        if (called === 1) {
          expect(added.length).toBe(2);
          expect(removed.length).toBe(0);
          expect(messages.length).toBe(2);
          expect(added).toEqual(messages);
          expect(added[0]).toBe(messageFirst);
          expect(added[1]).toBe(messageSecond);
        } else if (called === 2) {
          expect(added.length).toBe(0);
          expect(removed.length).toBe(2);
          expect(messages.length).toBe(0);
          expect(removed[0]).toBe(messageFirst);
          expect(removed[1]).toBe(messageSecond);
        } else {
          throw new Error('Unnecessary update call');
        }
      });
      messageRegistry.set({ buffer: buffer, linter: linter, messages: [messageFirst, messageSecond] });
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      expect(called).toBe(1);
      messageRegistry.deleteByLinter(linter);
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      messageRegistry.update();
      expect(called).toBe(2);
    });
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL2xpbnRlci9zcGVjL21lc3NhZ2UtcmVnaXN0cnktc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztrQ0FFNEIseUJBQXlCOzs7O3NCQUNwQixVQUFVOztBQUUzQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsWUFBVztBQUN0QyxNQUFJLGVBQWUsWUFBQSxDQUFBO0FBQ25CLFlBQVUsQ0FBQyxZQUFXO0FBQ3BCLG1CQUFlLEdBQUcscUNBQXFCLENBQUE7QUFDdkMsbUJBQWUsQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO0dBQ3ZFLENBQUMsQ0FBQTtBQUNGLFdBQVMsQ0FBQyxZQUFXO0FBQ25CLG1CQUFlLENBQUMsT0FBTyxFQUFFLENBQUE7R0FDMUIsQ0FBQyxDQUFBOztBQUVGLFVBQVEsQ0FBQyxPQUFPLEVBQUUsWUFBVztBQUMzQixNQUFFLENBQUMsNkNBQTZDLEVBQUUsWUFBVztBQUMzRCxVQUFNLFlBQVksR0FBRywrQkFBa0IsQ0FBQTtBQUN2QyxVQUFNLGFBQWEsR0FBRywrQkFBa0IsQ0FBQTtBQUN4QyxVQUFNLFlBQVksR0FBRywrQkFBa0IsQ0FBQTtBQUN2QyxVQUFNLE1BQWMsR0FBRyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQTtBQUN0QyxVQUFNLE1BQWMsR0FBRyxFQUFFLENBQUE7QUFDekIsVUFBSSxJQUFJLFlBQUEsQ0FBQTs7QUFFUixxQkFBZSxDQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBTixNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUE7QUFDdkUsWUFBTSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUM1RCxZQUFNLENBQUMsZUFBZSxDQUFD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QyxDQUFBO0FBQzVCLGdCQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUM5QixnQkFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDL0IsZ0JBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUE7QUFDdEMsZ0JBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7QUFDdkMsZ0JBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUE7U0FDdkMsTUFBTSxJQUFJLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDdkIsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQzVCLGdCQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUM5QixnQkFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtBQUNyQyxnQkFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDL0IsZ0JBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7QUFDdkMsZ0JBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUE7U0FDdkMsTUFBTSxJQUFJLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDdkIsZ0JBQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENB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QUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtBQUNyQyxnQkFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQTtTQUN2QyxNQUFNO0FBQ0wsZ0JBQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQTtTQUMzQztPQUNGLENBQUMsQ0FBQTtBQUNGLHFCQUFlLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFOLE1BQU0sRUFBRSxNQUFNLEVBQU4sTUFBTSxFQUFFLFFBQVEsRUFBRSxDQUFDLFlBQVksRUFBRSxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUE7QUFDaEYscUJBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtBQUN4QixxQkFBZSxDQUFDLE1BQU0sRUFBRSxDQUFBO0FBQ3hCLHFCQUFlLENBQUMsTUFBTSxFQUFFLENBQUE7QUFDeEIscUJBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtBQUN4QixZQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3RCLHFCQUFlLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ3RDLHFCQUFlLENBQUMsTUFBTSxFQUFFLENBQUE7QUFDeEIscUJBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtBQUN4QixxQkFBZSxDQUFDLE1BQU0sRUFBRSxDQUFBO0FBQ3hCLHFCQUFlLENBQUMsTUFBTSxFQUFFLENBQUE7QUFDeEIsWUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUN2QixDQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7Q0FDSCxDQUFDLENBQUEiLCJmaWxlIjoiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvbGludGVyL3NwZWMvbWVzc2FnZS1yZWdpc3RyeS1zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IE1lc3NhZ2VSZWdpc3RyeSBmcm9tICcuLi9saWIvbWVzc2FnZS1yZWdpc3RyeSdcbmltcG9ydCB7IGdldE1lc3NhZ2VMZWdhY3kgfSBmcm9tICcuL2NvbW1vbidcblxuZGVzY3JpYmUoJ01lc3NhZ2UgUmVnaXN0cnknLCBmdW5jdGlvbigpIHtcbiAgbGV0IG1lc3NhZ2VSZWdpc3RyeVxuICBiZWZvcmVFYWNoKGZ1bmN0aW9uKCkge1xuICAgIG1lc3NhZ2VSZWdpc3RyeSA9IG5ldyBNZXNzYWdlUmVnaXN0cnkoKVxuICAgIG1lc3NhZ2VSZWdpc3RyeS5kZWJvdW5jZWRVcGRhdGUgPSBqYXNtaW5lLmNyZWF0ZVNweSgnZGVib3VuY2VkVXBkYXRlJylcbiAgfSlcbiAgYWZ0ZXJFYWNoKGZ1bmN0aW9uKCkge1xuICAgIG1lc3NhZ2VSZWdpc3RyeS5kaXNwb3NlKClcbiAgfSlcblxuICBkZXNjcmliZSgnOjpzZXQnLCBmdW5jdGlvbigpIHtcbiAgICBpdCgnc3RvcmVzIHJlc3VsdHMgdXNpbmcgYm90aCBidWZmZXIgYW5kIGxpbnRlcicsIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgbWVzc2FnZUZpcnN0ID0gZ2V0TWVzc2FnZUxlZ2FjeSgpXG4gICAgICBjb25zdCBtZXNzYWdlU2Vjb25kID0gZ2V0TWVzc2FnZUxlZ2FjeSgpXG4gICAgICBjb25zdCBtZXNzYWdlVGhpcmQgPSBnZXRNZXNzYWdlTGVnYWN5KClcbiAgICAgIGNvbnN0IGxpbnRlcjogT2JqZWN0ID0geyBuYW1lOiAnYW55JyB9XG4gICAgICBjb25zdCBidWZmZXI6IE9iamVjdCA9IHt9XG4gICAgICBsZXQgaW5mb1xuXG4gICAgICBtZXNzYWdlUmVnaXN0cnkuc2V0KHsgbGludGVyLCBidWZmZXI6IG51bGwsIG1lc3NhZ2VzOiBbbWVzc2FnZUZpcnN0XSB9KVxuICAgICAgZXhwZWN0KG1lc3NhZ2VSZWdpc3RyeS5kZWJvdW5jZWRVcGRhdGUuY2FsbHMubGVuZ3RoKS50b0JlKDEpXG4gICAgICBleHBlY3QobWVzc2FnZVJlZ2lzdHJ5Lm1lc3NhZ2VzTWFwLnNpemUpLnRvQmUoMSlcbiAgICAgIGluZm8gPSBBcnJheS5mcm9tKG1lc3NhZ2VSZWdpc3RyeS5tZXNzYWdlc01hcClbMF1cblxuICAgICAgZXhwZWN0KGluZm8uY2hhbmdlZCkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KGluZm8ubGludGVyKS50b0JlKGxpbnRlcilcbiAgICAgIGV4cGVjdChpbmZvLmJ1ZmZlcikudG9CZShudWxsKVxuICAgICAgZXhwZWN0KGluZm8ub2xkTWVzc2FnZXMubGVuZ3RoKS50b0JlKDApXG4gICAgICBleHBlY3QoaW5mby5tZXNzYWdlcy5sZW5ndGgpLnRvQmUoMSlcbiAgICAgIGV4cGVjdChpbmZvLm1lc3NhZ2VzWzBdKS50b0JlKG1lc3NhZ2VGaXJzdClcblxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnNldCh7IGxpbnRlciwgYnVmZmVyOiBudWxsLCBtZXNzYWdlczogW21lc3NhZ2VGaXJzdF0gfSlcbiAgICAgIGV4cGVjdChtZXNzYWdlUmVnaXN0cnkuZGVib3VuY2VkVXBkYXRlLmNhbGxzLmxlbmd0aCkudG9CZSgyKVxuICAgICAgZXhwZWN0KG1lc3NhZ2VSZWdpc3RyeS5tZXNzYWdlc01hcC5zaXplKS50b0JlKDEpXG4gICAgICBpbmZvID0gQXJyYXkuZnJvbShtZXNzYWdlUmVnaXN0cnkubWVzc2FnZXNNYXApWzBdXG5cbiAgICAgIGV4cGVjdChpbmZvLmNoYW5nZWQpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdChpbmZvLmxpbnRlcikudG9CZShsaW50ZXIpXG4gICAgICBleHBlY3QoaW5mby5idWZmZXIpLnRvQmUobnVsbClcbiAgICAgIGV4cGVjdChpbmZvLm1lc3NhZ2VzLmxlbmd0aCkudG9CZSgxKVxuICAgICAgZXhwZWN0KGluZm8ubWVzc2FnZXNbMF0pLnRvQmUobWVzc2FnZUZpcnN0KVxuXG4gICAgICBtZXNzYWdlUmVnaXN0cnkuc2V0KHsgbGludGVyLCBidWZmZXIsIG1lc3NhZ2VzOiBbbWVzc2FnZVRoaXJkXSB9KVxuICAgICAgZXhwZWN0KG1lc3NhZ2VSZWdpc3RyeS5kZWJvdW5jZWRVcGRhdGUuY2FsbHMubGVuZ3RoKS50b0JlKDMpXG4gICAgICBleHBlY3QobWVzc2FnZVJlZ2lzdHJ5Lm1lc3NhZ2VzTWFwLnNpemUpLnRvQmUoMilcbiAgICAgIGluZm8gPSBBcnJheS5mcm9tKG1lc3NhZ2VSZWdpc3RyeS5tZXNzYWdlc01hcClbMF1cblxuICAgICAgZXhwZWN0KGluZm8uY2hhbmdlZCkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KGluZm8ubGludGVyKS50b0JlKGxpbnRlcilcbiAgICAgIGV4cGVjdChpbmZvLmJ1ZmZlcikudG9CZShudWxsKVxuICAgICAgZXhwZWN0KGluZm8ubWVzc2FnZXMubGVuZ3RoKS50b0JlKDEpXG4gICAgICBleHBlY3QoaW5mby5tZXNzYWdlc1swXSkudG9CZShtZXNzYWdlRmlyc3QpXG5cbiAgICAgIGluZm8gPSBBcnJheS5mcm9tKG1lc3NhZ2VSZWdpc3RyeS5tZXNzYWdlc01hcClbMV1cblxuICAgICAgZXhwZWN0KGluZm8uY2hhbmdlZCkudG9CZSh0cnVlKVxuICAgICAgZXhwZWN0KGluZm8ubGludGVyKS50b0JlKGxpbnRlcilcbiAgICAgIGV4cGVjdChpbmZvLmJ1ZmZlcikudG9CZShidWZmZXIpXG4gICAgICBleHBlY3QoaW5mby5tZXNzYWdlcy5sZW5ndGgpLnRvQmUoMSlcbiAgICAgIGV4cGVjdChpbmZvLm1lc3NhZ2VzWzBdKS50b0JlKG1lc3NhZ2VUaGlyZClcblxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnNldCh7IGxpbnRlciwgYnVmZmVyOiBudWxsLCBtZXNzYWdlczogW21lc3NhZ2VGaXJzdCwgbWVzc2FnZVNlY29uZF0gfSlcbiAgICAgIGV4cGVjdChtZXNzYWdlUmVnaXN0cnkuZGVib3VuY2VkVXBkYXRlLmNhbGxzLmxlbmd0aCkudG9CZSg0KVxuICAgICAgZXhwZWN0KG1lc3NhZ2VSZWdpc3RyeS5tZXNzYWdlc01hcC5zaXplKS50b0JlKDIpXG4gICAgICBpbmZvID0gQXJyYXkuZnJvbShtZXNzYWdlUmVnaXN0cnkubWVzc2FnZXNNYXApWzBdXG5cbiAgICAgIGV4cGVjdChpbmZvLmNoYW5nZWQpLnRvQmUodHJ1ZSlcbiAgICAgIGV4cGVjdChpbmZvLmxpbnRlcikudG9CZShsaW50ZXIpXG4gICAgICBleHBlY3QoaW5mby5idWZmZXIpLnRvQmUobnVsbClcbiAgICAgIGV4cGVjdChpbmZvLm1lc3NhZ2VzLmxlbmd0aCkudG9CZSgyKVxuICAgICAgZXhwZWN0KGluZm8ubWVzc2FnZXNbMF0pLnRvQmUobWVzc2FnZUZpcnN0KVxuICAgICAgZXhwZWN0KGluZm8ubWVzc2FnZXNbMV0pLnRvQmUobWVzc2FnZVNlY29uZClcblxuICAgICAgaW5mbyA9IEFycmF5LmZyb20obWVzc2FnZVJlZ2lzdHJ5Lm1lc3NhZ2VzTWFwKVsxXVxuXG4gICAgICBleHBlY3QoaW5mby5jaGFuZ2VkKS50b0JlKHRydWUpXG4gICAgICBleHBlY3QoaW5mby5saW50ZXIpLnRvQmUobGludGVyKVxuICAgICAgZXhwZWN0KGluZm8uYnVmZmVyKS50b0JlKGJ1ZmZlcilcbiAgICAgIGV4cGVjdChpbmZvLm1lc3NhZ2VzLmxlbmd0aCkudG9CZSgxKVxuICAgICAgZXhwZWN0KGluZm8ubWVzc2FnZXNbMF0pLnRvQmUobWVzc2FnZVRoaXJkKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3VwZGF0ZXMgKDo6dXBkYXRlICYgOjpvbkRpZFVwZGF0ZU1lc3NhZ2VzKScsIGZ1bmN0aW9uKCkge1xuICAgIGl0KCdub3RpZmllcyBvbiBjaGFuZ2VzJywgZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgY2FsbGVkID0gMFxuICAgICAgY29uc3QgbGludGVyOiBPYmplY3QgPSB7IG5hbWU6ICdhbnknIH1cbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBnZXRNZXNzYWdlTGVnYWN5KClcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS5vbkRpZFVwZGF0ZU1lc3NhZ2VzKGZ1bmN0aW9uKHsgYWRkZWQsIHJlbW92ZWQsIG1lc3NhZ2VzIH0pIHtcbiAgICAgICAgY2FsbGVkKytcbiAgICAgICAgZXhwZWN0KGFkZGVkLmxlbmd0aCkudG9CZSgxKVxuICAgICAgICBleHBlY3QocmVtb3ZlZC5sZW5ndGgpLnRvQmUoMClcbiAgICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgxKVxuICAgICAgICBleHBlY3QoYWRkZWQpLnRvRXF1YWwobWVzc2FnZXMpXG4gICAgICAgIGV4cGVjdChhZGRlZFswXSkudG9CZShtZXNzYWdlKVxuICAgICAgfSlcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS5zZXQoeyBsaW50ZXIsIGJ1ZmZlcjogbnVsbCwgbWVzc2FnZXM6IFttZXNzYWdlXSB9KVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnVwZGF0ZSgpXG4gICAgICBleHBlY3QoY2FsbGVkKS50b0JlKDEpXG4gICAgfSlcbiAgICBpdCgnbm90aWZpZXMgcHJvcGVybHkgZm9yIGFzIG1hbnkgbGludGVycyBhcyB5b3Ugd2FudCcsIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgYnVmZmVyOiBPYmplY3QgPSB7fVxuICAgICAgY29uc3QgbGludGVyRmlyc3Q6IE9iamVjdCA9IHsgbmFtZTogJ2FueScgfVxuICAgICAgY29uc3QgbGludGVyU2Vjb25kOiBPYmplY3QgPSB7fVxuICAgICAgY29uc3QgbWVzc2FnZUZpcnN0ID0gZ2V0TWVzc2FnZUxlZ2FjeSgpXG4gICAgICBjb25zdCBtZXNzYWdlU2Vjb25kID0gZ2V0TWVzc2FnZUxlZ2FjeSgpXG4gICAgICBjb25zdCBtZXNzYWdlVGhpcmQgPSBnZXRNZXNzYWdlTGVnYWN5KClcbiAgICAgIGxldCBjYWxsZWQgPSAwXG5cbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS5vbkRpZFVwZGF0ZU1lc3NhZ2VzKGZ1bmN0aW9uKHsgYWRkZWQsIHJlbW92ZWQsIG1lc3NhZ2VzIH0pIHtcbiAgICAgICAgY2FsbGVkKytcblxuICAgICAgICBpZiAoY2FsbGVkID09PSAxKSB7XG4gICAgICAgICAgZXhwZWN0KGFkZGVkLmxlbmd0aCkudG9CZSgxKVxuICAgICAgICAgIGV4cGVjdChyZW1vdmVkLmxlbmd0aCkudG9CZSgwKVxuICAgICAgICAgIGV4cGVjdChhZGRlZCkudG9FcXVhbChtZXNzYWdlcylcbiAgICAgICAgICBleHBlY3QoYWRkZWRbMF0pLnRvRXF1YWwobWVzc2FnZUZpcnN0KVxuICAgICAgICB9IGVsc2UgaWYgKGNhbGxlZCA9PT0gMikge1xuICAgICAgICAgIGV4cGVjdChhZGRlZC5sZW5ndGgpLnRvQmUoMilcbiAgICAgICAgICBleHBlY3QocmVtb3ZlZC5sZW5ndGgpLnRvQmUoMClcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDMpXG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzWzBdKS50b0JlKG1lc3NhZ2VGaXJzdClcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXNbMV0pLnRvQmUobWVzc2FnZVNlY29uZClcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXNbMl0pLnRvQmUobWVzc2FnZVRoaXJkKVxuICAgICAgICB9IGVsc2UgaWYgKGNhbGxlZCA9PT0gMykge1xuICAgICAgICAgIGV4cGVjdChhZGRlZC5sZW5ndGgpLnRvQmUoMClcbiAgICAgICAgICBleHBlY3QocmVtb3ZlZC5sZW5ndGgpLnRvQmUoMSlcbiAgICAgICAgICBleHBlY3QocmVtb3ZlZFswXSkudG9CZShtZXNzYWdlRmlyc3QpXG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgyKVxuICAgICAgICAgIGV4cGVjdChtZXNzYWdlc1swXSkudG9CZShtZXNzYWdlU2Vjb25kKVxuICAgICAgICAgIGV4cGVjdChtZXNzYWdlc1sxXSkudG9CZShtZXNzYWdlVGhpcmQpXG4gICAgICAgIH0gZWxzZSBpZiAoY2FsbGVkID09PSA0KSB7XG4gICAgICAgICAgZXhwZWN0KGFkZGVkLmxlbmd0aCkudG9CZSgwKVxuICAgICAgICAgIGV4cGVjdChyZW1vdmVkLmxlbmd0aCkudG9CZSgyKVxuICAgICAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMClcbiAgICAgICAgICBleHBlY3QocmVtb3ZlZFswXSkudG9CZShtZXNzYWdlU2Vjb25kKVxuICAgICAgICAgIGV4cGVjdChyZW1vdmVkWzFdKS50b0JlKG1lc3NhZ2VUaGlyZClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VubmVjZXNzYXJ5IHVwZGF0ZSBjYWxsJylcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnNldCh7IGJ1ZmZlciwgbGludGVyOiBsaW50ZXJGaXJzdCwgbWVzc2FnZXM6IFttZXNzYWdlRmlyc3RdIH0pXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS51cGRhdGUoKVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnVwZGF0ZSgpXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIGV4cGVjdChjYWxsZWQpLnRvQmUoMSlcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS5zZXQoeyBidWZmZXIsIGxpbnRlcjogbGludGVyU2Vjb25kLCBtZXNzYWdlczogW21lc3NhZ2VTZWNvbmQsIG1lc3NhZ2VUaGlyZF0gfSlcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS51cGRhdGUoKVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnVwZGF0ZSgpXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS51cGRhdGUoKVxuICAgICAgZXhwZWN0KGNhbGxlZCkudG9CZSgyKVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnNldCh7IGJ1ZmZlciwgbGludGVyOiBsaW50ZXJGaXJzdCwgbWVzc2FnZXM6IFtdIH0pXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS51cGRhdGUoKVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnVwZGF0ZSgpXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIGV4cGVjdChjYWxsZWQpLnRvQmUoMylcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS5zZXQoeyBidWZmZXIsIGxpbnRlcjogbGludGVyU2Vjb25kLCBtZXNzYWdlczogW10gfSlcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS51cGRhdGUoKVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnVwZGF0ZSgpXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS51cGRhdGUoKVxuICAgICAgZXhwZWN0KGNhbGxlZCkudG9CZSg0KVxuICAgIH0pXG5cbiAgICBpdCgnc2V0cyBrZXksIHNldmVyaXR5IG9uIG1lc3NhZ2VzJywgZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBsaW50ZXI6IE9iamVjdCA9IHsgbmFtZTogJ2FueScgfVxuICAgICAgY29uc3QgYnVmZmVyOiBPYmplY3QgPSB7fVxuICAgICAgY29uc3QgbWVzc2FnZUZpcnN0ID0gZ2V0TWVzc2FnZUxlZ2FjeSgpXG4gICAgICBjb25zdCBtZXNzYWdlU2Vjb25kID0gZ2V0TWVzc2FnZUxlZ2FjeSgpXG4gICAgICBjb25zdCBtZXNzYWdlVGhpcmQgPSBnZXRNZXNzYWdlTGVnYWN5KClcblxuICAgICAgbGV0IGNhbGxlZCA9IDBcblxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5Lm9uRGlkVXBkYXRlTWVzc2FnZXMoZnVuY3Rpb24oeyBhZGRlZCwgcmVtb3ZlZCwgbWVzc2FnZXMgfSkge1xuICAgICAgICBjYWxsZWQrK1xuICAgICAgICBpZiAoY2FsbGVkID09PSAxKSB7XG4gICAgICAgICAgLy8gQWxsIG1lc3NhZ2VzIGFyZSBuZXdcbiAgICAgICAgICBleHBlY3QoYWRkZWQubGVuZ3RoKS50b0JlKDIpXG4gICAgICAgICAgZXhwZWN0KHJlbW92ZWQubGVuZ3RoKS50b0JlKDApXG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgyKVxuICAgICAgICAgIGV4cGVjdChhZGRlZCkudG9FcXVhbChtZXNzYWdlcylcbiAgICAgICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2VzWzBdLmtleSkudG9CZSgnc3RyaW5nJylcbiAgICAgICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2VzWzFdLmtleSkudG9CZSgnc3RyaW5nJylcbiAgICAgICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2VzWzBdLnNldmVyaXR5KS50b0JlKCdzdHJpbmcnKVxuICAgICAgICAgIGV4cGVjdCh0eXBlb2YgbWVzc2FnZXNbMV0uc2V2ZXJpdHkpLnRvQmUoJ3N0cmluZycpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gT25lIHJlbW92ZWQsIG9uZSBhZGRlZFxuICAgICAgICAgIGV4cGVjdChhZGRlZC5sZW5ndGgpLnRvQmUoMSlcbiAgICAgICAgICBleHBlY3QocmVtb3ZlZC5sZW5ndGgpLnRvQmUoMSlcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDIpXG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzLmluZGV4T2YoYWRkZWRbMF0pKS5ub3QudG9CZSgtMSlcbiAgICAgICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2VzWzBdLmtleSkudG9CZSgnc3RyaW5nJylcbiAgICAgICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2VzWzFdLmtleSkudG9CZSgnc3RyaW5nJylcbiAgICAgICAgICBleHBlY3QodHlwZW9mIG1lc3NhZ2VzWzBdLnNldmVyaXR5KS50b0JlKCdzdHJpbmcnKVxuICAgICAgICAgIGV4cGVjdCh0eXBlb2YgbWVzc2FnZXNbMV0uc2V2ZXJpdHkpLnRvQmUoJ3N0cmluZycpXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS5zZXQoeyBidWZmZXIsIGxpbnRlciwgbWVzc2FnZXM6IFttZXNzYWdlRmlyc3QsIG1lc3NhZ2VTZWNvbmRdIH0pXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS5zZXQoeyBidWZmZXIsIGxpbnRlciwgbWVzc2FnZXM6IFttZXNzYWdlRmlyc3QsIG1lc3NhZ2VUaGlyZF0gfSlcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS51cGRhdGUoKVxuICAgICAgZXhwZWN0KGNhbGxlZCkudG9CZSgyKVxuICAgIH0pXG5cbiAgICBpdCgnY2hlY2tzIGlmIGFuIG9sZCBtZXNzYWdlIGhhcyB1cGRhdGVkLCBpZiBzbyBpbnZhbGlkYXRlcyBpdCBwcm9wZXJseScsIGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IGNhbGxlZCA9IDBcbiAgICAgIGNvbnN0IG1lc3NhZ2VGaXJzdCA9IGdldE1lc3NhZ2VMZWdhY3koKVxuICAgICAgY29uc3QgbWVzc2FnZVNlY29uZCA9IE9iamVjdC5hc3NpZ24oe30sIG1lc3NhZ2VGaXJzdClcbiAgICAgIGNvbnN0IGxpbnRlcjogT2JqZWN0ID0geyBuYW1lOiAnYW55JyB9XG4gICAgICBjb25zdCBidWZmZXI6IE9iamVjdCA9IHt9XG5cbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS5vbkRpZFVwZGF0ZU1lc3NhZ2VzKGZ1bmN0aW9uKHsgYWRkZWQsIHJlbW92ZWQsIG1lc3NhZ2VzIH0pIHtcbiAgICAgICAgY2FsbGVkKytcbiAgICAgICAgaWYgKGNhbGxlZCA9PT0gMSkge1xuICAgICAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMSlcbiAgICAgICAgICBleHBlY3QocmVtb3ZlZC5sZW5ndGgpLnRvQmUoMClcbiAgICAgICAgICBleHBlY3QoYWRkZWQubGVuZ3RoKS50b0JlKDEpXG4gICAgICAgICAgZXhwZWN0KGFkZGVkWzBdKS50b0JlKG1lc3NhZ2VGaXJzdClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDEpXG4gICAgICAgICAgZXhwZWN0KHJlbW92ZWQubGVuZ3RoKS50b0JlKDEpXG4gICAgICAgICAgZXhwZWN0KGFkZGVkLmxlbmd0aCkudG9CZSgxKVxuICAgICAgICAgIGV4cGVjdChhZGRlZFswXSkudG9CZShtZXNzYWdlU2Vjb25kKVxuICAgICAgICAgIGV4cGVjdChyZW1vdmVkWzBdKS50b0JlKG1lc3NhZ2VGaXJzdClcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgZXhwZWN0KGNhbGxlZCkudG9CZSgwKVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnNldCh7IGJ1ZmZlciwgbGludGVyLCBtZXNzYWdlczogW21lc3NhZ2VGaXJzdF0gfSlcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS51cGRhdGUoKVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnNldCh7IGJ1ZmZlciwgbGludGVyLCBtZXNzYWdlczogW21lc3NhZ2VTZWNvbmRdIH0pXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIGV4cGVjdChjYWxsZWQpLnRvQmUoMSlcbiAgICAgIG1lc3NhZ2VGaXJzdC50ZXh0ID0gJ0hlbGxvdydcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS5zZXQoeyBidWZmZXIsIGxpbnRlciwgbWVzc2FnZXM6IFttZXNzYWdlU2Vjb25kXSB9KVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnVwZGF0ZSgpXG4gICAgICBleHBlY3QoY2FsbGVkKS50b0JlKDIpXG4gICAgfSlcblxuICAgIGl0KCdzZW5kcyB0aGUgc2FtZSBvYmplY3QgZWFjaCB0aW1lIGV2ZW4gaW4gY29tcGxpY2F0ZWQgc2NlbmFyaW9zJywgZnVuY3Rpb24oKSB7XG4gICAgICBsZXQgY2FsbGVkID0gMFxuICAgICAgY29uc3Qga25vd25NZXNzYWdlcyA9IG5ldyBTZXQoKVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5Lm9uRGlkVXBkYXRlTWVzc2FnZXMoZnVuY3Rpb24oeyBhZGRlZCwgcmVtb3ZlZCwgbWVzc2FnZXMgfSkge1xuICAgICAgICBjYWxsZWQrK1xuICAgICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGFkZGVkKSB7XG4gICAgICAgICAgaWYgKGtub3duTWVzc2FnZXMuaGFzKGVudHJ5KSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNZXNzYWdlIGFscmVhZHkgZXhpc3RzJylcbiAgICAgICAgICB9IGVsc2Uga25vd25NZXNzYWdlcy5hZGQoZW50cnkpXG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiByZW1vdmVkKSB7XG4gICAgICAgICAgaWYgKGtub3duTWVzc2FnZXMuaGFzKGVudHJ5KSkge1xuICAgICAgICAgICAga25vd25NZXNzYWdlcy5kZWxldGUoZW50cnkpXG4gICAgICAgICAgfSBlbHNlIHRocm93IG5ldyBFcnJvcignTWVzc2FnZSBkb2VzIG5vdCBleGlzdCcpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1lc3NhZ2VzLmxlbmd0aCAhPT0ga25vd25NZXNzYWdlcy5zaXplKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTaXplIG1pc21hdGNoLCByZWdpc3RyeSBpcyBoYXZpbmcgaGljY3VwcycpXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIGNvbnN0IGxpbnRlcjogT2JqZWN0ID0geyBuYW1lOiAnYW55JyB9XG4gICAgICBjb25zdCBidWZmZXI6IE9iamVjdCA9IHt9XG4gICAgICBjb25zdCBtZXNzYWdlUmVhbEZpcnN0ID0gZ2V0TWVzc2FnZUxlZ2FjeSgpXG4gICAgICBjb25zdCBtZXNzYWdlRHVwZUZpcnN0ID0gT2JqZWN0LmFzc2lnbih7fSwgbWVzc2FnZVJlYWxGaXJzdClcbiAgICAgIGNvbnN0IG1lc3NhZ2VSZWFsU2Vjb25kID0gZ2V0TWVzc2FnZUxlZ2FjeSgpXG4gICAgICBjb25zdCBtZXNzYWdlRHVwZVNlY29uZCA9IE9iamVjdC5hc3NpZ24oe30sIG1lc3NhZ2VSZWFsU2Vjb25kKVxuXG4gICAgICBleHBlY3QoY2FsbGVkKS50b0JlKDApXG4gICAgICBtZXNzYWdlUmVnaXN0cnkuc2V0KHsgYnVmZmVyLCBsaW50ZXIsIG1lc3NhZ2VzOiBbbWVzc2FnZVJlYWxGaXJzdCwgbWVzc2FnZVJlYWxTZWNvbmRdIH0pXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIGV4cGVjdChjYWxsZWQpLnRvQmUoMSlcbiAgICAgIGV4cGVjdChrbm93bk1lc3NhZ2VzLnNpemUpLnRvQmUoMilcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS51cGRhdGUoKVxuICAgICAgZXhwZWN0KGNhbGxlZCkudG9CZSgxKVxuICAgICAgZXhwZWN0KGtub3duTWVzc2FnZXMuc2l6ZSkudG9CZSgyKVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnNldCh7IGJ1ZmZlciwgbGludGVyLCBtZXNzYWdlczogW21lc3NhZ2VSZWFsRmlyc3QsIG1lc3NhZ2VSZWFsU2Vjb25kXSB9KVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnVwZGF0ZSgpXG4gICAgICBleHBlY3QoY2FsbGVkKS50b0JlKDEpXG4gICAgICBleHBlY3Qoa25vd25NZXNzYWdlcy5zaXplKS50b0JlKDIpXG4gICAgICBtZXNzYWdlUmVnaXN0cnkuc2V0KHsgYnVmZmVyLCBsaW50ZXIsIG1lc3NhZ2VzOiBbbWVzc2FnZUR1cGVGaXJzdCwgbWVzc2FnZUR1cGVTZWNvbmRdIH0pXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIGV4cGVjdChjYWxsZWQpLnRvQmUoMSlcbiAgICAgIGV4cGVjdChrbm93bk1lc3NhZ2VzLnNpemUpLnRvQmUoMilcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS5kZWxldGVCeUxpbnRlcihsaW50ZXIpXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIGV4cGVjdChjYWxsZWQpLnRvQmUoMilcbiAgICAgIGV4cGVjdChrbm93bk1lc3NhZ2VzLnNpemUpLnRvQmUoMClcbiAgICB9KVxuICAgIGl0KCdub3RpY2VzIGNoYW5nZXMgb24gbGFzdCBtZXNzYWdlcyBpbnN0ZWFkIG9mIHJlbHlpbmcgb24gdGhlaXIga2V5cyBhbmQgaW52YWlsZGF0ZXMgdGhlbScsIGZ1bmN0aW9uKCkge1xuICAgICAgbGV0IGNhbGxlZCA9IDBcblxuICAgICAgY29uc3QgbGludGVyOiBPYmplY3QgPSB7IG5hbWU6ICdhbnknIH1cbiAgICAgIGNvbnN0IGJ1ZmZlcjogT2JqZWN0ID0ge31cbiAgICAgIGNvbnN0IG1lc3NhZ2VBID0gZ2V0TWVzc2FnZUxlZ2FjeSgpXG4gICAgICBjb25zdCBtZXNzYWdlQiA9IE9iamVjdC5hc3NpZ24oe30sIG1lc3NhZ2VBKVxuICAgICAgY29uc3QgbWVzc2FnZUMgPSBPYmplY3QuYXNzaWduKHt9LCBtZXNzYWdlQSlcblxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5Lm9uRGlkVXBkYXRlTWVzc2FnZXMoZnVuY3Rpb24oeyBhZGRlZCwgcmVtb3ZlZCwgbWVzc2FnZXMgfSkge1xuICAgICAgICBjYWxsZWQrK1xuICAgICAgICBpZiAoY2FsbGVkID09PSAxKSB7XG4gICAgICAgICAgZXhwZWN0KGFkZGVkLmxlbmd0aCkudG9CZSgxKVxuICAgICAgICAgIGV4cGVjdChyZW1vdmVkLmxlbmd0aCkudG9CZSgwKVxuICAgICAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMSlcbiAgICAgICAgICBleHBlY3QoYWRkZWQpLnRvRXF1YWwobWVzc2FnZXMpXG4gICAgICAgICAgZXhwZWN0KGFkZGVkWzBdKS50b0JlKG1lc3NhZ2VBKVxuICAgICAgICB9IGVsc2UgaWYgKGNhbGxlZCA9PT0gMikge1xuICAgICAgICAgIGV4cGVjdChhZGRlZC5sZW5ndGgpLnRvQmUoMSlcbiAgICAgICAgICBleHBlY3QocmVtb3ZlZC5sZW5ndGgpLnRvQmUoMSlcbiAgICAgICAgICBleHBlY3QobWVzc2FnZXMubGVuZ3RoKS50b0JlKDEpXG4gICAgICAgICAgZXhwZWN0KGFkZGVkKS50b0VxdWFsKG1lc3NhZ2VzKVxuICAgICAgICAgIGV4cGVjdChhZGRlZFswXSkudG9CZShtZXNzYWdlQilcbiAgICAgICAgICBleHBlY3QocmVtb3ZlZFswXSkudG9CZShtZXNzYWdlQSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Nob3VsZCBub3QgaGF2ZSBiZWVuIHRyaWdnZXJlZCcpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICBtZXNzYWdlUmVnaXN0cnkuc2V0KHsgYnVmZmVyLCBsaW50ZXIsIG1lc3NhZ2VzOiBbbWVzc2FnZUFdIH0pXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIG1lc3NhZ2VBLnRleHQgPSAnTVVSSUNBQUEnXG4gICAgICBtZXNzYWdlUmVnaXN0cnkuc2V0KHsgYnVmZmVyLCBsaW50ZXIsIG1lc3NhZ2VzOiBbbWVzc2FnZUJdIH0pXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS5zZXQoeyBidWZmZXIsIGxpbnRlciwgbWVzc2FnZXM6IFttZXNzYWdlQ10gfSlcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS51cGRhdGUoKVxuICAgICAgZXhwZWN0KGNhbGxlZCkudG9CZSgyKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJzo6ZGVsZXRlQnlCdWZmZXInLCBmdW5jdGlvbigpIHtcbiAgICBpdCgnZGVsZXRlcyB0aGUgbWVzc2FnZXMgYW5kIHNlbmRzIHRoZW0gaW4gYW4gZXZlbnQnLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGxpbnRlcjogT2JqZWN0ID0geyBuYW1lOiAnYW55JyB9XG4gICAgICBjb25zdCBidWZmZXI6IE9iamVjdCA9IHt9XG4gICAgICBjb25zdCBtZXNzYWdlRmlyc3QgPSBnZXRNZXNzYWdlTGVnYWN5KClcbiAgICAgIGNvbnN0IG1lc3NhZ2VTZWNvbmQgPSBnZXRNZXNzYWdlTGVnYWN5KClcblxuICAgICAgbGV0IGNhbGxlZCA9IDBcblxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5Lm9uRGlkVXBkYXRlTWVzc2FnZXMoZnVuY3Rpb24oeyBhZGRlZCwgcmVtb3ZlZCwgbWVzc2FnZXMgfSkge1xuICAgICAgICBjYWxsZWQrK1xuICAgICAgICBpZiAoY2FsbGVkID09PSAxKSB7XG4gICAgICAgICAgZXhwZWN0KGFkZGVkLmxlbmd0aCkudG9CZSgyKVxuICAgICAgICAgIGV4cGVjdChyZW1vdmVkLmxlbmd0aCkudG9CZSgwKVxuICAgICAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMilcbiAgICAgICAgICBleHBlY3QoYWRkZWQpLnRvRXF1YWwobWVzc2FnZXMpXG4gICAgICAgICAgZXhwZWN0KGFkZGVkWzBdKS50b0JlKG1lc3NhZ2VGaXJzdClcbiAgICAgICAgICBleHBlY3QoYWRkZWRbMV0pLnRvQmUobWVzc2FnZVNlY29uZClcbiAgICAgICAgfSBlbHNlIGlmIChjYWxsZWQgPT09IDIpIHtcbiAgICAgICAgICBleHBlY3QoYWRkZWQubGVuZ3RoKS50b0JlKDApXG4gICAgICAgICAgZXhwZWN0KHJlbW92ZWQubGVuZ3RoKS50b0JlKDIpXG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgwKVxuICAgICAgICAgIGV4cGVjdChyZW1vdmVkWzBdKS50b0JlKG1lc3NhZ2VGaXJzdClcbiAgICAgICAgICBleHBlY3QocmVtb3ZlZFsxXSkudG9CZShtZXNzYWdlU2Vjb25kKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5uZWNlc3NhcnkgdXBkYXRlIGNhbGwnKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnNldCh7IGJ1ZmZlciwgbGludGVyLCBtZXNzYWdlczogW21lc3NhZ2VGaXJzdCwgbWVzc2FnZVNlY29uZF0gfSlcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS51cGRhdGUoKVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnVwZGF0ZSgpXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS51cGRhdGUoKVxuICAgICAgZXhwZWN0KGNhbGxlZCkudG9CZSgxKVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LmRlbGV0ZUJ5QnVmZmVyKGJ1ZmZlcilcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS51cGRhdGUoKVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnVwZGF0ZSgpXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS51cGRhdGUoKVxuICAgICAgZXhwZWN0KGNhbGxlZCkudG9CZSgyKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJzo6ZGVsZXRlQnlMaW50ZXInLCBmdW5jdGlvbigpIHtcbiAgICBpdCgnZGVsZXRlcyB0aGUgbWVzc2FnZXMgYW5kIHNlbmRzIHRoZW0gaW4gYW4gZXZlbnQnLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGxpbnRlcjogT2JqZWN0ID0geyBuYW1lOiAnYW55JyB9XG4gICAgICBjb25zdCBidWZmZXI6IE9iamVjdCA9IHt9XG4gICAgICBjb25zdCBtZXNzYWdlRmlyc3QgPSBnZXRNZXNzYWdlTGVnYWN5KClcbiAgICAgIGNvbnN0IG1lc3NhZ2VTZWNvbmQgPSBnZXRNZXNzYWdlTGVnYWN5KClcblxuICAgICAgbGV0IGNhbGxlZCA9IDBcblxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5Lm9uRGlkVXBkYXRlTWVzc2FnZXMoZnVuY3Rpb24oeyBhZGRlZCwgcmVtb3ZlZCwgbWVzc2FnZXMgfSkge1xuICAgICAgICBjYWxsZWQrK1xuICAgICAgICBpZiAoY2FsbGVkID09PSAxKSB7XG4gICAgICAgICAgZXhwZWN0KGFkZGVkLmxlbmd0aCkudG9CZSgyKVxuICAgICAgICAgIGV4cGVjdChyZW1vdmVkLmxlbmd0aCkudG9CZSgwKVxuICAgICAgICAgIGV4cGVjdChtZXNzYWdlcy5sZW5ndGgpLnRvQmUoMilcbiAgICAgICAgICBleHBlY3QoYWRkZWQpLnRvRXF1YWwobWVzc2FnZXMpXG4gICAgICAgICAgZXhwZWN0KGFkZGVkWzBdKS50b0JlKG1lc3NhZ2VGaXJzdClcbiAgICAgICAgICBleHBlY3QoYWRkZWRbMV0pLnRvQmUobWVzc2FnZVNlY29uZClcbiAgICAgICAgfSBlbHNlIGlmIChjYWxsZWQgPT09IDIpIHtcbiAgICAgICAgICBleHBlY3QoYWRkZWQubGVuZ3RoKS50b0JlKDApXG4gICAgICAgICAgZXhwZWN0KHJlbW92ZWQubGVuZ3RoKS50b0JlKDIpXG4gICAgICAgICAgZXhwZWN0KG1lc3NhZ2VzLmxlbmd0aCkudG9CZSgwKVxuICAgICAgICAgIGV4cGVjdChyZW1vdmVkWzBdKS50b0JlKG1lc3NhZ2VGaXJzdClcbiAgICAgICAgICBleHBlY3QocmVtb3ZlZFsxXSkudG9CZShtZXNzYWdlU2Vjb25kKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5uZWNlc3NhcnkgdXBkYXRlIGNhbGwnKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnNldCh7IGJ1ZmZlciwgbGludGVyLCBtZXNzYWdlczogW21lc3NhZ2VGaXJzdCwgbWVzc2FnZVNlY29uZF0gfSlcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS51cGRhdGUoKVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnVwZGF0ZSgpXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS51cGRhdGUoKVxuICAgICAgZXhwZWN0KGNhbGxlZCkudG9CZSgxKVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LmRlbGV0ZUJ5TGludGVyKGxpbnRlcilcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS51cGRhdGUoKVxuICAgICAgbWVzc2FnZVJlZ2lzdHJ5LnVwZGF0ZSgpXG4gICAgICBtZXNzYWdlUmVnaXN0cnkudXBkYXRlKClcbiAgICAgIG1lc3NhZ2VSZWdpc3RyeS51cGRhdGUoKVxuICAgICAgZXhwZWN0KGNhbGxlZCkudG9CZSgyKVxuICAgIH0pXG4gIH0pXG59KVxuIl19