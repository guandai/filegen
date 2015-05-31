var winston = require('winston');
var request = require('request');
var util = require('util');
var mkpath = require('mkpath')



creatfolder("../log")

/*
 * create folder by a given path and set 0777 access @param{obj} cjb , current
 * job object
 */
function creatfolder(folderstr) {
    mkpath(folderstr, function(err) {
        if (err) {
            if (err.toString().indexOf("EEXIST") >= 0) {
                tr("! Folder is exist " + err);
            }
        } else {
            tr("# FOLDER: " + folderstr + " created");
        }
    });
    mkpath.sync(folderstr, 0777);

}

/*
 * replace by peer in allsettings
 */

function replacepeer(replace_peer, str) {
    //var result=str.toString()

    replace_peer_regex = obj2reg(Object.keys(replace_peer).map(function(str) {
        return str.splice(0, "\\").splice(-1, "\\")
    }))
    //tr(replace_peer_regex)
    while (replace_peer_regex.test(str)) {
        for (var r in replace_peer) {
            str = str.replaceAll(r, replace_peer[r])
        }
    }

    return str
}

var util = require('util');

function tru(obj, dep, show) {
    //for (var i in arguments){
    console.log(util.inspect(obj, {
        showHidden: show,
        depth: dep
    }));
    //}
}


function trn() {
    for (var i in arguments) {
        var str = arguments.callee.caller[arguments[i]]
        var estr = eval(strcom)
        var eestr = arguments.callee.caller[eval(estr)]
        console.log.apply(this, [estr + ":", eestr])
    }
}

function tranHtml2Txt(str) {
    return str.replaceall("&amp;", "&")
        .replaceall("&quot;", '"')
        .replaceall("&gt;", ">")
        .replaceall("&lt;", "<")
        .replaceall("&#39;", "'")
        .replaceall("&#248;", "ø")
        .replaceall("&#229;", "å")
        .replaceall("&#230;", "æ")
}
exports.tranHtml2Txt = tranHtml2Txt

/*
 * console.log wrapper
 */
function trl() {
    //var allstr="";
    for (var i in arguments) {
        console.log(arguments[i])
            //  allstr+= arguments[i] + " " ;
    }

}

function trmem() {
    var pmem = process.memoryUsage()
    for (var i in pmem) {
        pmem[i] = shortenunit(pmem[i])
    }
    tr("----Memory:", util.inspect(pmem), "------");
}



/*
 * console.log wrapper
 */
function trn(obj) {
    var objname = arguments.callee.caller
    console.log(objname)
    for (var i in arguments) {
        console.log(objname, obj)
            //  allstr+= arguments[i] + " " ;
    }
}


/*
 * trace 
 */
function tr() {
    var allstr = "";
    for (var i in arguments) {
        allstr += arguments[i] + " ";
    }
    logger.log("info", allstr);
}

function tc() {
    console.log.apply(null, arguments)
}

var logger = new(winston.Logger)({
    transports: [
        new(winston.transports.Console)(),
        new(winston.transports.File)({
            filename: '../log/serverlog.log'
        })
    ]
});

/*
 * find an object  size / length
 * @param{objet} obj          , current job
 * @return{int} count         , a size number in byte
 */
function osize(obj) {
    var count = 0;
    for (var i in obj) {
        count++;
    }
    return count;
}


/*
 * compare if a array in anoterh array, if A in B
 * @param{array} arra         ,  A array 
 * @param{array} arrb         ,  B array 
 * @return{boolean} result    , in or not in
 */
function arrainbtest(arra, arrb) {
    var testf = true
    for (var a in arra) {
        var testeach = false
        for (var b in arrb) {
            if (arra[a] == arrb[b]) testeach = true
        }
        if (testeach == false) {
            testf = false;
            break
        }
    }
    return testf;
}



/*
 * create array  which only A have plus which only B have
 * @param{array} arra         ,  A array 
 * @param{array} arrb         ,  B array 
 * @return{array} arrd    ,  A  B different parts
 */
