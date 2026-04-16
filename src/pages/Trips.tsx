import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { TopNavBar } from "@/components/layout/TopNavBar";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { Footer } from "@/components/layout/Footer";
import { X, MapPin, Clock, Utensils, Camera, ShoppingBag, Sun, Moon, Coffee, Star, Sparkles, ChevronRight, Plus, Loader2, Check, Zap, Download, FileText } from "lucide-react";
import { downloadFlightTicketPDF, downloadHotelTicketPDF, downloadActivityTicketPDF } from "@/lib/pdfTickets";



const HERO_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuBi-uVVCm7YXg7HAmYGW91YdgrmH4VnmljGcaBAcKIPQn0DbOT7PAA6mSNSuX6pIyCYeJGg4hhJTCqwRsLunigxTnSNcH6L6x4rfK0irc3_49zFqwYvDLHdxZYUO_18kNbzF4H0jZKtgpGYWRNoEV3Z9WD2UT3aqHzHd05YCU1JzE4U-pk7wm-CfJQ7HoE5XX-IPneI4wgookSytl2HCEYTZAR5dEO8Gwx-jAiHiuayc0KJpNRxxHQUe53Fygifv4PpCCbh7eIzvCo";
const TEAMLAB_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuCX1Ru2Ra-LvlGFzsYU7-7ScfFrVHyKI4uh4fD-LWImvdmf4I3xJwVRjgbQMTT5YBUSA0lupJmK6eiPrIMUKuFdhm93c7sqAdSahHt1FkHWm7Si7UsGlTNUMEKb92wg5UvVnxIx3HUL1y1KWT7_8arF9-Q-E-YCYW6_sPl3IpfUseGd7bbTKnWb20zYGj0Z_i0VHnKqm-tVtlpbtwlNK82QwTfHiro05IQr5NoWqTn5OS6RgGsPw7nMqwx4Bw9mPf6f-UHNhIb_ksk";
const AVATAR1 = "https://lh3.googleusercontent.com/aida-public/AB6AXuBZc8syv_0NdF4KcecQzRledRDx6JLhLojZ003fU_sfRVlPdNMV756WRVXZPvp8gneI9iLoRfSIYa63Q_86UqeyCYBHZJUdU27SnuD8L_rPWxwHuFzPyAcchWatlaZOHXAGzpIOT1kLvVLHzqr2Xx2umOGrJzE_QF74ariuOEC3bi3x7zWWPp8j7IqpVCBlyfpq-cT22H_gljxTNbVD1CrZatKEVn7B7BvAXU3Qm2p_vj9r5lMbp38Hxpvgx-D6F5GzxWEiBmxr8PU";
const AVATAR2 = "https://lh3.googleusercontent.com/aida-public/AB6AXuBKcTGF7FwM4aSYgcQNAg1cXxS8AKhL2vXSmymtfTap83VD5O7o5Em73CkjLt0koGpW5xU8GHOl1A_ehqbg4NUu43ebDpLWAfaW526PKTsHcYZqfFN92Z2wDzE2fg5gTS0xtzuRqWuUJnScbYRrdZdJCjV6gpAcyBRsWANwyJGuNiQTuNwRXNh_PUq5lPYAa8LNuyKoWGDpmRXDOsnfl55rhCqZ9kK1BcqRrUGCDa3J6qtoWTP8qm3tj-4ElQXRjxFSOmB76R0mOXw";
const AVATAR3 = "https://lh3.googleusercontent.com/aida-public/AB6AXuBLrQToSToMGvCxofnRUab2x04M7eb0i7tFq6hT4ieyK1Tkt6YfryT3ItO-DtYrlntovd3HemLvt7lt7QPqMs0MQ4K94W7edDj1Vv9CZbYyXMo9EtD2VHcT3L-N-WEcF1aWm8yIpBK7gyJNRhOlbTyIyom8xy97c6IeYp7MDbHJf9e-_Fis0DJ-s5OT2B0_frxj4qZXRSisYsk48lyMYfRVpc2pFozOYpl8vL21HWiD-1do2-wjLaOnYvatde4q9hIRU4sznUWP8Aw";

