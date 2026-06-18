const express = require('express');
const cors = require('cors');
require('dotenv').config();
const Chat = require('./models/Chat');
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require("@google/generative-ai"); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;


// Mongoose connection options
const connectDB = async () => {
    try { 
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000, // 30 second tak try karega
            socketTimeoutMS: 45000,
        });
        console.log('✅ Connected to MongoDB Atlas');
    } catch (err) {
        console.error('❌ DB Connection Error:', err.message);
        process.exit(1); // Agar connect na ho toh app stop ho jaye (taaki pata chale error kya hai)
    }
};

connectDB();
// USER SCHEMA (YE ADD KIYA)
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

// Setup Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log("API KEY EXISTS:", !!process.env.GEMINI_API_KEY);

// 🔒 Security & Data Middlewares
app.use(express.json());
app.use(cors());

// 🗄️ Database Repository Grid (Shared Central Registry)
const BLACK_COBRA_DB = {
  products: [
    { 
      id: 'p1', 
      name: "Platinum BWP PWP Plywood", 
      intro: "Black Cobra Platinum is our flagship ultra-premium marine-grade plywood engineered for high-end heavy interior applications exposed to extreme moisture.",
      specs: [
        { key: "Standard", val: "IS:710 Marine Grade Certified" },
        { key: "Composition", val: "100% Selected Gurjan Core Layers" },
        { key: "Testing", val: "108 Hours Boiling Water Test Compliant" },
        { key: "Density", val: "> 820 kg/m³ Ultra High Density Matrix" }
      ],
      pricing: "• 6mm Calibrated: ₹115 / sq.ft.\n• 12mm Core-Lock: ₹165 / sq.ft.\n• 19mm Heavy Duty: ₹240 / sq.ft.",
      buyUrl: "https://www.blackcobra.org/contact-us"
    },
    { 
      id: 'p2', 
      name: "Gold Club BWR Plywood", 
      intro: "Gold Club series delivers high moisture-resistance combined with structural flexibility, making it perfect for premium domestic furnishings.",
      specs: [
        { key: "Standard", val: "IS:303 Moisture Resistant Profile" },
        { key: "Composition", val: "Calibrated Premium Hardwood & Poplar" }
      ],
      pricing: "• 6mm Architectural: ₹85 / sq.ft.\n• 12mm Multi-Layer: ₹125 / sq.ft.\n• 19mm Load-Bearing: ₹165 / sq.ft.",
      buyUrl: "https://www.blackcobra.org/contact-us"
    }
  ],
  plants: [
    { id: 'pl1', name: "Plant 1 (Yamunanagar, HR)", details: "🏭 Focus: Base core peeling, laser logs sorting, and primary calibration processing.\n📈 Capacity: 15,000 sheets/day.", map: "http://maps.google.com/?q=Yamunanagar" }
  ]
};



app.post('/api/auth/signup', async (req, res) => {
  console.log("SIGNUP HIT:", req.body);

  try {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered in DB"
    });

  }
   catch (err) {
    console.log("SIGNUP ERROR:", err);

    res.status(400).json({
      error: "Email already exists"
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  console.log("LOGIN HIT:", req.body);

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        error: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid password"
      });
    }

    res.status(200).json({
      status: "Authenticated",
      email: user.email
    });

  } catch (err) {
    console.log("LOGIN ERROR:", err);

    res.status(500).json({
      error: "Server error"
    });
  }
});

// 📈 Endpoint 1: Base Operational Status Diagnostics
app.get('/', (req, res) => {
  res.status(200).json({ status: "Online", service: "Black Cobra Operations Pipeline API" });
});

// 📋 Endpoint 2: Fetch Shared Inventory Registry
app.get('/api/data', (req, res) => {
  res.status(200).json(BLACK_COBRA_DB);
});

// 📦 Endpoint 3: Real-Time Order Consignment Logistics Search
app.post('/api/track', (req, res) => {
  const { orderId } = req.body;
  if (!orderId) {
    return res.status(400).json({ error: "Missing tracking identifier token" });
  }

  const cleanId = orderId.toUpperCase();
  const statusRandom = Math.floor(Math.random() * 3);
  let report = "";

  if (statusRandom === 0) {
    report = ` Status: PACKED & CALIBRATED\n\nYour commercial plywood lot has passed the structural core check and internal chemical calibration. Dispatch lineup scheduled from Yamunanagar facility within 12 working hours.`;
  } else if (statusRandom === 1) {
    report = ` Status: IN-TRANSIT / SHIPPING\n\nConsignment dispatched via Black Cobra Logistics Network Group. Cargo carrier tracking state is rolling near Delhi NCR Outer Ring transit point. Estimated warehouse delivery window: 24 Hours.`;
  } else {
    report = ` Status: SUCCESSFULLY DELIVERED\n\nOrder payload successfully cleared at site cargo reception yards. Digital signature log and stamp allocation recorded. Structural warranty active.`;
  }

  res.status(200).json({ orderId: cleanId, trackingReport: report });
});

