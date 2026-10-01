import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where } from '../firebase';
import { Message } from '../types';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ArrowLeft, Loader2, User, Tractor } from 'lucide-react';
import { format } from 'date-fns';

const Chat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
      setLoading(false);
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user || !chatId) return;

    const text = inputText;
    setInputText('');

    try {
      await addDoc(collection(db, `chats/${chatId}/messages`), {
        chatId,
        senderId: user.uid,
        text,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 text-emerald-600 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-emerald-50/30 flex flex-col">
      {/* Chat Header */}
      <div className="bg-white border-b border-emerald-100 p-4 sticky top-16 z-40">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-emerald-600 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <User className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Equipment Owner</h2>
            <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Online
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-white rounded-3xl shadow-sm border border-emerald-50 flex items-center justify-center mx-auto mb-4">
              <Tractor className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="text-sm text-gray-400 font-medium">This is the start of your conversation about the equipment rental.</p>
          </div>

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-4 rounded-3xl shadow-sm ${msg.senderId === user?.uid ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-emerald-50'}`}>
                  <p className="font-medium leading-relaxed">{msg.text}</p>
                  <p className={`text-[10px] mt-1 font-bold uppercase tracking-wider ${msg.senderId === user?.uid ? 'text-emerald-200' : 'text-gray-400'}`}>
                    {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'hh:mm a') : 'Just now'}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-emerald-100 p-4 pb-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-4">
            <input 
              type="text" 
              placeholder="Type your message..." 
              className="flex-1 p-4 bg-emerald-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-medium"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button 
              type="submit"
              className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95"
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
