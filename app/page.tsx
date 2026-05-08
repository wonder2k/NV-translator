const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      if (typeof bstr !== 'string') return; // 类型守卫

      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      // 强制转换类型防止 build 报错
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
      
      const toTranslate = data
        .map(row => String(row[0] || '').trim())
        .filter(Boolean);
        
      setInputText(toTranslate.join('\n'));
    };
    reader.readAsBinaryString(file);
  };
