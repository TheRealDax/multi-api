# Substring API (Now a multipurpose API)

This API was designed for string manipulation, but now has multiple endpoints for different use cases.

It can do the following depending on the endpoint used:

Return the first part of a string  
Return the last part of a string  
Remove the last part of a string and return the rest  
Return a part of the string in the middle specified by start and end points
Convert a date and time to the Unix formatted timestamp
Convert a number to it's currency formatted equivalent

## API Reference

The API base URL is https://substring-api.herokuapp.com  

No Authentication required.

You will need to append one of the endpoints to the end of the URL and provide the correct parameters in the request body.

#### Getfirst

```
  POST /getfirst
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `string` | `string` | **Required**. The string to manipulate |
| `count` | `integer` | **Required**. How many characters of the string to return starting from the start of the string |

```
  Example:
  string = "This is a test"
  count = 4

  Result = "This
```

#### Getlast

```
  POST /getlast
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `string` | `string` | **Required**. The string to manipulate |
| `count` | `integer` | **Required**. How many characters of the string to return starting from the end of the string |

```
  Example:
  string = "This is a test"
  count = 4

  Result = "test"
```
#### Removelast

```
  POST /removelast
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `string` | `string` | **Required**. The string to manipulate |
| `count` | `integer` | **Required**. How many characters of the string to omit from the end of the string |

```
  Example:
  string = "This is a test"
  count = 4

  Result = "This is a "
```
#### Getsubstring

```
  POST /getsubstring
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `string` | `string` | **Required**. The string to manipulate |
| `start` | `integer` | **Required**. Specifies the start of the string to return |
| `end` | `integer` | **Optional**. Specifies the end of the string to return. If not used, will return until the end of the string |
| `numonly` | `string` | **Optional**. If "yes", will omit any non-number characters |

```
  Example:
  string = "This is a test"
  start = 6
  end = 9

  Result = "is a"
```
#### Timestamp

```
  POST /timestamp
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `date` | `string` | **Required**. **Do not use if passing days parameter.** The date in EU or US format (US format requires the format parameter) |
| `time` | `string` | **Required**. **Do not use if passing days parameter.** The time in format of 13:00 OR 1PM. Both will work |
| `format` | `string` | **Optional**. Specifies the format to recognise the date, either US or EU (defaults to EU if not passed) |
| `days` | `string` | **Required**. **Do not use if passing date and time parameter.** Specifies the days in the future to generate the timestamp. |

```
  Example:
  date = 12/06/2023
  time = 13:00

  Result = "1686571200"

  Example:
  days = 4

  Result = "1685801791" (4 days in the future)
```
#### Currencyformat

```
  POST /currencyformat
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `number` | `string` or `int` | **Required**. The number to convert to a currency format |

```
  Example:
  number = 1000000

  Result = 1,000,000
```
