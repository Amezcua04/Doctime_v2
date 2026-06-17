import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Search, X, ArrowLeft, MessageSquare, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { toast } from 'sonner';
import { Message, User } from '@/types';

interface Props {
  contacts: User[];
}

export default function ChatIndex({ contacts: initialContacts }: Props) {
  const { auth } = usePage<{ auth: { user: User } }>().props;
  const currentUser = auth.user;

  const [contactsList, setContactsList] = useState<User[]>(initialContacts);
  const [selectedContact, setSelectedContact] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypedTimeRef = useRef<number>(0);

  const filteredContacts = contactsList.filter(contact => {
    const lowerQuery = searchQuery.toLowerCase();
    const nameMatch = (contact.name || '').toLowerCase().includes(lowerQuery);
    const emailMatch = (contact.email || '').toLowerCase().includes(lowerQuery);
    return nameMatch || emailMatch;
  });

  useEcho(
    `chat.${currentUser.id}`,
    '.message.sent',
    (e: any) => {
      if (selectedContact && e.sender_id === selectedContact.id) {
        setIsTyping(false);
        setMessages(prev => [...prev, e]);
        setTimeout(scrollToBottom, 100);
        axios.get(`/chat/${e.sender_id}`);
      }
      else {
        setContactsList(prev => prev.map(contact => {
          if (contact.id === e.sender_id) {
            return { ...contact, unread_count: (contact.unread_count || 0) + 1 };
          }
          return contact;
        }));
        toast.success(`Nuevo mensaje de ${e.sender_name}`);
      }
    },
    [selectedContact],
    'private'
  );

  useEcho(
    `chat.${currentUser.id}`,
    '.user.typing',
    (e: any) => {
      if (selectedContact && e.sender_id === selectedContact.id) {
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
      }
    },
    [selectedContact],
    'private'
  );

  const handleContactSelect = (contact: User) => {
    setSelectedContact(contact);
    setMobileView('chat');
    setIsTyping(false);
    setContactsList(prev => prev.map(c =>
      c.id === contact.id ? { ...c, unread_count: 0 } : c
    ));
  };

  const handleBackToList = () => {
    setMobileView('list');
  };

  useEffect(() => {
    if (selectedContact) {
      setLoading(true);
      axios.get(`/chat/${selectedContact.id}`)
        .then(res => {
          setMessages(res.data);
          setTimeout(scrollToBottom, 100);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedContact]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTypingInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!selectedContact) return;
    const now = Date.now();
    if (now - lastTypedTimeRef.current > 2000) {
      axios.post('/chat/typing', { receiver_id: selectedContact.id });
      lastTypedTimeRef.current = now;
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    const tempMessage = {
      id: Date.now(),
      sender_id: currentUser.id,
      receiver_id: selectedContact.id,
      content: newMessage,
      created_at: new Date().toISOString(),
      sender: currentUser,
      read_at: null
    } as Message;

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    setIsTyping(false);
    setTimeout(scrollToBottom, 50);

    axios.post('/chat', {
      receiver_id: selectedContact.id,
      content: tempMessage.content
    }).catch(err => toast.error("Error al enviar el mensaje"));
  };

  return (
    <>
      <Head title="Chat" />
      <div className="flex h-[calc(100dvh-8rem)] md:h-[calc(100vh-8rem)] border border-border bg-background overflow-hidden rounded-xl shadow-sm m-2 md:m-6">

        <div className={cn(
          "w-full md:w-80 lg:w-96 border-r border-border flex-col bg-background shrink-0 h-full",
          mobileView === 'chat' ? "hidden md:flex" : "flex"
        )}>
          <div className="p-4 border-b border-border space-y-3 bg-muted/20 shrink-0">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Chats
            </h2>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar contacto..."
                className="pl-9 bg-background border-border h-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 min-h-0 bg-background overflow-y-auto">
            <div className="p-2 space-y-1">
              {filteredContacts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No se encontraron contactos.
                </div>
              ) : (
                filteredContacts.map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => handleContactSelect(contact)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all group cursor-pointer",
                      selectedContact?.id === contact.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarFallback className="bg-muted text-muted-foreground font-bold text-xs">
                          {contact.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {(contact.unread_count ?? 0) > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground shadow-sm ring-2 ring-background z-10">
                          {(contact.unread_count ?? 0) > 9 ? '9+' : contact.unread_count}
                        </span>
                      )}
                    </div>

                    <div className="overflow-hidden flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <p className="text-sm font-medium truncate pr-2">{contact.name}</p>
                      </div>
                      <p className={cn(
                        "text-xs truncate",
                        (contact.unread_count ?? 0) > 0 ? "font-semibold text-foreground" : "text-muted-foreground"
                      )}>
                        {(contact.unread_count ?? 0) > 0
                          ? `${contact.unread_count} mensajes nuevos`
                          : contact.email || 'Sin correo'
                        }
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className={cn(
          "flex-1 flex-col bg-muted/5 min-w-0 h-full relative",
          mobileView === 'list' ? "hidden md:flex" : "flex"
        )}>
          {selectedContact ? (
            <>
              <div className="p-3 md:p-4 border-b border-border bg-background flex items-center gap-3 shadow-sm shrink-0 z-10">
                <Button variant="ghost" size="icon" className="md:hidden shrink-0 cursor-pointer" onClick={handleBackToList}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>

                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {selectedContact.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-foreground text-sm truncate">{selectedContact.name}</h3>
                  {isTyping ? (
                    <span className="text-xs text-primary animate-pulse font-medium">
                      Escribiendo...
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      En línea
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-hidden relative">
                <ScrollArea className="h-full w-full p-4">
                  {loading ? (
                    <div className="h-full flex items-center justify-center min-h-[200px]">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-4 flex flex-col pb-4">
                      {messages.length === 0 && (
                        <div className="text-center py-12 flex flex-col items-center">
                          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
                          </div>
                          <p className="text-muted-foreground text-sm">Inicia la conversación con {selectedContact.name}</p>
                        </div>
                      )}
                      {messages.map((msg, idx) => {
                        const isMe = msg.sender_id === currentUser.id;
                        return (
                          <div key={idx} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                            <div className={cn(
                              "max-w-[85%] md:max-w-[70%] px-4 py-2.5 rounded-2xl text-sm shadow-sm break-words",
                              isMe
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-card text-card-foreground border border-border rounded-bl-sm"
                            )}>
                              <p className="leading-relaxed">{msg.content}</p>
                              <p className={cn(
                                "text-[10px] mt-1 text-right opacity-70",
                                isMe ? "text-primary-foreground/80" : "text-muted-foreground"
                              )}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={scrollRef} />
                    </div>
                  )}
                </ScrollArea>
              </div>

              <div className="p-3 bg-background border-t border-border shrink-0">
                <form onSubmit={handleSend} className="flex gap-2 items-center">
                  <Input
                    value={newMessage}
                    onChange={handleTypingInput}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-muted/30 border-border focus-visible:ring-primary h-11"
                  />
                  <Button type="submit" size="icon" disabled={!newMessage.trim()} className="h-10 w-10 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer rounded-full">
                    <Send className="h-6 w-6" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-6 text-center h-full">
              <div className="h-24 w-24 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                <MessageSquare className="h-12 w-12 opacity-20" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Mensajería interna</h3>
              <p className="text-sm max-w-xs mx-auto">Selecciona un miembro del equipo de la izquierda para comenzar a chatear.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

ChatIndex.layout = {
  breadcrumbs: [
    {
      title: 'Mensajería',
      href: '/chat',
    },
  ],
};