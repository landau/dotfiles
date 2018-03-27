"use babel";
// Borrowed from Atom core's spec.

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.beforeEach = beforeEach;
exports.afterEach = afterEach;

var conditionPromise = _asyncToGenerator(function* (condition) {
  var startTime = Date.now();

  while (true) {
    yield timeoutPromise(100);

    if (yield condition()) {
      return;
    }

    if (Date.now() - startTime > 5000) {
      throw new Error("Timed out waiting on condition");
    }
  }
});

exports.conditionPromise = conditionPromise;
exports.timeoutPromise = timeoutPromise;
exports.emitterEventPromise = emitterEventPromise;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, "next"); var callThrow = step.bind(null, "throw"); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function beforeEach(fn) {
  global.beforeEach(function () {
    var result = fn();
    if (result instanceof Promise) {
      waitsForPromise(function () {
        return result;
      });
    }
  });
}

function afterEach(fn) {
  global.afterEach(function () {
    var result = fn();
    if (result instanceof Promise) {
      waitsForPromise(function () {
        return result;
      });
    }
  });
}

;["it", "fit", "ffit", "fffit"].forEach(function (name) {
  module.exports[name] = function (description, fn) {
    global[name](description, function () {
      var result = fn();
      if (result instanceof Promise) {
        waitsForPromise(function () {
          return result;
        });
      }
    });
  };
});

function timeoutPromise(timeout) {
  return new Promise(function (resolve) {
    global.setTimeout(resolve, timeout);
  });
}

function waitsForPromise(fn) {
  var promise = fn();
  global.waitsFor("spec promise to resolve", function (done) {
    promise.then(done, function (error) {
      jasmine.getEnv().currentSpec.fail(error);
      done();
    });
  });
}

