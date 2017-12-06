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
var reimbursements   = require('../app/models/reimbursements');
var refund   = require('../app/models/refund');
var user   = require('../app/models/user');
var Storage   = require('../app/models/storagefees');
var reportid   = require('../app/models/reportid');
var Decimal = require('decimal');
var moment = require('moment');
var format = require('date-format');
// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var upload = multer({
  dest: path.join(__dirname, '../public/uploads')
});


/////////////////Calculate Storage Fess///////////
app.get('/storageFees', function  (req, res) {
function storage(){
 Order.find({'customerid':"5902d05a4c13431ecc635cba"}, function (err, data) {
var count = data.length;

 let cnt = 0;

async.eachSeries(data, function(item, callback) {

 cnt++;
var Asin=item.ASIN;
var id=item._id;

 Storage.find({'customerid':"5902d05a4c13431ecc635cba",'asin':Asin}, function (err, data) {
if (data==[]) {

if(cnt==count){ 
  

res.send("sucess");

}
callback();

}
else{

var date=format('yyyy-MM-dd', new Date());

var newdate=moment(date, "yyyy-MM-dd").daysInMonth()
 // 29
var storageM=data[0].monthlystoragefee;

 Order.find({'customerid':"5902d05a4c13431ecc635cba",'ASIN':Asin,'Currentdate':"28-06-2017"}, function (err, orderd) {



var sales=orderd.length;
console.log(sales);

var Storagedays =Decimal(storageM).div(newdate).toNumber();
console.log(Storagedays);

var Storageperorder =Decimal(Storagedays).div(sales).toNumber();


console.log(Storageperorder);

    Order.findByIdAndUpdate(id, {'storageFees':Storageperorder}, function(err, result){
   
if(cnt==count){
  

res.send("sucess");

}


callback();

            });
        });
       }


     });



   });


  });

 }
storage()
});
////////////////////////////////////////////

var CronJob = require('cron').CronJob;
var job = new CronJob({
  cronTime: '*/2 * * * *',
  onTick: function() {

/*app.get('/srorageprocess1', function  (req, res) {
*/
  user.find({"local.role":'customer'}, function (err, data) {

async.eachSeries(data, function(resultuser, callback) {


var amzSecretKey=resultuser.amazonkeys.AmzSecretKey;
var aWSAccessKeyId=resultuser.amazonkeys.AWSAccessKeyId;
var SellerId=resultuser.amazonkeys.SellerId;
var Marketplaceid=resultuser.amazonkeys.marketplaceid;

var customerid=resultuser._id;


    var d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - 1);

  var date = new Date();

var monthEndDay = new Date(date.getFullYear(), date.getMonth(), 1);
console.log(monthEndDay);

 var startdate=format('yyyy-MM-dd',d);
var end= moment(monthEndDay).format('YYYY-MM-DD');





  var mws = require('amazon-mws-node')({
    AmzSecretKey: amzSecretKey,
    AWSAccessKeyId: aWSAccessKeyId
  });
        

  mws({
    method: 'GET',
    base: 'mws.amazonservices.com',
    endpoint: '/Reports/2009-01-01',
    params: {
      'Action': 'RequestReport',
      'ReportType': '_GET_FBA_STORAGE_FEE_CHARGES_DATA_',
      'StartDate':startdate,
      'EndDate':end,
    'SellerId': SellerId
    },
    callback: function (error, response, body) {

var parseString = require('xml2js').parseString;

parseString(body, function (err, result) {

 try{

var ReportRequestId =result.RequestReportResponse.RequestReportResult[0].ReportRequestInfo[0].ReportRequestId;
////////////Get Report request list ////////////////

if(ReportRequestId==""){

console.log("ReportRequestId not find");

}else{



reportid.find({"customerid": customerid}, function (err, user) {


 if(user.length>0){

col='storagereport.RequestId';

reportid.findByIdAndUpdate(user[0]._id, {[col]:ReportRequestId}, function(err, result){

console.log("done");

});

 } 

else{

console.log("not find user")
/*    var reportids = new reportid()
    reportids.custmoreid=customerid;
    reportids.removalreport.RequestId="";
    reportids.orderreport.RequestId="";
    reportids.reimbursementsreport.RequestId="";
    reportids.storagereport.RequestId=ReportRequestId;

    reportids.save(function(err, data){
      

res.send("done");



    });
*/



}



});
/* */




}


                                                                              }

catch(err){

console.log("not find request id");

}

});


    }
  });

  });
 });


     },
  start: false,
  timeZone: 'Asia/Kolkata'
});
//job.start();
/////////////////////////

