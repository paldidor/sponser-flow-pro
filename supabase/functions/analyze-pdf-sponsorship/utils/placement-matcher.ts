/**
 * Placement Matcher Utility
 * Provides comprehensive synonym mapping and fuzzy matching for sponsorship placements
 * Zero-risk enhancement: runs AFTER packages are extracted, only standardizes naming
 */

export interface PlacementMatch {
  standardName: string;
  category: string;
  confidence: 'high' | 'medium' | 'low';
  matchedSynonym?: string;
}

/**
 * Comprehensive placement synonym mapping organized by category
 * Each key is a standardized placement name, values are synonym arrays
 */
export const PLACEMENT_SYNONYMS: Record<string, { category: string; synonyms: string[] }> = {
  // A) Digital & Web
  'Website Logo & Link': {
    category: 'Digital & Web',
    synonyms: ['website logo', 'sponsor page', 'partners page', 'sponsor listing', 'featured logo', 
               'homepage logo', 'footer logo', 'header logo', 'clickable logo', 'website link', 
               'backlink', 'do-follow link', 'web logo', 'site logo']
  },
  'Dedicated Sponsor Page': {
    category: 'Digital & Web',
    synonyms: ['sponsor profile', 'dedicated page', 'sponsor spotlight page', 'brand story page', 
               'landing page on club site', 'sponsor bio', 'partner profile page']
  },
  'Blog Feature': {
    category: 'Digital & Web',
    synonyms: ['blog post', 'feature article', 'editorial', 'write-up', 'story highlight', 
               'interview', 'blog spotlight', 'article feature']
  },
  'Newsletter Feature': {
    category: 'Digital & Web',
    synonyms: ['email newsletter', 'edm', 'e-blast', 'club email', 'mailout', 'e-bulletin', 
               'campaign email', 'shout in email', 'email highlight', 'newsletter mention']
  },
  'App Placement': {
    category: 'Digital & Web',
    synonyms: ['app placement', 'teamsnap tile', 'league app', 'push notification', 'in-app banner', 
               'mobile app listing', 'app feature', 'mobile placement']
  },
  'Digital Ad Rotation': {
    category: 'Digital & Web',
    synonyms: ['banner ad', 'leaderboard', 'MPU', 'rectangle', 'display ad', 'rotation', 
               'impression package', 'CPM buy', 'digital banner', 'web ad']
  },

  // B) Social Media
  'Social Media Announcement': {
    category: 'Social Media',
    synonyms: ['announcement post', 'welcome post', 'thank-you post', 'sponsor shoutout', 
               'partner intro', 'social announcement', 'welcome announcement']
  },
  'Social Media Spotlight Series': {
    category: 'Social Media',
    synonyms: ['sponsor spotlight', 'feature friday', 'monthly feature', 'partner profile', 
               'story series', 'spotlight series', 'featured partner']
  },
  'Social Media Story Mentions': {
    category: 'Social Media',
    synonyms: ['instagram story', 'reels', 'tiktok', 'facebook story', 'highlights', 'swipe-up', 
               'tag/mention', 'story mention', 'ig story', 'story highlight']
  },
  'Social Content Production': {
    category: 'Social Media',
    synonyms: ['club-produced content', 'creative asset creation', 'reel production', 'video feature', 
               'content package', 'content creation', 'produced content']
  },
  'Influencer/Player Post': {
    category: 'Social Media',
    synonyms: ['player feature', 'coach mention', 'ambassador post', 'takeover', 'UGC', 
               'player post', 'athlete post', 'influencer content']
  },

  // C) Email & CRM
  'Email Mention': {
    category: 'Email & CRM',
    synonyms: ['email mention', 'email footer logo', 'sponsor blurb in email', 'email logo', 
               'footer mention']
  },
  'Dedicated Email': {
    category: 'Email & CRM',
    synonyms: ['solo email', 'dedicated e-blast', 'sponsored email', 'standalone email', 
               'exclusive email']
  },
  'Email Coupon/Offer': {
    category: 'Email & CRM',
    synonyms: ['promo code', 'coupon', 'offer insert', 'redemption link', 'call-to-action in email', 
               'email promo', 'discount code']
  },

  // D) On-Site Signage & Facilities
  'Fence Banner (Standard)': {
    category: 'On-Site Signage',
    synonyms: ['outfield banner', 'field fence sign', '3x5 banner', '4x6 banner', 'mesh banner', 
               'vinyl banner', 'fence sign', 'field banner', 'perimeter banner']
  },
  'Fence Banner (Premium)': {
    category: 'On-Site Signage',
    synonyms: ['premier location', 'home plate', 'prime placement', 'backstop banner', 
               'high-traffic spot', 'premium banner', 'premium location']
  },
  'Scoreboard Panel': {
    category: 'On-Site Signage',
    synonyms: ['scoreboard sign', 'scoreboard panel', 'top panel', 'bottom panel', 'side panel', 
               'digital scoreboard ad', 'scoreboard logo', 'scoreboard placement']
  },
  'Entrance/Welcome Sign': {
    category: 'On-Site Signage',
    synonyms: ['entrance banner', 'welcome arch', 'gate sign', 'parking entry sign', 'entry sign', 
               'welcome banner']
  },
  'Dugout/Seating Branding': {
    category: 'On-Site Signage',
    synonyms: ['dugout sign', 'bench wrap', 'bleacher branding', 'sideline board', 'dugout banner', 
               'bench branding', 'seating area sign']
  },
  'Field Naming Rights': {
    category: 'On-Site Signage',
    synonyms: ['field naming', 'court naming', 'rink naming', 'pitch naming', 'complex naming', 
               'facility naming', 'stadium naming', 'venue naming']
  },
  'Wayfinding/Site Map': {
    category: 'On-Site Signage',
    synonyms: ['directional signage', 'site map logo', 'field map placement', 'wayfinding sign', 
               'venue map']
  },

  // E) Uniforms, Apparel & Equipment
  'Jersey Front Logo': {
    category: 'Uniforms & Apparel',
    synonyms: ['front-of-jersey', 'chest logo', 'kit front', 'primary jersey sponsor', 'jersey front', 
               'front logo', 'chest placement']
  },
  'Jersey Back Logo': {
    category: 'Uniforms & Apparel',
    synonyms: ['back-of-jersey', 'number panel', 'nameplate area logo', 'jersey back', 'back logo']
  },
  'Sleeve/Shoulder Patch': {
    category: 'Uniforms & Apparel',
    synonyms: ['sleeve patch', 'shoulder patch', 'arm logo', 'sleeve logo', 'shoulder logo']
  },
  'Shorts/Pants Logo': {
    category: 'Uniforms & Apparel',
    synonyms: ['shorts logo', 'leg logo', 'thigh logo', 'pants logo', 'short branding']
  },
  'Training Jersey': {
    category: 'Uniforms & Apparel',
    synonyms: ['practice jersey', 'training top', 'warm-up tee', 'practice gear', 'training kit']
  },
  'Coaches Gear': {
    category: 'Uniforms & Apparel',
    synonyms: ['coach polo', 'staff jacket', 'bench apparel', 'coaching staff gear', 'staff uniform']
  },
  'Team Apparel/Merch': {
    category: 'Uniforms & Apparel',
    synonyms: ['hoodie', 'hat', 'cap', 'beanie', 'scarf', 'bag', 'water bottle', 'towel', 'lanyard', 
               'merchandise', 'team merch', 'fan gear']
  },
  'Equipment Branding': {
    category: 'Uniforms & Apparel',
    synonyms: ['goals', 'nets', 'balls', 'cones', 'water coolers', 'tents', 'benches', 
               "scorer's table", 'equipment logo', 'gear branding']
  },

  // F) Events & Activations
  'Title Sponsor': {
    category: 'Events & Activations',
    synonyms: ['title sponsor', 'naming sponsor', 'presented by', 'headline sponsor', 'title partner']
  },
  'Presenting Sponsor': {
    category: 'Events & Activations',
    synonyms: ['presenting partner', 'supporting sponsor', 'powered by', 'event sponsor']
  },
  'Event Booth Space': {
    category: 'Events & Activations',
    synonyms: ['booth', 'vendor table', 'tent space', 'activation space', 'pop-up', 'kiosk', 
               'vendor booth', 'exhibition space']
  },
  'Sampling/Product Trial': {
    category: 'Events & Activations',
    synonyms: ['sampling', 'product seeding', 'giveaway', 'coupon handout', 'swag distribution', 
               'product demo', 'free samples']
  },
  'On-Field Promotion': {
    category: 'Events & Activations',
    synonyms: ['on-field activation', 'half-time promo', 'time-out feature', 'ceremonial first pitch', 
               'ceremonial first kick', 'on-field activity', 'halftime activation']
  },
  'PA Announcements': {
    category: 'Events & Activations',
    synonyms: ['public address mention', 'in-game read', 'stadium read', 'MC recognition', 
               'announcer mention', 'PA mention']
  },
  'Tickets/Entries': {
    category: 'Events & Activations',
    synonyms: ['comp tickets', 'passes', 'tournament entries', 'foursome', 'hospitality passes', 
               'complimentary tickets', 'guest passes']
  },
  'Stage/Mike Time': {
    category: 'Events & Activations',
    synonyms: ['speaking opportunity', 'stage recognition', 'award presenter', 'check presentation', 
               'mic time', 'speaking slot']
  },
  'Photo Ops/Backdrop': {
    category: 'Events & Activations',
    synonyms: ['step-and-repeat', 'media wall', 'photo booth branding', 'photo backdrop', 
               'photo opportunity', 'branded backdrop']
  },
  'Event Asset Logo': {
    category: 'Events & Activations',
    synonyms: ['event t-shirt', 'wristband', 'credentials', 'bib', 'badge', 'lanyard', 
               'event merchandise', 'event gear']
  },

  // G) Community, Goodwill & Recognition
  'Plaque/Certificate': {
    category: 'Community & Recognition',
    synonyms: ['thank-you plaque', 'framed team photo', 'certificate of appreciation', 
               'recognition plaque', 'award', 'commemorative plaque']
  },
  'Community Partner Recognition': {
    category: 'Community & Recognition',
    synonyms: ['community partner', 'youth supporter', 'scholarship supporter', 'community sponsor', 
               'local partner']
  },
  'Team Sponsorship': {
    category: 'Community & Recognition',
    synonyms: ['team naming', 'team sponsor', 'name on team shirts', 'rec league sponsor', 
               'youth team sponsor']
  },

  // H) Content & Rights
  'Content Usage Rights': {
    category: 'Content & Rights',
    synonyms: ['content rights', 'likeness usage', 'logo lock-up usage', 'co-branding rights', 
               'brand usage', 'image rights']
  },
  'Photo/Video Deliverables': {
    category: 'Content & Rights',
    synonyms: ['photo set', 'highlight video', 'recap video', 'sizzle reel', 'video deliverable', 
               'content package']
  },
  'Case Study/Testimonial': {
    category: 'Content & Rights',
    synonyms: ['case study', 'testimonial', 'success story', 'quote approval', 'sponsor testimonial']
  },

  // I) Offers, Commerce & Lead Gen
  'Coupon/Redemption': {
    category: 'Offers & Commerce',
    synonyms: ['coupon distribution', 'offer code', 'discount flyer', 'QR redemption', 
               'promo code', 'discount code']
  },
  'Lead Capture': {
    category: 'Offers & Commerce',
    synonyms: ['lead form', 'email capture', 'sweepstakes', 'contest', 'giveaway entries', 
               'sign-up sheet', 'lead generation']
  },
  'On-Site Sales': {
    category: 'Offers & Commerce',
    synonyms: ['merch table', 'retail booth', 'product sales permission', 'vendor sales', 
               'on-site retail']
  },
};

