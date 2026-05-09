// 替换 handleManualTranslate 函数
const handleManualTranslate = async () => {
  if (!inputText.trim()) return;
  setLoading(true);
  setErrorMsg('');
  setResults([]); // 清空上次结果

  const lines = inputText.split('\n').filter(l => l.trim());

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        items: lines, 
        sourceLang, 
        targetLang,
        model: selectedModel 
      }),
    });

    if (!response.ok) throw new Error('服务器响应异常');

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let cumulativeText = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        cumulativeText += chunk;

        // 实时更新 UI：按行切分并显示
        const currentLines = cumulativeText.split('\n');
        const formattedResults = lines.map((original, i) => ({
          original,
          translated: currentLines[i] || '正在计算...'
        }));
        setResults(formattedResults);
      }
    }
  } catch (e: any) {
    setErrorMsg("连接超时或中断，请尝试更短的文本或更换极速模型。");
    console.error(e);
  } finally {
    setLoading(false);
  }
};
