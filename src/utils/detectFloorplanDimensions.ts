export interface DetectedDimensions {
  widthFt: number;
  heightFt: number;
}

const PROMPT = `You are analyzing an architectural floorplan image.

Look for any printed dimension annotations — numbers labeling wall lengths, room sizes, or overall plan extents (e.g. "14'", "3.5m", "120\\"", "4500mm").

From those annotations, calculate the total overall width (left-to-right) and total overall height (top-to-bottom) of the entire floorplan.

Rules:
- If dimensions are in meters, convert to feet (1m = 3.28084ft).
- If dimensions are in inches or millimeters, convert to feet.
- If the floorplan shows a single room with labeled dimensions, use those directly.
- If multiple rooms share a wall, do not double-count.
- Only include structural walls, not furniture or fixtures.

Respond with ONLY a raw JSON object — no markdown, no explanation:
{"widthFt": <number>, "heightFt": <number>}

If you cannot confidently determine the dimensions from visible annotations, respond with ONLY:
{"error": "no dimensions"}`;

export async function detectFloorplanDimensions(
  dataUrl: string,
  apiKey: string,
): Promise<DetectedDimensions | null> {
  // Anthropic vision API only supports jpeg, png, gif, webp
  const mimeMatch = dataUrl.match(/^data:([^;]+);base64,/);
  if (!mimeMatch) return null;
  const mediaType = mimeMatch[1];
  if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mediaType)) return null;

  const base64Data = dataUrl.split(',')[1];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-6',
      max_tokens: 64,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64Data },
            },
            { type: 'text', text: PROMPT },
          ],
        },
      ],
    }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);

  const json = await response.json();
  const text: string = json.content?.find((b: { type: string }) => b.type === 'text')?.text?.trim() ?? '';

  // Strip any accidental markdown fences
  const cleaned = text.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleaned);

  if (parsed.error || typeof parsed.widthFt !== 'number' || typeof parsed.heightFt !== 'number') {
    return null;
  }

  return {
    widthFt: Math.max(1, Math.round(parsed.widthFt * 10) / 10),
    heightFt: Math.max(1, Math.round(parsed.heightFt * 10) / 10),
  };
}