/**
 * Normalize text for comparison (lowercase, remove extra spaces, common symbols)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[×x]/g, 'x') // Normalize multiplication symbols
    .replace(/[''""`]/g, '') // Remove quotes
    .replace(/[\/\-_]/g, ' ') // Convert separators to spaces
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
}

/**
 * Calculate similarity score between two strings (simple word overlap)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.split(' '));
  const words2 = new Set(str2.split(' '));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

/**
 * Find the best matching standardized placement for a raw placement string
 * Returns null if no confident match is found
 */
export function matchPlacement(rawPlacement: string): PlacementMatch | null {
  const normalized = normalizeText(rawPlacement);
  
  let bestMatch: PlacementMatch | null = null;
  let bestScore = 0;

  // Iterate through all standardized placements
  for (const [standardName, { category, synonyms }] of Object.entries(PLACEMENT_SYNONYMS)) {
    for (const synonym of synonyms) {
      const normalizedSynonym = normalizeText(synonym);
      
      // Check for exact match
      if (normalized === normalizedSynonym) {
        return {
          standardName,
          category,
          confidence: 'high',
          matchedSynonym: synonym
        };
      }
      
      // Check for substring match (either direction)
      if (normalized.includes(normalizedSynonym) || normalizedSynonym.includes(normalized)) {
        const score = normalizedSynonym.length / Math.max(normalized.length, normalizedSynonym.length);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = {
            standardName,
            category,
            confidence: score > 0.8 ? 'high' : 'medium',
            matchedSynonym: synonym
          };
        }
      }
      
      // Check for word overlap similarity
      const similarity = calculateSimilarity(normalized, normalizedSynonym);
      if (similarity > 0.6 && similarity > bestScore * 0.9) {
        bestScore = similarity;
        bestMatch = {
          standardName,
          category,
          confidence: similarity > 0.8 ? 'high' : 'low',
          matchedSynonym: synonym
        };
      }
    }
  }

  // Only return matches with reasonable confidence
  return bestScore > 0.5 ? bestMatch : null;
}

/**
 * Batch match multiple placements and return statistics
 */
export function batchMatchPlacements(rawPlacements: string[]): {
  matches: Array<{ raw: string; match: PlacementMatch | null }>;
  stats: {
    total: number;
    matched: number;
    highConfidence: number;
    mediumConfidence: number;
    lowConfidence: number;
    unmatched: number;
  };
} {
  const matches = rawPlacements.map(raw => ({
    raw,
    match: matchPlacement(raw)
  }));

  const stats = {
    total: rawPlacements.length,
    matched: matches.filter(m => m.match !== null).length,
    highConfidence: matches.filter(m => m.match?.confidence === 'high').length,
    mediumConfidence: matches.filter(m => m.match?.confidence === 'medium').length,
    lowConfidence: matches.filter(m => m.match?.confidence === 'low').length,
    unmatched: matches.filter(m => m.match === null).length,
  };

  return { matches, stats };
}
