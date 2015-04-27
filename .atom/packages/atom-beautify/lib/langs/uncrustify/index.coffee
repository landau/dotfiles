###
Requires http://uncrustify.sourceforge.net/
###
"use strict"
cliBeautify = require("../cli-beautify")
cfg = require("./cfg")
path = require("path")
expandHomeDir = require('expand-home-dir')
getCmd = (inputPath, outputPath, options, cb) ->
  uncrustifyPath = options.uncrustifyPath
  # console.log('Uncrustify options:', options);
  # console.log("Uncrustify path: #{uncrustifyPath}")
  # Complete callback
  done = (configPath) ->
    # Expand Home Directory in Config Path
    configPath = expandHomeDir(configPath)
    # console.log(configPath);
    if uncrustifyPath
      # Use path given by user
      cmd = "#{uncrustifyPath} -c \"#{configPath}\" -f \"#{inputPath}\" -o \"#{outputPath}\" -l \"#{lang}\""
    else
      # Use command available in $PATH
      cmd = "uncrustify -c \"#{configPath}\" -f \"#{inputPath}\" -o \"#{outputPath}\" -l \"#{lang}\""
    # console.log(cmd);
    cb cmd
  configPath = options.configPath
  lang = options.languageOverride or "C" # Default is C
  unless configPath
    # No custom config path
    cfg options, (error, cPath) ->
      throw error  if error
      done cPath
  else
    # Has custom config path
    editor = atom.workspace.getActiveEditor()
    if editor?
        basePath = path.dirname(editor.getPath())
        # console.log(basePath);
        configPath = path.resolve(basePath, configPath)
        done configPath
    else
        cb(new Error("No Uncrustify Config Path set! Please configure Uncrustify with Atom Beautify."))
  return
module.exports = cliBeautify(getCmd)
