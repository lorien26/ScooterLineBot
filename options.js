module.exports = {
  startMessageOptions: {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          { text: "Информация", callback_data: "/info" },
        
        ]
      ],
    }),
  },
  mainMenuOptions: {
    reply_markup: {
      keyboard: [
        ["Новый заказ", "Мои заказы"],
        ["Информация"],
        ["Техподдержка"],
      ],
    },
  },

  adminMenuOptions: {
    reply_markup: {
      keyboard: [
        ["Новый заказ", "Мои заказы"],
        ["Информация", 'Техподдержка'],
        ["Админ панель"],
      ],
    },
  },
  adminPanelMenuOptions: {
    reply_markup:{
      keyboard:[
        ["Добавить дроппера", "Удалить дроппера"],
        ["Список дропперов", "Заказы дропперов"],
        ["Прошлые заказы", "Изменить данные"],
        ["Перезагрузить бота", "Главное меню"]
      ]
    }
  },
  tgGroupDeliveryOptions:{
    reply_markup: JSON.stringify({
        inline_keyboard: [
          [
            {text: "Отложить", callback_data: `/tgGroupDelay`},
            {text: "Отменить", callback_data: "/tgGroupCancelDelivery"}
          ]
        ]
    })
  },
  tgGroupDeliveryDelayOptions:{
    reply_markup: JSON.stringify({
        inline_keyboard: [
          [
            {text: "30 минут", callback_data: "/tgGroupDelay30"},
            {text: "1 час", callback_data: "/tgGroupDelay60"}
          ],
          [
            {text: "1,5 часа", callback_data: "/tgGroupDelay90"},
            {text: "2 часа", callback_data: "/tgGroupDelay120"}
          ],
          [
            {text: "Назад", callback_data: "/tgGroupBack"}
          ]
        ]
    })
  },
  tgGroupPickupOptions:{
    reply_markup: JSON.stringify({
        inline_keyboard: [
          [
            {text: "Отменить", callback_data: "/tgGroupPickupCancel"}
          ]
        ]
    })
  },
  changeInfoOptions:{
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          {text: "Токен Dostavista", callback_data: "/dostavistaToken"},
          {text: "Адрес Dostavista", callback_data: "/DostavistaURL"}
        ],
        [
          {text: "Телефон менеджера", callback_data: "/managerPhone"},
          {text: "Группа с заказами", callback_data: "/groupForOrdersID"}
        ],
        [
          {text: "Реквизиты для оплаты", callback_data: "/requisites"}
          
        ]
      ]
  })},
  infoMenuOptions:{
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          {text: "Оформление доставки", callback_data: "/deliveryGuide"},
          {text: "Образец", callback_data: "/deliveryPrototype"}
        ],
        [
          {text: "Оформление самовывоза", callback_data: "/pickupGuide"},
          {text: "Образец", callback_data: "/pickupPrototype"}
        ],
        [
          {text: "Особенности оформления заявок", callback_data: "/newOrderDetails"}
          
        ]
      ]
  })},
  orderMenuOptions: {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          { text: "Доставка", callback_data: "/delivery" },
          { text: "Самовывоз", callback_data: "/pickup" },
        ],
      ],
    }),
  },
  deliveryMenuOptions: {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          { text: "Образец формы", callback_data: "/deliveryPrototype" },
          { text: "Как оформлять доставку", callback_data: "/deliveryGuide" },
        ],
        [{text: "Шаблон заявки", callback_data: "/deliveryTemplate"}],
        [{ text: "Назад", callback_data: "/returnToOrderMenu" }],
      ],
    }),
  },
  pickupMenuOptions: {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          { text: "Образец формы", callback_data: "/pickupPrototype" },
          { text: "Как оформлять самовывоз", callback_data: "/pickupGuide" },
        ],
        [{text: "Шаблон заявки", callback_data: "/pickupTemplate"}],
        [{ text: "Назад", callback_data: "/returnToOrderMenu" }],
      ],
    }),
  },
};
