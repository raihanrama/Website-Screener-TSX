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
    const { url } = await req.json();
    
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
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

    // Prompt untuk analisis keamanan website
    const prompt = `Lakukan analisis keamanan mendalam untuk website: ${url}

PENTING: Kunjungi dan analisis konten website secara detail untuk memahami jenis bisnis, layanan, dan target audience.

Berikan analisis dalam format JSON yang VALID tanpa markdown formatting (**, *, dll):

{
  "security_score": [angka 0-100],
  "risk_level": "LOW|MEDIUM|HIGH|CRITICAL",
  "website_category": "kategori spesifik seperti: Job Portal, E-commerce, Banking, Education, Healthcare, News Media, Social Network, Corporate Website, Government, Entertainment, dll",
  "business_analysis": "Jelaskan secara detail: (1) Apa layanan utama website ini, (2) Siapa target audiencenya, (3) Model bisnis yang dijalankan, (4) Fitur-fitur utama yang tersedia, (5) Jenis data sensitif yang mungkin dikumpulkan",
  "potential_threats": [
    {
      "threat_type": "nama ancaman spesifik untuk jenis website ini",
      "severity": "LOW|MEDIUM|HIGH|CRITICAL", 
      "description": "penjelasan detail ancaman tanpa formatting markdown",
      "attack_scenarios": "skenario serangan konkret yang mungkin terjadi",
      "criminal_activities": "aktivitas kriminal spesifik yang bisa terjadi seperti data theft, identity fraud, financial fraud, dll",
      "impact_analysis": "dampak bisnis dan pengguna jika ancaman terealisasi"
    }
  ],
  "vulnerabilities": [
    {
      "type": "jenis kerentanan",
      "severity": "LOW|MEDIUM|HIGH|CRITICAL",
      "description": "penjelasan detail tanpa formatting markdown", 
      "exploitation_method": "cara konkret mengeksploitasi kerentanan ini",
      "recommendation": "langkah perbaikan spesifik dan implementable"
    }
  ],
  "security_features": [
    {
      "feature": "nama fitur keamanan",
      "status": "PRESENT|MISSING|PARTIAL",
      "details": "penjelasan status implementasi tanpa formatting markdown",
      "effectiveness": "seberapa efektif fitur ini melindungi website"
    }
  ],
  "certificates": {
    "ssl_status": "VALID|INVALID|EXPIRED|MISSING",
    "certificate_details": "informasi detail sertifikat",
    "security_implications": "implikasi keamanan dari status sertifikat"
  },
  "privacy_policy": {
    "present": true/false,
    "analysis": "analisis detail kebijakan privasi tanpa formatting markdown",
    "compliance_status": "status compliance dengan GDPR, CCPA, dan regulasi lokal Indonesia"
  },
  "data_collection": {
    "tracking_scripts": "detail script tracking yang ditemukan",
    "cookies": "analisis keamanan cookie",
    "third_party_services": "layanan pihak ketiga dan risiko privasi",
    "data_flow_analysis": "analisis alur data dan potensi kebocoran"
  },
  "regulatory_compliance": {
    "applicable_regulations": "regulasi yang berlaku untuk jenis website ini di Indonesia dan internasional",
    "compliance_status": "tingkat kepatuhan saat ini",
    "compliance_recommendations": "langkah untuk meningkatkan compliance"
  },
  "recommendations": [
    "rekomendasi prioritas TINGGI dengan langkah implementasi konkret",
    "rekomendasi prioritas SEDANG dengan timeline implementasi",
    "rekomendasi jangka panjang untuk peningkatan keamanan berkelanjutan"
  ],
  "detailed_analysis": "Analisis lengkap dalam bahasa Indonesia yang mudah dipahami dengan format terstruktur. WAJIB sertakan contoh kode yang dapat langsung diimplementasikan. Format: (1) KATEGORI BISNIS & INDUSTRI - detail jenis bisnis, (2) PROFIL RISIKO KEAMANAN - analisis mendalam risiko, (3) TEMUAN KEAMANAN TEKNIS - detail temuan, (4) REKOMENDASI PENANGANAN DENGAN KODE - berikan contoh kode Apache/Nginx/PHP untuk header keamanan dan solusi lainnya menggunakan format ```language, (5) LANGKAH PRIORITAS PENANGANAN - urutan prioritas, (6) DAMPAK BISNIS JIKA TIDAK DITANGANI - analisis dampak. JANGAN gunakan markdown bold/italic seperti ** atau *. Gunakan format code blocks dengan ```language untuk contoh kode."
}

INSTRUKSI KHUSUS:
- Analisis konten website secara detail untuk memahami bisnis yang dijalankan
- Jangan gunakan formatting markdown seperti **, *, #, dll dalam text
- Berikan analisis yang spesifik untuk jenis website yang dianalisis
- Fokus pada ancaman dan rekomendasi yang relevan dengan industri website
- Gunakan bahasa Indonesia yang profesional dan mudah dipahami

Fokus pada aspek keamanan seperti:
- SSL/TLS implementation
- HTTP headers keamanan
- Vulnerability assessment
- Privacy compliance
- Data protection measures
- Third-party integrations
- Authentication mechanisms
- Input validation
- XSS protection
- CSRF protection
- Content Security Policy
- Cookie security

Berikan jawaban dalam Bahasa Indonesia yang detail dan profesional.`;

    console.log('Sending request to Gemini API...');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'Failed to analyze website' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('Received response from Gemini API');

    const analysisText = data.candidates[0]?.content?.parts[0]?.text;
    
    if (!analysisText) {
      return new Response(JSON.stringify({ error: 'No analysis generated' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract JSON from the response
    let analysisResult;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback jika tidak ada JSON yang valid
        analysisResult = {
          security_score: 75,
          risk_level: "MEDIUM",
          detailed_analysis: analysisText
        };
      }
    } catch (parseError) {
      console.error('Error parsing analysis result:', parseError);
      analysisResult = {
        security_score: 75,
        risk_level: "MEDIUM",
        detailed_analysis: analysisText,
        error: "Failed to parse structured analysis"
      };
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-website function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});