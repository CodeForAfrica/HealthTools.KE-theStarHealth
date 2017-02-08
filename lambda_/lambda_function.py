"""
broker for SMS client:
    - receive http call from sms client
    - query CloudSearch
    - return text response
"""

import urllib, os, json

SEARCH_URL = dict(
        doctors=os.getenv("DOCTOR_SEARCH"),
        nurses=os.getenv("NURSE_SEARCH"),
        clinical_officer=os.getenv("CLINICAL_OFFICER_SEARCH")
        )

MESSAGES = dict(
        miss="No results",
        hit="{name} ({type}) - {registration_number}\n"
        )

SMS_RESULT_COUNT = 4 # How many results to return on sms

def lambda_handler(event, context):
    # TODO implement
    name = event.get("name", "")
    channel = event.get("channel", "sms")
    source = event.get("source", "doctors")

    resp = urllib.urlopen(SEARCH_URL[source] + "q=%s" % name)
    results = json.loads(resp.read())
    result_count = results.get("hits", {}).get("found", 0)
    print "%s results for %s" % (result_count, name)
    if result_count:
        message = construct_message(results["hits"]["hit"])
        if not message:
            message = construct_message(results["hits"]["hit"], take_two=True)
        return message
    else:
        return MESSAGES["miss"]

def construct_message(results, take_two=False):
    message = ""
    count = 0
    for result in results:
        if count > SMS_RESULT_COUNT:
            break
        if (result["fields"].get("type") and result["fields"].get("type") != "-") or take_two:
            entry = MESSAGES["hit"].format(**result["fields"])
            message += entry
            count += 1
        else:
            continue
    return message
