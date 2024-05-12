const {
  groupForOrdersID,
  apiTokenInstance,
  idInstance,
} = require("./staticData");
async function sendMessageWhatsApp(message) {
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
