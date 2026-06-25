export interface Movie {
  id: string;
  title: string;
  year: number;
  poster: string;
  rating?: number;
  genre?: string;
  overview?: string;
}

export const movies: Movie[] = [
  { id: "tt0111161", title: "The Shawshank Redemption", year: 1994, poster: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg", rating: 9.3, genre: "Drama", overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency." },
  { id: "tt0068646", title: "The Godfather", year: 1972, poster: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", rating: 9.2, genre: "Crime", overview: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant youngest son." },
  { id: "tt0468569", title: "The Dark Knight", year: 2008, poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", rating: 9.0, genre: "Action", overview: "When the menace known as the Joker wreaks havoc on Gotham, Batman must accept one of the greatest tests." },
  { id: "tt0109830", title: "Forrest Gump", year: 1994, poster: "https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg", rating: 8.8, genre: "Drama", overview: "The presidencies of Kennedy and Johnson, the Vietnam War, Watergate, and other events unfold from the perspective of an Alabama man." },
  { id: "tt0133093", title: "The Matrix", year: 1999, poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", rating: 8.7, genre: "Sci-Fi", overview: "A computer hacker learns about the true nature of his reality and his role in the war against its controllers." },
  { id: "tt0110912", title: "Pulp Fiction", year: 1994, poster: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", rating: 8.9, genre: "Crime", overview: "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption." },
  { id: "tt0137523", title: "Fight Club", year: 1999, poster: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QI4S2t0POoJ.jpg", rating: 8.8, genre: "Drama", overview: "An insomniac office worker and a soap salesman build a global organization to help vent male aggression." },
  { id: "tt0120737", title: "The Lord of the Rings: The Fellowship of the Ring", year: 2001, poster: "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg", rating: 8.8, genre: "Fantasy", overview: "A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring." },
  { id: "tt0167260", title: "The Lord of the Rings: The Return of the King", year: 2003, poster: "https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg", rating: 9.0, genre: "Fantasy", overview: "Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam." },
  { id: "tt0080684", title: "Star Wars: The Empire Strikes Back", year: 1980, poster: "https://image.tmdb.org/t/p/w500/nNAeTmF4CtdSgMDplXTDPOpYzsX.jpg", rating: 8.7, genre: "Sci-Fi", overview: "After the Rebels are brutally overpowered by the Empire, Luke Skywalker begins Jedi training with Yoda." },
  { id: "tt0114369", title: "Se7en", year: 1995, poster: "https://image.tmdb.org/t/p/w500/6yoghtyTpznpBik8EngEmJskVUO.jpg", rating: 8.6, genre: "Thriller", overview: "Two detectives hunt a serial killer who uses the seven deadly sins as his motives." },
  { id: "tt0816692", title: "Interstellar", year: 2014, poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", rating: 8.7, genre: "Sci-Fi", overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival." },
  { id: "tt0245429", title: "Spirited Away", year: 2001, poster: "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg", rating: 8.6, genre: "Animation", overview: "During her family's move, a young girl enters a world ruled by gods, witches, and spirits." },
  { id: "tt0482571", title: "The Prestige", year: 2006, poster: "https://image.tmdb.org/t/p/w500/5MXyQfz8xUP3dIFPTubhTsbFY6N.jpg", rating: 8.5, genre: "Thriller", overview: "Two stage magicians engage in competitive one-upmanship in an attempt to create the ultimate illusion." },
  { id: "tt0114814", title: "The Usual Suspects", year: 1995, poster: "https://image.tmdb.org/t/p/w500/bUPmtQzrRhzqYySeiMpv7GurAfm.jpg", rating: 8.5, genre: "Crime", overview: "A sole survivor tells the twisting events leading up to a horrific gun battle on a boat." },
  { id: "tt0076759", title: "Star Wars: A New Hope", year: 1977, poster: "https://image.tmdb.org/t/p/w500/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg", rating: 8.6, genre: "Sci-Fi", overview: "Luke Skywalker joins forces with a Jedi Knight to save the galaxy from the Empire's world-destroying battle station." },
  { id: "tt0253474", title: "The Pianist", year: 2002, poster: "https://image.tmdb.org/t/p/w500/2hFvxCEF1XQCzGYlJeCao7SAh9c.jpg", rating: 8.5, genre: "Drama", overview: "A Polish Jewish musician struggles to survive the destruction of the Warsaw ghetto during World War II." },
  { id: "tt0407887", title: "The Departed", year: 2006, poster: "https://image.tmdb.org/t/p/w500/nT97ifVT2J1yMQmeq20Dqv60Su.jpg", rating: 8.5, genre: "Crime", overview: "An undercover cop and a mole in the police attempt to identify each other while infiltrating an Irish gang in Boston." },
  { id: "tt0993846", title: "The Wolf of Wall Street", year: 2013, poster: "https://image.tmdb.org/t/p/w500/34m2tygAYBGqA9MXKhRDtzYd4MR.jpg", rating: 8.2, genre: "Drama", overview: "Based on the true story of Jordan Belfort, from his rise to a wealthy stock-broker to his fall involving crime and corruption." },
  { id: "tt1375666", title: "Inception", year: 2010, poster: "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg", rating: 8.8, genre: "Sci-Fi", overview: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea." },
];

export const trendingMovies = movies.slice(0, 8);
export const topRated = [...movies].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8);
export const actionMovies = movies.filter(m => m.genre === "Action" || m.genre === "Sci-Fi" || m.genre === "Thriller");
export const dramaMovies = movies.filter(m => m.genre === "Drama" || m.genre === "Crime");
export const fantasyMovies = movies.filter(m => m.genre === "Fantasy" || m.genre === "Animation");
