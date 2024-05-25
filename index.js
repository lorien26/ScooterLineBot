async function shell(){
const {DbApi} = require('./dbAPI.js')
const db = new DbApi('./mainDB.db')
await db.init()
const telegramAPI = require("node-telegram-bot-api");
const { Worker } = require("worker_threads");
console.log("Worker was impoted");
let pendingList = []
const token = "7158785775:AAG0AvHBQtWHxvx4yh3rMtt7772kkFJCGrY";
const bot = new telegramAPI(token, { polling: {
  interval: 600,
  autoStart: true
}}, (parse_mode = "HTML"));
const options = require("./options");

let listOfManagers = {};
const orderHandler = require("./orderHandler").orderHandler;
const worker = new Worker("./worker.js", {
  workerData: listOfManagers,
});
const DostavistaURL = await db.getData('DostavistaURL')
const dostavistaToken = await db.getData('dostavistaToken')
const {
  supportMessage,
  sergeyChatID,
  adminChatID,
  adminID,
  logID,
  pickupGuide,
  pickupPrototype,
  deliveryGuide,
  deliveryPrototype,
  startMessage,
  newOrderDetails,
  adminList
} = require("./staticData");

try{

  const sendMessageWhatsApp = require("./whatsAppModule").sendMessageWhatsApp;
  let globalCounter = 1;
  async function newOrder(order, orderInfo) {
    const data = {
      isSuccessful: null,
    };
    await fetch(`${DostavistaURL}create-order`, {
      headers: {
        "X-DV-Auth-Token": dostavistaToken,
      },
      method: "POST",
      body: JSON.stringify(order),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log("Новый заказ:\n\n ");
        console.log(result)
        console.log('\n\n')
        console.log(result.order.points)
        if (result.is_successful) {
          (data.managerID = orderInfo.managerID),
            (data.orderID = orderInfo.orderID),
            (data.isSuccessful = true),
            (data.orderData = {
              order_id: result.order.order_id,
              amount: result.order.backpayment_amount,
              startDataTime: result.order.points[0].required_start_datetime,
              finishDataTime: result.order.points[0].required_finish_datetime,
            });
  
        } else {
          (data.managerID = orderInfo.managerID),
            (data.orderID = orderInfo.orderID),
            (data.isSuccessful = false),
            (data.orderData = null);
        }
      })
      .catch((error) => {
        (data.managerID = orderInfo.managerID),
          (data.orderID = orderInfo.orderID),
          (data.isSuccessful = false),
          (data.orderData = null);
        console.log("error", error);
      });
    listOfManagers[orderInfo.managerID][orderInfo.orderID].isSuccessful =
      data.isSuccessful;
    if (data.isSuccessful) {
      listOfManagers[orderInfo.managerID][orderInfo.orderID].expectedTime = {
        startDataTime: data.orderData.startDataTime,
        endDataTime: data.orderData.finishDataTime,
      };
      listOfManagers[orderInfo.managerID][orderInfo.orderID].dostavistaOrderID =
        data.orderData.order_id;
    }
  }
  function adminOrderList(){
    
    const orderList = ["Заказы дропперов"];
    for(const managerID in listOfManagers){
  const managerOrderList = [`@${listOfManagers[managerID].username}:`]
      for (const order in listOfManagers[managerID]) {
        if (order !== "lastOrderType" && order !== "username" && order !== "isSupport" && order !=="lastAction") {
          console.log(order)
          console.log(listOfManagers[managerID][order])
          console.log(listOfManagers[managerID][order].isSuccessful)
          if (listOfManagers[managerID][order].isSuccessful) {
            let data = listOfManagers[managerID][order].body
            console.log(data);
            console.log("1");
            let message = "";
            if (data.получение === "доставка") {
              if (order.courier) {
                message = 
`<b>Заказ #${listOfManagers[managerID][order].globalNum}</b>
Способ получения: Доставка
Имя клиента: ${data.имя}
Номер телефона клиента: ${data.телефон}
Адрес отправки: ${data["адрес отправки"]}
Ожидаемое время прибытия: ${data.время}
Модель: ${data.модель}
Стоимость без доставки: ${data["стоимость без доставки"]}
Стоимость с доставкой: ${data["стоимость с доставкой"]}
Статус заказа: ${listOfManagers[managerID][order].status}
ФИО курьера: ${listOfManagers[managerID][order].courier.surname} ${listOfManagers[managerID][order].courier.name} ${listOfManagers[managerID][order].courier.middlename}
Телефон курьера: ${listOfManagers[managerID][order].courier.phone}
Комментарий: ${data.комментарий}
                `;
                managerOrderList.push(message);
              } else {
                let data = listOfManagers[managerID][order].body;
                console.log(data);
                console.log("2");
    
                message = 
`<b>Заказ #${listOfManagers[managerID][order].globalNum}</b>
Способ получения: Доставка
Имя клиента: ${data.имя}
Номер телефона клиента: ${data.телефон}
Адрес отправки: ${data["адрес отправки"]}
Ожидаемое время прибытия: ${data.время}
Модель: ${data.модель}
Стоимость без доставки: ${data["стоимость без доставки"]}
Стоимость с доставкой: ${data["стоимость с доставкой"]}
Статус заказа: ${listOfManagers[managerID][order].status}
Курьер: Не найден
Комментарий: ${data.комментарий}`;
                managerOrderList.push(message);
              }
            } else if (data.получение === "самовывоз") {
              let data = listOfManagers[managerID][order].body;
              console.log(data);
              console.log("3");
              message = 
`<b>Заказ #${listOfManagers[managerID][order].globalNum}</b>
Способ получения: Самовывоз
Имя клиента: ${data.имя}
Номер телефона клиента: ${data.телефон}
Адрес отправки: ${data["адрес отправки"]}
Стоимость: ${data.стоимость}
Модель: ${data.модель}
Ожидаемое время прибытия: ${data.время}
Комментарий: ${data.комментарий}`;
              managerOrderList.push(message);
            }
          }
        }
      }
      if(managerOrderList.length > 1){
        orderList.push(managerOrderList.join("\n"))
      }
      else orderList.push(managerOrderList[0] + " Нет активных заказов")
    }
    console.log(orderList);
    if (orderList.length > 1){
      return orderList.join("\n\n")
    }
    else return "Сейчас нет активных заказов"
  
  
  
  }
  function isNewManager(managerID, username) {
    let istrue = true;
    for (const key in listOfManagers) {
      if (key == managerID) istrue = false;
    }
    if (istrue) {
      listOfManagers[managerID] = { lastOrderType: null, username:username, isSupport: false, lastAction: null };
      console.log("Добавлен новый менеджер");
    }
  }
  function isAdmin(username){
    for(const a of adminList){
      if(a === username){
        return true;
      }
     }
     return false
  }
  function usersOrderList(managerID) {
    orderList = ["Список активных заказов\n"];
    console.log(listOfManagers[managerID]);
    for (const order in listOfManagers[managerID]) {
  
      if (order !== "lastOrderType" && order !== "isSupport" && order !== "username" && order!=="lastAction") {
        console.log(order)
        console.log(listOfManagers[managerID][order])
        console.log(listOfManagers[managerID][order].isSuccessful)
        if (listOfManagers[managerID][order].isSuccessful) {
          let data = listOfManagers[managerID][order].body
          console.log(data);
          console.log("1");
          let message = "";
          if (data.получение === "доставка") {
            if (order.courier) {
              message = 
`<b>Заказ #${listOfManagers[managerID][order].globalNum}</b>
Способ получения: Доставка
Имя клиента: ${data.имя}
Номер телефона клиента: ${data.телефон}
Адрес отправки: ${data["адрес отправки"]}
Ожидаемое время прибытия: ${data.время}
Модель: ${data.модель}
Стоимость без доставки: ${data["стоимость без доставки"]}
Стоимость с доставкой: ${data["стоимость с доставкой"]}
Статус заказа: ${listOfManagers[managerID][order].status}
ФИО курьера: ${listOfManagers[managerID][order].courier.surname} ${listOfManagers[managerID][order].courier.name} ${listOfManagers[managerID][order].courier.middlename}
Телефон курьера: ${listOfManagers[managerID][order].courier.phone}
Комментарий: ${data.комментарий}
              `;
              orderList.push(message);
            } else {
              let data = listOfManagers[managerID][order].body;
              console.log(data);
              console.log("2");
  
              message = 
`<b>Заказ #${listOfManagers[managerID][order].globalNum}</b>
Способ получения: Доставка
Имя клиента: ${data.имя}
Номер телефона клиента: ${data.телефон}
Адрес отправки: ${data["адрес отправки"]}
Ожидаемое время прибытия: ${data.время}
Модель: ${data.модель}
Стоимость без доставки: ${data["стоимость без доставки"]}
Стоимость с доставкой: ${data["стоимость с доставкой"]}
Статус заказа: ${listOfManagers[managerID][order].status}
Курьер: Не найден
Комментарий: ${data.комментарий}`;
              orderList.push(message);
            }
          } else if (data.получение === "самовывоз") {
            let data = listOfManagers[managerID][order].body;
            console.log(data);
            console.log("3");
            message = 
`<b>Заказ #${listOfManagers[managerID][order].globalNum}</b>
Способ получения: Самовывоз
Имя клиента: ${data.имя}
Номер телефона клиента: ${data.телефон}
Адрес отправки: ${data["адрес отправки"]}
Стоимость: ${data.стоимость}
Модель: ${data.модель}
Ожидаемое время прибытия: ${data.время}
Комментарий: ${data.комментарий}`;
            orderList.push(message);
          }
        }
      }
    }
    console.log(orderList);
    if (orderList.join("") === "Список активных заказов\n")
      return "У вас еще нет активных заказов";
    else return orderList.join("\n");
  }
  function parseDataToMessage(data, managerID, orderID) {
    if (data.получение === "доставка") {
      message = 
`Заказ #${listOfManagers[managerID][orderID].globalNum}
Доставка
Номер телефона клиента: ${data.телефон}
Адрес отправки: ${data["адрес отправки"]}
Модель: ${data.модель}
Стоимость без доставки: ${data["стоимость без доставки"]}
ФИО курьера: ${listOfManagers[managerID][orderID].courier.surname} ${
      listOfManagers[managerID][orderID].courier.name
    } ${listOfManagers[managerID][orderID].courier.middlename}
Телефон курьера: ${listOfManagers[managerID][orderID].courier.phone}
Ожидаемое время прибытия курьера: ${
        listOfManagers[managerID][orderID].expectedTime[0].getHours() +
        ":" +
        listOfManagers[managerID][orderID].expectedTime[0].getMinutes()
      } - ${
        listOfManagers[managerID][orderID].expectedTime[1].getHours() +
        ":" +
        listOfManagers[managerID][orderID].expectedTime[1].getMinutes()
      }
Комментарий: ${data.комментарий}
      `;
    } else if (data.получение === "самовывоз") {
      message = 
`Заказ #${listOfManagers[managerID][orderID].globalNum}
Самовывоз
Номер телефона клиента: ${data.телефон}
Адрес отправки: ${data["адрес отправки"]}
Модель: ${data.модель}
Стоимость: ${data.стоимость}
Ожидаемое время прибытия клиента: ${data.время}
Комментарий: ${data.комментарий}`;
    }
    return message;
  }
  async function orderFunc(chatID, data,managerID,username){
    const objectLength = Object.keys(listOfManagers[managerID]).length;
    if (listOfManagers[managerID].lastOrderType === "доставка") {
      orderObject = await orderHandler(
        data,
        listOfManagers[managerID].lastOrderType,
        managerID
      );
      if (orderObject.isSucessful) {
        console.log("Successful1");
        listOfManagers[managerID][objectLength] = {};
        listOfManagers[managerID][objectLength].body = orderObject.secondBody;
        listOfManagers[managerID][objectLength].isSuccessful = true;
        listOfManagers[managerID][objectLength].courier = false;
        listOfManagers[managerID][objectLength].status = "оформлен";
        listOfManagers[managerID][objectLength].globalNum = globalCounter;
        listOfManagers[managerID].lastOrderType = null;
        globalCounter++;
        console.log(("Ниже доставка"))
        console.log(listOfManagers[managerID][objectLength])
        await newOrder(orderObject.body, {
          managerID: managerID,
          orderID: objectLength,
        });
        if (listOfManagers[managerID][objectLength].isSuccessful) {
          worker.postMessage({
            type: "order",
            managerID: managerID,
            order: objectLength,
            data: listOfManagers[managerID][objectLength],

          });
          await bot.sendMessage(
            chatID,
            "Заказ принят. Ждите информацию о курьере"
          );
          return 0;
        } else {
          await bot.sendMessage(
            chatID,
            "Возникла ошибка при создании заказа: некорректный адрес.\nПопробуйте ввести верный адрес и оформить заявку снова. Не забывайте, что адрес нужно копировать из Google Maps"
          );
          return 0;
        }
      } else {
        console.log("unsuccessful1");

        await bot.sendMessage(
          chatID,
          `Форма заказа заполнена некорректно. Пожалуйста, проверьте поле ${orderObject.body}`
        );
        return 0;
      }
    } else if (listOfManagers[managerID].lastOrderType === "самовывоз") {
      orderObject = await orderHandler(
        data,
        listOfManagers[managerID].lastOrderType,
        managerID
      );
      if (orderObject.isSuccessful) {        listOfManagers[managerID][objectLength] = {};
        listOfManagers[managerID][objectLength].body = orderObject.secondBody;
        listOfManagers[managerID][objectLength].isSuccessful = true;
        listOfManagers[managerID][objectLength].courier = null;
        listOfManagers[managerID][objectLength].globalNum = globalCounter;
        globalCounter++;
        listOfManagers[managerID].lastOrderType = null;
        await bot.sendMessage(chatID, "Заказ принят");

        sendMessageWhatsApp(
          parseDataToMessage(orderObject.secondBody, managerID, objectLength)
        );
        return 0;
      } else {
        await bot.sendMessage(
          chatID,
          `Форма заказа заполнена некорректно. Пожалуйста, проверьте поле ${orderObject.body}`
        );
        return 0;
      }
    }
  }

  
  async function defaultMessage(chatID, data, managerID, username) {
    try{
      isNewManager(chatID, username)
       if(await db.isExists(username)){
      if(listOfManagers[chatID].lastAction){
        switch(listOfManagers[chatID].lastAction){
          case "addDropper": 
          if(!(await db.isExists(data))){
            await db.addDropper(data)
            await bot.sendMessage(chatID, "Дроппер добавлен!")
          }else await bot.sendMessage(chatID, "Такой дроппер уже есть в списке!")
          listOfManagers[chatID].lastAction = null
          return 0;
          case "deleteDropper": 
          if(await db.isExists(data)){
            await db.deleteDropper(data)
            await bot.sendMessage(chatID, "Дроппер удалён!")
          }else await bot.sendMessage(chatID, "Такого дроппера нет в списке!")
          listOfManagers[chatID].lastAction = null
          return 0;
          case "groupForOrdersIDChange":
            await db.changeDataInfo('groupForOrdersID', data )
            await bot.sendMessage(chatID, "Успешно! Данные изменены")
            listOfManagers[chatID].lastAction = null

            return 0;
          case "requisitesChange":
            await db.changeDataInfo('requisites', data)
            await bot.sendMessage(chatID, "Успешно! Данные изменены")
            listOfManagers[chatID].lastAction = null

            return 0;
          case "DostavistaURLChange":
            await db.changeDataInfo('DostavistaURL', data)
            await bot.sendMessage(chatID, "Успешно! Данные изменены")
            listOfManagers[chatID].lastAction = null

            return 0;
          case "dostavistaTokenChange":
            await db.changeDataInfo('dostavistaToken', data)
            await bot.sendMessage(chatID, "Успешно! Данные изменены")
            listOfManagers[chatID].lastAction = null

            return 0;
          case "managerPhoneChange":
            await db.changeDataInfo('managerPhone', data)
            await bot.sendMessage(chatID, "Успешно! Данные изменены")
            listOfManagers[chatID].lastAction = null

            return 0;
        }
      }
        console.log("Exists is true!")
         if (data.includes("#order") && listOfManagers[managerID].lastOrderType) {
           return await orderFunc(chatID, data, managerID, username)
         }
         else if(data.includes("#order") && !listOfManagers[managerID].lastOrderType){
           await bot.sendMessage(chatID, 'Пожалуйста, выберите способ получения заказа с помощью меню')
           return 0;
         }
         switch (data) {
           case "Техподдержка":
             await bot.sendMessage(chatID, supportMessage)
             listOfManagers[managerID].isSupport = true
             break;
           case "/start":
             await bot.sendMessage(chatID, startMessage, options.startMessageOptions );
             if(isAdmin(username)){
               await bot.sendMessage(chatID, 'Установлены права администратора', options.adminMenuOptions)
               return 0;
             }else{
               await bot.sendMessage(
                 chatID,
                 "Открыто главное меню",
                 options.mainMenuOptions
               );}
               break;
             
             case "Заказы дропперов":
               if(isAdmin(username)){
                 await bot.sendMessage(chatID, adminOrderList(), {parse_mode: "HTML"})
                 return 0;
               }
               else await bot.sendMessage(chatID, "Некорректная команда. Пожалуйста, воспользуйтесь меню")
               break;
             case "Админ панель":
               if(isAdmin(username)){
                 await bot.sendMessage(chatID, "Используется админ панель", options.adminPanelMenuOptions)
                 return 0;
               }
               else await bot.sendMessage(chatID, "Некорректная команда. Пожалуйста, воспользуйтесь меню")
               break;
             case "Главное меню":
               if(isAdmin(username)){
                 await bot.sendMessage(chatID, "Открыто главное меню", options.adminMenuOptions)
                 return 0;
               }
               else await bot.sendMessage(chatID, "Некорректная команда. Пожалуйста, воспользуйтесь меню")
               break;
             case "Добавить дроппера":
               if(isAdmin(username)){
                 await bot.sendMessage(chatID, "Пожалуйста, напишите никнейм пользователя без @ в следующем сообщении\nНапример, i_jusp")
                 listOfManagers[chatID].lastAction = "addDropper";
                 return 0;
               }
               else await bot.sendMessage(chatID, "Некорректная команда. Пожалуйста, воспользуйтесь меню")
               break;
             case "Удалить дроппера":
               if(isAdmin(username)){
                 await bot.sendMessage(chatID, "Пожалуйста, напишите никнейм пользователя без @ в следующем сообщении\nНапример, i_jusp")
                 listOfManagers[chatID].lastAction = "deleteDropper";
                 return 0;
               }
               else await bot.sendMessage(chatID, "Некорректная команда. Пожалуйста, воспользуйтесь меню")
               break;
             case "Изменить данные":
               if(isAdmin(username)){
                 await bot.sendMessage(chatID, "Ниже представлены все поля, которые можно изменить. \nЧтобы посмотреть текущие значения воспользуйтесь кнопками\nВсе изменения вступят в силу после перезагрузки", options.changeInfoOptions)
                 return 0;
               }
               else await bot.sendMessage(chatID, "Некорректная команда. Пожалуйста, воспользуйтесь меню")
               break;
             case "Список дропперов":
               if(isAdmin(username)){
                 await bot.sendMessage(chatID, await db.listOfDroppers())
                 return 0;
               }
               else await bot.sendMessage(chatID, "Некорректная команда. Пожалуйста, воспользуйтесь меню")
               break;
           case "Новый заказ":
             await bot.sendMessage(
               chatID,
               "Выберите тип заказа",
               options.orderMenuOptions
             );
             break;
           case "Мои заказы":
             await bot.sendMessage(chatID, usersOrderList(managerID), { parse_mode: "html" });
             break;
             case "Информация": await bot.sendMessage(chatID, "Инструкции по созданию новых заказов:", options.infoMenuOptions)
             break;
           default:
             await bot.sendMessage(
               chatID,
               "Некорректная команда. Пожалуйста, воспользуйтесь меню"
             );
             break;
         }
       }
       else if(listOfManagers[chatID].lastAction === "pending"){
        await bot.sendMessage(chatID, "Вы уже отправили заявку на добавление! Пожалуйста, ожидайте")
       }
       else{
        console.log("Exists is false!")
        await bot.sendMessage(chatID, `К сожалению вас нет в списке пользователей.\nПожалуйста, напишите @sergzvezdilin, чтобы воспользоваться ботом или отправьте запрос на добавление с помощью кнопки ниже`, {reply_markup: JSON.stringify({inline_keyboard: [[{text: "Оставить заявку", callback_data: "pending"}]]})})
       }
    }catch(unexpectedError){
        listOfManagers[chatID].lastAction = null;
        listOfManagers[chatID].lastOrderType = null;
        listOfManagers[chatID].isSupport = false;
        bot.sendMessage(adminID, "Неизвестная ошибка в работе бота: (4)\n " +unexpectedError)
    }
  }
  async function callbackQueryCommands(chatID, data, msgID, managerID, username) {
    try{
      let obj = JSON.parse(data)
      pendingList.forEach((a, i)=>{
        if(obj.username === a){
          if(obj.answer === "denied"){
            bot.sendMessage(obj.chatID, "К сожалению, ваша заявка была отклонена")
            listOfManagers[obj.chatID].lastAction = null
            pendingList.splice(i, 1)
          }
          else if(obj.answer === "applied"){
            bot.sendMessage(obj.chatID, "Ваша заявка была одобрена! Теперь вы можете воспользоваться ботом")
            db.addDropper(a)
            listOfManagers[obj.chatID].lastAction = null
            pendingList.splice(i, 1)
          }
        }
       
      })
      return 0;
    }catch(err){
      console.log("Object is not json\n")
    }
    
     
  
    switch (data) {
      case "/info": await bot.sendMessage(chatID, "Инструкции по созданию новых заказов:", options.infoMenuOptions)
      break;
      case "/pickup":
        await bot.sendMessage(
          chatID,
          "Новая заявка на самовывоз\nПожалуйста, отправьте заполненную форму в следующем сообщении",
          options.pickupMenuOptions
        );
        isNewManager(managerID, username);
        listOfManagers[managerID].lastOrderType = "самовывоз";
        break;
      case "/delivery":
        await bot.sendMessage(
          chatID,
          "Новая заявка на доставку \nПожалуйста, отправьте заполненную форму в следующем сообщении",
          options.deliveryMenuOptions
        );
        isNewManager(managerID, username);
        listOfManagers[managerID].lastOrderType = "доставка";
        break;
      case "/newOrderDetails":
        await bot.sendMessage(chatID, newOrderDetails);
        break;
  
      case "/returnToOrderMenu":
        await bot.sendMessage(
          chatID,
          "Выберите тип заказа",
          options.orderMenuOptions
        );
        break;
      case "/deliveryPrototype":
        await bot.sendMessage(chatID, deliveryPrototype, {
          parse_mode: "html",
        });
        break;
      case "/deliveryGuide":
        await bot.sendMessage(chatID, deliveryGuide, { parse_mode: "html" });
        break;
      case "/pickupPrototype":
        await bot.sendMessage(chatID, pickupPrototype, { parse_mode: "html" });
        break;
      case "/pickupGuide":
        await bot.sendMessage(chatID, pickupGuide, { parse_mode: "html" });
        break;
        case "/managerPhone": 
        listOfManagers[chatID].lastAction = null
        await bot.sendMessage(chatID, `Значение поля: ${await db.getData('managerPhone')}`, {reply_markup: JSON.stringify({inline_keyboard: [[{text: "Изменить", callback_data: `${data}Change`}]]})})
        break;
        case "/dostavistaToken": 
        listOfManagers[chatID].lastAction = null
        await bot.sendMessage(chatID, `Значение поля: ${await db.getData('dostavistaToken')}`, {reply_markup: JSON.stringify({inline_keyboard: [[{text: "Изменить", callback_data: `${data}Change`}]]})})
        break;
        case "/DostavistaURL": 
        listOfManagers[chatID].lastAction = null
        await bot.sendMessage(chatID, `Значение поля: ${await db.getData('DostavistaURL')}`, {reply_markup: JSON.stringify({inline_keyboard: [[{text: "Изменить", callback_data: `${data}Change`}]]})})
        break;
        case "/groupForOrdersID": 
        listOfManagers[chatID].lastAction = null
        await bot.sendMessage(chatID, `Значение поля: ${await db.getData('groupForOrdersID')}`, {reply_markup: JSON.stringify({inline_keyboard: [[{text: "Изменить", callback_data: `${data}Change`}]]})})
        break;
        case "/requisites": 
        listOfManagers[chatID].lastAction = null
        await bot.sendMessage(chatID, `Значение поля: ${await db.getData('requisites')}`, {reply_markup: JSON.stringify({inline_keyboard: [[{text: "Изменить", callback_data: `${data}Change`}]]})})
        break;


        case "/managerPhoneChange": 
        await bot.sendMessage(chatID, `Отправьте в следующем сообщении обновлённые данные без лишних знаков`, {reply_markup: JSON.stringify({inline_keyboard: [[{text: "Отменить", callback_data: `/managerPhone`}]]})})
        listOfManagers[chatID].lastAction = 'managerPhoneChange'
        break;
        case "/dostavistaTokenChange": 
        await bot.sendMessage(chatID, `Отправьте в следующем сообщении обновлённые данные без лишних знаков`, {reply_markup: JSON.stringify({inline_keyboard: [[{text: "Отменить", callback_data: `/dostavistaToken`}]]})})
        listOfManagers[chatID].lastAction = 'dostavistaTokenChange'
        break;
        case "/DostavistaURLChange": 
        await bot.sendMessage(chatID, `Отправьте в следующем сообщении обновлённые данные без лишних знаков`, {reply_markup: JSON.stringify({inline_keyboard: [[{text: "Отменить", callback_data: `/DostavistaURL`}]]})})
        listOfManagers[chatID].lastAction = 'DostavistaURLChange'
        break;
        case "/groupForOrdersIDChange": 
        await bot.sendMessage(chatID, `Отправьте в следующем сообщении обновлённые данные без лишних знаков`, {reply_markup: JSON.stringify({inline_keyboard: [[{text: "Отменить", callback_data: `/groupForOrdersID`}]]})})
        listOfManagers[chatID].lastAction = 'groupForOrdersIDChange'
        break;
        case "/requisitesChange": 
        await bot.sendMessage(chatID, `Отправьте в следующем сообщении обновлённые данные без лишних знаков`, {reply_markup: JSON.stringify({inline_keyboard: [[{text: "Отменить", callback_data: `/requisites`}]]})})
        listOfManagers[chatID].lastAction = 'requisitesChange'
        break;
        case "pending": 
        await bot.sendMessage(chatID, "Ваша заявка принята! \nЕсли она будет одобрена, вы получите уведомление")
        await bot.sendMessage(sergeyChatID, "Запрос на добавление в список дропперов: @" + username, {reply_markup: JSON.stringify({inline_keyboard: [[{text: "Принять", callback_data: JSON.stringify({chatID: chatID, username: username, answer: "applied"})}, {text: "Отказать", callback_data: JSON.stringify({chatID: chatID, username: username, answer: "denied"})}]]})})
        listOfManagers[chatID].lastAction = "pending"
        pendingList.push(username)
        break;
      default:
        await bot.sendMessage(chatID, `Unexpected callback data`);
    }
  }
  
  bot.setMyCommands([{ command: "/start", description: "Знакомство" }]);
  worker.on("message", (msg) => {
    console.log("New message from worker");
    if(msg.type === "courier"){
      console.log("Сообщение о курьере от воркера")
      listOfManagers[msg.managerID][msg.orderID].courier = msg.data;
      listOfManagers[msg.managerID][msg.orderID].status = msg.status;
      bot.sendMessage(
        managerID,
        `Найден курьер к заказу №${msg.orderID}: 
        ФИО: ${msg.data.surname} ${msg.data.name} ${msg.data.middlename}
        Телефон: ${msg.data.phone}`
      );
      sendMessageWhatsApp(
        parseDataToMessage(
          listOfManagers[msg.managerID][msg.orderID].secondBody,
          msg.managerID,
          msg.orderID
        )
      );
    }
    else if(msg.type ==="status"){
      console.log("Сообщение о статусе от воркера")
      console.log(msg.status)
      listOfManagers[msg.managerID][msg.orderID].status = msg.status;
    }
    else if(msg.type ==="reload"){
      console.log("Очистка данных")
     bot.sendMessage(sergeyChatID, `Очистка памяти - список заказов \n ${adminOrderList()}`, {parse_mode: "html"})
     bot.sendMessage(adminChatID, `Очистка памяти - список заказов \n ${adminOrderList()}`, {parse_mode: "html"})
      setTimeout(a =>{ listOfManagers = {}
      console.log("Лист очищен")
    console.log(listOfManagers)}, 7200000)
    }
    else{
      console.log(msg)
    }
  });
  bot.on("callback_query", async (msg) => {
    try{
  
      const data = msg.data;
    
      const chatID = msg.message.chat.id;
      const msgID = msg.message;
      const managerID = msg.from.id;
      const username = msg.from.username
      console.log("Данные колбек query: " + data);
      console.log(msg);
      callbackQueryCommands(chatID, data, msgID, managerID, username);
    }catch(unexpectedError){
       bot.sendMessage(adminID, "Неизвестная ошибка в работе бота: (3)\n " + unexpectedError)
    }
  });
  bot.on("message", async (msg) => {
    try{
      
      const text = msg.text;
      const chatID = msg.chat.id;
      const managerID = msg.from.id;
      const username = msg.from.username
      console.log(msg);
      isNewManager(managerID, username);
      if(listOfManagers[managerID].isSupport){ await bot.sendMessage(adminID, `<b>Новый тикет от пользователя @${username} </b>\n ${text}`, {parse_mode: "html"})
        await bot.sendMessage(chatID, 'Успешно! Тикет отправлен')
      listOfManagers[managerID].isSupport = false
      }
      else defaultMessage(chatID, text, managerID, username);
    }catch(unexpectedError){
       bot.sendMessage(adminID, "Неизвестная ошибка в работе бота: (2)\n " + unexpectedError)
    }
  });
}catch(unexpectedError){
   bot.sendMessage(adminID, "Неизвестная ошибка в работе бота: (1)\n " + unexpectedError)
}
}
shell()