// Auth is now mocked. We use a generic fallback if user is not provided explicitly.
const genericGuest = { uid: 'guest123' };

const STORAGE_KEYS = {
    USER: 'wingman_user',
    JOBS: 'wingman_jobs',
    CV: 'wingman_cv_data'
};

const getStorageKey = (baseKey, user = genericGuest) => {
    return user ? `${baseKey}_${user.uid}` : `${baseKey}_guest`;
};

// --- MOCK DATA ---
const DEFAULT_JOBS = [
    { id: 1, title: "Frontend Dev", company: "TechCorp", status: "Entrevista", description: "React developer needed." },
    { id: 2, title: "UX Designer", company: "Studio", status: "Pendiente", description: "Design cool interfaces." },
];

const DEFAULT_USER = {
    name: "Usuario Demo",
    email: "demo@wingman.com"
};

const DEFAULT_CV = {
    personalInfo: { name: "", title: "", email: "", phone: "" },
    summary: "",
    experience: [],
    education: []
};

// --- SERVICE METHODS ---

export const storageService = {
    // USER
    getUser: (user = genericGuest) => {
        const key = getStorageKey(STORAGE_KEYS.USER, user);
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : DEFAULT_USER;
    },
    saveUser: (userData, user = genericGuest) => {
        const key = getStorageKey(STORAGE_KEYS.USER, user);
        localStorage.setItem(key, JSON.stringify(userData));
    },

    // JOBS
    getJobs: (user = genericGuest) => {
        const key = getStorageKey(STORAGE_KEYS.JOBS, user);
        const data = localStorage.getItem(key);
        if (!data) {
            localStorage.setItem(key, JSON.stringify(DEFAULT_JOBS));
            return DEFAULT_JOBS;
        }
        return JSON.parse(data);
    },
    addJob: (job, user = genericGuest) => {
        const jobs = storageService.getJobs(user);
        const newJob = { ...job, id: Date.now(), status: "Pendiente" };
        jobs.push(newJob);
        const key = getStorageKey(STORAGE_KEYS.JOBS, user);
        localStorage.setItem(key, JSON.stringify(jobs));
        return newJob;
    },
    updateJobStatus: (id, status, user = genericGuest) => {
        const jobs = storageService.getJobs(user).map(j => j.id === id ? { ...j, status } : j);
        const key = getStorageKey(STORAGE_KEYS.JOBS, user);
        localStorage.setItem(key, JSON.stringify(jobs));
    },

    // CV (Structured & Multi-CV)
    getCVs: (user = genericGuest) => {
        const key = getStorageKey(STORAGE_KEYS.CV, user);
        const data = localStorage.getItem(key);
        if (!data) return [];
        // Migration: If it's an object (legacy), wrap it in array
        try {
            const parsed = JSON.parse(data);
            if (!Array.isArray(parsed)) {
                return [{ id: 'default', name: 'Mi Primer CV', lastModified: Date.now(), data: parsed }];
            }
            return parsed;
        } catch (e) {
            return [];
        }
    },

    getCVById: (id, user = genericGuest) => {
        const cvs = storageService.getCVs(user);
        return cvs.find(cv => cv.id === id) || null;
    },

    saveCV: (id, cvData, name = "Sin título", user = genericGuest) => {
        const cvs = storageService.getCVs(user);
        const existingIndex = cvs.findIndex(cv => cv.id === id);

        const newCV = {
            id: id || Date.now().toString(),
            name: name,
            lastModified: Date.now(),
            data: cvData
        };

        if (existingIndex >= 0) {
            cvs[existingIndex] = { ...cvs[existingIndex], ...newCV };
        } else {
            cvs.push(newCV);
        }

        const key = getStorageKey(STORAGE_KEYS.CV, user);
        localStorage.setItem(key, JSON.stringify(cvs));
        return newCV.id;
    },

    deleteCV: (id, user = genericGuest) => {
        const cvs = storageService.getCVs(user).filter(cv => cv.id !== id);
        const key = getStorageKey(STORAGE_KEYS.CV, user);
        localStorage.setItem(key, JSON.stringify(cvs));
    },

    // Create a new blank CV
    createCV: (name, user = genericGuest) => {
        return storageService.saveCV(Date.now().toString(), DEFAULT_CV, name, user);
    },

    // Legacy CV helper (returns the first one or default)
    getCVString: (user = genericGuest) => {
        const cvs = storageService.getCVs(user);
        const cv = cvs.length > 0 ? cvs[0].data : DEFAULT_CV;
        // Convert Structured Object to String for AI
        return `NOMBRE: ${cv.personalInfo.name}\nRESUMEN: ${cv.summary}\nEXPERIENCIA: ${JSON.stringify(cv.experience)}`;
    }
};
