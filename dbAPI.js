const  sqlite3 = require("sqlite3");

class DbApi {
    dbPath;
    db = new sqlite3.Database('', () => {});

    constructor(dbPath) {
        this.dbPath = dbPath;
    }
    
    async run(command, params = undefined) {
        const res = await new Promise((res, rej) => {
            this.db.run(command, params, (...args) => res(args));
        });
        return res;
    }
    async all(command, params = undefined) {
        const res = await new Promise((res, rej) => {
            this.db.all(command, params, (...args) => res(args));
        });
        return res;
    }
    async init() {
        console.log(await new Promise((res, rej) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) rej(err.message);
                else res("Connected successfully.");
            });
        }));
    }
    async isExists(name){
        try{
        name = name.toLowerCase() 
        console.log(name)
            const result = await this.all(`SELECT * FROM droppers WHERE name = "${name}"`, )
            // console.log(result)
            // console.log("RESULT \n\n\n", (result[1].length))
            // console.log("RESULT \n\n\n", !!(result[1].length))
            return !!result[1].length;
        }catch(err){
            console.log("Ошибка при работе с SQLite3: function isExists\n", err)
        }
    }
    async defaultValues() {
        console.log("Запуск defaultValues")
        try{
            const check = await this.all(`SELECT * FROM data WHERE name = "check"`)
            console.log(check[1].length)
            if(!check[1].length){
                const result = await this.run(`INSERT INTO data(name, value) VALUES 
                ("check", "1"),
                ("dostavistaToken", "684E4DA9D9FAFA4DB7356407DF117255814EDA81"), 
                ("requisites", "По СПБ на сбер +79684028524"),
                ("managerPhone", "+79684028524"),
                ("groupForOrdersID", "120363202335236372@g.us"),
                ("DostavistaURL", "https://robotapitest.dostavista.ru/api/business/1.4/")
                `);
                const result2 = await this.run(`INSERT INTO droppers(name, id, orderNum) VALUES
                ("i_jusp", 1, 0),
                ("vlr_am", 2, 0),
                ("sergzvezdilin", 3, 0)`);
            console.log("DefaultValues result\n", result, "\n", result2)
            }else{
                console.log("Данные уже в таблице!")
            }
        }catch(err){
            console.log("Ошибка при работе с SQLite3: function defaultValues()\n", err)
        }
      }
    async createTables() {
        console.log("Запуск создания таблиц");
        try{
               await this.db.serialize(()=>{
                this.run("BEGIN TRANSACTION");
                this.run(`CREATE TABLE IF NOT EXISTS last1(temp integer)`)
                this.run(`CREATE TABLE IF NOT EXISTS last2(temp integer)`)
                this.run(`CREATE TABLE IF NOT EXISTS last3(temp integer)`)
                this.run(`CREATE TABLE IF NOT EXISTS last4(temp integer)`)
                this.run(`CREATE TABLE IF NOT EXISTS last5(temp integer)`)
                this.run(`CREATE TABLE IF NOT EXISTS last6(temp integer)`)
                this.run(`CREATE TABLE IF NOT EXISTS lastDropper1(temp integer, g text)`)
                this.run(`CREATE TABLE IF NOT EXISTS lastDropper2(temp integer, g text)`)
                this.run(`CREATE TABLE IF NOT EXISTS lastDropper3(temp integer, g text)`)
                this.run(`CREATE TABLE IF NOT EXISTS lastDropper4(temp integer, g text)`)
                this.run(`CREATE TABLE IF NOT EXISTS lastDropper5(temp integer, g text)`)
                this.run(`CREATE TABLE IF NOT EXISTS lastDropper6(temp integer, g text)`)
                this.run(
                    `CREATE TABLE IF NOT EXISTS data (
                        name text,
                        value text
                    )`
                );
                this.run(
                    `CREATE TABLE IF NOT EXISTS droppers (
                        id integer,
                        name text,
                        orderNum integer,
                        lastAction text,
                        lastOrderType,
                        isSupport integer
                    )`
                );
                /*
                 id integer,
                        chatID text,
                        orderID integer,
                        type,
                        models,
                        clientName,
                        clientPhone,
                        clientRequiredTime,
                        shopRequiredTime,
                        clientAddress,
                        shopAddress,
                        deliveryCount,
                        productCount,
                        comment,
                        dostavistaOrderID,
                        orderStatus,
                        orderInfo,
                        courierInfo,
                        errorInfo text,
                        isSuccessful
                */
                this.run(
                    `CREATE TABLE IF NOT EXISTS listOfManagers (
                        id integer,
                        chatID text,
                        orderID integer,
                        type text,
                        shopRequiredTime text,
                        clientRequiredTime text,
                        dostavistaOrderID text,
                        orderStatus text,
                        lastSendedOrderStatus text,
                        isDelayChanged text,
                        isDelaySended text,
                        orderInfo text,
                        courierInfo text,
                        errorInfo text,
                        isSuccessful text,
                        tgGroupFirstMessageID text,
                        tgGroupSecondMessageID text,
                        tgPrivateMessageID text,
                        delay text,
                        currentTimeOfDelay text,
                        shopPointID text,
                        clientPointID text
                    )`
                );
                this.run("COMMIT")
            })
            console.log("Таблицы созданы")
        }catch(err){
            console.log("Ошибка при работе с SQLite3: function createTables()\n", err)
        }
    }