function arradiffb(arra, arrb) {
    var arrd = []
        // var  arragt=[]
        // var  arrbgt=[]
        // var  arrbin=[]

    for (var a in arra) {
        var testaeqb = false
        for (var b in arrb) {
            if (arra[a] == arrb[b]) {
                testaeqb = true
                    //      arrbin.push(arra[a])
            }
        }
        if (testaeqb == false) {
            //  arrgt.push(arrb[a])     
            arrd.push(arra[a])
        }
    }

    for (var b in arrb) {
        var testaeqb = false
        for (var abi in arrbin) {
            if (arrb[b] == arrbin[abi]) {
                testaeqb = true
            }
        }
        if (testaeqb == false) {
            //  arrbgt.push(arrb[b])
            arrd.push(arrb[b])
        }
    }

    return arrd;
}

/*
 * create array  which only A over B 
 * @param{array} arra         ,  A array 
 * @param{array} arrb         ,  B array 
 * @return{array} arrd    ,  A  B same parts
 */
function arraoverb(arra, arrb) {

    // var  arragt=[]
    // var  arrbgt=[]
    var arrbin = []

    for (var a in arra) {
        var testaeqb = false
        for (var b in arrb) {
            if (arra[a] == arrb[b]) {
                testaeqb = true
                arrbin.push(arra[a])
            }
        }
    }
    return arrbin;
}

/*
 * create array  which A more than B
 * @param{array} arra         ,  A array 
 * @param{array} arrb         ,  B array 
 * @return{array} arrm    ,  A more than B
 */
function arragtb(arra, arrb) {
    var arrm = []
    for (var a in arra) {
        var testeach = false
        for (var b in arrb) {
            if (arra[a] == arrb[b]) testeach = true
        }
        if (testeach == false) arrm.push(arra[a])
    }
    return arrm;
}


/*
 * clone an object  another version
 * @param{object} obj         , current job
 */
function cloneobj(obj1) {
    var extend = util._extend;
    var obj2 = extend({}, obj1);
    return obj2;
}


/*
 * clone an object
 * @param{object} obj         , current job
 */
function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}


/**
 *  convert obj to arr.
 *  @param{obj} org obj   , 
 *  @return{array}          ,  
 */
function obj2arr(obj) {
    var arr = []

    for (var o in obj) arr.push(obj[o])
    return arr

}


/**
 *  convert obj to regular exp.   expect obj is list of string 
 *  @param{obj} org obj   , 
 *  @return{regexp}          ,  
 */
function obj2reg(obj) {
    var reg = ""
    for (var o in obj) {
        reg += obj[o] + "|"
    }
    reg = new RegExp(reg.slice(0, -1))

    return reg
}


/**
 *  change seconts to higher time unit.
 * @param{number} seconds       , original text to be cutyed
 * @return{String}          ,  a combination text of hour  minutes and seconds
 */
function secondsToString(seconds) {
    if (!seconds) {
        seconds = 0;
    }
    var numyears = Math.floor(seconds / 31536000);
    var numdays = Math.floor((seconds % 31536000) / 86400);
    var numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
    var numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
    var numseconds = Math.floor((((seconds % 31536000) % 86400) % 3600) % 60);
    return numhours + " h " + numminutes + " m " + numseconds + " s";

}

/*
 * trace 1st level content in an object
 * @param{objet} obj          , current job 
 */
function tobj(inobject, varname, end) {

    if (typeof inobject == "string") {
        tr(inobject);
    } else {
        varname = varname || "noNameObj";
        var inlength = 0;
        for (var c in inobject) {
            inlength++;
        }

        tr("there are " + inlength + " objects in " + varname);
        end = end || inlength;

        var count = 0;
        for (var j in inobject) {
            count++;
            if (end >= count) {
                tr("tobj " + varname + ": " + j + ": " + inobject[j]);
            }
        }
    }
}


