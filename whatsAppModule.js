const {DbApi} = require('./dbAPI.js')
const db = new DbApi('./mainDB.db')

const {
  apiTokenInstance,
  idInstance,
} = require("./staticData");
async function sendMessageWhatsApp(message) {
  await db.init()
  const groupForOrdersID = await db.getData('groupForOrdersID')
  console.log("Сработала отправка сообщения в группу заказов");
  await fetch(
    `https://api.green-api.com/waInstance${idInstance}/sendMessage/${apiTokenInstance}
     `,
    {
      method: "POST",
      body: JSON.stringify({
        message: String(message),
        chatId: groupForOrdersID,
      }),
      redirect: "follow",
    }
  )
    .then((response) => response.text())
    .then((result) => {
      console.log("результат отправки сообщения в группу заказов: " + result);
    })
    .catch((error) =>
      console.log("Ошибка при отправке сообщения в группу заказов: " + error)
    );
}
module.exports = { sendMessageWhatsApp };
