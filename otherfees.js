
module.exports = function(app) {
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
 mongoose.Promise = global.Promise; 
var multer  = require('multer')
var path = require('path');
var flash = require('connect-flash');
var async = require('async'); 
var Order   = require('../app/models/orders');
var product   = require('../app/models/product');
var removal   = require('../app/models/removal');
var reportid   = require('../app/models/reportid');
var otherfees   = require('../app/models/otherfees');
var reimbursements   = require('../app/models/reimbursements');
var refund   = require('../app/models/refund');
var inbound   = require('../app/models/inbound');
var Storage   = require('../app/models/storagefees');
var reportid   = require('../app/models/reportid');
var user   = require('../app/models/user');
var Decimal = require('decimal');
var moment = require('moment');
var format = require('date-format');

// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var upload = multer({
  dest: path.join(__dirname, '../public/uploads')
});

var CronJob = require('cron').CronJob;
var job = new CronJob({
  cronTime: '*/2 * * * *',
  onTick: function() {

/*app.get('/otherfees', function  (req, res) {*/
  user.find({"local.role":'customer'}, function (err, data) {

async.eachSeries(data, function(resultuser, callback) {

var amzSecretKey=resultuser.amazonkeys.AmzSecretKey;
var aWSAccessKeyId=resultuser.amazonkeys.AWSAccessKeyId;
var SellerId=resultuser.amazonkeys.SellerId;
var Marketplaceid=resultuser.amazonkeys.marketplaceid;

var customerid=resultuser._id;

reportsecond();

function reportsecond(){

  var fifteenago = new Date();
fifteenago.setDate(fifteenago.getDate() -15);

   var prevdays=format('yyyy-MM-dd',fifteenago);

 //  res.send(prevdays);

  var Currentdate=format('yyyy-MM-dd',new Date());


  var mws = require('amazon-mws-node')({
    AmzSecretKey: amzSecretKey,
    AWSAccessKeyId: aWSAccessKeyId
  });
  mws({
    method: 'GET',
    base: 'mws.amazonservices.com',
    endpoint: '/Reports/2009-01-01',
    params: {
      'Action': 'GetReportRequestList',
      'ReportType': '_GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE_',
    'RequestedFromDate':prevdays,
    'RequestedToDate':Currentdate,
    'ReportProcessingStatusList.Status.1':'_DONE_',
    'SellerId': SellerId
    },
    callback: function  (error, response, body) {


var parseString = require('xml2js').parseString;

parseString(body, function (err, results) {
  if(results.ErrorResponse){

var second = 10, the_interval = second  * 1000;
setInterval(function() {

reportsecond();

  
}, the_interval);

}

else{



if(results.GetReportRequestListResponse
  .GetReportRequestListResult[0].ReportRequestInfo[0].ReportProcessingStatus=="_DONE_")
{

var requestid=results.GetReportRequestListResponse
  .GetReportRequestListResult[0].ReportRequestInfo[0].ReportRequestId;

var GeneratedReportId=results.GetReportRequestListResponse
  .GetReportRequestListResult[0].ReportRequestInfo[0].GeneratedReportId;

reportdata(GeneratedReportId);

function reportdata(GeneratedReportId){



  mws({
    method: 'GET',
    base: 'mws.amazonservices.com',
    endpoint: '/Reports/2009-01-01',
    params: {
      'Action': 'GetReport',
      'ReportId' : "6542775473017432",
    'SellerId': SellerId
    },
    callback: function (error, response, body) {

try{

var Converter = require("csvtojson").Converter;
var converter = new Converter({delimiter:'\t'});  
converter.fromString(body, function(err,result){


var count=result.length;


var settlementid=result[0]['settlement-id'];



 otherfees.findOne({'settlementid':settlementid,'customerid':customerid}, function (err, data) {

  if(data==null){



function asyncLoop( i, callback ) { 

    if( i < count ) {

      console.log(i);
 
  if(result[i]['transaction-type']=="BalanceAdjustment"){ 


 var amount=result[i]['other-amount'];


var amountS=JSON.stringify(amount);
var rep = /-/gi;
var newamount = amountS.replace(rep,'');
var price= JSON.parse(newamount);
console.log(price);

 var settlementid=result[i]['settlement-id'];
 var posteddate=result[i]['posted-date'];
 var transactiontype=result[i]['transaction-type'];

  console.log(settlementid);
  console.log(posteddate);

    console.log(transactiontype);

  var    otherFees = new otherfees()
         otherFees.amount =price;
         otherFees.posteddate =posteddate;
         otherFees.settlementid=settlementid;
         otherFees.transactiontype=transactiontype;
         otherFees.customerid=customerid;
         otherFees.save(function(err, data){
      
 setTimeout( function() {
                 asyncLoop( i+1, callback ); 
            }, 0 );

        });


                                                                                                                                                                              

    
                                                                                                                                    
  }

  else if(result[i]['transaction-type']=="Subscription Fee"){


var settlementid=result[i]['settlement-id'];
var amount=result[i]['other-amount'];
var posteddate=result[i]['posted-date'];
var transactiontype=result[i]['transaction-type'];
var amountS=JSON.stringify(amount);
var rep = /-/gi;
var newamount = amountS.replace(rep,'');
var price= JSON.parse(newamount);
console.log(price);
  console.log(settlementid);
  console.log(posteddate);

    console.log(transactiontype);

  var    otherFees = new otherfees()
         otherFees.amount =price;
         otherFees.posteddate =posteddate;       
         otherFees.settlementid=settlementid;
         otherFees.transactiontype=transactiontype;
         otherFees.customerid=customerid;
         otherFees.save(function(err, data){
      
 setTimeout( function() {
                 asyncLoop( i+1, callback ); 
            }, 0 );

        });



                                                                                                                                                                              

    
                                                                                                                                    
  }
  else if(result[i]['transaction-type']=="Amazon Capital Services"){ 


 var settlementid=result[i]['settlement-id'];
var amount=result[i]['other-amount'];
var posteddate=result[i]['posted-date'];
var transactiontype=result[i]['transaction-type'];
var amountS=JSON.stringify(amount);
var rep = /-/gi;
var newamount = amountS.replace(rep,'');
var price= JSON.parse(newamount);
console.log(price);
  console.log(settlementid);
  console.log(posteddate);

    console.log(transactiontype);

  var    otherFees = new otherfees()
         otherFees.amount =price;
         otherFees.posteddate =posteddate;       
         otherFees.settlementid=settlementid;
         otherFees.transactiontype=transactiontype;
         otherFees.customerid=customerid;
         otherFees.save(function(err, data){
      
 setTimeout( function() {
                 asyncLoop( i+1, callback ); 
            }, 0 );

        });

                                                                                                                               
  }
  else{

 setTimeout( function() {
                 asyncLoop( i+1, callback ); 
            }, 0 );

  }






    }
     else {

        callback();
    }
}
asyncLoop(0, function() {
    
 console.log("done");


 });
}
else{
 console.log('report already run on system');

 }
});



 });
}
catch(err){

 console.log("something is missing");

}

  }
});

  }

 }
}
////////////////////////////////
  });
 }
});
}   
    });
   });


     },
  start: false,
  timeZone: 'Asia/Kolkata'
});
//job.start();



///////////////////////////////////////////
function isLoggedIns(req, res, next) {
    if (req.isAuthenticated()){

      return next();
    }
    else{
       res.redirect('/');
    } 
}
////////////////////////////////////////////////
};