export type Difficulty = 'Beginner' | 'Intermediate' | 'Challenging'

export interface DeveloperProfile {
  name: string
  handle: string
  experience: Difficulty
  skills: string[]
  interests: string[]
  learningGoals: string[]
  contributionTypes: string[]
  availableTime: string
  machine: { os: string; ram: string; cpu: string; gpu: string; docker: boolean }
}

export interface Repository { name: string; owner: string; language: string; stars: string; activity: string; description: string }
export interface GitHubIssue { id: number; title: string; labels: string[]; updated: string; availability: string; issueUrl: string }
export interface IssueAnalysis { why: string; scores: Record<string, number>; difficulty: Difficulty; scope: string; expectedTime: string; requirements: string[]; skills: string[]; learn: string[]; challenges: string; health: string[]; availability: string[] }
export interface Recommendation { id: number; repository: Repository; issue: GitHubIssue; match: number; why: string[]; stack: string[]; analysis: IssueAnalysis; saved?: boolean }

export const profile: DeveloperProfile = {
  name: 'Prathamesh', handle: 'prathamesh.dev', experience: 'Intermediate',
  skills: ['Python', 'TypeScript', 'FastAPI', 'PostgreSQL', 'Docker'],
  interests: ['Backend', 'AI / ML', 'Developer Tools'], learningGoals: ['Go', 'Distributed Systems'],
  contributionTypes: ['Bug fixes', 'Small features', 'Testing'], availableTime: '2–5 hours',
  machine: { os: 'Windows 11', ram: '16 GB RAM', cpu: 'Intel i5', gpu: 'No dedicated GPU', docker: true },
}

const baseAnalysis = (scores: Record<string, number>, learn: string[], requirements: string[], challenges: string): IssueAnalysis => ({ why: 'Your Python and backend experience covers most of the concepts needed for this issue. The affected component is isolated and can run comfortably on your current machine.', scores, difficulty: 'Intermediate', scope: 'Small–Medium', expectedTime: '3–6 hours', requirements, skills: ['Python', 'HTTP fundamentals', 'Testing'], learn, challenges, health: ['Last push: 2 days ago', 'Open PRs: 27', 'Open issues: 83', 'Maintainer activity: High', 'Repository status: Active'], availability: ['Assignee: None', 'Competing PR: None detected', 'Recent interest: Low', 'Last issue activity: Yesterday'] })

export const recommendations: Recommendation[] = [
 { id: 1, repository: { name: 'opentelemetry-python', owner: 'open-telemetry', language: 'Python', stars: '8.4k', activity: 'Active', description: 'OpenTelemetry Python API and SDK' }, issue: { id: 1542, title: 'Fix retry behaviour in OTLP exporter', labels: ['Bug', 'Intermediate', 'Help Wanted'], updated: '2 days ago', availability: 'No active assignee', issueUrl: 'https://github.com/open-telemetry/opentelemetry-python/issues/1542' }, match: 92, why: ['Matches your Python/backend experience', 'Small isolated subsystem', 'No GPU required', 'Repository is actively maintained', 'No active assignee found'], stack: ['Python', 'pytest', 'HTTP', 'OpenTelemetry'], analysis: baseAnalysis({ 'Skill Match': 95, 'Machine Compatibility': 98, 'Repository Health': 91, 'Issue Availability': 94, 'Learning Value': 87 }, ['OpenTelemetry', 'Retry strategies', 'Distributed tracing', 'pytest'], ['Python 3.11+', 'pytest', 'No GPU required', '~2 GB expected development footprint', 'Works on Windows', 'Docker optional'], 'You may need to understand how the exporter retry mechanism interacts with transient HTTP failures.') },
 { id: 2, repository: { name: 'tiangolo/fastapi', owner: 'tiangolo', language: 'Python', stars: '79.1k', activity: 'Very active', description: 'FastAPI framework, high performance web APIs' }, issue: { id: 11908, title: 'Improve error message for invalid response model', labels: ['Bug', 'Good First Issue'], updated: '5 hours ago', availability: 'Open for contribution', issueUrl: 'https://github.com/fastapi/fastapi/issues/11908' }, match: 89, why: ['Directly uses your FastAPI knowledge', 'Focused test-driven change', 'Fast local feedback loop'], stack: ['Python', 'FastAPI', 'pytest', 'Pydantic'], analysis: baseAnalysis({ 'Skill Match': 93, 'Machine Compatibility': 97, 'Repository Health': 96, 'Issue Availability': 82, 'Learning Value': 85 }, ['Pydantic internals', 'API ergonomics', 'Regression testing'], ['Python 3.9+', 'pytest', 'No GPU required', '~1 GB expected development footprint'], 'The response model path crosses several validation layers, so tracing the existing test fixtures will be important.') },
 { id: 3, repository: { name: 'encode/httpx', owner: 'encode', language: 'Python', stars: '13.8k', activity: 'Active', description: 'A next-generation HTTP client for Python' }, issue: { id: 3210, title: 'Add clearer timeout diagnostics to transport errors', labels: ['Enhancement', 'Help Wanted'], updated: '4 days ago', availability: 'No active assignee', issueUrl: 'https://github.com/encode/httpx/issues/3210' }, match: 86, why: ['Builds on your HTTP fundamentals', 'Clear scope with strong learning value', 'No heavyweight environment'], stack: ['Python', 'HTTP', 'AnyIO', 'pytest'], analysis: baseAnalysis({ 'Skill Match': 88, 'Machine Compatibility': 99, 'Repository Health': 90, 'Issue Availability': 91, 'Learning Value': 92 }, ['Async transports', 'Timeout semantics', 'Error design'], ['Python 3.9+', 'pytest', 'No GPU required', '~1 GB expected development footprint'], 'The main challenge is preserving backwards-compatible error messages across sync and async transports.') },
]
export const savedIds = new Set<number>([1])
