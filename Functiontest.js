   module.exports = function(app,passport) {

var bodyParser = require('body-parser');
var mongoose = require('mongoose');
 mongoose.Promise = global.Promise; 
var multer  = require('multer')
var path = require('path');
var flash = require('connect-flash');
var async = require('async');
var product   = require('../app/models/product');
var Order   = require('../app/models/orders');
var Storage   = require('../app/models/storagefees');
var format = require('date-format');
var Decimal = require('decimal');
var moment = require('moment');
var reportid   = require('../app/models/reportid');
var user   = require('../app/models/user');
var removal   = require('../app/models/removal');

var refund   = require('../app/models/refund');
var otherfees   = require('../app/models/otherfees');
var inbound =require('../app/models/inbound');
var reimbursements   = require('../app/models/reimbursements');
// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var upload = multer({
  dest: path.join(__dirname, '../public/uploads')
});
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
twodaysago.setDate(twodaysago.getDate() - 4);

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
      'StartDate':prevdays+'T00:00:00.50-00',
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


res.send("ReportRequestId not find");

}else{



var col="orderreport.RequestId";
reportid.findOneAndUpdate({customerid: customerid}, {$set:{[col]:ReportRequestId}}, {new: true}, function(err, doc){
if(doc){

res.send("done");

}
else{

res.send("not update");

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

   });
  }

  });

 }


   });
  });
 });


});
////////////////////////////////////////////


