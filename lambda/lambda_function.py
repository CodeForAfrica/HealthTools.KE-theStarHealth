import urllib
DOCTOR_SEARCH = "https://szfs458b3b.execute-api.eu-west-1.amazonaws.com/prod?"

def lambda_handler(event, context):
    # TODO implement
    print event
    print "*" * 30
    name = event.get("name", "")
    resp = urllib.urlopen(DOCTOR_SEARCH + "q=%s" % name)
    return resp.read()
