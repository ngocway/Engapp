import { Topic, Passage } from '../types';

export const topicSeeds: Omit<Topic, 'id'>[] = [
  {
    title: 'Travel',
    name: 'Travel',
    slug: 'travel',
    thumbnail: 'https://images.unsplash.com/photo-1502920917128-1aa500764ce7?w=400',
    description: 'Learn about travel and transportation',
    level: 1
  },
  {
    title: 'Daily activities',
    name: 'Daily activities',
    slug: 'daily-activities',
    thumbnail: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400',
    description: 'Learn about daily activities and routines',
    level: 1
  },
  {
    title: 'Nature',
    name: 'Nature',
    slug: 'nature',
    thumbnail: 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?w=400',
    description: 'Learn about nature and environment',
    level: 1
  }
];

export const passageSeeds: Omit<Passage, 'id'>[] = [
  {
    topicId: '1',
    topicSlug: 'travel',
    title: 'At the Airport',
    thumbnail: 'https://images.unsplash.com/photo-1518306727298-4c17d1a2e0f5?w=400',
    excerpt: 'Tom is at the airport with his mom…',
    text: 'Tom is at the airport with his mom. They check their bags. They wait at the gate. Tom looks at planes. He feels excited to fly.',
    level: 1
  },
  {
    topicId: '1',
    topicSlug: 'travel',
    title: 'On the Train',
    thumbnail: 'https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=400',
    excerpt: 'The train is fast and safe…',
    text: 'Anna sits by the window on the train. Trees and houses go by quickly. She reads a small map and smiles.',
    level: 1
  },
  {
    topicId: '2',
    topicSlug: 'daily-activities',
    title: 'My Morning Routine',
    thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400',
    excerpt: 'I wake up at seven and brush my teeth…',
    text: 'I wake up at seven o\' clock. I brush my teeth and wash my face. I eat bread with milk. Then I go to school.',
    level: 1
  },
  {
    topicId: '2',
    topicSlug: 'daily-activities',
    title: 'After School',
    thumbnail: 'https://images.unsplash.com/photo-1596495578065-9d04a2a3b05b?w=400',
    excerpt: 'I do homework and play…',
    text: 'After school, I do my homework. I help my mom set the table. Later, I play with my little brother in the yard.',
    level: 1
  },
  {
    topicId: '3',
    topicSlug: 'nature',
    title: 'A Day in the Park',
    thumbnail: 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?w=400',
    excerpt: 'The sun is bright and the trees are green…',
    text: 'The sun is bright and the trees are green. I see birds and flowers. I run on the grass and feel happy.',
    level: 1
  },
  {
    topicId: '3',
    topicSlug: 'nature',
    title: 'By the River',
    thumbnail: 'https://images.unsplash.com/photo-1505159940484-eb2b9f2588e2?w=400',
    excerpt: 'We sit and watch the water…',
    text: 'We sit by the river and listen to the water. Dad throws small stones. The fish jump and splash.',
    level: 1
  }
];

