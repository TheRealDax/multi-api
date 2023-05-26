# Substring API

This API is designed for string manipulation.

It can do the following depending on the endpoint used:

Return the first part of a string
Return the last part of a string
Remove the last part of a string and return the rest 
Return a part of the string in the middle specified by start and end points

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
| `end` | `integer` | **Required**. Specifies the end of the string to return |

```
  Example:
  string = "This is a test"
  start = 6
  end = 9

  Result = "is a"
```
