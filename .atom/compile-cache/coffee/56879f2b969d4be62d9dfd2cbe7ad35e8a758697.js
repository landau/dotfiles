(function() {
  module.exports = {
    general: {
      title: 'General',
      type: 'object',
      collapsed: true,
      order: -1,
      description: 'General options for Atom Beautify',
      properties: {
        analytics: {
          title: 'Anonymous Analytics',
          type: 'boolean',
          "default": true,
          description: "[Google Analytics](http://www.google.com/analytics/) is used to track what languages are being used the most and causing the most errors, as well as other stats such as performance. Everything is anonymized and no personal information, such as source code, is sent. See https://github.com/Glavin001/atom-beautify/issues/47 for more details."
        },
        _analyticsUserId: {
          title: 'Analytics User Id',
          type: 'string',
          "default": "",
          description: "Unique identifier for this user for tracking usage analytics"
        },
        loggerLevel: {
          title: "Logger Level",
          type: 'string',
          "default": 'warn',
          description: 'Set the level for the logger',
          "enum": ['verbose', 'debug', 'info', 'warn', 'error']
        },
        beautifyEntireFileOnSave: {
          title: "Beautify Entire File On Save",
          type: 'boolean',
          "default": true,
          description: "When beautifying on save, use the entire file, even if there is selected text in the editor. Important: The `beautify on save` option for the specific language must be enabled for this to be applicable. This option is not `beautify on save`."
        },
        muteUnsupportedLanguageErrors: {
          title: "Mute Unsupported Language Errors",
          type: 'boolean',
          "default": false,
          description: "Do not show \"Unsupported Language\" errors when they occur"
        },
        muteAllErrors: {
          title: "Mute All Errors",
          type: 'boolean',
          "default": false,
          description: "Do not show any/all errors when they occur"
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvY29uZmlnLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQUFBLElBQ2YsT0FBQSxFQUNFO0FBQUEsTUFBQSxLQUFBLEVBQU8sU0FBUDtBQUFBLE1BQ0EsSUFBQSxFQUFNLFFBRE47QUFBQSxNQUVBLFNBQUEsRUFBVyxJQUZYO0FBQUEsTUFHQSxLQUFBLEVBQU8sQ0FBQSxDQUhQO0FBQUEsTUFJQSxXQUFBLEVBQWEsbUNBSmI7QUFBQSxNQUtBLFVBQUEsRUFDRTtBQUFBLFFBQUEsU0FBQSxFQUNFO0FBQUEsVUFBQSxLQUFBLEVBQU8scUJBQVA7QUFBQSxVQUNBLElBQUEsRUFBTyxTQURQO0FBQUEsVUFFQSxTQUFBLEVBQVUsSUFGVjtBQUFBLFVBR0EsV0FBQSxFQUFjLHNWQUhkO1NBREY7QUFBQSxRQVVBLGdCQUFBLEVBQ0U7QUFBQSxVQUFBLEtBQUEsRUFBTyxtQkFBUDtBQUFBLFVBQ0EsSUFBQSxFQUFPLFFBRFA7QUFBQSxVQUVBLFNBQUEsRUFBVSxFQUZWO0FBQUEsVUFHQSxXQUFBLEVBQWMsOERBSGQ7U0FYRjtBQUFBLFFBZUEsV0FBQSxFQUNFO0FBQUEsVUFBQSxLQUFBLEVBQU8sY0FBUDtBQUFBLFVBQ0EsSUFBQSxFQUFPLFFBRFA7QUFBQSxVQUVBLFNBQUEsRUFBVSxNQUZWO0FBQUEsVUFHQSxXQUFBLEVBQWMsOEJBSGQ7QUFBQSxVQUlBLE1BQUEsRUFBTyxDQUFDLFNBQUQsRUFBWSxPQUFaLEVBQXFCLE1BQXJCLEVBQTZCLE1BQTdCLEVBQXFDLE9BQXJDLENBSlA7U0FoQkY7QUFBQSxRQXFCQSx3QkFBQSxFQUNFO0FBQUEsVUFBQSxLQUFBLEVBQU8sOEJBQVA7QUFBQSxVQUNBLElBQUEsRUFBTyxTQURQO0FBQUEsVUFFQSxTQUFBLEVBQVUsSUFGVjtBQUFBLFVBR0EsV0FBQSxFQUFjLG1QQUhkO1NBdEJGO0FBQUEsUUEwQkEsNkJBQUEsRUFDRTtBQUFBLFVBQUEsS0FBQSxFQUFPLGtDQUFQO0FBQUEsVUFDQSxJQUFBLEVBQU8sU0FEUDtBQUFBLFVBRUEsU0FBQSxFQUFVLEtBRlY7QUFBQSxVQUdBLFdBQUEsRUFBYyw2REFIZDtTQTNCRjtBQUFBLFFBK0JBLGFBQUEsRUFDRTtBQUFBLFVBQUEsS0FBQSxFQUFPLGlCQUFQO0FBQUEsVUFDQSxJQUFBLEVBQU8sU0FEUDtBQUFBLFVBRUEsU0FBQSxFQUFVLEtBRlY7QUFBQSxVQUdBLFdBQUEsRUFBYyw0Q0FIZDtTQWhDRjtPQU5GO0tBRmE7R0FBakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-beautify/src/config.coffee
