(function() {
  module.exports = {
    name: "Fortran",
    namespace: "fortran",

    /*
    Supported Grammars
     */
    grammars: ["Fortran - Modern"],

    /*
    Supported extensions
     */
    extensions: ["f90", "F90"],

    /*
     */
    options: {
      emacs_path: {
        type: 'string',
        "default": "",
        description: "Path to the `emacs` executable"
      },
      emacs_script_path: {
        type: 'string',
        "default": "",
        description: "Path to the emacs script"
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvYXRvbS1iZWF1dGlmeS9zcmMvbGFuZ3VhZ2VzL2ZvcnRyYW4uY29mZmVlIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBQUEsSUFFZixJQUFBLEVBQU0sU0FGUztBQUFBLElBR2YsU0FBQSxFQUFXLFNBSEk7QUFLZjtBQUFBOztPQUxlO0FBQUEsSUFRZixRQUFBLEVBQVUsQ0FDUixrQkFEUSxDQVJLO0FBWWY7QUFBQTs7T0FaZTtBQUFBLElBZWYsVUFBQSxFQUFZLENBQ1YsS0FEVSxFQUVWLEtBRlUsQ0FmRztBQW9CZjtBQUFBO09BcEJlO0FBQUEsSUF1QmYsT0FBQSxFQUVFO0FBQUEsTUFBQSxVQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsRUFEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLGdDQUZiO09BREY7QUFBQSxNQUlBLGlCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxRQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsRUFEVDtBQUFBLFFBRUEsV0FBQSxFQUFhLDBCQUZiO09BTEY7S0F6QmE7R0FBakIsQ0FBQTtBQUFBIgp9

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/atom-beautify/src/languages/fortran.coffee
