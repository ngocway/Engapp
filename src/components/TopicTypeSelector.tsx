import React from 'react';

export type TopicType = 'paragraph' | 'dialogue';

interface TopicTypeSelectorProps {
  selectedType: TopicType;
  onTypeChange: (type: TopicType) => void;
}

const TopicTypeSelector: React.FC<TopicTypeSelectorProps> = ({ selectedType, onTypeChange }) => {
  return (
    <section className="topic-type-section container">
      <div className="topic-switch">
        <div 
          className={`topic-option ${selectedType === 'paragraph' ? 'active' : ''}`}
          onClick={() => onTypeChange('paragraph')}
        >
          <h3>Chủ đề dạng đoạn văn</h3>
          <p>Nội dung được thiết kế dạng đoạn văn 600 đến 2000 chữ.</p>
        </div>
        <div 
          className={`topic-option ${selectedType === 'dialogue' ? 'active' : ''}`}
          onClick={() => onTypeChange('dialogue')}
        >
          <h3>Chủ đề dạng đối thoại</h3>
          <p>Nội dung được thiết kế dạng cuộc đối thoại giữa 2 đến 3 người.</p>
        </div>
      </div>
    </section>
  );
};

export default TopicTypeSelector;













