// by twindai
var smt = require("./smt");
var sharepart = require("./sharepart");
var awss3 = require("./awss3");
var async=require("async")
var tr=smt.tr
var fs=require("fs");
var taskname=""
var osize=smt.osize;
function startrun(opt){
  tr("startrun")
  
  startfn=function(callback){
  	loadfiles(callback,opt)
  }

  async.waterfall([
	    startfn,
	    compareobj,
	    writetoFile
	], function (err, result) {
	   if(err){
	   		tr(err)
	   }else{
	   		tr(result)
	   }
	});
}

function loadfiles(callback,opt){
	tr("loadfiles")
	
	console.log("!!",opt.allsettings.file1)
	loadonefile1=function(callback){
		opt.filename=opt.allsettings.file1
		loadonefile(opt, callback)	
	}
	

	loadonefile2=function(callback){
		opt.filename=opt.allsettings.file2	
		loadonefile(opt, callback)	
	}


	var plist=[loadonefile1,loadonefile2]
	async.parallel(plist, function(err,results){
		    if( err ) {
		      tr('! Not All file loaded:',err);
		    } else {
		      console.log("All file loaded", smt.osize(results[0].filedata), smt.osize(results[1].filedata)) 
		      callback(null,results)
		    }
		})
}

function loadonefile(opt,callback){
	tr("loadonefile")
	var readpathfile="../" + opt.runMethod + "/" + opt.filename
	tr(readpathfile)
	fs.readFile( readpathfile,   function(err, filedata)
	{ 
		filedata = JSON.parse(filedata.toString("utf-8"))
		var ext=smt.cloneobj(opt)
		ext.filedata=filedata
		callback(null,ext);
	})
}

function compareobj(results, callback){
	var data1=results[0].filedata
	var data2=results[1].filedata
	var datae=[]
	 for(var d1 in data1){
	 	 for (var d2 in data2){
	 	 	if(d1==d2) break
	 	 	datae.push(d1)
	 	 }
	 }
	 tr(smt.osize(data1))
	 tr(smt.osize(data2))
	 tr(datae.length)

}

function writetoFile(opt){

}


exports.startrun=startrun
