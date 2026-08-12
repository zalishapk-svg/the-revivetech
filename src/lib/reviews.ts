export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified: boolean;
  location: string;
}

export interface ProductReviewSummary {
  reviews: ProductReview[];
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

const PAKISTANI_NAMES = [
  "Muhammad Hamza",
  "Abdul Rehman",
  "Usman Ahmed",
  "Ali Raza",
  "Hassan Ali",
  "Bilal Khan",
  "Saad Ahmed",
  "Ahsan Malik",
  "Muhammad Abdullah",
  "Owais Ahmed",
  "Talha Khan",
  "Zain Ahmed",
  "Fahad Hussain",
  "Huzaifa Ali",
  "Danish Ahmed",
  "Shahzaib Chaudhry",
  "Omer Farooq",
  "Mian Hamza",
  "Tariq Mahmud",
  "Waqas Rashid",
  "Adeel Ashraf",
  "Kashif Gujjar",
  "Subhan Tariq",
  "Usama Shah",
  "Hamza Niaz",
  "Sohaib Akhtar",
  "Faisal Iqbal",
  "Moiz Siddiqui",
  "Zarrar Khan",
  "Asad Parvez",
  "Syed Hammad",
  "Ayan Mirza",
  "Noman Ejaz",
  "Shahrukh Butt",
  "Saifullah Khalid",
  "Rana Mubashir",
  "Haris Mehmood",
  "Suleman Tariq",
  "Ibrahim Hashmi",
  "Rayyan Siddiqui"
];

const CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Sialkot",
  "Gujranwala"
];

const RELATIVE_DATES = [
  "2 days ago",
  "4 days ago",
  "1 week ago",
  "2 weeks ago",
  "3 weeks ago",
  "1 month ago",
  "2 months ago",
  "3 months ago"
];

// 1. MOUSE PAD / DESK MAT SPECIFIC REVIEWS
const MOUSE_PAD_REVIEWS = [
  {
    title: "Perfect size for setup",
    comment: "Size kaafi acha hai, mera keyboard aur mouse dono comfortably cover ho jata hain. Surface smooth hai aur mouse glide kaafi clean feel hota hai."
  },
  {
    title: "Great tracking for FPS games",
    comment: "Gaming ke liye liya tha, especially CS2 aur Valorant mein tracking kaafi smooth lagti hai. Bottom rubber grip bhi solid hai, desk par slide nahi hota."
  },
  {
    title: "Worth it for the price",
    comment: "Honestly price ke hisaab se acha pad hai. Edges stitched hain aur surface pe mouse easily glide karta hai."
  },
  {
    title: "Desk setup looks much cleaner",
    comment: "Desk setup ke liye size perfect nikla. Pehle chota pad use kar raha tha, iske baad difference kaafi noticeable hai."
  },
  {
    title: "Good surface texture",
    comment: "Abhi kuch din huay use karte huay, overall acha lag raha hai. Fabric texture clean hai aur mouse tracking effortless lagti hai."
  },
  {
    title: "Solid desk coverage & comfort",
    comment: "Size matches description exactly. Material quality is good and padding gives nice wrist comfort during long gaming sessions."
  },
  {
    title: "Grip underneath is strong",
    comment: "Rubber base on the bottom is thick. Doesn't move or shift at all on my wooden desk during fast mouse movements."
  },
  {
    title: "Fast delivery in Lahore",
    comment: "Received in 2 days safely packed in a roll tube. Unfolded flat right away without any weird edge curls."
  },
  {
    title: "Clean stitching along borders",
    comment: "Stitching along the edges is neat with no loose threads. Mouse sensor tracks smoothly without any skipping."
  },
  {
    title: "Minimalist look & easy to clean",
    comment: "Simple clean look on the desk. Fabric is easy to wipe down and handles daily use well."
  }
];

