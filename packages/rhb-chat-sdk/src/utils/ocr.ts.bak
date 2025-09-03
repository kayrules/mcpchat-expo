import { Platform } from 'react-native';

let TextRecognition: any = null;
try {
  const mlKit = require('@react-native-ml-kit/text-recognition');
  TextRecognition = mlKit.default;
  console.log('📱 Text Recognition loaded successfully');
} catch (error) {
  console.warn('⚠️ Text Recognition not available:', error);
}

export interface OCRResult {
  text: string;
  confidence?: number;
  language?: string;
  documentType?: 'receipt' | 'bill' | 'bank_statement' | 'invoice' | 'id_card' | 'credit_card' | 'unknown';
  extractedData?: {
    amounts?: string[];
    dates?: string[];
    phoneNumbers?: string[];
    emails?: string[];
    accountNumbers?: string[];
    merchantName?: string;
    total?: string;
  };
  blocks?: Array<{
    text: string;
    confidence: number;
    frame: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
}

/**
 * Extract text from an image using MLKit Text Recognition
 * Uses Apple's Vision Framework on iOS and Google MLKit on Android
 */
export const extractTextFromImage = async (imageUri: string): Promise<OCRResult> => {
  try {
    console.log('🔍 Starting OCR processing for image:', imageUri);
    
    // Check if TextRecognition is available
    if (!TextRecognition) {
      throw new Error('Text Recognition is not available. Please ensure the library is properly installed and linked.');
    }
    
    // Call the text recognition function
    const result = await TextRecognition.recognize(imageUri);
    
    console.log('📄 OCR Results:');
    console.log('- Blocks Count:', result.blocks?.length || 0);
    
    // Log individual text blocks with their positions
    if (result.blocks && result.blocks.length > 0) {
      console.log('📍 Text Blocks:');
      result.blocks.forEach((block, index) => {
        console.log(`  Block ${index + 1}: "${block.text}"`);
        console.log(`    Language: ${block.recognizedLanguages?.[0]?.languageCode || 'unknown'}`);
        console.log(`    Position: (${block.frame.left}, ${block.frame.top})`);
        console.log(`    Size: ${block.frame.width}x${block.frame.height}`);
      });
    }

    // Extract all text from blocks
    const allText = result.blocks ? result.blocks.map(block => block.text).join('\n') : (result.text || 'No text detected');
    const documentType = classifyDocument(allText);
    const extractedData = extractStructuredData(allText);

    console.log('🏷️ Document Classification:', documentType.toUpperCase());
    console.log('📊 Extracted Data:');
    console.log('  - Amounts:', extractedData.amounts);
    console.log('  - Dates:', extractedData.dates);
    console.log('  - Phone Numbers:', extractedData.phoneNumbers);
    console.log('  - Emails:', extractedData.emails);
    console.log('  - Account Numbers:', extractedData.accountNumbers);
    console.log('  - Merchant Name:', extractedData.merchantName);
    console.log('  - Total:', extractedData.total);

    return {
      text: allText,
      confidence: result.blocks?.[0]?.recognizedLanguages?.[0]?.confidence || undefined,
      language: result.blocks?.[0]?.recognizedLanguages?.[0]?.languageCode,
      documentType,
      extractedData,
      blocks: result.blocks?.map(block => ({
        text: block.text,
        confidence: block.recognizedLanguages?.[0]?.confidence || 0,
        frame: {
          x: block.frame.left,
          y: block.frame.top,
          width: block.frame.width,
          height: block.frame.height,
        },
      })),
    };
  } catch (error) {
    console.error('❌ OCR Error:', error);
    return {
      text: 'OCR processing failed: ' + (error as Error).message,
      confidence: 0,
    };
  }
};

/**
 * Check if OCR is available on the current device
 */
export const isOCRAvailable = async (): Promise<boolean> => {
  try {
    // Check if the TextRecognition module is loaded
    if (!TextRecognition) {
      console.warn('ML Kit Text Recognition module is not available');
      return false;
    }
    
    // Additional platform checks
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      console.warn('OCR is only supported on iOS and Android platforms');
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn('OCR not available:', error);
    return false;
  }
};

/**
 * Classify the type of document based on text content
 */
const classifyDocument = (text: string): 'receipt' | 'bill' | 'bank_statement' | 'invoice' | 'id_card' | 'credit_card' | 'unknown' => {
  const lowerText = text.toLowerCase();
  
  // Receipt indicators
  if (lowerText.includes('receipt') || lowerText.includes('total') && (lowerText.includes('tax') || lowerText.includes('subtotal'))) {
    return 'receipt';
  }
  
  // Bill indicators  
  if (lowerText.includes('bill') || lowerText.includes('due date') || lowerText.includes('amount due')) {
    return 'bill';
  }
  
  // Bank statement indicators
  if (lowerText.includes('statement') || lowerText.includes('balance') || lowerText.includes('account number')) {
    return 'bank_statement';
  }
  
  // Invoice indicators
  if (lowerText.includes('invoice') || lowerText.includes('invoice number') || lowerText.includes('pay to')) {
    return 'invoice';
  }
  
  // ID card indicators
  if (lowerText.includes('license') || lowerText.includes('id') || lowerText.includes('date of birth')) {
    return 'id_card';
  }
  
  // Credit card indicators
  if (lowerText.match(/\d{4}\s*\d{4}\s*\d{4}\s*\d{4}/) || lowerText.includes('expires') || lowerText.includes('valid thru')) {
    return 'credit_card';
  }
  
  return 'unknown';
};

/**
 * Extract structured data from text
 */
const extractStructuredData = (text: string) => {
  const amounts = text.match(/[\$\£\€\¥]\s*\d+\.?\d*/g) || text.match(/\d+\.\d{2}/g) || [];
  const dates = text.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g) || [];
  const phoneNumbers = text.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/g) || [];
  const emails = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [];
  const accountNumbers = text.match(/(?:account|acct)[:\s#]*(\d{4,})/gi) || [];
  
  // Extract merchant name (typically at the top)
  const lines = text.split('\n').filter(line => line.trim());
  const merchantName = lines[0]?.trim();
  
  // Find total amount
  const totalMatch = text.match(/(?:total|amount due)[:\s]*[\$\£\€\¥]?\s*(\d+\.?\d*)/i);
  const total = totalMatch?.[1];
  
  return {
    amounts,
    dates,
    phoneNumbers,
    emails,
    accountNumbers: accountNumbers.map(match => match.replace(/(?:account|acct)[:\s#]*/gi, '')),
    merchantName,
    total,
  };
};

/**
 * Extract specific types of text (e.g., numbers, emails, etc.)
 */
export const extractSpecificText = (ocrResult: OCRResult, type: 'numbers' | 'emails' | 'phone' | 'all' = 'all'): string[] => {
  if (!ocrResult.text) return [];
  
  const patterns = {
    numbers: /\b\d+\b/g,
    emails: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
    all: /.+/g,
  };
  
  const matches = ocrResult.text.match(patterns[type]) || [];
  return matches;
};