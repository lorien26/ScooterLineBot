module.exports = {
  APIurl: "https://api.green-api.com",
  idInstance: "1103891323",
  apiTokenInstance: "386cc2accd9c4a7f8a3e5a32f2adf2d65eb04b1b1ec349dc81",
  groupForOrdersID: "120363202335236372@g.us", // 120363085166626426@g.us - заказы
  DostavistaURL: "https://robotapitest.dostavista.ru/api/business/1.4/", //Тестовый адрес
  dostavistaToken: "684E4DA9D9FAFA4DB7356407DF117255814EDA81",
  requisites: "По СПБ на сбер +79684028524",
  managerPhone: "+79684028524",
  adminList: ['i_Jusp','sergzvezdilin', 'vlr_am'],
  adminID: "1294815580",
  adminChatID: "1294815580",
  sergeyChatID: "",
  logID: "-1002043892941",
  deliveryPrototype: 
`#order
Адрес: г. Москва, улица Большая Дмитровка, 17А
Время: 10.00-12.00
Имя: Иванов Иван
Телефон: 79684028524
Модель: Kugo M4, kugo M5
Стоимость с доставкой: 87000
Стоимость без доставки: 69000
Адрес отправки: Южные ворота
Комментарий: Поставить гидроизоляцию, собрать`,
  deliveryGuide: 
`Как оформлять заявку на доставку

1. В начале заявки должен стоять тег  <b>#order</b>
2. <b>Адрес</b>: Полный адрес клиента. Чтобы исключить ошибки, лучше копировать из Google Maps
3. <b>Адрес отправки</b>:  точка, с которой нужно забирать самокаты. Принимаются два варианта: Тихорецкий бульвар и Южные ворота
4. <b>Время</b>: здесь нужно писать промежуток времени в формате HH.MM-HH.MM (H - часы, M - минуты. Например 08.30-12.30) или, если нужна максимально быстрая доставка, писать "как можно скорее"
5. <b>Имя</b>: Имя клиента (Необязательный параметр)
6. <b>Телефон</b>: Телефон клиента, указывать в формате 70000000000 (без лишних знаков, первой цифрой 7)
7. <b>Стоимость с доставкой</b>: Указывать суммарную стоимость всех товаров в заказе + стоимость доставки. Без лишних знаков, например 85000
8. <b>Стоимость без доставки</b>: Указвать суммарную стоимость всех товаров в заказе без учёта доставки. Без лишних знаков, например 69000
9. <b>Модель</b>: Список товаров, которые курьер должен забрать со склада
10. <b>Комментарий</b>: Тут можно оставить инструкции к заказу, например, 'поставить гидроизоляцию'. Это поле должно быть всегда в конце формы

<i>Дополнительно.  Каждое поле должно начинаться с новой строки (абзаца), все данные нужно писать буква в букву, как написано в инструкции, иначе могут возникнуть ошибки.</i>
`,
  pickupPrototype: 
`#order
Время: 10.00-12.00
Имя: Иванов Иван
Телефон: 79684028524
Модель: Kugo M4, kugo M5
Стоимость: 87000
Адрес отправки: Тихорецкий бульвар
Комментарий: Показать как собирать`,
  pickupGuide: `Как оформлять заявку на самовывоз

  1. В начале заявки должен стоять тег  <b>#order</b>
  2. <b>Адрес отправки</b>:  точка, с которой нужно забирать самокаты. Принимаются два варианта: Тихорецкий бульвар и Южные ворота
  3. <b>Время</b>: здесь нужно писать промежуток времени в формате HH.MM-HH.MM (H - часы, M - минуты. Например 08.30-12.30) или, если время неизвестно, можно написать "В течение дня"
  4. <b>Имя</b>: Имя клиента (Необязательный параметр)
  5. <b>Телефон</b>: Телефон клиента, указывать в формате 70000000000 (без лишних знаков, первой цифрой 7)
  6. <b>Стоимость</b>: Указывать суммарную стоимость всех товаров в заказе без лишних знаков, например 85000
  7. <b>Модель</b>: Список товаров, за которыми приедет клиент
  8. <b>Комментарий</b>: Тут можно оставить инструкции к заказу, например, 'поставить гидроизоляцию'. Это поле должно быть всегда в конце формы
  
  <i>Дополнительно.  Каждое поле должно начинаться с новой строки (абзаца), все данные нужно писать буква в букву, как написано в инструкции, иначе могут возникнуть ошибки.</i>
  `,
  startMessage:`
  Привет!
  Данный бот создан для помощи в оформлении заявок, но перед началом использования нужно прочитать инструкции по работе с ним, чтобы избежать возможных ошибок.
 
 Если в ходе использования бота возникнут какие-то вопросы, их можно написать в разделе "Техподдержка"`,
newOrderDetails: `
Особенности оформления заявок:
1. Названия полей указывать строго как в инструкции, иначе они будут считаться незаполненными.
2. Каждое новое поле очень важно писать с новой строки (Если при наборе строки телефон автоматически перекидывает вас на следующую строку, это нормально. Новой строкой считается строка, которая началась после нажатия кнопки абзаца - в правом нижнем углу на телефонах, или кнопки Enter на компьютерах)
3. Регистр в сообщении не важен (Кроме тега #order)
4. Форма доставки может быть отклонена, если поля адрес или  время  заполнены неверно. Поначалу ошибки может не возникнуть, но в итоге заявка будет отклонена. Проверяйте эти поля особенно внимательно. 
5. Сервис Dostavista использует для навигации Google maps, так что в поле адрес нужно указывать адрес именно оттуда, иначе или форма будет отклонена, или адрес может быть прочтён неверно
6. Если после нескольких попыток заявка всё ещё отклоняется, и вы не знаете в чём дело, попросите оформить ее вручную в личном сообщении без тега #order
7. Если самокат большой, или их несколько, в заявке на доствку можно написать дополнительное поле Транспорт и в нём указать тип машины, которая будет доставлять заказ (Траспорт: 2). Если не указывать, по умолчанию ставится легковой автомобиль
Типы транспорта:
1 — Легковой автомобиль / джип / пикап (до 500 кг).
2 — Каблук (до 700 кг).
3 — Микроавтобус / портер (до 1000 кг).
4 — Газель (до 1500 кг).
5 — Грузовой автомобиль.
6 — Пеший курьер.
7 — Легковой автомобиль
`,
supportMessage: 
`Здесь можно сообщить о неисправностях или ошибках в работе бота, написать предложения по улучшению его работы или дополнительному функционалу, а так же задать интересующие вас вопросы

Пожалуйста, подробно опишите свою проблему и отправьте текст в следующем сообщении

`

};