// 2. WIRELESS MOUSE REVIEWS (ONLY for Wireless mice)
const MOUSE_WIRELESS_REVIEWS = [
  {
    title: "Zero lag wireless connection",
    comment: "Was skeptical about wireless for gaming, but input delay is completely non-existent. Sensor is super responsive."
  },
  {
    title: "Great battery timing",
    comment: "Battery easily lasts over a week with daily gaming and work. Charging cable included is also flexible."
  },
  {
    title: "Lightweight & snappy clicks",
    comment: "Mouse feels super light in hand. Clicks feel crisp and side buttons are positioned nicely for thumb grip."
  },
  {
    title: "Aim feels smoother in FPS",
    comment: "Upgraded from a heavy mouse. Aim tracking in Valorant has improved noticeably. Glides smoothly on mouse pad."
  },
  {
    title: "Super comfortable shape",
    comment: "Shape fits my claw grip perfectly. Coating handles palm sweat well during summer gaming sessions."
  },
  {
    title: "Fast delivery in Islamabad",
    comment: "Original factory sealed box delivered in 2 days. Wireless dongle was safely tucked in the storage compartment."
  },
  {
    title: "Solid build quality",
    comment: "Lightweight structure but body feels solid. No shell creaking even when squeezing tightly."
  },
  {
    title: "Flawless optical sensor",
    comment: "Sensor doesn't spin out at all on fast high DPI flicks. Scroll wheel steps feel tactile and defined."
  },
  {
    title: "Kaafi acha wireless mouse",
    comment: "Abhi tak experience bohot zabardast raha. Battery life bhi achi hai aur weight kaafi light hai."
  },
  {
    title: "Value for money wireless",
    comment: "Price ke hisaab se sensor aur wireless connection top tier hai. Delivered safely with original warranty."
  }
];

// 3. WIRED MOUSE REVIEWS (NO battery mention!)
const MOUSE_WIRED_REVIEWS = [
  {
    title: "Paracord cable is super light",
    comment: "Cable is light and flexible, almost feels like using a wireless mouse. Sensor tracking is spot on."
  },
  {
    title: "Crisp click feedback",
    comment: "Left and right clicks feel very tactile and responsive. No mushy feeling or double-click issues."
  },
  {
    title: "Perfect for palm & claw grip",
    comment: "Shape is ergonomic and comfortable for long Valorant sessions. Side buttons have nice tactile travel."
  },
  {
    title: "Smooth glide & great sensor",
    comment: "Stock PTFE feet glide effortlessly. Sensor handles fast flicks without any spin-outs or jitter."
  },
  {
    title: "Acha wired gaming mouse",
    comment: "Price ke hisaab se build quality aur sensor performance bohot zabardast hai. Delivered safely to Karachi."
  },
  {
    title: "Solid weight and balance",
    comment: "Weight distribution is well balanced. Scroll wheel steps feel crisp when switching weapons in game."
  },
  {
    title: "Original item with brand warranty",
    comment: "Came in original box with serial number. ReviveTech team confirmed warranty details on WhatsApp beforehand."
  },
  {
    title: "Ergonomic & comfortable",
    comment: "Fits my hand comfortably without causing wrist strain during long work or gaming hours."
  },
  {
    title: "Fast shipping to Rawalpindi",
    comment: "Ordered on Tuesday, received on Thursday. Original box with bubble wrap protection."
  },
  {
    title: "Good response in competitive games",
    comment: "Response time is immediate. Sensor tracks cleanly on both cloth and hybrid mouse pads."
  }
];

// 4. KEYBOARD REVIEWS
const KEYBOARD_REVIEWS = [
  {
    title: "Satisfying typing sound & feel",
    comment: "Typing feel on this keyboard is super smooth. Sound profile is clean without any annoying metallic ping."
  },
  {
    title: "Stabilizers are surprisingly clean",
    comment: "Spacebar and enter keys have zero rattle out of the box. Factory lubing on stabs is decent."
  },
  {
    title: "Compact layout saves desk space",
    comment: "Form factor gives so much extra desk room for mouse movement. Solid casing with good weight."
  },
  {
    title: "Fast response in games",
    comment: "Instant keystroke response in competitive games. Keycaps have nice texture that doesn't get greasy easily."
  },
  {
    title: "Great build quality for the price",
    comment: "Case feels heavy and sturdy with no flex. Keycaps feel durable and legend printing is clear."
  },
  {
    title: "Original keyboard received in Lahore",
    comment: "Delivered in 2 days safely wrapped in bubble wrap. All keys working perfectly."
  },
  {
    title: "Comfortable for typing & coding",
    comment: "Using this for typing and gaming daily. Wrist fatigue is noticeably less compared to my old membrane board."
  },
  {
    title: "Smooth key travel",
    comment: "Keypress travel feels consistent across all switches. Key caps feel solid and nicely sculpted."
  },
  {
    title: "Boht acha keyboard hai",
    comment: "Overall quality bohot zabardast hai. Build solid hai aur typing experience bohot comfortable hai."
  },
  {
    title: "Worth every rupee",
    comment: "Upgraded from a basic keyboard and the difference in key feel and gaming experience is massive."
  }
];

