import { renderHook, act } from '@testing-library/react';
import { useLoading, useAsync, useDebounce, useLocalStorage, useForm } from '../index';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useLoading', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializes with default loading state', () => {
    const { result } = renderHook(() => useLoading());
    expect(result.current.loading).toBe(false);
  });

  test('initializes with custom loading state', () => {
    const { result } = renderHook(() => useLoading(true));
    expect(result.current.loading).toBe(true);
  });

  test('startLoading sets loading to true', () => {
    const { result } = renderHook(() => useLoading());
    
    act(() => {
      result.current.startLoading();
    });
    
    expect(result.current.loading).toBe(true);
  });

  test('stopLoading sets loading to false', () => {
    const { result } = renderHook(() => useLoading(true));
    
    act(() => {
      result.current.stopLoading();
    });
    
    expect(result.current.loading).toBe(false);
  });

  test('toggleLoading toggles loading state', () => {
    const { result } = renderHook(() => useLoading());
    
    act(() => {
      result.current.toggleLoading();
    });
    
    expect(result.current.loading).toBe(true);
    
    act(() => {
      result.current.toggleLoading();
    });
    
    expect(result.current.loading).toBe(false);
  });
});

describe('useAsync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializes with idle state', () => {
    const { result } = renderHook(() => useAsync());
    
    expect(result.current.state).toBe('idle');
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.isIdle).toBe(true);
  });

  test('executes async function successfully', async () => {
    const asyncFn = jest.fn().mockResolvedValue('success');
    const { result } = renderHook(() => useAsync(asyncFn));
    
    await act(async () => {
      await result.current.execute();
    });
    
    expect(result.current.state).toBe('success');
    expect(result.current.data).toBe('success');
    expect(result.current.error).toBeNull();
    expect(result.current.isSuccess).toBe(true);
  });

  test('handles async function errors', async () => {
    const error = new Error('Test error');
    const asyncFn = jest.fn().mockRejectedValue(error);
    const { result } = renderHook(() => useAsync(asyncFn));
    
    await act(async () => {
      try {
        await result.current.execute();
      } catch (e) {
        // Expected to throw
      }
    });
    
    expect(result.current.state).toBe('error');
    expect(result.current.data).toBeNull();
    expect(result.current.error).toMatchObject({
      message: 'Test error',
      code: 'unknown'
    });
    expect(result.current.isError).toBe(true);
  });

  test('resets state correctly', async () => {
    const asyncFn = jest.fn().mockResolvedValue('success');
    const { result } = renderHook(() => useAsync(asyncFn));
    
    await act(async () => {
      await result.current.execute();
    });
    
    expect(result.current.isSuccess).toBe(true);
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.state).toBe('idle');
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  test('shows loading state during execution', async () => {
    let resolve: (value: string) => void;
    const promise = new Promise<string>(r => { resolve = r; });
    const asyncFn = jest.fn().mockReturnValue(promise);
    
    const { result } = renderHook(() => useAsync(asyncFn));
    
    act(() => {
      result.current.execute();
    });
    
    expect(result.current.loading).toBe(true);
    expect(result.current.state).toBe('loading');
    
    await act(async () => {
      resolve!('done');
    });
    
    expect(result.current.loading).toBe(false);
    expect(result.current.state).toBe('success');
  });
});

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  test('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );
    
    expect(result.current).toBe('initial');
    
    rerender({ value: 'changed', delay: 500 });
    expect(result.current).toBe('initial'); // Should still be initial
    
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    expect(result.current).toBe('changed'); // Now should be changed
  });

  test('cancels previous timeout on new value', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );
    
    rerender({ value: 'changed1', delay: 500 });
    
    act(() => {
      jest.advanceTimersByTime(250); // Half way through
    });
    
    rerender({ value: 'changed2', delay: 500 });
    
    act(() => {
      jest.advanceTimersByTime(250); // This should not trigger the first change
    });
    
    expect(result.current).toBe('initial');
    
    act(() => {
      jest.advanceTimersByTime(250); // Complete the second debounce
    });
    
    expect(result.current).toBe('changed2');
  });
});

describe('useLocalStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('initializes with default value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  test('initializes with stored value when localStorage has data', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('stored');
  });

  test('stores value in localStorage when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    
    act(() => {
      result.current[1]('new value');
    });
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'test-key',
      JSON.stringify('new value')
    );
    expect(result.current[0]).toBe('new value');
  });

  test('handles function updates', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 0));
    
    act(() => {
      result.current[1](prev => prev + 1);
    });
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'test-key',
      JSON.stringify(1)
    );
    expect(result.current[0]).toBe(1);
  });

  test('removes value from localStorage when removeValue is called', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    
    act(() => {
      result.current[2]();
    });
    
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-key');
    expect(result.current[0]).toBe('default');
  });

  test('handles localStorage errors gracefully', () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage error');
    });
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    
    act(() => {
      result.current[1]('new value');
    });
    
    // Should not throw and should update local state
    expect(result.current[0]).toBe('new value');
  });
});

describe('useForm', () => {
  const initialValues = { email: '', password: '' };
  const validationRules = {
    email: (value: string) => value ? undefined : 'Email is required',
    password: (value: string) => value.length >= 6 ? undefined : 'Password must be at least 6 characters'
  };

  test('initializes with initial values', () => {
    const { result } = renderHook(() => useForm(initialValues));
    
    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isValid).toBe(true);
  });

  test('setValue updates field value', () => {
    const { result } = renderHook(() => useForm(initialValues));
    
    act(() => {
      result.current.setValue('email', 'test@example.com');
    });
    
    expect(result.current.values.email).toBe('test@example.com');
  });

  test('setError updates field error', () => {
    const { result } = renderHook(() => useForm(initialValues));
    
    act(() => {
      result.current.setError('email', 'Invalid email');
    });
    
    expect(result.current.errors.email).toBe('Invalid email');
    expect(result.current.isValid).toBe(false);
  });

  test('setTouched updates field touched state', () => {
    const { result } = renderHook(() => useForm(initialValues));
    
    act(() => {
      result.current.setTouched('email', true);
    });
    
    expect(result.current.touched.email).toBe(true);
  });

  test('validate runs validation rules', () => {
    const { result } = renderHook(() => useForm(initialValues, validationRules));
    
    let isValid: boolean;
    act(() => {
      isValid = result.current.validate();
    });
    
    expect(isValid!).toBe(false);
    expect(result.current.errors.email).toBe('Email is required');
    expect(result.current.errors.password).toBe('Password must be at least 6 characters');
  });

  test('handleSubmit validates and calls onSubmit', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useForm(initialValues, validationRules));
    
    // Set valid values
    act(() => {
      result.current.setValue('email', 'test@example.com');
      result.current.setValue('password', 'password123');
    });
    
    await act(async () => {
      await result.current.handleSubmit(onSubmit);
    });
    
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  test('handleSubmit does not call onSubmit if validation fails', async () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() => useForm(initialValues, validationRules));
    
    await act(async () => {
      await result.current.handleSubmit(onSubmit);
    });
    
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('reset restores initial state', () => {
    const { result } = renderHook(() => useForm(initialValues));
    
    act(() => {
      result.current.setValue('email', 'test@example.com');
      result.current.setError('email', 'Some error');
      result.current.setTouched('email', true);
    });
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });
});
