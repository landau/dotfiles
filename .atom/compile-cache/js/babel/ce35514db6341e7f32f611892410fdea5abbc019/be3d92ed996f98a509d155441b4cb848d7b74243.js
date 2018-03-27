"use babel";
Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PythonIndent = (function () {
    function PythonIndent() {
        _classCallCheck(this, PythonIndent);
    }

    _createClass(PythonIndent, [{
        key: "properlyIndent",
        value: function properlyIndent() {
            this.editor = atom.workspace.getActiveTextEditor();

            // Make sure this is a Python file
            if (this.editor.getGrammar().scopeName.substring(0, 13) !== "source.python") {
                return;
            }

            // Get base variables
            var row = this.editor.getCursorBufferPosition().row;
            var col = this.editor.getCursorBufferPosition().column;

            // Parse the entire file up to the current point, keeping track of brackets
            var lines = this.editor.getTextInBufferRange([[0, 0], [row, col]]).split("\n");
            // At this point, the newline character has just been added,
            // so remove the last element of lines, which will be the empty line
            lines = lines.splice(0, lines.length - 1);

            var parseOutput = this.parseLines(lines);
            // openBracketStack: A stack of [row, col] pairs describing where open brackets are
            // lastClosedRow: Either empty, or an array [rowOpen, rowClose] describing the rows
            //  here the last bracket to be closed was opened and closed.
            // shouldHang: A stack containing the row number where each bracket was closed.
            // lastColonRow: The last row a def/for/if/elif/else/try/except etc. block started
            var openBracketStack = parseOutput.openBracketStack;
            var lastClosedRow = parseOutput.lastClosedRow;
            var shouldHang = parseOutput.shouldHang;
            var lastColonRow = parseOutput.lastColonRow;

            if (shouldHang) {
                this.indentHanging(row, this.editor.buffer.lineForRow(row - 1));
                return;
            }

            if (!(openBracketStack.length || lastClosedRow.length && openBracketStack)) {
                return;
            }

            if (!openBracketStack.length) {
                // Can assume lastClosedRow is not empty
                if (lastClosedRow[1] === row - 1) {
                    // We just closed a bracket on the row, get indentation from the
                    // row where it was opened
                    var indentLevel = this.editor.indentationForBufferRow(lastClosedRow[0]);

                    if (lastColonRow === row - 1) {
                        // We just finished def/for/if/elif/else/try/except etc. block,
                        // need to increase indent level by 1.
                        indentLevel += 1;
                    }
                    this.editor.setIndentationForBufferRow(row, indentLevel);
                }
                return;
            }

            // Get tab length for context
            var tabLength = this.editor.getTabLength();

            var lastOpenBracketLocations = openBracketStack.pop();

            // Get some booleans to help work through the cases

            // haveClosedBracket is true if we have ever closed a bracket
            var haveClosedBracket = lastClosedRow.length;
            // justOpenedBracket is true if we opened a bracket on the row we just finished
            var justOpenedBracket = lastOpenBracketLocations[0] === row - 1;
            // justClosedBracket is true if we closed a bracket on the row we just finished
            var justClosedBracket = haveClosedBracket && lastClosedRow[1] === row - 1;
            // closedBracketOpenedAfterLineWithCurrentOpen is an ***extremely*** long name, and
            // it is true if the most recently closed bracket pair was opened on
            // a line AFTER the line where the current open bracket
            var closedBracketOpenedAfterLineWithCurrentOpen = haveClosedBracket && lastClosedRow[0] > lastOpenBracketLocations[0];
            var indentColumn = undefined;

            if (!justOpenedBracket && !justClosedBracket) {
                // The bracket was opened before the previous line,
                // and we did not close a bracket on the previous line.
                // Thus, nothing has happened that could have changed the
                // indentation level since the previous line, so
                // we should use whatever indent we are given.
                return;
            } else if (justClosedBracket && closedBracketOpenedAfterLineWithCurrentOpen) {
                // A bracket that was opened after the most recent open
                // bracket was closed on the line we just finished typing.
                // We should use whatever indent was used on the row
                // where we opened the bracket we just closed. This needs
                // to be handled as a separate case from the last case below
                // in case the current bracket is using a hanging indent.
                // This handles cases such as
                // x = [0, 1, 2,
                //      [3, 4, 5,
                //       6, 7, 8],
                //      9, 10, 11]
                // which would be correctly handled by the case below, but it also correctly handles
                // x = [
                //     0, 1, 2, [3, 4, 5,
                //               6, 7, 8],
                //     9, 10, 11
                // ]
                // which the last case below would incorrectly indent an extra space
                // before the "9", because it would try to match it up with the
                // open bracket instead of using the hanging indent.
                var previousIndent = this.editor.indentationForBufferRow(lastClosedRow[0]);
                indentColumn = previousIndent * tabLength;
            } else {
                // lastOpenBracketLocations[1] is the column where the bracket was,
                // so need to bump up the indentation by one
                indentColumn = lastOpenBracketLocations[1] + 1;
            }

            // Calculate soft-tabs from spaces (can have remainder)
            var tabs = indentColumn / tabLength;
            var rem = (tabs - Math.floor(tabs)) * tabLength;

            // If there's a remainder, `@editor.buildIndentString` requires the tab to
            // be set past the desired indentation level, thus the ceiling.
            tabs = rem > 0 ? Math.ceil(tabs) : tabs;

            // Offset is the number of spaces to subtract from the soft-tabs if they
            // are past the desired indentation (not divisible by tab length).
            var offset = rem > 0 ? tabLength - rem : 0;

            // I'm glad Atom has an optional `column` param to subtract spaces from
            // soft-tabs, though I don't see it used anywhere in the core.
            // It looks like for hard tabs, the "tabs" input can be fractional and
            // the "column" input is ignored...?
            var indent = this.editor.buildIndentString(tabs, offset);

            // The range of text to replace with our indent
            // will need to change this for hard tabs, especially tricky for when
            // hard tabs have mixture of tabs + spaces, which they can judging from
            // the editor.buildIndentString function
            var startRange = [row, 0];
            var stopRange = [row, this.editor.indentationForBufferRow(row) * tabLength];
            this.editor.getBuffer().setTextInRange([startRange, stopRange], indent);
        }
    }, {
        key: "parseLines",
        value: function parseLines(lines) {
            // openBracketStack is an array of [row, col] indicating the location
            // of the opening bracket (square, curly, or parentheses)
            var openBracketStack = [];
            // lastClosedRow is either empty or [rowOpen, rowClose] describing the
            // rows where the latest closed bracket was opened and closed.
            var lastClosedRow = [];
            // If we are in a string, this tells us what character introduced the string
            // i.e., did this string start with ' or with "?
            var stringDelimiter = [];
            // This is the row of the last function definition
            var lastColonRow = NaN;

            // true if we are in a triple quoted string
            var inTripleQuotedString = false;

            // If we have seen two of the same string delimiters in a row,
            // then we have to check the next character to see if it matches
            // in order to correctly parse triple quoted strings.
            var checkNextCharForString = false;

            // keep track of the number of consecutive string delimiter's we've seen
            // used to tell if we are in a triple quoted string
            var numConsecutiveStringDelimiters = 0;

            // true if we should have a hanging indent, false otherwise
            var shouldHang = false;

            // NOTE: this parsing will only be correct if the python code is well-formed
            // statements like "[0, (1, 2])" might break the parsing

            // loop over each line
            for (var row of Array(lines.length).fill().map(function (_, i) {
                return i;
            })) {
                var line = lines[row];

                // boolean, whether or not the current character is being escaped
                // applicable when we are currently in a string
                var isEscaped = false;

                // This is the last defined def/for/if/elif/else/try/except row
                var lastlastColonRow = lastColonRow;

                for (var col of Array(line.length).fill().map(function (_, i) {
                    return i;
                })) {
                    var c = line[col];

                    if (c === stringDelimiter && !isEscaped) {
                        numConsecutiveStringDelimiters += 1;
                    } else if (checkNextCharForString) {
                        numConsecutiveStringDelimiters = 0;
                        stringDelimiter = [];
                    } else {
                        numConsecutiveStringDelimiters = 0;
                    }

                    checkNextCharForString = false;

                    // If stringDelimiter is set, then we are in a string
                    // Note that this works correctly even for triple quoted strings
                    if (stringDelimiter.length) {
                        if (isEscaped) {
                            // If current character is escaped, then we do not care what it was,
                            // but since it is impossible for the next character to be escaped as well,
                            // go ahead and set that to false
                            isEscaped = false;
                        } else {
                            if (c === stringDelimiter) {
                                // We are seeing the same quote that started the string, i.e. ' or "
                                if (inTripleQuotedString) {
                                    if (numConsecutiveStringDelimiters === 3) {
                                        // Breaking out of the triple quoted string...
                                        numConsecutiveStringDelimiters = 0;
                                        stringDelimiter = [];
                                        inTripleQuotedString = false;
                                    }
                                } else if (numConsecutiveStringDelimiters === 3) {
                                    // reset the count, correctly handles cases like ''''''
                                    numConsecutiveStringDelimiters = 0;
                                    inTripleQuotedString = true;
                                } else if (numConsecutiveStringDelimiters === 2) {
                                    // We are not currently in a triple quoted string, and we've
                                    // seen two of the same string delimiter in a row. This could
                                    // either be an empty string, i.e. '' or "", or it could be
                                    // the start of a triple quoted string. We will check the next
                                    // character, and if it matches then we know we're in a triple
                                    // quoted string, and if it does not match we know we're not
                                    // in a string any more (i.e. it was the empty string).
                                    checkNextCharForString = true;
                                } else if (numConsecutiveStringDelimiters === 1) {
                                    // We are not in a string that is not triple quoted, and we've
                                    // just seen an un-escaped instance of that string delimiter.
                                    // In other words, we've left the string.
                                    // It is also worth noting that it is impossible for
                                    // numConsecutiveStringDelimiters to be 0 at this point, so
                                    // this set of if/else if statements covers all cases.
                                    stringDelimiter = [];
                                }
                            } else if (c === "\\") {
                                // We are seeing an unescaped backslash, the next character is escaped.
                                // Note that this is not exactly true in raw strings, HOWEVER, in raw
                                // strings you can still escape the quote mark by using a backslash.
                                // Since that's all we really care about as far as escaped characters
                                // go, we can assume we are now escaping the next character.
                                isEscaped = true;
                            }
                        }
                    } else {
                        if ("[({".includes(c)) {
                            openBracketStack.push([row, col]);
                            // If the only characters after this opening bracket are whitespace,
                            // then we should do a hanging indent. If there are other non-whitespace
                            // characters after this, then they will set the shouldHang boolean to false
                            shouldHang = true;
                        } else if (" \t\r\n".includes(c)) {
                            // just in case there's a new line
                            // If it's whitespace, we don't care at all
                            // this check is necessary so we don't set shouldHang to false even if
                            // someone e.g. just entered a space between the opening bracket and the
                            // newline.
                            continue;
                        } else if (c === "#") {
                            // This check goes as well to make sure we don't set shouldHang
                            // to false in similar circumstances as described in the whitespace section.
                            break;
                        } else {
                            // We've already skipped if the character was white-space, an opening
                            // bracket, or a new line, so that means the current character is not
                            // whitespace and not an opening bracket, so shouldHang needs to get set to
                            // false.
                            shouldHang = false;

                            // Similar to above, we've already skipped all irrelevant characters,
                            // so if we saw a colon earlier in this line, then we would have
                            // incorrectly thought it was the end of a def/for/if/elif/else/try/except
                            // block when it was actually a dictionary being defined, reset the
                            // lastColonRow variable to whatever it was when we started parsing this
                            // line.
                            lastColonRow = lastlastColonRow;

                            if (c === ":") {
                                lastColonRow = row;
                            } else if ("})]".includes(c) && openBracketStack.length) {
                                // The .pop() will take the element off of the openBracketStack as it
                                // adds it to the array for lastClosedRow.
                                lastClosedRow = [openBracketStack.pop()[0], row];
                            } else if ("'\"".includes(c)) {
                                // Starting a string, keep track of what quote was used to start it.
                                stringDelimiter = c;
                                numConsecutiveStringDelimiters += 1;
                            }
                        }
                    }
                }
            }
            return { openBracketStack: openBracketStack, lastClosedRow: lastClosedRow, shouldHang: shouldHang, lastColonRow: lastColonRow };
        }
    }, {
        key: "indentHanging",
        value: function indentHanging(row) {
            // Indent at the current block level plus the setting amount (1 or 2)
            var indent = this.editor.indentationForBufferRow(row) + atom.config.get("python-indent.hangingIndentTabs");

            // Set the indent
            this.editor.setIndentationForBufferRow(row, indent);
        }
    }]);

    return PythonIndent;
})();

