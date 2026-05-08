"use client";
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Download, Languages, Loader2, AlertCircle } from 'lucide-react';

const LANGUAGES = [
  { label: '中文', value: 'Chinese' },
  { label: '英语', value: 'English' },
  { label: '日语', value: 'Japanese' },
  { label: '韩语', value: 'Korean' },
  { label: '法语', value: 'French' },
  { label: '德语', value: 'German' },
  { label: '西班牙语', value: 'Spanish' },
  { label: '俄语', value: 'Russian' },
  { label: '越南语', value: 'Vietnamese' },
  { label: '泰语', value: 'Thai' },
];

export default function TranslatorUI() {
  const [inputText, setInputText] = useState('');
  const [sourceLang, setSourceLang] = useState('Chinese');
  const [targetLang, setTargetLang] = useState('English');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{original: string, translated: string}[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  // 在 handleManualTranslate 函数中增加超时提醒逻辑
  const handleManualTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setErrorMsg('');
    
    // 逻辑：如果单行内包含分隔符，提示 AI 这是一个复合条目
    const lines = inputText.split('\n').filter(l => l.trim());
    
    try {
      // 设置一个前端计时器，如果超过 20 秒给用户一个反馈
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log("检测到处理时间较长，请稍候...");
      }, 20000);
  
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: lines, sourceLang, targetLang }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || '翻译失败');
  
      const newResults = lines.map((line, i) => ({
        original: line,
        translated: data.results[i] || '翻译异常'
      }));
      setResults(newResults);
    } catch (e: any) {
      setErrorMsg("请求超时或服务器忙，请稍后再试。错误信息: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // ... (handleFileUpload 和 downloadExcel 逻辑保持不变)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wsname], { header: 1 }) as any[][];
      const toTranslate = data.map(row => String(row[0] || '').trim()).filter(Boolean);
      setInputText(toTranslate.join('\n'));
    };
    reader.readAsBinaryString(file);
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(results);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
    XLSX.writeFile(workbook, "logistics_translation.xlsx");
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-10 text-slate-800">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold text-blue-700 flex items-center gap-2">
            <Languages className="w-8 h-8" /> 全球物流智能翻译
          </h1>
          <p className="text-slate-500">基于英伟达 MiniMax-abab6.5 模型优化的物流专版翻译系统</p>
        </header>
        
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center gap-2">
            <AlertCircle size={18} />
            <span>错误：{errorMsg} (请检查 Vercel 环境变量配置)</span>
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 space-y-6">
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
              <label className="text-sm font-semibold text-slate-600">原始语言</label>
              <select className="border border-slate-300 p-3 rounded-lg bg-white outline-blue-500" value={sourceLang} onChange={e => setSourceLang(e.target.value)}>
                {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            
            <div className="pt-6 hidden md:block">
              <Languages className="text-slate-300" />
            </div>

            <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
              <label className="text-sm font-semibold text-slate-600">目标语言</label>
              <select className="border border-slate-300 p-3 rounded-lg bg-white outline-blue-500" value={targetLang} onChange={e => setTargetLang(e.target.value)}>
                {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>

          <textarea 
            className="w-full h-48 p-5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none text-lg"
            placeholder="粘贴地址、姓名或货名。例如：深圳市龙岗区坂田街道..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          <div className="flex flex-wrap gap-4 pt-2">
            <button 
              onClick={handleManualTranslate}
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-300 shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : '立即翻译'}
            </button>

            <label className="cursor-pointer bg-slate-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all flex items-center gap-2">
              <Upload size={18} /> 上传 Excel
              <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
            </label>

            {results.length > 0 && (
              <button onClick={downloadExcel} className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all flex items-center gap-2">
                <Download size={18} /> 导出结果
              </button>
            )}
          </div>
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-5 font-bold border-b">原文</th>
                  <th className="p-5 font-bold border-b text-blue-600">翻译结果 (物流推荐)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((res, i) => (
                  <tr key={i}>
                    <td className="p-5 text-slate-600">{res.original}</td>
                    <td className="p-5 font-semibold text-slate-900">{res.translated}</td>
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
