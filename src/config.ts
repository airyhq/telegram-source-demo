import localtunnel from "localtunnel";

const sourceToken = process.env.SOURCE_TOKEN;
if (!sourceToken) {
    throw new Error("SOURCE_TOKEN is not set.")
}

export const airyHost = process.env.AIRY_HOST;
if (!airyHost) {
    throw new Error("AIRY_HOST is not set.")
}

export const port = process.env.PORT || 3000;

let tunnel;

export const getTunnelUrl = () => {
    if (tunnel) {
        return Promise.resolve(tunnel.url);
    }

    return localtunnel({port})
        .then((_tunnel) => {
            tunnel = _tunnel;
            console.info(`Started local tunnel at ${tunnel.url}`);
            tunnel.on('close', () => {
                console.info("Local tunnel was closed. Exiting.")
                process.exit(1);
            });

            return tunnel.url;
        })
}
