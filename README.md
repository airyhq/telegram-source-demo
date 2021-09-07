# Airy Telegram source

This repository contains a demo integration of the Telegram Bot Api with [Airy](https://github.com/airyhq/airy) using the [Source API](https://docs.airy.co/api/source).

## Step by step usage guide

The goal is to get messages sent to one or more of your Telegram bots into Airy and optionally enable sending messages to Telegram using the Airy send message API.

**1. Connect a source using the Airy [Source API](https://docs.airy.co/api/source#create-a-source) and note down the source token.**

**2. Create a Telegram bot using the [Telegram botfather](https://t.me/botfather)**

**3. [Create](https://docs.airy.co/api/source#create-a-channel) a source channel and add the token as metadata.**

Sample payload:

```json
{
	"source_channel_id": "my-telegram-bot-id",
	"name": "My Telegram bot",
	"metadata":{
		"token": "bot token"
	}
}
``` 

**4. Create an `.env` file and set the `SOURCe_TOKEN` to the one you obtained in step 1.**

**5. Start the development integration by running:**

```shell script
yarn run dev
``` 

The output will look like so:
```
yarn run v1.22.5
$ node build/app.js
Started local tunnel at https://lazy-eel-4.loca.lt
Example app listening at http://localhost:3000
```

On startup the app will fetch the registered source channels and set the webhooks to point to this app's local tunnel.

**6. (Optional) Handle messages sent from Airy**

Note down the local tunnel url above and [update](https://docs.airy.co/api/source#update-a-source) the action endpoint of your source to `$tunnel_endpoint/action`.

Now you can send messages to Telegram by calling the [Airy send message endpoint](https://airy.co/docs/core/api/endpoints/messages#send). Example:

```shell script
curl --request POST \
  --url http://airy.core/messages.send \
  --header 'Content-Type: application/json' \
  --data '{
	"conversation_id": "999532fe-7e01-53ba-bac3-17f1291f3340",
	"message": {
		"chat_id": 750379379,
		"text": "Hello Telegram, from Airy!"
	}
}'
``` 
