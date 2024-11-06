export const extractKeywords = (text) => {
  // Remove special characters and convert to lowercase
  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, '');
  
  // Split into words and remove common stop words
  const words = cleanText.split(/\s+/).filter(word => 
    word.length > 2 && !STOP_WORDS.includes(word)
  );
  
  // Remove duplicates
  return [...new Set(words)];
};

const STOP_WORDS = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have',
  'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you',
  'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they',
  'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one',
  'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out',
  'if', 'about', 'who', 'get', 'which', 'go', 'me'
];