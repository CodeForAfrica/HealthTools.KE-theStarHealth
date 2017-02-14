"""
broker for SMS client:
    - receive http call from sms client
    - query CloudSearch
    - return text response
"""

import requests
import re

SECRET_KEY = ''
SMS_PROVIDER_USERNAME = ''
SMS_PROVIDER_KEY = ''
DOCTORS_SEARCH_URL = "https://6ujyvhcwe6.execute-api.eu-west-1.amazonaws.com/prod"
NURSE_SEARCH_URL = "https://52ien7p95b.execute-api.eu-west-1.amazonaws.com/prod"
CO_SEARCH_URL = "https://vfblk3b8eh.execute-api.eu-west-1.amazonaws.com/prod"
NHIF_SEARCH_URL = "https://t875kgqahj.execute-api.eu-west-1.amazonaws.com/prod"
HF_SEARCH_URL = "https://187mzjvmpd.execute-api.eu-west-1.amazonaws.com/prod"
SMS_RESULT_COUNT = 5 # Number of results to be send via sms
DOC_KEYWORDS = ['doc', 'daktari', 'doctor', 'oncologist', 'dr']
CO_KEYWORDS = ['CO', 'clinical officer','clinic officer', 'clinical', 'clinical oficer',]
NO_KEYWORDS = ['nurse', 'no', 'nursing officer', 'mhuguzi', 'RN', 'Registered Nurse']
NHIF_KEYWORDS = ['nhif', 'bima', 'insurance', 'insurance fund', 'health insurance', 'hospital fund']
HF_KEYWORDS = ['hf', 'hospital', 'dispensary', 'clinic', 'hospitali', 'sanatorium', 'health centre']


def lambda_handler(event, context):
    name = event.get("name", "")
    phone_number = event.get("phone_number", "")
    msg = build_query_response(name)
    #TODO: Integrate with m-tech to send sms
    # send_sms_place_holder_funct(phoneNumber, msg)
    return msg[0]


def find_keyword_in_query(query, keywords):
    regex = re.compile(r'\b(?:%s)\b' % '|'.join(keywords), re.IGNORECASE)
    return re.search(regex, query)


def build_query_response(query):
    query = clean_query(query)
    # Start by looking for doctors keywords
    if find_keyword_in_query(query, DOC_KEYWORDS):
        search_terms = find_keyword_in_query(query, DOC_KEYWORDS)
        query = query[:search_terms.start()] + query[search_terms.end():]
        r = requests.get(DOCTORS_SEARCH_URL, params={'q': query})
        msg = construct_docs_response(parse_cloud_search_results(r))
        print msg
        return [msg, r.json()]
    # Looking for Nurses keywords
    elif find_keyword_in_query(query, NO_KEYWORDS):
        search_terms = find_keyword_in_query(query, NO_KEYWORDS)
        query = query[:search_terms.start()] + query[search_terms.end():]
        r = requests.get(NURSE_SEARCH_URL, params={'q': query})
        msg = construct_nurse_response(parse_cloud_search_results(r))
        print msg
        return [msg, r.json()]
    # Looking for clinical officers Keywords
    elif find_keyword_in_query(query, CO_KEYWORDS):
        search_terms = find_keyword_in_query(query, CO_KEYWORDS)
        query = query[:search_terms.start()] + query[search_terms.end():]
        r = requests.get(CO_SEARCH_URL, params={'q': query})
        msg = construct_co_response(parse_cloud_search_results(r))
        print msg
        return [msg, r.json()]
    # Looking for nhif hospitals
    elif find_keyword_in_query(query, NHIF_KEYWORDS):
        search_terms = find_keyword_in_query(query, NHIF_KEYWORDS)
        query = query[:search_terms.start()] + query[search_terms.end():]
        r = requests.get(NHIF_SEARCH_URL, params={'q': query})
        msg = construct_nhif_response(parse_cloud_search_results(r))
        print msg
        return [msg, r.json()]
    # Looking for health facilities
    elif find_keyword_in_query(query, HF_KEYWORDS):
        search_terms = find_keyword_in_query(query, HF_KEYWORDS)
        query = query[:search_terms.start()] + query[search_terms.end():]
        r = requests.get(HF_SEARCH_URL, params={'q': query})
        msg = construct_hf_response(parse_cloud_search_results(r))
        print msg
        return [msg, r.json()]
    # If we miss the keywords then reply with the prefered query formats
    else:
