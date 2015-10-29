{Emitter} = require 'atom'

module.exports =
  emitter: new Emitter
  plugins: {}

  addPlugin: (Plugin) ->
    return unless Plugin && Plugin.pluginName
    @plugins[Plugin.pluginName] = Plugin
    @emitter.emit 'plugin.added', Plugin

  removePlugin: (Plugin) ->
    return unless Plugin && Plugin.pluginName
    delete @plugins[Plugin.pluginName]
    @emitter.emit 'plugin.removed', Plugin

  getAll: ->
    (val for key, val of @plugins)
