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
                        content: `与えられた画像を分析し、映っている可能性が高いものを3つ抽出してください。
                                それぞれについて、初心者向けの簡単な単語で、日本語と英語のセットを教えてください。
                                結果は以下の形式で返してください。

                                {
                                "possibleItems": [
                                    { "japanese": "犬", "english": "dog" },
                                    { "japanese": "ボール", "english": "ball" },
                                    { "japanese": "木", "english": "tree" }
                                ]
                                }`,
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
                        description: "画像に映っている可能性が高いもの3つ（日本語＋英語の簡単単語）",
                        parameters: {
                          type: "object",
                          properties: {
                            possibleItems: {
                              type: "array",
                              description: "日本語＋英語の単語リスト",
                              items: {
                                type: "object",
                                properties: {
                                  japanese: { type: "string", description: "日本語の単語" },
                                  english: { type: "string", description: "英語の単語（簡単）" },
                                },
                                required: ["japanese", "english"],
                              },
                              minItems: 3,
                              maxItems: 3,
                            },
                          },
                          required: ["possibleItems"],
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