app.get('/testorderfees', function  (req, res) {

  user.find({"local.role":'customer'}, function (err, data) {
console.log("qqqq");
async.eachSeries(data, function(resultuser, callback) {


var amzSecretKey=resultuser.amazonkeys.AmzSecretKey;
var aWSAccessKeyId=resultuser.amazonkeys.AWSAccessKeyId;
var SellerId=resultuser.amazonkeys.SellerId;
var Marketplaceid=resultuser.amazonkeys.marketplaceid;

var customerid=resultuser._id;

      var mws = require('amazon-mws-node')({
    AmzSecretKey: amzSecretKey,
    AWSAccessKeyId: aWSAccessKeyId
  });
 
  var twodaysago = new Date();
twodaysago.setDate(twodaysago.getDate() - 4);

   var prevdays=format('yyyy-MM-dd',twodaysago);
  var Currentdate=format('yyyy-MM-dd',new Date());


  mws({
    method: 'POST',
    base: 'mws.amazonservices.com',
    endpoint: '/Finances/2015-05-01',
    params: {
      'Action': 'ListFinancialEvents',
      'SellerId': 'ASO6U4SYGJ2CF',
      'PostedAfter': prevdays+'T00:00:00.50-00',
      'PostedBefore':Currentdate+'T00:00:00.50-00',

        
    },
    callback: function (error, response, body) {
console.log("start");
   var parseString = require('xml2js').parseString;

parseString(body, function (err, results) {

if(results.ListFinancialEventsResponse.ListFinancialEventsResult[0].NextToken){


  var token1=results.ListFinancialEventsResponse.ListFinancialEventsResult[0].NextToken[0];
console.log(tokens);
}
else{


var tokens="undefined";


}




function asyncLoop( i, callback) {
 var count  =results.ListFinancialEventsResponse.ListFinancialEventsResult[0].FinancialEvents[0].ShipmentEventList[0].ShipmentEvent.length;

pushdata={};
    if( i < count ) {



  

        var AmazonOrderId  =results.ListFinancialEventsResponse.ListFinancialEventsResult[0].FinancialEvents[0].ShipmentEventList[0].ShipmentEvent
[i].AmazonOrderId; 
console.log(AmazonOrderId);

    expr = "S";
var res=  AmazonOrderId[0].indexOf(expr);

if(res > -1) {
  
 setTimeout( function() {
                asyncLoop(i+1, callback);
            }, 0);


}

else{



  Order.findOne({ 'OrderId':AmazonOrderId,'customerid':customerid}, function (err, datas) {





if(datas==null){



 asyncLoop( i+1, callback);

}
else{


var id =datas._id;

console.log(datas);

   var ItemFeeListlength  =results.ListFinancialEventsResponse.ListFinancialEventsResult[0].FinancialEvents[0].ShipmentEventList[0].ShipmentEvent
[i].ShipmentItemList[0].ShipmentItem[0].ItemFeeList[0].FeeComponent.length;


   var ItemChargeListlength  =results.ListFinancialEventsResponse.ListFinancialEventsResult[0].FinancialEvents[0].ShipmentEventList[0].ShipmentEvent
[i].ShipmentItemList[0].ShipmentItem[0].ItemChargeList[0].ChargeComponent.length;


function asyncLoop2( j, callback) {

    if( j < ItemFeeListlength ) {


 var amount= results.ListFinancialEventsResponse.ListFinancialEventsResult[0].FinancialEvents[0].ShipmentEventList[0].ShipmentEvent
[i].ShipmentItemList[0].ShipmentItem[0].ItemFeeList[0].FeeComponent[j].FeeAmount[0].CurrencyAmount;


var feestype= results.ListFinancialEventsResponse.ListFinancialEventsResult[0].FinancialEvents[0].ShipmentEventList[0].ShipmentEvent
[i].ShipmentItemList[0].ShipmentItem[0].ItemFeeList[0].FeeComponent[j].FeeType;


if(feestype=="Commission"){

var amountS=JSON.stringify(amount[0]);
var rep = /-/gi;
var newamount = amountS.replace(rep,'');
var price= JSON.parse(newamount);






var col="expenses.SellingFees.Commission";


}
if(feestype=="FixedClosingFee"){

var amountS=JSON.stringify(amount[0]);
var rep = /-/gi;
var newamount = amountS.replace(rep,'');
var price= JSON.parse(newamount);

var col="expenses.SellingFees.FixedClosingFee";


}
if(feestype=="VariableClosingFee"){

var amountS=JSON.stringify(amount[0]);
var rep = /-/gi;
var newamount = amountS.replace(rep,'');
var price= JSON.parse(newamount);

var col="expenses.SellingFees.VariableClosingFee";


}
if(feestype=="FBAPerUnitFulfillmentFee"){

var amountS=JSON.stringify(amount[0]);
var rep = /-/gi;
var newamount = amountS.replace(rep,'');
var price= JSON.parse(newamount);

var col="expenses.FBATransactionFees.FBAFulfillmentFees";


}
if(feestype=="GiftwrapChargeback"){

var amountS=JSON.stringify(amount[0]);
var rep = /-/gi;
var newamount = amountS.replace(rep,'');
var price= JSON.parse(newamount);

var col="expenses.FBATransactionFees.GiftwrapChargeback";


}
if(feestype=="ShippingChargeback"){

var amountS=JSON.stringify(amount[0]);
var rep = /-/gi;
var newamount = amountS.replace(rep,'');
var price= JSON.parse(newamount);

var col="expenses.FBATransactionFees.ShippingChargeback";


}
if(feestype=="SalesTaxCollectionFee"){

var amountS=JSON.stringify(amount[0]);
var rep = /-/gi;
var newamount = amountS.replace(rep,'');
var price= JSON.parse(newamount);

var col="expenses.SalesTaxCollectionFee";


}

 Order.findByIdAndUpdate(id, {[col]:price}, function(err, amount){


asyncLoop2( j+1, callback);


});



    }
    else{


callback();

    }


}

function asyncLoop3( k, callback) {

    if( k < ItemChargeListlength ) {




 var amount2= results.ListFinancialEventsResponse.ListFinancialEventsResult[0].FinancialEvents[0].ShipmentEventList[0].ShipmentEvent
[i].ShipmentItemList[0].ShipmentItem[0].ItemChargeList[0].ChargeComponent[k].ChargeAmount[0].CurrencyAmount;


var feestype2= results.ListFinancialEventsResponse.ListFinancialEventsResult[0].FinancialEvents[0].ShipmentEventList[0].ShipmentEvent

[i].ShipmentItemList[0].ShipmentItem[0].ItemChargeList[0].ChargeComponent[k].ChargeType;

if(feestype2=="Principal"){

var price=amount2[0];

var col="Principal";


}

if(feestype2=="ShippingCharge"){

var price=amount2[0];

var col="income.ShippingCharge";


}
 if(feestype2=="GiftWrap"){

var price=amount2[0];


var col="income.GiftWrap";

}

 if(feestype2=="Tax"){

var price=amount2[0];


var col="Tax.Tax";




}
 if(feestype2=="ShippingTax"){

var price=amount2[0];

var col="Tax.ShippingTax";


}
 if(feestype2=="GiftWrapTax"){
  
var price=amount2[0];

var col="Tax.GiftWrapTax";


}



/*
var field='income.'feestype2;*/


/*let amountsprice = 'field = income.'feestype2;
  
eval(amountsprice);


console.log(field);*/

 Order.findByIdAndUpdate(id, {[col]:price}, function(err, amounts){
console.log(amounts);

    asyncLoop3( k+1, callback);


});





    }
    else{


callback();

    }


}

function promotionlist (l,callback){

if(results.ListFinancialEventsResponse.ListFinancialEventsResult[0].FinancialEvents[0].ShipmentEventList[0].ShipmentEvent
[i].ShipmentItemList[0].ShipmentItem[0].PromotionList){

var  countnext=results.ListFinancialEventsResponse.ListFinancialEventsResult[0].FinancialEvents[0].ShipmentEventList[0].ShipmentEvent
[i].ShipmentItemList[0].ShipmentItem[0].PromotionList[0].Promotion.length;




    if( l < countnext ) {


var PromotionType =results.ListFinancialEventsResponse.ListFinancialEventsResult[0].FinancialEvents[0].ShipmentEventList[0].ShipmentEvent
[i].ShipmentItemList[0].ShipmentItem[0].PromotionList[0].Promotion[l].PromotionType;

var amounts =results.ListFinancialEventsResponse.ListFinancialEventsResult[0].FinancialEvents[0].ShipmentEventList[0].ShipmentEvent
[i].ShipmentItemList[0].ShipmentItem[0].PromotionList[0].
Promotion[l].PromotionAmount[0].CurrencyAmount;


 if(PromotionType=="PromotionMetaDataDefinitionValue"){


if(amounts[0]!=="0.0")
{
  console.log("col");
var price=amounts[0];
var col="Promorebate";


var amountS=JSON.stringify(price);
var rep = /-/gi;
var newamount = amountS.replace(rep,'');
var Amount= JSON.parse(newamount); 


}


}


Order.findByIdAndUpdate(id, {[col]:Amount}, function(err, amounts){

promotionlist( l+1, callback );



}); 



}
else{

  callback();
}


}
else{
 callback();

}




}


asyncLoop2( 0, function() {

  asyncLoop3(0, function() {
    
 promotionlist(0, function() {
    


 asyncLoop( i+1, callback);

});



});


});




}
//////

/////


});
}

    }

else{

  callback();


}



  }

asyncLoop( 0, function() {
if(token1!=="undefined"){
 // res.send("sucess");
nexttoken(token1);

}
else{

 console.log("sucess");
}



});



});

        }

       });



/////////////////////////Next token function//////////////////////////////////////////////
function nexttoken(token){


console.log(token);
if(token==""){
console.log("end");

}

      var mws = require('amazon-mws-node')({
    AmzSecretKey: amzSecretKey,
    AWSAccessKeyId: aWSAccessKeyId
  });
 

  mws({
    method: 'POST',
    base: 'mws.amazonservices.com',
    endpoint: '/Finances/2015-05-01',
    params: {
 'Action': 'ListFinancialEventsByNextToken',
      'SellerId': SellerId,
     'NextToken':token


      
    },
    callback: function (error, response, body) {

   var parseString = require('xml2js').parseString;

parseString(body, function (err, results) {


try{

if(results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].NextToken){


  var tokens=results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].NextToken[0];

}
else{

  console.log("done");
}


function asyncLoop( i, callback) {
   var count  =results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].ShipmentEventList[0].ShipmentEvent.length;


    if( i < count ) {


      console.log(i);

        var AmazonOrderId  =results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].ShipmentEventList[0].ShipmentEvent
[i].AmazonOrderId; 



    expr = "S";
var res=  AmazonOrderId[0].indexOf(expr);

if(res > -1) {
 setTimeout( function() {

                asyncLoop( i+1, callback );

            }, 0);


}

else{

 
  Order.findOne({ 'OrderId':AmazonOrderId,'customerid':customerid}, function (err, datas) {
console.log(datas);
if(datas==null){


 asyncLoop( i+1, callback);

}
else{

var id =datas._id;


   var ItemFeeListlength  =results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].ShipmentEventList[0].ShipmentEvent
[i].ShipmentItemList[0].ShipmentItem[0].ItemFeeList[0].FeeComponent.length;


   var ItemShipmentFeeList =results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].ShipmentEventList[0].ShipmentEvent
[i].ShipmentFeeList;

  console.log(ItemShipmentFeeList);

   var ItemShipmentItemList =results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].ShipmentEventList[0].ShipmentEvent
[i].ShipmentItemList;

function asyncLoop2( j, callback) {

    if( j < ItemFeeListlength ) {

 var amount= results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].ShipmentEventList[0].ShipmentEvent
[i].ShipmentItemList[0].ShipmentItem[0].ItemFeeList[0].FeeComponent[j].FeeAmount[0].CurrencyAmount;


var feestype= results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].ShipmentEventList[0].ShipmentEvent
[i].ShipmentItemList[0].ShipmentItem[0].ItemFeeList[0].FeeComponent[j].FeeType;



if(feestype=="Commission"){

var amountS=JSON.stringify(amount[0]);
var rep = /-/gi;
var newamount = amountS.replace(rep,'');
var price= JSON.parse(newamount);

var col="expenses.SellingFees.Commission";


}
if(feestype=="FixedClosingFee"){

var amountS=JSON.stringify(amount[0]);
var rep = /-/gi;
var newamount = amountS.replace(rep,'');
var price= JSON.parse(newamount);

var col="expenses.SellingFees.FixedClosingFee";


}
if(feestype=="VariableClosingFee"){

var amountS=JSON.stringify(amount[0]);
var rep = /-/gi;
var newamount = amountS.replace(rep,'');
var price= JSON.parse(newamount);

var col="expenses.SellingFees.VariableClosingFee";


}
if(feestype=="FBAPerUnitFulfillmentFee"){

var amountS=JSON.stringify(amount[0]);
var rep = /-/gi;
var newamount = amountS.replace(rep,'');
var price= JSON.parse(newamount);

var col="expenses.FBATransactionFees.FBAFulfillmentFees";


}
if(feestype=="GiftwrapChargeback"){

var amountS=JSON.stringify(amount[0]);
var rep = /-/gi;
var newamount = amountS.replace(rep,'');
var price= JSON.parse(newamount);

var col="expenses.FBATransactionFees.GiftwrapChargeback";


}
if(feestype=="ShippingChargeback"){

var amountS=JSON.stringify(amount[0]);
var rep = /-/gi;
var newamount = amountS.replace(rep,'');
var price= JSON.parse(newamount);

var col="expenses.FBATransactionFees.ShippingChargeback";



}
if(feestype=="SalesTaxCollectionFee"){

var amountS=JSON.stringify(amount[0]);
var rep = /-/gi;
var newamount = amountS.replace(rep,'');
var price= JSON.parse(newamount);

var col="expenses.SalesTaxCollectionFee";


}

 Order.findByIdAndUpdate(id, {[col]:price}, function(err, amount){


asyncLoop2( j+1, callback);


});






    }
    else{


callback();

    }

}

function asyncLoop3( k, callback) {

   var ItemShipmentFeeList =results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].ShipmentEventList[0].ShipmentEvent
[i].ShipmentFeeList;

  console.log(ItemShipmentFeeList);

   var ItemShipmentItemList =results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].ShipmentEventList[0].ShipmentEvent
[i].ShipmentItemList;



if(typeof ItemShipmentFeeList!=='undefined'){

   var ItemShipmentso =results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].ShipmentEventList[0].ShipmentEvent
[i].ShipmentFeeList[0].length;



    if( k < ItemShipmentso ) {


    asyncLoop3( k+1, callback);



    }
    else{


callback();

    }


}
else{


  var ItemChargeListlength  =results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].ShipmentEventList[0].ShipmentEvent
[i].ShipmentItemList[0].ShipmentItem[0].ItemChargeList[0].ChargeComponent.length;


   if( k < ItemChargeListlength ) {

 var amount2= results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].ShipmentEventList[0].ShipmentEvent
[i].ShipmentItemList[0].ShipmentItem[0].ItemChargeList[0].ChargeComponent[k].ChargeAmount[0].CurrencyAmount;


var feestype2= results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].ShipmentEventList[0].ShipmentEvent
[i].ShipmentItemList[0].ShipmentItem[0].ItemChargeList[0].ChargeComponent[k].ChargeType;


if(feestype2=="Principal"){

var price=amount2[0];

var col="Principal";


}

if(feestype2=="ShippingCharge"){

var price=amount2[0];

var col="income.ShippingCharge";


}
 if(feestype2=="GiftWrap"){

var price=amount2[0];


var col="income.GiftWrap";

}

 if(feestype2=="Tax"){

var price=amount2[0];


var col="Tax.Tax";




}
 if(feestype2=="ShippingTax"){

var price=amount2[0];

var col="Tax.ShippingTax";


}
 if(feestype2=="GiftWrapTax"){
  
var price=amount2[0];

var col="Tax.GiftWrapTax";


}


 Order.findByIdAndUpdate(id, {[col]:price}, function(err, amounts){
console.log(amounts);

    asyncLoop3( k+1, callback);


});


}


  else
 
 {


callback();

    }

    }
 


   
}
////////////

function promotionlist2(l,callback){

if(results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].ShipmentEventList[0].ShipmentEvent
[i].ShipmentItemList[0].ShipmentItem[0].PromotionList){

var  countnext=results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].ShipmentEventList[0].ShipmentEvent
[i].ShipmentItemList[0].ShipmentItem[0].PromotionList[0].Promotion.length;


 
    if( l < countnext ) {


var PromotionType =results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].ShipmentEventList[0].ShipmentEvent
[i].ShipmentItemList[0].ShipmentItem[0].PromotionList[0].Promotion[l].PromotionType;

var amounts =results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].ShipmentEventList[0].ShipmentEvent
[i].ShipmentItemList[0].ShipmentItem[0].PromotionList[0].
Promotion[l].PromotionAmount[0].CurrencyAmount;


 if(PromotionType=="PromotionMetaDataDefinitionValue"){
  

if(amounts[0]!=="0.0")
{
  console.log("col");
var price=amounts[0];
var col="Promorebate";


var amountS=JSON.stringify(price);
var rep = /-/gi;
var newamount = amountS.replace(rep,'');
var Amount= JSON.parse(newamount); 


}

}

Order.findByIdAndUpdate(id, {[col]:Amount}, function(err, amounts){

promotionlist2( l+1, callback );



}); 



}
else{

  callback();
}


}
else{
 callback();

}




}


