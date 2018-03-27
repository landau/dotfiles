(function() {
  var assert;

  assert = require('assert');

  describe('Top level describe', function() {
    describe('Nested describe', function() {
      it('is successful', function() {
        return assert(true);
      });
      return it('fails', function() {
        return assert(false);
      });
    });
    return describe('Other nested', function() {
      it('is also successful', function() {
        return assert(true);
      });
      return it('is successful\t\nwith\' []()"&%', function() {
        return assert(true);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL3RsYW5kYXUvLmF0b20vcGFja2FnZXMvbW9jaGEtdGVzdC1ydW5uZXIvdGVzdC9zYW1wbGUtdGVzdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7QUFBQSxNQUFBOztFQUFBLE1BQUEsR0FBUyxPQUFBLENBQVEsUUFBUjs7RUFFVCxRQUFBLENBQVMsb0JBQVQsRUFBK0IsU0FBQTtJQUU3QixRQUFBLENBQVMsaUJBQVQsRUFBNEIsU0FBQTtNQUUxQixFQUFBLENBQUcsZUFBSCxFQUFvQixTQUFBO2VBQ2xCLE1BQUEsQ0FBTyxJQUFQO01BRGtCLENBQXBCO2FBR0EsRUFBQSxDQUFHLE9BQUgsRUFBWSxTQUFBO2VBQ1YsTUFBQSxDQUFPLEtBQVA7TUFEVSxDQUFaO0lBTDBCLENBQTVCO1dBUUEsUUFBQSxDQUFTLGNBQVQsRUFBeUIsU0FBQTtNQUV2QixFQUFBLENBQUcsb0JBQUgsRUFBeUIsU0FBQTtlQUN2QixNQUFBLENBQU8sSUFBUDtNQUR1QixDQUF6QjthQUdBLEVBQUEsQ0FBRyxpQ0FBSCxFQUFzQyxTQUFBO2VBQ3BDLE1BQUEsQ0FBTyxJQUFQO01BRG9DLENBQXRDO0lBTHVCLENBQXpCO0VBVjZCLENBQS9CO0FBRkEiLCJzb3VyY2VzQ29udGVudCI6WyJcbmFzc2VydCA9IHJlcXVpcmUgJ2Fzc2VydCdcblxuZGVzY3JpYmUgJ1RvcCBsZXZlbCBkZXNjcmliZScsIC0+XG5cbiAgZGVzY3JpYmUgJ05lc3RlZCBkZXNjcmliZScsIC0+XG5cbiAgICBpdCAnaXMgc3VjY2Vzc2Z1bCcsIC0+XG4gICAgICBhc3NlcnQodHJ1ZSlcblxuICAgIGl0ICdmYWlscycsIC0+XG4gICAgICBhc3NlcnQoZmFsc2UpXG5cbiAgZGVzY3JpYmUgJ090aGVyIG5lc3RlZCcsIC0+XG5cbiAgICBpdCAnaXMgYWxzbyBzdWNjZXNzZnVsJywgLT5cbiAgICAgIGFzc2VydCh0cnVlKVxuXG4gICAgaXQgJ2lzIHN1Y2Nlc3NmdWxcXHRcXG53aXRoXFwnIFtdKClcIiYlJywgLT5cbiAgICAgIGFzc2VydCh0cnVlKVxuIl19
