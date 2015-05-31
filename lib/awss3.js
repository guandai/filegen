// aws prepare
var AWS = require('aws-sdk');
var fs = require('fs');
var smt = require('./smt');
var tr = smt.tr;
var tc = smt.tc;
var trace = smt.tr;

AWS.config.loadFromPath( __dirname + '/../settings/s3credentials.json');
//AWS.config.update({ region : 'eu-west-1' });
var s3 = new AWS.S3();

/*
 * directly put data to s3 : option.uploadData @param{obj} option , current option object
 * current job object, option, callback
 */
function s3uploadDirect( option, callback) {
    // use local var would cross use REM
    tr("s3uploadDirect start.." );
    option.fileSizeInBytes = option.uploadData.length;
    var inoption= smt.clone(option)

    var s3data = {
        Bucket: option.s3putbucket,
        Key: option.s3putkey,
        Body: option.uploadData,
        CacheControl: 'max-age=300',
        ACL: 'public-read',
        ContentType: option.contenttype
    };

    var puts3cb = function(err, data) {
        var option = inoption
        if (err) {
            smt.assignErr(option, err , callback)  
        } else {
            tr( "Successfully uploaded data as: \n" + option.s3putbucket + ".s3.amazonaws.com/" + option.s3putkey )
            tr( "file size is " + smt.shortenunit( option.fileSizeInBytes ) ) ;
            tc( "s3uploadDirect", data )
            option.s3response = data
            
            if (callback) {
                callback(option);
            };
        };
    }

    s3.putObject(s3data, puts3cb);
};

/*
 * upload data to s3 from a local file :  option.localpathfilename @param{obj} cjb ,
 * current job object, option, callback
 */
function s3upload(option, callback) {
    tr("s3upload start..");

    // use local var would cross use REM
    var fileSizeInBytes = fs.statSync( option.localpathfilename )["size"];
    var inoption= smt.clone(option)
    
    var s3uploadCB = function(err, filedata) {
        var option = inoption
        if (err) {
            tr("readFile meet error:");
            smt.assignErr(option, err)
        } else {
            // define s3 object
            tr("current s3key ", option.s3putkey)
            option.uploadData = filedata
            s3uploadDirect(option, callback)
        }
    }

    fs.readFile( option.localpathfilename , s3uploadCB);
};


/*
 * a wrapper of S3getobject with parameters
 * current job object, option, callback
 */

function getobject(option, callback) {
    
    tr("getobject option.s3getkey", option.s3getkey);

	var inoption= smt.clone(option)
    var madeS3cb = function(err, data) {
        var option = inoption
        if (err) {
            smt.assignErr(option, err)
            tr("! getobject has error , file not download:" , option.curkey)
            callback(option);
        } else {
             option.returnBody  = data.Body;
             callback(option);
        };
        //  console.log(data.Body.toString("utf8"));   // successful response		
    }
    
    s3.getObject({
            Bucket: option.s3getbucket,
            Key: option.s3getkey
        },
        madeS3cb
    );
};


/*
 * a wrapper of S3listObjects with parameters
 * current job object, option, callback
 */
function listobjects(option, callback) {
    option.s3listfolder = option.s3listfolder
    var params = {
        Bucket: option.s3getbucket,
        /* required */
        Delimiter: ',',
        MaxKeys: 9999,
        Prefix: option.s3listfolder
    };
    keyarray = [];
    s3.listObjects(params, function(err, data) {
        if (err) {
            smt.assignErr(option, err)
        }
        else {
            console.log("find files:", smt.shortenunit(data.Contents.length));
            for (var c in data.Contents) {
                keyarray.push(data.Contents[c].Key);
            };
            option.keyarray = keyarray;
            callback(option);
        };
    });
};


exports.listobjects = listobjects;
exports.getobject = getobject;
exports.s3upload = s3upload;
exports.s3uploadDirect = s3uploadDirect;
