(function() {
  var Animal, OPERATOR, grade, heredoc, hi, math, race, square, two,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  grade = function(student, period, messages) {
    if (period == null) {
      period = (typeof b !== "undefined" && b !== null ? 7 : 6);
    }
    if (messages == null) {
      messages = {
        "A": "Excellent"
      };
    }
    if (student.excellentWork) {
      return "A+";
    } else if (student.okayStuff) {
      if (student.triedHard) {
        return "B";
      } else {
        return "B-";
      }
    } else {
      return "C";
    }
  };

  square = function(x) {
    return x * x;
  };

  two = function() {
    return 2;
  };

  math = {
    root: Math.sqrt,
    square: square,
    cube: function(x) {
      return x * square(x);
    }
  };

  race = function() {
    var runners, winner;
    winner = arguments[0], runners = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return print(winner, runners);
  };

  Animal = (function(_super) {
    __extends(Animal, _super);

    function Animal(name) {
      this.name = name;
    }

    Animal.prototype.move = function(meters) {
      return alert(this.name + (" moved " + meters + "m."));
    };

    return Animal;

  })(Being);

  hi = function() {
  return [document.title, "Hello JavaScript"].join(": ");
};

  heredoc = "CoffeeScript subst test " + (0x8 + 0xf / 0x2 + ("nested string " + /\n/));


  /*
  CoffeeScript Compiler v1.2.0
  Released under the MIT License
   */

  OPERATOR = /^(?:[-=]>)/;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL3RsYW5kYXUvZG90ZmlsZXMvLmF0b20vcGFja2FnZXMvZ3J1dmJveC9zcGVjL2NvZmZlZXNjcmlwdC5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsNkRBQUE7SUFBQTs7bVNBQUE7O0FBQUEsRUFBQSxLQUFBLEdBQVEsU0FBQyxPQUFELEVBQVUsTUFBVixFQUF3QyxRQUF4QyxHQUFBOztNQUFVLFNBQU8sQ0FBSSxzQ0FBSCxHQUFXLENBQVgsR0FBa0IsQ0FBbkI7S0FDdkI7O01BRDhDLFdBQVM7QUFBQSxRQUFDLEdBQUEsRUFBSyxXQUFOOztLQUN2RDtBQUFBLElBQUEsSUFBRyxPQUFPLENBQUMsYUFBWDthQUNFLEtBREY7S0FBQSxNQUVLLElBQUcsT0FBTyxDQUFDLFNBQVg7QUFDSCxNQUFBLElBQUcsT0FBTyxDQUFDLFNBQVg7ZUFBMEIsSUFBMUI7T0FBQSxNQUFBO2VBQW1DLEtBQW5DO09BREc7S0FBQSxNQUFBO2FBR0gsSUFIRztLQUhDO0VBQUEsQ0FBUixDQUFBOztBQUFBLEVBUUEsTUFBQSxHQUFTLFNBQUMsQ0FBRCxHQUFBO1dBQU8sQ0FBQSxHQUFJLEVBQVg7RUFBQSxDQVJULENBQUE7O0FBQUEsRUFVQSxHQUFBLEdBQU0sU0FBQSxHQUFBO1dBQUcsRUFBSDtFQUFBLENBVk4sQ0FBQTs7QUFBQSxFQVlBLElBQUEsR0FDRTtBQUFBLElBQUEsSUFBQSxFQUFRLElBQUksQ0FBQyxJQUFiO0FBQUEsSUFDQSxNQUFBLEVBQVEsTUFEUjtBQUFBLElBRUEsSUFBQSxFQUFRLFNBQUMsQ0FBRCxHQUFBO2FBQU8sQ0FBQSxHQUFJLE1BQUEsQ0FBTyxDQUFQLEVBQVg7SUFBQSxDQUZSO0dBYkYsQ0FBQTs7QUFBQSxFQWlCQSxJQUFBLEdBQU8sU0FBQSxHQUFBO0FBQ0wsUUFBQSxlQUFBO0FBQUEsSUFETSx1QkFBUSxpRUFDZCxDQUFBO1dBQUEsS0FBQSxDQUFNLE1BQU4sRUFBYyxPQUFkLEVBREs7RUFBQSxDQWpCUCxDQUFBOztBQUFBLEVBb0JNO0FBQ0osNkJBQUEsQ0FBQTs7QUFBYSxJQUFBLGdCQUFFLElBQUYsR0FBQTtBQUFTLE1BQVIsSUFBQyxDQUFBLE9BQUEsSUFBTyxDQUFUO0lBQUEsQ0FBYjs7QUFBQSxxQkFFQSxJQUFBLEdBQU0sU0FBQyxNQUFELEdBQUE7YUFDSixLQUFBLENBQU0sSUFBQyxDQUFBLElBQUQsR0FBUSxDQUFDLFNBQUEsR0FBUyxNQUFULEdBQWdCLElBQWpCLENBQWQsRUFESTtJQUFBLENBRk4sQ0FBQTs7a0JBQUE7O0tBRG1CLE1BcEJyQixDQUFBOztBQUFBLEVBMEJBLEVBQUEsR0FBSzs7Q0ExQkwsQ0FBQTs7QUFBQSxFQThCQSxPQUFBLEdBQ0EsMEJBQUEsR0FBeUIsQ0FBeEIsR0FBQSxHQUFRLEdBQUEsR0FBTSxHQUFkLEdBQXFCLENBQUMsZ0JBQUEsR0FBdEIsSUFBcUIsQ0FBRyxDQS9CekIsQ0FBQTs7QUFrQ0E7QUFBQTs7O0tBbENBOztBQUFBLEVBdUNBLFFBQUEsR0FBVyxZQXZDWCxDQUFBO0FBQUEiCn0=

//# sourceURL=/Users/tlandau/dotfiles/.atom/packages/gruvbox/spec/coffeescript.coffee
