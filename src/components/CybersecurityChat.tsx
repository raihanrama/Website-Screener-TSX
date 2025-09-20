import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, Loader2, Copy, Check, Sparkles, Shield } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';
import sql from 'highlight.js/lib/languages/sql';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
// Custom syntax highlighting styles will be defined in the component

// Register languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('json', json);

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const CodeBlock = ({ language, code, index }: { language: string; code: string; index: number }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightedCode = language && hljs.getLanguage(language.toLowerCase())
    ? hljs.highlight(code, { language: language.toLowerCase() }).value
    : hljs.highlightAuto(code).value;

  return (
    <div className="my-6 group">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-t-xl px-4 py-3 flex items-center justify-between border border-slate-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-slate-300 text-sm font-medium ml-3">
            {language || 'code'}
          </span>
        </div>
        <Button
          onClick={handleCopy}
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-all duration-200"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
      <div className="bg-slate-900 border border-t-0 border-slate-700 rounded-b-xl">
        <style>{`
          .hljs {
            background: transparent !important;
            color: #e2e8f0 !important;
          }
          .hljs-keyword,
          .hljs-selector-tag,
          .hljs-title,
          .hljs-section,
          .hljs-doctag,
          .hljs-name,
          .hljs-strong {
            color: #60a5fa !important;
            font-weight: 600;
          }
          .hljs-string,
          .hljs-title.class_,
          .hljs-title.class_.inherited__,
          .hljs-title.function_ {
            color: #34d399 !important;
          }
          .hljs-attr,
          .hljs-variable,
          .hljs-template-variable,
          .hljs-type,
          .hljs-selector-class,
          .hljs-selector-attr,
          .hljs-selector-pseudo,
          .hljs-number {
            color: #fbbf24 !important;
          }
          .hljs-comment,
          .hljs-quote,
          .hljs-deletion,
          .hljs-meta {
            color: #94a3b8 !important;
            font-style: italic;
          }
          .hljs-addition {
            color: #10b981 !important;
          }
          .hljs-emphasis {
            font-style: italic;
          }
          .hljs-literal,
          .hljs-built_in {
            color: #f472b6 !important;
          }
          .hljs-tag {
            color: #60a5fa !important;
          }
          .hljs-tag .hljs-name {
            color: #60a5fa !important;
          }
          .hljs-tag .hljs-attr {
            color: #fbbf24 !important;
          }
          .hljs-tag .hljs-string {
            color: #34d399 !important;
          }
        `}</style>
        <div className="overflow-x-auto">
          <pre className="p-4 min-w-0">
            <code 
              className="text-sm leading-relaxed hljs block"
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          </pre>
        </div>
      </div>
    </div>
  );
};

export const CybersecurityChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        // Use smooth scrolling for better UX
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('cybersecurity-chat', {
        body: {
          message: input,
          conversation_history: conversationHistory
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: data.timestamp
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Gagal mengirim pesan. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessage = (content: string) => {
    // Split by code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Code block
        const codeContent = part.slice(3, -3);
        const lines = codeContent.split('\n');
        const language = lines[0].trim() || '';
        const code = lines.slice(language ? 1 : 0).join('\n').trim();
        
        return (
          <CodeBlock key={index} language={language} code={code} index={index} />
        );
      } else {
        // Regular text with enhanced formatting
        return (
          <div key={index} className="space-y-2">
            {part.split('\n').map((line, lineIndex) => {
              // Bold text
              if (line.includes('**')) {
                const parts = line.split(/(\*\*.*?\*\*)/g);
                return (
                  <div key={lineIndex} className="text-sm leading-relaxed">
                    {parts.map((textPart, partIndex) => 
                      textPart.startsWith('**') && textPart.endsWith('**') ? (
                        <span key={partIndex} className="font-bold text-primary">
                          {textPart.slice(2, -2)}
                        </span>
                      ) : (
                        <span key={partIndex}>{textPart}</span>
                      )
                    )}
                  </div>
                );
              }
              
              // Bullet points
              if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                return (
                  <div key={lineIndex} className="flex items-start gap-2 ml-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0"></div>
                    <span className="leading-relaxed">{line.replace(/^[•\-]\s*/, '')}</span>
                  </div>
                );
              }
              
              // Numbered lists
              if (line.trim().match(/^\d+\./)) {
                return (
                  <div key={lineIndex} className="flex gap-2 ml-2 text-sm font-medium">
                    <span className="text-primary font-bold">{line.match(/^\d+\./)?.[0]}</span>
                    <span className="leading-relaxed">{line.replace(/^\d+\.\s*/, '')}</span>
                  </div>
                );
              }
              
              // Empty lines
              if (line.trim() === '') {
                return <div key={lineIndex} className="h-2" />;
              }
              
              // Regular text
              return (
                <div key={lineIndex} className="text-sm leading-relaxed">
                  {line}
                </div>
              );
            })}
          </div>
        );
      }
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto h-[calc(100vh-12rem)] min-h-[600px] max-h-[900px] flex flex-col bg-gradient-to-br from-card via-card/80 to-muted/20 rounded-2xl border shadow-2xl overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/5 p-6 border-b backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card animate-pulse"></div>
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Cybersecurity Expert
            </h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Powered by Gemini-2.0-Flask Model
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-4 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              } animate-fade-in`}
            >
              {message.role === 'assistant' && (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div
                className={`min-w-[200px] rounded-2xl shadow-lg break-words ${
                  message.role === 'user'
                    ? 'max-w-[70%] bg-gradient-to-br from-primary to-primary/90 text-primary-foreground px-6 py-4 overflow-hidden'
                    : 'max-w-[98%] bg-gradient-to-br from-card to-muted/30 border px-6 py-5'
                }`}
                style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
              >
                {message.role === 'assistant' ? (
                  <div className="space-y-2 overflow-x-auto">{formatMessage(message.content)}</div>
                ) : (
                  <div className="text-sm font-medium leading-relaxed break-words">{message.content}</div>
                )}
                <div className={`text-xs mt-3 ${
                  message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>

              {message.role === 'user' && (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-secondary to-muted flex items-center justify-center flex-shrink-0 shadow-lg">
                  <User className="w-5 h-5 text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}
          
          {/* Template Questions - shown when no messages */}
          {messages.length === 0 && (
            <div className="flex gap-4 justify-start animate-fade-in">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="max-w-[98%] bg-gradient-to-br from-card to-muted/30 border px-6 py-5 rounded-2xl shadow-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">💡 Pertanyaan Template:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    "Bagaimana cara mencegah SQL Injection?",
                    "Apa itu Cross-Site Scripting (XSS)?",
                    "Implementasi HTTPS yang aman",
                    "Best practices password security",
                    "Cara melakukan vulnerability assessment",
                    "Perlindungan dari malware dan ransomware"
                  ].map((question, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInput(question);
                        setTimeout(() => handleSend(), 100);
                      }}
                      disabled={isLoading}
                      className="text-xs px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/30 transition-all duration-200 hover:scale-105 text-left"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {isLoading && (
            <div className="flex gap-4 justify-start animate-fade-in">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-gradient-to-br from-card to-muted/30 border px-6 py-4 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">Sedang mengetik...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-6 border-t bg-gradient-to-r from-card via-muted/10 to-card backdrop-blur-sm">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tanyakan tentang cybersecurity, coding, atau security best practices..."
              disabled={isLoading}
              className="pr-12 h-12 rounded-xl border-2 focus:border-primary transition-all duration-200 bg-background/80 backdrop-blur-sm"
            />
            <Sparkles className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="lg"
            className="h-12 px-6 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};