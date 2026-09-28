import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Paperclip,
  AtSign,
  Filter,
  FileText,
  User,
  Clock,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MessageBoardView: React.FC = () => {
  const { messages, postMessage, wbsNodes, currentUser, users } = useApp();

  const [messageText, setMessageText] = useState('');
  const [selectedWbsFilter, setSelectedWbsFilter] = useState<string>('ALL');
  const [selectedWbsForNew, setSelectedWbsForNew] = useState<string>('');
  const [attachmentName, setAttachmentName] = useState<string>('');

  const availableTasks = wbsNodes.filter((n) => !wbsNodes.some((o) => o.parentId === n.id));

  const filteredMessages = messages.filter((msg) => {
    if (selectedWbsFilter === 'GENERAL') return msg.wbsId === null;
    if (selectedWbsFilter === 'ALL') return true;
    return msg.wbsId === selectedWbsFilter;
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    postMessage(
      messageText.trim(),
      selectedWbsForNew ? selectedWbsForNew : null,
      attachmentName || undefined
    );

    setMessageText('');
    setAttachmentName('');
  };

  const handleQuickMention = (name: string) => {
    setMessageText((prev) => `${prev} @${name} `);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Message Board & Kolaborasi Tim
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Forum komunikasi koordinasi proyek polymorphic: diskusi umum level proyek atau spesifik per paket WBS (Spec 5.6)
            </p>
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedWbsFilter}
              onChange={(e) => setSelectedWbsFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Topik ({messages.length})</option>
              <option value="GENERAL">Diskusi Umum Proyek</option>
              {availableTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.wbsCode}] {t.workName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Messages Feed + Post Input */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Messages Feed */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col h-[650px]">
          {/* Scrollable messages container */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {filteredMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs italic">
                <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
                Belum ada pesan pada kategori ini. Mulai diskusi pertama Anda di bawah!
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isMe = msg.userId === currentUser.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start space-x-3 text-xs ${
                      isMe ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <img
                      src={msg.userAvatar}
                      alt={msg.userName}
                      className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                    />

                    <div
                      className={`max-w-[80%] rounded-2xl p-4 shadow-2xs ${
                        isMe
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-slate-50 border border-slate-200 text-slate-900 rounded-tl-none'
                      }`}
                    >
                      <div
                        className={`flex items-center space-x-2 mb-1.5 ${
                          isMe ? 'justify-end text-blue-100' : 'text-slate-500'
                        }`}
                      >
                        <span className="font-bold text-slate-900 text-xs">
                          {isMe ? 'Anda' : msg.userName}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                            isMe ? 'bg-blue-700 text-blue-200' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {msg.userRole}
                        </span>
                        <span className="text-[10px] opacity-75 font-mono">
                          {new Date(msg.createdAt).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Polymorphic WBS Task Tag */}
                      {msg.wbsCode ? (
                        <div
                          className={`inline-flex items-center space-x-1 text-[10px] font-semibold px-2 py-0.5 rounded-md mb-2 ${
                            isMe
                              ? 'bg-blue-700/60 text-blue-100'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          <Layers className="w-2.5 h-2.5" />
                          <span>
                            WBS [{msg.wbsCode}] {msg.wbsWorkName}
                          </span>
                        </div>
                      ) : (
                        <div
                          className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md mb-2 ${
                            isMe ? 'bg-blue-700/60 text-blue-100' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          Umum Proyek
                        </div>
                      )}

                      <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>

                      {/* Attachment */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-white/20 flex flex-wrap gap-2">
                          {msg.attachments.map((att, idx) => (
                            <a
                              key={idx}
                              href={att.url}
                              onClick={(e) => e.preventDefault()}
                              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                                isMe
                                  ? 'bg-white/20 hover:bg-white/30 text-white'
                                  : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-800'
                              }`}
                            >
                              <FileText className="w-3 h-3" />
                              <span className="truncate max-w-[150px]">{att.name}</span>
                              <span className="text-[9px] opacity-75">({att.size})</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* New message input */}
          <form onSubmit={handleSend} className="pt-4 border-t border-slate-200 space-y-2.5 mt-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-slate-500 font-medium">Terkait ke:</span>
                <select
                  value={selectedWbsForNew}
                  onChange={(e) => setSelectedWbsForNew(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none"
                >
                  <option value="">Diskusi Umum Proyek</option>
                  {availableTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.wbsCode}] {t.workName}
                    </option>
                  ))}
                </select>
              </div>

              {attachmentName && (
                <div className="flex items-center space-x-1 text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  <FileText className="w-3 h-3" />
                  <span className="truncate max-w-[150px]">{attachmentName}</span>
                  <button
                    type="button"
                    onClick={() => setAttachmentName('')}
                    className="text-slate-400 hover:text-slate-600 ml-1"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Tulis pesan atau koordinasi... Gunakan @nama untuk mention"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />

              <label className="p-2.5 rounded-xl border border-slate-300 text-slate-500 hover:bg-slate-50 cursor-pointer transition">
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setAttachmentName(e.target.files[0].name);
                    }
                  }}
                />
                <Paperclip className="w-4 h-4" />
              </label>

              <button
                type="submit"
                disabled={!messageText.trim()}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Right Sidebar: Quick Mentions & Directory */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center space-x-2">
              <AtSign className="w-4 h-4 text-blue-600" />
              <span>Sebutkan Tim (@Mention)</span>
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Klik nama untuk memasukkan mention ke dalam kolom pesan:
            </p>

            <div className="space-y-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickMention(u.name)}
                  className="w-full flex items-center justify-between p-2 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition text-left text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-slate-800">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.roleTitle}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                    @{u.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
