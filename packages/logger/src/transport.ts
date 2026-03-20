import pp from 'pino-pretty';

interface PrettyOptions {
  colorize?: boolean;
  translateTime?: string | boolean;
  ignore?: string;
  singleLine?: boolean;
  messageFormat?: string;
  customPrettifiers?: Record<
    string,
    (
      inputData: string | object,
      keyName: string,
      logObj: Record<string, any>,
      extras?: any,
    ) => string
  >;
}

const loggerTransport = async (options: PrettyOptions) =>
  pp({
    ...options,
    customPrettifiers: {
      time: (inputData: string | object): string => {
        if (typeof inputData !== 'string') return '';

        return inputData.replace(/^\[|\]$/g, '');
      },
      level: (
        inputData: string | object,
        _keyName: string,
        _logObj: Record<string, any>,
        extras?: any,
      ): string => {
        if (typeof inputData === 'object') return '';

        const labelColorized = extras?.labelColorized;
        if (!labelColorized) return '';

        return ` [${labelColorized.toLowerCase()}]`;
      },
    },
  });

export default loggerTransport;
