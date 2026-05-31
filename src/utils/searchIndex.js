import javaCore from '../data/javaCore'
import java8 from '../data/java8Streams'
import springBoot from '../data/springBoot'
import microservices from '../data/microservices'
import kafka from '../data/kafka'
import sql from '../data/sql'
import azure from '../data/azure'
import sso from '../data/sso'
import multithreading from '../data/multithreading'
import collections from '../data/collections'
import hibernate from '../data/hibernate'
import security from '../data/security'
import designPatterns from '../data/designPatterns'
import docker from '../data/docker'
import testing from '../data/testing'
import dsaProblems from '../data/dsaProblems'
import hrQuestions from '../data/hrQuestions'

const TOPICS = {
  'java-core':       javaCore,
  'java8':           java8,
  'spring-boot':     springBoot,
  'microservices':   microservices,
  'kafka':           kafka,
  'sql':             sql,
  'azure':           azure,
  'sso':             sso,
  'multithreading':  multithreading,
  'collections':     collections,
  'hibernate':       hibernate,
  'security':        security,
  'design-patterns': designPatterns,
  'docker':          docker,
  'testing':         testing,
}

const index = []

for (const [topicId, data] of Object.entries(TOPICS)) {
  for (const q of data.questions || []) {
    index.push({
      type: 'topic',
      topicId,
      topicTitle: data.title,
      route: `/topics/${topicId}`,
      text: q.question,
      difficulty: q.difficulty || null,
      tags: q.tags || [],
    })
  }
}

for (const q of dsaProblems) {
  index.push({
    type: 'dsa',
    topicId: 'dsa',
    topicTitle: 'DSA Problems',
    route: '/dsa',
    text: q.title,
    difficulty: q.difficulty || null,
    tags: q.tags || [],
  })
}

for (const section of hrQuestions.sections || []) {
  for (const q of section.questions || []) {
    index.push({
      type: 'hr',
      topicId: 'hr',
      topicTitle: 'HR Questions',
      route: '/hr-questions',
      text: q.question,
      difficulty: null,
      tags: [],
    })
  }
}

export function searchAll(query) {
  if (!query || query.trim().length < 2) return []
  const q = query.toLowerCase().trim()
  return index
    .filter(item =>
      item.text.toLowerCase().includes(q) ||
      item.topicTitle.toLowerCase().includes(q) ||
      item.tags.some(t => t.toLowerCase().includes(q))
    )
    .slice(0, 15)
}
