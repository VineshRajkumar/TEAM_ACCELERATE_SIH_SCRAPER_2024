export function generateEmailTemplate(data) {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Vulnerability Report</title>
      <style>
          * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
          }
          body {
              font-family: 'Poppins', 'Inter', sans-serif;
              background-color: #f5f5f5;
              color: #333;
              margin: 0;
              padding: 0;
          }
          .email-container {
              max-width: 650px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
              border: 1px solid #e6e9ec;
          }
          .header {
              background-color: #d90429;
              color: #ffffff;
              text-align: center;
              padding: 40px 20px;
              font-size: 28px;
              font-weight: 700;
              letter-spacing: 1px;
          }
          .content {
              padding: 40px 30px;
              color: #333;
              font-size: 16px;
              line-height: 1.7;
          }
          .content h2 {
              font-size: 22px;
              color: #d90429;
              margin-bottom: 16px;
              font-weight: 700;
          }
          .info-box {
              background-color: #fef2f2;
              padding: 20px 25px;
              border-radius: 12px;
              border-left: 5px solid #d90429;
              margin-bottom: 20px;
          }
          .info-box p {
              font-size: 16px;
              margin-bottom: 10px;
              color: #333;
          }
          .info-box strong {
              color: #d90429;
          }
          .content p {
              margin-bottom: 15px;
          }
          .severity-badge {
              display: inline-block;
              padding: 8px 12px;
              font-size: 14px;
              font-weight: 600;
              border-radius: 20px;
              color: #fff;
              text-align: center;
          }
          .severity-1 {
              background-color: #10b981; /* Green */
          }
          .severity-2 {
              background-color: #34d399; /* Light Green */
          }
          .severity-3 {
              background-color: #f59e0b; /* Yellow */
          }
          .severity-4 {
              background-color: #f97316; /* Dark Orange */
          }
          .severity-5 {
              background-color: #d90429; /* Red */
          }
          .cta-button {
              display: inline-block;
              width: 100%;
              text-align: center;
              padding: 16px 0;
              background-color: #d90429;
              color: #ffffff;
              text-decoration: none;
              font-size: 18px;
              font-weight: 700;
              border-radius: 12px;
              transition: background-color 0.3s ease-in-out;
          }
          .cta-button:hover {
              background-color: #bf0021;
          }
          .footer {
              text-align: center;
              background-color: #f8f8f8;
              padding: 20px 20px;
              font-size: 14px;
              color: #666;
              border-top: 1px solid #e6e9ec;
          }
          .footer a {
              color: #d90429;
              text-decoration: none;
          }
          .footer a:hover {
              text-decoration: underline;
          }
      </style>
  </head>
  <body>
  
  <div class="email-container">
      <!-- Header -->
      <div class="header">
          🚨 **ALERTME** Vulnerability Report 
      </div>
  
      <!-- Content -->
      <div class="content">
          <h2>📋 Vulnerability Details</h2>
  
          <div class="info-box">
              <p><strong>🔧 Product Name:</strong> ${data.product || 'N/A'}</p>
              <p><strong>📦 Product Version:</strong> ${data.version || 'N/A'}</p>
              <p><strong>🏢 OEM Name:</strong> ${data.oem || 'N/A'}</p>
              <p><strong>⚠️ Severity Level:</strong> 
                  <span class="severity-badge ${data.severity ? `severity-${getSeverityLevel(data.severity)}` : ''}">
                      ${data.severity ? `${data.severity} / 10` : 'N/A'}
                  </span>
              </p>
          </div>
  
          <p><strong>🔍 Vulnerability:</strong> ${data.vulnerability || 'N/A'}</p>
          <p><strong>🛠️ Mitigation Strategy:</strong> 
              ${data.mitigation || 'N/A'}
          </p>
          <p><strong>🗓️ Published Date:</strong> ${data.date || 'N/A'}</p>
          <p><strong>🆔 Unique IDs:</strong> ${data.id ? data.id.map(id => `<code>${id}</code>`).join(', ') : 'N/A'}</p>
  
          <a href="#" class="cta-button">📄 View Full Report</a>
      </div>
  
      <!-- Footer -->
      <div class="footer">
          This is an automated email from <strong>AlertMe</strong>. Please do not reply. 
          For support, contact 
          <a href="#">support@alertme.com</a>.
      </div>
  </div>
  
  </body>
  </html>
    `;
}

function getSeverityLevel(severity) {
    if (severity >= 0 && severity <= 2) {
        return 1; // Green (low severity)
    } else if (severity > 2 && severity <= 4) {
        return 2; // Light Green
    } else if (severity > 4 && severity <= 6) {
        return 3; // Yellow (medium severity)
    } else if (severity > 6 && severity <= 8) {
        return 4; // Dark Orange
    } else if (severity > 8 && severity <= 10) {
        return 5; // Red (critical severity)
    } else {
        return ''; // No severity (out of range)
    }
}



  