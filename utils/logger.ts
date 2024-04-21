import path from 'path';
import pino from 'pino';

interface TargetOptions {
  destination?: string;
  colorize?: boolean;
}

interface Target {
  level: string;
  target: string;
  options?: TargetOptions;
}

const transport = pino.transport({
  targets: [
    {
      level: 'info',
      target: 'pino-pretty',
      options: {
        destination: path.resolve(__dirname, `./log/${new Date().toLocaleDateString("de-DE")}.log`),
        colorize: false
      },
    },
    {
      level: 'info',
      target: 'pino-pretty',
      options: {},
    },
  ] as Target[],
});

const logger = pino({level: 'info'}, transport);

export default logger;