import { RaindropCollection, RaindropItem } from '../types';

const BASE_URL = 'https://api.raindrop.io';
const RATE_LIMIT_MS = 500;

export class RaindropAPI {
  private token: string;
  private lastRequestTime = 0;

  constructor(token: string) {
    this.token = token;
  }

  private async rateLimitedFetch(url: string): Promise<Response> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < RATE_LIMIT_MS) {
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS - elapsed));
    }
    this.lastRequestTime = Date.now();
    return fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });
  }

  async getCollections(): Promise<RaindropCollection[]> {
    const [rootRes, childRes] = await Promise.all([
      this.rateLimitedFetch(`${BASE_URL}/rest/v1/collections`),
      this.rateLimitedFetch(`${BASE_URL}/rest/v1/collections/childrens`),
    ]);

    const rootData = await rootRes.json();
    const childData = await childRes.json();

    const root: RaindropCollection[] = rootData.items ?? [];
    const children: RaindropCollection[] = childData.items ?? [];

    return [...root, ...children];
  }

  async getRaindrops(
    collectionId: number,
    page: number
  ): Promise<{ items: RaindropItem[]; count: number }> {
    const url = `${BASE_URL}/rest/v1/raindrops/${collectionId}?perpage=50&page=${page}`;
    const res = await this.rateLimitedFetch(url);
    const data = await res.json();
    return {
      items: data.items ?? [],
      count: data.count ?? 0,
    };
  }
}
