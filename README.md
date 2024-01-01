# Shopify Inventory Automation
The following dir is a Python script that operates on Google Sheets API service. The program is a simple CSV formatter working out of a single Google Sheets document consisting of multiple csv files (pages/tabs) within it. There is highlighted importance palced on the order in which the sheets appear in the document. It was built specifically for a Client and therefore adheres to their workflow and instructions. 

# Tech Stack
- Python

# APIs
- [Google Sheets](https://developers.google.com/sheets/api/guides/concepts)

# High-level Overview
1. Gain authorized access to required Google Sheet.

2. Filter unique items.

3. Adjust unique item QTY.

4. Highlight store items with QTY 0.

5. Create a new sheet named 'Updated_inventory' with the QTY adjusted data.

6. Import Updated_inventory to Shopify for bulk-edit via CSV.
