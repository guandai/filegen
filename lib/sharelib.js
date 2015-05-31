var mkpath = require('mkpath');
var fs = require('fs');
var awss3 = require('./awss3');
var smt = require('./smt');
var https = require('https');
var http = require('http');
var js2xmlparser = require("js2xmlparser");
var csv = require('csv');
var json2csv = require('json2csv');
var xml2jsParse = require('xml2js').parseString;
var ftpClient = require('ftp');
var zlib = require('zlib');
var gzip = zlib.createGzip();
var trl=smt.trl
var Emitter=require('events').EventEmitter;
var nEvent = new Emitter();

var tr = smt.tr;
var creatfolder=smt.creatfolder;
var osize = smt.osize;
var downreq = smt.downreq;
var secondsToString = smt.secondsToString;
var clone = smt.clone;
var emailpack=require("./emailpack")

// loadlocal settings  custom setting file
var allsetings;

fs.readFile("../settings/allsettings.json", function(err, filedata)
	{ 
		if(!filedata) filedata="{}"
		allsetings = JSON.parse(filedata); 
	}
);

/*
 * fetch one or multipal feeds by sent a http quest @param{object}  current
 * job @param{object}  option with detailed params @param{function}
 * callback , a callback
 */

 function fetchfeed ( option, callback) {
	for ( var i in option.feedarray) {
		tr("> fetchfeed feedurl is:", option.feedarray[i]);
		var fid = i;
		var port = 80;
		var sentMethod = "GET";
		var option = {
			"url" : option.feedarray[i],
			"feedid" : i,
			"fid" : fid,
			"port" : port,
			"sentMethod" : sentMethod,
		};
		httprequest( option, callback);
	};
};

/*
 * fetch one or multipal feeds by sent a http quest @param{object}  current
 * job @param{object}  option with detailed params @param{object} 
 * http request option @param{function} callback , a callback
 */
function httprequest( option, callback) {
	tr("> httprequest")
	var sentHost = option.url.match(/:\/\/[^\/]*(?=\/)/).toString().substring(3);
	var sentPath = option.url;
	var reqoptions = {
		hostname : sentHost,
		port : option.port,
		path : sentPath,
		method : option.sentMethod,
		headers : {
			"feedid" : option.feedid
		}
	};
	// tobj(reqoptions)
	var feedreq;
	if (option.url.indexOf("https:") >= 0) {
		option.https=true;
		reqoptions.port= 443;
	}

	if (option.https==true) {
		feedreq = https.get(reqoptions, function(feedres) {
			option.hearders = feedres.socket._httpMessage._headers;
			option.feedres = feedres;
			callback(option);
		});
	} else {
		feedreq = http.request(reqoptions, function(feedres) {
			option.hearders = feedres.socket._httpMessage._headers;
			option.feedres = feedres;
			callback( option);
		});
	}
	feedreq.on('error',  smt.makecb(errmail, option) );
	// write data to request body
	// feedreq.write('data\n');
	feedreq.end();
}


/*
 * sent err notice email
 */
function errmail(e, opt, callback) {
	  	if(!e) {
	  		e= new Error("a default error created.")
	  	} 
	  	if(!callback) callback=smt.ffn
		//opt.req.session.destroy
		opt.mailPrefix= opt.mailPrefix || "[Error]"
		opt.errSMS =  opt.errSMS || 'problem with feed request: ' + e.message
		tr(opt.errSMS)
		emailpack.sentTagsEmail(opt)
	}


