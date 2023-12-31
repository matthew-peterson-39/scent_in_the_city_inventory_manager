import os
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# Constants for Google Sheets setup
SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
SPREADSHEET_ID = "1GmoFyI5eSqugrdj6YPYxF9iMoQPk9jDQqTtnQK5-mD8"


# Function to read data from a sheet
def get_sheet_data(sheet):
    return sheet.get_all_records()


# Function to update qty from supplier sheet
def update_quantity(qty):
    """
    Determine the updated quantity based on given parameters.
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


# Function to map SKU to Barcode for a given inventory list
def map_sku_to_barcode(inventory_list):
    pass

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

        # Delete updated inventory if existing
        try:
            sheet_metadata = service.spreadsheets().get(spreadsheetId=SPREADSHEET_ID).execute()
            sheets_ids = [sheet['properties']['sheetId'] for sheet in sheet_metadata.get('sheets', '')]
            updated_inventory_sheet = sheets_ids[4]
            sheets.batchUpdate(spreadsheetId=SPREADSHEET_ID, body={
                "requests": [{"deleteSheet": {"sheetId": updated_inventory_sheet}}]
            }).execute()
        except IndexError:
            pass
        # Create new blank Updated_inventory sheet
        sheets.batchUpdate(spreadsheetId=SPREADSHEET_ID, body={
            "requests": [{"addSheet": {"properties": {"title": "Updated_inventory"}}}]
        }).execute()

        # Copy data from Lee_inventory to Updated_inventory
        lee_inventory = sheets.values().get(spreadsheetId=SPREADSHEET_ID, range="Lee_inventory!A2:E").execute()
        lee_values = lee_inventory.get("values", [])
        if lee_values:
            sheets.values().update(spreadsheetId=SPREADSHEET_ID, range="Updated_inventory!A2",
                           valueInputOption='USER_ENTERED', body={"values": lee_values}).execute()

        # Fetching data from the supplier inventory sheet
        supplier_inventory = sheets.values().get(spreadsheetId=SPREADSHEET_ID, range="Supplier_inventory!A2:E").execute()
        supplier_values = supplier_inventory.get("values", [])

        # Identifying unique items in supplier inventory not present in Lee's inventory
        lee_product_codes = {row[0] for row in lee_values}
        unique_supplier_items = [row for row in supplier_values if row[0] not in lee_product_codes]

        # Updating quantities for unique items and preparing them for insertion
        updated_items = []
        for item in unique_supplier_items:
            original_qty = int(item[3])
            new_qty = update_quantity(original_qty)
            #prior data, new qty, and original qty
            updated_items.append(item[:3] + [new_qty, item[3]])

        # Append updated items to Updated_inventory in Google Sheets
        update_range = f"Updated_inventory!A{len(lee_values) + 2}"
        request_body = {'values': updated_items}
        sheets.values().append(spreadsheetId=SPREADSHEET_ID, range=update_range,
                               valueInputOption='USER_ENTERED', body=request_body).execute()
    
    except:
        pass

    # NOTE : The following code is the necessary logic for populating sku/barcode mapping, though it needs refactoring
    # fit with the above code.

    # # Access different tabs
    # lee_sheet = workbook.worksheet("Lee_inventory")
    # supplier_sheet = workbook.worksheet("Supplier_inventory")
    # product_export_sheet = workbook.worksheet("Product_export")

    # # Read data from each sheet
    # lee_data = get_sheet_data(lee_sheet)
    # supplier_data = get_sheet_data(supplier_sheet)
    # product_export_data = get_sheet_data(product_export_sheet)

    # # Create a mapping between SKU and Barcode
    # sku_barcode_mapping = {product['Variant SKU']: product['Variant Barcode'] for product in product_export_data}

    # # Map SKU to Barcode for Lee Inventory
    # map_sku_to_barcode(lee_data)

    # # Filter Supplier Inventory for Unique SKUs
    # lee_skus = set(item['SKU'] for item in lee_data)
    # unique_supplier_data = [item for item in supplier_data if item['SKU'] not in lee_skus]

    # # Update Quantity for Unique Supplier Inventory and Map SKUs to Barcodes
    # for item in unique_supplier_data:
    #     item['Quantity'] = update_quantity(item['Quantity'])
    #     item['Barcode'] = sku_barcode_mapping.get(item['SKU'], '')

    # # Combine Lee data with updated supplier data
    # updated_inventory = lee_data + unique_supplier_data

    # # Create a new tab and populate with updated inventory
    # updated_inventory_sheet = workbook.add_worksheet(title="Updated Inventory", rows="100", cols="20")
    # updated_inventory_sheet.update([updated_inventory[0].keys()] + [item.values() for item in updated_inventory])

    # print("Updated Inventory tab created and populated successfully.")


if __name__ =='__main__':
    main()