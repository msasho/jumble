import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import axios from "axios";
import * as crypto from "crypto";

const jpyBudget = process.env.JPY_BUDGET ? Number(process.env.JPY_BUDGET) : 5000;
const symbol = process.env.SYMBOL ? process.env.SYMBOL : "ETH";
// const apiKey = process.env.API_KEY;
// if (!apiKey) {
//     throw new Error("API_KEY environment variable is not set.");
// }
// const secretKey = process.env.API_SECRET;
// if (!secretKey) {
//     throw new Error("API_SECRET environment variable is not set.");
// }

async function getSecret(secretName: string) {
    const client = new SecretsManagerClient({
        region: "ap-northeast-1",
    });
    try {
        const { SecretString } = await client.send(
            new GetSecretValueCommand({
                SecretId: secretName,
                VersionStage: "AWSCURRENT",
            }),
        );
        return SecretString ? JSON.parse(SecretString) : null;
    } catch (error) {
        throw error;
    }
}

async function getApiKeys() {
    const apiKey = await getSecret("gmo/apiKey");
    const secretKey = await getSecret("gmo/secretKey");
    if (!apiKey || !secretKey) {
        throw new Error("Secrets not found");
    }
    return {
        apiKey: apiKey.apiKey,
        secretKey: secretKey.secretKey,
    };
}

async function getSlackWebhookUrl() {
    const slackWebhookSecret = await getSecret("slack/webhookUrl");
    if (!slackWebhookSecret) {
        throw new Error("Slack Webhook URL not found");
    }
    return slackWebhookSecret.url;
}

/**
 * 現在の価格を取得する
 * @param symbol 取引ペアのシンボル（例: "ETH"）
 */
interface TickerResponse {
    status: number;
    data: Array<{
        ask: string;
        bid: string;
        high: string;
        last: string;
        low: string;
        symbol: string;
        timestamp: string;
        volume: string;
    }>;
    responsetime: string;
}

async function getCurrentPrice(symbol: string) {
    const endPoint = "https://api.coin.z.com/public";
    const path = `/v1/ticker?symbol=${symbol}`;

    try {
        const response = await axios.get<TickerResponse>(`${endPoint}${path}`);
        console.log(JSON.stringify(response.data.data[0]));
        return response.data.data[0].bid; // または特定の価格情報のみを返すことも可能
    } catch (error) {
        console.error("Error fetching current price:", error);
        throw error; // エラーを再スローして呼び出し元で処理できるようにする
    }
}

/**
 * 新規注文を行う
 */
export async function placeOrder() {
    const { apiKey, secretKey } = await getApiKeys();
    const currentPrice = await getCurrentPrice(symbol);
    let decimalPlaces;
    if (symbol === "SOL") {
        decimalPlaces = 2;
    } else {
        decimalPlaces = 4; // Applies to both ETH and BTC
    }
    const amount = (jpyBudget / Number(currentPrice)).toFixed(decimalPlaces);
    console.log("🚀 ~ placeOrder ~ amount:", amount);

    const timestamp = Date.now().toString();
    const method = "POST";
    const endPoint = "https://api.coin.z.com/private";
    const path = "/v1/order";
    const reqBody = JSON.stringify({
        symbol: symbol,
        side: "BUY",
        executionType: "LIMIT",
        timeInForce: "FAS",
        // executionType: "MARKET",  // 成行で注文する場合は上のtimeInForce, executionTypeををコメントアウトする
        price: currentPrice,
        size: amount,
    });

    const text = timestamp + method + path + reqBody;
    const sign = crypto.createHmac("sha256", secretKey).update(text).digest("hex");
    const options = {
        headers: {
            "API-KEY": apiKey,
            "API-TIMESTAMP": timestamp,
            "API-SIGN": sign,
            "Content-Type": "application/json",
        },
    };

    try {
        const response = await axios.post(endPoint + path, reqBody, options);
        console.log("Order successful:", response.data);

        // Send Slack notification
        await sendSlackNotification(
            `Order placed successfully for ${symbol}. Amount: ${amount}, Price: ${currentPrice}`,
        );
    } catch (error) {
        console.error("Order failed:", error);

        // Send Slack notification for failed order
        await sendSlackNotification(
            `Order failed for ${symbol}. Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
    }
}

/**
 * Slack通知を行う
 */
export async function sendSlackNotification(message: string) {
    const slackWebhookUrl = await getSlackWebhookUrl();

    if (!slackWebhookUrl) {
        console.error("Slack Webhook URL is not set");
        throw new Error("Slack Webhook URL is not set");
    }

    try {
        const slackMessage = {
            text: message,
        };

        await axios.post(slackWebhookUrl, slackMessage);
        console.log("Message sent to Slack successfully");
    } catch (error) {
        console.error("Failed to send message to Slack:", error);
        throw error;
    }
}

/**
 * 出金アカウントを取得する
 */
// const getWithdrawalAccount = async (asset: string): Promise<string> => {
//     const path = "/v1/user/withdrawal_account";
//     const { apiKey, apiSecret } = await getApiKeys();
//     const nonce = Date.now().toString();
//     const queryString = `?asset=${asset}`;
//     const accessSign = generateAccessSign({ nonce: nonce, secret: apiSecret, path: path + queryString });
//     const headers = {
//         "ACCESS-KEY": apiKey,
//         "ACCESS-NONCE": nonce,
//         "ACCESS-SIGNATURE": accessSign,
//     };

//     const response = await axios.get(`https://api.bitbank.cc${path}${queryString}`, { headers });
//     console.log("🚀 ~ getWithdrawalAccount ~ response:", response.data);
//     if (response.data.success === 1 && response.data.data.accounts.length > 0) {
//         // 最初のアカウントのUUIDを返す
//         return response.data.data.accounts[0].uuid;
//     } else {
//         throw new Error("No withdrawal accounts found");
//     }
// };

// /**
//  * 出金を行う
//  */
// export const withdrawalHandler = async (): Promise<APIGatewayProxyResult> => {
//     const path = "/v1/user/withdrawal";
//     const { apiKey, apiSecret } = await getApiKeys();
//     const nonce = Date.now().toString();
//     const asset = "xrp";
//     const uuid = await getWithdrawalAccount(asset);
//     const body = JSON.stringify({
//         asset: asset,
//         uuid: uuid,
//         amount: amount,
//     });

//     const accessSign = generateAccessSign({ nonce: nonce, secret: apiSecret, body: body });
//     const endpoint = `https://api.bitbank.cc${path}`;
//     const headers = {
//         "ACCESS-KEY": apiKey,
//         "ACCESS-NONCE": nonce,
//         "ACCESS-SIGNATURE": accessSign,
//         "Content-Type": "application/json",
//     };

//     try {
//         const response = await axios.post(endpoint, body, { headers });
//         console.log("Withdrawal successful:", response.data);
//         return {
//             statusCode: 200,
//             body: JSON.stringify({ message: "Withdrawal successful", data: response.data }),
//         };
//     } catch (error) {
//         console.error("Withdrawal failed:", error);
//         const errorMessage = error instanceof Error ? error.message : "Unknown error";
//         return {
//             statusCode: 500,
//             body: JSON.stringify({ message: "Withdrawal failed", error: errorMessage }),
//         };
//     }
// };

// placeOrder();
