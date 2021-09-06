import {Telegraf} from "telegraf";
import {getChannels} from "../components/channels";
import {ingestMessage} from "../components/webhook";
import {getTunnelUrl} from "../config";

interface Bot {
    secretPath: string;
    callback: any;
    sourceChannelId: string;
    bot: Telegraf;
}

let botMap: { [sourceChannelId: string]: Bot } = {}

export const refreshBotMap = async () => {
    const tunnelUrl = await getTunnelUrl();

    const bots: Bot[] = await getChannels()
        .then((channels) => {
            return Promise.all(channels.filter(({metadata}) => !!metadata.token)
                .map((channel) => {
                    return botFromChannel(tunnelUrl, channel)
                }))
        });

    botMap = bots.reduce((acc, it) => {
        acc[it.sourceChannelId] = it;
        return acc;
    }, {});
}

const botFromChannel = (tunnelUrl, channel): Promise<Bot> => {
    const bot = new Telegraf(channel.metadata.token);
    bot.on('message', (ctx) => {
        ingestMessage(channel.source_channel_id, ctx.message)
            .then(() => console.log("Message ingested"))
            .catch((error) => {
                console.error("Failed to ingest message", error)
            })
    });

    const secretPath = `/telegraf/${bot.secretPathComponent()}`;
    return bot.telegram.setWebhook(`${tunnelUrl}${secretPath}`)
        .then(() => ({
            secretPath,
            callback: bot.webhookCallback(secretPath),
            bot,
            sourceChannelId: channel.source_channel_id
        }));
}

export const sendMessage = async (sourceChannelId: string, content: any) => {
    let bot = botMap[sourceChannelId];
    if (!bot) {
        return Promise.reject(`Unknown source channel id ${sourceChannelId}`);
    }
    return bot.bot.telegram.callApi('sendMessage', content)
}

export const addWebhook = async (app) => {
    return refreshBotMap()
        .then(() => {
            app.use((req, res, next) => {
                if (req.method == 'POST') {
                    const bot = Object.values(botMap).find(({secretPath}) => req.url === secretPath);
                    if (!!bot) {
                        bot.callback(req, res, next);
                    }
                }
            })
        });
}
