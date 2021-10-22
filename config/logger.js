const { createLogger, transports, format } = require('winston');
const { combine, timestamp, label, json, simple, colorize, printf } = format;
require('dotenv').config();

const printFormat = printf(({ level, timestamp, message, label }) => {
  return `${level} : ${timestamp} [${label}] ${message} `;
});

const printLogFormat = {
  file: combine(
    label({
      label: '백엔드 맛보기',
    }),
    timestamp({
      format: 'YYYY-MM-DD HH:mm:dd',
    }),
    printFormat
  ),
  console: combine(
    label({
      label: '백엔드 맛보기',
    }),
    printFormat
  ),
};

const options = {
  file: new transports.File({
    filename: 'access.log',
    dirname: './config/logs',
    level: 'info',
    format: printLogFormat.file,
  }),
  console: new transports.Console({
    level: 'info',
    format: printLogFormat.console,
  }),
};
const logger = createLogger({
  transports: [
    // 파일로 저장
    options.file,
    // 콘솔로 출력
    options.console,
  ],
});

// 개발용과 서버용을 구분 지어서 배포하는 방법
if (process.env.NODE_ENV !== 'production') {
  logger.add(options.console);
}

module.exports = logger;