asyncLoop2( 0, function() {

  asyncLoop3(0, function() {

      promotionlist2(0, function() {

    
 asyncLoop( i+1, callback);


 });

});
});

}



});
}

    }

else{

  callback();


}

  } 

asyncLoop( 0, function() {

nexttoken(tokens);

});
}
catch(e){
console.log("token end");

}
 
});




}


});


}

 });
});   

 
});

/////////////////////Product inventory////////////////////////////////////////

app.get('/testproduct', function  (req, res) {

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
      'ReportType': '_GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA_',
    'StartDate':prevdays,
    'EndDate':Currentdate,
    'SellerId': SellerId
    },
    callback: function (error, response, body) {

var parseString = require('xml2js').parseString;

parseString(body, function (err, result) {

   try{

var ReportRequestId =result.RequestReportResponse.RequestReportResult[0].ReportRequestInfo[0].ReportRequestId;
////////////Get Report request list ////////////////

if(ReportRequestId==""){
console.log("Request id not find");
//res.send("Request id not find")


}else{


var col="productreport.RequestId";
reportid.findOneAndUpdate({customerid: customerid}, {$set:{[col]:ReportRequestId}}, {new: true}, function(err, doc){
if(doc){
console.log("d");
 // res.send("done");
console.log("done");
}
else{
console.log("not update");
//res.send("not update");

}

});



  



}
}
catch(err){

console.log("missing");


}

});


    }
  });

  });
 });

});