// 5. MONITOR REVIEWS
const MONITOR_REVIEWS = [
  {
    title: "Zero dead pixels & crisp display",
    comment: "Screen arrived in perfect condition with zero dead pixels or backlight bleed. Colors look very vibrant."
  },
  {
    title: "Smooth motion in games",
    comment: "High refresh rate makes a huge difference in motion. Scrolling and gaming feel buttery smooth."
  },
  {
    title: "Great contrast & wide viewing angles",
    comment: "Panel clarity is excellent for both work and gaming. Viewing angles are solid from the sides."
  },
  {
    title: "Solid adjustable stand",
    comment: "Build quality of the monitor and stand is solid. Tilt adjustment is smooth and holds position firmly."
  },
  {
    title: "Safely packed and delivered to Karachi",
    comment: "Was anxious about shipping a monitor, but packaging was super safe with thick protective foam."
  },
  {
    title: "Great value for money screen",
    comment: "Incredible display clarity for the price. Text looks sharp and gaming visuals look rich."
  },
  {
    title: "No ghosting in fast scenes",
    comment: "Response time is snappy with minimal motion blur in FPS games. Great addition to my setup."
  },
  {
    title: "Display quality boht achi hai",
    comment: "Colors and sharpness bohot achi hain. Gaming aur daily office work dono ke liye perfect hai."
  },
  {
    title: "Bright display with clean matte finish",
    comment: "Screen gets plenty bright and the anti-glare matte coating works great in bright rooms."
  },
  {
    title: "Smooth 100% satisfied purchase",
    comment: "Customer support verified screen specs on WhatsApp before dispatch. Delivered in 2 days."
  }
];

// 6. AUDIO / HEADPHONE REVIEWS
const AUDIO_REVIEWS = [
  {
    title: "Crisp directional sound for gaming",
    comment: "Audio staging is clear—can pinpoint footstep directions easily in competitive FPS shooters."
  },
  {
    title: "Comfortable ear padding for long hours",
    comment: "Cushions are soft and don't exert excessive clamping force. Can wear these for long sessions easily."
  },
  {
    title: "Deep punchy bass & clear vocals",
    comment: "Sound signature is well balanced with clean mids and decent bass punch without distortion."
  },
  {
    title: "Microphone output is clear",
    comment: "Friends on Discord said my voice sounded clear without background hum. Cable is sturdy as well."
  },
  {
    title: "Good noise isolation",
    comment: "Blocks room fan and ambient noise well so I can focus on music and gaming."
  },
  {
    title: "Authentic product received in Rawalpindi",
    comment: "Original product with verified brand seal. Delivery took just 2 days."
  },
  {
    title: "Sound quality boht achi hai",
    comment: "Music aur gaming dono ke liye sound output bohot clear hai. Clarity and bass balanced hain."
  },
  {
    title: "Durable build & good cable",
    comment: "Build material feels durable. Joints and connectors feel strong and built to last."
  },
  {
    title: "Great IEM / Audio clarity",
    comment: "Vocals are crisp and high frequencies don't sound harsh at high volume levels."
  },
  {
    title: "Best audio gear in this range",
    comment: "Checked prices across local stores and ReviveTech had the best price with original warranty."
  }
];

// 7. COMPONENT REVIEWS (GPU, CPU, Cooler, Power Supply, Case)
const COMPONENT_REVIEWS = [
  {
    title: "Temps stay cold under heavy load",
    comment: "Installed easily in my ATX case. Temperatures stay low even during peak summer load in Lahore."
  },
  {
    title: "Quiet fans & solid build",
    comment: "Fans run quietly under normal load and there is no coil whine. Performance is rock solid."
  },
  {
    title: "Big performance boost",
    comment: "Noticeable jump in gaming benchmarks and frame rates. Everything runs smooth and stable."
  },
  {
    title: "Easy installation & clean fit",
    comment: "Fits well with clean clearance for RAM slots and PCIe lanes. Packaging was solid."
  },
  {
    title: "Packed securely with fragile stickers",
    comment: "Box arrived in pristine condition with heavy bubble wrapping. Verified original brand serial."
  },
  {
    title: "Performance boht zabardast hai",
    comment: "System benchmark score kafi boost hua hai. Heating issues bilkul nahi hain."
  },
  {
    title: "Solid power efficiency & stability",
    comment: "Runs stable under full synthetic stress tests. Voltage delivery is clean and quiet."
  },
  {
    title: "Clean aesthetic for PC build",
    comment: "Build quality feels high grade. Matches the rest of my PC components cleanly."
  },
  {
    title: "Genuine product with brand warranty",
    comment: "Came factory sealed with official warranty card. Delivered quickly in Islamabad."
  },
  {
    title: "Worth the upgrade",
    comment: "Upgraded my older hardware and the system responsiveness in games and rendering is great."
  }
];

