# Shopify Inventory Automation
The following dir is a Python script that operates on Google Sheets API service. The program is a simple CSV formatter working out of a single Google Sheets document consisting of multiple csv files (pages/tabs) within it. There is highlighted importance palced on the order in which the sheets appear in the document. It was built specifically for a Client and therefore adheres to their workflow and instructions. 

# Tech Stack
- Python

# API
- [Google Sheets](https://developers.google.com/sheets/api/guides/concepts)

# Version 1 
The first iteration of this program used Python to connect to the Google Sheets API service. Though this approach worked, there were concerns about deployment of the app as well as inconsistencies with data formatting and debugging. After speaking with the client and discussing challenges/concerns, as well as fine-tuning current and future features, we concluded that a Google Apps Script approach may better suite the project needs.

# Version 2
The second iteration of the program was built within Google's Apps Script enviornment. I converted the Python code to JavaScript before implementing additional features.

# Project Reflections

- Spend some extra time to research different approaches to solving a problem. In this case, the Apps Script approach simplified debugging, testing, and (future) deployment of the project to my client.

- Organize features/asks of client in a top down approach where I can step through each feature systematically.