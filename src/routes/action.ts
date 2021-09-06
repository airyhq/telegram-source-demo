import * as express from "express";
import {sendMessage} from "../telegram/bot";

export const actionRouter = express.Router();

/* Airy action endpoint */
actionRouter.post('/action', function ({body}, res, next) {
    const {type, payload} = body;
    console.debug('body', body);

    if (type !== 'message.send') {
        return res.status(400).json({error: `Unsupported action of type ${type}`});
    }
    if (!payload.conversation) {
        return res.status(400).json({error: `There needs to be an existing conversation.`});
    }

    const {source_channel_id} = payload.conversation;
    sendMessage(source_channel_id, payload.message.content)
        .then((response) => {
            console.debug('response', response);
            res.status(200).json({
                source_message_id: String(response.message_id)
            });
        })
        .catch((error: Error) => {
            res.status(400).json({error});
        });
});
