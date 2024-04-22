"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_secrets_manager_1 = require("@aws-sdk/client-secrets-manager");
var axios_1 = require("axios");
var crypto = require("crypto");
var jpyBudget = process.env.JPY_BUDGET ? Number(process.env.JPY_BUDGET) : 5000;
var symbol = process.env.PAIR ? process.env.PAIR : "ETH";
var apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("API_KEY environment variable is not set.");
}
var secretKey = process.env.API_SECRET;
if (!secretKey) {
    throw new Error("API_SECRET environment variable is not set.");
}
function getApiKeys() {
    return __awaiter(this, void 0, void 0, function () {
        function getSecret(secretName) {
            return __awaiter(this, void 0, void 0, function () {
                var client, SecretString, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            client = new client_secrets_manager_1.SecretsManagerClient({
                                region: "ap-northeast-1",
                            });
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, client.send(new client_secrets_manager_1.GetSecretValueCommand({
                                    SecretId: secretName,
                                    VersionStage: "AWSCURRENT",
                                }))];
                        case 2:
                            SecretString = (_a.sent()).SecretString;
                            return [2 /*return*/, SecretString ? JSON.parse(SecretString) : null];
                        case 3:
                            error_1 = _a.sent();
                            throw error_1;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        }
        var apiKeySecret, apiSecretSecret;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getSecret("gmoCoin/apiKey")];
                case 1:
                    apiKeySecret = _a.sent();
                    return [4 /*yield*/, getSecret("gmoCoin/secretKey")];
                case 2:
                    apiSecretSecret = _a.sent();
                    if (!apiKeySecret || !apiSecretSecret) {
                        throw new Error("Secrets not found");
                    }
                    return [2 /*return*/, {
                            apiKey: apiKeySecret.apiKey,
                            secretKey: apiSecretSecret.secretKey,
                        }];
            }
        });
    });
}
function getCurrentPrice(symbol) {
    return __awaiter(this, void 0, void 0, function () {
        var endPoint, path, response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    endPoint = 'https://api.coin.z.com/public';
                    path = "/v1/ticker?symbol=".concat(symbol);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.get("".concat(endPoint).concat(path))];
                case 2:
                    response = _a.sent();
                    console.log(JSON.stringify(response.data.data[0]));
                    return [2 /*return*/, response.data.data[0].bid]; // または特定の価格情報のみを返すことも可能
                case 3:
                    error_2 = _a.sent();
                    console.error('Error fetching current price:', error_2);
                    throw error_2; // エラーを再スローして呼び出し元で処理できるようにする
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * 新規注文を行う
 */
function placeOrder() {
    return __awaiter(this, void 0, void 0, function () {
        var currentPrice, amount, timestamp, method, endPoint, path, reqBody, text, sign, options, response, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getCurrentPrice(symbol)];
                case 1:
                    currentPrice = _a.sent();
                    amount = (jpyBudget / Number(currentPrice)).toFixed(4);
                    console.log("🚀 ~ placeOrder ~ amount:", amount);
                    timestamp = Date.now().toString();
                    method = 'POST';
                    endPoint = 'https://api.coin.z.com/private';
                    path = '/v1/order';
                    reqBody = JSON.stringify({
                        symbol: symbol,
                        side: "BUY",
                        executionType: "LIMIT",
                        timeInForce: "FAS",
                        // executionType: "MARKET",
                        price: currentPrice,
                        size: amount
                    });
                    text = timestamp + method + path + reqBody;
                    sign = crypto.createHmac('sha256', secretKey).update(text).digest('hex');
                    options = {
                        headers: {
                            "API-KEY": apiKey,
                            "API-TIMESTAMP": timestamp,
                            "API-SIGN": sign,
                            "Content-Type": "application/json"
                        }
                    };
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, axios_1.default.post(endPoint + path, reqBody, options)];
                case 3:
                    response = _a.sent();
                    console.log("Order successful:", response.data);
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _a.sent();
                    console.error("Order failed:", error_3);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
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
placeOrder();
