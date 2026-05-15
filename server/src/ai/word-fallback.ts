import { GeneratedWord } from './ai.service';

type WordEntry = GeneratedWord;

const WORD_BANK: Record<string, WordEntry[]> = {
  food: [
    { word: 'apple', translation: 'olma', example: 'I eat an apple every day.', exampleUz: 'Men har kuni olma yeyman.', level: 'A1' , category: 'food' },
    { word: 'bread', translation: 'non', example: 'She bought fresh bread from the bakery.', exampleUz: 'U novvoyxonadan yangi non sotib oldi.', level: 'A1' , category: 'food' },
    { word: 'chicken', translation: 'tovuq', example: 'We had grilled chicken for dinner.', exampleUz: 'Biz kechki ovqatga qovurilgan tovuq yedik.', level: 'A1' , category: 'food' },
    { word: 'vegetables', translation: 'sabzavotlar', example: 'Eat more vegetables to stay healthy.', exampleUz: 'Sog\' bo\'lish uchun ko\'proq sabzavot yeng.', level: 'A2' , category: 'food' },
    { word: 'delicious', translation: 'mazali', example: 'This soup is absolutely delicious.', exampleUz: 'Bu sho\'rva juda mazali.', level: 'A2' , category: 'food' },
    { word: 'ingredient', translation: 'ingrediyent', example: 'What ingredients do you need for this recipe?', exampleUz: 'Bu retsept uchun qanday ingrediyentlar kerak?', level: 'B1' , category: 'food' },
    { word: 'cuisine', translation: 'milliy taom', example: 'Italian cuisine is popular worldwide.', exampleUz: 'Italyan taomlari dunyoda mashhur.', level: 'B2' , category: 'food' },
    { word: 'nutritious', translation: 'ozuqaviy', example: 'Vegetables are nutritious and healthy.', exampleUz: 'Sabzavotlar ozuqaviy va foydali.', level: 'B2' , category: 'food' },
    { word: 'appetizer', translation: 'ishtaha ochuvchi taom', example: 'We ordered a salad as an appetizer.', exampleUz: 'Biz ishtaha ochuvchi sifatida salat buyurdik.', level: 'C1' , category: 'food' },
    { word: 'garnish', translation: 'bezak', example: 'The chef added a parsley garnish.', exampleUz: 'Oshpaz maydanoz bezagini qo\'shdi.', level: 'C1' , category: 'food' },
  ],
  animals: [
    { word: 'cat', translation: 'mushuk', example: 'The cat is sleeping on the sofa.', exampleUz: 'Mushuk divanda uxlayapti.', level: 'A1' , category: 'animals' },
    { word: 'dog', translation: 'it', example: 'My dog loves to play in the park.', exampleUz: 'Mening itim parkda o\'ynashni yaxshi ko\'radi.', level: 'A1' , category: 'animals' },
    { word: 'elephant', translation: 'fil', example: 'Elephants are the largest land animals.', exampleUz: 'Fillar eng katta quruqlik hayvonlaridir.', level: 'A2' , category: 'animals' },
    { word: 'dolphin', translation: 'delfin', example: 'Dolphins are very intelligent animals.', exampleUz: 'Delfinlar juda aqlli hayvonlar.', level: 'A2' , category: 'animals' },
    { word: 'predator', translation: 'yirtqich', example: 'Lions are predators in the wild.', exampleUz: 'Sher tabiatda yirtqich hisoblanadi.', level: 'B1' , category: 'animals' },
    { word: 'hibernate', translation: 'qishki uyqu', example: 'Bears hibernate during winter.', exampleUz: 'Ayiqlar qishda qishki uyquga ketadi.', level: 'B1' , category: 'animals' },
    { word: 'nocturnal', translation: 'tungi', example: 'Owls are nocturnal creatures.', exampleUz: 'Boyqushlar tungi jonzotlar.', level: 'B2' , category: 'animals' },
    { word: 'carnivore', translation: 'go\'shtxo\'r', example: 'Tigers are carnivores.', exampleUz: 'Yo\'lbarslar go\'shtxo\'r.', level: 'B2' , category: 'animals' },
    { word: 'endangered', translation: 'yo\'qolib ketish xavfi ostidagi', example: 'Pandas are an endangered species.', exampleUz: 'Pandalar yo\'qolib ketish xavfi ostidagi tur.', level: 'C1' , category: 'animals' },
    { word: 'migration', translation: 'ko\'chib yurish', example: 'Birds undergo migration in autumn.', exampleUz: 'Qushlar kuzda ko\'chib yuradi.', level: 'C1' , category: 'animals' },
  ],
  travel: [
    { word: 'passport', translation: 'pasport', example: 'Don\'t forget your passport when traveling.', exampleUz: 'Sayohat qilganda pasportingizni unutmang.', level: 'A1' , category: 'travel' },
    { word: 'ticket', translation: 'chipta', example: 'I bought a plane ticket online.', exampleUz: 'Men onlayn samolyot chiptasi sotib oldim.', level: 'A1' , category: 'travel' },
    { word: 'luggage', translation: 'bagaj', example: 'My luggage was too heavy.', exampleUz: 'Mening bagajim juda og\'ir edi.', level: 'A2' , category: 'travel' },
    { word: 'destination', translation: 'manzil', example: 'Paris is our final destination.', exampleUz: 'Parij bizning yakuniy manzilimiz.', level: 'A2' , category: 'travel' },
    { word: 'itinerary', translation: 'sayohat rejasi', example: 'She planned a detailed itinerary.', exampleUz: 'U batafsil sayohat rejasi tuzdi.', level: 'B1' , category: 'travel' },
    { word: 'accommodation', translation: 'turar joy', example: 'We need to book accommodation in advance.', exampleUz: 'Biz oldindan turar joy bron qilishimiz kerak.', level: 'B1' , category: 'travel' },
    { word: 'embark', translation: 'yo\'lga chiqmoq', example: 'We embark on our journey tomorrow.', exampleUz: 'Biz ertaga yo\'lga chiqamiz.', level: 'B2' , category: 'travel' },
    { word: 'souvenir', translation: 'sovg\'a-esdalik', example: 'She bought souvenirs for her family.', exampleUz: 'U oilasi uchun esdalik sovg\'alar sotib oldi.', level: 'B2' , category: 'travel' },
    { word: 'expedition', translation: 'ekspeditsiya', example: 'They went on an expedition to the mountains.', exampleUz: 'Ular tog\'larga ekspeditsiyaga ketdi.', level: 'C1' , category: 'travel' },
    { word: 'visa', translation: 'viza', example: 'You need a visa to enter that country.', exampleUz: 'O\'sha davlatga kirish uchun sizga viza kerak.', level: 'A2' , category: 'travel' },
  ],
  technology: [
    { word: 'computer', translation: 'kompyuter', example: 'I use a computer for work every day.', exampleUz: 'Men har kuni ishda kompyuter ishlataman.', level: 'A1' , category: 'technology' },
    { word: 'internet', translation: 'internet', example: 'The internet connects people worldwide.', exampleUz: 'Internet butun dunyodagi odamlarni bog\'laydi.', level: 'A1' , category: 'technology' },
    { word: 'software', translation: 'dasturiy ta\'minot', example: 'This software helps manage projects.', exampleUz: 'Bu dastur loyihalarni boshqarishga yordam beradi.', level: 'A2' , category: 'technology' },
    { word: 'database', translation: 'ma\'lumotlar bazasi', example: 'The data is stored in a database.', exampleUz: 'Ma\'lumotlar bazada saqlanadi.', level: 'B1' , category: 'technology' },
    { word: 'algorithm', translation: 'algoritm', example: 'The algorithm sorts data efficiently.', exampleUz: 'Algoritm ma\'lumotlarni samarali tartiblaydi.', level: 'B1' , category: 'technology' },
    { word: 'encryption', translation: 'shifrlash', example: 'Encryption protects sensitive data.', exampleUz: 'Shifrlash muhim ma\'lumotlarni himoya qiladi.', level: 'B2' , category: 'technology' },
    { word: 'bandwidth', translation: 'o\'tkazish quvvati', example: 'High bandwidth allows faster downloads.', exampleUz: 'Yuqori o\'tkazish quvvati tezroq yuklab olish imkonini beradi.', level: 'B2' , category: 'technology' },
    { word: 'cybersecurity', translation: 'kiberxavfsizlik', example: 'Cybersecurity is critical for businesses.', exampleUz: 'Kiberxavfsizlik biznes uchun muhim.', level: 'C1' , category: 'technology' },
    { word: 'artificial intelligence', translation: 'sun\'iy intellekt', example: 'AI is transforming many industries.', exampleUz: 'Sun\'iy intellekt ko\'plab sohalarni o\'zgartirmoqda.', level: 'C1' , category: 'technology' },
    { word: 'cloud computing', translation: 'bulut hisoblash', example: 'Cloud computing reduces IT costs.', exampleUz: 'Bulut hisoblash IT xarajatlarini kamaytiradi.', level: 'C1' , category: 'technology' },
  ],
  sports: [
    { word: 'football', translation: 'futbol', example: 'He plays football every weekend.', exampleUz: 'U har dam olish kunida futbol o\'ynaydi.', level: 'A1' , category: 'sports' },
    { word: 'team', translation: 'jamoa', example: 'Our team won the championship.', exampleUz: 'Bizning jamoamiz chempionatda g\'alaba qozondi.', level: 'A1' , category: 'sports' },
    { word: 'competition', translation: 'musobaqa', example: 'She entered a swimming competition.', exampleUz: 'U suzish musobaqasiga kirdi.', level: 'A2' , category: 'sports' },
    { word: 'athlete', translation: 'sportchi', example: 'He trained to become a professional athlete.', exampleUz: 'U professional sportchi bo\'lish uchun mashg\'ulot qildi.', level: 'A2' , category: 'sports' },
    { word: 'tournament', translation: 'turnir', example: 'The tennis tournament lasts two weeks.', exampleUz: 'Tennis turniri ikki hafta davom etadi.', level: 'B1' , category: 'sports' },
    { word: 'stamina', translation: 'chidamlilik', example: 'Runners need great stamina.', exampleUz: 'Yuguruvchilar katta chidamlilikka ega bo\'lishlari kerak.', level: 'B1' , category: 'sports' },
    { word: 'referee', translation: 'hakam', example: 'The referee blew the whistle.', exampleUz: 'Hakam hushtakni chaldi.', level: 'B2' , category: 'sports' },
    { word: 'tactics', translation: 'taktika', example: 'Good tactics won the match.', exampleUz: 'Yaxshi taktika o\'yinni g\'alaba bilan tugatdi.', level: 'B2' , category: 'sports' },
    { word: 'championship', translation: 'chempionat', example: 'They qualified for the world championship.', exampleUz: 'Ular jahon chempionatiga yo\'llanma oldi.', level: 'C1' , category: 'sports' },
    { word: 'sportsmanship', translation: 'sportchilik ruhi', example: 'He showed great sportsmanship.', exampleUz: 'U ajoyib sportchilik ruhini ko\'rsatdi.', level: 'C1' , category: 'sports' },
  ],
  health: [
    { word: 'doctor', translation: 'shifokor', example: 'I need to see a doctor today.', exampleUz: 'Men bugun shifokorga borishim kerak.', level: 'A1' , category: 'health' },
    { word: 'medicine', translation: 'dori', example: 'Take this medicine after meals.', exampleUz: 'Bu dorini ovqatdan keyin iching.', level: 'A1' , category: 'health' },
    { word: 'exercise', translation: 'jismoniy mashq', example: 'Regular exercise keeps you healthy.', exampleUz: 'Muntazam mashq sog\'ligingizni saqlaydi.', level: 'A2' , category: 'health' },
    { word: 'symptom', translation: 'belgi', example: 'Fever is a common symptom of the flu.', exampleUz: 'Isitma grippning keng tarqalgan belgisi.', level: 'B1' , category: 'health' },
    { word: 'diagnosis', translation: 'tashxis', example: 'The doctor gave a clear diagnosis.', exampleUz: 'Shifokor aniq tashxis qo\'ydi.', level: 'B1' , category: 'health' },
    { word: 'vaccination', translation: 'emlash', example: 'Vaccination prevents many diseases.', exampleUz: 'Emlash ko\'p kasalliklarning oldini oladi.', level: 'B2' , category: 'health' },
    { word: 'metabolism', translation: 'moddalar almashinuvi', example: 'Exercise speeds up metabolism.', exampleUz: 'Mashq moddalar almashinuvini tezlashtiradi.', level: 'C1' , category: 'health' },
    { word: 'immune system', translation: 'immunitet tizimi', example: 'A healthy diet boosts the immune system.', exampleUz: 'Sog\'lom ovqatlanish immunitet tizimini mustahkamlaydi.', level: 'C1' , category: 'health' },
    { word: 'nutrition', translation: 'ovqatlanish', example: 'Good nutrition is key to good health.', exampleUz: 'Yaxshi ovqatlanish sog\'lik uchun muhim.', level: 'B1' , category: 'health' },
    { word: 'surgery', translation: 'jarrohlik', example: 'He underwent surgery last month.', exampleUz: 'U o\'tgan oy jarrohlikdan o\'tdi.', level: 'B2' , category: 'health' },
  ],
  education: [
    { word: 'student', translation: 'talaba', example: 'She is an excellent student.', exampleUz: 'U a\'lo talaba.', level: 'A1' , category: 'education' },
    { word: 'teacher', translation: 'o\'qituvchi', example: 'The teacher explains the lesson clearly.', exampleUz: 'O\'qituvchi darsni aniq tushuntiradi.', level: 'A1' , category: 'education' },
    { word: 'homework', translation: 'uy vazifasi', example: 'I finished my homework before dinner.', exampleUz: 'Men kechki ovqatdan oldin uy vazifamni bajardim.', level: 'A1' , category: 'education' },
    { word: 'curriculum', translation: 'o\'quv dasturi', example: 'The curriculum includes science and math.', exampleUz: 'O\'quv dasturiga fan va matematika kiradi.', level: 'B1' , category: 'education' },
    { word: 'scholarship', translation: 'stipendiya', example: 'She received a scholarship for college.', exampleUz: 'U kollej uchun stipendiya oldi.', level: 'B1' , category: 'education' },
    { word: 'graduate', translation: 'bitiruvchi', example: 'He graduated from university last year.', exampleUz: 'U o\'tgan yili universitetni tamomladi.', level: 'B2' , category: 'education' },
    { word: 'thesis', translation: 'dissertatsiya', example: 'She wrote her thesis on climate change.', exampleUz: 'U iqlim o\'zgarishi haqida dissertatsiya yozdi.', level: 'C1' , category: 'education' },
    { word: 'semester', translation: 'semestr', example: 'The new semester starts in September.', exampleUz: 'Yangi semestr sentyabrda boshlanadi.', level: 'A2' , category: 'education' },
    { word: 'assignment', translation: 'topshiriq', example: 'Submit your assignment by Friday.', exampleUz: 'Topshiriqni juma kuni topshiring.', level: 'A2' , category: 'education' },
    { word: 'lecture', translation: 'ma\'ruza', example: 'The lecture was very interesting.', exampleUz: 'Ma\'ruza juda qiziqarli edi.', level: 'B1' , category: 'education' },
  ],
  business: [
    { word: 'company', translation: 'kompaniya', example: 'She works for a large company.', exampleUz: 'U katta kompaniyada ishlaydi.', level: 'A1' , category: 'business' },
    { word: 'profit', translation: 'foyda', example: 'The company made a large profit.', exampleUz: 'Kompaniya katta foyda oldi.', level: 'A2' , category: 'business' },
    { word: 'market', translation: 'bozor', example: 'The stock market rose today.', exampleUz: 'Bugun fond bozori ko\'tarildi.', level: 'A2' , category: 'business' },
    { word: 'investment', translation: 'investitsiya', example: 'Real estate is a good investment.', exampleUz: 'Ko\'chmas mulk yaxshi investitsiya.', level: 'B1' , category: 'business' },
    { word: 'strategy', translation: 'strategiya', example: 'We need a new marketing strategy.', exampleUz: 'Bizga yangi marketing strategiyasi kerak.', level: 'B1' , category: 'business' },
    { word: 'entrepreneur', translation: 'tadbirkor', example: 'She is a successful entrepreneur.', exampleUz: 'U muvaffaqiyatli tadbirkor.', level: 'B2' , category: 'business' },
    { word: 'revenue', translation: 'daromad', example: 'Revenue increased by 20% this year.', exampleUz: 'Bu yil daromad 20% oshdi.', level: 'B2' , category: 'business' },
    { word: 'merger', translation: 'qo\'shilish', example: 'The merger created a powerful company.', exampleUz: 'Qo\'shilish qudratli kompaniya yaratdi.', level: 'C1' , category: 'business' },
    { word: 'negotiation', translation: 'muzokaralar', example: 'The negotiation lasted three hours.', exampleUz: 'Muzokaralar uch soat davom etdi.', level: 'C1' , category: 'business' },
    { word: 'stakeholder', translation: 'manfaatdor tomon', example: 'All stakeholders agreed on the plan.', exampleUz: 'Barcha manfaatdor tomonlar rejaga rozi bo\'ldi.', level: 'C1' , category: 'business' },
  ],
  nature: [
    { word: 'mountain', translation: 'tog\'', example: 'We climbed a high mountain.', exampleUz: 'Biz baland tog\'ga chiqdik.', level: 'A1' , category: 'nature' },
    { word: 'river', translation: 'daryo', example: 'The river flows through the city.', exampleUz: 'Daryo shahar orqali oqadi.', level: 'A1' , category: 'nature' },
    { word: 'forest', translation: 'o\'rmon', example: 'The forest is home to many animals.', exampleUz: 'O\'rmon ko\'plab hayvonlarning uyiga.', level: 'A1' , category: 'nature' },
    { word: 'ecosystem', translation: 'ekotizim', example: 'The rainforest is a rich ecosystem.', exampleUz: 'Tropik o\'rmon boy ekotizim.', level: 'B1' , category: 'nature' },
    { word: 'climate', translation: 'iqlim', example: 'The climate is changing rapidly.', exampleUz: 'Iqlim tezlik bilan o\'zgarmoqda.', level: 'B1' , category: 'nature' },
    { word: 'biodiversity', translation: 'biologik xilma-xillik', example: 'Biodiversity is vital for our planet.', exampleUz: 'Biologik xilma-xillik sayyoramiz uchun muhim.', level: 'C1' , category: 'nature' },
    { word: 'drought', translation: 'qurg\'oqchilik', example: 'The drought destroyed the crops.', exampleUz: 'Qurg\'oqchilik ekinlarni nobud qildi.', level: 'B2' , category: 'nature' },
    { word: 'vegetation', translation: 'o\'simlik qoplami', example: 'Dense vegetation covers the hills.', exampleUz: 'Qalin o\'simlik qoplami tepalikni qoplaydi.', level: 'B2' , category: 'nature' },
    { word: 'erosion', translation: 'eroziya', example: 'Soil erosion is a serious problem.', exampleUz: 'Tuproq eroziyasi jiddiy muammo.', level: 'C1' , category: 'nature' },
    { word: 'atmosphere', translation: 'atmosfera', example: 'The atmosphere protects life on Earth.', exampleUz: 'Atmosfera Yerdagi hayotni himoya qiladi.', level: 'B2' , category: 'nature' },
  ],
  family: [
    { word: 'mother', translation: 'ona', example: 'My mother cooks delicious food.', exampleUz: 'Onam mazali taom pishiradi.', level: 'A1' , category: 'family' },
    { word: 'father', translation: 'ota', example: 'My father works in an office.', exampleUz: 'Otam ofisda ishlaydi.', level: 'A1' , category: 'family' },
    { word: 'sibling', translation: 'aka-uka/opa-singil', example: 'I have two siblings.', exampleUz: 'Menda ikki aka-uka bor.', level: 'A2' , category: 'family' },
    { word: 'relative', translation: 'qarindosh', example: 'We visited our relatives on holiday.', exampleUz: 'Biz bayramda qarindoshlarimizni ziyorat qildik.', level: 'A2' , category: 'family' },
    { word: 'household', translation: 'uy xo\'jaligi', example: 'Everyone shares household chores.', exampleUz: 'Hammasi uy ishlarini baham ko\'radi.', level: 'B1' , category: 'family' },
    { word: 'generation', translation: 'avlod', example: 'Each generation faces new challenges.', exampleUz: 'Har bir avlod yangi muammolarga duch keladi.', level: 'B1' , category: 'family' },
    { word: 'nurture', translation: 'tarbiyalamoq', example: 'Parents nurture their children with love.', exampleUz: 'Ota-onalar bolalarini sevgi bilan tarbiyalaydi.', level: 'B2' , category: 'family' },
    { word: 'ancestry', translation: 'ajdodlar', example: 'She researched her ancestry online.', exampleUz: 'U ajdodlarini internetda tadqiq qildi.', level: 'C1' , category: 'family' },
    { word: 'inheritance', translation: 'meros', example: 'He received an inheritance from his grandfather.', exampleUz: 'U bobovasidan meros oldi.', level: 'C1' , category: 'family' },
    { word: 'guardian', translation: 'vasiy', example: 'The guardian took care of the child.', exampleUz: 'Vasiy bolaga g\'amxo\'rlik qildi.', level: 'B2' , category: 'family' },
  ],
};

export function getFallbackWords(topic: string, count: number): GeneratedWord[] {
  const key = topic.toLowerCase().trim();

  // Exact match
  if (WORD_BANK[key]) {
    return WORD_BANK[key].slice(0, count);
  }

  // Partial match
  const matchedKey = Object.keys(WORD_BANK).find(
    (k) => k.includes(key) || key.includes(k),
  );
  if (matchedKey) {
    return WORD_BANK[matchedKey].slice(0, count);
  }

  // Mix from all topics
  const all = Object.values(WORD_BANK).flat();
  const shuffled = all.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
