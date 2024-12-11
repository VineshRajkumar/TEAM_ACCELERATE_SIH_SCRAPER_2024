import { ScrapperDB } from "sih-database-lib";

export async function sendDataToDB(name,data) {

    let db = new ScrapperDB()
    await db.init()
    await db.addOEM()
    
    const dataresult = await db.sendVulnData(name,data)
    console.log(dataresult)
   
    db.close()
    return dataresult; 
}

