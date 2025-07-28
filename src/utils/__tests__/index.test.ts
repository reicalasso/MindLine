import { dateUtils, stringUtils, arrayUtils, numberUtils, validationUtils } from '../index';
import { Timestamp } from 'firebase/firestore';

describe('dateUtils', () => {
  const testDate = new Date('2024-01-15T10:30:00Z');
  const testTimestamp = Timestamp.fromDate(testDate);

  describe('timestampToDate', () => {
    test('converts Timestamp to Date', () => {
      const result = dateUtils.timestampToDate(testTimestamp);
      expect(result).toEqual(testDate);
    });

    test('returns null for null input', () => {
      const result = dateUtils.timestampToDate(null);
      expect(result).toBeNull();
    });

    test('returns null for undefined input', () => {
      const result = dateUtils.timestampToDate(undefined);
      expect(result).toBeNull();
    });
  });

  describe('dateToTimestamp', () => {
    test('converts Date to Timestamp', () => {
      const result = dateUtils.dateToTimestamp(testDate);
      expect(result.toDate()).toEqual(testDate);
    });

    test('converts string to Timestamp', () => {
      const result = dateUtils.dateToTimestamp('2024-01-15T10:30:00Z');
      expect(result.toDate()).toEqual(testDate);
    });
  });

  describe('getRelativeTime', () => {
    test('returns "Şimdi" for very recent times', () => {
      const now = new Date();
      const result = dateUtils.getRelativeTime(now);
      expect(result).toBe('Şimdi');
    });

    test('returns minutes for times less than an hour ago', () => {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const result = dateUtils.getRelativeTime(thirtyMinutesAgo);
      expect(result).toBe('30dk');
    });

    test('returns empty string for null input', () => {
      const result = dateUtils.getRelativeTime(null);
      expect(result).toBe('');
    });
  });
});

describe('stringUtils', () => {
  describe('truncate', () => {
    test('truncates long strings', () => {
      const longString = 'This is a very long string that should be truncated';
      const result = stringUtils.truncate(longString, 20);
      expect(result).toBe('This is a very long...');
    });

    test('returns original string if shorter than limit', () => {
      const shortString = 'Short';
      const result = stringUtils.truncate(shortString, 20);
      expect(result).toBe('Short');
    });

    test('uses custom suffix', () => {
      const longString = 'This is a very long string';
      const result = stringUtils.truncate(longString, 10, '...');
      expect(result).toBe('This is a...');
    });
  });

  describe('capitalize', () => {
    test('capitalizes first letter', () => {
      const result = stringUtils.capitalize('hello world');
      expect(result).toBe('Hello world');
    });

    test('handles empty string', () => {
      const result = stringUtils.capitalize('');
      expect(result).toBe('');
    });

    test('handles single character', () => {
      const result = stringUtils.capitalize('a');
      expect(result).toBe('A');
    });
  });

  describe('titleCase', () => {
    test('converts to title case', () => {
      const result = stringUtils.titleCase('hello world');
      expect(result).toBe('Hello World');
    });

    test('handles empty string', () => {
      const result = stringUtils.titleCase('');
      expect(result).toBe('');
    });
  });

  describe('obfuscateEmail', () => {
    test('obfuscates email address', () => {
      const result = stringUtils.obfuscateEmail('test@example.com');
      expect(result).toBe('t**t@example.com');
    });

    test('returns original string if not email', () => {
      const result = stringUtils.obfuscateEmail('not-an-email');
      expect(result).toBe('not-an-email');
    });
  });

  describe('createSlug', () => {
    test('creates URL-friendly slug', () => {
      const result = stringUtils.createSlug('Hello World! This is a test.');
      expect(result).toBe('hello-world-this-is-a-test');
    });

    test('handles Turkish characters', () => {
      const result = stringUtils.createSlug('Türkçe Başlık');
      expect(result).toBe('trkce-balk');
    });
  });

  describe('generateRandomString', () => {
    test('generates string of specified length', () => {
      const result = stringUtils.generateRandomString(10);
      expect(result).toHaveLength(10);
    });

    test('generates different strings on subsequent calls', () => {
      const result1 = stringUtils.generateRandomString(8);
      const result2 = stringUtils.generateRandomString(8);
      expect(result1).not.toBe(result2);
    });
  });
});

