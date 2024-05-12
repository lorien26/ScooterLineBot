function orderHandler(message, получение) {
  const { requisites, managerPhone } = require("./staticData");
  class ParseOrder {
    constructor(message, получение) {
      this.комментарий = " ";
      this.транспорт = 7;
      this.имя = " ";
      let isTime = null
      const listOfObjects = String(message)
        .toLowerCase()
        .split("\n")
        .filter(Boolean);
      listOfObjects.forEach((str) => {
        const arr = str.split(":");
        if(arr.length > 2){
          isTime = true;
        }

        const name = String(arr[0]).trim();
        do {
          arr[1] = String(arr[1]).trim();
        } while (arr[1] !== arr[1].trim());
        if (name === "транспорт") this[name] = Number(arr[1]);
        else this[name] = arr[1];
       
      });
      if(isTime) this.время = ":"
      this.получение = получение;
    }
  }
  function isValidWithReason(form) {
    if (form.получение == "доставка") {
      if (typeof timeCheck(form.время) === "string") return timeCheck(form.время);
      if (!form["стоимость с доставкой"]) return "Стоимость с доставкой";
      if(!form["стоимость без доставки"]) return "Стоимость без доставки"
      if (!form.модель) return "Модель";
      if (!form.адрес) return "Адрес";
      if (
        (form["адрес отправки"] !== "южные ворота") &&
        form["адрес отправки"] !== "тихорецкий бульвар"
      )
        return "Адрес отправки";
      if (!form.телефон) return "Телефон";
    } else if (form.получение == "самовывоз") {
      if (!form.время) return "Время";
      if (!form.стоимость) return "Цена";
      if (!form.модель) return "Модель";
      if (
        !(form["адрес отправки"] !== "южные ворота") &&
        form["адрес отправки"] !== "тихорецкий бульвар"
      )
        return "Адрес отправки";
      if (!form.телефон) return "Телефон";
    } else return null;
  }
  function timeCheck(time) {
    if(!time) return "Время"
    if(time === ":") return 'В поле Время не должно быть лишних двоеточий ":". Для разделения часов и минут следует использовать "."'
    if(time !== 'как можно скорее'){
    const currentDate = new Date();
    const listOfTime = time.split('-');
    const startH = listOfTime[0].substring(0, 2);
    const startM = listOfTime[0].substring(3);
    const endH = listOfTime[1].substring(0, 2);
    const endM = listOfTime[1].substring(3);
    if (currentDate.getHours() >= +startH || (currentDate.getHours() >= +startH && currentDate.getMinutes() + 10 >= +startM) ) return "Курьер не сможет доставить заказ в указанный промежуток времени"
    else {
      dateOrder = JSON.stringify(currentDate).substring(
        1,
        JSON.stringify(currentDate).indexOf("T")
      );
      return [
        `${dateOrder}T${startH}:${startM}:00+03:00`,
        `${dateOrder}T${endH}:${endM}:00+03:00`,
      ];
    }
  }
else if (time == 'как можно скорее'){
  return [null, null];
}}

  function formToOrder(order) {
    function orderCreate(objectToOrder) {
      orderForm = {};
      orderForm.type = "standard";
      orderForm.matter = "Электросамокат";
      orderForm.vehicle_type_id = +objectToOrder.транспорт;
      orderForm.total_weight_kg = 0;

      orderForm.insurance_amount = objectToOrder.ценаСтраховки;

      orderForm.is_client_notification_enabled = false;
      orderForm.is_contact_person_notification_enabled = true;
      orderForm.is_route_optimizer_enabled = false;
      orderForm.loaders_count = 0;
      orderForm.backpayment_details = requisites; // Null Нужно будет указать реквизиты для перевода
      orderForm.is_motobox_required = false;
      orderForm.payment_method = "cash"; // Null Нужно указать способ оплаты
      orderForm.bank_card_id = null;
      orderForm.promo_code = null;
      orderForm.is_return_required = false;
      orderForm.points = [
        {
          address: String(objectToOrder["адрес отправки1"]),
          contact_person: { phone: managerPhone },
          note: null, //Информация для курьера
          is_order_payment_here: false,
          invisible_mile_navigation_instructions: objectToOrder.instruction, //инстуркции как добраться до места назначения
        },
        {
          address: String(objectToOrder.адрес),
          contact_person: { phone: objectToOrder.телефон, name: objectToOrder.имя },
          required_start_datetime: objectToOrder.время1[0],
          required_finish_datetime: objectToOrder.время1[1],
          taking_amount: objectToOrder["стоимость с доставкой"],
          buyout_amount: "0.00",
          is_order_payment_here: true,
          invisible_mile_navigation_instructions: null, //инстуркции как добраться до места назначения
        },
      ];
    

      return orderForm;
    }
    if (order.получение === "доставка") {
      order.время1 = timeCheck(order.время)
      if (+order['стоимость с доставкой'] > 49999) {
        order.ценаСтраховки = "50000.00";
      } else order.ценаСтраховки = order['стоимость с доставкой'];
      if (order["адрес отправки"] === "южные ворота") {
        order.instruction = "19я линия, 91 павельон, 9 выход";
        order["адрес отправки1"] = "МКАД 19 км, 20, стр. 1, Москва";
        order.ad = "Южные ворота";
      } else if (order["адрес отправки"] === "тихорецкий бульвар") {
        order["адрес отправки1"] = "Тихорецкий б-р 1 строение 19";
        order.instruction = "ТЦ Технолайн, павильон Н-52";
        order.ad = "Тихорецкий б-р";
      }
      const orderToDostavista = orderCreate(order);
      return orderToDostavista;
    }
  }

  const parsedOrder = new ParseOrder(message, получение);
  console.log("\n\n\n\Ниже ")
  console.log(parsedOrder.комментарий)
  console.log(parsedOrder);
  
  if (!isValidWithReason(parsedOrder) && parsedOrder.получение === "доставка") {
    console.log('First if')
    const order = formToOrder(parsedOrder);
    console.log(order);
    return {
      isSucessful: true,
      body: order,
      secondBody: parsedOrder,
    };
  } else if (!isValidWithReason(parsedOrder) && parsedOrder.получение === "самовывоз") {
    console.log('Second if')
    return {
      isSuccessful: true,
      body: null,
      secondBody: parsedOrder
    };
  } else {
    console.log("Last if")
    return {
      isSucessful: false,
      body: isValidWithReason(parsedOrder),
    };
  }
}
module.exports = { orderHandler };
