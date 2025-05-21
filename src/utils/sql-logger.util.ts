import { Logger } from '@nestjs/common';
import chalk from 'chalk';

const logger = new Logger('SQL');

const highlightSQL = (sql: string) => {
  const keywords =
    /\b(SELECT|FROM|WHERE|AND|OR|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|DROP|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP BY|ORDER BY|HAVING|LIMIT|OFFSET)\b/gi;

  const strings = /'[^']*'/g;

  const numbers = /\b\d+\b/g;

  const tables = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g;

  return sql
    .replace(keywords, (match) => chalk.blue(match))
    .replace(strings, (match) => chalk.green(match))
    .replace(numbers, (match) => chalk.yellow(match))
    .replace(tables, (match) => chalk.magenta(match));
};

export const sqlLogger = (log: string | any) => {
  if (typeof log === 'string') {
    logger.log(highlightSQL(log));
  } else if (log?.sql) {
    logger.log(highlightSQL(log.sql));
  } else {
    logger.log(log);
  }
};
