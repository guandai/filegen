// by twindai
var smt = require("./smt");
var sharelib = require("./sharelib");
var awss3 = require("./awss3");

var tr = smt.tr
var fs = require("fs");
var replacepeer = smt.replacepeer
var testobj={}

function startrun(opt) {
    tr("----loadtemplate")

    fs.readFile("../" + opt.runMethod + "/matchlist.json", function(err, filedata) {
        opt.matchlist = JSON.parse(filedata, 'utf-8');
        backupfirst(opt)
    })
}

function backupfirst(opt) {
    var sts = opt.allsettings
    var gotfile = 0

    var asyncOpt = {}
    asyncOpt.count = 0;
    //opt is for sync use
    opt.contenttype = sts.contenttype

    opt.s3getbucket = sts.s3getbucket
    opt.s3putbucket = sts.s3putbucket
    opt.s3getkeypath = sts.s3getkeypath = replacepeer(sts.replace_peer, sts.s3getkeypath)
    opt.s3putkeypath = sts.s3putkeypath = replacepeer(sts.replace_peer, sts.s3putkeypath)
        
    opt.backuplist = []
    for (var m in opt.matchlist) {
        opt.backuplist.push(m)
        opt.backuplist.push(opt.matchlist[m])
    }

    for (var m in opt.backuplist) {
        var value = opt.backuplist[m]
        opt.s3getkey = opt.s3getkeypath + value // this is file to fetch for awss3.getobject
        midpath = "/backup_" + Date.now().toString().substring(0, 9) //  random folder
        opt.localpathfilename = getExportFolder(opt , midpath) + value // path add file name 
        
        awss3.getobject(opt, function(opt) {
            opt.uploadData=opt.returnBody
            sharelib.writetoFile(opt, function(opt) {
                countfinish(opt, asyncOpt )
            })
        })
    }
}


function countfinish(opt, asyncOpt) {
    asyncOpt.count++
    if (asyncOpt.count == opt.backuplist.length) {
        tr("countfinish!")
        uploadWithNewName(opt)
    }
}

function uploadWithNewName(opt) {
    tr("> uploadWithNewName")

    for (var m in opt.matchlist) {
        var value = opt.matchlist[m]
        var index = m
        opt.s3getkey = opt.s3getkeypath + index // download key
        opt.s3putkey = opt.s3putkeypath + value // download key

        awss3.getobject(opt, function(opt) {
            opt.uploadData=opt.returnBody
            awss3.s3uploadDirect(opt, finishcb)
        })
    }
    //  sharelib.writetoFile( opt, uptos3)
}

function getExportFolder(opt, midpath) {
    midpath = midpath || ""
    return "../" + opt.runMethod + "/generate/" + opt.argvobj.taskname + midpath + "/"
}

function finishcb(opt) {
  testobj= smt.mergeobj(testobj, opt)
}

exports.startrun = startrun
