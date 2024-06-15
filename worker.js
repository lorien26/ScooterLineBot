const { time } = require("console");
const { parentPort } = require("worker_threads");
async function shell(){
const {DbApi} = require('./dbAPI.js')
const db = new DbApi('./mainDB.db')
await db.init()
const DostavistaURL = await db.getData('DostavistaURL')
const dostavistaToken = await db.getData('dostavistaToken')
let isReloaded = false
console.log("Воркер инициализирован");
parentPort.on("message", (msg) => {
  if(msg.type === "reload"){
    isReloaded = true;
  }

});
async function courierSearch() {
    const listOfManagersW = await db.getOrdersWithoutCourier()
    listOfManagersW.forEach(a => {
        fetch(
            `${DostavistaURL}courier?order_id=${a.dostavistaOrderID}`,
            {
              headers: {
                "X-DV-Auth-Token": dostavistaToken,
              },
              method: "GET",
            }
          )
            .then((response) => response.json())
            .then((result) => {
              console.log(result);
              if (result.isSuccessful) {
                if (result.courier) {
                  parentPort.postMessage({
                    type: "courier",
                    chatID: a.chatID,
                    orderID: a.orderID,
                    data: result.courier,
                  });
                }
              }
            })
            .catch((err) =>
              console.log("Ошибка при получении данных курьера: " + err)
            );

    })
}
async function statusCheck(){
    const orderList = await db.getOrdersForDostavista()
    orderList.forEach(a =>{
        fetch(
            `${DostavistaURL}orders?order_id=${a.dostavistaOrderID}`,
            {
              headers: {
                "X-DV-Auth-Token": dostavistaToken,
              },
              method: "GET",
            }
          )
            .then((response) => response.json())
            .then((result) => {
                if (result.is_successful) {
                parentPort.postMessage({
                  status: result.orders[0].status_description,
                  type: "status",
                  chatID: a.chatID,
                  orderID: a.orderID,
                });
              }
            })
            .catch((err) =>
              console.log("Ошибка при получении данных курьера: " + err)
            );

    })
     
}
function timeToTimestamp(defaultTimeString, delayTimeString){
    let defaultTimeArray = defaultTimeString.split(':')
    if(defaultTimeArray.length === 1) defaultTimeArray= defaultTimeString.split('.')
    defaultTimeArray[0] = +defaultTimeArray[0]
    defaultTimeArray[1] = +defaultTimeArray[1]
  while(delayTimeString >= 60){
defaultTimeArray[0]++
delayTimeString -= 60;
  }
  if(delayTimeString > 0){
    if(+delayTimeString + +defaultTimeArray[1] >= 60) {
        defaultTimeArray[0]++
        defaultTimeArray[1] = +delayTimeString + +defaultTimeArray[1] - 60
    }else{
        defaultTimeArray[1] += +delayTimeString
    }
  }
//   console.log(defaultTimeArray)
  defaultTimeArray.forEach((arg, i) => {
    if(+arg < 10) defaultTimeArray[i] = String('0' + String(arg))
        // console.log(defaultTimeArray[i])
  })
  const dateISO = (new Date).toISOString().split('T')
  return `${dateISO[0]}T${defaultTimeArray[0]}:${defaultTimeArray[1]}:00+03:00`
}
async function changeTimeOfDelivery(){
    const orderList = await db.getOrdersWithDelay()
    orderList.forEach(a =>{
        // console.log(timeToTimestamp(a.shopRequiredTime.split('-')[0], a.delay))
        // console.log(timeToTimestamp(a.shopRequiredTime.split('-')[1], a.delay))
        // console.log(timeToTimestamp(a.clientRequiredTime.split('-')[0], a.delay))
        // console.log(timeToTimestamp(a.clientRequiredTime.split('-')[1], a.delay))
        // console.log(typeof timeToTimestamp(a.clientRequiredTime.split('-')[1], a.delay))
        fetch(
            `${DostavistaURL}edit-order`,
            {
              headers: {
                "X-DV-Auth-Token": dostavistaToken,
              },
              method: "POST",
              body: JSON.stringify({
                order_id: +a.dostavistaOrderID,
                points: [{
                    point_id: +a.shopPointID, 
                    required_start_datetime: timeToTimestamp(a.shopRequiredTime.split('-')[0], a.delay),
                    required_finish_datetime: timeToTimestamp(a.shopRequiredTime.split('-')[1], a.delay),
                },
            {
                point_id: a.clientPointID,  
                required_start_datetime: timeToTimestamp(a.clientRequiredTime.split('-')[0], a.delay),
                required_finish_datetime: timeToTimestamp(a.clientRequiredTime.split('-')[1], a.delay),
            }]
              })
            }
          )
            .then((response) => response.json())
            .then((result) => {
                if (result.is_successful) {
                    console.log("Время доставки успешно изменено")
                db.changeOrder(a.chatID, a.orderID, true, "isDelayChanged")
              }else{
                const temp = JSON.stringify(result.parameter_errors)
                db.changeOrder(a.chatID, a.orderID, `${temp.replaceAll('"',  "'")}`, "errorInfo")
                db.changeOrder(a.chatID, a.orderID, false, "isSuccessful")
              }
            })
            .catch((err) =>
              console.log("Ошибка при получении данных курьера: " + err)
            );

    })
     
}


setInterval(() => {
    try{
        // // console.log("Запуск потока")
        courierSearch();
        changeTimeOfDelivery();
        statusCheck();
    }catch(err){
        console.log("Ошибка при работе воркера\n", err)
    }
  const date = new Date()
 if(date.getHours() === 22 && !isReloaded){
     setTimeout(() =>{isReloaded = false}, 7200000)
    isReloaded = true
    parentPort.postMessage({type: 'reload'})
 }
}, 15000);
}
shell()