async getOrderInfo(chatID, orderID){
        // console.log("Запуск getOrderInfo")
        try{
            //  console.log( (await this.all(`SELECT * from listOfManagers WHERE chatID = "${chatID}" AND ${orderID}`))[1][0])
             return (await this.all(`SELECT * from listOfManagers WHERE chatID = "${chatID}" AND orderID = ${orderID}`))[1][0]
               
    }catch(err){console.error(err)}
}
async getOrderInfoByMessageID(tgMessageID){
    try{
         return (await this.all(`SELECT * from listOfManagers WHERE "tgGroupFirstMessageID" = ${tgMessageID}`))[1][0]
           
}catch(err){console.error(err)}

}
async getOrdersWithoutCourier(){
    try{
        return (await this.all(`SELECT * from listOfManagers WHERE courierInfo is null and type = "доставка" AND "isSuccessful" = "true"`))[1]
}catch(err){console.error(err)}
}
async getDropperUsername(chatID){
    try{
        const result = (await this.all(
             `SELECT id FROM listOfManagers WHERE chatID = "${chatID}" and orderID = 1`
         ))[1][0].id
        return (await this.all(
             `SELECT name FROM droppers WHERE id = ${result}`
         ))[1][0].name
         
         
     }catch(err){
         console.log("Ошибка при работе с SQLite3: function getDropperInfo()\n", err)
     }


}
async deleteOrder(chatID, orderID, username){
    try{
        await this.run( `DELETE FROM listOfManagers WHERE "chatID" = "${chatID}" AND "orderID" = ${orderID}`)
        await this.run(`UPDATE droppers SET orderNum = orderNum - 1 WHERE name = "${username.toLowerCase()}"`)
    }catch(err){console.log(err)}
}
async getOrdersWithDelay(){
    try{
        return (await this.all(`SELECT * from listOfManagers WHERE delay is not null AND "isSuccessful" = "true" AND isDelayChanged is null`))[1]
}catch(err){console.error(err)}
}
async getOrdersForDostavista(){
    try{
        return (await this.all(`SELECT * from listOfManagers WHERE dostavistaOrderID is not null AND isSuccessful = "true"`))[1]
}catch(err){console.error(err)}
}

