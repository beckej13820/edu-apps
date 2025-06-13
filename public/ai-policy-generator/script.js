document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('policyForm');
    const questions = document.querySelectorAll('.question-container');
    const summary = document.getElementById('summary');
    const progressBar = document.querySelector('.progress-bar');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const downloadRTF = document.getElementById('downloadRTF');
    const copyHTML = document.getElementById('copyHTML');

    let currentQuestion = 0;
    const totalQuestions = questions.length;

    // Policy templates
    const policyTemplates = {
        aiUsage: {
            prohibited: {
                icon: 'fa-ban',
                text: 'AI tools are not permitted for any course assignments or activities.'
            },
            limited: {
                icon: 'fa-hand-paper',
                text: 'AI tools may be used for specific assignments with explicit permission.'
            },
            encouraged: {
                icon: 'fa-lightbulb',
                text: 'AI tools are encouraged as learning aids and productivity tools.'
            }
        },
        citation: {
            required: {
                icon: 'fa-quote-right',
                text: 'All AI-generated content must be properly cited and documented.'
            },
            optional: {
                icon: 'fa-info-circle',
                text: 'Citation is recommended but not mandatory for AI-generated content.'
            }
        },
        documentation: {
            detailed: {
                icon: 'fa-file-alt',
                text: 'Students must document all AI tool usage, including prompts and outputs.'
            },
            basic: {
                icon: 'fa-clipboard-list',
                text: 'Simple acknowledgment of AI tool usage is sufficient.'
            }
        }
    };

    // Update progress bar
    function updateProgress() {
        const progress = ((currentQuestion + 1) / (totalQuestions + 1)) * 100;
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);
    }

    // Show/hide questions
    function showQuestion(index) {
        questions.forEach((q, i) => {
            q.classList.toggle('hidden', i !== index);
        });
        summary.classList.toggle('hidden', index !== totalQuestions);
        
        prevBtn.disabled = index === 0;
        nextBtn.textContent = index === totalQuestions - 1 ? 'Generate Policy' : 'Next';
        
        updateProgress();
    }

    // Navigation
    nextBtn.addEventListener('click', () => {
        if (currentQuestion < totalQuestions - 1) {
            const currentInputs = questions[currentQuestion].querySelectorAll('input[type="radio"]');
            const isAnswered = Array.from(currentInputs).some(input => input.checked);
            
            if (!isAnswered) {
                alert('Please select an option before proceeding.');
                return;
            }
            
            currentQuestion++;
            showQuestion(currentQuestion);
        } else {
            generatePolicy();
            currentQuestion++;
            showQuestion(currentQuestion);
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentQuestion > 0) {
            currentQuestion--;
            showQuestion(currentQuestion);
        }
    });

    // Generate policy statement
    function generatePolicy() {
        const aiUsage = document.querySelector('input[name="aiUsage"]:checked').value;
        const citation = document.querySelector('input[name="citation"]:checked').value;
        const documentation = document.querySelector('input[name="documentation"]:checked').value;

        const policyHTML = `
            <div class="policy-content">
                <h3>AI Policy Statement</h3>
                <div class="policy-section">
                    <i class="fas ${policyTemplates.aiUsage[aiUsage].icon}"></i>
                    <p>${policyTemplates.aiUsage[aiUsage].text}</p>
                </div>
                <div class="policy-section">
                    <i class="fas ${policyTemplates.citation[citation].icon}"></i>
                    <p>${policyTemplates.citation[citation].text}</p>
                </div>
                <div class="policy-section">
                    <i class="fas ${policyTemplates.documentation[documentation].icon}"></i>
                    <p>${policyTemplates.documentation[documentation].text}</p>
                </div>
            </div>
        `;

        document.getElementById('policyStatement').innerHTML = policyHTML;
    }

    // Download RTF
    downloadRTF.addEventListener('click', () => {
        const policyContent = document.getElementById('policyStatement').innerText;
        const rtfContent = `{\\rtf1\\ansi\\ansicpg1252\\cocoartf2639
{\\fonttbl\\f0\\fswiss\\fcharset0 Helvetica;}
{\\colortbl;\\red0\\green0\\blue0;}
\\paperw11900\\paperh16840\\margl1440\\margr1440\\vieww11520\\viewh8400\\viewkind0
\\pard\\tx566\\tx1133\\tx1700\\tx2267\\tx2834\\tx3401\\tx3968\\tx4535\\tx5102\\tx5669\\tx6236\\tx6803\\pardirnatural\\partightenfactor0

\\f0\\fs24 \\cf0 ${policyContent.replace(/\n/g, '\\par ')} }`;

        const blob = new Blob([rtfContent], { type: 'application/rtf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ai-policy-statement.rtf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });

    // Copy HTML
    copyHTML.addEventListener('click', () => {
        const policyHTML = document.getElementById('policyStatement').innerHTML;
        navigator.clipboard.writeText(policyHTML).then(() => {
            alert('Policy HTML copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            alert('Failed to copy to clipboard. Please try again.');
        });
    });

    // Initialize
    showQuestion(0);
}); 