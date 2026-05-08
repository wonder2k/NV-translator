"use client";
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Languages, Download, Loader2 } from 'lucide-react';

export default function TranslatorPage() {
  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState<{original: string, translated: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [sourceLang, setSourceLang] = useState("中文");
  const [targetLang, setTargetLang] = useState("英文");

  // 处理手动翻译
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
      // 假设返回格式为 ["...", "..."]
      const newResults = lines.map((line, i) => ({
        original: line,
        translated: Array.isArray(data) ? data[i] : (data.results ? data.results[i] : "翻译失败")
      }));
      setResults(newResults);
    } catch (err) {
      alert("翻译出错");
    } finally {
      setLoading(false);
    }
  };

  // 处理 Excel 上传
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];

      // 提取第一列内容进行翻译 (假设第一列是需要翻译的内容)
      const toTranslate = data.map(row => row[0]).filter(Boolean);
      setInputText(toTranslate.join('\n'));
    };
    reader.readAsBinaryString(file);
  };

  // 导出 Excel
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(results);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "翻译结果");
    XLSX.writeFile(wb, "Logistics_Translation.xlsx");
  };

  return (
    <div className="max-w-5xl mx-auto p-8 font-sans">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Languages className="text-blue-600" /> 物流跨境翻译专家 (MiniMax-NIM)
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 输入区 */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <select className="border p-2 rounded" value={sourceLang} onChange={e => setSourceLang(e.target.value)}>
              <option>中文</option><option>英文</option><option>日文</option>
            </select>
            <span className="self-center">→</span>
            <select className="border p-2 rounded" value={targetLang} onChange={e => setTargetLang(e.target.value)}>
              <option>英文</option><option>西班牙文</option><option>德文</option><option>法文</option>
            </select>
          </div>
          
          <textarea 
            className="w-full h-64 border rounded-lg p-4 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="请输入地址、人名或品名（每行一个）..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          <div className="flex gap-4">
            <button 
              onClick={handleManualTranslate}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              立即翻译
            </button>
            <label className="flex-1 border border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-50 cursor-pointer text-center flex justify-center items-center gap-2">
              <Upload size={18} /> 上传 Excel
              <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleExcelUpload} />
            </label>
          </div>
        </div>

        {/* 结果显示区 */}
        <div className="border rounded-lg bg-gray-50 p-4 overflow-y-auto h-[400px]">
          {results.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2">原文</th>
                  <th className="pb-2 text-blue-600">翻译</th>
                </tr>
              </thead>
              <tbody>
                {results.map((res, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 pr-2">{res.original}</td>
                    <td className="py-2 text-blue-700 font-medium">{res.translated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              等待翻译结果...
            </div>
          )}
        </div>
      </div>

      {results.length > 0 && (
        <button 
          onClick={exportExcel}
          className="mt-6 w-full md:w-auto px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
        >
          <Download size={18} /> 下载翻译好的 Excel 表格
        </button>
      )}
    </div>
  );
}
