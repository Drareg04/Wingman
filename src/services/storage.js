const STORAGE_KEYS = {
    USER: 'wingman_user',
    JOBS: 'wingman_jobs',
    CV: 'wingman_cv_data'
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
    getUser: () => {
        const data = localStorage.getItem(STORAGE_KEYS.USER);
        return data ? JSON.parse(data) : DEFAULT_USER;
    },
    saveUser: (user) => {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    },

    // JOBS
    getJobs: () => {
        const data = localStorage.getItem(STORAGE_KEYS.JOBS);
        if (!data) {
            localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(DEFAULT_JOBS));
            return DEFAULT_JOBS;
        }
        return JSON.parse(data);
    },
    addJob: (job) => {
        const jobs = storageService.getJobs();
        const newJob = { ...job, id: Date.now(), status: "Pendiente" };
        jobs.push(newJob);
        localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
        return newJob;
    },
    updateJobStatus: (id, status) => {
        const jobs = storageService.getJobs().map(j => j.id === id ? { ...j, status } : j);
        localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    },

    // CV (Structured)
    getCV: () => {
        const data = localStorage.getItem(STORAGE_KEYS.CV);
        return data ? JSON.parse(data) : DEFAULT_CV;
    },
    saveCV: (cvData) => {
        localStorage.setItem(STORAGE_KEYS.CV, JSON.stringify(cvData));
    },

    // Legacy CV helper (until we fully migrate)
    getCVString: () => {
        const cv = storageService.getCV();
        // Convert Structured Object to String for AI
        return `NOMBRE: ${cv.personalInfo.name}\nRESUMEN: ${cv.summary}\nEXPERIENCIA: ${JSON.stringify(cv.experience)}`;
    }
};