/*
 * do something useful for buffers  when loading a uri
 * @param{string} str         , a input str need to be translate
 * @param{object} dictobj     , a object include map as a dict
 * @return{string} str        ,  return the translated str 
 */

function translatestr(str, dictobj) {
    for (var d in dictobj) {
        str = str.replace(d, dictobj[d]);
    }
    return str;
};


/*
 * do something useful for buffers  when loading a uri
 * @param{string} uri         , load this uri
 * @param{string} filename    , save to this file 
 * @param{object} job         , current job object
 * @param{function} callback  , callback
 */
function downreq(uri, filename, job, callback) {
    request(uri.toString()).pipe(fs.createWriteStream(filename.toString())).on('close', function() {
        callback(job);
    });
};


/*
 * join several obj and convert to array
 * @param{array} orgarr   ,  multipal array can be used as params, which need to be join togething
 * @return{array} newarr  ,   join several obj and convert to array 
 */

function joinAsArray(orgarr) {
    // get first array as target array
    var newarr = [];
    for (var o in orgarr) {
        newarr.push(orgarr[o]);
    }
    // get rest arrays
    var extarr = [].slice.call(arguments, 1); // choose all additional args , Array.prototype.slice.call(arguments,1)
    for (var e in extarr) {
        for (var key in extarr[e]) {
            newarr.push(extarr[e][key]);
        }
    };
    return newarr;
}

/*
 * convert a function to a object, which can use call backs with parameter
 * @param{function} infunc   ,  a function need to be convert
 * @attribute{function} callback   ,  a single function or multiple functino in an array.
 * @return{object} this  ,  a object that support .callback
 */

