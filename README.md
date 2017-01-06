## Starhealth SMS broker

This is the SMS handler component of Starhealth. It:
* Receives HTTP calls from the SMS provider
* Queries CloudSearch with the search query received on SMS
* Returns text response - i.e. the SMS to be sent back to the user

The service is implemented as an AWS Lambda function - triggered by HTTP calls to a connected AWS API Gateway endpoint.

Functionality is a few lines of code and pretty self-explanatory:  `lambda_function.py`