/* ── Full day-by-day activities data ── */
const dayActivities: Record<number, { time: string; duration: string; title: string; desc: string; icon: any; iconColor: string; tags?: string[]; confirmed?: boolean; active?: boolean; tip?: string; details?: { location: string; cost: string; rating: string; highlights: string[]; bestTime: string; notes: string } }[]> = {
  0: [
    { time: "10:00 AM", duration: "2.5 HOURS", title: "Shinjuku Gyoen National Garden", desc: "Start the trip with cherry blossom viewing. One of the best spots in Tokyo for Sakura season.", icon: Camera, iconColor: "bg-emerald-500", tags: ["Nature", "Sakura Spot"],
      details: { location: "11 Naitomachi, Shinjuku City, Tokyo", cost: "¥500 entrance", rating: "4.8/5", highlights: ["Over 1,000 cherry trees", "Japanese, English & French gardens", "Perfect picnic spot under blossoms"], bestTime: "Early morning for fewer crowds", notes: "No alcohol allowed inside. Bring a picnic blanket and bento!" }
    },
    { time: "01:30 PM", duration: "1 HOUR", title: "Ichiran Ramen Shinjuku", desc: "Classic Tonkotsu ramen in individual booths. Be prepared for a potential wait during peak cherry blossom season.", icon: Utensils, iconColor: "bg-orange-500", confirmed: true,
      details: { location: "Shinjuku 3-chome, Tokyo", cost: "¥1,200 per bowl", rating: "4.6/5", highlights: ["Customizable spice levels", "Solo booth for focused eating", "Rich, creamy pork bone broth"], bestTime: "Arrive by 1 PM to beat lunch rush", notes: "Order extra chashu (pork slices) and seasoned egg — worth every yen." }
    },
    { time: "04:00 PM", duration: "3 HOURS", title: "teamLab Borderless", desc: "Immersive digital art museum. Explore at your own pace through interconnected worlds of light and sound.", icon: Sparkles, iconColor: "bg-purple-500", active: true, tip: "Head to the Forest of Resonating Lamps first — less crowded in the evening!",
      details: { location: "Azabudai Hills, Minato City, Tokyo", cost: "¥3,800 adult / ¥1,000 child", rating: "4.9/5", highlights: ["Infinity mirror rooms", "Interactive waterfall projections", "Tea house with digital art in your cup"], bestTime: "Weekday evenings for shortest waits", notes: "Wear comfortable shoes — you'll walk a lot. No flash photography." }
    },
  ],
  1: [
    { time: "9:00 AM", duration: "2 HOURS", title: "Akihabara Electric Town", desc: "Explore the otaku paradise — anime shops, manga stores, retro game arcades, and maid cafés.", icon: ShoppingBag, iconColor: "bg-pink-500", tags: ["Culture", "Shopping"],
      details: { location: "Akihabara, Chiyoda City, Tokyo", cost: "Free to explore", rating: "4.7/5", highlights: ["Multi-floor arcades", "Rare anime figurines", "Retro game shops with classic consoles"], bestTime: "Morning for fewer crowds", notes: "Try a maid café for the full experience — it's uniquely Japanese!" }
    },
    { time: "12:00 PM", duration: "1.5 HOURS", title: "Harajuku & Takeshita Street", desc: "Tokyo's fashion mecca — vibrant street style, crepe shops, and Instagram-worthy cafés.", icon: Camera, iconColor: "bg-rose-500", tags: ["Fashion", "Food"],
      details: { location: "Takeshita Street, Harajuku, Shibuya", cost: "Free (shopping varies)", rating: "4.5/5", highlights: ["Giant rainbow cotton candy", "Kawaii fashion boutiques", "Marion Crepes — the original"], bestTime: "Weekday mornings for photos without crowds", notes: "Try the strawberry crepe at Marion — it's been there since 1976!" }
    },
    { time: "02:00 PM", duration: "1 HOUR", title: "Meiji Shrine", desc: "A peaceful forest walk to Tokyo's most sacred Shinto shrine, a serene contrast to Harajuku's energy.", icon: Sun, iconColor: "bg-amber-500",
      details: { location: "1-1 Yoyogikamizonocho, Shibuya", cost: "Free", rating: "4.8/5", highlights: ["150m torii gate at entrance", "Sacred sake barrels display", "Wish-writing wooden plaques (ema)"], bestTime: "Late afternoon for golden light", notes: "Write your wish on an ema plaque — a beautiful keepsake experience." }
    },
    { time: "04:00 PM", duration: "2 HOURS", title: "Shibuya Crossing & Hachiko", desc: "The world's busiest intersection — watch from the Starbucks above, then visit Hachiko's statue.", icon: Camera, iconColor: "bg-blue-500", active: true, tip: "Best photos from the Shibuya Sky observation deck!",
      details: { location: "Shibuya Station, Tokyo", cost: "Free (Shibuya Sky ¥2,000)", rating: "4.7/5", highlights: ["3,000 people cross at once", "Hachiko statue photo op", "Shibuya Sky 360° view"], bestTime: "Rush hour (5-7 PM) for maximum chaos", notes: "The Starbucks facing the crossing has the best aerial view — grab a window seat." }
    },
    { time: "07:00 PM", duration: "2 HOURS", title: "Golden Gai Bar Hopping", desc: "Six narrow alleys with 200+ tiny bars, each seating 5-8 people — Tokyo's most intimate nightlife.", icon: Moon, iconColor: "bg-indigo-500",
      details: { location: "Golden Gai, Shinjuku, Tokyo", cost: "¥500-1,500 per drink + cover", rating: "4.6/5", highlights: ["Theme bars (horror, jazz, cinema)", "Each bar fits only 5-8 people", "Where locals and tourists truly mix"], bestTime: "After 8 PM when bars start opening", notes: "Some bars have a cover charge (¥500-1000). Look for bars with English menus if needed." }
    },
  ],
  2: [
    { time: "9:30 AM", duration: "2 HOURS", title: "Tsukiji Outer Market", desc: "The legendary seafood market — sushi breakfast, fresh oysters, tamagoyaki, and matcha.", icon: Utensils, iconColor: "bg-red-500", tags: ["Food", "Must-Do"],
      details: { location: "Tsukiji 4-chome, Chuo City, Tokyo", cost: "¥2,000-5,000 for food tour", rating: "4.8/5", highlights: ["Ultra-fresh sushi at 9 AM", "Grilled scallops on the spot", "Japanese omelette (tamagoyaki)"], bestTime: "Before 10 AM for the freshest picks", notes: "Sushi Dai has hourly waits — try Daiwa Sushi instead for equal quality." }
    },
    { time: "12:00 PM", duration: "2 HOURS", title: "Shinjuku Shopping District", desc: "Department stores, electronics, and the massive Don Quijote discount store for souvenirs.", icon: ShoppingBag, iconColor: "bg-teal-500",
      details: { location: "Shinjuku 3-chome, Tokyo", cost: "Varies", rating: "4.5/5", highlights: ["Don Quijote 24-hour shopping", "Tax-free shopping for tourists", "Isetan department store basement food hall"], bestTime: "Afternoon", notes: "Bring your passport for tax-free purchases over ¥5,000!" }
    },
    { time: "03:00 PM", duration: "1.5 HOURS", title: "Shibuya Sky Observation Deck", desc: "360-degree rooftop views of Tokyo from the 46th floor — Mount Fuji visible on clear days.", icon: Camera, iconColor: "bg-sky-500", active: true, tip: "Visit at sunset for the best photos!",
      details: { location: "Shibuya Scramble Square, 46F", cost: "¥2,000 adult", rating: "4.9/5", highlights: ["Open-air rooftop at 230m", "Mount Fuji views on clear days", "Instagram-worthy sky edge photo spot"], bestTime: "30 minutes before sunset", notes: "Book online to skip the queue. No tripods allowed but phone cameras are fine." }
    },
    { time: "06:00 PM", duration: "3 HOURS", title: "Robot Restaurant Show", desc: "A wild neon spectacle of robots, dancers, and lasers — pure sensory overload in Shinjuku.", icon: Sparkles, iconColor: "bg-fuchsia-500", confirmed: true,
      details: { location: "Kabukicho, Shinjuku, Tokyo", cost: "¥8,500 per person", rating: "4.3/5", highlights: ["Giant robot battles", "Neon laser light shows", "Audience participation moments"], bestTime: "Evening shows (7:30 PM)", notes: "Eat before you go — the food inside is overpriced. Book online weeks ahead!" }
    },
  ],
  3: [
    { time: "8:00 AM", duration: "1.5 HOURS", title: "Romancecar to Hakone", desc: "Scenic limited-express train from Shinjuku through mountains — reserved window seats with views.", icon: Sun, iconColor: "bg-amber-500", tags: ["Transit", "Scenic"],
      details: { location: "Shinjuku Station → Hakone-Yumoto", cost: "¥2,330 one-way", rating: "4.7/5", highlights: ["Panoramic front-window seats", "90-minute scenic ride", "Mountain and river views"], bestTime: "First morning departure (8:00 AM)", notes: "Book front-facing observation seats online — they sell out fast!" }
    },
    { time: "10:00 AM", duration: "2 HOURS", title: "Hakone Open-Air Museum", desc: "Japan's first outdoor art museum — sculptures by Picasso, Moore, and Rodin amid mountain scenery.", icon: Camera, iconColor: "bg-violet-500",
      details: { location: "Ninotaira, Hakone, Kanagawa", cost: "¥1,600 adult", rating: "4.6/5", highlights: ["Picasso pavilion", "Foot bath with hot spring water", "Stained glass tower you can climb"], bestTime: "Morning for best lighting", notes: "The hot spring foot bath midway is the perfect rest stop." }
    },
    { time: "01:00 PM", duration: "2 HOURS", title: "Lake Ashi Pirate Ship Cruise", desc: "Cross the volcanic lake on a replica pirate ship with Mount Fuji looming in the background.", icon: Camera, iconColor: "bg-cyan-500", active: true, tip: "Sit on the right side for Mount Fuji views!",
      details: { location: "Togendai Port, Hakone", cost: "¥1,200 one-way", rating: "4.5/5", highlights: ["Mount Fuji reflection in lake", "Hakone Shrine torii gate from water", "Themed pirate ship design"], bestTime: "Early afternoon for clearest views", notes: "If Fuji is hidden by clouds, the ship itself is still a gorgeous experience." }
    },
    { time: "04:00 PM", duration: "3 HOURS", title: "Private Onsen at Hotel", desc: "Soak in volcanic hot spring waters at your ryokan — the ultimate Japanese relaxation experience.", icon: Moon, iconColor: "bg-rose-400", confirmed: true,
      details: { location: "Your Hakone Ryokan", cost: "Included with stay", rating: "5.0/5", highlights: ["Private outdoor bath (rotenburo)", "Mountain views while soaking", "Traditional kaiseki dinner included"], bestTime: "Late afternoon into evening", notes: "No swimwear allowed in onsen. Shower thoroughly before entering. Towels provided." }
    },
  ],
  4: [
    { time: "9:00 AM", duration: "2 HOURS", title: "Fushimi Inari Shrine", desc: "10,000 vermillion torii gates winding up Mount Inari — Kyoto's most iconic sight.", icon: Camera, iconColor: "bg-red-600", tags: ["Must-Do", "Iconic"], tip: "Go before 9 AM for empty paths!",
      details: { location: "68 Fukakusa, Fushimi-ku, Kyoto", cost: "Free", rating: "4.9/5", highlights: ["10,000 torii gates", "Summit views of Kyoto", "Fox guardian statues everywhere"], bestTime: "Dawn or early morning", notes: "The full hike to the summit takes 2-3 hours. Most tourists stop at the famous fork — go further for solitude." }
    },
    { time: "12:00 PM", duration: "1.5 HOURS", title: "Nishiki Market Lunch", desc: "Kyoto's 400-year-old food market — sample pickles, mochi, matcha sweets, and grilled skewers.", icon: Utensils, iconColor: "bg-orange-500",
      details: { location: "Nishikikoji-dori, Nakagyo-ku, Kyoto", cost: "¥2,000-4,000", rating: "4.7/5", highlights: ["Fresh dango on sticks", "Matcha everything", "Pickled vegetables of every kind"], bestTime: "Lunch time for freshest samples", notes: "Many stalls are cash-only. Bring ¥5,000+ in coins and small bills." }
    },
    { time: "02:30 PM", duration: "2 HOURS", title: "Kinkaku-ji (Golden Pavilion)", desc: "The gold-leaf covered temple reflected in a mirror-still pond — one of Japan's most iconic images.", icon: Camera, iconColor: "bg-yellow-500", active: true,
      details: { location: "1 Kinkakujicho, Kita-ku, Kyoto", cost: "¥500 entrance", rating: "4.8/5", highlights: ["Gold-leaf covered three-story pavilion", "Mirror lake reflection photo", "Japanese garden walking path"], bestTime: "Late afternoon golden hour", notes: "Not much shade — bring a hat in warm weather. The entrance ticket is actually a beautiful calligraphy charm." }
    },
    { time: "06:00 PM", duration: "2.5 HOURS", title: "Gion District Evening Walk", desc: "Kyoto's famous geisha district — spot maiko in wooden machiya houses along lantern-lit streets.", icon: Moon, iconColor: "bg-indigo-500",
      details: { location: "Gion, Higashiyama-ku, Kyoto", cost: "Free (dining extra)", rating: "4.6/5", highlights: ["Chance to see real geiko/maiko", "Historic machiya architecture", "Pontocho alley dining"], bestTime: "Dusk for lanterns and atmosphere", notes: "Please don't chase or block geiko/maiko for photos. It's considered extremely rude in Kyoto." }
    },
  ],
  5: [
    { time: "8:30 AM", duration: "2 HOURS", title: "Arashiyama Bamboo Grove", desc: "Towering bamboo stalks create an otherworldly green tunnel — one of the most photographed spots in Japan.", icon: Camera, iconColor: "bg-green-600", tags: ["Iconic", "Nature"], tip: "Arrive before 9 AM for photos without crowds!",
      details: { location: "Sagatenryuji, Ukyo-ku, Kyoto", cost: "Free", rating: "4.7/5", highlights: ["Towering bamboo canopy", "Ethereal morning light", "Connected to Tenryu-ji Garden"], bestTime: "Before 8:30 AM or after 4 PM", notes: "The grove is short — only 500m. Combine with Tenryu-ji Temple Garden for the full experience." }
    },
    { time: "11:00 AM", duration: "1.5 HOURS", title: "Monkey Park Iwatayama", desc: "Hike up a hill to play with 120+ wild Japanese macaques overlooking all of Kyoto.", icon: Camera, iconColor: "bg-amber-600",
      details: { location: "Arashiyama, Nishikyo-ku, Kyoto", cost: "¥550 adult", rating: "4.5/5", highlights: ["Feeding monkeys by hand", "Panoramic city views from summit", "Baby monkeys in spring"], bestTime: "Late morning", notes: "Don't look monkeys in the eyes — they see it as a challenge. Feed them from inside the shelter only." }
    },
    { time: "01:30 PM", duration: "1 HOUR", title: "Tofu Lunch at Sagano", desc: "Traditional Kyoto cuisine — silky yudofu (hot tofu) in a tranquil garden setting by the bamboo grove.", icon: Utensils, iconColor: "bg-orange-500", confirmed: true,
      details: { location: "Sagano, Arashiyama, Kyoto", cost: "¥2,500 set meal", rating: "4.6/5", highlights: ["Multi-course tofu set meal", "Garden seating with bamboo views", "400-year-old recipe"], bestTime: "Lunch reservation recommended", notes: "This is very different from Western tofu — incredibly silky and served with ginger and bonito flakes." }
    },
    { time: "04:00 PM", duration: "2 HOURS", title: "Kimono Experience in Higashiyama", desc: "Rent a traditional kimono and stroll through Kyoto's most photogenic historic streets.", icon: ShoppingBag, iconColor: "bg-pink-500", active: true,
      details: { location: "Higashiyama, Kyoto", cost: "¥5,000-8,000 full rental", rating: "4.8/5", highlights: ["Professional dressing included", "Hair styling available", "Walk past pagodas and temples in full kimono"], bestTime: "Afternoon for golden light photos", notes: "Shops close by 6-7 PM — return the kimono before closing. Walking in geta (wooden sandals) takes practice!" }
    },
  ],
  6: [
    { time: "8:00 AM", duration: "1 HOUR", title: "Train to Nara", desc: "45-minute ride from Kyoto to the ancient capital where over 1,000 sacred deer roam freely.", icon: Sun, iconColor: "bg-amber-500", tags: ["Transit"],
      details: { location: "Kyoto Station → Nara Station", cost: "¥720 one-way (JR)", rating: "N/A", highlights: ["Quick 45-minute journey", "Covered by Japan Rail Pass", "Direct service from Kyoto"], bestTime: "First morning train", notes: "Use the JR Nara Line — it's covered by the Japan Rail Pass. Exit at JR Nara Station." }
    },
    { time: "9:30 AM", duration: "3 HOURS", title: "Nara Park & Todai-ji Temple", desc: "Feed bowing deer and visit the world's largest bronze Buddha inside a massive wooden temple.", icon: Camera, iconColor: "bg-emerald-600", active: true, tip: "Buy deer crackers for ¥200 — they'll bow to you!",
      details: { location: "Nara Park, Nara City", cost: "¥600 temple entrance", rating: "4.9/5", highlights: ["1,000+ friendly sacred deer", "World's largest bronze Buddha", "Giant wooden temple doors"], bestTime: "Morning before tour groups arrive", notes: "Hold crackers high — deer can be pushy! Guard your maps and paper items, deer eat everything." }
    },
    { time: "01:00 PM", duration: "1 HOUR", title: "Kakinoha-zushi Lunch", desc: "Nara's specialty — pressed sushi wrapped in persimmon leaves, delicate and aromatic.", icon: Utensils, iconColor: "bg-orange-500",
      details: { location: "Naramachi district, Nara", cost: "¥1,200-1,800", rating: "4.5/5", highlights: ["Centuries-old preservation technique", "Salmon and mackerel varieties", "Beautiful leaf-wrapped presentation"], bestTime: "Lunch time", notes: "You eat the sushi but not the leaf — it's just for flavor and preservation." }
    },
    { time: "03:00 PM", duration: "2 HOURS", title: "Naramachi Historic District", desc: "Wander through narrow merchant streets with traditional machiya houses, craft shops, and cafés.", icon: Coffee, iconColor: "bg-teal-500",
      details: { location: "Naramachi, Nara City", cost: "Free", rating: "4.4/5", highlights: ["Sake tasting shops", "Handmade calligraphy brushes", "Traditional sweet shops"], bestTime: "Afternoon", notes: "Try the mochi at Nakatanidou — they pound it fresh in front of you at lightning speed!" }
    },
  ],
  7: [
    { time: "10:00 AM", duration: "3 HOURS", title: "Dotonbori Food Crawl", desc: "Osaka's neon-lit food street — takoyaki, okonomiyaki, kushikatsu, and gyoza until you burst.", icon: Utensils, iconColor: "bg-red-500", tags: ["Food", "Must-Do"], tip: "Takoyaki at Wanaka is the locals' favourite!",
      details: { location: "Dotonbori, Chuo-ku, Osaka", cost: "¥3,000-6,000", rating: "4.8/5", highlights: ["Giant mechanical crab sign", "Running Glico Man neon", "Best street food in Japan"], bestTime: "Late morning for short lines", notes: "Come hungry — you'll want to try everything. The famous crab sign is at Kani Doraku restaurant." }
    },
    { time: "02:00 PM", duration: "2 HOURS", title: "Osaka Castle", desc: "A magnificent 16th-century castle surrounded by moats and cherry trees with panoramic city views.", icon: Camera, iconColor: "bg-emerald-600", active: true,
      details: { location: "1-1 Osakajo, Chuo-ku, Osaka", cost: "¥600 adult", rating: "4.6/5", highlights: ["8-floor museum inside", "Panoramic 360° view from top", "Cherry blossom moat in spring"], bestTime: "Afternoon for best light on castle walls", notes: "The castle was rebuilt in 1931 in concrete — but the views from the top floor are spectacular." }
    },
    { time: "05:00 PM", duration: "2 HOURS", title: "Shinsekai District", desc: "Retro Osaka at its grittiest — neon towers, kushikatsu bars, and the iconic Tsutenkaku Tower.", icon: Moon, iconColor: "bg-indigo-500",
      details: { location: "Shinsekai, Naniwa-ku, Osaka", cost: "Free + food costs", rating: "4.4/5", highlights: ["Tsutenkaku Tower views", "Best kushikatsu in Osaka", "Old-school game arcades"], bestTime: "Evening for neon atmosphere", notes: "Kushikatsu rule: NEVER double-dip in the shared sauce. They take this very seriously!" }
    },
    { time: "08:00 PM", duration: "2 HOURS", title: "Kuromon Market Night", desc: "The 'Kitchen of Osaka' — fresh sashimi, sea urchin, wagyu on a stick, and grilled king crab.", icon: Utensils, iconColor: "bg-orange-600",
      details: { location: "Kuromon Market, Chuo-ku, Osaka", cost: "¥3,000-8,000", rating: "4.7/5", highlights: ["Uni (sea urchin) straight from shell", "A5 wagyu beef skewers", "King crab legs grilled fresh"], bestTime: "Evening for deals and fewer crowds", notes: "Prices are tourist-inflated — but the quality is genuinely excellent. Try the ¥500 strawberry daifuku for dessert." }
    },
  ],
  8: [
    { time: "9:00 AM", duration: "ALL DAY", title: "Universal Studios Japan", desc: "One of the world's best theme parks — Harry Potter, Nintendo World, and thrilling rides.", icon: Sparkles, iconColor: "bg-blue-600", tags: ["Theme Park", "Family"], confirmed: true,
      details: { location: "2-1-33 Sakurajima, Konohana-ku, Osaka", cost: "¥8,600 adult / ¥5,600 child", rating: "4.7/5", highlights: ["Super Nintendo World", "Wizarding World of Harry Potter", "Hollywood Dream roller coaster"], bestTime: "Arrive at park opening (9 AM)", notes: "Buy Express Pass online to skip queues on popular rides. Nintendo World requires timed entry — register on the USJ app early!" }
    },
  ],
  9: [
    { time: "9:00 AM", duration: "1.5 HOURS", title: "Sensoji Temple, Asakusa", desc: "Tokyo's oldest temple — walk through the giant lantern gate and browse Nakamise shopping street.", icon: Camera, iconColor: "bg-red-600", tags: ["Culture", "Shopping"],
      details: { location: "2-3-1 Asakusa, Taito-ku, Tokyo", cost: "Free", rating: "4.7/5", highlights: ["Giant red paper lantern at Kaminarimon", "Nakamise shopping street", "Fortune slips (omikuji) for ¥100"], bestTime: "Early morning before crowds", notes: "If you get a bad fortune, tie it to the rack at the temple to leave the bad luck behind!" }
    },
    { time: "11:30 AM", duration: "1.5 HOURS", title: "Final Ramen at Tokyo Station", desc: "Ramen Street in Tokyo Station basement — 8 legendary shops in one corridor for a final bowl.", icon: Utensils, iconColor: "bg-orange-500", active: true, tip: "Try Soranoiro for something unique — vegan and soy options!",
      details: { location: "Tokyo Station Ramen Street, B1F", cost: "¥900-1,400", rating: "4.6/5", highlights: ["8 famous ramen shops", "Each shop has a different specialty", "Under 5-min walk from Shinkansen platforms"], bestTime: "Before noon for shorter waits", notes: "Rokurinsha's tsukemen has a 30-minute wait — but the thick dipping noodles are absolutely worth it." }
    },
    { time: "02:00 PM", duration: "2 HOURS", title: "Last-minute Shopping in Ginza", desc: "High-end department stores and unique Japanese gifts — Uniqlo, Muji, and artisan craft shops.", icon: ShoppingBag, iconColor: "bg-teal-500",
      details: { location: "Ginza, Chuo-ku, Tokyo", cost: "Varies", rating: "4.5/5", highlights: ["12-floor Uniqlo flagship", "Itoya stationery paradise", "Tax-free shopping"], bestTime: "Afternoon", notes: "Don't miss Itoya stationery store — 12 floors of the most beautiful pens, paper, and notebooks you've ever seen." }
    },
    { time: "05:00 PM", duration: "2 HOURS", title: "Narita Express to Airport", desc: "Comfortable express train to Narita Airport — a fitting farewell with Tokyo skyline views.", icon: Sun, iconColor: "bg-amber-500", confirmed: true,
      details: { location: "Tokyo Station → Narita Airport", cost: "¥3,250 (covered by JR Pass)", rating: "N/A", highlights: ["Reserved seating", "75-minute direct service", "Luggage storage areas"], bestTime: "3 hours before flight", notes: "If using JR Pass, reserve your seat at the JR counter. Airport check-in closes 1 hour before international flights." }
    },
  ],
};

