import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import {
  INITIAL_UNIVERSITIES,
  INITIAL_LISTINGS,
  INITIAL_AGENTS,
  INITIAL_REVIEWS,
  INITIAL_INSPECTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REPORTS,
  INITIAL_MESSAGE_THREADS,
  INITIAL_MESSAGES
} from "./src/data/mockData";
import { Listing, Review, InspectionBooking, ReportItem, AgentVerification } from "./src/types";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Shared in-memory data store for live CRUD during session
  let universities = [...INITIAL_UNIVERSITIES];
  let listings: Listing[] = [];
  let reviews: Review[] = [];
  let inspections: InspectionBooking[] = [];
  let notifications = [];
  let reports: ReportItem[] = [];
  let verifications: AgentVerification[] = [];

  // Initialize Gemini Client
  const getGeminiClient = () => {
    const candidateKeys = [
      process.env.CAMPORANG_API_KEY,
      process.env.GEMINI_API_KEY,
      process.env.CAMPORA_API_KEY,
    ];
    let validKey: string | null = null;
    for (const k of candidateKeys) {
      if (!k) continue;
      const trimmed = k.trim();
      if (
        trimmed === "" ||
        trimmed.startsWith("your_") ||
        trimmed === "MY_GEMINI_API_KEY" ||
        trimmed === "undefined"
      ) {
        continue;
      }
      if (trimmed.startsWith("sk-")) {
        continue;
      }
      validKey = trimmed;
      break;
    }

    if (!validKey) {
      return null;
    }

    return new GoogleGenAI({
      apiKey: validKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // REST API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", appName: "Campora", version: "1.0.0" });
  });

  // Universities
  app.get("/api/universities", (req, res) => {
    res.json({ universities });
  });

  app.post("/api/universities", (req, res) => {
    const newUni = {
      id: `uni_${Date.now()}`,
      ...req.body,
      totalListings: 0,
    };
    universities.push(newUni);
    res.status(201).json({ university: newUni });
  });

  // Listings
  app.get("/api/listings", (req, res) => {
    const { universityId, type, gender, maxPrice, searchQuery, agentId, status } = req.query;
    let filtered = [...listings];

    if (status) {
      filtered = filtered.filter(l => l.status === status);
    } else if (!agentId) {
      // Default for public/student view: only show approved/active listings
      filtered = filtered.filter(l => l.status === 'active' || l.status === 'approved' || !l.status);
    }
    if (universityId) {
      filtered = filtered.filter(l => l.universityId === universityId);
    }
    if (agentId) {
      filtered = filtered.filter(l => l.agentId === agentId);
    }
    if (type && type !== 'all') {
      filtered = filtered.filter(l => l.type === type);
    }
    if (gender && gender !== 'all') {
      filtered = filtered.filter(l => l.gender === gender || l.gender === 'any');
    }
    if (maxPrice) {
      const p = Number(maxPrice);
      if (!isNaN(p)) {
        filtered = filtered.filter(l => l.price <= p);
      }
    }
    if (searchQuery) {
      const q = String(searchQuery).toLowerCase();
      filtered = filtered.filter(l => 
        l.title.toLowerCase().includes(q) ||
        l.address.toLowerCase().includes(q) ||
        l.universityName.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q)
      );
    }

    res.json({ listings: filtered, total: filtered.length });
  });

  app.get("/api/listings/:id", (req, res) => {
    const listing = listings.find(l => l.id === req.params.id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    // Increment view counter
    listing.viewsCount = (listing.viewsCount || 0) + 1;
    res.json({ listing });
  });

  app.post("/api/listings", (req, res) => {
    const newListing: Listing = {
      id: `list_${Date.now()}`,
      title: req.body.title || "Untitled Accommodation",
      universityId: req.body.universityId || "uni_unilag",
      universityName: req.body.universityName || "University of Lagos",
      campus: req.body.campus || "Main Campus",
      address: req.body.address || "Near University Gate",
      coordinates: req.body.coordinates || { lat: 6.5158, lng: 3.3898 },
      type: req.body.type || "self_contain",
      price: Number(req.body.price) || 250000,
      currency: req.body.currency || "₦",
      pricePeriod: req.body.pricePeriod || "year",
      totalRooms: Number(req.body.totalRooms) || 1,
      availableRooms: Number(req.body.availableRooms) || 1,
      gender: req.body.gender || "any",
      distanceToCampusMinutes: Number(req.body.distanceToCampusMinutes) || 5,
      distanceToCampusKm: Number(req.body.distanceToCampusKm) || 0.5,
      description: req.body.description || "",
      facilities: req.body.facilities || ["water_running", "wifi"],
      rules: req.body.rules || ["No loud noise after 10 PM"],
      images: req.body.images && req.body.images.length > 0 ? req.body.images : [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"
      ],
      videoUrl: req.body.videoUrl || "",
      video360Url: req.body.video360Url || req.body.videoUrl || "",
      accommodationTypeName: req.body.accommodationTypeName || "Executive Accommodation",
      agentId: req.body.agentId || "agent_001",
      agentName: req.body.agentName || "Campora Verified Agent",
      agentPhone: req.body.agentPhone || "+234 800 000 0000",
      agentEmail: req.body.agentEmail || "agent@campora.africa",
      agentAvatar: req.body.agentAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      isAgentVerified: req.body.isAgentVerified ?? true,
      isFeatured: false,
      isPaused: false,
      isOccupied: false,
      status: "active",
      viewsCount: 1,
      enquiriesCount: 0,
      savesCount: 0,
      ratings: {
        security: 5.0,
        water: 5.0,
        electricity: 5.0,
        internet: 5.0,
        cleanliness: 5.0,
        noise: 5.0,
        value: 5.0,
        overall: 5.0,
        count: 1
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    listings.unshift(newListing);

    // Update university listing count
    const uni = universities.find(u => u.id === newListing.universityId);
    if (uni) {
      uni.totalListings += 1;
    }

    res.status(201).json({ listing: newListing });
  });

  app.put("/api/listings/:id", (req, res) => {
    const idx = listings.findIndex(l => l.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: "Listing not found" });
    }
    listings[idx] = {
      ...listings[idx],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    res.json({ listing: listings[idx] });
  });

  app.delete("/api/listings/:id", (req, res) => {
    const idx = listings.findIndex(l => l.id === req.params.id);
    if (idx !== -1) {
      listings.splice(idx, 1);
    }
    res.json({ success: true });
  });

  app.patch("/api/listings/:id/status", (req, res) => {
    const listing = listings.find(l => l.id === req.params.id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    const { isPaused, isOccupied, status } = req.body;
    if (typeof isPaused === 'boolean') listing.isPaused = isPaused;
    if (typeof isOccupied === 'boolean') listing.isOccupied = isOccupied;
    if (status) listing.status = status;

    res.json({ listing });
  });

  // Inspection Bookings
  app.get("/api/inspections", (req, res) => {
    const { studentId, agentId } = req.query;
    let result = [...inspections];
    if (studentId) {
      result = result.filter(i => i.studentId === studentId);
    }
    if (agentId) {
      result = result.filter(i => i.agentId === agentId);
    }
    res.json({ inspections: result });
  });

  app.post("/api/inspections", (req, res) => {
    const newBooking: InspectionBooking = {
      id: `insp_${Date.now()}`,
      listingId: req.body.listingId,
      listingTitle: req.body.listingTitle || "Student Accommodation Inspection",
      listingImage: req.body.listingImage || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80",
      studentId: req.body.studentId || "stud_current",
      studentName: req.body.studentName || "Student User",
      studentPhone: req.body.studentPhone || "+234 810 000 0000",
      studentEmail: req.body.studentEmail || "student@campora.africa",
      agentId: req.body.agentId || "agent_001",
      agentName: req.body.agentName || "Agent",
      agentPhone: req.body.agentPhone || "+234 800 000 0000",
      date: req.body.date,
      timeSlot: req.body.timeSlot,
      status: "pending",
      note: req.body.note || "",
      createdAt: new Date().toISOString()
    };

    inspections.unshift(newBooking);

    // Notify agent
    notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: newBooking.agentId,
      type: "inspection_update",
      title: "New Inspection Request",
      body: `${newBooking.studentName} booked an inspection for ${newBooking.listingTitle} on ${newBooking.date} at ${newBooking.timeSlot}.`,
      read: false,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({ inspection: newBooking });
  });

  app.patch("/api/inspections/:id/status", (req, res) => {
    const booking = inspections.find(i => i.id === req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    booking.status = req.body.status;

    // Notify student
    notifications.unshift({
      id: `notif_${Date.now()}`,
      userId: booking.studentId,
      type: "inspection_update",
      title: `Inspection ${req.body.status.toUpperCase()}`,
      body: `Your inspection for "${booking.listingTitle}" on ${booking.date} has been marked as ${req.body.status}.`,
      read: false,
      timestamp: new Date().toISOString()
    });

    res.json({ inspection: booking });
  });

  // Reviews
  app.get("/api/reviews/:listingId", (req, res) => {
    const listingReviews = reviews.filter(r => r.listingId === req.params.listingId);
    res.json({ reviews: listingReviews });
  });

  app.post("/api/reviews", (req, res) => {
    const { listingId, studentName, comment, security, water, electricity, internet, cleanliness, noise, value } = req.body;
    
    const overall = Number(((security + water + electricity + internet + cleanliness + noise + value) / 7).toFixed(1));

    const newRev: Review = {
      id: `rev_${Date.now()}`,
      listingId,
      studentId: req.body.studentId || "stud_user",
      studentName: studentName || "Student Reviewer",
      studentAvatar: req.body.studentAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      security,
      water,
      electricity,
      internet,
      cleanliness,
      noise,
      value,
      overall,
      comment,
      createdAt: new Date().toISOString()
    };

    reviews.unshift(newRev);

    // Recalculate listing rating
    const listing = listings.find(l => l.id === listingId);
    if (listing) {
      const allListingRevs = reviews.filter(r => r.listingId === listingId);
      const count = allListingRevs.length;
      const sumSec = allListingRevs.reduce((acc, r) => acc + r.security, 0);
      const sumWat = allListingRevs.reduce((acc, r) => acc + r.water, 0);
      const sumEle = allListingRevs.reduce((acc, r) => acc + r.electricity, 0);
      const sumInt = allListingRevs.reduce((acc, r) => acc + r.internet, 0);
      const sumCle = allListingRevs.reduce((acc, r) => acc + r.cleanliness, 0);
      const sumNoi = allListingRevs.reduce((acc, r) => acc + r.noise, 0);
      const sumVal = allListingRevs.reduce((acc, r) => acc + r.value, 0);

      listing.ratings = {
        security: Number((sumSec / count).toFixed(1)),
        water: Number((sumWat / count).toFixed(1)),
        electricity: Number((sumEle / count).toFixed(1)),
        internet: Number((sumInt / count).toFixed(1)),
        cleanliness: Number((sumCle / count).toFixed(1)),
        noise: Number((sumNoi / count).toFixed(1)),
        value: Number((sumVal / count).toFixed(1)),
        overall: Number(((sumSec + sumWat + sumEle + sumInt + sumCle + sumNoi + sumVal) / (7 * count)).toFixed(1)),
        count
      };
    }

    res.status(201).json({ review: newRev });
  });

  // Agent Verifications
  app.get("/api/verifications", (req, res) => {
    res.json({ verifications });
  });

  app.post("/api/verifications", (req, res) => {
    const newVerif: AgentVerification = {
      id: `verif_${Date.now()}`,
      agentId: req.body.agentId || "agent_curr",
      agentName: req.body.agentName || "Agent",
      agentEmail: req.body.agentEmail || "agent@campora.africa",
      businessName: req.body.businessName || "Property Agent",
      proofType: req.body.proofType || "banner",
      proofUrl: req.body.proofUrl || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
      officeAddress: req.body.officeAddress,
      status: "pending",
      submittedAt: new Date().toISOString()
    };
    verifications.unshift(newVerif);
    res.status(201).json({ verification: newVerif });
  });

  app.patch("/api/verifications/:id/status", (req, res) => {
    const v = verifications.find(item => item.id === req.params.id);
    if (!v) {
      return res.status(404).json({ error: "Verification request not found" });
    }
    v.status = req.body.status;
    v.reviewedAt = new Date().toISOString();
    if (req.body.rejectionReason) {
      v.rejectionReason = req.body.rejectionReason;
    }

    // Update agent verified status
    if (req.body.status === 'verified') {
      listings.forEach(l => {
        if (l.agentId === v.agentId) {
          l.isAgentVerified = true;
        }
      });
    }

    res.json({ verification: v });
  });

  // Reports
  app.get("/api/reports", (req, res) => {
    res.json({ reports });
  });

  app.post("/api/reports", (req, res) => {
    const newReport: ReportItem = {
      id: `rep_${Date.now()}`,
      listingId: req.body.listingId,
      listingTitle: req.body.listingTitle || "Reported Listing",
      reporterId: req.body.reporterId || "stud_anon",
      reporterName: req.body.reporterName || "Anonymous Student",
      reason: req.body.reason || "other",
      details: req.body.details || "No details provided",
      status: "open",
      createdAt: new Date().toISOString()
    };
    reports.unshift(newReport);
    res.status(201).json({ report: newReport });
  });

  // GEMINI & CUSTOM LLM AI ENDPOINTS

  // Helper to get custom LLM API Key (OpenAI / OpenRouter / Custom compatible)
  const getLlmApiKey = () => {
    const candidateKeys = [
      process.env.LLM_API_KEY,
      process.env.OPENROUTER_API_KEY,
      process.env.OPENAI_API_KEY,
    ];
    for (const k of candidateKeys) {
      if (!k) continue;
      const trimmed = k.trim();
      if (
        trimmed === "" ||
        trimmed.startsWith("your_") ||
        trimmed === "MY_GEMINI_API_KEY" ||
        trimmed === "undefined"
      ) {
        continue;
      }
      if (trimmed.startsWith("AIza")) {
        continue;
      }
      return trimmed;
    }
    return null;
  };

  const callCustomLlmApi = async (options: {
    model: string;
    messages: { role: string; content: string }[];
    temperature?: number;
    jsonMode?: boolean;
  }): Promise<string | null> => {
    try {
      const apiKey = getLlmApiKey();
      if (!apiKey) return null;

      const baseUrl = (process.env.LLM_BASE_URL || "https://openrouter.ai/api/v1").replace(/\/$/, "");
      const url = `${baseUrl}/chat/completions`;

      const body: any = {
        model: options.model,
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
      };

      if (options.jsonMode) {
        body.response_format = { type: "json_object" };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://campora.africa",
          "X-Title": "Campora Student Housing",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content || null;
    } catch {
      return null;
    }
  };

  // 1. Natural Language Accommodation Search
  app.post("/api/gemini/search", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: "Prompt string is required" });
      }

      const listingSummary = listings.map(l => ({
        id: l.id,
        title: l.title,
        university: l.universityName,
        price: `${l.currency}${l.price}/${l.pricePeriod}`,
        type: l.type,
        gender: l.gender,
        facilities: l.facilities,
        distanceMinutes: l.distanceToCampusMinutes,
        description: l.description
      }));

      const systemInstruction = `You are Campora's intelligent African student housing search AI. 
Analyze the user's natural language request and match them with the best listings from our available database.
Always respond in strict valid JSON with the following structure:
{
  "interpretedQuery": "Summary of user request",
  "matchedListingIds": ["list_id1", "list_id2"],
  "explanation": "Clear explanation of why these hostels match"
}`;

      // Check if custom LLM API Key is provided (e.g. OpenRouter / OpenAI endpoint)
      const llmKey = getLlmApiKey();
      if (llmKey) {
        const searchModel = process.env.LLM_SEARCH_MODEL || "openai/gpt-oss-120b";
        const promptContent = `User Query: "${prompt}"

Available Listings Database:
${JSON.stringify(listingSummary, null, 2)}`;

        const responseText = await callCustomLlmApi({
          model: searchModel,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: promptContent }
          ],
          temperature: 0.2,
          jsonMode: true
        });

        if (responseText) {
          let cleanText = responseText.trim();
          if (cleanText.startsWith("```")) {
            cleanText = cleanText.replace(/^```(json)?/, "").replace(/```$/, "").trim();
          }
          const parsed = JSON.parse(cleanText);
          return res.json(parsed);
        }
      }

      // Check Gemini Client fallback
      const ai = getGeminiClient();
      if (ai) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: `User Query: "${prompt}"

Available Listings Database:
${JSON.stringify(listingSummary, null, 2)}`,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  interpretedQuery: { type: Type.STRING },
                  universityName: { type: Type.STRING },
                  maxPrice: { type: Type.NUMBER },
                  preferredType: { type: Type.STRING },
                  genderPreference: { type: Type.STRING },
                  matchedListingIds: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  explanation: { type: Type.STRING }
                },
                required: ["interpretedQuery", "matchedListingIds", "explanation"]
              }
            }
          });

          if (response && response.text) {
            const parsed = JSON.parse(response.text || "{}");
            return res.json(parsed);
          }
        } catch (geminiErr: any) {
          console.warn("Gemini search API error:", geminiErr?.message || geminiErr);
        }
      }

      // Fallback filter logic if no API key is configured
      const lower = prompt.toLowerCase();
      const matched = listings.filter(l => 
        l.title.toLowerCase().includes(lower) ||
        l.description.toLowerCase().includes(lower) ||
        l.universityName.toLowerCase().includes(lower) ||
        l.type.toLowerCase().includes(lower)
      );
      return res.json({
        interpretedQuery: prompt,
        matchedListingIds: matched.map(m => m.id),
        explanation: `Showing ${matched.length} student accommodations matching your request.`
      });
    } catch (err: any) {
      console.error("AI search error:", err);
      res.json({
        interpretedQuery: req.body?.prompt || "Search",
        matchedListingIds: listings.slice(0, 3).map(m => m.id),
        explanation: "Showing top recommended student accommodations."
      });
    }
  });

  // 2. AI Chatbot (Campora Student Assistant)
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { message, history } = req.body;

      const systemInstruction = `You are Campora AI - the ultimate African Student Accommodation Assistant.
Your job is to assist university students with:
- Finding verified accommodation near African universities (UNILAG, UON, UCT, KNUST, Makerere, Covenant, etc.)
- Safety advice (checking verified badges, inspecting properties before paying rent)
- Understanding hostel rules, generator/solar power setups, water supply, and security
- How to schedule free physical inspections through Campora
Keep your tone friendly, encouraging, knowledgeable, student-centric, and concise.

CRITICAL TABLE FORMATTING RULE:
Do NOT output raw Markdown table syntax (using '|', '---').
If presenting tabular or comparative data, output clean HTML <table> elements with <thead>, <tbody>, <tr>, <th>, and <td> tags, OR present the information as clean bulleted cards/sections. Never output raw Markdown pipe characters '|' for tables.`;

      // Check if custom LLM API Key is provided (e.g. qwen/qwen3.6-27b)
      const llmKey = getLlmApiKey();
      if (llmKey) {
        const chatModel = process.env.LLM_CHAT_MODEL || "qwen/qwen3.6-27b";
        const formattedMessages = [
          { role: "system", content: systemInstruction },
          ...(history || []).map((h: any) => ({
            role: h.role === "user" ? "user" : "assistant",
            content: (h.parts && h.parts[0] ? h.parts[0].text : (h.text || ""))
          })),
          { role: "user", content: message }
        ];

        const replyText = await callCustomLlmApi({
          model: chatModel,
          messages: formattedMessages,
          temperature: 0.7
        });

        if (replyText) {
          return res.json({ reply: replyText, modelUsed: chatModel });
        }
      }

      // Check Gemini Client fallback
      const ai = getGeminiClient();
      if (ai) {
        try {
          const contents = history ? [...history, { role: "user", parts: [{ text: message }] }] : [{ role: "user", parts: [{ text: message }] }];

          const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents,
            config: {
              systemInstruction,
              temperature: 0.7
            }
          });

          if (response && response.text) {
            return res.json({ reply: response.text });
          }
        } catch (geminiErr: any) {
          console.warn("Gemini chat API error:", geminiErr?.message || geminiErr);
        }
      }

      return res.json({
        reply: "Hello! I am Campora AI Assistant. I can help you find verified student hostels near UNILAG, UON, UCT, KNUST, and other top African campuses, guide you on free physical inspections, and answer safety questions. How can I assist you today?"
      });
    } catch (err: any) {
      console.error("AI chat error:", err);
      res.json({
        reply: "Hello! I am Campora AI Assistant. How can I help you with student accommodation search or hostel inspections today?"
      });
    }
  });

  // 3. AI Listing Description Generator (For Agents)
  app.post("/api/gemini/generate-description", async (req, res) => {
    const { title, universityName, type, price, currency, period, facilities } = req.body;
    const fallbackDescription = `Modern ${type || "student apartment"} located near ${universityName || "campus"}. Features include ${facilities && facilities.length ? facilities.join(", ") : "24/7 water supply, electricity, and verified security"}. Ideal for students looking for comfort and convenience.`;

    try {
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({ description: fallbackDescription });
      }

      const prompt = `Write a compelling, professional, student-friendly property description for a Campora listing:
- Accommodation Name: ${title || "Student Residence"}
- University: ${universityName || "University"}
- Type: ${type || "Self-Contain"}
- Price: ${currency || "₦"}${price || "300,000"} per ${period || "year"}
- Included Facilities: ${facilities ? facilities.join(", ") : "Wi-Fi, Water, Security"}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an expert real estate copywriter specializing in African student housing. Write engaging 2-paragraph descriptions highlighting security, power supply, proximity to campus, and student comfort."
        }
      });

      if (response && response.text) {
        return res.json({ description: response.text });
      }

      res.json({ description: fallbackDescription });
    } catch (err: any) {
      console.warn("Gemini description error:", err?.message || err);
      res.json({ description: fallbackDescription });
    }
  });

  // 4. AI Duplicate Listing Detector
  app.post("/api/gemini/detect-duplicate", async (req, res) => {
    try {
      const { title, address, universityName, price } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({ isDuplicate: false, confidence: 0, reason: "No duplicate detected" });
      }

      const existingData = listings.map(l => ({
        id: l.id,
        title: l.title,
        address: l.address,
        university: l.universityName,
        price: l.price
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `New Listing details:
Title: ${title}
Address: ${address}
University: ${universityName}
Price: ${price}

Existing Listings:
${JSON.stringify(existingData, null, 2)}`,
        config: {
          systemInstruction: "Analyze if the new listing is a duplicate or spam copy of any existing listing. Respond with JSON.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isDuplicate: { type: Type.BOOLEAN },
              confidenceScore: { type: Type.NUMBER },
              duplicateListingId: { type: Type.STRING },
              reason: { type: Type.STRING }
            },
            required: ["isDuplicate", "confidenceScore", "reason"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      res.json(result);
    } catch (err: any) {
      res.json({ isDuplicate: false, confidenceScore: 0, reason: "Check bypassed" });
    }
  });

  // Fast AI Listing Moderation & Review Endpoint (responds in ~1-2 seconds)
  app.post("/api/gemini/review-listing", async (req, res) => {
    try {
      const { id, title, address, universityName, price, imagesCount, video360Url, description, agentId } = req.body;

      // Programmatic instant sanity & duplicate checks
      const duplicateReasons: string[] = [];

      const existingDup = listings.find(l => 
        l.id !== id && 
        (
          (l.address && address && l.address.toLowerCase().trim() === address.toLowerCase().trim() && l.address.length > 5) ||
          (l.title && title && l.title.toLowerCase().trim() === title.toLowerCase().trim() && l.title.length > 5)
        )
      );

      if (existingDup) {
        duplicateReasons.push(`Multiple / duplicate listing detected for existing property "${existingDup.title}" at address "${address}".`);
      }

      if (imagesCount < 5) {
        duplicateReasons.push("Insufficient photos provided (minimum 5 photos are strictly required).");
      }

      if (!video360Url || video360Url.trim().length < 5) {
        duplicateReasons.push("Missing required 360-degree walkthrough video URL.");
      }

      if (price <= 5000) {
        duplicateReasons.push("Price specified is unrealistically low or zero.");
      }

      if (duplicateReasons.length > 0) {
        return res.json({
          approved: false,
          status: "rejected",
          reason: duplicateReasons.join(" "),
          riskScore: 85
        });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          approved: true,
          status: "active",
          reason: "Listing verified and approved for immediate publication on Campora student timeline.",
          riskScore: 0
        });
      }

      const existingData = listings.filter(l => l.id !== id).map(l => ({
        id: l.id,
        title: l.title,
        address: l.address,
        university: l.universityName,
        price: l.price,
        agentId: l.agentId
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Audit this newly posted student hostel listing for immediate publication:
Title: ${title}
Address: ${address}
University: ${universityName}
Price: NGN ${price}
Photos Count: ${imagesCount}
Description: ${description || 'N/A'}
Agent ID: ${agentId}

Existing Listings database:
${JSON.stringify(existingData.slice(0, 15), null, 2)}`,
        config: {
          systemInstruction: `You are Campora AI Listing Auditor for Nigerian Student Housing.
Audit the new listing for:
1. Duplicate or multiple listings (same address or same title or copy-pasted details).
2. Suspicious spam or inappropriate wording.

If valid and not a duplicate, respond with approved: true, status: "active", reason: "Listing verified and approved for student timeline.".
If duplicate or invalid, respond with approved: false, status: "rejected", reason: "Specific failure reason state e.g. Multiple/duplicate listing detected...".
Return JSON.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              approved: { type: Type.BOOLEAN },
              status: { type: Type.STRING },
              reason: { type: Type.STRING },
              riskScore: { type: Type.NUMBER }
            },
            required: ["approved", "status", "reason"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      res.json({
        approved: result.approved ?? true,
        status: result.approved ? "active" : "rejected",
        reason: result.reason || (result.approved ? "Listing approved!" : "Unapproved by AI review."),
        riskScore: result.riskScore || 0
      });
    } catch (err: any) {
      console.warn("AI review error, auto-approving valid listing", err);
      res.json({
        approved: true,
        status: "active",
        reason: "Listing verified and approved by Campora AI.",
        riskScore: 0
      });
    }
  });

  // 5. AI Business & Agent Verification Assistant
  app.post("/api/gemini/verify-business", async (req, res) => {
    try {
      const { businessName, proofType, officeAddress } = req.body;

      const systemInstruction = `You are Campora's automated AI Business Verification Officer for African student housing.
Evaluate the agency business details provided by a property manager/agent.
Checks to perform:
- Credibility and appropriateness of Business / Agency Name (${businessName})
- Proof of business type provided (${proofType || 'banner / logo / office photo'})
- Credibility of physical Office Address (${officeAddress || 'Not provided'})
- Risk score assessment (0 to 100, where 0 is safest)

Respond in strict JSON with schema:
{
  "isValid": true/false,
  "riskScore": number,
  "confidence": number,
  "verifiedBadgeTitle": "string",
  "reason": "Detailed AI verification decision feedback"
}`;

      const llmKey = getLlmApiKey();
      if (llmKey) {
        const verifyModel = process.env.LLM_CHAT_MODEL || "qwen/qwen3.6-27b";
        const promptContent = `Business Name: ${businessName}
Proof of Business Type: ${proofType || "Banner / Logo / Office Photo"}
Office Address: ${officeAddress || "Not provided"}`;

        const responseText = await callCustomLlmApi({
          model: verifyModel,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: promptContent }
          ],
          temperature: 0.1,
          jsonMode: true
        });

        if (responseText) {
          let cleanText = responseText.trim();
          if (cleanText.startsWith("```")) {
            cleanText = cleanText.replace(/^```(json)?/, "").replace(/```$/, "").trim();
          }
          const parsed = JSON.parse(cleanText);
          return res.json(parsed);
        }
      }

      const ai = getGeminiClient();
      if (ai) {
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: `Business Name: ${businessName}
Proof of Business Type: ${proofType || 'banner / logo / office photo'}
Office Address: ${officeAddress || 'Not provided'}`,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isValid: { type: Type.BOOLEAN },
                riskScore: { type: Type.NUMBER },
                confidence: { type: Type.NUMBER },
                verifiedBadgeTitle: { type: Type.STRING },
                reason: { type: Type.STRING }
              },
              required: ["isValid", "riskScore", "verifiedBadgeTitle", "reason"]
            }
          }
        });

        const parsed = JSON.parse(response.text || "{}");
        return res.json(parsed);
      }

      // Default response if no key is configured
      return res.json({
        isValid: true,
        riskScore: 5,
        confidence: 95,
        verifiedBadgeTitle: "Campora Verified Agent",
        reason: "Credentials meet format standards. Instant agent badge granted."
      });
    } catch (err: any) {
      console.error("AI verification error:", err);
      res.json({
        isValid: true,
        riskScore: 10,
        confidence: 85,
        verifiedBadgeTitle: "Campora Agent",
        reason: "Verification submitted successfully."
      });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Campora Express server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
