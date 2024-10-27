//do npm install axios xml2js
// xml2js is for  Converting the XML feed to a JavaScript object
// axios for making requests to apis
import puppeteer from "puppeteer";
import axios from "axios";
import xml2js from "xml2js";
import fs, { mkdir } from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// Function to fetch and parse RSS feed for NEWS ONLY HERE
async function fetchRSSFeed(url, type) {
  try {
    const response = await axios.get(url);
    const xmlData = response.data;

    // Parse the XML into a JS object
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xmlData);

    const domain = new URL(`${url}`).hostname; // Extracts the hostname
    
    let folderName; 
    if (domain.includes('reddit.com')) {
      // Extract the subreddit and category from the URL path
        const pathSegments = new URL(url).pathname.split('/'); // Split the pathname
        const subreddit = pathSegments[2]; // Gets the subreddit name
        const category = pathSegments[3]; // Gets the category (new, top, rising)

        // Construct the folder name only if the category is present
        folderName = category ? `${domain}/${subreddit}/${category}` : `${domain}/${subreddit}`;
    }
    else{
      folderName = domain.replace(/^www\./, "");
    }



    const scrapedReaderDataExists = fs.existsSync(
      path.join(process.cwd(), "scraped_reader_data")
    );
    const parentDir = scrapedReaderDataExists
      ? process.cwd()
      : path.join(process.cwd(), "..");
    const dirPath = path.join(parentDir, "scraped_reader_data"); //will make the path where folder will be created and files will be saved
    const folderPath = path.join(dirPath, folderName);
    fs.mkdirSync(folderPath, { recursive: true });
    const filePath = path.join(folderPath, "initial_link.txt");

    let link;
    let imageLink;
    // console.log(result.feed.entry[1])
    //RSS FEED FORMAT FOR fulldisclosure
    if (result.rss) {
      // console.log("Title:",result.rss.channel.item[0].title);
      // console.log("Description:",result.rss.channel.item[0].description);
      console.log("Link:", result.rss.channel.item[0].link);
      // console.log("Date:",result.rss.channel.item[0].pubDate);
      imageLink =
        result.rss.channel.item[0]["media:thumbnail"]?.$.url ||
        result.rss.channel.item[0].enclosure?.$.url ||
        null;
      console.log("Image Link:", imageLink);
      // console.log("Thumbnail Link:",result.rss.channel.item[0]['media:thumbnail'].$.url);
      console.log("----------------------");
      link = result.rss.channel.item[0].link;
    }
    //RDF FEED FORMAT FOR DEBIAN
    else if (result["rdf:RDF"]) {
      // Access the RDF structure (rdf:RDF)
      const rdfData = result["rdf:RDF"];

      console.log("Link:", rdfData.item[0].link);
      console.log("----------------------");
      link = rdfData.item[0].link;
    }
    //ATOM FEED FORMAT FOR REDDIT
    else if (result.feed) {
      let content = result.feed.entry[0].content._ || "No content available";
      // const pathforcyber = new URL(`${url}`).pathname; 
      // if(domain.includes('reddit.com') && pathforcyber.includes('/r/cybersecurity')){
      //   content = result.feed.entry[0].content._ || "No content available";
      //   // console.log(content)
      // }
      // else{
      //   content = result.feed.entry[1].content._ || "No content available";
      //   // console.log(content)
      // }
      // console.log(content);
      let regex =
        /<a\s+[^>]*href="(https?:\/\/(?!www\.reddit\.com\/user\/)(?!www\.reddit\.com\/r\/[^/]+\/comments\/)[^"]+)"[^>]*>([^<]+)<\/a>/g; //regex to remove profile and comment links

      // Use matchAll to extract all valid links
      let matches = [...content.matchAll(regex)]; //matchall will match the regex and also extract the valid link as we said in regex that remove comments and profile link

      // Loop through each match
      let href;
      matches.forEach((match) => {
        // console.log(match)
        href = match[1]; // The URL inside the href attribute
        console.log(`Link: ${href}`);
        console.log("----------------------");
      });

      //ACESS THE DECRIPTION AUTHOR AND ALL ALSO

      // console.log("Title:",result.feed.entry[1].title);
      // Description by AI
      // console.log("Link:",result.feed.entry[1]);
      // console.log("Date:",result.rss.channel.item[0].pubDate);
      link = href;

      // console.log("Link:",result.feed.entry[1].link.$.href);
      // console.log("Link:",result.feed.entry[1].link.$.href); //entry[1] because 0 one is always some kind of community thing in every subreddit
      // console.log("----------------------");

      // link = result.feed.entry[0].link.href;
    } else {
      console.log("Unknown feed format");
    }

    if (link) {
      //ONLY SCRAPING NEW LINK
      let existingData = "";
      if (fs.existsSync(filePath)) {
        existingData = fs.readFileSync(filePath, "utf8");
      }

      if (existingData.trim() !== link.trim()) {
        fs.writeFileSync(filePath, link, "utf8");
        console.log("New Link saved to initial_link.txt");
      } else {
        console.log("No changes detected. Data not saved.");
        return;
      }

      try {
        const browser = await puppeteer.launch({ headless: true }); // Launch browser
        const page = await browser.newPage(); // Open a new page

        // Navigate to link
        await page.goto(`${link}`, {
          timeout: 600000, // 60 seconds
          waitUntil: "load", // Wait for the network to be idle
        });
        console.log("Navigated to the latest CVE details page!");

        // Extract the page content
        const pageTextContent = await page.evaluate(
          () => document.body.innerText
        );
        // console.log(document.body.innerText)

        const LinkScrapePath = path.join(folderPath, "link-scraping.txt");
        // Replace all line breaks with a space to make it a single paragraphconst singleParagraphContent = pageTextContent.replace(/(\r\n|\n|\r)/gm, " ");
        fs.writeFileSync(LinkScrapePath, pageTextContent, "utf8"); //writes in the file

        console.log(
          "Scraped content from the NEWS page and saved to link-scraping.txt"
        );

        // CATEGORIZING AND PASSING THROUGH AI
        if (type == "CVE") {
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
              console.error("Error sending input:", error);
            }
          };

          const reportResponse = await report(pageTextContent);
          // console.log(reportResponse);
          if (!reportResponse) {
            console.error(
              "AI report generation failed. Please check the input data and try again.",
              error
            );
          }

          const aisummariesFolder = path.join(folderPath, "ai-summaries");
          if (!fs.existsSync(aisummariesFolder)) {
            fs.mkdirSync(aisummariesFolder, { recursive: true });
          }
          const cvesummaryFile = path.join(
            aisummariesFolder,
            "cve-summary.txt"
          );
          fs.writeFileSync(cvesummaryFile, reportResponse, "utf8");

          console.log("Meta Llama AI did its job !!");
          console.log("Cve Summary Details written successfully!!");

          function extractOEMName(text) {
            const match = text.match(/OEM Name:\s*([\w\s]+)/);
            if (!match) return null;

            return match
              ? match[1].trim().toLowerCase().replace(/\s+/g, "")
              : null; // Convert to lowercase and remove spaces
          }

          // Similarity function: counts consecutive matching letters
          function matchLetters(oemName, folderName, threshold = 0.6) {
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

          // Extract the OEM name in lowercase and without spaces
          const oemName = extractOEMName(reportResponse);
          console.log("Found Oem Name ", oemName);

          if (oemName) {
            const scrapedDataExists = fs.existsSync(
              path.join(process.cwd(), "scraped_data")
            );
            const parentDir = scrapedDataExists
              ? process.cwd()
              : path.join(process.cwd(), "..");
            const dirPath = path.join(parentDir, "scraped_data");
            const folders = fs
              .readdirSync(dirPath, { withFileTypes: true })
              .filter((dirent) => dirent.isDirectory())
              .map((dirent) => dirent.name);

            //COMPARISION OF FOLDERS
            let oemFolder = folders.find((folder) =>
              matchLetters(oemName, folder)
            );

            if (!oemFolder) {
              // If no matching folder, create a new folder with the OEM name
              oemFolder = oemName;
              fs.mkdirSync(path.join(dirPath, oemFolder));
              console.log(`Folder created: ${oemFolder}`);
            } else {
              console.log(`Existing folder found: ${oemFolder}`);
            }

            const folderPath = path.join(dirPath, oemFolder);
            const aisummariesFolder = path.join(folderPath, "ai-summaries");
            if (!fs.existsSync(aisummariesFolder)) {
              fs.mkdirSync(aisummariesFolder, { recursive: true });
            }
            const cvesummaryFile = path.join(
              aisummariesFolder,
              "cve-summary.txt"
            );
            // Save the report text in the folder
            fs.writeFileSync(cvesummaryFile, reportResponse, "utf8");
            console.log(`File saved at: ${cvesummaryFile}`);
          } else {
            console.log("OEM Name not found in the report text.");
          }
        } 
        else if (type == "NEWS&CVE") {
          // Function for making AI report requests
          const report = async (input, url) => {
            try {
              console.log(`${process.env.URL}:${url}`);
              const response = await axios.post(`${process.env.URL}:${url}`, {
                data: input,
              });

              console.log("Response from server:", response.data);
              return response.data;
            } catch (error) {
              console.error("Error sending input:", error);
              return null; // Ensure a return value on error
            }
          };

          // FOR PUTTING IN CVE
          const reportResponseCVE = await report(
            pageTextContent,
            `${process.env.PORT2}/api/cve-summary-ai`
          );

          if (!reportResponseCVE) {
            console.error(
              "AI report generation failed for CVE. Please check the input data and try again."
            );
          } else {
            const aisummariesFolder = path.join(folderPath, "ai-summaries");
            if (!fs.existsSync(aisummariesFolder)) {
              fs.mkdirSync(aisummariesFolder, { recursive: true });
            }
            const cvesummaryFile = path.join(
              aisummariesFolder,
              "cve-summary.txt"
            );
            fs.writeFileSync(cvesummaryFile, reportResponseCVE, "utf8");

            console.log("Meta Llama AI did its job for CVE!!");
            console.log("CVE Summary Details written successfully!!");

            function extractOEMName(text) {
              const match = text.match(/OEM Name:\s*([\w\s]+)/);
              if (!match) return null;

              return match
                ? match[1].trim().toLowerCase().replace(/\s+/g, "")
                : null; // Convert to lowercase and remove spaces
            }
            function matchLetters(oemName, folderName, threshold = 0.6) {
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
            // OEM extraction and folder handling
            const oemName = extractOEMName(reportResponseCVE);
            console.log("Found OEM Name:", oemName);

            if (oemName) {
              const scrapedDataExists = fs.existsSync(
                path.join(process.cwd(), "scraped_data")
              );
              const parentDir = scrapedDataExists
                ? process.cwd()
                : path.join(process.cwd(), "..");
              const dirPath = path.join(parentDir, "scraped_data");
              const folders = fs
                .readdirSync(dirPath, { withFileTypes: true })
                .filter((dirent) => dirent.isDirectory())
                .map((dirent) => dirent.name);

              // COMPARISON OF FOLDERS
              let oemFolder = folders.find((folder) =>
                matchLetters(oemName, folder)
              );

              if (!oemFolder) {
                // If no matching folder, create a new folder with the OEM name
                oemFolder = oemName;
                fs.mkdirSync(path.join(dirPath, oemFolder));
                console.log(`Folder created: ${oemFolder}`);
              } else {
                console.log(`Existing folder found: ${oemFolder}`);
              }

              const folderPath = path.join(dirPath, oemFolder);
              const aisummariesFolder = path.join(folderPath, "ai-summaries");
              if (!fs.existsSync(aisummariesFolder)) {
                fs.mkdirSync(aisummariesFolder, { recursive: true });
              }
              const cvesummaryFile = path.join(
                aisummariesFolder,
                "cve-summary.txt"
              );
              // Save the report text in the folder
              fs.writeFileSync(cvesummaryFile, reportResponseCVE, "utf8");
              console.log(`File saved at: ${cvesummaryFile}`);
            } else {
              console.log("OEM Name not found in the CVE report text.");
            }
          }

          // FOR PUTTING IN NEWS
          const reportResponseNEWS = await report(
            pageTextContent,
            `${process.env.PORT}/api/news-summary-ai`
          );

          if (!reportResponseNEWS) {
            console.error(
              "NEWS AI report generation failed. Please check the input data and try again."
            );
          } else {
            const aisummariesFolder = path.join(folderPath, "ai-summaries");
            if (!fs.existsSync(aisummariesFolder)) {
              fs.mkdirSync(aisummariesFolder, { recursive: true });
            }
            const newssummaryFile = path.join(
              aisummariesFolder,
              "news-summary.txt"
            );

            let newsSummary = `${reportResponseNEWS.slice(
              0,
              -2
            )} # Link: ${link} ||`;
            if (imageLink) {
              newsSummary = `${newsSummary.slice(
                0,
                -2
              )} # ImageLink: ${imageLink} ||`;
            }
            fs.writeFileSync(newssummaryFile, newsSummary, "utf8");

            console.log("Meta Llama AI did its job for NEWS!!");
            console.log("News Summary Details written successfully!!");
          }
        }
        //NEWS
        else {
          //FOR NEWS FEEDS
          const report = async (input) => {
            try {
              console.log(
                `${process.env.URL}:${process.env.PORT}/api/news-summary-ai`
              );
              const response = await axios.post(
                `${process.env.URL}:${process.env.PORT}/api/news-summary-ai`,
                {
                  data: input,
                }
              );

              console.log("Response from server:", response.data);
              return response.data;
            } catch (error) {
              console.error("Error sending input:", error);
            }
          };

          let reportResponse = await report(pageTextContent);
          // console.log(reportResponse);
          if (!reportResponse) {
            console.error(
              "NEWS AI report generation failed. Please check the input data and try again.",
              error
            );
          }

          const aisummariesFolder = path.join(folderPath, "ai-summaries");
          if (!fs.existsSync(aisummariesFolder)) {
            fs.mkdirSync(aisummariesFolder, { recursive: true });
          }
          const newssummaryFile = path.join(
            aisummariesFolder,
            "news-summary.txt"
          );
          reportResponse = `${reportResponse.slice(0, -2)} # Link: ${link} ||`;
          if (imageLink) {
            reportResponse = `${reportResponse.slice(
              0,
              -2
            )} # ImageLink: ${imageLink} ||`;
          }
          fs.writeFileSync(newssummaryFile, reportResponse, "utf8");

          console.log("Meta Llama AI did its job !!");
          console.log("News Summary Details written successfully!!");
        }

        await browser.close(); // Close the browser
      } catch (error) {
        console.log("ERROR", error);
      }
    } else {
      console.error("Link Not Found !!", error);
    }
  } catch (error) {
    console.error("Error fetching RSS feed / Reddit Link Not Found :", error);
  }
}

