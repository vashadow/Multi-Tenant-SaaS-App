var express = require('express');
var router = express.Router();

var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var exec = require('exec');
var uploadedfilename="";
//var datetime = new Date();






router.get('/', function(req, res, next) {
    res.render('index', { filename: '',visibility:'hidden',errmsg:"" });
    //res.sendFile(path.join(__dirname, 'views/index.html'));
});
router.get('/getDiagram', function(req, res, next) {
    res.render('index', { filename: '',visibility:'hidden',errmsg:"" });
    //res.sendFile(path.join(__dirname, 'views/index.html'));
});




router.post('/upload', function(req, res) {

        // create an incoming form object
        var form = new formidable.IncomingForm();
        var datetime = Date().replace(/\s/g, '').substring(0, 20);

        // specify that we want to allow the user to upload multiple files in a single request
        form.multiples = true;

        // store all uploads in the /uploads directory
        form.uploadDir = path.join(__dirname, '/java');

        // every time a file has been uploaded successfully,
        // rename it to it's orignal name
        form.on('file', function (field, file) {
            fs.rename(file.path, path.join(form.uploadDir, file.name));
            uploadedfilename = file.name;

        });

        // log any errors that occur
        form.on('error', function (err) {
            console.log('An error has occured: \n' + err);
        });

        // once all the files have been uploaded, send a response to the client
        form.on('end', function () {
            res.end('success');
        });

        // parse the incoming request containing the form data
        form.parse(req);
    });

    router.post('/tbgetDiagram',function (req,res,next){

        var filename = uploadedfilename;

        if(filename=="")
        {
            // res.send(500,'showAlert')
           // res.redirect(index.ejs);

            res.render('index', {filename:"",visibility:'hidden',errmsg:"Please upload file."});

        }
        else {

            var fnwe = filename.substring(0, filename.lastIndexOf('.'));
            var pngname = fnwe + ".png";
            var jar = __dirname+"/java/sequence-10.0.jar";
            var fpath = __dirname+"/java/"+filename;
            console.log(jar);
            console.log(fpath);
            exec('java -Dzanthan.prefs=diagram.preferences -jar '+jar+ ' --headless '+fpath,
                function (error, stdout, stderr) {
                    console.log('stdout: ' + stdout);
                    console.log('stderr: ' + stderr);
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }
                    res.render('index', {filename:pngname,visibility:'visible',errmsg:"Diagram:"});
                    uploadedfilename="";
                    filename="";

                });

        }

        });


module.exports = router;