app.get('/testproduct2', function  (req, res) {


  user.find({"local.role":'customer'}, function (err, data) {

async.eachSeries(data, function(resultuser, callback) {

var amzSecretKey=resultuser.amazonkeys.AmzSecretKey;
var aWSAccessKeyId=resultuser.amazonkeys.AWSAccessKeyId;
var SellerId=resultuser.amazonkeys.SellerId;
var Marketplaceid=resultuser.amazonkeys.marketplaceid;

var customerid=resultuser._id;

  reportid.findOne({"customerid": customerid}, function (err, reportresult) {

var RequestId =reportresult.productreport.RequestId;
console.log(RequestId);

reportsecond(RequestId);

function reportsecond(RequestId){
  
try{

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

console.log("Thoratteled");
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



var Converter = require("csvtojson").Converter;
var converter = new Converter({delimiter:'\t'});
converter.fromString(body, function(err,result){
var count=result.length;
console.log(count);
function asyncLoop( i, callback ) { 

    if( i < count ) {
       var sku  =     result[i].sku;
       var asin  =     result[i].asin;
       var productname  =     result[i]['product-name'];
       var price  =     result[i]['your-price'];
       var quantity  =  result[i]['afn-fulfillable-quantity'];
 

console.log(quantity);
  var onhand  =     result[i]['afn-warehouse-quantity'];

  product.find({ 'sku':sku,'customerid':customerid}, function (err, datas) {

if(datas.length>0){
  
var id =datas[0]._id;

    product.findByIdAndUpdate(id, {'sku':sku,'asin':asin,'productname':productname,'price':price,'quantity':quantity,'onhand':onhand}, function(err, result){

asyncLoop( i+1, callback );

});

}
else{

    var products = new product()
    products.productname=productname;
    products.sku=sku;
    products.price=price;
    products.asin=asin;
    products.quantity=quantity;
    products.onhand=onhand;
    products.buycost="";
    products.Supplier="";
    products.customerid=customerid;
    
    products.save(function(err, data){
      
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
    
 console.log("done");


});





});




}

});
 
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
////////////////////////////////
 });
}

   });
}
catch(err){

console.log("missing");  
}
 }


   });

  });
 });

});
//////////////////////////////Rembursement/////////
app.get('/testremb', function  (req, res) {



  user.find({"local.role":'customer'}, function (err, data) {

async.eachSeries(data, function(resultuser, callback) {

var amzSecretKey=resultuser.amazonkeys.AmzSecretKey;
var aWSAccessKeyId=resultuser.amazonkeys.AWSAccessKeyId;
var SellerId=resultuser.amazonkeys.SellerId;
var Marketplaceid=resultuser.amazonkeys.marketplaceid;

var customerid=resultuser._id;
  var twodaysago = new Date();
twodaysago.setDate(twodaysago.getDate() - 4);

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


  });

app.get('/testremb2', function  (req, res) {
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


});
///////////////////////////Order removal///////////////////

app.get('/testremoval', function  (req, res) {

  user.find({"local.role":'customer'}, function (err, data) {

async.eachSeries(data, function(resultuser, callback) {


var amzSecretKey=resultuser.amazonkeys.AmzSecretKey;
var aWSAccessKeyId=resultuser.amazonkeys.AWSAccessKeyId;
var SellerId=resultuser.amazonkeys.SellerId;
var Marketplaceid=resultuser.amazonkeys.marketplaceid;

var customerid=resultuser._id;

console.log(amzSecretKey);

console.log(aWSAccessKeyId);

console.log(SellerId);

 var Currentdate=format('yyyy-MM-dd', new Date());

var oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

   var prevweek=format('yyyy-MM-dd',oneWeekAgo);

//console.log(prevweek);

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
      'ReportType': '_GET_FBA_FULFILLMENT_REMOVAL_ORDER_DETAIL_DATA_',
    'StartDate':prevweek+'T00:00:00.50-00',
    'EndDate':Currentdate+'T00:00:00.50-00',
    'SellerId': SellerId
    },
    callback: function (error, response, body) {

var parseString = require('xml2js').parseString;

parseString(body, function (err, result) {

   try{

var ReportRequestId =result.RequestReportResponse.RequestReportResult[0].ReportRequestInfo[0].ReportRequestId;
////////////Get Report request list ////////////////

if(ReportRequestId==""){

console.log("Request id not find")


}else{


var col="removalreport.RequestId";
console.log(ReportRequestId[0]);
reportid.findOneAndUpdate({customerid: customerid}, {$set:{[col]:ReportRequestId}}, {new: true}, function(err, doc){
if(doc){

  console.log("done");

}
else{

console.log("not update");

}

});



  



}
}
catch(err){

console.log("missing");


}

});


    }
  });
});
});



});

   app.get('/testremoval2', function  (req, res) {
   
      user.find({"local.role":'customer'}, function (err, data) {

async.eachSeries(data, function(resultuser, callback) {


var amzSecretKey=resultuser.amazonkeys.AmzSecretKey;
var aWSAccessKeyId=resultuser.amazonkeys.AWSAccessKeyId;
var SellerId=resultuser.amazonkeys.SellerId;
var Marketplaceid=resultuser.amazonkeys.marketplaceid;

var customerid=resultuser._id;

  reportid.findOne({"customerid": customerid}, function (err, reportresult) {

var RequestId =reportresult.removalreport.RequestId;


try{
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
console.log('Thoratteled');
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



var Converter = require("csvtojson").Converter;
var converter = new Converter({delimiter:'\t'});
converter.fromString(body, function(err,result){
var count=result.length; 

function asyncLoop( i, callback ) { 

    if( i < count ) {
      var requestdate  = result[i]['request-date'];
       var orderid  =     result[i]['order-id'];
       var sku  =     result[i].sku;
       var removalfee  =     result[i]['removal-fee'];
       var customerid=customerid;
 
 var Currentdate=format('yyyy-MM-dd', new Date());



  removal.find({'orderid':orderid,'sku':sku,'customerid':customerid}, function (err, datas) {

if(datas.length>0){

var id =datas[0]._id;

    removal.findByIdAndUpdate(id, {'removalfee':removalfee}, function(err, result){
console.log("a");
asyncLoop( i+1, callback );


});




}
else{




    var removals = new removal()
    removals.requestdate=requestdate;
    removals.orderid=orderid;
    removals.sku=sku;
    removals.customerid=customerid;
    removals.removalfee=removalfee;
    removals.rundate=Currentdate;
    
     removals.save(function(err, data){
      
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
    
console.log("done");


});







});




}

});
 
}

/////////other status///////////
else if(results.GetReportRequestListResponse
  .GetReportRequestListResult[0].ReportRequestInfo[0]
  .ReportProcessingStatus=="_IN_PROGRESS_"){
console.log('_IN_PROGRESS_');

var minutes = 1, the_interval = minutes * 60 * 1000;
setInterval(function() {


reportsecond(RequestId);

  
},the_interval);


}
else if(results.GetReportRequestListResponse
  .GetReportRequestListResult[0].ReportRequestInfo[0]
  .ReportProcessingStatus=="_CANCELLED_"){



console.log('_CANCELLED_');

}
else if(results.GetReportRequestListResponse
  .GetReportRequestListResult[0].ReportRequestInfo[0]
  .ReportProcessingStatus=="_DONE_NO_DATA_"){


console.log('_DONE_NO_DATA_');


}
else if(results.GetReportRequestListResponse
  .GetReportRequestListResult[0].ReportRequestInfo[0]
  .ReportProcessingStatus=="_SUBMITTED_"){

console.log('_SUBMITTED_');
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
}
catch(err){

console.log("missing");
}
   });
  });
 });


   });

   app.get('/testrefund', function  (req, res) {
//////////////////////////////////////////////

    user.find({"local.role":'customer'}, function (err, data) {

async.eachSeries(data, function(resultuser, callback) {


var amzSecretKey=resultuser.amazonkeys.AmzSecretKey;
var aWSAccessKeyId=resultuser.amazonkeys.AWSAccessKeyId;
var SellerId=resultuser.amazonkeys.SellerId;
var Marketplaceid=resultuser.amazonkeys.marketplaceid;

var customerid=resultuser._id;


  var mws = require('amazon-mws-node')({
    AmzSecretKey: amzSecretKey,
    AWSAccessKeyId: aWSAccessKeyId
  }); 
 var date=format('yyyy-MM-dd', new Date());

  var twodaysago = new Date();
twodaysago.setDate(twodaysago.getDate() - 4);

   var prevdays=format('yyyy-MM-dd',twodaysago);
  var Currentdate=format('yyyy-MM-dd',new Date());


  mws({
    method: 'GET',
    base: 'mws.amazonservices.com',
    endpoint: '/Finances/2015-05-01',
    params: {
      'Action': 'ListFinancialEvents',
      'PostedAfter' :prevdays,
      'PostedBefore':Currentdate,
    'SellerId': SellerId
    },
    callback: function (error, response, body) {

var parseString = require('xml2js').parseString;

parseString(body, function (err, results) {

var postdte;

if(results.ListFinancialEventsResponse.ListFinancialEventsResult[0].FinancialEvents[0].RefundEventList[0]==""){

  if(results.ListFinancialEventsResponse.ListFinancialEventsResult[0].NextToken){


  var token1=results.ListFinancialEventsResponse.ListFinancialEventsResult[0].NextToken[0];
nexttoken(token1);

}
else{


console.log("no find data");

 }

}




else{


  if(results.ListFinancialEventsResponse.ListFinancialEventsResult[0].NextToken){


  var token1=results.ListFinancialEventsResponse.ListFinancialEventsResult[0].NextToken[0];
console.log(token1);
}
else{


var token1="undefined";


}


 
  console.log("yes");
  //res.send(yes);
var count =results.ListFinancialEventsResponse.ListFinancialEventsResult[0].FinancialEvents[0].RefundEventList[0].ShipmentEvent.length;


function asyncLoop( i, callback ) {
    if( i < count ) {

var AmazonOrderId =results.ListFinancialEventsResponse.ListFinancialEventsResult[0].FinancialEvents[0].RefundEventList[0].ShipmentEvent[i].AmazonOrderId;




var sku =results.ListFinancialEventsResponse.ListFinancialEventsResult[0].FinancialEvents[0].RefundEventList[0].ShipmentEvent[i].ShipmentItemAdjustmentList[0].ShipmentItem[0].SellerSKU;
var QuantityShipped =results.ListFinancialEventsResponse.ListFinancialEventsResult[0].FinancialEvents[0].RefundEventList[0].ShipmentEvent[i].ShipmentItemAdjustmentList[0].ShipmentItem[0].QuantityShipped;

var posteddate =results.ListFinancialEventsResponse.ListFinancialEventsResult[0].FinancialEvents[0].RefundEventList[0].ShipmentEvent[i].PostedDate;
console.log(AmazonOrderId);


               postdte = posteddate;

var posteddate =results.ListFinancialEventsResponse.ListFinancialEventsResult[0].FinancialEvents[0].RefundEventList[0].ShipmentEvent[i].PostedDate;

 var Countcharge =results.ListFinancialEventsResponse.ListFinancialEventsResult[0].FinancialEvents[0].RefundEventList[0].ShipmentEvent[i].ShipmentItemAdjustmentList[0].ShipmentItem[0].ItemChargeAdjustmentList[0].ChargeComponent.length;


  refund.find({ 'OrderId':AmazonOrderId,'customerid':customerid}, function (err, datas) {
console.log(i);
if(datas.length>0){



 
var id =datas[0]._id;
    refund.findByIdAndUpdate(id, {'posteddate':posteddate}, function(err, result){


asyncLoop( i+1, callback );
  
    
    });



}
else{



  var   refunds = new refund()
  var date=format('yyyy-MM-dd', new Date());
         refunds.OrderId =AmazonOrderId;
         refunds.posteddate =posteddate;
       refunds.QuantityShipped =QuantityShipped;
         
         refunds.sku=sku;
         refunds.idmatch="";
         refunds.rundate=date;
         refunds.customerid=customerid;
         refunds.Commission=0.0;
         refunds.RefundCommission=0.0;
         refunds.ShippingChargeback=0.0;
         refunds.Principal=0.0;
         refunds.ShippingCharge=0.0;
         refunds.Goodwill=0.0;
         refunds.RestockingFee=0.0;
         refunds.Promorebate=0.0;
         refunds.Returnprice=0.0;
         refunds.total=0.0;
         refunds.Tax=0.0;

         refunds.save(function(err, data){

         var id =data._id;


///////////////
function asyncLoop2( j, callback ) {
if(results.ListFinancialEventsResponse.
ListFinancialEventsResult[0].FinancialEvents[0]
.RefundEventList[0].ShipmentEvent[i].
ShipmentItemAdjustmentList[0].ShipmentItem[0].
ItemFeeAdjustmentList)
{

var Countfees =results.ListFinancialEventsResponse.
ListFinancialEventsResult[0].FinancialEvents[0]
.RefundEventList[0].ShipmentEvent[i].
ShipmentItemAdjustmentList[0].ShipmentItem[0].
ItemFeeAdjustmentList[0].FeeComponent.length;   



    if( j < Countfees ) {
var feestype =results.ListFinancialEventsResponse.ListFinancialEventsResult[0].FinancialEvents[0].RefundEventList[0].ShipmentEvent[i].ShipmentItemAdjustmentList[0].ShipmentItem[0].ItemFeeAdjustmentList[0].FeeComponent[j].FeeType;
var amount=results.ListFinancialEventsResponse.ListFinancialEventsResult[0].FinancialEvents[0].RefundEventList[0].ShipmentEvent[i].ShipmentItemAdjustmentList[0].ShipmentItem[0].ItemFeeAdjustmentList[0].FeeComponent[j].FeeAmount[0].CurrencyAmount;


/* var datas="feeType0";*/

 if(feestype=="Commission"){
  
var price=amount[0];

var col="Commission";


}

 if(feestype=="RefundCommission"){
  
  var amountS=JSON.stringify(amount[0]);
var rep = /-/gi;
var newamount = amountS.replace(rep,'');
var price= JSON.parse(newamount);

var col="RefundCommission";


}

 if(feestype=="ShippingChargeback"){
  
var price=amount[0];

var col="ShippingChargeback";


}



 product.find({'sku':sku,'customerid':customerid}, function (err, datas) {

if(datas.length>0){


 refund.findByIdAndUpdate(id,{[col]:price,'idmatch':datas[0]._id}, function(err, result){


asyncLoop2( j+1, callback );


 }); 

}
else{

asyncLoop2( j+1, callback );

}
}); 
/*var ChargeType =results.ListFinancialEventsResponse.ListFinancialEventsResult[0].FinancialEvents[0].RefundEventList[0].ShipmentEvent[i].ShipmentItemAdjustmentList[0].ShipmentItem[0].ItemChargeAdjustmentList[0].ChargeComponent[j].ChargeType;
*/



}


 else{

      callback();
    }
}
else{


callback();

}

};



asyncLoop2(0, function() {
    

  asyncLoop3(0, function() {
    


       asyncLoop4(0, function() {
    


refund.findById(id, function (err, totaldata) {
  var Principal=totaldata.Principal;
  var ShippingCharge=totaldata.ShippingCharge;
  var Goodwill=totaldata.Goodwill;

  var totalreturn= Decimal(Principal).add(ShippingCharge).add(Goodwill).toNumber();

  
  var Commission=totaldata.Commission;
  var RefundCommission=totaldata.RefundCommission;
  var ShippingChargeback=totaldata.ShippingChargeback;
 var  RestockingFee=totaldata.RestockingFee;

  var Promorebate=totaldata.Promorebate;
  var Commissiondata= Decimal(Commission).sub(RefundCommission).toNumber();
  var total= Decimal(Commissiondata).add(ShippingChargeback).add(RestockingFee).add(Promorebate).toNumber();

 refund.findByIdAndUpdate(id,{'Returnprice':totalreturn,'total':total}, function(err, result){



asyncLoop( i+1, callback );

});

});


});

});

});
function asyncLoop4( l, callback ) {

console.log(results.ListFinancialEventsResponse.ListFinancialEventsResult[0].FinancialEvents[0].RefundEventList[0].ShipmentEvent[i].ShipmentItemAdjustmentList[0].ShipmentItem[0].PromotionAdjustmentList);

if(results.ListFinancialEventsResponse.ListFinancialEventsResult[0].FinancialEvents[0].RefundEventList[0].ShipmentEvent[i].ShipmentItemAdjustmentList[0].ShipmentItem[0].PromotionAdjustmentList){



var  county=results.ListFinancialEventsResponse.ListFinancialEventsResult[0].FinancialEvents[0].RefundEventList[0].ShipmentEvent[i].ShipmentItemAdjustmentList[0].ShipmentItem[0].PromotionAdjustmentList[0].Promotion.length;

    if( l < county) {

console.log("inc");

var PromotionType =results.ListFinancialEventsResponse.ListFinancialEventsResult[0].FinancialEvents[0].RefundEventList[0].ShipmentEvent[i].ShipmentItemAdjustmentList[0].ShipmentItem[0].PromotionAdjustmentList[0].Promotion[l].PromotionType[0];
var amounts =results.ListFinancialEventsResponse.ListFinancialEventsResult[0].FinancialEvents[0].RefundEventList[0].ShipmentEvent[i].ShipmentItemAdjustmentList[0].ShipmentItem[0].PromotionAdjustmentList[0].Promotion[l].PromotionAmount[0].CurrencyAmount;




 if(PromotionType=="PromotionMetaDataDefinitionValue"){
  

if(amounts[0]!=="0.0")
{
var price=amounts[0];

var col="Promorebate";

}



}

 refund.findByIdAndUpdate(id, {[col]:price}, function(err, amounts){

asyncLoop4( l+1, callback );



}); 







}
else{

  callback();
}


}
else{
 callback();



  
}

}
function asyncLoop3( k, callback ) {


    if( k < Countcharge ) {


var ChargeType =results.ListFinancialEventsResponse.ListFinancialEventsResult[0].FinancialEvents[0].RefundEventList[0].ShipmentEvent[i].ShipmentItemAdjustmentList[0].ShipmentItem[0].ItemChargeAdjustmentList[0].ChargeComponent[k].ChargeType;
var amounts =results.ListFinancialEventsResponse.ListFinancialEventsResult[0].FinancialEvents[0].RefundEventList[0].ShipmentEvent[i].ShipmentItemAdjustmentList[0].ShipmentItem[0].ItemChargeAdjustmentList[0].ChargeComponent[k].ChargeAmount[0].CurrencyAmount;
console.log(amounts);


 if(ChargeType=="Principal"){

  var amountS=JSON.stringify(amounts[0]);
var rep = /-/gi;
var newamount = amountS.replace(rep,'');
var price= JSON.parse(newamount);

var col="Principal";


}
 if(ChargeType=="ShippingCharge"){
  
  var amountS=JSON.stringify(amounts[0]);
var rep = /-/gi;
var newamount = amountS.replace(rep,'');
var price= JSON.parse(newamount);

var col="ShippingCharge";


}
 if(ChargeType=="Goodwill"){
    var amountS=JSON.stringify(amounts[0]);
var rep = /-/gi;
var newamount = amountS.replace(rep,'');
var price= JSON.parse(newamount);

var col="Goodwill";


}
 if(ChargeType=="RestockingFee"){
  
  var amountS=JSON.stringify(amounts[0]);
var rep = /-/gi;
var newamount = amountS.replace(rep,'');
var price= JSON.parse(newamount);

var col="RestockingFee";


}
 if(ChargeType=="Tax"){
  
  var amountS=JSON.stringify(amounts[0]);
var rep = /-/gi;
var newamount = amountS.replace(rep,'');
var price= JSON.parse(newamount);

var col="Tax";


}


 product.find({'sku':sku,'customerid':customerid}, function (err, datas) {

if(datas.length>0){


 refund.findByIdAndUpdate(id,{[col]:price,'idmatch':datas[0]._id}, function(err, result){


asyncLoop3( k+1, callback );


 }); 

}

else{
asyncLoop3( k+1, callback );

  
}
}); 






}
else{

  callback();
}


}

});

///////////

/*
  \
  ////////////////syncLoop( i+1, callback );*/

}

});

   }



else{

  callback();

 }

}

asyncLoop(0, function() {

if(token1!=="undefined"){

nexttoken(token1);


}
else{

 console.log("sucess");
}

});
///////////////////////////////

///////////////////
}

///////


/////
});
   }
});
//////nexttoken/


function nexttoken(token){



      var mws = require('amazon-mws-node')({
    AmzSecretKey: amzSecretKey,
    AWSAccessKeyId: aWSAccessKeyId
  });
 

  mws({
    method: 'POST',
    base: 'mws.amazonservices.com',
    endpoint: '/Finances/2015-05-01',
    params: {
 'Action': 'ListFinancialEventsByNextToken',
      'SellerId': SellerId,
     'NextToken':token


      
    },
    callback: function (error, response, body) {

   var parseString = require('xml2js').parseString;

parseString(body, function (err, results) {

if(results){


if(results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].NextToken){


  var tokens=results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].NextToken[0];
console.log(tokens);

}
else{


var tokens="undefined";


}

}




if(results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].RefundEventList[0])
   {

var count  =results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].RefundEventList[0].ShipmentEvent.length;

console.log(count);


function asyncLoop( i, callback ) {
    if( i < count ) {
console.log("hof");

var AmazonOrderId =results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].RefundEventList[0].ShipmentEvent[i].AmazonOrderId;
console.log(AmazonOrderId);
var sku =results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].RefundEventList[0].ShipmentEvent[i].ShipmentItemAdjustmentList[0].ShipmentItem[0].SellerSKU;
var QuantityShipped =results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].RefundEventList[0].ShipmentEvent[i].ShipmentItemAdjustmentList[0].ShipmentItem[0].QuantityShipped;

var posteddate =results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].RefundEventList[0].ShipmentEvent[i].PostedDate;




 var Countcharge =results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].RefundEventList[0].ShipmentEvent[i].ShipmentItemAdjustmentList[0].ShipmentItem[0].ItemChargeAdjustmentList[0].ChargeComponent.length;

 refund.find({ 'OrderId':AmazonOrderId,'customerid':customerid}, function (err, datas) {
console.log(i);
if(datas.length>0){



 
var id =datas[0]._id;
    refund.findByIdAndUpdate(id, {'posteddate':posteddate}, function(err, result){


asyncLoop( i+1, callback );
  
    
    });



}
else{





  var   refunds = new refund()
  var date=format('yyyy-MM-dd', new Date());
         refunds.OrderId =AmazonOrderId;
         refunds.posteddate =posteddate;
         refunds.QuantityShipped =QuantityShipped;  
         refunds.sku=sku;
         refunds.idmatch="";
         refunds.rundate=date;
         refunds.customerid=customerid;
         refunds.Commission=0.0;
         refunds.RefundCommission=0.0;
         refunds.ShippingChargeback=0.0;
         refunds.Principal=0.0;
         refunds.ShippingCharge=0.0;
         refunds.Goodwill=0.0;
         refunds.RestockingFee=0.0;
         refunds.Promorebate=0.0;
         refunds.Returnprice=0.0;
         refunds.total=0.0;

         refunds.save(function(err, data){

var id =data._id;



///////////////
function asyncLoop2( j, callback ) {

if(results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].RefundEventList[0].ShipmentEvent[i].ShipmentItemAdjustmentList[0].ShipmentItem[0].ItemFeeAdjustmentList)

{
  var Countfees =results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].RefundEventList[0].ShipmentEvent[i].ShipmentItemAdjustmentList[0].ShipmentItem[0].ItemFeeAdjustmentList[0].FeeComponent.length;   

    if( j < Countfees ) {

var feestype =results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].RefundEventList[0].ShipmentEvent[i].ShipmentItemAdjustmentList[0].ShipmentItem[0].ItemFeeAdjustmentList[0].FeeComponent[j].FeeType;
var amount=results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].RefundEventList[0].ShipmentEvent[i].ShipmentItemAdjustmentList[0].ShipmentItem[0].ItemFeeAdjustmentList[0].FeeComponent[j].FeeAmount[0].CurrencyAmount;


if(feestype=="Commission"){
  
var price=amount[0];

var col="Commission";


}

 if(feestype=="RefundCommission"){
  
  var amountS=JSON.stringify(amount[0]);
var rep = /-/gi;
var newamount = amountS.replace(rep,'');
var price= JSON.parse(newamount);

var col="RefundCommission";


}

 if(feestype=="ShippingChargeback"){
  
var price=amount[0];

var col="ShippingChargeback";

}

product.find({'sku':sku,'customerid':customerid}, function (err, datas) {
if(datas.length>0){


refund.findByIdAndUpdate(id,{[col]:price,'idmatch':datas[0]._id}, function(err, result){

asyncLoop2( j+1, callback );


}); 
}
else{
asyncLoop2( j+1, callback );
  
}


});  


}
 else{

      callback();
    }
}

else{
callback();

}
};

asyncLoop2(0, function() {
    
  asyncLoop3(0, function() {

       asyncLoop4(0, function() {
    
refund.findById(id, function (err, totaldata) {
  var Principal=totaldata.Principal;
  var ShippingCharge=totaldata.ShippingCharge;
  var Goodwill=totaldata.Goodwill;

  var totalreturn= Decimal(Principal).add(ShippingCharge).add(Goodwill).toNumber();

var Commission=totaldata.Commission;
  var RefundCommission=totaldata.RefundCommission;
  var ShippingChargeback=totaldata.ShippingChargeback;
 var  RestockingFee=totaldata.RestockingFee;

  var Promorebate=totaldata.Promorebate;
  var Commissiondata= Decimal(Commission).sub(RefundCommission).toNumber();
  var total= Decimal(Commissiondata).add(ShippingChargeback).add(RestockingFee).add(Promorebate).toNumber();

 refund.findByIdAndUpdate(id,{'Returnprice':totalreturn,'total':total}, function(err, result){


asyncLoop( i+1, callback );



     });

    });

   });


 });

});

function asyncLoop4( l, callback ) {


if(results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].RefundEventList[0].ShipmentEvent[i].ShipmentItemAdjustmentList[0].ShipmentItem[0].PromotionAdjustmentList){

var  countnext=results.ListFinancialEventsByNextTokenResponse.
ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].
RefundEventList[0].ShipmentEvent[i].ShipmentItemAdjustmentList[0].
ShipmentItem[0].PromotionAdjustmentList[0].Promotion.length;




    if( l < countnext ) {


var PromotionType =results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].RefundEventList[0].
ShipmentEvent[i].ShipmentItemAdjustmentList[0].ShipmentItem[0].PromotionAdjustmentList[0].Promotion[l].PromotionType[0];

var amounts =results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].RefundEventList[0].ShipmentEvent[i].
ShipmentItemAdjustmentList[0].ShipmentItem[0].PromotionAdjustmentList[0].Promotion[l].PromotionAmount[0].CurrencyAmount;


 if(PromotionType=="PromotionMetaDataDefinitionValue"){
  

if(amounts[0]!=="0.0")
{
var price=amounts[0];

var col="Promorebate";

}

}

refund.findByIdAndUpdate(id, {[col]:price}, function(err, amounts){

asyncLoop4( l+1, callback );



}); 



}
else{

  callback();
}


}
else{
 callback();

}

}
function asyncLoop3( k, callback ) {

    if( k < Countcharge ) {

var ChargeType =results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].RefundEventList[0].ShipmentEvent[i].ShipmentItemAdjustmentList[0].ShipmentItem[0].ItemChargeAdjustmentList[0].ChargeComponent[k].ChargeType;
var amounts =results.ListFinancialEventsByNextTokenResponse.ListFinancialEventsByNextTokenResult[0].FinancialEvents[0].RefundEventList[0].ShipmentEvent[i].ShipmentItemAdjustmentList[0].ShipmentItem[0].ItemChargeAdjustmentList[0].ChargeComponent[k].ChargeAmount[0].CurrencyAmount;

 if(ChargeType=="Principal"){
  
  var amountS=JSON.stringify(amounts[0]);
var rep = /-/gi;
var newamount = amountS.replace(rep,'');
var price= JSON.parse(newamount);

var col="Principal";


}
 if(ChargeType=="ShippingCharge"){
  
  var amountS=JSON.stringify(amounts[0]);
var rep = /-/gi;
var newamount = amountS.replace(rep,'');
var price= JSON.parse(newamount);

var col="ShippingCharge";


}
 if(ChargeType=="Goodwill"){
  
  var amountS=JSON.stringify(amounts[0]);
var rep = /-/gi;
var newamount = amountS.replace(rep,'');
var price= JSON.parse(newamount);

var col="Goodwill";


}
 if(ChargeType=="RestockingFee"){
  
var price=amounts[0];

var col="RestockingFee";


}

 product.find({'sku':sku,'customerid':customerid}, function (err, datas) {

if(datas.length>0){

 refund.findByIdAndUpdate(id,{[col]:price,'idmatch':datas[0]._id}, function(err, result){


 asyncLoop3( k+1, callback );


 }); 

}
else{


  
 asyncLoop3( k+1, callback );
}
  
});  




}
else{

  callback();
}


}

});

///////////

/*
  \
  ////////////////syncLoop( i+1, callback );*/
}
});

   }