// 8. STORAGE & MEMORY REVIEWS (RAM, SSD, NVMe)
const MEMORY_REVIEWS = [
  {
    title: "XMP profile loaded instantly",
    comment: "Plugged into motherboard and enabled XMP in BIOS. Running at full advertised speed without issues."
  },
  {
    title: "Super fast boot and game loading",
    comment: "Windows boots up in seconds and game level loading times are almost instantaneous now."
  },
  {
    title: "Stable performance under stress test",
    comment: "Ran memory and drive benchmarks for hours, zero errors or thermal throttling. Genuine module."
  },
  {
    title: "Smooth multitasking",
    comment: "Chrome tabs, Discord, and heavy games all running smoothly together without stuttering."
  },
  {
    title: "Speed kafi fast hai",
    comment: "Install bohot easy tha. System boot and game loading times mein kafi farq aya hai."
  },
  {
    title: "Original heatspreader / casing quality",
    comment: "Build quality is clean and stays cool during long gaming sessions inside the case."
  },
  {
    title: "Safe packaging & quick shipping",
    comment: "Received in 2 days in Faisalabad. Packed carefully with static-safe bubble wrap."
  },
  {
    title: "Value for money storage/memory upgrade",
    comment: "Best price in Pakistan for genuine RAM/SSD. Solved my system lag completely."
  }
];

// 9. GENERAL REVIEWS (Fallback for general items)
const GENERAL_REVIEWS = [
  {
    title: "Good quality & fast delivery",
    comment: "Received within 2 days in Islamabad. Packaging was safe and build quality is solid."
  },
  {
    title: "Worth the price",
    comment: "Simple and functional. Matches my desk setup well and feels durable."
  },
  {
    title: "Good customer support",
    comment: "Store team answered my queries on WhatsApp before ordering. Smooth delivery experience."
  },
  {
    title: "Clean finish & solid material",
    comment: "Material feels nice and sturdy. Overall a very good purchase."
  },
  {
    title: "Packaging boht achi thi",
    comment: "Parcel 2 din mein mil gaya Lahore mein. Quality expectations ke mutabiq hai."
  },
  {
    title: "Recommended store in Pakistan",
    comment: "Bought multiple items from ReviveTech now, always genuine products with good service."
  }
];

