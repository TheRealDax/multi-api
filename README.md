# Substring-API
API to return part of a string based on number of characters passed into the API

Endpoints:
https://substring-api.herokuapp.com/getfirst

https://substring-api.herokuapp.com/getlast

https://substring-api.herokuapp.com/removelast

https://substring-api.herokuapp.com/getsubstring

HTTP Method: POST
Content-Type application/json
No authentication required


For getfirst, getlast and removelast:


Valid request body example for getfirst and getlast:


"string": "This is a test string",
"count": 4


The result of the above example would be "This" for getfirst and "last" for getlast and "This is a test st" for removelast.


Valid request body example for getsubstring:


"string": "This is a test string",
"start": 11,
"end": 14


The result of the above would be "test"