// 🤖 Endpoint 4: AI NLP Business Query Engine Routing
app.post('/api/query', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Empty search query string" });

  const queryClean = text.toLowerCase();
  let heading = "CENTRAL PROCESSING CORE";
  let responseText = "Aapki custom business query humare systems ne compute kar li hai. Regional dispatch executive jaldi hi robust communication node se aapse contact karega.";

  if (queryClean.includes('discount') || queryClean.includes('bulk') || queryClean.includes('wholesale')) {
    heading = "COMMERCIAL ENGINE RECONCILIATION";
    responseText = "B2B institutional bulk accounts par metrics variable scaling ke standard configuration triggers follow karte hain. Extra quotes pricing matrix validation ke liye kindly wholesale panel direct coordinate kijiye.";
  } else if (queryClean.includes('test') || queryClean.includes('certificate') || queryClean.includes('lab')) {
    heading = "LAB TESTING REGISTRY MATRIX";
    responseText = "Humare structural products Bureau of Indian Standards (BIS Certified IS:710 & IS:303) range parameters validation verify karte hain. Live data reports sales terminal verification channel par active hain.";
  }

  res.status(200).json({ heading, response: responseText });
});

// 🤖 UPDATED AI CHAT ROUTE (With Memory/History)
// 🤖 UPDATED AI CHAT ROUTE (With Memory/History & Filtering)
// 🤖 AI CHAT ROUTE


// 📜 CHAT HISTORY ROUTE
// 🤖 AI CHAT ROUTE
app.post('/api/ai-chat', async (req, res) => {
  console.log("AI ROUTE HIT");

  const { email, userMessage } = req.body;
  console.log("EMAIL RECEIVED:", email);
console.log("BODY:", req.body);

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 500
      }
    });

   const companyContext = `
You are Black Cobra AI, the official AI assistant of Black Cobra Plywood.

Products:

1. Platinum BWP PWP Plywood
- IS:710 Marine Grade Certified
- 100% Selected Gurjan Core Layers
- 108 Hours Boiling Water Test
- Density > 820 kg/m³

Pricing:
• 6mm Calibrated: ₹115 / sq.ft.
• 12mm Core-Lock: ₹165 / sq.ft.
• 19mm Heavy Duty: ₹240 / sq.ft.

2. Gold Club BWR Plywood
- IS:303 Moisture Resistant
- Calibrated Premium Hardwood & Poplar

Pricing:
• 6mm Architectural: ₹85 / sq.ft.
• 12mm Multi-Layer: ₹125 / sq.ft.
• 19mm Load-Bearing: ₹165 / sq.ft.

Plant:
Plant 1 (Yamunanagar, Haryana)
- Capacity: 15,000 sheets/day
- Focus: Core peeling, log sorting and calibration

Rules:
- Use this information for Black Cobra related questions.
- Never invent company information.
- If information is unavailable, say so.
- For coding, technology, education, science and general questions, answer normally as an AI assistant.
`;

const result = await chat.sendMessage(
  `${companyContext}

User Question: ${userMessage}`
);
    const reply = result.response.text();

    console.log("Saving Chat Data:", {
      email,
      userMessage,
      botReply: reply
    });

   await Chat.create({
  email: email || "test@blackcobra.ai",
  userMessage,
  botReply: reply
});
    console.log("Chat Saved Successfully");

    res.status(200).json({
      reply
    });

  } catch (error) {
  console.error("AI Error FULL:", error);

  return res.status(200).json({
    reply: `AI ERROR: ${error.message}`
  });
}
});


// 📜 CHAT HISTORY ROUTE
app.get('/api/chats/:email', async (req, res) => {
  try {
    const chats = await Chat.find({
      email: req.params.email
    }).sort({ createdAt: 1 });

    res.status(200).json(chats);

  } catch (err) {
    console.error("CHAT HISTORY ERROR:", err);

    res.status(500).json({
      error: "Failed to load chats"
    });
  }
});


// 🚀 SERVER START
app.listen(PORT, () => {
  console.log(
    `🚀 API Server dynamically processing on port : ${PORT}`
  );
});