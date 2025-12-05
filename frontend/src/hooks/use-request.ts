import { useCallback, useEffect, useRef, useState } from 'react';
import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import axios from 'src/utils/axios';

// ----------------------------------------------------------------------

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface UseRequestOptions<TData, TError = any> extends Omit<AxiosRequestConfig, 'method' | 'url' | 'data'> {
  /**
   * URL endpoint для запроса
   */
  url?: string;
  /**
   * HTTP метод запроса
   * @default 'GET'
   */
  method?: RequestMethod;
  /**
   * Данные для отправки (для POST, PUT, PATCH)
   */
  data?: any;
  /**
   * Автоматически выполнить запрос при монтировании компонента
   * @default true для GET, false для остальных методов
   */
  immediate?: boolean;
  /**
   * Функция для преобразования ответа перед сохранением в state
   */
  transformResponse?: (response: AxiosResponse) => TData;
  /**
   * Функция для обработки ошибок
   */
  onError?: (error: TError) => void;
  /**
   * Функция для обработки успешного ответа
   */
  onSuccess?: (data: TData) => void;
  /**
   * Зависимости для автоматического перезапуска запроса
   */
  deps?: React.DependencyList;
}

interface UseRequestReturn<TData, TError = any> {
  /**
   * Данные ответа
   */
  data: TData | null;
  /**
   * Состояние загрузки
   */
  loading: boolean;
  /**
   * Объект ошибки
   */
  error: TError | null;
  /**
   * Флаг наличия ошибки
   */
  hasError: boolean;
  /**
   * Функция для выполнения запроса
   */
  execute: (config?: Partial<UseRequestOptions<TData, TError>>) => Promise<TData | null>;
  /**
   * Функция для сброса состояния (data, error)
   */
  reset: () => void;
  /**
   * Функция для отмены текущего запроса
   */
  cancel: () => void;
}

// ----------------------------------------------------------------------

/**
 * Хук для выполнения HTTP запросов с поддержкой GET, POST, PUT, DELETE
 * 
 * @example
 * // GET запрос с автоматическим выполнением
 * const { data, loading, error, execute } = useRequest<User[]>({
 *   url: '/api/users',
 *   method: 'GET',
 * });
 * 
 * @example
 * // POST запрос с ручным запуском
 * const { data, loading, execute } = useRequest<CreateUserResponse>({
 *   url: '/api/users',
 *   method: 'POST',
 *   immediate: false,
 * });
 * 
 * const handleSubmit = async () => {
 *   await execute({ data: { name: 'John', email: 'john@example.com' } });
 * };
 * 
 * @example
 * // PUT запрос с обработчиками
 * const { data, loading, execute } = useRequest<User>({
 *   url: '/api/users/1',
 *   method: 'PUT',
 *   immediate: false,
 *   onSuccess: (data) => {
 *     console.log('User updated:', data);
 *   },
 *   onError: (error) => {
 *     console.error('Update failed:', error);
 *   },
 * });
 * 
 * @example
 * // DELETE запрос
 * const { loading, execute } = useRequest({
 *   url: '/api/users/1',
 *   method: 'DELETE',
 *   immediate: false,
 * });
 */
export function useRequest<TData = any, TError = any>(
  options: UseRequestOptions<TData, TError> = {}
): UseRequestReturn<TData, TError> {
  const {
    url,
    method = 'GET',
    data: initialData,
    immediate,
    transformResponse,
    onError,
    onSuccess,
    deps = [],
    ...axiosConfig
  } = options;

  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<TError | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Определяем, нужно ли автоматически выполнить запрос
  const shouldExecuteImmediate = immediate !== undefined 
    ? immediate 
    : method === 'GET';

  /**
   * Создает новый AbortController для отмены запроса
   */
  const createAbortController = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current.signal;
  }, []);

  /**
   * Выполняет HTTP запрос
   */
  const execute = useCallback(
    async (config?: Partial<UseRequestOptions<TData, TError>>): Promise<TData | null> => {
      if (!url && !config?.url) {
        console.warn('useRequest: URL is required');
        return null;
      }

      const requestUrl = config?.url || url;
      const requestMethod = config?.method || method;
      const requestData = config?.data !== undefined ? config.data : initialData;
      const requestConfig = { ...axiosConfig, ...config };

      // Отменяем предыдущий запрос, если он существует
      const abortSignal = createAbortController();

      setLoading(true);
      setError(null);

      try {
        const response = await axios.request<TData>({
          url: requestUrl,
          method: requestMethod,
          data: requestData,
          signal: abortSignal,
          ...requestConfig,
        });

        const transformedData = transformResponse 
          ? transformResponse(response) 
          : (response.data as TData);

        if (isMountedRef.current) {
          setData(transformedData);
          setLoading(false);
          
          if (onSuccess) {
            onSuccess(transformedData);
          }
        }

        return transformedData;
      } catch (err) {
        // Игнорируем ошибки отмены запроса
        if (err instanceof Error && err.name === 'AbortError') {
          return null;
        }
        
        // Игнорируем ошибки отмены через AbortController
        if (err instanceof Error && err.name === 'CanceledError') {
          return null;
        }

        const axiosError = err as AxiosError<TError>;
        const errorData = axiosError.response?.data || (axiosError.message as TError);

        if (isMountedRef.current) {
          setError(errorData);
          setLoading(false);

          if (onError) {
            onError(errorData);
          }
        }

        return null;
      }
    },
    [url, method, initialData, transformResponse, onError, onSuccess, axiosConfig, createAbortController]
  );

  /**
   * Сбрасывает состояние (data и error)
   */
  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  /**
   * Отменяет текущий запрос
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
  }, []);

  // Автоматическое выполнение запроса при монтировании
  useEffect(() => {
    if (shouldExecuteImmediate && url) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldExecuteImmediate, url, ...deps]);

  // Очистка при размонтировании
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    hasError: error !== null,
    execute,
    reset,
    cancel,
  };
}

// ----------------------------------------------------------------------

/**
 * Специализированные хуки для разных HTTP методов
 */

/**
 * Хук для GET запросов
 */
export function useGet<TData = any, TError = any>(
  url: string,
  options?: Omit<UseRequestOptions<TData, TError>, 'url' | 'method'>
) {
  return useRequest<TData, TError>({
    ...options,
    url,
    method: 'GET',
  });
}

/**
 * Хук для POST запросов
 */
export function usePost<TData = any, TError = any>(
  url: string,
  options?: Omit<UseRequestOptions<TData, TError>, 'url' | 'method'>
) {
  return useRequest<TData, TError>({
    ...options,
    url,
    method: 'POST',
    immediate: false,
  });
}

/**
 * Хук для PUT запросов
 */
export function usePut<TData = any, TError = any>(
  url: string,
  options?: Omit<UseRequestOptions<TData, TError>, 'url' | 'method'>
) {
  return useRequest<TData, TError>({
    ...options,
    url,
    method: 'PUT',
    immediate: false,
  });
}

/**
 * Хук для DELETE запросов
 */
export function useDelete<TData = any, TError = any>(
  url: string,
  options?: Omit<UseRequestOptions<TData, TError>, 'url' | 'method'>
) {
  return useRequest<TData, TError>({
    ...options,
    url,
    method: 'DELETE',
    immediate: false,
  });
}

/**
 * Хук для PATCH запросов
 */
export function usePatch<TData = any, TError = any>(
  url: string,
  options?: Omit<UseRequestOptions<TData, TError>, 'url' | 'method'>
) {
  return useRequest<TData, TError>({
    ...options,
    url,
    method: 'PATCH',
    immediate: false,
  });
}