/*app.get('/storageprocess2', function  (req, res) {*/
var CronJob = require('cron').CronJob;
var job = new CronJob({
  cronTime: '*/2 * * * *',
  onTick: function() {


  user.find({"local.role":'customer'}, function (err, data) {

async.eachSeries(data, function(resultuser, callback) {


var amzSecretKey=resultuser.amazonkeys.AmzSecretKey;
var aWSAccessKeyId=resultuser.amazonkeys.AWSAccessKeyId;
var SellerId=resultuser.amazonkeys.SellerId;
var Marketplaceid=resultuser.amazonkeys.marketplaceid;

var customerid=resultuser._id;

  reportid.find({"customerid": customerid}, function (err, reportresult) {
console.log(reportresult);

var RequestId =reportresult[0].storagereport.RequestId;
console.log(RequestId);

reportsecond(RequestId);

function reportsecond(RequestId){


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
      'ReportProcessingStatusList.Status.1': '_DONE_',
      'ReportRequestIdList.Id.1' : RequestId,
    'SellerId': SellerId,
    'Marketplace':Marketplaceid
    },
    callback: function  (error, response, body) {


var parseString = require('xml2js').parseString;

parseString(body, function (err, results) {


if(results.ErrorResponse){
console.log("thoratled");
var second = 10, the_interval = second  * 1000;
setInterval(function() {

reportsecond(RequestId);

  
}, the_interval);

}

else{
console.log(results.GetReportRequestListResponse
  .GetReportRequestListResult[0].ReportRequestInfo[0].ReportProcessingStatus);


if(results.GetReportRequestListResponse
  .GetReportRequestListResult[0].ReportRequestInfo[0].ReportProcessingStatus=="_DONE_")
{
 
 var GeneratedReportId = results.GetReportRequestListResponse
  .GetReportRequestListResult[0].ReportRequestInfo[0].
  GeneratedReportId;


  var mws = require('amazon-mws-node')({
    AmzSecretKey: amzSecretKey,
    AWSAccessKeyId: aWSAccessKeyId
  });
 
  mws({
    method: 'GET',
    base: 'mws.amazonservices.com',
    endpoint: '/Reports/2009-01-01',
    params: {
      'Action': 'GetReport',
      'ReportId' : GeneratedReportId,
    'SellerId': SellerId
    },
    callback: function (error, response, body) {



var Converter = require("csvtojson").Converter;
var converter = new Converter({delimiter:'\t'});
converter.fromString(body, function(err,result){


 var count =  result.length;
function asyncLoop( i, callback ) {
    if( i < count ) {

var asin = result[i].asin;
var monthofcharge= result[i]['month-of-charge'];
var monthlystoragefee= result[i]['estimated-monthly-storage-fee'];
var fulfillmentcenter= result[i]['fulfillment-center'];
 Storage.findOne({'asin':asin,'monthofcharge':monthofcharge,'customerid':customerid}, function (err, data) {

  if(data==null){
  var   storages = new Storage()
  var date=format('yyyy-MM-dd', new Date());
         storages.asin =asin;
         storages.monthofcharge=monthofcharge;
         storages.monthlystoragefee=monthlystoragefee;
         storages.rundate=date;
         storages.customerid=customerid;
         storages.fulfillmentcenter=fulfillmentcenter;
         storages.save(function(err, data){
      
asyncLoop( i+1, callback );

        });

}
else{

          var id =data._id;
          var monthlystoragefee2 =data.monthlystoragefee;


  var total= Decimal(monthlystoragefee).add(monthlystoragefee2).toNumber();

 Storage.findByIdAndUpdate(id, {'monthlystoragefee':total}, function(err, result){

asyncLoop( i+1, callback );


});
}
});
    } 
    else {
        callback();
    }
}
asyncLoop(0, function() {
    
console.log("Done");



});

 });
    }
  });



 
}

/////////other status///////////
else if(results.GetReportRequestListResponse
  .GetReportRequestListResult[0].ReportRequestInfo[0]
  .ReportProcessingStatus=="_IN_PROGRESS_"){

console.log("_IN_PROGRESS_");

var minutes = 1, the_interval = minutes * 60 * 1000;
setInterval(function() {


reportsecond(RequestId);

  
},the_interval);


}
else if(results.GetReportRequestListResponse
  .GetReportRequestListResult[0].ReportRequestInfo[0]
  .ReportProcessingStatus=="_CANCELLED_"){


console.log("_CANCELLED_");



}
else if(results.GetReportRequestListResponse
  .GetReportRequestListResult[0].ReportRequestInfo[0]
  .ReportProcessingStatus=="_DONE_NO_DATA_"){

console.log("_DONE_NO_DATA_");



}
else if(results.GetReportRequestListResponse
  .GetReportRequestListResult[0].ReportRequestInfo[0]
  .ReportProcessingStatus=="_SUBMITTED_"){


console.log("_SUBMITTED_");
var second = 30, the_interval = second  * 1000;
setInterval(function() {

reportsecond(RequestId);

  
}, the_interval);


}

else{

console.log("none");

}
}
////////////////////////////////
});
}

});

}

    });
  });
 });
     },
  start: false,
  timeZone: 'Asia/Kolkata'
});
//job.start();

