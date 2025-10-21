import React, { useState } from 'react';
import HighlightedText from './HighlightedText';

const TestHtmlConversion: React.FC = () => {
  const [testHtml, setTestHtml] = useState(`<p>It was early morning when the first light touched the surface of the river. The <span class="highlighted-vocab">mist</span> hung low, drifting like soft silk <span class="highlighted-vocab">across</span> the slow-moving water. The river had always been my favorite place—a quiet refuge away from the noise of the town and the endless screens of <span style="background-color: yellow;">modern</span> life.</p>`);

  const [plainText, setPlainText] = useState('');

  const handleConvert = () => {
    // Tạo một div tạm để parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = testHtml;
    
    // Lấy text content
    let plainTextResult = tempDiv.textContent || tempDiv.innerText || '';
    
    // Tìm các từ vựng được highlight trong HTML và thêm brackets cho chúng
    const vocabWords: string[] = [];
    
    // Tìm tất cả các span với class highlighted-vocab hoặc có style highlight
    const spans = tempDiv.querySelectorAll('span');
    spans.forEach(span => {
      const className = span.className || '';
      const style = span.getAttribute('style') || '';
      const textContent = span.textContent || '';
      
      // Kiểm tra nếu là từ vựng được highlight
      if (className.includes('highlighted-vocab') || 
          style.includes('background') || 
          style.includes('highlight')) {
        
        if (textContent.trim() && !vocabWords.includes(textContent.trim())) {
          vocabWords.push(textContent.trim());
        }
      }
    });
    
    // Nếu tìm thấy từ vựng, thêm brackets cho chúng trong plain text
    if (vocabWords.length > 0) {
      vocabWords.forEach(vocab => {
        // Escape special regex characters
        const escapedVocab = vocab.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Thay thế từ vựng bằng [vocab] trong plain text
        const regex = new RegExp(`\\b${escapedVocab}\\b`, 'g');
        plainTextResult = plainTextResult.replace(regex, `[${vocab}]`);
      });
    }
    
    setPlainText(plainTextResult);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🧪 Test HTML to Text Conversion</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Input HTML:</h3>
        <textarea
          value={testHtml}
          onChange={(e) => setTestHtml(e.target.value)}
          style={{ width: '100%', height: '150px', padding: '10px' }}
          placeholder="Nhập HTML content..."
        />
      </div>

      <button 
        onClick={handleConvert}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        🔄 Convert to Text with Vocabulary Highlighting
      </button>

      <div style={{ marginBottom: '20px' }}>
        <h3>Converted Plain Text:</h3>
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6', 
          borderRadius: '5px',
          fontFamily: 'monospace'
        }}>
          {plainText}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Rendered with HighlightedText Component:</h3>
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#ffffff', 
          border: '1px solid #dee2e6', 
          borderRadius: '5px',
          lineHeight: '1.6'
        }}>
          <HighlightedText 
            text={plainText}
            // passageVocab={[
            //   { term: 'mist', meaning: 'Sương mù', definitionEn: 'A cloud of tiny water droplets' },
            //   { term: 'across', meaning: 'Băng qua', definitionEn: 'From one side to the other' },
            //   { term: 'modern', meaning: 'Hiện đại', definitionEn: 'Relating to present or recent times' }
            // ]}
          />
        </div>
      </div>

      <div style={{ 
        padding: '15px', 
        backgroundColor: '#e7f3ff', 
        border: '1px solid #b3d9ff', 
        borderRadius: '5px',
        fontSize: '14px'
      }}>
        <h4>💡 Instructions:</h4>
        <ul>
          <li>Nhập HTML content vào ô Input HTML</li>
          <li>Click "Convert" để chuyển đổi HTML thành plain text</li>
          <li>Từ vựng được highlight trong HTML sẽ được chuyển thành [word] format</li>
          <li>Component HighlightedText sẽ render với highlight và tương tác</li>
        </ul>
      </div>
    </div>
  );
};

export default TestHtmlConversion;
