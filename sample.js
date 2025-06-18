import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import fs from "fs";
import path from "path";

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4-vision-preview";

export async function main() {
    // Read image as base64
    const imagePath = path.resolve("contoso_layout_sketch.jpg");
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString("base64");
    const imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;

    const client = ModelClient(
        endpoint,
        new AzureKeyCredential(token),
    );

    const response = await client.path("/chat/completions").post({
        body: {
            messages: [
                { role: "system", content: "You are a helpful assistant that converts hand-drawn website sketches to HTML and CSS." },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Convert this sketch to a complete HTML and CSS web page. Output only the code." },
                        { type: "image_url", image_url: imageDataUrl }
                    ]
                }
            ],
            temperature: 1.0,
            top_p: 1.0,
            model: model
        }
    });

    if (isUnexpected(response)) {
        throw response.body.error;
    }

    console.log(response.body.choices[0].message.content);
}

main().catch((err) => {
    console.error("The sample encountered an error:", err);
});

