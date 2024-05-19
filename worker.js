const { workerData, parentPort } = require("worker_threads");
const { DostavistaURL, dostavistaToken } = require("./staticData");
const isReloaded = false
let listOfManagersT = workerData;
console.log("Лист менеджеров: " + listOfManagersT);
console.log("Воркер инициализирован");
console.log("I am worker", workerData);
parentPort.on("message", (msg) => {
  if(msg.type ==="order"){
    console.log(msg);
    if (typeof listOfManagersT[msg.managerID] !== "object") {
      listOfManagersT[msg.managerID] = {};
    }
    listOfManagersT[msg.managerID][msg.order] = {};
    listOfManagersT[msg.managerID][msg.order].courier = msg.courier;
    listOfManagersT[msg.managerID][msg.order].dostavistaOrderID =
      msg.data.dostavistaOrderID;
  }
  if(msg.type === "reload"){
    isReloaded = true;
  }
});
async function courierSearch(listOfManagersW) {
  for (manager in listOfManagersW) {
    console.log("Менеджер номер: " + manager);
    for (order in listOfManagersW[manager]) {
      console.log("Заказ номер: " + order);
      if (!listOfManagersW[manager][order].courier) {
        await fetch(
          `${DostavistaURL}courier?order_id=${listOfManagersW[manager][order].dostavistaOrderID}`,
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
                  managerID: manager,
                  orderID: order,
                  data: result.courier,
                  
                });
              }
            }
          })
          .catch((err) =>
            console.log("Ошибка при получении данных курьера: " + err)
          );
      }

      await fetch(
        `${DostavistaURL}orders?order_id=${listOfManagersW[manager][order].dostavistaOrderID}`,
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
              managerID: manager,
              orderID: order,
            });
          }
        })
        .catch((err) =>
          console.log("Ошибка при получении данных курьера: " + err)
        );
    }
  }
}

setInterval(() => {
  courierSearch(listOfManagersT);
  const date = new Date()
 if(date.getHours() >= 22 && !isReloaded){
 
    parentPort.postMessage(
        {
            type: 'reload'
        }
    )
    setTimeout(a =>{ listOfManagersT = {}
    console.log("Лист Т очищен")
console.log(listOfManagersT)}, 7200000)

 }
}, 15000);
