var express = require('express');
var router = express.Router();

var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var exec = require('exec');
var uploadedfilename="";
var mysql = require('mysql');
var pngname="";
//var datetime = new Date();






router.get('/', function(req, res, next) {
    res.render('index', { filename: '',visibility:'hidden',errmsg:"" ,datacnf:""});
    //res.sendFile(path.join(__dirname, 'views/index.html'));
});
router.get('/tagetDiagram', function(req, res, next) {
    res.render('index', { filename: '',visibility:'hidden',errmsg:"" ,datacnf:""});
    //res.sendFile(path.join(__dirname, 'views/index.html'));
});




router.post('/taupload', function(req, res) {

        // create an incoming form object
        var form = new formidable.IncomingForm();
        var datetime = Date().replace(/\s/g, '').substring(0, 20);

        // specify that we want to allow the user to upload multiple files in a single request
        form.multiples = true;

        // store all uploads in the /uploads directory
        form.uploadDir = path.join(__dirname, '/javaa');

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

    router.post('/tagetDiagram',function (req,res,next){

        var filename = uploadedfilename;

        if(filename=="")
        {
            // res.send(500,'showAlert')
           // res.redirect(index.ejs);

            res.render('index', {filename:"",visibility:'hidden',errmsg:"Please upload file."});

        }
        else {
            var datetime = Date().replace(/\s/g, '').substring(0, 20);
            var foldername = filename.substring(0, filename.lastIndexOf('.'));
            pngname ="tenanta.svg";

            var dir = __dirname+"/javaa/";
            var jar = dir+"UMLParser.jar";
            var fpath = dir+filename;

            console.log(jar);
            console.log(fpath);
            exec('unzip '+dir+filename+' -d '+dir,function (error, stdout, stderr) {
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                if (error !== null) {
                    console.log('exec error: ' + error);

                }
            });


                        exec('java -jar '+dir+'UMLParser.jar '+dir+foldername+' '+dir+pngname,
                            function (error, stdout, stderr) {
                                console.log('stdout: ' + stdout);
                                console.log('stderr: ' + stderr);
                                if (error !== null) {
                                    console.log('exec error: ' + error);

                                }


                                res.render('index', {filename:'/javaa/'+pngname,visibility:'visible',errmsg:"Diagram:",datacnf:""});
                                uploadedfilename="";
                                filename="";




                });

        }

        });




router.post('/tagetScore',function (req,res,next) {

    var score =( req.body.score).toString();
    console.log(score);
    var haserr = 0;


    var connection = mysql.createConnection({

        host : 'graderabcd.crcfwhhjhczu.us-west-2.rds.amazonaws.com',
        user : 'root',
        password : 'rootroot',
        database : 'grader'

    });
    if (score.length == 0)
    {
        res.render('index', {filename:"/javaa/"+pngname,visibility:'visible',errmsg:"Diagram:",datacnf:"Please Enter your comments."});


    }
    else
    {
        connection.connect(function (error) {
            if (!error)
            {
                console.log("successfull connection");
                connection.query("INSERT INTO `grader`.`TENANT_DATA` (`TENANT_ID`, `TENANT_TABLE`, `COLUMN_1`) VALUES ('TA', 'TenantA', '"+score+"');",function (error) {
                    if (error)
                    {
                        console.log("Data not inserted"+error);
                        haserr = 0;
                    }
                    else
                    {
                        console.log("Data Successfully inserted ");
                        haserr = 1 ;

                    }

                });

            }
            else
            {
                console.log("Not Connected");
                haserr = 0;
            }

        })
        if(haserr)
        {
            res.render('index', {filename:"/javaa/"+pngname,visibility:'visible',errmsg:"Diagram:",datacnf:"something went wrong !!"});

        }
        else
        {
            res.render('index', {filename:"/javaa/"+pngname,visibility:'visible',errmsg:"Diagram:",datacnf:"Tenant is graded successfully."});

        }
    }


});


module.exports = router;
