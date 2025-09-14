import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Phone, Send, CheckCircle2, Search, Wifi, LogOut, RefreshCcw } from 'lucide-react';

interface WhatsAppMessage {
  id: string;
  from: string;
  message: string;
  timestamp: Date;
  type: 'incoming' | 'outgoing';
  status: 'sent' | 'delivered' | 'read';
}

// Types for server API payloads
type WaChat = { id: string; name: string; unreadCount?: number };
type WaChatsResponse = { chats: WaChat[] };
type WaMessage = { id: string; chatId: string; from: string; to: string; body: string; fromMe: boolean; timestamp: number; type: string; ack?: number };
type WaMessagesResponse = { messages: WaMessage[] };
type SendBody = { chatId?: string; to?: string; message: string };

type ChatListItem = { id: string; name: string; unread: number };

function WhatsAppIntegration() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  // WhatsApp Web QR modal states
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [waStatus, setWaStatus] = useState<'idle'|'qr'|'connecting'|'ready'|'disconnected'>('idle');
  const pollRef = useRef<number | null>(null);
  // Selected chat (left pane)
  const [selectedChat, setSelectedChat] = useState<string>('');

  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [chatList, setChatList] = useState<ChatListItem[]>([]);
  const quickReplies = ['🏛️ Ana Menü','📚 İçtihat Ara','📝 Dilekçe Hazırla','⚖️ Hukuki Danışmanlık','📞 Canlı Destek'];

  // Use only real chats from backend; if empty, show proper empty state
  const currentPeer = chatList.find(c => c.id === selectedChat)?.name || '';
  const currentMessages = useMemo(() => messages, [messages]);

  const handleConnect = () => {
    // Yeni akış: Panel içinden WhatsApp Web QR ile bağlan
    setShowQRModal(true);
    setWaStatus('connecting');
    // İlk durum ve QR'ı çek
    fetch('/wa/status').then(r=>r.json()).then(data => {
      setWaStatus(data.status || 'disconnected');
      if (data.status !== 'ready') {
        fetch('/wa/qr').then(r=>r.json()).then(q => {
          if (q.qr) setQrDataUrl(q.qr);
          setWaStatus('qr');
  }).catch((e)=>{ console.warn('WA QR fetch failed', e); });
      } else {
        setIsConnected(true);
        setShowQRModal(false);
      }
    }).catch(() => {
      // servis yoksa modalda bilgi gösterilecek
      setWaStatus('disconnected');
    });

    // Poll ile bağlantı durumunu izle
    if (pollRef.current) window.clearInterval(pollRef.current);
    pollRef.current = window.setInterval(() => {
      fetch('/wa/status').then(r=>r.json()).then(data => {
        setWaStatus(data.status || 'disconnected');
        if (data.status === 'ready') {
          setIsConnected(true);
          if (pollRef.current) window.clearInterval(pollRef.current);
          setShowQRModal(false);
          // Load chats on ready
          fetch('/wa/chats')
            .then(r=>r.json())
            .then((j: WaChatsResponse)=>{
            const list: ChatListItem[] = (j.chats||[]).map((c)=>({ id: c.id, name: c.name, unread: c.unreadCount||0 }));
            setChatList(list);
            if (list.length>0) {
              setSelectedChat(list[0].id);
            }
          }).catch(()=>{});
        }
  }).catch((e)=>{ console.warn('WA status poll failed', e); });
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/wa/logout', { method: 'POST' });
    } catch (e) {
      console.warn('WA logout failed', e);
    }
    setIsConnected(false);
    setWaStatus('disconnected');
  };

  // Start a new chat to a phone number by sending first message
  const startNewChat = async (initialMessage?: string) => {
    const digits = phoneNumber.replace(/\D+/g, '');
    if (!digits || digits.length < 7) return; // basic guard
    const msg = (initialMessage && initialMessage.trim()) || messageText.trim() || 'Merhaba';
    try {
      const body = { to: digits, message: msg };
      const r = await fetch('/wa/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error('send failed');
      const sent = await r.json();
      const jid: string = sent.to || sent.id || `${digits}@c.us`;
      // Refresh chats and select this conversation
  const cj = await fetch('/wa/chats').then(x=>x.json() as Promise<WaChatsResponse>).catch(()=>({chats:[]} as WaChatsResponse));
  const list: ChatListItem[] = (cj.chats||[]).map((c: WaChat)=>({ id: c.id, name: c.name, unread: c.unreadCount||0 }));
      setChatList(list);
      setSelectedChat(jid);
      // Pull its messages
      fetch(`/wa/messages?chatId=${encodeURIComponent(jid)}&limit=30`).then(res=>res.json()).then((j: WaMessagesResponse)=>{
        const msgs: WhatsAppMessage[] = (j.messages||[]).map((m)=>({ id: m.id, from: m.fromMe ? 'me' : m.from, message: m.body, timestamp: new Date(m.timestamp), type: m.fromMe ? 'outgoing' : 'incoming', status: 'delivered' }));
        setMessages(msgs);
      }).catch(()=>{});
    } catch (e) {
      console.warn('startNewChat error', e);
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;
    try {
      const body: SendBody = { message };
      if (selectedChat) body.chatId = selectedChat;
      const r = await fetch('/wa/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error('send failed');
      const now = new Date();
      setMessages(prev => [...prev, { id: String(now.getTime()), from: 'me', message, timestamp: now, type: 'outgoing', status: 'sent' }]);
      // refresh last messages briefly
      if (selectedChat) {
        fetch(`/wa/messages?chatId=${encodeURIComponent(selectedChat)}&limit=30`).then(res=>res.json()).then((j: WaMessagesResponse)=>{
          const msgs: WhatsAppMessage[] = (j.messages||[]).map((m)=>({ id: m.id, from: m.fromMe ? 'me' : m.from, message: m.body, timestamp: new Date(m.timestamp), type: m.fromMe ? 'outgoing' : 'incoming', status: 'delivered' }));
          setMessages(msgs);
        }).catch(()=>{});
      }
    } catch (e) {
      console.warn('sendMessage error', e);
    }
  };
  // Controlled input for message box
  const [messageText, setMessageText] = useState('');
  const handleSendClick = () => {
    const text = messageText.trim();
    if (!text) return;
    sendMessage(text);
    setMessageText('');
  };

  // When selectedChat changes and connected, fetch messages
  useEffect(()=>{
    if (!isConnected || !selectedChat) return;
    fetch(`/wa/messages?chatId=${encodeURIComponent(selectedChat)}&limit=50`).then(r=>r.json()).then((j: WaMessagesResponse)=>{
      const msgs: WhatsAppMessage[] = (j.messages||[]).map((m)=>({ id: m.id, from: m.fromMe ? 'me' : m.from, message: m.body, timestamp: new Date(m.timestamp), type: m.fromMe ? 'outgoing' : 'incoming', status: 'delivered' }));
      setMessages(msgs);
    }).catch(()=>{});
    // continuous polling for new messages while connected
    const id = window.setInterval(()=>{
      fetch(`/wa/messages?chatId=${encodeURIComponent(selectedChat)}&limit=50`).then(r=>r.json()).then((j: WaMessagesResponse)=>{
        const msgs: WhatsAppMessage[] = (j.messages||[]).map((m)=>({ id: m.id, from: m.fromMe ? 'me' : m.from, message: m.body, timestamp: new Date(m.timestamp), type: m.fromMe ? 'outgoing' : 'incoming', status: 'delivered' }));
        setMessages(msgs);
      }).catch(()=>{});
    }, 2000);
    return () => { if (id) window.clearInterval(id); };
  }, [isConnected, selectedChat]);

  // While connected, poll chat list regularly to catch new conversations
  useEffect(()=>{
    if (!isConnected) return;
    const id = window.setInterval(()=>{
      fetch('/wa/chats').then(r=>r.json()).then((j: WaChatsResponse)=>{
        const list: ChatListItem[] = (j.chats||[]).map((c)=>({ id: c.id, name: c.name, unread: c.unreadCount||0 }));
        setChatList(list);
        if (!selectedChat && list.length>0) setSelectedChat(list[0].id);
      }).catch(()=>{});
    }, 5000);
    return ()=>{ window.clearInterval(id); };
  }, [isConnected, selectedChat]);
  const handleMessageKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendClick();
    }
  };

  return (
    <div className="h-[80vh] bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Top bar */}
      <div className="h-14 bg-green-600 text-white flex items-center px-4 gap-3">
        <MessageCircle className="w-5 h-5" />
        <div className="font-semibold">WhatsApp Web</div>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-300' : 'bg-red-300'}`} />
          {isConnected ? 'Bağlı' : 'Bağlı Değil'}
          {!isConnected && (
            <button onClick={handleConnect} className="ml-3 inline-flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded">
              <Wifi className="w-4 h-4" /> Bağlan
            </button>
          )}
          {isConnected && (
            <button onClick={handleLogout} className="ml-2 inline-flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded">
              <LogOut className="w-4 h-4" /> Çıkış
            </button>
          )}
        </div>
      </div>

      {/* Body: left sidebar + right chat */}
      <div className="h-[calc(80vh-3.5rem)] flex">
        {/* Sidebar */}
        <aside className="w-80 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 flex flex-col">
          {/* Search */}
          <div className="p-3">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1.5">
              <Search className="w-4 h-4 text-gray-400" />
              <input placeholder="Ara veya yeni sohbet başlat" className="w-full bg-transparent outline-none text-sm text-gray-800 dark:text-gray-100" />
            </div>
          </div>
          {/* Chats */}
          <div className="flex-1 overflow-y-auto">
            {chatList.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 px-4 text-center">
                {waStatus === 'ready' ? 'Sohbet bulunamadı.' : 'WhatsApp bağlantısı kurulunca sohbetler burada görünecek.'}
              </div>
            ) : (
              chatList.map(c => (
                <button key={c.id} onClick={()=>setSelectedChat(c.id)} className={`w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 ${selectedChat===c.id ? 'bg-gray-100 dark:bg-gray-800' : ''}`}>
                  <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center">{(c.name||'??').slice(0,2)}</div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{c.name||c.id}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{selectedChat===c.id ? 'Seçildi' : ''}</div>
                  </div>
                  {c.unread>0 && (
                    <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-xs bg-green-600 text-white rounded-full">{c.unread}</span>
                  )}
                </button>
              ))
            )}
          </div>
          {/* Footer settings */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" /> {phoneNumber || '+90 ••• ••• ••••'}
            </div>
            <div className="mt-2 flex gap-2">
              <input type="tel" value={phoneNumber} onChange={(e)=>setPhoneNumber(e.target.value)} placeholder="Numara gir" className="w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded outline-none" />
              <button onClick={handleConnect} disabled={isConnected} className="px-2 py-1 bg-green-600 text-white rounded disabled:opacity-50" aria-label="QR ile bağlan" title="QR ile bağlan">
                <RefreshCcw className="w-4 h-4" />
              </button>
              <button onClick={()=>startNewChat()} disabled={!isConnected || phoneNumber.replace(/\D+/g,'').length<7} className="px-2 py-1 bg-blue-600 text-white rounded disabled:opacity-50" aria-label="Yeni sohbet başlat" title="Yeni sohbet başlat">
                Başlat
              </button>
            </div>
          </div>
        </aside>

        {/* Chat pane */}
        <section className="flex-1 flex flex-col bg-white dark:bg-gray-900">
          {/* Chat header */}
          <div className="h-14 border-b border-gray-200 dark:border-gray-800 px-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center">{currentPeer.slice(0,2)}</div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{currentPeer}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{isConnected ? 'Çevrimiçi' : 'Bağlı değil'}</div>
            </div>
          </div>

          {/* Connection banner */}
          {waStatus !== 'ready' && (
            <div className="px-4 py-2 text-sm bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200">
              WhatsApp Web bağlantısı hazır değil. <button onClick={handleConnect} className="underline">QR ile bağlan</button>.
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/40">
            {currentMessages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'outgoing' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-lg px-3 py-2 shadow-sm ${message.type==='outgoing' ? 'bg-green-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'}`}>
                  <div className="whitespace-pre-wrap text-sm">{message.message}</div>
                  <div className="flex items-center gap-1 mt-1 justify-end text-[10px] opacity-70">
                    {message.timestamp.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})}
                    {message.type==='outgoing' && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Composer */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-3">
            <div className="flex flex-wrap gap-2 mb-2">
              {quickReplies.map((reply, idx) => (
                <button key={idx} onClick={()=>sendMessage(reply)} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                  {reply}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                aria-label="Mesaj"
                placeholder="Mesaj yazın..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleMessageKeyDown}
                className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-gray-100"
              />
              <button onClick={handleSendClick} disabled={!messageText.trim()} aria-label="Mesaj Gönder" title="Mesaj Gönder" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">WhatsApp Web ile Bağlan</h3>
              <button onClick={()=>setShowQRModal(false)} className="px-2 py-1 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700">Kapat</button>
            </div>
            <div className="space-y-4">
              {waStatus === 'disconnected' && (
                <div className="text-sm text-red-600 dark:text-red-400">Bağlantı servisine ulaşılamadı. Lütfen servislerin açık olduğundan emin olun.</div>
              )}
              {qrDataUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <img src={qrDataUrl} alt="WhatsApp QR" className="w-64 h-64 rounded border" />
                  <p className="text-sm text-gray-600 dark:text-gray-300 text-center">Telefonunuzdan WhatsApp &gt; Bağlı Cihazlar &gt; Cihaz Bağla ile bu QR'ı okutun.</p>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-pulse text-gray-600 dark:text-gray-300">QR yükleniyor...</div>
                </div>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400">Durum: {waStatus}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WhatsAppIntegration;