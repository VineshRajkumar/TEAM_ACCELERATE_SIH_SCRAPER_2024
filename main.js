import { ScrapperDB } from "sih-database-lib";
import { sendMail } from "sih-database-lib";
let a = `Here is the extracted and formatted vulnerability report:

||Product Name: Intel TDX Module Software # Product Version: 1.5.06 # OEM Name: Intel # Severity Level (Critical/High): 2.5 # Vulnerability: Improper check for unusual or exceptional conditions in Intel TDX Module firmware before version 1.5.06 may allow a privileged user to potentially enable information disclosure via local access. # Mitigation Strategy: Intel recommends that users of the Intel TDX module update to the latest version provided by the system manufacturer that addresses this issue. # Published Date: 08 October 2024 # Unique ID: CVE-2024-27457, Intel-SA-01099 ||`

let b = `Here is the extracted vulnerability report in the exact format you requested:

||Product Name: NVIDIA GPU Display Driver # Product Version: - NA # OEM Name: NVIDIA # Severity Level (Critical/High): 8.2 # Vulnerability: CVE-2024-0136 NVIDIA GPU Display Driver for Windows and Linux contains a vulnerability which could allow a privileged attacker to escalate permissions. # Mitigation Strategy: N/A (update to the latest version) # Published Date: 22 October 2024 # Unique ID: CVE-2024-0126 ||

Note that there are multiple vulnerabilities reported in the same bulletin, and the output may vary depending on which specific vulnerability you would like to extract. If you would like to extract multiple vulnerabilities, please let me know and I can assist you in generating the reports.`



async function main() {
	// let db = new Database({
	// 	user: "postgres",
	// 	port: 5432,
	// 	host: "localhost",
	// 	password: "a"
	// })
	let db = new ScrapperDB()
	await db.init()

	await db.addOEM()


	// console.log(await db.getLinks())
	// console.log(await db.getEmails("Microsoft"))
	// console.log(await db.getEmails("Google"))
	// console.log(await db.sendVulnData(a))
	console.log(await db.sendVulnData(b))

	// sendMail("facttasticy@gmail.com", "hello" , "<h1>BYE</h1>" )
	db.close()

//	console.log(await db.getOEMs())
//	console.log(await db.addUser("asdasd@asd.asds"))
//	console.log(await db.setUserOEMPref("asdasd@asd.asds", "Google"))
}

main()