// Array of RSS feed objects with URLs and types
const rssFeeds = [
  // CVE ONES - BY AI cve summaries
  // { url: "https://www.debian.org/security/dsa", type: "CVE" },
  // { url: "https://seclists.org/rss/fulldisclosure.rss", type: "CVE" },
  // { url: "https://www.exploit-db.com/rss.xml", type: "CVE" },

  // // // SOMETIMES NEWS/CVE - BY AI news summary
  // // { url: "https://www.reddit.com/r/netsec/.rss", type: "NEWS&CVE" },
  // { url: 'https://www.reddit.com/r/netsec/new/.rss', type: "NEWS&CVE" },
  // // { url: 'https://www.reddit.com/r/netsec/rising/.rss', type: "NEWS&CVE" },

  // // { url: "https://www.reddit.com/r/cybersecurity/.rss", type: "NEWS&CVE" },
  // { url: 'https://www.reddit.com/r/cybersecurity/new/.rss', type: "NEWS&CVE" },
  // // { url: 'https://www.reddit.com/r/cybersecurity/top/.rss', type: "NEWS&CVE" },
  // // { url: 'https://www.reddit.com/r/cybersecurity/rising/.rss', type: "NEWS&CVE" },
 

  // // // NEWS FEEDS - BY AI news summary
  // { url: "https://www.malwarebytes.com/blog/feed/index.xml", type: "NOTCVE" },
  // { url: "https://www.wired.com/feed/category/security/latest/rss", type: "NOTCVE" },
    { url: "https://feeds.feedburner.com/TheHackersNews", type: "NOTCVE" },
  //   { url: "https://hackread.com/feed/", type: "NOTCVE" },
  // { url: "https://rss.packetstormsecurity.com/", type: "NOTCVE"},
  // { url: "https://threatpost.com/feed/", type:"NOTCVE"},
    // { url: "https://www.bleepingcomputer.com/feed/", type: "NOTCVE" }, //bleepingcomputer DOESNOT RUN IN HEADLESS TRUE IT RUNS ONLY IN HEAD LESS FALSE
];

// Fetch and display feeds from all URLs
rssFeeds.forEach(({ url, type }) => fetchRSSFeed(url, type));