async getDropperInfo(username){
    // console.log("Запуск getDropperInfo")
    try{
       const result = await this.all(
            `SELECT * FROM droppers WHERE name= "${username.toLowerCase()}"`
        )
        // console.log(result[1][0])
        return result[1][0]
    }catch(err){
        console.log("Ошибка при работе с SQLite3: function getDropperInfo()\n", err)
    }
}
async getDropperOrderList(username, date = null){
    // console.log("Запуск getDropperOrderList")
    try{
       if(!date){
        const id =( await this.all(
            `SELECT * FROM droppers WHERE name = "${username.toLowerCase()}"`
        ))[1][0].id
        const returnedData = (await this.all(`SELECT * FROM listOfManagers WHERE id = "${id}"`))[1]
        // console.log("Returned data: ", returnedData)
        return returnedData
       }else{
        const dropperTableName = `lastDropper${date}`
        const tableName = `last${date}`
        console.log(dropperTableName, tableName)
        try{    
        const id =( await this.all(
            `SELECT * FROM ${dropperTableName} WHERE name = "${username.toLowerCase()}"`
        ))[1][0].id
        console.log(id)
        const returnedData = (await this.all(`SELECT * FROM ${tableName} WHERE id = "${id}"`))[1]
        // console.log("Returned data: ", returnedData)
        return returnedData}catch(err){
            console.log("Ожидаемая ошибка ", err)
            return [];
        }
       }
    }catch(err){
        console.log("Ошибка при работе с SQLite3: function getDropperOrderList()\n", err)
    }
}
async changeDropper(username, value, valueName){
    try{
        // console.log("Запуск changeDropper\n")
        const result = await this.run(
            `UPDATE droppers SET "${valueName}" = "${value}" WHERE name = "${username.toLowerCase()}"`
        );
        // console.log("результат changeDropper:\n", result)

    }catch(err){console.error(err)} 
}
async changeOrder(chatID, orderID, value, valueName){
    try{
        const result = await this.run(
            `UPDATE listOfManagers SET "${valueName}" = "${value}" WHERE chatID = "${chatID}" AND orderID = ${orderID}`
        );
        // console.log("результат changeOrder:\n", result)

    }catch(err){console.error(err)}
}
async getData(name){
        // console.log("Запуск getData")
        try{
           const result = await this.all(
                "SELECT * FROM data WHERE name=?",
                [name]
            )
            // console.log(result[1][0].value)
            return result[1][0].value
        }catch(err){
            console.log("Ошибка при работе с SQLite3: function getData()\n", err)
        }
    }
async addOrder(chatID, username){
        // console.log("Запуск addOrder")
        try{
            // console.log((await this.all(`SELECT * FROM droppers WHERE name = "${username.toLowerCase()}"`))[1][0].orderNum)
            const orderID = (await this.all(`SELECT * FROM droppers WHERE name = "${username.toLowerCase()}"`))[1][0].orderNum
            const id = (await this.all(`SELECT * FROM droppers WHERE name = "${username.toLowerCase()}"`))[1][0].id
            await this.run(
                `INSERT INTO listOfManagers(id, chatID, orderID) VALUES(${id}, "${chatID}", ${orderID + 1})`
            );
            await this.run(`UPDATE droppers SET orderNum = orderNum + 1 WHERE name = "${username.toLowerCase()}"`)
        }catch(err){console.log(err)}

    }
async getGlobalCount(){
    try{
        return (await this.all(`SELECT count (*) FROM listOfManagers`))[1][0]['count (*)']
}catch(err){console.error(err)}
}
async addDropper(name) {
        // console.log("Запуск addDropper");
        name = name.toLowerCase();
        try{
            const id = +((await this.all(`SELECT COUNT(*) FROM droppers`))[1][0]["COUNT(*)"])
            const result = await this.run(
                `INSERT INTO droppers(id, name, orderNum) VALUES(${id ? (id + 1) : 1}, "${name}", 0)`
            );
            // console.log("AddDropper\n", result);
        }catch(err){
            console.log("Ошибка при работе с SQLite3: function addDropper()\n", err)
        }
    }
async addDropperInfo(chatID, name, info) {
        // console.log("Запуск addDropperInfo");
        try{
            const result = await this.run(
                `UPDATE droppers SET JSONinfo = ?, id = ? WHERE name = ?`,
                [info, chatID, name]
            );
            // console.log("AddDropperInfo\n", result);
        }catch(err){
            console.log("Ошибка при работе с SQLite3: function addDropperInfo()\n", err)
        }
    }
async changeDropperInfo(name, json){
        // console.log("Запуск changeDropperInfo")
        try{
            const result = await this.run(`UPDATE droppers SET JSONinfo = ? WHERE name = ?`,
                [json, name]
            )
            // console.log("ChangeDropper result \n", result)
        }catch(err){
            console.log("Ошибка при работе с SQLite3: function changeDropperInfo()\n", err)
        }
    }
async changeDataInfo(name, value){
        // console.log("Запуск changeDataInfo")
        // console.log(name, "\n", value)
        try{
            const result = await this.run(`UPDATE data SET value=? WHERE name=?`,
                [value, name]
            )
            // console.log("Change result \n", result)
            // console.log("\n\n\n\nDATA CHANGED !!!! \n\n\n\n\n")
        }catch(err){
            console.log("Ошибка при работе с SQLite3: function changeDataInfo")
        }
    }
