(function() {
  var Disposable, Linter;

  Disposable = require('atom').Disposable;

  module.exports = Linter = {
    instance: null,
    config: {
      lintOnFly: {
        title: 'Lint As You Type',
        description: 'Lint files while typing, without the need to save',
        type: 'boolean',
        "default": true,
        order: 1
      },
      lintOnFlyInterval: {
        title: 'Lint As You Type Interval',
        description: 'Interval at which providers are triggered as you type (in ms)',
        type: 'integer',
        "default": 300,
        order: 1
      },
      ignoredMessageTypes: {
        description: 'Comma separated list of message types to completely ignore',
        type: 'array',
        "default": [],
        items: {
          type: 'string'
        },
        order: 2
      },
      ignoreVCSIgnoredFiles: {
        title: 'Do Not Lint Files Ignored by VCS',
        description: 'E.g., ignore files specified in .gitignore',
        type: 'boolean',
        "default": true,
        order: 2
      },
      ignoreMatchedFiles: {
        title: 'Do Not Lint Files that match this Glob',
        type: 'string',
        "default": '/**/*.min.{js,css}',
        order: 2
      },
      showErrorInline: {
        title: 'Show Inline Error Tooltips',
        type: 'boolean',
        "default": true,
        order: 3
      },
      inlineTooltipInterval: {
        title: 'Inline Tooltip Interval',
        description: 'Interval at which inline tooltip is updated (in ms)',
        type: 'integer',
        "default": 60,
        order: 3
      },
      gutterEnabled: {
        title: 'Highlight Error Lines in Gutter',
        type: 'boolean',
        "default": true,
        order: 3
      },
      gutterPosition: {
        title: 'Position of Gutter Highlights',
        "enum": ['Left', 'Right'],
        "default": 'Right',
        order: 3,
        type: 'string'
      },
      underlineIssues: {
        title: 'Underline Issues',
        type: 'boolean',
        "default": true,
        order: 3
      },
      showProviderName: {
        title: 'Show Provider Name (When Available)',
        type: 'boolean',
        "default": true,
        order: 3
      },
      showErrorPanel: {
        title: 'Show Error Panel',
        description: 'Show a list of errors at the bottom of the editor',
        type: 'boolean',
        "default": true,
        order: 4
      },
      errorPanelHeight: {
        title: 'Error Panel Height',
        description: 'Height of the error panel (in px)',
        type: 'number',
        "default": 150,
        order: 4
      },
      alwaysTakeMinimumSpace: {
        title: 'Automatically Reduce Error Panel Height',
        description: 'Reduce panel height when it exceeds the height of the error list',
        type: 'boolean',
        "default": true,
        order: 4
      },
      displayLinterInfo: {
        title: 'Display Linter Info in the Status Bar',
        description: 'Whether to show any linter information in the status bar',
        type: 'boolean',
        "default": true,
        order: 5
      },
      displayLinterStatus: {
        title: 'Display Linter Status Info in Status Bar',
        description: 'The `No Issues` or `X Issues` widget',
        type: 'boolean',
        "default": true,
        order: 5
      },
      showErrorTabLine: {
        title: 'Show "Line" Tab in the Status Bar',
        type: 'boolean',
        "default": false,
        order: 5
      },
      showErrorTabFile: {
        title: 'Show "File" Tab in the Status Bar',
        type: 'boolean',
        "default": true,
        order: 5
      },
      showErrorTabProject: {
        title: 'Show "Project" Tab in the Status Bar',
        type: 'boolean',
        "default": true,
        order: 5
      },
      statusIconScope: {
        title: 'Scope of Linter Messages to Show in Status Icon',
        type: 'string',
        "enum": ['File', 'Line', 'Project'],
        "default": 'Project',
        order: 5
      },
      statusIconPosition: {
        title: 'Position of Status Icon in the Status Bar',
        "enum": ['Left', 'Right'],
        type: 'string',
        "default": 'Left',
        order: 5
      }
    },
    activate: function(state) {
      var LinterPlus;
      Linter.state = state;
      LinterPlus = require('./linter.coffee');
      return this.instance = new LinterPlus(state);
    },
    serialize: function() {
      return Linter.state;
    },
    consumeLinter: function(linters) {
      var linter, _i, _len;
      if (!(linters instanceof Array)) {
        linters = [linters];
      }
      for (_i = 0, _len = linters.length; _i < _len; _i++) {
        linter = linters[_i];
        this.instance.addLinter(linter);
      }
      return new Disposable((function(_this) {
        return function() {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = linters.length; _j < _len1; _j++) {
            linter = linters[_j];
            _results.push(_this.instance.deleteLinter(linter));
          }
          return _results;
        };
      })(this));
    },
    consumeStatusBar: function(statusBar) {
      return this.instance.views.attachBottom(statusBar);
    },
    provideLinter: function() {
      return this.instance;
    },
    provideIndie: function() {
      var _ref;
      return (_ref = this.instance) != null ? _ref.indieLinters : void 0;
    },
    deactivate: function() {
      var _ref;
      return (_ref = this.instance) != null ? _ref.deactivate() : void 0;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvbGludGVyL2xpYi9tYWluLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUFBO0FBQUEsTUFBQSxrQkFBQTs7QUFBQSxFQUFDLGFBQWMsT0FBQSxDQUFRLE1BQVIsRUFBZCxVQUFELENBQUE7O0FBQUEsRUFDQSxNQUFNLENBQUMsT0FBUCxHQUFpQixNQUFBLEdBQ2Y7QUFBQSxJQUFBLFFBQUEsRUFBVSxJQUFWO0FBQUEsSUFDQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLFNBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLGtCQUFQO0FBQUEsUUFDQSxXQUFBLEVBQWEsbURBRGI7QUFBQSxRQUVBLElBQUEsRUFBTSxTQUZOO0FBQUEsUUFHQSxTQUFBLEVBQVMsSUFIVDtBQUFBLFFBSUEsS0FBQSxFQUFPLENBSlA7T0FERjtBQUFBLE1BTUEsaUJBQUEsRUFDRTtBQUFBLFFBQUEsS0FBQSxFQUFPLDJCQUFQO0FBQUEsUUFDQSxXQUFBLEVBQWEsK0RBRGI7QUFBQSxRQUVBLElBQUEsRUFBTSxTQUZOO0FBQUEsUUFHQSxTQUFBLEVBQVMsR0FIVDtBQUFBLFFBSUEsS0FBQSxFQUFPLENBSlA7T0FQRjtBQUFBLE1BYUEsbUJBQUEsRUFDRTtBQUFBLFFBQUEsV0FBQSxFQUFhLDREQUFiO0FBQUEsUUFDQSxJQUFBLEVBQU0sT0FETjtBQUFBLFFBRUEsU0FBQSxFQUFTLEVBRlQ7QUFBQSxRQUdBLEtBQUEsRUFDRTtBQUFBLFVBQUEsSUFBQSxFQUFNLFFBQU47U0FKRjtBQUFBLFFBS0EsS0FBQSxFQUFPLENBTFA7T0FkRjtBQUFBLE1Bb0JBLHFCQUFBLEVBQ0U7QUFBQSxRQUFBLEtBQUEsRUFBTyxrQ0FBUDtBQUFBLFFBQ0EsV0FBQSxFQUFhLDRDQURiO0FBQUEsUUFFQSxJQUFBLEVBQU0s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

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/linter/lib/main.coffee
