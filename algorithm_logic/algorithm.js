import puppeteer from "puppeteer";
import fs, { link } from "fs";
import path from "path";
import { error } from "console";
import axios from "axios";
import dotenv from "dotenv";
import { sendMail } from "sih-database-lib";
import { getOEMLinks } from "../database/getOEMLinks.js";
import { sendDataToDB } from "../database/sendDataToDB.js";
import { sendVulnReport } from "../database/sendVulnReport.js";
dotenv.config();

async function algorithm(name, url, type) {
  if (type == "CVE") {
    try {
      const browser = await puppeteer.launch({ headless: true }); // Launch browser
      const page = await browser.newPage(); // Open a new page

      //code for popups,alerts, dialog should be always on top
      // Listen for dialogs (alerts, confirms, prompts)
      page.on("dialog", async (dialog) => {
        console.log(`Dialog message: ${dialog.message()}`);
        await dialog.accept(); // Use dialog.accept() if you want to accept the dialog
      });

      if (!url) {
        console.log("No url given", error);
        await browser.close();
        return;
      }

      // Navigate to the target website
      await page.goto(`${url}`, {
        waitUntil: "networkidle2", // Wait until there are no more than 2 network connections for at least 500 ms
        timeout: 600000, // 60 seconds timeout (increase as needed)
      });

      await page.waitForSelector("div", { timeout: 100000 });
      await page.waitForSelector("a", { timeout: 100000 });
      await new Promise((resolve) => setTimeout(resolve, 15000));

      // Extract text content from the page
      const pageTextContent = await page.evaluate(() => {
        return document.body.innerText; // Get all text content
      });

      //FOR COMPARISION OF DATA - IF NO NEW LATEST LINK DONOT SCRAPE , IF LATEST LINK THEN SCRAPE

      const domain = new URL(`${url}`).hostname; // Extracts the hostname
      const folderName = domain.replace(/^www\./, ""); // Removes 'www.' if present

      console.log(process.cwd());
      const scrapedDataExists = fs.existsSync(
        path.join(process.cwd(), "scraped_data")
      );

      const parentDir = scrapedDataExists
        ? process.cwd()
        : path.join(process.cwd(), "..");

      const dirPath = path.join(parentDir, "scraped_data"); //will make the path where folder will be created and files will be saved
      const folderPath = path.join(dirPath, folderName);
      const filePath = path.join(folderPath, "initial_scraping.txt");

      // Create directory if it does not exist
      //CHECKING BASED ON MATCHING because IF FOLDER IS ALREDY PRESENT AND WITHOUT .COM Name
      function matchLetters(oemName, folderName, threshold = 0.55) {
        const minLength = Math.min(oemName.length, folderName.length);
        let matchCount = 0;

        // Count matching letters from the start
        for (let i = 0; i < minLength; i++) {
          if (oemName[i] === folderName[i]) {
            matchCount++;
          } else {
            break;
          }
        }

        // Calculate the similarity ratio
        const similarity = matchCount / oemName.length;

        console.log(
          "Similarity of OEM Name Matching with exixsting folders:- ",
          similarity
        );

        return similarity >= threshold;
      }

      const folders = fs
        .readdirSync(dirPath, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

      let oemFolder = folders.find((folder) =>
        matchLetters(folderName, folder)
      );
      console.log("oemFolder", oemFolder);

      if (!oemFolder) {
        // Create the folder if no match is found
        fs.mkdirSync(folderPath, { recursive: true });
        oemFolder = folderName; // Use the current `folderName` for the new folder
        console.log(`Folder created: ${folderName}`);
      } else {
        console.log(`Existing folder found: ${oemFolder}`);
      }

      console.log(path.join(dirPath, oemFolder, "initial_scraping.txt"));
      const newfilePath = path.join(dirPath, oemFolder);
      const newfileiniPath = path.join(newfilePath, "initial_scraping.txt");
      // if(newfileiniPath){
      //   fs.writeFileSync(newfileiniPath, ".", 'utf8')
      // }

      // Read existing data from the file, if it exists
      let existingData = "";
      const checkfile = newfileiniPath ? newfileiniPath : null;
      const fileToRead = fs.existsSync(filePath) ? filePath : checkfile;
      // console.log(fileToRead)
      if (fs.existsSync(fileToRead)) {
        existingData = fs.readFileSync(fileToRead, "utf8");
      }

      // console.log("Existing Data: ", existingData.trim());
      // console.log("Page Text Content: ", pageTextContent.trim());

      // Compare existing data with new data
      if (existingData.trim() !== pageTextContent.trim()) {
        // Write new data to the file if different
        fs.writeFileSync(fileToRead, pageTextContent, "utf8"); // Writes in the file
        console.log("New data saved to initial_scraping.txt");
      } else {
        console.log("No changes detected. Data not saved.");
        await browser.close();
        return;
      }

      // Check if the URL is from NVD before getting the last identifier
      const isNvd = page.url().includes("nvd.nist.gov"); // Check if the current page URL contains "nvd.nist.gov"
      const isCisa = page.url().includes("www.cisa.gov");
      const isCveDetails = page.url().includes("www.cvedetails.com");
      const isExploitDB = page.url().includes("www.exploit-db.com"); //here isExploitDB is writtten on purpose so that it can fail by identifier search and then it will do by table  because by identifier it is clicking the download link
      const isHuntr = page.url().includes("huntr.com");

      // Use a regex pattern to match identifiers in the format YYYY-NNNN, YYYY-NNN, or YYYY-NN
      //HAD TO WRITE APSB FOR ADOBE AS THE NUMBER DOESNOT COME SEPERATED - SMALL REGEX PROBLEM FOR ADOBE FIXED
      let identifierPattern; // Match YYYY-NN or YYYY-NNN or YYYY-NNNN format
      if (isNvd || isCisa || isCveDetails) {
        identifierPattern = /\b(?:APSB)?(\d{4})[-:](\d{3,6})\b/g;
      } else {
        identifierPattern = /\b(?:APSB)?(?:\d{4}|\d{2})[-:]\d{2,6}\b/g;
      }

      const identifierMatches = pageTextContent.match(identifierPattern) || []; // Extract identifiers

      // Count occurrences of each identifier
      const identifierCount = {};
      identifierMatches.forEach((identifier) => {
        identifierCount[identifier] = (identifierCount[identifier] || 0) + 1; // Increment count for each identifier
      });

      // Write the identifier counts to a file in JSON format
      const fileToReads = fs.existsSync(folderPath) ? folderPath : newfilePath;
      const identifierCountFile = path.join(
        fileToReads,
        "identifiers_count.txt"
      );
      fs.writeFileSync(
        identifierCountFile,
        JSON.stringify(identifierCount, null, 2),
        "utf8"
      ); // Convert to JSON string

      console.log(
        "Identifier counts have been written to identifiers_count.txt"
      );

      let firstIdentifier;
      if (isNvd && identifierMatches.length > 0) {
        console.log(identifierMatches.length - 1);
        firstIdentifier = identifierMatches[identifierMatches.length - 1]; // Get the last link if the URL is from NVD
      } else {
        firstIdentifier = identifierMatches[0]; //or else get the first link
      }

      console.log(`First Identifier: ${firstIdentifier}`);

      if (!firstIdentifier) {
        console.log("No identifiers found!");
      }
      //AFTER GETTING THE FIRST Identifier FIND THE LINK CLICK ON IT THEN SCRAPE

      const latestCveLink = await page.evaluate(
        (identifier, exploitdb, huntr) => {
          const links = Array.from(document.querySelectorAll("a")); // Select all links in the document
          // Find the first link associated with the identifier

          const cvelink = links.find((link) =>
            link.innerText.includes(identifier)
          )?.href;

          if (!cvelink || (cvelink && huntr)) {
            //adding condition for huntr so that it will find by table and not by identifier
            console.log("Finding Link With Table");
            let linkElement;

            if (exploitdb) {
              linkElement = document.querySelector(
                "tbody tr td a[href*='/exploits/']"
              );
            } else if (huntr) {
              linkElement = document.querySelector(
                "tbody tr td a[href*='/bounties/']"
              );
            } else {
              linkElement = document.querySelector("tbody tr td a");
            }

            if (linkElement) {
              linkElement.removeAttribute("target");
              return linkElement.href;
            }
          }
          return cvelink || null;
        },
        firstIdentifier,
        isExploitDB,
        isHuntr
      );

      if (latestCveLink) {
        console.log("FOUND THE LINK ", latestCveLink);

        await page.goto(latestCveLink, { timeout: 600000, waitUntil: "load" });

        console.log("Navigated to the CVE details page!");

        await page.waitForSelector("body", { timeout: 100000 });
        await page.waitForSelector("div", { timeout: 100000 });
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Extract the page content
        const pageDetailTextContent = await page.evaluate(() => {
          // console.log(document.body.innerText);
          return document.body.innerText; // Get all text content
        });

        // Save the scraped content to data.txt
        const linkPath = path.join(fileToReads, "link-scraping.txt");
        fs.writeFileSync(linkPath, pageDetailTextContent, "utf8"); // Write to file
        console.log(
          "Scraped content from the CVE details page and saved to link-scraping.txt"
        );

        const report = async (input) => {
          try {
            console.log(
              `${process.env.URL}:${process.env.PORT2}/api/cve-summary-ai`
            );
            const response = await axios.post(
              `${process.env.URL}:${process.env.PORT2}/api/cve-summary-ai`,
              {
                data: input,
              }
            );

            console.log("Response from server:", response.data);
            return response.data;
          } catch (error) {
            console.error("\x1b[31mError sending input:", error);
          }
        };

        const reportResponse = await report(pageDetailTextContent);
        // console.log(reportResponse);
        if (!reportResponse) {
          console.error(
            "AI report generation failed. Please check the input data and try again.",
            error
          );
        }

        const aisummariesFolder = path.join(fileToReads, "ai-summaries");
        if (!fs.existsSync(aisummariesFolder)) {
          fs.mkdirSync(aisummariesFolder, { recursive: true });
        }

        const dbdataresult = await sendDataToDB(name, reportResponse);
        if(!dbdataresult){
          console.log("\x1b[31mData was not sent to the database."); // ANSI code for RED color is used
          return;
        }

        const cvesummaryFile = path.join(aisummariesFolder, "cve-summary.txt");
        fs.writeFileSync(cvesummaryFile, reportResponse, "utf8");

        console.log("\x1b[32mMeta Llama AI did its job !!");//ANSI CODE IS USED FOR COLOR  GREEN
        console.log("\x1b[32mCve Summary Details written successfully!!");//ANSI CODE IS USED FOR COLOR  GREEN

        sendVulnReport("vineshrajkumar23@gmail.com",`${folderName} Vulnerability Report`, dbdataresult)


      } else {
        console.log("\x1b[33mNo link found for the first identifier!");//ANSI CODE IS USED FOR COLOR YELLOW
      }

      await browser.close(); // Close the browser
    } catch (error) {
      if(error.message.includes('net::ERR_HTTP2_PROTOCOL_ERROR')){
        console.error(`\x1b[31mError with URL: ${url} - Issue is related to headless mode`); //ANSI CODE IS USED FOR COLOR RED \x1b[31m
      }
      else{
        console.log("ERROR", error);
      }
    }
  }
}

const oemlinks = await getOEMLinks();

const urls = [
  
  //OEMS
  // { name: "Dell", url: "https://www.dell.com/support/security/en-in", type: "CVE" },
  // { name: "Intel", url: "https://www.intel.com/content/www/us/en/security-center/default.html",type: "CVE"},
  // // {  name: "AMD", url: "https://www.amd.com/en/resources/product-security.html", type: "CVE" },  //AMD DOESNOT RUN IN HEADLESS TRUE IT RUNS ONLY IN HEAD LESS FALSE
  // { name:"NVIDIA" ,url: "https://www.nvidia.com/en-us/security/", type: "CVE" },
  // { name:"Microsoft",url: 'https://msrc.microsoft.com/update-guide/vulnerability', type: "CVE" },
    
];

urls.forEach(({ name, url, type }) => algorithm(name, url, type));

//**FOR GETTING LINKS FROM DATABASE UNDO THE COMMENT IN THIS 
// for (const {name,url,type} of oemlinks){

//     if(type === "CVE"||type === "BOTH"){
//       await algorithm(name,url, type);
//     }
//     else{
//       break;
//     }
  
// }
