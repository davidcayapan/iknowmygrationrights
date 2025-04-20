import { supabase } from '../lib/supabase';
import { generateChatResponse } from './geminiService';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export const sendMessage = async (message: string): Promise<ChatMessage> => {
  try {
    // Save user message to database
    const { data: userMessage, error: userError } = await supabase
      .from('chat_messages')
      .insert({
        role: 'user',
        content: message,
      })
      .select()
      .single();

    if (userError) throw userError;

    // Get chat history for context
    const { data: history } = await supabase
      .from('chat_messages')
      .select('role, content')
      .order('created_at', { ascending: true })
      .limit(10);

    // Generate response using Gemini
    const response = await generateChatResponse(history || []);

    // Save assistant response to database
    const { data: assistantMessage, error: assistantError } = await supabase
      .from('chat_messages')
      .insert({
        role: 'assistant',
        content: response,
      })
      .select()
      .single();

    if (assistantError) throw assistantError;

    return assistantMessage;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getChatHistory = async (): Promise<ChatMessage[]> => {
  try {
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return messages || [];
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
};