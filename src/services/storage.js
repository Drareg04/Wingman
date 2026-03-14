// Auth is now mocked. We use a generic fallback if user is not provided explicitly.
const genericGuest = { uid: 'guest123' }

const STORAGE_KEYS = {
  USER: 'wingman_user',
  JOBS: 'wingman_jobs',
  CV: 'wingman_cv_data',
}

const getStorageKey = (baseKey, user = genericGuest) => {
  return user ? `${baseKey}_${user.uid}` : `${baseKey}_guest`
}

// --- MOCK DATA ---
const DEFAULT_JOBS = [
  { id: 1, title: 'Frontend Dev', company: 'TechCorp', status: 'Entrevista', description: 'React developer needed.' },
  { id: 2, title: 'UX Designer', company: 'Studio', status: 'Pendiente', description: 'Design cool interfaces.' },
]

const DEFAULT_USER = {
  name: 'Usuario Demo',
  email: 'demo@wingman.com',
}

const DEFAULT_CV = {
  personalInfo: { name: '', title: '', email: '', phone: '' },
  summary: '',
  experience: [],
  education: [],
}

const DEFAULT_CV_FROM_QUESTIONS = {
  personalInfo: {
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    links: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  languages: [],
}

const asArray = value => {
  if (!value) return []
  if (Array.isArray(value)) return value
  return [value]
}

const splitList = text => {
  if (!text) return []
  return text
    .split(/\n|,|;|\u2022|\-/g)
    .map(s => s.trim())
    .filter(Boolean)
}

const buildCVDataFromAnswers = (answers = {}) => {
  const experience = asArray(answers.experience)
    .map(e => ({
      role: e?.role || '',
      company: e?.company || '',
      years: e?.years || '',
      description: e?.description || '',
    }))
    .filter(e => e.role || e.company || e.description)

  const education = asArray(answers.education)
    .map(ed => {
      const schoolVal = ed?.school
      const schoolName = typeof schoolVal === 'string' ? schoolVal : schoolVal?.name || ''
      const schoolMeta = typeof schoolVal === 'object' && schoolVal
        ? {
            name: schoolVal?.name || '',
            addresses_road_name: schoolVal?.addresses_road_name || '',
            addresses_town: schoolVal?.addresses_town || '',
          }
        : null

      return {
        degree: ed?.degree || '',
        school: schoolName,
        schoolMeta,
        year: ed?.year || '',
        schoolLogo: null,
      }
    })
    .filter(ed => ed.degree || ed.school)

  return {
    ...DEFAULT_CV_FROM_QUESTIONS,
    personalInfo: {
      ...DEFAULT_CV_FROM_QUESTIONS.personalInfo,
      ...(answers.personalInfo || {}),
    },
    summary: answers.summary || '',
    experience,
    education,
    skills: splitList(answers.skills),
    languages: splitList(answers.languages),
  }
}

// --- SERVICE METHODS ---

export const storageService = {
  // USER
  getUser: (user = genericGuest) => {
    const key = getStorageKey(STORAGE_KEYS.USER, user)
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : DEFAULT_USER
  },
  saveUser: (userData, user = genericGuest) => {
    const key = getStorageKey(STORAGE_KEYS.USER, user)
    localStorage.setItem(key, JSON.stringify(userData))
  },

  // JOBS
  getJobs: (user = genericGuest) => {
    const key = getStorageKey(STORAGE_KEYS.JOBS, user)
    const data = localStorage.getItem(key)
    if (!data) {
      localStorage.setItem(key, JSON.stringify(DEFAULT_JOBS))
      return DEFAULT_JOBS
    }
    return JSON.parse(data)
  },
  addJob: (job, user = genericGuest) => {
    const jobs = storageService.getJobs(user)
    const newJob = { ...job, id: Date.now(), status: 'Pendiente' }
    jobs.push(newJob)
    const key = getStorageKey(STORAGE_KEYS.JOBS, user)
    localStorage.setItem(key, JSON.stringify(jobs))
    return newJob
  },
  updateJobStatus: (id, status, user = genericGuest) => {
    const jobs = storageService.getJobs(user).map(j => (j.id === id ? { ...j, status } : j))
    const key = getStorageKey(STORAGE_KEYS.JOBS, user)
    localStorage.setItem(key, JSON.stringify(jobs))
  },

  // CV (Structured & Multi-CV)
  getCVs: (user = genericGuest) => {
    const key = getStorageKey(STORAGE_KEYS.CV, user)
    const data = localStorage.getItem(key)
    if (!data) return []
    // Migration: If it's an object (legacy), wrap it in array
    try {
      const parsed = JSON.parse(data)
      if (!Array.isArray(parsed)) {
        return [{ id: 'default', name: 'Mi Primer CV', lastModified: Date.now(), data: parsed }]
      }
      return parsed
    } catch (e) {
      return []
    }
  },

  getCVById: (id, user = genericGuest) => {
    const cvs = storageService.getCVs(user)
    return cvs.find(cv => cv.id === id) || null
  },

  saveCV: (id, cvData, name = 'Sin título', user = genericGuest) => {
    const cvs = storageService.getCVs(user)
    const existingIndex = cvs.findIndex(cv => cv.id === id)

    const newCV = {
      id: id || Date.now().toString(),
      name: name,
      lastModified: Date.now(),
      data: cvData,
    }

    if (existingIndex >= 0) {
      cvs[existingIndex] = { ...cvs[existingIndex], ...newCV }
    } else {
      cvs.push(newCV)
    }

    const key = getStorageKey(STORAGE_KEYS.CV, user)
    localStorage.setItem(key, JSON.stringify(cvs))
    return newCV.id
  },

  deleteCV: (id, user = genericGuest) => {
    const cvs = storageService.getCVs(user).filter(cv => cv.id !== id)
    const key = getStorageKey(STORAGE_KEYS.CV, user)
    localStorage.setItem(key, JSON.stringify(cvs))
  },

  // Create a new blank CV
  createCV: (name, user = genericGuest) => {
    return storageService.saveCV(Date.now().toString(), DEFAULT_CV, name, user)
  },

  // Create a new CV starting from the guided questions flow
  createCVFromQuestions: (name, answers, user = genericGuest) => {
    const data = buildCVDataFromAnswers(answers)
    return storageService.saveCV(Date.now().toString(), data, name, user)
  },

  // Lightweight autosave helper (same data model as saveCV)
  autosaveCV: (id, cvData, name = 'Sin título', user = genericGuest) => {
    return storageService.saveCV(id, cvData, name, user)
  },

  // Legacy CV helper (returns the first one or default)
  getCVString: (user = genericGuest) => {
    const cvs = storageService.getCVs(user)
    const cv = cvs.length > 0 ? cvs[0].data : DEFAULT_CV
    // Convert Structured Object to String for AI
    return `NOMBRE: ${cv.personalInfo.name}\nRESUMEN: ${cv.summary}\nEXPERIENCIA: ${JSON.stringify(cv.experience)}`
  },
}