////////////////REFUND API///////////////////////////////








///////////////New Order method /////////////////////



app.get('/testorder', function  (req, res) {

  user.find({"local.role":'customer'}, function (err, data) {

async.eachSeries(data, function(resultuser, callback) {


var amzSecretKey=resultuser.amazonkeys.AmzSecretKey;
var aWSAccessKeyId=resultuser.amazonkeys.AWSAccessKeyId;
var SellerId=resultuser.amazonkeys.SellerId;
var Marketplaceid=resultuser.amazonkeys.marketplaceid;

var customerid=resultuser._id;


var twodaysago = new Date();
twodaysago.setDate(twodaysago.getDate() - 1);

   var prevdays=format('yyyy-MM-dd',twodaysago);
  var Currentdate=format('yyyy-MM-dd',new Date());
/*  res.send(prevdays);*/

/*


 var previousweek= new Date(Currentdate.getTime() - 7 * 24 * 60 * 60 * 1000);
console.log(previousweek);*/

       

  var mws = require('amazon-mws-node')({
    AmzSecretKey: amzSecretKey,
    AWSAccessKeyId: aWSAccessKeyId
  });
        
  mws({
    method: 'GET',
    base: 'mws.amazonservices.com',
    endpoint: '/Reports/2009-01-01',
    params: {
      'Action': 'RequestReport',
      'ReportType': '_GET_FLAT_FILE_ALL_ORDERS_DATA_BY_LAST_UPDATE_',
      'StartDate':prevdays+'T00:00:01.50-00',
      'EndDate':Currentdate+'T00:00:00.50-00',
    'SellerId': SellerId
    },
    callback: function (error, response, body) {

var parseString = require('xml2js').parseString;

parseString(body, function (err, result) {
//res.send(result);
 try{

var ReportRequestId =result.RequestReportResponse.RequestReportResult[0].ReportRequestInfo[0].ReportRequestId;
////////////Get Report request list ////////////////

if(ReportRequestId==""){

console.log("ReportRequestId not find");

}else{



var col="orderreport.RequestId";
reportid.findOneAndUpdate({customerid: customerid}, {$set:{[col]:ReportRequestId}}, {new: true}, function(err, doc){
if(doc){

console.log("done");

}
else{

console.log("not update");

}

});

/* */




}


}

catch(err){

console.log("not find request id");

}

       });


      }
    });
   });

 });
});

