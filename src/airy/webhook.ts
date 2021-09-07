import fetch from "node-fetch";
import {Message, User} from "typegram";

const token = process.env.SOURCE_TOKEN;
if (!token) {
    throw new Error("SOURCE_TOKEN is not set.")
}
const airyHost = process.env.AIRY_HOST;
if (!airyHost) {
    throw new Error("AIRY_HOST is not set.")
}


export const ingestMessage = (sourceChannelId: string, message: Message) => {
    const messages = [{
        "source_message_id": String(message.message_id),
        "source_conversation_id": String(message.chat.id),
        "source_channel_id": sourceChannelId,
        "source_sender_id": String(message.from?.id),
        "content": message, // Source specific content node (can be a plain string)
        "from_contact": true,
        "sent_at": message.date // Unix timestamp of event or ISO8601 date string
    }]

    const metadata: any[] = [];

    if (message.from) {
        metadata.push({
            namespace: "conversation",
            source_id: String(message.chat.id),
            metadata: {
                contact: {
                    display_name: getDisplayName(message.from)
                }
            }
        });
    }

    return fetch(`${airyHost}/sources.webhook`, {
        method: 'post',
        body: JSON.stringify({
            messages,
            metadata
        }),
        headers: {'Content-Type': 'application/json', 'Authorization': token}
    }).then((res) => {
        if (res.ok) { // res.status >= 200 && res.status < 300
            return res;
        } else {
            return Promise.reject(res)
        }
    })
}

function getDisplayName({first_name, last_name}: User) {
    return `${first_name} ${last_name || ''}`.trim();
}
