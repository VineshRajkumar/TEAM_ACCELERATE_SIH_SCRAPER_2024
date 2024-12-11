import { ScrapperDB } from "sih-database-lib";

export async function getOEMLinks() {

    let db = new ScrapperDB()
    await db.init()
    await db.addOEM()
    const links = await db.getLinks()
   
    db.close()
    return links; 
}
