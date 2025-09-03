// server.js - Backend API Server
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname + '/public')); // Serve static files from the 'public' directory

// Validate environment variables
const requiredEnvVars = ['GROQ_API_KEY', 'SUPABASE_URL', 'SUPABASE_KEY'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars.join(', '));
    process.exit(1);
}

// API Routes
app.post('/api/ai/analyze', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Invalid prompt provided' });
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-4-scout-17b-16e-instruct',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_completion_tokens: 1024,
                top_p: 1,
                stream: false,
                stop: null,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Groq API error:', response.status, errorText);
            return res.status(500).json({ error: 'AI analysis failed' });
        }

        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        const parsedContent = JSON.parse(content);
        
        res.json(parsedContent);
    } catch (error) {
        console.error('AI analyze error:', error);
        res.status(500).json({ error: 'Internal server error during AI analysis' });
    }
});

app.post('/api/books/search', async (req, res) => {
    try {
        const { genres } = req.body;
        
        if (!Array.isArray(genres) || genres.length === 0) {
            return res.status(400).json({ error: 'Invalid genres provided' });
        }

        const tableName = 'filtered_books';
        const genreFilter = genres.map(genre => `sub-genre.ilike.*${encodeURIComponent(genre)}*`).join(',');
        const query = `select=id,author,title,highlights,sub-genre&highlights=not.is.null&or=(${genreFilter})&limit=200`;
        const url = `${process.env.SUPABASE_URL}/rest/v1/${tableName}?${query}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': process.env.SUPABASE_KEY,
                'Authorization': `Bearer ${process.env.SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            }
        });

        if (!response.ok) {
            // Fallback query
            const fallbackQuery = `select=id,author,title,highlights,sub-genre&highlights=not.is.null&limit=500`;
            const fallbackUrl = `${process.env.SUPABASE_URL}/rest/v1/${tableName}?${fallbackQuery}`;
            
            const fallbackResponse = await fetch(fallbackUrl, {
                method: 'GET',
                headers: {
                    'apikey': process.env.SUPABASE_KEY,
                    'Authorization': `Bearer ${process.env.SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                }
            });

            if (!fallbackResponse.ok) {
                return res.status(500).json({ error: 'Database query failed' });
            }

            const allBooks = await fallbackResponse.json();
            
            // Client-side filtering for genres
            const filteredBooks = allBooks.filter(book => {
                if (!book.title || !book.author || !book.highlights || !book['sub-genre']) return false;
                if (book.highlights.trim().length <= 10) return false;
                
                const bookGenres = book['sub-genre'].toLowerCase();
                return genres.some(genre => bookGenres.includes(genre.toLowerCase()));
            });

            return res.json(filteredBooks);
        }

        const books = await response.json();
        
        if (!Array.isArray(books)) {
            return res.status(500).json({ error: 'Invalid response format from database' });
        }
        
        // Validate and filter books
        const validBooks = books.filter(book => 
            book.title && 
            book.author && 
            book.highlights && 
            book.highlights.trim().length > 10 &&
            book['sub-genre']
        );

        // Additional client-side genre filtering
        const genreFilteredBooks = validBooks.filter(book => {
            const bookGenres = book['sub-genre'].toLowerCase();
            return genres.some(genre => 
                bookGenres.includes(genre.toLowerCase())
            );
        });

        res.json(genreFilteredBooks);
    } catch (error) {
        console.error('Books search error:', error);
        res.status(500).json({ error: 'Internal server error during books search' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        env: {
            hasGroqKey: !!process.env.GROQ_API_KEY,
            hasSupabaseUrl: !!process.env.SUPABASE_URL,
            hasSupabaseKey: !!process.env.SUPABASE_KEY
        }
    });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/landing.html');
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 Book Recommendations API is ready!`);
    console.log(`🔑 Environment variables loaded: ${requiredEnvVars.filter(v => process.env[v]).length}/${requiredEnvVars.length}`);
});