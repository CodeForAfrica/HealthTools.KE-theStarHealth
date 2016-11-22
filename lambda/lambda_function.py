import urllib, os
DOCTOR_SEARCH = os.getenv("DOCTOR_SEARCH")

def lambda_handler(event, context):
    # TODO implement
    print event
    print "*" * 30
    name = event.get("name", "")
    resp = urllib.urlopen(DOCTOR_SEARCH + "q=%s" % name)
    return resp.read()
