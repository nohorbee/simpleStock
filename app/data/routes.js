const request = require('request');
var parseString = require('xml2js').parseString;
const url = "http://dev.markitondemand.com/MODApis/Api/v2/Quote?symbol="

const MULE_SYMBOL = "MULE";
const SALESFORCE_SYMBOL = "CRM";
const MULE_STOCK_COUNT = process.env.MULE_STOCK_COUNT;
const SALESFORCE_STOCK_COUNT = MULE_STOCK_COUNT * 0.0711
const MULE_STOCK_FROZEN_PRICE = 36

module.exports = function(app, db) {

  app.get('/data/', (req, res) => {
    if(!process.env.TOKEN) res.status('503').send("The security has not been configured yet");
    if(req.headers.authorization !== process.env.TOKEN) res.status('401').send();


    // try {
    //   filters = (req.query.filters ? JSON.parse(req.query.filters) : null);
    // } catch (err) {
    //   res.status('400').send('Filters parameter is not a valid JSON');
    // }

    getPrice(MULE_SYMBOL).then(muleStockPrice => {
      getPrice(SALESFORCE_SYMBOL).then(salesForceStockPrice => {

        let response = {
          mule: {
            frozenPrice: MULE_STOCK_FROZEN_PRICE,
            price: muleStockPrice,
            qty: MULE_STOCK_COUNT
          },
          salesForce: {
            price: salesForceStockPrice,
            qty: SALESFORCE_STOCK_COUNT,
          }
        };

        res.send(response);


        console.log("Mule")
        let muleValue = muleStockPrice * MULE_STOCK_COUNT;
        console.log("QTY: "+ MULE_STOCK_COUNT +" - PRICE: " + muleStockPrice + " = " + muleValue);

        console.log("Mule Frozen")
        let muleFrozenValue = MULE_STOCK_FROZEN_PRICE * MULE_STOCK_COUNT;
        console.log("QTY: "+ MULE_STOCK_COUNT +" - PRICE: " + MULE_STOCK_FROZEN_PRICE + " = " + muleFrozenValue);


        console.log("Salesforce")
        let salesForceValue = salesForceStockPrice * SALESFORCE_STOCK_COUNT
        console.log("QTY: "+ SALESFORCE_STOCK_COUNT +" - PRICE: " + salesForceStockPrice);
        let frozenTotal = muleFrozenValue + salesForceValue;
        console.log("Frozen selling = " + frozenTotal)

      })
    }).catch(err => { console.log("there has been some error: " + err) });

  });

}

function getPrice(stock) {
  return new Promise((resolve, reject) => {

    let path = url + stock;

    request.get(path, (error, response, body) => {
      if(error) {
        reject(error);
      } else {
        parseString(body, (err, result) => {
            let price = result.StockQuote.LastPrice[0];
            resolve(price);
        });


      }
    });

  })
}
