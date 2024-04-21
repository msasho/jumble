import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { APIGatewayProxyResult } from "aws-lambda";
import * as bitbank from "node-bitbankcc";

const jpyBudget = process.env.JPY_BUDGET ? Number(process.env.JPY_BUDGET) : 1000;
const pair = process.env.PAIR ? process.env.PAIR : "xrp_jpy";

async function getApiKeys() {
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

async function initializePrivateApi() {
    const { apiKey, apiSecret } = await getApiKeys();
    const privateApiConfig = {
        endPoint: "https://api.bitbank.cc/v1",
        apiKey: apiKey,
        apiSecret: apiSecret,
        keepAlive: true,
        timeout: 3000,
    };
    return new bitbank.PrivateApi(privateApiConfig);
}

async function initializePublicApi() {
    const publicApiConfig = {
        endPoint: "https://public.bitbank.cc",
        keepAlive: true,
        timeout: 3000,
    };
    return new bitbank.PublicApi(publicApiConfig);
}

const calculateAmount = async (pair: string) => {
    const publicApi = await initializePublicApi();
    const getCurrentPrice = async (pair: string) => {
        const params: bitbank.GetTransactionsRequest = {
            pair: pair,
        };
        try {
            const response = await publicApi.getTransactions(params);
            return response.data.transactions[0].price;
        } catch (error) {
            console.error("Failed to fetch transactions:", error);
            throw error;
        }
    };
    const currentPrice = Number(await getCurrentPrice(pair));
    const amount = jpyBudget / currentPrice;
    return amount.toFixed(4); // 小数点以下4桁に丸めて数値に戻す
};

/**
 * 新規注文を行う
 */
export const marketOrderHandler = async (): Promise<APIGatewayProxyResult> => {
    const privateApi = await initializePrivateApi();
    const amount = await calculateAmount(pair);
    const params: bitbank.OrderRequest = {
        pair: pair,
        amount: amount,
        // price: '10', 指値の時に使用する
        side: "buy",
        type: "market", // 指値の時はlimitを指定する
    };
    console.log("🚀 ~ marketOrderHandler ~ params:", params);
    try {
        const response = await privateApi.postOrder(params);
        console.log("Order successful:", response);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Order successful", data: response }),
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
 * 出金アカウントを取得する
 */
const getWithdrawalAccount = async (asset: string) => {
    const privateApi = await initializePrivateApi();
    const params: bitbank.WithdrawalAccountRequest = {
        asset: asset,
    };
    const response = await privateApi.getWithdrawalAccount(params);
    console.log("🚀 ~ getWithdrawalAccount ~ response:", response.data);
    return response.data.accounts[0].uuid;
};

/**
 * 出金を行う
 */
export const withdrawalHandler = async (): Promise<APIGatewayProxyResult> => {
    const privateApi = await initializePrivateApi();
    const asset = "xrp";
    const uuid = await getWithdrawalAccount(asset);
    const params: bitbank.WithdrawalRequest = {
        asset: asset,
        uuid: uuid,
        amount: "100", // TODO: 全てに変更する
        otp_token: "", // TODO: 値が不明
        sms_token: "",
    };

    try {
        const response = await await privateApi.requestWithdrawal(params);
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
