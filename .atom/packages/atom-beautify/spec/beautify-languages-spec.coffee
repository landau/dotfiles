Beautify = require '../lib/beautify'
beautifier = require "../lib/language-options"
languages = beautifier.languages
defaultLanguageOptions = beautifier.defaultLanguageOptions
fs = require "fs"
path = require "path"
options = require "../lib/options"

# Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
#
# To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
# or `fdescribe`). Remove the `f` to unfocus the block.

describe "BeautifyLanguages", ->

  optionsDir = path.resolve(__dirname, "../examples")

  # Activate all of the languages
  allLanguages = [
    "c", "coffee-script", "css", "html",
    "java", "javascript", "json", "less",
    "mustache", "objective-c", "perl", "php",
    "python", "ruby", "sass", "sql",
    "typescript", "xml", "csharp", "gfm", "marko", "tss"
    ]

  beforeEach ->
    # Install all of the languages
    for lang in allLanguages
      do (lang) ->
        waitsForPromise ->
          atom.packages.activatePackage("language-#{lang}")

    # Activate package
    waitsForPromise ->
        activationPromise = atom.packages.activatePackage('atom-beautify')
        # Force activate package
        pack = atom.packages.getLoadedPackage("atom-beautify")
        pack.activateNow()
        # Return promise
        return activationPromise

    # Set Uncrustify config path
    # uncrustifyConfigPath = path.resolve(__dirname, "../examples/nested-jsbeautifyrc/uncrustify.cfg")
    # uncrustifyLangs = ["c", "cpp", "objectivec", "cs", "d", "java", "pawn", "vala"]
    # for lang in uncrustifyLangs
    #     do (lang) ->
            # atom.config.set("atom-beautify.#{lang}_configPath", uncrustifyConfigPath)
            # expect(atom.config.get("atom-beautify.#{lang}_configPath")).toEqual("TEST")

  ###
  Directory structure:
   - examples
     - config1
       - lang1
         - original
           - 1 - test.ext
         - expected
           - 1 - test.ext
       - lang2
     - config2
  ###

  # All Configurations
  configs = fs.readdirSync(optionsDir)
  for config in configs
    do (config) ->
      # Generate the path to where all of the languages are
      langsDir = path.resolve(optionsDir, config)
      optionStats = fs.lstatSync(langsDir)
      # Confirm that this path is a directory
      if optionStats.isDirectory()
        # Create testing group for configuration
        describe "when using configuration '#{config}'", ->
          # All Languages for configuration
          langNames = fs.readdirSync(langsDir)
          for lang in langNames
            do (lang) ->
              # Generate the path to where al of the tests are
              testsDir = path.resolve(langsDir, lang)
              langStats = fs.lstatSync(testsDir)
              # Confirm that this path is a directory
              if langStats.isDirectory()
                # Original
                originalDir = path.resolve(testsDir, "original")
                if not fs.existsSync(originalDir)
                  console.warn("Directory for test originals/inputs not found." +
                               " Making it at #{originalDir}.")
                  fs.mkdirSync(originalDir)
                # Expected
                expectedDir = path.resolve(testsDir, "expected")
                if not fs.existsSync(expectedDir)
                  console.warn("Directory for test expected/results not found." +
                               "Making it at #{expectedDir}.")
                  fs.mkdirSync(expectedDir)

                # Language group tests
                describe "when beautifying language '#{lang}'", ->

                  # All tests for language
                  testNames = fs.readdirSync(originalDir)
                  for testFileName in testNames
                    do (testFileName) ->
                      ext = path.extname(testFileName)
                      testName = path.basename(testFileName, ext)
                      # If prefixed with underscore (_) then this is a hidden test
                      if testFileName[0] is '_'
                        # Do not show this test
                        return
                      # Confirm this is a test
                      it "#{testName} #{testFileName}", ->

                        # Generate paths to test files
                        originalTestPath = path.resolve(originalDir, testFileName)
                        expectedTestPath = path.resolve(expectedDir, testFileName)
                        # Get contents of original test file
                        originalContents = fs.readFileSync(originalTestPath)?.toString()
                        # Check if there is a matching expected test resut
                        if not fs.existsSync(expectedTestPath)
                          throw new Error("No matching expected test result found for '#{testName}' " +
                                       "at '#{expectedTestPath}'.")
                          # err = fs.writeFileSync(expectedTestPath, originalContents)
                          # throw err if err
                        # Get contents of expected test file
                        expectedContents = fs.readFileSync(expectedTestPath)?.toString()
                        # expect(expectedContents).not.toEqual originalContents
                        # expect(atom.grammars.getGrammars()).toEqual []
                        grammar = atom.grammars.selectGrammar(originalTestPath, originalContents)
                        # expect(grammar).toEqual("test")
                        grammarName = grammar.name

                        # Get the options
                        allOptions = options.getOptionsForPath(originalTestPath)

                        beautifyCompleted = false
                        completionFun = (text) ->
                          if text instanceof Error
                            return beautifyCompleted = text # text == Error
                          expect(typeof text).toEqual "string"
                          if text isnt expectedContents
                            console.warn(allOptions, text, expectedContents)
                          expect(text).toEqual expectedContents
                          beautifyCompleted = true

                        runs ->
                          try
                            beautifier.beautify originalContents, grammarName, allOptions, completionFun
                          catch e
                            beautifyCompleted = e

                        waitsFor(->
                          if beautifyCompleted instanceof Error
                            throw beautifyCompleted
                          else
                            return beautifyCompleted
                        , "Waiting for beautification to complete", 5000)
