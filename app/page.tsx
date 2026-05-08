"use client";
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Download, Languages, Loader2 } from 'lucide-react';

export default function TranslatorMVP() {
  const [inputText, setInputText] = useState('');
  const [sourceLang, setSourceLang] = useState('中文');
  const [targetLang, setTargetLang] = useState('英文');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{original: string, translated: string}[]>([]);

  // 手工翻译逻辑
  const handleManualTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    const lines = inputText.split('\n').filter(l => l.trim());
    
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        body: JSON.stringify({ items: lines, sourceLang, targetLang }),
      });
      const data = await res.json();
      const newResults = lines.map((line, i) => ({
        original: line,
        translated: data.results[i] || '翻译失败'
      }));
      setResults(newResults);
    } catch (e) {
      alert("翻译出错");
    } finally {
      setLoading(false);
    }
  };

  // Excel 处理逻辑
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wsname], { header: 1 }) as string[][];
      
      // 提取第一列数据（假设数据在第一列）
      const toTranslate = data.map(row => row[0]).filter(Boolean);
      setInputText(toTranslate.join('\n'));
    };
    reader.readAsBinaryString(file);
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(results);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "翻译结果");
    XLSX.writeFile(workbook, "logistics_translation.xlsx");
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-blue-600">物流信息 AI 翻译 MVP</h1>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
          <div className="flex gap-4 items-center">
            <select className="border p-2 rounded" value={sourceLang} onChange={e => setSourceLang(e.target.value)}>
              <option>中文</option><option>英文</option><option>日语</option>
            </select>
            <Languages className="text-gray-400" />
            <select className="border p-2 rounded" value={targetLang} onChange={e => setTargetLang(e.target.value)}>
              <option>英文</option><option>中文</option><option>西班牙语</option>
            </select>
          </div>

          <textarea 
            className="w-full h-40 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="请输入地址、人名或物品信息，每行一个..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          <div className="flex gap-4">
            <button 
              onClick={handleManualTranslate}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : '开始翻译'}
            </button>

            <label className="cursor-pointer bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
              <Upload size={18} /> 上传 Excel
              <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
            </label>

            {results.length > 0 && (
              <button onClick={downloadExcel} className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 flex items-center gap-2">
                <Download size={18} /> 下载结果
              </button>
            )}
          </div>
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 border-b">原文</th>
                  <th className="p-4 border-b text-blue-600">翻译结果</th>
                </tr>
              </thead>
              <tbody>
                {results.map((res, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-4 border-b text-sm">{res.original}</td>
                    <td className="p-4 border-b text-sm font-medium">{res.translated}</td>
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
