# HealthTools.KE - theStar Health

HealthTools is a suite of data-driven web and SMS-based tools that help citizens check everything from medicine prices and hospital services, to whether their doctor is a quack or not. The toolkit was pioneered in Kenya, and has since also been deployed in Ghana, Nigeria, and South Africa. The original project can be accessed at: http://health.the-star.co.ke

## theStar Health Website

theStar Health website is jekyll / [Github Pages](https://pages.github.com/) powered.

## theStar Health SMS broker

theStarHealth SMS broker is a AWS Lambda function and is in `_sms` folder.

This is the SMS handler component of StarHealth. It:
* Receives HTTP calls from the SMS provider
* Queries CloudSearch with the search query received on SMS
* Returns text response - i.e. the SMS to be sent back to the user

The service is implemented as an AWS Lambda function - triggered by HTTP calls to a connected AWS API Gateway endpoint.

Functionality is a few lines of code and pretty self-explanatory:  `lambda_function.py`

---

### License and Copyright

The MIT License (MIT)

Copyright (c) 2017 Code for Africa

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
