# A Multi Purpose API Built primarily for users of [BotGhost](https://www.botghost.com)![BotGhost](https://i.imgur.com/UwAaDMK.png)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) ![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white) ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)  

This API is designed to perform a variety of functions in order to assist users in creating or enhancing their commands and events in BotGhost.  
It is possible to use the API outside of BotGhost, although some endpoints may not function correctly.  

I can be contacted via Discord @therealdax  
<img alt="Discord" src="https://img.shields.io/discord/822426820447567872?logo=discord&label=BotGhost%20Discord&color=blue&link=https%3A%2F%2Fdiscord.com%2Finvite%2F9UPM6S4xyA">


## ⚙️API Reference

API URL: `https://www.multi-api.xyz`  
Authentication: `None` (at the moment)  
  
You will need to append one of the endpoints to the end of the URL and provide the correct parameters in the request body.

### Getfirst
`Returns the first part of a string`  
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

### Getlast
`Returns the last part of a string`  
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
### Removelast
`Removes the last part of a string and returns the rest`  
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
### Getsubstring
`Returns a part of the string in the middle specified by start and end points`  
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
### Timestamp
`Converts a date and time to the Unix formatted timestamp`  
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
### Currencyformat
`Converts a number to it's currency formatted equivalent`  
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
### Convertnum
`Convert a number from long to short or short to long (eg: 1000 > 1k OR 1k > 1000)`  
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
### Transcript
`Generates HTML transcripts from messages in Discord`  
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

### Regex
`Returns a result (results) based on a regular expression`  
```
  POST /regex
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `string` | `string` | **Required**. The string that the regular expression should evaluate |
| `regex` | `string` | **Required**. The regular expression to use |

### Vc
`Joins the bot to a voice channel and will disconnect and delete the channel after 5 minutes or when the API receives a disconnect request`  
```
  POST /vc
```
`If you would like to use this endpoint, please contact me on Discord`


