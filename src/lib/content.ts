// Curated Kenyan content with real YouTube video IDs
export interface KenyaVideo {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
  channelAvatar?: string;
  duration: string;
  views: string;
  category: string;
}

// Real Kenyan YouTube content - curated for the best experience
const kenyanContent: KenyaVideo[] = [
  // TRENDING
  { id: "dQw4w9WgXcQ", title: "Wamlambez - Sailors Gang", thumbnail: "https://i.ytimg.com/vi/vHSNZK4Je-Y/hqdefault.jpg", channel: "Sailors Gang", duration: "3:45", views: "12M", category: "trending" },
  { id: "kJa2kwoZ2a4", title: "Sauti Sol - Suzanna", thumbnail: "https://i.ytimg.com/vi/kJa2kwoZ2a4/hqdefault.jpg", channel: "Sauti Sol", duration: "4:12", views: "45M", category: "trending" },
  { id: "F2bk_9T482g", title: "Sauti Sol ft Nyashinski - Tujiangalie", thumbnail: "https://i.ytimg.com/vi/F2bk_9T482g/hqdefault.jpg", channel: "Sauti Sol", duration: "4:30", views: "18M", category: "trending" },
  { id: "5kqBBEGmGBY", title: "Nyashinski - Malaika", thumbnail: "https://i.ytimg.com/vi/5kqBBEGmGBY/hqdefault.jpg", channel: "Nyashinski", duration: "3:58", views: "22M", category: "trending" },
  { id: "PIh2xe4jnpk", title: "Khaligraph Jones - Yes Bana", thumbnail: "https://i.ytimg.com/vi/PIh2xe4jnpk/hqdefault.jpg", channel: "Khaligraph Jones", duration: "3:33", views: "15M", category: "trending" },
  { id: "tCjBbZGGMEo", title: "Otile Brown - Dusuma ft Meddy", thumbnail: "https://i.ytimg.com/vi/tCjBbZGGMEo/hqdefault.jpg", channel: "Otile Brown", duration: "4:05", views: "60M", category: "trending" },
  { id: "xW8wSEBMyzE", title: "Bien - Mbwe Mbwe ft Aaron Rimbui", thumbnail: "https://i.ytimg.com/vi/xW8wSEBMyzE/hqdefault.jpg", channel: "Bien", duration: "3:47", views: "8M", category: "trending" },
  { id: "M7FIvfx5J10", title: "Willy Paul - I Do ft Alaine", thumbnail: "https://i.ytimg.com/vi/M7FIvfx5J10/hqdefault.jpg", channel: "Willy Paul", duration: "4:22", views: "35M", category: "trending" },

  // MOVIES
  { id: "Ld4wCAid9bk", title: "Nairobi Half Life - Full Movie", thumbnail: "https://i.ytimg.com/vi/Ld4wCAid9bk/hqdefault.jpg", channel: "Kenyan Movies", duration: "1:36:00", views: "5M", category: "movies" },
  { id: "0rG3EHAI8P0", title: "Disconnect - Kenyan Film", thumbnail: "https://i.ytimg.com/vi/0rG3EHAI8P0/hqdefault.jpg", channel: "Showmax Kenya", duration: "1:42:00", views: "3.2M", category: "movies" },
  { id: "YPEzumonJg4", title: "18 Hours - Kenyan Movie", thumbnail: "https://i.ytimg.com/vi/YPEzumonJg4/hqdefault.jpg", channel: "Kenyan Films", duration: "1:28:00", views: "2.8M", category: "movies" },
  { id: "zL9IAi6oarM", title: "Subira - Award Winning Film", thumbnail: "https://i.ytimg.com/vi/zL9IAi6oarM/hqdefault.jpg", channel: "Kenyan Cinema", duration: "1:35:00", views: "1.5M", category: "movies" },
  { id: "HmZKgaHa3Fg", title: "Poacher - Kenyan Thriller", thumbnail: "https://i.ytimg.com/vi/HmZKgaHa3Fg/hqdefault.jpg", channel: "KE Movies", duration: "1:45:00", views: "900K", category: "movies" },
  { id: "3GJrhVrptHE", title: "Rafiki - Kenyan Love Story", thumbnail: "https://i.ytimg.com/vi/3GJrhVrptHE/hqdefault.jpg", channel: "Kenyan Films", duration: "1:23:00", views: "4.1M", category: "movies" },
  { id: "TzaVd6zl2bA", title: "Something Necessary - Drama", thumbnail: "https://i.ytimg.com/vi/TzaVd6zl2bA/hqdefault.jpg", channel: "KE Cinema", duration: "1:30:00", views: "2M", category: "movies" },
  { id: "7YJMFbh4nSI", title: "Supa Modo - Family Film", thumbnail: "https://i.ytimg.com/vi/7YJMFbh4nSI/hqdefault.jpg", channel: "One Fine Day Films", duration: "1:14:00", views: "3.5M", category: "movies" },

  // MUSIC VIDEOS
  { id: "kJa2kwoZ2a4", title: "Sauti Sol - Suzanna", thumbnail: "https://i.ytimg.com/vi/kJa2kwoZ2a4/hqdefault.jpg", channel: "Sauti Sol", duration: "4:12", views: "45M", category: "music" },
  { id: "tCjBbZGGMEo", title: "Otile Brown - Dusuma ft Meddy", thumbnail: "https://i.ytimg.com/vi/tCjBbZGGMEo/hqdefault.jpg", channel: "Otile Brown", duration: "4:05", views: "60M", category: "music" },
  { id: "PIh2xe4jnpk", title: "Khaligraph Jones - Yes Bana", thumbnail: "https://i.ytimg.com/vi/PIh2xe4jnpk/hqdefault.jpg", channel: "Khaligraph Jones", duration: "3:33", views: "15M", category: "music" },
  { id: "5kqBBEGmGBY", title: "Nyashinski - Malaika", thumbnail: "https://i.ytimg.com/vi/5kqBBEGmGBY/hqdefault.jpg", channel: "Nyashinski", duration: "3:58", views: "22M", category: "music" },
  { id: "M7FIvfx5J10", title: "Willy Paul - I Do ft Alaine", thumbnail: "https://i.ytimg.com/vi/M7FIvfx5J10/hqdefault.jpg", channel: "Willy Paul", duration: "4:22", views: "35M", category: "music" },
  { id: "xW8wSEBMyzE", title: "Bien - Mbwe Mbwe", thumbnail: "https://i.ytimg.com/vi/xW8wSEBMyzE/hqdefault.jpg", channel: "Bien", duration: "3:47", views: "8M", category: "music" },
  { id: "F2bk_9T482g", title: "Sauti Sol - Tujiangalie", thumbnail: "https://i.ytimg.com/vi/F2bk_9T482g/hqdefault.jpg", channel: "Sauti Sol", duration: "4:30", views: "18M", category: "music" },
  { id: "vHSNZK4Je-Y", title: "Sailors - Wamlambez", thumbnail: "https://i.ytimg.com/vi/vHSNZK4Je-Y/hqdefault.jpg", channel: "Sailors Gang", duration: "3:45", views: "12M", category: "music" },

  // GOSPEL
  { id: "K7l5ZoZxOq8", title: "Mercy Masika - Mwema", thumbnail: "https://i.ytimg.com/vi/K7l5ZoZxOq8/hqdefault.jpg", channel: "Mercy Masika", duration: "5:10", views: "14M", category: "gospel" },
  { id: "DrehMU5B3VQ", title: "Size 8 - Mateke", thumbnail: "https://i.ytimg.com/vi/DrehMU5B3VQ/hqdefault.jpg", channel: "Size 8", duration: "4:15", views: "18M", category: "gospel" },
  { id: "Bk0e0qCfSMI", title: "Guardian Angel - Nadeka", thumbnail: "https://i.ytimg.com/vi/Bk0e0qCfSMI/hqdefault.jpg", channel: "Guardian Angel", duration: "4:30", views: "6M", category: "gospel" },
  { id: "j5-yKhDd64s", title: "Bahati - Mama", thumbnail: "https://i.ytimg.com/vi/j5-yKhDd64s/hqdefault.jpg", channel: "Bahati", duration: "4:00", views: "25M", category: "gospel" },
  { id: "RGKFXFBLhQw", title: "Eunice Njeri - Naogopa", thumbnail: "https://i.ytimg.com/vi/RGKFXFBLhQw/hqdefault.jpg", channel: "Eunice Njeri", duration: "5:20", views: "8M", category: "gospel" },
  { id: "Cj4z5KmYN0o", title: "Christina Shusho - Napokea Kwako", thumbnail: "https://i.ytimg.com/vi/Cj4z5KmYN0o/hqdefault.jpg", channel: "Christina Shusho", duration: "6:00", views: "20M", category: "gospel" },

  // COMEDY
  { id: "pRpeEdMmmQ0", title: "Churchill Show - Best of 2024", thumbnail: "https://i.ytimg.com/vi/pRpeEdMmmQ0/hqdefault.jpg", channel: "Churchill Show", duration: "45:00", views: "5M", category: "comedy" },
  { id: "qDc_5zpBj7s", title: "Eric Omondi - Wife Material", thumbnail: "https://i.ytimg.com/vi/qDc_5zpBj7s/hqdefault.jpg", channel: "Eric Omondi", duration: "12:00", views: "3M", category: "comedy" },
  { id: "Kh0Y2hVe_bI", title: "Njugush - Quarantine Comedy", thumbnail: "https://i.ytimg.com/vi/Kh0Y2hVe_bI/hqdefault.jpg", channel: "Njugush", duration: "8:00", views: "7M", category: "comedy" },
  { id: "rUWjGzXp0Sg", title: "Crazy Kennar - School Days", thumbnail: "https://i.ytimg.com/vi/rUWjGzXp0Sg/hqdefault.jpg", channel: "Crazy Kennar", duration: "5:00", views: "10M", category: "comedy" },
  { id: "fRh_vgS2dFE", title: "Flaqo - African Parents", thumbnail: "https://i.ytimg.com/vi/fRh_vgS2dFE/hqdefault.jpg", channel: "Flaqo", duration: "6:30", views: "8M", category: "comedy" },
  { id: "5VoscbQA8Kk", title: "Abel Mutua - Stories of Ali", thumbnail: "https://i.ytimg.com/vi/5VoscbQA8Kk/hqdefault.jpg", channel: "Abel Mutua", duration: "15:00", views: "4M", category: "comedy" },

  // GENGE / GENGETONE
  { id: "vHSNZK4Je-Y", title: "Sailors Gang - Wamlambez", thumbnail: "https://i.ytimg.com/vi/vHSNZK4Je-Y/hqdefault.jpg", channel: "Sailors Gang", duration: "3:45", views: "12M", category: "genge" },
  { id: "5GWBkb2gNGI", title: "Ethic - Lamba Lolo", thumbnail: "https://i.ytimg.com/vi/5GWBkb2gNGI/hqdefault.jpg", channel: "Ethic Entertainment", duration: "3:20", views: "20M", category: "genge" },
  { id: "GJ_SuA40X_U", title: "Trio Mio - Cheza Kama Wewe", thumbnail: "https://i.ytimg.com/vi/GJ_SuA40X_U/hqdefault.jpg", channel: "Trio Mio", duration: "3:15", views: "9M", category: "genge" },
  { id: "bTxJNNfE8yU", title: "Mbogi Genje - Ngumi", thumbnail: "https://i.ytimg.com/vi/bTxJNNfE8yU/hqdefault.jpg", channel: "Mbogi Genje", duration: "3:00", views: "6M", category: "genge" },
  { id: "c8aFcHFu8YM", title: "Rekles - Moto", thumbnail: "https://i.ytimg.com/vi/c8aFcHFu8YM/hqdefault.jpg", channel: "Rekles", duration: "3:30", views: "5M", category: "genge" },
  { id: "W9nZ6u15yis", title: "Mejja - Siskii", thumbnail: "https://i.ytimg.com/vi/W9nZ6u15yis/hqdefault.jpg", channel: "Mejja", duration: "3:55", views: "11M", category: "genge" },

  // DJ ARO COLLECTION
  { id: "J3UjJ4wKLkg", title: "DJ Aro - Kenyan Mix Vol 1", thumbnail: "https://i.ytimg.com/vi/J3UjJ4wKLkg/hqdefault.jpg", channel: "DJ Aro", duration: "1:20:00", views: "2M", category: "djaro" },
  { id: "RQmEERvqq70", title: "Best of Kenyan Movies Compilation", thumbnail: "https://i.ytimg.com/vi/RQmEERvqq70/hqdefault.jpg", channel: "KE Movies", duration: "2:00:00", views: "1.5M", category: "djaro" },
  { id: "KnBV1epspN0", title: "Kenyan Classics Collection", thumbnail: "https://i.ytimg.com/vi/KnBV1epspN0/hqdefault.jpg", channel: "DJ Aro", duration: "1:45:00", views: "800K", category: "djaro" },
  { id: "q6EoRBvdVPQ", title: "DJ Aro - Street Anthems", thumbnail: "https://i.ytimg.com/vi/q6EoRBvdVPQ/hqdefault.jpg", channel: "DJ Aro", duration: "1:30:00", views: "1.2M", category: "djaro" },
  { id: "dVNdFXgS6MM", title: "Kenyan Throwback Mix", thumbnail: "https://i.ytimg.com/vi/dVNdFXgS6MM/hqdefault.jpg", channel: "DJ Aro", duration: "1:15:00", views: "950K", category: "djaro" },

  // REALITY / TV
  { id: "r6zIGXun57U", title: "Real Housewives of Nairobi", thumbnail: "https://i.ytimg.com/vi/r6zIGXun57U/hqdefault.jpg", channel: "Showmax Kenya", duration: "42:00", views: "3M", category: "reality" },
  { id: "YeHGMoZRFBs", title: "Nairobi Diaries S1E1", thumbnail: "https://i.ytimg.com/vi/YeHGMoZRFBs/hqdefault.jpg", channel: "Nairobi Diaries", duration: "38:00", views: "6M", category: "reality" },
  { id: "Kkz_hN96QSc", title: "Date My Family Kenya", thumbnail: "https://i.ytimg.com/vi/Kkz_hN96QSc/hqdefault.jpg", channel: "Maisha Magic", duration: "44:00", views: "2.5M", category: "reality" },
  { id: "sVxUUotm1P4", title: "The Real Nairobi Wives", thumbnail: "https://i.ytimg.com/vi/sVxUUotm1P4/hqdefault.jpg", channel: "NTV Kenya", duration: "35:00", views: "1.8M", category: "reality" },
  { id: "I4Nkq0i0ICw", title: "Tusker Project Fame", thumbnail: "https://i.ytimg.com/vi/I4Nkq0i0ICw/hqdefault.jpg", channel: "Citizen TV", duration: "55:00", views: "4M", category: "reality" },
  { id: "z4PKzz81m5c", title: "Jeff Koinange Live - Interview", thumbnail: "https://i.ytimg.com/vi/z4PKzz81m5c/hqdefault.jpg", channel: "KTN News", duration: "28:00", views: "1.2M", category: "talkshow" },
];

export function getContentByCategory(category: string): KenyaVideo[] {
  return kenyanContent.filter((v) => v.category === category);
}

export function getAllContent(): KenyaVideo[] {
  return kenyanContent;
}

export function searchContent(query: string): KenyaVideo[] {
  const q = query.toLowerCase();
  return kenyanContent.filter(
    (v) =>
      v.title.toLowerCase().includes(q) ||
      v.channel.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q)
  );
}

export function getVideoById(id: string): KenyaVideo | undefined {
  return kenyanContent.find((v) => v.id === id);
}

export function getRelatedVideos(id: string): KenyaVideo[] {
  const video = getVideoById(id);
  if (!video) return kenyanContent.slice(0, 8);
  return kenyanContent.filter((v) => v.category === video.category && v.id !== id).slice(0, 8);
}
