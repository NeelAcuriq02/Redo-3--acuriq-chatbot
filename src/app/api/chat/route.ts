import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: messages,
    });

    // Type assertion to handle the response content
    const content = response.content[0];
    if ('text' in content) {
      return Response.json({ response: content.text });
    } else {
      throw new Error('Unexpected response format from Claude API');
    }
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Failed to get response' }, { status: 500 });
  }
} 