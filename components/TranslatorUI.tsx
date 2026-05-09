"use client";
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Download, Languages, Loader2, Settings2 } from 'lucide-react';

const LANGUAGES = [
  { label: '中文', value: 'Chinese' },
  { label: '英语', value: 'English' },
  { label: '日语', value: 'Japanese' },
  { label: '韩语', value: 'Korean' },
  { label: '德语', value: 'German' },
  { label: '西班牙语', value: 'Spanish' },
];

const MODELS = [
  { name: 'MiniMax M2.7 (推荐)', id: 'minimaxai/minimax-m2.7' },
  { name: 'Mistral Small (极速)', id: 'mistralai/mistral-small-2402' }, // 注意：根据NVIDIA实际ID调整
  { name: 'Mistral Medium', id: 'mistralai/mistral-medium-2407' },
];

export default function TranslatorUI() {
  const [inputText, setInputText] = useState('');
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Japanese');
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id); // 默认选第一个
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{original: string, translated: string}[]>([]);

  const handleManualTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    const lines = inputText.split('\n').filter(l => l.trim());
    
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: lines, 
          sourceLang, 
          targetLang,
          model: selectedModel // 发送选择的模型
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const newResults = lines.map((line, i) => ({
        original: line,
        translated: data.results[i] || '翻译未返回'
      }));
      setResults(newResults);
    } catch (e: any) {
      alert("翻译出错: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Excel 导入逻辑保持不变...
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
      setInputText(data.map(r => r[0]).filter(Boolean).join('\n'));
    };
    reader.readAsBinaryString(file);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header with Model Selection */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border">
          <div>
            <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
              <Languages size={24} /> 物流智能翻译系统
            </h1>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
            <span className="text-xs font-bold text-slate-500 ml-2 flex items-center gap-1">
              <Settings2 size={14} /> 引擎:
            </span>
            <select 
              className="bg-transparent text-sm font-medium p-1 outline-none cursor-pointer"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {MODELS.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Translation Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-6">
          <div className="flex items-center gap-4">
            <select className="border p-2 rounded-lg flex-1" value={sourceLang} onChange={e => setSourceLang(e.target.value)}>
              {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            <div className="text-slate-300">➜</div>
            <select className="border p-2 rounded-lg flex-1" value={targetLang} onChange={e => setTargetLang(e.target.value)}>
              {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>

          <textarea 
            className="w-full h-48 p-4 border rounded-xl bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all"
            placeholder="粘贴多行物流数据..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleManualTranslate}
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : '开始翻译'}
            </button>
            <label className="cursor-pointer bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-black flex items-center gap-2">
              <Upload size={18} /> 上传 Excel
              <input type="file" className="hidden" onChange={handleFileUpload} />
            </label>
            {results.length > 0 && (
              <button 
                onClick={() => {
                  const ws = XLSX.utils.json_to_sheet(results);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
                  XLSX.writeFile(wb, "translation.xlsx");
                }}
                className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-600 flex items-center gap-2"
              >
                <Download size={18} /> 导出结果
              </button>
            )}
          </div>
        </div>

        {/* Results Table */}
        {results.length > 0 && (
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4 text-sm font-bold text-slate-500">原文</th>
                  <th className="p-4 text-sm font-bold text-blue-600">翻译结果</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {results.map((res, i) => (
                  <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 text-sm">{res.original}</td>
                    <td className="p-4 text-sm font-semibold">{res.translated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
