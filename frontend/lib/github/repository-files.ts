import { SETUP_FILES } from './constants'
import { getOctokit } from './client'
import { logDiscovery } from './log'
import type { DiscoveredRepository, EnvironmentSignals } from './types'

type ContentItem = { name: string; path: string; type: string }

const ROOT_FILES = new Set(SETUP_FILES.map((name) => name.toLowerCase()))

export async function analyzeRepositorySetup(repo: DiscoveredRepository): Promise<EnvironmentSignals> {
  const listing = await listRoot(repo)
  const wanted = listing.filter((item) => item.type === 'file' && ROOT_FILES.has(item.name.toLowerCase()))
  const contents: string[] = []
  const setupFilesFound: string[] = []

  for (const file of wanted.slice(0, 8)) {
    const body = await readFile(repo, file.path)
    if (body) {
      setupFilesFound.push(file.name)
      contents.push(body.slice(0, 8000))
    }
  }

  const text = `${setupFilesFound.join(' ')}\n${contents.join('\n')}`.toLowerCase()
  const languages: string[] = []
  const technologies: string[] = []
  const infrastructure: string[] = []

  if (mentions(text, ['package.json', 'pnpm-workspace', 'yarn.lock'])) {
    languages.push('JavaScript')
    technologies.push('Node.js')
  }
  if (mentions(text, ['requirements.txt', 'pyproject.toml', 'pipfile'])) {
    languages.push('Python')
  }
  if (text.includes('go.mod')) languages.push('Go')
  if (text.includes('cargo.toml')) languages.push('Rust')
  if (mentions(text, ['pom.xml', 'build.gradle'])) languages.push('Java')
  if (repo.primaryLanguage && !languages.includes(repo.primaryLanguage)) languages.push(repo.primaryLanguage)

  if (text.includes('fastapi')) technologies.push('FastAPI')
  if (text.includes('next')) technologies.push('Next.js')
  if (text.includes('react')) technologies.push('React')
  if (mentions(text, ['pytest'])) technologies.push('pytest')

  if (mentions(text, ['postgres', 'postgresql'])) infrastructure.push('PostgreSQL')
  if (text.includes('redis')) infrastructure.push('Redis')
  if (text.includes('kafka')) infrastructure.push('Kafka')
  if (text.includes('elasticsearch')) infrastructure.push('Elasticsearch')

  const docker = mentions(text, ['dockerfile', 'docker-compose', 'compose.yml', 'compose.yaml'])
  const gpuLikelyRequired = mentions(text, ['cuda', 'nvidia', 'gpu', 'pytorch', 'tensorflow'])

  return {
    languages: unique(languages),
    technologies: unique(technologies),
    docker,
    gpuLikelyRequired,
    infrastructure: unique(infrastructure),
    setupFilesFound,
  }
}

async function listRoot(repo: DiscoveredRepository): Promise<ContentItem[]> {
  const octokit = getOctokit()
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: repo.owner,
      repo: repo.name,
      path: '',
    })
    if (!Array.isArray(data)) return []
    return data.map((item) => ({ name: item.name, path: item.path, type: item.type }))
  } catch {
    logDiscovery('root listing skipped', { repo: repo.fullName })
    return []
  }
}

async function readFile(repo: DiscoveredRepository, path: string) {
  const octokit = getOctokit()
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: repo.owner,
      repo: repo.name,
      path,
    })
    if (Array.isArray(data) || data.type !== 'file' || !('content' in data) || !data.content) return null
    return Buffer.from(data.content, 'base64').toString('utf8')
  } catch {
    return null
  }
}

function mentions(text: string, needles: string[]) {
  return needles.some((needle) => text.includes(needle))
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))]
}
