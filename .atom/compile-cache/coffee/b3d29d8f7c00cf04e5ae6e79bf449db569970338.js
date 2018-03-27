(function() {
  'use strict';
  var Beautifier, HOST, MULTI_LINE_OUTPUT_TABLE, PORT, PythonBeautifier, format, net,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  net = require('net');

  Beautifier = require('./beautifier');

  HOST = '127.0.0.1';

  PORT = 36805;

  MULTI_LINE_OUTPUT_TABLE = {
    'Grid': 0,
    'Vertical': 1,
    'Hanging Indent': 2,
    'Vertical Hanging Indent': 3,
    'Hanging Grid': 4,
    'Hanging Grid Grouped': 5,
    'NOQA': 6
  };

  format = function(data, formaters) {
    return new Promise(function(resolve, reject) {
      var client;
      client = new net.Socket();
      client.on('error', function(error) {
        client.destroy();
        return reject(error);
      });
      return client.connect(PORT, HOST, function() {
        var response;
        client.setEncoding('utf8');
        client.write(JSON.stringify({
          'data': data,
          'formaters': formaters
        }));
        response = '';
        client.on('data', function(chunk) {
          return response += chunk;
        });
        return client.on('end', function() {
          response = JSON.parse(response);
          if (response.error != null) {
            reject(Error(response.error));
          } else {
            resolve(response.data);
          }
          return client.destroy();
        });
      });
    });
  };

  module.exports = PythonBeautifier = (function(superClass) {
    extend(PythonBeautifier, superClass);

    function PythonBeautifier() {
      return PythonBeautifier.__super__.constructor.apply(this, arguments);
    }

    PythonBeautifier.prototype.name = "pybeautifier";

    PythonBeautifier.prototype.link = "https://github.com/guyskk/pybeautifier";

    PythonBeautifier.prototype.isPreInstalled = false;

    PythonBeautifier.prototype.options = {
      Python: true
    };

    PythonBeautifier.prototype.beautify = function(text, language, options) {
      var formater, formaters, multi_line_output;
      formater = {
        'name': options.formater
      };
      if (options.formater === 'autopep8') {
        formater.config = {
          'ignore': options.ignore,
          'max_line_length': options.max_line_length
        };
      } else if (options.formater === 'yapf') {
        formater.config = {
          'style_config': options.style_config
        };
      }
      formaters = [formater];
      if (options.sort_imports) {
        multi_line_output = MULTI_LINE_OUTPUT_TABLE[options.multi_line_output];
        formaters.push({
          'name': 'isort',
          'config': {
            'multi_line_output': multi_line_output
          }
        });
      }
      return new this.Promise(function(resolve, reject) {
        return format(text, formaters).then(function(data) {
          return resolve(data);
        })["catch"](function(error) {
          return reject(error);
        });
      });
    };

    return PythonBeautifier;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvYmVhdXRpZmllcnMvcHliZWF1dGlmaWVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBO0FBQUEsTUFBQSw4RUFBQTtJQUFBOzs7RUFDQSxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVI7O0VBQ04sVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLElBQUEsR0FBTzs7RUFDUCxJQUFBLEdBQU87O0VBQ1AsdUJBQUEsR0FBMEI7SUFDeEIsTUFBQSxFQUFRLENBRGdCO0lBRXhCLFVBQUEsRUFBWSxDQUZZO0lBR3hCLGdCQUFBLEVBQWtCLENBSE07SUFJeEIseUJBQUEsRUFBMkIsQ0FKSDtJQUt4QixjQUFBLEVBQWdCLENBTFE7SUFNeEIsc0JBQUEsRUFBd0IsQ0FOQTtJQU94QixNQUFBLEVBQVEsQ0FQZ0I7OztFQVUxQixNQUFBLEdBQVMsU0FBQyxJQUFELEVBQU8sU0FBUDtBQUNQLFdBQVcsSUFBQSxPQUFBLENBQVEsU0FBQyxPQUFELEVBQVUsTUFBVjtBQUNqQixVQUFBO01BQUEsTUFBQSxHQUFhLElBQUEsR0FBRyxDQUFDLE1BQUosQ0FBQTtNQUNiLE1BQU0sQ0FBQyxFQUFQLENBQVUsT0FBVixFQUFtQixTQUFDLEtBQUQ7UUFDakIsTUFBTSxDQUFDLE9BQVAsQ0FBQTtlQUNBLE1BQUEsQ0FBTyxLQUFQO01BRmlCLENBQW5CO2FBR0EsTUFBTSxDQUFDLE9BQVAsQ0FBZSxJQUFmLEVBQXFCLElBQXJCLEVBQTJCLFNBQUE7QUFDekIsWUFBQTtRQUFBLE1BQU0sQ0FBQyxXQUFQLENBQW1CLE1BQW5CO1FBQ0EsTUFBTSxDQUFDLEtBQVAsQ0FBYSxJQUFJLENBQUMsU0FBTCxDQUFlO1VBQUMsTUFBQSxFQUFRLElBQVQ7VUFBZSxXQUFBLEVBQWEsU0FBNUI7U0FBZixDQUFiO1FBQ0EsUUFBQSxHQUFXO1FBQ1gsTUFBTSxDQUFDLEVBQVAsQ0FBVSxNQUFWLEVBQWtCLFNBQUMsS0FBRDtpQkFDaEIsUUFBQSxJQUFZO1FBREksQ0FBbEI7ZUFFQSxNQUFNLENBQUMsRUFBUCxDQUFVLEtBQVYsRUFBaUIsU0FBQTtVQUNmLFFBQUEsR0FBVyxJQUFJLENBQUMsS0FBTCxDQUFXLFFBQVg7VUFDWCxJQUFHLHNCQUFIO1lBQ0UsTUFBQSxDQUFPLEtBQUEsQ0FBTSxRQUFRLENBQUMsS0FBZixDQUFQLEVBREY7V0FBQSxNQUFBO1lBR0UsT0FBQSxDQUFRLFFBQVEsQ0FBQyxJQUFqQixFQUhGOztpQkFJQSxNQUFNLENBQUMsT0FBUCxDQUFBO1FBTmUsQ0FBakI7TUFOeUIsQ0FBM0I7SUFMaUIsQ0FBUjtFQURKOztFQW9CVCxNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OzsrQkFFckIsSUFBQSxHQUFNOzsrQkFDTixJQUFBLEdBQU07OytCQUNOLGNBQUEsR0FBZ0I7OytCQUVoQixPQUFBLEdBQVM7TUFDUCxNQUFBLEVBQVEsSUFERDs7OytCQUlULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBQ1IsVUFBQTtNQUFBLFFBQUEsR0FBVztRQUFDLE1BQUEsRUFBUSxPQUFPLENBQUMsUUFBakI7O01BQ1gsSUFBRyxPQUFPLENBQUMsUUFBUixLQUFvQixVQUF2QjtRQUNFLFFBQVEsQ0FBQyxNQUFULEdBQWtCO1VBQ2hCLFFBQUEsRUFBVSxPQUFPLENBQUMsTUFERjtVQUVoQixpQkFBQSxFQUFtQixPQUFPLENBQUMsZUFGWDtVQURwQjtPQUFBLE1BS0ssSUFBRyxPQUFPLENBQUMsUUFBUixLQUFvQixNQUF2QjtRQUNILFFBQVEsQ0FBQyxNQUFULEdBQWtCO1VBQUMsY0FBQSxFQUFnQixPQUFPLENBQUMsWUFBekI7VUFEZjs7TUFFTCxTQUFBLEdBQVksQ0FBQyxRQUFEO01BQ1osSUFBRyxPQUFPLENBQUMsWUFBWDtRQUNFLGlCQUFBLEdBQW9CLHVCQUF3QixDQUFBLE9BQU8sQ0FBQyxpQkFBUjtRQUM1QyxTQUFTLENBQUMsSUFBVixDQUNFO1VBQUEsTUFBQSxFQUFRLE9BQVI7VUFDQSxRQUFBLEVBQVU7WUFBQyxtQkFBQSxFQUFxQixpQkFBdEI7V0FEVjtTQURGLEVBRkY7O0FBS0EsYUFBVyxJQUFBLElBQUMsQ0FBQSxPQUFELENBQVMsU0FBQyxPQUFELEVBQVUsTUFBVjtlQUNsQixNQUFBLENBQU8sSUFBUCxFQUFhLFNBQWIsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLElBQUQ7aUJBQ0osT0FBQSxDQUFRLElBQVI7UUFESSxDQUROLENBR0EsRUFBQyxLQUFELEVBSEEsQ0FHTyxTQUFDLEtBQUQ7aUJBQ0wsTUFBQSxDQUFPLEtBQVA7UUFESyxDQUhQO01BRGtCLENBQVQ7SUFmSDs7OztLQVZvQztBQXBDaEQiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCdcbm5ldCA9IHJlcXVpcmUoJ25ldCcpXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblxuSE9TVCA9ICcxMjcuMC4wLjEnXG5QT1JUID0gMzY4MDVcbk1VTFRJX0xJTkVfT1VUUFVUX1RBQkxFID0ge1xuICAnR3JpZCc6IDAsXG4gICdWZXJ0aWNhbCc6IDEsXG4gICdIYW5naW5nIEluZGVudCc6IDIsXG4gICdWZXJ0aWNhbCBIYW5naW5nIEluZGVudCc6IDMsXG4gICdIYW5naW5nIEdyaWQnOiA0LFxuICAnSGFuZ2luZyBHcmlkIEdyb3VwZWQnOiA1LFxuICAnTk9RQSc6IDZcbn1cblxuZm9ybWF0ID0gKGRhdGEsIGZvcm1hdGVycykgLT5cbiAgcmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgY2xpZW50ID0gbmV3IG5ldC5Tb2NrZXQoKVxuICAgIGNsaWVudC5vbiAnZXJyb3InLCAoZXJyb3IpIC0+XG4gICAgICBjbGllbnQuZGVzdHJveSgpXG4gICAgICByZWplY3QoZXJyb3IpXG4gICAgY2xpZW50LmNvbm5lY3QgUE9SVCwgSE9TVCwgLT5cbiAgICAgIGNsaWVudC5zZXRFbmNvZGluZygndXRmOCcpXG4gICAgICBjbGllbnQud3JpdGUoSlNPTi5zdHJpbmdpZnkoeydkYXRhJzogZGF0YSwgJ2Zvcm1hdGVycyc6IGZvcm1hdGVyc30pKVxuICAgICAgcmVzcG9uc2UgPSAnJ1xuICAgICAgY2xpZW50Lm9uICdkYXRhJywgKGNodW5rKSAtPlxuICAgICAgICByZXNwb25zZSArPSBjaHVua1xuICAgICAgY2xpZW50Lm9uICdlbmQnLCAtPlxuICAgICAgICByZXNwb25zZSA9IEpTT04ucGFyc2UocmVzcG9uc2UpXG4gICAgICAgIGlmIHJlc3BvbnNlLmVycm9yP1xuICAgICAgICAgIHJlamVjdChFcnJvcihyZXNwb25zZS5lcnJvcikpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlLmRhdGEpXG4gICAgICAgIGNsaWVudC5kZXN0cm95KClcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBQeXRob25CZWF1dGlmaWVyIGV4dGVuZHMgQmVhdXRpZmllclxuXG4gIG5hbWU6IFwicHliZWF1dGlmaWVyXCJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vZ3V5c2trL3B5YmVhdXRpZmllclwiXG4gIGlzUHJlSW5zdGFsbGVkOiBmYWxzZVxuXG4gIG9wdGlvbnM6IHtcbiAgICBQeXRob246IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgZm9ybWF0ZXIgPSB7J25hbWUnOiBvcHRpb25zLmZvcm1hdGVyfVxuICAgIGlmIG9wdGlvbnMuZm9ybWF0ZXIgPT0gJ2F1dG9wZXA4J1xuICAgICAgZm9ybWF0ZXIuY29uZmlnID0ge1xuICAgICAgICAnaWdub3JlJzogb3B0aW9ucy5pZ25vcmVcbiAgICAgICAgJ21heF9saW5lX2xlbmd0aCc6IG9wdGlvbnMubWF4X2xpbmVfbGVuZ3RoXG4gICAgICB9XG4gICAgZWxzZSBpZiBvcHRpb25zLmZvcm1hdGVyID09ICd5YXBmJ1xuICAgICAgZm9ybWF0ZXIuY29uZmlnID0geydzdHlsZV9jb25maWcnOiBvcHRpb25zLnN0eWxlX2NvbmZpZ31cbiAgICBmb3JtYXRlcnMgPSBbZm9ybWF0ZXJdXG4gICAgaWYgb3B0aW9ucy5zb3J0X2ltcG9ydHNcbiAgICAgIG11bHRpX2xpbmVfb3V0cHV0ID0gTVVMVElfTElORV9PVVRQVVRfVEFCTEVbb3B0aW9ucy5tdWx0aV9saW5lX291dHB1dF1cbiAgICAgIGZvcm1hdGVycy5wdXNoXG4gICAgICAgICduYW1lJzogJ2lzb3J0J1xuICAgICAgICAnY29uZmlnJzogeydtdWx0aV9saW5lX291dHB1dCc6IG11bHRpX2xpbmVfb3V0cHV0fVxuICAgIHJldHVybiBuZXcgQFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICAgIGZvcm1hdCh0ZXh0LCBmb3JtYXRlcnMpXG4gICAgICAudGhlbiAoZGF0YSkgLT5cbiAgICAgICAgcmVzb2x2ZShkYXRhKVxuICAgICAgLmNhdGNoIChlcnJvcikgLT5cbiAgICAgICAgcmVqZWN0KGVycm9yKVxuIl19
