# TEAM_ACCELERATE_SIH_SCRAPER_2024
The Official SIH_SCRAPER of TEAM ACCELERATE for SIH Hackathon 2024 

This will form the base for AlertMe Threat Detection System.
-

# Near Real-Time Vulnerability Threat Detection System

![image](https://github.com/user-attachments/assets/38eef91f-26e7-4306-bf6f-3cc286991f07)
![image](https://github.com/user-attachments/assets/0124f141-bc57-43d8-b99b-888a24d1593f)

## 📌 Overview
This project was developed as part of Smart India Hackathon (SIH) 2024, tackling **Problem Statement 1676**. Our goal was to create a **near real-time vulnerability monitoring system** that detects and alerts users about critical vulnerabilities in OEM equipment (IT & OT) faster than the **National Vulnerability Database (NVD)**.

While we didn't make it to the Grand Finale, this journey was an incredible learning experience in cybersecurity, AI, and web scraping.

## 🌟 Key Features

### 🔹 Powerful Web Scraper
- Monitors **40+ websites** (and can scale further).
- Uses just **2 adaptive algorithms**—no need for custom logic per site.
- Simply **add a URL**, and the scraper adapts automatically.

### 🔹 Automated Detection
- Runs **every 3 minutes** to check for updates.
- **Optimized performance** to prevent unnecessary scraping.

### 🔹 AI-Enhanced Reports
- Uses **Groq’s LLaMA AI** to process raw vulnerability data.
- Generates **standardized, structured reports** for clarity.

### 🔹 Automated Email Alerts
- Sends **real-time alerts** containing:
  - **Product Name**
  - **OEM**
  - **Vulnerability Details**
  - **Severity Level**
  - **Mitigation Strategy**
  - **Unique ID**
- Ensures **clean, consistent formatting** for easy understanding.

### 🔹 Robust Backend System
- Built with **PostgreSQL** to manage:
  - OEM links
  - Email IDs
  - Report data

### 🔹 Error Handling & Stability
- **Parallel processing** prevents one failed site from affecting others.
- Email alerts are **only sent if database processing succeeds**.

## 🛠️ Technologies Used
- **Web Scraping:** Puppeteer
- **Database:** PostgreSQL
- **Backend:** Node.js, Express
- **AI Processing:** Groq’s LLaMA AI
- **Task Scheduling:** Cron jobs
- **Email Automation:** Resend API

## 🎓 Learning & Insights
This project deepened our knowledge in:
- **Cybersecurity Threat Detection**
- **AI-Powered Data Processing**
- **Efficient Web Scraping Techniques**
- **Optimized Backend Data Management**
- **Automated Email Notification Systems**

## 🚀 Future Plans
- Develop a **user-friendly frontend UI** for both **technical & non-technical users**.
- Explore **cloud deployment** for real-world scalability.
- Expand to **more websites** and improve scraping efficiency.

## 📷 Screenshots
![image](https://github.com/user-attachments/assets/8754f75d-b779-440a-8802-c672144761f4)
![image](https://github.com/user-attachments/assets/691d8928-c591-44db-9900-bbb92f1a34d1)
![image](https://github.com/user-attachments/assets/ef3f3e50-5646-4ce0-9bf2-63143582923d)
![image](https://github.com/user-attachments/assets/e459181e-ae6e-430a-b6fb-a514c58de7fb)
![image](https://github.com/user-attachments/assets/e6112ffd-0f2c-4c55-a7d0-3e42a889c3b4)

## 🙌 Acknowledgments

### Special Thanks to Our Mentors
- **Sharmila Wagh Ma’am**
- **Gaurav Neelwarna Sir**

### Team Members
- [**Glen Thalakottur**](https://github.com/Pyr0de)
- [**Aryan Patil**](https://github.com/Aryanpatil2502)
- [**Snehal Jagtap**](https://github.com/Tech8Tales)
- **Aditya Kumar**
- **Rajat Gawade**

This project sparked a newfound passion for cybersecurity, and we’re excited to keep learning and innovating! 🚀
