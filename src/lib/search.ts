import { BlogArticle, Collection, Product } from "../types";

export interface FieldIndex {
  normalized: string;
  baseTokens: string[];
  exactTokens: Set<string>;
  wordTokens: string[];
  compact: string;
  wordStartOffsets: Set<number>;
}

export interface ProductSearchIndex {
  title: FieldIndex;
  sku: FieldIndex;
  vendor: FieldIndex;
  handle: FieldIndex;
  productType: FieldIndex;
  variants: FieldIndex;
  tags: FieldIndex;
  description: FieldIndex;
  allCompactFields: FieldIndex[];
}

export interface ParsedSearchQuery {
  raw: string;
  normalized: string;
  tokens: string[];
  compact: string;
}

const SEPARATORS_RE = /[-_/\\.,:;+&()[\]{}'"’|!?\u2013\u2014]+/g;
const WHITESPACE_RE = /\s+/g;
const HTML_TAG_RE = /<[^>]*>/g;
const DIGIT_RE = /^\d$/;

/**
 * Normalizes any text (product field or user query) by applying NFKC normalization,
 * stripping HTML if present, converting punctuation/symbols into spaces, lowercasing,
 * and collapsing whitespace.
 */
export function normalizeSearchText(input?: string | null): string {
  if (!input) return "";
  let text = String(input).normalize("NFKC");
  if (text.includes("<") && text.includes(">")) {
    text = text.replace(HTML_TAG_RE, " ");
  }
  return text
    .toLowerCase()
    .replace(SEPARATORS_RE, " ")
    .replace(WHITESPACE_RE, " ")
    .trim();
}

/**
 * Splits a raw word segment on camelCase / PascalCase boundaries without destroying acronyms.
 * e.g. "AttackShark" -> ["Attack", "Shark"], "iPhone16Pro" -> ["i", "Phone16", "Pro"]
 */
function splitCamelCaseSegments(word: string): string[] {
  const spaced = word
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");
  return spaced.split(/\s+/).filter(Boolean);
}

/**
 * Splits a lowercased alphanumeric token cleanly across digit->letter and letter<->digit boundaries
 * while preserving meaningful model codes like "x98" from "x98pro".
 */
function expandAlphanumericSubtokens(token: string): {
  digitToLetter: string[];
  letterDigit: string[];
} {
  // Digit -> Letter: "x98pro" -> ["x98", "pro"], "8000hz" -> ["8000", "hz"]
  const digitToLetter = token
    .replace(/(\d)([a-z])/g, "$1 $2")
    .split(" ")
    .filter(Boolean);

  // Any Digit <-> Letter transition: "x98pro" -> ["x", "98", "pro"], "rtx5090" -> ["rtx", "5090"]
  const letterDigit = token
    .replace(/(\d)([a-z])/g, "$1 $2")
    .replace(/([a-z])(\d)/g, "$1 $2")
    .split(" ")
    .filter(Boolean);

  return { digitToLetter, letterDigit };
}

/**
 * Builds a pre-tokenized, boundary-aware search index for a single text field.
 */
export function buildFieldIndex(rawInput?: string | null): FieldIndex {
  if (!rawInput) {
    return {
      normalized: "",
      baseTokens: [],
      exactTokens: new Set<string>(),
      wordTokens: [],
      compact: "",
      wordStartOffsets: new Set<number>(),
    };
  }

  let cleanedRaw = String(rawInput).normalize("NFKC");
  if (cleanedRaw.includes("<") && cleanedRaw.includes(">")) {
    cleanedRaw = cleanedRaw.replace(HTML_TAG_RE, " ");
  }

  const rawChunks = cleanedRaw
    .replace(SEPARATORS_RE, " ")
    .replace(WHITESPACE_RE, " ")
    .trim()
    .split(" ")
    .filter(Boolean);

  const baseTokens: string[] = [];
  const exactTokens = new Set<string>();
  const wordTokenSet = new Set<string>();
  const compactParts: string[] = [];
  const wordStartOffsets = new Set<number>();

  let currentOffset = 0;

  for (const chunk of rawChunks) {
    const lowerChunk = chunk.toLowerCase();
    baseTokens.push(lowerChunk);
    exactTokens.add(lowerChunk);
    wordTokenSet.add(lowerChunk);

    // Track structural segments inside this chunk for safe compact word-start matching
    const camelParts = splitCamelCaseSegments(chunk);
    let chunkTrackedInCompact = false;

    for (const cPart of camelParts) {
      const lowerCamel = cPart.toLowerCase();
      if (lowerCamel !== lowerChunk) {
        exactTokens.add(lowerCamel);
        wordTokenSet.add(lowerCamel);
      }

      const { digitToLetter, letterDigit } = expandAlphanumericSubtokens(lowerCamel);

      for (const dPart of digitToLetter) {
        exactTokens.add(dPart);
        wordTokenSet.add(dPart);
        wordStartOffsets.add(currentOffset);
        compactParts.push(dPart);
        currentOffset += dPart.length;
        chunkTrackedInCompact = true;
      }

      for (const ldPart of letterDigit) {
        exactTokens.add(ldPart);
        if (ldPart.length >= 2) {
          wordTokenSet.add(ldPart);
        }
      }
    }

    if (!chunkTrackedInCompact) {
      wordStartOffsets.add(currentOffset);
      compactParts.push(lowerChunk);
      currentOffset += lowerChunk.length;
    }
  }

  // Add adjacent token n-grams (2-grams & 3-grams) so concatenated queries like
  // "attackshark" or "rtx5090" or "x98pro" match spaced fields cleanly.
  for (let i = 0; i < baseTokens.length; i++) {
    const t1 = baseTokens[i];
    if (i + 1 < baseTokens.length) {
      const t2 = baseTokens[i + 1];
      const bi = t1 + t2;
      exactTokens.add(bi);
      wordTokenSet.add(bi);

      // Also merge first token + digitToLetter prefix of next token if applicable
      // e.g. "shark" + "x98" from "SHARK X98PRO" -> "sharkx98"
      const nextSub = expandAlphanumericSubtokens(t2).digitToLetter[0];
      if (nextSub && nextSub !== t2) {
        exactTokens.add(t1 + nextSub);
        wordTokenSet.add(t1 + nextSub);
      }
    }
    if (i + 2 < baseTokens.length) {
      const tri = baseTokens[i] + baseTokens[i + 1] + baseTokens[i + 2];
      exactTokens.add(tri);
      wordTokenSet.add(tri);
    }
  }

  return {
    normalized: baseTokens.join(" "),
    baseTokens,
    exactTokens,
    wordTokens: Array.from(wordTokenSet),
    compact: compactParts.join(""),
    wordStartOffsets,
  };
}

/**
 * Parses and normalizes a user search query into canonical logical tokens.
 * Handles mixed casing, punctuation, extra whitespace, and isolated letter+number spacing (e.g. "x 98" -> "x98").
 */
export function parseSearchQuery(query: string): ParsedSearchQuery {
  const normalized = normalizeSearchText(query);
  if (!normalized) {
    return { raw: query, normalized: "", tokens: [], compact: "" };
  }

  const rawTokens = normalized.split(" ").filter(Boolean);
  const mergedTokens: string[] = [];

  for (let i = 0; i < rawTokens.length; i++) {
    const curr = rawTokens[i];
    const next = rawTokens[i + 1];

    // Merge short alpha model prefix (1-2 chars, e.g. "x", "v", "k", "g", "r", "rx")
    // followed immediately by digits (1-4 digits, e.g. "98", "68", "3", "5090"):
    // "attack shark x 98" -> ["attack", "shark", "x98"]
    if (next && /^[a-z]{1,2}$/.test(curr) && /^\d{1,4}$/.test(next)) {
      mergedTokens.push(curr + next);
      i++;
      continue;
    }

    // Merge numeric value + frequency/unit short suffix: "8000 hz" -> "8000hz"
    if (next && /^\d{1,5}$/.test(curr) && /^(hz|khz|mhz|ghz|mah|mm|ms|dpi)$/.test(next)) {
      mergedTokens.push(curr + next);
      i++;
      continue;
    }

    mergedTokens.push(curr);
  }

  return {
    raw: query,
    normalized: mergedTokens.join(" "),
    tokens: mergedTokens,
    compact: mergedTokens.join(""),
  };
}

/**
 * Checks whether a single token matches a single FieldIndex, returning a match strength:
 * 0 = no match, 1 = compact boundary match, 2 = prefix match, 3 = exact token match
 */
function matchTokenInField(token: string, field: FieldIndex): number {
  if (!field.normalized) return 0;

  // 1. Exact token or n-gram match
  if (field.exactTokens.has(token)) {
    return 3;
  }

  const tokenEndsWithDigit = DIGIT_RE.test(token[token.length - 1]);
  const allowPrefix = token.length >= 2 || /\d/.test(token);

  // 2. Prefix match at word boundaries (digit-boundary safe: "x6" does NOT match "x68")
  if (allowPrefix) {
    for (let i = 0; i < field.wordTokens.length; i++) {
      const wt = field.wordTokens[i];
      if (wt.length > token.length && wt.startsWith(token)) {
        const nextChar = wt[token.length];
        if (tokenEndsWithDigit && DIGIT_RE.test(nextChar)) {
          continue; // Block numeric prefix collisions like x6 matching x68 or r1 matching r11
        }
        return 2;
      }
    }
  }

  // 3. Compact boundary match for concatenated queries (e.g. "attacksharkx98" against "attack shark x98pro")
  if (token.length >= 4 && field.compact.length >= token.length) {
    let searchFrom = 0;
    while (searchFrom <= field.compact.length - token.length) {
      const idx = field.compact.indexOf(token, searchFrom);
      if (idx === -1) break;

      if (field.wordStartOffsets.has(idx)) {
        const afterIdx = idx + token.length;
        const nextChar = afterIdx < field.compact.length ? field.compact[afterIdx] : "";
        if (!(tokenEndsWithDigit && nextChar && DIGIT_RE.test(nextChar))) {
          return 1;
        }
      }
      searchFrom = idx + 1;
    }
  }

  return 0;
}

/**
 * Checks compact full-query boundary match across a field (for concatenated multi-word queries
 * like "ATTACKSHARKX98" against "ATTACK SHARK X98PRO").
 */
function matchCompactQueryInField(compactQuery: string, field: FieldIndex): boolean {
  if (compactQuery.length < 4 || field.compact.length < compactQuery.length) {
    return false;
  }
  const endsWithDigit = DIGIT_RE.test(compactQuery[compactQuery.length - 1]);
  let searchFrom = 0;
  while (searchFrom <= field.compact.length - compactQuery.length) {
    const idx = field.compact.indexOf(compactQuery, searchFrom);
    if (idx === -1) break;

    if (field.wordStartOffsets.has(idx)) {
      const afterIdx = idx + compactQuery.length;
      const nextChar = afterIdx < field.compact.length ? field.compact[afterIdx] : "";
      if (!(endsWithDigit && nextChar && DIGIT_RE.test(nextChar))) {
        return true;
      }
    }
    searchFrom = idx + 1;
  }
  return false;
}

const productIndexCache = new WeakMap<Product, ProductSearchIndex>();

export function getProductSearchIndex(product: Product): ProductSearchIndex {
  const cached = productIndexCache.get(product);
  if (cached) return cached;

  const skuText = (product.variants || [])
    .map((v) => v.sku || "")
    .filter(Boolean)
    .join(" ");

  const variantsText = [
    ...(product.variants || []).map((v) => v.title || ""),
    ...(product.options || []).flatMap((o) => [o.name || "", ...(o.values || [])]),
  ]
    .filter((s) => s && s.toLowerCase() !== "default title")
    .join(" ");

  const tagsText = (product.tags || []).join(" ");

  const title = buildFieldIndex(product.title);
  const sku = buildFieldIndex(skuText);
  const vendor = buildFieldIndex(product.vendor);
  const handle = buildFieldIndex(product.handle);
  const productType = buildFieldIndex(product.productType);
  const variants = buildFieldIndex(variantsText);
  const tags = buildFieldIndex(tagsText);
  const description = buildFieldIndex(product.description);

  const index: ProductSearchIndex = {
    title,
    sku,
    vendor,
    handle,
    productType,
    variants,
    tags,
    description,
    allCompactFields: [title, sku, vendor, handle, productType, variants, tags, description],
  };

  productIndexCache.set(product, index);
  return index;
}

const FIELD_WEIGHTS = {
  title: 100,
  sku: 90,
  vendor: 60,
  handle: 50,
  productType: 40,
  variants: 30,
  tags: 15,
  description: 8,
} as const;

/**
 * Scores a product against a parsed search query.
 * Returns 0 if the product does not match ALL query tokens.
 * Higher score = more relevant (title/SKU/vendor matches strongly outrank tag/description matches).
 */
export function scoreProductSearch(product: Product, parsed: ParsedSearchQuery): number {
  if (parsed.tokens.length === 0) return 1;

  const idx = getProductSearchIndex(product);
  let totalScore = 0;

  for (let i = 0; i < parsed.tokens.length; i++) {
    const token = parsed.tokens[i];
    let bestTokenScore = 0;

    const titleStrength = matchTokenInField(token, idx.title);
    if (titleStrength > 0) {
      bestTokenScore += FIELD_WEIGHTS.title * (titleStrength === 3 ? 1.5 : titleStrength === 2 ? 1.15 : 1.0);
    }

    const skuStrength = matchTokenInField(token, idx.sku);
    if (skuStrength > 0) {
      bestTokenScore += FIELD_WEIGHTS.sku * (skuStrength === 3 ? 1.4 : 1.0);
    }

    const vendorStrength = matchTokenInField(token, idx.vendor);
    if (vendorStrength > 0) {
      bestTokenScore += FIELD_WEIGHTS.vendor * (vendorStrength === 3 ? 1.3 : 1.0);
    }

    const handleStrength = matchTokenInField(token, idx.handle);
    if (handleStrength > 0) {
      bestTokenScore += FIELD_WEIGHTS.handle * (handleStrength === 3 ? 1.2 : 1.0);
    }

    const typeStrength = matchTokenInField(token, idx.productType);
    if (typeStrength > 0) {
      bestTokenScore += FIELD_WEIGHTS.productType;
    }

    const variantStrength = matchTokenInField(token, idx.variants);
    if (variantStrength > 0) {
      bestTokenScore += FIELD_WEIGHTS.variants;
    }

    const tagStrength = matchTokenInField(token, idx.tags);
    if (tagStrength > 0) {
      bestTokenScore += FIELD_WEIGHTS.tags;
    }

    // For description: allow exact/prefix token matches (strength >= 2), skip noisy compact splits inside prose
    const descStrength = matchTokenInField(token, idx.description);
    if (descStrength >= 2 || (parsed.tokens.length === 1 && descStrength >= 1)) {
      bestTokenScore += FIELD_WEIGHTS.description;
    }

    if (bestTokenScore === 0) {
      return 0; // Enforce AND semantics: every query token must match
    }

    totalScore += bestTokenScore;
  }

  // Exact full-phrase or compact title bonus to boost closest canonical matches to the top
  if (parsed.normalized && idx.title.normalized.includes(parsed.normalized)) {
    totalScore += 180;
  } else if (parsed.compact.length >= 4 && matchCompactQueryInField(parsed.compact, idx.title)) {
    totalScore += 140;
  }

  // Boost in-stock products slightly among ties
  if (product.availableForSale) {
    totalScore += 2;
  }

  return totalScore;
}

/**
 * Filters and ranks products by search relevance using the universal normalization engine.
 */
export function searchProducts(products: Product[], query: string): Product[] {
  const parsed = parseSearchQuery(query);
  if (parsed.tokens.length === 0) return products;

  const scored: { product: Product; score: number }[] = [];
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const score = scoreProductSearch(product, parsed);
    if (score > 0) {
      scored.push({ product, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map((item) => item.product);
}

/**
 * Boolean check for filtering a pre-scored or ad-hoc product with an existing ParsedSearchQuery.
 */
export function matchesProductSearch(product: Product, parsed: ParsedSearchQuery): boolean {
  return scoreProductSearch(product, parsed) > 0;
}

const collectionIndexCache = new WeakMap<Collection, { title: FieldIndex; description: FieldIndex }>();

export function searchCollections(collections: Collection[], query: string): Collection[] {
  const parsed = parseSearchQuery(query);
  if (parsed.tokens.length === 0) return collections;

  const scored: { collection: Collection; score: number }[] = [];
  for (const col of collections) {
    let idx = collectionIndexCache.get(col);
    if (!idx) {
      idx = {
        title: buildFieldIndex(`${col.title} ${col.handle}`),
        description: buildFieldIndex(col.description),
      };
      collectionIndexCache.set(col, idx);
    }

    let score = 0;
    let allMatch = true;
    for (const token of parsed.tokens) {
      const tStrength = matchTokenInField(token, idx.title);
      const dStrength = matchTokenInField(token, idx.description);
      if (tStrength === 0 && dStrength < 2) {
        allMatch = false;
        break;
      }
      score += tStrength * 80 + dStrength * 15;
    }

    if (allMatch) {
      scored.push({ collection: col, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map((item) => item.collection);
}

const articleIndexCache = new WeakMap<
  BlogArticle,
  { title: FieldIndex; tags: FieldIndex; body: FieldIndex }
>();

export function searchArticles(articles: BlogArticle[], query: string): BlogArticle[] {
  const parsed = parseSearchQuery(query);
  if (parsed.tokens.length === 0) return articles;

  const scored: { article: BlogArticle; score: number }[] = [];
  for (const art of articles) {
    let idx = articleIndexCache.get(art);
    if (!idx) {
      idx = {
        title: buildFieldIndex(`${art.title} ${art.handle}`),
        tags: buildFieldIndex((art.tags || []).join(" ")),
        body: buildFieldIndex(`${art.excerpt || ""} ${art.content || ""}`),
      };
      articleIndexCache.set(art, idx);
    }

    let score = 0;
    let allMatch = true;
    for (const token of parsed.tokens) {
      const tStrength = matchTokenInField(token, idx.title);
      const tagStrength = matchTokenInField(token, idx.tags);
      const bStrength = matchTokenInField(token, idx.body);
      if (tStrength === 0 && tagStrength === 0 && bStrength < 2) {
        allMatch = false;
        break;
      }
      score += tStrength * 90 + tagStrength * 30 + bStrength * 10;
    }

    if (allMatch) {
      scored.push({ article: art, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map((item) => item.article);
}
