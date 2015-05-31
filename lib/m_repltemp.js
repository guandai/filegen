// by twindai
var smt = require("./smt");
var sharelib = require("./sharelib");
var awss3 = require("./awss3");

var tr = smt.tr
var tc = smt.tc
var fs = require("fs");
var replacepeer = smt.replacepeer

var testopt={}

function startrun(opt) {
    //sharelib.errmail( null, opt , null)

    tr("----loadtemplate")
    fs.readFile(   __dirname + "/../" + opt.runMethod + "/templates/" + opt.allsettings.template_name, 
        function(err, filedata) {
            opt.template = new String(filedata, 'utf-8');
            tr(opt.allsettings.template_name)
            backupfirst(opt)
    })
}


function backupfirst(opt) {
    var sts = opt.allsettings

    opt.s3putname = replacepeer(sts.replace_peer, sts.export_filename)
    opt.s3getbucket = sts.s3getbucket
    opt.s3putbucket = sts.s3putbucket

    // update down and upload s3key
    opt.s3putkeypath = replacepeer(sts.replace_peer, sts.s3putkeypath)
    //opt.s3getkeypath = replacepeer(sts, sts.s3getkeypath)
    //upload filename
    opt.s3getkey = opt.s3getkeypath + opt.s3getname
    opt.s3putkey = opt.s3putkeypath + opt.s3putname

    var midpath = "/backup_" + Date.now().toString().substring(0, 9) //  random folder
    opt.localpathfilename = getExportFolder(opt,midpath) + opt.s3putname // path add file name 

    if (sts.skipbackup != "1") {
        tr("-> backup from s3")
        awss3.getobject(cjb, opt, function(opt) {
            sharelib.writetoFile(opt, function(opt){
            	loopintemplate(opt)
            })
        })
    } else {
        tr("skip backup !")
        loopintemplate(opt)
    }
}

function loopintemplate(opt) {
    tr(">--loop in template")
    var sts = opt.allsettings
    opt.contenttype = sts.contenttype
    opt.uploadData = opt.template

    opt.localpathfilename  = getExportFolder(opt) + opt.s3putname

    if (sts.contenttype.indexOf("text") >= 0 || sts.contenttype.indexOf("json") >= 0) {
        opt.uploadData = replacepeer(sts.replace_peer, opt.uploadData)
  
    }
    
    //change default index.html name to fullname
    if (sts.changeIndexName == 1) {
        opt.uploadData = opt.uploadData.replace("index.html", sts.replace_peer.fullname + ".html")
    }

    testopt = opt

    sharelib.writetoFile( opt, function(opt) {
        if (sts.upload == "1") {
            awss3.s3upload( opt, finishcb )
        }
    })
}


function getExportFolder(opt, midpath) {
    midpath = midpath || ""
    return    __dirname + "/../" + opt.runMethod + "/generate/" + opt.argvobj.taskname + midpath + "/"
}


function finishcb(opt) {
    if(opt.err) smt.tc( opt.err)
    testopt = smt.mergeobj( testopt , opt)
}



exports.startrun = startrun
exports.testopt = testopt
