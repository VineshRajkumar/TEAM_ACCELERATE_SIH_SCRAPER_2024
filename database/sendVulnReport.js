import { ScrapperDB } from "sih-database-lib";
import { sendMail } from "sih-database-lib";
import { generateEmailTemplate } from "./EmailTemplate.js";

export async function sendVulnReport(emailid,heading,report) {

    let db = new ScrapperDB()
    await db.init()
    await db.addOEM()
    const emailHtml = generateEmailTemplate(report);
    const mailsent  = sendMail(emailid, heading , emailHtml)
    if(mailsent){
        console.log(`\x1b[32mMail has been successfully sent to email id - ${emailid}`)
    }
    else{
        console.log("\x1b[31mMail is not sent to email id")
        return;
    }
    db.close()
    return mailsent; 
}
