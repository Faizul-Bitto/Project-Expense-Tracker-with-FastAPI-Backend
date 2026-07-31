const LOG_PREFIX = 'ExpenseTracker'

export const logger = {
  info(module, message, data) {
    console.log(`ℹ INFO | ${LOG_PREFIX} | [${module}] | ${message}`)
    if (data) console.log('  └─ Data:', data)
  },
  success(module, message, data) {
    console.log(`✓ SUCCESS | ${LOG_PREFIX} | [${module}] | ${message}`)
    if (data) console.log('  └─ Data:', data)
  },
  warn(module, message, data) {
    console.warn(`⚠ WARN | ${LOG_PREFIX} | [${module}] | ${message}`)
    if (data) console.warn('  └─ Data:', data)
  },
  error(module, message, data) {
    console.error(`✗ ERROR | ${LOG_PREFIX} | [${module}] | ${message}`)
    if (data) console.error('  └─ Data:', data)
  },
  debug(module, message, data) {
    console.debug(`🔍 DEBUG | ${LOG_PREFIX} | [${module}] | ${message}`)
    if (data) console.debug('  └─ Data:', data)
  },
}