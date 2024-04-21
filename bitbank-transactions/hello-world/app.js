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
exports.withdrawalHandler = exports.marketOrderHandler = void 0;
var client_secrets_manager_1 = require("@aws-sdk/client-secrets-manager");
var bitbank = require("node-bitbankcc");
var jpyBudget = process.env.JPY_BUDGET ? Number(process.env.JPY_BUDGET) : 1000;
var pair = process.env.PAIR ? process.env.PAIR : "xrp_jpy";
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
                case 0: return [4 /*yield*/, getSecret("bitbank/apiKey")];
                case 1:
                    apiKeySecret = _a.sent();
                    return [4 /*yield*/, getSecret("bitbank/apiSecret")];
                case 2:
                    apiSecretSecret = _a.sent();
                    if (!apiKeySecret || !apiSecretSecret) {
                        throw new Error("Secrets not found");
                    }
                    return [2 /*return*/, {
                            apiKey: apiKeySecret.apiKey,
                            apiSecret: apiSecretSecret.apiSecret,
                        }];
            }
        });
    });
}
function initializePrivateApi() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, apiKey, apiSecret, privateApiConfig;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getApiKeys()];
                case 1:
                    _a = _b.sent(), apiKey = _a.apiKey, apiSecret = _a.apiSecret;
                    privateApiConfig = {
                        endPoint: "https://api.bitbank.cc/v1",
                        apiKey: apiKey,
                        apiSecret: apiSecret,
                        keepAlive: true,
                        timeout: 3000,
                    };
                    return [2 /*return*/, new bitbank.PrivateApi(privateApiConfig)];
            }
        });
    });
}
function initializePublicApi() {
    return __awaiter(this, void 0, void 0, function () {
        var publicApiConfig;
        return __generator(this, function (_a) {
            publicApiConfig = {
                endPoint: "https://public.bitbank.cc",
                keepAlive: true,
                timeout: 3000,
            };
            return [2 /*return*/, new bitbank.PublicApi(publicApiConfig)];
        });
    });
}
var calculateAmount = function (pair) { return __awaiter(void 0, void 0, void 0, function () {
    var publicApi, getCurrentPrice, currentPrice, _a, amount;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, initializePublicApi()];
            case 1:
                publicApi = _b.sent();
                getCurrentPrice = function (pair) { return __awaiter(void 0, void 0, void 0, function () {
                    var params, response, error_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                params = {
                                    pair: pair,
                                };
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, publicApi.getTransactions(params)];
                            case 2:
                                response = _a.sent();
                                return [2 /*return*/, response.data.transactions[0].price];
                            case 3:
                                error_2 = _a.sent();
                                console.error("Failed to fetch transactions:", error_2);
                                throw error_2;
                            case 4: return [2 /*return*/];
                        }
                    });
                }); };
                _a = Number;
                return [4 /*yield*/, getCurrentPrice(pair)];
            case 2:
                currentPrice = _a.apply(void 0, [_b.sent()]);
                console.log("🚀 ~ calculateAmount ~ currentPrice:", currentPrice);
                console.log("🚀 ~ calculateAmount ~ jpyBudget:", jpyBudget);
                amount = jpyBudget / currentPrice;
                return [2 /*return*/, amount.toFixed(4)]; // 小数点以下4桁に丸めて数値に戻す
        }
    });
}); };
/**
 * 新規注文を行う
 */
var marketOrderHandler = function () { return __awaiter(void 0, void 0, void 0, function () {
    var privateApi, amount, params, response, error_3, errorMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, initializePrivateApi()];
            case 1:
                privateApi = _a.sent();
                return [4 /*yield*/, calculateAmount(pair)];
            case 2:
                amount = _a.sent();
                params = {
                    pair: pair,
                    amount: amount,
                    // price: '10', 指値の時に使用する
                    side: "buy",
                    type: "market", // 指値の時はlimitを指定する
                };
                console.log("🚀 ~ marketOrderHandler ~ params:", params);
                _a.label = 3;
            case 3:
                _a.trys.push([3, 5, , 6]);
                return [4 /*yield*/, privateApi.postOrder(params)];
            case 4:
                response = _a.sent();
                console.log("Order successful:", response);
                return [2 /*return*/, {
                        statusCode: 200,
                        body: JSON.stringify({ message: "Order successful", data: response }),
                    }];
            case 5:
                error_3 = _a.sent();
                console.error("Order failed:", error_3);
                errorMessage = error_3 instanceof Error ? error_3.message : "Unknown error";
                return [2 /*return*/, {
                        statusCode: 500,
                        body: JSON.stringify({ message: "Order failed", error: errorMessage }),
                    }];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.marketOrderHandler = marketOrderHandler;
/**
 * 出金アカウントを取得する
 */
var getWithdrawalAccount = function (asset) { return __awaiter(void 0, void 0, void 0, function () {
    var privateApi, params, response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, initializePrivateApi()];
            case 1:
                privateApi = _a.sent();
                params = {
                    asset: asset,
                };
                return [4 /*yield*/, privateApi.getWithdrawalAccount(params)];
            case 2:
                response = _a.sent();
                console.log("🚀 ~ getWithdrawalAccount ~ response:", response.data);
                return [2 /*return*/, response.data.accounts[0].uuid];
        }
    });
}); };
/**
 * 出金を行う
 */
var withdrawalHandler = function () { return __awaiter(void 0, void 0, void 0, function () {
    var privateApi, asset, uuid, params, response, error_4, errorMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, initializePrivateApi()];
            case 1:
                privateApi = _a.sent();
                asset = "xrp";
                return [4 /*yield*/, getWithdrawalAccount(asset)];
            case 2:
                uuid = _a.sent();
                params = {
                    asset: asset,
                    uuid: uuid,
                    amount: "100", // TODO: 全てに変更する
                    otp_token: "", // TODO: 値が不明
                    sms_token: "",
                };
                _a.label = 3;
            case 3:
                _a.trys.push([3, 6, , 7]);
                return [4 /*yield*/, privateApi.requestWithdrawal(params)];
            case 4: return [4 /*yield*/, _a.sent()];
            case 5:
                response = _a.sent();
                console.log("Withdrawal successful:", response.data);
                return [2 /*return*/, {
                        statusCode: 200,
                        body: JSON.stringify({ message: "Withdrawal successful", data: response.data }),
                    }];
            case 6:
                error_4 = _a.sent();
                console.error("Withdrawal failed:", error_4);
                errorMessage = error_4 instanceof Error ? error_4.message : "Unknown error";
                return [2 /*return*/, {
                        statusCode: 500,
                        body: JSON.stringify({ message: "Withdrawal failed", error: errorMessage }),
                    }];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.withdrawalHandler = withdrawalHandler;
calculateAmount("xrp_jpy");