/*
 * working on http response after a http request sent , set returen data to
 * option.returnBody @param{object}  current job @param{object} 
 * option with detailed params @param{object} feedres , response object working
 * on @param{function} callback , a callback
 */
 function reqhttpCB( option, callback) {
	 tr("reqhttpCB feedid:",option.feedid)
	var returnStatus = option.feedres.statusCode;
	if(returnStatus !=200){
		tr(">reqhttpCB returnStatus", returnStatus)
		option.errSMS= "connection fail: 	>reqhttpCB returnStatus" + returnStatus
		errmail(null,option)
	}else{

		var returnHeaders = JSON.stringify(option.feedres.headers);
		var fid = option.feedres.req._headers.feedid;
		option.feedres.setEncoding(option.buffercode);
		var chunkcount = 0;
		var returnBody = "";
		option.feedres.on('data', function(chunk) {
			chunkcount++;
			// returnBody splited to several part during Event:data, so here need to
			// connect all returnBody together
			if (chunkcount % 1000 == 0) {
				tr("> feedres.on data, getting chunk for chunk:" + fid + "-" + chunkcount / 1000 + "... ");
			}
			returnBody = returnBody + chunk;
		});

		option.feedres.on("end",function() {
			// tr("get a body, id is:" + option.fid + " , size: " + returnBody.length)
			// var returnBody = encoding.convert(returnBody,"iso-8859-1","binary");
			// replace returnBody to last returnChildren
			option.returnBody = option.returnChildren[option.fid] = returnBody;
			// tr("feedres.on feedid:",option.feedid)
			callback( option);
		});
	}
};



/*
 * according to data formate , parse feed to JSON object @param{object} 
 * current job @param{object}  option with detailed params
 * @param{function} callback , a callback
 */
function parsefeed( option, callback) {
	// option clone must be declared before clone
	// async write to s3 , s3upload(option) is in write to File
	// parse CSV
	tr("parsefeed");
	if (option.format == "csv" || option.format == "text") {
		var csvoptions = {
			comment : option.comment,
			delimiter : option.delimiter,
			quote : option.quote,
			rowdelimiter : option.rowdelimiter
		};

		tr(">parsefeed returnBody size:", option.returnBody.length);
		if(option.returnBody.length<1000){
			console.log(option.returnBody)
			conosle.log(option.feedres.statusCode)
		}

		csv.parse(option.returnBody, csvoptions, function(err, result) {
			var rootobj = option.parsedRootObjArr[option.fid] = result;
			if (!err && rootobj && rootobj[0] && rootobj[1]) {
				// option.startline = req.query["startline"] || 1 //2nd line
				// option.urlkey = req.query["urlkey"] || 3
				option.fieldsorgarr = rootobj[0];
				// turn back to string
				option.parsedNodeObjArr[option.fid] = rootobj.slice(option.startline,rootobj.length);
				afterparseCB(option);
				callback(option);
			} else {
				if(err){err.message += " and rootobj not well formated"}
						else{
							err.message += " and rootobj not well formated"
						}
				option.err=err
				sentErrPage(option,callback);
			};
		});
	};

	if (option.format == "json") {
		var rootobj = option.parsedRootObjArr[option.fid] = JSON.parse(option.returnBody);
		if (rootobj && rootobj[option.rootname]) {
			var nodeobj = option.parsedNodeObjArr[option.fid] = rootobj[option.rootname];
			tr("parsefeed fid " + option.fid + " has " + nodeobj.length + " nodes");
			if(typeof callback == "function" ){callback(option);}
		} else {
			var err = new Error("rootobj not well formated")
			option.err=err
			sentErrPage(option,callback);
		}
	}

	if (option.format == "xml") {
		xml2jsParse(
				option.returnBody,
				function(err, result) {
					//tr(option.returnBody)
					var rootobj = option.parsedRootObjArr[option.fid] = result;
					// option.urlkey = option.req.query["urlkey"] || "url"
					// option.startline = option.req.query["startline"] || 0
					if (!err && rootobj && rootobj[option.rootname]) {
						option.parsedNodeObjArr[option.fid] = rootobj[option.rootname][option.nodename];
						tr("parsefeed fid " + option.fid + " has "
											+ osize(option.parsedNodeObjArr[option.fid])
											+ " nodes");
						afterparseCB(option);
						callback(option);
					} else {
						if(err){err.message += " and rootobj not well formated"}
						else{
   						  var err = new Error("rootobj not well formated")
						}
						option.err=err
						sentErrPage(option,callback);
					}
				});
	};
};


