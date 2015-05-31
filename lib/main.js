 var fs = require("fs");
 var smt = require("./smt");
 var tr = smt.tr
 var testopt={}

 function run(testargv, testcb) {
     var opt = {}
     opt.allsettings = {}
     opt.argvobj = {}
     opt.argvkeys = []

     var argv = process.argv

     if (testcb) opt.testcb = testcb
     if (testargv) argv = testargv

     opt.runMethod = argv[2]
     argv.forEach(function(val, index, array) {
         if (val.match(/^-(.*?)-/)) {
             var valname = val.match(/^-(.*?)-/)[1]
             opt.argvobj[valname] = val.substring(valname.length + 2)
             opt.argvkeys.push(valname)
         }
     });

     var runtask = require("./" + opt.runMethod) //  = this[runMethod]
     opt.cb = runtask.startrun
     loadsetting(opt)

     return opt
 }


 function noRunMethod() {
     console.log(" no runMethod specified in arguments")
 }



 function loadsetting(opt) {
     tr("---loadsetting", process.cwd(), opt.runMethod, opt.argvobj.taskname)
     if (opt.argvobj.taskname) {
         fs.readFile(__dirname + "/../" + opt.runMethod + "/allsettings.json", function(err, filedata) {
             if (err) {
                 tr("!loadsetting fail:" + err);
                 return err
             } else {
                 tr("---loaded allsettings")
                 opt.allsettings = compileAllsettings(JSON.parse(filedata))
                 opt.allsettings = opt.allsettings[opt.argvobj.taskname] || {};
                 opt = setReplacePeer(opt)
                 opt.cb(opt)
             }
         });
     } else {
         cb(opt)
     }
 }


 /*
  * precompile allsetting json , e.g   @extend
  * param json (object)
  * return  allsettings
  */
 function compileAllsettings(json) {
     for(var ji in json){
         var extend = json[ji]["@extend"] || []
         if (typeof extend == "string") extend = [extend]
         extend.forEach(function(ev, ei, ea) {
             for(var ee in json[ev] ){
                json[ji][ee] = json[ev][ee]   
             }
         })
     }
     return json
 }

 function setReplacePeer(opt) {
     // set up a replace var , also used in smt
     if (!opt.allsettings.replace_peer) opt.allsettings.replace_peer = {}
     for (var r in opt.argvkeys) {
         var name = opt.argvkeys[r]
         var replCharStart = opt.allsettings.replCharStart || "{{"
         var replCharEnd = opt.allsettings.replCharEnd || "}}"
         if (opt.argvobj[name]) opt.allsettings.replace_peer[ replCharStart + name + replCharEnd ] = opt.argvobj[name]
     }
     if (opt.argvobj.landing) {
         // starting landing is coded
         opt.allsettings["replace_peer"]["[escape1landing]"] = opt.argvobj.landing
         opt.argvobj.landing = decodeURIComponent(opt.argvobj.landing)
         tr("opt.landing:", opt.argvobj.landing)
     }
     console.log(opt)
     return opt
 }

 exports.run = run;
 exports.noRunMethod = noRunMethod;
 exports.loadsetting = loadsetting;
 exports.setReplacePeer = setReplacePeer;
 exports.testopt = testopt
