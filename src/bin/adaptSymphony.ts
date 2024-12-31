import composerSymphony from '../../composer.json'
import { SymphonyAdapter } from '../adapters/SymphonyAdapter'
import type { Symphony } from '../types'

const adapter = new SymphonyAdapter()
const bot = adapter.adapt(composerSymphony as Symphony)
console.log(JSON.stringify(bot, null, 2))