import React, { useEffect, useState } from 'react';
import { Topic } from '../types';
import { topicService } from '../firebase/topicService';

interface TopicSelectProps {
  onSelect: (topic: Topic) => void;
  onBack?: () => void;
}

const TopicSelect: React.FC<TopicSelectProps> = ({ onSelect, onBack }) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await topicService.getAll();
      setTopics(data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="main-content">
        <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>🔄 Đang tải chủ đề...</div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="menu-grid">
        {topics.map(t => (
          <div key={t.id} className="menu-card" onClick={() => onSelect(t)}>
            <img src={t.thumbnail} alt={t.name} style={{ width: '100%', borderRadius: 12, marginBottom: 12 }} />
            <h2>{t.name}</h2>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <p style={{ color: 'white' }}>Chọn một chủ đề bạn yêu thích để bắt đầu.</p>
      </div>
    </div>
  );
};

export default TopicSelect;




