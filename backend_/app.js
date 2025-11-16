const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5001; // changed port

const corsOptions = {
    origin: 'http://localhost:5173', // Allow only your frontend's origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};

// Middleware
// app.use(cors());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Keep original filename for demo purposes
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 16 * 1024 * 1024, // 16MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'image') {
            // Accept images
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Only image files are allowed for image upload'), false);
            }
        } else if (file.fieldname === 'voice') {
            // Accept audio files
            if (file.mimetype.startsWith('audio/') || 
                file.originalname.match(/\.(mp3|wav|ogg|m4a|webm)$/i)) {
                cb(null, true);
            } else {
                cb(new Error('Only audio files are allowed for voice upload'), false);
            }
        } else {
            cb(new Error('Invalid field name'), false);
        }
    }
});

// Sample data storage
const SAMPLE_RESPONSES = {
    text: {
        "what crops should i plant in summer": "For summer crops, consider planting tomatoes, cucumbers, peppers, eggplant, okra, and corn. These heat-loving crops thrive in warm weather. Make sure to provide adequate water and mulching.",
        "how to prevent pest attacks": "To prevent pest attacks: 1) Use crop rotation, 2) Plant companion crops like marigolds, 3) Apply neem oil spray, 4) Maintain proper plant spacing for air circulation, 5) Regular inspection of crops.",
        "best fertilizer for vegetables": "For vegetables, use a balanced NPK fertilizer (10-10-10) during planting. Apply compost or well-rotted manure before planting. For leafy greens, use nitrogen-rich fertilizer. For fruiting plants, use phosphorus and potassium-rich fertilizer.",
        "when to harvest tomatoes": "Harvest tomatoes when they start turning color but are still firm. They will continue to ripen after picking. For best flavor, harvest when fully red but still firm to touch.",
        "soil preparation tips": "For soil preparation: 1) Test soil pH (6.0-7.0 ideal), 2) Add organic compost, 3) Till soil to 8-10 inches deep, 4) Remove weeds and debris, 5) Add necessary amendments based on soil test.",
        "watering schedule for plants": "Water early morning or evening to reduce evaporation. Most vegetables need 1-2 inches of water per week. Check soil moisture 2-3 inches deep. Water deeply but less frequently to encourage deep root growth.",
        "how to control aphids": "For aphids: spray with insecticidal soap, introduce ladybugs, plant companion herbs like basil and mint, or use neem oil spray. Remove heavily infested leaves.",
        "organic farming tips": "Organic farming tips: use compost and organic fertilizers, practice crop rotation, encourage beneficial insects, use natural pest deterrents, maintain soil health with cover crops.",
        "greenhouse management": "Greenhouse management: maintain proper ventilation, monitor temperature (65-75°F ideal), ensure adequate lighting, water consistently, and sanitize equipment regularly.",
        "crop rotation benefits": "Crop rotation prevents soil depletion, reduces pest and disease cycles, improves soil structure, increases biodiversity, and can naturally fix nitrogen in soil."
    },
    image: {
        "leaf_disease": "This appears to be a fungal disease on your plant leaves. Remove affected leaves immediately and apply a copper-based fungicide. Ensure good air circulation and avoid watering the leaves directly.",
        "pest_damage": "I can see pest damage on your crops. This looks like aphid or whitefly damage. Spray with insecticidal soap or neem oil solution. You can also introduce beneficial insects like ladybugs.",
        "soil_problem": "Your soil appears to have drainage issues. Consider adding organic matter like compost or perlite to improve drainage. Raised beds might also help with water management.",
        "crop_growth": "Your crops are looking healthy! Continue your current care routine. Make sure to maintain consistent watering and consider side-dressing with compost for continued growth.",
        "nutrient_deficiency": "This shows signs of nitrogen deficiency - yellowing leaves starting from bottom. Apply a nitrogen-rich fertilizer or add compost to boost soil nutrients.",
        "wilting_plants": "Plant wilting can be due to overwatering, underwatering, or root problems. Check soil moisture and drainage. If soil is waterlogged, improve drainage. If dry, water deeply.",
        "flowering_stage": "Your plants are in the flowering stage! Reduce nitrogen and increase phosphorus and potassium. Ensure consistent watering and avoid disturbing the roots.",
        "harvest_ready": "These crops look ready for harvest! Harvest in the early morning for best quality. Use clean, sharp tools and handle produce gently to avoid damage."
    },
    voice: {
        "pest": "🎧 For natural pest control: Use companion planting with marigolds and herbs, apply neem oil spray weekly, introduce beneficial insects like ladybugs, and maintain proper plant spacing for air circulation.",
        "aphid": "🎧 For aphid treatment: Spray affected plants with a strong water stream to dislodge them, apply insecticidal soap solution, or use neem oil. Natural predators like ladybugs and lacewings are excellent biological controls. Avoid over-fertilizing with nitrogen as it attracts aphids.",
        "water": "🎧 Smart watering tips: Water deeply but less frequently, early morning is ideal (6-8 AM), check soil moisture 2-3 inches deep, use mulch to retain moisture, and adjust frequency based on weather conditions.",
        "fertilizer": "🎧 Organic fertilizer recommendations: Use compost tea for gentle feeding, fish emulsion for nitrogen boost, bone meal for phosphorus, kelp meal for trace minerals. Apply according to plant growth stage and season.",
        "harvest": "🎧 Harvesting best practices: Pick vegetables in early morning when they're crisp and full of moisture, use clean sharp tools, handle gently to avoid damage, and harvest regularly to encourage continued production.",
        "disease": "🎧 Disease prevention strategies: Ensure good air circulation between plants, avoid overhead watering, rotate crops annually, remove diseased plant material immediately, and use resistant varieties when available.",
        "soil": "🎧 Soil health improvement: Test soil pH regularly (6.0-7.0 ideal for most crops), add organic compost annually, avoid walking on wet soil, practice crop rotation, and use cover crops in off-season.",
        "compost": "🎧 Composting success tips: Balance green materials (kitchen scraps, grass clippings) with brown materials (dry leaves, paper), turn pile weekly, maintain moisture like a wrung-out sponge, and be patient - good compost takes 3-6 months.",
        "planting": "🎧 Smart planting advice: Start with soil preparation, choose varieties suited to your climate zone, follow spacing recommendations, plant at proper depth (generally 2-3 times seed diameter), and keep soil consistently moist until germination.",
        "organic": "🎧 Organic farming principles: Build healthy soil with compost and organic matter, use natural pest management, choose disease-resistant varieties, practice crop diversity, and work with nature's cycles rather than against them."
    }
};

