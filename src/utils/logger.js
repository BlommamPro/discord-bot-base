import chalk from 'chalk';

const time = () => new Date().toLocaleTimeString('es-ES', { hour12: false });

export const logger = {
  info: (...args) => console.log(chalk.blue(`[${time()}] ℹ️  INFO:`), ...args),
  success: (...args) => console.log(chalk.green(`[${time()}] ✅ OK:`), ...args),
  warn: (...args) => console.log(chalk.yellow(`[${time()}] ⚠️  WARN:`), ...args),
  error: (...args) => console.log(chalk.red(`[${time()}] ❌ ERROR:`), ...args),
  cmd: (...args) => console.log(chalk.magenta(`[${time()}] ⌨️  CMD:`), ...args),
  event: (...args) => console.log(chalk.cyan(`[${time()}] 📡 EVENT:`), ...args),
  db: (...args) => console.log(chalk.hex('#C27C0E')(`[${time()}] 🗄️  DB:`), ...args)
};