//////////////////////////////////////
app.get('/testorder2', function  (req, res) {


  user.find({"local.role":'customer'}, function (err, data) {

async.eachSeries(data, function(resultuser, callback) {


var amzSecretKey=resultuser.amazonkeys.AmzSecretKey;
var aWSAccessKeyId=resultuser.amazonkeys.AWSAccessKeyId;
var SellerId=resultuser.amazonkeys.SellerId;
var Marketplaceid=resultuser.amazonkeys.marketplaceid;

var customerid=resultuser._id;


  reportid.find({'customerid':customerid}, function (err, reportresult) {

var RequestId =reportresult[0].orderreport.RequestId;

reportsecond(RequestId);
function reportsecond(RequestId){


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
      'ReportProcessingStatusList.Status.1': '_DONE_',
      'ReportRequestIdList.Id.1' : RequestId,
    'SellerId': SellerId,
    'Marketplace':Marketplaceid
    },
    callback: function  (error, response, body) {


var parseString = require('xml2js').parseString;

parseString(body, function (err, results) {


if(results.ErrorResponse){

var second = 10, the_interval = second  * 1000;
setInterval(function() {

reportsecond(RequestId);

  
}, the_interval);

}

else{
console.log(results.GetReportRequestListResponse
  .GetReportRequestListResult[0].ReportRequestInfo[0].ReportProcessingStatus);


if(results.GetReportRequestListResponse
  .GetReportRequestListResult[0].ReportRequestInfo[0].ReportProcessingStatus=="_DONE_")
{


var GeneratedReportId = results.GetReportRequestListResponse
  .GetReportRequestListResult[0].ReportRequestInfo[0].
  GeneratedReportId;


  mws({
    method: 'GET',
    base: 'mws.amazonservices.com',
    endpoint: '/Reports/2009-01-01',
    params: {
      'Action': 'GetReport',
      'ReportId' : GeneratedReportId,
    'SellerId': 'ASO6U4SYGJ2CF'
    },
    callback: function (error, response, body) {


console.log(GeneratedReportId);
var Converter = require("csvtojson").Converter;
var converter = new Converter({delimiter:'\t'});
converter.fromString(body, function(err,result){

//res.send(result);

    var count=result.length;
function asyncLoop( i, callback ) {
    if( i < count ) {

  Order.find({ 'OrderId':result[i]['amazon-order-id'],'customerid':customerid}, function (err, datas) {
console.log(i);
if(datas.length>0){



 
var id =datas[0]._id;
    Order.findByIdAndUpdate(id, {'PurchaseDate':result[i]['purchase-date'],
      'lastupdateddate':result[i]['"last-updated-date'],OrderStatus:result[i]['order-status'],ItemPrice:result[i]['item-price']}, function(err, result){

 
 setTimeout( function() {
                asyncLoop( i+1, callback );
            }, 0 );
  
    
    });



}


  else{


  var purchasedate  =   result[i]['purchase-date'];

            
    expr = "S";
var res=  result[i]['amazon-order-id'].indexOf(expr);

if(res > -1) {
  
 setTimeout( function() {
                asyncLoop( i+1, callback );
            }, 0 );


}
else
{


   var   orderS = new Order()
         orderS.PurchaseDate=purchasedate;
         orderS.lastupdateddate=result[i]['last-updated-date'];
         orderS.OrderId = result[i]['amazon-order-id'];
         orderS.OrderStatus = result[i]['order-status'];
         orderS.customerid=customerid;
         orderS.ASIN=result[i]['asin'];
         orderS.ItemPrice=result[i]['item-price'];
         orderS.Title=result[i]['product-name'];
         orderS.QuantityOrdered=result[i]['quantity'];
         orderS.Principal="";
         orderS.sellersku=result[i]['sku'];
         orderS.idmatch="";
         orderS.Promorebate="";
         orderS.buycost="";
         orderS.storageFees="";
         orderS.income.ShippingCharge=0.0;
         orderS.income.GiftWrap=0.0;
         orderS.Tax.Tax=0.0;
         orderS.Tax.ShippingTax=0.0; 
         orderS.Tax.GiftWrapTax=0.0;   
         orderS.expenses.SellingFees.FixedClosingFee=0.0;
         orderS.expenses.SellingFees.Commission=0.0;
         orderS.expenses.SellingFees.VariableClosingFee=0.0;
         orderS.expenses.FBATransactionFees.FBAFulfillmentFees=0.0;
         orderS.expenses.FBATransactionFees.ShippingChargeback=0.0;
         orderS.expenses.FBATransactionFees.GiftwrapChargeback=0.0;
         orderS.expenses.SalesTaxCollectionFee=0.0;



         var dates=format('yyyy-MM-dd', new Date());

        orderS.Currentdate=dates;
                           
        orderS.save(function(err, data){



 product.findOne({'sku':result[i]['sku'],'customerid':customerid}, function (err, datas) {

if(datas==null){
  
 setTimeout( function() {
                asyncLoop( i+1, callback );
            }, 0 );


}
else{

 Order.findByIdAndUpdate(data._id, {'idmatch':datas._id,'buycost':datas.buycost}, function(err, result){


 setTimeout( function() {
                asyncLoop( i+1, callback );
            }, 0 );
  
    
    });



}
   
  });

   });

}



}



});
    } 


    else {
        callback();
    }
}
asyncLoop( 0, function() {
console.log("Done");


});



});




}

});
 
}

/////////other status///////////
else if(results.GetReportRequestListResponse
  .GetReportRequestListResult[0].ReportRequestInfo[0]
  .ReportProcessingStatus=="_IN_PROGRESS_"){
console.log("_IN_PROGRESS_");


var minutes = 1, the_interval = minutes * 60 * 1000;
setInterval(function() {


reportsecond(RequestId);

  
},the_interval);


}
else if(results.GetReportRequestListResponse
  .GetReportRequestListResult[0].ReportRequestInfo[0]
  .ReportProcessingStatus=="_CANCELLED_"){



console.log("_CANCELLED_");

}
else if(results.GetReportRequestListResponse
  .GetReportRequestListResult[0].ReportRequestInfo[0]
  .ReportProcessingStatus=="_DONE_NO_DATA_"){


console.log("_DONE_NO_DATA_");


}
else if(results.GetReportRequestListResponse
  .GetReportRequestListResult[0].ReportRequestInfo[0]
  .ReportProcessingStatus=="_SUBMITTED_"){

console.log("_SUBMITTED_");

var second = 30, the_interval = second  * 1000;
setInterval(function() {

reportsecond(RequestId);

  
}, the_interval);


}

else{

console.log("none");

 }
}




////////////////////////////////
   });
  }

  });

 }


   });
  });
 });


});
//job.start();
//////////////Finacial Part//////////////////////////////////






