import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

// Stellen Sie sicher, dass der OpenAI API-Schlüssel vorhanden ist
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set")
}

// Das Schema ohne das Feld "companionPlants"
const analysisSchema = z.object({
  plantInImage: z.enum(["ja", "nein"]).describe("Ist eine Pflanze im Bild zu sehen? Antworte mit 'ja' oder 'nein'."),
  plantName: z
    .string()
    .describe(
      "Der wissenschaftliche oder gebräuchliche Name der Pflanze. 'Keine Angabe', wenn keine Pflanze vorhanden ist oder sie nicht identifiziert werden kann.",
    ),
  description: z
    .string()
    .describe(
      "Eine kurze, interessante Beschreibung der Pflanze (ca. 2-3 Sätze). 'Keine Angabe', wenn keine Pflanze vorhanden ist.",
    ),
  wateringNeeds: z
    .string()
    .describe(
      "Eine kurze Anleitung, wann die Pflanze gegossen werden muss (z.B. 'Wenn die obersten 2-3 cm der Erde trocken sind'). 'Keine Angabe', wenn unbekannt.",
    ),
  wikipediaUrl: z
    .string()
    .url()
    .or(z.literal("Keine Angabe"))
    .describe(
      "Die vollständige URL zur deutschen Wikipedia-Seite der Pflanze. 'Keine Angabe', wenn keine Seite gefunden wurde.",
    ),
  soilType: z
    .string()
    .describe("Die ideale Erdart für die Pflanze (z.B. 'gut durchlässig, sandig'). 'Keine Angabe', wenn unbekannt."),
  wateringFrequency: z
    .string()
    .describe("Die empfohlene Gießhäufigkeit pro Woche (z.B. '1-2 mal pro Woche'). 'Keine Angabe', wenn unbekannt."),
})

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json()

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "Image URL is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const visionModel = openai("gpt-4o")

    const { object } = await generateObject({
      model: visionModel,
      schema: analysisSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              // Der Prompt ohne die Abfrage nach Topfpartnern
              text: "Du bist ein Experte für Botanik. Analysiere das folgende Bild. Identifiziere die Pflanze und verwende deine Suchfähigkeiten, um die folgenden Informationen zu finden: 1. Eine kurze Beschreibung. 2. Eine Anleitung, wann sie gegossen werden muss. 3. Welche Art von Erde sie benötigt. 4. Die Gießhäufigkeit pro Woche. 5. Den Link zur deutschen Wikipedia-Seite. Gib nur die Informationen zurück, die im Schema gefordert werden.",
            },
            {
              type: "image",
              image: imageUrl,
            },
          ],
        },
      ],
    })

    return new Response(JSON.stringify(object), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error in analysis route:", error)
    return new Response(JSON.stringify({ error: "Failed to analyze image" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