const days = [
  { label: "Day 1: Tokyo Arrival", subtitle: "Tuesday, March 24, 2026 • Tokyo" },
  { label: "Day 2: Tokyo Pop Culture", subtitle: "Wednesday, March 25, 2026 • Tokyo" },
  { label: "Day 3: Shinjuku & Shibuya", subtitle: "Thursday, March 26, 2026 • Tokyo" },
  { label: "Day 4: Hakone Hot Springs", subtitle: "Friday, March 27, 2026 • Hakone" },
  { label: "Day 5: Kyoto Temples", subtitle: "Saturday, March 28, 2026 • Kyoto" },
  { label: "Day 6: Arashiyama Bamboo", subtitle: "Sunday, March 29, 2026 • Kyoto" },
  { label: "Day 7: Nara Deer Park", subtitle: "Monday, March 30, 2026 • Nara" },
  { label: "Day 8: Osaka Food Tour", subtitle: "Tuesday, March 31, 2026 • Osaka" },
  { label: "Day 9: Universal Studios Japan", subtitle: "Wednesday, April 1, 2026 • Osaka" },
  { label: "Day 10: Tokyo Departure", subtitle: "Thursday, April 2, 2026 • Tokyo" }
];

export default function Trips() {
  const [activeTab, setActiveTab] = useState("Itinerary");
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [addingActivity, setAddingActivity] = useState(false);
  const [addedSuggestions, setAddedSuggestions] = useState<string[]>([]);
  const [customActivities, setCustomActivities] = useState<Record<number, any[]>>({});
  const navigate = useNavigate();

  /* ── AI-powered activity suggestions by city ── */
  const aiSuggestions: Record<string, { title: string; desc: string; time: string; duration: string; icon: any; iconColor: string; cost: string; rating: string; tip: string; tags: string[] }[]> = {
    "Tokyo": [
      { title: "Yanaka Ginza Shopping Street", desc: "A charming old-town shopping street where traditional Tokyo still lives — street cats, old-school snack shops, and zero tourists.", time: "11:00 AM", duration: "1.5 HRS", icon: ShoppingBag, iconColor: "bg-pink-500", cost: "Free", rating: "4.6/5", tip: "Try the menchi-katsu (deep-fried meat patty) — locals queue for it!", tags: ["Hidden Gem", "Local Favourite"] },
      { title: "Sumo Morning Practice", desc: "Watch real sumo wrestlers train at a stable in Ryogoku — an incredibly rare and authentic Tokyo experience.", time: "7:30 AM", duration: "2 HRS", icon: Star, iconColor: "bg-red-600", cost: "Free (donation welcome)", rating: "4.9/5", tip: "Email the stable 2 weeks ahead; sit silently on arrival.", tags: ["Unique", "Must-Book"] },
      { title: "Omoide Yokocho (Piss Alley)", desc: "Tiny smoky yakitori stalls under Shinjuku station — Tokyo's grittiest, most delicious late-night food corridor.", time: "8:00 PM", duration: "1.5 HRS", icon: Utensils, iconColor: "bg-orange-600", cost: "¥1,500-3,000", rating: "4.5/5", tip: "Go to the stalls furthest from the entrance for shorter waits.", tags: ["Nightlife", "Street Food"] },
      { title: "Yayoi Kusama Museum", desc: "The infinity room queen's private museum — polka dot installations and mirror rooms that redefine art.", time: "2:00 PM", duration: "1.5 HRS", icon: Camera, iconColor: "bg-yellow-500", cost: "¥1,100", rating: "4.8/5", tip: "Tickets sell out months ahead — book the moment they open!", tags: ["Art", "Instagram"] },
      { title: "Izakaya Crawl in Ebisu", desc: "Hop between cozy Japanese pubs in the hip Ebisu neighbourhood — cold beer, edamame, and yakitori.", time: "7:00 PM", duration: "2.5 HRS", icon: Moon, iconColor: "bg-indigo-600", cost: "¥3,000-6,000", rating: "4.7/5", tip: "Start at Ebisu Yokocho — a vibrant indoor izakaya alley.", tags: ["Nightlife", "Food"] },
      { title: "Japanese Tea Ceremony", desc: "A 90-minute traditional matcha ceremony in a tatami room — learn the art of wabi-sabi from a licensed tea master.", time: "3:00 PM", duration: "1.5 HRS", icon: Coffee, iconColor: "bg-green-700", cost: "¥5,000", rating: "4.9/5", tip: "Wear socks — shoes off on tatami mats.", tags: ["Culture", "Experience"] },
    ],
    "Hakone": [
      { title: "Owakudani Volcanic Valley", desc: "Active volcanic vents, sulphuric gases, and black eggs boiled in hot springs — each one adds 7 years to your life!", time: "10:00 AM", duration: "2 HRS", icon: Camera, iconColor: "bg-gray-600", cost: "¥1,500 ropeway", rating: "4.5/5", tip: "Don't eat more than 2 black eggs — they're sulphur-heavy!", tags: ["Nature", "Unique"] },
      { title: "Hakone Shrine Torii Gate", desc: "A bright red torii gate standing in Lake Ashi — one of Japan's most photographed shrines, especially magical in mist.", time: "8:00 AM", duration: "1 HR", icon: Camera, iconColor: "bg-red-500", cost: "Free", rating: "4.8/5", tip: "Visit at dawn for reflections without people in your photos.", tags: ["Spiritual", "Photo Spot"] },
    ],
    "Kyoto": [
      { title: "Philosopher's Path Walk", desc: "A peaceful 2km cherry-tree-lined canal path connecting Ginkaku-ji and Nanzen-ji temples — pure zen.", time: "8:00 AM", duration: "2 HRS", icon: Sun, iconColor: "bg-green-500", cost: "Free", rating: "4.7/5", tip: "Walk south to north — most tourists go the other way.", tags: ["Nature", "Peaceful"] },
      { title: "Nijo Castle Nightingale Floors", desc: "A 400-year-old shogun castle with floors that chirp like birds when you walk — Japan's oldest security system.", time: "10:00 AM", duration: "1.5 HRS", icon: Camera, iconColor: "bg-amber-700", cost: "¥800", rating: "4.6/5", tip: "Walk slowly and listen — the 'uguisubari' floors sing beneath your feet.", tags: ["History", "Unique"] },
      { title: "Sake Tasting in Fushimi", desc: "Kyoto's brewing district — visit 3 sake breweries, learn the fermentation process, and taste 10+ varieties.", time: "2:00 PM", duration: "2.5 HRS", icon: Utensils, iconColor: "bg-purple-600", cost: "¥3,500", rating: "4.8/5", tip: "Gekkeikan Okura Museum has the best English-guided tastings.", tags: ["Food", "Culture"] },
    ],
    "Nara": [
      { title: "Kasuga Taisha Shrine", desc: "3,000 stone and bronze lanterns line the path to this sacred shrine — lit twice a year during Mantoro festivals.", time: "9:00 AM", duration: "1.5 HRS", icon: Camera, iconColor: "bg-orange-700", cost: "¥500", rating: "4.7/5", tip: "The moss-covered lanterns in the forest are the most photogenic.", tags: ["Spiritual", "Photo Spot"] },
      { title: "Mochi Pounding at Nakatanidou", desc: "Watch craftsmen pound mochi at lightning speed — then eat the freshest, softest mochi you've ever tasted.", time: "12:00 PM", duration: "30 MIN", icon: Utensils, iconColor: "bg-green-600", cost: "¥500", rating: "4.9/5", tip: "Performances happen roughly every 30 minutes — just wait!", tags: ["Food", "Performance"] },
    ],
    "Osaka": [
      { title: "Spa World Hot Springs", desc: "A massive 8-floor onsen theme park with hot spring baths from around the world — European, Asian, and more.", time: "5:00 PM", duration: "3 HRS", icon: Sparkles, iconColor: "bg-blue-500", cost: "¥1,500", rating: "4.4/5", tip: "The rooftop pool has amazing Osaka skyline views.", tags: ["Relaxation", "Fun"] },
      { title: "Osaka Aquarium Kaiyukan", desc: "One of the world's largest aquariums — whale sharks, manta rays, and jellyfish galleries that glow in the dark.", time: "10:00 AM", duration: "3 HRS", icon: Camera, iconColor: "bg-cyan-600", cost: "¥2,700", rating: "4.7/5", tip: "Visit the touch pool on the bottom floor — kids love handling sharks and rays!", tags: ["Family", "Marine Life"] },
      { title: "Hozenji Yokocho Alley", desc: "A hidden stone-paved alley behind Dotonbori with intimate kappo-style restaurants and a moss-covered temple.", time: "7:30 PM", duration: "1.5 HRS", icon: Moon, iconColor: "bg-indigo-500", cost: "¥4,000-8,000", rating: "4.6/5", tip: "Splash water on the moss-covered Fudo Myo-o statue for good luck.", tags: ["Hidden Gem", "Dining"] },
    ],
  };

  const getDayCity = (idx: number): string => {
    const subtitle = days[idx]?.subtitle || "";
    if (subtitle.includes("Tokyo")) return "Tokyo";
    if (subtitle.includes("Hakone")) return "Hakone";
    if (subtitle.includes("Kyoto")) return "Kyoto";
    if (subtitle.includes("Nara")) return "Nara";
    if (subtitle.includes("Osaka")) return "Osaka";
    return "Tokyo";
  };

  const handleEdit = () => navigate("/trips/edit");
  const handleAddActivity = () => setShowAddPanel(true);
  const handleViewTickets = () => toast("Downloading tickets to your device...");
  const handleNewTrip = () => {
    toast("Redirecting to AI Trip Planner...");
    setTimeout(() => navigate("/explore"), 800);
  };

  const handleAddSuggestion = (suggestion: any) => {
    setAddingActivity(true);
    setTimeout(() => {
      const newAct = {
        time: suggestion.time,
        duration: suggestion.duration,
        title: suggestion.title,
        desc: suggestion.desc,
        icon: suggestion.icon,
        iconColor: suggestion.iconColor,
        tags: suggestion.tags,
        tip: suggestion.tip,
        details: {
          location: getDayCity(activeDayIndex) + ", Japan",
          cost: suggestion.cost,
          rating: suggestion.rating,
          highlights: [suggestion.desc.split("—")[0].trim()],
          bestTime: suggestion.time,
          notes: suggestion.tip,
        },
      };
      setCustomActivities((prev) => ({
        ...prev,
        [activeDayIndex]: [...(prev[activeDayIndex] || []), newAct],
      }));
      setAddedSuggestions((prev) => [...prev, suggestion.title]);
      setAddingActivity(false);
      toast.success(`"${suggestion.title}" added to ${days[activeDayIndex].label}!`);
    }, 800);
  };

  const currentActivities = [
    ...(dayActivities[activeDayIndex] || dayActivities[0]),
    ...(customActivities[activeDayIndex] || []),
  ];

  return (
    <div className="bg-surface text-on-surface font-body">
      <TopNavBar />

      {/* ── Floating Detail Modal ── */}
      {selectedActivity && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => setSelectedActivity(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`${selectedActivity.iconColor} p-6 rounded-t-3xl relative`}>
              <button
                onClick={() => setSelectedActivity(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <selectedActivity.icon className="w-5 h-5 text-white" />
                <span className="text-white/80 text-sm font-bold">{selectedActivity.time} • {selectedActivity.duration}</span>
              </div>
              <h2 className="text-2xl font-bold text-white">{selectedActivity.title}</h2>
              {selectedActivity.tags && (
                <div className="flex gap-2 mt-3">
                  {selectedActivity.tags.map((tag: string) => (
                    <span key={tag} className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <p className="text-gray-600 leading-relaxed">{selectedActivity.desc}</p>

              {selectedActivity.tip && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm">
                  <Star className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
                  <span className="font-medium">{selectedActivity.tip}</span>
                </div>
              )}

              {selectedActivity.details && (
                <>
                  {/* Location & Cost */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">
                        <MapPin className="w-3 h-3" /> Location
                      </div>
                      <p className="text-sm font-medium text-gray-800">{selectedActivity.details.location}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">
                        <Clock className="w-3 h-3" /> Cost
                      </div>
                      <p className="text-sm font-medium text-gray-800">{selectedActivity.details.cost}</p>
                    </div>
                  </div>

                  {/* Rating & Best Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">⭐ Rating</div>
                      <p className="text-sm font-medium text-gray-800">{selectedActivity.details.rating}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <div className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">🕐 Best Time</div>
                      <p className="text-sm font-medium text-gray-800">{selectedActivity.details.bestTime}</p>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">✨ Highlights</h4>
                    <div className="space-y-2">
                      {selectedActivity.details.highlights.map((h: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${selectedActivity.iconColor}`} />
                          <span className="text-sm text-gray-700">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Insider Notes */}
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Insider Notes</span>
                    </div>
                    <p className="text-sm text-blue-800 leading-relaxed">{selectedActivity.details.notes}</p>
                  </div>
                </>
              )}

              {selectedActivity.confirmed && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 px-4 py-3 rounded-xl text-sm font-semibold">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Reservation Confirmed
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── AI Add Activity Panel ── */}
      {showAddPanel && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => setShowAddPanel(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-3xl relative">
              <button
                onClick={() => setShowAddPanel(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-white" />
                <span className="text-white/80 text-sm font-bold">AI-Powered Suggestions</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Add Activity to {days[activeDayIndex].label}</h2>
              <p className="text-white/70 text-sm mt-1">Based on your location: <span className="font-bold text-white">{getDayCity(activeDayIndex)}</span></p>
            </div>

            {/* AI Badge */}
            <div className="px-6 pt-4">
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-2.5 rounded-xl text-sm">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-blue-800 font-medium">Wandi AI has curated these activities based on your itinerary, location, and schedule gaps.</span>
              </div>
            </div>

            {/* Suggestions List */}
            <div className="p-6 space-y-3">
              {(aiSuggestions[getDayCity(activeDayIndex)] || aiSuggestions["Tokyo"]).map((s) => {
                const SIcon = s.icon;
                const isAdded = addedSuggestions.includes(s.title);
                return (
                  <div key={s.title} className={`border rounded-2xl p-4 transition-all ${
                    isAdded ? "bg-green-50 border-green-200" : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md"
                  }`}>
                    <div className="flex gap-3">
                      <div className={`${s.iconColor} w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md`}>
                        <SIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">{s.title}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{s.time}</span>
                              <span className="text-[10px] font-bold text-gray-500">{s.duration}</span>
                              <span className="text-[10px] font-bold text-amber-600">⭐ {s.rating}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => !isAdded && handleAddSuggestion(s)}
                            disabled={isAdded || addingActivity}
                            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all active:scale-95 ${
                              isAdded
                                ? "bg-green-100 text-green-700 cursor-default"
                                : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                            }`}
                          >
                            {isAdded ? (
                              <><Check className="w-3 h-3" /> Added</>
                            ) : addingActivity ? (
                              <><Loader2 className="w-3 h-3 animate-spin" /> Adding...</>
                            ) : (
                              <><Plus className="w-3 h-3" /> Add</>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed mt-1.5">{s.desc}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {s.tags.map((tag) => (
                            <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{tag}</span>
                          ))}
                          <span className="text-[10px] text-gray-400 ml-auto">{s.cost}</span>
                        </div>
                        {s.tip && (
                          <div className="mt-2 flex items-start gap-1.5 bg-amber-50 text-amber-800 px-2.5 py-1.5 rounded-lg text-[11px] font-medium">
                            <Star className="w-3 h-3 mt-0.5 shrink-0 text-amber-500" />
                            <span>{s.tip}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <main className="pt-[72px] pb-24 md:pb-0">
        {/* Trip Hero */}
        <section className="relative h-[280px] w-full overflow-hidden">
          <img alt="Japan Cherry Blossoms" className="w-full h-full object-cover" src={HERO_IMG} />
          <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-on-surface/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full p-8 text-white max-w-7xl mx-auto right-0">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                    Upcoming Trip
                  </span>
                  <div className="flex -space-x-2">
                    <img alt="Member" className="w-8 h-8 rounded-full border-2 border-white" src={AVATAR1} />
                    <img alt="Member" className="w-8 h-8 rounded-full border-2 border-white" src={AVATAR2} />
                    <img alt="Member" className="w-8 h-8 rounded-full border-2 border-white" src={AVATAR3} />
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-on-surface">+1</div>
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-headline">Japan Spring 2026</h1>
                <div className="flex items-center gap-4 mt-2 text-surface-variant font-medium">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_today</span> Mar 24 - Apr 2, 2026</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> 10 days</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">group</span> 4 members</span>
                </div>
              </div>
              <button onClick={handleEdit} className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-white/30 transition-all hidden md:flex active:scale-95">
                <span className="material-symbols-outlined">edit</span> Edit Trip
              </button>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="bg-surface-container-low/50 sticky top-[72px] z-40 border-b border-outline-variant/10 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex gap-10 overflow-x-auto scrollbar-hide">
              {["Itinerary", "Bookings", "Group"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-5 text-sm tracking-wide transition-colors ${
                    activeTab === tab
                      ? "border-b-2 border-primary-container text-primary-container font-bold"
                      : "text-on-surface-variant font-medium hover:text-primary-container"
                  }`}
                >
                  {tab}
                </button>
              ))}
              <Link to="/trips/map" className="py-5 text-on-surface-variant font-medium text-sm tracking-wide hover:text-primary-container transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">map</span> Map
              </Link>
              <Link to="/expenses" className="py-5 text-on-surface-variant font-medium text-sm tracking-wide hover:text-primary-container transition-colors">Expenses</Link>
            </div>
          </div>
        </section>

        {/* Tab Content */}
        {activeTab === "Itinerary" && (
        <section className="max-w-7xl mx-auto px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Day Navigator */}
            <aside className="md:col-span-3 space-y-3">
              <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
                <h3 className="text-[10px] font-bold tracking-widest uppercase text-outline mb-4">Journey Days</h3>
                <div className="space-y-1">
                  {days.map((day, idx) => (
                    <button onClick={() => setActiveDayIndex(idx)} key={day.label} className={`w-full text-left px-4 py-3 rounded-lg text-sm flex items-center justify-between group transition-all ${
                      activeDayIndex === idx
                        ? "bg-primary-container/10 text-primary-container font-bold"
                        : "text-on-surface-variant hover:bg-surface-container-high"
                    }`}>
                      <span>{day.label}</span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${activeDayIndex === idx ? "text-primary-container" : "text-transparent group-hover:text-outline-variant"}`} />
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Timeline */}
            <main className="md:col-span-5">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-extrabold font-headline text-on-surface">{days[activeDayIndex].label}</h2>
                  <p className="text-on-surface-variant mt-1">{days[activeDayIndex].subtitle}</p>
                </div>
                <button onClick={handleAddActivity} className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-secondary-container/80 transition-colors active:scale-95">
                  <span className="material-symbols-outlined text-sm">add_circle</span> Add Activity
                </button>
              </div>

              <div className="relative space-y-8">
                <div className="absolute left-[19px] top-4 bottom-4 w-px bg-outline-variant/30" />
                {currentActivities.map((act) => {
                  const IconComponent = act.icon;
                  return (
                    <div key={act.title} className="relative flex gap-6 cursor-pointer group" onClick={() => setSelectedActivity(act)}>
                      <div className={`z-10 ${act.iconColor} w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg ring-4 ring-surface`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className={`flex-1 p-6 rounded-2xl shadow-sm border transition-all group-hover:shadow-md group-hover:-translate-y-0.5 ${
                        act.active
                          ? "bg-white ring-2 ring-primary-container shadow-md border-primary-container"
                          : "bg-surface-container-lowest border-outline-variant/5 group-hover:border-primary-container/30"
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`font-bold text-sm ${act.active ? "text-primary-container" : "text-primary-container"}`}>{act.time}</span>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${act.active ? "bg-primary-container text-white" : "bg-surface-container-high text-on-surface-variant"}`}>{act.duration}</span>
                            <ChevronRight className="w-4 h-4 text-outline-variant group-hover:text-primary-container transition-colors" />
                          </div>
                        </div>
                        <h4 className="text-xl font-bold mb-2">{act.title}</h4>
                        <p className="text-on-surface-variant text-sm leading-relaxed mb-3">{act.desc}</p>
                        {act.confirmed && (
                          <div className="flex items-center gap-2 text-sm text-green-600 font-semibold mb-2">
                            <span className="w-2 h-2 rounded-full bg-green-500" /> Reservation Confirmed
                          </div>
                        )}
                        {act.tags && (
                          <div className="flex gap-2">
                            {act.tags.map((tag) => (
                              <span key={tag} className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-3 py-1 rounded-full text-[10px] font-bold">{tag}</span>
                            ))}
                          </div>
                        )}
                        {act.tip && (
                          <div className="mt-3 flex items-start gap-1.5 bg-amber-50 text-amber-800 px-3 py-2 rounded-lg text-xs font-medium">
                            <Star className="w-3 h-3 mt-0.5 shrink-0 text-amber-500" />
                            <span>{act.tip}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </main>

            {/* Detail Panel */}
            <aside className="md:col-span-4">
              <div className="sticky top-[148px] space-y-6">
                <div className="bg-surface-container-lowest rounded-4xl overflow-hidden shadow-lg">
                  <img alt="teamLab Borderless" className="w-full h-48 object-cover" src={TEAMLAB_IMG} />
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-primary-container text-sm">location_on</span>
                      <span className="text-sm font-medium text-on-surface-variant">Azabudai Hills, Tokyo</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">teamLab Borderless</h3>
                    <div className="aspect-square w-full rounded-2xl bg-surface-container-low mb-6 overflow-hidden relative border border-outline-variant/10">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-outline-variant">map</span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-xl flex items-center justify-between shadow-sm">
                        <div className="text-[10px] font-bold text-on-surface">15 MINS FROM RAMEN</div>
                        <button className="text-primary-container text-[10px] font-bold flex items-center">OPEN MAPS <span className="material-symbols-outlined text-xs ml-1">open_in_new</span></button>
                      </div>
                    </div>
                    <div className="bg-primary-container/5 p-4 rounded-2xl border border-primary-container/10">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary-container text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                        <span className="text-[10px] font-bold text-primary-container tracking-widest uppercase">WanderWise Tip</span>
                      </div>
                      <p className="text-xs text-on-surface leading-relaxed italic">
                        "Since you're visiting during the evening, the 'Forest of Resonating Lamps' will be less crowded. Head there first to avoid the line!"
                      </p>
                    </div>
                    <button onClick={handleViewTickets} className="w-full mt-6 bg-primary-container text-white font-bold py-4 rounded-xl shadow-md hover:bg-surface-tint transition-all active:scale-[0.98]">
                      View Tickets
                    </button>
                  </div>
                </div>

                {/* Budget */}
                <div className="bg-surface-container-low p-6 rounded-4xl">
                  <h4 className="text-[10px] font-bold tracking-widest uppercase text-outline mb-4">Daily Budget</h4>
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-2xl font-extrabold text-on-surface">¥12,400</span>
                    <span className="text-xs text-on-surface-variant">/ ¥20,000 planned</span>
                  </div>
                  <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                    <div className="h-full bg-secondary-m3 rounded-full" style={{ width: "62%" }} />
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
        )}



        {/* Bookings Tab */}
        {activeTab === "Bookings" && (
          <section className="max-w-4xl mx-auto px-4 md:px-8 py-10">
            <h2 className="text-3xl font-bold font-headline text-gray-900 mb-8">Confirmed Bookings</h2>
            
            <div className="space-y-6">
              {/* Flight Booking */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-outline-variant/10 overflow-hidden relative">
                <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">CONFIRMED</div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <span className="material-symbols-outlined">flight</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Japan Airlines • JAL 43</h3>
                    <p className="text-sm text-gray-500">London (LHR) to Tokyo (HND)</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase">Departure</div>
                    <div className="font-semibold text-gray-900">Mar 24 • 10:20 AM</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase">Arrival</div>
                    <div className="font-semibold text-gray-900">Mar 25 • 08:00 AM</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase">Passengers</div>
                    <div className="font-semibold text-gray-900">2 Adults</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase">Booking Ref</div>
                    <div className="font-mono font-bold text-blue-600">X9K2M4</div>
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => {
                      toast.promise(
                        new Promise<void>(resolve => {
                          downloadFlightTicketPDF({
                            airline: "Japan Airlines", flightCode: "JAL 43",
                            from: "London Heathrow", fromCode: "LHR",
                            to: "Tokyo Haneda", toCode: "HND",
                            departure: "Mar 24, 2026  10:20 AM",
                            arrival: "Mar 25, 2026  08:00 AM",
                            passengers: "2 Adults", bookingRef: "X9K2M4", seatClass: "Economy"
                          });
                          resolve();
                        }),
                        { loading: "Generating PDF...", success: "Flight e-ticket downloaded!", error: "Download failed." }
                      );
                    }}
                    className="flex-1 bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Download className="w-4 h-4" /> Download E-Ticket
                  </button>
                  <button onClick={() => toast("Redirecting to JAL Management...")} className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm active:scale-95">Manage Booking</button>
                </div>
              </div>

              {/* Hotel Booking */}
              <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-outline-variant/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10">CONFIRMED</div>
                <div className="flex flex-col md:flex-row gap-6 lg:items-center">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDbtRvHZd8b5AUdwFfDi1feW8os9ikuYtMguSR2zyHWGV9ZpP4JAmFdliiFvgiA3jIHLIW10bzT5QpIal7AIDUTnuTObdMSmkASyvKqfSLOv2k3pwZjvFPrprg6mzECc6xmH1gPjMbpzuoj-QvySkul0HtQqIZhdLwwjztf80QKi7YiWX01iDucekavESHhZkkQjhgRJGPgeop8zn0-rZ4qzLImoIG8nYUy4R3HVQgkkiX_rHFdqWTLXbDgRF0Mgx3JuKm8tVTG_Y" alt="Park Hyatt Tokyo" className="w-full md:w-48 h-36 object-cover rounded-2xl border border-gray-100" />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 text-amber-500 mb-1.5">
                      {Array.from({length: 5}).map((_, i) => (
                        <span key={i} className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                      ))}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Park Hyatt Tokyo</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mb-4"><span className="material-symbols-outlined text-[16px]">location_on</span> Shinjuku Park Tower, Tokyo</p>
                    <div className="flex flex-wrap gap-3">
                      <div className="bg-gray-50 px-3.5 py-2.5 rounded-xl">
                        <span className="block text-[10px] font-bold text-gray-500 uppercase">Check-in</span>
                        <span className="font-semibold text-sm text-gray-900">Mar 25, 3:00 PM</span>
                      </div>
                      <div className="bg-gray-50 px-3.5 py-2.5 rounded-xl">
                        <span className="block text-[10px] font-bold text-gray-500 uppercase">Check-out</span>
                        <span className="font-semibold text-sm text-gray-900">Apr 02, 11:00 AM</span>
                      </div>
                      <div className="bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100 ml-auto md:ml-0">
                        <span className="block text-[10px] font-bold text-blue-600 uppercase">Confirmation PIN</span>
                        <span className="font-mono font-bold text-blue-800 tracking-wider">4920-1122</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => {
                          toast.promise(
                            new Promise<void>(resolve => {
                              downloadHotelTicketPDF({
                                name: "Park Hyatt Tokyo", location: "Shinjuku Park Tower, Nishi-Shinjuku, Tokyo",
                                checkIn: "March 25, 2026  3:00 PM", checkOut: "April 2, 2026  11:00 AM",
                                confirmationPin: "4920-1122", stars: 5
                              });
                              resolve();
                            }),
                            { loading: "Generating PDF...", success: "Hotel voucher downloaded!", error: "Download failed." }
                          );
                        }}
                        className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Download className="w-4 h-4" /> Download Hotel Voucher
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Ticket */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-outline-variant/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">CONFIRMED</div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                    <span className="material-symbols-outlined">local_activity</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">teamLab Borderless Tokyo</h3>
                    <p className="text-sm text-gray-500">2x Adult Admission Tickets</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl items-center">
                  <div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase">Date</div>
                    <div className="font-semibold text-gray-900 text-sm">Mar 26, 2026</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase">Time Slot</div>
                    <div className="font-semibold text-gray-900 text-sm">04:00 PM</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase">Ticket ID</div>
                    <div className="font-mono font-bold text-gray-900 text-sm">TL-98102</div>
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        toast.promise(
                          new Promise<void>(resolve => {
                            downloadActivityTicketPDF({
                              name: "teamLab Borderless Tokyo",
                              date: "March 26, 2026", timeSlot: "04:00 PM",
                              ticketId: "TL-98102", quantity: "2x Adult"
                            });
                            resolve();
                          }),
                          { loading: "Generating PDF...", success: "Ticket downloaded!", error: "Download failed." }
                        );
                      }}
                      className="w-full bg-gray-900 text-white font-bold rounded-xl text-sm py-3 hover:bg-gray-800 transition-colors shadow-sm active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Download Ticket
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Group Tab */}
        {activeTab === "Group" && (
          <section className="max-w-3xl mx-auto px-4 md:px-8 py-10">
            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-outline-variant/10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold font-headline text-gray-900">Travel Group</h2>
                  <p className="text-sm text-gray-500 mt-1">Manage companions and itinerary sharing.</p>
                </div>
                <button
                  onClick={() => toast.success("Invite link copied to clipboard!")}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95 shadow-md"
                >
                  <span className="material-symbols-outlined text-lg">person_add</span>
                  Invite
                </button>
              </div>

              <div className="space-y-4">
                {[
                  { name: "You", role: "Organizer", email: "you@example.com", avatar: AVATAR1, isYou: true },
                  { name: "Alex Chen", role: "Editor", email: "alex.c@example.com", avatar: AVATAR2, isYou: false },
                  { name: "Sarah Miller", role: "Viewer", email: "sarah.m@example.com", avatar: AVATAR3, isYou: false },
                ].map((member, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                        {member.isYou && <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900">{member.name}</h4>
                          {member.isYou && <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md">YOU</span>}
                        </div>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <select 
                        disabled={member.isYou}
                        className="bg-transparent text-sm font-medium text-gray-700 cursor-pointer focus:outline-none disabled:opacity-50"
                        defaultValue={member.role}
                      >
                        <option>Organizer</option>
                        <option>Editor</option>
                        <option>Viewer</option>
                      </select>
                      {!member.isYou && (
                        <button onClick={() => toast("User removed from group.")} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <span className="material-symbols-outlined text-lg">person_remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Add Member Form */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Add Member</h4>
                    <form 
                      className="flex gap-2" 
                      onSubmit={(e) => { 
                        e.preventDefault(); 
                        const input = e.currentTarget.elements.namedItem('email') as HTMLInputElement;
                        const email = input.value;
                        if (email) {
                          toast.promise(
                            fetch("/api/invite", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ email, link: "https://wanderwise.ai/join/t/x9k2m4" })
                            }).then(async res => {
                              const data = await res.json();
                              if (!res.ok) throw new Error(data.error || "Failed to send");
                              return data;
                            }),
                            {
                              loading: "Sending invitation...",
                              success: () => {
                                input.value = '';
                                return `Invitation sent to ${email}!`;
                              },
                              error: (err: any) => err.message
                            }
                          );
                        }
                      }}
                    >
                      <input 
                        type="email" 
                        name="email"
                        placeholder="Enter email address" 
                        required
                        className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                      <button type="submit" className="bg-blue-600 text-white px-5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm active:scale-95">
                        Add
                      </button>
                    </form>
                  </div>
                  
                  {/* Share Link */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Share Link</h4>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        readOnly 
                        value="https://wanderwise.ai/join/t/x9k2m4" 
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 focus:outline-none"
                      />
                      <button onClick={() => toast.success("Link copied!")} className="bg-gray-900 text-white px-5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm active:scale-95">
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

      </main>

      {/* FAB */}
      <button onClick={handleNewTrip} className="fixed bottom-24 right-8 w-14 h-14 bg-primary-container text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 md:bottom-8">
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>

      <Footer />
      <BottomNavBar />
    </div>
  );
}
