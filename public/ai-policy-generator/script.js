document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('policyForm');
    const questions = document.querySelectorAll('.question-container');
    const summary = document.getElementById('summary');
    const progressBar = document.querySelector('.progress-bar');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const startOverBtn = document.getElementById('startOverBtn');
    const downloadRTF = document.getElementById('downloadRTF');
    const copyHTML = document.getElementById('copyHTML');
    const citationFormatContainer = document.getElementById('citationFormatContainer');
    const citationFormat = document.getElementById('citationFormat');
    const otherCitationFormat = document.getElementById('otherCitationFormat');
    const customCitationFormat = document.getElementById('customCitationFormat');

    let currentQuestion = 0;
    const totalQuestions = questions.length;
    let questionHistory = [0]; // Track question navigation history

    // Handle citation format selection
    function handleCitationFormat() {
        const selectedCitation = document.querySelector('input[name="citation"]:checked');
        if (selectedCitation && selectedCitation.value === 'formal') {
            citationFormatContainer.classList.remove('hidden');
            if (citationFormat.value === 'other') {
                otherCitationFormat.classList.remove('hidden');
            } else {
                otherCitationFormat.classList.add('hidden');
            }
        } else {
            citationFormatContainer.classList.add('hidden');
            otherCitationFormat.classList.add('hidden');
        }
    }

    // Add citation format change handler
    citationFormat.addEventListener('change', () => {
        if (citationFormat.value === 'other') {
            otherCitationFormat.classList.remove('hidden');
            customCitationFormat.focus(); // Focus the input when shown
        } else {
            otherCitationFormat.classList.add('hidden');
            customCitationFormat.value = ''; // Clear the custom input when hidden
        }
    });

    // Add citation radio button change handler
    document.querySelectorAll('input[name="citation"]').forEach(radio => {
        radio.addEventListener('change', handleCitationFormat);
    });

    // Handle custom citation format input
    customCitationFormat.addEventListener('input', () => {
        // Enable/disable the next button based on whether there's text in the custom format
        if (citationFormat.value === 'other') {
            nextBtn.disabled = !customCitationFormat.value.trim();
        }
    });

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
            simple: {
                icon: 'fa-check-circle',
                text: 'Students must include a simple statement acknowledging their use of AI tools.'
            },
            formal: {
                icon: 'fa-file-signature',
                text: 'Students must both acknowledge AI use and provide formal citations for AI-generated content.'
            },
            none: {
                icon: 'fa-times-circle',
                text: 'Students are not required to acknowledge or cite their use of AI tools.'
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

    // Reset form to initial state
    function resetForm() {
        // Clear all radio button selections
        document.querySelectorAll('input[type="radio"]').forEach(input => {
            input.checked = false;
        });
        
        // Reset citation format
        citationFormat.value = '';
        customCitationFormat.value = '';
        citationFormatContainer.classList.add('hidden');
        otherCitationFormat.classList.add('hidden');
        
        // Reset question history and current question
        currentQuestion = 0;
        questionHistory = [0];
        
        // Show first question
        showQuestion(0);
        
        // Clear policy statement
        document.getElementById('policyStatement').innerHTML = '';
    }

    // Add start over button handler
    startOverBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to start over? All your selections will be cleared.')) {
            resetForm();
        }
    });

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

    // Handle AI usage selection
    function handleAIUsageSelection() {
        const aiUsage = document.querySelector('input[name="aiUsage"]:checked').value;
        if (aiUsage === 'prohibited') {
            // Skip to summary if AI is prohibited
            currentQuestion = totalQuestions;
            questionHistory.push(currentQuestion);
            showQuestion(currentQuestion);
            generatePolicy();
            return true; // Indicate that we've skipped to the end
        }
        return false; // Indicate normal flow should continue
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

            // If this is the AI usage question, check the selection
            if (currentQuestion === 0) {
                const skipped = handleAIUsageSelection();
                if (skipped) return; // If we skipped to the end, don't continue
            }
            
            currentQuestion++;
            questionHistory.push(currentQuestion);
            showQuestion(currentQuestion);
        } else {
            generatePolicy();
            currentQuestion++;
            questionHistory.push(currentQuestion);
            showQuestion(currentQuestion);
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentQuestion > 0) {
            questionHistory.pop(); // Remove current question
            currentQuestion = questionHistory[questionHistory.length - 1]; // Get previous question
            showQuestion(currentQuestion);
        }
    });

    // Get citation format text
    function getCitationFormatText() {
        if (citationFormat.value === 'other') {
            return customCitationFormat.value || 'custom format';
        }
        return citationFormat.options[citationFormat.selectedIndex].text;
    }

    // Generate policy statement
    function generatePolicy() {
        const aiUsage = document.querySelector('input[name="aiUsage"]:checked').value;
        let policyHTML = `
            <div class="policy-content">
                <h3>AI Policy Statement</h3>
                <div class="policy-section">
                    <i class="fas ${policyTemplates.aiUsage[aiUsage].icon}"></i>
                    <p>${policyTemplates.aiUsage[aiUsage].text}</p>
                </div>`;

        if (aiUsage !== 'prohibited') {
            const citation = document.querySelector('input[name="citation"]:checked').value;
            const documentation = document.querySelector('input[name="documentation"]:checked').value;

            policyHTML += `
                <div class="policy-section">
                    <i class="fas ${policyTemplates.citation[citation].icon}"></i>
                    <p>${policyTemplates.citation[citation].text}`;

            if (citation !== 'none' && citationFormat.value) {
                policyHTML += ` Citations should follow the ${getCitationFormatText()}.`;
            }

            policyHTML += `</p>
                </div>
                <div class="policy-section">
                    <i class="fas ${policyTemplates.documentation[documentation].icon}"></i>
                    <p>${policyTemplates.documentation[documentation].text}</p>
                </div>`;
        }

        policyHTML += `</div>`;
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