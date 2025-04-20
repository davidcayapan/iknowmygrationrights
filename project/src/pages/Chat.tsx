import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Mic, Volume2, VolumeX, Languages } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/auth/AuthProvider';
import { generateChatResponse } from '../services/geminiService';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const WELCOME_MESSAGE = {
  en: "Hello! I'm your immigration rights assistant. I can help you understand your rights and navigate immigration matters. How can I assist you today?",
  es: "¡Hola! Soy tu asistente de derechos de inmigración. Puedo ayudarte a entender tus derechos y navegar asuntos de inmigración. ¿Cómo puedo ayudarte hoy?"
};

const PLACEHOLDER = {
  en: "Ask about your rights as an immigrant...",
  es: "Pregunta sobre tus derechos como inmigrante..."
};

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: WELCOME_MESSAGE[language],
        created_at: new Date().toISOString()
      }]);
    }
  }, [language]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        setMessages(data);
      } else {
        setMessages([{
          id: '1',
          role: 'assistant',
          content: WELCOME_MESSAGE[language],
          created_at: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'en' ? 'en-US' : 'es-ES';
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en');
    if (browserSupportsSpeechRecognition) {
      SpeechRecognition.stopListening();
      resetTranscript();
    }
  };

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ 
        continuous: true,
        language: language === 'en' ? 'en-US' : 'es-ES'
      });
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !user) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    resetTranscript();

    try {
      // Insert user message
      const { error: userMsgError } = await supabase
        .from('chat_messages')
        .insert({
          role: 'user',
          content: input,
          user_id: user.id
        });

      if (userMsgError) throw userMsgError;

      // Get chat history for context
      const history = messages.slice(-5).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Generate AI response
      const aiResponse = await generateChatResponse([...history, { role: 'user', content: input }], language);
      
      // Save AI response
      const { error: aiMsgError } = await supabase
        .from('chat_messages')
        .insert({
          role: 'assistant',
          content: aiResponse,
          user_id: user.id
        });

      if (aiMsgError) throw aiMsgError;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponse,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = language === 'en' 
        ? "I apologize, but I encountered an error. Please try again."
        : "Lo siento, pero encontré un error. Por favor, inténtalo de nuevo.";
      
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: errorMessage,
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-indigo-900 text-white p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold flex items-center">
              <Bot className="mr-2" /> 
              {language === 'en' ? 'Immigration Rights Assistant' : 'Asistente de Derechos de Inmigración'}
            </h2>
            <button
              onClick={toggleLanguage}
              className="flex items-center px-3 py-1 bg-indigo-800 rounded-full hover:bg-indigo-700 transition-colors"
              title={language === 'en' ? 'Switch to Spanish' : 'Cambiar a Inglés'}
            >
              <Languages size={16} className="mr-2" />
              {language === 'en' ? 'ES' : 'EN'}
            </button>
          </div>
          <p className="text-sm text-indigo-200">
            {language === 'en' 
              ? 'Ask questions about your rights as an immigrant'
              : 'Haz preguntas sobre tus derechos como inmigrante'}
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                }`}
              >
                <div className="flex items-center mb-1">
                  <span className="mr-2">
                    {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </span>
                  <span className="text-xs opacity-75">
                    {new Date(message.created_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => isSpeaking ? stopSpeaking() : speak(message.content)}
                      className="ml-2 opacity-75 hover:opacity-100"
                      title={isSpeaking 
                        ? language === 'en' ? "Stop speaking" : "Dejar de hablar"
                        : language === 'en' ? "Speak message" : "Reproducir mensaje"}
                    >
                      {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                  )}
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg rounded-tl-none p-3 shadow-sm">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" 
                       style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" 
                       style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" 
                       style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t">
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
            {browserSupportsSpeechRecognition && (
              <button
                onClick={toggleListening}
                className={`p-2 rounded-full mr-2 ${
                  listening 
                    ? 'text-red-600 bg-red-100' 
                    : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-100'
                }`}
                title={listening 
                  ? language === 'en' ? "Stop recording" : "Dejar de grabar"
                  : language === 'en' ? "Start recording" : "Empezar a grabar"}
              >
                <Mic size={20} />
              </button>
            )}
            <textarea
              className="flex-1 bg-transparent border-0 focus:ring-0 resize-none max-h-32 text-sm"
              placeholder={PLACEHOLDER[language]}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button 
              className={`p-1 rounded-full ${
                input.trim() ? 'text-indigo-600 hover:bg-indigo-100' : 'text-gray-400'
              }`}
              onClick={handleSend}
              disabled={!input.trim()}
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {language === 'en'
              ? 'Get accurate information about your rights as an immigrant'
              : 'Obtén información precisa sobre tus derechos como inmigrante'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;