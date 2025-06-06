import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Send, Sparkles, ArrowRight, MessageCircle, Lightbulb, Zap } from 'lucide-react-native';
import { useAIStore } from '@/store/ai-store';
import { useWardrobeStore } from '@/store/wardrobe-store';
import theme from '@/constants/theme';
import Button from '@/components/Button';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function AIStylerScreen() {
  const router = useRouter();
  const { getStyleAdvice, getPersonalizedStyleTips } = useAIStore();
  const { clothingItems } = useWardrobeStore();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your ModaChron AI Style Assistant. How can I help with your wardrobe today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [styleAdvice, setStyleAdvice] = useState<{ title: string; advice: string }[]>([]);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadStyleAdvice();
  }, []);

  const loadStyleAdvice = async () => {
    setIsLoadingAdvice(true);
    const advice = await getPersonalizedStyleTips();
    setStyleAdvice(advice);
    setIsLoadingAdvice(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await getStyleAdvice(input);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Scroll to bottom again after response
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error getting style advice:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble providing style advice right now. Please try again later.",
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  const quickPrompts = [
    "What should I wear to a job interview?",
    "Help me style my favorite jeans",
    "What colors go well with navy blue?",
    "How can I dress for hot weather but still look professional?",
  ];

  return (
    <>
      <Stack.Screen options={{ title: 'AI Style Assistant' }} />
      
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
        >
          {/* Style Tips Section */}
          <View style={styles.tipsContainer}>
            <View style={styles.tipsHeader}>
              <Lightbulb size={20} color={theme.colors.primary} />
              <Text style={styles.tipsTitle}>Personalized Style Tips</Text>
            </View>
            
            {isLoadingAdvice ? (
              <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tipsScrollContent}
              >
                {styleAdvice.map((tip, index) => (
                  <View key={index} style={styles.tipCard}>
                    <Text style={styles.tipTitle}>{tip.title}</Text>
                    <Text style={styles.tipText}>{tip.advice}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
          
          {/* Chat Messages */}
          {messages.map(message => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.role === 'user' ? styles.userMessage : styles.assistantMessage,
              ]}
            >
              {message.role === 'assistant' && (
                <View style={styles.assistantIcon}>
                  <Sparkles size={16} color="#FFFFFF" />
                </View>
              )}
              <View style={styles.messageBubble}>
                <Text style={styles.messageText}>{message.content}</Text>
              </View>
            </View>
          ))}
          
          {isLoading && (
            <View style={[styles.messageContainer, styles.assistantMessage]}>
              <View style={styles.assistantIcon}>
                <Sparkles size={16} color="#FFFFFF" />
              </View>
              <View style={styles.messageBubble}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            </View>
          )}
          
          {/* Quick Prompts */}
          <View style={styles.quickPromptsContainer}>
            <Text style={styles.quickPromptsTitle}>Try asking about:</Text>
            <View style={styles.promptsGrid}>
              {quickPrompts.map((prompt, index) => (
                <Pressable
                  key={index}
                  style={styles.promptButton}
                  onPress={() => handleQuickPrompt(prompt)}
                >
                  <Text style={styles.promptText}>{prompt}</Text>
                  <ArrowRight size={14} color={theme.colors.primary} />
                </Pressable>
              ))}
            </View>
          </View>
          
          {/* Outfit Generator Button */}
          <Pressable 
            style={styles.outfitGeneratorButton}
            onPress={() => router.push('/outfit-generator')}
          >
            <Zap size={20} color="#FFFFFF" />
            <Text style={styles.outfitGeneratorText}>Generate Complete Outfit</Text>
          </Pressable>
        </ScrollView>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask for style advice..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
          />
          <Pressable
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || isLoading}
          >
            <Send size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    paddingBottom: 20,
  },
  tipsContainer: {
    margin: theme.spacing.m,
    marginBottom: theme.spacing.l,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  tipsTitle: {
    fontSize: theme.fontSize.m,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
    color: theme.colors.text,
  },
  tipsScrollContent: {
    paddingBottom: theme.spacing.s,
    gap: theme.spacing.m,
  },
  tipCard: {
    width: 250,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  tipTitle: {
    fontSize: theme.fontSize.m,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
  },
  tipText: {
    fontSize: theme.fontSize.s,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  loader: {
    marginVertical: theme.spacing.m,
  },
  messageContainer: {
    marginVertical: theme.spacing.xs,
    marginHorizontal: theme.spacing.m,
    flexDirection: 'row',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  assistantMessage: {
    justifyContent: 'flex-start',
  },
  assistantIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.xs,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    backgroundColor: theme.colors.card,
  },
  messageText: {
    fontSize: theme.fontSize.m,
    color: theme.colors.text,
    lineHeight: 22,
  },
  quickPromptsContainer: {
    margin: theme.spacing.m,
    marginTop: theme.spacing.xl,
  },
  quickPromptsTitle: {
    fontSize: theme.fontSize.m,
    fontWeight: '600',
    marginBottom: theme.spacing.s,
    color: theme.colors.text,
  },
  promptsGrid: {
    gap: theme.spacing.s,
  },
  promptButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  promptText: {
    fontSize: theme.fontSize.s,
    color: theme.colors.text,
    flex: 1,
  },
  outfitGeneratorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    margin: theme.spacing.m,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    marginTop: theme.spacing.l,
  },
  outfitGeneratorText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.m,
    fontWeight: '600',
    marginLeft: theme.spacing.s,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.m,
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    maxHeight: 100,
    fontSize: theme.fontSize.m,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.s,
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.inactive,
  },
});