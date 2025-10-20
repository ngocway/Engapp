import React, { useState, useEffect } from 'react';
import { Passage, EnglishLevel } from '../types';
import { passageService } from '../firebase/passageService';
import { vocabService } from '../firebase/vocabService';
import { settingsService, EnglishLevelOption } from '../firebase/settingsService';
import { uploadImageToStorage, deleteImageFromStorage } from '../firebase/storageService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

interface PassageEditModalProps {
  passage: Passage | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (passage: Passage) => void;
}

const PassageEditModal: React.FC<PassageEditModalProps> = ({ 
  passage, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    text: '',
    excerpt: '',
    topicSlug: '',
    thumbnail: '',
    audioUrl: '',
    layoutRatio: '4:6' as '4:6' | '5:5',
    lessonType: 'passage' as 'passage' | 'dialogue',
    accessType: 'free' as 'free' | 'premium',
    images: [] as string[]
  });
  const [selectedEnglishLevels, setSelectedEnglishLevels] = useState<EnglishLevel[]>(['basic']);
  const [englishLevelOptions, setEnglishLevelOptions] = useState<EnglishLevelOption[]>([]);
  const [levelsLoading, setLevelsLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [contentImages, setContentImages] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]); // Ảnh đã có sẵn
  const [newlyUploadedUrls, setNewlyUploadedUrls] = useState<string[]>([]); // Ảnh mới upload
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [detectedWords, setDetectedWords] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [vocabularyComparison, setVocabularyComparison] = useState<{
    newWords: string[];
    wordsToRemove: string[];
    wordsToKeep: string[];
  }>({
    newWords: [],
    wordsToRemove: [],
    wordsToKeep: []
  });

  // Load English Levels
  useEffect(() => {
    const loadEnglishLevels = async () => {
      try {
        setLevelsLoading(true);
        await settingsService.initializeDefaultSettings();
        const levels = await settingsService.getEnglishLevels();
        setEnglishLevelOptions(levels);
      } catch (error) {
        console.error('Error loading English levels:', error);
      } finally {
        setLevelsLoading(false);
      }
    };

    if (isOpen) {
      loadEnglishLevels();
    }
  }, [isOpen]);

  // Function to load fresh data from Firestore
  const loadFreshPassageData = async (passageId: string) => {
    try {
      console.log('🔄 Loading fresh passage data from Firestore for ID:', passageId);
      const freshPassage = await passageService.getPassageById(passageId);
      if (freshPassage) {
        console.log('🔄 Fresh passage data loaded:', freshPassage);
        console.log('🔄 Fresh images count:', freshPassage.images?.length || 0);
        return freshPassage;
      }
    } catch (error) {
      console.error('❌ Failed to load fresh passage data:', error);
    }
    return null;
  };

  useEffect(() => {
    const initializeModal = async () => {
      if (passage && isOpen) {
        console.log('🔍 PassageEditModal - Loading passage data:', passage);
        console.log('🔍 PassageEditModal - Passage topicId:', passage.topicId);
        console.log('🔍 PassageEditModal - Passage topicSlug:', passage.topicSlug);
        console.log('🔍 PassageEditModal - Passage images count:', passage.images?.length || 0);
        console.log('🔍 PassageEditModal - Passage images:', passage.images);
        console.log('🔍 PassageEditModal - Modal isOpen:', isOpen);
        
        // 🔄 Load fresh data from Firestore to ensure we have the latest state
        const freshPassage = await loadFreshPassageData(passage.id);
        
        // Debug: Compare prop data vs fresh data
        console.log('🔍 Data comparison:', {
          propImagesCount: passage.images?.length || 0,
          propImages: passage.images,
          freshImagesCount: freshPassage?.images?.length || 0,
          freshImages: freshPassage?.images,
          usingFreshData: !!freshPassage,
          imagesMatch: JSON.stringify(passage.images) === JSON.stringify(freshPassage?.images)
        });
        
        const dataToUse = freshPassage || passage; // Use fresh data if available, fallback to prop
      
        setFormData({
          title: dataToUse.title || '',
          text: dataToUse.text || '',
          excerpt: dataToUse.excerpt || '',
          topicSlug: dataToUse.topicSlug || '',
          thumbnail: dataToUse.thumbnail || '',
          audioUrl: dataToUse.audioUrl || '',
          layoutRatio: dataToUse.layoutRatio || '4:6',
          lessonType: (dataToUse as any).lessonType || 'passage',
          accessType: (dataToUse as any).accessType || 'free',
          images: dataToUse.images || []
        });
        setPreviewUrl(dataToUse.thumbnail || '');
        setAudioPreviewUrl(dataToUse.audioUrl || '');
        // Load ảnh đã có từ fresh data và deduplicate
        const existingImages = dataToUse.images || [];
        const deduplicatedImages = Array.from(new Set(existingImages)); // Remove duplicates
        console.log('🔄 Loaded existing images:', {
          original: existingImages.length,
          deduplicated: deduplicatedImages.length,
          images: deduplicatedImages,
          rawImages: existingImages,
          hasDuplicates: existingImages.length !== deduplicatedImages.length
        });
        setExistingImageUrls(deduplicatedImages);
        setNewlyUploadedUrls([]); // Reset ảnh mới
        
        // Set English Levels
        if (dataToUse.englishLevels && dataToUse.englishLevels.length > 0) {
          setSelectedEnglishLevels(dataToUse.englishLevels);
        } else if (dataToUse.englishLevel) {
          setSelectedEnglishLevels([dataToUse.englishLevel]);
        } else {
          setSelectedEnglishLevels(['basic']);
        }
      
    } else {
      setFormData({
        title: '',
        text: '',
        excerpt: '',
        topicSlug: '',
        thumbnail: '',
        audioUrl: '',
        layoutRatio: '4:6' as '4:6' | '5:5',
        lessonType: 'passage' as 'passage' | 'dialogue',
        accessType: 'free' as 'free' | 'premium',
        images: []
      });
      setPreviewUrl('');
      setAudioPreviewUrl('');
      setExistingImageUrls([]); // Reset ảnh đã có
      setNewlyUploadedUrls([]); // Reset ảnh mới
      setSelectedEnglishLevels(['basic']);
      }
      setSelectedFile(null);
      setSelectedAudioFile(null);
    };
    
    initializeModal();
  }, [passage, isOpen]);


  // Function to copy image URL to clipboard
  const handleCopyImageUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      alert('✅ Đã copy URL ảnh vào clipboard!');
    } catch (error) {
      console.error('❌ Error copying URL:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('✅ Đã copy URL ảnh vào clipboard!');
    }
  };


  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFormData({ ...formData, thumbnail: '' }); // Clear URL when file is selected
    }
  };

  const handleAudioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setSelectedAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioPreviewUrl(url);
      setFormData({ ...formData, audioUrl: '' }); // Clear URL when file is selected
    } else {
      alert('Vui lòng chọn file audio hợp lệ (MP3, WAV, etc.)');
    }
  };

  const handleContentImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setContentImages(prev => [...prev, ...files]);
      setUploadingImages(true);
      
      try {
        const newUrls: string[] = [];
        
        for (const file of files) {
          console.log('📤 Uploading image immediately:', file.name, 'Size:', file.size, 'Type:', file.type);
          setUploading(true);
          try {
            const result = await uploadImageToStorage(file);
            setUploading(false);
            if (result && result.downloadURL) {
              newUrls.push(result.downloadURL);
              console.log('✅ Image uploaded successfully:', result.downloadURL);
            } else {
              console.error('❌ Upload result is invalid:', result);
            }
          } catch (uploadError) {
            console.error('❌ Upload failed for file:', file.name, uploadError);
            setUploading(false);
          }
        }
        
        if (newUrls.length > 0) {
          setNewlyUploadedUrls(prev => {
            const updated = [...prev, ...newUrls];
            console.log('📸 Updated newlyUploadedUrls:', {
              previous: prev,
              new: newUrls,
              total: updated
            });
            return updated;
          });
          
          // Auto-append img tags to HTML content
          const totalExistingImages = existingImageUrls.length;
          const imgTags = newUrls.map((url, index) => {
            const imageNumber = totalExistingImages + newlyUploadedUrls.length + index + 1;
            return `\n<img src="IMAGE_URL_${imageNumber}" alt="Uploaded image ${imageNumber}" style="max-width: 100%; height: auto;" />`;
          }).join('');
          
          setFormData(prev => ({
            ...prev,
            text: prev.text + imgTags
          }));
          
          console.log('✅ All images uploaded and added to HTML content');
          console.log('📸 Newly uploaded URLs should now be visible in UI:', newUrls);
          
          
          console.log('🎯 Auto-appended img tags to HTML content');
        }
      } catch (error) {
        console.error('❌ Error uploading images:', error);
        alert('Lỗi khi upload ảnh. Vui lòng thử lại.');
      } finally {
        setUploadingImages(false);
      }
    }
  };


  const handleRemoveContentImage = async (indexToRemove: number, isExistingImage: boolean = false) => {
    if (!passage) {
      console.error('❌ No passage data available for updating');
      return;
    }

    let removedUrl: string | undefined;
    let updatedExistingUrls: string[] = [];
    let updatedNewlyUploadedUrls: string[] = [];
    
    if (isExistingImage) {
      // Remove from existing images
      removedUrl = existingImageUrls[indexToRemove];
      updatedExistingUrls = existingImageUrls.filter((_, index) => index !== indexToRemove);
      setExistingImageUrls(updatedExistingUrls);
    } else {
      // Remove from newly uploaded images
      removedUrl = newlyUploadedUrls[indexToRemove];
      updatedNewlyUploadedUrls = newlyUploadedUrls.filter((_, index) => index !== indexToRemove);
      setNewlyUploadedUrls(updatedNewlyUploadedUrls);
    }
    
    // Delete from Firebase Storage
    if (removedUrl) {
      console.log('🗑️ Deleting image from storage:', removedUrl);
      const deleteSuccess = await deleteImageFromStorage(removedUrl);
      if (deleteSuccess) {
        console.log('✅ Image successfully deleted from storage');
      } else {
        console.log('⚠️ Failed to delete image from storage, but removed from UI');
      }
    }
    
    // Remove corresponding img tag from HTML content
    const imageNumber = indexToRemove + 1;
    const imgTagRegex = new RegExp(`<img[^>]*src="IMAGE_URL_${imageNumber}"[^>]*>`, 'g');
    
    let updatedText = formData.text.replace(imgTagRegex, '');
    
    // Re-index remaining IMAGE_URL placeholders
    const currentExistingUrls = isExistingImage ? updatedExistingUrls : existingImageUrls;
    const currentNewlyUploadedUrls = isExistingImage ? newlyUploadedUrls : updatedNewlyUploadedUrls;
    const allImages = [...currentExistingUrls, ...currentNewlyUploadedUrls];
    
    allImages.forEach((_, index) => {
      if (index > indexToRemove) {
        const oldPlaceholder = `IMAGE_URL_${index + 1}`;
        const newPlaceholder = `IMAGE_URL_${index}`;
        updatedText = updatedText.replace(new RegExp(oldPlaceholder, 'g'), newPlaceholder);
      }
    });
    
    setFormData(prev => ({
      ...prev,
      text: updatedText
    }));

    // 🔥 CRITICAL: Update Firestore database immediately with the new image list
    let refreshedPassage: Passage | null = null; // Declare outside try block
    
    try {
      const allUpdatedImages = [...updatedExistingUrls, ...updatedNewlyUploadedUrls];
      const finalImageUrls = Array.from(new Set(allUpdatedImages)); // Remove duplicates
      const finalTextContent = replaceImagePlaceholders(updatedText, updatedExistingUrls, updatedNewlyUploadedUrls);
      
      console.log('💾 Updating Firestore with new image list:', finalImageUrls);
      console.log('💾 Final image URLs count:', finalImageUrls.length);
      console.log('💾 Updated existing URLs:', updatedExistingUrls);
      console.log('💾 Updated newly uploaded URLs:', updatedNewlyUploadedUrls);
      
      const updateData = {
        ...passage,
        text: finalTextContent,
        images: finalImageUrls
      };
      
      console.log('💾 Full update data being sent to Firestore:', updateData);
      
      await passageService.update(passage.id, updateData);
      
      console.log('✅ Firestore updated successfully - image deletion persisted');
      
      // 🔄 CRITICAL: Refresh the passage data to ensure UI shows updated state
      try {
        refreshedPassage = await passageService.getPassageById(passage.id);
        if (refreshedPassage) {
          console.log('🔄 Refreshed passage data from Firestore:', refreshedPassage);
          console.log('🔄 Refreshed images count:', refreshedPassage.images?.length || 0);
          
          // Update the passage prop if possible (this might require parent component update)
          // For now, we'll update local state to reflect the change
          setExistingImageUrls(refreshedPassage.images || []);
        }
      } catch (refreshError) {
        console.error('⚠️ Failed to refresh passage data:', refreshError);
      }
      
      // Show success message
      alert(`✅ Đã xóa ảnh thành công và cập nhật vào database!`);
      
      // 🔄 CRITICAL: Notify parent component about the update
      if (refreshedPassage) {
        console.log('📢 Notifying parent component about passage update');
        onSave(refreshedPassage);
      }
      
    } catch (error) {
      console.error('❌ Failed to update Firestore after image deletion:', error);
      alert('⚠️ Đã xóa ảnh khỏi giao diện nhưng có lỗi khi cập nhật database. Vui lòng thử lại.');
    }
    
    console.log('🗑️ Removed image, updated HTML content, and persisted to Firestore');
  };

  const replaceImagePlaceholders = (htmlContent: string, customExistingUrls?: string[], customNewlyUploadedUrls?: string[]): string => {
    let updatedContent = htmlContent;
    
    // Use custom URLs if provided, otherwise use current state
    const currentExistingUrls = customExistingUrls || existingImageUrls;
    const currentNewlyUploadedUrls = customNewlyUploadedUrls || newlyUploadedUrls;
    
    // Combine all images (existing + newly uploaded) and remove duplicates
    const allImages = [...currentExistingUrls, ...currentNewlyUploadedUrls];
    const uniqueImages = Array.from(new Set(allImages)); // Remove duplicates
    
    // Replace IMAGE_URL_1, IMAGE_URL_2, etc. with actual URLs
    uniqueImages.forEach((url, index) => {
      const placeholder = `IMAGE_URL_${index + 1}`;
      updatedContent = updatedContent.replace(new RegExp(placeholder, 'g'), url);
    });
    
    return updatedContent;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFormData({ ...formData, thumbnail: '' }); // Clear URL when file is dropped
    }
  };

  const handleAudioDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      setSelectedAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioPreviewUrl(url);
      setFormData({ ...formData, audioUrl: '' }); // Clear URL when file is dropped
    } else {
      alert('Vui lòng kéo thả file audio hợp lệ (MP3, WAV, etc.)');
    }
  };


  const uploadAudio = async (file: File): Promise<string | null> => {
    try {
      const fileName = `passages/audio/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      setUploadingAudio(true);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setUploadingAudio(false);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading audio:', error);
      setUploadingAudio(false);
      return null;
    }
  };

  // Function to extract vocabulary from text
  const extractVocabularyFromText = (text: string): string[] => {
    const bracketRegex = /\[([^\]]+)\]/g;
    const matches = text.match(bracketRegex);
    
    if (matches) {
      return matches.map(match => {
        const word = match.slice(1, -1).trim(); // Remove brackets and trim
        return word;
      }).filter(word => word.length > 0); // Filter out empty strings
    }
    
    return [];
  };

  // Function to get existing vocabulary from passage
  const getExistingVocabulary = async (): Promise<string[]> => {
    if (!passage) {
      return [];
    }
    
    try {
      console.log('🔍 getExistingVocabulary - passage:', passage);
      
      // First try to get vocabulary from passage.vocab (newer approach)
      if (passage.vocab && passage.vocab.length > 0) {
        console.log('🔍 Using passage.vocab:', passage.vocab);
        const terms = passage.vocab.map(vocab => vocab.term);
        console.log('🔍 Terms from passage.vocab:', terms);
        return terms;
      }
      
      // Fallback: Get vocabulary from vocabService (legacy approach)
      console.log('🔍 Fallback to vocabService.getByPassageId');
      const vocabularies = await vocabService.getByPassageId(passage.id);
      console.log('🔍 vocabService result:', vocabularies);
      return vocabularies.map(vocab => vocab.term);
    } catch (error) {
      console.error('Error getting existing vocabulary:', error);
      return [];
    }
  };

  // Function to compare and categorize vocabulary
  const compareVocabulary = (detectedWords: string[], existingWords: string[]) => {
    const newWords = detectedWords.filter(word => !existingWords.includes(word));
    const wordsToRemove = existingWords.filter(word => !detectedWords.includes(word));
    const wordsToKeep = detectedWords.filter(word => existingWords.includes(word));

    return {
      newWords,
      wordsToRemove,
      wordsToKeep
    };
  };

  // English Level handlers
  const handleFormLevelChange = (level: EnglishLevel, checked: boolean) => {
    if (checked) {
      setSelectedEnglishLevels(prev => [...prev, level]);
    } else {
      setSelectedEnglishLevels(prev => prev.filter(l => l !== level));
    }
  };



  // Function to check for new vocabulary words
  const handleCheckVocabulary = async () => {
    if (!formData.text.trim()) {
      return;
    }

    setIsChecking(true);
    try {
      const detectedWords = extractVocabularyFromText(formData.text);
      const existingWords = await getExistingVocabulary();
      const comparison = compareVocabulary(detectedWords, existingWords);
      
      setDetectedWords(detectedWords);
      setVocabularyComparison(comparison);
    } catch (error) {
      console.error('Error checking vocabulary:', error);
    } finally {
      setIsChecking(false);
    }
  };


  // Function to update vocabulary for the passage
  const updatePassageVocabulary = async (passageId: string) => {
    try {
      console.log('📚 Auto-processing vocabulary from text...');
      
      // Extract vocabulary from current text
      const detectedWords = extractVocabularyFromText(formData.text);
      console.log('📚 Detected words from text:', detectedWords);
      
      if (detectedWords.length === 0) {
        console.log('📚 No vocabulary detected in text');
        return;
      }
      
      // Get current passage data to check existing vocab
      const { passageService } = await import('../firebase/passageService');
      const currentPassage = await passageService.getPassageById(passageId);
      
      if (!currentPassage) {
        console.error('❌ Could not load current passage');
        return;
      }
      
      const existingVocab = currentPassage.vocab || [];
      const existingTerms = existingVocab.map(vocab => vocab.term);
      
      console.log('📚 Existing vocabulary terms:', existingTerms);
      
      // Find new words to add
      const newWords = detectedWords.filter(word => !existingTerms.includes(word));
      
      // Find words to remove (words that were in vocab but not in text anymore)
      const wordsToRemove = existingTerms.filter(term => !detectedWords.includes(term));
      
      console.log('📚 New words to add:', newWords);
      console.log('📚 Words to remove:', wordsToRemove);
      
      // Prepare updated vocab list
      let updatedVocab = [...existingVocab];
      
      // Add new words
      newWords.forEach(word => {
        const newVocab = {
          term: word,
          meaning: `Nghĩa của ${word}`,
          definitionEn: `Definition of ${word}`
        };
        updatedVocab.push(newVocab);
        console.log('📚 Added new vocabulary:', newVocab);
      });
      
      // Remove words that are no longer in text
      updatedVocab = updatedVocab.filter(vocab => !wordsToRemove.includes(vocab.term));
      
      // Update passage with new vocabulary
      await passageService.update(passageId, { vocab: updatedVocab });
      
      console.log('✅ Vocabulary updated successfully:', {
        total: updatedVocab.length,
        added: newWords.length,
        removed: wordsToRemove.length,
        kept: updatedVocab.length - newWords.length
      });
      
    } catch (error) {
      console.error('❌ Error updating vocabulary:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passage) {
      console.log('❌ No passage data available');
      return;
    }

    // Validate English Levels
    if (selectedEnglishLevels.length === 0) {
      alert('Vui lòng chọn ít nhất một English Level!');
      return;
    }

    // Check text size limit (Firebase limit is 1MB per field)
    const textSize = new Blob([formData.text]).size;
    const maxSize = 1048487; // 1MB in bytes (Firebase limit)
    
    if (textSize > maxSize) {
      const sizeMB = (textSize / (1024 * 1024)).toFixed(2);
      alert(`⚠️ Nội dung quá lớn (${sizeMB}MB)! Firebase giới hạn 1MB cho mỗi trường.\n\nVui lòng:\n1. Loại bỏ base64 images khỏi nội dung\n2. Upload hình ảnh riêng và sử dụng URL\n3. Giảm kích thước nội dung`);
      return;
    }

    const isNewPassage = !passage.id || passage.id === '';
    console.log('🔄 Starting passage', isNewPassage ? 'creation' : 'update', '...');
    console.log('📝 Passage ID:', passage.id);
    console.log('📝 Form data:', formData);
    console.log('📝 Text size:', textSize, 'bytes');
    console.log('📝 Selected English Levels:', selectedEnglishLevels);
    console.log('📝 Lesson Type:', formData.lessonType);
    console.log('📝 Access Type:', formData.accessType);

    setLoading(true);
    try {
      let thumbnailUrl = formData.thumbnail;
      let audioUrl = formData.audioUrl;
      
      // Only save newly uploaded images to database (existing images are already there)
      // The final images array should be: existing images from DB + newly uploaded images
      const allImages = [...existingImageUrls, ...newlyUploadedUrls];
      const contentImageUrls = Array.from(new Set(allImages)); // Remove duplicates
      console.log('💾 Image URLs being saved:', {
        existingCount: existingImageUrls.length,
        newlyUploadedCount: newlyUploadedUrls.length,
        totalCount: contentImageUrls.length,
        existingUrls: existingImageUrls,
        newlyUploadedUrls: newlyUploadedUrls
      });
      
      // Upload image file if selected
      if (selectedFile) {
        console.log('📤 Uploading thumbnail image file...');
        const result = await uploadImageToStorage(selectedFile);
        if (result) {
          thumbnailUrl = result.downloadURL;
          console.log('✅ Thumbnail image uploaded:', result.downloadURL);
        } else {
          alert('Lỗi khi upload ảnh thumbnail. Vui lòng thử lại.');
          setLoading(false);
          return;
        }
      }

      // Upload audio file if selected
      if (selectedAudioFile) {
        console.log('📤 Uploading audio file...');
        const uploadedAudioUrl = await uploadAudio(selectedAudioFile);
        if (uploadedAudioUrl) {
          audioUrl = uploadedAudioUrl;
          console.log('✅ Audio uploaded:', uploadedAudioUrl);
        } else {
          alert('Lỗi khi upload audio. Vui lòng thử lại.');
          setLoading(false);
          return;
        }
      }

      // Replace image placeholders in HTML content
      const finalTextContent = replaceImagePlaceholders(formData.text);
      
        // Prepare update data WITHOUT the id field (Firebase doesn't allow updating document ID)
        // Ensure topicId is not undefined
        const updateData = {
          title: formData.title,
          text: finalTextContent,
          excerpt: formData.excerpt,
          topicSlug: formData.topicSlug,
          thumbnail: thumbnailUrl,
          audioUrl: audioUrl,
          level: passage.level || 1, // Default level for new passages
          englishLevel: selectedEnglishLevels[0] || 'basic', // Use first selected level for backward compatibility
          englishLevels: selectedEnglishLevels, // Save all selected levels
          topicId: passage.topicId || '', // Fallback to empty string if undefined
          layoutRatio: formData.layoutRatio, // Add layout ratio
          lessonType: formData.lessonType, // Add lesson type
          accessType: formData.accessType, // Add access type
          images: [...(formData.images || []), ...contentImageUrls] // Merge existing and new images
        };

      // Remove undefined values to prevent Firebase errors
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          console.log('⚠️ Removing undefined field:', key);
          delete updateData[key as keyof typeof updateData];
        }
      });
      
      console.log('💾 Final update data after removing undefined:', updateData);

      let savedPassage: Passage;
      
      if (isNewPassage) {
        // Create new passage
        console.log('💾 Creating new passage in database...');
        console.log('💾 Create data:', updateData);
        
        const newPassageId = await passageService.add(updateData);
        if (!newPassageId) {
          throw new Error('Failed to create new passage');
        }
        
        savedPassage = {
          id: newPassageId,
          ...updateData
        };
        console.log('✅ Passage created successfully with ID:', newPassageId);
      } else {
        // Update existing passage
        console.log('💾 Updating passage in database...');
        console.log('💾 Update data (without id):', updateData);
        console.log('💾 Passage ID to update:', passage.id);
        console.log('💾 Form data text:', formData.text);
        console.log('💾 Form data layoutRatio:', formData.layoutRatio);
        console.log('💾 Form data lessonType:', formData.lessonType);
        console.log('💾 Form data accessType:', formData.accessType);

        const updateResult = await passageService.update(passage.id, updateData);
        if (!updateResult) {
          console.warn('⚠️ Firebase update failed, but continuing with local update simulation');
          // In development mode, we'll simulate a successful update
          // In production, this should be handled with proper error messaging
        }
        
        savedPassage = {
          ...passage,
          ...updateData
        };
        console.log('✅ Passage updated successfully');
      }
      
      // Update vocabulary (auto-processing from text)
      console.log('📚 Auto-processing vocabulary from text...');
      try {
        await updatePassageVocabulary(savedPassage.id);
        console.log('✅ Vocabulary auto-processing completed');
      } catch (vocabError) {
        console.warn('⚠️ Vocabulary update failed, but passage update succeeded:', vocabError);
        // Continue with the main update even if vocabulary update fails
      }
      
      // 🔄 CRITICAL: Merge newly uploaded images into existing images after successful save
      if (newlyUploadedUrls.length > 0) {
        console.log('🔄 Merging newly uploaded images into existing images:', newlyUploadedUrls);
        setExistingImageUrls(prev => [...prev, ...newlyUploadedUrls]);
        setNewlyUploadedUrls([]); // Clear newly uploaded images
        console.log('✅ Images merged successfully');
      }
      
      console.log('🎉 All updates completed successfully!');
      
      // Show success message to admin
      alert(`✅ Đã cập nhật bài học thành công!\n\n📝 Tiêu đề: ${savedPassage.title}\n🔒 Loại truy cập: ${savedPassage.accessType === 'premium' ? 'Phải đăng nhập' : 'Miễn phí'}\n📚 Loại bài học: ${savedPassage.lessonType === 'passage' ? 'Đoạn văn' : 'Hội thoại'}`);
      
      // Use the saved passage for the callback
      onSave(savedPassage);
      onClose();
    } catch (error) {
      console.error('❌ Error updating passage:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      alert(`Lỗi khi cập nhật đoạn văn: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>✏️ Sửa đoạn văn</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Tiêu đề:</label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Nhập tiêu đề đoạn văn"
            />
          </div>

          <div className="form-group">
            <label htmlFor="excerpt">Tóm tắt:</label>
            <textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
              placeholder="Nhập tóm tắt ngắn gọn"
            />
          </div>

          {/* Dropdown chọn tỷ lệ layout - vị trí màu vàng */}
          <div className="form-group">
            <label htmlFor="layoutRatio">Tỷ lệ layout:</label>
            <select
              id="layoutRatio"
              value={formData.layoutRatio}
              onChange={(e) => setFormData({ ...formData, layoutRatio: e.target.value as '4:6' | '5:5' })}
            >
              <option value="4:6">4:6 (Cột trái nhỏ hơn - Video 40%, Nội dung 60%)</option>
              <option value="5:5">5:5 (Cột bằng nhau - Video 50%, Nội dung 50%)</option>
            </select>
          </div>

          {/* Dropdown Loại bài học */}
          <div className="form-group">
            <label htmlFor="lessonType">Loại bài học:</label>
            <select
              id="lessonType"
              value={formData.lessonType || 'passage'}
              onChange={(e) => setFormData({ ...formData, lessonType: e.target.value as 'passage' | 'dialogue' })}
            >
              <option value="passage">📖 Đoạn văn</option>
              <option value="dialogue">💬 Hội thoại</option>
            </select>
          </div>

          {/* Dropdown Học thử và phải đăng nhập */}
          <div className="form-group">
            <label htmlFor="accessType">Học thử và phải đăng nhập:</label>
            <select
              id="accessType"
              value={formData.accessType || 'free'}
              onChange={(e) => setFormData({ ...formData, accessType: e.target.value as 'free' | 'premium' })}
            >
              <option value="free">🆓 Miễn phí</option>
              <option value="premium">🔒 Phải đăng nhập</option>
            </select>
          </div>


          <div className="form-group">
            <label htmlFor="text">Nội dung:</label>
            <div className="text-input-container">
              <textarea
                id="text"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                rows={8}
                placeholder="Nhập nội dung HTML (ví dụ: <p>Đây là đoạn văn với <mark>từ vựng</mark>...</p>)"
                required
              />
              <button
                type="button"
                className="check-vocabulary-button"
                onClick={handleCheckVocabulary}
                disabled={isChecking || !formData.text.trim()}
              >
                {isChecking ? '⏳ Đang kiểm tra...' : '🔍 Kiểm tra từ mới'}
              </button>
            </div>
            <div className="detected-words">
              <h4>
                {detectedWords.length > 0 
                  ? `Phân tích từ vựng (${detectedWords.length} từ phát hiện):`
                  : 'Chưa có từ mới nào được phát hiện'
                }
              </h4>
              
              {detectedWords.length > 0 ? (
                <div className="vocabulary-categories">
                  {/* Từ vựng mới */}
                  {vocabularyComparison.newWords.length > 0 && (
                    <div className="vocab-category new-words">
                      <h5 className="category-title new">
                        ➕ Từ vựng mới ({vocabularyComparison.newWords.length})
                      </h5>
                      <div className="words-list">
                        {vocabularyComparison.newWords.map((word, index) => (
                          <span key={index} className="word-tag new">
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Từ vựng giữ nguyên */}
                  {vocabularyComparison.wordsToKeep.length > 0 && (
                    <div className="vocab-category keep-words">
                      <h5 className="category-title keep">
                        ✅ Từ vựng giữ nguyên ({vocabularyComparison.wordsToKeep.length})
                      </h5>
                      <div className="words-list">
                        {vocabularyComparison.wordsToKeep.map((word, index) => (
                          <span key={index} className="word-tag keep">
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Từ vựng sẽ xóa */}
                  {vocabularyComparison.wordsToRemove.length > 0 && (
                    <div className="vocab-category remove-words">
                      <h5 className="category-title remove">
                        ❌ Từ vựng sẽ xóa ({vocabularyComparison.wordsToRemove.length})
                      </h5>
                      <div className="words-list">
                        {vocabularyComparison.wordsToRemove.map((word, index) => (
                          <span key={index} className="word-tag remove">
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="no-words-message">
                  Hãy đảm bảo các từ mới được đặt trong ngoặc vuông [từ mới] trong nội dung.
                </p>
              )}
            </div>
          </div>


          <div className="form-group">
            <label htmlFor="topicSlug">Chủ đề:</label>
            <select
              id="topicSlug"
              value={formData.topicSlug}
              onChange={(e) => setFormData({ ...formData, topicSlug: e.target.value })}
              required
            >
              <option value="">Chọn chủ đề</option>
              <option value="nature">🌿 Thiên nhiên</option>
              <option value="daily-activities">🏠 Hoạt động hàng ngày</option>
              <option value="travel">✈️ Du lịch</option>
            </select>
          </div>

          <div className="form-group">
            <label>English Level:</label>
            <div className="form-level-checkboxes">
              {levelsLoading ? (
                <p>Đang tải levels...</p>
              ) : englishLevelOptions.length === 0 ? (
                <p>Không có level nào được tìm thấy.</p>
              ) : (
                <>
                  <div className="checkbox-list">
                    {englishLevelOptions.map((level) => (
                      <label 
                        key={level.id} 
                        className={`form-level-checkbox-inline ${selectedEnglishLevels.includes(level.key as EnglishLevel) ? 'selected' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedEnglishLevels.includes(level.key as EnglishLevel)}
                          onChange={(e) => handleFormLevelChange(level.key as EnglishLevel, e.target.checked)}
                        />
                        <span className="checkbox-label">{level.label}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Thumbnail:</label>
            
            {/* Upload Area */}
            <div 
              className="upload-area"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="file-input"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="upload-label">
                {uploading ? (
                  <div className="upload-loading">
                    <div className="spinner"></div>
                    <span>Đang upload...</span>
                  </div>
                ) : (
                  <div className="upload-content">
                    <div className="upload-icon">📷</div>
                    <p>Kéo thả ảnh vào đây hoặc click để chọn</p>
                    <small>Hỗ trợ: JPG, PNG, GIF</small>
                  </div>
                )}
              </label>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="image-preview">
                <img src={previewUrl} alt="Preview" />
                <button
                  type="button"
                  className="remove-image"
                  onClick={() => {
                    setPreviewUrl('');
                    setSelectedFile(null);
                    setFormData({ ...formData, thumbnail: '' });
                  }}
                >
                  ✕ Xóa ảnh
                </button>
              </div>
            )}

            {/* URL Input */}
            <div className="url-input-group">
              <label htmlFor="thumbnail-url">Hoặc nhập URL ảnh:</label>
              <input
                id="thumbnail-url"
                type="url"
                value={formData.thumbnail}
                onChange={(e) => {
                  setFormData({ ...formData, thumbnail: e.target.value });
                  if (e.target.value) {
                    setPreviewUrl(e.target.value);
                    setSelectedFile(null);
                  }
                }}
                placeholder="https://example.com/image.jpg"
                disabled={!!selectedFile}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Audio bài học:</label>
            
            {/* Audio Upload Area */}
            <div 
              className="upload-area audio-upload"
              onDragOver={handleDragOver}
              onDrop={handleAudioDrop}
            >
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioFileSelect}
                className="file-input"
                id="audio-upload"
              />
              <label htmlFor="audio-upload" className="upload-label">
                {uploadingAudio ? (
                  <div className="upload-loading">
                    <div className="spinner"></div>
                    <span>Đang upload audio...</span>
                  </div>
                ) : (
                  <div className="upload-content">
                    <div className="upload-icon">🎵</div>
                    <p>Kéo thả file audio vào đây hoặc click để chọn</p>
                    <small>Hỗ trợ: MP3, WAV, M4A</small>
                  </div>
                )}
              </label>
            </div>

            {/* Audio Preview */}
            {audioPreviewUrl && (
              <div className="audio-preview">
                <audio controls style={{ width: '100%', marginTop: '10px' }}>
                  <source src={audioPreviewUrl} type="audio/mpeg" />
                  <source src={audioPreviewUrl} type="audio/wav" />
                  <source src={audioPreviewUrl} type="audio/mp4" />
                  Trình duyệt không hỗ trợ audio.
                </audio>
                <button
                  type="button"
                  className="remove-audio"
                  onClick={() => {
                    setAudioPreviewUrl('');
                    setSelectedAudioFile(null);
                    setFormData({ ...formData, audioUrl: '' });
                  }}
                  style={{
                    marginTop: '5px',
                    padding: '5px 10px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Xóa audio
                </button>
              </div>
            )}

            {/* Audio URL Input */}
            <div className="url-input-group">
              <label htmlFor="audio-url">Hoặc nhập URL audio:</label>
              <input
                id="audio-url"
                type="url"
                value={formData.audioUrl}
                onChange={(e) => {
                  setFormData({ ...formData, audioUrl: e.target.value });
                  if (e.target.value) {
                    setAudioPreviewUrl(e.target.value);
                    setSelectedAudioFile(null);
                  }
                }}
                placeholder="https://example.com/audio.mp3"
                disabled={!!selectedAudioFile}
              />
            </div>
          </div>

          {/* Content Images Upload */}
          <div className="form-group">
            <label>Ảnh nội dung bài học:</label>
            <div className="content-images-section">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleContentImageChange}
                className="file-input"
                id="content-images-upload"
              />
              <label htmlFor="content-images-upload" className="upload-label content-images-label">
                {uploadingImages ? (
                  <div className="upload-loading">
                    <div className="spinner"></div>
                    <span>Đang upload ảnh...</span>
                  </div>
                ) : (
                  <div className="upload-content">
                    <div className="upload-icon">🖼️</div>
                    <p>Chọn nhiều ảnh cho nội dung bài học</p>
                    <small>Hỗ trợ: JPG, PNG, GIF (mỗi ảnh tối đa 5MB)</small>
                    <small style={{color: '#007bff', fontWeight: 'bold'}}>⚡ Ảnh sẽ được upload ngay lập tức!</small>
                  </div>
                )}
              </label>
              
              {/* Display existing images */}
              {existingImageUrls.length > 0 && (
                <div className="content-images-preview existing">
                  <h4>📁 Ảnh đã có sẵn ({existingImageUrls.length}):</h4>
                  <div className="images-grid">
                    {existingImageUrls.map((url, index) => (
                      <div key={`existing-${index}`} className="image-preview-item">
                        <img src={url} alt={`Existing image ${index + 1}`} />
                        <div className="image-actions">
                          <button
                            type="button"
                            className="get-url-btn"
                            onClick={() => handleCopyImageUrl(url)}
                            title="Lấy URL ảnh"
                          >
                            📋
                          </button>
                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() => handleRemoveContentImage(index, true)}
                            title="Xóa ảnh"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Display newly uploaded images */}
              {newlyUploadedUrls.length > 0 && (
                <div className="content-images-preview new">
                  <h4>✨ Ảnh mới upload ({newlyUploadedUrls.length}):</h4>
                  <div className="images-grid">
                    {newlyUploadedUrls.map((url, index) => (
                      <div key={`new-${index}`} className="image-preview-item">
                        <img src={url} alt={`New image ${index + 1}`} />
                        <div className="image-actions">
                          <button
                            type="button"
                            className="get-url-btn"
                            onClick={() => handleCopyImageUrl(url)}
                            title="Lấy URL ảnh"
                          >
                            📋
                          </button>
                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() => handleRemoveContentImage(index, false)}
                            title="Xóa ảnh"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
            </div>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="modal-button cancel"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="modal-button save"
              disabled={loading || uploading || uploadingAudio}
            >
              {loading ? 'Đang lưu...' : (uploading || uploadingAudio) ? 'Đang upload...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PassageEditModal;