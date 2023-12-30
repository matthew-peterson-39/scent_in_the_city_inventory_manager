import os
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Constants for Google Sheets setup
SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
SPREADSHEET_ID = "1tf5alukErw6MwTGxi4JDTf4QLDP7ZypanzylUW5NBn4/"

def update_quantity(qty):
    """
    Determine the updated quantity based on given parameters.

    Args:
    qty (int): The original quantity.

    Returns:
    int: The updated quantity.
    """
    if qty >= 600:
        return 8
    elif 400 <= qty < 600:
        return 4
    elif 200 <= qty < 400:
        return 3
    elif 100 <= qty < 200:
        return 2
    elif 60 <= qty < 100:
        return 1
    else:
        return 0

def main():
    """
    Main function to handle the operations of updating inventory.
    """
    # Authenticate and create a Google Sheets API service
    credentials = None
    if os.path.exists("token.json"):
        credentials = Credentials.from_authorized_user_file("token.json", SCOPES)
    if not credentials or not credentials.valid:
        if credentials and credentials.expired and credentials.refresh_token:
            credentials.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
            credentials = flow.run_local_server(port=0)
        with open("token.json", "w") as token:
            token.write(credentials.to_json())

    try:
        service = build("sheets", "v4", credentials=credentials)
        sheets = service.spreadsheets()

        # Clear or create Sheet3
        try:
            sheet_metadata = service.spreadsheets().get(spreadsheetId=SPREADSHEET_ID).execute()
            sheets_ids = [sheet['properties']['sheetId'] for sheet in sheet_metadata.get('sheets', '')]
            sheet3_id = sheets_ids[2]  # Assuming Sheet3 is the third sheet
            sheets.batchUpdate(spreadsheetId=SPREADSHEET_ID, body={
                "requests": [{"deleteSheet": {"sheetId": sheet3_id}}]
            }).execute()
        except IndexError:
            # If Sheet3 doesn't exist, ignore the error
            pass

        sheets.batchUpdate(spreadsheetId=SPREADSHEET_ID, body={
            "requests": [{"addSheet": {"properties": {"title": "Sheet3"}}}]
        }).execute()

        # Copy data from Sheet1 to Sheet3
        lee_inventory = sheets.values().get(spreadsheetId=SPREADSHEET_ID, range="Sheet1!A2:D").execute()
        lee_values = lee_inventory.get("values", [])
        if lee_values:
            sheets.values().update(spreadsheetId=SPREADSHEET_ID, range="Sheet3!A2",
                                   valueInputOption='USER_ENTERED', body={"values": lee_values}).execute()

        # Fetching data from the supplier inventory sheet
        supplier_inventory = sheets.values().get(spreadsheetId=SPREADSHEET_ID, range="Sheet2!A2:D").execute()
        supplier_values = supplier_inventory.get("values", [])

        # Identifying unique items in supplier inventory not present in Lee's inventory
        lee_product_codes = {row[0] for row in lee_values}
        unique_supplier_items = [row for row in supplier_values if row[0] not in lee_product_codes]

        # Updating quantities for unique items and preparing them for insertion
        updated_items = []
        for item in unique_supplier_items:
            original_qty = int(item[2])
            new_qty = update_quantity(original_qty)
            updated_items.append(item[:2] + [new_qty, item[3]])

        # Append updated items to Sheet3 in Google Sheets
        update_range = f"Sheet3!A{len(lee_values) + 2}"
        request_body = {'values': updated_items}
        sheets.values().append(spreadsheetId=SPREADSHEET_ID, range=update_range,
                               valueInputOption='USER_ENTERED', body=request_body).execute()

    except HttpError as error:
        print(f"An error occurred: {error}")

if __name__ == '__main__':
    main()