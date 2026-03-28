/**
 * Candidate Resume Data
 * Single source of truth for Pavan's resume content.
 * Used by the AI resume tailoring engine and PDF generator.
 */
module.exports = {
    name: 'VEERAVENI PAVAN KUMAR',
    email: 'pavanveeraveni89@gmail.com',
    mobile: '+917337458289',
    linkedin: 'linkedin.com/in/pavan-kumar-502a332ab',
    github: 'github.com/pavan2002-veeraveni',

    summary: 'AI/ML Developer with hands-on experience in building intelligent healthcare automation systems during a 3-month internship at Resonix Technologies. Skilled in Python, machine learning, computer vision, and backend API development using FastAPI. Developed real-world solutions including prescription analysis using OCR and NLP, and an automated medical calling agent for patient communication. Strong foundation in data processing, model integration, and scalable backend systems with MySQL and REST APIs. Eager to contribute to AI-driven product development and backend engineering in innovative technology teams.',

    education: {
        college: 'Malla Reddy College of Engineering and Technology',
        years: '2021-2025',
        degree: 'Bachelor of Technology in Computer Science and Engineering in Data science',
        cgpa: '7.1/10',
    },

    skills: {
        languages: 'Python, C, SQL',
        backend: 'FastAPI, Flask, Django, Rest API Development',
        web: 'HTML5, CSS3, JavaScript, Bootstrap, React.js',
        ai_data: 'OpenCV, NumPy, Pandas, CNN, OCR (TESSERACT), NLP (SpaCy)',
        database: 'MySQL',
        tools: 'VS Code, GitHub, Git',
        testing: 'Unit Testing, API Testing, Postman',
        core: 'Data Structures, Algorithms, OOP, SDLC, DBMS, Operating Systems',
    },

    experience: [
        {
            title: 'AI/ML Development Intern',
            company: 'Resonix Technologies',
            date: 'Dec 2025 - Mar 2026',
            bullets: [
                'Developed AI-based healthcare automation solutions including prescription analysis using OCR and NLP.',
                'Built a medical calling agent to automate patient communication and for reminding medication.',
                'Designed REST APIs using FastAPI to integrate AI models with backend services.',
                'Collaborated with engineering teams to debug and optimize backend systems.',
            ]
        }
    ],

    projects: [
        {
            title: 'Prescription Analysis system',
            technologies: 'Python, OpenCV, Tesseract OCR, spaCy, FastAPI',
            date: 'Recent',
            bullets: [
                'Developed an OCR pipeline to extract text from medical prescriptions.',
                'Implemented NLP techniques to identify medicine names and dosage.',
                'Built REST APIs for real-time prescription processing.',
                'Stored extracted data in MySQL database.'
            ],
        },
        {
            title: 'Medical calling Agent',
            technologies: 'Twilio API, Speech Recognition, FastAPI',
            date: 'Recent',
            bullets: [
                'Developed an automated voice calling system for patient appointment reminders.',
                'Implemented speech recognition for patient interaction.',
                'Built backend APIs to manage call scheduling and patient data.',
                'Improved clinic communication by automating patient follow-ups.'
            ],
        },
        {
            title: 'Colorization of Grayscale Medical Images for Better Diagnosis using Deep Learning',
            technologies: 'Python, CNN, OpenCV, NumPy',
            date: 'Apr 2025',
            bullets: [
                'Designed and implemented a modular deep-learning application pipeline following SDLC practices.',
                'Built backend processing modules for image preprocessing, feature extraction, inference, and evaluation.',
                'Improved diagnostic image clarity by ~25% using CNN models and LAB colour-space mapping.',
                'Optimized application performance and validated results using SSIM, PSNR, and MSE metrics.',
                'Documented system architecture and scalability considerations for future enhancements.',
            ],
        },
        {
            title: 'Smart Attendance System using Face Recognition (Python, Open CV)',
            technologies: 'Python, OpenCV, MySQL',
            date: 'Nov 2024',
            bullets: [
                'Developed a backend-driven attendance management system using Python and OpenCV.',
                'Designed scalable system components for recognition, logging, and database integration.',
                'Integrated MySQL database for structured storage and retrieval of attendance data.',
                'Implemented Object-Oriented Programming principles for maintainable and reusable code.',
                'Improved system efficiency by reducing manual processes by 80% through automation.',
            ],
        },
    ],

    certifications: [
        'Council for Skills and Competencies on Employability Skills-Wadhwani Foundation.',
        'Python mapping and ML Overview by IBM.',
        'Participated in WEB-O-THON conducted by 10000 coders.',
    ],

    softSkills: 'Problem-solving | Analytical thinking | Logical reasoning | Agile collaboration | Communication | Time Estimation | Adaptability | Teamwork',
};