function func2obj(infunc) {
    //initial args

    this.cjb = {};
    this.opt = {};
    this.opt.id = 0;
    this.infunc = infunc;
    this.content = infunc.toString();
    this.firstline = this.content.match(/function.*/)[0];
    this.funname = this.firstline.match(/\s.*?\s?(?=\()/)[0].match(/\S+/)[0];
    var its = this;

    this.run = function() {
        var lastargs = arguments.length - 1;
        var opt = arguments[lastargs];
        its.startpart(opt.id);
        var newargs = joinAsArray(arguments, [its.callbacks]);
        infunc.apply(this, newargs);
    };
    // callbacks arguments is assigned in real functions, normally it is callback(cjb, opt) ,  callback.apply(this, [].slice.call(arguments,  0, arguments.length-2)
    this.callbacks = function() {
        // when call a callback in a function, the last param should always be a opt object
        var id = arguments[arguments.length - 1].fid;
        its.endpart(id);
        if (its.callback) {
            if (typeof its.callback == "function") {
                its.callback = [its.callback];
            }
            //tr(">"+ funname + " has "+ callback.length +" callbacks")
            for (var f in its.callback) {
                //tr("> Start ", (parseInt(f)+1) , "/" , callback.length , " callbacks of" , funname ,"] for task id", id ," :\n")
                if (typeof its.callback[f] != "function") {
                    tr("No callback need to run !");
                } else {
                    its.callback[f].apply(this, arguments);
                }
            }
        } else {
            // tr("All callbacks finished!  task id: " + id + "\n")
        };
    };
    // log initialing a input function
    this.startpart = function(id) {
        //tr(">>SSS Start of [",its.funname,"] for task id", id );
    };
    this.endpart = function(id) {
        //tr(">>EEE   End of [",its.funname,"] for task id", id , ", and start callback...\n");
    };
}

////////////////////////////////////

//var charsetDetector = require("node-icu-charset-detector");
// function testcharset(returnBody){
//          var buffer = new Buffer(returnBody)
//          var charset = charsetDetector.detectCharset(buffer);
//          smt.tr("charset before",charset)

//          //opt.returnbody = encoding.convert(opt.returnbody, "iso-8859-1","UTF-8");

//          buffer = new Buffer(opt.returnbody)
//          charset = charsetDetector.detectCharset(buffer);
//          smt.tr("charset before",charset)
//          smt.tr(buffer)
// }
//exports.testcharset=testcharset




/*
 * common use for put err in option for cb refer
 * @param{option} object for current running process o refer
 * @param{err}   err we focusing on 
 * @return{option} 
 */
function assignErr(option, err , callback){
    option.err = err
    console.log(err, err.stack); // an error occurred
    if(callback) callback(option)
    return option 
}

/*
 * run in serials
 */
function runcbsfn(funcArr) {
    var funcObjArr = []
    for (var f = 0; f < funcArr.length - 1; f++) {
        //tr(f)
        //tr(funcArr[f])
        var newobj = new func2obj(funcArr[f])
        funcObjArr.push(newobj)
    };
    tr(funcObjArr.length)
    runcbs(funcObjArr)
    return funcObjArr
};


/*
 * run a serial of callbackk in an array , each cb has .run method.
 * this need to be runing with func2Obj to impliment a sync process
 * @param{funcArr} Array with str   ,  a number or string of function name
 * @return{null} 
 */
function runcbs(funcArr) {
    for (var f = 1; f < funcArr.length; f++) {
        var setflag = 0;
        var funcObj = {}; //  a temp obj to store callback obj of next function 
        if (!(funcArr[f] instanceof Array)) {
            funcArr[f] = [funcArr[f]];
        }
        for (var r in funcArr[f]) {
            if (typeof funcArr[f][r].run == "function") {
                // set a temp or current child in child
                funcObj = funcArr[f][r];
                // overwirte current to its own run 
                funcArr[f][r] = funcArr[f][r].run;
                setflag = 1;
            };
        };
        funcArr[f - 1].callback = funcArr[f];
        // set current object  to the lastest in funcArr[f] which has run
        if (setflag == 1) {
            funcArr[f] = funcObj;
        };
    };
};


/*
 * add params for a callback
 * @param{function} infunc   ,  original callback function
 * @attribute{int} length   ,  the expected length
 * @return{string} str  ,  return result string 
 */
var makecb = function(infunc) {
    var restargs = [];
    for (var a = 1; a < arguments.length; a++) {
        restargs.push(arguments[a]);
    }
    //console.log("customized arguments:",restargs)
    var appcb = function() {
        //console.log("inherit arguments:",arguments)
        var newargs = []
        for (var arg in arguments) {
            newargs.push(arguments[arg])
        }
        newargs = newargs.concat(restargs)
            //  console.log("new arguments:",newargs)
        infunc.apply(null, newargs);
    };
    return appcb;
};


/*
 * copy appendObj data to orgObj, if the same , 
 * appendObjs content will overwrite orgobj content
 * @param{object} orgObj   ,  original object
 * @attribute{object} appendObj   ,  the  addon object
 * @return{object} orgObj  ,  return result object
 */
var mergeobj = function (orgObj, appendObj){
    for (var o in appendObj){
        orgObj[o] = appendObj[o]
    }
    return orgObj
}

/*
 * convert a string to expect length 
 * @param{mix} str   ,  a number or string need to be adept 
 * @attribute{int} length   ,  the expected length
 * @return{string} str  ,  return result string 
 */
function tolen(str, length) {
    str = str.toString();
    if (str.length < length) {
        str = "0" + str;
        tolen(str, length);
    }
    if (str.length > length) {
        str = str.substring(1);
        tolen(str, lengtsh);
    }
    return str;
}


/*
 * get the max number in an array 
 * @param{Array} numArray   ,  a number or string need to be adept 
 * @return{Int} return  ,  return max of result number
 */
function getMaxOfArray(numArray) {
    return Math.max.apply(null, numArray);
}


/*
 *  return a yy+"_"+mm+"_"+dd+"_"+hh+"_"+mi+"_"+ss  string
 */
function gettime(cut) {

    var ms = new Date()
    var yy = ms.getYear().toString().substring(1)
    var mm = filldigits(ms.getMonth() + 1, 2)
    var dd = filldigits(ms.getDate(), 2)

    var hh = filldigits(ms.getHours(), 2)
    var mi = filldigits(ms.getMinutes(), 2)
    var ss = filldigits(ms.getSeconds(), 2)
    var result = yy + mm + dd + "-" + hh + mi + ss
    if (!cut) cut = result.length
    return result.substring(0, cut)
}

/*
 *  fill 0 in front of  digits by assigned digits number
 */
function filldigits(str, digits) {
    if (!digits) digits = 2
    str = str.toString()
    while (str.length < digits) {
        str = "0" + str
    }
    return str
}


/*
 *  fill 0 in front of  digits by assigned digits number
 */
function cutdec(str, digits) {
    if (!digits) digits = 2
    str = str.toString()
    var pos = str.indexOf(".")
    str = str.substring(0, pos + digits)
    return str
}

/*
 *  show size in mb gb
 */
function shortenunit(num) {

    if (typeof num != "number") num = parseInt(num)
    if (num > Math.pow(1024, 1) && num < Math.pow(1024, 2)) return cutdec(num / Math.pow(1024, 1), 2).toString() + " KB"
    if (num > Math.pow(1024, 2) && num < Math.pow(1024, 3)) return cutdec(num / Math.pow(1024, 2), 2).toString() + " MB"
    if (num > Math.pow(1024, 3) && num < Math.pow(1024, 4)) return cutdec(num / Math.pow(1024, 3), 2).toString() + " GB"
    return num
}


/*
 *  get parent path, return string
 */
function uppath() {
    var workpath = process.cwd()
    return parentpath = workpath.substring(0, workpath.lastIndexOf("/"))
}


/*
 *  get parent path, return string
 */

String.prototype.replaceall = function(search, tostr) {
    return this.split(search).join(tostr);
};


/*
 * insert char in a string
 */
String.prototype.splice = function(idx, rem, s) {
    if (typeof rem == "string") {
        s = rem
        rem = 0
    }
    return (this.slice(0, idx) + s + this.slice(idx + Math.abs(rem)));
};

String.prototype.replaceAll = function(search, tostr) {
    return this.split(search).join(tostr);
};

function finishfn() {
    console.log("Task finished")
}


function trobjmem(object) {

    var objectList = [];
    var stack = [object];
    var bytes = 0;

    while (stack.length) {
        var value = stack.pop();

        if (typeof value === 'boolean') {
            bytes += 4;
        } else if (typeof value === 'string') {
            bytes += value.length * 2;
        } else if (typeof value === 'number') {
            bytes += 8;
        } else if (
            typeof value === 'object' && objectList.indexOf(value) === -1
        ) {
            objectList.push(value);

            for (var i in value) {
                stack.push(value[i]);
            }
        }
    }
    tr(shortenunit(parseInt(bytes)))
    return bytes
}

exports.assignErr=assignErr
exports.trobjmem = trobjmem
exports.trmem = trmem
exports.ffn = finishfn
exports.finishfn = finishfn
exports.tru = tru
exports.trl = trl
exports.trn = trn
exports.replacepeer = replacepeer
exports.runcbsfn = runcbsfn
exports.creatfolder = creatfolder
exports.uppath = uppath
exports.shortenunit = shortenunit
exports.cutdec = cutdec
exports.gettime = gettime
exports.arradiffb = arragtb
exports.arragtb = arragtb
exports.arrainbtest = arrainbtest
exports.arraoverb = arraoverb
exports.getMaxOfArray = getMaxOfArray;
exports.makecb = makecb;
exports.tolen = tolen;
exports.runcbs = runcbs;
exports.tobj = tobj;
exports.tr = tr;
exports.tc = tc;
exports.osize = osize;
exports.joinAsArray = joinAsArray;
exports.func2obj = func2obj;
exports.downreq = downreq;
exports.translatestr = translatestr;
exports.clone = clone;
exports.cloneobj = cloneobj;
exports.secondsToString = secondsToString;
exports.mergeobj = mergeobj