// Helper function to find best matching response
const findBestMatch = (userInput, category) => {
    const input = userInput.toLowerCase().trim();
    
    // Direct match
    if (SAMPLE_RESPONSES[category][input]) {
        return SAMPLE_RESPONSES[category][input];
    }
    
    if (category === 'text') {
        // Keyword matching for text
        let bestMatch = "";
        let maxMatches = 0;
        
        for (const [question, answer] of Object.entries(SAMPLE_RESPONSES[category])) {
            const wordsInInput = input.split(/\s+/);
            const wordsInQuestion = question.split(/\s+/);
            const matches = wordsInInput.filter(word => 
                wordsInQuestion.some(qWord => qWord.includes(word) || word.includes(qWord))
            ).length;
            
            if (matches > maxMatches && matches > 0) {
                maxMatches = matches;
                bestMatch = answer;
            }
        }
        
        if (bestMatch) return bestMatch;
    } else {
        // For image and voice, check filename keywords with more specific matching
        for (const [key, response] of Object.entries(SAMPLE_RESPONSES[category])) {
            // Check if any keyword from the stored keys matches the input
            if (input.includes(key)) {
                return response;
            }
        }
        
        // Additional keyword matching for voice
        if (category === 'voice') {
            const voiceKeywords = {
                'pest': SAMPLE_RESPONSES.voice.pest,
                'bug': SAMPLE_RESPONSES.voice.pest,
                'insect': SAMPLE_RESPONSES.voice.pest,
                'aphid': SAMPLE_RESPONSES.voice.aphid,
                'water': SAMPLE_RESPONSES.voice.water,
                'irrigation': SAMPLE_RESPONSES.voice.water,
                'fertiliz': SAMPLE_RESPONSES.voice.fertilizer,
                'nutrient': SAMPLE_RESPONSES.voice.fertilizer,
                'harvest': SAMPLE_RESPONSES.voice.harvest,
                'pick': SAMPLE_RESPONSES.voice.harvest,
                'disease': SAMPLE_RESPONSES.voice.disease,
                'sick': SAMPLE_RESPONSES.voice.disease,
                'soil': SAMPLE_RESPONSES.voice.soil,
                'dirt': SAMPLE_RESPONSES.voice.soil,
                'compost': SAMPLE_RESPONSES.voice.compost,
                'plant': SAMPLE_RESPONSES.voice.planting,
                'seed': SAMPLE_RESPONSES.voice.planting,
                'organic': SAMPLE_RESPONSES.voice.organic
            };
            
            for (const [keyword, response] of Object.entries(voiceKeywords)) {
                if (input.includes(keyword)) {
                    return response;
                }
            }
        }
    }
    
    // Default responses
    const defaults = {
        text: "I'm sorry, I don't have specific information about that. As a demo chatbot, I have limited responses. Try asking about summer crops, pest prevention, fertilizers, harvesting, soil preparation, or watering schedules.",
        image: "I can see your image. For this demo, I can help identify common issues like leaf diseases, pest damage, soil problems, crop growth status, and nutrient deficiencies. Please upload images with descriptive filenames.",
        voice: "🎧 I received your voice message! For this demo, I can respond to questions about: pests, aphids, watering, fertilizers, harvesting, diseases, soil, composting, planting, and organic farming. Try naming your audio files with these keywords for better responses."
    };
    
    return defaults[category];
};

