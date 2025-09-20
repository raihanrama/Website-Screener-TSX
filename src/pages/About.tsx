import Navigation from '@/components/Navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock, Eye, Zap, Award, Users } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: Shield,
      title: "Advanced Security Analysis",
      description: "Comprehensive website security scanning with real-time threat detection and vulnerability assessment."
    },
    {
      icon: Lock,
      title: "AI-Powered Protection",
      description: "Machine learning algorithms that adapt to emerging threats and provide intelligent security recommendations."
    },
    {
      icon: Eye,
      title: "Deep Monitoring",
      description: "Continuous monitoring of your web assets with detailed reporting and actionable insights."
    },
    {
      icon: Zap,
      title: "Instant Response",
      description: "Real-time alerts and automated response systems to protect your digital infrastructure."
    }
  ];

  const stats = [
    { number: "100+", label: "Websites Protected" },
    { number: "90%", label: "Uptime Guarantee" },
    { number: "24/7", label: "Security Monitoring" },
    { number: "< 2min", label: "Response Time" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/5">
      <Navigation />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            About CyberSecure Analyzer
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We are a leading cybersecurity platform dedicated to protecting your digital assets 
            through advanced AI-powered security analysis and real-time threat detection. Our mission 
            is to make cybersecurity accessible, reliable, and effective for businesses of all sizes.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-20">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg bg-card/60 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Company Section */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl bg-gradient-to-r from-primary/5 to-accent/5 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-2xl bg-primary/10 text-primary">
                  <Award className="w-8 h-8" />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-6 text-foreground">
                Trusted by Industry Leaders
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Our platform has been trusted by thousands of organizations worldwide, 
                from startups to enterprise companies. We pride ourselves on delivering 
                cutting-edge cybersecurity solutions that evolve with the threat landscape.
              </p>
              <div className="flex justify-center items-center gap-2 text-primary font-medium">
                <Users className="w-5 h-5" />
                <span>Join thousands of satisfied customers</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-card/30 backdrop-blur-sm py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Powered by Raihanrama</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Advanced Cybersecurity Analysis Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;