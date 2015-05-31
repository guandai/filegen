var nodemailer = require("nodemailer");
var fs = require('fs');
var smt = require("./smt");
var transporter = {}
var util = require('util')
var emailsetting = {}
fs.readFile(__dirname + '/../settings/emailsetting.json', function(err, filedata) {
    emailsetting = JSON.parse(filedata)
    emailsetting.email_jobpath = __dirname + '/../emails/'

    transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: emailsetting.email_user,
            pass: emailsetting.email_pass
        }
    });
});



function sentTagsEmail(opt) {
    // setup e-mail data with unicode symbols
    //   change  < and >  to coded,  save to file
    var es = opt.emailsetting || emailsetting
    opt.email_jobpath = es.email_jobpath

    var setArary = ["email_sender", "mailPrefix", "email_toaddr", "email_subject", "email_jobpath"]
    for (var i in setArary) {
        var k = setArary[i]
        es[k] = opt[k] || es[k]
    }

    var email_str = exportToFile(opt, sentWithAttch)

    function sentWithAttch(opt) {
        var mailOptions = {
            from: es.email_sender,
            to: es.email_toaddr, // list of receivers
            subject: es.mailPrefix + es.email_subject, // Subject line
            text: email_str, // plaintext body
            html: genhtmlbody(email_str), // html body
            attachments: [{ // file on disk as an attachment
                filename: "email.txt",
                path: opt.emailParamFilePath
            }]
        };

        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Message sent: ' + info.response);
            }
        });
    }

}



/*
    list all params in current job
*/
function exportToFile(opt, cb) {

    var jobstrings = "";
    var avoidarr = ["avoidKey"];
   
    for (var jobi in opt) {
        if (avoidarr.indexOf(jobi) < 0) {
   
           jobstrings += jobi + " : " + "\n" + util.inspect(opt[jobi]) + "\n";
   
        }
    }

    opt.errSMS = opt.errSMS || "a default Message"
    opt.emailParamFilePath = opt.email_jobpath + smt.gettime() + "_email.txt"
    var exportString = opt.errSMS + "\nCurrent Job Details:\n" + jobstrings

    fs.writeFile(opt.emailParamFilePath, exportString, function(err) {
        if (err) {
            smt.tr(err);
            cb(opt)
        } else {
            smt.tr("The file was saved! :", opt.email_jobpath + "email.txt");
            cb(opt)
        }
    });
    return exportString;
}


function genhtmlbody(emailstr) {
    var codedhtml = emailstr.replace(/</g, "&lt;");
    codedhtml = codedhtml.replace(/>/g, "&gt;");
    // insert <br> after </a>
    codedhtml = codedhtml.replace("&lt;a ", "<h2>&lt;a ");
    codedhtml = codedhtml.replace("&lt;/a&gt;", "&lt;/a&gt;</h2>\n\n");
    codedhtml = codedhtml.replace(/&gt;&lt;/g, "&gt;\n&lt;");
    codedhtml = codedhtml.replace(/\n/g, "\n<br>\n");
    codedhtml = "\n\n\n<html>" + "\n<br>\n<p>\n" + codedhtml + "\n</p>\n<br>\n" + "No reply this mail" + "\n<br>\n</html>\n\n\n";
    //console.log(codedhtml)
    return codedhtml;
}


exports.exportToFile = exportToFile;
exports.sentTagsEmail = sentTagsEmail;