# Doctors: DR. SAMUEL AMAI
# Clinical Officers: CO SAMUEL AMAI
# Nurses: NURSE SAMUEL AMAI
# NHIF accredited hospital: NHIF KITALE
# Health Facility: HF KITALE
        msg_items = []
        msg_items.append("We could not understand your query. Try these:")
        msg_items.append("1. Doctors: DR. SAMUEL AMAI")
        msg_items.append("2. Clinical Officers: CO SAMUEL AMAI")
        msg_items.append("3. Nurses: NURSE SAMUEL AMAI")
        msg_items.append("4. NHIF accredited hospital: NHIF KITALE")
        msg_items.append("5. Health Facility: HF KITALE")
        msg = " ".join(msg_items)
        print msg
        return [msg, {'error':" ".join(msg_items)}]

def construct_co_response(co_list):
    # Just incase we found ourselves here with an empty list
    if len(co_list) < 1:
        return "Could not find a clinical officer with that name"
    count = 1
    msg_items = []
    for co in co_list:
            status = " ".join([str(count), co['name'], "-", co['qualification']])
            msg_items.append(status)
            count = count + 1
    if len(co_list) == 5:
        msg_items.append("Find the full list at http://health.the-star.co.ke")
    print "\n".join(msg_items)
    return "\n".join(msg_items)


def construct_nhif_response(nhif_list):
    # Just incase we found ourselves here with an empty list
    if len(nhif_list) < 1:
        return "The location you provided is currently not served by an NHIF accredited hospital."
    count = 1
    msg_items = []
    for nhif in nhif_list:
        status = " ".join([str(count) + ".", nhif['name']])
        msg_items.append(status)
        count = count + 1
    if len(nhif_list) == 5:
        msg_items.append("Find the full list at http://health.the-star.co.ke")

    return "\n".join(msg_items)


def construct_hf_response(hf_list):
    # Just incase we found ourselves here with an empty list
    if len(hf_list) < 1:
        return "We could not find a health facilty in the location you provided"
    count = 1
    msg_items = []
    for hf in hf_list:
        status = " ".join([str(count) + ".", hf['name']+" -", hf['keph_level_name']])
        msg_items.append(status)
        count = count + 1
    if len(hf_list) == 5:
        msg_items.append("Find the full list at http://health.the-star.co.ke")

    return "\n".join(msg_items)

def construct_nurse_response(nurse_list):
    # Just incase we found ourselves here with an empty list
    if len(nurse_list) < 1:
        return "Could not find a nurse with that name"
    count = 1
    msg_items = []
    for nurse in nurse_list:
        status = " ".join([str(count)+".", nurse['name']+",", "VALID TO", nurse['valid_until']])
        msg_items.append(status)
        count = count + 1
    if len(nurse_list) == 5:
        msg_items.append("Find the full list at http://health.the-star.co.ke")

    return "\n".join(msg_items)


def construct_docs_response(docs_list):
    # Just incase we found ourselves here with an empty list
    if len(docs_list) < 1:
        return "Could not find a doctor with that name"
    count = 1
    msg_items = []

    for doc in docs_list:
        # Ignore speciality if not there, dont display none
        if doc['specialty'] == "None":
            status = " ".join([str(count), doc['name'], "-", doc['registration_number'], "-", doc['qualification']])
        else:
            status = " ".join([str(count), doc['name'], "-", doc['registration_number'], "-", doc['qualification'], doc['specialty']])
        msg_items.append(status)
        count = count + 1
    if len(docs_list) == 4:
        msg_items.append("Find the full list at http://health.the-star.co.ke")

    return "\n".join(msg_items)


def clean_query(query):
    query = query.lower().strip().replace(".","")
    return query


def parse_cloud_search_results(response):
    result_to_send_count = SMS_RESULT_COUNT
    data_dict = response.json()
    fields_dict = (data_dict['hits'])
    hits = fields_dict['hit']
    result_list = []
    search_results_count = len(hits)
    print "FOUND {} RESULTS".format(search_results_count)
    for item in hits:
        result = item['fields']
        if len(result_list) < result_to_send_count:
            result_list.append(result)
        else:
            break
    return result_list