function cyrb53(str: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

function createRng(seedStr: string) {
  let s = cyrb53(seedStr);
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function getProductReviews(product: {
  id?: string;
  handle: string;
  title?: string;
  description?: string;
  productType?: string;
  tags?: string[];
}): ProductReviewSummary {
  const seed = product.handle || product.id || "default-product";
  const rng = createRng(seed);

  // Analyze Product Context
  const titleText = (product.title || "").toLowerCase();
  const descText = (product.description || "").toLowerCase();
  const typeText = (product.productType || "").toLowerCase();
  const tagsText = (product.tags || []).join(" ").toLowerCase();
  const handleText = (product.handle || "").toLowerCase();

  const fullText = `${handleText} ${titleText} ${typeText} ${tagsText} ${descText}`;

  // Strict Category Flags
  const isMousePad =
    /\b(mousepad|mouse pad|deskmat|desk mat|extended pad|mouse mat)\b/i.test(fullText) ||
    (/\bpad\b/i.test(fullText) && !/\b(gamepad|ipad|keypad|launchpad)\b/i.test(fullText));

  const isWireless = /\b(wireless|bluetooth|2\.4g|rechargeable|battery)\b/i.test(fullText);

  const isMouse =
    (/\b(mouse|mice)\b/i.test(fullText) ||
      /deathadder|g502|viper|superlight|g305|basilisk|aerox|master 3s/i.test(fullText)) &&
    !isMousePad;

  const isKeyboard =
    /\b(keyboard|keeb|keycap|switches|switch|hot-swap|mechanical)\b/i.test(fullText) &&
    !isMouse &&
    !isMousePad;

  const isMonitor = /\b(monitor|screen|display|panel|144hz|240hz|165hz|ips|oled)\b/i.test(fullText);

  const isAudio = /\b(headset|headphone|earbud|earphone|iem|audio|speaker|sound|mic|microphone)\b/i.test(fullText);

  const isComponent = /\b(gpu|graphics|rtx|gtx|card|cooler|fan|psu|power supply|case|motherboard|cpu|processor)\b/i.test(fullText);

  const isMemory = /\b(ram|ddr4|ddr5|memory|ssd|nvme|drive|storage)\b/i.test(fullText);

  const hasRgb = /\b(rgb|backlit|lighting|led)\b/i.test(fullText);

  // Select Primary Pool
  let primaryPool = GENERAL_REVIEWS;
  if (isMousePad) {
    primaryPool = MOUSE_PAD_REVIEWS;
  } else if (isMouse) {
    primaryPool = isWireless ? MOUSE_WIRELESS_REVIEWS : MOUSE_WIRED_REVIEWS;
  } else if (isKeyboard) {
    primaryPool = KEYBOARD_REVIEWS;
  } else if (isMonitor) {
    primaryPool = MONITOR_REVIEWS;
  } else if (isAudio) {
    primaryPool = AUDIO_REVIEWS;
  } else if (isComponent) {
    primaryPool = COMPONENT_REVIEWS;
  } else if (isMemory) {
    primaryPool = MEMORY_REVIEWS;
  }

  // Strict Filter for Impossible / Mismatched Specs
  const safePool = primaryPool.filter((t) => {
    const text = (t.title + " " + t.comment).toLowerCase();

    // Mouse pads MUST NEVER mention battery, charging, wireless, switches, screen, refresh rate
    if (isMousePad) {
      if (
        /battery|charge|charging|wireless|bluetooth|screen|display|refresh|hz|switch|switches|ram|processor|fps|motion is fast/i.test(
          text
        )
      ) {
        return false;
      }
    }

    // Wired devices MUST NEVER mention battery or wireless
    if (!isWireless) {
      if (/battery|charge|charging|wireless|bluetooth|dongle/i.test(text)) {
        return false;
      }
    }

    // Non-RGB items MUST NEVER mention RGB
    if (!hasRgb) {
      if (/\brgb\b|backlit|lighting/i.test(text)) {
        return false;
      }
    }

    return true;
  });

  const finalPool = safePool.length >= 3 ? safePool : GENERAL_REVIEWS;

  // Determine review count (between 5 and 9)
  const totalCount = 5 + Math.floor(rng() * 5);

  // Helper shuffle
  const shuffleArray = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const shuffledNames = shuffleArray([...PAKISTANI_NAMES]);
  const shuffledCities = shuffleArray([...CITIES]);
  const shuffledTemplates = shuffleArray([...finalPool]);

  const reviews: ProductReview[] = [];
  let ratingSum = 0;
  const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  for (let i = 0; i < totalCount; i++) {
    const name = shuffledNames[i % shuffledNames.length];
    const city = shuffledCities[i % shuffledCities.length];
    const template = shuffledTemplates[i % shuffledTemplates.length];

    // Rating distribution: ~80% 5 stars, ~15% 4 stars, ~5% 3 stars
    const rVal = rng();
    let rating = 5;
    if (rVal > 0.95) {
      rating = 3;
    } else if (rVal > 0.8) {
      rating = 4;
    }

    ratingSum += rating;
    ratingBreakdown[rating as keyof typeof ratingBreakdown] += 1;

    const dateIdx = Math.floor(rng() * RELATIVE_DATES.length);
    const date = RELATIVE_DATES[dateIdx];

    reviews.push({
      id: `rev_${product.handle}_${i}`,
      author: name,
      location: city,
      rating,
      title: template.title,
      comment: template.comment,
      date,
      verified: true,
    });
  }

  const averageRating = parseFloat((ratingSum / totalCount).toFixed(1));

  return {
    reviews,
    averageRating,
    totalReviews: totalCount,
    ratingBreakdown,
  };
}
