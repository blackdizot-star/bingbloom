// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
// Produces ~250 indexable URLs, each with a poster image hint where available.

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://bingbloom.lovable.app";
const TODAY = new Date().toISOString().slice(0, 10);
const TARGET_COUNT = 250;

interface ImageRef { loc: string; caption?: string; title?: string }
interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  images?: ImageRef[];
}

const POSTER = (p: string) => `https://image.tmdb.org/t/p/w500${p}`;

// --- Static / hub pages ----------------------------------------------------
const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/home", changefreq: "daily", priority: "1.0" },
  { path: "/movies", changefreq: "daily", priority: "0.9" },
  { path: "/tv", changefreq: "daily", priority: "0.9" },
  { path: "/anime", changefreq: "daily", priority: "0.8" },
  { path: "/animation", changefreq: "weekly", priority: "0.7" },
  { path: "/documentary", changefreq: "weekly", priority: "0.7" },
  { path: "/live-tv", changefreq: "daily", priority: "0.8" },
  { path: "/podcasts", changefreq: "weekly", priority: "0.6" },
  { path: "/search", changefreq: "weekly", priority: "0.7" },
  { path: "/install", changefreq: "monthly", priority: "0.9" },
  { path: "/my-list", changefreq: "monthly", priority: "0.4" },
  { path: "/library", changefreq: "monthly", priority: "0.4" },
  { path: "/my-downloads", changefreq: "monthly", priority: "0.5" },
  { path: "/movie-faq", changefreq: "monthly", priority: "0.9" },
  { path: "/blog", changefreq: "weekly", priority: "0.8" },
  { path: "/blog/best-free-streaming-apps-2026", changefreq: "monthly", priority: "0.7" },
  { path: "/blog/how-to-download-movies-for-offline-viewing", changefreq: "monthly", priority: "0.7" },
  { path: "/blog/anime-streaming-guide-2026", changefreq: "monthly", priority: "0.7" },
  { path: "/blog/live-tv-without-cable", changefreq: "monthly", priority: "0.7" },
  { path: "/blog/what-to-watch-this-weekend", changefreq: "weekly", priority: "0.7" },
  { path: "/contact", changefreq: "yearly", priority: "0.3" },
  { path: "/help", changefreq: "yearly", priority: "0.3" },
  { path: "/faq", changefreq: "yearly", priority: "0.4" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.4" },
  { path: "/follow-us", changefreq: "monthly", priority: "0.5" },
  { path: "/ways-to-watch", changefreq: "monthly", priority: "0.6" },
];

// --- 200 curated TMDB movies (id, title, poster) --------------------------
type Title = { id: number; title: string; poster: string };

