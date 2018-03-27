(function() {
  window.DEBUG = false;

  module.exports = {
    config: {
      useKite: {
        type: 'boolean',
        "default": true,
        order: 0,
        title: 'Use Kite-powered Completions',
        description: 'Kite is a cloud powered autocomplete engine. It provides\nsignificantly more autocomplete suggestions than the legacy engine.'
      },
      showDescriptions: {
        type: 'boolean',
        "default": true,
        order: 1,
        title: 'Show Descriptions',
        description: 'Show doc strings from functions, classes, etc.'
      },
      useSnippets: {
        type: 'string',
        "default": 'none',
        order: 2,
        "enum": ['none', 'all', 'required'],
        title: 'Autocomplete Function Parameters',
        description: 'Automatically complete function arguments after typing\nleft parenthesis character. Use completion key to jump between\narguments. See `autocomplete-python:complete-arguments` command if you\nwant to trigger argument completions manually. See README if it does not\nwork for you.'
      },
      pythonPaths: {
        type: 'string',
        "default": '',
        order: 3,
        title: 'Python Executable Paths',
        description: 'Optional semicolon separated list of paths to python\nexecutables (including executable names), where the first one will take\nhigher priority over the last one. By default autocomplete-python will\nautomatically look for virtual environments inside of your project and\ntry to use them as well as try to find global python executable. If you\nuse this config, automatic lookup will have lowest priority.\nUse `$PROJECT` or `$PROJECT_NAME` substitution for project-specific\npaths to point on executables in virtual environments.\nFor example:\n`/Users/name/.virtualenvs/$PROJECT_NAME/bin/python;$PROJECT/venv/bin/python3;/usr/bin/python`.\nSuch config will fall back on `/usr/bin/python` for projects not presented\nwith same name in `.virtualenvs` and without `venv` folder inside of one\nof project folders.\nIf you are using python3 executable while coding for python2 you will get\npython2 completions for some built-ins.'
      },
      extraPaths: {
        type: 'string',
        "default": '',
        order: 4,
        title: 'Extra Paths For Packages',
        description: 'Semicolon separated list of modules to additionally\ninclude for autocomplete. You can use same substitutions as in\n`Python Executable Paths`.\nNote that it still should be valid python package.\nFor example:\n`$PROJECT/env/lib/python2.7/site-packages`\nor\n`/User/name/.virtualenvs/$PROJECT_NAME/lib/python2.7/site-packages`.\nYou don\'t need to specify extra paths for libraries installed with python\nexecutable you use.'
      },
      caseInsensitiveCompletion: {
        type: 'boolean',
        "default": true,
        order: 5,
        title: 'Case Insensitive Completion',
        description: 'The completion is by default case insensitive.'
      },
      triggerCompletionRegex: {
        type: 'string',
        "default": '([\.\ (]|[a-zA-Z_][a-zA-Z0-9_]*)',
        order: 6,
        title: 'Regex To Trigger Autocompletions',
        description: 'By default completions triggered after words, dots, spaces\nand left parenthesis. You will need to restart your editor after changing\nthis.'
      },
      fuzzyMatcher: {
        type: 'boolean',
        "default": true,
        order: 7,
        title: 'Use Fuzzy Matcher For Completions.',
        description: 'Typing `stdr` will match `stderr`.\nFirst character should always match. Uses additional caching thus\ncompletions should be faster. Note that this setting does not affect\nbuilt-in autocomplete-plus provider.'
      },
      outputProviderErrors: {
        type: 'boolean',
        "default": false,
        order: 8,
        title: 'Output Provider Errors',
        description: 'Select if you would like to see the provider errors when\nthey happen. By default they are hidden. Note that critical errors are\nalways shown.'
      },
      outputDebug: {
        type: 'boolean',
        "default": false,
        order: 9,
        title: 'Output Debug Logs',
        description: 'Select if you would like to see debug information in\ndeveloper tools logs. May slow down your editor.'
      },
      showTooltips: {
        type: 'boolean',
        "default": false,
        order: 10,
        title: 'Show Tooltips with information about the object under the cursor',
        description: 'EXPERIMENTAL FEATURE WHICH IS NOT FINISHED YET.\nFeedback and ideas are welcome on github.'
      },
      suggestionPriority: {
        type: 'integer',
        "default": 3,
        minimum: 0,
        maximum: 99,
        order: 11,
        title: 'Suggestion Priority',
        description: 'You can use this to set the priority for autocomplete-python\nsuggestions. For example, you can use lower value to give higher priority\nfor snippets completions which has priority of 2.'
      }
    },
    installation: null,
    activate: function(state) {
      var AccountManager, AtomHelper, DecisionMaker, Installation, Installer, Metrics, StateController, checkKiteInstallation, dm, editorCfg, event, firstInstall, longRunning, pluginCfg, ref;
      require('./provider').constructor();
      firstInstall = localStorage.getItem('autocomplete-python.installed') === null;
      localStorage.setItem('autocomplete-python.installed', true);
      longRunning = require('process').uptime() > 10;
      if (firstInstall && longRunning) {
        event = "installed";
      } else if (firstInstall) {
        event = "upgraded";
      } else {
        event = "restarted";
      }
      ref = require('kite-installer'), AccountManager = ref.AccountManager, AtomHelper = ref.AtomHelper, DecisionMaker = ref.DecisionMaker, Installation = ref.Installation, Installer = ref.Installer, Metrics = ref.Metrics, StateController = ref.StateController;
      AccountManager.initClient('alpha.kite.com', -1, true);
      atom.views.addViewProvider(Installation, (function(_this) {
        return function(m) {
          return m.element;
        };
      })(this));
      editorCfg = {
        UUID: localStorage.getItem('metrics.userId'),
        name: 'atom'
      };
      pluginCfg = {
        name: 'autocomplete-python'
      };
      dm = new DecisionMaker(editorCfg, pluginCfg);
      checkKiteInstallation = (function(_this) {
        return function() {
          var canInstall, throttle;
          if (!atom.config.get('autocomplete-python.useKite')) {
            return;
          }
          canInstall = StateController.canInstallKite();
          throttle = dm.shouldOfferKite(event);
          if (atom.config.get('autocomplete-python.useKite')) {
            return Promise.all([throttle, canInstall]).then(function(values) {
              var installer, pane, variant;
              atom.config.set('autocomplete-python.useKite', true);
              variant = values[0];
              Metrics.Tracker.name = "atom autocomplete-python install";
              Metrics.Tracker.props = variant;
              Metrics.Tracker.props.lastEvent = event;
              _this.installation = new Installation(variant);
              _this.installation.accountCreated(function() {
                Metrics.Tracker.trackEvent("account created");
                return atom.config.set('autocomplete-python.useKite', true);
              });
              _this.installation.flowSkipped(function() {
                Metrics.Tracker.trackEvent("flow aborted");
                return atom.config.set('autocomplete-python.useKite', false);
              });
              installer = new Installer();
              installer.init(_this.installation.flow);
              pane = atom.workspace.getActivePane();
              _this.installation.flow.onSkipInstall(function() {
                atom.config.set('autocomplete-python.useKite', false);
                Metrics.Tracker.trackEvent("skipped kite");
                return pane.destroyActiveItem();
              });
              pane.addItem(_this.installation, {
                index: 0
              });
              return pane.activateItemAtIndex(0);
            }, function(err) {
              if (err.type === 'denied') {
                return atom.config.set('autocomplete-python.useKite', false);
              } else {
                return console.log("autocomplete-python ready");
              }
            });
          }
        };
      })(this);
      checkKiteInstallation();
      return atom.config.onDidChange('autocomplete-python.useKite', (function(_this) {
        return function(arg) {
          var newValue, oldValue;
          newValue = arg.newValue, oldValue = arg.oldValue;
          if (newValue) {
            checkKiteInstallation();
            return AtomHelper.enablePackage();
          } else {
            return AtomHelper.disablePackage();
          }
        };
      })(this));
    },
    deactivate: function() {
      require('./provider').dispose();
      if (this.installation) {
        return this.installation.destroy();
      }
    },
    getProvider: function() {
      return require('./provider');
    },
    getHyperclickProvider: function() {
      return require('./hyperclick-provider');
    },
    consumeSnippets: function(snippetsManager) {
      return require('./provider').setSnippetsManager(snippetsManager);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXB5dGhvbi9saWIvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsS0FBUCxHQUFlOztFQUNmLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxNQUFBLEVBQ0U7TUFBQSxPQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLEtBQUEsRUFBTyxDQUZQO1FBR0EsS0FBQSxFQUFPLDhCQUhQO1FBSUEsV0FBQSxFQUFhLCtIQUpiO09BREY7TUFPQSxnQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7UUFFQSxLQUFBLEVBQU8sQ0FGUDtRQUdBLEtBQUEsRUFBTyxtQkFIUDtRQUlBLFdBQUEsRUFBYSxnREFKYjtPQVJGO01BYUEsV0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLE1BRFQ7UUFFQSxLQUFBLEVBQU8sQ0FGUDtRQUdBLENBQUEsSUFBQSxDQUFBLEVBQU0sQ0FBQyxNQUFELEVBQVMsS0FBVCxFQUFnQixVQUFoQixDQUhOO1FBSUEsS0FBQSxFQUFPLGtDQUpQO1FBS0EsV0FBQSxFQUFhLHlSQUxiO09BZEY7TUF3QkEsV0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBRFQ7UUFFQSxLQUFBLEVBQU8sQ0FGUDtRQUdBLEtBQUEsRUFBTyx5QkFIUDtRQUlBLFdBQUEsRUFBYSxnNkJBSmI7T0F6QkY7TUE0Q0EsVUFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFFBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEVBRFQ7UUFFQSxLQUFBLEVBQU8sQ0FG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bUJBQ0EsVUFBVSxDQUFDLGFBQVgsQ0FBQSxFQUZGO1dBQUEsTUFBQTttQkFJRSxVQUFVLENBQUMsY0FBWCxDQUFBLEVBSkY7O1FBRHFEO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF2RDtJQXJFUSxDQXRIVjtJQWtNQSxVQUFBLEVBQVksU0FBQTtNQUNWLE9BQUEsQ0FBUSxZQUFSLENBQXFCLENBQUMsT0FBdEIsQ0FBQTtNQUNBLElBQTJCLElBQUMsQ0FBQSxZQUE1QjtlQUFBLElBQUMsQ0FBQSxZQUFZLENBQUMsT0FBZCxDQUFBLEVBQUE7O0lBRlUsQ0FsTVo7SUFzTUEsV0FBQSxFQUFhLFNBQUE7YUFBRyxPQUFBLENBQVEsWUFBUjtJQUFILENBdE1iO0lBd01BLHFCQUFBLEVBQXVCLFNBQUE7YUFBRyxPQUFBLENBQVEsdUJBQVI7SUFBSCxDQXhNdkI7SUEwTUEsZUFBQSxFQUFpQixTQUFDLGVBQUQ7YUFDZixPQUFBLENBQVEsWUFBUixDQUFxQixDQUFDLGtCQUF0QixDQUF5QyxlQUF6QztJQURlLENBMU1qQjs7QUFGRiIsInNvdXJjZXNDb250ZW50IjpbIndpbmRvdy5ERUJVRyA9IGZhbHNlXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGNvbmZpZzpcbiAgICB1c2VLaXRlOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBvcmRlcjogMFxuICAgICAgdGl0bGU6ICdVc2UgS2l0ZS1wb3dlcmVkIENvbXBsZXRpb25zJ1xuICAgICAgZGVzY3JpcHRpb246ICcnJ0tpdGUgaXMgYSBjbG91ZCBwb3dlcmVkIGF1dG9jb21wbGV0ZSBlbmdpbmUuIEl0IHByb3ZpZGVzXG4gICAgICBzaWduaWZpY2FudGx5IG1vcmUgYXV0b2NvbXBsZXRlIHN1Z2dlc3Rpb25zIHRoYW4gdGhlIGxlZ2FjeSBlbmdpbmUuJycnXG4gICAgc2hvd0Rlc2NyaXB0aW9uczpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgb3JkZXI6IDFcbiAgICAgIHRpdGxlOiAnU2hvdyBEZXNjcmlwdGlvbnMnXG4gICAgICBkZXNjcmlwdGlvbjogJ1Nob3cgZG9jIHN0cmluZ3MgZnJvbSBmdW5jdGlvbnMsIGNsYXNzZXMsIGV0Yy4nXG4gICAgdXNlU25pcHBldHM6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJ25vbmUnXG4gICAgICBvcmRlcjogMlxuICAgICAgZW51bTogWydub25lJywgJ2FsbCcsICdyZXF1aXJlZCddXG4gICAgICB0aXRsZTogJ0F1dG9jb21wbGV0ZSBGdW5jdGlvbiBQYXJhbWV0ZXJzJ1xuICAgICAgZGVzY3JpcHRpb246ICcnJ0F1dG9tYXRpY2FsbHkgY29tcGxldGUgZnVuY3Rpb24gYXJndW1lbnRzIGFmdGVyIHR5cGluZ1xuICAgICAgbGVmdCBwYXJlbnRoZXNpcyBjaGFyYWN0ZXIuIFVzZSBjb21wbGV0aW9uIGtleSB0byBqdW1wIGJldHdlZW5cbiAgICAgIGFyZ3VtZW50cy4gU2VlIGBhdXRvY29tcGxldGUtcHl0aG9uOmNvbXBsZXRlLWFyZ3VtZW50c2AgY29tbWFuZCBpZiB5b3VcbiAgICAgIHdhbnQgdG8gdHJpZ2dlciBhcmd1bWVudCBjb21wbGV0aW9ucyBtYW51YWxseS4gU2VlIFJFQURNRSBpZiBpdCBkb2VzIG5vdFxuICAgICAgd29yayBmb3IgeW91LicnJ1xuICAgIHB5dGhvblBhdGhzOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICBvcmRlcjogM1xuICAgICAgdGl0bGU6ICdQeXRob24gRXhlY3V0YWJsZSBQYXRocydcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydPcHRpb25hbCBzZW1pY29sb24gc2VwYXJhdGVkIGxpc3Qgb2YgcGF0aHMgdG8gcHl0aG9uXG4gICAgICBleGVjdXRhYmxlcyAoaW5jbHVkaW5nIGV4ZWN1dGFibGUgbmFtZXMpLCB3aGVyZSB0aGUgZmlyc3Qgb25lIHdpbGwgdGFrZVxuICAgICAgaGlnaGVyIHByaW9yaXR5IG92ZXIgdGhlIGxhc3Qgb25lLiBCeSBkZWZhdWx0IGF1dG9jb21wbGV0ZS1weXRob24gd2lsbFxuICAgICAgYXV0b21hdGljYWxseSBsb29rIGZvciB2aXJ0dWFsIGVudmlyb25tZW50cyBpbnNpZGUgb2YgeW91ciBwcm9qZWN0IGFuZFxuICAgICAgdHJ5IHRvIHVzZSB0aGVtIGFzIHdlbGwgYXMgdHJ5IHRvIGZpbmQgZ2xvYmFsIHB5dGhvbiBleGVjdXRhYmxlLiBJZiB5b3VcbiAgICAgIHVzZSB0aGlzIGNvbmZpZywgYXV0b21hdGljIGxvb2t1cCB3aWxsIGhhdmUgbG93ZXN0IHByaW9yaXR5LlxuICAgICAgVXNlIGAkUFJPSkVDVGAgb3IgYCRQUk9KRUNUX05BTUVgIHN1YnN0aXR1dGlvbiBmb3IgcHJvamVjdC1zcGVjaWZpY1xuICAgICAgcGF0aHMgdG8gcG9pbnQgb24gZXhlY3V0YWJsZXMgaW4gdmlydHVhbCBlbnZpcm9ubWVudHMuXG4gICAgICBGb3IgZXhhbXBsZTpcbiAgICAgIGAvVXNlcnMvbmFtZS8udmlydHVhbGVudnMvJFBST0pFQ1RfTkFNRS9iaW4vcHl0aG9uOyRQUk9KRUNUL3ZlbnYvYmluL3B5dGhvbjM7L3Vzci9iaW4vcHl0aG9uYC5cbiAgICAgIFN1Y2ggY29uZmlnIHdpbGwgZmFsbCBiYWNrIG9uIGAvdXNyL2Jpbi9weXRob25gIGZvciBwcm9qZWN0cyBub3QgcHJlc2VudGVkXG4gICAgICB3aXRoIHNhbWUgbmFtZSBpbiBgLnZpcnR1YWxlbnZzYCBhbmQgd2l0aG91dCBgdmVudmAgZm9sZGVyIGluc2lkZSBvZiBvbmVcbiAgICAgIG9mIHByb2plY3QgZm9sZGVycy5cbiAgICAgIElmIHlvdSBhcmUgdXNpbmcgcHl0aG9uMyBleGVjdXRhYmxlIHdoaWxlIGNvZGluZyBmb3IgcHl0aG9uMiB5b3Ugd2lsbCBnZXRcbiAgICAgIHB5dGhvbjIgY29tcGxldGlvbnMgZm9yIHNvbWUgYnVpbHQtaW5zLicnJ1xuICAgIGV4dHJhUGF0aHM6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJydcbiAgICAgIG9yZGVyOiA0XG4gICAgICB0aXRsZTogJ0V4dHJhIFBhdGhzIEZvciBQYWNrYWdlcydcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydTZW1pY29sb24gc2VwYXJhdGVkIGxpc3Qgb2YgbW9kdWxlcyB0byBhZGRpdGlvbmFsbHlcbiAgICAgIGluY2x1ZGUgZm9yIGF1dG9jb21wbGV0ZS4gWW91IGNhbiB1c2Ugc2FtZSBzdWJzdGl0dXRpb25zIGFzIGluXG4gICAgICBgUHl0aG9uIEV4ZWN1dGFibGUgUGF0aHNgLlxuICAgICAgTm90ZSB0aGF0IGl0IHN0aWxsIHNob3VsZCBiZSB2YWxpZCBweXRob24gcGFja2FnZS5cbiAgICAgIEZvciBleGFtcGxlOlxuICAgICAgYCRQUk9KRUNUL2Vudi9saWIvcHl0aG9uMi43L3NpdGUtcGFja2FnZXNgXG4gICAgICBvclxuICAgICAgYC9Vc2VyL25hbWUvLnZpcnR1YWxlbnZzLyRQUk9KRUNUX05BTUUvbGliL3B5dGhvbjIuNy9zaXRlLXBhY2thZ2VzYC5cbiAgICAgIFlvdSBkb24ndCBuZWVkIHRvIHNwZWNpZnkgZXh0cmEgcGF0aHMgZm9yIGxpYnJhcmllcyBpbnN0YWxsZWQgd2l0aCBweXRob25cbiAgICAgIGV4ZWN1dGFibGUgeW91IHVzZS4nJydcbiAgICBjYXNlSW5zZW5zaXRpdmVDb21wbGV0aW9uOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBvcmRlcjogNVxuICAgICAgdGl0bGU6ICdDYXNlIEluc2Vuc2l0aXZlIENvbXBsZXRpb24nXG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSBjb21wbGV0aW9uIGlzIGJ5IGRlZmF1bHQgY2FzZSBpbnNlbnNpdGl2ZS4nXG4gICAgdHJpZ2dlckNvbXBsZXRpb25SZWdleDpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnKFtcXC5cXCAoXXxbYS16QS1aX11bYS16QS1aMC05X10qKSdcbiAgICAgIG9yZGVyOiA2XG4gICAgICB0aXRsZTogJ1JlZ2V4IFRvIFRyaWdnZXIgQXV0b2NvbXBsZXRpb25zJ1xuICAgICAgZGVzY3JpcHRpb246ICcnJ0J5IGRlZmF1bHQgY29tcGxldGlvbnMgdHJpZ2dlcmVkIGFmdGVyIHdvcmRzLCBkb3RzLCBzcGFjZXNcbiAgICAgIGFuZCBsZWZ0IHBhcmVudGhlc2lzLiBZb3Ugd2lsbCBuZWVkIHRvIHJlc3RhcnQgeW91ciBlZGl0b3IgYWZ0ZXIgY2hhbmdpbmdcbiAgICAgIHRoaXMuJycnXG4gICAgZnV6enlNYXRjaGVyOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBvcmRlcjogN1xuICAgICAgdGl0bGU6ICdVc2UgRnV6enkgTWF0Y2hlciBGb3IgQ29tcGxldGlvbnMuJ1xuICAgICAgZGVzY3JpcHRpb246ICcnJ1R5cGluZyBgc3RkcmAgd2lsbCBtYXRjaCBgc3RkZXJyYC5cbiAgICAgIEZpcnN0IGNoYXJhY3RlciBzaG91bGQgYWx3YXlzIG1hdGNoLiBVc2VzIGFkZGl0aW9uYWwgY2FjaGluZyB0aHVzXG4gICAgICBjb21wbGV0aW9ucyBzaG91bGQgYmUgZmFzdGVyLiBOb3RlIHRoYXQgdGhpcyBzZXR0aW5nIGRvZXMgbm90IGFmZmVjdFxuICAgICAgYnVpbHQtaW4gYXV0b2NvbXBsZXRlLXBsdXMgcHJvdmlkZXIuJycnXG4gICAgb3V0cHV0UHJvdmlkZXJFcnJvcnM6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBvcmRlcjogOFxuICAgICAgdGl0bGU6ICdPdXRwdXQgUHJvdmlkZXIgRXJyb3JzJ1xuICAgICAgZGVzY3JpcHRpb246ICcnJ1NlbGVjdCBpZiB5b3Ugd291bGQgbGlrZSB0byBzZWUgdGhlIHByb3ZpZGVyIGVycm9ycyB3aGVuXG4gICAgICB0aGV5IGhhcHBlbi4gQnkgZGVmYXVsdCB0aGV5IGFyZSBoaWRkZW4uIE5vdGUgdGhhdCBjcml0aWNhbCBlcnJvcnMgYXJlXG4gICAgICBhbHdheXMgc2hvd24uJycnXG4gICAgb3V0cHV0RGVidWc6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBvcmRlcjogOVxuICAgICAgdGl0bGU6ICdPdXRwdXQgRGVidWcgTG9ncydcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydTZWxlY3QgaWYgeW91IHdvdWxkIGxpa2UgdG8gc2VlIGRlYnVnIGluZm9ybWF0aW9uIGluXG4gICAgICBkZXZlbG9wZXIgdG9vbHMgbG9ncy4gTWF5IHNsb3cgZG93biB5b3VyIGVkaXRvci4nJydcbiAgICBzaG93VG9vbHRpcHM6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBvcmRlcjogMTBcbiAgICAgIHRpdGxlOiAnU2hvdyBUb29sdGlwcyB3aXRoIGluZm9ybWF0aW9uIGFib3V0IHRoZSBvYmplY3QgdW5kZXIgdGhlIGN1cnNvcidcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydFWFBFUklNRU5UQUwgRkVBVFVSRSBXSElDSCBJUyBOT1QgRklOSVNIRUQgWUVULlxuICAgICAgRmVlZGJhY2sgYW5kIGlkZWFzIGFyZSB3ZWxjb21lIG9uIGdpdGh1Yi4nJydcbiAgICBzdWdnZXN0aW9uUHJpb3JpdHk6XG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IDNcbiAgICAgIG1pbmltdW06IDBcbiAgICAgIG1heGltdW06IDk5XG4gICAgICBvcmRlcjogMTFcbiAgICAgIHRpdGxlOiAnU3VnZ2VzdGlvbiBQcmlvcml0eSdcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydZb3UgY2FuIHVzZSB0aGlzIHRvIHNldCB0aGUgcHJpb3JpdHkgZm9yIGF1dG9jb21wbGV0ZS1weXRob25cbiAgICAgIHN1Z2dlc3Rpb25zLiBGb3IgZXhhbXBsZSwgeW91IGNhbiB1c2UgbG93ZXIgdmFsdWUgdG8gZ2l2ZSBoaWdoZXIgcHJpb3JpdHlcbiAgICAgIGZvciBzbmlwcGV0cyBjb21wbGV0aW9ucyB3aGljaCBoYXMgcHJpb3JpdHkgb2YgMi4nJydcblxuICBpbnN0YWxsYXRpb246IG51bGxcblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgIHJlcXVpcmUoJy4vcHJvdmlkZXInKS5jb25zdHJ1Y3RvcigpXG5cbiAgICBmaXJzdEluc3RhbGwgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnYXV0b2NvbXBsZXRlLXB5dGhvbi5pbnN0YWxsZWQnKSA9PSBudWxsXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2F1dG9jb21wbGV0ZS1weXRob24uaW5zdGFsbGVkJywgdHJ1ZSlcbiAgICBsb25nUnVubmluZyA9IHJlcXVpcmUoJ3Byb2Nlc3MnKS51cHRpbWUoKSA+IDEwXG4gICAgaWYgZmlyc3RJbnN0YWxsIGFuZCBsb25nUnVubmluZ1xuICAgICAgZXZlbnQgPSBcImluc3RhbGxlZFwiXG4gICAgZWxzZSBpZiBmaXJzdEluc3RhbGxcbiAgICAgIGV2ZW50ID0gXCJ1cGdyYWRlZFwiXG4gICAgZWxzZVxuICAgICAgZXZlbnQgPSBcInJlc3RhcnRlZFwiXG5cbiAgICB7XG4gICAgICBBY2NvdW50TWFuYWdlcixcbiAgICAgIEF0b21IZWxwZXIsXG4gICAgICBEZWNpc2lvbk1ha2VyLFxuICAgICAgSW5zdGFsbGF0aW9uLFxuICAgICAgSW5zdGFsbGVyLFxuICAgICAgTWV0cmljcyxcbiAgICAgIFN0YXRlQ29udHJvbGxlclxuICAgIH0gPSByZXF1aXJlICdraXRlLWluc3RhbGxlcidcbiAgICBBY2NvdW50TWFuYWdlci5pbml0Q2xpZW50ICdhbHBoYS5raXRlLmNvbScsIC0xLCB0cnVlXG4gICAgYXRvbS52aWV3cy5hZGRWaWV3UHJvdmlkZXIgSW5zdGFsbGF0aW9uLCAobSkgPT4gbS5lbGVtZW50XG4gICAgZWRpdG9yQ2ZnID1cbiAgICAgIFVVSUQ6IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdtZXRyaWNzLnVzZXJJZCcpXG4gICAgICBuYW1lOiAnYXRvbSdcbiAgICBwbHVnaW5DZmcgPVxuICAgICAgbmFtZTogJ2F1dG9jb21wbGV0ZS1weXRob24nXG4gICAgZG0gPSBuZXcgRGVjaXNpb25NYWtlciBlZGl0b3JDZmcsIHBsdWdpbkNmZ1xuXG4gICAgY2hlY2tLaXRlSW5zdGFsbGF0aW9uID0gKCkgPT5cbiAgICAgIGlmIG5vdCBhdG9tLmNvbmZpZy5nZXQgJ2F1dG9jb21wbGV0ZS1weXRob24udXNlS2l0ZSdcbiAgICAgICAgcmV0dXJuXG4gICAgICBjYW5JbnN0YWxsID0gU3RhdGVDb250cm9sbGVyLmNhbkluc3RhbGxLaXRlKClcbiAgICAgIHRocm90dGxlID0gZG0uc2hvdWxkT2ZmZXJLaXRlKGV2ZW50KVxuICAgICAgUHJvbWlzZS5hbGwoW3Rocm90dGxlLCBjYW5JbnN0YWxsXSkudGhlbigodmFsdWVzKSA9PlxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ2F1dG9jb21wbGV0ZS1weXRob24udXNlS2l0ZScsIHRydWVcbiAgICAgICAgdmFyaWFudCA9IHZhbHVlc1swXVxuICAgICAgICBNZXRyaWNzLlRyYWNrZXIubmFtZSA9IFwiYXRvbSBhdXRvY29tcGxldGUtcHl0aG9uIGluc3RhbGxcIlxuICAgICAgICBNZXRyaWNzLlRyYWNrZXIucHJvcHMgPSB2YXJpYW50XG4gICAgICAgIE1ldHJpY3MuVHJhY2tlci5wcm9wcy5sYXN0RXZlbnQgPSBldmVudFxuICAgICAgICBAaW5zdGFsbGF0aW9uID0gbmV3IEluc3RhbGxhdGlvbiB2YXJpYW50XG4gICAgICAgIEBpbnN0YWxsYXRpb24uYWNjb3VudENyZWF0ZWQoKCkgPT5cbiAgICAgICAgICBNZXRyaWNzLlRyYWNrZXIudHJhY2tFdmVudCBcImFjY291bnQgY3JlYXRlZFwiXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0ICdhdXRvY29tcGxldGUtcHl0aG9uLnVzZUtpdGUnLCB0cnVlXG4gICAgICAgIClcbiAgICAgICAgQGluc3RhbGxhdGlvbi5mbG93U2tpcHBlZCgoKSA9PlxuICAgICAgICAgIE1ldHJpY3MuVHJhY2tlci50cmFja0V2ZW50IFwiZmxvdyBhYm9ydGVkXCJcbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ2F1dG9jb21wbGV0ZS1weXRob24udXNlS2l0ZScsIGZhbHNlXG4gICAgICAgIClcbiAgICAgICAgaW5zdGFsbGVyID0gbmV3IEluc3RhbGxlcigpXG4gICAgICAgIGluc3RhbGxlci5pbml0IEBpbnN0YWxsYXRpb24uZmxvd1xuICAgICAgICBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG4gICAgICAgIEBpbnN0YWxsYXRpb24uZmxvdy5vblNraXBJbnN0YWxsICgpID0+XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0ICdhdXRvY29tcGxldGUtcHl0aG9uLnVzZUtpdGUnLCBmYWxzZVxuICAgICAgICAgIE1ldHJpY3MuVHJhY2tlci50cmFja0V2ZW50IFwic2tpcHBlZCBraXRlXCJcbiAgICAgICAgICBwYW5lLmRlc3Ryb3lBY3RpdmVJdGVtKClcbiAgICAgICAgcGFuZS5hZGRJdGVtIEBpbnN0YWxsYXRpb24sIGluZGV4OiAwXG4gICAgICAgIHBhbmUuYWN0aXZhdGVJdGVtQXRJbmRleCAwXG4gICAgICAsIChlcnIpID0+XG4gICAgICAgIGlmIGVyci50eXBlID09ICdkZW5pZWQnXG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0ICdhdXRvY29tcGxldGUtcHl0aG9uLnVzZUtpdGUnLCBmYWxzZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgY29uc29sZS5sb2cgXCJhdXRvY29tcGxldGUtcHl0aG9uIHJlYWR5XCJcbiAgICAgICkgaWYgYXRvbS5jb25maWcuZ2V0ICdhdXRvY29tcGxldGUtcHl0aG9uLnVzZUtpdGUnXG5cbiAgICBjaGVja0tpdGVJbnN0YWxsYXRpb24oKVxuXG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ2F1dG9jb21wbGV0ZS1weXRob24udXNlS2l0ZScsICh7IG5ld1ZhbHVlLCBvbGRWYWx1ZSB9KSA9PlxuICAgICAgaWYgbmV3VmFsdWVcbiAgICAgICAgY2hlY2tLaXRlSW5zdGFsbGF0aW9uKClcbiAgICAgICAgQXRvbUhlbHBlci5lbmFibGVQYWNrYWdlKClcbiAgICAgIGVsc2VcbiAgICAgICAgQXRvbUhlbHBlci5kaXNhYmxlUGFja2FnZSgpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICByZXF1aXJlKCcuL3Byb3ZpZGVyJykuZGlzcG9zZSgpXG4gICAgQGluc3RhbGxhdGlvbi5kZXN0cm95KCkgaWYgQGluc3RhbGxhdGlvblxuXG4gIGdldFByb3ZpZGVyOiAtPiByZXF1aXJlKCcuL3Byb3ZpZGVyJylcblxuICBnZXRIeXBlcmNsaWNrUHJvdmlkZXI6IC0+IHJlcXVpcmUoJy4vaHlwZXJjbGljay1wcm92aWRlcicpXG5cbiAgY29uc3VtZVNuaXBwZXRzOiAoc25pcHBldHNNYW5hZ2VyKSAtPlxuICAgIHJlcXVpcmUoJy4vcHJvdmlkZXInKS5zZXRTbmlwcGV0c01hbmFnZXIgc25pcHBldHNNYW5hZ2VyXG4iXX0=
