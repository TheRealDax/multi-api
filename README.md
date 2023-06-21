# A Multi Purpose API Built primarily for users of ![BotGhost](https://i.imgur.com/UwAaDMK.png)[BotGhost](https://www.botghost.com)

This API was designed for string manipulation, but now has multiple endpoints for different use cases.

It can do the following depending on the endpoint used:

Return the first part of a string  
Return the last part of a string  
Remove the last part of a string and return the rest  
Return a part of the string in the middle specified by start and end points
Convert a date and time to the Unix formatted timestamp
Convert a number to it's currency formatted equivalent
Convert a number from long to short or short to long (eg: 1000 > 1k OR 1k > 1000)  
Generates HTML transcripts from messages in Discord
Returns a result (results) based on a regular expression

## API Reference

The API base URL is https://www.multi-api.xyz

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
#### Convertnum

```
  POST /convertnum
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `number` | `string` | **Required**. The number to convert |

```
  Example 1:
  number = "1000"

  Result = "1k"

  Example 2:
  number = "1k"

  Result = "1000"
```
#### Transcript

```
  POST /transcript
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `serverid` | `string` | **Required**. The Discord server id. Used in file generation and transcript matching. In BotGhost use {server_id} as the value |
| `channelid` | `string` | **Required**. The Discord channel id. Used in file generation and transcript matching. In BotGhost use {event_channel_id} as the value |
| `messageid` | `string` | **Required**. The Discord message id. Used for identifying edited and deleted messages. In BotGhost use {event_message_id} as the value |
| `content` | `string` | **Required**. The message content to add to the transcript. In BotGhost use {event_message_content} as the value  |
| `channelname` | `string` | **Required**. The Discord channel name. Used as a variable to include the channel name in the transcript logs. In BotGhost use {event_channel_name} as the value |
| `user` | `string` | **Required**. The Discord user sending the message. In BotGhost use {event_user_name} as the value |
| `usericon` | `string` | **Required**. The Discord users profile icon. Used as a variable to include the icon in the transcript logs. In BotGhost use {user_icon} as the value |
| `close` | `string` | **Optional**. Used to "close" the transcript and generate the URL to the HTML file. Must be used in conjunction with serverid and channelid. **Do not pass content if you are closing the transcript** |
| `eventtype` | `string` | **Optional**. Used to inform the API the message was deleted and not edited. Use "delete" as the value. **Should only be used in the "When a message is deleted" event in BotGhost.** |

#### Regex

```
  POST /regex
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `string` | `string` | **Required**. The string that the regular expression should evaluate |
| `regex` | `string` | **Required**. The regular expression to use |


