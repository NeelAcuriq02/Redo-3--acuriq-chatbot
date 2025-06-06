import { POST } from './route';
import Anthropic from '@anthropic-ai/sdk';

jest.mock('@anthropic-ai/sdk', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn().mockResolvedValue({
          content: [{ text: 'Hello from Claude' }],
        }),
      },
    })),
  };
});

describe('POST /api/chat', () => {
  it('returns assistant reply', async () => {
    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({ messages: [{ role: 'user', content: 'Hi' }] }),
    });

    const res = await POST(req);
    const json = await res.json();
    expect(json.response).toBe('Hello from Claude');
  });
});
