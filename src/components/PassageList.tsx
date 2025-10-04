import React, { useEffect, useState } from 'react';
import { Passage, Topic } from '../types';
import { passageService } from '../firebase/passageService';

interface PassageListProps {
  topic: Topic;
  onBack: () => void;
  onOpen: (passage: Passage) => void;
}

const PassageList: React.FC<PassageListProps> = ({ topic, onBack, onOpen }) => {
  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (topic?.slug) {
        setLoading(true);
        const data = await passageService.getByTopicSlug(topic.slug);
        setPassages(data);
        setLoading(false);
      }
    };
    load();
  }, [topic?.slug]);

  if (loading) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: 40 }}>🔄 Đang tải đoạn văn...</div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <button className="button back-button" onClick={onBack}>← Quay lại</button>
      <div className="vocabulary-section">
        <h2 className="section-title">📚 {topic.name}</h2>
        <div className="vocabulary-grid">
          {passages.map(p => (
            <div key={p.id} className="vocabulary-card" onClick={() => onOpen(p)} style={{ cursor: 'pointer' }}>
              <img src={p.thumbnail} alt={p.title} />
              <h3>{p.title}</h3>
              <p>{p.excerpt}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PassageList;


