async function shell(){
const {DbApi} = require('./dbAPI.js')
const db = new DbApi('./mainDB.db')
await db.init()
await db.createTables();
await db.defaultValues()
const telegramAPI = require("node-telegram-bot-api");
const { Worker } = require("worker_threads");
let pendingList = []
// const token = "6954991532:AAG_sjZUjnbYyyInMqSAViBU-mAdGSNGVNE";
const token = "7158785775:AAG0AvHBQtWHxvx4yh3rMtt7772kkFJCGrY";

const bot = new telegramAPI(token, { polling: {
  interval: 600,
  autoStart: true
}}, (parse_mode = "HTML"));
const options = require("./options");
const orderHandler = require("./orderHandler").orderHandler;
const worker = new Worker("./worker.js");
const DostavistaURL = await db.getData('DostavistaURL')
const dostavistaToken = await db.getData('dostavistaToken')
const {
    tgGroupForOrders,
    pickupTemplate,
    deliveryTemplate,
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
console.log("Программа готова к работе!")
bot.sendMessage(adminID, "Бот перезагружен")
try{
  function getDayForKeyboard(currentDay, currentMonth, numOfDays){
    const dayInMonth = currentMonth  === 1 || currentMonth === 3 || currentMonth === 5 || currentMonth === 7 || currentMonth === 8 || currentMonth === 10 || currentMonth === 12 ? 31 : 30;
    if(currentMonth === 2) dayInMonth = 28;
    let returnedDay = null;
    let returnedMonth = null
    if(currentDay - numOfDays < 0){ 
        returnedDay = dayInMonth - (numOfDays - currentDay)
        if(currentMonth === 0 ) returnedMonth = 12;
        else returnedMonth = currentMonth;
    }
    else{
     returnedDay = currentDay - numOfDays;
     returnedMonth = currentMonth
    }
    if(returnedDay < 10 ) returnedDay = `0${returnedDay}`
    if(returnedMonth < 10 ) returnedMonth = `0${returnedMonth}`
    return `${returnedDay}.${returnedMonth}`
    



}
  async function newOrder(order, orderInfo) {
    await fetch(`${DostavistaURL}create-order`, {
      headers: {
        "X-DV-Auth-Token": dostavistaToken,
      },
      method: "POST",
      body: JSON.stringify(order),
    })
      .then((response) => response.json())
      .then((result) => {
        // console.log("Новый заказ:\n");
        console.log(result)
        if (result.is_successful) {
            console.log("\n\nДоставка успешна\n\n")
             db.changeOrder(orderInfo.chatID, orderInfo.orderID, true, "isSuccessful")
             db.changeOrder(orderInfo.chatID, orderInfo.orderID, result.order.points[0].point_id, "shopPointID")
             db.changeOrder(orderInfo.chatID, orderInfo.orderID, result.order.points[1].point_id, "clientPointID")
             db.changeOrder(orderInfo.chatID, orderInfo.orderID, result.order.order_id, "dostavistaOrderID")
             db.changeOrder(orderInfo.chatID, orderInfo.orderID, `${String(result.order.points[0].required_start_datetime).substring(11,16)}-${String(result.order.points[0].required_finish_datetime).substring(11,16)}`, "shopRequiredTime")
        } else {
            console.log(result.parameter_errors.points[1])
            !async function(){
                const temp = JSON.stringify(result.parameter_errors.points[1])
                 await db.changeOrder(orderInfo.chatID, orderInfo.orderID, `${temp.replaceAll('"',  "'")}`, "errorInfo")
                await db.changeOrder(orderInfo.chatID, orderInfo.orderID, false, "isSuccessful")
            }()
        }
      })
      .catch((error) => {
          db.changeOrder(orderInfo.chatID, orderInfo.orderID, false, "isSuccessful")
          db.changeOrder(orderInfo.chatID, orderInfo.orderID, JSON.stringify(error), "errorInfo")

        console.log("error", error);
      });
  }
  async function adminOrderList(date = null){
    if(!date){
        let globalOrderList = ["<b>Заказы дропперов:</b>"];
        for(const username of (await db.listOfDroppers(true))){
            globalOrderList.push(await usersOrderList(username) ? `<b>@${username}</b>\n${await usersOrderList(username)}\n` : null)
           }
        //    console.log(globalOrderList);
           globalOrderList = globalOrderList.filter(Boolean)
          if(globalOrderList.length > 1){
            return globalOrderList.join("\n")
          }
          else return "Сейчас нет активных заказов"
    }
    else{
        let globalOrderList = [`<b>Заказы дропперов за ${date}:</b>`];
        for(const username of (await db.listOfDroppers(true))){
            globalOrderList.push(await usersOrderList(username, date) ? `<b>@${username}</b>\n${await usersOrderList(username, date)}\n` : null)
           }
           globalOrderList = globalOrderList.filter(Boolean)
          if(globalOrderList.length > 1){
            return globalOrderList.join("\n")
          }
          else return `За ${date} не было активных заказов`
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
  async function sendMessageByParts(chatID, message){
    const maxTextLength = 4000;
    let currentTextLength = message.length
    // console.log(message)
    do{
        let currentMessage = message.substring(0, maxTextLength);
        // console.log(currentMessage.length)
        if(currentMessage.length < maxTextLength){
            // console.log("Меньше")
        await bot.sendMessage(chatID, currentMessage, {parse_mode: "HTML"})
        return;
        }
        else{
            // console.log("Больше")
            currentMessage = currentMessage.substring(0, currentMessage.lastIndexOf("Заказ #") - 4);
            // console.log("CurrentMessage: " + currentMessage)
            currentTextLength -= currentMessage.length;
            message = message.substring(currentMessage.length)
            await bot.sendMessage(chatID, currentMessage, {parse_mode: "HTML"})
        }
    }while(currentTextLength > 1)
return;
  }
  async function usersOrderList(username, date = null) {
    if(!date){
        let orderList = [];
        for (const order of (await db.getDropperOrderList(username))) {
            if (order.isSuccessful === 'true') {
                // console.log("\n\n1\n\n")
              if (order.type === "доставка") {
                // console.log("\n\n2\n\n")
                if (order.courierInfo) {
                // console.log("\n\n3\n\n")
                  let message = order.orderInfo + "Статус заказа: " + order.orderStatus + "\n" + order.courierInfo + ((order.delay !== null && order.delay !== "null") ? `\nОтложен на ${order.delay} минут` : "")
                  orderList.push(message);}
                 else{
                // console.log("\n\n4\n\n")
                    let message = order.orderInfo + "Статус заказа: " + order.orderStatus + ((order.delay !== null && order.delay !== "null") ? `\nОтложен на ${order.delay} минут` : "")
                  orderList.push(message);
                }
              } else if (order.type === "самовывоз") {
                // console.log("\n\n5\n\n")
                let message = order.orderInfo + "Статус заказа: оформлен"
                orderList.push(message);
              }
            }else if(order.isSuccessful === "false"){
                const message = `${order.orderInfo}\n<u>Заказ отклонён</u>\nДанные об ошибке:\n${order.errorInfo}`
                orderList.push(message);
            }
          }
        // console.log("OrderList: ", orderList.join('\n'));
        if (orderList.length === 0) {
            console.log("Пока нет активных заказов")
            return null;
        }
        else return orderList.join("\n");
    }
    else{
        console.log("Сработали заказы за прошлые дни:\n", date)
        const day = +(date.substring(0,2))
        const currentDay = +(new Date()).getDate()
        let returnedDay = 0;
        if(currentDay - day < 0){
            const currentMonth = (+(date.substring(3,5)))
            const dayInMonth = currentMonth  === 1 || currentMonth === 3 || currentMonth === 5 || currentMonth === 7 || currentMonth === 8 || currentMonth === 10 || currentMonth === 12 ? 31 : 30;
           returnedDay = currentDay + dayInMonth - day
        }else {
         returnedDay = currentDay - day
        }
        let orderList = [];
        // console.log(returnedDay)
        for (const order of (await db.getDropperOrderList(username, returnedDay))) {
            // console.log(order)
            if (order.isSuccessful === 'true') {
              if (order.type === "доставка") {
                if (order.courierInfo) {
                  let message = order.orderInfo + "Статус заказа: " + order.orderStatus + "\n" + order.courierInfo
                  orderList.push(message);}
                 else{
                    let message = order.orderInfo + "Статус заказа: " + order.orderStatus
                  orderList.push(message);
                }
              } else if (order.type === "самовывоз") {
                // console.log("\n\n5\n\n")
                let message = order.orderInfo + "Статус заказа: оформлен"
                orderList.push(message);
              }
            }else if(order.isSuccessful === "false"){
                const message = `Заказ отклонён. Данные заказа:\n${order.orderInfo}\nДанные об ошибке:\n${order.errorInfo}`
                orderList.push(message);
            }
          }
        // console.log("OrderList: ", orderList.join('\n'));
        if (orderList.length === 0) {
            console.log("Пока нет активных заказов")
            return null;
        }
        else return orderList.join("\n");
    }
  }
  async function orderFunc(chatID, data,managerID,username){
    await db.addOrder(chatID, username)
    const orderID = (await db.getDropperInfo(username)).orderNum
    const lastOrderType = (await db.getDropperInfo(username)).lastOrderType
    if (lastOrderType === "доставка") {
      orderObject = await orderHandler(data, lastOrderType, chatID);
      if (orderObject.isSucessful) {
           console.log("Successfull");
           await db.changeOrder(chatID, orderID, "оформлен", "orderStatus");
           await db.changeDropper(username, null, "lastOrderType")
           await db.changeOrder(chatID, orderID, orderObject.secondBody.получение, "type")
        await newOrder(orderObject.body, {chatID: chatID, orderID: orderID});
        if ((await db.getOrderInfo(chatID, orderID)).isSuccessful === 'true') {
          worker.postMessage({
            type: "order",
            managerID: managerID,
            order: orderID,
            dostavistaOrderID: await db.getOrderInfo(chatID, orderID).dostavistaOrderID
          });
        await db.changeOrder(chatID, orderID, "оформлен", "orderStatus");
        await db.changeDropper(username, null, "lastOrderType")
        const tempMsg = `<b>Заказ #${orderID}</b>
Глобльный номер: #${await db.getGlobalCount()}
Способ получения: Доставка
Номер телефона клиента: ${orderObject.secondBody.телефон}
Адрес отправки: ${orderObject.secondBody['адрес отправки']}
Адрес доставки: ${orderObject.secondBody.адрес}
Стоимость товаров: ${orderObject.secondBody['стоимость товаров']}
Стоимость доставки: ${orderObject.secondBody['стоимость доставки']}
Ожидаемое время прибытия курьера на точку: ${(await db.getOrderInfo(managerID, orderID)).shopRequiredTime}
Ожидаемое время прибытия курьера к клиенту: ${orderObject.secondBody.время}
Комментарий: ${orderObject.secondBody.комментарий}
`
     await db.changeOrder(chatID, orderID, tempMsg,"orderInfo")
          await db.changeOrder(chatID, orderID, orderObject.secondBody.время, 'clientRequiredTime')
          const msgID = await bot.sendMessage(chatID, `Заказ принят. Ждите информацию о курьере\n${tempMsg}Статус: Создан`, {parse_mode: "html", 
            reply_markup:JSON.stringify({
                    inline_keyboard: [
                        [{text: "Отменить заказ", callback_data: `/cancelOrder?orderID=${orderID}`}]
                    ]
            }) 
          });
          await db.changeOrder(chatID, orderID, msgID.message_id, "tgPrivateMessageID")
          const tempMessageID = await bot.sendMessage(tgGroupForOrders, tempMsg, {  reply_markup: JSON.stringify({
            inline_keyboard: [
              [
                {text: "Отложить", callback_data: `/tgGroupDelayChoose?chatID=${chatID};orderID=${orderID}`},
                {text: "Отменить", callback_data: `/tgGroupCancelDelivery?chatID=${chatID};orderID=${orderID}`}
              ]
            ]
        }),
        parse_mode: "html"})
          await db.changeOrder(chatID, orderID, tempMessageID.message_id, 'tgGroupFirstMessageID')
          return 0;
        } else {
const tempMsg =
`<b>Заказ #${orderID}</b>
Глобльный номер: #${await db.getGlobalCount()}
Способ получения: Доставка
Номер телефона клиента: ${orderObject.secondBody.телефон}
Адрес отправки: ${orderObject.secondBody['адрес отправки']}
Адрес доставки: ${orderObject.secondBody.адрес}
Стоимость товаров: ${orderObject.secondBody['стоимость товаров']}
Стоимость доставки: ${orderObject.secondBody['стоимость доставки']}
Ожидаемое время прибытия курьера на точку: ${orderObject.secondBody.время}
Ожидаемое время прибытия курьера к клиенту: ${orderObject.secondBody.время}
Комментарий: ${orderObject.secondBody.комментарий}
`
                 await db.changeOrder(chatID, orderID, tempMsg,"orderInfo")
          const msgID =await bot.sendMessage(chatID, "Возникла ошибка при создании заказа: \n" + (await db.getOrderInfo(chatID, orderID, "errorInfo")).errorInfo.includes("taking_amount") ? "Максимальная стоимость заказа не должна превышать 100.000р!" : (await db.getOrderInfo(chatID, orderID, "errorInfo")).errorInfo);
          await db.changeOrder(chatID, orderID, msgID, "tgPrivateMessageID")
          return 0;
        }
      } else {
        console.log("unsuccessful1");
        await bot.sendMessage(chatID, `Форма заказа заполнена некорректно. Пожалуйста, проверьте поле ${orderObject.body}`);
        await db.deleteOrder(chatID, orderID, username)
        return 0;
      }
    } else if (lastOrderType === "самовывоз") {
      orderObject = await orderHandler(data, lastOrderType, chatID);
      if (orderObject.isSuccessful) {   
        await db.changeOrder(chatID, orderID, "оформлен", "orderStatus");
        await db.changeOrder(chatID, orderID, true, "isSuccessful");
        await db.changeDropper(username, null, "lastOrderType")
        await db.changeOrder(chatID, orderID, orderObject.secondBody.получение, "type")
        const msgForSend = 
`<b>Заказ #${orderID}</b>
Глобльный номер: #${await db.getGlobalCount()}
Способ получения: Самовывоз
Номер телефона клиента: ${orderObject.secondBody.телефон}
Адрес отправки: ${orderObject.secondBody['адрес отправки']}
Стоимость товаров: ${orderObject.secondBody['стоимость товаров']}
Ожидаемое время прибытия клиента: ${orderObject.secondBody.время}
Комментарий: ${orderObject.secondBody.комментарий}
`
        await db.changeOrder(chatID, orderID, msgForSend,"orderInfo")
        const tempMessageID = await bot.sendMessage(chatID, `Заказ принят\n${msgForSend}Статус: Создан`,  {parse_mode: "html", 
            reply_markup:JSON.stringify({
                    inline_keyboard: [
                        [{text: "Отменить заказ", callback_data: `/cancelOrder?orderID=${orderID}`}]
                    ]
            }) 
          });
        await db.changeOrder(chatID, orderID, tempMessageID.message_id, 'tgPrivateMessageID')
        await db.changeOrder(chatID, orderID, (await bot.sendMessage(tgGroupForOrders, msgForSend, { reply_markup: JSON.stringify({
            inline_keyboard: [
              [
                {text: "Отменить", callback_data: `/tgGroupCancelPickup?chatID=${chatID};orderID=${orderID}`}
              ]
            ]
        }),
                parse_mode: "html"
            })).message_id, 'tgGroupFirstMessageID')
        return 0;
      } else {
        await bot.sendMessage(
          chatID,
          `Форма заказа заполнена некорректно. Пожалуйста, проверьте поле ${orderObject.body}`
        );
        await db.deleteOrder(chatID, orderID, username)
        return 0;
      }
    }
  }
  async function defaultMessage(chatID, data, managerID, username) {
    // console.log(typeof (await db.getOrderInfo(chatID, 17)).tgGroupSecondMessageID)
    // console.log((await db.getOrderInfo(chatID, 17)).tgGroupSecondMessageID)
    // return;
    console.log("Запуск defaultMessage")
    try{
       if(await db.isExists(username)){
        // console.log("Дроппер присутствует\n")
      if((await db.getDropperInfo(username)).lastAction && ((await db.getDropperInfo(username)).lastAction !== 'null')){
        // console.log("Было какое-то последнее действие!!!!!\n\n\n")
        switch((await db.getDropperInfo(username)).lastAction){
          case "support":  
          await bot.sendMessage(adminID, `<b>Новый тикет от пользователя @${username} </b>\n ${data}`, {parse_mode: "html"})
          await bot.sendMessage(chatID, 'Успешно! Тикет отправлен')
          await db.changeDropper(username, null, "lastAction")
          return 0;
          case "addDropper": 
          if(!(await db.isExists(data))){
            await db.addDropper(data)
            await bot.sendMessage(chatID, "Дроппер добавлен!")
          }else await bot.sendMessage(chatID, "Такой дроппер уже есть в списке!")
          await db.changeDropper(username, null, "lastAction")
          return 0;
          case "deleteDropper": 
          if(await db.isExists(data)){
            await db.deleteDropper(data)
            await bot.sendMessage(chatID, "Дроппер удалён!")
          }else await bot.sendMessage(chatID, "Такого дроппера нет в списке!")
          await db.changeDropper(username, null, "lastAction")
          return 0;
          case "groupForOrdersIDChange":
            await db.changeDataInfo('groupForOrdersID', data )
            await bot.sendMessage(chatID, "Успешно! Данные изменены")
            await db.changeDropper(username, null, "lastAction")
            return 0;
          case "requisitesChange":
            await db.changeDataInfo('requisites', data)
            await bot.sendMessage(chatID, "Успешно! Данные изменены")
            await db.changeDropper(username, null, "lastAction")
            return 0;
          case "DostavistaURLChange":
            await db.changeDataInfo('DostavistaURL', data)
            await bot.sendMessage(chatID, "Успешно! Данные изменены")
            await db.changeDropper(username, null, "lastAction")

            return 0;
          case "dostavistaTokenChange":
            await db.changeDataInfo('dostavistaToken', data)
            await bot.sendMessage(chatID, "Успешно! Данные изменены")
            await db.changeDropper(username, null, "lastAction")

            return 0;
          case "managerPhoneChange":
            await db.changeDataInfo('managerPhone', data)
            await bot.sendMessage(chatID, "Успешно! Данные изменены")
            await db.changeDropper(username, null, "lastAction")

            return 0;
        }
      }
         if (data.includes("#order") && (((await db.getDropperInfo(username))).lastOrderType === 'null' ? false : true)) {
        console.log("Это заказ и способ доставки есть\n")
           return await orderFunc(chatID, data, managerID, username)
         }
         else if(data.includes("#order") && (((await db.getDropperInfo(username))).lastOrderType !== 'null' ? false : true)){
           await bot.sendMessage(chatID, 'Пожалуйста, выберите способ получения заказа с помощью меню')
           return 0;
         }
         const dateMonth = +((new Date()).getMonth())
         const dateDay = +((new Date()).getDate())
         switch (data) {
            case getDayForKeyboard(dateDay, dateMonth, 6):
                await sendMessageByParts(chatID, await adminOrderList(getDayForKeyboard(dateDay, dateMonth, 6)))
                break;
            case getDayForKeyboard(dateDay, dateMonth, 5):
                await sendMessageByParts(chatID, await adminOrderList(getDayForKeyboard(dateDay, dateMonth, 5)))
                break;
            case getDayForKeyboard(dateDay, dateMonth, 4):
                await sendMessageByParts(chatID, await adminOrderList(getDayForKeyboard(dateDay, dateMonth, 4)))
                break;
            case getDayForKeyboard(dateDay, dateMonth, 3):
                await sendMessageByParts(chatID, await adminOrderList(getDayForKeyboard(dateDay, dateMonth, 3)))
                break;
            case getDayForKeyboard(dateDay, dateMonth, 2):
                await sendMessageByParts(chatID, await adminOrderList(getDayForKeyboard(dateDay, dateMonth, 2)))
                break;
            case getDayForKeyboard(dateDay, dateMonth, 1):
                await sendMessageByParts(chatID, await adminOrderList(getDayForKeyboard(dateDay, dateMonth, 1)))
                break;
            case "Прошлые заказы":
            const pastOrdersMenuOptions = {
                reply_markup: {
                  keyboard:[
                    [getDayForKeyboard(dateDay, dateMonth, 6), getDayForKeyboard(dateDay, dateMonth, 5)],
                    [getDayForKeyboard(dateDay, dateMonth, 4), getDayForKeyboard(dateDay, dateMonth, 3)],
                    [getDayForKeyboard(dateDay, dateMonth, 2), getDayForKeyboard(dateDay, dateMonth, 1)], 
                    ["Главное меню"]]
                }
              }
              await bot.sendMessage(chatID, `Выберите интересующую вас дату`, pastOrdersMenuOptions)
            break;
           case "Техподдержка":
            // console.log("Texsupport\n\n\n")
            // console.log(username)
             await bot.sendMessage(chatID, supportMessage, {reply_markup: JSON.stringify({inline_keyboard: [[{text: "Назад", callback_data: "/cancelSupport"}]]})})
             await db.changeDropper(username, "support", "lastAction")
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
                 await sendMessageByParts(chatID, await adminOrderList())
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
                 await db.changeDropper(username, "addDropper", "lastAction")
                 return 0;
               }
               else await bot.sendMessage(chatID, "Некорректная команда. Пожалуйста, воспользуйтесь меню")
               break;
             case "Удалить дроппера":
               if(isAdmin(username)){
                 await bot.sendMessage(chatID, "Пожалуйста, напишите никнейм пользователя без @ в следующем сообщении\nНапример, i_jusp")
                 await db.changeDropper(username, "deleteDropper", "lastAction")
                 return 0;
               }
               else await bot.sendMessage(chatID, "Некорректная команда. Пожалуйста, воспользуйтесь меню")
               break;
               case "Перезагрузить бота":
                if(isAdmin(username)){
                    await bot.sendMessage(chatID, "Бот перезагружается...")
                    await bot.sendMessage(adminID, "Бот перезагружается...")
                    process.exit(0)
                    return 0;
                  }
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
               await sendMessageByParts(chatID, await usersOrderList(username) ? `Список активных заказов:\n${(await usersOrderList(username))}` : `У вас еще нет активных заказов`);
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
       else if(await db.getDropperInfo(username).lastAction === "pending"){
        await bot.sendMessage(chatID, "Вы уже отправили заявку на добавление! Пожалуйста, ожидайте")
       }
       else{
        // await bot.sendMessage(chatID, `К сожалению вас нет в списке пользователей.\nПожалуйста, напишите @sergzvezdilin, чтобы воспользоваться ботом или отправьте запрос на добавление с помощью кнопки ниже`, {reply_markup: JSON.stringify({inline_keyboard: [[{text: "Оставить заявку", callback_data: "pending"}]]})})
        await bot.sendMessage(chatID, `К сожалению вас нет в списке пользователей.\nПожалуйста, напишите @i_jusp, чтобы воспользоваться ботом или отправьте запрос на добавление с помощью кнопки ниже`, {reply_markup: JSON.stringify({inline_keyboard: [[{text: "Оставить заявку", callback_data: "pending"}]]})})
       }
    }catch(unexpectedError){
        await db.changeDropper(username, null, "lastAction")
        await db.changeDropper(username, null, "lastOrderType")
        bot.sendMessage(adminID, "Неизвестная ошибка в работе бота: (4)\n " +unexpectedError)
    }
  }
  async function callbackQueryCommands(chatID, data, managerID, username) {
    try{
      let obj = JSON.parse(data)
      pendingList.forEach((a, i)=>{
        if(obj.username === a){
          if(obj.answer === "denied"){
            bot.sendMessage(obj.chatID, "К сожалению, ваша заявка была отклонена")
            db.changeDropper(username, null, "lastAction")
            pendingList.splice(i, 1)
          }
          else if(obj.answer === "applied"){
            bot.sendMessage(obj.chatID, "Ваша заявка была одобрена! Теперь вы можете воспользоваться ботом")
            db.addDropper(a)
            db.changeDropper(username, null, "lastAction")
            pendingList.splice(i, 1)
          }
        }
       
      })
      return 0;
    }catch(err){
    //   console.log("Object is not json\n")
    }
    if(data.includes("/tgGroupDelayChoose")){
        const chatID = data.substring(27, data.indexOf(';'))
        const orderID = data.substring(data.indexOf(";") +9 )
        const tempMsgID = await bot.sendMessage(tgGroupForOrders, "Выберите подходящее время задержки доставки: ", {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                  [
                    {text: "30 минут", callback_data: `/tgGroupDelayTime030?chatID=${chatID};orderID=${orderID}`},
                    {text: "1 час", callback_data:`/tgGroupDelayTime060?chatID=${chatID};orderID=${orderID}`}
                  ],
                  [
                    {text: "1,5 часа", callback_data: `/tgGroupDelayTime090?chatID=${chatID};orderID=${orderID}`},
                    {text: "2 часа", callback_data: `/tgGroupDelayTime120?chatID=${chatID};orderID=${orderID}`}
                  ]
                ]
            }),
            reply_to_message_id: (await db.getOrderInfo(chatID, orderID)).tgGroupFirstMessageID,
                parse_mode: "html"
        })
        setTimeout(() =>{bot.deleteMessage(tgGroupForOrders, tempMsgID.message_id)}, 1000*30)
        return;
    }

    else if(data.includes("/tgGroupDelayTime")){
        const chatID = data.substring(28, data.indexOf(';'))
        const orderID = data.substring(data.indexOf(";") +9 )
        const time = +(data.substring(data.lastIndexOf("Time") + 4, data.lastIndexOf("Time") + 7))
        // console.log(time)
        const tempMsgID = await bot.sendMessage(tgGroupForOrders, "Время доставки перенесено на " + time + " минут\nВ ответном сообщении к заказу вы можете оставить комментарий - причину переноса или дополнительную информацию", {
            reply_to_message_id: (await db.getOrderInfo(chatID, orderID)).tgGroupFirstMessageID,
                parse_mode: "html"
        })
        setTimeout(() =>{bot.deleteMessage(tgGroupForOrders, tempMsgID.message_id)}, 1000*30)
        await db.changeOrder(chatID, orderID, time, "delay")
        await db.changeOrder(chatID, orderID, `${(new Date()).getHours()}:${(new Date()).getMinutes()}`, "currentTimeOfDelay")
        await bot.sendMessage(chatID, `Время доставки заказа отложено на ${time} минут, так как мы не успеваем подготовить товар к указанному времени`, {
            reply_to_message_id: (await db.getOrderInfo(chatID,orderID)).tgPrivateMessageID,
                parse_mode: "html"
        })
        return;
    }
    else if(data.includes("/tgGroupCancelDelivery")){
        const chatID = data.substring(data.lastIndexOf("chat") + 7, data.indexOf(';'))
        // console.log(chatID)
        const orderID = data.substring(data.indexOf(";") +9 )
        // console.log(orderID)
        const tempMsgID = await bot.sendMessage(tgGroupForOrders, `Вы уверены, что хотите отменить заказ?`, {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                  [
                    {text: "Подтвердить отмену", callback_data: `/tgGroupConfirmCancel?chatID=${chatID};orderID=${orderID}`}
                  ]
                ]
            }),
            reply_to_message_id: (await db.getOrderInfo(chatID, orderID)).tgGroupFirstMessageID,
                parse_mode: "html"
        })
        setTimeout(() =>{bot.deleteMessage(tgGroupForOrders, tempMsgID.message_id)}, 1000*30)
        return;
    }
    else if(data.includes("/tgGroupConfirmCancel")){
        const chatID = data.substring(data.lastIndexOf("chat") + 7, data.indexOf(';'))
        const orderID = data.substring(data.indexOf(";") +9 )
        const dbInfo = await db.getOrderInfo(chatID, orderID)
        const tempMsgID =await bot.sendMessage(tgGroupForOrders, `Заказ отменён. В ответном сообщении к заказу вы можете оставить комментарий - причину отмены или дополнительную информацию`, {
            reply_to_message_id: dbInfo.tgGroupFirstMessageID
        })
        const editMsg = `${dbInfo.orderInfo}Статус: отменён оператором${dbInfo.courierInfo !== null ? (`\nИнформация о курьере\n${dbInfo.courierInfo}`) : ''}${dbInfo.delay !== null ? (`\nОтложен на ${dbInfo.delay} минут`) : ''}`
        bot.editMessageText(editMsg, {  
            chat_id: tgGroupForOrders,
            message_id: dbInfo.tgGroupFirstMessageID,
            parse_mode: "html"})
        setTimeout(() =>{bot.deleteMessage(tgGroupForOrders, tempMsgID.message_id)}, 1000*30)
        const firsGroupMSGID = dbInfo.tgGroupFirstMessageID
        const privateMSGID = dbInfo.tgPrivateMessageID
        const dostavistaOrderID = dbInfo.dostavistaOrderID
        if(dostavistaOrderID){
            fetch(`${DostavistaURL}cancel-order`,
                {
                  headers: {"X-DV-Auth-Token": dostavistaToken},
                  method: "POST",
                  body: JSON.stringify({order_id: +dostavistaOrderID})
                }
              )
                .then((response) => response.json())
                .then((result) => {
                    if (result.is_successful) {
                        console.log("Заказ успешно отменён")
                  }else{
                    console.log("Возникла ошибка при отмене заказа")
                    bot.sendMessage(chatID, `Возникла ошибка при отмене заказа`, {
                        reply_to_message_id: privateMSGID
                    })
                    bot.sendMessage(tgGroupForOrders, `Возникла ошибка при отмене заказа`, {
                        reply_to_message_id: firsGroupMSGID
                    })
                  }
                })
                .catch((err) =>
                  console.log("Ошибка при отмене заказа: ", err)
                );
        }
        await bot.sendMessage(chatID, `Заказ был отменён оператором`, {
            reply_to_message_id: privateMSGID
        })
        await db.changeOrder(chatID, orderID, "Отменён оператором", "orderStatus")
        await db.changeOrder(chatID, orderID, "Отменён оператором", "errorInfo")
        await db.changeOrder(chatID, orderID, "false", "isSuccessful")
        return;
    }
    else if(data.includes("/cancelOrder")){
        const orderID = data.substring(data.indexOf("=") + 1)
        const tempMsgID = await bot.sendMessage(chatID, `Вы уверены, что хотите отменить заказ?`, {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                  [
                    {text: "Подтвердить отмену", callback_data: `/confirmOrderCancel?orderID=${orderID}`}
                  ]
                ]
            }),
            reply_to_message_id: (await db.getOrderInfo(chatID, orderID)).tgPrivateMessageID
        })
        setTimeout(() =>{bot.deleteMessage(chatID, tempMsgID.message_id)}, 1000*30)

        return;
    }
    else if(data.includes("/confirmOrderCancel")){
        const orderID = data.substring(data.indexOf("=") + 1)
        const dbInfo = (await db.getOrderInfo(chatID, orderID))
        await bot.sendMessage(chatID, `Заказ отменён`, {
            reply_to_message_id: dbInfo.tgPrivateMessageID
        })
        await bot.sendMessage(tgGroupForOrders, `Заказ отменён дроппером`, {
            reply_to_message_id: dbInfo.tgGroupFirstMessageID
        })
        const editMsg = `${dbInfo.orderInfo}Статус: Отменён дроппером${dbInfo.courierInfo !== null ? (`\nИнформация о курьере\n${dbInfo.courierInfo}`) : ''}${dbInfo.delay !== null ? (`\nОтложен на ${dbInfo.delay} минут`) : ''}`
        bot.editMessageText(editMsg, {  
            chat_id: tgGroupForOrders,
            message_id: dbInfo.tgGroupFirstMessageID,
            parse_mode: "html"})
        await db.changeOrder(chatID, orderID, 'false', "isSuccessful")
        await db.changeOrder(chatID, orderID, 'Заказ был отменён дроппером', "errorInfo")
        await db.changeOrder(chatID, orderID, 'Отменён дроппером', "orderStatus")
        if(dbInfo.type === 'доставка'){
            fetch(`${DostavistaURL}cancel-order`,
                {
                  headers: {"X-DV-Auth-Token": dostavistaToken},
                  method: "POST",
                  body: JSON.stringify({order_id: +dbInfo.dostavistaOrderID})
                }
              )
                .then((response) => response.json())
                .then((result) => {
                    if (result.is_successful) {
                        console.log("Заказ успешно отменён")
                  }else{
                    console.log("Возникла ошибка при отмене заказа")
                    bot.sendMessage(chatID, `Возникла ошибка при отмене заказа`, {
                        reply_to_message_id: dbInfo.tgPrivateMessageID
                    })
                    bot.sendMessage(tgGroupForOrders, `Возникла ошибка при отмене заказа`, {
                        reply_to_message_id: dbInfo.tgGroupFirstMessageID
                    })
                  }
                })
                .catch((err) =>
                  console.log("Ошибка при отмене заказа: ", err)
                );
        }
        return;
    }
    else if(data.includes("/tgGroupCancelPickup")){
        const chatID = data.substring(data.lastIndexOf("chat") + 7, data.indexOf(';'))
        const orderID = data.substring(data.indexOf(";") +9 )
        const tempMsgID = await bot.sendMessage(tgGroupForOrders, `Вы уверены, что хотите отменить заказ?`, {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                  [
                    {text: "Подтвердить отмену", callback_data: `/tgGroupConfirmCancel?chatID=${chatID};orderID=${orderID}`}
                  ]
                ]
            }),
            reply_to_message_id: (await db.getOrderInfo(chatID, orderID)).tgGroupFirstMessageID
        })
        setTimeout(() =>{bot.deleteMessage(tgGroupForOrders, tempMsgID.message_id)}, 1000*30)

        return;
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
        await db.changeDropper(username, "самовывоз", "lastOrderType")
        break;
      case "/delivery":
        await bot.sendMessage(
          chatID,
          "Новая заявка на доставку \nПожалуйста, отправьте заполненную форму в следующем сообщении",
          options.deliveryMenuOptions
        );
        await db.changeDropper(username, "доставка", "lastOrderType")
        break;
      case "/newOrderDetails":
        await bot.sendMessage(chatID, newOrderDetails);
        break;
        case "/pickupTemplate":
        await bot.sendMessage(chatID, pickupTemplate)
        break;
        case "/deliveryTemplate":
        await bot.sendMessage(chatID, deliveryTemplate)
        break;
      case "/returnToOrderMenu":
        await bot.sendMessage(
          chatID,
          "Выберите тип заказа",
          options.orderMenuOptions
        );
        break;
        case "/cancelSupport":
          await bot.sendMessage(chatID, "Создание тикета поддержки отменено")
          await db.changeDropper(username, null, "lastAction")
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
        await db.changeDropper(username, null, "lastAction")
        await bot.sendMessage(chatID, `Значение поля: ${await db.getData('managerPhone')}`, {reply_markup: JSON.stringify({inline_keyboard: [[{text: "Изменить", callback_data: `${data}Change`}]]})})
        break;
        case "/dostavistaToken": 
        await db.changeDropper(username, null, "lastAction")
        await bot.sendMessage(chatID, `Значение поля: ${await db.getData('dostavistaToken')}`, {reply_markup: JSON.stringify({inline_keyboard: [[{text: "Изменить", callback_data: `${data}Change`}]]})})
        break;
        case "/DostavistaURL": 
        await db.changeDropper(username, null, "lastAction")
        await bot.sendMessage(chatID, `Значение поля: ${await db.getData('DostavistaURL')}`, {reply_markup: JSON.stringify({inline_keyboard: [[{text: "Изменить", callback_data: `${data}Change`}]]})})
        break;
        case "/groupForOrdersID": 
        await db.changeDropper(username, null, "lastAction")
        await bot.sendMessage(chatID, `Значение поля: ${await db.getData('groupForOrdersID')}`, {reply_markup: JSON.stringify({inline_keyboard: [[{text: "Изменить", callback_data: `${data}Change`}]]})})
        break;
        case "/requisites": 
        await db.changeDropper(username, null, "lastAction")
        await bot.sendMessage(chatID, `Значение поля: ${await db.getData('requisites')}`, {reply_markup: JSON.stringify({inline_keyboard: [[{text: "Изменить", callback_data: `${data}Change`}]]})})
        break;


        case "/managerPhoneChange": 
        await bot.sendMessage(chatID, `Отправьте в следующем сообщении обновлённые данные без лишних знаков`, {reply_markup: JSON.stringify({inline_keyboard: [[{text: "Отменить", callback_data: `/managerPhone`}]]})})
        await db.changeDropper(username, 'managerPhoneChange', "lastAction")
        break;
        case "/dostavistaTokenChange": 
        await bot.sendMessage(chatID, `Отправьте в следующем сообщении обновлённые данные без лишних знаков`, {reply_markup: JSON.stringify({inline_keyboard: [[{text: "Отменить", callback_data: `/dostavistaToken`}]]})})
        await db.changeDropper(username, 'dostavistaTokenChange', "lastAction")
        break;
        case "/DostavistaURLChange": 
        await bot.sendMessage(chatID, `Отправьте в следующем сообщении обновлённые данные без лишних знаков`, {reply_markup: JSON.stringify({inline_keyboard: [[{text: "Отменить", callback_data: `/DostavistaURL`}]]})})
        await db.changeDropper(username, 'DostavistaURLChange', "lastAction")
        break;
        case "/groupForOrdersIDChange": 
        await bot.sendMessage(chatID, `Отправьте в следующем сообщении обновлённые данные без лишних знаков`, {reply_markup: JSON.stringify({inline_keyboard: [[{text: "Отменить", callback_data: `/groupForOrdersID`}]]})})
        await db.changeDropper(username, 'groupForOrdersIDChange', "lastAction")
        break;
        case "/requisitesChange": 
        await bot.sendMessage(chatID, `Отправьте в следующем сообщении обновлённые данные без лишних знаков`, {reply_markup: JSON.stringify({inline_keyboard: [[{text: "Отменить", callback_data: `/requisites`}]]})})
        await db.changeDropper(username, 'requisitesChange', "lastAction")
        break;
        case "pending": 
        await bot.sendMessage(chatID, "Ваша заявка принята! \nЕсли она будет одобрена, вы получите уведомление")
        await bot.sendMessage(adminChatID, "Запрос на добавление в список дропперов: @" + username, {reply_markup: JSON.stringify({inline_keyboard: [[{text: "Принять", callback_data: JSON.stringify({chatID: chatID, username: username, answer: "applied"})}, {text: "Отказать", callback_data: JSON.stringify({chatID: chatID, username: username, answer: "denied"})}]]})})
        // await bot.sendMessage(sergeyChatID, "Запрос на добавление в список дропперов: @" + username, {reply_markup: JSON.stringify({inline_keyboard: [[{text: "Принять", callback_data: JSON.stringify({chatID: chatID, username: username, answer: "applied"})}, {text: "Отказать", callback_data: JSON.stringify({chatID: chatID, username: username, answer: "denied"})}]]})})
        await db.changeDropper(username, 'pending', "lastAction")
        pendingList.push(username)
        break;
      default:
        await bot.sendMessage(chatID, `Unexpected callback data`);
    }
  }

  bot.setMyCommands([{ command: "/start", description: "Знакомство" }]);
  worker.on("message", (msg) => {

    if(msg.type === "courier"){
      console.log("Сообщение о курьере от воркера")
      db.changeOrder(msg.chatID, msg.orderID, `ФИО: ${msg.data.surname} ${msg.data.name} ${msg.data.middlename}\nТелефон: ${msg.data.phone}`, "courierInfo")
    try{  !async function() { 
        console.log("Вызов анонимной асинхронной функции для изменения приватного сообщения заказа с курьером")
        const dbInfo = (await db.getOrderInfo(msg.chatID, msg.orderID))
        const editMsg = `${dbInfo.orderInfo}Статус: ${dbInfo.orderStatus}\n${`Информация о курьере\nФИО: ${msg.data.surname} ${msg.data.name} ${msg.data.middlename}\nТелефон: ${msg.data.phone}\n`}${dbInfo.delay !== null ? `Отложен на ${dbInfo.delay} минут` : ''}`
      bot.sendMessage(
        msg.chatID,
        `Найден курьер к заказу
        ФИО: ${msg.data.surname} ${msg.data.name} ${msg.data.middlename}
        Телефон: ${msg.data.phone}`,
        {
            reply_to_message_id: dbInfo.tgPrivateMessageID
        }
      );
    console.log("Вызов анонимной асинхронной функции для изменения публичного сообщения заказа с курьером")
    bot.editMessageText(editMsg, {
        chat_id: tgGroupForOrders,
        message_id: dbInfo.tgGroupFirstMessageID,
        reply_markup: JSON.stringify({
            inline_keyboard: [
              [
                {text: "Отложить", callback_data: `/tgGroupDelayChoose?chatID=${msg.chatID};orderID=${msg.orderID}`},
                {text: "Отменить", callback_data: `/tgGroupCancelDelivery?chatID=${msg.chatID};orderID=${msg.orderID}`}
              ]
            ]
        }),
        parse_mode: "html"})
    }()}catch(err){console.log("Плановая ошибка, ", err)}
    }
    else if(msg.type ==="status"){
      console.log("Сообщение о статусе от воркера ", msg.status)
      !async function() {   
          try{
            const dbInfo = (await db.getOrderInfo(msg.chatID, msg.orderID))
        await db.changeOrder(msg.chatID, msg.orderID, msg.status, "orderStatus")
    if(msg.status !== dbInfo.lastSendedOrderStatus || (!dbInfo.isDelaySended && dbInfo.delay)){
         console.log("Вызов анонимной асинхронной функции для изменения сообщений со статусом")
         const editMsg = `${dbInfo.orderInfo}Статус: ${msg.status}\n${dbInfo.courierInfo !== null ? `Информация о курьере\n${dbInfo.courierInfo}` : ''}${dbInfo.delay !== null ? `Отложен на ${dbInfo.delay} минут` : ''}`
        await db.changeOrder(msg.chatID, msg.orderID, msg.status, "lastSendedOrderStatus")
        if(dbInfo.delay){await db.changeOrder(msg.chatID, msg.orderID, true, "isDelaySended")}
        await bot.editMessageText(editMsg, {
          chat_id: tgGroupForOrders,
          message_id: dbInfo.tgGroupFirstMessageID,
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [
                {text: "Отложить", callback_data: `/tgGroupDelayChoose?chatID=${msg.chatID};orderID=${msg.orderID}`},
                {text: "Отменить", callback_data: `/tgGroupCancelDelivery?chatID=${msg.chatID};orderID=${msg.orderID}`}
              ]
            ]
        }),
        parse_mode: "html"})
        await bot.editMessageText(editMsg, {
            chat_id: msg.chatID,
            message_id: (await db.getOrderInfo(msg.chatID, msg.orderID)).tgPrivateMessageID,
            parse_mode: "html",
            reply_markup:JSON.stringify({
                        inline_keyboard: [
                            [{text: "Отменить заказ", callback_data: `/cancelOrder?orderID=${msg.orderID}`}]
                        ]
                }) 
            })
        };  
    }catch(err){
        // console.log("Ошибка при получении статуса воркера: ", err)
        // bot.sendMessage(adminChatID, "Ошибка при получении статуса воркера: " + err)
    }
}()
}
    else if(msg.type ==="reload"){
        bot.sendMessage(adminChatID, `Плановая очистка данных`)
      console.log("Очистка данных")
      setTimeout(() =>{
        db.shiftTables()
    }, 7200000)
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
    //   console.log(msg);
      callbackQueryCommands(chatID, data, managerID, username);
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
    //   console.log(msg);
      if(msg.chat.type === 'private'){
        console.log("Сработал приватный тип чата")
          defaultMessage(chatID, text, managerID, username);
      } else if (msg.chat.type === 'group' || msg.chat.type === 'supergroup'){
        console.log("Сработал групповой тип чата")
        if(msg.reply_to_message){
        console.log("Сработало ответное сообщение из группы")
            const returnedObject = (await db.getOrderInfoByMessageID(msg.reply_to_message.message_id))
           if(returnedObject){
            if(text.includes("#comment")){
            await bot.sendMessage(returnedObject.chatID, `Новый комментарий по заказу: \n ${text}`, {
                reply_to_message_id: returnedObject.tgPrivateMessageID,
                parse_mode: "html"
            })
            const tempMsgId = await bot.sendMessage(tgGroupForOrders, `Комментарий отправлен`, {
                reply_to_message_id: msg.message_id,
                parse_mode: "html"
            })
            setTimeout(() =>{bot.deleteMessage(tgGroupForOrders, tempMsgID)},30000)
        }
           }else{
            const tempMsgID = await bot.sendMessage(tgGroupForOrders, `Выбранное сообщение не является заказом`,{
                reply_to_message_id: msg.message_id,
                parse_mode: "html"
            })
            setTimeout(() =>{bot.deleteMessage(tgGroupForOrders, tempMsgID)},30000)
           }
        }
      }
    }catch(unexpectedError){
       bot.sendMessage(adminID, "Неизвестная ошибка в работе бота: (2)\n " + unexpectedError)
    }
  });
}catch(unexpectedError){
   bot.sendMessage(adminID, "Неизвестная ошибка в работе бота: (1)\n " + unexpectedError)
}
}
shell()