async listOfDroppers(forFunc = false){
        // console.log("Запуск listOfDroppers")
        try{
           if(forFunc){
            const result = await this.all(
                "SELECT name FROM droppers"
            )
            // console.log(result)
            let list = []
            result[1].forEach(a =>{
                list.push(a.name)
            })
            
            return list
           }
           else{
            const result = await this.all(
                "SELECT name FROM droppers"
            )
            // console.log(result)
            let list = []
            result[1].forEach(a =>{
                list.push("@" + a.name)
            })
            list = list.join('\n')
            return list
           }
        }catch(err){
            console.log("Ошибка при работе с SQLite3: function listOfDroppers", err)
        }
    }
async deleteDropper(name) {
        // console.log("Запуск deleteDropper");
        try{
            const result = await this.run(
                `DELETE FROM droppers WHERE name=?`,
                [name]
            );
            // console.log("DeleteDropper\n", result);
        }catch(err){
            console.log("Ошибка при работе с SQLite3: function deleteDropper()\n", err)
        }
    }
async shiftTables(){
    try{
    await this.run(`DROP TABLE IF EXISTS last6`)
    await this.run(`CREATE TABLE last6 AS SELECT * FROM last5`)
    await this.run(`DROP TABLE IF EXISTS last5`)
    await this.run(`CREATE TABLE last5 AS SELECT * FROM last4`)
    await this.run(`DROP TABLE IF EXISTS last4`)
    await this.run(`CREATE TABLE last4 AS SELECT * FROM last3`)
    await this.run(`DROP TABLE IF EXISTS last3`)
    await this.run(`CREATE TABLE last3 AS SELECT * FROM last2`)
    await this.run(`DROP TABLE IF EXISTS last2`)
    await this.run(`CREATE TABLE last2 AS SELECT * FROM last1`)
    await this.run(`DROP TABLE IF EXISTS last1`)
    await this.run(`CREATE TABLE last1 AS SELECT * FROM listOfManagers`)
    await this.run(`DELETE FROM listOfManagers`);
    await this.run(`DROP TABLE IF EXISTS lastDropper6`)
    await this.run(`CREATE TABLE lastDropper6 AS SELECT * FROM lastDropper5`)
    await this.run(`DROP TABLE IF EXISTS lastDropper5`)
    await this.run(`CREATE TABLE lastDropper5 AS SELECT * FROM lastDropper4`)
    await this.run(`DROP TABLE IF EXISTS lastDropper4`)
    await this.run(`CREATE TABLE lastDropper4 AS SELECT * FROM lastDropper3`)
    await this.run(`DROP TABLE IF EXISTS lastDropper3`)
    await this.run(`CREATE TABLE lastDropper3 AS SELECT * FROM lastDropper2`)
    await this.run(`DROP TABLE IF EXISTS lastDropper2`)
    await this.run(`CREATE TABLE lastDropper2 AS SELECT * FROM lastDropper1`)
    await this.run(`DROP TABLE IF EXISTS lastDropper1`)
    await this.run(`CREATE TABLE lastDropper1 AS SELECT * FROM droppers`)
    await this.run(`UPDATE droppers SET "orderNum" = 0`)
    }catch(err){ console.log(err)}
}
}

// const dbApi = new DbApi('./tempDB.db');

// (async() => {
//        await dbApi.init();
//        await dbApi.createTables()
//     //    console.log(await dbApi.getGlobalCount())
//         // console.log(await dbApi.listOfDroppers(true))
//     // console.log(await dbApi.getDropperUsername(1))
//     //    await dbApi.addDropper("aadi");
//     //    await dbApi.addOrder(1, "aadi");
//     //    console.log(await dbApi.getOrdersWithoutCourier())
//     //  console.log(await dbApi.getOrderInfo('1', 14))

   
//     // await dbApi.getData("dostavistaToken")
//     //     await dbApi.isExists("i_Jussp")

//     // await dbApi.readDropper("i_Jusp");
//     // await dbApi.readDropper("i_Jusp");
//     // await dbApi.countDropper("i_Jusp")
//     // await dbApi.readDropper("i_Jusp");
//     //     await dbApi.deleteDropper("i_Jusp");
//     // await dbApi.listOfDroppers();
// })();
module.exports = {DbApi};