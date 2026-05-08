"use client";
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Download, Languages, Loader2 } from 'lucide-react';

export default function TranslatorUI() {
  const [inputText, setInputText] = useState('');
  const [sourceLang, setSourceLang] = useState('中文');
  const [targetLang, setTargetLang] = useState('英文');
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
        body: JSON.stringify({ items: lines, sourceLang, targetLang }),
      });
      const data = await res.json();
      const newResults = lines.map((line, i) => ({
        original: line,
        translated: data.results[i] || '翻译失败'
      }));
      setResults(newResults);
    } catch (e) {
      console.error(e);
      alert("翻译服务异常，请检查 API Key 配置");
    } finally {
      setLoading(false);
    }
  };

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
    XLSX.utils.book_append_sheet(workbook, worksheet, "翻译结果");
    XLSX.writeFile(workbook, "translation_results.xlsx");
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-600">物流 AI 翻译 MVP</h1>
          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">NVIDIA MiniMax 2.7</span>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
          <div className="flex gap-4 items-center">
            <select className="border p-2 rounded bg-white" value={sourceLang} onChange={e => setSourceLang(e.target.value)}>
              <option>中文</option><option>英文</option><option>日语</option><option>韩语</option>
            </select>
            <Languages className="text-gray-400" />
            <select className="border p-2 rounded bg-white" value={targetLang} onChange={e => setTargetLang(e.target.value)}>
              <option>英文</option><option>中文</option><option>西班牙语</option><option>德语</option><option>法语</option>
            </select>
          </div>

          <textarea 
            className="w-full h-40 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
            placeholder="输入物流信息（地址、姓名、品名），每行一条..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          <div className="flex flex-wrap gap-4">
            <button 
              onClick={handleManualTranslate}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : '立即翻译'}
            </button>

            <label className="cursor-pointer bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2">
              <Upload size={18} /> 上传 Excel
              <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
            </label>

            {results.length > 0 && (
              <button onClick={downloadExcel} className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2">
                <Download size={18} /> 导出表格
              </button>
            )}
          </div>
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-600 text-sm">
                  <tr>
                    <th className="p-4 border-b font-semibold">原文内容</th>
                    <th className="p-4 border-b font-semibold text-blue-600">AI 翻译 (物流标准)</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {results.map((res, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 border-b border-gray-100">{res.original}</td>
                      <td className="p-4 border-b border-gray-100 font-medium text-gray-800">{res.translated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
