import fetch from "node-fetch";

const token = process.env.SOURCE_TOKEN;
if (!token) {
    throw new Error("SOURCE_TOKEN is not set.")
}
const airyHost = process.env.AIRY_HOST;
if (!airyHost) {
    throw new Error("AIRY_HOST is not set.")
}

export interface Channel {
    id: string;
    source_id: string;
    source_channel_id: string;
    metadata: {
        name: string;
        token?: string;
    } & any;
}

export const getChannels = (): Promise<Channel[]> => {
    return fetch(`${airyHost}/sources.channels.list`, {
        method: 'post',
        headers: {'Authorization': token}
    }).then((res) => {
        if (res.ok) { // res.status >= 200 && res.status < 300
            return res.json();
        } else {
            return Promise.reject(res)
        }
    }).then(({data}) => data);
}
