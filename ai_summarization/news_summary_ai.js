import dotenv from "dotenv";
import Groq from "groq-sdk";
import express from "express";
import net from "net";


dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});
const app = express();
app.use(express.json());

//CHECKING PORT AVAILABLITY
const PORT1 =  process.env.PORT;


app.post("/api/news-summary-ai", async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ error: "Data is required" });
    }

    const prompt = `
    Please generate a consistent and concise report using the following details. Please extract and format the following details from the scraped content. Ensure the output is in the exact order and format as shown below, without adding extra information or changing the structure. The content should be identical every time for the same feed. Each field should be separated by #, and the report should start and end with ||. Remove any additional text or commentary from the response.
    
    Important Extraction Guidelines:
    Title: Extract the title from the feed data. If the title is not available, return "NA."
    Description: Provide a short description or summary of 30 to 40 words.Look for summary properly. Only return "NA" if no such information is found. 
    Date: Extract the date of the post. Format the date as day Month year (e.g., 20 October 2024).
    
    Scraped Content: ${data}
    
    Details:
    Title: [Extracted Title]
    Description: [Extracted Description or "NA"]
    Date: [Extracted Date in the format day Month year]

    Example Input:

    Title: New Vulnerability Discovered in OpenSSL
    Description: A new critical vulnerability has been found in OpenSSL, which affects versions prior to 1.2.1.
    Date: 19 October 2024

    Expected Output:
    ||Title: New Vulnerability Discovered in OpenSSL # Description: A new critical vulnerability has been found in OpenSSL, which affects versions prior to 1.2.1. # Date: 19 October 2024 ||

    Note: Ensure consistency in every output following this structure.
    `;
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `${prompt}`,
        },
      ],
      model: "llama3-8b-8192",
      temperature: 0.0,
    });

    res.setHeader("Content-Type", "application/json");
    // res.json(chatCompletion);
    res.json(chatCompletion.choices[0].message.content);
    // console.log(chatCompletion.choices[0].message.content);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});


app.listen(PORT1, () => {
  console.log(`Server for news_summary_ai is running on port ${PORT1}`);
});