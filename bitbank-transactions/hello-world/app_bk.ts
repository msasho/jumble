import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { APIGatewayProxyResult } from "aws-lambda";
import axios from "axios";
import * as crypto from "crypto";

const amount = process.env.AMOUNT ? process.env.AMOUNT : "0.1";
const pair = process.env.PAIR ? process.env.PAIR : "xrp_jpy";
// const apiKey = process.env.API_KEY;
// if (!apiKey) {
//     throw new Error("API_KEY environment variable is not set.");
// }
// const apiSecret = process.env.API_SECRET;
// if (!apiSecret) {
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
    const apiKeySecret = await getSecret("bitbank/apiKey");
    const apiSecretSecret = await getSecret("bitbank/apiSecret");
    if (!apiKeySecret || !apiSecretSecret) {
        throw new Error("Secrets not found");
    }
    return {
        apiKey: apiKeySecret.apiKey,
        apiSecret: apiSecretSecret.apiSecret,
    };
}

interface GenerateAccessSignParams {
    nonce: string;
    secret: string;
    body?: string;
    path?: string;
}

const generateAccessSign = ({ nonce, secret, body, path }: GenerateAccessSignParams): string => {
    const message = path ? nonce + path : nonce + body;
    console.log("🚀 ~ generateAccessSign ~ message:", message);
    return crypto.createHmac("sha256", secret).update(message).digest("hex");
};

/**
 * 出金アカウントを取得する
 */
const getWithdrawalAccount = async (asset: string): Promise<string> => {
    const path = "/v1/user/withdrawal_account";
    const { apiKey, apiSecret } = await getApiKeys();
    const nonce = Date.now().toString();
    const queryString = `?asset=${asset}`;
    const accessSign = generateAccessSign({ nonce: nonce, secret: apiSecret, path: path + queryString });
    const headers = {
        "ACCESS-KEY": apiKey,
        "ACCESS-NONCE": nonce,
        "ACCESS-SIGNATURE": accessSign,
    };

    const response = await axios.get(`https://api.bitbank.cc${path}${queryString}`, { headers });
    console.log("🚀 ~ getWithdrawalAccount ~ response:", response.data);
    if (response.data.success === 1 && response.data.data.accounts.length > 0) {
        // 最初のアカウントのUUIDを返す
        return response.data.data.accounts[0].uuid;
    } else {
        throw new Error("No withdrawal accounts found");
    }
};

/**
 * 新規注文を行う
 */
export const marketOrderHandler = async (): Promise<APIGatewayProxyResult> => {
    const path = "/v1/user/spot/order";
    const { apiKey, apiSecret } = await getApiKeys();
    const nonce = Date.now().toString();
    const body = JSON.stringify({
        pair: pair,
        amount: amount,
        // price: '10', 指値の時に使用する
        side: "buy",
        type: "market", // 指値の時はlimitを指定する
    });

    const accessSign = generateAccessSign({ nonce: nonce, secret: apiSecret, body: body });
    const endpoint = `https://api.bitbank.cc${path}`;
    const headers = {
        "ACCESS-KEY": apiKey,
        "ACCESS-NONCE": nonce,
        "ACCESS-SIGNATURE": accessSign,
        "Content-Type": "application/json",
    };

    try {
        const response = await axios.post(endpoint, body, { headers });
        console.log("Order successful:", response.data);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Order successful", data: response.data }),
        };
    } catch (error) {
        console.error("Order failed:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Order failed", error: errorMessage }),
        };
    }
};

/**
 * 出金を行う
 */
export const withdrawalHandler = async (): Promise<APIGatewayProxyResult> => {
    const path = "/v1/user/withdrawal";
    const { apiKey, apiSecret } = await getApiKeys();
    const nonce = Date.now().toString();
    const asset = "xrp";
    const uuid = await getWithdrawalAccount(asset);
    const body = JSON.stringify({
        asset: asset,
        uuid: uuid,
        amount: amount,
    });

    const accessSign = generateAccessSign({ nonce: nonce, secret: apiSecret, body: body });
    const endpoint = `https://api.bitbank.cc${path}`;
    const headers = {
        "ACCESS-KEY": apiKey,
        "ACCESS-NONCE": nonce,
        "ACCESS-SIGNATURE": accessSign,
        "Content-Type": "application/json",
    };

    try {
        const response = await axios.post(endpoint, body, { headers });
        console.log("Withdrawal successful:", response.data);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Withdrawal successful", data: response.data }),
        };
    } catch (error) {
        console.error("Withdrawal failed:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Withdrawal failed", error: errorMessage }),
        };
    }
};

marketOrderHandler();