else{

  callback();

 }

}
asyncLoop(0, function() {

if(tokens!=="undefined"){

nexttoken(tokens);


}
else{

  console.log("sucess");
}


});
}
else{
if(tokens!=="undefined"){

nexttoken(tokens);


}
else{

  console.log("success");
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
//////////////////////////////other fees////////////


   app.get('/testotherfees', function  (req, res) {

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
      'ReportTypeList.Type.1': '_GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE_',
    'RequestedFromDate':prevdays+'T00:00:00.50-00',
    'RequestedToDate':Currentdate+'T00:00:00.50-00',
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
      'ReportId' : "7071036076017478",
    'SellerId': SellerId
    },
    callback: function (error, response, body) {

try{

var Converter = require("csvtojson").Converter;
var converter = new Converter({delimiter:'\t'});  
converter.fromString(body, function(err,result){
//res.send(result);

var count=result.length;
console.log(result.length);

var settlementid=result[0]['settlement-id'];



otherfees.findOne({'settlementid':settlementid,'customerid':customerid}, function (err, data) {

  if(data==null){



function asyncLoop( i, callback ) { 

    if( i < count ) {

      console.log(i);
       
    if(result[i]['transaction-type']=="Storage Fee"){

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
     

    else if(result[i]['transaction-type']=="DisposalComplete"){

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

    else if(result[i]['transaction-type']=="RemovalComplete"){ 

            var Orderid=result[i]['order-id'];
            var posteddate=result[i]['posted-date'];
            var otheramount=result[i]['other-amount'];
            var amountS=JSON.stringify(otheramount);
            var rep = /-/gi;
            var newamount = amountS.replace(rep,'');
            var price= JSON.parse(newamount);
           
     removal.findOne({ 'orderid':Orderid,'customerid':customerid}, function (err, resdata) {

         if(resdata==null){

   
    var removals = new removal()
    removals.requestdate=posteddate;
    removals.orderid=Orderid;
    removals.sku="";
    removals.customerid=customerid;
    removals.removalfee=price;
    removals.rundate="";
    
     removals.save(function(err, data){
      
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

       });  

     }

    else if(result[i]['transaction-type']=="Refund"){ 
          console.log(Orderid);
             console.log("refund");
            var Orderid=result[i]['order-id'];
            var sku=result[i]['sku'];
            var posteddate=result[i]['posted-date'];
            var quantitypurchased=result[i]['quantity-purchased'];
            var pricetype=result[i]['price-type'];
            var itemrelatedfeetype=result[i]['item-related-fee-type'];
           var promotiontype=result[i]['promotion-type'];


              if(promotiontype=="Shipping"){
       
           var price=result[i]['promotion-amount'];
           var col="Promorebate";

            }


           if(pricetype=="Principal"){
       
            var amountS=JSON.stringify(result[i]['price-amount']);
            var rep = /-/gi;
            var newamount = amountS.replace(rep,'');
            var price= JSON.parse(newamount);
            var col="Principal";

            }

          if(pricetype=="RestockingFee"){

           var price=result[i]['price-amount'];
           var col="RestockingFee";

            }

         if(pricetype=="Tax"){

            var amountS=JSON.stringify(result[i]['price-amount']);
            var rep = /-/gi;
            var newamount = amountS.replace(rep,'');
            var price= JSON.parse(newamount);
            var col="Tax";

            }

           if(pricetype=="Goodwill"){

            var amountS=JSON.stringify(result[i]['price-amount']);
            var rep = /-/gi;
            var newamount = amountS.replace(rep,'');
            var price= JSON.parse(newamount);
            var col="Goodwill";

            }  
 
       if(pricetype=="Shipping"){

            var amountS=JSON.stringify(result[i]['price-amount']);
            var rep = /-/gi;
            var newamount = amountS.replace(rep,'');
            var price= JSON.parse(newamount);
            var col="ShippingCharge";

         } 

      if(itemrelatedfeetype=="Commission"){
        
       var price=result[i]['item-related-fee-amount'];
       var col="Commission";

       }

       if(itemrelatedfeetype=="RefundCommission"){

      var amountS=JSON.stringify(result[i]['item-related-fee-amount']);
      var rep = /-/gi;
      var newamount = amountS.replace(rep,'');
      var price= JSON.parse(newamount);
      var col="RefundCommission";

       }
      if(itemrelatedfeetype=="ShippingChargeback"){
        
       var price=result[i]['item-related-fee-amount'];
       var col="ShippingChargeback";

       }


  refund.findOne({ 'OrderId':Orderid,'customerid':customerid}, function (err, resdata) {

     if(resdata==null){

      var   refunds = new refund()
  var date=format('yyyy-MM-dd', new Date());
         refunds.OrderId =Orderid;
         refunds.posteddate =posteddate;
         refunds.QuantityShipped =quantitypurchased;  
         refunds.sku=sku;
         refunds.idmatch="";
         refunds.customerid=customerid;
         refunds.Commission=0.0;
         refunds.RefundCommission=0.0;
         refunds.ShippingChargeback=0.0;
         refunds.Principal=0.0;
         refunds.ShippingCharge=0.0;
         refunds.Goodwill=0.0;
         refunds.RestockingFee=0.0;
         refunds.Promorebate=0.0;
         refunds.Returnprice=0.0;
         refunds.total=0.0;

         refunds.save(function(err, data){

      var idr= data._id;

    
    product.findOne({'sku':sku,'customerid':customerid}, function (err, datas) {

     if(datas==null){


refund.findByIdAndUpdate(idr,{[col]:price}, function(err, result){

 setTimeout( function() {
                asyncLoop( i+1, callback );
            }, 0 );
    });


     }
     else{
refund.findByIdAndUpdate(idr,{[col]:price,'idmatch':datas._id}, function(err, result){

 setTimeout( function() {
                asyncLoop( i+1, callback );
            }, 0 );
    });



     }

 
}); 
    
        


      });

     }

     else{

      
refund.findByIdAndUpdate(resdata._id, {[col]:price}, function(err, amounts){
console.log(amounts);

refund.findById(amounts._id, function (err, totaldata) {
  var Principal=totaldata.Principal;
  var ShippingCharge=totaldata.ShippingCharge;
  var Goodwill=totaldata.Goodwill;

  var totalreturn= Decimal(Principal).add(ShippingCharge).add(Goodwill).toNumber();

var Commission=totaldata.Commission;
  var RefundCommission=totaldata.RefundCommission;
  var ShippingChargeback=totaldata.ShippingChargeback;
 var  RestockingFee=totaldata.RestockingFee;

  var Promorebate=totaldata.Promorebate;
  var Commissiondata= Decimal(Commission).sub(RefundCommission).toNumber();
  var total= Decimal(Commissiondata).add(ShippingChargeback).add(RestockingFee).add(Promorebate).toNumber();

 refund.findByIdAndUpdate(totaldata._id,{'Returnprice':totalreturn,'total':total}, function(err, result){


 setTimeout( function() {
                asyncLoop( i+1, callback );
            }, 0 );




});


});

}); 



     }


  });




             }
 
      else if(result[i]['transaction-type']=="Order"){ 

       var Orderid=result[i]['order-id'];
       var pricetype=result[i]['price-type'];
       var itemrelatedfeetype=result[i]['item-related-fee-type'];
       var sku=result[i]['sku'];
       var posteddate=result[i]['posted-date'];
       var quantitypurchased=result[i]['quantity-purchased'];

        if(pricetype=="Principal"){

       var price=result[i]['price-amount'];
       var col="ItemPrice";

       }

       if(pricetype=="Shipping"){

       var price=result[i]['price-amount'];
       var col="expenses.income.ShippingCharge";

       }
       if(pricetype=="Tax"){

       var price=result[i]['price-amount'];
       var col="Tax.Tax";

       }
        if(pricetype=="ShippingTax"){

       var price=result[i]['price-amount'];
       var col="Tax.ShippingTax";

       }
       if(itemrelatedfeetype=="FBAPerUnitFulfillmentFee"){

      var amountS=JSON.stringify(result[i]['item-related-fee-amount']);
      var rep = /-/gi;
      var newamount = amountS.replace(rep,'');
      var price= JSON.parse(newamount);
      var col="expenses.FBATransactionFees.FBAFulfillmentFees";

       }
      if(itemrelatedfeetype=="Commission"){

      var amountS=JSON.stringify(result[i]['item-related-fee-amount']);
      var rep = /-/gi;
      var newamount = amountS.replace(rep,'');
      var price= JSON.parse(newamount);
      var col="expenses.SellingFees.Commission";

       }

      if(itemrelatedfeetype=="ShippingChargeback"){

      var amountS=JSON.stringify(result[i]['item-related-fee-amount']);
      var rep = /-/gi;
      var newamount = amountS.replace(rep,'');
      var price= JSON.parse(newamount);
      var col="expenses.FBATransactionFees.ShippingChargeback";

       }
   

               
  Order.findOne({ 'OrderId':Orderid,'customerid':customerid}, function (err, resdata) {

   if(resdata==null){
     console.log(Orderid);

        var   orderS = new Order()
         orderS.PurchaseDate=posteddate;
         orderS.lastupdateddate="";
         orderS.OrderId =Orderid;
         orderS.OrderStatus ="Shipped";
         orderS.customerid=customerid;
         orderS.ASIN="";
         orderS.ItemPrice="";
         orderS.Title="";
         orderS.QuantityOrdered=quantitypurchased;
         orderS.Principal="";
         orderS.sellersku=sku;
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

         product.findOne({'sku':sku,'customerid':customerid}, function (err, datas) {

if(datas==null){
  
 setTimeout( function() {
                asyncLoop( i+1, callback );
            }, 0 );


}
else{

 Order.findByIdAndUpdate(data._id, {'idmatch':datas._id,'buycost':datas.buycost,'ASIN':datas.asin,'Title':datas.productname}, function(err, result){


 setTimeout( function() {
                asyncLoop( i+1, callback );
            }, 0 );
  
    
    });



}
   
  });



  

        });



   }
   else{


    Order.findByIdAndUpdate(resdata._id, {[col]:price,'OrderStatus':'Shipped'}, function(err, amount){


 setTimeout( function() {
                asyncLoop( i+1, callback );
            }, 0 ); 


   });
  




   }


    });
         
 



              }
 
     else if(result[i]['transaction-type']=="BalanceAdjustment"){ 


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

    var    otherFees = new otherfees()
         otherFees.amount =amount;
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
asyncLoop(5000, function() {
    
 console.log("done");


 });
}
else{
  res.send('report already run on system');
 console.log('report already run on system');

 }
});


 });
}
catch(err){
res.send("something is missing");
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


    });

/////////////////////////////Inbound shipping///////////////

app.get('/testinbound',function(req, res) {

  user.find({"local.role":'customer'}, function (err, data) {

async.eachSeries(data, function(resultuser, callbacks) {

var amzSecretKey=resultuser.amazonkeys.AmzSecretKey;
var aWSAccessKeyId=resultuser.amazonkeys.AWSAccessKeyId;
var SellerId=resultuser.amazonkeys.SellerId;
var Marketplaceid=resultuser.amazonkeys.marketplaceid;

var customerid=resultuser._id;

  var oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      var currweek=format('yyyy-MM-dd');

   var prevweek=format('yyyy-MM-dd',oneWeekAgo);
 
      var mws = require('amazon-mws-node')({
    AmzSecretKey: amzSecretKey,
    AWSAccessKeyId: aWSAccessKeyId
  });
 
  mws({
    method: 'POST',
    base: 'mws.amazonservices.com',
    endpoint: '/FulfillmentInboundShipment/2010-10-01',
    params: {
      'Action': 'ListInboundShipments',
      'SellerId': SellerId,
     'LastUpdatedAfter':'2017-11-01T00:00:00.50-00',
     'LastUpdatedBefore':'2017-11-15T00:00:00.50-00',
     'ShipmentStatusList.member.1':'CLOSED',
    'ShipmentStatusList.member.2':'RECEIVING'


    },
    callback: function (error, response, body) {

   var parseString = require('xml2js').parseString;

parseString(body, function (err, results) {


try{

if(results.ListInboundShipmentsResponse.ListInboundShipmentsResult[0].ShipmentData[0]!==""){

if(results.ListInboundShipmentsResponse.ListInboundShipmentsResult[0].NextToken){
var token=results.ListInboundShipmentsResponse.ListInboundShipmentsResult[0].NextToken[0];


}
else{

var token="";

}


var Count =results.ListInboundShipmentsResponse.ListInboundShipmentsResult[0].ShipmentData[0].member.length;


function asyncLoop(i ,callback){


   if(i<Count){

var Destination=results.ListInboundShipmentsResponse.ListInboundShipmentsResult[0].ShipmentData[0].member[i].DestinationFulfillmentCenterId[0];
var ShipmentId =  results.ListInboundShipmentsResponse.ListInboundShipmentsResult[0].ShipmentData[0].member[i].ShipmentId[0];
var ShipmentStatus =  results.ListInboundShipmentsResponse.ListInboundShipmentsResult[0].ShipmentData[0].member[i].ShipmentStatus[0];
var ShipmentName =  results.ListInboundShipmentsResponse.ListInboundShipmentsResult[0].ShipmentData[0].member[i].ShipmentName[0];
/////
var min= ShipmentName.slice(-1);
   var n = 2; // second space

var a = ShipmentName.split(' ')
var first = a.slice(0, n).join(' ')

first.substr(0,first.indexOf('(')); // "72"
var d=first.substr(first.indexOf(' ')+1);

var ship=d.replace("(","");

  var shipdate=moment(ship, "MM/DD/YY").format("YYYY-MM-DD");

  var new_date = moment(shipdate, "YYYY-MM-DD").add(1, 'days');

  var shipdate2=moment(new_date, "YYYY-MM-DD").format("YYYY-MM-DD");
///////

/////

  inbound.find({ 'ShipmentId':ShipmentId,'customerid':customerid}, function (err, datas) {

console.log(datas);

if(datas.length>0){
  
var id =datas[0]._id;

inbound.findByIdAndUpdate(id, {'date':shipdate2,'DestinationCenterId':Destination,'ShipmentStatus':ShipmentStatus}, function(err, result){

asyncLoop( i+1, callback );

});

}
else{

var inboundship = new inbound()
    inboundship.date=shipdate2;
    inboundship.ShipmentId=ShipmentId;
    inboundship.ShipmentStatus=ShipmentStatus;
    inboundship.Amount="";
    inboundship.DestinationCenterId=Destination;
    inboundship.customerid=customerid;
    
    inboundship.save(function(err, data){
      console.log(data);
asyncLoop( i+1, callback );

    });
}


});
///

    
 

   }
    
    else{

   callback();
  

    }

}

asyncLoop(0, function() {

console.log(token);

nexttoken(token,1);



});


function nexttoken(token,sign){

if(token==""){

  if(sign==1){

shipmentothers();

}
 if(sign==2){

shippmentprice();

}

}
else{

console.log(token);


      var mws = require('amazon-mws-node')({
    AmzSecretKey: amzSecretKey,
    AWSAccessKeyId: aWSAccessKeyId
  });
 

  mws({
    method: 'POST',
    base: 'mws.amazonservices.com',
    endpoint: '/FulfillmentInboundShipment/2010-10-01',
    params: {
      'Action': 'ListInboundShipmentsByNextToken',
      'SellerId': SellerId,
       'NextToken':token

    },
    callback: function (error, response, body) {

   var parseString = require('xml2js').parseString;

parseString(body, function (err, results) {

//res.send(results);

if(results.ListInboundShipmentsByNextTokenResponse.ListInboundShipmentsByNextTokenResult[0].ShipmentData[0]!==""){
if(results.ListInboundShipmentsByNextTokenResponse.ListInboundShipmentsByNextTokenResult[0].NextToken){
var token2=results.ListInboundShipmentsByNextTokenResponse.ListInboundShipmentsByNextTokenResult[0].NextToken[0];


}
else{

var token2="";

}
console.log(token2);


var Count =results.ListInboundShipmentsByNextTokenResponse.ListInboundShipmentsByNextTokenResult[0].ShipmentData[0].member.length;


function asyncLoop2(i , callback){


   if(i<Count){
var Destination=results.ListInboundShipmentsByNextTokenResponse.ListInboundShipmentsByNextTokenResult[0].ShipmentData[0].member[i].DestinationFulfillmentCenterId[0];

  var ShipmentId =  results.ListInboundShipmentsByNextTokenResponse.ListInboundShipmentsByNextTokenResult[0].ShipmentData[0].member[i].ShipmentId[0];


  var ShipmentStatus =  results.ListInboundShipmentsByNextTokenResponse.ListInboundShipmentsByNextTokenResult[0].ShipmentData[0].member[i].ShipmentStatus[0];

   var ShipmentName =  results.ListInboundShipmentsByNextTokenResponse.ListInboundShipmentsByNextTokenResult[0].ShipmentData[0].member[i].ShipmentName[0];

/////
var min= ShipmentName.slice(-1);
   var n = 2; // second space

var a = ShipmentName.split(' ')
var first = a.slice(0, n).join(' ')

first.substr(0,first.indexOf('(')); // "72"
var d=first.substr(first.indexOf(' ')+1);

var ship=d.replace("(","");

  var shipdate=moment(ship, "MM/DD/YY").format("YYYY-MM-DD");

  var new_date = moment(shipdate, "YYYY-MM-DD").add(1, 'days');

  var shipdate2=moment(new_date, "YYYY-MM-DD").format("YYYY-MM-DD");
///////

/////

  inbound.find({ 'ShipmentId':ShipmentId,'customerid':customerid}, function (err, datas) {

if(datas.length>0){
  
var id =datas[0]._id;

inbound.findByIdAndUpdate(id, {'date':shipdate2,'DestinationCenterId':Destination,'ShipmentStatus':ShipmentStatus}, function(err, result){
console.log(result);
asyncLoop2( i+1, callback );

 });

}
else{

var inboundship = new inbound()
    inboundship.date=shipdate2;
    inboundship.ShipmentId=ShipmentId;
    inboundship.ShipmentStatus=ShipmentStatus;
    inboundship.Amount="";
    inboundship.DestinationCenterId=Destination;
    inboundship.customerid=customerid;  
    inboundship.save(function(err, data){
      console.log(data);
    asyncLoop2( i+1, callback );

    });
  }


});


   }
    
    else{

   callback();
  

    }




}

asyncLoop2(0, function() {

nexttoken(token2,1);



   });
   }
   else{


  if(sign==1){

    var tokens="";
nexttoken(tokens,1);

}
 if(sign==2){

    var tokens="";
nexttoken(tokens,2);

}

    console.log("not data find in token")
   }
  });
 }
});






}


}
/////////////////////////////////////////


function shipmentothers(){
  console.log("shipmentothers");

  var oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

   var prevweek=format('yyyy-MM-dd',oneWeekAgo);

      var currweek=format('yyyy-MM-dd');
 
      var mws = require('amazon-mws-node')({
    AmzSecretKey: amzSecretKey,
    AWSAccessKeyId: aWSAccessKeyId
  });
 

  mws({
    method: 'POST',
    base: 'mws.amazonservices.com',
    endpoint: '/FulfillmentInboundShipment/2010-10-01',
    params: {
      'Action': 'ListInboundShipments',
      'SellerId': SellerId,
     'LastUpdatedAfter':'2017-11-01T00:00:00.50-00',
     'LastUpdatedBefore':'2017-11-15T00:00:00.50-00',
     'ShipmentStatusList.member.1':'SHIPPED',
    'ShipmentStatusList.member.2':'IN_TRANSIT'


    },
    callback: function (error, response, body) {

   var parseString = require('xml2js').parseString;

parseString(body, function (err, results) {

 // res.send(results);

if(results.ListInboundShipmentsResponse.ListInboundShipmentsResult[0].ShipmentData[0]!==""){

if(results.ListInboundShipmentsResponse.ListInboundShipmentsResult[0].NextToken){
var token=results.ListInboundShipmentsResponse.ListInboundShipmentsResult[0].NextToken[0];


}
else{

var token="";

}
console.log(token);

var Count =results.ListInboundShipmentsResponse.ListInboundShipmentsResult[0].ShipmentData[0].member.length;


function asyncLoop(i ,callback){


   if(i<Count){

var Destination=results.ListInboundShipmentsResponse.ListInboundShipmentsResult[0].ShipmentData[0].member[i].DestinationFulfillmentCenterId[0];
var ShipmentId =  results.ListInboundShipmentsResponse.ListInboundShipmentsResult[0].ShipmentData[0].member[i].ShipmentId[0];
var ShipmentStatus =  results.ListInboundShipmentsResponse.ListInboundShipmentsResult[0].ShipmentData[0].member[i].ShipmentStatus[0];
var ShipmentName =  results.ListInboundShipmentsResponse.ListInboundShipmentsResult[0].ShipmentData[0].member[i].ShipmentName[0];
/////
var min= ShipmentName.slice(-1);
   var n = 2; // second space

var a = ShipmentName.split(' ')
var first = a.slice(0, n).join(' ')

first.substr(0,first.indexOf('(')); // "72"
var d=first.substr(first.indexOf(' ')+1);

var ship=d.replace("(","");

  var shipdate=moment(ship, "MM/DD/YY").format("YYYY-MM-DD");

  var new_date = moment(shipdate, "YYYY-MM-DD").add(1, 'days');

  var shipdate2=moment(new_date, "YYYY-MM-DD").format("YYYY-MM-DD");
///////

/////

  inbound.find({ 'ShipmentId':ShipmentId,'customerid':customerid}, function (err, datas) {

if(datas.length>0){
  console.log(datas);
var id =datas[0]._id;

inbound.findByIdAndUpdate(id, {'date':shipdate2,'DestinationCenterId':Destination,'ShipmentStatus':ShipmentStatus}, function(err, result){
console.log(result);
asyncLoop( i+1, callback );

});

}
else{

var inboundship = new inbound()
    inboundship.date=shipdate2;
    inboundship.ShipmentId=ShipmentId;
    inboundship.ShipmentStatus=ShipmentStatus;
    inboundship.Amount="";
    inboundship.DestinationCenterId=Destination;
    inboundship.customerid=customerid;
    
    inboundship.save(function(err, data){
        console.log(data);

asyncLoop( i+1, callback );

    });
}


});
///

    
 

   }
    
    else{

   callback();
  

    }

}

asyncLoop(0, function() {

nexttoken(token,2);



});
}
else{

shippmentprice();

}

});
}
});

}





/////////////////////////////

///////////////////

function shippmentprice()

{
console.log("enter price");

  var mws = require('amazon-mws-node')({
    AmzSecretKey: amzSecretKey,
    AWSAccessKeyId:aWSAccessKeyId
  });
 
 inbound.find({'customerid':customerid,'Amount':null}, function (err, data) {
var count = data.length;
 let cnt = 0;


async.eachSeries(data, function(item, callback) {

var shipid=item.ShipmentId;
var id =item.id;

 cnt++;
if(cnt==count){
  

callbacks();

}




  mws({
    method: 'POST',
    base: 'mws.amazonservices.com',
    endpoint: '/FulfillmentInboundShipment/2010-10-01',
    params: {
      'Action': 'GetTransportContent',
      'SellerId': SellerId,
     'ShipmentId':shipid 

    },
    callback: function (error, response, body) {

   var parseString = require('xml2js').parseString;

parseString(body, function (err, results) {

if(!results.ErrorResponse)
{

if(results.GetTransportContentResponse.GetTransportContentResult[0].TransportContent[0].
  TransportDetails[0].PartneredSmallParcelData){

if(results.GetTransportContentResponse.GetTransportContentResult[0].TransportContent[0].
  TransportDetails[0].PartneredSmallParcelData[0].PartneredEstimate){

var price =results.GetTransportContentResponse.GetTransportContentResult[0].TransportContent[0].
  TransportDetails[0].PartneredSmallParcelData[0].PartneredEstimate[0].Amount[0].Value[0];

console.log(price);

}

else{

var price =0.0;

 }

}

 inbound.findByIdAndUpdate(id, {'Amount':price}, function(err, amounts){
console.log(amounts)



callback();


});





}

else{

callback();

 }

     });
    }
   });
  });
 });



}




////////////////////////

}
else{


console.log("Not Find");


}

}
catch(err){

res.send("Catch block");

}


  });
  }
 });
 });
 });

});




};