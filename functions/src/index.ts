/**
 * Import function triggers from their respective submodules:
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onCall} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params"; //v2/paramsとするとインポートエラーになるのでv1で処理
import * as logger from "firebase-functions/logger";
import OpenAI from "openai";

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

// OpenAI クライアントの初期化
let openaiClient: OpenAI | null = null;
const getOpenAI = () => {
    if (!openaiClient) {
        openaiClient = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }
    return openaiClient;
};

// 画像解析関数
export const analyzeImage = onCall(
    {
        timeoutSeconds: 300,
        secrets: [OPENAI_API_KEY],
    },
    async (request) =>
    {
        try {
            const openai = getOpenAI(); // 関数内で初期化済みのクライアントを取得

            const {imageUrl} = request.data;

            if (!imageUrl) {
                throw new Error("画像URLが指定されていません");
            }

            logger.info(`画像の解析リクエスト: ${imageUrl}`);

            const response = await openai.chat.completions.create({
                model: "gpt-4.1", // または利用可能な最新のビジョンモデル
                messages: [
                    {
                        role: "system",
                        content: "与えられた画像を分析し、日本語での詳細な説明と映っている可能性が高いものを5つ提供してください。",
                    },
                    {
                        role: "user",
                        content: [
                            {type: "text", text: "画像を解析します。"},
                            {type: "image_url", image_url: {url: imageUrl}},
                        ],
                    },
                ],
                tools: [
                    {
                        type: "function",
                        function: {
                            name: "analyze_image",
                            description: "画像の分析結果を構造化されたフォーマットで返す",
                            parameters: {
                                type: "object",
                                properties: {
                                    description: {
                                        type: "string",
                                        description: "画像の詳細な説明（日本語）",
                                    },
                                    possibleItems: {
                                        type: "array",
                                        description: "画像に映っている可能性が高いもの5つ",
                                        items: {
                                            type: "string",
                                        },
                                    },
                                },
                                required: ["description", "possibleItems"],
                            },
                        },
                    },
                ],
                tool_choice: {type: "function", function: {name: "analyze_image"}},
            });

            // Tool calling の結果を解析
            const toolCall = response.choices[0].message.tool_calls?.[0];

            if (toolCall && toolCall.function.name === "analyze_image") {
                try {
                    const args = JSON.parse(toolCall.function.arguments || "{}");
                    return {
                        description: args.description || "説明を取得できませんでした",
                        possibleItems: args.possibleItems || [],
                    };
                } catch (e) {
                    logger.error("JSONパースエラー:", e);
                    throw new Error("レスポンスの解析に失敗しました");
                }
            } else {
                // フォールバック: テキスト応答を返す
                return {
                    description: response.choices[0].message.content || "結果を取得できませんでした",
                    possibleItems: [],
                };
            }
        } catch (error) {
            logger.error("画像解析エラー:", error);
            throw new Error(`画像の分析に失敗しました: ${error}`);
        }
    });