import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CircularProgress } from '@/components/ui/circular-progress';
import { Shield, AlertTriangle, CheckCircle, XCircle, Loader2, TrendingUp, Lock, Eye, Zap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Function to clean markdown formatting and render properly formatted text
const formatAnalysisText = (text: string) => {
  if (!text) return '';
  
  // First clean basic markdown
  let cleanedText = text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold **text**
    .replace(/\*(.*?)\*/g, '$1')     // Remove italic *text*
    .replace(/#{1,6}\s?/g, '')       // Remove headers #
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links [text](url)
    .trim();

  // Split into sections and format properly
  const sections = cleanedText.split('\n\n');
  
  return (
    <div className="space-y-6">
      {sections.map((section, index) => {
        // Check if section contains code blocks
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = codeBlockRegex.exec(section)) !== null) {
          // Add text before code block
          if (match.index > lastIndex) {
            const textPart = section.slice(lastIndex, match.index).trim();
            if (textPart) {
              parts.push(
                <div key={`text-${index}-${parts.length}`} className="text-sm leading-relaxed">
                  {textPart.split('\n').map((line, lineIndex) => (
                    <p key={lineIndex} className={line.trim() === '' ? 'h-3' : 'mb-2'}>
                      {line}
                    </p>
                  ))}
                </div>
              );
            }
          }

          // Add code block
          const language = match[1] || 'text';
          const code = match[2].trim();
          parts.push(
            <div key={`code-${index}-${parts.length}`} className="my-4">
              <div className="bg-muted/50 rounded-t-lg px-4 py-2 border-b">
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  {language}
                </span>
              </div>
              <pre className="bg-black/90 text-green-400 p-4 rounded-b-lg overflow-x-auto text-sm font-mono border">
                <code>{code}</code>
              </pre>
            </div>
          );

          lastIndex = match.index + match[0].length;
        }

        // Add remaining text after last code block
        if (lastIndex < section.length) {
          const remainingText = section.slice(lastIndex).trim();
          if (remainingText) {
            parts.push(
              <div key={`text-${index}-${parts.length}`} className="text-sm leading-relaxed">
                {remainingText.split('\n').map((line, lineIndex) => (
                  <p key={lineIndex} className={line.trim() === '' ? 'h-3' : 'mb-2'}>
                    {line}
                  </p>
                ))}
              </div>
            );
          }
        }

        // If no code blocks found, render as regular text
        if (parts.length === 0) {
          return (
            <div key={index} className="text-sm leading-relaxed">
              {section.split('\n').map((line, lineIndex) => (
                <p key={lineIndex} className={line.trim() === '' ? 'h-3' : 'mb-2'}>
                  {line}
                </p>
              ))}
            </div>
          );
        }

        return <div key={index}>{parts}</div>;
      })}
    </div>
  );
};

// Function to clean markdown formatting from simple text
const cleanMarkdownText = (text: string) => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold **text**
    .replace(/\*(.*?)\*/g, '$1')     // Remove italic *text*
    .replace(/#{1,6}\s?/g, '')       // Remove headers #
    .replace(/`(.*?)`/g, '$1')       // Remove code blocks
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links [text](url)
    .trim();
};

interface AnalysisResult {
  security_score: number;
  risk_level: string;
  website_category?: string;
  business_analysis?: string;
  potential_threats?: Array<{
    threat_type: string;
    severity: string;
    description: string;
    attack_scenarios: string;
    criminal_activities: string;
    impact_analysis: string;
  }>;
  vulnerabilities?: Array<{
    type: string;
    severity: string;
    description: string;
    exploitation_method?: string;
    recommendation: string;
  }>;
  security_features?: Array<{
    feature: string;
    status: string;
    details: string;
    effectiveness?: string;
  }>;
  certificates?: {
    ssl_status: string;
    certificate_details: string;
    security_implications?: string;
  };
  regulatory_compliance?: {
    applicable_regulations: string;
    compliance_status: string;
    compliance_recommendations: string;
  };
  detailed_analysis: string;
  recommendations?: string[];
}