////////////////REIMBURSEMENTS////////////////////////////////


var CronJob = require('cron').CronJob;
var job = new CronJob({
  cronTime: '*/2 * * * *',
  onTick: function() {


/*app.get('/reimbursementsprocess1', function  (req, res) {*/


  user.find({"local.role":'customer'}, function (err, data) {

async.eachSeries(data, function(resultuser, callback) {

var amzSecretKey=resultuser.amazonkeys.AmzSecretKey;
var aWSAccessKeyId=resultuser.amazonkeys.AWSAccessKeyId;
var SellerId=resultuser.amazonkeys.SellerId;
var Marketplaceid=resultuser.amazonkeys.marketplaceid;

var customerid=resultuser._id;
  var twodaysago = new Date();
twodaysago.setDate(twodaysago.getDate() - 2);

   var prevdays=format('yyyy-MM-dd',twodaysago);
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
      'Action': 'RequestReport',
      'ReportType': '_GET_FBA_REIMBURSEMENTS_DATA_',
    'StartDate':prevdays,
      'EndDate':Currentdate,
    'SellerId': SellerId
    },
    callback: function (error, response, body) {

var parseString = require('xml2js').parseString;

parseString(body, function (err, result) {
try{
  //res.send(result);


var ReportRequestId =result.RequestReportResponse.RequestReportResult[0].ReportRequestInfo[0].ReportRequestId;
////////////Get Report request list ////////////////

if(ReportRequestId==""){

console.log("Request id not find");


}else{




var col="reimbursementsreport.RequestId";



reportid.find({'customerid': customerid}, function (err, user) {


 if(user.length>0){



reportid.findByIdAndUpdate(user[0]._id, {[col]:ReportRequestId}, function(err, result){

console.log("done");

});



}
else{

console.log("user not find");

}
});
}
}
catch(err){

console.log("Request id not find")
}
});


      }
     });

   });
 });
     },
  start: false,
  timeZone: 'Asia/Kolkata'
});
//job.start();
/////////////////////////////////////////////
var CronJob = require('cron').CronJob;
var job = new CronJob({
  cronTime: '*/2 * * * *',
  onTick: function() {

/*
app.get('/reimbursementsprocess2', function  (req, res) {*/
  user.find({"local.role":'customer'}, function (err, data) {

async.eachSeries(data, function(resultuser, callback) {

var amzSecretKey=resultuser.amazonkeys.AmzSecretKey;
var aWSAccessKeyId=resultuser.amazonkeys.AWSAccessKeyId;
var SellerId=resultuser.amazonkeys.SellerId;
var Marketplaceid=resultuser.amazonkeys.marketplaceid;

var customerid=resultuser._id;

  reportid.find({'customerid':customerid}, function (err, reportresult) {


var RequestId =reportresult[0].reimbursementsreport.RequestId;
reportsecond(RequestId);
function reportsecond(RequestId){



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
      'ReportProcessingStatusList.Status.1': '_DONE_',
      'ReportRequestIdList.Id.1' : RequestId,
    'SellerId': SellerId,
    'Marketplace':Marketplaceid
    },
    callback: function  (error, response, body) {




var parseString = require('xml2js').parseString;

parseString(body, function (err, results) {


var GeneratedReportId = results.GetReportRequestListResponse
  .GetReportRequestListResult[0].ReportRequestInfo[0].
  GeneratedReportId;


  mws({
    method: 'GET',
    base: 'mws.amazonservices.com',
    endpoint: '/Reports/2009-01-01',
    params: {
      'Action': 'GetReport',
      'ReportId' : GeneratedReportId,
    'SellerId': SellerId
    },
    callback: function (error, response, body) {



var Converter = require("csvtojson").Converter;
var converter = new Converter({delimiter:'\t'});
converter.fromString(body, function(err,result){
if(results.ErrorResponse){

var second = 10, the_interval = second  * 1000;
setInterval(function() {

reportsecond(RequestId);

  
}, the_interval);

}

else{
console.log(results.GetReportRequestListResponse
  .GetReportRequestListResult[0].ReportRequestInfo[0].ReportProcessingStatus);


if(results.GetReportRequestListResponse
  .GetReportRequestListResult[0].ReportRequestInfo[0].ReportProcessingStatus=="_DONE_")
{
//////////////////

    var count=result.length;
function asyncLoop( i, callback ) {
    if( i < count ) {


  reimbursements.find({ 'remid':result[i]['reimbursement-id'],'customerid':customerid}, function (err, datas) {
console.log(i);
if(datas.length>0){
 

asyncLoop( i+1, callback );


}
else{
var amout= result[i]['amount-per-unit'];

var amountperunit=Number(amout);

   var   reimbursementS = new reimbursements()
         reimbursementS.approvaldate=result[i]['approval-date'];
         reimbursementS.remid = result[i]['reimbursement-id'];
         reimbursementS.customerid=customerid;
         reimbursementS.sku=result[i]['sku'];
         reimbursementS.productname=result[i]['product-name'];
         reimbursementS.orderid=result[i]['amazon-order-id'];
         reimbursementS.sellersku=result[i]['sku'];
         reimbursementS.cashquant=result[i]['quantity-reimbursed-cash'];
         reimbursementS.totalquant=result[i]['quantity-reimbursed-total'];
         reimbursementS.inventoryquant=result[i]['quantity-reimbursed-inventory'];
         reimbursementS.reason=result[i]['reason'];
         reimbursementS.amountperunit=amountperunit;

                           
        reimbursementS.save(function(err, data){

asyncLoop( i+1, callback );
    
        });

}



});
    } 


    else {
        callback();
    }
}
asyncLoop( 0, function() {
console.log("success");

});




 ///////////////////
}

/////////other status///////////
else if(results.GetReportRequestListResponse
  .GetReportRequestListResult[0].ReportRequestInfo[0]
  .ReportProcessingStatus=="_IN_PROGRESS_"){


var minutes = 1, the_interval = minutes * 60 * 1000;
setInterval(function() {


console.log("_IN_PROGRESS_");
reportsecond(RequestId);

  
},the_interval);

}
else if(results.GetReportRequestListResponse
  .GetReportRequestListResult[0].ReportRequestInfo[0]
  .ReportProcessingStatus=="_CANCELLED_"){



console.log("_CANCELLED_");

}
else if(results.GetReportRequestListResponse
  .GetReportRequestListResult[0].ReportRequestInfo[0]
  .ReportProcessingStatus=="_DONE_NO_DATA_"){


console.log("_DONE_NO_DATA_");


}
else if(results.GetReportRequestListResponse
  .GetReportRequestListResult[0].ReportRequestInfo[0]
  .ReportProcessingStatus=="_SUBMITTED_"){

console.log("_SUBMITTED_");


var second = 30, the_interval = second  * 1000;
setInterval(function() {

reportsecond(RequestId);

  
}, the_interval);


}

else{

console.log("none");

 }
}

 
//////////////////
});




}

});




});
}

});


     }
   });
  });
 });


     },
  start: false,
  timeZone: 'Asia/Kolkata'
});
//job.start();
//});
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