function emitterEventPromise(emitter, event) {
  var timeout = arguments.length <= 2 || arguments[2] === undefined ? 15000 : arguments[2];

  return new Promise(function (resolve, reject) {
    var timeoutHandle = setTimeout(function () {
      reject(new Error("Timed out waiting for '" + event + "' event"));
    }, timeout);
    emitter.once(event, function () {
      clearTimeout(timeoutHandle);
      resolve();
    });
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1Ly5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXBsdXMvc3BlYy9hc3luYy1zcGVjLWhlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFBOzs7Ozs7Ozs7SUFnQ1csZ0JBQWdCLHFCQUEvQixXQUFnQyxTQUFTLEVBQUU7QUFDaEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFBOztBQUU1QixTQUFPLElBQUksRUFBRTtBQUNYLFVBQU0sY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFBOztBQUV6QixRQUFJLE1BQU0sU0FBUyxFQUFFLEVBQUU7QUFDckIsYUFBTTtLQUNQOztBQUVELFFBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLFNBQVMsR0FBRyxJQUFJLEVBQUU7QUFDakMsWUFBTSxJQUFJLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFBO0tBQ2xEO0dBQ0Y7Q0FDRjs7Ozs7Ozs7QUEzQ00sU0FBUyxVQUFVLENBQUMsRUFBRSxFQUFFO0FBQzdCLFFBQU0sQ0FBQyxVQUFVLENBQUMsWUFBVztBQUMzQixRQUFNLE1BQU0sR0FBRyxFQUFFLEVBQUUsQ0FBQTtBQUNuQixRQUFJLE1BQU0sWUFBWSxPQUFPLEVBQUU7QUFDN0IscUJBQWUsQ0FBQztlQUFNLE1BQU07T0FBQSxDQUFDLENBQUE7S0FDOUI7R0FDRixDQUFDLENBQUE7Q0FDSDs7QUFFTSxTQUFTLFNBQVMsQ0FBQyxFQUFFLEVBQUU7QUFDNUIsUUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFXO0FBQzFCLFFBQU0sTUFBTSxHQUFHLEVBQUUsRUFBRSxDQUFBO0FBQ25CLFFBQUksTUFBTSxZQUFZLE9BQU8sRUFBRTtBQUM3QixxQkFBZSxDQUFDO2VBQU0sTUFBTTtPQUFBLENBQUMsQ0FBQTtLQUM5QjtHQUNGLENBQUMsQ0FBQTtDQUNIOztBQUVELENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBUyxJQUFJLEVBQUU7QUFDckQsUUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxVQUFTLFdBQVcsRUFBRSxFQUFFLEVBQUU7QUFDL0MsVUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxZQUFXO0FBQ25DLFVBQU0sTUFBTSxHQUFHLEVBQUUsRUFBRSxDQUFBO0FBQ25CLFVBQUksTUFBTSxZQUFZLE9BQU8sRUFBRTtBQUM3Qix1QkFBZSxDQUFDO2lCQUFNLE1BQU07U0FBQSxDQUFDLENBQUE7T0FDOUI7S0FDRixDQUFDLENBQUE7R0FDSCxDQUFBO0NBQ0YsQ0FBQyxDQUFBOztBQWtCSyxTQUFTLGNBQWMsQ0FBQyxPQUFPLEVBQUU7QUFDdEMsU0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFTLE9BQU8sRUFBRTtBQUNuQyxVQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQTtHQUNwQyxDQUFDLENBQUE7Q0FDSDs7QUFFRCxTQUFTLGVBQWUsQ0FBQyxFQUFFLEVBQUU7QUFDM0IsTUFBTSxPQUFPLEdBQUcsRUFBRSxFQUFFLENBQUE7QUFDcEIsUUFBTSxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsRUFBRSxVQUFTLElBQUksRUFBRTtBQUN4RCxXQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFTLEtBQUssRUFBRTtBQUNqQyxhQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUN4QyxVQUFJLEVBQUUsQ0FBQTtLQUNQLENBQUMsQ0FBQTtHQUNILENBQUMsQ0FBQTtDQUNIOztBQUVNLFNBQVMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBbUI7TUFBakIsT0FBTyx5REFBRyxLQUFLOztBQUNqRSxTQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBSztBQUN0QyxRQUFNLGFBQWEsR0FBRyxVQUFVLENBQUMsWUFBTTtBQUNyQyxZQUFNLENBQUMsSUFBSSxLQUFLLDZCQUEyQixLQUFLLGFBQVUsQ0FBQyxDQUFBO0tBQzVELEVBQUUsT0FBTyxDQUFDLENBQUE7QUFDWCxXQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxZQUFNO0FBQ3hCLGtCQUFZLENBQUMsYUFBYSxDQUFDLENBQUE7QUFDM0IsYUFBTyxFQUFFLENBQUE7S0FDVixDQUFDLENBQUE7R0FDSCxDQUFDLENBQUE7Q0FDSCIsImZpbGUiOiIvVXNlcnMvdGxhbmRhdS8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvYXN5bmMtc3BlYy1oZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIlxuLy8gQm9ycm93ZWQgZnJvbSBBdG9tIGNvcmUncyBzcGVjLlxuXG5leHBvcnQgZnVuY3Rpb24gYmVmb3JlRWFjaChmbikge1xuICBnbG9iYWwuYmVmb3JlRWFjaChmdW5jdGlvbigpIHtcbiAgICBjb25zdCByZXN1bHQgPSBmbigpXG4gICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgIHdhaXRzRm9yUHJvbWlzZSgoKSA9PiByZXN1bHQpXG4gICAgfVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYWZ0ZXJFYWNoKGZuKSB7XG4gIGdsb2JhbC5hZnRlckVhY2goZnVuY3Rpb24oKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gZm4oKVxuICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4gcmVzdWx0KVxuICAgIH1cbiAgfSlcbn1cblxuO1tcIml0XCIsIFwiZml0XCIsIFwiZmZpdFwiLCBcImZmZml0XCJdLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICBtb2R1bGUuZXhwb3J0c1tuYW1lXSA9IGZ1bmN0aW9uKGRlc2NyaXB0aW9uLCBmbikge1xuICAgIGdsb2JhbFtuYW1lXShkZXNjcmlwdGlvbiwgZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBmbigpXG4gICAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICB3YWl0c0ZvclByb21pc2UoKCkgPT4gcmVzdWx0KVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn0pXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb25kaXRpb25Qcm9taXNlKGNvbmRpdGlvbikge1xuICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpXG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBhd2FpdCB0aW1lb3V0UHJvbWlzZSgxMDApXG5cbiAgICBpZiAoYXdhaXQgY29uZGl0aW9uKCkpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGlmIChEYXRlLm5vdygpIC0gc3RhcnRUaW1lID4gNTAwMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGltZWQgb3V0IHdhaXRpbmcgb24gY29uZGl0aW9uXCIpXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0aW1lb3V0UHJvbWlzZSh0aW1lb3V0KSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgZ2xvYmFsLnNldFRpbWVvdXQocmVzb2x2ZSwgdGltZW91dClcbiAgfSlcbn1cblxuZnVuY3Rpb24gd2FpdHNGb3JQcm9taXNlKGZuKSB7XG4gIGNvbnN0IHByb21pc2UgPSBmbigpXG4gIGdsb2JhbC53YWl0c0ZvcihcInNwZWMgcHJvbWlzZSB0byByZXNvbHZlXCIsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICBwcm9taXNlLnRoZW4oZG9uZSwgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgIGphc21pbmUuZ2V0RW52KCkuY3VycmVudFNwZWMuZmFpbChlcnJvcilcbiAgICAgIGRvbmUoKVxuICAgIH0pXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbWl0dGVyRXZlbnRQcm9taXNlKGVtaXR0ZXIsIGV2ZW50LCB0aW1lb3V0ID0gMTUwMDApIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCB0aW1lb3V0SGFuZGxlID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICByZWplY3QobmV3IEVycm9yKGBUaW1lZCBvdXQgd2FpdGluZyBmb3IgJyR7ZXZlbnR9JyBldmVudGApKVxuICAgIH0sIHRpbWVvdXQpXG4gICAgZW1pdHRlci5vbmNlKGV2ZW50LCAoKSA9PiB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dEhhbmRsZSlcbiAgICAgIHJlc29sdmUoKVxuICAgIH0pXG4gIH0pXG59XG4iXX0=