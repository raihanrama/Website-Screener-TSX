import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WebsiteAnalyzer } from '@/components/WebsiteAnalyzer';
import { CybersecurityChat } from '@/components/CybersecurityChat';
import Navigation from '@/components/Navigation';
import { Shield, MessageSquare, Lock, Sparkles } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/5">
      <Navigation />
      
      {/* Hero Section with Main Features */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-12 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Advanced Cybersecurity Platform
          </h1>
        </div>

        {/* Main Features */}
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="analyzer" className="w-full">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-2 mb-12 bg-card/50 backdrop-blur-sm border shadow-lg h-14">
              <TabsTrigger 
                value="analyzer" 
                className="flex items-center gap-2 text-base font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
              >
                <Lock className="w-5 h-5" />
                Website Analyzer
              </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                className="flex items-center gap-2 text-base font-medium data-[state=active]:bg-accent data-[state=active]:text-accent-foreground transition-all duration-300"
              >
                <MessageSquare className="w-5 h-5" />
                AI Assistant
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analyzer" className="mt-0">
              <WebsiteAnalyzer />
            </TabsContent>

            <TabsContent value="chat" className="mt-0">
              <div className="w-full px-4">
                <CybersecurityChat />
              </div>
            </TabsContent>
          </Tabs>
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

export default Index;
