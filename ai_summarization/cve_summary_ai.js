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


const PORT2 = process.env.PORT2;


app.post("/api/cve-summary-ai", async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
        return res.status(400).json({ error: 'Data is required' });
    }

    const prompt = `Please generate a consistent and concise vulnerability report using the following details. 
        Please extract and format the following details from the scraped content. Ensure the output is in the exact order and format as shown below, without adding extra information or changing the structure. 
        The content should be identical every time for the same vulnerability.
        Each field should be separated by #, and the report should start and end with ||. Remove any additional text or commentary from the response.

        Important Extraction Guidelines:
        1) OEM Name: If the OEM Name is not directly available, look for indirect references such as "manufacturer" or "vendor". Only return "NA" if no such information is found.
        2) Severity Level (Critical/High): Pay particular attention to extract the Severity Level. Extract the severity score as a numeric value, or Look for specific terms like "Critical", "High", "Medium", or "Low" in the text and convert them to corresponding score as follows: Critical: 9.0-10.0, High: 7.0-8.9, Medium: 4.0-6.9, Low: 0.1-3.9. If any of these terms are present, extract them accurately. Only return "" if no relevant severity information can be determined.
        3) Product Version: Always extract the Product Version if available. Return "NA" only if the information is explicitly missing.
        4) Published Date: Extract the Published Date. Ensure to capture it in the format: day Month year.

        Scraped Content: ${data}

        Details:
        Product Name: [Extracted Product Name]
        Product Version: [Extracted Product Version or "NA" if not available]
        OEM Name: [Extracted OEM Name, do not leave it blank, extract from context if necessary] 
        Severity Level (Critical/High): [Extracted Severity Level as a numeric value , do not leave it blank, extract from context if necessary]
        Vulnerability: [Extracted Vulnerability Description]
        Mitigation Strategy: [Extracted Mitigation Strategy with Link if available]
        Published Date: [Extracted Published Date in the format day Month year]
        Unique ID: [Extracted all Unique IDs such as CVE IDs and any OEM-specific IDs]

        Example Input:
        Product Name: OpenSSH
        Product Version: - NA
        OEM Name: Red Hat, Inc.
        Severity Level (Critical/High): 9.5
        Vulnerability: CVE-2024-6387 Remote Code Execution Due To A Race Condition In Signal Handling.
        Mitigation Strategy: Update to the latest version from [Insert Link]
        Published Date: 11 July 2024
        Unique ID: CVE-2024-6387, AMD-2024-1234

        Expected Output:
        ||Product Name: OpenSSH # Product Version: - NA # OEM Name: Red Hat, Inc. # Severity Level (Critical/High): 9.5 # Vulnerability: CVE-2024-6387 Remote Code Execution Due To A Race Condition In Signal Handling. # Mitigation Strategy: Update to the latest version from [Insert Link] # Published Date: 11 July 2024 # Unique ID: CVE-2024-6387, AMD-2024-1234 ||

        Please follow this structure and ensure consistency in every output.
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


app.listen(PORT2, () => {
  console.log(`Server for cve_summary_ai is running on port ${PORT2}`);
});