// Routes
app.get('/', (req, res) => {
    res.json({
        message: "Farmer Chatbot Backend API",
        version: "1.0.0",
        endpoints: {
            "GET /": "API information",
            "POST /api/chat": "Text input chat",
            "POST /api/upload-image": "Image upload and analysis",
            "POST /api/upload-voice": "Voice upload and processing",
            "GET /api/sample-data": "Get sample questions and responses"
        },
        status: "Server is running successfully! 🌾"
    });
});

// Chat endpoint for text input
app.post('/api/chat', (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message || !message.trim()) {
            return res.status(400).json({ 
                error: "Message is required",
                success: false 
            });
        }
        
        const response = findBestMatch(message, 'text');
        
        res.json({
            response,
            type: 'text',
            success: true,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ 
            error: "Internal server error",
            success: false 
        });
    }
});

// Image upload endpoint
app.post('/api/upload-image', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                error: "No image file provided",
                success: false 
            });
        }
        
        const filename = req.file.originalname.toLowerCase();
        const response = findBestMatch(filename, 'image');
        
        res.json({
            response,
            type: 'image',
            filename: req.file.originalname,
            success: true,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({ 
            error: error.message || "Internal server error",
            success: false 
        });
    }
});

// Voice upload endpoint
app.post('/api/upload-voice', upload.single('voice'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                error: "No voice file provided",
                success: false 
            });
        }
        
        const filename = req.file.originalname.toLowerCase();
        const response = findBestMatch(filename, 'voice');
        
        res.json({
            response,
            type: 'voice',
            filename: req.file.originalname,
            success: true,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Voice upload error:', error);
        res.status(500).json({ 
            error: error.message || "Internal server error",
            success: false 
        });
    }
});

// Get sample data endpoint
app.get('/api/sample-data', (req, res) => {
    res.json({
        textSamples: Object.keys(SAMPLE_RESPONSES.text),
        imageSamples: Object.keys(SAMPLE_RESPONSES.image),
        voiceSamples: Object.keys(SAMPLE_RESPONSES.voice),
        success: true
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File size too large. Maximum size is 16MB.',
                success: false
            });
        }
    }
    
    console.error('Server error:', error);
    res.status(500).json({
        error: 'Internal server error',
        success: false
    });
});

// Handle 404 routes
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: 'The requested endpoint does not exist',
        success: false
    });
});

// Start server
app.listen(PORT, () => {
    console.log('🌾 Farmer Chatbot Backend Server Started!');
    console.log(`📡 Server running on: http://localhost:${PORT}`);
    console.log('📋 Available endpoints:');
    console.log('   GET  / - API information');
    console.log('   POST /api/chat - Text chat');
    console.log('   POST /api/upload-image - Image upload');
    console.log('   POST /api/upload-voice - Voice upload');
    console.log('   GET  /api/sample-data - Sample data');
    console.log('');
    console.log('📝 Sample text questions available:');
    Object.keys(SAMPLE_RESPONSES.text).forEach((question, index) => {
        console.log(`   ${index + 1}. ${question}`);
    });
    console.log('');
    console.log('🚀 Ready to serve farming assistance!');
});

