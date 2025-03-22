#using this file tpo test apis as i am more cormfotable with apis in python

import requests
import json
url = "https://api.aladhan.com/v1/calendar/2025/1?latitude=51.5194682&longitude=-0.1360365&method=3&shafaq=general&tune=5%2C3%2C5%2C7%2C9%2C-1%2C0%2C8%2C-6&timezonestring=UTC&calendarMethod=UAQ"
response = requests.get(url)

with open("prayertime.json", "w") as file:
    json.dump(response.json(), file, indent=4)