// Long passages (400-500 words) with vocab highlights
export const longPassageSeeds: Omit<Passage, 'id'>[] = [
  {
    topicId: '1',
    topicSlug: 'travel',
    title: 'First Time Flying Alone',
    thumbnail: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?w=400',
    excerpt: 'A detailed story about a young traveler taking his first solo flight.',
    text: `On a warm Saturday morning, Minh arrived at Tan Son Nhat airport with a small backpack and a big smile. Today he would take his first flight alone to visit his cousins in Da Nang. His parents walked with him to the airline counter and helped him with the check-in process. The agent asked for his ID and printed a [boarding pass] with his seat number. Minh held the pass carefully like a ticket to a new world. After saying goodbye to his parents, he followed the signs toward [security]. He put his phone and keys into a plastic tray and placed his backpack on the conveyor belt of the X-ray machine. A friendly officer asked him to step through the [metal detector]. Minh felt a little nervous, but the officer gave him a reassuring nod, and everything was fine.

Beyond security, the [terminal] opened like a small city. There were bright shops, cozy cafés, and large windows looking over the runway. Minh found his [gate] and sat near a family with a cute baby. To pass the time, he read the safety card and listened to an announcement about boarding groups. When his group was called, he joined the line and handed his boarding pass to the gate agent. Walking down the [jet bridge], Minh saw the aircraft waiting, its silver body shining in the sun. Inside, a flight attendant greeted him and showed him the [overhead bin] for his backpack. Minh buckled his seat belt, looked out the window, and watched the ground crew finish their work.

As the plane took off, his stomach felt light, and the city grew smaller below. The clouds looked like mountains of cotton. During the flight, a cabin crew member offered water and a light snack. Minh practiced a few English phrases he had learned, such as "excuse me" and "thank you," which made the attendant smile. He opened his notebook and wrote a short diary entry about the view and the gentle [turbulence] that made his cup shake a little. A friendly passenger sitting beside him told stories about favorite beaches in Da Nang and recommended a night market with delicious noodles.

After the plane landed, Minh followed the signs to [baggage claim], even though he had only a carry-on. He met his uncle near the arrivals hall, where people were holding welcome signs and flowers. Minh felt proud. He had managed the entire journey by himself—from check-in to security, boarding, and landing. On the ride to his cousins' house, he looked out the window at the blue sea and promised himself that next time he would be brave enough to ask the flight attendant for a window seat again.`,
    level: 2,
    vocab: [
      { term: 'boarding pass', meaning: 'thẻ lên máy bay', pronunciation: '/ˈbɔːrdɪŋ pæs/', phonetics: { uk: '/ˈbɔː.dɪŋ pɑːs/', us: '/ˈbɔːrdɪŋ pæs/' }, image: 'https://images.unsplash.com/photo-1612487776670-5d5d295df1c8?w=300', explanationEn: 'A ticket that lets you board the plane.', examples: ['Please keep your boarding pass ready.', 'The agent checked my boarding pass.'], partOfSpeech: 'noun [ C ]' },
      { term: 'security', meaning: 'khu an ninh sân bay', pronunciation: '/sɪˈkjʊərəti/', image: 'https://images.unsplash.com/photo-1586016412840-fd89c7738b72?w=300', explanationEn: 'The area where passengers and bags are checked for safety.', examples: ['We went through security quickly.', 'Security checks all bags.'] },
      { term: 'metal detector', meaning: 'cổng dò kim loại', pronunciation: '/ˈmetl dɪˌtektər/', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=300', explanationEn: 'A machine that beeps if you carry metal.', examples: ['Walk through the metal detector.', 'The metal detector did not beep.'] },
      { term: 'terminal', meaning: 'nhà ga sân bay', pronunciation: '/ˈtɜːrmɪnəl/', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=300&blend=ffffff', explanationEn: 'A building at the airport where passengers wait and board.', examples: ['The shop is in Terminal 2.', 'Our gate is in the main terminal.'] },
      { term: 'gate', meaning: 'cổng lên máy bay', pronunciation: '/ɡeɪt/', image: 'https://images.unsplash.com/photo-1504198266285-165a4dddbb96?w=300', explanationEn: 'The place where you board the plane.', examples: ['Boarding starts at Gate A5.', 'Let’s wait near the gate.'] },
      { term: 'jet bridge', meaning: 'ống lồng', pronunciation: '/dʒet brɪdʒ/', image: 'https://images.unsplash.com/photo-1504198266285-165a4dddbb96?w=300&sat=-50', explanationEn: 'A walkway that connects the gate to the airplane.', examples: ['We walked through the jet bridge.', 'The jet bridge is connected to the door.'] },
      { term: 'overhead bin', meaning: 'khoang để hành lý phía trên', pronunciation: '/ˌoʊvərˈhed bɪn/', image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=300', explanationEn: 'The storage space above the seats on a plane.', examples: ['Put your bag in the overhead bin.', 'The overhead bins are full.'] },
      { term: 'turbulence', meaning: 'nhiễu động không khí', pronunciation: '/ˈtɜːrbjələns/', image: 'https://images.unsplash.com/photo-1473186505569-9c61870c11f9?w=300', explanationEn: 'Shaking or movement of the plane caused by air.', examples: ['The plane had light turbulence.', 'Turbulence made my cup shake.'] },
      { term: 'baggage claim', meaning: 'băng chuyền nhận hành lý', pronunciation: '/ˈbæɡɪdʒ kleɪm/', image: 'https://images.unsplash.com/photo-1502920917128-1aa500764ce7?w=300&sat=-20', explanationEn: 'The area where you pick up your luggage after landing.', examples: ['We went to baggage claim.', 'Find our suitcase at baggage claim.'] }
    ]
  },
  {
    topicId: '2',
    topicSlug: 'daily-activities',
    title: 'A Productive School Day',
    thumbnail: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400',
    excerpt: 'A longer story following a student through a focused and healthy day.',
    text: `Every weekday, Linh wakes up to the gentle sound of her alarm at half past six. She opens the window to let in cool morning air and stretches her arms toward the sky. After brushing her teeth and washing her face, she prepares a simple breakfast with oatmeal, a sliced banana, and a glass of milk. While eating, she checks her timetable and packs her backpack, making sure her notebooks and pencil case are ready. Before leaving for school, she waters a small plant on the balcony and tells herself one positive sentence: “Today I will learn with joy.”

At school, Linh greets her friends and heads to her homeroom. The first class is English. The teacher begins with a short warm-up game and then introduces a new reading passage. Linh underlines key phrases and asks two questions to clarify the main idea. During the break, she drinks water and walks around the yard to relax her eyes. The next class is science. Linh and her partner conduct a simple experiment with magnets and record the results in a table. When the lunch bell rings, she chooses rice with vegetables and chicken, and sits with a friend who tells a funny story about a lost umbrella.

In the afternoon, Linh has math and art. She practices solving word problems step by step and checks her answers carefully. In art class, she draws a lighthouse and shades the sky with colored pencils. After school, Linh attends a short club meeting where members plan a weekend clean-up at the park. At home, she takes a short nap, then spends forty minutes on homework. She uses a timer to keep focused and a checklist to mark each completed task. In the evening, she helps her mom prepare dinner and washes the dishes. Before bed, Linh reads a few pages of a novel and writes three lines in her journal about something she learned, something she enjoyed, and something she wants to improve.`,
    level: 2,
    vocab: [
      { term: 'timetable', meaning: 'thời khóa biểu', pronunciation: '/ˈtaɪmˌteɪbəl/', phonetics: { uk: '/ˈtaɪmˌteɪ.bəl/', us: '/ˈtaɪmˌteɪ.bəl/' }, image: 'https://images.unsplash.com/photo-1518085250887-2f903c200fee?w=300', explanationEn: 'A schedule that shows your classes or times.', examples: ['I checked my timetable.', 'The timetable says math at 2 pm.'], partOfSpeech: 'noun [ C ]' },
      { term: 'pencil case', meaning: 'hộp bút', pronunciation: '/ˈpɛnsl keɪs/', image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=300', explanationEn: 'A small bag or box to keep pens and pencils.', examples: ['She packed her pencil case.', 'My pencil case is blue.'] },
      { term: 'homeroom', meaning: 'lớp chủ nhiệm', pronunciation: '/ˈhoʊmˌrum/', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=300', explanationEn: 'The classroom you go to first each day.', examples: ['We meet in homeroom at 7:30.', 'The teacher takes attendance in homeroom.'] },
      { term: 'warm-up', meaning: 'khởi động', pronunciation: '/ˈwɔːrm ʌp/', image: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=300', explanationEn: 'A short activity to get ready for learning.', examples: ['We played a warm-up game.', 'The warm-up took five minutes.'] },
      { term: 'experiment', meaning: 'thí nghiệm', pronunciation: '/ɪkˈspɛrɪmənt/', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300', explanationEn: 'A test done to learn something in science.', examples: ['Our experiment used magnets.', 'We wrote the experiment results.'] },
      { term: 'word problem', meaning: 'bài toán có lời văn', pronunciation: '/wɜːrd ˈprɑːbləm/', image: 'https://images.unsplash.com/photo-1509223197845-458d87318791?w=300', explanationEn: 'A math question written in sentences.', examples: ['She solved a word problem.', 'Read the word problem carefully.'] },
      { term: 'checklist', meaning: 'danh sách kiểm', pronunciation: '/ˈtʃɛkˌlɪst/', image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=300&sat=-30', explanationEn: 'A list of things to do or check.', examples: ['I marked my checklist.', 'The checklist keeps me focused.'] },
      { term: 'journal', meaning: 'nhật ký', pronunciation: '/ˈdʒɝːnəl/', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300', explanationEn: 'A notebook where you write thoughts each day.', examples: ['She wrote in her journal.', 'The journal keeps memories.'] }
    ]
  },
  {
    topicId: '3',
    topicSlug: 'nature',
    title: 'Morning by the Lake',
    thumbnail: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400',
    excerpt: 'A calm, descriptive piece about nature and mindful observation.',
    text: `At sunrise, the lake holds a quiet silver color, as if it were a mirror waiting for the day to begin. Mai walks along the wooden path with her father, counting soft ripples in the water. A light mist floats above the surface, and the hills on the other side look like shadows from a gentle dream. Birds greet the morning with bright calls, and a small heron stands still near the reeds, watching for tiny fish. Mai breathes in the fresh air and notices how the wind moves through the leaves, making them whisper like old friends.

They find a bench under a pine tree and share a thermos of warm tea. Mai opens a sketchbook and tries to draw the line where the water meets the sky. Her father shows her how to use simple shapes to outline the shore, the dock, and a rowing boat tied to a post. As the sun rises higher, colors become stronger: golden light on the water, deep green in the trees, and a clear blue above. A family arrives with a picnic basket, and a child laughs as he tosses crumbs to a duck.

Mai and her father walk to a small garden near the lake, where they read the names of native plants on little signs. She learns about moss, ferns, and wildflowers. They pause at a board that explains how a wetland works like a natural filter, cleaning water and providing a habitat for insects and birds. On the way back, Mai tries to describe everything she sees in simple sentences: the reflection of clouds, the pattern of waves, and the steady rhythm of her footsteps. She decides to return next week to sketch again, bringing colored pencils so the picture can match the living colors of the morning.`,
    level: 2,
    vocab: [
      { term: 'mist', meaning: 'sương mù nhẹ', pronunciation: '/mɪst/', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=300', explanationEn: 'Very light fog near the ground or water.', examples: ['Mist covered the lake.', 'The mist felt cool.'] },
      { term: 'heron', meaning: 'chim diệc', pronunciation: '/ˈher.ən/', image: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=300', explanationEn: 'A tall bird that hunts fish in water.', examples: ['A heron stood by the reeds.', 'The heron moved slowly.'] },
      { term: 'reeds', meaning: 'bụi sậy', pronunciation: '/riːdz/', image: 'https://images.unsplash.com/photo-1506808547685-e2ba962dedf0?w=300', explanationEn: 'Tall grass-like plants that grow near water.', examples: ['Fish hide in the reeds.', 'Wind shakes the reeds.'] },
      { term: 'thermos', meaning: 'bình giữ nhiệt', pronunciation: '/ˈθɜːrmoʊs/', image: 'https://images.unsplash.com/photo-1527960471264-932f39eb5840?w=300', explanationEn: 'A bottle that keeps drinks warm or cold.', examples: ['They shared tea from a thermos.', 'Bring a thermos to the park.'] },
      { term: 'dock', meaning: 'bến tàu nhỏ', pronunciation: '/dɑːk/', image: 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?w=300', explanationEn: 'A wooden platform by the water for boats.', examples: ['The boat is tied to the dock.', 'We sat on the dock.'] },
      { term: 'wetland', meaning: 'đầm lầy/đất ngập nước', pronunciation: '/ˈwet.lænd/', image: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=300', explanationEn: 'Land covered by water that is home to many plants and animals.', examples: ['The wetland cleans water.', 'Birds live in the wetland.'] },
      { term: 'habitat', meaning: 'môi trường sống', pronunciation: '/ˈhæb.ɪ.tæt/', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=300&sat=-20', explanationEn: 'The natural home of an animal or plant.', examples: ['The lake is a habitat for ducks.', 'Protect their habitat.'] },
      { term: 'reflection', meaning: 'sự phản chiếu', pronunciation: '/rɪˈflekʃn/', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=300', explanationEn: 'An image you see in water or a mirror.', examples: ['Clouds make a soft reflection.', 'I saw my reflection in the lake.'] }
    ]
  }
];