describe('arrayUtils', () => {
  const testArray = [1, 2, 3, 4, 5];

  describe('shuffle', () => {
    test('returns array with same length', () => {
      const result = arrayUtils.shuffle(testArray);
      expect(result).toHaveLength(testArray.length);
    });

    test('contains all original elements', () => {
      const result = arrayUtils.shuffle(testArray);
      testArray.forEach(item => {
        expect(result).toContain(item);
      });
    });

    test('does not modify original array', () => {
      const original = [...testArray];
      arrayUtils.shuffle(testArray);
      expect(testArray).toEqual(original);
    });
  });

  describe('unique', () => {
    test('removes duplicates', () => {
      const arrayWithDuplicates = [1, 2, 2, 3, 3, 3, 4];
      const result = arrayUtils.unique(arrayWithDuplicates);
      expect(result).toEqual([1, 2, 3, 4]);
    });

    test('handles empty array', () => {
      const result = arrayUtils.unique([]);
      expect(result).toEqual([]);
    });
  });

  describe('chunk', () => {
    test('splits array into chunks', () => {
      const result = arrayUtils.chunk(testArray, 2);
      expect(result).toEqual([[1, 2], [3, 4], [5]]);
    });

    test('handles chunk size larger than array', () => {
      const result = arrayUtils.chunk(testArray, 10);
      expect(result).toEqual([testArray]);
    });
  });

  describe('random', () => {
    test('returns element from array', () => {
      const result = arrayUtils.random(testArray);
      expect(testArray).toContain(result);
    });

    test('returns undefined for empty array', () => {
      const result = arrayUtils.random([]);
      expect(result).toBeUndefined();
    });
  });

  describe('groupBy', () => {
    test('groups objects by key', () => {
      const objects = [
        { category: 'fruit', name: 'apple' },
        { category: 'fruit', name: 'banana' },
        { category: 'vegetable', name: 'carrot' }
      ];
      
      const result = arrayUtils.groupBy(objects, 'category');
      
      expect(result).toEqual({
        fruit: [
          { category: 'fruit', name: 'apple' },
          { category: 'fruit', name: 'banana' }
        ],
        vegetable: [
          { category: 'vegetable', name: 'carrot' }
        ]
      });
    });
  });
});

describe('numberUtils', () => {
  describe('formatNumber', () => {
    test('formats large numbers with K suffix', () => {
      expect(numberUtils.formatNumber(1500)).toBe('1.5K');
      expect(numberUtils.formatNumber(1000)).toBe('1.0K');
    });

    test('formats millions with M suffix', () => {
      expect(numberUtils.formatNumber(1500000)).toBe('1.5M');
      expect(numberUtils.formatNumber(1000000)).toBe('1.0M');
    });

    test('returns string for numbers less than 1000', () => {
      expect(numberUtils.formatNumber(999)).toBe('999');
      expect(numberUtils.formatNumber(0)).toBe('0');
    });
  });

  describe('percentage', () => {
    test('calculates percentage correctly', () => {
      expect(numberUtils.percentage(25, 100)).toBe(25);
      expect(numberUtils.percentage(1, 3)).toBe(33);
    });

    test('returns 0 for division by zero', () => {
      expect(numberUtils.percentage(25, 0)).toBe(0);
    });
  });

  describe('clamp', () => {
    test('clamps value within range', () => {
      expect(numberUtils.clamp(5, 0, 10)).toBe(5);
      expect(numberUtils.clamp(-5, 0, 10)).toBe(0);
      expect(numberUtils.clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('random', () => {
    test('returns number within range', () => {
      const result = numberUtils.random(1, 10);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(10);
    });

    test('returns integer', () => {
      const result = numberUtils.random(1, 10);
      expect(Number.isInteger(result)).toBe(true);
    });
  });
});

describe('validationUtils', () => {
  describe('isValidEmail', () => {
    test('validates correct email addresses', () => {
      expect(validationUtils.isValidEmail('test@example.com')).toBe(true);
      expect(validationUtils.isValidEmail('user.name+tag@example.co.uk')).toBe(true);
    });

    test('rejects invalid email addresses', () => {
      expect(validationUtils.isValidEmail('invalid-email')).toBe(false);
      expect(validationUtils.isValidEmail('test@')).toBe(false);
      expect(validationUtils.isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    test('validates correct URLs', () => {
      expect(validationUtils.isValidUrl('https://example.com')).toBe(true);
      expect(validationUtils.isValidUrl('http://localhost:3000')).toBe(true);
    });

    test('rejects invalid URLs', () => {
      expect(validationUtils.isValidUrl('not-a-url')).toBe(false);
      expect(validationUtils.isValidUrl('ftp://invalid')).toBe(false);
    });
  });

  describe('isValidTurkishPhone', () => {
    test('validates Turkish phone numbers', () => {
      expect(validationUtils.isValidTurkishPhone('05551234567')).toBe(true);
      expect(validationUtils.isValidTurkishPhone('+905551234567')).toBe(true);
      expect(validationUtils.isValidTurkishPhone('0555 123 45 67')).toBe(true);
    });

    test('rejects invalid Turkish phone numbers', () => {
      expect(validationUtils.isValidTurkishPhone('1234567890')).toBe(false);
      expect(validationUtils.isValidTurkishPhone('05551234')).toBe(false);
    });
  });

  describe('isStrongPassword', () => {
    test('validates strong passwords', () => {
      expect(validationUtils.isStrongPassword('Password123')).toBe(true);
      expect(validationUtils.isStrongPassword('MyStrong123!')).toBe(true);
    });

    test('rejects weak passwords', () => {
      expect(validationUtils.isStrongPassword('password')).toBe(false);
      expect(validationUtils.isStrongPassword('123456')).toBe(false);
      expect(validationUtils.isStrongPassword('Pass123')).toBe(false); // Too short
    });
  });
});
