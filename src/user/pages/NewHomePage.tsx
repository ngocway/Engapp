import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Topic, Passage, EnglishLevel } from '../../types';
import { topicService } from '../../firebase/topicService';
import { passageService } from '../../firebase/passageService';
import { useAuth } from '../contexts/AuthContext';
import { userSettingsService } from '../../firebase/userSettingsService';
import { progressService } from '../../firebase/progressService';
import LoginRequiredModal from '../components/LoginRequiredModal';

const NewHomePage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [topics, setTopics] = useState<Topic[]>([]);
    const [passagesByTopic, setPassagesByTopic] = useState<Record<string, Passage[]>>({});
    const [userEnglishLevel, setUserEnglishLevel] = useState<EnglishLevel>('basic');
    const [loading, setLoading] = useState(true);
    const [completedPassages, setCompletedPassages] = useState<Set<string>>(new Set());
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [topicType, setTopicType] = useState<'paragraph' | 'dialogue'>('paragraph');
    const [searchTerm, setSearchTerm] = useState('');

    // Load user settings and progress
    useEffect(() => {
        const loadUserData = async () => {
            if (user) {
                try {
                    // Settings
                    const settings = await userSettingsService.getUserSettings(user.uid);
                    if (settings) {
                        setUserEnglishLevel(settings.englishLevel);
                    }

                    // Progress
                    const progress = await progressService.getUserProgress(user.uid);
                    if (progress && progress.completedPassages) {
                        setCompletedPassages(new Set(progress.completedPassages));
                    }
                } catch (error) {
                    console.error("Error loading user data", error);
                }
            } else {
                setUserEnglishLevel('basic'); // Default for guest
            }
        };
        loadUserData();
    }, [user]);

    // Load topics and passages
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. Get Topics
                const topicsData = await topicService.getAll();
                setTopics(topicsData);

                // 2. Get Passages for each topic
                const passagesMap: Record<string, Passage[]> = {};

                for (const topic of topicsData) {
                    if (topic.slug) {
                        try {
                            const allPassages = await passageService.getByTopicSlug(topic.slug);

                            // Filter by level (simplified logic for homepage showcase)
                            let filtered = allPassages;
                            // If user is logged in, prioritize their level, but maybe show others too?
                            // For now let's just show a mix, but prioritize "Basic" for default

                            const freePassages = filtered.filter(p => p.accessType === 'free' || !p.accessType);

                            // Store ALL free passages, randomized once
                            passagesMap[topic.slug] = freePassages.sort(() => Math.random() - 0.5);
                        } catch (err) {
                            console.error(`Error loading passages for ${topic.slug}`, err);
                            passagesMap[topic.slug] = [];
                        }
                    }
                }
                setPassagesByTopic(passagesMap);
            } catch (error) {
                console.error("Error fetching data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLessonStart = (passageId: string) => {
        navigate(`/passage/${passageId}`);
    };

    const handleTopicClick = (slug?: string) => {
        if (slug) navigate(`/topics/${slug}`);
    };

    const handleReviewClick = () => {
        if (!user) {
            setShowLoginModal(true);
        } else {
            navigate('/review');
        }
    };

    const handleLogin = () => {
        setShowLoginModal(false);
        // Logic login handled by context usually involves redirect or popup
        // For now just reload to trigger auth check if using generic method
        window.location.reload();
    };

    const getDisplayPassages = (topicSlug: string) => {
        const all = passagesByTopic[topicSlug] || [];
        if (!searchTerm.trim()) {
            return all.slice(0, 3);
        }
        const lowerTerm = searchTerm.toLowerCase();
        return all.filter(p =>
            p.title.toLowerCase().includes(lowerTerm) ||
            (p.excerpt && p.excerpt.toLowerCase().includes(lowerTerm))
        );
    };

    return (
        <div className="layout-container flex h-full grow flex-col bg-background-light min-h-screen">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 md:px-10 py-4">
                <div className="max-w-[1200px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white overflow-hidden shadow-sm">
                                <span className="material-symbols-outlined text-2xl">flutter_dash</span>
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-[#1e293b]">EngApp</h1>
                        </div>
                        <nav className="hidden md:flex items-center gap-2">
                            <a href="#" className="bg-primary text-white px-4 py-1.5 rounded-lg text-sm font-semibold">Chủ đề</a>
                            <a onClick={handleReviewClick} href="#" className="text-navy-text hover:bg-gray-50 px-4 py-1.5 rounded-lg text-sm font-medium">Ôn tập</a>
                        </nav>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg bg-white cursor-pointer hover:border-primary/50 transition-colors">
                            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
                            <span className="text-sm font-medium capitalize">{userEnglishLevel}</span>
                            <span className="material-symbols-outlined text-gray-400 text-lg">expand_more</span>
                        </div>

                        <button className="bg-[#1e293b] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-black transition-colors" onClick={() => navigate('/topics')}>
                            Bắt đầu
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 py-8">
                {/* Toggle Buttons */}
                <div className="flex flex-col items-center mb-8">
                    <div className="inline-flex bg-gray-100 p-1.5 rounded-2xl w-full max-w-[600px]">
                        <button
                            className={`flex-1 rounded-xl py-4 px-6 text-center transition-all group ${topicType === 'paragraph' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                            onClick={() => setTopicType('paragraph')}
                        >
                            <span className={`block font-bold mb-1 ${topicType === 'paragraph' ? 'text-primary' : 'text-gray-text'}`}>Chủ đề dạng đoạn văn</span>
                            <span className="hidden md:block text-xs text-gray-500">Mô tả chủ đề dạng đoạn văn với nội dung phong phú và sâu sắc.</span>
                        </button>
                        <button
                            className={`flex-1 rounded-xl py-4 px-6 text-center transition-all group ${topicType === 'dialogue' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                            onClick={() => setTopicType('dialogue')}
                        >
                            <span className={`block font-bold mb-1 ${topicType === 'dialogue' ? 'text-primary' : 'text-gray-text'}`}>Chủ đề dạng đối thoại</span>
                            <span className="hidden md:block text-xs text-gray-500">Học từ vựng thông qua các tình huống giao tiếp thực tế.</span>
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="w-full max-w-[800px] mx-auto mb-12 px-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-gray-400 group-focus-within:text-primary transition-colors">search</span>
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-navy-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            placeholder="Tìm kiếm bài học..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Content Sections */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    topics.map((topic) => {
                        const topicPassages = topic.slug ? getDisplayPassages(topic.slug) : [];
                        // Hide section if searching and no matches
                        if (searchTerm && topicPassages.length === 0) return null;
                        // Hide section if no passages at all (default behavior)
                        if (!searchTerm && (!passagesByTopic[topic.slug!] || passagesByTopic[topic.slug!].length === 0)) return null;

                        return (
                            <section key={topic.id} className="mb-12">
                                <div className="flex items-center justify-between px-2 mb-6">
                                    <h2 className="text-navy-text text-2xl font-bold">{topic.title || topic.name}</h2>
                                    <a href="#" onClick={(e) => { e.preventDefault(); handleTopicClick(topic.slug); }} className="text-primary text-sm font-bold hover:underline">Xem tất cả</a>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {topicPassages.map((passage) => (
                                        <div key={passage.id} className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 flex flex-col gap-4 group hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                                            <div className="relative w-full aspect-video rounded-[1.5rem] overflow-hidden">
                                                <img
                                                    alt={passage.title}
                                                    className="w-full h-full object-cover"
                                                    src={passage.thumbnail || 'https://images.unsplash.com/photo-1501854140884-074cf2b2c7c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80'} // Fallback img
                                                    onError={(e) => {
                                                        const el = e.currentTarget as HTMLImageElement;
                                                        el.src = 'https://images.unsplash.com/photo-1501854140884-074cf2b2c7c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80';
                                                    }}
                                                />
                                                <div className="absolute top-4 left-4">
                                                    <span className="bg-[#242424] text-white text-[11px] font-black px-3 py-1.5 rounded-lg uppercase">
                                                        {passage.englishLevel || 'BASIC'}
                                                    </span>
                                                </div>
                                                {completedPassages.has(passage.id) ? (
                                                    <div className="absolute top-4 right-4">
                                                        <span className="bg-green-500 text-white text-[12px] font-bold px-3 py-1.5 rounded-lg shadow-lg">Đã học</span>
                                                    </div>
                                                ) : (
                                                    <div className="absolute top-4 right-4">
                                                        <span className="bg-soft-red text-white text-[12px] font-bold px-3 py-1.5 rounded-lg shadow-lg">Chưa học</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="px-2 pb-2">
                                                <h3
                                                    onClick={() => handleLessonStart(passage.id)}
                                                    className="text-xl font-bold text-navy-text mb-1 group-hover:text-primary transition-colors line-clamp-1 cursor-pointer"
                                                >
                                                    {passage.title}
                                                </h3>
                                                <p className="text-gray-text text-sm mb-6 leading-relaxed line-clamp-2 h-10">
                                                    {passage.excerpt || 'Bài học thú vị về chủ đề này.'}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-gray-text font-medium">
                                                        <span className="text-blue-500 font-bold">🔤</span>
                                                        <span className="text-sm">{passage.vocab?.length || 0} từ mới</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleLessonStart(passage.id)}
                                                        className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:brightness-110 shadow-lg shadow-blue-500/20 transition-all"
                                                    >
                                                        Học ngay
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );
                    })
                )}
            </main>

            <footer className="mt-auto border-t border-gray-100 bg-white py-12">
                <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-gray-text text-sm font-medium">© 2024 EngApp. All rights reserved.</p>
                    <div className="flex gap-8">
                        <a href="#" className="text-gray-text text-sm hover:text-primary transition-colors font-medium">Privacy Policy</a>
                        <a href="#" className="text-gray-text text-sm hover:text-primary transition-colors font-medium">Terms of Service</a>
                        <a href="#" className="text-gray-text text-sm hover:text-primary transition-colors font-medium">Help Center</a>
                    </div>
                </div>
            </footer>

            <LoginRequiredModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onLogin={handleLogin}
            />
        </div>
    );
};

export default NewHomePage;
