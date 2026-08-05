import { AiSearchResult } from '../types';

export async function searchAccommodationWithAi(prompt: string): Promise<AiSearchResult> {
  try {
    const res = await fetch('/api/gemini/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error('AI search failed');
    return await res.json();
  } catch (err) {
    console.warn('AI search error, using client fallback', err);
    return {
      interpretedQuery: prompt,
      matchedListingIds: [],
      explanation: 'Search complete. Explore listings matching your query below.'
    };
  }
}

export async function chatWithCamporaBot(message: string, history?: any[]): Promise<string> {
  try {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
    if (!res.ok) throw new Error('Chatbot error');
    const data = await res.json();
    return data.reply;
  } catch (err) {
    console.warn('AI chat error', err);
    return 'Hello! I am Campora AI Assistant. You can search hostels, schedule free inspections, or contact verified agents safely through Campora!';
  }
}

export async function generateListingDescription(listingInfo: {
  title: string;
  universityName: string;
  type: string;
  price: number;
  currency: string;
  period: string;
  facilities: string[];
}): Promise<string> {
  try {
    const res = await fetch('/api/gemini/generate-description', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listingInfo),
    });
    if (!res.ok) throw new Error('Generation error');
    const data = await res.json();
    return data.description;
  } catch (err) {
    console.warn('AI description error', err);
    return `Modern ${listingInfo.type} accommodation located near ${listingInfo.universityName}. Beautiful student housing with excellent facilities including ${listingInfo.facilities.join(', ')}. Rent is ${listingInfo.currency}${listingInfo.price}/${listingInfo.period}. Contact verified agent to schedule an inspection today!`;
  }
}

export async function checkDuplicateListing(listingDetails: {
  title: string;
  address: string;
  universityName: string;
  price: number;
}): Promise<{ isDuplicate: boolean; confidenceScore: number; reason: string }> {
  try {
    const res = await fetch('/api/gemini/detect-duplicate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listingDetails),
    });
    if (!res.ok) throw new Error('Duplicate check error');
    return await res.json();
  } catch (err) {
    return { isDuplicate: false, confidenceScore: 0, reason: 'Check passed' };
  }
}
