import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversation_history } = await req.json();
    
    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY is not set');
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // System prompt untuk AI Cybersecurity Expert
    const systemPrompt = `Anda adalah AI Cybersecurity Expert yang ahli dalam bidang keamanan siber. Tugas Anda adalah membantu pengguna dengan pertanyaan tentang cybersecurity.

Kemampuan Anda:
1. Memberikan jawaban formal dan profesional tentang topik cybersecurity
2. Menyediakan contoh kode yang dapat dicopy-paste jika diperlukan
3. Menjelaskan konsep keamanan dengan detail
4. Memberikan saran praktis untuk implementasi keamanan
5. Membantu dengan vulnerability assessment
6. Menjelaskan tentang berbagai jenis serangan siber
7. Memberikan guidance untuk compliance dan best practices

Format jawaban:
- Gunakan paragraf yang terstruktur dengan baik
- Gunakan bullet points untuk lists
- Berikan contoh kode dalam code blocks jika relevan
- Sertakan penjelasan teknis yang mudah dipahami
- Berikan rekomendasi actionable

Selalu berikan jawaban dalam Bahasa Indonesia yang formal namun mudah dipahami. Jika ada kode, berikan penjelasan lengkap tentang cara penggunaannya.`;

    // Gabungkan system prompt dengan conversation history
    let conversationText = systemPrompt + "\n\nPercakapan:\n";
    
    if (conversation_history && Array.isArray(conversation_history)) {
      conversation_history.forEach((msg: any) => {
        conversationText += `${msg.role}: ${msg.content}\n`;
      });
    }
    
    conversationText += `User: ${message}\nAssistant: `;

    console.log('Sending request to Gemini API for chat...');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: conversationText
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'Failed to get AI response' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('Received response from Gemini API for chat');

    const aiResponse = data.candidates[0]?.content?.parts[0]?.text;
    
    if (!aiResponse) {
      return new Response(JSON.stringify({ error: 'No response generated' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in cybersecurity-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});