export const WebsiteAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [expandedRecommendation, setExpandedRecommendation] = useState<number | null>(null);
  const { toast } = useToast();

  const getRiskColor = (risk: string) => {
    switch (risk?.toUpperCase()) {
      case 'LOW': return 'bg-success text-primary-foreground';
      case 'MEDIUM': return 'bg-warning text-primary-foreground';
      case 'HIGH': return 'bg-accent text-accent-foreground';
      case 'CRITICAL': return 'bg-error text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'LOW': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'MEDIUM': return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'HIGH': return <AlertTriangle className="w-4 h-4 text-accent" />;
      case 'CRITICAL': return <XCircle className="w-4 h-4 text-error" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getRecommendationDetails = (recommendation: string, index: number) => {
    // Generate detailed explanations and code examples based on recommendation
    const details = {
      explanation: `Penjelasan detail untuk: ${recommendation}`,
      priority: index < 2 ? 'TINGGI' : index < 4 ? 'SEDANG' : 'RENDAH',
      timeline: index < 2 ? '1-2 minggu' : index < 4 ? '2-4 minggu' : '1-2 bulan',
      difficulty: index < 2 ? 'Sedang' : index < 4 ? 'Mudah' : 'Sulit',
      codeExamples: generateCodeExamples(recommendation),
      steps: generateImplementationSteps(recommendation)
    };
    return details;
  };

  const generateCodeExamples = (recommendation: string) => {
    if (recommendation.toLowerCase().includes('header') || recommendation.toLowerCase().includes('csp')) {
      return [
        {
          language: 'apache',
          title: 'Konfigurasi Apache (.htaccess)',
          code: `# Implementasi Security Headers
Header always set X-Frame-Options DENY
Header always set X-Content-Type-Options nosniff
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
Header always set Referrer-Policy "strict-origin-when-cross-origin"`
        },
        {
          language: 'nginx',
          title: 'Konfigurasi Nginx',
          code: `# Security Headers di nginx.conf
server {
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}`
        }
      ];
    } else if (recommendation.toLowerCase().includes('ssl') || recommendation.toLowerCase().includes('https')) {
      return [
        {
          language: 'apache',
          title: 'Redirect HTTP ke HTTPS',
          code: `# Force HTTPS Redirect
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# HSTS Header
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"`
        },
        {
          language: 'nginx',
          title: 'Konfigurasi SSL Nginx',
          code: `server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
}`
        }
      ];
    }
    return [
      {
        language: 'text',
        title: 'Langkah Implementasi',
        code: `1. Backup konfigurasi server saat ini
2. Test konfigurasi di environment staging
3. Monitor logs setelah implementasi
4. Verify functionality dengan tools testing`
      }
    ];
  };

  const generateImplementationSteps = (recommendation: string) => {
    if (recommendation.toLowerCase().includes('header')) {
      return [
        'Identifikasi web server yang digunakan (Apache/Nginx)',
        'Backup file konfigurasi yang ada',
        'Tambahkan konfigurasi header keamanan',
        'Test konfigurasi di staging environment',
        'Verify header menggunakan online tools',
        'Deploy ke production dengan monitoring'
      ];
    } else if (recommendation.toLowerCase().includes('ssl')) {
      return [
        'Obtain SSL certificate dari trusted CA',
        'Install certificate di web server',
        'Konfigurasi redirect HTTP ke HTTPS',
        'Update internal links ke HTTPS',
        'Test SSL configuration dan rating',
        'Monitor certificate expiration'
      ];
    }
    return [
      'Analisis requirement dan resources yang dibutuhkan',
      'Buat plan implementasi dengan timeline',
      'Setup testing environment',
      'Implementasi bertahap dengan monitoring',
      'Documentation dan knowledge transfer'
    ];
  };

  const handleAnalyze = async () => {
    if (!url) {
      toast({
        title: "Error",
        description: "Masukkan URL website terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-website', {
        body: { url }
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "Analisis Selesai",
        description: "Website berhasil dianalisis"
      });
    } catch (error) {
      console.error('Error analyzing website:', error);
      toast({
        title: "Error",
        description: "Gagal menganalisis website. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-card via-card/80 to-muted/20 backdrop-blur-sm">
        <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/5 p-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-2xl shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Website Screener
                </h2>
                <p className="text-sm text-muted-foreground">In-depth analysis of your website security</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="h-12 pl-4 pr-12 rounded-xl border-2 focus:border-primary transition-all duration-200 bg-background/80 backdrop-blur-sm"
                />
                <Eye className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing}
                size="lg"
                className="h-12 px-8 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Menganalisis...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Analyze Your URL
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {result && (
        <div className="space-y-8">
          {/* Security Score with Circular Progress */}
          <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-card via-card/80 to-muted/20 backdrop-blur-sm">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <CircularProgress 
                    value={result.security_score} 
                    size={160} 
                    strokeWidth={12}
                    className="drop-shadow-lg"
                  />
                </div>
                
                <div className="flex-1 text-center lg:text-left space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Security Assessment</h3>
                    <p className="text-muted-foreground">Penilaian komprehensif keamanan website</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Badge className={`${getRiskColor(result.risk_level)} text-lg px-6 py-2 rounded-full shadow-lg`}>
                      {result.risk_level} RISK
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="w-4 h-4" />
                      <span>Skor: {result.security_score}/100</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border/50">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{result.vulnerabilities?.length || 0}</div>
                      <div className="text-xs text-muted-foreground">Kerentanan</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-error">{result.potential_threats?.length || 0}</div>
                      <div className="text-xs text-muted-foreground">Ancaman</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">{result.security_features?.length || 0}</div>
                      <div className="text-xs text-muted-foreground">Fitur Keamanan</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success">{result.recommendations?.length || 0}</div>
                      <div className="text-xs text-muted-foreground">Rekomendasi</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Website Category & Business Analysis */}
          {(result.website_category || result.business_analysis) && (
            <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-muted/10 backdrop-blur-sm">
              <div className="bg-gradient-to-r from-primary/10 to-accent/5 p-6 border-b">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Profil Website & Analisis Bisnis
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Identifikasi industri dan model bisnis website</p>
              </div>
              <div className="p-6 space-y-6">
                {result.website_category && (
                  <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-4 rounded-xl border border-primary/20">
                    <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <Badge className="bg-primary text-white">{result.website_category}</Badge>
                      Kategori Website
                    </h4>
                  </div>
                )}
                {result.business_analysis && (
                  <div className="bg-gradient-to-br from-muted/20 to-background/50 rounded-2xl p-6 border shadow-inner">
                    <h4 className="font-semibold text-lg mb-3">Analisis Bisnis</h4>
                    <p className="text-sm leading-relaxed text-foreground/90">{cleanMarkdownText(result.business_analysis)}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Potential Threats */}
          {result.potential_threats && result.potential_threats.length > 0 && (
            <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-muted/10 backdrop-blur-sm">
              <div className="bg-gradient-to-r from-error/10 to-accent/5 p-6 border-b">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-error" />
                  Analisis Ancaman Potensial
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Potensi ancaman dan aktivitas kriminal yang dapat terjadi</p>
              </div>
              <div className="p-6 space-y-4">
                {result.potential_threats.map((threat, index) => (
                  <div key={index} className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-card to-muted/20 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {getSeverityIcon(threat.severity)}
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-lg">{threat.threat_type}</h4>
                          <Badge 
                            variant="outline" 
                            className={`${getRiskColor(threat.severity)} text-xs font-medium px-3 py-1 rounded-full`}
                          >
                            {threat.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{cleanMarkdownText(threat.description)}</p>
                        
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="bg-gradient-to-r from-error/5 to-accent/5 p-4 rounded-xl border border-error/20">
                            <span className="text-sm font-medium text-error">🎯 Skenario Serangan: </span>
                            <span className="text-sm">{cleanMarkdownText(threat.attack_scenarios)}</span>
                          </div>
                          <div className="bg-gradient-to-r from-accent/5 to-primary/5 p-4 rounded-xl border border-accent/20">
                            <span className="text-sm font-medium text-accent">⚠️ Aktivitas Kriminal: </span>
                            <span className="text-sm">{cleanMarkdownText(threat.criminal_activities)}</span>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-primary/5 to-success/5 p-4 rounded-xl border border-primary/20">
                          <span className="text-sm font-medium text-primary">📊 Analisis Dampak: </span>
                          <span className="text-sm">{cleanMarkdownText(threat.impact_analysis)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Vulnerabilities */}
          {result.vulnerabilities && result.vulnerabilities.length > 0 && (
            <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-muted/10 backdrop-blur-sm">
              <div className="bg-gradient-to-r from-error/10 to-accent/5 p-6 border-b">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-error" />
                  Kerentanan Yang Ditemukan
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Masalah keamanan yang perlu segera diatasi</p>
              </div>
              <div className="p-6 space-y-4">
                {result.vulnerabilities.map((vuln, index) => (
                  <div key={index} className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-card to-muted/20 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {getSeverityIcon(vuln.severity)}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-lg">{vuln.type}</h4>
                          <Badge 
                            variant="outline" 
                            className={`${getSeverityIcon(vuln.severity) ? getRiskColor(vuln.severity) : 'bg-muted'} text-xs font-medium px-3 py-1 rounded-full`}
                          >
                            {vuln.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{vuln.description}</p>
                        
                        {vuln.exploitation_method && (
                          <div className="bg-gradient-to-r from-error/5 to-accent/5 p-4 rounded-xl border border-error/20">
                            <span className="text-sm font-medium text-error">🔓 Metode Eksploitasi: </span>
                            <span className="text-sm">{vuln.exploitation_method}</span>
                          </div>
                        )}
                        
                        <div className="bg-gradient-to-r from-accent/5 to-primary/5 p-4 rounded-xl border border-accent/20">
                          <span className="text-sm font-medium text-accent">💡 Rekomendasi: </span>
                          <span className="text-sm">{vuln.recommendation}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Security Features */}
          {result.security_features && result.security_features.length > 0 && (
            <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-muted/10 backdrop-blur-sm">
              <div className="bg-gradient-to-r from-success/10 to-primary/5 p-6 border-b">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Lock className="w-5 h-5 text-success" />
                  Fitur Keamanan
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Status implementasi fitur keamanan website</p>
              </div>
              <div className="p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {result.security_features.map((feature, index) => (
                    <div key={index} className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-card to-muted/20 p-5 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{feature.feature}</h4>
                        <Badge 
                          variant={feature.status === 'PRESENT' ? 'default' : 'destructive'}
                          className={`${feature.status === 'PRESENT' ? 'bg-success text-white' : 'bg-error text-white'} text-xs font-medium px-3 py-1 rounded-full`}
                        >
                          {feature.status === 'PRESENT' ? '✓ Active' : '✗ Missing'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Regulatory Compliance */}
          {result.regulatory_compliance && (
            <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-muted/10 backdrop-blur-sm">
              <div className="bg-gradient-to-r from-success/10 to-primary/5 p-6 border-b">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  Compliance Regulasi
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Status kepatuhan terhadap regulasi dan standar keamanan</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-1">
                  <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-5 rounded-xl border border-primary/20">
                    <h4 className="font-semibold mb-3">📋 Regulasi yang Berlaku</h4>
                    <p className="text-sm leading-relaxed">{result.regulatory_compliance.applicable_regulations}</p>
                  </div>
                  <div className="bg-gradient-to-r from-success/5 to-primary/5 p-5 rounded-xl border border-success/20">
                    <h4 className="font-semibold mb-3">✅ Status Compliance</h4>
                    <p className="text-sm leading-relaxed">{result.regulatory_compliance.compliance_status}</p>
                  </div>
                  <div className="bg-gradient-to-r from-accent/5 to-primary/5 p-5 rounded-xl border border-accent/20">
                    <h4 className="font-semibold mb-3">💡 Rekomendasi Compliance</h4>
                    <p className="text-sm leading-relaxed">{result.regulatory_compliance.compliance_recommendations}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-muted/10 backdrop-blur-sm">
              <div className="bg-gradient-to-r from-primary/10 to-accent/5 p-6 border-b">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Rekomendasi Perbaikan
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Langkah-langkah untuk meningkatkan keamanan</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {result.recommendations.map((rec, index) => {
                    const isExpanded = expandedRecommendation === index;
                    const details = getRecommendationDetails(rec, index);
                    
                    return (
                      <div key={index} className="border border-primary/20 rounded-xl overflow-hidden bg-gradient-to-r from-primary/5 to-accent/5 hover:border-primary/40 transition-all duration-300">
                        <div 
                          className="flex items-start gap-4 p-4 cursor-pointer hover:bg-primary/10 transition-colors duration-200"
                          onClick={() => setExpandedRecommendation(isExpanded ? null : index)}
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <span className="text-sm leading-relaxed">{rec}</span>
                            <div className="flex items-center gap-3 mt-2">
                              <Badge variant="outline" className="text-xs">
                                Prioritas {details.priority}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Timeline: {details.timeline}
                              </span>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="border-t border-primary/20 bg-gradient-to-br from-background/50 to-muted/20">
                            <div className="p-6 space-y-6">
                              {/* Penjelasan Detail */}
                              <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-4 rounded-lg border border-primary/10">
                                <h5 className="font-semibold text-sm mb-2 text-primary">📋 Penjelasan Detail</h5>
                                <p className="text-sm text-muted-foreground leading-relaxed">{details.explanation}</p>
                              </div>

                              {/* Info Implementasi */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-success/10 p-3 rounded-lg border border-success/20">
                                  <div className="text-xs font-medium text-success">Prioritas</div>
                                  <div className="text-sm font-semibold">{details.priority}</div>
                                </div>
                                <div className="bg-warning/10 p-3 rounded-lg border border-warning/20">
                                  <div className="text-xs font-medium text-warning">Timeline</div>
                                  <div className="text-sm font-semibold">{details.timeline}</div>
                                </div>
                                <div className="bg-accent/10 p-3 rounded-lg border border-accent/20">
                                  <div className="text-xs font-medium text-accent">Tingkat Kesulitan</div>
                                  <div className="text-sm font-semibold">{details.difficulty}</div>
                                </div>
                              </div>

                              {/* Langkah Implementasi */}
                              <div className="bg-gradient-to-r from-accent/5 to-primary/5 p-4 rounded-lg border border-accent/20">
                                <h5 className="font-semibold text-sm mb-3 text-accent">🚀 Langkah Implementasi</h5>
                                <div className="space-y-2">
                                  {details.steps.map((step, stepIndex) => (
                                    <div key={stepIndex} className="flex items-start gap-3">
                                      <div className="flex-shrink-0 w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center text-xs font-medium text-accent">
                                        {stepIndex + 1}
                                      </div>
                                      <span className="text-sm text-muted-foreground">{step}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Code Examples */}
                              <div className="space-y-4">
                                <h5 className="font-semibold text-sm text-primary">💻 Contoh Implementasi Kode</h5>
                                {details.codeExamples.map((example, exampleIndex) => (
                                  <div key={exampleIndex} className="border border-border rounded-lg overflow-hidden">
                                    <div className="bg-muted/50 px-4 py-2 border-b flex items-center justify-between">
                                      <span className="text-xs font-medium text-muted-foreground">
                                        {example.title}
                                      </span>
                                      <Badge variant="outline" className="text-xs">
                                        {example.language.toUpperCase()}
                                      </Badge>
                                    </div>
                                    <pre className="bg-black/90 text-green-400 p-4 overflow-x-auto text-sm font-mono">
                                      <code>{example.code}</code>
                                    </pre>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}

          {/* Detailed Analysis */}
          <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-muted/10 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-accent/10 to-primary/5 p-6 border-b">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Eye className="w-5 h-5 text-accent" />
                Analisis Detail
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Laporan komprehensif hasil analisis keamanan</p>
            </div>
              <div className="p-6">
                <div className="bg-gradient-to-br from-muted/20 to-background/50 rounded-2xl p-6 border shadow-inner">
                  <div className="text-foreground/90">
                    {formatAnalysisText(result.detailed_analysis)}
                  </div>
                </div>
              </div>
          </Card>
        </div>
      )}
    </div>
  );
};