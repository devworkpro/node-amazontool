module.exports = function (app) {
    var bodyParser = require('body-parser');
    var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    var multer = require('multer')
    var path = require('path');
    var flash = require('connect-flash');
    var User = require('../app/models/user');
    var plans = require('../app/models/plans');
    var services = require('../app/models/service');
    var saveEmail = require('../app/models/email');
    var Pages = require('../app/models/pages');

    // Create application/x-www-form-urlencoded parser
    var urlencodedParser = bodyParser.urlencoded({ extended: false })

    var upload = multer({
        dest: path.join(__dirname, '../public/uploads')
    });



    app.post('/upload', upload.single('image'), function (req, res) {
        if (req.file) {
            console.dir(req.file);
            return res.end('Thank you for the file');
        }
        res.end('Missing file');
    });


    app.get('/allmemeber', function isLoggedIn(req, res, next) {


        if (req.isAuthenticated()) {



            User.find({ 'local.role': 'member' }, function (err, person) {
                if (err) return handleError(err);

                res.render('member/allmemeber.ejs', { members: person,layout: 'layoutadmin'});

            });

        }
        else {


            res.redirect('/admin');
        }


    });



    app.get('/addmember', function isLoggedIn(req, res, next) {

        if (req.isAuthenticated()) {

            res.render('member/addmember.ejs', { errors: false, message: false,layout: 'layoutadmin' });


        } else {

            res.redirect('/admin');
        }
    });


    /*var uploading = multer({
      dest: __dirname + '../public/uploads/',
    })*/
    /*app.get('/edititem', function (req, res) {
    
    
    
    
    });*/

    app.post('/action', upload.single('image'), function isLoggedIn(req, res) {
        if (req.isAuthenticated()) {
            if (req.file) {


                User.findByIdAndUpdate(req.body.id, {
                    'local.name': req.body.name, 'local.Company': req.body.Company,
                    'local.email': req.body.email, 'local.address': req.body.address, 'local.password': req.body.password,
                    'local.filename': req.file.filename,
                    'local.state': req.body.state,
                    'local.city': req.body.city,
                    'local.zipcode': req.body.zipcode
                }, function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    else {

                        res.redirect('http://localhost:3000/action?id=' + req.body.id + '&edit=Edit');
                    }
                    /*  console.log("RESULT: " + result);*/
                });

            }
            else {

                User.findByIdAndUpdate(req.body.id, {
                    'local.name': req.body.name, 'local.Company': req.body.Company,
                    'local.email': req.body.email, 'local.address': req.body.address, 'local.password': req.body.password,
                    'local.state': req.body.state,
                    'local.city': req.body.city,
                    'local.zipcode': req.body.zipcode
                }, function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    else {

                        res.redirect('http://localhost:3000/action?id=' + req.body.id + '&edit=Edit');
                    }
                    /*  console.log("RESULT: " + result);*/
                });

            }

        }

    });

    app.get('/action', function isLoggedIn(req, res) {
        if (req.isAuthenticated()) {




            if (req.param('status')) {

                var userid = req.param('id');
                var status = req.param('status');

                User.findByIdAndUpdate(userid, { 'local.status': status }, function (err, place) {
                    return res.redirect('/allmemeber');
                });
            }




            if (req.param('del')) {

                var userid = req.param('id');

                User.findByIdAndRemove(userid, function (err, place) {
                    return res.redirect('/allmemeber');
                });



            }


            if (req.param('edit')) {



                var userid = req.param('id');

                User.findById(userid, function (err, place) {
                    res.render('member/editmember.ejs', { members: place, message: false ,layout: 'layoutadmin'});

                });



            }
        }
        else {
            res.redirect('/admin');


        }
    });




    app.post('/addmember', upload.single('image'), function (req, res) {
        User.find({ 'local.email': req.body.email }, function (err, user) {
            console.log(user);
            if (user.length) {
                res.render('member/addmember', { message: "Email already exist", type: "error",layout: 'layoutadmin'});



            }
            else {

                var saveUser = new User()
                saveUser.local.name = req.body.name

                saveUser.local.Company = req.body.Company
                saveUser.local.email = req.body.email
                saveUser.local.address = req.body.address
                saveUser.local.filename = req.file.filename
                saveUser.local.password = saveUser.generateHash(req.body.password)
                saveUser.local.role = req.body.member
                saveUser.local.state = req.body.state
                saveUser.local.city = req.body.city
                saveUser.local.zipcode = req.body.zipcode
                saveUser.local.status = "Activate"
                saveUser.save(function (err, member) {
                    if (err) {

                        res.send('error');
                    }
                    else {
                        res.render('member/addmember.ejs', { message: "Member added",layout: 'layoutadmin' });


                    }



                });
            }


        });
    });
    /*
      var saveUser = new User()
       saveUser.local.name = req.body.name
    
       saveUser.local.last = req.body.last
      saveUser.local.email = req.body.email
       saveUser.local.address = req.body.address
         saveUser.local.filename      = req.file.filename
    saveUser.local.password = saveUser.generateHash(req.body.password)
     saveUser.local.role = req.body.member
    
      saveUser.local.country = req.body.country
       saveUser.local.state = req.body.state
        saveUser.local.city = req.body.city
         saveUser.local.zipcode = req.body.zipcode
         saveUser.local.status=""
        saveUser.save(function(err, member){
            if(err){
                   res.send('error');
            }
            else{
    res.render('member/addmember.ejs', { message: req.flash('member added') });
    
    
            }*/
    /*  console.log(req.file.filename);*/
    /*        if(err)
             res.render('show_message', {message: "Database error", type: "error"});
             else
             res.render('show_message', {message: "New person added", type: "success"});*/


    /* 
   });*/
    /////////////////////////////Subscription plan//////////////



    app.get('/addplan', function isLoggedIn(req, res, next) {

        if (req.isAuthenticated()) {

            services.find({ 'status': "Activate" }, function (err, data) {
                if (err) return handleError(err);
                return res.render('plan/addplan.ejs', { serv: data, message: false,layout: 'layoutadmin'});

            });
        } else {

            res.redirect('/admin');

        }

        /* return res.render('plan/addplan.ejs');*/


    });





    app.post('/addplan', function (req, res) {
        console.log(req.body);
        var saveplan = new plans()
        saveplan.name = req.body.name
        saveplan.price = req.body.price
        saveplan.Time = req.body.Time
        saveplan.Service = req.body.data

        saveplan.status = "Activate"
        saveplan.Description = req.body.Description

        saveplan.save(function (err, data) {
            if (err) {
                res.send('error');
            }
            else {

                return res.redirect('/addplan');

            }

        });


    });

    app.get('/allplan', function isLoggedIn(req, res, next) {


        if (req.isAuthenticated()) {

            plans.find(function (err, data) {
                if (err) return handleError(err);
                console.log(data);
                res.render('plan/allplan.ejs', { plans: data,layout: 'layoutadmin'});

            });

        }
        else {


            res.redirect('/admin');
        }


    });


    app.get('/planaction', function isLoggedIn(req, res) {

        if (req.isAuthenticated()) {



            if (req.param('status')) {

                var userid = req.param('id');
                var status = req.param('status');

                plans.findByIdAndUpdate(userid, { 'status': status }, function (err, place) {
                    return res.redirect('/allplan');
                });
            }




            if (req.param('del')) {

                var userid = req.param('id');

                plans.findByIdAndRemove(userid, function (err, place) {
                    return res.redirect('/allplan');
                });



            }


            if (req.param('edit')) {

                var userid = req.param('id');

                plans.findById(userid, function (err, place) {

                    services.find({ 'status': "Activate" }, function (err, data) {
                        if (err) return handleError(err);
                        return res.render('plan/editplan.ejs', { serv: data, plan: place,layout: 'layoutadmin'});

                    });
                });



            }
        }
        else {

            res.redirect('/admin');
        }
    });
    app.post('/planaction', function (req, res) {


        plans.findByIdAndUpdate(req.body.id, {
            'name': req.body.name, 'price': req.body.price, 'Time': req.body.Time,
            'Service': req.body.data, 'Description': req.body.Description,
        }, function (err, result) {
            if (err) {
                console.log(err);
            }
            else {
                res.redirect('http://localhost:3000/planaction?id=' + req.body.id + '&edit=Edit');

            }
            /*        return  res.redirect('/allplan');
            */      /*  console.log("RESULT: " + result);*/
        });


    });

    /////////////////////////////Service management//////////////

    app.get('/addservice', function isLoggedIn(req, res, next) {

        if (req.isAuthenticated())




            return res.render('service/addservice.ejs', { message: false,layout: 'layoutadmin'});

        res.redirect('/admin');
    });


    app.post('/addservice', function (req, res) {
        console.log(req.body);
        var service = new services()

        service.name = req.body.name
        service.status = "Activate"
        service.Description = req.body.Description

        service.save(function (err, data) {
            if (err) {
                res.send('error');
            }
            else {

                return res.render('service/addservice.ejs', { message: "Serivce added successfully", type: "success",layout: 'layoutadmin'});

            }

        });


    });

    app.get('/allservice', function isLoggedIn(req, res, next) {


        if (req.isAuthenticated()) {

            services.find(function (err, data) {
                if (err) return handleError(err);
                console.log(data);
                res.render('service/allservice.ejs', { plans: data,layout: 'layoutadmin'});

            });

        }
        else {


            res.redirect('/admin');
        }


    });

    /////




    app.get('/serviceaction', function isLoggedIn(req, res) {

        if (req.isAuthenticated()) {




            if (req.param('status')) {

                var userid = req.param('id');
                var status = req.param('status');

                services.findByIdAndUpdate(userid, { 'status': status }, function (err, place) {
                    return res.redirect('/allservice');
                });
            }




            if (req.param('del')) {

                var userid = req.param('id');

                services.findByIdAndRemove(userid, function (err, place) {
                    return res.redirect('/allservice');
                });



            }


            if (req.param('edit')) {

                var userid = req.param('id');

                services.findById(userid, function (err, place) {

                    res.render('service/editservice.ejs', { service: place,layout: 'layoutadmin'});

                });



            }
        }
        else {

            res.redirect('/admin');
        }

    });


    //////// Email management  ////////////////


    app.get('/addemail', function isLoggedIn(req, res, next) {

        if (req.isAuthenticated())




            return res.render('email/addemail.ejs', { message: false,layout: 'layoutadmin'});

        res.redirect('/admin');
    });

    app.post('/addemail', function (req, res) {

        var semail = new saveEmail()

        semail.name = req.body.name
        semail.status = "Activate"
        semail.content = req.body.content

        semail.save(function (err, data) {
            if (err) {
                res.send('error');
            }
            else {

                return res.render('email/addemail.ejs', { message: "email added successfully",layout: 'layoutadmin',type: "success" });

            }

        });


    });
    app.get('/allemail', function isLoggedIn(req, res, next) {


        if (req.isAuthenticated()) {


            saveEmail.find(function (err, data) {
                if (err) return handleError(err);
                console.log(data);
                res.render('email/allemail.ejs', { plans: data,layout: 'layoutadmin'});

            });

        }
        else {


            res.redirect('/admin');
        }


    });

    app.get('/emailaction', function isLoggedIn(req, res) {

        if (req.isAuthenticated()) {



            if (req.param('status')) {

                var userid = req.param('id');
                var status = req.param('status');

                saveEmail.findByIdAndUpdate(userid, { 'status': status }, function (err, place) {
                    return res.redirect('/allemail');
                });
            }




            if (req.param('del')) {

                var userid = req.param('id');

                saveEmail.findByIdAndRemove(userid, function (err, place) {
                    return res.redirect('/allemail');
                });



            }


            if (req.param('edit')) {

                var userid = req.param('id');

                saveEmail.findById(userid, function (err, place) {

                    res.render('email/editemail.ejs', { email: place,layout: 'layoutadmin'});

                });



            }
        }
        else {

            res.redirect('/admin');
        }
    });

    //////////////////

    app.get('/addpage', function isLoggedIn(req, res, next) {

        if (req.isAuthenticated())
            return res.render('pages/addpage.ejs', { message: false,layout: 'layoutadmin'});

        res.redirect('/admin');
    });

    app.post('/addpage', function (req, res) {

        var page = new Pages()

        page.name = req.body.name
        page.PageSlug = req.body.PageSlug
        page.status = "Activate"
        page.content = req.body.content

        page.save(function (err, data) {
            if (err) {
                res.send('error');
            }
            else {
                return res.render('pages/addpage.ejs', { message: "Page added successfully",layout: 'layoutadmin',type: "success" });
            }

        });


    });
    app.get('/allpage', function isLoggedIn(req, res, next) {


        if (req.isAuthenticated()) {

            Pages.find(function (err, data) {

                if (err) return handleError(err);
                console.log(data);
                res.render('pages/allpage.ejs', { plans: data,layout: 'layoutadmin'});

            });

        }
        else {


            res.redirect('/admin');
        }


    });

    app.get('/pageaction', function isLoggedIn(req, res) {



        if (req.isAuthenticated()) {


            if (req.param('status')) {

                var userid = req.param('id');
                var status = req.param('status');

                Pages.findByIdAndUpdate(userid, { 'status': status }, function (err, place) {
                    return res.redirect('/allpage');
                });
            }




            if (req.param('del')) {

                var userid = req.param('id');

                Pages.findByIdAndRemove(userid, function (err, place) {
                    return res.redirect('/allpage');
                });



            }


            if (req.param('edit')) {

                var userid = req.param('id');

                Pages.findById(userid, function (err, place) {

                    res.render('pages/editpage.ejs', { data: place,layout: 'layoutadmin'});

                });



            }
        }
        else {


            res.redirect('/admin');
        }
    });

    app.post('/pageaction', function (req, res) {
      
        Pages.findByIdAndUpdate(req.body.id, { 'name': req.body.name, 'PageSlug': req.body.PageSlug, 'content': req.body.content }, function (err, result) {
            if (err) {
                console.log(err);
            }
            else {
                res.redirect('/pageaction?id=' + req.body.id + '&edit=Edit');
            }
        });
    });

    //////////////////
};