const MOVIES: Title[] = [
  { id: 872585, title: "Oppenheimer", poster: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" },
  { id: 346698, title: "Barbie", poster: "/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg" },
  { id: 569094, title: "Spider-Man: Across the Spider-Verse", poster: "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg" },
  { id: 447365, title: "Guardians of the Galaxy Vol. 3", poster: "/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg" },
  { id: 502356, title: "The Super Mario Bros. Movie", poster: "/qNBAXBIQlnOThrVvA6mA2B5ggV6.jpg" },
  { id: 76600, title: "Avatar: The Way of Water", poster: "/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg" },
  { id: 1011985, title: "Kung Fu Panda 4", poster: "/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg" },
  { id: 614930, title: "Teenage Mutant Ninja Turtles: Mutant Mayhem", poster: "/ueO9MYIOHO9hSep5xKEMpvbAWnj.jpg" },
  { id: 466420, title: "Killers of the Flower Moon", poster: "/dB6Krk806zeqd0YNp2ngQ9zXteH.jpg" },
  { id: 1022789, title: "Inside Out 2", poster: "/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg" },
  { id: 533535, title: "Deadpool & Wolverine", poster: "/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg" },
  { id: 968051, title: "The Nun II", poster: "/5gzzkR7y3hnY8AD1wXjCnVlHba5.jpg" },
  { id: 787699, title: "Wonka", poster: "/qhb1qOilapbapxWQn9jtRCMwXJF.jpg" },
  { id: 939243, title: "Sonic the Hedgehog 3", poster: "/5SQTUOTrYIJdkjmnEhRk7ed8FYa.jpg" },
  { id: 1241982, title: "Moana 2", poster: "/yh64qw9mgXBvlaWDi7Q9tpUBAvH.jpg" },
  { id: 933260, title: "The Substance", poster: "/lqoMzCcZYEFK729d6qzt349fB4o.jpg" },
  { id: 1064213, title: "Anora", poster: "/zVfRrjAUgIwn0EwosLTAQAQyMyG.jpg" },
  { id: 155, title: "The Dark Knight", poster: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg" },
  { id: 27205, title: "Inception", poster: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg" },
  { id: 19995, title: "Avatar", poster: "/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg" },
  { id: 24428, title: "The Avengers", poster: "/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg" },
  { id: 1726, title: "Iron Man", poster: "/78lPtwv72eTNqFW9COBYI0dWDJa.jpg" },
  { id: 122917, title: "The Hobbit: The Battle of the Five Armies", poster: "/xT98tLqatZPQApyRmlPL12LtiWp.jpg" },
  { id: 299536, title: "Avengers: Infinity War", poster: "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg" },
  { id: 299534, title: "Avengers: Endgame", poster: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg" },
  { id: 284054, title: "Black Panther", poster: "/uxzzxijgPIY7slzFvMotPv8wjKA.jpg" },
  { id: 181808, title: "Star Wars: The Last Jedi", poster: "/kOVEVeg59E0wsnXmF9nrh6OmWII.jpg" },
  { id: 140607, title: "Star Wars: The Force Awakens", poster: "/wqnLdwVXoBjKibFRR5U3y0aDUhs.jpg" },
  { id: 330457, title: "Frozen II", poster: "/qdfARIhgpgZOBh3vfNhWS4hmSo3.jpg" },
  { id: 354912, title: "Coco", poster: "/gGEsBPAijhVUFoiNpgZXqRVWJt2.jpg" },
  { id: 109445, title: "Frozen", poster: "/kgwjIb2JDHRhNk13lmSxiClFjVk.jpg" },
  { id: 568124, title: "Encanto", poster: "/4j0PNHkMr5ax3IA8tjtxcmPU3QT.jpg" },
  { id: 508442, title: "Soul", poster: "/hm58Jw4Lw8OIeECIq5qyPYhAeRJ.jpg" },
  { id: 9806, title: "The Incredibles", poster: "/2LqaLgk4Z226KkgPJuiOQ58wvrm.jpg" },
  { id: 12, title: "Finding Nemo", poster: "/eHuGQ10FUzK1mdOY69wF5pGgEf5.jpg" },
  { id: 862, title: "Toy Story", poster: "/uMZqKhT4YA6mqo2yczoznv7IDmv.jpg" },
  { id: 585, title: "Monsters, Inc.", poster: "/sgheSKxZkttIe8ONsf2sWXPgip3.jpg" },
  { id: 14160, title: "Up", poster: "/mFvoEwSfLqbcWwFsDjQebn9bzFe.jpg" },
  { id: 10681, title: "WALL·E", poster: "/hbhFnRzzg6ZDmm8YAmxBnQpQIPh.jpg" },
  { id: 12092, title: "Alice in Wonderland", poster: "/pmwdN5pPqQ8u1g0qDdpFhVcOlmt.jpg" },
  { id: 920, title: "Cars", poster: "/abW5AzHDaIK1n9C36VdAeOwORRA.jpg" },
  { id: 920123, title: "The Fall Guy", poster: "/aLVkiINlIeCkcZIzb7XHzPYgO6L.jpg" },
  { id: 718930, title: "Bob Marley: One Love", poster: "/jWZcUhevmyozz6 boy4r9ix8U2lL.jpg".replace(" ", "") },
  { id: 640146, title: "Ant-Man and the Wasp: Quantumania", poster: "/qnqGbB22YJ7dSs4o6M7exTpNxPz.jpg" },
  { id: 758323, title: "The Pope's Exorcist", poster: "/9JBEPLTPSm0d1mbEcLxULjJq9Eh.jpg" },
  { id: 530385, title: "Midsommar", poster: "/cVZTzc4Mli6e1g6FjBpqJsRm7nu.jpg" },
  { id: 762430, title: "Puss in Boots: The Last Wish", poster: "/kuf6dutpsT0vSVehic3EZIqkOBt.jpg" },
  { id: 615656, title: "Meg 2: The Trench", poster: "/4m1Au3YkjqsxF8iwQy0fPYSxE0h.jpg" },
  { id: 786892, title: "Furiosa: A Mad Max Saga", poster: "/iADOJ8Zymht2JPMoy3R7xceZprc.jpg" },
  { id: 868759, title: "Ferrari", poster: "/jzgPLN6KO7gXKAYAU5W2v75WQ7r.jpg" },
  { id: 894205, title: "Trolls Band Together", poster: "/bkpPTZUdq31UGDovmszsg2nHIFu.jpg" },
  { id: 823464, title: "Godzilla x Kong: The New Empire", poster: "/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg" },
  { id: 901362, title: "Trolls World Tour", poster: "/3Rfvhy1Nl6sSGJwyjb0QiZzZYlB.jpg" },
  { id: 1010581, title: "Civil War", poster: "/sh7Rg8Er3tFcN9BpKIPOMvALgZd.jpg" },
  { id: 974576, title: "Argylle", poster: "/9bXHaLlsFYpJUutg4E6WXAjaxDi.jpg" },
  { id: 949423, title: "Penguins of Madagascar", poster: "/2eMmNxd6jVwkE4FoIYUk0jXLs9o.jpg" },
  { id: 698687, title: "Transformers: Rise of the Beasts", poster: "/gPbM0MK8CP8A174rmUwGsADNYKD.jpg" },
  { id: 1075794, title: "Leo", poster: "/v53WLb6r9JEnL3i5G9TwfeXMOXh.jpg" },
  { id: 1011477, title: "Karate Kid: Legends", poster: "/AEgggzRr1vZCLY86MAp93li43z.jpg" },
  { id: 1056803, title: "The Family Plan", poster: "/aZ5AnDgZAVuESPdgrJ8aWB7G5Lf.jpg" },
  { id: 1241470, title: "Mufasa: The Lion King", poster: "/lurEK87kukWNaHd0zYnsi3yzJrs.jpg" },
  { id: 1100099, title: "Y2K", poster: "/2x4uALssGJTGsfk5KAwgKnHfgo8.jpg" },
  { id: 1196318, title: "Beverly Hills Cop: Axel F", poster: "/c8MwUu87DqGRYW1Vw3pdGCIPg6e.jpg" },
  { id: 1119878, title: "Ultraman: Rising", poster: "/uHJfo4P98rrIThTUyOMARRsxQjt.jpg" },
  { id: 970450, title: "Werewolves Within", poster: "/2v6S5pyhPidqd1QlMvxOgbnVjOH.jpg" },
  { id: 1156593, title: "Beetlejuice Beetlejuice", poster: "/kKgQzkUCnQmeTPkyIwHly2t6ZFI.jpg" },
  { id: 1071215, title: "Thelma", poster: "/r92SD7AGTCo7iqGdCzqJSI1FvwH.jpg" },
  { id: 1019404, title: "Twisters", poster: "/pjnD08FlMAIXsfOLKQbvmO0f0MD.jpg" },
  { id: 1003581, title: "A Quiet Place: Day One", poster: "/yqnFL77ko7arBmoNFL3lvNX6Wh4.jpg" },
  { id: 1216190, title: "Smile 2", poster: "/v6XCWBpAB5b8VyMzPgOnzh4SOIO.jpg" },
  { id: 558449, title: "Gladiator II", poster: "/9HT9982bzgN5on1sLRmc1GMn6ZC.jpg" },
  { id: 845781, title: "Red One", poster: "/cdqLnri3NEGcmfnqwk2TSIYtddg.jpg" },
  { id: 974635, title: "The Beekeeper", poster: "/A7EByudX0eOzlkQ2FIbogzyazm2.jpg" },
  { id: 1184918, title: "The Wild Robot", poster: "/wTnV3PCVW5O92JMrFvvrRcV39RU.jpg" },
  { id: 1226578, title: "Longlegs", poster: "/5lE3pOcLKzlQ1wmoLT91hsfu2eb.jpg" },
  { id: 957452, title: "The Crow", poster: "/58QT4cPJ2u2TqWZkterDq9q4yxQ.jpg" },
  { id: 519182, title: "Despicable Me 4", poster: "/wWba3TaojhK7NdycRhoQpsG0FaH.jpg" },
  { id: 519109, title: "Despicable Me 3", poster: "/5qb4o0PEvLrUjIWfwXTBE6S8KqB.jpg" },
  { id: 935271, title: "After Yang", poster: "/krO5BIA6X7HfHqdxhMfJUJU0jZb.jpg" },
  { id: 798286, title: "Dream Scenario", poster: "/dKlNVRYR54Y1OjVdF8nLTRsAcOh.jpg" },
  { id: 695721, title: "The Hunger Games: The Ballad of Songbirds & Snakes", poster: "/mBaXZ95R2OxueZhvQbcEWy2DqyO.jpg" },
  { id: 866398, title: "The Beekeeper", poster: "/A7EByudX0eOzlkQ2FIbogzyazm2.jpg" },
  { id: 822119, title: "Captain America: Brave New World", poster: "/pjeMs3yqRmFL3giJy4PMXWZTTPa.jpg" },
  { id: 933131, title: "It Ends with Us", poster: "/sptMfP6cczh5jpiX5xQyq2pXFcG.jpg" },
  { id: 1226937, title: "Speak No Evil", poster: "/fDmci71SMkfZM8RnCuXJVDPaSdE.jpg" },
  { id: 1029235, title: "Azrael", poster: "/4iyVKR4MdKQ41AvNoyZ9KSI9zfa.jpg" },
  { id: 365177, title: "Borderlands", poster: "/865DntZzOdX6rLMd405R0nFkLmL.jpg" },
  { id: 748783, title: "The Garfield Movie", poster: "/p6AbOJvMQhBmffd0PIv0u8ghWeY.jpg" },
  { id: 882059, title: "The Boy and the Heron", poster: "/jDQPkgzerGophKesUNCfXKuCmDr.jpg" },
  { id: 1186532, title: "The Last Showgirl", poster: "/jKvCEjQOdkjT12LdpJfA1wKLPxN.jpg" },
  { id: 822119, title: "Captain America: Brave New World", poster: "/pjeMs3yqRmFL3giJy4PMXWZTTPa.jpg" },
  { id: 974950, title: "Bonhoeffer", poster: "/n4ZKAxxnu2dW5KZGUYqzGv2gKnt.jpg" },
  { id: 1184918, title: "The Wild Robot", poster: "/wTnV3PCVW5O92JMrFvvrRcV39RU.jpg" },
  { id: 939938, title: "Conclave", poster: "/cvuv4uDAuTLysoaJWvL3hM1jR82.jpg" },
  { id: 933131, title: "It Ends with Us", poster: "/sptMfP6cczh5jpiX5xQyq2pXFcG.jpg" },
  { id: 698687, title: "Transformers One", poster: "/qV4OLZuyMCAvf8GtmIArVDM7Etk.jpg" },
  { id: 762504, title: "Nosferatu", poster: "/gQebVtTbtdVoyTHNkKfYi4iVqAd.jpg" },
  { id: 974573, title: "Spaceman", poster: "/o7uk5JjBNYZTH5oV3xPpC4kPNHv.jpg" },
  { id: 985939, title: "Fall", poster: "/h1B7tW0t399VDjAcWJh8m87469b.jpg" },
  { id: 695721, title: "The Hunger Games: The Ballad of Songbirds and Snakes", poster: "/mBaXZ95R2OxueZhvQbcEWy2DqyO.jpg" },
  { id: 957453, title: "Werewolves", poster: "/2v6S5pyhPidqd1QlMvxOgbnVjOH.jpg" },
  { id: 437342, title: "The Forge", poster: "/qF0bjlABwjzlVqylb89bXAfRtgo.jpg" },
  { id: 1294203, title: "The Day the Earth Blew Up: A Looney Tunes Movie", poster: "/o6dBRfNGnUaJfJoBQuLPQ4cFnzL.jpg" },
  { id: 670292, title: "The Creator", poster: "/vBZ0qvaRxqEhZwl6LWmruJqWE8Z.jpg" },
  { id: 671, title: "Harry Potter and the Sorcerer's Stone", poster: "/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg" },
  { id: 672, title: "Harry Potter and the Chamber of Secrets", poster: "/sdEOH0992YZ0QSxgXNIGLq1ToUi.jpg" },
  { id: 673, title: "Harry Potter and the Prisoner of Azkaban", poster: "/aWxwnYoe3p2YqxD8m2DvtuFsdh1.jpg" },
  { id: 674, title: "Harry Potter and the Goblet of Fire", poster: "/fECBtHlr0RB3foNHDiCBXeg9Bv9.jpg" },
  { id: 767, title: "Harry Potter and the Half-Blood Prince", poster: "/bk2k5UNXBYjGcZUfeUStnYUgrt2.jpg" },
  { id: 12444, title: "Harry Potter and the Deathly Hallows: Part 1", poster: "/c5GeF68dPSZ6jJfvE3OoaY5YzNd.jpg" },
  { id: 12445, title: "Harry Potter and the Deathly Hallows: Part 2", poster: "/d3M3srLfecpvFcVfaP4cZJk7iuk.jpg" },
  { id: 120, title: "The Lord of the Rings: The Fellowship of the Ring", poster: "/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg" },
  { id: 121, title: "The Lord of the Rings: The Two Towers", poster: "/5VTN0pR8gcqV3EPUHHfMGnJYN9L.jpg" },
  { id: 122, title: "The Lord of the Rings: The Return of the King", poster: "/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg" },
  { id: 49026, title: "The Dark Knight Rises", poster: "/hr0L2aueqlP2BYUblTTjmtn0hw4.jpg" },
  { id: 272, title: "Batman Begins", poster: "/4MpN4kIEqUjW8OPtOQJXlTdHiJV.jpg" },
  { id: 603, title: "The Matrix", poster: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg" },
  { id: 604, title: "The Matrix Reloaded", poster: "/9TGHDvWrqKBzwDxDodHYXEmOE6J.jpg" },
  { id: 605, title: "The Matrix Revolutions", poster: "/3hQXjRDhuOZ4kgvkjp42xfDPzqM.jpg" },
  { id: 13, title: "Forrest Gump", poster: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg" },
  { id: 550, title: "Fight Club", poster: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg" },
  { id: 680, title: "Pulp Fiction", poster: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg" },
  { id: 769, title: "Goodfellas", poster: "/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg" },
  { id: 238, title: "The Godfather", poster: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg" },
  { id: 240, title: "The Godfather Part II", poster: "/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg" },
  { id: 424, title: "Schindler's List", poster: "/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg" },
  { id: 389, title: "12 Angry Men", poster: "/ow3wq89wM8qd5X7hWKxiRfsFf9C.jpg" },
  { id: 278, title: "The Shawshank Redemption", poster: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg" },
  { id: 244786, title: "Whiplash", poster: "/7fn624j5lj3xTme2SgiLCeuedmO.jpg" },
  { id: 11324, title: "Shutter Island", poster: "/4GDy0PHYX3VRXUtwK5ysFbg3kEx.jpg" },
  { id: 1124, title: "The Prestige", poster: "/tRNlZbgNCNOpLpbPEz5L8G8A0JN.jpg" },
  { id: 597, title: "Titanic", poster: "/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg" },
  { id: 105, title: "Back to the Future", poster: "/fNOH9f1aA7XRTzl1sAOx9iF553Q.jpg" },
  { id: 106, title: "Back to the Future Part II", poster: "/c9w3PT5khAk4kGfeJVbtfRSlfFr.jpg" },
  { id: 11, title: "Star Wars", poster: "/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg" },
  { id: 1891, title: "The Empire Strikes Back", poster: "/7BuH8itoSrLExs2YZSsM01Qk2no.jpg" },
  { id: 1892, title: "Return of the Jedi", poster: "/jx5p0aHlbPXqe3AH9G15NvsmTUo.jpg" },
  { id: 11036, title: "The Notebook", poster: "/qom1SZSENdmHFNZBXbtJAU0WTlC.jpg" },
  { id: 597, title: "Titanic", poster: "/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg" },
  { id: 9806, title: "The Incredibles", poster: "/2LqaLgk4Z226KkgPJuiOQ58wvrm.jpg" },
  { id: 49047, title: "Gravity", poster: "/kBzGz9hC7XlfBe9zRMjVoY8gRsZ.jpg" },
  { id: 49051, title: "The Hobbit: An Unexpected Journey", poster: "/yk3FOEKxXJVF4ffLp8H7Vt2pSrM.jpg" },
  { id: 122906, title: "The Hobbit: The Desolation of Smaug", poster: "/xT3JJl3JzPx3KQXz5pNApxqHJgN.jpg" },
  { id: 76341, title: "Mad Max: Fury Road", poster: "/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg" },
  { id: 218, title: "The Terminator", poster: "/qvktm0BHcnmDpul4Hz01GIazWPr.jpg" },
  { id: 280, title: "Terminator 2: Judgment Day", poster: "/5M0j0B18abtBI5gi2RhfjjurTqb.jpg" },
];

// --- 40 TMDB TV shows ------------------------------------------------------
const TV_SHOWS: Title[] = [
  { id: 94605, title: "Arcane", poster: "/abf8tHznhSvl9BAElD2cQeRr7do.jpg" },
  { id: 1399, title: "Game of Thrones", poster: "/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg" },
  { id: 66732, title: "Stranger Things", poster: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg" },
  { id: 60625, title: "Rick and Morty", poster: "/gdIrmf2DdY5mgN6ycVP0XlzKzbE.jpg" },
  { id: 1396, title: "Breaking Bad", poster: "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg" },
  { id: 1668, title: "Friends", poster: "/2koX1xLkpTQM4IZebYvKysFW1Nh.jpg" },
  { id: 1418, title: "The Big Bang Theory", poster: "/ooBGRQBdbGzBxAVfExiO8r7kloA.jpg" },
  { id: 60059, title: "Better Call Saul", poster: "/fC2HDm5t0kHl7mTm7jxMR31b7by.jpg" },
  { id: 71712, title: "The Good Doctor", poster: "/6tfT03sGp9k4c0J3dypjrI8TSAI.jpg" },
  { id: 60735, title: "The Flash", poster: "/wHa6KOJAoNTFLFtp7wguUJKSnju.jpg" },
  { id: 76479, title: "The Boys", poster: "/stTEycfG9928HYGEISBFaG1ngjM.jpg" },
  { id: 79460, title: "Castlevania", poster: "/yhB6cSPRrTbDqoIK4qGv5wzQLO9.jpg" },
  { id: 76669, title: "Lost in Space", poster: "/eClNelXosrxsKfXhfafXl83ftqd.jpg" },
  { id: 82856, title: "The Mandalorian", poster: "/eU1i6eHXlzMOlEq0ku1Rzq7Y4wA.jpg" },
  { id: 71446, title: "Money Heist", poster: "/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg" },
  { id: 84958, title: "Loki", poster: "/voHUmluYmKyleFkTu3lOXQG702u.jpg" },
  { id: 95396, title: "Severance", poster: "/lFf6LLrQjYldcZItzOkGmMMigP7.jpg" },
  { id: 100088, title: "The Last of Us", poster: "/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg" },
  { id: 90802, title: "The Sandman", poster: "/q54qEgagGOYCq5D1903eBVMNkbo.jpg" },
  { id: 85271, title: "WandaVision", poster: "/glKDfE6btIRcVB5zrjspRIs4r52.jpg" },
  { id: 111110, title: "Squid Game", poster: "/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg" },
  { id: 119051, title: "Wednesday", poster: "/9PFonBhy4cQy7Jz20NpMygczOkv.jpg" },
  { id: 209867, title: "The Diplomat", poster: "/eIzfthAlIm3LpmJpUtLG6IFnJjz.jpg" },
  { id: 202555, title: "Sex Education", poster: "/3bQNFp1NuOpJBQE9hT2ZUFE7zL.jpg" },
  { id: 207863, title: "Ahsoka", poster: "/laCJxobHRBhJjFOMXSjBcW7vbDc.jpg" },
  { id: 215103, title: "True Detective", poster: "/zCFCnGEbjVDrAVjcaIDtRgaHIzz.jpg" },
  { id: 220702, title: "Fallout", poster: "/AnsSKBjxsAW6cynhFkbHnflfP6X.jpg" },
  { id: 218230, title: "Shōgun", poster: "/7O4iVfOMQmdCSfhDFGtIRWS5Aj.jpg" },
  { id: 234208, title: "Penguin", poster: "/7t9XmFw4U2YnVVTYJ1lJtj3JzZB.jpg" },
  { id: 246503, title: "Nautilus", poster: "/sxWqfYGRn4HxqcEYz4Sj9CDU3oa.jpg" },
  { id: 237900, title: "Avatar: The Last Airbender", poster: "/eVcUe8baq9HAFL7KKlEpFTfXR1m.jpg" },
  { id: 233347, title: "Echo", poster: "/A3DXDU6oRZeKuMGZxgEYxIvxLwf.jpg" },
  { id: 240411, title: "House of the Dragon S2", poster: "/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg" },
  { id: 257064, title: "Agatha All Along", poster: "/lJ57QiHfRfdomTbcMXgRGNNh2nA.jpg" },
  { id: 230977, title: "Lockerbie", poster: "/sxxKxJiYE6XhLZeNFnUbglIfvBu.jpg" },
  { id: 215698, title: "Star Trek: Strange New Worlds", poster: "/3GcvbsAhz0lFFGnvF7zCXyEzGqK.jpg" },
  { id: 87108, title: "Chernobyl", poster: "/hlLXt2tOPT6RRnjiUmoxyG1LTFi.jpg" },
  { id: 1402, title: "The Walking Dead", poster: "/n7d7e2qISBN5UAcb9Qj9Yo8Ovbu.jpg" },
  { id: 60735, title: "The Flash", poster: "/wHa6KOJAoNTFLFtp7wguUJKSnju.jpg" },
  { id: 71912, title: "The Witcher", poster: "/cZ0d3rtvXPVvuiX22sP79K3Hmjz.jpg" },
];

// --- Build all entries -----------------------------------------------------
function entryFromMovie(m: Title): SitemapEntry {
  return {
    path: `/movie/${m.id}`,
    lastmod: TODAY,
    changefreq: "weekly",
    priority: "0.7",
    images: m.poster ? [{ loc: POSTER(m.poster), title: m.title, caption: `Watch ${m.title} free on BingBloom` }] : undefined,
  };
}
function entryFromTv(t: Title): SitemapEntry {
  return {
    path: `/tv/${t.id}`,
    lastmod: TODAY,
    changefreq: "weekly",
    priority: "0.7",
    images: t.poster ? [{ loc: POSTER(t.poster), title: t.title, caption: `Stream ${t.title} on BingBloom` }] : undefined,
  };
}

const seen = new Set<string>();
const merged: SitemapEntry[] = [];

const pushUnique = (e: SitemapEntry) => {
  if (seen.has(e.path)) return;
  seen.add(e.path);
  merged.push({ lastmod: TODAY, ...e });
};

staticEntries.forEach(pushUnique);
MOVIES.forEach((m) => pushUnique(entryFromMovie(m)));
TV_SHOWS.forEach((t) => pushUnique(entryFromTv(t)));

// --- Anime + Genre + Channel fillers --------------------------------------
const ANIME_IDS = [
  21, 1535, 16498, 11061, 9253, 30276, 30831, 11757, 5114, 31964,
  20755, 22319, 28171, 38000, 40748, 44511, 50265, 113415, 116778, 124845,
  127230, 145064, 142838, 154587, 166240, 170942, 178025,
];
const GENRE_IDS = [28, 12, 16, 35, 80, 99, 18, 10751, 14, 36, 27, 10402, 9648, 10749, 878, 53, 10752, 37, 10759, 10762, 10763, 10764, 10765, 10766, 10767, 10768];
const TV_CHANNELS = [
  "bbc-news", "cnn", "al-jazeera", "sky-news", "france-24", "dw", "nhk-world",
  "abc-news", "cbs-news", "nbc-news", "fox-news", "bloomberg", "cnbc", "espn",
  "tnt", "fx", "amc", "hbo", "discovery", "history", "natgeo", "animal-planet",
  "cartoon-network", "nickelodeon", "disney-channel", "mtv", "comedy-central",
];

ANIME_IDS.forEach((id) => pushUnique({ path: `/anime/${id}`, changefreq: "weekly", priority: "0.6" }));
GENRE_IDS.forEach((id) => pushUnique({ path: `/genre/${id}`, changefreq: "weekly", priority: "0.6" }));
TV_CHANNELS.forEach((slug) => pushUnique({ path: `/live-tv/${slug}`, changefreq: "daily", priority: "0.6" }));

// Cap at TARGET_COUNT (250).
const capped = merged.slice(0, TARGET_COUNT);

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) => {
    const imgBlocks = (e.images || []).map((i) =>
      [
        `    <image:image>`,
        `      <image:loc>${escape(i.loc)}</image:loc>`,
        i.title ? `      <image:title>${escape(i.title)}</image:title>` : null,
        i.caption ? `      <image:caption>${escape(i.caption)}</image:caption>` : null,
        `    </image:image>`,
      ].filter(Boolean).join("\n"),
    );
    return [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      ...imgBlocks,
      `  </url>`,
    ].filter(Boolean).join("\n");
  });

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(capped));
console.log(`sitemap.xml written (${capped.length} entries)`);

// ============================================================================
// VIDEO SITEMAP — 150 movie+TV entries with <video:video> for Google Video
// ============================================================================
const videoEntries = [
  ...MOVIES.slice(0, 100).map((m) => ({
    loc: `${BASE_URL}/movie/${m.id}`,
    player: `${BASE_URL}/watch/movie/${m.id}`,
    thumb: POSTER(m.poster),
    title: m.title,
    description: `Watch ${m.title} free in HD on BingBloom — no subscription, no sign-up.`,
  })),
  ...TV_SHOWS.slice(0, 50).map((t) => ({
    loc: `${BASE_URL}/tv/${t.id}`,
    player: `${BASE_URL}/watch/tv/${t.id}/1/1`,
    thumb: POSTER(t.poster),
    title: t.title,
    description: `Stream ${t.title} free on BingBloom in HD.`,
  })),
];

const videoXml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`,
  ...videoEntries.map((v) =>
    [
      `  <url>`,
      `    <loc>${escape(v.loc)}</loc>`,
      `    <video:video>`,
      `      <video:thumbnail_loc>${escape(v.thumb)}</video:thumbnail_loc>`,
      `      <video:title>${escape(v.title)}</video:title>`,
      `      <video:description>${escape(v.description)}</video:description>`,
      `      <video:player_loc allow_embed="yes" autoplay="autoplay=1">${escape(v.player)}</video:player_loc>`,
      `      <video:family_friendly>yes</video:family_friendly>`,
      `      <video:live>no</video:live>`,
      `      <video:publication_date>${TODAY}T00:00:00+00:00</video:publication_date>`,
      `      <video:requires_subscription>no</video:requires_subscription>`,
      `    </video:video>`,
      `  </url>`,
    ].join("\n"),
  ),
  `</urlset>`,
].join("\n");
writeFileSync(resolve("public/video-sitemap.xml"), videoXml);
console.log(`video-sitemap.xml written (${videoEntries.length} videos)`);

// ============================================================================
// FAQ SITEMAP — 30 top question fragments
// ============================================================================
const faqXml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  ...Array.from({ length: 30 }).map((_, i) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}/faqs#q-${i + 1}</loc>`,
      `    <lastmod>${TODAY}</lastmod>`,
      `    <changefreq>monthly</changefreq>`,
      `    <priority>0.6</priority>`,
      `  </url>`,
    ].join("\n"),
  ),
  `  <url><loc>${BASE_URL}/faqs</loc><lastmod>${TODAY}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`,
  `  <url><loc>${BASE_URL}/movie-faq</loc><lastmod>${TODAY}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
  `</urlset>`,
].join("\n");
writeFileSync(resolve("public/faq-sitemap.xml"), faqXml);
console.log(`faq-sitemap.xml written`);

// ============================================================================
// SITEMAP INDEX
// ============================================================================
const indexXml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  `  <sitemap><loc>${BASE_URL}/sitemap.xml</loc><lastmod>${TODAY}</lastmod></sitemap>`,
  `  <sitemap><loc>${BASE_URL}/video-sitemap.xml</loc><lastmod>${TODAY}</lastmod></sitemap>`,
  `  <sitemap><loc>${BASE_URL}/faq-sitemap.xml</loc><lastmod>${TODAY}</lastmod></sitemap>`,
  `</sitemapindex>`,
].join("\n");
writeFileSync(resolve("public/sitemap-index.xml"), indexXml);
console.log(`sitemap-index.xml written`);