/*
 * after JSON manipulate, convert the export JSON to original format
 * @param{object}  current job @param{object}  option with detailed
 * params @param{function} callback , a callback
 */

function obj2str( option, callback) {
	tr("obj2str");
	var rootobj = option.parsedRootObjArr[option.fid];
	if (!rootobj){rootobj={}}
	try{
			if (option.format == "csv" || option.format == "text") {
				rootobj = option.exportObj;
				if (!rootobj){rootobj={}}
				// parsedRootObjArr[option.fid] is org source of data, exportObj is
				// modified data
				option.fieldsarr = option.fieldsarr || option.fieldsorgarr;
				option.delimiterext = option.csf.delimiterext || option.delimiter;
				json2csv({
					data : rootobj,
					fields : option.fieldsarr,
					del: option.delimiterext
				}, function(err, returnBody) {
					if (err) {
						tr(err);
					}
					//returnBody = returnBody.replace(/\,/g, option.delimiter);
					var  repfield='"'+option.fieldsarr.toString().replace(/\,/g, '"'+option.delimiterext+'"')+'"';
					tr(repfield)
					if (option.csf.rmfield==1) {
					  repfieldn= repfield +'\n';
					  returnBody=returnBody.replace(repfieldn, "").replace(repfield, "");
					} else if (option.csf.fieldstr) {
					  returnBody=returnBody.replace(repfield, option.csf.fieldstr);
					}

					returnBody = returnBody.replace(/\"/g, option.csf.quote);
		            
		            // goes to sentToPage, sentOrWrite
		            exportdata(returnBody)
				});
			}

			if (option.format == "xml") {
				var arrl = rootobj[option.rootname][option.nodename].length;
				tr("there are ", arrl, " in obj2str");
				var unit = 1000;
				var numbergroup = Math.ceil(arrl / unit);
				// numbergroup=2;
				var exportBody = "";
				var starttime = Date.now();
				// parse for each unit
				for (var i = 0; i < numbergroup; i++) {
					tr("working on id:", (i + 1), "/", numbergroup, "array group");
					var curarr = rootobj[option.rootname][option.nodename].slice( 0 + unit * i, unit * (i + 1));
					// var curarr= [].slice.call(rootobj[option.rootname], 0+unit*i, unit*(i+1) )
					var returnBody = "";
					returnBody = js2xmlparser(option.nodename, curarr);
					// remove header and rootname for each node
					returnBody = returnBody.replace( /\<\?xml version="1.0" encoding="UTF-8"\?\>\n/g, "");
					exportBody += returnBody;
					var endtime = Date.now();
					var difftime = (endtime - starttime) / 1000;
					var avrtime = difftime / (i + 1);
					var resttime = avrtime * (numbergroup - i - 1);

					tr("estimate rest time:", secondsToString(resttime), "sec");
				};

				// create header and rootname
				exportBody = '<?xml version="1.0" encoding="UTF-8"?>\n' + "<" + option.rootname + ">" + exportBody + "</" + option.rootname + ">";
				
				// goes to ksbgenxml or combineXmlFiles
				exportdata(exportBody)
			}
	}
	catch(err){
		var errtext="Input Json is not avaliable"
		tr(errtext)
		option.connectedObj[option.req.path]=0
		option.res.send(200, 'Sorry, we met error when exporting your data, <br>[Reason]:'+errtext+" <br>[Err code]:"+err);
	}

	function exportdata(data){
		option.returnChildrenResult[option.fid] = data;
		callback(option);
	} 
}

/*
 * sent back a Error page @param{object}  current job
 * current job @param{object}  option with detailed params
 */
function sentErrPage(option,callback) {
	option.returnBody = option.err + option.returnBody;
	option.format = "text";
	sentToPage(option,smt.ffn);
}




/*
 * sent a html page back to option.res @param{object}  current job
 */
function sentToPage(option, callback) {
	tr("> start sent to page");
	try {
		option.format= option.sentformat  || option.format || "plain";
		option.res.set({
			"Content-Type" : "text/" + option.format,
			"expressJS-set-header" : "true"
		});
		option.res.send(option.returnBody.toString('utf8'));
		if(typeof callback=="function"){ 
		 	callback(option);
		 } else {
		 	trl(callback);
		 	smt.ffn();
		 }
	} catch (err) {
		tr("!sentToPage meet error",err);
	
	};
};



/*
 * acoording to option.direct to choose wehter save a local copy @param{object} 
 * current job
 */
function sentOrWrite(option, callback) {
	tr("> start sentOrWrite");
	option.direct ? awss3.s3uploadDirect(option,callback) : writetoFile(option, awss3.s3upload);
}

/*
 * save data in option.in a localfile @param{obj}  current job object
 * @param{function} callback , a callback
 */
function writetoFile(option, callback) {

	tr("> start writetoFile", option.localpathfilename );
	var inoption = smt.clone(option)
	creatfolder( option.localpathfilename.substring(0, option.localpathfilename.lastIndexOf("/"))  ); 
	var writeFileCB = function (err) {
		option = inoption 
		// option.localpathfilename=localpathfilename
		// option.s3keypath=s3keypath

		if (err) {
			tr("save file meet error:", err);
		} else {
			var stats = fs.statSync( option.localpathfilename );
			option.fileSizeInBytes = stats["size"];
			
			tr(200, 'writetoFile : a File Saved', option.localpathfilename , "size is ", smt.shortenunit( option.fileSizeInBytes) );
			callback( option );
			//awss3.s3upload(option, cllback)
		};
	}
	
	fs.writeFile( option.localpathfilename , option.uploadData, writeFileCB );
};	


/*
 * compress writed file
 */
function gzipfile(option, callback) {
	var localpathfilename = option.localpathfilename || option.localpathfilename 
	var gzlocalpathfilename=localpathfilename+".gz"
	 var inp = fs.createReadStream(  localpathfilename );
	 var out = fs.createWriteStream( gzlocalpathfilename );
	 inp.pipe(gzip).pipe(out).on("close", function(){
		var stats = fs.statSync(gzlocalpathfilename);
		var fileSizeInBytes = stats["size"];

		console.log( smt.shortenunit( fileSizeInBytes) )
		localpathfilename = option.localpathfilename = option.localpathfilename =gzlocalpathfilename
		callback(  option );
	});
}



/*
 * sent folder to a SFTP server
 * current job option callback
 */
function sentToftp(option, callback){
  tr("sentoftp");
  var c = new ftpClient();
  c.on('ready', function() {
    c.put(option.localpathfilename, option.localpathfilename, function(err) {
      if (err) {
      	 console.log(err);
      	}
      c.end();
      callback( option);
    });
  });

  c.on('greeting', function(msg) {  console.log("response: "+msg); });
  c.on('end', function() {  console.log("Connection End"); });
  c.on('error', function( err) {  console.log(err); });
  c.on('close', function( cls) { console.log(cls); });
  // connect to localhost:21 as anonymous
  var ftpoption= { 
  				"user" : option.csf.ftpuser,
  				"password" : option.csf.ftppassword ,
  				"host" : option.csf.ftphost ,
  				"port" : option.csf.ftpport,
  				"secure" : true
  			};
  smt.tobj(ftpoption);
  c.connect(ftpoption);
 }



exports.errmail=errmail;
exports.gzipfile=gzipfile;
exports.sentToftp=sentToftp;
exports.parsefeed=parsefeed;
exports.sentOrWrite=sentOrWrite;
exports.writetoFile=writetoFile;
exports.creatfolder=creatfolder;
exports.sentToPage=sentToPage;
exports.sentErrPage=sentErrPage;
exports.httprequest=httprequest;
exports.fetchfeed=fetchfeed;
exports.reqhttpCB=reqhttpCB;
exports.obj2str=obj2str;