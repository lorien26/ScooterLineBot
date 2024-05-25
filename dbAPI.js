const { Database } = require("sqlite3");
const DB_PATH = './mainDB.db';

class DbApi {
    dbPath;
    db = new Database('', () => {});

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
            this.db = new Database(this.dbPath, (err) => {
                if (err) rej(err.message);
                else res("Connected successfully.");
            });
        }));
        await this.createTables();
        await this.defaultValues();
    }
    async isExists(name){
        try{
        name = name.toLowerCase() 
        console.log(name)
            const result = await this.all(`SELECT * FROM droppers WHERE name = "${name}"`, )
            console.log(result)
            console.log("RESULT \n\n\n", (result[1].length))
            console.log("RESULT \n\n\n", !!(result[1].length))
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
                const result2 = await this.run(`INSERT INTO droppers(name) VALUES
                ("i_jusp"),
                ("vlr_am"),
                ("sergzvezdilin")`);
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
            await this.run(
                `CREATE TABLE IF NOT EXISTS droppers (
                    id text,
                    name text,
                    JSONinfo text,
                    counter integer
                )`
            );
            console.log("Успешное создание первой таблицы");
            await this.run(
                `CREATE TABLE IF NOT EXISTS data (
                    name text,
                    value text
                )`
            );
            console.log("Успешное создание второй таблицы");
        }catch(err){
            console.log("Ошибка при работе с SQLite3: function createTables()\n", err)
        }
    }
    async getData(name){
        console.log("Запуск getData")
        try{
           const result = await this.all(
                "SELECT * FROM data WHERE name=?",
                [name]
            )
            console.log(result[1][0].value)
            return result[1][0].value
        }catch(err){
            console.log("Ошибка при работе с SQLite3: function getData()\n", err)
        }
    }
    async addDropper(name) {
        console.log("Запуск addDropper");
        name = name.toLowerCase();
        try{
            const result = await this.run(
                "INSERT INTO droppers(id, name, JSONinfo, counter) VALUES(?, ?, ?, ?)",
                [null, name, null, 0]
            );
            console.log("AddDropper\n", result);
        }catch(err){
            console.log("Ошибка при работе с SQLite3: function addDropper()\n", err)
        }
    }
    async addDropperInfo(chatID, name, info) {
        console.log("Запуск addDropperInfo");
        try{
            const result = await this.run(
                `UPDATE droppers SET JSONinfo = ?, id = ? WHERE name = ?`,
                [info, chatID, name]
            );
            console.log("AddDropperInfo\n", result);
        }catch(err){
            console.log("Ошибка при работе с SQLite3: function addDropperInfo()\n", err)
        }
    }
    async changeDropperInfo(name, json){
        console.log("Запуск changeDropperInfo")
        try{
            const result = await this.run(`UPDATE droppers SET JSONinfo = ? WHERE name = ?`,
                [json, name]
            )
            console.log("ChangeDropper result \n", result)
        }catch(err){
            console.log("Ошибка при работе с SQLite3: function changeDropperInfo()\n", err)
        }
    }
    async changeDataInfo(name, value){
        console.log("Запуск changeDataInfo")
        console.log(name, "\n", value)
        try{
            const result = await this.run(`UPDATE data SET value=? WHERE name=?`,
                [value, name]
            )
            console.log("Change result \n", result)
            console.log("\n\n\n\nDATA CHANGED !!!! \n\n\n\n\n")
        }catch(err){
            console.log("Ошибка при работе с SQLite3: function changeDataInfo")
        }
    }
    async listOfDroppers(){
        console.log("Запуск listOfDroppers")
        try{
            const result = await this.all(
                "SELECT name FROM droppers"
            )
            console.log(result)
            let list = []
            result[1].forEach(a =>{
                list.push("@" + a.name)
            })
            list = list.join('\n')
            return list
        }catch(err){
            console.log("Ошибка при работе с SQLite3: function listOfDroppers", err)
        }
    }
    async countDropper(name){
        console.log("Запуск countDropper")
        try{
            const result = await this.run(`UPDATE droppers SET counter = counter + 1 WHERE name = ?`, [name])
            console.log("countDropper result\n", result)
        }catch(err){
            console.log("Ошибка при работе с SQLite3: function countDropper()\n", err)
        }
    }
    async deleteDropper(name) {
        console.log("Запуск deleteDropper");
        try{
            const result = await this.run(
                `DELETE FROM droppers WHERE name=?`,
                [name]
            );
            console.log("DeleteDropper\n", result);
        }catch(err){
            console.log("Ошибка при работе с SQLite3: function deleteDropper()\n", err)
        }
    }

    async readDropper(name) {
        console.log("Запуск readDropper");
        try{
            const result = await this.all(
                "SELECT * FROM droppers WHERE name=?",
                [name]
            )
            console.log("ReadDropper\n", result);
        }catch(err){
            console.log("Ошибка при работе с SQLite3: Function readDropper()\n", err)
        }
    }
}

// const dbApi = new DbApi(DB_PATH);

// (async() => {
//     await dbApi.init();
//     // await dbApi.getData("dostavistaToken")
//     //     await dbApi.isExists("i_Jussp")
//     await dbApi.addDropper("i_Jusp1");
//     await dbApi.addDropper("i_Jusp2");
//     await dbApi.addDropper("i_Jusp3");
//     await dbApi.addDropper("i_Jusp4");
//     await dbApi.addDropper("i_Jusp5");
//     // await dbApi.readDropper("i_Jusp");
//     // await dbApi.addDropperInfo("aadiuh12412", "i_Jusp", "JSON OBJECT");
//     // await dbApi.readDropper("i_Jusp");
//     // await dbApi.countDropper("i_Jusp")
//     // await dbApi.readDropper("i_Jusp");
//     //     await dbApi.deleteDropper("i_Jusp");
//     await dbApi.listOfDroppers();
// })();
module.exports = {DbApi};