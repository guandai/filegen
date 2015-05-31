

describe("method replace template", function() {
    var main = require("../lib/main.js");
    var smt = require("../lib/smt.js")
    var testopt ={}

    var testargv = "node filegen.js m_repltemp -fullname-XXXXX_783_991000_120x600  -cid-XXXXX -campaign-783 -width-120 -height-600 -mainindex-index.html -landing-http%3A%2F%2Fyourdomain.com -taskname-html_html5_test".split(" ")
    opt = main.run(testargv)
    

    beforeEach(function( done ) {
        //spyOn( main , "run").and.callThrough(); 
        setTimeout(done , 500 )    
    })
    
    it("settings should be loaded correctly ", function( done ) {
        expect(opt.s3putbucket ).toBe( 'filegen-bucket' );
        done();
    });

    it("generate a html5 banner has no replacePeer left like [xxx] ", function( done ) {
        expect( opt.uploadData  ).not.toMatch( /\[campaign\]/ );
        done();
    });

    it("upload to s3 test", function( done ) {
        expect( opt.s3response ).not.toBeUndefined()
        done();
    });
});