exports["default"] = PythonIndent;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3B5dGhvbi1pbmRlbnQvbGliL3B5dGhvbi1pbmRlbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7Ozs7SUFDUyxZQUFZO2FBQVosWUFBWTs4QkFBWixZQUFZOzs7aUJBQVosWUFBWTs7ZUFFZiwwQkFBRztBQUNiLGdCQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQzs7O0FBR25ELGdCQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssZUFBZSxFQUFFO0FBQ3pFLHVCQUFPO2FBQ1Y7OztBQUdELGdCQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLHVCQUF1QixFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ3RELGdCQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLHVCQUF1QixFQUFFLENBQUMsTUFBTSxDQUFDOzs7QUFHekQsZ0JBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDOzs7QUFHL0UsaUJBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDOztBQUUxQyxnQkFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7Ozs7O2dCQU1uQyxnQkFBZ0IsR0FBOEMsV0FBVyxDQUF6RSxnQkFBZ0I7Z0JBQUUsYUFBYSxHQUErQixXQUFXLENBQXZELGFBQWE7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Qyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsR0FDbkQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsaUNBQWlDLENBQUMsQUFBQyxDQUFDOzs7QUFHekQsZ0JBQUksQ0FBQyxNQUFNLENBQUMsMEJBQTBCLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQ3ZEOzs7V0EzU2dCLFlBQVk7OztxQkFBWixZQUFZIiwiZmlsZSI6Ii9Vc2Vycy90bGFuZGF1L2RvdGZpbGVzLy5hdG9tL3BhY2thZ2VzL3B5dGhvbi1pbmRlbnQvbGliL3B5dGhvbi1pbmRlbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBiYWJlbFwiO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHl0aG9uSW5kZW50IHtcblxuICAgIHByb3Blcmx5SW5kZW50KCkge1xuICAgICAgICB0aGlzLmVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcblxuICAgICAgICAvLyBNYWtlIHN1cmUgdGhpcyBpcyBhIFB5dGhvbiBmaWxlXG4gICAgICAgIGlmICh0aGlzLmVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lLnN1YnN0cmluZygwLCAxMykgIT09IFwic291cmNlLnB5dGhvblwiKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHZXQgYmFzZSB2YXJpYWJsZXNcbiAgICAgICAgY29uc3Qgcm93ID0gdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKS5yb3c7XG4gICAgICAgIGNvbnN0IGNvbCA9IHRoaXMuZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkuY29sdW1uO1xuXG4gICAgICAgIC8vIFBhcnNlIHRoZSBlbnRpcmUgZmlsZSB1cCB0byB0aGUgY3VycmVudCBwb2ludCwga2VlcGluZyB0cmFjayBvZiBicmFja2V0c1xuICAgICAgICBsZXQgbGluZXMgPSB0aGlzLmVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShbWzAsIDBdLCBbcm93LCBjb2xdXSkuc3BsaXQoXCJcXG5cIik7XG4gICAgICAgIC8vIEF0IHRoaXMgcG9pbnQsIHRoZSBuZXdsaW5lIGNoYXJhY3RlciBoYXMganVzdCBiZWVuIGFkZGVkLFxuICAgICAgICAvLyBzbyByZW1vdmUgdGhlIGxhc3QgZWxlbWVudCBvZiBsaW5lcywgd2hpY2ggd2lsbCBiZSB0aGUgZW1wdHkgbGluZVxuICAgICAgICBsaW5lcyA9IGxpbmVzLnNwbGljZSgwLCBsaW5lcy5sZW5ndGggLSAxKTtcblxuICAgICAgICBjb25zdCBwYXJzZU91dHB1dCA9IHRoaXMucGFyc2VMaW5lcyhsaW5lcyk7XG4gICAgICAgIC8vIG9wZW5CcmFja2V0U3RhY2s6IEEgc3RhY2sgb2YgW3JvdywgY29sXSBwYWlycyBkZXNjcmliaW5nIHdoZXJlIG9wZW4gYnJhY2tldHMgYXJlXG4gICAgICAgIC8vIGxhc3RDbG9zZWRSb3c6IEVpdGhlciBlbXB0eSwgb3IgYW4gYXJyYXkgW3Jvd09wZW4sIHJvd0Nsb3NlXSBkZXNjcmliaW5nIHRoZSByb3dzXG4gICAgICAgIC8vICBoZXJlIHRoZSBsYXN0IGJyYWNrZXQgdG8gYmUgY2xvc2VkIHdhcyBvcGVuZWQgYW5kIGNsb3NlZC5cbiAgICAgICAgLy8gc2hvdWxkSGFuZzogQSBzdGFjayBjb250YWluaW5nIHRoZSByb3cgbnVtYmVyIHdoZXJlIGVhY2ggYnJhY2tldCB3YXMgY2xvc2VkLlxuICAgICAgICAvLyBsYXN0Q29sb25Sb3c6IFRoZSBsYXN0IHJvdyBhIGRlZi9mb3IvaWYvZWxpZi9lbHNlL3RyeS9leGNlcHQgZXRjLiBibG9jayBzdGFydGVkXG4gICAgICAgIGNvbnN0IHsgb3BlbkJyYWNrZXRTdGFjaywgbGFzdENsb3NlZFJvdywgc2hvdWxkSGFuZywgbGFzdENvbG9uUm93IH0gPSBwYXJzZU91dHB1dDtcblxuICAgICAgICBpZiAoc2hvdWxkSGFuZykge1xuICAgICAgICAgICAgdGhpcy5pbmRlbnRIYW5naW5nKHJvdywgdGhpcy5lZGl0b3IuYnVmZmVyLmxpbmVGb3JSb3cocm93IC0gMSkpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCEob3BlbkJyYWNrZXRTdGFjay5sZW5ndGggfHwgKGxhc3RDbG9zZWRSb3cubGVuZ3RoICYmIG9wZW5CcmFja2V0U3RhY2spKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFvcGVuQnJhY2tldFN0YWNrLmxlbmd0aCkge1xuICAgICAgICAgICAgLy8gQ2FuIGFzc3VtZSBsYXN0Q2xvc2VkUm93IGlzIG5vdCBlbXB0eVxuICAgICAgICAgICAgaWYgKGxhc3RDbG9zZWRSb3dbMV0gPT09IHJvdyAtIDEpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSBqdXN0IGNsb3NlZCBhIGJyYWNrZXQgb24gdGhlIHJvdywgZ2V0IGluZGVudGF0aW9uIGZyb20gdGhlXG4gICAgICAgICAgICAgICAgLy8gcm93IHdoZXJlIGl0IHdhcyBvcGVuZWRcbiAgICAgICAgICAgICAgICBsZXQgaW5kZW50TGV2ZWwgPSB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhsYXN0Q2xvc2VkUm93WzBdKTtcblxuICAgICAgICAgICAgICAgIGlmIChsYXN0Q29sb25Sb3cgPT09IHJvdyAtIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gV2UganVzdCBmaW5pc2hlZCBkZWYvZm9yL2lmL2VsaWYvZWxzZS90cnkvZXhjZXB0IGV0Yy4gYmxvY2ssXG4gICAgICAgICAgICAgICAgICAgIC8vIG5lZWQgdG8gaW5jcmVhc2UgaW5kZW50IGxldmVsIGJ5IDEuXG4gICAgICAgICAgICAgICAgICAgIGluZGVudExldmVsICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuZWRpdG9yLnNldEluZGVudGF0aW9uRm9yQnVmZmVyUm93KHJvdywgaW5kZW50TGV2ZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2V0IHRhYiBsZW5ndGggZm9yIGNvbnRleHRcbiAgICAgICAgY29uc3QgdGFiTGVuZ3RoID0gdGhpcy5lZGl0b3IuZ2V0VGFiTGVuZ3RoKCk7XG5cbiAgICAgICAgY29uc3QgbGFzdE9wZW5CcmFja2V0TG9jYXRpb25zID0gb3BlbkJyYWNrZXRTdGFjay5wb3AoKTtcblxuICAgICAgICAvLyBHZXQgc29tZSBib29sZWFucyB0byBoZWxwIHdvcmsgdGhyb3VnaCB0aGUgY2FzZXNcblxuICAgICAgICAvLyBoYXZlQ2xvc2VkQnJhY2tldCBpcyB0cnVlIGlmIHdlIGhhdmUgZXZlciBjbG9zZWQgYSBicmFja2V0XG4gICAgICAgIGNvbnN0IGhhdmVDbG9zZWRCcmFja2V0ID0gbGFzdENsb3NlZFJvdy5sZW5ndGg7XG4gICAgICAgIC8vIGp1c3RPcGVuZWRCcmFja2V0IGlzIHRydWUgaWYgd2Ugb3BlbmVkIGEgYnJhY2tldCBvbiB0aGUgcm93IHdlIGp1c3QgZmluaXNoZWRcbiAgICAgICAgY29uc3QganVzdE9wZW5lZEJyYWNrZXQgPSBsYXN0T3BlbkJyYWNrZXRMb2NhdGlvbnNbMF0gPT09IHJvdyAtIDE7XG4gICAgICAgIC8vIGp1c3RDbG9zZWRCcmFja2V0IGlzIHRydWUgaWYgd2UgY2xvc2VkIGEgYnJhY2tldCBvbiB0aGUgcm93IHdlIGp1c3QgZmluaXNoZWRcbiAgICAgICAgY29uc3QganVzdENsb3NlZEJyYWNrZXQgPSBoYXZlQ2xvc2VkQnJhY2tldCAmJiBsYXN0Q2xvc2VkUm93WzFdID09PSByb3cgLSAxO1xuICAgICAgICAvLyBjbG9zZWRCcmFja2V0T3BlbmVkQWZ0ZXJMaW5lV2l0aEN1cnJlbnRPcGVuIGlzIGFuICoqKmV4dHJlbWVseSoqKiBsb25nIG5hbWUsIGFuZFxuICAgICAgICAvLyBpdCBpcyB0cnVlIGlmIHRoZSBtb3N0IHJlY2VudGx5IGNsb3NlZCBicmFja2V0IHBhaXIgd2FzIG9wZW5lZCBvblxuICAgICAgICAvLyBhIGxpbmUgQUZURVIgdGhlIGxpbmUgd2hlcmUgdGhlIGN1cnJlbnQgb3BlbiBicmFja2V0XG4gICAgICAgIGNvbnN0IGNsb3NlZEJyYWNrZXRPcGVuZWRBZnRlckxpbmVXaXRoQ3VycmVudE9wZW4gPSBoYXZlQ2xvc2VkQnJhY2tldCAmJlxuICAgICAgICAgICAgbGFzdENsb3NlZFJvd1swXSA+IGxhc3RPcGVuQnJhY2tldExvY2F0aW9uc1swXTtcbiAgICAgICAgbGV0IGluZGVudENvbHVtbjtcblxuICAgICAgICBpZiAoIWp1c3RPcGVuZWRCcmFja2V0ICYmICFqdXN0Q2xvc2VkQnJhY2tldCkge1xuICAgICAgICAgICAgLy8gVGhlIGJyYWNrZXQgd2FzIG9wZW5lZCBiZWZvcmUgdGhlIHByZXZpb3VzIGxpbmUsXG4gICAgICAgICAgICAvLyBhbmQgd2UgZGlkIG5vdCBjbG9zZSBhIGJyYWNrZXQgb24gdGhlIHByZXZpb3VzIGxpbmUuXG4gICAgICAgICAgICAvLyBUaHVzLCBub3RoaW5nIGhhcyBoYXBwZW5lZCB0aGF0IGNvdWxkIGhhdmUgY2hhbmdlZCB0aGVcbiAgICAgICAgICAgIC8vIGluZGVudGF0aW9uIGxldmVsIHNpbmNlIHRoZSBwcmV2aW91cyBsaW5lLCBzb1xuICAgICAgICAgICAgLy8gd2Ugc2hvdWxkIHVzZSB3aGF0ZXZlciBpbmRlbnQgd2UgYXJlIGdpdmVuLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKGp1c3RDbG9zZWRCcmFja2V0ICYmIGNsb3NlZEJyYWNrZXRPcGVuZWRBZnRlckxpbmVXaXRoQ3VycmVudE9wZW4pIHtcbiAgICAgICAgICAgIC8vIEEgYnJhY2tldCB0aGF0IHdhcyBvcGVuZWQgYWZ0ZXIgdGhlIG1vc3QgcmVjZW50IG9wZW5cbiAgICAgICAgICAgIC8vIGJyYWNrZXQgd2FzIGNsb3NlZCBvbiB0aGUgbGluZSB3ZSBqdXN0IGZpbmlzaGVkIHR5cGluZy5cbiAgICAgICAgICAgIC8vIFdlIHNob3VsZCB1c2Ugd2hhdGV2ZXIgaW5kZW50IHdhcyB1c2VkIG9uIHRoZSByb3dcbiAgICAgICAgICAgIC8vIHdoZXJlIHdlIG9wZW5lZCB0aGUgYnJhY2tldCB3ZSBqdXN0IGNsb3NlZC4gVGhpcyBuZWVkc1xuICAgICAgICAgICAgLy8gdG8gYmUgaGFuZGxlZCBhcyBhIHNlcGFyYXRlIGNhc2UgZnJvbSB0aGUgbGFzdCBjYXNlIGJlbG93XG4gICAgICAgICAgICAvLyBpbiBjYXNlIHRoZSBjdXJyZW50IGJyYWNrZXQgaXMgdXNpbmcgYSBoYW5naW5nIGluZGVudC5cbiAgICAgICAgICAgIC8vIFRoaXMgaGFuZGxlcyBjYXNlcyBzdWNoIGFzXG4gICAgICAgICAgICAvLyB4ID0gWzAsIDEsIDIsXG4gICAgICAgICAgICAvLyAgICAgIFszLCA0LCA1LFxuICAgICAgICAgICAgLy8gICAgICAgNiwgNywgOF0sXG4gICAgICAgICAgICAvLyAgICAgIDksIDEwLCAxMV1cbiAgICAgICAgICAgIC8vIHdoaWNoIHdvdWxkIGJlIGNvcnJlY3RseSBoYW5kbGVkIGJ5IHRoZSBjYXNlIGJlbG93LCBidXQgaXQgYWxzbyBjb3JyZWN0bHkgaGFuZGxlc1xuICAgICAgICAgICAgLy8geCA9IFtcbiAgICAgICAgICAgIC8vICAgICAwLCAxLCAyLCBbMywgNCwgNSxcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgNiwgNywgOF0sXG4gICAgICAgICAgICAvLyAgICAgOSwgMTAsIDExXG4gICAgICAgICAgICAvLyBdXG4gICAgICAgICAgICAvLyB3aGljaCB0aGUgbGFzdCBjYXNlIGJlbG93IHdvdWxkIGluY29ycmVjdGx5IGluZGVudCBhbiBleHRyYSBzcGFjZVxuICAgICAgICAgICAgLy8gYmVmb3JlIHRoZSBcIjlcIiwgYmVjYXVzZSBpdCB3b3VsZCB0cnkgdG8gbWF0Y2ggaXQgdXAgd2l0aCB0aGVcbiAgICAgICAgICAgIC8vIG9wZW4gYnJhY2tldCBpbnN0ZWFkIG9mIHVzaW5nIHRoZSBoYW5naW5nIGluZGVudC5cbiAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzSW5kZW50ID0gdGhpcy5lZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3cobGFzdENsb3NlZFJvd1swXSk7XG4gICAgICAgICAgICBpbmRlbnRDb2x1bW4gPSBwcmV2aW91c0luZGVudCAqIHRhYkxlbmd0aDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGxhc3RPcGVuQnJhY2tldExvY2F0aW9uc1sxXSBpcyB0aGUgY29sdW1uIHdoZXJlIHRoZSBicmFja2V0IHdhcyxcbiAgICAgICAgICAgIC8vIHNvIG5lZWQgdG8gYnVtcCB1cCB0aGUgaW5kZW50YXRpb24gYnkgb25lXG4gICAgICAgICAgICBpbmRlbnRDb2x1bW4gPSBsYXN0T3BlbkJyYWNrZXRMb2NhdGlvbnNbMV0gKyAxO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FsY3VsYXRlIHNvZnQtdGFicyBmcm9tIHNwYWNlcyAoY2FuIGhhdmUgcmVtYWluZGVyKVxuICAgICAgICBsZXQgdGFicyA9IGluZGVudENvbHVtbiAvIHRhYkxlbmd0aDtcbiAgICAgICAgY29uc3QgcmVtID0gKHRhYnMgLSBNYXRoLmZsb29yKHRhYnMpKSAqIHRhYkxlbmd0aDtcblxuICAgICAgICAvLyBJZiB0aGVyZSdzIGEgcmVtYWluZGVyLCBgQGVkaXRvci5idWlsZEluZGVudFN0cmluZ2AgcmVxdWlyZXMgdGhlIHRhYiB0b1xuICAgICAgICAvLyBiZSBzZXQgcGFzdCB0aGUgZGVzaXJlZCBpbmRlbnRhdGlvbiBsZXZlbCwgdGh1cyB0aGUgY2VpbGluZy5cbiAgICAgICAgdGFicyA9IHJlbSA+IDAgPyBNYXRoLmNlaWwodGFicykgOiB0YWJzO1xuXG4gICAgICAgIC8vIE9mZnNldCBpcyB0aGUgbnVtYmVyIG9mIHNwYWNlcyB0byBzdWJ0cmFjdCBmcm9tIHRoZSBzb2Z0LXRhYnMgaWYgdGhleVxuICAgICAgICAvLyBhcmUgcGFzdCB0aGUgZGVzaXJlZCBpbmRlbnRhdGlvbiAobm90IGRpdmlzaWJsZSBieSB0YWIgbGVuZ3RoKS5cbiAgICAgICAgY29uc3Qgb2Zmc2V0ID0gcmVtID4gMCA/IHRhYkxlbmd0aCAtIHJlbSA6IDA7XG5cbiAgICAgICAgLy8gSSdtIGdsYWQgQXRvbSBoYXMgYW4gb3B0aW9uYWwgYGNvbHVtbmAgcGFyYW0gdG8gc3VidHJhY3Qgc3BhY2VzIGZyb21cbiAgICAgICAgLy8gc29mdC10YWJzLCB0aG91Z2ggSSBkb24ndCBzZWUgaXQgdXNlZCBhbnl3aGVyZSBpbiB0aGUgY29yZS5cbiAgICAgICAgLy8gSXQgbG9va3MgbGlrZSBmb3IgaGFyZCB0YWJzLCB0aGUgXCJ0YWJzXCIgaW5wdXQgY2FuIGJlIGZyYWN0aW9uYWwgYW5kXG4gICAgICAgIC8vIHRoZSBcImNvbHVtblwiIGlucHV0IGlzIGlnbm9yZWQuLi4/XG4gICAgICAgIGNvbnN0IGluZGVudCA9IHRoaXMuZWRpdG9yLmJ1aWxkSW5kZW50U3RyaW5nKHRhYnMsIG9mZnNldCk7XG5cbiAgICAgICAgLy8gVGhlIHJhbmdlIG9mIHRleHQgdG8gcmVwbGFjZSB3aXRoIG91ciBpbmRlbnRcbiAgICAgICAgLy8gd2lsbCBuZWVkIHRvIGNoYW5nZSB0aGlzIGZvciBoYXJkIHRhYnMsIGVzcGVjaWFsbHkgdHJpY2t5IGZvciB3aGVuXG4gICAgICAgIC8vIGhhcmQgdGFicyBoYXZlIG1peHR1cmUgb2YgdGFicyArIHNwYWNlcywgd2hpY2ggdGhleSBjYW4ganVkZ2luZyBmcm9tXG4gICAgICAgIC8vIHRoZSBlZGl0b3IuYnVpbGRJbmRlbnRTdHJpbmcgZnVuY3Rpb25cbiAgICAgICAgY29uc3Qgc3RhcnRSYW5nZSA9IFtyb3csIDBdO1xuICAgICAgICBjb25zdCBzdG9wUmFuZ2UgPSBbcm93LCB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3cpICogdGFiTGVuZ3RoXTtcbiAgICAgICAgdGhpcy5lZGl0b3IuZ2V0QnVmZmVyKCkuc2V0VGV4dEluUmFuZ2UoW3N0YXJ0UmFuZ2UsIHN0b3BSYW5nZV0sIGluZGVudCk7XG4gICAgfVxuXG4gICAgcGFyc2VMaW5lcyhsaW5lcykge1xuICAgICAgICAvLyBvcGVuQnJhY2tldFN0YWNrIGlzIGFuIGFycmF5IG9mIFtyb3csIGNvbF0gaW5kaWNhdGluZyB0aGUgbG9jYXRpb25cbiAgICAgICAgLy8gb2YgdGhlIG9wZW5pbmcgYnJhY2tldCAoc3F1YXJlLCBjdXJseSwgb3IgcGFyZW50aGVzZXMpXG4gICAgICAgIGNvbnN0IG9wZW5CcmFja2V0U3RhY2sgPSBbXTtcbiAgICAgICAgLy8gbGFzdENsb3NlZFJvdyBpcyBlaXRoZXIgZW1wdHkgb3IgW3Jvd09wZW4sIHJvd0Nsb3NlXSBkZXNjcmliaW5nIHRoZVxuICAgICAgICAvLyByb3dzIHdoZXJlIHRoZSBsYXRlc3QgY2xvc2VkIGJyYWNrZXQgd2FzIG9wZW5lZCBhbmQgY2xvc2VkLlxuICAgICAgICBsZXQgbGFzdENsb3NlZFJvdyA9IFtdO1xuICAgICAgICAvLyBJZiB3ZSBhcmUgaW4gYSBzdHJpbmcsIHRoaXMgdGVsbHMgdXMgd2hhdCBjaGFyYWN0ZXIgaW50cm9kdWNlZCB0aGUgc3RyaW5nXG4gICAgICAgIC8vIGkuZS4sIGRpZCB0aGlzIHN0cmluZyBzdGFydCB3aXRoICcgb3Igd2l0aCBcIj9cbiAgICAgICAgbGV0IHN0cmluZ0RlbGltaXRlciA9IFtdO1xuICAgICAgICAvLyBUaGlzIGlzIHRoZSByb3cgb2YgdGhlIGxhc3QgZnVuY3Rpb24gZGVmaW5pdGlvblxuICAgICAgICBsZXQgbGFzdENvbG9uUm93ID0gTmFOO1xuXG4gICAgICAgIC8vIHRydWUgaWYgd2UgYXJlIGluIGEgdHJpcGxlIHF1b3RlZCBzdHJpbmdcbiAgICAgICAgbGV0IGluVHJpcGxlUXVvdGVkU3RyaW5nID0gZmFsc2U7XG5cbiAgICAgICAgLy8gSWYgd2UgaGF2ZSBzZWVuIHR3byBvZiB0aGUgc2FtZSBzdHJpbmcgZGVsaW1pdGVycyBpbiBhIHJvdyxcbiAgICAgICAgLy8gdGhlbiB3ZSBoYXZlIHRvIGNoZWNrIHRoZSBuZXh0IGNoYXJhY3RlciB0byBzZWUgaWYgaXQgbWF0Y2hlc1xuICAgICAgICAvLyBpbiBvcmRlciB0byBjb3JyZWN0bHkgcGFyc2UgdHJpcGxlIHF1b3RlZCBzdHJpbmdzLlxuICAgICAgICBsZXQgY2hlY2tOZXh0Q2hhckZvclN0cmluZyA9IGZhbHNlO1xuXG4gICAgICAgIC8vIGtlZXAgdHJhY2sgb2YgdGhlIG51bWJlciBvZiBjb25zZWN1dGl2ZSBzdHJpbmcgZGVsaW1pdGVyJ3Mgd2UndmUgc2VlblxuICAgICAgICAvLyB1c2VkIHRvIHRlbGwgaWYgd2UgYXJlIGluIGEgdHJpcGxlIHF1b3RlZCBzdHJpbmdcbiAgICAgICAgbGV0IG51bUNvbnNlY3V0aXZlU3RyaW5nRGVsaW1pdGVycyA9IDA7XG5cbiAgICAgICAgLy8gdHJ1ZSBpZiB3ZSBzaG91bGQgaGF2ZSBhIGhhbmdpbmcgaW5kZW50LCBmYWxzZSBvdGhlcndpc2VcbiAgICAgICAgbGV0IHNob3VsZEhhbmcgPSBmYWxzZTtcblxuICAgICAgICAvLyBOT1RFOiB0aGlzIHBhcnNpbmcgd2lsbCBvbmx5IGJlIGNvcnJlY3QgaWYgdGhlIHB5dGhvbiBjb2RlIGlzIHdlbGwtZm9ybWVkXG4gICAgICAgIC8vIHN0YXRlbWVudHMgbGlrZSBcIlswLCAoMSwgMl0pXCIgbWlnaHQgYnJlYWsgdGhlIHBhcnNpbmdcblxuICAgICAgICAvLyBsb29wIG92ZXIgZWFjaCBsaW5lXG4gICAgICAgIGZvciAoY29uc3Qgcm93IG9mIEFycmF5KGxpbmVzLmxlbmd0aCkuZmlsbCgpLm1hcCgoXywgaSkgPT4gaSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGxpbmUgPSBsaW5lc1tyb3ddO1xuXG4gICAgICAgICAgICAvLyBib29sZWFuLCB3aGV0aGVyIG9yIG5vdCB0aGUgY3VycmVudCBjaGFyYWN0ZXIgaXMgYmVpbmcgZXNjYXBlZFxuICAgICAgICAgICAgLy8gYXBwbGljYWJsZSB3aGVuIHdlIGFyZSBjdXJyZW50bHkgaW4gYSBzdHJpbmdcbiAgICAgICAgICAgIGxldCBpc0VzY2FwZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgLy8gVGhpcyBpcyB0aGUgbGFzdCBkZWZpbmVkIGRlZi9mb3IvaWYvZWxpZi9lbHNlL3RyeS9leGNlcHQgcm93XG4gICAgICAgICAgICBjb25zdCBsYXN0bGFzdENvbG9uUm93ID0gbGFzdENvbG9uUm93O1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNvbCBvZiBBcnJheShsaW5lLmxlbmd0aCkuZmlsbCgpLm1hcCgoXywgaSkgPT4gaSkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjID0gbGluZVtjb2xdO1xuXG4gICAgICAgICAgICAgICAgaWYgKGMgPT09IHN0cmluZ0RlbGltaXRlciAmJiAhaXNFc2NhcGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG51bUNvbnNlY3V0aXZlU3RyaW5nRGVsaW1pdGVycyArPSAxO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hlY2tOZXh0Q2hhckZvclN0cmluZykge1xuICAgICAgICAgICAgICAgICAgICBudW1Db25zZWN1dGl2ZVN0cmluZ0RlbGltaXRlcnMgPSAwO1xuICAgICAgICAgICAgICAgICAgICBzdHJpbmdEZWxpbWl0ZXIgPSBbXTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBudW1Db25zZWN1dGl2ZVN0cmluZ0RlbGltaXRlcnMgPSAwO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNoZWNrTmV4dENoYXJGb3JTdHJpbmcgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgIC8vIElmIHN0cmluZ0RlbGltaXRlciBpcyBzZXQsIHRoZW4gd2UgYXJlIGluIGEgc3RyaW5nXG4gICAgICAgICAgICAgICAgLy8gTm90ZSB0aGF0IHRoaXMgd29ya3MgY29ycmVjdGx5IGV2ZW4gZm9yIHRyaXBsZSBxdW90ZWQgc3RyaW5nc1xuICAgICAgICAgICAgICAgIGlmIChzdHJpbmdEZWxpbWl0ZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0VzY2FwZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIGN1cnJlbnQgY2hhcmFjdGVyIGlzIGVzY2FwZWQsIHRoZW4gd2UgZG8gbm90IGNhcmUgd2hhdCBpdCB3YXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBidXQgc2luY2UgaXQgaXMgaW1wb3NzaWJsZSBmb3IgdGhlIG5leHQgY2hhcmFjdGVyIHRvIGJlIGVzY2FwZWQgYXMgd2VsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGdvIGFoZWFkIGFuZCBzZXQgdGhhdCB0byBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgaXNFc2NhcGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYyA9PT0gc3RyaW5nRGVsaW1pdGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2UgYXJlIHNlZWluZyB0aGUgc2FtZSBxdW90ZSB0aGF0IHN0YXJ0ZWQgdGhlIHN0cmluZywgaS5lLiAnIG9yIFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluVHJpcGxlUXVvdGVkU3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChudW1Db25zZWN1dGl2ZVN0cmluZ0RlbGltaXRlcnMgPT09IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJyZWFraW5nIG91dCBvZiB0aGUgdHJpcGxlIHF1b3RlZCBzdHJpbmcuLi5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bUNvbnNlY3V0aXZlU3RyaW5nRGVsaW1pdGVycyA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmdEZWxpbWl0ZXIgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluVHJpcGxlUXVvdGVkU3RyaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG51bUNvbnNlY3V0aXZlU3RyaW5nRGVsaW1pdGVycyA9PT0gMykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZXNldCB0aGUgY291bnQsIGNvcnJlY3RseSBoYW5kbGVzIGNhc2VzIGxpa2UgJycnJycnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bUNvbnNlY3V0aXZlU3RyaW5nRGVsaW1pdGVycyA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluVHJpcGxlUXVvdGVkU3RyaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG51bUNvbnNlY3V0aXZlU3RyaW5nRGVsaW1pdGVycyA9PT0gMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBhcmUgbm90IGN1cnJlbnRseSBpbiBhIHRyaXBsZSBxdW90ZWQgc3RyaW5nLCBhbmQgd2UndmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2VlbiB0d28gb2YgdGhlIHNhbWUgc3RyaW5nIGRlbGltaXRlciBpbiBhIHJvdy4gVGhpcyBjb3VsZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlaXRoZXIgYmUgYW4gZW1wdHkgc3RyaW5nLCBpLmUuICcnIG9yIFwiXCIsIG9yIGl0IGNvdWxkIGJlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSBzdGFydCBvZiBhIHRyaXBsZSBxdW90ZWQgc3RyaW5nLiBXZSB3aWxsIGNoZWNrIHRoZSBuZXh0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoYXJhY3RlciwgYW5kIGlmIGl0IG1hdGNoZXMgdGhlbiB3ZSBrbm93IHdlJ3JlIGluIGEgdHJpcGxlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHF1b3RlZCBzdHJpbmcsIGFuZCBpZiBpdCBkb2VzIG5vdCBtYXRjaCB3ZSBrbm93IHdlJ3JlIG5vdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpbiBhIHN0cmluZyBhbnkgbW9yZSAoaS5lLiBpdCB3YXMgdGhlIGVtcHR5IHN0cmluZykuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrTmV4dENoYXJGb3JTdHJpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobnVtQ29uc2VjdXRpdmVTdHJpbmdEZWxpbWl0ZXJzID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIGFyZSBub3QgaW4gYSBzdHJpbmcgdGhhdCBpcyBub3QgdHJpcGxlIHF1b3RlZCwgYW5kIHdlJ3ZlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGp1c3Qgc2VlbiBhbiB1bi1lc2NhcGVkIGluc3RhbmNlIG9mIHRoYXQgc3RyaW5nIGRlbGltaXRlci5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW4gb3RoZXIgd29yZHMsIHdlJ3ZlIGxlZnQgdGhlIHN0cmluZy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSXQgaXMgYWxzbyB3b3J0aCBub3RpbmcgdGhhdCBpdCBpcyBpbXBvc3NpYmxlIGZvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBudW1Db25zZWN1dGl2ZVN0cmluZ0RlbGltaXRlcnMgdG8gYmUgMCBhdCB0aGlzIHBvaW50LCBzb1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIHNldCBvZiBpZi9lbHNlIGlmIHN0YXRlbWVudHMgY292ZXJzIGFsbCBjYXNlcy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5nRGVsaW1pdGVyID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjID09PSBcIlxcXFxcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIGFyZSBzZWVpbmcgYW4gdW5lc2NhcGVkIGJhY2tzbGFzaCwgdGhlIG5leHQgY2hhcmFjdGVyIGlzIGVzY2FwZWQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm90ZSB0aGF0IHRoaXMgaXMgbm90IGV4YWN0bHkgdHJ1ZSBpbiByYXcgc3RyaW5ncywgSE9XRVZFUiwgaW4gcmF3XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc3RyaW5ncyB5b3UgY2FuIHN0aWxsIGVzY2FwZSB0aGUgcXVvdGUgbWFyayBieSB1c2luZyBhIGJhY2tzbGFzaC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTaW5jZSB0aGF0J3MgYWxsIHdlIHJlYWxseSBjYXJlIGFib3V0IGFzIGZhciBhcyBlc2NhcGVkIGNoYXJhY3RlcnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBnbywgd2UgY2FuIGFzc3VtZSB3ZSBhcmUgbm93IGVzY2FwaW5nIHRoZSBuZXh0IGNoYXJhY3Rlci5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0VzY2FwZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKFwiWyh7XCIuaW5jbHVkZXMoYykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wZW5CcmFja2V0U3RhY2sucHVzaChbcm93LCBjb2xdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZSBvbmx5IGNoYXJhY3RlcnMgYWZ0ZXIgdGhpcyBvcGVuaW5nIGJyYWNrZXQgYXJlIHdoaXRlc3BhY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGVuIHdlIHNob3VsZCBkbyBhIGhhbmdpbmcgaW5kZW50LiBJZiB0aGVyZSBhcmUgb3RoZXIgbm9uLXdoaXRlc3BhY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNoYXJhY3RlcnMgYWZ0ZXIgdGhpcywgdGhlbiB0aGV5IHdpbGwgc2V0IHRoZSBzaG91bGRIYW5nIGJvb2xlYW4gdG8gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3VsZEhhbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFwiIFxcdFxcclxcblwiLmluY2x1ZGVzKGMpKSB7IC8vIGp1c3QgaW4gY2FzZSB0aGVyZSdzIGEgbmV3IGxpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIGl0J3Mgd2hpdGVzcGFjZSwgd2UgZG9uJ3QgY2FyZSBhdCBhbGxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgY2hlY2sgaXMgbmVjZXNzYXJ5IHNvIHdlIGRvbid0IHNldCBzaG91bGRIYW5nIHRvIGZhbHNlIGV2ZW4gaWZcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNvbWVvbmUgZS5nLiBqdXN0IGVudGVyZWQgYSBzcGFjZSBiZXR3ZWVuIHRoZSBvcGVuaW5nIGJyYWNrZXQgYW5kIHRoZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbmV3bGluZS5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGMgPT09IFwiI1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGNoZWNrIGdvZXMgYXMgd2VsbCB0byBtYWtlIHN1cmUgd2UgZG9uJ3Qgc2V0IHNob3VsZEhhbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRvIGZhbHNlIGluIHNpbWlsYXIgY2lyY3Vtc3RhbmNlcyBhcyBkZXNjcmliZWQgaW4gdGhlIHdoaXRlc3BhY2Ugc2VjdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2UndmUgYWxyZWFkeSBza2lwcGVkIGlmIHRoZSBjaGFyYWN0ZXIgd2FzIHdoaXRlLXNwYWNlLCBhbiBvcGVuaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBicmFja2V0LCBvciBhIG5ldyBsaW5lLCBzbyB0aGF0IG1lYW5zIHRoZSBjdXJyZW50IGNoYXJhY3RlciBpcyBub3RcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdoaXRlc3BhY2UgYW5kIG5vdCBhbiBvcGVuaW5nIGJyYWNrZXQsIHNvIHNob3VsZEhhbmcgbmVlZHMgdG8gZ2V0IHNldCB0b1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZmFsc2UuXG4gICAgICAgICAgICAgICAgICAgICAgICBzaG91bGRIYW5nID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNpbWlsYXIgdG8gYWJvdmUsIHdlJ3ZlIGFscmVhZHkgc2tpcHBlZCBhbGwgaXJyZWxldmFudCBjaGFyYWN0ZXJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc28gaWYgd2Ugc2F3IGEgY29sb24gZWFybGllciBpbiB0aGlzIGxpbmUsIHRoZW4gd2Ugd291bGQgaGF2ZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaW5jb3JyZWN0bHkgdGhvdWdodCBpdCB3YXMgdGhlIGVuZCBvZiBhIGRlZi9mb3IvaWYvZWxpZi9lbHNlL3RyeS9leGNlcHRcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJsb2NrIHdoZW4gaXQgd2FzIGFjdHVhbGx5IGEgZGljdGlvbmFyeSBiZWluZyBkZWZpbmVkLCByZXNldCB0aGVcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxhc3RDb2xvblJvdyB2YXJpYWJsZSB0byB3aGF0ZXZlciBpdCB3YXMgd2hlbiB3ZSBzdGFydGVkIHBhcnNpbmcgdGhpc1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbGluZS5cbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RDb2xvblJvdyA9IGxhc3RsYXN0Q29sb25Sb3c7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjID09PSBcIjpcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RDb2xvblJvdyA9IHJvdztcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXCJ9KV1cIi5pbmNsdWRlcyhjKSAmJiBvcGVuQnJhY2tldFN0YWNrLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSAucG9wKCkgd2lsbCB0YWtlIHRoZSBlbGVtZW50IG9mZiBvZiB0aGUgb3BlbkJyYWNrZXRTdGFjayBhcyBpdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZHMgaXQgdG8gdGhlIGFycmF5IGZvciBsYXN0Q2xvc2VkUm93LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RDbG9zZWRSb3cgPSBbb3BlbkJyYWNrZXRTdGFjay5wb3AoKVswXSwgcm93XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXCInXFxcIlwiLmluY2x1ZGVzKGMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3RhcnRpbmcgYSBzdHJpbmcsIGtlZXAgdHJhY2sgb2Ygd2hhdCBxdW90ZSB3YXMgdXNlZCB0byBzdGFydCBpdC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmdEZWxpbWl0ZXIgPSBjO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bUNvbnNlY3V0aXZlU3RyaW5nRGVsaW1pdGVycyArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IG9wZW5CcmFja2V0U3RhY2ssIGxhc3RDbG9zZWRSb3csIHNob3VsZEhhbmcsIGxhc3RDb2xvblJvdyB9O1xuICAgIH1cblxuICAgIGluZGVudEhhbmdpbmcocm93KSB7XG4gICAgICAgIC8vIEluZGVudCBhdCB0aGUgY3VycmVudCBibG9jayBsZXZlbCBwbHVzIHRoZSBzZXR0aW5nIGFtb3VudCAoMSBvciAyKVxuICAgICAgICBjb25zdCBpbmRlbnQgPSAodGhpcy5lZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocm93KSkgK1xuICAgICAgICAgICAgKGF0b20uY29uZmlnLmdldChcInB5dGhvbi1pbmRlbnQuaGFuZ2luZ0luZGVudFRhYnNcIikpO1xuXG4gICAgICAgIC8vIFNldCB0aGUgaW5kZW50XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldEluZGVudGF0aW9uRm9yQnVmZmVyUm93KHJvdywgaW5kZW50KTtcbiAgICB9XG59XG4iXX0=